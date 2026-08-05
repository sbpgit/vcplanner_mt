const GenF = require("./gen-functions");
module.exports = {
    async snapshots(req) {
        // let oData = req.data;
        let snapdata = JSON.parse(req.data.SnapData);
        let oData = snapdata[0];
        oData.VERSION = "__BASELINE";
        const oReturn = {
            "Type": "",
            "Description": ""
        }
        //Get data from all levels  
        let liCirData = await GetForecastData(oData);
        let liAssemblyData = await GetAssemblyData(oData);
        let liComponentData = await GetComponentData(oData);
        let liRestrictionData = await GetRestrictionData(oData);
        let liDemandData = await GetFutureDemandData(oData);
        let liOptPerData = await GetOptionPerData(oData);
        const padL = (nr, _len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
        //Prepare Current Timestamp 
        const sTimeStamp =
            `${new Date().getFullYear()}-${padL(new Date().getMonth() + 1)}-${padL(new Date().getDate())} ${padL(new Date().getHours())}:${padL(new Date().getMinutes())}:${padL(new Date().getSeconds())}`
        let forecastReview = await forecastLevelSnapshot(oData, liCirData, sTimeStamp)
        let assemblyReview = await assemblyLevelSnapshot(oData, liAssemblyData, sTimeStamp)
        let componentReview = await componentLevelSnapshot(oData, liComponentData, sTimeStamp)
        let restrictionReview = await restrictionLevelSnapshot(oData, liRestrictionData, sTimeStamp)
        let demandLevelReview = await demandLevelSnapshot(oData, liDemandData, sTimeStamp)
        let optionLevelReview = await optionLevelSnapshot(oData, liOptPerData, sTimeStamp)
        // oReturn.Type = "SUCCESS";
        // oReturn.Description = "Successfully saved snapshots in all levels";
        // return oReturn;
    }
}

//Function to insert in CP_SNAPSHOT_HEAD
async function saveSnapHead(sTimeStamp, oData) {
    //Here insert only in CP_SNAPSHOT_HEAD
    if (oData.Mode == 'C') {
        const obj = {
            SNAP_TIMESTAMP: sTimeStamp,
            SNAPSHOT_DESC: oData.SNAPSHOT_DESC,
            FROM_DATE: null,
            TO_DATE: null,
            TYPE: oData.TYPE
        }
        //Insert into CP_SNAPSHOT_HEAD
        await cds.run(
            INSERT.into("CP_SNAPSHOT_HEAD").entries(obj)
        );
    }
}

//Function to purge Snapshots
async function PurgeSnapShot(params, liHeadData) {
    let snapshotHeadTable = params.HEAD_TABLE
    let snapshotTable = params.TABLE
    let snapshotView = params.VIEW
    let snapshotKey = params.KEY
    let fields = params.FIELDS.join(", ")
    const liPlannedConfigData = await cds.run(`SELECT "PARAMETER_VALUE" FROM "CP_USER_PREFERENCES" WHERE "PARAMETER"='MAX_SNAPSHOT'`);
    var SnapShotWeeks = 0;
    if (liPlannedConfigData.length > 0) {
        SnapShotWeeks = parseInt(liPlannedConfigData[0].PARAMETER_VALUE);
        //Continue with Purging
        if (SnapShotWeeks != 0) {
            var SnapShotDate = new Date(new Date().getTime() - SnapShotWeeks * 7 * 24 * 60 * 60 * 1000);
            var padL = (nr, _len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
            SnapShotDate =
                `${new Date(SnapShotDate).getFullYear()}-${padL(new Date(SnapShotDate).getMonth() + 1)}-${padL(new Date(SnapShotDate).getDate())} ${padL(new Date(SnapShotDate).getHours())}:${padL(new Date(SnapShotDate).getMinutes())}:${padL(new Date(SnapShotDate).getSeconds())}`;
            //get total Detail Data before SnapShotDate
            const liDetailBeforeData = await cds.run(`SELECT * FROM "${snapshotTable}" WHERE ( "SNAP_TIMESTAMP" < '${SnapShotDate}' )`);
            //Continue with Purging
            if (liDetailBeforeData.length > 0) {
                ///Delete all snapshots before SnapShotDate in Head 
                await cds.run(
                    `DELETE FROM "${snapshotHeadTable}" WHERE "SNAP_TIMESTAMP" < '${SnapShotDate}' AND "TYPE" = '${snapshotKey}'`)
                //return new modified Head Data
                liHeadData = await GetSnapshotHeadData()
                liHeadData = liHeadData.filter(el => el.TYPE == snapshotKey);
                if (liHeadData.length > 0) {
                    var aModifiedDetailData = await cds.run(`SELECT '${fields}'
                                                                   FROM "${snapshotView}"
                                                                   WHERE ("SNAP_TIMESTAMP" IN ('${liHeadData[0].SNAP_TIMESTAMP}') )`);

                    //Get total Detail Data after SnapShotDate
                    var liDetailData = await cds.run(`SELECT *
                                                               FROM "${snapshotTable}"
                                                               WHERE ( "SNAP_TIMESTAMP" > '${SnapShotDate}' )
                                                               AND ( UPPER("SNAP_TIMESTAMP") <> UPPER('${liHeadData[0].SNAP_TIMESTAMP}'))`);

                    liDetailData = liDetailData.filter(f => f.SNAP_TIMESTAMP != liHeadData[0].SNAP_TIMESTAMP);
                    var aNewDetailData = aModifiedDetailData.concat(liDetailData);
                    await cds.run(`DELETE  FROM "${snapshotTable}"`);
                    await cds.run(INSERT.into(snapshotTable).entries(aNewDetailData));
                }
            }
        }
    }
    return liHeadData;
}

//Function to get Snapshot data
async function GetSnapshotHeadData() {
    var liHeadData = await cds.run(`SELECT 
        "SNAP_TIMESTAMP",
        "SNAPSHOT_DESC",
        "FROM_DATE",
        "TO_DATE",
        "TYPE"
        FROM "CP_SNAPSHOT_HEAD"`);
    return liHeadData;
}

//Function to get Forecast data
async function GetForecastData(params) {
    //Here fetch forecast data from CP_CIR_GENERATED
    var liForecastData = await cds.run(`SELECT 
        "LOCATION_ID",
        "PRODUCT_ID",
        "WEEK_DATE",
        "CIR_ID",
        "MODEL_VERSION",
        "VERSION",
        "SCENARIO",
        "UNIQUE_ID",
        "CIR_QTY",
        "ACTUAL_QTY",
        "UNCONSUMED_FORECAST",
        "PRODORD_QTY",
        "SNAPSHOT_CHK"
    FROM "CP_CIR_GENERATED"
    WHERE UPPER("MODEL_VERSION") = UPPER('Active')
        AND UPPER("VERSION") = UPPER('${params.VERSION}')
    `);
    return liForecastData;
}

//Function to get Assembly data
async function GetAssemblyData(params) {
    //Here fetch forecast data from CP_ASSEMBLY_REQ
    var liAssemblyData = await cds.run(`SELECT 
        "FACTORY_LOC",
        "LOCATION_ID",
        "PRODUCT_ID",
        "ITEM_NUM",
        "COMPONENT",
        "UNIQUE_ID",
        "WEEK_DATE",
        "MODEL_VERSION",
        "VERSION",
        "SCENARIO",
        "TYPE",
        "REF_PRODID",
        "CIR_QTY",
        "COMPCIR_QTY",
        "ACTUAL_QTY"
        FROM "CP_ASSEMBLY_REQ"
        WHERE UPPER("MODEL_VERSION") = UPPER('Active')
        AND UPPER("VERSION") = UPPER('${params.VERSION}')
        AND TYPE = 'PI'`);
    return liAssemblyData;
}

//Function to get Component Data
async function GetComponentData(params) {
    //Here fetch Component data from V_COMPREQ_MULTI
    var liComponentData = await cds.run(`SELECT 
    "LOCATION_ID",
	"PRODUCT_ID",
	"COMPONENT",
	"WEEK_DATE",
	"FACTORY_LOC",
	"VERSION",
	"SCENARIO",
	"CIR_QTY",
	"COMP_QTY"
    FROM "V_COMPREQ_SNAPSHOT"
    WHERE 
    UPPER("VERSION") = UPPER('${params.VERSION}')`)
    return liComponentData;
}

//Function to get Restriction Data
async function GetRestrictionData(params) {
    //Here fetch Restriction data from CP_RESTRICT_HEADER
    var liRestrictionData = await cds.run(`SELECT 
    "FACTORY_LOC",
    "LOCATION_ID",
    "PRODUCT_ID",
    "ITEM_NUM",
    "COMPONENT",
    "WEEK_DATE",
    "MODEL_VERSION",
    "VERSION",
    "SCENARIO",
    "TYPE",
    "REF_PRODID",
    "CIR_QTY",
    "COMPCIR_QTY"
    FROM "CP_ASSEMBLY_REQ"
    WHERE UPPER("MODEL_VERSION") = UPPER('Active')
    AND UPPER("VERSION") = UPPER('${params.VERSION}')
    AND TYPE = 'RT'`);
    return liRestrictionData;
}

//Function to get Future Demand Data
async function GetFutureDemandData(params) {
    //Here fetch Restriction data from CP_IBP_FUTUREDEMAND
    var liDemandData = await cds.run(`SELECT 
        "LOCATION_ID",
        "PRODUCT_ID",
        "VERSION",
        "SCENARIO",
        "WEEK_DATE",
        "QUANTITY"
    FROM "CP_IBP_FUTUREDEMAND"
    WHERE UPPER("VERSION") = UPPER('${params.VERSION}')`);
    return liDemandData;
}

//Function to get Option Percentage Data
async function GetOptionPerData(params) {
    //Here fetch Restriction data from CP_PAL_FCHARPLAN
    var liOptPerData = await cds.run(`SELECT 
        "LOCATION_ID",
        "PRODUCT_ID",
        "CUSTOMER_GROUP",
        "MODEL_VERSION",
        "CLASS_NUM",
        "CHAR_NUM",
        "CHARVAL_NUM",
        "VERSION",
        "SCENARIO",
        "WEEK_DATE",
        "OPT_PERCENT",
        "OPT_QTY",
        "TYPE"
    FROM "CP_PAL_FCHARPLAN"
    WHERE UPPER("MODEL_VERSION") = UPPER('Active')
        AND UPPER("VERSION") = UPPER('${params.VERSION}')`);
    return liOptPerData;
}

async function forecastLevelSnapshot(oData, liCirData, sTimeStamp) {
    if (liCirData.length > 0) {
        let aSnapData = [];
        oData.TYPE = "CIR"
        //Get snapshot head data
        let liHeadData = await GetSnapshotHeadData();
        //Filter the data based on CIR type
        liHeadData = liHeadData.filter(el => el.TYPE == 'CIR');
        if (liHeadData.length == 0) {
            //If There is no assembly head data, then just insert Base Snapshot Head
            if (!oData.SNAPSHOT_DESC) {
                oData.SNAPSHOT_DESC = "First Snapshot";
                oData.TYPE = "CIR";
            }
            await saveSnapHead(sTimeStamp, oData);
        }
        //If There is no assembly snapshot data, then just insert Base Snapshot Data, else continue to purge data
        if (liHeadData.length == 0) {
            let aData = [];
            liCirData.forEach(el => {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    LOCATION_ID: el.LOCATION_ID,
                    PRODUCT_ID: el.PRODUCT_ID,
                    UNIQUE_ID: el.UNIQUE_ID,
                    WEEK_DATE: el.WEEK_DATE,
                    CIR_QTY: el.CIR_QTY,
                    ACTUAL_QTY:el.ACTUAL_QTY,
                    UNCONSUMED_FORECAST:el.UNCONSUMED_FORECAST,
                    PRODORD_QTY:el.PRODORD_QTY
                }
                aData.push(obj);
            })
            const keys = ['LOCATION_ID', 'PRODUCT_ID', 'UNIQUE_ID', 'WEEK_DATE'];
            aData = GenF.removeDuplicate(aData, keys);
            await cds.run(INSERT.into("CP_SNAPSHOT_DATA").entries(aData));
            await UPDATE `CP_CIR_GENERATED`.with({
                SNAPSHOT_CHK: ''
            })
            return "SUCCESS";
        } else {
            //Purge Previous Data based on max snapshots
            let obj = {
                KEY: "CIR",
                HEAD_TABLE: "CP_SNAPSHOT_HEAD",
                TABLE: "CP_SNAPSHOT_DATA",
                VIEW: "V_SNAPSHOT",
                FIELDS: ["SNAP_TIMESTAMP", "LOCATION_ID", "PRODUCT_ID", "UNIQUE_ID", "WEEK_DATE", "CIR_QTY"]
            }
            liHeadData = await PurgeSnapShot(obj, liHeadData);
            //If after purging, table becomes empty then insert into Head and Data
            if (liHeadData.length == 0) {
                let aData = [];
                liCirData.forEach(el => {
                    const obj = {
                        SNAP_TIMESTAMP: sTimeStamp,
                        LOCATION_ID: el.LOCATION_ID,
                        PRODUCT_ID: el.PRODUCT_ID,
                        UNIQUE_ID: el.UNIQUE_ID,
                        WEEK_DATE: el.WEEK_DATE,
                        CIR_QTY: el.CIR_QTY,
                        ACTUAL_QTY:el.ACTUAL_QTY,
                        UNCONSUMED_FORECAST:el.UNCONSUMED_FORECAST,
                        PRODORD_QTY:el.PRODORD_QTY
                    }
                    aData.push(obj);
                })
                const keys = ['LOCATION_ID', 'PRODUCT_ID', 'UNIQUE_ID', 'WEEK_DATE'];
                aData = GenF.removeDuplicate(aData, keys);
                await saveSnapHead(sTimeStamp, oData);
                await cds.run(
                    INSERT.into("CP_SNAPSHOT_DATA").entries(aData)
                );
                await UPDATE `CP_CIR_GENERATED`.with({
                    SNAPSHOT_CHK: ''
                })
                return "SUCCESS";
            }
            let sPrevSnapshot = liHeadData[liHeadData.length - 1].SNAP_TIMESTAMP;
            var liSnapDetailData = await cds.run(`SELECT 
                "SNAP_TIMESTAMP",
                 "LOCATION_ID",
                 "PRODUCT_ID",
                 "UNIQUE_ID",
                 "WEEK_DATE",
                 "CIR_QTY",
                  "ACTUAL_QTY",
                "UNCONSUMED_FORECAST",
                "PRODORD_QTY"
             FROM "CP_SNAPSHOT_DATA"
              WHERE ("SNAP_TIMESTAMP" IN ('${sPrevSnapshot}') )`)
            var liDetailData = await cds.run(`SELECT *
                                               FROM "CP_SNAPSHOT_DATA"
                                               WHERE  "SNAP_TIMESTAMP" = '${sPrevSnapshot}'`)
            //Compare liCirData with SNAPSHOT_CHK = 'X'
            liCirData = liCirData.filter(l => l.SNAPSHOT_CHK == 'X')
            if (liCirData.length > 0) {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    SNAPSHOT_DESC: oData.SNAPSHOT_DESC,
                    FROM_DATE: null,
                    TO_DATE: null,
                    TYPE: oData.TYPE
                }
                for (i = 0; i < liCirData.length; i++) {
                    let el = liCirData[i];
                    let iIndex = liSnapDetailData.findIndex(s => s.UNIQUE_ID == el.UNIQUE_ID && s.WEEK_DATE == el.WEEK_DATE &&
                        s.LOCATION_ID == el.LOCATION_ID && s.PRODUCT_ID == el.PRODUCT_ID && s.CIR_QTY == el.CIR_QTY && s.ACTUAL_QTY == el.ACTUAL_QTY && s.UNCONSUMED_FORECAST == el.UNCONSUMED_FORECAST 
                    && s.PRODORD_QTY == el.PRODORD_QTY)
                    if (iIndex == -1) {
                        const obj = {
                            LOCATION_ID: el.LOCATION_ID,
                            PRODUCT_ID: el.PRODUCT_ID,
                            CIR_QTY: el.CIR_QTY,
                             ACTUAL_QTY: el.ACTUAL_QTY,
                            UNCONSUMED_FORECAST: el.UNCONSUMED_FORECAST,
                            PRODORD_QTY: el.PRODORD_QTY,
                            UNIQUE_ID: el.UNIQUE_ID,
                            WEEK_DATE: el.WEEK_DATE,
                            SNAP_TIMESTAMP: sTimeStamp
                        }
                        aSnapData.push(obj);
                    }
                }
                //Previous snapshot was saved empty with no changes
                if (liSnapDetailData.length == 0) {
                    liCirData.forEach(b => {
                        const obj = {
                            LOCATION_ID: b.LOCATION_ID,
                            PRODUCT_ID: b.PRODUCT_ID,
                            CIR_QTY: b.CIR_QTY,
                            ACTUAL_QTY: b.ACTUAL_QTY,
                            UNCONSUMED_FORECAST: b.UNCONSUMED_FORECAST,
                            PRODORD_QTY: b.PRODORD_QTY,
                            UNIQUE_ID: b.UNIQUE_ID,
                            WEEK_DATE: b.WEEK_DATE,
                            SNAP_TIMESTAMP: sTimeStamp
                        }
                        aSnapData.push(obj);
                    })
                }
                if (aSnapData.length > 0) {
                    const keys = ['LOCATION_ID', 'PRODUCT_ID', 'UNIQUE_ID', 'WEEK_DATE'];
                    aSnapData = GenF.removeDuplicate(aSnapData, keys);
                    //Create
                    if (oData.Mode == 'C') {
                        await cds.run(
                            INSERT.into("CP_SNAPSHOT_HEAD").entries(obj)
                        );
                        await cds.run(
                            INSERT.into("CP_SNAPSHOT_DATA").entries(aSnapData)
                        );
                        //After insertion,make SNAPSHOT_CHK in CP_CIR_GENERATED to empty
                        for (c = 0; c < liCirData.length; c++) {
                            await UPDATE `CP_CIR_GENERATED`
                                .with({
                                    SNAPSHOT_CHK: ''
                                })
                                .where(`LOCATION_ID = '${liCirData[c].LOCATION_ID}'
                                                                    AND PRODUCT_ID = '${liCirData[c].PRODUCT_ID}'
                                                                    AND WEEK_DATE = '${liCirData[c].WEEK_DATE}'
                                                                    AND CIR_ID = '${liCirData[c].CIR_ID}'
                                                                    AND MODEL_VERSION = '${liCirData[c].MODEL_VERSION}'
                                                                    AND VERSION = '${liCirData[c].VERSION}'
                                                                    AND SCENARIO = '${liCirData[c].SCENARIO}'
                                                                    `);
                        }
                        return "SUCCESS";
                    } else { //Update
                        var aInsertList = [];
                        //Update CP_SNAPSHOT_DATA if exists, else insert a new entry
                        for (s = 0; s < aSnapData.length; s++) {
                            aSnapData[s].SNAP_TIMESTAMP = sPrevSnapshot;
                            let iIndex = liDetailData.findIndex(f => f.LOCATION_ID == aSnapData[s].LOCATION_ID && f.PRODUCT_ID == aSnapData[s].PRODUCT_ID &&
                                f.UNIQUE_ID == aSnapData[s].UNIQUE_ID && f.WEEK_DATE == aSnapData[s].WEEK_DATE);
                            if (iIndex == -1) {
                                aInsertList.push(aSnapData[s]);
                            } else { //Continue with updation
                                await UPDATE `CP_SNAPSHOT_DATA`
                                    .with({
                                        CIR_QTY: aSnapData[s].CIR_QTY
                                    })
                                    .where(`SNAP_TIMESTAMP = '${aSnapData[s].SNAP_TIMESTAMP}'
                                                                    AND LOCATION_ID = '${aSnapData[s].LOCATION_ID}'
                                                                    AND PRODUCT_ID = '${aSnapData[s].PRODUCT_ID}'
                                                                    AND UNIQUE_ID = '${aSnapData[s].UNIQUE_ID}'
                                                                    AND WEEK_DATE = '${aSnapData[s].WEEK_DATE}'`);
                            }
                        }
                        if (aInsertList.length > 0) { //These are new entries to be inserted 
                            await cds.run(
                                INSERT.into("CP_SNAPSHOT_DATA").entries(aInsertList)
                            );
                        }
                        for (c = 0; c < liCirData.length; c++) {
                            await UPDATE `CP_CIR_GENERATED`
                                .with({
                                    SNAPSHOT_CHK: ''
                                })
                                .where(`LOCATION_ID = '${liCirData[c].LOCATION_ID}'
                                                                    AND PRODUCT_ID = '${liCirData[c].PRODUCT_ID}'
                                                                    AND WEEK_DATE = '${liCirData[c].WEEK_DATE}'
                                                                    AND CIR_ID = '${liCirData[c].CIR_ID}'
                                                                    AND MODEL_VERSION = '${liCirData[c].MODEL_VERSION}'
                                                                    AND VERSION = '${liCirData[c].VERSION}'
                                                                    AND SCENARIO = '${liCirData[c].SCENARIO}'
                                                                    `);
                        }
                        return "SUCCESS";
                    }
                } else {
                    await saveSnapHead(sTimeStamp, oData);
                    return "SUCCESS";
                }
            } else {
                await saveSnapHead(sTimeStamp, oData);
                return "SUCCESS";
            }
        }
    } else {
        oData.TYPE = "CIR"
        await saveSnapHead(sTimeStamp, oData);
        return "SUCCESS";
    }
}

