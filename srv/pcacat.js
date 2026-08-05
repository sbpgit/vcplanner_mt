const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
const hana = require('@sap/hana-client');
const pcaCatFuncs = require('./pcacat.js');


exports._runPcaCat = async function(req) {
    
    console.log("_runPcaCat STARTED ");

    await pcaCatFuncs._updatePcaCatGroupParams(req);   
    await pcaCatFuncs._updatePcaCatGroupData(req);
    await pcaCatFuncs._runPcaCatGroup(req); 
    console.log("_runPcaCat COMPLETED ");

}


exports._updatePcaCatGroupParams = async function(req) {
    const pcaCatGroupParams = req.data.pcaCatParameters;

    // console.log("_updatepcaCatGroupParams ",pcaCatGroupParams );

// ---------- BEGIN OF DELETE EXISTING PARAMETERS FOR PROVISIONED GROUPS
    let inGroups = [];
    let pcaCatGroup = pcaCatGroupParams[0].groupId;
    inGroups.push(pcaCatGroup);
    for (var i in pcaCatGroupParams)
    { 
        if (i > 0)
        {
            if( pcaCatGroupParams[i].groupId != pcaCatGroupParams[i-1].groupId)
            {
                inGroups.push(pcaCatGroupParams[i].groupId);
            }
        }
    }
    for (let i = 0; i < inGroups.length; i++)
    {
        sqlStr = "DELETE FROM PAL_PCA_CAT_PARAMETER_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
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
        
    for (let i = 0; i < pcaCatGroupParams.length; i++)
    {
        let groupId = pcaCatGroupParams[i].groupId ;
        let paramName = pcaCatGroupParams[i].paramName;
        let intVal =  pcaCatGroupParams[i].intVal
        let doubleVal = pcaCatGroupParams[i].doubleVal;
        let strVal = pcaCatGroupParams[i].strVal;
        let rowObj  = {GROUP_ID:groupId,
            PARAM_NAME:paramName,
            INT_VALUE:intVal,
            DOUBLE_VALUE:doubleVal,
            STRING_VALUE:strVal};
        tableObj.push(rowObj);
        
    }

    cqnQuery = {INSERT:{ into: { ref: ['PAL_PCA_CAT_PARAMETER_GRP_TAB'] }, entries:  tableObj }};
    try {
        await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery exception ", cqnQuery);
        throw new Error(exception.toString());
    }
}



exports._updatePcaCatGroupData = async function(req) {
    // console.log("_updatePcaCatGroupData ", req.data.pcaCatData);
    const pcaCatGroupData = req.data.pcaCatData;

    var tableObj = [];	

    let ID, groupId;
    for (var i = 0; i < pcaCatGroupData.length; i++)
    {
        groupId = pcaCatGroupData[i].groupId ;
        ID = pcaCatGroupData[i].ID;
        let rowObj  = {GROUP_ID:groupId,
            ID:ID,
            C1:pcaCatGroupData[i].att1,
            C2:pcaCatGroupData[i].att2,
            C3:pcaCatGroupData[i].att3,
            C4:pcaCatGroupData[i].att4,
            C5:pcaCatGroupData[i].att5,
            C6:pcaCatGroupData[i].att6,
            C7:pcaCatGroupData[i].att7,
            C8:pcaCatGroupData[i].att8,
            C9:pcaCatGroupData[i].att9,
            C10:pcaCatGroupData[i].att10,
            C11:pcaCatGroupData[i].att11,
            C12:pcaCatGroupData[i].att12,
            C13:pcaCatGroupData[i].att13,
            C14:pcaCatGroupData[i].att14,
            C15:pcaCatGroupData[i].att15,
            C16:pcaCatGroupData[i].att16,
            C17:pcaCatGroupData[i].att17,
            C18:pcaCatGroupData[i].att18,
            C19:pcaCatGroupData[i].att19,
            C20:pcaCatGroupData[i].att20,
            C21:pcaCatGroupData[i].att21,
            C22:pcaCatGroupData[i].att22,
            C23:pcaCatGroupData[i].att23,
            C24:pcaCatGroupData[i].att24,
            C25:pcaCatGroupData[i].att25,
            C26:pcaCatGroupData[i].att26,
            C27:pcaCatGroupData[i].att27,
            C28:pcaCatGroupData[i].att28,
            C29:pcaCatGroupData[i].att29,
            C30:pcaCatGroupData[i].att30};
        // console.log("_updatePcaCatGroupData rowObj", rowObj);
        tableObj.push(rowObj);
    }
    
    cqnQuery = {INSERT:{ into: { ref: ['PAL_PCA_CAT_DATA_GRP_TAB_T'] }, entries:  tableObj }};
    console.log("cqnQuery", cqnQuery);
    try {
        await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery exception ", cqnQuery);
        throw new Error(exception.toString());
    }

}


exports._runPcaCatGroup = async function(req) {


    var pcaCatDataTable = "PAL_PCA_CAT_DATA_GRP_TAB_T";

////////////////////////////////////////////////////////////////////////////////////
    const pcaCatGroupParams = req.data.pcaCatParameters;
    // const pcaCatGroupData = req.data.pcaCatData;
    const pcaCatGroupData = "PAL_PCA_CAT_DATA_GRP_TAB_T";


    let inGroups = [];
    let inGroup = pcaCatGroupParams[0].groupId;
    inGroups.push(inGroup);
    for (var i in pcaCatGroupParams)
    { 
        if (i > 0)
        {
            if( pcaCatGroupParams[i].groupId != pcaCatGroupParams[i-1].groupId)
            {
                inGroups.push(pcaCatGroupParams[i].groupId);
            }
        }
    }
    // for (let i = 0; i < inGroups.length; i++)
    // {

    //     sqlStr = "DELETE FROM PAL_PCA_CAT_LOADINGS_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
    //     try {
    //         await cds.run(sqlStr);
    //     }
    //     catch (exception) {
    //         console.log("sqlStr exception ", sqlStr);
    //         throw new Error(exception.toString());
    //     }
    //     sqlStr =  "DELETE FROM PAL_PCA_CAT_LOADINGS_INFORMATION_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
    //     try {
    //         await cds.run(sqlStr);
    //     }
    //     catch (exception) {
    //         console.log("sqlStr exception ", sqlStr);
    //         throw new Error(exception.toString());
    //     }

    //     sqlStr =  "DELETE FROM PAL_PCA_CAT_SCORES_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
    //     try {
    //         await cds.run(sqlStr);
    //     }
    //     catch (exception) {
    //         console.log("sqlStr exception ", sqlStr);
    //         throw new Error(exception.toString());
    //     }

    //     sqlStr =  "DELETE FROM PAL_PCA_CAT_SCALING_INFORMATION_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
    //     try {
    //         await cds.run(sqlStr);
    //     }
    //     catch (exception) {
    //         console.log("sqlStr exception ", sqlStr);
    //         throw new Error(exception.toString());
    //     }


    //     sqlStr =  "DELETE FROM PAL_PCA_CAT_QUANTIFICATION_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
    //     try {
    //         await cds.run(sqlStr);
    //     }
    //     catch (exception) {
    //         console.log("sqlStr exception ", sqlStr);
    //         throw new Error(exception.toString());
    //     }


    //     sqlStr =  "DELETE FROM PAL_PCA_CAT_STAT_GRP_TAB WHERE GROUP_ID = " + "'" + inGroups[i] + "'";
    //     try {
    //         await cds.run(sqlStr);
    //     }
    //     catch (exception) {
    //         console.log("sqlStr exception ", sqlStr);
    //         throw new Error(exception.toString());
    //     }


    // }


    console.log("Before const db = await cds.connect.to('db')")
    const db = await cds.connect.to('db');
    // Start a manual database transaction
    const tx = db.tx(req);
    

    sqlStr = 'call PCA_CAT_MAIN_T(' + pcaCatGroupData + ', ?,?,?,?,?,?)';

    console.log(" SP PCA_CAT_MAIN_T", sqlStr);

    let pcaCatResults;
    try {
        pcaCatResults = await tx.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }
    
    
    let pcaCatLoadings = pcaCatResults.OT_GROUP_CAT_PCA_LOADINGS;

    // console.log("pcaCatLoadings ", pcaCatLoadings);

  
    let pcaCatTableObj = [];

    for (let i=0; i< pcaCatLoadings.length; i++)
    {     
        let groupId = pcaCatLoadings[i].GROUP_ID;
        let VARIABLE_NAME = pcaCatLoadings[i].VARIABLE_NAME;
        let COMPONENT_ID = pcaCatLoadings[i].COMPONENT_ID;
        let COMPONENT_LOADING = pcaCatLoadings[i].COMPONENT_LOADING;

        let grpStr=groupId.split('#');
        let MODEL_PROFILE = grpStr[0]; 
        let LOCATION_ID = grpStr[1];
        let PRODUCT_ID = grpStr[2];
        pcaCatTableObj.push({LOCATION_ID,PRODUCT_ID,MODEL_PROFILE,VARIABLE_NAME,COMPONENT_ID,COMPONENT_LOADING});


        let sqlStr = 'DELETE FROM CP_PCA_CAT_LOADINGS_GRP_TAB WHERE ' +
                     ' LOCATION_ID = ' + "'" + LOCATION_ID + "'" + ' AND ' +
                     ' PRODUCT_ID = ' + "'" + PRODUCT_ID + "'"+ ' AND ' +
                     ' MODEL_PROFILE = ' + "'" + MODEL_PROFILE + "'";
        await cds.run(sqlStr);

    }
    let cqnQuery = {UPSERT:{ into: { ref: ['CP_PCA_CAT_LOADINGS_GRP_TAB'] }, entries:  pcaCatTableObj }};

    try {
        await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery ", cqnQuery);
        throw new Error(exception.toString());
    }

    pcaCatTableObj = [];

    let pcaCatLoadingsInfo = pcaCatResults.OT_GROUP_CAT_PCA_LOADINGS_INFO;
    // console.log("pcaCatLoadingsInfo ", pcaCatLoadingsInfo);


    for (let i=0; i< pcaCatLoadingsInfo.length; i++)
    {     
        let groupId = pcaCatLoadingsInfo[i].GROUP_ID;
        let COMPONENT_ID = pcaCatLoadingsInfo[i].COMPONENT_ID;
        let METRIC_NAME = pcaCatLoadingsInfo[i].METRIC_NAME;
        let METRIC_VALUE = pcaCatLoadingsInfo[i].METRIC_VALUE;


        let grpStr=groupId.split('#');

        let MODEL_PROFILE = grpStr[0]; 
        let LOCATION_ID = grpStr[1];
        let PRODUCT_ID = grpStr[2];
        
        pcaCatTableObj.push({LOCATION_ID,PRODUCT_ID,MODEL_PROFILE,COMPONENT_ID,METRIC_NAME,METRIC_VALUE});

        // let sqlStr = 'DELETE FROM CP_PCA_CAT_LOADINGS_INFORMATION_GRP_TAB WHERE ' +
        //             ' LOCATION_ID = ' + "'" + LOCATION_ID + "'" + ' AND ' +
        //             ' PRODUCT_ID = ' + "'" + PRODUCT_ID + "'" + ' AND ' +
        //             ' MODEL_PROFILE = ' + "'" + MODEL_PROFILE + "'";
        // await cds.run(sqlStr);
    }

    // console.log(" clustersTableObj ",clustersTableObj);
    cqnQuery = {UPSERT:{ into: { ref: ['CP_PCA_CAT_LOADINGS_INFORMATION_GRP_TAB'] }, entries:  pcaCatTableObj }};

    try {
        await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery ", cqnQuery);
        throw new Error(exception.toString());
    }

    pcaCatTableObj = [];

    let pcaCatScores = pcaCatResults.OT_GROUP_CAT_PCA_SCORES;
    // console.log("pcaCatScores ", pcaCatScores);



    for (let i=0; i< pcaCatScores.length; i++)
    {     
        let groupId = pcaCatScores[i].GROUP_ID;
        let ID = pcaCatScores[i].ID;
        let COMPONENT_ID = pcaCatScores[i].COMPONENT_ID;
        let COMPONENT_SCORE = pcaCatScores[i].COMPONENT_SCORE;


        let grpStr=groupId.split('#');

        let MODEL_PROFILE = grpStr[0]; 
        let LOCATION_ID = grpStr[1];
        let PRODUCT_ID = grpStr[2];
        
        pcaCatTableObj.push({LOCATION_ID,PRODUCT_ID,MODEL_PROFILE,ID,COMPONENT_ID,COMPONENT_SCORE});

        // let sqlStr = 'DELETE FROM CP_PCA_CAT_SCORES_GRP_TAB WHERE ' +
        //             ' LOCATION_ID = ' + "'" + LOCATION_ID + "'" + ' AND ' +
        //             ' PRODUCT_ID = ' + "'" + PRODUCT_ID + "'" + ' AND ' +
        //             ' MODEL_PROFILE = ' + "'" + MODEL_PROFILE + "'";
        // await cds.run(sqlStr);
    }

    cqnQuery = {UPSERT:{ into: { ref: ['CP_PCA_CAT_SCORES_GRP_TAB'] }, entries:  pcaCatTableObj }};

    try {
        await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery ", cqnQuery);
        throw new Error(exception.toString());
    }

    pcaCatTableObj = [];

    let pcaCatScalingInfo = pcaCatResults.OT_GROUP_CAT_PCA_SCALING_INFO;
    // console.log("pcaCatScalingInfo ", pcaCatScalingInfo);


    for (let i=0; i< pcaCatScalingInfo.length; i++)
    {     
        let groupId = pcaCatScalingInfo[i].GROUP_ID;
        let VARIABLE_NAME = pcaCatScalingInfo[i].VARIABLE_NAME;
        let MEAN = pcaCatScalingInfo[i].MEAN;
        let SCALE = pcaCatScalingInfo[i].SCALE;



        let grpStr=groupId.split('#');

        let MODEL_PROFILE = grpStr[0]; 
        let LOCATION_ID = grpStr[1];
        let PRODUCT_ID = grpStr[2];
        
        pcaCatTableObj.push({LOCATION_ID,PRODUCT_ID,MODEL_PROFILE,VARIABLE_NAME,MEAN,SCALE});

        // let sqlStr = 'DELETE FROM CP_PCA_CAT_SCALING_INFORMATION_GRP_TAB WHERE ' +
        //             ' LOCATION_ID = ' + "'" + LOCATION_ID + "'" + ' AND ' +
        //             ' PRODUCT_ID = ' + "'" + PRODUCT_ID + "'" + ' AND ' +
        //             ' MODEL_PROFILE = ' + "'" + MODEL_PROFILE + "'";
        // await cds.run(sqlStr);
    }

    // console.log(" clustersTableObj ",clustersTableObj);
    cqnQuery = {UPSERT:{ into: { ref: ['CP_PCA_CAT_SCALING_INFORMATION_GRP_TAB'] }, entries:  pcaCatTableObj }};

    try {
        await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery ", cqnQuery);
        throw new Error(exception.toString());
    }

    pcaCatTableObj = [];
    let pcaCatQuantification = pcaCatResults.OT_GROUP_CAT_PCA_QUANTIFICATION;
    // console.log("pcaCatQuantification ", pcaCatQuantification);


    for (let i=0; i< pcaCatQuantification.length; i++)
    {     
        let groupId = pcaCatQuantification[i].GROUP_ID;
        let VARIABLE_NAME = pcaCatQuantification[i].VARIABLE_NAME;
        let CATEGORY_VALUE = pcaCatQuantification[i].CATEGORY_VALUE;
        let COMPONENT_ID = pcaCatQuantification[i].COMPONENT_ID;
        let QUANTIFICATION = pcaCatQuantification[i].QUANTIFICATION;


        let grpStr=groupId.split('#');

        let MODEL_PROFILE = grpStr[0]; 
        let LOCATION_ID = grpStr[1];
        let PRODUCT_ID = grpStr[2];
        
        pcaCatTableObj.push({LOCATION_ID,PRODUCT_ID,MODEL_PROFILE,VARIABLE_NAME,CATEGORY_VALUE,COMPONENT_ID,QUANTIFICATION});

        // let sqlStr = 'DELETE FROM CP_PCA_CAT_QUANTIFICATION_GRP_TAB WHERE ' +
        //             ' LOCATION_ID = ' + "'" + LOCATION_ID + "'" + ' AND ' +
        //             ' PRODUCT_ID = ' + "'" + PRODUCT_ID + "'" + ' AND ' +
        //             ' MODEL_PROFILE = ' + "'" + MODEL_PROFILE + "'";
        // await cds.run(sqlStr);
    }

    // console.log(" clustersTableObj ",clustersTableObj);
    cqnQuery = {UPSERT:{ into: { ref: ['CP_PCA_CAT_QUANTIFICATION_GRP_TAB'] }, entries:  pcaCatTableObj }};

    try {
        await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery ", cqnQuery);
        throw new Error(exception.toString());
    }
   

    pcaCatTableObj = [];
    let ot_group_cat_pca_stat = pcaCatResults.OT_GROUP_CAT_PCA_STAT;

    // console.log("ot_group_cat_pca_stat ", ot_group_cat_pca_stat);


    for (let i=0; i< ot_group_cat_pca_stat.length; i++)
    {     
        let groupId = ot_group_cat_pca_stat[i].GROUP_ID;
        let STAT_NAME = ot_group_cat_pca_stat[i].STAT_NAME;
        let STAT_VALUE = ot_group_cat_pca_stat[i].STAT_VALUE;


        let grpStr=groupId.split('#');

        let MODEL_PROFILE = grpStr[0]; 
        let LOCATION_ID = grpStr[1];
        let PRODUCT_ID = grpStr[2];
        
        pcaCatTableObj.push({LOCATION_ID,PRODUCT_ID,MODEL_PROFILE,STAT_NAME,STAT_VALUE});

        // let sqlStr = 'DELETE FROM CP_PCA_CAT_STAT_GRP_TAB WHERE ' +
        //             ' LOCATION_ID = ' + "'" + LOCATION_ID + "'" + ' AND ' +
        //             ' PRODUCT_ID = ' + "'" + PRODUCT_ID + "'" + ' AND ' +
        //             ' MODEL_PROFILE = ' + "'" + MODEL_PROFILE + "'";
        // await cds.run(sqlStr);
    }

    cqnQuery = {UPSERT:{ into: { ref: ['CP_PCA_CAT_STAT_GRP_TAB'] }, entries:  pcaCatTableObj }};

    try {
        await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery ", cqnQuery);
        throw new Error(exception.toString());
    }

    let createtAtObj = new Date();
    let idObj = uuidv1();

    let returnObj = [];	
    let createdAt = createtAtObj;
    let pcaCatID = idObj; //uuidObj;
    returnObj.push({pcaCatID, createdAt,pcaCatGroupParams,pcaCatGroupData});
    var res = req._.req.res;
    res.send({"value":returnObj});

    console.log('Completed PCA CATEGORICAL for Groups Successfully');


}