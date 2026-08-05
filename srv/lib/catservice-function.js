const cds = require("@sap/cds");
const hana = require("@sap/hana-client");
const { createLogger, format, transports, Logform } = require("winston");
const { combine, timestamp, label, prettyPrint } = format;
const GenF = require("./gen-functions");
const DerivedConfig = require("./derivedchars-functions");

class Catservicefn {
    constructor() {

    }

    /**
     * Generate Unique ID
     * @param {Data} adata
     * @param {Flag} lFlag 
     */
    //Change Active status
    // async maintainUniqueHeader(lFlag, adata) {
    //     let liresults = [];
    //     let lsresults = {};
    //     var responseMessage;
    //     let vFlag;
    //     //OLD with location ID
    //     // const li_uniquedata = await cds.run(
    //     //     `SELECT *
    //     //     FROM "CP_UNIQUE_ID_HEADER"
    //     //     WHERE "LOCATION_ID" = '` +
    //     //     adata.LOCATION_ID +
    //     //     `' ORDER BY UNIQUE_ID DESC`
    //     // );
    //     const li_uniquedata = await cds.run(
    //         `SELECT *
    //         FROM "CP_UNIQUE_ID_HEADER"
    //          ORDER BY UNIQUE_ID DESC`
    //     );
    //     if (lFlag === 'E') {// Active status change
    //         // lsresults.LOCATION_ID = adata.LOCATION_ID;
    //         lsresults.PRODUCT_ID = adata.PRODUCT_ID;
    //         lsresults.UNIQUE_ID = parseInt(adata.UNIQUE_ID);
    //         lsresults.UNIQUE_DESC = adata.UNIQUE_DESC;//li_unique[0].UNIQUE_DESC;
    //         lsresults.UID_TYPE = 'U';//li_unique[0].UID_TYPE;
    //         if (adata.ACTIVE === 'X') {
    //             lsresults.ACTIVE = Boolean(false);
    //         }
    //         else {
    //             lsresults.ACTIVE = Boolean(true);
    //         }
    //         liresults.push(lsresults);
    //         try {
    //             await UPDATE`CP_UNIQUE_ID_HEADER`
    //                 .with({
    //                     UNIQUE_DESC: lsresults.UNIQUE_DESC
    //                 })
    //                 .where(`PRODUCT_ID = '${lsresults.PRODUCT_ID}'
    //                         AND UNIQUE_ID = '${lsresults.UNIQUE_ID}'`);
    //             vFlag = 'X';
    //         } catch (e) {
    //             vFlag = '';
    //             //DONOTHING
    //         }
    //     }
    //     else if (lFlag === 'C' || lFlag === 'N' || lFlag === 'B') {
    //         var bReplaceFlag = false;
    //         var aUniqueList = [];
    //         if (adata.header) {//
    //             aUniqueList = await cds.run(
    //                 `SELECT * FROM "CP_UNIQUE_ID_HEADER" 
    //                 WHERE "PRODUCT_ID" = '${adata.PRODUCT_ID}'
    //                 `
    //             )
    //             bReplaceFlag = true;
    //         }
    //         // lsresults.LOCATION_ID = adata.LOCATION_ID;
    //         lsresults.PRODUCT_ID = adata.PRODUCT_ID;
    //         if (li_uniquedata.length > 0) {
    //             lsresults.UNIQUE_ID = parseInt(li_uniquedata[0].UNIQUE_ID) + 1;
    //         }
    //         else {
    //             lsresults.UNIQUE_ID = parseInt("01");
    //         }
    //         lsresults.UNIQUE_DESC = adata.UNIQUE_DESC;
    //         lsresults.UID_TYPE = 'U';
    //         lsresults.ACTIVE = Boolean(true);
    //         lsresults.EX_IDENTIFICATION = adata.externalIdentification;
    //         lsresults.VALID_FROM = (!adata.validFrom)?'2000-01-01' : adata.validFrom;
    //         lsresults.VALID_TO = (!adata.validTo)?'9999-12-30' : adata.validTo; 
    //         liresults.push(lsresults);




    //         if (liresults.length > 0) {
    //             try {
    //                 if (bReplaceFlag == false) {
    //                     await cds.run(INSERT.into("CP_UNIQUE_ID_HEADER").entries(liresults));
    //                     vFlag = lsresults.UNIQUE_ID;
    //                 }
    //                 else {//Update the identification number,Valid From and Valid To for uniqueID
    //                     await UPDATE`CP_UNIQUE_ID_HEADER`
    //                         .with({
    //                             EX_IDENTIFICATION: adata.externalIdentification,
    //                             VALID_FROM:(adata.VALID_FROM == ''||adata.VALID_FROM ==null || adata.VALID_FROM == undefined)?'2000-01-01' : adata.validFrom,
    //                             VALID_TO:(adata.VALID_TO == ''||adata.VALID_TO ==null || adata.VALID_TO == undefined)?'9999-12-30' : adata.validTo,
    //                             UNIQUE_DESC: aData.UNIQUE_DESC
    //                         })
    //                         .where(`UNIQUE_ID = '${adata.UNIQUE_ID}' AND PRODUCT_ID = '${adata.PRODUCT_ID}'`)
    //                     vFlag = 'U';
    //                 }
    //             }
    //             catch (e) {
    //                 vFlag = '';
    //                 console.log(e);
    //             }
    //         }
    //     }
    //     return vFlag;
    // }

    async getAllProducts(adata) {
        let lsprod = {};
        let liprod = [];

        const lipartialprod = await cds.run(
            `
         SELECT PRODUCT_ID,
                LOCATION_ID,
                PROD_DESC,
                REF_PRODID
           FROM "CP_PARTIALPROD_INTRO"
           WHERE LOCATION_ID = '`+ adata.LOCATION_ID + `'
           ORDER BY REF_PRODID`);

        for (let iPartial = 0; iPartial < lipartialprod.length; iPartial++) {
            lsprod.LOCATION_ID = lipartialprod[iPartial].LOCATION_ID;
            lsprod.PRODUCT_ID = lipartialprod[iPartial].PRODUCT_ID;
            lsprod.PROD_DESC = lipartialprod[iPartial].PROD_DESC;
            liprod.push(lsprod);
            lsprod = {};
        }
        return liprod;
    }
    async getProductsInSales(adata) {
        let lsprod = {};
        let liprod = [];

        const lipartialprod = await cds.run(
            `SELECT DISTINCT A.PRODUCT_ID,
                A.LOCATION_ID,
                A.PROD_DESC,
                A.REF_PRODID
           FROM "CP_PARTIALPROD_INTRO" AS A
           INNER JOIN "CP_SALESH" AS B
           ON A.LOCATION_ID = B.LOCATION_ID
           AND A.REF_PRODID = B.PRODUCT_ID
            WHERE A.LOCATION_ID = '`+ adata.LOCATION_ID + `'
           ORDER BY REF_PRODID`);

        for (let iPartial = 0; iPartial < lipartialprod.length; iPartial++) {
            lsprod.LOCATION_ID = lipartialprod[iPartial].LOCATION_ID;
            lsprod.PRODUCT_ID = lipartialprod[iPartial].PRODUCT_ID;
            lsprod.PROD_DESC = lipartialprod[iPartial].PROD_DESC;
            liprod.push(lsprod);
            lsprod = {};
        }
        return liprod;
    }


    async getAllProductsMulti(adata) {
        let lsprod = {};
        let liprod = [];
        let query = '';
        let lipartialprod = [];


        adata.forEach((el, i) => {
            if (i == 0) {
                query = `SELECT PRODUCT_ID,
                            LOCATION_ID,
                            PROD_DESC,
                            REF_PRODID
                    FROM "CP_PARTIALPROD_INTRO"
                    WHERE LOCATION_ID = '`+ el + `'`;
            }
            else {
                query = query + `
                        OR "LOCATION_ID" = '` + el + `'`;
            }
        })
        query = query + ` ORDER BY REF_PRODID`;

        if (query !== '') {
            lipartialprod = await cds.run(query);
        }


        // const lipartialprod = await cds.run(
        //     `
        //  SELECT PRODUCT_ID,
        //         LOCATION_ID,
        //         PROD_DESC,
        //         REF_PRODID
        //    FROM "CP_PARTIALPROD_INTRO"
        //    WHERE LOCATION_ID = '`+ adata.LOCATION_ID + `'
        //    ORDER BY REF_PRODID`);

        for (let iPartial = 0; iPartial < lipartialprod.length; iPartial++) {
            lsprod.LOCATION_ID = lipartialprod[iPartial].LOCATION_ID;
            lsprod.PRODUCT_ID = lipartialprod[iPartial].PRODUCT_ID;
            lsprod.PROD_DESC = lipartialprod[iPartial].PROD_DESC;
            liprod.push(lsprod);
            lsprod = {};
        }
        return liprod;
    }

