const cds = require("@sap/cds");
const GenF = require("./gen-functions");
const procsObj = require("./processObjects");
const Catservicefn = require("./catservice-function");
class AssemblyReq {
    /**
     * Constructor
     */
    constructor() { }
    async genAsmreq(adata, req) {

        let aBOMConfig = [],
            aBOMPredictions = [],
            aBOMPredictionsAll = [],
            aAssemblies = [];
        let lDate = new Date();
        lDate.setDate(lDate.getDate());
                lDate = lDate.toISOString().split('T')[0];
                let telescoppicDate = await cds.run(`SELECT * from CP_IBPCALENDER_WEEK 
                                                                    where WEEK_STARTDATE <= '${lDate}' 
                                                                    and WEEK_ENDDATE >= '${lDate}'
                                                                    and LEVEL = 'W'`);
                                lDate = telescoppicDate.length > 0 ? new Date(telescoppicDate[0].WEEK_STARTDATE) : new Date(lDate);

        GenF.log(`Tech: Inside Function genAsmreq`);
        await GenF.logMessage(req, `Started Assembly Requirement Calculation`);

        let vFlag = '';
        var oReturn = {
            bError: false,
            message: ''
        }

        let liCIRData = [];
+        // GenF.log(`Tech: Select from V_CIRUNIQUECHAR using ${adata.LOCATION_ID} ${adata.PRODUCT_ID}`);
        GenF.log(`Tech: Select from V_CIRUNIQUECHAR using ${adata.FACTORY_LOC} ${adata.LOCATION_ID} ${adata.PRODUCT_ID}`);
        
        
 // commented this part in development of Q4 2025
        // // VP-1377 - Generate Assembly Requirements for Non-Configurable Product
        // let aProducts = [];
        // aProducts = await cds.run(`SELECT * FROM CP_PRODUCT 
        //                             WHERE PRODUCT_ID = '${adata.PRODUCT_ID}'
        //                              AND NON_CONFIGURABLE = 'X'`);
        // if (aProducts.length > 0) {

        //     liCIRData = await cds.run(`SELECT COUNT(*) as COUNTCIR
        //                                 FROM CP_CIR_GENERATED
        //                                 WHERE LOCATION_ID   = '${adata.LOCATION_ID}'
        //                                 AND (PRODUCT_ID IN ( SELECT PRODUCT_ID 
        //                                                     FROM CP_PARTIALPROD_INTRO 
        //                                                     WHERE REF_PRODID    = '${adata.PRODUCT_ID}'
        //                                                     AND LOCATION_ID   = '${adata.LOCATION_ID}' ) 
        //                                     )`);
        // } else {

        //     // becasue of performenance issue changing this V_CIRUNIQUECHAR to cp_cirgenerated
        //     // liCIRData = await cds.run(`SELECT COUNT(*) as COUNTCIR
        //     //                             FROM V_CIRUNIQUECHAR
        //     //                             WHERE  UPPER("LOCATION_ID") = UPPER('${adata.LOCATION_ID}')
        //     //                             AND (PRODUCT_ID IN ( SELECT PRODUCT_ID 
        //     //                                                 FROM CP_PARTIALPROD_INTRO 
        //     //                                                 WHERE REF_PRODID    = '${adata.PRODUCT_ID}'
        //     //                                                 AND LOCATION_ID   = '${adata.LOCATION_ID}' ) 
        //     //                                 )`);
        //     liCIRData = await cds.run(`SELECT COUNT(*) as COUNTCIR
        //                                 FROM CP_CIR_GENERATED
        //                                 WHERE LOCATION_ID   = '${adata.LOCATION_ID}'
        //                                 AND (PRODUCT_ID IN ( SELECT PRODUCT_ID 
        //                                                     FROM CP_PARTIALPROD_INTRO 
        //                                                     WHERE REF_PRODID    = '${adata.PRODUCT_ID}'
        //                                                     AND LOCATION_ID   = '${adata.LOCATION_ID}' ) 
        //                                     )`);
        // }

        liCIRData = await cds.run(`SELECT COUNT(*) as COUNTCIR
                                        FROM CP_CIR_GENERATED
                                        WHERE LOCATION_ID IN ( '${adata.LOCATION_ID}')
                                        AND (PRODUCT_ID IN ( SELECT PRODUCT_ID 
                                                            FROM CP_PARTIALPROD_INTRO 
                                                            WHERE REF_PRODID    = '${adata.PRODUCT_ID}'
                                                            AND LOCATION_ID  IN ( '${adata.LOCATION_ID}')) 
                                            )`);


        let lObjType = '';
        (liCIRData[0].COUNTCIR == 0) ? lObjType = 'OD' : lObjType = 'PI'
        // await this.removeAssembyReq(adata.LOCATION_ID, adata.PRODUCT_ID, lObjType, adata.VERSION, adata.SCENARIO);
        // await this.removeAssembyReq(adata.LOCATION_ID, adata.PRODUCT_ID, 'RT', adata.VERSION, adata.SCENARIO);
         await this.removeAssembyReq(adata.FACTORY_LOC, adata.PRODUCT_ID, lObjType, adata.VERSION, adata.SCENARIO);
        await this.removeAssembyReq(adata.FACTORY_LOC, adata.PRODUCT_ID, 'RT', adata.VERSION, adata.SCENARIO);

        GenF.log(`Deleted existing assembly requirements records`);

        let liAsmReq = [];
        let lsAsmReq = {};
        let liODData = [];
        let aAssembliesF = [];
        let aDistWeekDates = [];

        // Check if Structure Node exists for BOM
        let sPVSConfig = await GenF.getParameterValue(adata.FACTORY_LOC, 19);  // PVS Node Structure
        if (sPVSConfig === null) {
            sPVSConfig = 'false';
        }

        let sBOMConfg = await GenF.getSystemConfig('MULTILEVEL_CONFIGPRODUCT');


        // if (liCIRData.length == 0) {//Type OD if liCIRData length is Zero
        if (liCIRData[0].COUNTCIR == 0) {   //Type OD if liCIRData length is Zero
            GenF.log(`Tech: Get from V_ASSEMBLYREQ using ${adata.LOCATION_ID} ${adata.PRODUCT_ID} ${adata.VERSION} ${adata.SCENARIO}`);
            if (sBOMConfg === 'No') {
                if (sPVSConfig === 'true') {
                    liODData = await cds.run(`
                                SELECT "LOCATION_ID",
                                    "FACTORY_LOC",
                                    "PRODUCT_ID",
                                    "WEEK_DATE", 
                                    "ITEM_NUM",
                                    "COMPONENT", 
                                    "VERSION",                         
                                    "SCENARIO",
                                    "REF_PRODID",
                                    "MODEL_VERSION",
                                    SUM("COMP_QTY") AS COMP_QTY
                                FROM V_ASSEMBLYREQ
                                WHERE LOCATION_ID  IN ('${adata.LOCATION_ID}' )
                                AND REF_PRODID = '${adata.PRODUCT_ID}'
                                AND VERSION = '${adata.VERSION}'
                                AND SCENARIO = '${adata.SCENARIO}'
                                GROUP BY "LOCATION_ID",
                                        "FACTORY_LOC",
                                        "PRODUCT_ID",
                                        "WEEK_DATE", 
                                        "ITEM_NUM",
                                        "COMPONENT", 
                                        "VERSION",                         
                                        "SCENARIO",                   
                                        "MODEL_VERSION",
                                        "REF_PRODID"
                                ORDER BY "LOCATION_ID",
                                        "FACTORY_LOC",
                                        "PRODUCT_ID",
                                        "WEEK_DATE", 
                                        "ITEM_NUM",
                                        "COMPONENT", 
                                        "VERSION",                         
                                        "SCENARIO"    
                        `);

                    if (liODData) {
                        for (let i = 0; i < liODData.length; i++) {
                            if (i === GenF.addOne(i, liODData.length) ||
                                liODData[i].LOCATION_ID !== liODData[GenF.addOne(i, liODData.length)].LOCATION_ID ||
                                liODData[i].PRODUCT_ID !== liODData[GenF.addOne(i, liODData.length)].PRODUCT_ID ||
                                liODData[i].WEEK_DATE !== liODData[GenF.addOne(i, liODData.length)].WEEK_DATE ||
                                liODData[i].FACTORY_LOC !== liODData[GenF.addOne(i, liODData.length)].FACTORY_LOC ||
                                liODData[i].ITEM_NUM !== liODData[GenF.addOne(i, liODData.length)].ITEM_NUM ||
                                liODData[i].COMPONENT !== liODData[GenF.addOne(i, liODData.length)].COMPONENT ||
                                liODData[i].VERSION !== liODData[GenF.addOne(i, liODData.length)].VERSION ||
                                liODData[i].SCENARIO !== liODData[GenF.addOne(i, liODData.length)].SCENARIO) {
                                const objOD = {};
                                objOD.LOCATION_ID = GenF.parse(liODData[i].LOCATION_ID);
                                objOD.PRODUCT_ID = GenF.parse(liODData[i].PRODUCT_ID);
                                objOD.WEEK_DATE = GenF.parse(liODData[i].WEEK_DATE);
                                objOD.MODEL_VERSION = (liODData[i].MODEL_VERSION) ? GenF.parse(liODData[i].MODEL_VERSION) : "Active";
                                objOD.VERSION = GenF.parse(liODData[i].VERSION);
                                objOD.SCENARIO = GenF.parse(liODData[i].SCENARIO);
                                objOD.ITEM_NUM = GenF.parse(liODData[i].ITEM_NUM);
                                objOD.COMPONENT = GenF.parse(liODData[i].COMPONENT);
                                objOD.REF_PRODID = GenF.parse(liODData[i].REF_PRODID);
                                objOD.FACTORY_LOC = GenF.parse(liODData[i].FACTORY_LOC);
                                objOD.COMPCIR_QTY = GenF.parse(liODData[i].COMP_QTY);
                                objOD.TYPE = "OD";
                                liAsmReq.push(GenF.parse(objOD));
                            }
                        }
                    }
                }
            } else {
                aDistWeekDates = await cds.run(`SELECT DISTINCT CP_IBP_FUTUREDEMAND.WEEK_DATE
                                                           FROM CP_IBP_FUTUREDEMAND
                                                           INNER JOIN V_BOM_CONFIG_PARTIAL_M
                                                              ON CP_IBP_FUTUREDEMAND.LOCATION_ID = V_BOM_CONFIG_PARTIAL_M.LOCATION_ID
                                                             AND CP_IBP_FUTUREDEMAND.PRODUCT_ID = V_BOM_CONFIG_PARTIAL_M.PRODUCT_ID
                                                           WHERE V_BOM_CONFIG_PARTIAL_M.LOCATION_ID IN('${adata.LOCATION_ID}')
                                                             AND V_BOM_CONFIG_PARTIAL_M.REF_PRODID = '${adata.PRODUCT_ID}'
                                                             AND CP_IBP_FUTUREDEMAND.VERSION = '${adata.VERSION}'
                                                             AND CP_IBP_FUTUREDEMAND.SCENARIO = '${adata.SCENARIO}'`);

                        for(let t=0; t<adata.LOCATION_ID.length; t++){
                let TEMPaAssembliesF = await this.getAssemblies(adata.LOCATION_ID[t], adata.PRODUCT_ID, adata, 1, aAssembliesF);
                            aAssembliesF = aAssembliesF.concat(TEMPaAssembliesF);
                        }

                if (aDistWeekDates.length > 0) {

                    for (let j = 0; j < aDistWeekDates.length; j++) {
                        GenF.log(`Tech: Assembly Req. Generation Started for Week ${aDistWeekDates[j].WEEK_DATE}`);

                        // aBOMPredictions = aBOMPredictionsAll.filter(function (aBOMPred) {
                        //     return aBOMPred.WEEK_DATE === aDistWeekDates[j].WEEK_DATE;
                        //   });

                        aBOMPredictions = [];
                        // liAsmReq = [];


                        aBOMPredictions = await cds.run(`SELECT DISTINCT 
                                        A.LOCATION_ID,
                                        A.FACTORY_LOC,
                                        A.REF_PRODID,
                                        A.PRODUCT_ID,
                                        A.ITEM_NUM,
                                        A.MAT_PARENT,
                                        A.COMPONENT,
                                        B.VERSION,
                                        B.SCENARIO,
                                        B.WEEK_DATE,
                                        B.QUANTITY,
                                        A.COMP_QTY AS COMPONENT_QTY,
                                        C.MODEL_VERSION,
                                        C.PREDICTED                                                
                                    FROM  F_BOM_CONFIG_PARTIAL_M() AS A
                              INNER JOIN  CP_IBP_FUTUREDEMAND AS B
                                    ON B.LOCATION_ID = A.LOCATION_ID
                                    AND B.PRODUCT_ID = A.PRODUCT_ID
                        LEFT OUTER JOIN V_BOM_TSPREDICTIONV2_M AS C
                                    ON C.LOCATION_ID = B.LOCATION_ID
                                    AND C.PRODUCT_ID = B.PRODUCT_ID
                                    AND C.ITEM_NUM = A.ITEM_NUM
                                    AND C.MAT_PARENT = A.MAT_PARENT
                                    AND C.COMPONENT = A.COMPONENT
                                    AND C.VERSION = B.VERSION
                                    AND C.SCENARIO = B.SCENARIO
                                    AND C.CAL_DATE = B.WEEK_DATE
                                WHERE A.LOCATION_ID IN('${adata.LOCATION_ID}')
                                    AND A.REF_PRODID = '${adata.PRODUCT_ID}'
                                    AND B.VERSION = '${adata.VERSION}'
                                    AND B.SCENARIO = '${adata.SCENARIO}'
                                    AND B.WEEK_DATE = '${aDistWeekDates[j].WEEK_DATE}'
                                    AND A.PHANTOM_IND = ''
                                    AND A.CLASS_FLG = ''`);

                        if (aAssembliesF.length > 0 && aBOMPredictions.length > 0) {
                            for (let i = 0; i < aBOMPredictions.length; i++) {
                                const objOD = {};
                                objOD.LOCATION_ID = GenF.parse(aBOMPredictions[i].LOCATION_ID);
                                objOD.PRODUCT_ID = GenF.parse(aBOMPredictions[i].PRODUCT_ID);
                                objOD.WEEK_DATE = GenF.parse(aBOMPredictions[i].WEEK_DATE);
                                objOD.MODEL_VERSION = (aBOMPredictions[i].MODEL_VERSION) ? GenF.parse(aBOMPredictions[i].MODEL_VERSION) : "Active";
                                objOD.VERSION = GenF.parse(aBOMPredictions[i].VERSION);
                                objOD.SCENARIO = GenF.parse(aBOMPredictions[i].SCENARIO);
                                objOD.ITEM_NUM = GenF.parse(aBOMPredictions[i].ITEM_NUM);
                                objOD.COMPONENT = GenF.parse(aBOMPredictions[i].COMPONENT);
                                objOD.REF_PRODID = GenF.parse(aBOMPredictions[i].REF_PRODID);
                                objOD.FACTORY_LOC = GenF.parse(aBOMPredictions[i].FACTORY_LOC);
                                objOD.TYPE = "OD";

                                let oAssembly = {};
                                let iCompQty = 1;
                                oAssembly = aAssembliesF.find((lsAsmb) => lsAsmb.FACTORY_LOC === aBOMPredictions[i].FACTORY_LOC &&
                                    lsAsmb.MAT_PARENT === aBOMPredictions[i].MAT_PARENT &&
                                    lsAsmb.COMPONENT === aBOMPredictions[i].COMPONENT &&
                                    lsAsmb.ITEM_NUM === aBOMPredictions[i].ITEM_NUM
                                );
                                if (oAssembly) {
                                    iCompQty = parseInt(oAssembly.COMP_QTY);
                                }

                                if (aBOMPredictions[i].PREDICTED === null || aBOMPredictions[i].PREDICTED === undefined) {
                                    objOD.COMPCIR_QTY = parseFloat(aBOMPredictions[i].QUANTITY * iCompQty);
                                }
                                else {
                                    objOD.COMPCIR_QTY = parseFloat(aBOMPredictions[i].PREDICTED * iCompQty);
                                }

                                let iIndex = -1;
                                iIndex = liAsmReq.findIndex(lsAsmb => {
                                    return (lsAsmb.LOCATION_ID === aBOMPredictions[i].LOCATION_ID &&
                                        lsAsmb.PRODUCT_ID === aBOMPredictions[i].PRODUCT_ID &&
                                        lsAsmb.COMPONENT === aBOMPredictions[i].COMPONENT &&
                                        lsAsmb.ITEM_NUM === aBOMPredictions[i].ITEM_NUM &&
                                        lsAsmb.WEEK_DATE === aBOMPredictions[i].WEEK_DATE
                                    );
                                });

                                if (iIndex !== -1) {
                                    liAsmReq[iIndex].COMPCIR_QTY = parseFloat(liAsmReq[iIndex].COMPCIR_QTY) + parseFloat(objOD.COMPCIR_QTY);
                                } else {
                                    liAsmReq.push(GenF.parse(objOD));
                                }

                            }
                        }
                        GenF.log(`Tech: Assembly Req. Generation Completed for Week ${aDistWeekDates[j].WEEK_DATE}`);
                        if (liAsmReq.length > 0) {
                            const keys = ['LOCATION_ID', 'PRODUCT_ID', 'ITEM_NUM', 'COMPONENT', 'WEEK_DATE'];
                            liAsmReq = GenF.removeDuplicate(liAsmReq, keys);
                            const tx = cds.tx(req);
                            try {
                                // await tx.run(INSERT.into("CP_ASSEMBLY_REQ").entries(liAsmReq)).then(tx.commit);
                                await cds.run(INSERT.into("CP_ASSEMBLY_REQ").entries(liAsmReq));
                                GenF.log(`Assembly Requirements Created successfully with records ${liAsmReq.length} for Week Date ${aDistWeekDates[j].WEEK_DATE}`);
                                liAsmReq = [];
                                vFlag = 'X';
                            } catch (e) {
                                vFlag = '';
                                console.log(e.message);
                                throw new Error(e.toString());
                            }
                        }
                    }
                }

            }

            // Generate restrictions
            GenF.log(`Tech: Get from V_RESTRICTIONREQ using ${adata.FACTORY_LOC} ${adata.LOCATION_ID} ${adata.PRODUCT_ID} ${adata.VERSION} ${adata.SCENARIO}`);
            const liRTData = await cds.run(`
                SELECT "LOCATION_ID",
                        "PRODUCT_ID",
                        "WEEK_DATE", 
                        "FACTORY_LOC",
                        "RESTRICTION", 
                        "VERSION",                         
                        "SCENARIO",
                        "MODEL_VERSION",
                        "REF_PRODID",
                        SUM("RTR_QTY") AS RTR_QTY
                  FROM V_RESTRICTIONREQ 
                 WHERE LOCATION_ID  IN( '${adata.LOCATION_ID}')
                   AND REF_PRODID = '${adata.PRODUCT_ID}'
                   AND VERSION = '${adata.VERSION}'
                   AND SCENARIO = '${adata.SCENARIO}'
                 GROUP BY "LOCATION_ID",
                          "PRODUCT_ID",
                           "WEEK_DATE", 
                           "FACTORY_LOC",
                           "RESTRICTION", 
                           "VERSION",                         
                           "SCENARIO",
                           "MODEL_VERSION",
                           "REF_PRODID"
                 ORDER BY "LOCATION_ID",
                           "PRODUCT_ID",
                           "WEEK_DATE", 
                           "FACTORY_LOC",
                           "RESTRICTION", 
                           "VERSION",                         
                           "SCENARIO",
                           "MODEL_VERSION",
                           "REF_PRODID"
            `);
            // for M1
            if (liRTData) {
                for (let i = 0; i < liRTData.length; i++) {
                    if (i === GenF.addOne(i, liRTData.length) ||
                        liRTData[i].LOCATION_ID !== liRTData[GenF.addOne(i, liRTData.length)].LOCATION_ID ||
                        liRTData[i].PRODUCT_ID !== liRTData[GenF.addOne(i, liRTData.length)].PRODUCT_ID ||
                        liRTData[i].WEEK_DATE !== liRTData[GenF.addOne(i, liRTData.length)].WEEK_DATE ||
                        liRTData[i].RESTRICTION !== liRTData[GenF.addOne(i, liRTData.length)].RESTRICTION ||
                        liRTData[i].VERSION !== liRTData[GenF.addOne(i, liRTData.length)].VERSION ||
                        liRTData[i].SCENARIO !== liRTData[GenF.addOne(i, liRTData.length)].SCENARIO) {
                        const objRT = {};
                        objRT.LOCATION_ID = GenF.parse(liRTData[i].LOCATION_ID);
                        objRT.PRODUCT_ID = GenF.parse(liRTData[i].PRODUCT_ID);
                        objRT.WEEK_DATE = GenF.parse(liRTData[i].WEEK_DATE);
                        objRT.MODEL_VERSION = (liRTData[i].MODEL_VERSION) ? GenF.parse(liRTData[i].MODEL_VERSION) : "Active";
                        objRT.VERSION = GenF.parse(liRTData[i].VERSION);
                        objRT.SCENARIO = GenF.parse(liRTData[i].SCENARIO);
                        objRT.ITEM_NUM = GenF.parse('10');
                        objRT.COMPONENT = GenF.parse(liRTData[i].RESTRICTION);
                        objRT.REF_PRODID = GenF.parse(liRTData[i].REF_PRODID);
                        objRT.COMPCIR_QTY = GenF.parse(liRTData[i].RTR_QTY);
                        objRT.TYPE = "RT";
                        liAsmReq.push(GenF.parse(objRT));
                    }
                }
            }

        }
        else {

            let aOpenAsmbReq = [], aAsmbReq = [];
            let aActAsmbReq = [];
        // Commenting this when we chnaged job from demand loc to Factory loc
            // // First check for mapping table
            // let lsFactory = await SELECT.one
            //     .from('CP_FACTORY_SALESLOC')
            //     .columns('FACTORY_LOC')
            //     .where(`LOCATION_ID = '${adata.LOCATION_ID}'`);
            // if (lsFactory === null) {
            //     let lMsg = `Please maintain Planning network maintenance for Location ${adata.LOCATION_ID}`;
            //     GenF.log(lMsg);
            //     return await GenF.jobSchMessage('X', lMsg, req);
            // }

            // let vCount = await cds.run(`SELECT COUNT(*) AS COUNTVAL 
            //                              FROM CP_BOM_UID 
            //                             WHERE FACTORY_LOC = '${lsFactory.FACTORY_LOC}'
            //                             AND REF_PRODID = '${adata.PRODUCT_ID}'
            //                                         `);

            let vCount = await cds.run(`SELECT COUNT(*) AS COUNTVAL 
                                         FROM CP_BOM_UID 
                                        WHERE FACTORY_LOC = '${adata.FACTORY_LOC}'
                                        AND REF_PRODID = '${adata.PRODUCT_ID}'
                                                    `);
            if (vCount[0].COUNTVAL > 0) {
                GenF.log(`BOM UID Data Exists with records ${vCount}`);
            }

            // Update Restriction -- Commented Below function as we are calling it through separate service (genBOMUIDMapping)
            // await this.genRTRUID(lsFactory.FACTORY_LOC, adata.PRODUCT_ID, req);;
            GenF.log(`Assembly requirements in process`);
            let aBOMUID = await cds.run(` SELECT COUNT(*) as COUNTUID 
                                            FROM CP_BOM_UID
                                           WHERE REF_PRODID = '${adata.PRODUCT_ID}'`);
            let oAsmbReq = {};

            if (aBOMUID[0].COUNTUID > 0) {
                try {
                    GenF.log(`Inserting records to Assembly Requirements`);
                    // // Insert for in Assembly req based on CIR geneated for Partial Product and UID joining it with BOM UID mapping table
                    // await cds.run(`INSERT INTO CP_ASSEMBLY_REQ (SELECT 
                    //                 CP_BOM_UID."LOCATION_ID",
                    //                 CP_BOM_UID."PRODUCT_ID",
                    //                 CP_BOM_UID."ITEM_NUM",
                    //                 CP_BOM_UID."ASSEMBLY",
                    //                 CP_CIR_GENERATED.WEEK_DATE,
                    //                 CP_CIR_GENERATED."MODEL_VERSION",
                    //                 CP_CIR_GENERATED."VERSION",
                    //                 CP_CIR_GENERATED."SCENARIO",
                    //                 CP_BOM_UID."RULE_TYPE",
                    //                 CP_BOM_UID."REF_PRODID",
                    //                 CP_BOM_UID."FACTORY_LOC",
                    //                 SUM(CP_CIR_GENERATED.CIR_QTY),
                    //                 SUM(CP_CIR_GENERATED.CIR_QTY * CP_BOM_UID."ASMB_QTY")
                    //             FROM 
                    //                 "CP_BOM_UID"
                    //             INNER JOIN
                    //                 CP_CIR_GENERATED
                    //                 ON CP_BOM_UID."LOCATION_ID" = CP_CIR_GENERATED."LOCATION_ID"
                    //                     AND CP_BOM_UID."PRODUCT_ID" = CP_CIR_GENERATED."PRODUCT_ID"
                    //                     AND CP_BOM_UID."UNIQUE_ID" = CP_CIR_GENERATED."UNIQUE_ID"
                    //                     WHERE CP_CIR_GENERATED."LOCATION_ID" = '${adata.LOCATION_ID}'
                    //                     AND CP_BOM_UID."REF_PRODID" =  '${adata.PRODUCT_ID}'
                    //                     AND CP_CIR_GENERATED.WEEK_DATE >= CP_BOM_UID.VALID_FROM
                    //                     AND CP_CIR_GENERATED.WEEK_DATE <= CP_BOM_UID.VALID_TO
                    //                     AND CP_CIR_GENERATED.VERSION = '${adata.VERSION}'
                    //                     AND CP_CIR_GENERATED.SCENARIO = '${adata.SCENARIO}'
                    //                 GROUP BY 
                    //                     CP_BOM_UID."LOCATION_ID",
                    //                     CP_BOM_UID."PRODUCT_ID",
                    //                     CP_BOM_UID."ITEM_NUM",
                    //                     CP_BOM_UID."ASSEMBLY",
                    //                     CP_CIR_GENERATED.WEEK_DATE,
                    //                     CP_CIR_GENERATED."MODEL_VERSION",
                    //                     CP_CIR_GENERATED."VERSION",
                    //                     CP_CIR_GENERATED."SCENARIO",
                    //                     CP_BOM_UID.RULE_TYPE,
                    //                     CP_BOM_UID.REF_PRODID,
                    //                     CP_BOM_UID.FACTORY_LOC)`);

                    let telePreiods = await cds.run(`select * from CP_TELESCOPIC_PERIODS`);

                          
                    // new Date(newEnd.getFullYear(), newEnd.getMonth(), newEnd.getDate()).toISOString().split('T')[0];


                    // aActAsmbReq = await cds.run(`INSERT INTO CP_ASSEMBLY_REQ (SELECT
                    //     A.LOCATION_ID,
                    //     B.PRODUCT_ID,                        
                    //     C.COUNTER,
                    //     A.COMPONENT,
                    //     ADD_DAYS("MAT_AVAILDATE",WEEKDAY("MAT_AVAILDATE") * -1 ),
                    //     'Active' AS MODEL_VERSION,
                    //     '${adata.VERSION}',
                    //     '${adata.SCENARIO}',
                    //     'PI',
                    //     A.REF_PRODID,
                    //     A.COMP_LOC,
                    //     B.UNIQUE_ID,
                    //     0,                                          
                    //     0,                           
                    //     SUM(A.COMP_QTY)
                    // FROM 
                    //     CP_PROD_ORD_CONSUMPTION AS A
                    // INNER JOIN V_SALES_H AS B
                    //     ON A.LOCATION_ID = B.LOCATION_ID
                    //     AND A.REF_PRODID = B.REF_PRODID
                    //     AND A.SALES_DOC = B.SALES_DOC
                    //     AND LTRIM(A.SALESDOC_ITEM, 0) = LTRIM(B.SALESDOC_ITEM, 0)
                    // INNER JOIN CP_BOM_MAT AS C
                    //     ON A.LOCATION_ID = C.LOCATION_ID
                    //     AND A.MAT_PARENT = C.MAT_PARENT
                    //     AND A.COMPONENT = C.MAT_CHILD
                    //     AND A.COMP_LOC = C.CHILD_LOC
                    //     AND B.MAT_AVAILDATE >= C.VALID_FROM
                    //     AND B.MAT_AVAILDATE <= C.VALID_TO
                    // WHERE A."LOCATION_ID" = '${adata.LOCATION_ID}'
                    // AND A."REF_PRODID" =  '${adata.PRODUCT_ID}'
                    // AND MAT_AVAILDATE >= '${lDate.toISOString().split("T")[0]}'
                    // AND C.COMPONENT_FLAG != 'X'
                    // GROUP BY
                    //     A.LOCATION_ID,
                    //     B.PRODUCT_ID,
                    //     B.UNIQUE_ID,
                    //     C.COUNTER,
                    //     A.COMPONENT,
                    //     ADD_DAYS("MAT_AVAILDATE",WEEKDAY("MAT_AVAILDATE") * -1 ),
                    //     'Active',
                    //     '${adata.VERSION}',
                    //     '${adata.SCENARIO}',
                    //     'PI',
                    //     A.REF_PRODID,
                    //     A.COMP_LOC,
                    //     0,
                    //     0                                            
                    // ORDER BY 
                    //     A.LOCATION_ID,
                    //     B.PRODUCT_ID,
                    //     B.UNIQUE_ID,
                    //     C.COUNTER,
                    //     A.COMPONENT,
                    //     ADD_DAYS("MAT_AVAILDATE",WEEKDAY("MAT_AVAILDATE") * -1 ))`);

                    let assmbData = await cds.run(`SELECT 
                                        LOCATION_ID,
                                        PRODUCT_ID,                        
                                        ITEM_NUM,
                                        COMPONENT,
                                        WEEK_DATE,
                                        MODEL_VERSION,
                                        '${adata.VERSION}' AS VERSION,
                                        '${adata.SCENARIO}' AS SCENARIO,
                                        TYPE,
                                        REF_PRODID,
                                        FACTORY_LOC,
                                        UNIQUE_ID,
                                        CIR_QTY,                                          
                                        COMPCIR_QTY,                          
                                        ACTUAL_QTY
                                    FROM V_BOMUID_ASSEMBLY
                                     WHERE LOCATION_ID  =  '${adata.FACTORY_LOC}'                                     
                                        AND REF_PRODID =  '${adata.PRODUCT_ID}'
                                        AND WEEK_DATE >= '${lDate.toISOString().split("T")[0]}'
                                         AND COMPONENT_FLAG != 'X'`);
            if(assmbData.length > 0){
                if(assmbData.length > 10000){

                    const CHUNK = 5000;

                    for (let i = 0; i < assmbData.length; i += CHUNK) {
                        const batch = assmbData.slice(i, i + CHUNK);
                        try {
                            await cds.run(INSERT.into("CP_ASSEMBLY_REQ").entries(batch));
                            console.log(`Inserted ${i + batch.length}`);
                            GenF.log(`Assembly Requirements successfully with records ${batch.length}`);              
                        } catch (e) {                    
                            console.log(e.message);
                            console.log(`Failed to Insert ${i + batch.length}`);
                            throw new Error(e.toString());

                        }
                        

                    }
                                GenF.log(`Assembly Requirements successfully with records ${assmbData.length}`); 


                } else {
                try {
                    await cds.run(INSERT.into("CP_ASSEMBLY_REQ").entries(assmbData));
                    GenF.log(`Assembly Requirements successfully with records ${assmbData.length}`);              
                } catch (e) {                    
                    console.log(e.message);
                    throw new Error(e.toString());
                }
            }   
        }

                    for(let t=0; t<telePreiods.length; t++){

                        let fromDate = telePreiods[t].PERIODSTART;
                        let toDate = telePreiods[t].PERIODEND;          
                    // aOpenAsmbReq = await cds.run(`SELECT
                    //         CP_BOM_UID."LOCATION_ID",
                    //         CP_BOM_UID."PRODUCT_ID",                                    
                    //         CP_BOM_UID."ITEM_NUM",
                    //         CP_BOM_UID."ASSEMBLY" AS COMPONENT,
                    //         CP_CIR_GENERATED.WEEK_DATE,
                    //         CP_CIR_GENERATED."MODEL_VERSION",
                    //         CP_CIR_GENERATED."VERSION",
                    //         CP_CIR_GENERATED."SCENARIO",
                    //         CP_BOM_UID."RULE_TYPE" AS TYPE,
                    //         CP_BOM_UID."REF_PRODID",
                    //         CP_BOM_UID."FACTORY_LOC",
                    //         CP_BOM_UID."UNIQUE_ID",
                    //         SUM(CP_CIR_GENERATED.CIR_QTY) AS CIR_QTY,
                    //         SUM(CP_CIR_GENERATED.OPEN_ASSEMBLY * CP_BOM_UID."ASMB_QTY") AS COMPCIR_QTY
                    //     FROM 
                    //         "CP_BOM_UID"                       
                    //     INNER JOIN
                    //         CP_CIR_GENERATED
                    //         ON CP_BOM_UID."LOCATION_ID" IN (Select FACTORY_LOC from CP_FACTORY_SALESLOC where LOCATION_ID = CP_CIR_GENERATED.LOCATION_ID
                    //                                                                                     AND PRODUCT_ID = CP_CIR_GENERATED.PRODUCT_ID)
                    //             AND CP_BOM_UID."PRODUCT_ID" = CP_CIR_GENERATED."PRODUCT_ID"
                    //             AND CP_BOM_UID."UNIQUE_ID" = CP_CIR_GENERATED."UNIQUE_ID"
                    //             AND CP_BOM_UID.VALID_FROM <= CP_CIR_GENERATED.WEEK_DATE
                    //             AND CP_BOM_UID.VALID_TO >= CP_CIR_GENERATED.WEEK_DATE
                    //     WHERE CP_CIR_GENERATED."LOCATION_ID" = '${adata.LOCATION_ID}'
                    //             AND CP_BOM_UID."REF_PRODID" =  '${adata.PRODUCT_ID}'
                    //             AND CP_CIR_GENERATED.WEEK_DATE BETWEEN '${fromDate}' and '${toDate}'
                                
                    //             AND CP_CIR_GENERATED.VERSION = '${adata.VERSION}'
                    //             AND CP_CIR_GENERATED.SCENARIO = '${adata.SCENARIO}'
                    //             AND CP_CIR_GENERATED.MODEL_VERSION = 'Active'
                    //             AND CP_CIR_GENERATED.CIR_QTY > 0
                    //         GROUP BY 
                    //             CP_BOM_UID."LOCATION_ID",
                    //             CP_BOM_UID."PRODUCT_ID",
                    //             CP_BOM_UID."UNIQUE_ID",
                    //             CP_BOM_UID."ITEM_NUM",
                    //             CP_BOM_UID."ASSEMBLY",
                    //             CP_CIR_GENERATED.WEEK_DATE,
                    //             CP_CIR_GENERATED."MODEL_VERSION",
                    //             CP_CIR_GENERATED."VERSION",
                    //             CP_CIR_GENERATED."SCENARIO",
                    //             CP_BOM_UID.RULE_TYPE,
                    //             CP_BOM_UID.REF_PRODID,
                    //             CP_BOM_UID.FACTORY_LOC`);

                        aOpenAsmbReq = await cds.run(`SELECT
                                                LOCATION_ID,
                                                PRODUCT_ID,                                    
                                                ITEM_NUM,
                                                COMPONENT,
                                                WEEK_DATE,
                                                MODEL_VERSION,
                                                VERSION,
                                                SCENARIO,
                                                TYPE,
                                                REF_PRODID,
                                                FACTORY_LOC,
                                                UNIQUE_ID,
                                                FINAL_ASS,
                                                CIR_QTY,
                                                COMPCIR_QTY
                                            FROM 
                                                V_OPENASSEMBLYREQ                    
                                            
                                            WHERE LOCATION_ID = '${adata.FACTORY_LOC}'  
                                                    AND REF_PRODID =  '${adata.PRODUCT_ID}'
                                                    AND WEEK_DATE BETWEEN '${fromDate}' and '${toDate}'                                
                                                    AND VERSION = '${adata.VERSION}'
                                                    AND SCENARIO = '${adata.SCENARIO}'
                                                    AND MODEL_VERSION = 'Active'
                                                    AND CIR_QTY > 0
                            `);

                   if (aOpenAsmbReq.length > 0) {

                        if(aOpenAsmbReq.length > 10000){
                            const CHUNK = 5000;

                                for (let i = 0; i < aOpenAsmbReq.length; i += CHUNK) {
                                    const batch = aOpenAsmbReq.slice(i, i + CHUNK);
                                    // await db.run(INSERT.into('CP_ASSEMBLY_REQ').entries(batch));
                            let cqnQuery = { UPSERT: { into: { ref: ['CP_ASSEMBLY_REQ'] }, entries: batch } };
                                        try {
                                            await cds.run(cqnQuery);
                                        } catch (e) {
                                            console.log('Error');
                                        }
                                    console.log(`Inserted ${i + batch.length}`);
                                }
                        } else {

                        let cqnQuery = { UPSERT: { into: { ref: ['CP_ASSEMBLY_REQ'] }, entries: aOpenAsmbReq } };
                        try {
                            await cds.run(cqnQuery);
                        } catch (e) {
                            console.log('Error');
                        }
                    }
                    }

                    GenF.log(`Created successfully Assembly req from BOM UID mapping - CIR`);
                    vFlag = 'X';
                }
                } catch (error) {
                    console.log("Error");
                }
            }
            else {
                vFlag = 'W';
            }

        }
        // Verify Multilevel - BOM Check
        let sBOMConfig = await GenF.getSystemConfig('MULTILEVEL_CONFIGPRODUCT');

        // ** Get Assembly Req. for Assembly withot OD //  
        if (sBOMConfig === 'No') {
            // ** Get Assembly Req. for Assembly withot OD //
            let liNonODBOM = [], liFutDemand = [];

            // // Get FActory Location       
            // const lsFacLoc = await SELECT.one
            //     .columns('FACTORY_LOC')
            //     .from('CP_FACTORY_SALESLOC')
            //     .where(`LOCATION_ID = '${adata.LOCATION_ID}'
            //    AND PRODUCT_ID = '${adata.PRODUCT_ID}'`);

            // if (lsFacLoc == null || lsFacLoc == '') {
            //     let lMsg = `Failed to generate for the Location: ${adata.LOCATION_ID} and Product: ${adata.PRODUCT_ID} as Planning network is not maintained `;
            //     return await GenF.jobSchMessage('X', lMsg, req);
            // }
            // //         AND (("ITEM_NUM","COMPONENT") IN (SELECT DISTINCT "ITEM_NUM",
            // //             "ASSEMBLY"
            // //        FROM "CP_CRITICAL_COMP"
            // //       WHERE ASSEMBLY_CRITICALKEY = 'X'))
            // //    ORDER BY COMPONENT ASC))
            // if (lsFacLoc !== null || lsFacLoc.FACTORY_LOC !== '') {
                liNonODBOM = await cds.run(`SELECT *
                                              FROM "CP_BOMHEADER"
                                             WHERE LOCATION_ID = '${adata.FACTORY_LOC}'
                                               AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                               AND ((ITEM_NUM,COMPONENT) NOT IN (SELECT DISTINCT ITEM_NUM,COMPONENT
                                              FROM "V_OBDHDR"
                                             WHERE LOCATION_ID IN('${adata.LOCATION_ID}')
                                               AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                               ))`);

                liFutDemand = await cds.run(`SELECT * 
                                               FROM CP_IBP_FUTUREDEMAND
                                              WHERE LOCATION_ID IN('${adata.LOCATION_ID}')
                                                AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                                AND VERSION = '${adata.VERSION}'
                                                AND SCENARIO = '${adata.SCENARIO}'`);
            // }


            if (liNonODBOM.length > 0) {
                for (let iOD = 0; iOD < liNonODBOM.length; iOD++) {
                    for (let index = 0; index < liFutDemand.length; index++) {
                        //Generate for only valid assembly 
                        if (liFutDemand[index].WEEK_DATE >= liNonODBOM[iOD].VALID_FROM
                            && liFutDemand[index].WEEK_DATE <= liNonODBOM[iOD].VALID_TO) {

                            lsAsmReq.LOCATION_ID = GenF.parse(liFutDemand[index].LOCATION_ID);
                            lsAsmReq.FACTORY_LOC = GenF.parse(liNonODBOM[iOD].LOCATION_ID);
                            lsAsmReq.PRODUCT_ID = GenF.parse(liFutDemand[index].PRODUCT_ID);
                            lsAsmReq.WEEK_DATE = GenF.parse(liFutDemand[index].WEEK_DATE);
                            lsAsmReq.MODEL_VERSION = 'Active';
                            lsAsmReq.VERSION = GenF.parse(liFutDemand[index].VERSION);
                            lsAsmReq.SCENARIO = GenF.parse(liFutDemand[index].SCENARIO);
                            lsAsmReq.ITEM_NUM = GenF.parse(liNonODBOM[iOD].ITEM_NUM);
                            lsAsmReq.COMPONENT = GenF.parse(liNonODBOM[iOD].COMPONENT);
                            lsAsmReq.TYPE = "PI";
                            lsAsmReq.REF_PRODID = GenF.parse(liNonODBOM[iOD].PRODUCT_ID); //GenF.parse(liCIR[cntCIR].REF_PRODID);
                            lsAsmReq.CIR_QTY = GenF.parse(liFutDemand[index].QUANTITY);
                            lsAsmReq.COMPCIR_QTY = parseInt(lsAsmReq.CIR_QTY) * parseInt(liNonODBOM[iOD].COMP_QTY);
                            liAsmReq.push(GenF.parse(lsAsmReq));
                            lsAsmReq = {};
                        }

                    }
                }
            }
        }
        GenF.log(`Assembly Requirements to be created: ${liAsmReq.length}`);
        if (liAsmReq.length > 0) {
            const keys = ['LOCATION_ID', 'PRODUCT_ID', 'ITEM_NUM', 'COMPONENT', 'WEEK_DATE'];
            liAsmReq = GenF.removeDuplicate(liAsmReq, keys);
            try {
                await cds.run(INSERT.into("CP_ASSEMBLY_REQ").entries(liAsmReq));
                GenF.log(`Assembly Requirements Created successfully with records ${liAsmReq.length}`);
                vFlag = 'X';
            } catch (e) {
                vFlag = '';
                console.log(e.message);
                throw new Error(e.toString());
            }
        }
        else if (vFlag === '') {
            vFlag = 'W';
        }
        liAsmReq = [];
        if (vFlag === 'X') {
            let lMsg = "Completed Assembly Requirement Calculation";
            GenF.log(lMsg);
            oReturn.bError = false;
            oReturn.message = lMsg;
            await this.genRestrReq(adata, req, lMsg);

             //Alerts
            let aNotPlannedAssemblies =  await cds.run(`SELECT 
                    COMPONENT || '(' || STRING_AGG(UNIQUE_ID, ',') || ')' AS COMPONENT
                FROM "CP_ASSEMBLY_REQ"
                WHERE REF_PRODID = '${adata.PRODUCT_ID}'
                AND TYPE != 'RT'
                AND COMPCIR_QTY <= 0
                GROUP BY COMPONENT`)
            if(aNotPlannedAssemblies.length >0){
                let sAssemblies = aNotPlannedAssemblies.map(f => `'${f.COMPONENT}'`).join(', ');
                  if (sAssemblies.length >= 5000) {
                              sAssemblies = sAssemblies.slice(0, 4995) + "...";
                }
                const alertLog = [{ MSGID: 'S05', APPL: 'VCPLANNER', MSGGRP: 'DATA' , LOCATION_ID:adata.FACTORY_LOC, PRODUCT_ID:adata.PRODUCT_ID,MSGTXT:sAssemblies,PARA2:adata.VERSION,PARA3:adata.SCENARIO}];
                await GenF.sendAlert('C', alertLog, req);
            }

             //Alert for Restriction Capacity
             const objCatFn = new Catservicefn();
             await objCatFn.dataValidationAlert(req,'RTR_CAPACITY');
        }
        if (vFlag === 'W') {
            let lMsg = "No data to generate Assembly Requirement";
            GenF.log(lMsg);
            oReturn.bError = false;
            oReturn.message = lMsg
        }
        else {
            let lMsg = "Assembly Requirement Calculation failed (or) Insufficient data ";
            GenF.log(lMsg);
        }

    }
    async genRestrReq(adata, req, lMessage) {

        await GenF.logMessage(req, `Started Restriction likelihood Calculation`);

        let vFlag = '';
        var sError ='';
        let telePreiods = await cds.run(`select * from CP_TELESCOPIC_PERIODS`);
                    for(let t=0; t<telePreiods.length; t++){
                        let aOpenAsmbReq = [];
                        let fromDate = telePreiods[t].PERIODSTART;
                        let toDate = telePreiods[t].PERIODEND;          
                    // aOpenAsmbReq = await cds.run(`SELECT
                    //         CP_BOM_UID."LOCATION_ID",
                    //         CP_BOM_UID."PRODUCT_ID",                                    
                    //         CP_BOM_UID."ITEM_NUM",
                    //         CP_BOM_UID."ASSEMBLY" AS COMPONENT,
                    //         CP_CIR_GENERATED.WEEK_DATE,
                    //         CP_CIR_GENERATED."MODEL_VERSION",
                    //         CP_CIR_GENERATED."VERSION",
                    //         CP_CIR_GENERATED."SCENARIO",
                    //         CP_BOM_UID."RULE_TYPE" AS TYPE,
                    //         CP_BOM_UID."REF_PRODID",
                    //         CP_BOM_UID."FACTORY_LOC",
                    //         CP_BOM_UID."UNIQUE_ID",
                    //          SUM(CP_CIR_GENERATED.CIR_QTY) AS CIR_QTY,
                    //         SUM(CP_CIR_GENERATED.CIR_QTY * CP_BOM_UID."ASMB_QTY") AS COMPCIR_QTY
                    //     FROM 
                    //         "CP_BOM_UID"
                    //     INNER JOIN
                    //         CP_CIR_GENERATED
                    //         ON CP_BOM_UID."LOCATION_ID" = CP_CIR_GENERATED."LOCATION_ID"
                    //             AND CP_BOM_UID."PRODUCT_ID" = CP_CIR_GENERATED."PRODUCT_ID"
                    //             AND CP_BOM_UID."UNIQUE_ID" = CP_CIR_GENERATED."UNIQUE_ID"
                    //             AND CP_BOM_UID.VALID_FROM <= CP_CIR_GENERATED.WEEK_DATE
                    //             AND CP_BOM_UID.VALID_TO >= CP_CIR_GENERATED.WEEK_DATE
                    //     WHERE CP_CIR_GENERATED."LOCATION_ID" = '${adata.LOCATION_ID}'
                    //             AND CP_BOM_UID."REF_PRODID" =  '${adata.PRODUCT_ID}'
                    //             AND CP_CIR_GENERATED.WEEK_DATE >= '${fromDate}'
                    //             AND CP_CIR_GENERATED.WEEK_DATE <= '${toDate}'
                    //             AND CP_CIR_GENERATED.VERSION = '${adata.VERSION}'
                    //             AND CP_CIR_GENERATED.SCENARIO = '${adata.SCENARIO}'
                    //             AND CP_CIR_GENERATED.MODEL_VERSION = 'Active'
                    //              AND CP_BOM_UID.RULE_TYPE = 'RT'
                    //         GROUP BY 
                    //             CP_BOM_UID."LOCATION_ID",
                    //             CP_BOM_UID."PRODUCT_ID",
                    //             CP_BOM_UID."UNIQUE_ID",
                    //             CP_BOM_UID."ITEM_NUM",
                    //             CP_BOM_UID."ASSEMBLY",
                    //             CP_CIR_GENERATED.WEEK_DATE,
                    //             CP_CIR_GENERATED."MODEL_VERSION",
                    //             CP_CIR_GENERATED."VERSION",
                    //             CP_CIR_GENERATED."SCENARIO",
                    //             CP_BOM_UID.RULE_TYPE,
                    //             CP_BOM_UID.REF_PRODID,
                    //             CP_BOM_UID.FACTORY_LOC`);

                    aOpenAsmbReq = await cds.run(`SELECT
                                                LOCATION_ID,
                                                PRODUCT_ID,                                    
                                                ITEM_NUM,
                                                COMPONENT,
                                                WEEK_DATE,
                                                MODEL_VERSION,
                                                VERSION,
                                                SCENARIO,
                                                TYPE,
                                                REF_PRODID,
                                                FACTORY_LOC,
                                                UNIQUE_ID,
                                                FINAL_ASS,
                                                CIR_QTY,
                                                COMPCIR_QTY
                                            FROM 
                                                V_OPENASSEMBLYREQ                    
                                            
                                            WHERE LOCATION_ID = '${adata.FACTORY_LOC}'  
                                                    AND REF_PRODID =  '${adata.PRODUCT_ID}'
                                                    AND WEEK_DATE BETWEEN '${fromDate}' and '${toDate}'                                
                                                    AND VERSION = '${adata.VERSION}'
                                                    AND SCENARIO = '${adata.SCENARIO}'
                                                    AND MODEL_VERSION = 'Active'
                                                    AND TYPE = 'RT'
                                                    AND CIR_QTY > 0
                            `);

                    if (aOpenAsmbReq.length > 0) {

                        let cqnQuery = { UPSERT: { into: { ref: ['CP_ASSEMBLY_REQ'] }, entries: aOpenAsmbReq } };
                        try {
                            await cds.run(cqnQuery);
                            vFlag = 'X';
                        } catch (e) {
                            sError=`Reason: ${e.message}`
                            console.log('Error');
                            vFlag = 'Y';
                        }
                    }

                    GenF.log(`Restrictions Likelihood Created successfully`);
                    
                }
                if (vFlag === 'X') {
                    let lMsg = "Restrictions Likelihood Created successfully";
                    await GenF.jobSchMessage('X', lMsg, req);
               
            }
            else if(vFlag === 'Y') {
                
                    let lMsg = " Restriction Likelihood generation failed."+sError;
                    await GenF.jobSchMessage('X', lMsg, req);
                } else {
                    let lMsg = "Insufficient data for generating Restriction Likelihood "
                await GenF.jobSchMessage('X', lMsg, req);
                }
        // let vFlag = '';

        // GenF.log(`Tech: Get data from V_CIRUNIQUECHAR using ${adata.LOCATION_ID} ${adata.PRODUCT_ID}`);
        // // const liCIRData = await cds.run(`
        // //         SELECT LOCATION_ID,PRODUCT_ID,WEEK_DATE,CIR_ID,MODEL_VERSION,VERSION,SCENARIO,UNIQUE_ID,REF_PRODID,CIR_QTY,CHAR_NUM,
        // //             CHARVAL_NUM
        // //           FROM V_CIRUNIQUECHAR
        // //          WHERE LOCATION_ID   = '${adata.LOCATION_ID}'
        // //            AND (PRODUCT_ID IN ( SELECT PRODUCT_ID 
        // //                               FROM CP_PARTIALPROD_INTRO 
        // //                               WHERE REF_PRODID    = '${adata.PRODUCT_ID}'
        // //                               AND LOCATION_ID   = '${adata.LOCATION_ID}' ) 
        // //             )
        // //             ORDER BY LOCATION_ID,
        // //                      PRODUCT_ID,
        // //                      WEEK_DATE, 
        // //                      MODEL_VERSION,
        // //                      VERSION, 
        // //                      SCENARIO,                         
        // //                      CIR_ID, 
        // //                      UNIQUE_ID,  
        // //                      CIR_QTY
        // //     `);


        // var liCIRData = await cds.run(`SELECT 
        //         A."LOCATION_ID",
        //     A."PRODUCT_ID",
        //     A."WEEK_DATE",
        //     A."CIR_ID",
        //     A."MODEL_VERSION",
        //     A.VERSION,
        //     A.SCENARIO,
        //     A."UNIQUE_ID",
        //      P."REF_PRODID",
        //     A."CIR_QTY"
        // FROM
        //     CP_CIR_GENERATED AS A
        //     INNER JOIN 
        //     CP_PARTIALPROD_INTRO AS P
        //     ON  A.LOCATION_ID = P.LOCATION_ID
        //     AND A.PRODUCT_ID = P.PRODUCT_ID
        //     INNER JOIN 
        //     CP_PRODUCT AS C
        //     ON P.REF_PRODID = C.PRODUCT_ID
        //     INNER JOIN
        //     CP_IBPCALENDER_WEEK AS F
        //     ON F.WEEK_STARTDATE <= A.WEEK_DATE
        //     AND F.WEEK_ENDDATE >= A.WEEK_DATE 
        //     WHERE  A."LOCATION_ID"='${adata.LOCATION_ID}' AND P.REF_PRODID='${adata.PRODUCT_ID}'
        //     ORDER BY
        //     A.LOCATION_ID ASC,
        //     A.PRODUCT_ID ASC,
        //     A.WEEK_DATE ASC,  
        //     A.CIR_ID ASC
        //   `);
        // await this.removeAssembyReq(adata.LOCATION_ID, adata.PRODUCT_ID, 'RT', adata.VERSION, adata.SCENARIO);

        // let liCIR = [];
        // let lsCIR = {};
        // let liChar = [];
        // let lsChar = {};
        // let vCIRQTY = 0;
        // let liAsmReq = [];
        // let lsAsmReq = {};

        // if (liCIRData.length == 0) {
        //     GenF.log(`Tech: Get from V_RESTRICTIONREQ  using ${adata.LOCATION_ID} ${adata.PRODUCT_ID}`);

        //     const liRTData = await cds.run(`
        //         SELECT "LOCATION_ID",
        //                 "PRODUCT_ID",
        //                 "WEEK_DATE", 
        //                 "FACTORY_LOC",
        //                 "RESTRICTION", 
        //                 "VERSION",                         
        //                 "SCENARIO",
        //                 "MODEL_VERSION",
        //                 "REF_PRODID",
        //                 SUM("RTR_QTY") AS RTR_QTY
        //           FROM V_RESTRICTIONREQ 
        //          WHERE LOCATION_ID   = '${adata.LOCATION_ID}'
        //            AND REF_PRODID = '${adata.PRODUCT_ID}'
        //          GROUP BY "LOCATION_ID",
        //                   "PRODUCT_ID",
        //                    "WEEK_DATE", 
        //                    "FACTORY_LOC",
        //                    "RESTRICTION", 
        //                    "VERSION",                         
        //                    "SCENARIO",
        //                    "MODEL_VERSION",
        //                    "REF_PRODID"
        //          ORDER BY "LOCATION_ID",
        //                    "PRODUCT_ID",
        //                    "WEEK_DATE", 
        //                    "FACTORY_LOC",
        //                    "RESTRICTION", 
        //                    "VERSION",                         
        //                    "SCENARIO",
        //                    "MODEL_VERSION",
        //                    "REF_PRODID"
        //     `);
        //     // for M1
        //     if (liRTData) {
        //         for (let i = 0; i < liRTData.length; i++) {
        //             if (i === GenF.addOne(i, liRTData.length) ||
        //                 liRTData[i].LOCATION_ID !== liRTData[GenF.addOne(i, liRTData.length)].LOCATION_ID ||
        //                 liRTData[i].PRODUCT_ID !== liRTData[GenF.addOne(i, liRTData.length)].PRODUCT_ID ||
        //                 liRTData[i].WEEK_DATE !== liRTData[GenF.addOne(i, liRTData.length)].WEEK_DATE ||
        //                 liRTData[i].RESTRICTION !== liRTData[GenF.addOne(i, liRTData.length)].RESTRICTION ||
        //                 liRTData[i].VERSION !== liRTData[GenF.addOne(i, liRTData.length)].VERSION ||
        //                 liRTData[i].SCENARIO !== liRTData[GenF.addOne(i, liRTData.length)].SCENARIO) {
        //                 const objRT = {};
        //                 objRT.LOCATION_ID = GenF.parse(liRTData[i].LOCATION_ID);
        //                 objRT.PRODUCT_ID = GenF.parse(liRTData[i].PRODUCT_ID);
        //                 objRT.WEEK_DATE = GenF.parse(liRTData[i].WEEK_DATE);
        //                 objRT.MODEL_VERSION = (liRTData[i].MODEL_VERSION) ? GenF.parse(liRTData[i].MODEL_VERSION) : "Active";
        //                 objRT.VERSION = GenF.parse(liRTData[i].VERSION);
        //                 objRT.SCENARIO = GenF.parse(liRTData[i].SCENARIO);
        //                 objRT.ITEM_NUM = GenF.parse('10');
        //                 objRT.COMPONENT = GenF.parse(liRTData[i].RESTRICTION);
        //                 objRT.REF_PRODID = GenF.parse(liRTData[i].REF_PRODID);
        //                 objRT.COMPCIR_QTY = GenF.parse(liRTData[i].RTR_QTY);
        //                 objRT.TYPE = "RT";
        //                 liAsmReq.push(GenF.parse(objRT));
        //             }
        //         }
        //     }
        // }
        // else {
        //     let aUnique = await cds.run(`SELECT 
        //         A.UNIQUE_ID,
        //         A.PRODUCT_ID,
        //         A.CHAR_NUM,
        //         A.CHAR_VALUE
        //     FROM 
        //         "V_UNIQUE_ID" AS A
        //         INNER JOIN
        //         V_PRODCLSCHARVAL AS E
        //         ON E.PRODUCT_ID = A.PRODUCT_ID
        //             AND E.CHAR_NUM = A.CHAR_NUM
        //             AND E.CHARVAL_NUM = A.CHARVAL_NUM
        //     WHERE A."PRODUCT_ID" = '${adata.PRODUCT_ID}'`);

        //     var oUnique = {}
        //     for (var i = 0; i < aUnique.length; i++) {
        //         let el = aUnique[i];
        //         oUnique[el.UNIQUE_ID] ??= {}
        //         oUnique[el.UNIQUE_ID][el.PRODUCT_ID] ??= [];
        //         oUnique[el.UNIQUE_ID][el.PRODUCT_ID].push({
        //             "CHAR_NUM": el.CHAR_NUM,
        //             "CHARVAL_NUM": el.CHAR_VALUE
        //         })
        //     }
        //     aUnique.length = 0;
        //     for (let cntCIR = 0; cntCIR < liCIRData.length; cntCIR++) {

        //         lsChar = {};
        //         // lsChar.CHAR_NUM = liCIRData[cntCIR].CHAR_NUM;
        //         // lsChar.CHARVAL_NUM = liCIRData[cntCIR].CHARVAL_NUM;
        //         // liChar.push(lsChar);

        //         if (cntCIR === GenF.addOne(cntCIR, liCIRData.length) ||
        //             liCIRData[cntCIR].LOCATION_ID !== liCIRData[GenF.addOne(cntCIR, liCIRData.length)].LOCATION_ID ||
        //             liCIRData[cntCIR].PRODUCT_ID !== liCIRData[GenF.addOne(cntCIR, liCIRData.length)].PRODUCT_ID ||
        //             liCIRData[cntCIR].WEEK_DATE !== liCIRData[GenF.addOne(cntCIR, liCIRData.length)].WEEK_DATE ||
        //             liCIRData[cntCIR].CIR_ID !== liCIRData[GenF.addOne(cntCIR, liCIRData.length)].CIR_ID ||
        //             liCIRData[cntCIR].MODEL_VERSION !== liCIRData[GenF.addOne(cntCIR, liCIRData.length)].MODEL_VERSION ||
        //             liCIRData[cntCIR].VERSION !== liCIRData[GenF.addOne(cntCIR, liCIRData.length)].VERSION ||
        //             liCIRData[cntCIR].SCENARIO !== liCIRData[GenF.addOne(cntCIR, liCIRData.length)].SCENARIO ||
        //             liCIRData[cntCIR].UNIQUE_ID !== liCIRData[GenF.addOne(cntCIR, liCIRData.length)].UNIQUE_ID) {
        //             lsCIR = {};
        //             lsCIR.LOCATION_ID = GenF.parse(liCIRData[cntCIR].LOCATION_ID);
        //             lsCIR.PRODUCT_ID = GenF.parse(liCIRData[cntCIR].PRODUCT_ID);
        //             lsCIR.WEEK_DATE = GenF.parse(liCIRData[cntCIR].WEEK_DATE);
        //             lsCIR.CIR_ID = GenF.parse(liCIRData[cntCIR].CIR_ID);
        //             lsCIR.MODEL_VERSION = GenF.parse(liCIRData[cntCIR].MODEL_VERSION);
        //             lsCIR.VERSION = GenF.parse(liCIRData[cntCIR].VERSION);
        //             lsCIR.SCENARIO = GenF.parse(liCIRData[cntCIR].SCENARIO);
        //             lsCIR.UNIQUE_ID = GenF.parse(liCIRData[cntCIR].UNIQUE_ID);
        //             lsCIR.REF_PRODID = GenF.parse(liCIRData[cntCIR].REF_PRODID);
        //             lsCIR.CIR_QTY = GenF.parse(liCIRData[cntCIR].CIR_QTY);
        //             console.log("cntCIR", cntCIR);
        //             console.log("lsCIR.UNIQUE_ID", lsCIR.UNIQUE_ID);
        //             console.log("lsCIR.REF_PRODID", lsCIR.REF_PRODID);

        //              if(oUnique[lsCIR.UNIQUE_ID]){
        //             let liChar = oUnique[lsCIR.UNIQUE_ID][lsCIR.REF_PRODID];
        //             lsCIR.CHAR = GenF.parse(liChar);
        //             liCIR.push(lsCIR);
        //             }

        //             liChar = [];
        //         }
        //     }
        //     GenF.log(`Tech: Get from V_LOCPRODRT_DETAILS and CP_FACTORY_SALESLOC using ${adata.LOCATION_ID} ${adata.PRODUCT_ID}`);
        //     const liRTChar = await cds.run(
        //         `SELECT DISTINCT A.RESTRICTION,
        //                          A.RTR_QTY,   
        //                          A.RTR_COUNTER,
        //                          A.CHAR_NUM,
        //                          A.CHARVAL_NUM,
        //                          A.OD_CONDITION,
        //                          A.CHAR_COUNTER
        //             FROM "V_LOCPRODRT_DETAILS" AS A
        //             INNER JOIN "CP_FACTORY_SALESLOC" AS B
        //             ON A."LOCATION_ID" = B."FACTORY_LOC"
        //             WHERE B."LOCATION_ID" = '${adata.LOCATION_ID}'
        //                 AND A."PRODUCT_ID"  = '${adata.PRODUCT_ID}'
        //                 ORDER BY A.RESTRICTION,
        //                          A.RTR_COUNTER,
        //                          A.CHAR_COUNTER`
        //     );

        //     let lsRTCount = {};
        //     let liRT = [];
        //     let lsRT = {};

        //     for (let cntRT = 0; cntRT < liRTChar.length; cntRT++) {

        //         if (cntRT === 0 ||
        //             liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.subOne(cntRT)].RESTRICTION) {
        //             lsRT.RESTRICTION = GenF.parse(liRTChar[cntRT].RESTRICTION);
        //             lsRT.RTR_QTY = GenF.parse(GenF.parse(liRTChar[cntRT].RTR_QTY));
        //             lsRT.COUNTER = [];
        //         }


        //         if (cntRT === 0 ||
        //             liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.subOne(cntRT)].RESTRICTION ||
        //             liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.subOne(cntRT)].RTR_COUNTER) {
        //             lsRTCount = {};
        //             lsRTCount.RTR_COUNTER = GenF.parse(liRTChar[cntRT].RTR_COUNTER);
        //             lsRTCount.CHAR = [];
        //         }
        //         let lsChar = {};

        //         lsChar.CHAR_NUM = GenF.parse(liRTChar[cntRT].CHAR_NUM);
        //         lsChar.CHARVAL_NUM = GenF.parse(liRTChar[cntRT].CHARVAL_NUM);
        //         lsChar.OD_CONDITION = GenF.parse(liRTChar[cntRT].OD_CONDITION);
        //         lsChar.CHAR_COUNTER = GenF.parse(liRTChar[cntRT].CHAR_COUNTER);
        //         lsChar.QTY = GenF.parse(liRTChar[cntRT].RTR_QTY);
        //         lsRTCount.CHAR.push(lsChar);
        //         lsRT.COUNTER = [];
        //         if (cntRT === GenF.addOne(cntRT, liRTChar.length) ||
        //             liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.addOne(cntRT)].RESTRICTION ||
        //             liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.addOne(cntRT)].RTR_COUNTER) {

        //             lsRT.COUNTER.push(lsRTCount);
        //         }

        //         if (cntRT === GenF.addOne(cntRT, liRTChar.length) ||
        //             liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.addOne(cntRT)].RESTRICTION) {

        //             liRT.push(lsRT);
        //             lsRT = {};
        //         }

        //     }
        //     let lFail = '';


        //     for (let cntRT = 0; cntRT < liRT.length; cntRT++) {
        //         const lsRT = liRT[cntRT];


        //         for (let cntCIR = 0; cntCIR < liCIR.length; cntCIR++) {
        //             const element = liCIR[cntCIR];
                    
        //             lFail = '';
        //             for (let cntRTC = 0; cntRTC < lsRT.COUNTER.length; cntRTC++) {
        //                 const lsCounter = lsRT.COUNTER[cntRTC];
        //                 lFail = '';
        //                 let lCharCounter = 0;
        //                 for (let cntCh = 0; cntCh < lsCounter.CHAR.length; cntCh++) {
        //                     const lsRTChar = lsCounter.CHAR[cntCh];
        //                     lFail = '';

        //                     for (let cntCch = 0; cntCch < liCIR[cntCIR].CHAR.length; cntCch++) {
        //                         const lsCIRChar = liCIR[cntCIR].CHAR[cntCch];
        //                         if (lsCIRChar.CHAR_NUM === lsRTChar.CHAR_NUM) {
        //                             if ((lsRTChar.OD_CONDITION === 'EQ' &&
        //                                 lsCIRChar.CHARVAL_NUM === lsRTChar.CHARVAL_NUM) ||
        //                                 (lsRTChar.OD_CONDITION === 'NE' &&
        //                                     lsCIRChar.CHARVAL_NUM !== lsRTChar.CHARVAL_NUM)) {
        //                                 //Success Counter
        //                                 liCIR[cntCIR].TEMP_QTY =lsRTChar.QTY;
        //                                 lCharCounter = lsCounter.CHAR[cntCh].CHAR_COUNTER;
        //                                 break;
        //                             }
        //                             else {
        //                                 //Check if there was a success for this counter
        //                                 if (lCharCounter !== lsCounter.CHAR[cntCh].CHAR_COUNTER) {
        //                                     //Check if there are any other conditions for this counter
        //                                     if (cntCh === GenF.addOne(cntCh, lsCounter.CHAR.length) ||
        //                                         lsCounter.CHAR[cntCh].CHAR_COUNTER !== lsCounter.CHAR[GenF.addOne(cntCh, lsCounter.CHAR.length)].CHAR_COUNTER) {
        //                                         lFail = 'X';
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                     }
        //                     //check if char_num exists in Unique ID, if not mark lFail as "X"
        //                     if(liCIR[cntCIR].CHAR && liCIR[cntCIR].CHAR.length>0){
        //                         if(liCIR[cntCIR].CHAR.findIndex(ch=>ch.CHAR_NUM == lsRTChar.CHAR_NUM) == -1){
        //                             lFail ='X';
        //                         }
        //                     }
        //                     if (lFail === 'X') {
        //                         break;
        //                     }
        //                 }
        //                 if (lFail === '' || (lFail === 'X' &&
        //                     cntRTC === GenF.addOne(cntRTC, lsRT.COUNTER.length))) {
        //                     break;
        //                 }
        //             }

