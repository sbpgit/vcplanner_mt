const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
const hana = require('@sap/hana-client');
const aesFuncs = require('./aes.js');
const awaitSleep = require('await-sleep');
const { sluDependencies } = require('mathjs');

exports._runAesForecast = async function(req) {

   
   await aesFuncs._updateAesGroupParams (req);
  
   await aesFuncs._updateAesGroupData(req);

   await aesFuncs._runForecastAesGroup(req); 

   await aesFuncs._deleteInputAesGroupData(req);
  
}


exports._updateAesGroupParams = async function(req) {
    const aesGroupParams = req.data.forecastParams;

    var tableObj = [];	
        
    for (let i = 0; i < aesGroupParams.length; i++)
    {
        let groupId = aesGroupParams[i].groupId ;
        let paramName = aesGroupParams[i].paramName;
        let intVal =  aesGroupParams[i].intVal
        let doubleVal = aesGroupParams[i].doubleVal;
        let strVal = aesGroupParams[i].strVal;
        // var rowObj = [];
        // rowObj.push(groupId,paramName,intVal,doubleVal,strVal);
        let rowObj  = {GROUP_ID:groupId,
            PARAM_NAME:paramName,
            INT_VALUE:intVal,
            DOUBLE_VALUE:doubleVal,
            STRING_VALUE:strVal};
        tableObj.push(rowObj);
        
    }
    cqnQuery = {INSERT:{ into: { ref: ['PAL_AES_PARAMETER_GRP_TAB'] }, entries:  tableObj }};

    try {
            await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery exception ", cqnQuery);
        throw new Error(exception.toString());
    }

}

exports._deleteInputAesGroupData  = async function(req) {
    const aesGroupParams = req.data.forecastParams;
    let inGroups = "(" + "'" + aesGroupParams[0].groupId + "'";
    for (var i in aesGroupParams)
    { 
        if (i > 0)
        {
            if( aesGroupParams[i].groupId != aesGroupParams[i-1].groupId)
            {
                inGroups = inGroups + "," + "'" + aesGroupParams[i].groupId + "'";
            }
        }
    }
    inGroups = inGroups + ")";
    console.log("_deleteInputAesGroupData AES  inGroups ", inGroups);
  
    sqlStr = 'DELETE FROM "PAL_AES_PARAMETER_GRP_TAB" ' + ' WHERE GROUP_ID IN ' + inGroups;

    try {
        await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }

    sqlStr = 'DELETE FROM "PAL_AES_DATA_GRP_TAB" ' + ' WHERE GROUP_ID IN ' + inGroups;

    try {
        await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }

}

exports._updateAesGroupData  = async function(req) {
    const aesGroupData = req.data.timeseriesData;
    var tableObj = [];	    
    let value, timestamp, groupId;
    for (var i = 0; i < aesGroupData.length; i++)
    {
        groupId = aesGroupData[i].groupId ;
        timestamp = aesGroupData[i].timestamp;
        value = aesGroupData[i].value;
        let rowObj  = {GROUP_ID:groupId,
            TIMESTAMP:timestamp,
            VALUE:value};
        tableObj.push(rowObj);
    }
    cqnQuery = {INSERT:{ into: { ref: ['PAL_AES_DATA_GRP_TAB'] }, entries:  tableObj }};

    try {
            await cds.run(cqnQuery);
    }
    catch (exception) {
        console.log("cqnQuery exception ", cqnQuery);
        throw new Error(exception.toString());
    }
    console.log(' _updateAesGroupData Completed ');

}

exports._runForecastAesGroup = async function(req) {

    var aesType = req.data.aesType;
    var aesModelVersion = req.data.modelVersion;
    var version = req.data.Version;
    var scenario = req.data.Scenario;
    console.log('Executing aes Forecast at GROUP REQ aes Model Version', aesModelVersion);

    console.log('Executing aes Forecast version', version, "scenario = ", scenario);

    let aesDataTable = "PAL_AES_DATA_GRP_TAB";
    const aesGroupParams = req.data.forecastParams;

    let inGroups = "(" + "'" + aesGroupParams[0].groupId + "'";
    for (var i in aesGroupParams)
    { 
        if (i > 0)
        {
            if( aesGroupParams[i].groupId != aesGroupParams[i-1].groupId)
            {
                inGroups = inGroups + "," + "'" + aesGroupParams[i].groupId + "'";
            }
        }
    }
    inGroups = inGroups + ")";
    // console.log("AES PARAMETERS inGroups ", inGroups)
            
    sqlStr =  'DELETE FROM "PAL_AES_STATS_GRP_TAB" WHERE GROUP_ID IN ' + inGroups ;
    try {
        await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }

    sqlStr =  'DELETE FROM "PAL_AES_FORECAST_GRP_TAB" WHERE GROUP_ID IN ' + inGroups ;
    try {
        await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }


    console.log("Before const db = await cds.connect.to('db')")
    const db = await cds.connect.to('db');
    // Start a manual database transaction
    const tx = db.tx(req);



    sqlStr = 'call "AES_MAIN"(' + aesDataTable + ', ?,?)';
    console.log("AES Procedure Execution sqlStr  ", sqlStr);

    let aesResults;
    try {
        aesResults = await tx.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }

    var statisticsObj = [];

    let statResults = aesResults.OT_GROUP_STATS;

    for (let i=0; i< statResults.length; i++)
    {     
        let groupId = statResults[i].GROUP_ID;
        let statName = statResults[i].STAT_NAME;
        let statValue = statResults[i].STAT_VALUE;
        statisticsObj.push({groupId,statName,statValue});
    }

    let forecastResults = aesResults.OT_GROUP_FORECAST;

    // for (let i = 0; i < inGroups.length; i++)
    // {
    //     sqlStr = 'DELETE FROM "PAL_AES_PARAMETER_GRP_TAB" ' + 'WHERE GROUP_ID = ' + "'" + inGroups[i] + "'" ;
    //     try {
    //         await cds.run(sqlStr);
    //     }
    //     catch (exception) {
    //         console.log("sqlStr exception ", sqlStr);
    //         throw new Error(exception.toString());
    //     }

    //     sqlStr = 'DELETE FROM "PAL_AES_DATA_GRP_TAB" ' + 'WHERE GROUP_ID = ' + "'" + inGroups[i] + "'" ;
    //     try {
    //         await cds.run(sqlStr);
    //     }
    //     catch (exception) {
    //         console.log("sqlStr exception ", sqlStr);
    //         throw new Error(exception.toString());
    //     }

    // }
    return await _genStatForecast(req,forecastResults,statisticsObj);
}

async function _genStatForecast(req,forecastResults, statisticsObj) {
    var aesType = req.data.aesType;
    var aesModelVersion = req.data.modelVersion;
    var version = req.data.Version;
    var scenario = req.data.Scenario;
    var statProfile = req.data.profile;
    const aesGroupParams = req.data.forecastParams;

    // console.log(" AES forecastResults ", forecastResults);
    var forecastedResultsObj = [];
    let results;
    let tableObj = [];	
    let locProdCustTableObj = [];
    let prevLocation, prevProduct,prevCustomer = 0;
    // let prevGroupId = forecastResults[0].GROUP_ID;
    let predictedTime = new Date().toISOString();
    
    //** BEGIN GET DATE OF CURRENT / LAST MONDAY */

    const today = new Date();

    //** BEGIN GET DATE OF CURRENT / LAST MONDAY */

    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = today.getDay();

    // Calculate the difference to Monday (if today is Sunday, treat it as 7)
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);

    // Create a new date object for Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    // Format dates as YYYY-MM-DD
    const formatDate = (date) =>
    date.toISOString().split('T')[0];

    console.log("Today: ", formatDate(today));
    console.log("Monday: ", formatDate(monday));

    let lastMonday = formatDate(monday);
    console.log("lastMonday ", lastMonday);

    const db = await cds.connect.to('db');
    // Start a manual database transaction
    const tx = db.tx(req);
   
    let aesDataTable = "PAL_AES_DATA_GRP_TAB";



