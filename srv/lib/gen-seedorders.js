const GenFunctions = require("./gen-functions");
const cds = require("@sap/cds");
const hana = require("@sap/hana-client");
const SOFunctions = require("./so-function");
const { UPSERT } = require("@sap/cds/lib/ql/cds-ql");

class GenSeedOrder {
    constructor() { }

    async genSeedOrderData(aDates, iDateIndex, aCharOpt, iCount, req) {
        let oSeedOrderData = {}, aSeedOrderData = [];
        let iDiff = 0, iBaseQty = 0;
        let aCharValues = [];
        let sSEEDDATA = '';
        let iDatesLength = aDates.length;
        let bFlag = false;
        let oResponse = {};
        let bUIDFlag = false;

        for (let iCOpt = 0; iCOpt < aCharOpt.length; iCOpt++) {
            aCharValues = [];
            aCharValues = aCharOpt[iCOpt].CHARVALUE;

            if (iCount === 0 && iCOpt === 0) {
                iDateIndex = iDateIndex;
            } else {
                if (bUIDFlag === true) {
                    iDateIndex = iDateIndex + 1;
                    bUIDFlag = false;
                }
            }

            if (iDateIndex === iDatesLength) {
                break;
            }

            if (aCharValues.length > 0 && aCharOpt[iCOpt].FACTOR > 0) {
                for (let iChrVal = 0; iChrVal < aCharValues.length; iChrVal++) {

                    iDiff = 0;
                    iBaseQty = 0;
                    aCharValues[iChrVal].OPT_QTY = parseInt(aCharValues[iChrVal].OPT_PERCENT * aCharOpt[iCOpt].FACTOR);

                    if (aCharValues[iChrVal].UID_COUNT > 0 &&
                        aCharValues[iChrVal].OPT_QTY >= aCharValues[iChrVal].UID_COUNT) {

                        iDiff = aCharValues[iChrVal].OPT_QTY % parseInt(aCharValues[iChrVal].UID_COUNT);
                        iBaseQty = Math.floor(aCharValues[iChrVal].OPT_QTY / parseInt(aCharValues[iChrVal].UID_COUNT));

                        if (aCharValues[iChrVal].UNIQUE_IDS.length > 0) {
                            bUIDFlag = true;  // Set Flag if Seedorders created for current date

                            for (let iUID = 0; iUID < aCharValues[iChrVal].UNIQUE_IDS.length; iUID++) {
                                oSeedOrderData.UNIQUE_ID = aCharValues[iChrVal].UNIQUE_IDS[iUID];
                                oSeedOrderData.LOCATION_ID = req.data.LOCATION_ID;
                                oSeedOrderData.PRODUCT_ID = req.data.PRODUCT_ID;
                                oSeedOrderData.CUSTOMER_GROUP = req.data.CUSTOMER_GROUP;
                                oSeedOrderData.MAT_AVAILDATE = aDates[iDateIndex].WEEK_DATE;
                                oSeedOrderData.ORD_QTY = iBaseQty;
                                if (iDiff > 0) {
                                    oSeedOrderData.ORD_QTY = oSeedOrderData.ORD_QTY + 1;
                                    iDiff = iDiff - 1;
                                }

                                aSeedOrderData.push(GenFunctions.parse(oSeedOrderData));

                            }
                        }
                    }

                }
            }
            else{
                // iDateIndex = iDateIndex+1;
            }

        }

        oResponse.SEEDDATA = aSeedOrderData;
        oResponse.DATEINDEX = iDateIndex;

        return oResponse;


    }

