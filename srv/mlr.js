const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
const hana = require('@sap/hana-client');
const mlrFuncs = require('./mlr.js');

const conn_params = {
    serverNode  : process.env.classicalSchemaNodePort, 
    uid         : process.env.uidClassicalSchema, 
    pwd         : process.env.uidClassicalSchemaPassword,
    encrypt: 'TRUE'
};
const vcConfigTimePeriod = process.env.TimePeriod; 
const classicalSchema = process.env.classicalSchema; 


// const conn_params = {
//     serverNode  : cds.env.requires.db.credentials.host + ":" + cds.env.requires.db.credentials.port,
//     uid         : "SBPTECHTEAM", 
//     pwd         : "Sbpcorp@23",
//     encrypt: 'TRUE'
// };
// const classicalSchema = "DB_CONFIG_PROD_CLIENT1"; 
// const vcConfigTimePeriod = "PERIOD_NUM";

exports._runMlrRegressions = async function(req) {

   
   await mlrFuncs._updateMlrGroupParams (req);
  
   await mlrFuncs._updateMlrGroupData(req);

   await mlrFuncs._runRegressionMlrGroup(req); 
  
}


exports._updateMlrGroupParams = async function(req) {
    const mlrGroupParams = req.data.regressionParameters;

    // console.log('_updateMlrGroupParams: ', mlrGroupParams);         


    var conn = hana.createConnection();

    conn.connect(conn_params);

// ---------- BEGIN OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS
    let inGroups = [];
    let modelGroup = mlrGroupParams[0].groupId;
    inGroups.push(modelGroup);
    for (var i in mlrGroupParams)
    { 
        if (i > 0)
        {
            if( mlrGroupParams[i].groupId != mlrGroupParams[i-1].groupId)
            {
                inGroups.push(mlrGroupParams[i].groupId);


            }
        }
    }

    sqlStr = 'SET SCHEMA ' + classicalSchema;  
    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    for (let i = 0; i < inGroups.length; i++)
    {
        sqlStr = 'DELETE FROM "PAL_MLR_PARAMETER_GRP_TAB" ' + 'WHERE GROUP_ID = ' + "'" + inGroups[i] + "'" ;
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

    }
// ---------- END OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS

    var tableObj = [];	
        
    for (let i = 0; i < mlrGroupParams.length; i++)
    {
        let groupId = mlrGroupParams[i].groupId ;
        let paramName = mlrGroupParams[i].paramName;
        let intVal =  mlrGroupParams[i].intVal
        let doubleVal = mlrGroupParams[i].doubleVal;
        let strVal = mlrGroupParams[i].strVal;
        var rowObj = [];
        rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        tableObj.push(rowObj);
        
    }

    sqlStr = 'INSERT INTO "PAL_MLR_PARAMETER_GRP_TAB"' + '(GROUP_ID,PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE) VALUES(?, ?, ?, ?, ?)';
    stmt = conn.prepare(sqlStr);
    stmt.execBatch(tableObj);
    stmt.drop();

    conn.disconnect();
}

exports._updateMlrGroupData  = async function(req) {
    const mlrGroupData = req.data.regressionData;
    var modelVersion = req.data.modelVersion;

    var mlrType = req.data.mlrType;


    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    // DELETION Moved to After MODEL Generation as Data shall not be stored after Model generation

    // if (mlrType == 1)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_1T"';
    // else if (mlrType == 2)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_2T"';
    // else if (mlrType == 3)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_3T"';
    // else if (mlrType == 4)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_4T"';
    // else if (mlrType == 5)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_5T"';
    // else if (mlrType == 6)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_6T"';
    // else if (mlrType == 7)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_7T"';
    // else if (mlrType == 8)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_8T"';
    // else if (mlrType == 9)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_9T"';
    // else if (mlrType == 10)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_10T"';
    // else if (mlrType == 11)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_11T"';
    // else if (mlrType == 12)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_12T"';
    // else if (mlrType == 13)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_13T"';
    // else if (mlrType == 14)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_14T"';
    // else if (mlrType == 15)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_15T"';
    // else if (mlrType == 16)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_16T"';
    // else if (mlrType == 17)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_17T"';
    // else if (mlrType == 18)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_18T"';
    // else if (mlrType == 19)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_19T"';
    // else if (mlrType == 20)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_20T"';
    // else if (mlrType == 21)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_21T"';
    // else if (mlrType == 22)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_22T"';
    // else if (mlrType == 23)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_23T"';
    // else if (mlrType == 24)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_24T"';
    // else if (mlrType == 25)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_25T"';
    // else if (mlrType == 26)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_26T"';
    // else if (mlrType == 27)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_27T"';
    // else if (mlrType == 28)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_28T"';
    // else if (mlrType == 29)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_29T"';
    // else if (mlrType == 30)
    //     sqlStr = 'DELETE FROM "PAL_MLR_DATA_GRP_TAB_30T"';
    // else
    // {
    //     var res = req._.req.res;
    //     res.send({"Invalid MlrType":mlrType});
    //     return;
    // }

    // stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();


    var tableObj = [];	
    
    let V1, V2, V3, V4, V5, V6, V7, V8, V9, V10;
    let V11, V12, V13, V14, V15, V16, V17, V18, V19, V20;
    let V21, V22, V23, V24, V25, V26, V27, V28, V29, V30, ID, groupId;
    for (var i = 0; i < mlrGroupData.length; i++)
    {
        groupId = mlrGroupData[i].groupId ;
        ID = mlrGroupData[i].ID;

        V1 = mlrGroupData[i].att1;
        if (mlrType > 1)
            V2 =  mlrGroupData[i].att2;
        if (mlrType > 2)
            V3 = mlrGroupData[i].att3;
        if (mlrType > 3)
            V4 = mlrGroupData[i].att4;
        if (mlrType > 4)
            V5 = mlrGroupData[i].att5;
        if (mlrType > 5)
            V6 = mlrGroupData[i].att6;
        if (mlrType > 6)
            V7 = mlrGroupData[i].att7;
        if (mlrType > 7)
            V8 = mlrGroupData[i].att8;
        if (mlrType > 8)
            V9 = mlrGroupData[i].att9;
        if (mlrType > 9)
            V10 = mlrGroupData[i].att10;
        if (mlrType > 10)
            V11 = mlrGroupData[i].att11;
        if (mlrType > 11)
            V12 = mlrGroupData[i].att12;
        if (mlrType > 12)
            V13 = mlrGroupData[i].att13;
        if (mlrType > 13)
            V14 = mlrGroupData[i].att14;
        if (mlrType > 14)
            V15 = mlrGroupData[i].att15;
        if (mlrType > 15)
            V16 = mlrGroupData[i].att16;
        if (mlrType > 16)
            V17 = mlrGroupData[i].att17;
        if (mlrType > 17)
            V18 = mlrGroupData[i].att18;
        if (mlrType > 18)
            V19 = mlrGroupData[i].att19;
        if (mlrType > 19)
            V20 = mlrGroupData[i].att20;
        if (mlrType > 20)
            V21 =  mlrGroupData[i].att21;
        if (mlrType > 21)
            V22 =  mlrGroupData[i].att22;
        if (mlrType > 22)
            V23 = mlrGroupData[i].att23;
        if (mlrType > 23)
            V24 = mlrGroupData[i].att24;
        if (mlrType > 24)
            V25 = mlrGroupData[i].att25;
        if (mlrType > 25)
            V26 = mlrGroupData[i].att26;
        if (mlrType > 26)
            V27 = mlrGroupData[i].att27;
        if (mlrType > 27)
            V28 = mlrGroupData[i].att28;
        if (mlrType > 28)
            V29 = mlrGroupData[i].att29;
        if (mlrType > 29)
            V30 = mlrGroupData[i].att30;

        let Y = mlrGroupData[i].target;

        var rowObj = [];
        if (mlrType == 1)
            rowObj.push(groupId,ID,Y,V1);
        else if (mlrType == 2)
            rowObj.push(groupId,ID,Y,V1,V2);
        else if (mlrType == 3)
            rowObj.push(groupId,ID,Y,V1,V2,V3);
        else if (mlrType == 4)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4);
        else if (mlrType == 5)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5);
        else if (mlrType == 6)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6);
        else if (mlrType == 7)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7);
        else if (mlrType == 8)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8);
        else if (mlrType == 9)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9);
        else if (mlrType == 10)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10);
        else if (mlrType == 11)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11);
        else if (mlrType == 12)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12);
        else if (mlrType == 13)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13);
        else if (mlrType == 14)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14);
        else if (mlrType == 15)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15);       
        else if (mlrType == 16)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16);
        else if (mlrType == 17)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17);
        else if (mlrType == 18)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18);
        else if (mlrType == 19)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19);
        else if (mlrType == 20)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19,V20);
        else if (mlrType == 21)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,
                        V21);       
        else if (mlrType == 22)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,
                        V21,V22);
        else if (mlrType == 23)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,
                        V21,V22,V23);
        else if (mlrType == 24)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,
                        V21,V22,V23,V24);
        else if (mlrType == 25)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,
                        V21,V22,V23,V24,V25);
        else if (mlrType == 26)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,
                        V21,V22,V23,V24,V25,V26);
        else if (mlrType == 27)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,
                        V21,V22,V23,V24,V25,V26,V27);       
        else if (mlrType == 28)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,
                        V21,V22,V23,V24,V25,V26,V27,V28);
        else if (mlrType == 29)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,
                        V21,V22,V23,V24,V25,V26,V27,V28,V29);
        else if (mlrType == 30)
            rowObj.push(groupId,ID, Y, V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,
                        V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,
                        V21,V22,V23,V24,V25,V26,V27,V28,V29,V30);
        tableObj.push(rowObj);
    }
    if (mlrType == 1)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_1T"' + '(GROUP_ID,ID,Y,V1) VALUES(?, ?, ?, ?)';
        stmt = conn.prepare(sqlStr);   
    }
    else if (mlrType == 2)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_2T"' + '(GROUP_ID,ID,Y,V1,V2) VALUES(?, ?, ?, ?, ?)';
        stmt = conn.prepare(sqlStr);   
    }
    else if (mlrType == 3)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_3T"' + '(GROUP_ID,ID,Y,V1,V2,V3) VALUES(?, ?, ?, ?, ?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 4)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_4T"' + '(GROUP_ID,ID,Y,V1,V2,V3,V4) VALUES(?, ?, ?, ?, ?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 5)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_5T"' + '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5) VALUES(?, ?, ?, ?, ?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 6)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_6T"' + '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6) VALUES(?, ?, ?, ?, ?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 7)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_7T"' + '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7) VALUES(?, ?, ?, ?, ?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 8)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_8T"' + '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 9)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_9T"' + '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 10)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_10T"' + '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 11)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_11T"' + '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 12)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_12T"' + '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 13)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_13T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 14)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_14T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 15)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_15T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?)';
        console.log("sqlStr ", sqlStr);
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 16)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_16T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 17)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_17T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 18)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_18T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 19)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_19T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 20)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_20T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19,V20) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 21)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_21T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19,V20,V21) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 22)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_22T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19,V20,V21,V22) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 23)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_23T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19,V20,V21,V22,V23) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 24)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_24T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19,V20,V21,V22,V23,V24) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 25)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_25T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19,V20,V21,V22,V23,V24,V25) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 26)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_26T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 27)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_27T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 28)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_28T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 29)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_29T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28,V29) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrType == 30)
    {
        sqlStr = 'INSERT INTO "PAL_MLR_DATA_GRP_TAB_30T"' + 
                 '(GROUP_ID,ID,Y,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,' +
                 ' V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28,V29,V30) ' +
                 'VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }


    stmt.execBatch(tableObj);
    stmt.drop();
    conn.disconnect();
    console.log(' _updateMlrGroupData Completed ');

}


