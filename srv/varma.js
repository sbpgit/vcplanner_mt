const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
const hana = require('@sap/hana-client');
const varmaFuncs = require('./varma.js');

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

exports._genVarmaModels = async function(req) {
   
    varmaFuncs._updateVarmaGroupParams(req);
    
    varmaFuncs._updateVarmaGroupData(req);

    await varmaFuncs._genVarmaModelsGroup(req); 
  
}

exports._updateVarmaGroupParams = function(req) {
    const varmaControlParams = req.data.controlParameters;

    // console.log('_updateVarmaGroupParams: ', varmaControlParams);         

   if (varmaControlParams.length == 0)
        return;
    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

// ---------- BEGIN OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS
    let inGroups = [];
    let modelGroup = varmaControlParams[0].groupId;
    inGroups.push(modelGroup);
    for (var i in varmaControlParams)
    { 
        if (i > 0)
        {
            if( varmaControlParams[i].groupId != varmaControlParams[i-1].groupId)
            {
               inGroups.push(varmaControlParams[i].groupId);

            }
        }
    }
    for (let i = 0; i < inGroups.length; i++)
    {
        sqlStr = "DELETE FROM PAL_VARMA_CTRL_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        console.log('_updateVarmaGroupParams sqlStr ', sqlStr);
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

    }
// ---------- END OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS

    var tableObj = [];	
        
    for (let i = 0; i < varmaControlParams.length; i++)
    {
        let groupId = varmaControlParams[i].groupId ;
        let paramName = varmaControlParams[i].paramName;
        let intVal =  varmaControlParams[i].intVal
        let doubleVal = varmaControlParams[i].doubleVal;
        let strVal = varmaControlParams[i].strVal;
        var rowObj = [];
        rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        tableObj.push(rowObj);
        
    }

    sqlStr = "INSERT INTO PAL_VARMA_CTRL_GRP_TAB(GROUP_ID,PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE) VALUES(?, ?, ?, ?, ?)";
    stmt = conn.prepare(sqlStr);
    stmt.execBatch(tableObj);
    stmt.drop();

    conn.disconnect();
}

exports._updateVarmaGroupData = function(req) {
    const varmaGroupData = req.data.varmaData;

    var varmaType = req.data.varmaType;
    var modelVersion = req.data.modelVersion;



    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    if (varmaType == 1)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_1T";
    else if (varmaType == 2)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_2T";
    else if (varmaType == 3)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_3T";
    else if (varmaType == 4)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_4T";
    else if (varmaType == 5)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_5T";
    else if (varmaType == 6)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_6T";
    else if (varmaType == 7)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_7T";
    else if (varmaType == 8)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_8T";
    else if (varmaType == 9)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_9T";
    else if (varmaType == 10)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_10T";
    else if (varmaType == 11)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_11T";
    else if (varmaType == 12)
        sqlStr = "DELETE FROM PAL_VARMA_DATA_GRP_TAB_12T";
    else if (varmaType == 13)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_13T"';
    else if (varmaType == 14)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_14T"';
    else if (varmaType == 15)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_15T"';
    else if (varmaType == 16)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_16T"';
    else if (varmaType == 17)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_17T"';
    else if (varmaType == 18)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_18T"';
    else if (varmaType == 19)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_19T"';
    else if (varmaType == 20)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_20T"';
    else if (varmaType == 21)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_21T"';
    else if (varmaType == 22)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_22T"';
    else if (varmaType == 23)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_23T"';
    else if (varmaType == 24)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_24T"';
    else if (varmaType == 25)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_25T"';
    else if (varmaType == 26)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_26T"';
    else if (varmaType == 27)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_27T"';
    else if (varmaType == 28)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_28T"';
    else if (varmaType == 29)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_29T"';
    else if (varmaType == 30)
        sqlStr = 'DELETE FROM "PAL_VARMA_DATA_GRP_TAB_30T"';
    else
    {
        var res = req._.req.res;
        res.send({"Invalid varmaType":varmaType});
        return;
    }

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    var tableObj = [];	

    
    let timestamp, att1, att2, att3, att4, att5, att6, att7, att8, att9, att10, att11, att12, target, groupId;
    let att13, att14, att15, att16, att17, att18, att19, att20;
    let att21, att22, att23, att24, att25, att26, att27, att28, att29, att30;
    for (var i = 0; i < varmaGroupData.length; i++)
    {
        groupId = varmaGroupData[i].groupId ;
        timestamp = varmaGroupData[i].ID;
        target = varmaGroupData[i].target;
        att1 = varmaGroupData[i].att1;
        if (varmaType > 1)
            att2 =  varmaGroupData[i].att2;
        if (varmaType > 2)
            att3 = varmaGroupData[i].att3;
        if (varmaType > 3)
            att4 = varmaGroupData[i].att4;
        if (varmaType > 4)
            att5 = varmaGroupData[i].att5;
        if (varmaType > 5)
            att6 = varmaGroupData[i].att6;
        if (varmaType > 6)
            att7 = varmaGroupData[i].att7;
        if (varmaType > 7)
            att8 = varmaGroupData[i].att8;
        if (varmaType > 8)
            att9 = varmaGroupData[i].att9;
        if (varmaType > 9)
            att10 = varmaGroupData[i].att10;
        if (varmaType > 10)
            att11 = varmaGroupData[i].att11;
        if (varmaType > 11)
            att12 = varmaGroupData[i].att12;
        if (varmaType > 12)
            att13 = varmaGroupData[i].att13;
        if (varmaType > 13)
            att14 = varmaGroupData[i].att14;
        if (varmaType > 14)
            att15 = varmaGroupData[i].att15;
        if (varmaType > 15)
            att16 = varmaGroupData[i].att16;
        if (varmaType > 16)
            att17 = varmaGroupData[i].att17;
        if (varmaType > 17)
            att18 = varmaGroupData[i].att18;
        if (varmaType > 18)
            att19 = varmaGroupData[i].att19;
        if (varmaType > 19)
            att20 = varmaGroupData[i].att20;
        if (varmaType > 20)
            att21 =  varmaGroupData[i].att21;
        if (varmaType > 21)
            att12 =  varmaGroupData[i].att22;
        if (varmaType > 22)
            att13 = varmaGroupData[i].att23;
        if (varmaType > 23)
            att24 = varmaGroupData[i].att24;
        if (varmaType > 24)
            att25 = varmaGroupData[i].att25;
        if (varmaType > 25)
            att26 = varmaGroupData[i].att26;
        if (varmaType > 26)
            att27 = varmaGroupData[i].att27;
        if (varmaType > 27)
            att28 = varmaGroupData[i].att28;
        if (varmaType > 28)
            att29 = varmaGroupData[i].att29;
        if (varmaType > 29)
            att30 = varmaGroupData[i].att30;
        var rowObj = [];
        if (varmaType == 1)
            rowObj.push(groupId,timestamp,att1,target);
        else if (varmaType == 2)
            rowObj.push(groupId,timestamp,att1,att2,target);
        else if (varmaType == 3)
            rowObj.push(groupId,timestamp,att1,att2,att3,target);
        else if (varmaType == 4)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,target);
        else if (varmaType == 5)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,target);
        else if (varmaType == 6)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,target);
        else if (varmaType == 7)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,target);
        else if (varmaType == 8)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,target);
        else if (varmaType == 9)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,target);
        else if (varmaType == 10)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,target);
        else if (varmaType == 11)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11, target);
        else if (varmaType == 12)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, target);
        else if (varmaType == 13)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,target);
        else if (varmaType == 14)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,target);
        else if (varmaType == 15)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,target);
        else if (varmaType == 16)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,target);
        else if (varmaType == 17)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,target);
        else if (varmaType == 18)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,target);
        else if (varmaType == 19)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,target);
        else if (varmaType == 20)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,target);
        else if (varmaType == 21)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,target);
        else if (varmaType == 22)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,target);
        else if (varmaType == 23)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,target);
        else if (varmaType == 24)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,target);
        else if (varmaType == 25)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,target);
        else if (varmaType == 26)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,target);
        else if (varmaType == 27)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,target);
        else if (varmaType == 28)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,target);
        else if (varmaType == 29)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29,target);
        else if (varmaType == 30)
            rowObj.push(groupId,timestamp,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29,att30,target);
        tableObj.push(rowObj);
    }
    console.log(' _updateVarmaGroupData - tableObj ', tableObj);
    if (varmaType == 1)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_1T(GROUP_ID,TIMESTAMP,ATT1,TARGET) VALUES(?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (varmaType == 2)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_2T(GROUP_ID,TIMESTAMP,ATT1,ATT2,TARGET) VALUES(?, ?, ?, ?,?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (varmaType == 3)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_3T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,TARGET) VALUES(?, ?, ?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 4)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_4T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,TARGET) VALUES(?, ?, ?, ?, ?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 5)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_5T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,TARGET) VALUES(?, ?, ?, ?, ?, ?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 6)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_6T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,TARGET) VALUES(?, ?, ?, ?, ?, ?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 7)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_7T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,TARGET) VALUES(?, ?, ?, ?, ?, ?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 8)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_8T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,TARGET) VALUES(?, ?, ?, ?, ?, ?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 9)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_9T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,TARGET) VALUES(?, ?, ?, ?, ?, ?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 10)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_10T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,TARGET) VALUES(?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 11)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_11T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,TARGET) VALUES(?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 12)
    {
        sqlStr = "INSERT INTO PAL_VARMA_DATA_GRP_TAB_12T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12,TARGET) VALUES(?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 13)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_13T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 14)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_14T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 15)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_15T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 16)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_16T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 17)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_17T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 18)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_18T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 19)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_19T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 20)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_12T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,'
                'TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 21)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_21T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,'
                'ATT21,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 22)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_22T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,'
                'ATT21,ATT22,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 23)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_23T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,'
                'ATT21,ATT22,ATT23,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 24)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_24T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,'
                'ATT21,ATT22,ATT23,ATT24,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 25)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_25T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,'
                'ATT21,ATT22,ATT23,ATT24,ATT25,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 26)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_26T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,'
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 27)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_27T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,'
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?)';        
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 28)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_28T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,'
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?)';          
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 29)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_29T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,'
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?)';        
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 30)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_DATA_GRP_TAB_30T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,'
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,ATT30,TARGET) ' +
                 ' VALUES(?, ?,  ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    console.log(' _updateVarmaGroupData sqlStr ', sqlStr);

    stmt.execBatch(tableObj);
    stmt.drop();
    conn.disconnect();
    console.log(' _updateVarmaGroupData Completed ');
}