    async genSeedOrders(FLAG, SEEDDATA) {
        let liresults = [],liAuxResults = [];
        let lsresults = {}, vSeedOrder, vMaxSeedOrder;
        let lipara = [], lspara = {};
        let liSeeddata = {};
        let vValue = 0, vTemp, vOrder, vNoOrd = 5;
        let vPrefix = 'SE';
        let sMessage = '', oResponse = {};
        let datetime = new Date();
        let curDate = datetime.toISOString().slice(0, 10);
        let bFlag = false;


        liSeeddata = JSON.parse(SEEDDATA);
        const li_sodata = await cds.run(
            `SELECT *
                FROM "CP_SEEDORDER_HEADER"
                 ORDER BY SEED_ORDER DESC`
        );
        const li_paravalues = await cds.run(
            `SELECT VALUE
                    FROM "CP_PARAMETER_VALUES"
                    WHERE LOCATION_ID = '${liSeeddata[0].LOCATION_ID}'
                    AND ( "PARAMETER_ID" = 6
                      OR "PARAMETER_ID" = 7 )
                    ORDER BY "PARAMETER_ID" `);

        vOrder = parseInt(li_paravalues[0].VALUE);
        vPrefix = li_paravalues[1].VALUE;
        const obgenSOFunctions = new SOFunctions();

        // vOrder = parseInt(1209) + 1;
        if (FLAG === "C") {
            for (let i = 0; i < liSeeddata.length; i++) {
                vOrder = parseInt(vOrder) + 1;
                vOrder = GenFunctions.addleadzeros(vOrder, 8);
                vSeedOrder = vPrefix.concat(vOrder.toString());
                lsresults.LOCATION_ID = liSeeddata[i].LOCATION_ID;
                lsresults.PRODUCT_ID = liSeeddata[i].PRODUCT_ID;
                lsresults.CUSTOMER_GROUP = liSeeddata[i].CUSTOMER_GROUP;
                lsresults.UNIQUE_ID = liSeeddata[i].UNIQUE_ID;
                lsresults.ORD_QTY = parseFloat(liSeeddata[i].ORD_QTY);
                lsresults.CREATED_DATE = curDate;
                let vDate = (liSeeddata[i].MAT_AVAILDATE).toString();
                if ((liSeeddata[i].MAT_AVAILDATE).toString().includes("/")) {
                    vDate = (liSeeddata[i].MAT_AVAILDATE).split('/');
                    vDate = vDate[0] + '-' + vDate[1] + '-' + vDate[2];
                    lsresults.MAT_AVAILDATE = vDate;
                }
                else {
                    lsresults.MAT_AVAILDATE = liSeeddata[i].MAT_AVAILDATE;
                }
                lsresults.SEED_ORDER = vSeedOrder;
                liresults.push(lsresults);

                //To insert data into CP_SALESH_CONFIG_DELTA-26/06/2025 Pradeep
                liAuxResults.push({
                    LOCATION_ID: lsresults.LOCATION_ID,
                    PRODUCT_ID: lsresults.PRODUCT_ID,
                    WEEK_DATE: lsresults.MAT_AVAILDATE
                });
                lspara.PARAMETER_ID = 6;
                lspara.VALUE = vOrder.toString();
                lsresults = {};
            }

            lipara.push(lspara);
            const uniqueAuxMap = new Map();
            for (const row of liAuxResults) {
                const key = `${row.LOCATION_ID}::${row.PRODUCT_ID}::${row.WEEK_DATE}`;
                if (!uniqueAuxMap.has(key)) {
                    uniqueAuxMap.set(key, row);
                }
            }
            const uniqueAuxResults = Array.from(uniqueAuxMap.values());
            // lsPara = {};
            if (liresults.length > 0) {
                try {
                    await cds.run(INSERT.into("CP_SEEDORDER_HEADER").entries(liresults));
                    await cds.run(UPSERT.into("CP_SALESH_CONFIG_DELTA").entries(uniqueAuxResults));
                    // await cds.run(INSERT.into("CP_PARAMETER_VALUES").entries(lipara));
                    await UPDATE`CP_PARAMETER_VALUES`
                        .with({
                            VALUE: lspara.VALUE
                        })
                        .where(`PARAMETER_ID = '${lspara.PARAMETER_ID}'`);
                    await obgenSOFunctions.createSOTemp(liresults);
                    // responseMessage = lsresults.SEED_ORDER + " Created successfully";
                    bFlag = true;
                    sMessage = "SeedOrders Created successfully";

                } catch (e) {
                    //DONOTHING
                    bFlag = false;
                    sMessage = " Creation failed";
                }
            }

        }

        lsresults = {};
        oResponse.bFlag = bFlag;
        oResponse.Message = sMessage;
        return oResponse;
    }

}

module.exports = GenSeedOrder;