namespace dag;

entity Products {
  key productId    : String(20);
      productLabel : String(100);
      createdAt    : Timestamp;
}

entity CharDefinitions {
  key charKey      : String(50);
      charLabel    : String(100);
      charType     : String(10);      // INPUT | DERIVED
      deriveLevel  : Integer;         // matches DERIVE_LEVEL column
      productId    : String(20);
}

entity CharValues {
  key charKey    : String(50);
  key valueCode  : String(50);
      valueLabel : String(100);
}

entity DerivationRules {
  key ruleId          : String(10);
      targetChar      : String(50);
      derivedValue    : String(50);
      ruleDescription : String(200);  // matches RULE_DESCRIPTION column
      active          : Integer default 1;
      createdAt       : Timestamp;
}

entity RuleConditions {
  key conditionId : Integer64;
      ruleId      : String(10);
      condChar    : String(50);
      condValue   : String(50);
      condWeight  : Decimal(5,2) default 1.0;
}

entity Sessions {
  key sessionId : String(36);
      userId    : String(100);
      productId : String(20);
      regionId  : String(10);
      planMode  : String(15) default 'DETERMINISTIC';
      createdAt : Timestamp;
      status    : String(20) default 'ACTIVE';
}

entity SessionInputs {
  key sessionId   : String(36);
  key charKey     : String(50);
  key valueCode   : String(50);
      probability : Decimal(7,4) default 1.0;
}

entity DerivationResults {
  key resultId    : Integer64;
      sessionId   : String(36);
      charKey     : String(50);
      valueCode   : String(50);
      probability : Double; // Decimal(15,10);
      ruleChain   : String(2000);
      deriveLevel : Integer;          // matches DERIVE_LEVEL column
      status      : String(15);
      computedAt  : Timestamp;
}

// Graph entities

entity GraphVertices 
{
  key vertexId   : String(50);
      charKey    : String(50);
      valueCode  : String(50);
      charType   : String(10);
      deriveLevel: Integer;           // matches DERIVE_LEVEL column
      label      : String(150);
      topoOrder  : Integer;           // topological sort order from P_GRAPH_TOPO_SORT
}

entity GraphEdges {
  key edgeId     : Integer64;
      source     : String(50);
      target     : String(50);
      ruleId     : String(10);
      edgeWeight : Decimal(7,4);      // matches EDGE_WEIGHT column
}

// Pre-computed derivation paths (computed once when rules change)
// A path represents a full chain from an INPUT vertex to a DERIVED vertex
// e.g. ENGINE__V6_TURBO → EMISSION_CLASS__EURO6 → CHASSIS_TYPE__SPORT → SAFETY_PACKAGE__PREMIUM
// @(cds.persistence.name: 'T_DERIVATION_PATHS')
entity DerivationPaths {
  key pathId         : Integer64;
      sourceChar     : String(50);    // INPUT char key e.g. ENGINE
      sourceValue    : String(50);    // INPUT value code e.g. V6_TURBO
      targetChar     : String(50);    // DERIVED char key e.g. SAFETY_PACKAGE
      targetValue    : String(50);    // DERIVED value code e.g. PREMIUM
      pathLength     : Integer;       // number of hops/edges in path
      pathNodes      : String(2000);  // JSON array of vertexIds along path
      ruleChain      : String(2000);  // JSON array of ruleIds along path
      topoSequence   : String(500);   // comma-separated topo order positions
      computedAt     : Timestamp;     // when path was last computed
}

// Enriched views (backed by HANA views)
view DerivationResultsFull as select from DerivationResults {
  resultId, sessionId, charKey, valueCode,
  probability, ruleChain, deriveLevel, status, computedAt
};

view GraphEdgesEnriched as select from GraphEdges {
  edgeId, source, target, ruleId, edgeWeight
};

// View: vertices with topo order for UI DAG rendering
view GraphVerticesSorted as select from GraphVertices {
  vertexId, charKey, valueCode, charType, deriveLevel, label, topoOrder
} order by topoOrder;

// View: paths with full context for derivation engine
view DerivationPathsFull as select from DerivationPaths {
  pathId, sourceChar, sourceValue, targetChar, targetValue,
  pathLength, pathNodes, ruleChain, topoSequence, computedAt
};
