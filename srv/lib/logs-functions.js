"use strict";

const axios  = require("axios");
const xsenv  = require("@sap/xsenv");

/**
 * logs-functions.js
 * ─────────────────────────────────────────────────────────────
 * Fetches CF logs for config_products-srv between two timestamps.
 *
 * Confirmed working endpoint (us10):
 *   GET https://log-cache.cf.us10.hana.ondemand.com/api/v1/read/{guid}
 *
 * Usage:
 *   const { getCFLogs } = require('./utils/logs-functions');
 *
 *   const result = await getCFLogs({
 *       startTimestamp: '2026-06-02T10:00:00.000Z',
 *       endTimestamp  : '2026-06-02T10:30:00.000Z',
 *       logLevel      : 'ALL'   // 'ALL' | 'INFO' | 'WARN' | 'ERROR'
 *   });
 *
 *   result.logs    → array of log objects
 *   result.count   → number of lines
 *   result.message → summary string
 */

const PAGE_SIZE     = 1000;
const MAX_PAGES     = 100;
const LOG_CACHE_URL = "https://log-cache.cf.us10.hana.ondemand.com";


/* ══════════════════════════════════════════════════════════════
   PUBLIC — getCFLogs
══════════════════════════════════════════════════════════════ */
async function getCFLogs({
    startTimestamp,
    endTimestamp,
    logLevel = "ALL"
} = {}) {

    // ── Validate ────────────────────────────────────────────────
    if (!startTimestamp || !endTimestamp) {
        throw new Error("getCFLogs: startTimestamp and endTimestamp are required.");
    }

    const startMs = Date.parse(startTimestamp);
    const endMs   = Date.parse(endTimestamp);

    if (isNaN(startMs) || isNaN(endMs)) {
        throw new Error("getCFLogs: Invalid timestamp. Use ISO 8601 e.g. '2026-06-02T10:00:00.000Z'");
    }
    if (startMs >= endMs) {
        throw new Error("getCFLogs: startTimestamp must be before endTimestamp.");
    }

    const startNs = BigInt(startMs) * 1_000_000n;
    const endNs   = BigInt(endMs)   * 1_000_000n;

    // ── 1. Token ────────────────────────────────────────────────
    const auth = await _getToken();

    // ── 2. App GUID ─────────────────────────────────────────────
    const appGuid = _resolveGuid();

    // ── 3. Fetch all pages ──────────────────────────────────────
    const allEnvelopes = await _fetchAllPages(appGuid, auth, startNs, endNs);

    // ── 4. Parse + filter ───────────────────────────────────────
    const logs = _parseEnvelopes(allEnvelopes, logLevel.toUpperCase());

    return {
        logs,
        count  : logs.length,
        message: logs.length > 0
            ? `${logs.length} log line(s) found between ${startTimestamp} and ${endTimestamp}.`
            : `No logs found in the specified time window.`
    };
}


/* ══════════════════════════════════════════════════════════════
   PRIVATE — fetch all paginated pages
   ──────────────────────────────────────────────────────────────
   Confirmed URL pattern:
     GET https://log-cache.cf.us10.hana.ondemand.com/api/v1/read/{guid}
         ?start_time={ns}
         &end_time={ns}
         &limit=1000
         &envelope_types=LOG
══════════════════════════════════════════════════════════════ */
async function _fetchAllPages(appGuid, auth, startNs, endNs) {

    const allEnvelopes = [];
    let   cursorNs     = startNs;
    let   page         = 0;

    while (page < MAX_PAGES) {
        page++;

        const url = `${LOG_CACHE_URL}/api/v1/read/${appGuid}`
            + `?start_time=${cursorNs}`
            + `&end_time=${endNs}`
            + `&limit=${PAGE_SIZE}`
            + `&envelope_types=LOG`;


        let data;
        try {
            const response = await axios.get(url, {
                headers: { Authorization: auth }
            });
            data = response.data;
        } catch (err) {
            const status = err.response?.status;
            const detail = JSON.stringify(err.response?.data || err.message);
            throw new Error(`Log fetch failed [HTTP ${status}]: ${detail}`);
        }

        // Response shape: { batch: { batch: [...envelopes] } }
        const batch = data?.envelopes?.batch || data?.batch?.batch || data?.batch || [];

        if (!batch.length) break;

        allEnvelopes.push(...batch);

        if (batch.length < PAGE_SIZE) break;  // last page

        // Advance cursor past last timestamp
        const lastTs = BigInt(batch[batch.length - 1].timestamp || 0);
        if (lastTs <= cursorNs) break;
        cursorNs = lastTs + 1n;
    }

    return allEnvelopes;
}


/* ══════════════════════════════════════════════════════════════
   PRIVATE — parse envelopes into clean log objects
══════════════════════════════════════════════════════════════ */
function _parseEnvelopes(envelopes, logLevel) {

    const LEVEL_PATTERNS = [
        { pattern: /\b(ERROR|ERR)\b/i, level: "ERROR" },
        { pattern: /\bWARN(ING)?\b/i,  level: "WARN"  },
        { pattern: /\bINFO\b/i,         level: "INFO"  },
        { pattern: /\bDEBUG\b/i,        level: "DEBUG" }
    ];

    const PRIORITY    = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    const minPriority = logLevel === "ALL" ? -1 : (PRIORITY[logLevel] ?? -1);

    return envelopes
        .filter(e => e.log?.payload)
        .map(e => {
            const message        = Buffer.from(e.log.payload, "base64").toString("utf8").trim();
            const sourceType     = e.tags?.source_type     || "APP";
            const sourceInstance = e.tags?.source_instance || "0";
            const logType        = e.log.type || "OUT";

            let level = "INFO";
            for (const { pattern, level: lvl } of LEVEL_PATTERNS) {
                if (pattern.test(message)) { level = lvl; break; }
            }
            if (logType === "ERR" && level === "INFO") level = "WARN";

            return {
                timestamp      : new Date(Number(BigInt(e.timestamp || 0) / 1_000_000n)).toISOString(),
                level,
                sourceType,
                sourceInstance,
                logType,
                message
            };
        })
        .filter(line =>
            minPriority === -1 || (PRIORITY[line.level] ?? 0) >= minPriority
        );
}


/* ══════════════════════════════════════════════════════════════
   PRIVATE — current app GUID from VCAP_APPLICATION
══════════════════════════════════════════════════════════════ */
function _resolveGuid() {
    const vcapApp = JSON.parse(process.env.VCAP_APPLICATION || "{}");
    const guid    = vcapApp.application_id;
    if (!guid) throw new Error("[getCFLogs] application_id not found in VCAP_APPLICATION.");
    return guid;
}


/* ══════════════════════════════════════════════════════════════
   PRIVATE — UAA token via xsenv + axios (client_credentials)
   ──────────────────────────────────────────────────────────────
   Uses the xsuaa service instance bound to the app.
   Requires logs.read in authorities of xs-security.json.
══════════════════════════════════════════════════════════════ */
async function _getToken() {
    try {
        const params = new URLSearchParams();
        params.append('grant_type',    'password');
        params.append('client_id',     'cf');
        params.append('client_secret', '');
        params.append('username',     'vcpcontroller@sbpcorp.com');
        params.append('password',      'VCPdev@2024');

        const response = await axios.post(
            'https://uaa.cf.us10.hana.ondemand.com/oauth/token',
            params
        );
        return 'Bearer ' + response.data.access_token;
    } catch (error) {
        throw new Error('Failed to get CF UAA token: ' + error.message);
    }
}


module.exports = { getCFLogs };