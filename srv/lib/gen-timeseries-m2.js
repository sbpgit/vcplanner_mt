const request = require('request');
const rp = require('request-promise');
const GenF = require("./gen-functions");
const cds = require("@sap/cds");
const hana = require("@sap/hana-client");
const { userFamilyName } = require("@sap-cloud-sdk/core/dist/connectivity/scp-cf/user");
const {   subWeeks,   getISOWeek,   getISOWeekYear } = require('date-fns');


class GenTimeseriesM2 {
    constructor() { }

    /**
     * Generate Timeseries
     */
    async genTimeseries(adata, req, Flag) {

        // await GenF.logMessage(req, `Started history timeseries`);
        let lMainProduct = '';
        let lFlag = '', FlagTest = '';

        let liPrimaryID = [];
        let lsPrimaryID = {};
        let vCurrDate = GenF.getCurrentDate();
        let aFilPrimaryId = [];
        var oReturn = {
            bError: false,
            message: ''
        }
        let lsMainProduct = await SELECT.one
            .from('CP_PARTIALPROD_INTRO')
            .columns('REF_PRODID')
            .where(`PRODUCT_ID = '${adata.PRODUCT_ID}' AND LOCATION_ID = '${adata.LOCATION_ID}'`);
        if (lsMainProduct === null || lsMainProduct == undefined) {

            lMainProduct = GenF.parse(adata.PRODUCT_ID);

        }
        else {
            lMainProduct = lsMainProduct.REF_PRODID;
        }


        let liPrimaryIDMain = await cds.run(`SELECT 
                                                    "UNIQUE_ID",
                                                    "PRODUCT_ID",
                                                    "UNIQUE_DESC",
                                                    "UID_TYPE",
                                                    "ACTIVE",
                                                    "CHAR_NUM",
                                                    "CHAR_VALUE"
                                                FROM V_UNIQUE_ID
                                                WHERE (unique_id IN (SELECT DISTINCT PRIMARY_ID
                                                        FROM CP_SALES_HM
                                                        WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                            AND PRODUCT_ID = '${adata.PRODUCT_ID}'))
                                                    AND PRODUCT_ID = '${lMainProduct}'
                                                    AND "UID_TYPE" = 'P'
                                                    AND "ACTIVE" = true
                                                ORDER BY 
                                                    "UNIQUE_ID" ASC, 
                                                    "CHAR_NUM" ASC;`);

        // Get Valid Primary Ids from Current Date 
        const liPrimaryId = await cds.run(`SELECT * 
                                             FROM CP_UNIQUE_ID_HEADER
                                            WHERE PRODUCT_ID = '${lMainProduct}'
                                              AND UID_TYPE = 'P'
                                              AND VALID_TO >= '${vCurrDate}'`);


        // Remove Partial Characteristics
        const lipartialchar = await cds.run(
            `SELECT *
        FROM "V_PARTIALPRODCHAR"
        WHERE "LOCATION_ID" = '` + adata.LOCATION_ID + `'
        AND ( "PRODUCT_ID" = '` + adata.PRODUCT_ID + `')
        AND CONFIGPROD_CHK IS NULL`
            // AND ( "PRODUCT_ID" = '` + lMainProduct + `')`
            // OR "REF_PRODID" = '` + lMainProduct + `' )`
        );

        /** Commented below code, as it is handled in different process */
        // Verify if Primary Id is Valid to process further
        // aFilPrimaryId = [];
        // // Filter an array of Objects based on another array
        // // For the above fetched Valid Primary IDs apply filter to process further
        // aFilPrimaryId = liPrimaryIDMain.filter((elem) => {
        //     return liPrimaryId.some((ele) => {
        //         return ele.UNIQUE_ID === elem.UNIQUE_ID;
        //     });
        // });

        // liPrimaryIDMain = aFilPrimaryId;

        for (let i = 0; i < liPrimaryIDMain.length; i++) {
            lFlag = '';
            for (let j = 0; j < lipartialchar.length; j++) {
                if (lipartialchar[j].CHAR_NUM === liPrimaryIDMain[i].CHAR_NUM &&
                    lipartialchar[j].CHAR_VALUE === liPrimaryIDMain[i].CHAR_VALUE) {
                    // lipartialchar[j].CHARVAL_NUM === liPrimaryIDMain[i].CHARVAL_NUM) {
                    lFlag = 'X';
                    break;
                }
            }
            if (lFlag !== 'X') {
                lsPrimaryID.UNIQUE_ID = GenF.parse(liPrimaryIDMain[i].UNIQUE_ID);
                lsPrimaryID.PRODUCT_ID = GenF.parse(liPrimaryIDMain[i].PRODUCT_ID);
                lsPrimaryID.LOCATION_ID = GenF.parse(adata.LOCATION_ID);
                lsPrimaryID.UNIQUE_DESC = GenF.parse(liPrimaryIDMain[i].UNIQUE_DESC);
                lsPrimaryID.UID_TYPE = GenF.parse(liPrimaryIDMain[i].UID_TYPE);
                lsPrimaryID.ACTIVE = GenF.parse(liPrimaryIDMain[i].ACTIVE);
                lsPrimaryID.CHAR_NUM = GenF.parse(liPrimaryIDMain[i].CHAR_NUM);
                lsPrimaryID.CHAR_VALUE = GenF.parse(liPrimaryIDMain[i].CHAR_VALUE);
                // lsPrimaryID.CHARVAL_NUM = GenF.parse(liPrimaryIDMain[i].CHARVAL_NUM);
                liPrimaryID.push(GenF.parse(lsPrimaryID));
                lsPrimaryID = {};
            }
        }

        if (liPrimaryID.length === 0) {
            oReturn.bError = true;
            oReturn.message = 'Please check characteristics Priority , unable to generate timeseries';
            await GenF.logMessage(req, `Please check characteristics Priority , unable to generate timeseries`);
            // await GenF.jobSchMessage('', "Please check characteristics Priority , unable to generate timeseries", req);
            return oReturn;
        }

        // Get Sales Count Information
        const liPrimaryCount = await cds.run(
            `SELECT 
                A.PRODUCT_ID,
                CASE
                    WHEN WEEK("MAT_AVAILDATE") < 10 THEN CONCAT( YEAR("MAT_AVAILDATE"), CONCAT( '0', WEEK("MAT_AVAILDATE") ) )
                    ELSE CONCAT( YEAR("MAT_AVAILDATE"), WEEK("MAT_AVAILDATE") )
                END AS WEEK_NO,
                PRIMARY_ID,
                B.ORD_QTY AS TARGET_QTY,
                sum(A.ORD_QTY) AS ORD_QTY
            FROM 
                V_SALES_H AS A
            INNER JOIN
                V_ORD_COUNT AS B
            ON CASE
                    WHEN WEEK("MAT_AVAILDATE") < 10 THEN CONCAT( YEAR("MAT_AVAILDATE"), CONCAT( '0', WEEK("MAT_AVAILDATE") ) )
                    ELSE CONCAT( YEAR("MAT_AVAILDATE"), WEEK("MAT_AVAILDATE") )
                END = B.WEEK_NO
            AND A.LOCATION_ID = B.LOCATION_ID
            AND A.PRODUCT_ID  = B.PRODUCT_ID
            WHERE A.LOCATION_ID = '` + adata.LOCATION_ID + `'
              AND A.PRODUCT_ID = '` + adata.PRODUCT_ID + `'
              AND B.WEEK_DATE < '` + vCurrDate + `'
            GROUP BY 
                A.LOCATION_ID,
                A.PRODUCT_ID,
                A.REF_PRODID,
                CASE
                    WHEN WEEK("MAT_AVAILDATE") < 10 THEN CONCAT( YEAR("MAT_AVAILDATE"), CONCAT( '0', WEEK("MAT_AVAILDATE") ) )
                    ELSE CONCAT( YEAR("MAT_AVAILDATE"), WEEK("MAT_AVAILDATE") )
                END,
                B.ORD_QTY,
                PRIMARY_ID
            ORDER BY 
                A.LOCATION_ID ASC, 
                A.REF_PRODID ASC, 
                WEEK_NO ASC,
                PRIMARY_ID ASC`
        );



        let liPriCharCount = [];
        let lsPriCharCount = {};
        for (let i = 0; i < liPrimaryCount.length; i++) {
            for (let cntPI = 0; cntPI < liPrimaryID.length; cntPI++) {
                if (liPrimaryID[cntPI].UNIQUE_ID === liPrimaryCount[i].PRIMARY_ID) {
                    lsPriCharCount = {};
                    lsPriCharCount['WEEK_NO'] = GenF.parse(liPrimaryCount[i].WEEK_NO);
                    lsPriCharCount['CHAR_NUM'] = GenF.parse(liPrimaryID[cntPI].CHAR_NUM);
                    // lsPriCharCount['CHARVAL_NUM'] = GenF.parse(liPrimaryID[cntPI].CHARVAL_NUM);
                    lsPriCharCount['CHAR_VALUE'] = GenF.parse(liPrimaryID[cntPI].CHAR_VALUE);
                    lsPriCharCount['ORD_QTY'] = parseInt(liPrimaryCount[i].ORD_QTY);

                    for (let cntPIC = 0; cntPIC < liPriCharCount.length; cntPIC++) {
                        if (liPriCharCount[cntPIC].WEEK_NO === lsPriCharCount['WEEK_NO'] &&
                            liPriCharCount[cntPIC].CHAR_NUM === lsPriCharCount['CHAR_NUM'] &&
                            liPriCharCount[cntPIC].CHAR_VALUE === lsPriCharCount['CHAR_VALUE']) {
                            // liPriCharCount[cntPIC].CHARVAL_NUM === lsPriCharCount['CHARVAL_NUM']) {
                            liPriCharCount[cntPIC].ORD_QTY = parseInt(liPriCharCount[cntPIC].ORD_QTY) + parseInt(lsPriCharCount['ORD_QTY']);
                            lsPriCharCount['ORD_QTY'] = 0;
                        }
                    }

                    if (lsPriCharCount['ORD_QTY'] !== 0) {
                        liPriCharCount.push(lsPriCharCount);
                    }
                }
            }
        }

        let liVCHistory = [];
        let lsVCHistory = {};
        let lRow = 0;
        if (liPrimaryCount.length > 0) {
            for (let i = 0; i < liPrimaryCount.length; i++) {

                lsVCHistory = {};

                lsVCHistory['PERIOD_NUM'] = GenF.parse(liPrimaryCount[i].WEEK_NO);
                lsVCHistory['LOCATION_ID'] = GenF.parse(adata.LOCATION_ID);
                lsVCHistory['PRODUCT_ID'] = GenF.parse(liPrimaryCount[i].PRODUCT_ID);
                lsVCHistory['TYPE'] = 'PI';

                lsVCHistory['GROUP_ID'] = GenF.parse(String(liPrimaryCount[i].PRIMARY_ID) + '_1');
                lsVCHistory['GROUP_COUNT'] = parseInt(liPrimaryCount[i].ORD_QTY);
                lsVCHistory['GROUP_COUNT_RATE'] = ((parseInt(liPrimaryCount[i].ORD_QTY) / parseInt(liPrimaryCount[i].TARGET_QTY)) * 100).toFixed(2);

                lRow = 0;
                for (let cntPI = 0; cntPI < liPrimaryID.length; cntPI++) {
                    if (liPrimaryID[cntPI].UNIQUE_ID === liPrimaryCount[i].PRIMARY_ID) {
                        lRow = parseInt(lRow) + 1;
                        lsVCHistory['ROW'] = GenF.parse(lRow);
                        lsVCHistory['CHAR_NUM'] = GenF.parse(liPrimaryID[cntPI]['CHAR_NUM']);
                        lsVCHistory['ATTRIBUTE'] = GenF.parse('att' + lRow);

                        for (let cntPIC = 0; cntPIC < liPriCharCount.length; cntPIC++) {
                            if (liPriCharCount[cntPIC].WEEK_NO === lsVCHistory['PERIOD_NUM'] &&
                                liPriCharCount[cntPIC].CHAR_NUM === liPrimaryID[cntPI]['CHAR_NUM'] &&
                                liPriCharCount[cntPIC].CHAR_VALUE === liPrimaryID[cntPI]['CHAR_VALUE']) {
                                // liPriCharCount[cntPIC].CHARVAL_NUM === liPrimaryID[cntPI]['CHARVAL_NUM']) {
                                lsVCHistory['CHAR_COUNT'] = parseInt(liPriCharCount[cntPIC].ORD_QTY);
                                break;
                            }
                        }

                        lsVCHistory['CHAR_COUNT_RATE'] = ((parseInt(lsVCHistory['CHAR_COUNT']) / parseInt(liPrimaryCount[i].TARGET_QTY)) * 100).toFixed(2);
                        liVCHistory.push(GenF.parse(lsVCHistory));

                    }
                }

                if (i === GenF.addOne(i, liPrimaryCount.length) || liPrimaryCount[i].WEEK_NO !== liPrimaryCount[GenF.addOne(i, liPrimaryCount.length)].WEEK_NO) {
                    if (liVCHistory.length > 0) {
                        try {
                            await DELETE.from('CP_VC_HISTORY_TS')
                                .where(`LOCATION_ID = '${adata.LOCATION_ID}' 
                        AND PRODUCT_ID = '${liPrimaryCount[i].PRODUCT_ID}'
                        AND PERIOD_NUM = '${liPrimaryCount[i].WEEK_NO}'
                        AND TYPE       = 'PI'`)
                        }
                        catch (e) {
                            console.log(e);
                            oReturn.bError = true;
                            oReturn.message = 'Time Series History Failed';
                        }
                        try {
                            await INSERT(liVCHistory).into('CP_VC_HISTORY_TS');
                            FlagTest = 'S';
                            // await cds.run(INSERT.into("CP_VC_HISTORY_TS").entries(liVCHistory));
                        }
                        catch (er) {
                            FlagTest = 'E';
                            oReturn.bError = true;
                            oReturn.message = 'Time Series History Failed';
                            GenF.log("VCHistory error: " + er.message);
                            console.log(er);
                        }
                        liVCHistory = [];

                    }
                }


            }

        }
        else {
            FlagTest = 'W'
        }
        await GenF.logMessage(req, `Completed history timeseries`);


        if (FlagTest === 'S') {
            oReturn.bError = false;
            oReturn.message = 'Timeseries History generation is complete';
            // await GenF.jobSchMessage('X', "Timeseries History generation is complete", req);
        }
        else if (FlagTest === 'E') {
            oReturn.bError = true;
            oReturn.message = 'Timeseries History generation failed';
            // await GenF.jobSchMessage('', "Timeseries History generation failed", req);
        }
        else if (FlagTest === 'W') {
            let vWarmsg = "No Data to generate Timeseries History for  : " + adata.PRODUCT_ID;
            oReturn.bError = false;
            oReturn.message = vWarmsg;
        }
        else {
            const vMsg = "Timeseries generation for the product: " + adata.PRODUCT_ID + " is unsuccessful because of insufficient data";
            oReturn.bError = true;
            oReturn.message = vMsg;
            // await GenF.jobSchMessage('X', vMsg, req);
        }
        return oReturn;
    }
    async genTimeseriesF(adata, req, Flag) {

        let lFlag = '';

        let liPrimaryID = [];
        let lsPrimaryID = {};
        let aFilPrimaryID = [], aFilSalesH = [];
        let bProcessPriId = false, bValPriId = false;
        // await GenF.logMessage(req, `Started future timeseries`);
        var oReturn = {
            bError: false,
            message: ''
        }
        /** Get Future Plan */
        const liFutureCharPlan = await cds.run(
            `SELECT *
            FROM "CP_IBP_FCHARPLAN"
            WHERE "LOCATION_ID" = '` + adata.LOCATION_ID + `'
            AND "PRODUCT_ID" = '` + adata.PRODUCT_ID + `'
            AND "VERSION" = '` + adata.VERSION + `'
            AND "SCENARIO" = '` + adata.SCENARIO + `'
            ORDER BY LOCATION_ID, 
                    PRODUCT_ID, 
                    VERSION,
                    SCENARIO,
                    WEEK_DATE`
        );

        // Delete previous data less than current Date
        var vDate = new Date().toISOString().split('T')[0];
        await DELETE.from('CP_TS_OBJDEP_CHARHDR_F')
            .where(`LOCATION_ID = '${adata.LOCATION_ID}' 
                            AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                            AND VERSION = '${adata.VERSION}'
                            AND SCENARIO = '${adata.SCENARIO}'
                            AND CAL_DATE < '${vDate}'`);

        await DELETE.from('CP_TS_OBJDEP_CHARHDR_F')
            .where(`LOCATION_ID = '${adata.LOCATION_ID}' 
                            AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                            AND VERSION = '${adata.VERSION}'
                            AND SCENARIO = '${adata.SCENARIO}'
                            AND OBJ_TYPE = 'PI'`);

        // Get Planning Relevant Primary Ids
        const liPRPIDs_PIDs = await cds.run(`SELECT DISTINCT LOCATION_ID,
                                                            PRODUCT_ID,
                                                            PRPID,
                                                            PID
                                                    FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS
                                                    WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                      AND PRODUCT_ID  = '${adata.PRODUCT_ID}'
                                                      AND PID NOT IN (SELECT DISTINCT PRP_PID FROM CP_PRPIDS WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                                                                                AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                                                                                                AND PRP_PID_TYPE IN (1,2,4)	)`);

        // Begin of VP-1091 Changes
        let bProcess = true;
        bProcess = await this.refreshZeroDemandData(adata, bProcess);


        if (bProcess === false) {
            Flag = 'W';
        } else {
            // End Of VP-1091 Changes  

            let lMainProduct = '';
            let lsMainProduct = await SELECT.one
                .from('CP_PARTIALPROD_INTRO')
                .columns('REF_PRODID')
                .where(`PRODUCT_ID = '${adata.PRODUCT_ID}' AND LOCATION_ID = '${adata.LOCATION_ID}'`);

            if (lsMainProduct === null || lsMainProduct == undefined) {
                lMainProduct = GenF.parse(adata.PRODUCT_ID);
            }
            else {
                lMainProduct = lsMainProduct.REF_PRODID;
            }
            console.log("Main prod:" + lMainProduct);
            // Get Sales Count Information
            // const liPrimaryIDMain = await SELECT.from('V_UNIQUE_ID')
            //     .columns(["UNIQUE_ID",
            //         "PRODUCT_ID",
            //         "LOCATION_ID",
            //         "UNIQUE_DESC",
            //         "UID_TYPE",
            //         "ACTIVE",
            //         "CHAR_NUM",
            //         "CHARVAL_NUM"])
            //     .where(
            //         {
            //             xpr: [
            //                 { ref: ["LOCATION_ID"] }, '=', { val: adata.LOCATION_ID }, 'and',
            //                 { ref: ["PRODUCT_ID"] }, '=', { val: lMainProduct }, 'and',
            //                 { ref: ["UID_TYPE"] }, '=', { val: 'P' }
            //             ]
            //         }

            //     ).
            //     orderBy("UNIQUE_ID", "CHAR_NUM");

            const liPrimaryIDMain = await cds.run(`SELECT 
                                                    "UNIQUE_ID",
                                                    "PRODUCT_ID",
                                                    "UNIQUE_DESC",
                                                    "UID_TYPE",
                                                    "ACTIVE",
                                                    "CHAR_NUM",
                                                    "CHARVAL_NUM",
                                                    "CHAR_VALUE"
                                                FROM V_UNIQUE_ID
                                                WHERE (unique_id IN (SELECT DISTINCT PRIMARY_ID
                                                        FROM CP_SALES_HM
                                                        WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                            AND PRODUCT_ID = '${adata.PRODUCT_ID}'))
                                                    AND PRODUCT_ID = '${lMainProduct}'
                                                    AND "UID_TYPE" = 'P'
                                                    AND "ACTIVE" = true                                                    
                                                ORDER BY    
                                                    "UNIQUE_ID" ASC, 
                                                    "CHAR_NUM" ASC;`);

            // Get Valid Primary Ids from Current Date 
            const liPrimaryId = await cds.run(`SELECT * 
                                             FROM CP_UNIQUE_ID_HEADER
                                            WHERE PRODUCT_ID = '${lMainProduct}'
                                              AND UID_TYPE = 'P'`);
            //   AND VALID_TO >= '${vDate}'`);




            // Remove Partial Characteristics
            const lipartialchar = await cds.run(
                `SELECT *
                    FROM "V_PARTIALPRODCHAR"
                    WHERE "LOCATION_ID" = '` + adata.LOCATION_ID + `'
                    AND "PRODUCT_ID" = '` + adata.PRODUCT_ID + `'
                    AND CONFIGPROD_CHK IS NULL`
                // AND CONFIGPROD_CHK <> 'X'`
                // OR "REF_PRODID" = '` + lMainProduct + `' )`
            );

            // Get Sales History Data to avoid considering primary ids with validity dates in future
            let liSalesH = await cds.run(`SELECT *
                                         FROM "V_SALES_H"
                                        WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                                          AND "PRODUCT_ID" = '${adata.PRODUCT_ID}'
                                          AND "MAT_AVAILDATE" < '${vDate}'`);

            // Validity Dates Check
            let liUniqPrimaryIds = await cds.run(`SELECT DISTINCT CP_UNIQUEID_RULE_VALIDITY.UNIQUE_ID,
                                                              CP_UNIQUEID_RULE_VALIDITY.VALID_FROM,
                                                              CP_UNIQUEID_RULE_VALIDITY.VALID_TO,
                                                              CP_SALES_HM.PRIMARY_ID
                                                FROM CP_UNIQUEID_RULE_VALIDITY
                                                INNER JOIN CP_SALES_HM
                                                  ON CP_SALES_HM.UNIQUE_ID = CP_UNIQUEID_RULE_VALIDITY.UNIQUE_ID
                                               WHERE CP_SALES_HM.LOCATION_ID = '${adata.LOCATION_ID}'
                                                 AND CP_SALES_HM.PRODUCT_ID = '${adata.PRODUCT_ID}'
                                                 AND CP_UNIQUEID_RULE_VALIDITY.VALID_TO >= '${vDate}'`);

            for (let i = 0; i < liPrimaryIDMain.length; i++) {
                // Code to check if history exists for current primary id
                if (i === 0 || liPrimaryIDMain[i].UNIQUE_ID !== liPrimaryIDMain[GenF.subOne(i, liPrimaryIDMain.length)].UNIQUE_ID) {
                    aFilSalesH = [];
                    bValPriId = false;
                    // Filter Valid Primary Ids in history
                    aFilSalesH = liSalesH.filter(function (aSalesH) {
                        return aSalesH.PRIMARY_ID === liPrimaryIDMain[i].UNIQUE_ID;
                    });
                    // Verify Validity of the Primary Id to be processed
                    if (aFilSalesH.length > 0) {
                        bValPriId = true;
                    }
                }
                // If no history exists for current primary id, continue with next iteration
                if (bValPriId === false) {
                    continue;
                }
                lFlag = '';
                for (let j = 0; j < lipartialchar.length; j++) {
                    if (lipartialchar[j].CHAR_NUM === liPrimaryIDMain[i].CHAR_NUM &&
                        lipartialchar[j].CHAR_VALUE === liPrimaryIDMain[i].CHAR_VALUE) {
                        lFlag = 'X';
                        break;
                    }
                }
                if (lFlag !== 'X') {
                    lsPrimaryID.UNIQUE_ID = GenF.parse(liPrimaryIDMain[i].UNIQUE_ID);
                    lsPrimaryID.PRODUCT_ID = GenF.parse(liPrimaryIDMain[i].PRODUCT_ID);
                    lsPrimaryID.LOCATION_ID = GenF.parse(adata.LOCATION_ID);
                    lsPrimaryID.UNIQUE_DESC = GenF.parse(liPrimaryIDMain[i].UNIQUE_DESC);
                    lsPrimaryID.UID_TYPE = GenF.parse(liPrimaryIDMain[i].UID_TYPE);
                    lsPrimaryID.ACTIVE = GenF.parse(liPrimaryIDMain[i].ACTIVE);
                    lsPrimaryID.CHAR_NUM = GenF.parse(liPrimaryIDMain[i].CHAR_NUM);
                    lsPrimaryID.CHAR_VALUE = GenF.parse(liPrimaryIDMain[i].CHAR_VALUE);
                    liPrimaryID.push(GenF.parse(lsPrimaryID));
                    lsPrimaryID = {};
                }
            }

            console.log("Primary ID:" + liPrimaryID.length);
            let liObjdepF = [];
            let lsFutureDemand = {};
            if (liFutureCharPlan.length > 0) {
                for (let cntFC = 0; cntFC < liFutureCharPlan.length; cntFC++) {

                    if (liFutureCharPlan[cntFC].LOCATION_ID !== liFutureCharPlan[GenF.subOne(cntFC, liFutureCharPlan.length)].LOCATION_ID ||
                        liFutureCharPlan[cntFC].PRODUCT_ID !== liFutureCharPlan[GenF.subOne(cntFC, liFutureCharPlan.length)].PRODUCT_ID ||
                        liFutureCharPlan[cntFC].VERSION !== liFutureCharPlan[GenF.subOne(cntFC, liFutureCharPlan.length)].VERSION ||
                        liFutureCharPlan[cntFC].SCENARIO !== liFutureCharPlan[GenF.subOne(cntFC, liFutureCharPlan.length)].SCENARIO ||
                        liFutureCharPlan[cntFC].WEEK_DATE !== liFutureCharPlan[GenF.subOne(cntFC, liFutureCharPlan.length)].WEEK_DATE ||
                        cntFC === 0) {
                        lsFutureDemand = await SELECT.one
                            .from('CP_IBP_FUTUREDEMAND')
                            .where(`LOCATION_ID = '${liFutureCharPlan[cntFC].LOCATION_ID}'
                                                AND PRODUCT_ID = '${liFutureCharPlan[cntFC].PRODUCT_ID}'
                                                AND VERSION = '${liFutureCharPlan[cntFC].VERSION}'
                                                AND SCENARIO = '${liFutureCharPlan[cntFC].SCENARIO}'
                                                AND WEEK_DATE = '${liFutureCharPlan[cntFC].WEEK_DATE}'`);

                        liObjdepF = [];
                    }

                    let lRowID = 0;
                    for (let cntPI = 0; cntPI < liPrimaryID.length; cntPI++) {
                        if (liPrimaryID[cntPI].UNIQUE_ID !== liPrimaryID[GenF.subOne(cntPI, liPrimaryID.length)].UNIQUE_ID ||
                            // liPrimaryID[cntPI].LOCATION_ID !== liPrimaryID[GenF.subOne(cntPI, liPrimaryID.length)].LOCATION_ID ||
                            liPrimaryID[cntPI].PRODUCT_ID !== liPrimaryID[GenF.subOne(cntPI, liPrimaryID.length)].PRODUCT_ID ||
                            cntPI === 0
                        ) {
                            aFilPrimaryID = [];
                            bProcessPriId = false;                     // Validity Dates

                            // Do not Uncomment    - Start
                            // // Filter Valid Primary Ids for current week date
                            // aFilPrimaryID = liPrimaryId.filter(function (aPID) {
                            //     return aPID.UNIQUE_ID === liPrimaryID[cntPI].UNIQUE_ID;
                            // });
                            // // Verify Validity of the Primary Id for Current Week Date
                            // if (aFilPrimaryID.length > 0) {
                            //     if (aFilPrimaryID[0].VALID_FROM <= liFutureCharPlan[cntFC].WEEK_DATE &&
                            //         aFilPrimaryID[0].VALID_TO >= liFutureCharPlan[cntFC].WEEK_DATE) {
                            //         bProcessPriId = true;
                            //     }
                            // }

                            // Do not Uncomment    - End

                            //// Validity Dates  - Start
                            let liUniqIds = [], aFilUniqPri = [], aFilUniqPrimaryIds = [];

                            // Filter Valid Primary Ids for current week date
                            aFilUniqPri = liSalesH.filter(function (aPID) {
                                return aPID.PRIMARY_ID === liPrimaryID[cntPI].UNIQUE_ID;
                            });

                            if (aFilUniqPri.length > 0) {
                                const keys = ['UNIQUE_ID'];
                                aFilUniqPri.sort(GenF.dynamicSortMultiple("UNIQUE_ID"));
                                aFilUniqPri = GenF.removeDuplicate(aFilUniqPri, keys);

                                // // Do not Uncomment below select
                                //     // liUniqIds = await cds.run(`SELECT DISTINCT UNIQUE_ID
                                //     //                                FROM CP_UNIQUEID_RULE_VALIDITY
                                //     //                              WHERE UNIQUE_ID IN (SELECT DISTINCT UNIQUE_ID
                                //     //                                                     FROM CP_SALES_HM
                                //     //                                                     WHERE PRIMARY_ID = '${liPrimaryID[cntPI].UNIQUE_ID}'
                                //     //                                                       AND LOCATION_ID = '${adata.LOCATION_ID}'
                                //     //                                                       AND PRODUCT_ID = '${adata.PRODUCT_ID}')
                                //     //                                AND VALID_FROM <= '${liFutureCharPlan[cntFC].WEEK_DATE}'
                                //     //                                AND VALID_TO >= '${liFutureCharPlan[cntFC].WEEK_DATE}'`);

                                aFilUniqPrimaryIds = liUniqPrimaryIds.filter(function (aPID) {
                                    return aPID.PRIMARY_ID === liPrimaryID[cntPI].UNIQUE_ID
                                        && aPID.VALID_FROM <= liFutureCharPlan[cntFC].WEEK_DATE
                                        && aPID.VALID_TO >= liFutureCharPlan[cntFC].WEEK_DATE;
                                });

                                if (aFilUniqPrimaryIds.length !== aFilUniqPri.length) {
                                    bProcessPriId = true;
                                }
                            }

                            // Validity Dates  - End 

                            lRowID = 0;
                        }
                        // Validity Dates 
                        // If Primary Id is invalid continue with next iteration 
                        if (bProcessPriId === false) {
                            continue;
                        }
                        lRowID = parseInt(lRowID) + 1;

                        if (liPrimaryID[cntPI].CHAR_NUM === liFutureCharPlan[cntFC].CHAR_NUM &&
                            liPrimaryID[cntPI].CHAR_VALUE === liFutureCharPlan[cntFC].CHARVAL_NUM) {
                            let lsObjdepF = {}
                            lsObjdepF.CAL_DATE = GenF.parse(liFutureCharPlan[cntFC].WEEK_DATE);
                            lsObjdepF.LOCATION_ID = GenF.parse(liFutureCharPlan[cntFC].LOCATION_ID);
                            lsObjdepF.PRODUCT_ID = GenF.parse(liFutureCharPlan[cntFC].PRODUCT_ID);
                            lsObjdepF.VERSION = GenF.parse(liFutureCharPlan[cntFC].VERSION);
                            lsObjdepF.SCENARIO = GenF.parse(liFutureCharPlan[cntFC].SCENARIO);
                            lsObjdepF.OBJ_TYPE = "PI";
                            lsObjdepF.OBJ_DEP = GenF.parse(String(liPrimaryID[cntPI].UNIQUE_ID));
                            lsObjdepF.OBJ_COUNTER = 1;
                            lsObjdepF.ROW_ID = GenF.parse(lRowID);
                            lsObjdepF.CHAR_NUM = GenF.parse(liFutureCharPlan[cntFC].CHAR_NUM);
                            lsObjdepF.SUCCESS = parseFloat(liFutureCharPlan[cntFC].OPT_QTY);

                            lsObjdepF.SUCCESS_RATE = 0
                            if (lsFutureDemand) {
                                if (lsFutureDemand.QUANTITY > 0) {
                                    lsObjdepF.SUCCESS_RATE = (parseFloat(liFutureCharPlan[cntFC].OPT_QTY) * 100 / parseInt(lsFutureDemand.QUANTITY)).toFixed(2);
                                    liObjdepF.push(GenF.parse(lsObjdepF));
                                    // if(lsObjdepF.SUCCESS_RATE === 100){
                                    //     if(lRowID > 0){
                                    //         lRowID = parseInt(lRowID) - 1;
                                    //     }
                                    // } else {
                                    //     liObjdepF.push(GenF.parse(lsObjdepF));
                                    // }
                                }
                            }
                            // liObjdepF.push(GenF.parse(lsObjdepF));
                        }
                    }

                    if (liFutureCharPlan[cntFC].LOCATION_ID !== liFutureCharPlan[GenF.addOne(cntFC, liFutureCharPlan.length)].LOCATION_ID ||
                        liFutureCharPlan[cntFC].PRODUCT_ID !== liFutureCharPlan[GenF.addOne(cntFC, liFutureCharPlan.length)].PRODUCT_ID ||
                        liFutureCharPlan[cntFC].VERSION !== liFutureCharPlan[GenF.addOne(cntFC, liFutureCharPlan.length)].VERSION ||
                        liFutureCharPlan[cntFC].SCENARIO !== liFutureCharPlan[GenF.addOne(cntFC, liFutureCharPlan.length)].SCENARIO ||
                        liFutureCharPlan[cntFC].WEEK_DATE !== liFutureCharPlan[GenF.addOne(cntFC, liFutureCharPlan.length)].WEEK_DATE ||
                        cntFC === GenF.addOne(cntFC, liFutureCharPlan.length)) {
                        if (liObjdepF.length > 0) {
                            if (liPRPIDs_PIDs.length > 0) {
                                liObjdepF = await this.processTSFPRPIDs(adata, liObjdepF, liPRPIDs_PIDs, liFutureCharPlan[cntFC].WEEK_DATE, lsFutureDemand);
                            }
                            console.log("CP_TS_OBJDEP_CHARHDR_F: " + liObjdepF.length);
                            try {
                                await INSERT(liObjdepF).into('CP_TS_OBJDEP_CHARHDR_F');
                                Flag = 'S';
                            }
                            catch (e) {
                                Flag = 'E';
                                console.log("error", e.message);
                            }
                        }
                    }
                }
            }
            else {
                Flag = 'W';
            }
        }

        await GenF.logMessage(req, `Completed future timeseries`);
        if (Flag === 'S') {
            oReturn.bError = false;
            oReturn.message = "Timeseries Future generation is complete";
            // await GenF.jobSchMessage('X', `Timeseries Future generation is complete`, req);
        }
        else if (Flag === 'E') {
            oReturn.bError = true;
            oReturn.message = "Timeseries Future generation failed";
            // await GenF.jobSchMessage('', `Timeseries Future generation failed`, req);
        }
        else if (Flag === 'W') {
            let vWarmsg = "No Data to generate Timeseries Future for  : " + adata.PRODUCT_ID;
            oReturn.bError = false;
            oReturn.message = vWarmsg;
        }
        else {
            const vMsg = "Timeseries generation for the product: " + adata.PRODUCT_ID + " is unsuccessful because of insufficient data";
            oReturn.bError = true;
            oReturn.message = vMsg;
            // await GenF.jobSchMessage('X', vMsg, req);
        }
        return oReturn;
    }