exports._runRegressionMlrGroup = async function(req) {

    var mlrType = req.data.mlrType;
    var mlrModelVersion = req.data.modelVersion;
    console.log('Executing MLR Regression at GROUP REQ MLR Model Version', mlrModelVersion);


    var mlrDataTable;
    if (mlrType == 1)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_1T";
    else if (mlrType == 2)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_2T";
    else if (mlrType == 3)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_3T";
    else if (mlrType == 4)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_4T";
    else if (mlrType == 5)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_5T";
    else if (mlrType == 6)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_6T";
    else if (mlrType == 7)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_7T";
    else if (mlrType == 8)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_8T";
    else if (mlrType == 9)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_9T";
    else if (mlrType == 10)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_10T";
    else if (mlrType == 11)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_11T";
    else if (mlrType == 12)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_12T";
    else if (mlrType == 13)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_13T";
    else if (mlrType == 14)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_14T";
    else if (mlrType == 15)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_15T";
    else if (mlrType == 16)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_16T";
    else if (mlrType == 17)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_17T";
    else if (mlrType == 18)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_18T";
    else if (mlrType == 19)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_19T";
    else if (mlrType == 20)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_20T";
    else if (mlrType == 21)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_21T";
    else if (mlrType == 22)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_22T";
    else if (mlrType == 23)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_23T";
    else if (mlrType == 24)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_24T";
    else if (mlrType == 25)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_25T";
    else if (mlrType == 26)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_26T";
    else if (mlrType == 27)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_27T";
    else if (mlrType == 28)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_28T";
    else if (mlrType == 29)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_29T";
    else if (mlrType == 30)
        mlrDataTable = "PAL_MLR_DATA_GRP_TAB_30T";
    var conn = hana.createConnection();
 
    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();
    const mlrGroupParams = req.data.regressionParameters;

    let inGroups = [];
    let modelGroup = mlrGroupParams[0].groupId;
    inGroups.push(modelGroup);
    for (var i in mlrGroupParams)
    { 
        if (i > 0)
        {
            if( mlrGroupParams[i].groupId != mlrGroupParams[i-1].groupId)
            {
                inGroups.push(mlrGroupParams[i].groupId);

            }
        }
    }

    for (let i = 0; i < inGroups.length; i++)
    {
        sqlStr = 'DELETE FROM "PAL_MLR_COEFFICIENT_GRP_TAB" ' + 'WHERE GROUP_ID = ' + "'" + inGroups[i] + "'" ;
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  'DELETE FROM "PAL_MLR_PMML_GRP_TAB" ' + 'WHERE GROUP_ID = ' + "'" + inGroups[i] + "'" ;
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  'DELETE FROM "PAL_MLR_FITTED_GRP_TAB" ' + 'WHERE GROUP_ID = ' + "'" + inGroups[i] + "'" ;
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  'DELETE FROM "PAL_MLR_STATISTICS_GRP_TAB" ' + 'WHERE GROUP_ID = ' + "'" + inGroups[i] + "'" ;
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  'DELETE FROM "PAL_MLR_OPTIMAL_PARAM_GRP_TAB" ' + 'WHERE GROUP_ID = ' + "'" + inGroups[i] + "'" ;
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

    }



    if (mlrType == 1)
        sqlStr = 'call "MLR_MAIN_1T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 2)
        sqlStr = 'call "MLR_MAIN_2T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 3)
        sqlStr = 'call "MLR_MAIN_3T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 4)
        sqlStr = 'call "MLR_MAIN_4T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 5)
        sqlStr = 'call "MLR_MAIN_5T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 6)
        sqlStr = 'call "MLR_MAIN_6T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 7)
        sqlStr = 'call "MLR_MAIN_7T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 8)
        sqlStr = 'call "MLR_MAIN_8T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 9)
        sqlStr = 'call "MLR_MAIN_9T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 10)
        sqlStr = 'call "MLR_MAIN_10T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 11)
        sqlStr = 'call "MLR_MAIN_11T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 12)
        sqlStr = 'call "MLR_MAIN_12T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 13)
        sqlStr = 'call "MLR_MAIN_13T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 14)
        sqlStr = 'call "MLR_MAIN_14T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 15)
        sqlStr = 'call "MLR_MAIN_15T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 16)
        sqlStr = 'call "MLR_MAIN_16T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 17)
        sqlStr = 'call "MLR_MAIN_17T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 18)
        sqlStr = 'call "MLR_MAIN_18T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 19)
        sqlStr = 'call "MLR_MAIN_19T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 20)
        sqlStr = 'call "MLR_MAIN_20T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 21)
        sqlStr = 'call "MLR_MAIN_21T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 22)
        sqlStr = 'call "MLR_MAIN_22T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 23)
        sqlStr = 'call "MLR_MAIN_23T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 24)
        sqlStr = 'call "MLR_MAIN_24T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 25)
        sqlStr = 'call "MLR_MAIN_25T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 26)
        sqlStr = 'call "MLR_MAIN_26T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 27)
        sqlStr = 'call "MLR_MAIN_27T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 28)
        sqlStr = 'call "MLR_MAIN_28T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 29)
        sqlStr = 'call "MLR_MAIN_29T"(' + mlrDataTable + ', ?,?,?,?,?)';
    else if (mlrType == 30)
        sqlStr = 'call "MLR_MAIN_30T"(' + mlrDataTable + ', ?,?,?,?,?)';
    // stmt=conn.prepare(sqlStr);
    // var coefficientResults=stmt.exec();
    // stmt.drop();
    var coefficientResults = await mlrFuncs._execAsync(conn, sqlStr);
    var coefficientsObj = [];

    for (var i=0; i< coefficientResults.length; i++)
    {     
        let groupId = coefficientResults[i].GROUP_ID;
        let variableName = coefficientResults[i].VARIABLE_NAME;
        let coefficientValue = coefficientResults[i].COEFFICIENT_VALUE;
        let tValue = coefficientResults[i].T_VALUE;
        let pValue = coefficientResults[i].P_VALUE;

        coefficientsObj.push({groupId,variableName,coefficientValue,tValue,pValue});
    }
    

    var pmmlObj = [];

    sqlStr =  'SELECT * FROM "PAL_MLR_PMML_GRP_TAB" WHERE GROUP_ID IN (SELECT GROUP_ID FROM ' + mlrDataTable + ')';
    stmt=conn.prepare(sqlStr);
    let pmmlResults = stmt.exec();
    stmt.drop();

    for (let i=0; i< pmmlResults.length; i++)
    {     
        let groupId = pmmlResults[i].GROUP_ID;
        let rowIndex = pmmlResults[i].ROW_INDEX;
        let modelContent = pmmlResults[i].MODEL_CONTENT;
        pmmlObj.push({groupId,rowIndex,modelContent});
    }

    var fittedObj = [];

    sqlStr =  'SELECT * FROM "PAL_MLR_FITTED_GRP_TAB" WHERE GROUP_ID IN (SELECT GROUP_ID FROM ' + mlrDataTable + ')';
    stmt=conn.prepare(sqlStr);
    let fittedResults = stmt.exec();
    stmt.drop();

    for (let i=0; i< fittedResults.length; i++)
    {     
        let groupId = fittedResults[i].GROUP_ID;
        let ID = fittedResults[i].ID;
        let value = fittedResults[i].VALUE;
        fittedObj.push({groupId,ID,value});
    }


    var statisticsObj = [];

    sqlStr =  'SELECT * FROM "PAL_MLR_STATISTICS_GRP_TAB" WHERE GROUP_ID IN (SELECT GROUP_ID FROM ' + mlrDataTable + ')';
    stmt=conn.prepare(sqlStr);
    let statResults = stmt.exec();
    stmt.drop();

    for (let i=0; i< statResults.length; i++)
    {     
        let groupId = statResults[i].GROUP_ID;
        let statName = statResults[i].STAT_NAME;
        let statValue = statResults[i].STAT_VALUE;
        statisticsObj.push({groupId,statName,statValue});
    }

    var paramSelectionObj = [];

    sqlStr =  'SELECT * FROM "PAL_MLR_OPTIMAL_PARAM_GRP_TAB" WHERE GROUP_ID IN (SELECT GROUP_ID FROM ' + mlrDataTable + ')';
    stmt=conn.prepare(sqlStr);
    let paramSelectionResults = stmt.exec();
    stmt.drop();


    for (let i=0; i< paramSelectionResults.length; i++)
    {     
        let groupId = paramSelectionResults[i].GROUP_ID;
        let paramName = paramSelectionResults[i].PARAM_NAME;
        let intVal = paramSelectionResults[i].INT_VALUE;
        let doubleVal = paramSelectionResults[i].DOUBLE_VALUE;
        let strVal = paramSelectionResults[i].STRING_VALUE;

        
        paramSelectionObj.push({groupId,paramName,intVal,doubleVal,strVal});
    }


    var createtAtObj = new Date();
    let idObj = uuidv1();
    
    let returnObj = [];	
    let createdAt = createtAtObj;
 
    let mlrID = idObj; //uuidObj;
 
    regressionParameters = req.data.regressionParameters;
 
    mlrType = req.data.mlrType;
 
    let regressionData = req.data.regressionData;
 
    let coefficientOp = coefficientsObj;
    let pmmlOp = pmmlObj;
    let fittedOp = fittedObj;
    let statisticsOp = statisticsObj;
 
    let optimalParamOp = paramSelectionObj;

    returnObj.push({mlrID, createdAt,regressionParameters,mlrType,regressionData,coefficientOp, pmmlOp,fittedOp,statisticsOp,optimalParamOp});

    inGroups = [];
    modelGroup = regressionParameters[0].groupId;
    inGroups.push(modelGroup);
    for (let i in regressionParameters)
    { 
        if (i > 0)
        {
            if( regressionParameters[i].groupId != regressionParameters[i-1].groupId)
            {
                inGroups.push(regressionParameters[i].groupId);
            }
        }
    }

     var tableObj = [];	

    for (let grpIndex = 0; grpIndex < inGroups.length; grpIndex++)
    {
        let statsGroupObj = [];
        let coeffsGroupObj = [];
        let paramsGroupObj = [];
        let fittedGroupObj = [];	
        let paramSelectionGroupObj = [];

        
        for (let i = 0; i < regressionParameters.length; i++)
        {
            if (inGroups[grpIndex] == regressionParameters[i].groupId)
            {            
                let paramName = regressionParameters[i].paramName;
                let intVal =  regressionParameters[i].intVal
                let doubleVal = regressionParameters[i].doubleVal;
                let strVal = regressionParameters[i].strVal;
                paramsGroupObj.push({paramName,intVal,doubleVal,strVal});
            }
        }
        for (let i=0; i< fittedResults.length; i++)
        {     
            if (inGroups[grpIndex] == fittedResults[i].GROUP_ID)
            {
                let ID = fittedResults[i].ID;
                let value = fittedResults[i].VALUE;
                fittedGroupObj.push({ID,value});
            }
        }
        for (let i=0; i< statResults.length; i++)
        {     
            if (inGroups[grpIndex] == statResults[i].GROUP_ID)
            {
                let statName = statResults[i].STAT_NAME;
                let statValue = statResults[i].STAT_VALUE;
                statsGroupObj.push({statName,statValue});
            }
        }
        for (let i=0; i< paramSelectionResults.length; i++)
        {     
            if (inGroups[grpIndex] == paramSelectionResults[i].GROUP_ID)
            {
                let paramName = paramSelectionResults[i].PARAM_NAME;
                let intVal = paramSelectionResults[i].INT_VALUE;
                let doubleVal = paramSelectionResults[i].DOUBLE_VALUE;
                let strVal = paramSelectionResults[i].STRING_VALUE;
                paramSelectionGroupObj.push({paramName,intVal,doubleVal,strVal});
            }            
        }
        for (let i=0; i< coefficientResults.length; i++)
        {     
            if (inGroups[grpIndex] == coefficientResults[i].GROUP_ID)
            {
                let variableName = coefficientResults[i].VARIABLE_NAME;
                let coefficientValue = coefficientResults[i].COEFFICIENT_VALUE;
                let tValue = coefficientResults[i].T_VALUE;
                let pValue = coefficientResults[i].P_VALUE;
                coeffsGroupObj.push({variableName,coefficientValue,tValue,pValue});
            }
        }

        let grpStr=inGroups[grpIndex].split('#');
        // let grpStr=inGroups[grpIndex].split("'");

        let profileID = grpStr[0]; 
        let type = grpStr[1];
        let GroupId = grpStr[2];

        // get location from grpStr
        let loc_start_index = profileID.length + 1 + type.length + 1 + GroupId.length + 1;
        let loc_length = 4;
        let location = inGroups[grpIndex].substr(loc_start_index, loc_length);
        // let location = grpStr[3];
        // product start index = location end Index + 1(For 0 based index) + 1 (for Hash)
        let product_start_index = loc_start_index + loc_length + 1;
        let product = inGroups[grpIndex].substr(product_start_index);
        // let product = grpStr[4];
        console.log("grpStr ", grpStr);
        console.log("profileId", profileID, "type ", type, "GroupId", GroupId, "location ", location, "product", product);
        console.log("_runRegressionMLRGroup  grpStr ", grpStr, "profileID ",profileID, "type ", type, "GroupId ",GroupId, " location ", location, " product ", product);

        var rowObj = {   mlrGroupID: idObj, 
            createdAt : createtAtObj.toISOString(), 
            Location : location,
            Product : product,
            groupId : GroupId,
            Type : type,
            modelVersion : mlrModelVersion,
            profile : profileID,
            regressionParameters:paramsGroupObj, 
            mlrType : req.data.mlrType,
            coefficientOp : coeffsGroupObj,
            fittedOp : fittedGroupObj,
            statisticsOp : statsGroupObj,
            optimalParamOp : paramSelectionGroupObj};
        tableObj.push(rowObj);

        let objStr = GroupId;

        let lastIndex = objStr.lastIndexOf('_');
        let obj_dep = objStr.slice(0, lastIndex);

        let obj_counter = objStr.slice(lastIndex + 1);

        sqlStr = 'UPSERT "CP_OD_MODEL_VERSIONS" VALUES (' +
                    "'" + location + "'" + "," +
                    "'" + product + "'" + "," +
                    "'" + obj_dep + "'" + "," +
                    "'" + obj_counter + "'" + "," +
                    "'" + type + "'" + "," +
                    "'" + 'MLR' + "'" + "," +
                    "'" + mlrModelVersion + "'" + "," +
                    "'" + profileID  + "'" + "," +
                    "'" + req.data.mlrType +  "'" + "," +
                    "'" + createtAtObj.toISOString() + "'" + ')' + ' WITH PRIMARY KEY';            
        console.log("CP_OD_MODEL_VERSIONS MLR sql update sqlStr", sqlStr);

        await cds.run(sqlStr);

         /********* Begin of Disable this part to View Input Data & Profile parameters */
                // DELETE INPUT DATA & PARAMETERS AFTER MODEL GENERATION
                const mlrType = req.data.mlrType;
                const groupId = inGroups[grpIndex]; //inGroups[i];
        
                // Validate input early
                if (mlrType < 1 || mlrType > 30) {
                    return req.error(400, `Invalid mlrType: ${mlrType}`);
                }
        
                // Construct table name dynamically
                const tableName = `PAL_MLR_DATA_GRP_TAB_${mlrType}T`;
                console.log("MLR tableName ", tableName, "groupId ", groupId);
        
       
                try {
        
                    // Optional: avoid SET SCHEMA if already configured in connection
                    conn.exec(`SET SCHEMA ${classicalSchema}`);
                    
                    // Delete from dynamic table
                    let stmt = conn.prepare(
                        `DELETE FROM ${tableName} WHERE GROUP_ID = ?`
                    );
                    stmt.exec([groupId]);
                    stmt.drop();
        
        
                    // Delete from parameter table
                    stmt = conn.prepare(
                        `DELETE FROM PAL_MLR_PARAMETER_GRP_TAB WHERE GROUP_ID = ?`
                    );
                    stmt.exec([groupId]);
                    stmt.drop();
        
                } catch (err) {
                    console.error("DB Error:", err);
                    req.error(500, err.message);
                }
                
            /********* End of Disable this part to View Data & Profile parameters */
        
    }


    // cqnQuery = {INSERT:{ into: { ref: ['CP_PALMLRBYGROUP'] }, entries:  tableObj }};

    // cds.run(cqnQuery);


    var res = req._.req.res;
    


    console.log('headersSent Before Send:', res.headersSent); // false

    res.send({"value":returnObj});
    console.log('headersSent After Send:', res.headersSent); // false

    console.log('Completed MLR Regression Models Generation for Groups Successfully');

    conn.disconnect(function(err) {
    if (err) throw err;
    console.log('disconnected');
    });
  
}