exports._genVarmaModelsGroup = async function(req) {
    console.log('Executing VARMA Models at GROUP');
    var varmaType = req.data.varmaType;
    var varmaModelVersion = req.data.modelVersion;

    console.log('Executing VARMA Regression at GROUP REQ VARMA Model Version', varmaModelVersion);

    var varmaDataTable;
    if (varmaType == 1)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_1T";
    else if (varmaType == 2)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_2T";
    else if (varmaType == 3)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_3T";
    else if (varmaType == 4)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_4T";
    else if (varmaType == 5)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_5T";
    else if (varmaType == 6)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_6T";
    else if (varmaType == 7)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_7T";
    else if (varmaType == 8)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_8T";
    else if (varmaType == 9)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_9T";
    else if (varmaType == 10)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_10T";
    else if (varmaType == 11)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_11T";
    else if (varmaType == 12)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_12T";
    else if (varmaType == 13)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_13T";
    else if (varmaType == 14)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_14T";
    else if (varmaType == 15)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_15T";
    else if (varmaType == 16)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_16T";
    else if (varmaType == 17)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_17T";
    else if (varmaType == 18)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_18T";
    else if (varmaType == 19)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_19T";
    else if (varmaType == 20)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_20T";
    else if (varmaType == 21)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_21T";
    else if (varmaType == 22)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_22T";
    else if (varmaType == 23)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_23T";
    else if (varmaType == 24)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_24T";
    else if (varmaType == 25)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_25T";
    else if (varmaType == 26)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_26T";
    else if (varmaType == 27)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_27T";
    else if (varmaType == 28)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_28T";
    else if (varmaType == 29)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_29T";
    else if (varmaType == 30)
        varmaDataTable = "PAL_VARMA_DATA_GRP_TAB_30T";
    var conn = hana.createConnection();
 
    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();
/////////////////////////////////////////////////
    const varmaControlParams = req.data.controlParameters;
    let inGroups = [];
    let modelGroup = varmaControlParams[0].groupId;
    inGroups.push(modelGroup);
    for (var i in varmaControlParams)
    { 
        if (i > 0)
        {
            if( varmaControlParams[i].groupId != varmaControlParams[i-1].groupId)
            {
               inGroups.push(varmaControlParams[i].groupId);

            }
        }
    }
    for (let i = 0; i < inGroups.length; i++)
    {
        // sqlStr = "DELETE FROM PAL_VARMA_CTRL_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        // console.log('_updateVarmaGroupParams sqlStr ', sqlStr);
        // stmt=conn.prepare(sqlStr);
        // stmt.exec();
        // stmt.drop();

        sqlStr = "DELETE FROM PAL_VARMA_MODEL_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  "DELETE FROM PAL_VARMA_FIT_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  "DELETE FROM PAL_VARMA_IRF_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

    }

    if (varmaType == 1)
        sqlStr = 'call VARMA_MAIN_1T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 2)
        sqlStr = 'call VARMA_MAIN_2T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 3)
        sqlStr = 'call VARMA_MAIN_3T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 4)
        sqlStr = 'call VARMA_MAIN_4T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 5)
        sqlStr = 'call VARMA_MAIN_5T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 6)
        sqlStr = 'call VARMA_MAIN_6T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 7)
        sqlStr = 'call VARMA_MAIN_7T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 8)
        sqlStr = 'call VARMA_MAIN_8T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 9)
        sqlStr = 'call VARMA_MAIN_9T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 10)
        sqlStr = 'call VARMA_MAIN_10T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 11)
        sqlStr = 'call VARMA_MAIN_11T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 12)
        sqlStr = 'call VARMA_MAIN_12T(' + varmaDataTable + ', ?,?,?)';
    else if (varmaType == 13)
        sqlStr = 'call VARMA_MAIN_13T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 14)
        sqlStr = 'call VARMA_MAIN_14T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 15)
        sqlStr = 'call VARMA_MAIN_15T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 16)
        sqlStr = 'call VARMA_MAIN_16T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 17)
        sqlStr = 'call VARMA_MAIN_17T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 18)
        sqlStr = 'call VARMA_MAIN_18T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 19)
        sqlStr = 'call VARMA_MAIN_19T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 20)
        sqlStr = 'call VARMA_MAIN_20T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 21)
        sqlStr = 'call VARMA_MAIN_21T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 22)
        sqlStr = 'call VARMA_MAIN_22T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 23)
        sqlStr = 'call VARMA_MAIN_23T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 24)
        sqlStr = 'call VARMA_MAIN_24T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 25)
        sqlStr = 'call VARMA_MAIN_25T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 26)
        sqlStr = 'call VARMA_MAIN_26T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 27)
        sqlStr = 'call VARMA_MAIN_27T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 28)
        sqlStr = 'call VARMA_MAIN_28T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 29)
        sqlStr = 'call VARMA_MAIN_29T(' + varmaDataTable + ',?,?,?)';
    else if (varmaType == 30)
        sqlStr = 'call VARMA_MAIN_30T(' + varmaDataTable + ',?,?,?)';
    stmt=conn.prepare(sqlStr);
    var modelResults=stmt.exec();
    stmt.drop();
    

    console.log('_genVarmaModelsGroup Models Table Results Length:', modelResults.length);
    
    var models = [];
    modelGroup = modelResults[0].GROUP_ID;
    models.push(modelGroup);
    for (var i in modelResults)
    { 
        if (i > 0)
        {
            if( modelResults[i].GROUP_ID != modelResults[i-1].GROUP_ID)
            {
                models.push(modelResults[i].GROUP_ID);
            }
        }
    }

    var modelsObj = [];

    for (let i=0; i< modelResults.length; i++)
    {     
        let groupId = modelResults[i].GROUP_ID;
        let contentIndex = modelResults[i].CONTENT_INDEX;
        let contentValue = modelResults[i].CONTENT_VALUE;
        modelsObj.push({groupId,contentIndex,contentValue});

    }


    var fittedObj = [];

    sqlStr =  'SELECT * FROM PAL_VARMA_FIT_GRP_TAB WHERE GROUP_ID IN (SELECT GROUP_ID FROM ' + varmaDataTable + ')';

    stmt=conn.prepare(sqlStr);
    let fitResults = stmt.exec();
    stmt.drop();

    for (let i=0; i< fitResults.length; i++)
    {     
        let groupId = fitResults[i].GROUP_ID;
        let nameCol = fitResults[i].NAMECOL;
        let idx = fitResults[i].IDX;
        let fitting = fitResults[i].FITTING;
        let residual = fitResults[i].RESIDUAL;

        fittedObj.push({groupId,nameCol,idx,fitting,residual});
    }

    var irfObj = [];

    sqlStr =  'SELECT * FROM PAL_VARMA_IRF_GRP_TAB WHERE GROUP_ID IN (SELECT GROUP_ID FROM ' + varmaDataTable + ')';

    stmt=conn.prepare(sqlStr);
    let irfResults = stmt.exec();
    stmt.drop();

    for (let i=0; i< irfResults.length; i++)
    {     
        let groupId = irfResults[i].GROUP_ID;
        let col1 = irfResults[i].COL1;
        let col2 = irfResults[i].COL2;
        let idx = irfResults[i].IDX;
        let response = irfResults[i].RESPONSE;

        irfObj.push({groupId,col1,col2,idx,response});
    }

    

    var createtAtObj = new Date();
    let idObj = uuidv1();

    controlParameters = req.data.controlParameters;
    inGroups = [];
    inGroup = req.data.controlParameters[0].groupId;
    inGroups.push(inGroup);
    for (let i in controlParameters)
    { 
        if (i > 0)
        {
            if( controlParameters[i].groupId != controlParameters[i-1].groupId)
            {
                inGroups.push(controlParameters[i].groupId);
            }
        }
    }

    console.log("inGroups ", inGroups, "Number of Groups",inGroups.length);

    var tableObj = [];
    for (let grpIndex = 0; grpIndex < inGroups.length; grpIndex++)
    {
        let paramsGroupObj = [];
        let fittedGroupObj = [];	
        let irfGroupObj = [];	

        console.log("GROUP_ID ", inGroups[grpIndex]);

        
        for (let i = 0; i < controlParameters.length; i++)
        {
            if (inGroups[grpIndex] == controlParameters[i].groupId)
            {            
                let paramName = controlParameters[i].paramName;
                let intVal =  controlParameters[i].intVal
                let doubleVal = controlParameters[i].doubleVal;
                let strVal = controlParameters[i].strVal;
                paramsGroupObj.push({paramName,intVal,doubleVal,strVal});
            }
        }
        for (let i=0; i< fitResults.length; i++)
        {     
            if (inGroups[grpIndex] == fitResults[i].GROUP_ID)
            {
                let nameCol = fitResults[i].NAMECOL;
                let idx = fitResults[i].IDX;
                let fitting = fitResults[i].FITTING;
                let residual = fitResults[i].RESIDUAL;
                fittedGroupObj.push({nameCol,idx,fitting,residual});
            }
        }

        for (let i=0; i< irfResults.length; i++)
        {     
            if (inGroups[grpIndex] == irfResults[i].GROUP_ID)
            {
                let col1 = irfResults[i].COL1;
                let col2 = irfResults[i].COL2;
                let idx = irfResults[i].IDX;
                let response = irfResults[i].RESPONSE;

                irfGroupObj.push({col1,col2,idx,response});
            }
        }
    

        let grpStr=inGroups[grpIndex].split('#');
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


        console.log("_runRegressionVARMAGroup  grpStr ", grpStr, "profileId ", profileID, "type ", type, "GroupId ",GroupId, " location ", location, " product ", product);

        // var rowObj = {   varmaGroupID: idObj, createdAt : createtAtObj.toISOString(), 
        //     Location : location,
        //     Product : product,
        //     groupId : GroupId,
        //     Type : type,
        //     modelVersion : varmaModelVersion,
        //     profile : profileID,
        //     controlParameters:paramsGroupObj, 
        //     varmaType : req.data.varmaType,
        //     fittedOp : fittedGroupObj,
        //     irfOp : irfGroupObj};
        // tableObj.push(rowObj);

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
                    "'" + 'VARMA' + "'" + "," +
                    "'" + varmaModelVersion + "'" + "," +
                    "'" + profileID  + "'" + "," +
                    "'" + req.data.varmaType +  "'" + "," +
                    "'" + createtAtObj.toISOString() + "'" + ')' + ' WITH PRIMARY KEY';
            
        console.log("CP_OD_MODEL_VERSIONS VARMA sql update sqlStr", sqlStr);

        await cds.run(sqlStr);

    }


    // cqnQuery = {INSERT:{ into: { ref: ['CP_PALVARMABYGROUP'] }, entries:  tableObj }};

    // await cds.run(cqnQuery);

    let returnObj = [];	
    let createdAt = createtAtObj;
    let varmaID = idObj; //uuidObj;
    let varmaData = req.data.varmaData;
    let modelsOp = modelsObj;
    let fittedOp = fittedObj;
    let irfOp = irfObj;
    returnObj.push({varmaID, createdAt,controlParameters,varmaData,modelsOp, fittedOp,irfOp});

    var res = req._.req.res;
    res.send({"value":returnObj});

    console.log('Completed VARMA Models Generation for Groups Successfully');

    conn.disconnect(function(err) {
    if (err) throw err;
    console.log('disconnected');
    });
}

