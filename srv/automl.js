const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
const hana = require('@sap/hana-client');
const automlFuncs = require('./automl.js');


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
//     encrypt: 'TRUE',
//     sslValidateCertificate: false
// };
// const classicalSchema = "DB_CONFIG_PROD_CLIENT1"; 
// const vcConfigTimePeriod = "PERIOD_NUM";

exports._runAutomlRegressions = async function(req) {


    automlFuncs._updateAutomlGroupParams (req);   
  
    automlFuncs._updateAutomlGroupData(req);

    await automlFuncs._runRegressionAutomlGroup(req); 
  
}


exports._updateAutomlGroupParams = function(req) {
    const automlGroupParams = req.data.regressionParameters;

    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

// ---------- BEGIN OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS
    let inGroups = [];
    let modelGroup = automlGroupParams[0].groupId;
    inGroups.push(modelGroup);
    for (var i in automlGroupParams)
    { 
        if (i > 0)
        {
            if( automlGroupParams[i].groupId != automlGroupParams[i-1].groupId)
            {
                inGroups.push(automlGroupParams[i].groupId);
            }
        }
    }
    for (let i = 0; i < inGroups.length; i++)
    {
        sqlStr = "DELETE FROM PAL_AUTOML_PARAMETER_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

    }
// ---------- END OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS

    var tableObj = [];	
        
    for (let i = 0; i < automlGroupParams.length; i++)
    {
        let groupId = automlGroupParams[i].groupId ;
        let paramName = automlGroupParams[i].paramName;
        let intVal =  automlGroupParams[i].intVal
        let doubleVal = automlGroupParams[i].doubleVal;
        let strVal = automlGroupParams[i].strVal;
        var rowObj = [];
        rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        tableObj.push(rowObj);
        
    }

    sqlStr = "INSERT INTO PAL_AUTOML_PARAMETER_GRP_TAB(GROUP_ID,PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE) VALUES(?, ?, ?, ?, ?)";
    stmt = conn.prepare(sqlStr);
    stmt.execBatch(tableObj);
    stmt.drop();

    conn.disconnect();
}



