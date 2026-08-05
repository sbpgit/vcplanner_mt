const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
const hana = require('@sap/hana-client');
const hgbtFuncs = require('./hgbt.js');
const { VALUE_IS_UNDEFINED } = require('@sap-cloud-sdk/util');


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


exports._runHgbtRegressionsV1 = async function(req) {


    hgbtFuncs._updateHgbtGroupParamsV1 (req);   
  
    hgbtFuncs._updateHgbtGroupDataV1(req);

    await hgbtFuncs._runRegressionHgbtGroupV1(req); 
  
}

exports._updateHgbtGroupParamsV1 = function(req) {
    const hgbtGroupParams = req.data.regressionParameters;

    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

// ---------- BEGIN OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS
    let inGroups = [];
    let modelGroup = hgbtGroupParams[0].groupId;
    inGroups.push(modelGroup);
    for (var i in hgbtGroupParams)
    { 
        if (i > 0)
        {
            if( hgbtGroupParams[i].groupId != hgbtGroupParams[i-1].groupId)
            {
                inGroups.push(hgbtGroupParams[i].groupId);
            }
        }
    }
    for (let i = 0; i < inGroups.length; i++)
    {
        sqlStr = "DELETE FROM PAL_HGBT_PARAMETER_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

    }
// ---------- END OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS

    var tableObj = [];	
        
    for (let i = 0; i < hgbtGroupParams.length; i++)
    {
        let groupId = hgbtGroupParams[i].groupId ;
        let paramName = hgbtGroupParams[i].paramName;
        let intVal =  hgbtGroupParams[i].intVal
        let doubleVal = hgbtGroupParams[i].doubleVal;
        let strVal = hgbtGroupParams[i].strVal;
        var rowObj = [];
        rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        tableObj.push(rowObj);
        
    }

    sqlStr = "INSERT INTO PAL_HGBT_PARAMETER_GRP_TAB(GROUP_ID,PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE) VALUES(?, ?, ?, ?, ?)";
    stmt = conn.prepare(sqlStr);
    stmt.execBatch(tableObj);
    stmt.drop();

    conn.disconnect();
}



exports._updateHgbtGroupDataV1 = function(req) {
    const hgbtGroupData = req.data.regressionData;

    // console.log("_updateHgbtGroupDataV1 ", hgbtGroupData)
    var hgbtType = req.data.hgbtType;
    var modelVersion = req.data.modelVersion;


    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    // DELETION Moved to After MODEL Generation as Data shall not be stored after Model generation

    // if (hgbtType == 1)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_1T";
    // else if (hgbtType == 2)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_2T";
    // else if (hgbtType == 3)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_3T";
    // else if (hgbtType == 4)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_4T";
    // else if (hgbtType == 5)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_5T";
    // else if (hgbtType == 6)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_6T";
    // else if (hgbtType == 7)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_7T";
    // else if (hgbtType == 8)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_8T";
    // else if (hgbtType == 9)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_9T";
    // else if (hgbtType == 10)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_10T";
    // else if (hgbtType == 11)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_11T";
    // else if (hgbtType == 12)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_12T";
    // else if (hgbtType == 13)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_13T";
    // else if (hgbtType == 14)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_14T";
    // else if (hgbtType == 15)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_15T";
    // else if (hgbtType == 16)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_16T";
    // else if (hgbtType == 17)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_17T";
    // else if (hgbtType == 18)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_18T";
    // else if (hgbtType == 19)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_19T";
    // else if (hgbtType == 20)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_20T";
    // else if (hgbtType == 21)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_21T";
    // else if (hgbtType == 22)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_22T";
    // else if (hgbtType == 23)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_23T";
    // else if (hgbtType == 24)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_24T";
    // else if (hgbtType == 25)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_25T";
    // else if (hgbtType == 26)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_26T";
    // else if (hgbtType == 27)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_27T";
    // else if (hgbtType == 28)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_28T";
    // else if (hgbtType == 29)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_29T";
    // else if (hgbtType == 30)
    //     sqlStr = "DELETE FROM PAL_HGBT_DATA_GRP_TAB_30T";
    // else
    // {
    //     var res = req._.req.res;
    //     res.send({"Invalid HgbtType":hgbtType});
    //     return;
    // }

    // stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();


    var tableObj = [];	

    
    let att1, att2, att3, att4, att5, att6, att7, att8, att9, att10;
    let att11, att12, att13, att14, att15, att16, att17, att18, att19, att20;
    let att21, att22, att23, att24, att25, att26, att27, att28, att29, att30;
    let target, groupId;
    for (var i = 0; i < hgbtGroupData.length; i++)
    {
        groupId = hgbtGroupData[i].groupId ;
        target = hgbtGroupData[i].target;

        att1 = hgbtGroupData[i].att1;
        if (hgbtType > 1)
            att2 =  hgbtGroupData[i].att2;
        if (hgbtType > 2)
            att3 = hgbtGroupData[i].att3;
        if (hgbtType > 3)
            att4 = hgbtGroupData[i].att4;
        if (hgbtType > 4)
            att5 = hgbtGroupData[i].att5;
        if (hgbtType > 5)
            att6 = hgbtGroupData[i].att6;
        if (hgbtType > 6)
            att7 = hgbtGroupData[i].att7;
        if (hgbtType > 7)
            att8 = hgbtGroupData[i].att8;
        if (hgbtType > 8)
            att9 = hgbtGroupData[i].att9;
        if (hgbtType > 9)
            att10 = hgbtGroupData[i].att10;
        if (hgbtType > 10)
            att11 = hgbtGroupData[i].att11;
        if (hgbtType > 11)
            att12 = hgbtGroupData[i].att12;
        if (hgbtType > 12)
            att13 = hgbtGroupData[i].att13;
        if (hgbtType > 13)
            att14 =  hgbtGroupData[i].att14;
        if (hgbtType > 14)
            att15 = hgbtGroupData[i].att15;
        if (hgbtType > 15)
            att16 = hgbtGroupData[i].att16;
        if (hgbtType > 16)
            att17 = hgbtGroupData[i].att17;
        if (hgbtType > 17)
            att18 = hgbtGroupData[i].att18;
        if (hgbtType > 18)
            att19 = hgbtGroupData[i].att19;
        if (hgbtType > 19)
            att20 = hgbtGroupData[i].att20;
        if (hgbtType > 20)
            att21 = hgbtGroupData[i].att21;
        if (hgbtType > 21)
            att22 = hgbtGroupData[i].att22;
        if (hgbtType > 22)
            att23 = hgbtGroupData[i].att23;
        if (hgbtType > 23)
            att24 = hgbtGroupData[i].att24;
        if (hgbtType > 24)
            att25 = hgbtGroupData[i].att25;
        if (hgbtType > 25)
            att26 = hgbtGroupData[i].att26;
        if (hgbtType > 26)
            att27 = hgbtGroupData[i].att27;
        if (hgbtType > 27)
            att28 = hgbtGroupData[i].att28;
        if (hgbtType > 28)
            att29 = hgbtGroupData[i].att29;
        if (hgbtType > 29)
            att30 = hgbtGroupData[i].att30;
        var rowObj = [];
        if (hgbtType == 1)
            rowObj.push(groupId,att1,target);
        else if (hgbtType == 2)
            rowObj.push(groupId,att1,att2,target);
        else if (hgbtType == 3)
            rowObj.push(groupId,att1,att2,att3,target);
        else if (hgbtType == 4)
            rowObj.push(groupId,att1,att2,att3,att4,target);
        else if (hgbtType == 5)
            rowObj.push(groupId,att1,att2,att3,att4,att5,target);
        else if (hgbtType == 6)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,target);
        else if (hgbtType == 7)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,target);
        else if (hgbtType == 8)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,target);
        else if (hgbtType == 9)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,target);
        else if (hgbtType == 10)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,target);
        else if (hgbtType == 11)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11, target);
        else if (hgbtType == 12)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,target);
        else if (hgbtType == 13)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,target);
        else if (hgbtType == 14)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,target);
        else if (hgbtType == 15)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,target);
        else if (hgbtType == 16)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,target);
        else if (hgbtType == 17)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,target);                       
        else if (hgbtType == 18)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,target);
        else if (hgbtType == 19)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,target);
        else if (hgbtType == 20)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,target);
        else if (hgbtType == 21)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                                att21,target); 
        else if (hgbtType == 22)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                                att21,att22,target);
        else if (hgbtType == 23)
        {
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                                att21,att22,att23,target);
        }
        else if (hgbtType == 24)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                                att21,att22,att23,att24,target);                     
        else if (hgbtType == 25)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                                att21,att22,att23,att24,att25,target);
        else if (hgbtType == 26)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                                att21,att22,att23,att24,att25,att26,target);
        else if (hgbtType == 27)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                                att21,att22,att23,att24,att25,att26,att27,target);
        else if (hgbtType == 28)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                                att21,att22,att23,att24,att25,att26,att27,att28,target); 
        else if (hgbtType == 29)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                                att21,att22,att23,att24,att25,att26,att27,att28,att29,target);
        else if (hgbtType == 30)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                                att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                                att21,att22,att23,att24,att25,att26,att27,att28,att29,att30,target); 
        tableObj.push(rowObj);
    }
    // console.log(" tableObj ", tableObj);
    if (hgbtType == 1)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_1T(GROUP_ID,ATT1,TARGET) VALUES(?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (hgbtType == 2)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_2T(GROUP_ID,ATT1,ATT2,TARGET) VALUES(?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (hgbtType == 3)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_3T(GROUP_ID,ATT1,ATT2,ATT3,TARGET) VALUES(?, ?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 4)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_4T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,TARGET) VALUES(?, ?, ?, ?, ?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 5)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_5T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,TARGET) VALUES(?, ?, ?, ?, ?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 6)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_6T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 7)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_7T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 8)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_8T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 9)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_9T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 10)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_10T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 11)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_11T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 12)
    {
        sqlStr = "INSERT INTO PAL_HGBT_DATA_GRP_TAB_12T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 13)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_13T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12,ATT13,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 14)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_14T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12,ATT13,ATT14,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 15)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_15T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12,ATT13,ATT14,ATT15,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 16)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_16T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 17)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_17T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 18)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_18T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 19)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_19T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 20)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_20T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 21)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_21T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 22)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_22T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 23)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_23T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 24)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_24T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                                                        ' ATT21,ATT22,ATT23,ATT24,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 25)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_25T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                                                        ' ATT21,ATT22,ATT23,ATT24,ATT25,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 26)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_26T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                                                        ' ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 27)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_27T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                                                        ' ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 28)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_28T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                                                        ' ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 29)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_29T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                                                        ' ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 30)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_DATA_GRP_TAB_30T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                                                        'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                                                        ' ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,ATT30,TARGET) ' +
                                                        ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    // console.log(" tableObj ", tableObj)
    stmt.execBatch(tableObj);
    stmt.drop();
    conn.disconnect();
    console.log(' _updateHgbtGroupData Completed ');

}

