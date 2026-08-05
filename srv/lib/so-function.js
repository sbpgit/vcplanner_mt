const request = require('request');
const GenF = require("./gen-functions");
const cds = require("@sap/cds");
const Catservicefn = require("./catservice-function");
const DerivedConfig = require("./derivedchars-functions");
const AsmbFunctions = require("./assembly-req");
const oAsmbReq = new AsmbFunctions();
const GenFunctions = require("./gen-functions");

class SOFunctions {
    /**
     * Constructor
     */
    constructor() { }

    /**
     * Generate Unique ID
     * @param {Data} adata 
     */
    async genUniqueID(adata, req, Flag) {
        var oReturn = {
            bError: false,
            message: ''
        }
        const objDerConfig = new DerivedConfig();
        GenF.log("Tech: Function genUniqueID");
        GenF.log("Started Sales Orders Processing");

        await this.processUniqueID(adata.LOCATION_ID, adata.PRODUCT_ID, '', req);
        GenF.log("Process Unique Id complete"); 

         /** Moved function call to ImportECCBOM in SDI-Service.js
        await this.generateDummy();
        GenF.log("Generate Dummy Product complete");
        */

        
        // await this.saveClusterData(adata.LOCATION_ID, adata.PRODUCT_ID);
        // GenF.log("Save Clustering Data complete");


        //Process to calculate ValidFrom and ValidTo from Rules
        let bUIDVldty = await GenF.getParameterValue(adata.LOCATION_ID, 14);
        if (bUIDVldty === 'true') {
            await objDerConfig.genConfigValidityRules(adata.LOCATION_ID, adata.PRODUCT_ID);
            GenF.log("Rules Validation complete");
        }

        // Process to Update Validity Dates for Primary Ids
        await this.updatePrimaryIdValidity(adata.LOCATION_ID, adata.PRODUCT_ID);
        GenF.log("Primary ID validation complete");

        // Begin Of Process ValidFrom and ValidTo from Unique Ids to be sent to IBP
        await this.genConfigValidity(adata.LOCATION_ID, adata.PRODUCT_ID);
        GenF.log("Configuration Validity complete");

        /** Begin Of Derived Percentage */
        // Fetch History weeks
        let iHisWeeks = await GenF.getParameterValue(adata.LOCATION_ID, 4);

        if (iHisWeeks === '' || iHisWeeks === null || iHisWeeks === undefined) {
            oReturn.bError = true;
            oReturn.message = `Missing history consideration in planning config, could not process generation of rule percent! for Location: ${adata.LOCATION_ID} 
                                and Product: ${adata.PRODUCT_ID}`;
        } else {
            // await GenF.jobSchMessage('X', 'Started Processing Rule Percentage for Sales History', req);
            // await objDerConfig.genSalesHRulePercentage(adata.LOCATION_ID, adata.PRODUCT_ID, iHisWeeks);
            // await GenF.jobSchMessage('X', 'Completed Processing Rule Percentage for Sales History', req);
            oReturn.bError = false;
            oReturn.message = `Completed Processing Rule Percentage for Sales History`;
        }


        GenF.log("SO Process Completed");
        return oReturn;
    }

    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
    async processUniqueID(lLocation, lProduct, lSO, req) {

        let liSalesh = await this.getSalesHistory(lLocation, lProduct, lSO);
        GenF.log("Order Count: " + liSalesh.length);

        const liUniqueData = await this.getUnique(lProduct);


        let liSOHM = [];
        let lsSOHM = {};
        let liUnique = [];
        let lsUnique = {};

        // Determin if there is any change in Sales Config
        const liSalesUnique = await cds.run(
            `SELECT *
                FROM V_SALES_H
                WHERE LOCATION_ID   = '${lLocation}'
                    AND REF_PRODID   = '${lProduct}'`);
            
        GenF.log("Started UniqueID check");
        // Determine Unique ID
        const aTotalSalesh = liSalesh;
         liSalesh = await this.removeDuplicates(liSalesh);
        async function updateSimilarConfigData(sData,length,liUniqueData,_liUnique,UNIQUE_ID,PRIMARY_ID,Flag){
            let aData = aTotalSalesh.filter(a=>a.CONFIG?.length === length)?.filter(f=>JSON.stringify(f.CONFIG) === sData);
            //for this data ,filter which doesn't exist in V_SALES_H
            var aReturn =[];
            for(let a =0; a< aData?.length; a++){
                let lsSalesUnique = {},el = aData[a];
                lsSalesUnique = liSalesUnique.find((lsSales) => lsSales.SALES_DOC === el.SALES_DOC &&
                    lsSales.SALESDOC_ITEM === el.SALESDOC_ITEM
                );
                if(!lsSalesUnique){
                   let lsSOHM = {};
                    lsSOHM['SALES_DOC'] = GenF.parse(el.SALES_DOC);
                    lsSOHM['SALESDOC_ITEM'] = GenF.parse(el.SALESDOC_ITEM);
                    lsSOHM['PRODUCT_ID'] = GenF.parse(lProduct);
                    lsSOHM['LOCATION_ID'] = GenF.parse(lLocation);
                    lsSOHM['UNIQUE_ID'] = UNIQUE_ID;
                    lsSOHM['CONFIG'] = GenF.parse(el.CONFIG);
                    lsSOHM['PCONFIG'] = GenF.parse(el.PCONFIG);
                    lsSOHM['PRIMARY_ID'] = PRIMARY_ID;
                    lsSOHM['MATERIAL_VARIANT'] = GenF.parse(el.MATERIAL_VARIANT);

                    if(Flag != 'X'){//Will be executed only if  unique_id already exists
                        const saleshPConfig = JSON.stringify(el.PCONFIG);
                        lsSOHM['PRIMARY_ID'] = liUniqueData.find(f=>JSON.stringify(f['CONFIG']) === saleshPConfig && lsSOHM['PRIMARY_ID'] === 0)?.UNIQUE_ID ?? 0;
                    }
                    aReturn.push(lsSOHM);
                }
            }
            return aReturn;
        }
        for (let cntSO = 0; cntSO < liSalesh.length; cntSO++) {

            // Get the existing unique ID
            let lsSalesUnique = {};
            lsSalesUnique = liSalesUnique.find((lsSales) => lsSales.SALES_DOC === liSalesh[cntSO].SALES_DOC &&
                lsSales.SALESDOC_ITEM === liSalesh[cntSO].SALESDOC_ITEM
            );
            if (lsSalesUnique) {
                // Check if there is any change in sales order config
                let lsUnique = {};
                lsUnique = liUniqueData.find((lsUnique) =>
                    lsUnique.UNIQUE_ID === lsSalesUnique.UNIQUE_ID
                );
                if (lsUnique) {
                    if (JSON.stringify(liSalesh[cntSO].CONFIG) === JSON.stringify(lsUnique['CONFIG'])) {
                        //check for similar config and add unique_id
                     let aData = await updateSimilarConfigData(JSON.stringify(liSalesh[cntSO].CONFIG),liSalesh[cntSO].CONFIG.length,liUniqueData,liUnique,lsUnique.UNIQUE_ID,0,'');
                     liSOHM = liSOHM.concat(aData); 
                     continue;
                    }
                }
            };

            lsSOHM = {};
            lsSOHM['SALES_DOC'] = GenF.parse(liSalesh[cntSO].SALES_DOC);
            lsSOHM['SALESDOC_ITEM'] = GenF.parse(liSalesh[cntSO].SALESDOC_ITEM);
            lsSOHM['PRODUCT_ID'] = GenF.parse(lProduct);
            lsSOHM['LOCATION_ID'] = GenF.parse(lLocation);
            lsSOHM['UNIQUE_ID'] = 0;
            lsSOHM['PRIMARY_ID'] = 0;
            lsSOHM['CONFIG'] = GenF.parse(liSalesh[cntSO].CONFIG);
            lsSOHM['PCONFIG'] = GenF.parse(liSalesh[cntSO].PCONFIG);
            lsSOHM['MATERIAL_VARIANT'] = GenF.parse(liSalesh[cntSO].MATERIAL_VARIANT)

            // Check if Unique ID already exists  
            // for (let cntUID = 0; cntUID < liUniqueData.length; cntUID++) {
            //     if ((JSON.stringify(liSalesh[cntSO].CONFIG) === JSON.stringify(liUniqueData[cntUID]['CONFIG'])) &&
            //         lsSOHM['UNIQUE_ID'] === 0) {
            //         lsSOHM['UNIQUE_ID'] = GenF.parse(liUniqueData[cntUID].UNIQUE_ID);
            //     }
            //     if ((JSON.stringify(liSalesh[cntSO].PCONFIG) === JSON.stringify(liUniqueData[cntUID]['CONFIG'])) &&
            //         lsSOHM['PRIMARY_ID'] === 0) {
            //         lsSOHM['PRIMARY_ID'] = GenF.parse(liUniqueData[cntUID].UNIQUE_ID);
            //     }

            //     if (lsSOHM["UNIQUE_ID"] > 0 && lsSOHM["PRIMARY_ID"] > 0) {
            //         break;
            //     }
            // }

            //Newcode
            const saleshConfig = JSON.stringify(liSalesh[cntSO].CONFIG),
            saleshPConfig = JSON.stringify(liSalesh[cntSO].PCONFIG);
            lsSOHM['UNIQUE_ID'] = liUniqueData.find(f=>JSON.stringify(f['CONFIG']) === saleshConfig && lsSOHM['UNIQUE_ID'] === 0)?.UNIQUE_ID ?? 0;
            lsSOHM['PRIMARY_ID'] = liUniqueData.find(f=>JSON.stringify(f['CONFIG']) === saleshPConfig && lsSOHM['PRIMARY_ID'] === 0)?.UNIQUE_ID ?? 0;

            lsUnique = {};
            lsUnique['CONFIG'] = [];

            if (lsSOHM['UNIQUE_ID'] === 0) {
                lsUnique['CONFIG'] = liSalesh[cntSO].CONFIG;
                lsUnique['UID_TYPE'] = 'U';
                // If Unique ID is already planned to be created, do not add again
                for (let cntU = 0; cntU < liUnique.length; cntU++) {
                    if (JSON.stringify(lsUnique['CONFIG']) === JSON.stringify(liUnique[cntU].CONFIG)) {
                        lsUnique['CONFIG'] = []
                        break;
                    }
                }
            }
            if (lsUnique['CONFIG'].length > 0) {
                liUnique.push(lsUnique);
            }

            lsUnique = {};
            lsUnique['CONFIG'] = [];

            if (lsSOHM['PRIMARY_ID'] === 0) {
                lsUnique['CONFIG'] = liSalesh[cntSO].PCONFIG;
                lsUnique['UID_TYPE'] = 'P';
                // If Unique ID is already planned to be created, do not add again
                //Old Code
                // for (let cntU = 0; cntU < liUnique.length; cntU++) {
                //     if (JSON.stringify(lsUnique['CONFIG']) === JSON.stringify(liUnique[cntU].CONFIG)) {
                //         lsUnique['CONFIG'] = []
                //         break;
                //     }
                // }

                //New Code
                let oRec = liUnique.find(f=>JSON.stringify(f['CONFIG']) === JSON.stringify(lsUnique['CONFIG'] && f.UID_TYPE === 'P'));
                if(oRec){
                 lsUnique['CONFIG'] = []
                }
            }

            if (lsUnique['CONFIG'].length > 0) {
                liUnique.push(lsUnique);
            }

            liSOHM.push(lsSOHM);

        }

        liSalesh = null;
        for (let cntU = 0; cntU < liUnique.length; cntU++) {
            if (liUnique[cntU]['CONFIG'].length > 0) {

                // Get the last next available unique ID number
                const lsUniqueInd = await SELECT.one.columns("MAX(UNIQUE_ID) + 1 AS MAX_ID")
                    .from('CP_UNIQUE_ID_HEADER');
                if (lsUniqueInd.MAX_ID === null) {
                    liUnique[cntU]['UNIQUE_ID'] = 1;
                } else {
                    liUnique[cntU]['UNIQUE_ID'] = parseInt(lsUniqueInd.MAX_ID);
                }

                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_UNIQUE_ID_HEADER'] },
                        values: [
                            liUnique[cntU].UNIQUE_ID,
                            lProduct,
                            liUnique[cntU].UNIQUE_ID.toString(),
                            liUnique[cntU].UID_TYPE,
                            0.0,
                            true,
                            ' ',
                            '2000-01-01',
                            '9999-12-31']
                    }
                })
                GenF.log("Unique ID Created: " + liUnique[cntU].UNIQUE_ID);


                // Update Sales Orders with Unique ID
                var aSimilarConfig =[];
                for (let cntSO = 0; cntSO < liSOHM.length; cntSO++) {
                    var bNewUniqueID = false;
                    if (liSOHM[cntSO].UNIQUE_ID === 0 &&
                        JSON.stringify(liSOHM[cntSO].CONFIG) ===
                        JSON.stringify(liUnique[cntU]['CONFIG'])) {
                            bNewUniqueID = true;
                        liSOHM[cntSO].UNIQUE_ID = liUnique[cntU].UNIQUE_ID;
                    }
                    if (liSOHM[cntSO].PRIMARY_ID === 0 &&
                        JSON.stringify(liSOHM[cntSO].PCONFIG) ===
                        JSON.stringify(liUnique[cntU]['CONFIG'])) {
                        liSOHM[cntSO].PRIMARY_ID = liUnique[cntU].UNIQUE_ID;
                    }
                    if(bNewUniqueID){
                        let aTempData = await updateSimilarConfigData(JSON.stringify(liSOHM[cntSO].CONFIG),liSOHM[cntSO].CONFIG.length,[],[],liSOHM[cntSO].UNIQUE_ID,liSOHM[cntSO].PRIMARY_ID,'X');
                        aSimilarConfig = aSimilarConfig.concat(aTempData); 
                    }

                }
                const keys = ['SALES_DOC', 'SALESDOC_ITEM', 'UNIQUE_ID', 'PRIMARY_ID','LOCATION_ID','PRODUCT_ID'];
                liSOHM = liSOHM.concat(aSimilarConfig);//concatenate to liSOHM
                liSOHM = GenF.removeDuplicate(liSOHM, keys);

