namespace graphs;

type ObjType      : String enum {
    CHARS;
    RULES;
}


entity VERTICES {
    key LOCATION_ID  : String(5) NOT NULL    @title: 'LOCATION ID';
    key PRODUCT_ID   : String(40) NOT NULL   @title: 'PRODUCT ID';
    key OBJ_TYPE     : String(10) NOT NULL   @title: 'OBJECT TYPE'; // CHARS, RULES
    key VERTEX_ID    : String(5) NOT NULL    @title: 'Vertex ID ';
};

entity EDGES {
   key ID : Integer;
   key LOCATION_ID  : VERTICES:LOCATION_ID    @title: 'LOCATION ID';
   key PRODUCT_ID   : VERTICES:PRODUCT_ID   @title: 'PRODUCT ID';
   key OBJ_TYPE     : String(10) NOT NULL   @title: 'OBJECT TYPE'; // CHARS, RULES
   
   key SOURCE : VERTICES:VERTEX_ID  @title: 'Source Vertex ID';
   key TARGET : VERTICES:VERTEX_ID  @title: 'Target Vertex ID';
   WEIGHT : Double  @title: 'Edge Weight';
};

entity DFS_VERTICES_SORTED {
    key START_VERTEX_ID : String(5) NOT NULL    @title: 'START VERTEX ID';
    key LOCATION_ID : String(5) NOT NULL        @title: 'LOCATION ID';
    key PRODUCT_ID  : String(40) NOT NULL       @title: 'PRODUCT ID';
    key OBJ_TYPE    : String(10) NOT NULL       @title: 'OBJECT TYPE'; // CHARS, RULES
    key ALGORITHM   : String(25) NOT NULL       @title: 'ALGORITHM';
    key VERTEX_ID   : String(5) NOT NULL        @title: 'Output Vertex ID ';
    VISIT_ORDER     :   Integer                 @title: 'Output Vertices Visit Order';
    EXIT_ORDER      :   Integer                 @title: 'Output Vertices Exit Order';
    LEVEL           :   Integer                 @title: 'Output Vertex ID Level';

}

entity TOPOLOGY_SORTED {
    key LOCATION_ID : String(5) NOT NULL        @title: 'LOCATION ID';
    key PRODUCT_ID  : String(40) NOT NULL       @title: 'PRODUCT ID';
    key OBJ_TYPE    : String(10) NOT NULL       @title: 'OBJECT TYPE'; // CHARS, RULES
    key ALGORITHM   : String(25) NOT NULL       @title: 'ALGORITHM';
    key VERTEX_ID   : String(5) NOT NULL        @title: 'Output Vertex ID ';
    EXIT_ORDER      :   Integer                 @title: 'Output Vertices Exit Order';
    DEPTH           :   Integer                 @title: 'Depth from Start Vertex ID';
}


entity VERTICES_DISTANCE {
    key START_VERTEX_ID : String(5) NOT NULL    @title: 'START VERTEX ID';
    key LOCATION_ID : String(5) NOT NULL        @title: 'LOCATION ID';
    key PRODUCT_ID  : String(40) NOT NULL       @title: 'PRODUCT ID';
    key OBJ_TYPE    : String(10) NOT NULL       @title: 'OBJECT TYPE'; // CHARS, RULES
    key ALGORITHM   : String(25) NOT NULL       @title: 'ALGORITHM';
    key DIRECTION   : String(10) NOT NULL       @title: 'Direction';
    key VERTEX_ID   : String(5) NOT NULL        @title: 'Output Vertex ID ';
    DISTANCE        :   Double                 @title: 'Output DISTANCE';

}