async function assemblyLevelSnapshot(oData, liAssemblyData, sTimeStamp) {
    if (liAssemblyData.length > 0) {
        let aSnapData = [];
        oData.TYPE = "ASMB"
        let liHeadData = await GetSnapshotHeadData();
        liHeadData = liHeadData.filter(el => el.TYPE == 'ASMB');
        //If There is no assembly head data, then just insert Base Snapshot Head
        if (liHeadData.length == 0) {
            if (!oData.SNAPSHOT_DESC) {
                oData.SNAPSHOT_DESC = "First Snapshot";
                oData.TYPE = "ASMB";
            }
            await saveSnapHead(sTimeStamp, oData);
        }
        //If There is no assembly snapshot data, then just insert Base Snapshot Data, else continue to purge data
        if (liHeadData.length == 0) {
            let aData = [];
            liAssemblyData.forEach(el => {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    LOCATION_ID: el.LOCATION_ID,
                    PRODUCT_ID: el.PRODUCT_ID,
                    ITEM_NUM: el.ITEM_NUM,
                    COMPONENT: el.COMPONENT,
                    WEEK_DATE: el.WEEK_DATE,
                    TYPE: el.TYPE,
                    REF_PRODID: el.REF_PRODID,
                    FACTORY_LOC: el.FACTORY_LOC,
                    CIR_QTY: el.CIR_QTY,
                    COMPCIR_QTY: el.COMPCIR_QTY,
                    ACTUAL_QTY: el.ACTUAL_QTY,
                     UNIQUE_ID:el.UNIQUE_ID
                }
                aData.push(obj);
            })
            const keys = ['LOCATION_ID', 'PRODUCT_ID', 'ITEM_NUM', 'COMPONENT', 'TYPE', 'WEEK_DATE', 'REF_PRODID', 'FACTORY_LOC','UNIQUE_ID'];
            aData = GenF.removeDuplicate(aData, keys);
            await cds.run(
                INSERT.into("CP_ASMB_SNAPSHOT_DATA").entries(aData)
            );
            return "SUCCESS";
        } else {
            let obj = {
                KEY: "ASMB",
                HEAD_TABLE: "CP_SNAPSHOT_HEAD",
                TABLE: "CP_ASMB_SNAPSHOT_DATA",
                VIEW: "V_ASMB_SNAPSHOT",
                FIELDS: ["SNAP_TIMESTAMP", "LOCATION_ID", "PRODUCT_ID", "ITEM_NUM", "COMPONENT", "WEEK_DATE", "TYPE", "REF_PRODID", "FACTORY_LOC", "CIR_QTY", "COMPCIR_QTY"]
            }
            liHeadData = await PurgeSnapShot(obj, liHeadData);
            if (liHeadData.length == 0) {
                let aData = [];
                liAssemblyData.forEach(el => {
                    const obj = {
                        SNAP_TIMESTAMP: sTimeStamp,
                        LOCATION_ID: el.LOCATION_ID,
                        PRODUCT_ID: el.PRODUCT_ID,
                        ITEM_NUM: el.ITEM_NUM,
                        COMPONENT: el.COMPONENT,
                        WEEK_DATE: el.WEEK_DATE,
                        TYPE: el.TYPE,
                        REF_PRODID: el.REF_PRODID,
                        FACTORY_LOC: el.FACTORY_LOC,
                        CIR_QTY: el.CIR_QTY,
                        COMPCIR_QTY: el.COMPCIR_QTY,
                         ACTUAL_QTY: el.ACTUAL_QTY,
                          UNIQUE_ID:el.UNIQUE_ID
                    }
                    aData.push(obj);
                })
                const keys = ['LOCATION_ID', 'PRODUCT_ID', 'ITEM_NUM', 'COMPONENT', 'TYPE', 'WEEK_DATE', 'REF_PRODID', 'FACTORY_LOC'];
                aData = GenF.removeDuplicate(aData, keys);
                await saveSnapHead(sTimeStamp, oData);
                await cds.run(
                    INSERT.into("CP_ASMB_SNAPSHOT_DATA").entries(aData)
                );
                return "SUCCESS";
            }
            let sPrevSnapshot = liHeadData[liHeadData.length - 1].SNAP_TIMESTAMP;
            var liSnapDetailData = await cds.run(`SELECT 
                "SNAP_TIMESTAMP_DATA",
                "SNAP_TIMESTAMP",
                "SNAPSHOT_DESC",
                "FROM_DATE",
                "TO_DATE",
                "TYPE",
                "FACTORY_LOC",
                "LOCATION_ID",
                "PRODUCT_ID",
                "ITEM_NUM",
                "COMPONENT",
                "UNIQUE_ID",
                "WEEK_DATE",
                "REF_PRODID",
                "CIR_QTY",
                "COMPCIR_QTY",
                "ACTUAL_QTY"
                 FROM "V_ASMB_SNAPSHOT"
                 WHERE ("SNAP_TIMESTAMP" IN ('${sPrevSnapshot}') )`)
            var liDetailData = await cds.run(`SELECT *
                    FROM "CP_ASMB_SNAPSHOT_DATA"
                    WHERE  "SNAP_TIMESTAMP" = '${sPrevSnapshot}'`)
            if (liAssemblyData.length > 0) {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    SNAPSHOT_DESC: oData.SNAPSHOT_DESC,
                    FROM_DATE: null,
                    TO_DATE: null,
                    TYPE: oData.TYPE
                }
                for (i = 0; i < liAssemblyData.length; i++) {
                    let el = liAssemblyData[i];
                    let iIndex = liSnapDetailData.findIndex(s => s.LOCATION_ID == el.LOCATION_ID && s.PRODUCT_ID == el.PRODUCT_ID && s.COMPONENT == el.COMPONENT && s.WEEK_DATE == el.WEEK_DATE &&
                     s.UNIQUE_ID == el.UNIQUE_ID && s.ITEM_NUM == el.ITEM_NUM && s.CIR_QTY == el.CIR_QTY && s.REF_PRODID == el.REF_PRODID &&
                        s.FACTORY_LOC == el.FACTORY_LOC && s.COMPCIR_QTY == el.COMPCIR_QTY && s.ACTUAL_QTY == el.ACTUAL_QTY)
                    if (iIndex == -1) {
                        const obj = {
                            LOCATION_ID: el.LOCATION_ID,
                            PRODUCT_ID: el.PRODUCT_ID,
                            COMPONENT: el.COMPONENT,
                            ITEM_NUM: el.ITEM_NUM,
                            WEEK_DATE: el.WEEK_DATE,
                            TYPE: el.TYPE,
                            REF_PRODID: el.REF_PRODID,
                            FACTORY_LOC: el.FACTORY_LOC,
                            CIR_QTY: el.CIR_QTY,
                            COMPCIR_QTY: el.COMPCIR_QTY,
                            ACTUAL_QTY:el.ACTUAL_QTY,
                            SNAP_TIMESTAMP: sTimeStamp,
                            UNIQUE_ID:el.UNIQUE_ID
                        }
                        aSnapData.push(obj);
                    }
                }
                if (liSnapDetailData.length == 0) {
                    liAssemblyData.forEach(b => {
                        const obj = {
                            LOCATION_ID: b.LOCATION_ID,
                            PRODUCT_ID: b.PRODUCT_ID,
                            COMPONENT: b.COMPONENT,
                            ITEM_NUM: b.ITEM_NUM,
                            WEEK_DATE: b.WEEK_DATE,
                            TYPE: b.TYPE,
                            REF_PRODID: b.REF_PRODID,
                            FACTORY_LOC: b.FACTORY_LOC,
                            CIR_QTY: b.CIR_QTY,
                            COMPCIR_QTY: b.COMPCIR_QTY,
                            ACTUAL_QTY:b.ACTUAL_QTY,
                             UNIQUE_ID:b.UNIQUE_ID,
                            SNAP_TIMESTAMP: sTimeStamp
                        }
                        aSnapData.push(obj);
                    })
                }
                if (aSnapData.length > 0) {
                    const keys = ['LOCATION_ID', 'PRODUCT_ID', 'ITEM_NUM', 'COMPONENT', 'TYPE', 'WEEK_DATE', 'REF_PRODID', 'FACTORY_LOC'];
                    aSnapData = GenF.removeDuplicate(aSnapData, keys);
                    //Create
                    if (oData.Mode == 'C') {
                        await cds.run(
                            INSERT.into("CP_SNAPSHOT_HEAD").entries(obj)
                        );
                        await cds.run(
                            INSERT.into("CP_ASMB_SNAPSHOT_DATA").entries(aSnapData)
                        );
                        return "SUCCESS";
                    } else {
                        var aInsertList = [];
                        //Update CP_ASMB_SNAPSHOT_DATA if exists, else insert a new entry
                        for (s = 0; s < aSnapData.length; s++) {
                            aSnapData[s].SNAP_TIMESTAMP = sPrevSnapshot;
                            let iIndex = liDetailData.findIndex(f => f.LOCATION_ID == aSnapData[s].LOCATION_ID && f.PRODUCT_ID == aSnapData[s].PRODUCT_ID && f.COMPONENT == aSnapData[s].COMPONENT && f.WEEK_DATE == aSnapData[s].WEEK_DATE &&
                                f.ITEM_NUM == aSnapData[s].ITEM_NUM && f.TYPE == aSnapData[s].TYPE && f.REF_PRODID == aSnapData[s].REF_PRODID && f.FACTORY_LOC == aSnapData[s].FACTORY_LOC);
                            if (iIndex == -1) {
                                aInsertList.push(aSnapData[s]);
                            } else { //Continue with updation
                                await UPDATE `CP_ASMB_SNAPSHOT_DATA`
                                    .with({
                                        CIR_QTY: aSnapData[s].CIR_QTY,
                                        COMPCIR_QTY: aSnapData[s].COMPCIR_QTY
                                    })
                                    .where(`SNAP_TIMESTAMP = '${aSnapData[s].SNAP_TIMESTAMP}'
                                                                    AND LOCATION_ID = '${aSnapData[s].LOCATION_ID}'
                                                                    AND PRODUCT_ID = '${aSnapData[s].PRODUCT_ID}'
                                                                    AND COMPONENT = '${aSnapData[s].COMPONENT}'
                                                                    AND WEEK_DATE = '${aSnapData[s].WEEK_DATE}')
                                                                    AND ITEM_NUM = '${aSnapData[s].ITEM_NUM}')
                                                                    AND TYPE = '${aSnapData[s].TYPE}')
                                                                    AND REF_PRODID = '${aSnapData[s].REF_PRODID}')
                                                                    AND FACTORY_LOC = '${aSnapData[s].FACTORY_LOC}'`);
                            }
                        }
                        if (aInsertList.length > 0) { //These are new entries to be inserted 
                            await cds.run(
                                INSERT.into("CP_ASMB_SNAPSHOT_DATA").entries(aInsertList)
                            );
                        }
                        return "SUCCESS";
                    }
                } else {
                    await saveSnapHead(sTimeStamp, oData);
                    return "SUCCESS";
                }
            } else {
                await saveSnapHead(sTimeStamp, oData);
                return "SUCCESS";
            }
        }
    } else {
        oData.TYPE = "ASMB";
        await saveSnapHead(sTimeStamp, oData);
        return "SUCCESS";
    }
}

