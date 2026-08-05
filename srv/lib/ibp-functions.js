const GenF = require("./gen-functions");
const cds = require("@sap/cds");
const hana = require("@sap/hana-client");
const MktAuth = require("./market-auth");
const obgenMktAuth = new MktAuth();
const DerivedConfig = require("./derivedchars-functions");
const objDerConfig = new DerivedConfig();
const vAIRKey = process.env.AIR;
class IBPFunctions {
    constructor() {

    }
    async exportSalesCfg(aData, imDates) {
        var oReq = {
            sales: [],
        },
            vsales;

        const liCust = await cds.run(
            `
                SELECT DISTINCT 
                        "LOCATION_ID",
                        "PRODUCT_ID",
                        "CUSTOMER_GROUP"
                        FROM V_IBP_SALESHCONFIG_VC
                        WHERE LOCATION_ID = '`+ aData.LOCATION_ID + `'
                           AND PRODUCT_ID = '`+ aData.PRODUCT_ID +
            `'`);
        const lisales = await cds.run(
            `
        SELECT DISTINCT "WEEK_DATE",
                        "LOCATION_ID",
                        "PRODUCT_ID",
                        "REF_PRODID",
                        "ORD_QTY",
                        "ADJ_QTY",
                        "CUSTOMER_GROUP",
                        "CLASS_NUM",
                        "CHAR_NUM",
                        "CHARVAL_NUM",
                        "CHAR_VALUE"
                        FROM V_IBP_SALESHCONFIG_VC
                        WHERE LOCATION_ID = '`+ aData.LOCATION_ID + `'
                           AND PRODUCT_ID = '`+ aData.PRODUCT_ID + `'
                           AND IBPCHAR_CHK = true
                        ORDER BY "WEEK_DATE"`);

        // `' AND CUSTOMER_GROUP = '` + req.data.CUSTOMER_GROUP +e
        const lsProduct = await SELECT.one
            .columns('REF_PRODID')
            .from('CP_PARTIALPROD_INTRO')
            .where(`LOCATION_ID = '${aData.LOCATION_ID}'
                    AND PRODUCT_ID = '${aData.PRODUCT_ID}'`);

        const liProdChar = await cds.run(`
                                        SELECT LOCATION_ID,
                                        PRODUCT_ID,
                                        CLASS_NUM,
                                        CHAR_NUM,
                                        CHARVAL_NUM,
                                        CHAR_VALUE
                                 FROM  V_LOCPRODCLASSCHAR 
                                WHERE PRODUCT_ID = '${lsProduct.REF_PRODID}'
                                  AND IBPCHAR_CHK = true
                                  AND LOCATION_ID = '${aData.LOCATION_ID}'
                                  AND ( (CHAR_NUM,CHAR_VALUE ) IN (SELECT DISTINCT CHAR_NUM,CHAR_VALUE 
                                 FROM "V_IBP_SALESHCONFIG_VC" 
                                 WHERE  PRODUCT_ID = '${aData.PRODUCT_ID}') )
        `);
        // IN (SELECT DISTINCT LOCATION_ID FROM CP_FACTORY_SALESLOC)
        let liDates = imDates;
        let vDemd, vAdjqty, vWeekDate, lSuccess = '';
        let liProdCharTemp = liProdChar;
        for (let iDate = 0; iDate < liDates.length; iDate++) {
            for (let iCust = 0; iCust < liCust.length; iCust++) {
                for (let iPrdc = 0; iPrdc < liProdChar.length; iPrdc++) {
                    lSuccess = '';
                    for (let i = 0; i < lisales.length; i++) {
                        vDemd = "", vAdjqty = "", vWeekDate = "";
                        if (liDates[iDate].WEEK_DATE === lisales[i].WEEK_DATE &&
                            liCust[iCust].CUSTOMER_GROUP === lisales[i].CUSTOMER_GROUP &&
                            liProdChar[iPrdc].LOCATION_ID === lisales[i].LOCATION_ID &&
                            liProdChar[iPrdc].PRODUCT_ID === lisales[i].REF_PRODID &&
                            liProdChar[iPrdc].CLASS_NUM === lisales[i].CLASS_NUM &&
                            liProdChar[iPrdc].CHAR_NUM === lisales[i].CHAR_NUM &&
                            liProdChar[iPrdc].CHAR_VALUE === lisales[i].CHAR_VALUE) {
                            // Week data in Datetime and quantities in String
                            // vWeekDate = new Date(lisales[i].WEEK_DATE).toISOString().split('Z');
                            vWeekDate = lisales[i].WEEK_DATE + "T00:00:00";
                            vDemd = lisales[i].ORD_QTY.split('.');
                            // vAdjqty = lisales[i].ADJ_QTY.split('.');
                            vsales = {
                                "LOCID": lisales[i].LOCATION_ID,
                                "PRDID": lisales[i].PRODUCT_ID,
                                "VCCHAR": lisales[i].CHAR_NUM,
                                "VCCHARVALUE": lisales[i].CHAR_VALUE,
                                "VCCLASS": lisales[i].CLASS_NUM,
                                "CUSTID": lisales[i].CUSTOMER_GROUP,
                                "ACTUALDEMANDVC": vDemd[0],
                                // "SEEDORDERDEMANDVC": vAdjqty[0],
                                "PERIODID0_TSTAMP": vWeekDate
                            };
                            //Patch to replace  CHAR_VALUE with CHARVAL_NUM  if MAP_CHARVALUE_CHARVALNUM is Yes from System Configuration
                            const charObj = {
                                CLASS_NUM: vsales["VCCLASS"],
                                CHAR_NUM: vsales["VCCHAR"],
                                CHARVAL_NUM: vsales["VCCHARVALUE"]
                            }
                            vsales.VCCHARVALUE = await GenF.mapCharValue(charObj, 'E');
                            oReq.sales.push(vsales);
                            lSuccess = 'X';
                            break;
                        }
                    }
                    if (lSuccess === '') {
                        // vWeekDate = new Date(liDates[iDate].WEEK_DATE).toISOString().split('Z');
                        vWeekDate = liDates[iDate].WEEK_DATE + "T00:00:00";
                        vDemd = "-1";
                        vAdjqty = "-2";
                        vsales = {
                            "LOCID": liProdChar[iPrdc].LOCATION_ID,//aData.LOCATION_ID,
                            "PRDID": aData.PRODUCT_ID,
                            "VCCHAR": liProdChar[iPrdc].CHAR_NUM,
                            "VCCHARVALUE": liProdChar[iPrdc].CHAR_VALUE,
                            "VCCLASS": liProdChar[iPrdc].CLASS_NUM,
                            "CUSTID": liCust[iCust].CUSTOMER_GROUP,
                            "ACTUALDEMANDVC": vDemd,
                            // "SEEDORDERDEMANDVC": vAdjqty,
                            "PERIODID0_TSTAMP": vWeekDate
                        };
                        //Patch to replace  CHAR_VALUE with CHARVAL_NUM  if MAP_CHARVALUE_CHARVALNUM is Yes from System Configuration
                        const charObj = {
                            CLASS_NUM: vsales["VCCLASS"],
                            CHAR_NUM: vsales["VCCHAR"],
                            CHARVAL_NUM: vsales["VCCHARVALUE"]
                        }
                        vsales.VCCHARVALUE = await GenF.mapCharValue(charObj, 'E');
                        oReq.sales.push(vsales);
                    }
                }
            }
        }
        return oReq;
    }
    async exportSeedOrdCfg(aData, imDates) {
        var oReq = {
            sales: [],
        },
            vsales;

        const liCust = await cds.run(
            `
                SELECT DISTINCT 
                        "LOCATION_ID",
                        "PRODUCT_ID",
                        "CUSTOMER_GROUP"
                        FROM V_IBP_SALESHCONFIG_VC
                        WHERE LOCATION_ID = '`+ aData.LOCATION_ID + `'
                           AND PRODUCT_ID = '`+ aData.PRODUCT_ID +
            `'`);
        const lisales = await cds.run(
            `
                SELECT DISTINCT "WEEK_DATE",
                        "LOCATION_ID",
                        "PRODUCT_ID",
                        "REF_PRODID",
                        "ADJ_QTY",
                        "CUSTOMER_GROUP",
                        "CLASS_NUM",
                        "CHAR_NUM",
                        "CHARVAL_NUM",
                        "CHAR_VALUE"
                        FROM V_IBP_SALESHCONFIG_VC
                        WHERE LOCATION_ID = '`+ aData.LOCATION_ID + `'
                           AND PRODUCT_ID = '`+ aData.PRODUCT_ID + `'
                           AND IBPCHAR_CHK = true
                        ORDER BY "WEEK_DATE"`);

        // `' AND CUSTOMER_GROUP = '` + req.data.CUSTOMER_GROUP +e
        const lsProduct = await SELECT.one
            .columns('REF_PRODID')
            .from('CP_PARTIALPROD_INTRO')
            .where(`LOCATION_ID = '${aData.LOCATION_ID}'
                    AND PRODUCT_ID = '${aData.PRODUCT_ID}'`);

        const liProdChar = await cds.run(`
                                        SELECT PRODUCT_ID,
                                        CLASS_NUM,
                                        CHAR_NUM,
                                        CHARVAL_NUM,
                                        CHAR_VALUE
                                 FROM  V_PRODCLSCHARVAL 
                                WHERE PRODUCT_ID = '${lsProduct.REF_PRODID}'
                                  AND IBPCHAR_CHK = true
                                  AND ( (CHAR_NUM,CHAR_VALUE ) IN (SELECT DISTINCT CHAR_NUM,CHAR_VALUE 
                                 FROM "V_IBP_SALESHCONFIG_VC" 
                                 WHERE  PRODUCT_ID = '${aData.PRODUCT_ID}') )
        `);
        let liDates = imDates;
        let vDemd, vAdjqty, vWeekDate, lSuccess = '';
        let liProdCharTemp = liProdChar;
        for (let iDate = 0; iDate < liDates.length; iDate++) {
            for (let iCust = 0; iCust < liCust.length; iCust++) {
                for (let iPrdc = 0; iPrdc < liProdChar.length; iPrdc++) {
                    lSuccess = '';
                    for (let i = 0; i < lisales.length; i++) {
                        vDemd = "", vAdjqty = "", vWeekDate = "";
                        if (liDates[iDate].WEEK_DATE === lisales[i].WEEK_DATE &&
                            liCust[iCust].CUSTOMER_GROUP === lisales[i].CUSTOMER_GROUP &&
                            liProdChar[iPrdc].PRODUCT_ID === lisales[i].REF_PRODID &&
                            liProdChar[iPrdc].CLASS_NUM === lisales[i].CLASS_NUM &&
                            liProdChar[iPrdc].CHAR_NUM === lisales[i].CHAR_NUM &&
                            liProdChar[iPrdc].CHAR_VALUE === lisales[i].CHAR_VALUE) {
                            // Week data in Datetime and quantities in String
                            // vWeekDate = new Date(lisales[i].WEEK_DATE).toISOString().split('Z');
                            vWeekDate = lisales[i].WEEK_DATE + "T00:00:00";
                            // vDemd = lisales[i].ORD_QTY.split('.');
                            vAdjqty = lisales[i].ADJ_QTY.split('.');
                            vsales = {
                                "LOCID": lisales[i].LOCATION_ID,
                                "PRDID": lisales[i].PRODUCT_ID,
                                "VCCHAR": lisales[i].CHAR_NUM,
                                "VCCHARVALUE": lisales[i].CHAR_VALUE,
                                "VCCLASS": lisales[i].CLASS_NUM,
                                "CUSTID": lisales[i].CUSTOMER_GROUP,
                                "SEEDORDERDEMANDVC": vAdjqty[0],
                                "PERIODID0_TSTAMP": vWeekDate
                            };
                            //Patch to replace  CHAR_VALUE with CHARVAL_NUM  if MAP_CHARVALUE_CHARVALNUM is Yes from System Configuration
                            const charObj = {
                                CLASS_NUM: vsales["VCCLASS"],
                                CHAR_NUM: vsales["VCCHAR"],
                                CHARVAL_NUM: vsales["VCCHARVALUE"]
                            }
                            vsales.VCCHARVALUE = await GenF.mapCharValue(charObj, 'E');
                            oReq.sales.push(vsales);
                            lSuccess = 'X';
                            break;
                        }
                    }
                    if (lSuccess === '') {
                        // vWeekDate = new Date(liDates[iDate].WEEK_DATE).toISOString().split('Z');
                        vWeekDate = liDates[iDate].WEEK_DATE + "T00:00:00";
                        // vDemd = "-1";
                        vAdjqty = "-2";
                        vsales = {
                            "LOCID": aData.LOCATION_ID,
                            "PRDID": aData.PRODUCT_ID,
                            "VCCHAR": liProdChar[iPrdc].CHAR_NUM,
                            "VCCHARVALUE": liProdChar[iPrdc].CHAR_VALUE,
                            "VCCLASS": liProdChar[iPrdc].CLASS_NUM,
                            "CUSTID": liCust[iCust].CUSTOMER_GROUP,
                            "SEEDORDERDEMANDVC": vAdjqty,
                            "PERIODID0_TSTAMP": vWeekDate
                        };
                        const charObj = {
                            CLASS_NUM: vsales["VCCLASS"],
                            CHAR_NUM: vsales["VCCHAR"],
                            CHARVAL_NUM: vsales["VCCHARVALUE"]
                        }
                        vsales.VCCHARVALUE = await GenF.mapCharValue(charObj, 'E');
                        oReq.sales.push(vsales);
                    }
                }
            }
        }
        return oReq;
    }
    async exportSalesCfgStock(aData, imDates) {
        var oReq = {
            stockcfg: [],
        },
            vsales;


        const lisales = await cds.run(
            `
                SELECT DISTINCT
                        "LOCATION_ID",
                        "PRODUCT_ID",
                        "REF_PRODID",
                        "TRANS_TO_LOC",
                        "TRANS_FROM_LOC", 
                        "INTRANSIT_QTY",
                        "CLASS_NUM",
                        "CHAR_NUM",
                        "CHARVAL_NUM",
                        "CHAR_VALUE"
                        FROM V_IBP_SALESH_CFGSTOCK
                        WHERE LOCATION_ID = '`+ aData.LOCATION_ID + `'
                           AND PRODUCT_ID = '`+ aData.PRODUCT_ID + `'
                           AND IBPCHAR_CHK = true`);

        // `' AND CUSTOMER_GROUP = '` + req.data.CUSTOMER_GROUP +e
        const lsProduct = await SELECT.one
            .columns('REF_PRODID')
            .from('CP_PARTIALPROD_INTRO')
            .where(`LOCATION_ID = '${aData.LOCATION_ID}'
                    AND PRODUCT_ID = '${aData.PRODUCT_ID}'`);

        const liProdChar = await cds.run(`
                                        SELECT DISTINCT PRODUCT_ID,
                                        CLASS_NUM,
                                        CHAR_NUM,
                                        CHARVAL_NUM,
                                        CHAR_VALUE
                                 FROM  V_PRODCLSCHARVAL 
                                WHERE PRODUCT_ID = '${lsProduct.REF_PRODID}'
                                  AND IBPCHAR_CHK = true
                                  AND ( (CHAR_NUM,CHAR_VALUE ) IN (SELECT DISTINCT CHAR_NUM,CHAR_VALUE 
                                 FROM "V_IBP_SALESHCONFIG_VC") )
        `);
        let liDates = imDates;
        let vCurrDate = GenF.getCurrentDate();
        vCurrDate = GenF.getNextMondayCmp(vCurrDate);
        let vDemdTrans, vDemdonHnd, vWeekDate, lSuccess = '';
        for (let iPrdc = 0; iPrdc < liProdChar.length; iPrdc++) {
            lSuccess = '';
            for (let i = 0; i < lisales.length; i++) {
                vDemdTrans = "", vDemdonHnd = '', vWeekDate = "";
                if (liProdChar[iPrdc].PRODUCT_ID === lisales[i].REF_PRODID &&
                    liProdChar[iPrdc].CLASS_NUM === lisales[i].CLASS_NUM &&
                    liProdChar[iPrdc].CHAR_NUM === lisales[i].CHAR_NUM &&
                    liProdChar[iPrdc].CHAR_VALUE === lisales[i].CHAR_VALUE) {
                    // Week data in Datetime and quantities in String
                    // vWeekDate = new Date(lisales[i].WEEK_DATE).toISOString().split('Z');
                    // vWeekDate = lisales[i].WEEK_DATE + "T00:00:00";
                    vWeekDate = new Date(vCurrDate).toISOString().split('Z');
                    vDemdTrans = lisales[i].INTRANSIT_QTY.split('.');
                    vsales = {
                        "LOCID": lisales[i].TRANS_TO_LOC,//lisales[i].LOCATION_ID,
                        "PRDID": lisales[i].PRODUCT_ID,
                        "LOCFR": lisales[i].TRANS_FROM_LOC,
                        "VCCHAR": lisales[i].CHAR_NUM,
                        "VCCHARVALUE": lisales[i].CHAR_VALUE,
                        "VCCLASS": lisales[i].CLASS_NUM,
                        "STOCKINTRANSITATVC": vDemdTrans[0],
                        "PERIODID0_TSTAMP": vWeekDate[0]
                    };
                    //Patch to replace  CHAR_VALUE with CHARVAL_NUM  if MAP_CHARVALUE_CHARVALNUM is Yes from System Configuration
                    const charObj = {
                        CLASS_NUM: vsales["VCCLASS"],
                        CHAR_NUM: vsales["VCCHAR"],
                        CHARVAL_NUM: vsales["VCCHARVALUE"]
                    }
                    vsales.VCCHARVALUE = await GenF.mapCharValue(charObj, 'E');
                    oReq.stockcfg.push(vsales);
                    lSuccess = 'X';
                    break;
                }
            }
        }
        return oReq;
    }
    async exportSalesStock(aData, imDates) {
        var oReq = {
            stock: [],
        },
            vsales;


        const lisales = await cds.run(
            `
                    SELECT  DISTINCT 
                            "LOCATION_ID",
                            "PRODUCT_ID",
                            "TRANS_TO_LOC",
                            "TRANS_FROM_LOC", 
                            "INTRANSIT_QTY"
                            FROM V_IBP_SALESH_STOCK
                            WHERE LOCATION_ID = '`+ aData.LOCATION_ID + `'
                               AND PRODUCT_ID = '`+ aData.PRODUCT_ID +
            `'`);

        let vCurrDate = GenF.getCurrentDate();
        vCurrDate = GenF.getNextMondayCmp(vCurrDate);

        let liDates = imDates;
        let vDemdTrans, vDemdonHnd, vWeekDate, lSuccess = '';
        lSuccess = '';
        for (let i = 0; i < lisales.length; i++) {
            vDemdTrans = "", vDemdonHnd = "", vWeekDate = "";
            vWeekDate = new Date(vCurrDate).toISOString().split('Z');
            // vWeekDate = vCurrDate + "T00:00:00";
            vDemdTrans = lisales[i].INTRANSIT_QTY.split('.');
            vsales = {
                "LOCID": lisales[i].TRANS_TO_LOC,//lisales[i].LOCATION_ID,
                "PRDID": lisales[i].PRODUCT_ID,
                "LOCFR": lisales[i].TRANS_FROM_LOC,
                "STOCKINTRANSIT": vDemdTrans[0],
                "PERIODID0_TSTAMP": vWeekDate[0]
            };
            lSuccess = 'X';
            oReq.stock.push(vsales);
        }

        return oReq;
    }
    async exportSalesCfgOnHand(aData, imDates) {
        var oReq = {
            stockhdcfg: [],
        },
            vsales;


        const lisales = await cds.run(
            `
                 SELECT DISTINCT "LOCATION_ID",
                        "PRODUCT_ID",
                        "REF_PRODID",
                        "ONHANDSTCK_QTY",
                        "CLASS_NUM",
                        "CHAR_NUM",
                        "CHARVAL_NUM",
                        "CHAR_VALUE"
                        FROM V_IBP_SALESH_CFGONHAND
                        WHERE LOCATION_ID = '`+ aData.LOCATION_ID + `'
                           AND PRODUCT_ID = '`+ aData.PRODUCT_ID + `'
                           AND IBPCHAR_CHK = true`);

        // `' AND CUSTOMER_GROUP = '` + req.data.CUSTOMER_GROUP +e
        const lsProduct = await SELECT.one
            .columns('REF_PRODID')
            .from('CP_PARTIALPROD_INTRO')
            .where(`LOCATION_ID = '${aData.LOCATION_ID}'
                    AND PRODUCT_ID = '${aData.PRODUCT_ID}'`);

        const liProdChar = await cds.run(`
                                        SELECT DISTINCT PRODUCT_ID,
                                        CLASS_NUM,
                                        CHAR_NUM,
                                        CHARVAL_NUM,
                                        CHAR_VALUE
                                 FROM  V_PRODCLSCHARVAL 
                                WHERE PRODUCT_ID = '${lsProduct.REF_PRODID}'
                                  AND IBPCHAR_CHK = true
                                  AND ( (CHAR_NUM,CHAR_VALUE ) IN (SELECT DISTINCT CHAR_NUM,CHAR_VALUE 
                                 FROM "V_IBP_SALESHCONFIG_VC") )
        `);

        let vCurrDate = GenF.getCurrentDate();
        vCurrDate = GenF.getNextMondayCmp(vCurrDate);
        let liDates = imDates;
        let vDemdTrans, vDemdonHnd, vWeekDate, lSuccess = '';
        for (let iPrdc = 0; iPrdc < liProdChar.length; iPrdc++) {
            lSuccess = '';
            for (let i = 0; i < lisales.length; i++) {
                vDemdTrans = "", vDemdonHnd = '', vWeekDate = "";
                if (liProdChar[iPrdc].PRODUCT_ID === lisales[i].REF_PRODID &&
                    liProdChar[iPrdc].CLASS_NUM === lisales[i].CLASS_NUM &&
                    liProdChar[iPrdc].CHAR_NUM === lisales[i].CHAR_NUM &&
                    liProdChar[iPrdc].CHAR_VALUE === lisales[i].CHAR_VALUE) {
                    // Week data in Datetime and quantities in String
                    vWeekDate = new Date(vCurrDate).toISOString().split('Z');
                    // vWeekDate = vCurrDate + "T00:00:00";
                    vDemdonHnd = lisales[i].ONHANDSTCK_QTY.split('.');
                    vsales = {
                        "LOCID": lisales[i].LOCATION_ID,
                        "PRDID": lisales[i].PRODUCT_ID,
                        "VCCHAR": lisales[i].CHAR_NUM,
                        "VCCHARVALUE": lisales[i].CHAR_VALUE,
                        "VCCLASS": lisales[i].CLASS_NUM,
                        "STOCKONHANDATVC": vDemdonHnd[0],
                        "PERIODID0_TSTAMP": vWeekDate[0]
                    };
                    //Patch to replace  CHAR_VALUE with CHARVAL_NUM  if MAP_CHARVALUE_CHARVALNUM is Yes from System Configuration
                    const charObj = {
                        CLASS_NUM: vsales["VCCLASS"],
                        CHAR_NUM: vsales["VCCHAR"],
                        CHARVAL_NUM: vsales["VCCHARVALUE"]
                    }
                    vsales.VCCHARVALUE = await GenF.mapCharValue(charObj, 'E');
                    oReq.stockhdcfg.push(vsales);
                    lSuccess = 'X';
                    break;
                }
            }

        }
        return oReq;
    }
    async exportSalesOnHand(aData, imDates) {
        var oReq = {
            stockhd: [],
        },
            vsales;


        const lisales = await cds.run(
            `
                    SELECT DISTINCT 
                            "LOCATION_ID",
                            "PRODUCT_ID",
                            "ONHANDSTCK_QTY"
                            FROM V_IBP_SALESH_ONHANDSTCK
                            WHERE LOCATION_ID = '`+ aData.LOCATION_ID + `'
                               AND PRODUCT_ID = '`+ aData.PRODUCT_ID +
            `'`);
        let vCurrDate = GenF.getCurrentDate();
        vCurrDate = GenF.getNextMondayCmp(vCurrDate);
        let vDemdTrans, vDemdonHnd, vWeekDate, lSuccess = '';
        lSuccess = '';
        for (let i = 0; i < lisales.length; i++) {
            vDemdTrans = "", vDemdonHnd = "", vWeekDate = "";
            // vWeekDate = new Date(lisales[i].WEEK_DATE).toISOString().split('Z');
            vWeekDate = new Date(vCurrDate).toISOString().split('Z');
            vDemdonHnd = lisales[i].ONHANDSTCK_QTY.split('.');
            vsales = {
                "LOCID": lisales[i].LOCATION_ID,
                "PRDID": lisales[i].PRODUCT_ID,
                "STOCKONHAND": vDemdonHnd[0],
                "PERIODID0_TSTAMP": vWeekDate[0]
            };
            lSuccess = 'X';
            oReq.stockhd.push(vsales);
        }
        return oReq;
    }
    async exportRtrHdrDet(req) {
        var oReq = {
            rtrhdr: [],
            locrtr: []
        },
            vRtrhdr,
            vLocRtr;
        const lirtrhdrdet = await cds.run(
            `
                SELECT 
                "LOCATION_ID",
                "LINE_ID",
                "RESTRICTION",
                "RTR_DESC",
                "RTR_TYPE",
                "VALID_FROM",
                "VALID_TO"
            FROM "CP_RESTRICT_HEADER"
            WHERE LOCATION_ID = '`+ req.data.LOCATION_ID + `'`);

        for (let i = 0; i < lirtrhdrdet.length; i++) {
            vRtrhdr = {
                "VCRESTRICTIONID": lirtrhdrdet[i].RESTRICTION,
                "VCRESTRICTIONDESC": lirtrhdrdet[i].RTR_DESC,
                "VCRESTRICTIONTYPE": ''
            };
            vLocRtr = {
                "LOCID": lirtrhdrdet[i].LOCATION_ID,
                "VCRESTRICTIONID": lirtrhdrdet[i].RESTRICTION,
                "VCPLACEHOLDER": ''
            };
            oReq.rtrhdr.push(vRtrhdr);
            oReq.locrtr.push(vLocRtr);

        }
        return oReq;
    }
    async importFutureDemandcharPlan(lData, liParaValue, request, lSrvFlag, service, servicePost, aReturn) {
        const service1 = await cds.connect.to('IBPDemandsrv');

        let lMessage = '', flag;
        let lVersion = '', lScenario = '', vFromDate, vToDate, req, resUrl;
        let lsData = {},
            lsFchar = {},
            liFchar = [],
            lsFchar1 = {},
            liFchar1 = [];

        // fETCH CUSTOMER GROUP 
        let lsCustomer = await SELECT.one
            .from('V_SALES_H')
            .columns('CUSTOMER_GROUP')
            .where(`PRODUCT_ID = '${lData.PRODUCT_ID}' AND LOCATION_ID = '${lData.LOCATION_ID}'`);

        lsData.LOCATION_ID = lData.LOCATION_ID;
        lsData.PRODUCT_ID = lData.PRODUCT_ID;
        // vFromDate = new Date(lData.FROMDATE).toISOString().split('Z')[0];
        vFromDate = new Date(lData.FROMDATE).toISOString().split('T')[0].toString();
        vFromDate = vFromDate + "T00:00:00";
        // vToDate = new Date(lData.TODATE).toISOString().split('Z')[0];
        vToDate = new Date(lData.TODATE).toISOString().split('T')[0].toString();
        vToDate = vToDate + "T00:00:00";
        // resUrl = "/" + liParaValue[0].VALUE + "?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP ge datetime'" + vFromDate + "' and PERIODID4_TSTAMP le datetime'" + vToDate + "' and UOMTOID eq 'EA' and CUSTID eq '" + lsCustomer.CUSTOMER_GROUP + "'";
        resUrl = "/" + liParaValue[0].VALUE + "?$select=PRDID,LOCID,PERIODID4_TSTAMP,TOTALDEMANDOUTPUT,UOMTOID,VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP ge datetime'" + vFromDate + "' and PERIODID4_TSTAMP le datetime'" + vToDate + "' and UOMTOID eq 'EA' and CUSTID eq '" + lsCustomer.CUSTOMER_GROUP + "' and VERSIONID eq '" + lData.VERSION + "' and SCENARIOID eq '" + lData.SCENARIO + "'";

        // Request Option percentage at Product 
        try {
            request.headers['Application-Interface-Key'] = vAIRKey;
            req = await service1.tx(request).get(resUrl);
        }
        catch (e) {
            lMessage = "Request to IBP failed for the requested inputs: " + lsData.LOCATION_ID + "," + lsData.PRODUCT_ID + "," + lVersion + "," + lScenario;
        }
        // Delete previous records from current date
        const vDelDate = new Date();
        const vDateDeld = vDelDate.toISOString().split('T')[0];
        try {
            // await DELETE.from('CP_IBP_FUTUREDEMAND')
            //     .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
            //                 AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
            //                 AND WEEK_DATE  < '${vDateDeld}'`);

            await DELETE.from('CP_IBP_FUTUREDEMAND')
                .where(`LOCATION_ID = '${lsData.LOCATION_ID}' 
                                                    AND PRODUCT_ID = '${lsData.PRODUCT_ID}'
                                                    AND WEEK_DATE  < '${vDateDeld}'
                                                    AND VERSION = '${lData.VERSION}'
                                                    AND SCENARIO = '${lData.SCENARIO}'`);
        }
        catch (e) {
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
            lScenario = ''
            if (req[i].SCENARIOID === '' || req[i].SCENARIOID === null) {
                lScenario = '_PLAN';
            }
            else {
                lScenario = req[i].SCENARIOID; //'BSL_SCENARIO';
            }
            req[i].PERIODID4_TSTAMP = vWeekDate;

            if (vWeekDate >= vDateDeld) {
                // Delete existing record before updating
                await cds.run(
                    `DELETE FROM "CP_IBP_FUTUREDEMAND" WHERE "LOCATION_ID" = '` + req[i].LOCID + `' 
                                                          AND "PRODUCT_ID" = '`+ req[i].PRDID + `'
                                                          AND "VERSION" = '` + req[i].VERSIONID + `'
                                                          AND "SCENARIO" = '` + lScenario + `'
                                                          AND "WEEK_DATE" = '` + vWeekDate + `'`
                );
                let modQuery = 'INSERT INTO "CP_IBP_FUTUREDEMAND" VALUES (' +
                    "'" + req[i].LOCID + "'" + "," +
                    "'" + req[i].PRDID + "'" + "," +
                    "'" + req[i].VERSIONID + "'" + "," +
                    "'" + lScenario + "'" + "," +
                    "'" + vWeekDate + "'" + "," +
                    "'" + req[i].TOTALDEMANDOUTPUT + "'" + ')';// + ' WITH PRIMARY KEY';
                try {
                    await cds.run(modQuery);
                    flag = 'D';
                    lsFchar = {};
                    lsFchar['LOCATION_ID'] = GenF.parse(req[i].LOCID);
                    lsFchar['PRODUCT_ID'] = GenF.parse(req[i].PRDID);
                    lsFchar['VERSION'] = GenF.parse(req[i].VERSIONID);
                    lsFchar['SCENARIO'] = GenF.parse(lScenario);
                    lsFchar['WEEK_DATE'] = GenF.parse(vWeekDate);
                    liFchar.push(GenF.parse(lsFchar));

                }
                catch (err) {
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
            // // resUrlFplan = "/" + liParaValue[0].VALUE + "?$select=PERIODID4_TSTAMP,PRDID,LOCID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP ge datetime'" + vFromDate + "' and PERIODID4_TSTAMP le datetime'" + vToDate + "' and UOMTOID eq 'EA' and CUSTID eq '" + lsCustomer.CUSTOMER_GROUP + "' and FINALDEMANDVC gt 0&$inlinecount=allpages";

            // resUrlFplan = "/" + liParaValue[0].VALUE + "?$select=PERIODID4_TSTAMP,PRDID,LOCID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP ge datetime'" + vFromDate + "' and PERIODID4_TSTAMP le datetime'" + vToDate + "' and UOMTOID eq 'EA' and CUSTID eq '" + lsCustomer.CUSTOMER_GROUP + "' and VERSIONID eq '" + lData.VERSION + "' and SCENARIOID eq '" + lData.SCENARIO + "'&$inlinecount=allpages";
            resUrlFplan = "/" + liParaValue[0].VALUE + "?$select=PERIODID4_TSTAMP,PRDID,LOCID,VCCLASS,VCCHARVALUE,VCCHAR,FINALDEMANDVC,OPTIONPERCENTAGE,VERSIONID,SCENARIOID,MANUALOPTION&$filter=LOCID eq '" + lsData.LOCATION_ID + "' and PRDID eq '" + lsData.PRODUCT_ID + "' and PERIODID4_TSTAMP ge datetime'" + vFromDate + "' and PERIODID4_TSTAMP le datetime'" + vToDate + "' and UOMTOID eq 'EA' and and VERSIONID eq '" + lData.VERSION + "' and SCENARIOID eq '" + lData.SCENARIO + "'&$inlinecount=allpages";

            // Request Option percentage at VC
            try {
                request.headers['Application-Interface-Key'] = vAIRKey;
                req = await service.tx(request).get(resUrlFplan);
            }
            catch (e) {
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
            }
            catch (e) {
                //Do nothing
            }

            // Insert into Fchar plan
            for (let i in req) {
                let vWeekDate = dateJSONToEDM2(req[i].PERIODID4_TSTAMP).split('T')[0];
                if (req[i].SCENARIOID === '' || req[i].SCENARIOID === null) {
                    lScenario = '_PLAN';
                }
                else {
                    lScenario = req[i].SCENARIOID; //'BSL_SCENARIO';
                }
                req[i].PERIODID4_TSTAMP = vWeekDate;
                let vManualOpt = '0.0';
                if (req[i].MANUALOPTION !== '' && req[i].MANUALOPTION !== null) {
                    vManualOpt = req[i].MANUALOPTION
                }
                if (vWeekDate >= vDateDel) {
                    await cds.run(
                        `DELETE FROM "CP_IBP_FCHARPLAN" WHERE "LOCATION_ID" = '` + req[i].LOCID + `' 
                                                              AND "PRODUCT_ID" = '`+ req[i].PRDID + `'
                                                              AND "CLASS_NUM" = '` + req[i].VCCLASS + `' 
                                                              AND "CHAR_NUM" = '` + req[i].VCCHAR + `' 
                                                              AND "CHARVAL_NUM" = '` + req[i].VCCHARVALUE + `' 
                                                              AND "VERSION" = '` + req[i].VERSIONID + `'
                                                              AND "SCENARIO" = '` + lScenario + `'
                                                              AND "WEEK_DATE" = '` + vWeekDate + `'`
                    );

                    let modQuery = 'INSERT INTO "CP_IBP_FCHARPLAN" VALUES (' +
                        "'" + req[i].LOCID + "'" + "," +
                        "'" + req[i].PRDID + "'" + "," +
                        "'" + req[i].VCCLASS + "'" + "," +
                        "'" + req[i].VCCHAR + "'" + "," +
                        "'" + req[i].VCCHARVALUE + "'" + "," +
                        "'" + req[i].VERSIONID + "'" + "," +
                        "'" + lScenario + "'" + "," +
                        "'" + vWeekDate + "'" + "," +
                        "'" + req[i].OPTIONPERCENTAGE + "'" + "," +
                        "'" + req[i].FINALDEMANDVC + "'" + "," +
                        "'" + vManualOpt + "'" + ')';// + ' WITH PRIMARY KEY';
                    try {
                        await cds.run(modQuery);
                        lMessage = lMessage + " Request to IBP CharPlan Successful for the requested inputs: " + lsData.LOCATION_ID + "," + lsData.PRODUCT_ID + "," + lVersion + "," + lScenario;

                        flag = 'S';
                    }
                    catch (err) {
                        lMessage = lMessage + " Request to IBP CharPlan failed for the requested inputs: " + lsData.LOCATION_ID + "," + lsData.PRODUCT_ID + "," + lVersion + "," + lScenario;

                        flag = 'E';
                        console.log(err);
                    }
                }
            }
        }
        aReturn.Message = lMessage;
        aReturn.Success = flag;
        // On success generate and send Market authorizations to IBP
        if (flag === 'S' && liFchar.length > 0) {
            lsData = {};

            let Keys = ['LOCATION_ID', 'PRODUCT_ID', 'WEEK_DATE', 'VERSION', 'SCENARIO'];
            liFchar = GenF.removeDuplicate(liFchar, Keys);
            for (let cntChr = 0; cntChr < liFchar.length; cntChr++) {
                console.log(liFchar[cntChr].WEEK_DATE);
                // await obgenMktAuth.updateOptPer(liFchar[cntChr].LOCATION_ID, liFchar[cntChr].PRODUCT_ID, liFchar[cntChr].WEEK_DATE, liFchar[cntChr].VERSION, liFchar[cntChr].SCENARIO, request);
                await objDerConfig.genDerivedCharPercent(liFchar[cntChr].LOCATION_ID, liFchar[cntChr].PRODUCT_ID, liFchar[cntChr].WEEK_DATE, liFchar[cntChr].VERSION, liFchar[cntChr].SCENARIO);
            }
            await this.exportMarketauthIBP(lData, request, service, servicePost, aReturn);
        }

    }
    /**
     * 
     * @param {Data} aData 
     * @param {Request} request 
     * @param {serviceGet} service 
     * @param {servicePost} servicePost 
     */
    async exportMarketauthIBP(aData, request, service, servicePost, aReturn) {
        let liParaValue = await GenF.getIBPParameterValue();
        let lData = "Nav" + liParaValue[0].VALUE.toString();
        let lEntity = "/" + liParaValue[0].VALUE.toString() + "Trans";
        let oReq = {
            mktauth: [],
        }, lSuccess = '', lMessage = '',
            chunksList = [];
        lMessage = (aReturn.lMessage) ? aReturn.lMessage : '';
        const oReturn = {
            "error": false,
            "message": ''
        }
        const query = `SELECT
        CP_MARKETAUTH_CFG."WEEK_DATE",
        CP_MARKETAUTH_CFG."LOCATION_ID",
        CP_MARKETAUTH_CFG."PRODUCT_ID",
        CP_MARKETAUTH_CFG."CLASS_NUM",
        CP_MARKETAUTH_CFG."CHAR_NUM",
        CP_MARKETAUTH_CFG."CHARVAL_NUM",
        CP_MARKETAUTH_CFG."OPT_PERCENT",
        CP_MARKETAUTH_CFG."VERSION",
        CP_MARKETAUTH_CFG."SCENARIO"
    FROM
        CP_MARKETAUTH_CFG
        INNER JOIN
        V_PARTIALPRODCLASSCHAR
        ON CP_MARKETAUTH_CFG.LOCATION_ID = V_PARTIALPRODCLASSCHAR.LOCATION_ID
            AND CP_MARKETAUTH_CFG.PRODUCT_ID = V_PARTIALPRODCLASSCHAR.PRODUCT_ID
            AND CP_MARKETAUTH_CFG.CLASS_NUM = V_PARTIALPRODCLASSCHAR.CLASS_NUM
            AND CP_MARKETAUTH_CFG.CHAR_NUM = V_PARTIALPRODCLASSCHAR.CHAR_NUM
            AND CP_MARKETAUTH_CFG.CHARVAL_NUM = V_PARTIALPRODCLASSCHAR.CHARVAL_NUM
    WHERE CP_MARKETAUTH_CFG.LOCATION_ID = '${aData.LOCATION_ID}'
        AND CP_MARKETAUTH_CFG.PRODUCT_ID = '${aData.PRODUCT_ID}'
        AND (CP_MARKETAUTH_CFG.WEEK_DATE >= '${aData.FROMDATE}'
        AND CP_MARKETAUTH_CFG.WEEK_DATE <= '${aData.TODATE}')
        AND V_PARTIALPRODCLASSCHAR.IBPCHAR_CHK = true`
        const limkauth = await cds.run(query);
        for (let imk = 0; imk < limkauth.length; imk++) {
            let lsCustomer = await SELECT.one
                .from('V_SALES_H')
                .columns('CUSTOMER_GROUP')
                .where(`PRODUCT_ID = '${aData.PRODUCT_ID}' AND LOCATION_ID = '${aData.LOCATION_ID}'`);
            let vDemd, vMktauth;
            let vWeekDate = new Date(limkauth[imk].WEEK_DATE).toISOString().split('Z');
            let vOpt = limkauth[imk].OPT_PERCENT.toString();
            let vSrch = vOpt.search(".");
            if (vSrch > 0) {
                vDemd = vOpt.split('.')[0];
            }
            else {
                vDemd = vOpt;
            }
            vDemd = parseInt(vDemd) / 100;
            vMktauth = {
                "LOCID": limkauth[imk].LOCATION_ID,
                "PRDID": limkauth[imk].PRODUCT_ID,
                "VCCHAR": limkauth[imk].CHAR_NUM,
                "VCCHARVALUE": limkauth[imk].CHARVAL_NUM,
                "VCCLASS": limkauth[imk].CLASS_NUM,
                "CUSTID": lsCustomer.CUSTOMER_GROUP,
                "PERIODID4_TSTAMP": vWeekDate[0],
                "DERIVEDOPTION": vDemd.toString()
            };
            oReq.mktauth.push(vMktauth);
        }
        if (oReq.mktauth.length > 0) {
            let vTransID = new Date().getTime().toString();
            // let chunked = false;
            if (oReq.mktauth.length > 5000) {
                let iChnk, iChkCounter = 0;
                // Initialize Parallel processing
                let resUrlPP = "/InitiateParallelProcess?ScenarioID=''&VersionID=''&PlanningArea='" + liParaValue[0].VALUE + "'&Transactionid='" + vTransID + "'";
                try {
                    await service.tx(request).post(resUrlPP);
                }
                catch (e) {
                    console.log(e);
                }
                // Divide into multiple arrays with each array length as 5000
                // chunked = true;
                let aData = oReq.mktauth;
                chunksList = [];
                const chunkSize = 5000;
                for (let i = 0; i < aData.length; i += chunkSize) {
                    const chunk = aData.slice(i, i + chunkSize)
                    chunksList.push(chunk);
                }
                console.log(chunksList.length);
                // Process each chunk to IBP
                for (iChnk = 0; iChnk < chunksList.length; iChnk++) {
                    let oEntryPP =
                    {
                        "Transactionid": vTransID,
                        "AggregationLevelFieldsString": "PERIODID4_TSTAMP,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,LOCID,PRDID,DERIVEDOPTION",
                        "VersionID": "",
                        "ScenarioID": ""
                    }
                    oEntryPP[lData] = chunksList[iChnk];
                    try {
                        request.headers['Application-Interface-Key'] = vAIRKey;
                        await service.tx(request).post(lEntity, oEntryPP);
                        lMessage = lMessage + ' ' + " Export of Market authorization is successfull for product" + aData.PRODUCT_ID;
                        lSuccess = 'S';
                        oReturn.error = false;
                        iChkCounter = iChkCounter + 1;
                    }
                    catch (error) {
                        lMessage = lMessage + ' ' + " Export of Market authorization has failed for product" + aData.PRODUCT_ID;
                        lSuccess = 'E';
                        oReturn.error = true;
                        oReturn.message = lMessage;
                        // throw new Error(lMessage);
                    }
                }
                // If all are successfull commit the request

                if (iChkCounter > 0) {
                    let resUrlPPCommit = "/commit?P_TransactionID='" + vTransID + "'&$format=json";
                    try {
                        await service.tx(request).post(resUrlPPCommit);
                        lMessage = lMessage + ' ' + 'Export of Sales History and Configuration is successful for product:' + aData.PRODUCT_ID;
                    }
                    catch (e) {
                        console.log(e);
                        console.log("Error while committing the parallel processing");
                    }
                }
            }
            else {
                let oEntry =
                {
                    "Transactionid": vTransID,
                    "AggregationLevelFieldsString": "PERIODID4_TSTAMP,VCCHAR,VCCHARVALUE,VCCLASS,CUSTID,LOCID,PRDID,DERIVEDOPTION",
                    "VersionID": "",
                    "DoCommit": true,
                    "ScenarioID": ""
                }
                oEntry[lData] = oReq.mktauth;
                try {

                    request.headers['Application-Interface-Key'] = vAIRKey;
                    await service.tx(request).post(lEntity, oEntry);
                    lMessage = lMessage + ' ' + " Export of Market authorization is successfull for product" + aData.PRODUCT_ID;
                    lSuccess = 'S';
                    oReturn.error = false;
                }
                catch (error) {
                    lMessage = lMessage + ' ' + " Export of Market authorization has failed for product" + aData.PRODUCT_ID;
                    lSuccess = 'E';
                    oReturn.error = true;
                    oReturn.message = lMessage;
                    // throw new Error(lMessage);
                }
            }
        }
        aReturn.Message = lMessage;
        aReturn.Success = lSuccess;
        return oReturn;

    }
    /**
     * 
     * @param {FromDate} lFromDate 
     * @param {ToDate} lToDate 
     */
    generateDateseries(lFromDate, lToDate) {

        var lsDates = {},
            liDates = [];
        var vDateSeries = lFromDate;
        lsDates = {};
        let vWeekIndex = 0;

        // Calling function to get the next Sunday date of From date
        let dDate = new Date(vDateSeries);
        let dDay = dDate.getDay();

        vWeekIndex = vWeekIndex + 1;
        if (dDay === 1) {
            lsDates.WEEK_DATE = lFromDate;
            lsDates.INDEX = vWeekIndex;
        } else {
            lsDates.WEEK_DATE = GenF.getNextMondayCmp(vDateSeries);
            lsDates.INDEX = vWeekIndex;
        }
        vDateSeries = lsDates.WEEK_DATE;
        liDates.push(lsDates);
        lsDates = {};

        while (vDateSeries <= lToDate) {
            // Calling function to add Days
            vDateSeries = GenF.addDays(vDateSeries, 7);

            if (vDateSeries > lToDate) {
                break;
            }
            vWeekIndex = vWeekIndex + 1;
            lsDates.WEEK_DATE = vDateSeries;
            lsDates.INDEX = vWeekIndex;
            liDates.push(lsDates);
            lsDates = {};
        }
        // remove duplicates
        var lireturn = liDates.filter((obj, pos, arr) => {
            return (
                arr.map((mapObj) => mapObj.WEEK_DATE).indexOf(obj.WEEK_DATE) == pos
            );
        });
        return lireturn;


    }
    /**
     * 
     * @param {Request} request 
     */
     async importVerScen(request) {

        const service = await cds.connect.to('IBPDemandsrv');
        const servicePost = await cds.connect.to('IBPMasterDataAPI');
        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();
        let flag, lSuccess = '', vScenario, vScenarioName;
        let resUrl = "/" + liParaValue[0].VALUE + "?$select=VERSIONID,VERSIONNAME,SCENARIOID,SCENARIONAME&$inlinecount=allpages";
        request.headers['Application-Interface-Key'] = vAIRKey;
        console.log(request.headers);
        let req = await service.tx(request).get(resUrl);
        var oReturn={
            flag:'',
            message:''
        }
        if (req.length > 0) {
            await DELETE.from('CP_IBPVERSIONSCENARIO');
        }
        for (let i in req) {
            if (req[i].SCENARIOID === '' || req[i].SCENARIOID === null) {
                vScenario = '_PLAN';
            }
            else {
                vScenario = req[i].SCENARIOID; //'BSL_SCENARIO';
            }
            if (req[i].SCENARIONAME === '' || req[i].SCENARIONAME === null) {
                vScenarioName = vScenario;
            }
            else {
                vScenarioName = req[i].SCENARIONAME; //'BSL_SCENARIO';
            }
            let modQuery = 'INSERT INTO "CP_IBPVERSIONSCENARIO" VALUES (' +
                "'" + req[i].VERSIONID + "'" + "," +
                "'" + vScenario + "'" + "," +
                "'" + req[i].VERSIONNAME + "'" + "," +
                "'" + vScenarioName + "'" + ')';
            try {
                await cds.run(modQuery);
                lSuccess = 'S';
                oReturn.flag = lSuccess;
            }
            catch (err) {
                lSuccess = 'E';
                oReturn.flag = lSuccess;
                oReturn.message = err.message;
            }
        }
        return oReturn;
    }
    async ImportChangeHis(IJobid, request, service, servicePost, serviceChLog, aReturn) {

        // const serviceChLog = await cds.connect.to('IBPChangeHistory');

        // Get Planning area and Prefix configurations for IBP
        let liParaValue = await GenF.getIBPParameterValue();

        let lEntity = liParaValue[0].VALUE.toString() + "Set";
        let lSuccess = '', vFromDate, vToDate, resUrl, req, lJobStatus = 5;
        let lsResults = {};
        let bFlag = '', lMessage = '';
        // const dateJSONToEDM2 = jsonDate => {
        //     const content = /\d+/.exec(String(jsonDate));
        //     const timestamp = content ? Number(content[0]) : 0;
        //     const date = new Date(timestamp);
        //     const string = date.toISOString();
        //     return string;
        // };

        bFlag = await this.importVerScen(request);
        if (bFlag === 'S') {
            lMessage = "Successfully imported version scenario from IBP";
            console.log(lMessage);
        } else {
            lMessage = "Failed to import version scenario from IBP";
            console.log(lMessage);
        }

        //Check if Job is extractable
        while (lJobStatus > 0) {
            req = '';
            resUrl = "/" + "ChangeHistoryJobSet('" + IJobid + "')";
            try {
                request.headers['Application-Interface-Key'] = vAIRKey;
                req = await serviceChLog.tx(request).get(resUrl);
                if (req.Status === 'Extractable') {
                    lJobStatus = 0;
                    req = '';
                    break;
                }
            } catch (error) {
                console.log(error);
            }

        }
        //Get change logs w.r.t Job ID
        if (lJobStatus === 0) {
            resUrl = "/" + "OriginalViewResult" + lEntity + "?$filter=JOBID eq '" + IJobid + "'";
            try {
                request.headers['Application-Interface-Key'] = vAIRKey;
                req = await serviceChLog.tx(request).get(resUrl);
            }
            catch (error) {
                console.log(error);
            }
        }

        // Get all the Scenarios imported from IBP for version - __BASELINE
        let aIBPVerScen = await cds.run(`SELECT * 
                                           FROM CP_IBPVERSIONSCENARIO 
                                          WHERE VERSION = '__BASELINE' `);
        //Remove duplicates 
        let Keys = ['PERIODID', 'LOCID', 'PRDID'];
        let liJobDet = GenF.removeDuplicate(req, Keys);
        for (let iJob = 0; iJob < liJobDet.length; iJob++) {
            // Fecch from and To Date
            let lsPeriodIdDates = await SELECT.one
                .from('CP_IBPCALENDER_WEEK')
                .where(`PERIODID = '${liJobDet[iJob].PERIODID}'`);

            lsResults.LOCATION_ID = liJobDet[iJob].LOCID;
            lsResults.PRODUCT_ID = liJobDet[iJob].PRDID;
            lsResults.FROMDATE = lsPeriodIdDates.WEEK_STARTDATE;
            lsResults.TODATE = lsPeriodIdDates.WEEK_ENDDATE;

            // Loop through all the scenarios to get the changed percentages from IBP
            // NOTE - As IBP cannot track scenario in change log, we could not pull percentages for it.
            //        So we had to loop through all scenarios to fetch option percent from IBP
            if (aIBPVerScen.length > 0) {
                for (let iIBPVS = 0; iIBPVS < aIBPVerScen.length; iIBPVS++) {
                    lsResults.VERSION = aIBPVerScen[iIBPVS].VERSION;
                    if (aIBPVerScen[iIBPVS].SCENARIO === '_PLAN') {
                        lsResults.SCENARIO = ' ';
                    } else {
                        lsResults.SCENARIO = aIBPVerScen[iIBPVS].SCENARIO;
                    }
                    await this.importFutureDemandcharPlan(lsResults, liParaValue, request, 'X', service, servicePost, aReturn);
                }
            }

            // await this.importFutureDemandcharPlan(lsResults, liParaValue, request, 'X', service, servicePost, aReturn);
        }
    }
    /**
     * 
     * @param {Request} request 
     */
    async genAssemblyMultilevelC(lLocation, lProduct, lConfigProd, lConfigLoc, aBOMASMHier, lMRPTyp) {
        let aBOMMat = [], oBOMASM = {}, aBOMASM = [];
        // // let aBOMASMHier = [];
        // // aReturnHier = aBOMASMHier;
        // aBOMMat = await cds.run(`SELECT DISTINCT "LOCATION_ID",
        //                                             "MAT_PARENT",
        //                                             "MAT_CHILD",
        //                                             "CHILD_LOC",
        //                                             "MRP_GROUP",
        //                                             "MRP_TYPE",
        //                                             "COMP_TYPE",
        //                                             "PHANTOM_IND",
        //                                             "CONFIGURABLE",
        //                                             "CLASS_FLG",
        //                                             "PROD_DESC"
        //                                        FROM CP_BOM_MAT
        //                                         WHERE LOCATION_ID = '${lLocation}'  
        //                                           AND MAT_PARENT = '${lProduct}'                        
        //                                         ORDER BY LOCATION_ID,
        //                                                     MAT_PARENT,
        //                                                     MAT_CHILD,
        //                                                     CHILD_LOC`);
         // let aBOMASMHier = [];
        // aReturnHier = aBOMASMHier;
        aBOMMat = await cds.run(`SELECT DISTINCT "LOCATION_ID",
                                                    "MAT_PARENT",
                                                    "MAT_CHILD",
                                                    "CHILD_LOC",
                                                    "COMP_TYPE",
                                                    "PHANTOM_IND",
                                                    "CONFIGURABLE",
                                                    "CLASS_FLG",
                                                    "PROD_DESC"
                                               FROM CP_BOM_MAT
                                                WHERE LOCATION_ID = '${lLocation}'  
                                                  AND MAT_PARENT = '${lProduct}'                        
                                                ORDER BY LOCATION_ID,
                                                            MAT_PARENT,
                                                            MAT_CHILD,
                                                            CHILD_LOC`);

        if (aBOMMat.length > 0) {
            for (let i = 0; i < aBOMMat.length; i++) {
                aBOMASM = [], oBOMASM = {};
                // if (lMRPTyp === '') {
                //     lMRPTyp = aBOMMat[i].MRP_TYPE;
                // }
                

                if(lLocation !== lConfigLoc) {
                    lProduct = lConfigProd.concat('_', aBOMMat[i].LOCATION_ID);
                } else {
                    lProduct = lConfigProd;
                }
                

                // if (lLocation !== lConfigLoc && lConfigLoc !== aBOMMat[i].CHILD_LOC) {
                //     lProduct = lConfigProd.concat('_', aBOMMat[i].LOCATION_ID);
                // } else if (lLocation !== lConfigLoc && lConfigLoc === aBOMMat[i].CHILD_LOC) {
                //     lProduct = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                // }
                // else {
                //     lProduct = lConfigProd;
                // }

                // If is not a Phantom or class AND donot push product if the child is of alternate plant beacuse this Assembly comes with Dummy product
                if ((aBOMMat[i].PHANTOM_IND).toUpperCase() !== 'X' && aBOMMat[i].CLASS_FLG !== 'X' && (lLocation === aBOMMat[i].CHILD_LOC)) {

                    oBOMASM.LOCATION_ID = aBOMMat[i].CHILD_LOC;
                    oBOMASM.PRODUCT_ID = lProduct;
                    oBOMASM.COMPONENT = aBOMMat[i].MAT_CHILD;
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = aBOMMat[i].MRP_TYPE;
                    aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};
                }

                // if (lLocation !== aBOMMat[i].CHILD_LOC) {
                if (lLocation !== aBOMMat[i].CHILD_LOC && lConfigLoc !== aBOMMat[i].CHILD_LOC) {
                    oBOMASM.LOCATION_ID = aBOMMat[i].CHILD_LOC;
                    oBOMASM.COMPONENT = aBOMMat[i].MAT_CHILD;
                    oBOMASM.PRODUCT_ID = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = aBOMMat[i].MRP_TYPE;
                    aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};

                    oBOMASM.LOCATION_ID = lLocation;
                    oBOMASM.COMPONENT = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                    oBOMASM.PRODUCT_ID = lProduct;
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = lMRPTyp; //aBOMMat[i].MRP_TYPE;
                    aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};
                } else if (lConfigLoc === aBOMMat[i].CHILD_LOC && (aBOMMat[i].PHANTOM_IND).toUpperCase() !== 'X' && aBOMMat[i].CLASS_FLG !== 'X') {
                    oBOMASM.LOCATION_ID = aBOMMat[i].CHILD_LOC; //lLocation;
                    oBOMASM.COMPONENT = aBOMMat[i].MAT_CHILD;
                    oBOMASM.PRODUCT_ID = lProduct;
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = aBOMMat[i].MRP_TYPE;
                    // aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};

                    // if (lLocation !== lConfigLoc) {
                    //     oBOMASM.LOCATION_ID = lLocation;
                    //     oBOMASM.COMPONENT = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                    //     oBOMASM.PRODUCT_ID = lConfigProd.concat('_', aBOMMat[i].LOCATION_ID);
                    //     oBOMASM.STRUCNODE = '';
                    //     oBOMASM.MRP_TYPE = lMRPTyp; //aBOMMat[i].MRP_TYPE;
                    //     aBOMASM.push(GenF.parse(oBOMASM));
                    //     oBOMASM = {};
                    // }
                }
                if (aBOMASM.length > 0) {

                    if (aBOMASMHier.length === 0) {
                        aBOMASMHier = aBOMASM;
                    } else {
                        aBOMASMHier = [...aBOMASMHier, ...aBOMASM];
                    }
                }
                // If it configurable and the child Location is same as the location selected from UI then go to Next levels
                if (((aBOMMat[i].PHANTOM_IND).toUpperCase() === 'X' || aBOMMat[i].CLASS_FLG === 'X' || aBOMMat[i].CONFIGURABLE === 'X')
                ) {
                    aBOMASMHier = await this.genAssemblyMultilevelC(aBOMMat[i].CHILD_LOC, aBOMMat[i].MAT_CHILD, lConfigProd, lConfigLoc, aBOMASMHier, lMRPTyp);

                }
            }

        }
        return aBOMASMHier;

    }

    async genAssemblyMultilevelCC(lLocation, lProduct, lConfigProd, lConfigLoc, aBOMASMHier, lMRPTyp) {
        let aBOMMat = [], oBOMASM = {}, aBOMASM = [];
        // // let aBOMASMHier = [];
        // // aReturnHier = aBOMASMHier;
        // aBOMMat = await cds.run(`SELECT DISTINCT "LOCATION_ID",
        //                                             "MAT_PARENT",
        //                                             "MAT_CHILD",
        //                                             "CHILD_LOC",
        //                                             "MRP_GROUP",
        //                                             "MRP_TYPE",
        //                                             "COMP_TYPE",
        //                                             "PHANTOM_IND",
        //                                             "CONFIGURABLE",
        //                                             "CLASS_FLG",
        //                                             "PROD_DESC"
        //                                        FROM CP_BOM_MAT
        //                                         WHERE LOCATION_ID = '${lLocation}'  
        //                                           AND MAT_PARENT = '${lProduct}'                        
        //                                         ORDER BY LOCATION_ID,
        //                                                     MAT_PARENT,
        //                                                     MAT_CHILD,
        //                                                     CHILD_LOC`);
        
        aBOMMat = await cds.run(`SELECT DISTINCT "LOCATION_ID",
                                                    "MAT_PARENT",
                                                    "MAT_CHILD",
                                                    "CHILD_LOC",
                                                    "COMP_TYPE",
                                                    "PHANTOM_IND",
                                                    "CONFIGURABLE",
                                                    "CLASS_FLG",
                                                    "PROD_DESC"
                                               FROM CP_BOM_MAT
                                                WHERE LOCATION_ID = '${lLocation}'  
                                                  AND MAT_PARENT = '${lProduct}'                        
                                                ORDER BY LOCATION_ID,
                                                            MAT_PARENT,
                                                            MAT_CHILD,
                                                            CHILD_LOC`);
 
        if (aBOMMat.length > 0) {
            for (let i = 0; i < aBOMMat.length; i++) {
                aBOMASM = [], oBOMASM = {}; 
                // if(lMRPTyp === '') {
                //    lMRPTyp = aBOMMat[i].MRP_TYPE;
                // }
                /** */
                // if(lLocation !== lConfigLoc) {
                //     lProduct = lConfigProd.concat('_', aBOMMat[i].LOCATION_ID);
                // } else {
                //     lProduct = lConfigProd;
                // }
                /** */
                if(lLocation !== lConfigLoc &&  lConfigLoc !== aBOMMat[i].CHILD_LOC) {
                    lProduct = lConfigProd.concat('_', aBOMMat[i].LOCATION_ID);
                } else if(lLocation !== lConfigLoc &&  lConfigLoc === aBOMMat[i].CHILD_LOC) {
                    lProduct = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                }
                 else {
                    lProduct = lConfigProd;
                }
                // If is not a Phantom or class AND donot push product if the child is of alternate plant beacuse this Assembly comes with Dummy product
                if (aBOMMat[i].PHANTOM_IND !== 'X' && aBOMMat[i].CLASS_FLG !== 'X' && (lLocation === aBOMMat[i].CHILD_LOC)) {
 
                    oBOMASM.LOCATION_ID = aBOMMat[i].CHILD_LOC;
                    oBOMASM.PRODUCT_ID = lProduct;
                    oBOMASM.COMPONENT = aBOMMat[i].MAT_CHILD;
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = aBOMMat[i].MRP_TYPE;
                    aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};
                }

                // if (lLocation !== aBOMMat[i].CHILD_LOC) {
                if (lLocation !== aBOMMat[i].CHILD_LOC && lConfigLoc !== aBOMMat[i].CHILD_LOC) {
                    oBOMASM.LOCATION_ID = aBOMMat[i].CHILD_LOC;
                    oBOMASM.COMPONENT = aBOMMat[i].MAT_CHILD;
                    oBOMASM.PRODUCT_ID = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = aBOMMat[i].MRP_TYPE;
                    aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};
 
                    oBOMASM.LOCATION_ID = lLocation;
                    oBOMASM.COMPONENT = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                    oBOMASM.PRODUCT_ID = lProduct;
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = lMRPTyp; //aBOMMat[i].MRP_TYPE;
                    aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};
                } else if(lConfigLoc === aBOMMat[i].CHILD_LOC && aBOMMat[i].PHANTOM_IND !== 'X' && aBOMMat[i].CLASS_FLG !== 'X') {
                    oBOMASM.LOCATION_ID = aBOMMat[i].CHILD_LOC; //lLocation;
                    oBOMASM.COMPONENT = aBOMMat[i].MAT_CHILD;
                    oBOMASM.PRODUCT_ID = lProduct;
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = aBOMMat[i].MRP_TYPE;
                    aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};

                    if (lLocation !== lConfigLoc) {
                        oBOMASM.LOCATION_ID = lLocation;
                        oBOMASM.COMPONENT = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                        oBOMASM.PRODUCT_ID = lConfigProd.concat('_', aBOMMat[i].LOCATION_ID);
                        oBOMASM.STRUCNODE = '';
                        // oBOMASM.MRP_TYPE = lMRPTyp; //aBOMMat[i].MRP_TYPE;
                        aBOMASM.push(GenF.parse(oBOMASM));
                        oBOMASM = {};
                    }
                }
                if (aBOMASM.length > 0) {
 
                    if (aBOMASMHier.length === 0) {
                        aBOMASMHier = aBOMASM;
                    } else {
                        aBOMASMHier = [...aBOMASMHier, ...aBOMASM];
                    }
                }
                // If it configurable and the child Location is same as the location selected from UI then go to Next levels
                if ((aBOMMat[i].PHANTOM_IND === 'X' || aBOMMat[i].CLASS_FLG === 'X' || aBOMMat[i].CONFIGURABLE === 'X')
                ) {
                    aBOMASMHier = await this.genAssemblyMultilevel(aBOMMat[i].CHILD_LOC, aBOMMat[i].MAT_CHILD, lConfigProd, lConfigLoc, aBOMASMHier, lMRPTyp); 
                    
                }
            }
 
        }
        return aBOMASMHier;
 
    }

    async genAssemblyMultilevel(lLocation, lProduct, lConfigProd, lConfigLoc, aBOMASMHier, aBOMData, lMRPTyp,TempData) {
        let aBOMMat = [], oBOMASM = {}, aBOMASM = [];
        // // let aBOMASMHier = [];
        // // aReturnHier = aBOMASMHier;
        // aBOMMat = await cds.run(`SELECT DISTINCT "LOCATION_ID",
        //                                             "MAT_PARENT",
        //                                             "MAT_CHILD",
        //                                             "CHILD_LOC",
        //                                             "MRP_GROUP",
        //                                             "MRP_TYPE",
        //                                             "COMP_TYPE",
        //                                             "PHANTOM_IND",
        //                                             "CONFIGURABLE",
        //                                             "CLASS_FLG",
        //                                             "PROD_DESC"
        //                                        FROM CP_BOM_MAT
        //                                         WHERE LOCATION_ID = '${lLocation}'  
        //                                           AND MAT_PARENT = '${lProduct}'                        
        //                                         ORDER BY LOCATION_ID,
        //                                                     MAT_PARENT,
        //                                                     MAT_CHILD,
        //                                                     CHILD_LOC`);
        aBOMMat = await cds.run(`SELECT DISTINCT "LOCATION_ID",
                                                    "MAT_PARENT",
                                                    "MAT_CHILD",
                                                    "CHILD_LOC",
                                                    "COMP_TYPE",
                                                    "PHANTOM_IND",
                                                    "CONFIGURABLE",
                                                    "CLASS_FLG",
                                                    "PROD_DESC"
                                               FROM CP_BOM_MAT
                                                WHERE LOCATION_ID = '${lLocation}'  
                                                  AND MAT_PARENT = '${lProduct}'                        
                                                ORDER BY LOCATION_ID,
                                                            MAT_PARENT,
                                                            MAT_CHILD,
                                                            CHILD_LOC`);
        aBOMMat = aBOMData[lLocation][lProduct];
        let lsobj = {
            LOCATION_ID : lLocation,
            PRODUCT_ID : lProduct
        };
            TempData.push(lsobj);
        if (aBOMMat !== undefined && aBOMMat.length > 0) {
            
            for (let i = 0; i < aBOMMat.length; i++) {
                aBOMASM = [], oBOMASM = {}; 
                // if(lMRPTyp === '') {
                //    lMRPTyp = aBOMMat[i].MRP_TYPE;
                // }
                /** */
                // if(lLocation !== lConfigLoc) {
                //     lProduct = lConfigProd.concat('_', aBOMMat[i].LOCATION_ID);
                // } else {
                //     lProduct = lConfigProd;
                // }
                /** */
                if(lLocation !== lConfigLoc &&  lConfigLoc !== aBOMMat[i].CHILD_LOC) {
                    lProduct = lConfigProd.concat('_', lLocation);
                } else if(lLocation !== lConfigLoc &&  lConfigLoc === aBOMMat[i].CHILD_LOC) {
                    lProduct = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                }
                 else {
                    lProduct = lConfigProd;
                }
                // If is not a Phantom or class AND donot push product if the child is of alternate plant beacuse this Assembly comes with Dummy product
                if (aBOMMat[i].PHANTOM_IND !== 'X' && aBOMMat[i].CLASS_FLG !== 'X' && (lLocation === aBOMMat[i].CHILD_LOC)) {
 
                    oBOMASM.LOCATION_ID = aBOMMat[i].CHILD_LOC;
                    oBOMASM.PRODUCT_ID = lProduct;
                    oBOMASM.COMPONENT = aBOMMat[i].MAT_CHILD;
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = aBOMMat[i].MRP_TYPE;
                    aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};
                }

                // if (lLocation !== aBOMMat[i].CHILD_LOC) {
                if (lLocation !== aBOMMat[i].CHILD_LOC && lConfigLoc !== aBOMMat[i].CHILD_LOC) {
                    oBOMASM.LOCATION_ID = aBOMMat[i].CHILD_LOC;
                    oBOMASM.COMPONENT = aBOMMat[i].MAT_CHILD;
                    oBOMASM.PRODUCT_ID = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = aBOMMat[i].MRP_TYPE;
                    aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};
 
                    oBOMASM.LOCATION_ID = lLocation;
                    oBOMASM.COMPONENT = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                    oBOMASM.PRODUCT_ID = lProduct;
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = lMRPTyp; //aBOMMat[i].MRP_TYPE;
                    aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};
                } else if(lConfigLoc === aBOMMat[i].CHILD_LOC && aBOMMat[i].PHANTOM_IND !== 'X' && aBOMMat[i].CLASS_FLG !== 'X') {
                    oBOMASM.LOCATION_ID = aBOMMat[i].CHILD_LOC; //lLocation;
                    oBOMASM.COMPONENT = aBOMMat[i].MAT_CHILD;
                    oBOMASM.PRODUCT_ID = lProduct;
                    oBOMASM.STRUCNODE = '';
                    // oBOMASM.MRP_TYPE = aBOMMat[i].MRP_TYPE;
                    aBOMASM.push(GenF.parse(oBOMASM));
                    oBOMASM = {};

                    if (lLocation !== lConfigLoc) {
                        oBOMASM.LOCATION_ID = lLocation;
                        oBOMASM.COMPONENT = lConfigProd.concat('_', aBOMMat[i].CHILD_LOC);
                        oBOMASM.PRODUCT_ID = lConfigProd.concat('_', lLocation);
                        oBOMASM.STRUCNODE = '';
                        // oBOMASM.MRP_TYPE = lMRPTyp; //aBOMMat[i].MRP_TYPE;
                        aBOMASM.push(GenF.parse(oBOMASM));
                        oBOMASM = {};
                    }
                }
                if (aBOMASM.length > 0) {
 
                    if (aBOMASMHier.length === 0) {
                        aBOMASMHier = aBOMASM;
                    } else {
                        aBOMASMHier = [...aBOMASMHier, ...aBOMASM];
                    }
                }
                // If it configurable and the child Location is same as the location selected from UI then go to Next levels
                if ((aBOMMat[i].PHANTOM_IND === 'X' || aBOMMat[i].CLASS_FLG === 'X' || aBOMMat[i].CONFIGURABLE === 'X')
                ) {
                    let index = TempData.findIndex(el=> el.LOCATION_ID === aBOMMat[i].CHILD_LOC && el.PRODUCT_ID === aBOMMat[i].MAT_CHILD);
                    if(index == -1){
                    aBOMASMHier = await this.genAssemblyMultilevel(aBOMMat[i].CHILD_LOC, aBOMMat[i].MAT_CHILD, lConfigProd, lConfigLoc, aBOMASMHier, aBOMData, lMRPTyp,TempData); 
                }
                }
            }
 
        }
        return aBOMASMHier;
 
    }

    async getAssemblyMBOMAssemblyHierC(lLocation, lProduct, aBOMMultiASMB) {
        // let liConfigProd = await cds.run(`SELECT
        //                                     "PRODUCT_ID"
        //                                 FROM "V_LOCPROD"
        //                                 WHERE LOCATION_ID = '${lLocation}'
        //                                 AND PROD_TYPE = 'KMAT'`);
        let liConfigProd = await cds.run(`SELECT DISTINCT A."PRODUCT_ID"
                                            FROM 
                                            "V_LOCPROD" AS A
                                            INNER JOIN
                                            "CP_PRODUCT" AS B
                                            ON A.PRODUCT_ID = B.PRODUCT_ID
                                            WHERE "A"."LOCATION_ID" = '${lLocation}'`);

        console.log("Total products data based on Location");
        GenF.log(`No. Of Products ${liConfigProd.length}`);

        if (lProduct !== "" && lProduct !== null && lProduct !== undefined) {
            console.log("selected product -" + lProduct);

            liConfigProd = liConfigProd.filter(el => el.PRODUCT_ID === lProduct);
        }
        console.log("Products data after filtering");
        GenF.log(`No. Of Products ${liConfigProd.length}`);

        // VP-1405 - Performance Improvement Get BOM Data



        let lMRPTyp = '';
        for (let iConfig = 0; iConfig < liConfigProd.length; iConfig++) {
            aBOMMultiASMB = await this.genAssemblyMultilevelC(lLocation, liConfigProd[iConfig].PRODUCT_ID, liConfigProd[iConfig].PRODUCT_ID, lLocation, aBOMMultiASMB, lMRPTyp)
        }
        return aBOMMultiASMB;
    }

    async getAssemblyMBOMAssemblyHier(lLocation, lProduct, aBOMMultiASMB) {
        
        let liConfigProd = await cds.run(`SELECT DISTINCT A."PRODUCT_ID"
                                            FROM 
                                            "V_LOCPROD" AS A
                                            INNER JOIN
                                            "CP_PRODUCT" AS B
                                            ON A.PRODUCT_ID = B.PRODUCT_ID
                                            WHERE "A"."LOCATION_ID" = '${lLocation}'`);

        console.log("Total products data based on Location");
        GenF.log(`No. Of Products ${liConfigProd.length}`);

        if (lProduct !== "" && lProduct !== null && lProduct !== undefined) {
            console.log("selected product -" + lProduct);

            liConfigProd = liConfigProd.filter(el => el.PRODUCT_ID === lProduct);
        }
        console.log("Products data after filtering");
        GenF.log(`No. Of Products ${liConfigProd.length}`);

        // VP-1405 - Performance Improvement Get BOM Data
        let aBOMData = {};

        // let aBOMFullData = await cds.run(`SELECT DISTINCT CP_BOM_MAT.LOCATION_ID,
        //                                                   CP_BOM_MAT.MAT_PARENT,
        //                                                   CP_BOM_MAT.MAT_CHILD,
        //                                                   CP_BOM_MAT.CHILD_LOC,
        //                                                   CP_BOM_MAT.MRP_GROUP,
        //                                                   CP_BOM_MAT.MRP_TYPE,
        //                                                   CP_BOM_MAT.COMP_TYPE,
        //                                                   CP_BOM_MAT.PHANTOM_IND,
        //                                                   CP_BOM_MAT.CONFIGURABLE,
        //                                                   CP_BOM_MAT.CLASS_FLG,
        //                                                   CP_BOM_MAT.PROD_DESC                                                    
        //                                            FROM "CP_BOM_MAT"`); 
        let aBOMFullData = await cds.run(`SELECT DISTINCT CP_BOM_MAT.LOCATION_ID,
                                                          CP_BOM_MAT.MAT_PARENT,
                                                          CP_BOM_MAT.MAT_CHILD,
                                                          CP_BOM_MAT.CHILD_LOC,
                                                          CP_BOM_MAT.COMP_TYPE,
                                                          CP_BOM_MAT.PHANTOM_IND,
                                                          CP_BOM_MAT.CONFIGURABLE,
                                                          CP_BOM_MAT.CLASS_FLG,
                                                          CP_BOM_MAT.PROD_DESC                                                    
                                                   FROM "CP_BOM_MAT"`); 

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
            // aBOMLine['MRP_GROUP'] = aBOMFullData[i].MRP_GROUP;
            // aBOMLine['MRP_TYPE'] = aBOMFullData[i].MRP_TYPE;                       
            aBOMLine['COMP_TYPE'] = aBOMFullData[i].COMP_TYPE;
            aBOMLine['PHANTOM_IND'] = aBOMFullData[i].PHANTOM_IND;
            aBOMLine['CONFIGURABLE'] = aBOMFullData[i].CONFIGURABLE;
            aBOMLine['CLASS_FLG'] = aBOMFullData[i].CLASS_FLG;           
            aBOMLine['PROD_DESC'] = aBOMFullData[i].PROD_DESC; 

            aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].MAT_PARENT].push(aBOMLine);
            aBOMLine = [];
        }

        aBOMFullData = [];

        let lMRPTyp = '';
        for (let iConfig = 0; iConfig < liConfigProd.length; iConfig++) {
            aBOMMultiASMB = await this.genAssemblyMultilevel(lLocation, liConfigProd[iConfig].PRODUCT_ID, liConfigProd[iConfig].PRODUCT_ID, lLocation, aBOMMultiASMB, aBOMData, lMRPTyp)
        }
        return aBOMMultiASMB;
    }
    // async getAssemblyMBOMAssemblyHierNew(lLocation, lProduct, aBOMMultiASMB) {

    //     let liConfigProd = await cds.run(`SELECT DISTINCT A."PRODUCT_ID"
    //                                         FROM 
    //                                         "V_LOCPROD" AS A
    //                                         INNER JOIN
    //                                         "CP_PRODUCT" AS B
    //                                         ON A.PRODUCT_ID = B.PRODUCT_ID
    //                                         WHERE "A"."LOCATION_ID" = '${lLocation}'`);

    //     console.log("Total products data based on Location");
    //     GenF.log(`No. Of Products ${liConfigProd.length}`);

    //     if (lProduct !== "" && lProduct !== null && lProduct !== undefined) {
    //         console.log("selected product -" + lProduct);

    //         liConfigProd = liConfigProd.filter(el => el.PRODUCT_ID === lProduct);
    //     }
    //     console.log("Products data after filtering");
    //     GenF.log(`No. Of Products ${liConfigProd.length}`);

    //     // VP-1405 - Performance Improvement Get BOM Data
    //     let aBOMData = {};       


    //     let aBOMFullData = await cds.run(`SELECT *                                                 
    //                                         FROM "CP_BOM_HIERARCHY"`);

    //     for (let i = 0; i < aBOMFullData.length; i++) {
    //         if (aBOMData[aBOMFullData[i].LOCATION_ID] === undefined) {
    //             aBOMData[aBOMFullData[i].LOCATION_ID] = {};
    //         }

    //         if (aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].BOM_PARENT] === undefined) {
    //             aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].BOM_PARENT] = [];
    //         }

    //         let aBOMLine = [];
            
    //         aBOMLine = JSON.parse(aBOMFullData[i].BOM_CHILD);

    //         // aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].BOM_PARENT].push(aBOMLine);
    //         aBOMData[aBOMFullData[i].LOCATION_ID][aBOMFullData[i].BOM_PARENT] = aBOMLine;
    //         aBOMLine = [];
    //     }

    //     aBOMFullData = [];
        
    //     let lMRPTyp = '';
    //     for (let iConfig = 0; iConfig < liConfigProd.length; iConfig++) {
    //         let TempData = [];
    //         aBOMMultiASMB = await this.genAssemblyMultilevel(lLocation, liConfigProd[iConfig].PRODUCT_ID, liConfigProd[iConfig].PRODUCT_ID, lLocation, aBOMMultiASMB, aBOMData, lMRPTyp,TempData)
    //     }
    //     return aBOMMultiASMB;
    // }

    async getAssemblyMBOMAssemblyHierNew(lLocation, lProduct, aBOMMultiASMB,StartTime) {

        let aBomFinal=[];
        let interAsmb = 'false';

        let aBomDataTopLevel = await cds.run(`SELECT *                                                 
                                            FROM "CP_BOM_MAT" Where "LOCATION_ID" = '${lLocation}' AND "MAT_PARENT" = '${lProduct}'`);

        // get config material flag
        let configFlag = await cds.run(`SELECT TOP 1 VALUE from CP_PARAMETER_VALUES WHERE PARAMETER_ID = 25`);
        if(configFlag.length > 0){
            interAsmb = configFlag[0].VALUE;
        } 

             await this.genAssemblyMultilevelnew(lLocation, lProduct, aBomDataTopLevel, aBomFinal, '',interAsmb, lLocation,lLocation);

         
        return aBomFinal;
    }

    async getLocProdAlternateLoc(lLocation, lConfigLoc, aLocProdHier) {
        //Fetch alternate plants
        let aAlternateLoc = await cds.run(`SELECT DISTINCT LOCATION_ID,
                                            CHILD_LOC
                                    FROM CP_BOM_MAT
                                    WHERE LOCATION_ID = '${lLocation}'
                                    ORDER BY CHILD_LOC `);

        let alocprodAltLoc = [], aDummyLocProd = [];

        // Remove location if is already built
        aAlternateLoc = aAlternateLoc.filter(el => {
            return !aLocProdHier.find(element => {
                return element.LOCATION_ID === el.CHILD_LOC;
            });
        });
        for (let iAltLoc = 0; iAltLoc < aAlternateLoc.length; iAltLoc++) {
            // Get location product for each plant
            alocprodAltLoc = await cds.run(
                ` SELECT DISTINCT
                                                    CP_LOCATION_PRODUCT."LOCATION_ID",
                                                    CP_LOCATION_PRODUCT."LOCATION_ID" as "FACTORY_LOC",
                                                    CP_LOCATION_PRODUCT."PRODUCT_ID",
                                                    CP_LOCATION_PRODUCT."LOTSIZE_KEY",
                                                    CP_LOCATION_PRODUCT."LOT_SIZE",
                                                    CP_LOCATION_PRODUCT."PROCUREMENT_TYPE",
                                                    CP_LOCATION_PRODUCT."PLANNING_STRATEGY"
                                                  FROM CP_LOCATION_PRODUCT 
                                                  WHERE CP_LOCATION_PRODUCT.LOCATION_ID = '${aAlternateLoc[iAltLoc].CHILD_LOC}'`);
            // Remove product which belong to alternate plants
            let aAlternatePlantLoc = await cds.run(`SELECT DISTINCT 
                                        CP_BOM_MAT.LOCATION_ID,
                                        CP_BOM_MAT.MAT_CHILD 
                                    FROM 
                                        "CP_BOM_MAT"
                                        INNER JOIN
                                        CP_PRODUCT
                                        ON CP_PRODUCT.PRODUCT_ID = CP_BOM_MAT.MAT_PARENT
                                    WHERE CP_BOM_MAT.CONFIGURABLE = 'X'
                                        AND CP_BOM_MAT.PHANTOM_IND <> 'X'
                                        AND CP_BOM_MAT.CLASS_FLG <> 'X'
                                        AND CP_BOM_MAT.LOCATION_ID <> CP_BOM_MAT.CHILD_LOC
                                        AND CP_BOM_MAT.LOCATION_ID = '${aAlternateLoc[iAltLoc].CHILD_LOC}'`);
            alocprodAltLoc = alocprodAltLoc.filter(el => {
                return !aAlternatePlantLoc.find(element => {
                    return element.MAT_CHILD === el.PRODUCT_ID;
                });
            });
            // Generate Dummy Product for Location of Configurable prod
            // aDummyLocProd = await cds.run(` SELECT * FROM CP_DUMMY_PRODUCT_LOC WHERE LOCATION_ID = '${aAlternateLoc[iAltLoc].CHILD_LOC}'`);
            // if(aAlternateLoc[iAltLoc].CHILD_LOC !== lConfigLoc) {
              aDummyLocProd = await cds.run(` SELECT * FROM CP_DUMMY_PRODUCT_LOC WHERE FACTORY_LOC = '${aAlternateLoc[iAltLoc].CHILD_LOC}'`);
            // }  

            if (aDummyLocProd.length > 0) {
                let aDummyTemp = [];
                for (let iDMProd = 0; iDMProd < aDummyLocProd.length; iDMProd++) {
                    // Generate Dummyproduct Actual data 
                    let oDummyTemp = {
                        LOCATION_ID: aDummyLocProd[iDMProd].LOCATION_ID,
                        FACTORY_LOC: aDummyLocProd[iDMProd].FACTORY_LOC,
                        PRODUCT_ID: aDummyLocProd[iDMProd].DUMMY_PRODUCTID,
                        LOTSIZE_KEY: '',
                        LOT_SIZE: '0',
                        PROCUREMENT_TYPE: '',
                        PLANNING_STRATEGY: ''
                    };
                    aDummyTemp.push(GenF.parse(oDummyTemp));
                }
                alocprodAltLoc = [...alocprodAltLoc, ...aDummyTemp];
            }

            if (alocprodAltLoc.length > 0) {

                if (aLocProdHier.length === 0) {
                    aLocProdHier = alocprodAltLoc;
                } else {
                    aLocProdHier = [...aLocProdHier, ...alocprodAltLoc];
                }
            }
            if (lLocation !== aAlternateLoc[iAltLoc].CHILD_LOC) {
                aLocProdHier = await this.getLocProdAlternateLoc(aAlternateLoc[iAltLoc].CHILD_LOC, lConfigLoc, aLocProdHier);
            }
        }
        return aLocProdHier;
    }

   async genAssemblyMultilevelnew(lLocation, lProduct, aBomData, aBomFinal, lLocFlag,interAsmb,sLoc,newloc){
        let lTopProduct;
        if(lLocFlag == 'X'){
            lTopProduct = lProduct.concat('_', lLocation);
        } else {
            lTopProduct = lProduct;
        }
        let oBomFinal={};
        let sourceLoc = '';
        for (let i = 0; i < aBomData.length; i++) {
                
             // Do not insert Class as Assmbly
            if(aBomData[i].CLASS_FLG !== 'X'){
                // If the configuration is true, insert Assembly, Phantos and Configurabale products. if configuration is false, insert only Assemblies
                if(interAsmb == 'true' || ( aBomData[i].PHANTOM_IND !== 'X' && aBomData[i].CONFIGURABLE !== 'X' && interAsmb !== 'true')){
                    oBomFinal.LOCATION_ID = lLocation;
                    
                    
                   
                    if(aBomData[i].CHILD_LOC !== lLocation){
                        
                       oBomFinal.dummyLoc = sLoc;
                       console.log("1", oBomFinal.dummyLoc)
                        oBomFinal.COMPONENT = lProduct.concat('_', aBomData[i].CHILD_LOC);
                    } else {
                        
                        // console.log("2", sourceLoc)
                        oBomFinal.dummyLoc = sLoc;
                        oBomFinal.COMPONENT = aBomData[i].MAT_CHILD;
                    }
                    sourceLoc = '';
                    console.log("3", aBomData[i].CHILD_LOC)
                    oBomFinal.PRODUCT_ID = lTopProduct;
                    oBomFinal.STRUCNODE = '';
                    // oBomFinal.MRP_TYPE = aBomData[i].MRP_TYPE;
                    aBomFinal.push(GenF.parse(oBomFinal));
                    oBomFinal = {};
 
                    if(aBomData[i].CHILD_LOC !== lLocation){
                        oBomFinal.LOCATION_ID = aBomData[i].CHILD_LOC;
                        oBomFinal.COMPONENT = aBomData[i].MAT_CHILD;

                         oBomFinal.dummyLoc = lLocation;
                                    sourceLoc = lLocation
                                    console.log("4", sourceLoc)
                        oBomFinal.PRODUCT_ID = lProduct.concat('_', aBomData[i].CHILD_LOC);
                        oBomFinal.STRUCNODE = '';
                        // oBomFinal.MRP_TYPE = aBomData[i].MRP_TYPE;
                        aBomFinal.push(GenF.parse(oBomFinal));
                        oBomFinal = {};
                    }    
                }
            }
 
            if(aBomData[i].PHANTOM_IND == 'X' || aBomData[i].CLASS_FLG == 'X' || aBomData[i].CONFIGURABLE == 'X'){
 
                let aBomDataTemp = await cds.run(`SELECT *                                                
                    FROM "CP_BOM_MAT" Where LOCATION_ID = '${aBomData[i].CHILD_LOC}' AND MAT_PARENT = '${aBomData[i].MAT_CHILD}'`);
               
                if(aBomDataTemp.length > 0){
                if(aBomData[i].CHILD_LOC !== lLocation){
 
                    oBomFinal.LOCATION_ID = lLocation;
                    oBomFinal.dummyLoc = sLoc;
                            sourceLoc = ''
                            console.log("5", sourceLoc)
                    oBomFinal.COMPONENT = lProduct.concat('_', aBomData[i].CHILD_LOC);
                    oBomFinal.PRODUCT_ID = lTopProduct;
                    oBomFinal.STRUCNODE = '';
                    // oBomFinal.MRP_TYPE = aBomData[i].MRP_TYPE;
                    aBomFinal.push(GenF.parse(oBomFinal));
                    oBomFinal = {};
 
               
                     await this.genAssemblyMultilevelnew(aBomData[i].CHILD_LOC, lProduct, aBomDataTemp, aBomFinal, 'X',interAsmb,sLoc,sourceLoc);
               
 
                } else {
                   
                     await this.genAssemblyMultilevelnew(lLocation, lProduct, aBomDataTemp, aBomFinal, lLocFlag,interAsmb,sLoc,sourceLoc);
                   
                }
            }
            }        
        }
 
    }
 

}

module.exports = IBPFunctions;