                // Create unique ID Characteristics
                let liChar = [];
                let lsChar = {};
                for (let cntUC = 0; cntUC < liUnique[cntU]['CONFIG'].length; cntUC++) {
                    lsChar = {};
                    lsChar['UNIQUE_ID'] = GenF.parse(liUnique[cntU].UNIQUE_ID);
                    lsChar['PRODUCT_ID'] = GenF.parse(lProduct);
                    lsChar['CHAR_NUM'] = GenF.parse(liUnique[cntU]['CONFIG'][cntUC].CHAR_NUM);
                    lsChar['CHARVAL_NUM'] = GenF.parse(liUnique[cntU]['CONFIG'][cntUC].CHAR_VALUE);
                    lsChar['CHAR_VALUE'] = GenF.parse(liUnique[cntU]['CONFIG'][cntUC].CHAR_VALUE);
                    lsChar['UID_CHAR_RATE'] = 0
                    liChar.push(lsChar);
                }
                try {
                    await cds.run({
                        INSERT:
                        {
                            into: { ref: ['CP_UNIQUE_ID_ITEM'] },
                            entries: liChar
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                }

            }
        }

        GenF.log("Sales Orders updated Count: " + liSOHM.length);

        const liPartialProd = await cds.run(
            `SELECT *
                FROM V_PARTIALPRODCHAR
                WHERE REF_PRODID    = '${lProduct}'
                  AND LOCATION_ID   = '${lLocation}'
                ORDER BY LOCATION_ID,
                         PRODUCT_ID,
                         CLASS_NUM,
                         CHAR_NUM`
        );

        // 2024-04-26 - Begin
        let aPartialProd = [];
        if (liPartialProd.length > 0) {
            // Build nested array for Partial Product Data
            aPartialProd = liPartialProd.reduce((aProd, curr) => {
                const ITEM = [];
                const {
                    LOCATION_ID,
                    PRODUCT_ID,
                    CLASS_NUM,
                    CHAR_NUM,
                    CHAR_VALUE,
                } = curr;
                const findObj = aProd.find((o) => o.LOCATION_ID === LOCATION_ID && o.PRODUCT_ID === PRODUCT_ID);
                if (!findObj) {
                    ITEM.push({
                        LOCATION_ID,
                        PRODUCT_ID,
                        CLASS_NUM,
                        CHAR_NUM,
                        CHAR_VALUE,
                    });
                    aProd.push({ LOCATION_ID, PRODUCT_ID, ITEM });
                } else {
                    findObj.ITEM.push({
                        LOCATION_ID,
                        PRODUCT_ID,
                        CLASS_NUM,
                        CHAR_NUM,
                        CHAR_VALUE,
                    });
                }
                return aProd;
            }, []);
        }
        // 2024-04-26 - End

        let liSalesUpdate = [];
        let lsSalesUpdate = {};

        // Process through sales Order
        // 2024-04-26 - Begin
        let liPartialConfig = [];

        // Process through sales Order

        for (let cntSO = 0; cntSO < liSOHM.length; cntSO++) {
            let lIgnoreProduct = '';
            if(liSOHM[cntSO].MATERIAL_VARIANT !== "" || liSOHM[cntSO].MATERIAL_VARIANT !== undefined){
                liSOHM[cntSO].PRODUCT_ID = liSOHM[cntSO].MATERIAL_VARIANT;
            } else {

            // Process through Partial Product
            for (let cntPC = 0; cntPC < aPartialProd.length; cntPC++) {

                let lSuccess = '';
                liPartialConfig = [];
                
                // Filter array of objects based on another array
                liPartialConfig = liSOHM[cntSO].CONFIG.filter((el) => {
                    return aPartialProd[cntPC].ITEM.some((f) => {
                        return f.CHAR_NUM === el.CHAR_NUM && f.CHAR_VALUE === el.CHAR_VALUE;
                    });
                });
                // Check if length of filtered sales config matches with partial prod config
                if (liPartialConfig.length === aPartialProd[cntPC].ITEM.length) {
                    lSuccess = 'X';
                    liSOHM[cntSO].PRODUCT_ID = GenF.parse(aPartialProd[cntPC].PRODUCT_ID);
                    break;
                }
            }
        }

            await cds.run(
                `DELETE FROM CP_SALES_HM
                WHERE SALES_DOC   = '${liSOHM[cntSO].SALES_DOC}'
                    AND SALESDOC_ITEM    = '${liSOHM[cntSO].SALESDOC_ITEM}'`
            );

            lsSalesUpdate = {};
            lsSalesUpdate['SALES_DOC'] = GenF.parse(liSOHM[cntSO].SALES_DOC);
            lsSalesUpdate['SALESDOC_ITEM'] = GenF.parse(liSOHM[cntSO].SALESDOC_ITEM);
            lsSalesUpdate['PRODUCT_ID'] = GenF.parse(liSOHM[cntSO].PRODUCT_ID);
            lsSalesUpdate['LOCATION_ID'] = GenF.parse(liSOHM[cntSO].LOCATION_ID);
            lsSalesUpdate['UNIQUE_ID'] = GenF.parse(liSOHM[cntSO].UNIQUE_ID);
            lsSalesUpdate['PRIMARY_ID'] = GenF.parse(liSOHM[cntSO].PRIMARY_ID);
            liSalesUpdate.push(lsSalesUpdate);

        }
        // 2024-04-26 - End

        //         for (let cntSO = 0; cntSO < liSOHM.length; cntSO++) {
        //             let lIgnoreProduct = '';

        //             // Process through Partial Product
        //             for (let cntPC = 0; cntPC < liPartialProd.length; cntPC++) {

        //                 // Rest for every change in Partial Product
        //                 if (cntPC === 0 ||
        //                     liPartialProd[cntPC].LOCATION_ID !== liPartialProd[GenF.subOne(cntPC, liPartialProd.length)].LOCATION_ID ||
        //                     liPartialProd[cntPC].PRODUCT_ID !== liPartialProd[GenF.subOne(cntPC, liPartialProd.length)].PRODUCT_ID) {
        //                     lIgnoreProduct = '';
        //                 }

        //                 // Check if Partial product configuration matches with Sales Order Configuration
        //                 let lSuccess = '';
        //                 for (let cntSOC = 0; cntSOC < liSOHM[cntSO].CONFIG.length; cntSOC++) {

        //                     if (liSOHM[cntSO].CONFIG[cntSOC].CHAR_NUM === liPartialProd[cntPC].CHAR_NUM &&
        //                         liSOHM[cntSO].CONFIG[cntSOC].CHAR_VALUE === liPartialProd[cntPC].CHAR_VALUE) {
        //                         lSuccess = 'X';
        //                         break;
        //                     }


        //                 }
        //                 if (lSuccess === '') {
        //                     // Ignore this partial product as configuration of sales order is not matched
        //                     lIgnoreProduct = GenF.parse(liPartialProd[cntPC].PRODUCT_ID);
        //                 }

        //                 // For every change in Partial product
        //                 if (cntPC === GenF.addOne(cntPC, liPartialProd.length) ||
        //                     liPartialProd[cntPC].LOCATION_ID !== liPartialProd[GenF.addOne(cntPC, liPartialProd.length)].LOCATION_ID ||
        //                     liPartialProd[cntPC].PRODUCT_ID !== liPartialProd[GenF.addOne(cntPC, liPartialProd.length)].PRODUCT_ID) {
        //                     if (liPartialProd[cntPC].PRODUCT_ID !== lIgnoreProduct) {
        //                         liSOHM[cntSO].PRODUCT_ID = GenF.parse(liPartialProd[cntPC].PRODUCT_ID);
        //                         break;
        //                     }
        //                 }
        //             }


        // /*
        // let  liSalesConfig = [];

        //  liSalesConfig = liSOHM[cntSO].CONFIG.filter((el) => {
        //     return liPartialProd.some((f) => {
        //         return f.LOCATION_ID=== el.LOCATION_ID && f.CHAR_NUM === e;
        //     });
        // })
        // */

        //             await cds.run(
        //                 `DELETE FROM CP_SALES_HM
        //                 WHERE SALES_DOC   = '${liSOHM[cntSO].SALES_DOC}'
        //                     AND SALESDOC_ITEM    = '${liSOHM[cntSO].SALESDOC_ITEM}'`
        //             );

        //             lsSalesUpdate = {};
        //             lsSalesUpdate['SALES_DOC'] = GenF.parse(liSOHM[cntSO].SALES_DOC);
        //             lsSalesUpdate['SALESDOC_ITEM'] = GenF.parse(liSOHM[cntSO].SALESDOC_ITEM);
        //             lsSalesUpdate['PRODUCT_ID'] = GenF.parse(liSOHM[cntSO].PRODUCT_ID);
        //             lsSalesUpdate['LOCATION_ID'] = GenF.parse(liSOHM[cntSO].LOCATION_ID);
        //             lsSalesUpdate['UNIQUE_ID'] = GenF.parse(liSOHM[cntSO].UNIQUE_ID);
        //             lsSalesUpdate['PRIMARY_ID'] = GenF.parse(liSOHM[cntSO].PRIMARY_ID);
        //             liSalesUpdate.push(lsSalesUpdate);

        //         }
        
        if (liSalesUpdate.length > 0) {
            await INSERT(liSalesUpdate).into('CP_SALES_HM');
        }


        console.log("Process Completed");

        await this.updateUniqueRate(lLocation, lProduct);

        console.log("UID Rate Updated");

    }
    /**
     * Get Sales History
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
    async getSalesHistory(lLocation, lProduct, lSO) {

        let liSalesData = [];
        if (lSO === '') {
            liSalesData = await cds.run(
                `SELECT *
                    FROM CP_SALESH AS A
                    INNER JOIN CP_SALESH_CONFIG AS B
                        ON A.SALES_DOC = B.SALES_DOC
                        AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
                      WHERE A.LOCATION_ID   = '${lLocation}'
                        AND B.PRODUCT_ID    = '${lProduct}'
                        AND A.SALES_DOC NOT LIKE 'SE%'
                    ORDER BY A.SALES_DOC,
                            A.SALESDOC_ITEM,
                            B.CHAR_NUM,
                            B.CHARVAL_NUM`);
        } else {
            liSalesData = await cds.run(
                `SELECT *
                    FROM CP_SALESH AS A
                    INNER JOIN CP_SALESH_CONFIG AS B
                        ON A.SALES_DOC = B.SALES_DOC
                        AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
                      WHERE A.LOCATION_ID = '${lLocation}'
                        AND B.PRODUCT_ID  = '${lProduct}'
                        AND A.SALES_DOC   = '${lSO}'
                        AND A.SALES_DOC NOT LIKE 'SE%'
                    ORDER BY A.SALES_DOC,
                            A.SALESDOC_ITEM,
                            B.CHAR_NUM,
                            B.CHARVAL_NUM`);
        }


        let liPriChar = [];

        liPriChar = await cds.run(`SELECT "CHAR_NUM"
                                     FROM "CP_VARCHAR_PS"
                                    WHERE "PRODUCT_ID" = '${lProduct}'
                                      AND "CHAR_TYPE" = 'P'`)
        let liSalesh = [];
        let lsSalesh = {};
        let lsSaleshConfig = {};

        for (let cntSO = 0; cntSO < liSalesData.length; cntSO++) {
            if (cntSO === 0 ||
                liSalesData[cntSO].SALES_DOC !== liSalesData[GenF.subOne(cntSO, liSalesData.length)].SALES_DOC ||
                liSalesData[cntSO].SALESDOC_ITEM !== liSalesData[GenF.subOne(cntSO, liSalesData.length)].SALESDOC_ITEM) {
                lsSalesh = {};
                lsSalesh['SALES_DOC'] = GenF.parse(liSalesData[cntSO].SALES_DOC);
                lsSalesh['SALESDOC_ITEM'] = GenF.parse(liSalesData[cntSO].SALESDOC_ITEM);
                lsSalesh['MATERIAL_VARIANT'] = GenF.parse(liSalesData[cntSO].MATERIAL_VARIANT);
                lsSalesh['CONFIG'] = [];
                lsSalesh['PCONFIG'] = [];
            }

            lsSaleshConfig = {};
            lsSaleshConfig['CHAR_NUM'] = GenF.parse(liSalesData[cntSO].CHAR_NUM);
            lsSaleshConfig['CHARVAL_NUM'] = GenF.parse(liSalesData[cntSO].CHAR_VALUE);
            lsSaleshConfig['CHAR_VALUE'] = GenF.parse(liSalesData[cntSO].CHAR_VALUE);
            lsSalesh['CONFIG'].push(lsSaleshConfig);

            let lsTempPriChar = {};
            lsTempPriChar = liPriChar.find((lsChar) =>
                lsChar.CHAR_NUM === liSalesData[cntSO].CHAR_NUM
            );
            if (lsTempPriChar) {
                lsSalesh['PCONFIG'].push(lsSaleshConfig);
            }

            /*
            for (let cntPC = 0; cntPC < liPriChar.length; cntPC++) {
                if (liSalesData[cntSO].CHAR_NUM === liPriChar[cntPC].CHAR_NUM) {
                    lsSaleshConfig = {};
                    lsSaleshConfig['CHAR_NUM'] = GenF.parse(liSalesData[cntSO].CHAR_NUM);
                    lsSaleshConfig['CHARVAL_NUM'] = GenF.parse(liSalesData[cntSO].CHAR_VALUE);
                    lsSaleshConfig['CHAR_VALUE'] = GenF.parse(liSalesData[cntSO].CHAR_VALUE);
                    lsSalesh['PCONFIG'].push(lsSaleshConfig);
                    break;
                }
            }
            */