exports._runMlrPredictions = async function(req) {
  
   var groupId = req.data.profile + '#' + req.data.Type + '#' +  req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

   var conn = hana.createConnection();

   conn.connect(conn_params);

   var sqlStr = 'SET SCHEMA ' + classicalSchema;  
   var stmt=conn.prepare(sqlStr);
   var results=stmt.exec();
   stmt.drop();

   sqlStr = 'SELECT COUNT(DISTINCT "GROUP_ID") AS "ModelExists" FROM "PAL_MLR_COEFFICIENT_GRP_TAB" WHERE "GROUP_ID" = ' + "'" + groupId + "'";
   stmt=conn.prepare(sqlStr);
   results = stmt.exec();
   stmt.drop();
   console.log('_runMlrPredictions - sqlStr : ', sqlStr);            

   var modelExists = results[0].ModelExists;
   console.log('_runMlrPredictions - modelExists: ', modelExists);            

   if (modelExists == 0)
   {
      let predResults = [];
      var responseMessage = " Model Does not Exist For groupId : " + groupId;
      predResults.push(responseMessage);
      console.log('_runMlrPredictions : Model Does not Exist For groupId', groupId); 
      let res = req._.req.res;
      res.statusCode = 400;
      res.send({"value":predResults});
      conn.disconnect(); 
      return;          
   }
   conn.disconnect(); 

   await mlrFuncs._updateMlrPredictionParams (req);
  
   await mlrFuncs._updateMlrPredictionData(req);

   await mlrFuncs._runPredictionMlrGroup(req); 
  
}