async function componentLevelSnapshot(oData, liComponentData, sTimeStamp) {
    // Logic to handle component level snapshot data goes here
    if (liComponentData.length > 0) {
        let aSnapData = [];
        oData.TYPE = "COMP"
        let liHeadData = await GetSnapshotHeadData();
        liHeadData = liHeadData.filter(el => el.TYPE == 'COMP');
        //If There is no component head data, then just insert Base Snapshot Head
        if (liHeadData.length == 0) {
            if (!oData.SNAPSHOT_DESC) {
                oData.SNAPSHOT_DESC = "First Snapshot";
                oData.TYPE = "COMP";
            }
            await saveSnapHead(sTimeStamp, oData);
        }
        //If There is no component snapshot data, then just insert Base Snapshot Data, else continue to purge data
        if (liHeadData.length == 0) {
            let aData = [];
            liComponentData.forEach(el => {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    LOCATION_ID: el.LOCATION_ID,
                    PRODUCT_ID: el.PRODUCT_ID,
                    COMPONENT: el.COMPONENT,
                    WEEK_DATE: el.WEEK_DATE,
                    FACTORY_LOC: el.FACTORY_LOC,
                    CIR_QTY: el.CIR_QTY,
                    COMP_QTY: el.COMP_QTY,
                    IBP_DEMAND: 0
                }
                aData.push(obj);
            })
            const keys = ['LOCATION_ID', 'PRODUCT_ID', 'COMPONENT', 'WEEK_DATE', 'FACTORY_LOC'];
            aData = GenF.removeDuplicate(aData, keys);
            await cds.run(
                INSERT.into("CP_COMP_SNAPSHOT_DATA").entries(aData)
            );
            return "SUCCESS";
        } else {
            let obj = {
                KEY: "COMP",
                HEAD_TABLE: "CP_SNAPSHOT_HEAD",
                TABLE: "CP_COMP_SNAPSHOT_DATA",
                VIEW: "V_COMP_SNAPSHOT",
                FIELDS: ["SNAP_TIMESTAMP", "LOCATION_ID", "PRODUCT_ID", "COMPONENT", "WEEK_DATE", "FACTORY_LOC", "CIR_QTY", "COMP_QTY"]
            }
            liHeadData = await PurgeSnapShot(obj, liHeadData);
            //If after purging, table becomes empty then insert into Head and Data
            if (liHeadData.length == 0) {
                liComponentData.forEach(el => {
                    const obj = {
                        SNAP_TIMESTAMP: sTimeStamp,
                        LOCATION_ID: el.LOCATION_ID,
                        PRODUCT_ID: el.PRODUCT_ID,
                        COMPONENT: el.COMPONENT,
                        WEEK_DATE: el.WEEK_DATE,
                        FACTORY_LOC: el.FACTORY_LOC,
                        CIR_QTY: el.CIR_QTY,
                        COMP_QTY: el.COMP_QTY,
                        IBP_DEMAND: 0
                    }
                    aData.push(obj);
                })
                const keys = ['LOCATION_ID', 'PRODUCT_ID', 'COMPONENT', 'WEEK_DATE', 'FACTORY_LOC'];
                aData = GenF.removeDuplicate(aData, keys);
                await saveSnapHead(sTimeStamp, oData);
                await cds.run(
                    INSERT.into("CP_COMP_SNAPSHOT_DATA").entries(aData)
                );
                return "SUCCESS";
            }
            let sPrevSnapshot = liHeadData[liHeadData.length - 1].SNAP_TIMESTAMP;
            var liSnapDetailData = await cds.run(`SELECT 
                "SNAP_TIMESTAMP_DATA",
                "SNAP_TIMESTAMP",
                "SNAPSHOT_DESC",
                "FROM_DATE",
                "TO_DATE",
                "TYPE",
                "FACTORY_LOC",
                "LOCATION_ID",
                "PRODUCT_ID",
                "COMPONENT",
                "WEEK_DATE",
                "CIR_QTY",
                "COMP_QTY"
                 FROM "V_COMP_SNAPSHOT"
                 WHERE ("SNAP_TIMESTAMP" IN ('${sPrevSnapshot}') )`)
            var liDetailData = await cds.run(`SELECT *
                    FROM "CP_COMP_SNAPSHOT_DATA"
                    WHERE  "SNAP_TIMESTAMP" = '${sPrevSnapshot}'`)
            if (liComponentData.length > 0) {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    SNAPSHOT_DESC: oData.SNAPSHOT_DESC,
                    FROM_DATE: null,
                    TO_DATE: null,
                    TYPE: oData.TYPE
                }
                for (i = 0; i < liComponentData.length; i++) {
                    let el = liComponentData[i];
                    let iIndex = liSnapDetailData.findIndex(s => s.LOCATION_ID == el.LOCATION_ID && s.PRODUCT_ID == el.PRODUCT_ID && s.COMPONENT == el.COMPONENT &&
                        s.WEEK_DATE == el.WEEK_DATE && s.FACTORY_LOC == el.FACTORY_LOC && s.CIR_QTY == el.CIR_QTY &&
                        s.COMP_QTY == el.COMP_QTY)
                    if (iIndex == -1) {
                        const obj = {
                            LOCATION_ID: el.LOCATION_ID,
                            PRODUCT_ID: el.PRODUCT_ID,
                            COMPONENT: el.COMPONENT,
                            WEEK_DATE: el.WEEK_DATE,
                            FACTORY_LOC: el.FACTORY_LOC,
                            CIR_QTY: el.CIR_QTY,
                            COMP_QTY: el.COMP_QTY,
                            IBP_DEMAND: 0,
                            SNAP_TIMESTAMP: sTimeStamp
                        }
                        aSnapData.push(obj);
                    }
                }
                if (liSnapDetailData.length == 0) {
                    liComponentData.forEach(b => {
                        const obj = {
                            LOCATION_ID: b.LOCATION_ID,
                            PRODUCT_ID: b.PRODUCT_ID,
                            COMPONENT: b.COMPONENT,
                            WEEK_DATE: b.WEEK_DATE,
                            FACTORY_LOC: b.FACTORY_LOC,
                            CIR_QTY: b.CIR_QTY,
                            COMP_QTY: b.COMP_QTY,
                            IBP_DEMAND: 0,
                            SNAP_TIMESTAMP: sTimeStamp
                        }
                        aSnapData.push(obj);
                    })
                }
                if (aSnapData.length > 0) {
                    const keys = ['LOCATION_ID', 'PRODUCT_ID', 'COMPONENT', 'WEEK_DATE', 'FACTORY_LOC'];
                    aSnapData = GenF.removeDuplicate(aSnapData, keys);
                    //Create
                    if (oData.Mode == 'C') {
                        await cds.run(
                            INSERT.into("CP_SNAPSHOT_HEAD").entries(obj)
                        );
                        await cds.run(
                            INSERT.into("CP_COMP_SNAPSHOT_DATA").entries(aSnapData)
                        );
                        return "SUCCESS";
                    } else {
                        var aInsertList = [];
                        //Update CP_COMP_SNAPSHOT_DATA if exists, else insert a new entry
                        for (s = 0; s < aSnapData.length; s++) {
                            aSnapData[s].SNAP_TIMESTAMP = sPrevSnapshot;
                            let iIndex = liDetailData.findIndex(f => f.LOCATION_ID == aSnapData[s].LOCATION_ID && f.PRODUCT_ID == aSnapData[s].PRODUCT_ID && f.COMPONENT == aSnapData[s].COMPONENT && f.WEEK_DATE == aSnapData[s].WEEK_DATE && f.FACTORY_LOC == aSnapData[s].FACTORY_LOC);
                            if (iIndex == -1) {
                                aInsertList.push(aSnapData[s]);
                            } else { //Continue with updation
                                await UPDATE `CP_COMP_SNAPSHOT_DATA`
                                    .with({
                                        CIR_QTY: aSnapData[s].CIR_QTY,
                                        COMP_QTY: aSnapData[s].COMP_QTY
                                    })
                                    .where(`SNAP_TIMESTAMP = '${aSnapData[s].SNAP_TIMESTAMP}'
                                                                    AND LOCATION_ID = '${aSnapData[s].LOCATION_ID}'
                                                                    AND PRODUCT_ID = '${aSnapData[s].PRODUCT_ID}'
                                                                    AND COMPONENT = '${aSnapData[s].COMPONENT}'
                                                                    AND WEEK_DATE = '${aSnapData[s].WEEK_DATE}')
                                                                    AND FACTORY_LOC = '${aSnapData[s].FACTORY_LOC}'`);
                            }
                        }
                        if (aInsertList.length > 0) { //These are new entries to be inserted 
                            await cds.run(
                                INSERT.into("CP_COMP_SNAPSHOT_DATA").entries(aInsertList)
                            );
                        }
                        return "SUCCESS";
                    }
                } else {
                    await saveSnapHead(sTimeStamp, oData);
                    return "SUCCESS";
                }
            } else {
                await saveSnapHead(sTimeStamp, oData);
                return "SUCCESS";
            }
        }
    } else {
        oData.TYPE = "COMP"
        await saveSnapHead(sTimeStamp, oData);
        return "SUCCESS";
    }
}

