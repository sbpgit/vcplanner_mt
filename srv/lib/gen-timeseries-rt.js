const GenF = require("./gen-functions");
const cds = require("@sap/cds");
const hana = require("@sap/hana-client");
const {   subWeeks,   getISOWeek,   getISOWeekYear } = require('date-fns');


class GenTimeseries {
    constructor() { }

    /**
     * Generate Timeseries
     */
    async genTimeseries_rt(adata, req) {
        let Flag = '';
        await GenF.logMessage(req, `Started restrictions history timeseries`);
        console.log(`Step 1: Started restrictions history timeseries`);
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
        console.log(`Step 2: Timeseries for Restrictions`);

        let lMainProduct = '';
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
        console.log(`Step 3: Timeseries for Restrictions`);

        let vToDate = new Date();
        vToDate.setDate(vToDate.getDate());
        vToDate = vToDate.toISOString().split('Z')[0].split('T')[0];
        console.log(vToDate);
        // Get factory location
        let vFactoryLoc = await GenF.getFactoryLoc(adata.LOCATION_ID, adata.PRODUCT_ID);
        console.log(vFactoryLoc);
        const liODChar = await cds.run(
            `SELECT DISTINCT RESTRICTION,
                            RTR_COUNTER,
                            CLASS_NUM,
                            CHAR_NUM,
                            CHARVAL_NUM,
                            OD_CONDITION,
                            CHAR_COUNTER,
                            VALID_FROM,
                            VALID_TO
            FROM "V_LOCPRODRT_DETAILS"
            WHERE LOCATION_ID = '${vFactoryLoc}'
                AND PRODUCT_ID  = '${lMainProduct}'
                AND VALID_TO > '${vToDate}'
                ORDER BY RESTRICTION,
                         RTR_COUNTER,
                         CHAR_COUNTER`
        );
        console.log(`Step 4: Timeseries for Restrictions`);

        let liOD = [];
        let lsOD = {};
        let lRowID = 0;

        for (let cntODC = 0; cntODC < liODChar.length; cntODC++) {
            if (cntODC === 0 ||
                liODChar[cntODC].RESTRICTION !== liODChar[GenF.subOne(cntODC)].RESTRICTION ||
                liODChar[cntODC].RTR_COUNTER !== liODChar[GenF.subOne(cntODC)].RTR_COUNTER) {
                lsOD = {};
                lsOD['RESTRICTION'] = GenF.parse(liODChar[cntODC].RESTRICTION);
                lsOD['RTR_COUNTER'] = GenF.parse(liODChar[cntODC].RTR_COUNTER);
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
                liODChar[cntODC].RESTRICTION !== liODChar[GenF.addOne(cntODC, liODChar.length)].RESTRICTION ||
                liODChar[cntODC].RTR_COUNTER !== liODChar[GenF.addOne(cntODC, liODChar.length)].RTR_COUNTER) {
                liOD.push(lsOD);
            }
        }
        console.log(`Step 5: Timeseries for Restrictions`);

        for (let i = 0; i < liSalesCount.length; i++) {
            // liVCHistory = [];
            await DELETE.from('CP_VC_HISTORY_TS')
                .where({
                    xpr: [
                        { ref: ["LOCATION_ID"] }, '=', { val: liSalesCount[i].LOCATION_ID }, 'and',
                        { ref: ["PRODUCT_ID"] }, '=', { val: liSalesCount[i].PRODUCT_ID }, 'and',
                        { ref: ["PERIOD_NUM"] }, '=', { val: liSalesCount[i].WEEK_NO }, 'and',
                        { ref: ["TYPE"] }, '=', { val: 'RT' }
                    ]
                });

            console.log(`Step 6: Timeseries for Restrictions`);


            let liODTemp = GenF.parse(liOD);

            let liSalesHead = await cds.run(
                `SELECT DISTINCT SALES_DOC,
                                 SALESDOC_ITEM,
                                 ORD_QTY
                    FROM V_SALES_H
                    WHERE LOCATION_ID   = '` + liSalesCount[i].LOCATION_ID + `'
                    AND MAT_AVAILDATE <= '` + liSalesCount[i].WEEK_DATE + `' 
                    AND MAT_AVAILDATE > '` + GenF.getLastWeekDate(liSalesCount[i].WEEK_DATE) + `' 
                    AND PRODUCT_ID    = '` + liSalesCount[i].PRODUCT_ID + `'
                    ORDER BY SALES_DOC,
                            SALESDOC_ITEM`
            );

            console.log(`Step 7: Timeseries for Restrictions`);

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
                    AND A.MAT_AVAILDATE <= '` + liSalesCount[i].WEEK_DATE + `' 
                    AND A.MAT_AVAILDATE > '` + GenF.getLastWeekDate(liSalesCount[i].WEEK_DATE) + `' 
                    AND A.PRODUCT_ID    = '` + liSalesCount[i].PRODUCT_ID + `'
                  ORDER BY A.SALES_DOC,
                           A.SALESDOC_ITEM`
            );
            console.log(`Step 8: Timeseries for Restrictions`);

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
                console.log(
                    `Step 8.1: Timeseries for Restrictions ${liODTemp[cntODT]}`
                );

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

                console.log(`Step 8.2: Timeseries for Restrictions`);

                let lsVCHistory = {};
                lsVCHistory['PERIOD_NUM'] = GenF.parse(liSalesCount[i].WEEK_NO);
                lsVCHistory['LOCATION_ID'] = GenF.parse(liSalesCount[i].LOCATION_ID);
                lsVCHistory['PRODUCT_ID'] = GenF.parse(liSalesCount[i].PRODUCT_ID);
                lsVCHistory['TYPE'] = 'RT';
                lsVCHistory['GROUP_ID'] = GenF.parse(liODTemp[cntODT].RESTRICTION + '_' + liODTemp[cntODT].RTR_COUNTER);
                lsVCHistory['GROUP_COUNT'] = GenF.parse(liODTemp[cntODT].OD_QTY);
                // lsVCHistory['GROUP_COUNT_RATE'] = (parseInt(liODTemp[cntODT].OD_QTY) / parseInt(liSalesCount[i].ORD_QTY) * 100).toFixed(2);

                /** PREDDY -start */
                if (liSalesCount[i].ORD_QTY > 0) {
                    /** PREDDY - End */

                    lsVCHistory["GROUP_COUNT_RATE"] = (
                        (parseInt(liODTemp[cntODT].OD_QTY) /
                            parseInt(liSalesCount[i].ORD_QTY)) *
                        100
                    ).toFixed(2);

                    /** PREDDY - Start */
                } else {
                    lsVCHistory["GROUP_COUNT_RATE"] = 0;
                }
                /** PREDDY - End */

                console.log(`Step 8.3: Timeseries for Restrictions`);
                for (let cntODTC = 0; cntODTC < liODTemp[cntODT]['CHAR_UNI'].length; cntODTC++) {
                    lsVCHistory['ROW'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC].ROW_ID;
                    lsVCHistory['CHAR_NUM'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC].CHAR_NUM;
                    lsVCHistory['ATTRIBUTE'] = 'att' + liODTemp[cntODT]['CHAR_UNI'][cntODTC].ROW_ID;
                    lsVCHistory['CHAR_COUNT'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC]['ORD_QTY'];

                    // lsVCHistory['CHAR_COUNT_RATE'] = (parseInt(lsVCHistory['CHAR_COUNT']) / parseInt(liSalesCount[i].ORD_QTY) * 100).toFixed(2);

                    /** PREDDY -start */
                    if (liSalesCount[i].ORD_QTY > 0) {
                        /** PREDDY - End */

                        lsVCHistory["CHAR_COUNT_RATE"] = (
                            (parseInt(lsVCHistory["CHAR_COUNT"]) /
                                parseInt(liSalesCount[i].ORD_QTY)) *
                            100
                        ).toFixed(2);
                        /** PREDDY - Start */
                    } else {
                        lsVCHistory["CHAR_COUNT_RATE"] = 0;
                    }
                    /** PREDDY - End */

                    liVCHistory.push(GenF.parse(lsVCHistory));
                    console.log(
                        `Step 8.4: ${lsVCHistory["CHAR_COUNT"]}, ${lsVCHistory["CHAR_COUNT_RATE"]}, ${lsVCHistory["GROUP_COUNT"]}, ${lsVCHistory["GROUP_COUNT_RATE"]}`
                      );
            
                }
            }
            console.log(`Step 9: Timeseries for Restrictions`);
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
        console.log(`Step 10: Timeseries for Restrictions`);
        if (Flag === 'S') {
            // await GenF.jobSchMessage('X', "Timeseries History generation is complete for Restrictions", req);
            oReturn.bError = false;
            oReturn.message = "Timeseries History generation is complete for Restrictions";
        }
        else {
            // await GenF.jobSchMessage('', "Timeseries History generation failed for Restrictions", req);
            oReturn.bError = true;
            oReturn.message = "Timeseries History generation failed for Restrictions";
        }
        return oReturn;
    }

    async genTimeseriesF_rt(adata, req) {
        let Flag = '';
        await GenF.logMessage(req, `Started restrictions future timeseries`);

        // var conn = hana.createConnection(),
        //     stmt;

        // conn.connect(conn_params_container);
        // var sqlStr = "SET SCHEMA " + containerSchema;

        // try {
        //     stmt = conn.prepare(sqlStr);
        //     result = stmt.exec();
        //     stmt.drop();
        // } catch (error) {
        //     console.log("Error: " + error.message);
        // }
        const lStartTime = new Date();
        console.log("Started timeseries Service");
        var oReturn = {
            bError: false,
            message: ''
        }
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
        /** Get Future Plan */
        const liFutureCharPlan = await cds.run(
            `SELECT DISTINCT LOCATION_ID, 
                        PRODUCT_ID, 
                        VERSION,
                        SCENARIO,
                        MODEL_VERSION,
                        WEEK_DATE
            FROM "CP_IBP_FCHARPLAN"
            WHERE "LOCATION_ID" = '` + adata.LOCATION_ID + `'
            AND "PRODUCT_ID" = '` + adata.PRODUCT_ID + `'
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
        /*
                try {
                    var sqlStr =
                        `DELETE FROM CP_TS_OBJDEP_CHARHDR_F 
                         WHERE LOCATION_ID = '` + adata.LOCATION_ID + `' 
                           AND PRODUCT_ID = '` + adata.PRODUCT_ID + `'
                           AND OBJ_TYPE = 'OD'`
                    var stmt = conn.prepare(sqlStr);
                    await stmt.exec();
                    stmt.drop();
        
                } catch (error) {
                    console.log("Error: " + error.message);
                }
        */

        await DELETE.from('CP_TS_OBJDEP_CHARHDR_F')
            .where(`LOCATION_ID = '${adata.LOCATION_ID}'
                    AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                    AND OBJ_TYPE = 'RT'`);


        let vToDate = new Date();
        vToDate.setDate(vToDate.getDate());
        vToDate = vToDate.toISOString().split('Z')[0].split('T')[0];
        console.log(vToDate);
        // Get Factory location
        let vFactoryLoc = await GenF.getFactoryLoc(adata.LOCATION_ID, adata.PRODUCT_ID);
        // Get restriciton details
        liObdhdr = await cds.run(
            `SELECT *
           FROM "V_LOCPRODRT_DETAILS_M1"
          WHERE LOCATION_ID = '` + adata.LOCATION_ID + `'
            AND PRODUCT_ID = '` + adata.PRODUCT_ID + `'
            AND VALID_TO > '${vToDate}'`
        );
        let liObdhdrDist = await cds.run(
            `SELECT DISTINCT RESTRICTION,
                        RTR_COUNTER,
                        ROW_ID,
                        CHAR_NUM
           FROM "V_LOCPRODRT_DETAILS_M1"
          WHERE LOCATION_ID = '` + adata.LOCATION_ID + `'
            AND PRODUCT_ID = '` + adata.PRODUCT_ID + `'
            AND VALID_TO > '${vToDate}'`
        );
        var aDeltaData =[];
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
                        A."MODEL_VERSION",
                        A."WEEK_DATE",
                        A."OPT_PERCENT",
                        A."OPT_QTY",
                        A."MANUALOPTION" 
               FROM "CP_IBP_FCHARPLAN" AS A
               INNER JOIN "CP_PARTIALPROD_INTRO" AS B
                ON A.LOCATION_ID = B.LOCATION_ID
                AND A.PRODUCT_ID = B.PRODUCT_ID
               WHERE A.LOCATION_ID = '` + liFutureCharPlan[lFutInd].LOCATION_ID + `'
               AND A.PRODUCT_ID = '` + liFutureCharPlan[lFutInd].PRODUCT_ID + `'
               AND A.VERSION = '` + liFutureCharPlan[lFutInd].VERSION + `'
               AND A.SCENARIO = '` + liFutureCharPlan[lFutInd].SCENARIO + `'
               AND A.MODEL_VERSION = '` + liFutureCharPlan[lFutInd].MODEL_VERSION + `'
               AND A.WEEK_DATE = '` + liFutureCharPlan[lFutInd].WEEK_DATE + `'`
            );

            liObjdepF = [];
            let tableObjH = [],
                rowObjH = [],
                vSuccessRate = 0;
            for (let lObdDis = 0; lObdDis < liObdhdrDist.length; lObdDis++) {
                lsObjdepF = {};
                //rowObjH = [];
                lsObjdepF.CAL_DATE = liFutureCharPlan[lFutInd].WEEK_DATE;
                lsObjdepF.LOCATION_ID = liFutureCharPlan[lFutInd].LOCATION_ID;
                lsObjdepF.PRODUCT_ID = liFutureCharPlan[lFutInd].PRODUCT_ID;
                lsObjdepF.VERSION = liFutureCharPlan[lFutInd].VERSION;
                lsObjdepF.SCENARIO = liFutureCharPlan[lFutInd].SCENARIO;
                lsObjdepF.MODEL_VERSION = liFutureCharPlan[lFutInd].MODEL_VERSION;
                lsObjdepF.OBJ_TYPE = "RT";
                lsObjdepF.OBJ_DEP = liObdhdrDist[lObdDis].RESTRICTION;
                lsObjdepF.OBJ_COUNTER = liObdhdrDist[lObdDis].RTR_COUNTER;
                lsObjdepF.ROW_ID = liObdhdrDist[lObdDis].ROW_ID;
                lsObjdepF.CHAR_NUM = GenF.parse(liObdhdrDist[lObdDis].CHAR_NUM);
                lsObjdepF.SUCCESS = 0;

                for (let lObjInd = 0; lObjInd < liObdhdr.length; lObjInd++) {
                    if (
                        liObdhdrDist[lObdDis].RESTRICTION === liObdhdr[lObjInd].RESTRICTION &&
                        liObdhdrDist[lObdDis].RTR_COUNTER ===
                        liObdhdr[lObjInd].RTR_COUNTER &&
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
                                liFutureCharPlanDate[lFutIndex].PRODUCT_ID ===
                                liObdhdr[lObjInd].PRODUCT_ID &&
                                liFutureCharPlanDate[lFutIndex].VERSION ===
                                liFutureCharPlan[lFutInd].VERSION &&
                                liFutureCharPlanDate[lFutIndex].SCENARIO ===
                                liFutureCharPlan[lFutInd].SCENARIO &&
                                liFutureCharPlanDate[lFutIndex].MODEL_VERSION ===
                                liFutureCharPlan[lFutInd].MODEL_VERSION &&
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
                                        parseInt(lsObjdepF.SUCCESS) + parseInt(liFutureCharPlanDate[lFutIndex].OPT_QTY);
                                }
                                if (
                                    liObdhdr[lObjInd].OD_CONDITION === "NE" &&
                                    liObdhdr[lObjInd].CHARVAL_NUM !==
                                    liFutureCharPlanDate[lFutIndex].CHARVAL_NUM
                                ) {
                                    lsObjdepF.SUCCESS =
                                        parseInt(lsObjdepF.SUCCESS) + parseFloat(liFutureCharPlanDate[lFutIndex].OPT_QTY);
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
               WHERE LOCATION_ID = '` + liFutureCharPlan[lFutInd].LOCATION_ID + `'
               AND PRODUCT_ID    = '` + liFutureCharPlan[lFutInd].PRODUCT_ID + `'
               AND WEEK_DATE     = '` + liFutureCharPlan[lFutInd].WEEK_DATE + `'
               AND VERSION       = '` + liFutureCharPlan[lFutInd].VERSION + `'
               AND SCENARIO      = '` + liFutureCharPlan[lFutInd].SCENARIO + `'`
            );
            if (liFutureDemandPlanDate) {            // PREDDY
            if (liObjdepF.length > 0) {
                try {
                    for (let index = 0; index < liObjdepF.length; index++) {
                        //            tableObjH[index][10] = 0;
                        liObjdepF[index].SUCCESS_RATE = 0;
                        for (
                            let lDemI = 0;
                            lDemI < liFutureDemandPlanDate.length;
                            lDemI++
                        ) {
                            if (liFutureDemandPlanDate[lDemI].QUANTITY !== null) {   //PREDDY                            
                            if (liFutureDemandPlanDate[lDemI].QUANTITY > 0) {

                                liObjdepF[index].SUCCESS_RATE =
                                    (liObjdepF[index].SUCCESS /
                                        liFutureDemandPlanDate[lDemI].QUANTITY) *
                                    100;
                            }
                        }
                        }
                        await cds.run({
                            INSERT: {
                                into: { ref: ['CP_TS_OBJDEP_CHARHDR_F'] },
                                values: [liObjdepF[index].CAL_DATE,
                                liObjdepF[index].LOCATION_ID,
                                liObjdepF[index].PRODUCT_ID,
                                liObjdepF[index].OBJ_TYPE,
                                liObjdepF[index].OBJ_DEP,
                                liObjdepF[index].OBJ_COUNTER,
                                liObjdepF[index].ROW_ID,
                                liObjdepF[index].VERSION,
                                liObjdepF[index].SCENARIO,
                                liObjdepF[index].CHAR_NUM,
                                liObjdepF[index].SUCCESS,
                                liObjdepF[index].SUCCESS_RATE]
                            }
                        })
                        aDeltaData.push({
                            LOCATION_ID: liObjdepF[index].LOCATION_ID,
                            PRODUCT_ID: liObjdepF[index].PRODUCT_ID,
                            VERSION: liObjdepF[index].VERSION,
                            SCENARIO: liObjdepF[index].SCENARIO,
                            MODEL_VERSION: liObjdepF[index].MODEL_VERSION,
                            WEEK_DATE: liObjdepF[index].CAL_DATE
                        })
                        Flag = 'X';
                    }

                    //await cds.run(INSERT.into("CP_TS_OBJDEP_CHARHDR_F").entries(liObjdepF));
                } catch (e) {
                    console.log("Error: " + e.message + "/" + e.query);
                }
            }
            }
        }

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

