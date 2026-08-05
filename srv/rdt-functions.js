const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
    
const hana = require('@sap/hana-client');
const rtdFuncs = require('./rdt-functions.js');

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



exports._runRdtRegressions = async function(req) {

    await rtdFuncs._updateRdtGroupParams (req);   
    await rtdFuncs._updateRdtGroupData(req);
    await rtdFuncs._runRegressionRdtGroup(req); 
 }

exports._updateRdtGroupParams = async function(req) {

    const rdtGroupParams = req.data.regressionParameters;

    console.log('_updateRdtGroupParams: ', rdtGroupParams);         


    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

// ---------- BEGIN OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS
    let inGroups = [];
    let modelGroup = rdtGroupParams[0].groupId;
    inGroups.push(modelGroup);
    for (var i in rdtGroupParams)
    { 
        if (i > 0)
        {
            if( rdtGroupParams[i].groupId != rdtGroupParams[i-1].groupId)
            {
                inGroups.push(rdtGroupParams[i].groupId);
            }
        }
    }
    for (let i = 0; i < inGroups.length; i++)
    {
        sqlStr = "DELETE FROM PAL_RDT_PARAMETER_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

    }
// ---------- END OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS

    var tableObj = [];	
        
    for (let i = 0; i < rdtGroupParams.length; i++)
    {
        let groupId = rdtGroupParams[i].groupId ;
        let paramName = rdtGroupParams[i].paramName;
        let intVal =  rdtGroupParams[i].intVal
        let doubleVal = rdtGroupParams[i].doubleVal;
        let strVal = rdtGroupParams[i].strVal;
        var rowObj = [];
        rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        tableObj.push(rowObj);
        
    }

    sqlStr = "INSERT INTO PAL_RDT_PARAMETER_GRP_TAB(GROUP_ID,PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE) VALUES(?, ?, ?, ?, ?)";
    stmt = conn.prepare(sqlStr);
    stmt.execBatch(tableObj);
    stmt.drop();

    conn.disconnect();
}



exports._updateRdtGroupData = async function(req) {

    const rdtGroupData = req.data.regressionData;
    var modelVersion = req.data.modelVersion;


    var rdtType = req.data.rdtType;


    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    // DELETION Moved to After MODEL Generation as Data shall not be stored after Model generation

    // if (rdtType == 1)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_1T";
    // else if (rdtType == 2)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_2T";
    // else if (rdtType == 3)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_3T";
    // else if (rdtType == 4)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_4T";
    // else if (rdtType == 5)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_5T";
    // else if (rdtType == 6)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_6T";
    // else if (rdtType == 7)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_7T";
    // else if (rdtType == 8)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_8T";
    // else if (rdtType == 9)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_9T";
    // else if (rdtType == 10)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_10T";
    // else if (rdtType == 11)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_11T";
    // else if (rdtType == 12)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_12T";
    // else if (rdtType == 13)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_13T";
    // else if (rdtType == 14)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_14T";
    // else if (rdtType == 15)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_15T";
    // else if (rdtType == 16)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_16T";
    // else if (rdtType == 17)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_17T";
    // else if (rdtType == 18)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_18T";
    // else if (rdtType == 19)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_19T";
    // else if (rdtType == 20)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_20T";
    // else if (rdtType == 21)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_21T";
    // else if (rdtType == 22)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_22T";
    // else if (rdtType == 23)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_23T";
    // else if (rdtType == 24)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_24T";
    // else if (rdtType == 25)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_25T";
    // else if (rdtType == 26)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_26T";
    // else if (rdtType == 27)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_27T";
    // else if (rdtType == 28)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_28T";
    // else if (rdtType == 29)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_29T";
    // else if (rdtType == 30)
    //     sqlStr = "DELETE FROM PAL_RDT_DATA_GRP_TAB_30T";
    // else
    // {
    //     var res = req._.req.res;
    //     res.send({"Invalid RdtType":rdtType});
    //     return;
    // }

    // stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();

    var tableObj = [];	

    
    let att1, att2, att3, att4, att5, att6, att7, att8, att9, att10;
    let att11, att12, att13, att14, att15, att16, att17, att18, att19, att20;
    let att21, att22, att23, att24, att25, att26, att27, att28, att29, att30, target, groupId;
    for (var i = 0; i < rdtGroupData.length; i++)
    {
        groupId = rdtGroupData[i].groupId ;
        target = rdtGroupData[i].target;

        att1 = rdtGroupData[i].att1;
        if (rdtType > 1)
            att2 =  rdtGroupData[i].att2;
        if (rdtType > 2)
            att3 = rdtGroupData[i].att3;
        if (rdtType > 3)
            att4 = rdtGroupData[i].att4;
        if (rdtType > 4)
            att5 = rdtGroupData[i].att5;
        if (rdtType > 5)
            att6 = rdtGroupData[i].att6;
        if (rdtType > 6)
            att7 = rdtGroupData[i].att7;
        if (rdtType > 7)
            att8 = rdtGroupData[i].att8;
        if (rdtType > 8)
            att9 = rdtGroupData[i].att9;
        if (rdtType > 9)
            att10 = rdtGroupData[i].att10;
        if (rdtType > 10)
            att11 = rdtGroupData[i].att11;
        if (rdtType > 11)
            att12 = rdtGroupData[i].att12;
        if (rdtType > 12)
            att13 = rdtGroupData[i].att13;
        if (rdtType > 13)
            att14 = rdtGroupData[i].att14;
        if (rdtType > 14)
            att15 = rdtGroupData[i].att15;
        if (rdtType > 15)
            att16 = rdtGroupData[i].att16;
        if (rdtType > 16)
            att17 = rdtGroupData[i].att17;
        if (rdtType > 17)
            att18 = rdtGroupData[i].att18;
        if (rdtType > 18)
            att19 = rdtGroupData[i].att19;
        if (rdtType > 19)
            att20 = rdtGroupData[i].att20;
        if (rdtType > 20)
            att21 =  rdtGroupData[i].att21;
        if (rdtType > 21)
            att12 =  rdtGroupData[i].att22;
        if (rdtType > 22)
            att13 = rdtGroupData[i].att23;
        if (rdtType > 23)
            att24 = rdtGroupData[i].att24;
        if (rdtType > 24)
            att25 = rdtGroupData[i].att25;
        if (rdtType > 25)
            att26 = rdtGroupData[i].att26;
        if (rdtType > 26)
            att27 = rdtGroupData[i].att27;
        if (rdtType > 27)
            att28 = rdtGroupData[i].att28;
        if (rdtType > 28)
            att29 = rdtGroupData[i].att29;
        if (rdtType > 29)
            att30 = rdtGroupData[i].att30;
        var rowObj = [];
        if (rdtType == 1)
            rowObj.push(groupId,att1,target);
        else if (rdtType == 2)
            rowObj.push(groupId,att1,att2,target);
        else if (rdtType == 3)
            rowObj.push(groupId,att1,att2,att3,target);
        else if (rdtType == 4)
            rowObj.push(groupId,att1,att2,att3,att4,target);
        else if (rdtType == 5)
            rowObj.push(groupId,att1,att2,att3,att4,att5,target);
        else if (rdtType == 6)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,target);
        else if (rdtType == 7)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,target);
        else if (rdtType == 8)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,target);
        else if (rdtType == 9)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,target);
        else if (rdtType == 10)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,target);
        else if (rdtType == 11)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11, target);
        else if (rdtType == 12)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,target);
        else if (rdtType == 13)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,target);
        else if (rdtType == 14)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,target);
        else if (rdtType == 15)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,target);
        else if (rdtType == 16)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,target);
        else if (rdtType == 17)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,target);
        else if (rdtType == 18)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,target);
        else if (rdtType == 19)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,target);
        else if (rdtType == 20)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,target);
        else if (rdtType == 21)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,target);
        else if (rdtType == 22)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,target);
        else if (rdtType == 23)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,target);
        else if (rdtType == 24)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,target);
        else if (rdtType == 25)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,target);
        else if (rdtType == 26)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,target);
        else if (rdtType == 27)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,target);
        else if (rdtType == 28)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,target);
        else if (rdtType == 29)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29,target);
        else if (rdtType == 30)
            rowObj.push(groupId,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,
                        att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29,att30,target);

        tableObj.push(rowObj);
    }
    if (rdtType == 1)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_1T(GROUP_ID,ATT1,TARGET) VALUES(?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (rdtType == 2)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_2T(GROUP_ID,ATT1,ATT2,TARGET) VALUES(?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (rdtType == 3)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_3T(GROUP_ID,ATT1,ATT2,ATT3,TARGET) VALUES(?, ?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 4)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_4T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,TARGET) VALUES(?, ?, ?, ?, ?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 5)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_5T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,TARGET) VALUES(?, ?, ?, ?, ?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 6)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_6T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 7)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_7T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 8)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_8T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 9)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_9T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 10)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_10T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 11)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_11T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 12)
    {
        sqlStr = "INSERT INTO PAL_RDT_DATA_GRP_TAB_12T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12,TARGET) VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 13)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_13T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 14)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_14T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 15)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_15T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 16)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_16T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 17)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_17T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 18)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_18T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 19)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_19T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 20)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_12T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 21)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_21T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 22)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_22T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 23)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_23T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 24)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_24T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 25)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_25T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 26)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_26T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 27)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_27T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?)';        
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 28)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_28T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?)';          
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 29)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_29T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?)';        
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 30)
    {
        sqlStr = 'INSERT INTO PAL_RDT_DATA_GRP_TAB_30T(GROUP_ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,' +
                'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,' +
                'ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,ATT30,TARGET) ' +
                 ' VALUES(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    console.log(' _updateRdtGroupData sqlStr ', sqlStr);

    stmt.execBatch(tableObj);
    stmt.drop();
    conn.disconnect();
    console.log(' _updateRdtGroupData Completed ');

}