// ---------- GET PROVISIONED GROUPS

    let inGroups = "(" + "'" + aesGroupParams[0].groupId + "'";
    // inGroups.push(modelGroup);
    for (var i in aesGroupParams)
    { 
        if (i > 0)
        {
            if( aesGroupParams[i].groupId != aesGroupParams[i-1].groupId)
            {
                inGroups = inGroups + "," + "'" + aesGroupParams[i].groupId + "'";
            }
        }
    }
    inGroups = inGroups + ")";
    // console.log("AES DATA inGroups ", inGroups);

    //** END GET DATE OF CURRENT / LAST MONDAY */
    sqlStr =  'SELECT DISTINCT GROUP_ID, MAX(TIMESTAMP) AS MAX_EXPOST_IDX FROM "PAL_AES_FORECAST_GRP_TAB" WHERE GROUP_ID IN ' + inGroups + 
            //   ' (SELECT GROUP_ID FROM ' + aesDataTable + ' WHERE GROUP_ID IN ' + "'" + inGroups + "'" + ')' +
              ' AND PI1_LOWER = ' + "'" + 0 + "'" +
              ' AND PI1_UPPER = ' + "'" + 0 + "'" +
              ' AND PI2_LOWER = ' + "'" + 0 + "'" +
              ' AND PI2_LOWER = ' + "'" + 0 + "'" +              
              ' GROUP BY GROUP_ID ' +
              ' ORDER BY GROUP_ID ';
    // sqlStr =  'SELECT DISTINCT GROUP_ID, MAX(TIMESTAMP) AS MAX_EXPOST_IDX FROM "PAL_AES_FORECAST_GRP_TAB" WHERE GROUP_ID IN ' +
    //           ' (SELECT GROUP_ID FROM ' + aesDataTable + ')' +
    //           ' AND PI1_LOWER = ' + "'" + 0 + "'" +
    //           ' AND PI1_UPPER = ' + "'" + 0 + "'" +
    //           ' AND PI2_LOWER = ' + "'" + 0 + "'" +
    //           ' AND PI2_LOWER = ' + "'" + 0 + "'" +              
    //           ' GROUP BY GROUP_ID ' +
    //           ' ORDER BY GROUP_ID ';
    // console.log("sqlStr expostMaxIdxResults ", sqlStr);

    let expostMaxIdxResults;
    try {
        expostMaxIdxResults = await tx.run(sqlStr);
        // await tx.commit();   // ✅ important
    }
    catch (exception) {
        // await tx.rollback(); // ✅ important
        console.log("sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }

    
    // let frozenSql = 'SELECT VALUE FROM CP_PARAMETER_VALUES WHERE ' +
    //                 ' LOCATION_ID = ' + "'" + location + "'" +
    //                 ' AND PARAMETER_ID = 1';
    // console.log("frozenSql ", frozenSql);

    // try {
    //     frozenSqlResults = await cds.run(frozenSql);
    // }
    // catch (exception) {
    //     console.log("frozenSql ", frozenSql);
    //     throw new Error(exception.toString());
    // }
    // let frozenPeriods = frozenSqlResults[0].VALUE;

    // console.log("frozenSqlResults ", frozenSqlResults, "frozenPeriods ", frozenPeriods);

    // let firmStartDate = await addDays(monday, 7*frozenPeriods);

    // console.log(" firmStartDate ", firmStartDate);

    // let firmDate = firmStartDate.toISOString().slice(0, 10);

    // console.log(" lastMonday ", lastMonday, "firmDate ", firmDate);

    // console.log("expostMaxIdxResults ", expostMaxIdxResults);
    let firmDate;
    for (let i=0; i< forecastResults.length; i++)
    {     
        let expost = true;
        let groupId = forecastResults[i].GROUP_ID;
        // let expostgroupIdtMaxIdxResults = await _findExpostGroupId(expostMaxIdxResults, groupId);
        let expostgroupIdtMaxIdx = 0;
        for (let exPostIdx = 0; exPostIdx < expostMaxIdxResults.length;  exPostIdx++)
        {
            // console.log("expostMaxIdxResults[", exPostIdx, "].GROUP_ID ", expostMaxIdxResults[exPostIdx].GROUP_ID, "groupId", groupId);
            if(expostMaxIdxResults[exPostIdx].GROUP_ID === groupId)
            {
                expostgroupIdtMaxIdx = expostMaxIdxResults[exPostIdx].MAX_EXPOST_IDX;
            }

        }
        // let expostgroupIdtMaxIdx = expostgroupIdtMaxIdxResults.MAX_EXPOST_IDX;

        let timestamp = forecastResults[i].TIMESTAMP;
        let value = forecastResults[i].VALUE;
        let pi1_lower = forecastResults[i].PI1_LOWER;
        let pi1_upper = forecastResults[i].PI1_UPPER;
        let pi2_lower = forecastResults[i].PI2_LOWER;
        let pi2_upper = forecastResults[i].PI2_UPPER;       
        if( (pi1_lower!=0 ) && (pi1_upper != 0) &&
            (pi2_lower != 0) && (pi2_upper != 0 ) )
        {
            expost = false;
        }
        
        forecastedResultsObj.push({groupId,timestamp,value,pi1_lower,pi1_upper,pi2_lower,pi2_upper});
        // console.log("forecastResults index = ", i, "expostgroupIdtMaxIdx ", expostgroupIdtMaxIdx,  "expost =", expost, "groupId ", groupId, "timestamp ", timestamp, "value ", value);


        // console.log("index = ", i, "groupId ", groupId);
        let grpStr=groupId.split('#');
        let profileID = grpStr[0]; 
        let type = grpStr[1];
        let objId = grpStr[2];
        let customer = grpStr[3];
        let location = grpStr[4];
        let product = grpStr[5];
        // console.log("index = ", i, "product ", product);
        // console.log("index ", i, "customer = ", customer, "product ", product, "location =", location);

        // get the Firm End Date only once i.e., when i = 0
        if (i == 0)
        {
            let firmEndSql = 'SELECT VALUE FROM CP_PARAMETER_VALUES WHERE ' +
                    ' LOCATION_ID = ' + "'" + location + "'" +
                    ' AND PARAMETER_ID = 9';
            console.log("firmEndSql ", firmEndSql);

            try {
                firmEndSqlResults = await cds.run(firmEndSql);
            }
            catch (exception) {
                console.log("firmEndSql ", firmEndSql);
                throw new Error(exception.toString());
            }
            let firmPeriods = firmEndSqlResults[0].VALUE;

            console.log("firmEndSqlResults ", firmEndSqlResults, "firmPeriods ", firmPeriods);

            let firmEndDate = await addDays(monday, 7*firmPeriods);

            console.log(" firmEndDate ", firmEndDate);

            firmDate = firmEndDate.toISOString().slice(0, 10);

            console.log(" lastMonday ", lastMonday, "firmDate ", firmDate);
        }

        let objStr = objId.split('_');
        let objDep = objStr[0];
        let objCounter = objStr[1];
        // console.log("_genStatForecast objDep",objDep);
        let tsType = 'OP';
        let sqlStr = 'SELECT COUNT(DISTINCT PERIOD_NUM) AS NUM_PERIODS , MAX(PERIOD_NUM) AS YEAR_WK FROM CP_VC_HISTORY_TS_CUST ' +
                ' WHERE LOCATION_ID = ' + "'" +   location + "'" +
                ' AND PRODUCT_ID = ' + "'" +   product + "'" +
                ' AND CUSTOMER_GROUP = ' + "'" +   customer + "'" +
                ' AND GROUP_ID = ' + "'" +   objId + "'" +
                ' AND TYPE = ' + "'" +   type + "'" ;
        // console.log("index = ", i,"sqlStr ", sqlStr);
        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        // PERSIST TO CP_TS_PREDICTIONS only for Future Time periods
        if(results.length > 0)
        {
            let numPeriods = results[0].NUM_PERIODS;
            // console.log("sqlStr ", sqlStr, "timestamp ", timestamp, "numPeriods ", numPeriods);
            // if(timestamp > numPeriods)
            if( expost == false)
            {

                let yearWeek = (results[0].YEAR_WK).toString();
                let year = yearWeek.slice(0,4);
                let week = yearWeek.slice(4,6);
                // console.log("yearWeek", yearWeek, "year  =", year, "week =", week);
                let historyEndDate = await aesFuncs._getDateOfIsoWeek(Number(week),Number(year));
                // Weeks between Last Monday and oldest Date of GROUP_ID in TS History
                let numOfWeeks = await weeksBetween(lastMonday, historyEndDate);
                // console.log(" historyEndDate", historyEndDate, "lastMonday ", lastMonday, "Offset in Weeks from History End Date ", numOfWeeks);

                let temp = await aesFuncs._getDateOfIsoWeek(Number(week),Number(year));
                
                // console.log("temp_getDateOfIsoWeek =", temp);
                // let date = new Date(temp.getFullYear(),temp.getMonth(),temp.getDate()+(timestamp-numPeriods)*7);
                const date = new Date(temp);
                // Extract components
                const tYear = date.getFullYear();         // 2025
                const tMonth = date.getMonth() + 1;       // 6 (Months are 0-based)
                const tDay = date.getDate();              // 17


                // console.log("temp Year =", tYear, "month ", tMonth, "temp Day ", tDay);
                // console.log(" OffSet ", numOfWeeks, " expostgroupIdtMaxIdx ", expostgroupIdtMaxIdx, "timestamp ",  timestamp);

                // MONTH is 0 based Index
                // Adding -1 to timestamp as Forecasted Index is starting from 2 instead of 1
                let effectiveTimestamp = timestamp - 1;

                // console.log("effectiveTimestamp ", effectiveTimestamp);
                // console.log("expostgroupIdtMaxIdx ", expostgroupIdtMaxIdx);
                // console.log("numOfWeeks ", numOfWeeks);

                let fDate = new Date(tYear,tMonth-1,tDay+(effectiveTimestamp-expostgroupIdtMaxIdx + numOfWeeks )*7);
                // console.log(" fDate ", fDate);

                let forecastDate = fDate.toISOString().slice(0, 10);
                // console.log(" forecastDate from fDate.toISOString", forecastDate);

                // console.log("groupId", groupId,  "forecastDate =", forecastDate, "location", location, "product", product, "customer ", customer);


                // END OF CONVERT - TIMESTAMP TO CAL_DATE

                let default_value = 0;
                if(value < 0)
                {
                    value = default_value;
                }
                let currentDate = new Date().toISOString().slice(0,10);
                // if (forecastDate > currentDate)
                if (forecastDate >= firmDate)
                {
                //    let rowObj = { CAL_DATE:forecastDate, LOCATION_ID:location, PRODUCT_ID:product,CUSTOMER_GROUP:customer,OBJ_TYPE:tsType,
                //         OBJ_DEP:objDep, OBJ_COUNTER:objCounter,MODEL_TYPE:'AES',
                //         MODEL_VERSION:aesModelVersion,MODEL_PROFILE:profileID,
                //         VERSION:version,SCENARIO:scenario,
                //         PREDICTED:value.toFixed(10),PREDICTED_TIME:predictedTime,PREDICTED_STATUS:'SUCCESS',
                //         PRE_OPTIMIZED:value.toFixed(10),PRE_OPTIMIZED_TIME:predictedTime};
                    // if( value > 0)
                    // {
                        let rowObj = { CAL_DATE:forecastDate, LOCATION_ID:location, PRODUCT_ID:product,CUSTOMER_GROUP:customer,OBJ_TYPE:tsType,
                            OBJ_DEP:objDep, OBJ_COUNTER:objCounter,MODEL_TYPE:'AES',
                            MODEL_VERSION:aesModelVersion,MODEL_PROFILE:profileID,
                            VERSION:version,SCENARIO:scenario,
                            PREDICTED:value,PREDICTED_TIME:predictedTime,PREDICTED_STATUS:'SUCCESS',
                            PRE_OPTIMIZED:value,PRE_OPTIMIZED_TIME:predictedTime};


                            // console.log("rowObj", rowObj)
                            tableObj.push(rowObj);
                    // }
                }
                if ( (prevLocation != location) ||
                     (prevProduct != product) ||
                     (prevCustomer != customer ) )
                {
                    let locProdCustRowObj =  { LOCATION_ID:location, PRODUCT_ID:product,CUSTOMER_GROUP:customer, MODEL_VERSION: aesModelVersion, VERSION:version,SCENARIO:scenario,FIRM_ENDDATE:firmDate};                 
                    locProdCustTableObj.push(locProdCustRowObj);
                    // console.log("index ", i, "customer = ", customer, "product ", product, "location =", location);
                    
                }
                prevLocation = location;
                prevProduct = product;
                prevCustomer = customer;
            }
           
        }

    }
    console.log(" locProdCustTableObj ", locProdCustTableObj)    
    // console.log(" tableObj ", tableObj)


    /// REMOVE Duplicates from locProdCustTableObj
    let jsonObject = locProdCustTableObj.map(JSON.stringify);
    let uniqueSet = new Set(jsonObject);
    let filteredArr = Array.from(uniqueSet).map(JSON.parse);

    // filteredArr = locProdCustTableObj;
    console.log(" filteredArr ", filteredArr);

    for(let delIdx = 0; delIdx < filteredArr.length; delIdx++)
    {
        
        dqlPredSqlStr = 'DELETE FROM CP_TS_PREDICTIONS_CUST ' +
                        ' WHERE MODEL_VERSION = '  + "'" + filteredArr[delIdx].MODEL_VERSION + "'" +
                        ' AND LOCATION_ID = ' + "'" + filteredArr[delIdx].LOCATION_ID + "'" +
                        ' AND PRODUCT_ID = ' + "'" + filteredArr[delIdx].PRODUCT_ID + "'" +
                        ' AND CUSTOMER_GROUP = ' + "'" + filteredArr[delIdx].CUSTOMER_GROUP + "'" +
                        ' AND VERSION = '  + "'" + filteredArr[delIdx].VERSION + "'" +
                        ' AND SCENARIO = '  + "'" + filteredArr[delIdx].SCENARIO + "'" +
                        ' AND CAL_DATE >= '  + "'" + filteredArr[delIdx].FIRM_ENDDATE + "'" ;
        console.log(" dqlPredSqlStr ", dqlPredSqlStr);
        try {
            await cds.run(dqlPredSqlStr);
        }
        catch (exception) {
            console.log("dqlPredSqlStr ", dqlPredSqlStr);
            throw new Error(exception.toString());
        }

    }

    if (tableObj.length > 0)
    {
            // console.log(" CP_TS_PREDICTIONS_CUST ", tableObj, "length ", tableObj.length);
        let cqnQuery = {UPSERT:{ into: { ref: ['CP_TS_PREDICTIONS_CUST'] }, entries:  tableObj }};

        try {
                await cds.run(cqnQuery);
            }
        catch (exception) {
            console.log("cqnQuery exception ", cqnQuery);
            throw new Error(exception.toString());
        }
    }

    ////////////////// BEGIN FOR ROUNDING /////////////////////////////////////
    for (let tabIdx = 0; tabIdx < filteredArr.length; tabIdx ++)

    {
        
        let delResults;
        let delStatFctStr = 'DELETE FROM CP_STATFORECAST_UNIQUE_QTYS ' +
                '  WHERE MODEL_VERSION = '  + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                 ' AND LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" +
                 ' AND PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" +
                 ' AND CUSTOMER_GROUP = ' + "'" + filteredArr[tabIdx].CUSTOMER_GROUP + "'"  +
                 ' AND VERSION = '  + "'" + filteredArr[tabIdx].VERSION + "'" +
                 ' AND SCENARIO = '  + "'" + filteredArr[tabIdx].SCENARIO + "'" +
                 ' AND CAL_DATE >= '  + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'";
        try {
            delResults = await cds.run(delStatFctStr);
        }
        catch (exception) {
            console.log("delStatFctStr ", delStatFctStr);
            throw new Error(exception.toString());
        }
        // console.log(" delStr DELETE CP_STATFORECAST_UNIQUE_QTYS delStatFctStr = ", delStatFctStr);

        // console.log ("filteredArr[", tabIdx, "].PRODUCT_ID ", filteredArr[tabIdx].PRODUCT_ID);
        

        sqlStr =  'SELECT UF.CAL_DATE, UF.LOCATION_ID, UF.PRODUCT_ID, UF.CUSTOMER_GROUP, UF.UNIQUE_ID, UF.MODEL_VERSION, UF.VERSION, ' +
                    ' UF.SCENARIO, UF.UNIQUE_PRECENT,UF.UNIQUE_QTY, IFD.QUANTITY ' +
                    'FROM V_PAL_UNIQUE_LOCPRODCUST_FORECAST AS UF ' +
                    'INNER JOIN CP_IBP_FUTUREDEMAND_LOCPRODCUST AS IFD ON ' +
                    'UF.CAL_DATE = IFD.WEEK_DATE ' +
                    'AND UF.LOCATION_ID = IFD.LOCATION_ID ' +
                    'AND UF.PRODUCT_ID = IFD.PRODUCT_ID ' +
                    'AND UF.CUSTOMER_GROUP = IFD.CUSTOMER_GROUP ' +
                    'AND UF.VERSION = IFD.VERSION ' +
                    'AND UF.SCENARIO = IFD.SCENARIO ' +
                    ' WHERE UF.LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" +
                    ' AND UF.PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" +
                    ' AND UF.CUSTOMER_GROUP = ' + "'" + filteredArr[tabIdx].CUSTOMER_GROUP + "'" +
                    ' AND UF.MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                    ' AND UF.VERSION = ' + "'" + filteredArr[tabIdx].VERSION + "'" +
                    ' AND UF.SCENARIO = ' + "'" + filteredArr[tabIdx].SCENARIO + "'" +
                    ' AND UF.CAL_DATE >= '  + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +
                    ' ORDER BY UF.UNIQUE_ID, UF.CAL_DATE, UF.LOCATION_ID, UF.PRODUCT_ID, UF.CUSTOMER_GROUP, UF.VERSION, UF.SCENARIO ';

        console.log("sqlStr V_PAL_UNIQUE_LOCPRODCUST_FORECAST", sqlStr )
        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        if(results.length > 0)
        {
            console.log(" V_PAL_UNIQUE_LOCPRODCUST_FORECAST JOIN  CP_IBP_FUTUREDEMAND_LOCPRODCUST results length", results.length)
            let statsFcstUniqueTableObj = [];
            // let uQtyRounded = results[0].UNIQUE_QTY;
            let uQtyRounded = results[0].QUANTITY*results[0].UNIQUE_PRECENT/100;

            let residualQty = 0;
            let uid_current = results[0].UNIQUE_ID;
            let uid_prev = results[0].UNIQUE_ID;
            for (let rIdx = 0; rIdx < results.length; rIdx ++)
            {
                uid_current = results[rIdx].UNIQUE_ID;
                if (uid_current != uid_prev)
                {
                    residualQty = 0;
                    uid_prev = uid_current;
                    // uQtyRounded = results[rIdx].UNIQUE_QTY;
                    uQtyRounded = results[rIdx].QUANTITY*results[rIdx].UNIQUE_PRECENT/100;

                }
                if(rIdx > 0 )
                {
                    // uQtyRounded = results[rIdx].UNIQUE_QTY + residualQty ;
                    uQtyRounded =  results[rIdx].QUANTITY*results[rIdx].UNIQUE_PRECENT/100 + residualQty;

                }    

                // let uQty = results[rIdx].UNIQUE_QTY  + residualQty;   
                let uQty = results[rIdx].QUANTITY*results[rIdx].UNIQUE_PRECENT/100+ residualQty;   

                uQtyRounded = uQtyRounded - (uQtyRounded % 1);
                residualQty = uQty - uQtyRounded;

            
                // console.log("rIdx ", rIdx, "UID ", results[rIdx].UNIQUE_ID, "unique qty ", results[rIdx].UNIQUE_QTY, "unique rounded ", uQtyRounded, "residualQty", residualQty);

                let fstatsFcstUniqueRowObj = { CAL_DATE:results[rIdx].CAL_DATE,LOCATION_ID:results[rIdx].LOCATION_ID, PRODUCT_ID:results[rIdx].PRODUCT_ID,
                    CUSTOMER_GROUP:results[rIdx].CUSTOMER_GROUP,UNIQUE_ID:results[rIdx].UNIQUE_ID,
                    MODEL_VERSION:results[rIdx].MODEL_VERSION,
                    VERSION:results[rIdx].VERSION, SCENARIO:results[rIdx].SCENARIO, 
                    UNIQUE_PRECENT:(results[rIdx].UNIQUE_PRECENT),
                    UNROUNDED:(results[rIdx].QUANTITY*results[rIdx].UNIQUE_PRECENT/100 ), 
                    ROUNDED:uQtyRounded, UNIQUE_QTY:uQtyRounded};                        
                    statsFcstUniqueTableObj.push(fstatsFcstUniqueRowObj);
            }

            if (statsFcstUniqueTableObj.length > 0)
            {
                // console.log("statsFcstUniqueTableObj ", statsFcstUniqueTableObj)
                cqnQuery = {UPSERT:{ into: { ref: ['CP_STATFORECAST_UNIQUE_QTYS'] }, entries:  statsFcstUniqueTableObj }};
                try {
                    await cds.run(cqnQuery);
                }
                catch (exception) {
                    console.log("cqnQuery ", cqnQuery);
                    throw new Error(exception.toString());
                }
                // BEGIN OF ADJUSTING UID QTYS to MATCH DEMAND //
                sqlStr = ' SELECT * FROM V_STATFCST_FDEMAND_DELTA ' +
                                ' WHERE LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" +
                                ' AND PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" +
                                ' AND CUSTOMER_GROUP = ' + "'" + filteredArr[tabIdx].CUSTOMER_GROUP + "'" +
                                ' AND MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                                ' AND VERSION = ' + "'" + filteredArr[tabIdx].VERSION + "'" +
                                ' AND SCENARIO = ' + "'" + filteredArr[tabIdx].SCENARIO + "'" +
                                ' AND CAL_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +
                                ' AND DEVIATION != ' + "'" + 0 + "'" +
                                ' ORDER BY CAL_DATE ';

                try {
                    results = await cds.run(sqlStr);
                }
                catch (exception) {
                    console.log("sqlStr ", sqlStr);
                    throw new Error(exception.toString());
                }
                for (let dateIdx = 0; dateIdx < results.length; dateIdx ++)
                {
                    let deviation = results[dateIdx].DEVIATION;
                    let sqlUidStr;
                    let devIntval = (Math.abs(results[dateIdx].DEVIATION)).toFixed(0);
                    if (deviation < 0) // Need to Inxrease Demand
                    {
                        sqlUidStr = 'SELECT TOP ' + devIntval + ' UNIQUE_ID, DEVIATION FROM V_STATFCST_UQTY_ROUNDED_DELTA ' +
                                ' WHERE CAL_DATE = ' + "'" + results[dateIdx].CAL_DATE + "'" +
                                ' AND LOCATION_ID = ' + "'" + results[dateIdx].LOCATION_ID + "'" +
                                ' AND PRODUCT_ID = ' + "'" + results[dateIdx].PRODUCT_ID + "'" +
                                ' AND CUSTOMER_GROUP = ' + "'" + results[dateIdx].CUSTOMER_GROUP + "'" +
                                ' AND MODEL_VERSION = ' + "'" + results[dateIdx].MODEL_VERSION + "'" +
                                ' AND VERSION = ' + "'" + results[dateIdx].VERSION + "'" +
                                ' AND SCENARIO = ' + "'" + results[dateIdx].SCENARIO + "'" +
                                ' AND CAL_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +
                                ' ORDER BY DEVIATION DESC ';
                    }
                    else // deviation > 0 Need to Decrease Demand
                    {
                        sqlUidStr = 'SELECT TOP ' + devIntval + ' UNIQUE_ID, DEVIATION FROM V_STATFCST_UQTY_ROUNDED_DELTA ' +
                                ' WHERE CAL_DATE = ' + "'" + results[dateIdx].CAL_DATE + "'" +
                                ' AND LOCATION_ID = ' + "'" + results[dateIdx].LOCATION_ID + "'" +
                                ' AND PRODUCT_ID = ' + "'" + results[dateIdx].PRODUCT_ID + "'" +
                                ' AND CUSTOMER_GROUP = ' + "'" + results[dateIdx].CUSTOMER_GROUP + "'" +
                                ' AND MODEL_VERSION = ' + "'" + results[dateIdx].MODEL_VERSION + "'" +
                                ' AND VERSION = ' + "'" + results[dateIdx].VERSION + "'" +
                                ' AND SCENARIO = ' + "'" + results[dateIdx].SCENARIO + "'" +
                                ' AND CAL_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +
                                ' ORDER BY DEVIATION ASC ';
                    }
                    // console.log("sqlUidStr ", sqlUidStr);
                    let uidresults;
                    try {
                        uidresults = await cds.run(sqlUidStr);
                    }
                    catch (exception) {
                        console.log("sqlUidStr ", sqlUidStr);
                        throw new Error(exception.toString());
                    }
                    // console.log(" uidresults", uidresults)
                    let sqlStatFcstResults = 'SELECT CAL_DATE, LOCATION_ID, PRODUCT_ID, CUSTOMER_GROUP, MODEL_VERSION, ' +
                            ' UNIQUE_ID, VERSION, SCENARIO, UNIQUE_PRECENT, UNROUNDED, ROUNDED, UNIQUE_QTY ' +
                            ' FROM CP_STATFORECAST_UNIQUE_QTYS ' +
                            ' WHERE CAL_DATE = ' + "'" + results[dateIdx].CAL_DATE + "'" +
                            ' AND LOCATION_ID = ' + "'" + results[dateIdx].LOCATION_ID + "'" +
                            ' AND PRODUCT_ID = ' + "'" + results[dateIdx].PRODUCT_ID + "'" +
                            ' AND CUSTOMER_GROUP = ' + "'" + results[dateIdx].CUSTOMER_GROUP + "'" +
                            ' AND MODEL_VERSION = ' + "'" + results[dateIdx].MODEL_VERSION + "'" +
                            ' AND VERSION = ' + "'" + results[dateIdx].VERSION + "'" +
                            ' AND SCENARIO = ' + "'" + results[dateIdx].SCENARIO + "'" +
                            ' AND CAL_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +
                            ' ORDER BY CAL_DATE';
                    let statFcstResults;
                    try {
                        statFcstResults = await cds.run(sqlStatFcstResults);
                    }
                    catch (exception) {
                        console.log("sqlStatFcstResults ", sqlStatFcstResults);
                        throw new Error(exception.toString());
                    }
                    // console.log("CP_STATFORECAST_UNIQUE_QTYS statFcstResults ", sqlStatFcstResults)

                    // console.log("CP_STATFORECAST_UNIQUE_QTYS statFcstResults ", statFcstResults)
                    statsFcstUniqueTableObj = [];

                    for (let statFcstIdx = 0; statFcstIdx < statFcstResults.length; statFcstIdx++)
                    {
                        let uidCountChange = false;
                        for (let uidIdx = 0; uidIdx < uidresults.length; uidIdx ++ )
                        {
                            if(uidresults[uidIdx].UNIQUE_ID === statFcstResults[statFcstIdx].UNIQUE_ID)
                            {
                                let adjsutedUidQty = 0;
                                if (deviation < 0)
                                {
                                    adjsutedUidQty = statFcstResults[statFcstIdx].UNIQUE_QTY + 1;
                                }
                                else
                                {
                                    adjsutedUidQty = statFcstResults[statFcstIdx].UNIQUE_QTY - 1;
                                }
                                let fstatsFcstUniqueRowObj = { CAL_DATE:statFcstResults[statFcstIdx].CAL_DATE,
                                    LOCATION_ID:statFcstResults[statFcstIdx].LOCATION_ID, PRODUCT_ID:statFcstResults[statFcstIdx].PRODUCT_ID,
                                    CUSTOMER_GROUP:statFcstResults[statFcstIdx].CUSTOMER_GROUP,UNIQUE_ID:statFcstResults[statFcstIdx].UNIQUE_ID,
                                    MODEL_VERSION:statFcstResults[statFcstIdx].MODEL_VERSION,
                                    VERSION:statFcstResults[statFcstIdx].VERSION, SCENARIO:statFcstResults[statFcstIdx].SCENARIO, 
                                    UNIQUE_PRECENT:statFcstResults[statFcstIdx].UNIQUE_PRECENT,
                                    UNROUNDED:statFcstResults[statFcstIdx].UNROUNDED, 
                                    ROUNDED:statFcstResults[statFcstIdx].ROUNDED, UNIQUE_QTY:adjsutedUidQty};
                                statsFcstUniqueTableObj.push(fstatsFcstUniqueRowObj);
                                // console.log("true fstatsFcstUniqueRowObj ", fstatsFcstUniqueRowObj, " uidIdx", uidIdx, "UNIQUE_ID", uidresults[uidIdx].UNIQUE_ID, "deviation ", deviation);


                                uidCountChange = true;
                                break;
                            }

                        }
                        if (uidCountChange == false) // NO CHANGE IN UID QUANTITY
                        {
                            let fstatsFcstUniqueRowObj = { CAL_DATE:statFcstResults[statFcstIdx].CAL_DATE,
                                LOCATION_ID:statFcstResults[statFcstIdx].LOCATION_ID, PRODUCT_ID:statFcstResults[statFcstIdx].PRODUCT_ID,
                                CUSTOMER_GROUP:statFcstResults[statFcstIdx].CUSTOMER_GROUP,UNIQUE_ID:statFcstResults[statFcstIdx].UNIQUE_ID,
                                MODEL_VERSION:statFcstResults[statFcstIdx].MODEL_VERSION,
                                VERSION:statFcstResults[statFcstIdx].VERSION, SCENARIO:statFcstResults[statFcstIdx].SCENARIO, 
                                UNIQUE_PRECENT:statFcstResults[statFcstIdx].UNIQUE_PRECENT,
                                UNROUNDED:statFcstResults[statFcstIdx].UNROUNDED, 
                                ROUNDED:statFcstResults[statFcstIdx].ROUNDED, UNIQUE_QTY:statFcstResults[statFcstIdx].UNIQUE_QTY};
                            // console.log("false fstatsFcstUniqueRowObj ", fstatsFcstUniqueRowObj);
                            statsFcstUniqueTableObj.push(fstatsFcstUniqueRowObj);

                        }
                    }

                    // BEGIN OF DELETE AND RE-INSERT ADJUSTED UID QUANTITIES
                    let delStatFcstSqlStr = 'DELETE FROM CP_STATFORECAST_UNIQUE_QTYS ' +
                                    ' WHERE CAL_DATE = ' + "'" + results[dateIdx].CAL_DATE + "'" +
                                    ' AND LOCATION_ID = ' + "'" + results[dateIdx].LOCATION_ID + "'" +
                                    ' AND PRODUCT_ID = ' + "'" + results[dateIdx].PRODUCT_ID + "'" +
                                    ' AND CUSTOMER_GROUP = ' + "'" + results[dateIdx].CUSTOMER_GROUP + "'" +
                                    ' AND MODEL_VERSION = ' + "'" + results[dateIdx].MODEL_VERSION + "'" +
                                    ' AND VERSION = ' + "'" + results[dateIdx].VERSION + "'" +
                                    ' AND SCENARIO = ' + "'" + results[dateIdx].SCENARIO + "'" +
                                    ' AND CAL_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'";

                    try {
                        await cds.run(delStatFcstSqlStr);
                    }
                    catch (exception) {
                        console.log("sqlStr ", delStatFcstSqlStr);
                        throw new Error(exception.toString());
                    }
                    // console.log("DELETE CP_STATFORECAST_UNIQUE_QTYS delStatFcstSqlStr", delStatFcstSqlStr);

                    cqnQuery = {UPSERT:{ into: { ref: ['CP_STATFORECAST_UNIQUE_QTYS'] }, entries:  statsFcstUniqueTableObj }};
                    // console.log("statsFcstUniqueTableObj Length", statsFcstUniqueTableObj.length);

                    if( statsFcstUniqueTableObj.length > 0)
                    {
                        try {
                            await cds.run(cqnQuery);
                        }
                        catch (exception) {
                            console.log("cqnQuery ", cqnQuery);
                            throw new Error(exception.toString());
                        }
                    }
                    // BEGIN OF DELETE AND RE-INSERT ADJUSTED UID QUANTITIES

                }
                // END OF ADJUSTING UID QTYS to MATCH DEMAND //

                ////////////////// END FOR ROUNDING  //////////////////////////////////////
            }
        }
        else
        {
            console.log("Check for IBP FUTURE Demand for LOCATION_ID = ", filteredArr[tabIdx].LOCATION_ID,"PRODUCT_ID = ",filteredArr[tabIdx].PRODUCT_ID,
                            "CUSTOMER_GROUP = ",filteredArr[tabIdx].CUSTOMER_GROUP,
                            "VERSION = ", filteredArr[tabIdx].VERSION,
                            "SCENARIO = ", filteredArr[tabIdx].SCENARIO );
        }
    } 
   
    
    for (let tabIdx = 0; tabIdx < filteredArr.length; tabIdx ++)

    {
        let delFcharSqlStr = 'DELETE FROM CP_PAL_FCHARPLAN ' +
                ' WHERE MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                ' AND  LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" +
                ' AND PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" +
                ' AND CUSTOMER_GROUP = ' + "'" + filteredArr[tabIdx].CUSTOMER_GROUP + "'" +
                ' AND VERSION = '  + "'" + filteredArr[tabIdx].VERSION + "'" +
                ' AND SCENARIO = '  + "'" + filteredArr[tabIdx].SCENARIO + "'" +
                ' AND WEEK_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +
                ' AND TYPE = 1';
        
                // console.log("delFcharSqlStr ", delFcharSqlStr);

        try {
            results = await cds.run(delFcharSqlStr);
        }
        catch (exception) {
            console.log("delFcharSqlStr ", delFcharSqlStr);
            throw new Error(exception.toString());
        }

        console.log (" delFcharSqlStr DELETE FROM CP_PAL_FCHARPLAN ", delFcharSqlStr);

        // let sqlStrClasses = 'SELECT DISTINCT CLASS_NUM  FROM V_PRODCLSCHARVAL WHERE PRODUCT_ID =  ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'";
        // let sqlStrClasses = 'SELECT DISTINCT CLASS_NUM  FROM V_PARTIALPRODCLASSCHAR WHERE PRODUCT_ID =  ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'";

        // console.log(" sqlStrClasses ", sqlStrClasses);

        // let sqlStrClassesResults;
        // try {
        //     sqlStrClassesResults = await cds.run(sqlStrClasses);
        // }
        // catch (exception) {
        //     console.log("sqlStr ", sqlStrClasses);
        //     throw new Error(exception.toString());
        // }

        // console.log(" sqlStrClassesResults ", sqlStrClassesResults);

        // for (let classIndex = 0; classIndex < sqlStrClassesResults.length; classIndex++)
        // {

        //     let statFcstResults;
            
        //     let sqlStrStatFcst = 'SELECT SF.LOCATION_ID, SF.PRODUCT_ID, SF.CUSTOMER_GROUP, SF.MODEL_VERSION, ' +
        //                         'NA' + 'AS  SF.CLASS_NUM, ' +
        //                         ' SF.CHAR_NUM, SF.CHARVAL_NUM, SF.VERSION, SF.SCENARIO, SF.WEEK_DATE, ' +
        //                         ' SF.OPT_PERCENT, (SF.OPT_PERCENT*IFD.QUANTITY)/100 AS OPT_QTY ' +
        //                         ' FROM V_PAL_LOCPRODCUST_STATFCST_CHAR_CHARVAL AS SF ' +
        //                         ' INNER JOIN CP_IBP_FUTUREDEMAND_LOCPRODCUST AS IFD ON ' +
        //                         ' SF.WEEK_DATE = IFD.WEEK_DATE ' +
        //                         ' AND SF.LOCATION_ID = IFD.LOCATION_ID ' +
        //                         ' AND SF.PRODUCT_ID = IFD.PRODUCT_ID ' +
        //                         ' AND SF.CUSTOMER_GROUP = IFD.CUSTOMER_GROUP ' +
        //                         ' AND SF.VERSION = IFD.VERSION ' +
        //                         ' AND SF.SCENARIO = IFD.SCENARIO ' +
        //                         //' AND SF.CLASS_NUM = ' + "'" + sqlStrClassesResults[classIndex].CLASS_NUM + "'" +
        //                         ' WHERE SF.LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" +
        //                         ' AND SF.PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" +
        //                         ' AND SF.CUSTOMER_GROUP = ' + "'" + filteredArr[tabIdx].CUSTOMER_GROUP + "'" +
        //                         ' AND SF.MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
        //                         ' AND SF.VERSION = ' + "'" + filteredArr[tabIdx].VERSION + "'" +
        //                         ' AND SF.SCENARIO = ' + "'" + filteredArr[tabIdx].SCENARIO + "'" +
        //                         ' ORDER BY WEEK_DATE, CHAR_NUM, CHARVAL_NUM';
        //     try {
        //         statFcstResults = await cds.run(sqlStrStatFcst);
        //     }
        //     catch (exception) {
        //         console.log("sqlStr ", sqlStrStatFcst);
        //         throw new Error(exception.toString());
        //     }
        //     console.log(" sqlStrStatFcst sql ", sqlStrStatFcst);
        //     // console.log("tabIndex ",tabIdx, " sqlStrStatFcst results ", statFcstResults);
        //     if (statFcstResults.length > 0)
        //     {
        //         let futurePlanTableObj = [];
        //         for (let rIdx = 0; rIdx < statFcstResults.length; rIdx ++)
        //         // for (let rIdx = 0; rIdx < 200; rIdx ++)
        //         {
        //             let statForecastType = 1;
        //             let futurePlanRowObj = { LOCATION_ID:statFcstResults[rIdx].LOCATION_ID, PRODUCT_ID:statFcstResults[rIdx].PRODUCT_ID,
        //                 CUSTOMER_GROUP:statFcstResults[rIdx].CUSTOMER_GROUP, MODEL_VERSION:statFcstResults[rIdx].MODEL_VERSION,
        //                 CLASS_NUM:statFcstResults[rIdx].CLASS_NUM, CHAR_NUM:statFcstResults[rIdx].CHAR_NUM, CHARVAL_NUM: statFcstResults[rIdx].CHARVAL_NUM,
        //                 VERSION:statFcstResults[rIdx].VERSION, SCENARIO:statFcstResults[rIdx].SCENARIO, WEEK_DATE:statFcstResults[rIdx].WEEK_DATE,
        //                 OPT_PERCENT:(statFcstResults[rIdx].OPT_PERCENT), OPT_QTY:(statFcstResults[rIdx].OPT_QTY), TYPE:statForecastType};

        //             futurePlanTableObj.push(futurePlanRowObj);
        //         }
        //         // console.log("futurePlanTableObj ", futurePlanTableObj)
        //         cqnQuery = {INSERT:{ into: { ref: ['CP_PAL_FCHARPLAN'] }, entries:  futurePlanTableObj }};
        //         try {
        //             await cds.run(cqnQuery);
        //         }
        //         catch (exception) {
        //             console.log("cqnQuery ", cqnQuery);
        //             throw new Error(exception.toString());
        //         }
        //     }
        // }


            let statFcstResults;
            let classNum = 'NA';
            let sqlStrStatFcst = 'SELECT SF.LOCATION_ID, SF.PRODUCT_ID, SF.CUSTOMER_GROUP, SF.MODEL_VERSION, ' +
                                "'" + classNum + "'" + 'AS  CLASS_NUM, ' +
                                ' SF.CHAR_NUM, SF.CHARVAL_NUM, SF.VERSION, SF.SCENARIO, SF.WEEK_DATE, ' +
                                ' SF.OPT_PERCENT, (SF.OPT_PERCENT*IFD.QUANTITY)/100 AS OPT_QTY ' +
                                ' FROM V_PAL_LOCPRODCUST_STATFCST_CHAR_CHARVAL AS SF ' +
                                ' INNER JOIN CP_IBP_FUTUREDEMAND_LOCPRODCUST AS IFD ON ' +
                                ' SF.WEEK_DATE = IFD.WEEK_DATE ' +
                                ' AND SF.LOCATION_ID = IFD.LOCATION_ID ' +
                                ' AND SF.PRODUCT_ID = IFD.PRODUCT_ID ' +
                                ' AND SF.CUSTOMER_GROUP = IFD.CUSTOMER_GROUP ' +
                                ' AND SF.VERSION = IFD.VERSION ' +
                                ' AND SF.SCENARIO = IFD.SCENARIO ' +
                                //' AND SF.CLASS_NUM = ' + "'" + sqlStrClassesResults[classIndex].CLASS_NUM + "'" +
                                ' WHERE SF.LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" +
                                ' AND SF.PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" +
                                ' AND SF.CUSTOMER_GROUP = ' + "'" + filteredArr[tabIdx].CUSTOMER_GROUP + "'" +
                                ' AND SF.MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                                ' AND SF.VERSION = ' + "'" + filteredArr[tabIdx].VERSION + "'" +
                                ' AND SF.SCENARIO = ' + "'" + filteredArr[tabIdx].SCENARIO + "'" +
                                ' AND SF.WEEK_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +
                                ' ORDER BY WEEK_DATE, CHAR_NUM, CHARVAL_NUM';
            try {
                statFcstResults = await cds.run(sqlStrStatFcst);
            }
            catch (exception) {
                console.log("sqlStr ", sqlStrStatFcst);
                throw new Error(exception.toString());
            }
            console.log(" sqlStrStatFcst sql ", sqlStrStatFcst);
           
            if (statFcstResults.length > 0)
            {
                let futurePlanTableObj = [];
                // for (let rIdx = frozenPeriods; rIdx < statFcstResults.length; rIdx ++)
                for (let rIdx = 0; rIdx < statFcstResults.length; rIdx ++)
                {
                    let statForecastType = 1;
                    let delta = (statFcstResults[rIdx].OPT_QTY) - (statFcstResults[rIdx].OPT_QTY).toFixed(0);
                    let futurePlanRowObj = { LOCATION_ID:statFcstResults[rIdx].LOCATION_ID, PRODUCT_ID:statFcstResults[rIdx].PRODUCT_ID,
                        CUSTOMER_GROUP:statFcstResults[rIdx].CUSTOMER_GROUP, MODEL_VERSION:statFcstResults[rIdx].MODEL_VERSION,
                        CLASS_NUM:statFcstResults[rIdx].CLASS_NUM, CHAR_NUM:statFcstResults[rIdx].CHAR_NUM, CHARVAL_NUM: statFcstResults[rIdx].CHARVAL_NUM,
                        VERSION:statFcstResults[rIdx].VERSION, SCENARIO:statFcstResults[rIdx].SCENARIO, WEEK_DATE:statFcstResults[rIdx].WEEK_DATE,
                        OPT_PERCENT:(statFcstResults[rIdx].OPT_PERCENT), OPT_QTY:(statFcstResults[rIdx].OPT_QTY).toFixed(0), TYPE:statForecastType,
                        UNROUNDED:(statFcstResults[rIdx].OPT_QTY), ROUNDED:(statFcstResults[rIdx].OPT_QTY).toFixed(0), DELTA: delta};

                    futurePlanTableObj.push(futurePlanRowObj);
                }
                // console.log("futurePlanTableObj ", futurePlanTableObj)
                cqnQuery = {UPSERT:{ into: { ref: ['CP_PAL_FCHARPLAN'] }, entries:  futurePlanTableObj }};
                try {
                    await cds.run(cqnQuery);
                }
                catch (exception) {
                    console.log("cqnQuery ", cqnQuery);
                    throw new Error(exception.toString());
                }
            }

            // Get the DELTA VALUE at CHaracteristic Level
            let sqlStrDelta = 'SELECT LOCATION_ID, PRODUCT_ID, CUSTOMER_GROUP, MODEL_VERSION, CLASS_NUM, ' +
                                ' CHAR_NUM, VERSION, SCENARIO, WEEK_DATE, ROUND(SUM(DELTA),0) AS DELTA '+
                                ' FROM CP_PAL_FCHARPLAN ' +
                                ' WHERE LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" +
                                ' AND PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" +
                                ' AND CUSTOMER_GROUP = ' + "'" + filteredArr[tabIdx].CUSTOMER_GROUP + "'" +
                                ' AND MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                                ' AND VERSION = ' + "'" + filteredArr[tabIdx].VERSION + "'" +
                                ' AND SCENARIO = ' + "'" + filteredArr[tabIdx].SCENARIO + "'" +
                                ' AND CAL_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +
                                ' GROUP BY LOCATION_ID, PRODUCT_ID, CUSTOMER_GROUP, MODEL_VERSION, CLASS_NUM, ' +
                                ' CHAR_NUM, VERSION, SCENARIO, WEEK_DATE ';

            console.log ("sqlStrDelta ", sqlStrDelta);

            let sqlStrDeltaResults = [];
            // try {
            //     sqlStrDeltaResults = await cds.run(sqlStrDelta);
            // }
            // catch (exception) {
            //     console.log("sqlStrDeltaResults ", sqlStrDeltaResults);
            //     throw new Error(exception.toString());
            // }


            let sqlStrCharValMax = ' SELECT LOCATION_ID, PRODUCT_ID, CUSTOMER_GROUP, MODEL_VERSION, CLASS_NUM, ' +
                                ' CHAR_NUM, CHARVAL_NUM, VERSION, SCENARIO, WEEK_DATE, OPT_QTY '+
                                ' OPT_PERCENT, ROUNDED, UNROUNDED, DELTA, TYPE ' +
                                ' FROM CP_PAL_FCHARPLAN ' + 
                                ' WHERE (LOCATION_ID, PRODUCT_ID, CUSTOMER_GROUP, MODEL_VERSION, CLASS_NUM,  ' +
                                ' CHAR_NUM, VERSION, SCENARIO, WEEK_DATE, OPT_QTY) IN ' +
                                ' ( SELECT LOCATION_ID, PRODUCT_ID, CUSTOMER_GROUP, MODEL_VERSION, CLASS_NUM, ' +
                                ' CHAR_NUM, VERSION, SCENARIO, WEEK_DATE, MAX(OPT_QTY) ' +
                                ' FROM CP_PAL_FCHARPLAN ' + 
                                ' WHERE LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" +
                                ' AND PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" +
                                ' AND CUSTOMER_GROUP = ' + "'" + filteredArr[tabIdx].CUSTOMER_GROUP + "'" +
                                ' AND MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                                ' AND VERSION = ' + "'" + filteredArr[tabIdx].VERSION + "'" +
                                ' AND SCENARIO = ' + "'" + filteredArr[tabIdx].SCENARIO + "'" +
                                ' AND WEEK_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +
                                ' AND OPT_QTY != 0 ' +
                                ' GROUP BY LOCATION_ID, PRODUCT_ID, CUSTOMER_GROUP, MODEL_VERSION, CLASS_NUM, ' +
                                ' CHAR_NUM, VERSION, SCENARIO, WEEK_DATE ) ' +
                                ' ORDER BY WEEK_DATE, LOCATION_ID, PRODUCT_ID, CUSTOMER_GROUP, MODEL_VERSION, ' +
                                ' CLASS_NUM,  CHAR_NUM, CHARVAL_NUM, VERSION, SCENARIO ';
            // console.log ("sqlStrCharValMax ", sqlStrCharValMax);
            
            let sqlStrCharValMaxResults = [];
            try {
                sqlStrCharValMaxResults = await cds.run(sqlStrCharValMax);
            }
            catch (exception) {
                console.log("sqlStrCharValMaxResults ", sqlStrCharValMaxResults);
                throw new Error(exception.toString());
            }

            // console.log ("sqlStrCharValMaxResults ", sqlStrCharValMaxResults);

            sqlStrDelta = 'SELECT * FROM V_STATFCST_CHARVAL_DELTA ' +
                            ' WHERE LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" +
                            ' AND PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" +
                            ' AND CUSTOMER_GROUP = ' + "'" + filteredArr[tabIdx].CUSTOMER_GROUP + "'" +
                            ' AND MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                            ' AND VERSION = ' + "'" + filteredArr[tabIdx].VERSION + "'" +
                            ' AND SCENARIO = ' + "'" + filteredArr[tabIdx].SCENARIO + "'" +
                            ' AND WEEK_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +
                            ' AND DELTA != 0';
            try {
                sqlStrDeltaResults = await cds.run(sqlStrDelta);
            }
            catch (exception) {
                console.log("sqlStrDeltaResults ", sqlStrDeltaResults);
                throw new Error(exception.toString());
            }
            // console.log(" sqlStrDeltaResults", sqlStrDeltaResults);

            let fpRoundedTableObj = [];

            for (let charvalMaxIdx = 0; charvalMaxIdx < sqlStrCharValMaxResults.length; charvalMaxIdx++)
            {
                for(let deltaIdx = 0; deltaIdx < sqlStrDeltaResults.length; deltaIdx++)
                {
                    if( (sqlStrDeltaResults[deltaIdx].CHAR_NUM === sqlStrCharValMaxResults[charvalMaxIdx].CHAR_NUM ) &&
                        (sqlStrDeltaResults[deltaIdx].WEEK_DATE === sqlStrCharValMaxResults[charvalMaxIdx].WEEK_DATE ) )
                    {
                        let adjustedOptQty = sqlStrCharValMaxResults[charvalMaxIdx].ROUNDED +
                                                sqlStrDeltaResults[deltaIdx].DELTA;

                        let fpRoundedRowObj = { LOCATION_ID:sqlStrCharValMaxResults[charvalMaxIdx].LOCATION_ID, 
                                                PRODUCT_ID:sqlStrCharValMaxResults[charvalMaxIdx].PRODUCT_ID,
                                                CUSTOMER_GROUP:sqlStrCharValMaxResults[charvalMaxIdx].CUSTOMER_GROUP, 
                                                MODEL_VERSION:sqlStrCharValMaxResults[charvalMaxIdx].MODEL_VERSION,
                                                CLASS_NUM:sqlStrCharValMaxResults[charvalMaxIdx].CLASS_NUM, 
                                                CHAR_NUM:sqlStrCharValMaxResults[charvalMaxIdx].CHAR_NUM, 
                                                CHARVAL_NUM: sqlStrCharValMaxResults[charvalMaxIdx].CHARVAL_NUM,
                                                VERSION:sqlStrCharValMaxResults[charvalMaxIdx].VERSION,
                                                SCENARIO:sqlStrCharValMaxResults[charvalMaxIdx].SCENARIO, 
                                                WEEK_DATE:sqlStrCharValMaxResults[charvalMaxIdx].WEEK_DATE,
                                                OPT_PERCENT:sqlStrCharValMaxResults[charvalMaxIdx].OPT_PERCENT, 
                                                OPT_QTY:adjustedOptQty, 
                                                ROUNDED: sqlStrCharValMaxResults[charvalMaxIdx].ROUNDED,
                                                UNROUNDED: sqlStrCharValMaxResults[charvalMaxIdx].UNROUNDED,
                                                DELTA: sqlStrCharValMaxResults[charvalMaxIdx].DELTA,
                                                TYPE:sqlStrCharValMaxResults[charvalMaxIdx].TYPE};
    
                        fpRoundedTableObj.push(fpRoundedRowObj);
                    }

                }
            }

            if(fpRoundedTableObj.length > 0)
            {
                cqnQuery = {UPSERT:{ into: { ref: ['CP_PAL_FCHARPLAN'] }, entries:  fpRoundedTableObj }};
                try {
                    await cds.run(cqnQuery);
                }
                catch (exception) {
                    console.log("cqnQuery ", cqnQuery);
                    throw new Error(exception.toString());
                }
            }
             let sqlFinalFcharPlan = ' SELECT * FROM V_FINAL_FCHARPLAN ' +
                                    ' WHERE LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" +
                                    ' AND PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" +
                                    ' AND CUSTOMER_GROUP = ' + "'" + filteredArr[tabIdx].CUSTOMER_GROUP + "'" +
                                    ' AND MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                                    ' AND VERSION = ' + "'" + filteredArr[tabIdx].VERSION + "'" +
                                    ' AND SCENARIO = ' + "'" + filteredArr[tabIdx].SCENARIO + "'" +
                                    ' AND WEEK_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +   
                                    ' ORDER BY WEEK_DATE, CHAR_NUM, CHARVAL_NUM ';
            let finalResults = [];
            try {
                finalResults = await cds.run(sqlFinalFcharPlan);
            }
            catch (exception) {
                console.log("sqlFinalFcharPlan ", sqlFinalFcharPlan);
                throw new Error(exception.toString());
            }
            // let optPercent = parseFloat(finalResults[0].OPT_PERCENT);

            console.log(" sqlFinalFcharPlan ", sqlFinalFcharPlan);
            // console.log(" finalResults length ", finalResults.length);
            // console.log(" finalResults[0] ", finalResults[0]);
            // console.log(" OPT_PERCENT Rounded ",optPercent.toFixed(2));

            let finalCharplanTable = [];

            for (let fIndex = 0; fIndex <finalResults.length; fIndex++ )
            {
                let optPercent = parseFloat(finalResults[fIndex].OPT_PERCENT);
                let optQty = parseFloat(finalResults[fIndex].OPT_QTY);

                let finalRowObj = { LOCATION_ID:finalResults[fIndex].LOCATION_ID, 
                                    PRODUCT_ID:finalResults[fIndex].PRODUCT_ID,
                                    CUSTOMER_GROUP:finalResults[fIndex].CUSTOMER_GROUP, 
                                    MODEL_VERSION:finalResults[fIndex].MODEL_VERSION,
                                    CLASS_NUM:finalResults[fIndex].CLASS_NUM, 
                                    CHAR_NUM:finalResults[fIndex].CHAR_NUM, 
                                    CHARVAL_NUM: finalResults[fIndex].CHARVAL_NUM,
                                    VERSION:finalResults[fIndex].VERSION,
                                    SCENARIO:finalResults[fIndex].SCENARIO, 
                                    WEEK_DATE:finalResults[fIndex].WEEK_DATE,
                                    OPT_PERCENT:optPercent.toFixed(2), 
                                    OPT_QTY:optQty.toFixed(0), 
                                    ROUNDED: finalResults[fIndex].ROUNDED,
                                    UNROUNDED: finalResults[fIndex].UNROUNDED,
                                    DELTA: finalResults[fIndex].DELTA,
                                    TYPE:finalResults[fIndex].TYPE };
                // console.log(" fIndex", fIndex, "finalRowObj", finalRowObj);

                finalCharplanTable.push(finalRowObj);
                
                if(fIndex % 5000 === 0)
                {
                    cqnQuery = {UPSERT:{ into: { ref: ['CP_PAL_FCHARPLAN'] }, entries:  finalCharplanTable }};
                    try {
                        await cds.run(cqnQuery);
                    }
                    catch (exception) {
                        console.log("cqnQuery ", cqnQuery);
                        throw new Error(exception.toString());
                    }
                    finalCharplanTable = [];
                }
            }

            if(finalCharplanTable.length > 0)
            {
                cqnQuery = {UPSERT:{ into: { ref: ['CP_PAL_FCHARPLAN'] }, entries:  finalCharplanTable }};
                try {
                    await cds.run(cqnQuery);
                }
                catch (exception) {
                    console.log("cqnQuery ", cqnQuery);
                    throw new Error(exception.toString());
                }
            }

            // GET -- SUM(DELTA) AT CHAR LEVEL //

            // IF DELTA IS -1, ADD +1 to MAX OPT_QTY OF CHARVAL
            // IF DELTA IS +1 SUBTRACT -1 to MAX OPT_QTY OF CHARVAL
            //  FROM NEW OPTION QUANTITIES - DETERMINE UPDATED OPTION PERCENTAGES

            // ADDITIONAL ADJUSTMENT WHEN CHARVAL QUANTITIES ARE ROUNDED TO WHOLE NUMBERS TO MATCH IBP DEMAND

            let deltaQtySql = 'SELECT DISTINCT IFC.WEEK_DATE, IFC.LOCATION_ID, IFC.PRODUCT_ID, IFC.CUSTOMER_GROUP, '+
                        ' IFC.VERSION, IFC.SCENARIO, MODEL_VERSION, CHAR_NUM, SUM(OPT_QTY), QUANTITY, ' +
                        ' (SUM(OPT_QTY) - QUANTITY) AS DELTA FROM CP_PAL_FCHARPLAN AS IFC ' +
                        ' INNER JOIN CP_IBP_FUTUREDEMAND_LOCPRODCUST AS IFD ON ' +
                        ' IFC.LOCATION_ID = IFD.LOCATION_ID ' +
                        ' AND IFC.PRODUCT_ID = IFD.PRODUCT_ID ' +
                        ' AND IFC.CUSTOMER_GROUP = IFD.CUSTOMER_GROUP ' +
                        ' AND IFC.VERSION = IFD.VERSION ' +
                        ' AND IFC.SCENARIO =  IFD.SCENARIO ' +
                        ' AND IFC.WEEK_DATE = IFD.WEEK_DATE ' +
                        ' WHERE IFC.LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" +
                        ' AND IFC.PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" +
                        ' AND IFC.CUSTOMER_GROUP = ' + "'" + filteredArr[tabIdx].CUSTOMER_GROUP + "'" +
                        ' AND IFC.MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                        ' AND IFC.VERSION = ' + "'" + filteredArr[tabIdx].VERSION + "'" +
                        ' AND IFC.SCENARIO = ' + "'" + filteredArr[tabIdx].SCENARIO + "'" +
                        ' AND IFC.WEEK_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +   
                        ' GROUP BY IFC.WEEK_DATE, IFC.LOCATION_ID, IFC.PRODUCT_ID,IFC.CUSTOMER_GROUP, IFC.VERSION, ' +
                        ' IFC.SCENARIO, MODEL_VERSION, CHAR_NUM, QUANTITY ' +
                        ' HAVING SUM(OPT_QTY) != QUANTITY ';
            let deltaCharvalResults = [];
            try 
            {
                deltaCharvalResults = await cds.run(deltaQtySql);
            }
            catch (exception) {
                console.log("deltaQtySql ", deltaQtySql);
                throw new Error(exception.toString());
            }
            if( deltaCharvalResults.length > 0)
            {
                let updatedCharvalQtysTable = [];
                for (let deltaIdx = 0; deltaIdx <deltaCharvalResults.length; deltaIdx++)
                {
                    let maxCharvalSql = ' SELECT MAX(OPT_QTY) AS MAX_QTY FROM CP_PAL_FCHARPLAN AS IFC ' +
                        ' WHERE IFC.LOCATION_ID = ' + "'" + deltaCharvalResults[deltaIdx].LOCATION_ID + "'" +
                        ' AND IFC.PRODUCT_ID = ' + "'" + deltaCharvalResults[deltaIdx].PRODUCT_ID + "'" +
                        ' AND IFC.CUSTOMER_GROUP = ' + "'" + deltaCharvalResults[deltaIdx].CUSTOMER_GROUP + "'" +
                        ' AND IFC.MODEL_VERSION = ' + "'" + deltaCharvalResults[deltaIdx].MODEL_VERSION + "'" +
                        ' AND IFC.VERSION = ' + "'" + deltaCharvalResults[deltaIdx].VERSION + "'" +
                        ' AND IFC.SCENARIO = ' + "'" + deltaCharvalResults[deltaIdx].SCENARIO + "'" +
                        ' AND IFC.CHAR_NUM = ' + "'" + deltaCharvalResults[deltaIdx].CHAR_NUM + "'" +
                        ' AND IFC.WEEK_DATE = ' + "'" + deltaCharvalResults[deltaIdx].WEEK_DATE + "'" ;

                        let maxCharvalSqlResults = [];
                        try 
                        {
                            maxCharvalSqlResults = await cds.run(maxCharvalSql);
                        }
                        catch (exception) {
                            console.log("maxCharvalSql ", maxCharvalSql);
                            throw new Error(exception.toString());
                        }

                        let adjCharvalSql = ' SELECT TOP 1 * FROM CP_PAL_FCHARPLAN AS IFC '+
                                            ' WHERE IFC.LOCATION_ID = ' + "'" + deltaCharvalResults[deltaIdx].LOCATION_ID + "'" +
                                            ' AND IFC.PRODUCT_ID = ' + "'" + deltaCharvalResults[deltaIdx].PRODUCT_ID + "'" +
                                            ' AND IFC.CUSTOMER_GROUP = ' + "'" + deltaCharvalResults[deltaIdx].CUSTOMER_GROUP + "'" +
                                            ' AND IFC.MODEL_VERSION = ' + "'" + deltaCharvalResults[deltaIdx].MODEL_VERSION + "'" +
                                            ' AND IFC.VERSION = ' + "'" + deltaCharvalResults[deltaIdx].VERSION + "'" +
                                            ' AND IFC.SCENARIO = ' + "'" + deltaCharvalResults[deltaIdx].SCENARIO + "'" +
                                            ' AND IFC.CHAR_NUM = ' + "'" + deltaCharvalResults[deltaIdx].CHAR_NUM + "'" +
                                            ' AND IFC.WEEK_DATE = ' + "'" + deltaCharvalResults[deltaIdx].WEEK_DATE + "'" +
                                            ' AND OPT_QTY = ' + "'" + maxCharvalSqlResults[0].MAX_QTY + "'";
                       
                        let adjCharvalSqlResults = [];
                        try 
                        {
                            adjCharvalSqlResults = await cds.run(adjCharvalSql);
                        }
                        catch (exception) {
                            console.log("adjCharvalSql ", adjCharvalSql);
                            throw new Error(exception.toString());
                        }
                        if (adjCharvalSqlResults.length > 0 )
                        {

                            let updateCharvalObj = { LOCATION_ID:adjCharvalSqlResults[0].LOCATION_ID, 
                                        PRODUCT_ID:adjCharvalSqlResults[0].PRODUCT_ID,
                                        CUSTOMER_GROUP:adjCharvalSqlResults[0].CUSTOMER_GROUP, 
                                        MODEL_VERSION:adjCharvalSqlResults[0].MODEL_VERSION,
                                        CLASS_NUM:adjCharvalSqlResults[0].CLASS_NUM, 
                                        CHAR_NUM:adjCharvalSqlResults[0].CHAR_NUM, 
                                        CHARVAL_NUM: adjCharvalSqlResults[0].CHARVAL_NUM,
                                        VERSION:adjCharvalSqlResults[0].VERSION,
                                        SCENARIO:adjCharvalSqlResults[0].SCENARIO, 
                                        WEEK_DATE:adjCharvalSqlResults[0].WEEK_DATE,
                                        OPT_PERCENT:adjCharvalSqlResults[0].optPercent, 
                                        OPT_QTY: (adjCharvalSqlResults[0].OPT_QTY - deltaCharvalResults[deltaIdx].DELTA),
                                        ROUNDED: adjCharvalSqlResults[0].ROUNDED,
                                        UNROUNDED: adjCharvalSqlResults[0].UNROUNDED,
                                        DELTA: adjCharvalSqlResults[0].DELTA,
                                        TYPE:adjCharvalSqlResults[0].TYPE };
                            // console.log(" updateCharvalObj", updateCharvalObj);

                            updatedCharvalQtysTable.push(updateCharvalObj); 
                    }  

                }
                if(updatedCharvalQtysTable.length > 0)
                {
                    cqnQuery = {UPSERT:{ into: { ref: ['CP_PAL_FCHARPLAN'] }, entries:  updatedCharvalQtysTable }};
                    try {
                        await cds.run(cqnQuery);
                    }
                    catch (exception) {
                        console.log("cqnQuery ", cqnQuery);
                        throw new Error(exception.toString());
                    }
                }
                
                
            }

            // FINALLY UPDATE OPTION PERCENTAGES DUE TO CHANGE IN ADJUSTED OPTION QTYS
            for (let deltaIdx = 0; deltaIdx <deltaCharvalResults.length; deltaIdx++)
            {
                let finalOptionResults = [];
                let updateOptionPercentagesSql = ' SELECT * FROM CP_PAL_FCHARPLAN AS IFC ' +
                        ' WHERE IFC.LOCATION_ID = ' + "'" + deltaCharvalResults[deltaIdx].LOCATION_ID + "'" +
                        ' AND IFC.PRODUCT_ID = ' + "'" + deltaCharvalResults[deltaIdx].PRODUCT_ID + "'" +
                        ' AND IFC.CUSTOMER_GROUP = ' + "'" + deltaCharvalResults[deltaIdx].CUSTOMER_GROUP + "'" +
                        ' AND IFC.MODEL_VERSION = ' + "'" + deltaCharvalResults[deltaIdx].MODEL_VERSION + "'" +
                        ' AND IFC.VERSION = ' + "'" + deltaCharvalResults[deltaIdx].VERSION + "'" +
                        ' AND IFC.SCENARIO = ' + "'" + deltaCharvalResults[deltaIdx].SCENARIO + "'" +
                        ' AND IFC.CHAR_NUM = ' + "'" + deltaCharvalResults[deltaIdx].CHAR_NUM + "'" +
                        ' AND IFC.WEEK_DATE = ' + "'" + deltaCharvalResults[deltaIdx].WEEK_DATE + "'" ;
                try 
                {
                    finalOptionResults = await cds.run(updateOptionPercentagesSql);
                }
                catch (exception) {
                    console.log("updateOptionPercentagesSql ", updateOptionPercentagesSql);
                    throw new Error(exception.toString());
                }
                if (finalOptionResults.length > 0)
                {
                    let futurePlanTableObj = [];
                    for (let rIdx = 0; rIdx < finalOptionResults.length; rIdx ++)
                    {
                        let optPercent = 100*(finalOptionResults[rIdx].OPT_QTY)/deltaCharvalResults[deltaIdx].QUANTITY;
                        optPercent = optPercent.toFixed(2);

                        let updateCharvalObj = { LOCATION_ID:finalOptionResults[rIdx].LOCATION_ID, 
                                    PRODUCT_ID:finalOptionResults[rIdx].PRODUCT_ID,
                                    CUSTOMER_GROUP:finalOptionResults[rIdx].CUSTOMER_GROUP, 
                                    MODEL_VERSION:finalOptionResults[rIdx].MODEL_VERSION,
                                    CLASS_NUM:finalOptionResults[rIdx].CLASS_NUM, 
                                    CHAR_NUM:finalOptionResults[rIdx].CHAR_NUM, 
                                    CHARVAL_NUM: finalOptionResults[rIdx].CHARVAL_NUM,
                                    VERSION:finalOptionResults[rIdx].VERSION,
                                    SCENARIO:finalOptionResults[rIdx].SCENARIO, 
                                    WEEK_DATE:finalOptionResults[rIdx].WEEK_DATE,
                                    OPT_PERCENT: optPercent, 
                                    OPT_QTY: finalOptionResults[rIdx].OPT_QTY,
                                    ROUNDED: finalOptionResults[rIdx].ROUNDED,
                                    UNROUNDED: finalOptionResults[rIdx].UNROUNDED,
                                    DELTA: finalOptionResults[rIdx].DELTA,
                                    TYPE:finalOptionResults[rIdx].TYPE };
                        // console.log(" updateCharvalObj", updateCharvalObj);

                            futurePlanTableObj.push(updateCharvalObj); 
                    }
                    // console.log("futurePlanTableObj ", futurePlanTableObj)
                    cqnQuery = {UPSERT:{ into: { ref: ['CP_PAL_FCHARPLAN'] }, entries:  futurePlanTableObj }};
                    try {
                        await cds.run(cqnQuery);
                    }
                    catch (exception) {
                        console.log("cqnQuery ", cqnQuery);
                        throw new Error(exception.toString());
                    }
                }
            }

    }

    
  

    for (let tabIdx = 0; tabIdx < filteredArr.length; tabIdx ++)
    {

        let predictionPeriodsSql =  ' SELECT DISTINCT CAL_DATE ' +
                                        ' FROM V_STATFORECAST_PID_UID_QTYS WHERE ' + 
                                        ' PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" + 
                                        ' AND LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" + 
                                        ' AND MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                                        ' AND VERSION = ' + "'" + filteredArr[tabIdx].VERSION + "'" + 
                                        ' AND SCENARIO = ' + "'" + filteredArr[tabIdx].SCENARIO + "'" + 
                                        ' AND CAL_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +   
                                        ' ORDER BY CAL_DATE ';

        console.log(" \n predictionPeriodsSql ", predictionPeriodsSql);
        let calDateResults = '';

        try {
            calDateResults = await cds.run(predictionPeriodsSql);
        }
        catch (exception) {
            console.log("locprodPredictionsSql ", predictionPeriodsSql);
            throw new Error(exception.toString());
        }

        if(calDateResults.length > 0)
        {   
            let locprodPredictionsSql =  ' UPSERT CP_TS_PREDICTIONS ' +
                                    ' SELECT CAL_DATE, LOCATION_ID, PRODUCT_ID, ' + '\'PI\'' + ' AS OBJ_TYPE ' + "," +
                                    ' PRIMARY_ID, 1, ' + '\'AES\'' + ' AS MODEL_TYPE ' + "," + 
                                    ' MODEL_VERSION, ' + '\'NA\'' + ' AS MODEL_PROFILE ' + "," +
                                    ' VERSION, SCENARIO, SUM(UNIQUE_QTY), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ' + '\'SUCCESS\'' + ' AS PREDICTED_STATUS ' + "," +
                                    ' SUM(UNIQUE_QTY), CURRENT_TIMESTAMP, ' + '\'NONE\''  + ' AS OPT_ALGORITHM ' +
                                    ' FROM V_STATFORECAST_PID_UID_QTYS WHERE ' + 
                                    ' PRODUCT_ID = ' + "'" + filteredArr[tabIdx].PRODUCT_ID + "'" + 
                                    ' AND LOCATION_ID = ' + "'" + filteredArr[tabIdx].LOCATION_ID + "'" + 
                                    ' AND MODEL_VERSION = ' + "'" + filteredArr[tabIdx].MODEL_VERSION + "'" +
                                    ' AND VERSION = ' + "'" + filteredArr[tabIdx].VERSION + "'" + 
                                    ' AND SCENARIO = ' + "'" + filteredArr[tabIdx].SCENARIO + "'" + 
                                    ' AND CAL_DATE >= ' + "'" + filteredArr[tabIdx].FIRM_ENDDATE + "'" +
                                    ' GROUP BY CAL_DATE, LOCATION_ID, PRODUCT_ID, PRIMARY_ID, MODEL_VERSION, VERSION, SCENARIO ';
            console.log(" \n locprodPredictionsSql ", locprodPredictionsSql);

            try {
                await cds.run(locprodPredictionsSql);
            }
            catch (exception) {
                console.log("locprodPredictionsSql ", locprodPredictionsSql);
                throw new Error(exception.toString());
            }

        }
        else
        {
            console.log("ERROR FIRM START DATE NOT AVAILABLE FOR Location  ", filteredArr[tabIdx].LOCATION_ID, "Product ", filteredArr[tabIdx].PRODUCT_ID);
        }

    }



    

    var createtAtObj = new Date();
    let idObj = uuidv1();
    
    let returnObj = [];	
    let createdAt = createtAtObj;
 
    let aesID = idObj; //uuidObj;
 

    let forecastedResults = forecastedResultsObj;
    let stats = statisticsObj;
    let timeseriesData = req.data.timeseriesData;


    returnObj.push({aesID, createdAt,aesGroupParams,timeseriesData,stats,forecastedResults});

    var res = req._.req.res;
    console.log('headersSent Before Send:', res.headersSent); // false

    res.send({"value":returnObj});
    console.log('headersSent After Send:', res.headersSent); // false

    console.log('Completed aes Options Generation for Groups Successfully');

  
}

async function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// function getDateOfIsoWeek(week, year) {
// async function _getDateOfIsoWeek(week, year) {
exports._getDateOfIsoWeek = async function(week,year) {


    week = parseFloat(week);
    year = parseFloat(year);
    
    if (week < 1 || week > 53) {
        throw new RangeError("ISO 8601 weeks are numbered from 1 to 53");
    } else if (!Number.isInteger(week)) {
        throw new TypeError("Week must be an integer");
    } else if (!Number.isInteger(year)) {
        throw new TypeError("Year must be an integer");
    }
    
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const isoWeekStart = simple;

    // Get the Monday past, and add a week if the day was
    // Friday, Saturday or Sunday.
    
    isoWeekStart.setDate(simple.getDate() - dayOfWeek + 1);
    if (dayOfWeek > 4) {
        isoWeekStart.setDate(isoWeekStart.getDate() + 7);
    }

    // The latest possible ISO week starts on December 28 of the current year.
    // if (isoWeekStart.getFullYear() > year ||
    //     (isoWeekStart.getFullYear() == year &&
    //      isoWeekStart.getMonth() == 11 &&
    //      isoWeekStart.getDate() > 28)) {

    //     throw new RangeError(`${year} has no ISO week ${week}`);
    // }
    
    return isoWeekStart;
}

// // function getDateOfIsoWeek(week, year) {
// // exports._getDateOfIsoWeek = async function(week, year) {
// exports._getDateOfIsoWeek = async function(isoWeekNumber,year) {


//     const { startOfISOWeek, setISOWeek, setYear, format } = require('date-fns');

//     // Create a date in the correct year
//     let date = new Date();
//     date = setYear(date, year);
//     date = setISOWeek(date, isoWeekNumber);
//     const monday = startOfISOWeek(date);
  
//     return(format(monday, 'yyyy-MM-dd'));
//     // return {
//     //   isoMonday: monday,
//     //   formatted: format(monday, 'yyyy-MM-dd')
//     // };
//     // week = parseFloat(week);
//     // year = parseFloat(year);
  
//     // if (week < 1 || week > 53) {
//     //   throw new RangeError("ISO 8601 weeks are numbered from 1 to 53");
//     // } else if (!Number.isInteger(week)) {
//     //   throw new TypeError("Week must be an integer");
//     // } else if (!Number.isInteger(year)) {
//     //   throw new TypeError("Year must be an integer");
//     // }
  
//     // const simple = new Date(year, 0, 1 + (week - 1) * 7);
//     // const dayOfWeek = simple.getDay();
//     // const isoWeekStart = simple;

//     // // Get the Monday past, and add a week if the day was
//     // // Friday, Saturday or Sunday.
  
//     // isoWeekStart.setDate(simple.getDate() - dayOfWeek + 1);
//     // if (dayOfWeek > 4) {
//     //     isoWeekStart.setDate(isoWeekStart.getDate() + 7);
//     // }

//     // // The latest possible ISO week starts on December 28 of the current year.
//     // // if (isoWeekStart.getFullYear() > year ||
//     // //     (isoWeekStart.getFullYear() == year &&
//     // //      isoWeekStart.getMonth() == 11 &&
//     // //      isoWeekStart.getDate() > 28)) {

//     // //     throw new RangeError(`${year} has no ISO week ${week}`);
//     // // }
  
//     // return isoWeekStart;
// }



async function weeksBetween(date1, date2) {
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;

    // Convert to timestamps
    const time1 = new Date(date1).getTime();
    const time2 = new Date(date2).getTime();

    const diffInMs = Math.abs(time2 - time1);

    return Math.floor(diffInMs / msPerWeek);
}