async function restrictionLevelSnapshot(oData, liRestrictionData, sTimeStamp) {
    if (liRestrictionData.length > 0) {
        let aSnapData = [];
        oData.TYPE = "RTR"
        let liHeadData = await GetSnapshotHeadData();
        liHeadData = liHeadData.filter(el => el.TYPE == 'RTR');
        //If There is no restriction head data, then just insert Base Snapshot Head
        if (liHeadData.length == 0) {
            if (!oData.SNAPSHOT_DESC) {
                oData.SNAPSHOT_DESC = "First Snapshot";
                oData.TYPE = "RTR";
            }
            await saveSnapHead(sTimeStamp, oData);
        }
        //If There is no restriction snapshot data, then just insert Base Snapshot Data, else continue to purge data
        if (liHeadData.length == 0) {
            let aData = [];
            liRestrictionData.forEach(el => {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    LOCATION_ID: el.LOCATION_ID,
                    PRODUCT_ID: el.PRODUCT_ID,
                    ITEM_NUM: el.ITEM_NUM,
                    COMPONENT: el.COMPONENT,
                    WEEK_DATE: el.WEEK_DATE,
                    TYPE: el.TYPE,
                    REF_PRODID: el.REF_PRODID,
                    FACTORY_LOC: el.FACTORY_LOC,
                    CIR_QTY: el.CIR_QTY,
                    COMPCIR_QTY: el.COMPCIR_QTY
                }
                aData.push(obj);
            })
            const keys = ['LOCATION_ID', 'PRODUCT_ID', 'ITEM_NUM', 'COMPONENT', 'TYPE', 'WEEK_DATE', 'REF_PRODID', 'FACTORY_LOC'];
            aData = GenF.removeDuplicate(aData, keys);
            await cds.run(
                INSERT.into("CP_RTR_SNAPSHOT_DATA").entries(aData)
            );
            return "SUCCESS";
        } else {
            let obj = {
                KEY: "RTR",
                HEAD_TABLE: "CP_SNAPSHOT_HEAD",
                TABLE: "CP_RTR_SNAPSHOT_DATA",
                VIEW: "V_RTR_SNAPSHOT",
                FIELDS: ["SNAP_TIMESTAMP", "LOCATION_ID", "PRODUCT_ID", "ITEM_NUM", "COMPONENT", "WEEK_DATE", "TYPE", "REF_PRODID", "FACTORY_LOC", "CIR_QTY", "COMPCIR_QTY"]
            }
            liHeadData = await PurgeSnapShot(obj, liHeadData);
            if (liHeadData.length == 0) {
                let aData = [];
                liRestrictionData.forEach(el => {
                    const obj = {
                        SNAP_TIMESTAMP: sTimeStamp,
                        LOCATION_ID: el.LOCATION_ID,
                        PRODUCT_ID: el.PRODUCT_ID,
                        ITEM_NUM: el.ITEM_NUM,
                        COMPONENT: el.COMPONENT,
                        WEEK_DATE: el.WEEK_DATE,
                        TYPE: el.TYPE,
                        REF_PRODID: el.REF_PRODID,
                        FACTORY_LOC: el.FACTORY_LOC,
                        CIR_QTY: el.CIR_QTY,
                        COMPCIR_QTY: el.COMPCIR_QTY
                    }
                    aData.push(obj);
                })
                const keys = ['LOCATION_ID', 'PRODUCT_ID', 'ITEM_NUM', 'COMPONENT', 'TYPE', 'WEEK_DATE', 'REF_PRODID', 'FACTORY_LOC'];
                aData = GenF.removeDuplicate(aData, keys);
                await saveSnapHead(sTimeStamp, oData);
                await cds.run(
                    INSERT.into("CP_RTR_SNAPSHOT_DATA").entries(aData)
                );
                return "SUCCESS";
            }
            let sPrevSnapshot = liHeadData[liHeadData.length - 1].SNAP_TIMESTAMP;
            var liSnapDetailData = await cds.run(`SELECT 
                "SNAP_TIMESTAMP_DATA",
                "SNAP_TIMESTAMP",
                "SNAPSHOT_DESC",
                "FROM_DATE",
                "TO_DATE",
                "TYPE",
                "FACTORY_LOC",
                "LOCATION_ID",
                "PRODUCT_ID",
                "ITEM_NUM",
                "COMPONENT",
                "WEEK_DATE",
                "REF_PRODID",
                "CIR_QTY",
                "COMPCIR_QTY"
                 FROM "V_RTR_SNAPSHOT"
                 WHERE ("SNAP_TIMESTAMP" IN ('${sPrevSnapshot}') )`)
            var liDetailData = await cds.run(`SELECT *
                    FROM "CP_RTR_SNAPSHOT_DATA"
                    WHERE  "SNAP_TIMESTAMP" = '${sPrevSnapshot}'`)
            if (liRestrictionData.length > 0) {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    SNAPSHOT_DESC: oData.SNAPSHOT_DESC,
                    FROM_DATE: null,
                    TO_DATE: null,
                    TYPE: oData.TYPE
                }
                for (i = 0; i < liRestrictionData.length; i++) {
                    let el = liRestrictionData[i];
                    let iIndex = liSnapDetailData.findIndex(s => s.LOCATION_ID == el.LOCATION_ID && s.PRODUCT_ID == el.PRODUCT_ID && s.COMPONENT == el.COMPONENT && s.WEEK_DATE == el.WEEK_DATE &&
                        s.ITEM_NUM == el.ITEM_NUM && s.CIR_QTY == el.CIR_QTY && s.REF_PRODID == el.REF_PRODID &&
                        s.FACTORY_LOC == el.FACTORY_LOC && s.COMPCIR_QTY == el.COMPCIR_QTY)
                    if (iIndex == -1) {
                        const obj = {
                            LOCATION_ID: el.LOCATION_ID,
                            PRODUCT_ID: el.PRODUCT_ID,
                            COMPONENT: el.COMPONENT,
                            ITEM_NUM: el.ITEM_NUM,
                            WEEK_DATE: el.WEEK_DATE,
                            TYPE: el.TYPE,
                            REF_PRODID: el.REF_PRODID,
                            FACTORY_LOC: el.FACTORY_LOC,
                            CIR_QTY: el.CIR_QTY,
                            COMPCIR_QTY: el.COMPCIR_QTY,
                            SNAP_TIMESTAMP: sTimeStamp
                        }
                        aSnapData.push(obj);
                    }
                }
                if (liSnapDetailData.length == 0) {
                    liRestrictionData.forEach(b => {
                        const obj = {
                            LOCATION_ID: b.LOCATION_ID,
                            PRODUCT_ID: b.PRODUCT_ID,
                            COMPONENT: b.COMPONENT,
                            ITEM_NUM: b.ITEM_NUM,
                            WEEK_DATE: b.WEEK_DATE,
                            TYPE: b.TYPE,
                            REF_PRODID: b.REF_PRODID,
                            FACTORY_LOC: b.FACTORY_LOC,
                            CIR_QTY: b.CIR_QTY,
                            COMPCIR_QTY: b.COMPCIR_QTY,
                            SNAP_TIMESTAMP: sTimeStamp
                        }
                        aSnapData.push(obj);
                    })
                }
                if (aSnapData.length > 0) {
                    const keys = ['LOCATION_ID', 'PRODUCT_ID', 'ITEM_NUM', 'COMPONENT', 'TYPE', 'WEEK_DATE', 'REF_PRODID', 'FACTORY_LOC'];
                    aSnapData = GenF.removeDuplicate(aSnapData, keys);
                    //Create
                    if (oData.Mode == 'C') {
                        await cds.run(
                            INSERT.into("CP_SNAPSHOT_HEAD").entries(obj)
                        );
                        await cds.run(
                            INSERT.into("CP_RTR_SNAPSHOT_DATA").entries(aSnapData)
                        );
                        return "SUCCESS";
                    } else {
                        var aInsertList = [];
                        //Update CP_RTR_SNAPSHOT_DATA if exists, else insert a new entry
                        for (s = 0; s < aSnapData.length; s++) {
                            aSnapData[s].SNAP_TIMESTAMP = sPrevSnapshot;
                            let iIndex = liDetailData.findIndex(f => f.LOCATION_ID == aSnapData[s].LOCATION_ID && f.PRODUCT_ID == aSnapData[s].PRODUCT_ID && f.COMPONENT == aSnapData[s].COMPONENT && f.WEEK_DATE == aSnapData[s].WEEK_DATE &&
                                f.ITEM_NUM == aSnapData[s].ITEM_NUM && f.TYPE == aSnapData[s].TYPE && f.REF_PRODID == aSnapData[s].REF_PRODID && f.FACTORY_LOC == aSnapData[s].FACTORY_LOC);
                            if (iIndex == -1) {
                                aInsertList.push(aSnapData[s]);
                            } else { //Continue with updation
                                await UPDATE `CP_RTR_SNAPSHOT_DATA`
                                    .with({
                                        CIR_QTY: aSnapData[s].CIR_QTY,
                                        COMPCIR_QTY: aSnapData[s].COMPCIR_QTY
                                    })
                                    .where(`SNAP_TIMESTAMP = '${aSnapData[s].SNAP_TIMESTAMP}'
                                                                            AND LOCATION_ID = '${aSnapData[s].LOCATION_ID}'
                                                                            AND PRODUCT_ID = '${aSnapData[s].PRODUCT_ID}'
                                                                            AND COMPONENT = '${aSnapData[s].COMPONENT}'
                                                                            AND WEEK_DATE = '${aSnapData[s].WEEK_DATE}')
                                                                            AND ITEM_NUM = '${aSnapData[s].ITEM_NUM}')
                                                                            AND TYPE = '${aSnapData[s].TYPE}')
                                                                            AND REF_PRODID = '${aSnapData[s].REF_PRODID}')
                                                                            AND FACTORY_LOC = '${aSnapData[s].FACTORY_LOC}'`);
                            }
                        }
                        if (aInsertList.length > 0) { //These are new entries to be inserted 
                            await cds.run(
                                INSERT.into("CP_RTR_SNAPSHOT_DATA").entries(aInsertList)
                            );
                        }
                        return "SUCCESS";
                    }
                } else {
                    await saveSnapHead(sTimeStamp, oData);
                    return "SUCCESS";
                }
            } else {
                await saveSnapHead(sTimeStamp, oData);
                return "SUCCESS";
            }
        }
    } else {
        oData.TYPE = "RTR"
        await saveSnapHead(sTimeStamp, oData);
        return "SUCCESS";
    }
}

