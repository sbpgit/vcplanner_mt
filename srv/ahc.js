const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
const hana = require('@sap/hana-client');
const ahcFuncs = require('./ahc.js');


exports._runAhcClusters = async function(req) {
    
    console.log("_runAhcClusters STARTED ");

    // console.log("_runAhcClusters data ",req.data);

    await ahcFuncs._updateAhcGroupParams(req);   
  
    // await ahcFuncs._updateAhcGroupData(req);
    await ahcFuncs._updateAhcPrecalcGroupData(req);


    await ahcFuncs._runAhClustersGroup(req); 
    console.log("_runAhcClusters COMPLETED ");

}


exports._updateAhcGroupParams = async function(req) {
    const ahcGroupParams = req.data.clusterParameters;

    // console.log("_updateAhcGroupParams ",ahcGroupParams );
    // var conn = hana.createConnection();

    // conn.connect(conn_params);

    // var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    // var stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();

// ---------- BEGIN OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS
    let inGroups = [];
    let clusterGroup = ahcGroupParams[0].groupId;
    inGroups.push(clusterGroup);
    for (var i in ahcGroupParams)
    { 
        if (i > 0)
        {
            if( ahcGroupParams[i].groupId != ahcGroupParams[i-1].groupId)
            {
                inGroups.push(ahcGroupParams[i].groupId);
            }
        }
    }
    for (let i = 0; i < inGroups.length; i++)
    {
        sqlStr = "DELETE FROM PAL_AHC_PARAMETER_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        // stmt=conn.prepare(sqlStr);
        // stmt.exec();
        // stmt.drop();
        try {
            await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr exception ", sqlStr);
            throw new Error(exception.toString());
        }

    }
// ---------- END OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS

    var tableObj = [];	
        
    for (let i = 0; i < ahcGroupParams.length; i++)
    {
        let groupId = ahcGroupParams[i].groupId ;
        let paramName = ahcGroupParams[i].paramName;
        let intVal =  ahcGroupParams[i].intVal
        let doubleVal = ahcGroupParams[i].doubleVal;
        let strVal = ahcGroupParams[i].strVal;
        // var rowObj = [];
        // rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        let rowObj  = {GROUP_ID:groupId,
            PARAM_NAME:paramName,
            INT_VALUE:intVal,
            DOUBLE_VALUE:doubleVal,
            STRING_VALUE:strVal};
        tableObj.push(rowObj);
        
    }

    //sqlStr = "INSERT INTO PAL_AHC_PARAMETER_GRP_TAB(GROUP_ID,PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE) VALUES(?, ?, ?, ?, ?)";
   
    // stmt = conn.prepare(sqlStr);
    // stmt.execBatch(tableObj);
    // stmt.drop();

    // conn.disconnect();

    cqnQuery = {INSERT:{ into: { ref: ['PAL_AHC_PARAMETER_GRP_TAB'] }, entries:  tableObj }};
    try {
        await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery exception ", cqnQuery);
        throw new Error(exception.toString());
    }


}



