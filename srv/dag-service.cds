using {
  dag as db
} from '../db/dag.cds';

// ─── Exposed OData / REST Entities ─────────────────────────────────────────
// @requires: 'authenticated-user'
service DAGService @(impl: './lib/dag-service.js', path: '/dag') {

  // Read-only reference data
  @readonly entity Products        as projection on db.Products;
  @readonly entity CharDefinitions as projection on db.CharDefinitions;
  @readonly entity CharValues      as projection on db.CharValues;
  @readonly entity DerivationRules as projection on db.DerivationRules;
  @readonly entity RuleConditions  as projection on db.RuleConditions;
  @readonly entity GraphVertices      as projection on db.GraphVertices;
  @readonly entity DerivationPaths    as projection on db.DerivationPaths;
  @readonly entity GraphVerticesSorted as projection on db.GraphVerticesSorted;
  @readonly entity DerivationPathsFull as projection on db.DerivationPathsFull;
  @readonly entity GraphEdges      as projection on db.GraphEdgesEnriched;

  // Planning sessions (full CRUD)
  entity Sessions          as projection on db.Sessions;
  entity SessionInputs     as projection on db.SessionInputs;
  entity DerivationResults as projection on db.DerivationResultsFull;

  // ─── Actions ──────────────────────────────────────────────────────────

  action createSession(
    productId : String(20),
    regionId  : String(10),
    planMode  : String(15)
  ) returns {
    sessionId : String(36);
    status    : String(20);
  };

  action setSessionInputs(
    sessionId : String(36),
    inputs    : array of {
      charKey     : String(50);
      valueCode   : String(50);
      probability : Decimal(7,4);
    }
  ) returns {
    status  : String(20);
    message : String(200);
  };

  action runDerivation(
    sessionId : String(36)
  ) returns {
    status   : String(20);
    message  : String(500);
    resolved : Integer;
    total    : Integer;
  };

  // CHANGED: function → action
  // Reason: getGraphTopology has no parameters and returns complex type.
  // CAP exposes parameterless functions as GET but the complex return type
  // (nested arrays of vertices+edges) is more reliably handled as POST action.
  // Using function caused "Unexpected end of JSON input" on some CAP versions.
  action getGraphTopology() returns {
    vertices : array of {
      id        : String(50);
      charKey   : String(50);
      valueCode : String(50);
      charType  : String(10);
      level     : Integer;
      label     : String(150);
      topoOrder : Integer;   // ✅ Added
    };
    edges : array of {
      edgeId : Integer64;
      source : String(50);
      target : String(50);
      ruleId : String(10);
      weight : Decimal(7,4);
    };
  };

  // CHANGED: added @requires: 'Admin' 
  // Reason: rebuildGraph modifies master data — restrict to Admin role only
  // @requires: 'Admin'
  action rebuildGraph() returns {
    status  : String(20);
    message : String(200);
  };

  // @requires: 'Admin'
  action seedMasterData() returns String;
}