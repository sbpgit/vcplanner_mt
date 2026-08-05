"use strict";

const cds            = require("@sap/cds");
const { v4: uuidv4 } = require("uuid");
const { DAGEngine }  = require("./dagEngine");


let _rules      = null;
let _conditions = null;
let _charDefs   = null;
let _dagEngine  = null;

async function loadMasterData(db) {

  try {
    console.log("[DAG] Syncing T_* → CAP tables");

    // ─────────────────────────────────────────────
    // STEP 0: Sync T_* → CAP tables
    // ─────────────────────────────────────────────

    await db.run(`DELETE FROM dag_CharDefinitions`);
    await db.run(`DELETE FROM dag_CharValues`);
    await db.run(`DELETE FROM dag_DerivationRules`);
    await db.run(`DELETE FROM dag_RuleConditions`);

    await db.run(`
      INSERT INTO dag_CharDefinitions (charKey, charLabel, charType, deriveLevel)
      SELECT CHAR_KEY, CHAR_LABEL, CHAR_TYPE, DERIVE_LEVEL
      FROM T_CHAR_DEFINITIONS
    `);

    await db.run(`
      INSERT INTO dag_CharValues (charKey, valueCode, valueLabel)
      SELECT CHAR_KEY, VALUE_CODE, VALUE_LABEL
      FROM T_CHAR_VALUES
    `);

    await db.run(`
      INSERT INTO dag_DerivationRules (ruleId, targetChar, derivedValue, ruleDescription, active)
      SELECT RULE_ID, TARGET_CHAR, DERIVED_VALUE, RULE_DESCRIPTION, ACTIVE
      FROM T_DERIVATION_RULES
    `);

    await db.run(`
      INSERT INTO dag_RuleConditions (conditionId, ruleId, condChar, condValue, condWeight)
      SELECT CONDITION_ID, RULE_ID, COND_CHAR, COND_VALUE, COND_WEIGHT
      FROM T_RULE_CONDITIONS
    `);

    const t1 = await db.run(`SELECT COUNT(*) as CNT FROM T_CHAR_DEFINITIONS`);
    const t2 = await db.run(`SELECT COUNT(*) as CNT FROM T_RULE_CONDITIONS`);
    const c1 = await db.run(`SELECT COUNT(*) as CNT FROM dag_CharDefinitions`);
    const c2 = await db.run(`SELECT COUNT(*) as CNT FROM dag_RuleConditions`);

    console.log("T_CHAR_DEFINITIONS:", t1);
    console.log("T_RULE_CONDITIONS:", t2);
    console.log("dag_CharDefinitions:", c1);
    console.log("dag_RuleConditions:", c2);

    console.log("[DAG] Sync completed");

    // ─────────────────────────────────────────────
    // STEP 1: Load from CAP tables (as before)
    // ─────────────────────────────────────────────

    const [rules, conditions, charDefs] = await Promise.all([
      db.run(SELECT.from("dag.DerivationRules").where({ active: 1 })),
      db.run(SELECT.from("dag.RuleConditions")),
      db.run(SELECT.from("dag.CharDefinitions"))
    ]);

    _rules = rules.map(r => ({
      ruleId      : r.ruleId,
      targetChar  : r.targetChar,
      derivedValue: r.derivedValue
    }));

    _conditions = conditions.map(c => ({
      ruleId    : c.ruleId,
      condChar  : c.condChar,
      condValue : c.condValue,
      condWeight: parseFloat(c.condWeight ?? 1.0)
    }));

    _charDefs = charDefs.map(d => ({
      charKey  : d.charKey,
      charLabel: d.charLabel,
      charType : d.charType,
      level    : d.deriveLevel ?? 0
    }));

    _dagEngine = new DAGEngine(_rules, _conditions, _charDefs);

    console.log(
      `[DAG] loaded: ${_rules.length} rules, ` +
      `${_conditions.length} conditions, ` +
      `${_charDefs.length} char definitions`
    );

  } catch (err) {
    console.error("[DAG] ❌ loadMasterData failed:", err.message);
    throw err;
  }
}

