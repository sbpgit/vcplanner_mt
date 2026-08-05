const GenF = require("./gen-functions");
const cds = require("@sap/cds");

class GenTimeseries {
    constructor() { }

    /**
     * Generate Timeseries
     */
    async genTimeseries(adata, req, Flag) {

        // await GenF.logMessage(req, `Started history daily timeseries ${adata}`);
        let vCurrDate = GenF.getCurrentDate();
        var oReturn={
            bError:false,
            message:''
        }
        var sError ='';
        // Get Sales Count Information

        const liSalesCount = await cds.run(
            `SELECT *
               FROM V_ORD_COUNT_DAILY
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

        // Get Object Dependency
        const liODChar = await cds.run(
            `SELECT DISTINCT OBJ_DEP,
                            OBJ_COUNTER,
                            CHAR_NUM,
                            CHARVAL_NUM,
                            OD_CONDITION,
                            CHAR_COUNTER
                        FROM "V_OBDHDR"
                        WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                            AND PRODUCT_ID  = '${lMainProduct}'
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
            if(lsOD['CHAR'].length === 0) {
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

            if(lUnique === 'X'){
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
            await DELETE.from('CP_VC_HISTORY_DAILY_TS')
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
                    WHERE LOCATION_ID   = '` + liSalesCount[i].LOCATION_ID + `'
                    AND ( MAT_AVAILDATE <= '` + liSalesCount[i].WEEK_DATE + `' 
                    AND MAT_AVAILDATE > '` + GenF.getLastWeekDate(liSalesCount[i].WEEK_DATE) + `' )
                    AND PRODUCT_ID    = '` + liSalesCount[i].PRODUCT_ID + `'
                    ORDER BY SALES_DOC,
                            SALESDOC_ITEM`
            );

            let liSalesConfig = await cds.run(
                `SELECT A.SALES_DOC,
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
                    lsVCHistory['PERIOD_NUM']       = GenF.parse(liSalesCount[i].WEEK_NO);
                    lsVCHistory['LOCATION_ID']      = GenF.parse(liSalesCount[i].LOCATION_ID);
                    lsVCHistory['PRODUCT_ID']       = GenF.parse(liSalesCount[i].PRODUCT_ID);
                    lsVCHistory['TYPE']             = 'OD';
                    lsVCHistory['GROUP_ID']         = GenF.parse(liODTemp[cntODT].OBJ_DEP + '_' + liODTemp[cntODT].OBJ_COUNTER);
                    lsVCHistory['GROUP_COUNT']      = GenF.parse(liODTemp[cntODT].OD_QTY);
                    lsVCHistory['GROUP_COUNT_RATE'] = (parseInt(liODTemp[cntODT].OD_QTY) / parseInt(liSalesCount[i].ORD_QTY) * 100).toFixed(2);

                    for (let cntODTC = 0; cntODTC < liODTemp[cntODT]['CHAR_UNI'].length; cntODTC++) {
                            lsVCHistory['ROW'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC].ROW_ID;
                            lsVCHistory['CHAR_NUM'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC].CHAR_NUM;
                            lsVCHistory['ATTRIBUTE'] = 'att' + liODTemp[cntODT]['CHAR_UNI'][cntODTC].ROW_ID;
                            lsVCHistory['CHAR_COUNT'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC]['ORD_QTY'];

                            lsVCHistory['CHAR_COUNT_RATE'] = (parseInt(lsVCHistory['CHAR_COUNT']) / parseInt(liSalesCount[i].ORD_QTY)  * 100).toFixed(2);

                            liVCHistory.push(GenF.parse(lsVCHistory));
                    }                    

            }

            if (liVCHistory.length > 0) {
                try {
                    // cds.run({
                    //     INSERT:
                    //     {
                    //         into: { ref: ['CP_VC_HISTORY_DAILY_TS'] },
                    //         entries: liVCHistory
                    //     }
                    // });
                    await cds.run( INSERT.into("CP_VC_HISTORY_DAILY_TS").entries(liVCHistory));
                    Flag = 'S';
                }
                catch (error) {
                    console.log(error);
                    sError='Reason: '+error.message;
                }
                aAlert = aAlert.concat(liVCHistory);
            }

        }
         //Alert
        if(aAlert.length >0){
                await GenF.sendTimeseriesAlert(aAlert,req);
        }

        // await GenF.logMessage(req, `Completed history timeseries`);
        if (Flag === 'S') {
            
            // await GenF.jobSchMessage('X', "Timeseries History generation is complete", req);
            oReturn.bError = false;
            oReturn.message = "Timeseries History generation is complete";
        }
        else {
            // await GenF.jobSchMessage('', "Timeseries History generation failed", req);
            oReturn.bError = true;
            oReturn.message = `Timeseries History generation failed for Location: ${adata.LOCATION_ID} and Product: ${adata.PRODUCT_ID}.`+sError;
        }
        return oReturn;
    }

    /**
     * Generate Timeseries for M2
     */
    async genTimeseriesM2(adata, req, Flag) {

        // await GenF.logMessage(req, `Started history timeseries`);
        let lFlag = '', FlagTest = '';
        var oReturn={
            bError:false,
            message:''
        }
        var sError ='';
        let liPrimaryID = [],lMainProduct;
        let lsPrimaryID = {};
        let vCurrDate = GenF.getCurrentDate();
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
       

        const liPrimaryIDMain = await cds.run(`SELECT 
                                                    "UNIQUE_ID",
                                                    "PRODUCT_ID",
                                                    "UNIQUE_DESC",
                                                    "UID_TYPE",
                                                    "ACTIVE",
                                                    "CHAR_NUM",
                                                    "CHARVAL_NUM"
                                                FROM V_UNIQUE_ID
                                                WHERE (UNIQUE_ID IN (SELECT DISTINCT PRIMARY_ID
                                                        FROM CP_SALES_HM
                                                        WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                            AND PRODUCT_ID = '${adata.PRODUCT_ID}'))
                                                    AND "UID_TYPE" = 'P'
                                                    AND "ACTIVE" = true
                                                ORDER BY 
                                                    "UNIQUE_ID" ASC, 
                                                    "CHAR_NUM" ASC;`);


        // Remove Partial Characteristics
        const lipartialchar = await cds.run(
            `SELECT *
               FROM "V_PARTIALPRODCHAR"
              WHERE "LOCATION_ID" = '` + adata.LOCATION_ID + `'
                AND ( "PRODUCT_ID" = '` + adata.PRODUCT_ID + `')
                AND CONFIGPROD_CHK IS NULL`
        );

        for (let i = 0; i < liPrimaryIDMain.length; i++) {
            lFlag = '';
            for (let j = 0; j < lipartialchar.length; j++) {
                if (lipartialchar[j].CHAR_NUM === liPrimaryIDMain[i].CHAR_NUM &&
                    lipartialchar[j].CHARVAL_NUM === liPrimaryIDMain[i].CHARVAL_NUM) {
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
                lsPrimaryID.CHARVAL_NUM = GenF.parse(liPrimaryIDMain[i].CHARVAL_NUM);
                liPrimaryID.push(GenF.parse(lsPrimaryID));
                lsPrimaryID = {};
            }
        }

        if (liPrimaryID.length === 0) {
            let sInfo = "Unable to generate timeseries,Primary ID's for Product:"+adata.PRODUCT_ID+"does not exists in Sales History"
            await GenF.logMessage(req, sInfo);
            // await GenF.jobSchMessage('', "Please check characteristics Priority , unable to generate timeseries", req);
            oReturn.bError = true;
            oReturn.message = sInfo;
            return oReturn;
        }
        
        // Get Sales Count Information
        const liPrimaryCount = await cds.run(
            `SELECT A.PRODUCT_ID,
                    TO_VARCHAR (TO_DATE("MAT_AVAILDATE"), 'YYYYMMDD') AS WEEK_NO,
                    PRIMARY_ID,
                    B.ORD_QTY AS TARGET_QTY,
                    sum(A.ORD_QTY) AS ORD_QTY
               FROM V_SALES_H AS A
         INNER JOIN V_ORD_COUNT_DAILY AS B
                 ON A.LOCATION_ID = B.LOCATION_ID
                AND A.PRODUCT_ID  = B.PRODUCT_ID
                AND A.MAT_AVAILDATE = B.WEEK_DATE
              WHERE A.LOCATION_ID = '` + adata.LOCATION_ID + `'
                AND A.PRODUCT_ID = '` + adata.PRODUCT_ID + `'
                AND B.WEEK_DATE < '` + vCurrDate + `'
           GROUP BY A.LOCATION_ID,
                    A.PRODUCT_ID,
                    A.REF_PRODID,
                    A.MAT_AVAILDATE,
                    B.ORD_QTY,
                    PRIMARY_ID
           ORDER BY A.LOCATION_ID ASC, 
                    A.REF_PRODID ASC, 
                    A.MAT_AVAILDATE ASC,
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
                    lsPriCharCount['CHARVAL_NUM'] = GenF.parse(liPrimaryID[cntPI].CHARVAL_NUM);
                    lsPriCharCount['ORD_QTY'] = parseInt(liPrimaryCount[i].ORD_QTY);

                    for (let cntPIC = 0; cntPIC < liPriCharCount.length; cntPIC++) {
                        if (liPriCharCount[cntPIC].WEEK_NO === lsPriCharCount['WEEK_NO'] &&
                            liPriCharCount[cntPIC].CHAR_NUM === lsPriCharCount['CHAR_NUM'] &&
                            liPriCharCount[cntPIC].CHARVAL_NUM === lsPriCharCount['CHARVAL_NUM']) {
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
        let lRow = 0;var aAlert =[];
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
                            liPriCharCount[cntPIC].CHARVAL_NUM === liPrimaryID[cntPI]['CHARVAL_NUM']) {
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
                        await DELETE.from('CP_VC_HISTORY_DAILY_TS')
                            .where(`LOCATION_ID = '${adata.LOCATION_ID}' 
                        AND PRODUCT_ID = '${liPrimaryCount[i].PRODUCT_ID}'
                        AND PERIOD_NUM = '${liPrimaryCount[i].WEEK_NO}'
                        AND TYPE       = 'PI'`)
                    }
                    catch (e) {
                        console.log(e);
                    }
                    try {
                        await INSERT(liVCHistory).into('CP_VC_HISTORY_DAILY_TS');
                        FlagTest = 'S';
                    }
                    catch (er) {
                        FlagTest = 'E';
                        sError='Reason: '+er.message;
                        console.log(er);
                    }
                    aAlert = aAlert.concat(liVCHistory);
                    liVCHistory = [];

                }
            }


        }
        //Alert
        if(aAlert.length >0){
                await GenF.sendTimeseriesAlert(aAlert,req);
        }
        console.log(FlagTest);
        // await GenF.logMessage(req, `Completed history timeseries`);

        // Flag = 'X';
        // console.log(Flag);
        if (FlagTest === 'S') {
            // await GenF.jobSchMessage('X', "Timeseries History generation is complete", req);
            oReturn.bError = false;
            oReturn.message = "Timeseries History generation is complete";
        }
        else if (FlagTest === 'E') {
            // await GenF.jobSchMessage('', "Timeseries History generation failed", req);
            oReturn.bError = true;
            oReturn.message = `Timeseries History generation failed for Location: ${adata.LOCATION_ID} and Product: ${adata.PRODUCT_ID}`+sError;
        }
        else {
            const vMsg = "Timeseries generation for the product: " + adata.PRODUCT_ID + " is unsuccessful because of insufficient data";
            oReturn.bError = true;
            oReturn.message = vMsg;
            // await GenF.jobSchMessage('X', vMsg, req);
        }
        return oReturn;
    }

    /**
     * Generate Timeseries Restrictioni
     */
    async genTimeseries_rt(adata, req) {
        let Flag = '';
        var oReturn={
            bError:false,
            message:''
        }
        var sError='';
        await GenF.logMessage(req, `Started restrictions history timeseries`);

        let vCurrDate = GenF.getCurrentDate();

        // Get Sales Count Information
        const liSalesCount = await cds.run(
            `SELECT *
               FROM V_ORD_COUNT_DAILY
              WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                AND "PRODUCT_ID"  = '${adata.PRODUCT_ID}'
                AND "WEEK_DATE" <= '${vCurrDate}'
                ORDER BY "LOCATION_ID" ASC, 
                         "PRODUCT_ID" ASC,
                         "WEEK_DATE" ASC`
        );
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
            WHERE LOCATION_ID = '` + adata.LOCATION_ID + `'
                AND PRODUCT_ID  = '` + lMainProduct + `'
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
            if(lsOD['CHAR'].length === 0) {
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

            if(lUnique === 'X'){
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
            await DELETE.from('CP_VC_HISTORY_DAILY_TS')
                .where({
                    xpr: [
                        { ref: ["LOCATION_ID"] }, '=', { val: liSalesCount[i].LOCATION_ID }, 'and',
                        { ref: ["PRODUCT_ID"] }, '=', { val: liSalesCount[i].PRODUCT_ID }, 'and',
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
                    ORDER BY SALES_DOC,
                            SALESDOC_ITEM`
            );

            let liSalesConfig = await cds.run(
                `SELECT A.SALES_DOC,
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
                    lsVCHistory['PERIOD_NUM']       = GenF.parse(liSalesCount[i].WEEK_NO);
                    lsVCHistory['LOCATION_ID']      = GenF.parse(liSalesCount[i].LOCATION_ID);
                    lsVCHistory['PRODUCT_ID']       = GenF.parse(liSalesCount[i].PRODUCT_ID);
                    lsVCHistory['TYPE']             = 'RT';
                    lsVCHistory['GROUP_ID']         = GenF.parse(liODTemp[cntODT].RESTRICTION + '_' + liODTemp[cntODT].RTR_COUNTER);
                    lsVCHistory['GROUP_COUNT']      = GenF.parse(liODTemp[cntODT].OD_QTY);
                    lsVCHistory['GROUP_COUNT_RATE'] = (parseInt(liODTemp[cntODT].OD_QTY) / parseInt(liSalesCount[i].ORD_QTY) * 100).toFixed(2);

                    for (let cntODTC = 0; cntODTC < liODTemp[cntODT]['CHAR_UNI'].length; cntODTC++) {
                            lsVCHistory['ROW'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC].ROW_ID;
                            lsVCHistory['CHAR_NUM'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC].CHAR_NUM;
                            lsVCHistory['ATTRIBUTE'] = 'att' + liODTemp[cntODT]['CHAR_UNI'][cntODTC].ROW_ID;
                            lsVCHistory['CHAR_COUNT'] = liODTemp[cntODT]['CHAR_UNI'][cntODTC]['ORD_QTY'];

                            lsVCHistory['CHAR_COUNT_RATE'] = (parseInt(lsVCHistory['CHAR_COUNT']) / parseInt(liSalesCount[i].ORD_QTY)  * 100).toFixed(2);

                            liVCHistory.push(GenF.parse(lsVCHistory));
                    }                    
            }

            if (liVCHistory.length > 0) {
                try {
                    cds.run({
                        INSERT:
                        {
                            into: { ref: ['CP_VC_HISTORY_DAILY_TS'] },
                            entries: liVCHistory
                        }
                    });
                    Flag = 'S';
                }
                catch (error) {
                    console.log(error);
                    sError='Reason: '+error.message;
                }

            }

        }

        if (Flag === 'S') {
            oReturn.bError = false;
            oReturn.message = "Timeseries History generation is complete for Restrictions";
            // await GenF.jobSchMessage('X', "Timeseries History generation is complete for Restrictions", req);
        }
        else {
            oReturn.bError = false;
            oReturn.message = "Timeseries History generation failed for Restrictions."+sError;
            // await GenF.jobSchMessage('', "Timeseries History generation failed for Restrictions", req);
        }
        return oReturn;

    }    
}

module.exports = GenTimeseries;