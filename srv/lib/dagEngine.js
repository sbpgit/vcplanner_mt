/**
 * DAG-based Probabilistic Derivation Engine
 * Server-side implementation mirroring the HANA Graph stored procedure.
 * Used for local dev / fallback when HANA Graph proc is unavailable.
 *
 * Fully dynamic: supports any number of derivation levels (no hard-coded max).
 *
 * Algorithm:
 *   1. Build adjacency list from rule conditions
 *   2. Kahn's topological sort on the DAG
 *   3. Level-by-level probability propagation:
 *      P(rule fires)  = Π P(cond_i) for all conditions
 *      P(derived = v) = Σ P(rule fires) for rules yielding v
 */

"use strict";

class DAGEngine {
  constructor(rules, conditions, charDefs) {
    this.rules      = rules;      // [{ruleId, targetChar, derivedValue}]
    this.conditions = conditions; // [{ruleId, condChar, condValue, condWeight}]
    this.charDefs   = charDefs;   // [{charKey, charType, level}]

    this._buildGraph();
  }

  /** Build adjacency list (condChar → targetChar) for topological sort */
  _buildGraph() {
    this.adjList  = new Map(); // charKey → Set<charKey>
    this.inDegree = new Map(); // charKey → integer

    const derivedChars = this.charDefs.filter(c => c.charType === "DERIVED").map(c => c.charKey);
    const inputChars   = this.charDefs.filter(c => c.charType === "INPUT").map(c => c.charKey);

    for (const c of [...inputChars, ...derivedChars]) {
      if (!this.adjList.has(c))  this.adjList.set(c, new Set());
      if (!this.inDegree.has(c)) this.inDegree.set(c, 0);
    }

    for (const rule of this.rules) {
      const ruleConds = this.conditions.filter(c => c.ruleId === rule.ruleId);
      for (const cond of ruleConds) {
        const src = cond.condChar;
        const tgt = rule.targetChar;
        if (!this.adjList.has(src)) this.adjList.set(src, new Set());
        if (!this.adjList.get(src).has(tgt)) {
          this.adjList.get(src).add(tgt);
          this.inDegree.set(tgt, (this.inDegree.get(tgt) || 0) + 1);
        }
      }
    }

    this.topoOrder = this._kahnSort();
  }

  /** Kahn's algorithm — returns charKeys in safe processing order */
  _kahnSort() {
    const inDeg  = new Map(this.inDegree);
    const queue  = [];
    const result = [];

    for (const [node, deg] of inDeg) {
      if (deg === 0) queue.push(node);
    }

    while (queue.length > 0) {
      const node = queue.shift();
      result.push(node);
      for (const neighbour of (this.adjList.get(node) || [])) {
        const newDeg = inDeg.get(neighbour) - 1;
        inDeg.set(neighbour, newDeg);
        if (newDeg === 0) queue.push(neighbour);
      }
    }

    if (result.length !== this.adjList.size) {
      console.warn("[DAGEngine] Cycle detected — partial topological order used");
    }

    return result;
  }

