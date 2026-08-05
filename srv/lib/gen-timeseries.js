const GenF = require("./gen-functions");
const cds = require("@sap/cds");
const hana = require("@sap/hana-client");
const {   subWeeks,   getISOWeek,   getISOWeekYear } = require('date-fns');


class GenTimeseries {
    constructor() { }

    /**
     * Generate Timeseries
     */
    async genTimeseries(adata, req, Flag) {

        // await GenF.logMessage(req, `Started history timeseries ${adata}`);
        let vCurrDate = GenF.getCurrentDate();
        var oReturn = {
            bError: false,
            message: ''
        }
        // Get Sales Count Information
        const liSalesCount = await cds.run(
            `SELECT *
               FROM V_ORD_COUNT
              WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                AND "PRODUCT_ID"  = '${adata.PRODUCT_ID}'
                AND "WEEK_DATE" <= '${vCurrDate}'
                ORDER BY "LOCATION_ID" ASC, 
                         "PRODUCT_ID" ASC,
                         "WEEK_DATE" ASC`
        );

        let lMainProduct = '';
        // Get Configurable product
        let lsMainProduct = await SELECT.one
            .from('CP_PARTIALPROD_INTRO')
            .columns('REF_PRODID')
            .where(`LOCATION_ID = '${adata.LOCATION_ID}' AND PRODUCT_ID = '${adata.PRODUCT_ID}'`);
        if (lsMainProduct === null || lsMainProduct == undefined) {
            lMainProduct = GenF.parse(adata.PRODUCT_ID);
        }
        else {
            lMainProduct = lsMainProduct.REF_PRODID;
        }


        // Get Object Dependencies With Distinct Count Of Characteristics
        let aODData = [], aObjDep = [];
        let liODChar = [];
        // aODData = await cds.run(`SELECT DISTINCT 
        //                                 OBJ_DEP,
        //                                 COUNT(DISTINCT CHAR_NUM) AS COUNT
        //                                 FROM V_OBDHDR_M
        //                                 WHERE LOCATION_ID = '${adata.LOCATION_ID}'
        //                                   AND PRODUCT_ID = '${lMainProduct}'
        //                                 GROUP BY LOCATION_ID,
        //                                         PRODUCT_ID,
        //                                         OBJ_DEP
        //                                 ORDER BY OBJ_DEP`)
        aODData = await cds.run(`SELECT DISTINCT 
                                        OBJ_DEP,
                                        COUNT(DISTINCT CHAR_NUM) AS COUNT
                                        FROM V_OBDHDR_M
                                        WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                        GROUP BY LOCATION_ID,
                                                PRODUCT_ID,
                                                OBJ_DEP
                                        ORDER BY OBJ_DEP`)
        if (aODData.length > 0) {
            // Logic to get array of values with COUNT property greater than 1 
            // filter is to avoid 'undefined' value in else case
            aObjDep = aODData.map(function (el) {
                if (el.COUNT > 1) {
                    return (el.OBJ_DEP).toString();
                }
            }).filter((el) => !!el);
            console.log(aObjDep);
        }


        if (aObjDep.length > 0) {
            // Get Object Dependency
            // liODChar = await cds.run(
            //     `SELECT DISTINCT OBJ_DEP,
            //                 OBJ_COUNTER,
            //                 CHAR_NUM,
            //                 CHARVAL_NUM,
            //                 OD_CONDITION,
            //                 CHAR_COUNTER
            //             FROM "V_OBDHDR_M"
            //             WHERE LOCATION_ID = '${adata.LOCATION_ID}'
            //                 AND PRODUCT_ID  = '${lMainProduct}'
            //                 ORDER BY OBJ_DEP,
            //                         OBJ_COUNTER,
            //                         CHAR_COUNTER`
            // );
            liODChar = await cds.run(
                `SELECT DISTINCT OBJ_DEP,
                            OBJ_COUNTER,
                            CHAR_NUM,
                            CHARVAL_NUM,
                            OD_CONDITION,
                            CHAR_COUNTER
                        FROM "V_OBDHDR_M"
                        WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                            ORDER BY OBJ_DEP,
                                    OBJ_COUNTER,
                                    CHAR_COUNTER`
            );

            if (liODChar.length > 0) {
                let aFilODChar = [];
                aFilODChar = liODChar.filter((i) => aObjDep.indexOf(i.OBJ_DEP) !== -1);

                liODChar = aFilODChar;
            }
        } else {
            Flag = 'W';
        }

        let liOD = [];
        let lsOD = {};
        let lRowID = 0;

        for (let cntODC = 0; cntODC < liODChar.length; cntODC++) {
            if (cntODC === 0 ||
                liODChar[cntODC].OBJ_DEP !== liODChar[GenF.subOne(cntODC)].OBJ_DEP ||
                liODChar[cntODC].OBJ_COUNTER !== liODChar[GenF.subOne(cntODC)].OBJ_COUNTER) {
                lsOD = {};
                lsOD['OBJ_DEP'] = GenF.parse(liODChar[cntODC].OBJ_DEP);
                lsOD['OBJ_COUNTER'] = GenF.parse(liODChar[cntODC].OBJ_COUNTER);
                lsOD['CHAR'] = [];          // Maintain Characteristic condition
                lsOD['CHAR_UNI'] = [];      // Maintain Characteristics only once
                lRowID = 1;
            }
            let lsODC = {};
            lsODC['CHAR_COUNTER'] = GenF.parse(liODChar[cntODC].CHAR_COUNTER);
            lsODC['CHAR_NUM'] = GenF.parse(liODChar[cntODC].CHAR_NUM);
            lsODC['CHARVAL_NUM'] = GenF.parse(liODChar[cntODC].CHARVAL_NUM);
            lsODC['OD_CONDITION'] = GenF.parse(liODChar[cntODC].OD_CONDITION);

            let lUnique = '';
            if (lsOD['CHAR'].length === 0) {
                lUnique = 'X';
            }

            // Check if Characteristic already assigne a Row ID. If not, check for the highest number and add one            
            for (let cntC = 0; cntC < lsOD['CHAR'].length; cntC++) {
                if (lsOD['CHAR'][cntC].CHAR_NUM === liODChar[cntODC].CHAR_NUM) {
                    lRowID = parseInt(lsOD['CHAR'][cntC].ROW_ID);
                    break;
                }
                if (parseInt(lsOD['CHAR'][cntC].ROW_ID) > lRowID) {
                    lRowID = parseInt(lsOD['CHAR'][cntC].ROW_ID)
                }
                if (GenF.addOne(cntC) === lsOD['CHAR'].length) {
                    lRowID = parseInt(lRowID) + 1;
                    lUnique = 'X';
                }
            }


            lsODC['ROW_ID'] = lRowID;
            lsOD['CHAR'].push(GenF.parse(lsODC));

            if (lUnique === 'X') {
                let lsCharUni = {};
                lsCharUni['CHAR_NUM'] = lsODC['CHAR_NUM'];
                lsCharUni['ROW_ID'] = lsODC['ROW_ID'];
                lsCharUni['ORD_QTY'] = 0;
                lsOD['CHAR_UNI'].push(GenF.parse(lsCharUni));
            }

            if (cntODC == GenF.addOne(cntODC, liODChar.length) ||
                liODChar[cntODC].OBJ_DEP !== liODChar[GenF.addOne(cntODC, liODChar.length)].OBJ_DEP ||
                liODChar[cntODC].OBJ_COUNTER !== liODChar[GenF.addOne(cntODC, liODChar.length)].OBJ_COUNTER) {
                liOD.push(lsOD);
            }
        }


        for (let i = 0; i < liSalesCount.length; i++) {
            await DELETE.from('CP_VC_HISTORY_TS')
                .where({
                    xpr: [
                        { ref: ["LOCATION_ID"] }, '=', { val: liSalesCount[i].LOCATION_ID }, 'and',
                        { ref: ["PRODUCT_ID"] }, '=', { val: liSalesCount[i].PRODUCT_ID }, 'and',
                        { ref: ["PERIOD_NUM"] }, '=', { val: liSalesCount[i].WEEK_NO }, 'and',
                        { ref: ["TYPE"] }, '=', { val: 'OD' }
                    ]
                });

            let liODTemp = GenF.parse(liOD);

            let liSalesHead = await cds.run(
                `SELECT DISTINCT SALES_DOC,
                                 SALESDOC_ITEM,
                                 ORD_QTY
                    FROM V_SALES_H
                    WHERE LOCATION_ID   = '${liSalesCount[i].LOCATION_ID}'
                    AND ( MAT_AVAILDATE <= '${liSalesCount[i].WEEK_DATE}' 
                    AND MAT_AVAILDATE > '${GenF.getLastWeekDate(liSalesCount[i].WEEK_DATE)}' )
                    AND PRODUCT_ID    = '${liSalesCount[i].PRODUCT_ID}'
                    ORDER BY SALES_DOC,
                            SALESDOC_ITEM`
            );

            let liSalesConfig = await cds.run(
                `SELECT DISTINCT A.SALES_DOC,
                        A.SALESDOC_ITEM,
                        A.ORD_QTY,
                        B.CHAR_NUM,
                        B.CHARVAL_NUM
                   FROM V_SALES_H AS A
                  INNER JOIN V_UNIQUE_ID AS B
                     ON A.UNIQUE_ID   = B.UNIQUE_ID
                    AND A.REF_PRODID  = B.PRODUCT_ID
                  WHERE A.LOCATION_ID   = '${liSalesCount[i].LOCATION_ID}'
                    AND ( A.MAT_AVAILDATE <= '${liSalesCount[i].WEEK_DATE}' 
                    AND A.MAT_AVAILDATE > '${GenF.getLastWeekDate(liSalesCount[i].WEEK_DATE)}' )
                    AND A.PRODUCT_ID    = '${liSalesCount[i].PRODUCT_ID}'
                  ORDER BY A.SALES_DOC,
                           A.SALESDOC_ITEM`
            );

            let liVCHistory = [];

            for (let cntODT = 0; cntODT < liODTemp.length; cntODT++) {

                for (let cntODTC = 0; cntODTC < liODTemp[cntODT]['CHAR'].length; cntODTC++) {

                    liODTemp[cntODT]['CHAR'][cntODTC]['CHAR_QTY'] = 0;
                    liODTemp[cntODT]['CHAR'][cntODTC]['SO'] = []
                    let lSO = {};
                    for (let cntSC = 0; cntSC < liSalesConfig.length; cntSC++) {
                        if (liSalesConfig[cntSC].CHAR_NUM === liODTemp[cntODT]['CHAR'][cntODTC].CHAR_NUM) {
                            if (liODTemp[cntODT]['CHAR'][cntODTC].OD_CONDITION === "EQ") {
                                if (liSalesConfig[cntSC].CHARVAL_NUM === liODTemp[cntODT]['CHAR'][cntODTC].CHARVAL_NUM) {
                                    lSO = {};
                                    lSO['SALES_DOC'] = GenF.parse(liSalesConfig[cntSC].SALES_DOC);
                                    lSO['SALESDOC_ITEM'] = GenF.parse(liSalesConfig[cntSC].SALESDOC_ITEM);
                                    lSO['ORD_QTY'] = GenF.parse(liSalesConfig[cntSC].ORD_QTY);
                                    liODTemp[cntODT]['CHAR'][cntODTC]['SO'].push(lSO);

                                    for (let cntODCU = 0; cntODCU < liODTemp[cntODT]['CHAR_UNI'].length; cntODCU++) {
                                        if (liODTemp[cntODT]['CHAR_UNI'][cntODCU]['CHAR_NUM'] === liSalesConfig[cntSC].CHAR_NUM) {
                                            liODTemp[cntODT]['CHAR_UNI'][cntODCU]['ORD_QTY'] = parseInt(liODTemp[cntODT]['CHAR_UNI'][cntODCU]['ORD_QTY']) + parseInt(liSalesConfig[cntSC].ORD_QTY);
                                        }
                                    }

                                    liODTemp[cntODT]['CHAR'][cntODTC]['CHAR_QTY'] = parseInt(liODTemp[cntODT]['CHAR'][cntODTC]['CHAR_QTY'])
                                        + parseInt(lSO['ORD_QTY']);
                                }
                            } else {
                                if (liSalesConfig[cntSC].CHARVAL_NUM !== liODTemp[cntODT]['CHAR'][cntODTC].CHARVAL_NUM) {
                                    lSO = {};
                                    lSO['SALES_DOC'] = GenF.parse(liSalesConfig[cntSC].SALES_DOC);
                                    lSO['SALESDOC_ITEM'] = GenF.parse(liSalesConfig[cntSC].SALESDOC_ITEM);
                                    lSO['ORD_QTY'] = GenF.parse(liSalesConfig[cntSC].ORD_QTY);
                                    liODTemp[cntODT]['CHAR'][cntODTC]['SO'].push(lSO);


                                    for (let cntODCU = 0; cntODCU < liODTemp[cntODT]['CHAR_UNI'].length; cntODCU++) {
                                        if (liODTemp[cntODT]['CHAR_UNI'][cntODCU]['CHAR_NUM'] === liSalesConfig[cntSC].CHAR_NUM) {
                                            liODTemp[cntODT]['CHAR_UNI'][cntODCU]['ORD_QTY'] = parseInt(liODTemp[cntODT]['CHAR_UNI'][cntODCU]['ORD_QTY']) + parseInt(liSalesConfig[cntSC].ORD_QTY);
                                        }
                                    }

                                    liODTemp[cntODT]['CHAR'][cntODTC]['CHAR_QTY'] = parseInt(liODTemp[cntODT]['CHAR'][cntODTC]['CHAR_QTY'])
                                        + parseInt(lSO['ORD_QTY']);
                                }
                            }
                        }

                    }
                }

                liODTemp[cntODT]['OD_QTY'] = 0;

                for (let cntSO = 0; cntSO < liSalesHead.length; cntSO++) {
                    let lSuccess = ''
                    for (let cntODTC = 0; cntODTC < liODTemp[cntODT]['CHAR'].length; cntODTC++) {
                        if (liODTemp[cntODT]['CHAR'][cntODTC].CHAR_COUNTER !== liODTemp[cntODT]['CHAR'][GenF.subOne(cntODTC, liODTemp[cntODT]['CHAR'].length)].CHAR_COUNTER
                            || cntODTC === 0) {
                            lSuccess = '';
                        }

                        for (let cntCSO = 0; cntCSO < liODTemp[cntODT]['CHAR'][cntODTC]['SO'].length; cntCSO++) {
                            if (liODTemp[cntODT]['CHAR'][cntODTC]['SO'][cntCSO]['SALES_DOC'] === liSalesHead[cntSO].SALES_DOC &&
                                liODTemp[cntODT]['CHAR'][cntODTC]['SO'][cntCSO]['SALESDOC_ITEM'] === liSalesHead[cntSO].SALESDOC_ITEM) {
                                lSuccess = 'X';
                                break;
                            }
                        }
                        if (lSuccess === '') {
                            if (liODTemp[cntODT]['CHAR'][cntODTC].CHAR_COUNTER !== liODTemp[cntODT]['CHAR'][GenF.addOne(cntODTC, liODTemp[cntODT]['CHAR'].length)].CHAR_COUNTER
                                || cntODTC === GenF.addOne(cntODTC, liODTemp[cntODT]['CHAR'].length)) {
                                break;
                            }
                        }
                    }
                    if (lSuccess === 'X') {
                        liODTemp[cntODT]['OD_QTY'] = parseInt(liODTemp[cntODT]['OD_QTY']) + parseInt(liSalesHead[cntSO].ORD_QTY);
                    }
                }

                let lsVCHistory = {};
                lsVCHistory['PERIOD_NUM'] = GenF.parse(liSalesCount[i].WEEK_NO);
                lsVCHistory['LOCATION_ID'] = GenF.parse(liSalesCount[i].LOCATION_ID);
                lsVCHistory['PRODUCT_ID'] = GenF.parse(liSalesCount[i].PRODUCT_ID);
                lsVCHistory['TYPE'] = 'OD';
                lsVCHistory['GROUP_ID'] = GenF.parse(liODTemp[cntODT].OBJ_DEP + '_' + liODTemp[cntODT].OBJ_COUNTER);
                lsVCHistory['GROUP_COUNT'] = GenF.parse(liODTemp[cntODT].OD_QTY);
                lsVCHistory['GROUP_COUNT_RATE'] = (parseInt(liODTemp[cntODT].OD_QTY) / parseInt(liSalesCount[i].ORD_QTY) * 100).toFixed(2);

                for (let cntODTC = 0; cntODTC < liODTemp[cntODT]['CHAR_UNI'].length; cntODTC++) {
                    lsVCHistory['ROW'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC].ROW_ID;
                    lsVCHistory['CHAR_NUM'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC].CHAR_NUM;
                    lsVCHistory['ATTRIBUTE'] = 'att' + liODTemp[cntODT]['CHAR_UNI'][cntODTC].ROW_ID;
                    lsVCHistory['CHAR_COUNT'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC]['ORD_QTY'];

                    lsVCHistory['CHAR_COUNT_RATE'] = (parseInt(lsVCHistory['CHAR_COUNT']) / parseInt(liSalesCount[i].ORD_QTY) * 100).toFixed(2);

                    liVCHistory.push(GenF.parse(lsVCHistory));
                }

            }

            if (liVCHistory.length > 0) {
                try {
                    cds.run({
                        INSERT:
                        {
                            into: { ref: ['CP_VC_HISTORY_TS'] },
                            entries: liVCHistory
                        }
                    });
                    Flag = 'S';
                }
                catch (error) {
                    console.log(error);
                }

            }

        }

        await GenF.logMessage(req, `Completed history timeseries`);
        if (Flag === 'S') {
            // await GenF.jobSchMessage('X', "Timeseries History generation is complete", req);
            oReturn.bError = false;
            oReturn.message = "Timeseries History generation is complete";
        } else if (Flag === 'W') {
            oReturn.bError = false;
            oReturn.message = "Insufficient Data for Timeseries History generation";
        } else {
            // await GenF.jobSchMessage('', "Timeseries History generation failed", req);
            oReturn.bError = true;
            oReturn.message = "Timeseries History generation failed";
        }
        return oReturn;
    }