exports._runRegressionHgbtGroupV1 = async function(req) {

    var hgbtType = req.data.hgbtType;
    var hgbtModelVersion = req.data.modelVersion;
    if (hgbtType < 1 || hgbtType > 30) {
        throw new Error(`Invalid hgbtType: ${hgbtType}`);
    }

    const hgbtDataTable = `PAL_HGBT_DATA_GRP_TAB_${hgbtType}T`;
    var conn = hana.createConnection();
 
    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    // console.log('sqlStr: ', sqlStr);            
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();


////////////////////////////////////////////////////////////////////////////////////
    const hgbtGroupParams = req.data.regressionParameters;

    let inGroups = [];
    let inGroup = hgbtGroupParams[0].groupId;
    inGroups.push(inGroup);
    for (var i in hgbtGroupParams)
    { 
        if (i > 0)
        {
            if( hgbtGroupParams[i].groupId != hgbtGroupParams[i-1].groupId)
            {
                inGroups.push(hgbtGroupParams[i].groupId);
            }
        }
    }
    for (let i = 0; i < inGroups.length; i++)
    {

        sqlStr = "DELETE FROM PAL_HGBT_MODEL_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  "DELETE FROM PAL_HGBT_IMP_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  "DELETE FROM PAL_HGBT_CONFUSION_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  "DELETE FROM PAL_HGBT_STATS_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        //console.log('_runRegressionHgbtGroup sqlStr', sqlStr);
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

        sqlStr =  "DELETE FROM PAL_HGBT_PARAM_SELECTION_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

    }

    sqlStr = `call HGBT_MAIN_${hgbtType}T(${hgbtDataTable}, ?,?,?,?,?)`;
    // stmt=conn.prepare(sqlStr);
    // var modelResults=stmt.exec();
    // stmt.drop();

    const modelResults = await hgbtFuncs._execAsync(conn, sqlStr);
    
//    console.log("HGBT modelResults ", modelResults);
    var models = [];
    var modelGroup = modelResults[0].GROUP_ID;
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
        let rowIndex = modelResults[i].ROW_INDEX;
        let treeIndex = modelResults[i].TREE_INDEX;
        let modelContent = modelResults[i].MODEL_CONTENT;
        modelsObj.push({groupId,rowIndex,treeIndex,modelContent});

    }


    var impObj = [];

    sqlStr =  'SELECT * FROM PAL_HGBT_IMP_GRP_TAB WHERE GROUP_ID IN (SELECT GROUP_ID FROM ' + hgbtDataTable + ')';

    stmt=conn.prepare(sqlStr);
    let importanceResults = stmt.exec();
    stmt.drop();

    for (let i=0; i< importanceResults.length; i++)
    {     
        let groupId = importanceResults[i].GROUP_ID;
        let variableName = importanceResults[i].VARIABLE_NAME;
        let importance = importanceResults[i].IMPORTANCE;
        impObj.push({groupId,variableName,importance});
    }

    var statisticsObj = [];

    sqlStr =  'SELECT * FROM PAL_HGBT_STATS_GRP_TAB WHERE GROUP_ID IN (SELECT GROUP_ID FROM ' + hgbtDataTable + ')';

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

    sqlStr =  'SELECT * FROM PAL_HGBT_PARAM_SELECTION_GRP_TAB WHERE GROUP_ID IN (SELECT GROUP_ID FROM ' + hgbtDataTable + ')';

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
    var idObj = uuidv1();

    let cqnQuery = {INSERT:{ into: { ref: ['CP_PALHGBTREGRESSIONSV1'] }, entries: [
        {   hgbtID: idObj, 
            createdAt : createtAtObj.toISOString(), //2021-12-14T12:00:35.940Z', //new Date(), 
            Location : req.data.Location,
            Product : req.data.Product,
            regressionParameters:req.data.regressionParameters, 
            hgbtType : req.data.hgbtType,
            regressionData : req.data.regressionData, 
            modelsOp : modelsObj,
            importanceOp : impObj,
            statisticsOp : statisticsObj,
            paramSelectionOp : paramSelectionObj}
        ]}}
        
    // commenting out from Memory usage Perspective
    // await cds.run(cqnQuery);

    regressionParameters = req.data.regressionParameters;

    inGroups = [];
    inGroup = regressionParameters[0].groupId;
    inGroups.push(inGroup);
    
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
        let paramsGroupObj = [];
        let impGroupObj = [];
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
        for (let i=0; i< importanceResults.length; i++)
        {     
            if (inGroups[grpIndex] == importanceResults[i].GROUP_ID)
            {   
                let variableName = importanceResults[i].VARIABLE_NAME;
                let importance = importanceResults[i].IMPORTANCE;
                impGroupObj.push({variableName,importance});
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

        var rowObj = {   hgbtGroupID: idObj, 
            createdAt : createtAtObj.toISOString(),
            Location : location,
            Product : product,
            groupId : GroupId,
            Type : type,
            modelVersion : hgbtModelVersion,
            profile : profileID,
            regressionParameters:paramsGroupObj, 
            hgbtType : req.data.hgbtType,
            importanceOp : impGroupObj,
            statisticsOp : statsGroupObj,
            paramSelectionOp : paramSelectionGroupObj};
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
                    "'" + 'HGBT' + "'" + "," +
                    "'" + hgbtModelVersion + "'" + "," +
                    "'" + profileID  + "'" + "," +
                    "'" + req.data.hgbtType +  "'" + "," +
                    "'" + createtAtObj.toISOString() + "'" + ')' + ' WITH PRIMARY KEY';
        try {
            await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr exception ", sqlStr);
            throw new Error(exception.toString());
        }


        /********* Begin of Disable this part to View Input Data & Profile parameters */
        // DELETE INPUT DATA & PARAMETERS AFTER MODEL GENERATION
        const hgbtType = req.data.hgbtType;
        const groupId = inGroups[grpIndex]; //inGroups[i];

        // Validate input early
        if (hgbtType < 1 || hgbtType > 30) {
            return req.error(400, `Invalid HgbtType: ${hgbtType}`);
        }

        // Construct table name dynamically
        const tableName = `PAL_HGBT_DATA_GRP_TAB_${hgbtType}T`;
        console.log("HGBT tableName ", tableName, "groupId ", groupId);

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
                `DELETE FROM PAL_HGBT_PARAMETER_GRP_TAB WHERE GROUP_ID = ?`
            );
            stmt.exec([groupId]);
            stmt.drop();

        } catch (err) {
            console.error("DB Error:", err);
            req.error(500, err.message);
        }
        
        /********* Enf of Disable this part to View Data & Profile parameters */

       
    }



    // cqnQuery = {INSERT:{ into: { ref: ['CP_PALHGBTBYGROUP'] }, entries:  tableObj }};

    // await cds.run(cqnQuery);
   


    let returnObj = [];	
    let createdAt = createtAtObj;
    let hgbtID = idObj; //uuidObj;
    let regressionData = req.data.regressionData;
    let modelsOp = modelsObj;
    let importanceOp = impObj;
    let statisticsOp = statisticsObj;
    let paramSelectionOp = paramSelectionObj;
    returnObj.push({hgbtID, createdAt,regressionParameters,regressionData,modelsOp, importanceOp,statisticsOp,paramSelectionOp});

    var res = req._.req.res;
    res.send({"value":returnObj});

    console.log('Completed HGBT Regression Models Generation for Groups Successfully');



    conn.disconnect(function(err) {
    if (err) throw err;
    console.log('disconnected');
    });

}


