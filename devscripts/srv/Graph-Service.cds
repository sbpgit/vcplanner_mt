using graphs from '../db/graph_schema';
service GraphService @(impl : './graphs/Graph-Service.js'){

entity runAlgorithm as projection on graphs.GraphAlgorithm;
//  @requires: 'authenticated-user'
 entity VERTICES
    as projection on graphs.VERTICES;

//  @requires: 'authenticated-user'
 entity EDGES
    as projection on  graphs.EDGES;

//  @requires: 'authenticated-user'
 entity VERTICES_SORTED
    as projection on  graphs.DFS_VERTICES_SORTED;

 entity VERTICES_DISTANCE
    as projection on  graphs.VERTICES_DISTANCE;

 entity VERTICES_EDGES_DISTANCE
    as projection on  graphs.VERTICES_EDGES_DISTANCE;

entity TOPOLOGY_SORTED
    as projection on  graphs.TOPOLOGY_SORTED;

entity K_SHORTEST_PATHS
    as projection on  graphs.K_SHORTEST_PATHS;

entity V_K_SHORTEST_PATHS_SOURCE_TARGET 
   as projection on graphs.V_K_SHORTEST_PATHS;

 action generateGraphs(vcRulesList : array of {
      LOCATION_ID     : String(4);
      PRODUCT_ID      : String(40);
      OBJ_TYPE        : String(10); // CHARS, RULES
      // MODEL_VERSION   : String(20);// Active, Simulation// Active, Simulation
      ALGORITHM :  String(25); 
      START_VERTEX_ID : String(5) default 'NONE'; // TOPOLOGY SORT does not take any Input
      DIRECTION       : String(10) default 'OUTGOING'; // INCOMING, OUTGOING, ANY
      MIN_DEPTH       : Integer default 0;
      MAX_DEPTH       : Integer default 1000;
      END_VERTEX_ID : String(5) default 'NONE'; // Required for K Shortest Paths
      K_SHORTEST_PATHS : Integer default 1000; // Required for K Shortest Paths
   });
   
   function fgenerateGraphs(vcRulesList : String) returns String;


}