    async getAllProdAsmbComp(req) {
        let lsprod = {},
            lsasmb = {},
            lscomp = {};
        let liprod = [];

        const lipartialprod = await cds.run(
            `
             SELECT distinct B.PRODUCT_ID,
             B.PROD_DESC,
             B.REF_PRODID,
             A.PROD_FAMILY,
             A.PROD_GROUP,
             A.PROD_MODEL,
             A.PROD_MDLRANGE,
             A.PROD_SERIES,
             B.PROD_TYPE,
             A.RESERVE_FIELD1,  
             A.RESERVE_FIELD2,  
             A.RESERVE_FIELD3,
              A.RESERVE_FIELD4,
             A.RESERVE_FIELD5,
             A.AUTH_GROUP         
               FROM "CP_PARTIALPROD_INTRO" AS B
               INNER JOIN "CP_PRODUCT" AS A
               ON A.PRODUCT_ID = B.REF_PRODID 
                INNER JOIN "V_FACTORYLOC" AS C
                 on B.REF_PRODID = C.REF_PRODID            `);

        // const liAssembly = await cds.run(
        //     `
        //      SELECT DISTINCT 
        //             V_BOM_DEMDFACLOC.COMPONENT AS PRODUCT_ID,
        //             V_BOM_DEMDFACLOC.COMP_TYPE,
        //             V_BOM_DEMDFACLOC.COMP_DESC
        //       FROM "V_BOM_DEMDFACLOC"`);

        const liAssembly = await cds.run(`
            SELECT DISTINCT A.CHILD_LOC as LOCATION_ID,
                            C.LOCATION_DESC,
                            A.MAT_CHILD as PRODUCT_ID,
                            A.PROD_DESC,
                            A.COMP_TYPE,
                            A.COMPONENT_QTY as COMP_QTY,
                            A.VALID_FROM,
                            A.VALID_TO,  
                            A.CRITICAL_ASM
					FROM "CP_BOM_MAT" AS A
					 INNER JOIN "CP_LOCATION" AS C 
					 ON C.LOCATION_ID = A.CHILD_LOC
					WHERE A.CLASS_FLG != 'X'`);

        const liComp = await cds.run(
            `             
            SELECT DISTINCT 
                    V_COMP_DEMDFACLOC.COMPONENT AS PRODUCT_ID,
                    V_COMP_DEMDFACLOC.COMP_TYPE,
                    V_COMP_DEMDFACLOC.COMP_DESC
               FROM "V_COMP_DEMDFACLOC"
               ORDER BY V_COMP_DEMDFACLOC.COMPONENT`);


        //    V_COMP_DEMDFACLOC.PROD_DESC,
        for (let iPartial = 0; iPartial < lipartialprod.length; iPartial++) {
            // lsprod.LOCATION_ID = lipartialprod[iPartial].LOCATION_ID;
            lsprod.PRODUCT_ID = lipartialprod[iPartial].PRODUCT_ID;
             // lsprod.PROD_DESC = liAssembly[iAsm].COMP_DESC;
            lsprod.PROD_DESC = lipartialprod[iPartial].PROD_DESC;
            lsprod.PROD_FAMILY = lipartialprod[iPartial].PROD_FAMILY;
            lsprod.PROD_GROUP = lipartialprod[iPartial].PROD_GROUP;
            lsprod.PROD_MODEL = lipartialprod[iPartial].PROD_MODEL;
            lsprod.PROD_MDLRANGE = lipartialprod[iPartial].PROD_MDLRANGE;
            lsprod.PROD_SERIES = lipartialprod[iPartial].PROD_SERIES;
            lsprod.PROD_TYPE = lipartialprod[iPartial].PROD_TYPE;
            lsprod.RESERVE_FIELD1 = lipartialprod[iPartial].RESERVE_FIELD1;
            lsprod.RESERVE_FIELD2 = lipartialprod[iPartial].RESERVE_FIELD2;
            lsprod.RESERVE_FIELD3 = lipartialprod[iPartial].RESERVE_FIELD3;
            lsprod.RESERVE_FIELD4 = lipartialprod[iPartial].RESERVE_FIELD4;
            lsprod.RESERVE_FIELD5 = lipartialprod[iPartial].RESERVE_FIELD5;
            liprod.push(lsprod);
            lsprod = {};
        }

        for (let iAsm = 0; iAsm < liAssembly.length; iAsm++) {
            // lsprod.LOCATION_ID = liAssembly[iAsm].LOCATION_ID;
            lsprod.PRODUCT_ID = liAssembly[iAsm].PRODUCT_ID;
            // lsprod.PROD_DESC = liAssembly[iAsm].COMP_DESC;
            lsprod.PROD_DESC = liAssembly[iAsm].PROD_DESC;
            lsprod.PROD_FAMILY = '';
            lsprod.PROD_GROUP = '';
            lsprod.PROD_MODEL = '';
            lsprod.PROD_MDLRANGE = '';
            lsprod.PROD_SERIES = '';
            lsprod.PROD_TYPE = liAssembly[iAsm].COMP_TYPE;
            lsprod.RESERVE_FIELD1 = '';
            lsprod.RESERVE_FIELD2 = '';
            lsprod.RESERVE_FIELD3 = '';
            lsprod.RESERVE_FIELD4 = '';
            lsprod.RESERVE_FIELD5 = '';
            liprod.push(lsprod);
            lsprod = {};
        }
        for (let iCmp = 0; iCmp < liComp.length; iCmp++) {
            // lsprod.LOCATION_ID = liComp[iCmp].LOCATION_ID;
            lsprod.PRODUCT_ID = liComp[iCmp].PRODUCT_ID;
            lsprod.PROD_DESC = liComp[iCmp].COMP_DESC;
            lsprod.PROD_FAMILY = '';
            lsprod.PROD_GROUP = '';
            lsprod.PROD_MODEL = '';
            lsprod.PROD_MDLRANGE = '';
            lsprod.PROD_SERIES = '';
            lsprod.PROD_TYPE = liComp[iCmp].COMP_TYPE;
            lsprod.RESERVE_FIELD1 = '';
            lsprod.RESERVE_FIELD2 = '';
            lsprod.RESERVE_FIELD3 = '';
            lsprod.RESERVE_FIELD4 = '';
            lsprod.RESERVE_FIELD5 = '';
            liprod.push(lsprod);
            lsprod = {};
        }
        return liprod;
    }
    /**
     * 
     * @param {Flag} lFlagAll 
     */
    async deleteSalesHistory(lFlagAll) {
        let liSalesData = [], liSalesDataTemp = [];
        // Fetch History weeks
        const liValue = await SELECT.one
            .from("CP_PARAMETER_VALUES")
            .columns("VALUE")
            .where(`PARAMETER_ID = 4`);

        // Get Date from which history data needs to be deleted
        let vFromDate = new Date();
        vFromDate = vFromDate.setDate(vFromDate.getDate() - (parseInt(liValue) * 7));

        const liSalesDataAll = await cds.run(
            `SELECT *
             FROM CP_SALESH
             ORDER BY SALES_DOC,
                     SALESDOC_ITEM`);
        // Filter data belwo the histry horizon
        let result = liSalesDataAll.reduce((r, o) => {
            r[o.MAT_AVAILDATE < '${vFromDate}' ? 'liSalesData' : 'liSalesDataTemp'].push(o);
            return r;
        }, { liSalesData: [], liSalesDataTemp: [] });

        if (lFlagAll === 'X') {
            // Delete history data before history horizon
            for (let iIndexA = 0; iIndexA < liSalesDataAll.length; iIndexA++) {
                // sales history config tables
                try {
                    await cds.run(
                        `DELETE FROM CP_SALES_HM
             WHERE SALES_DOC   = '` + liSalesDataAll[iIndexA].SALES_DOC + `'
                 AND SALESDOC_ITEM    = '` + liSalesDataAll[iIndexA].SALESDOC_ITEM + `'`
                    );
                }
                catch (e) {
                    console.log(" Unable to delete from SalesHM")
                }

                // sales history config tables
                try {
                    await cds.run(
                        `DELETE FROM CP_SALESH_CONFIG
                 WHERE SALES_DOC   = '` + liSalesDataAll[iIndexA].SALES_DOC + `'
                     AND SALESDOC_ITEM    = '` + liSalesDataAll[iIndexA].SALESDOC_ITEM + `'`
                    );
                }
                catch (e) {
                    console.log(" Unable to delete from Sales config")
                }
            }

            // Sales History
            try {
                await cds.run(
                    `DELETE FROM CP_SALESH`
                );
            }
            catch (e) {
                console.log(" Unable to delete from Sales History")
            }
        }
        // Delete history horizon
        else {
            // Delete history data before history horizon
            for (let iIndex = 0; iIndex < liSalesData.length; iIndex++) {
                // sales history config tables
                try {
                    await cds.run(
                        `DELETE FROM CP_SALES_HM
             WHERE SALES_DOC   = '` + liSalesData[iIndex].SALES_DOC + `'
                 AND SALESDOC_ITEM    = '` + liSalesData[iIndex].SALESDOC_ITEM + `'`
                    );
                }
                catch (e) {
                    console.log(" Unable to delete from SalesHM")
                }

                // sales history config tables
                try {
                    await cds.run(
                        `DELETE FROM CP_SALESH_CONFIG
                 WHERE SALES_DOC   = '` + liSalesData[iIndex].SALES_DOC + `'
                     AND SALESDOC_ITEM    = '` + liSalesData[iIndex].SALESDOC_ITEM + `'`
                    );
                }
                catch (e) {
                    console.log(" Unable to delete from Sales config")
                }
            }

            // Sales History
            try {
                await cds.run(
                    `DELETE FROM CP_SALESH
                                 WHERE MAT_AVAILDATE   < '` + vFromDate + `'`
                );
            }
            catch (e) {
                console.log(" Unable to delete from Sales History")
            }
            try {
                await cds.run(
                    `DELETE FROM CP_SEEDORDER_HEADER
                                 WHERE MAT_AVAILDATE   < '` + vFromDate + `'`
                );
            }
            catch (e) {
                console.log(" Unable to delete from Sales History")
            }
        }
    }
    /**
     * 
     * @param {Request} req 
     */
    async updateGlobalConfigNewLoc(req) {
        let loResults = {}, loNewLocCnfg = {};
        let laResults = [], laNewLocCnfg = [];
        let laPlannedParameters = [];   // To check for missing location
        let laNewLocation = [];
        let laLocations = await cds.run(`SELECT * FROM CP_LOCATION`);
        let laPlandParamValues = await cds.run(` SELECT * 
                                                     FROM CP_PARAMETER_VALUES
                                                     WHERE PARAMETER_ID IN(6,7,8,10,14)` );

        const keys = ['PARAMETER_ID'];

        if (laPlandParamValues.length > 0) {
            laPlannedParameters = laPlandParamValues;

            laPlandParamValues.sort(GenF.dynamicSortMultiple("PARAMETER_ID"));
            laPlandParamValues = GenF.removeDuplicate(laPlandParamValues, keys);


            for (let i = 0; i < laPlandParamValues.length; i++) {

                switch (laPlandParamValues[i].PARAMETER_ID) {
                    case 6:
                        loResults.SEEDORDSEQ = laPlandParamValues[i].VALUE;
                        break;
                    case 7:
                        loResults.SOPREFIX = laPlandParamValues[i].VALUE;
                        break;
                    case 8:
                        loResults.IBPPLANAREA = laPlandParamValues[i].VALUE;
                        break;
                    case 10:
                        loResults.IBPPREFIX = laPlandParamValues[i].VALUE;
                        break;
                    case 14:
                        loResults.IDENTIFY_RULE_VALIDITY = laPlandParamValues[i].VALUE;
                        break;
                }
            }

            if (loResults) {
                // Insert Parameter for IBP config
                for (let iLoc = 0; iLoc < laLocations.length; iLoc++) {

                    // Check if parameter values are already maintained for location
                    laNewLocation = laPlannedParameters.filter(function (aLoc) {
                        return aLoc.LOCATION_ID === laLocations[iLoc].LOCATION_ID;
                    });

                    if (laNewLocation.length === 0) {
                        // Seed Order Sequence
                        loNewLocCnfg.LOCATION_ID = laLocations[iLoc].LOCATION_ID;
                        loNewLocCnfg.PARAMETER_ID = 6;
                        loNewLocCnfg.VALUE = loResults.SEEDORDSEQ;
                        laNewLocCnfg.push(GenF.parse(loNewLocCnfg));
                        loNewLocCnfg = {};

                        // Seed Order Prefix
                        loNewLocCnfg.LOCATION_ID = laLocations[iLoc].LOCATION_ID;
                        loNewLocCnfg.PARAMETER_ID = 7;
                        loNewLocCnfg.VALUE = loResults.SOPREFIX;
                        laNewLocCnfg.push(GenF.parse(loNewLocCnfg));
                        loNewLocCnfg = {};

                        loNewLocCnfg.LOCATION_ID = laLocations[iLoc].LOCATION_ID;
                        loNewLocCnfg.PARAMETER_ID = 8;
                        loNewLocCnfg.VALUE = loResults.IBPPLANAREA;
                        laNewLocCnfg.push(GenF.parse(loNewLocCnfg));
                        loNewLocCnfg = {};

                        loNewLocCnfg.LOCATION_ID = laLocations[iLoc].LOCATION_ID;
                        loNewLocCnfg.PARAMETER_ID = 10;
                        loNewLocCnfg.VALUE = loResults.IBPPREFIX;
                        laNewLocCnfg.push(GenF.parse(loNewLocCnfg));
                        loNewLocCnfg = {};


                        if (loResults.IDENTIFY_RULE_VALIDITY === '' || loResults.IDENTIFY_RULE_VALIDITY === undefined) {
                            loResults.IDENTIFY_RULE_VALIDITY = 'false';
                        }
                        loNewLocCnfg.LOCATION_ID = laLocations[iLoc].LOCATION_ID;
                        loNewLocCnfg.PARAMETER_ID = 14;
                        loNewLocCnfg.VALUE = loResults.IDENTIFY_RULE_VALIDITY;
                        laNewLocCnfg.push(GenF.parse(loNewLocCnfg));
                        loNewLocCnfg = {};
                    }

                }
            }
            if (laNewLocCnfg.length > 0) {
                try {
                    await cds.run(INSERT.into("CP_PARAMETER_VALUES").entries(laNewLocCnfg));
                }
                catch (error) {
                    console.log(error);
                }
            }

        }
    }
    /**
     * 
     * @param {Request} req 
     */
    async getAsmbUIDPartial(req) {

        let liChar = [];
        let lsChar = {};
        let liAsmbUID = [];
        let lsAsmbUID = {};
        let vUIDLength = 0;
        const liAssembly = await cds.run(
            `SELECT DISTINCT CP_ASSEMBLY_COMP.LOCATION_ID,   
                             CP_BOMHEADER.PRODUCT_ID,                                                     
                             CP_ASSEMBLY_COMP.ASSEMBLY,
                             CP_ASSEMBLY_COMP.COMP_QTY,
                             CP_BOMHEADER.COMP_DESC AS ASSEMBLY_DESC
                        FROM CP_ASSEMBLY_COMP
                        INNER JOIN CP_BOMHEADER
                           ON CP_ASSEMBLY_COMP.LOCATION_ID = CP_BOMHEADER.LOCATION_ID
                          AND CP_ASSEMBLY_COMP.ASSEMBLY = CP_BOMHEADER.COMPONENT
                       WHERE CP_ASSEMBLY_COMP.COMPONENT    = '${req.data.COMPONENT}'
                         AND CP_ASSEMBLY_COMP.LOCATION_ID   = '${req.data.LOCATION_ID}'
                    ORDER BY CP_ASSEMBLY_COMP.LOCATION_ID ASC,   
                             CP_BOMHEADER.PRODUCT_ID ASC,                                                    
                             CP_ASSEMBLY_COMP.ASSEMBLY ASC`);

        const liLocProdDesc = await cds.run(
            `SELECT * 
                    from V_PARTIALPRODDESC`
        );

        /***********************
         * 
         */
        const liCIRData = await cds.run(`
        SELECT
            "PRODUCT_ID",
            "WEEK_DATE",
            "MODEL_VERSION",
            "VERSION",
            "SCENARIO",
            "UNIQUE_ID",
            SUM("CIR_QTY") AS CIR_QTY
        FROM "CP_CIR_GENERATED"
        WHERE LOCATION_ID IN ( SELECT DISTINCT LOCATION_ID FROM CP_FACTORY_SALESLOC WHERE FACTORY_LOC = '${req.data.LOCATION_ID}' )
         AND WEEK_DATE = '${req.data.WEEK_DATE}'
         AND VERSION = '${req.data.VERSION}'
         AND SCENARIO = '${req.data.SCENARIO}'
         AND MODEL_VERSION = 'Active'
        GROUP BY 
            "PRODUCT_ID",
            "WEEK_DATE",
            "MODEL_VERSION",
            "VERSION",
            "SCENARIO",
            "UNIQUE_ID"
        `);
        // Sales Qty
        const liSalesQty = await cds.run(`SELECT 
            "UNIQUE_ID",
            "WEEK_DATE",
            SUM("ORD_QTY") AS ORD_QTY
        FROM "V_SALESALL_WEEK"
        WHERE FACTORY_LOC   = '${req.data.LOCATION_ID}'
         AND WEEK_DATE = '${req.data.WEEK_DATE}'
        GROUP BY 
            "UNIQUE_ID",
            "WEEK_DATE"`)
        // Loop Assemblies
        for (let i = 0; i < liAssembly.length; i++) {
            let liUID = [];
            let lsUID = {};

            // get UniqueId with Char and Partial Prod
            const liPartialUniqueID = await cds.run(`
         SELECT DISTINCT 
             "CP_SALES_HM".LOCATION_ID as DEMAND_LOC,
             "CP_FACTORY_SALESLOC".FACTORY_LOC as LOCATION_ID,
             "V_UNIQUE_ID_ITEM".PRODUCT_ID AS REF_PRODID,
             "CP_SALES_HM".PRODUCT_ID,
             "V_UNIQUE_ID_ITEM".UNIQUE_ID,
             "V_UNIQUE_ID_ITEM".UNIQUE_DESC,
             "V_UNIQUE_ID_ITEM".CHAR_NUM,
             "V_UNIQUE_ID_ITEM".CHARVAL_NUM
         FROM 
             V_UNIQUE_ID_ITEM
             INNER JOIN
             CP_SALES_HM
             ON V_UNIQUE_ID_ITEM.UNIQUE_ID = CP_SALES_HM.UNIQUE_ID
             INNER JOIN
             CP_FACTORY_SALESLOC
             ON CP_FACTORY_SALESLOC.LOCATION_ID = CP_SALES_HM.LOCATION_ID
             AND CP_FACTORY_SALESLOC.PRODUCT_ID = CP_SALES_HM.PRODUCT_ID
         WHERE CP_FACTORY_SALESLOC.FACTORY_LOC = '${liAssembly[i].LOCATION_ID}'  
           AND V_UNIQUE_ID_ITEM.PRODUCT_ID = '${liAssembly[i].PRODUCT_ID}'
         ORDER BY 
            "CP_FACTORY_SALESLOC".FACTORY_LOC,
            "CP_SALES_HM".PRODUCT_ID,
            "V_UNIQUE_ID_ITEM".UNIQUE_ID`
            );
            for (let cntUID = 0; cntUID < liPartialUniqueID.length; cntUID++) {

                lsChar = {};
                lsChar.CHAR_NUM = liPartialUniqueID[cntUID].CHAR_NUM;
                lsChar.CHARVAL_NUM = liPartialUniqueID[cntUID].CHARVAL_NUM;
                liChar.push(lsChar);

                if (cntUID === GenF.addOne(cntUID, liPartialUniqueID.length) ||
                    liPartialUniqueID[cntUID].LOCATION_ID !== liPartialUniqueID[GenF.addOne(cntUID, liPartialUniqueID.length)].LOCATION_ID ||
                    liPartialUniqueID[cntUID].PRODUCT_ID !== liPartialUniqueID[GenF.addOne(cntUID, liPartialUniqueID.length)].PRODUCT_ID ||
                    liPartialUniqueID[cntUID].UNIQUE_ID !== liPartialUniqueID[GenF.addOne(cntUID, liPartialUniqueID.length)].UNIQUE_ID) {

                    lsUID = {};

                    lsUID.DEMAND_LOC = GenF.parse(liPartialUniqueID[cntUID].DEMAND_LOC);
                    lsUID.LOCATION_ID = GenF.parse(liPartialUniqueID[cntUID].LOCATION_ID);
                    lsUID.PRODUCT_ID = GenF.parse(liPartialUniqueID[cntUID].PRODUCT_ID);
                    lsUID.UNIQUE_ID = GenF.parse(liPartialUniqueID[cntUID].UNIQUE_ID);
                    lsUID.UNIQUE_DESC = GenF.parse(liPartialUniqueID[cntUID].UNIQUE_DESC);
                    lsUID.CIR_QTY = GenF.parse(0);
                    lsUID.ORD_QTY = GenF.parse(0);
                    for (let iCIR = 0; iCIR < liCIRData.length; iCIR++) {

                        if (liCIRData[iCIR].UNIQUE_ID === liPartialUniqueID[cntUID].UNIQUE_ID) {
                            lsUID.CIR_QTY = GenF.parse(liCIRData[iCIR].CIR_QTY);
                            break;
                        }
                    }
                    for (let iSales = 0; iSales < liSalesQty.length; iSales++) {
                        if (liSalesQty[iSales].UNIQUE_ID === liPartialUniqueID[cntUID].UNIQUE_ID) {
                            lsUID.ORD_QTY = GenF.parse(liSalesQty[iSales].ORD_QTY);
                            break;
                        }

                    }
                    // lsUID.REF_PRODID = GenF.parse(liPartialUniqueID[cntUID].REF_PRODID);
                    lsUID.CHAR = GenF.parse(liChar);
                    liUID.push(GenF.parse(lsUID));
                    liChar = [];
                }

            }
            const liODChar = await cds.run(
                `SELECT DISTINCT ITEM_NUM, 
                            COMPONENT,
                            OBJ_DEP,
                            OBJ_COUNTER,
                            CHAR_NUM,
                            CHARVAL_NUM,
                            OD_CONDITION,
                            CHAR_COUNTER
            FROM "V_OBDHDR"
            WHERE COMPONENT    = '${liAssembly[i].ASSEMBLY}'
              AND LOCATION_ID   = '${liAssembly[i].LOCATION_ID}'
                ORDER BY COMPONENT,
                         OBJ_DEP,
                         OBJ_COUNTER,
                         CHAR_COUNTER`
            );

            let liComponent = [];
            let lsComponent = {};
            let lsODCount = {};

            for (let cntOD = 0; cntOD < liODChar.length; cntOD++) {
                if (cntOD === 0 ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.subOne(cntOD)].COMPONENT) {
                    lsComponent.COMPONENT = GenF.parse(GenF.parse(liODChar[cntOD].COMPONENT));
                    lsComponent.ITEM_NUM = GenF.parse(GenF.parse(liODChar[cntOD].ITEM_NUM));
                    lsComponent.OD = [];
                }

                if (cntOD === 0 ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.subOne(cntOD)].COMPONENT ||
                    liODChar[cntOD].OBJ_DEP !== liODChar[GenF.subOne(cntOD)].OBJ_DEP) {
                    let lsOD = {};
                    lsOD.OBJ_DEP = GenF.parse(liODChar[cntOD].OBJ_DEP);
                    lsOD.COUNTER = [];
                }


                if (cntOD === 0 ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.subOne(cntOD)].COMPONENT ||
                    liODChar[cntOD].OBJ_DEP !== liODChar[GenF.subOne(cntOD)].OBJ_DEP ||
                    liODChar[cntOD].OBJ_COUNTER !== liODChar[GenF.subOne(cntOD)].OBJ_COUNTER) {
                    lsODCount = {};
                    lsODCount.OBJ_COUNTER = GenF.parse(liODChar[cntOD].OBJ_COUNTER);
                    lsODCount.CHAR = [];
                }
                let lsChar = {};
                // let lsODCount = {};
                // lsODCount.CHAR = [];
                lsChar.CHAR_NUM = GenF.parse(liODChar[cntOD].CHAR_NUM);
                lsChar.CHARVAL_NUM = GenF.parse(liODChar[cntOD].CHARVAL_NUM);
                lsChar.OD_CONDITION = GenF.parse(liODChar[cntOD].OD_CONDITION);
                lsChar.CHAR_COUNTER = GenF.parse(liODChar[cntOD].CHAR_COUNTER);
                lsODCount.CHAR.push(lsChar);
                let lsOD = {};
                lsOD.COUNTER = [];
                if (cntOD === GenF.addOne(cntOD, liODChar.length) ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.addOne(cntOD, liODChar.length)].COMPONENT ||
                    liODChar[cntOD].OBJ_DEP !== liODChar[GenF.addOne(cntOD)].OBJ_DEP ||
                    liODChar[cntOD].OBJ_COUNTER !== liODChar[GenF.addOne(cntOD)].OBJ_COUNTER) {

                    lsOD.COUNTER.push(lsODCount);
                }

                if (cntOD === GenF.addOne(cntOD, liODChar.length) ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.addOne(cntOD, liODChar.length)].COMPONENT ||
                    liODChar[cntOD].OBJ_DEP !== liODChar[GenF.addOne(cntOD)].OBJ_DEP) {

                    lsComponent.OD.push(lsOD);
                }


                if (cntOD === GenF.addOne(cntOD, liODChar.length) ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.addOne(cntOD, liODChar.length)].COMPONENT) {

                    liComponent.push(lsComponent);
                    lsComponent = {};

                }

            }
            let lFail = '';

            for (let cntC = 0; cntC < liComponent.length; cntC++) {
                const lsComponent = liComponent[cntC];

                for (let cntUID = 0; cntUID < liUID.length; cntUID++) {
                    const element = liUID[cntUID];

                    lFail = '';
                    for (let cntOD = 0; cntOD < lsComponent.OD.length; cntOD++) {
                        const lsOD = lsComponent.OD[cntOD];

                        lFail = '';
                        for (let cntODC = 0; cntODC < lsOD.COUNTER.length; cntODC++) {
                            const lsCounter = lsOD.COUNTER[cntODC];
                            lFail = '';
                            let lCharCounter = 0;
                            for (let cntCh = 0; cntCh < lsCounter.CHAR.length; cntCh++) {
                                const lsODChar = lsCounter.CHAR[cntCh];
                                lFail = '';

                                for (let cntCch = 0; cntCch < liUID[cntUID].CHAR.length; cntCch++) {
                                    const lsUIDChar = liUID[cntUID].CHAR[cntCch];
                                    if (lsUIDChar.CHAR_NUM === lsODChar.CHAR_NUM) {
                                        if ((lsODChar.OD_CONDITION === 'EQ' &&
                                            lsUIDChar.CHARVAL_NUM === lsODChar.CHARVAL_NUM) ||
                                            (lsODChar.OD_CONDITION === 'NE' &&
                                                lsUIDChar.CHARVAL_NUM !== lsODChar.CHARVAL_NUM)) {
                                            //Success Counter
                                            lCharCounter = lsCounter.CHAR[cntCh].CHAR_COUNTER;
                                            vUIDLength = vUIDLength + 1;
                                            break;
                                        }
                                        else {
                                            //Check if there was a success for this counter
                                            if (lCharCounter !== lsCounter.CHAR[cntCh].CHAR_COUNTER) {
                                                //Check if there are any other conditions for this counter
                                                if (cntCh === GenF.addOne(cntCh, lsCounter.CHAR.length) ||
                                                    lsCounter.CHAR[cntCh].CHAR_COUNTER !== lsCounter.CHAR[GenF.addOne(cntCh, lsCounter.CHAR.length)].CHAR_COUNTER) {
                                                    lFail = 'X';
                                                }
                                            }
                                        }
                                    }
                                }
                                if (lFail === 'X') {
                                    break;
                                }
                                // if()

                            }
                            if (lFail === '' || (lFail === 'X' &&
                                cntODC === GenF.addOne(cntODC, lsOD.COUNTER.length))) {
                                break;
                            }
                            // if(vUIDLength === ){

                            // }
                        }
                        if (lFail === '' || (lFail === 'X' &&
                            cntOD === GenF.addOne(cntOD, lsComponent.OD.length))) {
                            break;
                        }
                    }
                    if (lFail === '') {
                        let vOpenQty = parseInt(liUID[cntUID].CIR_QTY) - parseInt(liUID[cntUID].ORD_QTY);
                        let vUIDQty = liUID[cntUID].UNIQUE_ID + '(' + parseInt(liUID[cntUID].CIR_QTY) + ': ' + parseInt(liUID[cntUID].ORD_QTY) + '/' + vOpenQty + ')';
                        lsAsmbUID.LOCATION_ID = GenF.parse(liUID[cntUID].DEMAND_LOC);
                        lsAsmbUID.PRODUCT_ID = GenF.parse(liUID[cntUID].PRODUCT_ID);
                        lsAsmbUID.ASSEMBLY = GenF.parse(liComponent[cntC].COMPONENT);
                        lsAsmbUID.ASSEMBLY_DESC = GenF.parse(liAssembly[i].ASSEMBLY_DESC);
                        lsAsmbUID.UNIQUE_ID = GenF.parse(vUIDQty); //(liUID[cntUID].UNIQUE_ID);
                        lsAsmbUID.UNIQUE_DESC = GenF.parse(liUID[cntUID].UNIQUE_DESC);
                        lsAsmbUID.CIR_QTY = GenF.parse(liUID[cntUID].CIR_QTY);
                        lsAsmbUID.ORD_QTY = GenF.parse(liUID[cntUID].ORD_QTY);
                        // lsAsmbUID.REF_PRODID = GenF.parse(liUID[cntUID].REF_PRODID);

                        // To get the location and product descriptions.
                        let lidesc = liLocProdDesc.filter(function (aLoc) {
                            return aLoc.LOCATION_ID === liUID[cntUID].DEMAND_LOC &&
                                aLoc.PRODUCT_ID === liUID[cntUID].PRODUCT_ID
                            //    &&
                            //    aLoc.LOCATION_ID === laLocations[iLoc].LOCATION_ID;
                        });

                        lsAsmbUID.LOCATION_DESC = GenF.parse(lidesc[0].LOCATION_DESC);
                        lsAsmbUID.PRODUCT_DESC = GenF.parse(lidesc[0].PROD_DESC);


                        if (liUID[cntUID].CIR_QTY > 0) {
                            liAsmbUID.push(GenF.parse(lsAsmbUID));
                        }
                        // liAsmbUID.push(GenF.parse(lsAsmbUID));
                        lsAsmbUID = {};
                    }

                    // }

                }
            }
        }
        // for (let iAsm = 0; iAsm < liAsmbUID.length; iAsm++) {
        //     const element = array[iAsm];

        // }
        liAsmbUID.sort(
            GenF.dynamicSortMultiple(
                "ASSEMBLY",
                "LOCATION_ID",
                "PRODUCT_ID",
                "UNIQUE_ID"
            )
        );

        //   let lsCntAsmb = {},
        //   liCntAsmb= [];
        //   lsCntAsmb.CIR_QTY = 0;
        //   lsCntAsmb.ORD_QTY = 0;

        //   for (let iComp = 0; iComp < liAsmbUID.length; iComp++) {
        //     lsCntAsmb.CIR_QTY =
        //       parseInt(lsCntAsmb.CIR_QTY) + parseInt(liAsmbUID[iComp].CIR_QTY);
        //       lsCntAsmb.ORD_QTY =
        //       parseInt(lsCntAsmb.ORD_QTY) + parseInt(liAsmbUID[iComp].ORD_QTY);
        //     if (
        //       liAsmbUID[iComp].ASSEMBLY !==
        //         liAsmbUID[GenF.addOne(iComp, liAsmbUID.length)].ASSEMBLY ||
        //       iComp === GenF.addOne(iComp, liAsmbUID.length)
        //     ) {
        //       lsCntAsmb.ASSEMBLY = GenF.parse(liAsmbUID[iComp].ASSEMBLY);

        //       let vOpenQty =
        //         parseInt(lsCntAsmb.CIR_QTY) - parseInt(lsCntAsmb.ORD_QTY);
        //       let vAsmbQty =
        //         lsCntAsmb.ASSEMBLY +
        //         "(" +
        //         lsCntAsmb.CIR_QTY +
        //         ": " +
        //         lsCntAsmb.ORD_QTY +
        //         "/" +
        //         vOpenQty +
        //         ")";

        //       lsCntAsmb.ASSEMBLY_VAL = vAsmbQty;
        //       liCntAsmb.push(GenF.parse(lsCntAsmb));
        //       lsCntAsmb.CIR_QTY = 0;
        //       lsCntAsmb.ORD_QTY = 0;
        //     }
        //   }

        //   for (let iComp = 0; iComp < liAsmbUID.length; iComp++) {
        //     for (let iTemComp = 0; iTemComp < liCntAsmb.length; iTemComp++) {
        //       if (liAsmbUID[iComp].ASSEMBLY === liCntAsmb[iTemComp].ASSEMBLY) {
        //         liAsmbUID[iComp].ASSEMBLY = GenF.parse(lsCntAsmb.ASSEMBLY_VAL);
        //       }
        //     }
        //   }
        return liAsmbUID;
    }


    /**
     * 
     * @param {Request} req 
     */
    async getAsmbUIDPartialNEW(req) {

        let liChar = [];
        let lsChar = {};
        let liAsmbUID = [];
        let lsAsmbUID = {};
        let vUIDLength = 0;
        const liAssembly = await cds.run(
            `SELECT DISTINCT CP_ASSEMBLY_COMP.LOCATION_ID,   
                             CP_BOM_MAT.PRODUCT_ID,                                                     
                             CP_ASSEMBLY_COMP.ASSEMBLY,
                             CP_ASSEMBLY_COMP.COMP_QTY,
                             CP_BOM_MAT.PROD_DESC AS ASSEMBLY_DESC
                        FROM CP_ASSEMBLY_COMP
                        INNER JOIN CP_BOM_MAT
                           ON CP_ASSEMBLY_COMP.LOCATION_ID = CP_BOM_MAT.LOCATION_ID
                          AND CP_ASSEMBLY_COMP.ASSEMBLY = CP_BOM_MAT.MAT_CHILD
                       WHERE CP_ASSEMBLY_COMP.COMPONENT    = '${req.data.COMPONENT}'
                         AND CP_ASSEMBLY_COMP.LOCATION_ID   = '${req.data.LOCATION_ID}'
                    ORDER BY CP_ASSEMBLY_COMP.LOCATION_ID ASC,   
                             CP_BOM_MAT.PRODUCT_ID ASC,                                                    
                             CP_ASSEMBLY_COMP.ASSEMBLY ASC`);

        const liLocProdDesc = await cds.run(
            `SELECT * 
                    from V_PARTIALPRODDESC`
        );

        /***********************
         * 
         */
        const liCIRData = await cds.run(`
        SELECT
            "PRODUCT_ID",
            "WEEK_DATE",
            "MODEL_VERSION",
            "VERSION",
            "SCENARIO",
            "UNIQUE_ID",
            SUM("CIR_QTY") AS CIR_QTY
        FROM "CP_CIR_GENERATED"
        WHERE LOCATION_ID IN ( SELECT DISTINCT LOCATION_ID FROM CP_FACTORY_SALESLOC WHERE FACTORY_LOC = '${req.data.LOCATION_ID}' )
         AND WEEK_DATE = '${req.data.WEEK_DATE}'
         AND VERSION = '${req.data.VERSION}'
         AND SCENARIO = '${req.data.SCENARIO}'
         AND MODEL_VERSION = 'Active'
        GROUP BY 
            "PRODUCT_ID",
            "WEEK_DATE",
            "MODEL_VERSION",
            "VERSION",
            "SCENARIO",
            "UNIQUE_ID"
        `);


        // Sales Qty
        const liSalesQty = await cds.run(`SELECT 
            "UNIQUE_ID",
            "WEEK_DATE",
            SUM("ORD_QTY") AS ORD_QTY
        FROM "V_SALESALL_WEEK"
        WHERE FACTORY_LOC   = '${req.data.LOCATION_ID}'
         AND WEEK_DATE = '${req.data.WEEK_DATE}'
        GROUP BY 
            "UNIQUE_ID",
            "WEEK_DATE"`)
        // Loop Assemblies
        for (let i = 0; i < liAssembly.length; i++) {
            let liUID = [];
            let lsUID = {};

            const liBomUID = await cds.run(`
                SELECT
                    "LOCATION_ID",
                    "PRODUCT_ID",
                    "FACTORY_LOC",
                    "UNIQUE_ID",
                    "ASSEMBLY",
                    "VALID_FROM"
                FROM "CP_BOM_UID"
                WHERE FACTORY_LOC = '${req.data.LOCATION_ID}'
                 AND ( VALID_FROM <= '${req.data.WEEK_DATE}'
                       AND VALID_TO >= '${req.data.WEEK_DATE}')
                 AND ASSEMBLY = '${liAssembly[i].ASSEMBLY}'
                GROUP BY 
                "LOCATION_ID",
                    "PRODUCT_ID",
                    "FACTORY_LOC",
                    "UNIQUE_ID",
                    "ASSEMBLY",
                    "VALID_FROM"
                `);

            // get UniqueId with Char and Partial Prod
            const liPartialUniqueID = await cds.run(`
         SELECT DISTINCT 
             "CP_SALES_HM".LOCATION_ID as DEMAND_LOC,
             "CP_FACTORY_SALESLOC".FACTORY_LOC as LOCATION_ID,
             "V_UNIQUE_ID_ITEM".PRODUCT_ID AS REF_PRODID,
             "CP_SALES_HM".PRODUCT_ID,
             "V_UNIQUE_ID_ITEM".UNIQUE_ID,
             "V_UNIQUE_ID_ITEM".UNIQUE_DESC,
             "V_UNIQUE_ID_ITEM".CHAR_NUM,
             "V_UNIQUE_ID_ITEM".CHARVAL_NUM
         FROM 
             V_UNIQUE_ID_ITEM
             INNER JOIN
             CP_SALES_HM
             ON V_UNIQUE_ID_ITEM.UNIQUE_ID = CP_SALES_HM.UNIQUE_ID
             INNER JOIN
             CP_FACTORY_SALESLOC
             ON CP_FACTORY_SALESLOC.LOCATION_ID = CP_SALES_HM.LOCATION_ID
             AND CP_FACTORY_SALESLOC.PRODUCT_ID = CP_SALES_HM.PRODUCT_ID
         WHERE CP_FACTORY_SALESLOC.FACTORY_LOC = '${liAssembly[i].LOCATION_ID}'  
           AND V_UNIQUE_ID_ITEM.PRODUCT_ID = '${liAssembly[i].PRODUCT_ID}'
         ORDER BY 
            "CP_FACTORY_SALESLOC".FACTORY_LOC,
            "CP_SALES_HM".PRODUCT_ID,
            "V_UNIQUE_ID_ITEM".UNIQUE_ID`
            );
            for (let cntUID = 0; cntUID < liPartialUniqueID.length; cntUID++) {

                lsChar = {};
                lsChar.CHAR_NUM = liPartialUniqueID[cntUID].CHAR_NUM;
                lsChar.CHARVAL_NUM = liPartialUniqueID[cntUID].CHARVAL_NUM;
                liChar.push(lsChar);

                if (cntUID === GenF.addOne(cntUID, liPartialUniqueID.length) ||
                    liPartialUniqueID[cntUID].LOCATION_ID !== liPartialUniqueID[GenF.addOne(cntUID, liPartialUniqueID.length)].LOCATION_ID ||
                    liPartialUniqueID[cntUID].PRODUCT_ID !== liPartialUniqueID[GenF.addOne(cntUID, liPartialUniqueID.length)].PRODUCT_ID ||
                    liPartialUniqueID[cntUID].UNIQUE_ID !== liPartialUniqueID[GenF.addOne(cntUID, liPartialUniqueID.length)].UNIQUE_ID) {

                    lsUID = {};

                    lsUID.DEMAND_LOC = GenF.parse(liPartialUniqueID[cntUID].DEMAND_LOC);
                    lsUID.LOCATION_ID = GenF.parse(liPartialUniqueID[cntUID].LOCATION_ID);
                    lsUID.PRODUCT_ID = GenF.parse(liPartialUniqueID[cntUID].PRODUCT_ID);
                    lsUID.UNIQUE_ID = GenF.parse(liPartialUniqueID[cntUID].UNIQUE_ID);
                    lsUID.UNIQUE_DESC = GenF.parse(liPartialUniqueID[cntUID].UNIQUE_DESC);
                    lsUID.CIR_QTY = GenF.parse(0);
                    lsUID.ORD_QTY = GenF.parse(0);
                    for (let iCIR = 0; iCIR < liCIRData.length; iCIR++) {

                        if (liCIRData[iCIR].UNIQUE_ID === liPartialUniqueID[cntUID].UNIQUE_ID) {
                            lsUID.CIR_QTY = GenF.parse(liCIRData[iCIR].CIR_QTY);
                            break;
                        }
                    }
                    for (let iSales = 0; iSales < liSalesQty.length; iSales++) {
                        if (liSalesQty[iSales].UNIQUE_ID === liPartialUniqueID[cntUID].UNIQUE_ID) {
                            lsUID.ORD_QTY = GenF.parse(liSalesQty[iSales].ORD_QTY);
                            break;
                        }

                    }
                    // lsUID.REF_PRODID = GenF.parse(liPartialUniqueID[cntUID].REF_PRODID);
                    lsUID.CHAR = GenF.parse(liChar);
                    liUID.push(GenF.parse(lsUID));
                    liChar = [];
                }

            }

            let temp = liUID;

            for (let id = 0; id < liBomUID.length; id++) {
                let index = liUID.findIndex(el => el.LOCATION_ID === liBomUID[id].FACTORY_LOC && el.UNIQUE_ID === liBomUID[id].UNIQUE_ID)

                if (index !== -1) {

                    let vOpenQty = parseInt(liUID[index].CIR_QTY) - parseInt(liUID[index].ORD_QTY);
                    let vUIDQty = liUID[index].UNIQUE_ID + '(' + parseInt(liUID[index].CIR_QTY) + ':' + parseInt(liUID[index].ORD_QTY) + ' /' + vOpenQty + ')';
                    lsAsmbUID.LOCATION_ID = GenF.parse(liUID[index].DEMAND_LOC);
                    lsAsmbUID.PRODUCT_ID = GenF.parse(liUID[index].PRODUCT_ID);
                    lsAsmbUID.ASSEMBLY = GenF.parse(liBomUID[id].ASSEMBLY);
                    lsAsmbUID.ASSEMBLY_DESC = GenF.parse(liAssembly[i].ASSEMBLY_DESC);
                    lsAsmbUID.UNIQUE_ID = GenF.parse(vUIDQty); //(liUID[cntUID].UNIQUE_ID);
                    lsAsmbUID.UNIQUE_DESC = GenF.parse(liUID[index].UNIQUE_DESC);
                    lsAsmbUID.CIR_QTY = GenF.parse(liUID[index].CIR_QTY);
                    lsAsmbUID.ORD_QTY = GenF.parse(liUID[index].ORD_QTY);
                    // lsAsmbUID.REF_PRODID = GenF.parse(liUID[cntUID].REF_PRODID);

                    // To get the location and product descriptions.
                    let lidesc = liLocProdDesc.filter(function (aLoc) {
                        return aLoc.LOCATION_ID === liUID[index].DEMAND_LOC &&
                            aLoc.PRODUCT_ID === liUID[index].PRODUCT_ID
                        //    &&
                        //    aLoc.LOCATION_ID === laLocations[iLoc].LOCATION_ID;
                    });

                    lsAsmbUID.LOCATION_DESC = GenF.parse(lidesc[0].LOCATION_DESC);
                    lsAsmbUID.PRODUCT_DESC = GenF.parse(lidesc[0].PROD_DESC);


                    if (liUID[index].CIR_QTY > 0) {
                        liAsmbUID.push(GenF.parse(lsAsmbUID));
                    }
                    // liAsmbUID.push(GenF.parse(lsAsmbUID));
                    lsAsmbUID = {};
                }

            }


        }

        liAsmbUID.sort(
            GenF.dynamicSortMultiple(
                "ASSEMBLY",
                "LOCATION_ID",
                "PRODUCT_ID",
                "UNIQUE_ID"
            )
        );

        return liAsmbUID;
    }

    /**
    * 
    * @param {Request} req 
    */
    async getCompUIDPartial(req) {

        let liChar = [];
        let lsChar = {};
        let liAsmbUID = [];
        let lsAsmbUID = {};
        let vUIDLength = 0;
        let liAssembly = await cds.run(
            `SELECT CP_ASSEMBLY_COMP.LOCATION_ID,   
                             CP_BOMHEADER.PRODUCT_ID,                                                     
                             CP_ASSEMBLY_COMP.ASSEMBLY,
                             CP_ASSEMBLY_COMP.COMPONENT,
                             CP_ASSEMBLY_COMP.COMP_DESC,
                             CP_ASSEMBLY_COMP.COMP_QTY
                        FROM CP_ASSEMBLY_COMP
                        INNER JOIN CP_BOMHEADER
                           ON CP_ASSEMBLY_COMP.LOCATION_ID = CP_BOMHEADER.LOCATION_ID
                          AND CP_ASSEMBLY_COMP.ASSEMBLY = CP_BOMHEADER.COMPONENT
                       WHERE CP_ASSEMBLY_COMP.ASSEMBLY    = '${req.data.ASSEMBLY}'
                         AND CP_ASSEMBLY_COMP.LOCATION_ID   = '${req.data.LOCATION_ID}'
                    ORDER BY CP_ASSEMBLY_COMP.LOCATION_ID ASC,   
                             CP_BOMHEADER.PRODUCT_ID ASC,                                                    
                             CP_ASSEMBLY_COMP.ASSEMBLY ASC`);

        const liCom = liAssembly;

        const keys = ['ASSEMBLY'];
        liAssembly = GenF.removeDuplicate(liAssembly, keys);

        const liLocProdDesc = await cds.run(
            `SELECT * 
                        from V_PARTIALPRODDESC`
        );

        const liCIRData = await cds.run(`
                            SELECT
                                 "PRODUCT_ID",
                                 "WEEK_DATE",
                                 "MODEL_VERSION",
                                 "VERSION",
                                 "SCENARIO",
                                 "UNIQUE_ID",
                                 SUM("CIR_QTY") AS CIR_QTY
                             FROM "CP_CIR_GENERATED"
                             WHERE LOCATION_ID IN ( SELECT DISTINCT LOCATION_ID FROM CP_FACTORY_SALESLOC WHERE FACTORY_LOC = '${req.data.LOCATION_ID}' )
                              AND WEEK_DATE = '${req.data.WEEK_DATE}'
                              AND VERSION = '${req.data.VERSION}'
                              AND SCENARIO = '${req.data.SCENARIO}'
                              AND MODEL_VERSION = 'Active'
                             GROUP BY 
                                 "PRODUCT_ID",
                                 "WEEK_DATE",
                                 "MODEL_VERSION",
                                 "VERSION",
                                 "SCENARIO",
                                 "UNIQUE_ID"
                             `);
        // Sales Qty
        const liSalesQty = await cds.run(`SELECT 
                                 "UNIQUE_ID",
                                 "WEEK_DATE",
                                 SUM("ORD_QTY") AS ORD_QTY
                             FROM "V_SALESALL_WEEK"
                             WHERE FACTORY_LOC   = '${req.data.LOCATION_ID}'
                              AND WEEK_DATE = '${req.data.WEEK_DATE}'
                             GROUP BY 
                                 "UNIQUE_ID",
                                 "WEEK_DATE"`)

        // Loop Components
        for (let i = 0; i < liAssembly.length; i++) {
            let liUID = [];
            let lsUID = {};

            // get UniqueId with Char and Partial Prod
            const liPartialUniqueID = await cds.run(`
                            SELECT DISTINCT 
                                "CP_FACTORY_SALESLOC".LOCATION_ID as DEMAND_LOC,
                                "CP_FACTORY_SALESLOC".FACTORY_LOC as LOCATION_ID,
                                "V_UNIQUE_ID_ITEM".PRODUCT_ID AS REF_PRODID,
                                "CP_SALES_HM".PRODUCT_ID,
                                "V_UNIQUE_ID_ITEM".UNIQUE_ID,
                                "V_UNIQUE_ID_ITEM".UNIQUE_DESC,
                                "V_UNIQUE_ID_ITEM".CHAR_NUM,
                                "V_UNIQUE_ID_ITEM".CHARVAL_NUM
                            FROM 
                                V_UNIQUE_ID_ITEM
                                INNER JOIN
                                CP_SALES_HM
                                ON V_UNIQUE_ID_ITEM.UNIQUE_ID = CP_SALES_HM.UNIQUE_ID
                                INNER JOIN
                                CP_FACTORY_SALESLOC
                                ON CP_FACTORY_SALESLOC.LOCATION_ID = CP_SALES_HM.LOCATION_ID
                            WHERE CP_FACTORY_SALESLOC.FACTORY_LOC = '${liAssembly[i].LOCATION_ID}'  
                            AND V_UNIQUE_ID_ITEM.PRODUCT_ID = '${liAssembly[i].PRODUCT_ID}'
                            ORDER BY 
                                "CP_FACTORY_SALESLOC".FACTORY_LOC,
                                "CP_SALES_HM".PRODUCT_ID,
                                "V_UNIQUE_ID_ITEM".UNIQUE_ID`
            );
            for (let cntUID = 0; cntUID < liPartialUniqueID.length; cntUID++) {

                lsChar = {};
                lsChar.CHAR_NUM = liPartialUniqueID[cntUID].CHAR_NUM;
                lsChar.CHARVAL_NUM = liPartialUniqueID[cntUID].CHARVAL_NUM;
                liChar.push(lsChar);

                if (cntUID === GenF.addOne(cntUID, liPartialUniqueID.length) ||
                    liPartialUniqueID[cntUID].LOCATION_ID !== liPartialUniqueID[GenF.addOne(cntUID, liPartialUniqueID.length)].LOCATION_ID ||
                    liPartialUniqueID[cntUID].PRODUCT_ID !== liPartialUniqueID[GenF.addOne(cntUID, liPartialUniqueID.length)].PRODUCT_ID ||
                    liPartialUniqueID[cntUID].UNIQUE_ID !== liPartialUniqueID[GenF.addOne(cntUID, liPartialUniqueID.length)].UNIQUE_ID) {

                    lsUID = {};

                    lsUID.DEMAND_LOC = GenF.parse(liPartialUniqueID[cntUID].DEMAND_LOC);
                    lsUID.LOCATION_ID = GenF.parse(liPartialUniqueID[cntUID].LOCATION_ID);
                    lsUID.PRODUCT_ID = GenF.parse(liPartialUniqueID[cntUID].PRODUCT_ID);
                    lsUID.UNIQUE_ID = GenF.parse(liPartialUniqueID[cntUID].UNIQUE_ID);
                    lsUID.UNIQUE_DESC = GenF.parse(liPartialUniqueID[cntUID].UNIQUE_DESC);
                    lsUID.CIR_QTY = GenF.parse(0);
                    lsUID.ORD_QTY = GenF.parse(0);
                    for (let iCIR = 0; iCIR < liCIRData.length; iCIR++) {

                        if (liCIRData[iCIR].UNIQUE_ID === liPartialUniqueID[cntUID].UNIQUE_ID) {
                            lsUID.CIR_QTY = GenF.parse(liCIRData[iCIR].CIR_QTY);
                            break;
                        }
                    }
                    for (let iSales = 0; iSales < liSalesQty.length; iSales++) {
                        if (liSalesQty[iSales].UNIQUE_ID === liPartialUniqueID[cntUID].UNIQUE_ID) {
                            lsUID.ORD_QTY = GenF.parse(liSalesQty[iSales].ORD_QTY);
                            break;
                        }

                    }
                    // lsUID.REF_PRODID = GenF.parse(liPartialUniqueID[cntUID].REF_PRODID);
                    lsUID.CHAR = GenF.parse(liChar);
                    liUID.push(GenF.parse(lsUID));
                    liChar = [];
                }

            }


            const liODChar = await cds.run(
                `SELECT DISTINCT ITEM_NUM, 
                            COMPONENT,
                            OBJ_DEP,
                            OBJ_COUNTER,
                            CHAR_NUM,
                            CHARVAL_NUM,
                            OD_CONDITION,
                            CHAR_COUNTER
                FROM "V_OBDHDR"
            WHERE COMPONENT    = '${liAssembly[i].ASSEMBLY}'
              AND LOCATION_ID   = '${liAssembly[i].LOCATION_ID}'
                ORDER BY COMPONENT,
                         OBJ_DEP,
                         OBJ_COUNTER,
                         CHAR_COUNTER`
            );

            let liComponent = [];
            let lsComponent = {};
            let lsODCount = {};

            for (let cntOD = 0; cntOD < liODChar.length; cntOD++) {
                if (cntOD === 0 ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.subOne(cntOD)].COMPONENT) {
                    lsComponent.COMPONENT = GenF.parse(GenF.parse(liODChar[cntOD].COMPONENT));
                    lsComponent.ITEM_NUM = GenF.parse(GenF.parse(liODChar[cntOD].ITEM_NUM));
                    lsComponent.OD = [];
                }

                if (cntOD === 0 ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.subOne(cntOD)].COMPONENT ||
                    liODChar[cntOD].OBJ_DEP !== liODChar[GenF.subOne(cntOD)].OBJ_DEP) {
                    let lsOD = {};
                    lsOD.OBJ_DEP = GenF.parse(liODChar[cntOD].OBJ_DEP);
                    lsOD.COUNTER = [];
                }


                if (cntOD === 0 ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.subOne(cntOD)].COMPONENT ||
                    liODChar[cntOD].OBJ_DEP !== liODChar[GenF.subOne(cntOD)].OBJ_DEP ||
                    liODChar[cntOD].OBJ_COUNTER !== liODChar[GenF.subOne(cntOD)].OBJ_COUNTER) {
                    lsODCount = {};
                    lsODCount.OBJ_COUNTER = GenF.parse(liODChar[cntOD].OBJ_COUNTER);
                    lsODCount.CHAR = [];
                }
                let lsChar = {};
                // let lsODCount = {};
                // lsODCount.CHAR = [];
                lsChar.CHAR_NUM = GenF.parse(liODChar[cntOD].CHAR_NUM);
                lsChar.CHARVAL_NUM = GenF.parse(liODChar[cntOD].CHARVAL_NUM);
                lsChar.OD_CONDITION = GenF.parse(liODChar[cntOD].OD_CONDITION);
                lsChar.CHAR_COUNTER = GenF.parse(liODChar[cntOD].CHAR_COUNTER);
                lsODCount.CHAR.push(lsChar);
                let lsOD = {};
                lsOD.COUNTER = [];
                if (cntOD === GenF.addOne(cntOD, liODChar.length) ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.addOne(cntOD, liODChar.length)].COMPONENT ||
                    liODChar[cntOD].OBJ_DEP !== liODChar[GenF.addOne(cntOD)].OBJ_DEP ||
                    liODChar[cntOD].OBJ_COUNTER !== liODChar[GenF.addOne(cntOD)].OBJ_COUNTER) {

                    lsOD.COUNTER.push(lsODCount);
                }

                if (cntOD === GenF.addOne(cntOD, liODChar.length) ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.addOne(cntOD, liODChar.length)].COMPONENT ||
                    liODChar[cntOD].OBJ_DEP !== liODChar[GenF.addOne(cntOD)].OBJ_DEP) {

                    lsComponent.OD.push(lsOD);
                }


                if (cntOD === GenF.addOne(cntOD, liODChar.length) ||
                    liODChar[cntOD].COMPONENT !== liODChar[GenF.addOne(cntOD, liODChar.length)].COMPONENT) {

                    liComponent.push(lsComponent);
                    lsComponent = {};

                }

            }
            let lFail = '';

            for (let cntC = 0; cntC < liComponent.length; cntC++) {
                const lsComponent = liComponent[cntC];

                for (let cntUID = 0; cntUID < liUID.length; cntUID++) {
                    const element = liUID[cntUID];

                    lFail = '';
                    for (let cntOD = 0; cntOD < lsComponent.OD.length; cntOD++) {
                        const lsOD = lsComponent.OD[cntOD];

                        lFail = '';
                        for (let cntODC = 0; cntODC < lsOD.COUNTER.length; cntODC++) {
                            const lsCounter = lsOD.COUNTER[cntODC];
                            lFail = '';
                            let lCharCounter = 0;
                            for (let cntCh = 0; cntCh < lsCounter.CHAR.length; cntCh++) {
                                const lsODChar = lsCounter.CHAR[cntCh];
                                lFail = '';

                                for (let cntCch = 0; cntCch < liUID[cntUID].CHAR.length; cntCch++) {
                                    const lsUIDChar = liUID[cntUID].CHAR[cntCch];
                                    if (lsUIDChar.CHAR_NUM === lsODChar.CHAR_NUM) {
                                        if ((lsODChar.OD_CONDITION === 'EQ' &&
                                            lsUIDChar.CHARVAL_NUM === lsODChar.CHARVAL_NUM) ||
                                            (lsODChar.OD_CONDITION === 'NE' &&
                                                lsUIDChar.CHARVAL_NUM !== lsODChar.CHARVAL_NUM)) {
                                            //Success Counter
                                            lCharCounter = lsCounter.CHAR[cntCh].CHAR_COUNTER;
                                            vUIDLength = vUIDLength + 1;
                                            break;
                                        }
                                        else {
                                            //Check if there was a success for this counter
                                            if (lCharCounter !== lsCounter.CHAR[cntCh].CHAR_COUNTER) {
                                                //Check if there are any other conditions for this counter
                                                if (cntCh === GenF.addOne(cntCh, lsCounter.CHAR.length) ||
                                                    lsCounter.CHAR[cntCh].CHAR_COUNTER !== lsCounter.CHAR[GenF.addOne(cntCh, lsCounter.CHAR.length)].CHAR_COUNTER) {
                                                    lFail = 'X';
                                                }
                                            }
                                        }
                                    }
                                }
                                if (lFail === 'X') {
                                    break;
                                }
                                // if()

                            }
                            if (lFail === '' || (lFail === 'X' &&
                                cntODC === GenF.addOne(cntODC, lsOD.COUNTER.length))) {
                                break;
                            }
                            // if(vUIDLength === ){

                            // }
                        }
                        if (lFail === '' || (lFail === 'X' &&
                            cntOD === GenF.addOne(cntOD, lsComponent.OD.length))) {
                            break;
                        }
                    }
                }
                if (lFail === '') {
                    let vOpenQty = parseInt(liUID[cntUID].CIR_QTY) - parseInt(liUID[cntUID].ORD_QTY);
                    let vUIDQty = liUID[cntUID].UNIQUE_ID + '(' + parseInt(liUID[cntUID].CIR_QTY) + ': ' + parseInt(liUID[cntUID].ORD_QTY) + '/' + vOpenQty + ')';
                    lsAsmbUID.LOCATION_ID = GenF.parse(liUID[cntUID].DEMAND_LOC);
                    lsAsmbUID.PRODUCT_ID = GenF.parse(liUID[cntUID].PRODUCT_ID);
                    lsAsmbUID.ASSEMBLY = GenF.parse(liComponent[cntC].COMPONENT);
                    lsAsmbUID.UNIQUE_ID = GenF.parse(vUIDQty); //(liUID[cntUID].UNIQUE_ID);
                    lsAsmbUID.UNIQUE_DESC = GenF.parse(liUID[cntUID].UNIQUE_DESC);
                    lsAsmbUID.CIR_QTY = GenF.parse(liUID[cntUID].CIR_QTY);
                    lsAsmbUID.ORD_QTY = GenF.parse(liUID[cntUID].ORD_QTY);
                    // lsAsmbUID.REF_PRODID = GenF.parse(liUID[cntUID].REF_PRODID);


                    // To get the location and product descriptions.
                    let lidesc = liLocProdDesc.filter(function (aLoc) {
                        return aLoc.LOCATION_ID === liUID[cntUID].DEMAND_LOC &&
                            aLoc.PRODUCT_ID === liUID[cntUID].PRODUCT_ID

                    });

                    lsAsmbUID.LOCATION_DESC = GenF.parse(lidesc[0].LOCATION_DESC);
                    lsAsmbUID.PRODUCT_DESC = GenF.parse(lidesc[0].PROD_DESC);



                    if (liUID[cntUID].CIR_QTY > 0) {

                        for (var j = 0; j < liCom.length; j++) {
                            lsAsmbUID.COMPONENT = liCom[j].COMPONENT;
                            lsAsmbUID.COMP_DESC = liCom[j].COMP_DESC;
                            liAsmbUID.push(GenF.parse(lsAsmbUID));
                        }
                        // liAsmbUID.push(GenF.parse(lsAsmbUID));
                        lsAsmbUID = {};
                    }

                    // }

                }
            }
        }
        liAsmbUID.sort(
            GenF.dynamicSortMultiple(
                "ASSEMBLY",
                "LOCATION_ID",
                "PRODUCT_ID",
                "UNIQUE_ID"
            )
        );
        return liAsmbUID;

    }


    /**
     * 
     * @param {Request} req 
     */
    async getCriticalAsmbs(aData) {

        let lifinData = [];
        let lsData = {};

        const liCritical = await cds.run(
            `SELECT DISTINCT LOCATION_ID,
                    PRODUCT_ID,
                    ITEM_NUM,
                    ASSEMBLY,
                    COMPONENT,                    
                    CRITICALKEY AS COMP_CRITICALKEY,
                    ASSEMBLY_CRITICALKEY as CRITICALKEY
               FROM "CP_CRITICAL_COMP"
                WHERE "LOCATION_ID" = '` + aData.LOCATION_ID + `'
                ORDER BY LOCATION_ID,
                        PRODUCT_ID,
                        ITEM_NUM,
                        ASSEMBLY,
                        COMPONENT
                    `      );
        // AND ( "ASSEMBLY_CRITICALKEY" = 'X' OR CRITICALKEY = 'X')
        // console.log(liCritical);
        return liCritical;
    }

    /**
     * Get Infering Characteristics Details
     */
    async getInferingChar(oODChar, aDerivedChar, aProdClsCharVal, aODChar) {
        let aFilDerivedChar = [];
        let oODCharIF = {};
        let aIndChar = [];
        let bFlag = false;

        aFilDerivedChar = aDerivedChar.filter(function (aDerChar) {
            return aDerChar.CLASS_NUM === oODChar.CLASS_NUM
                && aDerChar.CHAR_NUM === oODChar.CHAR_NUM
                && aDerChar.CHARVAL_NUM === oODChar.CHARVAL_NUM
                && aDerChar.CLAUSE === 'T';
        });

        if (aFilDerivedChar.length > 0) {
            for (let iDCDep = 0; iDCDep < aFilDerivedChar.length; iDCDep++) {
                let aDepDC = aDerivedChar.filter(function (aDerChar) {
                    return aDerChar.DEP_NAME === aFilDerivedChar[iDCDep].DEP_NAME
                        && aDerChar.CLAUSE === 'I';
                });

                if (aDepDC.length > 0) {
                    for (let iDCIF = 0; iDCIF < aDepDC.length; iDCIF++) {
                        oODCharIF = {};
                        bFlag = false;

                        let aProdCharVal = aProdClsCharVal.filter(function (aProdChar) {
                            return aProdChar.CLASS_NUM === aDepDC[iDCIF].CLASS_NUM
                                && aProdChar.CHAR_NUM === aDepDC[iDCIF].CHAR_NUM
                                && aProdChar.CHARVAL_NUM === aDepDC[iDCIF].CHARVAL_NUM;
                        });

                        oODCharIF = GenF.parse(oODChar);
                        oODCharIF.CLASS_NUM = aDepDC[iDCIF].CLASS_NUM;
                        oODCharIF.CLASS_NAME = aProdCharVal[0].CLASS_NAME;
                        oODCharIF.CLASS_DESC = aProdCharVal[0].CLASS_DESC;
                        oODCharIF.CHAR_NUM = aDepDC[iDCIF].CHAR_NUM;
                        oODCharIF.CHAR_NAME = aProdCharVal[0].CHAR_NAME;
                        oODCharIF.CHAR_DESC = aProdCharVal[0].CHAR_DESC;
                        oODCharIF.CHARVAL_NUM = aDepDC[iDCIF].CHARVAL_NUM;
                        oODCharIF.CHAR_VALUE = aProdCharVal[0].CHAR_VALUE;
                        oODCharIF.CHARVAL_DESC = aProdCharVal[0].CHARVAL_DESC;
                        oODCharIF.OD_CONDITION = aDepDC[iDCIF].OD_CONDITION;
                        oODCharIF.VALID_FROM = aDepDC[iDCIF].VALID_FROM;
                        oODCharIF.VALID_TO = aDepDC[iDCIF].VALID_TO;

                        // Check if Class, Char & CharVal_Num already exists in array
                        bFlag = aODChar.some((f) => {
                            return f.CLASS_NUM === aDepDC[iDCIF].CLASS_NUM
                                && f.CHAR_NUM === aDepDC[iDCIF].CHAR_NUM
                                && f.CHARVAL_NUM === aDepDC[iDCIF].CHARVAL_NUM;
                        });

                        if (bFlag === false) {

                            aODChar.push(GenF.parse(oODCharIF));

                            aIndChar = await this.getInferingChar(oODCharIF, aDerivedChar, aProdClsCharVal, aODChar);
                            aODChar.push.apply(aIndChar);
                            aIndChar = [];
                        }

                    }

                }

            }
        }

        return aODChar;

    }

    async maintainUniqueHeader(lFlag, adata, fullData, isApp) {
        let liresults = [], piresults = [], finalResults = [];
        let lsresults = {}, psresults = {}, indResults = [];
        var responseMessage;
        let vFlag;
        //OLD with location ID
        // const li_uniquedata = await cds.run(
        //     `SELECT *
        //     FROM "CP_UNIQUE_ID_HEADER"
        //     WHERE "LOCATION_ID" = '` +
        //     adata.LOCATION_ID +
        //     `' ORDER BY UNIQUE_ID DESC`
        // );
        const li_uniquedata = await cds.run(
            `SELECT *
            FROM "CP_UNIQUE_ID_HEADER"
             ORDER BY UNIQUE_ID DESC`
        );
        if (lFlag === 'E') {// Active status change
            // lsresults.LOCATION_ID = adata.LOCATION_ID;
            lsresults.PRODUCT_ID = adata.PRODUCT_ID;
            lsresults.UNIQUE_ID = parseInt(adata.UNIQUE_ID);
            lsresults.UNIQUE_DESC = adata.UNIQUE_DESC;//li_unique[0].UNIQUE_DESC;
            lsresults.UID_TYPE = 'U';//li_unique[0].UID_TYPE;
            if (adata.ACTIVE === 'X') {
                lsresults.ACTIVE = Boolean(false);
            }
            else {
                lsresults.ACTIVE = Boolean(true);
            }
            liresults.push(lsresults);
            try {
                await UPDATE`CP_UNIQUE_ID_HEADER`
                    .with({
                        UNIQUE_DESC: lsresults.UNIQUE_DESC
                    })
                    .where(`PRODUCT_ID = '${lsresults.PRODUCT_ID}'
                            AND UNIQUE_ID = '${lsresults.UNIQUE_ID}'`);
                vFlag = 'X';
            } catch (e) {
                vFlag = '';
                //DONOTHING
            }
        }
        else if (lFlag === 'C' || lFlag === 'N' || lFlag === 'B') {
            var bReplaceFlag = false;
            var aUniqueList = [];
            if (adata.header) {//
                aUniqueList = await cds.run(
                    `SELECT * FROM "CP_UNIQUE_ID_HEADER" 
                    WHERE "PRODUCT_ID" = '${adata.PRODUCT_ID}'
                    `
                )
                bReplaceFlag = true;
            }
            // lsresults.LOCATION_ID = adata.LOCATION_ID;
            lsresults.PRODUCT_ID = adata.PRODUCT_ID;
            if (li_uniquedata.length > 0) {
                lsresults.UNIQUE_ID = parseInt(li_uniquedata[0].UNIQUE_ID) + 1;
            }
            else {
                lsresults.UNIQUE_ID = parseInt("01");
            }
            lsresults.UNIQUE_DESC = adata.UNIQUE_DESC;
            lsresults.UID_TYPE = 'U';
            lsresults.ACTIVE = Boolean(true);
            lsresults.EX_IDENTIFICATION = adata.externalIdentification;
            lsresults.VALID_FROM = (!adata.validFrom) ? '1947-01-01' : adata.validFrom;
            lsresults.VALID_TO = (!adata.validTo) ? '9999-12-30' : adata.validTo;
            liresults.push(lsresults);

            //Pradeep -01/11/2024- To check for Primary ID  based on Char num, char values; if no Primary ids available create a new Primary ID for the combination
            const liPrimaryData = await SELECT.columns("UNIQUE_ID",
                "CHAR_NUM",
                "CHARVAL_NUM",
                "CHAR_VALUE")
                .from('V_UNIQUE_ID')
                .where(`PRODUCT_ID  = '${adata.PRODUCT_ID}'
                    AND UID_TYPE = 'P'`);
            //If there are primary unique ids, check if the present char num and values are matching to any
            if (liPrimaryData.length > 0) {
                // Filter out items from fullData where UID_TYPE is 'P'
                const fullDataP = fullData.filter(item => item.UID_TYPE === 'P');

                // Extract all unique UNIQUE_IDs from liPrimaryData
                const uniqueIDs = [...new Set(liPrimaryData.map(item => item.UNIQUE_ID))];

                // Find UNIQUE_IDs in liPrimaryData that match all CHAR_NUM and CHAR_VALUE pairs from fullDataP
                const matchingUniqueIDs = uniqueIDs.filter(uid => {
                    // Get all items from liPrimaryData with the current UNIQUE_ID
                    const liPrimaryDataItems = liPrimaryData.filter(item => item.UNIQUE_ID === uid);

                    // Check if every CHAR_NUM and CHAR_VALUE pair in fullDataP exists in liPrimaryDataItems
                    return fullDataP.every(fullDataItem =>
                        liPrimaryDataItems.some(liItem =>
                            liItem.CHAR_NUM === fullDataItem.CHAR_NUM &&
                            liItem.CHAR_VALUE === fullDataItem.CHAR_VALUE
                        )
                    );
                });
                //if no primary unique ids match to current combination of char num and values, create a new Primary id
                if (matchingUniqueIDs.length === 0) {
                    psresults.UNIQUE_ID = parseInt(lsresults.UNIQUE_ID + 1);
                    psresults.PRODUCT_ID = adata.PRODUCT_ID;
                    psresults.UNIQUE_DESC = adata.UNIQUE_DESC;
                    psresults.UID_TYPE = 'P';
                    psresults.ACTIVE = Boolean(true);
                    psresults.EX_IDENTIFICATION = adata.externalIdentification;
                    psresults.VALID_FROM = (!adata.validFrom) ? '1947-01-01' : adata.validFrom;
                    psresults.VALID_TO = (!adata.validTo) ? '9999-12-30' : adata.validTo;
                    piresults.push(psresults);
                }
                else {
                    //do nothing.
                }
            }
            //If no primary unique ids available, create a new primary unique ids for the present combination of char values and num.
            else {
                psresults.UNIQUE_ID = parseInt(lsresults.UNIQUE_ID + 1);
                psresults.PRODUCT_ID = adata.PRODUCT_ID;
                psresults.UNIQUE_DESC = psresults.UNIQUE_ID.toString();
                psresults.UID_TYPE = 'P';
                psresults.ACTIVE = Boolean(true);
                psresults.EX_IDENTIFICATION = '';
                psresults.VALID_FROM = (!adata.validFrom) ? '1947-01-01' : adata.validFrom;
                psresults.VALID_TO = (!adata.validTo) ? '9999-12-30' : adata.validTo;
                piresults.push(psresults);
            }


            if (liresults.length > 0) {
                try {
                    if (bReplaceFlag == false) {
                        await cds.run(INSERT.into("CP_UNIQUE_ID_HEADER").entries(liresults));
                        indResults = { UID: liresults[0].UNIQUE_ID };
                        finalResults.push(indResults);
                        //Pradeep 01/11/2024 Insert Primary UID data
                        if (isApp == 'X') {
                            if (piresults.length > 0) {
                                await cds.run(INSERT.into("CP_UNIQUE_ID_HEADER").entries(piresults));
                                indResults = { PID: piresults[0].UNIQUE_ID };
                                finalResults.push(indResults);
                            }
                            else {
                                indResults = { PID: 0 };
                                finalResults.push(indResults);
                            }
                        }

                        // vFlag = lsresults.UNIQUE_ID;
                        vFlag = JSON.stringify(finalResults);
                    }
                    else {//Update the identification number,Valid From and Valid To for uniqueID
                        await UPDATE`CP_UNIQUE_ID_HEADER`
                            .with({
                                EX_IDENTIFICATION: adata.externalIdentification,
                                VALID_FROM: (!adata.validFrom) ? '1947-01-01' : adata.validFrom,
                                VALID_TO: (!adata.validTo) ? '9999-12-30' : adata.validTo,
                                UNIQUE_DESC: (adata.UNIQUE_DESC) ? adata.UNIQUE_DESC : ""
                            })
                            .where(`UNIQUE_ID = '${adata.UNIQUE_ID}' AND PRODUCT_ID = '${adata.PRODUCT_ID}'`)
                        vFlag = 'U';
                    }
                }
                catch (e) {
                    console.log(e, "uniqueHeader")
                    vFlag = '';
                }
            }
        }
        return vFlag;
    }



    //#region Functions for Unique Characteristics
    static removeDuplicate(array, key) {
        var check = new Set();
        return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
    };
    static removeDuplicatemultiple(array, keys) {
        const filtered = array.filter(
            (s => o =>
                (k => !s.has(k) && s.add(k))
                    (keys.map(k => o[k]).join('|'))
            )
                (new Set)
        );
        return filtered;
    }
    static sameProdConfigCheck(aData, uniqueData) {
        var aGroupedChar = [],
            aMatchedConfig = [];
        //first Step to groupBy Product with the charactersitics from JSON
        aData.forEach(el => {
            let iRec = aGroupedChar.findIndex(f => f.PRODUCT_ID == el.PRODUCT_ID);
            if (iRec == -1) {
                const obj = Object.assign({}, el);
                obj.jsonChar = [{
                    "CHAR_NUM": el.CHAR_NUM,
                    "CHARVAL_NUM": el.CHARVAL_NUM,
                    "EX_IDENTIFICATION": el.EX_IDENTIFICATION
                }]
                aGroupedChar.push(obj);
            } else {
                const obj = {
                    "CHAR_NUM": el.CHAR_NUM,
                    "CHARVAL_NUM": el.CHARVAL_NUM,
                    "EX_IDENTIFICATION": el.EX_IDENTIFICATION
                }
                if (el.characteristics.length > 0) {
                    el.characteristics.forEach(e => {
                        if (aGroupedChar[iRec].characteristics.filter(c => c.UNIQUE_ID == e.UNIQUE_ID).length == 0) {
                            aGroupedChar[iRec].characteristics.push(e);
                        }
                    })
                }
                if (el.itemCharacteristics.length > 0) {
                    el.itemCharacteristics.forEach(e => {
                        if (aGroupedChar[iRec].itemCharacteristics.filter(c => c.UNIQUE_ID == e.UNIQUE_ID
                            && c.CHAR_NUM == e.CHAR_NUM && c.CHARVAL_NUM == e.CHARVAL_NUM).length == 0) {
                            aGroupedChar[iRec].itemCharacteristics.push(e);
                        }
                    })
                }
                aGroupedChar[iRec].jsonChar.push(obj);
            }
        })
        //Next find the items with matching config count for uniqueID
        if (aGroupedChar.length > 0) {
            aGroupedChar.forEach(g => {
                var checkInDB = false;
                if (g.itemCharacteristics.length > 0) {
                    checkInDB = true;
                }
                const aFiltered = Catservicefn.dynamicFilter(g.characteristics, g.jsonChar, checkInDB, g.itemCharacteristics, uniqueData, g.validFrom, g.validTo);
                if (aFiltered.length > 0) {
                    aFiltered.forEach(a => {
                        const obj = {
                            CHARVAL_NUM: a.CHARVAL_NUM,
                            CHAR_NUM: a.CHAR_NUM,
                            LOCATION_ID: g.LOCATION_ID,
                            EX_IDENTIFICATION: (a.New_EX_IDENTIFICATION) ? a.New_EX_IDENTIFICATION : a.EX_IDENTIFICATION,
                            PRODUCT_ID: g.PRODUCT_ID,
                            product: g.PRODUCT_ID,
                            header: (a.header) ? true : false,
                            externalIdentification: (a.New_EX_IDENTIFICATION) ? a.New_EX_IDENTIFICATION : a.EX_IDENTIFICATION,
                            // UNIQUE_ID: (a.UNIQUE_ID)?a.UNIQUE_ID :g.UNIQUE_ID
                            UNIQUE_ID: '',
                            validFrom: g.validFrom,
                            validTo: g.validTo
                        }
                        if (a.UNIQUE_ID) {
                            obj.UNIQUE_ID = a.UNIQUE_ID
                        }
                        else if (g.characteristics.length > 0) {//Find from characteristics
                            let aChar = g.characteristics.filter(ch => ch.EX_IDENTIFICATION == obj.EX_IDENTIFICATION)
                            if (aChar.length > 0) {
                                obj.UNIQUE_ID = aChar[0].UNIQUE_ID;
                            }
                        }
                        aMatchedConfig.push(obj);
                    })
                }
            })
        }
        return aMatchedConfig;
    }
    static dynamicFilter(array, jsonData, checkInDB, itemCharacteristics, uniqueData, validFrom, validTo) {
        //If all config in products are having same identification then return [] 
        // var sIdentification = jsonData[0].EX_IDENTIFICATION;
        // if (jsonData.filter(f => f.EX_IDENTIFICATION != sIdentification).length == 0) {
        //     return jsonData;
        // }
        //First check in Json Products,if same config exists,then change identification Number, Group by Identifications as  aGroupedConfigs
        var aGroupedConfigs = [];
        jsonData.forEach((el, i) => {
            let iRec = aGroupedConfigs.findIndex(f => f.EX_IDENTIFICATION == el.EX_IDENTIFICATION);
            if (iRec == -1) {
                const obj = Object.assign({});
                obj.EX_IDENTIFICATION = el.EX_IDENTIFICATION;
                obj.configs = [{
                    "CHAR_NUM": el.CHAR_NUM,
                    "CHARVAL_NUM": el.CHARVAL_NUM,
                    "rowIndex": i
                }]
                aGroupedConfigs.push(obj);
            } else {
                const obj = {
                    "CHAR_NUM": el.CHAR_NUM,
                    "CHARVAL_NUM": el.CHARVAL_NUM,
                    "rowIndex": i
                }
                aGroupedConfigs[iRec].configs.push(obj);
            }
        })
        //Next check if same configs exists for different identifications
        aGroupedConfigs.forEach((el, i) => {
            var sIdentification = el.EX_IDENTIFICATION;
            var iCount = el.configs.length;
            let aFiltered = aGroupedConfigs.filter(f => f.configs.length == iCount && f.EX_IDENTIFICATION != sIdentification);
            if (aFiltered.length > 0 && i == 0) { //Now check if configs are same or not
                aFiltered.forEach(x => {
                    const isDataInJson = (a, b) => a.CHAR_NUM === b.CHAR_NUM && a.CHARVAL_NUM === b.CHARVAL_NUM;
                    const onlyInLeft = (left, right, compareFunction) =>
                        left.filter(leftValue =>
                            !right.some(rightValue =>
                                compareFunction(leftValue, rightValue)));

                    const aDiff = onlyInLeft(x.configs, el.configs, isDataInJson);
                    if (aDiff.length == 0) {//Same Config,Now replace identification number in jsonData and splice from jsonData
                        /*Scenario -
                         if the config which is getting replaced & which will replace both exists in DB,
                         Don't update identification Number
                        */
                        if (array.length > 0) {
                            let aCheckOldExists = array.filter(ar => ar.EX_IDENTIFICATION == el.EX_IDENTIFICATION);
                            let aCheckNewExists = array.filter(ar => ar.EX_IDENTIFICATION == x.EX_IDENTIFICATION);
                            if (aCheckOldExists.length > 0 && aCheckNewExists.length > 0) {
                                return;
                            }
                        }
                        el.configs.forEach(co => {
                            if (jsonData[co.rowIndex]) {
                                jsonData[co.rowIndex].New_EX_IDENTIFICATION = x.EX_IDENTIFICATION;
                                jsonData[co.rowIndex].iden = x.EX_IDENTIFICATION;
                                //if this record exists in DB
                                if (array.length > 0) {
                                    if (array.filter(ar => ar.CHAR_NUM == co.CHAR_NUM && ar.CHARVAL_NUM == co.CHARVAL_NUM && ar.EX_IDENTIFICATION == sIdentification).length > 0) {
                                        jsonData[co.rowIndex].iden = jsonData[co.rowIndex].EX_IDENTIFICATION;
                                    }
                                }
                            }
                        })
                        x.configs.forEach(co => {
                            let ind = jsonData.findIndex(f => f.CHAR_NUM == co.CHAR_NUM && f.CHARVAL_NUM == co.CHARVAL_NUM && f.EX_IDENTIFICATION == x.EX_IDENTIFICATION)
                            jsonData.splice(ind, 1)
                        })
                    }
                })
            }
        })
        //Now check if this Product has configs in DB
        if (array.length > 0) {
            array.forEach(a => {
                jsonData.forEach(b => {
                    if (a.CHAR_NUM == b.CHAR_NUM && a.CHARVAL_NUM == b.CHARVAL_NUM && a.EX_IDENTIFICATION == b.iden) {
                        b.UNIQUE_ID = a.UNIQUE_ID;
                        b.header = true;
                    }
                    else if (a.CHAR_NUM == b.CHAR_NUM && a.CHARVAL_NUM == b.CHARVAL_NUM && a.EX_IDENTIFICATION == b.EX_IDENTIFICATION) {
                        b.UNIQUE_ID = a.UNIQUE_ID;
                    }
                })
            })
        }
        ///
        if (checkInDB == true && itemCharacteristics.length > 0) {
            var aGroupedUniqueID = [];
            itemCharacteristics.forEach((el, i) => {
                let iRec = aGroupedUniqueID.findIndex(f => f.UNIQUE_ID == el.UNIQUE_ID);
                if (iRec == -1) {
                    const obj = Object.assign({});
                    obj.UNIQUE_ID = el.UNIQUE_ID;
                    obj.configs = [{
                        "CHAR_NUM": el.CHAR_NUM,
                        "CHARVAL_NUM": el.CHARVAL_NUM
                    }]
                    aGroupedUniqueID.push(obj);
                } else {
                    const obj = {
                        "CHAR_NUM": el.CHAR_NUM,
                        "CHARVAL_NUM": el.CHARVAL_NUM
                    }
                    aGroupedUniqueID[iRec].configs.push(obj);
                }
            })
            //
            //Next check if same configs exists for different identifications
            aGroupedConfigs.forEach((el, i) => {
                let aFiltered = aGroupedUniqueID.filter(it => it.configs.length == el.configs.length);
                //if same Count,check if all configs are same or not
                if (aFiltered.length > 0) {
                    aFiltered.forEach(x => {
                        const isDataInJson = (a, b) => a.CHAR_NUM === b.CHAR_NUM && a.CHARVAL_NUM === b.CHARVAL_NUM;
                        const onlyInLeft = (left, right, compareFunction) =>
                            left.filter(leftValue =>
                                !right.some(rightValue =>
                                    compareFunction(leftValue, rightValue)));

                        const aDiff = onlyInLeft(x.configs, el.configs, isDataInJson);
                        if (aDiff.length == 0) {//Same Config,Now replace identification number in jsonData and splice from jsonData
                            /*Scenario -
                             if the config which is getting replaced & which will replace both exists in DB,
                             Don't update identification Number
                            */
                            if (array.length > 0) {
                                let bDatesChanged = false;
                                let aCheckOldExists = array.filter(ar => ar.EX_IDENTIFICATION == el.EX_IDENTIFICATION);
                                let aDt = uniqueData.filter(fi => fi.UNIQUE_ID == x.UNIQUE_ID);
                                var sIden = '';
                                if (aDt.length > 0) {
                                    sIden = aDt[0].EX_IDENTIFICATION;
                                }
                                let aCheckNewExists = array.filter(ar => ar.EX_IDENTIFICATION == sIden);
                                ///check if valid from and To are different
                                if (aDt.length > 0) {
                                    if (aDt[0].VALID_FROM && aDt[0].VALID_TO && validFrom && validTo) {
                                        if (new Date(aDt[0].VALID_FROM).getTime() != new Date(validFrom).getTime() ||
                                            new Date(aDt[0].VALID_TO).getTime() != new Date(validTo).getTime()) {
                                            //Update The dates
                                            bDatesChanged = true;
                                        }
                                    }
                                    //If valid from and Valid to are in DB and uploaded again as empty values
                                    else if (aDt[0].VALID_FROM && aDt[0].VALID_TO && (!validFrom || !validTo)) {
                                        bDatesChanged = true;
                                    }
                                }
                                if (aCheckOldExists.length > 0 && aCheckNewExists.length > 0 && bDatesChanged == false) {
                                    return;
                                }
                            }
                            el.configs.forEach(co => {
                                if (jsonData[co.rowIndex]) {
                                    jsonData[co.rowIndex].header = true;
                                    jsonData[co.rowIndex].UNIQUE_ID = x.UNIQUE_ID
                                }
                            })
                        }
                    })
                }
            })
        }
        return jsonData;
    }
    static validateJson(aUniqueList, jsonData) {
        const returnObj = {
            "Type": "",
            "ErrorDescription": "",
            "resultData": '',
            "resultCode": ''
        }
        //First check if characteristics are valid or not,throw error if any of them is invalid
        var aInvalidChar = [],
            aProducts = [],
            aInvalidProd = [],
            aProdHeader = [];
        jsonData.forEach(el => {
            //Modify JsonData to overwrite productID 
            let iRec = aUniqueList.findIndex(u => u.JSONPRODUCT_ID == el.product);
            if (iRec != -1) {
                el.product = aUniqueList[iRec].PRODUCT_ID;
            }
            var oItems = aUniqueList.filter(f => f.PRODUCT_ID == el.product);
            var aProdConfig = aUniqueList.filter(f => f.PRODUCT_ID == el.product && f.EX_IDENTIFICATION == el.externalIdentification);
            if (oItems.length > 0) {
                function isDataInJson(a, b) {
                    a.MULTI_CHAR = b.MULTI_CHAR;
                    a.REF_CHAR_NAME = b.REF_CHAR_NAME;
                    if (b.MULTI_CHAR == 'X') {
                        return a.characteristic === b.REF_CHAR_NAME && a.characteristicValue === b.CHAR_VALUE;
                    }
                    else {
                        return a.characteristic === b.CHAR_NAME && a.characteristicValue === b.CHAR_VALUE;
                    }
                }
                // const isDataInJson = (a, b) => a.characteristic === b.CHAR_NAME && a.characteristicValue === b.CHAR_VALUE;
                const onlyInLeft = (left, right, compareFunction) =>
                    left.filter(leftValue =>
                        !right.some(rightValue =>
                            compareFunction(leftValue, rightValue)));

                const onlyInB = onlyInLeft(el.characteristics, oItems[0].prodCharacteristics, isDataInJson);

                const result = onlyInB;
                if (result.length > 0) {
                    result.forEach(r => {
                        if (aInvalidChar.filter(f => f.PRODUCT_ID == el.product && f.EX_IDENTIFICATION == el.externalIdentification).length == 0) {
                            r.PRODUCT_ID = el.product;
                            r.EX_IDENTIFICATION = el.externalIdentification;
                            aInvalidChar.push(r);
                        }
                    })
                }
            }

            if (aInvalidChar.length == 0 && aProdConfig.length > 0) { //No need for product level config checking if any of uploaded file config is invalid
                var bFLag = false;
                const isDataInDB2 = (a, b) => a.CHAR_NAME === b.characteristic && a.CHAR_VALUE === b.characteristicValue;
                const isDataInJson2 = (a, b) => a.characteristic === b.CHAR_NAME && a.characteristicValue === b.CHAR_VALUE;
                const onlyInLeft2 = (left, right, compareFunction) =>
                    left.filter(leftValue =>
                        !right.some(rightValue =>
                            compareFunction(leftValue, rightValue)));
                const onlyInA2 = onlyInLeft2(aProdConfig[0].characteristics, el.characteristics, isDataInDB2);
                const onlyInB2 = onlyInLeft2(el.characteristics, aProdConfig[0].characteristics, isDataInJson2);
                const result2 = [...onlyInA2];


                if (result2.length > 0) {
                    if (bFLag == false) {
                        result2.forEach(r => {
                            r.PRODUCT_ID = el.product;
                            r.EX_IDENTIFICATION = el.externalIdentification;
                            //Use only UNIQUEID for aInvalidProd array ,Using UNIQUE_ID also modifying array aProdConfig[0].characteristics
                            r.UNIQUEID = aProdConfig[0].UNIQUE_ID;
                            if (aInvalidProd.filter(f => f.PRODUCT_ID == el.product && f.EX_IDENTIFICATION == el.externalIdentification).length == 0) {
                                aInvalidProd.push(r);
                            }
                        })
                        if (el.characteristics.length > 0) {
                            el.characteristics.forEach(c => {
                                // Get CHAR_NUM and CHARVAL_NUM
                                let aFilProdConfig = aProdConfig[0].prodCharacteristics.filter(function (aConfig) {
                                    if (aConfig.MULTI_CHAR == "X") {
                                        return aConfig.REF_CHAR_NAME === c.characteristic && aConfig.CHAR_VALUE === c.characteristicValue;
                                    }
                                    else {
                                        return aConfig.CHAR_NAME === c.characteristic && aConfig.CHAR_VALUE === c.characteristicValue;
                                    }
                                });
                                const obj = {
                                    CHARVAL_NUM: aFilProdConfig[0].CHARVAL_NUM,
                                    CHAR_NUM: aFilProdConfig[0].CHAR_NUM,
                                    LOCATION_ID: aProdConfig[0].LOCATION_ID,
                                    PRODUCT_ID: aProdConfig[0].PRODUCT_ID,
                                    UNIQUE_ID: aProdConfig[0].UNIQUE_ID,
                                    EX_IDENTIFICATION: aProdConfig[0].EX_IDENTIFICATION,
                                    characteristics: aProdConfig[0].characteristics,
                                    itemCharacteristics: aProdConfig[0].itemCharacteristics,
                                    validFrom: el.validFrom,
                                    validTo: el.validTo
                                }
                                aProducts.push(obj);

                                c.characteristicValue = aFilProdConfig[0].CHARVAL_NUM;
                                c.characteristic = aFilProdConfig[0].CHAR_NUM;
                            })
                        }
                    }

                } else if (onlyInB2.length > 0) { //This condition gets executed if new products are getting added
                    if (el.characteristics.length > 0) {
                        el.characteristics.forEach(c => {
                            // Get CHAR_NUM and CHARVAL_NUM
                            let aFilProdConfig = aProdConfig[0].prodCharacteristics.filter(function (aConfig) {
                                if (aConfig.MULTI_CHAR == "X") {
                                    return aConfig.REF_CHAR_NAME === c.characteristic && aConfig.CHAR_VALUE === c.characteristicValue;
                                }
                                else {
                                    return aConfig.CHAR_NAME === c.characteristic && aConfig.CHAR_VALUE === c.characteristicValue;
                                }
                            });
                            const obj = {
                                CHARVAL_NUM: aFilProdConfig[0].CHARVAL_NUM,
                                CHAR_NUM: aFilProdConfig[0].CHAR_NUM,
                                LOCATION_ID: aProdConfig[0].LOCATION_ID,
                                PRODUCT_ID: aProdConfig[0].PRODUCT_ID,
                                UNIQUE_ID: aProdConfig[0].UNIQUE_ID,
                                EX_IDENTIFICATION: aProdConfig[0].EX_IDENTIFICATION,
                                characteristics: aProdConfig[0].characteristics,
                                itemCharacteristics: aProdConfig[0].itemCharacteristics,
                                validFrom: el.validFrom,
                                validTo: el.validTo
                            }
                            aProducts.push(obj);

                            c.characteristicValue = aFilProdConfig[0].CHARVAL_NUM;
                            c.characteristic = aFilProdConfig[0].CHAR_NUM;
                        })
                    }
                }
            }
        })

        //uncomment this for prod config validations
        if (aInvalidChar.length > 0) {
            returnObj.Type = "ERROR";
            returnObj.Description = "Cannot upload due to invalid Product Configurations:" + JSON.stringify(aInvalidChar);
            //Maintain in Error Log here -aInvalidChar
            return returnObj;
        }
        //Scenario- Same Product & characteristics but different identification then replace old identification with new one
        if (aProducts.length > 0) {
            let aResult = Catservicefn.sameProdConfigCheck(aProducts, aUniqueList);
            aProducts = aResult.filter(f => !f.header);
            aProdHeader = aResult.filter(f => f.header);
        }
        //All configurations from json file are valid and now proceed to data insertion
        var ProdConfigs = [];
        if (aProducts.length > 0) {
            ProdConfigs = aProducts;
            var aData = [];
            let aExisting = aInvalidProd.filter(f => f.UNIQUEID != "");
            if (aExisting.length > 0) {
                let oResult = Catservicefn.onConfirmYes(ProdConfigs, jsonData, aProdHeader);
                returnObj.resultData = oResult;
                returnObj.resultCode = "D";
            }
            else {//All new Products
                let aNewProd = ProdConfigs.filter(f => f.UNIQUE_ID == "");
                if (aNewProd.length > 0) {
                    aNewProd.forEach(el => {
                        const index = jsonData.findIndex(f => f.product == el.PRODUCT_ID && f.externalIdentification == el.EX_IDENTIFICATION);
                        if (index != -1) {
                            var rec = jsonData[index];
                            rec.UNIQUE_ID = '';

                            if (aData.filter(a => a.product == rec.product && a.externalIdentification == rec.externalIdentification).length == 0) {
                                aData.push(rec);
                            }
                        }
                    })
                }
                returnObj.resultData = aData;
                returnObj.resultCode = "B";
            }

            //Success
            returnObj.Type = "SUCCESS";
            returnObj.Description = "";
            return returnObj;
        } else if (aProdHeader.length > 0) {//Mixed case of new product and existing products
            let oResult = Catservicefn.onConfirmYes(ProdConfigs, jsonData, aProdHeader);
            if (oResult) {
                returnObj.Type = "SUCCESS";
                returnObj.Description = "";
                returnObj.resultData = oResult;
                returnObj.resultCode = "D";
                return returnObj;
            }
        } else {//Error
            returnObj.Type = "ERROR";
            returnObj.Description = "Same Data already exists!";
            return returnObj;
        }
    }
    static onConfirmYes(ProdConfigs, jsonData, aProdHeader) {
        var aData = [];
        let aExistingProd = ProdConfigs.filter(f => f.UNIQUE_ID != "");
        if (aExistingProd.length > 0) {
            aExistingProd.forEach(el => {
                const index = jsonData.findIndex(f => f.product == el.PRODUCT_ID && f.externalIdentification == el.EX_IDENTIFICATION);
                if (index != -1) {
                    var rec = jsonData[index];
                    rec.UNIQUE_ID = el.UNIQUE_ID;
                    if (aData.filter(a => a.product == rec.product && a.externalIdentification == rec.externalIdentification).length == 0) {
                        aData.push(rec);
                    }
                }
            })
        }

        let aNewProd = ProdConfigs.filter(f => f.UNIQUE_ID == "");
        if (aNewProd.length > 0) {
            aNewProd.forEach(el => {
                const index = jsonData.findIndex(f => f.product == el.PRODUCT_ID && f.externalIdentification == el.EX_IDENTIFICATION);
                if (index != -1) {
                    var rec = jsonData[index];
                    rec.UNIQUE_ID = '';
                    if (aData.filter(a => a.product == rec.product && a.externalIdentification == rec.externalIdentification).length == 0) {
                        aData.push(rec);
                    }
                }
            })
        }
        if (aProdHeader.length > 0) { //These are the records which have to update in Header table
            aProdHeader.forEach(p => {
                const index = jsonData.findIndex(f => f.product == p.PRODUCT_ID && f.externalIdentification == p.EX_IDENTIFICATION);
                if (index != -1) {
                    var rec = jsonData[index];
                    rec.UNIQUE_ID = p.UNIQUE_ID;
                    if (aData.filter(a => a.product == rec.product && a.externalIdentification == rec.externalIdentification).length == 0) {
                        p.header = true;
                        rec.header = true;
                        aData.push(rec);
                    }
                }
                // p.header = true;
                // aData.push(p);
            })
        }
        //Success
        return aData;
    }
    static addNotMultiChar(charArray, productID, liProdcharItems) {
        var aNotCharArray = [], aNotData = [];
        try {
            var aMultiChar = charArray.filter(c => c.MULTI_CHAR == 'X');//getting only Multi Characteristics
            for (var i = 0; i < aMultiChar.length; i++) {
                //Now get all the Matching multi characteristics from liProdcharItems based on REF_CHAR_NAME
                let aFiltered = liProdcharItems.filter(f => f.PRODUCT_ID == productID && f.MULTI_CHAR == 'X' && f.REF_CHAR_NAME == aMultiChar[i].REF_CHAR_NAME);
                if (aFiltered.length > 0) {
                    //Loop the filtered records and push _n records into array only if they don't exist in aMultiChar;
                    //m.characteristicValue+"_N" == el.CHARVAL_NUM expression is to not get _N values of existing char.
                    aFiltered.forEach(el => {
                        let aCheck = aMultiChar.filter(m => m.REF_CHAR_NAME == el.REF_CHAR_NAME && m.characteristic == el.CHAR_NUM
                            && (m.characteristicValue == el.CHARVAL_NUM || m.characteristicValue + "_N" == el.CHARVAL_NUM));
                        //If aCheck is length is zero then the characteritic doesn't exist in uploaded File
                        if (aCheck.length == 0 && el.CHAR_VALUE.includes("_N") == true) {//Getting only _N values
                            if (aNotCharArray.findIndex(n => n.characteristic == el.CHAR_NUM && n.characteristicValue == el.CHARVAL_NUM) == -1) {
                                const obj = {
                                    characteristic: el.CHAR_NUM,
                                    characteristicValue: el.CHARVAL_NUM,
                                    MULTI_CHAR: el.MULTI_CHAR,
                                    REF_CHAR_NAME: el.REF_CHAR_NAME
                                }
                                aNotCharArray.push(obj);
                            }

                        }
                    })
                }
            }
            //Get _N values for not uploaded characteristics as well
            let aMultiProdChar = liProdcharItems.filter(f => f.MULTI_CHAR == 'X' && f.CHARVAL_NUM.toString().endsWith("_N"));
            if (aMultiProdChar.length > 0) {
                aMultiProdChar.forEach(m => {
                    let iIndex = aNotCharArray.findIndex(c => c.characteristic == m.CHAR_NUM && (c.characteristicValue == m.CHARVAL_NUM));
                    if (iIndex == -1) {
                        //Don't push if its Normal char value exists in aMultiChar
                        if (aMultiChar.findIndex(am => am.characteristicValue + "_N" == m.CHARVAL_NUM) == -1) {
                            const obj = {
                                characteristic: m.CHAR_NUM,
                                characteristicValue: m.CHARVAL_NUM,
                                MULTI_CHAR: m.MULTI_CHAR,
                                REF_CHAR_NAME: m.REF_CHAR_NAME
                            }
                            aNotData.push(obj);
                        }

                    }
                })
            }
            return aNotCharArray.concat(aNotData);
        }
        catch (ex) {
            return [];
        }
    }
    //#endregion
    /**
     * Function to Update Variant Rules with Only IFs and Only THENs
     */
    async modifyVariantRules(req) {
        let aDistinctProd = [];
        const objDerConfig = new DerivedConfig();

        aDistinctProd = await cds.run(`SELECT DISTINCT PRODUCT_ID FROM CP_DERIVEDCHAR`);
        if (aDistinctProd.length > 0) {
            for (let iDC = 0; iDC < aDistinctProd.length; iDC++) {
                await objDerConfig.updateVariantRules(aDistinctProd[iDC].PRODUCT_ID);
            }
        }
    }
    // Generate Dummy prod
    async getDummyProd() {
        let aDummyLocProd = [], aDummyFinal = [], aDummyLoc = [];
        let aBOMData = await cds.run(`SELECT DISTINCT 
                                                                CP_BOM_MAT.LOCATION_ID,
                                                                CP_BOM_MAT.MAT_PARENT,
                                                                CP_BOM_MAT.MAT_CHILD,
                                                                CP_BOM_MAT.CHILD_LOC,
                                                                CP_BOM_MAT.PHANTOM_IND,
                                                                CP_BOM_MAT.CONFIGURABLE,
                                                                CP_BOM_MAT.CLASS_FLG
                                                            FROM 
                                                                "CP_BOM_MAT"
                                                                 WHERE CP_BOM_MAT.PHANTOM_IND = 'X'
                                                                OR CP_BOM_MAT.CLASS_FLG = 'X'
                                                                OR CP_BOM_MAT.CONFIGURABLE = 'X'`);


        let aChildLocDeviation = await cds.run(`SELECT  DISTINCT
                                                                CP_BOM_MAT.LOCATION_ID,
                                                                CP_BOM_MAT.MAT_PARENT,
                                                                CP_BOM_MAT.MAT_CHILD,
                                                                CP_BOM_MAT.CHILD_LOC
                                                            FROM 
                                                                "CP_BOM_MAT"
                                                            WHERE CP_BOM_MAT.PHANTOM_IND <> 'X'
                                                                AND CP_BOM_MAT.CLASS_FLG <> 'X'
                                                                and CP_BOM_MAT.LOCATION_ID <> CP_BOM_MAT.CHILD_LOC`);


        let aLocProd = await cds.run(`SELECT DISTINCT CONCAT("PRODUCT_ID", CONCAT('_',"LOCATION_ID"))  AS "LOCPROD","LOCATION_ID" FROM "V_LOCPROD" `)

        var obj = {};
        for (var x = 0; x < aBOMData.length; x++) {
            var key = aBOMData[x].MAT_PARENT + "||" + aBOMData[x].MAT_CHILD;
            if (!obj[key]) {
                obj[key] = [];
            }
            obj[key].push(aBOMData[x]);
        }
        //Object dependency 
        for (let i = 0; i < aChildLocDeviation.length; i++) {
            aDummyLocProd = [], aDummyLoc = [];
            GenF.log(`1.Processing Started for  ${aChildLocDeviation[i].MAT_CHILD}`);
            // GenF.log(`2. Get Dummy Parent for Product ${aChildLocDeviation[i].MAT_CHILD}`);
            // await this.getParentDummy(aChildLocDeviation[i].MAT_CHILD, aChildLocDeviation[i].CHILD_LOC, aDummyLocProd);
            // if (aDummyLocProd.length > 0) {
            // for (let iDmy = 0; iDmy < aDummyLocProd.length; iDmy++) {
            let oDummyLoc = {};
            // Dummy for child loc
            let sProduct = await getAsemblyConfig(aChildLocDeviation[i].MAT_PARENT, obj);
            aChildLocDeviation[i].PRODUCT_ID = sProduct;
            oDummyLoc.PRODUCT_ID = sProduct;
            oDummyLoc.DUMMY_PRODUCTID = sProduct.concat('_', aChildLocDeviation[i].CHILD_LOC);
            oDummyLoc.LOCATION_ID = aChildLocDeviation[i].CHILD_LOC;
            oDummyLoc.FACTORY_LOC = aChildLocDeviation[i].CHILD_LOC;

            let oParent = aBOMData.find(b => b.MAT_CHILD == aChildLocDeviation[i].MAT_PARENT)
            //  only insert if its parent is either Phatom, class or configurable
            // if (!oParent) {
            if (aChildLocDeviation[i].PRODUCT_ID !== aChildLocDeviation[i].MAT_PARENT && !oParent) {
                continue;
            }
            if (aLocProd.findIndex(l => l.LOCPROD == oDummyLoc.DUMMY_PRODUCTID && l.LOCATION_ID == oDummyLoc.LOCATION_ID) == -1) {
                aDummyFinal.push(GenF.parse(oDummyLoc));
            }
            // Dummy for Parent loc
            oDummyLoc = {};
            oDummyLoc.PRODUCT_ID = sProduct;
            oDummyLoc.DUMMY_PRODUCTID = sProduct.concat('_', aChildLocDeviation[i].CHILD_LOC);
            oDummyLoc.LOCATION_ID = aChildLocDeviation[i].LOCATION_ID;
            oDummyLoc.FACTORY_LOC = aChildLocDeviation[i].CHILD_LOC;
            if (aLocProd.findIndex(l => l.LOCPROD == oDummyLoc.DUMMY_PRODUCTID && l.LOCATION_ID == oDummyLoc.LOCATION_ID) == -1) {
                aDummyFinal.push(GenF.parse(oDummyLoc));
            }

            // GenF.log(`2. Insert Dummy Parent for Product ${aChildLocDeviation[i].MAT_CHILD}`);

            //}

            // }
            GenF.log(`2. Processing Completed for  ${aChildLocDeviation[i].MAT_CHILD}`);

        }

        async function getAsemblyConfig(MAT_PARENT, obj) {
            let oData = Object.keys(obj).find(key => key.includes('||' + MAT_PARENT))
            if (oData) {
                return await getAsemblyConfig(oData.split('||')[0], obj);
            }
            else {//it is ProductID
                return MAT_PARENT;
            }
        }
        if (aDummyFinal.length > 0) {
            // let Keys = ['DUMMY_PRODUCTID', 'LOCATION_ID', 'FACTORY_LOC'];
            let Keys = ['DUMMY_PRODUCTID', 'LOCATION_ID', 'FACTORY_LOC','PRODUCT_ID'];
            aDummyFinal = GenF.removeDuplicate(aDummyFinal, Keys);

            try {
                await cds.run(
                    `DELETE FROM CP_DUMMY_PRODUCT_LOC`
                );
                await cds.run(INSERT.into("CP_DUMMY_PRODUCT_LOC").entries(aDummyFinal));
                GenF.log(`Dummy Products Creation Completed`);
            } catch (e) {
                console.log(e);
            }
        }
    }
    // Get Root parent
    async getParentDummy(pChildProd, pChildLoc, aDummyProd) {
        let aGetparent = await cds.run(`SELECT DISTINCT  LOCATION_ID,
                                            MAT_PARENT
                                          FROM CP_BOM_MAT    
                                         WHERE MAT_CHILD = '${pChildProd}'  
                                         AND CHILD_LOC = '${pChildLoc}'                     
                                      ORDER BY LOCATION_ID,
                                               MAT_PARENT`);


        if (aGetparent.length > 0) {
            // Check if there is a parent
            for (let iGP = 0; iGP < aGetparent.length; iGP++) {
                await this.getParentDummy(aGetparent[iGP].MAT_PARENT, aGetparent[iGP].LOCATION_ID, aDummyProd);
            }
        }
        else {
            // Get Parent product
            let oDummyLocProd = {
                PRODUCT_ID: pChildProd
            };
            aDummyProd.push(GenF.parse(oDummyLocProd));
        }
    }

    //VP-1371 - Mapping BOM_MAT configurable product to CP_PRODUCT_CLASS
    async mapBOMProductClass() {
        var aProdClass = await cds.run(`SELECT DISTINCT "PRODUCT_ID","CLASS_NUM" FROM "CP_PRODUCT_CLASS"`);
        var aBOMData = await cds.run(`SELECT * FROM "CP_BOM_MAT"`);
        var aNewRecords = [];
        if (aBOMData?.length > 0) {
            var oProdClass = {}, obj = {};
            for (var x = 0; x < aProdClass.length; x++) {
                var key = aProdClass[x].PRODUCT_ID;
                if (!oProdClass[key]) {
                    oProdClass[key] = [];
                }
                oProdClass[key].push(aProdClass[x]);
            }
            aProdClass.length = 0
            for (var x = 0; x < aBOMData.length; x++) {
                var key = aBOMData[x].MAT_PARENT + "||" + aBOMData[x].MAT_CHILD;
                if (!obj[key]) {
                    obj[key] = [];
                }
                obj[key].push(aBOMData[x]);
            }

            for (var y = 0; y < aBOMData?.length; y++) {
                let el = aBOMData[y];
                if (oProdClass[el.MAT_CHILD]) {//Exist in CP_PRODUCT_CLASS
                    let sProduct = await getAsemblyConfig(el.MAT_PARENT, obj);
                    if (oProdClass[sProduct]) {//if its config product already exists
                        const aDataNotInConfigClass = oProdClass[el.MAT_CHILD].filter(item2 =>
                            !oProdClass[sProduct].some(item1 => item1.CLASS_NUM === item2.CLASS_NUM));
                        if (aDataNotInConfigClass.length > 0) {
                            aDataNotInConfigClass.forEach(d => {
                                aNewRecords.push({
                                    "PRODUCT_ID": sProduct,
                                    "CLASS_NUM": d.CLASS_NUM
                                })
                            })
                        }
                    }
                    else {
                        oProdClass[el.MAT_CHILD].forEach(c => {
                            aNewRecords.push({
                                "PRODUCT_ID": sProduct,
                                "CLASS_NUM": c.CLASS_NUM
                            })
                        })
                    }
                }
            }
            if (aNewRecords.length > 0) {
                let Keys = ['PRODUCT_ID', 'CLASS_NUM'];
                aNewRecords = GenF.removeDuplicate(aNewRecords, Keys);
                await cds.run(INSERT.into("CP_PRODUCT_CLASS").entries(aNewRecords));

            }

        }

        async function getAsemblyConfig(MAT_PARENT, obj) {
            let oData = Object.keys(obj).find(key => key.includes('||' + MAT_PARENT))
            if (oData) {
                return await getAsemblyConfig(oData.split('||')[0], obj);
            }
            else {//it is ProductID
                return MAT_PARENT;
            }
        }
    }

    //VP-1377 - Handle Assembly Requirements Generation for Non-Configurable Products
    async updateNonConfigProduct() {
        let aProducts = [];

        aProducts = await cds.run(`SELECT * FROM CP_PRODUCT 
                      WHERE PRODUCT_ID NOT IN (SELECT DISTINCT PRODUCT_ID FROM CP_PRODUCT_CLASS)`);
        if (aProducts.length > 0) {
            // Reset Non-Configurable Check for Products
            await cds.run(`UPDATE CP_PRODUCT SET NON_CONFIGURABLE = ''
                        WHERE PRODUCT_ID IN (SELECT DISTINCT PRODUCT_ID FROM CP_PRODUCT_CLASS)`);

            await cds.run(`UPDATE CP_PRODUCT SET NON_CONFIGURABLE = 'X'
                        WHERE PRODUCT_ID NOT IN (SELECT DISTINCT PRODUCT_ID FROM CP_PRODUCT_CLASS)`);
        }

    }

    async generateDummy() {

        let aBOMData = {};
        let aClassData = {};
        let aDummy = [];
        let aBOMH = [], oBOMH = {};

        // Get Full BOM Data
        // let aBOMFullData = await cds.run(`SELECT DISTINCT CP_BOM_MAT.LOCATION_ID,
        //                                               CP_BOM_MAT.MAT_PARENT,
        //                                               CP_BOM_MAT.MAT_CHILD,
        //                                               CP_BOM_MAT.CHILD_LOC,
        //                                               CP_BOM_MAT.PHANTOM_IND,
        //                                               CP_BOM_MAT.CONFIGURABLE,
        //                                               CP_BOM_MAT.CLASS_FLG
        //                                          FROM "CP_BOM_MAT"`);


        let aBOMFullData = await cds.run(`SELECT DISTINCT *
                                                    FROM "CP_BOM_MAT"`);

        for (let i = 0; i < aBOMFullData.length; i++) {
            if (aBOMData[aBOMFullData[i].LOCATION_ID] === undefined) {
                aBOMData[aBOMFullData[i].LOCATION_ID] = {};
            }

            if (aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].MAT_PARENT] === undefined) {
                aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].MAT_PARENT] = [];
            }

            // let aBOMLine = [];
            let aBOMLine = {};
            aBOMLine['MAT_CHILD'] = aBOMFullData[i].MAT_CHILD;
            aBOMLine['CHILD_LOC'] = aBOMFullData[i].CHILD_LOC;
            aBOMLine['PHANTOM_IND'] = aBOMFullData[i].PHANTOM_IND;
            aBOMLine['CONFIGURABLE'] = aBOMFullData[i].CONFIGURABLE;
            aBOMLine['CLASS_FLG'] = aBOMFullData[i].CLASS_FLG;
            // aBOMLine['MRP_GROUP'] = aBOMFullData[i].MRP_GROUP;
            // aBOMLine['MRP_TYPE'] = aBOMFullData[i].MRP_TYPE;
            aBOMLine['COMP_TYPE'] = aBOMFullData[i].COMP_TYPE;
            aBOMLine['PROD_DESC'] = aBOMFullData[i].PROD_DESC;
            aBOMLine['COMPONENT_QTY'] = aBOMFullData[i].COMPONENT_QTY;
            aBOMLine['VALID_FROM'] = aBOMFullData[i].VALID_FROM;
            aBOMLine['VALID_TO'] = aBOMFullData[i].VALID_TO;
            aBOMLine['COUNTER'] = aBOMFullData[i].COUNTER;

            aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].MAT_PARENT].push(aBOMLine);
            // aBOMLine = [];
            aBOMLine = {};
        }

        // Store BOM Parent-Child Hierarichal Data in BOM_Hierarchy Table             
        if (aBOMData) {
            for (const [loc, products] of Object.entries(aBOMData)) {
                for (const [prod, dataArray] of Object.entries(products)) {
                    const jsonData = JSON.stringify(dataArray);
                    oBOMH.LOCATION_ID = loc;
                    oBOMH.BOM_PARENT = prod;
                    oBOMH.BOM_CHILD = jsonData;

                    aBOMH.push(GenF.parse(oBOMH));

                }
            }

            try {
                await cds.run(`DELETE FROM CP_BOM_HIERARCHY`);
                await cds.run(INSERT.into("CP_BOM_HIERARCHY").entries(aBOMH));
            }
            catch (e) {
                GenF.log(`Updation of BOM Hierarchy Data Failed!`);
                console.log(e);
            }
        }


        aBOMFullData = [];
        let aClassFullData = await cds.run(`SELECT PRODUCT_ID,
                                                   CLASS_NUM
                                                FROM CP_PRODUCT_CLASS`);

        for (let i = 0; i < aClassFullData.length; i++) {
            if (aClassData[aClassFullData[i].PRODUCT_ID] === undefined) {
                aClassData[aClassFullData[i].PRODUCT_ID] = [];
            }
            aClassData[aClassFullData[i].PRODUCT_ID].push(aClassFullData[i]);
        }

        let aConfigProduct = await cds.run(`SELECT DISTINCT LOCATION_ID,
                                                   PRODUCT_ID
                                                FROM CP_LOCATION_PRODUCT
                                                WHERE (PRODUCT_ID IN (SELECT PRODUCT_ID
                                                FROM cp_product))`);

        aBOMFullData = [];
        aClassFullData = [];
        for (let i = 0; i < aConfigProduct.length; i++) {
            GenF.log(`Started processing create Dummy for Config Product '${aConfigProduct[i].PRODUCT_ID}'`);
            await this.createDummy(aConfigProduct[i].PRODUCT_ID, aConfigProduct[i].LOCATION_ID, aConfigProduct[i].PRODUCT_ID, aBOMData, aClassData, aDummy,aConfigProduct[i].LOCATION_ID);
            GenF.log(`Completed processing create Dummy for Config Product '${aConfigProduct[i].PRODUCT_ID}'`);
            let aProdClass = [];
            aProdClass = aClassData[aConfigProduct[i].PRODUCT_ID].map(e => ({ ...e, PRODUCT_ID: aConfigProduct[i].PRODUCT_ID }));
            if (aProdClass.length > 0) {
                const keys = ['PRODUCT_ID', 'CLASS_NUM'];
                aProdClass.sort(GenF.dynamicSortMultiple("PRODUCT_ID", "CLASS_NUM"));
                aProdClass = GenF.removeDuplicate(aProdClass, keys);
                GenF.log(`Product Class Data for '${aConfigProduct[i].PRODUCT_ID}' is ${aProdClass.length}'`);
                let cqnQuery = { UPSERT: { into: { ref: ['CP_PRODUCT_CLASS'] }, entries: aProdClass } };
                try {
                    await cds.run(cqnQuery);
                    aClassData[aConfigProduct[i].PRODUCT_ID] = [];
                }
                catch (e) {
                    GenF.log(`Updation of Product/class data for Config Product: +${aConfigProduct[i].PRODUCT_ID} failed`);
                    console.log(e);
                }
            }

            if (aDummy.length > 0) {
                // const keysDummy = ['DUMMY_PRODUCTID', 'LOCATION_ID', 'FACTORY_LOC'];
                // aDummy.sort(GenF.dynamicSortMultiple("DUMMY_PRODUCTID", "LOCATION_ID", "FACTORY_LOC"));
                const keysDummy = ['DUMMY_PRODUCTID', 'LOCATION_ID', 'FACTORY_LOC','PRODUCT_ID'];
                aDummy.sort(GenF.dynamicSortMultiple("DUMMY_PRODUCTID", "LOCATION_ID", "FACTORY_LOC","PRODUCT_ID"));                
                aDummy = GenF.removeDuplicate(aDummy, keysDummy);
                GenF.log(`Product Class Data for '${aConfigProduct[i].PRODUCT_ID}' is ${aDummy.length}`);
                let cqnQueryD = { UPSERT: { into: { ref: ['CP_DUMMY_PRODUCT_LOC'] }, entries: aDummy } };
                try {
                    await cds.run(cqnQueryD);
                    aDummy = [];
                }
                catch (e) {
                    GenF.log(`Updation of Dummy Products data failed`);
                    console.log(e);
                }
            }

        }

        // if (aDummy.length > 0) {
        //     const keysDummy = ['DUMMY_PRODUCTID', 'LOCATION_ID', 'FACTORY_LOC'];
        //     aDummy.sort(GenF.dynamicSortMultiple("DUMMY_PRODUCTID", "LOCATION_ID", "FACTORY_LOC"));
        //     aDummy = GenF.removeDuplicate(aDummy, keysDummy);

        //     let cqnQueryD = { UPSERT: { into: { ref: ['CP_DUMMY_PRODUCT_LOC'] }, entries: aDummy } };
        //     try {
        //         // await cds.run(cqnQueryD);
        //     }
        //     catch (e) {
        //         GenF.log(`Updation of Dummy Products data failed`);
        //         console.log(e);
        //     }
        // }
    }

    async createDummy(iConfigProd, iParentLocation, iParentProduct, aBOMData, aClassData, aDummy,configLocation) {
        let configLoc = configLocation;
        if (aClassData[iConfigProd] === undefined) {
            aClassData[iConfigProd] = [];
        }
        if (aClassData[iParentProduct] !== undefined) {
            aClassData[iConfigProd] = [...aClassData[iParentProduct], ...aClassData[iConfigProd]];
        }

        if (aBOMData[iParentLocation] === undefined) {
            aBOMData[iParentLocation] = {};
        }
        if (aBOMData[iParentLocation][iParentProduct] === undefined) {
            aBOMData[iParentLocation][iParentProduct] = [];
        }
        let aChildProducts = aBOMData[iParentLocation][iParentProduct];

        GenF.log(`Started Processing BOM for Parent Product '${iParentProduct}' `);
        for (let i = 0; i < aChildProducts.length; i++) {
            if(configLoc !== aChildProducts[i].CHILD_LOC){
            if (iParentLocation !== aChildProducts[i].CHILD_LOC) {
                let oDummyProd = {};
                oDummyProd.PRODUCT_ID = `${iConfigProd}`;
                oDummyProd.DUMMY_PRODUCTID = `${iConfigProd}_${aChildProducts[i].CHILD_LOC}`;
                oDummyProd.LOCATION_ID = aChildProducts[i].CHILD_LOC;
                oDummyProd.FACTORY_LOC = aChildProducts[i].CHILD_LOC;
                aDummy.push(GenF.parse(oDummyProd));

                oDummyProd = {};
                oDummyProd.PRODUCT_ID = `${iConfigProd}`;
                oDummyProd.DUMMY_PRODUCTID = `${iConfigProd}_${aChildProducts[i].CHILD_LOC}`;
                oDummyProd.LOCATION_ID = iParentLocation;
                oDummyProd.FACTORY_LOC = aChildProducts[i].CHILD_LOC;
                aDummy.push(GenF.parse(oDummyProd));
            }
        }
            if (aChildProducts[i].PHANTOM_IND === 'X' || aChildProducts[i].CLASS_FLG === 'X' || aChildProducts[i].CONFIGURABLE === 'X') {
                await this.createDummy(iConfigProd, aChildProducts[i].CHILD_LOC, aChildProducts[i].MAT_CHILD, aBOMData, aClassData, aDummy,configLoc);
            }
        }
    }

    async updateActualQtyForecast(adata, flag) {
        let aCIRData = [], oCIRData = {};
        let aUID_PID = [], aActSalesData = [], oActSalesData = {};
        let aActSalesOrd = [];
        let aProdOrdData = [];
        let oCIRDataMap = [];
        let iMaxCIRID = 0;
        let lDate = new Date();
        lDate.setDate(lDate.getDate());
        lDate = lDate.toISOString().split('T')[0];
        let telescoppicDate = await cds.run(`SELECT * from CP_IBPCALENDER_WEEK 
                                                            where WEEK_STARTDATE <= '${lDate}' 
                                                            and WEEK_ENDDATE >= '${lDate}'
                                                            and LEVEL = 'W'`);
                        lDate = telescoppicDate.length > 0 ? new Date(telescoppicDate[0].WEEK_STARTDATE) : new Date(lDate);
        let iProdOrd_Qty = 0;
        let oReturn = {
            bError: false,
            message: ''
        };
        let aActAsmbReq = {};

        aCIRData = await cds.run(`SELECT DISTINCT *
                                  FROM CP_CIR_GENERATED
                                  WHERE LOCATION_ID    = '${adata.LOCATION_ID}'
                                    AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
                                    AND VERSION        = '${adata.VERSION}'                             
                                    AND SCENARIO       = '${adata.SCENARIO}'                            
                                    AND MODEL_VERSION  = '${adata.MODEL_VERSION}'`);
        if (aCIRData.length > 0) {
            let aCIRUpdtData = aCIRData.map(item => {
                item.ACTUAL_QTY = 0;
                item.UNCONSUMED_FORECAST = item.CIR_QTY;
                item.OPEN_ASSEMBLY = item.CIR_QTY;
                item.PRODORD_QTY = 0.000;              // 2025-08-06
                return item;
            });
            aCIRData = aCIRUpdtData;
        }       

        // Fetch Maximum Number of CIR_ID
        iMaxCIRID = await cds.run(
            `SELECT MAX(CIR_ID) AS MAX_CIR_ID FROM "CP_CIR_GENERATED"`
        );
        iMaxCIRID = iMaxCIRID[0].MAX_CIR_ID;

        aActSalesData = await cds.run(`SELECT DISTINCT A.LOCATION_ID,
                                                    A.PRODUCT_ID,
                                                    B.UNIQUE_ID,
                                                    A.PRIMARY_ID,
                                                    A.PRPID,
                                                    A.UID,
                                                    B.WEEK_DATE,
                                                    B.ORD_QTY
                                        FROM V_UID_PID_PRPID AS A
                                        INNER JOIN V_SALESORDER_FUTURE AS B
                                            ON B.LOCATION_ID = A.LOCATION_ID
                                            AND B.PRODUCT_ID = A.PRODUCT_ID
                                            AND B.UNIQUE_ID = A.UNIQUE_ID
                                            AND B.PRIMARY_ID = A.PRIMARY_ID 
                                        WHERE A.LOCATION_ID = '${adata.LOCATION_ID}'
                                            AND A.PRODUCT_ID = '${adata.PRODUCT_ID}'
                                            AND B.WEEK_DATE >= '${lDate.toISOString().split("T")[0]}'
                                            ORDER BY UNIQUE_ID,
                                                    WEEK_DATE`);
        
        // aProdOrdData = await cds.run(`SELECT DISTINCT UNIQUE_ID,
        //                                               WEEK_DATE,
        //                                               SUM(PRODORD_QTY) AS PRODORD_QTY
        //                                 FROM V_PRODORD_QTY 
        //                                WHERE LOCATION_ID = '${adata.LOCATION_ID}'
        //                                  AND PRODUCT_ID = '${adata.PRODUCT_ID}'
        //                                  AND WEEK_DATE >= '${lDate.toISOString().split("T")[0]}'
        //                                  GROUP BY UNIQUE_ID,
        //                                           WEEK_DATE
        //                                  ORDER BY UNIQUE_ID,
        //                                           WEEK_DATE`);  
        
        aProdOrdData = await cds.run(`SELECT DISTINCT UNIQUE_ID,
                                                      WEEK_DATE,
                                                      SUM(PRODORD_QTY) AS PRODORD_QTY
                                        FROM V_PRODORD_QTY 
                                       WHERE PRODUCT_ID = '${adata.PRODUCT_ID}'
                                         AND WEEK_DATE >= '${lDate.toISOString().split("T")[0]}'
                                         GROUP BY UNIQUE_ID,
                                                  WEEK_DATE
                                         ORDER BY UNIQUE_ID,
                                                  WEEK_DATE`);  

        if (aProdOrdData.length > 0) {
            for (let j = 0; j < aProdOrdData.length; j++) {

                if (aActAsmbReq[aProdOrdData[j].UNIQUE_ID] === undefined) {
                    aActAsmbReq[aProdOrdData[j].UNIQUE_ID] = {};
                }

                if (aActAsmbReq[aProdOrdData[j].UNIQUE_ID][aProdOrdData[j].WEEK_DATE] === undefined) {
                    aActAsmbReq[aProdOrdData[j].UNIQUE_ID][aProdOrdData[j].WEEK_DATE] = {};
                }
                aActAsmbReq[aProdOrdData[j].UNIQUE_ID][aProdOrdData[j].WEEK_DATE].PRODORD_QTY = parseFloat(aProdOrdData[j].PRODORD_QTY);
            }
        }

        if (aActSalesData.length > 0) {
            const keys = ['LOCATION_ID', 'PRODUCT_ID', 'UNIQUE_ID', 'PRIMARY_ID', 'PRPID', 'WEEK_DATE'];
            aActSalesData.sort(GenF.dynamicSortMultiple("LOCATION_ID", "PRODUCT_ID", "UNIQUE_ID", "PRIMARY_ID", "PRPID", "WEEK_DATE"));
            aActSalesData = GenF.removeDuplicate(aActSalesData, keys);
            for (let i = 0; i < aActSalesData.length; i++) {
                iProdOrd_Qty = 0
                if (aActAsmbReq[aActSalesData[i].UNIQUE_ID] !== undefined && aActAsmbReq[aActSalesData[i].UNIQUE_ID][aActSalesData[i].WEEK_DATE] !== undefined) {
                    iProdOrd_Qty = aActAsmbReq[aActSalesData[i].UNIQUE_ID][aActSalesData[i].WEEK_DATE].PRODORD_QTY;
                }

                for (let j = 0; j < aCIRData.length; j++) {
                    // aCIRData[j].OPEN_ASSEMBLY = aCIRData[j].CIR_QTY;
                    if (aActSalesData[i].UID === aCIRData[j].UNIQUE_ID &&
                        aActSalesData[i].WEEK_DATE === aCIRData[j].WEEK_DATE) {
                            // aCIRData[j].ACTUAL_QTY = aCIRData[j].ACTUAL_QTY + parseInt(aActSalesData[i].ORD_QTY);
                            if(flag === 'X' ){
                                aCIRData[j].ACTUAL_QTY = aCIRData[j].ACTUAL_QTY + parseInt(aActSalesData[i].ORD_QTY);
                           if (aCIRData[j].CIR_QTY >= aCIRData[j].ACTUAL_QTY) {
                            let value = parseInt(aCIRData[j].CIR_QTY) - parseInt(aCIRData[j].ACTUAL_QTY);
                            aCIRData[j].UNCONSUMED_FORECAST = value >= 0 ? value : 0;
                        } else {
                            aCIRData[j].UNCONSUMED_FORECAST = 0;
                        }
                            } 
                    //         else {

                    //         if (aCIRData[j].CIR_QTY >= aCIRData[j].ACTUAL_QTY) {
                    //         let value = parseInt(aCIRData[j].CIR_QTY) - parseInt(aCIRData[j].ACTUAL_QTY);
                    //         aCIRData[j].UNCONSUMED_FORECAST = value >= 0 ? value : 0;
                    //     }
                    // }
                        // aCIRData[j].UNCONSUMED_FORECAST = 0;
                        // // aCIRData[j].PRODORD_QTY = parseFloat(iProdOrd_Qty);

                        // if (aCIRData[j].CIR_QTY >= aCIRData[j].ACTUAL_QTY) {                             
                        //     aCIRData[j].UNCONSUMED_FORECAST = parseInt(aCIRData[j].CIR_QTY) - parseInt(aCIRData[j].ACTUAL_QTY);
                        // }

                        aCIRData[j].PRODORD_QTY = parseFloat(aCIRData[j].PRODORD_QTY) + parseFloat(iProdOrd_Qty);
                        if (aCIRData[j].CIR_QTY >= aCIRData[j].PRODORD_QTY) {
                            aCIRData[j].OPEN_ASSEMBLY = parseInt(aCIRData[j].CIR_QTY) - parseInt(aCIRData[j].PRODORD_QTY);
                        }

                        // if (aCIRData[j].CIR_QTY > aCIRData[j].ACTUAL_QTY) {
                        //     aCIRData[j].UNCONSUMED_FORECAST = parseInt(aCIRData[j].CIR_QTY) - parseInt(aCIRData[j].ACTUAL_QTY);
                        //     aCIRData[j].OPEN_ASSEMBLY = parseInt(aCIRData[j].CIR_QTY) - parseInt(aCIRData[j].ACTUAL_QTY);
                        // }

                        // // aCIRData[j].PRODORD_QTY = parseFloat(aCIRData[j].PRODORD_QTY) + parseFloat(iProdOrd_Qty);
                        // aCIRData[j].PRODORD_QTY = parseFloat(iProdOrd_Qty);
                        // if (aCIRData[j].CIR_QTY >= iProdOrd_Qty) {
                        //     aCIRData[j].OPEN_ASSEMBLY = parseInt(aCIRData[j].CIR_QTY) - parseInt(aCIRData[j].PRODORD_QTY);
                        // }

                        aActSalesData[i].ORD_QTY = 0;
                    }
                }


                    if (parseInt(aActSalesData[i].ORD_QTY) > 0) {
                        oCIRData = {};
                        iMaxCIRID = iMaxCIRID + 1;
                        oCIRData.LOCATION_ID = aActSalesData[i].LOCATION_ID;
                        oCIRData.PRODUCT_ID = aActSalesData[i].PRODUCT_ID
                        oCIRData.UNIQUE_ID = aActSalesData[i].UID;
                        oCIRData.WEEK_DATE = aActSalesData[i].WEEK_DATE;
                        oCIRData.CIR_ID = iMaxCIRID;
                        oCIRData.MODEL_VERSION = adata.MODEL_VERSION;
                        oCIRData.VERSION = adata.VERSION;
                        oCIRData.SCENARIO = adata.SCENARIO;
                        oCIRData.CIR_QTY = 0;
                        oCIRData.SNAPSHOT_CHK = 'X';
                        oCIRData.ACTUAL_QTY = parseInt(aActSalesData[i].ORD_QTY);
                        oCIRData.UNCONSUMED_FORECAST = 0;
                        oCIRData.PRODORD_QTY = parseFloat(iProdOrd_Qty);
                        oCIRData.OPEN_ASSEMBLY = 0;

                        aCIRData.push(GenF.parse(oCIRData));

                        aActSalesData[i].ORD_QTY = 0;
                    }                
                // }
            }
        }

        if (aCIRData.length > 0) {

            // let cqnQuery = { UPSERT: { into: { ref: ['CP_CIR_GENERATED'] }, entries: aCIRData } };
            // try {
            //     await cds.run(cqnQuery);
            //     GenF.log(`Successfully updated Forecast Orders data for Location Product: ${adata.LOCATION_ID}, ${adata.PRODUCT_ID}`);
            //     oReturn.message = "Successfully updated Actual Forecast Orders Quantity data for Location Product: " + adata.LOCATION_ID + adata.PRODUCT_ID;
            // }
            // catch (e) {
            //     GenF.log(`Updation of Forecast Orders data for Location Product: +${adata.LOCATION_ID}, +${adata.PRODUCT_ID} failed`);
            //     oReturn.message = "Updation of Actual Forecast Orders Quantity data failed for Location Product: " + adata.LOCATION_ID + adata.PRODUCT_ID+".Reason: "+e.message;
            // }
            let count = 0;
            let flag = '';
             if(aCIRData.length > 10000){
                            const CHUNK = 5000;

                                for (let i = 0; i < aCIRData.length; i += CHUNK) {
                                    const batch = aCIRData.slice(i, i + CHUNK);
                            let cqnQuery = { UPSERT: { into: { ref: ['CP_CIR_GENERATED'] }, entries: batch } };
                                        try {
                                            await cds.run(cqnQuery);
                                        } catch (e) {
                                            flag = 'X';
                                            console.log('Error');
                                        }
                                    console.log(`Inserted ${i + batch.length}`);
                                }
                        } else {

                        let cqnQuery = { UPSERT: { into: { ref: ['CP_CIR_GENERATED'] }, entries: aCIRData } };
                        try {
                            await cds.run(cqnQuery);
                        } catch (e) {
                            flag = 'X';
                            console.log('Error');
                        }
                    }
                    if(flag == ''){
                        GenF.log(`Successfully updated Forecast Orders data for Location Product: ${adata.LOCATION_ID}, ${adata.PRODUCT_ID}`);
                oReturn.message = "Successfully updated Actual Forecast Orders Quantity data for Location Product: " + adata.LOCATION_ID + adata.PRODUCT_ID;
                    } else {
                         GenF.log(`Updation of Forecast Orders data for Location Product: +${adata.LOCATION_ID}, +${adata.PRODUCT_ID} failed`);
                oReturn.message = "Updation of Actual Forecast Orders Quantity data failed for Location Product: " + adata.LOCATION_ID + adata.PRODUCT_ID+".Reason: "+e.message;
            
                    }
            
        }
        return oReturn;
    }

   async dataValidationAlert(req,flag) {
        var alertData =[];
        if(flag == 'CIR'){
            alertData = await cds.run(`SELECT
                'VCPLANNER' AS APPL,
                'DATA' AS MSGGRP,
                'S06' AS MSGID,
                LOCATION_ID,
                PRODUCT_ID,
                VERSION AS PARA2,
                SCENARIO AS PARA3,
                MODEL_VERSION PARA4,
                LEFT(STRING_AGG(WEEK_DATE, ','), 5000) AS MSGTXT
                FROM (
                SELECT DISTINCT 
                    LOCATION_ID,
                    PRODUCT_ID,
                    VERSION,
                    SCENARIO,
                    MODEL_VERSION,
                    WEEK_DATE
                FROM "CP_CIR_GENERATED"
                WHERE "ACTUAL_QTY" > "CIR_QTY"
                AND WEEK_DATE>= CURRENT_DATE
                ) AS dedup
                GROUP BY LOCATION_ID, PRODUCT_ID, VERSION, SCENARIO, MODEL_VERSION;
                `)
        }
        else if(flag == 'ACTUAL_DEMAND'){
            let aData = await cds.run(`WITH IBP_AGG AS (
    SELECT 
        LOCATION_ID,
        PRODUCT_ID,
        CUSTOMER_GROUP,
        WEEK_DATE,
        SUM(QUANTITY) AS SUM_IBP_QTY
    FROM CP_IBP_FUTUREDEMAND_LOCPRODCUST
    GROUP BY 
        LOCATION_ID, PRODUCT_ID, CUSTOMER_GROUP, WEEK_DATE
)

SELECT 
    S.LOCATION_ID,
    S.PRODUCT_ID,
    S.CUSTOMER_GROUP,
    S.WEEK_DATE,
    SUM(S.ORD_QTY) AS SUM_ORD_QTY,
    IA.SUM_IBP_QTY
FROM V_SALESALL_WEEK AS S
INNER JOIN IBP_AGG AS IA
    ON IA.LOCATION_ID = S.LOCATION_ID
    AND IA.PRODUCT_ID = S.PRODUCT_ID
    AND IA.CUSTOMER_GROUP = S.CUSTOMER_GROUP
    AND IA.WEEK_DATE = S.WEEK_DATE
GROUP BY 
    S.LOCATION_ID,
    S.PRODUCT_ID,
    S.CUSTOMER_GROUP,
    S.WEEK_DATE,
    IA.SUM_IBP_QTY
HAVING 
    SUM(S.ORD_QTY) > IA.SUM_IBP_QTY`);
               if (aData.length > 0) {
    const grouped = aData.reduce((acc, curr) => {
        const key = `${curr.LOCATION_ID}||${curr.PRODUCT_ID}||${curr.CUSTOMER_GROUP}`; // unique key
        if (!acc[key]) {
            acc[key] = {
                LOCATION_ID: curr.LOCATION_ID,
                PRODUCT_ID: curr.PRODUCT_ID,
                CUSTOMER_GROUP: curr.CUSTOMER_GROUP,
                WEEK_DATES: []
            };
        }
        acc[key].WEEK_DATES.push(curr.WEEK_DATE);
        return acc;
    }, {});

    alertData = Object.values(grouped).map(item => {
        let msgTxt = [...new Set(item.WEEK_DATES)]  // remove duplicates
            .sort()                               
            .join(',');

        // truncate if length > 5000
        if (msgTxt.length > 5000) {
            msgTxt = msgTxt.slice(0, 4995) + '...';
        }

        return {
            APPL: "VCPLANNER",
            MSGGRP: "DATA",
            MSGID: "S09",
            PARA1: item.CUSTOMER_GROUP,
            PARA2: '',
            PARA3: '',
            LOCATION_ID: item.LOCATION_ID,
            PRODUCT_ID: item.PRODUCT_ID,
            MSGTXT: msgTxt
        };
    });
}

        }
        else if (flag === "ACTUAL_DEMAND_VC") {
                const data = await cds.run(`SELECT DISTINCT
                            'DATA' AS MSGGRP,
                            'VCPLANNER' AS APPL,
                            'S10' AS MSGID,
                            LEFT(STRING_AGG(A.WEEK_DATE, ','), 5000) AS MSGTXT,
                            A.LOCATION_ID,
                            A.PRODUCT_ID,
                            A.CUSTOMER_GROUP AS PARA1,
                            B.VERSION AS PARA2,
                            B.SCENARIO AS PARA3,
                            B.MODEL_VERSION AS PARA4,
                            A.CHAR_NAME AS PARA5,
                            A.CHAR_VALUE AS PARA6,
                            A.CHAR_NUM,
                            A.CHARVAL_NUM,
                            SUM(A.ORD_QTY) AS TOTAL_ORD_QTY,
                            SUM(B.OPT_QTY) AS OPT_QTY
                        FROM
                            V_SALESUNQ_DATA A
                        INNER JOIN
                            V_OPTION_PERCENTAGE B
                            ON A.LOCATION_ID = B.LOCATION_ID
                            AND A.PRODUCT_ID = B.PRODUCT_ID
                            AND A.CUSTOMER_GROUP = B.CUSTOMER_GROUP
                            AND A.CHAR_NUM = B.CHAR_NUM
                            AND A.CHARVAL_NUM = B.CHARVAL_NUM
                            AND A.WEEK_DATE = B.WEEK_DATE
                        WHERE
                            B.KEY_FIG_ID = 1
                        GROUP BY
                            A.LOCATION_ID,
                            A.PRODUCT_ID,
                            A.CUSTOMER_GROUP,
                            B.MODEL_VERSION,
                            A.CHAR_NUM,
                            A.CHARVAL_NUM,
                            B.VERSION,
                            B.SCENARIO,
                            A.CHAR_NAME,
                            A.CHAR_VALUE,
                            A.SALES_DOC,
                            A.WEEK_DATE
                        HAVING
                            SUM(A.ORD_QTY) > SUM(B.OPT_QTY)
                        `)

                alertData = data.map(r => ({
                    APPL: r.APPL,
                    MSGID: r.MSGID,
                    MSGGRP: r.MSGGRP,
                    MSGTXT: [...new Set(r.MSGTXT.split(','))].join(','),
                    LOCATION_ID: r.LOCATION_ID,
                    PRODUCT_ID: r.PRODUCT_ID,
                    PARA1: r.PARA1,
                    PARA2: r.PARA2,
                    PARA3: r.PARA3,
                    PARA4: r.PARA4,
                    PARA5: r.PARA5,
                    PARA6: r.PARA6
                }));
        }
        else if(flag == 'RTR_CAPACITY'){
            alertData = await cds.run(`SELECT 
    'VCPLANNER' AS APPL,
    'RESTRICTIONS' AS MSGGRP,
    'S01' AS MSGID,
    LOCATION_ID,
    '*' AS PRODUCT_ID,
    VERSION AS PARA2,
    SCENARIO AS PARA3,
    MODEL_VERSION AS PARA4,
    LEFT(STRING_AGG(RESTRICTION, ','), 5000) AS MSGTXT
FROM (
    SELECT DISTINCT LOCATION_ID, VERSION, SCENARIO, MODEL_VERSION, RESTRICTION
    FROM "V_RSTRREQ_PRODCONSD"
    WHERE "VERSION"='__BASELINE' 
      AND "SCENARIO"='_PLAN' 
      AND "RTR_QTY" > COALESCE("RESTRICTIONAVAIL_QTY", 0)
) AS DISTINCT_DATA
        GROUP BY LOCATION_ID, VERSION, SCENARIO, MODEL_VERSION`);
        }
     
            if(alertData.length>0){
                await GenF.sendAlert('C', alertData, req);
            }
    }
 

}
module.exports = Catservicefn;