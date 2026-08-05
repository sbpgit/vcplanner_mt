const request = require("request");
const GenF = require("./gen-functions");
const cds = require("@sap/cds");
const procsObj = require("./processObjects");
const Catservicefn = require("./catservice-function");
class GenTimeseriesC {

  /**
   * Constructor
   */
  constructor() {
    this.iVCHistory = [];
    this.gConfigProduct = "";
    this.oReturn = {
      bError: false,
      message: "",
    };
    this.vCurrDate = GenF.getCurrentDate();
  }

  /**
   * Generate Timeseries
   */
   async genTimeseries(adata, lStartDate, req, bUserSelectedWeeks) {

    // this.gConfigProduct = await this.getConfigProduct(
    //   adata.LOCATION_ID,
    //   adata.PRODUCT_ID
    // );
    var aSalesDeltaData = [];
    if (bUserSelectedWeeks == false) {//No User selection from Job Overview
      aSalesDeltaData = await cds.run(`SELECT * FROM "CP_SALESH_CONFIG_DELTA" WHERE "LOCATION_ID"='${adata.LOCATION_ID}' AND "PRODUCT_ID"='${adata.PRODUCT_ID}' ORDER BY WEEK_DATE`);
      if (aSalesDeltaData.length > 0) {
          //Get Previous Monday
          lStartDate = GenF.getPreviousMondayCmp(aSalesDeltaData[0].WEEK_DATE);
        this.vCurrDate = GenF.getNextMondayCmp(aSalesDeltaData[aSalesDeltaData.length - 1].WEEK_DATE);
      }
    }
      var lMainProduct ='',sConfig ='',sOriginalProductID =adata.PRODUCT_ID ;
        let lsMainProduct= await cds.run(`SELECT "PRODUCT_ID","REF_PRODID","CONFIGPROD_CHK" FROM
                                          "CP_PARTIALPROD_INTRO" WHERE "LOCATION_ID"='${adata.LOCATION_ID}' 
                                          AND PRODUCT_ID = '${adata.PRODUCT_ID}'`)
        if (lsMainProduct.length === 0) {
            lMainProduct = GenF.parse(adata.PRODUCT_ID);
        }
        else {//Not a config Product
            lMainProduct = lsMainProduct[0].REF_PRODID;
            sConfig =lsMainProduct[0].CONFIGPROD_CHK;
        }
    // Get Sales Order Count Information
    var liOrderCount = await cds.run(
      `SELECT *
               FROM V_ORD_COUNT
              WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                AND "PRODUCT_ID"  IN (SELECT PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE REF_PRODID = '${lMainProduct}')
                AND "WEEK_DATE" <= '${this.vCurrDate}'
                AND "WEEK_DATE" >= '${lStartDate}'
                ORDER BY "LOCATION_ID" ASC, 
                         "PRODUCT_ID" ASC,
                         "WEEK_DATE" ASC`
    );
    if(sConfig != 'X'){
      liOrderCount = liOrderCount.filter(l=>l.PRODUCT_ID == adata.PRODUCT_ID);
      adata.PRODUCT_ID = lMainProduct;
    }

    if (liOrderCount?.length ==0) {
      let Smsg = `No Orders found for the Location ${adata.LOCATION_ID} and Product ${sOriginalProductID}`
     this.oReturn.bError = false;
        this.oReturn.message =Smsg;
      return this.oReturn;
    }

    const liPrimaryID = await this.getPrimaryIDCharacteristics(
      adata.LOCATION_ID,
      adata.PRODUCT_ID,
      req
    );

    // if (this.oReturn.bError === true) {
    //   return this.oReturn;
    // }

    const liUniqueID = await this.getUniqueIDCharacteristics(
      adata.LOCATION_ID,
      adata.PRODUCT_ID
    );
    // if (this.oReturn.bError === true) {
    //   return this.oReturn;
    // }

    // Get Sales Count Information
    const liPrimaryCount = await cds.run(
      `SELECT 
                LOCATION_ID,
                PRODUCT_ID,
                ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) AS "WEEK_DATE",
                PRIMARY_ID,
                SUM(ORD_QTY) AS ORD_QTY
            FROM 
                V_SALES_H
            WHERE LOCATION_ID = '${adata.LOCATION_ID}'
              AND REF_PRODID = '${adata.PRODUCT_ID}'
              AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) < '${this.vCurrDate}'
              AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) > '${lStartDate}'
            GROUP BY 
                LOCATION_ID,
                PRODUCT_ID,
                ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ),
                PRIMARY_ID
            ORDER BY 
                LOCATION_ID ASC, 
                PRODUCT_ID ASC, 
                WEEK_DATE ASC,
                PRIMARY_ID ASC`
    );

    // Get Sales Count Information
    const liUniqueCount = await cds.run(
      `SELECT 
                LOCATION_ID,
                PRODUCT_ID,
                ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) AS "WEEK_DATE",                
                UNIQUE_ID,
                SUM(ORD_QTY) AS ORD_QTY
            FROM 
                V_SALES_H
            WHERE LOCATION_ID = '${adata.LOCATION_ID}'
              AND REF_PRODID = '${adata.PRODUCT_ID}'
              AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) < '${this.vCurrDate}'
              AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) > '${lStartDate}'
            GROUP BY 
                LOCATION_ID,
                PRODUCT_ID,
                ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ),
                UNIQUE_ID
            ORDER BY 
                LOCATION_ID ASC, 
                PRODUCT_ID ASC, 
                WEEK_DATE ASC,
                UNIQUE_ID ASC`
    );

    const liSalesCharCount = await cds.run(
      `SELECT DISTINCT 
            A.LOCATION_ID,
            A.PRODUCT_ID,
            B.CHAR_NUM,
            B.CHAR_VALUE,
            ADD_DAYS( A.MAT_AVAILDATE, ( WEEKDAY(A.MAT_AVAILDATE) * -1 ) ) AS "WEEK_DATE",
            SUM(A.ORD_QTY) AS ORD_QTY
        FROM 
            V_SALES_H AS A
            INNER JOIN
            V_UNIQUE_ID AS B
            ON B.UNIQUE_ID = A.UNIQUE_ID
                AND B.PRODUCT_ID = A.REF_PRODID
      WHERE LOCATION_ID = '${adata.LOCATION_ID}'
        AND REF_PRODID = '${adata.PRODUCT_ID}'
        GROUP BY 
            A.LOCATION_ID,
            A.PRODUCT_ID,
            ADD_DAYS( A.MAT_AVAILDATE, ( WEEKDAY(A.MAT_AVAILDATE) * -1 ) ),
            B.CHAR_NUM,
            B.CHAR_VALUE
        ORDER BY 
            A.LOCATION_ID,
            A.PRODUCT_ID,
            ADD_DAYS( A.MAT_AVAILDATE, ( WEEKDAY(A.MAT_AVAILDATE) * -1 ) ) ASC,
            CHAR_NUM ASC, 
            CHAR_VALUE ASC `
    );

    const liOD = await this.getObjectDependencyM1(adata.LOCATION_ID, adata.PRODUCT_ID);
    const liRestrictions = await this.getRestrictions(adata.LOCATION_ID, adata.PRODUCT_ID);

    // Get Planning Relevant Primary Ids
    const liPRPIDs_PIDs = await cds.run(`SELECT DISTINCT LOCATION_ID,
                                                          PRODUCT_ID,
                                                          PRPID,
                                                          PID
                                                    FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS
                                                    WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                    AND PRODUCT_ID IN (SELECT PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE REF_PRODID = '${adata.PRODUCT_ID}')
                                                    AND PID NOT IN (SELECT DISTINCT PRP_PID 
                                                                               FROM CP_PRPIDS WHERE LOCATION_ID = '${adata.LOCATION_ID}'
		                                                                            AND PRODUCT_ID IN (SELECT PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE REF_PRODID = '${adata.PRODUCT_ID}')
		                                                                            AND PRP_PID_TYPE IN (1,2,4))
                                                    ORDER BY PRODUCT_ID,
                                                      PRPID`);
    
    const aDistinctPrpIds = await cds.run(`SELECT DISTINCT PRP_PID FROM "CP_PRPIDS" WHERE  LOCATION_ID = '${adata.LOCATION_ID}' AND  PRODUCT_ID IN (SELECT PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE REF_PRODID = '${adata.PRODUCT_ID}')`)
      var oPrpIDs={}
    for (var x = 0; x < aDistinctPrpIds.length; x++) {  
      var key = aDistinctPrpIds[x].PRP_PID;
      if (!oPrpIDs[key]) {
        oPrpIDs[key] = '';
          }
          oPrpIDs[key] = 'X'
  }
    let aPRPIDs = [], oPRPIDs = {}, oProds = {};
    let sProd = '', sPrpid = '', aPIDs = [];
    if (liPRPIDs_PIDs.length > 0) {
      for (let i = 0; i < liPRPIDs_PIDs.length; i++) {
        if (i === 0 || liPRPIDs_PIDs[i].PRODUCT_ID !== liPRPIDs_PIDs[GenF.subOne(i, liPRPIDs_PIDs.length)].PRODUCT_ID ||
          liPRPIDs_PIDs[i].PRPID !== liPRPIDs_PIDs[GenF.subOne(i, liPRPIDs_PIDs.length)].PRPID) {

          sProd = liPRPIDs_PIDs[i].PRODUCT_ID;
          sPrpid = liPRPIDs_PIDs[i].PRPID;
          oPRPIDs[sPrpid] = [];

        }

        aPIDs.push(GenF.parse(liPRPIDs_PIDs[i].PID));

        if (i == GenF.addOne(i, liPRPIDs_PIDs.length) || liPRPIDs_PIDs[i].PRODUCT_ID !== liPRPIDs_PIDs[GenF.addOne(i, liPRPIDs_PIDs.length)].PRODUCT_ID ||
          liPRPIDs_PIDs[i].PRPID !== liPRPIDs_PIDs[GenF.addOne(i, liPRPIDs_PIDs.length)].PRPID) {
          oProds[sPrpid] = GenF.parse(aPIDs)
          aPIDs = [];
        }

        if (i == GenF.addOne(i, liPRPIDs_PIDs.length) || liPRPIDs_PIDs[i].PRODUCT_ID !== liPRPIDs_PIDs[GenF.addOne(i, liPRPIDs_PIDs.length)].PRODUCT_ID) {
          oProds.PRODUCT_ID = sProd;

          aPRPIDs.push(GenF.parse(oProds));
          oPRPIDs = {};
          oProds = {};
        }

      }
    }
    var aAlertData =[];
     //Get Unique ID description
          let aUnique = await cds.run(`SELECT DISTINCT UNIQUE_ID,UNIQUE_DESC FROM "CP_UNIQUE_ID_HEADER" WHERE  "UID_TYPE"='P'`);
          let oUnique ={};
          for(var u =0; u <aUnique.length; u++){
            oUnique[aUnique[u].UNIQUE_ID+"_1"] ??='';
            oUnique[aUnique[u].UNIQUE_ID+"_1"] = aUnique[u].UNIQUE_DESC;
          }
    for (let i = 0; i < liOrderCount.length; i++) {
      this.iVCHistory = [];
      // liOrderCount[i]["WEEK_NO"] = GenF.getWeekNumber(liOrderCount[i].WEEK_DATE);

      // Delete Existing one
      try {
        await DELETE.from("CP_VC_HISTORY_TS")
          .where(`LOCATION_ID = '${liOrderCount[i].LOCATION_ID}' 
                            AND PRODUCT_ID = '${liOrderCount[i].PRODUCT_ID}'
                            AND PERIOD_NUM = '${liOrderCount[i].WEEK_NO}'
                            AND TYPE       IN ('OD', 'PI', 'RT')`);
      } catch (e) {
        console.log(e);
        this.oReturn.bError = true;
        this.oReturn.message = "Time Series History generation Failed.Reason: "+e.message;
      }
      GenF.log(
        `Deleted Timeseries for ${liOrderCount[i].LOCATION_ID}, ${liOrderCount[i].PRODUCT_ID}, ${liOrderCount[i].WEEK_NO}`
      );

      await this.processPrimaryID(
        liOrderCount[i],
        liPrimaryCount,
        liPrimaryID,
        liSalesCharCount,
        aPRPIDs,
        adata,
        oPrpIDs
      );

      // Process Timeseries History for Planning Relevant Primary Ids
      // await this.processPRPIDs(liOrderCount[i], aPRPIDs);

      await this.processObjectDependencyM1(
        liOrderCount[i],
        liUniqueCount,
        liUniqueID,
        liOD,
        liSalesCharCount
      );

      this.processRestrictions(
        liOrderCount[i],
        liUniqueCount,
        liUniqueID,
        liRestrictions,
        liSalesCharCount
      );
      if(this.iVCHistory.length > 0){
        this.iVCHistory = this.iVCHistory.filter(vc=>vc.CHAR_COUNT!=0&& vc.GROUP_COUNT !=0)
      }
      if (this.iVCHistory.length > 0) {
        try {
          //Alert if combination of PERIOD_NUM,PRODUCT_ID,GROUP_ID is less than  3
          const counts = this.iVCHistory.reduce((acc, obj) => {
          const key = `${obj.PERIOD_NUM}|${obj.PRODUCT_ID}|${obj.GROUP_ID}`;
                    acc[key] = (acc[key] || 0) + 1;
              return acc;
            }, {});

          const filtered = this.iVCHistory.filter(obj => {
           const key = `${obj.PERIOD_NUM}|${obj.PRODUCT_ID}|${obj.GROUP_ID}`;
          return counts[key] < 3;
            }); 
            let alertLog = [
        ...new Map(
       filtered.map(obj => [`${obj.LOCATION_ID}|${obj.PRODUCT_ID}|${obj.GROUP_ID}`, {
        LOCATION_ID: obj.LOCATION_ID,
       PRODUCT_ID: obj.PRODUCT_ID,
       GROUP_ID_DESC:oUnique[obj.GROUP_ID]
      }])
    ).values()
    ];
      //Alert
      if(alertLog && alertLog.length>0){
        aAlertData = aAlertData.concat(alertLog);
      }
                
          await INSERT(this.iVCHistory).into('CP_VC_HISTORY_TS');
        }
        catch (er) {
          this.oReturn.bError = true;
          this.oReturn.message = `Time Series History Generation Failed for Location: ${adata.LOCATION_ID}, Product: ${sOriginalProductID}.Reason: ${er.message}`;
          GenF.log(er);
        }
      }

      this.iVCHistory = [];

    }

    GenF.logMessage(req, `Completed history timeseries`);
    //Delete from Delta table based on Location and Product
    if (aSalesDeltaData.length > 0) {
      await cds.run(`DELETE FROM "CP_SALESH_CONFIG_DELTA" WHERE "LOCATION_ID"='${adata.LOCATION_ID}' AND "PRODUCT_ID"='${adata.PRODUCT_ID}'`)
    }

    // if (FlagTest === "S") {
    //   this.oReturn.bError = false;
    //   this.oReturn.message = "Timeseries History generation is complete";
    // } else if (FlagTest === "E") {
    //   this.oReturn.bError = true;
    //   this.oReturn.message = "Timeseries History generation failed";
    // } else if (FlagTest === "W") {
    //   let vWarmsg = `No Data to generate Timeseries History for  : ${adata.PRODUCT_ID}`;
    //   this.oReturn.bError = false;
    //   this.oReturn.message = vWarmsg;
    // } else {
    //   const vMsg = `Timeseries generation for the product: ${adata.PRODUCT_ID} is unsuccessful because of insufficient data`;
    //   this.oReturn.bError = true;
    //   this.oReturn.message = vMsg;
    // }
    if(aAlertData.length>0){
      const result = Object.values(
      aAlertData.reduce((acc, obj) => {
    const key = `${obj.LOCATION_ID}_${obj.PRODUCT_ID}`;
    if (!acc[key]) {
      acc[key] = {
        APPL:"VCPLANNER",
        MSGGRP:'DATA',
        MSGID:'S11',
        LOCATION_ID: obj.LOCATION_ID,
        PRODUCT_ID: obj.PRODUCT_ID,
        MSGTXT: new Set()
      };
    }
    acc[key].MSGTXT.add(obj.GROUP_ID_DESC); 
    return acc;
  }, {})
  ).map(e => ({
  ...e,
  MSGTXT: Array.from(e.MSGTXT).join(', ') 
  }));
  await GenF.sendAlert('C', result, req);
    }
    if (this.oReturn.bError === false) {
      this.oReturn.message = `Timeseries History generation is completed for Location: ${adata.LOCATION_ID}, Product: ${sOriginalProductID}`;
    }
    return this.oReturn;
  }