entity VERTICES_EDGES_DISTANCE {
    key START_VERTEX_ID : String(5) NOT NULL    @title: 'START VERTEX ID';
    key LOCATION_ID : String(5) NOT NULL        @title: 'LOCATION ID';
    key PRODUCT_ID  : String(40) NOT NULL       @title: 'PRODUCT ID';
    key OBJ_TYPE    : String(10) NOT NULL       @title: 'OBJECT TYPE'; // CHARS, RULES
    key ALGORITHM   : String(25) NOT NULL       @title: 'ALGORITHM';
    key DIRECTION   : String(10) NOT NULL       @title: 'Input Direction';
    // key ID          : Integer                   @title: 'Output ID';
    key SOURCE      : String(5) NOT NULL        @title: 'Output SOURCE Vertex ID ';
    key TARGET      : String(5) NOT NULL        @title: 'Output TARGET Vertex ID ';
    DISTANCE        : Double                   @title: 'Output DISTANCE BY EDGES';
}


entity K_SHORTEST_PATHS {
    key LOCATION_ID     : String(5) NOT NULL        @title: 'LOCATION ID';
    key PRODUCT_ID      : String(40) NOT NULL       @title: 'PRODUCT ID';
    key OBJ_TYPE        : String(10) NOT NULL       @title: 'OBJECT TYPE'; // CHARS, RULES
    key ALGORITHM       : String(25) NOT NULL       @title: 'ALGORITHM';
    key START_VERTEX_ID : String(5) NOT NULL        @title: 'START VERTEX ID';
    key END_VERTEX_ID   : String(5) NOT NULL        @title: 'END VERTEX ID';
    key PATH_ID         : Integer                   @title: 'Output PATH ID';
    key PATH_LENGTH     : Integer                   @title: 'Output PATH LENGTH';   
    PATH_WEIGHT         : Double                    @title: 'Output CUMULATIVE PATH LENGTH';    
    key EDGE_ID         : Integer                   @title: 'Output EDGE ID';    
    EDGE_ORDER          : Integer                   @title: 'Output Edge Order';
}


entity GraphAlgorithm {
        key LOCATION_ID     : String(4);
        key PRODUCT_ID      : String(40);
        key OBJ_TYPE        : String(10); // CHARS, RULES
        // key MODEL_VERSION   : String(20);// Active, Simulation// Active, Simulation
        key ALGORITHM       :  String(25); 
        key START_VERTEX_ID : String(5) default 'NONE'; // TOPOLOGY SORT does not take any Input
        key END_VERTEX_ID : String(5) default 'NONE'; // Required for K Shortest Paths
        key DIRECTION       : String(10) default 'OUTGOING'; // INCOMING, OUTGOING, ANY
        key K_SHORTEST_PATHS : Integer default 1000; // Required for K Shortest Paths
        MIN_DEPTH       : Integer default 0;
        MAX_DEPTH       : Integer default 1000;
        verticesData       : array of {
            ID        : String(100);
        };
        edgesData       : array of {
            ID      : Integer;
            SOURCE  : String(100);
            TARGET  : String(100);
            WEIGHT  : Double;   
        };

}

@cds.persistence.exists
entity![V_K_SHORTEST_PATHS]{
    key![LOCATION_ID]   : String(4)   @title: 'LOCATION_ID';
    key![PRODUCT_ID]    : String(40) @title: 'PRODUCT_ID';
    key![OBJ_TYPE]      : String(10) @title: 'OBJ_TYPE';
    key![START_VERTEX_ID] : String(5) @title: 'START VERTEX ID'; 
    key![END_VERTEX_ID] : String(5) @title: 'END VERTEX ID'; 
    key![SOURCE]        : String(5) @title: 'SOURCE VERTEX ID';
    key![TARGET]        : String(5) @title: 'TARGET VERTEX ID';
    key![PATH_ID]       : Integer   @title: 'PATH ID';
    key![PATH_LENGTH]   : Integer   @title: 'PATH LENGTH';   
    ![PATH_WEIGHT]      : Double    @title: 'CUMULATIVE PATH LENGTH';   
    ![WEIGHT]           : Double    @title: 'EDGE WEIGHT';
    key![EDGE_ID]       : Integer   @title: 'EDGE ID';    
    key![EDGE_ORDER]    : Integer   @title: 'EDGE ORDER'; 
}