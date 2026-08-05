const cds = require("@sap/cds");
const GenF = require("./gen-functions");
const hana = require("@sap/hana-client");
const {
    v1: uuidv1
} = require('uuid')
const xsenv = require("@sap/xsenv");
const JobSchedulerClient = require("@sap/jobs-client");
const MktAuth = require("./market-auth");
const Catservicefn = require("./catservice-function");
const vAIRKey = process.env.AIR;
const IBPFunc = require("./ibp-functions");
const obibpfucntions = new IBPFunc();
const obgenMktAuth = new MktAuth();
const DerivedConfig = require("./derivedchars-functions");
const { Console } = require("console");
const objDerConfig = new DerivedConfig();

function getJobscheduler(req) {

    xsenv.loadEnv();
    const services = xsenv.getServices({
        jobscheduler: {
            tags: "jobscheduler"
        },
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
module.exports = cds.service.impl(async function () {
    // const { SBPVCP } = this.entities;
    const service = await cds.connect.to('IBPDemandsrv');
    const servicePost = await cds.connect.to('IBPMasterDataAPI');
    const serviceChLog = await cds.connect.to('IBPChangeHistory');

    this.on("exportRestrDetails_fn", async (req) => {
        let vFlag = '';
        let oReq = await obibpfucntions.exportRtrHdrDet(req);
        let vTransID = new Date().getTime().toString();
        let vTransID2 = new Date().getTime().toString();
        let oEntry = {
            "TransactionID": vTransID,
            "RequestedAttributes": "VCRESTRICTIONID,VCRESTRICTIONDESC,VCRESTRICTIONTYPE",
            "DoCommit": true,
            "NavVCPRESTRICTION": oReq.rtrhdr
        }
        let oEntry2 = {
            "TransactionID": vTransID2,
            "RequestedAttributes": "LOCID,VCRESTRICTIONID,VCPLACEHOLDER",
            "DoCommit": true,
            "NavVCPRESTRICTION": oReq.locrtr
        }
        try {
            await servicePost.tx(req).post("/VCPRESTRICTIONTrans", oEntry);
            await servicePost.tx(req).post("/VCPLOCRESTRICTIONTrans", oEntry2);
            vFlag = 'S';
        } catch (e) {
            vFlag = '';
        }
        let resUrl = "/GetExportResult?P_EntityName='SBPVCP'&P_TransactionID='" + vTransID2 + "'";
        return await servicePost.tx(req).get(resUrl)
        // GetExportResult
    });
    /***************************************************************************/
    //////////////////////// Services for CF/////////////////////////////////////
    /**************************************************************************/
    // Master data products to IBP
    // Master data products to IBP
    // this.on("exportIBPMasterProdCpy", async (req) => {
    //     // Send Response to Scheduler
    //     let liJobData = [];
    //     let createtAt = new Date();
    //     let id = uuidv1();
    //     let values = [];
    //     let message = "Started export of Master Data";
    //     let res = req._.req.res;
    //     const litemp = JSON.stringify(req.data);
    //     liJobData = JSON.parse(litemp);
    //     values.push({ id, createtAt, message, liJobData });
    //     res.statusCode = 202;
    //     res.send({ values });

    //     console.log(vAIRKey);
    //     // Get Planning area and Prefix configurations for IBP
    //     let liParaValue = await GenF.getIBPParameterValue();
    //     let lData = "Nav" + liParaValue[1].VALUE.toString() + "PRODUCT";
    //     let lEntity = "/" + liParaValue[1].VALUE.toString() + "PRODUCTTrans";

    //     let oReq = {
    //         masterProd: [],
    //     },
    //         vmasterProd, flag = '', vCriticalAsm = '', vCriticalComp = '';

    //     const limasterprod = await cds.run(
    //         `
    //          SELECT DISTINCT A.PRODUCT_ID,
    //          B.LOCATION_ID,
    //          A.PROD_DESC,
    //          A.PROD_FAMILY,
    //          A.PROD_GROUP,
    //          A.PROD_MODEL,
    //          A.PROD_MDLRANGE,
    //          A.PROD_SERIES,
    //          A.PROD_TYPE,
    //          A.RESERVE_FIELD3         
    //            FROM "CP_PRODUCT" AS A
    //            INNER JOIN "CP_LOCATION_PRODUCT" AS B
    //            ON A.PRODUCT_ID = B.PRODUCT_ID `);
    //     // const liIbpChar = await cds.run(
    //     //     `
    //     //      SELECT *
    //     //        FROM "CP_IBPCHAR_PS"
    //     //        WHERE CHAR_TYPE = 'P'
    //     //        AND ( PRODUCT_ID IN (SELECT DISTINCT REF_PRODID FROM CP_PARTIALPROD_INTRO)  )    
    //     //       ORDER BY SEQUENCE`);

    //     const lipartialprod = await cds.run(
    //         `
    //          SELECT DISTINCT PRODUCT_ID,
    //                 LOCATION_ID,
    //                 PROD_TYPE,
    //                 PROD_DESC,
    //                 REF_PRODID
    //            FROM "CP_PARTIALPROD_INTRO"
    //            ORDER BY REF_PRODID`);

    //     const liComp = await cds.run(
    //         `SELECT DISTINCT 
    //         "CP_BOMHEADER"."PRODUCT_ID",
    //         "CP_BOMHEADER"."COMPONENT",
    //         "CP_BOMHEADER"."COMP_DESC",
    //         "CP_BOMHEADER"."COMP_TYPE",
    //         "CP_CRITICAL_COMP"."ASSEMBLY_CRITICALKEY"
    //     FROM 
    //         "CP_BOMHEADER"
    //         INNER JOIN
    //         "CP_CRITICAL_COMP"
    //         ON "CP_BOMHEADER"."LOCATION_ID" = "CP_CRITICAL_COMP"."LOCATION_ID"
    //             AND "CP_BOMHEADER"."PRODUCT_ID" = "CP_CRITICAL_COMP"."PRODUCT_ID"
    //             AND "CP_BOMHEADER"."COMPONENT" = "CP_CRITICAL_COMP"."ASSEMBLY"
    //     ORDER BY 
    //         "CP_BOMHEADER"."PRODUCT_ID" ASC, 
    //         "CP_BOMHEADER"."COMPONENT" ASC`);

    //     //  SELECT DISTINCT PRODUCT_ID,
    //     //         COMPONENT,
    //     //         COMP_DESC,
    //     //         COMP_TYPE,
    //     //         CRITICAL_ASM
    //     //    FROM "V_BOM_DEMDFACLOC"
    //     //    ORDER BY COMPONENT);

    //     const liAssemblyComp = await cds.run(
    //         `SELECT DISTINCT 
    //         "CP_ASSEMBLY_COMP"."ASSEMBLY",
    //         "CP_ASSEMBLY_COMP"."COMPONENT",
    //         "CP_ASSEMBLY_COMP"."COMP_DESC",
    //         "CP_ASSEMBLY_COMP"."COMP_TYPE",
    //         "CP_CRITICAL_COMP"."CRITICALKEY"
    //     FROM 
    //         "CP_ASSEMBLY_COMP"
    //         INNER JOIN
    //         "CP_CRITICAL_COMP"
    //         ON "CP_ASSEMBLY_COMP"."LOCATION_ID" = "CP_CRITICAL_COMP"."LOCATION_ID"
    //             AND "CP_ASSEMBLY_COMP"."ASSEMBLY" = "CP_CRITICAL_COMP"."ASSEMBLY"
    //             AND "CP_ASSEMBLY_COMP"."COMPONENT" = "CP_CRITICAL_COMP"."COMPONENT"
    //     ORDER BY 
    //         "CP_ASSEMBLY_COMP"."ASSEMBLY" ASC, 
    //         "CP_ASSEMBLY_COMP"."COMPONENT" ASC`);

    //     //  SELECT DISTINCT ASSEMBLY,
    //     //         COMPONENT,
    //     //         COMP_DESC,
    //     //         COMP_TYPE,
    //     //         CRITICAL_COMP
    //     //    FROM "V_COMP_DEMDFACLOC"
    //     //    ORDER BY COMPONENT);

    //     for (let i = 0; i < limasterprod.length; i++) {
    //         for (let iPartial = 0; iPartial < lipartialprod.length; iPartial++) {
    //             if (lipartialprod[iPartial].PRODUCT_ID === limasterprod[i].PRODUCT_ID) {
    //                 vmasterProd = {
    //                     "VCMODELRANGE": limasterprod[i].PROD_MDLRANGE,
    //                     "PRDFAMILY": limasterprod[i].PROD_FAMILY,
    //                     "PRDID": lipartialprod[iPartial].PRODUCT_ID,
    //                     "PRDGROUP": limasterprod[i].PROD_GROUP,
    //                     "VCMODEL": limasterprod[i].PROD_MODEL,
    //                     "PRDDESCR": limasterprod[i].PROD_DESC,
    //                     "PRDSERIES": limasterprod[i].PROD_SERIES,
    //                     "MATTYPEID": limasterprod[i].PROD_TYPE,
    //                     "VCCRITICALCOMP": '',
    //                     "VCPRODATT01": '',
    //                     "VCPRODATT02": '',
    //                     "VCPRODATT03": '',
    //                     "VCPRODATT04": '',
    //                     "VCPRODATT05": '',
    //                     "VCPRODATT06": '',
    //                     "VCPRODATT07": '',
    //                     "VCPRODATT08": '',
    //                     "VCPRODATT09": '',
    //                     "VCPRODATT10": ''
    //                 };
    //                 oReq.masterProd.push(vmasterProd);
    //             }
    //             // Get partial attributes based on sequence
    //             if (lipartialprod[iPartial].PRODUCT_ID !== limasterprod[i].PRODUCT_ID &&
    //                 lipartialprod[iPartial].REF_PRODID === limasterprod[i].PRODUCT_ID) {


    //                 const liIbpChar = await cds.run(
    //                     `SELECT distinct  V_PARTIALPRODCHAR.PRODUCT_ID,
    //                                         V_PARTIALPRODCHAR.REF_PRODID,
    //                                         CP_IBPCHAR_PS.SEQUENCE,
    //                                         CP_IBPCHAR_PS.CHAR_NUM,
    //                                         V_CHARVAL.CHARVAL_DESC,
    //                                         V_PARTIALPRODCHAR.CHAR_VALUE
    //                         FROM CP_IBPCHAR_PS
    //                         INNER JOIN V_PARTIALPRODCHAR
    //                         ON CP_IBPCHAR_PS.PRODUCT_ID = V_PARTIALPRODCHAR.REF_PRODID
    //                         AND CP_IBPCHAR_PS.CHAR_NUM = V_PARTIALPRODCHAR.CHAR_NUM
    //                         INNER JOIN V_CHARVAL
    //                         ON CP_IBPCHAR_PS.CHAR_NUM = V_CHARVAL.CHAR_NUM
    //                         WHERE CHAR_TYPE = 'P'
    //                     AND CP_IBPCHAR_PS.PRODUCT_ID = '${lipartialprod[iPartial].REF_PRODID}'  
    //                     AND V_PARTIALPRODCHAR.PRODUCT_ID = '${lipartialprod[iPartial].PRODUCT_ID}'                           
    //                     ORDER BY SEQUENCE`);
    //                 let columnname = 'VCPRODATT0', nIbpLength = 1;
    //                 vmasterProd = {
    //                     "VCMODELRANGE": limasterprod[i].PROD_MDLRANGE,
    //                     "PRDFAMILY": limasterprod[i].PROD_FAMILY,
    //                     "PRDID": lipartialprod[iPartial].PRODUCT_ID,
    //                     "PRDGROUP": limasterprod[i].PROD_GROUP,
    //                     "VCMODEL": limasterprod[i].PROD_MODEL,
    //                     "PRDDESCR": lipartialprod[iPartial].PROD_DESC,
    //                     "PRDSERIES": limasterprod[i].PROD_SERIES,
    //                     "MATTYPEID": lipartialprod[iPartial].PROD_TYPE,
    //                     "VCCRITICALCOMP": ''
    //                 };
    //                 while (nIbpLength <= 10) {
    //                     vmasterProd[columnname + nIbpLength] = '';
    //                     for (let index = 0; index < liIbpChar.length; index++) {
    //                         if (nIbpLength === liIbpChar[index].SEQUENCE) {
    //                             vmasterProd[columnname + nIbpLength] = liIbpChar[index].CHARVAL_DESC;
    //                         }
    //                     }
    //                     nIbpLength = nIbpLength + 1;
    //                 }
    //                 oReq.masterProd.push(vmasterProd);
    //             }
    //         }
    //         // BOM Components
    //         vmasterProd = {};
    //         for (let iComp = 0; iComp < liComp.length; iComp++) {
    //             if (liComp[iComp].PRODUCT_ID === limasterprod[i].PRODUCT_ID) {
    //                 // if (liComp[iComp].CRITICAL_ASM === 'Y') {ASSEMBLY_CRITICALKEY
    //                 if (liComp[iComp].ASSEMBLY_CRITICALKEY === 'X') {
    //                     vCriticalAsm = 'X';
    //                 }
    //                 else {
    //                     vCriticalAsm = '';
    //                 }
    //                 vmasterProd = {
    //                     "VCMODELRANGE": '',
    //                     "PRDFAMILY": '',
    //                     "PRDID": liComp[iComp].COMPONENT,
    //                     "PRDGROUP": '',
    //                     "VCMODEL": '',
    //                     "PRDDESCR": liComp[iComp].COMP_DESC,
    //                     "PRDSERIES": '',
    //                     "MATTYPEID": liComp[iComp].COMP_TYPE,
    //                     "VCCRITICALCOMP": vCriticalAsm,
    //                     "VCPRODATT01": '',
    //                     "VCPRODATT02": '',
    //                     "VCPRODATT03": '',
    //                     "VCPRODATT04": '',
    //                     "VCPRODATT05": '',
    //                     "VCPRODATT06": '',
    //                     "VCPRODATT07": '',
    //                     "VCPRODATT08": '',
    //                     "VCPRODATT09": '',
    //                     "VCPRODATT10": ''
    //                 };
    //                 oReq.masterProd.push(GenF.parse(vmasterProd));

    //                 for (let iAsmbComp = 0; iAsmbComp < liAssemblyComp.length; iAsmbComp++) {
    //                     if (liAssemblyComp[iAsmbComp].ASSEMBLY === liComp[iComp].COMPONENT) {
    //                         // if (liAssemblyComp[iAsmbComp].CRITICAL_COMP === 'Y') {
    //                         if (liAssemblyComp[iAsmbComp].CRITICALKEY === 'X') {
    //                             vCriticalComp = 'X';
    //                         }
    //                         else {
    //                             vCriticalComp = '';
    //                         }
    //                         vmasterProd = {
    //                             "VCMODELRANGE": '',
    //                             "PRDFAMILY": '',
    //                             "PRDID": liAssemblyComp[iAsmbComp].COMPONENT,
    //                             "PRDGROUP": '',
    //                             "VCMODEL": '',
    //                             "PRDDESCR": liAssemblyComp[iAsmbComp].COMP_DESC,
    //                             "PRDSERIES": '',
    //                             "MATTYPEID": liAssemblyComp[iAsmbComp].COMP_TYPE,
    //                             "VCCRITICALCOMP": vCriticalComp,
    //                             "VCPRODATT01": '',
    //                             "VCPRODATT02": '',
    //                             "VCPRODATT03": '',
    //                             "VCPRODATT04": '',
    //                             "VCPRODATT05": '',
    //                             "VCPRODATT06": '',
    //                             "VCPRODATT07": '',
    //                             "VCPRODATT08": '',
    //                             "VCPRODATT09": '',
    //                             "VCPRODATT10": ''
    //                         };
    //                         oReq.masterProd.push(GenF.parse(vmasterProd));
    //                         vCriticalComp = '';
    //                         vmasterProd = {};
    //                     }

    //                 }

    //             }

    //         }

    //     }
    //     // console.log(oReq.masterProd);
    //     let Keys = ['PRDID'];
    //     oReq.masterProd = GenF.removeDuplicate(oReq.masterProd, Keys);
    //     if (oReq.masterProd.length > 0) {
    //         let vTransID = new Date().getTime().toString();
    //         let oEntry =
    //         {
    //             "TransactionID": vTransID,
    //             "RequestedAttributes": "VCMODELRANGE,PRDFAMILY,PRDID,PRDGROUP,VCMODEL,PRDDESCR,PRDSERIES,MATTYPEID,VCCRITICALCOMP,VCPRODATT01,VCPRODATT02,VCPRODATT03,VCPRODATT04,VCPRODATT05,VCPRODATT06,VCPRODATT07",
    //             "DoCommit": true
    //         }
    //         oEntry[lData] = oReq.masterProd;
    //         try {
    //             req.headers['Application-Interface-Key'] = vAIRKey;
    //             console.log(req.headers);
    //             await servicePost.tx(req).post(lEntity, oEntry);
    //             let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
    //             let vResponse = await servicePost.tx(req).get(resUrl);
    //             flag = 'X';
    //         }
    //         catch (error) {
    //             console.log(error);
    //         }
    //     }
    //     // return "S";
    //     if (flag === 'X') {
    //         await GenF.jobSchMessage('X', "Export of Product is successful ", req);
    //     }
    //     else {
    //         await GenF.jobSchMessage('', "Export of Product is failed", req);
    //     }

    //     // GetExportResult
    // });

    // this.on("exportIBPMasterProd", async (req) => {
    //     // Send Response to Scheduler
    //     let liJobData = [];
    //     let createtAt = new Date();
    //     let id = uuidv1();
    //     let values = [];
    //     let message = "Started export of Master Data";
    //     let res = req._.req.res;
    //     const litemp = JSON.stringify(req.data);
    //     liJobData = JSON.parse(litemp);
    //     values.push({
    //         id,
    //         createtAt,
    //         message,
    //         liJobData
    //     });
    //     res.statusCode = 202;
    //     res.send({
    //         values
    //     });
    //     console.log(vAIRKey);
    //     // Get Planning area and Prefix configurations for IBP

    //     let liParaValue = await GenF.getIBPParameterValue();
    //     let lData = "Nav" + liParaValue[1].VALUE.toString() + "PRODUCT";
    //     let lEntity = "/" + liParaValue[1].VALUE.toString() + "PRODUCTTrans";

    //     let oReq = {
    //         masterProd: [],
    //     },

    //         vmasterProd, flag = '',
    //         vCriticalAsm = '',
    //         vCriticalComp = '',
    //         liDummyProd = [],
    //         liAssemblyComp = [],
    //         liComp = [];
    //     let liCompMBOM = [];

    //     const limasterprod = await cds.run(
    //         `
    //          SELECT DISTINCT A.PRODUCT_ID,
    //                         B.LOCATION_ID,
    //                         replace_regexpr('([<>''"()])' IN "A"."PROD_DESC" with '' OCCURRENCE ALL ) AS PROD_DESC,
    //                         A.PROD_FAMILY,
    //                         A.PROD_GROUP,
    //                         A.PROD_MODEL,
    //                         A.PROD_MDLRANGE,
    //                         A.PROD_SERIES,
    //                         A.PROD_TYPE,
    //                         A.RESERVE_FIELD3
    //                     FROM "CP_PRODUCT" AS A
    //                     INNER JOIN "CP_LOCATION_PRODUCT" AS B
    //                     ON A.PRODUCT_ID = B.PRODUCT_ID `);


    //     const lipartialprod = await cds.run(
    //         `
    //          SELECT DISTINCT PRODUCT_ID,
    //                         LOCATION_ID,
    //                         PROD_TYPE,
    //                         replace_regexpr('([<>''"()])' IN "PROD_DESC" with '' OCCURRENCE ALL ) AS PROD_DESC,
    //                         REF_PRODID
    //                 FROM "CP_PARTIALPROD_INTRO"
    //                 ORDER BY REF_PRODID`);

    //     liComp = await cds.run(
    //         `SELECT DISTINCT
    //                 "CP_BOMHEADER"."PRODUCT_ID",
    //                 "CP_BOMHEADER"."COMPONENT",
    //                 replace_regexpr('([<>''"()])' IN "CP_BOMHEADER"."COMP_DESC" with '' OCCURRENCE ALL ) AS COMP_DESC,
    //                 "CP_BOMHEADER"."COMP_TYPE",
    //                 'X' AS "ASSEMBLY_CRITICALKEY"
    //            FROM "CP_BOMHEADER"
    //         ORDER BY
    //                 "CP_BOMHEADER"."PRODUCT_ID" ASC,
    //                 "CP_BOMHEADER"."COMPONENT" ASC`);

    //     //     INNER JOIN "CP_CRITICAL_COMP"
    //     //     ON "CP_BOMHEADER"."LOCATION_ID" = "CP_CRITICAL_COMP"."LOCATION_ID"
    //     //    AND "CP_BOMHEADER"."PRODUCT_ID" = "CP_CRITICAL_COMP"."PRODUCT_ID"
    //     //    AND "CP_BOMHEADER"."COMPONENT" = "CP_CRITICAL_COMP"."ASSEMBLY"

    //     // liAssemblyComp = await cds.run(
    //     //     `SELECT DISTINCT
    //     //             "CP_ASSEMBLY_COMP"."ASSEMBLY",
    //     //             "CP_ASSEMBLY_COMP"."COMPONENT",
    //     //             "CP_ASSEMBLY_COMP"."COMP_DESC",
    //     //             "CP_ASSEMBLY_COMP"."COMP_TYPE",
    //     //             "CP_CRITICAL_COMP"."CRITICALKEY"
    //     //         FROM "CP_ASSEMBLY_COMP"
    //     //         INNER JOIN "CP_CRITICAL_COMP"
    //     //            ON "CP_ASSEMBLY_COMP"."LOCATION_ID" = "CP_CRITICAL_COMP"."LOCATION_ID"
    //     //           AND "CP_ASSEMBLY_COMP"."ASSEMBLY" = "CP_CRITICAL_COMP"."ASSEMBLY"
    //     //           AND "CP_ASSEMBLY_COMP"."COMPONENT" = "CP_CRITICAL_COMP"."COMPONENT"
    //     //      ORDER BY "CP_ASSEMBLY_COMP"."ASSEMBLY" ASC,
    //     //               "CP_ASSEMBLY_COMP"."COMPONENT" ASC`);
    //     // //}
    //     liAssemblyComp = await cds.run(
    //         `SELECT DISTINCT
    //                 "CP_ASSEMBLY_COMP"."ASSEMBLY",
    //                 "CP_ASSEMBLY_COMP"."COMPONENT",
    //                 replace_regexpr('([<>''"()])' IN "CP_ASSEMBLY_COMP"."COMP_DESC" with '' OCCURRENCE ALL ) AS COMP_DESC,
    //                 "CP_ASSEMBLY_COMP"."COMP_TYPE",
    //                 'X' As "CRITICALKEY"
    //             FROM "CP_ASSEMBLY_COMP"                            
    //          ORDER BY "CP_ASSEMBLY_COMP"."ASSEMBLY" ASC,
    //                   "CP_ASSEMBLY_COMP"."COMPONENT" ASC`);

    //     // Fetch multi BOM config
    //     let vBOMConfig = await GenF.getSystemConfig('MULTILEVEL_CONFIGPRODUCT'); //('MULTIBOM');
    //     if (vBOMConfig === 'Yes') {
    //         // Fetch assembly from Multilevel BOM
    //         liCompMBOM = await cds.run(
    //             `SELECT DISTINCT
    //                     "CP_BOM_MAT"."MAT_CHILD" AS "COMPONENT",
    //                     replace_regexpr('([<>''"()])' IN "CP_BOM_MAT"."PROD_DESC" with '' OCCURRENCE ALL ) AS "COMP_DESC",
    //                     "CP_BOM_MAT"."COMP_TYPE",
    //                     "CP_BOM_MAT"."CRITICAL_ASM" AS "ASSEMBLY_CRITICALKEY"
    //                FROM "CP_BOM_MAT"
    //                WHERE CONFIGURABLE = 'X'
    //                  AND PHANTOM_IND <> 'X'
    //                  AND CLASS_FLG <> 'X'`);
    //         // Fetch products that are not configurable and doesnot have a next level( in the sense they are Assemblies and also components)
    //         let liCompMBOMTemp = [];
    //         liCompMBOMTemp = await cds.run(`SELECT DISTINCT
    //                  "CP_BOM_MAT"."MAT_CHILD" AS "COMPONENT",
    //                  replace_regexpr('([<>''"()])' IN "CP_BOM_MAT"."PROD_DESC" with '' OCCURRENCE ALL ) AS "COMP_DESC",
    //                  "CP_BOM_MAT"."COMP_TYPE",
    //                  "CP_BOM_MAT"."CRITICAL_ASM" AS "ASSEMBLY_CRITICALKEY"
    //             FROM "CP_BOM_MAT"
    //             WHERE CONFIGURABLE <> 'X'
    //             AND PHANTOM_IND <> 'X'
    //               AND CLASS_FLG <> 'X'`);

    //         // Append to a final table
    //         if (liCompMBOMTemp.length > 0) {
    //             liCompMBOM = [...liCompMBOM, ...liCompMBOMTemp];
    //         }
    //         // Generate Dummy product

    //         // Generate Dummy product
    //         liDummyProd = await cds.run(`SELECT DISTINCT DUMMY_PRODUCTID FROM CP_DUMMY_PRODUCT_LOC`);
    //     }
    //     for (let i = 0; i < limasterprod.length; i++) {
    //         for (let iPartial = 0; iPartial < lipartialprod.length; iPartial++) {
    //             if (lipartialprod[iPartial].PRODUCT_ID === limasterprod[i].PRODUCT_ID) {
    //                 vmasterProd = {
    //                     "VCMODELRANGE": limasterprod[i].PROD_MDLRANGE,
    //                     "PRDFAMILY": limasterprod[i].PROD_FAMILY,
    //                     "PRDID": lipartialprod[iPartial].PRODUCT_ID,
    //                     "PRDGROUP": limasterprod[i].PROD_GROUP,
    //                     "VCMODEL": limasterprod[i].PROD_MODEL,
    //                     "PRDDESCR": limasterprod[i].PROD_DESC,
    //                     "PRDSERIES": limasterprod[i].PROD_SERIES,
    //                     "MATTYPEID": limasterprod[i].PROD_TYPE,
    //                     "VCCRITICALCOMP": '',
    //                     "VCDUMMYMATFLAG": '',
    //                     "VCPRODATT01": '',
    //                     "VCPRODATT02": '',
    //                     "VCPRODATT03": '',
    //                     "VCPRODATT04": '',
    //                     "VCPRODATT05": '',
    //                     "VCPRODATT06": '',
    //                     "VCPRODATT07": '',
    //                     "VCPRODATT08": '',
    //                     "VCPRODATT09": '',
    //                     "VCPRODATT10": ''
    //                 };
    //                 oReq.masterProd.push(vmasterProd);
    //             }

    //             // Get partial attributes based on sequence

    //             if (lipartialprod[iPartial].PRODUCT_ID !== limasterprod[i].PRODUCT_ID &&

    //                 lipartialprod[iPartial].REF_PRODID === limasterprod[i].PRODUCT_ID) {


    //                 const liIbpChar = await cds.run(

    //                     `SELECT DISTINCT V_PARTIALPRODCHAR.PRODUCT_ID,
    //                                         V_PARTIALPRODCHAR.REF_PRODID,
    //                                         CP_IBPCHAR_PS.SEQUENCE,
    //                                         CP_IBPCHAR_PS.CHAR_NUM,
    //                                         V_PARTIALPRODCHAR.CHAR_VALUE,
    //                                         V_PARTIALPRODCHAR.CHARVAL_DESC
    //                         FROM CP_IBPCHAR_PS
    //                         INNER JOIN V_PARTIALPRODCHAR
    //                         ON CP_IBPCHAR_PS.PRODUCT_ID = V_PARTIALPRODCHAR.REF_PRODID
    //                         AND CP_IBPCHAR_PS.CHAR_NUM = V_PARTIALPRODCHAR.CHAR_NUM
    //                         WHERE CHAR_TYPE = 'P'
    //                     AND CP_IBPCHAR_PS.PRODUCT_ID = '${lipartialprod[iPartial].REF_PRODID}'  
    //                     AND V_PARTIALPRODCHAR.PRODUCT_ID = '${lipartialprod[iPartial].PRODUCT_ID}'  
    //                     ORDER BY SEQUENCE`);
    //                 let columnname, nIbpLength = 1;

    //                 vmasterProd = {
    //                     "VCMODELRANGE": limasterprod[i].PROD_MDLRANGE,
    //                     "PRDFAMILY": limasterprod[i].PROD_FAMILY,
    //                     "PRDID": lipartialprod[iPartial].PRODUCT_ID,
    //                     "PRDGROUP": limasterprod[i].PROD_GROUP,
    //                     "VCMODEL": limasterprod[i].PROD_MODEL,
    //                     "PRDDESCR": lipartialprod[iPartial].PROD_DESC,
    //                     "PRDSERIES": limasterprod[i].PROD_SERIES,
    //                     "MATTYPEID": lipartialprod[iPartial].PROD_TYPE,
    //                     "VCCRITICALCOMP": '',
    //                     "VCDUMMYMATFLAG": '',
    //                 };

    //                 while (nIbpLength <= 10) {

    //                     if (nIbpLength < 10) {
    //                         columnname = 'VCPRODATT0';
    //                     } else if (nIbpLength >= 10) {
    //                         columnname = 'VCPRODATT';
    //                     }
    //                     vmasterProd[columnname + nIbpLength] = '';
    //                     for (let index = 0; index < liIbpChar.length; index++) {
    //                         if (nIbpLength === liIbpChar[index].SEQUENCE) {
    //                             vmasterProd[columnname + nIbpLength] = liIbpChar[index].CHARVAL_DESC;
    //                         }
    //                     }
    //                     nIbpLength = nIbpLength + 1;
    //                 }
    //                 oReq.masterProd.push(vmasterProd);
    //             }
    //         }
    //         // }
    //         // BOM Components

    //         vmasterProd = {};

    //         for (let iComp = 0; iComp < liComp.length; iComp++) {
    //             if (liComp[iComp].PRODUCT_ID === limasterprod[i].PRODUCT_ID) {
    //                 // if (liComp[iComp].CRITICAL_ASM === 'Y') {ASSEMBLY_CRITICALKEY

    //                 if (liComp[iComp].ASSEMBLY_CRITICALKEY === 'X') {
    //                     vCriticalAsm = 'X';

    //                 } else {
    //                     vCriticalAsm = '';
    //                 }

    //                 vmasterProd = {
    //                     "VCMODELRANGE": '',
    //                     "PRDFAMILY": '',
    //                     "PRDID": liComp[iComp].COMPONENT,
    //                     "PRDGROUP": '',
    //                     "VCMODEL": '',
    //                     "PRDDESCR": liComp[iComp].COMP_DESC,
    //                     "PRDSERIES": '',
    //                     "MATTYPEID": liComp[iComp].COMP_TYPE,
    //                     "VCCRITICALCOMP": vCriticalAsm,
    //                     "VCDUMMYMATFLAG": '',
    //                     "VCPRODATT01": '',
    //                     "VCPRODATT02": '',
    //                     "VCPRODATT03": '',
    //                     "VCPRODATT04": '',
    //                     "VCPRODATT05": '',
    //                     "VCPRODATT06": '',
    //                     "VCPRODATT07": '',
    //                     "VCPRODATT08": '',
    //                     "VCPRODATT09": '',
    //                     "VCPRODATT10": ''
    //                 };

    //                 oReq.masterProd.push(GenF.parse(vmasterProd));

    //                 for (let iAsmbComp = 0; iAsmbComp < liAssemblyComp.length; iAsmbComp++) {
    //                     if (liAssemblyComp[iAsmbComp].ASSEMBLY === liComp[iComp].COMPONENT) {

    //                         if (liAssemblyComp[iAsmbComp].CRITICALKEY === 'X') {
    //                             vCriticalComp = 'X';
    //                         } else {
    //                             vCriticalComp = '';
    //                         }
    //                         vmasterProd = {
    //                             "VCMODELRANGE": '',
    //                             "PRDFAMILY": '',
    //                             "PRDID": liAssemblyComp[iAsmbComp].COMPONENT,
    //                             "PRDGROUP": '',
    //                             "VCMODEL": '',
    //                             "PRDDESCR": liAssemblyComp[iAsmbComp].COMP_DESC,
    //                             "PRDSERIES": '',
    //                             "MATTYPEID": liAssemblyComp[iAsmbComp].COMP_TYPE,
    //                             "VCCRITICALCOMP": vCriticalComp,
    //                             "VCDUMMYMATFLAG": '',
    //                             "VCPRODATT01": '',
    //                             "VCPRODATT02": '',
    //                             "VCPRODATT03": '',
    //                             "VCPRODATT04": '',
    //                             "VCPRODATT05": '',
    //                             "VCPRODATT06": '',
    //                             "VCPRODATT07": '',
    //                             "VCPRODATT08": '',
    //                             "VCPRODATT09": '',
    //                             "VCPRODATT10": ''

    //                         };
    //                         oReq.masterProd.push(GenF.parse(vmasterProd));
    //                         vCriticalComp = '';
    //                         vmasterProd = {};
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     if (vBOMConfig === 'Yes') {
    //         for (let iAsmbComp = 0; iAsmbComp < liCompMBOM.length; iAsmbComp++) {
    //             if (liCompMBOM[iAsmbComp].ASSEMBLY_CRITICALKEY === 'X') {
    //                 vCriticalComp = 'X';
    //             } else {
    //                 vCriticalComp = '';
    //             }
    //             vmasterProd = {
    //                 "VCMODELRANGE": '',
    //                 "PRDFAMILY": '',
    //                 "PRDID": liCompMBOM[iAsmbComp].COMPONENT,
    //                 "PRDGROUP": '',
    //                 "VCMODEL": '',
    //                 "PRDDESCR": liCompMBOM[iAsmbComp].COMP_DESC,
    //                 "PRDSERIES": '',
    //                 "MATTYPEID": liCompMBOM[iAsmbComp].COMP_TYPE,
    //                 "VCCRITICALCOMP": vCriticalComp,
    //                 "VCDUMMYMATFLAG": '',
    //                 "VCPRODATT01": '',
    //                 "VCPRODATT02": '',
    //                 "VCPRODATT03": '',
    //                 "VCPRODATT04": '',
    //                 "VCPRODATT05": '',
    //                 "VCPRODATT06": '',
    //                 "VCPRODATT07": '',
    //                 "VCPRODATT08": '',
    //                 "VCPRODATT09": '',
    //                 "VCPRODATT10": ''

    //             };
    //             oReq.masterProd.push(GenF.parse(vmasterProd));
    //             vCriticalComp = '';
    //             vmasterProd = {};
    //         }
    //         // Send Dummy product concatination of Config Product and alternate plant
    //         for (let iDummy = 0; iDummy < liDummyProd.length; iDummy++) {
    //             if (liDummyProd[iDummy].DUMMY_PRODUCTID !== null) {
    //                 vmasterProd = {
    //                     "VCMODELRANGE": '',
    //                     "PRDFAMILY": '',
    //                     "PRDID": liDummyProd[iDummy].DUMMY_PRODUCTID,
    //                     "PRDGROUP": '',
    //                     "VCMODEL": '',
    //                     "PRDDESCR": liDummyProd[iDummy].DUMMY_PRODUCTID, //PROD_DESC,
    //                     "PRDSERIES": '',
    //                     "MATTYPEID": '',
    //                     "VCCRITICALCOMP": '',
    //                     "VCDUMMYMATFLAG": 'X',
    //                     "VCPRODATT01": '',
    //                     "VCPRODATT02": '',
    //                     "VCPRODATT03": '',
    //                     "VCPRODATT04": '',
    //                     "VCPRODATT05": '',
    //                     "VCPRODATT06": '',
    //                     "VCPRODATT07": '',
    //                     "VCPRODATT08": '',
    //                     "VCPRODATT09": '',
    //                     "VCPRODATT10": ''

    //                 };

    //                 oReq.masterProd.push(GenF.parse(vmasterProd));
    //             }
    //             vCriticalComp = '';
    //             vmasterProd = {};
    //         }
    //         if (liComp.length === 0 && liAssemblyComp.length > 0) {
    //             for (let iAsmbComp = 0; iAsmbComp < liAssemblyComp.length; iAsmbComp++) {

    //                 if (liAssemblyComp[iAsmbComp].CRITICALKEY === 'X') {
    //                     vCriticalComp = 'X';
    //                 } else {
    //                     vCriticalComp = '';
    //                 }
    //                 vmasterProd = {
    //                     "VCMODELRANGE": '',
    //                     "PRDFAMILY": '',
    //                     "PRDID": liAssemblyComp[iAsmbComp].COMPONENT,
    //                     "PRDGROUP": '',
    //                     "VCMODEL": '',
    //                     "PRDDESCR": liAssemblyComp[iAsmbComp].COMP_DESC,
    //                     "PRDSERIES": '',
    //                     "MATTYPEID": liAssemblyComp[iAsmbComp].COMP_TYPE,
    //                     "VCCRITICALCOMP": vCriticalComp,
    //                     "VCDUMMYMATFLAG": '',
    //                     "VCPRODATT01": '',
    //                     "VCPRODATT02": '',
    //                     "VCPRODATT03": '',
    //                     "VCPRODATT04": '',
    //                     "VCPRODATT05": '',
    //                     "VCPRODATT06": '',
    //                     "VCPRODATT07": '',
    //                     "VCPRODATT08": '',
    //                     "VCPRODATT09": '',
    //                     "VCPRODATT10": ''

    //                 };
    //                 oReq.masterProd.push(GenF.parse(vmasterProd));
    //                 vCriticalComp = '';
    //                 vmasterProd = {};

    //             }
    //         }

    //         // Export Location Product Data to avoid Rejection - Temporary Fix
    //         let aLocProd = [];
    //         let aMastrData = [];
    //         aMastrData = oReq.masterProd;
    //         aLocProd = await cds.run(`SELECT DISTINCT PRODUCT_ID
    //                                     FROM CP_LOCATION_PRODUCT
    //                                     WHERE PRODUCT_ID NOT IN (SELECT DISTINCT PRODUCT_ID FROM CP_PRODUCT)`);
    //         if (aLocProd.length > 0 && aMastrData.length > 0) {
    //             // Remove product if is already built
    //             aLocProd = aLocProd.filter(el => {
    //                 return !aMastrData.find(element => {
    //                     return element.PRDID === el.PRODUCT_ID;
    //                 });
    //             });
    //         }
    //         if (aLocProd.length > 0) {
    //             for (let l = 0; l < aLocProd.length; l++) {
    //                 vmasterProd = {
    //                     "VCMODELRANGE": '',
    //                     "PRDFAMILY": '',
    //                     "PRDID": aLocProd[l].PRODUCT_ID,
    //                     "PRDGROUP": '',
    //                     "VCMODEL": '',
    //                     "PRDDESCR": aLocProd[l].PRODUCT_ID,
    //                     "PRDSERIES": '',
    //                     "MATTYPEID": 'HALB',
    //                     "VCCRITICALCOMP": '',
    //                     "VCDUMMYMATFLAG": '',
    //                     "VCPRODATT01": '',
    //                     "VCPRODATT02": '',
    //                     "VCPRODATT03": '',
    //                     "VCPRODATT04": '',
    //                     "VCPRODATT05": '',
    //                     "VCPRODATT06": '',
    //                     "VCPRODATT07": '',
    //                     "VCPRODATT08": '',
    //                     "VCPRODATT09": '',
    //                     "VCPRODATT10": ''

    //                 };
    //                 oReq.masterProd.push(GenF.parse(vmasterProd));
    //                 vmasterProd = {};
    //             }
    //         }
    //     } else {

    //     }
    //     //}

    //     // console.log(oReq.masterProd);
    //     oReq.masterProd.sort(GenF.dynamicSortMultiple("PRDID"));


    //     let Keys = ['PRDID'];

    //     oReq.masterProd = GenF.removeDuplicate(oReq.masterProd, Keys);

    //     if (oReq.masterProd.length > 0) {

    //         let vTransID = new Date().getTime().toString();
    //         let vMDTyp = 'VCDPRODUCT';
    //         // Parallel processing logic to export huge data buckets
    //         if (oReq.masterProd.length > 5000) {
    //             let iChnk, iChkCounter = 0;

    //             // Initialize Parallel processing 
    //             let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
    //             try {
    //                 await servicePost.tx(req).post(reqUrlPPInit);
    //             } catch (e) {
    //                 console.log(e);
    //             }

    //             // Divide into multiple arrays with each array length as 5000
    //             chunked = true;
    //             let aData = oReq.masterProd;
    //             chunksList = [];
    //             const chunkSize = 5000;

    //             for (let i = 0; i < aData.length; i += chunkSize) {
    //                 const chunk = aData.slice(i, i + chunkSize)
    //                 chunksList.push(chunk);
    //             }

    //             // Process each chunk to IBP
    //             for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

    //                 let oEntry = {
    //                     "TransactionID": vTransID,
    //                     "RequestedAttributes": "VCMODELRANGE,PRDFAMILY,PRDID,PRDGROUP,VCMODEL,PRDDESCR,PRDSERIES,MATTYPEID,VCCRITICALCOMP,VCDUMMYMATFLAG,VCPRODATT01,VCPRODATT02,VCPRODATT03,VCPRODATT04,VCPRODATT05,VCPRODATT06,VCPRODATT07,VCPRODATT08,VCPRODATT09,VCPRODATT10"
    //                 }
    //                 oEntry[lData] = chunksList[iChnk];
    //                 try {
    //                     req.headers['Application-Interface-Key'] = vAIRKey;
    //                     console.log(req.headers);
    //                     await servicePost.tx(req).post(lEntity, oEntry);
    //                     iChkCounter = iChkCounter + 1;
    //                 } catch (err) {
    //                     GenF.log(err);
    //                 }
    //             }
    //             // If all are successfull commit the request
    //             if (iChkCounter > 0) {
    //                 let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
    //                 try {
    //                     await servicePost.tx(req).post(reqUrlPPCommit);
    //                     flag = 'X';
    //                 } catch (e) {
    //                     GenF.log(e);
    //                     GenF.log("Error while committing the parallel processing");
    //                 }
    //             }
    //         }
    //         else {
    //             let oEntry = {
    //                 "TransactionID": vTransID,
    //                 "RequestedAttributes": "VCMODELRANGE,PRDFAMILY,PRDID,PRDGROUP,VCMODEL,PRDDESCR,PRDSERIES,MATTYPEID,VCCRITICALCOMP,VCDUMMYMATFLAG,VCPRODATT01,VCPRODATT02,VCPRODATT03,VCPRODATT04,VCPRODATT05,VCPRODATT06,VCPRODATT07,VCPRODATT08,VCPRODATT09,VCPRODATT10",
    //                 "DoCommit": true
    //             }

    //             oEntry[lData] = oReq.masterProd;

    //             try {

    //                 req.headers['Application-Interface-Key'] = vAIRKey;
    //                 console.log(req.headers);
    //                 await servicePost.tx(req).post(lEntity, oEntry);
    //                 let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
    //                 let vResponse = await servicePost.tx(req).get(resUrl);
    //                 flag = 'X';
    //             } catch (error) {
    //                 flag = 'E';
    //                 console.log(error);
    //             }
    //         }

    //     }

    //     // return "S";

    //     if (flag === 'X') {
    //         await GenF.jobSchMessage('X', "Export of Product is successful ", req);
    //     } else {
    //         await GenF.jobSchMessage('', "Export of Product is failed", req);
    //     }
    //     // GetExportResult
    // });
    this.on("exportIBPMasterProd", async (req) => {
        // Send Response to Scheduler
        let liJobData = [];
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started export of Master Data";
        let res = req._.req.res;
        const litemp = JSON.stringify(req.data);
        liJobData = JSON.parse(litemp);
        let Response = '';
        values.push({
            id,
            createtAt,
            message,
            liJobData
        });
        res.statusCode = 202;
        res.send({
            values
        });
        console.log(vAIRKey);
        // Get Planning area and Prefix configurations for IBP

        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"= 'Product'`);

        let liParaValue = await GenF.getParameterID();
        // // let lData = "Nav" + liParaValue[0].VALUE.toString() + "PRODUCT";
        // // let lEntity = "/" + liParaValue[0].VALUE.toString() + "PRODUCTTrans";
        //  let sPlan = aMappingData[0].PLANNING_AREA;
        // let lData = "Nav" + sPlan;
        // let lEntity = "/" + sPlan + "Trans";
        // let lMasterDataType = sPlan;

        let oReq = {
            masterProd: [],
        },

            vmasterProd, flag = '',
            liDummyProd = [],
            liAssemblyComp = [],
            liComp = [];
        let liCompMBOM = [];
        let sSelection = "";
        // let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"= 'Product'`);
        let SELECTION = aTableData[0].SELECTION 
        if(SELECTION !==  '' && SELECTION !== null) {
            sSelection = SELECTION
        }

        const limasterprod = await cds.run(
            `
             SELECT DISTINCT A.PRODUCT_ID,
                            B.LOCATION_ID,
                            replace_regexpr('([<>''"()])' IN "A"."PROD_DESC" with '' OCCURRENCE ALL ) AS PROD_DESC,
                            A.PROD_FAMILY,
                            A.PROD_GROUP,
                            A.PROD_MODEL,
                            A.PROD_MDLRANGE,
                            A.PROD_SERIES,
                            A.PROD_TYPE,
                            A.RESERVE_FIELD3,
                            'X' AS CONFIG_FLAG,
                            '' AS PARTIAL_FLAG,
                            '' AS DUMMY_FLAG
                        FROM "CP_PRODUCT" AS A
                        INNER JOIN "CP_LOCATION_PRODUCT" AS B
                        ON A.PRODUCT_ID = B.PRODUCT_ID `);


        const lipartialprod = await cds.run(
            `
             SELECT DISTINCT PRODUCT_ID,
                            LOCATION_ID,
                            PROD_TYPE,
                            replace_regexpr('([<>''"()])' IN "PROD_DESC" with '' OCCURRENCE ALL ) AS PROD_DESC,
                            REF_PRODID,
                            '' AS CONFIG_FLAG,
                            'X' AS PARTIAL_FLAG,
                            '' AS DUMMY_FLAG
                    FROM "CP_PARTIALPROD_INTRO"
                    ORDER BY REF_PRODID`);

        liComp = await cds.run(
            `SELECT DISTINCT
                    "CP_BOMHEADER"."PRODUCT_ID",
                    "CP_BOMHEADER"."COMPONENT",
                    replace_regexpr('([<>''"()])' IN "CP_BOMHEADER"."COMP_DESC" with '' OCCURRENCE ALL ) AS COMP_DESC,
                    "CP_BOMHEADER"."COMP_TYPE",
                    'X' AS "ASSEMBLY_CRITICALKEY",
                    '' AS CONFIG_FLAG,
                    '' AS PARTIAL_FLAG,
                    '' AS DUMMY_FLAG
               FROM "CP_BOMHEADER"
            ORDER BY
                    "CP_BOMHEADER"."PRODUCT_ID" ASC,
                    "CP_BOMHEADER"."COMPONENT" ASC`);

        liAssemblyComp = await cds.run(
            `SELECT DISTINCT
                    "CP_ASSEMBLY_COMP"."ASSEMBLY",
                    "CP_ASSEMBLY_COMP"."COMPONENT",
                    replace_regexpr('([<>''"()])' IN "CP_ASSEMBLY_COMP"."COMP_DESC" with '' OCCURRENCE ALL ) AS COMP_DESC,
                    "CP_ASSEMBLY_COMP"."COMP_TYPE",
                    'X' As "CRITICALKEY",
                    '' AS CONFIG_FLAG,
                    '' AS PARTIAL_FLAG,
                    '' AS DUMMY_FLAG
                FROM "CP_ASSEMBLY_COMP"                            
             ORDER BY "CP_ASSEMBLY_COMP"."ASSEMBLY" ASC,
                      "CP_ASSEMBLY_COMP"."COMPONENT" ASC`);

        // Fetch multi BOM config
        let vBOMConfig = await GenF.getSystemConfig('MULTILEVEL_CONFIGPRODUCT'); //('MULTIBOM');
        if (vBOMConfig === 'Yes') {
            // Fetch assembly from Multilevel BOM
            liCompMBOM = await cds.run(
                `SELECT DISTINCT
                        "CP_BOM_MAT"."MAT_CHILD" AS "COMPONENT",
                        replace_regexpr('([<>''"()])' IN "CP_BOM_MAT"."PROD_DESC" with '' OCCURRENCE ALL ) AS "COMP_DESC",
                        "CP_BOM_MAT"."COMP_TYPE",
                        "CP_BOM_MAT"."CRITICAL_ASM" AS "ASSEMBLY_CRITICALKEY",
                        '' AS CONFIG_FLAG,
                        '' AS PARTIAL_FLAG,
                        '' AS DUMMY_FLAG
                   FROM "CP_BOM_MAT"
                   WHERE CONFIGURABLE = 'X'
                     AND PHANTOM_IND <> 'X'
                     AND CLASS_FLG <> 'X'`);
            // Fetch products that are not configurable and doesnot have a next level( in the sense they are Assemblies and also components)
            let liCompMBOMTemp = [];
            liCompMBOMTemp = await cds.run(`SELECT DISTINCT
                     "CP_BOM_MAT"."MAT_CHILD" AS "COMPONENT",
                     replace_regexpr('([<>''"()])' IN "CP_BOM_MAT"."PROD_DESC" with '' OCCURRENCE ALL ) AS "COMP_DESC",
                     "CP_BOM_MAT"."COMP_TYPE",
                     "CP_BOM_MAT"."CRITICAL_ASM" AS "ASSEMBLY_CRITICALKEY",
                     '' AS CONFIG_FLAG,
                    '' AS PARTIAL_FLAG,
                    '' AS DUMMY_FLAG
                FROM "CP_BOM_MAT"
                WHERE CONFIGURABLE <> 'X'
                AND PHANTOM_IND <> 'X'
                  AND CLASS_FLG <> 'X'`);

            // Append to a final table
            if (liCompMBOMTemp.length > 0) {
                liCompMBOM = [...liCompMBOM, ...liCompMBOMTemp];
            }
            // Generate Dummy product

            // Generate Dummy product
            liDummyProd = await cds.run(`SELECT DISTINCT DUMMY_PRODUCTID FROM CP_DUMMY_PRODUCT_LOC`);
        }
        for (let i = 0; i < limasterprod.length; i++) {
            for (let iPartial = 0; iPartial < lipartialprod.length; iPartial++) {
                if (lipartialprod[iPartial].PRODUCT_ID === limasterprod[i].PRODUCT_ID && (sSelection == "" || sSelection.includes("CP"))) {
                    vmasterProd = {

                        "LOCATION_ID":limasterprod[i].LOCATION_ID,
                        "PROD_FAMILY": limasterprod[i].PROD_FAMILY,
                        "PRODUCT_ID": lipartialprod[iPartial].PRODUCT_ID,
                        "PROD_GROUP": limasterprod[i].PROD_GROUP,
                        "PROD_DESC": limasterprod[i].PROD_DESC,
                        "PROD_SERIES": limasterprod[i].PROD_SERIES,
                        "PROD_TYPE": limasterprod[i].PROD_TYPE,
                        "PROD_MODEL":limasterprod[i].PROD_MODEL,
                        "PROD_MDLRANGE":limasterprod[i].PROD_MDLRANGE,
                        "RESERVE_FIELD3":limasterprod[i].RESERVE_FIELD3,
                        "CONFIG_FLAG" : "X",
                        "PARTIAL_FLAG" : "",
                        "DUMMY_FLAG" : ""
                        
                    };
                    oReq.masterProd.push(vmasterProd);
                }

                // Get partial attributes based on sequence

                if (lipartialprod[iPartial].PRODUCT_ID !== limasterprod[i].PRODUCT_ID &&

                    lipartialprod[iPartial].REF_PRODID === limasterprod[i].PRODUCT_ID && (sSelection == "" || sSelection.includes("PP"))) {


                    const liIbpChar = await cds.run(

                        `SELECT DISTINCT V_PARTIALPRODCHAR.PRODUCT_ID,
                                            V_PARTIALPRODCHAR.REF_PRODID,
                                            CP_IBPCHAR_PS.SEQUENCE,
                                            CP_IBPCHAR_PS.CHAR_NUM,
                                            V_PARTIALPRODCHAR.CHAR_VALUE,
                                            V_PARTIALPRODCHAR.CHARVAL_DESC
                            FROM CP_IBPCHAR_PS
                            INNER JOIN V_PARTIALPRODCHAR
                            ON CP_IBPCHAR_PS.PRODUCT_ID = V_PARTIALPRODCHAR.REF_PRODID
                            AND CP_IBPCHAR_PS.CHAR_NUM = V_PARTIALPRODCHAR.CHAR_NUM
                            WHERE CHAR_TYPE = 'P'
                        AND CP_IBPCHAR_PS.PRODUCT_ID = '${lipartialprod[iPartial].REF_PRODID}'  
                        AND V_PARTIALPRODCHAR.PRODUCT_ID = '${lipartialprod[iPartial].PRODUCT_ID}'  
                        ORDER BY SEQUENCE`);
                    let columnname, nIbpLength = 1;

                    vmasterProd = {
                        
                        "PROD_FAMILY": limasterprod[i].PROD_FAMILY,
                        "PRODUCT_ID": lipartialprod[iPartial].PRODUCT_ID,
                        "PROD_GROUP": limasterprod[i].PROD_GROUP,
                        "PROD_DESC": lipartialprod[iPartial].PROD_DESC,
                        "PROD_SERIES": limasterprod[i].PROD_SERIES,
                        "PROD_TYPE": lipartialprod[iPartial].PROD_TYPE,
                        "PROD_MODEL":limasterprod[i].PROD_MODEL,
                        "PROD_MDLRANGE":limasterprod[i].PROD_MDLRANGE,
                        "RESERVE_FIELD3":limasterprod[i].RESERVE_FIELD3,
                        "CONFIG_FLAG" : "",
                        "PARTIAL_FLAG" : "X",
                        "DUMMY_FLAG" : ""
                    };

                    while (nIbpLength <= 10) {

                        if (nIbpLength < 10) {
                            columnname = 'VCPRODATT0';
                        } else if (nIbpLength >= 10) {
                            columnname = 'VCPRODATT';
                        }
                        vmasterProd[columnname + nIbpLength] = '';
                        for (let index = 0; index < liIbpChar.length; index++) {
                            if (nIbpLength === liIbpChar[index].SEQUENCE) {
                                vmasterProd[columnname + nIbpLength] = liIbpChar[index].CHARVAL_DESC;
                            }
                        }
                        nIbpLength = nIbpLength + 1;
                    }
                    oReq.masterProd.push(vmasterProd);
                }
            }
            // }
            // BOM Components

            vmasterProd = {};
            if((sSelection == "" || sSelection.includes("ASMB"))){
                   for (let iComp =    0; iComp < liComp.length; iComp++) {
                if (liComp[iComp].PRODUCT_ID === limasterprod[i].PRODUCT_ID) {
                    // if (liComp[iComp].CRITICAL_ASM === 'Y') {ASSEMBLY_CRITICALKEY

                    if (liComp[iComp].ASSEMBLY_CRITICALKEY === 'X') {
                        vCriticalAsm = 'X';

                    } else {
                        vCriticalAsm = '';
                    }

                    vmasterProd = {
                        "PROD_FAMILY": '',
                        "PRODUCT_ID": liComp[iComp].COMPONENT,
                        "PROD_GROUP": '',
                        "PROD_DESC": liComp[iComp].COMP_DESC,
                        "PROD_SERIES": '',
                        "MATTYPEID": liComp[iComp].COMP_TYPE,
                        "PROD_TYPE": liComp[iComp].COMP_TYPE,
                        "CONFIG_FLAG" : "",
                        "PARTIAL_FLAG" : "",
                        "DUMMY_FLAG" : ""
                       
                    };

                    oReq.masterProd.push(GenF.parse(vmasterProd));

                    for (let iAsmbComp = 0; iAsmbComp < liAssemblyComp.length; iAsmbComp++) {
                        if (liAssemblyComp[iAsmbComp].ASSEMBLY === liComp[iComp].COMPONENT) {

                            if (liAssemblyComp[iAsmbComp].CRITICALKEY === 'X') {
                                vCriticalComp = 'X';
                            } else {
                                vCriticalComp = '';
                            }
                            vmasterProd = {
                                "PROD_FAMILY": '',
                                "PRODUCT_ID": liAssemblyComp[iAsmbComp].COMPONENT,
                                "PROD_GROUP": '',
                               
                                "PROD_DESC": liAssemblyComp[iAsmbComp].COMP_DESC,
                                "PROD_SERIES": '',
                                "MATTYPEID": liAssemblyComp[iAsmbComp].COMP_TYPE,
                                "PROD_TYPE": liAssemblyComp[iAsmbComp].COMP_TYPE,
                                "CONFIG_FLAG" : "",
                                "PARTIAL_FLAG" : "",
                                "DUMMY_FLAG" : ""
                                

                            };
                            oReq.masterProd.push(GenF.parse(vmasterProd));
                            vCriticalComp = '';
                            vmasterProd = {};
                        }
                    }
                }
            }
            }

         
        }
        if (vBOMConfig === 'Yes') {
            if(sSelection == "" || sSelection.includes("ASMB")){
            for (let iAsmbComp = 0; iAsmbComp < liCompMBOM.length; iAsmbComp++) {
                if (liCompMBOM[iAsmbComp].ASSEMBLY_CRITICALKEY === 'X') {
                    vCriticalComp = 'X';
                } else {
                    vCriticalComp = '';
                }
                vmasterProd = {
                    "PROD_FAMILY": '',
                    "PRODUCT_ID": liCompMBOM[iAsmbComp].COMPONENT,
                    "PROD_GROUP": '',
                    "PROD_DESC": liCompMBOM[iAsmbComp].COMP_DESC,
                    "PROD_SERIES": '',
                    "MATTYPEID": liCompMBOM[iAsmbComp].COMP_TYPE,
                    "PROD_TYPE": liCompMBOM[iAsmbComp].COMP_TYPE,
                    "CONFIG_FLAG" : "",
                    "PARTIAL_FLAG" : "",
                    "DUMMY_FLAG" : ""
                   

                };
                oReq.masterProd.push(GenF.parse(vmasterProd));
                vCriticalComp = '';
                vmasterProd = {};
            }
        }
        if((sSelection == "" || sSelection.includes("DP"))){
             // Send Dummy product concatination of Config Product and alternate plant
            for (let iDummy = 0; iDummy < liDummyProd.length; iDummy++) {
                if (liDummyProd[iDummy].DUMMY_PRODUCTID !== null) {
                    vmasterProd = {
                        "PROD_FAMILY": '',
                        "PRODUCT_ID": liDummyProd[iDummy].DUMMY_PRODUCTID,
                        "PROD_GROUP": '',
                        "PROD_DESC": liDummyProd[iDummy].DUMMY_PRODUCTID, //PROD_DESC,
                        "PROD_SERIES": '',
                        "MATTYPEID": '',
                        "PROD_TYPE": '',
                        "CONFIG_FLAG" : "",
                        "PARTIAL_FLAG" : "",
                        "DUMMY_FLAG" : "X"
                       

                    };

                    oReq.masterProd.push(GenF.parse(vmasterProd));
                }
                vCriticalComp = '';
                vmasterProd = {};
            }
        }
           
            if (liComp.length === 0 && liAssemblyComp.length > 0) {
                for (let iAsmbComp = 0; iAsmbComp < liAssemblyComp.length; iAsmbComp++) {

                    if (liAssemblyComp[iAsmbComp].CRITICALKEY === 'X') {
                        vCriticalComp = 'X';
                    } else {
                        vCriticalComp = '';
                    }
                    vmasterProd = {
                       
                        "PROD_FAMILY": '',
                        "PRODUCT_ID": liAssemblyComp[iAsmbComp].COMPONENT,
                        "PROD_GROUP": '',
                        "PROD_DESC": liAssemblyComp[iAsmbComp].COMP_DESC,
                        "PROD_SERIES": '',
                        "MATTYPEID": liAssemblyComp[iAsmbComp].COMP_TYPE,
                        "PROD_TYPE": liAssemblyComp[iAsmbComp].COMP_TYPE,
                        "CONFIG_FLAG" : "",
                        "PARTIAL_FLAG" : "",
                        "DUMMY_FLAG" : ""
                    
                       

                    };
                    oReq.masterProd.push(GenF.parse(vmasterProd));
                    vCriticalComp = '';
                    vmasterProd = {};

                }
            }

            // Export Location Product Data to avoid Rejection - Temporary Fix
            if((sSelection == "" || sSelection.includes("PP"))){
            let aLocProd = [];
            let aMastrData = [];
            aMastrData = oReq.masterProd;
            aLocProd = await cds.run(`SELECT DISTINCT PRODUCT_ID
                                        FROM CP_LOCATION_PRODUCT
                                        WHERE PRODUCT_ID NOT IN (SELECT DISTINCT PRODUCT_ID FROM CP_PRODUCT)`);
            if (aLocProd.length > 0 && aMastrData.length > 0) {
                // Remove product if is already built
                aLocProd = aLocProd.filter(el => {
                    return !aMastrData.find(element => {
                        return element.PRDID === el.PRODUCT_ID;
                    });
                });
            }
            if (aLocProd.length > 0) {
                for (let l = 0; l < aLocProd.length; l++) {
                    vmasterProd = {
                        
                        "PROD_FAMILY": '',
                        "PRODUCT_ID": aLocProd[l].PRODUCT_ID,
                        "PROD_GROUP": '',
                        "VCMODEL": '',
                        "PROD_DESC": aLocProd[l].PRODUCT_ID,
                        "PROD_SERIES": '',
                        "MATTYPEID": 'HALB',
                        "PROD_TYPE": 'HALB',
                        "CONFIG_FLAG" : "",
                        "PARTIAL_FLAG" : "",
                        "DUMMY_FLAG" : ""

                    };
                    oReq.masterProd.push(GenF.parse(vmasterProd));
                    vmasterProd = {};
                }
            }
        } 
    }
        //}

        // console.log(oReq.masterProd);

        let Key = ['ENTITY_KEY', 'PLANNING_AREA'];
        let distData = GenF.removeDuplicate(aTableData, Key);

        oReq.masterProd.sort(GenF.dynamicSortMultiple("PRODUCT_ID"));


        let Keys = ['PRODUCT_ID'];

        oReq.masterProd = GenF.removeDuplicate(oReq.masterProd, Keys);

        let aMappingData = [];      
        for (var z = 0; z < distData.length; z++) {
            aMappingData = aTableData.filter(e=> e.PLANNING_AREA == distData[z].PLANNING_AREA);

                let sPlan = aMappingData[0].PLANNING_AREA;
                let lData = "Nav" + liParaValue[0].VALUE.toString() + sPlan;
                let lEntity = "/" + liParaValue[0].VALUE.toString() + sPlan + "Trans";
                let lMasterDataType = liParaValue[0].VALUE.toString() + sPlan;
                console.log("sPlan", sPlan);
                console.log("lData", lData);
                console.log("lEntity", lEntity);
                console.log("lMasterDataType", lMasterDataType);

                let aProds = await GenF.mappingData('Product',distData[z].PLANNING_AREA, '',oReq.masterProd);

                const requiredFields =aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
         aProds = aProds.filter(record => {
             return requiredFields.every(field => record[field] != null && record[field] !== "");
         });
         let aKeys = Object.keys(aProds[0]);
            let requestedAttributesStr = Array.from(aKeys).join(',');
         oReq.masterProd = aProds;

          if (oReq.masterProd.length > 0) {

            let vTransID = new Date().getTime().toString();
            // let vMDTyp = liParaValue[0].VALUE.toString() + "PRODUCT";
            let vMDTyp = lMasterDataType;
            // Parallel processing logic to export huge data buckets
            if (oReq.masterProd.length > 5000) {
                let iChnk, iChkCounter = 0;

                // Initialize Parallel processing 
                let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
                try {
                    await servicePost.tx(req).post(reqUrlPPInit);
                } catch (e) {
                    console.log(e);
                }

                // Divide into multiple arrays with each array length as 5000
                chunked = true;
                let aData = oReq.masterProd;
                chunksList = [];
                const chunkSize = 5000;

                for (let i = 0; i < aData.length; i += chunkSize) {
                    const chunk = aData.slice(i, i + chunkSize)
                    chunksList.push(chunk);
                }

                // Process each chunk to IBP
                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

                    let oEntry = {
                        "TransactionID": vTransID,
                        "RequestedAttributes": requestedAttributesStr,
                    }
                    oEntry[lData] = chunksList[iChnk];
                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        console.log(req.headers);
                        await servicePost.tx(req).post(lEntity, oEntry);
                        iChkCounter = iChkCounter + 1;
                    } catch (err) {
                        GenF.log(err);
                    }
                }
                // If all are successfull commit the request
                if (iChkCounter > 0) {
                    let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
                    try {
                        await servicePost.tx(req).post(reqUrlPPCommit);
                        flag = 'X';
                        Response = Response + "Export of Product is successful for" + lMasterDataType;
                    } catch (e) {
                        Response = Response + "Export of Product is failed for" + lMasterDataType+`.Reason: ${e.message}`;
                        GenF.log("Error while committing the parallel processing");
                    }
                }
            }
            else {
                let oEntry = {
                    "TransactionID": vTransID,
                    "RequestedAttributes": requestedAttributesStr,
                    "DoCommit": true
                }

                oEntry[lData] = oReq.masterProd;

                try {

                    req.headers['Application-Interface-Key'] = vAIRKey;
                    console.log(req.headers);
                    await servicePost.tx(req).post(lEntity, oEntry);
                    let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                    let vResponse = await servicePost.tx(req).get(resUrl);
                    flag = 'X';
                        Response = Response + "Export of Product is successful for" + lMasterDataType;
                } catch (error) {
                    flag = 'E';
                    Response = Response + "Export of Product is failed for" + lMasterDataType+`.Reason: ${error.message}`;
                }
            }

        }
        }
            // let aProds = await GenF.mappingData('Product','',oReq.masterProd);
        //     const requiredFields =aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
        //  aProds = aProds.filter(record => {
        //      return requiredFields.every(field => record[field] != null && record[field] !== "");
        //  });
        //     let aKeys = Object.keys(aProds[0]);
        //     let requestedAttributesStr = Array.from(aKeys).join(',');
        //  oReq.masterProd = aProds;
        // if (oReq.masterProd.length > 0) {

        //     let vTransID = new Date().getTime().toString();
        //     // let vMDTyp = liParaValue[0].VALUE.toString() + "PRODUCT";
        //     let vMDTyp = lMasterDataType;
        //     // Parallel processing logic to export huge data buckets
        //     if (oReq.masterProd.length > 5000) {
        //         let iChnk, iChkCounter = 0;

        //         // Initialize Parallel processing 
        //         let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
        //         try {
        //             await servicePost.tx(req).post(reqUrlPPInit);
        //         } catch (e) {
        //             console.log(e);
        //         }

        //         // Divide into multiple arrays with each array length as 5000
        //         chunked = true;
        //         let aData = oReq.masterProd;
        //         chunksList = [];
        //         const chunkSize = 5000;

        //         for (let i = 0; i < aData.length; i += chunkSize) {
        //             const chunk = aData.slice(i, i + chunkSize)
        //             chunksList.push(chunk);
        //         }

        //         // Process each chunk to IBP
        //         for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

        //             let oEntry = {
        //                 "TransactionID": vTransID,
        //                 "RequestedAttributes": requestedAttributesStr,
        //             }
        //             oEntry[lData] = chunksList[iChnk];
        //             try {
        //                 req.headers['Application-Interface-Key'] = vAIRKey;
        //                 console.log(req.headers);
        //                 await servicePost.tx(req).post(lEntity, oEntry);
        //                 iChkCounter = iChkCounter + 1;
        //             } catch (err) {
        //                 GenF.log(err);
        //             }
        //         }
        //         // If all are successfull commit the request
        //         if (iChkCounter > 0) {
        //             let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
        //             try {
        //                 await servicePost.tx(req).post(reqUrlPPCommit);
        //                 flag = 'X';
        //             } catch (e) {
        //                 GenF.log(e);
        //                 GenF.log("Error while committing the parallel processing");
        //             }
        //         }
        //     }
        //     else {
        //         let oEntry = {
        //             "TransactionID": vTransID,
        //             "RequestedAttributes": requestedAttributesStr,
        //             "DoCommit": true
        //         }

        //         oEntry[lData] = oReq.masterProd;

        //         try {

        //             req.headers['Application-Interface-Key'] = vAIRKey;
        //             console.log(req.headers);
        //             await servicePost.tx(req).post(lEntity, oEntry);
        //             let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
        //             let vResponse = await servicePost.tx(req).get(resUrl);
        //             flag = 'X';
        //         } catch (error) {
        //             flag = 'E';
        //             console.log(error);
        //         }
        //     }

        // }

        // return "S";

        if (flag === 'X') {
            await GenF.jobSchMessage('X', Response, req);
        } else {
            await GenF.jobSchMessage('', Response, req);
        }
        // GetExportResult
    });

    // Create Locations in IBP
    // this.on("exportIBPLocation", async (req) => {

    //     // Get Planning area and Prefix configurations for IBP
    //     let liParaValue = await GenF.getIBPParameterValue();
    //     let lData = "Nav" + liParaValue[1].VALUE.toString() + "LOCATION";
    //     let lEntity = "/" + liParaValue[1].VALUE.toString() + "LOCATIONTrans";
    //     let oReq = {
    //         newLoc: [],
    //     },
    //         vNewLoc, flag = '';

    //     const linewloc = await cds.run(
    //         `
    //         SELECT "LOCATION_ID",
    //                "LOCATION_DESC",
    //                "LOCATION_TYPE"
    //                FROM "CP_LOCATION" `);

    //     for (i = 0; i < linewloc.length; i++) {
    //         vNewLoc = {
    //             "LOCID": linewloc[i].LOCATION_ID,
    //             "LOCDESCR": linewloc[i].LOCATION_DESC,
    //             "LOCTYPE": linewloc[i].LOCATION_TYPE
    //         };
    //         oReq.newLoc.push(vNewLoc);

    //     }
    //     if (oReq.newLoc.length > 0) {
    //         let vTransID = new Date().getTime().toString();
    //         let vMDTyp = 'VCDLOCATION';
    //         // Parallel processing logic to export huge data buckets
    //         if (oReq.newLoc.length > 5000) {
    //             let iChnk, iChkCounter = 0;

    //             // Initialize Parallel processing 
    //             let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
    //             try {
    //                 await servicePost.tx(req).post(reqUrlPPInit);
    //             } catch (e) {
    //                 console.log(e);
    //             }

    //             // Divide into multiple arrays with each array length as 5000
    //             chunked = true;
    //             let aData = oReq.newLoc;
    //             chunksList = [];
    //             const chunkSize = 5000;

    //             for (let i = 0; i < aData.length; i += chunkSize) {
    //                 const chunk = aData.slice(i, i + chunkSize)
    //                 chunksList.push(chunk);
    //             }

    //             // Process each chunk to IBP
    //             for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

    //                 let oEntry = {
    //                     "TransactionID": vTransID,
    //                     "RequestedAttributes": "LOCID,LOCDESCR,LOCTYPE"
    //                 }
    //                 oEntry[lData] = chunksList[iChnk];
    //                 try {
    //                     req.headers['Application-Interface-Key'] = vAIRKey;
    //                     console.log(req.headers);
    //                     await servicePost.tx(req).post(lEntity, oEntry);
    //                     iChkCounter = iChkCounter + 1;
    //                 } catch (err) {
    //                     GenF.log(err);
    //                 }
    //             }
    //             // If all are successfull commit the request
    //             if (iChkCounter > 0) {
    //                 let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
    //                 try {
    //                     await servicePost.tx(req).post(reqUrlPPCommit);
    //                     flag = 'X';
    //                 } catch (e) {
    //                     GenF.log(e);
    //                     GenF.log("Error while committing the parallel processing");
    //                 }
    //             }
    //         }
    //         else {
    //             let oEntry = {
    //                 "TransactionID": vTransID,
    //                 "RequestedAttributes": "LOCID,LOCDESCR,LOCTYPE",
    //                 "DoCommit": true
    //             }
    //             oEntry[lData] = oReq.newLoc;

    //             try {
    //                 req.headers['Application-Interface-Key'] = vAIRKey;
    //                 console.log(req.headers);
    //                 await servicePost.tx(req).post(lEntity, oEntry);
    //                 let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
    //                 let vResponse = await servicePost.tx(req).get(resUrl);
    //                 flag = 'X';
    //             } catch (error) {

    //             }
    //         }
    //     }
    //     if (flag === 'X') {
    //         await GenF.jobSchMessage('X', "Export of Location is successful ", req);
    //     } else {
    //         await GenF.jobSchMessage('', "Export of Location is failed", req);
    //     }
    // });
    this.on("exportIBPLocation", async (req) => {
        let response = "";
        // Get Planning area and Prefix configurations for IBP
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Location'`);
        let liParaValue = await GenF.getParameterID();
        // // let lData = "Nav" + liParaValue[0].VALUE.toString() + "LOCATION";
        // // let lEntity = "/" + liParaValue[0].VALUE.toString() + "LOCATIONTrans";
        // let sPlan = aTableData[0].PLANNING_AREA;
        // let lData = "Nav" + sPlan;
        // let lEntity = "/" + sPlan + "Trans";
        // let lMasterDataType = sPlan;
        let oReq = {
            newLoc: [],
        },
            vNewLoc, flag = '';

        let Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
        let distData = GenF.removeDuplicate(aTableData, Keys);

        const linewloc = await cds.run(
            `
            SELECT "LOCATION_ID",
                   "LOCATION_DESC",
                   "LOCATION_TYPE"
                   FROM "CP_LOCATION" `);

            let aMappingData = [];      
        for (var z = 0; z < distData.length; z++) {
            
                aMappingData = aTableData.filter(e=> e.PLANNING_AREA == distData[z].PLANNING_AREA);

                let sPlan = aMappingData[0].PLANNING_AREA;
                let lData = "Nav" + liParaValue[0].VALUE.toString() + sPlan;
                let lEntity = "/" + liParaValue[0].VALUE.toString() + sPlan + "Trans";
                let lMasterDataType = liParaValue[0].VALUE.toString() + sPlan;
                console.log("sPlan", sPlan);
                console.log("lData", lData);
                console.log("lEntity", lEntity);
                console.log("lMasterDataType", lMasterDataType);
            let aLoc = await GenF.mappingData('Location', distData[z].PLANNING_AREA, '', linewloc);
            if (aLoc.length > 0) {
                // let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Location'`);
                const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
                aLoc = aLoc.filter(record => {
                    return requiredFields.every(field => record[field] != null && record[field] !== "");
                });
                let Keys = Object.keys(aLoc[0]);

                let requestedAttributesStr = Array.from(Keys).join(',');



                let vTransID = new Date().getTime().toString();
                // let vMDTyp = liParaValue[0].VALUE.toString() + "LOCATION";
                let vMDTyp = lMasterDataType;
                // Parallel processing logic to export huge data buckets
                if (oReq.newLoc.length > 5000) {
                    let iChnk, iChkCounter = 0;

                    // Initialize Parallel processing 
                    let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
                    try {
                        await servicePost.tx(req).post(reqUrlPPInit);
                    } catch (e) {
                        console.log(e);
                    }

                    // Divide into multiple arrays with each array length as 5000
                    chunked = true;
                    let aData = aLoc;
                    chunksList = [];
                    const chunkSize = 5000;

                    for (let i = 0; i < aData.length; i += chunkSize) {
                        const chunk = aData.slice(i, i + chunkSize)
                        chunksList.push(chunk);
                    }

                    // Process each chunk to IBP
                    for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

                        let oEntry = {
                            "TransactionID": vTransID,
                            "RequestedAttributes": requestedAttributesStr
                        }
                        oEntry[lData] = chunksList[iChnk];
                        try {
                            req.headers['Application-Interface-Key'] = vAIRKey;
                            console.log(req.headers);
                            await servicePost.tx(req).post(lEntity, oEntry);
                            iChkCounter = iChkCounter + 1;
                        } catch (err) {
                            GenF.log(err);
                        }
                    }
                    // If all are successfull commit the request
                    if (iChkCounter > 0) {
                        let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
                        try {
                            await servicePost.tx(req).post(reqUrlPPCommit);
                            flag = 'X';
                            response = response + "Export of Location is successful for" + lMasterDataType;
                        } catch (e) {
                            response = response + "Export of Location is failed for" + lMasterDataType+`.Reason: ${e.message}`;
                            GenF.log("Error while committing the parallel processing");
                        }
                    }
                }
                else {
                    let oEntry = {
                        "TransactionID": vTransID,
                        "RequestedAttributes": requestedAttributesStr,
                        "DoCommit": true
                    }
                    oEntry[lData] = aLoc;

                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        console.log(req.headers);
                        await servicePost.tx(req).post(lEntity, oEntry);
                        let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                        let vResponse = await servicePost.tx(req).get(resUrl);
                        flag = 'X';
                        response = response + "Export of Location is successful for" + lMasterDataType;
                    } catch (error) {
                        response = response + "Export of Location is failed for" + lMasterDataType+`.Reason: ${error.message}`;
                    }
                }
            }

        }
        // let aLoc = await GenF.mappingData('Location', '', linewloc);
        // if (aLoc.length > 0) {
        //     // let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Location'`);
        //     const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
        //     aLoc = aLoc.filter(record => {
        //         return requiredFields.every(field => record[field] != null && record[field] !== "");
        //     });
        //     let Keys = Object.keys(aLoc[0]);

        //     let requestedAttributesStr = Array.from(Keys).join(',');



        //     let vTransID = new Date().getTime().toString();
        //     // let vMDTyp = liParaValue[0].VALUE.toString() + "LOCATION";
        //     let vMDTyp = lMasterDataType;
        //     // Parallel processing logic to export huge data buckets
        //     if (oReq.newLoc.length > 5000) {
        //         let iChnk, iChkCounter = 0;

        //         // Initialize Parallel processing 
        //         let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
        //         try {
        //             await servicePost.tx(req).post(reqUrlPPInit);
        //         } catch (e) {
        //             console.log(e);
        //         }

        //         // Divide into multiple arrays with each array length as 5000
        //         chunked = true;
        //         let aData = aLoc;
        //         chunksList = [];
        //         const chunkSize = 5000;

        //         for (let i = 0; i < aData.length; i += chunkSize) {
        //             const chunk = aData.slice(i, i + chunkSize)
        //             chunksList.push(chunk);
        //         }

        //         // Process each chunk to IBP
        //         for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

        //             let oEntry = {
        //                 "TransactionID": vTransID,
        //                 "RequestedAttributes": requestedAttributesStr
        //             }
        //             oEntry[lData] = chunksList[iChnk];
        //             try {
        //                 req.headers['Application-Interface-Key'] = vAIRKey;
        //                 console.log(req.headers);
        //                 await servicePost.tx(req).post(lEntity, oEntry);
        //                 iChkCounter = iChkCounter + 1;
        //             } catch (err) {
        //                 GenF.log(err);
        //             }
        //         }
        //         // If all are successfull commit the request
        //         if (iChkCounter > 0) {
        //             let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
        //             try {
        //                 await servicePost.tx(req).post(reqUrlPPCommit);
        //                 flag = 'X';
        //             } catch (e) {
        //                 GenF.log(e);
        //                 GenF.log("Error while committing the parallel processing");
        //             }
        //         }
        //     }
        //     else {
        //         let oEntry = {
        //             "TransactionID": vTransID,
        //             "RequestedAttributes": requestedAttributesStr,
        //             "DoCommit": true
        //         }
        //         oEntry[lData] = aLoc;

        //         try {
        //             req.headers['Application-Interface-Key'] = vAIRKey;
        //             console.log(req.headers);
        //             await servicePost.tx(req).post(lEntity, oEntry);
        //             let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
        //             let vResponse = await servicePost.tx(req).get(resUrl);
        //             flag = 'X';
        //         } catch (error) {

        //         }
        //     }
        // }
        if (flag === 'X') {
            await GenF.jobSchMessage('X', response , req);
        } else {
            await GenF.jobSchMessage('', response, req);
        }
    });
    // Create Locations in IBP
    this.on("exportIBPLocProdCopy", async (req) => {
        // Send Response to Scheduler
        let liJobData = [];
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started Location-Product export";
        let res = req._.req.res;
        const litemp = JSON.stringify(req.data);
        liJobData = JSON.parse(litemp);
        values.push({
            id,
            createtAt,
            message,
            liJobData
        });
        res.statusCode = 202;
        res.send({
            values
        });


        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[1].VALUE.toString() + "LOCATIONPRODUCT";
        let lEntity = "/" + liParaValue[1].VALUE.toString() + "LOCATIONPRODUCTTrans";
        let oReq = {
            newLocProd: [],
        },
            vNewLocProd, flag = '';
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
                      WHERE CP_LOCATION_PRODUCT.LOCATION_ID = '` + req.data.LOCATION_ID + `'
                      AND ( CP_LOCATION_PRODUCT.PRODUCT_ID IN ( SELECT distinct PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE LOCATION_ID = '${req.data.LOCATION_ID}' ))`);

        // const lipartialprod = await cds.run(
        //     `
        //                  SELECT PRODUCT_ID,
        //                         LOCATION_ID,
        //                         PROD_DESC,
        //                         REF_PRODID
        //                    FROM "CP_PARTIALPROD_INTRO"
        //                    WHERE LOCATION_ID = '`+ req.data.LOCATION_ID + `'
        //                    ORDER BY REF_PRODID`);
        const liProdAsmb = await cds.run(
            `
                             SELECT LOCATION_ID,
                                    FACTORY_LOC,
                                    COMPONENT
                               FROM "V_BOM_DEMDFACLOC" 
                               WHERE LOCATION_ID = '` + req.data.LOCATION_ID + `'`);
        const liProdAsmComp = await cds.run(
            `
                             SELECT LOCATION_ID,
                                     FACTORY_LOC,
                                    COMPONENT
                               FROM "V_COMP_DEMDFACLOC" AS A
                               WHERE A.LOCATION_ID = '` + req.data.LOCATION_ID + `'`);

        //const li_Transid = servicePost.tx(req).get("/GetTransactionID");
        for (i = 0; i < lilocprod.length; i++) {
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
            let oEntry = {
                "TransactionID": vTransID,
                "RequestedAttributes": "LOCID,PRDID,PLANNINGSTRGY,PLUNITID,PROCUREMENTTYPE,VCLOTSIZE,VCMANUFACTURINGLOC",
                "DoCommit": true
            }
            oEntry[lData] = oReq.newLocProd;
            try {
                req.headers['Application-Interface-Key'] = vAIRKey;
                await servicePost.tx(req).post(lEntity, oEntry);
                let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                let vResponse = await servicePost.tx(req).get(resUrl);
                flag = 'X';
            } catch (error) {
                console.log(error);
            }
        }
        if (flag === 'X') {
            await GenF.jobSchMessage('X', "Export of Location - Product is successful ", req);
        } else {
            await GenF.jobSchMessage('', "Export of Location - Product is failed", req);
        }
    });

    // Create Locations in IBP
    // Create Locations in IBP
     this.on("exportIBPLocProd", async (req) => {
        // Send Response to Scheduler
        let liJobData = [];
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let newData = [];
        let lmessage = "Started Location-Product export";
        let res = req._.req.res;
        let response = "Started Location-Product export";
        const litemp = JSON.stringify(req.data);
        liJobData = JSON.parse(litemp);
        values.push({
            id,
            createtAt,
            lmessage,
            liJobData
        });
        res.statusCode = 202;
        res.send({
            values
        });


        // Get Planning area and Prefix configurations for IBP
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Location Product'`);
        let liParaValue = await GenF.getParameterID();
        // // let lData = "Nav" + liParaValue[0].VALUE.toString() + "LOCATIONPRODUCT";
        // // let lEntity = "/" + liParaValue[0].VALUE.toString() + "LOCATIONPRODUCTTrans";
        //  let sPlan = aMappingData[0].PLANNING_AREA;
        // let lData = "Nav" + sPlan;
        // let lEntity = "/" + sPlan + "Trans";
        // let lMasterDataType = sPlan;
        let oReq = {
            newLocProd: [],
        },
            vNewLocProd, flag = '';
        let aFilParamVal = [];
        let liDummyLocProd = [];
        let lilocprod = [];

        const liProdAsmb = await cds.run(
                            `SELECT A.CHILD_LOC as LOCATION_ID,
                                    A.CHILD_LOC as FACTORY_LOC,
                                    A.MAT_CHILD as COMPONENT,
                                    B.MRP_GROUP,
                                    B.MRP_TYPE

                                    from "CP_BOM_MAT" AS A
                                    INNER JOIN "CP_LOCATION_PRODUCT" AS B
                                            ON A.CHILD_LOC = B.LOCATION_ID
                                            AND A.MAT_CHILD = B.PRODUCT_ID
                                    
                                    `);
        // `
        //  SELECT CHILD_LOC as LOCATION_ID,
        //         CHILD_LOC as FACTORY_LOC,
        //         MAT_CHILD as COMPONENT
        //         from "CP_BOM_MAT" `);
        // //    FROM "V_BOM_DEMDFACLOC" `);
        // //    WHERE LOCATION_ID = '` + req.data.LOCATION_ID + `'`);
        const liProdAsmComp = await cds.run(
            `
                             SELECT LOCATION_ID,
                                     FACTORY_LOC,
                                    COMPONENT
                                    FROM "V_COMP_DEMDFACLOC" `);
        //    FROM "V_COMP_DEMDFACLOC" AS A
        //    WHERE A.LOCATION_ID = '` + req.data.LOCATION_ID + `'`);
        // Generate Dummy Products

        // Fetch multi BOM config
        let vBOMConfig = await GenF.getSystemConfig('MULTILEVEL_CONFIGPRODUCT'); //('MULTIBOM');
        if (vBOMConfig === 'Yes') {
            // Get Location product for selected Demand Location
            let aLocProd = [];
            aLocProd = await cds.run(`SELECT DISTINCT
                                        CP_LOCATION_PRODUCT."LOCATION_ID",
                                        CP_LOCATION_PRODUCT."LOCATION_ID" as "FACTORY_LOC",
                                        CP_LOCATION_PRODUCT."PRODUCT_ID",
                                        CP_LOCATION_PRODUCT."LOTSIZE_KEY",
                                        CP_LOCATION_PRODUCT."LOT_SIZE",
                                        CP_LOCATION_PRODUCT."PROCUREMENT_TYPE",
                                        CP_LOCATION_PRODUCT."PLANNING_STRATEGY",
                                        CP_LOCATION_PRODUCT."MRP_GROUP",
                                        CP_LOCATION_PRODUCT."MRP_TYPE"
                                    FROM CP_LOCATION_PRODUCT `);
            // WHERE CP_LOCATION_PRODUCT.LOCATION_ID = '${req.data.LOCATION_ID}'`);

            // lilocprod = await obibpfucntions.getLocProdAlternateLoc(req.data.LOCATION_ID, req.data.LOCATION_ID, lilocprod);
            // lilocprod = await obibpfucntions.getLocProdAlternateLoc('1900','1900', lilocprod);
            lilocprod = await cds.run(
                `SELECT LOCATION_ID,
                        FACTORY_LOC,
                        DUMMY_PRODUCTID AS PRODUCT_ID,
                        '' AS LOTSIZE_KEY,
                        '0' AS LOT_SIZE,
                        '' AS PROCUREMENT_TYPE,
                        '' AS PLANNING_STRATEGY,
                        '' AS  MRP_GROUP,
                        'X0' AS MRP_TYPE
                          FROM CP_DUMMY_PRODUCT_LOC `);

            if (aLocProd.length > 0) {
                lilocprod = [...lilocprod, ...aLocProd];
                let Keys = ['LOCATION_ID', 'FACTORY_LOC', 'PRODUCT_ID', 'LOTSIZE_KEY', 'LOT_SIZE', 'PROCUREMENT_TYPE', 'PLANNING_STRATEGY', 'MRP_GROUP', 'MRP_TYPE'];
                lilocprod = GenF.removeDuplicate(lilocprod, Keys);
            }
        } else {
            lilocprod = await cds.run(
                ` SELECT DISTINCT
                            CP_LOCATION_PRODUCT."LOCATION_ID",
                            CP_FACTORY_SALESLOC."FACTORY_LOC",
                            CP_LOCATION_PRODUCT."PRODUCT_ID",
                            CP_LOCATION_PRODUCT."LOTSIZE_KEY",
                            CP_LOCATION_PRODUCT."LOT_SIZE",
                            CP_LOCATION_PRODUCT."PROCUREMENT_TYPE",
                            CP_LOCATION_PRODUCT."PLANNING_STRATEGY",
                            CP_LOCATION_PRODUCT."MRP_GROUP",
                            CP_LOCATION_PRODUCT."MRP_TYPE"
                          FROM CP_LOCATION_PRODUCT 
                          INNER JOIN CP_FACTORY_SALESLOC 
                          ON CP_LOCATION_PRODUCT.LOCATION_ID = CP_FACTORY_SALESLOC.LOCATION_ID `);
            //   WHERE CP_LOCATION_PRODUCT.LOCATION_ID = '` + req.data.LOCATION_ID + `'
            //   AND ( CP_LOCATION_PRODUCT.PRODUCT_ID IN ( SELECT distinct PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE LOCATION_ID = '${req.data.LOCATION_ID}' ))`);
        }

        // const liParamValues = await cds.run(`SELECT DISTINCT LOCATION_ID,
        //                                                      PARAMETER_ID,
        //                                                      VALUE
        //                                                FROM CP_PARAMETER_VALUES
        //                                               WHERE PARAMETER_ID IN ('1', '9')
        //                                            ORDER BY PARAMETER_ID`);

        //const li_Transid = servicePost.tx(req).get("/GetTransactionID");

        // Begin of Insert -- export Frozen / Firm Horizon
        // const lsParamVal = await GenF.getParameterValue(req.data.LOCATION_ID, 9);
        const lsParamVal = 0;
        let iFirmHorizonVal = 0;
        if (lsParamVal) {
            iFirmHorizonVal = parseInt(lsParamVal);
        }
        // End Of Insert -- export Frozen / Firm Horizon

        for (i = 0; i < lilocprod.length; i++) {

            vNewLocProd = {
                "LOCATION_ID": lilocprod[i].LOCATION_ID,
                "PRODUCT_ID": lilocprod[i].PRODUCT_ID,
                "PLANNING_STRATEGY": lilocprod[i].PLANNING_STRATEGY,
                "PLUNITID": '',
                "PROCUREMENT_TYPE": lilocprod[i].PROCUREMENT_TYPE,
                "LOT_SIZE": lilocprod[i].LOT_SIZE.toString(),
                "FACTORY_LOC": lilocprod[i].FACTORY_LOC,
                "MRP_GROUP": lilocprod[i].MRP_GROUP ,
                "MRP_TYPE" : lilocprod[i].MRP_TYPE ,
                "VCFROZENPERIOD02": iFirmHorizonVal,
                "SOURCE_ID": lilocprod[i].LOCATION_ID + "_" + lilocprod[i].PRODUCT_ID
            };
            oReq.newLocProd.push(vNewLocProd);
        }
        for (let iComp = 0; iComp < liProdAsmComp.length; iComp++) {
            vNewLocProd = {
                "LOCATION_ID": liProdAsmComp[iComp].LOCATION_ID,
                "PRODUCT_ID": liProdAsmComp[iComp].COMPONENT,
                "PLANNING_STRATEGY": '',
                "PLUNITID": '',
                "PROCUREMENT_TYPE": '',
                "LOT_SIZE": '0',
                "FACTORY_LOC": liProdAsmComp[iComp].FACTORY_LOC,
                "MRP_GROUP": liProdAsmComp[iComp].MRP_GROUP ,
                "MRP_TYPE" : liProdAsmComp[iComp].MRP_TYPE ,
                "VCFROZENPERIOD02": 0,

                "SOURCE_ID": liProdAsmComp[iComp].LOCATION_ID + "_" + liProdAsmComp[iComp].COMPONENT
            };
            oReq.newLocProd.push(vNewLocProd);
        }
        if (vBOMConfig == 'No') {
            for (let iComp = 0; iComp < liProdAsmb.length; iComp++) {
                vNewLocProd = {
                    "LOCATION_ID": liProdAsmb[iComp].LOCATION_ID,
                    "PRODUCT_ID": liProdAsmb[iComp].COMPONENT,
                    "PLANNING_STRATEGY": '',
                    "PLUNITID": '',
                    "PROCUREMENT_TYPE": '',
                    "LOT_SIZE": '0',
                    "FACTORY_LOC": liProdAsmb[iComp].FACTORY_LOC,
                    "MRP_GROUP": liProdAsmb[iComp].MRP_GROUP ,
                    "MRP_TYPE" : liProdAsmb[iComp].MRP_TYPE ,
                    "VCFROZENPERIOD02": 0,
                    "SOURCE_ID": liProdAsmb[iComp].LOCATION_ID + "_" + liProdAsmb[iComp].COMPONENT
                };
                oReq.newLocProd.push(vNewLocProd);
            }
        }


        // let Keys = ['LOCATION_ID', 'PRODUCT_ID'];
        // oReq.newLocProd = GenF.removeDuplicate(oReq.newLocProd, Keys);
        newData = JSON.stringify(oReq.newLocProd);

        console.log(oReq.newLocProd.length);

        let Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
        let distData = GenF.removeDuplicate(aTableData, Keys);

        let aMappingData = [];
        for (var z = 0; z < distData.length; z++) {
            aMappingData = aTableData.filter(e => e.PLANNING_AREA == distData[z].PLANNING_AREA);

            let sPlan = aMappingData[0].PLANNING_AREA;
            let lData = "Nav" + liParaValue[0].VALUE.toString() + sPlan;
            let lEntity = "/" + liParaValue[0].VALUE.toString() + sPlan + "Trans";
            let lMasterDataType = liParaValue[0].VALUE.toString() + sPlan;
            console.log("sPlan", sPlan);
            console.log("lData", lData);
            console.log("lEntity", lEntity);
            console.log("lMasterDataType", lMasterDataType);


            let aLocProdf = await GenF.mappingData('Location Product', distData[z].PLANNING_AREA, '', oReq.newLocProd);
            if (aLocProdf.length > 0) {
                // let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Location Product'`);
                aMappingData.filter((el) => {
                    if (el.TYPE == 'C') {
                        el.MAPPING_FIELD = el.BTP_FIELD
                    }
                    else if (el.TYPE == 'D') {
                        el.BTP_FIELD = el.MAPPING_FIELD
                    }
                })
                const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
                aLocProdf = aLocProdf.filter(record => {
                    return requiredFields.every(field => record[field] != null && record[field] != "");
                });
                let Keys = Object.keys(aLocProdf[0]);
                aLocProdf = GenF.removeDuplicate(aLocProdf, Keys);
                let requestedAttributesStr = Array.from(Keys).join(',');
                if (aLocProdf.length > 0) {
                    let vTransID = new Date().getTime().toString();
                    // let vMDTyp = liParaValue[0].VALUE.toString() + "LOCATIONPRODUCT";
                    let vMDTyp = lMasterDataType;

                    // Parallel processing logic to export huge data buckets
                    if (oReq.newLocProd.length > 5000) {
                        let iChnk, iChkCounter = 0;

                        // Initialize Parallel processing 
                        let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
                        try {
                            await servicePost.tx(req).post(reqUrlPPInit);
                        } catch (e) {
                            console.log(e);
                        }

                        // Divide into multiple arrays with each array length as 5000
                        chunked = true;
                        let aData = aLocProdf;
                        chunksList = [];
                        const chunkSize = 5000;

                        for (let i = 0; i < aData.length; i += chunkSize) {
                            const chunk = aData.slice(i, i + chunkSize)
                            chunksList.push(chunk);
                        }

                        // Process each chunk to IBP
                        for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

                            let oEntry = {
                                "TransactionID": vTransID,
                                "RequestedAttributes": requestedAttributesStr
                            }
                            oEntry[lData] = chunksList[iChnk];
                            try {
                                req.headers['Application-Interface-Key'] = vAIRKey;
                                console.log(req.headers);
                                await servicePost.tx(req).post(lEntity, oEntry);
                                iChkCounter = iChkCounter + 1;
                            } catch (err) {
                                GenF.log(err);
                            }
                        }
                        // If all are successfull commit the request
                        if (iChkCounter > 0) {
                            let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
                            try {
                                await servicePost.tx(req).post(reqUrlPPCommit);
                                GenF.log("Export of Location Product success");
                                flag = 'X';
                                response = response + "Export of Location Product success for" + lMasterDataType;
                            } catch (e) {

                                GenF.log(e);
                                GenF.log("Error while committing the parallel processing for Location Product");
                                // lmessage = "Error while committing the parallel processing for Location Product";
                                response = response + "Export of Location Product failed for" + lMasterDataType+'.Reason: '+e.message;

                            }
                        }
                    }
                    else {
                        let oEntry = {
                            "TransactionID": vTransID,
                            "RequestedAttributes": requestedAttributesStr,
                            "DoCommit": true
                        }
                        oEntry[lData] = aLocProdf;
                        try {
                            req.headers['Application-Interface-Key'] = vAIRKey;
                            console.log(req.headers);
                            await servicePost.tx(req).post(lEntity, oEntry);
                            let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                            let vResponse = await servicePost.tx(req).get(resUrl);
                            flag = 'X';
                            // lmessage = "Export of Location Product success";
                            response = response + "Export of Location Product success for" + lMasterDataType;
                        } catch (error) {

                            console.log(error);
                            // lmessage = "Export of Location Product failed"
                            response = response + "Export of Location Product failed for" + lMasterDataType+'.Reason: '+error.message;
                        }
                    }
                }
            }

        }

        // newData = JSON.parse(newData);
        // sPlan = '';
        // lData = '';
        // lEntity = '';
        // lMasterDataType = '';
        // aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Assembly Header'`);
        // Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
        // distData = GenF.removeDuplicate(aTableData, Keys);
        // let aMappingDataNew = [];
        // for (var z = 0; z < distData.length; z++) {

        //     aMappingDataNew = aTableData.filter(e => e.PLANNING_AREA == distData[z].PLANNING_AREA);

        //     let sPlan = aMappingDataNew[0].PLANNING_AREA;
        //     let lData = "Nav" + liParaValue[0].VALUE.toString() + sPlan;
        //     let lEntity = "/" + liParaValue[0].VALUE.toString() + sPlan + "Trans";
        //     let lMasterDataType = liParaValue[0].VALUE.toString() + sPlan;
        //     console.log("sPlan", sPlan);
        //     console.log("lData", lData);
        //     console.log("lEntity", lEntity);
        //     console.log("lMasterDataType", lMasterDataType);


        //     let aLocProdfNew = await GenF.mappingData('Assembly Header', distData[z].PLANNING_AREA, '', newData);
        //     if (aLocProdfNew.length > 0) {

        //         aMappingDataNew.filter((el) => {
        //             if (el.TYPE == 'C') {
        //                 el.MAPPING_FIELD = el.BTP_FIELD
        //             }
        //             else if (el.TYPE == 'D') {
        //                 el.BTP_FIELD = el.MAPPING_FIELD
        //             }
        //         })
        //         // sPlan = aMappingDataNew[0].PLANNING_AREA;
        //         //  lData = "Nav" + sPlan;
        //         //  lEntity = "/" + sPlan + "Trans";
        //         //  lMasterDataType = sPlan;
        //         const requiredFields = aMappingDataNew.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
        //         aLocProdfNew = aLocProdfNew.filter(record => {
        //             return requiredFields.every(field => record[field] != null && record[field] != "");
        //         });
        //         let Keys = Object.keys(aLocProdfNew[0]);
        //         aLocProdfNew = GenF.removeDuplicate(aLocProdfNew, Keys);
        //         let requestedAttributesStr = Array.from(Keys).join(',');
        //         if (aLocProdfNew.length > 0) {
        //             let vTransID = new Date().getTime().toString();
        //             // // let vMDTyp = liParaValue[0].VALUE.toString() + "SOURCEPRODUCTION";
        //             // // let lEntity = "/" + liParaValue[0].VALUE.toString() + "SOURCEPRODUCTIONTrans";
        //             // // // let lMasterDataType = liParaValue[0].VALUE.toString() + "SOURCEPRODUCTION";
        //             // // let lData = "Nav" + liParaValue[0].VALUE.toString() + "SOURCEPRODUCTION";

        //             // let lData = "Nav" + sPlan;
        //             // let lEntity = "/" + sPlan + "Trans";
        //             let vMDTyp = lMasterDataType;


        //             // Parallel processing logic to export huge data buckets
        //             if (newData.length > 5000) {
        //                 let iChnk, iChkCounter = 0;

        //                 // Initialize Parallel processing 
        //                 let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
        //                 try {
        //                     await servicePost.tx(req).post(reqUrlPPInit);
        //                 } catch (e) {
        //                     console.log(e);
        //                 }

        //                 // Divide into multiple arrays with each array length as 5000
        //                 chunked = true;
        //                 let aData = aLocProdfNew;
        //                 chunksList = [];
        //                 const chunkSize = 5000;

        //                 for (let i = 0; i < aData.length; i += chunkSize) {
        //                     const chunk = aData.slice(i, i + chunkSize)
        //                     chunksList.push(chunk);
        //                 }

        //                 // Process each chunk to IBP
        //                 for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

        //                     let oEntry = {
        //                         "TransactionID": vTransID,
        //                         "RequestedAttributes": requestedAttributesStr
        //                     }
        //                     oEntry[lData] = chunksList[iChnk];
        //                     try {
        //                         req.headers['Application-Interface-Key'] = vAIRKey;
        //                         console.log(req.headers);
        //                         await servicePost.tx(req).post(lEntity, oEntry);
        //                         iChkCounter = iChkCounter + 1;
        //                     } catch (err) {
        //                         GenF.log(err);
        //                     }
        //                 }
        //                 // If all are successfull commit the request
        //                 if (iChkCounter > 0) {
        //                     let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
        //                     try {
        //                         await servicePost.tx(req).post(reqUrlPPCommit);
        //                         // lmessage = lmessage + "Export of assembly header for Location Product success";
        //                         flag = 'X';
        //                         GenF.log("Export of assembly header for Location Product success");
        //                         response = response + "Export of assembly header for Location Product success for" + lMasterDataType;
        //                     } catch (e) {
        //                         GenF.log(e);

        //                         //  lmessage = lmessage + "Error while committing the parallel processing for assembly header for Location Product";
        //                         GenF.log("Error while committing the parallel processing for assembly header for Location Product");
        //                         response = response + "Export of assembly header for Location Product failed" + lMasterDataType+'.Reason: '+e.message;
        //                     }
        //                 }
        //             }
        //             else {
        //                 let oEntry = {
        //                     "TransactionID": vTransID,
        //                     "RequestedAttributes": requestedAttributesStr,
        //                     "DoCommit": true
        //                 }
        //                 oEntry[lData] = aLocProdfNew;
        //                 try {
        //                     req.headers['Application-Interface-Key'] = vAIRKey;
        //                     console.log(req.headers);
        //                     await servicePost.tx(req).post(lEntity, oEntry);
        //                     let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
        //                     let vResponse = await servicePost.tx(req).get(resUrl);

        //                     // lmessage = lmessage + "Export of assembly header for Location Product success";
        //                     GenF.log("Export of assembly header for Location Product success");
        //                     flag = 'X';
        //                     response = response + "Export of assembly header for Location Product success for" + lMasterDataType;
        //                 } catch (error) {

        //                     console.log(error);
        //                     // lmessage = lmessage + "Export of assembly header for Location Product ";
        //                     GenF.log("Export of assembly header for Location Product ");
        //                     response = response + "Export of assembly header for Location Product failed" + lMasterDataType+'.Reason: '+error.message;
        //                 }
        //             }
        //         }
        //     }
        // }

        if (flag === 'X') {
            console.log("success");
            await GenF.jobSchMessage('X', response, req);
        } else {
            console.log("error");
            await GenF.jobSchMessage('', response, req);


        }
    });
    
    
    // this.on("exportIBPLocProd", async (req) => {
    //     // Send Response to Scheduler
    //     let liJobData = [];
    //     let createtAt = new Date();
    //     let id = uuidv1();
    //     let values = [];
    //     let message = "Started Location-Product export";
    //     let res = req._.req.res;
    //     const litemp = JSON.stringify(req.data);
    //     liJobData = JSON.parse(litemp);
    //     // req.data.LOCATION_ID = "1600"
    //     values.push({
    //         id,
    //         createtAt,
    //         message,
    //         liJobData
    //     });
    //     res.statusCode = 202;
    //     res.send({
    //         values
    //     });
       



    //     // Get Planning area and Prefix configurations for IBP
    //     let liParaValue = await GenF.getParameterID();
    //     let lData = "Nav" + liParaValue[0].VALUE.toString() + "LOCATIONPRODUCT";
    //     let lEntity = "/" + liParaValue[0].VALUE.toString() + "LOCATIONPRODUCTTrans";
    //     let oReq = {
    //         newLocProd: [],
    //     },
    //         vNewLocProd, flag = '';
            
    //     const lilocprod = await cds.run(
    //         ` SELECT DISTINCT
    //                     CP_LOCATION_PRODUCT."LOCATION_ID",
    //                     CP_FACTORY_SALESLOC."FACTORY_LOC",
    //                     CP_LOCATION_PRODUCT."PRODUCT_ID",
    //                     CP_LOCATION_PRODUCT."LOTSIZE_KEY",
    //                     CP_LOCATION_PRODUCT."LOT_SIZE",
    //                     CP_LOCATION_PRODUCT."PROCUREMENT_TYPE",
    //                     CP_LOCATION_PRODUCT."PLANNING_STRATEGY"
    //                   FROM CP_LOCATION_PRODUCT 
    //                   INNER JOIN CP_FACTORY_SALESLOC 
    //                   ON CP_LOCATION_PRODUCT.LOCATION_ID = CP_FACTORY_SALESLOC.LOCATION_ID
    //                   WHERE CP_LOCATION_PRODUCT.LOCATION_ID = '` + req.data.LOCATION_ID + `'
    //                   AND ( CP_LOCATION_PRODUCT.PRODUCT_ID IN ( SELECT distinct PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE LOCATION_ID = '${req.data.LOCATION_ID}' ))`);

    //     // const lipartialprod = await cds.run(
    //     //     `
    //     //                  SELECT PRODUCT_ID,
    //     //                         LOCATION_ID,
    //     //                         PROD_DESC,
    //     //                         REF_PRODID
    //     //                    FROM "CP_PARTIALPROD_INTRO"
    //     //                    WHERE LOCATION_ID = '`+ req.data.LOCATION_ID + `'
    //     //                    ORDER BY REF_PRODID`);
    //     const liProdAsmb = await cds.run(
    //         `
    //                          SELECT LOCATION_ID,
    //                                 FACTORY_LOC,
    //                                 COMPONENT AS PRODUCT_ID
    //                            FROM "V_BOM_DEMDFACLOC" 
    //                            WHERE LOCATION_ID = '` + req.data.LOCATION_ID + `'`);
    //     const liProdAsmComp = await cds.run(
    //         `
    //                          SELECT LOCATION_ID,
    //                                  FACTORY_LOC,
    //                                 COMPONENT AS PRODUCT_ID
    //                            FROM "V_COMP_DEMDFACLOC" AS A
    //                            WHERE A.LOCATION_ID = '` + req.data.LOCATION_ID + `'`);

        
    //     const combinedData = [...lilocprod, ...liProdAsmb, ...liProdAsmComp];
    //     let mappedLocProd = await GenF.mappingData('Location Product', '', combinedData);
    //     let Keys = Object.keys(mappedLocProd[0]);
    //     let requestedAttributesStr = Array.from(Keys).join(',');


        

    //     mappedLocProd = GenF.removeDuplicate(mappedLocProd, Keys);
    //     let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Location Product'`);
    //      const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
    //      mappedLocProd = mappedLocProd.filter(record => {
    //          return requiredFields.every(field => record[field] != null && record[field] !== "");
    //      });
    //     if (mappedLocProd.length > 0) {
    //         let vTransID = new Date().getTime().toString();
    //         let oEntry = {
    //             "TransactionID": vTransID,
    //             "RequestedAttributes": requestedAttributesStr,
    //             "DoCommit": true
    //         }
    //         oEntry[lData] = mappedLocProd;
    //         try {
    //             req.headers['Application-Interface-Key'] = vAIRKey;
    //             await servicePost.tx(req).post(lEntity, oEntry);
    //             let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
    //             let vResponse = await servicePost.tx(req).get(resUrl);
    //             flag = 'X';
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }
    //     if (flag === 'X') {
    //         await GenF.jobSchMessage('X', "Export of Location - Product is successful ", req);
    //     } else {
    //         await GenF.jobSchMessage('', "Export of Location - Product is failed", req);
    //     }
    // });

    // Create customer group in IBP
    // this.on("exportIBPCustomer", async (req) => {

    //     // Get Planning area and Prefix configurations for IBP
    //     let liParaValue = await GenF.getIBPParameterValue();
    //     let lData = "Nav" + liParaValue[1].VALUE.toString() + "CUSTOMER";
    //     let lEntity = "/" + liParaValue[1].VALUE.toString() + "CUSTOMERTrans";
    //     let oReq = {
    //         cust: [],
    //     },
    //         vcust, flag = '';

    //     const licust = await cds.run(
    //         `
    //         SELECT "CUSTOMER_GROUP",
    //                "CUSTOMER_DESC"
    //                FROM "CP_CUSTOMERGROUP" `);

    //     //const li_Transid = servicePost.tx(req).get("/GetTransactionID");
    //     for (i = 0; i < licust.length; i++) {
    //         vcust = {
    //             "CUSTID": licust[i].CUSTOMER_GROUP,
    //             "CUSTDESCR": licust[i].CUSTOMER_DESC,
    //         };
    //         oReq.cust.push(vcust);

    //     }
    //     if (oReq.cust.length > 0) {
    //         let vTransID = new Date().getTime().toString();
    //         let vMDTyp = 'VCDCUSTOMER';
    //         // Parallel processing logic to export huge data buckets
    //         if (oReq.cust.length > 5000) {
    //             let iChnk, iChkCounter = 0;

    //             // Initialize Parallel processing 
    //             let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
    //             try {
    //                 await servicePost.tx(req).post(reqUrlPPInit);
    //             } catch (e) {
    //                 console.log(e);
    //             }

    //             // Divide into multiple arrays with each array length as 5000
    //             chunked = true;
    //             let aData = oReq.cust;
    //             chunksList = [];
    //             const chunkSize = 5000;

    //             for (let i = 0; i < aData.length; i += chunkSize) {
    //                 const chunk = aData.slice(i, i + chunkSize)
    //                 chunksList.push(chunk);
    //             }

    //             // Process each chunk to IBP
    //             for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

    //                 let oEntry = {
    //                     "TransactionID": vTransID,
    //                     "RequestedAttributes": "CUSTID,CUSTDESCR"
    //                 }
    //                 oEntry[lData] = chunksList[iChnk];
    //                 try {
    //                     req.headers['Application-Interface-Key'] = vAIRKey;
    //                     console.log(req.headers);
    //                     await servicePost.tx(req).post(lEntity, oEntry);
    //                     iChkCounter = iChkCounter + 1;
    //                 } catch (err) {
    //                     GenF.log(err);
    //                 }
    //             }
    //             // If all are successfull commit the request
    //             if (iChkCounter > 0) {
    //                 let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
    //                 try {
    //                     await servicePost.tx(req).post(reqUrlPPCommit);
    //                     flag = 'X';
    //                 } catch (e) {
    //                     GenF.log(e);
    //                     GenF.log("Error while committing the parallel processing");
    //                 }
    //             }
    //         }
    //         else {
    //             let oEntry = {
    //                 "TransactionID": vTransID,
    //                 "RequestedAttributes": "CUSTID,CUSTDESCR",
    //                 "DoCommit": true
    //             }
    //             oEntry[lData] = oReq.cust;

    //             try {
    //                 req.headers['Application-Interface-Key'] = vAIRKey;
    //                 console.log(req.headers);
    //                 await servicePost.tx(req).post(lEntity, oEntry);
    //                 let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
    //                 let aResponse = await servicePost.tx(req).get(resUrl);
    //                 flag = 'X';
    //             } catch (error) {

    //             }
    //         }
    //     }
    //     if (flag === 'X') {
    //         await GenF.jobSchMessage('X', "Export of Customer group is successful ", req);
    //     } else {
    //         await GenF.jobSchMessage('', "Export of Customer group is failed", req);
    //     }
    // });
     
    
    this.on("exportIBPCustomer", async (req) => {

        // Get Planning area and Prefix configurations for IBP
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Customer Group'`);
        let liParaValue = await GenF.getParameterID();
        let Response = '';

        // // let lData = "Nav" + liParaValue[0].VALUE.toString() + "CUSTOMER";
        // // let lEntity = "/" + liParaValue[0].VALUE.toString() + "CUSTOMERTrans";
        // let sPlan = aMappingData[0].PLANNING_AREA;
        // let lData = "Nav" + sPlan;
        // let lEntity = "/" + sPlan + "Trans";
        // let lMasterDataType = sPlan;
        let oReq = {
            cust: [],
        },
            vcust, flag = '';

        const licust = await cds.run(
            `
            SELECT "CUSTOMER_GROUP",
                   "CUSTOMER_DESC"
                   FROM "CP_CUSTOMERGROUP" `);

        let Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
        let distData = GenF.removeDuplicate(aTableData, Keys);
        let aMappingData = [];
        for (var z = 0; z < distData.length; z++) {

            aMappingData = aTableData.filter(e => e.PLANNING_AREA == distData[z].PLANNING_AREA);
            let sPlan = aMappingData[0].PLANNING_AREA;
            let lData = "Nav" + liParaValue[0].VALUE.toString() + sPlan;
            let lEntity = "/" + liParaValue[0].VALUE.toString() + sPlan + "Trans";
            let lMasterDataType = liParaValue[0].VALUE.toString() + sPlan;
            console.log("sPlan", sPlan);
            console.log("lData", lData);
            console.log("lEntity", lEntity);
            console.log("lMasterDataType", lMasterDataType);

            let aCust = await GenF.mappingData('Customer Group', distData[z].PLANNING_AREA,'', licust);
            if (aCust.length > 0) {
                //   let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Customer Group'`);
                const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
                aCust = aCust.filter(record => {
                    return requiredFields.every(field => record[field] != null && record[field] !== "");
                });
                let Keys = Object.keys(aCust[0]);
                let requestedAttributesStr = Array.from(Keys).join(',');
                oReq.cust = aCust;

                let vTransID = new Date().getTime().toString();
                // let vMDTyp = liParaValue[0].VALUE.toString() + "CUSTOMER";
                let vMDTyp = lMasterDataType;
                // Parallel processing logic to export huge data buckets
                if (oReq.cust.length > 5000) {
                    let iChnk, iChkCounter = 0;

                    // Initialize Parallel processing 
                    let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
                    try {
                        await servicePost.tx(req).post(reqUrlPPInit);
                    } catch (e) {
                        console.log(e);
                    }

                    // Divide into multiple arrays with each array length as 5000
                    chunked = true;
                    let aData = aCust;
                    chunksList = [];
                    const chunkSize = 5000;

                    for (let i = 0; i < aData.length; i += chunkSize) {
                        const chunk = aData.slice(i, i + chunkSize)
                        chunksList.push(chunk);
                    }

                    // Process each chunk to IBP
                    for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

                        let oEntry = {
                            "TransactionID": vTransID,
                            "RequestedAttributes": requestedAttributesStr
                        }
                        oEntry[lData] = chunksList[iChnk];
                        try {
                            req.headers['Application-Interface-Key'] = vAIRKey;
                            console.log(req.headers);
                            await servicePost.tx(req).post(lEntity, oEntry);
                            iChkCounter = iChkCounter + 1;
                        } catch (err) {
                            GenF.log(err);
                        }
                    }
                    // If all are successfull commit the request
                    if (iChkCounter > 0) {
                        let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
                        try {
                            await servicePost.tx(req).post(reqUrlPPCommit);
                            flag = 'X';
                            Response = Response + "Export of Customer group is successful for" + lMasterDataType;
                        } catch (e) {
                            Response = Response + "Export of Customer group is failed for " + lMasterDataType+`.Reason: ${e.message}`;
                            GenF.log("Error while committing the parallel processing");
                        }
                    }
                }
                else {
                    let oEntry = {
                        "TransactionID": vTransID,
                        "RequestedAttributes": requestedAttributesStr,
                        "DoCommit": true
                    }
                    oEntry[lData] = aCust;

                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        console.log(req.headers);
                        await servicePost.tx(req).post(lEntity, oEntry);
                        let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                        let aResponse = await servicePost.tx(req).get(resUrl);
                        flag = 'X';
                            Response = Response + "Export of Customer group is successful for" + lMasterDataType;
                    } catch (error) {
                            Response = Response + "Export of Customer group is failed for " + lMasterDataType+`.Reason: ${error.message}`;

                    }
                }
            }
        }
        if (flag === 'X') {
            await GenF.jobSchMessage('X', Response, req);
        } else {
            await GenF.jobSchMessage('', Response, req);
        }
    });   

    // Create class in IBP
    this.on("exportIBPClass", async (req) => {
        // Send Response to Scheduler
        let liJobData = [];
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started export of Class , Charateristics and Charateristics values";
        let res = req._.req.res;
        const litemp = JSON.stringify(req.data);
        liJobData = JSON.parse(litemp);
        values.push({
            id,
            createtAt,
            message,
            liJobData
        });
        res.statusCode = 202;
        res.send({
            values
        });
        var sError='';
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[1].VALUE.toString() + "CLASS";
        let lEntity = "/" + liParaValue[1].VALUE.toString() + "CLASSTrans";
        let oReq = {
            class: [],
        },
            vclass, aResponse, flag = '';
        const liclass = await cds.run(
            `
                SELECT DISTINCT CLASS_NUM,
                        CLASS_NAME,
                        CLASS_DESC,
                        CHAR_NUM,
                        CHAR_NAME,
                        CHAR_DESC,
                        CHAR_GROUP,
                        CHAR_VALUE,
                        CHARVAL_NUM,
                        CHARVAL_DESC,
                        REF_CHAR_NUM,  
                        REF_CHAR_NAME,  
                        REF_CHAR_DESC,
                        REF_CHARVAL_NUM,
                        REF_CHAR_VALUE,
                        GENFLAG  
                    FROM V_CLASSCHARVAL
                    WHERE IBPCHAR_CHK = true`);
        //CLASS_NUM = '`+ req.data.CLASS_NUM + `'

        for (i = 0; i < liclass.length; i++) {
            vclass = {
                "VCCHAR": liclass[i].CHAR_NUM,
                "VCCHARVALUE": liclass[i].CHAR_VALUE,
                "VCCLASS": liclass[i].CLASS_NUM,
                "VCCHARNAME": liclass[i].CHAR_NAME,
                "VCCHARGROUP": liclass[i].CHAR_GROUP,
                "VCCHARVALUENAME": liclass[i].CHAR_VALUE,
                "VCCLASSNAME": liclass[i].CLASS_NAME,
                "VCCHARDESC": liclass[i].CHAR_DESC,
                "VCCHARVALUEDESC": liclass[i].CHARVAL_DESC,
                "VCCLASSDESC": liclass[i].CLASS_DESC,
                "VCCHARDESCREF": liclass[i].REF_CHAR_DESC,
                "VCCHARNAMEREF": liclass[i].REF_CHAR_NAME,
                "VCCHARREF": liclass[i].REF_CHAR_NUM,
                "VCCHARVALUEGENFLAG": liclass[i].GENFLAG,
                "VCCHARVALUEREF": liclass[i].REF_CHAR_VALUE
            };
            //Patch to replace  CHAR_VALUE with CHARVAL_NUM  if MAP_CHARVALUE_CHARVALNUM is Yes from System Configuration
            const charObj = {
                CLASS_NUM: vclass["VCCLASS"],
                CHAR_NUM: vclass["VCCHAR"],
                CHARVAL_NUM: vclass["VCCHARVALUE"]
            }
            var sCharValNum = await GenF.mapCharValue(charObj, 'E');
            vclass.VCCHARVALUE = sCharValNum;
            // vclass.VCCHARVALUENAME = sCharValNum;
            oReq.class.push(vclass);
        }
        let vKeysReq = ['VCCHAR', 'VCCLASS', 'VCCHARVALUE'];

        oReq.class = GenF.removeDuplicate(oReq.class, vKeysReq);


        if (oReq.class.length > 0) {
            let vTransID = new Date().getTime().toString();
            let vMDTyp = 'VCDCLASS';

            // Parallel processing logic to export huge data buckets
            if (oReq.class.length > 5000) {
                let iChnk, iChkCounter = 0;

                // Initialize Parallel processing 
                let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
                try {
                    await servicePost.tx(req).post(reqUrlPPInit);
                } catch (e) {
                    console.log(e);
                }

                // Divide into multiple arrays with each array length as 5000
                chunked = true;
                let aData = oReq.class;
                chunksList = [];
                const chunkSize = 5000;

                for (let i = 0; i < aData.length; i += chunkSize) {
                    const chunk = aData.slice(i, i + chunkSize)
                    chunksList.push(chunk);
                }

                // Process each chunk to IBP
                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

                    let oEntry = {
                        "TransactionID": vTransID,
                        "RequestedAttributes": "VCCHAR,VCCHARGROUP,VCCHARNAME,VCCHARVALUE,VCCHARVALUENAME,VCCLASS,VCCLASSNAME,VCCHARDESC,VCCHARVALUEDESC,VCCLASSDESC,VCCHARDESCREF,VCCHARNAMEREF,VCCHARREF,VCCHARVALUEGENFLAG,VCCHARVALUEREF"
                    }
                    oEntry[lData] = chunksList[iChnk];
                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        await servicePost.tx(req).post(lEntity, oEntry);
                        iChkCounter = iChkCounter + 1;
                    } catch (err) {
                        GenF.log(err);
                    }
                }
                // If all are successfull commit the request
                if (iChkCounter > 0) {
                    let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
                    try {
                        await servicePost.tx(req).post(reqUrlPPCommit);
                        flag = 'X';
                    } catch (e) {
                        GenF.log("Error while committing the parallel processing");
                         sError='Reason: '+e.message;
                    }
                }
            }
            else {
                let oEntry = {
                    "TransactionID": vTransID,
                    "RequestedAttributes": "VCCHAR,VCCHARGROUP,VCCHARNAME,VCCHARVALUE,VCCHARVALUENAME,VCCLASS,VCCLASSNAME,VCCHARDESC,VCCHARVALUEDESC,VCCLASSDESC,VCCHARDESCREF,VCCHARNAMEREF,VCCHARREF,VCCHARVALUEGENFLAG,VCCHARVALUEREF",
                    "DoCommit": true
                }
                oEntry[lData] = oReq.class;

                try {
                    req.headers['Application-Interface-Key'] = vAIRKey;
                    console.log(req.headers);
                    await servicePost.tx(req).post(lEntity, oEntry);
                    let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                    aResponse = await servicePost.tx(req).get(resUrl);
                    flag = 'X';
                } catch (error) {
                    GenF.log(error);
                    sError='Reason: '+error.message;
                }
            }
        }
        if (flag === 'X') {
            await GenF.jobSchMessage('X', "Export of class and charateristics is successful ", req);
        } else {
            await GenF.jobSchMessage('', `Export of class and charateristics is failed.${sError}`, req);
        }
    });
    // Export seed order config

    this.on("exportIBPSeedOrdTrans", async (req) => {
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
        let oReq = {
            sales: [],
        },
            chunksList = [],
            oReqCfg = {
                sales: [],
            },

            oReqStock = {
                stock: [],
            };
        let vsales, flag = '',
            lMessage = '';
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started exporting SeedOrder History and Configurations";
        let res = req._.req.res;
        let lilocProdReq = JSON.parse(req.data.LocProdData);
        var aErrorLog = [];
        // lilocProdReq = [{
        //     "LOCATION_ID":'2110',
        //     "PRODUCT_ID":'VCP_M1_01'
        // }]
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        } else {
            lilocProd = JSON.parse(req.data.LocProdData);
        }

        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });
        const lsSales = await GenF.getParameterValue(lilocProdReq[0].LOCATION_ID, 11);
        console.log(lsSales);


        const lsMaxDate = await SELECT.one.columns("MAX(WEEK_DATE) AS MAX_DATE")
            .from('V_IBP_SALESH_ACTDEMD');
        let vToDate = lsMaxDate.MAX_DATE;
        console.log(vToDate);

        let vFromDate = new Date();
        vFromDate.setDate(vFromDate.getDate() - (parseInt(lsSales) * 7));
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];
        console.log(vFromDate);

        let liDates = obibpfucntions.generateDateseries(vFromDate, vToDate);
        let sIBPOptionPercent = await GenF.getSystemConfig('IBP_OPTION_PERCENT');
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
                            WHERE LOCATION_ID = '` + lsData.LOCATION_ID + `'
                               AND PRODUCT_ID = '` + lsData.PRODUCT_ID +
                `'`);
            const liCust = await cds.run(
                `
                        SELECT DISTINCT 
                                "LOCATION_ID",
                                "PRODUCT_ID",
                                "CUSTOMER_GROUP"
                                FROM V_IBP_SALESH_ACTDEMD
                                WHERE LOCATION_ID = '` + lsData.LOCATION_ID + `'
                                   AND PRODUCT_ID = '` + lsData.PRODUCT_ID +
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
                                // "ACTUALDEMAND": vDemd,
                                "SEEDORDERDEMAND": vAdjqty,
                                "PERIODID0_TSTAMP": vWeekDate[0]
                            };
                            oReq.sales.push(vsales);
                        }
                    }
                }
                if (oReq.sales.length > 0) {

                    let vTransID = new Date().getTime().toString();
                    let oEntry = {
                        "Transactionid": vTransID,
                        "AggregationLevelFieldsString": "LOCID,PRDID,CUSTID,SEEDORDERDEMAND,PERIODID0_TSTAMP",
                        "VersionID": "",
                        "DoCommit": true,
                        "ScenarioID": ""
                    }
                    oEntry[lData] = oReq.sales
                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        console.log(req.headers);
                        await service.tx(req).post(lEntity, oEntry);
                        flag = 'S';
                    } catch (err) {
                        console.log("Unable to send Actual demand at VC");
                    }
                    // Once Sales History is successfull , send sales Config . Actual demand at VC
                    if (flag === 'S') {
                        oReqCfg = {
                            sales: [],
                        };

                        console.log(flag);
                        if (sIBPOptionPercent == 'Yes') {
                           oReqCfg = await obibpfucntions.exportSeedOrdCfg(lsData, liDates);
                        }

                        if (oReqCfg.sales.length > 0 && sIBPOptionPercent == 'Yes') {
                            console.log(oReqCfg.sales.length);
                            // SeedOrder History Config
                            let vTransID = new Date().getTime().toString();
                            // Parallel processing logic to export huge data buckets
                            if (oReqCfg.sales.length > 5000) {
                                let iChnk, iChkCounter = 0;
                                // Initialize Parallel processing
                                let resUrlPP = "/InitiateParallelProcess?ScenarioID=''&VersionID=''&PlanningArea='" + liParaValue[0].VALUE + "'&Transactionid='" + vTransID + "'";
                                try {
                                    await service.tx(req).post(resUrlPP);
                                } catch (e) {
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
                                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
                                    let oEntryCfgPP = {
                                        "Transactionid": vTransID,
                                        "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,SEEDORDERDEMANDVC,PERIODID0_TSTAMP",
                                        "VersionID": "",
                                        "ScenarioID": ""
                                    }
                                    oEntryCfgPP[lData] = chunksList[iChnk];
                                    try {
                                        req.headers['Application-Interface-Key'] = vAIRKey;
                                        console.log(req.headers);
                                        await service.tx(req).post(lEntity, oEntryCfgPP);
                                        iChkCounter = iChkCounter + 1;
                                    } catch (err) {
                                        console.log(err);
                                        // iChkCounter = 0;
                                        // console.log(err.message);
                                    }
                                }
                                // If all are successfull commit the request
                                if (iChkCounter > 0) {
                                    let resUrlPPCommit = "/commit?P_TransactionID='" + vTransID + "'&$format=json";
                                    try {
                                        await service.tx(req).post(resUrlPPCommit);
                                        lMessage = lMessage + ' ' + 'Export of Seedorder History and Configuration is successful for product:' + lsData.PRODUCT_ID;
                                    } catch (e) {
                                        console.log("Error while committing the parallel processing");
                                         lMessage = lMessage + ' ' + 'Export of Seedorder History and Configuration failed for product:' + lsData.PRODUCT_ID+`.Reason: ${e.message}`;
                                    }
                                }
                            }
                            // If is less than 5000 records
                            else {
                                let oEntryCfg = {
                                    "Transactionid": vTransID,
                                    // "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,ACTUALDEMANDVC,PERIODID0_TSTAMP",
                                    "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,SEEDORDERDEMANDVC,PERIODID0_TSTAMP",
                                    "VersionID": "",
                                    "DoCommit": true,
                                    "ScenarioID": ""
                                }
                                oEntryCfg[lData] = oReqCfg.sales;
                                try {
                                    req.headers['Application-Interface-Key'] = vAIRKey;
                                    console.log(req.headers);
                                    await service.tx(req).post(lEntity, oEntryCfg);
                                    flag = 'X';
                                    lMessage = lMessage + ' ' + 'Export of Seedorder History and Configuration is successful for product:' + lsData.PRODUCT_ID;

                                } catch (err) {
                                    lMessage = lMessage + ' ' + 'Export of Seedorder History and Configuration failed for product:' + lsData.PRODUCT_ID+`.Reason: ${err.message}`;
                                    // lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                                }
                            }
                        }

                        /** Commented below code to enable parallel processing */
                        // if (oReqCfg.sales.length > 0) {
                        //     console.log(oReqCfg.sales.length);
                        //     // Sales History Config
                        //     let vTransID = new Date().getTime().toString();
                        //     let oEntryCfg =
                        //     {
                        //         "Transactionid": vTransID,
                        //         "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,SEEDORDERDEMANDVC,PERIODID0_TSTAMP",
                        //         "VersionID": "",
                        //         "DoCommit": true,
                        //         "ScenarioID": ""
                        //     }
                        //     oEntryCfg[lData] = oReqCfg.sales;
                        //     try {
                        //         req.headers['Application-Interface-Key'] = vAIRKey;
                        //         await service.tx(req).post(lEntity, oEntryCfg);
                        //         flag = 'X';
                        //         lMessage = lMessage + ' ' + 'Export of Seedorder History and Configuration is successful for product:' + lsData.PRODUCT_ID;

                        //     }
                        //     catch (err) {
                        //         console.log(err);
                        //         // console.log(err.message);
                        //         lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                        //     }
                        // }
                    }
                }
            } else {
                lMessage = lMessage + ' ' + 'No Seedorder for product:' + lsData.PRODUCT_ID;
                // let sLog = 'No Seedorder for product:' + lsData.PRODUCT_ID;
                // aErrorLog.push(sLog);
            }
        }
        //New
        if (aErrorLog.length == lilocProd.length) { //failed
            await GenF.jobSchMessage('', aErrorLog.toString(), req);
        } else {
            await GenF.jobSchMessage('X', lMessage, req);
        }
        //OLD 
        // if (flag === 'X') {
        //     await GenF.jobSchMessage('X', lMessage, req);
        // }
        // else {
        //     await GenF.jobSchMessage('', lMessage, req);
        // }
    });
    // Expost sales config in IBP
    this.on("exportIBPSalesTrans_Old", async (req) => {

        // Get Planning area and Prefix configurations for IBP
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
            };
        let vsales, flag = '',
            lMessage = '';
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started exporting Sales History and Configurations";
        let res = req._.req.res;
        let lilocProdReq = JSON.parse(req.data.LocProdData);
        var aErrorLog = [];
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        } else {
            lilocProd = JSON.parse(req.data.LocProdData);
        }

        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });
        const lsSales = await GenF.getParameterValue(lilocProdReq[0].LOCATION_ID, 11);
        console.log(lsSales);

        // let vToDate = new Date();

        // vToDate.setDate(vToDate.getDate() - 1);

        // vToDate = vToDate.toISOString().split('Z')[0].split('T')[0];


        const lsMaxDate = await SELECT.one.columns("MAX(WEEK_DATE) AS MAX_DATE")
            .from('V_IBP_SALESH_ACTDEMD');
        let vToDate = lsMaxDate.MAX_DATE;
        console.log(vToDate);

        let vFromDate = new Date();
        vFromDate.setDate(vFromDate.getDate() - (parseInt(lsSales) * 7));
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];
        console.log(vFromDate);

        let liDates = obibpfucntions.generateDateseries(vFromDate, vToDate);
        var sIBPOptionPercent = await GenF.getSystemConfig('IBP_OPTION_PERCENT')
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
                    WHERE LOCATION_ID = '` + lsData.LOCATION_ID + `'
                       AND PRODUCT_ID = '` + lsData.PRODUCT_ID +
                `'`);
            const liCust = await cds.run(
                `
                SELECT DISTINCT 
                        "LOCATION_ID",
                        "PRODUCT_ID",
                        "CUSTOMER_GROUP"
                        FROM V_IBP_SALESH_ACTDEMD
                        WHERE LOCATION_ID = '` + lsData.LOCATION_ID + `'
                           AND PRODUCT_ID = '` + lsData.PRODUCT_ID +
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
                    let oEntry = {
                        "Transactionid": vTransID,
                        "AggregationLevelFieldsString": "LOCID,PRDID,CUSTID,ACTUALDEMAND,PERIODID0_TSTAMP",
                        "VersionID": "",
                        "DoCommit": true,
                        "ScenarioID": ""
                    }
                    oEntry[lData] = oReq.sales
                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        console.log(req.headers);
                        await service.tx(req).post(lEntity, oEntry);
                        flag = 'S';
                    } catch (err) {
                        console.log("Unable to send Actual demand at VC");
                    }
                    // Once Sales History is successfull , send sales Config . Actual demand at VC
                    if (flag === 'S') {
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
                        console.log(flag);
                        oReqStock = await obibpfucntions.exportSalesStock(lsData, liDates);
                        oReqStockhd = await obibpfucntions.exportSalesOnHand(lsData, liDates);

                        if (sIBPOptionPercent == 'Yes') {
                            oReqCfg = await obibpfucntions.exportSalesCfg(lsData, liDates);
                            oReqStockCfg = await obibpfucntions.exportSalesCfgStock(lsData, liDates);
                            oReqStockhdCfg = await obibpfucntions.exportSalesCfgOnHand(lsData, liDates);
                        }

                        if (oReqCfg.sales.length > 0 && sIBPOptionPercent == 'Yes') {
                            console.log(oReqCfg.sales.length);
                            // Sales History Config
                            let vTransID = new Date().getTime().toString();
                            // Parallel processing logic to export huge data buckets
                            if (oReqCfg.sales.length > 5000) {
                                let iChnk, iChkCounter = 0;
                                // Initialize Parallel processing
                                let resUrlPP = "/InitiateParallelProcess?ScenarioID=''&VersionID=''&PlanningArea='" + liParaValue[0].VALUE + "'&Transactionid='" + vTransID + "'";
                                try {
                                    await service.tx(req).post(resUrlPP);
                                } catch (e) {
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
                                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
                                    let oEntryCfgPP = {
                                        "Transactionid": vTransID,
                                        "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,ACTUALDEMANDVC,PERIODID0_TSTAMP",
                                        "VersionID": "",
                                        "ScenarioID": ""
                                    }
                                    oEntryCfgPP[lData] = chunksList[iChnk];
                                    try {
                                        req.headers['Application-Interface-Key'] = vAIRKey;
                                        console.log(req.headers);
                                        await service.tx(req).post(lEntity, oEntryCfgPP);
                                        iChkCounter = iChkCounter + 1;
                                    } catch (err) {
                                        console.log(err);
                                        // iChkCounter = 0;
                                        // console.log(err.message);
                                    }
                                }
                                // If all are successfull commit the request
                                if (iChkCounter > 0) {
                                    let resUrlPPCommit = "/commit?P_TransactionID='" + vTransID + "'&$format=json";
                                    try {
                                        await service.tx(req).post(resUrlPPCommit);
                                        lMessage = lMessage + ' ' + 'Export of Sales History and Configuration is successful for product:' + lsData.PRODUCT_ID;
                                    } catch (e) {
                                        console.log(e);
                                        console.log("Error while committing the parallel processing");
                                    }
                                }
                            }
                            // If is less that 5000 records
                            else {
                                let oEntryCfg = {
                                    "Transactionid": vTransID,
                                    "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,ACTUALDEMANDVC,PERIODID0_TSTAMP",
                                    "VersionID": "",
                                    "DoCommit": true,
                                    "ScenarioID": ""
                                }
                                oEntryCfg[lData] = oReqCfg.sales;
                                try {
                                    req.headers['Application-Interface-Key'] = vAIRKey;
                                    console.log(req.headers);
                                    await service.tx(req).post(lEntity, oEntryCfg);
                                    flag = 'X';
                                    lMessage = lMessage + ' ' + 'Export of Sales History, Configuration, In-Transit and On-HandStock is successful for product:' + lsData.PRODUCT_ID;

                                } catch (err) {
                                    console.log(err);
                                    // console.log(err.message);
                                    lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                                    let sLog = 'Export of Sales History, Configuration, In-Transit and On-HandStock  failed for product:' + lsData.PRODUCT_ID;
                                    aErrorLog.push(sLog);
                                }
                            }
                        }
                        //In transit services
                        if (oReqStock.stock.length > 0) {
                            // Sales stock In-transit
                            let vTransIDTrans = new Date().getTime().toString();
                            let oEntryTrans = {
                                "Transactionid": vTransIDTrans,
                                "AggregationLevelFieldsString": "LOCID,PRDID,LOCFR,STOCKINTRANSIT,PERIODID0_TSTAMP",
                                "VersionID": "",
                                "DoCommit": true,
                                "ScenarioID": ""
                            }
                            oEntryTrans[lData] = oReqStock.stock;
                            try {
                                req.headers['Application-Interface-Key'] = vAIRKey;
                                console.log(req.headers);
                                await service.tx(req).post(lEntity, oEntryTrans);
                                flag = 'X';
                                lMessage = lMessage + ' ' + 'Export of Sales In-Transit is successful for product:' + lsData.PRODUCT_ID;

                            } catch (err) {
                                console.log(err);
                                lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                                let sLog = 'Export of Sales In-Transit failed for product:' + lsData.PRODUCT_ID;
                                aErrorLog.push(sLog);
                            }
                        }
                        //In transit service config
                        if (oReqStockCfg.stockcfg.length > 0 && sIBPOptionPercent == 'Yes') {
                            let vTransIDInTrans = new Date().getTime().toString();
                            let oEntryTransIntrans = {
                                "Transactionid": vTransIDInTrans,
                                "AggregationLevelFieldsString": "LOCID,PRDID,LOCFR,VCCHAR,VCCHARVALUE,VCCLASS,STOCKINTRANSITATVC,PERIODID0_TSTAMP",
                                "VersionID": "",
                                "DoCommit": true,
                                "ScenarioID": ""
                            }
                            oEntryTransIntrans[lData] = oReqStockCfg.stockcfg;

                            try {
                                req.headers['Application-Interface-Key'] = vAIRKey;
                                await service.tx(req).post(lEntity, oEntryTransIntrans);
                                flag = 'X';
                                lMessage = lMessage + ' ' + 'Export of Sales In-transit config is successful for product:' + lsData.PRODUCT_ID;

                            } catch (err) {
                                console.log(err);
                                lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                                let sLog = 'Export of Sales In-transit config. failed for product:' + lsData.PRODUCT_ID;
                                aErrorLog.push(sLog);
                            }
                        }
                        //on Hand 
                        if (oReqStockhd.stockhd.length > 0) {
                            // Sales On hand 
                            let vTransIDTranshand = new Date().getTime().toString();
                            let oEntryHDTranshand = {
                                "Transactionid": vTransIDTranshand,
                                "AggregationLevelFieldsString": "LOCID,PRDID,STOCKONHAND,PERIODID0_TSTAMP",
                                "VersionID": "",
                                "DoCommit": true,
                                "ScenarioID": ""
                            }
                            oEntryHDTranshand[lData] = oReqStockhd.stockhd;
                            try {
                                req.headers['Application-Interface-Key'] = vAIRKey;
                                console.log(req.headers);
                                await service.tx(req).post(lEntity, oEntryHDTranshand);
                                flag = 'X';
                                lMessage = lMessage + ' ' + 'Export of Sales on-HandStock is successful for product:' + lsData.PRODUCT_ID;

                            } catch (err) {
                                console.log(err);
                                lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                                let sLog = 'Export of Sales on-HandStock failed for product:' + lsData.PRODUCT_ID;
                                aErrorLog.push(sLog);
                            }
                        }
                        if (oReqStockhdCfg.stockhdcfg.length > 0 && sIBPOptionPercent == 'Yes') {
                            // Sales stock on-Hand
                            let vTransIDonHandcfg = new Date().getTime().toString();
                            let oEntryTransonHandcfg = {
                                "Transactionid": vTransIDonHandcfg,
                                "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,STOCKONHANDATVC,PERIODID0_TSTAMP",
                                "VersionID": "",
                                "DoCommit": true,
                                "ScenarioID": ""
                            }
                            oEntryTransonHandcfg[lData] = oReqStockhdCfg.stockhdcfg;

                            try {
                                req.headers['Application-Interface-Key'] = vAIRKey;
                                console.log(req.headers);
                                await service.tx(req).post(lEntity, oEntryTransonHandcfg);
                                flag = 'X';
                                lMessage = lMessage + ' ' + 'Export of Sales On-HandStock config is successful for product:' + lsData.PRODUCT_ID;

                            } catch (err) {
                                console.log(err);
                                lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                                let sLog = 'Export of Sales On-HandStock config failed for product:' + lsData.PRODUCT_ID;
                                aErrorLog.push(sLog);
                            }
                        }

                    }
                } else {
                    lMessage = lMessage + ' ' + 'Export of Sales History and Configuration export is unsuccessful for product: ' + lsData.PRODUCT_ID + ' becuase of insufficient data';
                    // aErrorLog.push(lMessage);
                }
            }
        }
        //New
        if (aErrorLog.length == lilocProd.length) { //failed
            await GenF.jobSchMessage('', aErrorLog.toString(), req);
        } else {
            await GenF.jobSchMessage('X', lMessage, req);
        }
        //OLD
        // if (flag === 'X') {
        //     await GenF.jobSchMessage('X', lMessage, req);
        // }
        // else {
        //     await GenF.jobSchMessage('', lMessage, req);
        // }
        // GetExportResult
    });
    // Create class in IBP
    this.on("exportIBPSalesTrans_fn", async (req) => {

        // Get Planning area and Prefix configurations for IBP
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
            };
        let vsales, flag = '',
            lMessage = '',
            lSuccess = '';
        let lsData = {};
        const lsSales = await GenF.getParameterValue(req.data.LOCATION_ID, 11);
        console.log(lsSales);
        // let vToDate = new Date();

        // vToDate.setDate(vToDate.getDate() - 1);

        // vToDate = vToDate.toISOString().split('Z')[0].split('T')[0];


        const lsMaxDate = await SELECT.one.columns("MAX(WEEK_DATE) AS MAX_DATE")
            .from('V_IBP_SALESH_ACTDEMD');
        let vToDate = lsMaxDate.MAX_DATE;
        console.log(vToDate);

        let vFromDate = new Date();
        vFromDate.setDate(vFromDate.getDate() - (parseInt(lsSales) * 7));
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];
        console.log(vFromDate);

        let liDates = obibpfucntions.generateDateseries(vFromDate, vToDate);
        let vWeekDateT = liDates[0].WEEK_DATE + "T00:00:00";
        // for (let i = 0; i < lilocProd.length; i++) {
        lsData.LOCATION_ID = req.data.LOCATION_ID;
        lsData.PRODUCT_ID = req.data.PRODUCT_ID;
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
                        WHERE LOCATION_ID = '` + lsData.LOCATION_ID + `'
                           AND PRODUCT_ID = '` + lsData.PRODUCT_ID +
            `'`);
        const liCust = await cds.run(
            `
                    SELECT DISTINCT 
                            "LOCATION_ID",
                            "PRODUCT_ID",
                            "CUSTOMER_GROUP"
                            FROM V_IBP_SALESH_ACTDEMD
                            WHERE LOCATION_ID = '` + lsData.LOCATION_ID + `'
                               AND PRODUCT_ID = '` + lsData.PRODUCT_ID +
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
                            vDemd = lisales[i].ORD_QTY.split('.');
                            vAdjqty = lisales[i].ADJ_QTY.split('.');
                            vsales = {
                                "LOCID": lisales[i].LOCATION_ID,
                                "PRDID": lisales[i].PRODUCT_ID,
                                "CUSTID": lisales[i].CUSTOMER_GROUP,
                                "ACTUALDEMAND": vDemd[0],
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
                            "ACTUALDEMAND": vDemd,
                            "SEEDORDERDEMAND": vAdjqty,
                            "PERIODID0_TSTAMP": vWeekDate[0]
                        };
                        oReq.sales.push(vsales);
                    }
                }
            }
            if (oReq.sales.length > 0) {
                let vTransID = new Date().getTime().toString();
                let oEntry = {
                    "Transactionid": vTransID,
                    "AggregationLevelFieldsString": "LOCID,PRDID,CUSTID,ACTUALDEMAND,SEEDORDERDEMAND,PERIODID0_TSTAMP",
                    "VersionID": "",
                    "DoCommit": true,
                    "ScenarioID": ""
                }
                oEntry[lData] = oReq.sales
                try {
                    await service.tx(req).post(lEntity, oEntry);
                    flag = 'S';
                } catch (err) {
                    console.log("Unable to send Actual demand at VC");
                }
                // Once Sales History is successfull , send sales Config . Actual demand at VC
                if (flag === 'S') {
                    console.log(flag);
                    oReqCfg = await obibpfucntions.exportSalesCfg(lsData, liDates);
                    oReqStock = await obibpfucntions.exportSalesStock(lsData, liDates);
                    oReqStockCfg = await obibpfucntions.exportSalesCfgStock(lsData, liDates);

                    if (oReqCfg.sales.length > 0) {
                        console.log(oReqCfg.sales.length);
                        // Sales History Config
                        let vTransID = new Date().getTime().toString();
                        let oEntryCfg = {
                            "Transactionid": vTransID,
                            "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,ACTUALDEMANDVC,SEEDORDERDEMANDVC,PERIODID0_TSTAMP",
                            "VersionID": "",
                            "DoCommit": true,
                            "ScenarioID": ""
                        }
                        oEntryCfg[lData] = oReqCfg.sales;

                        try {
                            await service.tx(req).post(lEntity, oEntryCfg);
                            flag = 'X';
                            lMessage = lMessage + ' ' + 'Export of Sales History, Configuration, In-Transit and On-HandStock is successful for product:' + lsData.PRODUCT_ID;

                        } catch (err) {
                            console.log(err);
                            // console.log(err.message);
                            lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                        }
                    }
                    if (oReqStock.stock.length > 0) {
                        // Sales stock In-transit
                        let vTransIDTrans = new Date().getTime().toString();
                        let oEntryTrans = {
                            "Transactionid": vTransIDTrans,
                            "AggregationLevelFieldsString": "LOCID,PRDID,STOCKINTRANSIT,STOCKONHAND,PERIODID0_TSTAMP",
                            "VersionID": "",
                            "DoCommit": true,
                            "ScenarioID": ""
                        }
                        oEntryTrans[lData] = oReqStock.stock;
                        try {
                            await service.tx(req).post(lEntity, oEntryTrans);
                            flag = 'X';
                            lMessage = lMessage + ' ' + 'Export of Sales In-Transit is successful for product:' + lsData.PRODUCT_ID;

                        } catch (err) {
                            console.log(err);
                            lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                        }
                    }
                    if (oReqStockCfg.stockcfg.length > 0) {
                        // Sales stock on-Hand
                        let vTransIDonHand = new Date().getTime().toString();
                        let oEntryTransonHand = {
                            "Transactionid": vTransIDonHand,
                            "AggregationLevelFieldsString": "LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,STOCKINTRANSITATVC,STOCKONHANDATVC,PERIODID0_TSTAMP",
                            "VersionID": "",
                            "DoCommit": true,
                            "ScenarioID": ""
                        }
                        oEntryTransonHand[lData] = oReqStockCfg.stockcfg;

                        try {
                            await service.tx(req).post(lEntity, oEntryTransonHand);
                            flag = 'X';
                            lMessage = lMessage + ' ' + 'Export of Sales On-HandStock is successful for product:' + lsData.PRODUCT_ID;

                        } catch (err) {
                            console.log(err);
                            lMessage = lMessage + ' ' + err.message + lsData.PRODUCT_ID;
                        }
                    }
                }
            } else {
                lMessage = 'Export of Sales History and Configuration export is unsuccessful for product: ' + lsData.PRODUCT_ID + ' becuase of insufficient data';
            }
        }
        // }
        return lMessage;
    });

     //Creation of SOP ACTUALSQTY
    this.on("exportIBPSalesTrans", async (req) => {
        let response ='';
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getParameterPrefix();
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Sales History'`);
        //    let sPlan = aMappingData[0].PLANNING_AREA
        // let lData = "Nav" + sPlan;
        // let lEntity = "/" + sPlan + "Trans";
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
            };
        let vsales, flag = '',
            lMessage = '';
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started exporting Sales History";
        let res = req._.req.res;
        let lilocProdReq = JSON.parse(req.data.LocProdData);
        //   let   lilocProdReq = [{
        //     LOCATION_ID: "1520",
        //     PRODUCT_ID: "VCP_210",
        //     VERSION: "_BASELINE",
        //     SCENARIO: "PLAN"
        // }
        // ]
        var aErrorLog = [];
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        } else {
            lilocProd = JSON.parse(req.data.LocProdData);
        }

        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });
        const lsSales = await GenF.getParameterValue(lilocProdReq[0].LOCATION_ID, 11);
        console.log(lsSales);

        const lsMaxDate = await SELECT.one.columns("MAX(WEEK_DATE) AS MAX_DATE")
            .from('V_IBP_SALESH_ACTDEMD');
        let vToDate = lsMaxDate.MAX_DATE;
        console.log(vToDate);

        let vFromDate = new Date();
        vFromDate = new Date(vFromDate.setDate(vFromDate.getDate() - (parseInt(lsSales) * 7)));
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];
        console.log(vFromDate);

        let liDates = obibpfucntions.generateDateseries(vFromDate, vToDate);
        var sIBPOptionPercent = await GenF.getSystemConfig('IBP_OPTION_PERCENT')
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
                    WHERE LOCATION_ID = '` + lsData.LOCATION_ID + `'
                       AND PRODUCT_ID = '` + lsData.PRODUCT_ID +
                `'`);
            const liCust = await cds.run(
                `
                SELECT DISTINCT 
                        "LOCATION_ID",
                        "PRODUCT_ID",
                        "CUSTOMER_GROUP"
                        FROM V_IBP_SALESH_ACTDEMD
                        WHERE LOCATION_ID = '` + lsData.LOCATION_ID + `'
                           AND PRODUCT_ID = '` + lsData.PRODUCT_ID +
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
                                vDemd = lisales[i].ORD_QTY.split('.');
                                vAdjqty = lisales[i].ADJ_QTY.split('.');
                                vsales = {
                                    "LOCATION_ID": lisales[i].LOCATION_ID,
                                    "PRODUCT_ID": lisales[i].PRODUCT_ID,
                                    "CUSTOMER_GROUP": lisales[i].CUSTOMER_GROUP,
                                    "ACTUALDEMAND": vDemd[0],
                                    "ORD_QTY": vDemd[0],
                                    "PERIODID0_TSTAMP": vWeekDate[0],
                                    "WEEK_DATE": vWeekDate[0],
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
                                "LOCATION_ID": lsData.LOCATION_ID,
                                "PRODUCT_ID": lsData.PRODUCT_ID,
                                "CUSTOMER_GROUP": liCust[iCust].CUSTOMER_GROUP,
                                "ACTUALDEMAND": vDemd,
                                "ORD_QTY": vDemd,
                                "PERIODID0_TSTAMP": vWeekDate[0],
                                "WEEK_DATE": vWeekDate[0] 
                            };
                            oReq.sales.push(vsales);
                        }
                    }
                }

                 let NKeys = ['ENTITY_KEY', 'PLANNING_AREA'];
        let distData = GenF.removeDuplicate(aTableData, NKeys);

         let aMappingData = [];      
        for (var z = 0; z < distData.length; z++) {
            
                aMappingData = aTableData.filter(e=> e.PLANNING_AREA == distData[z].PLANNING_AREA);

                   let sPlan = aMappingData[0].PLANNING_AREA
                    let lData = "Nav" + liParaValue[0].VALUE.toString();
                    let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
                console.log("sPlan", sPlan);
                console.log("lData", lData);
                console.log("lEntity", lEntity);


                let aSalesHis = await GenF.mappingData('Sales History', distData[z].PLANNING_AREA, '', oReq.sales);
                // let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Sales History'`);
        aMappingData.filter((el)=>{
            if(el.TYPE == 'C'){
                el.MAPPING_FIELD = el.BTP_FIELD
            }
            else if(el.TYPE == 'D'){
                el.BTP_FIELD = el.MAPPING_FIELD
            }
        }) 
        const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
         aSalesHis = aSalesHis.filter(record => {
             return requiredFields.every(field => record[field] != null && record[field] != "");
         });
                let Keys = Object.keys(aSalesHis[0]);
                let requestedAttributesStr = Array.from(Keys).join(',');
                let vKeysReq = Keys;
                    aSalesHis = GenF.removeDuplicate(aSalesHis, vKeysReq);
                if (aSalesHis.length > 0) {

                    let vTransID = new Date().getTime().toString();
                    if (aSalesHis.length > 5000) {
                                let iChnk, iChkCounter = 0;
                                // Initialize Parallel processing
                                let resUrlPP = "/InitiateParallelProcess?ScenarioID=''&VersionID=''&PlanningArea='" + liParaValue[0].VALUE.toString() + "'&Transactionid='" + vTransID + "'";
                                try {
                                    await service.tx(req).post(resUrlPP);
                                } catch (e) {
                                    console.log(e);
                                }
                                // Divide into multiple arrays with each array length as 5000
                                chunked = true;
                                let aData = aSalesHis;
                                chunksList = [];
                                const chunkSize = 5000;
                                for (let i = 0; i < aData.length; i += chunkSize) {
                                    const chunk = aData.slice(i, i + chunkSize)
                                    chunksList.push(chunk);
                                }
                                // Process each chunk to IBP
                                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
                                    let oEntryCfgPP = {
                                        "Transactionid": vTransID,
                                        "AggregationLevelFieldsString": requestedAttributesStr,
                                        "VersionID": "",
                                        "ScenarioID": ""
                                    }
                                    oEntryCfgPP[lData] = chunksList[iChnk];
                                    try {
                                        req.headers['Application-Interface-Key'] = vAIRKey;
                                        console.log(req.headers);
                                        await service.tx(req).post(lEntity, oEntryCfgPP);
                                        iChkCounter = iChkCounter + 1;
                                    } catch (err) {
                                        console.log(err);
                                        // iChkCounter = 0;
                                        // console.log(err.message);
                                    }
                                }
                                // If all are successfull commit the request
                                if (iChkCounter > 0) {
                                    let resUrlPPCommit = "/commit?P_TransactionID='" + vTransID + "'&$format=json";
                                    try {
                                        await service.tx(req).post(resUrlPPCommit);
                                        lMessage = lMessage + ' ' + 'Export of Sales History is successful for product: ' + lsData.PRODUCT_ID;
                                    response = response + ' ' + 'Export of Sales History is successful for product: ' + lsData.PRODUCT_ID + ", For planning area" + liParaValue[0].VALUE.toString();

                                    } catch (e) {
                                        console.log("Error while committing the parallel processing" + lilocProd.LOCATION_ID);
                                    response = response + ' ' + 'Export of Sales History is failed for product: ' + lsData.PRODUCT_ID + ", For planning area" + liParaValue[0].VALUE.toString()+`.Reason: ${e.message}`;

                                    }
                                }
                            }
                            // If is less that 5000 records
                            else {
                               let oEntry = {
                                    "Transactionid": vTransID,
                                    "AggregationLevelFieldsString": requestedAttributesStr,
                                    "VersionID": "",
                                    "DoCommit": true,
                                    "ScenarioID": ""
                                }
                                oEntry[lData] = aSalesHis;
                                try {
                                    req.headers['Application-Interface-Key'] = vAIRKey;
                                    await service.tx(req).post(lEntity, oEntry);
                                    let resUrl = "/getExportResult?P_EntityName='" + sPlan + "'&P_TransactionID='" + vTransID + "'";
                                    await service.tx(req).get(resUrl);
                                    flag = 'X';
                                    lMessage = lMessage + ' ' + 'Export of Sales History is successful for product: ' + lsData.PRODUCT_ID;
                                    response = response + ' ' + 'Export of Sales History is successful for product: ' + lsData.PRODUCT_ID + ", For planning area" + liParaValue[0].VALUE.toString();
                                } catch(e) {
                                    lMessage = lMessage + ' ' + 'Export of Sales History failed :' + lilocProd.LOCATION_ID+`.Reason: ${e.message}`;
                                    let sLog = 'Export of Sales History failed :' + lilocProd.LOCATION_ID+`.Reason: ${e.message}`;
                                    response = response + ' ' + 'Export of Sales History is failed for product: ' + lsData.PRODUCT_ID + ", For planning area" + liParaValue[0].VALUE.toString()+`.Reason: ${e.message}`;
                                    aErrorLog.push(sLog);
                                }
                            }
                    // let oEntry = {
                    //     "Transactionid": vTransID,
                    //     "AggregationLevelFieldsString": requestedAttributesStr,
                    //     "VersionID": "",
                    //     "DoCommit": true,
                    //     "ScenarioID": ""
                    // }
                    // oEntry[lData] = aSalesHis
                    // try {
                    //     req.headers['Application-Interface-Key'] = vAIRKey;
                    //     console.log(req.headers);
                    //     await service.tx(req).post(lEntity, oEntry);
                    //     flag = 'S';
                    //     lMessage = 'Export of Sales History is successful for product: ' + lsData.PRODUCT_ID;
                    // } catch (err) {
                    //     console.log("Unable to send Actual demand at VC");
                    //     console.log(err);
                    //     lMessage = lMessage  + ' ' + 'Unable to send Actual demand at VC';
                    //     aErrorLog.push(lMessage);
                    // }
                    // Once Sales History is successfull , send sales Config . Actual demand at VC

                } else {
                    lMessage = lMessage + ' ' + 'No data to export Sales History for product: ' + lsData.PRODUCT_ID + ' becuase of insufficient data';
                    response = response + ' ' + 'No data to export Sales History for product: ' + lsData.PRODUCT_ID + ' becuase of insufficient data';
                    // aErrorLog.push(lMessage);
                }
            }
        }
    }
        //New
        if (aErrorLog.length == lilocProd.length) { //failed
            await GenF.jobSchMessage('', response, req);
        } else {
            await GenF.jobSchMessage('X', response, req);
        }
    });



    // Actual Component Demand:
    this.on("exportActCompDemand", async (req) => {

        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";

        let oReq = {
            actcomp: [],
        },
            vactcomp, lMessage = '';
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started exporting Sales History and Configurations";
        let res = req._.req.res;
        var aErrorLog = [];
        let lilocProdReq = JSON.parse(req.data.LocProdData);
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
            for (let i = 0; i < lilocProd.length; i++) {
                lilocProd[i].VERSION = lilocProdReq[0].VERSION;
                lilocProd[i].SCENARIO = lilocProdReq[0].SCENARIO;
            }
        }
        // if (lilocProdReq[0].PRODUCT_ID === "ALL") {
        //     lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
        //     lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
        //     const objCatFn = new Catservicefn();
        //     const lilocProdT = await objCatFn.getAllProducts(lsData);
        //     lsData = {};
        //     const litemp = JSON.stringify(lilocProdT);
        //     lilocProd = JSON.parse(litemp);
        // }
        else {
            lilocProd = JSON.parse(req.data.LocProdData);
        }
        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });
        // Fetch History period from Configuration table
        const lsSales = await GenF.getParameterValue(lilocProd[0].LOCATION_ID, 11);
        const lsMaxDate = await SELECT.one.columns("MAX(WEEK_DATE) AS MAX_DATE")
            .from('V_IBP_SALESH_ACTDEMD');
        let vToDate = lsMaxDate.MAX_DATE;
        // let vToDate = new Date().toISOString().split('Z')[0].split('T')[0];

        let vFromDate = new Date();
        vFromDate.setDate(vFromDate.getDate() - (parseInt(lsSales) * 7));
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];

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
                    WHERE LOCATION_ID = '` + lsData.LOCATION_ID + `'
                       AND PRODUCT_ID = '` + lsData.PRODUCT_ID +
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
                } else {
                    lMainProduct = lsMainProduct.REF_PRODID;
                }

                let lsFactory = await SELECT.one
                    .from('CP_FACTORY_SALESLOC')
                    .columns('FACTORY_LOC')
                    .where(`LOCATION_ID = '${lsData.LOCATION_ID}' AND PRODUCT_ID = '${lsData.PRODUCT_ID}'`);
                if (lsFactory === null) {
                    lMessage = lMessage + ' ' + 'Please maintain Planning network maintenance for Location :' + lsData.LOCATION_ID + 'and Product: ' + lsData.PRODUCT_ID;
                } else {
                    let aData = {};
                    aData.LOCATION_ID = lsFactory.FACTORY_LOC; //lsData.LOCATION_ID;
                    aData.PRODUCT_ID = lMainProduct;
                    // Getting only critical assemblys
                    const objCatFn = new Catservicefn();
                    const licriticalcomp = await objCatFn.getCriticalAsmbs(aData);
                    for (i = 0; i < liactcomp.length; i++) {
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
                for (i = 0; i < liactcomp.length; i++) {
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
                let oEntry = {
                    "Transactionid": vTransID,
                    "AggregationLevelFieldsString": "LOCID,PRDID,ACTUALCOMPONENTDEMAND,PERIODID0_TSTAMP,PRDFR",
                    "VersionID": "",
                    "DoCommit": true,
                    "ScenarioID": ""
                }
                oEntry[lData] = oReq.actcomp;
                try {
                    req.headers['Application-Interface-Key'] = vAIRKey;
                    await service.tx(req).post(lEntity, oEntry);
                    let resUrl = "/getExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                    await service.tx(req).get(resUrl);
                    flag = 'X';
                    lMessage = lMessage + ' ' + 'Export of Actual Component Demand is successfull for product:' + lsData.PRODUCT_ID;
                } catch(e) {
                    lMessage = lMessage + ' ' + 'Export of Actual Component Demand failed for product:' + lsData.PRODUCT_ID+`. Reason: ${e.message}`;
                    let sLog = 'Export of Actual Component Demand failed for product:' + lsData.PRODUCT_ID+`. Reason: ${e.message}`;
                    aErrorLog.push(sLog);
                }
            } else {
                lMessage = lMessage + ' ' + 'No Actual Component Demand exists on Crtical components for product:' + lsData.PRODUCT_ID;
                // let sLog = 'No Actual Component Demand exists on Crtical components for product:' + lsData.PRODUCT_ID;
                // aErrorLog.push(sLog);
            }
        }
        if (aErrorLog.length == lilocProd.length) { //Success
            await GenF.jobSchMessage('', aErrorLog.toString(), req);
        } else {
            await GenF.jobSchMessage('X', lMessage, req);
        }
        //OLD
        // await GenF.jobSchMessage('X', lMessage, req);

        // return "S";
    });

    this.on("exportComponentReq", async (req) => {
        // Send Response to Scheduler
        // req.data = {
        //             "LOCATION_ID" : "PLAM",
        //             "PRODUCT_ID" : "435A00",
        //             "VERSION" : "__BASELINE",
        //             "SCENARIO" : "_PLAN",
        //             "FROMDATE" : '2026-01-19',
        //             "TODATE" : '2026-01-19',
        //             "CRITICALKEY" : ""
        //             }
        let liJobData = [];
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started export of Component req.";
        let res = req._.req.res,
            flag = '';
        const litemp = JSON.stringify(req.data);
        liJobData = JSON.parse(litemp);
        values.push({
            id,
            createtAt,
            message,
            liJobData
        });
        res.statusCode = 202;
        res.send({
            values
        });
        var bError = false;
        var sError ='';
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
        let vIndex = 0,
            vMaxValue, vIndexDate;
        let oReq = {
            actcompreq: [],
        },
            vactcompreq, lMessage = '';
        // let vFromDate = '2022-12-01';
        // let vToDate = '2023-12-20';
        let liactcompreq, licriticalcomp, lSuccess = '',
            vExitFlag = 0;
        // CHnage on 19-Mar-23
        // to get assembly req as 0 for not demand
        const liProdAsmb = await cds.run(
            `
            SELECT DISTINCT
                    A."LOCATION_ID",
                    B."PRODUCT_ID",
                    B."REF_PRODID",
                    A."COMPONENT",
                    A."COMP_QTY"
              FROM "V_BOMOD_DEMDFACLOC" AS A
        INNER JOIN CP_PARTIALPROD_INTRO AS B
                ON  A.LOCATION_ID = B.LOCATION_ID
                AND A.PRODUCT_ID = B.REF_PRODID
              WHERE A.LOCATION_ID = '` + req.data.LOCATION_ID + `'
                AND B.REF_PRODID = '` + req.data.PRODUCT_ID + `'
                AND (A.OBJ_DEP <> '' OR A.OBJ_DEP IS NOT NULL)`);

        // Build Date ranges
        let liDates = obibpfucntions.generateDateseries(req.data.FROMDATE, req.data.TODATE);
        let lMethod = await GenF.getParameterValue(req.data.LOCATION_ID, 5);
        let sType = 'PI';
        if (lMethod === 'M1') {
            sType = 'OD';
        }

        let vMBOMConfig = await GenF.getSystemConfig('MULTILEVEL_CONFIGPRODUCT');
        if (vMBOMConfig === 'No') {
            liactcompreq = await cds.run(
                `
                            SELECT DISTINCT "CP_ASSEMBLY_REQ"."WEEK_DATE",
                            "CP_ASSEMBLY_REQ"."LOCATION_ID",
                            "CP_ASSEMBLY_REQ"."PRODUCT_ID",
                            "CP_FACTORY_SALESLOC"."FACTORY_LOC",
                            "CP_ASSEMBLY_REQ"."COMPONENT",
                            "CP_ASSEMBLY_REQ"."REF_PRODID",
                            SUM("CP_ASSEMBLY_REQ"."COMPCIR_QTY") AS "COMP_QTY"
                    FROM CP_ASSEMBLY_REQ
                INNER JOIN CP_FACTORY_SALESLOC
                    ON CP_ASSEMBLY_REQ.LOCATION_ID = CP_FACTORY_SALESLOC.LOCATION_ID
                    AND CP_ASSEMBLY_REQ.PRODUCT_ID = CP_FACTORY_SALESLOC.PRODUCT_ID
                WHERE CP_ASSEMBLY_REQ.LOCATION_ID = '` + req.data.LOCATION_ID + `'
                    AND CP_ASSEMBLY_REQ.REF_PRODID = '` + req.data.PRODUCT_ID + `'
                    AND CP_ASSEMBLY_REQ.MODEL_VERSION = 'Active'
                    AND CP_ASSEMBLY_REQ.VERSION = '` + req.data.VERSION + `'
                    AND CP_ASSEMBLY_REQ.SCENARIO = '` + req.data.SCENARIO + `'
                    AND CP_ASSEMBLY_REQ.WEEK_DATE >= '` + req.data.FROMDATE + `'
                    AND CP_ASSEMBLY_REQ.WEEK_DATE <= '` + req.data.TODATE + `'
                    AND CP_ASSEMBLY_REQ.COMPCIR_QTY >= 0
                GROUP BY "CP_ASSEMBLY_REQ"."WEEK_DATE",
                        "CP_ASSEMBLY_REQ"."LOCATION_ID",
                        "CP_ASSEMBLY_REQ"."PRODUCT_ID",
                        "CP_FACTORY_SALESLOC"."FACTORY_LOC",
                        "CP_ASSEMBLY_REQ"."COMPONENT",
                        "CP_ASSEMBLY_REQ"."REF_PRODID" `);
        } else {
            liactcompreq = await cds.run(
                `
                            SELECT DISTINCT
                            "CP_ASSEMBLY_REQ"."WEEK_DATE",                          
                            CASE
                                WHEN "CP_ASSEMBLY_REQ"."LOCATION_ID" <> "CP_ASSEMBLY_REQ"."FACTORY_LOC" THEN "CP_ASSEMBLY_REQ"."FACTORY_LOC"
                                ELSE "CP_ASSEMBLY_REQ"."LOCATION_ID"
                            END AS LOCATION_ID,
                            "CP_ASSEMBLY_REQ"."PRODUCT_ID",
                            "CP_ASSEMBLY_REQ"."FACTORY_LOC",
                            "CP_ASSEMBLY_REQ"."COMPONENT",
                            "CP_ASSEMBLY_REQ"."REF_PRODID",
                            SUM("CP_ASSEMBLY_REQ"."COMPCIR_QTY") AS "COMP_QTY"
                        FROM CP_ASSEMBLY_REQ
                     WHERE "CP_ASSEMBLY_REQ".LOCATION_ID = "CP_ASSEMBLY_REQ".FACTORY_LOC
                     AND CP_ASSEMBLY_REQ.LOCATION_ID = '` + req.data.LOCATION_ID + `'
                        AND CP_ASSEMBLY_REQ.REF_PRODID = '` + req.data.PRODUCT_ID + `'
                        AND CP_ASSEMBLY_REQ.MODEL_VERSION = 'Active'
                        AND CP_ASSEMBLY_REQ.VERSION = '` + req.data.VERSION + `'
                        AND CP_ASSEMBLY_REQ.SCENARIO = '` + req.data.SCENARIO + `'
                        AND CP_ASSEMBLY_REQ.WEEK_DATE >= '` + req.data.FROMDATE + `'
                        AND CP_ASSEMBLY_REQ.WEEK_DATE <= '` + req.data.TODATE + `'
                        AND CP_ASSEMBLY_REQ.COMPCIR_QTY >= 0
                        AND CP_ASSEMBLY_REQ.TYPE = '${sType}'
                    GROUP BY "CP_ASSEMBLY_REQ"."WEEK_DATE",
                            "CP_ASSEMBLY_REQ"."LOCATION_ID",
                            "CP_ASSEMBLY_REQ"."PRODUCT_ID",
                            "CP_ASSEMBLY_REQ"."FACTORY_LOC",
                            "CP_ASSEMBLY_REQ"."COMPONENT",
                            "CP_ASSEMBLY_REQ"."REF_PRODID" `);

            // Fetch Dummy Product Component Req
            let aDummyProdReq = await cds.run(`
                                                SELECT DISTINCT
                                                        "CP_ASSEMBLY_REQ"."WEEK_DATE",
                                                        "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID",
                                                        CASE
                                                         WHEN "CP_ASSEMBLY_REQ"."LOCATION_ID" <> "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID"
                                                         THEN CONCAT("CP_ASSEMBLY_REQ"."PRODUCT_ID", CONCAT( '_', "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID" )
                                                            )
                                                        ELSE "CP_ASSEMBLY_REQ"."PRODUCT_ID"
                                                        END AS PRODUCT_ID,
                                                        "CP_DUMMY_PRODUCT_LOC"."DUMMY_PRODUCTID" AS "COMPONENT",
                                                        "CP_ASSEMBLY_REQ"."FACTORY_LOC",
                                                        "CP_ASSEMBLY_REQ"."REF_PRODID",
                                                        "CP_IBP_FUTUREDEMAND"."QUANTITY" AS "COMP_QTY"
                                                        FROM CP_ASSEMBLY_REQ
                                                        INNER JOIN CP_IBP_FUTUREDEMAND
                                                        ON CP_ASSEMBLY_REQ.WEEK_DATE = CP_IBP_FUTUREDEMAND.WEEK_DATE
                                                        AND CP_ASSEMBLY_REQ.LOCATION_ID = CP_IBP_FUTUREDEMAND.LOCATION_ID
                                                        AND CP_ASSEMBLY_REQ.PRODUCT_ID = CP_IBP_FUTUREDEMAND.PRODUCT_ID
                                                        AND CP_ASSEMBLY_REQ.VERSION = CP_IBP_FUTUREDEMAND.VERSION
                                                        AND CP_ASSEMBLY_REQ.SCENARIO = CP_IBP_FUTUREDEMAND.SCENARIO
                                                        INNER JOIN CP_DUMMY_PRODUCT_LOC
                                                        ON CP_ASSEMBLY_REQ.FACTORY_LOC = CP_DUMMY_PRODUCT_LOC.FACTORY_LOC
                                                        AND CP_DUMMY_PRODUCT_LOC.DUMMY_PRODUCTID = CONCAT(CP_ASSEMBLY_REQ.REF_PRODID,CONCAT('_', CP_DUMMY_PRODUCT_LOC.FACTORY_LOC))
                                                        WHERE "CP_DUMMY_PRODUCT_LOC".LOCATION_ID <> "CP_DUMMY_PRODUCT_LOC".FACTORY_LOC
                                                        AND CP_ASSEMBLY_REQ.LOCATION_ID = '${req.data.LOCATION_ID}'
                                                        AND CP_ASSEMBLY_REQ.REF_PRODID = '${req.data.PRODUCT_ID}'
                                                        AND CP_ASSEMBLY_REQ.MODEL_VERSION = 'Active'
                                                        AND CP_ASSEMBLY_REQ.VERSION = '${req.data.VERSION}'
                                                        AND CP_ASSEMBLY_REQ.SCENARIO = '${req.data.SCENARIO}'
                                                        AND CP_ASSEMBLY_REQ.WEEK_DATE >= '${req.data.FROMDATE}'
                                                        AND CP_ASSEMBLY_REQ.WEEK_DATE <= '${req.data.TODATE}'
                                                        AND CP_ASSEMBLY_REQ.COMPCIR_QTY >= 0
                                                        AND CP_ASSEMBLY_REQ.TYPE = '${sType}'
                                                        ORDER BY
                                                        "CP_ASSEMBLY_REQ"."WEEK_DATE" ASC,
                                                        "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID" ASC,
                                                        "CP_ASSEMBLY_REQ"."PRODUCT_ID" ASC,
                                                        "CP_DUMMY_PRODUCT_LOC"."DUMMY_PRODUCTID" ASC,
                                                        "CP_ASSEMBLY_REQ"."FACTORY_LOC" ASC,
                                                        "CP_ASSEMBLY_REQ"."REF_PRODID" ASC`);
             let aDummyProdReqnew = await cds.run(`
                                                SELECT DISTINCT
                                                        "CP_ASSEMBLY_REQ"."WEEK_DATE",
                                                        "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID",
                                                        CASE
                                                         WHEN "CP_ASSEMBLY_REQ"."LOCATION_ID" <> "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID"
                                                         THEN CONCAT("CP_ASSEMBLY_REQ"."PRODUCT_ID", CONCAT( '_', "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID" )
                                                            )
                                                        ELSE "CP_ASSEMBLY_REQ"."PRODUCT_ID"
                                                        END AS PRODUCT_ID,
                                                        "CP_ASSEMBLY_REQ"."FACTORY_LOC",
                                                        "CP_ASSEMBLY_REQ"."COMPONENT",
                                                        "CP_ASSEMBLY_REQ"."REF_PRODID",
                                                        "CP_IBP_FUTUREDEMAND"."QUANTITY" AS "COMP_QTY"
                                                        FROM CP_ASSEMBLY_REQ
                                                        INNER JOIN CP_IBP_FUTUREDEMAND
                                                        ON CP_ASSEMBLY_REQ.WEEK_DATE = CP_IBP_FUTUREDEMAND.WEEK_DATE
                                                        AND CP_ASSEMBLY_REQ.LOCATION_ID = CP_IBP_FUTUREDEMAND.LOCATION_ID
                                                        AND CP_ASSEMBLY_REQ.PRODUCT_ID = CP_IBP_FUTUREDEMAND.PRODUCT_ID
                                                        AND CP_ASSEMBLY_REQ.VERSION = CP_IBP_FUTUREDEMAND.VERSION
                                                        AND CP_ASSEMBLY_REQ.SCENARIO = CP_IBP_FUTUREDEMAND.SCENARIO
                                                        INNER JOIN CP_DUMMY_PRODUCT_LOC
                                                        ON CP_ASSEMBLY_REQ.FACTORY_LOC = CP_DUMMY_PRODUCT_LOC.FACTORY_LOC
                                                        AND CP_DUMMY_PRODUCT_LOC.DUMMY_PRODUCTID = CONCAT(CP_ASSEMBLY_REQ.REF_PRODID,CONCAT('_', CP_DUMMY_PRODUCT_LOC.FACTORY_LOC))
                                                         WHERE "CP_DUMMY_PRODUCT_LOC".LOCATION_ID = "CP_DUMMY_PRODUCT_LOC".FACTORY_LOC
                                                        AND CP_ASSEMBLY_REQ.LOCATION_ID = '${req.data.LOCATION_ID}'
                                                        AND CP_ASSEMBLY_REQ.REF_PRODID = '${req.data.PRODUCT_ID}'
                                                        AND CP_ASSEMBLY_REQ.MODEL_VERSION = 'Active'
                                                        AND CP_ASSEMBLY_REQ.VERSION = '${req.data.VERSION}'
                                                        AND CP_ASSEMBLY_REQ.SCENARIO = '${req.data.SCENARIO}'
                                                        AND CP_ASSEMBLY_REQ.WEEK_DATE >= '${req.data.FROMDATE}'
                                                        AND CP_ASSEMBLY_REQ.WEEK_DATE <= '${req.data.TODATE}'
                                                        AND CP_ASSEMBLY_REQ.COMPCIR_QTY >= 0
                                                        AND CP_ASSEMBLY_REQ.TYPE = '${sType}'
                                                        ORDER BY
                                                        "CP_ASSEMBLY_REQ"."WEEK_DATE" ASC,
                                                        "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID" ASC,
                                                        "CP_ASSEMBLY_REQ"."PRODUCT_ID" ASC,
                                                        "CP_ASSEMBLY_REQ"."COMPONENT" ASC,
                        
                                                        "CP_ASSEMBLY_REQ"."FACTORY_LOC" ASC,
                                                        "CP_ASSEMBLY_REQ"."REF_PRODID" ASC`);
            if (aDummyProdReq.length > 0 || aDummyProdReqnew.length > 0) {
                liactcompreq = [...liactcompreq, ...aDummyProdReq, ...aDummyProdReqnew];
            }
        }
        console.log(liactcompreq.length);


        // if (req.data.CRITICALKEY === "X") { // && lMethod === 'M2') {
        //if (vMBOMConfig === 'Yes') {
            // getting config product for partial

            let lMainProduct = '';
            // Get Configurable product
            let lsMainProduct = await SELECT.one
                .from('CP_PARTIALPROD_INTRO')
                .columns('REF_PRODID')
                .where(`LOCATION_ID = '${req.data.LOCATION_ID}' AND PRODUCT_ID = '${req.data.PRODUCT_ID}'`);
            // let vCriticalConfig = await GenF.getSystemConfig('CRITICAL_ASSEMBLY'); //('MULTIBOM');
            if (lsMainProduct === null || lsMainProduct == undefined) {
                lMainProduct = GenF.parse(req.data.PRODUCT_ID);
            } else {
                lMainProduct = lsMainProduct.REF_PRODID;
            }
            // Get factory location
            let lsFactory = await SELECT.one
                .from('CP_FACTORY_SALESLOC')
                .columns('FACTORY_LOC')
                .where(`LOCATION_ID = '${req.data.LOCATION_ID}' AND PRODUCT_ID = '${req.data.PRODUCT_ID}'`);
            if (lsFactory === null) {
                lMessage = lMessage + ' ' + 'Please maintain Planning network maintenance for Location :' + req.data.LOCATION_ID + 'and Product: ' + req.data.PRODUCT_ID;
            }
            else {
                lSuccess = '';
                let vDemd = '',
                    vWeekDate;


                for (let j = 0; j < liactcompreq.length; j++) {
                    vWeekDate = new Date(liactcompreq[j].WEEK_DATE).toISOString().split('Z');
                    vDemd = parseFloat(liactcompreq[j].COMP_QTY).toFixed(2);

                    vactcompreq = {
                        "LOCID": liactcompreq[j].LOCATION_ID,
                        "PRDID": liactcompreq[j].PRODUCT_ID,
                        "PRDFR": liactcompreq[j].COMPONENT,
                        "COMPONENTREQUIREMENTQTY": vDemd.toString(),
                        "PERIODID0_TSTAMP": vWeekDate[0]
                    };
                    oReq.actcompreq.push(GenF.parse(vactcompreq));
                    lSuccess = 'X';
                }
            } 
            // else {
            //     let aData = {};
            //     let laCriticalAsmb = [];
            //     aData.LOCATION_ID = lsFactory.FACTORY_LOC;
            //     aData.PRODUCT_ID = lMainProduct;
            //     // Getting only critical assemblys
            //     const objCatFn = new Catservicefn();
            //     let licriticalcomp_temp = await objCatFn.getCriticalAsmbs(aData);
            //     //Remove duplicates
            //     let Keys = ['LOCATION_ID', 'PRODUCT_ID', 'ASSEMBLY'];
            //     licriticalcomp_temp = GenF.removeDuplicate(licriticalcomp_temp, Keys);
            //     // Check if parameter values are already maintained for location
            //     licriticalcomp = licriticalcomp_temp.filter(function (aCriticalProd) {
            //         return aCriticalProd.PRODUCT_ID === lMainProduct;
            //     });
            //     for (let iD = 0; iD < liDates.length; iD++) {
            //         lSuccess = '';
            //         vIndex = vIndex + 1;
            //         // Check for only critical assembly
            //         for (let j = 0; j < licriticalcomp.length; j++) {
            //             laCriticalAsmb = [];
            //             vactcompreq = {};
            //             // Check if parameter values are already maintained for location
            //             laCriticalAsmb = liactcompreq.filter(function (aCritical) {
            //                 return aCritical.COMPONENT === licriticalcomp[j].ASSEMBLY &&
            //                     aCritical.WEEK_DATE === liDates[iD].WEEK_DATE &&
            //                     aCritical.FACTORY_LOC === licriticalcomp[j].LOCATION_ID &&
            //                     aCritical.REF_PRODID === licriticalcomp[j].PRODUCT_ID;
            //             });
            //             if (laCriticalAsmb.length > 0) {
            //                 for (let i = 0; i < laCriticalAsmb.length; i++) {
            //                     let vWeekDate = new Date(laCriticalAsmb[i].WEEK_DATE).toISOString().split('Z');
            //                     let vDemd = parseFloat(laCriticalAsmb[i].COMP_QTY).toFixed(2);

            //                     vactcompreq = {
            //                         "LOCID": laCriticalAsmb[i].LOCATION_ID,
            //                         "PRDID": laCriticalAsmb[i].PRODUCT_ID,
            //                         "PRDFR": laCriticalAsmb[i].COMPONENT,
            //                         "COMPONENTREQUIREMENTQTY": vDemd.toString(),
            //                         "PERIODID0_TSTAMP": vWeekDate[0]
            //                     };
            //                     oReq.actcompreq.push(GenF.parse(vactcompreq));
            //                     lSuccess = 'X';
            //                 }
            //             } else {
            //                 // if (lSuccess === '') {
            //                 let vWeekDate = new Date(liDates[iD].WEEK_DATE).toISOString().split('Z');
            //                 let vDemd = "0";
            //                 vactcompreq = {
            //                     "LOCID": licriticalcomp[j].LOCATION_ID,
            //                     "PRDID": licriticalcomp[j].PRODUCT_ID,
            //                     "PRDFR": licriticalcomp[j].ASSEMBLY,
            //                     "COMPONENTREQUIREMENTQTY": vDemd,
            //                     "PERIODID0_TSTAMP": vWeekDate[0]
            //                 };
            //                 oReq.actcompreq.push(GenF.parse(vactcompreq));
            //                 // break;
            //             }

            //         }
            //     }
            // }
            console.log(oReq.actcompreq.length);
            // console.log(oReq.actcompreq);

        //} 
        
        // else {
        //     for (let iD = 0; iD < liDates.length; iD++) {
        //         for (let k = 0; k < liProdAsmb.length; k++) {
        //             lSuccess = '';
        //             for (let i = 0; i < liactcompreq.length; i++) {
        //                 if (liactcompreq[i].LOCATION_ID === liProdAsmb[k].LOCATION_ID &&
        //                     liactcompreq[i].PRODUCT_ID === liProdAsmb[k].PRODUCT_ID &&
        //                     liactcompreq[i].COMPONENT === liProdAsmb[k].COMPONENT &&
        //                     liactcompreq[i].WEEK_DATE === liDates[iD].WEEK_DATE) {
        //                     let vWeekDate = new Date(liactcompreq[i].WEEK_DATE).toISOString().split('Z');
        //                     let vDemd = parseFloat(liactcompreq[i].COMP_QTY).toFixed(2);
        //                     vactcompreq = {
        //                         "LOCID": liactcompreq[i].LOCATION_ID,
        //                         "PRDID": liactcompreq[i].PRODUCT_ID,
        //                         "PRDFR": liactcompreq[i].COMPONENT,
        //                         "COMPONENTREQUIREMENTQTY": vDemd.toString(),
        //                         "PERIODID0_TSTAMP": vWeekDate[0]
        //                     };
        //                     oReq.actcompreq.push(GenF.parse(vactcompreq));
        //                     lSuccess = 'X';
        //                     break;
        //                 }
        //             }
        //             if (lSuccess === '') {
        //                 let vWeekDate = new Date(liDates[iD].WEEK_DATE).toISOString().split('Z');
        //                 let vDemd = "0";
        //                 vactcompreq = {
        //                     "LOCID": liProdAsmb[k].LOCATION_ID,
        //                     "PRDID": liProdAsmb[k].PRODUCT_ID,
        //                     "PRDFR": liProdAsmb[k].COMPONENT,
        //                     "COMPONENTREQUIREMENTQTY": vDemd,
        //                     "PERIODID0_TSTAMP": vWeekDate[0]
        //                 };
        //                 oReq.actcompreq.push(GenF.parse(vactcompreq));
        //                 // break;
        //             }
        //         }
        //     }
        //     console.log(oReq.actcompreq.length);
        // }

        let vTransID = new Date().getTime().toString();
        var sScenario = req.data.SCENARIO;
        if (req.data.SCENARIO == '_PLAN') {
            sScenario = ""
        }
        if (oReq.actcompreq.length > 0) {
            // Initialize Paralle processing
            if (oReq.actcompreq.length > 5000) {
                let iChnk, iChkCounter = 0;
                // Initialize Parallel processing
                let resUrlPP = `/InitiateParallelProcess?ScenarioID='${sScenario}'&VersionID='${req.data.VERSION}'&PlanningArea='` + liParaValue[0].VALUE + "'&Transactionid='" + vTransID + "'";
                try {
                    await service.tx(req).post(resUrlPP);
                } catch (e) {
                    console.log(e);
                }
                // Divide into multiple arrays with each array length as 5000
                chunked = true;
                let aData = oReq.actcompreq;
                chunksList = [];
                const chunkSize = 5000;
                for (let i = 0; i < aData.length; i += chunkSize) {
                    const chunk = aData.slice(i, i + chunkSize)
                    chunksList.push(chunk);
                }
                //Process each chuck
                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
                    let oEntry = {
                        "Transactionid": vTransID,
                        "AggregationLevelFieldsString": "LOCID,PRDID,PRDFR,COMPONENTREQUIREMENTQTY,PERIODID0_TSTAMP",
                        "VersionID": req.data.VERSION,
                        "ScenarioID": sScenario
                    }
                    oEntry[lData] = chunksList[iChnk];
                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        await service.tx(req).post(lEntity, oEntry);
                        iChkCounter = iChkCounter + 1;
                    } catch (err) {
                        console.log(err);
                        // iChkCounter = 0;
                        // console.log(err.message);
                    }
                }
                // If all are successfull commit the request
                if (iChkCounter > 0) {
                    console.log("Chunks count:" + iChkCounter);
                    let resUrlPPCommit = "/commit?P_TransactionID='" + vTransID + "'&$format=json";
                    try {
                        await service.tx(req).post(resUrlPPCommit);
                        lMessage + ' ' + 'Export of Assembly requirement Quantity is successful for product:' + req.data.PRODUCT_ID;
                    } catch (e) {
                         sError='Reason: '+e.message;
                        console.log("Error while committing the parallel processing");
                    }
                }
            } else {
                let oEntry = {
                    "Transactionid": vTransID,
                    "AggregationLevelFieldsString": "LOCID,PRDID,PRDFR,COMPONENTREQUIREMENTQTY,PERIODID0_TSTAMP",
                    "VersionID": req.data.VERSION,
                    "DoCommit": true,
                    "ScenarioID": sScenario
                }
                oEntry[lData] = oReq.actcompreq;
                try {
                    req.headers['Application-Interface-Key'] = vAIRKey;
                    console.log(req.headers);
                    await service.tx(req).post(lEntity, oEntry);
                    //let resUrl = "/getExportResult?P_TransactionID='" + vTransID + "'";
                    let resUrl = "/getExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                    await service.tx(req).get(resUrl);
                    flag = 'X';
                } catch (e) {
                    sError='Reason: '+e.message;
                }
                if (flag === 'X') {
                    lMessage = lMessage + ' ' + 'Export of Assembly requirement Quantity is successful for product:' + req.data.PRODUCT_ID;
                } else {
                    lMessage = lMessage + ' ' + 'Export of Assembly requirement Quantity failed for product:' + req.data.PRODUCT_ID+sError;
                }
            }
        } else {
            lMessage = lMessage + ' ' + 'Export of Assembly requirement Quantity failed as no critical Assemblies exists for product:' + req.data.PRODUCT_ID;
            // bError = true;
        }
        if (bError == true) { //Error
            await GenF.jobSchMessage('', lMessage, req);
        } else {
            await GenF.jobSchMessage('X', lMessage, req);
        }

        // return lMessage;

    });
   
    
     // Future Demand Qty
    this.on("generateFDemandQty_VCPIBP", async (request) => {
        // Get IBP planning area
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let flag, lMessage = "",
            vScenario = "";
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let aErrorLog = [];
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing IBP Future Demand and Characteristic Plan";
        let res = request._.req.res;
        let lilocProdReq = JSON.parse(request.data.LocProdData);
        let req = [];
        let aDates = [], oDates = {};
        console.log('Step1 Started importing IBP Future Demand and Characteristic Plan');
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
            for (let i = 0; i < lilocProd.length; i++) {
                lilocProd[i].VERSION = lilocProdReq[0].VERSION;
                lilocProd[i].SCENARIO = lilocProdReq[0].SCENARIO;
            }
        } else {
            lilocProd = JSON.parse(request.data.LocProdData);
        }

        // let tempData = lilocProd[0].PRODUCT_ID;
        // lilocProd = [];
        
        // for(let i=0; i<tempData.length; i++){
        //     let obj = {
        //         LOCATION_ID: lilocProdReq[0].LOCATION_ID,
        //         PRODUCT_ID : tempData[i],
        //         VERSION: lilocProdReq[0].VERSION,
        //         SCENARIO: lilocProdReq[0].SCENARIO,
        //         }
        //     lilocProd.push(obj);  
        //     obj = {};
        // }

        console.log('Step 2 Location Data:' + lilocProd);

        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });
        let oResponse = await obibpfucntions.importVerScen(request);
        if (oResponse.flag === "S") {
            console.log("Successfully imported version scenario from IBP");
        } else {
            console.log("Failed to import version scenario from IBP");
        }
        flag = "";
        lMessage = "";
        // Fetch 2 years Char plan
        let vFromDateT = new Date();
        vFromDateT.setDate(vFromDateT.getDate());
        vFromDateT = vFromDateT.toISOString().split('T')[0];
        let telescoppicDate = await cds.run(`SELECT * from CP_IBPCALENDER_WEEK 
                                                    where WEEK_STARTDATE <= '${vFromDateT}' 
                                                    and WEEK_ENDDATE >= '${vFromDateT}'
                                                    and LEVEL = 'W'`);
                vFromDateT = telescoppicDate.length > 0 ? telescoppicDate[0].WEEK_STARTDATE : vFromDateT;
                // let temp = new Date(vFromDateT)
                // temp = new Date(temp.setDate(temp.getDate() - 7));
                // temp = temp.toISOString();
                // console.log("last week calendar date - ", temp);

        let vFromDate = vFromDateT + "T00:00:00";
        console.log(vFromDate);

        let vDate = new Date();
        var vYear = vDate.getFullYear();
        var vMonth = vDate.getMonth();
        var vDay = vDate.getDate();
        // Forecast Order Horizon
        let lWeeks = await GenF.getParameterValue(lilocProdReq[0].LOCATION_ID, 2);

        var vToDateT = new Date(vYear, vMonth, (vDay + parseInt(7 * lWeeks)));
        vToDateT = vToDateT.toISOString().split('T')[0];
        let vToDate = vToDateT + "T00:00:00";
        console.log(vToDate);

        // Insert Dates
        let iWeeks = 10;
        let vDateFrom = vFromDate;
        if (lWeeks < 10) {
            oDates.vFromDate = vFromDate;
            oDates.vToDate = vToDate;
            aDates.push(GenF.parse(oDates));
        }
        // while (lWeeks > 10 && iWeeks < parseInt(lWeeks)) {
        //     oDates.vFromDate = vDateFrom;
        //     let vDateTo = new Date(vYear, vMonth, (vDay + parseInt(7 * iWeeks)));
        //     vDateTo = vDateTo.toISOString().split('T')[0];
        //     oDates.vToDate = vDateTo + "T00:00:00";

        //     aDates.push(GenF.parse(oDates));
        //     vDateFrom = oDates.vToDate;
        //     let iremWks = parseInt(lWeeks) - iWeeks;
        //     if (iremWks < 4) {
        //         iWeeks = iWeeks + iremWks;
        //     } else {
        //         iWeeks = iWeeks + 4;
        //     }

        // }
        let weeks = 4;
                while (lWeeks > 10 && iWeeks < parseInt(lWeeks)) {
                    oDates.vFromDate = vDateFrom;
                    let vDateTo = new Date(vYear, vMonth, (vDay + parseInt(7 * weeks)));
                    vDateTo = vDateTo.toISOString().split('T')[0];
                    oDates.vToDate = vDateTo + "T00:00:00";
        
                    aDates.push(GenF.parse(oDates));
                    vDateFrom = oDates.vToDate;
                    let remWks = parseInt(lWeeks) - weeks;
                    let iremWks = parseInt(lWeeks) - iWeeks;
                    if (iremWks < 4) {
                        weeks = weeks + remWks;
                        iWeeks = iWeeks + iremWks;
                    } else {
                        weeks = weeks + 4;
                        iWeeks = iWeeks + 4;
                    }
        
                }

        let sUOM = 'EA';                 // Unit Of Measure
        var sIBPOptionPercent = await GenF.getSystemConfig('IBP_OPTION_PERCENT')
        // var demandField = sIBPOptionPercent === "No" ? "STATISTICALFCSTQTY" : "TOTALDEMANDOUTPUT";
        // Fetch IBP demand
        for (let iloc = 0; iloc < lilocProd.length; iloc++) {
            const { LOCATION_ID, PRODUCT_ID, VERSION, SCENARIO } = lilocProd[iloc];
            let existingData = await cds.run(`
                SELECT *
                FROM "CP_IBP_FUTUREDEMAND"
                WHERE LOCATION_ID = '${LOCATION_ID}'
                AND VERSION = '${VERSION}'
                AND SCENARIO = '${SCENARIO}'
                AND PRODUCT_ID = ('${PRODUCT_ID}')
              `);
              
            sUOM = 'EA';
            //     let lsCustomer = await SELECT.one
            //         .from('V_SALES_H')
            //         .columns('CUSTOMER_GROUP')
            //         .where(`PRODUCT_ID = '${lilocProd[iloc].PRODUCT_ID}' AND LOCATION_ID = '${lilocProd[iloc].LOCATION_ID}'`);

            //     // If the sales history does not exists for location-product , continue with the next iteration

            //     if (lsCustomer === null) {
            //         continue;
            //     }

            lsData.LOCATION_ID = lilocProd[iloc].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[iloc].PRODUCT_ID;
            ///
            lsData.VERSION = lilocProd[iloc].VERSION;
            if (lilocProd[iloc].SCENARIO === "_PLAN") {
                lsData.SCENARIO = "";
            } else {
                lsData.SCENARIO = lilocProd[iloc].SCENARIO;
            }

            ///
            // Request URL to IBP
            // // let resUrl = "/" + liParaValue[0].VALUE + "?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP gt datetime'" + vFromDate + "' and PERIODID4_TSTAMP lt datetime'" + vToDate + "' and UOMTOID eq 'EA' and CUSTID eq '" + lsCustomer.CUSTOMER_GROUP + "'";
            // let resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq 'EA' and CUSTID eq '${lsCustomer.CUSTOMER_GROUP}'`;
            let resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
            //VP-1419
            // let resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,${demandField},UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;

            request.headers['Application-Interface-Key'] = vAIRKey;
            console.log(request.headers);

            let req = await service.tx(request).get(resUrl);
            // If Future Demand does not exists for UOM 'EA', Fetching for 'PC'
            if (req === undefined || req.length === 0) {
                sUOM = 'PC';
                resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP ge datetime'${vFromDate}' and PERIODID4_TSTAMP le datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
                //VP-1419
                // resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,${demandField},UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
                req = await service.tx(request).get(resUrl);
            }
            console.log("Step 4 Future Demand Data" + req.length);
            // if(req.length > 0){
            const vDelDate = new Date(vFromDateT);
            const vDateDeld = vDelDate.toISOString().split('T')[0];
            try {
                await DELETE.from("CP_IBP_FUTUREDEMAND")
                    .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                            AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                            AND VERSION = '${lsData.VERSION}'
                            AND SCENARIO = '${lilocProd[iloc].SCENARIO}'
                            AND WEEK_DATE >= '${vDateDeld}'
                            `);
                await DELETE.from("CP_IBP_FUTUREDEMAND_LOCPRODCUST")
                    .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                                    AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                                    AND VERSION = '${lsData.VERSION}'
                                    AND SCENARIO = '${lilocProd[iloc].SCENARIO}'
                                    AND WEEK_DATE >= '${vDateDeld}'
                                    `);
            } catch (e) {
                //Do nothing
            }
            console.log("Step 5 Deleted Future Demand for Loc Product " + lsData);
            // }
            // Convert date to ISO
            const dateJSONToEDM = jsonDate => {
                const content = /\d+/.exec(String(jsonDate));
                const timestamp = content ? Number(content[0]) : 0;
                const date = new Date(timestamp);
                const string = date.toISOString().split('T')[0];
                return string;
            };
            flag = "";
            let resUrlCust = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,CUSTID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP ge datetime'${vFromDate}' and PERIODID4_TSTAMP le datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
            //VP-1419
            // let resUrlCust = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,CUSTID,PERIODID4_TSTAMP,${demandField},UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
            let reqCust = await service.tx(request).get(resUrlCust);

            let iFutureDemandCust = [];
            let sFutureDemandCust = {};

            // Loop request to insert into
            for (let i in reqCust) {
                let vWeekDate = dateJSONToEDM(reqCust[i].PERIODID4_TSTAMP).split("T")[0];
                vWeekDate = new Date(vWeekDate);
                vWeekDate = GenF.getNextMondayCmp(vWeekDate);
                // if (dateJSONToEDM([i].PERIODID4_TSTAMP) >= vDateDeld) {
                if (vWeekDate >= vDateDeld) {
                    sFutureDemandCust = {};
                    sFutureDemandCust["LOCATION_ID"] = GenF.parse(reqCust[i].LOCID);
                    sFutureDemandCust["PRODUCT_ID"] = GenF.parse(reqCust[i].PRDID);
                    sFutureDemandCust["CUSTOMER_GROUP"] = GenF.parse(reqCust[i].CUSTID);
                    sFutureDemandCust["VERSION"] = GenF.parse(reqCust[i].VERSIONID);
                    if (reqCust[i].SCENARIOID === "" || reqCust[i].SCENARIOID === null) {
                        sFutureDemandCust["SCENARIO"] = GenF.parse("_PLAN");
                    } else {
                        sFutureDemandCust["SCENARIO"] = GenF.parse(reqCust[i].SCENARIOID);
                    }
                    sFutureDemandCust["WEEK_DATE"] = GenF.parse(vWeekDate);
                    sFutureDemandCust["QUANTITY"] = GenF.parse(reqCust[i].TOTALDEMANDOUTPUT);
                    // VP-1419
                    // sFutureDemandCust["QUANTITY"] = GenF.parse(reqCust[i].STATISTICALFCSTQTY);
                    iFutureDemandCust.push(GenF.parse(sFutureDemandCust));
                }
            }
            if (iFutureDemandCust.length > 0) {
                await INSERT.into("CP_IBP_FUTUREDEMAND_LOCPRODCUST").entries(iFutureDemandCust);
                console.log("Step 6.1 Successfully imported Future Demand for Loc Product Customer " + lsData);
                // flag = "D";
            }
            let iFutureDemand = [];
            let sFutureDemand = {};


            // Loop request to insert into
            for (let i in req) {
                let vWeekDate = dateJSONToEDM(req[i].PERIODID4_TSTAMP).split("T")[0];
                vWeekDate = new Date(vWeekDate);
                vWeekDate = GenF.getNextMondayCmp(vWeekDate);
                // if (dateJSONToEDM(req[i].PERIODID4_TSTAMP) >= vDateDeld) {
                if (vWeekDate >= vDateDeld) {
                    sFutureDemand = {};
                    sFutureDemand["LOCATION_ID"] = GenF.parse(req[i].LOCID);
                    sFutureDemand["PRODUCT_ID"] = GenF.parse(req[i].PRDID);
                    sFutureDemand["VERSION"] = GenF.parse(req[i].VERSIONID);
                    if (req[i].SCENARIOID === "" || req[i].SCENARIOID === null) {
                        sFutureDemand["SCENARIO"] = GenF.parse("_PLAN");
                    } else {
                        sFutureDemand["SCENARIO"] = GenF.parse(req[i].SCENARIOID);
                    }
                    sFutureDemand["WEEK_DATE"] = GenF.parse(vWeekDate);
                    sFutureDemand["QUANTITY"] = GenF.parse(req[i].TOTALDEMANDOUTPUT);
                    //VP-1419
                    // sFutureDemand["QUANTITY"] = GenF.parse(req[i].STATISTICALFCSTQTY);

                    iFutureDemand.push(GenF.parse(sFutureDemand));
                }
            }
            if (iFutureDemand.length > 0) {
                await INSERT.into("CP_IBP_FUTUREDEMAND").entries(iFutureDemand);
                const weekDatesArr = await generateAlertLog(iFutureDemand,existingData);
                if (weekDatesArr.length > 0) {
                    const alertLog = [{
                        MSGTXT: [...new Set(weekDatesArr)].sort().join(', '),
                        MSGID: 'S07',
                        APPL: 'VCPLANNER',
                        MSGGRP: 'DATA',
                        LOCATION_ID: LOCATION_ID,
                        PRODUCT_ID: PRODUCT_ID,
                        PARA2: VERSION,
                        PARA3: SCENARIO,
                    }]
                    await GenF.sendAlert('C', alertLog, request);
                }
                flag = "D";
                console.log("Step 6.2 Successfully imported Future Demand for Loc Product " + lsData);
            }
            //check from system configurations, skip Option percentages if its No
            if (sIBPOptionPercent == 'No') {
                flag = 'S';
            }
            if (flag === "D") {
                flag = "";
                let resUrlFplan;
                const dateJSONToEDM = (jsonDate) => {
                    const content = /\d+/.exec(String(jsonDate));
                    const timestamp = content ? Number(content[0]) : 0;
                    const date = new Date(timestamp);
                    const string = date.toISOString();
                    return string;
                };

                if (aDates.length > 0) {
                    for (let k = 0; k < aDates.length; k++) {
                        GenF.log(`Import Started: IBP Option Percent for Week Dates ${aDates[k].vFromDate} To ${aDates[k].vToDate}`);
                        // iFCharPlan = [];

                        // resUrlFplan = `/${liParaValue[0].VALUE}?$select=PERIODID4_TSTAMP,PRDID,LOCID,CUSTID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq 'EA' and CUSTID eq '${lsCustomer.CUSTOMER_GROUP}'&$inlinecount=allpages`;
                        resUrlFplan = `/${liParaValue[0].VALUE}?$select=PERIODID4_TSTAMP,PRDID,LOCID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP ge datetime'${aDates[k].vFromDate}' and PERIODID4_TSTAMP le datetime'${aDates[k].vToDate}' and UOMTOID eq '${sUOM}' &$inlinecount=allpages`;

                        request.headers['Application-Interface-Key'] = vAIRKey;
                        console.log(request.headers);
                        let req = await service.tx(request).get(resUrlFplan);
                        const vDelDate = new Date(vFromDateT);
                        const vDateDel = vDelDate.toISOString().split("T")[0];

                        console.log("Step 7 Future Char Plan Data: " + req.length);

                        // await DELETE.from("CP_IBP_FCHARPLAN")
                        //     .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                        //               AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                        //               AND VERSION = '${lsData.VERSION}'
                        //               AND SCENARIO = '${lilocProd[iloc].SCENARIO}'`);

                        let iFCharPlan = [];
                        let sFcharPlan = {};

                        for (let i in req) {
                            let vWeekDate = dateJSONToEDM(req[i].PERIODID4_TSTAMP).split("T")[0];
                            vWeekDate = new Date(vWeekDate);
                            vWeekDate = GenF.getNextMondayCmp(vWeekDate);

                            // Delete FCHAR_PLAN based on Weekdates
                            await DELETE.from("CP_IBP_FCHARPLAN")
                                .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                              AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                              AND VERSION = '${lsData.VERSION}'
                              AND SCENARIO = '${lilocProd[iloc].SCENARIO}'
                              AND WEEK_DATE = '${vWeekDate}'`);

                            if (req[i].SCENARIOID === "" || req[i].SCENARIOID === null) {
                                vScenario = "_PLAN";
                            } else {
                                vScenario = req[i].SCENARIOID;
                            }
                            let vManualOpt = parseFloat("0.00").toFixed(2);
                            if (req[i].MANUALOPTION !== "" && req[i].MANUALOPTION !== null) {
                                vManualOpt = parseFloat(req[i].MANUALOPTION).toFixed(2);
                            }
                            req[i].PERIODID4_TSTAMP = vWeekDate;

                            if (vWeekDate >= vDateDel) {
                                sFcharPlan = {};
                                sFcharPlan["LOCATION_ID"] = GenF.parse(req[i].LOCID);
                                sFcharPlan["PRODUCT_ID"] = GenF.parse(req[i].PRDID);
                                sFcharPlan["CLASS_NUM"] = GenF.parse(req[i].VCCLASS);
                                sFcharPlan["CHAR_NUM"] = GenF.parse(req[i].VCCHAR);
                                //Patch to store charvalue if MAP_CHARVALUE_CHARVALNUM is Yes from System Configuration
                                const charObj = {
                                    CLASS_NUM: sFcharPlan["CLASS_NUM"],
                                    CHAR_NUM: sFcharPlan["CHAR_NUM"],
                                    CHARVAL_NUM: GenF.parse(req[i].VCCHARVALUE)
                                }
                                sFcharPlan["CHARVAL_NUM"] = await GenF.mapCharValue(charObj, 'I');
                                // sFcharPlan["CHARVAL_NUM"] = GenF.parse(req[i].VCCHARVALUE);
                                sFcharPlan["VERSION"] = GenF.parse(req[i].VERSIONID);
                                sFcharPlan["SCENARIO"] = GenF.parse(vScenario);
                                sFcharPlan["WEEK_DATE"] = GenF.parse(vWeekDate);
                                sFcharPlan["OPT_PERCENT"] = GenF.parse(parseFloat(req[i].OPTIONPERCENTAGE).toFixed(2));
                                sFcharPlan["OPT_QTY"] = GenF.parse(parseFloat(req[i].FINALDEMANDVC).toFixed(3));
                                sFcharPlan["MANUALOPTION"] = GenF.parse(vManualOpt);
                                iFCharPlan.push(GenF.parse(sFcharPlan));
                            }
                        }

                        if (iFCharPlan.length > 0) {
                            const tx = cds.tx(request);
                            //Patch for option percentage sum Greater than 100
                            iFCharPlan = await GenF.optionPercentageCheck(iFCharPlan);
                            // await tx.run(INSERT.into("CP_IBP_FCHARPLAN").entries(iFCharPlan)).then(tx.commit);
                            await cds.run(INSERT.into("CP_IBP_FCHARPLAN").entries(iFCharPlan));
                            console.log("Step 8 Successfully imported Future Char Plan Data:  " + req.length);
                            flag = "S";
                        }

                        GenF.log(`Import Completed: IBP Option Percent for Week Dates ${aDates[k].vFromDate} To ${aDates[k].vToDate}`);
                    }
                }
            }
            if (flag === "S") {
                lMessage =
                    lMessage +
                    " " +
                    "Import of IBP Demand and Future char.plan data is successfull for product" +
                    lsData.PRODUCT_ID;
            } else if (req.length === 0) {
                lMessage = lMessage + ' ' + "Future Demand does not exists for product" + lsData.PRODUCT_ID;
            } else {
                lMessage = lMessage + ' ' + "Import of IBP Demand and Future char.plan data has failed for product" + lsData.PRODUCT_ID;
                let sLog = "Import of IBP Demand and Future char.plan data has failed for product" + lsData.PRODUCT_ID;
                aErrorLog.push(sLog);
            }
        }
        if (aErrorLog.length == lilocProd.length) {
            await GenF.jobSchMessage('', aErrorLog.toString(), request);
        } else { //Success
            await GenF.jobSchMessage('X', lMessage, request);
        }
        //OLD
        // await GenF.jobSchMessage('X', lMessage, request);
    });

//     this.on("generateFDemandQty", async (request) => {
       
//         // Get IBP planning area
//         // Get Planning area and Prefix configurations for IBP
//         let liParaValue = await GenF.getParameterPrefix();
//         let flag, lMessage = "",
//             vScenario = "";
//         // Generating payload for job scheduler logs
//         let lilocProd = {};
//         let aErrorLog = [];
//         let lsData = {};
//         let createtAt = new Date();
//         let id = uuidv1();
//         let values = [];
//         let message = "Started importing IBP Future Demand and Characteristic Plan";
//         let res = request._.req.res;
//          let lilocProdReq = JSON.parse(request.data.LocProdData);
//         let req = [];
//         let aDates = [], oDates = {};
//          let QuantityField = '';
//          let tempweek = '';
//          let ConfigWeek = '';
//           let vDelDate = '';
//             let vDateDeld ='';
//             let vDateDel ='';
//         let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Product Demand'`);
//         //    let sPlan = aMappingData[0].PLANNING_AREA;
//         let sPlan = liParaValue[0].VALUE.toString();
//         console.log('Step1 Started importing IBP Future Demand and Characteristic Plan');

//         let aMappedKeys = []
//         console.log(aTableData)
//         aTableData.forEach((el) => {
//             aMappedKeys.push(el.MAPPING_FIELD)
//         })
    

//         if (lilocProdReq[0].PRODUCT_ID === "ALL") {
//             lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
//             lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
//             const objCatFn = new Catservicefn();
//             const lilocProdT = await objCatFn.getAllProducts(lsData);
//             lsData = {};
//             const litemp = JSON.stringify(lilocProdT);
//             lilocProd = JSON.parse(litemp);
//             for (let i = 0; i < lilocProd.length; i++) {
//                 lilocProd[i].VERSION = lilocProdReq[0].VERSION;
//                 lilocProd[i].SCENARIO = lilocProdReq[0].SCENARIO;
//             }
//         } else {
//             lilocProd =  JSON.parse(request.data.LocProdData);
//         }

//         // let tempData = lilocProd[0].PRODUCT_ID;
//         // lilocProd = [];

//         // for(let i=0; i<tempData.length; i++){
//         //     let obj = {
//         //         LOCATION_ID: lilocProdReq[0].LOCATION_ID,
//         //         PRODUCT_ID : tempData[i],
//         //         VERSION: lilocProdReq[0].VERSION,
//         //         SCENARIO: lilocProdReq[0].SCENARIO,
//         //         }
//         //     lilocProd.push(obj);  
//         //     obj = {};
//         // }

//         console.log('Step 2 Location Data:' + lilocProd);

//         values.push({
//             id,
//             createtAt,
//             message,
//             lilocProd
//         });
//         res.statusCode = 202;
//         res.send({
//             values
//         });
//          let oResponse = await obibpfucntions.importVerScen(request);
//         if (oResponse.flag === "S") {
//             console.log("Successfully imported version scenario from IBP");
//         } else {
//             console.log("Failed to import version scenario from IBP");
//         }
//         flag = "";
//         lMessage = "";
//         // Fetch 2 years Char plan
//         let vFromDateT = new Date();
//         vFromDateT.setDate(vFromDateT.getDate());
//         vFromDateT = vFromDateT.toISOString().split('T')[0];
//         let telescoppicDate = await cds.run(`SELECT * from CP_IBPCALENDER_WEEK 
//                                                     where WEEK_STARTDATE <= '${vFromDateT}' 
//                                                     and WEEK_ENDDATE >= '${vFromDateT}'
//                                                     and LEVEL = 'W'`);
//         // vFromDateT = telescoppicDate.length > 0 ? telescoppicDate[0].WEEK_STARTDATE : vFromDateT;
//         vFromDateT = telescoppicDate.length > 0 ? new Date(telescoppicDate[0].PERIODSTART).toISOString().split('T')[0] : vFromDateT;
//         console.log("vFromDateT", vFromDateT);
//         // let temp = new Date(vFromDateT)
//         // temp = new Date(temp.setDate(temp.getDate() - 7));
//         // temp = temp.toISOString();
//         // console.log("last week calendar date - ", temp);

//         let vFromDate = vFromDateT + "T00:00:00";
//         console.log(vFromDate);

//         let vDate = new Date();
//         var vYear = vDate.getFullYear();
//         var vMonth = vDate.getMonth();
//         var vDay = vDate.getDate();
//         // Forecast Order Horizon
//         let lWeeks = await GenF.getParameterValue(lilocProdReq[0].LOCATION_ID, 2);

//         var vToDateT = new Date(vYear, vMonth, (vDay + parseInt(7 * lWeeks)));
//         vToDateT = vToDateT.toISOString().split('T')[0];
//         let vToDate = vToDateT + "T00:00:00";
//         console.log(vToDate);

//         // Insert Dates
//         let iWeeks = 10;
//         let vDateFrom = vFromDate;
//         if (lWeeks < 10) {
//             oDates.vFromDate = vFromDate;
//             oDates.vToDate = vToDate;
//             aDates.push(GenF.parse(oDates));
//         }
//         // while (lWeeks > 10 && iWeeks < parseInt(lWeeks)) {
//         //     oDates.vFromDate = vDateFrom;
//         //     let vDateTo = new Date(vYear, vMonth, (vDay + parseInt(7 * iWeeks)));
//         //     vDateTo = vDateTo.toISOString().split('T')[0];
//         //     oDates.vToDate = vDateTo + "T00:00:00";

//         //     aDates.push(GenF.parse(oDates));
//         //     vDateFrom = oDates.vToDate;
//         //     let iremWks = parseInt(lWeeks) - iWeeks;
//         //     if (iremWks < 4) {
//         //         iWeeks = iWeeks + iremWks;
//         //     } else {
//         //         iWeeks = iWeeks + 4;
//         //     }

//         // }
//         let weeks = 4;
//         while (lWeeks > 10 && iWeeks < parseInt(lWeeks)) {
//             oDates.vFromDate = vDateFrom;
//             let vDateTo = new Date(vYear, vMonth, (vDay + parseInt(7 * weeks)));
//             vDateTo = vDateTo.toISOString().split('T')[0];
//             oDates.vToDate = vDateTo + "T00:00:00";

//             aDates.push(GenF.parse(oDates));
//             vDateFrom = oDates.vToDate;
//             let remWks = parseInt(lWeeks) - weeks;
//             let iremWks = parseInt(lWeeks) - iWeeks;
//             if (iremWks < 4) {
//                 weeks = weeks + remWks;
//                 iWeeks = iWeeks + iremWks;
//             } else {
//                 weeks = weeks + 4;
//                 iWeeks = iWeeks + 4;
//             }

//         }

//         let sUOM = 'EA';                 // Unit Of Measure
//         var sIBPOptionPercent = await GenF.getSystemConfig('IBP_OPTION_PERCENT')
//         // var demandField = sIBPOptionPercent === "No" ? "STATISTICALFCSTQTY" : "TOTALDEMANDOUTPUT";
//         // Fetch IBP demand
// console.log("lilocProd", lilocProd.length);        
//         for (let iloc = 0; iloc < lilocProd.length; iloc++) {
//             const { LOCATION_ID, PRODUCT_ID, VERSION, SCENARIO } = lilocProd[iloc];
//             let existingData = await cds.run(`
//                 SELECT *
//                 FROM "CP_IBP_FUTUREDEMAND"
//                 WHERE LOCATION_ID = '${LOCATION_ID}'
//                 AND VERSION = '${VERSION}'
//                 AND SCENARIO = '${SCENARIO}'
//                 AND PRODUCT_ID = ('${PRODUCT_ID}')
//               `);

//             sUOM = 'EA';
//             //     let lsCustomer = await SELECT.one
//             //         .from('V_SALES_H')
//             //         .columns('CUSTOMER_GROUP')
//             //         .where(`PRODUCT_ID = '${lilocProd[iloc].PRODUCT_ID}' AND LOCATION_ID = '${lilocProd[iloc].LOCATION_ID}'`);

//             //     // If the sales history does not exists for location-product , continue with the next iteration

//             //     if (lsCustomer === null) {
//             //         continue;
//             //     }

//             lsData.LOCATION_ID = lilocProd[iloc].LOCATION_ID;
//             lsData.PRODUCT_ID = lilocProd[iloc].PRODUCT_ID;
//             ///
//             lsData.VERSION = lilocProd[iloc].VERSION;
//             if (lilocProd[iloc].SCENARIO === "_PLAN") {
//                 lsData.SCENARIO = "";
//             } else {
//                 lsData.SCENARIO = lilocProd[iloc].SCENARIO;
//             }
//             //MAPPING DATA FOR IMPORT PRODUCT DEMAND


//             let  selectClause1 = aMappedKeys.filter(f => f !== "CUSTID");
//             selectClause1 = selectClause1.join(',')
//             tempweek = aTableData.filter(e => e.BTP_FIELD == "WEEK_DATE")
//             if (tempweek.length > 0) {
//                 ConfigWeek = tempweek[0].MAPPING_FIELD
//             }
           

            

//             let resUrl = `/${sPlan}?$select=${selectClause1}&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and ${ConfigWeek} gt datetime'${vFromDate}' and ${ConfigWeek} lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
//             ///
//             // Request URL to IBP
//             // // let resUrl = "/" + liParaValue[0].VALUE + "?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP gt datetime'" + vFromDate + "' and PERIODID4_TSTAMP lt datetime'" + vToDate + "' and UOMTOID eq 'EA' and CUSTID eq '" + lsCustomer.CUSTOMER_GROUP + "'";
//             // let resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq 'EA' and CUSTID eq '${lsCustomer.CUSTOMER_GROUP}'`;
//             // let resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
//             //VP-1419
//             // let resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,${demandField},UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;

//             request.headers['Application-Interface-Key'] = vAIRKey;
//             console.log(request.headers);

//             let req = await service.tx(request).get(resUrl);
//             // If Future Demand does not exists for UOM 'EA', Fetching for 'PC'
//             if (req === undefined || req.length === 0) {
//                 sUOM = 'PC';
//                 resUrl = `/${sPlan}?$select=${selectClause1}&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and ${ConfigWeek} ge datetime'${vFromDate}' and ${ConfigWeek} le datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
//                 //VP-1419
//                 // resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,${demandField},UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
//                 req = await service.tx(request).get(resUrl);
//             }
//             console.log("Step 4 Future Demand Data" + req.length);
//             if(req.length > 0){
//              vDelDate = new Date(vFromDateT);
//              vDateDeld = vDelDate.toISOString().split('T')[0];
// console.log("vDelDate", vDelDate);             
// console.log("vDateDeld", vDateDeld);             
//             try {
//                 await DELETE.from("CP_IBP_FUTUREDEMAND")
//                     .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
//                             AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
//                             AND VERSION = '${lsData.VERSION}'
//                             AND SCENARIO = '${lilocProd[iloc].SCENARIO}'
//                             AND WEEK_DATE >= '${vDateDeld}'
//                             `);
//                 await DELETE.from("CP_IBP_FUTUREDEMAND_LOCPRODCUST")
//                     .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
//                                     AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
//                                     AND VERSION = '${lsData.VERSION}'
//                                     AND SCENARIO = '${lilocProd[iloc].SCENARIO}'
//                                     AND WEEK_DATE >= '${vDateDeld}'
//                                     `);
//             } catch (e) {
//                 //Do nothing
//             }
//             console.log("Step 5 Deleted Future Demand for Loc Product " + lsData);
//             } else {
//                 console.log("Step 5 No data to Deleted Future Demand for Loc Product " + lsData);
//             }
//             // Convert date to ISO
//             const dateJSONToEDM = jsonDate => {
//                 const content = /\d+/.exec(String(jsonDate));
//                 const timestamp = content ? Number(content[0]) : 0;
//                 const date = new Date(timestamp);
//                 const string = date.toISOString().split('T')[0];
//                 return string;
//             };
//             flag = "";
//               let  selectClause = aMappedKeys.join(',')
        
            
//             let resUrlCust = `/${sPlan}?$select=${selectClause}&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and ${ConfigWeek} ge datetime'${vFromDate}' and ${ConfigWeek} le datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
//             // let resUrlCust = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,CUSTID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP ge datetime'${vFromDate}' and PERIODID4_TSTAMP le datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
//             //VP-1419
//             // let resUrlCust = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,CUSTID,PERIODID4_TSTAMP,${demandField},UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
//             let reqCust = await service.tx(request).get(resUrlCust);

//             let iFutureDemandCust = [];
//             let sFutureDemandCust = {};
           

//             let temp = aTableData.filter(e => e.BTP_FIELD == "QUANTITY")
//             if (temp.length > 0) {
//                 QuantityField = temp[0].MAPPING_FIELD
//             }
// console.log("Line 5190", reqCust);

//             // Loop request to insert into
//             for (let i in reqCust) {
//                 let vWeekDate = dateJSONToEDM(reqCust[i][ConfigWeek]).split("T")[0];
//                 vWeekDate = new Date(vWeekDate);
//                 vWeekDate = GenF.getNextMondayCmp(vWeekDate);
//                 // if (dateJSONToEDM([i].PERIODID4_TSTAMP) >= vDateDeld) {
// console.log("vWeekDate", vWeekDate)                
// console.log("vDateDeld", vDateDeld)                
//                 if (vWeekDate >= vDateDeld) {
//                     sFutureDemandCust = {};
//                     sFutureDemandCust["LOCATION_ID"] = GenF.parse(reqCust[i].LOCID);
//                     sFutureDemandCust["PRODUCT_ID"] = GenF.parse(reqCust[i].PRDID);
//                     sFutureDemandCust["CUSTOMER_GROUP"] = GenF.parse(reqCust[i].CUSTID);
//                     sFutureDemandCust["VERSION"] = GenF.parse(reqCust[i].VERSIONID);
//                     if (reqCust[i].SCENARIOID === "" || reqCust[i].SCENARIOID === null) {
//                         sFutureDemandCust["SCENARIO"] = GenF.parse("_PLAN");
//                     } else {
//                         sFutureDemandCust["SCENARIO"] = GenF.parse(reqCust[i].SCENARIOID);
//                     }
//                     sFutureDemandCust["WEEK_DATE"] = GenF.parse(vWeekDate);
//                     // sFutureDemandCust["QUANTITY"] = GenF.parse(reqCust[i].TOTALDEMANDOUTPUT);
//                     sFutureDemandCust["QUANTITY"] = GenF.parse(reqCust[i][QuantityField]);
//                     // VP-1419
//                     // sFutureDemandCust["QUANTITY"] = GenF.parse(reqCust[i].STATISTICALFCSTQTY);
//                     iFutureDemandCust.push(GenF.parse(sFutureDemandCust));
//                 }
//             }
// console.log("iFutureDemandCust", iFutureDemandCust.length);
// console.log("iFutureDemandCust", iFutureDemandCust);
//             if (iFutureDemandCust.length > 0) {
//                 await INSERT.into("CP_IBP_FUTUREDEMAND_LOCPRODCUST").entries(iFutureDemandCust);
//                 console.log("Step 6.1 Successfully imported Future Demand for Loc Product Customer " + lsData);
//                 // flag = "D";
//             }
//             let iFutureDemand = [];
//             let sFutureDemand = {};


//                 const result = Object.values(
//                 iFutureDemandCust.reduce((acc, row) => {
//                     // group by everything EXCEPT customer group
//                     const key = `${row.LOCATION_ID}|${row.PRODUCT_ID}|${row.VERSION}|${row.SCENARIO}|${row.WEEK_DATE}`;

//                     if (!acc[key]) {
//                     acc[key] = {
//                         LOCATION_ID: row.LOCATION_ID,
//                         PRODUCT_ID: row.PRODUCT_ID,
//                         VERSION: row.VERSION,
//                         SCENARIO: row.SCENARIO,
//                         WEEK_DATE: row.WEEK_DATE,
//                         QUANTITY: 0
//                     };
//                     }

//                     acc[key].QUANTITY += Number(row.QUANTITY); // sum quantities
//                     return acc;
//                 }, {})
//                 );

// console.log(result);

// iFutureDemand = result;

// // console.log("Line 5225", req)
// //             // Loop request to insert into
// //             for (let i in req) {
// //                 let vWeekDate = dateJSONToEDM(req[i][ConfigWeek]).split("T")[0];
// // console.log("Line 5229", vWeekDate)
// //                 vWeekDate = new Date(vWeekDate);
// //                 vWeekDate = GenF.getNextMondayCmp(vWeekDate);
// // console.log("Line 5231", vWeekDate)
// //                 // if (dateJSONToEDM(req[i].PERIODID4_TSTAMP) >= vDateDeld) {
// //                 if (vWeekDate >= vDateDeld) {
// //                     sFutureDemand = {};
// //                     sFutureDemand["LOCATION_ID"] = GenF.parse(req[i].LOCID);
// //                     sFutureDemand["PRODUCT_ID"] = GenF.parse(req[i].PRDID);
// //                     sFutureDemand["VERSION"] = GenF.parse(req[i].VERSIONID);
// //                     if (req[i].SCENARIOID === "" || req[i].SCENARIOID === null) {
// //                         sFutureDemand["SCENARIO"] = GenF.parse("_PLAN");
// //                     } else {
// //                         sFutureDemand["SCENARIO"] = GenF.parse(req[i].SCENARIOID);
// //                     }
// //                     sFutureDemand["WEEK_DATE"] = GenF.parse(vWeekDate);
// //                     sFutureDemand["QUANTITY"] = GenF.parse(req[i][QuantityField]);
// //                     //VP-1419
// //                     // sFutureDemand["QUANTITY"] = GenF.parse(req[i].STATISTICALFCSTQTY);

// //                     iFutureDemand.push(GenF.parse(sFutureDemand));
// //                 }
// //             }
// console.log("Line 5252", iFutureDemand.length)
//             if (iFutureDemand.length > 0) {
//                 await INSERT.into("CP_IBP_FUTUREDEMAND").entries(iFutureDemand);
//                 const weekDatesArr = await generateAlertLog(iFutureDemand, existingData);
//                 if (weekDatesArr.length > 0) {
//                     const alertLog = [{
//                         MSGTXT: [...new Set(weekDatesArr)].sort().join(', '),
//                         MSGID: 'S07',
//                         APPL: 'VCPLANNER',
//                         MSGGRP: 'DATA',
//                         LOCATION_ID: LOCATION_ID,
//                         PRODUCT_ID: PRODUCT_ID,
//                         PARA2: VERSION,
//                         PARA3: SCENARIO,
//                     }]
//                     await GenF.sendAlert('C', alertLog, request);
//                 }
//                 flag = "D";
//                 console.log("Step 6.2 Successfully imported Future Demand for Loc Product " + lsData);
//             }
//             //check from system configurations, skip Option percentages if its No
//             if (sIBPOptionPercent == 'No') {
//                 flag = 'S';
//             }
//             if (flag === "D") {
//                flag = "S";
//                 let resUrlFplan;
//                 const dateJSONToEDM = (jsonDate) => {
//                     const content = /\d+/.exec(String(jsonDate));
//                     const timestamp = content ? Number(content[0]) : 0;
//                     const date = new Date(timestamp);
//                     const string = date.toISOString();
//                     return string;
//                 };

//                 // if (aDates.length > 0) {
//                 //     for (let k = 0; k < aDates.length; k++) {
//                 //         GenF.log(`Import Started: IBP Option Percent for Week Dates ${aDates[k].vFromDate} To ${aDates[k].vToDate}`);
//                 //         // iFCharPlan = [];

//                 //         // resUrlFplan = `/${liParaValue[0].VALUE}?$select=PERIODID4_TSTAMP,PRDID,LOCID,CUSTID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq 'EA' and CUSTID eq '${lsCustomer.CUSTOMER_GROUP}'&$inlinecount=allpages`;
//                 //         resUrlFplan = `/${sPlan}?$select=${ConfigWeek},PRDID,LOCID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and ${ConfigWeek} ge datetime'${aDates[k].vFromDate}' and ${ConfigWeek} le datetime'${aDates[k].vToDate}' and UOMTOID eq '${sUOM}' &$inlinecount=allpages`;

//                 //         request.headers['Application-Interface-Key'] = vAIRKey;
//                 //         console.log(request.headers);
//                 //         let req = await service.tx(request).get(resUrlFplan);
//                 //           vDelDate = new Date(vFromDateT);
//                 //           vDateDel = vDelDate.toISOString().split("T")[0];

//                 //         console.log("Step 7 Future Char Plan Data: " + req.length);

//                 //         // await DELETE.from("CP_IBP_FCHARPLAN")
//                 //         //     .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
//                 //         //               AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
//                 //         //               AND VERSION = '${lsData.VERSION}'
//                 //         //               AND SCENARIO = '${lilocProd[iloc].SCENARIO}'`);

//                 //         let iFCharPlan = [];
//                 //         let sFcharPlan = {};

//                 //         for (let i in req) {
//                 //             let vWeekDate = dateJSONToEDM(req[i][ConfigWeek]).split("T")[0];
//                 //             vWeekDate = new Date(vWeekDate);
//                 //             vWeekDate = GenF.getNextMondayCmp(vWeekDate);

//                 //             // Delete FCHAR_PLAN based on Weekdates
//                 //             await DELETE.from("CP_IBP_FCHARPLAN")
//                 //                 .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
//                 //               AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
//                 //               AND VERSION = '${lsData.VERSION}'
//                 //               AND SCENARIO = '${lilocProd[iloc].SCENARIO}'
//                 //               AND WEEK_DATE = '${vWeekDate}'`);

//                 //             if (req[i].SCENARIOID === "" || req[i].SCENARIOID === null) {
//                 //                 vScenario = "_PLAN";
//                 //             } else {
//                 //                 vScenario = req[i].SCENARIOID;
//                 //             }
//                 //             let vManualOpt = parseFloat("0.00").toFixed(2);
//                 //             if (req[i].MANUALOPTION !== "" && req[i].MANUALOPTION !== null) {
//                 //                 vManualOpt = parseFloat(req[i].MANUALOPTION).toFixed(2);
//                 //             }
//                 //             req[i][ConfigWeek] = vWeekDate;

//                 //             if (vWeekDate >= vDateDel) {
//                 //                 sFcharPlan = {};
//                 //                 sFcharPlan["LOCATION_ID"] = GenF.parse(req[i].LOCID);
//                 //                 sFcharPlan["PRODUCT_ID"] = GenF.parse(req[i].PRDID);
//                 //                 sFcharPlan["CLASS_NUM"] = GenF.parse(req[i].VCCLASS);
//                 //                 sFcharPlan["CHAR_NUM"] = GenF.parse(req[i].VCCHAR);
//                 //                 //Patch to store charvalue if MAP_CHARVALUE_CHARVALNUM is Yes from System Configuration
//                 //                 const charObj = {
//                 //                     CLASS_NUM: sFcharPlan["CLASS_NUM"],
//                 //                     CHAR_NUM: sFcharPlan["CHAR_NUM"],
//                 //                     CHARVAL_NUM: GenF.parse(req[i].VCCHARVALUE)
//                 //                 }
//                 //                 sFcharPlan["CHARVAL_NUM"] = await GenF.mapCharValue(charObj, 'I');
//                 //                 // sFcharPlan["CHARVAL_NUM"] = GenF.parse(req[i].VCCHARVALUE);
//                 //                 sFcharPlan["VERSION"] = GenF.parse(req[i].VERSIONID);
//                 //                 sFcharPlan["SCENARIO"] = GenF.parse(vScenario);
//                 //                 sFcharPlan["WEEK_DATE"] = GenF.parse(vWeekDate);
//                 //                 sFcharPlan["OPT_PERCENT"] = GenF.parse(parseFloat(req[i].OPTIONPERCENTAGE).toFixed(2));
//                 //                 sFcharPlan["OPT_QTY"] = GenF.parse(parseFloat(req[i].FINALDEMANDVC).toFixed(3));
//                 //                 sFcharPlan["MANUALOPTION"] = GenF.parse(vManualOpt);
//                 //                 iFCharPlan.push(GenF.parse(sFcharPlan));
//                 //             }
//                 //         }

//                 //         if (iFCharPlan.length > 0) {
//                 //             const tx = cds.tx(request);
//                 //             //Patch for option percentage sum Greater than 100
//                 //             iFCharPlan = await GenF.optionPercentageCheck(iFCharPlan);
//                 //             // await tx.run(INSERT.into("CP_IBP_FCHARPLAN").entries(iFCharPlan)).then(tx.commit);
//                 //             await cds.run(INSERT.into("CP_IBP_FCHARPLAN").entries(iFCharPlan));
//                 //             console.log("Step 8 Successfully imported Future Char Plan Data:  " + req.length);
//                 //             flag = "S";
//                 //         }

//                 //         GenF.log(`Import Completed: IBP Option Percent for Week Dates ${aDates[k].vFromDate} To ${aDates[k].vToDate}`);
//                 //     }
//                 // }
//             }
            
//             if (flag === "S") {
//                 lMessage =
//                     lMessage +
//                     " " +
//                     "Import of IBP Demand and Future char.plan data is successfull for product" +
//                     lsData.PRODUCT_ID;
//             } else if (req.length === 0) {
//                 lMessage = lMessage + ' ' + "Future Demand does not exists for product" + lsData.PRODUCT_ID;
//             } else {
//                 lMessage = lMessage + ' ' + "Import of IBP Demand and Future char.plan data has failed for product" + lsData.PRODUCT_ID;
//                 let sLog = "Import of IBP Demand and Future char.plan data has failed for product" + lsData.PRODUCT_ID;
//                 aErrorLog.push(sLog);
//             }
//         }
//         if (aErrorLog.length == lilocProd.length) {
//             await GenF.jobSchMessage('', aErrorLog.toString(), request);
//         } else { //Success
//             await GenF.jobSchMessage('X', lMessage, request);
//         }
//         //OLD
//         // await GenF.jobSchMessage('X', lMessage, request);
//     });


this.on("generateFDemandQty", async (request) => {
       
        // Get IBP planning area
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getParameterPrefix();
        let flag, lMessage = "",
            vScenario = "";
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let aErrorLog = [];
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing IBP Future Demand and Characteristic Plan";
        let res = request._.req.res;
         let lilocProdReq = JSON.parse(request.data.LocProdData);
        let req = [];
        let aDates = [], oDates = {};
         let QuantityField = '';
         let tempweek = '';
         let ConfigWeek = '';
          let vDelDate = '';
            let vDateDeld ='';
            let vDateDel ='';
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Product Demand'`);
        //    let sPlan = aMappingData[0].PLANNING_AREA;
        let sPlan = liParaValue[0].VALUE.toString();
        console.log('Step1 Started importing IBP Future Demand and Characteristic Plan');

        let aMappedKeys = []
        console.log(aTableData)
        aTableData.forEach((el) => {
            aMappedKeys.push(el.MAPPING_FIELD)
        })
    

        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
            for (let i = 0; i < lilocProd.length; i++) {
                lilocProd[i].VERSION = lilocProdReq[0].VERSION;
                lilocProd[i].SCENARIO = lilocProdReq[0].SCENARIO;
            }
        } else {
            lilocProd =  JSON.parse(request.data.LocProdData);
        }

        // let tempData = lilocProd[0].PRODUCT_ID;
        // lilocProd = [];

        // for(let i=0; i<tempData.length; i++){
        //     let obj = {
        //         LOCATION_ID: lilocProdReq[0].LOCATION_ID,
        //         PRODUCT_ID : tempData[i],
        //         VERSION: lilocProdReq[0].VERSION,
        //         SCENARIO: lilocProdReq[0].SCENARIO,
        //         }
        //     lilocProd.push(obj);  
        //     obj = {};
        // }

        console.log('Step 2 Location Data:' + lilocProd);

        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });
         let oResponse = await obibpfucntions.importVerScen(request);
        if (oResponse.flag === "S") {
            console.log("Successfully imported version scenario from IBP");
        } else {
            console.log("Failed to import version scenario from IBP");
        }
        flag = "";
        lMessage = "";
        // Fetch 2 years Char plan
        let vFromDateT = new Date();
        vFromDateT.setDate(vFromDateT.getDate());
        vFromDateT = vFromDateT.toISOString().split('T')[0];
        let telescoppicDate = await cds.run(`SELECT * from CP_IBPCALENDER_WEEK 
                                                    where WEEK_STARTDATE <= '${vFromDateT}' 
                                                    and WEEK_ENDDATE >= '${vFromDateT}'
                                                    and LEVEL = 'W'`);
        // vFromDateT = telescoppicDate.length > 0 ? telescoppicDate[0].WEEK_STARTDATE : vFromDateT;
        vFromDateT = telescoppicDate.length > 0 ? new Date(telescoppicDate[0].PERIODSTART).toISOString().split('T')[0] : vFromDateT;
        console.log("vFromDateT", vFromDateT);
        // let temp = new Date(vFromDateT)
        // temp = new Date(temp.setDate(temp.getDate() - 7));
        // temp = temp.toISOString();
        // console.log("last week calendar date - ", temp);

        let vFromDate = vFromDateT + "T00:00:00";
        console.log(vFromDate);

        let vDate = new Date();
        var vYear = vDate.getFullYear();
        var vMonth = vDate.getMonth();
        var vDay = vDate.getDate();
        // Forecast Order Horizon
        let lWeeks = await GenF.getParameterValue(lilocProdReq[0].LOCATION_ID, 2);

        var vToDateT = new Date(vYear, vMonth, (vDay + parseInt(7 * lWeeks)));
        vToDateT = vToDateT.toISOString().split('T')[0];
        let vToDate = vToDateT + "T00:00:00";
        console.log(vToDate);

        // Insert Dates
        let iWeeks = 10;
        let vDateFrom = vFromDate;
        if (lWeeks < 10) {
            oDates.vFromDate = vFromDate;
            oDates.vToDate = vToDate;
            aDates.push(GenF.parse(oDates));
        }
        // while (lWeeks > 10 && iWeeks < parseInt(lWeeks)) {
        //     oDates.vFromDate = vDateFrom;
        //     let vDateTo = new Date(vYear, vMonth, (vDay + parseInt(7 * iWeeks)));
        //     vDateTo = vDateTo.toISOString().split('T')[0];
        //     oDates.vToDate = vDateTo + "T00:00:00";

        //     aDates.push(GenF.parse(oDates));
        //     vDateFrom = oDates.vToDate;
        //     let iremWks = parseInt(lWeeks) - iWeeks;
        //     if (iremWks < 4) {
        //         iWeeks = iWeeks + iremWks;
        //     } else {
        //         iWeeks = iWeeks + 4;
        //     }

        // }
        let weeks = 4;
        while (lWeeks > 10 && iWeeks < parseInt(lWeeks)) {
            oDates.vFromDate = vDateFrom;
            let vDateTo = new Date(vYear, vMonth, (vDay + parseInt(7 * weeks)));
            vDateTo = vDateTo.toISOString().split('T')[0];
            oDates.vToDate = vDateTo + "T00:00:00";

            aDates.push(GenF.parse(oDates));
            vDateFrom = oDates.vToDate;
            let remWks = parseInt(lWeeks) - weeks;
            let iremWks = parseInt(lWeeks) - iWeeks;
            if (iremWks < 4) {
                weeks = weeks + remWks;
                iWeeks = iWeeks + iremWks;
            } else {
                weeks = weeks + 4;
                iWeeks = iWeeks + 4;
            }

        }

        let sUOM = 'EA';                 // Unit Of Measure
        var sIBPOptionPercent = await GenF.getSystemConfig('IBP_OPTION_PERCENT')
        // var demandField = sIBPOptionPercent === "No" ? "STATISTICALFCSTQTY" : "TOTALDEMANDOUTPUT";
        // Fetch IBP demand
console.log("lilocProd", lilocProd.length);        
        for (let iloc = 0; iloc < lilocProd.length; iloc++) {
            const { LOCATION_ID, PRODUCT_ID, VERSION, SCENARIO } = lilocProd[iloc];
            let existingData = await cds.run(`
                SELECT *
                FROM "CP_IBP_FUTUREDEMAND"
                WHERE LOCATION_ID = '${LOCATION_ID}'
                AND VERSION = '${VERSION}'
                AND SCENARIO = '${SCENARIO}'
                AND PRODUCT_ID = ('${PRODUCT_ID}')
              `);

            sUOM = 'EA';
            //     let lsCustomer = await SELECT.one
            //         .from('V_SALES_H')
            //         .columns('CUSTOMER_GROUP')
            //         .where(`PRODUCT_ID = '${lilocProd[iloc].PRODUCT_ID}' AND LOCATION_ID = '${lilocProd[iloc].LOCATION_ID}'`);

            //     // If the sales history does not exists for location-product , continue with the next iteration

            //     if (lsCustomer === null) {
            //         continue;
            //     }

            lsData.LOCATION_ID = lilocProd[iloc].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[iloc].PRODUCT_ID;
            ///
            lsData.VERSION = lilocProd[iloc].VERSION;
            if (lilocProd[iloc].SCENARIO === "_PLAN") {
                lsData.SCENARIO = "";
            } else {
                lsData.SCENARIO = lilocProd[iloc].SCENARIO;
            }
            //MAPPING DATA FOR IMPORT PRODUCT DEMAND


            let  selectClause1 = aMappedKeys.filter(f => f !== "CUSTID");
            selectClause1 = selectClause1.join(',')
            tempweek = aTableData.filter(e => e.BTP_FIELD == "WEEK_DATE")
            if (tempweek.length > 0) {
                ConfigWeek = tempweek[0].MAPPING_FIELD
            }
           

            

            let resUrl = `/${sPlan}?$select=${selectClause1}&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and ${ConfigWeek} gt datetime'${vFromDate}' and ${ConfigWeek} lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
            ///
            // Request URL to IBP
            // // let resUrl = "/" + liParaValue[0].VALUE + "?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP gt datetime'" + vFromDate + "' and PERIODID4_TSTAMP lt datetime'" + vToDate + "' and UOMTOID eq 'EA' and CUSTID eq '" + lsCustomer.CUSTOMER_GROUP + "'";
            // let resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq 'EA' and CUSTID eq '${lsCustomer.CUSTOMER_GROUP}'`;
            // let resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
            //VP-1419
            // let resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,${demandField},UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;

            request.headers['Application-Interface-Key'] = vAIRKey;
            console.log(request.headers);

            let req = await service.tx(request).get(resUrl);
            // If Future Demand does not exists for UOM 'EA', Fetching for 'PC'
            if (req === undefined || req.length === 0) {
                sUOM = 'PC';
                resUrl = `/${sPlan}?$select=${selectClause1}&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and ${ConfigWeek} ge datetime'${vFromDate}' and ${ConfigWeek} le datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
                //VP-1419
                // resUrl = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,PERIODID4_TSTAMP,${demandField},UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
                req = await service.tx(request).get(resUrl);
            }
            console.log("Step 4 Future Demand Data" + req.length);
            if(req.length > 0){
             vDelDate = new Date(vFromDateT);
             vDateDeld = vDelDate.toISOString().split('T')[0];
console.log("vDelDate", vDelDate);             
console.log("vDateDeld", vDateDeld);             
            try {
                await DELETE.from("CP_IBP_FUTUREDEMAND")
                    .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                            AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                            AND VERSION = '${lsData.VERSION}'
                            AND SCENARIO = '${lilocProd[iloc].SCENARIO}'
                            AND WEEK_DATE >= '${vDateDeld}'
                            `);
                await DELETE.from("CP_IBP_FUTUREDEMAND_LOCPRODCUST")
                    .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                                    AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                                    AND VERSION = '${lsData.VERSION}'
                                    AND SCENARIO = '${lilocProd[iloc].SCENARIO}'
                                    AND WEEK_DATE >= '${vDateDeld}'
                                    `);
            } catch (e) {
                //Do nothing
            }
            console.log("Step 5 Deleted Future Demand for Loc Product " + lsData);
            } else {
                console.log("Step 5 No data to Deleted Future Demand for Loc Product " + lsData);
            }
            // Convert date to ISO
            const dateJSONToEDM = jsonDate => {
                const content = /\d+/.exec(String(jsonDate));
                const timestamp = content ? Number(content[0]) : 0;
                const date = new Date(timestamp);
                const string = date.toISOString().split('T')[0];
                return string;
            };
            flag = "";
              let  selectClause = aMappedKeys.join(',')
        
            
            let resUrlCust = `/${sPlan}?$select=${selectClause}&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and ${ConfigWeek} ge datetime'${vFromDate}' and ${ConfigWeek} le datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
            // let resUrlCust = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,CUSTID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP ge datetime'${vFromDate}' and PERIODID4_TSTAMP le datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
            //VP-1419
            // let resUrlCust = `/${liParaValue[0].VALUE}?$select=PRDID,LOCID,CUSTID,PERIODID4_TSTAMP,${demandField},UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq '${sUOM}'`;
            let reqCust = await service.tx(request).get(resUrlCust);

            let iFutureDemandCust = [];
            let sFutureDemandCust = {};
           

            let temp = aTableData.filter(e => e.BTP_FIELD == "QUANTITY")
            if (temp.length > 0) {
                QuantityField = temp[0].MAPPING_FIELD
            }
console.log("Line 5190", reqCust);

            // Loop request to insert into
            for (let i in reqCust) {
                let vWeekDate = dateJSONToEDM(reqCust[i][ConfigWeek]).split("T")[0];
                vWeekDate = new Date(vWeekDate);
                vWeekDate = GenF.getNextMondayCmp(vWeekDate);
                // if (dateJSONToEDM([i].PERIODID4_TSTAMP) >= vDateDeld) {
console.log("vWeekDate", vWeekDate)                
console.log("vDateDeld", vDateDeld)                
                if (vWeekDate >= vDateDeld) {
                    sFutureDemandCust = {};
                    sFutureDemandCust["LOCATION_ID"] = GenF.parse(reqCust[i].LOCID);
                    sFutureDemandCust["PRODUCT_ID"] = GenF.parse(reqCust[i].PRDID);
                    sFutureDemandCust["CUSTOMER_GROUP"] = GenF.parse(reqCust[i].CUSTID);
                    sFutureDemandCust["VERSION"] = GenF.parse(reqCust[i].VERSIONID);
                    if (reqCust[i].SCENARIOID === "" || reqCust[i].SCENARIOID === null) {
                        sFutureDemandCust["SCENARIO"] = GenF.parse("_PLAN");
                    } else {
                        sFutureDemandCust["SCENARIO"] = GenF.parse(reqCust[i].SCENARIOID);
                    }
                    sFutureDemandCust["WEEK_DATE"] = GenF.parse(vWeekDate);
                    // sFutureDemandCust["QUANTITY"] = GenF.parse(reqCust[i].TOTALDEMANDOUTPUT);
                    sFutureDemandCust["QUANTITY"] = GenF.parse(reqCust[i][QuantityField]);
                    // VP-1419
                    // sFutureDemandCust["QUANTITY"] = GenF.parse(reqCust[i].STATISTICALFCSTQTY);
                    iFutureDemandCust.push(GenF.parse(sFutureDemandCust));
                }
            }
console.log("iFutureDemandCust", iFutureDemandCust.length);
console.log("iFutureDemandCust", iFutureDemandCust);
            if (iFutureDemandCust.length > 0) {
                await INSERT.into("CP_IBP_FUTUREDEMAND_LOCPRODCUST").entries(iFutureDemandCust);
                console.log("Step 6.1 Successfully imported Future Demand for Loc Product Customer " + lsData);
                // flag = "D";
            }
            let iFutureDemand = [];
            let sFutureDemand = {};


                const result = Object.values(
                iFutureDemandCust.reduce((acc, row) => {
                    // group by everything EXCEPT customer group
                    const key = `${row.LOCATION_ID}|${row.PRODUCT_ID}|${row.VERSION}|${row.SCENARIO}|${row.WEEK_DATE}`;

                    if (!acc[key]) {
                    acc[key] = {
                        LOCATION_ID: row.LOCATION_ID,
                        PRODUCT_ID: row.PRODUCT_ID,
                        VERSION: row.VERSION,
                        SCENARIO: row.SCENARIO,
                        WEEK_DATE: row.WEEK_DATE,
                        QUANTITY: 0
                    };
                    }

                    acc[key].QUANTITY += Number(row.QUANTITY); // sum quantities
                    return acc;
                }, {})
                );

console.log(result);

iFutureDemand = result;

// console.log("Line 5225", req)
//             // Loop request to insert into
//             for (let i in req) {
//                 let vWeekDate = dateJSONToEDM(req[i][ConfigWeek]).split("T")[0];
// console.log("Line 5229", vWeekDate)
//                 vWeekDate = new Date(vWeekDate);
//                 vWeekDate = GenF.getNextMondayCmp(vWeekDate);
// console.log("Line 5231", vWeekDate)
//                 // if (dateJSONToEDM(req[i].PERIODID4_TSTAMP) >= vDateDeld) {
//                 if (vWeekDate >= vDateDeld) {
//                     sFutureDemand = {};
//                     sFutureDemand["LOCATION_ID"] = GenF.parse(req[i].LOCID);
//                     sFutureDemand["PRODUCT_ID"] = GenF.parse(req[i].PRDID);
//                     sFutureDemand["VERSION"] = GenF.parse(req[i].VERSIONID);
//                     if (req[i].SCENARIOID === "" || req[i].SCENARIOID === null) {
//                         sFutureDemand["SCENARIO"] = GenF.parse("_PLAN");
//                     } else {
//                         sFutureDemand["SCENARIO"] = GenF.parse(req[i].SCENARIOID);
//                     }
//                     sFutureDemand["WEEK_DATE"] = GenF.parse(vWeekDate);
//                     sFutureDemand["QUANTITY"] = GenF.parse(req[i][QuantityField]);
//                     //VP-1419
//                     // sFutureDemand["QUANTITY"] = GenF.parse(req[i].STATISTICALFCSTQTY);

//                     iFutureDemand.push(GenF.parse(sFutureDemand));
//                 }
//             }
console.log("Line 5252", iFutureDemand.length)
            if (iFutureDemand.length > 0) {
                await INSERT.into("CP_IBP_FUTUREDEMAND").entries(iFutureDemand);
                const weekDatesArr = await generateAlertLog(iFutureDemand, existingData);
                if (weekDatesArr.length > 0) {
                    const alertLog = [{
                        MSGTXT: [...new Set(weekDatesArr)].sort().join(', '),
                        MSGID: 'S07',
                        APPL: 'VCPLANNER',
                        MSGGRP: 'DATA',
                        LOCATION_ID: LOCATION_ID,
                        PRODUCT_ID: PRODUCT_ID,
                        PARA2: VERSION,
                        PARA3: SCENARIO,
                    }]
                    await GenF.sendAlert('C', alertLog, request);
                }
                flag = "D";
                console.log("Step 6.2 Successfully imported Future Demand for Loc Product " + lsData);
            }
            //check from system configurations, skip Option percentages if its No
            if (sIBPOptionPercent == 'No') {
                flag = 'S';
            }
            if (flag === "D") {
                flag = "";
                let resUrlFplan;
                const dateJSONToEDM = (jsonDate) => {
                    const content = /\d+/.exec(String(jsonDate));
                    const timestamp = content ? Number(content[0]) : 0;
                    const date = new Date(timestamp);
                    const string = date.toISOString();
                    return string;
                };

                if (aDates.length > 0) {
                    for (let k = 0; k < aDates.length; k++) {
                        GenF.log(`Import Started: IBP Option Percent for Week Dates ${aDates[k].vFromDate} To ${aDates[k].vToDate}`);
                        // iFCharPlan = [];

                        // resUrlFplan = `/${liParaValue[0].VALUE}?$select=PERIODID4_TSTAMP,PRDID,LOCID,CUSTID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and PERIODID4_TSTAMP gt datetime'${vFromDate}' and PERIODID4_TSTAMP lt datetime'${vToDate}' and UOMTOID eq 'EA' and CUSTID eq '${lsCustomer.CUSTOMER_GROUP}'&$inlinecount=allpages`;
                        resUrlFplan = `/${sPlan}?$select=${ConfigWeek},PRDID,LOCID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '${lsData.LOCATION_ID}' and PRDID eq '${lsData.PRODUCT_ID}' and VERSIONID eq '${lsData.VERSION}' and SCENARIOID eq '${lsData.SCENARIO}' and ${ConfigWeek} ge datetime'${aDates[k].vFromDate}' and ${ConfigWeek} le datetime'${aDates[k].vToDate}' and UOMTOID eq '${sUOM}' &$inlinecount=allpages`;

                        request.headers['Application-Interface-Key'] = vAIRKey;
                        console.log(request.headers);
                        let req = await service.tx(request).get(resUrlFplan);
                          vDelDate = new Date(vFromDateT);
                          vDateDel = vDelDate.toISOString().split("T")[0];

                        console.log("Step 7 Future Char Plan Data: " + req.length);

                        // await DELETE.from("CP_IBP_FCHARPLAN")
                        //     .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                        //               AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                        //               AND VERSION = '${lsData.VERSION}'
                        //               AND SCENARIO = '${lilocProd[iloc].SCENARIO}'`);

                        let iFCharPlan = [];
                        let sFcharPlan = {};

                        for (let i in req) {
                            let vWeekDate = dateJSONToEDM(req[i][ConfigWeek]).split("T")[0];
                            vWeekDate = new Date(vWeekDate);
                            vWeekDate = GenF.getNextMondayCmp(vWeekDate);

                            // Delete FCHAR_PLAN based on Weekdates
                            await DELETE.from("CP_IBP_FCHARPLAN")
                                .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                              AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                              AND VERSION = '${lsData.VERSION}'
                              AND SCENARIO = '${lilocProd[iloc].SCENARIO}'
                              AND WEEK_DATE = '${vWeekDate}'`);

                            if (req[i].SCENARIOID === "" || req[i].SCENARIOID === null) {
                                vScenario = "_PLAN";
                            } else {
                                vScenario = req[i].SCENARIOID;
                            }
                            let vManualOpt = parseFloat("0.00").toFixed(2);
                            if (req[i].MANUALOPTION !== "" && req[i].MANUALOPTION !== null) {
                                vManualOpt = parseFloat(req[i].MANUALOPTION).toFixed(2);
                            }
                            req[i][ConfigWeek] = vWeekDate;

                            if (vWeekDate >= vDateDel) {
                                sFcharPlan = {};
                                sFcharPlan["LOCATION_ID"] = GenF.parse(req[i].LOCID);
                                sFcharPlan["PRODUCT_ID"] = GenF.parse(req[i].PRDID);
                                sFcharPlan["CLASS_NUM"] = GenF.parse(req[i].VCCLASS);
                                sFcharPlan["CHAR_NUM"] = GenF.parse(req[i].VCCHAR);
                                //Patch to store charvalue if MAP_CHARVALUE_CHARVALNUM is Yes from System Configuration
                                const charObj = {
                                    CLASS_NUM: sFcharPlan["CLASS_NUM"],
                                    CHAR_NUM: sFcharPlan["CHAR_NUM"],
                                    CHARVAL_NUM: GenF.parse(req[i].VCCHARVALUE)
                                }
                                sFcharPlan["CHARVAL_NUM"] = await GenF.mapCharValue(charObj, 'I');
                                // sFcharPlan["CHARVAL_NUM"] = GenF.parse(req[i].VCCHARVALUE);
                                sFcharPlan["VERSION"] = GenF.parse(req[i].VERSIONID);
                                sFcharPlan["SCENARIO"] = GenF.parse(vScenario);
                                sFcharPlan["WEEK_DATE"] = GenF.parse(vWeekDate);
                                sFcharPlan["OPT_PERCENT"] = GenF.parse(parseFloat(req[i].OPTIONPERCENTAGE).toFixed(2));
                                sFcharPlan["OPT_QTY"] = GenF.parse(parseFloat(req[i].FINALDEMANDVC).toFixed(3));
                                sFcharPlan["MANUALOPTION"] = GenF.parse(vManualOpt);
                                iFCharPlan.push(GenF.parse(sFcharPlan));
                            }
                        }

                        if (iFCharPlan.length > 0) {
                            const tx = cds.tx(request);
                            //Patch for option percentage sum Greater than 100
                            iFCharPlan = await GenF.optionPercentageCheck(iFCharPlan);
                            // await tx.run(INSERT.into("CP_IBP_FCHARPLAN").entries(iFCharPlan)).then(tx.commit);
                            await cds.run(INSERT.into("CP_IBP_FCHARPLAN").entries(iFCharPlan));
                            console.log("Step 8 Successfully imported Future Char Plan Data:  " + req.length);
                            flag = "S";
                        }

                        GenF.log(`Import Completed: IBP Option Percent for Week Dates ${aDates[k].vFromDate} To ${aDates[k].vToDate}`);
                    }
                }
            }
            
            if (flag === "S") {
                lMessage =
                    lMessage +
                    " " +
                    "Import of IBP Demand and Future char.plan data is successfull for product" +
                    lsData.PRODUCT_ID;
            } else if (req.length === 0) {
                lMessage = lMessage + ' ' + "Future Demand does not exists for product" + lsData.PRODUCT_ID;
            } else {
                lMessage = lMessage + ' ' + "Import of IBP Demand and Future char.plan data has failed for product" + lsData.PRODUCT_ID;
                let sLog = "Import of IBP Demand and Future char.plan data has failed for product" + lsData.PRODUCT_ID;
                aErrorLog.push(sLog);
            }
        }
        if (aErrorLog.length == lilocProd.length) {
            await GenF.jobSchMessage('', aErrorLog.toString(), request);
        } else { //Success
            await GenF.jobSchMessage('X', lMessage, request);
        }
        //OLD
        // await GenF.jobSchMessage('X', lMessage, request);
    });


    // Generate Forcast order
    this.on("exportIBPCIR", async (request) => {

        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
        let oReq = {
            cir: [],
        },
            oReqProdDmnd = {
                cirproddmnd: [],
            },
            lMessage = '',
            vCIR;

        let aErrorLog = [];
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started exporting CIR to IBP";
        var sError='';
        let res = request._.req.res;
        let lilocProdReq = JSON.parse(request.data.LocProdData);
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;

            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
            for (let i = 0; i < lilocProd.length; i++) {
                lilocProd.VERSION = lilocProdReq[0].VERSION;
                lilocProd.SCENARIO = lilocProdReq[0].SCENARIO;
            }
        } else {
            lilocProd = JSON.parse(request.data.LocProdData);
        }
        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });
        for (let iloc = 0; iloc < lilocProd.length; iloc++) {
            flag = ' ';
            oReq = {
                cir: [],
            };
            oReqProdDmnd = {
                cirproddmnd: [],
            };
            lsData.LOCATION_ID = lilocProd[iloc].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[iloc].PRODUCT_ID;
            lsData.VERSION = lilocProd[iloc].VERSION;
            lsData.SCENARIO = lilocProd[iloc].SCENARIO;

            // CIR Demand at Characteristics Level
            const licir = await cds.run(
                `
                SELECT *
                   FROM "V_CIRTOIBP" 
                   WHERE LOCATION_ID = '` + lsData.LOCATION_ID + `'
                              AND PRODUCT_ID = '` + lsData.PRODUCT_ID + `'
                              AND VERSION = '` + lsData.VERSION + `'
                              AND SCENARIO = '` + lsData.SCENARIO + `'
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
                                                  AND A.VERSION = '${lsData.VERSION}'
                                                  AND A.SCENARIO = '${lsData.SCENARIO}'
                                                  AND A.MODEL_VERSION = 'Active'
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
                //in above CHARVAL_NUM  is actually CHAR_VALUE  , replace  CHAR_VALUE with CHARVAL_NUM  if MAP_CHARVALUE_CHARVALNUM is Yes from System Configuration
                const charObj = {
                    CLASS_NUM: vCIR["VCCLASS"],
                    CHAR_NUM: vCIR["VCCHAR"],
                    CHARVAL_NUM: vCIR["VCCHARVALUE"]
                }
                vCIR.VCCHARVALUE = await GenF.mapCharValue(charObj, 'E');
                oReq.cir.push(vCIR);
            }

            let sScenario = lsData.SCENARIO;
            if (lsData.SCENARIO == '_PLAN') {
                sScenario = ""
            }

            if (oReqProdDmnd.cirproddmnd.length > 0) {
                let vTransID = new Date().getTime().toString();
                let oEntry = {
                    "Transactionid": vTransID,
                    "AggregationLevelFieldsString": "LOCID,PRDID,PRODFORECASTORDERQTY,PERIODID4_TSTAMP",
                    "DoCommit": true,
                    "VersionID": lsData.VERSION,
                    "ScenarioID": sScenario
                }
                oEntry[lData] = oReqProdDmnd.cirproddmnd;
                try {
                    request.headers['Application-Interface-Key'] = vAIRKey;
                    await service.tx(request).post(lEntity, oEntry);
                    flag = 'X';
                } catch (err) {
                    console.log(err);
                    flag = ' ';
                }
            }

            let chunksList = [];
            // if (oReq.cir.length > 0) {
            if (oReq.cir.length > 0 && flag === 'X') {
                flag = ' ';
                let vTransID = new Date().getTime().toString();
                if (oReq.cir.length > 5000) {
                    let iChnk, iChkCounter = 0;
                    // Initialize Parallel processing
                    let resUrlPP = "/InitiateParallelProcess?ScenarioID=''&VersionID=''&PlanningArea='" + liParaValue[0].VALUE + "'&Transactionid='" + vTransID + "'";
                    try {
                        await service.tx(request).post(resUrlPP);
                    } catch (e) {
                        console.log(e);
                    }
                    // Divide into multiple arrays with each array length as 5000
                    let aData = oReq.cir;
                    chunksList = [];
                    const chunkSize = 5000;
                    for (let i = 0; i < aData.length; i += chunkSize) {
                        const chunk = aData.slice(i, i + chunkSize)
                        chunksList.push(chunk);
                    }
                    //Process each chuck
                    for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
                        let oEntry = {
                            "Transactionid": vTransID,
                            "AggregationLevelFieldsString": "LOCID,PRDID,VCCLASS,VCCHAR,VCCHARVALUE,FORECASTORDERQTY,PERIODID4_TSTAMP",
                            "VersionID": lsData.VERSION,
                            "ScenarioID": sScenario
                        }
                        oEntry[lData] = chunksList[iChnk];
                        try {
                            request.headers['Application-Interface-Key'] = vAIRKey;
                            await service.tx(request).post(lEntity, oEntry);
                            iChkCounter = iChkCounter + 1;
                        } catch (err) {
                            console.log(err);
                            flag = ' ';
                        }
                    }
                    // If all are successfull commit the request
                    if (iChkCounter > 0) {
                        console.log("Chunks count:" + iChkCounter);
                        let resUrlPPCommit = "/commit?P_TransactionID='" + vTransID + "'&$format=json";
                        try {
                            await service.tx(request).post(resUrlPPCommit);
                            lMessage + ' ' + 'Export of CIR to IBP is successful for product and Characteristics of: ' + lsData.PRODUCT_ID;
                            flag = 'X';
                        } catch (e) {
                            console.log("Error while committing the parallel processing");
                             sError=' Reason: '+e.message;
                            flag = '';
                        }
                    }
                    if (flag === 'X') {
                        lMessage = lMessage + ' ' + "Export of CIR to IBP is successful for product and Characteristics of: " + lsData.PRODUCT_ID;
                    } else {
                        lMessage = lMessage + ' ' + "Export of CIR to IBP is successful for product and failed at Characteristics of: " + lsData.PRODUCT_ID+sError;
                        let sLog = "Export of CIR to IBP is successful at product and failed for Characteristics of: " + lsData.PRODUCT_ID+sError;
                        aErrorLog.push(sLog);
                    }
                } else {
                    let oEntry = {
                        "Transactionid": vTransID,
                        "AggregationLevelFieldsString": "LOCID,PRDID,VCCLASS,VCCHAR,VCCHARVALUE,FORECASTORDERQTY,PERIODID4_TSTAMP",
                        "DoCommit": true,
                        "VersionID": lsData.VERSION,
                        "ScenarioID": sScenario
                    }
                    oEntry[lData] = oReq.cir;
                    try {
                        request.headers['Application-Interface-Key'] = vAIRKey;
                        await service.tx(request).post(lEntity, oEntry);
                        flag = 'X';
                    } catch (err) {
                        sError=' Reason: '+err.message;
                        flag = ' ';
                    }


                    if (flag === 'X') {
                        lMessage = lMessage + ' ' + "Export of CIR to IBP is successful for product and Characteristics of: " + lsData.PRODUCT_ID;
                    } else {
                        lMessage = lMessage + ' ' + "Export of CIR to IBP is successful for product and failed at Characteristics of: " + lsData.PRODUCT_ID+sError;
                        let sLog = "Export of CIR to IBP is successful at product and failed for Characteristics of: " + lsData.PRODUCT_ID+sError;
                        aErrorLog.push(sLog);
                    }
                }
            } else {
                lMessage = lMessage + ' ' + "Export of CIR to IBP is unsuccessful for product: " + lsData.PRODUCT_ID + " beacuse of insufficient data ";
                // let sLog = "Export of CIR to IBP is unsuccessful for product: " + lsData.PRODUCT_ID + " beacuse of insufficient data ";
                // aErrorLog.push(sLog);
            }
            // return "S";
            //OLD
            // await GenF.jobSchMessage('X', lMessage, request);
        }
        //
        if (aErrorLog.length === lilocProd.length) { //Failed
            await GenF.jobSchMessage('', aErrorLog.toString(), request);
        } else { //success
            await GenF.jobSchMessage('X', lMessage, request);
        }
    });
    // Create Locations in IBP
    this.on("exportRestrDetails", async (req) => {

        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[1].VALUE.toString() + "RESTRICTION";
        let lEntity = "/" + liParaValue[1].VALUE.toString() + "RESTRICTIONTrans";
        let lEntityLoc = "/" + liParaValue[1].VALUE.toString() + "LOCRESTRICTIONTrans";
        let vFlag = '';

        await GenF.logMessage(req, `Started exporting Restriction header`);
        let oReq = await obibpfucntions.exportRtrHdrDet(req);
        if (oReq.rtrhdr.length > 0) {
            let vTransID = new Date().getTime().toString();
            let vTransID2 = new Date().getTime().toString();
            let oEntry = {
                "TransactionID": vTransID,
                "RequestedAttributes": "VCRESTRICTIONID,VCRESTRICTIONDESC,VCRESTRICTIONTYPE",
                "DoCommit": true
            }
            oEntry[lData] = oReq.rtrhdr;
            let oEntry2 = {
                "TransactionID": vTransID2,
                "RequestedAttributes": "LOCID,VCRESTRICTIONID,VCPLACEHOLDER",
                "DoCommit": true
            }
            oEntry2[lData] = oReq.locrtr;
            try {
                req.headers['Application-Interface-Key'] = vAIRKey;
                await servicePost.tx(req).post(lEntity, oEntry);
                await servicePost.tx(req).post(lEntityLoc, oEntry2);
                vFlag = 'S';
            } catch (e) {
                vFlag = '';
            }
            if (vFlag === 'S') {
                await GenF.jobSchMessage('X', "Export Restriction header details is successful ", req);
            } else {
                await GenF.jobSchMessage('', "Export Restriction header details has failed", req);
            }
        }
    });
    this.on("exportMktAuth", async (request) => {

        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
        let oReq = {
            mktauth: [],
        },
            vMktauth, vFlag = '',
            lMessage = '',
            lRtrnflag;

        // Generating payload for job scheduler logs
        let lilocProd = {},
            aReturn = {};
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started exporting Market authorization";
        let res = request._.req.res;
        let lilocProdReq = JSON.parse(request.data.LocProdData);
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            lsData = {};
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        } else {
            lilocProd = JSON.parse(request.data.LocProdData);
        }
        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });
        for (let i = 0; i < lilocProd.length; i++) {
            lsData = {};
            lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
            await obibpfucntions.exportMarketauthIBP(lilocProd[i], request, service, servicePost, aReturn)
            lMessage = aReturn.Message;
            lRtrnflag = aReturn.Success;
            if (lRtrnflag === 'S') {
                lMessage = lMessage + ' ' + "Export of Market authorization is successfull for product" + lsData.PRODUCT_ID;
                vFlag = 'S';
            } else {
                vFlag = '';
                lMessage = lMessage + ' ' + "Export of Market authorization has failed for product" + lsData.PRODUCT_ID;
            }
        }
        await GenF.jobSchMessage('X', lMessage, request);
    });
    // Generate Market auth for the changes in IBP on a Location, Product and Week Date
    this.on("generateMarketAuth", async (request) => {
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
        let flag, lMessage = '';

        // Generating payload for job scheduler logs
        let lVersion, lScenario, vFromDate, vToDate;
        let vScen = '',
            resUrl;
        let req;
        let lilocProd = {};
        let lsData = {},
            lsFchar = {},
            liFchar = [];
        let oReq = {
            mktauth: [],
        };
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing IBP Future Demand and Characteristic Plan";
        let res = request._.req.res;
        let lilocProdReq = JSON.parse(request.data.MARKETDATA);
        // Get Plannng area and Prefix

        // Handle service for both ALL and Selected projects
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        } else {
            lilocProd = JSON.parse(request.data.MARKETDATA);
        }
        // Acknowledge Job scheduler for the inputs selected
        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });

        lsData = {};

        let oResponse = await obibpfucntions.importVerScen(request);
        if (oResponse.flag === 'S') {
            lMessage = "Successfully imported version scenario from IBP";
            console.log(lMessage);
        } else {
            lMessage = "Failed to import version scenario from IBP";
            console.log(lMessage);
        }
        flag = '';
        lMessage = '';
        // Fetch OPtion percentages for a location product and weekDate
        for (let iloc = 0; iloc < lilocProd.length; iloc++) {
            lsData.LOCATION_ID = lilocProd[iloc].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[iloc].PRODUCT_ID;
            lVersion = lilocProdReq[0].VERSION;
            lScenario = lilocProdReq[0].SCENARIO;
            vFromDate = new Date(lilocProdReq[0].FROMDATE).toISOString().split('Z')[0];
            vToDate = new Date(lilocProdReq[0].TODATE).toISOString().split('Z')[0];
            if (lScenario === '') {
                resUrl = "/" + liParaValue[0].VALUE + "?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP gt datetime'" + vFromDate + "' and PERIODID4_TSTAMP lt datetime'" + vToDate + "' and VERSIONID eq '" + lVersion + "' and UOMTOID eq 'EA' and FINALDEMANDVC gt 0&$inlinecount=allpages";
            } else {
                resUrl = "/" + liParaValue[0].VALUE + "?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP gt datetime'" + vFromDate + "' and PERIODID4_TSTAMP lt datetime'" + vToDate + "' and VERSIONID eq '" + lVersion + "' and SCENARIOID eq '" + lScenario + "' and UOMTOID eq 'EA' and FINALDEMANDVC gt 0&$inlinecount=allpages";
            }
            // Request Option percentage at Product 
            try {
                request.headers['Application-Interface-Key'] = vAIRKey;
                req = await service.tx(request).get(resUrl);
            } catch (e) {
                lMessage = "Request to IBP failed for the requested inputs: " + lsData.LOCATION_ID + "," + lsData.PRODUCT_ID + "," + lVersion + "," + lScenario;
            }
            // Delete previous records from current date
            const vDelDate = new Date();
            const vDateDeld = vDelDate.toISOString().split('T')[0];
            try {
                await DELETE.from('CP_IBP_FUTUREDEMAND')
                    .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                            AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                            AND WEEK_DATE  < '${vDateDeld}'`);
            } catch (e) {
                //Do nothing
            }
            // }
            const dateJSONToEDM = jsonDate => {
                const content = /\d+/.exec(String(jsonDate));
                const timestamp = content ? Number(content[0]) : 0;
                const date = new Date(timestamp);
                const string = date.toISOString().split('T')[0];
                return string;
            };
            flag = '';
            for (let i in req) {
                let vWeekDate = dateJSONToEDM(req[i].PERIODID4_TSTAMP);
                vScen = ''
                if (req[i].SCENARIOID === '' || req[i].SCENARIOID === null) {
                    vScen = '_PLAN';
                } else {
                    vScen = req[i].SCENARIOID; //'BSL_SCENARIO';
                }
                req[i].PERIODID4_TSTAMP = vWeekDate;

                if (vWeekDate >= vDateDeld) {
                    // Delete existing record before updating
                    await cds.run(
                        `DELETE FROM "CP_IBP_FUTUREDEMAND" WHERE "LOCATION_ID" = '` + req[i].LOCID + `' 
                                                          AND "PRODUCT_ID" = '` + req[i].PRDID + `'
                                                          AND "VERSION" = '` + req[i].VERSIONID + `'
                                                          AND "SCENARIO" = '` + vScen + `'
                                                          AND "WEEK_DATE" = '` + vWeekDate + `'`
                    );
                    let modQuery = 'INSERT INTO "CP_IBP_FUTUREDEMAND" VALUES (' +
                        "'" + req[i].LOCID + "'" + "," +
                        "'" + req[i].PRDID + "'" + "," +
                        "'" + req[i].VERSIONID + "'" + "," +
                        "'" + vScen + "'" + "," +
                        "'" + vWeekDate + "'" + "," +
                        "'" + req[i].TOTALDEMANDOUTPUT + "'" + ')'; // + ' WITH PRIMARY KEY';
                    try {
                        await cds.run(modQuery);
                        flag = 'D';

                    } catch (err) {
                        console.log(err);
                    }
                }
            }

            //  Update Charactertic plan once demand is updated from IBP
            if (flag === 'D') {
                req = '';
                flag = '';
                let resUrlFplan;
                const dateJSONToEDM2 = jsonDate => {
                    const content = /\d+/.exec(String(jsonDate));
                    const timestamp = content ? Number(content[0]) : 0;
                    const date = new Date(timestamp);
                    const string = date.toISOString();
                    return string;
                };
                if (lScenario === '') {
                    // resUrlFplan = "/" + liParaValue[0].VALUE + "?$select=PERIODID4_TSTAMP,PRDID,LOCID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and VERSIONID eq '" + lVersion + "' and UOMTOID eq 'EA' and FINALDEMANDVC gt 0&$inlinecount=allpages";
                    resUrlFplan = "/" + liParaValue[0].VALUE + "?$select=PERIODID4_TSTAMP,PRDID,LOCID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP gt datetime'" + vFromDate + "' and PERIODID4_TSTAMP lt datetime'" + vToDate + "' and VERSIONID eq '" + lVersion + "' and UOMTOID eq 'EA' and FINALDEMANDVC gt 0&$inlinecount=allpages";
                } else {
                    resUrlFplan = "/" + liParaValue[0].VALUE + "?$select=PERIODID4_TSTAMP,PRDID,LOCID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP gt datetime'" + vFromDate + "' and PERIODID4_TSTAMP lt datetime'" + vToDate + "' and VERSIONID eq '" + lVersion + "' and SCENARIOID eq '" + lScenario + "' and UOMTOID eq 'EA' and FINALDEMANDVC gt 0&$inlinecount=allpages";
                }
                // Request Option percentage at VC
                try {

                    request.headers['Application-Interface-Key'] = vAIRKey;
                    req = await service.tx(request).get(resUrlFplan);
                } catch (e) {
                    lMessage = "Request to IBP failed for the requested inputs: " + lsData.LOCATION_ID + "," + lsData.PRODUCT_ID + "," + lVersion + "," + lScenario;
                }

                // Delete previous records before insert
                const vDelDate = new Date();
                const vDateDel = vDelDate.toISOString().split('T')[0];
                try {
                    await DELETE.from('CP_IBP_FCHARPLAN')
                        .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                            AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                            AND WEEK_DATE    < '${vDateDel}'`);
                } catch (e) {
                    //Do nothing
                }

                // Insert into Fchar plan
                for (let i in req) {
                    let vWeekDate = dateJSONToEDM2(req[i].PERIODID4_TSTAMP).split('T')[0];
                    if (req[i].SCENARIOID === '' || req[i].SCENARIOID === null) {
                        vScen = '_PLAN';
                    } else {
                        vScen = req[i].SCENARIOID; //'BSL_SCENARIO';
                    }
                    req[i].PERIODID4_TSTAMP = vWeekDate;
                    let vManualOpt = '0.0';
                    if (vWeekDate >= vDateDel) {
                        await cds.run(
                            `DELETE FROM "CP_IBP_FCHARPLAN" WHERE "LOCATION_ID" = '` + req[i].LOCID + `' 
                                                              AND "PRODUCT_ID" = '` + req[i].PRDID + `'
                                                              AND "CLASS_NUM" = '` + req[i].VCCLASS + `' 
                                                              AND "CHAR_NUM" = '` + req[i].VCCHAR + `' 
                                                              AND "CHARVAL_NUM" = '` + req[i].VCCHARVALUE + `' 
                                                              AND "VERSION" = '` + req[i].VERSIONID + `'
                                                              AND "WEEK_DATE" = '` + vWeekDate + `'`
                        );

                        let modQuery = 'INSERT INTO "CP_IBP_FCHARPLAN" VALUES (' +
                            "'" + req[i].LOCID + "'" + "," +
                            "'" + req[i].PRDID + "'" + "," +
                            "'" + req[i].VCCLASS + "'" + "," +
                            "'" + req[i].VCCHAR + "'" + "," +
                            "'" + req[i].VCCHARVALUE + "'" + "," +
                            "'" + req[i].VERSIONID + "'" + "," +
                            "'" + vScen + "'" + "," +
                            "'" + vWeekDate + "'" + "," +
                            "'" + req[i].OPTIONPERCENTAGE + "'" + "," +
                            "'" + req[i].FINALDEMANDVC + "'" + "," +
                            "'" + vManualOpt + "'" + ')'; // + ' WITH PRIMARY KEY';
                        try {
                            await cds.run(modQuery);
                            flag = 'S';
                            lsFchar = {};
                            lsFchar['LOCATION_ID'] = GenF.parse(req[i].LOCID);
                            lsFchar['PRODUCT_ID'] = GenF.parse(req[i].PRDID);
                            lsFchar['VERSION '] = GenF.parse(req[i].VERSIONID);
                            lsFchar['SCENARIO'] = GenF.parse(vScen);
                            lsFchar['WEEK_DATE'] = GenF.parse(vWeekDate);
                            liFchar.push(GenF.parse(lsFchar));
                            // obgenMktAuth.updateOptPer(req[i].LOCID, req[i].PRDID, vWeekDate, req[i].VERSIONID, vScen, request);
                        } catch (err) {
                            flag = 'E';
                            console.log(err);
                        }
                    }
                }
            }
        }
        // On success send Market authorizations to IBP
        if (flag === 'S' && liFchar.length > 0) {
            lsData = {};

            let Keys = ['LOCATION_ID', 'PRODUCT_ID', 'WEEK_DATE', 'VERSION', 'SCENARIO'];
            liFchar = GenF.removeDuplicate(liFchar, Keys);
            for (let cntChr = 0; cntChr < liFchar.length; cntChr++) {
                console.log(liFchar[cntChr].WEEK_DATE);
                await obgenMktAuth.updateOptPer(liFchar[cntChr].LOCATION_ID, liFchar[cntChr].PRODUCT_ID, liFchar[cntChr].WEEK_DATE, liFchar[cntChr].VERSION, liFchar[cntChr].SCENARIO, request);
            }

            for (let i = 0; i < lilocProd.length; i++) {
                lsData.LOCATION_ID = lilocProd[i].LOCATION_ID;
                lsData.PRODUCT_ID = lilocProd[i].PRODUCT_ID;
                const limkauth = await cds.run(
                    `
                SELECT CP_MARKETAUTH_CFG."WEEK_DATE",
                       CP_MARKETAUTH_CFG."LOCATION_ID",
                       CP_MARKETAUTH_CFG."PRODUCT_ID",
                       V_CHARVAL."CLASS_NUM",
                       CP_MARKETAUTH_CFG."CHAR_NUM",
                       CP_MARKETAUTH_CFG."CHARVAL_NUM",
                       CP_MARKETAUTH_CFG."LOCATION_ID",
                       CP_MARKETAUTH_CFG."PRODUCT_ID",
                       CP_MARKETAUTH_CFG."OPT_PERCENT",
                       CP_MARKETAUTH_CFG."VERSION",
                       CP_MARKETAUTH_CFG."SCENARIO"
                    FROM CP_MARKETAUTH_CFG
              INNER JOIN V_CHARVAL
                      ON CP_MARKETAUTH_CFG.CHAR_NUM  = V_CHARVAL.CHAR_NUM
                     AND CP_MARKETAUTH_CFG.CHARVAL_NUM  = V_CHARVAL.CHARVAL_NUM
                   WHERE LOCATION_ID = '${lsData.LOCATION_ID}'
                     AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                     AND VERSION = '${lilocProdReq[0].VERSION}'
                     AND ( WEEK_DATE > '${lilocProdReq[0].FROMDATE}'
                     AND WEEK_DATE < '${lilocProdReq[0].TODATE}' )
            `);
                for (imk = 0; imk < limkauth.length; imk++) {
                    let vDemd;
                    let vWeekDate = new Date(limkauth[imk].WEEK_DATE).toISOString().split('Z');

                    let vOpt = limkauth[imk].OPT_PERCENT.toString();
                    let vSrch = vOpt.search(".");
                    if (vSrch > 0) {
                        vDemd = vOpt.split('.')[0];
                    } else {
                        vDemd = vOpt;
                    }
                    vDemd = parseInt(vDemd) / 100;
                    vMktauth = {
                        "LOCID": limkauth[imk].LOCATION_ID,
                        "PRDID": limkauth[imk].PRODUCT_ID,
                        "VCCHAR": limkauth[imk].CHAR_NUM,
                        "VCCHARVALUE": limkauth[imk].CHARVAL_NUM,
                        "VCCLASS": limkauth[imk].CLASS_NUM,
                        "CUSTID": "NULL", //lisales[i].CUSTOMER_GROUP,
                        "PERIODID4_TSTAMP": vWeekDate[0],
                        "MARKETAUTHORIZATION": vDemd.toString()
                    };
                    oReq.mktauth.push(vMktauth);

                }
                if (oReq.mktauth.length > 0) {
                    let vTransID = new Date().getTime().toString();
                    let oEntry = {
                        "Transactionid": vTransID,
                        "AggregationLevelFieldsString": "PERIODID4_TSTAMP,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,LOCID,PRDID,MARKETAUTHORIZATION",
                        "VersionID": "",
                        "DoCommit": true,
                        "ScenarioID": ""
                    }
                    oEntry[lData] = oReq.mktauth;
                    try {
                        request.headers['Application-Interface-Key'] = vAIRKey;
                        await service.tx(request).post(lEntity, oEntry);
                        lMessage = lMessage + ' ' + "Export of Market authorization is successfull for product" + lsData.PRODUCT_ID;
                    } catch (error) {
                        lMessage = lMessage + ' ' + "Export of Market authorization has failed for product" + lsData.PRODUCT_ID;
                    }
                }
            }
        }
        // }
        // return lMessage;
        await GenF.jobSchMessage('X', lMessage, request);
    });

    this.on("importibpversce", async (request) => {
        let oResponse = await obibpfucntions.importVerScen(request);

        if (oResponse.flag === 'S') {
            lMessage = "Successfully imported version scenario from IBP";
            console.log(lMessage);
            return "Success";
        } else {
            lMessage = "Failed to import version scenario from IBP";
            console.log(lMessage);
            return "Failed";
        }
    });
  this.on("importIBPVersionScenarios", async (request) => {
        let oResponse = await obibpfucntions.importVerScen(request);

        if (oResponse.flag === 'S') {
            lMessage = "Successfully imported version scenario from IBP ";
            await GenF.jobSchMessage('X', lMessage, request);
        } else {
            lMessage = "Failed to import version scenario from IBP.Reason: "+oResponse.message;
            await GenF.jobSchMessage('', lMessage, request);
        }
    });
    // this.on("exportIBPAssembly", async (req) => {

    //     // Get Planning area and Prefix configurations for IBP
    //     let liParaValue = await GenF.getIBPParameterValue();
    //     let lData = "Nav" + liParaValue[1].VALUE.toString() + "LOCPRODCOMPONENT";
    //     let lEntity = "/" + liParaValue[1].VALUE.toString() + "LOCPRODCOMPONENTTrans";
    //     let lMasterDataType = liParaValue[1].VALUE.toString() + "LOCPRODCOMPONENT";
    //     let oReq = {
    //         masterProd: [],
    //     },
    //         lMessage,
    //         vmasterProd, flag = '',
    //         vBOMSource;
    //     let liComp = [];
    //     let chunksList = [];
    //     let chunkSize = 5000;
    //     // Fetch Multilevl BOM configuration check
    //     let vMBOMConfig = await GenF.getSystemConfig('MULTILEVEL_CONFIGPRODUCT');
    //     // fetch PVS configuration check
    //     const lsParamVal = await GenF.getParameterValue(req.data.LOCATION_ID, 19);
    //     if (lsParamVal === 'false' || lsParamVal === null) {
    //         // Get BOM for all Parital Prod and locations

    //         // liComp = await cds.run(
    //         //     `
    //         // SELECT DISTINCT CP_BOMHEADER.PRODUCT_ID,
    //         //                 CP_BOMHEADER.LOCATION_ID,
    //         //                 CP_BOMHEADER.COMPONENT,
    //         //                 '' AS STRUCNODE,
    //         //                 '' AS MRP_TYPE
    //         //           FROM "CP_BOMHEADER"
    //         //          WHERE CP_BOMHEADER.LOCATION_ID = '` + req.data.LOCATION_ID + `'
    //         //          ORDER BY COMPONENT`);
    //         liComp = await cds.run(
    //             `
    //         SELECT DISTINCT CP_BOMHEADER.PRODUCT_ID,
    //                         CP_BOMHEADER.LOCATION_ID,
    //                         CP_BOMHEADER.COMPONENT,
    //                         '' AS STRUCNODE
    //                   FROM "CP_BOMHEADER"
    //                  WHERE CP_BOMHEADER.LOCATION_ID = '` + req.data.LOCATION_ID + `'
    //                  ORDER BY COMPONENT`);

    //         //  INNER JOIN CP_CRITICAL_COMP
    //         //  ON CP_BOMHEADER.LOCATION_ID = CP_CRITICAL_COMP.LOCATION_ID
    //         // AND CP_BOMHEADER.PRODUCT_ID = CP_CRITICAL_COMP.PRODUCT_ID
    //         // AND CP_BOMHEADER.ITEM_NUM = CP_CRITICAL_COMP.ITEM_NUM
    //         // AND  CP_BOMHEADER.COMPONENT = CP_CRITICAL_COMP.ASSEMBLY

    //         //    AND CP_CRITICAL_COMP.ASSEMBLY_CRITICALKEY = 'X'
    //     } else {
    //         // Get BOM for all Parital Prod and locations

    //         // liComp = await cds.run(`
    //         // SELECT DISTINCT V_BOMPVS.PRODUCT_ID,
    //         //                 V_BOMPVS.LOCATION_ID,
    //         //                 V_BOMPVS.COMPONENT,
    //         //                 V_BOMPVS.STRUC_NODE,
    //         //                 '' AS MRP_TYPE
    //         //           FROM "V_BOMPVS"
    //         //          WHERE V_BOMPVS.LOCATION_ID = '` + req.data.LOCATION_ID + `'
    //         //            AND V_BOMPVS.STRUC_NODE IS NOT NULL
    //         //          ORDER BY COMPONENT`);
    //         liComp = await cds.run(`
    //         SELECT DISTINCT V_BOMPVS.PRODUCT_ID,
    //                         V_BOMPVS.LOCATION_ID,
    //                         V_BOMPVS.COMPONENT,
    //                         V_BOMPVS.STRUC_NODE
    //                   FROM "V_BOMPVS"
    //                  WHERE V_BOMPVS.LOCATION_ID = '` + req.data.LOCATION_ID + `'
    //                    AND V_BOMPVS.STRUC_NODE IS NOT NULL
    //                  ORDER BY COMPONENT`);

    //         //  INNER JOIN CP_CRITICAL_COMP
    //         //  ON V_BOMPVS.LOCATION_ID = CP_CRITICAL_COMP.LOCATION_ID
    //         // AND V_BOMPVS.PRODUCT_ID = CP_CRITICAL_COMP.PRODUCT_ID
    //         // AND V_BOMPVS.ITEM_NUM = CP_CRITICAL_COMP.ITEM_NUM
    //         // AND  V_BOMPVS.COMPONENT = CP_CRITICAL_COMP.ASSEMBLY

    //         //   AND CP_CRITICAL_COMP.ASSEMBLY_CRITICALKEY = 'X'
    //     }

    //     console.log("selected product in export IBP assembly -" + req.data.PRODUCT_ID);

    //     if (vMBOMConfig === 'Yes') {
    //         liComp = [];
    //         console.log("Passing location and product");
    //         // liComp = await obibpfucntions.getAssemblyMBOMAssemblyHier(req.data.LOCATION_ID, req.data.PRODUCT_ID, liComp);
    //         liComp = await obibpfucntions.getAssemblyMBOMAssemblyHierNew(req.data.LOCATION_ID, req.data.PRODUCT_ID, liComp);
    //     }

    //     console.log("Generated Data");
    //     console.log(liComp);

    //     // Remove duplicates for IBP export as Different structure node to a Assembly Item is causing an issue
    //     let Keys = ['LOCATION_ID', 'PRODUCT_ID', 'COMPONENT'];
    //     liComp = GenF.removeDuplicate(liComp, Keys);

    //     // const lipartialprod = await cds.run(
    //     //     `
    //     //     SELECT DISTINCT PRODUCT_ID,
    //     //         LOCATION_ID,
    //     //         PROD_DESC,
    //     //         REF_PRODID
    //     //     FROM "CP_PARTIALPROD_INTRO"
    //     //     WHERE LOCATION_ID = '` + req.data.LOCATION_ID + `'
    //     //     AND CONFIGPROD_CHK IS NULL
    //     //     ORDER BY REF_PRODID`);

    //     const lipartialprod = await cds.run(`
    //                                             SELECT DISTINCT CP_PARTIALPROD_INTRO.PRODUCT_ID,
    //                                                             CP_PARTIALPROD_INTRO.LOCATION_ID,
    //                                                             CP_PARTIALPROD_INTRO.PROD_DESC,
    //                                                             CP_PARTIALPROD_INTRO.REF_PRODID,
    //                                                             CP_FACTORY_SALESLOC.LOCATION_ID AS DEMAND_LOCATION,
    //                                                             CP_FACTORY_SALESLOC.PLAN_LOC
    //                                                 FROM "CP_PARTIALPROD_INTRO"
    //                                                INNER JOIN CP_FACTORY_SALESLOC
    //                                                   ON CP_PARTIALPROD_INTRO.PRODUCT_ID = CP_FACTORY_SALESLOC.PRODUCT_ID
    //                                                  AND CP_PARTIALPROD_INTRO.LOCATION_ID = CP_FACTORY_SALESLOC.LOCATION_ID
    //                                                WHERE CP_FACTORY_SALESLOC.FACTORY_LOC = '${req.data.LOCATION_ID}'
    //                                                  AND CP_PARTIALPROD_INTRO.CONFIGPROD_CHK IS NULL
    //                                                 ORDER BY CP_PARTIALPROD_INTRO.REF_PRODID`);

    //     const liFactLoc = await cds.run(
    //         ` SELECT DISTINCT LOCATION_ID,
    //                           PLAN_LOC
    //                     FROM CP_FACTORY_SALESLOC
    //                     WHERE FACTORY_LOC = '` + req.data.LOCATION_ID + `'
    //                     AND LOCATION_ID <> '` + req.data.LOCATION_ID + `'
    //         `);

    //     // BOM Components
    //     for (let iComp = 0; iComp < liComp.length; iComp++) {
    //         // Source concatenation of Location and Product
    //         vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].PRODUCT_ID);
    //         let vStrucNode = liComp[iComp].STRUC_NODE;
    //         if (liComp[iComp].STRUC_NODE === undefined) {
    //             vStrucNode = '';
    //         }
    //         vmasterProd = {
    //             "LOCID": liComp[iComp].LOCATION_ID,
    //             "PRDID": liComp[iComp].PRODUCT_ID,
    //             "PRDFR": liComp[iComp].COMPONENT,
    //             "VCSTRUCTURENODE": vStrucNode, //liComp[iComp].STRUC_NODE,
    //             // "VCDMRPTYPE": liComp[iComp].MRP_TYPE,
    //             "VCSOURCEID": vBOMSource

    //         };
    //         oReq.masterProd.push(GenF.parse(vmasterProd));
    //         if (vMBOMConfig === 'No') {
    //             // Mapping for every demand location
    //             for (let i = 0; i < liFactLoc.length; i++) {
    //                 vmasterProd.LOCID = liFactLoc[i].LOCATION_ID;
    //                 // vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].PRODUCT_ID);
    //                 // vmasterProd = {
    //                 //     "LOCID": liFactLoc[i].LOCATION_ID,
    //                 //     "PRDID": liComp[iComp].PRODUCT_ID,
    //                 //     "PRDFR": liComp[iComp].COMPONENT,
    //                 //     "VCSTRUCTURENODE": vStrucNode, //liComp[iComp].STRUC_NODE,
    //                 //     "VCDMRPTYPE": liComp[iComp].MRP_TYPE,
    //                 //     "VCSOURCEID": vBOMSource
    //                 // };
    //                 oReq.masterProd.push(GenF.parse(vmasterProd));

    //                 if (liFactLoc[i].LOCATION_ID !== liFactLoc[i].PLAN_LOC) {
    //                     vmasterProd.LOCID = liFactLoc[i].PLAN_LOC;
    //                     // vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].PRODUCT_ID);
    //                     // vmasterProd = {
    //                     //     "LOCID": liFactLoc[i].PLAN_LOC,
    //                     //     "PRDID": liComp[iComp].PRODUCT_ID,
    //                     //     "PRDFR": liComp[iComp].COMPONENT,
    //                     //     "VCSTRUCTURENODE": vStrucNode, //liComp[iComp].STRUC_NODE,
    //                     //     "VCDMRPTYPE": liComp[iComp].MRP_TYPE,
    //                     //     "VCSOURCEID": vBOMSource
    //                     // };
    //                     oReq.masterProd.push(GenF.parse(vmasterProd));
    //                 }
    //             }
    //         }
    //         // Mapping Assembly to every Partial Product
    //         for (let iPartial = 0; iPartial < lipartialprod.length; iPartial++) {
    //             if (lipartialprod[iPartial].REF_PRODID === liComp[iComp].PRODUCT_ID &&
    //                 lipartialprod[iPartial].LOCATION_ID === liComp[iComp].LOCATION_ID &&
    //                 lipartialprod[iPartial].PRODUCT_ID !== liComp[iComp].PRODUCT_ID) {
    //                 vBOMSource = liComp[iComp].LOCATION_ID.concat('_', lipartialprod[iPartial].PRODUCT_ID);
    //                 vmasterProd.LOCID = liComp[iComp].LOCATION_ID;
    //                 vmasterProd.PRDID = lipartialprod[iPartial].PRODUCT_ID;
    //                 vmasterProd.VCSOURCEID = vBOMSource;
    //                 // vmasterProd = {
    //                 //     "LOCID": liComp[iComp].LOCATION_ID,
    //                 //     "PRDID": lipartialprod[iPartial].PRODUCT_ID,
    //                 //     "PRDFR": liComp[iComp].COMPONENT,
    //                 //     "VCSTRUCTURENODE": vStrucNode, //liComp[iComp].STRUC_NODE,
    //                 //     "VCDMRPTYPE": liComp[iComp].MRP_TYPE,
    //                 //     "VCSOURCEID": vBOMSource
    //                 // };
    //                 oReq.masterProd.push(GenF.parse(vmasterProd));

    //                 if (lipartialprod[iPartial].LOCATION_ID !== lipartialprod[iPartial].DEMAND_LOCATION) {
    //                     vmasterProd.LOCID = lipartialprod[iPartial].DEMAND_LOCATION;
    //                     oReq.masterProd.push(GenF.parse(vmasterProd));
    //                 }

    //                 if (lipartialprod[iPartial].DEMAND_LOCATION !== lipartialprod[iPartial].PLAN_LOC) {
    //                     vmasterProd.LOCID = lipartialprod[iPartial].PLAN_LOC;
    //                     oReq.masterProd.push(GenF.parse(vmasterProd));
    //                 }

    //                 // for (let i = 0; i < liFactLoc.length; i++) {
    //                 //     vmasterProd.LOCID = liFactLoc[i].LOCATION_ID;
    //                 //     // vBOMSource = liComp[iComp].LOCATION_ID.concat('_', lipartialprod[iPartial].PRODUCT_ID);
    //                 //     // vmasterProd = {
    //                 //     //     "LOCID": liFactLoc[i].LOCATION_ID,
    //                 //     //     "PRDID": lipartialprod[iPartial].PRODUCT_ID,
    //                 //     //     "PRDFR": liComp[iComp].COMPONENT,
    //                 //     //     "VCSTRUCTURENODE": vStrucNode
    //                 //     , //liComp[iComp].STRUC_NODE,
    //                 //     //     "VCDMRPTYPE": liComp[iComp].MRP_TYPE,
    //                 //     //     "VCSOURCEID": vBOMSource

    //                 //     // };
    //                 //     oReq.masterProd.push(GenF.parse(vmasterProd));
    //                 //     if (liFactLoc[i].LOCATION_ID !== liFactLoc[i].PLAN_LOC) {
    //                 //         vmasterProd.LOCID = liFactLoc[i].PLAN_LOC;
    //                 //         // vBOMSource = liComp[iComp].LOCATION_ID.concat('_', lipartialprod[iPartial].PRODUCT_ID);
    //                 //         // vmasterProd = {
    //                 //         //     "LOCID": liFactLoc[i].PLAN_LOC,
    //                 //         //     "PRDID": lipartialprod[iPartial].PRODUCT_ID,
    //                 //         //     "PRDFR": liComp[iComp].COMPONENT,
    //                 //         //     "VCSTRUCTURENODE": vStrucNode, //liComp[iComp].STRUC_NODE,
    //                 //         //     "VCDMRPTYPE": liComp[iComp].MRP_TYPE,
    //                 //         //     "VCSOURCEID": vBOMSource

    //                 //         // };
    //                 //         oReq.masterProd.push(GenF.parse(vmasterProd));
    //                 //     }
    //                 // }
    //             }
    //         }

    //         console.log(oReq.masterProd.length);

    //         if (oReq.masterProd.length >= 15000) {
    //             // let vKeysReq = ['LOCID', 'PRDID', 'PRDFR', 'VCSTRUCTURENODE', 'VCDMRPTYPE', 'VCSOURCEID'];
    //             let vKeysReq = ['LOCID', 'PRDID', 'PRDFR', 'VCSTRUCTURENODE', 'VCSOURCEID'];

    //             oReq.masterProd = GenF.removeDuplicate(oReq.masterProd, vKeysReq);

    //             let aData = oReq.masterProd;

    //             for (let i = 0; i < aData.length; i += chunkSize) {
    //                 let chunk = aData.slice(i, i + chunkSize)
    //                 chunksList.push(GenF.parse(chunk));
    //             }

    //             GenF.log(`Processed Assemblies Length ${oReq.masterProd.length}`);

    //             oReq.masterProd = [];
    //             aData = [];
    //         }

    //     }

    //     /** Code for Parallel Processing */
    //     let vTransID = new Date().getTime().toString();
    //     let vMDTyp = 'VCDLOCPRODCOMPONENT';
    //     let vFactoryLoc = req.data.LOCATION_ID + '%';
    //     if (oReq.masterProd.length > 0 || chunksList.length > 0) {

    //         // let vKeysReq = ['LOCID', 'PRDID', 'PRDFR', 'VCSTRUCTURENODE', 'VCDMRPTYPE', 'VCSOURCEID'];
    //         let vKeysReq = ['LOCID', 'PRDID', 'PRDFR', 'VCSTRUCTURENODE', 'VCSOURCEID'];

    //         oReq.masterProd = GenF.removeDuplicate(oReq.masterProd, vKeysReq);

    //         if (oReq.masterProd.length > 5000 || chunksList.length > 0) {

    //             let iChnk, iChkCounter = 0;
    //             // Initialize Parallel processing
    //             // let resUrlAsm = "/InitiateParallelProcess?PlanningArea='" + liParaValue[0].VALUE + "'&VersionID=''&MasterDataTypeID='" + lMasterDataType + "'&Transactionid='" + vTransID + "'&TransactionName='Assembly Master'";
    //             let resUrlAsm = "/InitiateParallelProcess?MasterDataTypeID='" + lMasterDataType + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
    //             try {
    //                 await servicePost.tx(req).post(resUrlAsm);
    //             } catch (e) {
    //                 console.log(e);
    //             }
    //             // Divide into multiple arrays with each array length as 5000
    //             chunked = true;
    //             let aData = oReq.masterProd;
    //             // chunksList = [];
    //             // const chunkSize = 5000;
    //             if (oReq.masterProd.length < 5000) {
    //                 chunkSize = oReq.masterProd.length;
    //             }
    //             for (let i = 0; i < aData.length; i += chunkSize) {
    //                 let chunk = aData.slice(i, i + chunkSize)
    //                 chunksList.push(GenF.parse(chunk));
    //             }

    //             if (chunksList.length > 0) {

    //                 aData = [];
    //                 oReq.masterProd = [];
    //                 // Process each chunk to IBP
    //                 for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
    //                     let oEntryASM = {
    //                         "TransactionID": vTransID,
    //                         // "RequestedAttributes": "LOCID,PRDID,PRDFR,VCSTRUCTURENODE,VCDMRPTYPE,VCSOURCEID"
    //                         "RequestedAttributes": "LOCID,PRDID,PRDFR,VCSTRUCTURENODE,VCSOURCEID"
    //                     }
    //                     oEntryASM[lData] = chunksList[iChnk];
    //                     // console.log(oEntryASM);
    //                     try {
    //                         req.headers['Application-Interface-Key'] = vAIRKey;
    //                         console.log(req.headers);
    //                         await servicePost.tx(req).post(lEntity, oEntryASM);
    //                         iChkCounter = iChkCounter + 1;
    //                     } catch (err) {
    //                         console.log(err);
    //                         // iChkCounter = 0;
    //                         // console.log(err.message);
    //                     }
    //                 }
    //             }
    //             // If all are successfull commit the request
    //             if (iChkCounter > 0) {
    //                 console.log("Chunks count:" + iChkCounter);
    //                 let resUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
    //                 try {
    //                     await servicePost.tx(req).post(resUrlPPCommit);
    //                     let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
    //                     let vResponse = await servicePost.tx(req).get(resUrl);
    //                     flag = 'X';
    //                 } catch (e) {
    //                     console.log(e);
    //                     console.log("Error while committing the parallel processing");
    //                 }
    //             }
    //         } else {

    //             let oEntry = {
    //                 "TransactionID": vTransID,
    //                 // "RequestedAttributes": "LOCID,PRDID,PRDFR,VCSTRUCTURENODE,VCDMRPTYPE,VCSOURCEID",
    //                 "RequestedAttributes": "LOCID,PRDID,PRDFR,VCSTRUCTURENODE,VCSOURCEID",
    //                 "DoCommit": true
    //             }
    //             oEntry[lData] = oReq.masterProd;
    //             try {
    //                 req.headers['Application-Interface-Key'] = vAIRKey;
    //                 console.log(req.headers);
    //                 await servicePost.tx(req).post(lEntity, oEntry);
    //                 // let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
    //                 // let vResponse = await servicePost.tx(req).get(resUrl);
    //                 flag = 'X';
    //             } catch (error) {

    //             }
    //         }
    //     } else {
    //         flag = 'W';
    //         lMessage = "No Assemblies to export, request failed";
    //     }



    //     // return "S";
    //     if (flag === 'X') {
    //         await GenF.jobSchMessage('X', "Export of Assembly is successful ", req);
    //     } else if (flag === 'W') {
    //         console.log(req.headers["x-sap-job-id"]);
    //         await GenF.jobSchMessage('X', lMessage, req);
    //     } else {
    //         await GenF.jobSchMessage('', lMessage, req);
    //     }

    //     flag = flag == '' ? 'E' : flag;

    //     try {
    //         await UPDATE`JOB_TEMPLATEDETAILS`
    //             .with({
    //                 LOG: flag
    //             })
    //             .where(`SUBJOB_ID = '${req.headers["x-sap-job-id"]}'`);
    //     } catch (e) {
    //     }

    //     // GetExportResult
    // });
     

     this.on("exportIBPAssembly", async (req) => {
        // req.data = {
        //     "LOCATION_ID" : "PLAM",
        //     "PRODUCT_ID" : "435A00"
        // }
        // Get Planning area and Prefix configurations for IBP
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Bill Of Material'`);
        let liParaValue = await GenF.getParameterID();
        // // let lData = "Nav" + liParaValue[0].VALUE.toString() + "PRODUCTIONSOURCEITM";
        // // let lEntity = "/" + liParaValue[0].VALUE.toString() + "PRODUCTIONSOURCEITMTrans";
        // // let lMasterDataType = liParaValue[0].VALUE.toString() + "PRODUCTIONSOURCEITM";
        //  let sPlan = aMappingData[0].PLANNING_AREA;
        // let lData = "Nav" + sPlan;
        // let lEntity = "/" + sPlan + "Trans";
        // let lMasterDataType = sPlan;
        let oReq = {
            masterProd: [],
        },
            lMessage,
            vmasterProd, flag = '',
            vBOMSource;
            let Keys = [];
            let response = '';
        let liComp = [];
        let chunksList = [];
        let chunkSize = 5000;
        let locprodData = [];

        // Fetch Multilevl BOM configuration check
        let vMBOMConfig = await GenF.getSystemConfig('MULTILEVEL_CONFIGPRODUCT');
        // fetch PVS configuration check
        const lsParamVal = await GenF.getParameterValue(req.data.LOCATION_ID, 19);
        if (lsParamVal === 'false' || lsParamVal === null) {
            // Get BOM for all Parital Prod and locations

            liComp = await cds.run(
                `
            SELECT DISTINCT CP_BOMHEADER.PRODUCT_ID,
                            CP_BOMHEADER.LOCATION_ID,
                            CP_BOMHEADER.COMPONENT, 
                            '' AS STRUCNODE,
                            '' AS MRP_TYPE
                      FROM "CP_BOMHEADER" 
                     WHERE CP_BOMHEADER.LOCATION_ID = '` + req.data.LOCATION_ID + `'
                     ORDER BY COMPONENT`);

            //  INNER JOIN CP_CRITICAL_COMP
            //  ON CP_BOMHEADER.LOCATION_ID = CP_CRITICAL_COMP.LOCATION_ID
            // AND CP_BOMHEADER.PRODUCT_ID = CP_CRITICAL_COMP.PRODUCT_ID
            // AND CP_BOMHEADER.ITEM_NUM = CP_CRITICAL_COMP.ITEM_NUM
            // AND  CP_BOMHEADER.COMPONENT = CP_CRITICAL_COMP.ASSEMBLY

            //    AND CP_CRITICAL_COMP.ASSEMBLY_CRITICALKEY = 'X'
        } else {
            // Get BOM for all Parital Prod and locations

            liComp = await cds.run(`
            SELECT DISTINCT V_BOMPVS.PRODUCT_ID,
                            V_BOMPVS.LOCATION_ID,
                            V_BOMPVS.COMPONENT,
                            V_BOMPVS.STRUC_NODE,
                            '' AS MRP_TYPE
                      FROM "V_BOMPVS"
                     WHERE V_BOMPVS.LOCATION_ID = '` + req.data.LOCATION_ID + `'
                       AND V_BOMPVS.STRUC_NODE IS NOT NULL
                     ORDER BY COMPONENT`);

            //  INNER JOIN CP_CRITICAL_COMP
            //  ON V_BOMPVS.LOCATION_ID = CP_CRITICAL_COMP.LOCATION_ID
            // AND V_BOMPVS.PRODUCT_ID = CP_CRITICAL_COMP.PRODUCT_ID
            // AND V_BOMPVS.ITEM_NUM = CP_CRITICAL_COMP.ITEM_NUM
            // AND  V_BOMPVS.COMPONENT = CP_CRITICAL_COMP.ASSEMBLY

            //   AND CP_CRITICAL_COMP.ASSEMBLY_CRITICALKEY = 'X'
        }

        console.log("selected product in export IBP assembly -" + req.data.PRODUCT_ID);

        if (vMBOMConfig === 'Yes') {
            liComp = [];
            console.log("Passing location and product");
            // liComp = await obibpfucntions.getAssemblyMBOMAssemblyHier(req.data.LOCATION_ID, req.data.PRODUCT_ID, liComp);
            liComp = await obibpfucntions.getAssemblyMBOMAssemblyHierNew(req.data.LOCATION_ID, req.data.PRODUCT_ID, liComp);
        }

        console.log("Generated Data");
        console.log(liComp);

        // Remove duplicates for IBP export as Different structure node to a Assembly Item is causing an issue
          Keys = ['LOCATION_ID', 'PRODUCT_ID', 'COMPONENT'];
        liComp = GenF.removeDuplicate(liComp, Keys);

        // const lipartialprod = await cds.run(
        //     `
        //     SELECT DISTINCT PRODUCT_ID,
        //         LOCATION_ID,
        //         PROD_DESC,
        //         REF_PRODID
        //     FROM "CP_PARTIALPROD_INTRO"
        //     WHERE LOCATION_ID = '` + req.data.LOCATION_ID + `'
        //     AND CONFIGPROD_CHK IS NULL
        //     ORDER BY REF_PRODID`);

        const lipartialprod = await cds.run(`
                                                SELECT DISTINCT CP_PARTIALPROD_INTRO.PRODUCT_ID,
                                                                CP_PARTIALPROD_INTRO.LOCATION_ID,
                                                                CP_PARTIALPROD_INTRO.PROD_DESC,
                                                                CP_PARTIALPROD_INTRO.REF_PRODID,
                                                                CP_FACTORY_SALESLOC.LOCATION_ID AS DEMAND_LOCATION,
                                                                CP_FACTORY_SALESLOC.PLAN_LOC
                                                    FROM "CP_PARTIALPROD_INTRO"
                                                   INNER JOIN CP_FACTORY_SALESLOC
                                                      ON CP_PARTIALPROD_INTRO.PRODUCT_ID = CP_FACTORY_SALESLOC.PRODUCT_ID
                                                     AND CP_PARTIALPROD_INTRO.LOCATION_ID = CP_FACTORY_SALESLOC.LOCATION_ID
                                                   WHERE CP_FACTORY_SALESLOC.FACTORY_LOC = '${req.data.LOCATION_ID}'
                                                     AND CP_PARTIALPROD_INTRO.CONFIGPROD_CHK IS NULL
                                                    ORDER BY CP_PARTIALPROD_INTRO.REF_PRODID`);

        const liFactLoc = await cds.run(
            ` SELECT DISTINCT LOCATION_ID,
                              PLAN_LOC
                        FROM CP_FACTORY_SALESLOC
                        WHERE FACTORY_LOC = '` + req.data.LOCATION_ID + `'
                        AND LOCATION_ID <> '` + req.data.LOCATION_ID + `'
            `);

            locprodData = await cds.run( `
            SELECT  LOCATION_ID,
                    PRODUCT_ID,
                    MRP_TYPE,
                    MRP_GROUP                                         
            FROM "CP_LOCATION_PRODUCT" 
                    
                     `);

        // BOM Components
        for (let iComp = 0; iComp < liComp.length; iComp++) {
            // Source concatenation of Location and Product
            // vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].PRODUCT_ID);
            vBOMSource = liComp[iComp].dummyLoc.concat('_', liComp[iComp].PRODUCT_ID);
            let vStrucNode = liComp[iComp].STRUC_NODE;
            if (liComp[iComp].STRUC_NODE === undefined) {
                vStrucNode = '';
            }
            let data = locprodData.filter(el=> el.LOCATION_ID == liComp[iComp].LOCATION_ID && el.PRODUCT_ID == liComp[iComp].COMPONENT);
                    let mrptype = data.length == 0 ? '' : data[0].MRP_TYPE;
            vmasterProd = {
                "LOCATION_ID": liComp[iComp].LOCATION_ID,
                "PRODUCT_ID": liComp[iComp].PRODUCT_ID,
                // "PRDFR": liComp[iComp].COMPONENT,
               "COMPONENT": liComp[iComp].COMPONENT, // Combination of LOCID-PRDID
               "SOURCE_ID":vBOMSource,
               "MRP_TYPE" : mrptype

            };
            oReq.masterProd.push(GenF.parse(vmasterProd));
            if (vMBOMConfig === 'No') {
                // Mapping for every demand location
                for (let i = 0; i < liFactLoc.length; i++) {
                    vmasterProd.LOCATION_ID = liFactLoc[i].LOCATION_ID;
                    // vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].PRODUCT_ID);
                    // vmasterProd = {
                    //     "LOCID": liFactLoc[i].LOCATION_ID,
                    //     "PRDID": liComp[iComp].PRODUCT_ID,
                    //     "PRDFR": liComp[iComp].COMPONENT,
                    //     "VCSTRUCTURENODE": vStrucNode, //liComp[iComp].STRUC_NODE,
                    //     "VCDMRPTYPE": liComp[iComp].MRP_TYPE,
                    //     "VCSOURCEID": vBOMSource
                    // };
                    oReq.masterProd.push(GenF.parse(vmasterProd));

                    if (liFactLoc[i].LOCATION_ID !== liFactLoc[i].PLAN_LOC) {
                        vmasterProd.LOCATION_ID = liFactLoc[i].PLAN_LOC;
                        // vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].PRODUCT_ID);
                        // vmasterProd = {
                        //     "LOCID": liFactLoc[i].PLAN_LOC,
                        //     "PRDID": liComp[iComp].PRODUCT_ID,
                        //     "PRDFR": liComp[iComp].COMPONENT,
                        //     "VCSTRUCTURENODE": vStrucNode, //liComp[iComp].STRUC_NODE,
                        //     "VCDMRPTYPE": liComp[iComp].MRP_TYPE,
                        //     "VCSOURCEID": vBOMSource
                        // };
                        oReq.masterProd.push(GenF.parse(vmasterProd));
                    }
                }
            }
            // Mapping Assembly to every Partial Product
            for (let iPartial = 0; iPartial < lipartialprod.length; iPartial++) {
                if (lipartialprod[iPartial].REF_PRODID === liComp[iComp].PRODUCT_ID &&
                    lipartialprod[iPartial].LOCATION_ID === liComp[iComp].LOCATION_ID &&
                    lipartialprod[iPartial].PRODUCT_ID !== liComp[iComp].PRODUCT_ID) {
                    // vBOMSource = liComp[iComp].LOCATION_ID.concat('_', lipartialprod[iPartial].PRODUCT_ID);
                    vBOMSource = req.data.LOCATION_ID.concat('_', lipartialprod[iPartial].PRODUCT_ID);
                    vmasterProd.LOCATION_ID = liComp[iComp].LOCATION_ID;
                    vmasterProd.PRODUCT_ID = lipartialprod[iPartial].PRODUCT_ID;
                    // vmasterProd.VCSOURCEID = vBOMSource;
                    // vmasterProd = {
                    //     "LOCID": liComp[iComp].LOCATION_ID,
                    //     "PRDID": lipartialprod[iPartial].PRODUCT_ID,
                    //     "PRDFR": liComp[iComp].COMPONENT,
                    //     "VCSTRUCTURENODE": vStrucNode, //liComp[iComp].STRUC_NODE,
                    //     "VCDMRPTYPE": liComp[iComp].MRP_TYPE,
                    //     "VCSOURCEID": vBOMSource
                    // };
                    oReq.masterProd.push(GenF.parse(vmasterProd));

                    if (lipartialprod[iPartial].LOCATION_ID !== lipartialprod[iPartial].DEMAND_LOCATION) {
                        vmasterProd.LOCATION_ID = lipartialprod[iPartial].DEMAND_LOCATION;
                        oReq.masterProd.push(GenF.parse(vmasterProd));
                    }

                    if (lipartialprod[iPartial].DEMAND_LOCATION !== lipartialprod[iPartial].PLAN_LOC) {
                        vmasterProd.LOCATION_ID = lipartialprod[iPartial].PLAN_LOC;
                        oReq.masterProd.push(GenF.parse(vmasterProd));
                    }

                    // for (let i = 0; i < liFactLoc.length; i++) {
                    //     vmasterProd.LOCID = liFactLoc[i].LOCATION_ID;
                    //     // vBOMSource = liComp[iComp].LOCATION_ID.concat('_', lipartialprod[iPartial].PRODUCT_ID);
                    //     // vmasterProd = {
                    //     //     "LOCID": liFactLoc[i].LOCATION_ID,
                    //     //     "PRDID": lipartialprod[iPartial].PRODUCT_ID,
                    //     //     "PRDFR": liComp[iComp].COMPONENT,
                    //     //     "VCSTRUCTURENODE": vStrucNode
                    //     , //liComp[iComp].STRUC_NODE,
                    //     //     "VCDMRPTYPE": liComp[iComp].MRP_TYPE,
                    //     //     "VCSOURCEID": vBOMSource

                    //     // };
                    //     oReq.masterProd.push(GenF.parse(vmasterProd));
                    //     if (liFactLoc[i].LOCATION_ID !== liFactLoc[i].PLAN_LOC) {
                    //         vmasterProd.LOCID = liFactLoc[i].PLAN_LOC;
                    //         // vBOMSource = liComp[iComp].LOCATION_ID.concat('_', lipartialprod[iPartial].PRODUCT_ID);
                    //         // vmasterProd = {
                    //         //     "LOCID": liFactLoc[i].PLAN_LOC,
                    //         //     "PRDID": lipartialprod[iPartial].PRODUCT_ID,
                    //         //     "PRDFR": liComp[iComp].COMPONENT,
                    //         //     "VCSTRUCTURENODE": vStrucNode, //liComp[iComp].STRUC_NODE,
                    //         //     "VCDMRPTYPE": liComp[iComp].MRP_TYPE,
                    //         //     "VCSOURCEID": vBOMSource

                    //         // };
                    //         oReq.masterProd.push(GenF.parse(vmasterProd));
                    //     }
                    // }
                }
            }

         

            

        }


        // let vKeysReq = ['LOCATION_ID', 'PRODUCT_ID','SOURCEID'];
        // oReq.masterProd = GenF.removeDuplicate(oReq.masterProd, vKeysReq);

        // if (oReq.masterProd.length >= 5000) {
        //         let aData = oReq.masterProd;

        //         for (let i = 0; i < aData.length; i += chunkSize) {
        //             let chunk = aData.slice(i, i + chunkSize)
        //             chunksList.push(GenF.parse(chunk));
        //         }

        //         GenF.log(`Processed Assemblies Length ${oReq.masterProd.length}`);

        //         oReq.masterProd = [];
        //         aData = [];
        //     }
            console.log(oReq.masterProd.length);

         Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
        let distData = GenF.removeDuplicate(aTableData, Keys);
            let aMappingData = [];      
        for (var z = 0; z < distData.length; z++) {
            
                aMappingData = aTableData.filter(e=> e.PLANNING_AREA == distData[z].PLANNING_AREA);

                let sPlan = aMappingData[0].PLANNING_AREA;
                let lData = "Nav" + liParaValue[0].VALUE.toString() + sPlan;
                let lEntity = "/" + liParaValue[0].VALUE.toString() + sPlan + "Trans";
                let lMasterDataType = liParaValue[0].VALUE.toString() + sPlan;
                console.log("sPlan", sPlan);
                console.log("lData", lData);
                console.log("lEntity", lEntity);
                console.log("lMasterDataType", lMasterDataType);



            let aAssemComp = await GenF.mappingData('Bill Of Material', distData[z].PLANNING_AREA,'',oReq.masterProd);
            // let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Bill Of Material'`);
         aMappingData.filter((el)=>{
            if(el.TYPE == 'C'){
                el.MAPPING_FIELD = el.BTP_FIELD
            }
            else if(el.TYPE == 'D'){
                el.BTP_FIELD = el.MAPPING_FIELD
            }
        })
            const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
         aAssemComp = aAssemComp.filter(record => {
             return requiredFields.every(field => record[field] != null && record[field] !== "");
         });
            let aKeys = Object.keys(aAssemComp[0]);
            let requestedAttributesStr = Array.from(aKeys).join(',');
            oReq.masterProd = aAssemComp;

        /** Code for Parallel Processing */
        let vTransID = new Date().getTime().toString();
        let vFactoryLoc = req.data.LOCATION_ID + '%';
        if (oReq.masterProd.length > 0 || chunksList.length > 0) {

            let vKeysReq = aKeys;

            oReq.masterProd = GenF.removeDuplicate(oReq.masterProd, vKeysReq);

            if (oReq.masterProd.length >= 5000 || chunksList.length > 0) {

                let iChnk, iChkCounter = 0;
                // Initialize Parallel processing
                // let resUrlAsm = "/InitiateParallelProcess?PlanningArea='" + liParaValue[0].VALUE + "'&VersionID=''&MasterDataTypeID='" + lMasterDataType + "'&Transactionid='" + vTransID + "'&TransactionName='Assembly Master'";
                let resUrlAsm = "/InitiateParallelProcess?MasterDataTypeID='" + lMasterDataType + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
                try {
                    await servicePost.tx(req).post(resUrlAsm);
                } catch (e) {
                    console.log(e);
                }
                // Divide into multiple arrays with each array length as 5000
                chunked = true;
                let aData = oReq.masterProd;
                // chunksList = [];
                // const chunkSize = 5000;
                if (oReq.masterProd.length < 5000) {
                    chunkSize = oReq.masterProd.length;
                }
                for (let i = 0; i < aData.length; i += chunkSize) {
                    let chunk = aData.slice(i, i + chunkSize)
                    chunksList.push(GenF.parse(chunk));
                }

                if (chunksList.length > 0) {

                    aData = [];
                    oReq.masterProd = [];
                    // Process each chunk to IBP
                    for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
                        let oEntryASM = {
                            "TransactionID": vTransID,
                            "RequestedAttributes": requestedAttributesStr
                        }
                        oEntryASM[lData] = chunksList[iChnk];
                        // console.log(oEntryASM);
                        try {
                            req.headers['Application-Interface-Key'] = vAIRKey;
                            console.log(req.headers);
                            await servicePost.tx(req).post(lEntity, oEntryASM);
                            iChkCounter = iChkCounter + 1;
                        } catch (err) {
                            console.log(err);
                            // iChkCounter = 0;
                            // console.log(err.message);
                        }
                    }
                }
                // If all are successfull commit the request
                if (iChkCounter > 0) {
                    console.log("Chunks count:" + iChkCounter);
                    let resUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
                    try {
                        await servicePost.tx(req).post(resUrlPPCommit);
                        let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                        let vResponse = await servicePost.tx(req).get(resUrl);
                        flag = 'X';
                        response = response + "Export of Assembly is successful for " + lMasterDataType;
                    } catch (e) {
                        console.log("Error while committing the parallel processing");
                        response = response + "Export of Assembly is failed for " + lMasterDataType+`.Reason: ${e.message}`;
                    }
                }
            } else {

                let oEntry = {
                    "TransactionID": vTransID,
                    "RequestedAttributes": requestedAttributesStr,
                    "DoCommit": true
                }
                oEntry[lData] = oReq.masterProd;
                try {
                    req.headers['Application-Interface-Key'] = vAIRKey;
                    console.log(req.headers);
                    await servicePost.tx(req).post(lEntity, oEntry);
                    let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                    let vResponse = await servicePost.tx(req).get(resUrl);
                    flag = 'X';
                    response = response + "Export of Assembly is successful for " + lMasterDataType;
                } catch (error) {
                    response = response + "Export of Assembly is failed for " + lMasterDataType+`.Reason: ${error.message}`;
                }
            }
        } else {
            flag = 'W';
            response = "No Assemblies to export, request failed";
        }
    }



        // return "S";
        if (flag === 'X') {
            await GenF.jobSchMessage('X', response, req);
        } else if (flag === 'W') {
            console.log(req.headers["x-sap-job-id"]);
            await GenF.jobSchMessage('X', response, req);
        } else {
            await GenF.jobSchMessage('', response, req);
        }

        flag = flag == '' ? 'E' : flag;

        try {
            await UPDATE`JOB_TEMPLATEDETAILS`
                .with({
                    LOG: flag
                })
                .where(`SUBJOB_ID = '${req.headers["x-sap-job-id"]}'`);
        } catch (e) {
        }

        // GetExportResult
    });


    this.on("importChngelogMktAuth", async (req) => {

        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lMessage, lSuccess, aJobid, aReturn = {};
        let vToDate = new Date();
        let vMonth = (vToDate.getMonth() + 1).toString();
        if (vMonth.length === 1) {
            vMonth = '0' + vMonth;
        }
        let vDate = vToDate.getDate().toString();
        if (vDate.length === 1) {
            vDate = '0' + vDate;
        }
        vToDate = vToDate.getFullYear().toString() + vMonth + vDate + "235959";
        let vFromDate = new Date();
        vFromDate = new Date(vFromDate.getFullYear(), vFromDate.getMonth(), vFromDate.getDate() - 7);
        vMonth = (vFromDate.getMonth() + 1).toString();
        if (vMonth.length === 1) {
            vMonth = '0' + vMonth;
        }
        vDate = vFromDate.getDate().toString();
        if (vDate.length === 1) {
            vDate = '0' + vDate;
        }
        vFromDate = vFromDate.getFullYear().toString() + vMonth + vDate + "000000";
        let oEntry = {
            "__metadata": {
                "type": "IBP.API_CHANGEHISTORY_READ_SRV.CalculateOriginalView"
            },
            "Plarea": liParaValue[0].VALUE,
            "Version": "__BASELINE",
            "Keyfigure": "MANUALOPTION",
            "TimeRangeOfChangesFrom": vFromDate,
            "TimeRangeOfChangesTo": vToDate
        }
        try {
            req.headers['Application-Interface-Key'] = vAIRKey;
            aJobid = await serviceChLog.tx(req).post("/CalculateOriginalViewSet", oEntry);
            await obibpfucntions.ImportChangeHis(aJobid.Jobid, req, service, servicePost, serviceChLog, aReturn);
            lSuccess = 'X';
        } catch (error) {
            console.log(error);
        }
        if (lSuccess === 'X') {
            lMessage = "Import of Change log is successful ";
        } else {
            lMessage = "Import of Change log failed";
        }
        return lMessage;
    });

    this.on("importComponentAvail", async (req) => {
        let flag = await obibpfucntions.importCompAvail(req);
        if (flag === 'S') {
            lMessage = "Successfully imported version scenario from IBP";
            await GenF.jobSchMessage('X', "Import of is Component Availability is successful ", req);
            console.log(lMessage);
            return "Success";
        } else {
            lMessage = "Failed to import version scenario from IBP";
            await GenF.jobSchMessage(' ', "Import of Component Availability failed", req);
            console.log(lMessage);
            return "Failed";
        }
    });
    this.on("exportActCompDemandfn", async (req) => {

        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";

        let oReq = {
            actcomp: [],
        },
            vactcomp, lMessage = '';
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started exporting Sales History and Configurations";
        let res = req._.req.res;
        // let lilocProdReq = JSON.parse(req.data.LocProdData);
        // if (lilocProdReq[0].PRODUCT_ID === "ALL") {
        //     lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
        //     lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
        //     const objCatFn = new Catservicefn();
        //     const lilocProdT = await objCatFn.getAllProducts(lsData);
        //     lsData = {};
        //     const litemp = JSON.stringify(lilocProdT);
        //     lilocProd = JSON.parse(litemp);
        // }
        // else {
        //     lilocProd = JSON.parse(req.data.LocProdData);
        // }
        // values.push({ id, createtAt, message, lilocProd });
        // res.statusCode = 202;
        // res.send({ values });
        // Fetch History period from Configuration table
        const lsSales = await GenF.getParameterValue(req.data.LOCATION_ID, 11);
        console.log(lsSales);
        let vToDate = new Date().toISOString().split('Z')[0].split('T')[0];
        console.log(vToDate);

        let vFromDate = new Date();
        vFromDate.setDate(vFromDate.getDate() - (parseInt(lsSales) * 7));
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];
        console.log(vFromDate);

        // for (let i = 0; i < lilocProd.length; i++) {
        lsData.LOCATION_ID = req.data.LOCATION_ID;
        lsData.PRODUCT_ID = req.data.PRODUCT_ID;
        lsData.CRITICALKEY = req.data.CRITICALKEY;

        // getting config product for partial

        let lMainProduct = '';
        // Get Configurable product
        let lsMainProduct = await SELECT.one
            .from('CP_PARTIALPROD_INTRO')
            .columns('REF_PRODID')
            .where(`LOCATION_ID = '${lsData.LOCATION_ID}' AND PRODUCT_ID = '${lsData.PRODUCT_ID}'`);
        if (lsMainProduct === null || lsMainProduct == undefined) {
            lMainProduct = GenF.parse(lsData.PRODUCT_ID);
        } else {
            lMainProduct = lsMainProduct.REF_PRODID;
        }
        const liactcomp = await cds.run(
            `
                SELECT DISTINCT "WEEK_DATE",
                        "LOCATION_ID",
                        "FACTORY_LOC"
                        "PRODUCT_ID",
                        "REF_PRODID",
                        "ACTUALCOMPONENTDEMAND",
                        "COMPONENT"
                        FROM V_IBP_LOCPRODCOMP_ACTDEMD
                        WHERE LOCATION_ID = '` + lsData.LOCATION_ID + `'
                           AND PRODUCT_ID = '` + lsData.PRODUCT_ID +
            `' AND WEEK_DATE >= '` + vFromDate +
            `' AND WEEK_DATE <= '` + vToDate + `'`);


        if (lsData.CRITICALKEY === "X") {
            // const licriticalcomp = await cds.run(
            //     `
            //             SELECT  "LOCATION_ID",
            //                     "PRODUCT_ID",
            //                     "ITEM_NUM",
            //                     "COMPONENT",
            //                     "CRITICALKEY",
            //                     "ASSEMBLY_CRITICALKEY"
            //                     FROM CP_CRITICAL_COMP
            //                     WHERE LOCATION_ID = '`+ lsData.LOCATION_ID + `'
            //                       AND PRODUCT_ID = '`+ lsData.PRODUCT_ID + `'                               
            //                       AND ASSEMBLY_CRITICALKEY = '` + lsData.CRITICALKEY + `'`);
            let aData = {};
            aData.LOCATION_ID = lsData.LOCATION_ID;
            aData.PRODUCT_ID = lMainProduct;
            // Getting only critical assemblys
            const objCatFn = new Catservicefn();
            let licriticalcomp = await objCatFn.getCriticalAsmbs(aData);
            // let Keys = ['LOCATION_ID', 'PRODUCT_ID', 'ASSEMBLY'];
            // licriticalcomp = GenF.removeDuplicate(licriticalcomp, Keys);
            for (i = 0; i < liactcomp.length; i++) {
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
        } else {
            for (i = 0; i < liactcomp.length; i++) {
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
            let oEntry = {
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
                flag = 'X';
                lMessage = lMessage + ' ' + 'Export of Actual Component Demand is successfull for product:' + lsData.PRODUCT_ID;
            } catch {
                lMessage = lMessage + ' ' + 'Export of Actual Component Demand failed for product:' + lsData.PRODUCT_ID;
            }
        } else {
            lMessage = lMessage + ' ' + 'No Actual Component Demand exists on Crtical components for product:' + lsData.PRODUCT_ID;
        }
        // }
        await GenF.jobSchMessage('X', lMessage, req);
        return "S";
    });

    // this.on("exportIBPAssemblyComp", async (req) => {

    //     // Get Planning area and Prefix configurations for IBP
    //     let liParaValue = await GenF.getIBPParameterValue();
    //     let lData = "Nav" + liParaValue[1].VALUE.toString() + "LOCASSEMBLYCOMPONENT";
    //     let lEntity = "/" + liParaValue[1].VALUE.toString() + "LOCASSEMBLYCOMPONENTTrans";
    //     let liComp = [],
    //         liFactLoc = [];
    //     let oReq = {
    //         asmbComp: [],
    //     },
    //         vBOMSource,
    //         vAsmbComp, flag = '';
    //     let sMessage = '';
    //     // Fetch multi BOM config
    //     let vBOMConfig = await GenF.getSystemConfig('MULTILEVEL_CONFIGPRODUCT'); //('MULTIBOM');
    //     if (vBOMConfig === 'Yes') {
    //         //Fetch alternate plants
    //         liComp = await cds.run(` SELECT LOCATION_ID,
    //                                                   ASSEMBLY,
    //                                                   COMPONENT,
    //                                                   SUM(COMP_QTY) AS COMP_QTY
    //                                             FROM "CP_ASSEMBLY_COMP"
    //                                             WHERE LOCATION_ID IN ( SELECT DISTINCT CHILD_LOC
    //                                                                                 FROM CP_BOM_MAT
    //                                                                                 WHERE LOCATION_ID = '${req.data.LOCATION_ID}'
    //                                                                                 ORDER BY CHILD_LOC )
    //                                             AND "ASSEMBLY" <> "COMPONENT"
    //                                             GROUP BY LOCATION_ID,
    //                                                     ASSEMBLY,
    //                                                     COMPONENT
    //                                             ORDER BY ASSEMBLY`);
    //         if (liComp.length > 0) {
    //             // // Add new property 'FLAG' to array of objects
    //             // liComp = liComp.map(function (obj) {
    //             //     return { ...obj, FLAG: true };
    //             // })
    //             let aComp = [];
    //             for (let i = 0; i < liComp.length; i++) {
    //                 let aFilComp = [];
    //                 aFilComp = aComp.filter(function (aComp) {
    //                     return aComp.COMPONENT === liComp[i].COMPONENT
    //                         && aComp.ASSEMBLY === liComp[i].ASSEMBLY;
    //                 });
    //                 if (aFilComp.length === 0) {
    //                     aComp = await getMBOMComponent(liComp, liComp[i], aComp);
    //                 }
    //             }

    //             let Keys = ['LOCATION_ID', 'ASSEMBLY', 'COMPONENT'];
    //             liComp = GenF.removeDuplicate(aComp, Keys);
    //         }

    //     } else {
    //         liComp = await cds.run(
    //             `
    //                   SELECT LOCATION_ID,
    //                          ASSEMBLY,
    //                          COMPONENT,
    //                          SUM(COMP_QTY) AS COMP_QTY
    //                 FROM "CP_ASSEMBLY_COMP"
    //                 WHERE LOCATION_ID = '${req.data.LOCATION_ID}'
    //                 AND "ASSEMBLY" <> "COMPONENT"
    //                 GROUP BY LOCATION_ID,
    //                         ASSEMBLY,
    //                         COMPONENT
    //                 ORDER BY ASSEMBLY`);
    //         liFactLoc = await cds.run(
    //             ` SELECT DISTINCT LOCATION_ID,
    //                             PLAN_LOC
    //                     FROM CP_FACTORY_SALESLOC
    //                     WHERE FACTORY_LOC = '` + req.data.LOCATION_ID + `'
    //                     AND LOCATION_ID <> '` + req.data.LOCATION_ID + `'
    //         `);
    //     }
    //     // BOM Components
    //     for (let iComp = 0; iComp < liComp.length; iComp++) {

    //         vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].ASSEMBLY);
    //         vAsmbComp = {
    //             "LOCID": liComp[iComp].LOCATION_ID,
    //             "PRDID": liComp[iComp].ASSEMBLY,
    //             "PRDFR": liComp[iComp].COMPONENT,
    //             "VCBOMCOMPONENTCOEFFICENT": liComp[iComp].COMP_QTY.toString(),
    //             "VCBOMSOURCEID": vBOMSource
    //         };
    //         oReq.asmbComp.push(vAsmbComp);
    //         if (vBOMConfig === 'No') {
    //             for (let i = 0; i < liFactLoc.length; i++) {
    //                 vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].ASSEMBLY);
    //                 vAsmbComp = {
    //                     "LOCID": liFactLoc[i].LOCATION_ID,
    //                     "PRDID": liComp[iComp].ASSEMBLY,
    //                     "PRDFR": liComp[iComp].COMPONENT,
    //                     "VCBOMCOMPONENTCOEFFICENT": liComp[iComp].COMP_QTY.toString(),
    //                     "VCBOMSOURCEID": vBOMSource
    //                 };
    //                 oReq.asmbComp.push(vAsmbComp);

    //                 if (liFactLoc[i].LOCATION_ID !== liFactLoc[i].PLAN_LOC) {
    //                     vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].ASSEMBLY);
    //                     vAsmbComp = {
    //                         "LOCID": liFactLoc[i].PLAN_LOC,
    //                         "PRDID": liComp[iComp].ASSEMBLY,
    //                         "PRDFR": liComp[iComp].COMPONENT,
    //                         "VCBOMCOMPONENTCOEFFICENT": liComp[iComp].COMP_QTY.toString(),
    //                         "VCBOMSOURCEID": vBOMSource
    //                     };
    //                     oReq.asmbComp.push(vAsmbComp);
    //                 }
    //             }
    //         }
    //     }
    //     console.log(oReq.asmbComp.length);
    //     if (oReq.asmbComp.length > 0) {
    //         let vTransID = new Date().getTime().toString();
    //         let vMDTyp = 'VCDLOCASSEMBLYCOMPONENT';
    //         // Parallel processing logic to export huge data buckets
    //         if (oReq.asmbComp.length > 5000) {
    //             let iChnk, iChkCounter = 0;

    //             // Initialize Parallel processing 
    //             let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
    //             try {
    //                 await servicePost.tx(req).post(reqUrlPPInit);
    //             } catch (e) {
    //                 console.log(e);
    //             }

    //             // Divide into multiple arrays with each array length as 5000
    //             chunked = true;
    //             let aData = oReq.asmbComp;
    //             chunksList = [];
    //             const chunkSize = 5000;

    //             for (let i = 0; i < aData.length; i += chunkSize) {
    //                 const chunk = aData.slice(i, i + chunkSize)
    //                 chunksList.push(chunk);
    //             }

    //             // Process each chunk to IBP
    //             for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

    //                 let oEntry = {
    //                     "TransactionID": vTransID,
    //                     "RequestedAttributes": "LOCID,PRDID,PRDFR,VCBOMCOMPONENTCOEFFICENT,VCBOMSOURCEID"
    //                 }
    //                 oEntry[lData] = chunksList[iChnk];
    //                 try {
    //                     req.headers['Application-Interface-Key'] = vAIRKey;
    //                     console.log(req.headers);
    //                     await servicePost.tx(req).post(lEntity, oEntry);
    //                     iChkCounter = iChkCounter + 1;
    //                 } catch (err) {
    //                     GenF.log(err);
    //                 }
    //             }
    //             // If all are successfull commit the request
    //             if (iChkCounter > 0) {
    //                 let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
    //                 try {
    //                     await servicePost.tx(req).post(reqUrlPPCommit);
    //                     flag = 'X';
    //                 } catch (e) {
    //                     GenF.log(e);
    //                     GenF.log("Error while committing the parallel processing");
    //                 }
    //             }
    //         }
    //         else {
    //             let oEntry = {
    //                 "TransactionID": vTransID,
    //                 "RequestedAttributes": "LOCID,PRDID,PRDFR,VCBOMCOMPONENTCOEFFICENT,VCBOMSOURCEID",
    //                 "DoCommit": true
    //             }
    //             oEntry[lData] = oReq.asmbComp;
    //             console.log(oEntry);
    //             try {
    //                 req.headers['Application-Interface-Key'] = vAIRKey;
    //                 console.log(req.headers);
    //                 await servicePost.tx(req).post(lEntity, oEntry);
    //                 let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
    //                 let vResponse = await servicePost.tx(req).get(resUrl);
    //                 flag = 'X';
    //             } catch (error) {
    //                 console.log(error);
    //             }
    //         }
    //     } else {
    //         flag = 'W';
    //         sMessage = 'No Assembly Components exists for selected location' + req.data.LOCATION_ID;
    //     }
    //     // return "S";
    //     if (flag === 'X') {
    //         await GenF.jobSchMessage('X', "Export of Assembly - Components is successful ", req);
    //     } else if (flag === 'W') {
    //         console.log(req.headers["x-sap-job-id"]);
    //         await GenF.jobSchMessage('X', sMessage, req);
    //     } else {
    //         await GenF.jobSchMessage('', "Export of Assembly - Components failed", req);
    //     }

    //     flag = flag == '' ? 'E' : flag;

    //     try {
    //         await UPDATE`JOB_TEMPLATEDETAILS`
    //             .with({
    //                 LOG: flag
    //             })
    //             .where(`SUBJOB_ID = '${req.headers["x-sap-job-id"]}'`);
    //     } catch (e) {
    //     }

    // });


    // Action - Generate Option Percentages based on Derived Characteristics 
   this.on("exportIBPAssemblyComp", async (req) => {

        // Get Planning area and Prefix configurations for IBP
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Assembly Component'`);
        let liParaValue = await GenF.getParameterID();
        // let lData = "Nav" + liParaValue[0].VALUE.toString() + "PRODUCTIONSOURCEITM";
        // let lEntity = "/" + liParaValue[0].VALUE.toString() + "PRODUCTIONSOURCEITMTrans";
        // let lMasterDataType = liParaValue[0].VALUE.toString() + "PRODUCTIONSOURCEITM";
        // req.data.LOCATION_ID = '1600'
    let response = '';
        let liComp = [],
            liFactLoc = [];
        let oReq = {
            asmbComp: [],
        },
            vBOMSource,
            vAsmbComp, flag = '';
        let sMessage = '';
        // Fetch multi BOM config
        let vBOMConfig = await GenF.getSystemConfig('MULTILEVEL_CONFIGPRODUCT'); //('MULTIBOM');
        if (vBOMConfig === 'Yes') {
            //Fetch alternate plants
            liComp = await cds.run(` SELECT LOCATION_ID,
                                                      ASSEMBLY,
                                                      COMPONENT,
                                                      SUM(COMP_QTY) AS COMP_QTY
                                                FROM "CP_ASSEMBLY_COMP"
                                                WHERE LOCATION_ID IN ( SELECT DISTINCT CHILD_LOC
                                                                                    FROM CP_BOM_MAT
                                                                                    WHERE LOCATION_ID = '${req.data.LOCATION_ID}'
                                                                                    ORDER BY CHILD_LOC )
                                                AND "ASSEMBLY" <> "COMPONENT"
                                                GROUP BY LOCATION_ID,
                                                        ASSEMBLY,
                                                        COMPONENT
                                                ORDER BY ASSEMBLY`);
            if (liComp.length > 0) {
                // // Add new property 'FLAG' to array of objects
                // liComp = liComp.map(function (obj) {
                //     return { ...obj, FLAG: true };
                // })
                let aComp = [];
                for (let i = 0; i < liComp.length; i++) {
                    let aFilComp = [];
                    aFilComp = aComp.filter(function (aComp) {
                        return aComp.COMPONENT === liComp[i].COMPONENT
                            && aComp.ASSEMBLY === liComp[i].ASSEMBLY;
                    });
                    if (aFilComp.length === 0) {
                        aComp = await getMBOMComponent(liComp, liComp[i], aComp);
                    }
                }

                let Keys = ['LOCATION_ID', 'ASSEMBLY', 'COMPONENT'];
                liComp = GenF.removeDuplicate(aComp, Keys);
            }

        } else {
            liComp = await cds.run(
                `
                      SELECT LOCATION_ID,
                             ASSEMBLY,
                             COMPONENT,
                             SUM(COMP_QTY) AS COMP_QTY
                    FROM "CP_ASSEMBLY_COMP"
                    WHERE LOCATION_ID = '${req.data.LOCATION_ID}'
                    AND "ASSEMBLY" <> "COMPONENT"
                    GROUP BY LOCATION_ID,
                            ASSEMBLY,
                            COMPONENT
                    ORDER BY ASSEMBLY`);
            liFactLoc = await cds.run(
                ` SELECT DISTINCT LOCATION_ID,
                                PLAN_LOC
                        FROM CP_FACTORY_SALESLOC
                        WHERE FACTORY_LOC = '` + req.data.LOCATION_ID + `'
                        AND LOCATION_ID <> '` + req.data.LOCATION_ID + `'
            `);
        }
        // BOM Components
        for (let iComp = 0; iComp < liComp.length; iComp++) {

            vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].ASSEMBLY);
            vAsmbComp = {
                "LOCATION_ID": liComp[iComp].LOCATION_ID,
                "ASSEMBLY": liComp[iComp].ASSEMBLY,
                "COMPONENT": liComp[iComp].COMPONENT,
                "VCBOMCOMPONENTCOEFFICENT": liComp[iComp].COMP_QTY.toString(),
                  "SOURCEID":vBOMSource
            };
            oReq.asmbComp.push(vAsmbComp);
            if (vBOMConfig === 'No') {
                for (let i = 0; i < liFactLoc.length; i++) {
                    vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].ASSEMBLY);
                    vAsmbComp = {
                        "LOCATION_ID": liFactLoc[i].LOCATION_ID,
                        "ASSEMBLY": liComp[iComp].ASSEMBLY,
                        "COMPONENT": liComp[iComp].COMPONENT,
                        "VCBOMCOMPONENTCOEFFICENT": liComp[iComp].COMP_QTY.toString(),
                        "SOURCEID":vBOMSource
                    };
                    oReq.asmbComp.push(vAsmbComp);

                    if (liFactLoc[i].LOCATION_ID !== liFactLoc[i].PLAN_LOC) {
                        vBOMSource = liComp[iComp].LOCATION_ID.concat('_', liComp[iComp].ASSEMBLY);
                        vAsmbComp = {
                            "LOCATION_ID": liFactLoc[i].PLAN_LOC,
                            "ASSEMBLY": liComp[iComp].ASSEMBLY,
                            "COMPONENT": liComp[iComp].COMPONENT,
                            "VCBOMCOMPONENTCOEFFICENT": liComp[iComp].COMP_QTY.toString(),
                              "SOURCEID":vBOMSource
                        };
                        oReq.asmbComp.push(vAsmbComp);
                    }
                }
            }
        }
        console.log(oReq.asmbComp.length);

        let Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
        let distData = GenF.removeDuplicate(aTableData, Keys);

        let aMappingData = [];      
        for (var z = 0; z < distData.length; z++) {
            
                aMappingData = aTableData.filter(e=> e.PLANNING_AREA == distData[z].PLANNING_AREA);

                let sPlan = aMappingData[0].PLANNING_AREA;
                let lData = "Nav" + liParaValue[0].VALUE.toString() + sPlan;
                let lEntity = "/" + liParaValue[0].VALUE.toString() + sPlan + "Trans";
                let lMasterDataType = liParaValue[0].VALUE.toString() + sPlan;
                console.log("sPlan", sPlan);
                console.log("lData", lData);
                console.log("lEntity", lEntity);
                console.log("lMasterDataType", lMasterDataType);

            let aAssemComp = await GenF.mappingData('Assembly Component',distData[z].PLANNING_AREA,'',oReq.asmbComp);
            if (aAssemComp.length > 0) {
            
         aMappingData.filter((el)=>{
            if(el.TYPE == 'C'){
                el.MAPPING_FIELD = el.BTP_FIELD
            }
            else if(el.TYPE == 'D'){
                el.BTP_FIELD = el.MAPPING_FIELD
            }
        })
            const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
         aAssemComp = aAssemComp.filter(record => {
             return requiredFields.every(field => record[field] != null && record[field] !== "");
         });
            let Keys = Object.keys(aAssemComp[0]);
            let requestedAttributesStr = Array.from(Keys).join(',');
            oReq.asmbComp = aAssemComp
        
            let vTransID = new Date().getTime().toString();
            // let vMDTyp = 'VCDLOCASSEMBLYCOMPONENT';
            // Parallel processing logic to export huge data buckets
            if (oReq.asmbComp.length > 5000) {
                let iChnk, iChkCounter = 0;

                // Initialize Parallel processing 
                let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + lMasterDataType + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
                try {
                    await servicePost.tx(req).post(reqUrlPPInit);
                } catch (e) {
                    console.log(e);
                }

                // Divide into multiple arrays with each array length as 5000
                chunked = true;
                let aData = oReq.asmbComp;
                chunksList = [];
                const chunkSize = 5000;

                for (let i = 0; i < aData.length; i += chunkSize) {
                    const chunk = aData.slice(i, i + chunkSize)
                    chunksList.push(chunk);
                }

                // Process each chunk to IBP
                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {

                    let oEntry = {
                        "TransactionID": vTransID,
                        "RequestedAttributes": requestedAttributesStr,
                    }
                    oEntry[lData] = chunksList[iChnk];
                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        console.log(req.headers);
                        await servicePost.tx(req).post(lEntity, oEntry);
                        iChkCounter = iChkCounter + 1;
                    } catch (err) {
                        GenF.log(err);
                    }
                }
                // If all are successfull commit the request
                if (iChkCounter > 0) {
                    let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
                    try {
                        await servicePost.tx(req).post(reqUrlPPCommit);
                       flag = 'X';
                    response = response + "Export of Assembly - Components is successful for" + lMasterDataType;
                    } catch (e) {
                        response = response + "Export of Assembly - Components is failed for" + lMasterDataType+`.Reason: ${e.message}`;
                        GenF.log("Error while committing the parallel processing");
                    }
                }
            }
            else {
                let oEntry = {
                    "TransactionID": vTransID,
                    "RequestedAttributes": requestedAttributesStr,
                    "DoCommit": true
                }
                oEntry[lData] = oReq.asmbComp;
                console.log(oEntry);
                try {
                    req.headers['Application-Interface-Key'] = vAIRKey;
                    console.log(req.headers);
                    await servicePost.tx(req).post(lEntity, oEntry);
                    let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                    let vResponse = await servicePost.tx(req).get(resUrl);
                    flag = 'X';
                    response = response + "Export of Assembly - Components is successful for" + lMasterDataType;
                } catch (error) {
                    response = response + "Export of Assembly - Components is failed for" + lMasterDataType+`.Reason: ${error.message}`;
                }
            }
        } else {
            flag = 'W';
            response = 'No Assembly Components exists for selected location' + req.data.LOCATION_ID;
        }
    }
        // return "S";
        if (flag === 'X') {
            await GenF.jobSchMessage('X', response, req);
        } else if (flag === 'W') {
            console.log(req.headers["x-sap-job-id"]);
            await GenF.jobSchMessage('X', response, req);
        } else {
            await GenF.jobSchMessage('', response, req);
        }

        flag = flag == '' ? 'E' : flag;

        try {
            await UPDATE`JOB_TEMPLATEDETAILS`
                .with({
                    LOG: flag
                })
                .where(`SUBJOB_ID = '${req.headers["x-sap-job-id"]}'`);
        } catch (e) {
        }

    });

    this.on("generateDCFCharPlan", async (request) => {
        let flag, lMessage = '';
        // Generating payload for job scheduler logs
        let lVersion, lScenario, vFromDate, vToDate;
        let vScen = '',
            resUrl;
        let req;
        let lilocProd = {};
        let lsData = {},
            lsFchar = {},
            aReturn = {},
            liFchar = [];
        let oReq = {
            mktauth: [],
        };
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started generating future demand plan based on derived characteristics";
        let res = request._.req.res;
        let lilocProdReq = JSON.parse(request.data.LocProdData);
        let aDistFCharPlan = [];
        var promiseArray = [],
            iCounter = 0,
            sMessage = '';
        // Handle service for both ALL and Selected projects
        if (lilocProdReq[0].PRODUCT_ID === "ALL") {
            lsData.LOCATION_ID = lilocProdReq[0].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProdReq[0].PRODUCT_ID;
            const objCatFn = new Catservicefn();
            const lilocProdT = await objCatFn.getAllProducts(lsData);
            const litemp = JSON.stringify(lilocProdT);
            lilocProd = JSON.parse(litemp);
        } else {
            lilocProd = JSON.parse(request.data.LocProdData);
        }
        // Acknowledge Job scheduler for the inputs selected
        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });

        lsData = {};

        vFromDate = new Date();
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];
        console.log(vFromDate);

        // Forecast Demand Horizon
        let lWeeks = await GenF.getParameterValue(lilocProdReq[0].LOCATION_ID, 2);
        vToDate = new Date();
        vToDate = new Date(vToDate.getFullYear(), vToDate.getMonth(), (vToDate.getDate() + parseInt(7 * lWeeks)));
        vMonth = (vToDate.getMonth() + 1).toString();
        if (vMonth.length === 1) {
            vMonth = '0' + vMonth;
        }
        let vDate = vToDate.getDate().toString();
        if (vDate.length === 1) {
            vDate = '0' + vDate;
        }
        vToDate = vToDate.getFullYear().toString() + "-" + vMonth + "-" + vDate;


        // Fetch Option percentages for a location product and weekDate
        try {
            for (let iloc = 0; iloc < lilocProd.length; iloc++) {

                aDistFCharPlan = await cds.run(`SELECT DISTINCT *            
                                                      FROM "CP_IBP_FUTUREDEMAND"
                                                     WHERE LOCATION_ID = '${lilocProd[iloc].LOCATION_ID}'
                                                       AND PRODUCT_ID = '${lilocProd[iloc].PRODUCT_ID}'
                                                       AND WEEK_DATE >= '${vFromDate}'
                                                       ORDER BY WEEK_DATE`);

                if (aDistFCharPlan.length > 0) {
                    for (let iDFCP = 0; iDFCP < aDistFCharPlan.length; iDFCP++) {
                        let oResp = await objDerConfig.genDerivedCharPercent(aDistFCharPlan[iDFCP].LOCATION_ID, aDistFCharPlan[iDFCP].PRODUCT_ID, aDistFCharPlan[iDFCP].WEEK_DATE, aDistFCharPlan[iDFCP].VERSION, aDistFCharPlan[iDFCP].SCENARIO)
                        if (oResp) {
                            if (oResp.error == true) {
                                iCounter++;
                                sMessage = sMessage + " " + oResp.message;
                            }
                        }
                        // promiseArray.push(new Promise((resolve, _reject) => {
                        //     oResp.then(el => {
                        //         resolve(el);
                        //     }).catch(ex => {
                        //         iCounter++;
                        //         sMessage = sMessage + " " + ex.message;
                        //         resolve(true);
                        //     })
                        // }))
                    }
                    lMessage = 'Future Characteristics plan successfully derived for product :' + ' ' + lilocProd[iloc].PRODUCT_ID;
                } else {
                    lMessage = 'Future Characteristics plan has to be imported for product :' + ' ' + lilocProd[iloc].PRODUCT_ID;
                }


                lsData.LOCATION_ID = lilocProd[iloc].LOCATION_ID;
                lsData.PRODUCT_ID = lilocProd[iloc].PRODUCT_ID;
                lsData.FROMDATE = vFromDate;
                lsData.TODATE = vToDate;

                let oResp1 = await obibpfucntions.exportMarketauthIBP(lsData, request, service, servicePost, aReturn);
                if (oResp1) {
                    if (oResp1.error == true) {
                        iCounter++;
                        sMessage = sMessage + " " + oResp1.message;
                    }
                }
                // promiseArray.push(new Promise((resolve, _reject) => {
                //     oResp1.then(el => {
                //         resolve(el);
                //     })
                //         .catch(ex => {
                //             iCounter++;
                //             sMessage = sMessage + " " + ex.message;
                //             resolve(true);
                //         })
                // }))
            }
        } catch (ex) {
            iCounter++;
            sMessage = ex.message;
        }

        // await Promise.all(promiseArray)
        if (iCounter > 0) { //Error
            await GenF.jobSchMessage('', sMessage, request);
        } else {
            await GenF.jobSchMessage('X', "Future Characteristics plan successfully derived", request);
        }

    });

    // Function - Generate Option Percentages based on Derived Characteristics 

    this.on("generateDCFCharPlan_fn", async (request) => {
        let flag, lMessage = '';

        // Generating payload for job scheduler logs
        let lVersion, lScenario, vFromDate, vToDate;
        let vScen = '',
            resUrl;
        let req;
        let lilocProd = [];
        let lsData = {},
            lsFchar = {},
            aReturn = {},
            liFchar = [];
        let oReq = {
            mktauth: [],
        };
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started generating future demand plan based on derived characteristics";
        let res = request._.req.res;
        // let lilocProdReq = JSON.parse(request.data.LocProdData);
        let aDistFCharPlan = [];

        lsData.LOCATION_ID = request.data.LOCATION_ID;
        lsData.PRODUCT_ID = request.data.PRODUCT_ID;
        lilocProd.push(GenF.parse(lsData));

        // Acknowledge Job scheduler for the inputs selected
        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });

        lsData = {};

        vFromDate = new Date();
        vFromDate = vFromDate.toISOString().split('Z')[0].split('T')[0];
        console.log(vFromDate);

        // Forecast Order Horizon
        let lWeeks = await GenF.getParameterValue(lilocProd[0].LOCATION_ID, 2);
        vToDate = new Date();
        vToDate = new Date(vToDate.getFullYear(), vToDate.getMonth(), (vToDate.getDate() + parseInt(7 * lWeeks)));
        vMonth = (vToDate.getMonth() + 1).toString();
        if (vMonth.length === 1) {
            vMonth = '0' + vMonth;
        }
        let vDate = vToDate.getDate().toString();
        if (vDate.length === 1) {
            vDate = '0' + vDate;
        }
        vToDate = vToDate.getFullYear().toString() + "-" + vMonth + "-" + vDate;


        // Fetch Option percentages for a location product and weekDate
        for (let iloc = 0; iloc < lilocProd.length; iloc++) {

            aDistFCharPlan = await cds.run(`SELECT DISTINCT *            
                                                  FROM "CP_IBP_FUTUREDEMAND"
                                                 WHERE LOCATION_ID = '${lilocProd[iloc].LOCATION_ID}'
                                                   AND PRODUCT_ID = '${lilocProd[iloc].PRODUCT_ID}'
                                                   AND WEEK_DATE >= '${vFromDate}'
                                                   ORDER BY WEEK_DATE`);

            if (aDistFCharPlan.length > 0) {
                for (let iDFCP = 0; iDFCP < aDistFCharPlan.length; iDFCP++) {
                    await objDerConfig.genDerivedCharPercent(aDistFCharPlan[iDFCP].LOCATION_ID, aDistFCharPlan[iDFCP].PRODUCT_ID, aDistFCharPlan[iDFCP].WEEK_DATE, aDistFCharPlan[iDFCP].VERSION, aDistFCharPlan[iDFCP].SCENARIO);
                    // break;
                }
                // // for (let iDFCP = 0; iDFCP < aDistFCharPlan.length; iDFCP++) {
                //     await objDerConfig.genDerivedCharPercent('1710', '000000000000002251', '2023-07-03', '__BASELINE', '_PLAN');
                //     // break;
                // // }
                lMessage = 'Future Characteristics plan successfully derived for product :' + ' ' + lilocProd[iloc].PRODUCT_ID;
            } else {
                lMessage = 'Future Characteristics plan has to be imported for product :' + ' ' + lilocProd[iloc].PRODUCT_ID;
            }

            // lMessage = 'Future Characteristics plan successfully derived for product :' + ' ' + lilocProd[iloc].PRODUCT_ID;

            await GenF.jobSchMessage('X', lMessage, request);

            lsData.LOCATION_ID = lilocProd[iloc].LOCATION_ID;
            lsData.PRODUCT_ID = lilocProd[iloc].PRODUCT_ID;
            lsData.FROMDATE = vFromDate;
            lsData.TODATE = vToDate;

            await obibpfucntions.exportMarketauthIBP(lsData, request, service, servicePost, aReturn);

        }

    });
    // Create class in IBP
   this.on("exportLocProdConfigAPI", async (req) => {
        // Send Response to Scheduler
        let liJobData = [];
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started export of Loc, Product, Class , Charateristics and Charateristics values";
        let res = req._.req.res;
        const litemp = JSON.stringify(req.data);
        liJobData = JSON.parse(litemp);
        values.push({
            id,
            createtAt,
            message,
            liJobData
        });
        res.statusCode = 202;
        res.send({
            values
        });

        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[1].VALUE.toString() + "OPTIONCOMBINATIONS";
        let lEntity = "/" + liParaValue[1].VALUE.toString() + "OPTIONCOMBINATIONSTrans";
        let lMasterDataType = liParaValue[1].VALUE.toString() + "OPTIONCOMBINATIONS";
        let oReq = {
            class: [],
        },
            vclass, aResponse, flag = '',
            vValidFrom, vValidTo;
        var sError ='';
        const liclass = await cds.run(
            `
            SELECT DISTINCT "LOCATION_ID",
                            "PRODUCT_ID",
                            "CUSTOMER_GROUP",
                            "CLASS_NUM",
                            "CHAR_NUM",
                            "CHARVAL_NUM",
                            "VALID_FROM",
                            "VALID_TO"  
                    FROM V_PRODCONFIGAPI_UPDATED 
                    WHERE IBPCHAR_CHK = true`);
        for (i = 0; i < liclass.length; i++) {
            vValidFrom = liclass[i].VALID_FROM + "T00:00:00";
            vValidTo = liclass[i].VALID_TO + "T00:00:00";
            vclass = {
                "CUSTID": liclass[i].CUSTOMER_GROUP,
                "LOCID": liclass[i].LOCATION_ID,
                "PRDID": liclass[i].PRODUCT_ID,
                "VCCHAR": liclass[i].CHAR_NUM,
                "VCCHARVALUE": liclass[i].CHARVAL_NUM,
                "VCCLASS": liclass[i].CLASS_NUM,
                "VCOPVALIDFROM": vValidFrom,
                "VCOPVALIDTO": vValidTo,
                "VCPOOPTIONPLAN": "1"
            };
            oReq.class.push(vclass);

        }
        if (oReq.class.length > 0) {
            let vTransID = new Date().getTime().toString();
            let oEntry = {};
            if (oReq.class.length > 5000) {
                let iChnk, iChkCounter = 0;
                // Initialize Parallel processing
                let resUrlAsm = "/InitiateParallelProcess?PlanningArea='" + liParaValue[0].VALUE + "'&VersionID=''&MasterDataTypeID='" + lMasterDataType + "'&Transactionid='" + vTransID + "'&TransactionName='Product-Loc Config Master'";
                try {
                    await servicePost.tx(req).post(resUrlAsm);
                } catch (e) {
                    console.log(e);
                }
                // Divide into multiple arrays with each array length as 5000
                chunked = true;
                let aData = oReq.class;
                chunksList = [];
                const chunkSize = 5000;
                for (let i = 0; i < aData.length; i += chunkSize) {
                    const chunk = aData.slice(i, i + chunkSize)
                    chunksList.push(chunk);
                }
                // Process each chunk to IBP
                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
                    let oEntryASM = {
                        "TransactionID": vTransID,
                        "RequestedAttributes": "CUSTID,LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,VCOPVALIDFROM,VCOPVALIDTO,VCPOOPTIONPLAN"
                    }
                    oEntryASM[lData] = chunksList[iChnk];
                    // console.log(oEntryASM);
                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        await servicePost.tx(req).post(lEntity, oEntryASM);
                        iChkCounter = iChkCounter + 1;
                    } catch (err) {
                        console.log(err);
                    }
                }
                // If all are successfull commit the request
                if (iChkCounter > 0) {
                    console.log("Chunks count:" + iChkCounter);
                    let resUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
                    try {
                        await servicePost.tx(req).post(resUrlPPCommit);
                        let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                        let vResponse = await servicePost.tx(req).get(resUrl);
                        flag = 'X';
                    } catch (e) {
                        sError = `Reason: ${e.message}`
                        console.log(e);
                        console.log("Error while committing the parallel processing");
                    }
                }
            } else {
                oEntry = {
                    "TransactionID": vTransID,
                    "RequestedAttributes": "CUSTID,LOCID,PRDID,VCCHAR,VCCHARVALUE,VCCLASS,VCOPVALIDFROM,VCOPVALIDTO,VCPOOPTIONPLAN",
                    "DoCommit": true
                }
                oEntry[lData] = oReq.class;

                try {
                    req.headers['Application-Interface-Key'] = vAIRKey;
                    await servicePost.tx(req).post(lEntity, oEntry);
                    let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                    aResponse = await servicePost.tx(req).get(resUrl);
                    flag = 'X';
                } catch (error) {
                    sError = `Reason: ${error.message}`
                    console.log(error);
                }
            }
        }
        if (flag === 'X') {
            await GenF.jobSchMessage('X', "Export of Location, Product and its configuration is successful ", req);
        } else {
            await GenF.jobSchMessage('', `Export Location, Product and its configuration failed.${sError}`, req);
        }
    });

    this.on("getIBPPlanPrefixApi", async (req) => {
        const apiArrays = [];
        /////Master Data API Entities//////
        const response = await servicePost.send({
            method: 'GET',
            path: '/$metadata',
            headers: {
                accept: 'application/xml'
            }

        });

        const xml2js = require('xml2js');
        var finalEntities;
        var liParaValue = await GenF.getParameterID()
        var sPlaningArea = liParaValue[0].VALUE
        xml2js.parseString(response, (err, result) => {
            entityDetails = result["edmx:Edmx"]["edmx:DataServices"][0].Schema[0].EntityType
            const entityNames = [];
            entityDetails.forEach(x => {

                entityNames.push(x.$.Name);

            })
            finalEntities = entityNames.filter(item => {
                return !item.includes('Trans') && !item.includes('Message')
            })
            finalEntities = finalEntities.filter(e => e.includes(sPlaningArea))
            entityDetails = entityDetails.filter(e => e.$.Name.includes(sPlaningArea))

        });
        apiArrays.push({ "MASTER_DATA_API_SRV": finalEntities });
        apiArrays.push({ "MASTER_DATA_KEY_PROPERTIES": entityDetails })
        //// Planning API Entities///////
        const res1 = await service.send({
            method: 'GET',
            path: '/$metadata',
            headers: {
                accept: 'application/xml'
            }

        });

        const xml2js1 = require('xml2js');
        var liParaValueP = await GenF.getParameterPrefix()
        var sPlaningPrefix = liParaValueP[0].VALUE
        var finalEntities;

        xml2js1.parseString(res1, (err, result) => {
            entityDetails = result["edmx:Edmx"]["edmx:DataServices"][0].Schema[0].EntityType
            const entityNames = [];
            entityDetails.forEach(x => {

                entityNames.push(x.$.Name);
            })
            finalEntities = entityNames.filter(item => {
                return !item.includes('Message')
            })

            finalEntities = finalEntities.filter(e => e.includes(sPlaningPrefix))
            entityDetails = entityDetails.filter(e => e.$.Name.includes(sPlaningPrefix))

        });

        apiArrays.push({ "PLANNING_DATA_API_SRV": finalEntities });
        apiArrays.push({ "PLANNING_DATA_KEY_PROPERTIES": entityDetails })



        return JSON.stringify(apiArrays);
    });
 

    this.on("exportComponentCoefficient", async (req) => {
        // req.data.LocProdData = JSON.stringify({
        //     "LOCATION_ID" : "PLAM",
        //     "PRODUCT_ID" : ["435A00"],
        //     "MODEL_VERSION" : "Active",
        //     "VERSION" : "UPSIDE",
        //     "SCENARIO" : "_PLAN",
        // })
        let response ='';
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getParameterPrefix();
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Component Coefficient'`);
        // // let lData = "Nav" + liParaValue[0].VALUE.toString();
        // // let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
        // let sPlan = aMappingData[0].PLANNING_AREA
        // let lData = "Nav" + sPlan;
        // let lEntity = "/" + sPlan + "Trans";

        let oReq = {
            actcomp: [],
        },
            vactcomp, lMessage = '';
        // Generating payload for job scheduler logs
        let lilocProd = {};
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let FinalData = [];
        let message = "Started exporting Component Coefficient";
        let res = req._.req.res;
        var aErrorLog = [];



        let lilocProdReq = JSON.parse(req.data.LocProdData);
        lilocProd = lilocProdReq;
        console.log("lilocProd", lilocProd);

        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });

    //    let oProducts = [];
    //     for(var i=0; i<lilocProd.length; i++){
    //         oProducts.push(lilocProd[i].PRODUCT_ID);
    //     }
         let sProducts = lilocProd.PRODUCT_ID.map(id => `'${id}'`).join(', ');
         console.log(sProducts);
      
        // // let liactcomp = await cds.run(
        // //     `
        // //     SELECT  
        // //             "LOCATION_ID",
        // //             "FACTORY_LOC",
        // //             "PRODUCT_ID",
        // //             "REF_PRODID",
        // //             "VERSION",
        // //             "SCENARIO",
        // //             "MODEL_VERSION",
        // //             "ASSEMBLY",
        // //             CASE 
        // //             WHEN A.LOCATION_ID <> A.FACTORY_LOC 
        // //             THEN
        // //             CONCAT(
		// // 			    CONCAT(A."FACTORY_LOC", '_'),
		// // 			    UPPER(
		// // 			        (SELECT MAX(DUMMY_PRODUCTID)
		// // 			         FROM CP_DUMMY_PRODUCT_LOC D
		// // 			         WHERE D."LOCATION_ID" = A."FACTORY_LOC"
		// // 			           AND D."PRODUCT_ID" = A."PRODUCT_ID")
		// // 			    )
		// // 			) 
		// // 		     ELSE 
		// // 			     CONCAT(CONCAT(A.FACTORY_LOC,'_'), A.REF_PRODID)
		// // 			 END
		// // 			AS "SOURCE_ID",
        // //             TO_TIMESTAMP("WEEK_STARTDATE") AS WEEK_DATE,
        // //             TO_NVARCHAR(SUM("TOTAL_QTY")) AS ASMB_REQ,
        // //             TO_NVARCHAR(SUM("COEFFICIENTS")) AS COEFFICIENTS
        // //             FROM V_ASSEMBLY_COMPONENT as A
        // //             WHERE LOCATION_ID =  '` + lilocProd.LOCATION_ID + `'                       
        // //                AND VERSION =  '` + lilocProd.VERSION + `'
        // //                AND SCENARIO =  '` + lilocProd.SCENARIO + `'
        // //                AND MODEL_VERSION =  '` + lilocProd.MODEL_VERSION + `'
        // //                AND PRODUCT_ID IN(${sProducts})
        // //                GROUP BY  "LOCATION_ID",
        // //             "PRODUCT_ID",
        // //             "FACTORY_LOC",
        // //             "REF_PRODID",
        // //             "ASSEMBLY",
        // //             "VERSION",
        // //             "SCENARIO",
        // //             "MODEL_VERSION",
        // //             "WEEK_STARTDATE"
                    
        // //                `);
        //  let liactcomp = await cds.run(
        //     `           
        //      SELECT  
        //             "LOCATION_ID",
        //             A."FACTORY_LOC",
        //             B.FACTORY_LOC AS "FAC_LOC_CONFIG",
        //              CASE
        //             WHEN B.FACTORY_LOC <> A.FACTORY_LOC
        //             THEN
		// 					 (SELECT MAX(DUMMY_PRODUCTID)
        //                      FROM CP_DUMMY_PRODUCT_LOC D
        //                      WHERE D."LOCATION_ID" = A."FACTORY_LOC"
        //                        AND D."PRODUCT_ID" = A."PRODUCT_ID")
        //              ELSE
        //                  A.PRODUCT_ID
        //              END  AS  "PRODUCT_ID",
        //             A."REF_PRODID",
        //             "VERSION",
        //             "SCENARIO",
        //             "MODEL_VERSION",
        //             "ASSEMBLY",
        //             CASE
        //             WHEN B.FACTORY_LOC <> A.FACTORY_LOC
        //             THEN
        //             CONCAT(
        //                 CONCAT(A."FACTORY_LOC", '_'),
        //                 UPPER(
        //                     (SELECT MAX(DUMMY_PRODUCTID)
        //                      FROM CP_DUMMY_PRODUCT_LOC D
        //                      WHERE D."LOCATION_ID" = A."FACTORY_LOC"
        //                        AND D."PRODUCT_ID" = A."PRODUCT_ID")
        //                 )
        //             )
        //              ELSE
        //                  CONCAT(CONCAT(A.FACTORY_LOC,'_'), A.PRODUCT_ID)
        //              END
        //             AS "SOURCE_ID",
        //             TO_TIMESTAMP("WEEK_STARTDATE") AS WEEK_DATE,
        //             TO_NVARCHAR(SUM("TOTAL_QTY")) AS ASMB_REQ,
        //             TO_NVARCHAR(SUM("COEFFICIENTS")) AS COEFFICIENTS
        //             FROM V_ASSEMBLY_COMPONENT as A
        //             INNER JOIN V_FACTORYLOC AS B
        //             ON  B.DEMAND_LOC = A.LOCATION_ID
        //             AND B.PRODUCT_ID = A.PRODUCT_ID
                    
        //              WHERE B.FACTORY_LOC =  '` + lilocProd.LOCATION_ID + `'                      
        //                AND A.VERSION =  '` + lilocProd.VERSION + `'
        //                AND A.SCENARIO =  '` + lilocProd.SCENARIO + `'
        //                AND A.MODEL_VERSION =  '` + lilocProd.MODEL_VERSION + `'
        //                AND A.PRODUCT_ID IN(${sProducts})
        //                AND A.TYPE = 'PI'
        //                GROUP BY  "LOCATION_ID",
        //                         A."PRODUCT_ID",
        //                         A."FACTORY_LOC",
        //                         B.FACTORY_LOC,
        //                         A."REF_PRODID",
        //                         "ASSEMBLY",
        //                         "VERSION",
        //                         "SCENARIO",
        //                         "MODEL_VERSION",
        //                         "WEEK_STARTDATE"       
        //                `);

       let liactcomp = await cds.run(
        `            SELECT  
                    "LOCATION_ID",
                    A."FACTORY_LOC",
                    B.FACTORY_LOC AS "FAC_LOC_CONFIG",
                     CASE
                    WHEN B.FACTORY_LOC <> A.FACTORY_LOC
                    THEN
                             (SELECT MAX(DUMMY_PRODUCTID)
                             FROM CP_DUMMY_PRODUCT_LOC D
                             WHERE D."FACTORY_LOC" = A."FACTORY_LOC"
                               AND D."PRODUCT_ID" = A."PRODUCT_ID")
                     ELSE
                         A.PRODUCT_ID
                     END  AS  "PRODUCT_ID",
                    A."REF_PRODID",
                    "VERSION",
                    "SCENARIO",
                    "MODEL_VERSION",
                    "ASSEMBLY",
                    CASE
                    WHEN B.FACTORY_LOC <> A.FACTORY_LOC
                    THEN
                    CONCAT(
                        CONCAT(A."FACTORY_LOC", '_'),
                        UPPER(
                            (SELECT MAX(DUMMY_PRODUCTID)
                             FROM CP_DUMMY_PRODUCT_LOC D
                             WHERE D."FACTORY_LOC" = A."FACTORY_LOC"
                               AND D."PRODUCT_ID" = A."PRODUCT_ID")
                        )
                    )
                     ELSE
                         CONCAT(CONCAT(A.FACTORY_LOC,'_'), A.PRODUCT_ID)
                     END
                    AS "SOURCE_ID",
                    TO_TIMESTAMP("WEEK_STARTDATE") AS WEEK_DATE,
                    TO_NVARCHAR(SUM("TOTAL_QTY")) AS ASMB_REQ,
                    sum(A."CIR_ASMB_QTY"), 
                    sum(A."ACTUAL_QTY"),
                    MAX(PROD_DEM),
                    CAST(
                        COALESCE(
                            CASE 
                                WHEN SUM(COALESCE(A."CIR_ASMB_QTY", 0) + COALESCE(A."ACTUAL_QTY", 0)) = 0
                                    OR MAX(A.PROD_DEM) = 0
                                THEN 0
                                ELSE ROUND(
                                    SUM(COALESCE(A."CIR_ASMB_QTY", 0) + COALESCE(A."ACTUAL_QTY", 0))
                                    / MAX(A.PROD_DEM), 
                                    3
                                )
                            END
                        , 0) AS DECIMAL(10,3)
                    ) AS COEFFICIENTS
                    FROM V_ASSEMBLY_COMPONENT as A
                    INNER JOIN V_FACTORYLOC AS B
                    ON  B.DEMAND_LOC = A.LOCATION_ID
                    AND B.PRODUCT_ID = A.PRODUCT_ID            
                     
                     WHERE B.FACTORY_LOC =   '` + lilocProd.LOCATION_ID + `'                      
                       AND A.VERSION =  '` + lilocProd.VERSION + `'
                       AND A.SCENARIO =  '` + lilocProd.SCENARIO + `'
                       AND A.MODEL_VERSION =  '` + lilocProd.MODEL_VERSION + `'
                       AND A.PRODUCT_ID IN(${sProducts})
                       AND A.TYPE = 'PI'
                       GROUP BY  "LOCATION_ID",
                                A."PRODUCT_ID",
                                A."FACTORY_LOC",
                                B.FACTORY_LOC,
                                A."REF_PRODID",
                                "ASSEMBLY",
                                "VERSION",
                                "SCENARIO",
                                "MODEL_VERSION",
                                "WEEK_STARTDATE"  `);

// Fetch Dummy Product Component Req
            let aDummyProdReq = await cds.run(`
                   SELECT DISTINCT
                                 TO_TIMESTAMP("CP_ASSEMBLY_REQ"."WEEK_DATE") AS WEEK_DATE,
                                                        "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID",
                                                        CASE
                                                         WHEN "CP_ASSEMBLY_REQ"."LOCATION_ID" <> "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID"
                                                         THEN CONCAT("CP_ASSEMBLY_REQ"."PRODUCT_ID", CONCAT( '_', "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID" )
                                                            )
                                                        ELSE "CP_ASSEMBLY_REQ"."PRODUCT_ID"
                                                        END AS PRODUCT_ID,
                                                        "CP_DUMMY_PRODUCT_LOC"."DUMMY_PRODUCTID" AS ASSEMBLY,
                                                        "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID" as FACTORY_LOC,
                                                        "CP_ASSEMBLY_REQ"."REF_PRODID",
                                                        TO_NVARCHAR("CP_IBP_FUTUREDEMAND"."QUANTITY")  AS ASMB_REQ,
                                                        TO_NVARCHAR(1) AS COEFFICIENTS,
                                                        "CP_ASSEMBLY_REQ"."VERSION",
                                                        "CP_ASSEMBLY_REQ"."SCENARIO",
                                                         "CP_ASSEMBLY_REQ"."MODEL_VERSION",
                                                         CASE 
                                                         WHEN  "CP_ASSEMBLY_REQ"."LOCATION_ID"  <> CP_DUMMY_PRODUCT_LOC.LOCATION_ID
                                                           THEN
                                                         CONCAT(CONCAT(CONCAT(CONCAT(CP_DUMMY_PRODUCT_LOC.LOCATION_ID,'_'),CP_DUMMY_PRODUCT_LOC.PRODUCT_ID),'_'),CP_DUMMY_PRODUCT_LOC.LOCATION_ID) 
                                                         ELSE
                                                           CONCAT(CONCAT(CP_DUMMY_PRODUCT_LOC.LOCATION_ID,'_'),CP_DUMMY_PRODUCT_LOC.PRODUCT_ID)
                                                         END  as SOURCE_ID
                                                         FROM CP_ASSEMBLY_REQ
                                                        INNER JOIN CP_IBP_FUTUREDEMAND
                                                        ON CP_ASSEMBLY_REQ.WEEK_DATE = CP_IBP_FUTUREDEMAND.WEEK_DATE
                                                        AND CP_ASSEMBLY_REQ.LOCATION_ID = CP_IBP_FUTUREDEMAND.LOCATION_ID
                                                        AND CP_ASSEMBLY_REQ.PRODUCT_ID = CP_IBP_FUTUREDEMAND.PRODUCT_ID
                                                        AND CP_ASSEMBLY_REQ.VERSION = CP_IBP_FUTUREDEMAND.VERSION
                                                        AND CP_ASSEMBLY_REQ.SCENARIO = CP_IBP_FUTUREDEMAND.SCENARIO
                                                        INNER JOIN CP_DUMMY_PRODUCT_LOC
                                                        ON CP_ASSEMBLY_REQ.FACTORY_LOC = CP_DUMMY_PRODUCT_LOC.FACTORY_LOC
                                                        AND CP_DUMMY_PRODUCT_LOC.DUMMY_PRODUCTID = CONCAT(CP_ASSEMBLY_REQ.REF_PRODID,CONCAT('_', CP_DUMMY_PRODUCT_LOC.FACTORY_LOC))
                                                        WHERE "CP_DUMMY_PRODUCT_LOC".LOCATION_ID <> "CP_DUMMY_PRODUCT_LOC".FACTORY_LOC
                                                        AND CP_ASSEMBLY_REQ."LOCATION_ID" =  '` + lilocProd.LOCATION_ID + `'
                                                            AND CP_ASSEMBLY_REQ."VERSION" =  '` + lilocProd.VERSION + `'
                                                            AND CP_ASSEMBLY_REQ."SCENARIO" =  '` + lilocProd.SCENARIO + `'
                                                            AND CP_ASSEMBLY_REQ."MODEL_VERSION" =  '` + lilocProd.MODEL_VERSION + `'
                                                            AND CP_ASSEMBLY_REQ."PRODUCT_ID" IN(${sProducts})
                                                        AND CP_ASSEMBLY_REQ.COMPCIR_QTY >= 0
                                                        AND CP_ASSEMBLY_REQ.TYPE = 'PI'
                                                        ORDER BY
                                                        "CP_ASSEMBLY_REQ"."WEEK_DATE" ASC,
                                                        "CP_DUMMY_PRODUCT_LOC"."LOCATION_ID" ASC,
                                                        "CP_ASSEMBLY_REQ"."PRODUCT_ID" ASC,
                                                        "CP_DUMMY_PRODUCT_LOC"."DUMMY_PRODUCTID" ASC,
                                                        "CP_ASSEMBLY_REQ"."FACTORY_LOC" ASC,
                                                        "CP_ASSEMBLY_REQ"."REF_PRODID" ASC `);
            if (aDummyProdReq.length > 0) {
                liactcomp = [...liactcomp, ...aDummyProdReq];
            }

console.log("aDummyProdReq", aDummyProdReq[0]);
console.log(liactcomp[0]);


 let Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
        let distData = GenF.removeDuplicate(aTableData, Keys);

 let aMappingData = [];      
        for (var z = 0; z < distData.length; z++) {
            
                aMappingData = aTableData.filter(e=> e.PLANNING_AREA == distData[z].PLANNING_AREA);

                let sPlan = aMappingData[0].PLANNING_AREA;
                let lMasterDataType = liParaValue[0].VALUE.toString();
                let lData = "Nav" + lMasterDataType;
                let lEntity = "/" + lMasterDataType + "Trans";
                
                console.log("sPlan", sPlan);
                console.log("lData", lData);
                console.log("lEntity", lEntity);
                console.log("lMasterDataType", lMasterDataType);

        let aCompCoeff = await GenF.mappingData('Component Coefficient', distData[z].PLANNING_AREA,'', liactcomp);
        if (aCompCoeff.length > 0) {
        // let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Component Coefficient'`);
        aMappingData.filter((el)=>{
            if(el.TYPE == 'C'){
                el.MAPPING_FIELD = el.BTP_FIELD
            }
            else if(el.TYPE == 'D'){
                el.BTP_FIELD = el.MAPPING_FIELD
            }
        }) 
        const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
         aCompCoeff = aCompCoeff.filter(record => {
             return requiredFields.every(field => record[field] != null && record[field] != "");
         });
         
        let Keys = Object.keys(aCompCoeff[0]);
        let requestedAttributesStr = Array.from(Keys).join(',');

        let vKeysReq = Keys;
            FinalData = GenF.removeDuplicate(aCompCoeff, vKeysReq);
console.log("FinalData", FinalData[0]);
        let vTransID = new Date().getTime().toString();
//         const date = new Date();
// let newD = new Date(date.setFullYear(date.getFullYear() - 10));
//             let vTransID = newD.getTime().toString();
        

            if (FinalData.length > 5000) {
                                let iChnk, iChkCounter = 0;
                                // Initialize Parallel processing
                                let resUrlPP = "/InitiateParallelProcess?ScenarioID=''&VersionID=''&PlanningArea='" + sPlan + "'&Transactionid='" + vTransID + "'";
                                try {
                                    await service.tx(req).post(resUrlPP);
                                } catch (e) {
                                    console.log(e);
                                }
                                // Divide into multiple arrays with each array length as 5000
                                chunked = true;
                                let aData = FinalData;
                                chunksList = [];
                                const chunkSize = 5000;
                                for (let i = 0; i < aData.length; i += chunkSize) {
                                    const chunk = aData.slice(i, i + chunkSize)
                                    chunksList.push(chunk);
                                }
                                let aTransactionIds =[];
                                // Process each chunk to IBP
                                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
                                    vTransID = (parseInt(vTransID) + 1).toString();
                                    aTransactionIds.push(vTransID);
                                    let oEntryCfgPP = {
                                        "Transactionid": vTransID,
                                        "AggregationLevelFieldsString": requestedAttributesStr,
                                        "VersionID": lilocProd.VERSION
                                        // "ScenarioID": ""
                                    }
                                    oEntryCfgPP[lData] = chunksList[iChnk];
                                    try {
                                        req.headers['Application-Interface-Key'] = vAIRKey;
                                        console.log(req.headers);
                                        await service.tx(req).post(lEntity, oEntryCfgPP);
                                        iChkCounter = iChkCounter + 1;
                                    } catch (err) {
                                        console.log(err);
                                        iChkCounter = 0;
                                        console.log(err.message);
                                    }
                                }
                                // If all are successfull commit the request
                                let commitFlag = '';
                               if (iChkCounter == chunksList.length) {
                                    for (let tid of aTransactionIds) {
                                            let commitUrl = `/commit?P_TransactionID='${tid}'&$format=json`;

                                            try {
                                                await service.tx(req).post(commitUrl);
                                                console.log("Committed Transaction:", tid);
                                            } catch (e) {
                                                commitFlag = 'X';
                                                console.log("Commit failed for Transaction:", tid, e.message);
                                            }
                                        }
                                    // let resUrlPPCommit = "/commit?P_TransactionID='" + vTransID + "'&$format=json";
                                    
                                    // try {
                                    //     await service.tx(req).post(resUrlPPCommit);
                                    //     lMessage = lMessage + ' ' + 'Export of Component Coefficient is successfull for products:' + sProducts;
                                    //     response = response + ' ' + 'Export of Component Coefficient is successfull for products:' + sProducts + " and for " + liParaValue[0].VALUE.toString();
                                    // } catch (e) {
                                    //     response = response + ' ' + 'Export of Component Coefficient is failed for products:' + sProducts + " and for " + liParaValue[0].VALUE.toString()+`. Reason: ${e.message}`;
                                    //     console.log("Error while committing the parallel processing Component Coefficient is failed for products:"  + sProducts);
                                    // }
                                }
                                if(commitFlag == 'X'){
                                    response = response + ' ' + 'Export of Component Coefficient is failed for products:' + sProducts + " and for " + liParaValue[0].VALUE.toString()+`. Reason: ${e.message}`;
                                        console.log("Error while committing the parallel processing Component Coefficient is failed for products:"  + sProducts);                                    
                                } else {
                                    // Message = lMessage + ' ' + 'Export of Component Coefficient is successfull for products:' + sProducts;
                                        response = response + ' ' + 'Export of Component Coefficient is successfull for products:' + sProducts + " and for " + liParaValue[0].VALUE.toString();
                                }
                            }
                            // If is less that 5000 records
                            else {
                              let oEntry = {
                                    "Transactionid": vTransID,
                                    "AggregationLevelFieldsString": requestedAttributesStr,
                                    "VersionID": lilocProd.VERSION,
                                    "DoCommit": true
                                    // "ScenarioID": ""
                                }
                                oEntry[lData] = FinalData;
console.log("final", lEntity);
// console.log("Final oentry", oEntry)
                                try {
                                    req.headers['Application-Interface-Key'] = vAIRKey;
                                    await service.tx(req).post(lEntity, oEntry);
                                    let resUrl = "/getExportResult?P_EntityName='" + sPlan + "'&P_TransactionID='" + vTransID + "'";
                                    await service.tx(req).get(resUrl);
                                    flag = 'X';
                                    lMessage = lMessage + ' ' + 'Export of  Component Coefficient is successfull for products:' + sProducts;
                                    response = response + ' ' + 'Export of Component Coefficient is successfull for products:' + sProducts + " and for " + liParaValue[0].VALUE.toString();
                                } catch(e) {
                                    lMessage = lMessage + ' ' + 'Export of  Component Coefficient failed for products:' + sProducts+`. Reason: ${e.message}`;
                                    let sLog = 'Export of  Component Coefficient failed for products:' + sProducts+`. Reason: ${e.message}`;
                                    response = response + ' ' + 'Export of Component Coefficient is failed for products:' + sProducts + " and for " + liParaValue[0].VALUE.toString()+`. Reason: ${e.message}`;
                                    aErrorLog.push(sLog);
                                }
                            }


            // let oEntry = {
            //     "Transactionid": vTransID,
            //     "AggregationLevelFieldsString": requestedAttributesStr,
            //     "VersionID": "",
            //     "DoCommit": true,
            //     "ScenarioID": ""
            // }
            // oEntry[lData] = aCompCoeff;
            // try {
            //     req.headers['Application-Interface-Key'] = vAIRKey;
            //     await service.tx(req).post(lEntity, oEntry);
            //     let resUrl = "/getExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
            //     await service.tx(req).get(resUrl);
            //     flag = 'X';
            //     lMessage = lMessage + ' ' + 'Export of  Component Coefficient is successfull for products:' + sProducts;
            // } catch {
            //     lMessage = lMessage + ' ' + 'Export of  Component Coefficient failed for products:' + sProducts;
            //     let sLog = 'Export of  Component Coefficient failed for products:' + sProducts;
            //     aErrorLog.push(sLog);
            // }
        } else {

            console.log("FinalData.length", FinalData.length);
            console.log("liactcomp.length", liactcomp.length);

            lMessage = lMessage + ' ' + 'No  Component Coefficient exists on Crtical components for products:' + sProducts;
            let sLog = 'No  Component Coefficient exists on Crtical components for products:' + sProducts;
            response = response + ' ' + 'No  Component Coefficient exists on Crtical components for products:' + sProducts + " and for " + liParaValue[0].VALUE.toString();
            // aErrorLog.push(sLog);
        }
    }
        // }
        console.log("aErrorLog", aErrorLog);
        if (aErrorLog.length !== 0) { //Success
            await GenF.jobSchMessage('', response, req);
        } else {
            await GenF.jobSchMessage('X', response, req);
        }
    });

    // creation of SOP IN CAPACONSUMPTION
   this.on("exportCapacityConsumption", async (req) => {

        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getParameterPrefix();
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Capacity Consumption'`);
           let sPlan = aTableData[0].PLANNING_AREA
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";

        let oReq = {
            actcomp: [],
        },
            vactcomp, lMessage = '';
        // Generating payload for job scheduler logs
     
        let lilocProd = JSON.parse(req.data.LocProdData);
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started exporting Capacity Consumption";
        let res = req._.req.res;
        var aErrorLog = [];
        let response = '';


        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });
        //    let oProducts = [];
    //     for(var i=0; i<lilocProd.length; i++){
    //         oProducts.push(lilocProd[i].PRODUCT_ID);
    //     }
         let sProducts = lilocProd.PRODUCT_ID.map(id => `'${id}'`).join(', ');
         console.log(sProducts);

        const liactcomp = await cds.run(
            `
             SELECT  DISTINCT
                    "LOCATION_ID",
                     "FACTORY_LOC",
                    "PRODUCT_ID",
                    "COMPONENT",
                    "VERSION",
                    "SCENARIO",
                    "MODEL_VERSION",
                    TO_TIMESTAMP("WEEK_DATE") AS WEEK_DATE,
                    "RESTRICTION",
                    TO_NVArCHAR("COMPCIR_QTY") AS COMPCIR_QTY,
                    TO_NVArCHAR("QUANTITY") As QUANTITY,
                    TO_NVArCHAR("COEFFCIENT") AS COEFFCIENT
                    FROM V_CAPACITY_CONSUMPTION
                    WHERE FACTORY_LOC =  '` + lilocProd.LOCATION_ID + `'
                       
                       AND VERSION =  '` + lilocProd.VERSION + `'
                       AND SCENARIO =  '` + lilocProd.SCENARIO + `'
                       AND MODEL_VERSION =  '` + lilocProd.MODEL_VERSION + `'
                       AND PRODUCT_ID IN(${sProducts})
                       
                       `);
        console.log(liactcomp);

        let Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
        let distData = GenF.removeDuplicate(aTableData, Keys);

         let aMappingData = [];      
        for (var z = 0; z < distData.length; z++) {
            
                aMappingData = aTableData.filter(e=> e.PLANNING_AREA == distData[z].PLANNING_AREA);

        let aCapConsump = await GenF.mappingData('Capacity Consumption',distData[z].PLANNING_AREA, '', liactcomp);
        if (aCapConsump.length > 0 ) {
        // let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Capacity Consumption'`);
        aMappingData.filter((el)=>{
            if(el.TYPE == 'C'){
                el.MAPPING_FIELD = el.BTP_FIELD
            }
            else if(el.TYPE == 'D'){
                el.BTP_FIELD = el.MAPPING_FIELD
            }
        })
        const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
         aCapConsump = aCapConsump.filter(record => {
             return requiredFields.every(field => record[field] != null && record[field] != "");
         });
        let Keys = Object.keys(aCapConsump[0]);
        let requestedAttributesStr = Array.from(Keys).join(',');

             let vKeysReq = Keys;
            aCapConsump = GenF.removeDuplicate(aCapConsump, vKeysReq);
       

                let vTransID = new Date().getTime().toString();



               if (aCapConsump.length > 5000) {
                                let iChnk, iChkCounter = 0;
                                // Initialize Parallel processing
                                let resUrlPP = "/InitiateParallelProcess?ScenarioID=''&VersionID=''&PlanningArea='" + sPlan + "'&Transactionid='" + vTransID + "'";
                                try {
                                    await service.tx(req).post(resUrlPP);
                                } catch (e) {
                                    console.log(e);
                                }
                                // Divide into multiple arrays with each array length as 5000
                                chunked = true;
                                let aData = aCapConsump;
                                chunksList = [];
                                const chunkSize = 5000;
                                for (let i = 0; i < aData.length; i += chunkSize) {
                                    const chunk = aData.slice(i, i + chunkSize)
                                    chunksList.push(chunk);
                                }
                                // Process each chunk to IBP
                                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
                                    let oEntryCfgPP = {
                                        "Transactionid": vTransID,
                                        "AggregationLevelFieldsString": requestedAttributesStr,
                                        "VersionID": "",
                                        "ScenarioID": ""
                                    }
                                    oEntryCfgPP[lData] = chunksList[iChnk];
                                    try {
                                        req.headers['Application-Interface-Key'] = vAIRKey;
                                        console.log(req.headers);
                                        await service.tx(req).post(lEntity, oEntryCfgPP);
                                        iChkCounter = iChkCounter + 1;
                                    } catch (err) {
                                        console.log(err);
                                        // iChkCounter = 0;
                                        // console.log(err.message);
                                    }
                                }
                                // If all are successfull commit the request
                                if (iChkCounter > 0) {
                                    let resUrlPPCommit = "/commit?P_TransactionID='" + vTransID + "'&$format=json";
                                    try {
                                        await service.tx(req).post(resUrlPPCommit);
                                        lMessage = lMessage + ' ' + 'Export of Capacity Consumption is successfull for:' + lilocProd.LOCATION_ID;
                                        response = response + ' ' + 'Export of Capacity Consumption is successfull for:' + sProducts;
                                    } catch (e) {
                                        response = response + ' ' + 'Export of Capacity Consumption is failed for Product:' + sProducts+`. Reason: ${e.message}`;
                                        console.log("Error while committing the parallel processing for Capacity Consumption for Product :" + lilocProd.LOCATION_ID);
                                    }
                                }
                            }
                            // If is less that 5000 records
                            else {
                              let oEntry = {
                                    "Transactionid": vTransID,
                                    "AggregationLevelFieldsString": requestedAttributesStr,
                                    "VersionID": "",
                                    "DoCommit": true,
                                    "ScenarioID": ""
                                }
                                oEntry[lData] = aCapConsump;
                                try {
                                    req.headers['Application-Interface-Key'] = vAIRKey;
                                    await service.tx(req).post(lEntity, oEntry);
                                    let resUrl = "/getExportResult?P_EntityName='" + sPlan + "'&P_TransactionID='" + vTransID + "'";
                                    await service.tx(req).get(resUrl);
                                    flag = 'X';
                                        response = response + ' ' + 'Export of Capacity Consumption is successfull for products:' + sProducts;
                                    lMessage = lMessage + ' ' + 'Export of  Capacity Consumption is successfull for products:' + sProducts;
                                } catch(e) {
                                    lMessage = lMessage + ' ' + 'Export of  Capacity Consumption failed for products:' + sProducts+`. Reason: ${e.message}`;
                                        response = response + ' ' + 'Export of Capacity Consumption is failed for products:' + sProducts+`. Reason: ${e.message}`;

                                    let sLog = 'Export of  Capacity Consumption is failed for products:' + sProducts;
                                    aErrorLog.push(sLog);
                                }
                            }
        
            // let vTransID = new Date().getTime().toString();
            // let oEntry = {
            //     "Transactionid": vTransID,
            //     "AggregationLevelFieldsString": requestedAttributesStr,
            //     "VersionID": "",
            //     "DoCommit": true,
            //     "ScenarioID": ""
            // }
            // oEntry[lData] = aCapConsump;
            // try {
            //     req.headers['Application-Interface-Key'] = vAIRKey;
            //     await service.tx(req).post(lEntity, oEntry);
            //     let resUrl = "/getExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
            //     await service.tx(req).get(resUrl);
            //     flag = 'X';
            //     lMessage = lMessage + ' ' + 'Export of  Capacity Consumption is successfull for products:' + sProducts;
            // } catch {
            //     lMessage = lMessage + ' ' + 'Export of  Capacity Consumption failed for products:' + sProducts;
            //     let sLog = 'Export of  Capacity Consumption for products:' + sProducts;
            //     aErrorLog.push(sLog);
            // }
        } else {
            console.log("aCapConsump.length", aCapConsump.length);
            console.log("liactcomp.length", liactcomp.length);
            lMessage = lMessage + ' ' + 'No  Capacity Consumption for products:' + sProducts;
            response = response + ' ' + 'No  Capacity Consumption for products:' + sProducts;
            let sLog = 'No  Capacity Consumption for products:' + sProducts;
            // aErrorLog.push(sLog);
        }
        // }
    }

        console.log("aErrorLog", aErrorLog);
        if (aErrorLog.length !== 0) { //Success
            await GenF.jobSchMessage('', response, req);
        } else {
            await GenF.jobSchMessage('X', response, req);
        }
    });

    //Creation of SOP  Restriction Capacity
    this.on("exportRestrictionCapacity", async (req) => {
        let response = '';
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getParameterPrefix();
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Restriction Capacity'`);
        let sPlan = aTableData[0].PLANNING_AREA
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";

        let oReq = {
            actcomp: [],
        },
            vactcomp, lMessage = '';
        // Generating payload for job scheduler logs
        // let lilocProd = JSON.parse(req.data.LocProdData);
        let lsData = {};
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
          
        let lilocProd = JSON.parse(req.data.LocProdData)
        let message = "Started exporting Restriction Capacity";
        let res = req._.req.res;
        var aErrorLog = [];


        values.push({
            id,
            createtAt,
            message,
            lilocProd
        });
        res.statusCode = 202;
        res.send({
            values
        });

    //     //    let oProducts = [];
    // //     for(var i=0; i<lilocProd.length; i++){
    // //         oProducts.push(lilocProd[i].PRODUCT_ID);
    // //     }
    //      let sProducts = lilocProd.PRODUCT_ID.map(id => `'${id}'`).join(', ');
    //      console.log(sProducts);
        // const liactcomp = await cds.run(
        //     `SELECT DISTINCT
        //     "LOCATION_ID",
        //     "LOCATION_DESC",
        //     "PRODUCT_ID",
        //     "LINE_ID",
        //     "RESTRICTION",
        //     TO_TIMESTAMP("WEEK_DATE") AS WEEK_DATE,
        //     "MODEL_VERSION",
        //     "VERSION",
        //     "SCENARIO",
        //     "RTR_QTY"
         
        //     FROM V_RESTRICTIONREQV2
        //      WHERE LOCATION_ID =  '` + lilocProd.LOCATION_ID + `'
                       
        //                AND VERSION =  '` + lilocProd.VERSION + `'
        //                AND SCENARIO =  '` + lilocProd.SCENARIO + `'
        //                AND MODEL_VERSION =  '` + lilocProd.MODEL_VERSION + `'
        //                AND PRODUCT_ID IN(${sProducts})
           
        //                `);

        const liactcomp = await cds.run(
                        `SELECT LOCATION_ID,
                                RESTRICTION ,
                                TO_TIMESTAMP("WEEK_DATE") AS WEEK_DATE,
                                TO_NVARCHAR("RESTRICTIONAVAIL_QTY") AS RTR_QTY
                                FROM CP_RESTRICTION_AVAIL

                                WHERE LOCATION_ID =  '` + lilocProd.LOCATION_ID + `'
                                GROUP BY LOCATION_ID,
                                        RESTRICTION ,
                                        WEEK_DATE,
                                        RESTRICTIONAVAIL_QTY

                                `);
        console.log(liactcomp);

        // liactcomp.forEach(el => {
        //     el.RTR_QTY = el.RTR_QTY.toString();
        // });


        let Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
        let distData = GenF.removeDuplicate(aTableData, Keys);
         let aMappingData = [];      
        for (var z = 0; z < distData.length; z++) {
            
                aMappingData = aTableData.filter(e=> e.PLANNING_AREA == distData[z].PLANNING_AREA);
        let aRestCap = await GenF.mappingData('Restriction Capacity',distData[z].PLANNING_AREA, '', liactcomp);
         if (aRestCap.length > 0 )  {
        // let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Restriction Capacity'`);
        aMappingData.filter((el)=>{
            if(el.TYPE == 'C'){
                el.MAPPING_FIELD = el.BTP_FIELD
            }
            else if(el.TYPE == 'D'){
                el.BTP_FIELD = el.MAPPING_FIELD
            }
        }) 
        const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
         aRestCap = aRestCap.filter(record => {
             return requiredFields.every(field => record[field] != null && record[field] != "");
         });
        let Keys = Object.keys(aRestCap[0]);
        let requestedAttributesStr = Array.from(Keys).join(',');

            let vKeysReq = Keys;
            aRestCap = GenF.removeDuplicate(aRestCap, vKeysReq);
       

                let vTransID = new Date().getTime().toString();



               if (aRestCap.length > 5000) {
                                let iChnk, iChkCounter = 0;
                                // Initialize Parallel processing
                                let resUrlPP = "/InitiateParallelProcess?ScenarioID=''&VersionID=''&PlanningArea='" + sPlan + "'&Transactionid='" + vTransID + "'";
                                try {
                                    await service.tx(req).post(resUrlPP);
                                } catch (e) {
                                    console.log(e);
                                }
                                // Divide into multiple arrays with each array length as 5000
                                chunked = true;
                                let aData = aRestCap;
                                chunksList = [];
                                const chunkSize = 5000;
                                for (let i = 0; i < aData.length; i += chunkSize) {
                                    const chunk = aData.slice(i, i + chunkSize)
                                    chunksList.push(chunk);
                                }
                                // Process each chunk to IBP
                                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
                                    let oEntryCfgPP = {
                                        "Transactionid": vTransID,
                                        "AggregationLevelFieldsString": requestedAttributesStr,
                                        "VersionID": "",
                                        "ScenarioID": ""
                                    }
                                    oEntryCfgPP[lData] = chunksList[iChnk];
                                    try {
                                        req.headers['Application-Interface-Key'] = vAIRKey;
                                        console.log(req.headers);
                                        await service.tx(req).post(lEntity, oEntryCfgPP);
                                        iChkCounter = iChkCounter + 1;
                                    } catch (err) {
                                        console.log(err);
                                        // iChkCounter = 0;
                                        // console.log(err.message);
                                    }
                                }
                                // If all are successfull commit the request
                                if (iChkCounter > 0) {
                                    let resUrlPPCommit = "/commit?P_TransactionID='" + vTransID + "'&$format=json";
                                    try {
                                        await service.tx(req).post(resUrlPPCommit);
                                        lMessage = lMessage + ' ' + 'Export of  Resource Capacity is successfull for:' + lilocProd.LOCATION_ID;
                                        response = response + ' ' + 'Export of  Resource Capacity is successfull for:' + lilocProd.LOCATION_ID;
                                    } catch (e) {
                                        console.log("Error while committing the parallel processing" + lilocProd.LOCATION_ID);
                                        response = response + ' ' + 'Export of  Resource Capacity is failed for:' + lilocProd.LOCATION_ID+`.Reason: ${e.message}`;

                                    }
                                }
                            }
                            // If is less that 5000 records
                            else {
                               let oEntry = {
                                    "Transactionid": vTransID,
                                    "AggregationLevelFieldsString": requestedAttributesStr,
                                    "VersionID": "",
                                    "DoCommit": true,
                                    "ScenarioID": ""
                                }
                                oEntry[lData] = aRestCap;
                                try {
                                    req.headers['Application-Interface-Key'] = vAIRKey;
                                    await service.tx(req).post(lEntity, oEntry);
                                    let resUrl = "/getExportResult?P_EntityName='" + sPlan + "'&P_TransactionID='" + vTransID + "'";
                                    await service.tx(req).get(resUrl);
                                    flag = 'X';
                                    lMessage = lMessage + ' ' + 'Export of  Resource Capacity is successfull for:' + lilocProd.LOCATION_ID;
                                    response = response + ' ' + 'Export of  Resource Capacity is successfull for:' + lilocProd.LOCATION_ID;

                                } catch(e) {
                                    lMessage = lMessage + ' ' + 'Export of  Resource Capacity failed for:' + lilocProd.LOCATION_ID+`.Reason: ${e.message}`;
                                    let sLog = 'Export of  Resource Capacity failed for:' + lilocProd.LOCATION_ID+`.Reason: ${e.message}`;
                                    response = response + ' ' + 'Export of  Resource Capacity is failed for:' + lilocProd.LOCATION_ID+`.Reason: ${e.message}`;

                                    aErrorLog.push(sLog);
                                }
                            }

 



            
        } else {
            console.log("aRestCap.length", aRestCap.length);
            console.log("liactcomp.length", liactcomp.length);
            lMessage = lMessage + ' ' + 'No  Resource Capacity exists for:' + lilocProd.LOCATION_ID;
            response = response + ' ' + 'No  Resource Capacity exists for:' + lilocProd.LOCATION_ID;
            let sLog = 'No  Resource Capacity exists  :' + lilocProd.LOCATION_ID;
            // aErrorLog.push(sLog);
        }
        // }
    }
        console.log("aErrorLog", aErrorLog);
        if (aErrorLog.length !== 0) { //Success
            await GenF.jobSchMessage('', response, req);
        } else {
            await GenF.jobSchMessage('X', response, req);
        }
    });

    //Creation of SOP LINE
      this.on("exportIBPResource", async (req) => {
 
        // Get Planning area and Prefix configurations for IBP
        let response = '';
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Line Master'`);
         let liParaValue = await GenF.getParameterID();
        // // let lData = "Nav" + liParaValue[0].VALUE.toString() + "RESOURCE";
        // // let lEntity = "/" + liParaValue[0].VALUE.toString() + "RESOURCETrans";
        //  let sPlan = aMappingData[0].PLANNING_AREA;
        // let lData = "Nav" + sPlan;
        // let lEntity = "/" + sPlan + "Trans";
        // let lMasterDataType = sPlan;
        let oReq = {
            newLoc: [],
        },
            vNewLoc, flag = '';
            let lilocProd = JSON.parse(req.data.LocProdData);

    //         // let liline = JSON.parse(LocProdData);
    //     //    let oProducts = [];
    // //     for(var i=0; i<lilocProd.length; i++){
    // //         oProducts.push(lilocProd[i].PRODUCT_ID);
    // //     }
    //      let sProducts = lilocProd.PRODUCT_ID.map(id => `'${id}'`).join(', ');
    //      console.log(sProducts);
        const linewloc = await cds.run(
            `
            SELECT DISTINCT "LOCATION_ID",
                            "RESTRICTION",
                            "RTR_DESC"
                   FROM V_LOCPRODLINERTR
                       WHERE LOCATION_ID =  '` + lilocProd.LOCATION_ID + `'
                       `);
                    //    AND PRODUCT_ID IN(${sProducts}) `);

                let Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
                let distData = GenF.removeDuplicate(aTableData, Keys);

             let aMappingData = [];      
        for (var z = 0; z < distData.length; z++) {
            
                aMappingData = aTableData.filter(e=> e.PLANNING_AREA == distData[z].PLANNING_AREA);

                let sPlan = aMappingData[0].PLANNING_AREA;
                let lData = "Nav" + liParaValue[0].VALUE.toString() + sPlan;
                let lEntity = "/" + liParaValue[0].VALUE.toString() + sPlan + "Trans";
                let lMasterDataType = liParaValue[0].VALUE.toString() + sPlan;
                console.log("sPlan", sPlan);
                console.log("lData", lData);
                console.log("lEntity", lEntity);
                console.log("lMasterDataType", lMasterDataType);

        let aRes = await GenF.mappingData('Line Master',distData[z].PLANNING_AREA,'',linewloc);
          if (aRes.length > 0) {
        // let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Line Master'`);
        aMappingData.filter((el)=>{
            if(el.TYPE == 'C'){
                el.MAPPING_FIELD = el.BTP_FIELD
            }
            else if(el.TYPE == 'D'){
                el.BTP_FIELD = el.MAPPING_FIELD
            }
        }) 
        const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
         aRes = aRes.filter(record => {
             return requiredFields.every(field => record[field] != null && record[field] != "");
         });
        let Keys = Object.keys(aRes[0]);
        let requestedAttributesStr = Array.from(Keys).join(',');
      
            let vTransID = new Date().getTime().toString();
            // let vMDTyp = liParaValue[0].VALUE.toString() + "RESOURCE";
            let vMDTyp = lMasterDataType;
            // Parallel processing logic to export huge data buckets
            if (aRes.length > 5000) {
                let iChnk, iChkCounter = 0;
 
                // Initialize Parallel processing
                let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
                try {
                    await servicePost.tx(req).post(reqUrlPPInit);
                } catch (e) {
                    console.log(e);
                }
 
                // Divide into multiple arrays with each array length as 5000
                chunked = true;
                let aData = aRes;
                chunksList = [];
                const chunkSize = 5000;
 
                for (let i = 0; i < aData.length; i += chunkSize) {
                    const chunk = aData.slice(i, i + chunkSize)
                    chunksList.push(chunk);
                }
 
                // Process each chunk to IBP
                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
 
                    let oEntry = {
                        "TransactionID": vTransID,
                        "RequestedAttributes": requestedAttributesStr
                    }
                    oEntry[lData] = chunksList[iChnk];
                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        console.log(req.headers);
                        await servicePost.tx(req).post(lEntity, oEntry);
                        iChkCounter = iChkCounter + 1;
                    } catch (err) {
                        GenF.log(err);
                    }
                }
                // If all are successfull commit the request
                if (iChkCounter > 0) {
                    let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
                    try {
                        await servicePost.tx(req).post(reqUrlPPCommit);
                        flag = 'X';
                        response = response + "Export of Resource is successful for " + lMasterDataType;
                    } catch (e) {
                        response = response + "Export of Resource is failed for " + lMasterDataType+`.Reason: ${e.message}`;
                        GenF.log("Error while committing the parallel processing");
                    }
                }
            }
            else {
                let oEntry = {
                    "TransactionID": vTransID,
                    "RequestedAttributes": requestedAttributesStr,
                    "DoCommit": true
                }
                oEntry[lData] = aRes;
 
                try {
                    req.headers['Application-Interface-Key'] = vAIRKey;
                    console.log(req.headers);
                    await servicePost.tx(req).post(lEntity, oEntry);
                    let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                    let vResponse = await servicePost.tx(req).get(resUrl);
                    flag = 'X';
                     response = response + "Export of Resource is successful for " + lMasterDataType;
                } catch (error) {
                    response = response + "Export of Resource is failed for " + lMasterDataType+`.Reason: ${error.message}`
                }
            }
        }
    }
        if (flag === 'X') {
            await GenF.jobSchMessage('X', response, req);
        } else {
            await GenF.jobSchMessage('', response, req);
        }
    });

     this.on("exportIBPResourceLoc", async (req) => {
        let response ='';
        // Get Planning area and Prefix configurations for IBP
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Location Line'`);
        let liParaValue = await GenF.getParameterID();
        // // let lData = "Nav" + liParaValue[0].VALUE.toString() + "RESOURCELOCATION";
        // // let lEntity = "/" + liParaValue[0].VALUE.toString() + "RESOURCELOCATIONTrans";
        //  let sPlan = aMappingData[0].PLANNING_AREA;
        // let lData = "Nav" + sPlan;
        // let lEntity = "/" + sPlan + "Trans";
        // let lMasterDataType = sPlan;
        let oReq = {
            newLoc: [],
        },
        
        
            vNewLoc, flag = '';
            let lilocProd = JSON.parse(req.data.LocProdData);
    //         // let liline = JSON.parse(LocProdData)
    //        //    let oProducts = [];
    // //     for(var i=0; i<lilocProd.length; i++){
    // //         oProducts.push(lilocProd[i].PRODUCT_ID);
    // //     }
    //      let sProducts = lilocProd.PRODUCT_ID.map(id => `'${id}'`).join(', ');
    //      console.log(sProducts);
        const linewloc = await cds.run(
            `
            SELECT DISTINCT "LOCATION_ID",
                            "RESTRICTION"
                   FROM V_LOCPRODLINERTR
                   WHERE LOCATION_ID =  '` + lilocProd.LOCATION_ID + `'
                    `);
                    //    AND PRODUCT_ID IN(${sProducts}) `);
            let Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
                let distData = GenF.removeDuplicate(aTableData, Keys);
                    let aMappingData = [];      
        for (var z = 0; z < distData.length; z++) {
            
                aMappingData = aTableData.filter(e=> e.PLANNING_AREA == distData[z].PLANNING_AREA);

                let sPlan = aMappingData[0].PLANNING_AREA;
                let lData = "Nav" + liParaValue[0].VALUE.toString() + sPlan;
                let lEntity = "/" + liParaValue[0].VALUE.toString() + sPlan + "Trans";
                let lMasterDataType = liParaValue[0].VALUE.toString() + sPlan;
                console.log("sPlan", sPlan);
                console.log("lData", lData);
                console.log("lEntity", lEntity);
                console.log("lMasterDataType", lMasterDataType);

                   let aResource = await GenF.mappingData('Location Line',distData[z].PLANNING_AREA,'',linewloc);
                    if (aResource.length > 0) {
                //    let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Location Line'`);
         aMappingData.filter((el)=>{
            if(el.TYPE == 'C'){
                el.MAPPING_FIELD = el.BTP_FIELD
            }
            else if(el.TYPE == 'D'){
                el.BTP_FIELD = el.MAPPING_FIELD
            }
        })
                   const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
         aResource = aResource.filter(record => {
             return requiredFields.every(field => record[field] != null && record[field] != "");
         });
                   let Keys = Object.keys(aResource[0]);
                   let requestedAttributesStr = Array.from(Keys).join(',');
 
       
            let vTransID = new Date().getTime().toString();
            // let vMDTyp = liParaValue[0].VALUE.toString() + "RESOURCELOCATION";
            let vMDTyp = lMasterDataType;
            // Parallel processing logic to export huge data buckets
            if (aResource.length > 5000) {
                let iChnk, iChkCounter = 0;
 
                // Initialize Parallel processing
                let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
                try {
                    await servicePost.tx(req).post(reqUrlPPInit);
                } catch (e) {
                    console.log(e);
                }
 
                // Divide into multiple arrays with each array length as 5000
                chunked = true;
                let aData = aResource;
                chunksList = [];
                const chunkSize = 5000;
 
                for (let i = 0; i < aData.length; i += chunkSize) {
                    const chunk = aData.slice(i, i + chunkSize)
                    chunksList.push(chunk);
                }
 
                // Process each chunk to IBP
                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
 
                    let oEntry = {
                        "TransactionID": vTransID,
                        "RequestedAttributes": requestedAttributesStr
                    }
                    oEntry[lData] = chunksList[iChnk];
                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        console.log(req.headers);
                        await servicePost.tx(req).post(lEntity, oEntry);
                        iChkCounter = iChkCounter + 1;
                    } catch (err) {
                        GenF.log(err);
                    }
                }
                // If all are successfull commit the request
                if (iChkCounter > 0) {
                    let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
                    try {
                        await servicePost.tx(req).post(reqUrlPPCommit);
                        flag = 'X';
                        response = response + "Export of Resource at Location level is successful for " + lMasterDataType;
                    } catch (e) {
                        GenF.log("Error while committing the parallel processing");
                        response = response + "Export of Resource at Location level is failed for " + lMasterDataType+`.Reason: ${e.message}`;
                    }
                }
            }
            else {
                let oEntry = {
                    "TransactionID": vTransID,
                    "RequestedAttributes": requestedAttributesStr,
                    "DoCommit": true
                }
                oEntry[lData] =aResource;
 
                try {
                    req.headers['Application-Interface-Key'] = vAIRKey;
                    console.log(req.headers);
                    await servicePost.tx(req).post(lEntity, oEntry);
                    let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                    let vResponse = await servicePost.tx(req).get(resUrl);
                    flag = 'X';
                    response = response + "Export of Resource at Location level is successful for " + lMasterDataType;
                } catch (error) {
                    response = response + "Export of Resource at Location level is failed for " + lMasterDataType+`.Reason: ${error.message}`;
                }
            }
        }
    }
        if (flag === 'X') {
            await GenF.jobSchMessage('X', response, req);
        } else {
            await GenF.jobSchMessage('', response, req);
        }
    });
 
      //Creation of SOP LINE & SOURCE ID
     this.on("exportIBPProductionResource", async (req) => {
        let response = '';
        // Get Planning area and Prefix configurations for IBP
        let aTableData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Line Capacity'`);
         let liParaValue = await GenF.getParameterID();
        // // let lData = "Nav" + liParaValue[0].VALUE.toString() + "PRODUCTIONRESOURCE";
        // // let lEntity = "/" + liParaValue[0].VALUE.toString() + "PRODUCTIONRESOURCETrans";
        //  let sPlan = aMappingData[0].PLANNING_AREA;
        // let lData = "Nav" + sPlan;
        // let lEntity = "/" + sPlan + "Trans";
        // let lMasterDataType = sPlan;
        let oReq = {
            newLoc: [],
        },
            vNewLoc, flag = '';
             let lilocProd = JSON.parse(req.data.LocProdData);

        //    let oProducts = [];
    //     for(var i=0; i<lilocProd.length; i++){
    //         oProducts.push(lilocProd[i].PRODUCT_ID);
    //     }
        //  let sProducts = lilocProd.PRODUCT_ID.map(id => `'${id}'`).join(', ');
        //  console.log(sProducts);
        const linewloc = await cds.run(
            `
            SELECT DISTINCT "LOCATION_ID",
                            "PRODUCT_ID",
                            "RESTRICTION",
                            CONCAT(CONCAT(LOCATION_ID,'_'), PRODUCT_ID) AS SOURCE_ID
                   FROM V_LOCPRODLINERTR
                       WHERE LOCATION_ID =  '` + lilocProd.LOCATION_ID + `'
                       `);
                    //    AND PRODUCT_ID IN(${sProducts}) `);
                    let Keys = ['ENTITY_KEY', 'PLANNING_AREA'];
                let distData = GenF.removeDuplicate(aTableData, Keys);
  let aMappingData = [];      
        for (var z = 0; z < distData.length; z++) {
            
                aMappingData = aTableData.filter(e=> e.PLANNING_AREA == distData[z].PLANNING_AREA);

                let sPlan = aMappingData[0].PLANNING_AREA;
                let lData = "Nav" + liParaValue[0].VALUE.toString() + sPlan;
                let lEntity = "/" + liParaValue[0].VALUE.toString() + sPlan + "Trans";
                let lMasterDataType = liParaValue[0].VALUE.toString() + sPlan;
                console.log("sPlan", sPlan);
                console.log("lData", lData);
                console.log("lEntity", lEntity);
                console.log("lMasterDataType", lMasterDataType);

        let aProdRes = await GenF.mappingData('Line Capacity',distData[z].PLANNING_AREA,'',linewloc);
         if (aProdRes.length > 0) {
        // let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='Line Capacity'`);
        aMappingData.filter((el)=>{
            if(el.TYPE == 'C'){
                el.MAPPING_FIELD = el.BTP_FIELD
            }
            else if(el.TYPE == 'D'){
                el.BTP_FIELD = el.MAPPING_FIELD
            }
        }) 
        const requiredFields = aMappingData.filter(item => item.REQUIRED === 1).map(item => item.MAPPING_FIELD);
         aProdRes = aProdRes.filter(record => {
             return requiredFields.every(field => record[field] != null && record[field] != "");
         });
            let Keys = Object.keys(aProdRes[0]);
            let requestedAttributesStr = Array.from(Keys).join(',');
       
            let vTransID = new Date().getTime().toString();
            // let vMDTyp = liParaValue[0].VALUE.toString() + "PRODUCTIONRESOURCE";
            let vMDTyp = lMasterDataType;
            // Parallel processing logic to export huge data buckets
            if (aProdRes.length> 5000) {
                let iChnk, iChkCounter = 0;
 
                // Initialize Parallel processing
                let reqUrlPPInit = "/InitiateParallelProcess?MasterDataTypeID='" + vMDTyp + "'&PlanningArea=''&VersionID=''&TransactionID='" + vTransID + "'";
                try {
                    await servicePost.tx(req).post(reqUrlPPInit);
                } catch (e) {
                    console.log(e);
                }
 
                // Divide into multiple arrays with each array length as 5000
                chunked = true;
                let aData = aProdRes;
                chunksList = [];
                const chunkSize = 5000;
 
                for (let i = 0; i < aData.length; i += chunkSize) {
                    const chunk = aData.slice(i, i + chunkSize)
                    chunksList.push(chunk);
                }
 
                // Process each chunk to IBP
                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
 
                    let oEntry = {
                        "TransactionID": vTransID,
                        "RequestedAttributes": requestedAttributesStr
                    }
                    oEntry[lData] = chunksList[iChnk];
                    try {
                        req.headers['Application-Interface-Key'] = vAIRKey;
                        console.log(req.headers);
                        await servicePost.tx(req).post(lEntity, oEntry);
                        iChkCounter = iChkCounter + 1;
                    } catch (err) {
                        GenF.log(err);
                    }
                }
                // If all are successfull commit the request
                if (iChkCounter > 0) {
                    let reqUrlPPCommit = "/Commit?P_TransactionID='" + vTransID + "'&$format=json";
                    try {
                        await servicePost.tx(req).post(reqUrlPPCommit);
                        flag = 'X';
                        response = response + "Export of production Resource is successful for " + lMasterDataType;
                    } catch (e) {
                        GenF.log("Error while committing the parallel processing");
                        response = response + "Export of production Resource is failed for " + lMasterDataType+`.Reason: ${e.message}`;
                    }
                }
            }
            else {
                let oEntry = {
                    "TransactionID": vTransID,
                    "RequestedAttributes": requestedAttributesStr,
                    "DoCommit": true
                }
                oEntry[lData] = aProdRes;
 
                try {
                    req.headers['Application-Interface-Key'] = vAIRKey;
                    console.log(req.headers);
                    await servicePost.tx(req).post(lEntity, oEntry);
                    let resUrl = "/GetExportResult?P_EntityName='" + liParaValue[0].VALUE + "'&P_TransactionID='" + vTransID + "'";
                    let vResponse = await servicePost.tx(req).get(resUrl);
                    flag = 'X';
                    response = response + "Export of production Resource is successful for " + lMasterDataType;
                } catch (error) {
                    response = response + "Export of production Resource is failed for " + lMasterDataType+`.Reason: ${error.message}`;
 
                }
            }
        }
    }
        if (flag === 'X') {
            await GenF.jobSchMessage('X', response, req);
        } else {
            await GenF.jobSchMessage('', response, req);
        }
    });

});

async function generateAlertLog(generatedData, existingData) {
    let weekArr = []

    const existingMap = new Map();
    existingData.forEach(item => {
        const key = `${item.LOCATION_ID}|${item.PRODUCT_ID}|${item.VERSION}|${item.SCENARIO}|${item.WEEK_DATE}`;
        existingMap.set(key, item.QUANTITY);
    });

    for (const item of generatedData) {
        const key = `${item.LOCATION_ID}|${item.PRODUCT_ID}|${item.VERSION}|${item.SCENARIO}|${item.WEEK_DATE}`;
        const existingQty = existingMap.get(key);
        const newQty = item.QUANTITY;

        if (!existingQty || parseFloat(existingQty) == parseFloat(newQty)) {
            continue;
        }
        else {
            weekArr.push(item.WEEK_DATE)
        }


    }


    return weekArr;
}

async function getMBOMComponent(liComp, oComp, aComp) {
    // Check if Component is Assembly
    let aFilComp = [];
    aFilComp = liComp.filter(function (aComp) {
        return aComp.ASSEMBLY === oComp.COMPONENT;
    }).map(aComp => ({ ...aComp }));

    if (aFilComp.length > 0) {
        for (let i = 0; i < aFilComp.length; i++) {
            aFilComp[i].ASSEMBLY = GenF.parse(oComp.ASSEMBLY);
            aComp = await getMBOMComponent(liComp, aFilComp[i], aComp);
        }
    } else {
        aComp.push(GenF.parse(oComp));
    }
    return aComp;
}