        //             if (lFail === '') {
        //                 liCIR[cntCIR].CIR_QTY = liCIR[cntCIR].CIR_QTY * parseInt(liCIR[cntCIR].TEMP_QTY);
        //                 vCIRQTY = parseInt(liCIR[cntCIR].CIR_QTY) + vCIRQTY;
        //             }
        //             if (cntCIR === GenF.addOne(cntCIR, liCIR.length) ||
        //                 liCIR[cntCIR].LOCATION_ID !== liCIR[GenF.addOne(cntCIR, liCIR.length)].LOCATION_ID ||
        //                 liCIR[cntCIR].PRODUCT_ID !== liCIR[GenF.addOne(cntCIR, liCIR.length)].PRODUCT_ID ||
        //                 liCIR[cntCIR].WEEK_DATE !== liCIR[GenF.addOne(cntCIR, liCIR.length)].WEEK_DATE ||
        //                 liCIR[cntCIR].MODEL_VERSION !== liCIR[GenF.addOne(cntCIR, liCIR.length)].MODEL_VERSION ||
        //                 liCIR[cntCIR].VERSION !== liCIR[GenF.addOne(cntCIR, liCIR.length)].VERSION ||
        //                 liCIR[cntCIR].SCENARIO !== liCIR[GenF.addOne(cntCIR, liCIR.length)].SCENARIO) {
        //                 lsAsmReq.LOCATION_ID = GenF.parse(liCIR[cntCIR].LOCATION_ID);
        //                 lsAsmReq.PRODUCT_ID = GenF.parse(liCIR[cntCIR].PRODUCT_ID);
        //                 lsAsmReq.WEEK_DATE = GenF.parse(liCIR[cntCIR].WEEK_DATE);
        //                 lsAsmReq.MODEL_VERSION = GenF.parse(liCIR[cntCIR].MODEL_VERSION);
        //                 lsAsmReq.VERSION = GenF.parse(liCIR[cntCIR].VERSION);
        //                 lsAsmReq.SCENARIO = GenF.parse(liCIR[cntCIR].SCENARIO);
        //                 lsAsmReq.ITEM_NUM = GenF.parse('10');
        //                 lsAsmReq.COMPONENT = GenF.parse(liRT[cntRT].RESTRICTION);
        //                 lsAsmReq.TYPE = "RT";
        //                 lsAsmReq.REF_PRODID = GenF.parse(liCIR[cntCIR].REF_PRODID);
        //                 lsAsmReq.COMPCIR_QTY = parseInt(vCIRQTY);
        //                 if (vCIRQTY > 0) {
        //                     liAsmReq.push(GenF.parse(lsAsmReq));
        //                 }
        //                 vCIRQTY = 0;
        //                 lsAsmReq = {};
        //             }
        //         }
        //     }
        // }
        // GenF.log(`Restrictions Assembly Requirements to be created: ${liAsmReq.length}`);
        // if (liAsmReq.length > 0) {
        //     try {
        //         await cds.run(INSERT.into("CP_ASSEMBLY_REQ").entries(liAsmReq));
        //         GenF.log("Restrictions Assembly Requirements Created successfully ");
        //         vFlag = 'X';