exports._runRegressionRdtGroup = async function(req) {

    console.log('Executing RDT Regression at GROUP');
    var rdtType = req.data.rdtType;
    var rdtModelVersion = req.data.modelVersion;

    console.log('Executing RDT Regression at GROUP REQ RDT Model Version', rdtModelVersion);

    var rdtDataTable;
    if (rdtType == 1)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_1T";
    else if (rdtType == 2)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_2T";
    else if (rdtType == 3)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_3T";
    else if (rdtType == 4)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_4T";
    else if (rdtType == 5)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_5T";
    else if (rdtType == 6)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_6T";
    else if (rdtType == 7)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_7T";
    else if (rdtType == 8)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_8T";
    else if (rdtType == 9)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_9T";
    else if (rdtType == 10)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_10T";
    else if (rdtType == 11)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_11T";
    else if (rdtType == 12)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_12T";
    else if (rdtType == 13)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_13T";
    else if (rdtType == 14)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_14T";
    else if (rdtType == 15)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_15T";
    else if (rdtType == 16)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_16T";
    else if (rdtType == 17)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_17T";
    else if (rdtType == 18)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_18T";
    else if (rdtType == 19)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_19T";
    else if (rdtType == 20)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_20T";
    else if (rdtType == 21)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_21T";
    else if (rdtType == 22)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_22T";
    else if (rdtType == 23)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_23T";
    else if (rdtType == 24)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_24T";
    else if (rdtType == 25)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_25T";
    else if (rdtType == 26)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_26T";
    else if (rdtType == 27)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_27T";
    else if (rdtType == 28)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_28T";
    else if (rdtType == 29)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_29T";
    else if (rdtType == 30)
        rdtDataTable = "PAL_RDT_DATA_GRP_TAB_30T";
    var conn = hana.createConnection();
 
    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    const rdtGroupParams = req.data.regressionParameters;
    let inGroups = [];
    let modelGroup = rdtGroupParams[0].groupId;
    inGroups.push(modelGroup);
    for (var i in rdtGroupParams)
    { 
        if (i > 0)
        {
            if( rdtGroupParams[i].groupId != rdtGroupParams[i-1].groupId)
            {
                inGroups.push(rdtGroupParams[i].groupId);
            }
        }
    }
    for (let i = 0; i < inGroups.length; i++)
    {
        sqlStr = "DELETE FROM PAL_RDT_MODEL_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();
    
        sqlStr =  "DELETE FROM PAL_RDT_IMP_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();
    
        sqlStr =  "DELETE FROM PAL_RDT_OUT_OF_BAG_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();
    
        sqlStr =  "DELETE FROM PAL_RDT_CONFUSION_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";        
        stmt=conn.prepare(sqlStr);
        stmt.exec();
        stmt.drop();

    }

    if (rdtType == 1)
        sqlStr = 'call RDT_MAIN_1T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 2)
        sqlStr = 'call RDT_MAIN_2T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 3)
        sqlStr = 'call RDT_MAIN_3T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 4)
        sqlStr = 'call RDT_MAIN_4T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 5)
        sqlStr = 'call RDT_MAIN_5T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 6)
        sqlStr = 'call RDT_MAIN_6T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 7)
        sqlStr = 'call RDT_MAIN_7T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 8)
        sqlStr = 'call RDT_MAIN_8T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 9)
        sqlStr = 'call RDT_MAIN_9T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 10)
        sqlStr = 'call RDT_MAIN_10T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 11)
        sqlStr = 'call RDT_MAIN_11T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 12)
        sqlStr = 'call RDT_MAIN_12T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 13)
        sqlStr = 'call RDT_MAIN_13T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 14)
        sqlStr = 'call RDT_MAIN_14T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 15)
        sqlStr = 'call RDT_MAIN_15T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 16)
        sqlStr = 'call RDT_MAIN_16T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 17)
        sqlStr = 'call RDT_MAIN_17T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 18)
        sqlStr = 'call RDT_MAIN_18T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 19)
        sqlStr = 'call RDT_MAIN_19T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 20)
        sqlStr = 'call RDT_MAIN_20T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 21)
        sqlStr = 'call RDT_MAIN_21T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 22)
        sqlStr = 'call RDT_MAIN_22T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 23)
        sqlStr = 'call RDT_MAIN_23T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 24)
        sqlStr = 'call RDT_MAIN_24T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 25)
        sqlStr = 'call RDT_MAIN_25T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 26)
        sqlStr = 'call RDT_MAIN_26T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 27)
        sqlStr = 'call RDT_MAIN_27T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 28)
        sqlStr = 'call RDT_MAIN_28T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 29)
        sqlStr = 'call RDT_MAIN_29T(' + rdtDataTable + ', ?,?,?,?)';
    else if (rdtType == 30)
        sqlStr = 'call RDT_MAIN_30T(' + rdtDataTable + ', ?,?,?,?)';
   
    // stmt=conn.prepare(sqlStr);
    // var modelResults=stmt.exec();
    // stmt.drop();
    var modelResults = await rtdFuncs._execAsync(conn, sqlStr);
    
  
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
        let rowIndex = modelResults[i].ROW_INDEX;
        let treeIndex = modelResults[i].TREE_INDEX;
        let modelContent = modelResults[i].MODEL_CONTENT;
        modelsObj.push({groupId,rowIndex,treeIndex,modelContent});

    }


    var impObj = [];

    sqlStr =  'SELECT * FROM PAL_RDT_IMP_GRP_TAB WHERE GROUP_ID IN (SELECT GROUP_ID FROM ' + rdtDataTable + ')';

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

    var outOfBagObj = [];

    sqlStr =  'SELECT * FROM PAL_RDT_OUT_OF_BAG_GRP_TAB WHERE GROUP_ID IN (SELECT GROUP_ID FROM ' + rdtDataTable + ')';

    stmt=conn.prepare(sqlStr);
    let outOfBagResults = stmt.exec();
    stmt.drop();

    for (let i=0; i< outOfBagResults.length; i++)
    {     
        let groupId = outOfBagResults[i].GROUP_ID;
        let treeIndex = outOfBagResults[i].TREE_INDEX;
        let error = outOfBagResults[i].ERROR;
        outOfBagObj.push({groupId,treeIndex,error});
    }


    var createtAtObj = new Date();
    var idObj = uuidv1();
    console.log("_runRegressionRdtGroup location ", req.data.Location, " product ", req.data.Product);

 
    console.log("CP_PALRDTREGRESSIONS cqnQuery Completed " , new Date());


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

    console.log("inGroups ", inGroups, "Number of Groups",inGroups.length);

    var tableObj = [];
    for (let grpIndex = 0; grpIndex < inGroups.length; grpIndex++)
    {
        let outOfBagGroupObj = [];
        let paramsGroupObj = [];
        let impGroupObj = [];
        console.log("GROUP_ID ", inGroups[grpIndex]);

        
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

        for (let i=0; i< outOfBagResults.length; i++)
        {     
            if (inGroups[grpIndex] == outOfBagResults[i].GROUP_ID)
            {
                let treeIndex = outOfBagResults[i].TREE_INDEX;
                let error = outOfBagResults[i].ERROR;
                outOfBagGroupObj.push({treeIndex,error});
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

        console.log("_runRegressionRdtGroup  grpStr ", grpStr, "profileID ",profileID, "type ", type, "GroupId ",GroupId, " location ", location, " product ", product);

        // var rowObj = {   rdtGroupID: idObj, 
        //     //createdAt : createtAtObj, 
        //     createdAt : createtAtObj.toISOString(),
        //     Location : location,
        //     Product : product,
        //     groupId : GroupId,
        //     Type : type,
        //     modelVersion : rdtModelVersion,
        //     profile : profileID,
        //     regressionParameters:paramsGroupObj, 
        //     rdtType : req.data.rdtType,
        //     importanceOp : impGroupObj,
        //     outOfBagOp : outOfBagGroupObj};
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
                    "'" + 'RDT' + "'" + "," +
                    "'" + rdtModelVersion + "'" + "," +
                    "'" + profileID  + "'" + "," +
                    "'" + req.data.rdtType + "'" + "," +
                    "'" + createtAtObj.toISOString() + "'" + ')' + ' WITH PRIMARY KEY';
                                
        console.log("CP_OD_MODEL_VERSIONS RDT sql update sqlStr", sqlStr);

        await cds.run(sqlStr);

        /********* Begin of Disable this part to View Input Data & Profile parameters */
            // DELETE INPUT DATA & PARAMETERS AFTER MODEL GENERATION
            const rdtType = req.data.rdtType;
            const groupId = inGroups[grpIndex]; //inGroups[i];
    
            // Validate input early
            if (rdtType < 1 || rdtType > 30) {
                return req.error(400, `Invalid rdtType: ${rdtType}`);
            }
    
            // Construct table name dynamically
            const tableName = `PAL_RDT_DATA_GRP_TAB_${rdtType}T`;
            console.log("RDT tableName ", tableName, "groupId ", groupId);
        
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
                    `DELETE FROM PAL_RDT_PARAMETER_GRP_TAB WHERE GROUP_ID = ?`
                );
                stmt.exec([groupId]);
                stmt.drop();
    
            } catch (err) {
                console.error("DB Error:", err);
                req.error(500, err.message);
            }
            
        /********* End of Disable this part to View Data & Profile parameters */

    }


    // cqnQuery = {INSERT:{ into: { ref: ['CP_PALRDTBYGROUP'] }, entries:  tableObj }};

    // console.log("CP_PALRDTBYGROUP cqnQuery Start " , new Date());
    // await cds.run(cqnQuery);
    // console.log("CP_PALRDTBYGROUP cqnQuery Completed " , new Date());

    let returnObj = [];	
    let createdAt = createtAtObj;
    let rdtID = idObj; //uuidObj;
    let regressionData = req.data.regressionData;
    let modelsOp = modelsObj;
    let importanceOp = impObj;
    let outOfBagOp = outOfBagObj;
    returnObj.push({rdtID, createdAt,regressionParameters,regressionData,modelsOp, importanceOp,outOfBagOp});

    var res = req._.req.res;
    res.send({"value":returnObj});

    console.log('Completed RDT Regression Models Generation for Groups Successfully');

    conn.disconnect(function(err) {
    if (err) throw err;
    console.log('disconnected');
    });

}