  /**
   * Get Configurable Product
   */
  async getConfigProduct(lLocation, lProduct) {
    let lsMainProduct = await SELECT.one
      .from("CP_PARTIALPROD_INTRO")
      .columns("REF_PRODID")
      .where(
        `PRODUCT_ID  = '${lProduct}' 
         AND LOCATION_ID = '${lLocation}'`
      );
    if (lsMainProduct === null) {
      return GenF.parse(adata.PRODUCT_ID);
    } else {
      return lsMainProduct.REF_PRODID;
    }
  }

  /**
   * Get Primary ID Configuration
   * @param {Locadtion} lLocation
   * @param {Product} lProduct
   * @returns
   */
  async getPrimaryIDCharacteristics(lLocation, lProduct, req) {
    // Get all the primary ID's for the partial product
    const liPrimaryIDFull = await cds.run(
      `SELECT 
                    "UNIQUE_ID",
                    "CHAR_NUM",
                    "CHAR_VALUE"
                FROM V_UNIQUE_ID
                WHERE PRODUCT_ID = '${lProduct}'
                    AND "UID_TYPE" = 'P'
                    AND "ACTIVE" = true
                ORDER BY 
                    "UNIQUE_ID" ASC, 
                    "CHAR_NUM" ASC;`
    );

    let aPrimaryProd = await cds.run(`SELECT DISTINCT 
                              LOCATION_ID, PRODUCT_ID, PRIMARY_ID 
                              FROM V_SALES_H
                              WHERE LOCATION_ID = '${lLocation}'
                               AND REF_PRODID = '${lProduct}'`);

    const liPrimaryFilter = await this.filterNonFixedCharFromPrimaryID(
      lLocation,
      lProduct,
      liPrimaryIDFull,
      aPrimaryProd,
      req
    );

    return this.organizeConfiguration(liPrimaryFilter);
  }

  /**
   * Get Unique ID Characteristics
   * @param {Locadtion} lLocation
   * @param {Product} lProduct
   * @returns
   */
  async getUniqueIDCharacteristics(lLocation, lProduct) {
    // Get all the primary ID's for the partial product
    const liUniqueID = await cds.run(
      `SELECT DISTINCT
                    A."UNIQUE_ID",
                    A."CHAR_NUM",
                    A."CHAR_VALUE",
                    B.CHAR_NAME
                FROM V_UNIQUE_ID AS A
                    INNER JOIN "CP_CHARACTERISTICS" AS B
                    ON A.CHAR_NUM = B.CHAR_NUM
                    WHERE PRODUCT_ID = '${lProduct}'
                    AND "UID_TYPE" = 'U'
                    AND "ACTIVE" = true
                     ORDER BY 
                    "UNIQUE_ID" ASC, 
                    "CHAR_NUM" ASC;`
    );

    return this.organizeConfiguration(liUniqueID);
  }

  /**
   * Organize Unique ID into an array
   * @param {Unique ID} liUniqueID
   * @returns
   */
  organizeConfiguration(liUniqueID) {
    let liConfig = {};

    for (let i = 0; i < liUniqueID.length; i++) {
      let lsConfig = {};
      lsConfig.CHAR_NUM = liUniqueID[i].CHAR_NUM;
      lsConfig.CHAR_VALUE = liUniqueID[i].CHAR_VALUE;
      lsConfig.CHAR_NAME = liUniqueID[i].CHAR_NAME;

      if (!liConfig[liUniqueID[i].UNIQUE_ID]) {
        liConfig[liUniqueID[i].UNIQUE_ID] = [];
      }
      liConfig[liUniqueID[i].UNIQUE_ID].push(GenF.parse(lsConfig));
    }
    return liConfig;
  }

  /**
   * This function removed the characteristics that are fixed for the partial product
   * @param {Location} lLocation
   * @param {Product} lProduct
   * @param {Primary ID Characteristic} liPrimarIDFull
   * @returns
   */
  async filterNonFixedCharFromPrimaryID(lLocation, lProduct, liPrimarIDFull, lPrimaryProd, req) {
    let liPrimaryID = [];
    let lsPrimaryID = {};

    // Remove the characteristics if they are part of partial product fixed characteristics

    // Get Partial product fixed characteristics
    let liPartialChar = await cds.run(
      `SELECT *
               FROM "V_PARTIALPRODCHAR"
               WHERE "LOCATION_ID" = '${lLocation}'
               AND "PRODUCT_ID" IN (SELECT PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE REF_PRODID = '${lProduct}')
               AND CONFIGPROD_CHK IS NULL`
    );
    // if (liPartialChar.length === 0) {
    //   return liPrimarIDFull;
    // }



    // Filter Partial product Fixed characteristics from Primary ID
    for (let i = 0; i < liPrimarIDFull.length; i++) {
      // let findPartial = lPrimaryProd.find(
      //   (o) =>
      //     o.PRIMARY_ID === liPrimarIDFull[i].UNIQUE_ID
      // );

      let aPartial = lPrimaryProd.filter(function (aPrimary) {
        return aPrimary.PRIMARY_ID === liPrimarIDFull[i].UNIQUE_ID
      });

      if (aPartial.length > 0) {
        for (let index = 0; index < aPartial.length; index++) {

          let findObj = liPartialChar.find(
            (o) =>
              o.CHAR_NUM === liPrimarIDFull[i].CHAR_NUM &&
              o.CHAR_VALUE === liPrimarIDFull[i].CHAR_VALUE &&
              o.PRODUCT_ID === aPartial[index].PRODUCT_ID
          );
          if (findObj) {
            continue;
          }

          lsPrimaryID.UNIQUE_ID = GenF.parse(liPrimarIDFull[i].UNIQUE_ID);
          lsPrimaryID.PRODUCT_ID = GenF.parse(aPartial[index].PRODUCT_ID);
          lsPrimaryID.CHAR_NUM = GenF.parse(liPrimarIDFull[i].CHAR_NUM);
          lsPrimaryID.CHAR_VALUE = GenF.parse(liPrimarIDFull[i].CHAR_VALUE);
          liPrimaryID.push(GenF.parse(lsPrimaryID));
          lsPrimaryID = {};
        }
      }
      else {
        lsPrimaryID.UNIQUE_ID = GenF.parse(liPrimarIDFull[i].UNIQUE_ID);
        lsPrimaryID.PRODUCT_ID = GenF.parse(lProduct);
        lsPrimaryID.CHAR_NUM = GenF.parse(liPrimarIDFull[i].CHAR_NUM);
        lsPrimaryID.CHAR_VALUE = GenF.parse(liPrimarIDFull[i].CHAR_VALUE);
        liPrimaryID.push(GenF.parse(lsPrimaryID));
        lsPrimaryID = {};
      }
    }

    if (liPrimaryID.length === 0) {
      this.oReturn.bError = true;
      this.oReturn.message =
        "Please check characteristics Priority , unable to generate timeseries";
      GenF.logMessage(
        req,
        `Please check characteristics Priority , unable to generate timeseries`
      );
    }

    return liPrimaryID;
  }

  /**
   * Generate Timeseries for Primary ID
   * @param {Order Count per week} lsOrdercount
   * @param {Primary Count per week} liPrimaryIDCount
   * @param {Primary Characteristics} liPrimaryID
   * @param {Sales Characteristic count} liSalesCharCount
   */
  async processPrimaryID(
    lsOrdercount,
    liPrimaryIDCount,
    liPrimaryID,
    liSalesCharCount,
    aPRPIDs,
    adata,
    oPrpIDs
  ) {
    let lsVCHistory = {};
    let bFlg = false;
    let aLocProdPRPIDs = [], aPRPIDs_CONFIG = [];
    let sPPRID = '';
    let oPrimaryCountFilter = {};
    let oPIDs = {};

    lsVCHistory["PERIOD_NUM"] = GenF.parse(lsOrdercount.WEEK_NO);
    lsVCHistory["LOCATION_ID"] = GenF.parse(lsOrdercount.LOCATION_ID);
    lsVCHistory["PRODUCT_ID"] = GenF.parse(lsOrdercount.PRODUCT_ID);

    let liPrimaryCountFilter = [];
    liPrimaryCountFilter = liPrimaryIDCount.filter(function (aObj) {
      return (
        aObj.WEEK_DATE === lsOrdercount.WEEK_DATE &&
        aObj.LOCATION_ID === lsOrdercount.LOCATION_ID &&
        aObj.PRODUCT_ID === lsOrdercount.PRODUCT_ID
      );
    });

    // Get all the clustering data for loc-prod

    let ifindIndex = aPRPIDs.findIndex(
      (o) =>
        o.PRODUCT_ID === lsOrdercount.PRODUCT_ID
    );
    aLocProdPRPIDs = aPRPIDs[ifindIndex];

    // Logic to Append Missing PRPIDs, if they do not exists for a period
    if (aLocProdPRPIDs) {
      for (let prop in aLocProdPRPIDs) {
        sPPRID = prop;
        if (sPPRID !== 'PRODUCT_ID') {
          let ifindIndex = liPrimaryCountFilter.findIndex(
            (o) =>
              String(o.PRIMARY_ID) === sPPRID
          );
          if (ifindIndex === -1) {
            oPrimaryCountFilter.LOCATION_ID = lsOrdercount.LOCATION_ID;
            oPrimaryCountFilter.PRODUCT_ID = lsOrdercount.PRODUCT_ID;
            oPrimaryCountFilter.WEEK_DATE = lsOrdercount.WEEK_DATE;
            oPrimaryCountFilter.PRIMARY_ID = sPPRID;
            oPrimaryCountFilter.ORD_QTY = 0;

            liPrimaryCountFilter.push(GenF.parse(oPrimaryCountFilter));
          }
        }
      }
    }

    for (let i = 0; i < liPrimaryCountFilter.length; i++) {
      aPRPIDs_CONFIG = [];
      sPPRID = '';
      //Process only PRPID's
      if(Object.keys(oPrpIDs).length >0){
        if(!oPrpIDs[liPrimaryCountFilter[i].PRIMARY_ID]){
          continue;
        }
      }
      
      // 
      if (aLocProdPRPIDs) {
        for (let prop in aLocProdPRPIDs) {
          sPPRID = prop;
          if (sPPRID !== 'PRODUCT_ID' && sPPRID === String(liPrimaryCountFilter[i].PRIMARY_ID)) {
            oPIDs = aLocProdPRPIDs[prop];
            //
            aPRPIDs_CONFIG = await cds.run(`SELECT DISTINCT 
                                                    A.CHAR_NUM,
                                                    A.CHAR_VALUE
                                                  FROM V_UNIQUE_ID AS A
                                                  INNER JOIN  CP_CLUSTER_PRPIDS_MAPPED_PIDS AS B
                                                  ON A.UNIQUE_ID = B.PID
                                                  WHERE B.LOCATION_ID = '${adata.LOCATION_ID}'
                                                    AND B.PRODUCT_ID = '${lsOrdercount.PRODUCT_ID}'
                                                    AND (B.PID NOT IN (SELECT DISTINCT PRP_PID
                                                                        FROM CP_PRPIDS
                                                                        WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                                          AND PRODUCT_ID = '${lsOrdercount.PRODUCT_ID}'
                                                                          AND (PRP_PID_TYPE IN (1, 2, 4))))
                                                    AND PRPID = '${sPPRID}'
                                                    ORDER BY CHAR_NUM`);
            break;
          }
        }

      }


      lsVCHistory["TYPE"] = "PI";
      // lsVCHistory["PRODUCT_ID"] = GenF.parse(liPrimaryCountFilter[i].PRODUCT_ID);
      lsVCHistory["GROUP_ID"] = GenF.parse(
        String(liPrimaryCountFilter[i].PRIMARY_ID) + "_1"
      );
      lsVCHistory["GROUP_COUNT"] = parseInt(liPrimaryCountFilter[i].ORD_QTY);



      if (aPRPIDs_CONFIG.length > 0) {
        if (oPIDs) {
          lsVCHistory["GROUP_COUNT"] =0;
          for (let j = 0; j < oPIDs.length; j++) {
            let ifindIndex = liPrimaryCountFilter.findIndex(
              (o) =>
                o.PRIMARY_ID === parseInt(oPIDs[j])
            );           
            if(ifindIndex !== -1) {
              lsVCHistory["GROUP_COUNT"] = parseInt(lsVCHistory["GROUP_COUNT"]) + parseInt(liPrimaryCountFilter[ifindIndex].ORD_QTY);
            }
          }
          // Group Count Rate
          if (lsOrdercount.ORD_QTY > 0) {
            lsVCHistory["GROUP_COUNT_RATE"] = (
              (parseInt(lsVCHistory["GROUP_COUNT"]) /
                parseInt(lsOrdercount.ORD_QTY)) *
              100
            ).toFixed(2);
          } else {
            lsVCHistory["GROUP_COUNT_RATE"] = 0;
          }
        }
      } else {
        if (lsOrdercount.ORD_QTY > 0) {
          lsVCHistory["GROUP_COUNT_RATE"] = (
            (parseInt(liPrimaryCountFilter[i].ORD_QTY) /
              parseInt(lsOrdercount.ORD_QTY)) *
            100
          ).toFixed(2);
        } else {
          lsVCHistory["GROUP_COUNT_RATE"] = 0;
        }
      }

      let lRow = 0;

      // Check if Primary Id is not active
      if (!liPrimaryID[liPrimaryCountFilter[i].PRIMARY_ID]) {
        continue;
      }
      //Remove if any duplicates exists
      const keys = ['CHAR_NUM', 'CHAR_VALUE'];
      liPrimaryID[liPrimaryCountFilter[i].PRIMARY_ID] = GenF.removeDuplicate(liPrimaryID[liPrimaryCountFilter[i].PRIMARY_ID], keys);
      for (
        let cntPID = 0;
        cntPID < liPrimaryID[liPrimaryCountFilter[i].PRIMARY_ID].length;
        cntPID++
      ) {
        lRow = lRow + 1;
        lsVCHistory["ROW"] = GenF.parse(lRow);
        lsVCHistory["CHAR_NUM"] = GenF.parse(
          liPrimaryID[liPrimaryCountFilter[i].PRIMARY_ID][cntPID].CHAR_NUM
        );
        lsVCHistory["ATTRIBUTE"] = GenF.parse("att" + lRow);

        if (aPRPIDs_CONFIG.length > 0) {
          lsVCHistory["CHAR_COUNT"] = 0;
          for (let j = 0; j < aPRPIDs_CONFIG.length; j++) {
            if (aPRPIDs_CONFIG[j].CHAR_NUM === liPrimaryID[liPrimaryCountFilter[i].PRIMARY_ID][cntPID].CHAR_NUM) {
              let findIndex = liSalesCharCount.findIndex(
                (o) =>
                  o.LOCATION_ID === lsOrdercount.LOCATION_ID &&
                  o.PRODUCT_ID === lsOrdercount.PRODUCT_ID &&
                  o.WEEK_DATE === lsOrdercount.WEEK_DATE &&
                  o.CHAR_NUM === liPrimaryID[liPrimaryCountFilter[i].PRIMARY_ID][cntPID].CHAR_NUM &&
                  o.CHAR_VALUE === aPRPIDs_CONFIG[j].CHAR_VALUE
              );
              if (findIndex != -1) {
                lsVCHistory["CHAR_COUNT"] = parseInt(lsVCHistory["CHAR_COUNT"]) + parseInt(liSalesCharCount[findIndex].ORD_QTY);
              } else {
                // lsVCHistory["CHAR_COUNT"] = parseInt(liSalesCharCount[findIndex].ORD_QTY);
              }
            }
          }
        } else {
          let findIndex = liSalesCharCount.findIndex(
            (o) =>
              o.LOCATION_ID === lsOrdercount.LOCATION_ID &&
              o.PRODUCT_ID === lsOrdercount.PRODUCT_ID &&
              o.WEEK_DATE === lsOrdercount.WEEK_DATE &&
              o.CHAR_NUM ===
              liPrimaryID[liPrimaryCountFilter[i].PRIMARY_ID][cntPID].CHAR_NUM &&
              o.CHAR_VALUE ===
              liPrimaryID[liPrimaryCountFilter[i].PRIMARY_ID][cntPID].CHAR_VALUE
          );
          if (findIndex != -1) {
            lsVCHistory["CHAR_COUNT"] = parseInt(
              liSalesCharCount[findIndex].ORD_QTY
            );
          } else {
            lsVCHistory["CHAR_COUNT"] = 0;
          }
        }

        if (lsOrdercount.ORD_QTY > 0) {
          lsVCHistory["CHAR_COUNT_RATE"] = (
            (parseInt(lsVCHistory["CHAR_COUNT"]) /
              parseInt(lsOrdercount.ORD_QTY)) *
            100
          ).toFixed(2);
        }

        this.iVCHistory.push(GenF.parse(lsVCHistory));
      }
    }
  }