exports._updateAutomlGroupData = function(req) {
    const automlGroupData = req.data.regressionData;

    var automlType = req.data.automlType;
    var modelVersion = req.data.modelVersion;


    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    if (automlType == 1)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_1T";
    else if (automlType == 2)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_2T";
    else if (automlType == 3)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_3T";
    else if (automlType == 4)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_4T";
    else if (automlType == 5)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_5T";
    else if (automlType == 6)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_6T";
    else if (automlType == 7)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_7T";
    else if (automlType == 8)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_8T";
    else if (automlType == 9)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_9T";
    else if (automlType == 10)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_10T";
    else if (automlType == 11)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_11T";
    else if (automlType == 12)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_12T";
    else if (automlType == 13)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_13T";
    else if (automlType == 14)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_14T";
    else if (automlType == 15)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_15T";
    else if (automlType == 16)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_16T";
    else if (automlType == 17)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_17T";
    else if (automlType == 18)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_18T";
    else if (automlType == 19)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_19T";
    else if (automlType == 20)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_20T";
    else if (automlType == 21)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_21T";
    else if (automlType == 22)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_22T";
    else if (automlType == 23)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_23T";
    else if (automlType == 24)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_24T";
    else if (automlType == 25)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_25T";
    else if (automlType == 26)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_26T";
    else if (automlType == 27)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_27T";
    else if (automlType == 28)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_28T";
    else if (automlType == 29)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_29T";
    else if (automlType == 30)
        sqlStr = "DELETE FROM PAL_AUTOML_FIT_DATA_GRP_TAB_30T";
    
    else
    {
        var res = req._.req.res;
        res.send({"Invalid AutomlType":automlType});
        return;
    }

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();


    var tableObj = [];	

    
    let att1, att2, att3, att4, att5, att6, att7, att8, att9, att10;
    let att11, att12, att13, att14, att15, att16, att17, att18, att19, att20;
    let att21, att22, att23, att24, att25, att26, att27, att28, att29, att30; 
    let target, ID, groupId;
    for (var i = 0; i < automlGroupData.length; i++)
    {
        groupId = automlGroupData[i].groupId ;
        ID = automlGroupData[i].ID;
        // target = Number.parseInt(automlGroupData[i].target);
        target = automlGroupData[i].target;

        // console.log("AUTOML index ", i, "target", target, "automlGroupData[i].target", automlGroupData[i].target);
        att1 = automlGroupData[i].att1;
        if (automlType > 1)
            att2 =  automlGroupData[i].att2;
        if (automlType > 2)
            att3 = automlGroupData[i].att3;
        if (automlType > 3)
            att4 = automlGroupData[i].att4;
        if (automlType > 4)
            att5 = automlGroupData[i].att5;
        if (automlType > 5)
            att6 = automlGroupData[i].att6;
        if (automlType > 6)
            att7 = automlGroupData[i].att7;
        if (automlType > 7)
            att8 = automlGroupData[i].att8;
        if (automlType > 8)
            att9 = automlGroupData[i].att9;
        if (automlType > 9)
            att10 = automlGroupData[i].att10;
        if (automlType > 10)
            att11 = automlGroupData[i].att11;
        if (automlType > 11)
            att12 = automlGroupData[i].att12;
        if (automlType > 12)
            att13 = automlGroupData[i].att13;
        if (automlType > 13)
            att14 =  automlGroupData[i].att14;
        if (automlType > 14)
            att15 = automlGroupData[i].att15;
        if (automlType > 15)
            att16 = automlGroupData[i].att16;
        if (automlType > 16)
            att17 = automlGroupData[i].att17;
        if (automlType > 17)
            att18 = automlGroupData[i].att18;
        if (automlType > 18)
            att19 = automlGroupData[i].att19;
        if (automlType > 19)
            att20 = automlGroupData[i].att20;
        if (automlType > 20)
            att21 = automlGroupData[i].att21;
        if (automlType > 21)
            att22 = automlGroupData[i].att22;
        if (automlType > 22)
            att23 = automlGroupData[i].att23;
        if (automlType > 23)
            att24 = automlGroupData[i].att24;
        if (automlType > 24)
            att25 = automlGroupData[i].att25;
        if (automlType > 25)
            att26 = automlGroupData[i].att26;
        if (automlType > 26)
            att27 = automlGroupData[i].att27;
        if (automlType > 27)
            att28 = automlGroupData[i].att28;
        if (automlType > 28)
            att29 = automlGroupData[i].att29;
        if (automlType > 29)
            att30 = automlGroupData[i].att30;
        var rowObj = [];
        if (automlType == 1)
            rowObj.push(groupId,ID, att1,target);
        else if (automlType == 2)
            rowObj.push(groupId,ID, att1,att2,target);
        else if (automlType == 3)
            rowObj.push(groupId,ID, att1,att2,att3,target);
        else if (automlType == 4)
            rowObj.push(groupId,ID, att1,att2,att3,att4,target);
        else if (automlType == 5)
            rowObj.push(groupId,ID, att1,att2,att3,att4,att5,target);
        else if (automlType == 6)
            rowObj.push(groupId,ID, att1,att2,att3,att4,att5,att6,target);
        else if (automlType == 7)
            rowObj.push(groupId,ID, att1,att2,att3,att4,att5,att6,att7,target);
        else if (automlType == 8)
            rowObj.push(groupId,ID, att1,att2,att3,att4,att5,att6,att7,att8,target);
        else if (automlType == 9)
            rowObj.push(groupId,ID, att1,att2,att3,att4,att5,att6,att7,att8,att9,target);
        else if (automlType == 10)
            rowObj.push(groupId,ID, att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,target);
        else if (automlType == 11)
            rowObj.push(groupId,ID, att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11, target);
        else if (automlType == 12)
            rowObj.push(groupId,ID, att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,target);
        else if (automlType == 13)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,target);       
        else if (automlType == 14)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,target);
        else if (automlType == 15)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,target);       
        else if (automlType == 16)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,target); 
        else if (automlType == 17)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,target);       
        else if (automlType == 18)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,target);
        else if (automlType == 19)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,target);       
        else if (automlType == 20)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,target); 
        else if (automlType == 21)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,target);       
        else if (automlType == 22)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,target);
        else if (automlType == 23)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,target);       
        else if (automlType == 24)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,target); 
        else if (automlType == 25)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,target);       
        else if (automlType == 26)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,target);
        else if (automlType == 27)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,target);       
        else if (automlType == 28)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,target); 
        else if (automlType == 29)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29,target);       
        else if (automlType == 30)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29,att30,target);
        tableObj.push(rowObj);
    }
    if (automlType == 1)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_1T(GROUP_ID,ID,ATT1,TARGET) VALUES(?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (automlType == 2)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_2T(GROUP_ID,ID,ATT1,ATT2,TARGET) VALUES(?, ?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (automlType == 3)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_3T(GROUP_ID,ID,ATT1,ATT2,ATT3,TARGET) VALUES(?, ?, ?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 4)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_4T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,TARGET) VALUES(?, ?, ?, ?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 5)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_5T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,TARGET) VALUES(?, ?, ?, ?, ?,?,?, ?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 6)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_6T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 7)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_7T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 8)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_8T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 9)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_9T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 10)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_10T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 11)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_11T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 12)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_12T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 13)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_13T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 14)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_14T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 15)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_15T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 16)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_16T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 17)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_17T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 18)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_18T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 19)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_19T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 20)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_20T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 21)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_21T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 22)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_22T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?,?,?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 23)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_23T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?,?,?, ?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 24)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_24T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?,?,?, ?, ?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 25)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_25T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 26)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_26T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 27)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_27T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?)';        
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 28)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_28T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?)';          
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 29)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_29T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?)';        
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 30)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_FIT_DATA_GRP_TAB_30T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,ATT30,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?,?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }

    console.log("AUTOML DATA sqlStr ", sqlStr);
    stmt.execBatch(tableObj);
    stmt.drop();
    conn.disconnect();
    console.log(' _updateAutomlGroupData Completed ');

}