exports._runRdtPredictions = async function(req) {


   var groupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

   var conn = hana.createConnection();

   conn.connect(conn_params);

   var sqlStr = 'SET SCHEMA ' + classicalSchema;  
   var stmt=conn.prepare(sqlStr);
   var results=stmt.exec();
   stmt.drop();

   sqlStr = 'SELECT COUNT(DISTINCT "GROUP_ID") AS "ModelExists" FROM "PAL_RDT_MODEL_GRP_TAB" WHERE "GROUP_ID" = ' + "'" + groupId + "'";
   stmt=conn.prepare(sqlStr);
   results = stmt.exec();
   stmt.drop();
   console.log('_runRdtPredictions - sqlStr : ', sqlStr);            

   var modelExists = results[0].ModelExists;
   console.log('_runRdtPredictions - modelExists: ', modelExists);            

   if (modelExists == 0)
   {
      let predResults = [];
      var responseMessage = " Model Does not Exist For groupId : " + groupId;
      predResults.push(responseMessage);
      console.log('_runRdtPredictions : Model Does not Exist For groupId', groupId); 
      let res = req._.req.res;
      res.statusCode = 400;
      res.send({"value":predResults});
      conn.disconnect(); 
      return;          
   }
   conn.disconnect(); 
   
   
   await rtdFuncs._updateRdtPredictionParams (req);
    
   await rtdFuncs._updateRdtPredictionData(req);

   await rtdFuncs._runPredictionRdtGroup(req); 
  
}