        // await GenF.logMessage(req, `Completed restrictions future timeseries`);
        if (Flag === 'X') {
            oReturn.bError = false;
            oReturn.message = "Timeseries Future generation is complete for restrictions";
            // await GenF.jobSchMessage(Flag, `Timeseries Future generation is complete for restrictions`, req);
        }
        else {
            oReturn.bError = true;
            oReturn.message = "Timeseries Future generation failed for restrictions";
            // await GenF.jobSchMessage(Flag, `Timeseries Future generation failed for restrictions`, req);
        }
        return oReturn;
    }
    async genTimeseries_rt_cust(adata, req) {
        let Flag = '';
        await GenF.logMessage(req, `Started restrictions history timeseries`);

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
                AND "CUSTOMER_GROUP"  IN  (SELECT CUSTOMER_GROUP from CP_CUSTOMERGROUP)
                AND "WEEK_DATE" BETWEEN '${pastDate}' AND '${vCurrDate}'
                ORDER BY "LOCATION_ID" ASC,
                         "PRODUCT_ID" ASC,
                         "WEEK_DATE" ASC`
        );
        //         AND "WEEK_DATE" <= '${vCurrDate}'
        //         ORDER BY "LOCATION_ID" ASC,
        //                  "PRODUCT_ID" ASC,
        //                  "WEEK_DATE" ASC`
        // );
        let lMainProduct = '';
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
        let vToDate = new Date();
        vToDate.setDate(vToDate.getDate());
        vToDate = vToDate.toISOString().split('Z')[0].split('T')[0];
        console.log(vToDate);
        // Get factory location
        let vFactoryLoc = await GenF.getFactoryLoc(adata.LOCATION_ID, adata.PRODUCT_ID);
        console.log(vFactoryLoc);
        const liODChar = await cds.run(
            `SELECT DISTINCT RESTRICTION,
                            RTR_COUNTER,
                            CLASS_NUM,
                            CHAR_NUM,
                            CHARVAL_NUM,
                            OD_CONDITION,
                            CHAR_COUNTER,
                            VALID_FROM,
                            VALID_TO
            FROM "V_LOCPRODRT_DETAILS"
            WHERE LOCATION_ID = '${vFactoryLoc}'
                AND PRODUCT_ID  = '${lMainProduct}'
                AND VALID_TO > '${vToDate}'
                ORDER BY RESTRICTION,
                         RTR_COUNTER,
                         CHAR_COUNTER`
        );


        let liOD = [];
        let lsOD = {};
        let lRowID = 0;

        for (let cntODC = 0; cntODC < liODChar.length; cntODC++) {
            if (cntODC === 0 ||
                liODChar[cntODC].RESTRICTION !== liODChar[GenF.subOne(cntODC)].RESTRICTION ||
                liODChar[cntODC].RTR_COUNTER !== liODChar[GenF.subOne(cntODC)].RTR_COUNTER) {
                lsOD = {};
                lsOD['RESTRICTION'] = GenF.parse(liODChar[cntODC].RESTRICTION);
                lsOD['RTR_COUNTER'] = GenF.parse(liODChar[cntODC].RTR_COUNTER);
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
                liODChar[cntODC].RESTRICTION !== liODChar[GenF.addOne(cntODC, liODChar.length)].RESTRICTION ||
                liODChar[cntODC].RTR_COUNTER !== liODChar[GenF.addOne(cntODC, liODChar.length)].RTR_COUNTER) {
                liOD.push(lsOD);
            }
        }


        for (let i = 0; i < liSalesCount.length; i++) {
            // liVCHistory = [];
            await DELETE.from('CP_VC_HISTORY_TS_CUST')
                .where({
                    xpr: [
                        { ref: ["LOCATION_ID"] }, '=', { val: liSalesCount[i].LOCATION_ID }, 'and',
                        { ref: ["PRODUCT_ID"] }, '=', { val: liSalesCount[i].PRODUCT_ID }, 'and',
                        { ref: ["CUSTOMER_GROUP"] }, '=', { val: liSalesCount[i].CUSTOMER_GROUP }, 'and',
                        { ref: ["PERIOD_NUM"] }, '=', { val: liSalesCount[i].WEEK_NO }, 'and',
                        { ref: ["TYPE"] }, '=', { val: 'RT' }
                    ]
                });

            let liODTemp = GenF.parse(liOD);

            let liSalesHead = await cds.run(
                `SELECT DISTINCT SALES_DOC,
                                 SALESDOC_ITEM,
                                 ORD_QTY
                    FROM V_SALES_H
                    WHERE LOCATION_ID   = '` + liSalesCount[i].LOCATION_ID + `'
                    AND MAT_AVAILDATE <= '` + liSalesCount[i].WEEK_DATE + `'
                    AND MAT_AVAILDATE > '` + GenF.getLastWeekDate(liSalesCount[i].WEEK_DATE) + `'
                    AND PRODUCT_ID    = '` + liSalesCount[i].PRODUCT_ID + `'
                    AND CUSTOMER_GROUP    = '` + liSalesCount[i].CUSTOMER_GROUP + `'
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
                    AND A.MAT_AVAILDATE <= '` + liSalesCount[i].WEEK_DATE + `'
                    AND A.MAT_AVAILDATE > '` + GenF.getLastWeekDate(liSalesCount[i].WEEK_DATE) + `'
                    AND A.PRODUCT_ID    = '` + liSalesCount[i].PRODUCT_ID + `'
                    AND CUSTOMER_GROUP    = '` + liSalesCount[i].CUSTOMER_GROUP + `'
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
                lsVCHistory['CUSTOMER_GROUP'] = GenF.parse(liSalesCount[i].CUSTOMER_GROUP);
                lsVCHistory['TYPE'] = 'RT';
                lsVCHistory['GROUP_ID'] = GenF.parse(liODTemp[cntODT].RESTRICTION + '_' + liODTemp[cntODT].RTR_COUNTER);
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
                    sError ='Reason: '+error.message;
                }

            }

        }

        if (Flag === 'S') {
            // await GenF.jobSchMessage('X', "Timeseries History generation is complete for Restrictions", req);
            oReturn.bError = false;
            oReturn.message = `Timeseries History generation is complete for Restrictions for Product ${adata.PRODUCT_ID}.`;
        }
        else {
            // await GenF.jobSchMessage('', "Timeseries History generation failed for Restrictions", req);
            oReturn.bError = true;
            oReturn.message = `Timeseries History generation failed for Restrictions for Product ${adata.PRODUCT_ID}.`+sError;
        }
        return oReturn;
    }

}

module.exports = GenTimeseries;