exports._updateAhcGroupData = async function(req) {
    const _updateAhcGroupData = req.data.clusterData;

    // console.log("_updateAhcGroupData ", _updateAhcGroupData);

    // var conn = hana.createConnection();

    // conn.connect(conn_params);

    // var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    // var stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();
    sqlStr =  "DELETE FROM PAL_AHC_DATA_GRP_TAB_T";
    try {
            await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }

    // stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();


    var tableObj = [];	

    
    let att1, att2, att3, att4, att5, att6, att7, att8, att9, att10, att11, att12, att13, att14, att15, att16, att17, att18, att19, att20 = 'NA';
    let att21, att22, att23, att24, att25, att26, att27, att28, att29, att30 = 'NA';

    let ID, groupId;
    for (var i = 0; i < ahcGroupData.length; i++)
    {
        groupId = ahcGroupData[i].groupId ;
        ID = ahcGroupData[i].ID;

        att1 = ahcGroupData[i].att1;
        att2 = ahcGroupData[i].att2;
        att3 = ahcGroupData[i].att3;
        att4 = ahcGroupData[i].att4;
        att5 = ahcGroupData[i].att5;
        att6 = ahcGroupData[i].att6;
        att7 = ahcGroupData[i].att7;
        att8 = ahcGroupData[i].att8;
        att9 = ahcGroupData[i].att9;
        att10 = ahcGroupData[i].att10;
        att11 = ahcGroupData[i].att11;
        att12 = ahcGroupData[i].att12;
        att13 = ahcGroupData[i].att13;
        att14 = ahcGroupData[i].att14;
        att15 = ahcGroupData[i].att15;
        att16 = ahcGroupData[i].att16;
        att17 = ahcGroupData[i].att17;
        att18 = ahcGroupData[i].att18;
        att19 = ahcGroupData[i].att19;
        att20 = ahcGroupData[i].att20;
        att21 = ahcGroupData[i].att21;
        att22 = ahcGroupData[i].att22;
        att23 = ahcGroupData[i].att23;
        att24 = ahcGroupData[i].att24;
        att25 = ahcGroupData[i].att25;
        att26 = ahcGroupData[i].att26;
        att27 = ahcGroupData[i].att27;
        att28 = ahcGroupData[i].att28;
        att29 = ahcGroupData[i].att29;
        att30 = ahcGroupData[i].att30;

        // var rowObj = [];
        // rowObj.push(groupId,ID, att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
        //                         att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
        //                         att21,att22,att23,att24,att25,att26,att27,att28,att29,att30);
        let rowObj  = {GROUP_ID:groupId,ID:ID,
                        ATT1:att1, ATT2:att2, ATT3:att3, ATT4:att4, ATT5:att5, 
                        ATT6:att6, ATT7:att7, ATT8:att8, ATT9:att9, ATT10:att10,
                        ATT11:att11, ATT12:att12, ATT13:att13, ATT14:att14, ATT15:att15,
                        ATT16:att16, ATT17:att17, ATT18:att18, ATT19:att19, ATT20:att20,
                        ATT21:att21, ATT22:att22, ATT23:att23, ATT24:att24, ATT25:att25,
                        ATT26:att26, ATT27:att27, ATT28:att28, ATT29:att29, ATT30:att30};

        tableObj.push(rowObj);
    }
    // sqlStr = ' INSERT INTO PAL_AHC_DATA_GRP_TAB_T(GROUP_ID,ID,C1,C2,C3,C4,C5,C6,C7,C8,C9,C10, ' +
    //                     ' C11,C12,C13,C14,C15,C16,C17,C18,C19,C20, ' +
    //                     ' C21,C22,C23,C24,C25,C26,C27,C28,C29,C30) ' +
    //                     ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, '+
    //                     ' ?,?,?,?,?,?,?,?,?,?) ';
    // stmt = conn.prepare(sqlStr);

    // stmt.execBatch(tableObj);
    // stmt.drop();
    // conn.disconnect();
    cqnQuery = {INSERT:{ into: { ref: ['PAL_AHC_DATA_GRP_TAB_T'] }, entries:  tableObj }};
    
    try {
            await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery exception ", cqnQuery);
        throw new Error(exception.toString());
    }
    // console.log(' _updateAhcGroupData Completed ');

}

exports._updateAhcPrecalcGroupData = async function(req) {
    const ahcGroupData = req.data.clusterData;

    // console.log("_updateAhcPrecalcGroupData ahcGroupData ", ahcGroupData );

    // var conn = hana.createConnection();

    // conn.connect(conn_params);

    // var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    // var stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();
    let sqlStr =  "DELETE FROM PAL_PRECALCULATED_DATA_GRP_TAB_T";
    try {
            await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("cqnQuery exception ", sqlStr);
        throw new Error(exception.toString());
    }
    // stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();


    var tableObj = [];	

    let leftPoint, rightPoint, distance;

    // let att1, att2, att3, att4, att5, att6, att7, att8, att9, att10, att11, att12, att13, att14, att15, att16, att17, att18, att19, att20 = 'NA';
    let ID, groupId;
    for (var i = 0; i < ahcGroupData.length; i++)
    {
        groupId = ahcGroupData[i].groupId ;
        // ID = ahcGroupData[i].ID;
        leftPoint = ahcGroupData[i].LEFT_POINT;
        rightPoint = ahcGroupData[i].RIGHT_POINT;
        distance = ahcGroupData[i].DISTANCE;


        // var rowObj = [];
        // rowObj.push(groupId,leftPoint, rightPoint,distance);

        let rowObj  = {GROUP_ID:groupId,LEFT_POINT:leftPoint,RIGHT_POINT:rightPoint,DISTANCE:distance};
        tableObj.push(rowObj);
    }

    // sqlStr = "INSERT INTO PAL_PRECALCULATED_DATA_GRP_TAB_T(GROUP_ID,LEFT_POINT,RIGHT_POINT,DISTANCE) VALUES(?, ?, ?, ?)";
    // stmt = conn.prepare(sqlStr);
    // stmt.execBatch(tableObj);
    // stmt.drop();
    // conn.disconnect();
    cqnQuery = {INSERT:{ into: { ref: ['PAL_PRECALCULATED_DATA_GRP_TAB_T'] }, entries:  tableObj }};
    
    try {
            await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery exception ", cqnQuery);
        throw new Error(exception.toString());
    }
    // let startIdx = 0;
    // let batchSize = 10000;
    // let endIdx = startIdx + batchSize;
    // // let lastIdx = tableObj.length;

    // let numInsertions = 0;
    // while(true)
    // {
    //     let batch = tableObj.slice(startIdx, endIdx);
    //     console.log("_updateAhcPrecalcGroupData batch length ", batch.length);
    //     if( batch !== 0)
    //     {
    //         stmt.execBatch(batch);
    //         numInsertions++;
    //     }
    //     else
    //         break;

    //     startIdx = startIdx + batchSize;
    //     endIdx = startIdx + batchSize;
    // }
    // console.log(" _updateAhcPrecalcGroupData numInsertions ", numInsertions);
    // stmt.execBatch(tableObj);
    // stmt.drop();
    // conn.disconnect();
    // console.log(' _updateAhcGroupData Completed ');

}