exports._updateRdtPredictionParams = async function(req) {


    const rdtPredictParams = req.data.predictionParameters;
  
    var conn = hana.createConnection();

    conn.connect(conn_params);

    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    sqlStr = "DELETE FROM PAL_RDT_PREDICT_PARAMETER_GRP_TAB";

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    var tableObj = [];	
        
    for (var i = 0; i < rdtPredictParams.length; i++)
    {
        let groupId = rdtPredictParams[i].groupId ;
        let paramName = rdtPredictParams[i].paramName;
        let intVal =  rdtPredictParams[i].intVal
        let doubleVal = rdtPredictParams[i].doubleVal;
        let strVal = rdtPredictParams[i].strVal;
        var rowObj = [];
        rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        tableObj.push(rowObj);
    }

    sqlStr = "INSERT INTO PAL_RDT_PREDICT_PARAMETER_GRP_TAB(GROUP_ID,PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE) VALUES(?, ?, ?, ?, ?)";
    stmt = conn.prepare(sqlStr);
    stmt.execBatch(tableObj);
    stmt.drop();

    conn.disconnect();
}

exports._updateRdtPredictionData = async function(req) {


    const rdtPredictData = req.data.predictionData;
    var rdtType = req.data.rdtType;

    let predGroupId = req.data.profile + '#' + req.data.Type + '#' + req.data.groupId + '#' + req.data.Location + '#' + req.data.Product;

    var conn = hana.createConnection();

    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();

    // DELETION Moved to After MODEL Generation as Data shall not be stored after Model generation

    // if (rdtType == 1)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_1T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 2)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_2T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 3)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_3T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 4)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_4T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 5)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_5T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 6)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_6T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 7)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_7T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 8)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_8T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 9)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_9T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 10)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_10T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 11)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_11T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 12)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_12T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 13)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_13T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 14)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_14T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 15)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_15T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 16)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_16T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 17)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_17T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 18)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_18T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 19)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_19T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 20)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_20T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 21)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_21T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 22)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_22T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 23)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_23T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 24)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_24T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 25)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_25T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 26)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_26T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 27)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_27T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 28)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_28T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 29)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_29T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else if (rdtType == 30)
    //     sqlStr = "DELETE FROM PAL_RDT_PRED_DATA_GRP_TAB_30T  WHERE GROUP_ID = " + "'" + predGroupId + "'";
    // else
    // {
    //     var res = req._.req.res;
    //     res.send({"Invalid RdtType":rdtType});
    //     return;
    // }

    // stmt=conn.prepare(sqlStr);
    // stmt.exec();
    // stmt.drop();


    var tableObj = [];	
    
    let att1, att2, att3, att4, att5, att6, att7, att8, att9, att10, att11, att12, ID, groupId;
    let att13, att14, att15, att16, att17, att18, att19, att20;
    let att21, att22, att23, att24, att25, att26, att27, att28, att29, att30;
    for (var i = 0; i < rdtPredictData.length; i++)
    {
        groupId = rdtPredictData[i].groupId ;
        ID = rdtPredictData[i].ID;
        att1 = rdtPredictData[i].att1;
        if (rdtType > 1)
            att2 =  rdtPredictData[i].att2;
        if (rdtType > 2)
            att3 = rdtPredictData[i].att3;
        if (rdtType > 3)
            att4 = rdtPredictData[i].att4;
        if (rdtType > 4)
            att5 = rdtPredictData[i].att5;
        if (rdtType > 5)
            att6 = rdtPredictData[i].att6;
        if (rdtType > 6)
            att7 = rdtPredictData[i].att7;
        if (rdtType > 7)
            att8 = rdtPredictData[i].att8;
        if (rdtType > 8)
            att9 = rdtPredictData[i].att9;
        if (rdtType > 9)
            att10 = rdtPredictData[i].att10;
        if (rdtType > 10)
            att11 = rdtPredictData[i].att11;
        if (rdtType > 11)
            att12 = rdtPredictData[i].att12;
        if (rdtType > 12)
            att13 = rdtPredictData[i].att13;
        if (rdtType > 13)
            att14 = rdtPredictData[i].att14;
        if (rdtType > 14)
            att15 = rdtPredictData[i].att15;
        if (rdtType > 15)
            att16 = rdtPredictData[i].att16;
        if (rdtType > 16)
            att17 = rdtPredictData[i].att17;
        if (rdtType > 17)
            att18 = rdtPredictData[i].att18;
        if (rdtType > 18)
            att19 = rdtPredictData[i].att19;
        if (rdtType > 19)
            att20 = rdtPredictData[i].att20;
        if (rdtType > 20)
            att21 = rdtPredictData[i].att21;
        if (rdtType > 21)
            att22 =  rdtPredictData[i].att22;
        if (rdtType > 22)
            att23 = rdtPredictData[i].att23;
        if (rdtType > 23)
            att24 = rdtPredictData[i].att24;
        if (rdtType > 24)
            att25 = rdtPredictData[i].att25;
        if (rdtType > 25)
            att26 = rdtPredictData[i].att26;
        if (rdtType > 26)
            att27 = rdtPredictData[i].att27;
        if (rdtType > 27)
            att28 = rdtPredictData[i].att28;
        if (rdtType > 28)
            att29 = rdtPredictData[i].att29;
        if (rdtType > 29)
            att30 = rdtPredictData[i].att30;
        var rowObj = [];
        if (rdtType == 1)
            rowObj.push(groupId,ID,att1);
        else if (rdtType == 2)
            rowObj.push(groupId,ID,att1,att2);
        else if (rdtType == 3)
            rowObj.push(groupId,ID,att1,att2,att3);
        else if (rdtType == 4)
            rowObj.push(groupId,ID,att1,att2,att3,att4);
        else if (rdtType == 5)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5);
        else if (rdtType == 6)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6);
        else if (rdtType == 7)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7);
        else if (rdtType == 8)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8);
        else if (rdtType == 9)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9);
        else if (rdtType == 10)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10); 
        else if (rdtType == 11)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11);    
        else if (rdtType == 12)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12); 
        else if (rdtType == 13)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13);       
        else if (rdtType == 14)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14);
        else if (rdtType == 15)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15);       
        else if (rdtType == 16)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16); 
        else if (rdtType == 17)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17);       
        else if (rdtType == 18)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18);
        else if (rdtType == 19)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19);       
        else if (rdtType == 20)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20); 
        else if (rdtType == 21)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21);       
        else if (rdtType == 22)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22);
        else if (rdtType == 23)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23);       
        else if (rdtType == 24)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24); 
        else if (rdtType == 25)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25);       
        else if (rdtType == 26)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26);
        else if (rdtType == 27)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27);       
        else if (rdtType == 28)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28); 
        else if (rdtType == 29)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29);       
        else if (rdtType == 30)
            rowObj.push(groupId,ID,att1,att2,att3,att4,att5,att6,att7,att8,att9,att10,att11,att12,att13,att14,att15,att16,att17,att18,att19,att20,
                        att21,att22,att23,att24,att25,att26,att27,att28,att29,att30);
        tableObj.push(rowObj);
    }
    if (rdtType == 1)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_1T(GROUP_ID,ID,ATT1) VALUES(?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (rdtType == 2)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_2T(GROUP_ID,ID,ATT1,ATT2) VALUES(?, ?, ?, ?)";
        stmt = conn.prepare(sqlStr);   
    }
    else if (rdtType == 3)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_3T(GROUP_ID,ID,ATT1,ATT2,ATT3) VALUES(?, ?, ?, ?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 4)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_4T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4) VALUES(?, ?, ?, ?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 5)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_5T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5) VALUES(?, ?, ?, ?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 6)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_6T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6) VALUES(?, ?, ?, ?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 7)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_7T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7) VALUES(?, ?, ?, ?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }

    else if (rdtType == 8)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_8T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8) VALUES(?, ?, ?, ?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 9)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_9T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 10)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_10T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 11)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_11T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 12)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_12T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 13)
    {
        sqlStr = "INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_13T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10,ATT11,ATT12,ATT13) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?)";
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 14)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_14T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 15)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_15T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 16)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_16T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 17)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_17T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 18)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_18T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 19)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_19T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 20)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_20T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20) VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 21)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_21T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 22)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_22T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 23)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_23T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 24)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_24T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 25)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_25T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 26)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_26T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 27)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_27T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 28)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_28T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 29)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_29T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    else if (rdtType == 30)
    {
        sqlStr = 'INSERT INTO PAL_RDT_PRED_DATA_GRP_TAB_30T(GROUP_ID,ID,ATT1,ATT2,ATT3,ATT4,ATT5,ATT6,ATT7,ATT8,ATT9,ATT10, ' +
                 'ATT11,ATT12,ATT13,ATT14,ATT15,ATT16,ATT17,ATT18,ATT19,ATT20,ATT21,ATT22,ATT23,ATT24,ATT25,ATT26,ATT27,ATT28,ATT29,ATT30) ' +
                 ' VALUES(?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        stmt = conn.prepare(sqlStr);
    }
    // console.log(' _updateRdtPredictionData sqlStr ', sqlStr);

    // console.log(' _updateRdtPredictionData tableObj ', tableObj);


    stmt.execBatch(tableObj);
    stmt.drop();
    conn.disconnect();
    console.log(' _updateRdtPredictionData Completed ');
}