    async genTimeseriesF(adata, req, Flag) {

        const lStartTime = new Date();
        console.log("Started timeseries Service");
        const tCurrTimestamp = new Date().toISOString();
        var oReturn = {
            bError: false,
            message: ''
        }
        let lMainProduct = '';
        let aTSFuture = [], oTSFuture = {};
        let aTSPredictions = [], oTSPredictions = {};
        var aDeltaData =[];
        var sError ='';
        // Get Configurable product
        let lsMainProduct = await SELECT.one
            .from('CP_PARTIALPROD_INTRO')
            .columns('REF_PRODID')
            .where(`LOCATION_ID = '${adata.LOCATION_ID}' AND PRODUCT_ID = '${adata.PRODUCT_ID}'`);
        if (lsMainProduct === null || lsMainProduct == undefined) {
            lMainProduct = GenF.parse(adata.PRODUCT_ID);
        }
        else {
            lMainProduct = lsMainProduct.REF_PRODID;
        }

        // Get Object Dependencies With Count of distinct Characteristic
        let aODData = [], aObjDep = [];
        // aODData = await cds.run(`SELECT DISTINCT 
        //                                 OBJ_DEP,
        //                                 COUNT(DISTINCT CHAR_NUM) AS COUNT
        //                                 FROM V_OBDHDR_M
        //                                 WHERE LOCATION_ID = '${adata.LOCATION_ID}'
        //                                   AND PRODUCT_ID = '${lMainProduct}'
        //                                 GROUP BY LOCATION_ID,
        //                                         PRODUCT_ID,
        //                                         OBJ_DEP
        //                                 ORDER BY OBJ_DEP`)
        aODData = await cds.run(`SELECT DISTINCT 
                                        OBJ_DEP,
                                        COUNT(DISTINCT CHAR_NUM) AS COUNT
                                        FROM V_OBDHDR_M
                                        WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                        GROUP BY LOCATION_ID,
                                                PRODUCT_ID,
                                                OBJ_DEP
                                        ORDER BY OBJ_DEP`)
        if (aODData.length > 0) {
            // Map Object dependecies with Single Characteristic
            aObjDep = aODData.map(function (el) {
                if (el.COUNT === 1) {
                    return el.OBJ_DEP;
                }
            }).filter((el) => !!el);

            console.log(aObjDep);
        }

        /** Get Future Plan */
        const liFutureCharPlan = await cds.run(
            `SELECT DISTINCT LOCATION_ID, 
                             PRODUCT_ID, 
                             VERSION,
                             SCENARIO,
                             MODEL_VERSION,
                             WEEK_DATE
                       FROM "CP_IBP_FCHARPLAN"
                      WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                        AND "PRODUCT_ID" = '${adata.PRODUCT_ID}'
                        AND "VERSION" = '${adata.VERSION}'
                        AND "SCENARIO" = '${adata.SCENARIO}'
                        AND "MODEL_VERSION" = '${adata.MODEL_VERSION}'
                   ORDER BY LOCATION_ID, 
                            PRODUCT_ID, 
                            VERSION,
                            SCENARIO,
                            MODEL_VERSION,
                            WEEK_DATE`
        );

        let lsObjdepF = {};
        let liObjdepF = [];
        let liObdhdr = [];

        // Delete Timeseries Future Data for selected location product
        try {
            await DELETE.from('CP_TS_OBJDEP_CHARHDR_F')
                .where(`LOCATION_ID = '${adata.LOCATION_ID}'
                    AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                    AND VERSION = '${adata.VERSION}'
                    AND SCENARIO = '${adata.SCENARIO}'
                    AND MODEL_VERSION = '${adata.MODEL_VERSION}'
                    AND OBJ_TYPE = 'OD'`);
        } catch (error) {
            console.log("Error: " + error.message);
        }

        // Get Object Dependencies
        // liObdhdr = await cds.run(`SELECT *
        //                             FROM "V_OBDHDR_M"
        //                            WHERE LOCATION_ID = '${adata.LOCATION_ID}'
        //                              AND PRODUCT_ID = '${lMainProduct}'`);
        liObdhdr = await cds.run(`SELECT *
                                    FROM "V_OBDHDR_M"
                                   WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                        `);

        // Get Distinct Object Dependencies
        // let liObdhdrDist = await cds.run(`SELECT DISTINCT OBJ_DEP,
        //                                                   OBJ_COUNTER,
        //                                                   CHAR_NUM,
        //                                                   ROW_ID
        //                                             FROM "V_OBDHDR_M"
        //                                            WHERE LOCATION_ID = '${adata.LOCATION_ID}'
        //                                              AND PRODUCT_ID = '${lMainProduct}'`);
        let liObdhdrDist = await cds.run(`SELECT DISTINCT OBJ_DEP,
                                                          OBJ_COUNTER,
                                                          CHAR_NUM,
                                                          ROW_ID
                                                    FROM "V_OBDHDR_M"
                                                   WHERE LOCATION_ID = '${adata.LOCATION_ID}'`);



        for (let lFutInd = 0; lFutInd < liFutureCharPlan.length; lFutInd++) {
            console.log("Date: " + liFutureCharPlan[lFutInd].WEEK_DATE);

            /** Get Future Plan */
            const liFutureCharPlanDate = await cds.run(
                `SELECT A."LOCATION_ID", 
                        A."PRODUCT_ID", 
                        B."REF_PRODID",
                        A."CLASS_NUM",
                        A."CHAR_NUM", 
                        A."CHARVAL_NUM",
                        A."VERSION",
                        A."SCENARIO",
                        A."MODEL_VERSION,
                        A."WEEK_DATE",
                        A."OPT_PERCENT",
                        A."OPT_QTY",
                        A."MANUALOPTION" 
               FROM "CP_IBP_FCHARPLAN" AS A
               INNER JOIN "CP_PARTIALPROD_INTRO" AS B
                ON A.LOCATION_ID = B.LOCATION_ID
                AND A.PRODUCT_ID = B.PRODUCT_ID
               WHERE A.LOCATION_ID = '${liFutureCharPlan[lFutInd].LOCATION_ID}'
               AND A.PRODUCT_ID = '${liFutureCharPlan[lFutInd].PRODUCT_ID}'
               AND A.VERSION = '${liFutureCharPlan[lFutInd].VERSION}'
               AND A.SCENARIO = '${liFutureCharPlan[lFutInd].SCENARIO}'
               AND A.MODEL_VERSION = '${liFutureCharPlan[lFutInd].MODEL_VERSION}'
               AND A.WEEK_DATE = '${liFutureCharPlan[lFutInd].WEEK_DATE}'`
            );

            liObjdepF = [];
            let tableObjH = [],
                rowObjH = [],
                vSuccessRate = 0;
            for (let lObdDis = 0; lObdDis < liObdhdrDist.length; lObdDis++) {
                lsObjdepF = {};
                lsObjdepF.CAL_DATE = liFutureCharPlan[lFutInd].WEEK_DATE;
                lsObjdepF.LOCATION_ID = liFutureCharPlan[lFutInd].LOCATION_ID;
                lsObjdepF.PRODUCT_ID = liFutureCharPlan[lFutInd].PRODUCT_ID;
                lsObjdepF.VERSION = liFutureCharPlan[lFutInd].VERSION;
                lsObjdepF.SCENARIO = liFutureCharPlan[lFutInd].SCENARIO;
                lsObjdepF.MODEL_VERSION = liFutureCharPlan[lFutInd].MODEL_VERSION;
                lsObjdepF.OBJ_TYPE = "OD";
                lsObjdepF.OBJ_DEP = liObdhdrDist[lObdDis].OBJ_DEP;
                lsObjdepF.OBJ_COUNTER = liObdhdrDist[lObdDis].OBJ_COUNTER;
                lsObjdepF.ROW_ID = liObdhdrDist[lObdDis].ROW_ID;
                lsObjdepF.CHAR_NUM = liObdhdrDist[lObdDis].CHAR_NUM;
                lsObjdepF.SUCCESS = 0;

                for (let lObjInd = 0; lObjInd < liObdhdr.length; lObjInd++) {
                    if (
                        liObdhdrDist[lObdDis].OBJ_DEP === liObdhdr[lObjInd].OBJ_DEP &&
                        liObdhdrDist[lObdDis].OBJ_COUNTER ===
                        liObdhdr[lObjInd].OBJ_COUNTER &&
                        liObdhdrDist[lObdDis].ROW_ID === liObdhdr[lObjInd].ROW_ID
                    ) {
                        for (
                            let lFutIndex = 0;
                            lFutIndex < liFutureCharPlanDate.length;
                            lFutIndex++
                        ) {
                            if (
                                liFutureCharPlanDate[lFutIndex].LOCATION_ID ===
                                liObdhdr[lObjInd].LOCATION_ID &&
                                liFutureCharPlanDate[lFutIndex].REF_PRODID ===
                                liObdhdr[lObjInd].PRODUCT_ID &&
                                liFutureCharPlanDate[lFutIndex].VERSION ===
                                liFutureCharPlan[lFutInd].VERSION &&
                                liFutureCharPlanDate[lFutIndex].SCENARIO ===
                                liFutureCharPlan[lFutInd].SCENARIO &&
                                liFutureCharPlanDate[lFutIndex].CLASS_NUM ===
                                liObdhdr[lObjInd].CLASS_NUM &&
                                liFutureCharPlanDate[lFutIndex].CHAR_NUM ===
                                liObdhdr[lObjInd].CHAR_NUM
                            ) {
                                if (
                                    liObdhdr[lObjInd].OD_CONDITION === "EQ" &&
                                    liObdhdr[lObjInd].CHARVAL_NUM ===
                                    liFutureCharPlanDate[lFutIndex].CHARVAL_NUM
                                ) {
                                    lsObjdepF.SUCCESS =
                                        parseFloat(lsObjdepF.SUCCESS) + parseFloat(liFutureCharPlanDate[lFutIndex].OPT_QTY);
                                }
                                if (
                                    liObdhdr[lObjInd].OD_CONDITION === "NE" &&
                                    liObdhdr[lObjInd].CHARVAL_NUM !==
                                    liFutureCharPlanDate[lFutIndex].CHARVAL_NUM
                                ) {
                                    lsObjdepF.SUCCESS =
                                        parseFloat(lsObjdepF.SUCCESS) + parseFloat(liFutureCharPlanDate[lFutIndex].OPT_QTY);
                                }
                            }
                        }

                    }
                }
                liObjdepF.push(GenF.parse(lsObjdepF));
            }


            /** Get Future Plan */
            const liFutureDemandPlanDate = await cds.run(
                `SELECT *
                    FROM "CP_IBP_FUTUREDEMAND"
                    WHERE LOCATION_ID = '${liFutureCharPlan[lFutInd].LOCATION_ID}'
                    AND PRODUCT_ID    = '${liFutureCharPlan[lFutInd].PRODUCT_ID}'
                    AND WEEK_DATE     = '${liFutureCharPlan[lFutInd].WEEK_DATE}'
                    AND VERSION       = '${liFutureCharPlan[lFutInd].VERSION}'
                    AND SCENARIO      = '${liFutureCharPlan[lFutInd].SCENARIO}'`
            );



            if (liObjdepF.length > 0) {
                try {
                    for (let index = 0; index < liObjdepF.length; index++) {


                        // If Object Dependency Contains Single Characteristic, then update option qty from IBP to Predictions
                        if (aObjDep.length > 0 && aObjDep.includes(liObjdepF[index].OBJ_DEP) === true) {

                            try {
                                await DELETE.from('CP_TS_PREDICTIONS')
                                    .where(`CAL_DATE   = '${liObjdepF[index].CAL_DATE}'
                                        AND LOCATION_ID = '${liObjdepF[index].LOCATION_ID}'
                                        AND PRODUCT_ID = '${liObjdepF[index].PRODUCT_ID}'
                                        AND OBJ_DEP    = '${liObjdepF[index].OBJ_DEP}'
                                        AND VERSION = '${adata.VERSION}'
                                        AND SCENARIO = '${adata.SCENARIO}'
                                        AND MODEL_VERSION = '${adata.MODEL_VERSION}'
                                        AND OBJ_TYPE = 'OD'`);
                            } catch (error) {
                                console.log("Error: " + error.message);
                            }                            

                            // Insert Predictions Data for Single Characteristic OD
                            try {                               

                                oTSPredictions = {};

                                oTSPredictions.CAL_DATE = liObjdepF[index].CAL_DATE;
                                oTSPredictions.LOCATION_ID = liObjdepF[index].LOCATION_ID;
                                oTSPredictions.PRODUCT_ID = liObjdepF[index].PRODUCT_ID;
                                oTSPredictions.OBJ_TYPE = liObjdepF[index].OBJ_TYPE;
                                oTSPredictions.OBJ_DEP = liObjdepF[index].OBJ_DEP;
                                oTSPredictions.OBJ_COUNTER = liObjdepF[index].OBJ_COUNTER;
                                oTSPredictions.MODEL_TYPE = 'NA';
                                // oTSPredictions.MODEL_VERSION = 'Active';
                                oTSPredictions.MODEL_VERSION = liObjdepF[index].MODEL_VERSION;
                                oTSPredictions.MODEL_PROFILE = 'NA';
                                oTSPredictions.VERSION = liObjdepF[index].VERSION;
                                oTSPredictions.SCENARIO = liObjdepF[index].SCENARIO;
                                oTSPredictions.PREDICTED = liObjdepF[index].SUCCESS;
                                oTSPredictions.PREDICTED_TIME = tCurrTimestamp;
                                oTSPredictions.PREDICTED_STATUS = 'SUCCESS';
                                oTSPredictions.PRE_OPTIMIZED = 0.00;
                                oTSPredictions.PRE_OPTIMIZED_TIME = tCurrTimestamp;
                                oTSPredictions.OPT_ALGORITHM = 'NONE';

                                aTSPredictions.push(GenF.parse(oTSPredictions));
                            } catch (error) {
                                console.log("Error: " + error.message);
                            }

                        } else {
                            liObjdepF[index].SUCCESS_RATE = 0;
                            for (
                                let lDemI = 0;
                                lDemI < liFutureDemandPlanDate.length;
                                lDemI++
                            ) {
                                if (liFutureDemandPlanDate[lDemI].QUANTITY !== null) {
                                    if (liFutureDemandPlanDate[lDemI].QUANTITY > 0) {

                                        liObjdepF[index].SUCCESS_RATE =
                                            (liObjdepF[index].SUCCESS /
                                                liFutureDemandPlanDate[lDemI].QUANTITY) *
                                            100;
                                    }
                                }
                            }

                            oTSFuture = {};

                            oTSFuture.CAL_DATE = liObjdepF[index].CAL_DATE;
                            oTSFuture.LOCATION_ID = liObjdepF[index].LOCATION_ID;
                            oTSFuture.PRODUCT_ID = liObjdepF[index].PRODUCT_ID;
                            oTSFuture.OBJ_TYPE = liObjdepF[index].OBJ_TYPE;
                            oTSFuture.OBJ_DEP = liObjdepF[index].OBJ_DEP;
                            oTSFuture.OBJ_COUNTER = liObjdepF[index].OBJ_COUNTER;
                            oTSFuture.ROW_ID = liObjdepF[index].ROW_ID;
                            oTSFuture.VERSION = liObjdepF[index].VERSION;
                            oTSFuture.SCENARIO = liObjdepF[index].SCENARIO;
                            oTSFuture.MODEL_VERSION = liObjdepF[index].MODEL_VERSION;
                            oTSFuture.CHAR_NUM = liObjdepF[index].CHAR_NUM;
                            oTSFuture.SUCCESS = liObjdepF[index].SUCCESS;
                            oTSFuture.SUCCESS_RATE = liObjdepF[index].SUCCESS_RATE;

                            aTSFuture.push(GenF.parse(oTSFuture));

                            //pushing Delta weeks 
                            aDeltaData.push({
                                LOCATION_ID: liObjdepF[index].LOCATION_ID,
                                PRODUCT_ID: liObjdepF[index].PRODUCT_ID,
                                VERSION: liObjdepF[index].VERSION,
                                SCENARIO: liObjdepF[index].SCENARIO,
                                MODEL_VERSION: liObjdepF[index].MODEL_VERSION,
                                WEEK_DATE: liObjdepF[index].CAL_DATE
                            })

                        }
                        Flag = 'X';
                        // Insert Future Timeseries
                        if (aTSFuture.length >=1000) {
                            try {
                                cds.run({
                                    INSERT:
                                    {
                                        into: { ref: ['CP_TS_OBJDEP_CHARHDR_F'] },
                                        entries: aTSFuture
                                    }
                                });    
                                aTSFuture = [];                            
                            }
                            catch (error) {
                                console.log(error);
                            }                            
                        }

                        // Insert Predictions
                        if (aTSPredictions.length >=1000) {
                            try {
                                cds.run({
                                    INSERT:
                                    {
                                        into: { ref: ['CP_TS_PREDICTIONS'] },
                                        entries: aTSPredictions
                                    }
                                }); 
                                aTSPredictions = [];                               
                            }
                            catch (error) {
                                console.log(error);
                            }
                            
                        }
                    }

                    // Insert Future Timeseries
                    if (aTSFuture.length > 0) {
                        try {
                            cds.run({
                                INSERT:
                                {
                                    into: { ref: ['CP_TS_OBJDEP_CHARHDR_F'] },
                                    entries: aTSFuture
                                }
                            });    
                            aTSFuture = [];                            
                        }
                        catch (error) {
                            console.log(error);
                        }                        
                    }

                    // Insert Predictions
                    if (aTSPredictions.length > 0) {
                        try {
                            cds.run({
                                INSERT:
                                {
                                    into: { ref: ['CP_TS_PREDICTIONS'] },
                                    entries: aTSPredictions
                                }
                            }); 
                            aTSPredictions = [];                               
                        }
                        catch (error) {
                            console.log(error);
                        }
                        
                    }

                } catch (e) {
                    sError ='Reason: '+e.message;
                    console.log("Error: " + e.message + "/" + e.query);
                }
            }
        }

        console.log("Completed timeseries Service");

        var lProcessTime = Math.floor(
            Math.abs(lStartTime - new Date()) / 1000 / 60
        );
        console.log(
            "Processing time : " + lProcessTime + " Minutes"
        );

        if(aDeltaData.length>0){
            try{
                await UPSERT.into("CP_FORECAST_DELTA_WEEKS").entries(aDeltaData)
            }
            catch{
                console.log("Failed to Insert in Delta Weeks")
            } 
        }
        // await GenF.logMessage(req, `Completed future timeseries`);
        if (Flag === 'X') {
            oReturn.bError = false;
            oReturn.message = 'Timeseries Future generation is complete';
            // await GenF.jobSchMessage(Flag, `Timeseries Future generation is complete`, req);
        }
        else {
            oReturn.bError = true;
            oReturn.message = `Timeseries Future generation failed for Location: ${adata.LOCATION_ID} and Product: ${adata.PRODUCT_ID}.`+sError;
            // await GenF.jobSchMessage(Flag, `Timeseries Future generation failed`, req);
        }
        return oReturn;
    }
    async genTimeseriesCust(adata, req, Flag) {

        // await GenF.logMessage(req, `Started history timeseries ${adata}`);
        let vCurrDate = GenF.getCurrentDate();
        var oReturn = {
            bError: false,
            message: ''
        }
        var sError='';
        let pastDate = subWeeks(new Date(), parseInt(adata.HistoryWeeks)).toISOString().split("T")[0];

        // Get Sales Count Information
        const liSalesCount = await cds.run(
            `SELECT *
               FROM V_ORD_COUNT_CUST
              WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                AND "PRODUCT_ID"  = '${adata.PRODUCT_ID}'
                AND "CUSTOMER_ID"  = '${adata.CUSTOMER_ID}'
                AND "WEEK_DATE" BETWEEN '${pastDate}' AND '${vCurrDate}'
                ORDER BY "LOCATION_ID" ASC,
                         "PRODUCT_ID" ASC,
                         "WEEK_DATE" ASC`);
                // AND "WEEK_DATE" <= '${vCurrDate}'
                // ORDER BY "LOCATION_ID" ASC,
                //          "PRODUCT_ID" ASC,
                //          "WEEK_DATE" ASC`
        // );

        let lMainProduct = '';
        // Get Configurable product
        let lsMainProduct = await SELECT.one
            .from('CP_PARTIALPROD_INTRO')
            .columns('REF_PRODID')
            .where(`LOCATION_ID = '${adata.LOCATION_ID}' AND PRODUCT_ID = '${adata.PRODUCT_ID}'`);
        if (lsMainProduct === null || lsMainProduct == undefined) {
            lMainProduct = GenF.parse(adata.PRODUCT_ID);
        }
        else {
            lMainProduct = lsMainProduct.REF_PRODID;
        }

        // Get Object Dependencies With Distinct Count Of Characteristics
        let aODData = [], aObjDep = [];
        // aODData = await cds.run(`SELECT DISTINCT 
        //                                 OBJ_DEP,
        //                                 COUNT(DISTINCT CHAR_NUM) AS COUNT
        //                                 FROM V_OBDHDR_M
        //                                 WHERE LOCATION_ID = '${adata.LOCATION_ID}'
        //                                   AND PRODUCT_ID = '${lMainProduct}'
        //                                 GROUP BY LOCATION_ID,
        //                                         PRODUCT_ID,
        //                                         OBJ_DEP
        //                                 ORDER BY OBJ_DEP`)
        aODData = await cds.run(`SELECT DISTINCT 
                                        OBJ_DEP,
                                        COUNT(DISTINCT CHAR_NUM) AS COUNT
                                        FROM V_OBDHDR_M
                                        WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                        GROUP BY LOCATION_ID,
                                                PRODUCT_ID,
                                                OBJ_DEP
                                        ORDER BY OBJ_DEP`)
        if (aODData.length > 0) {
            // Logic to get array of values with COUNT property greater than 1 
            // filter is to avoid 'undefined' value in else case
            aObjDep = aODData.map(function (el) {
                if (el.COUNT > 1) {
                    return el.OBJ_DEP;
                }
            }).filter((el) => !!el);
            console.log(aObjDep);
        }

        // Get Object Dependency
        // const liODChar = await cds.run(
        //     `SELECT DISTINCT OBJ_DEP,
        //                     OBJ_COUNTER,
        //                     CHAR_NUM,
        //                     CHARVAL_NUM,
        //                     OD_CONDITION,
        //                     CHAR_COUNTER
        //                 FROM "V_OBDHDR_M"
        //                 WHERE LOCATION_ID = '${adata.LOCATION_ID}'
        //                     AND PRODUCT_ID  = '${lMainProduct}'
        //                     AND OBJ_DEP IN (`+ aObjDep.toString() + `)
        //                     ORDER BY OBJ_DEP,
        //                             OBJ_COUNTER,
        //                             CHAR_COUNTER`
        // );
        const liODChar = await cds.run(
            `SELECT DISTINCT OBJ_DEP,
                            OBJ_COUNTER,
                            CHAR_NUM,
                            CHARVAL_NUM,
                            OD_CONDITION,
                            CHAR_COUNTER
                        FROM "V_OBDHDR_M"
                        WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                            AND OBJ_DEP IN (`+ aObjDep.toString() + `)
                            ORDER BY OBJ_DEP,
                                    OBJ_COUNTER,
                                    CHAR_COUNTER`
        );

        let liOD = [];
        let lsOD = {};
        let lRowID = 0;

        for (let cntODC = 0; cntODC < liODChar.length; cntODC++) {
            if (cntODC === 0 ||
                liODChar[cntODC].OBJ_DEP !== liODChar[GenF.subOne(cntODC)].OBJ_DEP ||
                liODChar[cntODC].OBJ_COUNTER !== liODChar[GenF.subOne(cntODC)].OBJ_COUNTER) {
                lsOD = {};
                lsOD['OBJ_DEP'] = GenF.parse(liODChar[cntODC].OBJ_DEP);
                lsOD['OBJ_COUNTER'] = GenF.parse(liODChar[cntODC].OBJ_COUNTER);
                lsOD['CHAR'] = [];          // Maintain Characteristic condition
                lsOD['CHAR_UNI'] = [];      // Maintain Characteristics only once
                lRowID = 1;
            }
            let lsODC = {};
            lsODC['CHAR_COUNTER'] = GenF.parse(liODChar[cntODC].CHAR_COUNTER);
            lsODC['CHAR_NUM'] = GenF.parse(liODChar[cntODC].CHAR_NUM);
            lsODC['CHARVAL_NUM'] = GenF.parse(liODChar[cntODC].CHARVAL_NUM);
            lsODC['OD_CONDITION'] = GenF.parse(liODChar[cntODC].OD_CONDITION);

            let lUnique = '';
            if (lsOD['CHAR'].length === 0) {
                lUnique = 'X';
            }

            // Check if Characteristic already assigne a Row ID. If not, check for the highest number and add one            
            for (let cntC = 0; cntC < lsOD['CHAR'].length; cntC++) {
                if (lsOD['CHAR'][cntC].CHAR_NUM === liODChar[cntODC].CHAR_NUM) {
                    lRowID = parseInt(lsOD['CHAR'][cntC].ROW_ID);
                    break;
                }
                if (parseInt(lsOD['CHAR'][cntC].ROW_ID) > lRowID) {
                    lRowID = parseInt(lsOD['CHAR'][cntC].ROW_ID)
                }
                if (GenF.addOne(cntC) === lsOD['CHAR'].length) {
                    lRowID = parseInt(lRowID) + 1;
                    lUnique = 'X';
                }
            }


            lsODC['ROW_ID'] = lRowID;
            lsOD['CHAR'].push(GenF.parse(lsODC));

            if (lUnique === 'X') {
                let lsCharUni = {};
                lsCharUni['CHAR_NUM'] = lsODC['CHAR_NUM'];
                lsCharUni['ROW_ID'] = lsODC['ROW_ID'];
                lsCharUni['ORD_QTY'] = 0;
                lsOD['CHAR_UNI'].push(GenF.parse(lsCharUni));
            }

            if (cntODC == GenF.addOne(cntODC, liODChar.length) ||
                liODChar[cntODC].OBJ_DEP !== liODChar[GenF.addOne(cntODC, liODChar.length)].OBJ_DEP ||
                liODChar[cntODC].OBJ_COUNTER !== liODChar[GenF.addOne(cntODC, liODChar.length)].OBJ_COUNTER) {
                liOD.push(lsOD);
            }
        }

        var aAlert =[];
        for (let i = 0; i < liSalesCount.length; i++) {
            await DELETE.from('CP_VC_HISTORY_TS_CUST')
                .where({
                    xpr: [
                        { ref: ["LOCATION_ID"] }, '=', { val: liSalesCount[i].LOCATION_ID }, 'and',
                        { ref: ["PRODUCT_ID"] }, '=', { val: liSalesCount[i].PRODUCT_ID }, 'and',
                        { ref: ["CUSTOMER_ID"] }, '=', { val: liSalesCount[i].CUSTOMER_ID }, 'and',
                        { ref: ["PERIOD_NUM"] }, '=', { val: liSalesCount[i].WEEK_NO }, 'and',
                        { ref: ["TYPE"] }, '=', { val: 'OD' }
                    ]
                });

            let liODTemp = GenF.parse(liOD);

            let liSalesHead = await cds.run(
                `SELECT DISTINCT SALES_DOC,
                                 SALESDOC_ITEM,
                                 ORD_QTY
                    FROM V_SALES_H
                    WHERE LOCATION_ID   = '` + liSalesCount[i].LOCATION_ID + `'
                    AND ( MAT_AVAILDATE <= '` + liSalesCount[i].WEEK_DATE + `'
                    AND MAT_AVAILDATE > '` + GenF.getLastWeekDate(liSalesCount[i].WEEK_DATE) + `' )
                    AND PRODUCT_ID    = '` + liSalesCount[i].PRODUCT_ID + `'
                    AND CUSTOMER_ID    = '` + liSalesCount[i].CUSTOMER_ID + `'
                    ORDER BY SALES_DOC,
                            SALESDOC_ITEM`
            );

            let liSalesConfig = await cds.run(
                `SELECT DISTINCT A.SALES_DOC,
                        A.SALESDOC_ITEM,
                        A.ORD_QTY,
                        B.CHAR_NUM,
                        B.CHARVAL_NUM
                   FROM V_SALES_H AS A
                  INNER JOIN V_UNIQUE_ID AS B
                     ON A.UNIQUE_ID   = B.UNIQUE_ID
                    AND A.REF_PRODID  = B.PRODUCT_ID
                  WHERE A.LOCATION_ID   = '` + liSalesCount[i].LOCATION_ID + `'
                    AND ( A.MAT_AVAILDATE <= '` + liSalesCount[i].WEEK_DATE + `'
                    AND A.MAT_AVAILDATE > '` + GenF.getLastWeekDate(liSalesCount[i].WEEK_DATE) + `' )
                    AND A.PRODUCT_ID    = '` + liSalesCount[i].PRODUCT_ID + `'
                    AND CUSTOMER_ID    = '` + liSalesCount[i].CUSTOMER_ID + `'
                  ORDER BY A.SALES_DOC,
                           A.SALESDOC_ITEM`
            );

            let liVCHistory = [];

            for (let cntODT = 0; cntODT < liODTemp.length; cntODT++) {

                for (let cntODTC = 0; cntODTC < liODTemp[cntODT]['CHAR'].length; cntODTC++) {

                    liODTemp[cntODT]['CHAR'][cntODTC]['CHAR_QTY'] = 0;
                    liODTemp[cntODT]['CHAR'][cntODTC]['SO'] = []
                    let lSO = {};
                    for (let cntSC = 0; cntSC < liSalesConfig.length; cntSC++) {
                        if (liSalesConfig[cntSC].CHAR_NUM === liODTemp[cntODT]['CHAR'][cntODTC].CHAR_NUM) {
                            if (liODTemp[cntODT]['CHAR'][cntODTC].OD_CONDITION === "EQ") {
                                if (liSalesConfig[cntSC].CHARVAL_NUM === liODTemp[cntODT]['CHAR'][cntODTC].CHARVAL_NUM) {
                                    lSO = {};
                                    lSO['SALES_DOC'] = GenF.parse(liSalesConfig[cntSC].SALES_DOC);
                                    lSO['SALESDOC_ITEM'] = GenF.parse(liSalesConfig[cntSC].SALESDOC_ITEM);
                                    lSO['ORD_QTY'] = GenF.parse(liSalesConfig[cntSC].ORD_QTY);
                                    liODTemp[cntODT]['CHAR'][cntODTC]['SO'].push(lSO);

                                    for (let cntODCU = 0; cntODCU < liODTemp[cntODT]['CHAR_UNI'].length; cntODCU++) {
                                        if (liODTemp[cntODT]['CHAR_UNI'][cntODCU]['CHAR_NUM'] === liSalesConfig[cntSC].CHAR_NUM) {
                                            liODTemp[cntODT]['CHAR_UNI'][cntODCU]['ORD_QTY'] = parseInt(liODTemp[cntODT]['CHAR_UNI'][cntODCU]['ORD_QTY']) + parseInt(liSalesConfig[cntSC].ORD_QTY);
                                        }
                                    }

                                    liODTemp[cntODT]['CHAR'][cntODTC]['CHAR_QTY'] = parseInt(liODTemp[cntODT]['CHAR'][cntODTC]['CHAR_QTY'])
                                        + parseInt(lSO['ORD_QTY']);
                                }
                            } else {
                                if (liSalesConfig[cntSC].CHARVAL_NUM !== liODTemp[cntODT]['CHAR'][cntODTC].CHARVAL_NUM) {
                                    lSO = {};
                                    lSO['SALES_DOC'] = GenF.parse(liSalesConfig[cntSC].SALES_DOC);
                                    lSO['SALESDOC_ITEM'] = GenF.parse(liSalesConfig[cntSC].SALESDOC_ITEM);
                                    lSO['ORD_QTY'] = GenF.parse(liSalesConfig[cntSC].ORD_QTY);
                                    liODTemp[cntODT]['CHAR'][cntODTC]['SO'].push(lSO);


                                    for (let cntODCU = 0; cntODCU < liODTemp[cntODT]['CHAR_UNI'].length; cntODCU++) {
                                        if (liODTemp[cntODT]['CHAR_UNI'][cntODCU]['CHAR_NUM'] === liSalesConfig[cntSC].CHAR_NUM) {
                                            liODTemp[cntODT]['CHAR_UNI'][cntODCU]['ORD_QTY'] = parseInt(liODTemp[cntODT]['CHAR_UNI'][cntODCU]['ORD_QTY']) + parseInt(liSalesConfig[cntSC].ORD_QTY);
                                        }
                                    }

                                    liODTemp[cntODT]['CHAR'][cntODTC]['CHAR_QTY'] = parseInt(liODTemp[cntODT]['CHAR'][cntODTC]['CHAR_QTY'])
                                        + parseInt(lSO['ORD_QTY']);
                                }
                            }
                        }

                    }
                }

                liODTemp[cntODT]['OD_QTY'] = 0;

                for (let cntSO = 0; cntSO < liSalesHead.length; cntSO++) {
                    let lSuccess = ''
                    for (let cntODTC = 0; cntODTC < liODTemp[cntODT]['CHAR'].length; cntODTC++) {
                        if (liODTemp[cntODT]['CHAR'][cntODTC].CHAR_COUNTER !== liODTemp[cntODT]['CHAR'][GenF.subOne(cntODTC, liODTemp[cntODT]['CHAR'].length)].CHAR_COUNTER
                            || cntODTC === 0) {
                            lSuccess = '';
                        }

                        for (let cntCSO = 0; cntCSO < liODTemp[cntODT]['CHAR'][cntODTC]['SO'].length; cntCSO++) {
                            if (liODTemp[cntODT]['CHAR'][cntODTC]['SO'][cntCSO]['SALES_DOC'] === liSalesHead[cntSO].SALES_DOC &&
                                liODTemp[cntODT]['CHAR'][cntODTC]['SO'][cntCSO]['SALESDOC_ITEM'] === liSalesHead[cntSO].SALESDOC_ITEM) {
                                lSuccess = 'X';
                                break;
                            }
                        }
                        if (lSuccess === '') {
                            if (liODTemp[cntODT]['CHAR'][cntODTC].CHAR_COUNTER !== liODTemp[cntODT]['CHAR'][GenF.addOne(cntODTC, liODTemp[cntODT]['CHAR'].length)].CHAR_COUNTER
                                || cntODTC === GenF.addOne(cntODTC, liODTemp[cntODT]['CHAR'].length)) {
                                break;
                            }
                        }
                    }
                    if (lSuccess === 'X') {
                        liODTemp[cntODT]['OD_QTY'] = parseInt(liODTemp[cntODT]['OD_QTY']) + parseInt(liSalesHead[cntSO].ORD_QTY);
                    }
                }

                let lsVCHistory = {};
                lsVCHistory['PERIOD_NUM'] = GenF.parse(liSalesCount[i].WEEK_NO);
                lsVCHistory['LOCATION_ID'] = GenF.parse(liSalesCount[i].LOCATION_ID);
                lsVCHistory['CUSTOMER_ID'] = GenF.parse(liSalesCount[i].CUSTOMER_ID);
                lsVCHistory['PRODUCT_ID'] = GenF.parse(liSalesCount[i].PRODUCT_ID);
                lsVCHistory['TYPE'] = 'OD';
                lsVCHistory['GROUP_ID'] = GenF.parse(liODTemp[cntODT].OBJ_DEP + '_' + liODTemp[cntODT].OBJ_COUNTER);
                lsVCHistory['GROUP_COUNT'] = GenF.parse(liODTemp[cntODT].OD_QTY);
                lsVCHistory['GROUP_COUNT_RATE'] = (parseInt(liODTemp[cntODT].OD_QTY) / parseInt(liSalesCount[i].ORD_QTY) * 100).toFixed(2);

                for (let cntODTC = 0; cntODTC < liODTemp[cntODT]['CHAR_UNI'].length; cntODTC++) {
                    lsVCHistory['ROW'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC].ROW_ID;
                    lsVCHistory['CHAR_NUM'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC].CHAR_NUM;
                    lsVCHistory['ATTRIBUTE'] = 'att' + liODTemp[cntODT]['CHAR_UNI'][cntODTC].ROW_ID;
                    lsVCHistory['CHAR_COUNT'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC]['ORD_QTY'];

                    lsVCHistory['CHAR_COUNT_RATE'] = (parseInt(lsVCHistory['CHAR_COUNT']) / parseInt(liSalesCount[i].ORD_QTY) * 100).toFixed(2);

                    liVCHistory.push(GenF.parse(lsVCHistory));
                }

            }

            if (liVCHistory.length > 0) {
                try {
                    cds.run({
                        INSERT:
                        {
                            into: { ref: ['CP_VC_HISTORY_TS_CUST'] },
                            entries: liVCHistory
                        }
                    });
                    Flag = 'S';
                }
                catch (error) {
                    console.log(error);
                    sError = 'Reason: '+error.message;
                }
                aAlert = aAlert.concat(liVCHistory);
            }

        }
          //Alert
        if(aAlert.length >0){
                await GenF.sendTimeseriesAlert(aAlert,req);
        }
        await GenF.logMessage(req, `Completed history timeseries`);
        if (Flag === 'S') {
            // await GenF.jobSchMessage('X', "Timeseries History generation is complete", req);
            oReturn.bError = false;
            oReturn.message = "Timeseries History generation is complete";
        }
        else {
            // await GenF.jobSchMessage('', "Timeseries History generation failed", req);
            oReturn.bError = true;
            oReturn.message = "Timeseries History generation failed."+sError;
        }
        return oReturn;
    }

}

module.exports = GenTimeseries;