exports._updateMlrPredictionParams = async function(req) {

    const mlrPredictParams = req.data.predictionParameters;
  
    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    sqlStr = 'DELETE FROM "PAL_MLR_PREDICT_PARAMETER_GRP_TAB"';

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    var tableObj = [];	
        
    for (var i = 0; i < mlrPredictParams.length; i++)
    {
        let groupId = mlrPredictParams[i].groupId ;
        let paramName = mlrPredictParams[i].paramName;
        let intVal =  mlrPredictParams[i].intVal
        let doubleVal = mlrPredictParams[i].doubleVal;
        let strVal = mlrPredictParams[i].strVal;
        var rowObj = [];
        rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        tableObj.push(rowObj);
    }


    sqlStr = 'INSERT INTO "PAL_MLR_PREDICT_PARAMETER_GRP_TAB"(GROUP_ID,PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE) VALUES(?, ?, ?, ?, ?)';
    stmt = conn.prepare(sqlStr);
    stmt.execBatch(tableObj);
    stmt.drop();

    conn.disconnect();

}

exports._updateMlrPredictionData = async function(req) {

    const mlrPredictData = req.data.predictionData;

    var mlrpType = req.data.mlrpType;

    let predGroupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;


    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    // DELETION Moved to After Predictions  Generation as Data shall not be stored after Predictions

    // if (mlrpType == 1)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_1T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 2)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_2T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 3)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_3T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 4)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_4T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 5)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_5T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 6)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_6T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 7)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_7T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 8)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_8T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 9)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_9T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 10)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_10T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 11)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_11T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 12)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_12T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 13)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_13T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 14)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_14T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 15)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_15T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 16)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_16T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 17)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_17T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 18)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_18T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 19)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_19T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 20)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_20T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 21)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_21T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 22)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_22T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 23)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_23T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 24)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_24T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 25)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_25T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 26)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_26T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 27)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_27T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 28)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_28T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 29)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_29T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else if (mlrpType == 30)
    //     sqlStr = 'DELETE FROM PAL_MLR_PRED_DATA_GRP_TAB_30T  WHERE GROUP_ID = ' + "'" + predGroupId + "'";
    // else
    // {
    //     var res = req._.req.res;
    //     res.send({"Invalid MlrpType":mlrpType});
    //     return;
    // }

    // console.log("sqlStr ", sqlStr);
    // stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();

    var tableObj = [];	
    
    let V1, V2, V3, V4, V5, V6, V7, V8, V9, V10, V11, V12, ID, groupId;
    for (var i = 0; i < mlrPredictData.length; i++)
    {
        groupId = mlrPredictData[i].groupId ;
        ID = mlrPredictData[i].ID;

        V1 = mlrPredictData[i].att1;
        if (mlrpType > 1)
            V2 =  mlrPredictData[i].att2;
        if (mlrpType > 2)
            V3 = mlrPredictData[i].att3;
        if (mlrpType > 3)
            V4 = mlrPredictData[i].att4;
        if (mlrpType > 4)
            V5 = mlrPredictData[i].att5;
        if (mlrpType > 5)
            V6 = mlrPredictData[i].att6;
        if (mlrpType > 6)
            V7 = mlrPredictData[i].att7;
        if (mlrpType > 7)
            V8 = mlrPredictData[i].att8;
        if (mlrpType > 8)
            V9 = mlrPredictData[i].att9;
        if (mlrpType > 9)
            V10 = mlrPredictData[i].att10;
        if (mlrpType > 10)
            V11 = mlrPredictData[i].att11;
        if (mlrpType > 11)
            V12 = mlrPredictData[i].att12;
        if (mlrpType > 12)
            V13 = mlrPredictData[i].att13;
        if (mlrpType > 13)
            V14 = mlrPredictData[i].att14;
        if (mlrpType > 14)
            V15 = mlrPredictData[i].att15;
        if (mlrpType > 15)
            V16 = mlrPredictData[i].att16;
        if (mlrpType > 16)
            V17 = mlrPredictData[i].att17;
        if (mlrpType > 17)
            V18 = mlrPredictData[i].att18;
        if (mlrpType > 18)
            V19 = mlrPredictData[i].att19;
        if (mlrpType > 19)
            V20 = mlrPredictData[i].att20;
        if (mlrpType > 20)
            V21 =  mlrPredictData[i].att21;
        if (mlrpType > 21)
            V22 =  mlrPredictData[i].att22;
        if (mlrpType > 22)
            V23 = mlrPredictData[i].att23;
        if (mlrpType > 23)
            V24 = mlrPredictData[i].att24;
        if (mlrpType > 24)
            V25 = mlrPredictData[i].att25;
        if (mlrpType > 25)
            V26 = mlrPredictData[i].att26;
        if (mlrpType > 26)
            V27 = mlrPredictData[i].att27;
        if (mlrpType > 27)
            V28 = mlrPredictData[i].att28;
        if (mlrpType > 28)
            V29 = mlrPredictData[i].att29;
        if (mlrpType > 29)
            V30 = mlrPredictData[i].att30;
        var rowObj = [];
        if (mlrpType == 1)
            rowObj.push(groupId,ID,V1);
        else if (mlrpType == 2)
            rowObj.push(groupId,ID,V1,V2);
        else if (mlrpType == 3)
            rowObj.push(groupId,ID,V1,V2,V3);
        else if (mlrpType == 4)
            rowObj.push(groupId,ID,V1,V2,V3,V4);
        else if (mlrpType == 5)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5);
        else if (mlrpType == 6)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6);
        else if (mlrpType == 7)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7);
        else if (mlrpType == 8)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8);
        else if (mlrpType == 9)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9);
        else if (mlrpType == 10)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10);
        else if (mlrpType == 11)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11);
        else if (mlrpType == 12)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12);
        else if (mlrpType == 13)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13);
        else if (mlrpType == 14)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14);
        else if (mlrpType == 15)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15);
        else if (mlrpType == 16)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16);
        else if (mlrpType == 17)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17);
        else if (mlrpType == 18)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18);
        else if (mlrpType == 19)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19);
        else if (mlrpType == 20)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19,V20);
        else if (mlrpType == 21)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19,V20,V21);
        else if (mlrpType == 22)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19,V20,V21,V22);
        else if (mlrpType == 23)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19,V20,V21,V22,V23);
        else if (mlrpType == 24)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19,V20,V21,V22,V23,V24);
        else if (mlrpType == 25)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19,V20,V21,V22,V23,V24,V25);
        else if (mlrpType == 26)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26);
        else if (mlrpType == 27)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27);
        else if (mlrpType == 28)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28);
        else if (mlrpType == 29)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28,V29);
        else if (mlrpType == 30)
            rowObj.push(groupId,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,
                        V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28,V29,V30);
        tableObj.push(rowObj);
    }
    if (mlrpType == 1)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_1T(GROUP_ID,ID,V1) VALUES(?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (mlrpType == 2)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_2T(GROUP_ID,ID,V1,V2) VALUES(?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (mlrpType == 3)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_3T(GROUP_ID,ID,V1,V2,V3) VALUES(?, ?, ?, ?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 4)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_4T(GROUP_ID,ID,V1,V2,V3,V4) VALUES(?, ?, ?, ?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 5)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_5T(GROUP_ID,ID,V1,V2,V3,V4,V5) VALUES(?, ?, ?, ?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 6)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_6T(GROUP_ID,ID,V1,V2,V3,V4,V5,V6) VALUES(?, ?, ?, ?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 7)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_7T(GROUP_ID,ID,V1,V2,V3,V4,V5,V6,V7) VALUES(?, ?, ?, ?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 8)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_8T(GROUP_ID,ID,V1,V2,V3,V4,V5,V6,V7,V8) VALUES(?, ?, ?, ?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 9)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_9T(GROUP_ID,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 10)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_10T(GROUP_ID,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 11)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_11T(GROUP_ID,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 12)
    {
        sqlStr = "INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_12T(GROUP_ID,ID,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 13)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_13T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 14)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_14T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 15)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_15T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 16)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_16T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 17)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_17T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 18)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_18T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 19)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_19T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 20)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_20T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 21)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_21T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 22)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_22T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21,V22) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 23)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_23T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21,V22,V23) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 24)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_24T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21,V22,V23,V24) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 25)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_25T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21,V22,V23,V24,V25) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 26)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_26T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 27)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_27T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 28)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_28T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 29)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_29T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28,V29) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (mlrpType == 30)
    {
        sqlStr = 'INSERT INTO PAL_MLR_PRED_DATA_GRP_TAB_30T(GROUP_ID,ID,' +
                 ' V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15,V16,V17,V18,V19,V20,V21,V22,V23,V24,V25,V26,V27,V28,V29,V30) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    console.log(' _updateMlrPredictionData sqlStr ', sqlStr);

    stmt.execBatch(tableObj);
    stmt.drop();
    conn.disconnect();
    console.log(' _updateMlrPredictionData Completed ');
}

exports._runPredictionMlrGroup = async function(req) {

    var conn = hana.createConnection();
 
    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    var results=stmt.exec();
    stmt.drop();

    var mlrpType = req.data.mlrpType;
    var version = req.data.Version;
    var scenario = req.data.Scenario;
    var modelVersion = req.data.modelVersion;
    let impactAnalysis = req.data.impactAnalysis;
    let startDate = req.data.startDate;
    let endDate = req.data.endDate;

    let predGroupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

    var conn = hana.createConnection();

    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    let predictionObj = await mlrFuncs._runMlrPrediction(req,mlrpType, predGroupId, version, scenario,modelVersion, impactAnalysis, startDate, endDate);

    let predResults = [];
    predResults.push(predictionObj);
    let res = req._.req.res;
    res.send({"value":predResults});
    conn.disconnect();

}


exports._runMlrPrediction = async function (req, mlrpType, predGroupId, version, scenario, modelVersion, impactAnalysis, startDate, endDate) {

    console.log('_runMlrPrediction - predGroupId', predGroupId, 'Version ', version, 'Scenario ', scenario,'Model Version', modelVersion);

    var conn = hana.createConnection();
 
    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    var result=stmt.exec();
    stmt.drop();

    let tabGroupId = predGroupId.replace(/-|"|'/g, '');
    let coeffTableId = '"' + "#PAL_FMLR_COEFICIENT_TBL_" + tabGroupId + '"';
    let predTableId = '"' + "#PAL_FMLR_PREDICTDATA_TAB_" + tabGroupId + '"';
    let GroupId = req.data.groupId; //primaryId;

    sqlStr = "create local temporary column table " + coeffTableId + " " + 
                    "(\"Coefficient\" varchar(50),\"CoefficientValue\" DOUBLE)";

    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();

    var predDataObj = [];	
    if (mlrpType == 1)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"ID\" integer,\"V1\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1" FROM "PAL_MLR_PRED_DATA_GRP_TAB_1T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_1T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "V1" FROM "PAL_MLR_PRED_DATA_GRP_TAB_1T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_1T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        var predData = result;

        for (var i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            predDataObj.push({GroupId,id,att1});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM "PAL_MLR_COEFFICIENT_GRP_TAB" WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    
    }
    else if (mlrpType == 2)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"ID\" integer,\"V1\" double,\"V2\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2" FROM "PAL_MLR_PRED_DATA_GRP_TAB_2T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_2T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "V1", "V2" FROM "PAL_MLR_PRED_DATA_GRP_TAB_2T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_2T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        var predData = result;

        for (var i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            predDataObj.push({GroupId,id,att1,att2});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM "PAL_MLR_COEFFICIENT_GRP_TAB" WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1','V2'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    
    }
    else if(mlrpType == 3)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3" FROM "PAL_MLR_PRED_DATA_GRP_TAB_3T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_3T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "V1", "V2", "V3" FROM "PAL_MLR_PRED_DATA_GRP_TAB_3T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_3T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData =stmt.exec();
        stmt.drop();

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            predDataObj.push({GroupId,id,att1,att2,att3});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM "PAL_MLR_COEFFICIENT_GRP_TAB" WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1','V2','V3'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 4)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4" FROM "PAL_MLR_PRED_DATA_GRP_TAB_4T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_4T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4" FROM "PAL_MLR_PRED_DATA_GRP_TAB_4T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_4T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            predDataObj.push({GroupId,id,att1,att2,att3,att4});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM "PAL_MLR_COEFFICIENT_GRP_TAB" WHERE GROUP_ID = ' 
                    + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1','V2','V3','V4'" + ')';
        
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 5)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5" FROM "PAL_MLR_PRED_DATA_GRP_TAB_5T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_5T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5" FROM "PAL_MLR_PRED_DATA_GRP_TAB_5T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_5T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM "PAL_MLR_COEFFICIENT_GRP_TAB" WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5'" + ')';

        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 6)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6" FROM PAL_MLR_PRED_DATA_GRP_TAB_6T WHERE PAL_MLR_PRED_DATA_GRP_TAB_6T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6" FROM PAL_MLR_PRED_DATA_GRP_TAB_6T WHERE PAL_MLR_PRED_DATA_GRP_TAB_6T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6'" + ')';

        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 7)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,\"V7\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId +' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7" FROM "PAL_MLR_PRED_DATA_GRP_TAB_7T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_7T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7" FROM "PAL_MLR_PRED_DATA_GRP_TAB_7T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_7T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId +' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM "PAL_MLR_COEFFICIENT_GRP_TAB" WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7'" + ')';

        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 8)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,\"V7\" double,\"V8\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + '"#PAL_FMLR_PREDICTDATA_TAB_' + predGroupId + '"'  + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8" FROM "PAL_MLR_PRED_DATA_GRP_TAB_8T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_8T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8" FROM "PAL_MLR_PRED_DATA_GRP_TAB_8T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_8T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 9)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,\"V7\" double,\"V8\" double,\"V9\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9" FROM PAL_MLR_PRED_DATA_GRP_TAB_9T WHERE PAL_MLR_PRED_DATA_GRP_TAB_9T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9" FROM PAL_MLR_PRED_DATA_GRP_TAB_9T WHERE PAL_MLR_PRED_DATA_GRP_TAB_9T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 10)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10" FROM "PAL_MLR_PRED_DATA_GRP_TAB_10T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_10T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10" FROM "PAL_MLR_PRED_DATA_GRP_TAB_10T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_10T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 11)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11" FROM "PAL_MLR_PRED_DATA_GRP_TAB_11T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_11T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11" FROM "PAL_MLR_PRED_DATA_GRP_TAB_11T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_11T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 12)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12" FROM "PAL_MLR_PRED_DATA_GRP_TAB_12T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_12T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12" FROM "PAL_MLR_PRED_DATA_GRP_TAB_12T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_12T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 13)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13" FROM "PAL_MLR_PRED_DATA_GRP_TAB_13T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_13T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_13T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_13T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 14)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" FROM "PAL_MLR_PRED_DATA_GRP_TAB_14T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_14T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_14T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_14T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 15)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15"  FROM "PAL_MLR_PRED_DATA_GRP_TAB_15T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_15T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V15" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_15T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_15T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 16)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_16T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_16T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_16T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_16T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16' " + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 17)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_17T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_17T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_17T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_17T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17' " + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 18)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_18T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_18T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_18T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_18T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18' " + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 19)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_19T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_19T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_19T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_19T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19' " + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 20)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double,\"V20\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_20T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_20T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19", "V20" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_20T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_20T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            let att20 =  predData[i].V20;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19,att20});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19','V20' " + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 21)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double,\"V20\" double,\"V21\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20", "V21" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_21T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_21T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19", "V20","V21" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_21T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_21T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            let att20 =  predData[i].V20;
            let att21 =  predData[i].V21;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19,att20,att21});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19','V20','V21' " + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 22)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double,\"V20\" double,\"V21\" double,\"V22\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20", "V21", "V22" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_22T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_22T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19", "V20","V21", "V22" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_22T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_22T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            let att20 =  predData[i].V20;
            let att21 =  predData[i].V21;
            let att22 =  predData[i].V22;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19,att20,att21,att22});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19','V20','V21','V22' " + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 23)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double,\"V20\" double,\"V21\" double,\"V22\" double,\"V23\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20", "V21", "V22", "V23" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_23T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_23T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19", "V20","V21", "V22", "V23" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_23T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_23T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            let att20 =  predData[i].V20;
            let att21 =  predData[i].V21;
            let att22 =  predData[i].V22;
            let att23 =  predData[i].V23;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19,att20,att21,att22,att23});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19','V20','V21','V22','V23' " + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 24)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double,\"V20\" double,\"V21\" double,\"V22\" double,\"V23\" double,\"V24\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20", "V21", "V22", "V23", ' +
                '"V24"  FROM "PAL_MLR_PRED_DATA_GRP_TAB_24T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_24T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19", "V20","V21", "V22", "V23", "V24" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_24T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_24T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            let att20 =  predData[i].V20;
            let att21 =  predData[i].V21;
            let att22 =  predData[i].V22;
            let att23 =  predData[i].V23;
            let att24 =  predData[i].V24;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19,att20,att21,att22,att23,att24});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19','V20','V21','V22','V23','V24'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 25)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double,\"V20\" double,\"V21\" double,\"V22\" double,\"V23\" double,\"V24\" double, ' +
                        '\"V25\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20", "V21", "V22", "V23", ' +
                '"V24","V25"  FROM "PAL_MLR_PRED_DATA_GRP_TAB_25T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_25T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19", "V20","V21", "V22", "V23", "V24", "V25" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_25T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_25T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            let att20 =  predData[i].V20;
            let att21 =  predData[i].V21;
            let att22 =  predData[i].V22;
            let att23 =  predData[i].V23;
            let att24 =  predData[i].V24;
            let att25 =  predData[i].V25;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19,att20,att21,att22,att23,att24,att25});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19','V20','V21','V22','V23','V24','V25'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 26)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double,\"V20\" double,\"V21\" double,\"V22\" double,\"V23\" double,\"V24\" double, ' +
                        '\"V25\" double,\"V26\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20", "V21", "V22", "V23", ' +
                '"V24","V25", "V26"  FROM "PAL_MLR_PRED_DATA_GRP_TAB_26T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_26T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19", "V20","V21", "V22", "V23", "V24", "V25", "V26" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_26T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_26T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            let att20 =  predData[i].V20;
            let att21 =  predData[i].V21;
            let att22 =  predData[i].V22;
            let att23 =  predData[i].V23;
            let att24 =  predData[i].V24;
            let att25 =  predData[i].V25;
            let att26 =  predData[i].V26;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19,att20,att21,att22,att23,att24,att25,att26});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19','V20','V21','V22','V23','V24','V25','V26'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 27)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double,\"V20\" double,\"V21\" double,\"V22\" double,\"V23\" double,\"V24\" double, ' +
                        '\"V25\" double,\"V26\" double,\"V27\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20", "V21", "V22", "V23", ' +
                '"V24","V25", "V26", "V27"  FROM "PAL_MLR_PRED_DATA_GRP_TAB_27T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_27T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19", "V20","V21", "V22", "V23", "V24", "V25", "V26", "V27" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_27T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_27T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            let att20 =  predData[i].V20;
            let att21 =  predData[i].V21;
            let att22 =  predData[i].V22;
            let att23 =  predData[i].V23;
            let att24 =  predData[i].V24;
            let att25 =  predData[i].V25;
            let att26 =  predData[i].V26;
            let att27 =  predData[i].V27;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19,att20,att21,att22,att23,att24,att25,att26,att27});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19','V20','V21','V22','V23','V24','V25','V26','V27'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 28)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double,\"V20\" double,\"V21\" double,\"V22\" double,\"V23\" double,\"V24\" double, ' +
                        '\"V25\" double,\"V26\" double,\"V27\" double,\"V28\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20", "V21", "V22", "V23", ' +
                '"V24","V25", "V26", "V27", "V28"  FROM "PAL_MLR_PRED_DATA_GRP_TAB_28T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_28T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19", "V20","V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_28T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_28T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            let att20 =  predData[i].V20;
            let att21 =  predData[i].V21;
            let att22 =  predData[i].V22;
            let att23 =  predData[i].V23;
            let att24 =  predData[i].V24;
            let att25 =  predData[i].V25;
            let att26 =  predData[i].V26;
            let att27 =  predData[i].V27;
            let att28 =  predData[i].V28;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19,att20,att21,att22,att23,att24,att25,att26,att27,att28});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19','V20','V21','V22','V23','V24','V25','V26','V27','V28'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 29)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double,\"V20\" double,\"V21\" double,\"V22\" double,\"V23\" double,\"V24\" double, ' +
                        '\"V25\" double,\"V26\" double,\"V27\" double,\"V28\" double,\"V29\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20", "V21", "V22", "V23", ' +
                '"V24","V25", "V26", "V27", "V28", "V29"  FROM "PAL_MLR_PRED_DATA_GRP_TAB_29T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_29T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19", "V20","V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28", "V29" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_29T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_29T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            let att20 =  predData[i].V20;
            let att21 =  predData[i].V21;
            let att22 =  predData[i].V22;
            let att23 =  predData[i].V23;
            let att24 =  predData[i].V24;
            let att25 =  predData[i].V25;
            let att26 =  predData[i].V26;
            let att27 =  predData[i].V27;
            let att28 =  predData[i].V28;
            let att29 =  predData[i].V29;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19,att20,att21,att22,att23,att24,att25,att26,att27,att28,att29});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19','V20','V21','V22','V23','V24','V25','V26','V27','V28','V29'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(mlrpType == 30)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"V1\" double,\"V2\" double,\"V3\" double,\"V4\" double, \"V5\" double,\"V6\" double,' +
                        '\"V7\" double,\"V8\" double,\"V9\" double,\"V10\" double,\"V11\" double,\"V12\" double, ' +
                        '\"V13\" double,\"V14\" double,\"V15\" double,\"V16\" double,\"V17\" double,\"V18\" double, ' +
                        '\"V19\" double,\"V20\" double,\"V21\" double,\"V22\" double,\"V23\" double,\"V24\" double, ' +
                        '\"V25\" double,\"V26\" double,\"V27\" double,\"V28\" double,\"V29\" double,\"V30\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", ' +
                '"V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20", "V21", "V22", "V23", ' +
                '"V24","V25", "V26", "V27", "V28", "V29", "V30"  FROM "PAL_MLR_PRED_DATA_GRP_TAB_30T"' +
                ' WHERE "PAL_MLR_PRED_DATA_GRP_TAB_30T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        
        sqlStr = 'SELECT "ID", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14" , "V14" ' +
                ' "V15", "V16", "V17", "V18", "V19", "V20","V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28", "V29", "V30" ' +
                ' FROM "PAL_MLR_PRED_DATA_GRP_TAB_30T" WHERE "PAL_MLR_PRED_DATA_GRP_TAB_30T".GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].V1;
            let att2 =  predData[i].V2;
            let att3 =  predData[i].V3;
            let att4 =  predData[i].V4;
            let att5 =  predData[i].V5;
            let att6 =  predData[i].V6;
            let att7 =  predData[i].V7;
            let att8 =  predData[i].V8;
            let att9 =  predData[i].V9;
            let att10 =  predData[i].V10;
            let att11 =  predData[i].V11;
            let att12 =  predData[i].V12;
            let att13 =  predData[i].V13;
            let att14 =  predData[i].V14;
            let att15 =  predData[i].V15;
            let att16 =  predData[i].V16;
            let att17 =  predData[i].V17;
            let att18 =  predData[i].V18;
            let att19 =  predData[i].V19;
            let att20 =  predData[i].V20;
            let att21 =  predData[i].V21;
            let att22 =  predData[i].V22;
            let att23 =  predData[i].V23;
            let att24 =  predData[i].V24;
            let att25 =  predData[i].V25;
            let att26 =  predData[i].V26;
            let att27 =  predData[i].V27;
            let att28 =  predData[i].V28;
            let att29 =  predData[i].V29;
            let att30 =  predData[i].V30;
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,
                                att16,att17,att18,att19,att20,att21,att22,att23,att24,att25,att26,att27,att28,att29,att30});
        }

        sqlStr = 'INSERT INTO ' + coeffTableId + 
                 ' SELECT "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB WHERE GROUP_ID = ' 
                   + "'" + predGroupId + "'" + ' AND VARIABLE_NAME IN (' + 
                   "'__PAL_INTERCEPT__','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13','V14','V15','V16','V17','V18','V19','V20','V21','V22','V23','V24','V25','V26','V27','V28','V29','V30'" + ')';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    
    else
    {
        console.log('_runMlrPrediction Invalid mlrpType ', mlrpType);
        return;
    }
    

    let paramTableId = '"' + "#PAL_FMLR_PARAMETER_TAB_" + tabGroupId + '"';

    sqlStr = "create local temporary column table " + paramTableId + " " +
                        "(\"PARAM_NAME\" varchar(256),\"INT_VALUE\" integer,\"double_VALUE\" double,\"STRING_VALUE\" varchar(1000))";
    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();

    sqlStr = 'INSERT INTO ' + paramTableId + ' SELECT "PARAM_NAME", "INT_VALUE", "DOUBLE_VALUE", "STRING_VALUE" FROM "PAL_MLR_PREDICT_PARAMETER_GRP_TAB" WHERE "PAL_MLR_PREDICT_PARAMETER_GRP_TAB".GROUP_ID =' + "'" +  predGroupId + "'";

    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();


    sqlStr = ' SELECT "PARAM_NAME", "INT_VALUE", "DOUBLE_VALUE", "STRING_VALUE" FROM "PAL_MLR_PREDICT_PARAMETER_GRP_TAB" WHERE "PAL_MLR_PREDICT_PARAMETER_GRP_TAB".GROUP_ID =' + "'" +  predGroupId + "'";
    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();
    var predParams = result;

    var predParamsObj = [];	
    for (let i=0; i<predParams.length; i++) 
    {
        let paramName =  predParams[i].PARAM_NAME;
        let intVal =  predParams[i].INT_VALUE;
        let doubleVal =  predParams[i].DOUBLE_VALUE;
        let strVal =  predParams[i].STRING_VALUE;

        predParamsObj.push({GroupId,paramName,intVal,doubleVal,strVal});
    }


    // sqlStr = "call _SYS_AFL.PAL_LINEAR_REGRESSION_PREDICT(" + "#PAL_FMLR_PREDICTDATA_TAB_" + tabGroupId + "," + "#PAL_FMLR_COEFICIENT_TBL_" + tabGroupId + "," + "#PAL_FMLR_PARAMETER_TAB_" + tabGroupId + "," + "?)";
    sqlStr = "call _SYS_AFL.PAL_LINEAR_REGRESSION_PREDICT(" + predTableId + "," + coeffTableId + "," + paramTableId + "," + "?)";
    console.log("mlr.js ", sqlStr);
    // stmt=conn.prepare(sqlStr);
    // let predictionResults=stmt.exec();
    // stmt.drop();
    let predictionResults = await mlrFuncs._execAsync(conn, sqlStr);

    console.log('After call _SYS_AFL.PAL_LINEAR_REGRESSION_PREDICT Response = ', new Date(), "predictionResults.length ", predictionResults.length);

    let resultsObj;
    if(predictionResults.length > 0)
    {
        resultsObj = await _processPredictionsResponse(req, predictionResults, predGroupId, version, scenario, modelVersion, impactAnalysis,startDate, endDate)
    }
    else
    {
        console.log('NO PREDICTION RESULTS FOR _runMlrPrediction tabGroupId ', tabGroupId);
        sqlStr = 'SELECT * FROM ' + predTableId;
        console.log('NO PREDICTION RESULTS FOR sqlStr ', sqlStr);
        stmt=conn.prepare(sqlStr);
        let predictionsFailedData = stmt.exec();
        stmt.drop();
        console.log("Input Data ", predictionsFailedData);
    }
    console.log('After call _processPredictionsResponse= ', new Date());
    /********* Begin of Disable this part to View Input Data & Profile parameters */
    // DELETE INPUT DATA & PARAMETERS AFTER MODEL GENERATION
    const groupId = predGroupId;

    // Validate input early
    if (mlrpType < 1 || mlrpType > 30) {
        return req.error(400, `Invalid MlrType: ${mlrpType}`);
    }

    // Construct table name dynamically
    const tableName = `PAL_MLR_PRED_DATA_GRP_TAB_${mlrpType}T`;
    console.log("MLR Prediction tableName ", tableName, "groupId ", groupId);

    try {
        // conn.connect(conn_params);

        // Optional: avoid SET SCHEMA if already configured in connection
        conn.exec(`SET SCHEMA ${classicalSchema}`);
        
        // Delete from dynamic table
        let stmt = conn.prepare(
            `DELETE FROM ${tableName} WHERE GROUP_ID = ?`
        );
        stmt.exec([groupId]);
        stmt.drop();


        // Delete from parameter table
        stmt = conn.prepare(
            `DELETE FROM PAL_MLR_PREDICT_PARAMETER_GRP_TAB WHERE GROUP_ID = ?`
        );
        stmt.exec([groupId]);
        stmt.drop();

    } catch (err) {
        console.error("DB Error:", err);
        req.error(500, err.message);
    } finally {
        conn.disconnect(); // IMPORTANT
    }
    
    /********* End of Disable this part to View Data & Profile parameters */
    conn.disconnect();
    // --------------- BEGIN --------------------


    var createtAtObj = new Date();
    let idObj = uuidv1();

    let returnObj = [];	
    let createdAt = createtAtObj;
    let mlrpID = idObj; 
    let predictionParameters = predParamsObj;
    let predictionData = predDataObj;
    let fittedResults = resultsObj;
    returnObj.push({mlrpID, createdAt,predictionParameters,mlrpType,predictionData,fittedResults});

    return returnObj[0];
}