exports._runPredictionRdtGroup = async function(req) {

    var conn = hana.createConnection();
 
    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    // console.log('sqlStr: ', sqlStr);            
    var stmt=conn.prepare(sqlStr);
    var results=stmt.exec();
    stmt.drop();

    var rdtType = req.data.rdtType;
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

    let predictionObj = await rtdFuncs._runRdtPrediction(req,rdtType, predGroupId, version, scenario,modelVersion,impactAnalysis, startDate, endDate);

    let predResults = [];
    predResults.push(predictionObj);
    let res = req._.req.res;
    res.send({"value":predResults});
    conn.disconnect();

    // console.log('_runPredictionRdtGroup rdtType : ', rdtType);

}

exports._runRdtPrediction = async function(req,rdtType, predGroupId, version, scenario,modelVersion,impactAnalysis, startDate, endDate) {

    // console.log('_runRdtPrediction - predGroupId', predGroupId, 'Version ', version, 'Scenario ', scenario,'Model Version', modelVersion);

    var conn = hana.createConnection();
 
    conn.connect(conn_params);
    var sqlStr = 'SET SCHEMA ' + classicalSchema;  
    var stmt=conn.prepare(sqlStr);
    var result=stmt.exec();
    stmt.drop();

    let tabGroupId = predGroupId.replace(/-|"|'/g, '');
    let modelTableId = '"' + "#PAL_RDT_MODEL_TAB_" + tabGroupId + '"';
    let predTableId = '"' + "#PAL_RDT_PREDICTDATA_TAB_" + tabGroupId + '"';
    let GroupId = req.data.groupId; //primaryId;
    
    sqlStr = "create local temporary column table " + modelTableId+ " " +
                    "(\"ROW_INDEX\" INTEGER,\"TREE_INDEX\" INTEGER,\"MODEL_CONTENT\" NCLOB)"; // MEMORY THRESHOLD 1000)";


    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();
    sqlStr = 'INSERT INTO ' + modelTableId + ' SELECT "ROW_INDEX", "TREE_INDEX", "MODEL_CONTENT" FROM PAL_RDT_MODEL_GRP_TAB WHERE PAL_RDT_MODEL_GRP_TAB.GROUP_ID =' + "'" + predGroupId + "'";

    stmt=conn.prepare(sqlStr);
    stmt.exec();
    stmt.drop();
    var predDataObj = [];	

    if (rdtType == 1)
    {
 
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1" FROM PAL_RDT_PRED_DATA_GRP_TAB_1T WHERE PAL_RDT_PRED_DATA_GRP_TAB_1T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1" FROM PAL_RDT_PRED_DATA_GRP_TAB_1T WHERE PAL_RDT_PRED_DATA_GRP_TAB_1T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if (rdtType == 2)
    {
 
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2" FROM PAL_RDT_PRED_DATA_GRP_TAB_2T WHERE PAL_RDT_PRED_DATA_GRP_TAB_2T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2" FROM PAL_RDT_PRED_DATA_GRP_TAB_2T WHERE PAL_RDT_PRED_DATA_GRP_TAB_2T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 3)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" FROM PAL_RDT_PRED_DATA_GRP_TAB_3T WHERE PAL_RDT_PRED_DATA_GRP_TAB_3T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3" FROM PAL_RDT_PRED_DATA_GRP_TAB_3T WHERE PAL_RDT_PRED_DATA_GRP_TAB_3T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 4)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4" FROM PAL_RDT_PRED_DATA_GRP_TAB_4T WHERE PAL_RDT_PRED_DATA_GRP_TAB_4T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4" FROM PAL_RDT_PRED_DATA_GRP_TAB_4T WHERE PAL_RDT_PRED_DATA_GRP_TAB_4T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 5)
    {
         sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5" FROM PAL_RDT_PRED_DATA_GRP_TAB_5T WHERE PAL_RDT_PRED_DATA_GRP_TAB_5T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4" , "ATT5" FROM PAL_RDT_PRED_DATA_GRP_TAB_5T WHERE PAL_RDT_PRED_DATA_GRP_TAB_5T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 6)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" FROM PAL_RDT_PRED_DATA_GRP_TAB_6T WHERE PAL_RDT_PRED_DATA_GRP_TAB_6T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6" FROM PAL_RDT_PRED_DATA_GRP_TAB_6T WHERE PAL_RDT_PRED_DATA_GRP_TAB_6T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 7)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7"FROM PAL_RDT_PRED_DATA_GRP_TAB_7T WHERE PAL_RDT_PRED_DATA_GRP_TAB_7T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" FROM PAL_RDT_PRED_DATA_GRP_TAB_7T WHERE PAL_RDT_PRED_DATA_GRP_TAB_7T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 8)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" FROM PAL_RDT_PRED_DATA_GRP_TAB_8T WHERE PAL_RDT_PRED_DATA_GRP_TAB_8T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" FROM PAL_RDT_PRED_DATA_GRP_TAB_8T WHERE PAL_RDT_PRED_DATA_GRP_TAB_8T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 9)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" FROM PAL_RDT_PRED_DATA_GRP_TAB_9T WHERE PAL_RDT_PRED_DATA_GRP_TAB_9T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9" FROM PAL_RDT_PRED_DATA_GRP_TAB_9T WHERE PAL_RDT_PRED_DATA_GRP_TAB_9T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 10)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10" FROM PAL_RDT_PRED_DATA_GRP_TAB_10T WHERE PAL_RDT_PRED_DATA_GRP_TAB_10T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10" FROM PAL_RDT_PRED_DATA_GRP_TAB_10T WHERE PAL_RDT_PRED_DATA_GRP_TAB_10T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 11)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11" FROM PAL_RDT_PRED_DATA_GRP_TAB_11T WHERE PAL_RDT_PRED_DATA_GRP_TAB_11T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", "ATT11" FROM PAL_RDT_PRED_DATA_GRP_TAB_11T WHERE PAL_RDT_PRED_DATA_GRP_TAB_11T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 12)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        "(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,\"ATT12\" double)";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", "ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12" FROM PAL_RDT_PRED_DATA_GRP_TAB_12T WHERE PAL_RDT_PRED_DATA_GRP_TAB_12T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", "ATT11", "ATT12" FROM PAL_RDT_PRED_DATA_GRP_TAB_12T WHERE PAL_RDT_PRED_DATA_GRP_TAB_12T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 13)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13" ' +
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_13T WHERE PAL_RDT_PRED_DATA_GRP_TAB_13T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13"  ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_13T WHERE PAL_RDT_PRED_DATA_GRP_TAB_13T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 14)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14" ' +
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_14T WHERE PAL_RDT_PRED_DATA_GRP_TAB_14T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14"  ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_14T WHERE PAL_RDT_PRED_DATA_GRP_TAB_14T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 15)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15" ' +
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_15T WHERE PAL_RDT_PRED_DATA_GRP_TAB_15T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15"  ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_15T WHERE PAL_RDT_PRED_DATA_GRP_TAB_15T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 16)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16" ' +
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_16T WHERE PAL_RDT_PRED_DATA_GRP_TAB_16T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16"  ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_16T WHERE PAL_RDT_PRED_DATA_GRP_TAB_16T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 17)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17" ' +
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_17T WHERE PAL_RDT_PRED_DATA_GRP_TAB_17T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17"  ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_17T WHERE PAL_RDT_PRED_DATA_GRP_TAB_17T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 18)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
                        '(\"ID\" integer,\"ATT1\" double,\"ATT2\" double,\"ATT3\" double,\"ATT4\" double,\"ATT5\" double ,' +
                        '\"ATT6\" double,\"ATT7\" double,\"ATT8\" double,\"ATT9\" double,\"ATT10\" double,\"ATT11\" double,' +
                        '\"ATT12\" double, \"ATT13\" double, \"ATT14\" double, \"ATT15\" double, \"ATT16\" double, ' +
                        '\"ATT17\" double, \"ATT18\" double )';
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();
        sqlStr = 'INSERT INTO ' + predTableId + ' SELECT "ID", "ATT1", "ATT2", "ATT3" , "ATT4", "ATT5", ' +
                 '"ATT6" , "ATT7" , "ATT8" , "ATT9" , "ATT10", "ATT11", "ATT12", "ATT13", "ATT14", "ATT15", "ATT16", "ATT17", "ATT18" ' +
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_18T WHERE PAL_RDT_PRED_DATA_GRP_TAB_18T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18"  ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_18T WHERE PAL_RDT_PRED_DATA_GRP_TAB_18T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 19)
    {
        sqlStr = "create local temporary column table #PAL_RDT_PREDICTDATA_TAB_" + tabGroupId + " "  + 
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_19T WHERE PAL_RDT_PRED_DATA_GRP_TAB_19T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19" ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_19T WHERE PAL_RDT_PRED_DATA_GRP_TAB_19T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 20)
    {
        sqlStr = "create local temporary column table #PAL_RDT_PREDICTDATA_TAB_" + tabGroupId + " "  + 
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_20T WHERE PAL_RDT_PRED_DATA_GRP_TAB_20T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_20T WHERE PAL_RDT_PRED_DATA_GRP_TAB_20T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 21)
    {
        sqlStr = "create local temporary column table #PAL_RDT_PREDICTDATA_TAB_" + tabGroupId + " "  + 
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_21T WHERE PAL_RDT_PRED_DATA_GRP_TAB_21T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21" ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_21T WHERE PAL_RDT_PRED_DATA_GRP_TAB_21T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 22)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_22T WHERE PAL_RDT_PRED_DATA_GRP_TAB_22T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_22T WHERE PAL_RDT_PRED_DATA_GRP_TAB_22T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 23)
    {
        sqlStr = "create local temporary column table #PAL_RDT_PREDICTDATA_TAB_" + tabGroupId + " "  + 
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_23T WHERE PAL_RDT_PRED_DATA_GRP_TAB_23T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23" ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_23T WHERE PAL_RDT_PRED_DATA_GRP_TAB_23T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 24)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_24T WHERE PAL_RDT_PRED_DATA_GRP_TAB_24T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24" ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_24T WHERE PAL_RDT_PRED_DATA_GRP_TAB_24T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 25)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_25T WHERE PAL_RDT_PRED_DATA_GRP_TAB_25T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_25T WHERE PAL_RDT_PRED_DATA_GRP_TAB_25T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 26)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_26T WHERE PAL_RDT_PRED_DATA_GRP_TAB_26T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26" ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_26T WHERE PAL_RDT_PRED_DATA_GRP_TAB_26T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 27)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_27T WHERE PAL_RDT_PRED_DATA_GRP_TAB_27T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_27T WHERE PAL_RDT_PRED_DATA_GRP_TAB_27T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 28)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_28T WHERE PAL_RDT_PRED_DATA_GRP_TAB_28T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" , "ATT28" ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_28T WHERE PAL_RDT_PRED_DATA_GRP_TAB_28T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 29)
    {
        sqlStr = "create local temporary column table " + predTableId + " " + 
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_29T WHERE PAL_RDT_PRED_DATA_GRP_TAB_29T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" , "ATT28" , "ATT29"' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_29T WHERE PAL_RDT_PRED_DATA_GRP_TAB_29T.GROUP_ID =' + "'" + predGroupId + "'";
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
    else if(rdtType == 30)
    {
        sqlStr =    "create local temporary column table " + predTableId + " " +
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
                 ' FROM PAL_RDT_PRED_DATA_GRP_TAB_30T WHERE PAL_RDT_PRED_DATA_GRP_TAB_30T.GROUP_ID =' + "'" + predGroupId + "'";
        stmt=conn.prepare(sqlStr);
        result=stmt.exec();
        stmt.drop();

        sqlStr = 'SELECT "ID", "ATT1", "ATT2", "ATT3", "ATT4", "ATT4" , "ATT5" , "ATT6", "ATT7" , "ATT8" , "ATT9", "ATT10", ' +
                '"ATT11", "ATT12" , "ATT13", "ATT14", "ATT15" , "ATT16", "ATT17" , "ATT18" , "ATT19", "ATT20" ' +
                '"ATT21", "ATT22" , "ATT23", "ATT24", "ATT25" , "ATT26", "ATT27" , "ATT28" , "ATT29", "ATT30" ' + 
                ' FROM PAL_RDT_PRED_DATA_GRP_TAB_30T WHERE PAL_RDT_PRED_DATA_GRP_TAB_30T.GROUP_ID =' + "'" + predGroupId + "'";
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
        console.log('_runRdtPrediction Invalid rdtType ', rdtType);
        return;
    }
    
    let paramTableId = '"' + "#PAL_RDT_PARAMETER_TAB_" + tabGroupId + '"';

    sqlStr = "create local temporary column table " + paramTableId + " " +
                        "(\"PARAM_NAME\" varchar(100),\"INT_VALUE\" integer,\"double_VALUE\" double,\"STRING_VALUE\" varchar(100))";
    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();

    sqlStr = 'INSERT INTO ' + paramTableId + ' SELECT "PARAM_NAME", "INT_VALUE", "DOUBLE_VALUE", "STRING_VALUE" FROM PAL_RDT_PREDICT_PARAMETER_GRP_TAB WHERE PAL_RDT_PREDICT_PARAMETER_GRP_TAB.GROUP_ID =' + "'" +  predGroupId + "'";

    stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();


    sqlStr = ' SELECT "PARAM_NAME", "INT_VALUE", "DOUBLE_VALUE", "STRING_VALUE" FROM PAL_RDT_PREDICT_PARAMETER_GRP_TAB WHERE PAL_RDT_PREDICT_PARAMETER_GRP_TAB.GROUP_ID =' + "'" +  predGroupId + "'";
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


    // sqlStr = "call _SYS_AFL.PAL_RANDOM_DECISION_TREES_PREDICT (" + "#PAL_RDT_PREDICTDATA_TAB_" + tabGroupId + "," + "#PAL_RDT_MODEL_TAB_" + tabGroupId + "," + "#PAL_RDT_PARAMETER_TAB_" + tabGroupId + "," + "?)";

    sqlStr = "call _SYS_AFL.PAL_RANDOM_DECISION_TREES_PREDICT(" + predTableId + "," + modelTableId + "," + paramTableId + "," + "?)";

    console.log('_runRdtPrediction rdtType ', rdtType);

    console.log('_runRdtPrediction sqlStr ', sqlStr);

    // stmt=conn.prepare(sqlStr);
    // let predictionResults=stmt.exec();
    // stmt.drop();

    let predictionResults = await rtdFuncs._execAsync(conn, sqlStr);

    console.log('After SYS_AFL.PAL_RANDOM_DECISION_TREES_PREDICT Response = ', new Date(), "predictionResults.length ", predictionResults.length);


    let resultsObj;
    if(predictionResults.length > 0)
    {
        resultsObj = await _processPredictionsResponse(req,predictionResults, predGroupId, version, scenario, modelVersion, impactAnalysis,startDate, endDate)
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
    // DELETE INPUT DATA & PARAMETERS AFTER MODEL GENERATION
    const groupId = predGroupId;

    // Validate input early
    if (rdtType < 1 || rdtType > 30) {
        return req.error(400, `Invalid MlrType: ${rdtType}`);
    }

    // Construct table name dynamically
    const tableName = `PAL_RDT_PRED_DATA_GRP_TAB_${rdtType}T`;
    console.log("RDT Prediction tableName ", tableName, "groupId ", groupId);

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
            `DELETE FROM PAL_RDT_PREDICT_PARAMETER_GRP_TAB WHERE GROUP_ID = ?`
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
    let rdtID = idObj; 
    let predictionParameters = predParamsObj;
    let predictionData = predDataObj;
    let predictedResults = resultsObj;
    returnObj.push({rdtID, createdAt,predictionParameters,rdtType,predictionData,predictedResults});

    return returnObj[0];
}

async function _processPredictionsResponse(req, predictionResults, predGroupId, version, scenario, modelVersion, impactAnalysis,startDate, endDate)
{
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
        let score =  predictionResults[i].SCORE;
        let confidence = predictionResults[i].CONFIDENCE;
    
        resultsObj.push({GroupId,id,score,confidence});
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
    // console.log("Time Periods for Group :", groupId, " Results: ", distPeriods);
    var predictedTime = new Date().toISOString();
    var trimmedPeriod = vcConfigTimePeriod.replace(/^(["]*)/g, '');
    
    let tableObj = [];	
    let allPeriods = [];

    for (var index=0; index<distPeriods.length; index++)
    {     
        // let predictedVal = resultsObj[index].score;
        // predictedVal =  (+predictedVal).toFixed(2);
        let periodId = distPeriods[index][trimmedPeriod];
        allPeriods.push(periodId);
    }
    sqlStr = 'SELECT DISTINCT "CAL_DATE", "Location", "Product", "Type", "OBJ_DEP", "OBJ_COUNTER", "OrderQuantity", "VERSION", "SCENARIO" ' +
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
            let modelType = 'RDT'; 
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
                        PREDICTED:predVal,PREDICTED_TIME:predTime,OPT_STARTTIME:predTime, DELTA_TIME:predTime,PREDICTED_STATUS:status,
                        PRE_OPTIMIZED:predVal,PRE_OPTIMIZED_TIME:predTime, OPT_ALGORITHM:'NONE'};

            tableObj.push(rowObj);
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
    // console.log('sqlStr: ', sqlStr);            
    var stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();
 
    // Extract Importance
    sqlStr = 'SELECT "GROUP_ID", "VARIABLE_NAME", "IMPORTANCE" FROM PAL_RDT_IMP_GRP_TAB' +
                 ' WHERE "GROUP_ID" = ' + "'" + groupId + "'";

    var stmt=conn.prepare(sqlStr);
    result=stmt.exec();
    stmt.drop();

    conn.disconnect();

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


        for (let pIndex=0; pIndex<distPeriods.length; pIndex++)
        {     
            let predictedVal = resultsObj[pIndex].score;
            predictedVal = ( +predictedVal).toFixed(2);
            let periodId = distPeriods[pIndex][trimmedPeriod];
            //console.log('trimmedPeriod : ', trimmedPeriod, 'vcConfigTimePeriod :', vcConfigTimePeriod);

            sqlStr = 'SELECT DISTINCT "CAL_DATE", "Location", "Product", ' +
                    '"Type", "OBJ_DEP", "OBJ_COUNTER", "ROW_ID", "CharCount", "CharCountPercent", "VERSION", "SCENARIO" ' +
                    'FROM "V_FUTURE_DEP_TS" WHERE "GroupID" = ' + "'" + tpGroupId + "'" +
                    ' AND "Type" = ' + "'" + odType + "'" + 
                    ' AND "VERSION" = ' + "'" + version + "'" +
                    ' AND "SCENARIO" = ' + "'" + scenario + "'" +
                    startDateSql    + endDateSql +
                    ' AND ' + '"' + vcConfigTimePeriod + '"' + ' = ' + "'" + periodId + "'";

            result = [];


            result = await cds.run(sqlStr);
        
            var orderCount = 0;
            for (let rIndex = 0; rIndex < result.length; rIndex++)
            {
                let impact_val = impact_percent = 0;
                if (result[rIndex].ROW_ID == 1)
                {
                    impact_percent = w1*predictedVal;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }
                else if (result[rIndex].ROW_ID == 2)
                {
                    impact_percent = w2*predictedVal;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 3)
                {
                    impact_percent = w3*predictedVal;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 4)
                {
                    impact_percent = w4*predictedVal;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 5)
                {
                    impact_percent = w5*predictedVal;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 6)
                {
                    impact_percent = w6*predictedVal;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 7)
                {
                    impact_percent = w7*predictedVal;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 8)
                {
                    impact_percent = w8*predictedVal;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 9)
                {
                    impact_percent = w9*predictedVal;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 10)
                {
                    impact_percent = w10*predictedVal;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 11)
                {
                    impact_percent = w11*predictedVal;
                    if(result[rIndex].CharCount != 0)
                    {
                        orderCount = result[rIndex].CharCount / result[rIndex].CharCountPercent;
                        impact_val = impact_percent * orderCount;
                    }
                }            
                else if (result[rIndex].ROW_ID == 12)
                {
                    impact_percent = w12*predictedVal;
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

                let date =  result[rIndex].CAL_DATE;
                let location =  result[rIndex].Location ;
                let product = result[rIndex].Product;
                let type = result[rIndex].Type;
                let obj_dep = result[rIndex].OBJ_DEP;
                let obj_counter = result[rIndex].OBJ_COUNTER ;
                let row_id = result[rIndex].ROW_ID; 
                let modelType = 'RDT'; 
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
                //     "'" + 'RDT' + "'" + "," +
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
                //     console.log("ERROR -- CP_TS_OBJDEP_CHAR_IMPACT_F RDT UPSERT sqlStr ", sqlStr); 
                //     throw new Error(exception.toString());
                // }  
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