exports._runHgbtPredictionsV1 = async function(req) {
   var groupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

   var conn = hana.createConnection();

   conn.connect(conn_params);

   var sqlStr = 'SET SCHEMA ' + classicalSchema;  
   var stmt=conn.prepare(sqlStr);
   var results=stmt.exec();
   stmt.drop();

   sqlStr = 'SELECT COUNT(DISTINCT "GROUP_ID") AS "ModelExists" FROM "PAL_HGBT_MODEL_GRP_TAB" WHERE "GROUP_ID" = ' + "'" + groupId + "'";
   stmt=conn.prepare(sqlStr);
   results = stmt.exec();
   stmt.drop();

   var modelExists = results[0].ModelExists;
   console.log('_runHgbtPredictions - modelExists: ', modelExists);            

   if (modelExists == 0)
   {
      let predResults = [];
      var responseMessage = " Model Does not Exist For groupId : " + groupId;
      predResults.push(responseMessage);
      console.log('_runHgbtPredictions : Model Does not Exist For groupId', groupId); 
      let res = req._.req.res;
      res.statusCode = 400;
      res.send({"value":predResults});
      conn.disconnect(); 
      return;          
   }
   conn.disconnect(); 
   
   
   await hgbtFuncs._updateHgbtPredictionParamsV1 (req);
    
   await hgbtFuncs._updateHgbtPredictionDataV1(req);

   await hgbtFuncs._runPredictionHgbtGroupV1(req); 
  
}

exports._updateHgbtPredictionParamsV1 = async function(req) {

    const hgbtPredictParams = req.data.predictionParameters;
  
    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    // sqlStr = "DELETE FROM PAL_HGBT_PREDICT_PARAMETER_GRP_TAB";

    // stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();

    var tableObj = [];	
        
    for (var i = 0; i < hgbtPredictParams.length; i++)
    {
        let groupId = hgbtPredictParams[i].groupId ;
        let paramName = hgbtPredictParams[i].paramName;
        let intVal =  hgbtPredictParams[i].intVal
        let doubleVal = hgbtPredictParams[i].doubleVal;
        let strVal = hgbtPredictParams[i].strVal;
        var rowObj = [];
        rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        tableObj.push(rowObj);
    }

    sqlStr = "INSERT INTO PAL_HGBT_PREDICT_PARAMETER_GRP_TAB(GROUP_ID,PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE) VALUES(?, ?, ?, ?, ?)";
    stmt = conn.prepare(sqlStr);
    stmt.execBatch(tableObj);
    stmt.drop();

    conn.disconnect();
}