async function _processPredictionsResponse(req,predictionResults, predGroupId, version, scenario, modelVersion, impactAnalysis,startDate, endDate)
{
    console.log("processPredictionsResponse", "predGroupId ", predGroupId);

    var groupId = predGroupId;    
    let profileId = req.data.profile;
    let odType = req.data.Type;
    let GroupId =  req.data.groupId;
    let location = req.data.Location;
    let product = req.data.Product;

    var fittedObj = [];	
    for (let i=0; i<predictionResults.length; i++) 
    {
        let id = predictionResults[i].ID;
        let value =  predictionResults[i].VALUE;
    
        fittedObj.push({GroupId,id,value});

    }	
 

    let startDateSql = "";
    let endDateSql = "";
    if (startDate !==undefined)
        startDateSql =  ' AND "PERIOD_NUM" >= CONCAT( YEAR (TO_DATE (\'' + startDate + '\'' + ', \'YYYY-MM-DD\')), lpad(WEEK (TO_DATE(\'' + startDate + '\'' +', \'YYYY-MM-DD\')),\'2\',\'00\') )';
    if (endDate !==undefined)   
        endDateSql =  ' AND "PERIOD_NUM" <= CONCAT( YEAR (TO_DATE (\'' + endDate + '\'' +', \'YYYY-MM-DD\')), lpad(WEEK (TO_DATE(\'' + endDate + '\'' + ', \'YYYY-MM-DD\')),\'2\',\'00\') ) ';

    // console.log(" startDateSql + endDateSql + ", startDateSql + endDateSql);
    // console.log(" startDate : ", startDate, "endDate : ", endDate);

    // let tpGrpStr=groupId.split('#');
    // let tpGroupId = tpGrpStr[2] + '#' + tpGrpStr[3] + '#' + tpGrpStr[4];
    let tpGroupId = GroupId + '#' + location + '#' + product;   

    sqlStr = 'SELECT DISTINCT "OBJ_DEP", "OBJ_COUNTER", ' + '"' + vcConfigTimePeriod + '"' + 
             ' from  "V_FUTURE_DEP_TS" WHERE  "GroupID" = ' + "'" + tpGroupId + "'" +
             ' AND "Type" = ' + "'" + odType + "'" + 
             ' AND "VERSION" = ' + "'" + version + "'" +
             ' AND "SCENARIO" = ' + "'" + scenario + "'" +
             startDateSql    + endDateSql +
             ' ORDER BY ' + '"' + vcConfigTimePeriod + '"' + ' ASC';

    var distPeriods=await cds.run(sqlStr);
    var predictedTime = new Date().toISOString();
    var trimmedPeriod = vcConfigTimePeriod.replace(/^(["]*)/g, '');

    let tableObj = [];	

    let allPeriods = [];
    for (let index=0; index<distPeriods.length; index++)
    {     
        // let predictedVal = fittedObj[index].value;
        // predictedVal = ( +predictedVal).toFixed(2);
        let periodId = distPeriods[index][trimmedPeriod];
        allPeriods.push(periodId);
    }
    sqlStr = 'SELECT DISTINCT "CAL_DATE", "Location", "Product", "Type", "OBJ_DEP", "OBJ_COUNTER", "VERSION", "SCENARIO" ' +
            'FROM "V_FUTURE_DEP_TS" WHERE "GroupID" = ' + "'" + tpGroupId + "'" + 
            ' AND "Type" = ' + "'" + odType + "'" +
            ' AND "VERSION" = ' + "'" + version + "'" +
            ' AND "SCENARIO" = ' + "'" + scenario + "'" +
            startDateSql    + endDateSql +
            ' AND ' + '"' + vcConfigTimePeriod + '"' + ' IN ( ' + allPeriods + ')' +
            ' ORDER BY "CAL_DATE" ASC'; // NOTE PERIOD NUMBERS ARE IN ASCENDING ORDER 
    console.log(" allPeriods sqlStr ", sqlStr);
    let calDateResults;
    try {
        calDateResults = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }
    // console.log("calDateresults ", calDateResults);
    if (calDateResults.length > 0)
    {
        for (var index=0; index < fittedObj.length && index < calDateResults.length; index++)
        {
            let predictedVal = fittedObj[index].value;
            predictedVal = ( +predictedVal).toFixed(2);

            let date =  calDateResults[index].CAL_DATE;
            let location =  calDateResults[index].Location ;
            let product = calDateResults[index].Product;
            let type = calDateResults[index].Type;
            let obj_dep = calDateResults[index].OBJ_DEP;
            let obj_counter =calDateResults[index].OBJ_COUNTER ;
            let modelType = 'MLR'; 
            let mVersion = modelVersion ;
            let prfId = profileId;
            let version = calDateResults[index].VERSION;
            let scenario = calDateResults[index].SCENARIO;
            let predTime = predictedTime;
            let status = 'SUCCESS';
 

            var rowObj = { CAL_DATE:date, LOCATION_ID:location, PRODUCT_ID:product,OBJ_TYPE:type,
                           OBJ_DEP:obj_dep, OBJ_COUNTER:obj_counter,MODEL_TYPE:modelType,
                           MODEL_VERSION:mVersion,MODEL_PROFILE:prfId,VERSION:version,SCENARIO:scenario,
                           PREDICTED:predictedVal,PREDICTED_TIME:predTime,OPT_STARTTIME:predictedTime,DELTA_TIME:predictedTime,PREDICTED_STATUS:status,
                           PRE_OPTIMIZED:predictedVal,PRE_OPTIMIZED_TIME:predTime,OPT_ALGORITHM:'NONE'};

            tableObj.push(rowObj);
        }

    }
    // console.log("tableObj ", tableObj);
    sqlStr = "DELETE FROM CP_TS_PREDICTIONS_TEMP";
    try {
        await cds.run(sqlStr);
        }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }

    cqnQuery = {INSERT:{ into: { ref: ['CP_TS_PREDICTIONS_TEMP'] }, entries:  tableObj }};

    await cds.run(cqnQuery);


    sqlStr = "SELECT DISTINCT CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_TYPE, OBJ_DEP, OBJ_COUNTER, MODEL_VERSION, VERSION, SCENARIO FROM CP_TS_PREDICTIONS_TEMP" +
            " ORDER BY CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_TYPE, OBJ_DEP, OBJ_COUNTER, MODEL_VERSION, VERSION, SCENARIO ASC"
    
    let delResults;
    try {
        delResults = await cds.run(sqlStr);
        }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }


    sqlStr = "DELETE FROM  CP_TS_PREDICTIONS WHERE " +
                '"CAL_DATE" >= ' + "'" + delResults[0].CAL_DATE + "'" + " AND " +
                '"CAL_DATE" <= ' + "'" + delResults[delResults.length-1].CAL_DATE + "'" + " AND " +
                '"LOCATION_ID" = ' + "'" + delResults[0].LOCATION_ID + "'" + " AND " +
                '"PRODUCT_ID" = ' + "'" + delResults[0].PRODUCT_ID + "'" + " AND " +
                '"OBJ_TYPE" = ' + "'" + delResults[0].OBJ_TYPE + "'" + " AND " +
                '"OBJ_DEP" = ' + "'" + delResults[0].OBJ_DEP + "'" + " AND " +
                '"OBJ_COUNTER" = ' + "'" + delResults[0].OBJ_COUNTER + "'" + " AND " +
                '"MODEL_VERSION" = ' + "'" + delResults[0].MODEL_VERSION + "'" + " AND " +
                '"VERSION" = ' + "'" + delResults[0].VERSION + "'" + " AND " +
                '"SCENARIO" = ' + "'" + delResults[0].SCENARIO + "'";
    try {
        await cds.run(sqlStr);
        }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }


    cqnQuery = {INSERT:{ into: { ref: ['CP_TS_PREDICTIONS'] }, entries:  tableObj }};

    await cds.run(cqnQuery);

    var conn = hana.createConnection();
    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();
 
    // Extract Intercepts and Coefficients
    sqlStr = 'SELECT "GROUP_ID", "VARIABLE_NAME", "COEFFICIENT_VALUE" FROM PAL_MLR_COEFFICIENT_GRP_TAB' +
                 ' WHERE "GROUP_ID" = ' + "'" + groupId + "'";
    var stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();

    conn.disconnect();

    if (impactAnalysis == true)
    {
        var intercept, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12 = 0;

        for (let index=0; index<result.length; index++)
        {
    
            if (result[index].VARIABLE_NAME == '__PAL_INTERCEPT__')
                intercept = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V1')
                c1 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V2')
                c2 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V3')
                c3 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V4')
                c4 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V5')
                c5 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V6')
                c6 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V7')
                c7 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V8')
                c8 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V9')
                c9 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V10')
                c10 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V11')
                c11 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V12')
                c12 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V13')
                c13 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V14')
                c14 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V15')
                c15 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V16')
                c16 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V17')
                c17 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V18')
                c18 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V19')
                c19 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V20')
                c20 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V21')
                c21 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V22')
                c22 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V23')
                c23 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V24')
                c24 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V25')
                c25 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V26')
                c26 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V27')
                c27 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V28')
                c28 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V29')
                c29 = result[index].COEFFICIENT_VALUE;
            else if (result[index].VARIABLE_NAME == 'V30')
                c30 = result[index].COEFFICIENT_VALUE;
        }

        tableObj = [];

        for (let pIndex=0; pIndex<fittedObj.length; pIndex++)
        {     
            let predictedVal = fittedObj[pIndex].value;
            predictedVal = ( +predictedVal).toFixed(2);
            let periodId = distPeriods[pIndex][trimmedPeriod];

            sqlStr = 'SELECT DISTINCT "CAL_DATE", "Location", "Product", ' +
                    '"Type", "OBJ_DEP", "OBJ_COUNTER", "ROW_ID", "CharCount", "VERSION", "SCENARIO" ' +
                    'FROM "V_FUTURE_DEP_TS" WHERE "GroupID" = ' + "'" + tpGroupId + "'" + 
                    ' AND "Type" = ' + "'" + odType + "'" + 
                    ' AND "VERSION" = ' + "'" + version + "'" +
                    ' AND "SCENARIO" = ' + "'" + scenario + "'" +
                    startDateSql    + endDateSql +
                    ' AND ' + '"' + vcConfigTimePeriod + '"' + ' = ' + "'" + periodId + "'";

            result = [];


            result = await cds.run(sqlStr);
    

            for (let rIndex = 0; rIndex < result.length; rIndex++)
            {
                let impact_val = impact_percent = 0;
                if (result[rIndex].ROW_ID == 1)
                    impact_val = c1*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 2)
                    impact_val = c2*result[rIndex].CharCount;   
                else if (result[rIndex].ROW_ID == 3)
                    impact_val = c3*result[rIndex].CharCount;  
                else if (result[rIndex].ROW_ID == 4)
                    impact_val = c4*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 5)
                    impact_val = c5*result[rIndex].CharCount;  
                else if (result[rIndex].ROW_ID == 6)
                    impact_val = c6*result[rIndex].CharCount;   
                else if (result[rIndex].ROW_ID == 7)
                    impact_val = c7*result[rIndex].CharCount;  
                else if (result[rIndex].ROW_ID == 8)
                    impact_val = c8*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 9)
                    impact_val = c9*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 10)
                    impact_val = c10*result[rIndex].CharCount;   
                else if (result[rIndex].ROW_ID == 11)
                    impact_val = c11*result[rIndex].CharCount;  
                else if (result[rIndex].ROW_ID == 12)
                    impact_val = c12*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 13)
                    impact_val = c13*result[rIndex].CharCount;  
                else if (result[rIndex].ROW_ID == 14)
                    impact_val = c14*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 15)
                    impact_val = c15*result[rIndex].CharCount;  
                else if (result[rIndex].ROW_ID == 16)
                    impact_val = c16*result[rIndex].CharCount;   
                else if (result[rIndex].ROW_ID == 17)
                    impact_val = c17*result[rIndex].CharCount;  
                else if (result[rIndex].ROW_ID == 18)
                    impact_val = c18*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 19)
                    impact_val = c19*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 20)
                    impact_val = c20*result[rIndex].CharCount;  
                else if (result[rIndex].ROW_ID == 21)
                    impact_val = c21*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 22)
                    impact_val = c22*result[rIndex].CharCount;   
                else if (result[rIndex].ROW_ID == 23)
                    impact_val = c23*result[rIndex].CharCount;  
                else if (result[rIndex].ROW_ID == 24)
                    impact_val = c24*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 25)
                    impact_val = c25*result[rIndex].CharCount;  
                else if (result[rIndex].ROW_ID == 26)
                    impact_val = c26*result[rIndex].CharCount;   
                else if (result[rIndex].ROW_ID == 27)
                    impact_val = c27*result[rIndex].CharCount;  
                else if (result[rIndex].ROW_ID == 28)
                    impact_val = c28*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 29)
                    impact_val = c29*result[rIndex].CharCount;
                else if (result[rIndex].ROW_ID == 30)
                    impact_val = c30*result[rIndex].CharCount; 

                if (predictedVal <= 0)
                impact_percent = 0;
                else
                impact_percent = 100.0*impact_val/(predictedVal - intercept);


                
                let date =  result[rIndex].CAL_DATE;
                let location =  result[rIndex].Location ;
                let product = result[rIndex].Product;
                let type = result[rIndex].Type;
                let obj_dep = result[rIndex].OBJ_DEP;
                let obj_counter = result[rIndex].OBJ_COUNTER ;
                let row_id = result[rIndex].ROW_ID; 
                let modelType = 'MLR'; 
                let mVersion = modelVersion ;
                let prfId = profileId;
                let version = result[rIndex].VERSION;
                let scenario =result[rIndex].SCENARIO;
                let charCount = result[rIndex].CharCount;
                let predicted = predictedVal;

    
                var rowObj = { CAL_DATE:date, LOCATION_ID:location, PRODUCT_ID:product,OBJ_TYPE:type,
                    OBJ_DEP:obj_dep, OBJ_COUNTER:obj_counter,ROW_ID:row_id,MODEL_TYPE:modelType,
                    MODEL_VERSION:mVersion,MODEL_PROFILE:prfId,VERSION:version,SCENARIO:scenario,
                    CHAR_COUNT:charCount, CHAR_IMPACT_VAL:impact_val,CHAR_IMPACT_PERCENT:impact_percent,
                    PREDICTED_VAL:predicted,PREDICTED_TIME:predictedTime};

                tableObj.push(rowObj); 

            }
    

        }

        sqlStr = "DELETE FROM CP_TS_OBJDEP_CHAR_IMPACT_F_TEMP";
        try {
            await cds.run(sqlStr);
            }
        catch (exception) {
            console.log("sqlStr exception ", sqlStr);
            throw new Error(exception.toString());
        }

        cqnQuery = {INSERT:{ into: { ref: ['CP_TS_OBJDEP_CHAR_IMPACT_F_TEMP'] }, entries:  tableObj }};

        await cds.run(cqnQuery);

        sqlStr = "SELECT DISTINCT CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_TYPE, OBJ_DEP, OBJ_COUNTER, ROW_ID, MODEL_VERSION, VERSION, SCENARIO FROM CP_TS_OBJDEP_CHAR_IMPACT_F_TEMP" +
                " ORDER BY CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_TYPE, OBJ_DEP, OBJ_COUNTER, ROW_ID, MODEL_VERSION, VERSION, SCENARIO ASC"

        try {
            delResults = await cds.run(sqlStr);
            }
        catch (exception) {
            console.log("sqlStr exception ", sqlStr);
            throw new Error(exception.toString());
        }

        sqlStr = "SELECT COUNT(DISTINCT ROW_ID) AS ROWS FROM CP_TS_OBJDEP_CHAR_IMPACT_F_TEMP"
        let maxRowIds = 0;
        try {
                maxRowIds = await cds.run(sqlStr);
            }
        catch (exception) {
            console.log("sqlStr exception ", sqlStr);
            throw new Error(exception.toString());
        }


        sqlStr = "DELETE FROM  CP_TS_OBJDEP_CHAR_IMPACT_F WHERE " +
                    '"CAL_DATE" >= ' + "'" + delResults[0].CAL_DATE + "'" + " AND " +
                    '"CAL_DATE" <= ' + "'" + delResults[delResults.length-1].CAL_DATE + "'" + " AND " +
                    '"LOCATION_ID" = ' + "'" + delResults[0].LOCATION_ID + "'" + " AND " +
                    '"PRODUCT_ID" = ' + "'" + delResults[0].PRODUCT_ID + "'" + " AND " +
                    '"OBJ_TYPE" = ' + "'" + delResults[0].OBJ_TYPE + "'" + " AND " +
                    '"OBJ_DEP" = ' + "'" + delResults[0].OBJ_DEP + "'" + " AND " +
                    '"OBJ_COUNTER" = ' + "'" + delResults[0].OBJ_COUNTER + "'" + " AND " +
                    '"ROW_ID" <= ' + "'" + maxRowIds[0].ROWS + "'" + " AND " +
                    '"MODEL_VERSION" = ' + "'" + delResults[0].MODEL_VERSION + "'" + " AND " +
                    '"VERSION" = ' + "'" + delResults[0].VERSION + "'" + " AND " +
                    '"SCENARIO" = ' + "'" + delResults[0].SCENARIO + "'";
        try {
            await cds.run(sqlStr);
            }
        catch (exception) {
            console.log("sqlStr exception ", sqlStr);
            throw new Error(exception.toString());
        }


        cqnQuery = {INSERT:{ into: { ref: ['CP_TS_OBJDEP_CHAR_IMPACT_F'] }, entries:  tableObj }};

        await cds.run(cqnQuery);
    }
    return fittedObj;
}


exports._execAsync = function (conn, sql) {

  return new Promise((resolve, reject) => {
    conn.prepare(sql, (err, stmt) => {
      if (err) return reject(err);
        stmt.exec((err, result) => {
        stmt.drop(); // cleanup
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
}