  /**
     * Generate Timeseries for Planning Relevant Primary ID
     * @param {Order Count per week} lsOrdercount
     * @param {Planning Relevant Primary Ids} liPRPIDS
     */
  async processPRPIDs(lsOrdercount, aPRPIDs_PIDs) {
    let aVCHistory = [], aFilVCHistory = [], aFinVCHistory = [];
    let aLocProdPRPIDs = [];
    let aDistPRPIDs = [];
    let oVCHistory = {}, sGroup_Id = '';

    aVCHistory = this.iVCHistory;
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
      // console.log(sPPRID);
      if (sPPRID !== 'PRODUCT_ID') {
        let aFilMappedPids = [];
        aFilMappedPids = aLocProdPRPIDs[sPPRID];

        oVCHistory["PERIOD_NUM"] = GenF.parse(lsOrdercount.WEEK_NO);
        oVCHistory["LOCATION_ID"] = GenF.parse(lsOrdercount.LOCATION_ID);
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
              oVCHistory["ROW"] = aFilVCHistory[iHis].ROW;
              oVCHistory["ATTRIBUTE"] = aFilVCHistory[iHis].ATTRIBUTE;
              oVCHistory["CHAR_NUM"] = aFilVCHistory[iHis].CHAR_NUM;

              if (sGroup_Id === oVCHistory["GROUP_ID"]) {
                oVCHistory["CHAR_COUNT"] = aFilVCHistory[iHis].CHAR_COUNT;
                oVCHistory["CHAR_COUNT_RATE"] = aFilVCHistory[iHis].CHAR_COUNT_RATE;
              } else {
                oVCHistory["CHAR_COUNT"] = 1;
                oVCHistory["CHAR_COUNT_RATE"] = 100;
              }

              oVCHistory["GROUP_COUNT"] = aFilVCHistory[iHis].GROUP_COUNT;
              oVCHistory["GROUP_COUNT_RATE"] = 0;
              aFinVCHistory.push(GenF.parse(oVCHistory));
            } else {
              if (sGroup_Id === oVCHistory["GROUP_ID"]) {
                aFinVCHistory[ifindIndex]["CHAR_COUNT"] = aFilVCHistory[iHis].CHAR_COUNT;
                aFinVCHistory[ifindIndex]["CHAR_COUNT_RATE"] = aFilVCHistory[iHis].CHAR_COUNT_RATE;
              }
              // aFinVCHistory[ifindIndex]["CHAR_COUNT"] = parseInt(aFinVCHistory[ifindIndex].CHAR_COUNT) + parseInt(aFilVCHistory[iHis].CHAR_COUNT);
              // aFinVCHistory[ifindIndex]["CHAR_COUNT_RATE"] = 0;
              aFinVCHistory[ifindIndex]["GROUP_COUNT"] = parseInt(aFinVCHistory[ifindIndex].GROUP_COUNT) + parseInt(aFilVCHistory[iHis].GROUP_COUNT);
              aFinVCHistory[ifindIndex]["GROUP_COUNT_RATE"] = 0;
            }


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
        // Char Count Rate
        // if (lsOrdercount.ORD_QTY > 0) {
        //   // aHist["CHAR_COUNT_RATE"] = (
        //   //   (parseInt(aHist["CHAR_COUNT"]) /
        //   //     parseInt(lsOrdercount.ORD_QTY)) *
        //   //   100
        //   // ).toFixed(2);
        //   aHist["CHAR_COUNT_RATE"] = (
        //     (parseInt(aHist["CHAR_COUNT"]) /
        //       parseInt(lsOrdercount.ORD_QTY))
        //   ).toFixed(2);
        // }

        // Group Count Rate
        if (lsOrdercount.ORD_QTY > 0) {
          aHist["GROUP_COUNT_RATE"] = (
            (parseInt(aHist["GROUP_COUNT"]) /
              parseInt(lsOrdercount.ORD_QTY)) *
            100
          ).toFixed(2);
        }

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
        oVCHistory["LOCATION_ID"] = GenF.parse(lsOrdercount.LOCATION_ID);
        oVCHistory["PRODUCT_ID"] = GenF.parse(lsOrdercount.PRODUCT_ID);
        oVCHistory["TYPE"] = 'PI';
        oVCHistory["GROUP_ID"] = aFilVCHistory[index].GROUP_ID;
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

    this.iVCHistory = aFinVCHistory;

  }

  /**
   * Generate Timeseries for Object Dependency
   * @param {Order Count per week} lsOrdercount
   * @param {Unique ID Count per week} liUniqueCount
   * @param {Unique ID Characteristics} liUniqueID
   * @param {Object Dependency} liOD,
   * @param {Sales Characteristic count} liSalesCharCount
   */
  async processObjectDependency(
    lsOrdercount,
    liUniqueCount,
    liUniqueID,
    liOD,
    liSalesCharCount
  ) {
    let lsVCHistory = {};

    lsVCHistory["PERIOD_NUM"] = GenF.parse(lsOrdercount.WEEK_NO);
    lsVCHistory["LOCATION_ID"] = GenF.parse(lsOrdercount.LOCATION_ID);
    lsVCHistory["PRODUCT_ID"] = GenF.parse(lsOrdercount.PRODUCT_ID);

    let liUniqueCountWeek = [];
    liUniqueCountWeek = liUniqueCount.filter(function (aObj) {
      return (
        aObj.WEEK_DATE === lsOrdercount.WEEK_DATE &&
        aObj.LOCATION_ID === lsOrdercount.LOCATION_ID &&
        aObj.PRODUCT_ID === lsOrdercount.PRODUCT_ID
      );
    });

    for (let cntOD = 0; cntOD < liOD.length; cntOD++) {
      lsVCHistory["TYPE"] = "OD";
      lsVCHistory["GROUP_ID"] = GenF.parse(
        String(liOD[cntOD].OBJ_DEP) +
        "_" +
        String(liOD[cntOD].OBJ_COUNTER)
      );
      lsVCHistory["GROUP_COUNT"] = 0;

      var aBomData = await cds.run(`SELECT * FROM "CP_BOM_OD_DEP" WHERE DEPENDENCY='${liOD[cntOD].OBJ_DEP}' ORDER BY LINE_NO`)
      // Check if Unique ID is successful for this object Dependency
      let aODData = procsObj.odBreakDown(aBomData);
      for (let cntUni = 0; cntUni < liUniqueCountWeek.length; cntUni++) {
        let liUniqueChar = liUniqueID[liUniqueCountWeek[cntUni].UNIQUE_ID];
        let lUniFail = "";
        // for (let cntODC = 0; cntODC < liOD[cntOD]["CHAR"].length; cntODC++) {
        //   const lsOD = liOD[cntOD]["CHAR"][cntODC];
        //   let findIndex = -1;
        //   findIndex = liUniqueChar.findIndex(
        //     (o) => o.CHAR_NUM === lsOD["CHAR_NUM"]
        //   );
        //   if (findIndex !== -1) {
        //     switch (lsOD.OD_CONDITION) {
        //       case "EQ":
        //         if (lsOD.CHAR_VALUE !== liUniqueChar[findIndex].CHAR_VALUE) {
        //           lUniFail = "X";
        //         } else {
        //           lUniFail = '';
        //         }
        //         break;
        //       case "NE":
        //         if (lsOD.CHAR_VALUE === liUniqueChar[findIndex].CHAR_VALUE) {
        //           lUniFail = "X";
        //         } else {
        //           lUniFail = '';
        //         }
        //         break;
        //       default:
        //         break;
        //     }
        //   }
        //   if (
        //     lsOD.CHAR_COUNTER !==
        //     liOD[cntOD]["CHAR"][GenF.addOne(cntODC, liOD[cntOD]["CHAR"].length)].CHAR_COUNTER
        //   ) {
        //     // Check if there is an OR Condition
        //     lUniFail = "X";
        //   }
        //   else {
        //     if (cntODC === GenF.addOne(cntODC, liOD[cntOD]['CHAR'].length)) {
        //     } else {
        //       lUniFail = '';
        //     }
        //   }

        // }
        // if (lUniFail === "") {
        //   lsVCHistory["GROUP_COUNT"] =
        //     (parseFloat(lsVCHistory["GROUP_COUNT"]) + parseFloat(liUniqueCountWeek[cntUni].ORD_QTY)).toFixed(3);
        // }
        // if(lsVCHistory["PERIOD_NUM"] == '202430' && lsVCHistory['GROUP_ID'] =='000000055240208062-002590_1'){

        // if(procsObj.processDependency(aBomData,liUniqueChar)){
        //   lsVCHistory["GROUP_COUNT"] =
        //       (parseFloat(lsVCHistory["GROUP_COUNT"]) + parseFloat(liUniqueCountWeek[cntUni].ORD_QTY)).toFixed(3);
        // }

        if (procsObj.odProcess(aODData, liUniqueChar)) {
          lsVCHistory["GROUP_COUNT"] =
            (parseFloat(lsVCHistory["GROUP_COUNT"]) + parseFloat(liUniqueCountWeek[cntUni].ORD_QTY)).toFixed(3);
        }
        // }
      }

      if (lsOrdercount.ORD_QTY > 0) {
        lsVCHistory["GROUP_COUNT_RATE"] = (
          (parseInt(lsVCHistory["GROUP_COUNT"]) /
            parseInt(lsOrdercount.ORD_QTY)) *
          100
        ).toFixed(2);
      }


      for (let cntODC = 0; cntODC < liOD[cntOD]["CHAR"].length; cntODC++) {
        let lsOD = liOD[cntOD]["CHAR"][cntODC];


        lsVCHistory["ROW"] = GenF.parse(lsOD.ROW_ID);
        lsVCHistory["CHAR_NUM"] = GenF.parse(lsOD.CHAR_NUM);
        lsVCHistory["ATTRIBUTE"] = GenF.parse("att" + lsOD.ROW_ID);
        lsVCHistory["CHAR_COUNT"] = 0;

        let findIndex = -1;
        findIndex = liSalesCharCount.findIndex(
          (o) =>
            o.LOCATION_ID === lsOrdercount.LOCATION_ID &&
            o.PRODUCT_ID === lsOrdercount.PRODUCT_ID &&
            o.WEEK_DATE === lsOrdercount.WEEK_DATE &&
            o.CHAR_NUM === lsOD.CHAR_NUM &&
            o.CHAR_VALUE === lsOD.CHAR_VALUE
        );
        if (findIndex !== -1) {
          switch (lsOD.OD_CONDITION) {
            case "EQ":
              lsVCHistory["CHAR_COUNT"] = liSalesCharCount[findIndex].ORD_QTY;
              break;
            case "NE":
              lsVCHistory["CHAR_COUNT"] =
                lsOrdercount.ORD_QTY - liSalesCharCount[findIndex].ORD_QTY;
              break;
            default:
              break;
          }
        }

        if (lsOrdercount.ORD_QTY > 0) {
          lsVCHistory["CHAR_COUNT_RATE"] = (
            (parseInt(lsVCHistory["CHAR_COUNT"]) /
              parseInt(lsOrdercount.ORD_QTY)) *
            100
          ).toFixed(2);
        }

        let ifindIndexVC = -1;
        ifindIndexVC = this.iVCHistory.findIndex(
          (o) =>
            o.PERIOD_NUM === lsVCHistory.PERIOD_NUM &&
            o.LOCATION_ID === lsVCHistory.LOCATION_ID &&
            o.PRODUCT_ID === lsVCHistory.PRODUCT_ID &&
            o.TYPE === lsVCHistory.TYPE &&
            o.GROUP_ID === lsVCHistory.GROUP_ID &&
            o.ROW === lsVCHistory.ROW &&
            o.ATTRIBUTE === lsVCHistory.ATTRIBUTE &&
            o.CHAR_NUM === lsVCHistory.CHAR_NUM
        );

        if (ifindIndexVC === -1) {
          this.iVCHistory.push(GenF.parse(lsVCHistory));
        }
        else {
          if (lsVCHistory.CHAR_COUNT != 0) {//only replace if it is a success case
            this.iVCHistory[ifindIndexVC] = GenF.parse(lsVCHistory);
          }
        }
      }
    }
  }


  /**
   * Generate Timeseries for Object Dependency
   * @param {Order Count per week} lsOrdercount
   * @param {Unique ID Count per week} liUniqueCount
   * @param {Unique ID Characteristics} liUniqueID
   * @param {Restrictions} liRestrictions,
   * @param {Sales Characteristic count} liSalesCharCount
   */
  processRestrictions(
    lsOrdercount,
    liUniqueCount,
    liUniqueID,
    liRestrictions,
    liSalesCharCount
  ) {
    let lsVCHistory = {};

    lsVCHistory["PERIOD_NUM"] = GenF.parse(lsOrdercount.WEEK_NO);
    lsVCHistory["LOCATION_ID"] = GenF.parse(lsOrdercount.LOCATION_ID);
    lsVCHistory["PRODUCT_ID"] = GenF.parse(lsOrdercount.PRODUCT_ID);

    let liUniqueCountWeek = [];
    liUniqueCountWeek = liUniqueCount.filter(function (aObj) {
      return (
        aObj.WEEK_DATE === lsOrdercount.WEEK_DATE &&
        aObj.LOCATION_ID === lsOrdercount.LOCATION_ID &&
        aObj.PRODUCT_ID === lsOrdercount.PRODUCT_ID
      );
    });

    for (let cntOD = 0; cntOD < liRestrictions.length; cntOD++) {
      lsVCHistory["TYPE"] = "RT";
      lsVCHistory["GROUP_ID"] = GenF.parse(
        String(liRestrictions[cntOD].RESTRICTION) +
        "_" +
        String(liRestrictions[cntOD].RTR_COUNTER)
      );
      lsVCHistory["GROUP_COUNT"] = 0;

      // Check if Unique ID is successful for this object Dependency
      for (let cntUni = 0; cntUni < liUniqueCountWeek.length; cntUni++) {
        let liUniqueChar = liUniqueID[liUniqueCountWeek[cntUni].UNIQUE_ID];
        let lUniFail = "";
        for (let i = 0; i < liRestrictions.length; i++) {
          for (let cntODC = 0; cntODC < liRestrictions[i]["CHAR"].length; cntODC++) {
            const lsOD = liRestrictions[i]["CHAR"][cntODC];
            let findIndex = liUniqueChar.findIndex(
              (o) => o.CHAR_NUM === lsOD["CHAR_NUM"]
            );
            if (findIndex != -1) {
              switch (lsOD.OD_CONDITION) {
                case "EQ":
                  if (lsOD.CHAR_VALUE !== liUniqueChar[findIndex].CHAR_VALUE) {
                    lUniFail = "X";
                  } else {
                    lUniFail = '';
                  }
                  break;
                case "NE":
                  if (lsOD.CHAR_VALUE === liUniqueChar[findIndex].CHAR_VALUE) {
                    lUniFail = "X";
                  } else {
                    lUniFail = '';
                  }
                  break;
                default:
                  break;
              }
            }
            if (
              lsOD.CHAR_COUNTER !==
              liRestrictions[i]["CHAR"][GenF.addOne(cntODC, liRestrictions[i]["CHAR"].length)].CHAR_COUNTER
            ) {
              // Check if there is an OR Condition
              lUniFail = "X";
            } else {
              lUniFail = "";
            }
          }
        }

        if ((lUniFail = "")) {
          lsVCHistory["GROUP_COUNT"] =
            lsVCHistory["GROUP_COUNT"] + liUniqueCountWeek[cntUni].ORD_QTY;
        }
      }

      if (lsOrdercount.ORD_QTY > 0) {
        lsVCHistory["GROUP_COUNT_RATE"] = (
          (parseInt(lsVCHistory["GROUP_COUNT"]) /
            parseInt(lsOrdercount.ORD_QTY)) *
          100
        ).toFixed(2);
      }
      for (let i = 0; i < liRestrictions.length; i++) {
        for (let cntODC = 0; cntODC < liRestrictions[i]["CHAR"].length; cntODC++) {
          let lsRestrictions = liRestrictions[i]["CHAR"][cntODC];

          lsVCHistory["ROW"] = GenF.parse(lsRestrictions.ROW_ID);
          lsVCHistory["CHAR_NUM"] = GenF.parse(lsRestrictions.CHAR_NUM);
          lsVCHistory["ATTRIBUTE"] = GenF.parse("att" + lsRestrictions.ROW_ID);
          lsVCHistory["CHAR_COUNT"] = 0;

          let findIndex = liSalesCharCount.findIndex(
            (o) =>
              o.LOCATION_ID === lsOrdercount.LOCATION_ID &&
              o.PRODUCT_ID === lsOrdercount.PRODUCT_ID &&
              o.WEEK_DATE === lsOrdercount.WEEK_DATE &&
              o.CHAR_NUM === lsRestrictions.CHAR_NUM &&
              o.CHAR_VALUE === lsRestrictions.CHAR_VALUE
          );
          if (findIndex != - 1) {
            switch (lsRestrictions.OD_CONDITION) {
              case "EQ":
                lsVCHistory["CHAR_COUNT"] = liSalesCharCount[findIndex].ORD_QTY;
                break;
              case "NE":
                lsVCHistory["CHAR_COUNT"] =
                  lsOrdercount.ORD_QTY - liSalesCharCount[findIndex].ORD_QTY;
                break;
              default:
                break;
            }
          }


          if (lsOrdercount.ORD_QTY > 0) {
            lsVCHistory["CHAR_COUNT_RATE"] = (
              (parseInt(lsVCHistory["CHAR_COUNT"]) /
                parseInt(lsOrdercount.ORD_QTY)) *
              100
            ).toFixed(2);
          }

          let ifindIndexVC = -1;
          ifindIndexVC = this.iVCHistory.findIndex(
            (o) =>
              o.PERIOD_NUM === lsVCHistory.PERIOD_NUM &&
              o.LOCATION_ID === lsVCHistory.LOCATION_ID &&
              o.PRODUCT_ID === lsVCHistory.PRODUCT_ID &&
              o.TYPE === lsVCHistory.TYPE &&
              o.GROUP_ID === lsVCHistory.GROUP_ID &&
              o.ROW === lsVCHistory.ROW &&
              o.ATTRIBUTE === lsVCHistory.ATTRIBUTE &&
              o.CHAR_NUM === lsVCHistory.CHAR_NUM
          );

          if (ifindIndexVC === -1) {
            this.iVCHistory.push(lsVCHistory);
          }
        }
      }
    }
  }

