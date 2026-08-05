const GenF = require("./gen-functions");
const cds = require("@sap/cds");
const GenTimeseries = require("./gen-timeseries");
const GenTimeseriesM2 = require("./gen-timeseries-m2");
const GenTimeseriesRT = require("./gen-timeseries-rt");
const SOFunctions = require("./so-function");
const { v1: uuidv1 } = require('uuid');
const Catservicefn = require("./catservice-function");
const AssemblyReq = require("./assembly-req");
const DerivedConfig = require("./derivedchars-functions");
const objDerConfig = new DerivedConfig();
const IBPFunc = require("./ibp-functions");
const obibpfucntions = new IBPFunc();
const CIRService = require("./cirdata-functions");
const palService = require("./../Pal-Service");
const GenFunctions = require("./gen-functions");
class jobSchedulerFunc {

    constructor() {


    }

    // SDI Functions
    async ImportECCLocFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_LOCATION_SP"');
            const output = await dbConn.callProcedurePromisified(sp, []);
            lSuccess = 'X';
            lMessage='Import Location Successful'

        } catch (error) {
            lSuccess = '';
            lMessage='Import Location Failed'

        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async ImportECCCustGrpFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_CUSTOMERGROUP_SP"')
            const output = await dbConn.callProcedurePromisified(sp, [])
            lSuccess = 'X';
            lMessage='Import Customer Group Successful';
        } catch (error) {
            lMessage='Import Customer Group Failed';
            lSuccess = '';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async ImportECCProdFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_PRODUCTS_SP"')
            const output = await dbConn.callProcedurePromisified(sp, [])
            lSuccess = 'X';
            lMessage='Import Product and Attributes Successful';
        } catch (error) {
            lMessage='Import Product and Attributes Failed';
            lSuccess = '';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async ImportECCLocProdFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_LOCATIONPROD_SP"')
            const output = await dbConn.callProcedurePromisified(sp, []);
            lSuccess = 'X';
            lMessage = 'Import Location Product Successful';
        } catch (error) {
            lSuccess = '';
            lMessage = 'Import Location Product Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async ImportECCProdClassFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied");
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv());
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_PRODUCTCLASS_SP"');
            const output = await dbConn.callProcedurePromisified(sp, []);
            lSuccess = 'X';
            lMessage= 'Import Product Configuration Successful';

        } catch (error) {
            lSuccess = '';
            lMessage= 'Import Product Configuration Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async ImportECCBOMFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_BOMHEADER_SP"')
            const sp2 = await dbConn.loadProcedurePromisified(null, '"FG_BOMOBJDEPENDENCY_SP"')
            const output = await dbConn.callProcedurePromisified(sp, [])
            const output2 = await dbConn.callProcedurePromisified(sp2, [])
            lSuccess = 'X';
            lMessage = 'Import Bill Of Materials Successful';
        } catch (error) {
            lSuccess = '';
            lMessage = 'Import Bill Of Materials Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async ImportECCClassFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_CLASS_SP"')
            const sp2 = await dbConn.loadProcedurePromisified(null, '"FG_CHARACTERISTICS_SP"')
            const sp3 = await dbConn.loadProcedurePromisified(null, '"FG_CHAR_VALUES_SP"')
            const output = await dbConn.callProcedurePromisified(sp, [])
            const output2 = await dbConn.callProcedurePromisified(sp2, [])
            const output3 = await dbConn.callProcedurePromisified(sp3, [])
            lSuccess = 'X';
            lMessage = 'Import Class and Characteristics Successful';
        } catch (error) {
            lSuccess = '';
            lMessage = 'Import Class and Characteristics Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async ImportECCODhdrFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_OBJDEP_HEADER_SP"')
            const output = await dbConn.callProcedurePromisified(sp, [])
            lSuccess = 'X';
            lMessage = 'Import Object Dep. Header Successful';
        } catch (error) {
            lSuccess = '';
            lMessage = 'Import Object Dep. Header Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async ImportPartialProdFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_PARTIALPROD_SP"');
            const sp2 = await dbConn.loadProcedurePromisified(null, '"FG_PARTIALPRODCFG_SP"');
            const output = await dbConn.callProcedurePromisified(sp, [])
            const output2 = await dbConn.callProcedurePromisified(sp2, [])
            lSuccess = 'X';
            lMessage = 'Import Partial Products Successful';
        } catch (error) {
            lSuccess = '';
            lMessage = 'Import Partial Products Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async ImportPVSNodeFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_PVSNODE_SP"');
            const sp2 = await dbConn.loadProcedurePromisified(null, '"FG_PVSBOM_SP"');
            const output = await dbConn.callProcedurePromisified(sp, [])
            const output2 = await dbConn.callProcedurePromisified(sp2, [])
            lSuccess = 'X';
            lMessage ='Import PVS Node Structure Successful';
        } catch (error) {
            lSuccess = '';
            lMessage ='Import PVS Node Structure Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;

    }
    async ImportPVSBOMFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_PVSBOM_SP"');
            const output = await dbConn.callProcedurePromisified(sp, [])
            lSuccess = 'X';
            lMessage = 'Import PVS BOM Successful';
        } catch (error) {
            lSuccess = '';
            lMessage = 'Import PVS BOM Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;

    }
    async ImportECCAsmbcompFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_ASMBCOMP_SP"')
            const output = await dbConn.callProcedurePromisified(sp, []);
            lSuccess = 'X';
            lMessage = 'Import Assembly Components Successful';

        } catch (error) {
            lSuccess = '';
            lMessage = 'Import Assembly Components Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async ImportECCSaleshFn() {
        var lSuccess = '',lMessage ='';
        try {
            // Delete All sales History
            const objCatFn = new Catservicefn();
            // await objCatFn.deleteSalesHistory('X');
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_SALESH_SP"')
            const output = await dbConn.callProcedurePromisified(sp, [])
            const spcfg = await dbConn.loadProcedurePromisified(null, '"FG_SALESH_CONFIG_SP"')
            const outputcfg = await dbConn.callProcedurePromisified(spcfg, [])
            lSuccess = 'X';
            lMessage = 'Import Sales History Successful';
        } catch (error) {
            lSuccess = '';
            lMessage = 'Import Sales History Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    // async ImportCuvtabIndFn() {
    //     var lSuccess = '',lMessage ='';
    //     try {
    //         const dbClass = require("sap-hdb-promisfied")
    //         let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
    //         const sp = await dbConn.loadProcedurePromisified(null, '"FG_CUVTAB_IND_SP"');
    //         const sp2 = await dbConn.loadProcedurePromisified(null, '"FG_CUVTAB_VALC_SP"');
    //         const output = await dbConn.callProcedurePromisified(sp, [])
    //         const output2 = await dbConn.callProcedurePromisified(sp2, [])
    //         lSuccess = 'X';
    //         lMessage ='Import Derived Characteristics Successful';
    //     } catch (error) {
    //         lSuccess = '';
    //         lMessage ='Import Derived Characteristics Failed';
    //     }
    //     let aReturn = {};
    //     aReturn.message = lMessage;
    //     aReturn.status = lSuccess;
    //     return aReturn;
    // }
    async ImportCIRLogFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_LOGCIR_SP"');
            const output = await dbConn.callProcedurePromisified(sp, [])
            lSuccess = 'X';
            lMessage = 'Import ForeCast Order Log Successful';

        } catch (error) {
            lSuccess = '';
            lMessage ='Import ForeCast Order Log Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async ImportSOStockFn() {
        var lSuccess = '',lMessage ='';
        try {
            const dbClass = require("sap-hdb-promisfied")
            let dbConn = new dbClass(await dbClass.createConnectionFromEnv())
            const sp = await dbConn.loadProcedurePromisified(null, '"FG_IBPSTOCK_SP"');
            const output = await dbConn.callProcedurePromisified(sp, [])
            lSuccess = 'X';
            lMessage = 'Import Sales Order Stock Successful';
        } catch (error) {
            lSuccess = '';
            lMessage = 'Import Sales Order Stock Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }

    async genUniqueIDFn(req) {
        let lilocProd = [];
        var lsData = {}, lMessage = '', lSuccess ='',iCounter =0,values=[];
        await GenF.logMessage(req, 'Started Sales Orders Processing');
        if (req.data.PRODUCT_ID === "ALL") {
            try{
            const objCatFn = new Catservicefn();
            lilocProd = await objCatFn.getAllProducts(req.data);
            // values.push({ id, createtAt, message, lilocProd });
            for (let i = 0; i < lilocProd.length; i++) {
                lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
                lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
                const obgenSOFunctions = new SOFunctions();
                let oResponse1 = await obgenSOFunctions.genUniqueID(lsData, req, lMessage, lSuccess);
                if(oResponse1.bError == true){//Error exists
                 iCounter++;
                 lSuccess ='';
                 lMessage = oResponse1.message;
                }
                else{
                 lSuccess ='X';
                 lMessage ='Process Sales Orders Failed';
                }
                await obgenSOFunctions.genClusterResults(req);
            }
            lSuccess = 'X';
            lMessage = 'Process Sales Orders Successful';
        }
        catch{
            lSuccess = '';
            lMessage = 'Process Sales Orders Failed';
        }
        }
        else {
            try{
                const litemp = JSON.stringify(req.data);
                lilocProd = JSON.parse(litemp);
                // values.push({ id, createtAt, message, lilocProd });
                const obgenSOFunctions = new SOFunctions();
               let oResponse1 = await obgenSOFunctions.genUniqueID(req.data, req, lMessage, lSuccess);
                if(oResponse1.bError == true){//Error exists
                    iCounter++;
                    lSuccess ='';
                    lMessage = oResponse1.message;
                   }
                   else{
                    lSuccess ='X';
                    lMessage ='Process Sales Orders Failed';
                   }
                await obgenSOFunctions.genClusterResults(req);
                lSuccess = 'X';
                lMessage = 'Process Sales Orders Successful';
            }
            catch(ex){
                lSuccess = '';
                lMessage = 'Process Sales Orders Failed';
            }

        }
        if(iCounter >0){
            lMessage = "Process Sales Orders Failed";
            lSuccess ='';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }

    // Generate Timeseries History
    async generateTimeseries(req) {
        let lilocProd = {};
        let lsData = {};
        var  lSuccess='',lMessage ='';
        let lilocProdReq = JSON.parse(req.data.LocProdData);
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        }
        else {
            lilocProd = JSON.parse(req.data.LocProdData);
        }

        const obgenTimeseries_rt = new GenTimeseriesRT();
        let m1 = await GenF.getParameterValue(lilocProd[0].LOCATION_ID, 13);
        let m2 = await GenF.getParameterValue(lilocProd[0].LOCATION_ID, 12);
         let vFlag = '';
         var iCounter = 0;
        if (m1 > 0) {
            vFlag = 'X';
            for (let i = 0; i < lilocProd.length; i++) {
                lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
                lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
                const obgenTimeseries = new GenTimeseries();
               let oResponse1 = await obgenTimeseries.genTimeseries(lsData, req, lSuccess);
               if(oResponse1.bError == true){//Error exists
                iCounter++;
                lSuccess ='';
                lMessage = oResponse1.message;
               }
               else{
                lSuccess ='X';
                lMessage ='Time Series History Successful';
               }
               
               let oResponse2 = await obgenTimeseries_rt.genTimeseries_rt(lsData, req, lSuccess);
               if(oResponse2.bError == true){//Error exists
                iCounter++;
                lSuccess ='';
                lMessage = oResponse2.message;
               }
               else{
                lSuccess ='X';
                lMessage ='Time Series History Successful';
               }
            }
        }

        if (m2 > 0) {
            vFlag = 'X';
            for (let i = 0; i < lilocProd.length; i++) {
                lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
                lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
                const obgenTimeseriesM2 = new GenTimeseriesM2();
               let oResponse = await obgenTimeseriesM2.genTimeseries(lsData, req, lSuccess);
               if(oResponse.bError == true){//Error exists
                iCounter++;
                lSuccess ='';
                lMessage = oResponse.message;
               }
               else{
                lSuccess ='X';
                lMessage ='Time Series History Successful';
               }
            }
        }
        if (vFlag === '') {
            lMessage = "Please maintain planning configurations for the location " + lilocProdReq[0].LOCATION_ID;
            lSuccess ='';
        }
        if(iCounter >0){
            lMessage = "Time Series History Failed";
            lSuccess ='';
        }
        // else{
        //     lMessage = 'Time Series History Successful';
        //     lSuccess ='X';
        // }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }

    // Generate Models
    async generateModels(req) {
        var request = require('request');
        var baseUrl = req.headers['x-forwarded-proto'] + '://' + req.headers.host;  // Un-Comment while deploying
        // var baseUrl = 'http' + '://' + req.headers.host;
        var sUrl = baseUrl + '/pal/generateModels';
        var lSuccess = '',lMessage ='';
        let lsReqData = JSON.parse(req.data.LocProdData)[0];
        let lLocation = lsReqData.Location_ID;
        let lProduct = lsReqData.PRODUCT_ID;
        let lProfile = lsReqData.profile;
        let lOverride = lsReqData.override;
        let lGroupID = lsReqData.GroupID;
        let lType = lsReqData.Type;
        let lModelVersion = lsReqData.modelVersion;
        var promiseArray = [];
        var aLogList =[];
        const liDistinctProd = await cds.run(
            `SELECT DISTINCT PRODUCT_ID
               FROM V_SALES_H
              WHERE LOCATION_ID = '${lLocation}'
                AND REF_PRODID = '${lProduct}'`
        );
        if (liDistinctProd.length > 0) {
            var auth =  await GenF.getAuthorization();
            for (let i = 0; i < liDistinctProd.length; i++) {
                var options = {
                    'method': 'POST',
                    'url': sUrl,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization':auth
                    },

                    body: JSON.stringify({
                        "vcRulesList": [
                            {
                                "profile": lProfile,
                                "override": lOverride,
                                "Location": lLocation,
                                "Product": liDistinctProd[i].PRODUCT_ID,
                                "override": lOverride,
                                "GroupID": lGroupID,
                                "Type": lType,
                                "modelVersion": lModelVersion,
                            }
                        ]
                    })

                };
                  let req = new Promise(function(resolve, _reject){
                        request(options, function (error) {
                            if (error) {
                                lMessage = lMessage + ' ' + `Model generation has failed for ${liDistinctProd[i].PRODUCT_ID}`;
                                lSuccess = '';
                                aLogList.push(lSuccess);
                               return  resolve(lMessage);
                            } else {
                                lMessage =  `Model generation is successful`;
                                lSuccess = 'X';
                                aLogList.push(lSuccess);
                                return resolve(lMessage);
                            }
                        });
                    });
                    promiseArray.push(req);
            }
        }
        try{
             await Promise.all(promiseArray);
        }
        catch(ex){
            
        }
        //if any one request is success,considering it as success
        if(aLogList.filter(f=>f == 'X').length>0){
            lMessage =  "Model generation is successful";
            lSuccess = 'X';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }


    // IBP Export functions
    async exportIBPLocationFn(req,_service,servicePost) {
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[1].VALUE.toString() + "LOCATION";
        let lEntity = "/" + liParaValue[1].VALUE.toString() + "LOCATIONTrans";
        let oReq = {
            newLoc: [],
        },
            vNewLoc;
            var lSuccess = '',lMessage ='';
        const linewloc = await cds.run(
            `
             SELECT "LOCATION_ID",
                    "LOCATION_DESC",
                    "LOCATION_TYPE"
                    FROM "CP_LOCATION" `);

        for (let i = 0; i < linewloc.length; i++) {
            vNewLoc = {
                "LOCID": linewloc[i].LOCATION_ID,
                "LOCDESCR": linewloc[i].LOCATION_DESC,
                "LOCTYPE": linewloc[i].LOCATION_TYPE
            };
            oReq.newLoc.push(vNewLoc);

        }
        let vTransID = new Date().getTime().toString();
        let oEntry =
        {
            "TransactionID": vTransID,
            "RequestedAttributes": "LOCID,LOCDESCR,LOCTYPE",
            "DoCommit": true
        }
        oEntry[lData] = oReq.newLoc;

        try {
            await servicePost.tx(req).post(lEntity, oEntry);
            let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
            let vResponse = await servicePost.tx(req).get(resUrl);
            lSuccess = 'X';
            lMessage = 'Export IBP Location Successful';
        } catch (error) {
            lSuccess = ''; 
            lMessage = 'Export IBP Location Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async exportIBPCustomerFn(req,_service,servicePost) {// Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[1].VALUE.toString() + "CUSTOMER";
        let lEntity = "/" + liParaValue[1].VALUE.toString() + "CUSTOMERTrans";
        let oReq = {
            cust: [],
        },
            vcust;
        var lSuccess = '',lMessage ='';
        const licust = await cds.run(
            `
            SELECT "CUSTOMER_GROUP",
                   "CUSTOMER_DESC"
                   FROM "CP_CUSTOMERGROUP" `);

        //const li_Transid = servicePost.tx(req).get("/GetTransactionID");
        for (let i = 0; i < licust.length; i++) {
            vcust = {
                "CUSTID": licust[i].CUSTOMER_GROUP,
                "CUSTDESCR": licust[i].CUSTOMER_DESC,
            };
            oReq.cust.push(vcust);

        }
        let vTransID = new Date().getTime().toString();
        let oEntry =
        {
            "TransactionID": vTransID,
            "RequestedAttributes": "CUSTID,CUSTDESCR",
            "DoCommit": true
        }
        oEntry[lData] = oReq.cust;

        try {
            await servicePost.tx(req).post(lEntity, oEntry);
            let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
            let aResponse = await servicePost.tx(req).get(resUrl);
            lSuccess = 'X';
            lMessage = 'Export IBP Customer Group Successful';
        } catch (error) {
            lSuccess = '';
            lMessage = 'Export IBP Customer Group Failed';
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;

    }
    async exportIBPMasterProdFn(req,_service,servicePost) {// Get Planning area and Prefix configurations for IBP
         let liParaValue = await GenF.getIBPParameterValue();
         let lData = "Nav" + liParaValue[1].VALUE.toString() + "PRODUCT";
         let lEntity = "/" + liParaValue[1].VALUE.toString() + "PRODUCTTrans";
 
         let oReq = {
             masterProd: [],
         }, 
             vmasterProd;
             var lSuccess = '',lMessage ='';
         const limasterprod = await cds.run(
             `
              SELECT DISTINCT A.PRODUCT_ID,
              B.LOCATION_ID,
              A.PROD_DESC,
              A.PROD_FAMILY,
              A.PROD_GROUP,
              A.PROD_MODEL,
              A.PROD_MDLRANGE,
              A.PROD_SERIES,
              A.PROD_TYPE,
              A.RESERVE_FIELD3         
                FROM "CP_PRODUCT" AS A
                INNER JOIN "CP_LOCATION_PRODUCT" AS B
                ON A.PRODUCT_ID = B.PRODUCT_ID `);
 
         const lipartialprod = await cds.run(
             `
              SELECT DISTINCT PRODUCT_ID,
                     LOCATION_ID,
                     PROD_TYPE,
                     PROD_DESC,
                     REF_PRODID
                FROM "CP_PARTIALPROD_INTRO"
                ORDER BY REF_PRODID`);
 
         const liComp = await cds.run(
             `
              SELECT DISTINCT PRODUCT_ID,
                     LOCATION_ID,
                     COMPONENT,
                     COMP_DESC,
                     COMP_TYPE
                FROM "V_BOM_DEMDFACLOC"
                ORDER BY COMPONENT`);
 
         const liAssemblyComp = await cds.run(
             `
              SELECT DISTINCT LOCATION_ID,
                     ASSEMBLY,
                     COMPONENT,
                     COMP_DESC,
                     COMP_TYPE
                FROM "V_COMP_DEMDFACLOC"
                ORDER BY COMPONENT`);
 
         for (let i = 0; i < limasterprod.length; i++) {
             for (let iPartial = 0; iPartial < lipartialprod.length; iPartial++) {
                 if (lipartialprod[iPartial].PRODUCT_ID === limasterprod[i].PRODUCT_ID) {
                     vmasterProd = {
                         "VCMODELRANGE": limasterprod[i].PROD_MDLRANGE,
                         "PRDFAMILY": limasterprod[i].PROD_FAMILY,
                         "PRDID": lipartialprod[iPartial].PRODUCT_ID,
                         "PRDGROUP": limasterprod[i].PROD_GROUP,
                         "VCMODEL": limasterprod[i].PROD_MODEL,
                         "PRDDESCR": limasterprod[i].PROD_DESC,
                         "PRDSERIES": limasterprod[i].PROD_SERIES,
                         "MATTYPEID": limasterprod[i].PROD_TYPE,
                         "VCPRODATT01": '',
                         "VCPRODATT02": '',
                         "VCPRODATT03": '',
                         "VCPRODATT04": '',
                         "VCPRODATT05": '',
                         "VCPRODATT06": '',
                         "VCPRODATT07": ''
                     };
                     oReq.masterProd.push(vmasterProd);
                 }
                 // Get partial attributes based on sequence
                 if (lipartialprod[iPartial].PRODUCT_ID !== limasterprod[i].PRODUCT_ID &&
                     lipartialprod[iPartial].REF_PRODID === limasterprod[i].PRODUCT_ID) {
 
 
                     const liIbpChar = await cds.run(
                         `SELECT distinct  V_PARTIALPRODCHAR.PRODUCT_ID,
                                             V_PARTIALPRODCHAR.REF_PRODID,
                                             CP_IBPCHAR_PS.SEQUENCE,
                                             CP_IBPCHAR_PS.CHAR_NUM,
                                             V_PARTIALPRODCHAR.CHAR_VALUE
                             FROM CP_IBPCHAR_PS
                             INNER JOIN V_PARTIALPRODCHAR
                             ON CP_IBPCHAR_PS.PRODUCT_ID = V_PARTIALPRODCHAR.REF_PRODID
                             AND CP_IBPCHAR_PS.CHAR_NUM = V_PARTIALPRODCHAR.CHAR_NUM
                             WHERE CHAR_TYPE = 'P'
                         AND CP_IBPCHAR_PS.PRODUCT_ID = '${lipartialprod[iPartial].REF_PRODID}'  
                         AND V_PARTIALPRODCHAR.PRODUCT_ID = '${lipartialprod[iPartial].PRODUCT_ID}'                           
                         ORDER BY SEQUENCE`);
                     let columnname = 'VCPRODATT0', nIbpLength = 1;
                     vmasterProd = {
                         "VCMODELRANGE": limasterprod[i].PROD_MDLRANGE,
                         "PRDFAMILY": limasterprod[i].PROD_FAMILY,
                         "PRDID": lipartialprod[iPartial].PRODUCT_ID,
                         "PRDGROUP": limasterprod[i].PROD_GROUP,
                         "VCMODEL": limasterprod[i].PROD_MODEL,
                         "PRDDESCR": lipartialprod[iPartial].PROD_DESC,
                         "PRDSERIES": limasterprod[i].PROD_SERIES,
                         "MATTYPEID": lipartialprod[iPartial].PROD_TYPE
                     };
                     while (nIbpLength <= 7) {
                         vmasterProd[columnname + nIbpLength] = '';
                         for (let index = 0; index < liIbpChar.length; index++) {
                             if (nIbpLength === liIbpChar[index].SEQUENCE) {
                                 vmasterProd[columnname + nIbpLength] = liIbpChar[index].CHAR_VALUE;
                             }
                         }
                         nIbpLength = nIbpLength + 1;
                     }
                     oReq.masterProd.push(vmasterProd);
                 }
             }
             // BOM Components
             vmasterProd = {};
             for (let iComp = 0; iComp < liComp.length; iComp++) {
                 if (liComp[iComp].PRODUCT_ID === limasterprod[i].PRODUCT_ID) {
                     vmasterProd = {
                         "VCMODELRANGE": '',
                         "PRDFAMILY": '',
                         "PRDID": liComp[iComp].COMPONENT,
                         "PRDGROUP": '',
                         "VCMODEL": '',
                         "PRDDESCR": liComp[iComp].COMP_DESC,
                         "PRDSERIES": '',
                         "MATTYPEID": liComp[iComp].COMP_TYPE,
                         "VCPRODATT01": '',
                         "VCPRODATT02": '',
                         "VCPRODATT03": '',
                         "VCPRODATT04": '',
                         "VCPRODATT05": '',
                         "VCPRODATT06": '',
                         "VCPRODATT07": ''
                     };
                     oReq.masterProd.push(vmasterProd);
 
                     for (let iAsmbComp = 0; iAsmbComp < liAssemblyComp.length; iAsmbComp++) {
                         if (liAssemblyComp[iAsmbComp].LOCATION_ID === liComp[iComp].LOCATION_ID &&
                             liAssemblyComp[iAsmbComp].ASSEMBLY === liComp[iComp].COMPONENT) {
                             vmasterProd = {
                                 "VCMODELRANGE": '',
                                 "PRDFAMILY": '',
                                 "PRDID": liAssemblyComp[iAsmbComp].COMPONENT,
                                 "PRDGROUP": '',
                                 "VCMODEL": '',
                                 "PRDDESCR": liAssemblyComp[iAsmbComp].COMP_DESC,
                                 "PRDSERIES": '',
                                 "MATTYPEID": liAssemblyComp[iAsmbComp].COMP_TYPE,
                                 "VCPRODATT01": '',
                                 "VCPRODATT02": '',
                                 "VCPRODATT03": '',
                                 "VCPRODATT04": '',
                                 "VCPRODATT05": '',
                                 "VCPRODATT06": '',
                                 "VCPRODATT07": ''
                             };
                             oReq.masterProd.push(vmasterProd);
                         }
 
                     }
 
                 }
 
             }
 
         }
         let Keys = ['PRDID'];
         oReq.masterProd = GenF.removeDuplicate(oReq.masterProd, Keys);
         if (oReq.masterProd.length > 0) {
             let vTransID = new Date().getTime().toString();
             let oEntry =
             {
                 "TransactionID": vTransID,
                 "RequestedAttributes": "VCMODELRANGE,PRDFAMILY,PRDID,PRDGROUP,VCMODEL,PRDDESCR,PRDSERIES,MATTYPEID,VCPRODATT01,VCPRODATT02,VCPRODATT03,VCPRODATT04,VCPRODATT05,VCPRODATT06,VCPRODATT07",
                 "DoCommit": true
             }
             oEntry[lData] = oReq.masterProd;
             try {
                 await servicePost.tx(req).post(lEntity, oEntry);
                 let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                 let vResponse = await servicePost.tx(req).get(resUrl);
                 lSuccess = 'X';
                 lMessage = 'Export IBP Products Successful';
             }
             catch (error) {
                lSuccess = '';
                lMessage = 'Export IBP Products Failed';
             }
         }
         let aReturn = {};
         aReturn.message = lMessage;
         aReturn.status = lSuccess;
         return aReturn;
    }
    async exportIBPLocProdFn(req,_service,servicePost) {// Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[1].VALUE.toString() + "LOCATIONPRODUCT";
        let lEntity = "/" + liParaValue[1].VALUE.toString() + "LOCATIONPRODUCTTrans";
        let oReq = {
            newLocProd: [],
        },
            vNewLocProd;
            var lSuccess = '',lMessage ='';
        const lilocprod = await cds.run(
            ` SELECT DISTINCT
                        CP_LOCATION_PRODUCT."LOCATION_ID",
                        CP_FACTORY_SALESLOC."FACTORY_LOC",
                        CP_LOCATION_PRODUCT."PRODUCT_ID",
                        CP_LOCATION_PRODUCT."LOTSIZE_KEY",
                        CP_LOCATION_PRODUCT."LOT_SIZE",
                        CP_LOCATION_PRODUCT."PROCUREMENT_TYPE",
                        CP_LOCATION_PRODUCT."PLANNING_STRATEGY"
                      FROM CP_LOCATION_PRODUCT 
                      INNER JOIN CP_FACTORY_SALESLOC 
                      ON CP_LOCATION_PRODUCT.LOCATION_ID = CP_FACTORY_SALESLOC.LOCATION_ID
                      WHERE CP_LOCATION_PRODUCT.LOCATION_ID = '`+ req.data.LOCATION_ID + `'
                      AND ( CP_LOCATION_PRODUCT.PRODUCT_ID IN ( SELECT distinct PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE LOCATION_ID = '${req.data.LOCATION_ID}' ))`);

        const liProdAsmb = await cds.run(
            `
                             SELECT LOCATION_ID,
                                    FACTORY_LOC,
                                    COMPONENT
                               FROM "V_BOM_DEMDFACLOC" 
                               WHERE LOCATION_ID = '`+ req.data.LOCATION_ID + `'`);
        const liProdAsmComp = await cds.run(
            `
                             SELECT LOCATION_ID,
                                     FACTORY_LOC,
                                    COMPONENT
                               FROM "V_COMP_DEMDFACLOC" AS A
                               WHERE A.LOCATION_ID = '`+ req.data.LOCATION_ID + `'`);

        //const li_Transid = servicePost.tx(req).get("/GetTransactionID");
        for (var i = 0; i < lilocprod.length; i++) {
            vNewLocProd = {
                "LOCID": lilocprod[i].LOCATION_ID,
                "PRDID": lilocprod[i].PRODUCT_ID,
                "PLANNINGSTRGY": lilocprod[i].PLANNING_STRATEGY,
                "PLUNITID": '',
                "PROCUREMENTTYPE": lilocprod[i].PROCUREMENT_TYPE,
                "VCLOTSIZE": lilocprod[i].LOT_SIZE.toString(),
                "VCMANUFACTURINGLOC": lilocprod[i].FACTORY_LOC
            };
            oReq.newLocProd.push(vNewLocProd);
        }
        for (let iComp = 0; iComp < liProdAsmComp.length; iComp++) {
            vNewLocProd = {
                "LOCID": liProdAsmComp[iComp].LOCATION_ID,
                "PRDID": liProdAsmComp[iComp].COMPONENT,
                "PLANNINGSTRGY": '',
                "PLUNITID": '',
                "PROCUREMENTTYPE": '',
                "VCLOTSIZE": '0',
                "VCMANUFACTURINGLOC": liProdAsmComp[iComp].FACTORY_LOC
            };
            oReq.newLocProd.push(vNewLocProd);
        }

        for (let iComp = 0; iComp < liProdAsmb.length; iComp++) {
            vNewLocProd = {
                "LOCID": liProdAsmb[iComp].LOCATION_ID,
                "PRDID": liProdAsmb[iComp].COMPONENT,
                "PLANNINGSTRGY": '',
                "PLUNITID": '',
                "PROCUREMENTTYPE": '',
                "VCLOTSIZE": '0',
                "VCMANUFACTURINGLOC": liProdAsmb[iComp].FACTORY_LOC
            };
            oReq.newLocProd.push(vNewLocProd);
        }

        let Keys = ['LOCID', 'PRDID'];
        oReq.newLocProd = GenF.removeDuplicate(oReq.newLocProd, Keys);
        if (oReq.newLocProd.length > 0) {
            let vTransID = new Date().getTime().toString();
            let oEntry =
            {
                "TransactionID": vTransID,
                "RequestedAttributes": "LOCID,PRDID,PLANNINGSTRGY,PLUNITID,PROCUREMENTTYPE,VCLOTSIZE,VCMANUFACTURINGLOC",
                "DoCommit": true
            }
            oEntry[lData] = oReq.newLocProd;
            try {
                // const servicePost2 = await  cds.connect.to('IBPMasterDataAPI');
                await servicePost.tx(req).post(lEntity, oEntry);
                let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                let vResponse = await servicePost.tx(req).get(resUrl);
                lSuccess = 'X';
                lMessage = 'Export IBP Location Product Successful';
            }
            catch (error) {
                lSuccess = '';
                lMessage = 'Export IBP Location Product Failed';
            }
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async exportIBPAssemblyFn(req,_service,servicePost) {// Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[1].VALUE.toString() + "LOCPRODCOMPONENT";
        let lEntity = "/" + liParaValue[1].VALUE.toString() + "LOCPRODCOMPONENTTrans";

        let oReq = {
            masterProd: [],
        },
            vmasterProd, vBOMSource;
            var lSuccess = '',lMessage ='';
        const liComp = await cds.run(
            `
             SELECT DISTINCT PRODUCT_ID,
                    LOCATION_ID,
                    COMPONENT,
                    STRUC_NODE
               FROM "V_BOMPVS"
               WHERE LOCATION_ID = '`+ req.data.LOCATION_ID + `'
               ORDER BY COMPONENT`);

        const lipartialprod = await cds.run(
            `
            SELECT DISTINCT PRODUCT_ID,
                LOCATION_ID,
                PROD_DESC,
                REF_PRODID
            FROM "CP_PARTIALPROD_INTRO"
            WHERE LOCATION_ID = '`+ req.data.LOCATION_ID + `'
            ORDER BY REF_PRODID`);

        const liFactLoc = await cds.run(
            ` SELECT DISTINCT LOCATION_ID,
                              PLAN_LOC
                        FROM CP_FACTORY_SALESLOC
                        WHERE FACTORY_LOC = '`+ req.data.LOCATION_ID + `' 
                        AND LOCATION_ID <> '`+ req.data.LOCATION_ID + `'
            `);
        // BOM Components
        for (let iComp = 0; iComp < liComp.length; iComp++) {
            vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].PRODUCT_ID);
            vmasterProd = {
                "LOCID": liComp[iComp].LOCATION_ID,
                "PRDID": liComp[iComp].PRODUCT_ID,
                "PRDFR": liComp[iComp].COMPONENT,
                "VCSTRUCTURENODE": liComp[iComp].STRUC_NODE,
                "VCSOURCEID": vBOMSource

            };
            oReq.masterProd.push(vmasterProd);
            for (let i = 0; i < liFactLoc.length; i++) {
                vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].PRODUCT_ID);
                vmasterProd = {
                    "LOCID": liFactLoc[i].LOCATION_ID,
                    "PRDID": liComp[iComp].PRODUCT_ID,
                    "PRDFR": liComp[iComp].COMPONENT,
                    "VCSTRUCTURENODE": liComp[iComp].STRUC_NODE,
                    "VCSOURCEID": vBOMSource
                };
                oReq.masterProd.push(vmasterProd);

                if (liFactLoc[i].LOCATION_ID !== liFactLoc[i].PLAN_LOC) {
                    vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].PRODUCT_ID);
                    vmasterProd = {
                        "LOCID": liFactLoc[i].PLAN_LOC,
                        "PRDID": liComp[iComp].PRODUCT_ID,
                        "PRDFR": liComp[iComp].COMPONENT,
                        "VCSTRUCTURENODE": liComp[iComp].STRUC_NODE,
                        "VCSOURCEID": vBOMSource
                    };
                    oReq.masterProd.push(vmasterProd);
                }
            }
            for (let iPartial = 0; iPartial < lipartialprod.length; iPartial++) {
                if (lipartialprod[iPartial].REF_PRODID === liComp[iComp].PRODUCT_ID &&
                    lipartialprod[iPartial].LOCATION_ID === liComp[iComp].LOCATION_ID &&
                    lipartialprod[iPartial].PRODUCT_ID !== liComp[iComp].PRODUCT_ID) {
                    vBOMSource = liComp[iComp].LOCATION_ID.concat('_', lipartialprod[iPartial].PRODUCT_ID);
                    vmasterProd = {
                        "LOCID": liComp[iComp].LOCATION_ID,
                        "PRDID": lipartialprod[iPartial].PRODUCT_ID,
                        "PRDFR": liComp[iComp].COMPONENT,
                        "VCSTRUCTURENODE": liComp[iComp].STRUC_NODE,
                        "VCSOURCEID": vBOMSource
                    };
                    oReq.masterProd.push(vmasterProd);
                    for (let i = 0; i < liFactLoc.length; i++) {
                        vBOMSource = liComp[iComp].LOCATION_ID.concat('_', lipartialprod[iPartial].PRODUCT_ID);
                        vmasterProd = {
                            "LOCID": liFactLoc[i].LOCATION_ID,
                            "PRDID": lipartialprod[iPartial].PRODUCT_ID,
                            "PRDFR": liComp[iComp].COMPONENT,
                            "VCSTRUCTURENODE": liComp[iComp].STRUC_NODE,
                            "VCSOURCEID": vBOMSource

                        };
                        oReq.masterProd.push(vmasterProd);
                        if (liFactLoc[i].LOCATION_ID !== liFactLoc[i].PLAN_LOC) {
                            vBOMSource = liComp[iComp].LOCATION_ID.concat('_', lipartialprod[iPartial].PRODUCT_ID);
                            vmasterProd = {
                                "LOCID": liFactLoc[i].PLAN_LOC,
                                "PRDID": lipartialprod[iPartial].PRODUCT_ID,
                                "PRDFR": liComp[iComp].COMPONENT,
                                "VCSTRUCTURENODE": liComp[iComp].STRUC_NODE,
                                "VCSOURCEID": vBOMSource

                            };
                            oReq.masterProd.push(vmasterProd);
                        }
                    }
                }
            }

        }
        // let Keys = ['PRDID'];
        // oReq.masterProd = GenF.removeDuplicate(oReq.masterProd, Keys);
        if (oReq.masterProd.length > 0) {
            let vTransID = new Date().getTime().toString();
            let oEntry =
            {
                "TransactionID": vTransID,
                "RequestedAttributes": "LOCID,PRDID,PRDFR,VCSTRUCTURENODE,VCSOURCEID",
                "DoCommit": true
            }
            oEntry[lData] = oReq.masterProd;
            try {
                await servicePost.tx(req).post(lEntity, oEntry);
                let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                let vResponse = await servicePost.tx(req).get(resUrl);
                lSuccess = 'X';
                lMessage ='Export IBP Assembly Successful';
            }
            catch (error) {
                lSuccess = '';
                lMessage ='Export IBP Assembly Failed';
            }
        }   
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn; 
    }
    async exportIBPAssemblyComp(req,_service,servicePost){
        
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[1].VALUE.toString() + "LOCASSEMBLYCOMPONENT";
        let lEntity = "/" + liParaValue[1].VALUE.toString() + "LOCASSEMBLYCOMPONENTTrans";

        let oReq = {
            asmbComp: [],
        }, vBOMSource,
            vAsmbComp;

        var lMessage ='',flag ='';
        const liComp = await cds.run(
            `
             SELECT DISTINCT LOCATION_ID,
                             ASSEMBLY,
                             COMPONENT,
                             COMP_QTY
                    FROM "CP_ASSEMBLY_COMP"
                    WHERE LOCATION_ID = '`+ req.data.LOCATION_ID + `'
                    ORDER BY ASSEMBLY`);

        const liFactLoc = await cds.run(
            ` SELECT DISTINCT LOCATION_ID,
                                PLAN_LOC
                        FROM CP_FACTORY_SALESLOC
                        WHERE FACTORY_LOC = '`+ req.data.LOCATION_ID + `' 
                        AND LOCATION_ID <> '`+ req.data.LOCATION_ID + `'
            `);
        // BOM Components
        for (let iComp = 0; iComp < liComp.length; iComp++) {

            vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].ASSEMBLY);
            vAsmbComp = {
                "LOCID": liComp[iComp].LOCATION_ID,
                "PRDID": liComp[iComp].ASSEMBLY,
                "PRDFR": liComp[iComp].COMPONENT,
                "VCBOMCOMPONENTCOEFFICENT": liComp[iComp].COMP_QTY.toString(),
                "VCBOMSOURCEID": vBOMSource
            };
            oReq.asmbComp.push(vAsmbComp);
            for (let i = 0; i < liFactLoc.length; i++) {
                vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].ASSEMBLY);
                vAsmbComp = {
                    "LOCID": liFactLoc[i].LOCATION_ID,
                    "PRDID": liComp[iComp].ASSEMBLY,
                    "PRDFR": liComp[iComp].COMPONENT,
                    "VCBOMCOMPONENTCOEFFICENT": liComp[iComp].COMP_QTY.toString(),
                    "VCBOMSOURCEID": vBOMSource
                };
                oReq.asmbComp.push(vAsmbComp);

                if (liFactLoc[i].LOCATION_ID !== liFactLoc[i].PLAN_LOC) {
                    vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].ASSEMBLY);
                    vAsmbComp = {
                        "LOCID": liFactLoc[i].PLAN_LOC,
                        "PRDID": liComp[iComp].ASSEMBLY,
                        "PRDFR": liComp[iComp].COMPONENT,
                        "VCBOMCOMPONENTCOEFFICENT": liComp[iComp].COMP_QTY.toString(),
                        "VCBOMSOURCEID": vBOMSource
                    };
                    oReq.asmbComp.push(vAsmbComp);
                }
            }
        }
        if (oReq.asmbComp.length > 0) {
            let vTransID = new Date().getTime().toString();
            let oEntry =
            {
                "TransactionID": vTransID,
                "RequestedAttributes": "LOCID,PRDID,PRDFR,VCBOMCOMPONENTCOEFFICENT,VCBOMSOURCEID",
                "DoCommit": true
            }
            oEntry[lData] = oReq.asmbComp;
            try {
                await servicePost.tx(req).post(lEntity, oEntry);
                let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                let vResponse = await servicePost.tx(req).get(resUrl);
                flag = 'X';
                lMessage ='Export IBP Assembly Component Successful';
            }
            catch (error) {
                flag = '';
                lMessage ='Export IBP Assembly Component Failed';
            }
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = flag;
        return aReturn; 
    }
    async exportIBPClassFn(req,_service,servicePost) {
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[1].VALUE.toString() + "CLASS";
        let lEntity = "/" + liParaValue[1].VALUE.toString() + "CLASSTrans";
        let oReq = {
            class: [],
        },
            vclass;
            var lSuccess = '',lMessage ='';
        const liclass = await cds.run(
            `
            SELECT CLASS_NUM,
                    CLASS_NAME,
                    CLASS_DESC,
                    CHAR_NUM,
                    CHAR_NAME,
                    CHAR_DESC,
                    CHAR_GROUP,
                    CHAR_VALUE,
                    CHARVAL_NUM,
                    CHARVAL_DESC
                    FROM V_CLASSCHARVAL 
                WHERE IBPCHAR_CHK = true`);
        //CLASS_NUM = '`+ req.data.CLASS_NUM + `'
        //const li_Transid = servicePost.tx(req).get("/GetTransactionID");
        for (var i = 0; i < liclass.length; i++) {
            vclass = {
                "VCCHAR": liclass[i].CHAR_NUM,
                "VCCHARVALUE": liclass[i].CHARVAL_NUM,
                "VCCLASS": liclass[i].CLASS_NUM,
                "VCCHARNAME": liclass[i].CHAR_NAME,
                "VCCHARGROUP": liclass[i].CHAR_GROUP,
                "VCCHARVALUENAME": liclass[i].CHAR_VALUE,
                "VCCLASSNAME": liclass[i].CLASS_NAME,
                "VCCHARDESC": liclass[i].CHAR_DESC,
                "VCCHARVALUEDESC": liclass[i].CHARVAL_DESC,
                "VCCLASSDESC": liclass[i].CLASS_DESC
            };
            oReq.class.push(vclass);

        }
        if (oReq.class.length > 0) {
            let vTransID = new Date().getTime().toString();
            let oEntry =
            {
                "TransactionID": vTransID,
                "RequestedAttributes": "VCCHAR,VCCHARGROUP,VCCHARNAME,VCCHARVALUE,VCCHARVALUENAME,VCCLASS,VCCLASSNAME,VCCHARDESC,VCCHARVALUEDESC,VCCLASSDESC",
                "DoCommit": true
            }
            oEntry[lData] = oReq.class;

            try {
                await servicePost.tx(req).post(lEntity, oEntry);
                let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
               let aResponse = await servicePost.tx(req).get(resUrl);
                lSuccess = 'X';
                lMessage='Export IBP Class Successful'
            }
            catch (error) {
                lSuccess ='';
                lMessage = 'Export IBP Class Failed';
            }
        }
        let aReturn = {};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    
    async exportIBPSalesTransFn(req,service,_servicePost) {// Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
        let oReq = {
            sales: [],
        },
            oReqCfg = {
                sales: [],
            },

            oReqStock = {
                stock: [],
            },
            oReqStockCfg = {
                stockcfg: [],
            },
            oReqStockhd = {
                stockhd: [],
            },
            oReqStockhdCfg = {
                stockhdcfg: [],
            },
            aReturn = {},lMessage = '', lSuccess='';
        let vsales;
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let lsData = {};
       
        let lilocProdReq = JSON.parse(req.data.LocProdData);

        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        }
        else {
            lilocProd = JSON.parse(req.data.LocProdData);
        }

        lSuccess = '';
        const lsSales = await GenF.getParameterValue(lilocProdReq[0].LOCATION_ID, 11);

        const lsMaxDate = await SELECT.one.columns("MAX(WEEK_DATE) AS MAX_DATE")
            .from('V_IBP_SALESH_ACTDEMD');
        let vToDate = lsMaxDate.MAX_DATE;

        let vFromDate = new Date();
        vFromDate.setDate(vFromDate.getDate() - (parseInt(lsSales) * 7));
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];

        let liDates = obibpfucntions.generateDateseries(vFromDate, vToDate);
        for (let i = 0; i < lilocProd.length; i++) {
            lsData = {};
            oReq = {
                sales: [],
            };
            lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
            // Sales history based on Location and a Partial Product
            const lisales = await cds.run(
                `
                    SELECT  DISTINCT "WEEK_DATE",
                            "LOCATION_ID",
                            "PRODUCT_ID",
                            "ORD_QTY",
                            "ADJ_QTY",
                            "CUSTOMER_GROUP"
                            FROM V_IBP_SALESH_ACTDEMD
                            WHERE LOCATION_ID = '`+ lsData.LOCATION_ID + `'
                               AND PRODUCT_ID = '`+ lsData.PRODUCT_ID +
                `'`);
            const liCust = await cds.run(
                `
                        SELECT DISTINCT 
                                "LOCATION_ID",
                                "PRODUCT_ID",
                                "CUSTOMER_GROUP"
                                FROM V_IBP_SALESH_ACTDEMD
                                WHERE LOCATION_ID = '`+ lsData.LOCATION_ID + `'
                                   AND PRODUCT_ID = '`+ lsData.PRODUCT_ID +
                `'`);
            // Get Date series from Sales H start and end week
            if (lisales.length > 0) {
                let vDemd, vAdjqty, vWeekDate,lMessage = '';
                for (let iDate = 0; iDate < liDates.length; iDate++) {
                    for (let iCust = 0; iCust < liCust.length; iCust++) {
                        aReturn = {};
                        for (let i = 0; i < lisales.length; i++) {
                            vDemd = "", vAdjqty = "", vWeekDate = "";
                            if (liDates[iDate].WEEK_DATE === lisales[i].WEEK_DATE &&
                                liCust[iCust].CUSTOMER_GROUP === lisales[i].CUSTOMER_GROUP) {
                                vWeekDate = new Date(lisales[i].WEEK_DATE).toISOString().split('Z');
                                vDemd = lisales[i].ORD_QTY.split('.');
                                vAdjqty = lisales[i].ADJ_QTY.split('.');
                                vsales = {
                                    "LOCID": lisales[i].LOCATION_ID,
                                    "PRDID": lisales[i].PRODUCT_ID,
                                    "CUSTID": lisales[i].CUSTOMER_GROUP,
                                    "ACTUALDEMAND": vDemd[0],
                                    // "SEEDORDERDEMAND": vAdjqty[0],
                                    "PERIODID0_TSTAMP": vWeekDate[0]
                                };
                                aReturn.status = 'X';
                                oReq.sales.push(vsales);
                            }
                        }
                        if (aReturn.status === '') {
                            vWeekDate = new Date(liDates[iDate].WEEK_DATE).toISOString().split('Z');
                            vDemd = "-1";
                            vAdjqty = "-2";
                            vsales = {
                                "LOCID": lsData.LOCATION_ID,
                                "PRDID": lsData.PRODUCT_ID,
                                "CUSTID": liCust[iCust].CUSTOMER_GROUP,
                                "ACTUALDEMAND": vDemd,
                                // "SEEDORDERDEMAND": vAdjqty,
                                "PERIODID0_TSTAMP": vWeekDate[0]
                            };
                            oReq.sales.push(vsales);
                        }
                    }
                }
                if (oReq.sales.length > 0) {

                    let vTransID = new Date().getTime().toString();
                    let oEntry =
                    {
                        "Transactionid": vTransID,
                        "AggregationLevelFieldsString": "LOCID,PRDID,CUSTID,ACTUALDEMAND,PERIODID0_TSTAMP",
                        "VersionID": "",
                        "DoCommit": true,
                        "ScenarioID": ""
                    }
                    oEntry[lData] = oReq.sales
                    try {
                        await service.tx(req).post(lEntity, oEntry);
                        aReturn.status = 'S';
                    }
                    catch (err) {
                        console.log("Unable to send Actual demand at VC");
                    }
                    // Once Sales History is successfull , send sales Config . Actual demand at VC
                    if (aReturn.status === 'S') {
                        oReqCfg = {
                            sales: [],
                        };

                        oReqStock = {
                            stock: [],
                        };
                        oReqStockCfg = {
                            stockcfg: [],
                        };
                        oReqStockhd = {
                            stockhd: [],
                        };
                        oReqStockhdCfg = {
                            stockhdcfg: [],
                        };
                        oReqCfg = await obibpfucntions.exportSalesCfg(lsData, liDates);
                        oReqStock = await obibpfucntions.exportSalesStock(lsData, liDates);
                        oReqStockCfg = await obibpfucntions.exportSalesCfgStock(lsData, liDates);
                        oReqStockhd = await obibpfucntions.exportSalesOnHand(lsData, liDates);
                        oReqStockhdCfg = await obibpfucntions.exportSalesCfgOnHand(lsData, liDates);

                        if (oReqCfg.sales.length > 0) {
                            console.log(oReqCfg.sales.length);
                            // Sales History Config
                            let vTransID = new Date().getTime().toString();
                            // Parallel processing logic to export huge data buckets
                            if (oReqCfg.sales.length > 5000) {
                                let iChnk, iChkCounter = 0;
                                // Initialize Parallel processing
                                let resUrlPP = "/InitiateParallelProcess?ScenarioID=''&VersionID=''&PlanningArea='" + liParaValue[0].VALUE + "'&Transactionid='" + vTransID + "'";
                                try {
                                    let reqPP = await service.tx(req).put(resUrlPP);
                                }
                                catch (e) {
                                    console.log(e);
                                }
                                // Divide into multiple arrays with each array length as 5000
                                chunked = true;
                                let aData = oReqCfg.sales;
                                chunksList = [];
                                const chunkSize = 5000;
                                for (let i = 0; i < aData.length; i += chunkSize) {
                                    const chunk = aData.slice(i, i + chunkSize)
                                    chunksList.push(chunk);
                                }
                                // Process each chunk to IBP
                                for (let iChnk = 0; iChnk < chunksList.length; iChnk++) {
                                    let oEntryCfgPP =
                                    {
                                        "Transactionid": vTransID,
                                        "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,ACTUALDEMANDVC,PERIODID0_TSTAMP",
                                        "VersionID": "",
                                        "ScenarioID": ""
                                    }
                                    oEntryCfgPP[lData] = chunksList[iChnk];
                                    try {
                                        await service.tx(req).post(lEntity, oEntryCfgPP);
                                        iChkCounter = iChkCounter + 1;
                                    }
                                    catch (err) {
                                        console.log(err);
                                        // iChkCounter = 0;
                                        // console.log(err.message);
                                    }
                                }
                                // If all are successfull commit the request
                                if (iChkCounter > 0) {
                                    let resUrlPPCommit = "/commit?P_TransactionID='" + vTransID + "'&$format=json";
                                    try {
                                        let reqPPCommit = await service.tx(req).get(resUrlPPCommit);
                                        lMessage = lMessage + ' ' + 'Export of Sales History and Configuration is successful for product:' + lsData.PRODUCT_ID;
                                    }
                                    catch (e) {
                                        console.log(e);
                                        console.log("Error while committing the parallel processing");
                                    }
                                }
                            }
                            // If is less that 5000 records
                            else {
                                let oEntryCfg =
                                {
                                    "Transactionid": vTransID,
                                    "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,ACTUALDEMANDVC,PERIODID0_TSTAMP",
                                    "VersionID": "",
                                    "DoCommit": true,
                                    "ScenarioID": ""
                                }
                                oEntryCfg[lData] = oReqCfg.sales;
                                try {
                                    await service.tx(req).post(lEntity, oEntryCfg);
                                    aReturn.status = 'X';
                                    lMessage = lMessage + ' ' + 'Export of Sales History, Configuration, In-Transit and On-HandStock is successful for product:' + lsData.PRODUCT_ID;

                                }
                                catch (err) {
                                    console.log(err);
                                    // console.log(err.message);
                                    lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                                }
                            }
                        }
                        //In transit services
                        if (oReqStock.stock.length > 0) {
                            // Sales stock In-transit
                            let vTransIDTrans = new Date().getTime().toString();
                            let oEntryTrans =
                            {
                                "Transactionid": vTransIDTrans,
                                "AggregationLevelFieldsString": "LOCID,PRDID,LOCFR,STOCKINTRANSIT,PERIODID0_TSTAMP",
                                "VersionID": "",
                                "DoCommit": true,
                                "ScenarioID": ""
                            }
                            oEntryTrans[lData] = oReqStock.stock;
                            try {
                                await service.tx(req).post(lEntity, oEntryTrans);
                                aReturn.status = 'X';
                                lMessage = lMessage + ' ' + 'Export of Sales In-Transit is successful for product:' + lsData.PRODUCT_ID;

                            }
                            catch (err) {
                                console.log(err);
                                lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                            }
                        }
                        //In transit service config
                        if (oReqStockCfg.stockcfg.length > 0) {
                            let vTransIDInTrans = new Date().getTime().toString();
                            let oEntryTransIntrans =
                            {
                                "Transactionid": vTransIDInTrans,
                                "AggregationLevelFieldsString": "LOCID,PRDID,LOCFR,VCCHAR,VCCHARVALUE,VCCLASS,STOCKINTRANSITATVC,PERIODID0_TSTAMP",
                                "VersionID": "",
                                "DoCommit": true,
                                "ScenarioID": ""
                            }
                            oEntryTransIntrans[lData] = oReqStockCfg.stockcfg;

                            try {
                                await service.tx(req).post(lEntity, oEntryTransIntrans);
                                aReturn.status = 'X';
                                lMessage = lMessage + ' ' + 'Export of Sales In-transit config is successful for product:' + lsData.PRODUCT_ID;

                            }
                            catch (err) {
                                console.log(err);
                                lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                            }
                        }
                        //on Hand 
                        if (oReqStockhd.stockhd.length > 0) {
                            // Sales On hand 
                            let vTransIDTranshand = new Date().getTime().toString();
                            let oEntryHDTranshand =
                            {
                                "Transactionid": vTransIDTranshand,
                                "AggregationLevelFieldsString": "LOCID,PRDID,STOCKONHAND,PERIODID0_TSTAMP",
                                "VersionID": "",
                                "DoCommit": true,
                                "ScenarioID": ""
                            }
                            oEntryHDTranshand[lData] = oReqStockhd.stockhd;
                            try {
                                await service.tx(req).post(lEntity, oEntryHDTranshand);
                                aReturn.status = 'X';
                                lMessage = lMessage + ' ' + 'Export of Sales on-HandStock is successful for product:' + lsData.PRODUCT_ID;

                            }
                            catch (err) {
                                console.log(err);
                                lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                            }
                        }
                        if (oReqStockhdCfg.stockhdcfg.length > 0) {
                            // Sales stock on-Hand
                            let vTransIDonHandcfg = new Date().getTime().toString();
                            let oEntryTransonHandcfg =
                            {
                                "Transactionid": vTransIDonHandcfg,
                                "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,STOCKONHANDATVC,PERIODID0_TSTAMP",
                                "VersionID": "",
                                "DoCommit": true,
                                "ScenarioID": ""
                            }
                            oEntryTransonHandcfg[lData] = oReqStockhdCfg.stockhdcfg;

                            try {
                                await service.tx(req).post(lEntity, oEntryTransonHandcfg);
                                aReturn.status = 'X';
                                lMessage = lMessage + ' ' + 'Export of Sales On-HandStock config is successful for product:' + lsData.PRODUCT_ID;
                                

                            }
                            catch (err) {
                                console.log(err);
                                lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                            }
                        }

                    }
                }
                else {
                    lMessage = 'Export of Sales History and Configuration export is unsuccessful for product: ' + lsData.PRODUCT_ID + ' becuase of insufficient data';
                }
            }
            
        }
        aReturn.message = (aReturn.status == 'X')?'Export  Sales History Successful':'Export  Sales History Failed';
        aReturn.status = aReturn.status;
        return aReturn;
    }
    async exportIBPSeedOrdTransFn(req,service,_servicePost) {
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
        let oReq = {
            sales: [],
        },
            oReqCfg = {
                sales: [],
            }, aReturn = {},lMessage = '', lSuccess='';
        let vsales;
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let lsData = {};
        let lilocProdReq = JSON.parse(req.data.LocProdData);
       
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        }
        else {
            lilocProd = JSON.parse(req.data.LocProdData);
        }

        const lsSales = await GenF.getParameterValue(lilocProdReq[0].LOCATION_ID, 11);

        const lsMaxDate = await SELECT.one.columns("MAX(WEEK_DATE) AS MAX_DATE")
            .from('V_IBP_SALESH_ACTDEMD');
        let vToDate = lsMaxDate.MAX_DATE;

        let vFromDate = new Date();
        vFromDate.setDate(vFromDate.getDate() - (parseInt(lsSales) * 7));
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];
        lSuccess = '';
        let liDates = obibpfucntions.generateDateseries(vFromDate, vToDate);
        for (let i = 0; i < lilocProd.length; i++) {
            lsData = {};
            oReq = {
                sales: [],
            };
            lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
            // Sales history based on Location and a Partial Product
            const lisales = await cds.run(
                `
                    SELECT  DISTINCT "WEEK_DATE",
                            "LOCATION_ID",
                            "PRODUCT_ID",
                            "ADJ_QTY",
                            "CUSTOMER_GROUP"
                            FROM V_IBP_SALESH_ACTDEMD
                            WHERE LOCATION_ID = '`+ lsData.LOCATION_ID + `'
                               AND PRODUCT_ID = '`+ lsData.PRODUCT_ID +
                `'`);
            const liCust = await cds.run(
                `
                        SELECT DISTINCT 
                                "LOCATION_ID",
                                "PRODUCT_ID",
                                "CUSTOMER_GROUP"
                                FROM V_IBP_SALESH_ACTDEMD
                                WHERE LOCATION_ID = '`+ lsData.LOCATION_ID + `'
                                   AND PRODUCT_ID = '`+ lsData.PRODUCT_ID +
                `'`);
            // Get Date series from Sales H start and end week
            if (lisales.length > 0) {
                let vDemd, vAdjqty, vWeekDate, lSuccess = '';
                for (let iDate = 0; iDate < liDates.length; iDate++) {
                    for (let iCust = 0; iCust < liCust.length; iCust++) {
                        lSuccess = '';
                        for (let i = 0; i < lisales.length; i++) {
                            vDemd = "", vAdjqty = "", vWeekDate = "";
                            if (liDates[iDate].WEEK_DATE === lisales[i].WEEK_DATE &&
                                liCust[iCust].CUSTOMER_GROUP === lisales[i].CUSTOMER_GROUP) {
                                vWeekDate = new Date(lisales[i].WEEK_DATE).toISOString().split('Z');
                                // vDemd = lisales[i].ORD_QTY.split('.');
                                vAdjqty = lisales[i].ADJ_QTY.split('.');
                                vsales = {
                                    "LOCID": lisales[i].LOCATION_ID,
                                    "PRDID": lisales[i].PRODUCT_ID,
                                    "CUSTID": lisales[i].CUSTOMER_GROUP,
                                    // "ACTUALDEMAND": vDemd[0],
                                    "SEEDORDERDEMAND": vAdjqty[0],
                                    "PERIODID0_TSTAMP": vWeekDate[0]
                                };
                                lSuccess = 'X';
                                oReq.sales.push(vsales);
                            }
                        }
                        if (lSuccess === '') {
                            vWeekDate = new Date(liDates[iDate].WEEK_DATE).toISOString().split('Z');
                            vDemd = "-1";
                            vAdjqty = "-2";
                            vsales = {
                                "LOCID": lsData.LOCATION_ID,
                                "PRDID": lsData.PRODUCT_ID,
                                "CUSTID": liCust[iCust].CUSTOMER_GROUP,
                                "SEEDORDERDEMAND": vAdjqty,
                                "PERIODID0_TSTAMP": vWeekDate[0]
                            };
                            oReq.sales.push(vsales);
                        }
                    }
                }
                if (oReq.sales.length > 0) {

                    let vTransID = new Date().getTime().toString();
                    let oEntry =
                    {
                        "Transactionid": vTransID,
                        "AggregationLevelFieldsString": "LOCID,PRDID,CUSTID,SEEDORDERDEMAND,PERIODID0_TSTAMP",
                        "VersionID": "",
                        "DoCommit": true,
                        "ScenarioID": ""
                    }
                    oEntry[lData] = oReq.sales
                    try {
                        await service.tx(req).post(lEntity, oEntry);
                        lSuccess = 'S';
                    }
                    catch (err) {
                        console.log("Unable to send Actual demand at VC");
                    }
                    // Once Sales History is successfull , send sales Config . Actual demand at VC
                    if (lSuccess === 'S') {
                        oReqCfg = {
                            sales: [],
                        };
                        oReqCfg = await obibpfucntions.exportSeedOrdCfg(lsData, liDates);

                        if (oReqCfg.sales.length > 0) {
                            // Sales History Config
                            let vTransID = new Date().getTime().toString();
                            let oEntryCfg =
                            {
                                "Transactionid": vTransID,
                                "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,SEEDORDERDEMANDVC,PERIODID0_TSTAMP",
                                "VersionID": "",
                                "DoCommit": true,
                                "ScenarioID": ""
                            }
                            oEntryCfg[lData] = oReqCfg.sales;
                            try {
                                await service.tx(req).post(lEntity, oEntryCfg);
                                lSuccess = 'X';
                                lMessage = lMessage + ' ' + 'Export of Seedorder History and Configuration is successful for product:' + lsData.PRODUCT_ID;

                            }
                            catch (err) {
                                lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                            }
                        }
                    }
                }
            }
            else {
                lMessage = lMessage + ' ' + 'No Seedorder for product:' + lsData.PRODUCT_ID;
            }

        }
        aReturn.status = lSuccess;
        aReturn.message = lMessage;
        return aReturn;
    }
    async exportActCompDemandFn(req,service,_servicePost) {
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";

        let oReq = {
            actcomp: [],
        }, aReturn = {},
            vactcomp;
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let lsData = {}, lMessage ='', lSuccess ='';
       
        let lilocProdReq = JSON.parse(req.data.LocProdData);
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        }
        else {
            lilocProd = JSON.parse(req.data.LocProdData);
        }
        lSuccess = '';
        // Fetch History period from Configuration table
        const lsSales = await GenF.getParameterValue(lilocProd[0].LOCATION_ID, 11);

        const lsMaxDate = await SELECT.one.columns("MAX(WEEK_DATE) AS MAX_DATE")
            .from('V_IBP_SALESH_ACTDEMD');
        let vToDate = lsMaxDate.MAX_DATE;

        let vFromDate = new Date();
        vFromDate.setDate(vFromDate.getDate() - (parseInt(lsSales) * 7));
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];
        console.log(vFromDate);

        for (let i = 0; i < lilocProd.length; i++) {
            lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
            lsData.CRITICALKEY = lilocProd[i].CRITICALKEY;

            const liactcomp = await cds.run(
                `
            SELECT DISTINCT "WEEK_DATE",
                    "LOCATION_ID",
                    "FACTORY_LOC",
                    "PRODUCT_ID",
                    "REF_PRODID",
                    "ACTUALCOMPONENTDEMAND",
                    "COMPONENT"
                    FROM V_IBP_LOCPRODCOMP_ACTDEMD
                    WHERE LOCATION_ID = '`+ lsData.LOCATION_ID + `'
                       AND PRODUCT_ID = '`+ lsData.PRODUCT_ID +
                `' AND WEEK_DATE >= '` + vFromDate +
                `' AND WEEK_DATE <= '` + vToDate + `'`);


            if (lsData.CRITICALKEY === "X") {
                // getting config product for partial

                let lMainProduct = '';
                // Get Configurable product
                let lsMainProduct = await SELECT.one
                    .from('CP_PARTIALPROD_INTRO')
                    .columns('REF_PRODID')
                    .where(`LOCATION_ID = '${lsData.LOCATION_ID}' AND PRODUCT_ID = '${lsData.PRODUCT_ID}'`);
                if (lsMainProduct === null || lsMainProduct == undefined) {
                    lMainProduct = GenF.parse(lsData.PRODUCT_ID);
                }
                else {
                    lMainProduct = lsMainProduct.REF_PRODID;
                }

                let lsFactory = await SELECT.one
                    .from('CP_FACTORY_SALESLOC')
                    .columns('FACTORY_LOC')
                    .where(`LOCATION_ID = '${lsData.LOCATION_ID}' AND PRODUCT_ID = '${lsData.PRODUCT_ID}'`);
                if (lsFactory === null) {
                    lMessage = lMessage + ' ' + 'Please maintain Planning network maintenance for Location :' + lsData.LOCATION_ID + 'and Product: '+ lsData.PRODUCT_ID;
                }
                else{
                    let aData = {};
                    aData.LOCATION_ID = lsFactory.FACTORY_LOC;//lsData.LOCATION_ID;
                    aData.PRODUCT_ID = lMainProduct;
                    // Getting only critical assemblys
                    const objCatFn = new Catservicefn();
                    const licriticalcomp = await objCatFn.getCriticalAsmbs(aData);
                    for (let i = 0; i < liactcomp.length; i++) {
                        for (let j = 0; j < licriticalcomp.length; j++) {
                            if (liactcomp[i].FACTORY_LOC === licriticalcomp[j].LOCATION_ID &&
                                liactcomp[i].REF_PRODID === licriticalcomp[j].PRODUCT_ID &&
                                //liactcomp[i].ITEM_NUM === licriticalcomp[j].ITEM_NUM &&
                                liactcomp[i].COMPONENT === licriticalcomp[j].ASSEMBLY) {

                                let vWeekDate = new Date(liactcomp[i].WEEK_DATE).toISOString().split('Z');
                                let vDemd = liactcomp[i].ACTUALCOMPONENTDEMAND.split('.');

                                vactcomp = {
                                    "LOCID": liactcomp[i].LOCATION_ID,
                                    "PRDID": liactcomp[i].PRODUCT_ID,
                                    "ACTUALCOMPONENTDEMAND": vDemd[0],
                                    "PRDFR": liactcomp[i].COMPONENT,
                                    "PERIODID0_TSTAMP": vWeekDate[0]
                                };

                                oReq.actcomp.push(vactcomp);
                            }
                        }
                    }
                }
            } else {
                for (let i = 0; i < liactcomp.length; i++) {
                    let vWeekDate = new Date(liactcomp[i].WEEK_DATE).toISOString().split('Z');
                    let vDemd = liactcomp[i].ACTUALCOMPONENTDEMAND.split('.');
                    vactcomp = {
                        "LOCID": liactcomp[i].LOCATION_ID,
                        "PRDID": liactcomp[i].PRODUCT_ID,
                        "ACTUALCOMPONENTDEMAND": vDemd[0],
                        "PRDFR": liactcomp[i].COMPONENT,
                        "PERIODID0_TSTAMP": vWeekDate[0]
                    };
                    oReq.actcomp.push(vactcomp);
                }
            }
            if (oReq.actcomp.length > 0) {
                let vTransID = new Date().getTime().toString();
                let oEntry =
                {
                    "Transactionid": vTransID,
                    "AggregationLevelFieldsString": "LOCID,PRDID,ACTUALCOMPONENTDEMAND,PERIODID0_TSTAMP,PRDFR",
                    "VersionID": "",
                    "DoCommit": true,
                    "ScenarioID": ""
                }
                oEntry[lData] = oReq.actcomp;
                try {
                    await service.tx(req).post(lEntity, oEntry);
                    let resUrl = "/getExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                    await service.tx(req).get(resUrl);
                    lSuccess = 'X';
                    lMessage = lMessage + ' ' + 'Export of Actual Component Demand is successfull for product:' + lsData.PRODUCT_ID;
                }
                catch {
                    lMessage = lMessage + ' ' + 'Export of Actual Component Demand failed for product:' + lsData.PRODUCT_ID;
                }
            }
            else {
                lMessage = lMessage + ' ' + 'No Actual Component Demand exists on Crtical components for product:' + lsData.PRODUCT_ID;
            }
        }
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    async exportMktAuthFn(request,service,servicePost) {

       let aReturnStatus = {};
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
        let oReq = {
            mktauth: [],
        },
            vFlag = '', lMessage = '', lSuccess;

        // Generating payload for job scheduler logs
        let lilocProd = {}, aReturn = {};
        let lsData = {};
      
        let lilocProdReq = JSON.parse(request.data.LocProdData);
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        }
        else {
            lilocProd = JSON.parse(request.data.LocProdData);
        }
        for (let i = 0; i < lilocProd.length; i++) {
            lsData = {};
            lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
            
            await obibpfucntions.exportMarketauthIBP(lilocProd[i], request, service, servicePost, aReturn)
            lMessage = aReturn.Message;
            lSuccess = aReturn.Success;
            if (lSuccess === 'S') {
                lMessage = lMessage + ' ' + "Export of Market authorization is successfull for product" + lsData.PRODUCT_ID;
                vFlag = 'X';
                aReturnStatus.message = lMessage;
                aReturnStatus.status = vFlag;
            }
            else {
                vFlag = '';
                lMessage = lMessage + ' ' + "Export of Market authorization has failed for product" + lsData.PRODUCT_ID;
                aReturnStatus.message = lMessage;
                aReturnStatus.status = vFlag;
            }
        }
        return aReturnStatus;
    }
    async exportComponentReqFn(req,service,_servicePost) {
       // Send Response to Scheduler

       // Get Planning area and Prefix configurations for IBP
       let liParaValue = await GenF.getIBPParameterValue();
       let lData = "Nav" + liParaValue[0].VALUE.toString();
       let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
       let oReq = {
           actcompreq: [],
       }, 
       aReturn = {},
           vactcompreq, lMessage = '';
       let liactcompreq, lSuccess = '',flag ='';
       // CHnage on 19-Mar-23
       // to get assembly req as 0 for not demand
       const liProdAsmb = await cds.run(
           `
           SELECT DISTINCT
                   A."LOCATION_ID",
                   B."PRODUCT_ID",
                   B."REF_PRODID",
                   A."COMPONENT",
                   A."COMP_QTY",
                   A."VALID_FROM",
                   A."VALID_TO"
             FROM "V_BOMOD_DEMDFACLOC" AS A
       INNER JOIN CP_PARTIALPROD_INTRO AS B
               ON 	A.LOCATION_ID = B.LOCATION_ID
               AND A.PRODUCT_ID = B.REF_PRODID
             WHERE A.LOCATION_ID = '`+ req.data.LOCATION_ID + `'
               AND B.REF_PRODID = '`+ req.data.PRODUCT_ID + `'`);

       // Build Date ranges
       let liDates = obibpfucntions.generateDateseries(req.data.FROMDATE, req.data.TODATE);
       let lMethod = await GenF.getParameterValue(req.data.LOCATION_ID, 5);
       switch (await GenF.getParameterValue(req.data.LOCATION_ID, 5)) {
           case 'M1':
               liactcompreq = await cds.run(
                   `
                       SELECT DISTINCT "WEEK_DATE",
                               "LOCATION_ID",
                               "PRODUCT_ID",
                               "COMPONENT",
                               "COMP_QTY"
                               FROM V_ASSEMBLYREQ
                               WHERE LOCATION_ID = '`+ req.data.LOCATION_ID + `'
                                  AND REF_PRODID = '`+ req.data.PRODUCT_ID +
                   `' AND MODEL_VERSION = 'Active'
                   AND WEEK_DATE >= '` + req.data.FROMDATE +
                   `' AND WEEK_DATE <= '` + req.data.TODATE + `'
                                  AND COMP_QTY > 0`);
               break;
           case 'M2':
               liactcompreq = await cds.run(
                   `
               SELECT DISTINCT "CP_ASSEMBLY_REQ"."WEEK_DATE",
                               "CP_ASSEMBLY_REQ"."LOCATION_ID",
                               "CP_ASSEMBLY_REQ"."PRODUCT_ID",
                               "CP_FACTORY_SALESLOC"."FACTORY_LOC",
                               "CP_ASSEMBLY_REQ"."COMPONENT",
                               "CP_ASSEMBLY_REQ"."REF_PRODID",
                               "CP_ASSEMBLY_REQ"."COMPCIR_QTY" AS "COMP_QTY"
                       FROM CP_ASSEMBLY_REQ 
                      INNER JOIN CP_FACTORY_SALESLOC
                         ON CP_ASSEMBLY_REQ.LOCATION_ID = CP_FACTORY_SALESLOC.LOCATION_ID
                        AND CP_ASSEMBLY_REQ.PRODUCT_ID = CP_FACTORY_SALESLOC.PRODUCT_ID
                      WHERE CP_ASSEMBLY_REQ.LOCATION_ID = '`+ req.data.LOCATION_ID + `'
                        AND CP_ASSEMBLY_REQ.REF_PRODID = '`+ req.data.PRODUCT_ID +
                     `' AND CP_ASSEMBLY_REQ.MODEL_VERSION = 'Active'
                        AND CP_ASSEMBLY_REQ.WEEK_DATE >= '` + req.data.FROMDATE +
                     `' AND CP_ASSEMBLY_REQ.WEEK_DATE <= '` + req.data.TODATE + `'
                        AND CP_ASSEMBLY_REQ.COMPCIR_QTY >= 0`);
               break;
       }

       if (req.data.CRITICALKEY === "X") {  // && lMethod === 'M2') {
           // getting config product for partial
           let lMainProduct = '';
           // Get Configurable product
           let lsMainProduct = await SELECT.one
               .from('CP_PARTIALPROD_INTRO')
               .columns('REF_PRODID')
               .where(`LOCATION_ID = '${lsData.LOCATION_ID}' AND PRODUCT_ID = '${lsData.PRODUCT_ID}'`);
           if (lsMainProduct === null || lsMainProduct == undefined) {
               lMainProduct = GenF.parse(lsData.PRODUCT_ID);
           }
           else {
               lMainProduct = lsMainProduct.REF_PRODID;
           }
           // Get factory location
           let lsFactory = await SELECT.one
               .from('CP_FACTORY_SALESLOC')
               .columns('FACTORY_LOC')
               .where(`LOCATION_ID = '${lsData.LOCATION_ID}' AND PRODUCT_ID = '${lsData.PRODUCT_ID}'`);
           if (lsFactory === null) {
               lMessage = lMessage + ' ' + 'Please maintain Planning network maintenance for Location :' + lsData.LOCATION_ID + 'and Product: '+ lsData.PRODUCT_ID;
           }
           else{
               let aData = {};
               aData.LOCATION_ID = lsFactory.FACTORY_LOC;
               aData.PRODUCT_ID = lMainProduct;
               // Getting only critical assemblys
               const objCatFn = new Catservicefn();
               const licriticalcomp = await objCatFn.getCriticalAsmbs(aData);
           for (var i = 0; i < liactcompreq.length; i++) {
               // Check for only critical assembly
               for (let j = 0; j < licriticalcomp.length; j++) {
                   if (liactcompreq[i].FACTORY_LOC === licriticalcomp[j].LOCATION_ID &&
                       liactcompreq[i].REF_PRODID === licriticalcomp[j].PRODUCT_ID &&
                       //liactcompreq[i].ITEM_NUM === licriticalcomp[j].ITEM_NUM &&
                       liactcompreq[i].COMPONENT === licriticalcomp[j].ASSEMBLY) {

                       let vWeekDate = new Date(liactcompreq[i].WEEK_DATE).toISOString().split('Z');
                       let vDemd = parseFloat(liactcompreq[i].COMP_QTY).toFixed(2);

                       vactcompreq = {
                           "LOCID": liactcompreq[i].LOCATION_ID,
                           "PRDID": liactcompreq[i].PRODUCT_ID,
                           "PRDFR": liactcompreq[i].COMPONENT,
                           "COMPONENTREQUIREMENTQTY": vDemd.toString(),
                           "PERIODID0_TSTAMP": vWeekDate[0]
                       };
                       oReq.actcompreq.push(vactcompreq);
                   }
               }

           }
       }
       } else {
           for (var iD = 0; iD < liDates.length; iD++) {
               for (k = 0; k < liProdAsmb.length; k++) {
                   lSuccess = '';
                   for (var i = 0; i < liactcompreq.length; i++) {
                       if (liactcompreq[i].LOCATION_ID === liProdAsmb[k].LOCATION_ID &&
                           liactcompreq[i].PRODUCT_ID === liProdAsmb[k].PRODUCT_ID &&
                           liactcompreq[i].COMPONENT === liProdAsmb[k].COMPONENT &&
                           liactcompreq[i].WEEK_DATE === liDates[iD].WEEK_DATE) {
                           let vWeekDate = new Date(liactcompreq[i].WEEK_DATE).toISOString().split('Z');
                           let vDemd = parseFloat(liactcompreq[i].COMP_QTY).toFixed(2);
                           vactcompreq = {
                               "LOCID": liactcompreq[i].LOCATION_ID,
                               "PRDID": liactcompreq[i].PRODUCT_ID,
                               "PRDFR": liactcompreq[i].COMPONENT,
                               "COMPONENTREQUIREMENTQTY": vDemd.toString(),
                               "PERIODID0_TSTAMP": vWeekDate[0]
                           };
                           oReq.actcompreq.push(GenF.parse(vactcompreq));
                           lSuccess = 'X';
                           break;
                       }
                   }
                   if (lSuccess === '') {
                       let vWeekDate = new Date(liDates[iD].WEEK_DATE).toISOString().split('Z');
                       let vDemd = "0";
                       vactcompreq = {
                           "LOCID": liProdAsmb[k].LOCATION_ID,
                           "PRDID": liProdAsmb[k].PRODUCT_ID,
                           "PRDFR": liProdAsmb[k].COMPONENT,
                           "COMPONENTREQUIREMENTQTY": vDemd,
                           "PERIODID0_TSTAMP": vWeekDate[0]
                       };
                       oReq.actcompreq.push(GenF.parse(vactcompreq));
                       // break;
                   }
               }
           }
       }

       if (oReq.actcompreq.length > 0) {
           let vTransID = new Date().getTime().toString();
           let oEntry =
           {
               "Transactionid": vTransID,
               "AggregationLevelFieldsString": "LOCID,PRDID,PRDFR,COMPONENTREQUIREMENTQTY,PERIODID0_TSTAMP",
               "VersionID": "",
               "DoCommit": true,
               "ScenarioID": ""
           }
           oEntry[lData] = oReq.actcompreq;
           try {
               await service.tx(req).post(lEntity, oEntry);
               //let resUrl = "/getExportResult?P_TransactionID='" + vTransID + "'";
               let resUrl = "/getExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
               await service.tx(req).get(resUrl);
               flag = 'X';
           }
           catch {

           }
           if (flag === 'X') {
               lMessage = lMessage + ' ' + 'Export of Assembly requirement Quantity is successful for product:' + req.data.PRODUCT_ID;
           } else {
               lMessage = lMessage + ' ' + 'Export of Assembly requirement Quantity failed for product:' + req.data.PRODUCT_ID;
           }
       }
       else {
           lMessage = lMessage + ' ' + 'Export of Assembly requirement Quantity failed as no critical Assemblies exists for product:' + req.data.PRODUCT_ID;
       }
       aReturn.message = lMessage;
       aReturn.status = flag;
        return aReturn;
    }
    async exportIBPCIRFn(request,service,_servicePost) {
          // Get Planning area and Prefix configurations for IBP
          let liParaValue = await GenF.getIBPParameterValue();
          let lData = "Nav" + liParaValue[0].VALUE.toString();
          let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
          let oReq = {
              cir: [],
          },aReturn = {},
              oReqProdDmnd = {
                  cirproddmnd: [],
              },
              lMessage = '',
              vCIR;
            var flag ='';
          // Generating payload for job scheduler logs
          let lilocProd = {};
          let lsData = {};
         
          let lilocProdReq = JSON.parse(request.data.LocProdData);
          if (lilocProdReq[0].PRODUCT_ID === "ALL") {
              lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
              lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
              const objCatFn = new Catservicefn();
              const lilocProdT = await objCatFn.getAllProducts(lsData);
              lsData = {};
              const litemp = JSON.stringify(lilocProdT);
              lilocProd = JSON.parse(litemp);
          }
          else {
              lilocProd = JSON.parse(request.data.LocProdData);
          }
      
          for (let iloc = 0; iloc < lilocProd.length; iloc++) {
              flag = ' ';
              lsData.LOCATION_ID = lilocProd[iloc].LOCATION_ID;
              lsData.PRODUCT_ID = lilocProd[iloc].PRODUCT_ID;
  
              // CIR Demand at Characteristics Level
              const licir = await cds.run(
                  `
                  SELECT *
                     FROM "V_CIRTOIBP" 
                     WHERE LOCATION_ID = '`+ lsData.LOCATION_ID + `'
                                AND PRODUCT_ID = '`+ lsData.PRODUCT_ID + `'
                                AND MODEL_VERSION = 'Active'`);
  
              // CIR Demand at Product Level    
              const liCIRProdDmnd = await cds.run(`SELECT 
                                                      A."LOCATION_ID",
                                                      A."PRODUCT_ID",
                                                      A."WEEK_DATE",
                                                      A."MODEL_VERSION",
                                                      A."VERSION",
                                                      A."SCENARIO",
                                                      SUM("CIR_QTY") AS CIRQTY
                                                  FROM 
                                                      CP_CIR_GENERATED AS A
                                                  WHERE A.LOCATION_ID = '${lsData.LOCATION_ID}'
                                                    AND A.PRODUCT_ID = '${lsData.PRODUCT_ID}'
                                                  GROUP BY 
                                                      A."LOCATION_ID",
                                                      A."PRODUCT_ID",
                                                      A."WEEK_DATE",
                                                      A."MODEL_VERSION",
                                                      A."VERSION",
                                                      A."SCENARIO"
                                                  ORDER BY 
                                                      A."LOCATION_ID" ASC, 
                                                      A."PRODUCT_ID" ASC, 
                                                      A."WEEK_DATE" ASC, 
                                                      A."MODEL_VERSION" ASC, 
                                                      A."VERSION" ASC, 
                                                      A."SCENARIO" ASC`);
  
              for (let j = 0; j < liCIRProdDmnd.length; j++) {
  
                  let vWeekDate = new Date(liCIRProdDmnd[j].WEEK_DATE).toISOString().split('Z')[0];
                  vCIR = {
                      "LOCID": liCIRProdDmnd[j].LOCATION_ID,
                      "PRDID": liCIRProdDmnd[j].PRODUCT_ID,
                      "PRODFORECASTORDERQTY": liCIRProdDmnd[j].CIRQTY.toString(),
                      "PERIODID4_TSTAMP": vWeekDate
                  };
                  oReqProdDmnd.cirproddmnd.push(vCIR);
              }
  
  
              //const li_Transid = servicePost.tx(req).get("/GetTransactionID");
              for (let i = 0; i < licir.length; i++) {
  
                  let vWeekDate = new Date(licir[i].WEEK_DATE).toISOString().split('Z')[0];
                  vCIR = {
                      "LOCID": licir[i].LOCATION_ID,
                      "PRDID": licir[i].PRODUCT_ID,
                      "VCCLASS": licir[i].CLASS_NUM,
                      "VCCHAR": licir[i].CHAR_NUM,
                      "VCCHARVALUE": licir[i].CHARVAL_NUM,
                      // "CUSTID": "NULL",
                      "FORECASTORDERQTY": licir[i].CIRQTY.toString(),
                      "PERIODID4_TSTAMP": vWeekDate
                  };
                  oReq.cir.push(vCIR);
              }
  
              if (oReqProdDmnd.cirproddmnd.length > 0) {
                  let vTransID = new Date().getTime().toString();
                  let oEntry =
                  {
                      "Transactionid": vTransID,
                      "AggregationLevelFieldsString": "LOCID,PRDID,PRODFORECASTORDERQTY,PERIODID4_TSTAMP",
                      "DoCommit": true
                  }
                  oEntry[lData] = oReqProdDmnd.cirproddmnd;
                  try {
                      await service.tx(request).post(lEntity, oEntry);
                      flag = 'X';
                  }
                  catch (err) {
                      console.log(err);
                      flag = ' ';
                  }
              }
  
  
              // if (oReq.cir.length > 0) {
              if (oReq.cir.length > 0 && flag === 'X') {
                  flag = ' ';
                  let vTransID = new Date().getTime().toString();
                  let oEntry =
                  {
                      "Transactionid": vTransID,
                      "AggregationLevelFieldsString": "LOCID,PRDID,VCCLASS,VCCHAR,VCCHARVALUE,FORECASTORDERQTY,PERIODID4_TSTAMP",
                      "DoCommit": true
                  }
                  oEntry[lData] = oReq.cir;
                  try {
                      await service.tx(request).post(lEntity, oEntry);
                      flag = 'X';
                  }
                  catch (err) {
                      console.log(err);
                      flag = ' ';
                  }
  
                  if (flag === 'X') {
                      lMessage = lMessage + ' ' + "Export of CIR to IBP is successful at product and Characteristics for" + lsData.PRODUCT_ID;
                      aReturn.message = lMessage;
                      aReturn.status = flag;
                  } else {
                      lMessage = lMessage + ' ' + "Export of CIR to IBP is successful at product and failed at Characteristics for" + lsData.PRODUCT_ID;
                      aReturn.message = lMessage;
                      aReturn.status = flag;
                    }
              }
              else {
                  lMessage = lMessage + ' ' + "Export of CIR to IBP is unsuccessful product" + lsData.PRODUCT_ID + " beacuse of insufficient data ";
                  aReturn.message = lMessage;
                  aReturn.status = flag;
                }
              // return "S";
          }
          return aReturn;
    }
    // STEP 2
    async generateFDemandQty(request,service,_servicePost) {
        // Get IBP planning area
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let flag ='', lMessage = '', vScenario = '';
        // Generating payload for job scheduler logs
        let lilocProd = {}, aReturn={};

        let lsData = {};
       
        let lilocProdReq = JSON.parse(request.data.LocProdData);
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        }
        else {
            lilocProd = JSON.parse(request.data.LocProdData);
        }
        let oResponse = await obibpfucntions.importVerScen(request);
        if (oResponse.flag === 'S') {
            lMessage = "Successfully imported version scenario from IBP";
        } else {
            lMessage = "Failed to import version scenario from IBP";
        }
        flag = '';
        lMessage = '';
        // Fetch 2 years Char plan
        let vFromDate = new Date();
        vFromDate.setDate(vFromDate.getDate());
        vFromDate = vFromDate.toISOString().split('Z')[0];

        let vDate = new Date();
        var vYear = vDate.getFullYear();
        var vMonth = vDate.getMonth();
        var vDay = vDate.getDate();
        // Forecast Order Horizon
        let lWeeks = await GenF.getParameterValue(lilocProdReq[0].LOCATION_ID, 2);
        var vToDate = new Date(vYear, vMonth, (vDay + parseInt(7 * lWeeks)));

        vToDate = vToDate.toISOString().split('Z')[0];
        // Fetch IBP demand
        for (let iloc = 0; iloc < lilocProd.length; iloc++) {
            //Fetch Customer group
            let lsCustomer = await SELECT.one
                .from('V_SALES_H')
                .columns('CUSTOMER_GROUP')
                .where(`PRODUCT_ID = '${lilocProd[iloc].PRODUCT_ID}' AND LOCATION_ID = '${lilocProd[iloc].LOCATION_ID}'`);
            lsData.LOCATION_ID = lilocProd[iloc].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[iloc].PRODUCT_ID;
            // Request URL to IBP
            let resUrl = "/" + liParaValue[0].VALUE + "?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP gt datetime'" + vFromDate + "' and PERIODID4_TSTAMP lt datetime'" + vToDate + "' and UOMTOID eq 'EA' and CUSTID eq '" + lsCustomer.CUSTOMER_GROUP + "'";

            // req.headers['Application-Interface-Key'] = vAIRKey;
            let req = await service.tx(request).get(resUrl);
            // if(req.length > 0){
            const vDelDate = new Date();
            const vDateDeld = vDelDate.toISOString().split('T')[0];
            try {
                await DELETE.from('CP_IBP_FUTUREDEMAND')
                    .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                            AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                            AND WEEK_DATE  < '${vDateDeld}'`);
            }
            catch (e) {
                //Do nothing
            }
            // }
            // Convert date to ISO
            const dateJSONToEDM = jsonDate => {
                const content = /\d+/.exec(String(jsonDate));
                const timestamp = content ? Number(content[0]) : 0;
                const date = new Date(timestamp);
                const string = date.toISOString().split('T')[0];
                return string;
            };
            flag = '';
            // Loop request to insert into 
            for (let i in req) {
                let vWeekDate = dateJSONToEDM(req[i].PERIODID4_TSTAMP);

                if (req[i].SCENARIOID === '' || req[i].SCENARIOID === null) {
                    vScenario = '_PLAN';
                }
                else {
                    vScenario = req[i].SCENARIOID; //'BSL_SCENARIO';
                }
                req[i].PERIODID4_TSTAMP = vWeekDate;

                if (vWeekDate >= vDateDeld) {
                    await cds.run(
                        `DELETE FROM "CP_IBP_FUTUREDEMAND" WHERE "LOCATION_ID" = '` + req[i].LOCID + `' 
                                                          AND "PRODUCT_ID" = '`+ req[i].PRDID + `'
                                                          AND "VERSION" = '` + req[i].VERSIONID + `'
                                                          AND "SCENARIO" = '` + vScenario + `'
                                                          AND "WEEK_DATE" = '` + vWeekDate + `'`
                    );
                    let modQuery = 'INSERT INTO "CP_IBP_FUTUREDEMAND" VALUES (' +
                        "'" + req[i].LOCID + "'" + "," +
                        "'" + req[i].PRDID + "'" + "," +
                        "'" + req[i].VERSIONID + "'" + "," +
                        "'" + vScenario + "'" + "," +
                        "'" + vWeekDate + "'" + "," +
                        "'" + req[i].TOTALDEMANDOUTPUT + "'" + ')';// + ' WITH PRIMARY KEY';
                    try {
                        await cds.run(modQuery);
                        flag = 'D';
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
            }
            if (flag === 'D') {
                //////////////////////////////////////////
                flag = '';
                let resUrlFplan;
                const dateJSONToEDM = jsonDate => {
                    const content = /\d+/.exec(String(jsonDate));
                    const timestamp = content ? Number(content[0]) : 0;
                    const date = new Date(timestamp);
                    const string = date.toISOString();
                    return string;
                };

                resUrlFplan = "/" + liParaValue[0].VALUE + "?$select=PERIODID4_TSTAMP,PRDID,LOCID,CUSTID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "'  and PERIODID4_TSTAMP gt datetime'" + vFromDate + "' and PERIODID4_TSTAMP lt datetime'" + vToDate + "' and UOMTOID eq 'EA' and CUSTID eq '" + lsCustomer.CUSTOMER_GROUP + "'&$inlinecount=allpages";

                let req = await service.tx(request).get(resUrlFplan);
                const vDelDate = new Date();
                const vDateDel = vDelDate.toISOString().split('T')[0];
                try {
                    await DELETE.from('CP_IBP_FCHARPLAN')
                        .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                            AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                            AND WEEK_DATE    < '${vDateDel}'`);
                }
                catch (e) {
                    //Do nothing
                }
                for (let i in req) {
                    let vWeekDate = dateJSONToEDM(req[i].PERIODID4_TSTAMP).split('T')[0];
                    if (req[i].SCENARIOID === '' || req[i].SCENARIOID === null) {
                        vScenario = '_PLAN';
                    }
                    else {
                        vScenario = req[i].SCENARIOID; //'BSL_SCENARIO';
                    }
                    let vManualOpt = '0.0';
                    if (req[i].MANUALOPTION !== '' && req[i].MANUALOPTION !== null) {
                        vManualOpt = req[i].MANUALOPTION;
                    }
                    req[i].PERIODID4_TSTAMP = vWeekDate;
                    if (vWeekDate >= vDateDel) {
                        await cds.run(
                            `DELETE FROM "CP_IBP_FCHARPLAN" WHERE "LOCATION_ID" = '` + req[i].LOCID + `' 
                                                              AND "PRODUCT_ID" = '`+ req[i].PRDID + `'
                                                              AND "CLASS_NUM" = '` + req[i].VCCLASS + `' 
                                                              AND "CHAR_NUM" = '` + req[i].VCCHAR + `' 
                                                              AND "CHARVAL_NUM" = '` + req[i].VCCHARVALUE + `' 
                                                              AND "VERSION" = '` + req[i].VERSIONID + `'
                                                              AND "SCENARIO" = '` + vScenario + `'
                                                              AND "WEEK_DATE" = '` + vWeekDate + `'`
                        );

                        let modQuery = 'INSERT INTO "CP_IBP_FCHARPLAN" VALUES (' +
                            "'" + req[i].LOCID + "'" + "," +
                            "'" + req[i].PRDID + "'" + "," +
                            "'" + req[i].VCCLASS + "'" + "," +
                            "'" + req[i].VCCHAR + "'" + "," +
                            "'" + req[i].VCCHARVALUE + "'" + "," +
                            "'" + req[i].VERSIONID + "'" + "," +
                            "'" + vScenario + "'" + "," +
                            "'" + vWeekDate + "'" + "," +
                            "'" + req[i].OPTIONPERCENTAGE + "'" + "," +
                            "'" + req[i].FINALDEMANDVC + "'" + "," +
                            "'" + vManualOpt + "'" + ')';// + ' WITH PRIMARY KEY';
                        try {
                            await cds.run(modQuery);
                            flag = 'S';
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                }
            }
            if (flag === 'S') {
                lMessage = lMessage + ' ' + "Import of IBP Demand and Future char.plan data is successfull for product" + lsData.PRODUCT_ID;
            } else {
                lMessage = lMessage + ' ' + "Import of IBP Demand and Future char.plan data has failed for product" + lsData.PRODUCT_ID;
            }
        }
        aReturn.status = flag;
        aReturn.message = lMessage;
        return aReturn;
    }
    async timeseriesfuture(req) {
        let lilocProd = {};
        let lsData = {}, Flag = '',aReturn = {},lMsg = '',lSuccess='',lMessage ='',iCounter = 0;        
        let lilocProdReq = JSON.parse(req.data.LocProdData);
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        }
        else {
            lilocProd = JSON.parse(req.data.LocProdData);
        }

        const obgenTimeseries_rt = new GenTimeseriesRT();
        let m1 = await GenFunctions.getParameterValue(lilocProd[0].LOCATION_ID, 13);
        let m2 = await GenFunctions.getParameterValue(lilocProd[0].LOCATION_ID, 12);
        let vFlag = '';
        if (m1 > 0) {
            vFlag = 'X';
            for (let i = 0; i < lilocProd.length; i++) {
                lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
                lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
                const obgenTimeseries = new GenTimeseries();
              let oResponse1 =  await obgenTimeseries.genTimeseriesF(lsData, req, Flag);
              if(oResponse1.bError == true){//Error exists
                iCounter++;
                lSuccess ='';
                lMessage = oResponse1.message;
               }
               else{
                lSuccess ='X';
                lMessage ='Time Series Future Successful';
               }

               let oResponse2 =  await obgenTimeseries_rt.genTimeseriesF_rt(lsData, req);
               if(oResponse2.bError == true){//Error exists
                iCounter++;
                lSuccess ='';
                lMessage = oResponse2.message;
               }
               else{
                lSuccess ='X';
                lMessage ='Time Series Future Successful';
               }
            }
        }
        if (m2 > 0) {
            vFlag = 'X';
            for (let i = 0; i < lilocProd.length; i++) {
                lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
                lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
                const obgenTimeseriesM2 = new GenTimeseriesM2();
              let oResponse3 = await obgenTimeseriesM2.genTimeseriesF(lsData, req, Flag);
              if(oResponse3.bError == true){//Error exists
                iCounter++;
                lSuccess ='';
                lMessage = oResponse3.message;
               }
               else{
                lSuccess ='X';
                lMessage ='Time Series Future Successful';
               }
            }
        }
        if (vFlag === '') {
            lMsg = " Please maintain planning configurations for the location " + lilocProdReq[0].LOCATION_ID;
            lMessage = lMsg;
        }
        if(iCounter >0){
            lSuccess ='';
            lMessage = 'Time Series Future failed';
        }
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
 
    // // Generate Forecast Order
    async genFullConfigDemand(req) {
        let lilocProd = {};
        let lsData = {};
        let Flag = '';
        var lSuccess = '',lMessage ='',iCounter =0;
        let lilocProdReq = JSON.parse(req.data.LocProdData);
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            // const objCatFn = new Catservicefn();
            // lilocProd = await objCatFn.getAllProducts(req.data);
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        }
        else {
            lilocProd = JSON.parse(req.data.LocProdData);
        }
        for (let i = 0; i < lilocProd.length; i++) {
            lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
            //
            lsData.VERSION = lilocProdReq[0].VERSION;
            lsData.SCENARIO = (lilocProdReq[0].SCENARIO)?lilocProdReq[0].SCENARIO:'';
            lsData.MODEL_VERSION = lilocProdReq[0].MODEL_VERSION;
            //
            const obgenTimeseriesM2 = new GenTimeseriesM2();
            try{
              let oResponse1 =  await obgenTimeseriesM2.genPrediction(lsData, req, Flag);
              if(oResponse1.bError == true){//Error exists
                iCounter++;
                lSuccess ='';
                lMessage = oResponse1.message;
               }
               else{
                lSuccess ='X';
                lMessage ='ForeCast Order generation Successful';
               }

                await obgenTimeseriesM2.consumptionOfFO(lsData, req);  
                lMessage ='ForeCast Order generation Successful';
                lSuccess ='X';
            }
            catch{
                lMessage ='ForeCast Order generation Failed';
                lSuccess='';
            }
         // Forecast Order Consumption
        }
        if(iCounter >0){
            lMessage ='ForeCast Order generation Failed';
            lSuccess='';
        }
        let aReturn ={};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }

    //Generate Assembly Requirements
    async genAssemblyreq(req){
        var lSuccess = '',lMessage ='',iCounter =0;
        const objAsmreq = new AssemblyReq();
        try{
           let oResponse1 = await objAsmreq.genAsmreq(req.data, req);
           if(oResponse1.bError == true){//Error exists
            iCounter++;
            lSuccess ='';
            lMessage = oResponse1.message;
           }
           else{
            lSuccess ='X';
            lMessage ='Generate Assembly Requirements Successful';
           }

        //   let oResponse2 = await objAsmreq.genRestrReq(req.data, req);
        //   if(oResponse2.bError == true){//Error exists
        //     iCounter++;
        //     lSuccess ='';
        //     lMessage = oResponse2.message;
        //    }
        //    else{
        //     lSuccess ='X';
        //     lMessage ='Generate Assembly Requirements Successful';
        //    }
        }
        catch{
            lSuccess ='';
            lMessage = 'Generate Assembly Requirements Failed';
        }
        if(iCounter >0){
            lSuccess ='';
            lMessage = 'Generate Assembly Requirements Failed';
        }
        let aReturn ={};
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    //Export IBP Derived Characters
    async generateDCFCharPlan(request,service,servicePost){
        var lSuccess = '',lMessage ='';
        // Generating payload for job scheduler logs
        let vFromDate, vToDate;
        let lilocProd = [];
        let lsData = {},
            aReturn = {};
        let oReq = {
            mktauth: [],
        };
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started generating future demand plan based on derived characteristics";
        let res = request._.req.res;
        let aDistFCharPlan = [];

        lsData.LOCATION_ID = request.data.LOCATION_ID;
        lsData.PRODUCT_ID = request.data.PRODUCT_ID;
        lilocProd.push(GenF.parse(lsData));

        // Acknowledge Job scheduler for the inputs selected
        values.push({ id, createtAt, message, lilocProd });
        // res.statusCode = 202;
        // res.send({ values });

        lsData = {};

        vFromDate = new Date();
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];

        // Forecast Order Horizon
        let lWeeks = await GenF.getParameterValue(lilocProd[0].LOCATION_ID, 2);
        vToDate = new Date();
        vToDate = new Date(vToDate.getFullYear(), vToDate.getMonth(), (vToDate.getDate() + parseInt(7 * lWeeks)));
        var vMonth = (vToDate.getMonth() + 1).toString();
        if (vMonth.length === 1) {
            vMonth = '0' + vMonth;
        }
        let vDate = vToDate.getDate().toString();
        if (vDate.length === 1) {
            vDate = '0' + vDate;
        }
        vToDate = vToDate.getFullYear().toString() + "-" + vMonth + "-" + vDate;

        var promiseArray = [],iCounter = 0,sMessage = '';
        // Fetch Option percentages for a location product and weekDate
        try{
            for (let iloc = 0; iloc < lilocProd.length; iloc++) {
                aDistFCharPlan = await cds.run(`SELECT DISTINCT *            
                                                      FROM "CP_IBP_FUTUREDEMAND"
                                                     WHERE LOCATION_ID = '${lilocProd[iloc].LOCATION_ID}'
                                                       AND PRODUCT_ID = '${lilocProd[iloc].PRODUCT_ID}'
                                                       AND WEEK_DATE >= '${vFromDate}'
                                                       ORDER BY WEEK_DATE`);
                if (aDistFCharPlan.length > 0) {
                    for (let iDFCP = 0; iDFCP < aDistFCharPlan.length; iDFCP++) {
                        let oResp =  objDerConfig.genDerivedCharPercent(aDistFCharPlan[iDFCP].LOCATION_ID, aDistFCharPlan[iDFCP].PRODUCT_ID, aDistFCharPlan[iDFCP].WEEK_DATE, aDistFCharPlan[iDFCP].VERSION, aDistFCharPlan[iDFCP].SCENARIO);
                        promiseArray.push(new Promise((resolve, _reject) => {
                            oResp.then(el=>{
                                resolve(el);
                            }).catch(ex=>{
                                iCounter++;
                                sMessage = sMessage +" "+ ex.message;
                                resolve(true);
                            })
                        }))
                    }
                    lMessage = 'Future Characteristics plan successfully derived for product :' + ' ' + lilocProd[iloc].PRODUCT_ID;
                } else {
                    lMessage = 'Future Characteristics plan has to be imported for product :' + ' ' + lilocProd[iloc].PRODUCT_ID;
                }
    
                await GenF.jobSchMessage('X', lMessage, request);
    
                lsData.LOCATION_ID = lilocProd[iloc].LOCATION_ID;
                lsData.PRODUCT_ID = lilocProd[iloc].PRODUCT_ID;
                lsData.FROMDATE = vFromDate;
                lsData.TODATE = vToDate;
                let oResp1=   obibpfucntions.exportMarketauthIBP(lsData, request, service, servicePost, aReturn);
                promiseArray.push(new Promise((resolve, reject) => {
                    oResp1.then(el=>{
                        resolve(el);
                    })
                    .catch(ex=>{
                        iCounter++;
                        sMessage = sMessage +" "+ ex.message;
                        resolve(true);

                    })
                }))
                lSuccess ='X';
                lSuccess = aPromise[aPromise.length - 1].Success;
                lMessage = aPromise[aPromise.length - 1].Message;
            }
        }
        catch(ex){
            lSuccess ='';
            lMessage ='Export IBP Derived Characteristics Failed';
        }
       await Promise.all(promiseArray)
        if(iCounter>0){
            
        }
        aReturn.message = lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }
    //Publish Forecast Orders
    async postCIRQuantities(req){
        const objCIR = new CIRService();
        const oModel = await cds.connect.to('S4ODataService');
        let oCIRData = {};
        oCIRData = await objCIR.getCIRData(req);
        const liCIRQty = oCIRData.liCIRQty;
        const liUniqueId = oCIRData.liUniqueId;
        const liSalesH = oCIRData.liSalesH;
        const aUniqueIdChar = await objCIR.getUniqueIdCharacteristics(req);
        // const sLoginUserId = req.headers['x-username'];
        let sLoginUserId = "";
        const sCFDestUser = req.data.VALIDUSER;
        let aFilteredChar = [], aFilteredCIR = [];
        let sUniqueId = "";
        let oUniqueIdChars = {};
        let aUniqueIdChars = [];
        let oEntry = {};
        let nextDtIndex = '';
        let aFilSalesH = [];
        let iSOQty = 0;
        let iCIROpenQty = 0;                                 // Existing CIR qtys - Actual Sales order qty
        sLoginUserId = req.data.USER_ID;
        var lSuccess='',lMessage='';
        for (let i = 0; i < liUniqueId.length; i++) {// Unique Id Characteristics
            aUniqueIdChars = [];
            aFilteredChar = [];
            sUniqueId = liUniqueId[i].UNIQUE_ID;
            aFilteredChar = aUniqueIdChar.filter(function (aUniqueId) {
                return aUniqueId.UNIQUE_ID == sUniqueId;
            });

            for (let k = 0; k < aFilteredChar.length; k++) {
                oUniqueIdChars = {};
                oUniqueIdChars.UniqueId = (aFilteredChar[k].UNIQUE_ID).toString();
                oUniqueIdChars.Charc = aFilteredChar[k].CHAR_NAME;
                oUniqueIdChars.Value = aFilteredChar[k].CHAR_VALUE;
                aUniqueIdChars.push(oUniqueIdChars);
            }
            // CIR Weekly Quantity 
            aFilteredCIR = [];
            aFilteredCIR = liCIRQty.filter(function (aCIRQty) {
                return aCIRQty.UNIQUE_ID == sUniqueId;
            });
            for (let j = 0; j < aFilteredCIR.length; j++) {
                aFilSalesH = [];
                iSOQty = 0;
                iCIROpenQty = 0;
                //
                nextDtIndex = GenFunctions.addOne(j, aFilteredCIR.length);
                aFilSalesH = liSalesH.filter(function (aSalesH) {
                    return aSalesH.UNIQUE_ID === sUniqueId
                        && aSalesH.MAT_AVAILDATE >= aFilteredCIR[j].WEEK_DATE
                        && aSalesH.MAT_AVAILDATE < aFilteredCIR[nextDtIndex].WEEK_DATE;
                });
                if (aFilSalesH.length > 0) {
                    for (let vQtyIndex = 0; vQtyIndex < aFilSalesH.length; vQtyIndex++) {
                        iSOQty = iSOQty + parseInt(aFilSalesH[vQtyIndex].ORD_QTY);
                    }
                }
                // Substraction of Actual Orders Quantity from Generated CIR Qtys. 
                iCIROpenQty = aFilteredCIR[j].CIR_QTY - iSOQty;
                if (iCIROpenQty < 0) {
                    iCIROpenQty = 0;
                    continue;
                }

                oEntry = {}
                oEntry.Werks = aFilteredCIR[j].LOCATION_ID;
                oEntry.Matnr = aFilteredCIR[j].REF_PRODID;
                oEntry.CustMaterial = aFilteredCIR[j].PRODUCT_ID;
                oEntry.Quantity = iCIROpenQty.toString();  // (aFilteredCIR[j].CIR_QTY).toString();
                oEntry.UniqueId = (aFilteredCIR[j].UNIQUE_ID).toString();
                oEntry.Datum = aFilteredCIR[j].WEEK_DATE + "T10:00:00";
                oEntry.Valid_User = sCFDestUser;
                if (sLoginUserId) {
                    oEntry.User_Id = sLoginUserId;
                }
                oEntry.HeaderConfig = GenFunctions.parse(aUniqueIdChars);
                try {
                    await oModel.tx(req).post("/headerSet", oEntry);  
                    lSuccess ='X';
                    lMessage = 'Publish ForeCast Orders Successful';
                }
                catch (e) {
                    console.log(e);
                    lSuccess ='';
                    lMessage = 'Publish ForeCast Orders Failed';
                }

            }
        }
        let aReturn ={};
        aReturn.message = (lMessage == '')?'Publish ForeCast Orders Failed':lMessage;
        aReturn.status = lSuccess;
        return aReturn;
    }

    //Predictions
    async genPredictions(req){
       var aReturn ={},oResp1;
        var lSuccess = '',lMessage ='',promiseArray =[];
        try{
            oResp1 =  palService.generatePredictionsFn(req,false).then(x=>{
            if(x){
                lSuccess = (x.success == true)?'X':'';
                lMessage = x.message;
            }
           });
        }
        catch{
            lSuccess ='';
            lMessage='Predictions generation Failed';
        }
        //Pushing into promiseArray and once oResp1 is fulfilled,resolving it
        promiseArray.push(new Promise((resolve, _reject) => {
            oResp1.then(el=>{
                resolve(el);
            })
           }))

        // promiseArray.push(new Promise((resolve, _reject) => {
        //  var predInterval =  setInterval(() => {
        //         if(predResponseFlag == true){
        //             resolve(true);
        //             clearInterval(predInterval);
        //           }
        //     }, 1000);
        // }))
         await Promise.all(promiseArray)
         aReturn.message = lMessage;
         aReturn.status = lSuccess;
        return aReturn;
    }
   
}


module.exports = jobSchedulerFunc;