exports._runRegressionAutomlGroup = async function(req) {

    var automlType = req.data.automlType;
    var automlModelVersion = req.data.modelVersion;


    var automlDataTable;
    let automlParamsTable = "PAL_AUTOML_PARAMETER_GRP_TAB";
    if (automlType == 1)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_1T";
    else if (automlType == 2)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_2T";
    else if (automlType == 3)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_3T";
    else if (automlType == 4)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_4T";
    else if (automlType == 5)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_5T";
    else if (automlType == 6)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_6T";
    else if (automlType == 7)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_7T";
    else if (automlType == 8)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_8T";
    else if (automlType == 9)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_9T";
    else if (automlType == 10)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_10T";
    else if (automlType == 11)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_11T";
    else if (automlType == 12)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_12T";
    else if (automlType == 13)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_13T";
    else if (automlType == 14)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_14T";
    else if (automlType == 15)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_15T";
    else if (automlType == 16)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_16T";
    else if (automlType == 17)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_17T";
    else if (automlType == 18)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_18T";
    else if (automlType == 19)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_19T";
    else if (automlType == 20)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_20T";
    else if (automlType == 21)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_21T";
    else if (automlType == 22)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_22T";
    else if (automlType == 23)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_23T";
    else if (automlType == 24)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_24T";
    else if (automlType == 25)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_25T";
    else if (automlType == 26)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_26T";
    else if (automlType == 27)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_27T";
    else if (automlType == 28)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_28T";
    else if (automlType == 29)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_29T";
    else if (automlType == 30)
        automlDataTable = "PAL_AUTOML_FIT_DATA_GRP_TAB_30T";
    var conn = hana.createConnection();
 
    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    // console.log('sqlStr: ', sqlStr);            
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();


////////////////////////////////////////////////////////////////////////////////////
    const automlGroupParams = req.data.regressionParameters;

    let inGroups = [];
    let inGroup = automlGroupParams[0].groupId;
    inGroups.push(inGroup);
    for (var i in automlGroupParams)
    { 
        if (i > 0)
        {
            if( automlGroupParams[i].groupId != automlGroupParams[i-1].groupId)
            {
                inGroups.push(automlGroupParams[i].groupId);
            }
        }
    }
    for (let i = 0; i < inGroups.length; i++)
    {

        sqlStr = "DELETE FROM PAL_AUTOML_MODEL_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  "DELETE FROM PAL_AUTOML_PIPELINES_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  "DELETE FROM PAL_AUTOML_STATS_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  "DELETE FROM PAL_AUTOML_ERROR_MSG_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();


    }

    // if (automlType == 1)
    //     sqlStr = 'call AUTOML_MAIN_1T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 2)
    //     sqlStr = 'call AUTOML_MAIN_2T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 3)
    //     sqlStr = 'call AUTOML_MAIN_3T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 4)
    //     sqlStr = 'call AUTOML_MAIN_4T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 5)
    //     sqlStr = 'call AUTOML_MAIN_5T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 6)
    //     sqlStr = 'call AUTOML_MAIN_6T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 7)
    //     sqlStr = 'call AUTOML_MAIN_7T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 8)
    //     sqlStr = 'call AUTOML_MAIN_8T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 9)
    //     sqlStr = 'call AUTOML_MAIN_9T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 10)
    //     sqlStr = 'call AUTOML_MAIN_10T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 11)
    //     sqlStr = 'call AUTOML_MAIN_11T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 12)
    //     sqlStr = 'call AUTOML_MAIN_12T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 13)
    //     sqlStr = 'call AUTOML_MAIN_13T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 14)
    //     sqlStr = 'call AUTOML_MAIN_14T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 15)
    //     sqlStr = 'call AUTOML_MAIN_15T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 16)
    //     sqlStr = 'call AUTOML_MAIN_16T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 17)
    //     sqlStr = 'call AUTOML_MAIN_17T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 18)
    //     sqlStr = 'call AUTOML_MAIN_18T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 19)
    //     sqlStr = 'call AUTOML_MAIN_19T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 20)
    //     sqlStr = 'call AUTOML_MAIN_20T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 21)
    //     sqlStr = 'call AUTOML_MAIN_21T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 22)
    //     sqlStr = 'call AUTOML_MAIN_22T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 23)
    //     sqlStr = 'call AUTOML_MAIN_23T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 24)
    //     sqlStr = 'call AUTOML_MAIN_24T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 25)
    //     sqlStr = 'call AUTOML_MAIN_25T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 26)
    //     sqlStr = 'call AUTOML_MAIN_26T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 27)
    //     sqlStr = 'call AUTOML_MAIN_27T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 28)
    //     sqlStr = 'call AUTOML_MAIN_28T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 29)
    //     sqlStr = 'call AUTOML_MAIN_29T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    // else if (automlType == 30)
    //     sqlStr = 'call AUTOML_MAIN_30T(' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';

    const { v4: uuidv4 } = require('uuid');
    const execId = inGroup; //uuidv4();
    if (automlType == 1)
        sqlStr = 'call AUTOML_MAIN_1T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 2)
        sqlStr = 'call AUTOML_MAIN_2T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 3)
        sqlStr = 'call AUTOML_MAIN_3T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 4)
        sqlStr = 'call AUTOML_MAIN_4T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 5)
        sqlStr = 'call AUTOML_MAIN_5T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 6)
        sqlStr = 'call AUTOML_MAIN_6T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 7)
        sqlStr = 'call AUTOML_MAIN_7T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 8)
        sqlStr = 'call AUTOML_MAIN_8T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 9)
        sqlStr = 'call AUTOML_MAIN_9T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 10)
        sqlStr = 'call AUTOML_MAIN_10T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 11)
        sqlStr = 'call AUTOML_MAIN_11T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 12)
        sqlStr = 'call AUTOML_MAIN_12T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 13)
        sqlStr = 'call AUTOML_MAIN_13T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 14)
        sqlStr = 'call AUTOML_MAIN_14T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 15)
        sqlStr = 'call AUTOML_MAIN_15T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 16)
        sqlStr = 'call AUTOML_MAIN_16T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 17)
        sqlStr = 'call AUTOML_MAIN_17T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 18)
        sqlStr = 'call AUTOML_MAIN_18T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 19)
        sqlStr = 'call AUTOML_MAIN_19T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 20)
        sqlStr = 'call AUTOML_MAIN_20T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 21)
        sqlStr = 'call AUTOML_MAIN_21T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 22)
        sqlStr = 'call AUTOML_MAIN_22T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 23)
        sqlStr = 'call AUTOML_MAIN_23T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 24)
        sqlStr = 'call AUTOML_MAIN_24T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 25)
        sqlStr = 'call AUTOML_MAIN_25T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 26)
        sqlStr = 'call AUTOML_MAIN_26T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 27)
        sqlStr = 'call AUTOML_MAIN_27T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 28)
        sqlStr = 'call AUTOML_MAIN_28T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 29)
        sqlStr = 'call AUTOML_MAIN_29T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    else if (automlType == 30)
        sqlStr = 'call AUTOML_MAIN_30T(' + "'" + execId + "'" + ',' + automlDataTable + ',' + automlParamsTable  + ',?,?,?,?)';
    let procedure = sqlStr;
    let resultTable = 'PAL_AUTOML_MODEL_GRP_TAB';
    const client = hana.createConnection();
    client.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    // console.log('sqlStr: ', sqlStr);            
    var stmt=client.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    try 
    {
        await insertExecutionRecord(execId, resultTable)
        let query = 'SELECT * FROM PAL_EXECUTION_STATUS WHERE EXEC_ID = ' + "'" + execId + "'";
        stmt=client.prepare(query);
        let rows = stmt.exec();
        stmt.drop(); 
        console.log("execId ", execId, "rows = ", rows); 
        console.log('Execution triggered. EXEC_ID:', execId);
        console.log('Execution triggered. inGroup:', inGroup);
        
        startBackgroundProcess(procedure,inGroup,automlType,automlModelVersion, execId);
        if(rows.length > 0)
        {
            let modelsObj = [];
            let pipelineObj = [];
            let statisticsObj = [];
            let returnObj = [];	
            let createdAt =  new Date();
            let regressionParameters = req.data.regressionParameters;
            let automlID = execId; //uuidv1(); //uuidObj;
            let regressionData = req.data.regressionData;
            let modelsOp = modelsObj;
            let pipelineOp = pipelineObj;
            let statisticsOp = statisticsObj;
            returnObj.push({automlID, createdAt,regressionParameters,regressionData,modelsOp, pipelineOp,statisticsOp});

            var res = req._.req.res;
            res.send({"value":returnObj});
            console.log("Completed AUTOML Regression Models Generation for GroupID  Successfully at ", new Date());
            client.disconnect();
        }
    } 
    catch (err) 
    {
        console.error('Insert error:', err);
    } 
    finally 
    {
        client.disconnect();
    }

    console.log("automl - Data Instertion sqlStr ", sqlStr);

}