exports._updateHgbtPredictionDataV1 = async function(req) {

    const hgbtPredictData = req.data.predictionData;
    var hgbtType = req.data.hgbtType;
    let predGroupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

    var conn = hana.createConnection();

    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    // if (hgbtType == 1)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_1T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 2)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_2T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 3)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_3T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 4)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_4T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 5)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_5T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 6)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_6T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 7)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_7T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 8)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_8T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 9)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_9T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 10)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_10T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 11)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_11T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 12)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_12T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 13)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_13T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 14)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_14T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 15)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_15T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 16)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_16T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 17)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_17T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 18)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_18T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 19)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_19T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 20)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_20T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 21)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_21T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 22)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_22T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 23)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_23T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 24)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_24T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 25)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_25T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 26)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_26T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 27)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_27T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 28)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_28T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 29)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_29T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (hgbtType == 30)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_30T WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else
    // {
    //     var res = req._.req.res;
    //     res.send({"Invalid HgbtType":hgbtType});
    //     return;
    // }

    console.log(" _updateHgbtPredictionDataV1 sqlStr ", sqlStr);


    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();
    var tableObj = [];	
    
    let att1, att2, att3, att4, att5, att6, att7, att8, att9, att10;
    let att11, att12, att13, att14, att15, att16, att17, att18, att19, att20;
    let att21, att22, att23, att24, att25, att26, att27, att28, att29, att30,ID, groupId;
    for (var i = 0; i < hgbtPredictData.length; i++)
    {
        groupId = hgbtPredictData[i].groupId ;
        ID = hgbtPredictData[i].ID;
        att1 = hgbtPredictData[i].att1;
        if (hgbtType > 1)
            att2 =  hgbtPredictData[i].att2;
        if (hgbtType > 2)
            att3 = hgbtPredictData[i].att3;
        if (hgbtType > 3)
            att4 = hgbtPredictData[i].att4;
        if (hgbtType > 4)
            att5 = hgbtPredictData[i].att5;
        if (hgbtType > 5)
            att6 = hgbtPredictData[i].att6;
        if (hgbtType > 6)
            att7 = hgbtPredictData[i].att7;
        if (hgbtType > 7)
            att8 = hgbtPredictData[i].att8;
        if (hgbtType > 8)
            att9 = hgbtPredictData[i].att9;
        if (hgbtType > 9)
            att10 = hgbtPredictData[i].att10;
        if (hgbtType > 10)
            att11 = hgbtPredictData[i].att11;
        if (hgbtType > 11)
            att12 = hgbtPredictData[i].att12;
        if (hgbtType > 12)
            att13 = hgbtPredictData[i].att13;
        if (hgbtType > 13)
            att14 = hgbtPredictData[i].att14;
        if (hgbtType > 14)
            att15 = hgbtPredictData[i].att15;
        if (hgbtType > 15)
            att16 = hgbtPredictData[i].att16;
        if (hgbtType > 16)
            att17 = hgbtPredictData[i].att17;
        if (hgbtType > 17)
            att18 = hgbtPredictData[i].att18;
        if (hgbtType > 18)
            att19 = hgbtPredictData[i].att19;
        if (hgbtType > 19)
            att20 = hgbtPredictData[i].att20;
        if (hgbtType > 20)
            att21 = hgbtPredictData[i].att21;
        if (hgbtType > 21)
            att22 = hgbtPredictData[i].att22;
        if (hgbtType > 22)
            att23 = hgbtPredictData[i].att23;
        if (hgbtType > 23)
            att24 = hgbtPredictData[i].att24;
        if (hgbtType > 24)
            att25 = hgbtPredictData[i].att25;
        if (hgbtType > 25)
            att26 = hgbtPredictData[i].att26;
        if (hgbtType > 26)
            att27 = hgbtPredictData[i].att27;
        if (hgbtType > 27)
            att28 = hgbtPredictData[i].att28;
        if (hgbtType > 28)
            att29 = hgbtPredictData[i].att29;
        if (hgbtType > 29)
            att30 = hgbtPredictData[i].att30;
        var rowObj = [];
        if (hgbtType == 1)
            rowObj.push(groupId,ID,att1);
        else if (hgbtType == 2)
            rowObj.push(groupId,ID,att1,att2);
        else if (hgbtType == 3)
            rowObj.push(groupId,ID,att1,att2,att3);
        else if (hgbtType == 4)
            rowObj.push(groupId,ID,att1,att2,att3,att4);
        else if (hgbtType == 5)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5);
        else if (hgbtType == 6)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6);
        else if (hgbtType == 7)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7);
        else if (hgbtType == 8)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8);
        else if (hgbtType == 9)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9);
        else if (hgbtType == 10)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10); 
        else if (hgbtType == 11)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11);    
        else if (hgbtType == 12)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12); 
        else if (hgbtType == 13)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13);   
        else if (hgbtType == 14)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14);  
        else if (hgbtType == 15)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15); 
        else if (hgbtType == 16)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16);
        else if (hgbtType == 17)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17);  
        else if (hgbtType == 18)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18); 
        else if (hgbtType == 19)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19);
        else if (hgbtType == 20)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20);  
        else if (hgbtType == 21)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21); 
        else if (hgbtType == 22)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22);
        else if (hgbtType == 23)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23);  
        else if (hgbtType == 24)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24); 
        else if (hgbtType == 25)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25);
        else if (hgbtType == 26)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26);  
        else if (hgbtType == 27)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27); 
        else if (hgbtType == 28)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28);
        else if (hgbtType == 29)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29);  
        else if (hgbtType == 30)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29,att30); 
        tableObj.push(rowObj);
    }
    if (hgbtType == 1)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_1T(GROUP_ID,ID,ATT1) VALUES(?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (hgbtType == 2)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_2T(GROUP_ID,ID,ATT1,ATT2) VALUES(?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (hgbtType == 3)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_3T(GROUP_ID,ID,ATT1,ATT2,ATT3) VALUES(?, ?, ?, ?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 4)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_4T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4) VALUES(?, ?, ?, ?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 5)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_5T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5) VALUES(?, ?, ?, ?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 6)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_6T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6) VALUES(?, ?, ?, ?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 7)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_7T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7) VALUES(?, ?, ?, ?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }

    else if (hgbtType == 8)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_8T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8) VALUES(?, ?, ?, ?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 9)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_9T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 10)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_10T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 11)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_11T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 12)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_12T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 13)
    {
        sqlStr = "INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_13T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12,ATT13) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 14)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_14T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 15)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_15T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 16)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_16T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 17)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_17T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 18)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_18T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 19)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_19T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 20)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_20T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 21)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_21T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 22)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_22T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 23)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_23T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 24)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_24T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 25)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_25T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 26)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_26T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 27)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_27T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 28)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_28T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 29)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_29T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (hgbtType == 30)
    {
        sqlStr = 'INSERT INTO PAL_HGBT_PRED_DATA_GRP_TAB_30T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,ATT30) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    stmt.execBatch(tableObj);
    stmt.drop();
    conn.disconnect();
    console.log(' _updateHgbtPredictionDataV1 Completed ');
}

exports._runPredictionHgbtGroupV1 = async function(req) {

    var conn = hana.createConnection();
 
    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    var results=stmt.exec();
    stmt.drop();

    var hgbtType = req.data.hgbtType;
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

    // if (hgbtType == 1)
    //     sqlStr = "DELETE FROM PAL_HGBT_PRED_DATA_GRP_TAB_1T WHERE GROUP_ID = " + "'" + predGroupId + "'";

    let predictionObj = await hgbtFuncs._runHgbtPredictionV1(req, hgbtType, predGroupId, version, scenario,modelVersion, impactAnalysis, startDate, endDate);
    let predResults = [];
    predResults.push(predictionObj);
    let res = req._.req.res;
    res.send({"value":predResults});
    conn.disconnect();

}

exports._runHgbtPredictionV1 = async function(req, hgbtType, predGroupId, version, scenario, modelVersion, impactAnalysis,startDate, endDate) {


    var conn = hana.createConnection();
 


    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    var result=stmt.exec();
    stmt.drop();

    // var groupId = predGroupId;
    // console.log("_runHgbtPredictionV1 predGroupId", predGroupId);
    let tabGroupId = predGroupId.replace(/-|"|'/g, '')
    
    let modelTableId = '"' + "#PAL_HGBT_MODEL_TAB_" + tabGroupId + '"';
    let predTableId = '"' + "#PAL_HGBT_PREDICTDATA_TAB_" + tabGroupId + '"'
    let GroupId = req.data.groupId; //primaryId;


    // sqlStr = "create local temporary column table #PAL_HGBT_MODEL_TAB_"+ tabGroupId + " " + 
    //                 "(\"ROW_INDEX\" INTEGER,\"TREE_INDEX\" INTEGER,\"MODEL_CONTENT\" NCLOB)"; // MEMORY THRESHOLD 1000)";
    sqlStr = "create local temporary column table " + modelTableId + " " + 
                "(\"ROW_INDEX\" INTEGER,\"TREE_INDEX\" INTEGER,\"MODEL_CONTENT\" NCLOB)"; // MEMORY THRESHOLD 1000)";

    console.log(" _runHgbtPredictionV1 sqlStr ", sqlStr);

    try
    {
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
    }
    catch(exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }
    // sqlStr = 'INSERT INTO ' + '#PAL_HGBT_MODEL_TAB_'+ tabGroupId + ' SELECT "ROW_INDEX", "TREE_INDEX", "MODEL_CONTENT" FROM PAL_HGBT_MODEL_GRP_TAB WHERE PAL_HGBT_MODEL_GRP_TAB.GROUP_ID =' + "'" + predGroupId + "'";

    sqlStr = 'INSERT INTO ' + modelTableId + ' SELECT "ROW_INDEX", "TREE_INDEX", "MODEL_CONTENT" FROM PAL_HGBT_MODEL_GRP_TAB WHERE PAL_HGBT_MODEL_GRP_TAB.GROUP_ID =' + "'" + predGroupId + "'";

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();
    var predDataObj = [];	

    if (hgbtType == 1)
    {
 
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1" FROM PAL_HGBT_PRED_DATA_GRP_TAB_1T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_1T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1" FROM PAL_HGBT_PRED_DATA_GRP_TAB_1T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_1T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        var predData = result;

        for (var i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].ATT1;
            predDataObj.push({GroupId,id,att1});
        }
    
    }
    else if (hgbtType == 2)
    {
 
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2" FROM PAL_HGBT_PRED_DATA_GRP_TAB_2T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_2T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2" FROM PAL_HGBT_PRED_DATA_GRP_TAB_2T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_2T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        var predData = result;

        for (var i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            predDataObj.push({GroupId,id,att1,att2});
        }
    
    }
    else if(hgbtType == 3)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" FROM PAL_HGBT_PRED_DATA_GRP_TAB_3T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_3T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3" FROM PAL_HGBT_PRED_DATA_GRP_TAB_3T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_3T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        let predData =stmt.exec();
        stmt.drop();


        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            predDataObj.push({GroupId,id,att1,att2,att3});
        }
    }
    else if(hgbtType == 4)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4" FROM PAL_HGBT_PRED_DATA_GRP_TAB_4T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_4T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4" FROM PAL_HGBT_PRED_DATA_GRP_TAB_4T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_4T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            predDataObj.push({GroupId,id,att1,att2,att3,att4});
        }
    }
    else if(hgbtType == 5)
    {
         sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5" FROM PAL_HGBT_PRED_DATA_GRP_TAB_5T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_5T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4" , "ATT5" FROM PAL_HGBT_PRED_DATA_GRP_TAB_5T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_5T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5});
        }
    }
    else if(hgbtType == 6)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" FROM PAL_HGBT_PRED_DATA_GRP_TAB_6T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_6T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6" FROM PAL_HGBT_PRED_DATA_GRP_TAB_6T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_6T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;


            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6});
        }
    }
    else if(hgbtType == 7)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7"FROM PAL_HGBT_PRED_DATA_GRP_TAB_7T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_7T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" FROM PAL_HGBT_PRED_DATA_GRP_TAB_7T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_7T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;


            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7});
        }
    }
    else if(hgbtType == 8)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" FROM PAL_HGBT_PRED_DATA_GRP_TAB_8T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_8T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" FROM PAL_HGBT_PRED_DATA_GRP_TAB_8T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_8T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;


            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8});
        }
    }
    else if(hgbtType == 9)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" FROM PAL_HGBT_PRED_DATA_GRP_TAB_9T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_9T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9" FROM PAL_HGBT_PRED_DATA_GRP_TAB_9T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_9T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
            let att1 =  predData[i].ATT1;
            let att2 =  predData[i].ATT2;
            let att3 =  predData[i].ATT3;
            let att4 =  predData[i].ATT4;
            let att5 =  predData[i].ATT5;
            let att6 =  predData[i].ATT6;
            let att7 =  predData[i].ATT7;
            let att8 =  predData[i].ATT8;
            let att9 =  predData[i].ATT9;


            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9});
        }
    }
    else if(hgbtType == 10)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10" FROM PAL_HGBT_PRED_DATA_GRP_TAB_10T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_10T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10" FROM PAL_HGBT_PRED_DATA_GRP_TAB_10T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_10T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;
        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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


            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10});
        }
    }
    else if(hgbtType == 11)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11" FROM PAL_HGBT_PRED_DATA_GRP_TAB_11T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_11T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", "ATT11" FROM PAL_HGBT_PRED_DATA_GRP_TAB_11T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_11T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;
        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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


            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11});
        }
    }
    else if(hgbtType == 12)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,\"ATT12\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12" FROM PAL_HGBT_PRED_DATA_GRP_TAB_12T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_12T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", "ATT11", "ATT12" FROM PAL_HGBT_PRED_DATA_GRP_TAB_12T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_12T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12});
        }
    }
    else if(hgbtType == 13)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ," +
                        "\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double," +
                        "\"ATT12\" double, \"ATT13\" double )";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_13T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_13T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13"  ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_13T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_13T.GROUP_ID =' + "'" + predGroupId + "'";

        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13});
        }
    }
    else if(hgbtType == 14)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_14T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_14T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14"  ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_14T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_14T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14});
        }
    }
    else if(hgbtType == 15)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_15T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_15T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15"  ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_15T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_15T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15});
        }
    }
    else if(hgbtType == 16)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_16T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_16T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16"  ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_16T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_16T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16});
        }
    }
    else if(hgbtType == 17)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_17T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_17T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17"  ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_17T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_17T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17});
        }
    }
    else if(hgbtType == 18)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double )';
        console.log("hgbtType = ", hgbtType,"sqlStr ", sqlStr);

        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_18T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_18T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18"  ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_18T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_18T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18});
        }
    }
    else if(hgbtType == 19)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", ' +
                 '"ATT19" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_19T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_19T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19" ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_19T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_19T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19});
        }
    }
    else if(hgbtType == 20)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_20T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_20T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_20T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_20T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20});
        }
    }
    else if(hgbtType == 21)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_21T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_21T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21" ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_21T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_21T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21});
        }
    }
    else if(hgbtType == 22)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_22T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_22T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_22T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_22T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22});
        }
    }
    else if(hgbtType == 23)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_23T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_23T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23" ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_23T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_23T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23});
        }
    }
    else if(hgbtType == 24)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_24T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_24T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24" ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_24T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_24T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24});
        }
    }
    else if(hgbtType == 25)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_25T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_25T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_25T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_25T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25});
        }
    }
    else if(hgbtType == 26)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_26T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_26T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26" ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_26T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_26T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25,att26});
        }
    }
    else if(hgbtType == 27)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_27T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_27T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_27T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_27T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25,att26,att27});
        }
    }
    else if(hgbtType == 28)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double, \"ATT28\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27", "ATT28" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_28T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_28T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" , "ATT28" ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_28T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_28T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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
            
            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25,att26,att27,att28});
        }
    }
    else if(hgbtType == 29)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double, \"ATT28\" double, \"ATT29\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21","ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27", "ATT28", "ATT29"' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_29T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_29T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" , "ATT28" , "ATT29"' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_29T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_29T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25,att26,att27,att28,att29});
        }
    }
    else if(hgbtType == 30)
    {
        sqlStr = "create local temporary column table  " + predTableId + "  " +  
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double, \"ATT19\" double, \"ATT20\" double, \"ATT21\" double, ' +
                        '\"ATT22\" double, \"ATT23\" double, \"ATT24\" double, \"ATT25\" double, \"ATT26\" double, ' +
                        '\"ATT27\" double, \"ATT28\" double, \"ATT29\" double, \"ATT30\" double)';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18", "ATT19", ' +
                 '"ATT20", "ATT21", "ATT22", "ATT23", "ATT24", "ATT25", "ATT26", "ATT27", "ATT28", "ATT29", "ATT30" ' +
                 ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_30T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_30T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" , "ATT28" , "ATT29", "ATT30" ' + 
                ' FROM PAL_HGBT_PRED_DATA_GRP_TAB_30T WHERE PAL_HGBT_PRED_DATA_GRP_TAB_30T.GROUP_ID =' + "'" + predGroupId + "'";
        // console.log("sqlStr ", sqlStr);
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        let predData = result;

        for (let i=0; i<predData.length; i++) 
        {
            let id =  predData[i].ID;
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

            predDataObj.push({GroupId,id,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12, att13, att14, att15,
                att16,att17,att18,att19,att20,att21,att22, att23, att24, att25,att26,att27,att28,att29,att30});
        }
    }
    else
    {
        console.log('_runHgbtPredictionV1 Invalid hgbtType ', hgbtType);
        return;
    }
    
    let paramTableId = '"' + "#PAL_HGBT_PARAMETER_TAB_" + tabGroupId + '"';

    sqlStr = "create local temporary column table " + paramTableId + " " +
                        "(\"PARAM_NAME\" varchar(100),\"INT_VALUE\" integer,\"double_VALUE\" double,\"STRING_VALUE\" varchar(100))";
    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();

    sqlStr = 'INSERT INTO ' + paramTableId + ' SELECT "PARAM_NAME", "INT_VALUE", "DOUBLE_VALUE", "STRING_VALUE" FROM PAL_HGBT_PREDICT_PARAMETER_GRP_TAB WHERE PAL_HGBT_PREDICT_PARAMETER_GRP_TAB.GROUP_ID =' + "'" +  predGroupId + "'";

    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();


    sqlStr = ' SELECT "PARAM_NAME", "INT_VALUE", "DOUBLE_VALUE", "STRING_VALUE" FROM PAL_HGBT_PREDICT_PARAMETER_GRP_TAB WHERE PAL_HGBT_PREDICT_PARAMETER_GRP_TAB.GROUP_ID =' + "'" +  predGroupId + "'";
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

    console.log('Before call _SYS_AFL.PAL_HGBT_PREDICT Response = ', new Date());

    // sqlStr = "call _SYS_AFL.PAL_HGBT_PREDICT(" + "#PAL_HGBT_PREDICTDATA_TAB_" + tabGroupId + "," + "#PAL_HGBT_MODEL_TAB_" + tabGroupId + "," + "#PAL_HGBT_PARAMETER_TAB_" + tabGroupId + "," + "?)";

    sqlStr = "call _SYS_AFL.PAL_HGBT_PREDICT(" + predTableId + "," + modelTableId + "," + paramTableId + "," + "?)";


    console.log('_runHgbtPredictionV1 sqlStr ', sqlStr);

    // stmt=conn.prepare(sqlStr);
    // let predictionResults=stmt.exec();
    // stmt.drop();


    let predictionResults = await hgbtFuncs._execAsync(conn, sqlStr);

    // console.log('Prediction Results ', predictionResults);

    // --------------- BEGIN --------------------
    console.log('After call _SYS_AFL.PAL_HGBT_PREDICT Response = ', new Date(), "predictionResults.length ", predictionResults.length);
    // console.log('After call _SYS_AFL.PAL_HGBT_PREDICT predictionResults = ', predictionResults);

    let resultsObj;
    if(predictionResults.length > 0)
    {
        resultsObj = await _processPredictionsResponse(req,predictionResults, predGroupId, version, scenario, modelVersion, impactAnalysis,startDate, endDate)
    }
    else{
        console.log('NO PREDICTION RESULTS FOR _runHgbtPredictionV1 tabGroupId ', tabGroupId);
        // sqlStr = 'SELECT * FROM ' + "#PAL_HGBT_PREDICTDATA_TAB_" + tabGroupId;
        sqlStr = 'SELECT * FROM ' + predTableId;

        console.log('NO PREDICTION RESULTS FOR sqlStr ', sqlStr);
        stmt=conn.prepare(sqlStr);
        let predictionsFailedData = stmt.exec();
        stmt.drop();
        console.log("Input Data ", predictionsFailedData);

        // sqlStr = 'SELECT * FROM ' + "#PAL_HGBT_MODEL_TAB_" + tabGroupId;
        // stmt=conn.prepare(sqlStr);
        // let modelData = stmt.exec();
        // stmt.drop();
        // console.log("MODEL Data ", modelData);
    }
    console.log('After call _processPredictionsResponse= ', new Date());
    /********* Begin of Disable this part to View Input Data & Profile parameters */
    // DELETE INPUT DATA & PARAMETERS AFTER MODEL GENERATION
    const groupId = predGroupId;
    // Validate input early
    if (hgbtType < 1 || hgbtType > 30) {
        return req.error(400, `Invalid HgbtType: ${hgbtType}`);
    }

    // Construct table name dynamically
    const tableName = `PAL_HGBT_PRED_DATA_GRP_TAB_${hgbtType}T`;
    console.log("HGBT Prediction tableName ", tableName, "groupId ", groupId);

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
            `DELETE FROM PAL_HGBT_PREDICT_PARAMETER_GRP_TAB WHERE GROUP_ID = ?`
        );
        stmt.exec([groupId]);
        stmt.drop();

    } catch (err) {
        console.error("DB Error:", err);
        req.error(500, err.message);
    } finally {
        conn.disconnect(); // IMPORTANT
    }
    
    /********* Enf of Disable this part to View Data & Profile parameters */
    
    conn.disconnect();

    var createtAtObj = new Date();
    let idObj = uuidv1();
  
    let returnObj = [];	
    let createdAt = createtAtObj;
    let hgbtID = idObj; 
    let predictionParameters = predParamsObj;
    let predictionData = predDataObj;
    let predictedResults = resultsObj;
    returnObj.push({hgbtID, createdAt,predictionParameters,hgbtType,predictionData,predictedResults});

    return returnObj[0];
}