  /**
   * Get object Dependency
   * @param {Location} lLocation
   * @returns
   */
  async getObjectDependency(lLocation, lProduct) {
    let liOD = [], aObjDep = [], liODChar = [];

    // let aODData = await cds.run(`SELECT DISTINCT 
    //   OBJ_DEP,
    //   COUNT(DISTINCT CHAR_NUM) AS COUNT
    //   FROM V_OBDHDR_M
    //   WHERE LOCATION_ID = '${lLocation}'
    //     AND PRODUCT_ID = '${lProduct}'
    //   GROUP BY LOCATION_ID,
    //           PRODUCT_ID,
    //           OBJ_DEP
    //   ORDER BY OBJ_DEP`)
    let aODData = await cds.run(`SELECT DISTINCT 
      OBJ_DEP,
      COUNT(DISTINCT CHAR_NUM) AS COUNT
      FROM V_OBDHDR_M
      WHERE LOCATION_ID = '${lLocation}'
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
    }
    if (aObjDep.length > 0) {
      // Get Object Dependency
      // liODChar = await cds.run(
      //   `SELECT DISTINCT OBJ_DEP,
      //                       OBJ_COUNTER,
      //                       CHAR_NUM,
      //                       CHAR_VALUE,
      //                       OD_CONDITION,
      //                       CHAR_COUNTER
      //                   FROM "V_OBDHDR_M"
      //                   WHERE LOCATION_ID = '${lLocation}'
      //                       AND PRODUCT_ID  = '${lProduct}'
      //                       ORDER BY OBJ_DEP,
      //                               OBJ_COUNTER,
      //                               CHAR_COUNTER`
      // );
      liODChar = await cds.run(
        `SELECT DISTINCT OBJ_DEP,
                            OBJ_COUNTER,
                            CHAR_NUM,
                            CHAR_VALUE,
                            OD_CONDITION,
                            CHAR_COUNTER
                        FROM "V_OBDHDR_M"
                        WHERE LOCATION_ID = '${lLocation}'
                            ORDER BY OBJ_DEP,
                                    OBJ_COUNTER,
                                    CHAR_COUNTER`
      );
      if (liODChar.length > 0) {
        let aFilODChar = [];
        aFilODChar = liODChar.filter((i) => aObjDep.indexOf(i.OBJ_DEP) !== -1);

        liODChar = aFilODChar;
      }
    }



    let lsOD = {};
    let lRowID = 0;

    for (let cntODC = 0; cntODC < liODChar.length; cntODC++) {
      if (
        cntODC === 0 ||
        liODChar[cntODC].OBJ_DEP !== liODChar[GenF.subOne(cntODC)].OBJ_DEP ||
        liODChar[cntODC].OBJ_COUNTER !==
        liODChar[GenF.subOne(cntODC)].OBJ_COUNTER
      ) {
        lsOD = {};
        lsOD["OBJ_DEP"] = GenF.parse(liODChar[cntODC].OBJ_DEP);
        lsOD["OBJ_COUNTER"] = GenF.parse(liODChar[cntODC].OBJ_COUNTER);
        lsOD["CHAR"] = []; // Maintain Characteristic condition
        lsOD["CHAR_UNI"] = []; // Maintain Characteristics only once
        lRowID = 1;
      }
      let lsODC = {};
      lsODC["CHAR_COUNTER"] = GenF.parse(liODChar[cntODC].CHAR_COUNTER);
      lsODC["CHAR_NUM"] = GenF.parse(liODChar[cntODC].CHAR_NUM);
      lsODC["CHAR_VALUE"] = GenF.parse(liODChar[cntODC].CHAR_VALUE);
      lsODC["OD_CONDITION"] = GenF.parse(liODChar[cntODC].OD_CONDITION);
      lsODC["ROW_ID"] = 1;

      if (lsOD["CHAR"].length === 0) {
        let lsCharUni = {};
        lsCharUni["CHAR_NUM"] = lsODC["CHAR_NUM"];
        lsCharUni["ORD_QTY"] = 0;
        lsOD["CHAR_UNI"].push(GenF.parse(lsCharUni));

        lsODC["ROW_ID"] = lRowID;
        lRowID = lRowID + 1;
      } else {
        let findIndex = lsOD["CHAR"].findIndex(
          (o) => o.CHAR_NUM === lsODC["CHAR_NUM"]
        );
        if (findIndex !== -1) {
          lsODC["ROW_ID"] = parseInt(lsOD["CHAR"][findIndex].ROW_ID);
        } else {
          lsODC["ROW_ID"] = lRowID;
          lRowID = lRowID + 1;
        }
      }

      lsOD["CHAR"].push(GenF.parse(lsODC));

      if (
        cntODC == GenF.addOne(cntODC, liODChar.length) ||
        liODChar[cntODC].OBJ_DEP !==
        liODChar[GenF.addOne(cntODC, liODChar.length)].OBJ_DEP ||
        liODChar[cntODC].OBJ_COUNTER !==
        liODChar[GenF.addOne(cntODC, liODChar.length)].OBJ_COUNTER
      ) {
        liOD.push(lsOD);
      }
    }

    return liOD;
  }