exports._runVarmaPredictions = async function(req) {

  var groupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

   var conn = hana.createConnection();

   conn.connect(conn_params);

   var sqlStr = 'SET SCHEMA ' + classicalSchema;  
   var stmt=conn.prepare(sqlStr);
   var results=stmt.exec();
   stmt.drop();

   sqlStr = 'SELECT COUNT(DISTINCT "GROUP_ID") AS "ModelExists" FROM "PAL_VARMA_MODEL_GRP_TAB" WHERE "GROUP_ID" = ' + "'" + groupId + "'";
   stmt=conn.prepare(sqlStr);
   results = stmt.exec();
   stmt.drop();
   console.log('_runVarmaPredictions - sqlStr : ', sqlStr);            

   var modelExists = results[0].ModelExists;
   console.log('_runVarmaPredictions - modelExists: ', modelExists);            

   if (modelExists == 0)
   {
      let predResults = [];
      var responseMessage = " Model Does not Exist For groupId : " + groupId;
      predResults.push(responseMessage);
      console.log('_runVarmaPredictions : Model Does not Exist For groupId', groupId); 
      let res = req._.req.res;
      res.statusCode = 400;
      res.send({"value":predResults});
      conn.disconnect(); 
      return;          
   }
   conn.disconnect(); 
     
   varmaFuncs._updateVarmaPredictionParams(req);
    
   varmaFuncs._updateVarmaPredictionData(req);

   await varmaFuncs._runPredictionVarmaGroup(req); 
}