async function demandLevelSnapshot(oData, liDemandData, sTimeStamp) {
    if (liDemandData.length > 0) {
        let aSnapData = [];
        oData.TYPE = "FD"
        let liHeadData = await GetSnapshotHeadData();
        liHeadData = liHeadData.filter(el => el.TYPE == 'FD');
        //If There is no demand head data, then just insert Base Snapshot Head
        if (liHeadData.length == 0) {
            if (!oData.SNAPSHOT_DESC) {
                oData.SNAPSHOT_DESC = "First Snapshot";
                oData.TYPE = "FD";
            }
            await saveSnapHead(sTimeStamp, oData);
        }
        //If There is no demand snapshot data, then just insert Base Snapshot Data, else continue to purge data
        if (liHeadData.length == 0) {
            let aData = [];
            liDemandData.forEach(el => {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    LOCATION_ID: el.LOCATION_ID,
                    PRODUCT_ID: el.PRODUCT_ID,
                    WEEK_DATE: el.WEEK_DATE,
                    QUANTITY: el.QUANTITY
                }
                aData.push(obj);
            })
            const keys = ['LOCATION_ID', 'PRODUCT_ID', 'WEEK_DATE'];
            aData = GenF.removeDuplicate(aData, keys);
            await cds.run(
                INSERT.into("CP_FD_SNAPSHOT_DATA").entries(aData)
            );
            return "SUCCESS";
        } else {
            let obj = {
                KEY: "FD",
                HEAD_TABLE: "CP_SNAPSHOT_HEAD",
                TABLE: "CP_FD_SNAPSHOT_DATA",
                VIEW: "V_FD_SNAPSHOT",
                FIELDS: ["SNAP_TIMESTAMP", "LOCATION_ID", "PRODUCT_ID", "WEEK_DATE", "QUANTITY"]
            }
            liHeadData = await PurgeSnapShot(obj, liHeadData);
            if (liHeadData.length == 0) {
                let aData = [];
                liDemandData.forEach(el => {
                    const obj = {
                        SNAP_TIMESTAMP: sTimeStamp,
                        LOCATION_ID: el.LOCATION_ID,
                        PRODUCT_ID: el.PRODUCT_ID,
                        WEEK_DATE: el.WEEK_DATE,
                        QUANTITY: el.QUANTITY
                    }
                    aData.push(obj);
                })
                const keys = ['LOCATION_ID', 'PRODUCT_ID', 'WEEK_DATE'];
                aData = GenF.removeDuplicate(aData, keys);
                await saveSnapHead(sTimeStamp, oData);
                await cds.run(
                    INSERT.into("CP_FD_SNAPSHOT_DATA").entries(aData)
                );
                return "SUCCESS";
            }
            let sPrevSnapshot = liHeadData[liHeadData.length - 1].SNAP_TIMESTAMP;
            var liSnapDetailData = await cds.run(`SELECT 
                "SNAP_TIMESTAMP_DATA",
                "SNAP_TIMESTAMP",
                "SNAPSHOT_DESC",
                "FROM_DATE",
                "TO_DATE",
                "TYPE",
                "LOCATION_ID",
                "PRODUCT_ID",
                "WEEK_DATE",
                "QUANTITY"
                FROM "V_FD_SNAPSHOT"
                WHERE ("SNAP_TIMESTAMP" IN ('${sPrevSnapshot}'))`)
            var liDetailData = await cds.run(`SELECT *
                    FROM "CP_FD_SNAPSHOT_DATA"
                    WHERE  "SNAP_TIMESTAMP" = '${sPrevSnapshot}'`)
            if (liDemandData.length > 0) {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    SNAPSHOT_DESC: oData.SNAPSHOT_DESC,
                    FROM_DATE: null,
                    TO_DATE: null,
                    TYPE: oData.TYPE
                }
                for (i = 0; i < liDemandData.length; i++) {
                    let el = liDemandData[i];
                    let iIndex = liSnapDetailData.findIndex(s => s.LOCATION_ID == el.LOCATION_ID && s.PRODUCT_ID == el.PRODUCT_ID && s.WEEK_DATE == el.WEEK_DATE && s.QUANTITY == el.QUANTITY)
                    if (iIndex == -1) {
                        const obj = {
                            LOCATION_ID: el.LOCATION_ID,
                            PRODUCT_ID: el.PRODUCT_ID,
                            WEEK_DATE: el.WEEK_DATE,
                            QUANTITY: el.QUANTITY,
                            SNAP_TIMESTAMP: sTimeStamp
                        }
                        aSnapData.push(obj);
                    }
                }
                if (liSnapDetailData.length == 0) {
                    liDemandData.forEach(b => {
                        const obj = {
                            LOCATION_ID: b.LOCATION_ID,
                            PRODUCT_ID: b.PRODUCT_ID,
                            WEEK_DATE: b.WEEK_DATE,
                            QUANTITY: b.QUANTITY,
                            SNAP_TIMESTAMP: sTimeStamp
                        }
                        aSnapData.push(obj);
                    })
                }
                if (aSnapData.length > 0) {
                    const keys = ['LOCATION_ID', 'PRODUCT_ID', 'WEEK_DATE'];
                    aSnapData = GenF.removeDuplicate(aSnapData, keys);
                    //Create
                    if (oData.Mode == 'C') {
                        await cds.run(
                            INSERT.into("CP_SNAPSHOT_HEAD").entries(obj)
                        );
                        await cds.run(
                            INSERT.into("CP_FD_SNAPSHOT_DATA").entries(aSnapData)
                        );
                        return "SUCCESS";
                    } else {
                        var aInsertList = [];
                        //Update CP_FD_SNAPSHOT_DATA if exists, else insert a new entry
                        for (s = 0; s < aSnapData.length; s++) {
                            aSnapData[s].SNAP_TIMESTAMP = sPrevSnapshot;
                            let iIndex = liDetailData.findIndex(f => f.LOCATION_ID == aSnapData[s].LOCATION_ID && f.PRODUCT_ID == aSnapData[s].PRODUCT_ID && f.WEEK_DATE == aSnapData[s].WEEK_DATE);
                            if (iIndex == -1) {
                                aInsertList.push(aSnapData[s]);
                            } else { //Continue with updation
                                await UPDATE `CP_FD_SNAPSHOT_DATA`
                                    .with({
                                        QUANTITY: aSnapData[s].QUANTITY
                                    })
                                    .where(`SNAP_TIMESTAMP = '${aSnapData[s].SNAP_TIMESTAMP}'
                                                                                    AND LOCATION_ID = '${aSnapData[s].LOCATION_ID}'
                                                                                    AND PRODUCT_ID = '${aSnapData[s].PRODUCT_ID}'
                                                                                    AND WEEK_DATE = '${aSnapData[s].WEEK_DATE}'`);
                            }
                        }
                        if (aInsertList.length > 0) { //These are new entries to be inserted 
                            await cds.run(
                                INSERT.into("CP_FD_SNAPSHOT_DATA").entries(aInsertList)
                            );
                        }
                        return "SUCCESS";
                    }
                } else {
                    await saveSnapHead(sTimeStamp, oData);
                    return "SUCCESS";
                }
            } else {
                await saveSnapHead(sTimeStamp, oData);
                return "SUCCESS";
            }
        }
    } else {
        oData.TYPE = "FD"
        await saveSnapHead(sTimeStamp, oData);
        return "SUCCESS";
    }
}