function insertExecutionRecord(execId, resultTable) {
    // const insertStatus = 'INSERT INTO PAL_EXECUTION_STATUS (EXEC_ID, STATUS, RESULT_TABLE, START_TIME) ' +
    //                       ' VALUES (' + "'" + execId + "'" + ', \'PENDING\', ' + "'" + resultTable + "'" +
    //                       ', CURRENT_TIMESTAMP)';
    const insertStatus = 'UPSERT PAL_EXECUTION_STATUS (EXEC_ID, STATUS, RESULT_TABLE, START_TIME) ' +
                            ' VALUES (' + "'" + execId + "'" + ', \'PENDING\', ' + "'" + resultTable + "'" +
                            ', CURRENT_TIMESTAMP)' + ' WITH PRIMARY KEY';
    console.log("insertExecutionRecord insertStatus ", insertStatus);
    const client = hana.createConnection();
    client.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    // console.log('sqlStr: ', sqlStr);            
    var stmt=client.prepare(sqlStr);
    stmt.exec();
    stmt.drop();   
    stmt=client.prepare(insertStatus);
    let rows = stmt.exec();
    stmt.drop(); 
    console.log("insertExecutionRecord rows ", rows);
    client.disconnect();

}

  function startBackgroundProcess(automlExecQuery,inGroup,automlType, automlModelVersion, execId) {
    const script = './srv/palAutomlJob.js';
    const args = [automlExecQuery];
  
    const options = {
      detached: true,           // Allows the child to run independently of the parent
      stdio: 'ignore'           // Ignore stdio so parent doesn't wait for child output
    };

    const dbHostPort = cds.env.requires.db.credentials.host + ":" + cds.env.requires.db.credentials.port;
    const classicalSchema = process.env.classicalSchema;
    const uid = process.env.uidClassicalSchema;
    const pwd = process.env.uidClassicalSchemaPassword;

    // ENABLE FOR BAS
    // const classicalSchema = "DB_CONFIG_PROD_CLIENT1"; //process.env.classicalSchema;
    
    const { spawn } = require('child_process');

    // ENABLE THIS FOR BAS AND DISABLE FOR DEPLOYMENT
    // const childProcess = spawn('node', ['./srv/palAutomlJob.js',dbHostPort, ...args,execId,classicalSchema,inGroup,automlType, automlModelVersion,uid,pwd]);

    // DISABLE THIS FOR BAS AND ENABLE FOR DEPLOYMENT
    const childProcess = spawn('node', ['./srv/palAutomlJob.js',dbHostPort, ...args,execId,classicalSchema,inGroup,automlType, automlModelVersion,uid,pwd], options);
    console.log(`Spawned child with PID: ${childProcess.pid}`);

    // DISABLE THIS TO CAPTURE CHILD LOGS
    childProcess.unref();       // Detaches the child completely from the event loop

    //******** ENABLE THIS ON BAS FOR CAPTURING CHILD LOGS */
    // Capture logs from child
    // childProcess.stdout.on('data', (data) => {
    //     console.log(`[Child Log]: ${data}`);
    // });
    
    // childProcess.stderr.on('data', (data) => {
    //     console.error(`[Child Error]: ${data}`);
    // });
    
    // childProcess.on('exit', (code) => {
    //     console.log(`Child exited with code ${code}`);
    // });

  }