exports._runAhClustersGroup = async function(req) {


    // var ahcDataTable = "PAL_AHC_DATA_GRP_TAB_T";
    var ahcDataTable = "PAL_PRECALCULATED_DATA_GRP_TAB_T";

    
    // var conn = hana.createConnection();
 
    // conn.connect(conn_params);

    // var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    // // console.log('sqlStr: ', sqlStr);            
    // var stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();


////////////////////////////////////////////////////////////////////////////////////
    const ahcGroupParams = req.data.clusterParameters;
    const ahcGroupData = req.data.clusterData;

    // console.log(" _runAhClustersGroup ahcGroupParams ", ahcGroupParams);
    // console.log(" _runAhClustersGroup ahcGroupData ", ahcGroupData);


    let inGroups = [];
    let inGroup = ahcGroupParams[0].groupId;
    inGroups.push(inGroup);
    for (var i in ahcGroupParams)
    { 
        if (i > 0)
        {
            if( ahcGroupParams[i].groupId != ahcGroupParams[i-1].groupId)
            {
                inGroups.push(ahcGroupParams[i].groupId);
            }
        }
    }
    for (let i = 0; i < inGroups.length; i++)
    {

        sqlStr = "DELETE FROM PAL_AHC_PRECALC_COMBINE_PROCESS_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        try {
            await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr exception ", sqlStr);
            throw new Error(exception.toString());
        }
        // stmt=conn.prepare(sqlStr);
        // stmt.exec();
        // stmt.drop();

        sqlStr =  "DELETE FROM PAL_AHC_PRECALC_RESULTS_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        try {
            await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr exception ", sqlStr);
            throw new Error(exception.toString());
        }
        // stmt=conn.prepare(sqlStr);
        // stmt.exec();
        // stmt.drop();

    }

    // sqlStr = 'call AHC_MAIN_T(' + ahcDataTable + ', ?,?)';
    // sqlStr = 'call AHC_PRECALCULATED_MAIN_T(' + ahcDataTable + ', ?,?)';


    
    // stmt=conn.prepare(sqlStr);
    // // combined process Results
    // var cpResults=stmt.exec();
    // stmt.drop();
    console.log("Before const db = await cds.connect.to('db')")
    const db = await cds.connect.to('db');
    // Start a manual database transaction
    const tx = db.tx(req);

    sqlStr = 'call "AHC_PRECALCULATED_MAIN_T"(' + ahcDataTable + ', ?,?)';
    console.log("AHC Procedure Execution sqlStr  ", sqlStr);

    let ahcResults;
    try {
        ahcResults = await tx.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }
    
  
    // var cpGroups = [];
    // var cpGroup = cpResults[0].GROUP_ID;
    // cpGroups.push(cpGroup);
    // for (var i in cpResults)
    // { 
    //     if (i > 0)
    //     {
    //         if( cpResults[i].GROUP_ID != cpResults[i-1].GROUP_ID)
    //         {
    //             cpGroups.push(cpResults[i].GROUP_ID);
    //         }
    //     }
    // }

    let cpResults = ahcResults.OT_GROUP_AHC_CP;

  
    let cpTableObj = [];

    for (let i=0; i< cpResults.length; i++)
    {     
        let groupId = cpResults[i].GROUP_ID;
        let STAGE = cpResults[i].STAGE;
        // let LEFT_ID = cpResults[i].LEFT_ID;
        // let RIGHT_ID = cpResults[i].RIGHT_ID;
        let LEFT_ID = cpResults[i].LEFT_LEFT_POINT;
        let RIGHT_ID = cpResults[i].RIGHT_LEFT_POINT;
        let DISTANCE = cpResults[i].DISTANCE;

        let grpStr=groupId.split('#');
        let MODEL_PROFILE = grpStr[0]; 
        let LOCATION_ID = grpStr[1];
        let PRODUCT_ID = grpStr[2];
        // cpTableObj.push({location,product,profileID,GroupId,stage,leftId,rightId,distance});
        cpTableObj.push({LOCATION_ID,PRODUCT_ID,MODEL_PROFILE,STAGE,LEFT_ID,RIGHT_ID,DISTANCE});


        let sqlStr = 'DELETE FROM CP_AHC_COMBINE_PROCESS WHERE ' +
                     ' LOCATION_ID = ' + "'" + LOCATION_ID + "'" + ' AND ' +
                     ' PRODUCT_ID = ' + "'" + PRODUCT_ID + "'"+ ' AND ' +
                     ' MODEL_PROFILE = ' + "'" + MODEL_PROFILE + "'";
        await cds.run(sqlStr);

    }
    // console.log(" cpTableObj ", cpTableObj);
    let cqnQuery = {INSERT:{ into: { ref: ['CP_AHC_COMBINE_PROCESS'] }, entries:  cpTableObj }};

    await cds.run(cqnQuery);

    var clustersTableObj = [];

    for (let i = 0; i < inGroups.length; i++)
    {

        // sqlStr =  "SELECT * FROM PAL_AHC_RESULTS_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        sqlStr =  "SELECT * FROM PAL_AHC_PRECALC_RESULTS_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";

        // stmt=conn.prepare(sqlStr);
        // let clusterResults = stmt.exec();
        // stmt.drop();
        let clusterResults;
        try {
            clusterResults = await tx.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr exception ", sqlStr);
            throw new Error(exception.toString());
        }

        for (let i=0; i< clusterResults.length; i++)
        {     
            let groupId = clusterResults[i].GROUP_ID;
            // let UNIQUE_ID = clusterResults[i].ID;
            let UNIQUE_ID = clusterResults[i].LEFT_POINT;

            let CLUSTER_ID = clusterResults[i].CLUSTER_ID;

            let grpStr=groupId.split('#');

            let MODEL_PROFILE = grpStr[0]; 
            let LOCATION_ID = grpStr[1];
            let PRODUCT_ID = grpStr[2];
            
            clustersTableObj.push({LOCATION_ID,PRODUCT_ID,MODEL_PROFILE,UNIQUE_ID,CLUSTER_ID});

            let sqlStr = 'DELETE FROM CP_AHC_RESULTS WHERE ' +
                        ' LOCATION_ID = ' + "'" + LOCATION_ID + "'" + ' AND ' +
                        ' PRODUCT_ID = ' + "'" + PRODUCT_ID + "'" + ' AND ' +
                        ' MODEL_PROFILE = ' + "'" + MODEL_PROFILE + "'";
            await cds.run(sqlStr);
        }
    }

    // console.log(" clustersTableObj ",clustersTableObj);
    cqnQuery = {INSERT:{ into: { ref: ['CP_AHC_RESULTS'] }, entries:  clustersTableObj }};

    await cds.run(cqnQuery);
   
    let createtAtObj = new Date();
    let idObj = uuidv1();

    let returnObj = [];	
    let createdAt = createtAtObj;
    let clustersID = idObj; //uuidObj;
    returnObj.push({clustersID, createdAt,ahcGroupParams,ahcGroupData});
    var res = req._.req.res;
    res.send({"value":returnObj});

    console.log('Completed Agglomerate Clusters Generation for Groups Successfully');

    // conn.disconnect(function(err) {
    // if (err) throw err;
    // console.log('disconnected');
    // });

}