module.exports = cds.service.impl(async function () {

  const db = await cds.connect.to("db");

  this.on("served", async () => {
    try { await loadMasterData(db); }
    catch (e) { console.warn("[DAG] Master data load deferred:", e.message); }
  });

  // ── createSession ──────────────────────────────────────────────────────
  this.on("createSession", async (req) => {
    const { productId, regionId, planMode } = req.data;
    if (!productId || !regionId) return req.error(400, "productId and regionId are required");
    const sessionId = uuidv4();
    await db.run(
      INSERT.into("dag.Sessions").entries({
        sessionId,
        userId   : req.user?.id || "anonymous",
        productId,
        regionId,
        planMode : planMode || "DETERMINISTIC",
        createdAt: new Date(),
        status   : "ACTIVE"
      })
    );
    return { sessionId, status: "CREATED" };
  });

  // ── setSessionInputs ───────────────────────────────────────────────────
  this.on("setSessionInputs", async (req) => {
    const { sessionId, inputs } = req.data;
    if (!sessionId) return req.error(400, "sessionId is required");
    await db.run(DELETE.from("dag.SessionInputs").where({ sessionId }));
    if (!inputs || inputs.length === 0) return { status: "OK", message: "Inputs cleared" };
    const rows = inputs.map(i => ({
      sessionId,
      charKey    : i.charKey,
      valueCode  : i.valueCode,
      probability: parseFloat(i.probability ?? 1.0)
    }));
    await db.run(INSERT.into("dag.SessionInputs").entries(rows));
    return { status: "OK", message: `${rows.length} inputs saved` };
  });

// ── runDerivation ──────────────────────────────────────────────────────
// Exclude Normalization - 
/**
 * ACTION: runDerivation
 * ---------------------
 * This is the core engine for Probabilistic Configuration Derivation.
 * 
 * Logic Flow:
 * 1. INITIALIZATION: Fetches session context and product-specific "Allowed Values" JSON.
 * 2. SEEDING: Loads user inputs into a temporary 'Buffer'.
 * 3. HIERARCHICAL LOOP: Processes levels 1 through N as defined in T_DERIVATION_PATHS.
 *    - STEP A (Filtering): Drops targets not found in the Product JSON config.
 *    - STEP B (Leaf Rule): Extracts the specific Rule ID at the current path depth.
 *    - STEP C (Weighted Math): Calculates P(Rule) = Product of (P(Condition) * Weight).
 *    - STEP D (Deduplication): Picks only the strongest rule if multiple rules yield the same value.
 * 4. GAP ANALYSIS: Compares total derived probability against 1.0 to find "Unresolved" gaps.
 * 5. PERSISTENCE: Records every result with a full audit trail (Rule ID, Level, Status).
 */
/**
 * ACTION: runDerivation (Runtime Trace Version)
 */
/**
 * ACTION: runDerivation
 * ---------------------
 * A high-performance, auditable engine for multi-level probabilistic configuration.
 * 
 * FIX LOG:
 * 1. PROBABILITY FIX: Changed 'winner.probability' to 'winner[0].probability' (winner is an array).
 * 2. RULECHAIN FIX: Changed 'winner.ruleId' to 'winner[0].ruleId'.
 * 3. TIMESTAMP FIX: Ensured 'toISOString()' is used for HANA LONGDATE compatibility.
 * 4. WEIGHT FIX: Corrected column mapping to 'COND_WEIGHT'.
 */
/**
 * ACTION: runDerivation
 * ---------------------
 * High-performance probabilistic engine with full audit tracing.
 */

// Latest Version ***WITH *** SALES Data --> DAG_PRODUCT_CONFIG.INF_COND_WEIGHTS


this.on("runDerivation", async (req) => {
    const { sessionId } = req.data;
    if (!sessionId) return req.error(400, "SESSION_ID_MISSING");

    const tx = cds.transaction(req);

    try {
        /* =====================================================================
           STAGE 1: INITIALIZATION & WHITELIST & WEIGHTS
           ===================================================================== */
        const session = await tx.run(SELECT.one.from("DAG_SESSIONS").where({ SESSIONID: sessionId }));
        if (!session) return req.error(404, `SESSION_NOT_FOUND: ${sessionId}`);

        const configRow = await tx.run(SELECT.one.from("DAG_PRODUCT_CONFIG").where({ PRODUCT: session.PRODUCTID }));
        
        // Normalize config to handle array vs object structures
        const rawJson = JSON.parse(configRow?.INF_COND_CHAR_VALUES || "{}");
        const allowedConfig = (Array.isArray(rawJson) && rawJson.length > 0) ? rawJson[0] : (typeof rawJson === 'object' ? rawJson : {}); 
        const masterWhitelist = Object.keys(allowedConfig);

        // Fetch Product-Specific Weights from DAG_PRODUCT_CONFIG
        const productWeights = JSON.parse(configRow?.INF_COND_WEIGHTS || "{}");

        console.log("masterWhitelist", masterWhitelist);
        console.log(`[INIT] Loaded dynamic weights for ${session.PRODUCTID}`);

        /* =====================================================================
           STAGE 2: BUFFER SEEDING (THE WORLD STATE)
           ===================================================================== */
        const rawInputs = await tx.run(SELECT.from("DAG_SESSIONINPUTS").where({ SESSIONID: sessionId }));
        let buffer = rawInputs.map(i => ({ 
            charKey: i.CHARKEY, valueCode: i.VALUECODE, probability: parseFloat(i.PROBABILITY) 
        }));

        // Root Seeds (100% Probability)
        buffer.push({ charKey: 'REGION', valueCode: session.REGIONID || 'ALL', probability: 1.0 });
        buffer.push({ charKey: 'PRODUCT', valueCode: session.PRODUCTID, probability: 1.0 });

        await tx.run(DELETE.from("DAG_DERIVATIONRESULTS").where({ SESSIONID: sessionId }));

        /* =====================================================================
           STAGE 3: HIERARCHICAL ENGINE (WATERFALL)
           ===================================================================== */
        const levels = await tx.run(`SELECT DISTINCT PATH_LENGTH FROM T_DERIVATION_PATHS ORDER BY PATH_LENGTH ASC`);
        
        let allResultsToInsert = []; 
        let resultIdCounter = Date.now(); 

        for (const levelRow of levels) {
            const currentLevel = levelRow.PATH_LENGTH;
            console.log(`\n[LEVEL ${currentLevel}] Evaluation Started`);

            const paths = await tx.run(SELECT.from("T_DERIVATION_PATHS").where({ PATH_LENGTH: currentLevel }));
            let firedRulesForLevel = [];

            for (const path of paths) {
                // 3.1 Whitelist Verification
                if (!masterWhitelist.includes(path.TARGET_CHAR)) continue;
                const allowedValues = allowedConfig[path.TARGET_CHAR] || [];
                if (!allowedValues.includes(path.TARGET_VALUE)) continue;

                // 3.2 Extract Leaf Rule
                const chain = JSON.parse(path.RULE_CHAIN || "[]");
                const ruleId = chain[chain.length - 1];

                // 3.3 Fetch Conditions (EXCLUDING the target char to prevent circular blocks)
                const conditions = await tx.run(
                    SELECT.from("T_RULE_CONDITIONS")
                        .where({ RULE_ID: ruleId })
                        .and(`COND_CHAR != '${path.TARGET_CHAR}'`)
                );

                // RUNTIME WEIGHT: Use weights from Product Config, fallback to 1.0
                const dynamicWeight = productWeights[ruleId] !== undefined ? parseFloat(productWeights[ruleId]) : 1.0;

                let ruleProb = 1.0;
                let allMet = (conditions.length > 0);
                let trace = [];

                for (const cond of conditions) {
                    const match = buffer.find(b => b.charKey === cond.COND_CHAR && b.valueCode === cond.COND_VALUE);
                    if (match && match.probability > 0) {
                        // Apply the dynamic weight derived from Sales Data
                        ruleProb *= (match.probability * dynamicWeight);
                        trace.push(`${cond.COND_CHAR}:${cond.COND_VALUE}(P:${match.probability}*DW:${dynamicWeight})`);
                    } else {
                        allMet = false;
                        if (ruleId === 'VCR36' || ruleId === 'VCR35') {
                            console.log(`   [SKIP] ${ruleId} Missing: ${cond.COND_CHAR}=${cond.COND_VALUE}`);
                            console.log(`   [BUFFER_SNAPSHOT]`, JSON.stringify(buffer));
                        }
                        break;
                    }
                }

                if (allMet) {
                    console.log(`   [FIRE] ${ruleId} -> ${path.TARGET_CHAR}:${path.TARGET_VALUE} | Calc: ${trace.join(' * ')} = ${ruleProb.toFixed(4)}`);
                    firedRulesForLevel.push({ 
                        charKey: path.TARGET_CHAR, valueCode: path.TARGET_VALUE, 
                        probability: ruleProb, ruleId: ruleId 
                    });
                }
            }

            /* =====================================================================
               STAGE 4: AGGREGATION & IMMEDIATE SYNC
               ===================================================================== */
            const targetedCharsInLevel = [...new Set(firedRulesForLevel.map(f => f.charKey))];

            for (const char of targetedCharsInLevel) {
                const resultsForChar = firedRulesForLevel.filter(f => f.charKey === char);
                const uniqueVals = [...new Set(resultsForChar.map(f => f.valueCode))];
                let resolvedSum = 0;

                for (const val of uniqueVals) {
                    // WINNER-TAKES-ALL: Prevent probability > 1.0
                    const winners = resultsForChar.filter(f => f.valueCode === val).sort((a, b) => b.probability - a.probability);
                    const winner = winners[0];
                    
                    resolvedSum += winner.probability;

                    const entry = {
                        RESULTID: ++resultIdCounter, SESSIONID: sessionId, CHARKEY: char, VALUECODE: val,
                        PROBABILITY: parseFloat(winner.probability.toFixed(4)), DERIVELEVEL: currentLevel,
                        RULECHAIN: `["${winner.ruleId}"]`, STATUS: 'RESOLVED', COMPUTEDAT: new Date().toISOString()
                    };
                    allResultsToInsert.push(entry);

                    // SYNC BUFFER IMMEDIATELY: Next levels need these results
                    buffer.push({ charKey: char, valueCode: val, probability: winner.probability });
                }

                // Log Gaps (Floating point safety)
                const gap = 1.0 - Math.min(1.0, resolvedSum);
                if (gap > 0.0001) {
                    allResultsToInsert.push({
                        RESULTID: ++resultIdCounter, SESSIONID: sessionId, CHARKEY: char, VALUECODE: 'UNRESOLVED',
                        PROBABILITY: parseFloat(gap.toFixed(4)), DERIVELEVEL: currentLevel,
                        RULECHAIN: `GAP_LVL_${currentLevel}`, STATUS: 'UNRESOLVED', COMPUTEDAT: new Date().toISOString()
                    });
                    buffer.push({ charKey: char, valueCode: 'UNRESOLVED', probability: gap });
                }
            }
        }

        /* =====================================================================
           STAGE 5: FINAL COMMIT
           ===================================================================== */
        if (allResultsToInsert.length > 0) {
            console.log(`\n[DB] Finalizing ${allResultsToInsert.length} records.`);
            await tx.run(INSERT.into("DAG_DERIVATIONRESULTS").entries(allResultsToInsert));
        }

        await tx.run(UPDATE("DAG_SESSIONS").set({ STATUS: 'COMPUTED' }).where({ SESSIONID: sessionId }));
        return { status: "SUCCESS", recordsComputed: allResultsToInsert.length };

    } catch (error) {
        console.error("[FATAL ENGINE ERROR]", error);
        return req.error(500, error.message);
    }
});

// Latest GIT Version without SALES Data --> DAG_PRODUCT_CONFIG.INF_COND_WEIGHTS
// this.on("runDerivation", async (req) => {
//     const { sessionId } = req.data;
//     if (!sessionId) return req.error(400, "SESSION_ID_MISSING");

//     const tx = cds.transaction(req);

//     try {
//         /* =====================================================================
//            STAGE 1: INITIALIZATION & WHITELIST
//            ===================================================================== */
//         const session = await tx.run(SELECT.one.from("DAG_SESSIONS").where({ SESSIONID: sessionId }));
//         if (!session) return req.error(404, `SESSION_NOT_FOUND: ${sessionId}`);

//         const configRow = await tx.run(SELECT.one.from("DAG_PRODUCT_CONFIG").where({ PRODUCT: session.PRODUCTID }));
//         const rawJson = JSON.parse(configRow?.INF_COND_CHAR_VALUES || "{}");
//         // Normalize config to handle array vs object structures
//         const allowedConfig = (Array.isArray(rawJson) && rawJson.length > 0) ? rawJson[0] : (typeof rawJson === 'object' ? rawJson : {}); 
//         const masterWhitelist = Object.keys(allowedConfig);

//         console.log("masterWhitelist", masterWhitelist);

//         /* =====================================================================
//            STAGE 2: BUFFER SEEDING (THE WORLD STATE)
//            ===================================================================== */
//         const rawInputs = await tx.run(SELECT.from("DAG_SESSIONINPUTS").where({ SESSIONID: sessionId }));
//         let buffer = rawInputs.map(i => ({ 
//             charKey: i.CHARKEY, valueCode: i.VALUECODE, probability: parseFloat(i.PROBABILITY) 
//         }));

//         // Root Seeds (100% Probability)
//         buffer.push({ charKey: 'REGION', valueCode: session.REGIONID || 'ALL', probability: 1.0 });
//         buffer.push({ charKey: 'PRODUCT', valueCode: session.PRODUCTID, probability: 1.0 });

//         await tx.run(DELETE.from("DAG_DERIVATIONRESULTS").where({ SESSIONID: sessionId }));

//         /* =====================================================================
//            STAGE 3: HIERARCHICAL ENGINE (WATERFALL)
//            ===================================================================== */
//         // FIXED: Using Raw SQL to bypass "Distinct" reserved word errors
//         const levels = await tx.run(`SELECT DISTINCT PATH_LENGTH FROM T_DERIVATION_PATHS ORDER BY PATH_LENGTH ASC`);
        
//         let allResultsToInsert = []; 
//         let resultIdCounter = Date.now(); 

//         for (const levelRow of levels) {
//             const currentLevel = levelRow.PATH_LENGTH;
//             console.log(`\n[LEVEL ${currentLevel}] Evaluation Started`);

//             const paths = await tx.run(SELECT.from("T_DERIVATION_PATHS").where({ PATH_LENGTH: currentLevel }));
//             let firedRulesForLevel = [];

//             for (const path of paths) {
//                 // 3.1 Whitelist Verification
//                 if (!masterWhitelist.includes(path.TARGET_CHAR)) continue;
//                 const allowedValues = allowedConfig[path.TARGET_CHAR] || [];
//                 if (!allowedValues.includes(path.TARGET_VALUE)) continue;

//                 // 3.2 Extract Leaf Rule
//                 const chain = JSON.parse(path.RULE_CHAIN || "[]");
//                 const ruleId = chain[chain.length - 1];

//                 // 3.3 Fetch Conditions (EXCLUDING the target char to prevent circular blocks)
//                 const conditions = await tx.run(
//                     SELECT.from("T_RULE_CONDITIONS")
//                         .where({ RULE_ID: ruleId })
//                         .and(`COND_CHAR != '${path.TARGET_CHAR}'`)
//                 );

//                 let ruleProb = 1.0;
//                 let allMet = (conditions.length > 0);
//                 let trace = [];
//                 // console.log("conditions ", conditions, "RULE_ID", ruleId);
//                 for (const cond of conditions) {
//                     const match = buffer.find(b => b.charKey === cond.COND_CHAR && b.valueCode === cond.COND_VALUE);
//                     if (match && match.probability > 0) {
//                         const w = parseFloat(cond.COND_WEIGHT || 1.0);
//                         ruleProb *= (match.probability * w);
//                         trace.push(`${cond.COND_CHAR}:${cond.COND_VALUE}(P:${match.probability}*W:${w})`);
//                     } else {
//                         allMet = false;
//                         // Audit Logging for Skipped Critical Rules
//                         if (ruleId === 'VCR36' || ruleId === 'VCR35') {
//                             console.log(`   [SKIP] ${ruleId} Missing: ${cond.COND_CHAR}=${cond.COND_VALUE}`);
//                             console.log(`   [BUFFER_SNAPSHOT]`, JSON.stringify(buffer));
//                         }
//                         break;
//                     }
//                 }

//                 if (allMet) {
//                     console.log(`   [FIRE] ${ruleId} -> ${path.TARGET_CHAR}:${path.TARGET_VALUE} | Calc: ${trace.join(' * ')} = ${ruleProb.toFixed(4)}`);
//                     firedRulesForLevel.push({ 
//                         charKey: path.TARGET_CHAR, valueCode: path.TARGET_VALUE, 
//                         probability: ruleProb, ruleId: ruleId 
//                     });
//                 }
//             }

//             /* =====================================================================
//                STAGE 4: AGGREGATION & IMMEDIATE SYNC
//                ===================================================================== */
//             const targetedCharsInLevel = [...new Set(firedRulesForLevel.map(f => f.charKey))];

//             for (const char of targetedCharsInLevel) {
//                 const resultsForChar = firedRulesForLevel.filter(f => f.charKey === char);
//                 const uniqueVals = [...new Set(resultsForChar.map(f => f.valueCode))];
//                 let resolvedSum = 0;

//                 for (const val of uniqueVals) {
//                     // WINNER-TAKES-ALL: Prevent probability > 1.0
//                     const winner = resultsForChar.filter(f => f.valueCode === val).sort((a, b) => b.probability - a.probability)[0];
//                     resolvedSum += winner.probability;

//                     const entry = {
//                         RESULTID: ++resultIdCounter, SESSIONID: sessionId, CHARKEY: char, VALUECODE: val,
//                         PROBABILITY: parseFloat(winner.probability.toFixed(4)), DERIVELEVEL: currentLevel,
//                         RULECHAIN: `["${winner.ruleId}"]`, STATUS: 'RESOLVED', COMPUTEDAT: new Date().toISOString()
//                     };
//                     allResultsToInsert.push(entry);

//                     // SYNC BUFFER IMMEDIATELY: Level 2 needs this Level 1 result
//                     buffer.push({ charKey: char, valueCode: val, probability: winner.probability });
//                 }

//                 // Log Gaps
//                 const gap = 1.0 - resolvedSum;
//                 if (gap > 0.0001) {
//                     allResultsToInsert.push({
//                         RESULTID: ++resultIdCounter, SESSIONID: sessionId, CHARKEY: char, VALUECODE: 'UNRESOLVED',
//                         PROBABILITY: parseFloat(gap.toFixed(4)), DERIVELEVEL: currentLevel,
//                         RULECHAIN: `GAP_LVL_${currentLevel}`, STATUS: 'UNRESOLVED', COMPUTEDAT: new Date().toISOString()
//                     });
//                     buffer.push({ charKey: char, valueCode: 'UNRESOLVED', probability: gap });
//                 }
//             }
//         }

//         /* =====================================================================
//            STAGE 5: FINAL COMMIT
//            ===================================================================== */
//         if (allResultsToInsert.length > 0) {
//             console.log(`\n[DB] Finalizing ${allResultsToInsert.length} records.`);
//             await tx.run(INSERT.into("DAG_DERIVATIONRESULTS").entries(allResultsToInsert));
//         }

//         await tx.run(UPDATE("DAG_SESSIONS").set({ STATUS: 'COMPUTED' }).where({ SESSIONID: sessionId }));
//         return { status: "SUCCESS", recordsComputed: allResultsToInsert.length };

//     } catch (error) {
//         console.error("[FATAL ENGINE ERROR]", error);
//         return req.error(500, error.message);
//     }
// });

// Last working version
// this.on("runDerivation", async (req) => {
//     const { sessionId } = req.data;
//     if (!sessionId) return req.error(400, "SESSION_ID_MISSING");

//     const tx = cds.transaction(req);

//     try {
//         /* =====================================================================
//            STAGE 1: INITIALIZATION & WHITELIST
//            ===================================================================== */
//         const session = await tx.run(SELECT.one.from("DAG_SESSIONS").where({ SESSIONID: sessionId }));
//         if (!session) return req.error(404, `SESSION_NOT_FOUND: ${sessionId}`);

//         const configRow = await tx.run(SELECT.one.from("DAG_PRODUCT_CONFIG").where({ PRODUCT: session.PRODUCTID }));
//         const rawJson = JSON.parse(configRow?.INF_COND_CHAR_VALUES || "{}");
//         // Normalize config to handle array vs object structures
//         const allowedConfig = (Array.isArray(rawJson) && rawJson.length > 0) ? rawJson[0] : (typeof rawJson === 'object' ? rawJson : {}); 
//         const masterWhitelist = Object.keys(allowedConfig);

//         /* =====================================================================
//            STAGE 2: BUFFER SEEDING (THE WORLD STATE)
//            ===================================================================== */
//         const rawInputs = await tx.run(SELECT.from("DAG_SESSIONINPUTS").where({ SESSIONID: sessionId }));
//         let buffer = rawInputs.map(i => ({ 
//             charKey: i.CHARKEY, valueCode: i.VALUECODE, probability: parseFloat(i.PROBABILITY) 
//         }));

//         // Root Seeds (100% Probability)
//         buffer.push({ charKey: 'REGION', valueCode: session.REGIONID || 'ALL', probability: 1.0 });
//         buffer.push({ charKey: 'PRODUCT', valueCode: session.PRODUCTID, probability: 1.0 });

//         await tx.run(DELETE.from("DAG_DERIVATIONRESULTS").where({ SESSIONID: sessionId }));

//         /* =====================================================================
//            STAGE 3: HIERARCHICAL ENGINE (WATERFALL)
//            ===================================================================== */
//         // FIXED: Using Raw SQL to bypass "Distinct" reserved word errors
//         const levels = await tx.run(`SELECT DISTINCT PATH_LENGTH FROM T_DERIVATION_PATHS ORDER BY PATH_LENGTH ASC`);
        
//         let allResultsToInsert = []; 
//         let resultIdCounter = Date.now(); 

//         for (const levelRow of levels) {
//             const currentLevel = levelRow.PATH_LENGTH;
//             console.log(`\n[LEVEL ${currentLevel}] Evaluation Started`);

//             const paths = await tx.run(SELECT.from("T_DERIVATION_PATHS").where({ PATH_LENGTH: currentLevel }));
//             let firedRulesForLevel = [];

//             for (const path of paths) {
//                 // 3.1 Whitelist Verification
//                 if (!masterWhitelist.includes(path.TARGET_CHAR)) continue;
//                 const allowedValues = allowedConfig[path.TARGET_CHAR] || [];
//                 if (!allowedValues.includes(path.TARGET_VALUE)) continue;

//                 // 3.2 Extract Leaf Rule
//                 const chain = JSON.parse(path.RULE_CHAIN || "[]");
//                 const ruleId = chain[chain.length - 1];

//                 // 3.3 Fetch Conditions (EXCLUDING the target char to prevent circular blocks)
//                 const conditions = await tx.run(
//                     SELECT.from("T_RULE_CONDITIONS")
//                         .where({ RULE_ID: ruleId })
//                         .and(`COND_CHAR != '${path.TARGET_CHAR}'`)
//                 );

//                 let ruleProb = 1.0;
//                 let allMet = (conditions.length > 0);
//                 let trace = [];

//                 for (const cond of conditions) {
//                     const match = buffer.find(b => b.charKey === cond.COND_CHAR && b.valueCode === cond.COND_VALUE);
//                     if (match && match.probability > 0) {
//                         const w = parseFloat(cond.COND_WEIGHT || 1.0);
//                         ruleProb *= (match.probability * w);
//                         trace.push(`${cond.COND_CHAR}:${cond.COND_VALUE}(P:${match.probability}*W:${w})`);
//                     } else {
//                         allMet = false;
//                         // Audit Logging for Skipped Critical Rules
//                         if (ruleId === 'VCR36' || ruleId === 'VCR35') {
//                             console.log(`   [SKIP] ${ruleId} Missing: ${cond.COND_CHAR}=${cond.COND_VALUE}`);
//                             console.log(`   [BUFFER_SNAPSHOT]`, JSON.stringify(buffer));
//                         }
//                         break;
//                     }
//                 }

//                 if (allMet) {
//                     console.log(`   [FIRE] ${ruleId} -> ${path.TARGET_CHAR}:${path.TARGET_VALUE} | Calc: ${trace.join(' * ')} = ${ruleProb.toFixed(4)}`);
//                     firedRulesForLevel.push({ 
//                         charKey: path.TARGET_CHAR, valueCode: path.TARGET_VALUE, 
//                         probability: ruleProb, ruleId: ruleId 
//                     });
//                 }
//             }

//             /* =====================================================================
//                STAGE 4: AGGREGATION & IMMEDIATE SYNC
//                ===================================================================== */
//             const targetedCharsInLevel = [...new Set(firedRulesForLevel.map(f => f.charKey))];

//             for (const char of targetedCharsInLevel) {
//                 const resultsForChar = firedRulesForLevel.filter(f => f.charKey === char);
//                 const uniqueVals = [...new Set(resultsForChar.map(f => f.valueCode))];
//                 let resolvedSum = 0;

//                 for (const val of uniqueVals) {
//                     // WINNER-TAKES-ALL: Prevent probability > 1.0
//                     const winner = resultsForChar.filter(f => f.valueCode === val).sort((a, b) => b.probability - a.probability)[0];
//                     resolvedSum += winner.probability;

//                     const entry = {
//                         RESULTID: ++resultIdCounter, SESSIONID: sessionId, CHARKEY: char, VALUECODE: val,
//                         PROBABILITY: parseFloat(winner.probability.toFixed(4)), DERIVELEVEL: currentLevel,
//                         RULECHAIN: `["${winner.ruleId}"]`, STATUS: 'RESOLVED', COMPUTEDAT: new Date().toISOString()
//                     };
//                     allResultsToInsert.push(entry);

//                     // SYNC BUFFER IMMEDIATELY: Level 2 needs this Level 1 result
//                     buffer.push({ charKey: char, valueCode: val, probability: winner.probability });
//                 }

//                 // Log Gaps
//                 const gap = 1.0 - resolvedSum;
//                 if (gap > 0.0001) {
//                     allResultsToInsert.push({
//                         RESULTID: ++resultIdCounter, SESSIONID: sessionId, CHARKEY: char, VALUECODE: 'UNRESOLVED',
//                         PROBABILITY: parseFloat(gap.toFixed(4)), DERIVELEVEL: currentLevel,
//                         RULECHAIN: `GAP_LVL_${currentLevel}`, STATUS: 'UNRESOLVED', COMPUTEDAT: new Date().toISOString()
//                     });
//                     buffer.push({ charKey: char, valueCode: 'UNRESOLVED', probability: gap });
//                 }
//             }
//         }

//         /* =====================================================================
//            STAGE 5: FINAL COMMIT
//            ===================================================================== */
//         if (allResultsToInsert.length > 0) {
//             console.log(`\n[DB] Finalizing ${allResultsToInsert.length} records.`);
//             await tx.run(INSERT.into("DAG_DERIVATIONRESULTS").entries(allResultsToInsert));
//         }

//         await tx.run(UPDATE("DAG_SESSIONS").set({ STATUS: 'COMPUTED' }).where({ SESSIONID: sessionId }));
//         return { status: "SUCCESS", recordsComputed: allResultsToInsert.length };

//     } catch (error) {
//         console.error("[FATAL ENGINE ERROR]", error);
//         return req.error(500, error.message);
//     }
// });


  // this.on("runDerivation", async (req) => {
  //   const { sessionId } = req.data;
  //   if (!sessionId) return req.error(400, "sessionId is required");
    
  //   const tx = cds.transaction(req);
    
  //   const session = await db.run(
  //     SELECT.one.from("dag.Sessions").where({ sessionId })
  //   );
  //   if (!session) return req.error(404, `Session ${sessionId} not found`);

  //   //const isHANA = db.kind === "hana" || db.kind === "hana-cloud";

  //   const isHANA = cds.env.requires.db.kind?.includes("hana");

  //   console.log("runDerivation session", session, "isHana", isHANA, "planMode", session.planMode)
  //   if (isHANA) {
  //     try {
  //       // const proc = session.PLANMODE === "PROBABILISTIC"
  //       //   ? "P_DERIVE_PROBABILISTIC"
  //       //   : "P_DERIVE_DETERMINISTIC";
  //       const proc = session.planMode === "PROBABILISTIC"
  //         ? "P_DERIVE_PROBABILISTIC"
  //         : "P_DERIVE_DETERMINISTIC";
  //       console.log("runDerivation proc", proc)
  //       // FIX 2: Use native HANA client for stored proc with OUT params
  //       // CAP db.run() cannot handle OUT parameters — use hdb client directly
  //       const hdbClient = await cds.db.acquire();
  //       try {
  //             const outParams = await new Promise((resolve, reject) => {
  //                 // 1. Add a timeout to catch silent hangs in the driver
  //                 const timeout = setTimeout(() => reject(new Error("HANA Driver Timeout - No response from exec")), 45000);

  //                 hdbClient.prepare(`CALL "${proc}"(?, ?, ?)`, (err, stmt) => {
  //                     if (err) {
  //                         clearTimeout(timeout);
  //                         console.log("Statement Preparation Error:", err);
  //                         return reject(err);
  //                     }
  //                     console.log("Statement Preparation Success:");

  //                     // 2. Use an OBJECT for binding. 
  //                     // This explicitly names the IN parameter and lets the driver 
  //                     // handle the remaining 2 placeholders as Scalar OUTs.
  //                     const bindParams = {
  //                         IV_SESSION_ID: sessionId
  //                     };

  //                     stmt.exec(bindParams, (err, output) => {
  //                         clearTimeout(timeout); // STOP the timeout as soon as driver responds
                          
  //                         if (err) {
  //                             console.log("Statement Execution Error:", err);
  //                             return reject(err);
  //                         }
                          
  //                         console.log("Statement Execution Success. Output:", output);
  //                         resolve(output);
  //                     });
  //                 });
  //             });
  //             console.log("OUT Results:", outParams);
  //             // Proceed with validation...
  //             const resolved = await db.run(
  //               SELECT.from("dag.DerivationResults")
  //                 .columns("count(*) as cnt")
  //                 .where({ sessionId, status: "RESOLVED" })
  //             );
  //             console.log("resolved ", resolved);
  //             console.log("_charDefs ", _charDefs);

  //             return {
  //               status  : outParams?.OV_STATUS  || "SUCCESS",
  //               message : outParams?.OV_MESSAGE || "",
  //               resolved: resolved[0]?.cnt   || 0,
  //               // total   : _charDefs?.filter(c => c.charType === "DERIVED").length || 0
  //               total: (_charDefs?.filter(c => c.charType === "DERIVED")?.length) || 0
  //             };
  //         } finally {
  //             cds.db.release(hdbClient);
  //         }
  //     } catch (hanaErr) {
  //       console.warn("[DAG] HANA proc failed, falling back to JS engine:", hanaErr.message);
  //     }
  //   }
  //   // ── JS DAG engine fallback ───────────────────────────────────────────
  //   if (!_dagEngine) await loadMasterData(db);

  //   const rawInputs = await db.run(
  //     SELECT.from("dag.SessionInputs").where({ sessionId })
  //   );

  //   let results;
  //   if (session.PLANMODE  === "PROBABILISTIC") {
  //     const inputDist = {};
  //     for (const row of rawInputs) {
  //       if (!inputDist[row.charKey]) inputDist[row.charKey] = {};
  //       inputDist[row.charKey][row.valueCode] = parseFloat(row.probability);
  //     }
  //     if (session.regionId) inputDist["REGION"] = { [session.regionId]: 1.0 };
  //     results = _dagEngine.deriveProbabilistic(inputDist);
  //   } else {
  //     const config = {};
  //     for (const row of rawInputs) config[row.charKey] = row.valueCode;
  //     if (session.regionId) config["REGION"] = session.regionId;
  //     results = _dagEngine.deriveDeterministic(config);
  //   }

  //   await db.run(DELETE.from("dag.DerivationResults").where({ sessionId }));

  //   let resultIdCounter = Date.now();
  //   for (const r of results) {
  //     const entries = [];
  //     if (r.allProbs && Object.keys(r.allProbs).length > 0) {
  //       for (const [val, prob] of Object.entries(r.allProbs)) {
  //         entries.push({
  //           resultId   : ++resultIdCounter,
  //           sessionId,
  //           charKey    : r.charKey,
  //           valueCode  : val,
  //           probability: parseFloat(prob.toFixed(4)),
  //           ruleId     : r.ruleId,
  //           deriveLevel: r.level,
  //           status     : r.status,
  //           computedAt : new Date()
  //         });
  //       }
  //     } else {
  //       entries.push({
  //         resultId   : ++resultIdCounter,
  //         sessionId,
  //         charKey    : r.charKey,
  //         valueCode  : r.valueCode,
  //         probability: parseFloat((r.probability || 0).toFixed(4)),
  //         ruleId     : r.ruleId,
  //         deriveLevel: r.level,
  //         status     : r.status,
  //         computedAt : new Date()
  //       });
  //     }
  //     await db.run(INSERT.into("dag.DerivationResults").entries(entries));
  //   }

  //   await db.run(
  //     UPDATE("dag.Sessions").set({ status: "COMPUTED" }).where({ sessionId })
  //   );

  //   const resolved = results.filter(r => r.status === "RESOLVED").length;
  //   return {
  //     status  : "SUCCESS",
  //     message : `${resolved}/${results.length} characteristics derived (${session.planMode})`,
  //     resolved,
  //     total   : results.length
  //   };
  // });

  this.on("getGraphTopology", async (req) => {
      const tx = cds.transaction(req);

      const vertices = await tx.run(
        SELECT.from("dag.GraphVertices")
          .columns([
            "vertexId",
            "charKey",
            "valueCode",
            "charType",
            "deriveLevel",
            "label",
            "topoOrder"
          ])
          .orderBy("topoOrder")
      );

      const edges = await tx.run(
        SELECT.from("dag.GraphEdges")
          .columns([
            "edgeId",
            "source",
            "target",
            "ruleId",
            "edgeWeight" // ensure this matches CDS
          ])
      );

      return {
        vertices: vertices.map(v => ({
          id        : v.vertexId,
          charKey   : v.charKey,
          valueCode : v.valueCode,
          charType  : v.charType,
          level     : v.deriveLevel,
          topoOrder : v.topoOrder,
          label     : v.label
        })),

        edges: edges.map(e => ({
          edgeId : e.edgeId,
          source : e.source,
          target : e.target,
          ruleId : e.ruleId,
          weight : Number(e.edgeWeight ?? 1.0)   // safer than parseFloat
        }))
      };
    });


this.on("rebuildGraph", async (req) => {
    try {
      // 1. Sync CAP definitions to Master T_* tables (Source of truth for the engine)
      console.log("[DAG] Syncing CAP data → Master T_* tables");
      // await db.run(`CALL "P_SEED_MASTER_DATA"()`);

      // 2. EXECUTE the Logic - This now performs the deduplication (GROUP BY)
      console.log("[DAG] Running P_REBUILD_GRAPH Procedure...");
      await db.run(`CALL "P_REBUILD_GRAPH"()`);

      // 3. SYNC RESULTS: Clear and Pull the NEW, clean data into CAP projection tables
      console.log("[DAG] Syncing fresh results back to CAP Projections");
      
      // Clear CAP Tables
      await Promise.all([
        db.run(DELETE.from("dag_GraphEdges")),
        db.run(DELETE.from("dag_GraphVertices")),
        db.run(DELETE.from("dag_DerivationPaths"))
      ]);

      // Copy deduplicated Vertices
      await db.run(`
        INSERT INTO dag_GraphVertices 
          (vertexId, charKey, valueCode, charType, deriveLevel, label, topoOrder)
        SELECT VERTEX_ID, CHAR_KEY, VALUE_CODE, CHAR_TYPE, DERIVE_LEVEL, LABEL, TOPO_ORDER
        FROM T_GRAPH_VERTICES
      `);

      // Copy deduplicated Edges
      await db.run(`
        INSERT INTO dag_GraphEdges
          (edgeId, source, target, ruleId, edgeWeight)
        SELECT EDGE_ID, SOURCE, TARGET, RULE_ID, EDGE_WEIGHT
        FROM T_GRAPH_EDGES
      `);

      // Copy deduplicated Paths
      await db.run(`
        INSERT INTO dag_DerivationPaths
          (pathId, sourceChar, sourceValue, targetChar, targetValue,
          pathLength, pathNodes, ruleChain, computedAt)
        SELECT PATH_ID, SOURCE_CHAR, SOURCE_VALUE, TARGET_CHAR, TARGET_VALUE, 
               PATH_LENGTH, PATH_NODES, RULE_CHAIN, COMPUTED_AT
        FROM T_DERIVATION_PATHS
      `);

      // 4. Update UI Cache
      await loadMasterData(db);

      // 5. Validate Output based on the NEW data
      const [vRes, pRes, cRes] = await Promise.all([
        db.run(SELECT.from("dag_GraphVertices").columns("count(*) as cnt")),
        db.run(SELECT.from("dag_DerivationPaths").columns("count(*) as cnt")),
        db.run(SELECT.from("dag_CharDefinitions").columns("count(*) as cnt"))
      ]);

      const msg = `HANA: vertices=${vRes[0].cnt}, paths=${pRes[0].cnt}, charDefs=${cRes[0].cnt}`;
      console.log("[DAG] Rebuild Successful:", msg);

      return { status: "SUCCESS", message: msg };

    } catch (ePRG) {
      console.error("[DAG] Rebuild Failed:", ePRG.message);
      return { status: "HANA_ERROR", message: "Graph rebuild failed: " + ePRG.message };
    }
});


  this.on("seedMasterData", async (req) => {
      try {
          await db.run(`CALL "P_SEED_MASTER_DATA"()`);
          return "Master data seeded successfully";
      } catch (e) {
          return req.error(500, "Seed failed: " + e.message);
      }
  });
});