            if (cntSO === GenF.addOne(cntSO, liSalesData.length) ||
                liSalesData[cntSO].SALES_DOC !== liSalesData[GenF.addOne(cntSO, liSalesData.length)].SALES_DOC ||
                liSalesData[cntSO].SALESDOC_ITEM !== liSalesData[GenF.addOne(cntSO, liSalesData.length)].SALESDOC_ITEM) {
                liSalesh.push(lsSalesh);
            }
        }

        return liSalesh;
    }

    /**
     * Get Unique ID
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
    async getUnique(lProduct) {

        const liUniqueGet = await cds.run(
            `SELECT "UNIQUE_ID",
                    "PRODUCT_ID",
                    "CHAR_NUM",
                    "CHAR_VALUE"
               FROM "V_UNIQUE_ID"
              WHERE PRODUCT_ID  = '${lProduct}'
            ORDER BY UNIQUE_ID,
                     PRODUCT_ID,
                     CHAR_NUM,
                     CHAR_VALUE`
        );

        let lsUniqueConfig = {};
        let lsUnique = {};
        let liUniqueData = [];        

        for (let cntU = 0; cntU < liUniqueGet.length; cntU++) {
            if (cntU === 0 ||
                liUniqueGet[cntU].UNIQUE_ID !== liUniqueGet[GenF.subOne(cntU, liUniqueGet.length)].UNIQUE_ID ||
                liUniqueGet[cntU].PRODUCT_ID !== liUniqueGet[GenF.subOne(cntU, liUniqueGet.length)].PRODUCT_ID) {
                lsUnique = {};
                lsUnique['UNIQUE_ID'] = GenF.parse(liUniqueGet[cntU].UNIQUE_ID);
                lsUnique['PRODUCT_ID'] = GenF.parse(liUniqueGet[cntU].PRODUCT_ID);
                lsUnique['CONFIG'] = [];
            }
            lsUniqueConfig = {};
            lsUniqueConfig['CHAR_NUM'] = GenF.parse(liUniqueGet[cntU].CHAR_NUM);
            lsUniqueConfig['CHARVAL_NUM'] = GenF.parse(liUniqueGet[cntU].CHAR_VALUE);
            lsUniqueConfig['CHAR_VALUE'] = GenF.parse(liUniqueGet[cntU].CHAR_VALUE);
            lsUnique['CONFIG'].push(lsUniqueConfig);

            if (cntU === GenF.addOne(cntU, liUniqueGet.length) ||
                liUniqueGet[cntU].UNIQUE_ID !== liUniqueGet[GenF.addOne(cntU, liUniqueGet.length)].UNIQUE_ID ||
                liUniqueGet[cntU].PRODUCT_ID !== liUniqueGet[GenF.addOne(cntU, liUniqueGet.length)].PRODUCT_ID) {
                liUniqueData.push(lsUnique);
            }
        }

        return liUniqueData;
    }

    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
    async getPriUniqueID(lLocation, lProduct) {

        // Get Unique ID        
        let liUniqueData = [];
        liUniqueData = await cds.run(
            `SELECT *
               FROM V_UNIQUE_ID
              WHERE PRODUCT_ID    = '` + lProduct + `'
                AND UID_TYPE      = 'U'
                AND CHAR_NUM IN (SELECT "CHAR_NUM"
                                     FROM "CP_VARCHAR_PS"
                                    WHERE "PRODUCT_ID" = '` + lProduct + `'
                                      AND "CHAR_TYPE" = 'P')
            ORDER BY UNIQUE_ID,
                     PRODUCT_ID,
                     CHAR_NUM`
        );

        // Get Existing Primary ID        
        let liUniquePData = [];
        liUniquePData = await cds.run(
            `SELECT *
               FROM V_UNIQUE_ID
              WHERE PRODUCT_ID    = '` + lProduct + `'
                AND UID_TYPE      = 'P'
            ORDER BY UNIQUE_ID,
                     PRODUCT_ID,
                     CHAR_NUM`
        );

        let liPriID = [];
        let lsPriID = {};
        let liUniPriID = [];
        for (let cntUIDP = 0; cntUIDP < liUniquePData.length; cntUIDP++) {

            lsPriID = {};
            lsPriID['CHAR_NUM'] = GenF.parse(liUniquePData[cntUIDP].CHAR_NUM);
            lsPriID['CHARVAL_NUM'] = GenF.parse(liUniquePData[cntUIDP].CHARVAL_NUM);
            liUniPriID.push(lsPriID);

            if (liUniquePData[cntUIDP].UNIQUE_ID !== liUniquePData[GenF.addOne(cntUIDP, liUniquePData.length)].UNIQUE_ID ||
                cntUIDP === GenF.addOne(cntUIDP, liUniquePData.length)) {
                liPriID.push(liUniPriID);
                liUniPriID = [];
            }

        }

        let liChar = [];
        let lsChar = {};
        let liCharFinal = [];
        for (let cntU = 0; cntU < liUniqueData.length; cntU++) {

            lsChar = {};
            lsChar['CHAR_NUM'] = liUniqueData[cntU].CHAR_NUM;
            lsChar['CHARVAL_NUM'] = liUniqueData[cntU].CHARVAL_NUM;
            liChar.push(lsChar);

            if (liUniqueData[cntU].UNIQUE_ID !== liUniqueData[GenF.addOne(cntU, liUniqueData.length)].UNIQUE_ID ||
                cntU === GenF.addOne(cntU, liUniqueData.length)) {

                // Check if Primary ID is already created                    
                for (let cntPID = 0; cntPID < liPriID.length; cntPID++) {
                    if (JSON.stringify(liChar) === JSON.stringify(liPriID[cntPID])) {
                        liChar = [];
                        break;
                    }
                }

                if (liChar.length > 0) {
                    // Check if Primary ID is already planned for creation
                    for (let cntUID = 0; cntUID < liCharFinal.length; cntUID++) {
                        if (JSON.stringify(liChar) === JSON.stringify(liCharFinal[cntUID])) {
                            liChar = [];
                            break;
                        }
                    }
                }

                if (liChar.length > 0) {
                    liCharFinal.push(liChar);
                }

                liChar = [];

            }

        }

        for (let cntU = 0; cntU < liCharFinal.length; cntU++) {
            if (liCharFinal[cntU].length > 0) {

                await this.createPrimaryID(lLocation, lProduct, liCharFinal[cntU]);

            }
        }

        this.logger.info("Process Completed");

    }

    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
    async updateUniqueRate(lLocation, lProduct) {

        const liSalesProd = await SELECT.columns(`LOCATION_ID`,
            `PRODUCT_ID`,
            `sum(ORD_QTY) as ORD_QTY`)
            .from("V_SALES_H")
            .where(`LOCATION_ID = '${lLocation}'
                                        AND REF_PRODID = '${lProduct}'`)
            .groupBy("LOCATION_ID", "PRODUCT_ID")
            .orderBy("LOCATION_ID", "PRODUCT_ID");

        const liSalesUni = await SELECT.columns(`LOCATION_ID`,
            `PRODUCT_ID`,
            "UNIQUE_ID",
            `sum(ORD_QTY) as ORD_QTY`)
            .from("V_SALES_H")
            .where(`LOCATION_ID = '${lLocation}'
                                AND REF_PRODID = '${lProduct}'`)
            .groupBy("LOCATION_ID", "PRODUCT_ID", "UNIQUE_ID")
            .orderBy("LOCATION_ID", "PRODUCT_ID", "UNIQUE_ID");

        const liSalesChar = await cds.run(
            `SELECT 
                                    V_SALES_H.LOCATION_ID,
                                    V_SALES_H.PRODUCT_ID,
                                    V_SALESH_UID_CONFIG.CHAR_NUM,
                                    V_SALESH_UID_CONFIG.CHARVAL_NUM,
                                    sum(V_SALES_H."ORD_QTY") as ORD_QTY
                                FROM 
                                    V_SALES_H
                                    INNER JOIN
                                    V_SALESH_UID_CONFIG
                                    ON V_SALES_H."SALES_DOC" = V_SALESH_UID_CONFIG."SALES_DOC"
                                        AND V_SALES_H."SALESDOC_ITEM" = V_SALESH_UID_CONFIG."SALESDOC_ITEM"
                                WHERE V_SALES_H.LOCATION_ID = '${lLocation}'
                                    AND V_SALES_H.REF_PRODID = '${lProduct}'
                                GROUP BY 
                                    V_SALES_H.LOCATION_ID,
                                    V_SALES_H.PRODUCT_ID,
                                    V_SALESH_UID_CONFIG.CHAR_NUM,
                                    V_SALESH_UID_CONFIG.CHARVAL_NUM;`
        );

        for (let cntSP = 0; cntSP < liSalesProd.length; cntSP++) {
            for (let cntUID = 0; cntUID < liSalesUni.length; cntUID++) {
                if (liSalesUni[cntUID].LOCATION_ID === liSalesProd[cntSP].LOCATION_ID &&
                    liSalesUni[cntUID].PRODUCT_ID === liSalesProd[cntSP].PRODUCT_ID) {
                    if (liSalesProd[cntSP].ORD_QTY > 0) {
                        await UPDATE`CP_UNIQUE_ID_HEADER`
                            .with({
                                UID_RATE: ((liSalesUni[cntUID].ORD_QTY * 100 / liSalesProd[cntSP].ORD_QTY)).toFixed(2)
                            })
                            .where(`UNIQUE_ID = '${liSalesUni[cntUID].UNIQUE_ID}'
                                AND PRODUCT_ID = '${lProduct}'`)

                    }
                }
            }

            for (let cntUC = 0; cntUC < liSalesChar.length; cntUC++) {
                if (liSalesChar[cntUC].LOCATION_ID === liSalesProd[cntSP].LOCATION_ID &&
                    liSalesChar[cntUC].PRODUCT_ID === liSalesProd[cntSP].PRODUCT_ID) {
                    if (liSalesProd[cntSP].ORD_QTY > 0) {
                        await UPDATE`CP_UNIQUE_ID_ITEM`
                            .with({
                                UID_CHAR_RATE: (liSalesChar[cntUC].ORD_QTY * 100 / liSalesProd[cntSP].ORD_QTY).toFixed(2)
                            })
                            .where(`PRODUCT_ID = '${lProduct}'
                                AND CHAR_NUM = '${liSalesChar[cntUC].CHAR_NUM}'
                                AND CHARVAL_NUM = '${liSalesChar[cntUC].CHARVAL_NUM}'`)
                    }
                }
            }
        }


    }

    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     * @param {Customer} lCustomer 
     * @param {Sales ORder} lSO
     * @param {Date} lDate 
     * @param {Quantity} lQty 
     * @param {Unique ID} liUnique 
     */
    async createSO(lLocation, lProduct, lCustomer, lSO, lDate, lQty, lUnique) {

        const lSOItem = '0000000010';
        const lUOM = 'EA';
        const lOrdChk = 'X';
        // Get Main Product        
        const lMainProd = await this.getMainProduct(lLocation, lProduct);

        await INSERT.into('CP_SALESH')
            .columns('SALES_DOC',
                'SALESDOC_ITEM',
                'PRODUCT_ID',
                'UOM',
                'CONFIRMED_QTY',
                'ORD_QTY',
                'MAT_AVAILDATE',
                'CUSTOMER_GROUP',
                'LOCATION_ID',
                'SEEDORD_CHK')
            .values(lSO,
                lSOItem,
                lMainProd,
                lUOM,
                lQty,
                lQty,
                lDate,
                lCustomer,
                lLocation,
                lOrdChk);

        const liUnique = await SELECT.columns("CHAR_NUM",
            "CHARVAL_NUM")
            .from('V_UNIQUE_ID')
            .where(`PRODUCT_ID  = '${lProduct}'
            AND UNIQUE_ID = '${lUnique}'`)

        for (let cntUI = 0; cntUI < liUnique.length; cntUI++) {
            await INSERT.into('CP_SALESH_CONFIG')
                .columns('SALES_DOC',
                    'SALESDOC_ITEM',
                    'CHAR_NUM',
                    'CHARVAL_NUM',
                    'PRODUCT_ID')
                .values(lSO,
                    lSOItem,
                    liUnique[cntUI].CHAR_NUM,
                    liUnique[cntUI].CHARVAL_NUM,
                    lProduct);
        }

        //await this.processUniqueID(lLocation, lMainProd, lSO);

        // const lSPrimary = await this.processPrimaryID(lLocation, lMainProd, lUnique);


        // await INSERT.into('CP_SALES_HM')
        //     .values(lSO, lSOItem, lProduct, lLocation, lUnique, lSPrimary);
        // try {
        //     await INSERT.into('CP_SALES_HM').columns('SALES_DOC',
        //         'SALESDOC_ITEM',
        //         'PRODUCT_ID',
        //         'LOCATION_ID',
        //         'UNIQUE_ID',
        //         'PRIMARY_ID')
        //         .values(lSO,
        //             lSOItem,
        //             lProduct,
        //             lLocation,
        //             lUnique,
        //             lSPrimary);
        // }
        // catch (e) {
        //     console.log(e.message);
        // }
    }

    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     * @param {Sales ORder} lSO
     * @param {Date} lDate 
     * @param {Quantity} lQty 
     * @param {Unique ID} liUnique 
     */
    async createSOTempBackup(aData) {

        const lSOItem = '000010';
        const lUOM = 'EA';
        const lOrdChk = 'X';
        let oSalesHdr = {};
        let aSalesConfigEach = [], aSalesConfig = [], aSalesHdr = [];
        let bFlag = false;
        // Get Main Product        
        for (let i = 0; i < aData.length; i++) {
            oSalesHdr = {};
            const lMainProd = await this.getMainProduct(aData[i].LOCATION_ID, aData[i].PRODUCT_ID);

            oSalesHdr.SALES_DOC = aData[i].SEED_ORDER
            oSalesHdr.SALESDOC_ITEM = lSOItem;
            oSalesHdr.PRODUCT_ID = lMainProd;
            oSalesHdr.UOM = lUOM;
            oSalesHdr.CONFIRMED_QTY = aData[i].ORD_QTY;
            oSalesHdr.ORD_QTY = aData[i].ORD_QTY;
            oSalesHdr.MAT_AVAILDATE = aData[i].MAT_AVAILDATE;
            oSalesHdr.CUSTOMER_GROUP = aData[i].CUSTOMER_GROUP;
            oSalesHdr.LOCATION_ID = aData[i].LOCATION_ID;
            oSalesHdr.SEEDORD_CHK = lOrdChk;

            aSalesHdr.push(GenF.parse(oSalesHdr));

            const liUnique = await SELECT.columns("CHAR_NUM",
                "CHARVAL_NUM")
                .from('V_UNIQUE_ID')
                .where(`PRODUCT_ID  = '${aData[i].PRODUCT_ID}'
                    AND UNIQUE_ID = '${aData[i].UNIQUE_ID}'`);

            if (liUnique.length > 0) {
                aSalesConfigEach = liUnique.map((obj, j) => {
                    return { ...obj, SALES_DOC: aData[i].SEED_ORDER, SALESDOC_ITEM: lSOItem, PRODUCT_ID: aData[i].PRODUCT_ID };
                });

                // Using Spread Operator to push values of one array into another (or Append an array values to another array)
                aSalesConfig.push(...aSalesConfigEach);
            }

        }

        // Insert Sales Document Header and Configuration data into tables
        if (aSalesHdr.length > 0) {
            await INSERT.into("CP_SALESH").entries(aSalesHdr);
            bFlag = true;
        }
        if (aSalesConfig.length > 0 && bFlag === true) {
            await INSERT.into("CP_SALESH_CONFIG").entries(aSalesConfig);
        }
    }

    /**
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     * @param {Sales ORder} lSO
     * @param {Date} lDate 
     * @param {Quantity} lQty 
     * @param {Unique ID} liUnique
     */
    async createSOTemp(aData) {
 
        const lSOItem = '000010';
        const lUOM = 'EA';
        let lOrdChk = null;
        const lIBPCustomer = 'N/A';
 
        let oSalesHdr = {};
        let aSalesConfigEach = [], aSalesConfig = [], aSalesHdr = [],aSalesHM=[],asalesHMEach={};
        let bFlag = false;
        var datetime = new Date();
        var curDate = datetime.toISOString().slice(0, 10);
 
        // Get Main Product        
        for (let i = 0; i < aData.length; i++) {
            if(aData[i].SEED_ORDER.includes('SE')){
                lOrdChk = 'X';
            }
            oSalesHdr = {};
            const lMainProd = await this.getMainProduct(aData[i].LOCATION_ID, aData[i].PRODUCT_ID);
 
            oSalesHdr.SALES_DOC = aData[i].SEED_ORDER
            oSalesHdr.SALESDOC_ITEM = lSOItem;
            oSalesHdr.PRODUCT_ID = lMainProd;
            oSalesHdr.UOM = lUOM;
           
           
            oSalesHdr.MAT_AVAILDATE = aData[i].MAT_AVAILDATE;
            oSalesHdr.CUSTOMER_GROUP = aData[i].CUSTOMER_GROUP;
            oSalesHdr.LOCATION_ID = aData[i].LOCATION_ID;
            oSalesHdr.SEEDORD_CHK = lOrdChk;
            oSalesHdr.IBP_CUSTOMER = lIBPCustomer;
            oSalesHdr.CREATED_DATE = curDate;
//2025-02-04 - Pradeep for Internal Sales Order upload VP-1417
            const lsQtyAvail = await SELECT.one.columns("ORD_QTY")
            .from('CP_SALESH').where(`SALES_DOC  = '${aData[i].SEED_ORDER}'`);
            if(lsQtyAvail !==null){
            if(lsQtyAvail.ORD_QTY !== null || lsQtyAvail.ORD_QTY !== 0){
                let availQty = parseInt(lsQtyAvail.ORD_QTY);
                let newQty = parseInt(aData[i].ORD_QTY);
                let totalQty = availQty+newQty
                oSalesHdr.ORD_QTY = totalQty.toFixed(3);
                oSalesHdr.CONFIRMED_QTY = totalQty.toFixed(3);
            }
        }
            else{
                oSalesHdr.ORD_QTY = aData[i].ORD_QTY;
                oSalesHdr.CONFIRMED_QTY = aData[i].ORD_QTY;
            }
            //2025-02-04 - Pradeep for Internal Sales Order upload VP-1417
            aSalesHdr.push(GenF.parse(oSalesHdr));
 
            const liUnique = await SELECT.columns("CHAR_NUM",
                "CHARVAL_NUM",
                "CHAR_VALUE")
                .from('CP_UNIQUE_ID_ITEM')
                .where(`PRODUCT_ID  = '${aData[i].PRODUCT_ID}'
                    AND UNIQUE_ID = '${aData[i].UNIQUE_ID}'`);
 
            if (liUnique.length > 0) {
                aSalesConfigEach = liUnique.map((obj, j) => {
                    return { ...obj, SALES_DOC: aData[i].SEED_ORDER, SALESDOC_ITEM: lSOItem, PRODUCT_ID: aData[i].PRODUCT_ID };
                });
 
                // Using Spread Operator to push values of one array into another (or Append an array values to another array)
                aSalesConfig.push(...aSalesConfigEach);
            }
            //2025-02-04 - Pradeep for Internal Sales Order upload VP-1417 Commenting
             //Getting Primary Id's to insert sales documents into sales_hm table
            //Pradeep 20-10-2024- Start
    //         const liPrimaryData = await SELECT.columns("UNIQUE_ID",
    //             "CHAR_NUM",
    //             "CHARVAL_NUM",
    //             "CHAR_VALUE")
    //             .from('V_UNIQUE_ID')
    //             .where(`PRODUCT_ID  = '${aData[i].PRODUCT_ID}'
    //                 AND UID_TYPE = 'P'`);
    //   if (liUnique.length > 0) {        
    //     // Function to check if a CHAR_NUM and CHAR_VALUE combination exists in liUnique
    //     const existsInPID = (charNum, charValue) => liUnique.some(pid => pid.CHAR_NUM === charNum && pid.CHAR_VALUE === charValue);
 
    //     // Find PIDs that have all their CHAR_NUM and CHAR_VALUE pairs present in liUnique
    //     const matchingUIDs = [...new Set(liPrimaryData.map(item => item.UNIQUE_ID))].filter(uid => {
    //     const filteredData = liPrimaryData.filter(item => item.UNIQUE_ID === uid);
    //     return filteredData.every(fdItem => existsInPID(fdItem.CHAR_NUM, fdItem.CHAR_VALUE));
    //     });
    //     //Mapping partial prod to unique id primary id
    //     var PrimaryChars = liUnique;
    //     var partialProdChars = await SELECT.columns("PRODUCT_ID",
    //         "CHAR_NUM",
    //         "CHARVAL_NUM",
    //         "CHAR_VALUE")
    //         .from('V_PARTIALPRODCHAR')
    //         .where(`REF_PRODID  = '${aData[i].PRODUCT_ID}'
    //             AND LOCATION_ID = '${aData[i].LOCATION_ID}'
    //             AND CONFIGPROD_CHK IS NULL`);
    //             const matchingProducts = partialProdChars
    //                 .filter(uid => {
    //                     const liPrimaryDataItems = partialProdChars.filter(item => item.PRODUCT_ID === uid.PRODUCT_ID);
    //                     return liPrimaryDataItems.every(liItem =>
    //                         PrimaryChars.some(fullDataItem =>
    //                             liItem.CHAR_NUM === fullDataItem.CHAR_NUM &&
    //                             liItem.CHAR_VALUE === fullDataItem.CHAR_VALUE
    //                         )
    //                     );
    //                 })
    //                 .map(item => item.PRODUCT_ID) // Extract the PRODUCT_ID
    //                 .filter((value, index, self) => self.indexOf(value) === index); // Get distinct PRODUCT_IDs
    //               if(matchingProducts.length ===0){
    //                 var product_id = aData[i].PRODUCT_ID
    //               }
    //               else{
    //                 var product_id = matchingProducts[0];
    //               }
    //     if (matchingUIDs.length > 0) {
 
    //         asalesHMEach.SALES_DOC = aData[i].SEED_ORDER;
    //         asalesHMEach.SALESDOC_ITEM = lSOItem;
    //         asalesHMEach.LOCATION_ID = aData[i].LOCATION_ID;
    //         asalesHMEach.PRODUCT_ID = product_id;
    //         asalesHMEach.UNIQUE_ID = aData[i].UNIQUE_ID;
    //         asalesHMEach.PRIMARY_ID = matchingUIDs[0];
    //         aSalesHM.push(asalesHMEach);
    //         asalesHMEach={};
 
    //     }
    //     }
 
        //Pradeep 20-10-2024- End
        //2025-02-04 - Pradeep for Internal Sales Order upload VP-1417 Commenting End
        // Insert Sales Document Header and Configuration data into tables
        //2025-02-04 - Pradeep for Internal Sales Order upload VP-1417
        if (aSalesHdr.length > 0) {
            try{
            await cds.run(UPSERT.into("CP_SALESH").entries(aSalesHdr));
            bFlag = true;
            aSalesHdr=[];
            }
            catch(ex){
                console.log("Salesh",ex.message);
                aSalesHdr=[];
            }
        }
        if (aSalesConfig.length > 0 && bFlag === true) {
            try{
            await cds.run(UPSERT.into("CP_SALESH_CONFIG").entries(aSalesConfig));
            await cds.run(`DELETE FROM "CP_TEMP_SO_INTERNAL"`);
            aSalesConfig=[];
            }
            catch(ex){
                console.log("Salesh_config",ex.message);
                aSalesConfig=[];
            }
        }
    }
    //2025-02-04 - Pradeep for Internal Sales Order upload VP-1417
                 // Insert Sales Document Header  data into sales_hm table
                //  if(aSalesHM.length>0 && bFlag === true){
                //     try{
                //         await INSERT.into("CP_SALES_HM").entries(aSalesHM);
                //     }
                //     catch(ex){
                //         console.log("Sales",ex.message)
                //     }
                // }
    }

    /**
         * 
         * @param {Location} lLocation 
         * @param {Product} lProduct 
         * @param {Sales ORder} lSO 
         */
    async deleteSO(lLocation, lProduct, lSO) {

        try {
            await DELETE.from('CP_SALESH')
                .where(`LOCATION_ID = '${lLocation}' AND PRODUCT_ID = '${lProduct}' AND SALES_DOC = '${lSO}'`);
            await DELETE.from('CP_SALESH_CONFIG')
                .where(`PRODUCT_ID = '${lProduct}' AND SALES_DOC = '${lSO}'`);
            await DELETE.from('CP_SALES_HM')
                .where(`LOCATION_ID = '${lLocation}' AND PRODUCT_ID = '${lProduct}' AND SALES_DOC = '${lSO}'`);
        }
        catch (err) {
            console.log("Deletion failed");
        }

    }
    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
    async getMainProduct(lLocation, lProduct) {
        // Get Main Product        
        const lsSales = await SELECT.one
            .columns('REF_PRODID')
            .from('CP_PARTIALPROD_INTRO')
            .where(`LOCATION_ID = '${lLocation}'
            AND PRODUCT_ID = '${lProduct}'`);
        if (!lsSales) {
            return lProduct;
        }
        else {
            return lsSales.REF_PRODID;
        }
    }

    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     * @param {Unique ID} lUnique 
     */
    async processPrimaryID(lLocation, lProduct, lUnique) {


        const liUnique = await cds.run(`SELECT CHAR_NUM,
                                            CHARVAL_NUM
                                        FROM CP_UNIQUE_ID_ITEM
                                        WHERE UNIQUE_ID = '${lUnique}'
                                        AND PRODUCT_ID = '${lProduct}'
                                        AND CHAR_NUM IN (SELECT CHAR_NUM
                                                        FROM CP_VARCHAR_PS
                                                        WHERE PRODUCT_ID = '${lProduct}'
                                                        AND CHAR_TYPE = 'P')
                                        ORDER BY  CHAR_NUM,
                                            CHARVAL_NUM`)

        const liPrimary = await SELECT.columns('UNIQUE_ID', 'CHAR_NUM', 'CHARVAL_NUM')
            .from('V_UNIQUE_ID')
            .where(`PRODUCT_ID  = '${lProduct}'
                        AND UID_TYPE    = 'P'`);

        let lUICount = 0;
        let lFailPrimary = 0;
        let lSPrimary = 0;
        for (let cntPID = 0; cntPID < liPrimary.length; cntPID++) {
            if (cntPID === 0 ||
                liPrimary[cntPID].UNIQUE_ID !== liPrimary[GenF.subOne(cntPID, liPrimary.length)].UNIQUE_ID) {
                lUICount = 0;
            }

            if (liPrimary[cntPID].CHAR_NUM !== liUnique[lUICount].CHAR_NUM ||
                liPrimary[cntPID].CHARVAL_NUM !== liUnique[lUICount].CHARVAL_NUM) {
                lFailPrimary = GenF.parse(liPrimary[cntPID].UNIQUE_ID);
            }

            if (cntPID === GenF.addOne(cntPID, liPrimary.length) ||
                liPrimary[cntPID].UNIQUE_ID !== liPrimary[GenF.addOne(cntPID, liPrimary.length)].UNIQUE_ID) {
                if (lFailPrimary === 0) {
                    lSPrimary = GenF.parse(liPrimary[cntPID].UNIQUE_ID);
                    break;
                }
            }
        }

        if (lSPrimary === 0) {
            lSPrimary = await this.createPrimaryID(lLocation, lProduct, liUnique);
        }

        return lSPrimary;

    }

    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     * @param {Char Array} liCharVal 
     */
    async createPrimaryID(lLocation, lProduct, liCharVal) {

        let lCntVariantID = 0, lUID_RATE;
        const lsUniqueInd = await SELECT.one.columns("MAX(UNIQUE_ID) + 1 AS MAX_ID")
            .from('CP_UNIQUE_ID_HEADER');

        if (lsUniqueInd.MAX_ID === null) {
            lCntVariantID = 1;
        } else {
            lCntVariantID = lsUniqueInd.MAX_ID;//parseInt(lsUniqueInd.MAX_ID);
        }

        // this.logger.info("Unique ID Index: " + lCntVariantID);
        console.log("Unique ID Index: " + lCntVariantID);
        lUID_RATE = 0.00;
        await cds.run({
            INSERT:
            {
                into: { ref: ['CP_UNIQUE_ID_HEADER'] },
                values: [lCntVariantID, lProduct, '', 'P', lUID_RATE, true, ' ', '2000-01-01', '9999-12-31']
            }
        })

        let liChar = [];
        let lsChar = {};
        for (let cntUC = 0; cntUC < liCharVal.length; cntUC++) {
            lsChar = {};
            lsChar['UNIQUE_ID'] = GenF.parse(lCntVariantID);
            lsChar['PRODUCT_ID'] = GenF.parse(lProduct);
            lsChar['CHAR_NUM'] = GenF.parse(liCharVal[cntUC].CHAR_NUM);
            lsChar['CHARVAL_NUM'] = GenF.parse(liCharVal[cntUC].CHARVAL_NUM);
            liChar.push(lsChar);
        }

        await cds.run({
            INSERT:
            {
                into: { ref: ['CP_UNIQUE_ID_ITEM'] },
                entries: liChar
            }
        })

        return lCntVariantID;

    }
    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
    async genBaseMarketAuth(lLocation, lProduct) {
        console.log('Generate Market Authorization');

        let lWeeks = await GenF.getParameterValue(lLocation, 3);

        let lFirmnWeeks = await GenF.getParameterValue(lLocation, 9);

        let lDate = new Date();
        lDate = new Date(lDate.getFullYear(), lDate.getMonth(), lDate.getDate() + (7 * lFirmnWeeks));
        let lDateD = lDate.toISOString().split('Z')[0].split('T')[0];
        lWeeks = lWeeks - lFirmnWeeks;
        let liSOrdQty = await cds.run(`SELECT LOCATION_ID,
                                             PRODUCT_ID,
                                             SUM("ORD_QTY") AS ORD_QTY
                                        FROM V_SALES_H
                                       WHERE LOCATION_ID = '${lLocation}'
                                         AND REF_PRODID = '${lProduct}'
                                       GROUP BY LOCATION_ID,
                                                PRODUCT_ID;`);
        for (let cntS = 0; cntS < liSOrdQty.length; cntS++) {
            await DELETE.from('CP_DEF_MKTAUTH')
                .where(`LOCATION_ID = '${lLocation}' AND PRODUCT_ID = '${liSOrdQty[cntS].PRODUCT_ID}'`);
            await DELETE.from('CP_MARKETAUTH_CFG')
                .where(`LOCATION_ID = '${lLocation}' AND PRODUCT_ID = '${liSOrdQty[cntS].PRODUCT_ID}' AND WEEK_DATE > '${lDateD}'`);

        }

        let liCharValQty = await cds.run(`SELECT V_SALES_H.LOCATION_ID,
                                                    V_SALES_H.PRODUCT_ID,
                                                    V_UNIQUE_ID.CHAR_NUM,
                                                    V_UNIQUE_ID.CHARVAL_NUM,
                                                    SUM("ORD_QTY") AS ORD_QTY
                                                FROM V_SALES_H
                                                JOIN V_UNIQUE_ID
                                                ON V_SALES_H.UNIQUE_ID = V_UNIQUE_ID.UNIQUE_ID
                                                WHERE V_SALES_H.LOCATION_ID = '${lLocation}' AND V_SALES_H.REF_PRODID = '${lProduct}'
                                            GROUP BY  V_SALES_H.LOCATION_ID,
                                                    V_SALES_H.PRODUCT_ID,
                                                    V_UNIQUE_ID.CHAR_NUM,
                                                    V_UNIQUE_ID.CHARVAL_NUM`);
        let lsDefMktAuth = {};
        let liDefMktAuth = [];
        let lOrdQty = 0;
        for (let cntCVq = 0; cntCVq < liCharValQty.length; cntCVq++) {
            lOrdQty = 0;
            for (let cntS = 0; cntS < liSOrdQty.length; cntS++) {
                if (liSOrdQty[cntS].LOCATION_ID === liCharValQty[cntCVq].LOCATION_ID &&
                    liSOrdQty[cntS].PRODUCT_ID === liCharValQty[cntCVq].PRODUCT_ID) {
                    lOrdQty = parseInt(liSOrdQty[cntS].ORD_QTY);
                    break;
                }
            }

            lsDefMktAuth = {};
            lsDefMktAuth['LOCATION_ID'] = GenF.parse(lLocation);
            lsDefMktAuth['PRODUCT_ID'] = GenF.parse(liCharValQty[cntCVq].PRODUCT_ID);
            lsDefMktAuth['CHAR_NUM'] = GenF.parse(liCharValQty[cntCVq].CHAR_NUM);
            lsDefMktAuth['CHARVAL_NUM'] = GenF.parse(liCharValQty[cntCVq].CHARVAL_NUM);
            if (lOrdQty > 0) {
                lsDefMktAuth['OPT_PERCENT'] = ((parseInt(liCharValQty[cntCVq].ORD_QTY) * 100) / lOrdQty).toFixed(2);
            } else {
                lsDefMktAuth['OPT_PERCENT'] = 0;
            }
            liDefMktAuth.push(GenF.parse(lsDefMktAuth));
        }
        if (liDefMktAuth) {
            try {
                await cds.run(INSERT.into("CP_DEF_MKTAUTH").entries(liDefMktAuth));
                // await INSERT.into('CP_DEF_MKTAUTH')
                //     .columns('LOCATION_ID',
                //         'PRODUCT_ID',
                //         'CHAR_NUM',
                //         'CHARVAL_NUM',
                //         'OPT_PERCENT')
                //     .entries(liDefMktAuth);


            }
            catch (error) {
                console.log(error);
            }

        }

        do {
            let lDateSQL = await GenF.getNextMondayCmp(lDate.toISOString().split('Z')[0].split('T')[0]);//(lDate.toISOString().split('T')[0]);
            // Loop through all the partial products                     
            for (let cntS = 0; cntS < liSOrdQty.length; cntS++) {
                // await cds.run(`INSERT INTO "CP_MARKETAUTH_CFG"  SELECT  '${lDateSQL}',
                //                                                         LOCATION_ID,
                //                                                         PRODUCT_ID,
                //                                                         CHAR_NUM,
                //                                                         CHARVAL_NUM,
                //                                                         OPT_PERCENT
                //                                                    FROM CP_DEF_MKTAUTH
                //                                                   WHERE LOCATION_ID = '${liSOrdQty[cntS].LOCATION_ID}'
                //                                                     AND PRODUCT_ID = '${liSOrdQty[cntS].PRODUCT_ID}'`);

                await cds.run(`INSERT INTO "CP_MARKETAUTH_CFG"  ( SELECT  '${lDateSQL}',
                                                                        A.LOCATION_ID,
                                                                        A.PRODUCT_ID,
                                                                        A.CHAR_NUM,
                                                                        A.CHARVAL_NUM,
                                                                        B.VERSION,
                                                                        B.SCENARIO,
                                                                        A.OPT_PERCENT
                                                                   FROM CP_DEF_MKTAUTH as A
                                                                   INNER JOIN V_IBPVERSCENARIO AS B
                                                                   ON A.LOCATION_ID = B.LOCATION_ID
                                                                   AND A.PRODUCT_ID =  B.PRODUCT_ID
                                                                  WHERE A.LOCATION_ID = '${liSOrdQty[cntS].LOCATION_ID}'
                                                                    AND A.PRODUCT_ID = '${liSOrdQty[cntS].PRODUCT_ID}')`);

            }
            lWeeks = parseInt(lWeeks) - 1;
            lDate = new Date(lDate.getFullYear(), lDate.getMonth(), lDate.getDate() + 7);
        }
        while (lWeeks > 0);


    }
    /**
     * 
     */
    async genPartialProd(productIds = []) {
        productIds = [...new Set(productIds)];
        console.log('Generate Partial Product', productIds);

        const hasProducts = Array.isArray(productIds) && productIds.length > 0;
 
    const formattedIds = hasProducts ? productIds.map(id => `'${id}'`).join(',') : '';
    const liProd = await cds.run(`
                    SELECT DISTINCT *
                    FROM V_LOCPROD
                    ${hasProducts
                        ? `WHERE PRODUCT_ID IN (${formattedIds})`
                        : ''}
                `);

        let liPartialProd = [];
        let lsProd = {}, vFlag = '';
        let liPartialProdChar = [];
        let lsProdCh = {};
        //Update config Product
        for (let cntPD = 0; cntPD < liProd.length; cntPD++) {
            vFlag = '';

            //Insert Config Product if it doesnot exists in Partial prod table
            // if (vFlag === '') {
            lsProd = {};
            lsProd['LOCATION_ID'] = GenF.parse(liProd[cntPD].LOCATION_ID);
            lsProd['PRODUCT_ID'] = GenF.parse(liProd[cntPD].PRODUCT_ID);
            lsProd['REF_PRODID'] = GenF.parse(liProd[cntPD].PRODUCT_ID);
            lsProd['PROD_DESC'] = GenF.parse(liProd[cntPD].PROD_DESC);
            lsProd['PROD_TYPE'] = GenF.parse(liProd[cntPD].PROD_TYPE);
            lsProd['CONFIGPROD_CHK'] = GenF.parse('X');
            liPartialProd.push(GenF.parse(lsProd));

            // Fetch Characteristic Data of Configurable Product 
            let liProdCfg = [];
            liProdCfg = await cds.run(`SELECT "PRODUCT_ID",
                                                        "CLASS_NUM",
                                                        "CHAR_NUM",
                                                        "CHAR_VALUE"
                                                  FROM V_PRODCLSCHARVAL
                                                 WHERE PRODUCT_ID = '${liProd[cntPD].PRODUCT_ID}'
                                                   AND CHAR_VALUE IS NOT NULL`);

            for (let cntCfg = 0; cntCfg < liProdCfg.length; cntCfg++) {
                // if (liProdCfg[cntCfg].PRODUCT_ID === liProd[cntPD].PRODUCT_ID) {
                lsProdCh = {};
                lsProdCh['LOCATION_ID'] = GenF.parse(liProd[cntPD].LOCATION_ID);
                lsProdCh['PRODUCT_ID'] = GenF.parse(liProdCfg[cntCfg].PRODUCT_ID);
                lsProdCh['CLASS_NUM'] = GenF.parse(liProdCfg[cntCfg].CLASS_NUM);
                lsProdCh['CHAR_NUM'] = GenF.parse(liProdCfg[cntCfg].CHAR_NUM);
                lsProdCh['CHARVAL_NUM'] = GenF.parse(liProdCfg[cntCfg].CHAR_VALUE);
                lsProdCh['CHAR_VALUE'] = GenF.parse(liProdCfg[cntCfg].CHAR_VALUE);
                liPartialProdChar.push(GenF.parse(lsProdCh));

            }
        }

        console.log("started liPartialProd", liPartialProd.length);
        if (liPartialProd.length > 0) {
            const CHUNK = 5000;

            for (let i = 0; i < liPartialProd.length; i += CHUNK) {
                const batch = liPartialProd.slice(i, i + CHUNK);
                let cqnQuery = { UPSERT: { into: { ref: ['CP_PARTIALPROD_INTRO'] }, entries: batch } };
                try {
                    await cds.run(cqnQuery);
                } catch (e) {
                    // flag = 'X';
                    console.log('Error');
                    console.log(`failed Inserted ${i + batch.length}`);
                }
                console.log(`Inserted ${i + batch.length}`);
            }
            // try {
            //     await cds.run({
            //         UPSERT:
            //         {
            //             into: { ref: ['CP_PARTIALPROD_INTRO'] },
            //             entries: liPartialProd
            //         }
            //     });
            vFlag = 'X';

            // }
            //     catch (error) {
            //     console.log("Unable to insert records into Partial table:", error);
            // }
        }
        // if (vFlag === 'X' && liPartialProdChar.length > 0) {
        console.log("started liPartialProdChar", liPartialProdChar.length);
        if (liPartialProdChar.length > 0) {
            const CHUNK = 5000;

            for (let i = 0; i < liPartialProdChar.length; i += CHUNK) {
                const batch = liPartialProdChar.slice(i, i + CHUNK);
                let cqnQuery = { UPSERT: { into: { ref: ['CP_PARTIALPROD_CHAR'] }, entries: batch } };
                try {
                    await cds.run(cqnQuery);
                } catch (e) {
                    // flag = 'X';
                    console.log('Error');
                    console.log(`failed Inserted ${i + batch.length}`);
                }
                console.log(`Inserted ${i + batch.length}`);
            }
            // try {
            //     await cds.run({
            //         UPSERT:
            //         {
            //             into: { ref: ['CP_PARTIALPROD_CHAR'] },
            //             entries: liPartialProdChar
            //         }
            //     })

            //     console.log("Partial records got created");
            // }
            // catch (error) {
            //     console.log("Unbale to insert records into Partial Config:", error);
            // }
        }
        // }
        // else {
        //     console.log("No records to update in Partial Products");
        // }

    }

    
    // async genPartialProd() {
    //     const liProd = await cds.run(`
    //                             SELECT DISTINCT * 
    //                             FROM V_LOCPROD
    //             `);
    //     const liPartProd = await cds.run(`
    //                             SELECT "PRODUCT_ID",
    //                                     "LOCATION_ID",
    //                                     "REF_PRODID" 
    //                               FROM CP_PARTIALPROD_INTRO 
    //     `);

    //     // const liProdCfg = await SELECT.columns(
    //     //     "PRODUCT_ID",
    //     //     "CLASS_NUM",
    //     //     "CHAR_NUM",
    //     //     "CHAR_VALUE")
    //     //     .from('V_PRODCLSCHARVAL')
    //     //     .where(`CHAR_VALUE IS NOT NULL`);

    //     let liPartialProd = [];
    //     let lsProd = {}, vFlag = '';
    //     let liPartialProdChar = [];
    //     let lsProdCh = {};
    //     //Update config Product
    //     for (let cntPD = 0; cntPD < liProd.length; cntPD++) {
    //         vFlag = '';
    //         // // for (let i = 0; i < liPartProd.length; i++) {
    //         // let opartialProd = {};

    //         // opartialProd = liPartProd.find((oProd) => oProd.PRODUCT_ID === liProd[cntPD].PRODUCT_ID &&
    //         //     oProd.LOCATION_ID === liProd[cntPD].LOCATION_ID &&
    //         //     oProd.REF_PRODID === liProd[cntPD].PRODUCT_ID
    //         // );
    //         // if (opartialProd) {
    //         //     vFlag = 'X';

    //         //     let partials = [];
    //         //      lsProd = {};
    //         //     lsProd['LOCATION_ID'] = GenF.parse(liProd[cntPD].LOCATION_ID);
    //         //     lsProd['PRODUCT_ID'] = GenF.parse(liProd[cntPD].PRODUCT_ID);
    //         //     lsProd['REF_PRODID'] = GenF.parse(liProd[cntPD].PRODUCT_ID);
    //         //     lsProd['PROD_DESC'] = GenF.parse(liProd[cntPD].PROD_DESC);
    //         //     lsProd['PROD_TYPE'] = GenF.parse(liProd[cntPD].PROD_TYPE);
    //         //     lsProd['CONFIGPROD_CHK'] = GenF.parse('X');
    //         //     partials.push(GenF.parse(lsProd));

    //         //     try {
    //         //         cds.run({
    //         //             UPSERT:
    //         //             {
    //         //                 into: { ref: ['CP_PARTIALPROD_INTRO'] },
    //         //                 entries: partials
    //         //             }
    //         //         })

    //         //         console.log("Partial records got created");
    //         //     }
    //         //     catch (error) {
    //         //         console.log("Unbale to insert records into Partial Config:", error);
    //         //     }
    //         // }


    //         // //     if (liPartProd[i].PRODUCT_ID === liProd[cntPD].PRODUCT_ID &&
    //         // //         liPartProd[i].LOCATION_ID === liProd[cntPD].LOCATION_ID &&
    //         // //         liPartProd[i].REF_PRODID === liProd[cntPD].PRODUCT_ID) {
    //         // //         vFlag = 'X';
    //         // //         // await UPDATE`CP_PARTIALPROD_INTRO`
    //         // //         //     .with({
    //         // //         //         PROD_DESC: liProd[cntPD].PROD_DESC,
    //         // //         //         PROD_TYPE: liProd[cntPD].PROD_TYPE,
    //         // //         //         CONFIGPROD_CHK: 'X'
    //         // //         //     })
    //         // //         //     .where(`LOCATION_ID = '${liProd[cntPD].LOCATION_ID}'
    //         // //         //                  AND PRODUCT_ID = '${liProd[cntPD].PRODUCT_ID}'`)
    //         // //         break;
    //         // //     }
    //         // // }
    //         //Insert Config Product if it doesnot exists in Partial prod table
    //         // if (vFlag === '') {
    //             lsProd = {};
    //             lsProd['LOCATION_ID'] = GenF.parse(liProd[cntPD].LOCATION_ID);
    //             lsProd['PRODUCT_ID'] = GenF.parse(liProd[cntPD].PRODUCT_ID);
    //             lsProd['REF_PRODID'] = GenF.parse(liProd[cntPD].PRODUCT_ID);
    //             lsProd['PROD_DESC'] = GenF.parse(liProd[cntPD].PROD_DESC);
    //             lsProd['PROD_TYPE'] = GenF.parse(liProd[cntPD].PROD_TYPE);
    //             lsProd['CONFIGPROD_CHK'] = GenF.parse('X');
    //             liPartialProd.push(GenF.parse(lsProd));

    //              // Fetch Characteristic Data of Configurable Product 
    //              let liProdCfg = [];
    //              liProdCfg = await cds.run(`SELECT "PRODUCT_ID",
    //                                                     "CLASS_NUM",
    //                                                     "CHAR_NUM",
    //                                                     "CHAR_VALUE"
    //                                               FROM V_PRODCLSCHARVAL
    //                                              WHERE PRODUCT_ID = '${liProd[cntPD].PRODUCT_ID}'
    //                                                AND CHAR_VALUE IS NOT NULL`);
                                                   
    //             for (let cntCfg = 0; cntCfg < liProdCfg.length; cntCfg++) {
    //                 // if (liProdCfg[cntCfg].PRODUCT_ID === liProd[cntPD].PRODUCT_ID) {
    //                     lsProdCh = {};
    //                     lsProdCh['LOCATION_ID'] = GenF.parse(liProd[cntPD].LOCATION_ID);
    //                     lsProdCh['PRODUCT_ID'] = GenF.parse(liProdCfg[cntCfg].PRODUCT_ID);
    //                     lsProdCh['CLASS_NUM'] = GenF.parse(liProdCfg[cntCfg].CLASS_NUM);
    //                     lsProdCh['CHAR_NUM'] = GenF.parse(liProdCfg[cntCfg].CHAR_NUM);
    //                     lsProdCh['CHARVAL_NUM'] = GenF.parse(liProdCfg[cntCfg].CHAR_VALUE);
    //                     lsProdCh['CHAR_VALUE'] = GenF.parse(liProdCfg[cntCfg].CHAR_VALUE);
    //                     liPartialProdChar.push(GenF.parse(lsProdCh));
    //                 // }

    //                 if (liPartialProdChar.length > 1000) {
    //                     if(liPartialProd.length >0){
    //                     try {
    //                         await cds.run({
    //                             UPSERT:
    //                             {
    //                                 into: { ref: ['CP_PARTIALPROD_INTRO'] },
    //                                 entries: liPartialProd
    //                             }
    //                         });
    //                         vFlag = 'X';

    //                     }
    //                     catch (error) {
    //                         console.log("Unable to insert records into Partial table:", error);
    //                     }
    //                     }
    //                     // if (vFlag === 'X' && liPartialProdChar.length > 0) {
    //                     if (liPartialProdChar.length > 0) {
    //                         try {
    //                             cds.run({
    //                                 UPSERT:
    //                                 {
    //                                     into: { ref: ['CP_PARTIALPROD_CHAR'] },
    //                                     entries: liPartialProdChar
    //                                 }
    //                             })

    //                             console.log("Partial records got created");
    //                         }
    //                         catch (error) {
    //                             console.log("Unbale to insert records into Partial Config:", error);
    //                         }
    //                     }
    //                     liPartialProdChar = [];
    //                 liPartialProd = [];
    //                 }
                    

    //             }
    //         // }
    //     }

    //     if (liPartialProd.length > 0) {
    //         try {
    //             await cds.run({
    //                 UPSERT:
    //                 {
    //                     into: { ref: ['CP_PARTIALPROD_INTRO'] },
    //                     entries: liPartialProd
    //                 }
    //             });
    //             vFlag = 'X';

    //         }
    //         catch (error) {
    //             console.log("Unable to insert records into Partial table:", error);
    //         }
    //         // if (vFlag === 'X' && liPartialProdChar.length > 0) {
    //         if (liPartialProdChar.length > 0) {
    //             try {
    //                 await cds.run({
    //                     UPSERT:
    //                     {
    //                         into: { ref: ['CP_PARTIALPROD_CHAR'] },
    //                         entries: liPartialProdChar
    //                     }
    //                 })

    //                 console.log("Partial records got created");
    //             }
    //             catch (error) {
    //                 console.log("Unbale to insert records into Partial Config:", error);
    //             }
    //         }
    //     }
    //     // else {
    //     //     console.log("No records to update in Partial Products");
    //     // }

    // }


    // async genPartialProd() {
        

    //     const liProd = await cds.run(`
    //                             SELECT DISTINCT 
    //                                         "LOCATION_ID",
    //                                         "PRODUCT_ID", 
    //                                        "PRODUCT_ID" AS "REF_PRODID",
    //                                         "PROD_DESC",
    //                                         "PROD_TYPE",
    //                                         'X' AS "CONFIGPROD_CHK"
    //                             FROM V_LOCPROD
    //             `);

    //     //         const liProd = await cds.run(`
    //     //                                         SELECT DISTINCT * 
    //     //                                         FROM V_LOCPROD
    //     //                         `);
    //     //         const liPartProd = await cds.run(`
    //     //                         SELECT "PRODUCT_ID",
    //     //                                 "LOCATION_ID",
    //     //                                 "REF_PRODID" 
    //     //                           FROM CP_PARTIALPROD_INTRO 
    //     // `);



    //     let liPartialProd = [];
    //     let lsProd = {}, vFlag = '';
    //     let liPartialProdChar = [];
    //     let lsProdCh = {};
    //     //Update config Product
    //     for (let cntPD = 0; cntPD < liProd.length; cntPD++) {
    //         vFlag = '';
           
    //         //Insert Config Product if it doesnot exists in Partial prod table

    //         // let indexVal = liPartProd.findIndex(el=> el.PRODUCT_ID === liProd[cntPD].PRODUCT_ID &&
    //         //                                          el.LOCATION_ID === liProd[cntPD].LOCATION_ID &&
    //         //                                          el.REF_PRODID === liProd[cntPD].PRODUCT_ID);
           
    //         //     lsProd = {};
    //         //     lsProd['LOCATION_ID'] = GenF.parse(liProd[cntPD].LOCATION_ID);
    //         //     lsProd['PRODUCT_ID'] = GenF.parse(liProd[cntPD].PRODUCT_ID);
    //         //     lsProd['REF_PRODID'] = GenF.parse(liProd[cntPD].PRODUCT_ID);
    //         //     lsProd['PROD_DESC'] = GenF.parse(liProd[cntPD].PROD_DESC);
    //         //     lsProd['PROD_TYPE'] = GenF.parse(liProd[cntPD].PROD_TYPE);
    //         //     lsProd['CONFIGPROD_CHK'] = (indexVal === -1) ? '' :  GenF.parse('X');
    //         //     liPartialProd.push(GenF.parse(lsProd));

    //             liPartialProd.push(GenF.parse(liProd[cntPD]));

    //              // Fetch Characteristic Data of Configurable Product 
    //              let liProdCfg = [];
    //              liProdCfg = await cds.run(
    //                                 `SELECT 
    //                                     ? AS "LOCATION_ID",
    //                                     "PRODUCT_ID",
    //                                     "CLASS_NUM",
    //                                     "CHAR_NUM",
    //                                     "CHAR_VALUE",
    //                                     "CHAR_VALUE" AS "CHARVAL_NUM"
    //                                 FROM V_PRODCLSCHARVAL
    //                                 WHERE PRODUCT_ID = ?
    //                                 AND CHAR_VALUE IS NOT NULL`,
    //                                 [
    //                                     liProd[cntPD].LOCATION_ID,
    //                                     liProd[cntPD].PRODUCT_ID
    //                                 ]
    //                             );
                                
    //                             console.log("count of partial chars", liProdCfg.length)


    //                     if(liPartialProd.length >0){
    //                     try {
    //                         await cds.run({
    //                             UPSERT:
    //                             {
    //                                 into: { ref: ['CP_PARTIALPROD_INTRO'] },
    //                                 entries: liPartialProd
    //                             }
    //                         });
    //                         vFlag = 'X';

    //                     }
    //                     catch (error) {
    //                         console.log("Unable to insert records into Partial table:", error);
    //                     }
    //                     }
    //                     // if (vFlag === 'X' && liPartialProdChar.length > 0) {
    //                     if (vFlag === 'X' && liProdCfg.length > 0) {
    //                         try {
    //                             cds.run({
    //                                 UPSERT:
    //                                 {
    //                                     into: { ref: ['CP_PARTIALPROD_CHAR'] },
    //                                     entries: liProdCfg
    //                                 }
    //                             })

    //                             console.log("Partial records got created");
    //                         }
    //                         catch (error) {
    //                             console.log("Unbale to insert records into Partial Config:", error);
    //                         }
    //                     }
    //                     // liPartialProdChar = [];
    //                 liPartialProd = [];
    //                 // }
                    

    //             // }
    //         // }
    //     }

    //     // if (liPartialProd.length > 0) {
    //     //     try {
    //     //         await cds.run({
    //     //             UPSERT:
    //     //             {
    //     //                 into: { ref: ['CP_PARTIALPROD_INTRO'] },
    //     //                 entries: liPartialProd
    //     //             }
    //     //         });
    //     //         vFlag = 'X';

    //     //     }
    //     //     catch (error) {
    //     //         console.log("Unable to insert records into Partial table:", error);
    //     //     }
    //     //     // if (vFlag === 'X' && liPartialProdChar.length > 0) {
    //     //     if (liPartialProdChar.length > 0) {
    //     //         try {
    //     //             await cds.run({
    //     //                 UPSERT:
    //     //                 {
    //     //                     into: { ref: ['CP_PARTIALPROD_CHAR'] },
    //     //                     entries: liPartialProdChar
    //     //                 }
    //     //             })

    //     //             console.log("Partial records got created");
    //     //         }
    //     //         catch (error) {
    //     //             console.log("Unbale to insert records into Partial Config:", error);
    //     //         }
    //     //     }
    //     // }

    // }

    /**
     *  Factory location update for Mater data
     */
    async genFactoryLoc() {
        // Get data from Master tables
        // const liLocation = await SELECT.columns(
        //     "LOCATION_ID")
        //     .from('CP_LOCATION');

        const liFtLoc = await SELECT.columns(
            "LOCATION_ID",
            "PRODUCT_ID",
            "PLAN_LOC",
            "FACTORY_LOC")
            .from('CP_FACTORY_SALESLOC');
        const liPartProd = await cds.run(`
            SELECT "PRODUCT_ID",
                    "LOCATION_ID",
                    "REF_PRODID" 
              FROM CP_PARTIALPROD_INTRO
              WHERE LOCATION_ID IN ( SELECT "LOCATION_ID" FROM CP_LOCATION)
`);
        // Insert master data which doesnot exist in Factory location table
        let vFlag = '';
        let liFactLoctTemp = [],
            liFactLoc = [];
        let lsFactLoc = {};
        for (let cntLC = 0; cntLC < liPartProd.length; cntLC++) {
            if (liPartProd[cntLC].PRODUCT_ID !== liPartProd[cntLC].REF_PRODID) {
                vFlag = '';
                for (let i = 0; i < liFtLoc.length; i++) {
                    if (liFtLoc[i].PLAN_LOC === liPartProd[cntLC].LOCATION_ID &&
                        liFtLoc[i].PRODUCT_ID === liPartProd[cntLC].PRODUCT_ID &&
                        liFtLoc[i].LOCATION_ID === liPartProd[cntLC].LOCATION_ID &&
                        liFtLoc[i].FACTORY_LOC === liPartProd[cntLC].LOCATION_ID) {
                        vFlag = 'X';
                        break;
                    }
                }
                if (vFlag === '') {
                    lsFactLoc = {};
                    lsFactLoc['LOCATION_ID'] = GenF.parse(liPartProd[cntLC].LOCATION_ID);
                    lsFactLoc['PRODUCT_ID'] = GenF.parse(liPartProd[cntLC].PRODUCT_ID);
                    lsFactLoc['PLAN_LOC'] = GenF.parse(liPartProd[cntLC].LOCATION_ID);
                    lsFactLoc['FACTORY_LOC'] = GenF.parse(liPartProd[cntLC].LOCATION_ID);
                    // console.log(lsFactLoc);
                    liFactLoctTemp.push(GenF.parse(lsFactLoc));
                }
            }
        }

        const keys = ['LOCATION_ID', 'PRODUCT_ID', 'PLAN_LOC', 'FACTORY_LOC'];
        liFactLoc = GenF.removeDuplicate(liFactLoctTemp, keys);
        if (liFactLoc.length > 0) {
            try {

                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_FACTORY_SALESLOC'] },
                        entries: liFactLoc
                    }
                });
                console.log("Updated Factory Location");
            }
            catch (error) {
                console.log("Unable to insert records", error)
            }
        }
        else {
            console.log("No records to update Factory-Locations");
        }
    }
    /**
     * Clear Sales History
     */
    async clearSalesH() {
        console.log("start");
        // Delete only before sales horizon
        const objCatFn = new Catservicefn();
        await objCatFn.deleteSalesHistory('N');

        console.log("end");
    }
    /**
     * Generate Cluster Results to CP_V_AHC_CLUSTER_RESULTS
     */
    async genClusterResults(req) {
        // var request = require('request');
        var baseUrl = req.headers['x-forwarded-proto'] + '://' + req.headers.host;  // Un-Comment while deploying
        console.log("Started Generation of Clusters");
        // var baseUrl = 'http' + '://' + req.headers.host;
        var sUrl = baseUrl + '/pal/genClusters';
        let sLocation = req.data.LOCATION_ID;
        let sProfile = '';
        let options = {};

        const liDistinctProd = await cds.run(
            `SELECT DISTINCT PRODUCT_ID
               FROM V_SALES_H
              WHERE LOCATION_ID = '${req.data.LOCATION_ID}'
                AND REF_PRODID = '${req.data.PRODUCT_ID}'`
        );



        if (liDistinctProd.length > 0) {
            for (let i = 0; i < liDistinctProd.length; i++) {

                // Deletion of Previously generated cluster results based on location-product
                await cds.run(
                    `DELETE FROM CP_AHC_RESULTS
                  WHERE LOCATION_ID  = '${req.data.LOCATION_ID}'
                    AND PRODUCT_ID   = '${liDistinctProd[i].PRODUCT_ID}'`
                );

                // 
                await cds.run(
                    `DELETE FROM CP_AHC_COMBINE_PROCESS
                  WHERE LOCATION_ID  = '${req.data.LOCATION_ID}'
                    AND PRODUCT_ID   = '${liDistinctProd[i].PRODUCT_ID}'`
                );


                const iCountUID = await cds.run(
                    `SELECT DISTINCT COUNT("UNIQUE_ID") AS COUNT_UID
                       FROM CP_CLUSTER_DATA
                      WHERE LOCATION_ID = '${req.data.LOCATION_ID}'
                        AND PRODUCT_ID = '${liDistinctProd[i].PRODUCT_ID}'`
                );

                // Based on Unique Id Count, profile is changed as per the test script config
                sProfile = GenF.getClusterProfile(iCountUID[0].COUNT_UID);
                var auth =  await GenF.getAuthorization();
                // if (iCountUID[0].COUNT_UID < 10) {
                //     sProfile = "SBP_AHC_3";
                // } else {
                //     sProfile = "SBP_AHC_0";
                // } 

                options = {
                    'method': 'POST',
                    'url': sUrl,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization':auth
                    },

                    body: JSON.stringify({
                        "vcRulesList": [
                            {
                                "profile": sProfile,
                                "override": true,
                                "Location": sLocation,
                                "Product": liDistinctProd[i].PRODUCT_ID
                            }
                        ]
                    })

                };
                request(options, function (error, response) {

                    if (error) throw new Error(error);

                    // console.log(response.body);

                });
            }
            console.log("Completed Cluster Results Generation");
        }


    }


    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
    async saveClusterData(lLocation, lProduct) {
        let liProd = [];
        let lsClusterData = {};
        let liClusterData = [];
        let aFilterUniqChars = [];
        let iCharCount = 0;
        let sUniqueId = '';

        console.log("Started Cluster Data Updation");
        const liUniqueId = await cds.run(
            `SELECT UNIQUE_ID,
                    CHAR_NUM,
                    CHAR_VALUE
              FROM V_UNIQUE_ID
             WHERE (UNIQUE_ID IN (SELECT DISTINCT UNIQUE_ID
             FROM V_SALES_H
            WHERE LOCATION_ID = '${lLocation}'
              AND REF_PRODID = '${lProduct}'))`
        );

        const keys = ['UNIQUE_ID'];
        const liDistinctUniqueIds = GenF.removeDuplicate(liUniqueId, keys);

        let liPriChar = [];
        liPriChar = await cds.run(`SELECT "CHAR_NUM"
                                     FROM "CP_VARCHAR_PS"
                                    WHERE "PRODUCT_ID" = '` + lProduct + `'
                                      AND "CHAR_TYPE" = 'P'
                                      ORDER BY  "SEQUENCE" `);

        let liSecChar = [];
        liSecChar = await cds.run(`SELECT "CHAR_NUM"
                                     FROM "CP_VARCHAR_PS"
                                    WHERE "PRODUCT_ID" = '` + lProduct + `'
                                      AND "CHAR_TYPE" = 'S'
                                      ORDER BY  "SEQUENCE" `);

        for (let i = 0; i < liDistinctUniqueIds.length; i++) {
            lsClusterData = {};

            liProd = await cds.run(
                `SELECT DISTINCT PRODUCT_ID
                      FROM V_SALES_H
                     WHERE LOCATION_ID = '${lLocation}'
                       AND REF_PRODID  = '${lProduct}'
                       AND UNIQUE_ID   = '${liDistinctUniqueIds[i].UNIQUE_ID}'`
            );

            lsClusterData['LOCATION_ID'] = lLocation;
            lsClusterData['PRODUCT_ID'] = liProd[0].PRODUCT_ID;
            lsClusterData['UNIQUE_ID'] = liDistinctUniqueIds[i].UNIQUE_ID;

            iCharCount = 0;
            for (let cntPC = 0; cntPC < liPriChar.length; cntPC++) {
                aFilterUniqChars = [];
                if (iCharCount < 20) {
                    aFilterUniqChars = liUniqueId.filter(function (aUnichar) {
                        return aUnichar.UNIQUE_ID === liDistinctUniqueIds[i].UNIQUE_ID &&
                            aUnichar.CHAR_NUM === liPriChar[cntPC].CHAR_NUM
                    });

                    if (aFilterUniqChars.length > 0) {
                        for (let cntUPC = 0; cntUPC < aFilterUniqChars.length; cntUPC++) {
                            iCharCount = iCharCount + 1;
                            if (iCharCount <= 20) {
                                // lsClusterData["C" + iCharCount] = GenF.parse(aFilterUniqChars[cntUPC].CHARVAL_NUM);
                                lsClusterData["C" + iCharCount] = GenF.parse(aFilterUniqChars[cntUPC].CHAR_VALUE);
                            } else {
                                break;
                            }
                        }
                    }
                } else {
                    break;
                }
            }
            for (let cntSC = 0; cntSC < liSecChar.length; cntSC++) {
                aFilterUniqChars = [];
                if (iCharCount < 20) {
                    aFilterUniqChars = liUniqueId.filter(function (aUnichar) {
                        return aUnichar.UNIQUE_ID === liDistinctUniqueIds[i].UNIQUE_ID &&
                            aUnichar.CHAR_NUM === liSecChar[cntSC].CHAR_NUM
                    });

                    if (aFilterUniqChars.length > 0) {
                        for (let cntUSC = 0; cntUSC < aFilterUniqChars.length; cntUSC++) {
                            iCharCount = iCharCount + 1;
                            if (iCharCount <= 20) {
                                // lsClusterData["C" + iCharCount] = GenF.parse(aFilterUniqChars[cntUSC].CHARVAL_NUM);
                                lsClusterData["C" + iCharCount] = GenF.parse(aFilterUniqChars[cntUSC].CHAR_VALUE);
                            }
                        }
                    }
                } else {
                    break;
                }
            }
            // Need to update char value as 'NA' instead of 'NULL' to handle in cluster generations
            if (iCharCount < 20) {
                do {
                    iCharCount = iCharCount + 1;
                    lsClusterData["C" + iCharCount] = "NA";
                }
                while (iCharCount < 20);
            }

            lsClusterData['UNIQUE_ID'] = lsClusterData['UNIQUE_ID'].toString();
            sUniqueId = (liDistinctUniqueIds[i].UNIQUE_ID).toString();

            liClusterData.push(GenF.parse(lsClusterData));

            // 
            try {
                await cds.run(
                    `DELETE FROM CP_CLUSTER_DATA
                  WHERE LOCATION_ID  = '${lLocation}'
                    AND PRODUCT_ID   = '${liProd[0].PRODUCT_ID}'
                    AND UNIQUE_ID    =  '${sUniqueId}'`
                );
            } catch (e) {
                console.log(e);
            }

            // iCharCount = 0;
            // if (liSOHM[cntSO].PCONFIG.length > 0) {
            //     for (let cntSOPC = 0; cntSOPC < liSOHM[cntSO].PCONFIG.length; cntSOPC++) {
            //         iCharCount = iCharCount + 1;
            //         if (iCharCount <= 20) {
            //             lsClusterData["C" + iCharCount] = liSOHM[cntSO].PCONFIG[cntSOPC].CHARVAL_NUM;
            //         }
            //     }
            // }
            // if (liSOHM[cntSO].CONFIG.length > 0 && iCharCount < 20) {
            //     for (let cntSOC = 0; cntSOC < liSOHM[cntSO].CONFIG.length; cntSOC++) {
            //         iCharCount = iCharCount + 1;
            //         if (iCharCount <= 20) {
            //             lsClusterData["C" + iCharCount] = liSOHM[cntSO].CONFIG[cntSOC].CHARVAL_NUM;
            //         }
            //     }
            // }

            // liClusterData.push(lsClusterData);

        }

        if (liClusterData.length > 0) {
            try {

                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_CLUSTER_DATA'] },
                        entries: liClusterData
                    }
                });
                console.log("Updated Cluster Data");
            }
            catch (error) {
                console.log("Unable to insert cluster records", error)
            }
            // await INSERT(liClusterData).into('CP_CLUSTER_DATA');
        }
        console.log("Completed Cluster Data Updation");

    }

    async GenerateCritical(isFunction) {
        var sAsmbCritical = 'No',
            sMultiBOM = 'No',
            liresults = [];

        const liSysConfigData = await cds.run(`SELECT *
                                                FROM "CP_USER_PREFERENCES"`);
        if (liSysConfigData.length > 0) {
            sAsmbCritical = liSysConfigData.find(f => f.PARAMETER == 'CRITICAL_ASSEMBLY')?.PARAMETER_VALUE;
            sMultiBOM = liSysConfigData.find(f => f.PARAMETER == 'MULTILEVEL_CONFIGPRODUCT')?.PARAMETER_VALUE;
        }
        var liCrtCompdata = await cds.run(
            `SELECT * FROM CP_CRITICAL_COMP 
                ORDER BY LOCATION_ID,
                        PRODUCT_ID,
                        ITEM_NUM,
                        ASSEMBLY,
                        COMPONENT`
        );
        if ((sAsmbCritical == 'No' && sMultiBOM == 'Yes') || (sAsmbCritical == 'Yes' && sMultiBOM == 'Yes')) { //Proceed with CP_BOM_MAT 
            let lsresults = {};
            let aDisntictLocProd = await cds.run(`SELECT DISTINCT LOCATION_ID,MAT_PARENT
            FROM CP_BOM_MAT
            WHERE MAT_PARENT NOT IN (SELECT DISTINCT MAT_CHILD FROM CP_BOM_MAT WHERE MAT_CHILD IS NOT NULL)
            ORDER BY LOCATION_ID, MAT_PARENT`);
            var aBomData = await cds.run(`SELECT *
            FROM CP_BOM_MAT                                 
            ORDER BY LOCATION_ID,
                     MAT_PARENT,
                     MAT_CHILD,
                     CHILD_LOC`)
            if (aDisntictLocProd.length > 0) {
                for (let j = 0; j < aDisntictLocProd.length; j++) {
                    var aData = [];
                    await nestedAssembly(aDisntictLocProd[j].LOCATION_ID, aDisntictLocProd[j].MAT_PARENT, aData, aBomData, aDisntictLocProd[j]);
                    if (aData.length > 0) {
                        liresults = liresults.concat(aData);
                    }
                }
                async function nestedAssembly(sLocation, sParent, aData, aBomData, oMainData) {
                    let aBOMMat = aBomData.filter(f => f.LOCATION_ID == sLocation && f.MAT_PARENT == sParent);
                    if (aBOMMat.length > 0) {
                        for (let i = 0; i < aBOMMat.length; i++) {
                            if (aBOMMat[i].PHANTOM_IND !== 'X' && aBOMMat[i].CLASS_FLG !== 'X') {
                                lsresults.LOCATION_ID = oMainData.LOCATION_ID;
                                lsresults.PRODUCT_ID = oMainData.MAT_PARENT;
                                // lsresults.LOCATION_ID = aBOMMat[i].CHILD_LOC;
                                // lsresults.PRODUCT_ID = aBOMMat[i].MAT_PARENT;
                                // lsresults.ITEM_NUM = '000010';
                                lsresults.ITEM_NUM = aBOMMat[i].COUNTER;
                                lsresults.ASSEMBLY = aBOMMat[i].MAT_CHILD;
                                lsresults.COMPONENT = aBOMMat[i].MAT_CHILD;
                                lsresults.COMP_DESC = aBOMMat[i].PROD_DESC;
                                lsresults.CRITICALKEY = 'X';
                                lsresults.ASSEMBLY_CRITICALKEY = 'X';
                                if (isFunction == true) {
                                    let aCriticalComp = liCrtCompdata.filter(f => f.LOCATION_ID == lsresults.LOCATION_ID && f.PRODUCT_ID == lsresults.PRODUCT_ID && f.ITEM_NUM == lsresults.ITEM_NUM && f.ASSEMBLY == lsresults.ASSEMBLY)
                                    if (aCriticalComp.length > 0) {
                                        aCriticalComp = aCriticalComp.filter(f => (f.COMPONENT === lsresults.COMPONENT) || (f.COMPONENT === null && lsresults.COMPONENT === '') || (f.COMPONENT === '' && lsresults.COMPONENT === null));
                                    }
                                    if (aCriticalComp.length > 0) {
                                        lsresults.CRITICALKEY = aCriticalComp[0].CRITICALKEY;
                                        lsresults.ASSEMBLY_CRITICALKEY = aCriticalComp[0].ASSEMBLY_CRITICALKEY;
                                    }
                                    else {
                                        lsresults.CRITICALKEY = '';
                                        lsresults.ASSEMBLY_CRITICALKEY = '';
                                    }
                                }
                                aData.push(GenF.parse(lsresults));
                                // nestedAssembly(aBOMMat[i].CHILD_LOC, lsresults.ASSEMBLY, aData, aBomData,oMainData)
                            }

                            // if (aBOMMat[i].PHANTOM_IND === 'X' || aBOMMat[i].CLASS_FLG === 'X' || aBOMMat[i].CONFIGURABLE === 'X') {
                                nestedAssembly(aBOMMat[i].CHILD_LOC, aBOMMat[i].MAT_CHILD, aData, aBomData, oMainData);
                            // }
                        }
                    } else {
                        return aData;
                    }
                }
                const keys = ['LOCATION_ID', 'PRODUCT_ID', 'ITEM_NUM', 'ASSEMBLY'];
                liresults = GenFunctions.removeDuplicate(liresults, keys);
                liresults = liresults.sort(GenFunctions.dynamicSortMultiple("LOCATION_ID", "PRODUCT_ID", 'ITEM_NUM', "ASSEMBLY"));
            }
        } else { //Proceed with CP_BOMHEADER
            var liAsmbCompdata = await cds.run(
                `SELECT DISTINCT
                CP_BOMHEADER.LOCATION_ID,
                CP_BOMHEADER.PRODUCT_ID,
                CP_BOMHEADER.ITEM_NUM,
                CP_BOMHEADER.COMPONENT AS ASSEMBLY,
                CP_ASSEMBLY_COMP.COMPONENT,
                CP_ASSEMBLY_COMP.COMP_DESC,
                CP_ASSEMBLY_COMP.CRITICAL_COMP
                FROM CP_BOMHEADER
               LEFT OUTER JOIN CP_ASSEMBLY_COMP 
                  ON CP_BOMHEADER.LOCATION_ID = CP_ASSEMBLY_COMP.LOCATION_ID
                 AND CP_BOMHEADER.COMPONENT = CP_ASSEMBLY_COMP.ASSEMBLY
            ORDER BY CP_BOMHEADER.LOCATION_ID,
                     CP_BOMHEADER.PRODUCT_ID,
                    CP_BOMHEADER.ITEM_NUM,
                    CP_BOMHEADER.COMPONENT,
                    CP_ASSEMBLY_COMP.COMPONENT`
            );


            let lsresults = {},
                vCompExist = '';
            for (let iAsmCmp = 0; iAsmCmp < liAsmbCompdata.length; iAsmCmp++) {
                lsresults = {};
                vCompExist = '';
                lsresults.LOCATION_ID = liAsmbCompdata[iAsmCmp].LOCATION_ID;
                lsresults.PRODUCT_ID = liAsmbCompdata[iAsmCmp].PRODUCT_ID;
                lsresults.ITEM_NUM = liAsmbCompdata[iAsmCmp].ITEM_NUM;
                lsresults.ASSEMBLY = liAsmbCompdata[iAsmCmp].ASSEMBLY;
                if (liAsmbCompdata[iAsmCmp].COMPONENT === '' || liAsmbCompdata[iAsmCmp].COMPONENT === null) {
                    lsresults.COMPONENT = '';
                } else {
                    lsresults.COMPONENT = liAsmbCompdata[iAsmCmp].COMPONENT;
                }
                // lsresults.COMPONENT = liAsmbCompdata[iAsmCmp].COMPONENT;
                lsresults.COMP_DESC = liAsmbCompdata[iAsmCmp].COMP_DESC;
                // for (let iCrtCmp = 0; iCrtCmp < liCrtCompdata.length; iCrtCmp++) {
                //     if (liAsmbCompdata[iAsmCmp].LOCATION_ID === liCrtCompdata[iCrtCmp].LOCATION_ID &&
                //         liAsmbCompdata[iAsmCmp].PRODUCT_ID === liCrtCompdata[iCrtCmp].PRODUCT_ID &&
                //         liAsmbCompdata[iAsmCmp].ITEM_NUM === liCrtCompdata[iCrtCmp].ITEM_NUM &&
                //         liAsmbCompdata[iAsmCmp].ASSEMBLY === liCrtCompdata[iCrtCmp].ASSEMBLY &&
                //         liAsmbCompdata[iAsmCmp].COMPONENT === liCrtCompdata[iCrtCmp].COMPONENT &&
                //         liAsmbCompdata[iAsmCmp].CRITICAL_COMP !== 'Y') {
                //         vCompExist = 'X';
                //         break;
                //     }
                // }
                // if (vCompExist === '') {
                //#region patch to make assemblies as critical if the value is No
                if (liSysConfigData.length > 0 && liAsmbCompdata[iAsmCmp].CRITICAL_COMP !== 'Y') {
                    if (sAsmbCritical == 'No' && isFunction == false) { //modify CRITICAL_COMP to y only if it is from Action call
                        liAsmbCompdata[iAsmCmp].CRITICAL_COMP = 'Y';
                    }
                }
                //#endregion

                if (liAsmbCompdata[iAsmCmp].CRITICAL_COMP === 'Y') {
                    lsresults.CRITICALKEY = 'X';
                    lsresults.ASSEMBLY_CRITICALKEY = 'X';
                }
                // else {
                //     lsresults.CRITICALKEY = '';
                //     lsresults.ASSEMBLY_CRITICALKEY = '';
                // }
                else {
                    // Begin of change - update existing critical component check
                    if (liCrtCompdata && liCrtCompdata.length > 0 && isFunction == true) {
                        let aCriticalComp = [];
                        let el = liAsmbCompdata[iAsmCmp];
                        aCriticalComp = liCrtCompdata.filter(f => f.LOCATION_ID == el.LOCATION_ID && f.PRODUCT_ID == el.PRODUCT_ID && f.ITEM_NUM == el.ITEM_NUM && f.ASSEMBLY == el.ASSEMBLY)
                        if (aCriticalComp.length > 0) {
                            aCriticalComp = aCriticalComp.filter(f => (f.COMPONENT === el.COMPONENT) || (f.COMPONENT === null && el.COMPONENT === '') || (f.COMPONENT === '' && el.COMPONENT === null));
                        }
                        //    aCriticalComp = liCrtCompdata.filter(function (aCriComp) {

                        //        return aCriComp.LOCATION_ID === liCrtCompdata[iAsmCmp].LOCATION_ID &&
                        //            aCriComp.PRODUCT_ID === liCrtCompdata[iAsmCmp].PRODUCT_ID &&
                        //            aCriComp.ITEM_NUM === liCrtCompdata[iAsmCmp].ITEM_NUM &&
                        //            aCriComp.ASSEMBLY === liCrtCompdata[iAsmCmp].ASSEMBLY &&
                        //            aCriComp.COMPONENT === liCrtCompdata[iAsmCmp].COMPONENT
                        //    });
                        if (aCriticalComp.length > 0) {
                            lsresults.CRITICALKEY = aCriticalComp[0].CRITICALKEY;
                            lsresults.ASSEMBLY_CRITICALKEY = aCriticalComp[0].ASSEMBLY_CRITICALKEY;
                        }
                        else {
                            lsresults.CRITICALKEY = '';
                            lsresults.ASSEMBLY_CRITICALKEY = '';
                        }
                    } else {
                        lsresults.CRITICALKEY = '';
                        lsresults.ASSEMBLY_CRITICALKEY = '';
                    }
                }
                liresults.push(GenF.parse(lsresults));
                // try {
                //     let sqlStr = 'UPSERT "CP_CRITICAL_COMP" VALUES (' +
                //     "'" + lsresults.LOCATION_ID + "'" + "," +
                //     "'" + lsresults.PRODUCT_ID + "'" + "," +
                //     "'" + lsresults.ITEM_NUM + "'" + "," +
                //     "'" + lsresults.ASSEMBLY + "'" + "," +
                //     "'" + lsresults.COMPONENT + "'" + "," +
                //     "'" + lsresults.COMP_DESC + "'" + "," +
                //     "'" + lsresults.CRITICALKEY + "'" + "," +
                //     "'" + lsresults.ASSEMBLY_CRITICALKEY  + "'" + ')' + ' WITH PRIMARY KEY';
                //     await cds.run(sqlStr);

                // } catch (error) {
                //         console.log(e);
                // }
                // }
            }
        }
        if (liresults.length > 0) {
            await cds.run(
                `DELETE FROM CP_CRITICAL_COMP`
            );
            try {
                await cds.run({
                    INSERT: {
                        into: {
                            ref: ['CP_CRITICAL_COMP']
                        },
                        entries: liresults
                    }
                })
            } catch (e) {
                console.log(e);
            }
        }
    }
    async UpdateCriticalComp() {
        let liCriticalData = await cds.run(
            `SELECT LOCATION_ID,
                PRODUCT_ID,
                ITEM_NUM,
                ASSEMBLY,
                ASSEMBLY_CRITICALKEY
           FROM "CP_CRITICAL_COMP" 
           WHERE ASSEMBLY_CRITICALKEY = 'X'`
        );
        for (let iCrt = 0; iCrt < liCriticalData.length; iCrt++) {
            await UPDATE`CP_CRITICAL_COMP`
                .with({
                    ASSEMBLY_CRITICALKEY: liCriticalData[iCrt].ASSEMBLY_CRITICALKEY
                })
                .where(`LOCATION_ID = '${liCriticalData[iCrt].LOCATION_ID}'
                    AND PRODUCT_ID = '${liCriticalData[iCrt].PRODUCT_ID}' 
                    AND ITEM_NUM = '${liCriticalData[iCrt].ITEM_NUM}'
                    AND ASSEMBLY = '${liCriticalData[iCrt].ASSEMBLY}'                                   
                    `);
        }

    }
    async updateIBPCustomer() {
        await UPDATE`CP_SALESH`
            .with({
                IBP_CUSTOMER: 'N/A'
            })
            .where(`IBP_CUSTOMER IS NULL `);
    }
    /** 
 * Function to process Sales History from Virtual Table and generate Unique Ids 
 * @param {*} sLocation  
 * @param {*} sProduct  
 * @param {*} aSalesH  
 */
    async processSO(sLocation, sProduct, aSalesH) {
        let oSalesH = {},
            aSalesConfig = [];
        if (aSalesH.length > 0) {
            await DELETE.from('CP_SALESH_CONFIG_VT')
                .where(`LOCATION_ID = '${sLocation}' AND PRODUCT_ID =                 '${sProduct}'`);
            for (let iSO = 0; iSO < aSalesH.length; iSO++) {
                oSalesH.LOCATION_ID = sLocation;
                oSalesH.PRODUCT_ID = sProduct;
                oSalesH.SALES_DOC = aSalesH[iSO].SALES_DOCUMENT;
                oSalesH.SALESDOC_ITEM = aSalesH[iSO].SALES_DOCUMENT_ITEM;
                oSalesH.CHAR_NUM = aSalesH[iSO].CHARACTERSTIC_NUM;
                oSalesH.CHARVAL_NUM = aSalesH[iSO].VALUE_NUM;
                aSalesConfig.push(GenF.parse(oSalesH));
            }

            if (aSalesConfig.length > 0) {
                await INSERT.into("CP_SALESH_CONFIG_VT").entries(aSalesConfig);
            }
        }
    }

    /**
     * Function to process unique id valid from and valid to and update at each partial product characteristic level
     * @param {Location} lLocation
     * @param {Product} lProduct
     */

    async genConfigValidity(lLocation, lProduct) {

        let oPartialProdConfig = {},
            aPartialProdConfig = [];


        // Get all Characteristic Values for Location-Config Product

        let aDistLocProdConfig = await cds.run(`SELECT DISTINCT PRODUCT_ID,
                                                        CLASS_NUM,
                                                        CHAR_NUM,
                                                        CHAR_VALUE
                                                    FROM V_PARTIALPRODCLASSCHAR
                                                    WHERE LOCATION_ID = '${lLocation}'
                                                    AND REF_PRODID = '${lProduct}'`);



        // Get all the Unique Characteristics from Sales History

        let aUniqChar = await cds.run(`SELECT DISTINCT V_SALES_H.LOCATION_ID,
                                               V_SALES_H.PRODUCT_ID,
                                               V_UNIQUE_ID_ITEM.UNIQUE_ID,
                                               V_UNIQUE_ID_ITEM.CLASS_NUM,
                                               V_UNIQUE_ID_ITEM.CHAR_NUM,
                                               V_UNIQUE_ID_ITEM.CHAR_VALUE,
                                               V_UNIQUE_ID_ITEM.VALID_FROM,
                                               V_UNIQUE_ID_ITEM.VALID_TO
                                            FROM V_SALES_H
                                            JOIN V_UNIQUE_ID_ITEM
                                              ON V_SALES_H.UNIQUE_ID = V_UNIQUE_ID_ITEM.UNIQUE_ID 
                                            WHERE V_SALES_H.LOCATION_ID = '${lLocation}'
                                              AND V_SALES_H.REF_PRODID = '${lProduct}'`);



        if (aDistLocProdConfig.length > 0) {

            for (let iProds = 0; iProds < aDistLocProdConfig.length; iProds++) {
                oPartialProdConfig = {};

                await cds.run(

                    `DELETE FROM CP_PARTIALPROD_CHAR_VALIDITY
                      WHERE PRODUCT_ID     = '${aDistLocProdConfig[iProds].PRODUCT_ID}'
                        AND CLASS_NUM      = '${aDistLocProdConfig[iProds].CLASS_NUM}'
                        AND CHAR_NUM       = '${aDistLocProdConfig[iProds].CHAR_NUM}'
                        AND CHAR_VALUE    = '${aDistLocProdConfig[iProds].CHAR_VALUE}'`
                );



                oPartialProdConfig.PRODUCT_ID = aDistLocProdConfig[iProds].PRODUCT_ID;
                oPartialProdConfig.CLASS_NUM = aDistLocProdConfig[iProds].CLASS_NUM;
                oPartialProdConfig.CHAR_NUM = aDistLocProdConfig[iProds].CHAR_NUM;
                oPartialProdConfig.CHARVAL_NUM = aDistLocProdConfig[iProds].CHAR_VALUE;
                oPartialProdConfig.CHAR_VALUE = aDistLocProdConfig[iProds].CHAR_VALUE;


                let aUniqueConfig = aUniqChar.filter(function (aUIDChar) {

                    return aUIDChar.CLASS_NUM === aDistLocProdConfig[iProds].CLASS_NUM &&
                        aUIDChar.CHAR_NUM === aDistLocProdConfig[iProds].CHAR_NUM &&
                        aUIDChar.CHAR_VALUE === aDistLocProdConfig[iProds].CHAR_VALUE;

                });



                if (aUniqueConfig.length > 0) {

                    // Get Minimum Valid From and Maximum ValidTo from an array of Unique Ids

                    oPartialProdConfig.VALID_FROM = aUniqueConfig.reduce((min, p) => p.VALID_FROM < min ? p.VALID_FROM : min, aUniqueConfig[0].VALID_FROM);

                    oPartialProdConfig.VALID_TO = aUniqueConfig.reduce((max, p) => p.VALID_TO > max ? p.VALID_TO : max, aUniqueConfig[0].VALID_TO);

                    aPartialProdConfig.push(GenF.parse(oPartialProdConfig));

                }

            }


            // Insert Data to Partial Prod Config Validity Table
            if (aPartialProdConfig.length > 0) {
                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_PARTIALPROD_CHAR_VALIDITY'] },
                        entries: aPartialProdConfig
                    }

                });

            }

        }



    }
    /**
    * Function to update primary ids validity dates
    * @param {*} lLocation 
    * @param {*} lProduct 
    */
    async updatePrimaryIdValidity(lLocation, lProduct) {
        let aFilUniqueID = [], aFilUniqueIDHdr = [];

        // Get Unique & Primary Ids header data for Config Product
        let aUniqPriIdHeader = await cds.run(`SELECT *
                                               FROM CP_UNIQUE_ID_HEADER
                                              WHERE PRODUCT_ID = '${lProduct}'`);

        // Get mapping of Unique & Primary Ids for Location-Config Product from sales history
        let aUniPriIds = await cds.run(`SELECT DISTINCT 
                                               UNIQUE_ID,
                                               PRIMARY_ID
                                          FROM V_SALES_H
                                         WHERE LOCATION_ID = '${lLocation}'
                                           AND REF_PRODID = '${lProduct}'`);


        // Split an Array into an object of arrays based on UID TYPE(U, P)
        let oUIDPIDs = aUniqPriIdHeader.reduce((aCurrData, item) => {
            if (!aCurrData[item.UID_TYPE]) {
                aCurrData[item.UID_TYPE] = [];
            }

            aCurrData[item.UID_TYPE].push(item);
            return aCurrData;
        }, {});

        // If Unique Ids and Primary Ids are defined
        if (oUIDPIDs !== undefined) {
            let aPID = [], aUID = [];
            if (oUIDPIDs.P !== undefined && oUIDPIDs.P !== " ") {
                aPID = oUIDPIDs.P;
            }
            aUID = oUIDPIDs.U;
            if (aPID.length > 0) {
                // Loop through each Primary Id 
                for (let iPid = 0; iPid < aPID.length; iPid++) {
                    aFilUniqueID = [];
                    aFilUniqueIDHdr = [];
                    // Filter Primary Ids to get Unique IDs mapped to it
                    aFilUniqueID = aUniPriIds.filter(function (aUIDs) {
                        return aUIDs.PRIMARY_ID === aPID[iPid].UNIQUE_ID;
                    });

                    if (aFilUniqueID.length > 0) {
                        // Filter an array of Objects based on another array
                        // For the above filtered Unique IDs get header details (Valid From and Valid To)
                        aFilUniqueIDHdr = aUID.filter((elem) => {
                            return aFilUniqueID.some((ele) => {
                                return ele.UNIQUE_ID === elem.UNIQUE_ID;
                            });
                        });
                        if (aFilUniqueIDHdr.length > 0) {
                            // // Get Minimum Valid From and Maximum ValidTo from an array of Unique Ids
                            // aPID[iPid].VALID_FROM = aFilUniqueIDHdr.reduce((min, p) => p.VALID_FROM < min ? p.VALID_FROM : min, aFilUniqueIDHdr[0].VALID_FROM);
                            // aPID[iPid].VALID_TO = aFilUniqueIDHdr.reduce((max, p) => p.VALID_TO > max ? p.VALID_TO : max, aFilUniqueIDHdr[0].VALID_TO);

                            try {
                                // Update Valid From and Valid To of Primary Ids based on Rules
                                await UPDATE`CP_UNIQUE_ID_HEADER`
                                    .with({
                                        VALID_FROM: '2000-01-01',
                                        VALID_TO: '9999-12-31'
                                    })
                                    .where(`UNIQUE_ID = '${aPID[iPid].UNIQUE_ID}'
                                   AND PRODUCT_ID = '${lProduct}'`);
                                // await UPDATE`CP_UNIQUE_ID_HEADER`
                                //     .with({
                                //         VALID_FROM: aPID[iPid].VALID_FROM,
                                //         VALID_TO: aPID[iPid].VALID_TO
                                //     })
                                //     .where(`UNIQUE_ID = '${aPID[iPid].UNIQUE_ID}'
                                //    AND PRODUCT_ID = '${lProduct}'`);
                            } catch (e) {
                                console.log('Unable to update validity date for primary id:' + aPID[iPid].UNIQUE_I);
                                console.log(e);
                            }
                        }
                    }

                }
            }

        }
    }
    // Update for initial load 
    async genBOMUIDMapping(lLocation, lProduct, req) {
        let lMessage = '';
        // First check for mapping table
        let lsFactory = await SELECT.one
            .from('CP_FACTORY_SALESLOC')
            .columns('FACTORY_LOC')
            .where(`LOCATION_ID = '${lLocation}'`);
        if (lsFactory === null) {
            lMessage = lMessage + ' ' + 'Please maintain Planning network maintenance for Location :' + lLocation;
            console.log(lMessage);
        }
        // let vCount = await cds.run(`SELECT COUNT(*) 
        //                                      FROM CP_BOM_UID 
        //                                     WHERE FACTORY_LOC = '${lsFactory.FACTORY_LOC}'
        //                                     AND REF_PRODID = '${lProduct}'
        //                                                 `);
        // if (vCount > 0) {
        //     console.log('Data exists');
        // }
        // else {
        await oAsmbReq.genBOMUID(lLocation, lProduct, req);
        // }
    }
    async generateDummy() {
        const objCatFn = new Catservicefn();
        objCatFn.getDummyProd();
    }
    async removeDuplicates(records){
        const uniqueRecords = [];
        const seenConfigs = new Set();
    
        records.forEach(record => {
            const configString = JSON.stringify(record.CONFIG);
            if (!seenConfigs.has(configString)) {
                // If not, add CONFIG to the Set and the record to uniqueRecords
                seenConfigs.add(configString);
                uniqueRecords.push(record);
            }
        });
        return uniqueRecords;
    }

}

module.exports = SOFunctions;