    async genPrediction(adata, req, Flag) {

        // await GenF.logMessage(req, `Started Fully Configured Requirement Generation`);

        let lDate = new Date();
        lDate.setDate(lDate.getDate());
        lDate = lDate.toISOString().split('T')[0];

        let telescoppicDate = await cds.run(`SELECT * from CP_IBPCALENDER_WEEK 
                                                    where WEEK_STARTDATE <= '${lDate}' 
                                                    and WEEK_ENDDATE >= '${lDate}'
                                                    and LEVEL = 'W'`);
        lDate = telescoppicDate.length > 0 ? new Date(telescoppicDate[0].WEEK_STARTDATE) : new Date(lDate);


        // const lCurrDate = GenF.getCurrentDate();
        const lCurrDate = lDate.toISOString().split('T')[0];
        var oReturn = {
            bError: false,
            message: ''
        }
        // Get Start date considering Firm Horizon        
        const lStartDate = new Date(
            lDate.getFullYear(),
            lDate.getMonth(),
            lDate.getDate() + (parseInt(await GenF.getParameterValue(adata.LOCATION_ID, 9)) * 7)
        );

        // Get Predictions        
        let liPrediction = [];
        // liPrediction = await SELECT.from('CP_TS_PREDICTIONS')
        //     .where(`CAL_DATE    > '${lStartDate.toISOString().split("T")[0]}'
        //         AND LOCATION_ID    = '${adata.LOCATION_ID}' 
        //         AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
        //         AND VERSION        = '${adata.VERSION}'                           
        //         AND SCENARIO       = '${adata.SCENARIO}'                          
        //         AND MODEL_VERSION  = '${adata.MODEL_VERSION}'                    
        //         AND OBJ_TYPE    = 'PI'`)
        //     .orderBy(`OBJ_DEP`);

        // Get Predictions Data for only Delta Weeks
        liPrediction = await SELECT.from('CP_TS_PREDICTIONS')
            .where(`CAL_DATE    IN (SELECT DISTINCT WEEK_DATE
                                      FROM CP_FORECAST_DELTA_WEEKS
                                      WHERE LOCATION_ID    = '${adata.LOCATION_ID}' 
                                        AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
                                        AND VERSION        = '${adata.VERSION}'                           
                                        AND SCENARIO       = '${adata.SCENARIO}'                          
                                        AND MODEL_VERSION  = '${adata.MODEL_VERSION}')
                AND LOCATION_ID    = '${adata.LOCATION_ID}' 
                AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
                AND VERSION        = '${adata.VERSION}'                           
                AND SCENARIO       = '${adata.SCENARIO}'                          
                AND MODEL_VERSION  = '${adata.MODEL_VERSION}'                  
                AND OBJ_TYPE    = 'PI'`)
            .orderBy(`OBJ_DEP`);

        GenF.log(`Start Date ${lStartDate.toISOString().split("T")[0]}`);

        // Remove records that are before current date .
        await cds.run(
            `DELETE FROM CP_CIR_GENERATED
                      WHERE LOCATION_ID    = '${adata.LOCATION_ID}'
                        AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
                        AND VERSION        = '${adata.VERSION}'                             
                        AND SCENARIO       = '${adata.SCENARIO}'                            
                        AND MODEL_VERSION  = '${adata.MODEL_VERSION}'                     
                        AND ( WEEK_DATE  < '${lDate.toISOString().split("T")[0]}')`);


        // VP-1377 - Handle Assembly Requirements Generation for Non-Configurable Products
        let aProducts = [], aFutureDemand = [];
        let liCir = [];
        let lCirId = 0;
        aProducts = await cds.run(`SELECT * FROM CP_PRODUCT 
                                    WHERE PRODUCT_ID = '${adata.PRODUCT_ID}'
                                    AND NON_CONFIGURABLE = 'X'`);

        if (liPrediction.length === 0 && aProducts.length > 0) {

            // Remove records that are before current date and afer firm horizon.
            await cds.run(
                `DELETE FROM CP_CIR_GENERATED
                        WHERE LOCATION_ID    = '${adata.LOCATION_ID}'
                            AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
                            AND VERSION        = '${adata.VERSION}'                             
                            AND SCENARIO       = '${adata.SCENARIO}'                            
                            AND MODEL_VERSION  = '${adata.MODEL_VERSION}'                     
                            AND ( WEEK_DATE  < '${lDate.toISOString().split("T")[0]}'
                            OR    WEEK_DATE  > '${lStartDate.toISOString().split("T")[0]}')`);

            aFutureDemand = await cds.run(`SELECT * 
                                                FROM CP_IBP_FUTUREDEMAND
                                               WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                 AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                                 AND VERSION = '${adata.VERSION}'
                                                 AND SCENARIO = '${adata.SCENARIO}'`);

            for (let iFutD = 0; iFutD < aFutureDemand.length; iFutD++) {
                let lsCir = {};
                lCirId = parseInt(lCirId) + 1;
                lsCir['LOCATION_ID'] = GenF.parse(adata.LOCATION_ID);             
                lsCir['PRODUCT_ID'] = GenF.parse(adata.PRODUCT_ID);
                lsCir['WEEK_DATE'] = GenF.parse(aFutureDemand[iFutD]['WEEK_DATE']);
                lsCir['CIR_ID'] = GenF.parse(lCirId);
                lsCir['MODEL_VERSION'] = GenF.parse(adata.MODEL_VERSION);
                lsCir['VERSION'] = GenF.parse(aFutureDemand[iFutD]['VERSION']);
                lsCir['SCENARIO'] = GenF.parse(aFutureDemand[iFutD]['SCENARIO']);
                lsCir['CIR_QTY'] = GenF.parse(aFutureDemand[iFutD]['QUANTITY']);
                lsCir['UNIQUE_ID'] = 0;
                lsCir['ACTUAL_QTY'] = 0;
                lsCir['UNCONSUMED_FORECAST'] = 0;
                lsCir['PRODORD_QTY'] = 0;
                lsCir['OPEN_ASSEMBLY'] = 0;
                lsCir['SNAPSHOT_CHK'] = 'X';

                liCir.push(GenF.parse(lsCir));

            }
            if (liCir.length > 0) {
                await INSERT(liCir).into('CP_CIR_GENERATED');
                Flag = 'X';
            }
            else {
                Flag = 'W';
            }
            liCir = [];


        } else {

            // Normalize prediction
            // If Prediction for a week is less than the demand, 
            // a factor is determined on how much to be multiplied for prediction to get to the demand
            const liNormalize = await cds.run(`SELECT   A."VERSION",
                                                    A."SCENARIO",
                                                    A."WEEK_DATE",
                                                    B."MODEL_VERSION",
                                                    CASE
                                                    WHEN SUM(B.PREDICTED) > 0 THEN
                                                    A.QUANTITY/SUM(B.PREDICTED)
                                                    ELSE
                                                    1
                                                    END AS FACTOR
                                                FROM 
                                                    "CP_IBP_FUTUREDEMAND" AS A
                                                    INNER JOIN
                                                    CP_TS_PREDICTIONS AS B
                                                    ON A.LOCATION_ID = B.LOCATION_ID
                                                        AND A.PRODUCT_ID = B.PRODUCT_ID
                                                        AND A.VERSION = B.VERSION
                                                        AND A.SCENARIO = B.SCENARIO
                                                        AND A.WEEK_DATE = B.CAL_DATE
                                                WHERE A.LOCATION_ID = '${adata.LOCATION_ID}'
                                                  AND A.PRODUCT_ID  = '${adata.PRODUCT_ID}'
                                                  AND A.VERSION     = '${adata.VERSION}'            
                                                  AND A.SCENARIO    = '${adata.SCENARIO}'           
                                                  AND B.MODEL_VERSION  = '${adata.MODEL_VERSION}'   
                                                  AND B.CAL_DATE IN (SELECT DISTINCT WEEK_DATE
                                                                        FROM CP_FORECAST_DELTA_WEEKS
                                                                        WHERE LOCATION_ID    = '${adata.LOCATION_ID}' 
                                                                            AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
                                                                            AND VERSION        = '${adata.VERSION}'                           
                                                                            AND SCENARIO       = '${adata.SCENARIO}'                          
                                                                            AND MODEL_VERSION  = '${adata.MODEL_VERSION}')
                                                GROUP BY 
                                                    A."VERSION",
                                                    A."SCENARIO",
                                                    A."WEEK_DATE",
                                                    A."QUANTITY",
                                                    B."MODEL_VERSION"
                                                ORDER BY WEEK_DATE ASC`);

            for (let cntPre = 0; cntPre < liPrediction.length; cntPre++) {
                // Remove records for delta weeks.
                await cds.run(
                    `DELETE FROM CP_CIR_GENERATED
                        WHERE LOCATION_ID      = '${adata.LOCATION_ID}'
                            AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
                            AND VERSION        = '${adata.VERSION}'                             
                            AND SCENARIO       = '${adata.SCENARIO}'                            
                            AND MODEL_VERSION  = '${adata.MODEL_VERSION}'                     
                            AND WEEK_DATE  = '${liPrediction[cntPre].CAL_DATE}'`);

                for (let cntNor = 0; cntNor < liNormalize.length; cntNor++) {
                    if (liPrediction[cntPre].VERSION === liNormalize[cntNor].VERSION &&
                        liPrediction[cntPre].SCENARIO === liNormalize[cntNor].SCENARIO &&
                        liPrediction[cntPre].CAL_DATE === liNormalize[cntNor].WEEK_DATE &&
                        liPrediction[cntPre].MODEL_VERSION === liNormalize[cntNor].MODEL_VERSION) {
                        // let lConverted = Math.round(liPrediction[cntPre].PREDICTED) * liNormalize[cntNor].FACTOR;
                        let beforeRound = liPrediction[cntPre].PREDICTED * liNormalize[cntNor].FACTOR;
                        liPrediction[cntPre].PREDICTED = GenF.parse(beforeRound);
                        // let lConverted = Math.round(beforeRound);                        
                        // liPrediction[cntPre].PREDICTED = GenF.parse(lConverted);
                        break;
                    }
                }
            }


            let liPriQty = [];
            liPriQty = await cds.run(
                `SELECT PRIMARY_ID,
                    SUM(ORD_QTY) AS ORD_QTY
                FROM "V_SALES_H"
                WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                AND PRODUCT_ID    = '${adata.PRODUCT_ID}'  
                AND MAT_AVAILDATE <= '${lCurrDate}'              
                group by PRIMARY_ID
                order by PRIMARY_ID`
            );



            let liUniQty = [];
            liUniQty = await cds.run(
                `SELECT UNIQUE_ID,
                        PRIMARY_ID,
                        SUM(ORD_QTY) AS ORD_QTY
                FROM V_SALES_H  
                WHERE LOCATION_ID  = '${adata.LOCATION_ID}'
                AND PRODUCT_ID     = '${adata.PRODUCT_ID}'    
                AND MAT_AVAILDATE <= '${lCurrDate}'            
                group by UNIQUE_ID, PRIMARY_ID
                order by PRIMARY_ID, UNIQUE_ID`
            );


            // // Remove records that are before current date and afer firm horizon.
            // await cds.run(
            //     `DELETE FROM CP_CIR_GENERATED
            //       WHERE LOCATION_ID    = '${adata.LOCATION_ID}'
            //         AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
            //         AND VERSION        = '${adata.VERSION}'                             
            //         AND SCENARIO       = '${adata.SCENARIO}'                            
            //         AND MODEL_VERSION  = '${adata.MODEL_VERSION}'                     
            //         AND ( WEEK_DATE  < '${lDate.toISOString().split("T")[0]}'
            //          OR    WEEK_DATE  > '${lStartDate.toISOString().split("T")[0]}')`);
            // await DELETE.from('CP_CIR_GENERATED')
            //     .where(`LOCATION_ID         = '${adata.LOCATION_ID}'
            //                  AND PRODUCT_ID = '${adata.PRODUCT_ID}'
            //                  AND VERSION     = '${adata.VERSION}'                             
            //                  AND SCENARIO    = '${adata.SCENARIO}'                            
            //                  AND MODEL_VERSION  = '${adata.MODEL_VERSION}'                     
            //                  AND ( WEEK_DATE  < '${lDate.toISOString().split("T")[0]}'
            //                  OR    WEEK_DATE  > '${lStartDate.toISOString().split("T")[0]}' )`);

            // let liCir = [];
            let liCirDiff = [];

            let lCir = 0;
            let lPIQty = 0, lPIQtyHead = 0;
            let liUIDVal = [], liValUIDQty = [];

            // VP-1251 - Delta Processing
            // Fetch Maximum Number of CIR_ID       
            let iMaxCIRID = 0;
            iMaxCIRID = await cds.run(
                `SELECT MAX(CIR_ID) AS MAX_CIR_ID FROM "CP_CIR_GENERATED"`
            );
            if (iMaxCIRID && iMaxCIRID[0].MAX_CIR_ID > 0) {
                lCir = iMaxCIRID[0].MAX_CIR_ID;
            }
            for (let cntUID = 0; cntUID < liUniQty.length; cntUID++) {

                lPIQty = 0;
                lPIQtyHead = 0;
                for (let cntPI = 0; cntPI < liPriQty.length; cntPI++) {
                    if (liPriQty[cntPI].PRIMARY_ID === liUniQty[cntUID].PRIMARY_ID) {
                        // lPIQtyHead = GenF.parse(liPriQty[cntPI].ORD_QTY);    // Validity Dates - Uncomment
                        lPIQty = GenF.parse(liPriQty[cntPI].ORD_QTY);           // Validity Dates - Comment 
                        break;
                    }
                }
                liUIDVal = [], liValUIDQty = [];
                for (let cntP = 0; cntP < liPrediction.length; cntP++) {


                    if (parseInt(liPrediction[cntP].OBJ_DEP) === liUniQty[cntUID].PRIMARY_ID) {
                        let lsCir = {};
                        let lsCirDiff = {};
                        lCir = parseInt(lCir) + 1;
                        lsCir['LOCATION_ID'] = GenF.parse(adata.LOCATION_ID);
                        lsCir['PRODUCT_ID'] = GenF.parse(adata.PRODUCT_ID);
                        lsCir['WEEK_DATE'] = GenF.parse(liPrediction[cntP]['CAL_DATE']);
                        lsCir['CIR_ID'] = GenF.parse(lCir);
                        lsCir['MODEL_VERSION'] = GenF.parse(liPrediction[cntP]['MODEL_VERSION']);
                        lsCir['VERSION'] = GenF.parse(liPrediction[cntP]['VERSION']);
                        lsCir['SCENARIO'] = GenF.parse(liPrediction[cntP]['SCENARIO']);
                        lsCir['UNIQUE_ID'] = GenF.parse(liUniQty[cntUID].UNIQUE_ID);
                        lsCir['ACTUAL_QTY'] = 0;
                        lsCir['UNCONSUMED_FORECAST'] = 0;
                        lsCir['PRODORD_QTY'] = 0;
                        lsCir['OPEN_ASSEMBLY'] = 0;
                        lsCir['SNAPSHOT_CHK'] = 'X';
                        if (lPIQty > 0) {
                            lsCir['CIR_QTY'] = GenF.parse(parseInt(liUniQty[cntUID].ORD_QTY * liPrediction[cntP].PREDICTED / lPIQty));

                            // Store the fractions in quantity
                            lsCirDiff = GenF.parse(lsCir);
                            lsCirDiff['CIR_QTY_DIFF'] = GenF.parse(liUniQty[cntUID].ORD_QTY * liPrediction[cntP].PREDICTED / lPIQty) - lsCir['CIR_QTY'];
                            liCirDiff.push(lsCirDiff);
                        }
                        liCir.push(lsCir);
                    }
                }
                if (liCir.length > 0) {
                    await INSERT(liCir).into('CP_CIR_GENERATED');
                    Flag = 'X';
                }
                else {
                    if (Flag === '') {
                        Flag = 'W';
                    }
                }
                liCir = [];
            }

            //Rounding the output
            let liRound = await cds.run(`SELECT 
                                    C."LOCATION_ID",
                                    C."PRODUCT_ID",
                                    C."WEEK_DATE",
                                    C."MODEL_VERSION",
                                    C."VERSION",
                                    C."SCENARIO",
                                    SUM(C."CIR_QTY") AS CIR_QTY,
                                    I.QUANTITY,
                                    (I.QUANTITY - SUM(C."CIR_QTY")) AS DIFF
                               FROM CP_IBP_FUTUREDEMAND AS I
                         INNER JOIN CP_CIR_GENERATED AS C
                                 ON C.LOCATION_ID = I.LOCATION_ID
                                AND C.PRODUCT_ID = I.PRODUCT_ID
                                AND C.WEEK_DATE = I.WEEK_DATE
                                AND C.VERSION = I.VERSION
                                AND C.SCENARIO = I.SCENARIO
                              WHERE C.LOCATION_ID = '${adata.LOCATION_ID}'
                                AND C.PRODUCT_ID = '${adata.PRODUCT_ID}'
                                AND C.VERSION     = '${adata.VERSION}'                
                                AND C.SCENARIO    = '${adata.SCENARIO}'               
                                AND C.MODEL_VERSION  = '${adata.MODEL_VERSION}' 
                                AND C.WEEK_DATE IN (SELECT DISTINCT WEEK_DATE
                                                FROM CP_FORECAST_DELTA_WEEKS
                                                WHERE LOCATION_ID    = '${adata.LOCATION_ID}' 
                                                    AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
                                                    AND VERSION        = '${adata.VERSION}'                           
                                                    AND SCENARIO       = '${adata.SCENARIO}'                          
                                                    AND MODEL_VERSION  = '${adata.MODEL_VERSION}')        
                           GROUP BY C."LOCATION_ID",
                                    C."PRODUCT_ID",
                                    C."WEEK_DATE",
                                    C."MODEL_VERSION",
                                    C."VERSION",
                                    C."SCENARIO",
                                    I.QUANTITY	
                           ORDER BY "LOCATION_ID" ASC, 
                                    "PRODUCT_ID" ASC, 
                                    "WEEK_DATE" ASC, 
                                    "MODEL_VERSION" ASC, 
                                    "VERSION" ASC, 
                                    "SCENARIO" ASC;`);

            let iCount = 0;
            if (liRound.length > 0) {
                for (let cntR = 0; cntR < liRound.length; cntR++) {

                    console.log(`Week ${liRound[cntR].WEEK_DATE} Demand ${liRound[cntR].DIFF}`)
                    if (liRound[cntR].DIFF > 0) {
                        liCirDiff.sort(GenF.dynamicSortMultiple("LOCATION_ID", "PRODUCT_ID", "WEEK_DATE", "CIR_QTY_DIFF DESC"));

                        // Rounding Logic Updated  - Start (2024-11-27)
                        iCount = 0;
                        let lNextMonday = GenF.parse(liRound[cntR].WEEK_DATE);

                        do {
                            lNextMonday = GenF.getNextMondayCmpForCIR(lNextMonday);
                            iCount = iCount + 1;
                            for (let cntD = 0; cntD < liCirDiff.length; cntD++) {
                                if (
                                    liRound[cntR].LOCATION_ID === liCirDiff[cntD].LOCATION_ID &&
                                    liRound[cntR].PRODUCT_ID === liCirDiff[cntD].PRODUCT_ID &&
                                    liRound[cntR].WEEK_DATE === liCirDiff[cntD].WEEK_DATE &&
                                    liRound[cntR].MODEL_VERSION === liCirDiff[cntD].MODEL_VERSION &&
                                    liRound[cntR].VERSION === liCirDiff[cntD].VERSION &&
                                    liRound[cntR].SCENARIO === liCirDiff[cntD].SCENARIO
                                ) {
                                    GenF.log(`Next Monday ${lNextMonday}`);
                                    GenF.log(`Unique Id: ${liCirDiff[cntD].UNIQUE_ID}`);

                                    for (let cntDN = 0; cntDN < liCirDiff.length; cntDN++) {
                                        if (
                                            liCirDiff[cntDN].LOCATION_ID === liCirDiff[cntD].LOCATION_ID &&
                                            liCirDiff[cntDN].PRODUCT_ID === liCirDiff[cntD].PRODUCT_ID &&
                                            liCirDiff[cntDN].WEEK_DATE === lNextMonday &&
                                            liCirDiff[cntDN].MODEL_VERSION === liCirDiff[cntD].MODEL_VERSION &&
                                            liCirDiff[cntDN].VERSION === liCirDiff[cntD].VERSION &&
                                            liCirDiff[cntDN].SCENARIO === liCirDiff[cntD].SCENARIO &&
                                            liCirDiff[cntDN].UNIQUE_ID === liCirDiff[cntD].UNIQUE_ID
                                        ) {
                                            let lDiffTot = liCirDiff[cntD].CIR_QTY_DIFF + liCirDiff[cntDN].CIR_QTY_DIFF;

                                            GenF.log(`Next Monday ${lNextMonday}`);
                                            GenF.log(`CIR Differnce ${lDiffTot}`);
                                            GenF.log(`liCirDiff[cntD].CIR_QTY_DIFF`);

                                            if (liRound[cntR].DIFF > 0) {

                                                if (lDiffTot >= 1) {
                                                    liCirDiff[cntD].CIR_QTY_DIFF = GenF.parse(lDiffTot - 1);
                                                    liRound[cntR].DIFF = liRound[cntR].DIFF - 1;

                                                    await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = CIR_QTY + 1
                                                                 WHERE LOCATION_ID = '${liCirDiff[cntD].LOCATION_ID}'
                                                                 AND PRODUCT_ID = '${liCirDiff[cntD].PRODUCT_ID}'
                                                                 AND WEEK_DATE = '${liCirDiff[cntD].WEEK_DATE}'
                                                                 AND CIR_ID = '${liCirDiff[cntD].CIR_ID}'
                                                                 AND MODEL_VERSION = '${liCirDiff[cntD].MODEL_VERSION}'
                                                                 AND VERSION = '${liCirDiff[cntD].VERSION}'
                                                                 AND SCENARIO = '${liCirDiff[cntD].SCENARIO}'`);

                                                    GenF.log(`Rounding Value:  ${liRound[cntR].DIFF}, Unique Id: ${liCirDiff[cntD].UNIQUE_ID}`);
                                                } else {
                                                    liCirDiff[cntD].CIR_QTY_DIFF = GenF.parse(lDiffTot);
                                                }
                                                liCirDiff[cntDN].CIR_QTY_DIFF = GenF.parse(0);
                                            } else {
                                                liCirDiff[cntD].CIR_QTY_DIFF = lDiffTot;
                                            }
                                            break;
                                        }
                                    }

                                } else {
                                    if (liCirDiff[cntD].WEEK_DATE > liRound[cntR].WEEK_DATE) {
                                        break;
                                    }
                                }
                            }
                        } while (iCount <= 4)
                        // Rounding Logic - End


                        for (let cntD = 0; cntD < liCirDiff.length; cntD++) {
                            if (
                                liRound[cntR].LOCATION_ID === liCirDiff[cntD].LOCATION_ID &&
                                liRound[cntR].PRODUCT_ID === liCirDiff[cntD].PRODUCT_ID &&
                                liRound[cntR].WEEK_DATE === liCirDiff[cntD].WEEK_DATE &&
                                liRound[cntR].MODEL_VERSION === liCirDiff[cntD].MODEL_VERSION &&
                                liRound[cntR].VERSION === liCirDiff[cntD].VERSION &&
                                liRound[cntR].SCENARIO === liCirDiff[cntD].SCENARIO
                            ) {


                                let lNextMonday = GenF.getNextMondayCmpForCIR(liCirDiff[cntD].WEEK_DATE);
                                for (let cntDN = 0; cntDN < liCirDiff.length; cntDN++) {
                                    if (
                                        liCirDiff[cntDN].LOCATION_ID === liCirDiff[cntD].LOCATION_ID &&
                                        liCirDiff[cntDN].PRODUCT_ID === liCirDiff[cntD].PRODUCT_ID &&
                                        liCirDiff[cntDN].WEEK_DATE === lNextMonday &&
                                        liCirDiff[cntDN].MODEL_VERSION === liCirDiff[cntD].MODEL_VERSION &&
                                        liCirDiff[cntDN].VERSION === liCirDiff[cntD].VERSION &&
                                        liCirDiff[cntDN].SCENARIO === liCirDiff[cntD].SCENARIO &&
                                        liCirDiff[cntDN].UNIQUE_ID === liCirDiff[cntD].UNIQUE_ID
                                    ) {
                                        let lDiffTot = liCirDiff[cntD].CIR_QTY_DIFF + liCirDiff[cntDN].CIR_QTY_DIFF;
                                        liCirDiff[cntDN].CIR_QTY_DIFF = GenF.parse(lDiffTot);
                                        liCirDiff[cntD].CIR_QTY_DIFF = GenF.parse(0);

                                        // if (liRound[cntR].DIFF > 0) {

                                        //     if (lDiffTot >= 1) {
                                        //         liCirDiff[cntDN].CIR_QTY_DIFF = GenF.parse(lDiffTot - 1);
                                        //         liRound[cntR].DIFF = liRound[cntR].DIFF - 1;

                                        //         await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = CIR_QTY + 1
                                        //                         WHERE LOCATION_ID = '${liCirDiff[cntD].LOCATION_ID}'
                                        //                         AND PRODUCT_ID = '${liCirDiff[cntD].PRODUCT_ID}'
                                        //                         AND WEEK_DATE = '${liCirDiff[cntD].WEEK_DATE}'
                                        //                         AND CIR_ID = '${liCirDiff[cntD].CIR_ID}'
                                        //                         AND MODEL_VERSION = '${liCirDiff[cntD].MODEL_VERSION}'
                                        //                         AND VERSION = '${liCirDiff[cntD].VERSION}'
                                        //                         AND SCENARIO = '${liCirDiff[cntD].SCENARIO}'`);
                                        //     } else {
                                        //         liCirDiff[cntDN].CIR_QTY_DIFF = GenF.parse(lDiffTot);
                                        //     }
                                        //     liCirDiff[cntD].CIR_QTY_DIFF = GenF.parse(0);
                                        // } else {
                                        //     liCirDiff[cntDN].CIR_QTY_DIFF = lDiffTot;
                                        // }
                                        break;

                                    }
                                }
                            } else {
                                if (liCirDiff[cntD].WEEK_DATE > liRound[cntR].WEEK_DATE) {
                                    break;
                                }
                            }
                        }


                        let liCirTemp = await cds.run(`SELECT "LOCATION_ID",
                                                    "PRODUCT_ID",
                                                    "WEEK_DATE",
                                                    "CIR_ID",
                                                    "MODEL_VERSION",
                                                    "VERSION",
                                                    "SCENARIO",
                                                    "UNIQUE_ID",
                                                    "CIR_QTY"
                                                FROM CP_CIR_GENERATED
                                                WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                                                AND "PRODUCT_ID" = '${adata.PRODUCT_ID}'
                                                    AND "WEEK_DATE" = '${liRound[cntR].WEEK_DATE}'
                                                AND "MODEL_VERSION" = '${liRound[cntR].MODEL_VERSION}'
                                                AND "VERSION" = '${liRound[cntR].VERSION}'
                                                AND "SCENARIO" = '${liRound[cntR].SCENARIO}'
                                                ORDER BY CIR_QTY DESC`);
                        while (liRound[cntR].DIFF > 0) {
                            let lsCirLeast = {};
                            lsCirLeast['DIFF'] = 0;
                            let lProcessFurther = '';

                            let liOptDiff = await cds.run(`SELECT TOP 1
                                                        V_UNIQUE_ID.UNIQUE_ID,
                                                        SUM(DIFF_QTY)
                                                    FROM V_UNIQUE_ID
                                              INNER JOIN V_CIR_QTY_VAR
                                                 ON V_UNIQUE_ID.CHAR_NUM = V_CIR_QTY_VAR.CHAR_NUM
                                                AND V_UNIQUE_ID.CHAR_VALUE = V_CIR_QTY_VAR.CHAR_VALUE
                                              WHERE V_CIR_QTY_VAR.LOCATION_ID = '${adata.LOCATION_ID}'
                                                AND V_CIR_QTY_VAR.PRODUCT_ID = '${adata.PRODUCT_ID}'
                                                AND V_CIR_QTY_VAr.WEEK_DATE = '${liRound[cntR].WEEK_DATE}'
                                                AND V_CIR_QTY_VAR.MODEL_VERSION = '${liRound[cntR].MODEL_VERSION}'
                                                AND V_CIR_QTY_VAR.VERSION = '${liRound[cntR].VERSION}'                                                        
                                                AND V_CIR_QTY_VAR.SCENARIO = '${liRound[cntR].SCENARIO}'
                                                AND V_UNIQUE_ID.UNIQUE_ID IN (SELECT DISTINCT "UNIQUE_ID"
                                               FROM CP_CIR_GENERATED
                                               WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                                                 AND "PRODUCT_ID" = '${adata.PRODUCT_ID}'
                                                 AND "WEEK_DATE" = '${liRound[cntR].WEEK_DATE}'
                                                 AND "MODEL_VERSION" = '${liRound[cntR].MODEL_VERSION}'
                                                 AND "VERSION" = '${liRound[cntR].VERSION}'
                                                 AND "SCENARIO" = '${liRound[cntR].SCENARIO}')
                                                 AND V_UNIQUE_ID.UID_TYPE   = 'U'
                                            GROUP BY V_UNIQUE_ID.UNIQUE_ID 
                                            ORDER BY SUM(DIFF_QTY);`);
                            lProcessFurther = '';
                            if (liOptDiff.length > 0) {
                                for (let cntCt = 0; cntCt < liCirTemp.length; cntCt++) {
                                    if (liCirTemp[cntCt].UNIQUE_ID === liOptDiff[0].UNIQUE_ID) {
                                        await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = CIR_QTY + 1
                                            WHERE LOCATION_ID = '${liCirTemp[cntCt].LOCATION_ID}'
                                              AND PRODUCT_ID = '${liCirTemp[cntCt].PRODUCT_ID}'
                                              AND WEEK_DATE = '${liCirTemp[cntCt].WEEK_DATE}'
                                              AND CIR_ID = '${liCirTemp[cntCt].CIR_ID}'
                                              AND MODEL_VERSION = '${liCirTemp[cntCt].MODEL_VERSION}'
                                              AND VERSION = '${liCirTemp[cntCt].VERSION}'
                                              AND SCENARIO = '${liCirTemp[cntCt].SCENARIO}'`);

                                        liRound[cntR].DIFF = liRound[cntR].DIFF - 1;
                                        Flag = 'X';
                                        lProcessFurther = 'X';
                                        break;
                                    }
                                }
                            }

                            if (lProcessFurther === '') {
                                break;
                            }

                            /*
                             for (let cntCt = 0; cntCt < liCirTemp.length; cntCt++) {
                                 await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = CIR_QTY + 1
                                                 WHERE LOCATION_ID = '${liCirTemp[cntCt].LOCATION_ID}'
                                                 AND PRODUCT_ID = '${liCirTemp[cntCt].PRODUCT_ID}'
                                                 AND WEEK_DATE = '${liCirTemp[cntCt].WEEK_DATE}'
                                                 AND CIR_ID = '${liCirTemp[cntCt].CIR_ID}'
                                                 AND MODEL_VERSION = '${liCirTemp[cntCt].MODEL_VERSION}'
                                                 AND VERSION = '${liCirTemp[cntCt].VERSION}'
                                                 AND SCENARIO = '${liCirTemp[cntCt].SCENARIO}'`);
         
                                 let lDiff = await cds.run(`SELECT SUM("DIFF_QTY") as DIFF
                                                 FROM "V_CIR_QTY_VAR"
                                             WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                 AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                                 AND WEEK_DATE = '${liRound[cntR].WEEK_DATE}'
                                                 AND MODEL_VERSION = '${liRound[cntR].MODEL_VERSION}'
                                                 AND VERSION = '${liRound[cntR].VERSION}'
                                                 AND SCENARIO = '${liRound[cntR].SCENARIO}';`);
         
                                 if (lsCirLeast['DIFF'] === 0 || lsCirLeast['DIFF'] > lDiff[0].DIFF) {
                                     lsCirLeast = GenF.parse(liCirTemp[cntCt]);
                                     lsCirLeast['DIFF'] = lDiff[0].DIFF;
                                 }
         
                                 await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = CIR_QTY - 1
                                                 WHERE LOCATION_ID = '${liCirTemp[cntCt].LOCATION_ID}'
                                                 AND PRODUCT_ID = '${liCirTemp[cntCt].PRODUCT_ID}'
                                                 AND WEEK_DATE = '${liCirTemp[cntCt].WEEK_DATE}'
                                                 AND CIR_ID = '${liCirTemp[cntCt].CIR_ID}'
                                                 AND MODEL_VERSION = '${liCirTemp[cntCt].MODEL_VERSION}'
                                                 AND VERSION = '${liCirTemp[cntCt].VERSION}'
                                                 AND SCENARIO = '${liCirTemp[cntCt].SCENARIO}'`);
                             }
         
         
                             await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = CIR_QTY + 1
                                             WHERE LOCATION_ID = '${lsCirLeast.LOCATION_ID}'
                                             AND PRODUCT_ID = '${lsCirLeast.PRODUCT_ID}'
                                             AND WEEK_DATE = '${lsCirLeast.WEEK_DATE}'
                                             AND CIR_ID = '${lsCirLeast.CIR_ID}'
                                             AND MODEL_VERSION = '${lsCirLeast.MODEL_VERSION}'
                                             AND VERSION = '${lsCirLeast.VERSION}'
                                             AND SCENARIO = '${lsCirLeast.SCENARIO}'`);
                             liRound[cntR].DIFF = liRound[cntR].DIFF - 1;
                             Flag = 'X';
                             */
                        }


                    }

                }
            }
            else {
                Flag = 'W';
            }
        }
        /*
// Add the difference to most highest CIR in the week
        const liCIRRound = await cds.run(`SELECT "LOCATION_ID",
                                                  "PRODUCT_ID",
                                                  "WEEK_DATE",
                                                  "CIR_ID",
                                                  "MODEL_VERSION",
                                                  "VERSION",
                                                  "SCENARIO",
                                                  "UNIQUE_ID",
                                                  "CIR_QTY"
                                            FROM "CP_CIR_GENERATED"
                                            WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                            ORDER BY 
                                                "LOCATION_ID" ASC, 
                                                "PRODUCT_ID" ASC, 
                                                "WEEK_DATE" ASC, 
                                                "MODEL_VERSION" ASC, 
                                                "VERSION" ASC, 
                                                "SCENARIO" ASC, 
                                                "CIR_QTY" DESC;`);



        for (let cntCR = 0; cntCR < liCIRRound.length; cntCR++) {
            for (let cntR = 0; cntR < liRound.length; cntR++) {
                if (liRound[cntR].LOCATION_ID === liCIRRound[cntCR].LOCATION_ID &&
                    liRound[cntR].PRODUCT_ID === liCIRRound[cntCR].PRODUCT_ID &&
                    liRound[cntR].WEEK_DATE === liCIRRound[cntCR].WEEK_DATE &&
                    liRound[cntR].MODEL_VERSION === liCIRRound[cntCR].MODEL_VERSION &&
                    liRound[cntR].VERSION === liCIRRound[cntCR].VERSION &&
                    liRound[cntR].SCENARIO === liCIRRound[cntCR].SCENARIO &&
                    liRound[cntR].DIFF > 0) {
                    // await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = CIR_QTY + ${parseInt(liRound[cntR].DIFF)}
                    //           WHERE LOCATION_ID = '${liCIRRound[cntCR].LOCATION_ID}'
                    //           AND PRODUCT_ID = '${liCIRRound[cntCR].PRODUCT_ID}'
                    //           AND WEEK_DATE = '${liCIRRound[cntCR].WEEK_DATE}'
                    //           AND CIR_ID = '${liCIRRound[cntCR].CIR_ID}'
                    //           AND MODEL_VERSION = '${liCIRRound[cntCR].MODEL_VERSION}'
                    //           AND VERSION = '${liCIRRound[cntCR].VERSION}'
                    //           AND SCENARIO = '${liCIRRound[cntCR].SCENARIO}'`);
                    liRound[cntR].DIFF = GenF.parse(0);
                }
            }
        }
*/
        // await GenF.logMessage(req, `Completed Forecast Demand Generation`);
        // // Flag = 'X';
        if (Flag === 'X') {
            // await GenF.jobSchMessage(Flag, "Forecast Demand Generation is complete", req);
            oReturn.bError = false;
            // oReturn.message  = "Forecast Demand Generation is complete";
            oReturn.message = "Forecast Demand Generation Complete for: " + adata.PRODUCT_ID;

            // await GenF.logMessage(req, "Forecast Demand Generation Complete for: " + adata.PRODUCT_ID);
        }
        else if (Flag === 'W') {
            oReturn.bError = false;
            // oReturn.message  = "Forecast Demand Generation is complete";
            oReturn.message = "No data to generate Forecast Demand for: " + adata.PRODUCT_ID;
        }
        else {
            // await GenF.jobSchMessage(Flag, "Forecast Demand Generation is failed", req);
            oReturn.bError = true;
            // oReturn.message  = "Forecast Demand Generation has failed";
            oReturn.message = "Forecast Demand Generation Failed for: " + adata.PRODUCT_ID;
            // await GenF.logMessage(req, "Forecast Demand Generation Failed for: " + adata.PRODUCT_ID);
        }
        return oReturn;
    }

    // Function for Consumption of Forecast Order, nearest to the Sales Order Config
    async consumptionOfFOC(aData, req) {
        let iCIRQty = 0, iCIRDataQty = 0;
        let aFilCIRData = [];
        let aFilNegCIRData = [];
        let aFilPosCIRData = [];
        let oCIRData = {};
        let oResCIR = {};
        let aResCIR = [];
        let oUsedQty = {};
        let aUsedQty = [];
        let aFilUsedQty = [];
        let bFlag = false;
        let iReqQty = 0;
        let iIndex = -1;                    // Index of an array starts from 0
        let liClusterResults = [];
        let iMaxCIRID = 0;
        let bConsume_Flg = false;
        let aNonConsumedIds = [];
        await GenF.logMessage(req, `Started Consumption of Forecast Order`);

        const lDate = new Date();

        // Get Start date considering after Firm Horizon        
        const lStartDate = new Date(
            lDate.getFullYear(),
            lDate.getMonth(),
            lDate.getDate() + (parseInt(await GenF.getParameterValue(aData.LOCATION_ID, 9)) * 7) + 1
        );

        // Get End date considering Forecast Order Horizon        
        const lEndDate = new Date(
            lDate.getFullYear(),
            lDate.getMonth(),
            lDate.getDate() + (parseInt(await GenF.getParameterValue(aData.LOCATION_ID, 2)) * 7)
        );

        // Get Data from CIR Table
        let liCIRData = await cds.run(`SELECT *
                                            FROM "CP_CIR_GENERATED"
                                            WHERE "LOCATION_ID" = '${aData.LOCATION_ID}'
                                              AND "PRODUCT_ID"  = '${aData.PRODUCT_ID}'
                                              AND "VERSION"     = '${aData.VERSION}'          
                                              AND "SCENARIO"    = '${aData.SCENARIO}'         
                                              AND "MODEL_VERSION"  = '${aData.MODEL_VERSION}'                      
                                              AND ("WEEK_DATE" >= '${lStartDate.toISOString().split("T")[0]}'
                                              AND  "WEEK_DATE" < '${lEndDate.toISOString().split("T")[0]}')`);



        // Get Data from Sales History
        const liSalesH = await cds.run(
            `SELECT * FROM V_SALESORDER_FUTURE
                WHERE LOCATION_ID = '${aData.LOCATION_ID}'
                  AND PRODUCT_ID = '${aData.PRODUCT_ID}'
                  AND WEEK_DATE > '${lDate.toISOString().split("T")[0]}'`
        );


        // // 
        // for (let vSOIndex = 0; vSOIndex < liSalesH.length; vSOIndex++) {
        //     bFlag = false;            

        //     // Loop through CIR Data and deduct Salesh Qty from CIR Qty.
        //     // -- If remaining cir qty is -ve or unique id does not exists, push cir data to negative values array
        //     // -- If remaining cir qty is +ve, push cir data to postive values array             

        //     for (let vCIRIndx = 0; vCIRIndx < liCIRData.length; vCIRIndx++) {
        //         if (liSalesH[vSOIndex].UNIQUE_ID === liCIRData[vCIRIndx].UNIQUE_ID &&
        //             liSalesH[vSOIndex].WEEK_DATE === liCIRData[vCIRIndx].WEEK_DATE) {
        //             bFlag = true;
        //             liCIRData[vCIRIndx].CIR_QTY = liCIRData[vCIRIndx].CIR_QTY - liSalesH[vSOIndex].ORD_QTY;
        //             if (liCIRData[vCIRIndx].CIR_QTY < 0) {
        //                 aFilNegCIRData.push(liCIRData[vCIRIndx]);
        //             } else if (liCIRData[vCIRIndx].CIR_QTY > 0) {
        //                 aFilPosCIRData.push(liCIRData[vCIRIndx]);
        //             }
        //             break;
        //         } 
        //     }
        //     if (bFlag === false) {     // New Unique Id Config
        //         oCIRData = {};
        //         oCIRData.LOCATION_ID = liSalesH[vSOIndex].LOCATION_ID;
        //         oCIRData.PRODUCT_ID = liSalesH[vSOIndex].PRODUCT_ID
        //         oCIRData.UNIQUE_ID = liSalesH[vSOIndex].UNIQUE_ID;
        //         oCIRData.WEEK_DATE = liSalesH[vSOIndex].WEEK_DATE;
        //         oCIRData.CIR_ID = 0;
        //         oCIRData.MODEL_VERSION = liCIRData[0].MODEL_VERSION;
        //         oCIRData.VERSION = liCIRData[0].VERSION;
        //         oCIRData.SCENARIO = liCIRData[0].SCENARIO;
        //         oCIRData.CIR_QTY = iCIRQty - liSalesH[vSOIndex].ORD_QTY;

        //         aFilNegCIRData.push(oCIRData);
        //     }
        // }
        if (liCIRData.length > 0) {
            for (let vCIRIndx = 0; vCIRIndx < liCIRData.length; vCIRIndx++) {

                for (let vSOIndex = 0; vSOIndex < liSalesH.length; vSOIndex++) {
                    if (liSalesH[vSOIndex].UNIQUE_ID === liCIRData[vCIRIndx].UNIQUE_ID &&
                        liSalesH[vSOIndex].WEEK_DATE === liCIRData[vCIRIndx].WEEK_DATE) {
                        liCIRData[vCIRIndx].CIR_QTY = liCIRData[vCIRIndx].CIR_QTY - liSalesH[vSOIndex].ORD_QTY;
                        // if (liCIRData[vCIRIndx].CIR_QTY < 0) {
                        //     aFilNegCIRData.push(liCIRData[vCIRIndx]);
                        // } else if (liCIRData[vCIRIndx].CIR_QTY > 0) {
                        //     aFilPosCIRData.push(liCIRData[vCIRIndx]);
                        // }
                        liSalesH[vSOIndex].ORD_QTY = 0;
                    }
                }

                if (liCIRData[vCIRIndx].CIR_QTY < 0) {
                    aFilNegCIRData.push(liCIRData[vCIRIndx]);
                } else if (liCIRData[vCIRIndx].CIR_QTY > 0) {
                    aFilPosCIRData.push(liCIRData[vCIRIndx]);
                }
            }

            for (let vSOIndex = 0; vSOIndex < liSalesH.length; vSOIndex++) {
                if (liSalesH[vSOIndex].ORD_QTY > 0) {
                    oCIRData = {};
                    oCIRData.LOCATION_ID = liSalesH[vSOIndex].LOCATION_ID;
                    oCIRData.PRODUCT_ID = liSalesH[vSOIndex].PRODUCT_ID
                    oCIRData.UNIQUE_ID = liSalesH[vSOIndex].UNIQUE_ID;
                    oCIRData.WEEK_DATE = liSalesH[vSOIndex].WEEK_DATE;
                    oCIRData.CIR_ID = 0;
                    oCIRData.MODEL_VERSION = liCIRData[0].MODEL_VERSION;
                    oCIRData.VERSION = liCIRData[0].VERSION;
                    oCIRData.SCENARIO = liCIRData[0].SCENARIO;
                    oCIRData.CIR_QTY = iCIRQty - liSalesH[vSOIndex].ORD_QTY;

                    aFilNegCIRData.push(oCIRData);
                }

            }
        } else {
            console.log("Forecast Demand Generation is Incomplete for Consumption!")
        }


        if (aFilNegCIRData.length > 0) {
            // Loop through CIR Data with Negative Quantities
            for (let vCIRInd = 0; vCIRInd < aFilNegCIRData.length; vCIRInd++) {
                liClusterResults = [];
                aFilCIRData = [];
                iCIRQty = 0;
                iCIRDataQty = 0;
                iReqQty = Math.abs(aFilNegCIRData[vCIRInd].CIR_QTY);
                bConsume_Flg = false;

                // Get Nearest Unique Ids based on Cluster Results
                // liClusterResults = await this.getClusterResults(req, aFilNegCIRData[vCIRInd]);
                liClusterResults = await cds.run(`SELECT TOP 20
                                                        UNIQUE_ID AS NEAREST_ID,
                                                        COUNT(*) AS total
                                                    FROM CP_UNIQUE_ID_ITEM
                    WHERE (
                   (UNIQUE_ID IN (SELECT DISTINCT UNIQUE_ID
                                    FROM V_SALES_H
                                    WHERE LOCATION_ID = '${aFilNegCIRData[vCIRInd].LOCATION_ID}'
                                      AND PRODUCT_ID = '${aFilNegCIRData[vCIRInd].PRODUCT_ID}'))
                          AND ((CHAR_NUM, CHAR_VALUE) IN (SELECT DISTINCT
                                                                    CHAR_NUM,
                                                                    CHAR_VALUE
                                                                FROM CP_UNIQUE_ID_ITEM
                                                               WHERE UNIQUE_ID = '${aFilNegCIRData[vCIRInd].UNIQUE_ID}'
                                                                 AND PRODUCT_ID = '${aFilNegCIRData[vCIRInd].PRODUCT_ID}'))
                          AND UNIQUE_ID <> '${aFilNegCIRData[vCIRInd].UNIQUE_ID}')
                GROUP BY UNIQUE_ID
                ORDER BY COUNT(*) DESC`);

                for (let j = 0; j < liClusterResults.length; j++) {
                    oUsedQty = {};
                    aFilCIRData = [];
                    aFilUsedQty = [];
                    iCIRQty = 0;
                    iCIRDataQty = 0;
                    iIndex = -1;
                    // bConsume_Flg = false;
                    if (iReqQty > 0) {
                        // Filter CIRData with Positive Quantities 
                        if (aFilPosCIRData.length > 0) {
                            aFilCIRData = aFilPosCIRData.filter(function (aCIRData) {
                                return aCIRData.UNIQUE_ID === parseInt(liClusterResults[j].NEAREST_ID) &&
                                    aCIRData.WEEK_DATE === aFilNegCIRData[vCIRInd].WEEK_DATE;
                            });
                        }

                        if (aFilCIRData.length > 0) {
                            // Filter / Check for Consumed Unique Id Qty
                            aFilUsedQty = aUsedQty.filter(function (aUsedUniqueQty) {
                                return aUsedUniqueQty.UNIQUE_ID === parseInt(liClusterResults[j].NEAREST_ID) &&
                                    aUsedUniqueQty.WEEK_DATE === aFilNegCIRData[vCIRInd].WEEK_DATE;
                            });


                            iCIRDataQty = aFilCIRData[0].CIR_QTY;
                            if (aFilUsedQty.length > 0) {
                                if (aFilUsedQty[0].CIR_QTY > 0) {
                                    // Check for additional Qty. from Partially Consumed UID qty.   
                                    iCIRDataQty = iCIRDataQty - aFilUsedQty[0].CIR_QTY;
                                }
                            }

                            // Logic to deduct required qty from nearest UID qty 
                            if (iCIRDataQty > 0) {
                                if (iReqQty >= iCIRDataQty) {
                                    iCIRQty = iCIRDataQty;            // To be updated into CP_CIR_GENERATED table for UID
                                    iReqQty = iReqQty - iCIRDataQty;  // Remaining open qty
                                } else if (iReqQty < iCIRDataQty) {
                                    iCIRQty = iReqQty;                           // To be updated into CP_CIR_GENERATED table for UID
                                    iReqQty = 0;                                //  Remaining open qty
                                }
                            } else {
                                // If there is no additional qty for current UID, then continue with next nearest id
                                continue;
                            }

                            if (iCIRQty > 0) {
                                try {
                                    // Update Deducted CIR Quantity from close Unique Id 
                                    await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = CIR_QTY - '${iCIRQty}'
                                    WHERE LOCATION_ID = '${aFilCIRData[0].LOCATION_ID}'
                                      AND PRODUCT_ID  = '${aFilCIRData[0].PRODUCT_ID}'
                                      AND WEEK_DATE   = '${aFilCIRData[0].WEEK_DATE}'
                                      AND CIR_ID      = '${aFilCIRData[0].CIR_ID}'
                                      AND MODEL_VERSION = '${aFilCIRData[0].MODEL_VERSION}'
                                      AND VERSION     = '${aFilCIRData[0].VERSION}'
                                      AND SCENARIO    = '${aFilCIRData[0].SCENARIO}'`);
                                    bConsume_Flg = true;
                                }
                                catch (e) {
                                    console.log(e);
                                }
                                // If Qty is deducted from nearest id then add qty to current UID

                                // Get the index of Array item which matchs the UNIQUE_ID
                                iIndex = aUsedQty.findIndex(item => item.UNIQUE_ID === aFilCIRData[0].UNIQUE_ID &&
                                    item.WEEK_DATE === aFilNegCIRData[vCIRInd].WEEK_DATE);
                                if (iIndex >= 0) {
                                    // Deduct CIRQty from partially consumed qty.
                                    aUsedQty[iIndex].CIR_QTY = aUsedQty[iIndex].CIR_QTY + iCIRQty;
                                } else {
                                    // If no partial consumption is done for the UID, push data to an array
                                    oUsedQty.UNIQUE_ID = aFilCIRData[0].UNIQUE_ID;
                                    oUsedQty.WEEK_DATE = aFilNegCIRData[vCIRInd].WEEK_DATE;
                                    oUsedQty.CIR_QTY = iCIRQty;
                                    aUsedQty.push(oUsedQty);
                                }
                            }
                        }
                    } else {   // If the Required Qty is fully consumed, 
                        break;
                    }
                }

                if (iReqQty > 0) {
                    // if req qty is not fully consumed from clustering results
                    // If there is no additional quantity available for nearest id, then we need to comsume from existig data
                    aFilNegCIRData[vCIRInd].REM_QTY = 0 - iReqQty;
                    aFilNegCIRData[vCIRInd].FLAG = bConsume_Flg;
                    aNonConsumedIds.push(aFilNegCIRData[vCIRInd]);
                }


                // 
                if (bConsume_Flg === true) {   // If Qty is deducted from nearest id, then add qty to current UID
                    iReqQty = Math.abs(aFilNegCIRData[vCIRInd].CIR_QTY);

                    if (aFilNegCIRData[vCIRInd].CIR_ID !== 0) {
                        try {
                            // Update Consumed CIR Quantity from close Unique Id for existing CIR_Ids
                            await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = CIR_QTY + '${iReqQty}'
                            WHERE LOCATION_ID = '${aFilNegCIRData[vCIRInd].LOCATION_ID}'
                              AND PRODUCT_ID  = '${aFilNegCIRData[vCIRInd].PRODUCT_ID}'
                              AND WEEK_DATE   = '${aFilNegCIRData[vCIRInd].WEEK_DATE}'
                              AND CIR_ID      = '${aFilNegCIRData[vCIRInd].CIR_ID}'
                              AND MODEL_VERSION = '${aFilNegCIRData[vCIRInd].MODEL_VERSION}'
                              AND VERSION     = '${aFilNegCIRData[vCIRInd].VERSION}'
                              AND SCENARIO    = '${aFilNegCIRData[vCIRInd].SCENARIO}'`);
                        }
                        catch (e) {
                            console.log(e);
                        }

                    } else {
                        // For new UID config, push data to an array. To be inserted with CIR_IDs later
                        oResCIR = {};
                        oResCIR = aFilNegCIRData[vCIRInd];
                        oResCIR.CIR_QTY = iReqQty;
                        oResCIR.SNAPSHOT_CHK = 'X';
                        aResCIR.push(oResCIR);
                    }
                } else {
                    // If there is no additional quantity available for nearest id, then we need to comsume from existig data
                    // if (iReqQty > 0) {
                    //     // if req qty is not fully consumed from clustering results
                    //     // If there is no additional quantity available for nearest id, then we need to comsume from existig data
                    //     aFilNegCIRData[vCIRInd].CIR_QTY = 0 - iReqQty;
                    // }


                    aFilNegCIRData[vCIRInd].REM_QTY = 0;
                    aFilNegCIRData[vCIRInd].FLAG = bConsume_Flg;
                    aNonConsumedIds.push(aFilNegCIRData[vCIRInd]);
                }

            }
            // Code to consume quantity from existig unique ids, if cluster results does not contain qty
            if (aNonConsumedIds.length > 0) {
                for (let vNCInd = 0; vNCInd < aNonConsumedIds.length; vNCInd++) {
                    aFilCIRData = [];
                    iCIRQty = 0;
                    iCIRDataQty = 0;
                    iReqQty = Math.abs(aNonConsumedIds[vNCInd].CIR_QTY);
                    if (aNonConsumedIds[vNCInd].REM_QTY < 0) {
                        iReqQty = Math.abs(aNonConsumedIds[vNCInd].REM_QTY);
                    }
                    bConsume_Flg = false;
                    // Filter CIRData with Positive Quantities 
                    if (aFilPosCIRData.length > 0) {
                        aFilCIRData = aFilPosCIRData.filter(function (aCIRData) {
                            return aCIRData.WEEK_DATE === aNonConsumedIds[vNCInd].WEEK_DATE;
                        });
                    }
                    if (aFilCIRData.length > 0) {

                        for (let k = 0; k < aFilCIRData.length; k++) {
                            oUsedQty = {};
                            aFilUsedQty = [];
                            iCIRQty = 0;
                            iCIRDataQty = 0;
                            iIndex = -1;
                            // bConsume_Flg = false;
                            if (iReqQty > 0) {
                                // Filter / Check for Consumed Unique Id Qty
                                aFilUsedQty = aUsedQty.filter(function (aUsedUniqueQty) {
                                    return aUsedUniqueQty.UNIQUE_ID === aFilCIRData[k].UNIQUE_ID &&
                                        aUsedUniqueQty.WEEK_DATE === aNonConsumedIds[vNCInd].WEEK_DATE;
                                });

                                iCIRDataQty = aFilCIRData[k].CIR_QTY;
                                if (aFilUsedQty.length > 0 && aFilUsedQty[0].CIR_QTY > 0) {
                                    // Check for additional Qty. from Partially Consumed UID qty.   
                                    iCIRDataQty = iCIRDataQty - aFilUsedQty[0].CIR_QTY;
                                }

                                // Logic to deduct required qty from nearest UID qty 
                                if (iCIRDataQty > 0) {
                                    if (iReqQty >= iCIRDataQty) {
                                        iCIRQty = iCIRDataQty;                        // To be updated into CP_CIR_GENERATED table for UID
                                        iReqQty = iReqQty - iCIRDataQty;             // Remaining open qty
                                    } else if (iReqQty < iCIRDataQty) {
                                        iCIRQty = iReqQty;                           // To be updated into CP_CIR_GENERATED table for UID
                                        iReqQty = 0;                                //  Remaining open qty
                                    }
                                } else {
                                    // If there is no additional qty for current UID, then continue with next UID
                                    continue;
                                }

                                if (iCIRQty > 0) {
                                    // Update Deducted CIR Quantity from close Unique Id 
                                    try {
                                        await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = CIR_QTY - '${iCIRQty}'
                                    WHERE LOCATION_ID = '${aFilCIRData[k].LOCATION_ID}'
                                      AND PRODUCT_ID  = '${aFilCIRData[k].PRODUCT_ID}'
                                      AND WEEK_DATE   = '${aFilCIRData[k].WEEK_DATE}'
                                      AND CIR_ID      = '${aFilCIRData[k].CIR_ID}'
                                      AND MODEL_VERSION = '${aFilCIRData[k].MODEL_VERSION}'
                                      AND VERSION     = '${aFilCIRData[k].VERSION}'
                                      AND SCENARIO    = '${aFilCIRData[k].SCENARIO}'`);

                                        bConsume_Flg = true;    // If Qty is deducted from nearest id then add qty to current UID
                                    }
                                    catch (e) {
                                        console.log(e);
                                    }

                                    // Get the index of Array item which matchs the UNIQUE_ID
                                    iIndex = aUsedQty.findIndex(item => item.UNIQUE_ID === aFilCIRData[k].UNIQUE_ID &&
                                        item.WEEK_DATE === aNonConsumedIds[vNCInd].WEEK_DATE);
                                    if (iIndex >= 0) {
                                        // Deduct CIRQty from partially consumed qty.
                                        aUsedQty[iIndex].CIR_QTY = aUsedQty[iIndex].CIR_QTY + iCIRQty;
                                    } else {
                                        // If no partial consumption is done for the UID, push data to an array
                                        oUsedQty.UNIQUE_ID = aFilCIRData[k].UNIQUE_ID;
                                        oUsedQty.WEEK_DATE = aNonConsumedIds[vNCInd].WEEK_DATE;
                                        oUsedQty.CIR_QTY = iCIRQty;
                                        aUsedQty.push(oUsedQty);
                                    }
                                }
                            } else {
                                // If the Required Qty is fully consumed, 
                                break;
                            }

                        }


                        if (bConsume_Flg === true && aNonConsumedIds[vNCInd].FLAG === false) {   // If Qty is deducted from nearest id, then add qty to current UID
                            iReqQty = Math.abs(aNonConsumedIds[vNCInd].CIR_QTY);

                            if (aNonConsumedIds[vNCInd].CIR_ID !== 0) {

                                // Update Consumed CIR Quantity from close Unique Id for existing CIR_Ids
                                await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = CIR_QTY + '${iReqQty}'
                                    WHERE LOCATION_ID = '${aNonConsumedIds[vNCInd].LOCATION_ID}'
                                      AND PRODUCT_ID  = '${aNonConsumedIds[vNCInd].PRODUCT_ID}'
                                      AND WEEK_DATE   = '${aNonConsumedIds[vNCInd].WEEK_DATE}'
                                      AND CIR_ID      = '${aNonConsumedIds[vNCInd].CIR_ID}'
                                      AND MODEL_VERSION = '${aNonConsumedIds[vNCInd].MODEL_VERSION}'
                                      AND VERSION     = '${aNonConsumedIds[vNCInd].VERSION}'
                                      AND SCENARIO    = '${aNonConsumedIds[vNCInd].SCENARIO}'`);

                            } else {
                                // For new UID config, push data to an array. To be inserted with CIR_IDs later
                                oResCIR = {};
                                oResCIR = aNonConsumedIds[vNCInd];
                                oResCIR.CIR_QTY = iReqQty;
                                oResCIR.SNAPSHOT_CHK = 'X';
                                aResCIR.push(oResCIR);
                            }
                        }

                    }

                }
            }


            if (aResCIR.length > 0) {
                // Fetch Maximum Number of CIR_ID
                iMaxCIRID = await cds.run(
                    `SELECT MAX(CIR_ID) AS MAX_CIR_ID FROM "CP_CIR_GENERATED"`
                );
                iMaxCIRID = iMaxCIRID[0].MAX_CIR_ID;

                // Update CIR_IDs for New Config Data
                for (let k = 0; k < aResCIR.length; k++) {
                    iMaxCIRID = iMaxCIRID + 1;
                    aResCIR[k].CIR_ID = iMaxCIRID;
                }

                // Insert New Config CIR Data
                try {
                    await cds.run({
                        INSERT:
                        {
                            into: { ref: ['CP_CIR_GENERATED'] },
                            entries: aResCIR
                        }
                    });
                    console.log("Inserted Fully Config Demand for New Config");
                }
                catch (error) {
                    console.log("Unable to insert fully config demand for new config", error)
                }

            }

        }

        await GenF.logMessage(req, `Completed Consumption of Forecast Order`);

    }
    // After generation of Forecast Orders - Forecast Delta Weeks are cleared 
    async refreshForecastDeltaWeeks(aData, req) {
        // Remove Forecast Delta Weeks
        await cds.run(`DELETE FROM "CP_FORECAST_DELTA_WEEKS" 
                                  WHERE LOCATION_ID = '${aData.LOCATION_ID}' 
                                   AND PRODUCT_ID = '${aData.PRODUCT_ID}'
                                   AND VERSION = '${aData.VERSION}'
                                   AND SCENARIO = '${aData.SCENARIO}' 
                                   AND MODEL_VERSION = '${aData.MODEL_VERSION}'`);
    }


    async consumptionOfFO(aData, req) {
        let iCIRQty = 0, iCIRDataQty = 0;
        let aFilCIRData = [];
        let aFilNegCIRData = [];
        let aFilPosCIRData = [];
        let oCIRData = {};
        let oResCIR = {};
        let aResCIR = [];
        let newoResCIR = {};
        let newaResCIR = [];
        let oUsedQty = {};
        let aUsedQty = [];
        let aFilUsedQty = [];
        let bFlag = false;
        let iReqQty = 0;
        let iIndex = -1;                    // Index of an array starts from 0
        let liClusterResults = [];
        let iMaxCIRID = 0;
        let bConsume_Flg = false;
        let aNonConsumedIds = [];
        let oReturn = {
            bError: false,
            message: ''
        };
       
        await GenF.logMessage(req, `Started Consumption of Forecast Order`);
    // commented this code for Nov Demo  have to delete this comment and uncomment after demo
        let lDate = new Date();
        lDate.setDate(lDate.getDate());
        lDate = lDate.toISOString().split('T')[0];
        let telescoppicDate = await cds.run(`SELECT * from CP_IBPCALENDER_WEEK 
                                                    where WEEK_STARTDATE <= '${lDate}' 
                                                    and WEEK_ENDDATE >= '${lDate}'
                                                    and LEVEL = 'W'`);
        lDate = telescoppicDate.length > 0 ? new Date(telescoppicDate[0].WEEK_STARTDATE) : new Date(lDate);

        // // Get Start date considering after Firm Horizon        
        // const lStartDate = new Date(
        //     lDate.getFullYear(),
        //     lDate.getMonth(),
        //     lDate.getDate() + (parseInt(await GenF.getParameterValue(aData.LOCATION_ID, 9)) * 7) + 1
        // );

        const lStartDate = new Date(
            lDate.getFullYear(),
            lDate.getMonth(),
            lDate.getDate() + (parseInt(await GenF.getParameterValue(aData.LOCATION_ID, 9)) * 7)
        );

        // Get End date considering Forecast Order Horizon        
        const lEndDate = new Date(
            lDate.getFullYear(),
            lDate.getMonth(),
            lDate.getDate() + (parseInt(await GenF.getParameterValue(aData.LOCATION_ID, 2)) * 7)
        );

        // const lEndDate = new Date('2026-01-18');

        // let telescoppicDate = await cds.run(`SELECT * from CP_TELESCOPIC_PERIODS `);
        // let lStartDate = new Date(telescoppicDate[0].PERIODSTART);
        // let lEndDate = new Date(telescoppicDate[telescoppicDate.length - 1].PERIODEND);                                          

        // Get Data from CIR Table
        let liCIRData = await cds.run(`SELECT DISTINCT
                                                    A.LOCATION_ID,
                                                    A.PRODUCT_ID,
                                                    A.WEEK_DATE,
                                                    A.CIR_ID,
                                                    A.MODEL_VERSION,
                                                    A.VERSION,
                                                    A.SCENARIO,
                                                    A.UNIQUE_ID,
                                                    A.CIR_QTY,
                                                    A.ACTUAL_QTY AS CONFIRMED_QTY,
                                                    A.UNCONSUMED_FORECAST,
                                                    A.OPEN_ASSEMBLY,
                                                    A.PRODORD_QTY,
                                                    B.PRPID AS PRIMARY_ID
                                                FROM "CP_CIR_GENERATED" AS A
                                                INNER JOIN V_UID_PID_PRPID AS B
                                                ON A.LOCATION_ID = B.LOCATION_ID
                                                AND A.PRODUCT_ID = B.PRODUCT_ID
                                                AND A.UNIQUE_ID = B.UNIQUE_ID
                                            WHERE A."LOCATION_ID" = '${aData.LOCATION_ID}'
                                              AND A."PRODUCT_ID"  = '${aData.PRODUCT_ID}'
                                              AND A."VERSION"     = '${aData.VERSION}'          
                                              AND A."SCENARIO"    = '${aData.SCENARIO}'         
                                              AND A."MODEL_VERSION"  = '${aData.MODEL_VERSION}'                      
                                              AND (A."WEEK_DATE" >= '${lStartDate.toISOString().split("T")[0]}'
                                              AND  A."WEEK_DATE" < '${lEndDate.toISOString().split("T")[0]}')`);
       
            liCIRData.sort((a, b) => parseInt(a.UNIQUE_ID) - parseInt(b.UNIQUE_ID));

        let iOpenQty = 0;
        bConsume_Flg = false;
        let aClusters_PRPIDS = [];
        let aNearestUIDs = [];
        let totCluster = [];
        let totUID = {};
        let totalData = {};
        
        if (liCIRData.length > 0) {
           let  olddata = liCIRData.filter(el => el.CONFIRMED_QTY > el.CIR_QTY);
            let data = olddata.map(item => item.UNIQUE_ID);
            for (let index = 0; index < liCIRData.length; index++) {
                iReqQty = 0;
                if (liCIRData[index].CONFIRMED_QTY > liCIRData[index].CIR_QTY) {
                    bConsume_Flg = true;
                    // iReqQty = liCIRData[index].CONFIRMED_QTY - liCIRData[index].CIR_QTY;
                    //

                    console.log("totCluster", totCluster.length);
                    console.log("LoopIndex", index);
                    liClusterResults = [];
                    // totalData[liCIRData[index].UNIQUE_ID] = {};
                    let temp = totalData[liCIRData[index].PRIMARY_ID] ;
                    let flag = "";
                    if(temp == undefined){
                        flag = '';
                    } else{
                        flag = 'X';
                    }

                    
                    liCIRData = await this.getNearestCluster(liCIRData[index], liCIRData,totCluster,totUID,totalData,flag,data);
                    
                }
            }


            // for (let index = 0; index < liCIRData.length; index++) {
            //     iReqQty = 0;
            //     if (liCIRData[index].CONFIRMED_QTY > liCIRData[index].CIR_QTY) {
            //         bConsume_Flg = true;
            //         // iReqQty = liCIRData[index].CONFIRMED_QTY - liCIRData[index].CIR_QTY;
            //         //
            //         liClusterResults = [];

            //         // liCIRData = await this.getNearestUniqueIds(liCIRData[index], liCIRData, 0);
            //         await this.getNearestUniqueIds(liCIRData[index], liCIRData, 0);

            //     }
            // }

              newaResCIR = [];
              newoResCIR = {};
            if (bConsume_Flg === true) {
                for (let i = 0; i < liCIRData.length; i++) {
                    if (liCIRData[i].CIR_ID === 0) {
                        // For new UID config, push data to an array. To be inserted with CIR_IDs later
                        oResCIR = {};
                        oResCIR.LOCATION_ID = liCIRData[i].LOCATION_ID;
                        oResCIR.MODEL_VERSION = liCIRData[i].MODEL_VERSION;
                        oResCIR.PRODUCT_ID = liCIRData[i].PRODUCT_ID;
                        oResCIR.SCENARIO = liCIRData[i].SCENARIO;
                        oResCIR.UNIQUE_ID = liCIRData[i].UNIQUE_ID;
                        oResCIR.VERSION = liCIRData[i].VERSION;
                        oResCIR.WEEK_DATE = liCIRData[i].WEEK_DATE;
                        oResCIR.CIR_ID = 0;
                        oResCIR.CIR_QTY = liCIRData[i].CIR_QTY;
                        oResCIR.ACTUAL_QTY = liCIRData[i].ACTUAL_QTY;
                        oResCIR.UNCONSUMED_FORECAST = liCIRData[i].UNCONSUMED_FORECAST;
                        oResCIR.PRODORD_QTY = liCIRData[i].PRODORD_QTY;
                        // oResCIR.OPEN_ASSEMBLY = liCIRData[i].OPEN_ASSEMBLY;
                        oResCIR.OPEN_ASSEMBLY = liCIRData[i].CIR_QTY - liCIRData[i].PRODORD_QTY;
                        oResCIR.SNAPSHOT_CHK = 'X';
                        aResCIR.push(oResCIR);

                    } else {

                         newoResCIR = {};
                        newoResCIR.LOCATION_ID = liCIRData[i].LOCATION_ID;
                        newoResCIR.MODEL_VERSION = liCIRData[i].MODEL_VERSION;
                        newoResCIR.PRODUCT_ID = liCIRData[i].PRODUCT_ID;
                        newoResCIR.SCENARIO = liCIRData[i].SCENARIO;
                        // newoResCIR.UNIQUE_ID = liCIRData[i].UNIQUE_ID;
                        newoResCIR.VERSION = liCIRData[i].VERSION;
                        newoResCIR.WEEK_DATE = liCIRData[i].WEEK_DATE;
                        newoResCIR.CIR_ID = liCIRData[i].CIR_ID;
                        newoResCIR.CIR_QTY = liCIRData[i].CIR_QTY;
                        // newoResCIR.ACTUAL_QTY = liCIRData[i].ACTUAL_QTY;
                        newoResCIR.UNCONSUMED_FORECAST = liCIRData[i].UNCONSUMED_FORECAST;
                        // newoResCIR.PRODORD_QTY = liCIRData[i].PRODORD_QTY;
                        // newoResCIR.OPEN_ASSEMBLY = liCIRData[i].OPEN_ASSEMBLY;
                        newoResCIR.OPEN_ASSEMBLY = liCIRData[i].CIR_QTY - liCIRData[i].PRODORD_QTY;
                        newaResCIR.push(newoResCIR);
                        // try {
                        //     // Update Deducted CIR Quantity from close Unique Id 
                        //     await cds.run(`UPDATE CP_CIR_GENERATED SET CIR_QTY = ${liCIRData[i].CIR_QTY},
                        //                                                UNCONSUMED_FORECAST = ${liCIRData[i].UNCONSUMED_FORECAST},
                        //                                                OPEN_ASSEMBLY       = ${liCIRData[i].CIR_QTY} - ${liCIRData[i].PRODORD_QTY}
                        //                     WHERE LOCATION_ID = '${liCIRData[i].LOCATION_ID}'
                        //                     AND PRODUCT_ID  = '${liCIRData[i].PRODUCT_ID}'
                        //                     AND WEEK_DATE   = '${liCIRData[i].WEEK_DATE}'
                        //                     AND CIR_ID      = '${liCIRData[i].CIR_ID}'
                        //                     AND MODEL_VERSION = '${liCIRData[i].MODEL_VERSION}'
                        //                     AND VERSION     = '${liCIRData[i].VERSION}'
                        //                     AND SCENARIO    = '${liCIRData[i].SCENARIO}'`);
                        // }
                        // catch (e) {
                        //     console.log(e);
                        // }
                    }

                }

                if (aResCIR.length > 0) {
                    // Fetch Maximum Number of CIR_ID
                    iMaxCIRID = await cds.run(
                        `SELECT MAX(CIR_ID) AS MAX_CIR_ID FROM "CP_CIR_GENERATED"`
                    );
                    iMaxCIRID = iMaxCIRID[0].MAX_CIR_ID;

                    // Update CIR_IDs for New Config Data
                    for (let k = 0; k < aResCIR.length; k++) {
                        iMaxCIRID = iMaxCIRID + 1;
                        aResCIR[k].CIR_ID = iMaxCIRID;
                    }

                    // Insert New Config CIR Data
                    if (aResCIR.length > 10000) {
                        const CHUNK = 5000;

                        for (let i = 0; i < aResCIR.length; i += CHUNK) {
                            const batch = aResCIR.slice(i, i + CHUNK);
                            try {
                                await cds.run({
                                    INSERT:
                                    {
                                        into: { ref: ['CP_CIR_GENERATED'] },
                                        entries: batch
                                    }
                                });
                                console.log("Inserted Fully Config Demand for New Config");
                            }
                            catch (error) {
                                console.log("Unable to insert fully config demand for new config", error)
                            }
                            console.log(`Inserted ${i + batch.length}`);
                        }
                    } else {
                        try {
                            await cds.run({
                                INSERT:
                                {
                                    into: { ref: ['CP_CIR_GENERATED'] },
                                    entries: aResCIR
                                }
                            });
                            console.log("Inserted Fully Config Demand for New Config");
                        }
                        catch (error) {
                            console.log("Unable to insert fully config demand for new config", error)
                        }
                    }

                }

                if (newaResCIR.length > 0) {
                    if (newaResCIR.length > 10000) {
                        const CHUNK = 5000;

                        for (let i = 0; i < newaResCIR.length; i += CHUNK) {
                            const batch = newaResCIR.slice(i, i + CHUNK);
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
                        let cqnQuery = { UPSERT: { into: { ref: ['CP_CIR_GENERATED'] }, entries: newaResCIR } };
                        // Insert New Config CIR Data
                        try {
                            // await cds.run({
                            //     UPSERT:
                            //     {
                            //         into: { ref: ['CP_CIR_GENERATED'] },
                            //         entries: newaResCIR
                            //     }
                            // });
                            await cds.run(cqnQuery);
                            console.log("Inserted Fully Config Demand for New Config");
                        }
                        catch (error) {
                            console.log("Unable to insert fully config demand for new config", error)
                        }

                    }
                }

                oReturn.message = oReturn.message = "Successfully Completed Forecast Orders Consumption for Location Product: " + aData.LOCATION_ID + aData.PRODUCT_ID;
            }
        }

        await GenF.logMessage(req, `Completed Consumption of Forecast Order`);
        return oReturn;
    }

    // Function to get Closest Cluster for a Primary Id
    async getNearestCluster(aData, aCIRData,totCluster, totUID,totalData,flag,data) {
        let aPRPIDS_DISTANCES = [];
        let aClusterId = [];
        let iReqQty = 0;

        // if(flag == ''){
        aPRPIDS_DISTANCES = await cds.run(`SELECT DISTINCT A.PRPID, 
                                                           A.CLUSTER_ID,
                                                           B.TARGET_CLUSTER_ID,
                                                           B.DISTANCE
                                            FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS AS A
                                            INNER JOIN CP_AHC_CLUSTER_DISTANCES AS B
                                               ON A.LOCATION_ID = B.LOCATION_ID
                                              AND A.PRODUCT_ID = B.PRODUCT_ID
                                              AND A.CLUSTER_ID = B.TARGET_CLUSTER_ID
                                            WHERE  A.LOCATION_ID = '${aData.LOCATION_ID}'
                                              AND  A.PRODUCT_ID = '${aData.PRODUCT_ID}'
                                              AND  B.SOURCE_CLUSTER_ID IN (SELECT DISTINCT CLUSTER_ID FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS
                                                                                                WHERE LOCATION_ID = '${aData.LOCATION_ID}'
                                                                                                AND PRODUCT_ID = '${aData.PRODUCT_ID}'
                                                                                                AND PRPID = '${aData.PRIMARY_ID}')
                                            ORDER BY B.DISTANCE`);

        // } else {
        //     aPRPIDS_DISTANCES = totalData[aData.PRIMARY_ID]
        // }
        // aPRPIDS_DISTANCES = [];
        totCluster.push(aPRPIDS_DISTANCES);
        totalData[aData.PRIMARY_ID] = aPRPIDS_DISTANCES;
        if (aPRPIDS_DISTANCES.length > 0) {

            for (let i = 0; i < aPRPIDS_DISTANCES.length; i++) {
                // totalData[aData.PRIMARY_ID][aPRPIDS_DISTANCES[i].PRPID] = [];
                iReqQty = await this.getNearestUniqueIds(aData, aCIRData, aPRPIDS_DISTANCES[i].PRPID,totCluster,totUID,totalData,data);
                if (iReqQty === 0) {
                    break;
                }
                // iReqQty = await this.getNearestPrimaryIds(aData, aCIRData, aPRPIDS_DISTANCES[i]);
                // if(iReqQty === 0) {
                //     break;
                // }
            }
            //  When no clusters are generated
        } else {
            iReqQty = await this.getNearestUniqueIds(aData, aCIRData, 0,totCluster,totUID,totalData,data);
        }
        // return aPRPIDS_DISTANCES;
        return aCIRData;
    }
    // Function to get nearest unique ids for specific location, product & unique id
    async getNearestUniqueIds(aData, aCIRData, PRPID,totCluster,totUID,totalData,data) {

        let aNearestUIDs = [], oNearestUIDs = {};
        let uniquesids = [];
        let aUniqueIds = [];
        let iOrder = 0;
        let iPosIndex = -1;
        let iReqQty = 0, iOpenQty = 0;
        let index = -1;
        if (aData.LOCATION_ID) {

            // // Get Unique Ids associated with Primary Id
            // aUniqueIds = await cds.run(`SELECT DISTINCT UNIQUE_ID
            //                             FROM V_SALES_H
            //                            WHERE LOCATION_ID = '${aData.LOCATION_ID}'
            //                             AND PRODUCT_ID = '${aData.PRODUCT_ID}'
            //                             AND PRIMARY_ID = '${PRPID}'`);

            if (PRPID === 0) { // Without Clusters
                // aUniqueIds = await cds.run(`SELECT TOP 200 
                // aUniqueIds = await cds.run(`SELECT
                    aUniqueIds = await cds.run(`SELECT 
                                                      UNIQUE_ID,
                                                      COUNT(*) AS total
                                                    FROM CP_UNIQUE_ID_ITEM
                                                    WHERE 
                                                             UNIQUE_ID IN (SELECT DISTINCT UNIQUE_ID
                                                                                FROM "CP_CIR_GENERATED"
                                                                                WHERE "LOCATION_ID" = '${aData.LOCATION_ID}'
                                                                                AND "PRODUCT_ID"  = '${aData.PRODUCT_ID}'
                                                                                AND "VERSION"     = '${aData.VERSION}'          
                                                                                AND "SCENARIO"    = '${aData.SCENARIO}'         
                                                                                AND "MODEL_VERSION"  = '${aData.MODEL_VERSION}'       
                                                                                AND "WEEK_DATE"   = '${aData.WEEK_DATE}')
                                                                            
                                                         AND ((CHAR_NUM, CHAR_VALUE) IN (SELECT DISTINCT 
                                                                                                A.CHAR_NUM,
                                                                                                A.CHAR_VALUE
                                                                                            FROM CP_UNIQUE_ID_ITEM AS A
                                                                                            INNER JOIN CP_SALES_HM AS B
                                                                                            ON A.UNIQUE_ID = B.UNIQUE_ID
                                                                                            AND B.PRODUCT_ID = '${aData.PRODUCT_ID}'
                                                                                        WHERE A.UNIQUE_ID = '${aData.UNIQUE_ID}'
                                                                                            
                                                                                             ))
                                                        AND UNIQUE_ID <> '${aData.UNIQUE_ID}'
                                                        GROUP BY UNIQUE_ID
                                                        ORDER BY COUNT(*) DESC`);
                // aUniqueIds = uniquesids.filter(item =>
                //         data.some(a => a.UNIQUE_ID === item.UNIQUE_ID)
                //         );

            } else {

                // if(totUID[PRPID] == undefined){                
                // aUniqueIds = await cds.run(`SELECT TOP 200
                // aUniqueIds = await cds.run(`SELECT
                    aUniqueIds = await cds.run(`SELECT
                                                UNIQUE_ID,
                                                COUNT(*) AS total
                                            FROM CP_UNIQUE_ID_ITEM
                                         WHERE (
                        (UNIQUE_ID IN (SELECT DISTINCT A.UNIQUE_ID
                                    FROM "CP_CIR_GENERATED" AS A
                                    INNER JOIN V_SALES_H AS B
                                        ON A.LOCATION_ID = B.LOCATION_ID
                                       AND A.PRODUCT_ID  = B.PRODUCT_ID 
                                       AND A.UNIQUE_ID   = B.UNIQUE_ID                                            
                                    WHERE A."LOCATION_ID" = '${aData.LOCATION_ID}'
                                    AND A."PRODUCT_ID"  = '${aData.PRODUCT_ID}'
                                    AND A."VERSION"     = '${aData.VERSION}'          
                                    AND A."SCENARIO"    = '${aData.SCENARIO}'        
                                    AND A."MODEL_VERSION"  = '${aData.MODEL_VERSION}'      
                                    AND A."WEEK_DATE"   = '${aData.WEEK_DATE}'
                                    AND B.PRIMARY_ID = '${PRPID}'))                            
                                    AND ((CHAR_NUM, CHAR_VALUE) IN (SELECT DISTINCT
                                                            CHAR_NUM,
                                                            CHAR_VALUE
                                                    FROM CP_UNIQUE_ID_ITEM
                                                    WHERE UNIQUE_ID = '${aData.UNIQUE_ID}'))
                                    AND UNIQUE_ID <> '${aData.UNIQUE_ID}')
                                    GROUP BY UNIQUE_ID
                                    ORDER BY COUNT(*) DESC`);

                                    // // totUID.push(aUniqueIds);
                                    // if(aUniqueIds.length > 0){
                                    //     totUID[PRPID] = aUniqueIds;
                                    // }
                // } else {                    
                // aUniqueIds = totUID[PRPID]
                // } 
                // aUniqueIds = uniquesids.filter(item =>
                //         data.some(a => a.UNIQUE_ID === item.UNIQUE_ID)
                //         );


                                    
            }

            index = aCIRData.findIndex(el => {
                return (el.UNIQUE_ID === aData.UNIQUE_ID
                    && el.WEEK_DATE === aData.WEEK_DATE
                );
            });

            iReqQty = parseFloat(aCIRData[index].CONFIRMED_QTY) - parseFloat(aCIRData[index].CIR_QTY);

            if (aUniqueIds.length > 0) {
                // Get all the UIDs associated with the Primary Id
                for (let i = 0; i < aUniqueIds.length; i++) {
                    // if(aUniqueIds[i].UNIQUE_ID !== aData.UNIQUE_ID && iReqQty > 0){
                    if (iReqQty > 0) {
                        // find index of closest unique id                                
                        iPosIndex = aCIRData.findIndex(el => {
                            return (el.UNIQUE_ID === aUniqueIds[i].UNIQUE_ID
                                && el.WEEK_DATE === aData.WEEK_DATE
                            );
                        });

                        if (iPosIndex !== -1) {
                            iOpenQty = parseFloat(aCIRData[iPosIndex].CIR_QTY) - parseFloat(aCIRData[iPosIndex].CONFIRMED_QTY);
                            if (iOpenQty > 0) {

                                if (iOpenQty > iReqQty) {
                                    aCIRData[index].CIR_QTY = parseFloat(aCIRData[index].CIR_QTY) + parseFloat(iReqQty);
                                    aCIRData[iPosIndex].CIR_QTY = parseFloat(aCIRData[iPosIndex].CIR_QTY) - parseFloat(iReqQty);
                                    // aCIRData[iPosIndex].OPEN_ASSEMBLY = parseInt(aCIRData[iPosIndex].OPEN_ASSEMBLY) - parseInt(iReqQty);
                                    iReqQty = 0;
                                } else {
                                    aCIRData[index].CIR_QTY = parseFloat(aCIRData[index].CIR_QTY) + iOpenQty;
                                    aCIRData[iPosIndex].CIR_QTY = parseFloat(aCIRData[iPosIndex].CIR_QTY) - parseFloat(iOpenQty);
                                    // aCIRData[iPosIndex].OPEN_ASSEMBLY = parseInt(aCIRData[iPosIndex].OPEN_ASSEMBLY) - parseInt(iOpenQty);
                                    iReqQty = iReqQty - iOpenQty;
                                }

                                // Calculate Unconsumed and Open for Assembly Quantity
                                aCIRData[iPosIndex].UNCONSUMED_FORECAST = parseInt(aCIRData[iPosIndex].CIR_QTY) - parseInt(aCIRData[iPosIndex].CONFIRMED_QTY);
                                // aCIRData[iPosIndex].OPEN_ASSEMBLY = parseInt(aCIRData[iPosIndex].CIR_QTY) - parseInt(aCIRData[iPosIndex].PRODORD_QTY);
                            }
                        // }
                    } else {
                        break;
                    }

                }
            }
            }


        }

        return iReqQty;
        // return aCIRData;

    }

    // Function to get Closest Primary Ids in Same Cluster of a Primary Id
    async getNearestPrimaryIds(aData, aCIRData, oPRPIDData) {
        let aClusters_PRPIDS = [];
        let oPRPID = { PRPID: oPRPIDData.PRPID };
        let iReqQty = 0;

        // aClusters_PRPIDS = await cds.run(`SELECT DISTINCT PRPID
        //                                     FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS
        //                                     WHERE LOCATION_ID = '${aData.LOCATION_ID}'
        //                                       AND PRODUCT_ID = '${aData.PRODUCT_ID}'
        //                                       AND CLUSTER_ID IN (SELECT DISTINCT CLUSTER_ID
        //                                                             FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS
        //                                                         WHERE LOCATION_ID = '${aData.LOCATION_ID}'
        //                                                             AND PRODUCT_ID = '${aData.PRODUCT_ID}'
        //                                                             AND PRPID = '${aData.PRIMARY_ID}')
        //                                     AND PRPID != '${aData.PRIMARY_ID}'`);

        aClusters_PRPIDS = await cds.run(`SELECT DISTINCT PRPID
                                            FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS
                                            WHERE LOCATION_ID = '${aData.LOCATION_ID}'
                                            AND PRODUCT_ID = '${aData.PRODUCT_ID}'
                                            AND CLUSTER_ID = '${oPRPIDData.CLUSTER_ID}'
                                            AND PRPID = '${oPRPIDData.PRPID}'`);
        // // Appened Current PRPID
        // aClusters_PRPIDS.unshift(oPRPID);

        if (aClusters_PRPIDS.length > 0) {
            for (let j = 0; j < aClusters_PRPIDS.length; j++) {
                iReqQty = await this.getNearestUniqueIds(aData, aCIRData, aClusters_PRPIDS[j].PRPID);
                if (iReqQty === 0) {
                    break;
                }
            }
        }
        return iReqQty;

    }


  async consumptionOfFO_New(aData, req) {
        let aProductionOrder = await cds.run(`SELECT LOCATION_ID,PRODUCT_ID,PRPID,MAT_AVAILDATE,SUM(ORD_QTY) AS ORD_QTY,SUM(ORD_QTY) AS MODIFIED_ORD_QTY,
        0 AS "CURRENT_PRPID" FROM "V_PROD_PRPID"
        WHERE LOCATION_ID = '${aData.LOCATION_ID}' AND PRODUCT_ID = '${aData.PRODUCT_ID}'
        GROUP BY LOCATION_ID,PRODUCT_ID,PRPID,MAT_AVAILDATE 
        ORDER BY PRPID,MAT_AVAILDATE`);

        // aProductionOrder = aProductionOrder.filter(a=>a.PRPID == 38130 && a.MAT_AVAILDATE =='2026-02-23');
        let oReturn = {
            bError: false,
            message: ''
        };
        oReturn.message = "Successfully Completed Forecast Orders Consumption for Location Product: " + aData.LOCATION_ID +" "+ aData.PRODUCT_ID;
        // if (aProductionOrder.length > 0) {

            let aForecast = await cds.run(`WITH UID_PID AS
                                                (
                                                    SELECT DISTINCT 
                                                        UNIQUE_ID,
                                                        CLUSTER.PRPID,
                                                        V_SALES_H.PRODUCT_ID,
                                                        V_SALES_H.LOCATION_ID
                                                    FROM 
                                                        "V_SALES_H"
                                                        INNER JOIN
                                                        "CP_CLUSTER_PRPIDS_MAPPED_PIDS" AS CLUSTER
                                                        ON V_SALES_H.LOCATION_ID = CLUSTER.LOCATION_ID
                                                            AND V_SALES_H.PRODUCT_ID = CLUSTER.PRODUCT_ID
                                                            AND V_SALES_H.PRIMARY_ID = CLUSTER.PID
                                                    WHERE V_SALES_H.LOCATION_ID = '${aData.LOCATION_ID}'
                                                        AND V_SALES_H.PRODUCT_ID = '${aData.PRODUCT_ID}'
                                                ),
                                                   V_PROD AS (
                                                    SELECT 
                                                        LOCATION_ID,
                                                        PRODUCT_ID,
                                                        UNIQUE_ID,
                                                        MAT_AVAILDATE,
                                                        SUM(ORD_QTY) AS TOTAL_ORD_QTY
                                                    FROM "V_PROD_PRPID"
                                                    WHERE LOCATION_ID = '${aData.LOCATION_ID}' AND PRODUCT_ID = '${aData.PRODUCT_ID}'
                                                    GROUP BY LOCATION_ID, PRODUCT_ID, UNIQUE_ID,MAT_AVAILDATE
                                                )
                                                SELECT 
                                                    CIR.LOCATION_ID,
                                                    CIR.PRODUCT_ID,
                                                    CIR.UNIQUE_ID,
                                                    UID.PRPID,
                                                    CIR.WEEK_DATE,
                                                    CIR.CIR_ID,
                                                     NULLIF(SUM(CIR.PRODORD_QTY), NULL) AS PRODORD_QTY,
                                                    SUM(CIR.CIR_QTY) AS CIR_QTY,
                                                    COALESCE(MAX(V_PROD.TOTAL_ORD_QTY), 0) AS MIN_ORD_QTY
                                                FROM 
                                                    "CP_CIR_GENERATED" AS 
                                                CIR
                                                    INNER JOIN
                                                    UID_PID AS UID
                                                    ON UID.LOCATION_ID = CIR.LOCATION_ID
                                                        AND UID.PRODUCT_ID = CIR.PRODUCT_ID
                                                        AND UID.UNIQUE_ID = CIR.UNIQUE_ID
                                                LEFT JOIN V_PROD
                                                    ON V_PROD.LOCATION_ID = CIR.LOCATION_ID
                                                    AND V_PROD.PRODUCT_ID = CIR.PRODUCT_ID
                                                    AND V_PROD.UNIQUE_ID = CIR.UNIQUE_ID
                                                    AND  V_PROD.MAT_AVAILDATE = CIR.WEEK_DATE
                                                WHERE  CIR.LOCATION_ID='${aData.LOCATION_ID}' AND CIR.PRODUCT_ID = '${aData.PRODUCT_ID}'
                                                	AND MODEL_VERSION ='${aData.MODEL_VERSION}' AND VERSION ='${aData.VERSION}' AND SCENARIO='${aData.SCENARIO}'
                                                GROUP BY 
                                                    CIR.LOCATION_ID,
                                                    CIR.PRODUCT_ID,
                                                    CIR.UNIQUE_ID,
                                                    UID.PRPID,
                                                    CIR.WEEK_DATE,
                                                    CIR.CIR_ID,
                                                    CIR.PRODORD_QTY`)
            if (aForecast.length > 0) {
                var aDistance = await cds.run(`SELECT DISTINCT
                                                    "PRP_PID_1",
                                                    "PRP_PID_2",
                                                    "DISTANCE"
                                                FROM "CP_PRPIDS_DISTANCES"
                                                WHERE  LOCATION_ID = '${aData.LOCATION_ID}' AND PRODUCT_ID = '${aData.PRODUCT_ID}'
                                                ORDER BY "PRP_PID_1", "PRP_PID_2","DISTANCE"`);
                let oForecast = {}, oDistance = {};
                if (aDistance.length > 0) {
                    for (let d = 0; d < aDistance.length; d++) {
                        oDistance[aDistance[d].PRP_PID_1] ??= []
                        oDistance[aDistance[d].PRP_PID_1].push({
                            "NEAREST_PRPID": aDistance[d].PRP_PID_2,
                            "DISTANCE": aDistance[d].DISTANCE
                        })

                    }
                }
                for (let f = 0; f < aForecast.length; f++) {
                    let el = aForecast[f];
                    oForecast[el.PRPID] ??= {};
                    oForecast[el.PRPID][el.WEEK_DATE] ??= {}

                    oForecast[el.PRPID][el.WEEK_DATE][el.UNIQUE_ID] ??= {};
                    oForecast[el.PRPID][el.WEEK_DATE]['QTY'] ??= 0;
                    oForecast[el.PRPID][el.WEEK_DATE]['TOTAL_ORD_QTY'] ??= 0;

                    oForecast[el.PRPID][el.WEEK_DATE][el.UNIQUE_ID] = {
                        "CIR_QTY": el.CIR_QTY,
                        "CIR_ID": el.CIR_ID,
                        "MIN_ORD_QTY": el.MIN_ORD_QTY,
                        "OLD_CIR_QTY": el.CIR_QTY,
                        "PRODORD_QTY":el.PRODORD_QTY
                    };
                    oForecast[el.PRPID][el.WEEK_DATE]['QTY'] += el.CIR_QTY;
                    oForecast[el.PRPID][el.WEEK_DATE]['TOTAL_ORD_QTY'] += el.MIN_ORD_QTY;

                    oForecast[el.PRPID]['CONSUMED'] = false;
                    oForecast[el.PRPID][el.WEEK_DATE]['MODIFIED'] = false;
                }

                //Below function adds qty of missing UID's in CIR from sales
                await addMissingQty(oForecast, aData, aProductionOrder);
                var bCIRProcessing = false;
                var aTemp = [];
                await consumeProductionOrders(aProductionOrder, oForecast, oDistance,oReturn);

                async function consumeProductionOrders(aProductionOrder, oForecast, oDistance,oReturn) {
                    console.log("total aProductionOrder", aProductionOrder.length);
                    for (let i = 0; i < aProductionOrder.length; i++) {
                        console.log("current aProductionOrder", i);
                        let el = aProductionOrder[i];
                        if (oForecast[el.PRPID] && oForecast[el.PRPID][el.MAT_AVAILDATE]) {//exists in forecast
                            const cirObj = validateQty(oForecast[el.PRPID][el.MAT_AVAILDATE]);
                            if (cirObj) {//Forecast < Production orders
                                /*
                                1.Get Nearest PRPID based on Distance
                                2.Using the PRPID from above,oForecast -> keep MIN_ORD_QTY and subtract from CIR_QTY of PRPID 
                                3.The quantity should be sent to Prorate 
                                */
                                if (oDistance[el.PRPID]) {
                                    if (el.CURRENT_PRPID == oDistance[el.PRPID][oDistance[el.PRPID].length - 1]['NEAREST_PRPID']) {//last nearest PRPID,stop processing
                                        aTemp.push(el);
                                        oForecast[el.PRPID]['CONSUMED'] = true;
                                        el.MODIFIED_ORD_QTY = 0;
                                        el['TYPE'] = 'LAST_PRPID';
                                        continue;
                                    }
                                    let aReqQty = findQty(oForecast[el.PRPID][el.MAT_AVAILDATE]);
                                    if (aReqQty <= 0) {
                                        continue;
                                    }
                                    const obj = nearestPRPID(oDistance[el.PRPID], oForecast);
                                    //Nearest PRPID Found, comsume from it

                                    if (obj == null) {//No valid nearest cluster,move it for next processing
                                        aTemp.push(el);
                                        oForecast[el.PRPID]['CONSUMED'] = true;
                                        el.MODIFIED_ORD_QTY = 0;
                                        el['TYPE'] = 'NO_NEARBY_CLUSTER';
                                        continue;
                                    }
                                    el.CURRENT_PRPID = obj.NEAREST_PRPID;
                                    let aNearest = oForecast?.[obj.NEAREST_PRPID];
                                    if (aNearest) {
                                        bCIRProcessing = commonProcessLogicFn(aNearest, el, oForecast, obj.NEAREST_PRPID, aReqQty, bCIRProcessing);
                                    }
                                }
                                else {//Not found in Distances
                                    aTemp.push(el);
                                    oForecast[el.PRPID]['CONSUMED'] = true;
                                    el.MODIFIED_ORD_QTY = 0;
                                    el['TYPE'] = 'NOT_FOUND_IN_DISTANCE';
                                    continue;
                                }
                            }
                            else {
                                el.ORD_QTY = 0, el.MODIFIED_ORD_QTY = 0; // Making Production order qty as zero as forecast > Production orders
                                el['TYPE'] = 'FORECAST_GE_SALES';
                            }
                        }
                        else {//PRPID not found in Forecast, ignore it 
                            el.MODIFIED_ORD_QTY = 0;
                            el['TYPE'] = 'NOT_FOUND_IN_FORECAST';
                        }
                    }

                    //check to call recursive loop again
                    let aUnconsumedProdOrders = aProductionOrder.filter(p => p.MODIFIED_ORD_QTY != 0);
                    console.log("Unconsumed Orders:", aUnconsumedProdOrders.length);
                    if (aUnconsumedProdOrders.length > 0) {
                        await consumeProductionOrders(aUnconsumedProdOrders, oForecast, oDistance,oReturn)
                    }
                    else {//Consume based on PRPID Characteristics
                        await reProcess(aTemp, oForecast,oReturn);
                        async function reProcess(aTemp, oForecast,oReturn) {
                            if (aTemp.length > 0) {
                                for (var p = 0; p < aTemp.length; p++) {
                                    console.log("currentIndex - PRPID", p, aTemp[p].PRPID)
                                    aTemp[p].MODIFIED_ORD_QTY = aTemp[p].ORD_QTY;
                                    let aNearestData = await cds.run(
                                        `SELECT 
                                CP_UNIQUE_ID_ITEM.UNIQUE_ID AS PRPID,
                                COUNT(*) AS total
                            FROM 
                                CP_UNIQUE_ID_ITEM
                                INNER JOIN
                                "CP_UNIQUE_ID_HEADER"
                                ON CP_UNIQUE_ID_HEADER.UNIQUE_ID = CP_UNIQUE_ID_ITEM.UNIQUE_ID
                                    AND CP_UNIQUE_ID_HEADER.UID_TYPE = 'P'
                                                    WHERE 
                                                    ((CHAR_NUM, CHAR_VALUE) IN (SELECT DISTINCT 
                                                                                                A.CHAR_NUM,
                                                                                                A.CHAR_VALUE
                                                                                            FROM CP_UNIQUE_ID_ITEM AS A
                                                                                            INNER JOIN CP_SALES_HM AS B
                                                                                            ON A.UNIQUE_ID = B.PRIMARY_ID
                                                                                            AND B.PRODUCT_ID = '${aTemp[p].PRODUCT_ID}'
                                                                                        WHERE A.UNIQUE_ID = '${aTemp[p].PRPID}'
                                                                                            
                                                                                             ))
                                                        AND CP_UNIQUE_ID_ITEM.UNIQUE_ID <>'${aTemp[p].PRPID}'
                                                        GROUP BY CP_UNIQUE_ID_ITEM.UNIQUE_ID
                                                        ORDER BY COUNT(*) DESC `
                                    )
                                    if (aNearestData.length > 0) {
                                        outerLoop:
                                        for (var n = 0; n < aNearestData.length; n++) {
                                            if (oForecast[aNearestData[n].PRPID]) {
                                                const prpid = aNearestData[n].PRPID;
                                                const forecastByPrpid = oForecast[prpid];
                                                for (const d of Object.keys(forecastByPrpid)) {
                                                    //check if any QTY remains to consume

                                                    if (aTemp[p].MODIFIED_ORD_QTY != 0 && d != 'CONSUMED') {
                                                        let iForecastQty = oForecast[aNearestData[n].PRPID][d]['QTY'];
                                                        if (iForecastQty != 0) {
                                                            let aReqQty = iForecastQty - aTemp[p].MODIFIED_ORD_QTY;
                                                            if (aReqQty > 0) {
                                                                let iQty = aTemp[p].MODIFIED_ORD_QTY;
                                                                bCIRProcessing = commonProcessLogicFn(oForecast[aNearestData[n].PRPID], aTemp[p], oForecast, aNearestData[n].PRPID, iQty, bCIRProcessing);
                                                            }
                                                            else if (aReqQty < 0) {
                                                                let iQty = iForecastQty;
                                                                bCIRProcessing = commonProcessLogicFn(oForecast[aNearestData[n].PRPID], aTemp[p], oForecast, aNearestData[n].PRPID, iQty, bCIRProcessing);
                                                            }
                                                        }

                                                    }
                                                    if (aTemp[p].MODIFIED_ORD_QTY == 0) {
                                                        break outerLoop;
                                                    }


                                                }

                                            }
                                        }
                                    }
                                }

                                // let aCheck = aTemp.filter(p => p.MODIFIED_ORD_QTY != 0);
                                // if (aCheck.length > 0) {
                                //     await reProcess(aCheck, oForecast,oReturn)
                                // }
                                // else {
                                    await processCir(oForecast,oReturn);
                                // }

                        }
                            else {
                                await processCir(oForecast,oReturn);
                            }

                        }

                    }
                }
                async function addMissingQty(oForecast, aData, aProductionOrder) {
                    let aProductionOrderDetailed = await cds.run(`
                                SELECT 
                                    LOCATION_ID,
                                    PRODUCT_ID,
                                    PRPID,
                                    UNIQUE_ID,
                                    MAT_AVAILDATE,
                                    SUM(ORD_QTY) AS ORD_QTY
                                FROM "V_PROD_PRPID"
                                WHERE LOCATION_ID = '${aData.LOCATION_ID}' 
                                    AND PRODUCT_ID = '${aData.PRODUCT_ID}'
                                GROUP BY LOCATION_ID, PRODUCT_ID, PRPID, UNIQUE_ID, MAT_AVAILDATE
                                ORDER BY PRPID, MAT_AVAILDATE, UNIQUE_ID
                            `);

                    let aPlannedProdOrders = await cds.run(`SELECT UNIQUE_ID,WEEK_DATE,SUM(PRODORD_QTY) AS PRODORD_QTY FROM "V_PRODORD_QTY" 
                        WHERE LOCATION_ID = '${aData.LOCATION_ID}'  AND PRODUCT_ID = '${aData.PRODUCT_ID}'
                        AND WEEK_DATE >= CURRENT_DATE
                        GROUP BY UNIQUE_ID, WEEK_DATE
                        `);
                    
                    let oPlannedProdOrders ={};
                    if(aPlannedProdOrders.length >0){
                        for(let p = 0; p < aPlannedProdOrders.length ; p++){
                            let el =aPlannedProdOrders[p];
                            oPlannedProdOrders[el.UNIQUE_ID] ??={};
                            oPlannedProdOrders[el.UNIQUE_ID][el.WEEK_DATE] ??=0;
                            oPlannedProdOrders[el.UNIQUE_ID][el.WEEK_DATE] = el.PRODORD_QTY;
                        }
                    }

                    // Build a map of production order totals by PRPID + Date
                    const productionTotals = {};
                    aProductionOrder.forEach(po => {
                        const key = `${po.PRPID}|${po.MAT_AVAILDATE}`;
                        productionTotals[key] = po.ORD_QTY;
                    });

                    // Group by PRPID + Date to find missing quantities
                    const missingByDate = {};

                    aProductionOrderDetailed.forEach(po => {
                        const dateKey = `${po.PRPID}|${po.MAT_AVAILDATE}`;

                        if (!missingByDate[dateKey]) {
                            missingByDate[dateKey] = {
                                PRPID: po.PRPID,
                                MAT_AVAILDATE: po.MAT_AVAILDATE,
                                missingQty: 0,
                                 missingUIDs: [],  
                                existingUIDs: [],
                                existingTotal: 0  //  Track existing MIN_ORD_QTY
                            };
                        }

                        // Check if this PRPID + Date exists in forecast
                        if (oForecast[po.PRPID] && oForecast[po.PRPID][po.MAT_AVAILDATE]) {
                            // Check if this specific UNIQUE_ID exists
                            if (!oForecast[po.PRPID][po.MAT_AVAILDATE][po.UNIQUE_ID]) {
                                // This UID is missing - add its quantity to the pool
                                missingByDate[dateKey].missingQty += po.ORD_QTY;
                                missingByDate[dateKey].missingUIDs.push({
                                        UID: po.UNIQUE_ID,
                                        PRODORD_QTY: oPlannedProdOrders[po.UNIQUE_ID]?.[po.MAT_AVAILDATE] || 0
                                    });
                            } else {
                                // This UID exists - track it as a recipient
                                missingByDate[dateKey].existingUIDs.push(po.UNIQUE_ID);
                                //  Track existing MIN_ORD_QTY
                                missingByDate[dateKey].existingTotal +=
                                    oForecast[po.PRPID][po.MAT_AVAILDATE][po.UNIQUE_ID].MIN_ORD_QTY || 0;
                            }
                        }
                    });

                    // Now distribute the missing quantities to existing UIDs
                    let totalDistributed = 0;

                    Object.values(missingByDate).forEach(dateInfo => {
                        if (dateInfo.missingQty > 0 && dateInfo.existingUIDs.length > 0) {
                            const dateKey = `${dateInfo.PRPID}|${dateInfo.MAT_AVAILDATE}`;
                            const expectedTotal = productionTotals[dateKey] || 0;

                            //  Calculate actual missing amount (difference between expected and existing)
                            const actualMissing = expectedTotal - dateInfo.existingTotal;

                            if (actualMissing <= 0) {
                                return;
                            }

                            //  Use actualMissing instead of all missing UIDs
                            const qtyToDistribute = Math.min(actualMissing, dateInfo.missingQty);
                            const qtyPerUID = Math.floor(qtyToDistribute / dateInfo.existingUIDs.length);
                            let remainder = qtyToDistribute - (qtyPerUID * dateInfo.existingUIDs.length);

                             //  Calculate total PRODORD_QTY from missing UIDs
                            const totalMissingProdOrdQty = dateInfo.missingUIDs.reduce((sum, m) => sum + m.PRODORD_QTY, 0);
                            const prodOrdQtyPerUID = Math.floor(totalMissingProdOrdQty / dateInfo.existingUIDs.length);
                            let prodOrdRemainder = totalMissingProdOrdQty - (prodOrdQtyPerUID * dateInfo.existingUIDs.length);


                            dateInfo.existingUIDs.forEach((uid, index) => {
                                const extraQty = (index === 0) ? qtyPerUID + remainder : qtyPerUID;
                                const extraProdOrdQty = (index === 0) ? prodOrdQtyPerUID + prodOrdRemainder : prodOrdQtyPerUID;
                                // Add to CIR_QTY, OLD_CIR_QTY, and MIN_ORD_QTY
                                oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE][uid].CIR_QTY += extraQty;
                                // oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE][uid].OLD_CIR_QTY += extraQty;
                                oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE][uid].MIN_ORD_QTY += extraQty;
                                //Add missing UID Production order qty to current Production order qty
                                oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE][uid].PRODORD_QTY = 
                                (oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE][uid].PRODORD_QTY || 0) + extraProdOrdQty;


                                // Update QTY and TOTAL_ORD_QTY for the date
                                oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE]['QTY'] += extraQty;
                                oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE]['TOTAL_ORD_QTY'] += extraQty;

                                totalDistributed += extraQty;


                            });
                        }
                    });

                }


                async function processCir(oForecast,oReturn) {

                    if (bCIRProcessing == true) {
                        var aCIRData = [];
                        for (const prpid in oForecast) {
                            const group = oForecast[prpid];
                            const seen = new Set();
                            for (const [weekDate, weekObj] of Object.entries(group)) {
                                if (weekDate === 'CONSUMED' || !weekObj || typeof weekObj !== "object") {
                                    continue;
                                }



                                for (const [UID, cirData] of Object.entries(weekObj)) {
                                    // Skip metadata and non-objects
                                    if (UID === 'QTY' || UID === 'MODIFIED' || UID === 'CONSUMED' || UID == 'TOTAL_ORD_QTY') {
                                        continue;
                                    }

                                    if (!cirData || typeof cirData !== "object") {
                                        continue;
                                    }

                                    const uniqueKey = `${prpid}|${weekDate}|${cirData.CIR_ID}|${UID}`;
                                    if (seen.has(uniqueKey)) continue;
                                    seen.add(uniqueKey);
                                    // if (!(cirData.CIR_QTY === 0 && cirData.OLD_CIR_QTY === 0)
                                    // ) {

                                        const oCIR = {
                                            LOCATION_ID: aData.LOCATION_ID,
                                            PRODUCT_ID: aData.PRODUCT_ID,
                                            WEEK_DATE: weekDate,
                                            MODEL_VERSION: aData.MODEL_VERSION,
                                            VERSION: aData.VERSION,
                                            SCENARIO: aData.SCENARIO,
                                            CIR_ID: cirData.CIR_ID,
                                            UNIQUE_ID: UID,
                                            // OLD_CIR_QTY: cirData.OLD_CIR_QTY
                                            CIR_QTY: cirData.CIR_QTY,
                                            // PRPID: prpid,
                                             MIN_ORD_QTY: cirData.MIN_ORD_QTY,
                                             PRODORD_QTY:cirData.PRODORD_QTY
                                        };

                                        aCIRData.push(oCIR);
                                    // }


                                }
                            }

                        }

                        if (aCIRData.length > 0) {

                           let bExtraForecast = await comparewithProductDemand(aCIRData, aData);
                           if(bExtraForecast ==true){//skip consumption if extra forecast exists
                            oReturn.message ="Warning: Forecast Orders Consumption failed for Location Product: " + aData.LOCATION_ID +" "+ aData.PRODUCT_ID+" as Actuals are greater than Product Demand.";
                            return;
                           }
                         for (let a = 0; a < aCIRData.length; a++) {
                aCIRData[a].ACTUAL_QTY = aCIRData[a].MIN_ORD_QTY;
                aCIRData[a].UNCONSUMED_FORECAST = aCIRData[a].CIR_QTY - aCIRData[a].MIN_ORD_QTY;

                //Calculate Open assembly
                aCIRData[a].PRODORD_QTY = aCIRData[a].PRODORD_QTY;
                aCIRData[a].OPEN_ASSEMBLY = aCIRData[a].CIR_QTY - aCIRData[a].PRODORD_QTY;
                delete aCIRData[a].MIN_ORD_QTY;
            }

            
                            const BATCH_SIZE = 5000; // Define batch size

                            // let aCIRArray = aCIRData.filter(f => f.OLD_CIR_QTY != f.CIR_QTY);
                            let aCIRArray = aCIRData;

                               

                            console.log(` Updating ${aCIRArray.length} records in database...`);

                            let updatedCount = 0;
                            
                            try {
                                for (let i = 0; i < aCIRArray.length; i += BATCH_SIZE) {
                                    const batch = aCIRArray.slice(i, i + BATCH_SIZE);

                                    try {
                                        let cqnQuery = { UPSERT: { into: { ref: ['CP_CIR_GENERATED'] }, entries: batch } };
                                        try {
                                            await cds.run(cqnQuery);
                                        } catch (e) {
                                            console.log('Error in upsert',i);
                                        }
                                        updatedCount += batch.length;
                                        console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} complete: ${updatedCount}/${aCIRArray.length}`);

                                    } catch (error) {
                                        console.log(`Error updating batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
                                    }
                                }

                                console.log(`Successfully updated ${updatedCount} records`);

                            } catch (error) {
                                console.log('Database update failed:', error);
                            }
                              console.log("All orders fulfilled")
                            return;
                            //Below code is only for testing 

                            // const reducedSum = aCIRreduced.reduce((sum, r) => sum + (r.OLD_CIR_QTY - r.CIR_QTY), 0);
                            // const increasedSum = aCIRincreased.reduce((sum, r) => sum + (r.CIR_QTY - r.OLD_CIR_QTY), 0);

                            // console.log('   Total Records:', aCIRData.length);
                            // console.log('   Reduced Records:', aCIRreduced.length);
                            // console.log('   Increased Records:', aCIRincreased.length);
                            // console.log('');
                            // console.log('   Total Reduced Amount:', reducedSum);
                            // console.log('   Total Increased Amount:', increasedSum);
                            // console.log('   Difference:', Math.abs(reducedSum - increasedSum));
                            // console.log('');
                            // console.log(reducedSum === increasedSum ? ' BALANCED' : ' IMBALANCED');

                            //#region Testing
                            //     console.log("Runnig test script")
                            //     let aTestSales = await cds.run(`SELECT 
                            //     "PRPID",
                            //     UNIQUE_ID,
                            //     MAT_AVAILDATE,
                            //     SUM(ORD_QTY) AS TOTAL_ORD_QTY
                            // FROM "V_PROD_PRPID"
                            // WHERE UPPER("PRODUCT_ID") = UPPER('LOCKFR')
                            // GROUP BY "PRPID", UNIQUE_ID,MAT_AVAILDATE
                            // ORDER BY "PRPID",MAT_AVAILDATE ASC`);

                            //     var aResults = [], aDeviations = [];
                            //     for (var s = 0; s < aTestSales.length; s++) {
                            //         let oEl = aTestSales[s];
                            //         let aRec = aCIRData.filter(f => f.WEEK_DATE == oEl.MAT_AVAILDATE && f.UNIQUE_ID == oEl.UNIQUE_ID &&
                            //             f.PRPID == oEl.PRPID)
                            //         if (aRec.length > 0) {
                            //             let iDiff = aRec[0].CIR_QTY - oEl.TOTAL_ORD_QTY;

                            //             if (iDiff < 0) {//not consumed
                            //                 let obj = Object.assign({}, oEl);
                            //                 obj.CIR_QTY = aRec[0].CIR_QTY;
                            //                 obj.OLD_CIR_QTY = aRec[0].OLD_CIR_QTY;
                            //                 obj.Difference = iDiff;
                            //                 aDeviations.push(obj);
                            //             }
                            //         }
                            //         else {
                            //             if (!oForecast[oEl.PRPID]?.[oEl.MAT_AVAILDATE]?.[oEl.UNIQUE_ID]) {
                            //                 aResults.push(oEl);
                            //             }
                            //         }

                            //     }

                            //     if (aDeviations.length > 0) {
                            //         console.log("Deviations exists")
                            //         const wb = XLSX.utils.book_new();
                            //         const wsReduced = XLSX.utils.json_to_sheet(aDeviations);
                            //         XLSX.utils.book_append_sheet(wb, wsReduced, 'Deviations');


                            //         // Write to workspace folder (not home directory)
                            //         const filepath = path.join(__dirname, 'Deviations.xlsx');
                            //         XLSX.writeFile(wb, filepath);
                            //         return;
                            //     }
                          


                            // const wb = XLSX.utils.book_new();


                            // const wtotal = XLSX.utils.json_to_sheet(aCIRData);
                            // XLSX.utils.book_append_sheet(wb, wtotal, 'Total');



                            //#endregion

                        }
                    }
                    else{
                        // oReturn.bError = true;
                        oReturn.message ="Forecast Orders Consumption failed for Location Product: " + aData.LOCATION_ID +" "+ aData.PRODUCT_ID;
                    }
                }
                function commonProcessLogicFn(aNearest, el, oForecast, NEAREST_PRPID, aReqQty, bCIRProcessing) {
                    const aForecastKeys = Object.keys(aNearest).filter(key => key !== 'QTY' && key != 'CONSUMED' && key != 'MODIFIED' && key != 'TOTAL_ORD_QTY');
                    // //Qty to Prorate for removal
                    let totalAllowableQty = 0;
                    const aPeriodData = [];

                    var iTotal = 0;
                    aForecastKeys.forEach((key) => {
                        const aForecastWeeks = Object.keys(aNearest[key]).filter(key => key !== 'QTY' && key != 'CONSUMED' && key != 'MODIFIED' && key != 'TOTAL_ORD_QTY');
                        aForecastWeeks.forEach((w) => {
                            let iAllowableQty = aNearest[key][w].CIR_QTY - aNearest[key][w].MIN_ORD_QTY;
                           if (iAllowableQty >= 0){
                            // if (iAllowableQty >= 0 && aNearest[key][w].MIN_ORD_QTY > 0) {//temp
                                iTotal += iAllowableQty;
                            }
                            if(iAllowableQty > 0) {
                            // if (iAllowableQty > 0 && aNearest[key][w].MIN_ORD_QTY > 0) {//temp
                                totalAllowableQty += iAllowableQty;
                                aPeriodData.push({
                                    UID: w,
                                    weekKey: key,
                                    allowableQty: iAllowableQty,
                                    MIN_ORD_QTY:aNearest[key][w].MIN_ORD_QTY
                                });
                            }
                        })

                    });

                    if (iTotal == 0) {
                        oForecast[NEAREST_PRPID]['CONSUMED'] = true;
                    }
                    if (el.MODIFIED_ORD_QTY > 0 && aPeriodData.length > 0) {
                        let aCompareQty = Math.min(totalAllowableQty, aReqQty);
                        let actualTotalConsumed = prorateDataRemoval(aCompareQty, aPeriodData, oForecast, totalAllowableQty, NEAREST_PRPID)


                        bCIRProcessing = true; // Must update forecast orders
                        const actualAdded = prorateData(oForecast, el, actualTotalConsumed);
                        const unallocated = actualTotalConsumed - actualAdded;
                        if (unallocated > 0) {
                            let remainingToAddBack = unallocated;
                            aPeriodData.forEach((period, index) => {
                                if (remainingToAddBack <= 0) return;

                                let oElement = oForecast[NEAREST_PRPID][period.weekKey][period.UID];

                                let addBackQty;
                                if (index === aPeriodData.length - 1) {
                                    addBackQty = remainingToAddBack;
                                } else {
                                    const proportion = period.allowableQty / totalAllowableQty;
                                    addBackQty = Math.floor(unallocated * proportion);
                                }

                                oElement.CIR_QTY += addBackQty;
                                oForecast[NEAREST_PRPID][period.weekKey]['QTY'] += addBackQty;
                                remainingToAddBack -= addBackQty;

                            });
                        }

                        const prpData = oForecast[NEAREST_PRPID];
                        const hasUnmodified = Object.values(prpData).some(
                            d => d && typeof d === "object" && d.MODIFIED === false
                        );
                        oForecast[NEAREST_PRPID]['CONSUMED'] = !hasUnmodified;

                        const cirObj = validateQty(oForecast[el.PRPID][el.MAT_AVAILDATE]);
                        if (!cirObj) {  // Whole consumption done
                            el.MODIFIED_ORD_QTY = 0;
                            el['TYPE'] = 'CONSUMPTION_COMPLETE';
                        } else {// Unconsumed quantity remains
                            let remainingGap = findQty(oForecast[el.PRPID][el.MAT_AVAILDATE]);
                            if (remainingGap <= 0) {
                                el.MODIFIED_ORD_QTY = 0;
                                el['TYPE'] = 'CONSUMPTION_COMPLETE';
                            } else { // Still needs more
                                el.MODIFIED_ORD_QTY = remainingGap;
                            }
                        }

                    }
                    return bCIRProcessing;
                }
                function validateQty(obj) {
                    let foundCir = null;

                    const cirObj = obj;

                    for (const [UID, cirData] of Object.entries(cirObj)) {
                        if (typeof cirData != "object") {
                            continue;
                        }
                        if (cirData.CIR_QTY === 0 && cirData.OLD_CIR_QTY === 0 && cirData.MIN_ORD_QTY == 0) {
                            continue;
                        }

                        // check change condition
                        if (
                            cirData.MIN_ORD_QTY > cirData.CIR_QTY
                        ) {
                            foundCir = {
                                UNIQUE_ID: UID,
                                ...cirData
                            };
                            break;
                        }
                    }
                    return foundCir;
                }

                function findQty(data) {
                    let totalGap = 0;

                    for (const [key, value] of Object.entries(data)) {
                        // Skip metadata keys
                        if (key === 'QTY' || key === 'TOTAL_ORD_QTY' || key === 'MODIFIED') {
                            continue;
                        }

                        // Check if this is a valid UID object
                        if (value && typeof value === 'object' && 'MIN_ORD_QTY' in value) {
                            const minOrderQty = value.MIN_ORD_QTY || 0;
                            const cirQty = value.CIR_QTY || 0;

                            //  Only count positive gaps (UIDs below MIN)
                            if (minOrderQty > 0) {
                                const gap = minOrderQty - cirQty;
                                if (gap > 0) {  //  Only add if CIR_QTY < MIN_ORD_QTY
                                    totalGap += gap;
                                }
                            }
                        }
                    }

                    return totalGap;
                }
                function prorateData(oForecast, el, iConsumptionQty) {
                    const dateData = oForecast[el.PRPID][el.MAT_AVAILDATE];

                    if (!dateData) {
                        return 0;
                    }

                    const aForecastKeys = Object.keys(dateData)
                        .filter(key => key !== 'QTY' && key !== 'CONSUMED' && key !== 'MODIFIED' && key != 'TOTAL_ORD_QTY');

                    // Separate UIDs into two groups
                    const uidsBelowMin = [];
                    const uidsAtOrAboveMin = [];

                    aForecastKeys.forEach(key => {
                        const currentCIR = dateData[key].CIR_QTY;
                        const minOrderQty = dateData[key].MIN_ORD_QTY || 0;

                        if (minOrderQty > 0 && currentCIR < minOrderQty) {
                            uidsBelowMin.push({
                                key: key,
                                currentCIR: currentCIR,
                                minOrderQty: minOrderQty,
                                gap: minOrderQty - currentCIR
                            });
                        } else {
                            uidsAtOrAboveMin.push({
                                key: key,
                                currentCIR: currentCIR,
                                minOrderQty: minOrderQty
                            });
                        }
                    });

                    //  Sort UIDs below MIN by gap size (biggest first)
                    uidsBelowMin.sort((a, b) => b.gap - a.gap);

                    let remainingQty = iConsumptionQty;
                    let totalAdded = 0;

                    // Fill UIDs below MIN first (up to their MIN)
                    uidsBelowMin.forEach(uid => {
                        if (remainingQty <= 0) return;

                        const toAdd = Math.min(remainingQty, uid.gap);

                        dateData[uid.key].CIR_QTY = uid.currentCIR + toAdd;
                        dateData[uid.key].MODIFIED_IN_THIS_RUN = true;

                        totalAdded += toAdd;
                        remainingQty -= toAdd;

                    });

                    //  Distribute remaining to UIDs at/above MIN (or no MIN)
                    if (remainingQty > 0 && uidsAtOrAboveMin.length > 0) {

                        const totalCIR = uidsAtOrAboveMin.reduce((sum, uid) => sum + uid.currentCIR, 0);

                        uidsAtOrAboveMin.forEach((uid, index) => {
                            if (remainingQty <= 0) return;

                            let allocatedQty;

                            if (index === uidsAtOrAboveMin.length - 1) {
                                allocatedQty = remainingQty;
                            } else {
                                const proportion = totalCIR > 0 ? uid.currentCIR / totalCIR : (1 / uidsAtOrAboveMin.length);
                                allocatedQty = Math.floor(remainingQty * proportion);
                                remainingQty -= allocatedQty;
                            }

                            const newCIR = uid.currentCIR + allocatedQty;

                            // Check MIN cap
                            if (uid.minOrderQty > 0 && newCIR > uid.minOrderQty) {
                                dateData[uid.key].CIR_QTY = uid.minOrderQty;
                                const actualAdded = uid.minOrderQty - uid.currentCIR;
                                totalAdded += actualAdded;
                                remainingQty += (allocatedQty - actualAdded);  // Put overflow back
                            } else {
                                dateData[uid.key].CIR_QTY = newCIR;
                                totalAdded += allocatedQty;
                            }

                            dateData[uid.key].MODIFIED_IN_THIS_RUN = true;
                        });
                    }

                    dateData['QTY'] += totalAdded;
                    dateData['MODIFIED'] = true;

                    return totalAdded;
                }

                function prorateDataRemoval(aCompareQty, aPeriodData, oForecast, totalAllowableQty, NEAREST_PRPID) {
                    // Prorate removal across all periods
                    let remainingToConsume = aCompareQty;
                    let actualTotalConsumed = 0;

                    aPeriodData.forEach((period, index) => {
                        let consumedQty;

                        if (index === aPeriodData.length - 1) {
                            // Last entry gets remainder
                            consumedQty = remainingToConsume;
                        } else {
                            // Prorate based on proportion
                            let proportion = 0;
                            if (totalAllowableQty > 0) {
                                proportion = period.allowableQty / totalAllowableQty;
                            }
                            consumedQty = Math.floor(aCompareQty * proportion);
                        }
                        let oElement = oForecast[NEAREST_PRPID][period.weekKey][period.UID];
                        const currentCIR = oElement.CIR_QTY;
                        const minOrderQty = oElement.MIN_ORD_QTY;

                        const maxConsumable = Math.max(0, currentCIR - minOrderQty);
                        const actualConsumedQty = Math.min(consumedQty, maxConsumable);

                        actualTotalConsumed += actualConsumedQty;

                        // Update remaining for next iteration
                        if (index !== aPeriodData.length - 1) {
                            remainingToConsume -= actualConsumedQty;
                        }


                        if (actualConsumedQty > 0) {
                            oElement.CIR_QTY -= actualConsumedQty;
                            oElement.MODIFIED_IN_THIS_RUN = true;


                            // Verify it didn't go below MIN_ORD_QTY
                            // if (oElement.CIR_QTY < minOrderQty) {
                            //     debugger;
                            // }

                            //Refresh forecast
                            oForecast[NEAREST_PRPID][period.weekKey]['QTY'] -= actualConsumedQty;

                            oForecast[NEAREST_PRPID][period.weekKey]['MODIFIED'] = true;
                        }

                        // 
                    }
                    );
                    return actualTotalConsumed;
                }

                function nearestPRPID(aInput, oForecast) {
                    let minRow = null;
                    let minDist = Infinity;

                    for (const row of aInput) {
                        // Skip if PRPID not present in forecast or  its consumed already
                        if (!oForecast[row.NEAREST_PRPID]) {
                            continue;
                        }

                        if (oForecast[row.NEAREST_PRPID].CONSUMED === true) {
                            continue;
                        }

                        if (row.DISTANCE < minDist) {
                            minDist = row.DISTANCE;
                            minRow = row;
                        }
                    }
                    return minRow;
                }

                async function comparewithProductDemand(aCIRData, aData) {
                    var bExtraForecast = false;
                    let aProdDemand = await cds.run(`
                                        SELECT DISTINCT
                                            "WEEK_DATE",
                                            "QUANTITY"
                                        FROM "CP_IBP_FUTUREDEMAND"
                                        WHERE "PRODUCT_ID" = '${aData.PRODUCT_ID}' 
                                            AND LOCATION_ID = '${aData.LOCATION_ID}'
                                    `);

                    // Build demand lookup
                    const demandLookup = {};
                    aProdDemand.forEach(demand => {
                        demandLookup[demand.WEEK_DATE] = demand.QUANTITY;
                    });

                    // Group CIR data by week
                    const weeklyData = {};
                    aCIRData.forEach(record => {
                        const week = record.WEEK_DATE;

                        if (!weeklyData[week]) {
                            weeklyData[week] = {
                                records: [],
                                totalCIR: 0,
                                demand: demandLookup[week] || 0
                            };
                        }

                        weeklyData[week].records.push(record);
                        weeklyData[week].totalCIR += record.CIR_QTY;
                    });

                    // Process each week that exceeds demand
                    Object.keys(weeklyData).forEach(week => {
                        const weekInfo = weeklyData[week];
                        
                        console.log(`\n Week ${week}: CIR=${weekInfo.totalCIR}, Demand=${weekInfo.demand}`);

                        if (weekInfo.totalCIR > weekInfo.demand && weekInfo.demand > 0) {
                            let excessToRemove = weekInfo.totalCIR - weekInfo.demand;

                            console.log(`  Need to remove ${excessToRemove} units`);

                            //  Get records with CIR_QTY > MIN_ORD_QTY, sorted by CIR_QTY ascending
                            const reducibleRecords = weekInfo.records
                                .filter(record => record.CIR_QTY > record.MIN_ORD_QTY)
                                .sort((a, b) => a.CIR_QTY - b.CIR_QTY); //  Ascending order

                            if (reducibleRecords.length === 0) {
                                console.log(` Cannot reduce - all records at MIN_ORD_QTY`);
                                return;
                            }

                            console.log(`   Found ${reducibleRecords.length} reducible records`);

                            //  Subtract from each record until excess is removed
                            for (const record of reducibleRecords) {
                                if (excessToRemove <= 0) break;

                                const maxCanReduce = record.CIR_QTY - record.MIN_ORD_QTY;
                                const reduction = Math.min(maxCanReduce, excessToRemove);

                                const oldCIR = record.CIR_QTY;
                                record.CIR_QTY -= reduction;
                                excessToRemove -= reduction;

                                console.log(`   Reduced UID ${record.UNIQUE_ID}: ${oldCIR} → ${record.CIR_QTY} (MIN=${record.MIN_ORD_QTY}, reduced ${reduction})`);

                                // Verify constraint
                                if (record.CIR_QTY < record.MIN_ORD_QTY) {
                                    console.log(`  ERROR: Went below MIN!`);
                                }
                            }

                            //  Verify final total
                            const newTotal = weekInfo.records.reduce((sum, r) => sum + r.CIR_QTY, 0);
                            console.log(` After reduction: CIR=${newTotal}, Demand=${weekInfo.demand}, Remaining excess=${excessToRemove}`);

                            if (newTotal !== weekInfo.demand && excessToRemove > 0) {
                                if(newTotal < weekInfo.demand){
                                bExtraForecast = true;
                                }
                                console.log(` Could not reduce to exact demand (${excessToRemove} units remain above MIN)`);
                            }
                        } 
                        else if(weekInfo.demand > 0 && weekInfo.totalCIR < weekInfo.demand){
                            let increaseNeeded = parseFloat(weekInfo.demand) - parseFloat(weekInfo.totalCIR);
                            console.log(`  CIR is below demand by ${increaseNeeded}. Distributing prorately across ${weekInfo.records.length} records.`);

                            const records = weekInfo.records;
                            if (records.length === 0) return;

                            let remaining = increaseNeeded;
                            records.forEach((record, index) => {
                                let addQty;
                                if (index === records.length - 1) {
                                    addQty = remaining;
                                } else {
                                    const proportion = weekInfo.totalCIR > 0
                                        ? record.CIR_QTY / weekInfo.totalCIR
                                        : 1 / records.length;
                                    addQty = Math.floor(increaseNeeded * proportion);
                                }
                                const oldCIR = record.CIR_QTY;
                                record.CIR_QTY += addQty;
                                remaining -= addQty;
                                console.log(`   Increased UID ${record.UNIQUE_ID}: ${oldCIR} → ${record.CIR_QTY} (added ${addQty})`);
                            });
                        }
                        else {
                            console.log(` Within demand`);
                        }
                    });

                    return bExtraForecast;
                }

            // }
            // else{
            //      oReturn.message ="Forecast Orders Consumption failed for Location Product: " + aData.LOCATION_ID +" "+ aData.PRODUCT_ID;
            // }
        }
        else{
             oReturn.message ="Forecast Orders Consumption failed for Location Product: " + aData.LOCATION_ID +" "+ aData.PRODUCT_ID;
        }
        return oReturn;
    }

    // async consumptionOfFO_New(aData, req) {
    //     let aProductionOrder = await cds.run(`SELECT LOCATION_ID,PRODUCT_ID,PRPID,MAT_AVAILDATE,SUM(ORD_QTY) AS ORD_QTY,SUM(ORD_QTY) AS MODIFIED_ORD_QTY,
    //     0 AS "CURRENT_PRPID" FROM "V_PROD_PRPID"
    //     WHERE LOCATION_ID = '${aData.LOCATION_ID}' AND PRODUCT_ID = '${aData.PRODUCT_ID}'
    //     GROUP BY LOCATION_ID,PRODUCT_ID,PRPID,MAT_AVAILDATE 
    //     ORDER BY PRPID,MAT_AVAILDATE`);

    //     // aProductionOrder = aProductionOrder.filter(a=>a.PRPID == 38130 && a.MAT_AVAILDATE =='2026-02-23');
    //     let oReturn = {
    //         bError: false,
    //         message: ''
    //     };
    //     oReturn.message = "Successfully Completed Forecast Orders Consumption for Location Product: " + aData.LOCATION_ID +" "+ aData.PRODUCT_ID;
    //     // if (aProductionOrder.length > 0) {

    //         let aForecast = await cds.run(`WITH UID_PID AS
    //                                             (
    //                                                 SELECT DISTINCT 
    //                                                     UNIQUE_ID,
    //                                                     CLUSTER.PRPID,
    //                                                     V_SALES_H.PRODUCT_ID,
    //                                                     V_SALES_H.LOCATION_ID
    //                                                 FROM 
    //                                                     "V_SALES_H"
    //                                                     INNER JOIN
    //                                                     "CP_CLUSTER_PRPIDS_MAPPED_PIDS" AS CLUSTER
    //                                                     ON V_SALES_H.LOCATION_ID = CLUSTER.LOCATION_ID
    //                                                         AND V_SALES_H.PRODUCT_ID = CLUSTER.PRODUCT_ID
    //                                                         AND V_SALES_H.PRIMARY_ID = CLUSTER.PID
    //                                                 WHERE V_SALES_H.LOCATION_ID = '${aData.LOCATION_ID}'
    //                                                     AND V_SALES_H.PRODUCT_ID = '${aData.PRODUCT_ID}'
    //                                             ),
    //                                                V_PROD AS (
    //                                                 SELECT 
    //                                                     LOCATION_ID,
    //                                                     PRODUCT_ID,
    //                                                     UNIQUE_ID,
    //                                                     MAT_AVAILDATE,
    //                                                     SUM(ORD_QTY) AS TOTAL_ORD_QTY
    //                                                 FROM "V_PROD_PRPID"
    //                                                 WHERE LOCATION_ID = '${aData.LOCATION_ID}' AND PRODUCT_ID = '${aData.PRODUCT_ID}'
    //                                                 GROUP BY LOCATION_ID, PRODUCT_ID, UNIQUE_ID,MAT_AVAILDATE
    //                                             )
    //                                             SELECT 
    //                                                 CIR.LOCATION_ID,
    //                                                 CIR.PRODUCT_ID,
    //                                                 CIR.UNIQUE_ID,
    //                                                 UID.PRPID,
    //                                                 CIR.WEEK_DATE,
    //                                                 CIR.CIR_ID,
    //                                                  NULLIF(SUM(CIR.PRODORD_QTY), NULL) AS PRODORD_QTY,
    //                                                 SUM(CIR.CIR_QTY) AS CIR_QTY,
    //                                                 COALESCE(MAX(V_PROD.TOTAL_ORD_QTY), 0) AS MIN_ORD_QTY
    //                                             FROM 
    //                                                 "CP_CIR_GENERATED" AS 
    //                                             CIR
    //                                                 INNER JOIN
    //                                                 UID_PID AS UID
    //                                                 ON UID.LOCATION_ID = CIR.LOCATION_ID
    //                                                     AND UID.PRODUCT_ID = CIR.PRODUCT_ID
    //                                                     AND UID.UNIQUE_ID = CIR.UNIQUE_ID
    //                                             LEFT JOIN V_PROD
    //                                                 ON V_PROD.LOCATION_ID = CIR.LOCATION_ID
    //                                                 AND V_PROD.PRODUCT_ID = CIR.PRODUCT_ID
    //                                                 AND V_PROD.UNIQUE_ID = CIR.UNIQUE_ID
    //                                                 AND  V_PROD.MAT_AVAILDATE = CIR.WEEK_DATE
    //                                             WHERE  CIR.LOCATION_ID='${aData.LOCATION_ID}' AND CIR.PRODUCT_ID = '${aData.PRODUCT_ID}'
    //                                             	AND MODEL_VERSION ='${aData.MODEL_VERSION}' AND VERSION ='${aData.VERSION}' AND SCENARIO='${aData.SCENARIO}'
    //                                             GROUP BY 
    //                                                 CIR.LOCATION_ID,
    //                                                 CIR.PRODUCT_ID,
    //                                                 CIR.UNIQUE_ID,
    //                                                 UID.PRPID,
    //                                                 CIR.WEEK_DATE,
    //                                                 CIR.CIR_ID,
    //                                                 CIR.PRODORD_QTY`)
    //         if (aForecast.length > 0) {
    //             var aDistance = await cds.run(`SELECT DISTINCT
    //                                                 "PRP_PID_1",
    //                                                 "PRP_PID_2",
    //                                                 "DISTANCE"
    //                                             FROM "CP_PRPIDS_DISTANCES"
    //                                             WHERE  LOCATION_ID = '${aData.LOCATION_ID}' AND PRODUCT_ID = '${aData.PRODUCT_ID}'
    //                                             ORDER BY "PRP_PID_1", "PRP_PID_2","DISTANCE"`);
    //             let oForecast = {}, oDistance = {};
    //             if (aDistance.length > 0) {
    //                 for (let d = 0; d < aDistance.length; d++) {
    //                     oDistance[aDistance[d].PRP_PID_1] ??= []
    //                     oDistance[aDistance[d].PRP_PID_1].push({
    //                         "NEAREST_PRPID": aDistance[d].PRP_PID_2,
    //                         "DISTANCE": aDistance[d].DISTANCE
    //                     })

    //                 }
    //             }
    //             for (let f = 0; f < aForecast.length; f++) {
    //                 let el = aForecast[f];
    //                 oForecast[el.PRPID] ??= {};
    //                 oForecast[el.PRPID][el.WEEK_DATE] ??= {}

    //                 oForecast[el.PRPID][el.WEEK_DATE][el.UNIQUE_ID] ??= {};
    //                 oForecast[el.PRPID][el.WEEK_DATE]['QTY'] ??= 0;
    //                 oForecast[el.PRPID][el.WEEK_DATE]['TOTAL_ORD_QTY'] ??= 0;

    //                 oForecast[el.PRPID][el.WEEK_DATE][el.UNIQUE_ID] = {
    //                     "CIR_QTY": el.CIR_QTY,
    //                     "CIR_ID": el.CIR_ID,
    //                     "MIN_ORD_QTY": el.MIN_ORD_QTY,
    //                     "OLD_CIR_QTY": el.CIR_QTY,
    //                     "PRODORD_QTY":el.PRODORD_QTY
    //                 };
    //                 oForecast[el.PRPID][el.WEEK_DATE]['QTY'] += el.CIR_QTY;
    //                 oForecast[el.PRPID][el.WEEK_DATE]['TOTAL_ORD_QTY'] += el.MIN_ORD_QTY;

    //                 oForecast[el.PRPID]['CONSUMED'] = false;
    //                 oForecast[el.PRPID][el.WEEK_DATE]['MODIFIED'] = false;
    //             }

    //             //Below function adds qty of missing UID's in CIR from sales
    //             await addMissingQty(oForecast, aData, aProductionOrder);
    //             var bCIRProcessing = false;
    //             var aTemp = [];
    //             await consumeProductionOrders(aProductionOrder, oForecast, oDistance,oReturn);

    //             async function consumeProductionOrders(aProductionOrder, oForecast, oDistance,oReturn) {
    //                 console.log("total aProductionOrder", aProductionOrder.length);
    //                 for (let i = 0; i < aProductionOrder.length; i++) {
    //                     console.log("current aProductionOrder", i);
    //                     let el = aProductionOrder[i];
    //                     if (oForecast[el.PRPID] && oForecast[el.PRPID][el.MAT_AVAILDATE]) {//exists in forecast
    //                         const cirObj = validateQty(oForecast[el.PRPID][el.MAT_AVAILDATE]);
    //                         if (cirObj) {//Forecast < Production orders
    //                             /*
    //                             1.Get Nearest PRPID based on Distance
    //                             2.Using the PRPID from above,oForecast -> keep MIN_ORD_QTY and subtract from CIR_QTY of PRPID 
    //                             3.The quantity should be sent to Prorate 
    //                             */
    //                             if (oDistance[el.PRPID]) {
    //                                 if (el.CURRENT_PRPID == oDistance[el.PRPID][oDistance[el.PRPID].length - 1]['NEAREST_PRPID']) {//last nearest PRPID,stop processing
    //                                     aTemp.push(el);
    //                                     oForecast[el.PRPID]['CONSUMED'] = true;
    //                                     el.MODIFIED_ORD_QTY = 0;
    //                                     el['TYPE'] = 'LAST_PRPID';
    //                                     continue;
    //                                 }
    //                                 let aReqQty = findQty(oForecast[el.PRPID][el.MAT_AVAILDATE]);
    //                                 if (aReqQty <= 0) {
    //                                     continue;
    //                                 }
    //                                 const obj = nearestPRPID(oDistance[el.PRPID], oForecast);
    //                                 //Nearest PRPID Found, comsume from it

    //                                 if (obj == null) {//No valid nearest cluster,move it for next processing
    //                                     aTemp.push(el);
    //                                     oForecast[el.PRPID]['CONSUMED'] = true;
    //                                     el.MODIFIED_ORD_QTY = 0;
    //                                     el['TYPE'] = 'NO_NEARBY_CLUSTER';
    //                                     continue;
    //                                 }
    //                                 el.CURRENT_PRPID = obj.NEAREST_PRPID;
    //                                 let aNearest = oForecast?.[obj.NEAREST_PRPID];
    //                                 if (aNearest) {
    //                                     bCIRProcessing = commonProcessLogicFn(aNearest, el, oForecast, obj.NEAREST_PRPID, aReqQty, bCIRProcessing);
    //                                 }
    //                             }
    //                             else {//Not found in Distances
    //                                 aTemp.push(el);
    //                                 oForecast[el.PRPID]['CONSUMED'] = true;
    //                                 el.MODIFIED_ORD_QTY = 0;
    //                                 el['TYPE'] = 'NOT_FOUND_IN_DISTANCE';
    //                                 continue;
    //                             }
    //                         }
    //                         else {
    //                             el.ORD_QTY = 0, el.MODIFIED_ORD_QTY = 0; // Making Production order qty as zero as forecast > Production orders
    //                             el['TYPE'] = 'FORECAST_GE_SALES';
    //                         }
    //                     }
    //                     else {//PRPID not found in Forecast, ignore it 
    //                         el.MODIFIED_ORD_QTY = 0;
    //                         el['TYPE'] = 'NOT_FOUND_IN_FORECAST';
    //                     }
    //                 }

    //                 //check to call recursive loop again
    //                 let aUnconsumedProdOrders = aProductionOrder.filter(p => p.MODIFIED_ORD_QTY != 0);
    //                 console.log("Unconsumed Orders:", aUnconsumedProdOrders.length);
    //                 if (aUnconsumedProdOrders.length > 0) {
    //                     await consumeProductionOrders(aUnconsumedProdOrders, oForecast, oDistance,oReturn)
    //                 }
    //                 else {//Consume based on PRPID Characteristics
    //                     await reProcess(aTemp, oForecast,oReturn);
    //                     async function reProcess(aTemp, oForecast,oReturn) {
    //                         if (aTemp.length > 0) {
    //                             for (var p = 0; p < aTemp.length; p++) {
    //                                 console.log("currentIndex - PRPID", p, aTemp[p].PRPID)
    //                                 aTemp[p].MODIFIED_ORD_QTY = aTemp[p].ORD_QTY;
    //                                 let aNearestData = await cds.run(
    //                                     `SELECT 
    //                             CP_UNIQUE_ID_ITEM.UNIQUE_ID AS PRPID,
    //                             COUNT(*) AS total
    //                         FROM 
    //                             CP_UNIQUE_ID_ITEM
    //                             INNER JOIN
    //                             "CP_UNIQUE_ID_HEADER"
    //                             ON CP_UNIQUE_ID_HEADER.UNIQUE_ID = CP_UNIQUE_ID_ITEM.UNIQUE_ID
    //                                 AND CP_UNIQUE_ID_HEADER.UID_TYPE = 'P'
    //                                                 WHERE 
    //                                                 ((CHAR_NUM, CHAR_VALUE) IN (SELECT DISTINCT 
    //                                                                                             A.CHAR_NUM,
    //                                                                                             A.CHAR_VALUE
    //                                                                                         FROM CP_UNIQUE_ID_ITEM AS A
    //                                                                                         INNER JOIN CP_SALES_HM AS B
    //                                                                                         ON A.UNIQUE_ID = B.PRIMARY_ID
    //                                                                                         AND B.PRODUCT_ID = '${aTemp[p].PRODUCT_ID}'
    //                                                                                     WHERE A.UNIQUE_ID = '${aTemp[p].PRPID}'
                                                                                            
    //                                                                                          ))
    //                                                     AND CP_UNIQUE_ID_ITEM.UNIQUE_ID <>'${aTemp[p].PRPID}'
    //                                                     GROUP BY CP_UNIQUE_ID_ITEM.UNIQUE_ID
    //                                                     ORDER BY COUNT(*) DESC `
    //                                 )
    //                                 if (aNearestData.length > 0) {
    //                                     outerLoop:
    //                                     for (var n = 0; n < aNearestData.length; n++) {
    //                                         if (oForecast[aNearestData[n].PRPID]) {
    //                                             const prpid = aNearestData[n].PRPID;
    //                                             const forecastByPrpid = oForecast[prpid];
    //                                             for (const d of Object.keys(forecastByPrpid)) {
    //                                                 //check if any QTY remains to consume

    //                                                 if (aTemp[p].MODIFIED_ORD_QTY != 0 && d != 'CONSUMED') {
    //                                                     let iForecastQty = oForecast[aNearestData[n].PRPID][d]['QTY'];
    //                                                     if (iForecastQty != 0) {
    //                                                         let aReqQty = iForecastQty - aTemp[p].MODIFIED_ORD_QTY;
    //                                                         if (aReqQty > 0) {
    //                                                             let iQty = aTemp[p].MODIFIED_ORD_QTY;
    //                                                             bCIRProcessing = commonProcessLogicFn(oForecast[aNearestData[n].PRPID], aTemp[p], oForecast, aNearestData[n].PRPID, iQty, bCIRProcessing);
    //                                                         }
    //                                                         else if (aReqQty < 0) {
    //                                                             let iQty = iForecastQty;
    //                                                             bCIRProcessing = commonProcessLogicFn(oForecast[aNearestData[n].PRPID], aTemp[p], oForecast, aNearestData[n].PRPID, iQty, bCIRProcessing);
    //                                                         }
    //                                                     }

    //                                                 }
    //                                                 if (aTemp[p].MODIFIED_ORD_QTY == 0) {
    //                                                     break outerLoop;
    //                                                 }


    //                                             }

    //                                         }
    //                                     }
    //                                 }
    //                             }

    //                             // let aCheck = aTemp.filter(p => p.MODIFIED_ORD_QTY != 0);
    //                             // if (aCheck.length > 0) {
    //                             //     await reProcess(aCheck, oForecast,oReturn)
    //                             // }
    //                             // else {
    //                                 await processCir(oForecast,oReturn);
    //                             // }

    //                     }
    //                         else {
    //                             await processCir(oForecast,oReturn);
    //                         }

    //                     }

    //                 }
    //             }
    //             async function addMissingQty(oForecast, aData, aProductionOrder) {
    //                 let aProductionOrderDetailed = await cds.run(`
    //                             SELECT 
    //                                 LOCATION_ID,
    //                                 PRODUCT_ID,
    //                                 PRPID,
    //                                 UNIQUE_ID,
    //                                 MAT_AVAILDATE,
    //                                 SUM(ORD_QTY) AS ORD_QTY
    //                             FROM "V_PROD_PRPID"
    //                             WHERE LOCATION_ID = '${aData.LOCATION_ID}' 
    //                                 AND PRODUCT_ID = '${aData.PRODUCT_ID}'
    //                             GROUP BY LOCATION_ID, PRODUCT_ID, PRPID, UNIQUE_ID, MAT_AVAILDATE
    //                             ORDER BY PRPID, MAT_AVAILDATE, UNIQUE_ID
    //                         `);

    //                 let aPlannedProdOrders = await cds.run(`SELECT UNIQUE_ID,WEEK_DATE,SUM(PRODORD_QTY) AS PRODORD_QTY FROM "V_PRODORD_QTY" 
    //                     WHERE LOCATION_ID = '${aData.LOCATION_ID}'  AND PRODUCT_ID = '${aData.PRODUCT_ID}'
    //                     AND WEEK_DATE >= CURRENT_DATE
    //                     GROUP BY UNIQUE_ID, WEEK_DATE
    //                     `);
                    
    //                 let oPlannedProdOrders ={};
    //                 if(aPlannedProdOrders.length >0){
    //                     for(let p = 0; p < aPlannedProdOrders.length ; p++){
    //                         let el =aPlannedProdOrders[p];
    //                         oPlannedProdOrders[el.UNIQUE_ID] ??={};
    //                         oPlannedProdOrders[el.UNIQUE_ID][el.WEEK_DATE] ??=0;
    //                         oPlannedProdOrders[el.UNIQUE_ID][el.WEEK_DATE] = el.PRODORD_QTY;
    //                     }
    //                 }

    //                 // Build a map of production order totals by PRPID + Date
    //                 const productionTotals = {};
    //                 aProductionOrder.forEach(po => {
    //                     const key = `${po.PRPID}|${po.MAT_AVAILDATE}`;
    //                     productionTotals[key] = po.ORD_QTY;
    //                 });

    //                 // Group by PRPID + Date to find missing quantities
    //                 const missingByDate = {};

    //                 aProductionOrderDetailed.forEach(po => {
    //                     const dateKey = `${po.PRPID}|${po.MAT_AVAILDATE}`;

    //                     if (!missingByDate[dateKey]) {
    //                         missingByDate[dateKey] = {
    //                             PRPID: po.PRPID,
    //                             MAT_AVAILDATE: po.MAT_AVAILDATE,
    //                             missingQty: 0,
    //                              missingUIDs: [],  
    //                             existingUIDs: [],
    //                             existingTotal: 0  //  Track existing MIN_ORD_QTY
    //                         };
    //                     }

    //                     // Check if this PRPID + Date exists in forecast
    //                     if (oForecast[po.PRPID] && oForecast[po.PRPID][po.MAT_AVAILDATE]) {
    //                         // Check if this specific UNIQUE_ID exists
    //                         if (!oForecast[po.PRPID][po.MAT_AVAILDATE][po.UNIQUE_ID]) {
    //                             // This UID is missing - add its quantity to the pool
    //                             missingByDate[dateKey].missingQty += po.ORD_QTY;
    //                             missingByDate[dateKey].missingUIDs.push({
    //                                     UID: po.UNIQUE_ID,
    //                                     PRODORD_QTY: oPlannedProdOrders[po.UNIQUE_ID]?.[po.MAT_AVAILDATE] || 0
    //                                 });
    //                         } else {
    //                             // This UID exists - track it as a recipient
    //                             missingByDate[dateKey].existingUIDs.push(po.UNIQUE_ID);
    //                             //  Track existing MIN_ORD_QTY
    //                             missingByDate[dateKey].existingTotal +=
    //                                 oForecast[po.PRPID][po.MAT_AVAILDATE][po.UNIQUE_ID].MIN_ORD_QTY || 0;
    //                         }
    //                     }
    //                 });

    //                 // Now distribute the missing quantities to existing UIDs
    //                 let totalDistributed = 0;

    //                 Object.values(missingByDate).forEach(dateInfo => {
    //                     if (dateInfo.missingQty > 0 && dateInfo.existingUIDs.length > 0) {
    //                         const dateKey = `${dateInfo.PRPID}|${dateInfo.MAT_AVAILDATE}`;
    //                         const expectedTotal = productionTotals[dateKey] || 0;

    //                         //  Calculate actual missing amount (difference between expected and existing)
    //                         const actualMissing = expectedTotal - dateInfo.existingTotal;

    //                         if (actualMissing <= 0) {
    //                             return;
    //                         }

    //                         //  Use actualMissing instead of all missing UIDs
    //                         const qtyToDistribute = Math.min(actualMissing, dateInfo.missingQty);
    //                         const qtyPerUID = Math.floor(qtyToDistribute / dateInfo.existingUIDs.length);
    //                         let remainder = qtyToDistribute - (qtyPerUID * dateInfo.existingUIDs.length);

    //                          //  Calculate total PRODORD_QTY from missing UIDs
    //                         const totalMissingProdOrdQty = dateInfo.missingUIDs.reduce((sum, m) => sum + m.PRODORD_QTY, 0);
    //                         const prodOrdQtyPerUID = Math.floor(totalMissingProdOrdQty / dateInfo.existingUIDs.length);
    //                         let prodOrdRemainder = totalMissingProdOrdQty - (prodOrdQtyPerUID * dateInfo.existingUIDs.length);


    //                         dateInfo.existingUIDs.forEach((uid, index) => {
    //                             const extraQty = (index === 0) ? qtyPerUID + remainder : qtyPerUID;
    //                             const extraProdOrdQty = (index === 0) ? prodOrdQtyPerUID + prodOrdRemainder : prodOrdQtyPerUID;
    //                             // Add to CIR_QTY, OLD_CIR_QTY, and MIN_ORD_QTY
    //                             [dateInfo.PRPID][dateInfo.MAT_AVAILDAToForecastE][uid].CIR_QTY += extraQty;
    //                             // oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE][uid].OLD_CIR_QTY += extraQty;
    //                             oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE][uid].MIN_ORD_QTY += extraQty;
    //                             //Add missing UID Production order qty to current Production order qty
    //                             oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE][uid].PRODORD_QTY = 
    //                             (oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE][uid].PRODORD_QTY || 0) + extraProdOrdQty;


    //                             // Update QTY and TOTAL_ORD_QTY for the date
    //                             oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE]['QTY'] += extraQty;
    //                             oForecast[dateInfo.PRPID][dateInfo.MAT_AVAILDATE]['TOTAL_ORD_QTY'] += extraQty;

    //                             totalDistributed += extraQty;


    //                         });
    //                     }
    //                 });

    //             }


    //             async function processCir(oForecast,oReturn) {

    //                 if (bCIRProcessing == true) {
    //                     var aCIRData = [];
    //                     for (const prpid in oForecast) {
    //                         const group = oForecast[prpid];
    //                         const seen = new Set();
    //                         for (const [weekDate, weekObj] of Object.entries(group)) {
    //                             if (weekDate === 'CONSUMED' || !weekObj || typeof weekObj !== "object") {
    //                                 continue;
    //                             }



    //                             for (const [UID, cirData] of Object.entries(weekObj)) {
    //                                 // Skip metadata and non-objects
    //                                 if (UID === 'QTY' || UID === 'MODIFIED' || UID === 'CONSUMED' || UID == 'TOTAL_ORD_QTY') {
    //                                     continue;
    //                                 }

    //                                 if (!cirData || typeof cirData !== "object") {
    //                                     continue;
    //                                 }

    //                                 const uniqueKey = `${prpid}|${weekDate}|${cirData.CIR_ID}|${UID}`;
    //                                 if (seen.has(uniqueKey)) continue;
    //                                 seen.add(uniqueKey);
    //                                 // if (!(cirData.CIR_QTY === 0 && cirData.OLD_CIR_QTY === 0)
    //                                 // ) {

    //                                     const oCIR = {
    //                                         LOCATION_ID: aData.LOCATION_ID,
    //                                         PRODUCT_ID: aData.PRODUCT_ID,
    //                                         WEEK_DATE: weekDate,
    //                                         MODEL_VERSION: aData.MODEL_VERSION,
    //                                         VERSION: aData.VERSION,
    //                                         SCENARIO: aData.SCENARIO,
    //                                         CIR_ID: cirData.CIR_ID,
    //                                         UNIQUE_ID: UID,
    //                                         // OLD_CIR_QTY: cirData.OLD_CIR_QTY
    //                                         CIR_QTY: cirData.CIR_QTY,
    //                                         // PRPID: prpid,
    //                                          MIN_ORD_QTY: cirData.MIN_ORD_QTY,
    //                                          PRODORD_QTY:cirData.PRODORD_QTY
    //                                     };

    //                                     aCIRData.push(oCIR);
    //                                 // }


    //                             }
    //                         }

    //                     }

    //                     if (aCIRData.length > 0) {

    //                         await comparewithProductDemand(aCIRData, aData);
    //                      for (let a = 0; a < aCIRData.length; a++) {
    //             aCIRData[a].ACTUAL_QTY = aCIRData[a].MIN_ORD_QTY;
    //             aCIRData[a].UNCONSUMED_FORECAST = aCIRData[a].CIR_QTY - aCIRData[a].MIN_ORD_QTY;

    //             //Calculate Open assembly
    //             aCIRData[a].PRODORD_QTY = aCIRData[a].PRODORD_QTY;
    //             aCIRData[a].OPEN_ASSEMBLY = aCIRData[a].CIR_QTY - aCIRData[a].PRODORD_QTY;
    //             delete aCIRData[a].MIN_ORD_QTY;
    //         }

            
    //                         const BATCH_SIZE = 5000; // Define batch size

    //                         // let aCIRArray = aCIRData.filter(f => f.OLD_CIR_QTY != f.CIR_QTY);
    //                         let aCIRArray = aCIRData;

                               

    //                         console.log(` Updating ${aCIRArray.length} records in database...`);

    //                         let updatedCount = 0;
                            
    //                         try {
    //                             for (let i = 0; i < aCIRArray.length; i += BATCH_SIZE) {
    //                                 const batch = aCIRArray.slice(i, i + BATCH_SIZE);

    //                                 try {
    //                                     let cqnQuery = { UPSERT: { into: { ref: ['CP_CIR_GENERATED'] }, entries: batch } };
    //                                     try {
    //                                         await cds.run(cqnQuery);
    //                                     } catch (e) {
    //                                         console.log('Error in upsert',i);
    //                                     }
    //                                     updatedCount += batch.length;
    //                                     console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} complete: ${updatedCount}/${aCIRArray.length}`);

    //                                 } catch (error) {
    //                                     console.log(`Error updating batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
    //                                 }
    //                             }

    //                             console.log(`Successfully updated ${updatedCount} records`);

    //                         } catch (error) {
    //                             console.log('Database update failed:', error);
    //                         }
    //                           console.log("All orders fulfilled")
    //                         return;
    //                         //Below code is only for testing 

    //                         // const reducedSum = aCIRreduced.reduce((sum, r) => sum + (r.OLD_CIR_QTY - r.CIR_QTY), 0);
    //                         // const increasedSum = aCIRincreased.reduce((sum, r) => sum + (r.CIR_QTY - r.OLD_CIR_QTY), 0);

    //                         // console.log('   Total Records:', aCIRData.length);
    //                         // console.log('   Reduced Records:', aCIRreduced.length);
    //                         // console.log('   Increased Records:', aCIRincreased.length);
    //                         // console.log('');
    //                         // console.log('   Total Reduced Amount:', reducedSum);
    //                         // console.log('   Total Increased Amount:', increasedSum);
    //                         // console.log('   Difference:', Math.abs(reducedSum - increasedSum));
    //                         // console.log('');
    //                         // console.log(reducedSum === increasedSum ? ' BALANCED' : ' IMBALANCED');

    //                         //#region Testing
    //                         //     console.log("Runnig test script")
    //                         //     let aTestSales = await cds.run(`SELECT 
    //                         //     "PRPID",
    //                         //     UNIQUE_ID,
    //                         //     MAT_AVAILDATE,
    //                         //     SUM(ORD_QTY) AS TOTAL_ORD_QTY
    //                         // FROM "V_PROD_PRPID"
    //                         // WHERE UPPER("PRODUCT_ID") = UPPER('LOCKFR')
    //                         // GROUP BY "PRPID", UNIQUE_ID,MAT_AVAILDATE
    //                         // ORDER BY "PRPID",MAT_AVAILDATE ASC`);

    //                         //     var aResults = [], aDeviations = [];
    //                         //     for (var s = 0; s < aTestSales.length; s++) {
    //                         //         let oEl = aTestSales[s];
    //                         //         let aRec = aCIRData.filter(f => f.WEEK_DATE == oEl.MAT_AVAILDATE && f.UNIQUE_ID == oEl.UNIQUE_ID &&
    //                         //             f.PRPID == oEl.PRPID)
    //                         //         if (aRec.length > 0) {
    //                         //             let iDiff = aRec[0].CIR_QTY - oEl.TOTAL_ORD_QTY;

    //                         //             if (iDiff < 0) {//not consumed
    //                         //                 let obj = Object.assign({}, oEl);
    //                         //                 obj.CIR_QTY = aRec[0].CIR_QTY;
    //                         //                 obj.OLD_CIR_QTY = aRec[0].OLD_CIR_QTY;
    //                         //                 obj.Difference = iDiff;
    //                         //                 aDeviations.push(obj);
    //                         //             }
    //                         //         }
    //                         //         else {
    //                         //             if (!oForecast[oEl.PRPID]?.[oEl.MAT_AVAILDATE]?.[oEl.UNIQUE_ID]) {
    //                         //                 aResults.push(oEl);
    //                         //             }
    //                         //         }

    //                         //     }

    //                         //     if (aDeviations.length > 0) {
    //                         //         console.log("Deviations exists")
    //                         //         const wb = XLSX.utils.book_new();
    //                         //         const wsReduced = XLSX.utils.json_to_sheet(aDeviations);
    //                         //         XLSX.utils.book_append_sheet(wb, wsReduced, 'Deviations');


    //                         //         // Write to workspace folder (not home directory)
    //                         //         const filepath = path.join(__dirname, 'Deviations.xlsx');
    //                         //         XLSX.writeFile(wb, filepath);
    //                         //         return;
    //                         //     }
                          


    //                         // const wb = XLSX.utils.book_new();


    //                         // const wtotal = XLSX.utils.json_to_sheet(aCIRData);
    //                         // XLSX.utils.book_append_sheet(wb, wtotal, 'Total');



    //                         //#endregion

    //                     }
    //                 }
    //                 else{
    //                     // oReturn.bError = true;
    //                     oReturn.message ="Forecast Orders Consumption failed for Location Product: " + aData.LOCATION_ID +" "+ aData.PRODUCT_ID;
    //                 }
    //             }
    //             function commonProcessLogicFn(aNearest, el, oForecast, NEAREST_PRPID, aReqQty, bCIRProcessing) {
    //                 const aForecastKeys = Object.keys(aNearest).filter(key => key !== 'QTY' && key != 'CONSUMED' && key != 'MODIFIED' && key != 'TOTAL_ORD_QTY');
    //                 // //Qty to Prorate for removal
    //                 let totalAllowableQty = 0;
    //                 const aPeriodData = [];

    //                 var iTotal = 0;
    //                 aForecastKeys.forEach((key) => {
    //                     const aForecastWeeks = Object.keys(aNearest[key]).filter(key => key !== 'QTY' && key != 'CONSUMED' && key != 'MODIFIED' && key != 'TOTAL_ORD_QTY');
    //                     aForecastWeeks.forEach((w) => {
    //                         let iAllowableQty = aNearest[key][w].CIR_QTY - aNearest[key][w].MIN_ORD_QTY;
    //                         if (iAllowableQty >= 0) {
    //                             iTotal += iAllowableQty;
    //                         }

    //                         if (iAllowableQty > 0) {
    //                             totalAllowableQty += iAllowableQty;
    //                             aPeriodData.push({
    //                                 UID: w,
    //                                 weekKey: key,
    //                                 allowableQty: iAllowableQty
    //                             });
    //                         }
    //                     })

    //                 });

    //                 if (iTotal == 0) {
    //                     oForecast[NEAREST_PRPID]['CONSUMED'] = true;
    //                 }
    //                 if (el.MODIFIED_ORD_QTY > 0 && aPeriodData.length > 0) {
    //                     let aCompareQty = Math.min(totalAllowableQty, aReqQty);
    //                     let actualTotalConsumed = prorateDataRemoval(aCompareQty, aPeriodData, oForecast, totalAllowableQty, NEAREST_PRPID)


    //                     bCIRProcessing = true; // Must update forecast orders
    //                     const actualAdded = prorateData(oForecast, el, actualTotalConsumed);
    //                     const unallocated = actualTotalConsumed - actualAdded;
    //                     if (unallocated > 0) {
    //                         let remainingToAddBack = unallocated;
    //                         aPeriodData.forEach((period, index) => {
    //                             if (remainingToAddBack <= 0) return;

    //                             let oElement = oForecast[NEAREST_PRPID][period.weekKey][period.UID];

    //                             let addBackQty;
    //                             if (index === aPeriodData.length - 1) {
    //                                 addBackQty = remainingToAddBack;
    //                             } else {
    //                                 const proportion = period.allowableQty / totalAllowableQty;
    //                                 addBackQty = Math.floor(unallocated * proportion);
    //                             }

    //                             oElement.CIR_QTY += addBackQty;
    //                             oForecast[NEAREST_PRPID][period.weekKey]['QTY'] += addBackQty;
    //                             remainingToAddBack -= addBackQty;

    //                         });
    //                     }

    //                     const prpData = oForecast[NEAREST_PRPID];
    //                     const hasUnmodified = Object.values(prpData).some(
    //                         d => d && typeof d === "object" && d.MODIFIED === false
    //                     );
    //                     oForecast[NEAREST_PRPID]['CONSUMED'] = !hasUnmodified;

    //                     const cirObj = validateQty(oForecast[el.PRPID][el.MAT_AVAILDATE]);
    //                     if (!cirObj) {  // Whole consumption done
    //                         el.MODIFIED_ORD_QTY = 0;
    //                         el['TYPE'] = 'CONSUMPTION_COMPLETE';
    //                     } else {// Unconsumed quantity remains
    //                         let remainingGap = findQty(oForecast[el.PRPID][el.MAT_AVAILDATE]);
    //                         if (remainingGap <= 0) {
    //                             el.MODIFIED_ORD_QTY = 0;
    //                             el['TYPE'] = 'CONSUMPTION_COMPLETE';
    //                         } else { // Still needs more
    //                             el.MODIFIED_ORD_QTY = remainingGap;
    //                         }
    //                     }

    //                 }
    //                 return bCIRProcessing;
    //             }
    //             function validateQty(obj) {
    //                 let foundCir = null;

    //                 const cirObj = obj;

    //                 for (const [UID, cirData] of Object.entries(cirObj)) {
    //                     if (typeof cirData != "object") {
    //                         continue;
    //                     }
    //                     if (cirData.CIR_QTY === 0 && cirData.OLD_CIR_QTY === 0 && cirData.MIN_ORD_QTY == 0) {
    //                         continue;
    //                     }

    //                     // check change condition
    //                     if (
    //                         cirData.MIN_ORD_QTY > cirData.CIR_QTY
    //                     ) {
    //                         foundCir = {
    //                             UNIQUE_ID: UID,
    //                             ...cirData
    //                         };
    //                         break;
    //                     }
    //                 }
    //                 return foundCir;
    //             }

    //             function findQty(data) {
    //                 let totalGap = 0;

    //                 for (const [key, value] of Object.entries(data)) {
    //                     // Skip metadata keys
    //                     if (key === 'QTY' || key === 'TOTAL_ORD_QTY' || key === 'MODIFIED') {
    //                         continue;
    //                     }

    //                     // Check if this is a valid UID object
    //                     if (value && typeof value === 'object' && 'MIN_ORD_QTY' in value) {
    //                         const minOrderQty = value.MIN_ORD_QTY || 0;
    //                         const cirQty = value.CIR_QTY || 0;

    //                         //  Only count positive gaps (UIDs below MIN)
    //                         if (minOrderQty > 0) {
    //                             const gap = minOrderQty - cirQty;
    //                             if (gap > 0) {  //  Only add if CIR_QTY < MIN_ORD_QTY
    //                                 totalGap += gap;
    //                             }
    //                         }
    //                     }
    //                 }

    //                 return totalGap;
    //             }
    //             function prorateData(oForecast, el, iConsumptionQty) {
    //                 const dateData = oForecast[el.PRPID][el.MAT_AVAILDATE];

    //                 if (!dateData) {
    //                     return 0;
    //                 }

    //                 const aForecastKeys = Object.keys(dateData)
    //                     .filter(key => key !== 'QTY' && key !== 'CONSUMED' && key !== 'MODIFIED' && key != 'TOTAL_ORD_QTY');

    //                 // Separate UIDs into two groups
    //                 const uidsBelowMin = [];
    //                 const uidsAtOrAboveMin = [];

    //                 aForecastKeys.forEach(key => {
    //                     const currentCIR = dateData[key].CIR_QTY;
    //                     const minOrderQty = dateData[key].MIN_ORD_QTY || 0;

    //                     if (minOrderQty > 0 && currentCIR < minOrderQty) {
    //                         uidsBelowMin.push({
    //                             key: key,
    //                             currentCIR: currentCIR,
    //                             minOrderQty: minOrderQty,
    //                             gap: minOrderQty - currentCIR
    //                         });
    //                     } else {
    //                         uidsAtOrAboveMin.push({
    //                             key: key,
    //                             currentCIR: currentCIR,
    //                             minOrderQty: minOrderQty
    //                         });
    //                     }
    //                 });

    //                 //  Sort UIDs below MIN by gap size (biggest first)
    //                 uidsBelowMin.sort((a, b) => b.gap - a.gap);

    //                 let remainingQty = iConsumptionQty;
    //                 let totalAdded = 0;

    //                 // Fill UIDs below MIN first (up to their MIN)
    //                 uidsBelowMin.forEach(uid => {
    //                     if (remainingQty <= 0) return;

    //                     const toAdd = Math.min(remainingQty, uid.gap);

    //                     dateData[uid.key].CIR_QTY = uid.currentCIR + toAdd;
    //                     dateData[uid.key].MODIFIED_IN_THIS_RUN = true;

    //                     totalAdded += toAdd;
    //                     remainingQty -= toAdd;

    //                 });

    //                 //  Distribute remaining to UIDs at/above MIN (or no MIN)
    //                 if (remainingQty > 0 && uidsAtOrAboveMin.length > 0) {

    //                     const totalCIR = uidsAtOrAboveMin.reduce((sum, uid) => sum + uid.currentCIR, 0);

    //                     uidsAtOrAboveMin.forEach((uid, index) => {
    //                         if (remainingQty <= 0) return;

    //                         let allocatedQty;

    //                         if (index === uidsAtOrAboveMin.length - 1) {
    //                             allocatedQty = remainingQty;
    //                         } else {
    //                             const proportion = totalCIR > 0 ? uid.currentCIR / totalCIR : (1 / uidsAtOrAboveMin.length);
    //                             allocatedQty = Math.floor(remainingQty * proportion);
    //                             remainingQty -= allocatedQty;
    //                         }

    //                         const newCIR = uid.currentCIR + allocatedQty;

    //                         // Check MIN cap
    //                         if (uid.minOrderQty > 0 && newCIR > uid.minOrderQty) {
    //                             dateData[uid.key].CIR_QTY = uid.minOrderQty;
    //                             const actualAdded = uid.minOrderQty - uid.currentCIR;
    //                             totalAdded += actualAdded;
    //                             remainingQty += (allocatedQty - actualAdded);  // Put overflow back
    //                         } else {
    //                             dateData[uid.key].CIR_QTY = newCIR;
    //                             totalAdded += allocatedQty;
    //                         }

    //                         dateData[uid.key].MODIFIED_IN_THIS_RUN = true;
    //                     });
    //                 }

    //                 dateData['QTY'] += totalAdded;
    //                 dateData['MODIFIED'] = true;

    //                 return totalAdded;
    //             }

    //             function prorateDataRemoval(aCompareQty, aPeriodData, oForecast, totalAllowableQty, NEAREST_PRPID) {
    //                 // Prorate removal across all periods
    //                 let remainingToConsume = aCompareQty;
    //                 let actualTotalConsumed = 0;

    //                 aPeriodData.forEach((period, index) => {
    //                     let consumedQty;

    //                     if (index === aPeriodData.length - 1) {
    //                         // Last entry gets remainder
    //                         consumedQty = remainingToConsume;
    //                     } else {
    //                         // Prorate based on proportion
    //                         let proportion = 0;
    //                         if (totalAllowableQty > 0) {
    //                             proportion = period.allowableQty / totalAllowableQty;
    //                         }
    //                         consumedQty = Math.floor(aCompareQty * proportion);
    //                     }
    //                     let oElement = oForecast[NEAREST_PRPID][period.weekKey][period.UID];
    //                     const currentCIR = oElement.CIR_QTY;
    //                     const minOrderQty = oElement.MIN_ORD_QTY;

    //                     const maxConsumable = Math.max(0, currentCIR - minOrderQty);
    //                     const actualConsumedQty = Math.min(consumedQty, maxConsumable);

    //                     actualTotalConsumed += actualConsumedQty;

    //                     // Update remaining for next iteration
    //                     if (index !== aPeriodData.length - 1) {
    //                         remainingToConsume -= actualConsumedQty;
    //                     }


    //                     if (actualConsumedQty > 0) {
    //                         oElement.CIR_QTY -= actualConsumedQty;
    //                         oElement.MODIFIED_IN_THIS_RUN = true;


    //                         // Verify it didn't go below MIN_ORD_QTY
    //                         // if (oElement.CIR_QTY < minOrderQty) {
    //                         //     debugger;
    //                         // }

    //                         //Refresh forecast
    //                         oForecast[NEAREST_PRPID][period.weekKey]['QTY'] -= actualConsumedQty;

    //                         oForecast[NEAREST_PRPID][period.weekKey]['MODIFIED'] = true;
    //                     }

    //                     // 
    //                 }
    //                 );
    //                 return actualTotalConsumed;
    //             }

    //             function nearestPRPID(aInput, oForecast) {
    //                 let minRow = null;
    //                 let minDist = Infinity;

    //                 for (const row of aInput) {
    //                     // Skip if PRPID not present in forecast or  its consumed already
    //                     if (!oForecast[row.NEAREST_PRPID]) {
    //                         continue;
    //                     }

    //                     if (oForecast[row.NEAREST_PRPID].CONSUMED === true) {
    //                         continue;
    //                     }

    //                     if (row.DISTANCE < minDist) {
    //                         minDist = row.DISTANCE;
    //                         minRow = row;
    //                     }
    //                 }
    //                 return minRow;
    //             }

    //             async function comparewithProductDemand(aCIRData, aData) {
    //                 let aProdDemand = await cds.run(`
    //     SELECT DISTINCT
    //         "WEEK_DATE",
    //         "QUANTITY"
    //     FROM "CP_IBP_FUTUREDEMAND"
    //     WHERE "PRODUCT_ID" = '${aData.PRODUCT_ID}' 
    //         AND LOCATION_ID = '${aData.LOCATION_ID}'
    // `);

    //                 // Build demand lookup
    //                 const demandLookup = {};
    //                 aProdDemand.forEach(demand => {
    //                     demandLookup[demand.WEEK_DATE] = demand.QUANTITY;
    //                 });

    //                 // Group CIR data by week
    //                 const weeklyData = {};
    //                 aCIRData.forEach(record => {
    //                     const week = record.WEEK_DATE;

    //                     if (!weeklyData[week]) {
    //                         weeklyData[week] = {
    //                             records: [],
    //                             totalCIR: 0,
    //                             demand: demandLookup[week] || 0
    //                         };
    //                     }

    //                     weeklyData[week].records.push(record);
    //                     weeklyData[week].totalCIR += record.CIR_QTY;
    //                 });

    //                 // Process each week that exceeds demand
    //                 Object.keys(weeklyData).forEach(week => {
    //                     const weekInfo = weeklyData[week];

    //                     console.log(`\n Week ${week}: CIR=${weekInfo.totalCIR}, Demand=${weekInfo.demand}`);

    //                     if (weekInfo.totalCIR > weekInfo.demand && weekInfo.demand > 0) {
    //                         let excessToRemove = weekInfo.totalCIR - weekInfo.demand;

    //                         console.log(`  Need to remove ${excessToRemove} units`);

    //                         //  Get records with CIR_QTY > MIN_ORD_QTY, sorted by CIR_QTY ascending
    //                         const reducibleRecords = weekInfo.records
    //                             .filter(record => record.CIR_QTY > record.MIN_ORD_QTY)
    //                             .sort((a, b) => a.CIR_QTY - b.CIR_QTY); //  Ascending order

    //                         if (reducibleRecords.length === 0) {
    //                             console.log(` Cannot reduce - all records at MIN_ORD_QTY`);
    //                             return;
    //                         }

    //                         console.log(`   Found ${reducibleRecords.length} reducible records`);

    //                         //  Subtract from each record until excess is removed
    //                         for (const record of reducibleRecords) {
    //                             if (excessToRemove <= 0) break;

    //                             const maxCanReduce = record.CIR_QTY - record.MIN_ORD_QTY;
    //                             const reduction = Math.min(maxCanReduce, excessToRemove);

    //                             const oldCIR = record.CIR_QTY;
    //                             record.CIR_QTY -= reduction;
    //                             excessToRemove -= reduction;

    //                             console.log(`   Reduced UID ${record.UNIQUE_ID}: ${oldCIR} → ${record.CIR_QTY} (MIN=${record.MIN_ORD_QTY}, reduced ${reduction})`);

    //                             // Verify constraint
    //                             if (record.CIR_QTY < record.MIN_ORD_QTY) {
    //                                 console.log(`  ERROR: Went below MIN!`);
    //                             }
    //                         }

    //                         //  Verify final total
    //                         const newTotal = weekInfo.records.reduce((sum, r) => sum + r.CIR_QTY, 0);
    //                         console.log(` After reduction: CIR=${newTotal}, Demand=${weekInfo.demand}, Remaining excess=${excessToRemove}`);

    //                         if (newTotal !== weekInfo.demand && excessToRemove > 0) {
    //                             console.log(` Could not reduce to exact demand (${excessToRemove} units remain above MIN)`);
    //                         }
    //                     } else {
    //                         console.log(` Within demand`);
    //                     }
    //                 });

    //                 return aCIRData;
    //             }

    //         }
    //     // }
    //     return oReturn;
    // }

    // // // Function to get Closest Cluster for a Primary Id
    // // async getNearestCluster(aData, aCIRData) {
    // //     let aPRPIDS_DISTANCES = [];
    // //     let aClusterId = [];
    // //     let iReqQty = 0;

    // //     // aClusterId = await cds.run(`SELECT DISTINCT PRPID, 
    // //     //                                            0 AS DISTANCE,
    // //     //                                            CLUSTER_ID
    // //     //                              FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS
    // //     //                             WHERE LOCATION_ID = '${aData.LOCATION_ID}'
    // //     //                               AND PRODUCT_ID = '${aData.PRODUCT_ID}'
    // //     //                               AND PRPID = '${aData.PRIMARY_ID}'`);

    // //     // aPRPIDS_DISTANCES = await cds.run(`SELECT DISTINCT 
    // //     //                                         A.PRP_PID_2 AS PRPID,
    // //     //                                         A.DISTANCE,
    // //     //                                         B.CLUSTER_ID
    // //     //                                     FROM 
    // //     //                                         CP_PRPIDS_DISTANCES AS A
    // //     //                                         INNER JOIN
    // //     //                                         CP_CLUSTER_PRPIDS_MAPPED_PIDS AS B
    // //     //                                         ON B.LOCATION_ID = A.LOCATION_ID
    // //     //                                             AND B.PRODUCT_ID = A.PRODUCT_ID
    // //     //                                             AND B.PRPID = A.PRP_PID_2
    // //     //                                     WHERE A.LOCATION_ID = '${aData.LOCATION_ID}'
    // //     //                                         AND A.PRODUCT_ID = '${aData.PRODUCT_ID}'
    // //     //                                         AND A.PRP_PID_1 = '${aData.PRIMARY_ID}'
    // //     //                                     ORDER BY DISTANCE ASC`);

    // //     // aPRPIDS_DISTANCES = [...aClusterId, ...aPRPIDS_DISTANCES];

    // //     aPRPIDS_DISTANCES = await cds.run(`SELECT DISTINCT A.PRPID, 
    // //                                                        A.CLUSTER_ID,
    // //                                                        B.TARGET_CLUSTER_ID,
    // //                                                        B.DISTANCE
    // //                                         FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS AS A
    // //                                         INNER JOIN CP_AHC_CLUSTER_DISTANCES AS B
    // //                                            ON A.LOCATION_ID = B.LOCATION_ID
    // //                                           AND A.PRODUCT_ID = B.PRODUCT_ID
    // //                                           AND A.CLUSTER_ID = B.TARGET_CLUSTER_ID
    // //                                         WHERE  A.LOCATION_ID = '${aData.LOCATION_ID}'
    // //                                           AND  A.PRODUCT_ID = '${aData.PRODUCT_ID}'
    // //                                           AND  B.SOURCE_CLUSTER_ID IN (SELECT DISTINCT CLUSTER_ID FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS
    // //                                                                                             WHERE LOCATION_ID = '${aData.LOCATION_ID}'
    // //                                                                                             AND PRODUCT_ID = '${aData.PRODUCT_ID}'
    // //                                                                                             AND PRPID = '${aData.PRIMARY_ID}')
    // //                                         ORDER BY B.DISTANCE`);

    // //     if (aPRPIDS_DISTANCES.length > 0) {

    // //         for (let i = 0; i < aPRPIDS_DISTANCES.length; i++) {
    // //             iReqQty = await this.getNearestUniqueIds(aData, aCIRData, aPRPIDS_DISTANCES[i].PRPID);
    // //             if (iReqQty === 0) {
    // //                 break;
    // //             }
    // //             // iReqQty = await this.getNearestPrimaryIds(aData, aCIRData, aPRPIDS_DISTANCES[i]);
    // //             // if(iReqQty === 0) {
    // //             //     break;
    // //             // }
    // //         }
    // //         //  When no clusters are generated
    // //     } else {
    // //         iReqQty = await this.getNearestUniqueIds(aData, aCIRData, 0);
    // //     }
    // //     // return aPRPIDS_DISTANCES;
    // //     return aCIRData;
    // // }


    // After generation of Forecast Orders - Predictions are cleared to handle delta changes
    async refreshPredictions(aData, req) {
        // Remove Predictions Data for Selected WeekDates
        await cds.run(`DELETE FROM "CP_TS_PREDICTIONS" 
                                  WHERE LOCATION_ID = '${aData.LOCATION_ID}' 
                                   AND PRODUCT_ID = '${aData.PRODUCT_ID}'
                                   AND VERSION = '${aData.VERSION}'
                                   AND SCENARIO = '${aData.SCENARIO}'                        
                                   AND CAL_DATE NOT IN (SELECT DISTINCT WEEK_DATE 
                                                          FROM CP_DEMAND_OPT_QUANTITY_DELTA
                                                        WHERE LOCATION_ID = '${aData.LOCATION_ID}'
                                                          AND PRODUCT_ID = '${aData.PRODUCT_ID}'
                                                          AND VERSION = '${aData.VERSION}'
                                                          AND SCENARIO = '${aData.SCENARIO}' )
                                   AND MODEL_VERSION = 'Active'`);
    }

    // Function to get cluster results / nearest unique ids  for specific location, product & unique id
    async getClusterResults(req, ORequest) {

        let baseUrl = req.headers['x-forwarded-proto'] + '://' + req.headers.host;  // Un-Comment while deploying
        console.log("Get Cluster Unique Ids");
        let sProfile = "SBP_AHC_3";
        // let baseUrl = 'http' + '://' + req.headers.host;
        let sUrl = baseUrl + '/pal/getClusterUniqueIDs';
        let sUniqueId = (ORequest.UNIQUE_ID).toString();

        const iCountUID = await cds.run(
            `SELECT DISTINCT COUNT("UNIQUE_ID") AS COUNT_UID
               FROM CP_CLUSTER_DATA
              WHERE LOCATION_ID = '${ORequest.LOCATION_ID}'
                AND PRODUCT_ID = '${ORequest.PRODUCT_ID}'`
        );

        // Based on Unique Id Count, profile is changed as per the test script config
        sProfile = GenF.getClusterProfile(iCountUID[0].COUNT_UID);

        // if(iCountUID[0].COUNT_UID < 10) {
        //   sProfile = "SBP_AHC_3";
        // } else {
        //   sProfile = "SBP_AHC_0";
        // }
        var auth = await GenF.getAuthorization();
        var options = {
            'method': 'POST',
            'url': sUrl,
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': auth
            },

            body: JSON.stringify({

                "Location": ORequest.LOCATION_ID,
                "Product": ORequest.PRODUCT_ID,
                "Profile": sProfile,
                "UniqueId": sUniqueId,
            })

        };

        let ret_response = [];
        await rp(options)
            .then(function (response) {
                const oResponse = JSON.parse(response);

                ret_response = oResponse.nearestsIDs;
            })
            .catch(function (error) {
                console.log('Get Cluster Unique Id - Error ', error);
                ret_response = JSON.parse(error);
            });

        // console.log(ret_response);
        return ret_response;
    }
   async genTimeseriesCust(adata, req, Flag) {
        let vCurrDate = GenF.getCurrentDate();
        let FlagTest = '';
        let oReturn = {
            bError: false,
            message: ''
        }

        let aTimeseriesCust = [];
        let aVCHistoryCust = [], oVCHistoryCust = {};
        var sError='';
        let hisWeek = adata.HistoryWeeks;

        const date = new Date();

        // subtract weeks
        const pastDate = subWeeks(date, parseInt(adata.HistoryWeeks));

        const year = getISOWeekYear(pastDate);
        const week = getISOWeek(pastDate);

        const yearWeek = `${year}${String(week).padStart(2, '0')}`;

        const cYear = getISOWeekYear(new Date());
         const Cweek = getISOWeek(new Date());
          const CurrentyearWeek = `${cYear}${String(Cweek).padStart(2, '0')}`;

        console.log(yearWeek);
        aTimeseriesCust = await cds.run(`SELECT LOCATION_ID,
                                                PRODUCT_ID,
                                                CUSTOMER_GROUP,
                                                PERIOD_NUM,
                                                GROUP_ID,
                                                TYPE,
                                                GROUP_COUNT,
                                                GROUP_COUNT_RATE
                                           FROM CV_TS_HIS_CUST_PAL
                                          WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                            AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                            AND CUSTOMER_GROUP IN  (SELECT CUSTOMER_GROUP from CP_CUSTOMERGROUP)
                                            AND TO_INTEGER(PERIOD_NUM) BETWEEN ${yearWeek} AND ${CurrentyearWeek}
                                            `);
                                            
    //                                         TO_INTEGER(
    //    TO_VARCHAR(YEAR(CURRENT_DATE)) || LPAD(WEEK(CURRENT_DATE), 2, '0'))
    //                                         `);
    // //                                          AND TO_INTEGER(PERIOD_NUM) <= TO_INTEGER(
    // //    TO_VARCHAR(YEAR(CURRENT_DATE)) || LPAD(WEEK(CURRENT_DATE), 2, '0'))
    // //                                         `);

        if (aTimeseriesCust.length > 0) {

            for (let i = 0; i < aTimeseriesCust.length; i++) {
                oVCHistoryCust = {};

                oVCHistoryCust.LOCATION_ID = aTimeseriesCust[i].LOCATION_ID;
                oVCHistoryCust.PRODUCT_ID = aTimeseriesCust[i].PRODUCT_ID;
                oVCHistoryCust.CUSTOMER_GROUP = aTimeseriesCust[i].CUSTOMER_GROUP;
                oVCHistoryCust.PERIOD_NUM = aTimeseriesCust[i].PERIOD_NUM;
                oVCHistoryCust.GROUP_ID = aTimeseriesCust[i].GROUP_ID;
                oVCHistoryCust.TYPE = aTimeseriesCust[i].TYPE;
                oVCHistoryCust.GROUP_COUNT = aTimeseriesCust[i].GROUP_COUNT;
                oVCHistoryCust.GROUP_COUNT_RATE = aTimeseriesCust[i].GROUP_COUNT_RATE;
                oVCHistoryCust.ROW = 0;
                oVCHistoryCust.ATTRIBUTE = 'NA';

                aVCHistoryCust.push(GenF.parse(oVCHistoryCust));

            }

            try {
                await cds.run(
                    `DELETE FROM CP_VC_HISTORY_TS_CUST
                              WHERE LOCATION_ID    = '${adata.LOCATION_ID}'
                                AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
                                AND CUSTOMER_GROUP  IN  (SELECT CUSTOMER_GROUP from CP_CUSTOMERGROUP)
                                AND TYPE            = 'PI'`);
            }
            catch (e) {
                console.log(e);
                oReturn.bError = true;
                oReturn.message = 'Time Series History deletion Failed.Reason: '+e.message;
                sError+=oReturn.message;
            }
            try {

                // await INSERT(aVCHistoryCust).into('CP_VC_HISTORY_TS_CUST');
                await cds.run(
                                INSERT.into("CP_VC_HISTORY_TS_CUST").entries(aVCHistoryCust)
                                    );
                FlagTest = 'S';
            } catch (e) {
                FlagTest ='E';
                oReturn.bError = true;
                oReturn.message = 'Time Series History generation Failed.Reason: '+e.message;
                sError+=oReturn.message;
            }
        }
        else {
            FlagTest = 'W'
        }
             //Alert
        if(aTimeseriesCust.length >0){
                await GenF.sendTimeseriesAlert(aTimeseriesCust,req);
        }
        await GenF.logMessage(req, `Completed history timeseries`);


        if (FlagTest === 'S') {
            oReturn.bError = false;
            oReturn.message = 'Timeseries History generation is complete';
            // await GenF.jobSchMessage('X', "Timeseries History generation is complete", req);
        }
        else if (FlagTest === 'E') {
            oReturn.bError = true;
            oReturn.message = sError;
            // await GenF.jobSchMessage('', "Timeseries History generation failed", req);
        }
        else if (FlagTest === 'W') {
            let vWarmsg = "No Data to generate Timeseries History for  : " + adata.PRODUCT_ID;
            oReturn.bError = false;
            oReturn.message = vWarmsg;
        }
        else {
            const vMsg = "Timeseries generation for the product: " + adata.PRODUCT_ID + " is unsuccessful because of insufficient data";
            oReturn.bError = true;
            oReturn.message = vMsg;
            // await GenF.jobSchMessage('X', vMsg, req);
        }
        return oReturn;
    }

    async refreshZeroDemandData(adata, bProcess) {
        let aFutureDemand = [];
        let bFlag = false;
        const lDate = new Date();
        // Get Start date considering Firm Horizon        
        const lStartDate = new Date(
            lDate.getFullYear(),
            lDate.getMonth(),
            lDate.getDate() + (parseInt(await GenF.getParameterValue(adata.LOCATION_ID, 9)) * 7)
        );
        aFutureDemand = await cds.run(`SELECT * 
                                            FROM CP_IBP_FUTUREDEMAND
                                           WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                             AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                             AND VERSION = '${adata.VERSION}'
                                             AND SCENARIO = '${adata.SCENARIO}'
                                             AND QUANTITY > 0`);

        if (aFutureDemand.length === 0) {
            bProcess = false;

            // Delete Forcast Orders for the selection of location-product-version-scenario if demand is changed to zero           
            try {
                await cds.run(
                    `DELETE FROM CP_CIR_GENERATED
                      WHERE LOCATION_ID    = '${adata.LOCATION_ID}'
                        AND PRODUCT_ID     = '${adata.PRODUCT_ID}'
                        AND VERSION        = '${adata.VERSION}'                             
                        AND SCENARIO       = '${adata.SCENARIO}'    
                        AND MODEL_VERSION  = 'Active'    `);
                // AND WEEK_DATE      > '${lStartDate.toISOString().split("T")[0]}'


                bFlag = true;
            } catch (e) {
                GenF.log(`Forecast Orders : ${e}`);
            }

            // Delete Assembly Requirements for the selection of location-product-version-scenario if demand is changed to zero
            if (bFlag === true) {
                bFlag = false;
                try {
                    await DELETE.from('CP_ASSEMBLY_REQ')
                        .where(`LOCATION_ID = '${adata.LOCATION_ID}' 
                             AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                             AND TYPE = 'PI'
                             AND VERSION = '${adata.VERSION}'
                             AND SCENARIO = '${adata.SCENARIO}'`
                        )
                }
                catch (err) {
                    GenF.log(`Assembly Requirements: ${err.message}`);
                }

            }

        }

        return bProcess;
    }

    /**
   * Generate Timeseries for Planning Relevant Primary ID
   * @param {Order Count per week} lsOrdercount
   * @param {Planning Relevant Primary Ids} liPRPIDS
   */
    async processPRPIDsCust(lsOrdercount, aPRPIDs_PIDs, liVCHistory, oCharData) {
        let aVCHistory = [], aFilVCHistory = [], aFinVCHistory = [];
        let aLocProdPRPIDs = [];
        let aDistPRPIDs = [];
        let oVCHistory = {}, sGroup_Id = '';
        aVCHistory = liVCHistory;
        // Add new property 'FLAG' to array of objects
        aVCHistory = aVCHistory.map(function (obj) {
            return { ...obj, FLAG: false };
        });


        let ifindIndex = aPRPIDs_PIDs.findIndex(
            (o) =>
                o.PRODUCT_ID === lsOrdercount.PRODUCT_ID
        );
        aLocProdPRPIDs = aPRPIDs_PIDs[ifindIndex];

        for (let prop in aLocProdPRPIDs) {
            let sPPRID = prop;
            if (sPPRID !== 'PRODUCT_ID') {
                let aFilMappedPids = [];
                aFilMappedPids = aLocProdPRPIDs[sPPRID];

                oVCHistory["PERIOD_NUM"] = GenF.parse(lsOrdercount.WEEK_NO);
                // oVCHistory["LOCATION_ID"] = GenF.parse(lsOrdercount.LOCATION_ID);
                oVCHistory["PRODUCT_ID"] = GenF.parse(lsOrdercount.PRODUCT_ID);
                oVCHistory["TYPE"] = 'PI';
                oVCHistory["GROUP_ID"] = GenF.parse(sPPRID + "_1");

                for (let j = 0; j < aFilMappedPids.length; j++) {
                    sGroup_Id = GenF.parse(String(aFilMappedPids[j]) + "_1");

                    aFilVCHistory = aVCHistory.filter(function (aVCHist) {
                        return aVCHist.GROUP_ID === sGroup_Id;
                    });

                    for (let iHis = 0; iHis < aFilVCHistory.length; iHis++) {

                        let ifindIndex = aFinVCHistory.findIndex(
                            (o) =>
                                o.GROUP_ID === oVCHistory["GROUP_ID"] &&
                                o.ROW === aFilVCHistory[iHis].ROW &&
                                o.ATTRIBUTE === aFilVCHistory[iHis].ATTRIBUTE &&
                                o.CHAR_NUM === aFilVCHistory[iHis].CHAR_NUM
                        );

                        if (ifindIndex === -1) {
                            oVCHistory["LOCATION_ID"] = GenF.parse(aFilVCHistory[iHis].LOCATION_ID);
                            oVCHistory["CUSTOMER_GROUP"] = GenF.parse(aFilVCHistory[iHis].CUSTOMER_GROUP);
                            oVCHistory["ROW"] = aFilVCHistory[iHis].ROW;
                            oVCHistory["ATTRIBUTE"] = aFilVCHistory[iHis].ATTRIBUTE;
                            oVCHistory["CHAR_NUM"] = aFilVCHistory[iHis].CHAR_NUM;
                            // oVCHistory["CHAR_COUNT"] = aFilVCHistory[iHis].CHAR_COUNT;
                            // oVCHistory["CHAR_COUNT_RATE"] = 0;
                            oVCHistory["GROUP_COUNT"] = aFilVCHistory[iHis].GROUP_COUNT;
                            oVCHistory["GROUP_COUNT_RATE"] = 0;

                            oVCHistory["CHAR_COUNT"] = 0;
                            // if (sGroup_Id === oVCHistory["GROUP_ID"]) {
                            //     oVCHistory["CHAR_COUNT"] = aFilVCHistory[iHis].CHAR_COUNT;
                            //     oVCHistory["CHAR_COUNT_RATE"] = aFilVCHistory[iHis].CHAR_COUNT_RATE;
                            // } else {
                            //     oVCHistory["CHAR_COUNT"] = aFilVCHistory[iHis].CHAR_COUNT;
                            //     oVCHistory["CHAR_COUNT_RATE"] = 0;
                            // }
                            oVCHistory["CHAR_COUNT"] = oCharData[sPPRID][oVCHistory["PERIOD_NUM"]][oVCHistory["CHAR_NUM"]]

                            aFinVCHistory.push(GenF.parse(oVCHistory));
                        }
                        else {
                            // if(aFilVCHistory[iHis].CHAR_COUNT > aFinVCHistory[ifindIndex]["CHAR_COUNT"]){
                            //     aFinVCHistory[ifindIndex]["CHAR_COUNT"] = aFilVCHistory[iHis].CHAR_COUNT;
                            // }
                            // aFinVCHistory[ifindIndex]["CHAR_COUNT"] += aFilVCHistory[iHis].CHAR_COUNT;
                            aFinVCHistory[ifindIndex]["CHAR_COUNT_RATE"] = 0
                            aFinVCHistory[ifindIndex]["GROUP_COUNT"] = parseInt(aFinVCHistory[ifindIndex].GROUP_COUNT) + parseInt(aFilVCHistory[iHis].GROUP_COUNT);
                            aFinVCHistory[ifindIndex]["GROUP_COUNT_RATE"] = 0;
                        }
                        // else {
                        //     if (sGroup_Id === oVCHistory["GROUP_ID"]) {
                        //         aFinVCHistory[ifindIndex]["CHAR_COUNT"] = aFilVCHistory[iHis].CHAR_COUNT;
                        //         aFinVCHistory[ifindIndex]["CHAR_COUNT_RATE"] = aFilVCHistory[iHis].CHAR_COUNT_RATE;
                        //     }
                        //     aFinVCHistory[ifindIndex]["GROUP_COUNT"] = parseInt(aFinVCHistory[ifindIndex].GROUP_COUNT) + parseInt(aFilVCHistory[iHis].GROUP_COUNT);
                        //     aFinVCHistory[ifindIndex]["GROUP_COUNT_RATE"] = 0;
                        // }


                        let ifindIndexH = aVCHistory.findIndex(
                            (o) =>
                                o.GROUP_ID === sGroup_Id &&
                                o.ROW === aFilVCHistory[iHis].ROW &&
                                o.ATTRIBUTE === aFilVCHistory[iHis].ATTRIBUTE &&
                                o.CHAR_NUM === aFilVCHistory[iHis].CHAR_NUM
                        );

                        if (ifindIndexH !== -1) {
                            aVCHistory[ifindIndexH].FLAG = true;
                        }
                    }
                }

            }

        }

        if (aFinVCHistory.length > 0) {
            aFinVCHistory.forEach((aHist) => {
                // // Char Count Rate
                if (lsOrdercount.ORD_QTY > 0) {
                    // let id = aHist.GROUP_ID.split("_")[0];
                    let iTargetQty = lsOrdercount.TARGET_QTY;
                    // }
                    aHist["CHAR_COUNT_RATE"] = (
                        (parseInt(aHist["CHAR_COUNT"]) /
                            parseInt(iTargetQty)) *
                        100
                    ).toFixed(2);

                    aHist["GROUP_COUNT_RATE"] = (
                        (parseInt(aHist["GROUP_COUNT"]) /
                            parseInt(iTargetQty)) *
                        100
                    ).toFixed(2);
                    // aHist["CHAR_COUNT_RATE"] = (
                    //     (parseInt(aHist["CHAR_COUNT"]) /
                    //         parseInt(lsOrdercount.TARGET_QTY))
                    // ).toFixed(2);
                }

                // Group Count Rate

                // if (lsOrdercount.ORD_QTY > 0) {
                //     aHist["GROUP_COUNT_RATE"] = (
                //         (parseInt(aHist["GROUP_COUNT"]) /
                //             parseInt(lsOrdercount.TARGET_QTY)) *
                //         100
                //     ).toFixed(2);
                // }

            });
        }


        aFilVCHistory = [];
        aFilVCHistory = aVCHistory.filter(function (aHist) {
            return aHist.FLAG === false;
        });

        if (aFilVCHistory.length > 0) {
            for (let index = 0; index < aFilVCHistory.length; index++) {
                oVCHistory = {};
                oVCHistory["PERIOD_NUM"] = GenF.parse(lsOrdercount.WEEK_NO);
                oVCHistory["LOCATION_ID"] = GenF.parse(aFilVCHistory[index].LOCATION_ID);
                oVCHistory["PRODUCT_ID"] = GenF.parse(lsOrdercount.PRODUCT_ID);
                oVCHistory["TYPE"] = 'PI';
                oVCHistory["GROUP_ID"] = aFilVCHistory[index].GROUP_ID;
                oVCHistory["CUSTOMER_GROUP"] = aFilVCHistory[index].CUSTOMER_GROUP;
                oVCHistory["ROW"] = aFilVCHistory[index].ROW;
                oVCHistory["ATTRIBUTE"] = aFilVCHistory[index].ATTRIBUTE;
                oVCHistory["CHAR_NUM"] = aFilVCHistory[index].CHAR_NUM;
                oVCHistory["CHAR_COUNT"] = aFilVCHistory[index].CHAR_COUNT;
                oVCHistory["CHAR_COUNT_RATE"] = aFilVCHistory[index].CHAR_COUNT_RATE;
                oVCHistory["GROUP_COUNT"] = aFilVCHistory[index].GROUP_COUNT;
                oVCHistory["GROUP_COUNT_RATE"] = aFilVCHistory[index].GROUP_COUNT_RATE;

                aFinVCHistory.push(GenF.parse(oVCHistory));

            }
        }

        return aFinVCHistory;

    }

    async processTSFPRPIDs(oLocProd, aObjdepF, aPRPIDs_PIDs, sWeekDate, oFutureDemand) {
        let aVCFuture = [], aFilVCFuture = [], aFinVCFuture = [];
        let aDistPRPIDs = [];
        let oVCFuture = {};

        aVCFuture = aObjdepF;
        // Add new property 'FLAG' to array of objects
        aVCFuture = aVCFuture.map(function (obj) {
            return { ...obj, FLAG: false };
        });

        // Delete Duplicates
        const aKeys = ["PRPID"];
        aDistPRPIDs = GenF.removeDuplicate(aPRPIDs_PIDs, aKeys);

        for (let i = 0; i < aDistPRPIDs.length; i++) {
            let aFilMappedPids = [];
            aFilMappedPids = aPRPIDs_PIDs.filter(function (aPRPID) {
                return aPRPID.PRPID === aDistPRPIDs[i].PRPID
            });

            oVCFuture["CAL_DATE"] = GenF.parse(sWeekDate);
            oVCFuture["LOCATION_ID"] = GenF.parse(oLocProd.LOCATION_ID);
            oVCFuture["PRODUCT_ID"] = GenF.parse(oLocProd.PRODUCT_ID);
            oVCFuture["OBJ_TYPE"] = 'PI';
            oVCFuture["OBJ_DEP"] = GenF.parse(String(aDistPRPIDs[i].PRPID));
            // oVCFuture["OBJ_COUNTER"] = 1;

            for (let j = 0; j < aFilMappedPids.length; j++) {

                aFilVCFuture = aVCFuture.filter(function (aVCFut) {
                    return aVCFut.OBJ_DEP === String(aFilMappedPids[j].PID);
                });

                for (let iFut = 0; iFut < aFilVCFuture.length; iFut++) {

                    let ifindIndex = aFinVCFuture.findIndex(
                        (o) =>
                            o.OBJ_DEP === String(aDistPRPIDs[i].PRPID) &&
                            o.ROW_ID === aFilVCFuture[iFut].ROW_ID &&
                            o.CHAR_NUM === aFilVCFuture[iFut].CHAR_NUM &&
                            o.VERSION === aFilVCFuture[iFut].VERSION &&
                            o.SCENARIO === aFilVCFuture[iFut].SCENARIO
                    );

                    if (ifindIndex === -1) {
                        oVCFuture["OBJ_COUNTER"] = aFilVCFuture[iFut].OBJ_COUNTER;
                        oVCFuture["ROW_ID"] = aFilVCFuture[iFut].ROW_ID;
                        oVCFuture["VERSION"] = aFilVCFuture[iFut].VERSION;
                        oVCFuture["SCENARIO"] = aFilVCFuture[iFut].SCENARIO;
                        oVCFuture["CHAR_NUM"] = aFilVCFuture[iFut].CHAR_NUM;
                        oVCFuture["SUCCESS"] = aFilVCFuture[iFut].SUCCESS;
                        oVCFuture["SUCCESS_RATE"] = 0;

                        aFinVCFuture.push(GenF.parse(oVCFuture));
                    } else {
                        aFinVCFuture[ifindIndex]["SUCCESS"] = parseFloat(aFinVCFuture[ifindIndex].SUCCESS) + parseFloat(aFilVCFuture[iFut].SUCCESS);
                        aFinVCFuture[ifindIndex]["SUCCESS_RATE"] = 0;
                    }


                    let ifindIndexH = aVCFuture.findIndex(
                        (o) =>
                            o.OBJ_DEP === String(aFilMappedPids[j].PID) &&
                            o.ROW_ID === aFilVCFuture[iFut].ROW_ID &&
                            o.CHAR_NUM === aFilVCFuture[iFut].CHAR_NUM &&
                            o.VERSION === aFilVCFuture[iFut].VERSION &&
                            o.SCENARIO === aFilVCFuture[iFut].SCENARIO
                    );

                    if (ifindIndexH !== -1) {
                        aVCFuture[ifindIndexH].FLAG = true;
                    }
                }
            }
        }

        if (aFinVCFuture.length > 0) {
            aFinVCFuture.forEach((aFut) => {
                // Success Rate
                if (oFutureDemand.QUANTITY > 0) {
                    aFut["SUCCESS_RATE"] = (
                        (parseFloat(aFut["SUCCESS"]) /
                            parseFloat(oFutureDemand.QUANTITY)) *
                        100
                    ).toFixed(2);
                }

            });
        }

        aFilVCFuture = [];
        aFilVCFuture = aVCFuture.filter(function (aFut) {
            return aFut.FLAG === false;
        });

        if (aFilVCFuture.length > 0) {
            for (let index = 0; index < aFilVCFuture.length; index++) {
                oVCFuture = {};
                oVCFuture["CAL_DATE"] = GenF.parse(sWeekDate);
                oVCFuture["LOCATION_ID"] = GenF.parse(oLocProd.LOCATION_ID);
                oVCFuture["PRODUCT_ID"] = GenF.parse(oLocProd.PRODUCT_ID);
                oVCFuture["OBJ_TYPE"] = 'PI';
                oVCFuture["OBJ_DEP"] = aFilVCFuture[index].OBJ_DEP;
                oVCFuture["OBJ_COUNTER"] = aFilVCFuture[index].OBJ_COUNTER;
                oVCFuture["ROW_ID"] = aFilVCFuture[index].ROW_ID;
                oVCFuture["VERSION"] = aFilVCFuture[index].VERSION;
                oVCFuture["SCENARIO"] = aFilVCFuture[index].SCENARIO;
                oVCFuture["CHAR_NUM"] = aFilVCFuture[index].CHAR_NUM;
                oVCFuture["SUCCESS"] = aFilVCFuture[index].SUCCESS;
                oVCFuture["SUCCESS_RATE"] = aFilVCFuture[index].SUCCESS_RATE;

                aFinVCFuture.push(GenF.parse(oVCFuture));

            }
        }

        return aFinVCFuture;
    }


}

module.exports = GenTimeseriesM2;