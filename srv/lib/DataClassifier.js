var cds = require('@sap/cds');
const { INSERT, UPSERT } = require('@sap/cds/lib/ql/cds-ql');

class DataClassifier {
  constructor() {

  };
  static async RunPalProcedure(req) {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
      const day = String(date.getDate()).padStart(2, "0");
      var formatted = `${year}-${month}-${day}`;
      var tx = cds.transaction(req);
      var getPrimaryIds;
      let { LOCATION_ID, PRODUCT_ID, PROFILE_NAME } = req.data;
      var PROFILE = PROFILE_NAME;
      var lQuery = `SELECT DISTINCT LOCATION_ID, PRODUCT_ID,GROUP_ID,CUSTOMER_GROUP FROM CATALOGSERVICE_GETHISTORYSTAT where GROUP_ID !=0`;
      if (LOCATION_ID != "") {
        lQuery = lQuery + ` and LOCATION_ID ='${LOCATION_ID}'`
      }
      if (PRODUCT_ID != "") {
        lQuery = lQuery + ` and PRODUCT_ID ='${PRODUCT_ID}'`
      }
      if (LOCATION_ID != "" && PRODUCT_ID != "") {
        lQuery = lQuery + ` and LOCATION_ID ='${LOCATION_ID}' and PRODUCT_ID ='${PRODUCT_ID}'`
      }
      if (PROFILE == "") {
        let PQuery = `SELECT "FORECASTING_PROFILE" FROM "CP_PROFILE_LOC_PROD"`;
        if (LOCATION_ID != "" && PRODUCT_ID == "") {
          PQuery = PQuery + ` where LOCATION_ID = '${LOCATION_ID}' and PRODUCT_ID = 'NA'`
        }
        if (LOCATION_ID != "" && PRODUCT_ID != "") {
          PQuery = PQuery + ` where LOCATION_ID = '${LOCATION_ID}' and PRODUCT_ID ='${PRODUCT_ID}'`
        }
        let GetProfile = await cds.run(PQuery)
        PROFILE = GetProfile[0].FORECASTING_PROFILE;
      }
      getPrimaryIds = await cds.run(lQuery);
      var totalStatFoerecats = [];
      for (let index = 0; index < getPrimaryIds.length; index++) {
        const { LOCATION_ID, PRODUCT_ID, CUSTOMER_GROUP, GROUP_ID } = getPrimaryIds[index];
        let DATATABLENAME = "#DATA_INPUT" + `${LOCATION_ID}${PRODUCT_ID}${CUSTOMER_GROUP}${PROFILE_NAME}`;
        let RESULTTABLENAME = "#RESULT" + `${LOCATION_ID}${PRODUCT_ID}${CUSTOMER_GROUP}${PROFILE_NAME}`;
        await tx.run(`CREATE LOCAL TEMPORARY TABLE ${DATATABLENAME} LIKE TT_PAL_FORECAST_IN`);
        await tx.run(`CREATE LOCAL TEMPORARY TABLE #PAL_PARAMS LIKE TT_PAL_FORECAST_IN_MODEL`);
        await tx.run(`CREATE LOCAL TEMPORARY TABLE ${RESULTTABLENAME} LIKE TT_PAL_FORECAST_RESULT`);
        await tx.run(`CREATE LOCAL TEMPORARY TABLE #MODEL LIKE TT_PAL_FORECAST_MODEL`);
        await tx.run(`INSERT INTO ${DATATABLENAME} (TIMESTAMP, VALUE) SELECT ROW_COUNT as TIMESTAMP , CAST(COALESCE("CONFIRMED_QTY_TOT_CONFIRMED", 0) AS INT) AS VALUE FROM CATALOGSERVICE_GETHISTORYSTAT WHERE LOCATION_ID = '${LOCATION_ID}' AND  PRODUCT_ID = '${PRODUCT_ID}' AND CUSTOMER_GROUP='${CUSTOMER_GROUP}'  AND GROUP_ID ='${GROUP_ID}';`);
        await tx.run(`INSERT INTO #PAL_PARAMS (PARAM_NAME, INT_VALUE, DOUBLE_VALUE, STRING_VALUE)  SELECT "PARA_NAME" as PARAM_NAME,"INTVAL" as INT_VALUE,"DOUBLEVAL" as DOUBLE_VALUE,"STRVAL" as STRING_VALUE FROM "CP_PAL_PROFILEMETH_PARA" where PROFILE = '${PROFILE}'`);
        await tx.run(`CALL _SYS_AFL.PAL_AUTO_EXPSMOOTH(${DATATABLENAME},#PAL_PARAMS,${RESULTTABLENAME},#MODEL)`);
        const GetFutureDates = await cds.run(`SELECT WEEK_STARTDATE FROM V_WEEK_DESCRIPTOR WHERE WEEK_STARTDATE > '${formatted}' order by WEEK_STARTDATE ASC`)
        const results = await tx.run(`SELECT VALUE AS QUANTITY FROM ${RESULTTABLENAME} WHERE TIMESTAMP NOT IN (SELECT ROW_COUNT as TIMESTAMP  FROM CATALOGSERVICE_GETHISTORYSTAT WHERE LOCATION_ID = '${LOCATION_ID}' AND  PRODUCT_ID = '${PRODUCT_ID}' AND CUSTOMER_GROUP='${CUSTOMER_GROUP}'  AND GROUP_ID ='${GROUP_ID}')`);
        // results.pop()
        for (let index = 0; index < results.length; index++) {
          const { QUANTITY } = results[index];
          const { WEEK_STARTDATE } = GetFutureDates[index]
          let payload = {
            LOCATION_ID: LOCATION_ID,
            PRODUCT_ID: PRODUCT_ID,
            CUSTOMER_GROUP: CUSTOMER_GROUP,
            PRIMARY_ID: GROUP_ID,
            WEEK_DATE: WEEK_STARTDATE,
            QUANTITY: (Math.floor(QUANTITY) < 0) ? 0 : QUANTITY
          }
          totalStatFoerecats.push(payload)
        }
        await tx.run(`DROP TABLE ${DATATABLENAME}`);
        await tx.run(`DROP TABLE #PAL_PARAMS`);
        await tx.run(`DROP TABLE ${RESULTTABLENAME}`);
        await tx.run(`DROP TABLE #MODEL`);
      }
      // var AllStatData = [];
      // for (let index = 0; index < getPrimaryIds.length; index++) {
      //   var { GROUP_ID } = getPrimaryIds[index];
      //   var getFilteredLogs = totalStatFoerecats.filter(i => i.PRIMARY_ID == GROUP_ID)
      //   let getUniqueIds = await cds.run(`select PRIMARY_ID,UNIQUE_ID,DISTRIBUTION_PERCENTAGE from CV_PID_UID_DISTRIBUTION where PRIMARY_ID = '${GROUP_ID}'`)
      //   for (let index = 0; index < getFilteredLogs.length; index++) {
      //     const { WEEK_DATE, QUANTITY, LOCATION_ID, PRODUCT_ID, CUSTOMER_GROUP } = getFilteredLogs[index];
      //     for (let index = 0; index < getUniqueIds.length; index++) {
      //       const { UNIQUE_ID, DISTRIBUTION_PERCENTAGE } = getUniqueIds[index];
      //       AllStatData.push({
      //         PRIMARY_ID: GROUP_ID,
      //         LOCATION_ID: LOCATION_ID,
      //         PRODUCT_ID: PRODUCT_ID,
      //         CUSTOMER_GROUP: CUSTOMER_GROUP,
      //         UNIQUE_ID: UNIQUE_ID + "",
      //         QUANTITY: (QUANTITY * DISTRIBUTION_PERCENTAGE) / 100,
      //         WEEK_DATE: WEEK_DATE
      //       })
      //     }
      //   }
      // }
      // await cds.run('DELETE FROM CP_CP_STAT_DISTRIBUTION_RESULTS;')
      // await cds.run(UPSERT.into("CP_CP_STAT_DISTRIBUTION_RESULTS").entries(AllStatData))
      // let Response = {
      //   StatusCode: 200,
      //   Status: "Success"
      // }
      // req.reply(Response)

      if(totalStatFoerecats.length > 0){
        await cds.run('DELETE FROM CP_STAT_DISTRIBUTION_RESULTS');
        await cds.run(UPSERT.into("CP_STAT_DISTRIBUTION_RESULTS").entries(totalStatFoerecats));
        let Response = {
          StatusCode: 200,
          Status: "Success"
        }
        
      } else {
        let Response = {
          StatusCode: 400,
          Status: "Bad Request"
        }
      }
      req.reply(Response);

      
      
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = DataClassifier