        //     } catch (e) {
        //         console.log(e.message);
        //     }
        //     liAsmReq = [];
        //     if (vFlag === 'X') {
        //         if (lMessage === '') {
        //             let lMsg = "Restriction Likelihood generation is Successful";
        //             await GenF.jobSchMessage('X', lMsg, req);
        //         } else {
        //             let lMsg = lMessage + " and " + " Restriction Likelihood generation is Successful";
        //             await GenF.jobSchMessage('X', lMsg, req);
        //         }
        //     }
        //     else {
        //         if (lMessage === '') {
        //             let lMsg = "Restriction Likelihood generation failed";
        //             await GenF.jobSchMessage('X', lMsg, req);
        //         } else {
        //             let lMsg = lMessage + " and " + " Restriction Likelihood generation failed";
        //             await GenF.jobSchMessage('X', lMsg, req);
        //         }

        //     }
        // }
        // else {
        //     if (lMessage === '') {
        //         let lMsg = "Insufficient data for generating Restriction Likelihood "
        //         await GenF.jobSchMessage('X', lMsg, req);
        //     } else {
        //         let lMsg = lMessage + " and " + " Insufficient data for generating Restriction Likelihood "
        //         await GenF.jobSchMessage('X', lMsg, req);
        //     }
        // }
    }
    // get UniqueIDs and it config
    async getUnique() {
        GenF.log(`Tech: Function getUnique Get from V_UNIQUE_ID all records`);
        GenF.log(`Get all unique ID's with configuration`);
        const liPartialGet = await cds.run(
            `SELECT "UNIQUE_ID",
                    "PRODUCT_ID",
                    "CHAR_NUM",
                    "CHARVAL_NUM"
               FROM "V_UNIQUE_ID"
            ORDER BY UNIQUE_ID,
                     PRODUCT_ID,
                     CHAR_NUM,
                     CHARVAL_NUM`
        );

        let lsPartialConfig = {};
        let lsPartial = {};
        let liUniqueData = [];

        for (let cntU = 0; cntU < liPartialGet.length; cntU++) {
            if (cntU === 0 ||
                liPartialGet[cntU].UNIQUE_ID !== liPartialGet[GenF.subOne(cntU, liPartialGet.length)].UNIQUE_ID ||
                liPartialGet[cntU].PRODUCT_ID !== liPartialGet[GenF.subOne(cntU, liPartialGet.length)].PRODUCT_ID) {
                lsPartial = {};
                lsPartial['UNIQUE_ID'] = GenF.parse(liPartialGet[cntU].UNIQUE_ID);
                lsPartial['PRODUCT_ID'] = GenF.parse(liPartialGet[cntU].PRODUCT_ID);
                lsPartial['CONFIG'] = [];
            }
            lsPartialConfig = {};
            lsPartialConfig['CHAR_NUM'] = GenF.parse(liPartialGet[cntU].CHAR_NUM);
            lsPartialConfig['CHARVAL_NUM'] = GenF.parse(liPartialGet[cntU].CHARVAL_NUM);
            lsPartial['CONFIG'].push(lsPartialConfig);

            if (cntU === GenF.addOne(cntU, liPartialGet.length) ||
                liPartialGet[cntU].UNIQUE_ID !== liPartialGet[GenF.addOne(cntU, liPartialGet.length)].UNIQUE_ID ||
                liPartialGet[cntU].PRODUCT_ID !== liPartialGet[GenF.addOne(cntU, liPartialGet.length)].PRODUCT_ID) {
                liUniqueData.push(lsPartial);
            }
        }

        GenF.log(`Total Unique ID ${liUniqueData.length}`);
        return liUniqueData;
    }

    // Get Partical Products and it config
    async genPartialProdConfig() {
        GenF.log(`Tech: Function assembly-req/genPartialProdConfig`);
        let liUniqueData = await this.genUniqueID();

        GenF.log(`Tech: Get V_PARTIALPRODCLASSCHAR all records`);
        const liPartialGet = await cds.run(
            `SELECT "LOCATION_ID",
                    "PRODUCT_ID",
                    "REF_PRODID",
                    "CHAR_NUM",
                    "CHARVAL_NUM"
               FROM "V_PARTIALPRODCLASSCHAR"
              WHERE CONFIGPROD_CHK IS NULL
           ORDER BY "LOCATION_ID",
                    "PRODUCT_ID",
                    "REF_PRODID",
                    "CHAR_NUM",
                    "CHARVAL_NUM"`
        );

        let lsPartialConfig = {};
        let lsPartial = {};
        let liPartialData = [];
        for (let cntU = 0; cntU < liPartialGet.length; cntU++) {
            if (cntU === 0 ||
                liPartialGet[cntU].LOCATION_ID !== liPartialGet[GenF.subOne(cntU, liPartialGet.length)].LOCATION_ID ||
                liPartialGet[cntU].PRODUCT_ID !== liPartialGet[GenF.subOne(cntU, liPartialGet.length)].PRODUCT_ID) {
                lsPartial = {};
                lsPartial['LOCATION_ID'] = GenF.parse(liPartialGet[cntU].LOCATION_ID);
                lsPartial['PRODUCT_ID'] = GenF.parse(liPartialGet[cntU].PRODUCT_ID);
                lsPartial['REF_PRODID'] = GenF.parse(liPartialGet[cntU].REF_PRODID);
                lsPartial['CONFIG'] = [];
            }
            lsPartialConfig = {};
            lsPartialConfig['CHAR_NUM'] = GenF.parse(liPartialGet[cntU].CHAR_NUM);
            lsPartialConfig['CHARVAL_NUM'] = GenF.parse(liPartialGet[cntU].CHARVAL_NUM);
            lsPartial['CONFIG'].push(lsPartialConfig);
            let liUniqueID = liUniqueData.filter(function (aUni) {
                return (JSON.stringify(aUni.CONFIG) === JSON.stringify(lsPartial.CONFIG)) &&
                    aUni.PRODUCT_ID === lsPartial.REF_PRODID
            });

            if (cntU === GenF.addOne(cntU, liPartialGet.length) ||
                liPartialGet[cntU].LOCATION_ID !== liPartialGet[GenF.addOne(cntU, liPartialGet.length)].LOCATION_ID ||
                liPartialGet[cntU].PRODUCT_ID !== liPartialGet[GenF.addOne(cntU, liPartialGet.length)].PRODUCT_ID) {
                for (let cntUni = 0; cntUni < liUniqueID.length; cntUni++) {
                    lsPartial['UNIQUE_ID'] = liUniqueID[cntUni].UNIQUE_ID;
                    liPartialData.push(GenF.parse(lsPartial));
                }
                // liPartialData.push(lsPartial);
            }
        }
        GenF.log(`Total Partial products: ${liPartialData.length}`);
        return liPartialData;
    }
    async genBOMUID(lLocation, lProduct, req) {
        GenF.log(`Tech: Function assembly-req/genBOMUID`);

        let liBOMUID = [];
        let oResponse = { bError: false, sMessage: '' };

        GenF.log(`Tech: Get from V_UNIQUE_ID and V_SALES_H using ${lLocation} ${lProduct}`);
        // Fetch unique id that doesnot exist in BOM UID table
        let liUniqueData = await cds.run(`SELECT DISTINCT 
                                              V_SALES_H.LOCATION_ID,
                                              V_SALES_H.PRODUCT_ID,
                                              V_UNIQUE_ID.PRODUCT_ID AS REF_PRODID,
                                              V_UNIQUE_ID.UNIQUE_ID,
                                              V_UNIQUE_ID.CHAR_NUM,
                                              V_UNIQUE_ID.CHARVAL_NUM
                                              FROM 
                                              V_UNIQUE_ID
                                              INNER JOIN
                                              V_SALES_H
                                              ON V_UNIQUE_ID.PRODUCT_ID = V_SALES_H.REF_PRODID
                                                  AND V_UNIQUE_ID.UNIQUE_ID = V_SALES_H.UNIQUE_ID
                                              WHERE V_SALES_H.FACTORY_LOC = '${lLocation}'
                                              AND V_UNIQUE_ID.PRODUCT_ID = '${lProduct}'
                                              AND V_UNIQUE_ID.UID_TYPE = 'U'
                                              ORDER BY V_SALES_H.LOCATION_ID,
                                              V_SALES_H.PRODUCT_ID,                                                        
                                              V_UNIQUE_ID.PRODUCT_ID,
                                              V_UNIQUE_ID.UNIQUE_ID`);

        let lspUID = {},
            lsChar = {},
            liChar = [],
            liUniqueItem = [];
        // Build Partial prod UID 
        for (let iUID = 0; iUID < liUniqueData.length; iUID++) {

            lsChar = {};
            lsChar.CHAR_NUM = liUniqueData[iUID].CHAR_NUM;
            lsChar.CHARVAL_NUM = liUniqueData[iUID].CHARVAL_NUM;
            liChar.push(lsChar);

            if (iUID === GenF.addOne(iUID, liUniqueData.length) ||
                liUniqueData[iUID].LOCATION_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].LOCATION_ID ||
                liUniqueData[iUID].PRODUCT_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].PRODUCT_ID ||
                liUniqueData[iUID].UNIQUE_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].UNIQUE_ID) {
                lspUID = {};
                lspUID.LOCATION_ID = GenF.parse(liUniqueData[iUID].LOCATION_ID);
                lspUID.PRODUCT_ID = GenF.parse(liUniqueData[iUID].PRODUCT_ID);
                lspUID.UNIQUE_ID = GenF.parse(liUniqueData[iUID].UNIQUE_ID);
                lspUID.REF_PRODID = GenF.parse(liUniqueData[iUID].REF_PRODID);
                lspUID.CHAR = GenF.parse(liChar);
                liUniqueItem.push(GenF.parse(lspUID));

                liChar = [];
            }

        }

        GenF.log(`Number of Unique ID: ${liUniqueItem.length}`);

        GenF.log(`Tech: Get from V_OBDHDR using ${lLocation} ${lProduct}`);
        // Fetch BOM with Rule       
        let liODChar = await cds.run(
            `SELECT DISTINCT 
                                            V_OBDHDR."LOCATION_ID",
                                            V_OBDHDR."PRODUCT_ID",
                                            V_OBDHDR."ITEM_NUM", 
                                            V_OBDHDR."COMPONENT",
                                            V_OBDHDR."COMP_QTY",   
                                            V_OBDHDR."OBJ_DEP",
                                            V_OBDHDR."OBJ_COUNTER",
                                            V_OBDHDR."CHAR_COUNTER",
                                            V_OBDHDR."CHAR_NUM",
                                            V_OBDHDR."CHARVAL_NUM",
                                            V_OBDHDR."OD_CONDITION",
                                            V_OBDHDR."VALID_FROM",
                                            V_OBDHDR."VALID_TO"
                                       FROM "V_OBDHDR"
                                        WHERE  V_OBDHDR.LOCATION_ID = '${lLocation}'
                                        AND V_OBDHDR.PRODUCT_ID = '${lProduct}'
                                        ORDER BY V_OBDHDR."LOCATION_ID",
                                            V_OBDHDR."PRODUCT_ID",
                                            V_OBDHDR."ITEM_NUM", 
                                            V_OBDHDR."COMPONENT",
                                            V_OBDHDR."OBJ_DEP",
                                            V_OBDHDR."OBJ_COUNTER",
                                            V_OBDHDR."CHAR_COUNTER",
                                            V_OBDHDR."VALID_FROM",
                                            V_OBDHDR."VALID_TO"`
        );
        // AND V_OBDHDR."COMPONENT" IN ( SELECT DISTINCT "ASSEMBLY" FROM "CP_CRITICAL_COMP" WHERE ASSEMBLY_CRITICALKEY = 'X')
        GenF.log(`Number of Object Dependencies: ${liODChar.length}`);

        let liComponent = [];
        let lsComponent = {};
        let lsODCount = {};
        let lsOD = {};
        liODChar.sort(GenF.dynamicSortMultiple("COMPONENT", "ITEM_NUM"));
        for (let cntOD = 0; cntOD < liODChar.length; cntOD++) {
            if (cntOD === 0 ||
                liODChar[cntOD].COMPONENT !== liODChar[GenF.subOne(cntOD)].COMPONENT ||
                (liODChar[cntOD].ITEM_NUM !== liODChar[GenF.subOne(cntOD)].ITEM_NUM &&
                    liODChar[cntOD].COMPONENT === liODChar[GenF.subOne(cntOD)].COMPONENT)) {
                lsComponent.LOCATION_ID = GenF.parse(GenF.parse(liODChar[cntOD].LOCATION_ID));
                lsComponent.PRODUCT_ID = GenF.parse(GenF.parse(liODChar[cntOD].PRODUCT_ID));
                lsComponent.COMPONENT = GenF.parse(GenF.parse(liODChar[cntOD].COMPONENT));
                lsComponent.ITEM_NUM = GenF.parse(GenF.parse(liODChar[cntOD].ITEM_NUM));
                lsComponent.COMP_QTY = GenF.parse(GenF.parse(liODChar[cntOD].COMP_QTY));
                lsComponent.VALID_FROM = GenF.parse(GenF.parse(liODChar[cntOD].VALID_FROM));
                lsComponent.VALID_TO = GenF.parse(GenF.parse(liODChar[cntOD].VALID_TO));
                lsComponent.OD = [];
            }

            if (cntOD === 0 ||
                liODChar[cntOD].COMPONENT !== liODChar[GenF.subOne(cntOD)].COMPONENT ||
                (liODChar[cntOD].ITEM_NUM !== liODChar[GenF.subOne(cntOD)].ITEM_NUM &&
                    liODChar[cntOD].COMPONENT === liODChar[GenF.subOne(cntOD)].COMPONENT &&
                    liODChar[cntOD].OBJ_DEP === liODChar[GenF.subOne(cntOD)].OBJ_DEP) ||
                liODChar[cntOD].OBJ_DEP !== liODChar[GenF.subOne(cntOD)].OBJ_DEP) {
                lsOD = {};
                lsOD.OBJ_DEP = GenF.parse(liODChar[cntOD].OBJ_DEP);
                lsOD.COUNTER = [];
            }


            if (cntOD === 0 ||
                liODChar[cntOD].COMPONENT !== liODChar[GenF.subOne(cntOD)].COMPONENT ||
                (liODChar[cntOD].ITEM_NUM !== liODChar[GenF.subOne(cntOD)].ITEM_NUM &&
                    liODChar[cntOD].COMPONENT === liODChar[GenF.subOne(cntOD)].COMPONENT &&
                    liODChar[cntOD].OBJ_DEP === liODChar[GenF.subOne(cntOD)].OBJ_DEP) ||
                liODChar[cntOD].OBJ_DEP !== liODChar[GenF.subOne(cntOD)].OBJ_DEP ||
                liODChar[cntOD].OBJ_COUNTER !== liODChar[GenF.subOne(cntOD)].OBJ_COUNTER) {
                lsODCount = {};
                lsODCount.OBJ_COUNTER = GenF.parse(liODChar[cntOD].OBJ_COUNTER);
                lsODCount.CHAR = [];
            }
            let lsChar = {};
            lsChar.CHAR_NUM = GenF.parse(liODChar[cntOD].CHAR_NUM);
            lsChar.CHARVAL_NUM = GenF.parse(liODChar[cntOD].CHARVAL_NUM);
            lsChar.OD_CONDITION = GenF.parse(liODChar[cntOD].OD_CONDITION);
            lsChar.CHAR_COUNTER = GenF.parse(liODChar[cntOD].CHAR_COUNTER);
            lsODCount.CHAR.push(lsChar);
            lsOD.COUNTER = [];
            if (cntOD === GenF.addOne(cntOD, liODChar.length) ||
                liODChar[cntOD].COMPONENT !== liODChar[GenF.addOne(cntOD, liODChar.length)].COMPONENT ||
                (liODChar[cntOD].ITEM_NUM !== liODChar[GenF.addOne(cntOD)].ITEM_NUM &&
                    liODChar[cntOD].COMPONENT === liODChar[GenF.addOne(cntOD)].COMPONENT) ||
                liODChar[cntOD].OBJ_DEP !== liODChar[GenF.addOne(cntOD)].OBJ_DEP ||
                liODChar[cntOD].OBJ_COUNTER !== liODChar[GenF.addOne(cntOD)].OBJ_COUNTER) {

                lsOD.COUNTER.push(lsODCount);
            }

            if (cntOD === GenF.addOne(cntOD, liODChar.length) ||
                liODChar[cntOD].COMPONENT !== liODChar[GenF.addOne(cntOD, liODChar.length)].COMPONENT ||
                (liODChar[cntOD].ITEM_NUM !== liODChar[GenF.addOne(cntOD)].ITEM_NUM &&
                    liODChar[cntOD].COMPONENT === liODChar[GenF.addOne(cntOD)].COMPONENT) ||
                liODChar[cntOD].OBJ_DEP !== liODChar[GenF.addOne(cntOD)].OBJ_DEP) {
                try {
                    lsComponent.OD.push(GenF.parse(lsOD));
                    lsOD = {};
                }
                catch (e) {
                    console.log(e);
                }
            }


            if (cntOD === GenF.addOne(cntOD, liODChar.length) ||
                liODChar[cntOD].COMPONENT !== liODChar[GenF.addOne(cntOD, liODChar.length)].COMPONENT ||
                (liODChar[cntOD].ITEM_NUM !== liODChar[GenF.addOne(cntOD)].ITEM_NUM &&
                    liODChar[cntOD].COMPONENT === liODChar[GenF.addOne(cntOD)].COMPONENT)) {

                liComponent.push(GenF.parse(lsComponent));
                lsComponent = {};

            }

        }
        liODChar = [];
        let lFail = '', lAndFlag = '';
        try {
            await cds.run(
                `DELETE FROM CP_BOM_UID WHERE LOCATION_ID = '${lLocation}' AND REF_PRODID = '${lProduct}' AND RULE_TYPE = 'PI'`
            );

            GenF.log(`Deleted Existing BOM UID for Location ${lLocation} and Configurable product ${lProduct}`);
        }
        catch (e) {
            GenF.log(`Error Occured while deleting existing BOM UID mapping for Location ${lLocation} and Configurable product ${lProduct}`);
            GenF.log(e);
        }
        liComponent.sort(GenF.dynamicSortMultiple("COMPONENT", "ITEM_NUM", "VALID_FROM", "VALID_TO"));
        GenF.log(`Total number of components ${liComponent.length}`);

        function compareData(a, b) {
            a.isValid = false;
            if (a.OD_CONDITION == 'EQ') {
                if (a.CHAR_NUM === b.CHAR_NUM &&
                    a.CHARVAL_NUM === b.CHARVAL_NUM) {
                    a.isValid = true;
                }
                aValidList.push(a);
                // if (
                //     (aValidList.filter(f => f.CHARVAL_NUM == a.CHARVAL_NUM &&
                //         f.CHAR_COUNTER == a.CHAR_COUNTER &&
                //         f.CHAR_NUM == a.CHAR_NUM).length == 0)
                //     && a.isValid) {
                //     aValidList.push(a);
                // }
                return a.CHARVAL_NUM === b.CHARVAL_NUM;
            }
            else {
                if (a.CHAR_NUM === b.CHAR_NUM &&
                    a.CHARVAL_NUM !== b.CHARVAL_NUM) {
                    a.isValid = true;
                }
                aValidList.push(a);
                // if (
                //     (aValidList.filter(f => f.CHARVAL_NUM == a.CHARVAL_NUM &&
                //         f.CHAR_COUNTER == a.CHAR_COUNTER &&
                //         f.CHAR_NUM == a.CHAR_NUM).length == 0)
                //     && a.isValid) {
                //     aValidList.push(a);
                // }
                return a.CHARVAL_NUM !== b.CHARVAL_NUM;
            }
        }
        const onlyInLeft = (left, right, compareFunction) =>
            left.filter(leftValue =>
                !right.some(rightValue =>
                    compareFunction(leftValue, rightValue)));



        for (let cntC = 0; cntC < liComponent.length; cntC++) {
            const lsComponent = liComponent[cntC];

            for (let cntUID = 0; cntUID < liUniqueItem.length; cntUID++) {
                //Generate for only valid assembly 
                lFail = 'X';
                for (let cntOD = 0; cntOD < lsComponent.OD.length; cntOD++) {
                    const lsOD = lsComponent.OD[cntOD];

                    //New
                    for (let cntODC = 0; cntODC < lsOD.COUNTER.length; cntODC++) {
                        let aCharacteristics = lsOD.COUNTER[cntODC].CHAR.sort((a, b) => a.CHAR_COUNTER - b.CHAR_COUNTER);
                        var aValidList = [];
                        onlyInLeft(aCharacteristics, liUniqueItem[cntUID].CHAR, compareData);
                        if (aValidList.length > 0) {
                            var iCounter = 0;
                            let aTempList = [...aValidList]
                            aTempList.forEach(el => {
                                if (iCounter != el.CHAR_COUNTER) {
                                    iCounter = el.CHAR_COUNTER;
                                    let aFiltered = aValidList.filter(f => f.isValid == true && f.CHAR_COUNTER == iCounter);
                                    if (aFiltered.length > 0) {//setting true for this charcounter
                                        aValidList.forEach(v => {
                                            if (v.CHAR_COUNTER == iCounter) {
                                                v.isValid = true;
                                            }
                                        })
                                    }
                                }
                            })
                        }
                        //If there is any isValid as False then don't insert into table 
                        if (aValidList.length > 0 && (aValidList.filter(f => f.isValid == false).length == 0)) {
                            const lsBOMUID = {};
                            lsBOMUID.FACTORY_LOC = GenF.parse(liComponent[cntC].LOCATION_ID);
                            lsBOMUID.REF_PRODID = GenF.parse(liUniqueItem[cntUID].REF_PRODID);
                            lsBOMUID.ITEM_NUM = GenF.parse(liComponent[cntC].ITEM_NUM);
                            lsBOMUID.ASSEMBLY = GenF.parse(liComponent[cntC].COMPONENT);
                            lsBOMUID.ASMB_QTY = GenF.parse(liComponent[cntC].COMP_QTY);
                            lsBOMUID.RULE_TYPE = GenF.parse('PI');
                            lsBOMUID.VALID_FROM = GenF.parse(liComponent[cntC].VALID_FROM);
                            lsBOMUID.VALID_TO = GenF.parse(liComponent[cntC].VALID_TO);
                            lsBOMUID.UNIQUE_ID = GenF.parse(liUniqueItem[cntUID].UNIQUE_ID);
                            lsBOMUID.PRODUCT_ID = GenF.parse(liUniqueItem[cntUID].PRODUCT_ID);
                            lsBOMUID.LOCATION_ID = GenF.parse(liUniqueItem[cntUID].LOCATION_ID);
                            liBOMUID.push(GenF.parse(lsBOMUID));
                        }
                    }

                }

            }

            GenF.log(`BOM UID Component ${liComponent[cntC].COMPONENT}`);

            let Keys = [
                "LOCATION_ID",
                "PRODUCT_ID",
                "UNIQUE_ID",
                "ITEM_NUM",
                "ASSEMBLY",
                "VALID_FROM",
                "VALID_TO",
            ];

            if (liBOMUID.length > 0) {
                liBOMUID = GenF.removeDuplicate(liBOMUID, Keys);

                GenF.log(`BOM UID count for insert: ${liBOMUID.length}`);
                try {
                    await cds.run(INSERT.into("CP_BOM_UID").entries(liBOMUID));
                } catch (e) {
                    GenF.log(`Tech: Error occured while inserting into CP_BOM_UID. Records: ${liBOMUID.length}`);
                    GenF.log(`Error occured when creating BOM UID`);
                    GenF.log(e.message);
                    liBOMUID.forEach((el) => {
                        GenF.log(
                            `BOM UID Record: ${el.LOCATION_ID}, ${el.PRODUCT_ID}, ${el.UNIQUE_ID}, ${el.ITEM_NUM}, ${el.ASSEMBLY}, ${el.VALID_FROM}, ${el.VALID_TO}`
                        );
                    });
                }
                liBOMUID = [];
            }
        }

        await this.genRTRUID(lLocation, lProduct, req);
        return oResponse;
    }
    async genRTRUID(lLocation, lProduct, req) {
        GenF.log(`Tech: Function assembly-req/genRTRUID`);
        var vCurrentDate = GenF.getCurrentDate();

        GenF.log(`Tech: Get from V_UNIQUE_ID and V_SALES_H using ${lLocation} ${lProduct}`);
        // Fetch unique id that doesnot exist in BOM UID table
        let liUniqueData = await cds.run(`SELECT DISTINCT 
                                                        V_SALES_H.LOCATION_ID,
                                                        V_SALES_H.PRODUCT_ID,
                                                        V_UNIQUE_ID.PRODUCT_ID AS REF_PRODID,
                                                        V_UNIQUE_ID.UNIQUE_ID,
                                                        V_UNIQUE_ID.CHAR_NUM,
                                                        V_UNIQUE_ID.CHARVAL_NUM
                                                    FROM 
                                                    V_UNIQUE_ID
                                                        INNER JOIN
                                                        V_SALES_H
                                                        ON V_UNIQUE_ID.PRODUCT_ID = V_SALES_H.REF_PRODID
                                                            AND V_UNIQUE_ID.UNIQUE_ID = V_SALES_H.UNIQUE_ID
                                                    WHERE V_SALES_H.FACTORY_LOC = '${lLocation}'
                                                    AND V_UNIQUE_ID.PRODUCT_ID = '${lProduct}'
                                                    AND V_UNIQUE_ID.UID_TYPE = 'U'
                                                ORDER BY V_SALES_H.LOCATION_ID,
                                                        V_SALES_H.PRODUCT_ID,                                                        
                                                        V_UNIQUE_ID.PRODUCT_ID,
                                                        V_UNIQUE_ID.UNIQUE_ID`);
        let lspUID = {}, lsChar = {}, liChar = [], liUnique = [];
        // Build Partial prod UID 
        for (let iUID = 0; iUID < liUniqueData.length; iUID++) {

            lsChar = {};
            lsChar.CHAR_NUM = liUniqueData[iUID].CHAR_NUM;
            lsChar.CHARVAL_NUM = liUniqueData[iUID].CHARVAL_NUM;
            liChar.push(lsChar);

            if (iUID === GenF.addOne(iUID, liUniqueData.length) ||
                liUniqueData[iUID].LOCATION_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].LOCATION_ID ||
                liUniqueData[iUID].PRODUCT_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].PRODUCT_ID ||
                liUniqueData[iUID].UNIQUE_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].UNIQUE_ID) {
                lspUID = {};
                lspUID.LOCATION_ID = GenF.parse(liUniqueData[iUID].LOCATION_ID);
                lspUID.PRODUCT_ID = GenF.parse(liUniqueData[iUID].PRODUCT_ID);
                lspUID.UNIQUE_ID = GenF.parse(liUniqueData[iUID].UNIQUE_ID);
                lspUID.REF_PRODID = GenF.parse(liUniqueData[iUID].REF_PRODID);
                lspUID.CHAR = GenF.parse(liChar);
                liUnique.push(GenF.parse(lspUID));

                liChar = [];
            }

        }

        GenF.log(`Tech: Get from V_LOCPRODRT_DETAILS and CP_FACTORY_SALESLOC using ${lLocation} ${lProduct} ${vCurrentDate}`);
        let liRTUID = [];
        const liRTChar = await cds.run(
            `SELECT DISTINCT    A.LOCATION_ID,
                                A.PRODUCT_ID,
                                A.RESTRICTION,
                                A.RTR_QTY,   
                                A.RTR_COUNTER,
                                A.CHAR_NUM,
                                A.CHARVAL_NUM,
                                A.OD_CONDITION,
                                A.CHAR_COUNTER,
                                A.VALID_FROM,
                                A.VALID_TO
                FROM "V_LOCPRODRT_DETAILS" AS A
                INNER JOIN "CP_FACTORY_SALESLOC" AS B
                ON A."LOCATION_ID" = B."FACTORY_LOC"
                WHERE B."LOCATION_ID" = '${lLocation}'
                    AND A."PRODUCT_ID"  = '${lProduct}'
                    AND A."VALID_TO" >= '${vCurrentDate}'
                    ORDER BY A.RESTRICTION,
                             A.RTR_COUNTER,
                             A.CHAR_COUNTER`
        );
        try {
            GenF.log(`Deleteing existing records for Restriction BOM relation for ${lLocation} ${lProduct}`);
            await cds.run(`DELETE FROM CP_BOM_UID WHERE FACTORY_LOC = '${lLocation}' AND REF_PRODID = '${lProduct}' AND RULE_TYPE = 'RT'`);
        }
        catch (e) {
            GenF.log(`Error occured while deleteing existing records from Restriction BOM`);
            console.log(e);
        }
        let lsRTCount = {};
        let liRT = [];
        let lsRT = {};

        for (let cntRT = 0; cntRT < liRTChar.length; cntRT++) {

            if (cntRT === 0 ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.subOne(cntRT)].RESTRICTION) {
                lsRT.LOCATION_ID = GenF.parse(liRTChar[cntRT].LOCATION_ID);
                lsRT.PRODUCT_ID = GenF.parse(liRTChar[cntRT].PRODUCT_ID);
                lsRT.RESTRICTION = GenF.parse(liRTChar[cntRT].RESTRICTION);
                lsRT.RTR_QTY = GenF.parse(GenF.parse(liRTChar[cntRT].RTR_QTY));
                lsRT.VALID_FROM = GenF.parse(GenF.parse(liRTChar[cntRT].VALID_FROM));
                lsRT.VALID_TO = GenF.parse(GenF.parse(liRTChar[cntRT].VALID_TO));
                lsRT.COUNTER = [];
            }


            if (cntRT === 0 ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.subOne(cntRT)].RESTRICTION ||
                liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.subOne(cntRT)].RTR_COUNTER) {
                lsRTCount = {};
                lsRTCount.RTR_COUNTER = GenF.parse(liRTChar[cntRT].RTR_COUNTER);
                lsRTCount.CHAR = [];
            }
            let lsChar = {};
            // let lsRTCount = {};
            // lsRTCount.CHAR = [];
            lsChar.CHAR_NUM = GenF.parse(liRTChar[cntRT].CHAR_NUM);
            lsChar.CHARVAL_NUM = GenF.parse(liRTChar[cntRT].CHARVAL_NUM);
            lsChar.OD_CONDITION = GenF.parse(liRTChar[cntRT].OD_CONDITION);
            lsChar.CHAR_COUNTER = GenF.parse(liRTChar[cntRT].CHAR_COUNTER);
            lsRTCount.CHAR.push(lsChar);
            lsRT.COUNTER = [];
            if (cntRT === GenF.addOne(cntRT, liRTChar.length) ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.addOne(cntRT)].RESTRICTION ||
                liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.addOne(cntRT)].RTR_COUNTER) {

                lsRT.COUNTER.push(lsRTCount);
            }

            if (cntRT === GenF.addOne(cntRT, liRTChar.length) ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.addOne(cntRT)].RESTRICTION) {

                liRT.push(lsRT);
                lsRT = {};
            }

        }

        for (let cntRT = 0; cntRT < liRT.length; cntRT++) {
            const lsRT = liRT[cntRT];

            for (let cntUID = 0; cntUID < liUnique.length; cntUID++) {
                for (let cntRTC = 0; cntRTC < lsRT.COUNTER.length; cntRTC++) {
                    let aCharacteristics = lsRT.COUNTER[cntRTC].CHAR.sort((a, b) => a.CHAR_COUNTER - b.CHAR_COUNTER);
                    var aValidList = [];
                    function compareData(a, b) {
                        a.isValid = false;
                        if (a.OD_CONDITION == 'EQ') {
                            if (a.CHAR_NUM === b.CHAR_NUM && a.CHARVAL_NUM === b.CHARVAL_NUM) {
                                a.isValid = true;
                            }
                            if (aValidList.filter(f => f.CHARVAL_NUM == a.CHARVAL_NUM && f.CHAR_COUNTER == a.CHAR_COUNTER && f.CHAR_NUM == a.CHAR_NUM).length == 0) {
                                aValidList.push(a);
                            }
                            return a.CHARVAL_NUM === b.CHARVAL_NUM;
                        }
                        else {
                            if (a.CHAR_NUM === b.CHAR_NUM && a.CHARVAL_NUM !== b.CHARVAL_NUM) {
                                a.isValid = true;
                            }
                            if (aValidList.filter(f => f.CHARVAL_NUM == a.CHARVAL_NUM && f.CHAR_COUNTER == a.CHAR_COUNTER && f.CHAR_NUM == a.CHAR_NUM).length == 0) {
                                aValidList.push(a);
                            }
                            return a.CHARVAL_NUM !== b.CHARVAL_NUM;
                        }
                    }
                    const onlyInLeft = (left, right, compareFunction) =>
                        left.filter(leftValue =>
                            !right.some(rightValue =>
                                compareFunction(leftValue, rightValue)));

                    onlyInLeft(aCharacteristics, liUnique[cntUID].CHAR, compareData);

                    if (aValidList.length > 0) {
                        var iCounter = 0;
                        let aTempList = [...aValidList]
                        aTempList.forEach(el => {
                            if (iCounter != el.CHAR_COUNTER) {
                                iCounter = el.CHAR_COUNTER;
                                let aFiltered = aValidList.filter(f => f.isValid == true && f.CHAR_COUNTER == iCounter);
                                if (aFiltered.length > 0) {//setting true for this charcounter
                                    aValidList.forEach(v => {
                                        if (v.CHAR_COUNTER == iCounter) {
                                            v.isValid = true;
                                        }
                                    })
                                }
                            }
                        })
                    }
                    //If there is any isValid as False then don't insert into table 
                    // if (aValidList.filter(f => f.isValid == false).length == 0) {
                    if (aValidList.length > 0 && (aValidList.filter(f => f.isValid == false).length == 0)) {
                        const lsRTUID = {};
                        lsRTUID.LOCATION_ID = GenF.parse(liUnique[cntUID].LOCATION_ID);
                        lsRTUID.PRODUCT_ID = GenF.parse(liUnique[cntUID].PRODUCT_ID);
                        lsRTUID.ITEM_NUM = GenF.parse('10');
                        lsRTUID.ASSEMBLY = GenF.parse(liRT[cntRT].RESTRICTION);
                        lsRTUID.RULE_TYPE = GenF.parse('RT');
                        lsRTUID.UNIQUE_ID = GenF.parse(liUnique[cntUID].UNIQUE_ID);
                        lsRTUID.ASMB_QTY = GenF.parse(liRT[cntRT].RTR_QTY);
                        lsRTUID.VALID_FROM = GenF.parse(liRT[cntRT].VALID_FROM);
                        lsRTUID.VALID_TO = GenF.parse(liRT[cntRT].VALID_TO);
                        lsRTUID.FACTORY_LOC = GenF.parse(liRT[cntRT].LOCATION_ID);
                        lsRTUID.REF_PRODID = GenF.parse(liUnique[cntUID].REF_PRODID);
                        liRTUID.push(GenF.parse(lsRTUID));
                    }
                }
            }
        }

        let Keys = ['LOCATION_ID', 'PRODUCT_ID', 'UNIQUE_ID', 'ITEM_NUM', 'ASSEMBLY', 'VALID_FROM', 'VALID_TO'];
        liRTUID = GenF.removeDuplicate(liRTUID, Keys);
        GenF.log(`BOM Restriction relation records to be created: ${liRTUID.length}`);
        if (liRTUID.length > 0) {
            try {
                await cds.run(INSERT.into("CP_BOM_UID").entries(liRTUID));
                GenF.log("RT-UID mapping Created successfully ");
            } catch (e) {
                GenF.log(e.message);
                throw new Error(e.toString());
            }
            liRTUID = [];
        }
        else {
            GenF.log("No Records to insert for BOM Restriction");
        }
    }

    async genRTRUIDMapping(lLocation, lProduct) {
        GenF.log(`Tech: Function assembly-req/genRTRUIDMapping`);
        var vCurrentDate = GenF.getCurrentDate();

        GenF.log(`Tech: Get from V_UNIQUE_ID and V_SALES_H using ${lLocation} ${lProduct}`);
        // Fetch unique id that doesnot exist in BOM UID table
        let liUniqueData = await cds.run(`SELECT DISTINCT 
                                                        V_SALES_H.LOCATION_ID,
                                                        V_SALES_H.PRODUCT_ID,
                                                        V_UNIQUE_ID.PRODUCT_ID AS REF_PRODID,
                                                        V_UNIQUE_ID.UNIQUE_ID,
                                                        V_UNIQUE_ID.CHAR_NUM,
                                                        V_UNIQUE_ID.CHARVAL_NUM
                                                    FROM 
                                                    V_UNIQUE_ID
                                                        INNER JOIN
                                                        V_SALES_H
                                                        ON V_UNIQUE_ID.PRODUCT_ID = V_SALES_H.REF_PRODID
                                                            AND V_UNIQUE_ID.UNIQUE_ID = V_SALES_H.UNIQUE_ID
                                                    WHERE V_SALES_H.FACTORY_LOC = '${lLocation}'
                                                    AND V_UNIQUE_ID.PRODUCT_ID = '${lProduct}'
                                                    AND V_UNIQUE_ID.UID_TYPE = 'U'
                                                ORDER BY V_SALES_H.LOCATION_ID,
                                                        V_SALES_H.PRODUCT_ID,                                                        
                                                        V_UNIQUE_ID.PRODUCT_ID,
                                                        V_UNIQUE_ID.UNIQUE_ID`);
        let lspUID = {}, lsChar = {}, liChar = [], liUnique = [];
        // Build Partial prod UID 
        for (let iUID = 0; iUID < liUniqueData.length; iUID++) {

            lsChar = {};
            lsChar.CHAR_NUM = liUniqueData[iUID].CHAR_NUM;
            lsChar.CHARVAL_NUM = liUniqueData[iUID].CHARVAL_NUM;
            liChar.push(lsChar);

            if (iUID === GenF.addOne(iUID, liUniqueData.length) ||
                liUniqueData[iUID].LOCATION_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].LOCATION_ID ||
                liUniqueData[iUID].PRODUCT_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].PRODUCT_ID ||
                liUniqueData[iUID].UNIQUE_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].UNIQUE_ID) {
                lspUID = {};
                lspUID.LOCATION_ID = GenF.parse(liUniqueData[iUID].LOCATION_ID);
                lspUID.PRODUCT_ID = GenF.parse(liUniqueData[iUID].PRODUCT_ID);
                lspUID.UNIQUE_ID = GenF.parse(liUniqueData[iUID].UNIQUE_ID);
                lspUID.REF_PRODID = GenF.parse(liUniqueData[iUID].REF_PRODID);
                lspUID.CHAR = GenF.parse(liChar);
                liUnique.push(GenF.parse(lspUID));

                liChar = [];
            }

        }

        GenF.log(`Tech: Get from V_LOCPRODRT_DETAILS and CP_FACTORY_SALESLOC using ${lLocation} ${lProduct} ${vCurrentDate}`);
        let liRTUID = [];
        const liRTChar = await cds.run(
            `SELECT DISTINCT    A.LOCATION_ID,
                                A.PRODUCT_ID,
                                A.RESTRICTION,
                                A.RTR_QTY,   
                                A.RTR_COUNTER,
                                A.CHAR_NUM,
                                A.CHARVAL_NUM,
                                A.OD_CONDITION,
                                A.CHAR_COUNTER,
                                A.VALID_FROM,
                                A.VALID_TO
                FROM "V_LOCPRODRT_DETAILS" AS A
                INNER JOIN "CP_FACTORY_SALESLOC" AS B
                ON A."LOCATION_ID" = B."FACTORY_LOC"
                WHERE B."FACTORY_LOC" = '${lLocation}'
                    AND A."PRODUCT_ID"  = '${lProduct}'
                    AND A."VALID_TO" >= '${vCurrentDate}'
                    ORDER BY A.RESTRICTION,
                             A.RTR_COUNTER,
                             A.CHAR_COUNTER`
        );
        try {
            GenF.log(`Tech: Delete from CP_BOM_UID using ${lLocation} ${lProduct} ${vCurrentDate} Restriction`);
            await cds.run(`DELETE FROM CP_BOM_UID WHERE FACTORY_LOC = '${lLocation}' AND REF_PRODID = '${lProduct}' AND RULE_TYPE = 'RT'`);
        }
        catch (e) {
            GenF.log('Error occured while deleting BOM UID for restriction');
            console.log(e);
        }
        let lsRTCount = {};
        let liRT = [];
        let lsRT = {};

        for (let cntRT = 0; cntRT < liRTChar.length; cntRT++) {

            if (cntRT === 0 ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.subOne(cntRT)].RESTRICTION ||
                liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.subOne(cntRT)].RTR_COUNTER) {
            //      || 
            // liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.subOne(cntRT)].RTR_COUNTER) {
                // added the last RTR counter condition for testing
                lsRT.LOCATION_ID = GenF.parse(liRTChar[cntRT].LOCATION_ID);
                lsRT.PRODUCT_ID = GenF.parse(liRTChar[cntRT].PRODUCT_ID);
                lsRT.RESTRICTION = GenF.parse(liRTChar[cntRT].RESTRICTION);
                lsRT.RTR_QTY = GenF.parse(GenF.parse(liRTChar[cntRT].RTR_QTY));
                lsRT.VALID_FROM = GenF.parse(GenF.parse(liRTChar[cntRT].VALID_FROM));
                lsRT.VALID_TO = GenF.parse(GenF.parse(liRTChar[cntRT].VALID_TO));
                lsRT.COUNTER = [];
            }


            if (cntRT === 0 ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.subOne(cntRT)].RESTRICTION ||
                liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.subOne(cntRT)].RTR_COUNTER) {
                lsRTCount = {};
                lsRTCount.RTR_COUNTER = GenF.parse(liRTChar[cntRT].RTR_COUNTER);
                lsRTCount.CHAR = [];
            }
            let lsChar = {};
            // let lsRTCount = {};
            // lsRTCount.CHAR = [];
            lsChar.CHAR_NUM = GenF.parse(liRTChar[cntRT].CHAR_NUM);
            lsChar.CHARVAL_NUM = GenF.parse(liRTChar[cntRT].CHARVAL_NUM);
            lsChar.OD_CONDITION = GenF.parse(liRTChar[cntRT].OD_CONDITION);
            lsChar.CHAR_COUNTER = GenF.parse(liRTChar[cntRT].CHAR_COUNTER);
            lsChar.QTY = GenF.parse(liRTChar[cntRT].RTR_QTY);


            lsRTCount.CHAR.push(lsChar);
            lsRT.COUNTER = [];
            if (cntRT === GenF.addOne(cntRT, liRTChar.length) ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.addOne(cntRT)].RESTRICTION ||
                liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.addOne(cntRT)].RTR_COUNTER) {

                lsRT.COUNTER.push(lsRTCount);
            }

            if (cntRT === GenF.addOne(cntRT, liRTChar.length) ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.addOne(cntRT)].RESTRICTION ||
                liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.subOnenew(cntRT)].RTR_COUNTER) {

                liRT.push(lsRT);
                lsRT = {};
            }

        }

        for (let cntRT = 0; cntRT < liRT.length; cntRT++) {
            const lsRT = liRT[cntRT];

            for (let cntUID = 0; cntUID < liUnique.length; cntUID++) {
                for (let cntRTC = 0; cntRTC < lsRT.COUNTER.length; cntRTC++) {
                    let aCharacteristics = lsRT.COUNTER[cntRTC].CHAR.sort((a, b) => a.CHAR_COUNTER - b.CHAR_COUNTER);
                    var aValidList = [];
                    function compareData(a, b) {
                        a.isValid = false;
                           if(a.CHARVAL_NUM.toString().trim() == '' ||a.CHARVAL_NUM.toString().trim()== 'ZZZZ'){
                                a.CHARVAL_NUM= '';
                            }
                             if(b.CHARVAL_NUM.toString().trim() == '' ||b.CHARVAL_NUM.toString().trim()== 'ZZZZ'){
                                b.CHARVAL_NUM= '';
                            }
                        if (a.OD_CONDITION == 'EQ') {
                            if (a.CHAR_NUM === b.CHAR_NUM && a.CHARVAL_NUM === b.CHARVAL_NUM) {
                                a.isValid = true;
                                liUnique[cntUID].NEW_QTY = a.QTY;
                            }
                            if (aValidList.filter(f => f.CHARVAL_NUM == a.CHARVAL_NUM && f.CHAR_COUNTER == a.CHAR_COUNTER && f.CHAR_NUM == a.CHAR_NUM).length == 0) {
                                aValidList.push(a);
                            }
                            return (a.CHAR_NUM === b.CHAR_NUM && a.CHARVAL_NUM === b.CHARVAL_NUM);
                        }
                        else {
                            if (a.CHAR_NUM === b.CHAR_NUM && a.CHARVAL_NUM !== b.CHARVAL_NUM) {
                                a.isValid = true;
                                liUnique[cntUID].NEW_QTY = a.QTY;
                            }
                            if (aValidList.filter(f => f.CHARVAL_NUM == a.CHARVAL_NUM && f.CHAR_COUNTER == a.CHAR_COUNTER && f.CHAR_NUM == a.CHAR_NUM).length == 0) {
                                aValidList.push(a);
                            }
                            return (a.CHAR_NUM !== b.CHAR_NUM && a.CHARVAL_NUM !== b.CHARVAL_NUM);
                        }
                    }
                    // const onlyInLeft = (left, right, compareFunction) =>
                    //     left.filter(leftValue =>
                    //         !right.some(rightValue =>
                    //             compareFunction(leftValue, rightValue)));

                    const onlyInLeft = (left, right, compareFunction) =>
                        left.filter(leftValue => {
                            if (right.filter(f => f.CHAR_NUM == leftValue.CHAR_NUM).length == 0) {
                                right.push({
                                    "CHAR_NUM": leftValue.CHAR_NUM,  
                                    "CHARVAL_NUM": ''
                                });
                            }
                            return !right.some(rightValue =>
                                compareFunction(leftValue, rightValue));
                        });

                    onlyInLeft(aCharacteristics, liUnique[cntUID].CHAR, compareData);

                    if (aValidList.length > 0) {
                        var iCounter = 0;
                        let aTempList = [...aValidList]
                        aTempList.forEach(el => {
                            if (iCounter != el.CHAR_COUNTER) {
                                iCounter = el.CHAR_COUNTER;
                                let aFiltered = aValidList.filter(f => f.isValid == true && f.CHAR_COUNTER == iCounter);
                                if (aFiltered.length > 0) {//setting true for this charcounter
                                    aValidList.forEach(v => {
                                        if (v.CHAR_COUNTER == iCounter) {
                                            v.isValid = true;
                                        }
                                    })
                                }
                            }
                        })
                    }
                    //If there is any isValid as False then don't insert into table 
                    // if (aValidList.filter(f => f.isValid == false).length == 0) {
                    if (aValidList.length > 0 && (aValidList.filter(f => f.isValid == false).length == 0)) {
                        const lsRTUID = {};
                        lsRTUID.LOCATION_ID = GenF.parse(liUnique[cntUID].LOCATION_ID);
                        lsRTUID.PRODUCT_ID = GenF.parse(liUnique[cntUID].PRODUCT_ID);
                        lsRTUID.ITEM_NUM = GenF.parse('10');
                        lsRTUID.ASSEMBLY = GenF.parse(liRT[cntRT].RESTRICTION);
                        lsRTUID.RULE_TYPE = GenF.parse('RT');
                        lsRTUID.UNIQUE_ID = GenF.parse(liUnique[cntUID].UNIQUE_ID);
                        // lsRTUID.ASMB_QTY = GenF.parse(liRT[cntRT].RTR_QTY);
                        lsRTUID.ASMB_QTY = GenF.parse(liUnique[cntUID].NEW_QTY);
                        lsRTUID.VALID_FROM = GenF.parse(liRT[cntRT].VALID_FROM);
                        lsRTUID.VALID_TO = GenF.parse(liRT[cntRT].VALID_TO);
                        lsRTUID.FACTORY_LOC = GenF.parse(liRT[cntRT].LOCATION_ID);
                        lsRTUID.REF_PRODID = GenF.parse(liUnique[cntUID].REF_PRODID);
                        // Added new
                        // lsRTUID.RTR_COUNTER = GenF.parse(liRT[cntRT].COUNTER[0].RTR_COUNTER);
                        // lsRTUID.UNIT = GenF.parse(liRT[cntRT].RTR_QTY);
                        liRTUID.push(GenF.parse(lsRTUID));
                    }
                }
            }
        }

        // function getMaxAssemblyData(data) {
        //     const map = new Map();

        //     data.forEach(item => {
        //         const key = `${item.ASSEMBLY}_${item.UNIQUE_ID}`;

        //         if (!map.has(key)) {
        //         map.set(key, item); // first time → store
        //         } else {
        //         // keep the item with max ASMB_QTY
        //         if (item.ASMB_QTY > map.get(key).ASMB_QTY) {
        //             map.set(key, item);
        //         }
        //         }
        //     });

        //     // Return simplified structure
        //     return Array.from(map.values()).map(item => ({
        //         ASSEMBLY: item.ASSEMBLY,
        //         UNIQUE_ID: item.UNIQUE_ID,
        //         ASMB_QTY: item.ASMB_QTY
        //     }));
        //     }

        //     // Example usage:
        //     let result = getMaxAssemblyData(liRTUID);
        //     console.log(result);


     

            function getMaxByAssemblyAndUniqueId(arr) {
            const map = new Map();

            for (const item of arr) {
                const key = `${item.ASSEMBLY}__${item.UNIQUE_ID}`;

                // If key not exists OR found larger ASMB_QTY → replace
                if (!map.has(key) || item.ASMB_QTY > map.get(key).ASMB_QTY) {
                map.set(key, item);
                }
            }

            // Return full objects
            return Array.from(map.values());
            }

            let result = getMaxByAssemblyAndUniqueId(liRTUID);

            console.log(result);





        let Keys = ['LOCATION_ID', 'PRODUCT_ID', 'UNIQUE_ID', 'ITEM_NUM', 'ASSEMBLY', 'VALID_FROM', 'VALID_TO'];
        // liRTUID = GenF.removeDuplicate(liRTUID, Keys);
        liRTUID = GenF.removeDuplicate(result, Keys);
        GenF.log(`Restriction BOM Relation records to be created: ${liRTUID.length}`);
        if (liRTUID.length > 0) {
            try {
                await cds.run(INSERT.into("CP_BOM_UID").entries(liRTUID));
                GenF.log("RT- BOM mapping Created successfully ");
            } catch (e) {
                GenF.log(e.message);
                throw new Error(e.toString());
            }
            liRTUID = [];
        }
        else {
            GenF.log("Insufficient data for generating BOM-Restriction mapping ");
        }
    }


    async genRTRUIDMapping_old(lLocation, lProduct) {
        GenF.log(`Tech: Function assembly-req/genRTRUIDMapping`);
        var vCurrentDate = GenF.getCurrentDate();

        GenF.log(`Tech: Get from V_UNIQUE_ID and V_SALES_H using ${lLocation} ${lProduct}`);
        // Fetch unique id that doesnot exist in BOM UID table
        let liUniqueData = await cds.run(`SELECT DISTINCT 
                                                        V_SALES_H.LOCATION_ID,
                                                        V_SALES_H.PRODUCT_ID,
                                                        V_UNIQUE_ID.PRODUCT_ID AS REF_PRODID,
                                                        V_UNIQUE_ID.UNIQUE_ID,
                                                        V_UNIQUE_ID.CHAR_NUM,
                                                        V_UNIQUE_ID.CHARVAL_NUM
                                                    FROM 
                                                    V_UNIQUE_ID
                                                        INNER JOIN
                                                        V_SALES_H
                                                        ON V_UNIQUE_ID.PRODUCT_ID = V_SALES_H.REF_PRODID
                                                            AND V_UNIQUE_ID.UNIQUE_ID = V_SALES_H.UNIQUE_ID
                                                    WHERE V_SALES_H.FACTORY_LOC = '${lLocation}'
                                                    AND V_UNIQUE_ID.PRODUCT_ID = '${lProduct}'
                                                    AND V_UNIQUE_ID.UID_TYPE = 'U'
                                                ORDER BY V_SALES_H.LOCATION_ID,
                                                        V_SALES_H.PRODUCT_ID,                                                        
                                                        V_UNIQUE_ID.PRODUCT_ID,
                                                        V_UNIQUE_ID.UNIQUE_ID`);
        let lspUID = {}, lsChar = {}, liChar = [], liUnique = [];
        // Build Partial prod UID 
        for (let iUID = 0; iUID < liUniqueData.length; iUID++) {

            lsChar = {};
            lsChar.CHAR_NUM = liUniqueData[iUID].CHAR_NUM;
            lsChar.CHARVAL_NUM = liUniqueData[iUID].CHARVAL_NUM;
            liChar.push(lsChar);

            if (iUID === GenF.addOne(iUID, liUniqueData.length) ||
                liUniqueData[iUID].LOCATION_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].LOCATION_ID ||
                liUniqueData[iUID].PRODUCT_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].PRODUCT_ID ||
                liUniqueData[iUID].UNIQUE_ID !== liUniqueData[GenF.addOne(iUID, liUniqueData.length)].UNIQUE_ID) {
                lspUID = {};
                lspUID.LOCATION_ID = GenF.parse(liUniqueData[iUID].LOCATION_ID);
                lspUID.PRODUCT_ID = GenF.parse(liUniqueData[iUID].PRODUCT_ID);
                lspUID.UNIQUE_ID = GenF.parse(liUniqueData[iUID].UNIQUE_ID);
                lspUID.REF_PRODID = GenF.parse(liUniqueData[iUID].REF_PRODID);
                lspUID.CHAR = GenF.parse(liChar);
                liUnique.push(GenF.parse(lspUID));

                liChar = [];
            }

        }

        GenF.log(`Tech: Get from V_LOCPRODRT_DETAILS and CP_FACTORY_SALESLOC using ${lLocation} ${lProduct} ${vCurrentDate}`);
        let liRTUID = [];
        const liRTChar = await cds.run(
            `SELECT DISTINCT    A.LOCATION_ID,
                                A.PRODUCT_ID,
                                A.RESTRICTION,
                                A.RTR_QTY,   
                                A.RTR_COUNTER,
                                A.CHAR_NUM,
                                A.CHARVAL_NUM,
                                A.OD_CONDITION,
                                A.CHAR_COUNTER,
                                A.VALID_FROM,
                                A.VALID_TO
                FROM "V_LOCPRODRT_DETAILS" AS A
                INNER JOIN "CP_FACTORY_SALESLOC" AS B
                ON A."LOCATION_ID" = B."FACTORY_LOC"
                WHERE B."FACTORY_LOC" = '${lLocation}'
                    AND A."PRODUCT_ID"  = '${lProduct}'
                    AND A."VALID_TO" >= '${vCurrentDate}'
                    ORDER BY A.RESTRICTION,
                             A.RTR_COUNTER,
                             A.CHAR_COUNTER`
        );
        try {
            GenF.log(`Tech: Delete from CP_BOM_UID using ${lLocation} ${lProduct} ${vCurrentDate} Restriction`);
            await cds.run(`DELETE FROM CP_BOM_UID WHERE FACTORY_LOC = '${lLocation}' AND REF_PRODID = '${lProduct}' AND RULE_TYPE = 'RT'`);
        }
        catch (e) {
            GenF.log('Error occured while deleting BOM UID for restriction');
            console.log(e);
        }
        let lsRTCount = {};
        let liRT = [];
        let lsRT = {};

        for (let cntRT = 0; cntRT < liRTChar.length; cntRT++) {

            if (cntRT === 0 ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.subOne(cntRT)].RESTRICTION ||
                liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.subOne(cntRT)].RTR_COUNTER) {
                lsRT.LOCATION_ID = GenF.parse(liRTChar[cntRT].LOCATION_ID);
                lsRT.PRODUCT_ID = GenF.parse(liRTChar[cntRT].PRODUCT_ID);
                lsRT.RESTRICTION = GenF.parse(liRTChar[cntRT].RESTRICTION);
                lsRT.RTR_QTY = GenF.parse(GenF.parse(liRTChar[cntRT].RTR_QTY));
                lsRT.VALID_FROM = GenF.parse(GenF.parse(liRTChar[cntRT].VALID_FROM));
                lsRT.VALID_TO = GenF.parse(GenF.parse(liRTChar[cntRT].VALID_TO));
                lsRT.COUNTER = [];
            }


            if (cntRT === 0 ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.subOne(cntRT)].RESTRICTION ||
                liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.subOne(cntRT)].RTR_COUNTER) {
                lsRTCount = {};
                lsRTCount.RTR_COUNTER = GenF.parse(liRTChar[cntRT].RTR_COUNTER);
                lsRTCount.CHAR = [];
            }
            let lsChar = {};
            // let lsRTCount = {};
            // lsRTCount.CHAR = [];
            lsChar.CHAR_NUM = GenF.parse(liRTChar[cntRT].CHAR_NUM);
            lsChar.CHARVAL_NUM = GenF.parse(liRTChar[cntRT].CHARVAL_NUM);
            lsChar.OD_CONDITION = GenF.parse(liRTChar[cntRT].OD_CONDITION);
            lsChar.CHAR_COUNTER = GenF.parse(liRTChar[cntRT].CHAR_COUNTER);
            lsChar.QTY = GenF.parse(liRTChar[cntRT].RTR_QTY);


            lsRTCount.CHAR.push(lsChar);
            lsRT.COUNTER = [];
            if (cntRT === GenF.addOne(cntRT, liRTChar.length) ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.addOne(cntRT)].RESTRICTION ||
                liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.addOne(cntRT)].RTR_COUNTER) {

                lsRT.COUNTER.push(lsRTCount);
            }

            if (cntRT === GenF.addOne(cntRT, liRTChar.length) ||
                liRTChar[cntRT].RESTRICTION !== liRTChar[GenF.addOne(cntRT)].RESTRICTION ||
                liRTChar[cntRT].RTR_COUNTER !== liRTChar[GenF.subOnenew(cntRT)].RTR_COUNTER) {

                liRT.push(lsRT);
                lsRT = {};
            }

        }

        for (let cntRT = 0; cntRT < liRT.length; cntRT++) {
            const lsRT = liRT[cntRT];

            for (let cntUID = 0; cntUID < liUnique.length; cntUID++) {
                for (let cntRTC = 0; cntRTC < lsRT.COUNTER.length; cntRTC++) {
                    let aCharacteristics = lsRT.COUNTER[cntRTC].CHAR.sort((a, b) => a.CHAR_COUNTER - b.CHAR_COUNTER);
                    var aValidList = [];
                    function compareData(a, b) {
                        a.isValid = false;
                        if (a.OD_CONDITION == 'EQ') {
                            if (a.CHAR_NUM === b.CHAR_NUM && a.CHARVAL_NUM === b.CHARVAL_NUM) {
                                a.isValid = true;
                                liUnique[cntUID].NEW_QTY = a.QTY;
                            }
                            if (aValidList.filter(f => f.CHARVAL_NUM == a.CHARVAL_NUM && f.CHAR_COUNTER == a.CHAR_COUNTER && f.CHAR_NUM == a.CHAR_NUM).length == 0) {
                                aValidList.push(a);
                            }
                            return (a.CHAR_NUM === b.CHAR_NUM && a.CHARVAL_NUM === b.CHARVAL_NUM);
                        }
                        else {
                            if (a.CHAR_NUM === b.CHAR_NUM && a.CHARVAL_NUM !== b.CHARVAL_NUM) {
                                a.isValid = true;
                                liUnique[cntUID].NEW_QTY = a.QTY;
                            }
                            if (aValidList.filter(f => f.CHARVAL_NUM == a.CHARVAL_NUM && f.CHAR_COUNTER == a.CHAR_COUNTER && f.CHAR_NUM == a.CHAR_NUM).length == 0) {
                                aValidList.push(a);
                            }
                            return (a.CHAR_NUM !== b.CHAR_NUM && a.CHARVAL_NUM !== b.CHARVAL_NUM);
                        }
                    }
                    const onlyInLeft = (left, right, compareFunction) =>
                        left.filter(leftValue =>
                            !right.some(rightValue =>
                                compareFunction(leftValue, rightValue)));

                    onlyInLeft(aCharacteristics, liUnique[cntUID].CHAR, compareData);

                    if (aValidList.length > 0) {
                        var iCounter = 0;
                        let aTempList = [...aValidList]
                        aTempList.forEach(el => {
                            if (iCounter != el.CHAR_COUNTER) {
                                iCounter = el.CHAR_COUNTER;
                                let aFiltered = aValidList.filter(f => f.isValid == true && f.CHAR_COUNTER == iCounter);
                                if (aFiltered.length > 0) {//setting true for this charcounter
                                    aValidList.forEach(v => {
                                        if (v.CHAR_COUNTER == iCounter) {
                                            v.isValid = true;
                                        }
                                    })
                                }
                            }
                        })
                    }
                    //If there is any isValid as False then don't insert into table 
                    // if (aValidList.filter(f => f.isValid == false).length == 0) {
                    if (aValidList.length > 0 && (aValidList.filter(f => f.isValid == false).length == 0)) {
                        const lsRTUID = {};
                        lsRTUID.LOCATION_ID = GenF.parse(liUnique[cntUID].LOCATION_ID);
                        lsRTUID.PRODUCT_ID = GenF.parse(liUnique[cntUID].PRODUCT_ID);
                        lsRTUID.ITEM_NUM = GenF.parse('10');
                        lsRTUID.ASSEMBLY = GenF.parse(liRT[cntRT].RESTRICTION);
                        lsRTUID.RULE_TYPE = GenF.parse('RT');
                        lsRTUID.UNIQUE_ID = GenF.parse(liUnique[cntUID].UNIQUE_ID);
                        // lsRTUID.ASMB_QTY = GenF.parse(liRT[cntRT].RTR_QTY);
                        lsRTUID.ASMB_QTY = GenF.parse(liUnique[cntUID].NEW_QTY);
                        lsRTUID.VALID_FROM = GenF.parse(liRT[cntRT].VALID_FROM);
                        lsRTUID.VALID_TO = GenF.parse(liRT[cntRT].VALID_TO);
                        lsRTUID.FACTORY_LOC = GenF.parse(liRT[cntRT].LOCATION_ID);
                        lsRTUID.REF_PRODID = GenF.parse(liUnique[cntUID].REF_PRODID);
                        liRTUID.push(GenF.parse(lsRTUID));
                    }
                }
            }
        }
        let Keys = ['LOCATION_ID', 'PRODUCT_ID', 'UNIQUE_ID', 'ITEM_NUM', 'ASSEMBLY', 'VALID_FROM', 'VALID_TO'];
        liRTUID = GenF.removeDuplicate(liRTUID, Keys);
        GenF.log(`Restriction BOM Relation records to be created: ${liRTUID.length}`);
        if (liRTUID.length > 0) {
            try {
                await cds.run(INSERT.into("CP_BOM_UID").entries(liRTUID));
                GenF.log("RT- BOM mapping Created successfully ");
            } catch (e) {
                GenF.log(e.message);
                throw new Error(e.toString());
            }
            liRTUID = [];
        }
        else {
            GenF.log("Insufficient data for generating BOM-Restriction mapping ");
        }
    }

    async genBOMUIDMappingC(lLocation, lProduct) {
        GenF.log(`Tech: Function assembly-req/genBOMUIDMapping`);
        let aUniqueIdData = [];
        let oResponse = { bError: false, sMessage: '' };
        GenF.log(`Tech: Get from V_UNIQUE_ID and V_SALES_H using ${lLocation} ${lProduct}`);
        // let liUniqueData = await cds.run(`SELECT DISTINCT
        //                                             V_SALES_H.LOCATION_ID,
        //                                             V_SALES_H.PRODUCT_ID,
        //                                             V_UNIQUE_ID.PRODUCT_ID AS REF_PRODID,
        //                                             V_UNIQUE_ID.UNIQUE_ID,
        //                                             V_UNIQUE_ID.CHAR_NUM,
        //                                             V_UNIQUE_ID.CHARVAL_NUM,
        //                                             V_UNIQUE_ID.CHAR_VALUE
        //                                         FROM
        //                                         V_UNIQUE_ID
        //                                             INNER JOIN
        //                                             V_SALES_H
        //                                             ON V_UNIQUE_ID.PRODUCT_ID = V_SALES_H.REF_PRODID
        //                                                 AND V_UNIQUE_ID.UNIQUE_ID = V_SALES_H.UNIQUE_ID
        //                                         WHERE V_SALES_H.FACTORY_LOC = '${lLocation}'
        //                                         AND V_UNIQUE_ID.PRODUCT_ID = '${lProduct}'
        //                                         AND V_UNIQUE_ID.UID_TYPE = 'U'
        //                                     ORDER BY V_SALES_H.LOCATION_ID,
        //                                             V_SALES_H.PRODUCT_ID,                                                        
        //                                             V_UNIQUE_ID.PRODUCT_ID,
        //                                             V_UNIQUE_ID.UNIQUE_ID`);

        let liUniqueData = await cds.run(`SELECT DISTINCT
                                                V_SALES_H.LOCATION_ID,
                                                V_SALES_H.PRODUCT_ID,
                                                V_UNIQUE_ID_ITEM.PRODUCT_ID AS REF_PRODID,
                                                V_UNIQUE_ID_ITEM.UNIQUE_ID,
                                                V_UNIQUE_ID_ITEM.CHAR_NUM,
                                                V_UNIQUE_ID_ITEM.CHARVAL_NUM,
                                                V_UNIQUE_ID_ITEM.CHAR_VALUE,
                                                V_UNIQUE_ID_ITEM.CHAR_NAME
                                            FROM
                                            V_UNIQUE_ID_ITEM
                                                INNER JOIN
                                                V_SALES_H
                                                ON V_UNIQUE_ID_ITEM.PRODUCT_ID = V_SALES_H.REF_PRODID
                                                    AND V_UNIQUE_ID_ITEM.UNIQUE_ID = V_SALES_H.UNIQUE_ID
                                            WHERE V_SALES_H.FACTORY_LOC = '${lLocation}'
                                            AND V_UNIQUE_ID_ITEM.PRODUCT_ID = '${lProduct}'
                                            AND V_UNIQUE_ID_ITEM.UID_TYPE = 'U'
                                        ORDER BY V_SALES_H.LOCATION_ID,
                                                V_SALES_H.PRODUCT_ID,                                                        
                                                V_UNIQUE_ID_ITEM.PRODUCT_ID,
                                                V_UNIQUE_ID_ITEM.UNIQUE_ID`);

        if (liUniqueData.length > 0) {
            // Create nested array with distinct Object Dependencies and its rules
            aUniqueIdData = liUniqueData.reduce((aConfig, curr) => {
                const ITEM = [];
                const {
                    LOCATION_ID,
                    PRODUCT_ID,
                    REF_PRODID,
                    UNIQUE_ID,
                    CHAR_NUM,
                    CHARVAL_NUM,
                    CHAR_VALUE,
                    CHAR_NAME
                } = curr;
                const findObj = aConfig.find((o) => o.UNIQUE_ID === UNIQUE_ID &&
                    o.LOCATION_ID === LOCATION_ID &&
                    o.PRODUCT_ID === PRODUCT_ID);
                if (!findObj) {
                    ITEM.push({
                        CHAR_NUM,
                        CHARVAL_NUM,
                        CHAR_VALUE,
                        CHAR_NAME
                    });
                    aConfig.push({ UNIQUE_ID, LOCATION_ID, PRODUCT_ID, REF_PRODID, ITEM });
                } else {
                    findObj.ITEM.push({
                        CHAR_NUM,
                        CHARVAL_NUM,
                        CHAR_VALUE,
                        CHAR_NAME
                    });
                }
                return aConfig;
            }, []);
        }

        let aBOMUID_F = [];
        let bFlag = '';
        let oValidity = { VALID_FROM: '2000-01-01', VALID_TO: '9999-12-31' };

        if (aUniqueIdData.length > 0) {
            for (let i = 0; i < aUniqueIdData.length; i++) {

                aBOMUID_F = await this.getAssemblyComp(lLocation, lProduct, 1, aUniqueIdData[i], aBOMUID_F, oValidity);

                console.log(aUniqueIdData[i]);
                if (aBOMUID_F.length > 0) {
                    try {

                        GenF.log(`Deleting from BOM UID for Unique ID: ${aUniqueIdData[i].UNIQUE_ID}`);
                        await cds.run(
                            `DELETE FROM CP_BOM_UID WHERE UNIQUE_ID = '${aUniqueIdData[i].UNIQUE_ID}' 
                                                      AND RULE_TYPE = 'PI'`
                        );
                        GenF.log(`Tech: Create a records into CP_BOM_UID. Records count: ${aBOMUID_F.length}`);
                        await cds.run({
                            INSERT:
                            {
                                into: { ref: ['CP_BOM_UID'] },
                                entries: aBOMUID_F
                            }
                        });
                        bFlag = 'X';
                    } catch (e) {
                        console.log(e);
                    }
                    aBOMUID_F = [];
                }

            }
            if (bFlag === 'X') {
                oResponse.sMessage = 'BOM-UID mapping generated successfully for Product: ' + lProduct;
            } else {
                oResponse.bError = true;
                oResponse.sMessage = 'BOM-UID mapping generation failed for Product:' + lProduct;
            }
            GenF.log(oResponse.sMessage);
        } else {
            oResponse.sMessage = 'Insufficient data for generating BOM-UID mapping for Product: ' + lProduct;
        }
        GenF.log(oResponse.sMessage);

        await this.genRTRUIDMapping(lLocation, lProduct);
        return oResponse;
    }
    //Obselete - not using anywhere
    async getAssemblyCompC(sLocation, sProduct, iQty, oUniqueIdData, aBOMUID_F, oValidity) {
        GenF.log(`Tech: Function assembly-req/getAssemblyComp`);
        let aBOMMat = [], aBOMOD = [];
        let aBOMUID = [], oBOMUID = {};
        let aCriticalComp = [];

        GenF.log(`Tech: Get from CP_BOM_MAT using ${sLocation} ${sProduct}`);
        aBOMMat = await cds.run(`SELECT *
                                            FROM CP_BOM_MAT 
                                           WHERE LOCATION_ID = '${sLocation}'
                                             AND MAT_PARENT = '${sProduct}'
                                             AND PRODUCT_ID = '${oUniqueIdData.REF_PRODID}'                                                                             
                                            ORDER BY LOCATION_ID,
                                                     MAT_PARENT,
                                                     MAT_CHILD,
                                                     CHILD_LOC`);

        aCriticalComp = await cds.run(`SELECT DISTINCT "ASSEMBLY" FROM "CP_CRITICAL_COMP" WHERE ASSEMBLY_CRITICALKEY = 'X'`);
        GenF.log(`Distinct assemblies count ${aCriticalComp.length}`);

        if (aBOMMat.length > 0) {


            for (let i = 0; i < aBOMMat.length; i++) {
                aBOMUID = [], oBOMUID = {};
                let bFlag = false;
                let iComQty = 0;
                let aFilBOMOD = [], aFilBOMMat = [];
                aBOMOD = [];
                let dValidFrom = aBOMMat[i].VALID_FROM,
                    dValidTo = aBOMMat[i].VALID_TO;

                // if (aBOMMat[i].PHANTOM_IND !== 'X' && aBOMMat[i].CLASS_FLG !== 'X') {
                GenF.log(`Tech: Get from CP_BOM_OD using ${aBOMMat[i].LOCATION_ID} ${aBOMMat[i].MAT_PARENT} ${aBOMMat[i].MAT_CHILD}`);
                aBOMOD = await cds.run(`SELECT * 
                                  FROM CP_BOM_OD
                                 WHERE LOCATION_ID = '${aBOMMat[i].LOCATION_ID}'
                                   AND COUNTER     = '${aBOMMat[i].COUNTER}'
                                   AND MAT_PARENT = '${aBOMMat[i].MAT_PARENT}'  
                                   AND MAT_CHILD = '${aBOMMat[i].MAT_CHILD}'      
                                   AND CONFIG_MAT = '${oUniqueIdData.REF_PRODID}'                       
                              ORDER BY LOCATION_ID,
                                       MAT_PARENT,
                                       MAT_CHILD`);

                // }               

                if (aBOMOD.length > 0) {
                    // for (let iBOMOD = 0; iBOMOD < aBOMOD.length; iBOMOD++) {
                    //     let aBOMDEP = [];
                    //     aBOMDEP = await cds.run(`SELECT * FROM CP_BOM_OD_DEP 
                    //                               WHERE DEPENDENCY = '${aBOMOD[iBOMOD].OBJ_DEP}'
                    //                                     ORDER BY LINE_NO`);
                    //     if(aBOMDEP.length > 0) {
                    //         bFlag = procsObj.processProcedure(aBOMDEP, oUniqueIdData.ITEM);
                    //     }
                    //     if(bFlag === true) {
                    //         break;
                    //     }
                    // }
                    bFlag = await this.processOD(aBOMOD, oUniqueIdData);
                } else {
                    bFlag = true;  // If no Object Dependency exists for current assembly, Quantity of its parent is updated
                }

                if (bFlag === true) {

                    iComQty = aBOMMat[i].COMPONENT_QTY * iQty;

                    if (aBOMMat[i].PHANTOM_IND !== 'X' && aBOMMat[i].CLASS_FLG !== 'X') {

                        // if (aCriticalComp.length > 0) {

                        //     aFilBOMMat = aCriticalComp.filter(function (oCritComp) {
                        //         return oCritComp.ASSEMBLY === aBOMMat[i].MAT_CHILD;
                        //     });
                        // }

                        // Valid From
                        if (new Date(oValidity.VALID_FROM) >= new Date(dValidFrom)) {
                            dValidFrom = oValidity.VALID_FROM;
                        } else {
                            dValidFrom = aBOMMat[i].VALID_FROM;
                        }

                        // Valid To
                        if (new Date(oValidity.VALID_TO) <= new Date(dValidTo)) {
                            dValidTo = oValidity.VALID_TO;
                        } else {
                            dValidTo = aBOMMat[i].VALID_TO;
                        }

                        oBOMUID = {};

                        // if (aFilBOMMat.length > 0) {
                        let iIndex = -1;

                        // iIndex = aBOMUID_F.findIndex(el => {
                        //     return (el.FACTORY_LOC === aBOMMat[i].CHILD_LOC &&
                        //         el.PRODUCT_ID === oUniqueIdData.PRODUCT_ID &&
                        //         el.UNIQUE_ID === oUniqueIdData.UNIQUE_ID &&
                        //         el.ASSEMBLY === aBOMMat[i].MAT_CHILD &&
                        //         el.VALID_FROM === aBOMMat[i].VALID_FROM &&
                        //         el.VALID_TO === aBOMMat[i].VALID_TO &&
                        //         el.ITEM_NUM === aBOMMat[i].COUNTER);
                        // });

                        iIndex = aBOMUID_F.findIndex(el => {
                            return (el.FACTORY_LOC === aBOMMat[i].CHILD_LOC &&
                                el.PRODUCT_ID === oUniqueIdData.PRODUCT_ID &&
                                el.UNIQUE_ID === oUniqueIdData.UNIQUE_ID &&
                                el.ASSEMBLY === aBOMMat[i].MAT_CHILD &&
                                el.VALID_FROM <= dValidFrom &&
                                el.VALID_TO >= dValidTo &&
                                el.ITEM_NUM === aBOMMat[i].COUNTER);
                        });

                        if (iIndex !== -1) {
                            aBOMUID_F[iIndex].ASMB_QTY = aBOMUID_F[iIndex].ASMB_QTY + iComQty;
                        } else {
                            oBOMUID.LOCATION_ID = oUniqueIdData.LOCATION_ID;
                            oBOMUID.FACTORY_LOC = aBOMMat[i].CHILD_LOC;
                            oBOMUID.ASSEMBLY = aBOMMat[i].MAT_CHILD;
                            oBOMUID.UNIQUE_ID = oUniqueIdData.UNIQUE_ID;
                            oBOMUID.PRODUCT_ID = oUniqueIdData.PRODUCT_ID;
                            oBOMUID.ITEM_NUM = aBOMMat[i].COUNTER;
                            // oBOMUID.ITEM_NUM = '000010';
                            oBOMUID.VALID_FROM = aBOMMat[i].VALID_FROM;
                            oBOMUID.VALID_TO = aBOMMat[i].VALID_TO;
                            oBOMUID.RULE_TYPE = 'PI';
                            oBOMUID.REF_PRODID = oUniqueIdData.REF_PRODID;

                            oBOMUID.ASMB_QTY = iComQty;

                            aBOMUID.push(GenF.parse(oBOMUID));
                            // oBOMUID = {};
                        }
                        // }
                    }

                    if (aBOMUID.length > 0) {

                        if (aBOMUID_F.length === 0) {
                            aBOMUID_F = aBOMUID;
                        } else {
                            aBOMUID_F = [...aBOMUID_F, ...aBOMUID];

                        }
                    }
                    if (aBOMMat[i].PHANTOM_IND === 'X' || aBOMMat[i].CLASS_FLG === 'X' || aBOMMat[i].CONFIGURABLE === 'X') {
                        aBOMUID_F = await this.getAssemblyComp(aBOMMat[i].CHILD_LOC, aBOMMat[i].MAT_CHILD, iComQty, oUniqueIdData, aBOMUID_F, oBOMUID);
                    }

                }
            }

        }
        return aBOMUID_F;
    }

    async genBOMUIDMapping_Old(lLocation, lProduct) {
        GenF.log(`Tech: Function assembly-req/genBOMUIDMapping`);
        let aUniqueIdData = [];
        let oResponse = { bError: false, sMessage: '' };
        GenF.log(`Tech: Get from V_UNIQUE_ID and V_SALES_H using ${lLocation} ${lProduct}`);

        let aBOMUID_F = [];
        let bFlag = '';
        let oValidity = { VALID_FROM: '2000-01-01', VALID_TO: '9999-12-31' };

        let liUniqueData = await cds.run(`SELECT DISTINCT
                                                V_SALES_H.LOCATION_ID,
                                                V_SALES_H.PRODUCT_ID,
                                                V_UNIQUE_ID_ITEMS.PRODUCT_ID AS REF_PRODID,
                                                V_UNIQUE_ID_ITEMS.UNIQUE_ID,
                                                V_UNIQUE_ID_ITEMS.CHAR_NUM,
                                                V_UNIQUE_ID_ITEMS.CHARVAL_NUM,
                                                V_UNIQUE_ID_ITEMS.CHAR_VALUE,
                                                V_UNIQUE_ID_ITEMS.CHAR_NAME
                                            FROM
                                            V_UNIQUE_ID_ITEMS
                                                INNER JOIN
                                                V_SALES_H
                                                ON V_UNIQUE_ID_ITEMS.PRODUCT_ID = V_SALES_H.REF_PRODID
                                                    AND V_UNIQUE_ID_ITEMS.UNIQUE_ID = V_SALES_H.UNIQUE_ID
                                            WHERE V_SALES_H.FACTORY_LOC = '${lLocation}'
                                            AND V_UNIQUE_ID_ITEMS.PRODUCT_ID = '${lProduct}'
                                            AND V_UNIQUE_ID_ITEMS.UID_TYPE = 'U'
                                        ORDER BY V_SALES_H.LOCATION_ID,
                                                V_SALES_H.PRODUCT_ID,                                                        
                                                V_UNIQUE_ID_ITEMS.PRODUCT_ID,
                                                V_UNIQUE_ID_ITEMS.UNIQUE_ID`);

        if (liUniqueData.length === 0) {

            // VP-1377 - Handling Assembly Requirements for Non-Configurable Products
            let aProduct = await cds.run(`SELECT PRODUCT_ID 
                                            FROM CP_PRODUCT 
                                           WHERE PRODUCT_ID = '${lProduct}'
                                             AND NON_CONFIGURABLE = 'X'`);

            if (aProduct.length > 0) {
                liUniqueData.push({
                    LOCATION_ID: lLocation,
                    PRODUCT_ID: lProduct,
                    REF_PRODID: lProduct,
                    UNIQUE_ID: 0,
                    CHAR_NUM: '',
                    CHARVAL_NUM: '',
                    CHAR_VALUE: '',
                    CHAR_NAME: ''
                });
            }

        }


        if (liUniqueData.length > 0) {
            // Create nested array with distinct Object Dependencies and its rules
            aUniqueIdData = liUniqueData.reduce((aConfig, curr) => {
                const ITEM = [];
                const {
                    LOCATION_ID,
                    PRODUCT_ID,
                    REF_PRODID,
                    UNIQUE_ID,
                    CHAR_NUM,
                    CHARVAL_NUM,
                    CHAR_VALUE,
                    CHAR_NAME
                } = curr;
                const findObj = aConfig.find((o) => o.UNIQUE_ID === UNIQUE_ID &&
                    o.LOCATION_ID === LOCATION_ID &&
                    o.PRODUCT_ID === PRODUCT_ID);
                if (!findObj) {
                    ITEM.push({
                        CHAR_NUM,
                        CHARVAL_NUM,
                        CHAR_VALUE,
                        CHAR_NAME
                    });
                    aConfig.push({ UNIQUE_ID, LOCATION_ID, PRODUCT_ID, REF_PRODID, ITEM });
                } else {
                    findObj.ITEM.push({
                        CHAR_NUM,
                        CHARVAL_NUM,
                        CHAR_VALUE,
                        CHAR_NAME
                    });
                }
                return aConfig;
            }, []);
        }


        if (aUniqueIdData.length > 0) {
            for (let i = 0; i < aUniqueIdData.length; i++) {

                aBOMUID_F = await this.getAssemblyComp(lLocation, lProduct, 1, aUniqueIdData[i], aBOMUID_F, oValidity);

                console.log(aUniqueIdData[i]);
                if (aBOMUID_F.length > 0) {
                    try {

                        GenF.log(`Deleting from BOM UID for Unique ID: ${aUniqueIdData[i].UNIQUE_ID}`);
                        await cds.run(
                            `DELETE FROM CP_BOM_UID WHERE UNIQUE_ID = '${aUniqueIdData[i].UNIQUE_ID}' 
                                                      AND RULE_TYPE = 'PI'`
                        );
                        GenF.log(`Tech: Create a records into CP_BOM_UID. Records count: ${aBOMUID_F.length}`);
                        await cds.run({
                            INSERT:
                            {
                                into: { ref: ['CP_BOM_UID'] },
                                entries: aBOMUID_F
                            }
                        });
                        bFlag = 'X';
                    } catch (e) {
                        console.log(e);
                    }
                    aBOMUID_F = [];
                }

            }
            if (bFlag === 'X') {
                oResponse.sMessage = 'BOM-UID mapping generated successfully for Product: ' + lProduct;
            } else {
                oResponse.bError = true;
                oResponse.sMessage = 'BOM-UID mapping generation failed for Product:' + lProduct;
            }
            GenF.log(oResponse.sMessage);
        } else {
            oResponse.sMessage = 'Insufficient data for generating BOM-UID mapping for Product: ' + lProduct;
        }
        GenF.log(oResponse.sMessage);

        await this.genRTRUIDMapping(lLocation, lProduct);
        return oResponse;
    }


    //New function for genBOMUIDMapping- 20/02/2025  
    async genBOMUIDMapping(impLocation, impProduct, impFull,el) {
        GenF.log(`Tech: Function assembly-req/genBOMUIDMapping`);
        let oResponse = { bError: false, sMessage: '' };
        let aBOMUID_F = [], aBOMData = {}, oBOMData = {};
        let aProdOrdData = [];
        let aUniqueId = {}, aUniqueData = [];
        let bFlag = '';
        let oValidity = { VALID_FROM: '2000-01-01', VALID_TO: '9999-12-31' };
        let interAsmb = 'false';        
        // get config material flag
                let configFlag = await cds.run(`SELECT TOP 1 VALUE from CP_PARAMETER_VALUES WHERE PARAMETER_ID = 25`);
                if(configFlag.length > 0){
                    interAsmb = configFlag[0].VALUE;
                } 
        if (impFull === 'X') {
            // aUniqueData = await cds.run(`SELECT 
            //             V.UNIQUE_ID,
            //             V.CHAR_NUM,
            //             V.CHAR_NAME,
            //             V.CHAR_VALUE,
            //             V.PRODUCT_ID,
            //             (SELECT DISTINCT LOCATION_ID 
            //             FROM CP_CIR_GENERATED C 
            //             WHERE C.UNIQUE_ID = V.UNIQUE_ID 
            //             AND C.PRODUCT_ID = '${impProduct}' 
            //             AND C.LOCATION_ID = '${impLocation}'
            //             ) AS LOCATION_ID
            //         FROM V_UNIQUE_ID_ITEMS V
            //         WHERE V.UNIQUE_ID IN (
            //             SELECT DISTINCT UNIQUE_ID 
            //             FROM CP_CIR_GENERATED 
            //             WHERE LOCATION_ID = '${impLocation}' 
            //             AND PRODUCT_ID = '${impProduct}'
            //                                 )
            //             AND V.CHAR_VALUE !='ZZZZ'`);

            // aUniqueData = await cds.run(`SELECT 
            //         V.UNIQUE_ID,
            //         V.CHAR_NUM,
            //         V.CHAR_NAME,
            //         V.CHAR_VALUE,
            //         V.PRODUCT_ID AS REF_PRODID,
            //         (
            //             (SELECT DISTINCT LOCATION_ID
            //             FROM CP_CIR_GENERATED AS C
            //             WHERE C.UNIQUE_ID = V.UNIQUE_ID
            //                 AND (C.PRODUCT_ID IN (SELECT DISTINCT PRODUCT_ID
            //                     FROM CP_PARTIALPROD_INTRO
            //                     WHERE LOCATION_ID = '${impLocation}'
            //                         AND PRODUCT_ID ='${el}'))
            //                 AND (C.LOCATION_ID IN (SELECT DISTINCT DEMAND_LOC
            //                     FROM V_FACTORYLOC
            //                     WHERE FACTORY_LOC =  '${impLocation}')))
            //         ) AS LOCATION_ID,
            //         (
            //             (SELECT DISTINCT PRODUCT_ID
            //             FROM CP_CIR_GENERATED AS C
            //             WHERE C.UNIQUE_ID = V.UNIQUE_ID
            //                 AND (C.PRODUCT_ID IN (SELECT DISTINCT PRODUCT_ID
            //                     FROM CP_PARTIALPROD_INTRO
            //                     WHERE LOCATION_ID = '${impLocation}'
            //                         AND PRODUCT_ID = '${el}'))
            //                 AND (C.LOCATION_ID IN (SELECT DISTINCT DEMAND_LOC
            //                     FROM V_FACTORYLOC
            //                     WHERE FACTORY_LOC =  '${impLocation}')))
            //         ) AS PRODUCT_ID
            //     FROM V_UNIQUE_ID_ITEMS AS V
            //     WHERE (V.UNIQUE_ID IN (SELECT DISTINCT UNIQUE_ID
            //             FROM CP_CIR_GENERATED
            //             WHERE (LOCATION_ID IN (SELECT DISTINCT DEMAND_LOC
            //                     FROM V_FACTORYLOC
            //                     WHERE FACTORY_LOC =  '${impLocation}'))
            //                   AND (PRODUCT_ID IN (SELECT DISTINCT PRODUCT_ID
            //                     FROM CP_PARTIALPROD_INTRO
            //                     WHERE LOCATION_ID = '${impLocation}'
            //                         AND PRODUCT_ID = '${el}'))))
            //         AND V.CHAR_VALUE != 'ZZZZ'
                // `);


               aUniqueData = await cds.run(` SELECT DISTINCT
                    V.UNIQUE_ID,
                    V.CHAR_NUM,
                    V.CHAR_NAME,
                    V.CHAR_VALUE,
                    V.PRODUCT_ID AS REF_PRODID,
                    C.LOCATION_ID,
                     C.PRODUCT_ID
                   
                FROM V_UNIQUE_ID_ITEMS AS V
                INNER JOIN CP_CIR_GENERATED AS C
                on V.UNIQUE_ID = C.UNIQUE_ID
                WHERE C.PRODUCT_ID = '${el}'
                	and (C.LOCATION_ID IN (SELECT DISTINCT DEMAND_LOC
                                 FROM V_FACTORYLOC
                                 WHERE FACTORY_LOC =  '${impLocation}'
                                 AND PRODUCT_ID ='${el}'))
                	AND C.CIR_QTY > 0
                    AND V.CHAR_VALUE != 'ZZZZ'
                     `);

        }
        else {
            //  aUniqueData = await cds.run(`SELECT 
            //                             UNIQUE_ID,
            //                             CHAR_NUM,
            //                             CHAR_NAME,
            //                             CHAR_VALUE,
            //                             V_UNIQUE_ID_ITEMS.PRODUCT_ID AS REF_PRODID,
            //                              (SELECT DISTINCT LOCATION_ID 
            //                                 FROM CP_CIR_GENERATED C 
            //                                 WHERE C.UNIQUE_ID = V_UNIQUE_ID_ITEMS.UNIQUE_ID 
            //                                 AND C.PRODUCT_ID IN (SELECT DISTINCT PRODUCT_ID
            //                                                         FROM CP_PARTIALPROD_INTRO
            //                                                         WHERE LOCATION_ID = '${impLocation}'
            //                                                             AND PRODUCT_ID = '${el}') 
            //                                 AND (C.LOCATION_ID IN (SELECT DISTINCT DEMAND_LOC
            //                                                         FROM V_FACTORYLOC
            //                                                         WHERE FACTORY_LOC =  '${impLocation}'))
            //                                 ) AS LOCATION_ID,
            //                                 (SELECT DISTINCT PRODUCT_ID
            //                                 FROM CP_CIR_GENERATED C 
            //                                 WHERE C.UNIQUE_ID = V_UNIQUE_ID_ITEMS.UNIQUE_ID 
            //                                 AND C.PRODUCT_ID IN (SELECT DISTINCT PRODUCT_ID
            //                                                         FROM CP_PARTIALPROD_INTRO
            //                                                         WHERE LOCATION_ID = '${impLocation}'
            //                                                             AND PRODUCT_ID = '${el}') 
            //                                 AND (C.LOCATION_ID IN (SELECT DISTINCT DEMAND_LOC
            //                                                         FROM V_FACTORYLOC
            //                                                         WHERE FACTORY_LOC =  '${impLocation}'))
            //                                     ) AS PRODUCT_ID

            //                                 FROM V_UNIQUE_ID_ITEMS
            //                                 WHERE (UNIQUE_ID IN (SELECT DISTINCT UNIQUE_ID
            //                                 FROM CP_CIR_GENERATED
            //                                 WHERE (LOCATION_ID IN (SELECT DISTINCT DEMAND_LOC
            //                                                         FROM V_FACTORYLOC
            //                                                         WHERE FACTORY_LOC =  '${impLocation}'))
            //                                 AND PRODUCT_ID IN (SELECT DISTINCT PRODUCT_ID
            //                                                     FROM CP_PARTIALPROD_INTRO
            //                                                     WHERE LOCATION_ID = '${impLocation}'
            //                                                         AND PRODUCT_ID = '${el}')
            //                                 AND UNIQUE_ID NOT IN(SELECT DISTINCT UNIQUE_ID FROM CP_BOM_UID
            //                                 WHERE (LOCATION_ID IN (SELECT DISTINCT DEMAND_LOC
            //                                                         FROM V_FACTORYLOC
            //                                                         WHERE FACTORY_LOC =  '${impLocation}'))
            //                                 AND PRODUCT_ID IN (SELECT DISTINCT PRODUCT_ID
            //                                                     FROM CP_PARTIALPROD_INTRO
            //                                                     WHERE LOCATION_ID = '${impLocation}'
            //                                                     AND PRODUCT_ID = '${el}')))) 
            //                                 AND CHAR_VALUE !='ZZZZ'`);
            aUniqueData = await cds.run(` SELECT DISTINCT
                                            V.UNIQUE_ID,
                                            V.CHAR_NUM,
                                            V.CHAR_NAME,
                                            V.CHAR_VALUE,
                                            V.PRODUCT_ID AS REF_PRODID,
                                            C.LOCATION_ID,
                                            C.PRODUCT_ID
                                        
                                        FROM V_UNIQUE_ID_ITEMS AS V
                                        INNER JOIN CP_CIR_GENERATED AS C
                                        on V.UNIQUE_ID = C.UNIQUE_ID
                                        WHERE C.PRODUCT_ID = '${el}'
                                            and (C.LOCATION_ID IN (SELECT DISTINCT DEMAND_LOC
                                                        FROM V_FACTORYLOC
                                                        WHERE FACTORY_LOC =  '${impLocation}'
                                                        AND PRODUCT_ID ='${el}'))
                                            AND C.CIR_QTY > 0
                                            AND V.CHAR_VALUE != 'ZZZZ'
                                            AND C.UNIQUE_ID NOT IN(SELECT DISTINCT UNIQUE_ID FROM CP_BOM_UID
                                             WHERE LOCATION_ID = '${impLocation}' AND PRODUCT_ID = '${el}')
                                            `);
        }
        //Get Unique Characteristics Data
        // let aUniqueChar = await cds.run(`SELECT DISTINCT CHAR_NAME,CHAR_VALUE FROM "V_UNIQUE_ID_ITEM" WHERE PRODUCT_ID='${impProduct}'`);
         let aUniqueChar = await cds.run(`SELECT DISTINCT CH.CHAR_NAME,I.CHAR_VALUE FROM "CP_UNIQUE_ID_ITEM" AS I
                            INNER JOIN "CP_CHARACTERISTICS" AS CH ON CH.CHAR_NUM = I.CHAR_NUM WHERE PRODUCT_ID='${impProduct}'`);
        let oUniqueChar = {};
        for (let u = 0; u < aUniqueChar.length; u++) {
            oUniqueChar[aUniqueChar[u].CHAR_NAME] ??= [];
            oUniqueChar[aUniqueChar[u].CHAR_NAME].push(aUniqueChar[u].CHAR_VALUE);
        }
        if (aUniqueData.length === 0) {

            // VP-1377 - Handling Assembly Requirements for Non-Configurable Products
            let aProduct = await cds.run(`SELECT PRODUCT_ID
                                            FROM CP_PRODUCT
                                           WHERE PRODUCT_ID = '${impProduct}'
                                             AND NON_CONFIGURABLE = 'X'`);

            if (aProduct.length > 0) {
                aUniqueData.push({
                    LOCATION_ID: impLocation,
                    PRODUCT_ID: impProduct,
                    REF_PRODID: impProduct,
                    UNIQUE_ID: 0,
                    CHAR_NUM: '',
                    CHARVAL_NUM: '',
                    CHAR_VALUE: '',
                    CHAR_NAME: ''
                });
            }

        }
        if (aUniqueData.length > 0) {
            for (let i = 0; i < aUniqueData.length; i++) {
                if (aUniqueId[aUniqueData[i].UNIQUE_ID] === undefined) {
                    aUniqueId[aUniqueData[i].UNIQUE_ID] = [];
                }
                aUniqueId[aUniqueData[i].UNIQUE_ID].push(aUniqueData[i]);
            }

            aBOMData = await this.getBOMMat(impLocation, impProduct);
            aProdOrdData = await this.getProdOrdConsmd(impLocation, impProduct);
        }

        if (aUniqueData.length === 0 || aBOMData[impLocation][impProduct] === undefined) {
            oResponse.sMessage = 'Insufficient data for generating BOM-UID mapping for Product: ' + impProduct;
            GenF.log(oResponse.sMessage);
            return oResponse;
        }
        if(aUniqueData.length>0){
            aUniqueData.forEach(u=>{
                if(isNaN(u.CHAR_VALUE) == false){//If numeric type,remove 0 after decimals
                    u.CHAR_VALUE =  u.CHAR_VALUE.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
                }
            })
        }
         //Get Procedure Characteristics
        let aPChar = await cds.run(`SELECT * FROM "CP_PROCEDURE_CHAR"`);
        const oPChar = {};
        for(let p = 0; p <aPChar.length; p++){
            oPChar[aPChar[p].CHARACTERISTIC] ??= '';
            oPChar[aPChar[p].CHARACTERISTIC] = aPChar[p].CHAR_TYPE;
        } 
        console.log("Total Unique ids for BOMUID", aUniqueId.length);
        if(impFull === 'X'){
            // GenF.log(`Deleting from BOM UID for Unique ID: ${aUniqueId[key][0].UNIQUE_ID}`);
            await cds.run(
                        `DELETE FROM CP_BOM_UID WHERE LOCATION_ID = '${impLocation}' AND RULE_TYPE = 'PI' AND 
                                                      REF_PRODID='${impProduct}' AND PRODUCT_ID='${el}' `
                    );
        }
        for (const key in aUniqueId) {
            console.log("BOMUIID generation started for UID", aUniqueId[key], new Date());
            aBOMUID_F = await this.getAssemblyComponents(impLocation, impProduct, impProduct, 1, aBOMData, oBOMData, aUniqueId[key], aBOMUID_F, oValidity, aProdOrdData, oUniqueChar,interAsmb,oPChar,impLocation);
            // console.log(aUniqueId[key]);
            console.log("BOMUIID generation completed for UID", aUniqueId[key], new Date());
            if (aBOMUID_F.length > 0) {
                try {
                    GenF.log(`Deleting from BOM UID for Unique ID: ${aUniqueId[key][0].UNIQUE_ID}`);
                    await cds.run(
                        `DELETE FROM CP_BOM_UID WHERE UNIQUE_ID = '${aUniqueId[key][0].UNIQUE_ID}' 
                                                                  AND RULE_TYPE = 'PI'  AND REF_PRODID='${impProduct}' AND PRODUCT_ID='${el}' `
                    );
                    GenF.log(`Tech: Create a records into CP_BOM_UID. Records count: ${aBOMUID_F.length}`);
                    // await cds.run({
                    //     INSERT:
                    //     {
                    //         into: { ref: ['CP_BOM_UID'] },
                    //         entries: aBOMUID_F
                    //     }
                    // });
                    let cqnQuery = { UPSERT: { into: { ref: ['CP_BOM_UID'] }, entries: aBOMUID_F } };
                        try {
                            await cds.run(cqnQuery);
                        } catch (e) {
                            console.log('Error');
                        }
                    console.log('BOM-UID mapping generated successfully for Product: ' + el);
                    bFlag = 'X';
                    // counter = counter + 1;
                } catch (e) {
                    console.log(e);
                }
                aBOMUID_F = [];
            } 
        }
        if (bFlag === 'X') {
            // oResponse.sMessage = 'BOM-UID mapping generated successfully for Product: ' + impProduct;
            oResponse.sMessage = 'BOM-UID mapping generated successfully for Product: ' + el;
        } else {
            oResponse.bError = true;
            // oResponse.sMessage = 'BOM-UID mapping generation failed for Product:' + impProduct;
            oResponse.sMessage = 'BOM-UID mapping generation failed for Product:' + el;
        }
        GenF.log(oResponse.sMessage);
        await this.genRTRUIDMapping(impLocation, impProduct)
        return oResponse;
    }

    async getBOMMatC(impLocation, impProduct) {
        let aBOMData = {};
        let aBOMFullData = await cds.run(`SELECT DISTINCT CP_BOM_MAT.LOCATION_ID,
                                                      CP_BOM_MAT.MAT_PARENT,
                                                      CP_BOM_MAT.MAT_CHILD,
                                                      CP_BOM_MAT.CHILD_LOC,
                                                      CP_BOM_MAT.PHANTOM_IND,
                                                      CP_BOM_MAT.CONFIGURABLE,
                                                      CP_BOM_MAT.CLASS_FLG,
                                                      CP_BOM_MAT.COMPONENT_QTY,
                                                      CP_BOM_MAT.VALID_FROM,
                                                      CP_BOM_MAT.VALID_TO,
                                                      CP_BOM_MAT.COUNTER
                                                 FROM "CP_BOM_MAT" `);

        for (let i = 0; i < aBOMFullData.length; i++) {
            if (aBOMData[aBOMFullData[i].LOCATION_ID] === undefined) {
                aBOMData[aBOMFullData[i].LOCATION_ID] = {};
            }

            if (aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].MAT_PARENT] === undefined) {
                aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].MAT_PARENT] = [];
            }

            let aBOMLine = [];
            aBOMLine['MAT_CHILD'] = aBOMFullData[i].MAT_CHILD;
            aBOMLine['CHILD_LOC'] = aBOMFullData[i].CHILD_LOC;
            aBOMLine['PHANTOM_IND'] = aBOMFullData[i].PHANTOM_IND;
            aBOMLine['CONFIGURABLE'] = aBOMFullData[i].CONFIGURABLE;
            aBOMLine['CLASS_FLG'] = aBOMFullData[i].CLASS_FLG;
            aBOMLine['COMPONENT_QTY'] = aBOMFullData[i].COMPONENT_QTY;
            aBOMLine['VALID_FROM'] = aBOMFullData[i].VALID_FROM;
            aBOMLine['VALID_TO'] = aBOMFullData[i].VALID_TO;
            aBOMLine['COUNTER'] = aBOMFullData[i].COUNTER;

            aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].MAT_PARENT].push(aBOMLine);
            aBOMLine = [];
        }
        aBOMFullData = [];
        return aBOMData;
    }

    async getBOMMat(impLocation, impProduct) {
        let aBOMData = {};
        let aBOMFullData = await cds.run(`SELECT * FROM "CP_BOM_HIERARCHY"`);

        for (let i = 0; i < aBOMFullData.length; i++) {
            if (aBOMData[aBOMFullData[i].LOCATION_ID] === undefined) {
                aBOMData[aBOMFullData[i].LOCATION_ID] = {};
            }

            if (aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].BOM_PARENT] === undefined) {
                aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].BOM_PARENT] = [];
            }

            let aBOMLine = [];

            aBOMLine = JSON.parse(aBOMFullData[i].BOM_CHILD);

            aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].BOM_PARENT] = aBOMLine;
            aBOMLine = [];
        }
        aBOMFullData = [];
        return aBOMData;
    }

    async getProdOrdConsmd(impLocation, impProduct) {
        let aProdOrdData = {};
        let aProdOrdCompData = await cds.run(`SELECT DISTINCT
                                                A.LOCATION_ID,
                                                A.REF_PRODID,
                                                A.COMPONENT,
                                                A.COMP_LOC,
                                                A.MAT_PARENT,
                                                B.UNIQUE_ID,
                                                B.PRODUCT_ID
                                            FROM 
                                                CP_PROD_ORD_CONSUMPTION AS A
                                                INNER JOIN V_SALES_H AS B
                                                ON A.LOCATION_ID = B.LOCATION_ID
                                                AND A.REF_PRODID = B.REF_PRODID
                                                AND A.SALES_DOC = B.SALES_DOC
                                               AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
                                            WHERE A.LOCATION_ID = '${impLocation}'
                                              AND A.REF_PRODID = '${impProduct}'
                                            ORDER BY 
                                                A.LOCATION_ID,
                                                A.REF_PRODID,
                                                A.COMPONENT,
                                                A.COMP_LOC,
                                                A.MAT_PARENT,
                                                B.UNIQUE_ID,
                                                B.PRODUCT_ID`);

        for (let i = 0; i < aProdOrdCompData.length; i++) {
            if (aProdOrdData[aProdOrdCompData[i].UNIQUE_ID] === undefined) {
                aProdOrdData[aProdOrdCompData[i].UNIQUE_ID] = [];
            }

            // if (aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].BOM_PARENT] === undefined) {
            //     aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].BOM_PARENT] = [];
            // }

            let aProdOrdLine = {};
            aProdOrdLine.COMPONENT = aProdOrdCompData[i].COMPONENT;
            aProdOrdLine.COMP_LOC = aProdOrdCompData[i].COMP_LOC;
            aProdOrdLine.MAT_PARENT = aProdOrdCompData[i].MAT_PARENT;

            aProdOrdData[aProdOrdCompData[i].UNIQUE_ID].push(aProdOrdLine);
            aProdOrdLine = {};
        }
        aProdOrdCompData = [];
        return aProdOrdData;
    }

    async getAssemblyComponents(sLocation, sProduct, sParentProduct, iQty, aBOMData, oBOMData, aUniqueIdLine, aBOMUID_F, oValidity, aProdOrdData, oUniqueChar,interAsmb,oPChar,sMainLocation) {
        let aBOMDep = {};
        if (aBOMData[sLocation] && aBOMData[sLocation][sProduct]) {
            for (let i = 0; i < aBOMData[sLocation][sProduct].length; i++) {
                let bFlag = false; var iCompQty = 0;
                let aBOMUID = [], oBOMUID = {};
                const aBOMLine = aBOMData[sLocation][sProduct][i];
                let dValidFrom = aBOMLine.VALID_FROM,
                    dValidTo = aBOMLine.VALID_TO;
                let aBOMDepData = [];
                var bProcedure = false;

                // Check if Production Order exists for Assembly
                if (aProdOrdData) {
                    let aProdOrdLine = aProdOrdData[aUniqueIdLine.UNIQUE_ID];
                    if (aProdOrdLine?.length > 0) {
                        let iIndex = aProdOrdLine.findIndex(e => e.COMPONENT === aBOMLine.MAT_CHILD
                            && e.COMP_LOC === aBOMLine.CHILD_LOC
                            && e.MAT_PARENT === sProduct
                            && e.LOCATION_ID === sLocation);
                        if (iIndex > -1) {
                            bFlag = true;
                        } else {
                            bFlag = false;
                        }
                    }
                }
                if (bFlag === false) {
                    aBOMDepData = await cds.run(`SELECT 
                        	"DEPENDENCY",
	                        "LINE_NO",
                           ' ' || "LINE" || ' ' AS "LINE",
	                        "DEPENDENCY_TYPE"
                            FROM CP_BOM_OD_DEP
                            WHERE (DEPENDENCY IN (SELECT DISTINCT OBJ_DEP
                                                    FROM CP_BOM_OD
                                                    WHERE LOCATION_ID = '${sLocation}'
                                                    AND COUNTER = '${aBOMLine.COUNTER}'
                                                    AND MAT_PARENT = '${sProduct}'
                                                    AND MAT_CHILD = '${aBOMLine.MAT_CHILD}'))
                             AND (DEPENDENCY_TYPE = 'S' OR DEPENDENCY_TYPE = 'P')
                             ORDER BY DEPENDENCY, 
                                      LINE_NO ASC`);
                }
                if (aBOMDepData.length > 0) {
                    for (let j = 0; j < aBOMDepData.length; j++) {
                        if (aBOMDep[aBOMDepData[j].DEPENDENCY] === undefined) {
                            aBOMDep[aBOMDepData[j].DEPENDENCY] = [];
                        }
                        aBOMDep[aBOMDepData[j].DEPENDENCY].push(aBOMDepData[j])
                    }
                    aBOMDepData = [];
                    for (const k in aBOMDep) {
                        if (aBOMDep[k].length > 0) {
                            //Dependency Type S
                            let aDependencyS = aBOMDep[k].filter(f=>f.DEPENDENCY_TYPE == 'S');
                            if(aDependencyS.length>0){
                                bFlag = await procsObj.processDependency(aDependencyS, aUniqueIdLine, oUniqueChar,'S',sProduct)
                            }
                            if(bFlag == true){
                                console.log("")
                            }
                            //check Depdency type P if aDependencyS does not exists or aDependencyS exists and bFlag is true
                            if(aDependencyS.length == 0 || (aDependencyS.length >0 && bFlag == true)){
                                 let aDependencyP = aBOMDep[k].filter(f=>f.DEPENDENCY_TYPE == 'P');
                                 if(aDependencyP.length >0){
                                let oResponse = await procsObj.processProcedure(aDependencyP, aUniqueIdLine, oUniqueChar,oPChar,aBOMLine.COMPONENT_QTY,sProduct); 
                                  bFlag = oResponse.bFlag;
                                 bProcedure = bFlag;
                                if(bFlag == true){
                                 aBOMLine.COMPONENT_QTY =  oResponse.Quantity;     
                               } 
                                 }
                            }
                           
                        }
                        if (bFlag === true) {
                            break;
                        }
                    }
                    aBOMDep = {};
                }
                else {
                    bFlag = true;// If no Object Dependency exists for current assembly, Quantity of its parent is updated
                }
                if (bFlag === true) {
                    if(bProcedure == false){
                    iCompQty = aBOMLine.COMPONENT_QTY * iQty;
                    }
                    else{
                        iCompQty = aBOMLine.COMPONENT_QTY;
                    }
                

                    // if ((aBOMLine.PHANTOM_IND).toUpperCase() !== 'X'
                    //     && aBOMLine.CLASS_FLG !== 'X') {
                    // if(interAsmb == 'false' && aBOMLine.CLASS_FLG !== 'X'){
                    if(aBOMLine.CLASS_FLG !== 'X'){
                        // Valid From
                        if (new Date(oValidity.VALID_FROM) >= new Date(dValidFrom)) {
                            dValidFrom = oValidity.VALID_FROM;
                        } else {
                            dValidFrom = aBOMLine.VALID_FROM;
                        }

                        // Valid To
                        if (new Date(oValidity.VALID_TO) <= new Date(dValidTo)) {
                            dValidTo = oValidity.VALID_TO;
                        } else {
                            dValidTo = aBOMLine.VALID_TO;
                        }

                        oBOMUID = {};

                        // if (aFilBOMMat.length > 0) {
                        let iIndex = -1;

                        iIndex = aBOMUID_F.findIndex(el => {
                            return (el.FACTORY_LOC === aBOMLine.CHILD_LOC &&
                                el.PRODUCT_ID === aUniqueIdLine[0].PRODUCT_ID &&
                                el.UNIQUE_ID === aUniqueIdLine[0].UNIQUE_ID &&
                                el.ASSEMBLY === aBOMLine.MAT_CHILD &&
                                el.VALID_FROM <= dValidFrom &&
                                el.VALID_TO >= dValidTo &&
                                el.ITEM_NUM === aBOMLine.COUNTER);
                        });

                        if (iIndex !== -1) {
                            aBOMUID_F[iIndex].ASMB_QTY = aBOMUID_F[iIndex].ASMB_QTY + iCompQty;
                        } else {
                            // oBOMUID.LOCATION_ID = aUniqueIdLine[0].LOCATION_ID;
                            oBOMUID.LOCATION_ID = sMainLocation;
                            oBOMUID.FACTORY_LOC = aBOMLine.CHILD_LOC;
                            oBOMUID.ASSEMBLY = aBOMLine.MAT_CHILD;
                            oBOMUID.UNIQUE_ID = aUniqueIdLine[0].UNIQUE_ID;
                            oBOMUID.PRODUCT_ID = aUniqueIdLine[0].PRODUCT_ID;
                            oBOMUID.ITEM_NUM = aBOMLine.COUNTER;
                            oBOMUID.VALID_FROM = aBOMLine.VALID_FROM;
                            oBOMUID.VALID_TO = aBOMLine.VALID_TO;
                            oBOMUID.RULE_TYPE = 'PI';
                            oBOMUID.REF_PRODID = aUniqueIdLine[0].REF_PRODID; // aUniqueIdLine[0].PRODUCT_ID;
                            oBOMUID.ASMB_QTY = iCompQty;
                            oBOMUID.FINAL_ASS = '';

                            aBOMUID.push(GenF.parse(oBOMUID));
                            // oBOMUID = {};
                        }
                        //}
                    }
                    if (aBOMUID.length > 0) {
                        if (aBOMLine.CONFIGURABLE == 'X' || aBOMLine.PHANTOM_IND == 'X') {
                            if (interAsmb == 'true') {
                                if (aBOMUID_F.length === 0) {
                                    aBOMUID_F = aBOMUID;
                                } else {
                                    aBOMUID_F = [...aBOMUID_F, ...aBOMUID];

                                }
                            }

                        } else {
                            aBOMUID[0].FINAL_ASS = 'X';
                            if (aBOMUID_F.length === 0) {
                                aBOMUID_F = aBOMUID;
                            } else {
                                aBOMUID_F = [...aBOMUID_F, ...aBOMUID];

                            }
                        }
                    }
                    if ((aBOMLine.PHANTOM_IND).toUpperCase() === 'X' || aBOMLine.CLASS_FLG === 'X' || aBOMLine.CONFIGURABLE === 'X') {
                        aBOMUID_F = await this.getAssemblyComponents(aBOMLine.CHILD_LOC, aBOMLine.MAT_CHILD, sParentProduct, iCompQty, aBOMData, oBOMUID, aUniqueIdLine, aBOMUID_F, oValidity, aProdOrdData, oUniqueChar,interAsmb,oPChar,sMainLocation);
                    }
                }
            }
        }
        return aBOMUID_F
    }

    async getAssemblyComp(sLocation, sProduct, iQty, oUniqueIdData, aBOMUID_F, oValidity) {
        GenF.log(`Tech: Function assembly-req/getAssemblyComp`);
        let aBOMMat = [], aBOMOD = [];
        let aBOMUID = [], oBOMUID = {};
        let aCriticalComp = [];

        GenF.log(`Tech: Get from CP_BOM_MAT using ${sLocation} ${sProduct}`);

        // // Process Object Dependencies of type Procedures
        // oUniqueIdData = await this.processODTypProcedures(sLocation, sProduct, oUniqueIdData);

        aBOMMat = await cds.run(`SELECT *
                                            FROM CP_BOM_MAT 
                                           WHERE LOCATION_ID = '${sLocation}'
                                             AND MAT_PARENT = '${sProduct}'                                                                           
                                            ORDER BY LOCATION_ID,
                                                     MAT_PARENT,
                                                     MAT_CHILD,
                                                     CHILD_LOC`);

        aCriticalComp = await cds.run(`SELECT DISTINCT "ASSEMBLY" FROM "CP_CRITICAL_COMP" WHERE ASSEMBLY_CRITICALKEY = 'X'`);
        GenF.log(`Distinct assemblies count ${aCriticalComp.length}`);

        if (aBOMMat.length > 0) {

            for (let i = 0; i < aBOMMat.length; i++) {
                aBOMUID = [], oBOMUID = {};
                let bFlag = false;
                let iComQty = 0;
                let aFilBOMOD = [], aFilBOMMat = [];
                aBOMOD = [];
                let dValidFrom = aBOMMat[i].VALID_FROM,
                    dValidTo = aBOMMat[i].VALID_TO;

                // if (aBOMMat[i].PHANTOM_IND !== 'X' && aBOMMat[i].CLASS_FLG !== 'X') {
                GenF.log(`Tech: Get from CP_BOM_OD using ${aBOMMat[i].LOCATION_ID} ${aBOMMat[i].MAT_PARENT} ${aBOMMat[i].MAT_CHILD}`);
                aBOMOD = await cds.run(`SELECT * 
                                  FROM CP_BOM_OD
                                 WHERE LOCATION_ID = '${aBOMMat[i].LOCATION_ID}'
                                   AND COUNTER     = '${aBOMMat[i].COUNTER}'
                                   AND MAT_PARENT = '${aBOMMat[i].MAT_PARENT}'  
                                   AND MAT_CHILD = '${aBOMMat[i].MAT_CHILD}'                      
                              ORDER BY LOCATION_ID,
                                       MAT_PARENT,
                                       MAT_CHILD`);

                // }               

                if (aBOMOD.length > 0) {
                    for (let iBOMOD = 0; iBOMOD < aBOMOD.length; iBOMOD++) {
                        let aBOMDEP = [];
                        aBOMDEP = await cds.run(`SELECT * FROM CP_BOM_OD_DEP 
                                                  WHERE DEPENDENCY = '${aBOMOD[iBOMOD].OBJ_DEP}'
                                                    AND DEPENDENCY_TYPE = 'S'
                                                        ORDER BY LINE_NO`);
                        if (aBOMDEP.length > 0) {
                            bFlag = procsObj.processDependency(aBOMDEP, oUniqueIdData.ITEM);
                        }
                        if (bFlag === true) {
                            break;
                        }
                    }
                    // bFlag = await this.processOD(aBOMOD, oUniqueIdData);
                } else {
                    bFlag = true;  // If no Object Dependency exists for current assembly, Quantity of its parent is updated
                }

                if (bFlag === true) {

                    iComQty = aBOMMat[i].COMPONENT_QTY * iQty;

                    if ((aBOMMat[i].PHANTOM_IND).toUpperCase() !== 'X' && aBOMMat[i].CLASS_FLG !== 'X') {

                        // if (aCriticalComp.length > 0) {

                        //     aFilBOMMat = aCriticalComp.filter(function (oCritComp) {
                        //         return oCritComp.ASSEMBLY === aBOMMat[i].MAT_CHILD;
                        //     });
                        // }

                        // Valid From
                        if (new Date(oValidity.VALID_FROM) >= new Date(dValidFrom)) {
                            dValidFrom = oValidity.VALID_FROM;
                        } else {
                            dValidFrom = aBOMMat[i].VALID_FROM;
                        }

                        // Valid To
                        if (new Date(oValidity.VALID_TO) <= new Date(dValidTo)) {
                            dValidTo = oValidity.VALID_TO;
                        } else {
                            dValidTo = aBOMMat[i].VALID_TO;
                        }

                        oBOMUID = {};

                        // if (aFilBOMMat.length > 0) {
                        let iIndex = -1;

                        iIndex = aBOMUID_F.findIndex(el => {
                            return (el.FACTORY_LOC === aBOMMat[i].CHILD_LOC &&
                                el.PRODUCT_ID === oUniqueIdData.PRODUCT_ID &&
                                el.UNIQUE_ID === oUniqueIdData.UNIQUE_ID &&
                                el.ASSEMBLY === aBOMMat[i].MAT_CHILD &&
                                el.VALID_FROM <= dValidFrom &&
                                el.VALID_TO >= dValidTo &&
                                el.ITEM_NUM === aBOMMat[i].COUNTER);
                        });

                        if (iIndex !== -1) {
                            aBOMUID_F[iIndex].ASMB_QTY = aBOMUID_F[iIndex].ASMB_QTY + iComQty;
                        } else {
                            oBOMUID.LOCATION_ID = oUniqueIdData.LOCATION_ID;
                            oBOMUID.FACTORY_LOC = aBOMMat[i].CHILD_LOC;
                            oBOMUID.ASSEMBLY = aBOMMat[i].MAT_CHILD;
                            oBOMUID.UNIQUE_ID = oUniqueIdData.UNIQUE_ID;
                            oBOMUID.PRODUCT_ID = oUniqueIdData.PRODUCT_ID;
                            oBOMUID.ITEM_NUM = aBOMMat[i].COUNTER;
                            // oBOMUID.ITEM_NUM = '000010';
                            oBOMUID.VALID_FROM = aBOMMat[i].VALID_FROM;
                            oBOMUID.VALID_TO = aBOMMat[i].VALID_TO;
                            oBOMUID.RULE_TYPE = 'PI';
                            oBOMUID.REF_PRODID = oUniqueIdData.REF_PRODID;

                            oBOMUID.ASMB_QTY = iComQty;

                            aBOMUID.push(GenF.parse(oBOMUID));
                            // oBOMUID = {};
                        }
                        //}
                    }

                    if (aBOMUID.length > 0) {

                        if (aBOMUID_F.length === 0) {
                            aBOMUID_F = aBOMUID;
                        } else {
                            aBOMUID_F = [...aBOMUID_F, ...aBOMUID];

                        }
                    }
                    if ((aBOMMat[i].PHANTOM_IND).toUpperCase() === 'X' || aBOMMat[i].CLASS_FLG === 'X' || aBOMMat[i].CONFIGURABLE === 'X') {
                        aBOMUID_F = await this.getAssemblyComp(aBOMMat[i].CHILD_LOC, aBOMMat[i].MAT_CHILD, iComQty, oUniqueIdData, aBOMUID_F, oBOMUID);
                    }

                }
            }

        }
        return aBOMUID_F;
    }



    async processOD(aBOMOD, oUniqueIdData) {
        let liODChar = [], aBOM_OD = [];
        let bFlag = false;
        if (aBOMOD.length > 0) {

            aBOM_OD = aBOMOD.map(function (el) { return el.OBJ_DEP });
            aBOM_OD = "'" + aBOM_OD.join("','") + "'";
            GenF.log(aBOM_OD);

            GenF.log(`Tech: Get from CP_BOM_OD CP_BOM_DE using ${aBOMOD[0].LOCATION_ID} ${aBOMOD[0].MAT_PARENT} ${aBOMOD[0].MAT_CHILD}`);
            liODChar = await cds.run(`SELECT
                                        A."MAT_CHILD",
                                        A."OBJ_DEP",                                        
                                        B.DEP_COUNTER,
                                        B.CHAR_NUM,
                                        B.CHAR_COUNTER,
                                        B.CHAR_VAL,
                                        B.OD_CONDITION
                                    FROM "CP_BOM_OD" AS A
                              INNER JOIN "CP_BOM_DEP" AS B
                                      ON A.OBJ_DEP = B.DEPENDENCY
                                WHERE A."LOCATION_ID" = '${aBOMOD[0].LOCATION_ID}'
                                  AND A."MAT_PARENT" = '${aBOMOD[0].MAT_PARENT}'
                                  AND A."MAT_CHILD" = '${aBOMOD[0].MAT_CHILD}'
                                  AND A.OBJ_DEP IN (`+ aBOM_OD + `)
                                    ORDER BY A.OBJ_DEP,
                                             B.DEP_COUNTER,
                                             B.CHAR_COUNTER`);

            let liComponent = [];
            let lsComponent = {};
            let lsODCount = {};
            let lsOD = {};


            if (liODChar.length > 0) {
                for (let cntOD = 0; cntOD < liODChar.length; cntOD++) {
                    if (cntOD === 0) {
                        lsComponent.MAT_CHILD = GenF.parse(liODChar[cntOD].MAT_CHILD);
                        lsComponent.OD = [];
                    }

                    if (cntOD === 0 ||
                        liODChar[cntOD].OBJ_DEP !== liODChar[GenF.subOne(cntOD)].OBJ_DEP) {
                        // let lsOD = {};
                        lsOD = {};
                        lsOD.OBJ_DEP = GenF.parse(liODChar[cntOD].OBJ_DEP);
                        lsOD.COUNTER = [];
                    }


                    if (cntOD === 0 ||
                        liODChar[cntOD].OBJ_DEP !== liODChar[GenF.subOne(cntOD)].OBJ_DEP ||
                        liODChar[cntOD].DEP_COUNTER !== liODChar[GenF.subOne(cntOD)].DEP_COUNTER) {
                        lsODCount = {};
                        lsODCount.DEP_COUNTER = GenF.parse(liODChar[cntOD].DEP_COUNTER);
                        lsODCount.CHAR = [];
                    }
                    let lsChar = {};

                    lsChar.CHAR_NUM = GenF.parse(liODChar[cntOD].CHAR_NUM);
                    lsChar.CHAR_VALUE = GenF.parse(liODChar[cntOD].CHAR_VAL);
                    lsChar.OD_CONDITION = GenF.parse(liODChar[cntOD].OD_CONDITION);
                    lsChar.CHAR_COUNTER = GenF.parse(liODChar[cntOD].CHAR_COUNTER);
                    lsODCount.CHAR.push(lsChar);

                    if (cntOD === GenF.addOne(cntOD, liODChar.length) ||
                        liODChar[cntOD].OBJ_DEP !== liODChar[GenF.addOne(cntOD)].OBJ_DEP ||
                        liODChar[cntOD].DEP_COUNTER !== liODChar[GenF.addOne(cntOD)].DEP_COUNTER) {

                        lsOD.COUNTER.push(lsODCount);
                    }

                    if (cntOD === GenF.addOne(cntOD, liODChar.length) ||
                        liODChar[cntOD].OBJ_DEP !== liODChar[GenF.addOne(cntOD)].OBJ_DEP) {
                        try {
                            lsComponent.OD.push(GenF.parse(lsOD));
                            lsOD = {};
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }


                    if (cntOD === GenF.addOne(cntOD, liODChar.length)) {

                        liComponent.push(GenF.parse(lsComponent));
                        lsComponent = {};

                    }

                }

                for (let cntC = 0; cntC < liComponent.length; cntC++) {
                    const lsComponent = liComponent[cntC];
                    for (let cntOD = 0; cntOD < lsComponent.OD.length; cntOD++) {
                        const lsOD = lsComponent.OD[cntOD];

                        for (let cntODC = 0; cntODC < lsOD.COUNTER.length; cntODC++) {
                            let aCharacteristics = lsOD.COUNTER[cntODC].CHAR.sort((a, b) => a.CHAR_COUNTER - b.CHAR_COUNTER);
                            var aValidList = [];
                            function compareData(a, b) {
                                a.isValid = false;
                                if (a.OD_CONDITION == 'EQ') {
                                    if (a.CHAR_NUM === b.CHAR_NUM && a.CHAR_VALUE === b.CHAR_VALUE) {
                                        a.isValid = true;
                                    }
                                    if ((aValidList.filter(f => f.CHAR_VALUE == a.CHAR_VALUE && f.CHAR_COUNTER == a.CHAR_COUNTER && f.CHAR_NUM == a.CHAR_NUM).length == 0)
                                    ) {
                                        aValidList.push(a);
                                    }
                                    return a.CHAR_NUM === b.CHAR_NUM && a.CHAR_VALUE === b.CHAR_VALUE;
                                }
                                else {
                                    if (a.CHAR_NUM === b.CHAR_NUM && a.CHAR_VALUE !== b.CHAR_VALUE) {
                                        a.isValid = true;
                                    }
                                    if ((aValidList.filter(f => f.CHAR_VALUE == a.CHAR_VALUE && f.CHAR_COUNTER == a.CHAR_COUNTER && f.CHAR_NUM == a.CHAR_NUM).length == 0)
                                    ) {
                                        aValidList.push(a);
                                    }
                                    return a.CHAR_NUM === b.CHAR_NUM && a.CHAR_VALUE !== b.CHAR_VALUE;
                                }
                            }
                            const onlyInLeft = (left, right, compareFunction) =>
                                left.filter(leftValue =>
                                    !right.some(rightValue =>
                                        compareFunction(leftValue, rightValue)));

                            onlyInLeft(aCharacteristics, oUniqueIdData.ITEM, compareData);
                            if (aValidList.length > 0) {
                                var iCounter = 0;
                                let aTempList = [...aValidList]
                                aTempList.forEach(el => {
                                    if (iCounter != el.CHAR_COUNTER) {
                                        iCounter = el.CHAR_COUNTER;
                                        let aFiltered = aValidList.filter(f => f.isValid == true && f.CHAR_COUNTER == iCounter);
                                        if (aFiltered.length > 0) {//setting true for this charcounter
                                            aValidList.forEach(v => {
                                                if (v.CHAR_COUNTER == iCounter) {
                                                    v.isValid = true;
                                                }
                                            })
                                        }
                                    }
                                })
                            }

                            if (aValidList.length > 0 && (aValidList.filter(f => f.isValid == false).length == 0)) {
                                bFlag = true;
                            } else {
                                bFlag = false;
                            }
                        }
                    }
                }

            }
        }

        return bFlag;

    }

    async removeAssembyReq(lLocation, lProduct, lType, lVersion, lScenario) {

        // Remove Existing records
        try {
            await DELETE.from('CP_ASSEMBLY_REQ')
                .where(`LOCATION_ID = '${lLocation}' 
                     AND REF_PRODID = '${lProduct}'
                     AND TYPE = '${lType}'
                     AND VERSION = '${lVersion}'
                     AND SCENARIO = '${lScenario}'`
                )

            GenF.log(`Tech: Deleted from CP_ASSEMBLY_REQ for ${lLocation} ${lProduct} ${lType} ${lVersion} ${lScenario}`);
        }
        catch (err) {
            GenF.log(`Tech: Error occured while deleted from CP_ASSEMBLY_REQ`);
            GenF.log(err.message);
        }

    }

    async getAssemblies(sLocation, sProduct, objData, iQty, aAssembliesF) {
        let aBOMConfig = [];
        let aAssemblies = [], oAssemblies = {};
        let iComQty = 0;

        aBOMConfig = await cds.run(`SELECT DISTINCT  FACTORY_LOC,
                                                     ITEM_NUM,
                                                     MAT_PARENT,
                                                     COMPONENT,
                                                     COMP_QTY,
                                                     CONFIGURABLE,
                                                     PHANTOM_IND,
                                                     CLASS_FLG
                                      FROM V_BOM_CONFIG_PARTIAL_M 
                                     WHERE LOCATION_ID = '${sLocation}'
                                       AND REF_PRODID = '${objData.PRODUCT_ID}'
                                       AND MAT_PARENT = '${sProduct}'`);

        if (aBOMConfig.length > 0) {
            for (let i = 0; i < aBOMConfig.length; i++) {
                aAssemblies = [], oAssemblies = {};
                iComQty = 0;

                iComQty = aBOMConfig[i].COMP_QTY * iQty;

                if ((aBOMConfig[i].PHANTOM_IND).toUpperCase() !== 'X' && aBOMConfig[i].CLASS_FLG !== 'X') {

                    oAssemblies = {};

                    let iIndex = -1;

                    iIndex = aAssembliesF.findIndex(el => {
                        return (el.FACTORY_LOC === aBOMConfig[i].FACTORY_LOC &&
                            el.ITEM_NUM === aBOMConfig[i].ITEM_NUM &&
                            el.MAT_PARENT === aBOMConfig[i].MAT_PARENT &&
                            el.COMPONENT === aBOMConfig[i].COMPONENT
                        );
                    });

                    if (iIndex !== -1) {
                        aAssembliesF[iIndex].COMP_QTY = aAssembliesF[iIndex].COMP_QTY + iComQty;
                    } else {
                        oAssemblies.FACTORY_LOC = aBOMConfig[i].FACTORY_LOC;
                        oAssemblies.MAT_PARENT = aBOMConfig[i].MAT_PARENT;
                        oAssemblies.COMPONENT = aBOMConfig[i].COMPONENT;
                        oAssemblies.ITEM_NUM = aBOMConfig[i].ITEM_NUM;
                        oAssemblies.COMP_QTY = iComQty;

                        aAssemblies.push(GenF.parse(oAssemblies));
                        // oBOMUID = {};
                    }

                }

                if (aAssemblies.length > 0) {

                    if (aAssembliesF.length === 0) {
                        aAssembliesF = aAssemblies;
                    } else {
                        aAssembliesF = [...aAssembliesF, ...aAssemblies];

                    }
                }
                if ((aBOMConfig[i].PHANTOM_IND).toUpperCase() === 'X' || aBOMConfig[i].CLASS_FLG === 'X' || aBOMConfig[i].CONFIGURABLE === 'X') {
                    aAssembliesF = await this.getAssemblies(aBOMConfig[i].FACTORY_LOC, aBOMConfig[i].COMPONENT, objData, iComQty, aAssembliesF);
                }

            }

        }
        return aAssembliesF;
    }
    /** I_VP-2100 - Functions for M1 Process Execution */
        async genBOMUIDMappingM1(impLocation, impProduct, impFull,el) {
        GenF.log(`Tech: Function assembly-req/genBOMUIDMapping`);
        let oResponse = { bError: false, sMessage: '' };
        let aBOMUID_F = [], aBOMData = {}, oBOMData = {};
        let aProdOrdData = [];
        let aUniqueId = {}, aUniqueData = [];
        let bFlag = '';
        let oValidity = { VALID_FROM: '2000-01-01', VALID_TO: '9999-12-31' };
        let interAsmb = 'false';        
        // get config material flag
                let configFlag = await cds.run(`SELECT TOP 1 VALUE from CP_PARAMETER_VALUES WHERE PARAMETER_ID = 25`);
                if(configFlag.length > 0){
                    interAsmb = configFlag[0].VALUE;
                } 
        if (impProduct !== '') {      

               aUniqueData = await cds.run(` SELECT DISTINCT
                                                    V.UNIQUE_ID,
                                                    V.CHAR_NUM,
                                                    V.CHAR_NAME,
                                                    V.CHAR_VALUE,
                                                    V.PRODUCT_ID AS REF_PRODID    
                                                FROM V_UNIQUE_ID_ITEMS AS V                            
                                                WHERE V.PRODUCT_ID = '${impProduct}'                	
                                                  AND V.CHAR_VALUE != 'ZZZZ'
                                                    `);

        }        
        //Get Unique Characteristics Data
        // let aUniqueChar = await cds.run(`SELECT DISTINCT CHAR_NAME,CHAR_VALUE FROM "V_UNIQUE_ID_ITEM" WHERE PRODUCT_ID='${impProduct}'`);
         let aUniqueChar = await cds.run(`SELECT DISTINCT CH.CHAR_NAME,
                                                          CH.CHAR_NUM,
                                                          I.CHAR_VALUE 
                                                    FROM "CP_UNIQUE_ID_ITEM" AS I
                                              INNER JOIN "CP_CHARACTERISTICS" AS CH 
                                                     ON CH.CHAR_NUM = I.CHAR_NUM 
                                              WHERE PRODUCT_ID='${impProduct}'`);
        let oUniqueChar = {};
        for (let u = 0; u < aUniqueChar.length; u++) {
            oUniqueChar[aUniqueChar[u].CHAR_NAME] ??= [];
            oUniqueChar[aUniqueChar[u].CHAR_NAME].push(aUniqueChar[u].CHAR_VALUE);      
        }
        if (aUniqueData.length === 0) {

            // VP-1377 - Handling Assembly Requirements for Non-Configurable Products
            let aProduct = await cds.run(`SELECT PRODUCT_ID
                                            FROM CP_PRODUCT
                                           WHERE PRODUCT_ID = '${impProduct}'
                                             AND NON_CONFIGURABLE = 'X'`);

            if (aProduct.length > 0) {
                aUniqueData.push({
                    LOCATION_ID: impLocation,
                    PRODUCT_ID: impProduct,
                    REF_PRODID: impProduct,
                    UNIQUE_ID: 0,
                    CHAR_NUM: '',
                    CHARVAL_NUM: '',
                    CHAR_VALUE: '',
                    CHAR_NAME: ''
                });
            }

        }
        if (aUniqueData.length > 0) {
            for (let i = 0; i < aUniqueData.length; i++) {
                if (aUniqueId[aUniqueData[i].UNIQUE_ID] === undefined) {
                    aUniqueId[aUniqueData[i].UNIQUE_ID] = [];
                }
                aUniqueId[aUniqueData[i].UNIQUE_ID].push(aUniqueData[i]);
            }

            aBOMData = await this.getBOMMat(impLocation, impProduct);
            aProdOrdData = await this.getProdOrdConsmd(impLocation, impProduct);
        }

        if (aUniqueData.length === 0 || aBOMData[impLocation][impProduct] === undefined) {
            oResponse.sMessage = 'Insufficient data for generating BOM-UID mapping for Product: ' + impProduct;
            GenF.log(oResponse.sMessage);
            return oResponse;
        }
        if(aUniqueData.length>0){
            aUniqueData.forEach(u=>{
                if(isNaN(u.CHAR_VALUE) == false){//If numeric type,remove 0 after decimals
                    u.CHAR_VALUE =  u.CHAR_VALUE.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
                }
            })
        }

       
        
         //Get Procedure Characteristics
        let aPChar = await cds.run(`SELECT * FROM "CP_PROCEDURE_CHAR"`);
        const oPChar = {};
        for(let p = 0; p <aPChar.length; p++){
            oPChar[aPChar[p].CHARACTERISTIC] ??= '';
            oPChar[aPChar[p].CHARACTERISTIC] = aPChar[p].CHAR_TYPE;
        } 
        console.log("Total Unique ids for BOMUID", aUniqueId.length);
        for (const key in aUniqueId) {
            console.log("BOMUIID generation started for UID", aUniqueId[key], new Date());
            aBOMUID_F = await this.getAssemblyComponentsM1(impLocation, impProduct, impProduct, 1, aBOMData, oBOMData, aUniqueId[key], aBOMUID_F, oValidity, aProdOrdData, oUniqueChar,interAsmb,oPChar,impLocation);
            // console.log(aUniqueId[key]);
            console.log("BOMUIID generation completed for UID", aUniqueId[key], new Date());
            if (aBOMUID_F.length > 0) {
                try {
                    GenF.log(`Deleting from BOM UID for Unique ID: ${aUniqueId[key][0].UNIQUE_ID}`);
                    await cds.run(
                        `DELETE FROM CP_BOM_UID WHERE UNIQUE_ID = '${aUniqueId[key][0].UNIQUE_ID}' 
                                                                  AND RULE_TYPE = 'PI'  AND REF_PRODID='${impProduct}' AND PRODUCT_ID='${el}' `
                    );
                    GenF.log(`Tech: Create a records into CP_BOM_UID. Records count: ${aBOMUID_F.length}`);
                    // await cds.run({
                    //     INSERT:
                    //     {
                    //         into: { ref: ['CP_BOM_UID'] },
                    //         entries: aBOMUID_F
                    //     }
                    // });
                    let cqnQuery = { UPSERT: { into: { ref: ['CP_BOM_UID'] }, entries: aBOMUID_F } };
                        try {
                            await cds.run(cqnQuery);
                        } catch (e) {
                            console.log('Error');
                        }
                    console.log('BOM-UID mapping generated successfully for Product: ' + el);
                    bFlag = 'X';
                    // counter = counter + 1;
                } catch (e) {
                    console.log(e);
                }
                aBOMUID_F = [];
            }
        }
        if (bFlag === 'X') {
            // oResponse.sMessage = 'BOM-UID mapping generated successfully for Product: ' + impProduct;
            oResponse.sMessage = 'BOM-UID mapping generated successfully for Product: ' + el;
        } else {
            oResponse.bError = true;
            // oResponse.sMessage = 'BOM-UID mapping generation failed for Product:' + impProduct;
            oResponse.sMessage = 'BOM-UID mapping generation failed for Product:' + el;
        }
        GenF.log(oResponse.sMessage);
        await this.genRTRUIDMapping(impLocation, impProduct)
        return oResponse;
    }

    async getAssemblyComponentsM1(sLocation, sProduct, sParentProduct, iQty, aBOMData, oBOMData, aUniqueIdLine, aBOMUID_F, oValidity, aProdOrdData, oUniqueChar,interAsmb,oPChar,sMainLocation) {
        let aBOMDep = {};
        if (aBOMData[sLocation] && aBOMData[sLocation][sProduct]) {
            for (let i = 0; i < aBOMData[sLocation][sProduct].length; i++) {
                let bFlag = false; var iCompQty = 0;
                let aBOMUID = [], oBOMUID = {};
                const aBOMLine = aBOMData[sLocation][sProduct][i];
                let dValidFrom = aBOMLine.VALID_FROM,
                    dValidTo = aBOMLine.VALID_TO;
                let aBOMDepData = [];
                var bProcedure = false;

                // Check if Production Order exists for Assembly
                if (aProdOrdData) {
                    let aProdOrdLine = aProdOrdData[aUniqueIdLine.UNIQUE_ID];
                    if (aProdOrdLine?.length > 0) {
                        let iIndex = aProdOrdLine.findIndex(e => e.COMPONENT === aBOMLine.MAT_CHILD
                            && e.COMP_LOC === aBOMLine.CHILD_LOC
                            && e.MAT_PARENT === sProduct
                            && e.LOCATION_ID === sLocation);
                        if (iIndex > -1) {
                            bFlag = true;
                        } else {
                            bFlag = false;
                        }
                    }
                }
                if (bFlag === false) {
                    aBOMDepData = await cds.run(`SELECT 
                        	"DEPENDENCY",
	                        "LINE_NO",
                           ' ' || "LINE" || ' ' AS "LINE",
	                        "DEPENDENCY_TYPE"
                            FROM CP_BOM_OD_DEP
                            WHERE (DEPENDENCY IN (SELECT DISTINCT OBJ_DEP
                                                    FROM CP_BOM_OD
                                                    WHERE LOCATION_ID = '${sLocation}'
                                                    AND COUNTER = '${aBOMLine.COUNTER}'
                                                    AND MAT_PARENT = '${sProduct}'
                                                    AND MAT_CHILD = '${aBOMLine.MAT_CHILD}'))
                             AND (DEPENDENCY_TYPE = 'S' OR DEPENDENCY_TYPE = 'P')
                             ORDER BY DEPENDENCY, 
                                      LINE_NO ASC`);
                }
                if (aBOMDepData.length > 0) {
                    for (let j = 0; j < aBOMDepData.length; j++) {
                        if (aBOMDep[aBOMDepData[j].DEPENDENCY] === undefined) {
                            aBOMDep[aBOMDepData[j].DEPENDENCY] = [];
                        }
                        aBOMDep[aBOMDepData[j].DEPENDENCY].push(aBOMDepData[j])
                    }
                    aBOMDepData = [];
                    for (const k in aBOMDep) {
                        if (aBOMDep[k].length > 0) {
                            //Dependency Type S
                            let aDependencyS = aBOMDep[k].filter(f=>f.DEPENDENCY_TYPE == 'S');
                            if(aDependencyS.length>0){
                                bFlag = await procsObj.processDependencyM1(aDependencyS, aUniqueIdLine, oUniqueChar,'S',sProduct, sLocation)
                            }
                            if(bFlag == true){
                                console.log("")
                            }
                            //check Depdency type P if aDependencyS does not exists or aDependencyS exists and bFlag is true
                            if(aDependencyS.length == 0 || (aDependencyS.length >0 && bFlag == true)){
                                 let aDependencyP = aBOMDep[k].filter(f=>f.DEPENDENCY_TYPE == 'P');
                                 if(aDependencyP.length >0){
                                let oResponse = await procsObj.processProcedureM1(aDependencyP, aUniqueIdLine, oUniqueChar,oPChar,aBOMLine.COMPONENT_QTY,sProduct, sLocation); 
                                  bFlag = oResponse.bFlag;
                                 bProcedure = bFlag;
                                if(bFlag == true){
                                 aBOMLine.COMPONENT_QTY =  oResponse.Quantity;     
                               } 
                                 }
                            }
                           
                        }
                        if (bFlag === true) {
                            break;
                        }
                    }
                    aBOMDep = {};
                }
                else {
                    bFlag = true;// If no Object Dependency exists for current assembly, Quantity of its parent is updated
                }
                if (bFlag === true) {
                    if(bProcedure == false){
                    iCompQty = aBOMLine.COMPONENT_QTY * iQty;
                    }
                    else{
                        iCompQty = aBOMLine.COMPONENT_QTY;
                    }
                

                    // if ((aBOMLine.PHANTOM_IND).toUpperCase() !== 'X'
                    //     && aBOMLine.CLASS_FLG !== 'X') {
                    // if(interAsmb == 'false' && aBOMLine.CLASS_FLG !== 'X'){
                    if(aBOMLine.CLASS_FLG !== 'X'){
                        // Valid From
                        if (new Date(oValidity.VALID_FROM) >= new Date(dValidFrom)) {
                            dValidFrom = oValidity.VALID_FROM;
                        } else {
                            dValidFrom = aBOMLine.VALID_FROM;
                        }

                        // Valid To
                        if (new Date(oValidity.VALID_TO) <= new Date(dValidTo)) {
                            dValidTo = oValidity.VALID_TO;
                        } else {
                            dValidTo = aBOMLine.VALID_TO;
                        }

                        oBOMUID = {};

                        // if (aFilBOMMat.length > 0) {
                        let iIndex = -1;

                        iIndex = aBOMUID_F.findIndex(el => {
                            return (el.FACTORY_LOC === aBOMLine.CHILD_LOC &&
                                el.PRODUCT_ID === aUniqueIdLine[0].PRODUCT_ID &&
                                el.UNIQUE_ID === aUniqueIdLine[0].UNIQUE_ID &&
                                el.ASSEMBLY === aBOMLine.MAT_CHILD &&
                                el.VALID_FROM <= dValidFrom &&
                                el.VALID_TO >= dValidTo &&
                                el.ITEM_NUM === aBOMLine.COUNTER);
                        });

                        if (iIndex !== -1) {
                            aBOMUID_F[iIndex].ASMB_QTY = aBOMUID_F[iIndex].ASMB_QTY + iCompQty;
                        } else {
                            // oBOMUID.LOCATION_ID = aUniqueIdLine[0].LOCATION_ID;
                            oBOMUID.LOCATION_ID = sMainLocation;
                            oBOMUID.FACTORY_LOC = aBOMLine.CHILD_LOC;
                            oBOMUID.ASSEMBLY = aBOMLine.MAT_CHILD;
                            oBOMUID.UNIQUE_ID = aUniqueIdLine[0].UNIQUE_ID;
                            oBOMUID.PRODUCT_ID = aUniqueIdLine[0].PRODUCT_ID;
                            oBOMUID.ITEM_NUM = aBOMLine.COUNTER;
                            oBOMUID.VALID_FROM = aBOMLine.VALID_FROM;
                            oBOMUID.VALID_TO = aBOMLine.VALID_TO;
                            oBOMUID.RULE_TYPE = 'PI';
                            oBOMUID.REF_PRODID = aUniqueIdLine[0].REF_PRODID; // aUniqueIdLine[0].PRODUCT_ID;
                            oBOMUID.ASMB_QTY = iCompQty;

                            aBOMUID.push(GenF.parse(oBOMUID));
                            // oBOMUID = {};
                        }
                        //}
                    }
                    if (aBOMUID.length > 0) {
                        if (aBOMLine.CONFIGURABLE == 'X' || aBOMLine.PHANTOM_IND == 'X') {
                            if (interAsmb == 'true') {
                                if (aBOMUID_F.length === 0) {
                                    aBOMUID_F = aBOMUID;
                                } else {
                                    aBOMUID_F = [...aBOMUID_F, ...aBOMUID];

                                }
                            }

                        } else {
                            if (aBOMUID_F.length === 0) {
                                aBOMUID_F = aBOMUID;
                            } else {
                                aBOMUID_F = [...aBOMUID_F, ...aBOMUID];

                            }
                        }
                    }
                    if ((aBOMLine.PHANTOM_IND).toUpperCase() === 'X' || aBOMLine.CLASS_FLG === 'X' || aBOMLine.CONFIGURABLE === 'X') {
                        aBOMUID_F = await this.getAssemblyComponentsM1(aBOMLine.CHILD_LOC, aBOMLine.MAT_CHILD, sParentProduct, iCompQty, aBOMData, oBOMUID, aUniqueIdLine, aBOMUID_F, oValidity, aProdOrdData, oUniqueChar,interAsmb,oPChar,sMainLocation);
                    }
                }
            }
        }
        return aBOMUID_F
    }

    async updateBOMUIDForNonConfigProduct() {

    }




}

module.exports = AssemblyReq;