async function optionLevelSnapshot(oData, liOptPerData, sTimeStamp) {
    if (liOptPerData.length > 0) {
        let aSnapData = [];
        oData.TYPE = "OPT"
        let liHeadData = await GetSnapshotHeadData();
        liHeadData = liHeadData.filter(el => el.TYPE == 'OPT');
        //If There is no demand head data, then just insert Base Snapshot Head
        if (liHeadData.length == 0) {
            if (!oData.SNAPSHOT_DESC) {
                oData.SNAPSHOT_DESC = "First Snapshot";
                oData.TYPE = "OPT";
            }
            await saveSnapHead(sTimeStamp, oData);
        }
        //If There is no Option snapshot data, then just insert Base Snapshot Data, else continue to purge data
        if (liHeadData.length == 0) {
            let aData = [];
            liOptPerData.forEach(el => {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    LOCATION_ID: el.LOCATION_ID,
                    PRODUCT_ID: el.PRODUCT_ID,
                    CUSTOMER_GROUP: el.CUSTOMER_GROUP,
                    CLASS_NUM: el.CLASS_NUM,
                    CHAR_NUM: el.CHAR_NUM,
                    CHARVAL_NUM: el.CHARVAL_NUM,
                    WEEK_DATE: el.WEEK_DATE,
                    MODEL_VERSION: el.MODEL_VERSION,
                    VERSION: el.VERSION,
                    SCENARIO: el.SCENARIO,
                    TYPE: el.TYPE,
                    OPT_PERCENT: el.OPT_PERCENT
                }
                aData.push(obj);
            })
            const keys = ['LOCATION_ID', 'PRODUCT_ID', 'CUSTOMER_GROUP', 'CLASS_NUM', 'CHAR_NUM', 'CHARVAL_NUM', 'MODEL_VERSION', 'VERSION', 'SCENARIO', 'TYPE', 'WEEK_DATE'];
            aData = GenF.removeDuplicate(aData, keys);
            await cds.run(
                INSERT.into("CP_OPT_SNAPSHOT_DATA").entries(aData)
            );
            return "SUCCESS";
        } else {
            let obj = {
                KEY: "OPT",
                HEAD_TABLE: "CP_SNAPSHOT_HEAD",
                TABLE: "CP_OPT_SNAPSHOT_DATA",
                VIEW: "V_OPT_SNAPSHOT",
                FIELDS: ["SNAP_TIMESTAMP", "LOCATION_ID", "PRODUCT_ID", "CUSTOMER_GROUP", "CLASS_NUM", "CHAR_NUM", "CHARVAL_NUM", "TYPE", "WEEK_DATE", "MODEL_VERSION", "VERSION", "SCENARIO", "OPT_PERCENT"]
            }
            liHeadData = await PurgeSnapShot(obj, liHeadData);
            if (liHeadData.length == 0) {
                let aData = [];
                liOptPerData.forEach(el => {
                    const obj = {
                        SNAP_TIMESTAMP: sTimeStamp,
                        LOCATION_ID: el.LOCATION_ID,
                        PRODUCT_ID: el.PRODUCT_ID,
                        CUSTOMER_GROUP: el.CUSTOMER_GROUP,
                        CLASS_NUM: el.CLASS_NUM,
                        CHAR_NUM: el.CHAR_NUM,
                        CHARVAL_NUM: el.CHARVAL_NUM,
                        WEEK_DATE: el.WEEK_DATE,
                        MODEL_VERSION: el.MODEL_VERSION,
                        VERSION: el.VERSION,
                        SCENARIO: el.SCENARIO,
                        TYPE: el.TYPE,
                        OPT_PERCENT: el.OPT_PERCENT
                    }
                    aData.push(obj);
                })
                const keys = ['LOCATION_ID', 'PRODUCT_ID', 'CUSTOMER_GROUP', 'CLASS_NUM', 'CHAR_NUM', 'CHARVAL_NUM', 'MODEL_VERSION', 'VERSION', 'SCENARIO', 'TYPE', 'WEEK_DATE'];
                aData = GenF.removeDuplicate(aData, keys);
                await saveSnapHead(sTimeStamp, oData);
                await cds.run(
                    INSERT.into("CP_OPT_SNAPSHOT_DATA").entries(aData)
                );
                return "SUCCESS";
            }
            let sPrevSnapshot = liHeadData[liHeadData.length - 1].SNAP_TIMESTAMP;
            var liSnapDetailData = await cds.run(`SELECT 
                "SNAP_TIMESTAMP",
                "LOCATION_ID",
                "PRODUCT_ID",
                "CUSTOMER_GROUP",
                "CLASS_NUM",
                "CHAR_NUM",
                "CHARVAL_NUM",
                "TYPE",
                "MODEL_VERSION",
                "VERSION",
                "SCENARIO",
                "WEEK_DATE",
                "OPT_PERCENT"
                FROM "CP_OPT_SNAPSHOT_DATA"
                WHERE ("SNAP_TIMESTAMP" IN ('${sPrevSnapshot}'))`)
            var liDetailData = await cds.run(`SELECT *
                    FROM "CP_OPT_SNAPSHOT_DATA"
                    WHERE  "SNAP_TIMESTAMP" = '${sPrevSnapshot}'`)
            if (liOptPerData.length > 0) {
                const obj = {
                    SNAP_TIMESTAMP: sTimeStamp,
                    SNAPSHOT_DESC: oData.SNAPSHOT_DESC,
                    FROM_DATE: null,
                    TO_DATE: null,
                    TYPE: oData.TYPE
                }
                for (i = 0; i < liOptPerData.length; i++) {
                    let el = liOptPerData[i];
                    let iIndex = liSnapDetailData.findIndex(s => s.LOCATION_ID == el.LOCATION_ID && s.PRODUCT_ID == el.PRODUCT_ID && s.CUSTOMER_GROUP == el.CUSTOMER_GROUP && s.CLASS_NUM == el.CLASS_NUM && s.CHAR_NUM == el.CHAR_NUM && s.CHARVAL_NUM == el.CHARVAL_NUM && s.TYPE == el.TYPE && s.WEEK_DATE == el.WEEK_DATE && s.MODEL_VERSION == el.MODEL_VERSION && s.VERSION == el.VERSION && s.SCENARIO == el.SCENARIO && s.OPT_PERCENT == el.OPT_PERCENT)
                    if (iIndex == -1) {
                        const obj = {
                            LOCATION_ID: el.LOCATION_ID,
                            PRODUCT_ID: el.PRODUCT_ID,
                            CUSTOMER_GROUP: el.CUSTOMER_GROUP,
                            CLASS_NUM: el.CLASS_NUM,
                            CHAR_NUM: el.CHAR_NUM,
                            CHARVAL_NUM: el.CHARVAL_NUM,
                            WEEK_DATE: el.WEEK_DATE,
                            TYPE: el.TYPE,
                            MODEL_VERSION: el.MODEL_VERSION,
                            VERSION: el.VERSION,
                            SCENARIO: el.SCENARIO,
                            OPT_PERCENT: el.OPT_PERCENT,
                            SNAP_TIMESTAMP: sTimeStamp
                        }
                        aSnapData.push(obj);
                    }
                }
                if (liSnapDetailData.length == 0) {
                    liOptPerData.forEach(b => {
                        const obj = {
                            LOCATION_ID: b.LOCATION_ID,
                            PRODUCT_ID: b.PRODUCT_ID,
                            CUSTOMER_GROUP: b.CUSTOMER_GROUP,
                            CLASS_NUM: b.CLASS_NUM,
                            CHAR_NUM: b.CHAR_NUM,
                            CHARVAL_NUM: b.CHARVAL_NUM,
                            WEEK_DATE: b.WEEK_DATE,
                            TYPE: b.TYPE,
                            MODEL_VERSION: b.MODEL_VERSION,
                            VERSION: b.VERSION,
                            SCENARIO: b.SCENARIO,
                            OPT_PERCENT: b.OPT_PERCENT,
                            SNAP_TIMESTAMP: sTimeStamp
                        }
                        aSnapData.push(obj);
                    })
                }
                if (aSnapData.length > 0) {
                    const keys = ['LOCATION_ID', 'PRODUCT_ID', 'CUSTOMER_GROUP', 'CLASS_NUM', 'CHAR_NUM', 'CHARVAL_NUM', 'MODEL_VERSION', 'VERSION', 'SCENARIO', 'TYPE', 'WEEK_DATE'];
                    aSnapData = GenF.removeDuplicate(aSnapData, keys);
                    //Create
                    if (oData.Mode == 'C') {
                        await cds.run(
                            INSERT.into("CP_SNAPSHOT_HEAD").entries(obj)
                        );
                        await cds.run(
                            INSERT.into("CP_OPT_SNAPSHOT_DATA").entries(aSnapData)
                        );
                        return "SUCCESS";
                    } else {
                        var aInsertList = [];
                        //Update CP_FD_SNAPSHOT_DATA if exists, else insert a new entry
                        for (s = 0; s < aSnapData.length; s++) {
                            aSnapData[s].SNAP_TIMESTAMP = sPrevSnapshot;
                            let iIndex = liDetailData.findIndex(f => f.LOCATION_ID == aSnapData[s].LOCATION_ID && f.PRODUCT_ID == aSnapData[s].PRODUCT_ID && f.CUSTOMER_GROUP == aSnapData[s].CUSTOMER_GROUP && f.CLASS_NUM == aSnapData[s].CLASS_NUM && f.CHAR_NUM == aSnapData[s].CHAR_NUM && f.CHARVAL_NUM == aSnapData[s].CHARVAL_NUM && f.TYPE == aSnapData[s].TYPE && f.WEEK_DATE == aSnapData[s].WEEK_DATE && f.MODEL_VERSION == aSnapData[s].MODEL_VERSION && f.VERSION == aSnapData[s].VERSION && f.SCENARIO == aSnapData[s].SCENARIO)
                            if (iIndex == -1) {
                                aInsertList.push(aSnapData[s]);
                            } else { //Continue with updation
                                await UPDATE `CP_OPT_SNAPSHOT_DATA`
                                    .with({
                                        OPT_PERCENT: aSnapData[s].OPT_PERCENT
                                    })
                                    .where(`SNAP_TIMESTAMP = '${aSnapData[s].SNAP_TIMESTAMP}'
                                                                                    AND LOCATION_ID = '${aSnapData[s].LOCATION_ID}'
                                                                                    AND PRODUCT_ID = '${aSnapData[s].PRODUCT_ID}'
                                                                                    AND CUSTOMER_GROUP = '${aSnapData[s].CUSTOMER_GROUP}'
                                                                                    AND CLASS_NUM = '${aSnapData[s].CLASS_NUM}'
                                                                                    AND CHAR_NUM = '${aSnapData[s].CHAR_NUM}'
                                                                                    AND CHARVAL_NUM = '${aSnapData[s].CHARVAL_NUM}'
                                                                                    AND TYPE = '${aSnapData[s].TYPE}'
                                                                                    AND WEEK_DATE = '${aSnapData[s].WEEK_DATE}'
                                                                                    AND MODEL_VERSION = '${aSnapData[s].MODEL_VERSION}'
                                                                                    AND VERSION = '${aSnapData[s].VERSION}'
                                                                                    AND SCENARIO = '${aSnapData[s].SCENARIO}'
                                                                                    `)
                            }
                        }
                        if (aInsertList.length > 0) { //These are new entries to be inserted 
                            await cds.run(
                                INSERT.into("CP_OPT_SNAPSHOT_DATA").entries(aInsertList)
                            );
                        }
                        return "SUCCESS";
                    }
                } else {
                    await saveSnapHead(sTimeStamp, oData);
                    return "SUCCESS";
                }
            } else {
                await saveSnapHead(sTimeStamp, oData);
                return "SUCCESS";
            }
        }
    } else {
        oData.TYPE = "OPT"
        await saveSnapHead(sTimeStamp, oData);
        return "SUCCESS";
    }
}