exports._updateVarmaPredictionParams = function(req) {

    const varmaPredictionParams = req.data.predictionParameters;
     if (varmaPredictionParams.length == 0)
        return;

    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop(); 

    sqlStr = "DELETE FROM PAL_VARMA_PREDICT_CTRL_GRP_TAB";

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();
 
    var tableObj = [];	
        
    for (var i = 0; i < varmaPredictionParams.length; i++)
    {
        let groupId = varmaPredictionParams[i].groupId ;
        let paramName = varmaPredictionParams[i].paramName;
        let intVal =  varmaPredictionParams[i].intVal
        let doubleVal = varmaPredictionParams[i].doubleVal;
        let strVal = varmaPredictionParams[i].strVal;
        var rowObj = [];
        rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        tableObj.push(rowObj);
    }

    sqlStr = "INSERT INTO PAL_VARMA_PREDICT_CTRL_GRP_TAB(GROUP_ID,PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE) VALUES(?, ?, ?, ?, ?)";
    stmt = conn.prepare(sqlStr);
    stmt.execBatch(tableObj);
    stmt.drop();

    conn.disconnect();

}

exports._updateVarmaPredictionData = function(req) {

    
    const predictionData = req.data.predictionData;
    var varmaType = req.data.varmaType;

    let predGroupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    if (varmaType == 1)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_1T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 2)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_2T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 3)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_3T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 4)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_4T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 5)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_5T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 6)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_6T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 7)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_7T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 8)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_8T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 9)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_9T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 10)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_10T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 11)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_11T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 12)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_12T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 13)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_13T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 14)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_14T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 15)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_15T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 16)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_16T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 17)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_17T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 18)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_18T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 19)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_19T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 20)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_20T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 21)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_21T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 22)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_22T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 23)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_23T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 24)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_24T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 25)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_25T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 26)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_26T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 27)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_27T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 28)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_28T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 29)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_29T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (varmaType == 30)
        sqlStr = "DELETE FROM PAL_VARMA_PRED_DATA_GRP_TAB_30T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else
    {
        var res = req._.req.res;
        res.send({"Invalid VarmaType":varmaType});
        return;
    }

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();
    var tableObj = [];	
    
    let att1, att2, att3, att4, att5, att6, att7, att8, att9, att10, att11, att12, timestampIdx, groupId;
    let att13, att14, att15, att16, att17, att18, att19, att20;
    let att21, att22, att23, att24, att25, att26, att27, att28, att29, att30;
    for (var i = 0; i < predictionData.length; i++)
    {
        groupId = predictionData[i].groupId ;
        timestampIdx = predictionData[i].ID;

        att1 = predictionData[i].att1;
        if (varmaType > 1)
            att2 =  predictionData[i].att2;
        if (varmaType > 2)
            att3 = predictionData[i].att3;
        if (varmaType > 3)
            att4 = predictionData[i].att4;
        if (varmaType > 4)
            att5 = predictionData[i].att5;
        if (varmaType > 5)
            att6 = predictionData[i].att6;
        if (varmaType > 6)
            att7 = predictionData[i].att7;
        if (varmaType > 7)
            att8 = predictionData[i].att8;
        if (varmaType > 8)
            att9 = predictionData[i].att9;
        if (varmaType > 9)
            att10 = predictionData[i].att10;
        if (varmaType > 10)
            att11 = predictionData[i].att11;
        if (varmaType > 11)
            att12 = predictionData[i].att12;
        if (varmaType > 12)
            att13 = predictionData[i].att13;
        if (varmaType > 13)
            att14 = predictionData[i].att14;
        if (varmaType > 14)
            att15 = predictionData[i].att15;
        if (varmaType > 15)
            att16 = predictionData[i].att16;
        if (varmaType > 16)
            att17 = predictionData[i].att17;
        if (varmaType > 17)
            att18 = predictionData[i].att18;
        if (varmaType > 18)
            att19 = predictionData[i].att19;
        if (varmaType > 19)
            att20 = predictionData[i].att20;
        if (varmaType > 20)
            att21 = predictionData[i].att21;
        if (varmaType > 21)
            att22 =  predictionData[i].att22;
        if (varmaType > 22)
            att23 = predictionData[i].att23;
        if (varmaType > 23)
            att24 = predictionData[i].att24;
        if (varmaType > 24)
            att25 = predictionData[i].att25;
        if (varmaType > 25)
            att26 = predictionData[i].att26;
        if (varmaType > 26)
            att27 = predictionData[i].att27;
        if (varmaType > 27)
            att28 = predictionData[i].att28;
        if (varmaType > 28)
            att29 = predictionData[i].att29;
        if (varmaType > 29)
            att30 = predictionData[i].att30;

        var rowObj = [];
        if (varmaType == 1)
            rowObj.push(groupId,timestampIdx,att1);
        else if (varmaType == 2)
            rowObj.push(groupId,timestampIdx,att1,att2);
        else if (varmaType == 3)
            rowObj.push(groupId,timestampIdx,att1,att2,att3);
        else if (varmaType == 4)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4);
        else if (varmaType == 5)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5);
        else if (varmaType == 6)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6);
        else if (varmaType == 7)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7);
        else if (varmaType == 8)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8);
        else if (varmaType == 9)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9);
        else if (varmaType == 10)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10);
        else if (varmaType == 11)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11);
        else if (varmaType == 12)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12);
        else if (varmaType == 13)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13);       
        else if (varmaType == 14)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14);
        else if (varmaType == 15)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15);       
        else if (varmaType == 16)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16); 
        else if (varmaType == 17)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17);       
        else if (varmaType == 18)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18);
        else if (varmaType == 19)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19);       
        else if (varmaType == 20)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20); 
        else if (varmaType == 21)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21);       
        else if (varmaType == 22)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22);
        else if (varmaType == 23)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23);       
        else if (varmaType == 24)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24); 
        else if (varmaType == 25)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25);       
        else if (varmaType == 26)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26);
        else if (varmaType == 27)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27);       
        else if (varmaType == 28)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28); 
        else if (varmaType == 29)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29);       
        else if (varmaType == 30)
            rowObj.push(groupId,timestampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29,att30);
        tableObj.push(rowObj);
    }
    if (varmaType == 1)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_1T(GROUP_ID,TIMESTAMP,ATT1) VALUES(?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (varmaType == 2)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_2T(GROUP_ID,TIMESTAMP,ATT1,ATT2) VALUES(?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (varmaType == 3)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_3T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3) VALUES(?, ?, ?, ?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 4)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_4T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4) VALUES(?, ?, ?, ?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 5)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_5T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5) VALUES(?, ?, ?, ?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 6)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_6T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6) VALUES(?, ?, ?, ?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 7)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_7T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7) VALUES(?, ?, ?, ?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 8)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_8T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8) VALUES(?, ?, ?, ?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 9)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_9T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 10)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_10T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 11)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_11T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 12)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_12T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 13)
    {
        sqlStr = "INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_13T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12,ATT13) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 14)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_14T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 15)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_15T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 16)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_16T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 17)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_17T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 18)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_18T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 19)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_19T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 20)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_20T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 21)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_21T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 22)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_22T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 23)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_23T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 24)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_24T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 25)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_25T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 26)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_26T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 27)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_27T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 28)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_28T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 29)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_29T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (varmaType == 30)
    {
        sqlStr = 'INSERT INTO PAL_VARMA_PRED_DATA_GRP_TAB_30T(GROUP_ID,TIMESTAMP,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,ATT30) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    console.log(' _updateVarmaPredictionData sqlStr ', sqlStr);

    stmt.execBatch(tableObj);
    stmt.drop();
    conn.disconnect();
    console.log(' _updateVarmaPredictionData Completed ');
    
}

exports._runPredictionVarmaGroup = async function(req) {

    var conn = hana.createConnection();
 
    conn.connect(conn_params);

    var varmaType = req.data.varmaType;
    var version = req.data.Version;
    var scenario = req.data.Scenario;
    var modelVersion = req.data.modelVersion;
    let startDate = req.data.startDate;
    let endDate = req.data.endDate;

    console.log('_runPredictionVarmaGroup varmaType : ', varmaType);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    var results=stmt.exec();
    stmt.drop();

    let predGroupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

    var conn = hana.createConnection();

    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    let predictionObj = await varmaFuncs._runVarmaPrediction(req,varmaType, predGroupId, version, scenario, modelVersion,startDate, endDate);
    let predResults = [];
    predResults.push(predictionObj);
    let res = req._.req.res;
    res.send({"value":predResults});
    conn.disconnect();
}


exports._runVarmaPrediction = async function(req,varmaType, predGroupId, version, scenario, modelVersion,startDate, endDate) {


    console.log('_runVarmaPrediction - predGroupId', predGroupId, 'Version ', version, 'Scenario ', scenario, 'Model Version', modelVersion);

    var conn = hana.createConnection();
 
    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    let tabGroupId = predGroupId.replace(/-|"|'/g, '');
    let modelTableId = '"' + "#PAL_VARMA_MODEL_TAB_" + tabGroupId + '"';
    let predTableId = '"' + "#PAL_VARMA_PREDICTDATA_TAB_" + tabGroupId + '"';
    let GroupId = req.data.groupId; //primaryId;


    sqlStr = "create local temporary column table " + modelTableId + " " + 
                    "(\"CONTENT_INDEX\" INTEGER,\"CONTENT_VALUE\" NVARCHAR(5000))";


    stmt=conn.prepare(sqlStr);
    let result=stmt.exec();
    stmt.drop();

    sqlStr = 'INSERT INTO ' + modelTableId + ' SELECT "CONTENT_INDEX", "CONTENT_VALUE" FROM PAL_VARMA_MODEL_GRP_TAB WHERE PAL_VARMA_MODEL_GRP_TAB.GROUP_ID =' + "'" + predGroupId + "'";

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();
    var predDataObj = [];	

    if (varmaType == 1)
    {
 
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"TIMESTAMP\" integer,\"ATT1\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1" FROM PAL_VARMA_PRED_DATA_GRP_TAB_1T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_1T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1" FROM PAL_VARMA_PRED_DATA_GRP_TAB_1T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_1T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();
        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            predDataObj.push({GroupId,timeStampIdx,att1});
        }
    
    }
    else if (varmaType == 2)
    {
 
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2" FROM PAL_VARMA_PRED_DATA_GRP_TAB_2T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_2T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2" FROM PAL_VARMA_PRED_DATA_GRP_TAB_2T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_2T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();
        for (let i=0; i<predData.length; i++) 
        {
            //let groupId =  groupId;
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            predDataObj.push({GroupId,timeStampIdx,att1,att2});
        }
    
    }
    else if(varmaType == 3)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3"  FROM PAL_VARMA_PRED_DATA_GRP_TAB_3T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_3T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" FROM PAL_VARMA_PRED_DATA_GRP_TAB_3T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_3T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();
        //console.log('predData :', predData);

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3});
        }
    
    }
    else if(varmaType == 4)
    {
       sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4"  FROM PAL_VARMA_PRED_DATA_GRP_TAB_4T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_4T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4" FROM PAL_VARMA_PRED_DATA_GRP_TAB_4T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_4T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();

        for (let i=0; i<predData.length; i++) 
        {
            //let groupId =  groupId;
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4});
        }
    }
    else if(varmaType == 5)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5"  FROM PAL_VARMA_PRED_DATA_GRP_TAB_5T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_5T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5" FROM PAL_VARMA_PRED_DATA_GRP_TAB_5T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_5T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();

        for (let i=0; i<predData.length; i++) 
        {
            //let groupId =  groupId;
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5});
        }
    }
    else if(varmaType == 6)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double,\"ATT6\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6"  FROM PAL_VARMA_PRED_DATA_GRP_TAB_6T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_6T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6" FROM PAL_VARMA_PRED_DATA_GRP_TAB_6T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_6T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6});
        }
    }
    else if(varmaType == 7)
    {
        sqlStr = "create local temporary column table #PAL_VARMA_PREDICTDATA_TAB_" + grtabGroupIdoupId + " " + 
                        "(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double,\"ATT6\" double,\"ATT7\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7"  FROM PAL_VARMA_PRED_DATA_GRP_TAB_7T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_7T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7" FROM PAL_VARMA_PRED_DATA_GRP_TAB_7T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_7T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7});
        }
    }
    else if(varmaType == 8)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7", "ATT8"  FROM PAL_VARMA_PRED_DATA_GRP_TAB_8T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_8T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7", "ATT8" FROM PAL_VARMA_PRED_DATA_GRP_TAB_8T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_8T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8});
        }
    }
    else if(varmaType == 9)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7", "ATT8", "ATT9"  FROM PAL_VARMA_PRED_DATA_GRP_TAB_9T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_9T.GROUP_ID =' + "'" + predGroupId + "'";
        console.log("sqlStr = ",sqlStr);
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7", "ATT8", "ATT9" FROM PAL_VARMA_PRED_DATA_GRP_TAB_9T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_9T.GROUP_ID =' + "'" + predGroupId + "'";
        
        console.log("sqlStr ", sqlStr);
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9});
        }
    }
    else if(varmaType == 10)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7", "ATT8", "ATT9", "ATT10"  FROM PAL_VARMA_PRED_DATA_GRP_TAB_10T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_10T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7", "ATT8", "ATT9", "ATT10" FROM PAL_VARMA_PRED_DATA_GRP_TAB_10T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_10T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10});
        }
    }
    else if(varmaType == 11)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double))";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7", "ATT8", "ATT9", "ATT10", "ATT11"  FROM PAL_VARMA_PRED_DATA_GRP_TAB_11T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_11T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7", "ATT8", "ATT9", "ATT10", "ATT11" FROM PAL_VARMA_PRED_DATA_GRP_TAB_11T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_11T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11});
        }
    }
    else if(varmaType == 12)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        "(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,\"ATT12\" double))";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7", "ATT8", "ATT9", "ATT10", "ATT11", "ATT12"  FROM PAL_VARMA_PRED_DATA_GRP_TAB_12T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_12T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT5", "ATT6", "ATT7", "ATT8", "ATT9", "ATT10", "ATT11", "ATT12" FROM PAL_VARMA_PRED_DATA_GRP_TAB_12T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_12T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData=stmt.exec();
        stmt.drop();

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12});
        }
    }
    else if(varmaType == 13)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_13T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_13T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13"  ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_13T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_13T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13});
        }
    }
    else if(varmaType == 14)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_14T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_14T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14"  ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_14T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_14T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14});
        }
    }
    else if(varmaType == 15)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_15T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_15T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15"  ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_15T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_15T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15});
        }
    }
    else if(varmaType == 16)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_16T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_16T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16"  ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_16T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_16T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16});
        }
    }
    else if(varmaType == 17)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_17T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_17T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17"  ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_17T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_17T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17});
        }
    }
    else if(varmaType == 18)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_18T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_18T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18"  ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_18T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_18T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18});
        }
    }
    else if(varmaType == 19)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18" ' +
                 '"ATT19" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_19T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_19T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19" ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_19T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_19T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19});
        }
    }
    else if(varmaType == 20)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19" ' +
                 '"ATT20" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_20T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_20T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_20T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_20T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            let att20 =  predData[i].ATT20;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20});
        }
    }
    else if(varmaType == 21)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19" ' +
                 '"ATT20", "ATT21" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_21T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_21T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21" ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_21T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_21T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            let att20 =  predData[i].ATT20;
            let att21 =  predData[i].ATT21;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21});
        }
    }
    else if(varmaType == 22)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19" ' +
                 '"ATT20", "ATT21", "ATT22" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_22T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_22T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_22T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_22T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            let att20 =  predData[i].ATT20;
            let att21 =  predData[i].ATT21;
            let att22 =  predData[i].ATT22;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22});
        }
    }
    else if(varmaType == 23)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19" ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_23T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_23T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23" ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_23T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_23T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            let att20 =  predData[i].ATT20;
            let att21 =  predData[i].ATT21;
            let att22 =  predData[i].ATT22;
            let att23 =  predData[i].ATT23;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23});
        }
    }
    else if(varmaType == 24)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19" ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_24T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_24T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24" ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_24T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_24T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            let att20 =  predData[i].ATT20;
            let att21 =  predData[i].ATT21;
            let att22 =  predData[i].ATT22;
            let att23 =  predData[i].ATT23;
            let att24 =  predData[i].ATT24;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24});
        }
    }
    else if(varmaType == 25)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19" ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_25T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_25T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_25T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_25T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            let att20 =  predData[i].ATT20;
            let att21 =  predData[i].ATT21;
            let att22 =  predData[i].ATT22;
            let att23 =  predData[i].ATT23;
            let att24 =  predData[i].ATT24;
            let att25 =  predData[i].ATT25;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25});
        }
    }
    else if(varmaType == 26)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19" ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_26T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_26T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26" ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_26T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_26T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            let att20 =  predData[i].ATT20;
            let att21 =  predData[i].ATT21;
            let att22 =  predData[i].ATT22;
            let att23 =  predData[i].ATT23;
            let att24 =  predData[i].ATT24;
            let att25 =  predData[i].ATT25;
            let att26 =  predData[i].ATT26;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25,att26});
        }
    }
    else if(varmaType == 27)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19" ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_27T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_27T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_27T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_27T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            let att20 =  predData[i].ATT20;
            let att21 =  predData[i].ATT21;
            let att22 =  predData[i].ATT22;
            let att23 =  predData[i].ATT23;
            let att24 =  predData[i].ATT24;
            let att25 =  predData[i].ATT25;
            let att26 =  predData[i].ATT26;
            let att27 =  predData[i].ATT27;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25,att26,att27});
        }
    }
    else if(varmaType == 28)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double, \"ATT28\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19" ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27", "ATT28" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_28T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_28T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" , "ATT28" ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_28T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_28T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            let att20 =  predData[i].ATT20;
            let att21 =  predData[i].ATT21;
            let att22 =  predData[i].ATT22;
            let att23 =  predData[i].ATT23;
            let att24 =  predData[i].ATT24;
            let att25 =  predData[i].ATT25;
            let att26 =  predData[i].ATT26;
            let att27 =  predData[i].ATT27;
            let att28 =  predData[i].ATT28;
            
            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25,att26,att27,att28});
        }
    }
    else if(varmaType == 29)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double, \"ATT28\" double, \"ATT29\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19" ' +
                 '"ATT20", "ATT21","ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27", "ATT28", "ATT29"' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_29T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_29T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" , "ATT28" , "ATT29"' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_29T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_29T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            let att20 =  predData[i].ATT20;
            let att21 =  predData[i].ATT21;
            let att22 =  predData[i].ATT22;
            let att23 =  predData[i].ATT23;
            let att24 =  predData[i].ATT24;
            let att25 =  predData[i].ATT25;
            let att26 =  predData[i].ATT26;
            let att27 =  predData[i].ATT27;
            let att28 =  predData[i].ATT28;
            let att29 =  predData[i].ATT29;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25,att26,att27,att28,att29});
        }
    }
    else if(varmaType == 30)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +  
                        '(\"TIMESTAMP\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double, \"ATT28\" double, \"ATT29\" double, \"ATT30\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr ='INSERT INTO ' + predTableId   + ' SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19" ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27", "ATT28", "ATT29", "ATT30" ' +
                 ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_12T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_30T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "TIMESTAMP", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", '
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" , "ATT28" , "ATT29", "ATT30" ' + 
                ' FROM PAL_VARMA_PRED_DATA_GRP_TAB_30T WHERE PAL_VARMA_PRED_DATA_GRP_TAB_30T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let timeStampIdx =  predData[i].TIMESTAMP;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;
            let att10 =  predData[i].ATT10;
            let att11 =  predData[i].ATT11;
            let att12 =  predData[i].ATT12;
            let att13 =  predData[i].ATT13;
            let att14 =  predData[i].ATT14;
            let att15 =  predData[i].ATT15;
            let att16 =  predData[i].ATT16;
            let att17 =  predData[i].ATT17;
            let att18 =  predData[i].ATT18;
            let att19 =  predData[i].ATT19;
            let att20 =  predData[i].ATT20;
            let att21 =  predData[i].ATT21;
            let att22 =  predData[i].ATT22;
            let att23 =  predData[i].ATT23;
            let att24 =  predData[i].ATT24;
            let att25 =  predData[i].ATT25;
            let att26 =  predData[i].ATT26;
            let att27 =  predData[i].ATT27;
            let att28 =  predData[i].ATT28;
            let att29 =  predData[i].ATT29;
            let att30 =  predData[i].ATT30;

            predDataObj.push({GroupId,timeStampIdx,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25,att26,att27,att28,att29,att30});
        }
    }
    else
    {
        console.log('_runVarmaPrediction Invalid varmaType ', varmaType);
        return;
    }
    

    let paramTableId = '"' + "#PAL_VARMA_PREDICT_CTRL_TAB_" + tabGroupId + '"';

    sqlStr = "create local temporary column table " + paramTableId + " " +
                        "(\"PARAM_NAME\" varchar(100),\"INT_VALUE\" integer,\"double_VALUE\" double,\"STRING_VALUE\" varchar(100))";
    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();


    sqlStr = 'INSERT INTO ' + paramTableId + ' SELECT "PARAM_NAME", "INT_VALUE", "DOUBLE_VALUE", "STRING_VALUE" FROM PAL_VARMA_PREDICT_CTRL_GRP_TAB WHERE PAL_VARMA_PREDICT_CTRL_GRP_TAB.GROUP_ID =' + "'" +  predGroupId + "'";

    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();


    sqlStr = ' SELECT "PARAM_NAME", "INT_VALUE", "DOUBLE_VALUE", "STRING_VALUE" FROM PAL_VARMA_PREDICT_CTRL_GRP_TAB WHERE PAL_VARMA_PREDICT_CTRL_GRP_TAB.GROUP_ID =' + "'" +  predGroupId + "'";

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


    // sqlStr = "call _SYS_AFL.PAL_VARMA_FORECAST(" + "#PAL_VARMA_PREDICTDATA_TAB_" + tabGroupId + "," + "#PAL_VARMA_MODEL_TAB_" + tabGroupId + "," + "#PAL_VARMA_PREDICT_CTRL_TAB_" + tabGroupId + "," + "?)";
    sqlStr = "call _SYS_AFL.PAL_VARMA_FORECAST(" + predTableId + "," + modelTableId + "," + paramTableId + "," + "?)";

    stmt=conn.prepare(sqlStr);
    let predictionResults=stmt.exec();
    stmt.drop();

    console.log('After call _SYS_AFL.PAL_VARMA_FORECAST Response = ', new Date(), "predictionResults.length ", predictionResults.length);

    // --------------- BEGIN --------------------
    if(predictionResults.length > 0)
    {
        resultsObj = await _processPredictionsResponse(req, predictionResults, predGroupId, version, scenario, modelVersion, startDate, endDate)
    }
    else
    {
        console.log('NO PREDICTION RESULTS FOR _runVarmaPrediction tabGroupId ', tabGroupId);
        sqlStr = 'SELECT * FROM ' + predTableId;
        console.log('NO PREDICTION RESULTS FOR sqlStr ', sqlStr);
        stmt=conn.prepare(sqlStr);
        let predictionsFailedData = stmt.exec();
        stmt.drop();
        console.log("Input Data ", predictionsFailedData);
    }
    console.log('After call _processPredictionsResponse= ', new Date());
    conn.disconnect();    
    

    let returnObj = [];	
    let createdAt = new Date();
    let varmaID = uuidv1(); 
    let predictionParameters = predParamsObj;
    let predictionData = predDataObj;
    let predictedResults = resultsObj;
    returnObj.push({varmaID, createdAt,predictionParameters,varmaType,predictionData,predictedResults});

    return returnObj[0];
}

