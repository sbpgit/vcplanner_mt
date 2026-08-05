const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
const hana = require('@sap/hana-client');
const graphFuncs = require('./HanaGraphFuncs.js');


const conn_params = {
    serverNode  : process.env.classicalSchemaNodePort, 
    uid         : process.env.uidClassicalSchema, 
    pwd         : process.env.uidClassicalSchemaPassword,
    encrypt: 'TRUE'
};
const graphSchema = process.env.graphSchema; 

exports._runGraphAlgorithm = async function(req) {

    // console.log("_runAhcClusters data ",req.data);

 
    graphFuncs._updateGraphData(req);

    await graphFuncs._runHanaGraphs(req); 
  
}


exports._updateGraphData = function(req) {
    const verticesData = req.data.verticesData;
    const edgesData = req.data.edgesData;
    // let locationId, productId, objType, algorithmId, vertexId; 
    const locationId = req.data.LOCATION_ID;
    const productId = req.data.PRODUCT_ID;
    const objType = req.data.OBJ_TYPE;
    const algorithmId = req.data.ALGORITHM;

    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + graphSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    // sqlStr =  "DELETE FROM VERTICES WHERE LOCATION_ID = " + "'" + locationId + "'" +
    //             " AND PRODUCT_ID = " + "'" + productId + "'" +
    //             " AND OBJ_TYPE = " + "'" + objType + "'" ;

    const objString = locationId + '#' +productId + '#' + objType;
    // sqlStr =  "DELETE FROM VERTICES WHERE ID LIKE " + "'%" + objString + "%'";
    sqlStr =  "DELETE FROM VERTICES";

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();


    let tableObj = [];	


    for (let vIndex = 0; vIndex < verticesData.length; vIndex++)
    {
        // locationId = verticesData[vIndex].LOCATION_ID;
        // productId = verticesData[vIndex].PRODUCT_ID;
        // objType = verticesData[vIndex].OBJ_TYPE;
        // // algorithmId = verticesData[vIndex].ALGORITHM;
        // vertexId = verticesData[vIndex].VERTEX_ID;
        
        // let g_vertexId = locationId + '#' +productId + '#' + objType + '#' + algorithmId + '#' + vertexId;

        let vertexId = verticesData[vIndex].ID;

        let g_vertexId = locationId + '#' +productId + '#' + objType + '#' + vertexId;

        let rowObj = [];
        rowObj.push(g_vertexId);

        tableObj.push(rowObj);
    }
    sqlStr = "INSERT INTO VERTICES(ID) VALUES(?)";
    stmt = conn.prepare(sqlStr);

    stmt.execBatch(tableObj);
    stmt.drop();

    console.log(' _updateVerticesData Completed ');

    // sqlStr =  "DELETE FROM EDGES WHERE LOCATION_ID = " + "'" + locationId + "'" +
    //             " AND PRODUCT_ID = " + "'" + productId + "'" +
    //             " AND OBJ_TYPE = " + "'" + objType + "'" ;


    // sqlStr =  "DELETE FROM EDGES WHERE SOURCE LIKE " + "'%" + objString + "%'" +
    //           "OR TARGET LIKE " + "'%" + objString + "%'";
    sqlStr =  "DELETE FROM EDGES";

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    tableObj = [];	

    let edgeId, sourceVertex, targetVertex, weight;

    for (let eIndex = 0; eIndex < edgesData.length; eIndex++)
    {
        // locationId = edgesData[eIndex].LOCATION_ID;
        // productId = edgesData[eIndex].PRODUCT_ID;
        // objType = edgesData[eIndex].OBJ_TYPE;
        // sourceVertex = locationId + '#' +productId + '#' + objType + '#' + edgesData[eIndex].SOURCE;
        // targetVertex = locationId + '#' +productId + '#' + objType + '#' + edgesData[eIndex].TARGET;
        // weight = edgesData[eIndex].WEIGHT;
        edgeId =  edgesData[eIndex].ID;
        sourceVertex = locationId + '#' +productId + '#' + objType + '#' + edgesData[eIndex].SOURCE;
        targetVertex = locationId + '#' +productId + '#' + objType + '#' + edgesData[eIndex].TARGET;
        weight = edgesData[eIndex].WEIGHT;

        let rowObj = [];
        rowObj.push(edgeId,sourceVertex,targetVertex,weight);

        tableObj.push(rowObj);
    }
    sqlStr = "INSERT INTO EDGES(ID,SOURCE,TARGET,WEIGHT) VALUES(?,?,?,?)";
    stmt = conn.prepare(sqlStr);

    stmt.execBatch(tableObj);
    stmt.drop();
    conn.disconnect();
    console.log(' _updateEdgesData Completed ');

}