  /**
   * Get Restrictions
   * @param {Location} lLocation
   * @returns
   */
  async getRestrictions(lLocation, lProduct) {
    let liRestrictionsOut = [];

    // Get Restrictions
    const liRestrictions = await cds.run(
      `SELECT DISTINCT RESTRICTION,
                      RTR_COUNTER,
                      CHAR_NUM,
                      CHAR_VALUE,
                      OD_CONDITION,
                      CHAR_COUNTER
      FROM "V_LOCPRODRT_DETAILS"
      WHERE LOCATION_ID = '${lLocation}'
          AND PRODUCT_ID  = '${lProduct}'
          AND VALID_TO > '${this.vCurrDate}'
          ORDER BY RESTRICTION,
                   RTR_COUNTER,
                   CHAR_COUNTER`
    );

    let lsRestriction = {};
    let lRowID = 0;

    for (let cntODC = 0; cntODC < liRestrictions.length; cntODC++) {
      if (
        cntODC === 0 ||
        liRestrictions[cntODC].RESTRICTION !== liRestrictions[GenF.subOne(cntODC)].RESTRICTION ||
        liRestrictions[cntODC].RTR_COUNTER !==
        liRestrictions[GenF.subOne(cntODC)].RTR_COUNTER
      ) {
        lsRestriction = {};
        lsRestriction["RESTRICTION"] = GenF.parse(liRestrictions[cntODC].RESTRICTION);
        lsRestriction["RTR_COUNTER"] = GenF.parse(liRestrictions[cntODC].RTR_COUNTER);
        lsRestriction["CHAR"] = []; // Maintain Characteristic condition
        lsRestriction["CHAR_UNI"] = []; // Maintain Characteristics only once
        lRowID = 0;
      }
      let lsRestrictionC = {};
      lsRestrictionC["CHAR_COUNTER"] = GenF.parse(liRestrictions[cntODC].CHAR_COUNTER);
      lsRestrictionC["CHAR_NUM"] = GenF.parse(liRestrictions[cntODC].CHAR_NUM);
      lsRestrictionC["CHAR_VALUE"] = GenF.parse(liRestrictions[cntODC].CHAR_VALUE);
      lsRestrictionC["OD_CONDITION"] = GenF.parse(liRestrictions[cntODC].OD_CONDITION);
      lsRestrictionC["ROW_ID"] = 1;

      if (lsRestriction["CHAR"].length === 0) {
        let lsCharUni = {};
        lsCharUni["CHAR_NUM"] = lsRestrictionC["CHAR_NUM"];
        lsCharUni["ORD_QTY"] = 0;
        lsRestriction["CHAR_UNI"].push(GenF.parse(lsCharUni));

        lsRestrictionC["ROW_ID"] = lRowID;
        lRowID = lRowID + 1;
      } else {
        let findIndex = lsRestriction["CHAR"].findIndex(
          (o) => o.CHAR_NUM === lsRestrictionC["CHAR_NUM"]
        );
        if (findIndex != -1) {
          lsRestrictionC["ROW_ID"] = parseInt(lsRestriction["CHAR"][findIndex].ROW_ID);
        } else {
          lsRestrictionC["ROW_ID"] = lRowID;
          lRowID = lRowID + 1;
        }
      }

      lsRestriction["CHAR"].push(GenF.parse(lsRestrictionC));

      if (
        cntODC == GenF.addOne(cntODC, liRestrictions.length) ||
        liRestrictions[cntODC].RESTRICTION !==
        liRestrictions[GenF.addOne(cntODC, liRestrictions.length)].RESTRICTION ||
        liRestrictions[cntODC].RTR_COUNTER !==
        liRestrictions[GenF.addOne(cntODC, liRestrictions.length)].RTR_COUNTER
      ) {
        liRestrictionsOut.push(lsRestriction);
      }
    }

    return liRestrictionsOut;
  }
async generateTimeseriesF(adata, req, Flag,lastMonday) {
    var oReturn = {
      bError: false,
      message: ''
    }
 
 
    let firmPeriods = await GenF.getParameterValue(adata.LOCATION_ID,9)
    let firmStartDate = lastMonday;
    if(firmPeriods){
  firmStartDate = await GenF.addDays(lastMonday, 7* parseInt(firmPeriods));
    }
    var sError='';
    /** Get Future Plan */
    const liFutureCharPlan = await cds.run(
      `SELECT *
                                                 FROM "CP_IBP_FCHARPLAN"
                                                WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                                                  AND "PRODUCT_ID" = '${adata.PRODUCT_ID}'
                                                  AND "VERSION" = '${adata.VERSION}'
                                                  AND "SCENARIO" = '${adata.SCENARIO}'
                                                  AND "MODEL_VERSION" = '${adata.MODEL_VERSION}'
                                                  AND "WEEK_DATE">='${firmStartDate}'
                                             ORDER BY LOCATION_ID, 
                                                      PRODUCT_ID, 
                                                      VERSION,
                                                      SCENARIO,
                                                      MODEL_VERSION,
                                                      WEEK_DATE`
    );
    const liFutureDemand = await cds.run(`SELECT * 
                                            FROM "CP_IBP_FUTUREDEMAND" 
                                           WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                                             AND "PRODUCT_ID" = '${adata.PRODUCT_ID}'
                                             AND "VERSION" = '${adata.VERSION}'
                                             AND "SCENARIO" = '${adata.SCENARIO}'
                                               AND "WEEK_DATE">='${firmStartDate}'`);

    //Making as objects for optimization
    var oFutureDemand = {};
    for (let x = 0; x < liFutureDemand.length; x++) {
      let { WEEK_DATE, QUANTITY } = liFutureDemand[x];
      oFutureDemand[WEEK_DATE] ??= {};
      oFutureDemand[WEEK_DATE]["DEMAND_QTY"] = QUANTITY;
    }

    for (let x = 0; x < liFutureCharPlan.length; x++) {
      let { WEEK_DATE, CHAR_NUM, CHARVAL_NUM, OPT_QTY } = liFutureCharPlan[x];

      oFutureDemand[WEEK_DATE] ??= {};
      oFutureDemand[WEEK_DATE]["OPT_QTY"] ??= {};
      oFutureDemand[WEEK_DATE]["OPT_QTY"][CHAR_NUM] ??= {};
      oFutureDemand[WEEK_DATE]["OPT_QTY"][CHAR_NUM][CHARVAL_NUM] = parseFloat(OPT_QTY);
    }



    // Delete previous data less than current Date
    var vDate = new Date().toISOString().split('T')[0];
    await DELETE.from('CP_TS_OBJDEP_CHARHDR_F')
      .where(`LOCATION_ID = '${adata.LOCATION_ID}' 
                        AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                        AND VERSION = '${adata.VERSION}'
                        AND SCENARIO = '${adata.SCENARIO}'
                        AND MODEL_VERSION = '${adata.MODEL_VERSION}'
                        AND CAL_DATE < '${vDate}'`);

    await DELETE.from('CP_TS_OBJDEP_CHARHDR_F')
      .where(`LOCATION_ID = '${adata.LOCATION_ID}' 
                        AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                        AND VERSION = '${adata.VERSION}'
                        AND SCENARIO = '${adata.SCENARIO}'
                        AND MODEL_VERSION = '${adata.MODEL_VERSION}'
                        AND OBJ_TYPE = 'PI'`);

    // Get Planning Relevant Primary Ids
    const liPRPIDs_PIDs = await cds.run(`SELECT DISTINCT LOCATION_ID,
                                                         PRODUCT_ID,
                                                         PRPID,
                                                         PID
                                                    FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS
                                                   WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                     AND PRODUCT_ID  = '${adata.PRODUCT_ID}'
                                                     AND PID NOT IN (SELECT DISTINCT PRP_PID 
                                                                                FROM CP_PRPIDS 
                                                                               WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                                                 AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                                                                 AND PRP_PID_TYPE IN (1,2,4)	)`);


    var oPRPIDs_PIDs = {};
    /*
     for (let x = 0; x < liPRPIDs_PIDs.length; x++) {
      oPRPIDs_PIDs[liPRPIDs_PIDs[x].PRPID] ??= [];
      oPRPIDs_PIDs[liPRPIDs_PIDs[x].PRPID].push(liPRPIDs_PIDs[x]);
    }
      */

    for (let x = 0; x < liPRPIDs_PIDs.length; x++) {
      oPRPIDs_PIDs[liPRPIDs_PIDs[x].PID] = liPRPIDs_PIDs[x].PRPID;
    }

    // Begin of VP-1091 Changes
    let bProcess = true;
    bProcess = await this.refreshZeroDemandData(adata, bProcess);
    if (bProcess === false) {
      Flag = 'W';
    } else {
      // End Of VP-1091 Changes 
      let lMainProduct = await GenF.getConfigProd(adata.LOCATION_ID, adata.PRODUCT_ID);

      const liPrimaryIDMain = await cds.run(`SELECT "UNIQUE_ID",
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
                                                                                    AND    (CHAR_NUM,CHAR_VALUE) NOT IN (SELECT DISTINCT CHAR_NUM,
                                                                                                                                          CHAR_VALUE 
                                                                                                                                    FROM "V_PARTIALPRODCHAR" 
                                                                                                                                   WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                                                                                                                                     AND "PRODUCT_ID" = '${adata.PRODUCT_ID}'
                                                                                                                                    AND CONFIGPROD_CHK IS NULL )                                             
                                                                        ORDER BY    
                                                                            "UNIQUE_ID" ASC, 
                                                                            "CHAR_NUM" ASC;`);

      var oPrimaryID = {};
      for (let x = 0; x < liPrimaryIDMain.length; x++) {
        var key = liPrimaryIDMain[x].UNIQUE_ID;
        if (!oPrimaryID[key]) {
          oPrimaryID[key] = [];
        }
        oPrimaryID[key].push(liPrimaryIDMain[x]);
      }

      // Validity Dates Check
      // let liUniqPrimaryIds = await cds.run(`SELECT DISTINCT CP_UNIQUEID_RULE_VALIDITY.UNIQUE_ID,
      //                   CP_UNIQUEID_RULE_VALIDITY.VALID_FROM,
      //                   CP_UNIQUEID_RULE_VALIDITY.VALID_TO,
      //                   CP_SALES_HM.PRIMARY_ID
      //     FROM CP_UNIQUEID_RULE_VALIDITY
      //     INNER JOIN CP_SALES_HM
      //       ON CP_SALES_HM.UNIQUE_ID = CP_UNIQUEID_RULE_VALIDITY.UNIQUE_ID
      //    WHERE CP_SALES_HM.LOCATION_ID = '${adata.LOCATION_ID}'
      //      AND CP_SALES_HM.PRODUCT_ID = '${adata.PRODUCT_ID}'
      //      AND CP_UNIQUEID_RULE_VALIDITY.VALID_TO >= '${vDate}'`);

      var liObjdepF = [], aFinal = [];
      if (liFutureCharPlan.length == 0) {
        Flag = 'W';
      }
      else {
        /*        
                for (let x = 0; x < Object.keys(oPrimaryID).length; x++) {
                  let el = Object.keys(oPrimaryID)[x], aFilUniqPrimaryIds = [];
        
                  liObjdepF = [];
                  for (let y = 0; y < liFutureDemand.length; y++) {
                    //   aFilUniqPrimaryIds = liUniqPrimaryIds.filter(function (aPID) {
                    //     return aPID.PRIMARY_ID === el
                    //         && aPID.VALID_FROM <= liFutureDemand[y].WEEK_DATE
                    //         && aPID.VALID_TO >= liFutureDemand[y].WEEK_DATE;
                    // });
                    
                    // if (aFilUniqPrimaryIds.length > 0) {
                    let lRowID = 0;
                    //Loop characteristics
                    for (let z = 0; z < oPrimaryID[el].length; z++) {
                      let oRec = oPrimaryID[el][z];
                      let lsObjdepF = {};
                      lRowID = parseInt(lRowID) + 1;
                      lsObjdepF.CAL_DATE = GenF.parse(liFutureDemand[y].WEEK_DATE);
                      lsObjdepF.LOCATION_ID = GenF.parse(adata.LOCATION_ID);
                      lsObjdepF.PRODUCT_ID = GenF.parse(adata.PRODUCT_ID);
                      lsObjdepF.VERSION = GenF.parse(adata.VERSION);
                      lsObjdepF.SCENARIO = GenF.parse(adata.SCENARIO);
                      lsObjdepF.OBJ_TYPE = "PI";
                      lsObjdepF.OBJ_DEP = GenF.parse(String(el));
                      lsObjdepF.OBJ_COUNTER = 1;
                      lsObjdepF.ROW_ID = GenF.parse(lRowID);
                      lsObjdepF.CHAR_NUM = GenF.parse(oRec.CHAR_NUM);
                      lsObjdepF.SUCCESS = oFutureDemand[liFutureDemand[y].WEEK_DATE]?.["OPT_QTY"]?.[oRec.CHAR_NUM]?.[oRec.CHAR_VALUE];
                      //Adding new property
                      lsObjdepF.FLAG = false;
                      //future Demand Qty
                      let DemandQty = oFutureDemand[liFutureDemand[y].WEEK_DATE]?.["DEMAND_QTY"];
                      if (DemandQty > 0 && lsObjdepF.SUCCESS) {
                        lsObjdepF.SUCCESS_RATE = (parseFloat(lsObjdepF.SUCCESS) * 100 / parseInt(DemandQty)).toFixed(2);
                        liObjdepF.push(GenF.parse(lsObjdepF));
                      }
                    }
        
                    // }
        
                    if (liObjdepF.length > 0) {
                      let lsDemand =
                      {
                        "QUANTITY": oFutureDemand[liFutureDemand[y].WEEK_DATE]["DEMAND_QTY"]
                      }
                      if (liPRPIDs_PIDs.length > 0) {
                        liObjdepF = await this.processTSFPRPIDs(adata, liObjdepF, liPRPIDs_PIDs, liFutureDemand[y].WEEK_DATE, lsDemand,oPRPIDs_PIDs);
                      }
                      Array.prototype.push.apply(aFinal, liObjdepF);
                      liObjdepF = [];
                    }
                  }
        
                }
        */
        // Loop thorugh primary ID
        let lPIDQty = {};
        for (let x = 0; x < Object.keys(oPrimaryID).length; x++) {
          let el = Object.keys(oPrimaryID)[x];
          liObjdepF = [];
          for (let y = 0; y < liFutureDemand.length; y++) {

            //Loop characteristics
            for (let z = 0; z < oPrimaryID[el].length; z++) {

              let oRec = oPrimaryID[el][z];
              lPIDQty[liFutureDemand[y].WEEK_DATE] ??= {};
              lPIDQty[liFutureDemand[y].WEEK_DATE]['DEMAND'] = liFutureDemand[y].QUANTITY;
              if (oPRPIDs_PIDs[el]) {
                lPIDQty[liFutureDemand[y].WEEK_DATE][oPRPIDs_PIDs[el]] ??= {};
                lPIDQty[liFutureDemand[y].WEEK_DATE][oPRPIDs_PIDs[el]][oRec.CHAR_NUM] = (oFutureDemand[liFutureDemand[y].WEEK_DATE]?.["OPT_QTY"]?.[oRec.CHAR_NUM]?.[oRec.CHAR_VALUE] ?? 0);
              }
              else {
                lPIDQty[liFutureDemand[y].WEEK_DATE][el] ??= {};
                lPIDQty[liFutureDemand[y].WEEK_DATE][el][oRec.CHAR_NUM] = (oFutureDemand[liFutureDemand[y].WEEK_DATE]?.["OPT_QTY"]?.[oRec.CHAR_NUM]?.[oRec.CHAR_VALUE] ?? 0);
              }
            }

          }

        }
        //lOOP 
        for (let a = 0; a < Object.keys(lPIDQty).length; a++) {
          let el = Object.keys(lPIDQty)[a];
          for (const b in lPIDQty[el]) {
             ////if any of the characteristic is not succeful, skip that Primary ID
            if (b == 'DEMAND' || Object.values(lPIDQty[el][b]).filter(f=>f == 0 || f== null || f =='.') .length >0) {
              continue;
            }
            let lRowID = 0;
            for (const c in lPIDQty[el][b]) {
              let lsObjdepF = {};
              lRowID = parseInt(lRowID) + 1;
              lsObjdepF.CAL_DATE = GenF.parse(el);
              lsObjdepF.LOCATION_ID = GenF.parse(adata.LOCATION_ID);
              lsObjdepF.PRODUCT_ID = GenF.parse(adata.PRODUCT_ID);
              lsObjdepF.VERSION = GenF.parse(adata.VERSION);
              lsObjdepF.SCENARIO = GenF.parse(adata.SCENARIO);
               lsObjdepF.MODEL_VERSION = GenF.parse(adata.MODEL_VERSION);
              lsObjdepF.OBJ_TYPE = "PI";
              lsObjdepF.OBJ_DEP = GenF.parse(b);
              lsObjdepF.OBJ_COUNTER = 1;
              lsObjdepF.ROW_ID = GenF.parse(lRowID);
              lsObjdepF.CHAR_NUM = GenF.parse(c);
              // lsObjdepF.SUCCESS = oFutureDemand[liFutureDemand[y].WEEK_DATE]?.["OPT_QTY"]?.[oRec.CHAR_NUM]?.[oRec.CHAR_VALUE];
              lsObjdepF.SUCCESS = lPIDQty[el][b][c] === '.' ? 0 : lPIDQty[el][b][c];
              //Adding new property
              // lsObjdepF.FLAG = false;
              // let DemandQty = oFutureDemand[liFutureDemand[y].WEEK_DATE]?.["DEMAND_QTY"];
              let DemandQty = lPIDQty[el]['DEMAND'];
              if (DemandQty > 0 && lsObjdepF.SUCCESS) {
                lsObjdepF.SUCCESS_RATE = (parseFloat(lsObjdepF.SUCCESS) * 100 / parseInt(DemandQty)).toFixed(2);
                // liObjdepF.push(GenF.parse(lsObjdepF));
                aFinal.push(GenF.parse(lsObjdepF));
              }
            }


          }

        }
        var aDeltaData =[];
        if (aFinal.length > 0) {
          try {
            //Inserting through chunks to reduce DB Load, preferred chunk size is 10,000 for HANA
            const chunkSize = 50000;
            for (let i = 0; i < aFinal.length; i += chunkSize) {
              const chunk = aFinal.slice(i, i + chunkSize);
              for (const item of chunk) {
                aDeltaData.push({
                    LOCATION_ID: item.LOCATION_ID,
                    PRODUCT_ID: item.PRODUCT_ID,
                    VERSION: item.VERSION,
                    SCENARIO: item.SCENARIO,
                    MODEL_VERSION: item.MODEL_VERSION,
                    WEEK_DATE: item.CAL_DATE
                });
            }
              await cds.db.run(INSERT.into("CP_TS_OBJDEP_CHARHDR_F").entries(chunk));
            }
            Flag = 'S';
          }
          catch (e) {
            Flag = 'E';
            sError='Reason: '+e.message;
            console.log("error", e.message);
          }
        }
        if(aDeltaData.length>0){
          try{
            let el = aDeltaData[0];
            await cds.run(`DELETE FROM "CP_FORECAST_DELTA_WEEKS" WHERE "LOCATION_ID"='${el.LOCATION_ID}'
              AND "PRODUCT_ID"='${el.PRODUCT_ID}' AND "VERSION"='${el.VERSION}' AND "SCENARIO"='${el.SCENARIO}'`)
              await UPSERT.into("CP_FORECAST_DELTA_WEEKS").entries(aDeltaData)
          }
          catch{
              console.log("Failed to Insert in Delta Weeks")
          } 
      }

      }
    }


    await GenF.logMessage(req, `Completed future timeseries`);
    if (Flag === 'S') {
      oReturn.bError = false;
      oReturn.message = "Timeseries Future generation is complete";
    }
    else if (Flag === 'E') {
      oReturn.bError = true;
      oReturn.message = "Timeseries Future generation failed for the product:"+adata.PRODUCT_ID+"."+sError;
    }
    else if (Flag === 'W') {
      let vWarmsg = "No Data to generate Timeseries Future for the product: " + adata.PRODUCT_ID;
      oReturn.bError = false;
      oReturn.message = vWarmsg;
    }
    else {
      const vMsg = "Timeseries generation for the product: " + adata.PRODUCT_ID + " is unsuccessful because of insufficient data";
      oReturn.bError = true;
      oReturn.message = vMsg;
    }
    return oReturn;

  }