async function _processPredictionsResponse(req,predictionResults, predGroupId, version, scenario, modelVersion, impactAnalysis,startDate, endDate)
{
    var groupId = predGroupId;    
    // let grpStr=groupId.split('#');
    // let profileId = grpStr[0];
    // let odType = grpStr[1];
    // let GroupId = grpStr[2];
    // let location = grpStr[3];
    // let product = grpStr[4];
    // let predGroupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;


    let profileId = req.data.profile;
    let odType = req.data.Type;
    let GroupId =  req.data.groupId;
    let location = req.data.Location;
    let product = req.data.Product;


    var resultsObj = [];	

    for (let i=0; i<predictionResults.length; i++) 
    {
        let id = predictionResults[i].ID;
        let score =  predictionResults[i].SCORE;
        let confidence = predictionResults[i].CONFIDENCE;
    
        resultsObj.push({GroupId,id,score,confidence});
    }	

    var createtAtObj = new Date();
    //let idObj = groupId;
    let idObj = uuidv1();
    
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
    var distPeriods = await cds.run(sqlStr);
    // console.log("Time Periods for Group :", tpGroupId, " Results: ", distPeriods, "periods#",distPeriods.length, "resultsObj Length ",resultsObj.length);
    var predictedTime = new Date().toISOString();
    var trimmedPeriod = vcConfigTimePeriod.replace(/^(["]*)/g, '');

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
            let predictedVal = resultsObj[index].score;
            predictedVal =  (+predictedVal).toFixed(2);
           
            let date =  calDateResults[index].CAL_DATE;
            let location =  calDateResults[index].Location ;
            let product = calDateResults[index].Product;
            let type = calDateResults[index].Type;
            let obj_dep = calDateResults[index].OBJ_DEP;
            let obj_counter =calDateResults[index].OBJ_COUNTER ;
            let modelType = 'HGBT'; 
            let mVersion = modelVersion ;
            let prfId = profileId;
            let version = calDateResults[index].VERSION;
            let scenario =calDateResults[index].SCENARIO;
            let predVal =  predictedVal * calDateResults[index].OrderQuantity;
            let predTime = predictedTime;
            let status = 'SUCCESS';

            var rowObj = { CAL_DATE:date, LOCATION_ID:location, PRODUCT_ID:product,OBJ_TYPE:type,
                            OBJ_DEP:obj_dep, OBJ_COUNTER:obj_counter,MODEL_TYPE:modelType,
                            MODEL_VERSION:mVersion,MODEL_PROFILE:prfId,VERSION:version,SCENARIO:scenario,
                            PREDICTED:predVal,PREDICTED_TIME:predTime,OPT_STARTTIME:predTime,DELTA_TIME:predTime,PREDICTED_STATUS:status,
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
    console.log("delResults length",delResults.length);
    console.log("LOCATION_ID", delResults[0].LOCATION_ID, "PRODUCT_ID",delResults[0].PRODUCT_ID, "DELETE RESULTS CAL_DATE[0]", delResults[0].CAL_DATE, "CAL_DATE LETEQ", delResults[delResults.length-1].CAL_DATE );
    console.log("OBJ_DEP", delResults[0].OBJ_DEP, "OBJ_COUNTER",delResults[0].OBJ_COUNTER, "MODEL_VERSION", delResults[0].MODEL_VERSION, "SCENARIO",delResults[0].SCENARIO);

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

    console.log('After INSERT CP_TS_PREDICTIONS = ', new Date());

    var conn = hana.createConnection();
    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();

     // Extract Importance
    sqlStr = 'SELECT "GROUP_ID", "VARIABLE_NAME", "IMPORTANCE" FROM PAL_HGBT_IMP_GRP_TAB' +
                 ' WHERE "GROUP_ID" = ' + "'" + groupId + "'";

    var stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();

    conn.disconnect();

    // //// START OF ROUNDING FOR RESULTS FROM PREDICTIONS
    // let locProdTableObj = [];
    // let locProdRowObj =  { LOCATION_ID:location, PRODUCT_ID:product,
    //                 MODEL_VERSION: modelVersion, VERSION:version,SCENARIO:scenario};                 
    // locProdTableObj.push(locProdRowObj);
    // ////////////////// BEGIN FOR ROUNDING /////////////////////////////////////
    // for (let tabIdx = 0; tabIdx < locProdTableObj.length; tabIdx ++)

    // {
        
    //     let delResults;
    //     let override = 1;
    //     // let delStatFctStr = 'DELETE FROM CP_FORECAST_UNIQUE_LOCPROD ' +
    //     //         '  WHERE MODEL_VERSION = '  + "'" + locProdTableObj[tabIdx].MODEL_VERSION + "'" +
    //     //             ' AND LOCATION_ID = ' + "'" + locProdTableObj[tabIdx].LOCATION_ID + "'" +
    //     //             ' AND PRODUCT_ID = ' + "'" + locProdTableObj[tabIdx].PRODUCT_ID + "'" +
    //     //             ' AND VERSION = '  + "'" + locProdTableObj[tabIdx].VERSION + "'" +
    //     //             ' AND SCENARIO = '  + "'" + locProdTableObj[tabIdx].SCENARIO + "'" +
    //     //             ' AND OVERRIDE = '  + "'" + override + "'";
    //     let delStatFctStr = 'DELETE FROM CP_FORECAST_UNIQUE_LOCPROD ' +
    //                         '  WHERE MODEL_VERSION = '  + "'" + locProdTableObj[tabIdx].MODEL_VERSION + "'" +
    //                             ' AND LOCATION_ID = ' + "'" + locProdTableObj[tabIdx].LOCATION_ID + "'" +
    //                             ' AND PRODUCT_ID = ' + "'" + locProdTableObj[tabIdx].PRODUCT_ID + "'" +
    //                             ' AND VERSION = '  + "'" + locProdTableObj[tabIdx].VERSION + "'" +
    //                             ' AND SCENARIO = '  + "'" + locProdTableObj[tabIdx].SCENARIO + "'";
    //     try {
    //         delResults = await cds.run(delStatFctStr);
    //     }
    //     catch (exception) {
    //         console.log("delStatFctStr ", delStatFctStr);
    //         throw new Error(exception.toString());
    //     }
    //     // console.log(" delStr DELETE CP_STATFORECAST_UNIQUE_QTYS delStatFctStr = ", delStatFctStr);

    //     // console.log ("locProdTableObj[", tabIdx, "].PRODUCT_ID ", locProdTableObj[tabIdx].PRODUCT_ID);
        

    //     sqlStr =  'SELECT CAL_DATE, UF.LOCATION_ID, UF.PRODUCT_ID, UF.UNIQUE_ID, UF.MODEL_VERSION, UF.VERSION, ' +
    //                 ' UF.SCENARIO, UF.UNIQUE_PERCENT, UNIQUE_QTY ' +
    //                 'FROM V_PAL_UNIQUE_LOCPROD_FORECAST AS UF ' +
    //                 ' WHERE UF.LOCATION_ID = ' + "'" + locProdTableObj[tabIdx].LOCATION_ID + "'" +
    //                 ' AND UF.PRODUCT_ID = ' + "'" + locProdTableObj[tabIdx].PRODUCT_ID + "'" +
    //                 ' AND UF.MODEL_VERSION = ' + "'" + locProdTableObj[tabIdx].MODEL_VERSION + "'" +
    //                 ' AND UF.VERSION = ' + "'" + locProdTableObj[tabIdx].VERSION + "'" +
    //                 ' AND UF.SCENARIO = ' + "'" + locProdTableObj[tabIdx].SCENARIO + "'" +
    //                 ' ORDER BY UF.UNIQUE_ID, CAL_DATE, UF.LOCATION_ID, UF.PRODUCT_ID, UF.VERSION, UF.SCENARIO ';

    //     // console.log("sqlStr V_PAL_UNIQUE_LOCPROD_FORECAST", sqlStr )
    //     let locProdFcstResults;
    //     try {
    //         locProdFcstResults = await cds.run(sqlStr);
    //     }
    //     catch (exception) {
    //         console.log("sqlStr ", sqlStr);
    //         throw new Error(exception.toString());
    //     }

    //     console.log(" V_PAL_UNIQUE_LOCPROD_FORECAST locProdFcstResults length", locProdFcstResults.length)
    //     let fcstUniqueTableObj = [];
    //     let uQtyRounded = locProdFcstResults[0].UNIQUE_QTY;
    //     let residualQty = 0;
    //     let uid_current = locProdFcstResults[0].UNIQUE_ID;
    //     let uid_prev = locProdFcstResults[0].UNIQUE_ID;
    //     for (let rIdx = 0; rIdx < locProdFcstResults.length; rIdx ++)
    //     {
    //         uid_current = locProdFcstResults[rIdx].UNIQUE_ID;
    //         if (uid_current != uid_prev)
    //         {
    //             residualQty = 0;
    //             uid_prev = uid_current;
    //             uQtyRounded = locProdFcstResults[rIdx].UNIQUE_QTY;
    //         }
    //         if(rIdx > 0 )
    //         {
    //             uQtyRounded = locProdFcstResults[rIdx].UNIQUE_QTY + residualQty;
    //         }    

    //         let uQty = locProdFcstResults[rIdx].UNIQUE_QTY + residualQty;   
    //         uQtyRounded = uQtyRounded - (uQtyRounded % 1);
    //         residualQty = uQty - uQtyRounded;

            
    //         // console.log("rIdx ", rIdx, "UID ", locProdFcstResults[rIdx].UNIQUE_ID, "unique qty ", locProdFcstResults[rIdx].UNIQUE_QTY, "unique rounded ", uQtyRounded, "residualQty", residualQty);
    //         override = 1;
    //         let fstatsFcstUniqueRowObj = { CAL_DATE:locProdFcstResults[rIdx].CAL_DATE,LOCATION_ID:locProdFcstResults[rIdx].LOCATION_ID, 
    //                 PRODUCT_ID:locProdFcstResults[rIdx].PRODUCT_ID,UNIQUE_ID:locProdFcstResults[rIdx].UNIQUE_ID,
    //                 MODEL_VERSION:locProdFcstResults[rIdx].MODEL_VERSION,
    //                 VERSION:locProdFcstResults[rIdx].VERSION, SCENARIO:locProdFcstResults[rIdx].SCENARIO, 
    //                 UNIQUE_PERCENT:(locProdFcstResults[rIdx].UNIQUE_PERCENT).toFixed(2),
    //                 UNROUNDED:(locProdFcstResults[rIdx].UNIQUE_QTY).toFixed(2), ROUNDED:uQtyRounded, 
    //                 QUANTITY:uQtyRounded, OVERRIDE:override};
    //         // console.log("rIdx ", rIdx,"fstatsFcstUniqueRowObj ", fstatsFcstUniqueRowObj);

    //         fcstUniqueTableObj.push(fstatsFcstUniqueRowObj);
    //     }

    //     if (fcstUniqueTableObj.length > 0)
    //     {
    //         console.log("fcstUniqueTableObj ", fcstUniqueTableObj)
    //         cqnQuery = {INSERT:{ into: { ref: ['CP_FORECAST_UNIQUE_LOCPROD'] }, entries:  fcstUniqueTableObj }};
    //         try {
    //             await cds.run(cqnQuery);
    //         }
    //         catch (exception) {
    //             // console.log("cqnQuery ", cqnQuery);
    //             throw new Error(exception.toString());
    //         }
    //         // BEGIN OF ADJUSTING UID QTYS to MATCH DEMAND //
    //         let locProdFcstResults;
    //         sqlStr = ' SELECT * FROM V_FORECAST_LOCPROD_FDEMAND_DELTA ' +
    //                         ' WHERE LOCATION_ID = ' + "'" + locProdTableObj[tabIdx].LOCATION_ID + "'" +
    //                         ' AND PRODUCT_ID = ' + "'" + locProdTableObj[tabIdx].PRODUCT_ID + "'" +
    //                         ' AND MODEL_VERSION = ' + "'" + locProdTableObj[tabIdx].MODEL_VERSION + "'" +
    //                         ' AND VERSION = ' + "'" + locProdTableObj[tabIdx].VERSION + "'" +
    //                         ' AND SCENARIO = ' + "'" + locProdTableObj[tabIdx].SCENARIO + "'" +
    //                         ' AND DEVIATION != ' + "'" + 0 + "'" +
    //                         ' ORDER BY CAL_DATE ';

    //         try {
    //             locProdFcstResults = await cds.run(sqlStr);
    //         }
    //         catch (exception) {
    //             console.log("sqlStr ", sqlStr);
    //             throw new Error(exception.toString());
    //         }
    //         for (let dateIdx = 0; dateIdx < locProdFcstResults.length; dateIdx ++)
    //         {
    //             let deviation = locProdFcstResults[dateIdx].DEVIATION;
    //             let sqlUidStr;
    //             if (deviation < 0) // Need to Inxrease Demand
    //             {
    //                 sqlUidStr = 'SELECT TOP ' + Math.abs(locProdFcstResults[dateIdx].DEVIATION) + ' UNIQUE_ID, DEVIATION FROM V_FORECAST_LOCPROD_UQTY_ROUNDED_DELTA ' +
    //                             ' WHERE CAL_DATE = ' + "'" + locProdFcstResults[dateIdx].CAL_DATE + "'" +
    //                             ' AND LOCATION_ID = ' + "'" + locProdFcstResults[dateIdx].LOCATION_ID + "'" +
    //                             ' AND PRODUCT_ID = ' + "'" + locProdFcstResults[dateIdx].PRODUCT_ID + "'" +
    //                             ' AND MODEL_VERSION = ' + "'" + locProdFcstResults[dateIdx].MODEL_VERSION + "'" +
    //                             ' AND VERSION = ' + "'" + locProdFcstResults[dateIdx].VERSION + "'" +
    //                             ' AND SCENARIO = ' + "'" + locProdFcstResults[dateIdx].SCENARIO + "'" +
    //                             ' ORDER BY DEVIATION DESC ';
    //             }
    //             else // deviation > 0 Need to Decrease Demand
    //             {
    //                 sqlUidStr = 'SELECT TOP ' + Math.abs(locProdFcstResults[dateIdx].DEVIATION) + ' UNIQUE_ID, DEVIATION FROM V_FORECAST_LOCPROD_UQTY_ROUNDED_DELTA ' +
    //                             ' WHERE CAL_DATE = ' + "'" + locProdFcstResults[dateIdx].CAL_DATE + "'" +
    //                             ' AND LOCATION_ID = ' + "'" + locProdFcstResults[dateIdx].LOCATION_ID + "'" +
    //                             ' AND PRODUCT_ID = ' + "'" + locProdFcstResults[dateIdx].PRODUCT_ID + "'" +
    //                             ' AND MODEL_VERSION = ' + "'" + locProdFcstResults[dateIdx].MODEL_VERSION + "'" +
    //                             ' AND VERSION = ' + "'" + locProdFcstResults[dateIdx].VERSION + "'" +
    //                             ' AND SCENARIO = ' + "'" + locProdFcstResults[dateIdx].SCENARIO + "'" +
    //                             ' ORDER BY DEVIATION ASC ';
    //             }

    //             let uidresults;
    //             try {
    //                 uidresults = await cds.run(sqlUidStr);
    //             }
    //             catch (exception) {
    //                 console.log("sqlUidStr ", sqlUidStr);
    //                 throw new Error(exception.toString());
    //             }
    //             // console.log(" uidresults", uidresults)
    //             let sqlStatFcstResults = 'SELECT CAL_DATE, LOCATION_ID, PRODUCT_ID, MODEL_VERSION, ' +
    //                     ' UNIQUE_ID, VERSION, SCENARIO, UNIQUE_PERCENT, UNROUNDED, ROUNDED, QUANTITY ' +
    //                     ' FROM CP_FORECAST_UNIQUE_LOCPROD ' +
    //                     ' WHERE CAL_DATE = ' + "'" + locProdFcstResults[dateIdx].CAL_DATE + "'" +
    //                     ' AND LOCATION_ID = ' + "'" + locProdFcstResults[dateIdx].LOCATION_ID + "'" +
    //                     ' AND PRODUCT_ID = ' + "'" + locProdFcstResults[dateIdx].PRODUCT_ID + "'" +
    //                     ' AND MODEL_VERSION = ' + "'" + locProdFcstResults[dateIdx].MODEL_VERSION + "'" +
    //                     ' AND VERSION = ' + "'" + locProdFcstResults[dateIdx].VERSION + "'" +
    //                     ' AND SCENARIO = ' + "'" + locProdFcstResults[dateIdx].SCENARIO + "'" +
    //                     ' ORDER BY CAL_DATE';
    //             let statFcstResults;
    //             try {
    //                 statFcstResults = await cds.run(sqlStatFcstResults);
    //             }
    //             catch (exception) {
    //                 console.log("sqlStatFcstResults ", sqlStatFcstResults);
    //                 throw new Error(exception.toString());
    //             }
    //             // console.log("CP_STATFORECAST_UNIQUE_QTYS statFcstResults ", sqlStatFcstResults)

    //             // console.log("CP_STATFORECAST_UNIQUE_QTYS statFcstResults ", statFcstResults)
    //             fcstUniqueTableObj = [];

    //             for (let statFcstIdx = 0; statFcstIdx < statFcstResults.length; statFcstIdx++)
    //             {
    //                 let uidCountChange = false;
    //                 for (let uidIdx = 0; uidIdx < uidresults.length; uidIdx ++ )
    //                 {
    //                     if(uidresults[uidIdx].UNIQUE_ID === statFcstResults[statFcstIdx].UNIQUE_ID)
    //                     {
    //                         let adjsutedUidQty = 0;
    //                         if (deviation < 0)
    //                         {
    //                             adjsutedUidQty = statFcstResults[statFcstIdx].QUANTITY + 1;
    //                         }
    //                         else
    //                         {
    //                             adjsutedUidQty = statFcstResults[statFcstIdx].QUANTITY - 1;

    //                         }
    //                         let override = 1;
    //                         let fcstUniqueRowObj = { CAL_DATE:statFcstResults[statFcstIdx].CAL_DATE,
    //                             LOCATION_ID:statFcstResults[statFcstIdx].LOCATION_ID, PRODUCT_ID:statFcstResults[statFcstIdx].PRODUCT_ID,
    //                             UNIQUE_ID:statFcstResults[statFcstIdx].UNIQUE_ID,
    //                             MODEL_VERSION:statFcstResults[statFcstIdx].MODEL_VERSION,
    //                             VERSION:statFcstResults[statFcstIdx].VERSION, SCENARIO:statFcstResults[statFcstIdx].SCENARIO, 
    //                             UNIQUE_PERCENT:statFcstResults[statFcstIdx].UNIQUE_PERCENT,
    //                             UNROUNDED:statFcstResults[statFcstIdx].UNROUNDED, 
    //                             ROUNDED:statFcstResults[statFcstIdx].ROUNDED, QUANTITY:adjsutedUidQty,
    //                             OVERRIDE:override};
    //                             // console.log("true fcstUniqueRowObj ", fcstUniqueRowObj);

    //                             fcstUniqueTableObj.push(fcstUniqueRowObj);
    //                         // console.log("true fstatsFcstUniqueRowObj ", fstatsFcstUniqueRowObj, " uidIdx", uidIdx, "UNIQUE_ID", uidresults[uidIdx].UNIQUE_ID, "deviation ", deviation);


    //                         uidCountChange = true;
    //                         break;
    //                     }

    //                 }
    //                 if (uidCountChange == false) // NO CHANGE IN UID QUANTITY
    //                 {
    //                     let override = 1;
    //                     let fcstUniqueRowObj = { CAL_DATE:statFcstResults[statFcstIdx].CAL_DATE,
    //                         LOCATION_ID:statFcstResults[statFcstIdx].LOCATION_ID, PRODUCT_ID:statFcstResults[statFcstIdx].PRODUCT_ID,
    //                         UNIQUE_ID:statFcstResults[statFcstIdx].UNIQUE_ID,
    //                         MODEL_VERSION:statFcstResults[statFcstIdx].MODEL_VERSION,
    //                         VERSION:statFcstResults[statFcstIdx].VERSION, SCENARIO:statFcstResults[statFcstIdx].SCENARIO, 
    //                         UNIQUE_PERCENT:statFcstResults[statFcstIdx].UNIQUE_PERCENT,
    //                         UNROUNDED:statFcstResults[statFcstIdx].UNROUNDED, 
    //                         ROUNDED:statFcstResults[statFcstIdx].ROUNDED, QUANTITY:statFcstResults[statFcstIdx].QUANTITY,
    //                         OVERRIDE:override
    //                     };
    //                     // console.log("false fcstUniqueRowObj ", fcstUniqueRowObj);
    //                     fcstUniqueTableObj.push(fcstUniqueRowObj);

    //                 }
    //             }

    //             // BEGIN OF DELETE AND RE-INSERT ADJUSTED UID QUANTITIES
    //             let delStatFcstSqlStr = 'DELETE FROM CP_FORECAST_UNIQUE_LOCPROD ' +
    //                             ' WHERE CAL_DATE = ' + "'" + locProdFcstResults[dateIdx].CAL_DATE + "'" +
    //                             ' AND LOCATION_ID = ' + "'" + locProdFcstResults[dateIdx].LOCATION_ID + "'" +
    //                             ' AND PRODUCT_ID = ' + "'" + locProdFcstResults[dateIdx].PRODUCT_ID + "'" +
    //                             ' AND MODEL_VERSION = ' + "'" + locProdFcstResults[dateIdx].MODEL_VERSION + "'" +
    //                             ' AND VERSION = ' + "'" + locProdFcstResults[dateIdx].VERSION + "'" +
    //                             ' AND SCENARIO = ' + "'" + locProdFcstResults[dateIdx].SCENARIO + "'";

    //             try {
    //                 await cds.run(delStatFcstSqlStr);
    //             }
    //             catch (exception) {
    //                 console.log("sqlStr ", delStatFcstSqlStr);
    //                 throw new Error(exception.toString());
    //             }
    //             // console.log("DELETE CP_STATFORECAST_UNIQUE_QTYS delStatFcstSqlStr", delStatFcstSqlStr);

    //             cqnQuery = {INSERT:{ into: { ref: ['CP_FORECAST_UNIQUE_LOCPROD'] }, entries:  fcstUniqueTableObj }};
    //             console.log("fcstUniqueTableObj Length", fcstUniqueTableObj.length);

    //             if( fcstUniqueTableObj.length > 0)
    //             {
    //                 try {
    //                     await cds.run(cqnQuery);
    //                 }
    //                 catch (exception) {
    //                     console.log("cqnQuery ", cqnQuery);
    //                     throw new Error(exception.toString());
    //                 }
    //             }
    //             // BEGIN OF DELETE AND RE-INSERT ADJUSTED UID QUANTITIES

    //         }
    //         // END OF ADJUSTING UID QTYS to MATCH DEMAND //

    //         ////////////////// END FOR ROUNDING  //////////////////////////////////////
    //     }

    // }
    
    // //// END OF ROUNDING FOR RESULTS FROM PREDICTIONS


    if (impactAnalysis == true)
    {
        var w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15, w16, w17, w18, w19, w20= 0;
        var w21, w22, w23, w24, w25, w26, w27, w28, w29, w30 = 0;

        for (let index=0; index<result.length; index++)
        {
    
            if (result[index].VARIABLE_NAME == 'ATT1')
                w1 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT2')
                w2 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT3')
                w3 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT4')
                w4 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT5')
                w5 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT6')
                w6 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT7')
                w7 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT8')
                w8 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT9')
                w9 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT10')
                w10 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT11')
                w11 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT12')
                w12 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT13')
                w13 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT14')
                w14 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT15')
                w15 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT16')
                w16 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT17')
                w17 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT18')
                w18 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT19')
                w19 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT20')
                w20 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT21')
                w21 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT22')
                w22 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT23')
                w23 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT24')
                w24 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT25')
                w25 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT26')
                w26 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT27')
                w27 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT28')
                w28 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT29')
                w29 = result[index].IMPORTANCE;
            else if (result[index].VARIABLE_NAME == 'ATT30')
                w30 = result[index].IMPORTANCE;
        }


        tableObj = [];
        for (let pIndex=0; pIndex<resultsObj.length; pIndex++)
        {     
            let predictedVal = resultsObj[pIndex].score;
            predictedVal = ( +predictedVal).toFixed(2);
            let periodId = distPeriods[pIndex][trimmedPeriod];

            sqlStr = 'SELECT DISTINCT "CAL_DATE", "Location", "Product", ' +
                    '"Type", "OBJ_DEP", "OBJ_COUNTER", "ROW_ID", "CharCount", "CharCountPercent", "VERSION", "SCENARIO" ' +
                    'FROM "V_FUTURE_DEP_TS" WHERE "GroupID" = ' + "'" + tpGroupId + "'" + 
                    ' AND "Type" = ' + "'" + odType + "'" + 
                    ' AND "VERSION" = ' + "'" + version + "'" +
                    ' AND "SCENARIO" = ' + "'" + scenario + "'" +
                    startDateSql    + endDateSql +
                    ' AND ' + '"' + vcConfigTimePeriod + '"' + ' = ' + "'" + periodId + "'";

            let sqlStrTemp = sqlStr;
            result = [];


            result = await cds.run(sqlStr);
        
            var orderCount = 0;
            for (let rIndex = 0; rIndex < result.length; rIndex++)
            {
                let impact_val = impact_percent = 0;
                
                if (result[rIndex].ROW_ID == 1)
                {
                    impact_percent = w1*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }
                else if (result[rIndex].ROW_ID == 2)
                {
                    impact_percent = w2*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 3)
                {
                    impact_percent = w3*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 4)
                {
                    impact_percent = w4*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 5)
                {
                    impact_percent = w5*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 6)
                {
                    impact_percent = w6*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 7)
                {
                    impact_percent = w7*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 8)
                {
                    impact_percent = w8*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 9)
                {
                    impact_percent = w9*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 10)
                {
                    impact_percent = w10*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 11)
                {
                    impact_percent = w11*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 12)
                {
                    impact_percent = w12*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }
                else if (result[rIndex].ROW_ID == 13)
                {
                    impact_percent = w13*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 14)
                {
                    impact_percent = w14*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 15)
                {
                    impact_percent = w15*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 16)
                {
                    impact_percent = w16*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 17)
                {
                    impact_percent = w17*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 18)
                {
                    impact_percent = w18*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 19)
                {
                    impact_percent = w19*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 20)
                {
                    impact_percent = w20*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }    
                else if (result[rIndex].ROW_ID == 21)
                {
                    impact_percent = w21*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 22)
                {
                    impact_percent = w22*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }
                else if (result[rIndex].ROW_ID == 23)
                {
                    impact_percent = w23*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 24)
                {
                    impact_percent = w24*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 25)
                {
                    impact_percent = w25*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 26)
                {
                    impact_percent = w26*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 27)
                {
                    impact_percent = w27*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 28)
                {
                    impact_percent = w28*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 29)
                {
                    impact_percent = w29*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 30)
                {
                    impact_percent = w30*predictedVal;//result[rIndex].CharCount;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                let predicted = predictedVal;
                let impactValPercent = 0;
                if( predicted*orderCount > 0 )
                {
                    impactValPercent = 100*impact_val/(predicted*orderCount);
                }
                else
                {
                    impactValPercent = 0;
                }

                if ( (impactValPercent >= 0) &&
                    (impact_val >=0) )
                {

                    let date =  result[rIndex].CAL_DATE;
                    let location =  result[rIndex].Location ;
                    let product = result[rIndex].Product;
                    let type = result[rIndex].Type;
                    let obj_dep = result[rIndex].OBJ_DEP;
                    let obj_counter = result[rIndex].OBJ_COUNTER ;
                    let row_id = result[rIndex].ROW_ID; 
                    let modelType = 'HGBT'; 
                    let mVersion = modelVersion ;
                    let prfId = profileId;
                    let version = result[rIndex].VERSION;
                    let scenario =result[rIndex].SCENARIO;
                    let charCount = result[rIndex].CharCount;
                    // let predVal =  predictedVal * result[rIndex].OrderQuantity;
                    
        
                    var rowObj = { CAL_DATE:date, LOCATION_ID:location, PRODUCT_ID:product,OBJ_TYPE:type,
                        OBJ_DEP:obj_dep, OBJ_COUNTER:obj_counter,ROW_ID:row_id,MODEL_TYPE:modelType,
                        MODEL_VERSION:mVersion,MODEL_PROFILE:prfId,VERSION:version,SCENARIO:scenario,
                        CHAR_COUNT:charCount, CHAR_IMPACT_VAL:impact_val,CHAR_IMPACT_PERCENT:impactValPercent,
                        PREDICTED_VAL:predicted*orderCount,PREDICTED_TIME:predictedTime};

                    tableObj.push(rowObj);                
                    // sqlStr = 'UPSERT "CP_TS_OBJDEP_CHAR_IMPACT_F" VALUES (' + "'" + result[rIndex].CAL_DATE + "'" + "," +
                    //     "'" + result[rIndex].Location + "'" + "," +
                    //     "'" + result[rIndex].Product + "'" + "," +
                    //     "'" + result[rIndex].Type + "'" + "," +
                    //     "'" + result[rIndex].OBJ_DEP + "'" + "," +
                    //     "'" + result[rIndex].OBJ_COUNTER + "'" + "," +
                    //     "'" + result[rIndex].ROW_ID + "'" + "," +
                    //     "'" + 'HGBT' + "'" + "," +
                    //     "'" + modelVersion  + "'" + "," +
                    //     "'" + profileId  + "'" + "," +
                    //     "'" + result[rIndex].VERSION + "'" + "," +
                    //     "'" + result[rIndex].SCENARIO + "'" + "," +
                    //     "'" + result[rIndex].CharCount + "'" + "," +
                    //     "'" + impact_val + "'" + "," +
                    //     "'" + impactValPercent + "'" + "," +
                    //     "'" + predicted*orderCount + "'" + "," +
                    //     "'" + predictedTime + "'" + ')' + ' WITH PRIMARY KEY';

                    // try {
                    //     await cds.run(sqlStr);
                    // }
                    // catch (exception) {
                    //     console.log("ERROR -- CP_TS_OBJDEP_CHAR_IMPACT_F HGBT UPSERT sqlStr ", sqlStr); 
                    //     throw new Error(exception.toString());
                    // }
                }
    
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

        // for (let dIndex = 0; dIndex < delResults.length; dIndex++)
        // {
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
        // }


        cqnQuery = {INSERT:{ into: { ref: ['CP_TS_OBJDEP_CHAR_IMPACT_F'] }, entries:  tableObj }};

        await cds.run(cqnQuery);
    }
    
    return resultsObj;
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