exports._runHanaGraphs = async function(req) {

    console.log(" _runHanaGraphs req.data ", req.data);
    
    var conn = hana.createConnection();
 
    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + graphSchema;  
    // console.log('sqlStr: ', sqlStr);            
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    let graphAlgorithm = req.data.ALGORITHM;
    let startVertexId = req.data.LOCATION_ID + '#' +
                        req.data.PRODUCT_ID + '#' +
                        req.data.OBJ_TYPE + '#' + req.data.START_VERTEX_ID;
    let endVertexId = req.data.LOCATION_ID + '#' +
                        req.data.PRODUCT_ID + '#' +
                        req.data.OBJ_TYPE + '#' + req.data.END_VERTEX_ID;
    let tableObj = [];	
    if(graphAlgorithm == 'DFS')
    {

        //  sqlStr = 'call GS_DEPTH_FIRST_SEARCH(' + startVertexId + ', ?)';
        sqlStr = 'SELECT * FROM "F_DEPTH_FIRST_SEARCH"(i_startVertex => ' + "'" + startVertexId + "'" + ') ORDER BY "VISIT_ORDER" ASC';
    
        stmt=conn.prepare(sqlStr);
        // combined process Results
        var dfsResults=stmt.exec();
        stmt.drop();
        
        let oVertex, visitOrder, exitOrder, level;

        for (let rIndex = 0; rIndex < dfsResults.length; rIndex ++)
        {
            oVertex = dfsResults[rIndex].ID;
            visitOrder = dfsResults[rIndex].VISIT_ORDER;
            exitOrder = dfsResults[rIndex].EXIT_ORDER;
            level = dfsResults[rIndex].LEVEL;


            let grpStr = oVertex.split('#');
            let locationId = grpStr[0]; 
            let productId = grpStr[1];
            let objType = grpStr[2];
            let vertexId = grpStr[3];

            rowObj = { START_VERTEX_ID: req.data.START_VERTEX_ID,
                       LOCATION_ID : locationId, 
                       PRODUCT_ID : productId, 
                       OBJ_TYPE : objType,
                       ALGORITHM : graphAlgorithm,
                       VERTEX_ID : vertexId, 
                       VISIT_ORDER : visitOrder,
                       EXIT_ORDER : exitOrder, 
                       LEVEL : level };
            if(visitOrder > 0)
                tableObj.push(rowObj);
        }
        sqlStr = 'DELETE FROM GRAPHS_DFS_VERTICES_SORTED WHERE ' +
                ' START_VERTEX_ID = ' + "'" + req.data.START_VERTEX_ID + "'" + ' AND ' +
                ' LOCATION_ID = ' + "'" + req.data.LOCATION_ID + "'" + ' AND ' +
                ' PRODUCT_ID = ' + "'" + req.data.PRODUCT_ID + "'"+ ' AND ' +
                ' OBJ_TYPE = ' + "'" + req.data.OBJ_TYPE + "'"+ ' AND ' +
                ' ALGORITHM = ' + "'" + req.data.ALGORITHM + "'" ;
        await cds.run(sqlStr);

        console.log("tableObj ", tableObj);

        let cqnQuery = {INSERT:{ into: { ref: ['GRAPHS_DFS_VERTICES_SORTED'] }, entries:  tableObj }};

        await cds.run(cqnQuery);

    }
    else if((graphAlgorithm == 'BFS') ||
            (graphAlgorithm == 'SPOA'))
    {

        if (graphAlgorithm == 'BFS')
        {
            sqlStr = 'SELECT * FROM "F_BREADTH_FIRST_SEARCH_VERTICES"(i_startVertex => ' + "'" + startVertexId + "'" + 
                                        ', i_dir => ' + "'" + req.data.DIRECTION + "'" +
                                        ', i_maxDepth => ' + "'" + req.data.MAX_DEPTH + "'" +')';
        }
        else if(graphAlgorithm == 'SPOA')
        {
            sqlStr = 'SELECT * FROM "F_SPOA_VERTICES"(i_startVertex => ' + "'" + startVertexId + "'" + 
                                        ', i_dir => ' + "'" + req.data.DIRECTION + "'" +
                                        ', i_maxDepth => ' + "'" + req.data.MAX_DEPTH + "'" +')';
        }
        console.log("graphAlgorithm sqlStr =", sqlStr);
        stmt=conn.prepare(sqlStr);
        // combined process Results
        let graphResults=stmt.exec();
        stmt.drop();
        
        let oVertex,oDistance;

        for (let rIndex = 0; rIndex < graphResults.length; rIndex ++)
        {
            oVertex = graphResults[rIndex].ID;
            oDistance = graphResults[rIndex].DISTANCE;
            let grpStr = oVertex.split('#');
            let locationId = grpStr[0]; 
            let productId = grpStr[1];
            let objType = grpStr[2];
            let vertexId = grpStr[3];

            rowObj = { START_VERTEX_ID: req.data.START_VERTEX_ID,
                       LOCATION_ID : locationId, 
                       PRODUCT_ID : productId, 
                       OBJ_TYPE : objType,
                       ALGORITHM : graphAlgorithm,
                       DIRECTION :  req.data.DIRECTION,
                       VERTEX_ID : vertexId, 
                       DISTANCE : oDistance};
            tableObj.push(rowObj);
        }
        sqlStr = 'DELETE FROM GRAPHS_VERTICES_DISTANCE WHERE ' +
                ' START_VERTEX_ID = ' + "'" + req.data.START_VERTEX_ID + "'" + ' AND ' +
                ' DIRECTION = ' + "'" + req.data.DIRECTION + "'" + ' AND ' +
                ' LOCATION_ID = ' + "'" + req.data.LOCATION_ID + "'" + ' AND ' +
                ' PRODUCT_ID = ' + "'" + req.data.PRODUCT_ID + "'"+ ' AND ' +
                ' OBJ_TYPE = ' + "'" + req.data.OBJ_TYPE + "'"+ ' AND ' +
                ' ALGORITHM = ' + "'" + req.data.ALGORITHM + "'" ;
        await cds.run(sqlStr);

        console.log("tableObj ", tableObj);

        let cqnQuery = {INSERT:{ into: { ref: ['GRAPHS_VERTICES_DISTANCE'] }, entries:  tableObj }};

        await cds.run(cqnQuery);

        // GET DISTANCE b/w source & Target Vertice for a given vertex id and direction 
        if (graphAlgorithm == 'BFS')
        {
            sqlStr = 'SELECT * FROM "F_BREADTH_FIRST_SEARCH_VERTICES_EDGES"(i_startVertex => ' + "'" + startVertexId + "'" + 
                                            ',i_dir => ' + "'" + req.data.DIRECTION + "'" +
                                            ',i_maxDepth => ' + "'" + req.data.MAX_DEPTH + "'" +
                                            ') ORDER BY DISTANCE, SOURCE, TARGET  ASC';
        }
        else if (graphAlgorithm == 'SPOA')
        {
            sqlStr = 'SELECT * FROM "F_SPOA_VERTICES_EDGES"(i_startVertex => ' + "'" + startVertexId + "'" + 
                                            ',i_dir => ' + "'" + req.data.DIRECTION + "'" +
                                            ',i_maxDepth => ' + "'" + req.data.MAX_DEPTH + "'" +
                                            ') ORDER BY WEIGHT, SOURCE, TARGET  ASC';
        }
        console.log("graphAlgorithm Vertices & Edges sqlStr =", sqlStr);

        stmt=conn.prepare(sqlStr);
        // combined process Results
        graphResults=stmt.exec();
        stmt.drop();
        
        let lID, sVertex, tVertex;
        tableObj = [];
        for (let rIndex = 0; rIndex < graphResults.length; rIndex ++)
        {
            // lID = rIndex + 1; //graphResults[rIndex].ID;
            sVertex = graphResults[rIndex].SOURCE;
            tVertex = graphResults[rIndex].TARGET;
            oDistance = graphResults[rIndex].DISTANCE;

            if (graphAlgorithm == 'BFS')
            {
            }
            else if (graphAlgorithm == 'SPOA')
            {
                oDistance = graphResults[rIndex].WEIGHT;
            }
            let grpStr = sVertex.split('#');
            let locationId = grpStr[0]; 
            let productId = grpStr[1];
            let objType = grpStr[2];
            let source = grpStr[3];

            grpStr = tVertex.split('#');
            let target = grpStr[3];
            rowObj = { START_VERTEX_ID: req.data.START_VERTEX_ID,
                       LOCATION_ID : locationId, 
                       PRODUCT_ID : productId, 
                       OBJ_TYPE : objType,
                       ALGORITHM : graphAlgorithm,
                       DIRECTION :  req.data.DIRECTION,
                    //    ID : lID, 
                       SOURCE: source,
                       TARGET: target,
                       DISTANCE : oDistance};
            tableObj.push(rowObj);
        }

        sqlStr = 'DELETE FROM GRAPHS_VERTICES_EDGES_DISTANCE WHERE ' +
                ' START_VERTEX_ID = ' + "'" + req.data.START_VERTEX_ID + "'" + ' AND ' +
                ' DIRECTION = ' + "'" + req.data.DIRECTION + "'" + ' AND ' +
                ' LOCATION_ID = ' + "'" + req.data.LOCATION_ID + "'" + ' AND ' +
                ' PRODUCT_ID = ' + "'" + req.data.PRODUCT_ID + "'"+ ' AND ' +
                ' OBJ_TYPE = ' + "'" + req.data.OBJ_TYPE + "'"+ ' AND ' +
                ' ALGORITHM = ' + "'" + req.data.ALGORITHM + "'" ;
        await cds.run(sqlStr);

        console.log("tableObj ", tableObj);

        cqnQuery = {INSERT:{ into: { ref: ['GRAPHS_VERTICES_EDGES_DISTANCE'] }, entries:  tableObj }};

        await cds.run(cqnQuery);

    }
    else if((graphAlgorithm == 'KSPOA') )
    {

        sqlStr = 'SELECT * FROM "F_TKSP"(i_startVertex => ' + "'" + startVertexId + "'" + 
                        ',i_endVertex => ' + "'" + endVertexId + "'" +
                        ',i_k => ' + req.data.K_SHORTEST_PATHS +
                        ')';
        console.log("graphAlgorithm K SHORTEST PATHS sqlStr =", sqlStr);

        stmt=conn.prepare(sqlStr);
        // combined process Results
        graphResults=stmt.exec();
        stmt.drop();
        
        tableObj = [];
        let sVertex = req.data.START_VERTEX_ID;
        let eVertex =  req.data.END_VERTEX_ID;
        let locationId = req.data.LOCATION_ID; 
        let productId = req.data.PRODUCT_ID;
        let objType = req.data.OBJ_TYPE;

        let oPathId, oPathLength, oPathWeight, oEdgeId, oEdgeOrder;

        for (let rIndex = 0; rIndex < graphResults.length; rIndex ++)
        {

            oPathId = graphResults[rIndex].PATH_ID; 
            oPathLength = graphResults[rIndex].PATH_LENGTH; 
            oPathWeight = graphResults[rIndex].PATH_WEIGHT; 
            oEdgeId = graphResults[rIndex].EDGE_ID; 
            oEdgeOrder = graphResults[rIndex].EDGE_ORDER; 

            rowObj = { LOCATION_ID : locationId, 
                       PRODUCT_ID : productId, 
                       OBJ_TYPE : objType,
                       ALGORITHM : graphAlgorithm,
                       START_VERTEX_ID : sVertex,
                       END_VERTEX_ID : eVertex,
                       PATH_ID : oPathId,
                       PATH_LENGTH : oPathLength,
                       PATH_WEIGHT : oPathWeight,
                       EDGE_ID : oEdgeId,
                       EDGE_ORDER : oEdgeOrder};
            tableObj.push(rowObj);
        }

        sqlStr = 'DELETE FROM GRAPHS_K_SHORTEST_PATHS WHERE ' +
                ' START_VERTEX_ID = ' + "'" + req.data.START_VERTEX_ID + "'" + ' AND ' +
                ' END_VERTEX_ID = ' + "'" + req.data.END_VERTEX_ID + "'" + ' AND ' +
                ' LOCATION_ID = ' + "'" + req.data.LOCATION_ID + "'" + ' AND ' +
                ' PRODUCT_ID = ' + "'" + req.data.PRODUCT_ID + "'"+ ' AND ' +
                ' OBJ_TYPE = ' + "'" + req.data.OBJ_TYPE + "'"+ ' AND ' +
                ' ALGORITHM = ' + "'" + req.data.ALGORITHM + "'" ;
        await cds.run(sqlStr);

        console.log("tableObj ", tableObj);

        cqnQuery = {INSERT:{ into: { ref: ['GRAPHS_K_SHORTEST_PATHS'] }, entries:  tableObj }};

        await cds.run(cqnQuery);

    }
    else if((graphAlgorithm == 'NEIGHBORS') )
    {

        sqlStr = 'SELECT * FROM "F_NEIGHBORS_VERTICES_EDGES"(i_startVertex => ' + "'" + startVertexId + "'" + 
                        ',i_minDepth => ' + "'" + req.data.MIN_DEPTH + "'" +
                        ',i_maxDepth => ' + "'" + req.data.MAX_DEPTH + "'" +
                        ',i_dir => ' + "'" + req.data.DIRECTION + "'" +
                        ')';
        console.log("graphAlgorithm Vertices & Edges sqlStr =", sqlStr);

        stmt=conn.prepare(sqlStr);
        // combined process Results
        graphResults=stmt.exec();
        stmt.drop();
        
        let lID, sVertex, tVertex;
        tableObj = [];
        for (let rIndex = 0; rIndex < graphResults.length; rIndex ++)
        {
            // lID = rIndex + 1; //graphResults[rIndex].ID;
            sVertex = graphResults[rIndex].SOURCE;
            tVertex = graphResults[rIndex].TARGET;
            oDistance = 0; // 0 INDICATES DISTANCE is NOT APPLICABLE FOR NEIGHBORS

            let grpStr = sVertex.split('#');
            let locationId = grpStr[0]; 
            let productId = grpStr[1];
            let objType = grpStr[2];
            let source = grpStr[3];

            grpStr = tVertex.split('#');
            let target = grpStr[3];
            rowObj = { START_VERTEX_ID: req.data.START_VERTEX_ID,
                       LOCATION_ID : locationId, 
                       PRODUCT_ID : productId, 
                       OBJ_TYPE : objType,
                       ALGORITHM : graphAlgorithm,
                       DIRECTION :  req.data.DIRECTION,
                    //    ID : lID, 
                       SOURCE: source,
                       TARGET: target,
                       DISTANCE : oDistance};
            tableObj.push(rowObj);
        }

        sqlStr = 'DELETE FROM GRAPHS_VERTICES_EDGES_DISTANCE WHERE ' +
                ' START_VERTEX_ID = ' + "'" + req.data.START_VERTEX_ID + "'" + ' AND ' +
                ' DIRECTION = ' + "'" + req.data.DIRECTION + "'" + ' AND ' +
                ' LOCATION_ID = ' + "'" + req.data.LOCATION_ID + "'" + ' AND ' +
                ' PRODUCT_ID = ' + "'" + req.data.PRODUCT_ID + "'"+ ' AND ' +
                ' OBJ_TYPE = ' + "'" + req.data.OBJ_TYPE + "'"+ ' AND ' +
                ' ALGORITHM = ' + "'" + req.data.ALGORITHM + "'" ;
        await cds.run(sqlStr);

        console.log("tableObj ", tableObj);

        cqnQuery = {INSERT:{ into: { ref: ['GRAPHS_VERTICES_EDGES_DISTANCE'] }, entries:  tableObj }};

        await cds.run(cqnQuery);

    }
    else if((graphAlgorithm == 'TOPOSORT') )
    {

        sqlStr = 'SELECT * FROM "F_TOPOLOGICAL_SORT"()';
        console.log("graphAlgorithm Vertices & Edges sqlStr =", sqlStr);

        stmt=conn.prepare(sqlStr);
        // combined process Results
        graphResults=stmt.exec();
        stmt.drop();
        if ( graphResults.length > 0)
        {
            let sVertex, oExitOrder, oDepth;

            tableObj = [];
            for (let rIndex = 0; rIndex < graphResults.length; rIndex ++)
            {
                let sVertex = graphResults[rIndex].ID;
                let grpStr = sVertex.split('#');
                let locationId = grpStr[0]; 
                let productId = grpStr[1];
                let objType = grpStr[2];                
                oExitOrder = graphResults[rIndex].EXIT_ORDER;
                oDepth = graphResults[rIndex].DEPTH; // 0 INDICATES DISTANCE is NOT APPLICABLE FOR NEIGHBORS
                rowObj = { LOCATION_ID : locationId, 
                        PRODUCT_ID : productId, 
                        OBJ_TYPE : objType,
                        ALGORITHM : graphAlgorithm,
                        VERTEX_ID: grpStr[3],
                        EXIT_ORDER: oExitOrder,
                        DEPTH : oDepth};
                tableObj.push(rowObj);
            }

            sqlStr = 'DELETE FROM GRAPHS_TOPOLOGY_SORTED WHERE ' +
                    ' LOCATION_ID = ' + "'" + req.data.LOCATION_ID + "'" + ' AND ' +
                    ' PRODUCT_ID = ' + "'" + req.data.PRODUCT_ID + "'"+ ' AND ' +
                    ' OBJ_TYPE = ' + "'" + req.data.OBJ_TYPE + "'"+ ' AND ' +
                    ' ALGORITHM = ' + "'" + req.data.ALGORITHM + "'" ;
            await cds.run(sqlStr);

            console.log("tableObj ", tableObj);

            cqnQuery = {INSERT:{ into: { ref: ['GRAPHS_TOPOLOGY_SORTED'] }, entries:  tableObj }};

            await cds.run(cqnQuery);
        }
        else
        {
            console.log(" ERROR graphResults.length = ", graphResults.length);
        }

    }


    let createtAtObj = new Date();
    // let idObj = uuidv1();

    let returnObj = [];	
    let createdAt = createtAtObj;
    // let clustersID = idObj; //uuidObj;
    returnObj.push({createdAt,startVertexId});
    var res = req._.req.res;
    res.send({"value":returnObj});

    console.log('Completed Generating GRAPH Algorithm  Successfully');

    conn.disconnect(function(err) {
    if (err) throw err;
    console.log('disconnected');
    });

}