  async refreshZeroDemandData(adata, bProcess) {
    let aFutureDemand = [];
    let bFlag = false;
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
                    AND MODEL_VERSION  = '${adata.MODEL_VERSION}'    `);
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

  async processTSFPRPIDs_old(oLocProd, aObjdepF, aPRPIDs_PIDs, sWeekDate, oFutureDemand) {
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
  async processTSFPRPIDs(oLocProd, aObjdepF, _aPRPIDs_PIDs, sWeekDate, oFutureDemand, oPRPIDs_PIDs) {
    let aVCFuture = [], aFilVCFuture = [], aFinVCFuture = [];
    let oVCFuture = {};

    aVCFuture = aObjdepF;

    for (let x = 0; x < Object.keys(oPRPIDs_PIDs).length; x++) {
      let el = Object.keys(oPRPIDs_PIDs)[x];
      oVCFuture["CAL_DATE"] = GenF.parse(sWeekDate);
      oVCFuture["LOCATION_ID"] = GenF.parse(oLocProd.LOCATION_ID);
      oVCFuture["PRODUCT_ID"] = GenF.parse(oLocProd.PRODUCT_ID);
      oVCFuture["OBJ_TYPE"] = 'PI';
      oVCFuture["OBJ_DEP"] = GenF.parse(String(el));

      for (let y = 0; y < oPRPIDs_PIDs[el].length; y++) {
        let oRec = oPRPIDs_PIDs[el][y];

        aFilVCFuture = aVCFuture.filter(function (aVCFut) {
          return aVCFut.OBJ_DEP === String(oRec.PID);
        });
        if (aFilVCFuture.length > 0) {
          for (let iFut = 0; iFut < aFilVCFuture.length; iFut++) {
            const element = aFilVCFuture[iFut];
            let ifindIndex = aFinVCFuture.findIndex(
              (o) =>
                o.OBJ_DEP === String(el) &&
                o.ROW_ID === element.ROW_ID &&
                o.CHAR_NUM === element.CHAR_NUM &&
                o.VERSION === element.VERSION &&
                o.SCENARIO === element.SCENARIO
            );

            if (ifindIndex === -1) {
              oVCFuture["OBJ_COUNTER"] = element.OBJ_COUNTER;
              oVCFuture["ROW_ID"] = element.ROW_ID;
              oVCFuture["VERSION"] = element.VERSION;
              oVCFuture["SCENARIO"] = element.SCENARIO;
              oVCFuture["CHAR_NUM"] = element.CHAR_NUM;
              oVCFuture["SUCCESS"] = element.SUCCESS;
              oVCFuture["SUCCESS_RATE"] = 0;

              aFinVCFuture.push(GenF.parse(oVCFuture));
            } else {
              aFinVCFuture[ifindIndex]["SUCCESS"] = parseFloat(aFinVCFuture[ifindIndex].SUCCESS) + parseFloat(element.SUCCESS);
              aFinVCFuture[ifindIndex]["SUCCESS_RATE"] = 0;
            }


            let ifindIndexH = aVCFuture.findIndex(
              (o) =>
                o.OBJ_DEP === String(oRec.PID) &&
                o.ROW_ID === element.ROW_ID &&
                o.CHAR_NUM === element.CHAR_NUM &&
                o.VERSION === element.VERSION &&
                o.SCENARIO === element.SCENARIO
            );

            if (ifindIndexH !== -1) {
              aVCFuture[ifindIndexH].FLAG = true;
            }
          }
        }
      }
    }

    if (aFinVCFuture.length > 0) {
      const quantity = parseFloat(oFutureDemand.QUANTITY);
      if (quantity > 0) {
        aFinVCFuture.forEach((aFut) => {
          // Success Rate
          aFut["SUCCESS_RATE"] = (
            (parseFloat(aFut["SUCCESS"]) /
              quantity) *
            100
          ).toFixed(2);
        })
      }
    }

    aFilVCFuture = [];
    aFilVCFuture = aVCFuture.filter(function (aFut) {
      return aFut.FLAG === false;
    });

    if (aFilVCFuture.length > 0) {
      aFinVCFuture.push(
        ...aFilVCFuture.map((item) =>
          GenF.parse({
            CAL_DATE: GenF.parse(sWeekDate),
            LOCATION_ID: GenF.parse(oLocProd.LOCATION_ID),
            PRODUCT_ID: GenF.parse(oLocProd.PRODUCT_ID),
            OBJ_TYPE: 'PI',
            OBJ_DEP: item.OBJ_DEP,
            OBJ_COUNTER: item.OBJ_COUNTER,
            ROW_ID: item.ROW_ID,
            VERSION: item.VERSION,
            SCENARIO: item.SCENARIO,
            CHAR_NUM: item.CHAR_NUM,
            SUCCESS: item.SUCCESS,
            SUCCESS_RATE: item.SUCCESS_RATE
          })
        )
      );
      // for (let index = 0; index < aFilVCFuture.length; index++) {
      //   oVCFuture = {};
      //   oVCFuture["CAL_DATE"] = GenF.parse(sWeekDate);
      //   oVCFuture["LOCATION_ID"] = GenF.parse(oLocProd.LOCATION_ID);
      //   oVCFuture["PRODUCT_ID"] = GenF.parse(oLocProd.PRODUCT_ID);
      //   oVCFuture["OBJ_TYPE"] = 'PI';
      //   oVCFuture["OBJ_DEP"] = aFilVCFuture[index].OBJ_DEP;
      //   oVCFuture["OBJ_COUNTER"] = aFilVCFuture[index].OBJ_COUNTER;
      //   oVCFuture["ROW_ID"] = aFilVCFuture[index].ROW_ID;
      //   oVCFuture["VERSION"] = aFilVCFuture[index].VERSION;
      //   oVCFuture["SCENARIO"] = aFilVCFuture[index].SCENARIO;
      //   oVCFuture["CHAR_NUM"] = aFilVCFuture[index].CHAR_NUM;
      //   oVCFuture["SUCCESS"] = aFilVCFuture[index].SUCCESS;
      //   oVCFuture["SUCCESS_RATE"] = aFilVCFuture[index].SUCCESS_RATE;

      //   aFinVCFuture.push(GenF.parse(oVCFuture));

      // }
    }

    return aFinVCFuture;
  }

  
  async updateOptionQuantities(adata, req, Flag) {
    let lFlag = '';
    var oReturn = {
      bError: false,
      message: ''
    }
    let aPAL_FCharplan = [],
      aIBP_FCharplan = [];
    let aLocProdWeek_F = [], aLocProdWeek_P = [];
    let aDeltaWeeks = [];
    let lMessage = '';
    let aStatForecastP = [], aStatForecastF = [], oPredictions = {}, aPredictions = [];
    let aCir = [];
    let lCirId = 0;
    const tCurrTimestamp = new Date().toISOString();
    let aWeekDates = '';
    let bFlag = false;
    let oDeltaFcst = {}, aDeltaFcst = [];
    let oDeltaPred = {}, aDeltaPred = [];
    var sError ='';
    aDeltaWeeks = await cds.run(`SELECT * 
                                   FROM CP_DEMAND_OPT_QUANTITY_DELTA
                                  WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                    AND PRODUCT_ID  = '${adata.PRODUCT_ID}'
                                    AND VERSION = '${adata.VERSION}'
                                    AND SCENARIO = '${adata.SCENARIO}'
                                    AND MODEL_VERSION = '${adata.MODEL_VERSION}'`);
    // If No Delta Weeks Exists for selected Location/PRoduct stop processing
    if (aDeltaWeeks.length === 0) {
      Flag = 'W';
    } else {
      // Fetch Statistical Forecast for Selected Location Product
      aPAL_FCharplan = await cds.run(`SELECT LOCATION_ID,
                                       PRODUCT_ID,
                                       CHAR_NUM,
                                       CHARVAL_NUM,
                                       VERSION,
                                       SCENARIO,
                                       WEEK_DATE,
                                       MODEL_VERSION,
                                       SUM(OPT_QTY) AS OPT_QTY
                                   FROM CP_PAL_FCHARPLAN                                  
                                   WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                     AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                     AND VERSION = '${adata.VERSION}'
                                     AND SCENARIO = '${adata.SCENARIO}'
                                     AND MODEL_VERSION = '${adata.MODEL_VERSION}'
                                     AND WEEK_DATE IN (SELECT DISTINCT WEEK_DATE 
                                                         FROM CP_DEMAND_OPT_QUANTITY_DELTA
                                                        WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                          AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                                          AND VERSION = '${adata.VERSION}'
                                                          AND SCENARIO = '${adata.SCENARIO}'
                                                          AND MODEL_VERSION = '${adata.MODEL_VERSION}')
                                     GROUP BY LOCATION_ID,
                                            PRODUCT_ID,
                                            CHAR_NUM,
                                            CHARVAL_NUM,
                                            VERSION,
                                            SCENARIO,
                                            WEEK_DATE,
                                            MODEL_VERSION`);

      // Fetch updated Option Quantities
      aIBP_FCharplan = await cds.run(`SELECT LOCATION_ID,
                                       PRODUCT_ID,
                                       CHAR_NUM,
                                       CHARVAL_NUM,
                                       VERSION,
                                       SCENARIO,
                                       WEEK_DATE,
                                       MODEL_VERSION,
                                       SUM(OPT_QTY) AS OPT_QTY
                                 FROM CP_IBP_FCHARPLAN                             
                                WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                  AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                  AND VERSION = '${adata.VERSION}'
                                  AND SCENARIO = '${adata.SCENARIO}'
                                  AND MODEL_VERSION = '${adata.MODEL_VERSION}'
                                  AND WEEK_DATE IN (SELECT DISTINCT WEEK_DATE 
                                                      FROM CP_DEMAND_OPT_QUANTITY_DELTA
                                                     WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                                       AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                                       AND VERSION = '${adata.VERSION}'
                                                       AND SCENARIO = '${adata.SCENARIO}'
                                                       AND MODEL_VERSION = '${adata.MODEL_VERSION}')
                                  GROUP BY LOCATION_ID,
                                      PRODUCT_ID,
                                      CHAR_NUM,
                                      CHARVAL_NUM,
                                      VERSION,
                                      SCENARIO,
                                      WEEK_DATE,
                                      MODEL_VERSION`);

      // Compare if generated Statistical Forecast and updated option quantities are same per week
      // 1. If Option quantities are same - Insert Option Quantities at Unique Id Level in Forecast Order Table
      // 2. If Option quantities are different - Insert Option Quantities at Primary Id Level in Predictions Table
      if (aPAL_FCharplan.length > 0) {
        for (let i = 0; i < aPAL_FCharplan.length; i++) {
          let findObj = aIBP_FCharplan.find(
            (o) =>
              o.LOCATION_ID === aPAL_FCharplan[i].LOCATION_ID &&
              o.PRODUCT_ID === aPAL_FCharplan[i].PRODUCT_ID &&
              o.CHAR_NUM === aPAL_FCharplan[i].CHAR_NUM &&
              o.CHARVAL_NUM === aPAL_FCharplan[i].CHARVAL_NUM &&
              o.WEEK_DATE === aPAL_FCharplan[i].WEEK_DATE
          );

          if (findObj) {
            if (Math.round(aPAL_FCharplan[i].OPT_QTY) === Math.round(findObj["OPT_QTY"])) {
              aLocProdWeek_F.push(GenF.parse(findObj["WEEK_DATE"]));
            } else {
              aLocProdWeek_P.push(GenF.parse(findObj["WEEK_DATE"]));
            }
          }

        }
      }

      aWeekDates = '';

      if (aLocProdWeek_P.length > 0) {

        // Remove duplicates from array of values
        aLocProdWeek_P = [...new Set(aLocProdWeek_P)];
        for (let i = 0; i < aLocProdWeek_P.length; i++) {

          if (aWeekDates === '') {
            aWeekDates = `'${aLocProdWeek_P[i]}'`;
          } else {
            aWeekDates = `${aWeekDates},'${aLocProdWeek_P[i]}'`;
          }

          // If Weekdate is part of predictions array, remove it from Forecast Orders array
          if (aLocProdWeek_F.length > 0) {
            if (bFlag === false) {
              // Remove duplicates from array of values
              aLocProdWeek_F = [...new Set(aLocProdWeek_F)];
              bFlag = true;
            }
            let index = aLocProdWeek_F.indexOf(aLocProdWeek_P[i]);

            if (index !== -1) {
              aLocProdWeek_F.splice(index, 1);
            }
          }

          // Store Delta Weeks to generate Forecast Orders
          oDeltaFcst = {};

          oDeltaFcst.LOCATION_ID = adata.LOCATION_ID;
          oDeltaFcst.PRODUCT_ID = adata.PRODUCT_ID;
          oDeltaFcst.VERSION = adata.VERSION;
          oDeltaFcst.SCENARIO = adata.SCENARIO;
          oDeltaFcst.MODEL_VERSION = adata.MODEL_VERSION;
          oDeltaFcst.WEEK_DATE = aLocProdWeek_P[i];

          aDeltaFcst.push(GenF.parse(oDeltaFcst));

          // Update Delta Time in Predictions Table
          try {
            await UPDATE`CP_TS_PREDICTIONS`
              .with({
                DELTA_TIME: tCurrTimestamp
              })
              .where(`LOCATION_ID = '${adata.LOCATION_ID}'
                    AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                    AND VERSION = '${adata.VERSION}'
                    AND SCENARIO = '${adata.SCENARIO}'
                    AND MODEL_VERSION = '${adata.MODEL_VERSION}'
                    AND CAL_DATE   = '${aLocProdWeek_P[i]}'`);
          } catch (e) {
            console.log('Error while updating delta timestamp')
            console.log(e);
          }

        }

        if (aDeltaFcst.length > 0) {
          let cqnQuery = { UPSERT: { into: { ref: ['CP_FORECAST_DELTA_WEEKS'] }, entries: aDeltaFcst } };
          try {
            await cds.run(cqnQuery);
            GenF.log(`Successfully updated delta Weeks data to forecast for Location Product: +${adata.LOCATION_ID}, +${adata.PRODUCT_ID}`);
            Flag = 'S'

            // Remove Delta Weeks Data 
            await cds.run(`DELETE FROM "CP_DEMAND_OPT_QUANTITY_DELTA" 
                            WHERE LOCATION_ID = '${adata.LOCATION_ID}' 
                             AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                             AND VERSION = '${adata.VERSION}'
                             AND SCENARIO = '${adata.SCENARIO}' 
                             AND MODEL_VERSION = '${adata.MODEL_VERSION}'                
                             AND WEEK_DATE IN (`+ aWeekDates + `)`);

          }
          catch (e) {
            GenF.log(`Updation of delta weeks data for Location Product: +${adata.LOCATION_ID}, +${adata.PRODUCT_ID} failed`);
            Flag = 'E';
            sError = `Updation of delta weeks data for Location Product: +${adata.LOCATION_ID}, +${adata.PRODUCT_ID} failed.Reason: ${e.message}`
            console.log(e);

          }
        }

      }

      aWeekDates = '';
      // Update Forecast Orders Data
      if (aLocProdWeek_F.length > 0) {
        let iMaxCIRID = 0;

        // Remove duplicates from array of values
        aLocProdWeek_F = [...new Set(aLocProdWeek_F)];
        for (let i = 0; i < aLocProdWeek_F.length; i++) {

          if (aWeekDates === '') {
            aWeekDates = `'${aLocProdWeek_F[i]}'`;
          } else {
            aWeekDates = `${aWeekDates},'${aLocProdWeek_F[i]}'`;
          }

        }
        if (aWeekDates !== '') {
          // Get Statistical Forecast aggregated for Unique Ids
          aStatForecastF = await cds.run(`SELECT DISTINCT CAL_DATE, 
                                                        LOCATION_ID, 
                                                        PRODUCT_ID, 
                                                        UNIQUE_ID, 
                                                        MODEL_VERSION,
                                                        VERSION, 
                                                        SCENARIO, 
                                                        SUM(UNIQUE_QTY) AS UNIQUE_QTY
                                         FROM V_STATFORECAST_PID_UID_QTYS 
                                        WHERE LOCATION_ID = '${adata.LOCATION_ID}' 
                                          AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                                          AND VERSION = '${adata.VERSION}'
                                          AND SCENARIO ='${adata.SCENARIO}'
                                          AND MODEL_VERSION = '${adata.MODEL_VERSION}'
                                           AND CAL_DATE IN (`+ aWeekDates + `)                                           
                                      GROUP BY CAL_DATE, 
                                               LOCATION_ID, 
                                               PRODUCT_ID, 
                                               UNIQUE_ID, 
                                               MODEL_VERSION,  
                                               VERSION, 
                                               SCENARIO
                                     ORDER BY
                                             CAL_DATE, 
                                             LOCATION_ID, 
                                             PRODUCT_ID,                                                 
                                             UNIQUE_ID, 
                                             MODEL_VERSION, 
                                             VERSION,                                                  
                                             SCENARIO`);
        }

        if (aStatForecastF.length > 0) {
          // Remove Forecast Orders Data for Selected WeekDates
          await cds.run(`DELETE FROM "CP_CIR_GENERATED" 
                          WHERE LOCATION_ID = '${adata.LOCATION_ID}' 
                          AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                          AND VERSION = '${adata.VERSION}'
                          AND SCENARIO = '${adata.SCENARIO}'                        
                          AND WEEK_DATE IN (`+ aWeekDates + `)
                          AND MODEL_VERSION = '${adata.MODEL_VERSION}'`);

          // Fetch Maximum Number of CIR_ID   
          iMaxCIRID = await cds.run(
            `SELECT MAX(CIR_ID) AS MAX_CIR_ID FROM "CP_CIR_GENERATED"`
          );
          if (iMaxCIRID && iMaxCIRID[0].MAX_CIR_ID > 0) {
            lCirId = iMaxCIRID[0].MAX_CIR_ID;
          }

          for (let j = 0; j < aStatForecastF.length; j++) {

            let oCir = {};
            lCirId = parseInt(lCirId) + 1;
            oCir['LOCATION_ID'] = GenF.parse(aStatForecastF[j].LOCATION_ID);
            oCir['PRODUCT_ID'] = GenF.parse(aStatForecastF[j].PRODUCT_ID);
            oCir['WEEK_DATE'] = GenF.parse(aStatForecastF[j].CAL_DATE);
            oCir['CIR_ID'] = GenF.parse(lCirId);
            oCir['MODEL_VERSION'] = GenF.parse(aStatForecastF[j].MODEL_VERSION);
            oCir['VERSION'] = GenF.parse(aStatForecastF[j].VERSION);
            oCir['SCENARIO'] = GenF.parse(aStatForecastF[j].SCENARIO);
            oCir['CIR_QTY'] = GenF.parse(aStatForecastF[j].UNIQUE_QTY);
            oCir['ACTUAL_QTY'] = 0;
            oCir['UNCONSUMED_FORECAST'] = GenF.parse(aStatForecastF[j].UNIQUE_QTY);
            oCir['PRODORD_QTY'] = 0;
            oCir['OPEN_ASSEMBLY'] = GenF.parse(aStatForecastF[j].UNIQUE_QTY);
            oCir['UNIQUE_ID'] = GenF.parse(aStatForecastF[j].UNIQUE_ID);
            oCir['SNAPSHOT_CHK'] = 'X';

            aCir.push(GenF.parse(oCir));
          }
        }

        if (aCir.length > 0) {
          let cqnQuery = { UPSERT: { into: { ref: ['CP_CIR_GENERATED'] }, entries: aCir } };
          try {
            await cds.run(cqnQuery);
            GenF.log(`Successfully updated Forecast Orders data for Location Product: +${adata.LOCATION_ID}, +${adata.PRODUCT_ID}`);
            // // Update Actual Quantities in Forecast Orders
            // await objCatFn.updateActualQtyForecast(adata);

            if (Flag !== 'E') {
              Flag = 'S';
            }
            // Remove Delta Weeks Data 
            await cds.run(`DELETE FROM "CP_DEMAND_OPT_QUANTITY_DELTA" 
                            WHERE LOCATION_ID = '${adata.LOCATION_ID}' 
                            AND PRODUCT_ID = '${adata.PRODUCT_ID}'
                            AND VERSION = '${adata.VERSION}'
                            AND SCENARIO = '${adata.SCENARIO}' 
                            AND MODEL_VERSION = '${adata.MODEL_VERSION}'                
                            AND WEEK_DATE IN (`+ aWeekDates + `)`);
          }
          catch (e) {
            GenF.log(`Updation of Forecast Orders data for Location Product: +${adata.LOCATION_ID}, +${adata.PRODUCT_ID} failed`);
            console.log(e);
            Flag = 'E';
            sError+=`Updation of Forecast Orders data for Location Product: +${adata.LOCATION_ID}, +${adata.PRODUCT_ID} failed.Reason: ${e.message}`
          }
        }
      }

    }

    await GenF.logMessage(req, `Completed Updation of Option Qunatities in Predictions and Forecast Orders`);
    if (Flag === 'S') {
      oReturn.bError = false;
      oReturn.message = "Option Quantities Updation Completed";
    }
    else if (Flag === 'E') {
      oReturn.bError = true;
      oReturn.message = sError;
    }
    else if (Flag === 'W') {
      let vWarmsg = "No Data to process for  : " + adata.PRODUCT_ID +"in Demand Option quantity";
      oReturn.bError = false;
      oReturn.message = vWarmsg;
    }
    else {
      const vMsg = "Option Quantities Updation for the product: " + adata.PRODUCT_ID + " is unsuccessful because of insufficient data";
      oReturn.bError = true;
      oReturn.message = vMsg;
    }
    return oReturn;
  }

   /**
   * Generate Timeseries for Object Dependency
   * @param {Order Count per week} lsOrdercount
   * @param {Unique ID Count per week} liUniqueCount
   * @param {Unique ID Characteristics} liUniqueID
   * @param {Object Dependency} liOD
   * @param {Sales Characteristic count} liSalesCharCount
   */
  async processObjectDependencyM1(
    lsOrdercount,
    liUniqueCount,
    liUniqueID,
    liOD,
    liSalesCharCount
  ) {
    let lsVCHistory = {};
    let aUID_OD = [], aUID_OD_CHAR = [], aOD_CHAR = [];
    let sCounter = '1';
    let lRowID = 0

    aUID_OD = await cds.run(`SELECT * FROM CP_UNIQUEID_OD
                              WHERE LOCATION_ID = '${lsOrdercount.LOCATION_ID}'
                                AND REF_PROID = '${lsOrdercount.PRODUCT_ID}'
                                AND STATUS = 'S'`);

    aUID_OD_CHAR = await cds.run(`SELECT DISTINCT 
                                                  OBJ_DEP,
                                                  CHAR_NUM,
                                                  STATUS
                                    FROM CP_UNIQUEID_OD_CHAR 
                                   WHERE LOCATION_ID = '${lsOrdercount.LOCATION_ID}'
                                     AND REF_PROID = '${lsOrdercount.PRODUCT_ID}'
                                     AND STATUS = 'S'
                                     ORDER BY OBJ_DEP,
                                              CHAR_NUM`);

    // lsVCHistory["PERIOD_NUM"] = GenF.parse(lsOrdercount.WEEK_NO);
    lsVCHistory["PERIOD_NUM"] = parseInt(lsOrdercount.WEEK_NO);
    lsVCHistory["LOCATION_ID"] = GenF.parse(lsOrdercount.LOCATION_ID);
    lsVCHistory["PRODUCT_ID"] = GenF.parse(lsOrdercount.PRODUCT_ID);

    let liUniqueCountWeek = [];
    liUniqueCountWeek = liUniqueCount.filter(function (aObj) {
      return (
        aObj.WEEK_DATE === lsOrdercount.WEEK_DATE &&
        aObj.LOCATION_ID === lsOrdercount.LOCATION_ID &&
        aObj.PRODUCT_ID === lsOrdercount.PRODUCT_ID
      );
    });

    for (let cntOD = 0; cntOD < liOD.length; cntOD++) {
      lsVCHistory["TYPE"] = "OD";
      lsVCHistory["GROUP_ID"] = GenF.parse(
        String(liOD[cntOD].OBJ_DEP) +
        "_" +
        sCounter
      );
      lsVCHistory["GROUP_COUNT"] = 0;

      // Get Object Dependency Char Name mapping results
      aOD_CHAR = aUID_OD_CHAR.filter(function (aObj) {
        return (
          aObj.OBJ_DEP === liOD[cntOD].OBJ_DEP
        );
      });

      // var aBomData = await cds.run(`SELECT * FROM "CP_BOM_OD_DEP" WHERE DEPENDENCY='${liOD[cntOD].OBJ_DEP}' ORDER BY LINE_NO`)
      // // Check if Unique ID is successful for this object Dependency
      // let aODData = procsObj.odBreakDown(aBomData);
      for (let cntUni = 0; cntUni < liUniqueCountWeek.length; cntUni++) {
        let liUniqueChar = liUniqueID[liUniqueCountWeek[cntUni].UNIQUE_ID];
        let lUniFail = "";
        let oUID_OD = {};

        oUID_OD = aUID_OD.filter(function (aObj) {
          return (            
            aObj.UNIQUE_ID === liUniqueCountWeek[cntUni].UNIQUE_ID &&
            aObj.OBJ_DEP === liOD[cntOD].OBJ_DEP
          );
        });

      
          lsVCHistory["GROUP_COUNT"] =
            parseInt(lsVCHistory["GROUP_COUNT"]) + parseInt(liUniqueCountWeek[cntUni].ORD_QTY);        

      }

      if (lsOrdercount.ORD_QTY > 0) {
        lsVCHistory["GROUP_COUNT_RATE"] = ((
          parseInt(lsVCHistory["GROUP_COUNT"]) /
            parseInt(lsOrdercount.ORD_QTY)) * 100).toFixed(2);
      }


      for (let cntODC = 0; cntODC < aOD_CHAR.length; cntODC++) {
        let lsOD = aOD_CHAR[cntODC];
        
          if(lRowID === 0 || lsOD.CHAR_NUM !== aOD_CHAR[GenF.subOne(cntODC, aOD_CHAR.length)].CHAR_NUM) {
            lRowID = lRowID + 1;
          }

          lsVCHistory["ROW"] = parseInt(lRowID); //GenF.parse(lsOD.ROW_ID);
          lsVCHistory["CHAR_NUM"] = GenF.parse(lsOD.CHAR_NUM);
          lsVCHistory["ATTRIBUTE"] = GenF.parse("att" + lRowID);
          lsVCHistory["CHAR_COUNT"] = 0;

          let findIndex = -1;

          findIndex = liSalesCharCount.findIndex(
            (o) =>
              o.LOCATION_ID === lsOrdercount.LOCATION_ID &&
              o.PRODUCT_ID === lsOrdercount.PRODUCT_ID &&
              o.WEEK_DATE === lsOrdercount.WEEK_DATE &&
              o.CHAR_NUM === lsOD.CHAR_NUM
          );
          if (findIndex !== -1) {
            lsVCHistory["CHAR_COUNT"] = parseInt(liSalesCharCount[findIndex].ORD_QTY);
          }

          if (lsOrdercount.ORD_QTY > 0) {
            lsVCHistory["CHAR_COUNT_RATE"] = ((
              parseInt(lsVCHistory["CHAR_COUNT"]) /
                parseInt(lsOrdercount.ORD_QTY)) * 100).toFixed(2);
          }

          let ifindIndexVC = -1;
          ifindIndexVC = this.iVCHistory.findIndex(
            (o) =>
              o.PERIOD_NUM === lsVCHistory.PERIOD_NUM &&
              o.LOCATION_ID === lsVCHistory.LOCATION_ID &&
              o.PRODUCT_ID === lsVCHistory.PRODUCT_ID &&
              o.TYPE === lsVCHistory.TYPE &&
              o.GROUP_ID === lsVCHistory.GROUP_ID &&
              o.ROW === lsVCHistory.ROW &&
              o.ATTRIBUTE === lsVCHistory.ATTRIBUTE &&
              o.CHAR_NUM === lsVCHistory.CHAR_NUM
          );

          if (ifindIndexVC === -1) {
            this.iVCHistory.push(GenF.parse(lsVCHistory));
          }
          else {
            if (lsVCHistory.CHAR_COUNT != 0) {//only replace if it is a success case
              this.iVCHistory[ifindIndexVC] = GenF.parse(lsVCHistory);
            }
          }
        
      }
    }
  }

  /**
 * Get object Dependency
 * @param {Location} lLocation
 * @returns
 */
  async getObjectDependencyM1(lLocation, lProduct) {
    let liOD = [], aObjDep = [], liODChar = [];

    liOD = await cds.run(`SELECT DISTINCT OBJ_DEP FROM CP_UNIQUEID_OD
                              WHERE LOCATION_ID = '${lLocation}'
                                AND REF_PROID = '${lProduct}'
                                AND STATUS = 'S'`);
    return liOD;
  }


  async generateTimeseries(adata, lStartDate, req, bUserSelectedWeeks) {

    // this.gConfigProduct = await this.getConfigProduct(
    //   adata.LOCATION_ID,
    //   adata.PRODUCT_ID
    // );
    var aSalesDeltaData = [];
    if (bUserSelectedWeeks == false) {//No User selection from Job Overview
      aSalesDeltaData = await cds.run(`SELECT * FROM "CP_SALESH_CONFIG_DELTA" WHERE "LOCATION_ID"='${adata.LOCATION_ID}' AND "PRODUCT_ID"='${adata.PRODUCT_ID}' ORDER BY WEEK_DATE`);
      if (aSalesDeltaData.length > 0) {
        //Get Previous Monday
        lStartDate = GenF.getPreviousMondayCmp(aSalesDeltaData[0].WEEK_DATE);
        this.vCurrDate = GenF.getNextMondayCmp(aSalesDeltaData[aSalesDeltaData.length - 1].WEEK_DATE);
      }
    }
    var lMainProduct = '', sConfig = '', sOriginalProductID = adata.PRODUCT_ID;
    let lsMainProduct = await cds.run(`SELECT "PRODUCT_ID","REF_PRODID","CONFIGPROD_CHK" FROM
                                          "CP_PARTIALPROD_INTRO" WHERE "LOCATION_ID"='${adata.LOCATION_ID}' 
                                          AND PRODUCT_ID = '${adata.PRODUCT_ID}'`)
    if (lsMainProduct.length === 0) {
      lMainProduct = GenF.parse(adata.PRODUCT_ID);
    }
    else {//Not a config Product
      lMainProduct = lsMainProduct[0].REF_PRODID;
      sConfig = lsMainProduct[0].CONFIGPROD_CHK;
    }
    // Get Sales Order Count Information
    var liOrderCount = await cds.run(
      `SELECT *
               FROM V_ORD_COUNT
              WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                AND "PRODUCT_ID"  IN (SELECT PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE REF_PRODID = '${lMainProduct}')
                AND "WEEK_DATE" <= '${this.vCurrDate}'
                AND "WEEK_DATE" >= '${lStartDate}'
                ORDER BY "LOCATION_ID" ASC, 
                         "PRODUCT_ID" ASC,
                         "WEEK_DATE" ASC`
    );
    if (sConfig != 'X') {
      liOrderCount = liOrderCount.filter(l => l.PRODUCT_ID == adata.PRODUCT_ID);
      adata.PRODUCT_ID = lMainProduct;
    }

    if (liOrderCount?.length == 0) {
      let Smsg = `No Orders found for the Location ${adata.LOCATION_ID} and Product ${sOriginalProductID}`
      this.oReturn.bError = false;
      this.oReturn.message = Smsg;
      return this.oReturn;
    }

    // const liPrimaryID = await this.getPrimaryIDCharacteristics(
    //   adata.LOCATION_ID,
    //   adata.PRODUCT_ID,
    //   req
    // );

    // // if (this.oReturn.bError === true) {
    // //   return this.oReturn;
    // // }

    const liUniqueID = await this.getUniqueIDCharacteristics(
      adata.LOCATION_ID,
      adata.PRODUCT_ID
    );
    // if (this.oReturn.bError === true) {
    //   return this.oReturn;
    // }

    // Get Sales Count Information
    const liPrimaryCount = await cds.run(
      `SELECT 
                LOCATION_ID,
                PRODUCT_ID,
                ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) AS "WEEK_DATE",
                PRIMARY_ID,
                SUM(ORD_QTY) AS ORD_QTY
            FROM 
                V_SALES_H
            WHERE LOCATION_ID = '${adata.LOCATION_ID}'
              AND REF_PRODID = '${adata.PRODUCT_ID}'
              AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) < '${this.vCurrDate}'
              AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) > '${lStartDate}'
            GROUP BY 
                LOCATION_ID,
                PRODUCT_ID,
                ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ),
                PRIMARY_ID
            ORDER BY 
                LOCATION_ID ASC, 
                PRODUCT_ID ASC, 
                WEEK_DATE ASC,
                PRIMARY_ID ASC`
    );

    // Get Sales Count Information
    const liUniqueCount = await cds.run(
      `SELECT 
                LOCATION_ID,
                PRODUCT_ID,
                ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) AS "WEEK_DATE",                
                UNIQUE_ID,
                SUM(ORD_QTY) AS ORD_QTY
            FROM 
                V_SALES_H
            WHERE LOCATION_ID = '${adata.LOCATION_ID}'
              AND REF_PRODID = '${adata.PRODUCT_ID}'
              AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) < '${this.vCurrDate}'
              AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) > '${lStartDate}'
            GROUP BY 
                LOCATION_ID,
                PRODUCT_ID,
                ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ),
                UNIQUE_ID
            ORDER BY 
                LOCATION_ID ASC, 
                PRODUCT_ID ASC, 
                WEEK_DATE ASC,
                UNIQUE_ID ASC`
    );

    const liSalesCharCount = await cds.run(
      `SELECT DISTINCT 
            A.LOCATION_ID,
            A.PRODUCT_ID,
            B.CHAR_NUM,
            B.CHAR_VALUE,
            ADD_DAYS( A.MAT_AVAILDATE, ( WEEKDAY(A.MAT_AVAILDATE) * -1 ) ) AS "WEEK_DATE",
            SUM(A.ORD_QTY) AS ORD_QTY
        FROM 
            V_SALES_H AS A
            INNER JOIN
            V_UNIQUE_ID AS B
            ON B.UNIQUE_ID = A.UNIQUE_ID
                AND B.PRODUCT_ID = A.REF_PRODID
      WHERE LOCATION_ID = '${adata.LOCATION_ID}'
        AND REF_PRODID = '${adata.PRODUCT_ID}'
        GROUP BY 
            A.LOCATION_ID,
            A.PRODUCT_ID,
            ADD_DAYS( A.MAT_AVAILDATE, ( WEEKDAY(A.MAT_AVAILDATE) * -1 ) ),
            B.CHAR_NUM,
            B.CHAR_VALUE
        ORDER BY 
            A.LOCATION_ID,
            A.PRODUCT_ID,
            ADD_DAYS( A.MAT_AVAILDATE, ( WEEKDAY(A.MAT_AVAILDATE) * -1 ) ) ASC,
            CHAR_NUM ASC, 
            CHAR_VALUE ASC `
    );

    const liOD = await this.getObjectDependencyM1(adata.LOCATION_ID, adata.PRODUCT_ID);
    // const liRestrictions = await this.getRestrictions(adata.LOCATION_ID, adata.PRODUCT_ID);

    // // Get Planning Relevant Primary Ids
    // const liPRPIDs_PIDs = await cds.run(`SELECT DISTINCT LOCATION_ID,
    //                                                       PRODUCT_ID,
    //                                                       PRPID,
    //                                                       PID
    //                                                 FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS
    //                                                 WHERE LOCATION_ID = '${adata.LOCATION_ID}'
    //                                                 AND PRODUCT_ID IN (SELECT PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE REF_PRODID = '${adata.PRODUCT_ID}')
    //                                                 AND PID NOT IN (SELECT DISTINCT PRP_PID 
    //                                                                            FROM CP_PRPIDS WHERE LOCATION_ID = '${adata.LOCATION_ID}'
		//                                                                             AND PRODUCT_ID IN (SELECT PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE REF_PRODID = '${adata.PRODUCT_ID}')
		//                                                                             AND PRP_PID_TYPE IN (1,2,4))
    //                                                 ORDER BY PRODUCT_ID,
    //                                                   PRPID`);

    // const aDistinctPrpIds = await cds.run(`SELECT DISTINCT PRP_PID FROM "CP_PRPIDS" WHERE  LOCATION_ID = '${adata.LOCATION_ID}' AND  PRODUCT_ID IN (SELECT PRODUCT_ID FROM CP_PARTIALPROD_INTRO WHERE REF_PRODID = '${adata.PRODUCT_ID}')`)
    // var oPrpIDs = {}
    // for (var x = 0; x < aDistinctPrpIds.length; x++) {
    //   var key = aDistinctPrpIds[x].PRP_PID;
    //   if (!oPrpIDs[key]) {
    //     oPrpIDs[key] = '';
    //   }
    //   oPrpIDs[key] = 'X'
    // }
    // let aPRPIDs = [], oPRPIDs = {}, oProds = {};
    // let sProd = '', sPrpid = '', aPIDs = [];
    // if (liPRPIDs_PIDs.length > 0) {
    //   for (let i = 0; i < liPRPIDs_PIDs.length; i++) {
    //     if (i === 0 || liPRPIDs_PIDs[i].PRODUCT_ID !== liPRPIDs_PIDs[GenF.subOne(i, liPRPIDs_PIDs.length)].PRODUCT_ID ||
    //       liPRPIDs_PIDs[i].PRPID !== liPRPIDs_PIDs[GenF.subOne(i, liPRPIDs_PIDs.length)].PRPID) {

    //       sProd = liPRPIDs_PIDs[i].PRODUCT_ID;
    //       sPrpid = liPRPIDs_PIDs[i].PRPID;
    //       oPRPIDs[sPrpid] = [];

    //     }

    //     aPIDs.push(GenF.parse(liPRPIDs_PIDs[i].PID));

    //     if (i == GenF.addOne(i, liPRPIDs_PIDs.length) || liPRPIDs_PIDs[i].PRODUCT_ID !== liPRPIDs_PIDs[GenF.addOne(i, liPRPIDs_PIDs.length)].PRODUCT_ID ||
    //       liPRPIDs_PIDs[i].PRPID !== liPRPIDs_PIDs[GenF.addOne(i, liPRPIDs_PIDs.length)].PRPID) {
    //       oProds[sPrpid] = GenF.parse(aPIDs)
    //       aPIDs = [];
    //     }

    //     if (i == GenF.addOne(i, liPRPIDs_PIDs.length) || liPRPIDs_PIDs[i].PRODUCT_ID !== liPRPIDs_PIDs[GenF.addOne(i, liPRPIDs_PIDs.length)].PRODUCT_ID) {
    //       oProds.PRODUCT_ID = sProd;

    //       aPRPIDs.push(GenF.parse(oProds));
    //       oPRPIDs = {};
    //       oProds = {};
    //     }

    //   }
    // }
    var aAlertData = [];
    //Get Unique ID description
    let aUnique = await cds.run(`SELECT DISTINCT UNIQUE_ID,UNIQUE_DESC FROM "CP_UNIQUE_ID_HEADER" WHERE  "UID_TYPE"='P'`);
    let oUnique = {};
    for (var u = 0; u < aUnique.length; u++) {
      oUnique[aUnique[u].UNIQUE_ID + "_1"] ??= '';
      oUnique[aUnique[u].UNIQUE_ID + "_1"] = aUnique[u].UNIQUE_DESC;
    }
    for (let i = 0; i < liOrderCount.length; i++) {
      this.iVCHistory = [];
      // liOrderCount[i]["WEEK_NO"] = GenF.getWeekNumber(liOrderCount[i].WEEK_DATE);

      // Delete Existing one
      try {
        await DELETE.from("CP_VC_HISTORY_TS")
          .where(`LOCATION_ID = '${liOrderCount[i].LOCATION_ID}' 
                            AND PRODUCT_ID = '${liOrderCount[i].PRODUCT_ID}'
                            AND PERIOD_NUM = '${liOrderCount[i].WEEK_NO}'
                            AND TYPE       IN ('OD', 'PI', 'RT')`);
      } catch (e) {
        console.log(e);
        this.oReturn.bError = true;
        this.oReturn.message = "Time Series History generation Failed.Reason: " + e.message;
      }
      GenF.log(
        `Deleted Timeseries for ${liOrderCount[i].LOCATION_ID}, ${liOrderCount[i].PRODUCT_ID}, ${liOrderCount[i].WEEK_NO}`
      );

      // await this.processPrimaryID(
      //   liOrderCount[i],
      //   liPrimaryCount,
      //   liPrimaryID,
      //   liSalesCharCount,
      //   aPRPIDs,
      //   adata,
      //   oPrpIDs
      // );

      // // Process Timeseries History for Planning Relevant Primary Ids
      // // await this.processPRPIDs(liOrderCount[i], aPRPIDs);

      await this.processObjectDependencyM1(
        liOrderCount[i],
        liUniqueCount,
        liUniqueID,
        liOD,
        liSalesCharCount
      );

      // this.processRestrictions(
      //   liOrderCount[i],
      //   liUniqueCount,
      //   liUniqueID,
      //   liRestrictions,
      //   liSalesCharCount
      // );
      if (this.iVCHistory.length > 0) {
        this.iVCHistory = this.iVCHistory.filter(vc => vc.CHAR_COUNT != 0 && vc.GROUP_COUNT != 0)
      }
      if (this.iVCHistory.length > 0) {
        try {
          //Alert if combination of PERIOD_NUM,PRODUCT_ID,GROUP_ID is less than  3
          const counts = this.iVCHistory.reduce((acc, obj) => {
            const key = `${obj.PERIOD_NUM}|${obj.PRODUCT_ID}|${obj.GROUP_ID}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});

          const filtered = this.iVCHistory.filter(obj => {
            const key = `${obj.PERIOD_NUM}|${obj.PRODUCT_ID}|${obj.GROUP_ID}`;
            return counts[key] < 3;
          });
          let alertLog = [
            ...new Map(
              filtered.map(obj => [`${obj.LOCATION_ID}|${obj.PRODUCT_ID}|${obj.GROUP_ID}`, {
                LOCATION_ID: obj.LOCATION_ID,
                PRODUCT_ID: obj.PRODUCT_ID,
                GROUP_ID_DESC: oUnique[obj.GROUP_ID]
              }])
            ).values()
          ];
          //Alert
          if (alertLog && alertLog.length > 0) {
            aAlertData = aAlertData.concat(alertLog);
          }

          // await INSERT(this.iVCHistory).into('CP_VC_HISTORY_TS');
          await cds.run(INSERT.into('CP_VC_HISTORY_TS').entries(this.iVCHistory));
        }
        catch (er) {
          this.oReturn.bError = true;
          this.oReturn.message = `Time Series History Generation Failed for Location: ${adata.LOCATION_ID}, Product: ${sOriginalProductID}.Reason: ${er.message}`;
          GenF.log(er);
        }
      }

      this.iVCHistory = [];

    }

    GenF.logMessage(req, `Completed history timeseries`);
    //Delete from Delta table based on Location and Product
    if (aSalesDeltaData.length > 0) {
      await cds.run(`DELETE FROM "CP_SALESH_CONFIG_DELTA" WHERE "LOCATION_ID"='${adata.LOCATION_ID}' AND "PRODUCT_ID"='${adata.PRODUCT_ID}'`)
    }

    // if (FlagTest === "S") {
    //   this.oReturn.bError = false;
    //   this.oReturn.message = "Timeseries History generation is complete";
    // } else if (FlagTest === "E") {
    //   this.oReturn.bError = true;
    //   this.oReturn.message = "Timeseries History generation failed";
    // } else if (FlagTest === "W") {
    //   let vWarmsg = `No Data to generate Timeseries History for  : ${adata.PRODUCT_ID}`;
    //   this.oReturn.bError = false;
    //   this.oReturn.message = vWarmsg;
    // } else {
    //   const vMsg = `Timeseries generation for the product: ${adata.PRODUCT_ID} is unsuccessful because of insufficient data`;
    //   this.oReturn.bError = true;
    //   this.oReturn.message = vMsg;
    // }
    if (aAlertData.length > 0) {
      const result = Object.values(
        aAlertData.reduce((acc, obj) => {
          const key = `${obj.LOCATION_ID}_${obj.PRODUCT_ID}`;
          if (!acc[key]) {
            acc[key] = {
              APPL: "VCPLANNER",
              MSGGRP: 'DATA',
              MSGID: 'S11',
              LOCATION_ID: obj.LOCATION_ID,
              PRODUCT_ID: obj.PRODUCT_ID,
              MSGTXT: new Set()
            };
          }
          acc[key].MSGTXT.add(obj.GROUP_ID_DESC);
          return acc;
        }, {})
      ).map(e => ({
        ...e,
        MSGTXT: Array.from(e.MSGTXT).join(', ')
      }));
      await GenF.sendAlert('C', result, req);
    }
    if (this.oReturn.bError === false) {
      this.oReturn.message = `Timeseries History generation is completed for Location: ${adata.LOCATION_ID}, Product: ${sOriginalProductID}`;
    }
    return this.oReturn;
  }

  async genTimeseriesFM1(adata, req, Flag, lastMonday) {

    const lStartTime = new Date();
    console.log("Started timeseries Future Service");
    const tCurrTimestamp = new Date().toISOString();
    var oReturn = {
      bError: false,
      message: ''
    }
    let lMainProduct = '';
    let aTSFuture = [], oTSFuture = {};
    let aTSPredictions = [], oTSPredictions = {};
    var aDeltaData = [];
    var sError = '';
    // Get Configurable product
    lMainProduct = await GenF.getConfigProd(adata.LOCATION_ID, adata.PRODUCT_ID);

    // Get Object Dependencies With Count of distinct Characteristic
    let aODData = [], aObjDep = [];
    aODData = await cds.run(`SELECT DISTINCT OBJ_DEP,
                                             COUNT(DISTINCT CHAR_NUM) AS COUNT
                                        FROM CP_UNIQUEID_OD_CHAR
                                       WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                         AND REF_PROID = '${lMainProduct}' 
                                       GROUP BY  OBJ_DEP
                                      ORDER BY OBJ_DEP`);
    if (aODData.length > 0) {
      // Map Object dependecies with Single Characteristic
      aObjDep = aODData.map(function (el) {
        if (el.COUNT === 1) {
          return el.OBJ_DEP;
        }
      }).filter((el) => !!el);

      console.log(aObjDep);
    }

    let firmPeriods = await GenF.getParameterValue(adata.LOCATION_ID, 9)
    let firmStartDate = lastMonday;
    if (firmPeriods) {
      firmStartDate = await GenF.addDays(lastMonday, 7 * parseInt(firmPeriods));
    }

    /** Get Future Plan */
    const liFutureCharPlan = await cds.run(`SELECT *
                                                 FROM "CP_IBP_FCHARPLAN"
                                                WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                                                  AND "PRODUCT_ID" = '${adata.PRODUCT_ID}'
                                                  AND "VERSION" = '${adata.VERSION}'
                                                  AND "SCENARIO" = '${adata.SCENARIO}'
                                                  AND "MODEL_VERSION" = '${adata.MODEL_VERSION}'
                                                  AND "WEEK_DATE">='${firmStartDate}'
                                             ORDER BY LOCATION_ID, 
                                                      PRODUCT_ID, 
                                                      VERSION,
                                                      SCENARIO,
                                                      MODEL_VERSION,
                                                      WEEK_DATE`
    );
    const liFutureDemand = await cds.run(`SELECT * 
                                            FROM "CP_IBP_FUTUREDEMAND" 
                                           WHERE "LOCATION_ID" = '${adata.LOCATION_ID}'
                                             AND "PRODUCT_ID" = '${adata.PRODUCT_ID}'
                                             AND "VERSION" = '${adata.VERSION}'
                                             AND "SCENARIO" = '${adata.SCENARIO}'
                                               AND "WEEK_DATE">='${firmStartDate}'`);

    //Making as objects for optimization
    var oFutureDemand = {};
    for (let x = 0; x < liFutureDemand.length; x++) {
      let { WEEK_DATE, QUANTITY } = liFutureDemand[x];
      oFutureDemand[WEEK_DATE] ??= {};
      oFutureDemand[WEEK_DATE]["DEMAND_QTY"] = QUANTITY;
    }

    for (let x = 0; x < liFutureCharPlan.length; x++) {
      let { WEEK_DATE, CHAR_NUM, CHARVAL_NUM, OPT_QTY } = liFutureCharPlan[x];

      oFutureDemand[WEEK_DATE] ??= {};
      oFutureDemand[WEEK_DATE]["OPT_QTY"] ??= {};
      oFutureDemand[WEEK_DATE]["OPT_QTY"][CHAR_NUM] ??= {};
      oFutureDemand[WEEK_DATE]["OPT_QTY"][CHAR_NUM][CHARVAL_NUM] = parseFloat(OPT_QTY);
    }

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

    let liObdhdrDist = await cds.run(`SELECT DISTINCT OBJ_DEP, CHAR_NUM 
                                        FROM "CP_UNIQUEID_OD_CHAR"
                                       WHERE LOCATION_ID = '${adata.LOCATION_ID}'
                                         AND REF_PROID = '${lMainProduct}'
                                         AND STATUS = 'S'
                                    ORDER BY OBJ_DEP, CHAR_NUM`);

    // Get Distinct Object Dependencies
    let oObjDep = {};

    liObdhdr = await cds.run(`SELECT DISTINCT A.UNIQUE_ID,
                                                          A.OBJ_DEP,
                                                          A.CHAR_NUM,
                                                          B.CHARVAL_NUM
                                                    FROM "CP_UNIQUEID_OD_CHAR" AS A
                                                    INNER JOIN V_UNIQUE_ID As B
                                                      ON A.UNIQUE_ID = B.UNIQUE_ID
                                                     AND A.CHAR_NUM = B.CHAR_NUM
                                                   WHERE A.LOCATION_ID = '${adata.LOCATION_ID}'
                                                     AND A.REF_PROID = '${lMainProduct}'
                                                     AND A.STATUS = 'S'`);
    if (liObdhdr && liObdhdr.length > 0) {
      for (let i = 0; i < liObdhdr.length; i++) {
        let { OBJ_DEP, CHAR_NUM, CHARVAL_NUM } = liObdhdr[i];
        oObjDep[OBJ_DEP] ??= {};
        oObjDep[OBJ_DEP][CHAR_NUM] ??= [];
        oObjDep[OBJ_DEP][CHAR_NUM].push(liObdhdr[i].CHARVAL_NUM);
      }
    }
   
    let lRowId = 0;

    for (let j = 0; j < liFutureDemand.length; j++) {
      lsObjdepF = {};
      console.log(`Processing Future Demand for ${liFutureDemand[j].WEEK_DATE}`);
      lsObjdepF.CAL_DATE = liFutureDemand[j].WEEK_DATE;
      lsObjdepF.LOCATION_ID = liFutureDemand[j].LOCATION_ID;
      lsObjdepF.PRODUCT_ID = liFutureDemand[j].PRODUCT_ID;
      lsObjdepF.VERSION = liFutureDemand[j].VERSION;
      lsObjdepF.SCENARIO = liFutureDemand[j].SCENARIO;
      lsObjdepF.MODEL_VERSION = adata.MODEL_VERSION;
      lsObjdepF.OBJ_TYPE = "OD";
      for (let k = 0; k < liObdhdrDist.length; k++) {
        console.log(`Processing Future Demand for ${liObdhdrDist[k].OBJ_DEP}`);
        lsObjdepF.OBJ_DEP = liObdhdrDist[k].OBJ_DEP;
        lsObjdepF.OBJ_COUNTER = 1;        
        lsObjdepF.CHAR_NUM = liObdhdrDist[k].CHAR_NUM;
        lsObjdepF.SUCCESS = 0;
        if(k === 0 || liObdhdrDist[k].OBJ_DEP !== liObdhdrDist[GenF.subOne(k, liObdhdrDist.length)].OBJ_DEP) { 
          lRowId = 1;
        } else if(liObdhdrDist[k].CHAR_NUM !== liObdhdrDist[GenF.subOne(k, liObdhdrDist.length)].CHAR_NUM) {
          lRowId = lRowId + 1;
        }
        lsObjdepF.ROW_ID = lRowId
        let aODChar = oObjDep[lsObjdepF.OBJ_DEP][lsObjdepF.CHAR_NUM];
        if(aODChar && aODChar.length > 0) {
          aODChar = [...new Set(aODChar)];
        for (let l = 0; l < aODChar.length; l++) {
          let optQty = -1;

          if(oFutureDemand[lsObjdepF.CAL_DATE]["OPT_QTY"]) {
            optQty = oFutureDemand[lsObjdepF.CAL_DATE]["OPT_QTY"][lsObjdepF.CHAR_NUM][aODChar[l]];
           }
          if (optQty !== -1 && optQty > 0) {
            lsObjdepF.SUCCESS = parseFloat(lsObjdepF.SUCCESS) + parseFloat(optQty);
          }

        }
      }
        if (oFutureDemand[lsObjdepF.CAL_DATE]["DEMAND_QTY"] !== null) {
          if (oFutureDemand[lsObjdepF.CAL_DATE]["DEMAND_QTY"] > 0) {
            lsObjdepF.SUCCESS_RATE =
              ((lsObjdepF.SUCCESS /
                oFutureDemand[lsObjdepF.CAL_DATE]["DEMAND_QTY"]) *
              100).toFixed(2);
          }
        }
        liObjdepF.push(GenF.parse(lsObjdepF));

      }

    }

    aObjDep = [];

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
          if (aTSFuture.length >= 1000) {
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
          if (aTSPredictions.length >= 1000) {
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
        sError = 'Reason: ' + e.message;
        console.log("Error: " + e.message + "/" + e.query);
      }
    }


    console.log("Completed timeseries future Service");

    var lProcessTime = Math.floor(
      Math.abs(lStartTime - new Date()) / 1000 / 60
    );
    console.log(
      "Processing time : " + lProcessTime + " Minutes"
    );

    if (aDeltaData.length > 0) {
      try {
        await UPSERT.into("CP_FORECAST_DELTA_WEEKS").entries(aDeltaData)
      }
      catch {
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
      oReturn.message = `Timeseries Future generation failed for Location: ${adata.LOCATION_ID} and Product: ${adata.PRODUCT_ID}.` + sError;
      // await GenF.jobSchMessage(Flag, `Timeseries Future generation failed`, req);
    }
    return oReturn;
  }

}

module.exports = GenTimeseriesC;