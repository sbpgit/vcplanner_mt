const JobSchedulerClient = require("@sap/jobs-client");
const xsenv = require("@sap/xsenv");
const { v1: uuidv1} = require('uuid')


function getJobscheduler(req) {

  xsenv.loadEnv();
  const services = xsenv.getServices({
    jobscheduler: { tags: "jobscheduler" },
  });
  if (services.jobscheduler) {
    const options = {
      baseURL: services.jobscheduler.url,
      user: services.jobscheduler.user,
      password: services.jobscheduler.password,
    };
    return new JobSchedulerClient.Scheduler(options);
  } else {
    req.error("no jobscheduler service instance found");
  }
}

module.exports = async function (srv) {

  srv.on ('genMasterData',    async req => {
     return (await _genMasterDataDemo(req,false));
  })

  srv.on ('fgenMasterData',    async req => {
    return (await _genMasterDataDemo(req,true));
  })

  srv.on ('genPartialProducts',    async req => {
    return (await _genPartialProducts(req,false));
 })

 srv.on ('fgenPartialProducts',    async req => {
   return (await _genPartialProducts(req,true));
 })

 srv.on ('genTimeSeries',    async req => {
    return (await _genTimeSeries(req,false));
 })

 srv.on ('fgenTimeSeries',    async req => {
   return (await _genTimeSeries(req,true));
 })

 srv.on ('genTsForPrimary',    async req => {
    return (await _genTsForPrimary(req,false));
 })

 srv.on ('fgenTsForPrimary',    async req => {
   return (await _genTsForPrimary(req,true));
 })


 srv.on ('genFutureTsForPrimary',    async req => {
    return (await _genFutureTsForPrimary(req,false));
 })

 srv.on ('fgenFutureTsForPrimary',    async req => {
    return (await _genFutureTsForPrimary(req,true));
  })

 srv.on ('genPrimeAndUqiue',    async req => {
    return (await _genPrimeAndUqiue(req,false));
 })

 srv.on ('fgenPrimeAndUqiue',    async req => {
    return (await _genPrimeAndUqiue(req,true));
  })

  async function _genMasterDataDemo(req,isGet) {

    var reqData = "Request for Master Data Generation Queued Sucessfully";

    console.log("_genMasterData reqData : ", reqData);
    let createtAt = new Date();
    let id = uuidv1();
    let values = [];	
  
    values.push({id, createtAt, reqData});    

    if (isGet == true)
    {
        req.reply({values});
    }
    else
    {
        let res = req._.req.res;
        res.statusCode = 202;
        res.send({values});
    }

    // let sqlStr ='UPSERT PLSTR_PRODUCT ("PRODUCT_ID", "PROD_DESC", "PROD_FAMILY", "PROD_GROUP", "PROD_SERIES", "RESERVE_FIELD1","RESERVE_FIELD2")' +
    //                 ' SELECT DISTINCT PRODUCT_ID, PRODUCT_NAME, MODEL_D ,\'CARS\',MOTOR_CODE_D, SALES_VERSION_ID_D , DENOMINATION_D FROM "PLSTR_DATA_DEMO"';
    
    let sqlStr ='UPSERT PLSTR_PRODUCT ("PRODUCT_ID", "PROD_DESC", "PROD_FAMILY", "PROD_GROUP")' +
                    ' SELECT DISTINCT PRODUCT_ID, PRODUCT_NAME, PRODUCT_ID ,\'CARS\' FROM "PLSTR_DATA_DEMO"';

    console.log("PLSTR PRODUCTS sqlStr ", sqlStr);

    let results = await cds.run(sqlStr);
    console.log("PLSTR PRODUCTS  ", results);


    sqlStr = 'UPSERT PLSTR_LOCATION("LOCATION_ID","LOCATION_DESC","LOCATION_TYPE")' +
                    ' SELECT DISTINCT  CONCAT(\'PL\',"COUNTRY"),  CONCAT(\'PL\',CONCAT ("COUNTRY", \' Location\')),\'2\'FROM "PLSTR_DATA_DEMO"'; 
                // ' SELECT \'PL99\', \'PL99 Location\' , \'2\'FROM DUMMY';

    console.log("PLSTR LOCATION sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR LOCATION  ", results);

    sqlStr = 'UPSERT PLSTR_CLASS("CLASS_NUM","CLASS_NAME","CLASS_TYPE","CLASS_DESC")' +
             ' SELECT \'99999\', \'PS2_Class\', \'300\', \'PS2_Class_003\' FROM DUMMY';

    console.log("PLSTR CLASS sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR CLASS  ", results);

    sqlStr = 'UPSERT PLSTR_PRODUCT_CLASS ("PRODUCT_ID", "CLASS_NUM", "CREATED_BY")' +
					  ' SELECT DISTINCT "PRODUCT_ID", \'99999\',\'SBP\' FROM PLSTR_PRODUCT';


    console.log("PLSTR PRODUCT CLASS sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR PRODUCT CLASS  ", results);


    sqlStr = 'UPSERT PLSTR_LOCATION_PRODUCT ("LOCATION_ID", "PRODUCT_ID","LOTSIZE_KEY","LOT_SIZE", "PROCUREMENT_TYPE","PLANNING_STRATEGY")' +
					  ' SELECT DISTINCT CONCAT(\'PL\',"COUNTRY"), PRODUCT_ID, \'EX\',' +  1 + ' , \'E\',  \'56\' FROM PLSTR_DATA_DEMO';


    console.log("PLSTR_LOCATION_PRODUCT sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PPLSTR_LOCATION_PRODUCT  ", results);



    sqlStr = 'UPSERT PLSTR_CHARACTERISTICS ("CLASS_NUM", "CHAR_NUM", "CHAR_NAME", "CHAR_DESC","CHAR_GROUP","CHAR_TYPE","ENTRY_REQ")' +
                ' SELECT DISTINCT  \'99999\',"CHAR_NUM", "CHAR_NAME", "CHAR_DESC","CHAR_GROUP","CHAR_TYPE", \'Y\' FROM PLSTR_CHAR_CHARNUM';


    console.log("PLSTR PLSTR_CHARACTERISTICS sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR_CHARACTERISTICS  ", results);

    sqlStr = 'SELECT DISTINCT "CHAR_NAME", "CHAR_NUM", "CHAR_DESC" FROM "PLSTR_CHAR_CHARNUM"';
    console.log("PLSTR_CHAR_CHARNUM sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR_CHAR_CHARNUM  ", results);

    for(let rIndex = 0; rIndex < results.length; rIndex++)
    {
        let sqlPlstrData = "";
        let charDesc = results[rIndex].CHAR_DESC;
        if (charDesc != '')
            sqlPlstrData = 'SELECT DISTINCT ' +  results[rIndex].CHAR_NAME + "," + results[rIndex].CHAR_DESC + ' FROM PLSTR_DATA_DEMO' + 
                             ' WHERE ' +  results[rIndex].CHAR_NAME + '!= \'null\'';
        else
            sqlPlstrData = 'SELECT DISTINCT ' +  results[rIndex].CHAR_NAME + ', ' +  results[rIndex].CHAR_NAME + ' FROM PLSTR_DATA_DEMO' + 
                            ' WHERE ' +  results[rIndex].CHAR_NAME + '!= \'null\'';
        console.log("PLSTR_DATA_DEMO CHAR sqlPlstrData ", sqlPlstrData);

        let plstrDataResults = await cds.run(sqlPlstrData); 
        console.log("PLSTR_CHAR_VALUES  ", plstrDataResults);
        // str = plstrDataResults.length.toString(),
        // len = str.length;
        let prefix ="";
        
        // console.log("PLSTR_CHAR_VALUES prefix ", prefix);
        let charvalNumIndex = 0;
        for(charvalIndex = 0; charvalIndex < plstrDataResults.length; charvalIndex++ )
        {
            charvalNumIndex ++;
            let charNum = results[rIndex].CHAR_NUM;

            if (charvalNumIndex < 10 )
            {
                prefix = '000'; 
            }
            else if (charvalNumIndex < 100 )
            {
                prefix = '00'; 
            }
            else if (charvalNumIndex < 1000 )
            {
                prefix = '0';
            }
            // let charvalNum = results[rIndex].CHAR_NUM + '_' + prefix + charvalNumIndex; //rIndex + 1;
            let charvalNum = prefix + charvalNumIndex; //rIndex + 1;


            

            let str = JSON.stringify(plstrDataResults[charvalIndex]);
            let obj = JSON.parse(str);
            let arrayVals = Object.values(obj);

            let charName = arrayVals[0];
            let chavalDesc = 'NULL';
            if(arrayVals.length > 1)
                chavalDesc = arrayVals[1];
            else
            chavalDesc = arrayVals[0];
            console.log("charNum = ", charNum, "charName = ",charName, "charvalNum = ",charvalNum, "chavalDesc = ",chavalDesc);
            
            sqlStr = 'UPSERT PLSTR_CHAR_VALUES VALUES (' +
                    "'" + charNum + "'" + "," +
                    "'" + charvalNum + "'" + "," +
                    "'" + charName + "'" + "," +
                    "'" + chavalDesc + "'" + "," +
                    'null' +')' + ' WITH PRIMARY KEY';

            console.log("PLSTR_CHAR_VALUES sqlStr", sqlStr);

            let charValResults = await cds.run(sqlStr);
            console.log("PLSTR_CHAR_VALUES  ", charValResults);

        }


    }

    // SALES HISTORY

    sqlStr = 'select * FROM PLSTR_DATA_DEMO ORDER BY UNIQUE_ID ASC';
    plstrData = await cds.run(sqlStr);

    console.log("PLSTR_DATA_DEMO rows", plstrData.length);

    // var plstrJson = JSON.stringify(plstrData);
    const salesDocBaseID = 9990000000;
    const salesDocItem = 50;
    const sheduledLineNum = 10;
    const uom = 'EA';

    
    for(let shIndex = 0; shIndex < plstrData.length; shIndex++)
    // for(let shIndex = 18000; shIndex < plstrData.length; shIndex++)
    {
        let salesDocId = salesDocBaseID + plstrData[shIndex].UNIQUE_ID;

        let countryCode = plstrData[shIndex].COUNTRY ;
        
        sqlStr = 'UPSERT PLSTR_SALESH VALUES (' +
                    "'" + salesDocId + "'" + "," +
                    "'" + salesDocItem + "'" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "'" + sheduledLineNum + "'" + "," +
                    "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                    "''" + "," +
                    "'" + uom + "'" + "," +
                    "'" + plstrData[shIndex].HANDOVERS_COUNT + "'" + "," +
                    "'" + plstrData[shIndex].HANDOVERS_COUNT + "'" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "'" + 9999999 + "'" + "," +
                    "'" + countryCode + "'" + "," +
                    "'" + 'PL' + countryCode + "'" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "''" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "'SBP'" + "," +
                    "''" + "," +
                    "''" +')' + ' WITH PRIMARY KEY';

        // console.log("PLSTR_SALESH VALUES sqlStr", sqlStr);

        let saleshResults = await cds.run(sqlStr);
        // console.log("PLSTR_SALESH  ", saleshResults);
        if (shIndex %100 == 0)
         console.log("PLSTR_SALESH salesDoc ", salesDocId, "shIndex ",shIndex);

        let sqlSaleConfig = 'SELECT DISTINCT MOTOR_CODE_D, DENOMINATION_D, SALES_VERSION_ID_D, BODY_VERSION_D, TRANSMISSION_D, STEERING_D, ' +
                            ' MARKET_CODE_D, EXTERIOR_ID_D, INTERIOR_D, OPT_WHEELS_D,  OPT_PERFORM_D, OPT_PLUS_D, OPT_PILOT_D, OPT_PILOT_LITE_D, OPT_TOWBAR_D' +
                            ' FROM PLSTR_DATA_DEMO WHERE ' +  
                            ' UNIQUE_ID = ' + "'" + plstrData[shIndex].UNIQUE_ID + "'";
        
        // console.log(" sqlSaleConfig ", sqlSaleConfig);

        let salesConfigResults = await cds.run(sqlSaleConfig);
        // console.log(" salesConfigResults ", salesConfigResults);

        let sqlSalesCfgCharCharval = '';

        if( plstrData[shIndex].MOTOR_CODE_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' +
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," +
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].MOTOR_CODE_D + "'" +
                                     ' AND charc.CHAR_NAME = \'MOTOR_CODE_D\'';        
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
   
        }

        if( plstrData[shIndex].DENOMINATION_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' +
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" +  "," +
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].DENOMINATION_D + "'" +
                                     ' AND charc.CHAR_NAME = \'DENOMINATION_D\'';                
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
   
        }
        // console.log(" sqlSalesCfgCharCharval ", sqlSalesCfgCharCharval);


        if( plstrData[shIndex].SALES_VERSION_ID_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' +
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].SALES_VERSION_ID_D + "'" +
                                     ' AND charc.CHAR_NAME = \'SALES_VERSION_ID_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        if( plstrData[shIndex].BODY_VERSION_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' +
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].BODY_VERSION_D + "'" +
                                     ' AND charc.CHAR_NAME = \'BODY_VERSION_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].TRANSMISSION_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' +
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].TRANSMISSION_D + "'" +
                                     ' AND charc.CHAR_NAME = \'TRANSMISSION_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].STEERING_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' +
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].STEERING_D + "'" +
                                     ' AND charc.CHAR_NAME = \'STEERING_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].MARKET_CODE_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' +
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].MARKET_CODE_D + "'" +
                                     ' AND charc.CHAR_NAME = \'MARKET_CODE_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        if( plstrData[shIndex].EXTERIOR_ID_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' +
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].EXTERIOR_ID_D + "'" +
                                     ' AND charc.CHAR_NAME = \'EXTERIOR_ID_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].INTERIOR_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," +
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].INTERIOR_D + "'" +
                                     ' AND charc.CHAR_NAME = \'INTERIOR_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].OPT_WHEELS_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_WHEELS_D + "'" +
                                     ' AND charc.CHAR_NAME = \'OPT_WHEELS_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
            // console.log("sqlSalesCfgCharCharval",sqlSalesCfgCharCharval);

            // console.log("salesDocId",salesDocId, " OPT_WHEELS_D ", plstrData[shIndex].OPT_WHEELS_D );


            // console.log("sqlSalesCfgCharCharvalResults",sqlSalesCfgCharCharvalResults);

        }

        if( plstrData[shIndex].OPT_PERFORM_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PERFORM_D + "'" +
                                     ' AND charc.CHAR_NAME = \'OPT_PERFORM_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

            // console.log("sqlSalesCfgCharCharval",sqlSalesCfgCharCharval);

            // console.log("salesDocId",salesDocId, " OPT_PERFORM_D ", plstrData[shIndex].OPT_PERFORM_D );


            // console.log("sqlSalesCfgCharCharvalResults",sqlSalesCfgCharCharvalResults);

        }

        if( plstrData[shIndex].OPT_PLUS_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PLUS_D + "'" +
                                     ' AND charc.CHAR_NAME = \'OPT_PLUS_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].OPT_PILOT_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PILOT_D + "'" +
                                     ' AND charc.CHAR_NAME = \'OPT_PILOT_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].OPT_PILOT_LITE_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PILOT_LITE_D + "'" +
                                     ' AND charc.CHAR_NAME = \'OPT_PILOT_LITE_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        if( plstrData[shIndex].OPT_TOWBAR_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CLASS_NAME","CLASS_NUM","CHAR_NAME","CHAR_VALUE", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     "'AS_AS01'" + "," + "\'108\'" + "," + 
                                     'charc."CHAR_NAME",charval."CHAR_VALUE",' +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_TOWBAR_D +"'" +
                                     ' AND charc.CHAR_NAME = \'OPT_TOWBAR_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }
        // console.log(" sqlSalesCfgCharCharval ", sqlSalesCfgCharCharval);
        // console.log(" salesConfigResults ", sqlSalesCfgCharCharvalResults);
        // if (shIndex == 0)
        //      break;
        if( shIndex % 1000 == 0)
           await cds.run('COMMIT');
    }

    let custGrpSql  = 'UPSERT PLSTR_CUSTOMERGROUP ("CUSTOMER_GROUP", "CUSTOMER_DESC")' +
                        ' SELECT DISTINCT "CUSTOMER_GROUP" ,' +
                        ' CONCAT("CUSTOMER_GROUP", ' + '\' Customer \'' + ')' + 
                        ' FROM "PLSTR_SALESH" WHERE LOCATION_ID = ' + '\'PL99\'';
    console.log("custGrpSql = ", custGrpSql);
    let custGrpSqlResults = await cds.run(custGrpSql);
    console.log("custGrpSqlResults = ", custGrpSqlResults);


    let dataObj = {};
    dataObj["success"] = true;
    dataObj["message"] = "update Master Data Completed Successfully at " +  new Date();


  }

  async function _genMasterDataDemo_bkup(req,isGet) {

    var reqData = "Request for Master Data Generation Queued Sucessfully";

    console.log("_genMasterData reqData : ", reqData);
    let createtAt = new Date();
    let id = uuidv1();
    let values = [];	
  
    values.push({id, createtAt, reqData});    

    if (isGet == true)
    {
        req.reply({values});
    }
    else
    {
        let res = req._.req.res;
        res.statusCode = 202;
        res.send({values});
    }

    // let sqlStr ='UPSERT PLSTR_PRODUCT ("PRODUCT_ID", "PROD_DESC", "PROD_FAMILY", "PROD_GROUP", "PROD_SERIES", "RESERVE_FIELD1","RESERVE_FIELD2")' +
    //                 ' SELECT DISTINCT PRODUCT_ID, PRODUCT_NAME, MODEL_D ,\'CARS\',MOTOR_CODE_D, SALES_VERSION_ID_D , DENOMINATION_D FROM "PLSTR_DATA_DEMO"';
    
    let sqlStr ='UPSERT PLSTR_PRODUCT ("PRODUCT_ID", "PROD_DESC", "PROD_FAMILY", "PROD_GROUP")' +
                    ' SELECT DISTINCT PRODUCT_ID, PRODUCT_NAME, PRODUCT_ID ,\'CARS\' FROM "PLSTR_DATA_DEMO"';

    console.log("PLSTR PRODUCTS sqlStr ", sqlStr);

    let results = await cds.run(sqlStr);
    console.log("PLSTR PRODUCTS  ", results);


    sqlStr = 'UPSERT PLSTR_LOCATION("LOCATION_ID","LOCATION_DESC","LOCATION_TYPE")' +
                    ' SELECT DISTINCT  CONCAT(\'PL\',"COUNTRY"),  CONCAT(\'PL\',CONCAT ("COUNTRY", \' Location\')),\'2\'FROM "PLSTR_DATA_DEMO"'; 
                // ' SELECT \'PL99\', \'PL99 Location\' , \'2\'FROM DUMMY';

    console.log("PLSTR LOCATION sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR LOCATION  ", results);

    sqlStr = 'UPSERT PLSTR_CLASS("CLASS_NUM","CLASS_NAME","CLASS_TYPE","CLASS_DESC")' +
             ' SELECT \'99999\', \'PS2_Class\', \'300\', \'PS2_Class_003\' FROM DUMMY';

    console.log("PLSTR CLASS sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR CLASS  ", results);

    sqlStr = 'UPSERT PLSTR_PRODUCT_CLASS ("PRODUCT_ID", "CLASS_NUM", "CREATED_BY")' +
					  ' SELECT DISTINCT "PRODUCT_ID", \'99999\',\'SBP\' FROM PLSTR_PRODUCT';


    console.log("PLSTR PRODUCT CLASS sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR PRODUCT CLASS  ", results);


    sqlStr = 'UPSERT PLSTR_LOCATION_PRODUCT ("LOCATION_ID", "PRODUCT_ID","LOTSIZE_KEY","LOT_SIZE", "PROCUREMENT_TYPE","PLANNING_STRATEGY")' +
					  ' SELECT DISTINCT CONCAT(\'PL\',"COUNTRY"), PRODUCT_ID, \'EX\',' +  1 + ' , \'E\',  \'56\' FROM PLSTR_DATA_DEMO';


    console.log("PLSTR_LOCATION_PRODUCT sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PPLSTR_LOCATION_PRODUCT  ", results);



    sqlStr = 'UPSERT PLSTR_CHARACTERISTICS ("CLASS_NUM", "CHAR_NUM", "CHAR_NAME", "CHAR_DESC","CHAR_GROUP","CHAR_TYPE","ENTRY_REQ")' +
                ' SELECT DISTINCT  \'99999\',"CHAR_NUM", "CHAR_NAME", "CHAR_DESC","CHAR_GROUP","CHAR_TYPE", \'Y\' FROM PLSTR_CHAR_CHARNUM';


    console.log("PLSTR PLSTR_CHARACTERISTICS sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR_CHARACTERISTICS  ", results);

    sqlStr = 'SELECT DISTINCT "CHAR_NAME", "CHAR_NUM", "CHAR_DESC" FROM "PLSTR_CHAR_CHARNUM"';
    console.log("PLSTR_CHAR_CHARNUM sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR_CHAR_CHARNUM  ", results);

    for(let rIndex = 0; rIndex < results.length; rIndex++)
    {
        let sqlPlstrData = "";
        let charDesc = results[rIndex].CHAR_DESC;
        if (charDesc != '')
            sqlPlstrData = 'SELECT DISTINCT ' +  results[rIndex].CHAR_NAME + "," + results[rIndex].CHAR_DESC + ' FROM PLSTR_DATA_DEMO' + 
                             ' WHERE ' +  results[rIndex].CHAR_NAME + '!= \'null\'';
        else
            sqlPlstrData = 'SELECT DISTINCT ' +  results[rIndex].CHAR_NAME + ', ' +  results[rIndex].CHAR_NAME + ' FROM PLSTR_DATA_DEMO' + 
                            ' WHERE ' +  results[rIndex].CHAR_NAME + '!= \'null\'';
        console.log("PLSTR_DATA_DEMO CHAR sqlPlstrData ", sqlPlstrData);

        let plstrDataResults = await cds.run(sqlPlstrData); 
        console.log("PLSTR_CHAR_VALUES  ", plstrDataResults);
        // str = plstrDataResults.length.toString(),
        // len = str.length;
        let prefix ="";
        // if (len == 1)
        // {
        //     prefix = '000';
        // }
        // else if (len == 2)
        // {
        //     prefix = '00';
        // }
        // else if (len == 3)
        // {
        //     prefix = '0';
        // }
        // console.log("PLSTR_CHAR_VALUES prefix ", prefix);
        let charvalNumIndex = 0;
        for(charvalIndex = 0; charvalIndex < plstrDataResults.length; charvalIndex++ )
        {
            charvalNumIndex ++;
            let charNum = results[rIndex].CHAR_NUM;

            if (charvalNumIndex < 10 )
            {
                prefix = '000'; 
            }
            else if (charvalNumIndex < 100 )
            {
                prefix = '00'; 
            }
            else if (charvalNumIndex < 1000 )
            {
                prefix = '0';
            }
            let charvalNum = results[rIndex].CHAR_NUM + '_' + prefix + charvalNumIndex; //rIndex + 1;

            

            let str = JSON.stringify(plstrDataResults[charvalIndex]);
            let obj = JSON.parse(str);
            let arrayVals = Object.values(obj);

            let charName = arrayVals[0];
            let chavalDesc = 'NULL';
            if(arrayVals.length > 1)
                chavalDesc = arrayVals[1];
            else
            chavalDesc = arrayVals[0];
            console.log("charNum = ", charNum, "charName = ",charName, "charvalNum = ",charvalNum, "chavalDesc = ",chavalDesc);
            
            sqlStr = 'UPSERT PLSTR_CHAR_VALUES VALUES (' +
                    "'" + charNum + "'" + "," +
                    "'" + charvalNum + "'" + "," +
                    "'" + charName + "'" + "," +
                    "'" + chavalDesc + "'" + "," +
                    'null' +')' + ' WITH PRIMARY KEY';

            console.log("PLSTR_CHAR_VALUES sqlStr", sqlStr);

            let charValResults = await cds.run(sqlStr);
            console.log("PLSTR_CHAR_VALUES  ", charValResults);

        }


    }

    // SALES HISTORY

    sqlStr = 'select * FROM PLSTR_DATA_DEMO ORDER BY UNIQUE_ID ASC';
    plstrData = await cds.run(sqlStr);

    console.log("PLSTR_DATA_DEMO rows", plstrData.length);

    // var plstrJson = JSON.stringify(plstrData);
    const salesDocBaseID = 9990000000;
    const salesDocItem = 50;
    const sheduledLineNum = 10;
    const uom = 'EA';

    
    // for(let shIndex = 0; shIndex < plstrData.length; shIndex++)
    for(let shIndex = 18000; shIndex < plstrData.length; shIndex++)
    {
        let salesDocId = salesDocBaseID + plstrData[shIndex].UNIQUE_ID;

        let countryCode = plstrData[shIndex].COUNTRY ;
        let custGroup = '';
        // if ( (countryCode == 'GB') ||
        //      (countryCode == 'AT') ||
        //      (countryCode == 'IS') ||
        //      (countryCode == 'NL') ||
        //      (countryCode == 'SE') ||
        //      (countryCode == 'BE') ||
        //      (countryCode == 'CH') ||
        //      (countryCode == 'DE') ||
        //      (countryCode == 'DK') ||
        //      (countryCode == 'FI') ||
        //      (countryCode == 'NO') ||
        //      (countryCode == 'LU') ||
        //      (countryCode == 'PT') ||
        //      (countryCode == 'ES') ||
        //      (countryCode == 'IE') )
        // {
        //     custGroup = 'EU';
        // }
        // else if ((countryCode == 'US') ||
        //          (countryCode == 'CA') )
        // {
        //     custGroup = 'NA';
        // }
        // else if ((countryCode == 'NZ') ||
        //          (countryCode == 'AU') ||
        //          (countryCode == 'CN') )
        // {
        //     custGroup = 'OS';
        // }
        // else if ((countryCode == 'SG') ||
        //          (countryCode == 'KR') ||
        //          (countryCode == 'HK'))
        // {
        //     custGroup = 'SE';
        // }       
        // else if ((countryCode == 'KW') ||
        //          (countryCode == 'AE') ||
        //          (countryCode == 'IL'))
        // {
        //     custGroup = 'OT';
        // }

        sqlStr = 'UPSERT PLSTR_SALESH VALUES (' +
                    "'" + salesDocId + "'" + "," +
                    "'" + salesDocItem + "'" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "'" + sheduledLineNum + "'" + "," +
                    "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                    "''" + "," +
                    "'" + uom + "'" + "," +
                    "'" + plstrData[shIndex].HANDOVERS_COUNT + "'" + "," +
                    "'" + plstrData[shIndex].HANDOVERS_COUNT + "'" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "'" + 9999999 + "'" + "," +
                    "'" + countryCode + "'" + "," +
                    "'" + 'PL' + countryCode + "'" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "''" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "'SBP'" + "," +
                    "''" + "," +
                    "''" +')' + ' WITH PRIMARY KEY';

        // console.log("PLSTR_SALESH VALUES sqlStr", sqlStr);

        let saleshResults = await cds.run(sqlStr);
        // console.log("PLSTR_SALESH  ", saleshResults);
        if (shIndex %100 == 0)
         console.log("PLSTR_SALESH salesDoc ", salesDocId, "shIndex ",shIndex);

        let sqlSaleConfig = 'SELECT DISTINCT MOTOR_CODE_D, DENOMINATION_D, SALES_VERSION_ID_D, BODY_VERSION_D, TRANSMISSION_D, STEERING_D, ' +
                            ' MARKET_CODE_D, EXTERIOR_ID_D, INTERIOR_D, OPT_WHEELS_D,  OPT_PERFORM_D, OPT_PLUS_D, OPT_PILOT_D, OPT_PILOT_LITE_D, OPT_TOWBAR_D' +
                            ' FROM PLSTR_DATA_DEMO WHERE ' +  
                            ' UNIQUE_ID = ' + "'" + plstrData[shIndex].UNIQUE_ID + "'";
        
        // console.log(" sqlSaleConfig ", sqlSaleConfig);

        let salesConfigResults = await cds.run(sqlSaleConfig);
        // console.log(" salesConfigResults ", salesConfigResults);

        let sqlSalesCfgCharCharval = '';

        if( plstrData[shIndex].MOTOR_CODE_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].MOTOR_CODE_D + "'" +
                                     ' AND charc.CHAR_NAME = \'MOTOR_CODE_D\'';        
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
   
        }

        if( plstrData[shIndex].DENOMINATION_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].DENOMINATION_D + "'" +
                                     ' AND charc.CHAR_NAME = \'DENOMINATION_D\'';                
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
   
        }
        // console.log(" sqlSalesCfgCharCharval ", sqlSalesCfgCharCharval);


        if( plstrData[shIndex].SALES_VERSION_ID_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].SALES_VERSION_ID_D + "'" +
                                     ' AND charc.CHAR_NAME = \'SALES_VERSION_ID_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        if( plstrData[shIndex].BODY_VERSION_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].BODY_VERSION_D + "'" +
                                     ' AND charc.CHAR_NAME = \'BODY_VERSION_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].TRANSMISSION_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].TRANSMISSION_D + "'" +
                                     ' AND charc.CHAR_NAME = \'TRANSMISSION_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].STEERING_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].STEERING_D + "'" +
                                     ' AND charc.CHAR_NAME = \'STEERING_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].MARKET_CODE_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].MARKET_CODE_D + "'" +
                                     ' AND charc.CHAR_NAME = \'MARKET_CODE_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        if( plstrData[shIndex].EXTERIOR_ID_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].EXTERIOR_ID_D + "'" +
                                     ' AND charc.CHAR_NAME = \'EXTERIOR_ID_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].INTERIOR_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].INTERIOR_D + "'" +
                                     ' AND charc.CHAR_NAME = \'INTERIOR_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].OPT_WHEELS_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_WHEELS_D + "'" +
                                     ' AND charc.CHAR_NAME = \'OPT_WHEELS_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
            // console.log("sqlSalesCfgCharCharval",sqlSalesCfgCharCharval);

            // console.log("salesDocId",salesDocId, " OPT_WHEELS_D ", plstrData[shIndex].OPT_WHEELS_D );


            // console.log("sqlSalesCfgCharCharvalResults",sqlSalesCfgCharCharvalResults);

        }

        if( plstrData[shIndex].OPT_PERFORM_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PERFORM_D + "'" +
                                     ' AND charc.CHAR_NAME = \'OPT_PERFORM_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

            // console.log("sqlSalesCfgCharCharval",sqlSalesCfgCharCharval);

            // console.log("salesDocId",salesDocId, " OPT_PERFORM_D ", plstrData[shIndex].OPT_PERFORM_D );


            // console.log("sqlSalesCfgCharCharvalResults",sqlSalesCfgCharCharvalResults);

        }

        if( plstrData[shIndex].OPT_PLUS_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PLUS_D + "'" +
                                     ' AND charc.CHAR_NAME = \'OPT_PLUS_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].OPT_PILOT_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PILOT_D + "'" +
                                     ' AND charc.CHAR_NAME = \'OPT_PILOT_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].OPT_PILOT_LITE_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PILOT_LITE_D + "'" +
                                     ' AND charc.CHAR_NAME = \'OPT_PILOT_LITE_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        if( plstrData[shIndex].OPT_TOWBAR_D != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_TOWBAR_D +"'" +
                                     ' AND charc.CHAR_NAME = \'OPT_TOWBAR_D\'';      
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }
        // console.log(" sqlSalesCfgCharCharval ", sqlSalesCfgCharCharval);
        // console.log(" salesConfigResults ", sqlSalesCfgCharCharvalResults);
        // if (shIndex == 0)
        //      break;
        if( shIndex % 1000 == 0)
           await cds.run('COMMIT');
    }

    let custGrpSql  = 'UPSERT PLSTR_CUSTOMERGROUP ("CUSTOMER_GROUP", "CUSTOMER_DESC")' +
                        ' SELECT DISTINCT "CUSTOMER_GROUP" ,' +
                        ' CONCAT("CUSTOMER_GROUP", ' + '\' Customer \'' + ')' + 
                        ' FROM "PLSTR_SALESH" WHERE LOCATION_ID = ' + '\'PL99\'';
    console.log("custGrpSql = ", custGrpSql);
    let custGrpSqlResults = await cds.run(custGrpSql);
    console.log("custGrpSqlResults = ", custGrpSqlResults);


    let dataObj = {};
    dataObj["success"] = true;
    dataObj["message"] = "update Master Data Completed Successfully at " +  new Date();


  }

  async function _genMasterData(req,isGet) {

    var reqData = "Request for Master Data Generation Queued Sucessfully";

    console.log("_genMasterData reqData : ", reqData);
    let createtAt = new Date();
    let id = uuidv1();
    let values = [];	
  
    values.push({id, createtAt, reqData});    

    if (isGet == true)
    {
        req.reply({values});
    }
    else
    {
        let res = req._.req.res;
        res.statusCode = 202;
        res.send({values});
    }

    let sqlStr ='UPSERT PLSTR_PRODUCT ("PRODUCT_ID", "PROD_DESC", "PROD_FAMILY", "PROD_GROUP", "PROD_SERIES", "RESERVE_FIELD1","RESERVE_FIELD2")' +
                    ' SELECT DISTINCT PRODUCT_ID, PRODUCT_NAME, MODEL ,\'CARS\',MOTOR_CODE, SALES_VERSION_ID , DENOMINATION FROM "PLSTR_DATA"';
                //  ' SELECT DISTINCT PNO12_PRODUCT, PRODUCT_NAME, PRODUCT_ID , \'CARS\', MODEL FROM "PLSTR_DATA"';
    console.log("PLSTR PRODUCTS sqlStr ", sqlStr);

    let results = await cds.run(sqlStr);
    console.log("PLSTR PRODUCTS  ", results);


    // sqlStr = 'UPSERT PLSTR_LOCATION VALUES ('  +
    //                 '\'PL20\'' + ',' + '\'PL20 Location\'' + ')' + ' WITH PRIMARY KEY';
 
    sqlStr = 'UPSERT PLSTR_LOCATION("LOCATION_ID","LOCATION_DESC","LOCATION_TYPE")' +
                ' SELECT \'PL20\', \'PL20 Location\' , \'2\'FROM DUMMY';

    console.log("PLSTR LOCATION sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR LOCATION  ", results);

    sqlStr = 'UPSERT PLSTR_CLASS("CLASS_NUM","CLASS_NAME","CLASS_TYPE","CLASS_DESC")' +
             ' SELECT \'55555\', \'PS2_Class\', \'300\', \'PS2_Class_003\' FROM DUMMY';

    console.log("PLSTR CLASS sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR CLASS  ", results);

    sqlStr = 'UPSERT PLSTR_PRODUCT_CLASS ("PRODUCT_ID", "CLASS_NUM", "CREATED_BY")' +
					  ' SELECT DISTINCT "PRODUCT_ID", \'55555\',\'SBP\' FROM PLSTR_PRODUCT';


    console.log("PLSTR PRODUCT CLASS sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR PRODUCT CLASS  ", results);


    sqlStr = 'UPSERT PLSTR_LOCATION_PRODUCT ("LOCATION_ID", "PRODUCT_ID","LOTSIZE_KEY","LOT_SIZE", "PROCUREMENT_TYPE","PLANNING_STRATEGY")' +
					  ' SELECT DISTINCT \'PL20\', PRODUCT_ID, \'EX\',' +  1 + ' , \'E\',  \'56\' FROM PLSTR_PRODUCT';


    console.log("PLSTR_LOCATION_PRODUCT sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PPLSTR_LOCATION_PRODUCT  ", results);



    sqlStr = 'UPSERT PLSTR_CHARACTERISTICS ("CLASS_NUM", "CHAR_NUM", "CHAR_NAME", "CHAR_DESC","CHAR_GROUP","CHAR_TYPE","ENTRY_REQ")' +
                ' SELECT DISTINCT  \'55555\',"CHAR_NUM", "CHAR_NAME", "CHAR_DESC","CHAR_GROUP","CHAR_TYPE", \'Y\' FROM PLSTR_CHAR_CHARNUM';


    console.log("PLSTR PLSTR_CHARACTERISTICS sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR_CHARACTERISTICS  ", results);

    sqlStr = 'SELECT DISTINCT "CHAR_NAME", "CHAR_NUM", "CHAR_DESC" FROM "PLSTR_CHAR_CHARNUM"';
    console.log("PLSTR_CHAR_CHARNUM sqlStr ", sqlStr);

    results = await cds.run(sqlStr);
    console.log("PLSTR_CHAR_CHARNUM  ", results);

    for(let rIndex = 0; rIndex < results.length; rIndex++)
    {
        let sqlPlstrData = "";
        let charDesc = results[rIndex].CHAR_DESC;
        if (charDesc != '')
            sqlPlstrData = 'SELECT DISTINCT ' +  results[rIndex].CHAR_NAME + "," + results[rIndex].CHAR_DESC + ' FROM PLSTR_DATA' + 
                             ' WHERE ' +  results[rIndex].CHAR_NAME + '!= \'null\'';
        else
            sqlPlstrData = 'SELECT DISTINCT ' +  results[rIndex].CHAR_NAME + ', ' +  results[rIndex].CHAR_NAME + ' FROM PLSTR_DATA' + 
                            ' WHERE ' +  results[rIndex].CHAR_NAME + '!= \'null\'';
        console.log("PLSTR_DATA CHAR sqlPlstrData ", sqlPlstrData);

        let plstrDataResults = await cds.run(sqlPlstrData); 
        console.log("PLSTR_CHAR_VALUES  ", plstrDataResults);
        str = plstrDataResults.length.toString(),
        len = str.length;
        let prefix ="";
        if (len == 1)
        {
            prefix = '000';
        }
        else if (len == 2)
        {
            prefix = '00';
        }
        else if (len == 3)
        {
            prefix = '0';
        }
        // console.log("PLSTR_CHAR_VALUES prefix ", prefix);
        let charvalNumIndex = 0;
        for(charvalIndex = 0; charvalIndex < plstrDataResults.length; charvalIndex++ )
        {
            charvalNumIndex ++;
            let charNum = results[rIndex].CHAR_NUM;
            let charvalNum = results[rIndex].CHAR_NUM + '_' + prefix + charvalNumIndex; //rIndex + 1;

            

            let str = JSON.stringify(plstrDataResults[charvalIndex]);
            let obj = JSON.parse(str);
            let arrayVals = Object.values(obj);

            let charName = arrayVals[0];
            let chavalDesc = 'NULL';
            if(arrayVals.length > 1)
                chavalDesc = arrayVals[1];
            else
            chavalDesc = arrayVals[0];
            console.log("charNum = ", charNum, "charName = ",charName, "charvalNum = ",charvalNum, "chavalDesc = ",chavalDesc);
            
            sqlStr = 'UPSERT PLSTR_CHAR_VALUES VALUES (' +
                    "'" + charNum + "'" + "," +
                    "'" + charvalNum + "'" + "," +
                    "'" + charName + "'" + "," +
                    "'" + chavalDesc + "'" + "," +
                    'null' +')' + ' WITH PRIMARY KEY';

            console.log("PLSTR_CHAR_VALUES sqlStr", sqlStr);

            let charValResults = await cds.run(sqlStr);
            console.log("PLSTR_CHAR_VALUES  ", charValResults);

        }






        // sqlStr = 'UPSERT PLSTR_SALESH VALUES (' +
        //             "'" + charNum + "'" + "," +
        //             "'" + charvalNum + "'" + "," +
        //             "'" + charName + "'" + "," +
        //             "'" + chavalDesc + "'" + "," +
        //             'null' +')' + ' WITH PRIMARY KEY';


    }

    // SALES HISTORY

    sqlStr = 'select * FROM PLSTR_DATA';
    plstrData = await cds.run(sqlStr);

    console.log("PLSTR_DATA rows", plstrData.length);

    // var plstrJson = JSON.stringify(plstrData);
    const salesDocBaseID = 900000;
    const salesDocItem = 50;
    const sheduledLineNum = 10;
    const uom = 'EA';

    
    for(let shIndex = 0; shIndex < plstrData.length; shIndex++)
    {
        let salesDocId = salesDocBaseID + plstrData[shIndex].UNIQUE_ID;

        // console.log("SALES_DOC ", salesDocId, "SALESDOC_ITEM ",salesDocItem,
        //             "SCHEDULELINE_NUM", sheduledLineNum,
        //             "DOC_CREATEDDATE ", plstrData[shIndex].START_DATE,
        //             "PRODUCT_ID ", plstrData[shIndex].PRODUCT_ID,
        //             "UOM ", uom,
        //             "CONFIRMED_QTY ",plstrData[shIndex].HANDOVERS_COUNT,
        //             "ORD_QTY ",plstrData[shIndex].HANDOVERS_COUNT,
        //             "MAT_AVAILDATE ",plstrData[shIndex].START_DATE,
        //             "CUSTOMER_GROUP ",plstrData[shIndex].COUNTRY + '_'+plstrData[shIndex].SALES_TYPE,
        //             "LOCATION_ID ",'PL20',
        //             "CREATED_BY ",'SBP',
        //             "CREATED_DATE ",plstrData[shIndex].START_DATE

        //             );

        let countryCode = plstrData[shIndex].COUNTRY ;
        let custGroup = '';
        if ( (countryCode == 'GB') ||
             (countryCode == 'AT') ||
             (countryCode == 'IS') ||
             (countryCode == 'NL') ||
             (countryCode == 'SE') ||
             (countryCode == 'BE') ||
             (countryCode == 'CH') ||
             (countryCode == 'DE') ||
             (countryCode == 'DK') ||
             (countryCode == 'FI') ||
             (countryCode == 'NO') ||
             (countryCode == 'LU') ||
             (countryCode == 'PT') ||
             (countryCode == 'ES') ||
             (countryCode == 'IE') )
        {
            custGroup = 'EU';
        }
        else if ((countryCode == 'US') ||
                 (countryCode == 'CA') )
        {
            custGroup = 'NA';
        }
        else if ((countryCode == 'NZ') ||
                 (countryCode == 'AU') ||
                 (countryCode == 'CN') )
        {
            custGroup = 'OS';
        }
        else if ((countryCode == 'SG') ||
                 (countryCode == 'KR') ||
                 (countryCode == 'HK'))
        {
            custGroup = 'SE';
        }       
        else if ((countryCode == 'KW') ||
                 (countryCode == 'AE') ||
                 (countryCode == 'IL'))
        {
            custGroup = 'OT';
        }

        sqlStr = 'UPSERT PLSTR_SALESH VALUES (' +
                    "'" + salesDocId + "'" + "," +
                    "'" + salesDocItem + "'" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "'" + sheduledLineNum + "'" + "," +
                    "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                    "''" + "," +
                    "'" + uom + "'" + "," +
                    "'" + plstrData[shIndex].HANDOVERS_COUNT + "'" + "," +
                    "'" + plstrData[shIndex].HANDOVERS_COUNT + "'" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "'" + 9999999 + "'" + "," +
                    "'" + custGroup + "'" + "," +
                    "'PL20'" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "''" + "," +
                    "'" + plstrData[shIndex].START_DATE + "'" + "," +
                    "'SBP'" + "," +
                    "''" + "," +
                    "''" +')' + ' WITH PRIMARY KEY';

        // console.log("PLSTR_SALESH VALUES sqlStr", sqlStr);

        let saleshResults = await cds.run(sqlStr);
        // console.log("PLSTR_SALESH  ", saleshResults);
        console.log("PLSTR_SALESH salesDoc ", salesDocId, "shIndex ",shIndex);

        let sqlSaleConfig = 'SELECT DISTINCT MODEL, MOTOR_CODE, DENOMINATION, SALES_VERSION_ID, BODY_VERSION, TRANSMISSION, STEERING, ' +
                            ' MARKET_CODE, EXTERIOR_ID, INTERIOR, OPT_WHEELS,  OPT_PERFORM, OPT_PLUS, OPT_PILOT, OPT_PILOT_LITE, OPT_TOWBAR' +
                            ' FROM PLSTR_DATA WHERE ' +  
                            ' UNIQUE_ID = ' + "'" + plstrData[shIndex].UNIQUE_ID + "'";
        
        // console.log(" sqlSaleConfig ", sqlSaleConfig);

        let salesConfigResults = await cds.run(sqlSaleConfig);
        // console.log(" salesConfigResults ", salesConfigResults);

        let sqlSalesCfgCharCharval = '';
        if( plstrData[shIndex].MODEL != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].MODEL + "'";        
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
   
        }

        if( plstrData[shIndex].MOTOR_CODE != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].MOTOR_CODE + "'";        
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
   
        }

        if( plstrData[shIndex].DENOMINATION != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].DENOMINATION + "'";        
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
   
        }
        // console.log(" sqlSalesCfgCharCharval ", sqlSalesCfgCharCharval);


        if( plstrData[shIndex].SALES_VERSION_ID != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].SALES_VERSION_ID + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        if( plstrData[shIndex].BODY_VERSION != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].BODY_VERSION + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].TRANSMISSION != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].TRANSMISSION + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].STEERING != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].STEERING + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].MARKET_CODE != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].MARKET_CODE + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        if( plstrData[shIndex].EXTERIOR_ID != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].EXTERIOR_ID + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].INTERIOR != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].INTERIOR + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].OPT_WHEELS != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_WHEELS + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].OPT_PERFORM != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PERFORM + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].OPT_PLUS != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PLUS + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].OPT_PILOT != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PILOT + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        if( plstrData[shIndex].OPT_PILOT_LITE != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PILOT_LITE + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        if( plstrData[shIndex].OPT_TOWBAR != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT PLSTR_SALESH_CONFIG ("SALES_DOC", "SALESDOC_ITEM", ' + 
                                     '"CHAR_NUM", "CHARVAL_NUM","PRODUCT_ID","CHANGED_DATE", ' +
                                     '"CREATED_DATE", "CREATED_BY" '+')' +
                                     ' SELECT ' + 
                                     "'" + salesDocId + "'" + "," +
                                     "'" + salesDocItem + "'" + "," +
                                     'charval."CHAR_NUM", charval."CHARVAL_NUM",' +
                                     "'" + plstrData[shIndex].PRODUCT_ID + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'" + plstrData[shIndex].START_DATE + "'" + "," +
                                     "'SBP'" +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_TOWBAR + "'";
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }
        // console.log(" sqlSalesCfgCharCharval ", sqlSalesCfgCharCharval);
        // console.log(" salesConfigResults ", sqlSalesCfgCharCharvalResults);
        // if (shIndex == 0)
        //      break;
        if( shIndex % 1000 == 0)
           await cds.run('COMMIT');
    }


    let custGrpSql  = 'UPSERT PLSTR_CUSTOMERGROUP ("CUSTOMER_GROUP", "CUSTOMER_DESC")' +
                        ' SELECT DISTINCT "CUSTOMER_GROUP" ,' +
                        ' CONCAT("CUSTOMER_GROUP", ' + '\' Customer \'' + ')' + 
                        ' FROM "PLSTR_SALESH" WHERE LOCATION_ID = ' + '\'PL20\'';
    console.log("custGrpSql = ", custGrpSql);
    let custGrpSqlResults = await cds.run(custGrpSql);
    console.log("custGrpSqlResults = ", custGrpSqlResults);


    let dataObj = {};
    dataObj["success"] = true;
    dataObj["message"] = "update Master Data Completed Successfully at " +  new Date();


    // if (req.headers['x-sap-job-id'] > 0)
    // {
    //     const scheduler = getJobscheduler(req);

    //     var updateReq = {
    //         jobId: req.headers['x-sap-job-id'],
    //         scheduleId: req.headers['x-sap-job-schedule-id'],
    //         runId: req.headers['x-sap-job-run-id'],
    //         data : dataObj
    //         };

    //         scheduler.updateJobRunLog(updateReq, function(err, result) {
    //         if (err) {
    //             return console.log('Error updating run log: %s', err);
    //         }

    //         });
    // }

  }


  async function _genPartialProducts(req,isGet) {

    var reqData = "Request for Partial Products Data Generation Queued Sucessfully";

    console.log("_genPartialProducts reqData : ", reqData);
    let createtAt = new Date();
    let id = uuidv1();
    let values = [];	
  
    values.push({id, createtAt, reqData});    

    if (isGet == true)
    {
        req.reply({values});
    }
    else
    {
        let res = req._.req.res;
        res.statusCode = 202;
        res.send({values});
    }

   

    let sqlStr = 'select * FROM PLSTR_DATA';
    plstrData = await cds.run(sqlStr);

    console.log("PLSTR_DATA rows", plstrData.length);

    // var plstrJson = JSON.stringify(plstrData);
    const salesDocBaseID = 900000;
    const salesDocItem = 50;
    const sheduledLineNum = 10;
    const uom = 'EA';

    let sqlPartialProdIntro = 'UPSERT CP_PARTIALPROD_INTRO (PRODUCT_ID, LOCATION_ID, REF_PRODID)' +
                            ' SELECT DISTINCT PLD."PNO12_PRODUCT", CLP."LOCATION_ID",CLP."PRODUCT_ID" FROM "CP_LOCATION_PRODUCT" AS CLP ' +
                            ' INNER JOIN CP_SALESH AS CPSH ON ' +
                            ' CLP.LOCATION_ID = CPSH.LOCATION_ID AND ' +
                            ' CLP.PRODUCT_ID = CPSH.PRODUCT_ID ' +
                            ' INNER JOIN PLSTR_DATA PLD ON ' +
                            ' CLP.PRODUCT_ID = PLD.PRODUCT_ID ' +
                            ' WHERE CLP.LOCATION_ID =' + '\'PL20\'';
    // console.log("sqlPartialProdIntro ", sqlPartialProdIntro);

    let sqlPartialProdIntroResults = await cds.run(sqlPartialProdIntro);

                    
    for(let shIndex = 0; shIndex < plstrData.length; shIndex++)
    {
        let salesDocId = salesDocBaseID + plstrData[shIndex].UNIQUE_ID;
        console.log(" Partial Products Gen for salesDocId", salesDocId, " shIndex ", shIndex, " Partial Product ", plstrData[shIndex].PNO12_PRODUCT);

        let sqlSaleConfig = 'SELECT DISTINCT MODEL, MOTOR_CODE, DENOMINATION, SALES_VERSION_ID, BODY_VERSION, TRANSMISSION, STEERING, ' +
                            ' MARKET_CODE, EXTERIOR_ID, INTERIOR, OPT_WHEELS,  OPT_PERFORM, OPT_PLUS, OPT_PILOT, OPT_PILOT_LITE, OPT_TOWBAR' +
                            ' FROM PLSTR_DATA WHERE ' +  
                            ' UNIQUE_ID = ' + "'" + plstrData[shIndex].UNIQUE_ID + "'";
        
        // console.log(" sqlSaleConfig ", sqlSaleConfig);

        let salesConfigResults = await cds.run(sqlSaleConfig);
        // console.log(" salesConfigResults ", salesConfigResults);

        let sqlSalesCfgCharCharval = '';
        // console.log(" plstrData MODEL ", plstrData[shIndex].MODEL);

        if( plstrData[shIndex].MODEL != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].MODEL + "'" + ' AND ' +
                                     ' charc."CHAR_GROUP" = ' + '\'PARTIAL\'';        
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
   
        }

        // console.log(" plstrData MOTOR_CODE ", plstrData[shIndex].MOTOR_CODE);

        if( plstrData[shIndex].MOTOR_CODE != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].MOTOR_CODE + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
   
        }

        // console.log(" plstrData DENOMINATION ", plstrData[shIndex].DENOMINATION);

        if( plstrData[shIndex].DENOMINATION != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].DENOMINATION + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
   
        }
        // console.log(" sqlSalesCfgCharCharval ", sqlSalesCfgCharCharval);

        // console.log(" plstrData SALES_VERSION_ID ", plstrData[shIndex].SALES_VERSION_ID);

        if( plstrData[shIndex].SALES_VERSION_ID != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].SALES_VERSION_ID + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);
        }

        // console.log(" plstrData BODY_VERSION ", plstrData[shIndex].BODY_VERSION);

        if( plstrData[shIndex].BODY_VERSION != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].BODY_VERSION + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        // console.log(" plstrData TRANSMISSION ", plstrData[shIndex].TRANSMISSION);

        if( plstrData[shIndex].TRANSMISSION != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].TRANSMISSION + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        // console.log(" plstrData STEERING ", plstrData[shIndex].STEERING);

        if( plstrData[shIndex].STEERING != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].STEERING + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';            
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        // console.log(" plstrData MARKET_CODE ", plstrData[shIndex].MARKET_CODE);

        if( plstrData[shIndex].MARKET_CODE != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].MARKET_CODE + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        // console.log(" plstrData EXTERIOR_ID ", plstrData[shIndex].EXTERIOR_ID);

        if( plstrData[shIndex].EXTERIOR_ID != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].EXTERIOR_ID + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        // console.log(" plstrData INTERIOR ", plstrData[shIndex].INTERIOR);

        if( plstrData[shIndex].INTERIOR != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].INTERIOR + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        // console.log(" plstrData OPT_WHEELS ", plstrData[shIndex].OPT_WHEELS);

        if( plstrData[shIndex].OPT_WHEELS != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_WHEELS + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        // console.log(" plstrData OPT_PERFORM ", plstrData[shIndex].OPT_PERFORM);

        if( plstrData[shIndex].OPT_PERFORM != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PERFORM + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }


        // console.log(" plstrData OPT_PLUS ", plstrData[shIndex].OPT_PLUS);

        if( plstrData[shIndex].OPT_PLUS != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PLUS + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';          
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        // console.log(" plstrData OPT_PILOT ", plstrData[shIndex].OPT_PILOT);

        if( plstrData[shIndex].OPT_PILOT != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PILOT + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        // console.log(" plstrData OPT_PILOT_LITE ", plstrData[shIndex].OPT_PILOT_LITE);

        if( plstrData[shIndex].OPT_PILOT_LITE != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_PILOT_LITE + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }

        // console.log(" plstrData OPT_TOWBAR ", plstrData[shIndex].OPT_TOWBAR);

        if( plstrData[shIndex].OPT_TOWBAR != 'NULL')
        {
            sqlSalesCfgCharCharval = 'UPSERT CP_PARTIALPROD_CHAR ("PRODUCT_ID", "LOCATION_ID", ' + 
                                     '"CLASS_NUM", "CHAR_NUM","CHARVAL_NUM" '+')' +
                                     ' SELECT ' + 
                                     "'" + plstrData[shIndex].PNO12_PRODUCT + "'" + "," +
                                     "'PL20'" + "," +
                                     "'" + 55555 + "'" + "," +
                                     ' charval.CHAR_NUM ' + "," +
                                     ' charval.CHARVAL_NUM ' +
                                     ' FROM PLSTR_CHARACTERISTICS AS charc' +
                                     ' INNER JOIN PLSTR_CHAR_VALUES AS charval ON '+
                                     ' charc.CHAR_NUM = charval.CHAR_NUM' + 
                                     ' WHERE charval.CHAR_VALUE = ' +  "'" + plstrData[shIndex].OPT_TOWBAR + "'" + ' AND ' +
                                     'charc.CHAR_GROUP = ' + '\'PARTIAL\'';           
            let sqlSalesCfgCharCharvalResults = await cds.run(sqlSalesCfgCharCharval);

        }
        // console.log(" sqlSalesCfgCharCharval ", sqlSalesCfgCharCharval);
        // console.log(" salesConfigResults ", sqlSalesCfgCharCharvalResults);
        // if (shIndex == 0)
        //      break;
        if( shIndex % 1000 == 0)
           await cds.run('COMMIT');
    }



    let dataObj = {};
    dataObj["success"] = true;
    dataObj["message"] = "update Partial Products Data Completed Successfully at " +  new Date();


    // if (req.headers['x-sap-job-id'] > 0)
    // {
    //     const scheduler = getJobscheduler(req);

    //     var updateReq = {
    //         jobId: req.headers['x-sap-job-id'],
    //         scheduleId: req.headers['x-sap-job-schedule-id'],
    //         runId: req.headers['x-sap-job-run-id'],
    //         data : dataObj
    //         };

    //         scheduler.updateJobRunLog(updateReq, function(err, result) {
    //         if (err) {
    //             return console.log('Error updating run log: %s', err);
    //         }

    //         });
    // }

  }


  async function _genTimeSeries(req,isGet) {

    var reqData = "Request for Timeseries Generation Queued Sucessfully";

    console.log("_genTimeSeries reqData : ", reqData);
    let createtAt = new Date();
    let id = uuidv1();
    let values = [];	
  
    values.push({id, createtAt, reqData});    

    if (isGet == true)
    {
        req.reply({values});
    }
    else
    {
        let res = req._.req.res;
        res.statusCode = 202;
        res.send({values});
    }

   

    // let sqlStr = 'SELECT DISTINCT PRODUCT_ID, LOCATION_ID, PRIMARY_CHARS_STR, PRIMARY_CHARVALS_STR  FROM V_PLSTR_PRIMARY_TS' +
    //              ' ORDER BY PRODUCT_ID';
    // console.log("sqlPrimary ", sqlStr ) ;

    // let sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, PARTIAL_ID, PRIMARY_ID_CHARS, PRIMARY_ID_CHARVALS ' +
    //              ' FROM V_PLSTR_PARTIAL_PRIMARY_BY_SALESDOC' +
    //              ' ORDER BY LOCATION_ID, PRODUCT_ID, PARTIAL_ID';

    let sqlStr =    ' SELECT DISTINCT LOCATION_ID, PRODUCT_ID, PARTIAL_ID, PRIMARY_ID_CHARS, PRIMARY_ID_CHARVALS,' +
                    ' PARTIAL_ID_CHARS, PARTIAL_ID_CHARVALS ' +
                    ' FROM V_PLSTR_SALESH_W_PARTIALPRODID ' +
                    ' ORDER BY LOCATION_ID, PRODUCT_ID, PARTIAL_ID';
    console.log("sqlPrimary ", sqlStr ); 
    
    let sqlPrimaryResults = await cds.run(sqlStr);
    console.log("sqlPrimaryResults ", sqlPrimaryResults);

    for (let priIndex = 0; priIndex < sqlPrimaryResults.length; priIndex++)
    {
        let str = JSON.stringify(sqlPrimaryResults[priIndex]);
        let obj = JSON.parse(str);
        let arrayVals = Object.values(obj);
        // console.log("arrayVals ", arrayVals);
        // let primary_id = arrayVals[0] + '_' + 'P' + priIndex;
        let locationId = arrayVals[0];
        let productId = arrayVals[1];
        let partialId = arrayVals[2];
        let primaryIdChars = arrayVals[3];
        let primaryIdCharVals = arrayVals[4];
        let partialIdChars = arrayVals[5];
        let partialIdCharVals = arrayVals[6];


        // let primary_id = arrayVals[0] + '_' + priIndex + 1;
        let primary_id = partialId + '_' + priIndex + 1;

        // console.log ("priIndex ", priIndex, "PrimaryId ", primary_id, 
        //              "primary_chars_str ",arrayVals[2],
        //              "primary_charvals_str ",arrayVals[3]);

        console.log ("priIndex ", priIndex, "PrimaryId ", primary_id, 
                        "primary_chars ",primaryIdChars,
                        "primaryIdCharVals ",primaryIdCharVals);




        // sqlStr = 'UPSERT PLSTR_PRIMARY_IDS VALUES (' +
        // "'" + arrayVals[0] + "'" + "," +
        // "'" + arrayVals[1] + "'" + "," +
        // "'" + primary_id + "'" + "," +
        // "'" + arrayVals[2] + "'" + "," +
        // "'" + arrayVals[3] + "'" +')' + ' WITH PRIMARY KEY';

        // sqlStr = 'UPSERT PLSTR_PRIMARY_IDS VALUES (' +
        //             "'" + productId + "'" + "," +
        //             "'" + locationId + "'" + "," +
        //             "'" + primary_id + "'" + "," +
        //             "'" + partialIdChars + "'" + "," +
        //             "'" + partialIdCharVals + "'" + "," +
        //             "'" + primaryIdChars + "'" + "," +
        //             "'" + primaryIdCharVals + "'" +')' + ' WITH PRIMARY KEY';

        
        sqlStr = 'UPSERT PLSTR_PRIMARY_IDS VALUES (' +
                    "'" + partialId + "'" + "," +
                    "'" + locationId + "'" + "," +
                    "'" + primary_id + "'" + "," +
                    "'" + partialIdChars + "'" + "," +
                    "'" + partialIdCharVals + "'" + "," +
                    "'" + primaryIdChars + "'" + "," +
                    "'" + primaryIdCharVals + "'" +')' + ' WITH PRIMARY KEY';

        console.log("PLSTR_PRIMARY_IDS sqlStr", sqlStr);

        let plstrPrimaryIdResults = await cds.run(sqlStr);
        console.log("PLSTR_PRIMARY_IDS  plstrPrimaryIdResults", plstrPrimaryIdResults);

    }

    // sqlStr =  'SELECT DISTINCT CHARVALS FROM PLSTR_SALESH_BY_CHARS_CHAVALS ORDER BY CHARVALS ASC';
    // console.log("PLSTR_SALESH_BY_CHARS_CHAVALS sqlStr", sqlStr);
    // let sqlStrResults = await cds.run(sqlStr);
    // console.log("PLSTR_SALESH_BY_CHARS_CHAVALS  sqlStrResults", sqlStrResults);

    // for (let uniqueIndex = 0; uniqueIndex < sqlStrResults.length; uniqueIndex++)
    // {


    // }
    // // sqlStr = 'SELECT DISTINCT WEEKDATE, PRODUCT_ID, LOCATION_ID, PRIMARY_ID, ORDER_QTY, PRIMARY_ID_CHARVALS FROM V_PLSTR_PRIMARY_CHARS_CHARVALS_TS';
    //             //  ' WHERE WEEKDATE = ' + '\'2020-06-29\'';
    
    // sqlStr = 'SELECT DISTINCT WEEKDATE, PRODUCT_ID, LOCATION_ID, PRIMARY_ID, ORDER_QTY, PRIMARY_ID_CHARVALS FROM V_PLSTR_PRIMARY_CHARS_CHARVALS_TS';
    // sqlStr = 'SELECT DISTINCT WEEKDATE, PRODUCT_ID, LOCATION_ID, PRIMARY_ID, ORDER_QTY, PRIMARY_ID_CHARVALS FROM V_PLSTR_PRIMARY_TIMESERIES';
    sqlStr = 'SELECT DISTINCT WEEKDATE, PARTIAL_ID, LOCATION_ID, PRIMARY_ID, ORDER_QTY, PRIMARY_ID_CHARVALS FROM V_PLSTR_PRIMARY_TIMESERIES';

    
    // console.log("sqlPrimary ", sqlStr )
    sqlPrimaryResults = await cds.run(sqlStr);
    console.log("sqlPrimaryResults length ", sqlPrimaryResults.length);


    for (let priIndex = 0; priIndex < sqlPrimaryResults.length; priIndex++)
    {
        let str = JSON.stringify(sqlPrimaryResults[priIndex]);
        let obj = JSON.parse(str);
        let arrayKeys = Object.keys(obj);
        let arrayVals = Object.values(obj);
        console.log("PRIMARY_ID_CHARVALS INDEX ", priIndex+1, "TOTAL PRIMARY_ID_CHARVALS ", sqlPrimaryResults.length);
        if( priIndex % 1000 == 0)
            await cds.run('COMMIT');
        // console.log("arrayKeys ", arrayKeys, "arrayVals", arrayVals);
        for (let arrayIndex = 0; arrayIndex < arrayKeys.length; arrayIndex++)
        {

            // console.log("arrayKey ", arrayKeys[arrayIndex], "arrayVal ", arrayVals[arrayIndex]);
            if (arrayKeys[arrayIndex] == 'PRIMARY_ID_CHARVALS')
            {
                let charVals = arrayVals[arrayIndex].split(',');
                for (let charIndex = 0; charIndex < charVals.length; charIndex++)
                {
                    // console.log(" charIndex ", charIndex, "charVals ", charVals[charIndex]);

                    sqlStr = 'UPSERT PLSTR_PRIMARY_TIMESERIES VALUES (' +
                    "'" + arrayVals[0] + "'" + "," +
                    "'" + arrayVals[1] + "'" + "," +
                    "'" + arrayVals[2] + "'" + "," +
                    "'" + arrayVals[3] + "'" + "," +
                    "'" + charVals[charIndex] + "'" + "," +
                    "'" + arrayVals[4] + "'" +')' + ' WITH PRIMARY KEY';

                    // console.log("PLSTR_PRIMARY_TIMESERIES sqlStr", sqlStr);

                    let primaryTsResults = await cds.run(sqlStr);
                    // console.log("PLSTR_PRIMARY_TIMESERIES  ", primaryTsResults);
                }

            }
        }
    }

    let dataObj = {};
    dataObj["success"] = true;
    dataObj["message"] = "update Partial Products Data Completed Successfully at " +  new Date();


    // if (req.headers['x-sap-job-id'] > 0)
    // {
    //     const scheduler = getJobscheduler(req);

    //     var updateReq = {
    //         jobId: req.headers['x-sap-job-id'],
    //         scheduleId: req.headers['x-sap-job-schedule-id'],
    //         runId: req.headers['x-sap-job-run-id'],
    //         data : dataObj
    //         };

    //         scheduler.updateJobRunLog(updateReq, function(err, result) {
    //         if (err) {
    //             return console.log('Error updating run log: %s', err);
    //         }

    //         });
    // }

    }


    async function _genPrimeAndUqiue(req,isGet) {

        var reqData = "Request for PRimary And Unique IDs generation Queued Sucessfully";
    
        console.log("_genPrimeAndUqiue reqData : ", reqData);
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];	
      
        values.push({id, createtAt, reqData});    
    
        if (isGet == true)
        {
            req.reply({values});
        }
        else
        {
            let res = req._.req.res;
            res.statusCode = 202;
            res.send({values});
        }
    
       
    
        // let sqlStr ='UPSERT PLSTR_PRODUCT_ID_CHARVALS ("REF_PRODUCT", "LOCATION_ID", "TYPE", "PRODUCT_ID", "CLASS_NUM", "CHARVAL_NUM")' +
        let sqlStr ='UPSERT PLSTR_PRODUCT_ID_CHARVALS ("PRODUCT_ID", "LOCATION_ID", "TYPE", "PRIMARY_ID", "CLASS_NUM", "CHARVAL_NUM")' +
        ' SELECT DISTINCT PRODUCT_ID,LOCATION_ID, \'PRIMARY\',PRIMARY_ID, CLASS_NUM , CHARVAL_NUM FROM "V_PLSTR_PROD_PARTIAL_CHARVALS"';
        console.log("PLSTR_PRODUCT_ID_CHARVALS sqlStr ", sqlStr);

        let results = await cds.run(sqlStr);
        console.log("PLSTR_PRODUCT_ID_CHARVALS results ", results);

        // sqlStr ='UPSERT PLSTR_PRODUCT_ID_CHARVALS ("REF_PRODUCT", "LOCATION_ID", "TYPE", "PRODUCT_ID", "CLASS_NUM", "CHARVAL_NUM")' +
        sqlStr ='UPSERT PLSTR_PRODUCT_ID_CHARVALS ("PRODUCT_ID", "LOCATION_ID", "TYPE", "PRIMARY_ID", "CLASS_NUM", "CHARVAL_NUM")' +
        ' SELECT DISTINCT PRODUCT_ID,LOCATION_ID,  \'PRIMARY\',PRIMARY_ID, CLASS_NUM , CHARVAL_NUM FROM "V_PLSTR_PROD_PRIMARY_CHARVALS"';
        console.log("PLSTR_PRODUCT_ID_CHARVALS sqlStr ", sqlStr);

        results = await cds.run(sqlStr);
        console.log("PLSTR_PRODUCT_ID_CHARVALS results ", results);


    }


    async function _genTsForPrimary(req,isGet) {

        var reqData = "Request for TImeseries Generation for Primary IDs Queued Sucessfully";
    
        console.log("_genTsForPrimary reqData : ", reqData);
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];	
      
        values.push({id, createtAt, reqData});    
    
        if (isGet == true)
        {
            req.reply({values});
        }
        else
        {
            let res = req._.req.res;
            res.statusCode = 202;
            res.send({values});
        }
    
       
    
        let sqlStr = 'SELECT DISTINCT WEEKDATE, PRODUCT_ID, LOCATION_ID, PRIMARY_ID ' +
                      ' FROM PLSTR_PRIMARY_TIMESERIES ' +
                      ' ORDER BY WEEKDATE, PRODUCT_ID, LOCATION_ID, PRIMARY_ID';
        console.log("sqlPrimary ", sqlStr )
        let sqlPrimaryResults = await cds.run(sqlStr);
        console.log("sqlPrimaryResults ", sqlPrimaryResults);
    
        for (let priIndex = 0; priIndex < sqlPrimaryResults.length; priIndex++)
        {
            let str = JSON.stringify(sqlPrimaryResults[priIndex]);
            let obj = JSON.parse(str);
            let arrayVals = Object.values(obj);
            // console.log("arrayVals ", arrayVals);
            let weekdate = arrayVals[0];
            let productId = arrayVals[1];
            let locationId = arrayVals[2];
            let primaryId = arrayVals[3];


    
            let sqlStrCharval = ' SELECT DISTINCT WEEKDATE, PRODUCT_ID, LOCATION_ID, PRIMARY_ID, CHAR_VALUE ' +
                     ' FROM PLSTR_PRIMARY_TIMESERIES ' +
                     ' WHERE ' +
                     ' WEEKDATE = ' + "'"  + weekdate + "'" + ' AND ' + 
                     ' PRODUCT_ID = ' + "'"  + productId + "'" + ' AND ' + 
                     ' LOCATION_ID = ' + "'"  + locationId + "'" + ' AND ' + 
                     ' PRIMARY_ID = ' + "'"  + primaryId + "'" + 
                     ' ORDER BY WEEKDATE, PRODUCT_ID, LOCATION_ID, PRIMARY_ID, CHAR_VALUE';
            
            // console.log ("sqlStrCharval PLSTR_PRIMARY_TIMESERIES ", sqlStrCharval);
    
            let sqlStrCharvalResults = await cds.run(sqlStrCharval);
            // console.log("PLSTR_PRIMARY_TIMESERIES  sqlStrCharvalResults", sqlStrCharvalResults);

            // let sqlPrimOrdQtyProduct = 'SELECT DISTINCT WEEKDATE, PRODUCT_ID, LOCATION_ID, SUM(ORDER_QTY) AS SUCCESS ' +
            //                         ' FROM V_PLSTR_PRIMARYID_TS ' +
            //                         ' WHERE ' +
            //                         ' WEEKDATE = ' + "'"  + weekdate + "'" + ' AND ' + 
            //                         ' PRODUCT_ID = ' + "'"  + productId + "'" + ' AND ' + 
            //                         ' LOCATION_ID = ' + "'"  + locationId + "'" + ' AND ' +
            //                         ' PRIMARY_ID = ' + "'"  + primaryId + "'" + 
            //                         ' GROUP BY WEEKDATE, PRODUCT_ID, LOCATION_ID ' +
            //                         ' ORDER BY WEEKDATE, PRODUCT_ID, LOCATION_ID';
            let sqlPrimOrdQtyProduct = 'SELECT DISTINCT WEEKDATE, PARTIAL_ID, LOCATION_ID, SUM(ORDER_QTY) AS SUCCESS ' +
                                        ' FROM V_PLSTR_PRIMARY_TIMESERIES ' +
                                        ' WHERE ' +
                                        ' WEEKDATE = ' + "'"  + weekdate + "'" + ' AND ' + 
                                        ' PARTIAL_ID = ' + "'"  + productId + "'" + ' AND ' + 
                                        ' LOCATION_ID = ' + "'"  + locationId + "'" + ' AND ' +
                                        ' PRIMARY_ID = ' + "'"  + primaryId + "'" + 
                                        ' GROUP BY WEEKDATE, PARTIAL_ID, LOCATION_ID ' +
                                        ' ORDER BY WEEKDATE, PARTIAL_ID, LOCATION_ID';
            // console.log ("sqlPrimOrdQtyProduct V_PLSTR_PRIMARY_TIMESERIES ", sqlPrimOrdQtyProduct);

            let sqlPrimOrdQtyProductResults = await cds.run(sqlPrimOrdQtyProduct);
            // console.log("V_PLSTR_PRIMARY_TIMESERIES  sqlPrimOrdQtyProductResults", sqlPrimOrdQtyProductResults);
            
            if (sqlPrimOrdQtyProductResults.length > 0)
            {
                str = JSON.stringify(sqlPrimOrdQtyProductResults[0]);
                obj = JSON.parse(str);
                arrayVals = Object.values(obj);

                let ordQtyPrimary = arrayVals[3];


                let sqOrdQtyProduct = 'SELECT DISTINCT WEEKDATE, PARTIAL_ID, LOCATION_ID, SUM(ORDER_QTY) AS SUCCESS ' +
                                        ' FROM V_PLSTR_PRIMARY_TIMESERIES ' +
                                        ' WHERE ' +
                                        ' WEEKDATE = ' + "'"  + weekdate + "'" + ' AND ' + 
                                        ' PARTIAL_ID = ' + "'"  + productId + "'" + ' AND ' + 
                                        ' LOCATION_ID = ' + "'"  + locationId + "'" +
                                        ' GROUP BY WEEKDATE, PARTIAL_ID, LOCATION_ID ' +
                                        ' ORDER BY WEEKDATE, PARTIAL_ID, LOCATION_ID';
                // console.log ("sqOrdQtyProduct V_PLSTR_PRIMARY_TIMESERIES ", sqOrdQtyProduct);

                let sqlOrdQtyProductResults = await cds.run(sqOrdQtyProduct);
                // console.log("V_PLSTR_PRIMARYID_TS  sqlOrdQtyProductResults", sqlOrdQtyProductResults);
                
                str = JSON.stringify(sqlOrdQtyProductResults[0]);
                obj = JSON.parse(str);
                arrayVals = Object.values(obj);
                // weekdate = arrayVals[0];
                // productId = arrayVals[1];
                // locationId = arrayVals[2];
                let ordQtyProduct = arrayVals[3];

                let objType = 'PI';
                let objId = primaryId.split('_');
                let objDep = objId[0];
                let objCounter = objId[1];

                let sqlStrObjdepHdr = 'UPSERT CP_TS_OBJDEPHDR VALUES (' +
                            "'" + weekdate + "'" + "," +
                            "'" + locationId + "'" + "," +
                            "'" + productId + "'" + "," +
                            "'" + objType + "'" + "," +
                            "'" + objDep + "'" + "," +
                            "'" + parseInt(objCounter) + "'" + "," +
                            "'" + parseFloat(ordQtyPrimary) + "'" + "," +
                            "'" + 100*parseFloat(ordQtyPrimary)/parseFloat(ordQtyProduct) + "'" +')' + ' WITH PRIMARY KEY';

                console.log("CP_TS_OBJDEPHDR sqlStr", sqlStrObjdepHdr);

                let sqlStrObjdepHdrResults = await cds.run(sqlStrObjdepHdr);
                console.log("CP_TS_OBJDEPHDR  ", sqlStrObjdepHdrResults);

                for (let charIndex = 0; charIndex < sqlStrCharvalResults.length; charIndex++)
                {
                    let rowId = charIndex + 1;
                    str = JSON.stringify(sqlStrCharvalResults[charIndex]);
                    obj = JSON.parse(str);
                    arrayVals = Object.values(obj);
                    weekdate = arrayVals[0];
                    productId = arrayVals[1];
                    locationId = arrayVals[2];
                    let charVal = arrayVals[4];
                    let sqlStrCharvalCount = 
                        'SELECT WEEKDATE, PRODUCT_ID, LOCATION_ID, CHAR_VALUE, SUM(ORD_QTY) AS SUCCESS ' +
                        ' FROM PLSTR_PRIMARY_TIMESERIES ' +
                        ' WHERE ' +
                        ' WEEKDATE = ' + "'"  + weekdate + "'" + ' AND ' + 
                        ' PRODUCT_ID = ' + "'"  + productId + "'" + ' AND ' + 
                        ' LOCATION_ID = ' + "'"  + locationId + "'" + ' AND ' +
                        ' CHAR_VALUE = ' + "'"  + charVal + "'" +
                        ' GROUP BY WEEKDATE, PRODUCT_ID, LOCATION_ID, CHAR_VALUE ' +
                        ' ORDER BY WEEKDATE, PRODUCT_ID, LOCATION_ID, CHAR_VALUE';
                    
                    // console.log ("sqlStrCharvalCount PLSTR_PRIMARY_TIMESERIES ", sqlStrCharvalCount);

                    let sqlStrCharvalCountResults = await cds.run(sqlStrCharvalCount);
                    // console.log("PLSTR_PRIMARY_TIMESERIES  sqlStrCharvalCountResults", sqlStrCharvalCountResults);
            
                    str = JSON.stringify(sqlStrCharvalCountResults[0]);
                    obj = JSON.parse(str);
                    arrayVals = Object.values(obj);
                    weekdate = arrayVals[0];
                    productId = arrayVals[1];
                    locationId = arrayVals[2];
                    charVal = arrayVals[3];
                    let success = arrayVals[4];
                    // let successRate = (100.0*success)/ordQtyPrimary;
                    let successRate = (100.0*success)/ordQtyProduct;
                    // let objType = 'PI';
                    // let objId = primaryId.split('_');
                    // let objDep = objId[0];
                    // let objCounter = objId[1];
                    
                    console.log("PR_INDEX ",priIndex, "Primary ID Counts ", sqlPrimaryResults.length);
                    // console.log("CAL_DATE ", weekdate, "LOCATION_ID ", locationId, "PRODUCT_ID ", productId, 
                    //             "OBJ_TYPE ", objType, "OBJ_DEP", objDep, "OBJ_COUNTER ", objCounter,
                    //             "ROW_ID ", rowId, "SUCCESS ", success, "SUCCESS_RATE ", successRate);

                    if( priIndex % 100 == 0)
                        await cds.run('COMMIT');

                    let sqlStrObjdepCharHdr = 'UPSERT CP_TS_OBJDEP_CHARHDR VALUES (' +
                            "'" + weekdate + "'" + "," +
                            "'" + locationId + "'" + "," +
                            "'" + productId + "'" + "," +
                            "'" + objType + "'" + "," +
                            "'" + objDep + "'" + "," +
                            "'" + parseInt(objCounter) + "'" + "," +
                            "'" + rowId + "'" + "," +
                            "'" + parseFloat(success) + "'" + "," +
                            "'" + parseFloat(successRate) + "'" +')' + ' WITH PRIMARY KEY';

                    // console.log("CP_TS_OBJDEP_CHARHDR sqlStr", sqlStrObjdepCharHdr);

                    let sqlStrObjdepCharHdrResults = await cds.run(sqlStrObjdepCharHdr);
                    // console.log("CP_TS_OBJDEP_CHARHDR  ", sqlStrObjdepCharHdrResults);
                }

            }

    
        }
    
    
        let dataObj = {};
        dataObj["success"] = true;
        dataObj["message"] = "update Partial Products Data Completed Successfully at " +  new Date();
    
    
        // if (req.headers['x-sap-job-id'] > 0)
        // {
        //     const scheduler = getJobscheduler(req);
    
        //     var updateReq = {
        //         jobId: req.headers['x-sap-job-id'],
        //         scheduleId: req.headers['x-sap-job-schedule-id'],
        //         runId: req.headers['x-sap-job-run-id'],
        //         data : dataObj
        //         };
    
        //         scheduler.updateJobRunLog(updateReq, function(err, result) {
        //         if (err) {
        //             return console.log('Error updating run log: %s', err);
        //         }
    
        //         });
        // }
    
        }


    async function _genFutureTsForPrimary(req,isGet) {

        var reqData = "Request for Future Timeseries Generation for Primary IDs Queued Sucessfully";
    
        console.log("_genFutureTsForPrimary reqData : ", reqData);
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];	
        
        values.push({id, createtAt, reqData});    
    
        if (isGet == true)
        {
            req.reply({values});
        }
        else
        {
            let res = req._.req.res;
            res.statusCode = 202;
            res.send({values});
        }

        // let sqlFuturePrimarIds = 'SELECT DISTINCT WEEK_DATE, LOCATION_ID, REF_PRODID, PARTIAL_ID, PRIMARY_ID, CLASS_NUM,' +
        //                         ' VERSION, SCENARIO FROM V_PLSTR_IBP_FUTURE_TS ' +
        //                         'ORDER BY  WEEK_DATE, LOCATION_ID, REF_PRODID, PARTIAL_ID, PRIMARY_ID, CLASS_NUM, VERSION, SCENARIO ASC';

        // let sqlFuturePrimarIds = 'SELECT DISTINCT WEEK_DATE, LOCATION_ID, REF_PRODUCT, PRODUCT_ID, PRIMARY_ID, CLASS_NUM,' +
        let sqlFuturePrimarIds = 'SELECT DISTINCT WEEK_DATE, LOCATION_ID, PRODUCT_ID, PRIMARY_ID, CLASS_NUM,' +
                                ' VERSION, SCENARIO FROM V_PLSTR_IBP_FCHAR_BY_PRIMARY ' +
                                'ORDER BY  WEEK_DATE, LOCATION_ID, PRODUCT_ID, PRIMARY_ID, CLASS_NUM, VERSION, SCENARIO ASC';
        console.log("sqlStrsqlStrIbpFuture ", sqlFuturePrimarIds )
        let sqlFuturePrimarIdsResults = await cds.run(sqlFuturePrimarIds);
        // console.log("sqlFuturePrimarIdsResults ", sqlFuturePrimarIdsResults);

        for (let primaryIdx = 0; primaryIdx < sqlFuturePrimarIdsResults.length; primaryIdx++)
        {

            let str = JSON.stringify(sqlFuturePrimarIdsResults[primaryIdx]);
            let obj = JSON.parse(str);
            let arrayVals = Object.values(obj);
            let weekdate = arrayVals[0];
            let locationId = arrayVals[1];
            // let refProduct = arrayVals[2];
            let productId = arrayVals[2];
            let primaryId = arrayVals[3];
            let objdep_counter = primaryId.split('_');
            let objDep = objdep_counter[0];
            let objCounter = objdep_counter[1];
            let classNum = arrayVals[4];
            let version = arrayVals[5];
            let scenario = arrayVals[6];
            let objType = 'PI';

            // let sqlPrimaryIdCharvals = 'SELECT DISTINCT WEEK_DATE, LOCATION_ID, REF_PRODID, PARTIAL_ID, PRIMARY_ID, CLASS_NUM,' +
            //                     ' VERSION, SCENARIO, CHARVAL_NUM, OPT_PERCENT, OPT_QTY FROM V_PLSTR_IBP_FUTURE_TS ' +
            
            // let sqlPrimaryIdCharvals =  'SELECT DISTINCT WEEK_DATE, LOCATION_ID, REF_PRODUCT, PRODUCT_ID, PRIMARY_ID, CLASS_NUM,' +
            //                     ' VERSION, SCENARIO, CHARVAL_NUM, OPT_PERCENT, OPT_QTY FROM V_PLSTR_IBP_FCHAR_BY_PRIMARY ' +
            //                     ' WHERE ' +
            //                     ' WEEK_DATE = ' + "'"  + weekdate + "'" + ' AND ' + 
            //                     ' LOCATION_ID = ' + "'"  + locationId + "'" + ' AND ' + 
            //                     ' REF_PRODUCT = ' + "'"  + refProduct + "'" + ' AND ' + 
            //                     ' PRODUCT_ID = ' + "'"  + productId + "'" + ' AND ' + 
            //                     ' PRIMARY_ID = ' + "'"  + primaryId + "'" + ' AND ' + 
            //                     ' CLASS_NUM = ' + "'"  + classNum + "'" + ' AND ' + 
            //                     ' VERSION = ' + "'"  + version + "'" + ' AND ' + 
            //                     ' SCENARIO = ' + "'"  + scenario + "'" + 
            //                     ' ORDER BY WEEK_DATE, LOCATION_ID, REF_PRODUCT, PRODUCT_ID, PRIMARY_ID, CLASS_NUM, ' +
            //                     ' VERSION, SCENARIO, CHARVAL_NUM';

            let sqlPrimaryIdCharvals =  'SELECT DISTINCT WEEK_DATE, LOCATION_ID, PRODUCT_ID, PRIMARY_ID, CLASS_NUM,' +
                                        ' VERSION, SCENARIO, CHARVAL_NUM, OPT_PERCENT, OPT_QTY FROM V_PLSTR_IBP_FCHAR_BY_PRIMARY ' +
                                        ' WHERE ' +
                                        ' WEEK_DATE = ' + "'"  + weekdate + "'" + ' AND ' + 
                                        ' LOCATION_ID = ' + "'"  + locationId + "'" + ' AND ' + 
                                        ' PRODUCT_ID = ' + "'"  + productId + "'" + ' AND ' + 
                                        ' PRIMARY_ID = ' + "'"  + primaryId + "'" + ' AND ' + 
                                        ' CLASS_NUM = ' + "'"  + classNum + "'" + ' AND ' + 
                                        ' VERSION = ' + "'"  + version + "'" + ' AND ' + 
                                        ' SCENARIO = ' + "'"  + scenario + "'" + 
                                        ' ORDER BY WEEK_DATE, LOCATION_ID, PRODUCT_ID, PRIMARY_ID, CLASS_NUM, ' +
                                        ' VERSION, SCENARIO, CHARVAL_NUM';
            
            // console.log("sqlPrimaryIdCharvals ", sqlPrimaryIdCharvals )
            let sqlPrimaryIdCharvalsResults = await cds.run(sqlPrimaryIdCharvals);
            // console.log("sqlPrimaryIdCharvals ", sqlPrimaryIdCharvalsResults);
            // console.log("sqlPrimaryIdCharvals results length", sqlPrimaryIdCharvalsResults.length);

            for (let charIndex = 0; charIndex < sqlPrimaryIdCharvalsResults.length; charIndex++)
            {
                let rowId = charIndex + 1;
                str = JSON.stringify(sqlPrimaryIdCharvalsResults[charIndex]);
                obj = JSON.parse(str);
                let arrayVals = Object.values(obj);
                // console.log("arrayVals ", arrayVals);
                // let successRate = arrayVals[9];
                // let success = arrayVals[10];
                let successRate = arrayVals[8];
                let success = arrayVals[9];

                // console.log("success =",success);

                // let sqlStrObjdepCharHdrF = await 'UPSERT CP_TS_OBJDEP_CHARHDR_F VALUES (' +
                //                         "'" + weekdate + "'" + "," +
                //                         "'" + locationId + "'" + "," +
                //                         "'" + refProduct + "'" + "," +
                //                         "'" + objType + "'" + "," +
                //                         "'" + objDep + "'" + "," +
                //                         "'" + parseInt(objCounter) + "'" + "," +
                //                         "'" + rowId + "'" + "," +
                //                         "'" + version + "'" + "," +
                //                         "'" + scenario + "'" + "," +
                //                         "'" + parseInt(success) + "'" + "," +
                //                         "'" + parseFloat(successRate) + "'" +')' + ' WITH PRIMARY KEY';

                
                let sqlStrObjdepCharHdrF = await 'UPSERT CP_TS_OBJDEP_CHARHDR_F VALUES (' +
                                        "'" + weekdate + "'" + "," +
                                        "'" + locationId + "'" + "," +
                                        "'" + productId + "'" + "," +
                                        "'" + objType + "'" + "," +
                                        "'" + objDep + "'" + "," +
                                        "'" + parseInt(objCounter) + "'" + "," +
                                        "'" + rowId + "'" + "," +
                                        "'" + version + "'" + "," +
                                        "'" + scenario + "'" + "," +
                                        "'" + parseInt(success) + "'" + "," +
                                        "'" + parseFloat(successRate) + "'" +')' + ' WITH PRIMARY KEY';

                // console.log("sqlStrObjdepCharHdrF ", sqlStrObjdepCharHdrF, "primaryIdx ", primaryIdx )
                let sqlStrObjdepCharHdrFResults = await cds.run(sqlStrObjdepCharHdrF);
                // console.log("sqlStrObjdepCharHdrFResults ", sqlStrObjdepCharHdrFResults, "rowId ", rowId);
                

            }

            if( primaryIdx % 100 == 0)
            {
                await cds.run('COMMIT');
                console.log("PR_INDEX ",primaryIdx, "Primary ID Counts ", sqlFuturePrimarIdsResults.length);

            }
            // if (primaryIdx == 1000)
            //     break;

        }

        


        let dataObj = {};
        dataObj["success"] = true;
        dataObj["message"] = "update Partial Products Data Completed Successfully at " +  new Date();
    
    
        // if (req.headers['x-sap-job-id'] > 0)
        // {
        //     const scheduler = getJobscheduler(req);
    
        //     var updateReq = {
        //         jobId: req.headers['x-sap-job-id'],
        //         scheduleId: req.headers['x-sap-job-schedule-id'],
        //         runId: req.headers['x-sap-job-run-id'],
        //         data : dataObj
        //         };
    
        //         scheduler.updateJobRunLog(updateReq, function(err, result) {
        //         if (err) {
        //             return console.log('Error updating run log: %s', err);
        //         }
    
        //         });
        // }
    
        }
        

};
