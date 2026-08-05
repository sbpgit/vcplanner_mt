const GenF = require("./gen-functions");
const cds = require("@sap/cds");
const hana = require("@sap/hana-client");

class MarketAuth {
    /**
     * Constructor
     */
    constructor() { }


    async updateOptPer(lLocation, lProduct, lDate, lVersion, lScenario, req) {
        let Flag;

        await GenF.logMessage(req, 'Started Sales Orders Processing');


        let lOrdQty = 0;
        // Get total Quantity of the product        
        let liSOrdQty = await cds.run(`SELECT SUM("ORD_QTY") AS ORD_QTY
                                        FROM V_SALES_H
                                       WHERE LOCATION_ID = '${lLocation}'
                                         AND PRODUCT_ID = '${lProduct}'
                                       GROUP BY LOCATION_ID,
                                                PRODUCT_ID;`);
        if (liSOrdQty.length > 0) {
            lOrdQty = parseInt(liSOrdQty[0].ORD_QTY);
        }

        // Get Default Market Authorization
        let liDefOptPer = await cds.run(`SELECT *
                                           FROM CP_DEF_MKTAUTH
                                          WHERE LOCATION_ID = '${lLocation}'
                                            AND PRODUCT_ID  = '${lProduct}'
                                            ORDER BY LOCATION_ID,
                                                        PRODUCT_ID,
                                                        CHAR_NUM,
                                                        CHARVAL_NUM;`);
        // Get Future option percentages
        let liFutOptPer = await cds.run(`SELECT *
                                           FROM CP_IBP_FCHARPLAN
                                          WHERE LOCATION_ID = '${lLocation}'
                                            AND PRODUCT_ID  = '${lProduct}'
                                            AND WEEK_DATE   = '${lDate}'
                                            AND VERSION     = '${lVersion}'
                                            AND SCENARIO    = '${lScenario}'
                                            ORDER BY LOCATION_ID,
                                                     PRODUCT_ID,
                                                     VERSION,
                                                     SCENARIO,
                                                     CHAR_NUM,
                                                     CHARVAL_NUM;`);
        try {
            await DELETE.from('CP_MARKETAUTH_CFG')
                .where(`LOCATION_ID = '${lLocation}' 
                AND PRODUCT_ID = '${lProduct}'
                AND WEEK_DATE  = '${lDate}'
                AND VERSION = '${lVersion}'
                AND SCENARIO = '${lScenario}'
                `);
        }
        catch (e) {
            console.log("unable to delete");
        }
        let lsCharVal = {};
        let liCharVal = [];

        // Compare values and get Conversion factor
        for (let cntFP = 0; cntFP < liFutOptPer.length; cntFP++) {
            let lFound = '';
            for (let cntDP = 0; cntDP < liDefOptPer.length; cntDP++) {
                if (liDefOptPer[cntDP].CHAR_NUM === liFutOptPer[cntFP].CHAR_NUM &&
                    liDefOptPer[cntDP].CHARVAL_NUM === liFutOptPer[cntFP].CHARVAL_NUM) {
                    lFound = 'X';
                    // if (liDefOptPer[cntDP].OPT_PERCENT !== liFutOptPer[cntFP ].OPT_PERCENT) {
                    lsCharVal = {};
                    lsCharVal['VERSION'] = GenF.parse(liFutOptPer[cntFP].VERSION);
                    lsCharVal['SCENARIO'] = GenF.parse(liFutOptPer[cntFP].SCENARIO);
                    lsCharVal['CHAR_NUM'] = GenF.parse(liFutOptPer[cntFP].CHAR_NUM);
                    lsCharVal['CHARVAL_NUM'] = GenF.parse(liFutOptPer[cntFP].CHARVAL_NUM);
                    if (liDefOptPer[cntDP].OPT_PERCENT > 0) {
                        lsCharVal['CORRECTION_FACTOR'] = liFutOptPer[cntFP].OPT_PERCENT / liDefOptPer[cntDP].OPT_PERCENT;
                    } else {
                        lsCharVal['CORRECTION_FACTOR'] = 1;
                    }
                    liCharVal.push(lsCharVal);
                    // }
                } else {
                    if (lFound === 'X') {
                        break;
                    }
                }
            }
        }

        let lsVersion = {};
        let liVersion = [];
        let lsChar = {};
        let liChar = [];
        let lsCharValTemp = {};
        let liCharValTemp = [];

        for (let cntCV = 0; cntCV < liCharVal.length; cntCV++) {

            lsCharValTemp = {};
            lsCharValTemp['CHARVAL_NUM'] = GenF.parse(liCharVal[cntCV].CHARVAL_NUM);
            lsCharValTemp['CORRECTION_FACTOR'] = GenF.parse(liCharVal[cntCV].CORRECTION_FACTOR)
            if (lsCharValTemp['CORRECTION_FACTOR'] !== 1) {
                lsChar['PROCESS'] = 'X';
            }
            else{
                lsChar['PROCESS'] = '';
            }
            liCharValTemp.push(lsCharValTemp);

            if (cntCV === GenF.addOne(cntCV, liCharVal.length) ||
                liCharVal[cntCV].CHAR_NUM !== liCharVal[GenF.addOne(cntCV)].CHAR_NUM) {

                lsChar['CHAR_NUM'] = liCharVal[cntCV].CHAR_NUM;
                lsChar['VAL'] = GenF.parse(liCharValTemp);
                liChar.push(lsChar);
                liCharValTemp = [];
                lsChar = {};
            }

            if (cntCV === GenF.addOne(cntCV, liCharVal.length) ||
                liCharVal[cntCV].VERSION !== liCharVal[GenF.addOne(cntCV)].VERSION ||
                liCharVal[cntCV].SCENARIO !== liCharVal[GenF.addOne(cntCV)].SCENARIO) {
                lsVersion['VERSION'] = GenF.parse(liCharVal[cntCV].VERSION);
                lsVersion['SCENARIO'] = GenF.parse(liCharVal[cntCV].SCENARIO);
                lsVersion['CHAR'] = GenF.parse(liChar);
                liVersion.push(lsVersion);

                liChar = [];
            }

        }


        let liCharOpt = [];
        let liCharOptOt = [];
        let lNumChar = 0;
        for (let cntV = 0; cntV < liVersion.length; cntV++) {
            let liVersionChar = liVersion[cntV].CHAR;
            lNumChar = 0;
            liCharOpt = [];
            for (let cntVC = 0; cntVC < liVersionChar.length; cntVC++) {
                let liVersionCharValue = liVersionChar[cntVC].VAL;
                if (liVersionChar[cntVC].PROCESS === 'X') {
                    lNumChar = lNumChar + 1;
                    for (let cntVCV = 0; cntVCV < liVersionCharValue.length; cntVCV++) {
                        try {
                            liCharOptOt = await cds.run(`SELECT V_UNIQUE_ID_COUNT.PRODUCT_ID,
                                                            V_UNIQUE_ID.CHAR_NUM,
                                                            V_UNIQUE_ID.CHARVAL_NUM,
                                                            SUM(V_UNIQUE_ID_COUNT.ORD_QTY) AS ORD_QTY
                                                    FROM V_UNIQUE_ID_COUNT
                                            INNER JOIN CP_PARTIALPROD_INTRO
                                                    ON CP_PARTIALPROD_INTRO.PRODUCT_ID = V_UNIQUE_ID_COUNT.PRODUCT_ID
                                            INNER JOIN V_UNIQUE_ID
                                                    ON V_UNIQUE_ID.PRODUCT_ID = CP_PARTIALPROD_INTRO.REF_PRODID
                                                    AND V_UNIQUE_ID.UNIQUE_ID = V_UNIQUE_ID_COUNT.UNIQUE_ID
                                                WHERE V_UNIQUE_ID_COUNT.PRODUCT_ID = '${lProduct}'
                                                    AND (V_UNIQUE_ID_COUNT.UNIQUE_ID IN (SELECT DISTINCT UNIQUE_ID
                                                                                                    FROM V_UNIQUE_ID
                                                                                                    WHERE (PRODUCT_ID IN (SELECT DISTINCT REF_PRODID
                                                                                                                                    FROM CP_PARTIALPROD_INTRO
                                                                                                                                    WHERE LOCATION_ID = '${lLocation}'
                                                                                                                                    AND PRODUCT_ID = '${lProduct}'))
                                                                                                                                    AND CHAR_NUM = '${liVersionChar[cntVC].CHAR_NUM}'
                                                                                                                                    AND CHARVAL_NUM = '${liVersionCharValue[cntVCV].CHARVAL_NUM}'))
                                                    GROUP BY 
                                                        V_UNIQUE_ID_COUNT.PRODUCT_ID,
                                                        V_UNIQUE_ID.CHAR_NUM,
                                                        V_UNIQUE_ID.CHARVAL_NUM
                                                        ORDER BY CHAR_NUM, CHARVAL_NUM;`);
                        }
                        catch (e) {
                            console.log(e);
                        }
                        let lsOptPer = {};
                        // let liCharOpt = [];
                        for (let cntC = 0; cntC < liCharOptOt.length; cntC++) {
                            let lSuccess = '';
                            for (let cntCC = 0; cntCC < liCharOpt.length; cntCC++) {
                                if (liCharOpt[cntCC].PRODUCT_ID === liCharOptOt[cntC].PRODUCT_ID &&
                                    liCharOpt[cntCC].VERSION === liVersion[cntV].VERSION &&
                                    liCharOpt[cntCC].SCENARIO === liVersion[cntV].SCENARIO &&
                                    liCharOpt[cntCC].CHAR_NUM === liCharOptOt[cntC].CHAR_NUM &&
                                    liCharOpt[cntCC].CHARVAL_NUM === liCharOptOt[cntC].CHARVAL_NUM) {
                                    liCharOpt[cntCC].ORD_QTY = parseInt(liCharOpt[cntCC].ORD_QTY) + parseInt(liCharOptOt[cntC].ORD_QTY);
                                    lSuccess = 'X';
                                    break;
                                }
                            }
                            if (lSuccess === '') {
                                lsOptPer.LOCATION_ID = GenF.parse(lLocation);
                                lsOptPer.PRODUCT_ID = GenF.parse(liCharOptOt[cntC].PRODUCT_ID);
                                lsOptPer.VERSION = GenF.parse(liVersion[cntV].VERSION);
                                lsOptPer.SCENARIO = GenF.parse(liVersion[cntV].SCENARIO);
                                lsOptPer.CHAR_NUM = GenF.parse(liCharOptOt[cntC].CHAR_NUM);
                                lsOptPer.CHARVAL_NUM = GenF.parse(liCharOptOt[cntC].CHARVAL_NUM);
                                lsOptPer.ORD_QTY = parseInt(liCharOptOt[cntC].ORD_QTY);

                                liCharOpt.push(GenF.parse(lsOptPer));
                                lsOptPer = {};
                            }

                        }

                    }
                }

            }
            let lsMarketAuth = {};
            let liMarketAuth = [];
            for (let cntOP = 0; cntOP < liCharOpt.length; cntOP++) {
                lsMarketAuth['WEEK_DATE'] = GenF.parse(lDate);
                lsMarketAuth['LOCATION_ID'] = GenF.parse(lLocation);
                lsMarketAuth['PRODUCT_ID'] = GenF.parse(liCharOpt[cntOP].PRODUCT_ID);
                lsMarketAuth['CHAR_NUM'] = GenF.parse(liCharOpt[cntOP].CHAR_NUM);
                lsMarketAuth['CHARVAL_NUM'] = GenF.parse(liCharOpt[cntOP].CHARVAL_NUM);
                lsMarketAuth['VERSION '] = GenF.parse(liCharOpt[cntOP].VERSION);
                lsMarketAuth['SCENARIO'] = GenF.parse(liCharOpt[cntOP].SCENARIO);
                if (lOrdQty > 0) {
                    lsMarketAuth['OPT_PERCENT'] = liCharOpt[cntOP].ORD_QTY / (parseInt(lNumChar) * lOrdQty);
                } else {
                    lsMarketAuth['OPT_PERCENT'] = 0;
                }
                liMarketAuth.push(lsMarketAuth);
                lsMarketAuth = {};
            }
            try {
                await INSERT.into('CP_MARKETAUTH_CFG')
                    .entries(liMarketAuth);
            }
            catch (e) {
                console.log(e);
            }

        }

        await GenF.logMessage(req, 'Completed Sales Orders Processing');
        Flag = 'X';

    }


}

module.exports = MarketAuth;