exports._runAutomlPredictions = async function(req) {
   var groupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

   var conn = hana.createConnection();

   conn.connect(conn_params);

   var sqlStr = 'SET SCHEMA ' + classicalSchema;  
   var stmt=conn.prepare(sqlStr);
   var results=stmt.exec();
   stmt.drop();

   sqlStr = 'SELECT COUNT(DISTINCT "GROUP_ID") AS "ModelExists" FROM "PAL_AUTOML_MODEL_GRP_TAB" WHERE "GROUP_ID" = ' + "'" + groupId + "'";
   stmt=conn.prepare(sqlStr);
   results = stmt.exec();
   stmt.drop();

   var modelExists = results[0].ModelExists;
   console.log('_runAutomlPredictions - modelExists: ', modelExists);            

   if (modelExists == 0)
   {
      let predResults = [];
      var responseMessage = " Model Does not Exist For groupId : " + groupId;
      predResults.push(responseMessage);
      console.log('_runAutomlPredictions : Model Does not Exist For groupId', groupId); 
      let res = req._.req.res;
      res.statusCode = 400;
      res.send({"value":predResults});
      conn.disconnect(); 
      return;          
   }
   conn.disconnect(); 
   
   
   automlFuncs._updateAutomlPredictionParams (req);
    
   automlFuncs._updateAutomlPredictionData(req);

   await automlFuncs._runPredictionAutomlGroup(req); 
  
}

exports._updateAutomlPredictionParams = function(req) {

    const automlPredictParams = req.data.predictionParameters;
  
    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    sqlStr = "DELETE FROM PAL_AUTOML_PREDICT_PARAMETER_GRP_TAB";

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    var tableObj = [];	
        
    for (var i = 0; i < automlPredictParams.length; i++)
    {
        let groupId = automlPredictParams[i].groupId ;
        let paramName = automlPredictParams[i].paramName;
        let intVal =  automlPredictParams[i].intVal
        let doubleVal = automlPredictParams[i].doubleVal;
        let strVal = automlPredictParams[i].strVal;
        var rowObj = [];
        rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        tableObj.push(rowObj);
    }

    sqlStr = "INSERT INTO PAL_AUTOML_PREDICT_PARAMETER_GRP_TAB(GROUP_ID,PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE) VALUES(?, ?, ?, ?, ?)";
    stmt = conn.prepare(sqlStr);
    stmt.execBatch(tableObj);
    stmt.drop();

    conn.disconnect();
}