async function _processPredictionsResponse(req,predictionResults, predGroupId, version, scenario, modelVersion, startDate, endDate)
{
    console.log("processPredictionsResponse", "predGroupId ", predGroupId);
    // console.log("processPredictionsResponse", "predictionResults ", predictionResults);


    var groupId = predGroupId;    
    let profileId = req.data.profile;
    let odType = req.data.Type;
    let GroupId =  req.data.groupId;
    let location = req.data.Location;
    let product = req.data.Product

    var resultsObj = [];	
    for (let i=0; i<predictionResults.length; i++) 
    {
        let colName = predictionResults[i].COLNAME;
        let idx =  predictionResults[i].IDX;
        let forecast = predictionResults[i].FORECAST;
        let se = predictionResults[i].SE;
        let lo95 = predictionResults[i].LO95;
        let hi95 = predictionResults[i].HI95;

        resultsObj.push({GroupId,colName,idx,forecast,se,lo95,hi95});
    }	
 
    let startDateSql = "";
    let endDateSql = "";
    if (startDate !==undefined)
        startDateSql =  ' AND "PERIOD_NUM" >= CONCAT( YEAR (TO_DATE (\'' + startDate + '\'' + ', \'YYYY-MM-DD\')), lpad(WEEK (TO_DATE(\'' + startDate + '\'' +', \'YYYY-MM-DD\')),\'2\',\'00\') )';
    if (endDate !==undefined)   
        endDateSql =  ' AND "PERIOD_NUM" <= CONCAT( YEAR (TO_DATE (\'' + endDate + '\'' +', \'YYYY-MM-DD\')), lpad(WEEK (TO_DATE(\'' + endDate + '\'' + ', \'YYYY-MM-DD\')),\'2\',\'00\') ) ';

    
    // let tpGrpStr=groupId.split('#');
    // let tpGroupId = tpGrpStr[2] + '#' + tpGrpStr[3] + '#' + tpGrpStr[4];
    let tpGroupId = GroupId + '#' + location + '#' + product;   
    console.log('tpGroupId: ', tpGroupId);


    sqlStr = 'SELECT DISTINCT ' + '"' + vcConfigTimePeriod + '"' + 
            ' from  V_FUTURE_DEP_TS WHERE  "GroupID" = ' + "'" + tpGroupId + "'" +
            ' AND "Type" = ' + "'" + odType + "'" +
            ' AND "VERSION" = ' + "'" + version + "'" +
            ' AND "SCENARIO" = ' + "'" + scenario + "'" +
            startDateSql    + endDateSql +
            ' ORDER BY ' + '"' + vcConfigTimePeriod + '"' + ' ASC';
    var distPeriods= await cds.run(sqlStr);
    console.log("Time Periods for Group :", groupId, " Results: ", distPeriods);
    var predictedTime = new Date().toISOString();
    var trimmedPeriod = vcConfigTimePeriod.replace(/^(["]*)/g, '');
    console.log('resultsObj.length : ', resultsObj.length, 'distPeriods.length :', distPeriods.length);

    let tableObj = [];	
    let allPeriods = [];

// Update for only length of Results Object
    // for (var index=0; index<resultsObj.length; index++)
    for (var index=0; index<distPeriods.length; index++)

    {     
        
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
    // console.log("V_FUTURE_DEP_TS P SELECT sqlStr calDateResults ", calDateResults);
    console.log("tpGroupId ", tpGroupId, "calDateresults.length ", calDateResults.length, "resultsObj.length ", resultsObj.length);

    if (calDateResults.length > 0)
    {
        for (let index=0; index < resultsObj.length && index < calDateResults.length; index++)
        { 
            let predictedVal = resultsObj[index].forecast;
            predictedVal = ( +predictedVal).toFixed(2);
            // console.log(" predictedVal", predictedVal);

            let date =  calDateResults[index].CAL_DATE;
            let location =  calDateResults[index].Location ;
            let product = calDateResults[index].Product;
            let type = calDateResults[index].Type;
            let obj_dep = calDateResults[index].OBJ_DEP;
            let obj_counter =calDateResults[index].OBJ_COUNTER ;
            let modelType = 'VARMA'; 
            let mVersion = modelVersion ;
            let prfId = profileId;
            let version = calDateResults[index].VERSION;
            let scenario =calDateResults[index].SCENARIO;
            // let predVal =  predictedVal * calDateResults[index].OrderQuantity;
            let predTime = predictedTime;
            let status = 'SUCCESS';
 

            var rowObj = { CAL_DATE:date, LOCATION_ID:location, PRODUCT_ID:product,OBJ_TYPE:type,
                           OBJ_DEP:obj_dep, OBJ_COUNTER:obj_counter,MODEL_TYPE:modelType,
                           MODEL_VERSION:mVersion,MODEL_PROFILE:prfId,VERSION:version,SCENARIO:scenario,
                           PREDICTED:predictedVal,PREDICTED_TIME:predTime, OPT_STARTTIME:predTime, DELTA_TIME: predTime, PREDICTED_STATUS:status,
                           PRE_OPTIMIZED:predictedVal,PRE_OPTIMIZED_TIME:predTime, OPT_ALGORITHM:'NONE'};

            tableObj.push(rowObj);

            // sqlStr = 'UPSERT "CP_TS_PREDICTIONS" VALUES (' + "'" + result[0].CAL_DATE + "'" + "," +
            //             "'" + result[0].Location + "'" + "," +
            //             "'" + result[0].Product + "'" + "," +
            //             "'" + result[0].Type + "'" + "," +
            //             "'" + result[0].OBJ_DEP + "'" + "," +
            //             "'" + result[0].OBJ_COUNTER + "'" + "," +
            //             "'" + 'VARMA' + "'" + "," +
            //             "'" + modelVersion  + "'" + "," +
            //             "'" + profileId  + "'" + "," +
            //             "'" + result[0].VERSION + "'" + "," +
            //             "'" + result[0].SCENARIO + "'" + "," +
            //             "'" + predictedVal + "'" + "," +
            //             "'" + predictedTime + "'" + "," +
            //             "'" + 'SUCCESS' + "'" + "," +
            //             "'" + predictedVal + "'" + "," +
            //             "'" + predictedTime + "'" +')' + ' WITH PRIMARY KEY';
                
            // console.log("V_PREDICTIONS Predicted Value sql update sqlStr", sqlStr);


            // try {
            //     await cds.run(sqlStr);
            // }
            // catch (exception) {
            //     console.log("sqlStr ", sqlStr, "index = ", index, "periodId : ",periodId, "predictedVal : ", predictedVal);
            //     throw new Error(exception.toString());
            // }

            
        }

    }

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

    // for (let dIndex = 0; dIndex < delResults.length; dIndex++)
    // {
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
    // }


    cqnQuery = {INSERT:{ into: { ref: ['CP_TS_PREDICTIONS'] }, entries:  tableObj }};

    await cds.run(cqnQuery);
    return resultsObj;

}