  /**
   * DETERMINISTIC derivation
   * Processes all derived characteristics sorted by level (ascending).
   * Derived values from earlier levels are available as conditions in later levels.
   * No hard-coded level ceiling — uses max level found in charDefs.
   *
   * @param {Object} config  — { CHAR_KEY: VALUE_CODE, ... }
   * @returns {Array} derivation results
   */
  deriveDeterministic(config) {
    const state   = { ...config };
    const results = [];

    // Sort by level ascending so each level feeds into the next
    const derivedByLevel = this.charDefs
      .filter(c => c.charType === "DERIVED")
      .sort((a, b) => a.level - b.level);

    for (const charDef of derivedByLevel) {
      const targetChar = charDef.charKey;
      const applicable = this.rules.filter(r => r.targetChar === targetChar);

      let bestScore    = -1;
      let bestValue    = null;
      let bestRule     = null;
      let conflictFlag = false;

      for (const rule of applicable) {
        const ruleConds = this.conditions.filter(c => c.ruleId === rule.ruleId);
        const allMatch  = ruleConds.every(c => state[c.condChar] === c.condValue);

        if (allMatch) {
          const score = ruleConds.length; // higher = more specific
          if (score > bestScore) {
            bestScore    = score;
            bestValue    = rule.derivedValue;
            bestRule     = rule.ruleId;
            conflictFlag = false;
          } else if (score === bestScore && rule.derivedValue !== bestValue) {
            conflictFlag = true;
          }
        }
      }

      results.push({
        charKey    : targetChar,
        charLabel  : charDef.charLabel,
        level      : charDef.level,
        valueCode  : bestValue,
        probability: bestValue ? 1.0 : 0.0,
        ruleId     : bestRule,
        status     : bestValue
          ? (conflictFlag ? "CONFLICT" : "RESOLVED")
          : "UNRESOLVED",
        allProbs   : bestValue ? { [bestValue]: 1.0 } : {}
      });

      // Feed derived value into state for downstream levels
      if (bestValue) state[targetChar] = bestValue;
    }

    return results;
  }

  /**
   * PROBABILISTIC derivation using DAG topological propagation.
   * Processes derived characteristics in topological order.
   * Supports any number of levels — each level's probability distribution
   * feeds into deeper levels as pseudo-input distributions.
   *
   * @param {Object} inputDist — { CHAR_KEY: { VALUE: probability, ... }, ... }
   * @returns {Array} derivation results with full probability distributions
   */
  deriveProbabilistic(inputDist) {
    const probState = {};
    for (const [k, v] of Object.entries(inputDist)) {
      probState[k] = { ...v };
    }

    const results      = [];
    const derivedChars = this.charDefs.filter(c => c.charType === "DERIVED");
    const derivedSet   = new Set(derivedChars.map(c => c.charKey));

    // Only process derived chars; follow topological order so upstream distributions
    // are fully computed before they are needed as conditions for downstream chars
    const orderedDerived = this.topoOrder.filter(k => derivedSet.has(k));

    for (const targetChar of orderedDerived) {
      const charDef    = derivedChars.find(c => c.charKey === targetChar);
      const applicable = this.rules.filter(r => r.targetChar === targetChar);
      const derivedDist = {};

      for (const rule of applicable) {
        const ruleConds = this.conditions.filter(c => c.ruleId === rule.ruleId);

        // Joint probability under independence assumption:
        // P(rule fires) = Π_k P(char_k = condValue_k)
        let pRule = 1.0;
        for (const cond of ruleConds) {
          const charDist = probState[cond.condChar] || {};
          pRule *= (charDist[cond.condValue] || 0.0);
        }

        if (pRule > 1e-8) {
          derivedDist[rule.derivedValue] =
            (derivedDist[rule.derivedValue] || 0) + pRule;
        }
      }

      // Propagate this char's distribution so deeper levels can consume it
      probState[targetChar] = derivedDist;

      const totalProb   = Object.values(derivedDist).reduce((a, b) => a + b, 0);
      const pUnresolved = Math.max(0, 1.0 - totalProb);

      const sorted = Object.entries(derivedDist).sort((a, b) => b[1] - a[1]);

      results.push({
        charKey     : targetChar,
        charLabel   : charDef?.charLabel || targetChar,
        level       : charDef?.level || 0,
        valueCode   : sorted.length > 0 ? sorted[0][0] : null,
        probability : sorted.length > 0 ? sorted[0][1] : 0,
        allProbs    : derivedDist,
        pUnresolved,
        status      : totalProb > 0 ? "RESOLVED" : "UNRESOLVED",
        ruleId      : "—"
      });
    }

    return results;
  }

  /** Return topological order with level metadata for UI rendering */
  getTopologyMetadata() {
    return this.topoOrder.map((charKey, idx) => {
      const def = this.charDefs.find(c => c.charKey === charKey);
      return {
        charKey,
        level    : def?.level ?? 0,
        charType : def?.charType ?? "INPUT",
        topoOrder: idx
      };
    });
  }
}

module.exports = { DAGEngine };