exports._updateAutomlPredictionData = function(req) {

    const automlPredictData = req.data.predictionData;
    var automlType = req.data.automlType;

    let predGroupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

    var conn = hana.createConnection();

    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    if (automlType == 1)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_1T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 2)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_2T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 3)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_3T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 4)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_4T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 5)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_5T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 6)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_6T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 7)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_7T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 8)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_8T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 9)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_9T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 10)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_10T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 11)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_11T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 12)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_12T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 13)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_13T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 14)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_14T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 15)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_15T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 16)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_16T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 17)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_17T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 18)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_18T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 19)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_19T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 20)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_20T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 21)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_21T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 22)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_22T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 23)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_23T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 24)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_24T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 25)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_25T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 26)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_26T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 27)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_27T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 28)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_28T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 29)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_29T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else if (automlType == 30)
        sqlStr = "DELETE FROM PAL_AUTOML_PRED_DATA_GRP_TAB_30T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    else
    {
        var res = req._.req.res;
        res.send({"Invalid AutomlType":automlType});
        return;
    }

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    var tableObj = [];	
    
    let att1, att2, att3, att4, att5, att6, att7, att8, att9, att10;
    let att11, att12, att13, att14, att15, att16, att17, att18, att19, att20;
    let att21, att22, att23, att24, att25, att26, att27, att28, att29, att30,ID, groupId;
    for (var i = 0; i < automlPredictData.length; i++)
    {
        groupId = automlPredictData[i].groupId ;
        ID = automlPredictData[i].ID;
        att1 = automlPredictData[i].att1;
        if (automlType > 1)
            att2 =  automlPredictData[i].att2;
        if (automlType > 2)
            att3 = automlPredictData[i].att3;
        if (automlType > 3)
            att4 = automlPredictData[i].att4;
        if (automlType > 4)
            att5 = automlPredictData[i].att5;
        if (automlType > 5)
            att6 = automlPredictData[i].att6;
        if (automlType > 6)
            att7 = automlPredictData[i].att7;
        if (automlType > 7)
            att8 = automlPredictData[i].att8;
        if (automlType > 8)
            att9 = automlPredictData[i].att9;
        if (automlType > 9)
            att10 = automlPredictData[i].att10;
        if (automlType > 10)
            att11 = automlPredictData[i].att11;
        if (automlType > 11)
            att12 = automlPredictData[i].att12;
        if (automlType > 12)
            att13 = automlPredictData[i].att13;
        if (automlType > 13)
            att14 = automlPredictData[i].att14;
        if (automlType > 14)
            att15 = automlPredictData[i].att15;
        if (automlType > 15)
            att16 = automlPredictData[i].att16;
        if (automlType > 16)
            att17 = automlPredictData[i].att17;
        if (automlType > 17)
            att18 = automlPredictData[i].att18;
        if (automlType > 18)
            att19 = automlPredictData[i].att19;
        if (automlType > 19)
            att20 = automlPredictData[i].att20;
        if (automlType > 20)
            att21 =  automlPredictData[i].att21;
        if (automlType > 21)
            att22 =  automlPredictData[i].att22;
        if (automlType > 22)
            att23 = automlPredictData[i].att23;
        if (automlType > 23)
            att24 = automlPredictData[i].att24;
        if (automlType > 24)
            att25 = automlPredictData[i].att25;
        if (automlType > 25)
            att26 = automlPredictData[i].att26;
        if (automlType > 26)
            att27 = automlPredictData[i].att27;
        if (automlType > 27)
            att28 = automlPredictData[i].att28;
        if (automlType > 28)
            att29 = automlPredictData[i].att29;
        if (automlType > 29)
            att30 = automlPredictData[i].att30;
        var rowObj = [];
        if (automlType == 1)
            rowObj.push(groupId,ID,att1);
        else if (automlType == 2)
            rowObj.push(groupId,ID,att1,att2);
        else if (automlType == 3)
            rowObj.push(groupId,ID,att1,att2,att3);
        else if (automlType == 4)
            rowObj.push(groupId,ID,att1,att2,att3,att4);
        else if (automlType == 5)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5);
        else if (automlType == 6)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6);
        else if (automlType == 7)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7);
        else if (automlType == 8)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8);
        else if (automlType == 9)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9);
        else if (automlType == 10)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10); 
        else if (automlType == 11)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11);    
        else if (automlType == 12)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12);    
        else if (automlType == 13)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13);       
        else if (automlType == 14)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14);
        else if (automlType == 15)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15);       
        else if (automlType == 16)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16); 
        else if (automlType == 17)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17);       
        else if (automlType == 18)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18);
        else if (automlType == 19)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19);       
        else if (automlType == 20)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20); 
        else if (automlType == 21)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21);       
        else if (automlType == 22)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22);
        else if (automlType == 23)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23);       
        else if (automlType == 24)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24); 
        else if (automlType == 25)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25);       
        else if (automlType == 26)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26);
        else if (automlType == 27)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27);       
        else if (automlType == 28)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28); 
        else if (automlType == 29)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29);       
        else if (automlType == 30)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29,att30);

        tableObj.push(rowObj);
    }
    if (automlType == 1)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_1T(GROUP_ID,ID,ATT1) VALUES(?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (automlType == 2)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_2T(GROUP_ID,ID,ATT1,ATT2) VALUES(?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (automlType == 3)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_3T(GROUP_ID,ID,ATT1,ATT2,ATT3) VALUES(?, ?, ?, ?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 4)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_4T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4) VALUES(?, ?, ?, ?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 5)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_5T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5) VALUES(?, ?, ?, ?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 6)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_6T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6) VALUES(?, ?, ?, ?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 7)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_7T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7) VALUES(?, ?, ?, ?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }

    else if (automlType == 8)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_8T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8) VALUES(?, ?, ?, ?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 9)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_9T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 10)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_10T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 11)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_11T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 12)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_12T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 13)
    {
        sqlStr = "INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_13T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12,ATT13) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 14)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_14T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 15)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_15T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 16)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_16T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 17)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_17T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 18)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_18T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 19)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_19T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 20)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_20T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 21)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_21T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 22)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_22T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 23)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_23T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 24)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_24T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 25)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_25T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 26)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_26T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 27)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_27T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 28)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_28T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 29)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_29T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (automlType == 30)
    {
        sqlStr = 'INSERT INTO PAL_AUTOML_PRED_DATA_GRP_TAB_30T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,ATT30) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }

    stmt.execBatch(tableObj);
    stmt.drop();
    conn.disconnect();
    console.log(' _updateAutomlPredictionDataV1 Completed ');
}

exports._runPredictionAutomlGroup = async function(req) {

    var conn = hana.createConnection();
 
    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    var results=stmt.exec();
    stmt.drop();

    var automlType = req.data.automlType;
    var version = req.data.Version;
    var scenario = req.data.Scenario;
    var modelVersion = req.data.modelVersion;
    let startDate = req.data.startDate;
    let endDate = req.data.endDate;
    let predGroupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

    var conn = hana.createConnection();

    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    let predictionObj = await automlFuncs._runAutomlPrediction(req,automlType, predGroupId, version, scenario,modelVersion, startDate, endDate);

    let predResults = [];
    predResults.push(predictionObj);
    let res = req._.req.res;
    res.send({"value":predResults});
    conn.disconnect();

}

exports._runAutomlPrediction = async function(req,automlType, predGroupId, version, scenario, modelVersion, startDate, endDate) {


    var conn = hana.createConnection();
 


    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    var result=stmt.exec();
    stmt.drop();

    var groupId = predGroupId;

    let tabGroupId = predGroupId.replace(/-|"|'/g, '');
    
    let modelTableId = '"' + "#PAL_AUTOML_MODEL_TAB_" + tabGroupId + '"';
    let predTableId = '"' + "#PAL_AUTOML_PREDICTDATA_TAB_" + tabGroupId + '"';

    // let modelTableId = "#MODEL" + tabGroupId;
    // let predTableId =  "#PRED" + tabGroupId + '"';
    let GroupId = req.data.groupId; //primaryId;

    sqlStr = "create local temporary column table " + modelTableId + " " +  
                    "(\"GROUP_ID\" NVARCHAR(100),\"ROW_INDEX\" INTEGER,\"MODEL_CONTENT\" NVARCHAR(5000))";


    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();

    sqlStr = 'INSERT INTO ' + modelTableId + ' SELECT "GROUP_ID", "ROW_INDEX", "MODEL_CONTENT" FROM PAL_AUTOML_MODEL_GRP_TAB WHERE PAL_AUTOML_MODEL_GRP_TAB.GROUP_ID =' + "'" + predGroupId+ "'";

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();
    var predDataObj = [];	

    if (automlType == 1)
    {
 
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1" FROM PAL_AUTOML_PRED_DATA_GRP_TAB_1T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_1T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    
    }
    else if (automlType == 2)
    {
 
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2" FROM PAL_AUTOML_PRED_DATA_GRP_TAB_2T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_2T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    
    }
    else if(automlType == 3)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" FROM PAL_AUTOML_PRED_DATA_GRP_TAB_3T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_3T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 4)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4" FROM PAL_AUTOML_PRED_DATA_GRP_TAB_4T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_4T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 5)
    {
         sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5" FROM PAL_AUTOML_PRED_DATA_GRP_TAB_5T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_5T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 6)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" FROM PAL_AUTOML_PRED_DATA_GRP_TAB_6T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_6T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 7)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7"FROM PAL_AUTOML_PRED_DATA_GRP_TAB_7T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_7T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 8)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" FROM PAL_AUTOML_PRED_DATA_GRP_TAB_8T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_8T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 9)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" FROM PAL_AUTOML_PRED_DATA_GRP_TAB_9T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_9T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 10)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10" FROM PAL_AUTOML_PRED_DATA_GRP_TAB_10T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_10T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 11)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11" FROM PAL_AUTOML_PRED_DATA_GRP_TAB_11T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_11T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 12)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,\"ATT12\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12" FROM PAL_AUTOML_PRED_DATA_GRP_TAB_12T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_12T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 13)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_13T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_13T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 14)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_14T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_14T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 15)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_15T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_15T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 16)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_16T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_16T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 17)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_17T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_17T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 18)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_18T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_18T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 19)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", ' +
                 '"ATT19" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_19T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_19T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 20)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_20T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_20T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 21)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_21T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_21T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 22)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_22T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_22T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 23)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_23T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_23T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 24)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_24T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_24T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 25)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_25T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_25T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 26)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_26T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_26T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 27)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_27T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_27T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 28)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double, \"ATT28\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27", "ATT28" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_28T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_28T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 29)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double, \"ATT28\" double, \"ATT29\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21","ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27", "ATT28", "ATT29"' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_29T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_29T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else if(automlType == 30)
    {
        sqlStr = "create local temporary column table " + predTableId + " " +
                        '(\"GROUP_ID\" NVARCHAR(100),\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double, \"ATT28\" double, \"ATT29\" double, \"ATT30\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "GROUP_ID", "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27", "ATT28", "ATT29", "ATT30" ' +
                 ' FROM PAL_AUTOML_PRED_DATA_GRP_TAB_12T WHERE PAL_AUTOML_PRED_DATA_GRP_TAB_30T.GROUP_ID =' + "'" + predGroupId+ "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    else
    {
        console.log('_runAutomlPredictionV1 Invalid automlType ', automlType);
        return;
    }
    
    let paramTableId = '"' + "#PAL_AUTOML_PARAMETER_TAB_" + tabGroupId + '"';
    sqlStr =    "create local temporary column table " + paramTableId + " " +
                        "(\"GROUP_ID\" NVARCHAR(100),\"PARAM_NAME\" varchar(100),\"INT_VALUE\" integer,\"double_VALUE\" double,\"STRING_VALUE\" varchar(1000))";
    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();

    sqlStr = 'INSERT INTO ' + paramTableId + ' SELECT "GROUP_ID", "PARAM_NAME", "INT_VALUE", "DOUBLE_VALUE", "STRING_VALUE" FROM PAL_AUTOML_PREDICT_PARAMETER_GRP_TAB WHERE PAL_AUTOML_PREDICT_PARAMETER_GRP_TAB.GROUP_ID =' + "'" +  predGroupId + "'";

    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();

    // sqlStr = "call _SYS_AFL.PAL_PIPELINE_PREDICT(" + "#PAL_AUTOML_PREDICTDATA_TAB_" + tabGroupId + "," + "#PAL_AUTOML_MODEL_TAB_" + tabGroupId + "," + "#PAL_AUTOML_PARAMETER_TAB_" + tabGroupId + "," + "?, ?)";
    // sqlStr = "SELECT * FROM " + predTableId;
    // stmt=conn.prepare(sqlStr);
    // let tempData =stmt.exec();
    // stmt.drop();
    // console.log("predData from TEMP TABLE", tempData);
    
    sqlStr = "call _SYS_AFL.PAL_MASSIVE_PIPELINE_PREDICT(" + predTableId + "," + modelTableId + "," + paramTableId + "," + "?, ?,?)";

    console.log('_runAutomlPrediction sqlStr ', sqlStr);

    stmt=conn.prepare(sqlStr);
    let predictionResults =stmt.exec();
    // let predictionResults = outputs[0];
    stmt.drop();
    // console.log('Prediction Results ', predictionResults, predictionResults.length);
    console.log('After SYS_AFL.PAL_PIPELINE_PREDICT Response = ', new Date(), "predictionResults.length ", predictionResults.length);

    // --------------- BEGIN --------------------
    conn.disconnect();
    let resultsObj;	

    if(predictionResults.length > 0)
    {
        resultsObj = await _processPredictionsResponse(req,predictionResults, predGroupId, version, scenario, modelVersion, startDate, endDate)
    }
    else
    {
        console.log('NO PREDICTION RESULTS FOR _runRdtPrediction tabGroupId ', tabGroupId);
        sqlStr = 'SELECT * FROM ' + predTableId;
        console.log('NO PREDICTION RESULTS FOR sqlStr ', sqlStr);
        stmt=conn.prepare(sqlStr);
        let predictionsFailedData = stmt.exec();
        stmt.drop();
        console.log("Input Data ", predictionsFailedData);
    }
    console.log('After call _processPredictionsResponse= ', new Date());
    
    /********* Begin of Disable this part to View Input Data & Profile parameters */
    // DELETE INPUT DATA & PARAMETERS AFTER PREDICTIONS GENERATION

    // Validate input early
    if (automlType < 1 || automlType > 30) {
        return req.error(400, `Invalid automlType: ${automlType}`);
    }

    // Construct table name dynamically
    const tableName = `PAL_AUTOML_PRED_DATA_GRP_TAB_${automlType}T`;
    console.log("AUTOML Prediction tableName ", tableName, "predGroupId ", predGroupId);

    try {
        conn.connect(conn_params);

        // Optional: avoid SET SCHEMA if already configured in connection
        conn.exec(`SET SCHEMA ${classicalSchema}`);
        
        // Delete from dynamic table
        let stmt = conn.prepare(
            `DELETE FROM ${tableName} WHERE GROUP_ID = ?`
        );
        stmt.exec([predGroupId]);
        stmt.drop();


        // Delete from parameter table
        stmt = conn.prepare(
            `DELETE FROM PAL_AUTOML_PREDICT_PARAMETER_GRP_TAB WHERE GROUP_ID = ?`
        );
        stmt.exec([predGroupId]);
        stmt.drop();

    } catch (err) {
        console.error("DB Error:", err);
        req.error(500, err.message);
    } finally {
        conn.disconnect(); // IMPORTANT
    }
    
    /********* End of Disable this part to View Data & Profile parameters */
    conn.disconnect();    
    
    

    // console.log('resultsObj  ', resultsObj);


    var createtAtObj = new Date();
    //let idObj = groupId;
    let idObj = uuidv1();
    
    
    
    let returnObj = [];	
    let createdAt = createtAtObj;
    let automlID = idObj; 
    let predictionParameters = []
    let predictionData = predDataObj;
    let predictedResults = resultsObj;
    returnObj.push({automlID, createdAt,predictionParameters,automlType,predictionData,predictedResults});

    return returnObj[0];
}

async function _processPredictionsResponse(req,predictionResults, predGroupId, version, scenario, modelVersion, startDate, endDate)
{
    console.log("processPredictionsResponse", "predGroupId ", predGroupId);

    var groupId = predGroupId;    
    let profileId = req.data.profile;
    let odType = req.data.Type;
    let GroupId =  req.data.groupId;
    let location = req.data.Location;
    let product = req.data.Product;
    
    var resultsObj = [];	
    for (let i=0; i<predictionResults.length; i++) 
    {
        let id = predictionResults[i].ID;
        let scores =  predictionResults[i].SCORES;
   
        resultsObj.push({GroupId,id,scores});
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

    sqlStr = 'SELECT DISTINCT ' + '"' + vcConfigTimePeriod + '"' + 
            ' from  V_FUTURE_DEP_TS WHERE  "GroupID" = ' + "'" + tpGroupId + "'" + 
            ' AND "Type" = ' + "'" + odType + "'" +
            ' AND "VERSION" = ' + "'" + version + "'" +
            ' AND "SCENARIO" = ' + "'" + scenario + "'" +
            startDateSql    + endDateSql +
            ' ORDER BY ' + '"' + vcConfigTimePeriod + '"' + ' ASC';
    var distPeriods; // = await cds.run(sqlStr);
    try {
        distPeriods = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr V_FUTURE_DEP_TS ", sqlStr);
        throw new Error(exception.toString());
    }
    // console.log("Time Periods for Group :", tpGroupId, " Results: ", distPeriods, "periods#",distPeriods.length, "resultsObj Length ",resultsObj.length);
    var predictedTime = new Date().toISOString();
    var trimmedPeriod = vcConfigTimePeriod.replace(/^(["]*)/g, '');
    console.log("tpGroupId ", tpGroupId, "resultsObj.length ", resultsObj.length);


    let tableObj = [];	


    console.log('Before processing resultsObj in _processPredictionsResponse= ', new Date());

    let allPeriods = [];
    for (var index=0; index <distPeriods.length; index++)

    {     
        // let predictedVal = resultsObj[index].score;
        // predictedVal =  (+predictedVal).toFixed(2);
        // console.log("index ", index, "predictedVal ", predictedVal);
        let periodId = distPeriods[index][trimmedPeriod];
        allPeriods.push(periodId);

    }
    // console.log("allPeriods ", allPeriods);
    // allPeriods = allPeriods.replace(/^([']*)/g, '');
    // console.log("After Trimming allPeriods ", allPeriods);

    sqlStr = 'SELECT DISTINCT "CAL_DATE", "Location", "Product", "Type", "OBJ_DEP", "OBJ_COUNTER", "OrderQuantity", "VERSION", "SCENARIO" ' +
                ' FROM "V_FUTURE_DEP_TS" WHERE "GroupID" = ' + "'" + tpGroupId + "'" + 
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
   
    console.log("tpGroupId ", tpGroupId, "calDateresults.length ", calDateResults.length, "resultsObj.length ", resultsObj.length);

    if (calDateResults.length > 0)
    {
        // for (var index=0; index < resultsObj.length && index < calDateResults.length; index++)
        for (var index=0; index < resultsObj.length && index < calDateResults.length; index++)
        {     
            let predictedVal = resultsObj[index].scores;
            predictedVal =  (+predictedVal).toFixed(2);
           
            let date =  calDateResults[index].CAL_DATE;
            let location =  calDateResults[index].Location ;
            let product = calDateResults[index].Product;
            let type = calDateResults[index].Type;
            let obj_dep = calDateResults[index].OBJ_DEP;
            let obj_counter =calDateResults[index].OBJ_COUNTER ;
            let modelType = 'AUTOML'; 
            let mVersion = modelVersion ;
            let prfId = profileId;
            let version = calDateResults[index].VERSION;
            let scenario =calDateResults[index].SCENARIO;
            let predVal =  predictedVal * calDateResults[index].OrderQuantity;
            let predTime = predictedTime;
            let status = 'SUCCESS';
            if(predVal < 0)
            {
                predVal = 0;
            }

            var rowObj = { CAL_DATE:date, LOCATION_ID:location, PRODUCT_ID:product,OBJ_TYPE:type,
                            OBJ_DEP:obj_dep, OBJ_COUNTER:obj_counter,MODEL_TYPE:modelType,
                            MODEL_VERSION:mVersion,MODEL_PROFILE:prfId,VERSION:version,SCENARIO:scenario,
                            PREDICTED:predVal,PREDICTED_TIME:predTime,OPT_STARTTIME:predictedTime,DELTA_TIME:predictedTime,PREDICTED_STATUS:status,
                            PRE_OPTIMIZED:predVal,PRE_OPTIMIZED_TIME:predTime,OPT_ALGORITHM:'NONE'};
            // console.log("index ", index, "rowObj ", rowObj);
            tableObj.push(rowObj);



        }
    }
    console.log("tableObj.length ", tableObj.length);
  
    console.log('After tableObj.length Response = ', new Date());
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