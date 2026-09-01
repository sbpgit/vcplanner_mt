const request = require("request");
const cds = require("@sap/cds");
const GenF = require("./gen-functions");
const hana = require("@sap/hana-client");
const { createLogger, format, transports } = require("winston");
const GenFunctions = require("./gen-functions");
const { combine, timestamp, label, prettyPrint } = format;

class DerivedConfig {
  constructor() { }
  /**
   * Get Sales History for location - product.
   * Process each rule to get success and failed percentage of each rule
   * @param {*} lLocation
   * @param {*} lProduct
   * @param {*} lWeekDate
   * @param {*} lVersion
   * @param {*} lScenario
   */
  async genDerivedCharPercent(
    lLocation,
    lProduct,
    lWeekDate,
    lVersion,
    lScenario
  ) {
    let oIndepntChar = {},
      aIndepntChar = [];
    let aPopulatedChar = [],
      oPopulatedChar = {};
    let lRefProd = "";
    let oLPVerScenWk = {};
    const oReturn = {
      "error": false,
      "message": ''
    }
    // Get Configurable product
    let lsMainProduct = await SELECT.one
      .from("CP_PARTIALPROD_INTRO")
      .columns("REF_PRODID")
      .where(`LOCATION_ID = '${lLocation}' AND PRODUCT_ID = '${lProduct}'`);
    if (lsMainProduct === null || lsMainProduct == undefined) {
      lRefProd = GenF.parse(lProduct);
    } else {
      lRefProd = lsMainProduct.REF_PRODID;
    }

    // Get All Locations / Products / Characteristics from Master Data
    let aProdChar = await cds.run(`SELECT DISTINCT CLASS_NUM, 
                                                   CHAR_NUM
                                            FROM V_PARTIALPRODCLASSCHAR 
                                            WHERE LOCATION_ID = '${lLocation}'
                                              AND PRODUCT_ID = '${lProduct}'
                                              AND REF_PRODID = '${lRefProd}'
                                              AND IBPCHAR_CHK = true`);

    // Get Rule Information
    let aDerivedChar = await cds.run(`SELECT * 
                                            FROM CP_DERIVEDCHAR
                                           WHERE PRODUCT_ID = '${lRefProd}' 
                                             AND RULE_TYPE <> 'D'
                                             AND VALID_TO >= '${lWeekDate}'
                                           ORDER BY DEP_NAME, 
                                                    CHAR_COUNTER`);

    /*
     * Temperory Logic to be deleted
     */
    // aDerivedChar = aDerivedChar.filter(function (aDerChar) {
    //   return aDerChar.DEP_NAME === "CN_SCN_04_1" ||
    //     aDerChar.DEP_NAME === "CN_SCN_04_2" ||
    //     aDerChar.DEP_NAME === "CN_SCN_04_3"
    // });


    // Get Future Characteristics Plan from IBP
    let aFutureCharPlan = await cds.run(`SELECT *
                                                FROM "V_FCHARPLAN" AS A
                                               INNER JOIN CP_PARTIALPROD_INTRO AS B
                                                  ON B.LOCATION_ID = A.LOCATION_ID
                                                 AND B.PRODUCT_ID = A.PRODUCT_ID
                                               WHERE A.LOCATION_ID = '${lLocation}'
                                                 AND B.PRODUCT_ID = '${lProduct}'
                                                 AND B.REF_PRODID = '${lRefProd}'
                                                 AND A.WEEK_DATE = '${lWeekDate}'
                                                 AND A.VERSION = '${lVersion}'
                                                 AND A.SCENARIO = '${lScenario}'`);

    console.log("Future Char Plan: " + aFutureCharPlan.length);

    let aDCInValidUniqId = [];

    let aDerCharThen = aDerivedChar.filter(function (aDerChar) {
      return aDerChar.CLAUSE === "T";
    });

    let bIsDepChar = false;

    aIndepntChar = [];

    // ** Begin - Independent Characteristics with Option Percentages

    if (aProdChar.length) {
      let bFound = false;

      for (let cntCV = 0; cntCV < aProdChar.length; cntCV++) {
        bIsDepChar = false;
        // Check if chatracteristics is derived from other char
        for (let cntDC = 0; cntDC < aDerCharThen.length; cntDC++) {
          if (
            aProdChar[cntCV].CLASS_NUM === aDerCharThen[cntDC].CLASS_NUM &&
            aProdChar[cntCV].CHAR_NUM === aDerCharThen[cntDC].CHAR_NUM
          ) {
            bIsDepChar = true;
            break;
          }
        }

        // If current characteristic is independent, store its future char plan from IBP in a new array as Independent characteristics
        if (bIsDepChar === false) {
          for (
            let cntFutCP = 0;
            cntFutCP < aFutureCharPlan.length;
            cntFutCP++
          ) {
            bFound === false;
            if (
              aProdChar[cntCV].CHAR_NUM === aFutureCharPlan[cntFutCP].CHAR_NUM
            ) {
              // Independent Class - Characteristics - Values
              oIndepntChar.PRODUCT_ID = aFutureCharPlan[cntFutCP].PRODUCT_ID;
              oIndepntChar.LOCATION_ID = aFutureCharPlan[cntFutCP].LOCATION_ID;
              oIndepntChar.CLASS_NUM = aProdChar[cntCV].CLASS_NUM;
              oIndepntChar.CHAR_NUM = aProdChar[cntCV].CHAR_NUM;
              oIndepntChar.CHARVAL_NUM = aFutureCharPlan[cntFutCP].CHARVAL_NUM;
              oIndepntChar.CHAR_VALUE = aFutureCharPlan[cntFutCP].CHAR_VALUE;
              oIndepntChar.WEEK_DATE = aFutureCharPlan[cntFutCP].WEEK_DATE;
              oIndepntChar.VERSION = aFutureCharPlan[cntFutCP].VERSION;
              oIndepntChar.SCENARIO = aFutureCharPlan[cntFutCP].SCENARIO;
              oIndepntChar.OPT_PERCENT = aFutureCharPlan[cntFutCP].OPT_PERCENT;
              oIndepntChar.IS_INDEPENDENT = true;

              aIndepntChar.push(GenF.parse(oIndepntChar));
              oIndepntChar = {};

              // Check if Char Num is already populated
              if (aPopulatedChar.length > 0) {
                bFound = aPopulatedChar.some(
                  (item) =>
                    item.CLASS_NUM === aProdChar[cntCV].CLASS_NUM &&
                    item.CHAR_NUM === aProdChar[cntCV].CHAR_NUM
                );
              }

              // Independent Class - Characteristics
              if (bFound === false) {
                oPopulatedChar.CLASS_NUM = aProdChar[cntCV].CLASS_NUM;
                oPopulatedChar.WEEK_DATE = aFutureCharPlan[cntFutCP].WEEK_DATE;
                oPopulatedChar.VERSION = aFutureCharPlan[cntFutCP].VERSION;
                oPopulatedChar.SCENARIO = aFutureCharPlan[cntFutCP].SCENARIO;
                oPopulatedChar.CHAR_NUM = aProdChar[cntCV].CHAR_NUM;
                aPopulatedChar.push(GenF.parse(oPopulatedChar));
                oPopulatedChar = {};
              }
            }
          }
        }
      }
    }
    // ** End - Independent Characteristics with Option Percentages

    // Create nested array with distinct Object Dependencies and its rules
    let aDCHeadItem = aDerivedChar.reduce((aRules, curr) => {
      const ITEM = [];
      const {
        PRODUCT_ID,
        RECORD_TYPE,
        CLAUSE,
        DEP_NAME,
        CLASS_NUM,
        CHAR_NUM,
        CHARVAL_NUM,
        CHAR_VALUE,
        SORT_COUNTER,
        CHAR_COUNTER,
        OD_CONDITION,
        RULE_TYPE,
      } = curr;
      const findObj = aRules.find((o) => o.DEP_NAME === DEP_NAME);
      if (!findObj) {
        ITEM.push({
          RECORD_TYPE,
          CLAUSE,
          CLASS_NUM,
          CHAR_NUM,
          CHARVAL_NUM,
          CHAR_VALUE,
          CHAR_COUNTER,
          OD_CONDITION,
          RULE_TYPE,
        });
        aRules.push({ DEP_NAME, ITEM });
      } else {
        findObj.ITEM.push({
          RECORD_TYPE,
          CLAUSE,
          CLASS_NUM,
          CHAR_NUM,
          CHARVAL_NUM,
          CHAR_VALUE,
          CHAR_COUNTER,
          OD_CONDITION,
          RULE_TYPE,
        });
      }
      return aRules;
    }, []);

    oLPVerScenWk.LOCATION_ID = lLocation;
    oLPVerScenWk.PRODUCT_ID = lProduct;
    oLPVerScenWk.WEEK_DATE = lWeekDate;
    oLPVerScenWk.VERSION = lVersion;
    oLPVerScenWk.SCENARIO = lScenario;

    // Generate Option Percentage for each derived char from rules
    await this.genDerivedCharOPT(
      aDCHeadItem,
      aPopulatedChar,
      aIndepntChar,
      oLPVerScenWk
    );

    // Once all the rules are processed, update independent and derived characteristics option percent to table
    if (aIndepntChar.length > 0) {
      let bFlag = "";
      console.log("Derived Config:" + aIndepntChar.length);

      // Call function to update characteristics option percent
      bFlag = await this.updateDerivedConfig(aIndepntChar);

      if (bFlag === "X") {
        console.log(
          "Successfully updated Option Plan with Derived Char for product " +
          lProduct
        );
        oReturn.error = false;
      } else {
        console.log(
          "Failed to update Option Plan with Derived Char for product " +
          lProduct
        );
        oReturn.error = true;
        oReturn.message = "Failed to update Option Plan with Derived Char for product " + lProduct;
        // throw new Error("Failed to update Option Plan with Derived Char for product " + lProduct);
      }
    }
    else {
      oReturn.error = true;
      oReturn.message = "Insufficient Data to update Option Plan with Derived Char for product " + lProduct;
    }
    return oReturn;
  }

  /**
   * Generate Option Percentage for each derived characteristic
   * @param {*} aDCHeadItem
   * @param {*} aPopulatedChar
   * @param {*} aIndepntChar
   * @param {*} oLPVerScenWk
   * @returns
   */
  async genDerivedCharOPT(
    aDCHeadItem,
    aPopulatedChar,
    aIndepntChar,
    oLPVerScenWk
  ) {
    let aCharOpt = [],
      oCharOpt = {};
    let aCharValOpt = [];
    let bFound = false;
    let bFailed = false;
    let bProcess = false;
    let aDCHeadItemTemp = [],
      iIndx = -1;

    aDCHeadItemTemp = GenF.parse(aDCHeadItem);

    for (let cntDCHI = 0; cntDCHI < aDCHeadItem.length; cntDCHI++) {

      let aDCItems = aDCHeadItem[cntDCHI].ITEM;
      aDCHeadItem[cntDCHI].RULE_ITEM_QTY = [];
      aDCHeadItem[cntDCHI].RULE_PERCENT = 0;
      bFailed = false;
      iIndx = -1;

      // Get Rule Item Details
      if (aDCHeadItem[cntDCHI].RULE_ITEM_QTY.length === 0) {
        aDCHeadItem[cntDCHI].RULE_ITEM_QTY = await cds.run(`SELECT CLASS_NUM,
                                                                   CHAR_NUM,
                                                                   CHARVAL_NUM,
                                                                   CHAR_VALUE,
                                                                   SUCCESS_PER,
                                                                   FAILED_PER
                                                              FROM CP_DERIVED_PERCENTAGE
                                                              WHERE LOCATION_ID = '${oLPVerScenWk.LOCATION_ID}'
                                                                AND PRODUCT_ID = '${oLPVerScenWk.PRODUCT_ID}'
                                                                AND DEP_NAME   = '${aDCHeadItem[cntDCHI].DEP_NAME}'`);
      }

      //SORT
      aDCItems = aDCItems.sort(function (a, b) {
        return b.CLAUSE - a.CLAUSE && a.CHAR_COUNTER - b.CHAR_COUNTER;
      });

      let aFilPopChar = [];
      // Validate if we can process this rule to get Option Percentage
      for (let cntDCI = 0; cntDCI < aDCItems.length; cntDCI++) {
        bFailed = false;
        if (aDCItems[cntDCI].CLAUSE === "I") {
          aFilPopChar = aPopulatedChar.filter(function (aPopChar) {
            return (
              aPopChar.CLASS_NUM === aDCItems[cntDCI].CLASS_NUM &&
              aPopChar.CHAR_NUM === aDCItems[cntDCI].CHAR_NUM &&
              aPopChar.VERSION === oLPVerScenWk.VERSION &&
              aPopChar.SCENARIO === oLPVerScenWk.SCENARIO &&
              aPopChar.WEEK_DATE === oLPVerScenWk.WEEK_DATE
            );
          });

          if (aFilPopChar.length === 0) {
            bFailed = true;
            break;
          }
        }
      }

      //

      if (bFailed === true) {
        continue;
      } else {

        // Set flag to Continue recursive process if any of the rule has been processed for current iteration.
        // otherwise delete all the rules and stop recursive call.
        bProcess = true;

        let iCharPer = 0.0;
        let aCharPer = [];
        let iRulePer = 0.0;
        bFound === false;

        for (let cntDCI = 0; cntDCI < aDCItems.length; cntDCI++) {
          let aFilOptPer = [];

          if (aDCItems[cntDCI].CLAUSE === "I") {
            if (aDCItems[cntDCI].OD_CONDITION === "EQ") {
              aFilOptPer = aIndepntChar.filter(function (aOptPer) {
                return (
                  aOptPer.CLASS_NUM === aDCItems[cntDCI].CLASS_NUM &&
                  aOptPer.CHAR_NUM === aDCItems[cntDCI].CHAR_NUM &&
                  aOptPer.CHAR_VALUE === aDCItems[cntDCI].CHAR_VALUE &&
                  aOptPer.WEEK_DATE === oLPVerScenWk.WEEK_DATE &&
                  aOptPer.VERSION === oLPVerScenWk.VERSION &&
                  aOptPer.SCENARIO === oLPVerScenWk.SCENARIO
                );
              });
            } else {
              aFilOptPer = aIndepntChar.filter(function (aOptPer) {
                return (
                  aOptPer.CLASS_NUM === aDCItems[cntDCI].CLASS_NUM &&
                  aOptPer.CHAR_NUM === aDCItems[cntDCI].CHAR_NUM &&
                  aOptPer.CHAR_VALUE !== aDCItems[cntDCI].CHAR_VALUE &&
                  aOptPer.WEEK_DATE === oLPVerScenWk.WEEK_DATE &&
                  aOptPer.VERSION === oLPVerScenWk.VERSION &&
                  aOptPer.SCENARIO === oLPVerScenWk.SCENARIO
                );
              });
            }

            if (aFilOptPer.length > 0) {
              if (
                cntDCI === 0 ||
                aDCItems[cntDCI].CHAR_COUNTER !==
                aDCItems[GenF.subOne(cntDCI, aDCItems.length)].CHAR_COUNTER ||
                aDCItems[cntDCI].CLAUSE !==
                aDCItems[GenF.subOne(cntDCI, aDCItems.length)].CLAUSE
              ) {
                iCharPer = 0.0;
              }

              if (aFilOptPer[0].OPT_PERCENT > 0) {
                iCharPer = parseFloat(iCharPer) + parseFloat(aFilOptPer[0].OPT_PERCENT);
              }

            }

            if (
              cntDCI === GenF.addOne(cntDCI, aDCItems.length) ||
              aDCItems[cntDCI].CHAR_COUNTER !==
              aDCItems[GenF.addOne(cntDCI, aDCItems.length)].CHAR_COUNTER ||
              aDCItems[cntDCI].CLAUSE !==
              aDCItems[GenF.addOne(cntDCI, aDCItems.length)].CLAUSE
            ) {
              if (iCharPer > 0) {
                iCharPer = iCharPer / 100;
              }
              aCharPer.push(GenF.parse(iCharPer));
            }
          }

          if (aCharPer.length > 0 && cntDCI === GenF.addOne(cntDCI, aDCItems.length)) {
            // for (let cntChrP = 0; cntChrP < aCharPer.length; cntChrP++) {
            //   // iRulePer = iRulePer * aCharPer[cntChrP];
            //   // Considering minimum percent between two different characteristics
            //   if(aCharPer[cntChrP] < iRulePer) {
            //     iRulePer = aCharPer[cntChrP];
            //   }
            // }

            // Considering minimum percent between different characteristics
            iRulePer = Math.min(...aCharPer);
            aCharPer = [];
          }
        }

        aDCHeadItem[cntDCHI].RULE_PERCENT = GenF.parse(parseFloat(iRulePer).toFixed(4));

        let oCharValOpt = {},
          aCharValueOptPR = [];
        oCharOpt.VALUE = [];
        let iCharIndex = -1;
        let oPopulatedChar = {};
        if (aDCHeadItem[cntDCHI].RULE_ITEM_QTY.length > 0) {
          // Sort
          aDCHeadItem[cntDCHI].RULE_ITEM_QTY = aDCHeadItem[cntDCHI].RULE_ITEM_QTY.sort(function (a, b) {
            return a.CLASS_NUM - b.CLASS_NUM && a.CHAR_NUM - b.CHAR_NUM;
          });

          // Delete Duplicates
          const keys = ["CLASS_NUM", "CHAR_NUM"];
          let aDistRuleItems = GenF.removeDuplicate(
            aDCHeadItem[cntDCHI].RULE_ITEM_QTY,
            keys
          );

          for (let cntDRI = 0; cntDRI < aDistRuleItems.length; cntDRI++) {
            oCharOpt = {};
            oCharOpt.VALUE = [];
            aCharValueOptPR = [];
            oCharValOpt = {};
            bFound = false;
            let aFilCharOpt = [];
            let bSalesHis = false;

            oPopulatedChar.CLASS_NUM = aDistRuleItems[cntDRI].CLASS_NUM;
            oPopulatedChar.WEEK_DATE = oLPVerScenWk.WEEK_DATE;
            oPopulatedChar.VERSION = oLPVerScenWk.VERSION;
            oPopulatedChar.SCENARIO = oLPVerScenWk.SCENARIO;
            oPopulatedChar.CHAR_NUM = aDistRuleItems[cntDRI].CHAR_NUM;

            aPopulatedChar.push(GenF.parse(oPopulatedChar));
            oPopulatedChar = {};

            oCharOpt.CLASS_NUM = aDistRuleItems[cntDRI].CLASS_NUM;
            oCharOpt.CHAR_NUM = aDistRuleItems[cntDRI].CHAR_NUM;


            for (
              let cntRI = 0;
              cntRI < aDCHeadItem[cntDCHI].RULE_ITEM_QTY.length;
              cntRI++
            ) {
              aCharValueOptPR = [], oCharValOpt = {};
              if (
                aDCHeadItem[cntDCHI].RULE_ITEM_QTY[cntRI].CLASS_NUM ===
                aDistRuleItems[cntDRI].CLASS_NUM &&
                aDCHeadItem[cntDCHI].RULE_ITEM_QTY[cntRI].CHAR_NUM ===
                aDistRuleItems[cntDRI].CHAR_NUM
              ) {
                // check if sales history exists
                if (aDCHeadItem[cntDCHI].RULE_ITEM_QTY[cntRI].SUCCESS_PER > 0 ||
                  aDCHeadItem[cntDCHI].RULE_ITEM_QTY[cntRI].FAILED_PER > 0) {
                  bSalesHis = true;
                }

                // oCharValOpt.CHARVAL_NUM =
                //   aDCHeadItem[cntDCHI].RULE_ITEM_QTY[cntRI].CHARVAL_NUM;
                oCharValOpt.CHAR_VALUE =
                  aDCHeadItem[cntDCHI].RULE_ITEM_QTY[cntRI].CHAR_VALUE;
                oCharValOpt.SUCCESS_PER =
                  aDCHeadItem[cntDCHI].RULE_ITEM_QTY[cntRI].SUCCESS_PER *
                  aDCHeadItem[cntDCHI].RULE_PERCENT;

                oCharValOpt.FAILED_PER = aDCHeadItem[cntDCHI].RULE_ITEM_QTY[cntRI].FAILED_PER;

                aCharValueOptPR.push(GenF.parse(oCharValOpt));

              }

              for (let cntChrV = 0; cntChrV < aCharValOpt.length; cntChrV++) {
                if (
                  aDistRuleItems[cntDRI].CLASS_NUM ===
                  aCharValOpt[cntChrV].CLASS_NUM &&
                  aDistRuleItems[cntDRI].CHAR_NUM ===
                  aCharValOpt[cntChrV].CHAR_NUM
                ) {
                  iCharIndex = cntChrV;

                  bFound = true;
                  break;
                }
              }

              if (bFound === false) {
                oCharOpt.VALUE.push(aCharValueOptPR);
                aCharValOpt.push(GenF.parse(oCharOpt));
              } else {
                if (iCharIndex > -1) {
                  aCharValOpt[iCharIndex].VALUE.push(aCharValueOptPR);
                }
              }

              // At Last
              if (bSalesHis === false) {
                if (cntRI === GenF.addOne(cntRI, aDCHeadItem[cntDCHI].RULE_ITEM_QTY.length)) {
                  aFilCharOpt = aCharValOpt.filter(function (aCharOpt) {
                    return aCharOpt.CLASS_NUM === aDistRuleItems[cntDRI].CLASS_NUM &&
                      aCharOpt.CHAR_NUM === aDistRuleItems[cntDRI].CHAR_NUM;
                  });
                  if (aFilCharOpt.length > 0) {
                    let iCount = 0,
                      fOptPer = 0.0,
                      aCharValOptionPer = [];
                    iCount = aFilCharOpt[0].VALUE.length;
                    if (iCount > 0) {
                      fOptPer = parseFloat(aDCHeadItem[cntDCHI].RULE_PERCENT) / parseInt(iCount);
                    }

                    for (let cntFCO = 0; cntFCO < aFilCharOpt[0].VALUE.length; cntFCO++) {
                      if (aFilCharOpt[0].VALUE[cntFCO][0].SUCCESS_PER === 0
                        && aFilCharOpt[0].VALUE[cntFCO][0].FAILED_PER === 0)
                        aFilCharOpt[0].VALUE[cntFCO].FAILED_PER = fOptPer;
                    }
                  }
                }
              }

            }
          }
        }
      }

      // After processing each rule, it is spliced from the temporary array. 
      // Delete current rule after processing
      // Find index position of the dependency in the temporary and delete it
      iIndx = aDCHeadItemTemp.findIndex(
        (item) => item.DEP_NAME === aDCHeadItem[cntDCHI].DEP_NAME
      );
      if (iIndx > -1) {
        console.log("Index " + iIndx);
        aDCHeadItemTemp.splice(iIndx, 1);
      }
    }

    aDCHeadItem = aDCHeadItemTemp;

    if (aCharValOpt.length > 0) {
      for (let cntChVl = 0; cntChVl < aCharValOpt.length; cntChVl++) {
        // Generate option percent for each derived rule
        let aCharValPer = await this.genCharOptionPercent(aCharValOpt[cntChVl]);
        // Update generated option percent to Independent array for next level processing
        await this.updateIndepndtChar(
          aCharValOpt[cntChVl],
          aCharValPer,
          aIndepntChar,
          oLPVerScenWk
        );
      }
    }

    if (aDCHeadItem.length === 0) {
      return;
    } else {
      console.log("Rule Length:" + aDCHeadItem.length);
      if (bProcess === true) {
        // If atleat one rule is processed in the previous iteration and there exists remaining rules to be processed
        await this.genDerivedCharOPT(
          aDCHeadItem,
          aPopulatedChar,
          aIndepntChar,
          oLPVerScenWk
        );
      } else {
        aDCHeadItem = [];
        return;
      }
    }
  }

  /**
   * Calculate each characteristic option percent
   * @param {*} aCharValOptnPer
   * @returns
   */
  async genCharOptionPercent(aCharValOptnPer) {
    let aCharValOptPer = aCharValOptnPer.VALUE;
    let oCharValOpt = {},
      aCharValOpt = [];
    let bFound = false;
    let aCharValues = [];
    let iTotalFPer = 0.0,
      iTotalSuc_Per = 0.0,
      iTotalFailed_Per = 0.0;

    for (let cntCVPer = 0; cntCVPer < aCharValOptPer.length; cntCVPer++) {
      aCharValues = aCharValOptPer[cntCVPer];
      bFound = false;

      for (let cntChrV = 0; cntChrV < aCharValues.length; cntChrV++) {
        for (let cntCVO = 0; cntCVO < aCharValOpt.length; cntCVO++) {
          if (
            aCharValues[cntChrV].CHAR_VALUE === aCharValOpt[cntCVO].CHAR_VALUE
          ) {
            aCharValOpt[cntCVO].SUCCESS_PER =
              aCharValOpt[cntCVO].SUCCESS_PER + aCharValues[cntChrV].SUCCESS_PER;

            aCharValOpt[cntCVO].FAILED_PER =
              aCharValOpt[cntCVO].FAILED_PER + aCharValues[cntChrV].FAILED_PER;

            bFound = true;
            break;
          }
        }

        if (bFound === false) {
          oCharValOpt.CHAR_VALUE = aCharValues[cntChrV].CHAR_VALUE;
          oCharValOpt.SUCCESS_PER = aCharValues[cntChrV].SUCCESS_PER;

          oCharValOpt.FAILED_PER = aCharValues[cntChrV].FAILED_PER;

          aCharValOpt.push(GenF.parse(oCharValOpt));
        }
      }
    }

    if (aCharValOpt.length > 0) {
      for (let cntCVOP = 0; cntCVOP < aCharValOpt.length; cntCVOP++) {

        iTotalSuc_Per = (parseFloat(iTotalSuc_Per) + parseFloat(aCharValOpt[cntCVOP].SUCCESS_PER)).toFixed(4);
        iTotalFPer = (parseFloat(iTotalFPer) + parseFloat(aCharValOpt[cntCVOP].FAILED_PER)).toFixed(4);
      }

      // Calculate Failed Percentage
      if (iTotalSuc_Per < 100.0000) {
        iTotalFailed_Per = parseFloat(100.0000 - iTotalSuc_Per).toFixed(4);
        if (iTotalFPer > 0) {
          iTotalFailed_Per = (iTotalFailed_Per / iTotalFPer).toFixed(4);
        }
      }


      for (let cntCVOP = 0; cntCVOP < aCharValOpt.length; cntCVOP++) {

        if (iTotalFailed_Per > 0) {
          aCharValOpt[cntCVOP].FAILED_PER = parseFloat(aCharValOpt[cntCVOP].FAILED_PER * iTotalFailed_Per).toFixed(4);
        } else {
          aCharValOpt[cntCVOP].FAILED_PER = 0.0;
        }
      }

      for (let cntCVOP = 0; cntCVOP < aCharValOpt.length; cntCVOP++) {

        aCharValOpt[cntCVOP].SUCCESS_PER = (parseFloat(aCharValOpt[cntCVOP].SUCCESS_PER) + parseFloat(aCharValOpt[cntCVOP].FAILED_PER)).toFixed();

      }

    }

    return aCharValOpt;
  }
  /**
   * Update characteristic option percent after each iteration / level into an array
   * to derive next level of rules
   * @param {*} aCharOpt
   * @param {*} aCharValPer
   * @param {*} aIndepntChar
   * @param {*} oLPVerScenWk
   */
  async updateIndepndtChar(aCharOpt, aCharValPer, aIndepntChar, oLPVerScenWk) {
    let oIndepntChar = {};
    let bFound = false;

    if (aIndepntChar.length > 0) {
      for (let cntCVP = 0; cntCVP < aCharValPer.length; cntCVP++) {
        bFound = false;

        for (let cntIC = 0; cntIC < aIndepntChar.length; cntIC++) {
          if (
            aIndepntChar[cntIC].CLASS_NUM === aCharOpt.CLASS_NUM &&
            aIndepntChar[cntIC].CHAR_NUM === aCharOpt.CHAR_NUM &&
            aIndepntChar[cntIC].CHAR_VALUE ===
            aCharValPer[cntCVP].CHAR_VALUE &&
            aIndepntChar[cntIC].WEEK_DATE === oLPVerScenWk.WEEK_DATE &&
            aIndepntChar[cntIC].VERSION === oLPVerScenWk.VERSION &&
            aIndepntChar[cntIC].SCENARIO === oLPVerScenWk.SCENARIO
          ) {
            aIndepntChar[cntIC].OPT_PERCENT = aCharValPer[cntCVP].SUCCESS_PER;

            bFound = true;
            break;
          }
        }

        if (bFound === false) {
          oIndepntChar.PRODUCT_ID = aIndepntChar[0].PRODUCT_ID;
          oIndepntChar.LOCATION_ID = aIndepntChar[0].LOCATION_ID;
          oIndepntChar.CLASS_NUM = aCharOpt.CLASS_NUM;
          oIndepntChar.CHAR_NUM = aCharOpt.CHAR_NUM;
          oIndepntChar.CHARVAL_NUM = aCharValPer[cntCVP].CHARVAL_NUM;
          oIndepntChar.CHAR_VALUE = aCharValPer[cntCVP].CHAR_VALUE;
          oIndepntChar.WEEK_DATE = oLPVerScenWk.WEEK_DATE;
          oIndepntChar.VERSION = oLPVerScenWk.VERSION;
          oIndepntChar.SCENARIO = oLPVerScenWk.SCENARIO;
          oIndepntChar.OPT_PERCENT = aCharValPer[cntCVP].SUCCESS_PER;
          oIndepntChar.IS_INDEPENDENT = false;

          aIndepntChar.push(GenF.parse(oIndepntChar));
        }
      }
    }
  }
  /**
   * Method to update derived configuration option percentages of location-product
   * @param {*} aCharOpt
   * @param {*} bFlag
   */
  async updateDerivedConfig(aCharOpt) {
    let oMarketAuth = {},
      aMarketAuth = [];
    let bDeleted = false;
    let oIBPFCharPlan = {},
      aIBPFCharPlan = [];
    let bFound = false;
    let bFlag = '';

    let aClassDet = await cds.run(`SELECT * FROM CP_CLASS WHERE IBPCHAR_CHK = false`);

    let fIBP_OPTQTY = 0.0;
    for (let icntOP = 0; icntOP < aCharOpt.length; icntOP++) {
      bDeleted = false;
      bFound = false;

      // Update only dependent Characteristics
      if (aCharOpt[icntOP].IS_INDEPENDENT === false) {

        // Get Option Quantity from Future Demand
        if (icntOP === 0 || fIBP_OPTQTY === 0.0) {
          fIBP_OPTQTY = await cds.run(`SELECT QUANTITY
                                          FROM CP_IBP_FUTUREDEMAND
                                         WHERE LOCATION_ID = '${aCharOpt[icntOP].LOCATION_ID}'
                                           AND PRODUCT_ID = '${aCharOpt[icntOP].PRODUCT_ID}'
                                           AND VERSION = '${aCharOpt[icntOP].VERSION}'
                                           AND SCENARIO = '${aCharOpt[icntOP].SCENARIO}'
                                           AND WEEK_DATE  = '${aCharOpt[icntOP].WEEK_DATE}'`);
        }

        // Delete existing config
        try {
          await DELETE.from("CP_MARKETAUTH_CFG")
            .where(`WEEK_DATE  = '${aCharOpt[icntOP].WEEK_DATE}'
                      AND LOCATION_ID = '${aCharOpt[icntOP].LOCATION_ID}' 
                      AND PRODUCT_ID = '${aCharOpt[icntOP].PRODUCT_ID}'
                      AND CLASS_NUM = '${aCharOpt[icntOP].CLASS_NUM}'
                      AND CHAR_NUM = '${aCharOpt[icntOP].CHAR_NUM}'
                      AND CHARVAL_NUM = '${aCharOpt[icntOP].CHAR_VALUE}'
                      AND VERSION = '${aCharOpt[icntOP].VERSION}'
                      AND SCENARIO = '${aCharOpt[icntOP].SCENARIO}'
                    `);

          // Check if current class is not sent to IBP
          if (aClassDet.length > 0) {
            bFound = aClassDet.some(
              (item) =>
                item.CLASS_NUM === aCharOpt[icntOP].CLASS_NUM
            );

            if (bFound === true) {
              // await cds.run(
              //   `DELETE FROM "CP_IBP_FCHARPLAN" 
              //       WHERE "LOCATION_ID" = '${aCharOpt[icntOP].LOCATION_ID}'                                             
              //         AND "PRODUCT_ID" = '${aCharOpt[icntOP].PRODUCT_ID}'
              //         AND "CLASS_NUM" = '${aCharOpt[icntOP].CLASS_NUM}' 
              //         AND "CHAR_NUM" = '${aCharOpt[icntOP].CHAR_NUM}' 
              //         AND "CHARVAL_NUM" = '${aCharOpt[icntOP].CHAR_VALUE}' 
              //         AND "VERSION" = '${aCharOpt[icntOP].VERSION}'
              //         AND "WEEK_DATE" = '${aCharOpt[icntOP].WEEK_DATE}'`);
            }
          }

          bDeleted = true;
        } catch (e) {
          console.log("unable to delete config");
        }

        if (bDeleted === true) {
          // console.log(aCharOpt[icntOP].CHARVAL_NUM);


          // Market Auth Config (Derived Percenates)
          oMarketAuth["WEEK_DATE"] = aCharOpt[icntOP].WEEK_DATE;
          oMarketAuth["LOCATION_ID"] = aCharOpt[icntOP].LOCATION_ID;
          oMarketAuth["PRODUCT_ID"] = aCharOpt[icntOP].PRODUCT_ID;
          oMarketAuth["CLASS_NUM"] = aCharOpt[icntOP].CLASS_NUM;
          oMarketAuth["CHAR_NUM"] = aCharOpt[icntOP].CHAR_NUM;
          oMarketAuth["CHARVAL_NUM"] = aCharOpt[icntOP].CHAR_VALUE;
          oMarketAuth["VERSION"] = aCharOpt[icntOP].VERSION;
          oMarketAuth["SCENARIO"] = aCharOpt[icntOP].SCENARIO;
          oMarketAuth["OPT_PERCENT"] = aCharOpt[icntOP].OPT_PERCENT;

          aMarketAuth.push(GenF.parse(oMarketAuth));
          oMarketAuth = {};

          if (bFound === true) {
            oIBPFCharPlan["WEEK_DATE"] = aCharOpt[icntOP].WEEK_DATE;
            oIBPFCharPlan["LOCATION_ID"] = aCharOpt[icntOP].LOCATION_ID;
            oIBPFCharPlan["PRODUCT_ID"] = aCharOpt[icntOP].PRODUCT_ID;
            oIBPFCharPlan["CLASS_NUM"] = aCharOpt[icntOP].CLASS_NUM;
            oIBPFCharPlan["CHAR_NUM"] = aCharOpt[icntOP].CHAR_NUM;
            oIBPFCharPlan["CHARVAL_NUM"] = aCharOpt[icntOP].CHAR_VALUE;
            oIBPFCharPlan["VERSION"] = aCharOpt[icntOP].VERSION;
            oIBPFCharPlan["SCENARIO"] = aCharOpt[icntOP].SCENARIO;
            oIBPFCharPlan["OPT_PERCENT"] = aCharOpt[icntOP].OPT_PERCENT;
            // Calculate Option Quantity based on Future Demand (Demand * DerivedPercent / 100)
            if (fIBP_OPTQTY[0].QUANTITY > 0) {
              oIBPFCharPlan["OPT_QTY"] = parseFloat(fIBP_OPTQTY[0].QUANTITY * oIBPFCharPlan["OPT_PERCENT"] / 100).toFixed(3);
            }
            oIBPFCharPlan["MANUALOPTION"] = 0.0;

            aIBPFCharPlan.push(GenF.parse(oIBPFCharPlan));
            oIBPFCharPlan = {};
          }
        }
      }
    }

    // Insert generated option percent from derived rules to table
    if (aMarketAuth.length > 0) {
      try {
        await INSERT.into("CP_MARKETAUTH_CFG").entries(aMarketAuth);
        bFlag = "X";
      } catch (e) {
        console.log(e);
      }
    }

    // Insert generated option percent from derived rules to IBP Option Plan table
    if (aIBPFCharPlan.length > 0) {
      try {
        /**await INSERT.into("CP_IBP_FCHARPLAN").entries(aIBPFCharPlan);*/
        // bFlag = "X";
      } catch (e) {
        console.log(e);
      }
    }

    return bFlag;
  }

  /**
   * Merge values in two arrays into single array removing duplicates
   * @param {*} arr1
   * @param {*} arr2
   */

  async getUniqueIDsAfterMerge(aUID1, aUID2) {
    // merge two arrays
    let arr = aUID1.concat(aUID2);
    let uniqueArr = [];

    // loop through array
    for (let i of arr) {
      if (uniqueArr.indexOf(i) === -1) {
        uniqueArr.push(i);
      }
    }
    return uniqueArr;
  }

  /**
  * Get Sales History for location - product.
  * Process each rule to get success and failed percentage of each rule
  * @param {*} lLocation
  * @param {*} lProduct
  */
  async genSalesHRulePercentage(
    lLocation,
    lProduct,
    lHisWeeks
  ) {

    let oRulePercentage = {},
      aRulePercentage = [];

    // Get History Consideration Date
    let dFromDate = new Date();
    dFromDate = new Date(dFromDate.setDate(dFromDate.getDate() - (parseInt(lHisWeeks) * 7)));
    let iMonthH = (dFromDate.getMonth() + 1).toString();
    if (iMonthH.length === 1) {
      iMonthH = '0' + iMonthH;
    }
    let iDateH = dFromDate.getDate().toString();
    if (iDateH.length === 1) {
      iDateH = '0' + iDateH;
    }
    dFromDate = dFromDate.getFullYear().toString() + "-" + iMonthH + "-" + iDateH;

    /** Get Current WeekDate */
    let dWeekDate = new Date();
    let iMonth = (dWeekDate.getMonth() + 1).toString();
    if (iMonth.length === 1) {
      iMonth = '0' + iMonth;
    }
    let iDate = dWeekDate.getDate().toString();
    if (iDate.length === 1) {
      iDate = '0' + iDate;
    }

    dWeekDate = dWeekDate.getFullYear().toString() + "-" + iMonth + "-" + iDate;

    // Get Rule Information
    let aDerivedChar = await cds.run(`SELECT * 
            FROM CP_DERIVEDCHAR
           WHERE PRODUCT_ID = '${lProduct}' 
             AND RULE_TYPE <> 'D'
             AND VALID_TO >= '${dWeekDate}'
        ORDER BY CLAUSE,
                 DEP_NAME, 
                 CHAR_COUNTER`);

    // Fetch Distinct Partial Products
    let aDistProducts = await cds.run(`SELECT DISTINCT PRODUCT_ID
                                         FROM V_SALES_H
                                        WHERE LOCATION_ID = '${lLocation}'
                                          AND REF_PRODID = '${lProduct}'`);

    // Get all Characteristic Values for Location-Config Product
    let aDistLocProdConfig = await cds.run(`SELECT DISTINCT 
                                                   CLASS_NUM,
                                                   CHAR_NUM,
                                                   CHARVAL_NUM,
                                                   CHAR_VALUE
                                              FROM V_PARTIALPRODCLASSCHAR
                                             WHERE LOCATION_ID = '${lLocation}'
                                               AND REF_PRODID = '${lProduct}'`);


    // let aDistLocProdConfig = await cds.run(`SELECT A.LOCATION_ID,
    //                                                A.PRODUCT_ID,
    //                                                A.CLASS_NUM,
    //                                                A.CHAR_NUM,
    //                                                B.CHARVAL_NUM
    //                                          FROM V_LOCPRODCLASSCHAR AS A
    //                                         INNER JOIN V_PRODCLSCHARVAL AS B
    //                                            ON A.PRODUCT_ID = B.PRODUCT_ID
    //                                           AND A.CLASS_NUM = B.CLASS_NUM
    //                                           AND A.CHAR_NUM  = B.CHAR_NUM
    //                                         WHERE A.LOCATION_ID = '${lLocation}'
    //                                           AND A.PRODUCT_ID = '${lProduct}'`);

    if (aDistProducts.length > 0) {

      for (let iProds = 0; iProds < aDistProducts.length; iProds++) {

        aRulePercentage = [];

        // Get Sales History Quantity for each Unique Id - Characteristics 

        let aUniqChar = await cds.run(`SELECT V_SALES_H.LOCATION_ID,
                                              V_SALES_H.PRODUCT_ID,
                                              V_UNIQUE_ID.UNIQUE_ID,
                                              V_UNIQUE_ID.CHAR_NUM,
                                              V_UNIQUE_ID.CHARVAL_NUM,
                                              V_UNIQUE_ID.CHAR_VALUE,
                                              SUM("ORD_QTY") AS ORD_QTY
                                         FROM V_SALES_H
                                         JOIN V_UNIQUE_ID
                                           ON V_SALES_H.UNIQUE_ID = V_UNIQUE_ID.UNIQUE_ID                                                
                                        WHERE V_SALES_H.LOCATION_ID = '${lLocation}' 
                                          AND V_SALES_H.PRODUCT_ID = '${aDistProducts[iProds].PRODUCT_ID}'
                                          AND V_SALES_H.REF_PRODID = '${lProduct}'
                                          AND V_SALES_H.MAT_AVAILDATE >= '${dFromDate}'
                                    GROUP BY  V_SALES_H.LOCATION_ID,
                                        V_SALES_H.PRODUCT_ID,
                                        V_UNIQUE_ID.UNIQUE_ID,
                                        V_UNIQUE_ID.CHAR_NUM,
                                        V_UNIQUE_ID.CHARVAL_NUM,
                                        V_UNIQUE_ID.CHAR_VALUE`);

        // Get all distinct Unique Ids for Location-Partial Product
        let aDistLocProdUniqID = await cds.run(`SELECT DISTINCT 
                                                       UNIQUE_ID
                                                  FROM V_SALES_H
                                                 WHERE V_SALES_H.LOCATION_ID = '${lLocation}'
                                                   AND V_SALES_H.PRODUCT_ID = '${aDistProducts[iProds].PRODUCT_ID}'
                                                   AND V_SALES_H.REF_PRODID = '${lProduct}'`);

        let aDCInValidUniqId = [];

        let aDerCharThen = aDerivedChar.filter(function (aDerChar) {
          return aDerChar.CLAUSE === "T";
        });

        let bIsDepChar = false;

        // Create nested array with distinct Object Dependencies and its rules
        let aDCHeadItem = aDerivedChar.reduce((acc, curr) => {
          const ITEM = [];
          const {
            RECORD_TYPE,
            CLAUSE,
            DEP_NAME,
            CLASS_NUM,
            CHAR_NUM,
            CHARVAL_NUM,
            CHAR_VALUE,
            SORT_COUNTER,
            CHAR_COUNTER,
            OD_CONDITION,
            RULE_TYPE,
          } = curr;
          const findObj = acc.find((o) => o.DEP_NAME === DEP_NAME);
          if (!findObj) {
            ITEM.push({
              RECORD_TYPE,
              CLAUSE,
              CLASS_NUM,
              CHAR_NUM,
              CHARVAL_NUM,
              CHAR_VALUE,
              CHAR_COUNTER,
              OD_CONDITION,
              RULE_TYPE,
            });
            acc.push({ DEP_NAME, ITEM });
          } else {
            findObj.ITEM.push({
              RECORD_TYPE,
              CLAUSE,
              CLASS_NUM,
              CHAR_NUM,
              CHARVAL_NUM,
              CHAR_VALUE,
              CHAR_COUNTER,
              OD_CONDITION,
              RULE_TYPE,
            });
          }
          return acc;
        }, []);

        // Split rule with mutiple "THEN" Characteristics as separate rules
        if (aDCHeadItem.length > 0) {
          let aDCHeadItemTemp = aDCHeadItem;
          let aDCHeadItemFin = [], oDCHeadItemFin = {};
          let aItemsIF = [];
          let aItemsTH = [];

          for (let iDC = 0; iDC < aDCHeadItemTemp.length; iDC++) {
            let aItems = aDCHeadItemTemp[iDC].ITEM;
            aItemsIF = [];
            aItemsTH = [];

            aItems.forEach(obj => {
              // if statements or switch statement depending on how you want to split
              switch (obj.CLAUSE) {
                case 'I':
                  aItemsIF.push(obj);
                  break;
                case 'T':
                  aItemsTH.push(obj);
                  break;
              }
            });

            if (aItemsTH.length > 0) {
              // Sort based on Char Number
              aItemsTH = aItemsTH.sort(function (a, b) {
                return a.CHAR_NUM - b.CHAR_NUM;
              });
              let oDCItemsT = {}, aDCItemsT = [];
              for (let iItmsT = 0; iItmsT < aItemsTH.length; iItmsT++) {

                if (
                  iItmsT === 0 ||
                  aItemsTH[iItmsT].CHAR_NUM !==
                  aItemsTH[GenF.subOne(iItmsT, aItemsTH.length)].CHAR_NUM
                ) {
                  aDCItemsT = [];
                  oDCHeadItemFin = {}; oDCHeadItemFin.ITEM = [];
                  oDCHeadItemFin.DEP_NAME = aDCHeadItemTemp[iDC].DEP_NAME;
                  oDCHeadItemFin.ITEM = GenF.parse(aItemsIF);
                  oDCHeadItemFin.ITEM.push(GenF.parse(aItemsTH[iItmsT]));
                  // aDCItemsT.push(GenF.parse(aItemsTH[iItmsT]));
                } else if (
                  aItemsTH[iItmsT].CHAR_NUM ===
                  aItemsTH[GenF.subOne(iItmsT, aItemsTH.length)].CHAR_NUM
                ) {
                  oDCHeadItemFin.ITEM.push(GenF.parse(aItemsTH[iItmsT]));
                }

                if (
                  iItmsT === GenF.addOne(iItmsT, aItemsTH.length) ||
                  aItemsTH[iItmsT].CHAR_NUM !==
                  aItemsTH[GenF.addOne(iItmsT, aItemsTH.length)].CHAR_NUM
                ) {
                  aDCHeadItemFin.push(GenF.parse(oDCHeadItemFin));
                  oDCHeadItemFin = {};
                }
              }
            }

          }

          if (aDCHeadItemFin.length > 0) {
            aDCHeadItem = aDCHeadItemFin;
          }
        }

        // console.log(aDCHeadItem);

        // Find Unique Ids for each object dependency with infering and inferred rule characteristics values from sales history
        for (let cntDC = 0; cntDC < aDCHeadItem.length; cntDC++) {
          aDCInValidUniqId = [];

          // Delete current rule data from history base table
          await cds.run(
            `DELETE FROM CP_DERIVED_PERCENTAGE
              WHERE LOCATION_ID = '${lLocation}'
                AND PRODUCT_ID  = '${aDistProducts[iProds].PRODUCT_ID}'
                AND DEP_NAME    = '${aDCHeadItem[cntDC].DEP_NAME}'`);


          let aDCItems = aDCHeadItem[cntDC].ITEM;
          aDCHeadItem[cntDC].RULE_QTY = 0;
          aDCHeadItem[cntDC].RULE_ITEM_QTY = [];                 // Each Characteristic QTY

          // Create a nested array of Unique Ids which contains the current rule - Characteristic Value
          for (let cntDCI = 0; cntDCI < aDCItems.length; cntDCI++) {
            aDCItems[cntDCI].UID = [];
            for (let cntUID = 0; cntUID < aUniqChar.length; cntUID++) {
              // Find Unique Ids with current rule - Characteristic Value
              if (
                (aDCItems[cntDCI].OD_CONDITION === "EQ" &&
                  aDCItems[cntDCI].CHAR_NUM === aUniqChar[cntUID].CHAR_NUM &&
                  aDCItems[cntDCI].CHAR_VALUE === aUniqChar[cntUID].CHAR_VALUE) ||
                (aDCItems[cntDCI].OD_CONDITION === "NE" &&
                  aDCItems[cntDCI].CHAR_NUM === aUniqChar[cntUID].CHAR_NUM &&
                  aDCItems[cntDCI].CHAR_VALUE !== aUniqChar[cntUID].CHAR_VALUE)
              ) {
                if (
                  aDCItems[cntDCI].UID.includes(aUniqChar[cntUID].UNIQUE_ID) ===
                  false
                ) {
                  aDCItems[cntDCI].UID.push(
                    GenF.parse(aUniqChar[cntUID].UNIQUE_ID)
                  );
                }
              }
            }
          }

          // Sort rule based on clause(I/T) and char counter(1 / 2 / 3 - resembles 'AND' condition)
          aDCItems = aDCItems.sort(function (a, b) {
            return a.CLAUSE - b.CLAUSE && a.CHAR_COUNTER - b.CHAR_COUNTER;
          });

          // aDCItems = aDCItems.sort(GenF.dynamicSortMultiple("CHAR_COUNTER"));

          let aDCCharCounter = [],
            oDCCharCounter = {};
          let aDCCharCounterT = [],
            oDCCharCounterT = {};

          // Find UIDs for rules with Single - Single / Single - Multiple / Multiple - Single / Multiple - Multiple combinations
          // of characteristics based on Char Counter
          for (let cntDCI = 0; cntDCI < aDCItems.length; cntDCI++) {
            if (aDCItems[cntDCI].CLAUSE === "I") {
              // Merge Unique Ids with Same Char Counter ('OR' Condtition)
              if (
                cntDCI === 0 ||
                aDCItems[cntDCI].CHAR_COUNTER !==
                aDCItems[GenF.subOne(cntDCI, aDCItems.length)].CHAR_COUNTER ||
                aDCItems[cntDCI].CLAUSE !==
                aDCItems[GenF.subOne(cntDCI, aDCItems.length)].CLAUSE
              ) {
                oDCCharCounter = {};
                oDCCharCounter["CHAR_COUNTER"] = aDCItems[cntDCI].CHAR_COUNTER;
                oDCCharCounter.UID = aDCItems[cntDCI].UID;
              } else if (
                aDCItems[cntDCI].CHAR_COUNTER ===
                aDCItems[GenF.subOne(cntDCI, aDCItems.length)].CHAR_COUNTER
              ) {
                oDCCharCounter.UID = await this.getUniqueIDsAfterMerge(
                  oDCCharCounter.UID,
                  aDCItems[cntDCI].UID
                );
              }

              if (
                cntDCI === GenF.addOne(cntDCI, aDCItems.length) ||
                aDCItems[cntDCI].CHAR_COUNTER !==
                aDCItems[GenF.addOne(cntDCI, aDCItems.length)].CHAR_COUNTER ||
                aDCItems[cntDCI].CLAUSE !==
                aDCItems[GenF.addOne(cntDCI, aDCItems.length)].CLAUSE
              ) {
                aDCCharCounter.push(GenF.parse(oDCCharCounter));
              }

              // Then
            } else {
              // Merge Unique Ids with Same Char Counter ('OR' Condtition)
              if (
                cntDCI === 0 ||
                aDCItems[cntDCI].CHAR_COUNTER !==
                aDCItems[GenF.subOne(cntDCI, aDCItems.length)].CHAR_COUNTER ||
                aDCItems[cntDCI].CLAUSE !==
                aDCItems[GenF.subOne(cntDCI, aDCItems.length)].CLAUSE
              ) {
                oDCCharCounterT = {};
                oDCCharCounterT["CHAR_COUNTER"] = aDCItems[cntDCI].CHAR_COUNTER;
                oDCCharCounterT.UID = aDCItems[cntDCI].UID;
              } else if (
                aDCItems[cntDCI].CHAR_COUNTER ===
                aDCItems[GenF.subOne(cntDCI, aDCItems.length)].CHAR_COUNTER
              ) {
                oDCCharCounterT.UID = await this.getUniqueIDsAfterMerge(
                  oDCCharCounterT.UID,
                  aDCItems[cntDCI].UID
                );
              }

              if (
                cntDCI === GenF.addOne(cntDCI, aDCItems.length) ||
                aDCItems[cntDCI].CHAR_COUNTER !==
                aDCItems[GenF.addOne(cntDCI, aDCItems.length)].CHAR_COUNTER ||
                aDCItems[cntDCI].CLAUSE !==
                aDCItems[GenF.addOne(cntDCI, aDCItems.length)].CLAUSE
              ) {
                aDCCharCounterT.push(GenF.parse(oDCCharCounterT));
              }
            }
          }

          let aDCCharCounterMerged = [];
          let aDCCharCounterUID = [];
          let aDCCharCounterMergedT = [];
          let aDCCharCounterUIDT = [];
          let aDCValidUniqId = [];

          // Merge All Unique Ids with CLAUSE - I

          if (aDCCharCounter.length > 0) {
            for (let cntDCC = 0; cntDCC < aDCCharCounter.length; cntDCC++) {
              aDCCharCounterMerged.push(GenF.parse(aDCCharCounter[cntDCC].UID));
            }

            // Get Common elements beween array of arrays - I
            aDCCharCounterUID = aDCCharCounterMerged.reduce((p, c) =>
              p.filter((e) => c.includes(e))
            );
          }

          // Merge All Unique Ids with CLAUSE - T

          if (aDCCharCounterT.length > 0) {
            for (let cntDCCT = 0; cntDCCT < aDCCharCounterT.length; cntDCCT++) {
              aDCCharCounterMergedT.push(aDCCharCounterT[cntDCCT].UID);
            }

            // Get Common elements beween array of arrays - T
            aDCCharCounterUIDT = aDCCharCounterMergedT.reduce((p, c) =>
              p.filter((e) => c.includes(e))
            );
          }


          // Find all Valid / Invalid UIDs based on

          for (let cntUIDI = 0; cntUIDI < aDCCharCounterUID.length; cntUIDI++) {
            let aValidUID = aDCCharCounterUIDT.filter(function (aUID) {
              return aUID === aDCCharCounterUID[cntUIDI];
            });

            if (aValidUID.length > 0) {
              aDCValidUniqId.push(aDCCharCounterUID[cntUIDI]);
            }
            // else {
            //   aDCInValidUniqId.push(aDCCharCounterUID[cntUIDI]);
            // }
          }

          // Get all invalid unique ids for partial product
          if (aDistLocProdUniqID.length > 0) {
            for (let iUID = 0; iUID < aDistLocProdUniqID.length; iUID++) {
              if (aDCValidUniqId.includes(aDistLocProdUniqID[iUID].UNIQUE_ID) === false) {
                aDCInValidUniqId.push(GenF.parse(aDistLocProdUniqID[iUID].UNIQUE_ID));
              }
            }
          }


          // If rule characteristic is used atleast once in history
          if (aDCValidUniqId.length > 0 || aDCInValidUniqId.length > 0) {

            let oCharOptQty = {},
              aCharOptQty = [];

            aDCHeadItem[cntDC].RULE_QTY = 0;
            aDCHeadItem[cntDC].FRULE_QTY = 0;

            if (aUniqChar.length > 0) {
              // Sort Unique Characteristics by Unique Id
              aUniqChar = aUniqChar.sort(function (a, b) {
                return a.UNIQUE_ID - b.UNIQUE_ID;
              });

              // Filter duplicate unique ids and get the result into new array
              const keys = ["UNIQUE_ID"];
              let bSuccess = false;
              let aDistUniqID = GenF.removeDuplicate(aUniqChar, keys);

              for (let cntUID = 0; cntUID < aDistUniqID.length; cntUID++) {
                bSuccess = false;

                // If current unique id does not contain the rule characteristic
                if (aDCValidUniqId.includes(aDistUniqID[cntUID].UNIQUE_ID) === false &&
                  aDCInValidUniqId.includes(aDistUniqID[cntUID].UNIQUE_ID) === false) {
                  continue;
                }

                // To check if current UID is valid with rule (I & T)
                let aValUniqID = aDCValidUniqId.filter(function (aUID) {
                  return aUID === aDistUniqID[cntUID].UNIQUE_ID;
                });

                if (aValUniqID.length > 0) {
                  // If unique id contains the rule characteristics 
                  bSuccess = true;
                }

                // Filter Unique Id with Characteristics
                let aFilUniqChar = aUniqChar.filter(function (aUID) {
                  return aUID.UNIQUE_ID === aDistUniqID[cntUID].UNIQUE_ID;
                });

                //if (aFilUniqChar.length > 0) {

                for (let cntDCI = 0; cntDCI < aDCItems.length; cntDCI++) {
                  // Process only characteristsics which are derived in the current rule
                  if (aDCItems[cntDCI].CLAUSE === "T") {
                    let iPos = -1;
                    // When No Sales History available for current rule
                    let aFilProdCharVal = aDistLocProdConfig.filter(function (aCharV) {
                      return aCharV.CLASS_NUM = aDCItems[cntDCI].CLASS_NUM &&
                        aCharV.CHAR_NUM === aDCItems[cntDCI].CHAR_NUM
                    });
                    // Loop through all CharValues of Product
                    for (
                      let cntPCV = 0;
                      cntPCV < aFilProdCharVal.length;
                      cntPCV++
                    ) {
                      iPos = -1;

                      if (aCharOptQty.length > 0) {
                        // Check if Char Qty exists in array
                        // Get the index position of Array item which matches CHAR_NUM & CHARVAL_NUM
                        iPos = aCharOptQty.findIndex(
                          (item) =>
                            item.CLASS_NUM === aDCItems[cntDCI].CLASS_NUM &&
                            item.CHAR_NUM === aDCItems[cntDCI].CHAR_NUM &&
                            item.CHAR_VALUE === aFilProdCharVal[cntPCV].CHAR_VALUE
                        );
                      }

                      if (iPos < 0) {
                        oCharOptQty.CLASS_NUM = aDCItems[cntDCI].CLASS_NUM;
                        oCharOptQty.CHAR_NUM = aDCItems[cntDCI].CHAR_NUM;
                        oCharOptQty.CHAR_VALUE =
                          aFilProdCharVal[cntPCV].CHAR_VALUE;
                        oCharOptQty.SPER = 0.0;
                        oCharOptQty.FPER = 0.0;
                        oCharOptQty.SQTY = 0.0;
                        oCharOptQty.FQTY = 0.0;

                        aCharOptQty.push(GenF.parse(oCharOptQty));
                        oCharOptQty = {};

                      }
                    }

                    for (
                      let cntUChr = 0;
                      cntUChr < aFilUniqChar.length;
                      cntUChr++
                    ) {
                      iPos = -1;
                      if (
                        aFilUniqChar[cntUChr].CHAR_NUM === aDCItems[cntDCI].CHAR_NUM
                      ) {

                        // Check if Char Qty exists in array
                        // Get the index position of Array item which matches CHAR_NUM & CHARVAL_NUM

                        if (aCharOptQty.length > 0) {
                          iPos = aCharOptQty.findIndex(
                            (item) =>
                              item.CLASS_NUM === aDCItems[cntDCI].CLASS_NUM &&
                              item.CHAR_NUM === aDCItems[cntDCI].CHAR_NUM &&
                              item.CHAR_VALUE === aFilUniqChar[cntUChr].CHAR_VALUE
                          );
                        }
                        /** If the characteristic value does not exists in array push as new record, otherwise
                              add quatity to same record*/
                        if (iPos < 0) {
                          oCharOptQty.CLASS_NUM = aDCItems[cntDCI].CLASS_NUM;
                          oCharOptQty.CHAR_NUM = aDCItems[cntDCI].CHAR_NUM;
                          oCharOptQty.CHAR_VALUE =
                            aFilUniqChar[cntUChr].CHAR_VALUE;
                          oCharOptQty.SPER = 0.0;
                          oCharOptQty.FPER = 0.0;

                          if (bSuccess === true) {
                            oCharOptQty.SQTY = parseInt(
                              aFilUniqChar[cntUChr].ORD_QTY
                            );
                            oCharOptQty.FQTY = 0.0;
                          } else {
                            oCharOptQty.SQTY = 0.0;
                            oCharOptQty.FQTY = parseInt(
                              aFilUniqChar[cntUChr].ORD_QTY
                            );

                          }
                          aCharOptQty.push(GenF.parse(oCharOptQty));
                          oCharOptQty = {};
                        } else {
                          // Add quantity if it is same characteristic (OR condition)
                          if (bSuccess === true) {
                            aCharOptQty[iPos].SQTY =
                              parseInt(aCharOptQty[iPos].SQTY) +
                              parseInt(aFilUniqChar[cntUChr].ORD_QTY);
                          } else {
                            aCharOptQty[iPos].FQTY =
                              parseInt(aCharOptQty[iPos].FQTY) +
                              parseInt(aFilUniqChar[cntUChr].ORD_QTY);
                          }
                        }

                        // Delete current characteristic value
                        aFilUniqChar.splice(cntUChr, 1);

                        break;
                      }
                    }
                  }
                }
                //}
              }
            }
            // aDCHeadItem[cntDC].RULE_ITEM_QTY.push(GenF.parse(aCharOptQty));
            aDCHeadItem[cntDC].RULE_ITEM_QTY = aCharOptQty;
            aCharOptQty = [];
          } else {
            let oCharOptQty = {},
              aCharOptQty = [];

            aDCHeadItem[cntDC].RULE_QTY = 0;
            aDCHeadItem[cntDC].FRULE_QTY = 0;

            for (let cntDCI = 0; cntDCI < aDCItems.length; cntDCI++) {
              let iPos = -1;
              // Process only characteristsics which are derived in the current rule
              if (aDCItems[cntDCI].CLAUSE === "T") {
                // When No Sales History available for current rule
                let aFilProdCharVal = aDistLocProdConfig.filter(function (aCharV) {
                  return aCharV.CLASS_NUM = aDCItems[cntDCI].CLASS_NUM &&
                    aCharV.CHAR_NUM === aDCItems[cntDCI].CHAR_NUM
                });

                for (
                  let cntPCV = 0;
                  cntPCV < aFilProdCharVal.length;
                  cntPCV++
                ) {
                  iPos = -1;
                  if (aCharOptQty.length > 0) {
                    // Check if Char Qty exists in array
                    // Get the index position of Array item which matches CHAR_NUM & CHARVAL_NUM
                    iPos = aCharOptQty.findIndex(
                      (item) =>
                        item.CLASS_NUM === aDCItems[cntDCI].CLASS_NUM &&
                        item.CHAR_NUM === aDCItems[cntDCI].CHAR_NUM &&
                        item.CHAR_VALUE === aFilProdCharVal[cntPCV].CHAR_VALUE
                    );
                  }

                  if (iPos < 0) {
                    oCharOptQty.CLASS_NUM = aDCItems[cntDCI].CLASS_NUM;
                    oCharOptQty.CHAR_NUM = aDCItems[cntDCI].CHAR_NUM;
                    oCharOptQty.CHAR_VALUE =
                      aFilProdCharVal[cntPCV].CHAR_VALUE;
                    oCharOptQty.SPER = 0.0;
                    oCharOptQty.FPER = 0.0;
                    oCharOptQty.SQTY = 0.0;
                    oCharOptQty.FQTY = 0.0;

                    aCharOptQty.push(GenF.parse(oCharOptQty));
                    oCharOptQty = {};
                  }

                }
              }
            }
            aDCHeadItem[cntDC].RULE_ITEM_QTY = aCharOptQty;
            aCharOptQty = [];
          }

          if (aDCHeadItem[cntDC].RULE_ITEM_QTY.length > 0) {
            // *****Calculate Rule Quantity*******/
            for (
              let cntChrPer = 0;
              cntChrPer < aDCHeadItem[cntDC].RULE_ITEM_QTY.length;
              cntChrPer++
            ) {
              // aDCHeadItem[cntDC].RULE_QTY = parseInt(
              //   aDCHeadItem[cntDC].RULE_QTY +
              //   parseInt(aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].SQTY) + parseInt(aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].FQTY));

              // Success Rule Quantity
              aDCHeadItem[cntDC].RULE_QTY = parseInt(aDCHeadItem[cntDC].RULE_QTY +
                parseInt(aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].SQTY));


              // Failed Rule Quantity
              aDCHeadItem[cntDC].FRULE_QTY = parseInt(
                aDCHeadItem[cntDC].FRULE_QTY + parseInt(aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].FQTY));
            }

            /** Calculate success or failed percent of each characteristic value based on rule quantity */
            for (
              let cntChrPer = 0;
              cntChrPer < aDCHeadItem[cntDC].RULE_ITEM_QTY.length;
              cntChrPer++
            ) {
              if (parseInt(aDCHeadItem[cntDC].RULE_QTY) > 0) {
                aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].SPER = (
                  (aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].SQTY * 100) /
                  parseInt(aDCHeadItem[cntDC].RULE_QTY)
                ).toFixed(4);
              } else {
                aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].SPER = 0;
              }

              if (parseInt(aDCHeadItem[cntDC].FRULE_QTY) > 0) {
                aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].FPER = (
                  (aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].FQTY * 100) /
                  parseInt(aDCHeadItem[cntDC].FRULE_QTY)
                ).toFixed(4);
              } else {
                aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].FPER = 0;
              }


              // Update in Rule Percentages table

              oRulePercentage.LOCATION_ID = lLocation;
              oRulePercentage.PRODUCT_ID = aDistProducts[iProds].PRODUCT_ID;
              oRulePercentage.DEP_NAME = aDCHeadItem[cntDC].DEP_NAME;
              oRulePercentage.CLASS_NUM = aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].CLASS_NUM;
              oRulePercentage.CHAR_NUM = aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].CHAR_NUM;
              oRulePercentage.CHARVAL_NUM = aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].CHAR_VALUE;
              oRulePercentage.CHAR_VALUE = aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].CHAR_VALUE;
              oRulePercentage.SUCCESS_PER = aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].SPER;
              oRulePercentage.FAILED_PER = aDCHeadItem[cntDC].RULE_ITEM_QTY[cntChrPer].FPER;

              aRulePercentage.push(GenF.parse(oRulePercentage));
              oRulePercentage = {};
            }
          }
        }

        // Insert sales history based percentages for derived characteristics of rules
        if (aRulePercentage.length > 0) {
          try {
            await INSERT.into("CP_DERIVED_PERCENTAGE").entries(aRulePercentage);

          } catch (e) {
            console.log('Failed to insert derived percentage data based on sales history for rule: ' + aDCHeadItem[cntDC].DEP_NAME);
          }
        }
      }
    }

  }

  /**
 * Get Sales History for location - product.
 * Process each rule to get success and failed percentage of each rule
 * @param {*} lLocation
 * @param {*} lProduct
 */
  async genConfigValidityRulesOld(
    lLocation,
    lProduct
  ) {

    /** Get Current Date */

    let dCurDate = new Date(),
      dUIDValidFrom = new Date(),
      dUIDValidTo = new Date(),
      dUIDValidFromT = new Date(),
      dUIDValidToT = new Date(),
      dRuleValidFrom = new Date(),
      dRuleValidTo = new Date();
    let vCurrDate = GenF.getCurrentDate();
    let bFlag = false;
    let aItemsIF = [];
    let aItemsTH = [];
    let aUniqueConfig = [];
    let bchkThen = false;
    let bInValidUID = false;
    let achkThen = [], aInvalidUID = [];
    let oDepValidity = {},
      aDepValidity = [];
    let oUIDValidity = {},
      aUIDValidity = [];
    let aUniqueConf = [], oUniqueConf = {};

    // Get Rule Information
    // let aDerivedChar = await cds.run(`SELECT * 
    //                                     FROM CP_DERIVEDCHAR
    //                                   WHERE PRODUCT_ID = '${lProduct}' 
    //                                   AND RULE_TYPE <> 'D'
    //                                   AND VALID_TO >= '${vCurrDate}'
    //                                 ORDER BY CLAUSE,
    //                                         DEP_NAME, 
    //                                         CHAR_COUNTER`);

    let aDerivedChar = await cds.run(`SELECT  A.PRODUCT_ID,
                                              A.RECORD_TYPE,
                                              A.CLAUSE,
                                              A.DEP_NAME,
                                              A.CLASS_NUM,
                                              A.CHAR_NUM,
                                              A.CHARVAL_NUM,
                                              A.CHAR_VALUE,
                                              A.SORT_COUNTER,
                                              A.CHAR_COUNTER,
                                              A.OD_CONDITION,
                                              A.RULE_TYPE,
                                              A.VALID_FROM,
                                              A.VALID_TO,
                                              B.MULTI_CHAR,
                                              B.REF_CHAR_NUM
                                          FROM CP_DERIVEDCHAR AS A
                                          INNER JOIN V_PRODCLSCHARVAL AS B
                                            ON A.PRODUCT_ID = B.PRODUCT_ID
                                            AND A.CLASS_NUM = B.CLASS_NUM
                                            AND A.CHAR_NUM = B.CHAR_NUM
                                            AND A.CHAR_VALUE = B.CHAR_VALUE
                                            WHERE A.PRODUCT_ID = '${lProduct}'
                                             AND A.RULE_TYPE <> 'D'
                                             AND A.VALID_TO >= '${vCurrDate}'
                                            ORDER BY DEP_NAME,
                                                      CLAUSE, 
                                                      CHAR_COUNTER`);

    let aDerivedCharMaster = await cds.run(`SELECT * FROM CP_DERIVEDCHAR_MASTER
                                                    WHERE PRODUCT_ID = '${lProduct}' 
                                                      AND RULE_TYPE <> 'D'
                                                      AND VALID_TO >= '${vCurrDate}'
                                                    ORDER BY CLAUSE,
                                                          DEP_NAME, 
                                                          CHAR_COUNTER`);

    // Get all Distinct Unique Ids for Config Product
    let aUniqueIdHeader = await cds.run(`SELECT *
                                          FROM CP_UNIQUE_ID_HEADER
                                          WHERE PRODUCT_ID = '${lProduct}'
                                            AND UID_TYPE = 'U'
                                            AND ACTIVE = true`);

    // Get all Unique Id Items for Config Product
    let aUniqueItem = await cds.run(`SELECT *
                                       FROM V_UNIQUE_ID_ITEM
                                       WHERE PRODUCT_ID = '${lProduct}'
                                       AND CHAR_VALUE NOT LIKE 'NOT_%'`);

    // Create nested array with distinct Object Dependencies and its rules
    let aDCHeadItem = aDerivedChar.reduce((acc, curr) => {
      const ITEM = [];
      const {
        RECORD_TYPE,
        CLAUSE,
        DEP_NAME,
        CLASS_NUM,
        CHAR_NUM,
        CHARVAL_NUM,
        CHAR_VALUE,
        SORT_COUNTER,
        CHAR_COUNTER,
        OD_CONDITION,
        RULE_TYPE,
        VALID_FROM,
        VALID_TO,
        MULTI_CHAR,
        REF_CHAR_NUM,
      } = curr;
      const findObj = acc.find((o) => o.DEP_NAME === DEP_NAME);
      if (!findObj) {
        ITEM.push({
          RECORD_TYPE,
          CLAUSE,
          CLASS_NUM,
          CHAR_NUM,
          CHARVAL_NUM,
          CHAR_VALUE,
          CHAR_COUNTER,
          OD_CONDITION,
          RULE_TYPE,
          MULTI_CHAR,
          REF_CHAR_NUM,
        });
        acc.push({ DEP_NAME, VALID_FROM, VALID_TO, ITEM });
      } else {
        findObj.ITEM.push({
          RECORD_TYPE,
          CLAUSE,
          CLASS_NUM,
          CHAR_NUM,
          CHARVAL_NUM,
          CHAR_VALUE,
          CHAR_COUNTER,
          OD_CONDITION,
          RULE_TYPE,
          MULTI_CHAR,
          REF_CHAR_NUM,
        });
      }
      return acc;
    }, []);

    // Split rule with mutiple "THEN" Characteristics as separate rules
    if (aDCHeadItem.length > 0) {
      let aDCHeadItemTemp = aDCHeadItem;
      let aDCHeadItemFin = [], oDCHeadItemFin = {};
      aItemsIF = [];
      aItemsTH = [];

      for (let iDC = 0; iDC < aDCHeadItemTemp.length; iDC++) {
        let aItems = aDCHeadItemTemp[iDC].ITEM;
        aItemsIF = [];
        aItemsTH = [];

        aItems.forEach(obj => {
          // if statements or switch statement depending on how you want to split
          switch (obj.CLAUSE) {
            case 'I':
              aItemsIF.push(obj);
              break;
            case 'T':
              aItemsTH.push(obj);
              break;
          }
        });

        if (aItemsTH.length > 0) {
          // Sort based on Char Number
          aItemsTH = aItemsTH.sort(function (a, b) {
            return a.CHAR_NUM - b.CHAR_NUM;
          });

          for (let iItmsT = 0; iItmsT < aItemsTH.length; iItmsT++) {

            // if (
            //   iItmsT === 0 ||
            //   (aItemsTH[iItmsT].CHAR_NUM !==
            //     aItemsTH[GenF.subOne(iItmsT, aItemsTH.length)].CHAR_NUM &&
            //     aItemsTH[iItmsT].CHAR_COUNTER !==
            //     aItemsTH[GenF.subOne(iItmsT, aItemsTH.length)].CHAR_COUNTER)
            // ) {

            if (
              iItmsT === 0 ||
              (aItemsTH[iItmsT].REF_CHAR_NUM !==
                aItemsTH[GenF.subOne(iItmsT, aItemsTH.length)].REF_CHAR_NUM &&
                aItemsTH[iItmsT].CHAR_COUNTER !==
                aItemsTH[GenF.subOne(iItmsT, aItemsTH.length)].CHAR_COUNTER)
            ) {

              oDCHeadItemFin = {}; oDCHeadItemFin.ITEM = [];
              oDCHeadItemFin.DEP_NAME = aDCHeadItemTemp[iDC].DEP_NAME;
              oDCHeadItemFin.VALID_FROM = aDCHeadItemTemp[iDC].VALID_FROM;
              oDCHeadItemFin.VALID_TO = aDCHeadItemTemp[iDC].VALID_TO;
              oDCHeadItemFin.ITEM = GenF.parse(aItemsIF);
              oDCHeadItemFin.ITEM.push(GenF.parse(aItemsTH[iItmsT]));
            } else if (
              aItemsTH[iItmsT].REF_CHAR_NUM ===
              aItemsTH[GenF.subOne(iItmsT, aItemsTH.length)].REF_CHAR_NUM ||
              aItemsTH[iItmsT].CHAR_COUNTER ===
              aItemsTH[GenF.subOne(iItmsT, aItemsTH.length)].CHAR_COUNTER
            ) {
              oDCHeadItemFin.ITEM.push(GenF.parse(aItemsTH[iItmsT]));
            }

            if (
              iItmsT === GenF.addOne(iItmsT, aItemsTH.length) ||
              (aItemsTH[iItmsT].REF_CHAR_NUM !==
                aItemsTH[GenF.addOne(iItmsT, aItemsTH.length)].REF_CHAR_NUM &&
                aItemsTH[iItmsT].CHAR_COUNTER !==
                aItemsTH[GenF.subOne(iItmsT, aItemsTH.length)].CHAR_COUNTER)
            ) {
              aDCHeadItemFin.push(GenF.parse(oDCHeadItemFin));
              oDCHeadItemFin = {};
            }
          }
        }

      }

      if (aDCHeadItemFin.length > 0) {
        aDCHeadItem = aDCHeadItemFin;
        aDCHeadItem.sort(GenFunctions.dynamicSortMultiple("DEP_NAME"));
      }
    }


    if (aUniqueIdHeader.length > 0) {

      for (let iUID = 0; iUID < aUniqueIdHeader.length; iUID++) {
        aDepValidity = [];
        dCurDate = new Date();

        for (let cntDC = 0; cntDC < aDCHeadItem.length; cntDC++) {
          let aDCItems = aDCHeadItem[cntDC].ITEM;

          if (aDCHeadItem[cntDC].VALID_FROM !== '' && aDCHeadItem[cntDC].VALID_FROM !== null) {

            // Sort rule based on clause(I/T) and char counter(1 / 2 / 3 - resembles 'AND' condition)
            aDCItems = aDCItems.sort(function (a, b) {
              return a.CLAUSE - b.CLAUSE && a.CHAR_COUNTER - b.CHAR_COUNTER;
            });

            aItemsIF = [];
            aItemsTH = [];

            aDCItems.forEach(obj => {
              // if statements or switch statement depending on how you want to split
              switch (obj.CLAUSE) {
                case 'I':
                  aItemsIF.push(obj);
                  break;
                case 'T':
                  aItemsTH.push(obj);
                  break;
              }
            });

            bchkThen = false;
            achkThen = [];
            aInvalidUID = [];
            bFlag = false;

            for (let icntDCIF = 0; icntDCIF < aItemsIF.length; icntDCIF++) {
              bFlag = false;

              if (icntDCIF === 0 ||
                aItemsIF[icntDCIF].CHAR_COUNTER !==
                aItemsIF[GenF.subOne(icntDCIF, aItemsIF.length)].CHAR_COUNTER) {

                bchkThen = false;
                aUniqueConfig = [];
                bFlag = true;

              } else if (aItemsIF[icntDCIF].CHAR_COUNTER ===
                aItemsIF[GenF.subOne(icntDCIF, aItemsIF.length)].CHAR_COUNTER) {

                bFlag = true;

              }
              if (bFlag === true) {
                if (aItemsIF[icntDCIF].OD_CONDITION === "EQ") {

                  aUniqueConfig = aUniqueItem.filter(function (aUIDChar) {
                    return aUIDChar.UNIQUE_ID === aUniqueIdHeader[iUID].UNIQUE_ID &&
                      aUIDChar.CLASS_NUM === aItemsIF[icntDCIF].CLASS_NUM &&
                      aUIDChar.CHAR_NUM === aItemsIF[icntDCIF].CHAR_NUM &&
                      aUIDChar.CHAR_VALUE === aItemsIF[icntDCIF].CHAR_VALUE;
                  });
                } else if (aItemsIF[icntDCIF].OD_CONDITION === "NE") {
                  aUniqueConfig = aUniqueItem.filter(function (aUIDChar) {
                    return aUIDChar.UNIQUE_ID === aUniqueIdHeader[iUID].UNIQUE_ID &&
                      aUIDChar.CLASS_NUM === aItemsIF[icntDCIF].CLASS_NUM &&
                      aUIDChar.CHAR_NUM === aItemsIF[icntDCIF].CHAR_NUM &&
                      aUIDChar.CHAR_VALUE !== aItemsIF[icntDCIF].CHAR_VALUE;
                  });
                }

                if (aUniqueConfig.length > 0) {
                  bchkThen = true;
                }
              }

              if (icntDCIF === GenF.addOne(icntDCIF, aItemsIF.length) ||
                aItemsIF[icntDCIF].CHAR_COUNTER !==
                aItemsIF[GenF.addOne(icntDCIF, aItemsIF.length)].CHAR_COUNTER) {

                achkThen.push(GenF.parse(bchkThen.toString()));

              }

            }


            // If UniqueID is valid for IF characteristics(rule), then process THEN 
            if (achkThen && achkThen.includes('false') === false) {
              bInValidUID = false;

              let aFilDCMaster = [], aUniqueMultiConfiguration = [];

              aFilDCMaster = aDerivedCharMaster.filter(function (obj) {
                return obj.DEP_NAME === aDCHeadItem[cntDC].DEP_NAME
                  && obj.CLAUSE === 'T';
              });


              aUniqueMultiConfiguration = aUniqueItem.filter(function (aUIDChar) {
                return aUIDChar.UNIQUE_ID === aUniqueIdHeader[iUID].UNIQUE_ID &&
                       aUIDChar.MULTI_CHAR === 'X';
              });


              if (aUniqueMultiConfiguration.length > 0) {

                // Filter array of objects based on another array of objects
                aUniqueMultiConfiguration = aUniqueMultiConfiguration.filter((el) => {
                  return aFilDCMaster.some((f) => {
                    return f.CLASS_NUM === el.CLASS_NUM && f.CHAR_NUM === el.REF_CHAR_NUM;
                  });
                });

                if (aUniqueMultiConfiguration.length > 0) {
                  // Add new property 'FLAG' to array of objects
                  aUniqueMultiConfiguration = aUniqueMultiConfiguration.map(function (obj) {
                    return { ...obj, FLAG: 'true' };
                  })
                }
              }

              for (let icntDCT = 0; icntDCT < aItemsTH.length; icntDCT++) {
                bFlag = false;

                if (icntDCT === 0 ||
                  aItemsTH[icntDCT].CHAR_COUNTER !==
                  aItemsTH[GenF.subOne(icntDCT, icntDCT.length)].CHAR_COUNTER) {

                  bInValidUID = true;
                  aUniqueConfig = [];
                  bFlag = true;

                } else if (aItemsTH[icntDCT].CHAR_COUNTER ===
                  aItemsTH[GenF.subOne(icntDCT, aItemsTH.length)].CHAR_COUNTER) {

                  bFlag = true;
                }

                if (bFlag === true) {
                  let iIndex = -1;

                  if (aItemsTH[icntDCT].OD_CONDITION === "EQ") {

                    aUniqueConfig = aUniqueItem.filter(function (aUIDChar) {
                      return aUIDChar.UNIQUE_ID === aUniqueIdHeader[iUID].UNIQUE_ID &&
                        aUIDChar.CLASS_NUM === aItemsTH[icntDCT].CLASS_NUM &&
                        aUIDChar.CHAR_NUM === aItemsTH[icntDCT].CHAR_NUM &&
                        aUIDChar.CHAR_VALUE === aItemsTH[icntDCT].CHAR_VALUE;
                    });

                    if (aUniqueMultiConfiguration.length > 0) {

                      iIndex = aUniqueMultiConfiguration.findIndex(aUIDChar => {
                        return aUIDChar.UNIQUE_ID === aUniqueIdHeader[iUID].UNIQUE_ID &&
                          aUIDChar.CLASS_NUM === aItemsTH[icntDCT].CLASS_NUM &&
                          aUIDChar.CHAR_NUM === aItemsTH[icntDCT].CHAR_NUM &&
                          aUIDChar.CHAR_VALUE === aItemsTH[icntDCT].CHAR_VALUE;
                      });

                      if (iIndex !== -1) {
                        aUniqueMultiConfiguration[iIndex].FLAG = 'false';
                      }

                    }

                  } else if (aItemsTH[icntDCT].OD_CONDITION === "NE") {
                    aUniqueConfig = aUniqueItem.filter(function (aUIDChar) {
                      return aUIDChar.UNIQUE_ID === aUniqueIdHeader[iUID].UNIQUE_ID &&
                        aUIDChar.CLASS_NUM === aItemsTH[icntDCT].CLASS_NUM &&
                        aUIDChar.CHAR_NUM === aItemsTH[icntDCT].CHAR_NUM &&
                        aUIDChar.CHAR_VALUE === aItemsTH[icntDCT].CHAR_VALUE;
                    });

                    if (aUniqueMultiConfiguration.length > 0) {

                      iIndex = aUniqueMultiConfiguration.findIndex(aUIDChar => {
                        return aUIDChar.UNIQUE_ID === aUniqueIdHeader[iUID].UNIQUE_ID &&
                          aUIDChar.CLASS_NUM === aItemsTH[icntDCT].CLASS_NUM &&
                          aUIDChar.CHAR_NUM === aItemsTH[icntDCT].CHAR_NUM &&
                          aUIDChar.CHAR_VALUE !== aItemsTH[icntDCT].CHAR_VALUE;
                      });

                      if (iIndex !== -1) {
                        aUniqueMultiConfiguration[iIndex].FLAG = 'false';
                      }

                    }
                  }

                  if (aUniqueConfig.length > 0) {
                    bInValidUID = false;
                  }
                  // Below code is it to check 
                  // a. if single option characteristic exists in UID, if not ignore rule
                  // b. For multi-value char, check if all the char values are No-Values, if yes then ignore the rule
                  // Once rule is ignored, make UID as valid
                  //////////////////////////////////////////////////////////////////////

                  else {
                    // Check if Characteristic Number Exists
                    aUniqueConfig = [];
                    aUniqueConfig = aUniqueItem.filter(function (aUIDChar) {
                      return aUIDChar.UNIQUE_ID === aUniqueIdHeader[iUID].UNIQUE_ID &&
                        aUIDChar.CLASS_NUM === aItemsTH[icntDCT].CLASS_NUM &&
                        aUIDChar.CHAR_NUM === aItemsTH[icntDCT].CHAR_NUM;
                    });

                    if (aUniqueConfig.length > 0) {
                      if (aUniqueConfig[0].MULTI_CHAR === 'X') {
                        // extract value from property
                        // let aCharVals = aUniqueConfig.map(item => item[CHARVAL_NUM]);
                        let aUniqueMultiConfig = aUniqueItem.filter(function (aUIDChar) {
                          return aUIDChar.UNIQUE_ID === aUniqueIdHeader[iUID].UNIQUE_ID &&
                            aUIDChar.CLASS_NUM === aItemsTH[icntDCT].CLASS_NUM &&
                            aUIDChar.REF_CHAR_NUM === aUniqueConfig[0].REF_CHAR_NUM;
                        });
                        let aCharVals = [];
                        aCharVals = aUniqueMultiConfig.map(function (item) {
                          if (item['CHAR_VALUE'].includes('NOT_') === true) {
                            return true;
                          } else {
                            // return item['CHARVAL_NUM'];
                            return false;
                          }
                        });

                        if (aCharVals.length === 0) {
                          bInValidUID = false;
                        } else if (aCharVals.includes(false) === false) {
                          bInValidUID = false;
                        }

                      }

                    } else {
                      bInValidUID = false;
                    }
                  }
                  ///////////////////////////////////////////////////////////////////////////
                }


                if (icntDCT === GenF.addOne(icntDCT, aItemsTH.length) ||
                  aItemsTH[icntDCT].CHAR_COUNTER !==
                  aItemsTH[GenF.addOne(icntDCT, icntDCT.length)].CHAR_COUNTER) {

                  aInvalidUID.push(GenF.parse(bInValidUID.toString()));
                }

              }
              
              let aFilMulCharRuleChk = [];
              if (aUniqueMultiConfiguration.length > 0) {
                aFilMulCharRuleChk = aUniqueMultiConfiguration.filter(function (aUnichar) {
                  return aUnichar.FLAG === 'true';
                });
                // if (aFilMulCharRuleChk.length > 0) {
                //   aInvalidUID.push('true');
                // }
              }

              if ((aInvalidUID && aInvalidUID.includes('false') === false) ||
                  (aUniqueMultiConfiguration.length > 0 && aFilMulCharRuleChk.length > 0)) {
                oDepValidity.DEP_NAME = aDCHeadItem[cntDC].DEP_NAME;
                oDepValidity.VALID_FROM = aDCHeadItem[cntDC].VALID_FROM;
                oDepValidity.VALID_TO = aDCHeadItem[cntDC].VALID_TO;
                oDepValidity.UNIQUE_ID = aUniqueIdHeader[iUID].UNIQUE_ID;

                aDepValidity.push(GenF.parse(oDepValidity));
              }
            }
          }
        }

        try {
          await cds.run(`DELETE FROM CP_UNIQUEID_RULE_VALIDITY
                          WHERE UNIQUE_ID = '${aUniqueIdHeader[iUID].UNIQUE_ID}'`);
        } catch (e) {
          console.log(e);
        }

        if (aDepValidity.length > 0) {

          try {
            await INSERT.into("CP_UNIQUEID_RULE_VALIDITY").entries(aDepValidity);
          } catch (e) {
            console.log(e);
          }

          // dUIDValidFrom = aDepValidity.reduce((min, p) => p.VALID_FROM < min ? p.VALID_FROM : min, aDepValidity[0].VALID_FROM);
          // dUIDValidTo = aDepValidity.reduce((max, p) => p.VALID_TO > max ? p.VALID_TO : max, aDepValidity[0].VALID_TO);

          const keys = ['VALID_FROM'];
          aDepValidity.sort(GenF.dynamicSortMultiple("VALID_FROM"));
          dUIDValidFrom = new Date('2000-01-01');
          dUIDValidTo = new Date('9999-12-31');
          let dValToTemp = new Date('9999-12-31');


          for (let iRule = 0; iRule < aDepValidity.length; iRule++) {
            dRuleValidFrom = new Date(aDepValidity[iRule].VALID_FROM);
            dRuleValidTo = new Date(aDepValidity[iRule].VALID_TO);
            var dRuleValidToTemp = aDepValidity[iRule].VALID_TO;

            if (iRule === 0) {
              if (dRuleValidFrom > dCurDate) {
                dUIDValidTo = new Date(dRuleValidFrom.setDate(dRuleValidFrom.getDate() - 1));
                break;
              }
              if (dRuleValidToTemp !== '9999-12-31') {
                dUIDValidFrom = new Date(dRuleValidTo.setDate(dRuleValidTo.getDate() + 1));
              }
               // If Unique Id is invalid for a rule with validity till 9999-12-31, then Unique Id will not be considered for processing
              if(dRuleValidToTemp === '9999-12-31') { 
                dUIDValidFrom = new Date('2000-01-01');
                dUIDValidTo = new Date('2000-01-02');
                // break;
              }
            } 
            // If Unique Id is invalid for a rule with validity till 9999-12-31, then Unique Id will not be considered for processing
            else if(dRuleValidToTemp === '9999-12-31') { 
              dUIDValidFrom = new Date('2000-01-01');
              dUIDValidTo = new Date('2000-01-02');
              // break;
            }
            else {
              if (dUIDValidFrom >= dRuleValidFrom && dUIDValidFrom <= dRuleValidTo && dRuleValidToTemp !== '9999-12-31') {
                dUIDValidFrom = new Date(dRuleValidTo.setDate(dRuleValidTo.getDate() + 1));
              } else {
                let sYear = (dUIDValidFrom.getFullYear()).toString();
                if (sYear !== '2000' && dRuleValidFrom > dUIDValidFrom) {
                  dUIDValidTo = new Date(dRuleValidFrom.setDate(dRuleValidFrom.getDate() - 1));
                  break;
                }
              }
            }

          }

          dUIDValidFrom = dUIDValidFrom.toISOString().slice(0, 10);
          dUIDValidTo = dUIDValidTo.toISOString().slice(0, 10);          

          // Update Valid From and Valid To of Unique Ids based on Rules
          await UPDATE`CP_UNIQUE_ID_HEADER`
            .with({
              VALID_FROM: dUIDValidFrom,
              VALID_TO: dUIDValidTo
            })
            .where(`UNIQUE_ID = '${aUniqueIdHeader[iUID].UNIQUE_ID}'
                  AND PRODUCT_ID = '${aUniqueIdHeader[iUID].PRODUCT_ID}'`);

          // // Update Valid From and Valid To of Unique Ids based on Rules
          // await UPDATE`CP_UNIQUE_ID_HEADER`
          //   .with({
          //     VALID_FROM: '2000-01-01',
          //     VALID_TO: '9999-12-31'
          //   })
          //   .where(`UNIQUE_ID = '${aUniqueIdHeader[iUID].UNIQUE_ID}'
          //         AND PRODUCT_ID = '${aUniqueIdHeader[iUID].PRODUCT_ID}'`);

        }

      }
    }
  }

  /**
   * 
   * @param {*} lLocation 
   * @param {*} lProduct 
   */
  async updateVariantRules(lProduct) {

    let oItemsIT = {};
    let aItemsI = [], aItemsT = [];
    let aItemsSeq = [], oItemsSeq = {};
    let aFilItems = [], aFilItemsT = [];
    let oUpdtDC = {}, aUpdtDC = [];

    let bUpdateRule = false,
      bFound = false,
      bFlag = false;

    // Fetch Variant Rules Information
    let aDerivedChar = await cds.run(`SELECT * 
                                           FROM CP_DERIVEDCHAR
                                          WHERE PRODUCT_ID = '${lProduct}'                                            
                                    ORDER BY CLAUSE,
                                            DEP_NAME, 
                                            CHAR_COUNTER`);

    // Fetch Characteristic Prioritized for Product
    let aProdCharPrioritized = await cds.run(`SELECT *
                                              FROM CP_VARCHAR_PS
                                              WHERE PRODUCT_ID = '${lProduct}'
                                              ORDER BY SEQUENCE`);

    // Create nested array with distinct Object Dependencies and its rules
    let aDCHeadItem = aDerivedChar.reduce((acc, curr) => {
      const ITEM = [];
      const {
        RECORD_TYPE,
        CLAUSE,
        DEP_NAME,
        CLASS_NUM,
        CHAR_NUM,
        CHARVAL_NUM,
        SORT_COUNTER,
        CHAR_COUNTER,
        OD_CONDITION,
        RULE_TYPE,
        CHANGE_NO,
        VALID_FROM,
        VALID_TO
      } = curr;
      const findObj = acc.find((o) => o.DEP_NAME === DEP_NAME);
      if (!findObj) {
        ITEM.push({
          RECORD_TYPE,
          CLAUSE,
          CLASS_NUM,
          CHAR_NUM,
          CHARVAL_NUM,
          SORT_COUNTER,
          CHAR_COUNTER,
          OD_CONDITION,
          RULE_TYPE,
          CHANGE_NO,
          VALID_FROM,
          VALID_TO
        });
        acc.push({ DEP_NAME, VALID_FROM, VALID_TO, ITEM });
      } else {
        findObj.ITEM.push({
          RECORD_TYPE,
          CLAUSE,
          CLASS_NUM,
          CHAR_NUM,
          CHARVAL_NUM,
          SORT_COUNTER,
          CHAR_COUNTER,
          OD_CONDITION,
          RULE_TYPE,
          CHANGE_NO,
          VALID_FROM,
          VALID_TO
        });
      }
      return acc;
    }, []);

    for (let cntDC = 0; cntDC < aDCHeadItem.length; cntDC++) {
      let aDCItems = aDCHeadItem[cntDC].ITEM;

      oItemsIT = {};
      bFlag = false;
      aItemsI = [];
      aItemsT = [];


      // Split an Array into an object of arrays based on CLAUSE(IF, THEN)
      oItemsIT = aDCItems.reduce((aCurrData, item) => {
        if (!aCurrData[item.CLAUSE]) {
          aCurrData[item.CLAUSE] = [];
        }

        aCurrData[item.CLAUSE].push(item);
        return aCurrData;
      }, {});

      if (oItemsIT) {
        // Rules with IF condition
        if (oItemsIT.I !== undefined) {
          aItemsI = oItemsIT.I;
        }

        // Rules with THEN condition
        if (oItemsIT.T !== undefined) {
          aItemsT = oItemsIT.T;
        }

        if (aItemsI.length > 0 && aItemsT.length > 0) {
          bUpdateRule = false;
        } else {
          bUpdateRule = true;
        }

        if (bUpdateRule === true && aProdCharPrioritized.length > 0) {
          // Delete Variant rules for current dependency and insert updated rules
          try {
            await cds.run(`DELETE FROM CP_DERIVEDCHAR
                            WHERE PRODUCT_ID = '${lProduct}'
                              AND DEP_NAME   = '${aDCHeadItem[cntDC].DEP_NAME}'`);
            bFlag = true;
          } catch (e) {
            console.log(e);
          }
          if (bFlag === true) {
            for (let iCPr = 0; iCPr < aProdCharPrioritized.length; iCPr++) {
              // Check for Characteristics Number in all 'IFs' array
              if (aItemsI.length > 0) {
                aFilItems = aItemsI.filter(function (aCharI) {
                  return aCharI.CHAR_NUM === aProdCharPrioritized[iCPr].CHAR_NUM;
                });

                if (aFilItems.length > 0) {
                  break;
                }
              }
              // Check for Characteristics Number in all 'THENs' array
              if (aItemsT.length > 0) {
                aFilItems = aItemsT.filter(function (aCharT) {
                  return aCharT.CHAR_NUM === aProdCharPrioritized[iCPr].CHAR_NUM;
                });

                if (aFilItems.length > 0) {
                  break;
                }
              }

            }

            if (aFilItems.length > 0) {
              oUpdtDC = {};
              for (let iDCItm = 0; iDCItm < aDCItems.length; iDCItm++) {
                bFound = false;

                oUpdtDC.PRODUCT_ID = lProduct;
                oUpdtDC.RECORD_TYPE = aDCItems[iDCItm].RECORD_TYPE;
                oUpdtDC.CLAUSE = aDCItems[iDCItm].CLAUSE;
                oUpdtDC.DEP_NAME = aDCHeadItem[cntDC].DEP_NAME;
                oUpdtDC.CLASS_NUM = aDCItems[iDCItm].CLASS_NUM;
                oUpdtDC.CHAR_NUM = aDCItems[iDCItm].CHAR_NUM;
                oUpdtDC.CHARVAL_NUM = aDCItems[iDCItm].CHARVAL_NUM;
                oUpdtDC.SORT_COUNTER = aDCItems[iDCItm].SORT_COUNTER;
                oUpdtDC.CHAR_COUNTER = aDCItems[iDCItm].CHAR_COUNTER;
                oUpdtDC.OD_CONDITION = aDCItems[iDCItm].OD_CONDITION;
                oUpdtDC.RULE_TYPE = aDCItems[iDCItm].RULE_TYPE;
                oUpdtDC.CHANGE_NO = aDCItems[iDCItm].CHANGE_NO;
                oUpdtDC.VALID_FROM = aDCItems[iDCItm].VALID_FROM;
                oUpdtDC.VALID_TO = aDCItems[iDCItm].VALID_TO;

                // Check for the characteristic number Prioritized
                bFound = aFilItems.some(function (el) {
                  return el.CHAR_NUM === aDCItems[iDCItm].CHAR_NUM;
                });

                if (bFound === true) {
                  oUpdtDC.CLAUSE = 'I';
                } else {
                  oUpdtDC.CLAUSE = 'T';
                }

                aUpdtDC.push(GenF.parse(oUpdtDC));
                oUpdtDC = {};
              }
            }
          }

        }
      }

    }

    if (aUpdtDC.length > 0) {
      // Insert Updated Rules
      await cds.run({
        INSERT:
        {
          into: { ref: ['CP_DERIVEDCHAR'] },
          entries: aUpdtDC
        }

      });
    }

  }

 //Below functions are created new for Derived Characteristics
   async generateRuleEngine(PRODUCT_ID,PROD_DESC) {
    //Get Sequence of Char.
    let aCharSeqeuence = await cds.run(`SELECT DISTINCT D.CHAR_NUM,D.SEQUENCE,C.CHAR_NAME FROM "CP_DERIVED_CHAR_SEQUENCE" AS D
          INNER JOIN "CP_CHARACTERISTICS" AS C ON C.CHAR_NUM = D.CHAR_NUM
          WHERE "PRODUCT_ID"='${PRODUCT_ID}' ORDER BY SEQUENCE ASC`);

    let aDerived = await cds.run(`SELECT DEPENDENCY,LINE_NO,LINE,TO_VARCHAR(VALID_FROM, 'YYYY-MM-DD') AS VALID_FROM,TO_VARCHAR(VALID_TO, 'YYYY-MM-DD') AS VALID_TO,'' AS TYPE FROM "CP_DERIVED_CHAR_CONFIG_PRF"  WHERE PRODUCT_ID='${PRODUCT_ID}'
      AND CURRENT_DATE>=VALID_FROM AND CURRENT_DATE <= VALID_TO  AND RULE_TYPE!='D'
      ORDER BY DEPENDENCY,LINE_NO`);

    let aECN = await cds.run(`SELECT CONCAT(DEPENDENCY,'__E') AS DEPENDENCY,LINE_NO,LINE,TO_VARCHAR(VALID_FROM, 'YYYY-MM-DD') AS VALID_FROM,TO_VARCHAR(VALID_TO, 'YYYY-MM-DD') AS VALID_TO,'E' AS TYPE  FROM "CP_DERIVED_CHAR_CONFIG_PRF"  WHERE PRODUCT_ID='${PRODUCT_ID}'
      AND VALID_FROM>CURRENT_DATE  AND RULE_TYPE!='D'
      ORDER BY DEPENDENCY,LINE_NO`);

      if(aECN&&aECN.length>0){
        aDerived = aDerived.concat(aECN);
      }

    var aVaraintTables = [], aRules = []; const oCharSeq = {};
    if(aCharSeqeuence.length>0 && aDerived.length>0){//Proceed only if sequence is maintained by User & has derived char. data
         for (let i = 0; i < aCharSeqeuence.length; i++) {
        oCharSeq[aCharSeqeuence[i].CHAR_NAME] ??= '';
        oCharSeq[aCharSeqeuence[i].CHAR_NAME] = aCharSeqeuence[i].SEQUENCE;
      }

      //Get the varaint table relevent to Derived Characteristics
      let aDVariantTables = await cds.run(`SELECT DISTINCT TABLE_NAME,CHAR_NAME,CHAR_KEY FROM "CP_VAR_DEF" 
            WHERE TABLE_NAME IN( SELECT DISTINCT TABLE_NAME FROM "CP_VAR_HDR" WHERE BOM_IND!='X' OR BOM_IND IS NULL)
          ORDER BY TABLE_NAME`);
      //Get varaint tables relevent to Derived Char.
      aVaraintTables = await cds.run(`SELECT DISTINCT TABLE_NAME,CHAR_NAME,CHARACTERISTIC_VALUE,ROW_ID FROM "CP_VAR_CONTNT" 
            WHERE TABLE_NAME IN( SELECT DISTINCT TABLE_NAME FROM "CP_VAR_HDR" WHERE BOM_IND!='X' OR BOM_IND IS NULL)
          ORDER BY TABLE_NAME`);

      //Get variant tables with column count
      var aVariantCount = await cds.run(`SELECT 
          "TABLE_NAME",
          COUNT(DISTINCT "COLUMN_ID") AS "COLUMN_COUNT"
      FROM "CP_VAR_CONTNT"
      GROUP BY "TABLE_NAME"`);

      const oVariantCount ={};
      if(aVariantCount.length>0){
        for(let v =0; v < aVariantCount.length; v++){
          oVariantCount[aVariantCount[v].TABLE_NAME] ??=0;
          oVariantCount[aVariantCount[v].TABLE_NAME] = aVariantCount[v].COLUMN_COUNT
        }
      }

      const oDVaraint = {};
      if (aDVariantTables.length > 0) {//Identify Levels based on sequence
        for (let i = 0; i < aDVariantTables.length; i++) {
          oDVaraint[aDVariantTables[i].TABLE_NAME] ??= [];
          if (aDVariantTables[i].CHAR_KEY == 'X') {
            oDVaraint[aDVariantTables[i].TABLE_NAME].push({
              "CHAR_NAME": aDVariantTables[i].CHAR_NAME
            });
          }

        }
      }

      //Attach sequence number to Char. of variant tables
      if (aVaraintTables.length > 0) {
        for (let v = 0; v < aVaraintTables.length; v++) {
          let el = aVaraintTables[v];
          el.SEQUENCE = null;
          if (oCharSeq[el.CHAR_NAME]) {//must be maintained in sequence
            el.SEQUENCE = oCharSeq[el.CHAR_NAME];
          }
          else if (oDVaraint[el.TABLE_NAME].length > 0) {//if not AVC, making it as 0
            el.SEQUENCE = 0;
          }
        }
      }
      //ignore SEQUENCE with null
      aVaraintTables = aVaraintTables.filter(v => v.SEQUENCE);

      processByGroup(aDerived);
      function processByGroup(aDerived){
         const grouped = aDerived.reduce((acc, row) => {
         if (!acc[row.DEPENDENCY]) {
        acc[row.DEPENDENCY] = { lines: [], VALID_FROM: row.VALID_FROM, VALID_TO: row.VALID_TO ,TYPE:row.TYPE};
    }
        acc[row.DEPENDENCY].lines.push(row.LINE);

        return acc;
      }, {});

      // convert to single line per dependency
      const aModified = Object.entries(grouped).map(([DEPENDENCY, data]) => ({
        DEPENDENCY,
        LINE: data.lines.join(' '),
        VALID_FROM: data.VALID_FROM,
        VALID_TO: data.VALID_TO,
        TYPE:data.TYPE
      }));

        var aVariants =[];
      for (let d = 0; d < aModified.length; d++) {
        const str = aModified[d].LINE;
        //Variant Table
        if (str.includes(" TABLE ") || str.includes(" table ")) {
          const tableMatch = str.match(/table\s+(\w+)\s*\(/i);
          const tableName = tableMatch ? tableMatch[1] : null;
          if (oDVaraint[tableName] == undefined || oDVaraint[tableName] == null) {//No varaint tables exists,return
            continue;
          }
          aModified[d].COLUMN_COUNT = oVariantCount[tableName];
          aModified[d].TABLE_NAME = tableName;
          aVariants.push(aModified[d]);
          continue;
        }
        //Select with Objects
        else if (str.includes("OBJECTS:")) {
          processObject(aRules, str, aModified[d], PRODUCT_ID);
        }
        //Select Condition
        else if (str.includes(" IF ") || str.includes(" if ")) {
          processSelectCondition(aRules, str, aModified[d]);
        }

      }

      //Process variant tables separately
      if (aVariants && aVariants.length > 0) {
         aVariants = aVariants.sort(function (a, b) {
                return a.COLUMN_COUNT - b.COLUMN_COUNT;
              });
        let aVarRules = [], aValidChar = [];//form a basic if and then first
        for (let v = 0; v < aVariants.length; v++) {

          const tableName = aVariants[v].TABLE_NAME;
          const fieldsMatch = aVariants[v].LINE.match(/table\s+\w+\s*\(([^)]+)\)/i);
          const fieldsStr = fieldsMatch ? fieldsMatch[1] : '';
          const fields = fieldsStr.split(',');
          if (fields && fields.length > 0) {
            fields.forEach(field => {

              const match = field.match(/(\w+)\s*=\s*([\w.]+)/);

              if (match) {
                aValidChar.push({
                  CHAR_NAME: match[1].trim(),
                  REF: match[2].trim()
                });
              }
            });
            const validCharSet = new Set(aValidChar.map(c => c.CHAR_NAME));
            let aFilteredTables = aVaraintTables.filter(f =>
              f.TABLE_NAME === tableName &&
              validCharSet.has(f.CHAR_NAME)
            );
            aVarRules = aVarRules.concat(generateVariantConditions(oDVaraint, aFilteredTables,aRules,aVarRules,aVariants[v]));
          }
        }
        if (aVarRules) {
          aRules = aRules.concat(aVarRules);
        }

      }
      }

      try {
        if (aRules.length > 0) {//Delete & Insert into  CP_DERIVED_CHAR_RULES
          await cds.run(`DELETE FROM "CP_DERIVED_CHAR_RULES" WHERE PRODUCT_ID='${PRODUCT_ID}'`);
          await cds.run(INSERT.into("CP_DERIVED_CHAR_RULES").entries(aRules));
          console.log("Rules Generation successful");
        }
       await this.processDerivedCharRules(PRODUCT_ID,PROD_DESC);
       console.log("Probability generation successful");
      }
      catch (ex) {
        console.log("Failed to generate Rules/Probability"+ex.message)
      }

    }
    return aRules;


    function generateVariantConditions(oDVaraint, aVaraintTables,aIRules,aVarRules,oModified) {
      var aInternalRules =[];
      const keys = ["CHAR_NAME", "CHARACTERISTIC_VALUE", "ROW_ID"];
      var aVarCond = [];

      let aDistinct = GenF.removeDuplicate(aVaraintTables, keys);
      // Extract CLASS_NAME from OBJECTS: (300)
      const objectsMatch = oModified.LINE.match(/OBJECTS:.*?\(\d+\)\s*(\w+)/i);
      const CLASS_NAME = objectsMatch ? objectsMatch[1] : null;

      const rowMap = {};

      for (const row of aDistinct) {
        if (!rowMap[row.ROW_ID]) {
          rowMap[row.ROW_ID] = [];
        }
        rowMap[row.ROW_ID].push(row);
      }

      let ruleId = 1;

      for (const rowIdKey in rowMap) {

        const rows = rowMap[rowIdKey];
        const tableName = rows[0].TABLE_NAME;

        if (oDVaraint[tableName] && oDVaraint[tableName].length > 0) {//NOT AVC

          let aChar = oDVaraint[tableName];

          for (const r of rows) {

            let isIF = aChar.some(c => c.CHAR_NAME === r.CHAR_NAME);

            aVarCond.push({
              PRODUCT_ID: PRODUCT_ID,
              DEPENDENCY: r.TABLE_NAME,
              RULE_ID: ruleId,
              CHAR_NAME: r.CHAR_NAME,
              CHAR_VALUE: r.CHARACTERISTIC_VALUE,
              CLAUSE: isIF ? 'IF' : 'THEN',
              OPERATOR: 'EQ',
              TYPE:(oModified.TYPE)?oModified.TYPE:'V',
              VALID_FROM:oModified.VALID_FROM,
              VALID_TO:oModified.VALID_TO,
              CLASS_NAME:CLASS_NAME
            });
          }

        }
        else {
          let aRules = aIRules.concat(aVarRules);
          const minSeq = Math.min(...rows.map(r => r.SEQUENCE));
          
            //Order by sequence
             rows.sort(function (a, b) {
                return a.SEQUENCE - b.SEQUENCE;
              });
          
          let bThen = false;
          let oMinSeq ={};
          for (const [i, r] of rows.entries()) {
            let sClause ='';
            if(r.SEQUENCE === minSeq){//Directly make it as IF
              sClause ='IF';
              oMinSeq = r;
            }
            else{
              if(aRules.findIndex(f=>f.CLAUSE =='IF' && f.CHAR_NAME == r.CHAR_NAME) !=-1){//If it is deriving something
                if( i == rows.length - 1 && bThen == false){//Last record and so far no THEN condition, make it as then
                  sClause ='THEN';
                  bThen = true;
                }
                else{
                  //create an Internal Rule b/w min seq. and current IF

                   sClause ='IF';

                   //IF of min seq.
                    aInternalRules.push({
                  PRODUCT_ID: PRODUCT_ID,
                  DEPENDENCY: oMinSeq.TABLE_NAME+'_I',
                  RULE_ID: ruleId,
                  CHAR_NAME: oMinSeq.CHAR_NAME,
                  CHAR_VALUE: oMinSeq.CHARACTERISTIC_VALUE,
                  CLAUSE: 'IF',
                  OPERATOR: 'EQ',
                  TYPE:'I',
                  VALID_FROM:oModified.VALID_FROM,
                VALID_TO:oModified.VALID_TO,
                CLASS_NAME:CLASS_NAME
                });
                   //THEN
                    aInternalRules.push({
                  PRODUCT_ID: PRODUCT_ID,
                  DEPENDENCY: r.TABLE_NAME+'_I',
                  RULE_ID: ruleId,
                  CHAR_NAME: r.CHAR_NAME,
                  CHAR_VALUE: r.CHARACTERISTIC_VALUE,
                  CLAUSE: 'THEN',
                  OPERATOR: 'EQ',
                  TYPE:'I',
                  VALID_FROM:oModified.VALID_FROM,
                  VALID_TO:oModified.VALID_TO,
                  CLASS_NAME:CLASS_NAME
                });
                }
               
              }
              else{
                 sClause ='THEN';
                 bThen = true;
              }
            }
            aVarCond.push({
              PRODUCT_ID: PRODUCT_ID,
              DEPENDENCY: r.TABLE_NAME,
              RULE_ID: ruleId,
              CHAR_NAME: r.CHAR_NAME,
              CHAR_VALUE: r.CHARACTERISTIC_VALUE,
              CLAUSE: sClause,
              OPERATOR: 'EQ',
              TYPE:(oModified.TYPE)?oModified.TYPE:'V',
              VALID_FROM:oModified.VALID_FROM,
              VALID_TO:oModified.VALID_TO,
              CLASS_NAME:CLASS_NAME
            });

          }
        }
        ruleId++;
      }
      aVarCond = aVarCond.concat(aInternalRules);
      return aVarCond;
    }
    function processSelectCondition(aRules, str, oModified) {
      let ruleId = 1;
       const objectsMatch = str.match(/OBJECTS:.*?\(\d+\)\s*(\w+)/i);
      const CLASS_NAME = objectsMatch ? objectsMatch[1] : null;
      const rules = str.split(',');

      rules.forEach(rule => {

        rule = rule.replace('.', '').trim();

        if (!rule) return;

        // Split into THEN and IF parts
        const [thenPart, ifPart] = rule.split(/\bIF\b/i);

        const parse = (text) => {
          const match = text.match(/(\w+)\s*(=|!=)\s*'([^']+)'/);
          if (!match) return null;

          return {
            CHAR_NAME: match[1],
            OPERATOR: match[2] === '=' ? 'EQ' : 'NE',
            CHAR_VALUE: match[3]
          };
        };

        const ifObj = parse(ifPart);
        if (ifObj) {
          aRules.push({
            PRODUCT_ID: PRODUCT_ID,
            DEPENDENCY: oModified.DEPENDENCY,
            RULE_ID: ruleId,
            ...ifObj,
            CLAUSE: 'IF',
            TYPE:(oModified.TYPE)?oModified.TYPE:'S',
            VALID_FROM:oModified.VALID_FROM,
              VALID_TO:oModified.VALID_TO,
            CLASS_NAME:CLASS_NAME
          });
        }
        // Extract THEN
        const thenObj = parse(thenPart);
        if (thenObj) {
          aRules.push({
            PRODUCT_ID: PRODUCT_ID,
            DEPENDENCY: oModified.DEPENDENCY,
            RULE_ID: ruleId,
            ...thenObj,
            CLAUSE: 'THEN',
            TYPE:(oModified.TYPE)?oModified.TYPE:'S',
            VALID_FROM:oModified.VALID_FROM,
              VALID_TO:oModified.VALID_TO,
            CLASS_NAME:CLASS_NAME
          });
        }


        ruleId++;

      });
    }

    function processObject(aRules, str, oModified, PRODUCT_ID) {

      let ruleId = 1;
      // Extract CLASS_NAME from OBJECTS: (300)
      const objectsMatch = str.match(/OBJECTS:.*?\(\d+\)\s*(\w+)/i);
      const CLASS_NAME = objectsMatch ? objectsMatch[1] : null;

      const normalizeOperator = (op) => {
        op = op.toUpperCase();
        if (op === '=') return 'EQ';
        if (op === '!=' || op === 'NE') return 'NE';
        return 'EQ';
      };

      const extractCondition = (text) => {

        let match = text.match(/(\w+)\s*IN\s*\(([^)]+)\)/i);
        if (match) {
          return {
            CHAR_NAME: match[1],
            VALUES: match[2].split(',').map(v => v.replace(/'/g, '').trim()),
            OPERATOR: 'EQ'
          };
        }

        match = text.match(/(\w+)\s*(=|!=|NE)\s*'([^']+)'/i);
        if (match) {
          return {
            CHAR_NAME: match[1],
            VALUES: [match[3]],
            OPERATOR: normalizeOperator(match[2])
          };
        }

        return null;
      };

      const extractMultiple = (text) => {
        const regex = /(\w+)\s*(=|!=|NE|IN)\s*(?:\(([^)]+)\)|'([^']+)')/gi;
        let match;
        const results = [];

        while ((match = regex.exec(text)) !== null) {

          let operator = match[2].toUpperCase();
          let values;

          if (operator === 'IN') {
            values = match[3].split(',').map(v => v.replace(/'/g, '').trim());
            operator = 'EQ';
          } else {
            values = [match[4]];
            operator = normalizeOperator(operator);
          }

          results.push({
            CHAR_NAME: match[1],
            VALUES: values,
            OPERATOR: operator
          });
        }

        return results;
      };

      const splitRules = (text) => text.split(/\s*,\s*/);
      const splitAND = (text) => text.split(/\bAND\b/i).map(s => s.trim());

      if (/RESTRICTIONS:/i.test(str) && /\bIF\b/i.test(str) && !/INFERENCES:/i.test(str)) {

        const restrictionsMatch = str.match(/RESTRICTIONS:(.*)/i);
        if (!restrictionsMatch) return;

        const rules = splitRules(restrictionsMatch[1]);

        rules.forEach(rule => {

          const parts = rule.split(/\bIF\b/i);
          if (parts.length !== 2) return;

          const thenCond = extractCondition(parts[0].trim());
          const ifConditions = splitAND(parts[1])
            .map(extractCondition)
            .filter(Boolean);

          if (!thenCond || !ifConditions.length) return;

          // SAME RULE_ID (AND group)
          ifConditions.forEach(ifCond => {
            ifCond.VALUES.forEach(val => {
              aRules.push({
                PRODUCT_ID,
                DEPENDENCY: oModified.DEPENDENCY,
                RULE_ID: ruleId,
                CHAR_NAME: ifCond.CHAR_NAME,
                CHAR_VALUE: val,
                CLAUSE: 'IF',
                OPERATOR: ifCond.OPERATOR,
                TYPE:(oModified.TYPE)?oModified.TYPE:'S',
                VALID_FROM:oModified.VALID_FROM,
                VALID_TO:oModified.VALID_TO,
                CLASS_NAME:CLASS_NAME
              });
            });
          });

          thenCond.VALUES.forEach(val => {
            aRules.push({
              PRODUCT_ID,
              DEPENDENCY: oModified.DEPENDENCY,
              RULE_ID: ruleId,
              CHAR_NAME: thenCond.CHAR_NAME,
              CHAR_VALUE: val,
              CLAUSE: 'THEN',
              OPERATOR: thenCond.OPERATOR,
              TYPE:(oModified.TYPE)?oModified.TYPE:'S',
              VALID_FROM:oModified.VALID_FROM,
              VALID_TO:oModified.VALID_TO,
              CLASS_NAME:CLASS_NAME
            });
          });

          ruleId++;
        });

        return;
      }

      if (!/\bIF\b/i.test(str) && !/RESTRICTIONS:/i.test(str)) {

        const conds = extractMultiple(str);
        if (!conds.length) return;

        // generate combinations (cartesian product)
        const generate = (index, current) => {

          if (index === conds.length) {

            current.forEach(cond => {
              aRules.push({
                PRODUCT_ID,
                DEPENDENCY: oModified.DEPENDENCY,
                RULE_ID: ruleId,
                CHAR_NAME: cond.CHAR_NAME,
                CHAR_VALUE: cond.VALUE,
                CLAUSE: 'IF',
                OPERATOR: cond.OPERATOR,
                TYPE:(oModified.TYPE)?oModified.TYPE:'S',
                VALID_FROM:oModified.VALID_FROM,
                VALID_TO:oModified.VALID_TO,
                CLASS_NAME:CLASS_NAME
              });
            });

            ruleId++;
            return;
          }

          const cond = conds[index];

          cond.VALUES.forEach(val => {
            generate(index + 1, [...current, {
              CHAR_NAME: cond.CHAR_NAME,
              VALUE: val,
              OPERATOR: cond.OPERATOR
            }]);
          });
        };

        generate(0, []);
        return;
      }

      const conditionMatch = str.match(/CONDITION:(.*?)(RESTRICTIONS:|$)/i);
      const restrictionsMatch = str.match(/RESTRICTIONS:(.*)/i);

      if (!conditionMatch || !restrictionsMatch) return;

      const ifConds = extractMultiple(conditionMatch[1]);
      const thenConds = extractMultiple(restrictionsMatch[1]);

      if (!ifConds.length || !thenConds.length) return;

      ifConds.forEach(ifCond => {
        ifCond.VALUES.forEach(ifVal => {

          thenConds.forEach(thenCond => {
            thenCond.VALUES.forEach(thenVal => {

              aRules.push({
                PRODUCT_ID,
                DEPENDENCY: oModified.DEPENDENCY,
                RULE_ID: ruleId,
                CHAR_NAME: ifCond.CHAR_NAME,
                CHAR_VALUE: ifVal,
                CLAUSE: 'IF',
                OPERATOR: ifCond.OPERATOR,
                 TYPE:(oModified.TYPE)?oModified.TYPE:'S',
                 VALID_FROM:oModified.VALID_FROM,
              VALID_TO:oModified.VALID_TO,
              CLASS_NAME:CLASS_NAME
              });

              aRules.push({
                PRODUCT_ID,
                DEPENDENCY: oModified.DEPENDENCY,
                RULE_ID: ruleId,
                CHAR_NAME: thenCond.CHAR_NAME,
                CHAR_VALUE: thenVal,
                CLAUSE: 'THEN',
                OPERATOR: thenCond.OPERATOR,
               TYPE:(oModified.TYPE)?oModified.TYPE:'S',
               VALID_FROM:oModified.VALID_FROM,
              VALID_TO:oModified.VALID_TO,
              CLASS_NAME:CLASS_NAME
              });

              ruleId++;
            });
          });

        });
      });
    }


  }

    async  processDerivedCharRules(PRODUCT_ID,PROD_DESC) {
      var that = this;
    let totalRecords = await cds.run(`
       SELECT *, 1 AS COND_WEIGHT,DEPENDENCY AS ORG_DEP
        FROM "CP_DERIVED_CHAR_RULES" AS R
        WHERE (R.CHAR_NAME IN (SELECT DISTINCT CHAR_NAME FROM "CP_DERIVED_CHAR_SEQUENCE")) AND PRODUCT_ID = '${PRODUCT_ID}'
        AND TYPE!='E'
        ORDER  BY 
                "PRODUCT_ID",
                "DEPENDENCY",
                "RULE_ID",
                "CLAUSE";
    `);

    let expandedRecords = [];
    let currentGroup = [];
    let currentKey = null;

    for (let row of totalRecords) {
        let key = `${row.DEPENDENCY}_${row.RULE_ID}`;

        if (currentKey && currentKey !== key) {
            processGroup(currentGroup, expandedRecords);
            currentGroup = [];
        }

        currentKey = key;
        currentGroup.push(row);
    }

    if (currentGroup.length) {
        processGroup(currentGroup, expandedRecords);
    }



    const neDependencies = new Set(
        expandedRecords
            .filter(r => r.CLAUSE === 'THEN' && r.OPERATOR === 'NE')
            .map(r => r.DEPENDENCY)
    );

    const filteredRecords = expandedRecords.filter(
        r => !neDependencies.has(r.DEPENDENCY)
    );

    const multiChar = await cds.run(`SELECT DISTINCT "CHAR_NAME" FROM "CP_CHARACTERISTICS" WHERE "MULTI_CHAR"= 'X'`)
    const multiCharSet = new Set(multiChar.map(m => m.CHAR_NAME));

    let filteredNERules = totalRecords.filter(r => r.OPERATOR == 'NE');
    let NEdata = []
    for (let rule of filteredNERules) {
        const data = totalRecords.filter(r => r.DEPENDENCY == rule.DEPENDENCY)
        NEdata.push(...data)

    }

    let neResult = {};

    let depMap = {};

    for (let row of NEdata) {
        if (!depMap[row.DEPENDENCY]) {
            depMap[row.DEPENDENCY] = [];
        }
        depMap[row.DEPENDENCY].push(row);
    }

    for (let dep in depMap) {

        let rows = depMap[dep];

        let ifRow = rows.find(r => r.CLAUSE === 'IF');
        let thenRow = rows.find(r => r.CLAUSE === 'THEN' && r.OPERATOR === 'NE');

        if (ifRow && thenRow) {
            let key = `${ifRow.CHAR_NAME}|${ifRow.CHAR_VALUE}`;
            let value = `${thenRow.CHAR_NAME}|${thenRow.CHAR_VALUE}`;

            neResult[key] = value;
        }
    }

    let ruleIdMap = new Map();
    let ruleCounter = 1;
    let conditionCounter = 1;
    let RULESIF = [];
    let RULESTHEN = [];

    let tdrKeySet = new Set();
    for (let rule of filteredRecords) {

        const isMultiChar = multiCharSet.has(rule.CHAR_NAME);
        if (rule.CLAUSE === 'IF' && !isMultiChar) {

            let key = `${rule.DEPENDENCY}_${rule.RULE_ID}`;

            if (!ruleIdMap.has(key)) {
                ruleIdMap.set(key, `VCR${String(ruleCounter++).padStart(2, '0')}`);
            }

            let generatedRuleId = ruleIdMap.get(key);

            RULESIF.push({
                CONDITION_ID: conditionCounter++,
                RULE_ID: generatedRuleId,
                COND_CHAR: rule.CHAR_NAME,
                COND_VALUE: rule.CHAR_VALUE,
                COND_WEIGHT: rule.COND_WEIGHT,
                DEPENDENCY: rule.DEPENDENCY,
                ORG_DEP : rule.ORG_DEP,
                CLAUSE:'IF',
                TYPE:rule.TYPE
            });
        }
        else if (rule.CLAUSE === 'THEN' && !isMultiChar) {
            let lastRow = RULESIF[RULESIF.length - 1];
            let depend = lastRow.DEPENDENCY
            if (rule.DEPENDENCY === depend) {
                let iRuleID = lastRow.RULE_ID
                let relatedIFs = RULESIF.filter(ifRec => ifRec.RULE_ID === iRuleID);
                let ruleDesc = relatedIFs
                            .map(d => d.COND_VALUE)
                            .sort()
                            .join("+");
                let ruleChar = relatedIFs
                            .map(d => d.COND_CHAR)
                            .sort()
                            .join("+");
                let thenKey = `${rule.CHAR_NAME}|${rule.CHAR_VALUE}`;

                let tdrkey = `${thenKey}|${ruleDesc}|${ruleChar}`;
                if (tdrKeySet.has(tdrkey)) {
                    RULESIF = RULESIF.filter(ifRec => ifRec.RULE_ID !== iRuleID);
                    ruleCounter--
                    continue;
                }
                else {
                    tdrKeySet.add(tdrkey);
                }

                let shouldSkip = relatedIFs.some(ifRec => {
                    let ifKey = `${ifRec.COND_CHAR}|${ifRec.COND_VALUE}`;
                    return neResult[ifKey] === thenKey;
                });
                if (shouldSkip) {
                    relatedIFs.forEach(ifRec => {
                        ifRec.COND_WEIGHT = 0;

                    });
                }

                let lastIf = relatedIFs[relatedIFs.length - 1];

                RULESTHEN.push({
                    RULE_ID: lastIf ? lastIf.RULE_ID : null,
                    TARGET_CHAR: rule.CHAR_NAME,
                    DERIVED_VALUE: rule.CHAR_VALUE,
                    RULE_DESCRIPTION: ruleDesc,
                    ACTIVE: 1,
                    CREATED_AT: new Date().toISOString(),
                    ORG_DEP : rule.ORG_DEP,
                    CLAUSE:'THEN'
                });
            }
        }

    }

      await that.createDerivedNodes(filteredRecords,PRODUCT_ID);

   function processGroup(rows, output) {
      let ifRows = rows.filter(r => r.CLAUSE === 'IF');
      let thenRows = rows.filter(r => r.CLAUSE === 'THEN');
 
      if (thenRows.length > 1) {
 
        let counter = 1;
 
        for (let thenRow of thenRows) {
          let suffix = `_${counter++}`;
 
          for (let ifRow of ifRows) {
            output.push({
              ...ifRow,
              DEPENDENCY: ifRow.DEPENDENCY + suffix
            });
          }
 
          output.push({
            ...thenRow,
            DEPENDENCY: thenRow.DEPENDENCY + suffix
          });
        }
 
      } else {
        rows.forEach(r => output.push({ ...r }));
      }
    }





  }

  async generateProbabilty(aFinal,PRODUCT_ID){
      const keys = ["PRODUCT_ID ", "NODE_KEY","CHAR_NAME","CHAR_VALUE","PARENT_KEY","ROOT_KEY"];
     aFinal = GenF.removeDuplicate(aFinal, keys);
     let aRes = await this.applyProbability(aFinal,PRODUCT_ID);

     await cds.run(`DELETE FROM "CP_DERIVED_NODES" WHERE "PRODUCT_ID"='${PRODUCT_ID}'`);
       aRes.forEach(r => {
      if (typeof r.CLASS_NAME === 'string') {
        r.CLASS_NAME = r.CLASS_NAME.toUpperCase();
      }
    });
      await cds.run(INSERT.into("CP_DERIVED_NODES").entries(aRes));

      //If product has any Partials, generate tree for partials as well
      let aPartials = await cds.run(`SELECT DISTINCT PRODUCT_ID FROM "CP_PARTIALPROD_INTRO"
                                      WHERE REF_PRODID='${PRODUCT_ID}' AND PRODUCT_ID!=REF_PRODID`);
  
      if(aPartials && aPartials.length>0){
        for(let p =0; p < aPartials.length; p++){
          let sPartial = aPartials[p].PRODUCT_ID;
          let aInput = aFinal.map(x => ({
                  ...x,
                  PRODUCT_ID: sPartial,
                  PROBABILITY: null
              }));
           let aResponse = await this.applyProbability(aInput,sPartial);
      await cds.run(`DELETE FROM "CP_DERIVED_NODES" WHERE "PRODUCT_ID"='${sPartial}'`);
      
       const keys2 = ["PRODUCT_ID ", "NODE_KEY","CHAR_NAME","CHAR_VALUE","PARENT_KEY","ROOT_KEY"];
     aResponse = GenF.removeDuplicate(aResponse, keys2);
       aResponse.forEach(r => {
  if (typeof r.CLASS_NAME === 'string') {
    r.CLASS_NAME = r.CLASS_NAME.toUpperCase();
  }
});
      await cds.run(INSERT.into("CP_DERIVED_NODES").entries(aResponse));
        }
      }
  }

  async  applyProbability(result,sProduct) {
    
  //#region Get Sales Data from Profile
      //Get Locations in which the product exists
      let aLocProd = await cds.run(`SELECT DISTINCT LOCATION_ID FROM "CP_LOCATION_PRODUCT" WHERE "PRODUCT_ID"='${sProduct}'`)
      const locationIds = aLocProd.map(r => `'${r.LOCATION_ID}'`).join(',');
      //From Profile maintenance application, get past sales orders to consider
      let aProfile = await cds.run(`SELECT PL.PRODUCT_ID,D.PAST_SALES_ORD FROM "CP_PROFILE_LOC_PROD" AS PL
                                            INNER JOIN "CP_DERIVED_CHAR_PROFILE" AS D
                                            ON PL.DERIVED_PROFILE = D.PROFILE
                                            WHERE PL.LOCATION_ID IN (${locationIds})`);
      let iPastSalesOrders = -1;
      if (aProfile && aProfile.length > 0) {
        //check if Product exists
        let oProd = aProfile.find(p => p.PRODUCT_ID == sProduct);

        if (oProd) {
          iPastSalesOrders = oProd.PAST_SALES_ORD;
        }
        else {//Get with Product 'NA'
          let aProdNA = aProfile.find(p => p.PRODUCT_ID == 'NA');
          if (aProdNA) {
            iPastSalesOrders = aProdNA.PAST_SALES_ORD;
          }
        }
      }
      var sPastSalesDate = '0001-01-01';
      if (iPastSalesOrders != -1) {
        const date = new Date();
        date.setMonth(date.getMonth() - iPastSalesOrders);
        sPastSalesDate = date.toISOString().split('T')[0];
      }

        //#endregion

        let aPartialChar = await cds.run(`SELECT DISTINCT CHAR_NAME,CHAR_VALUE FROM "V_PARTIALPRODCHAR"
                    WHERE PRODUCT_ID='${sProduct}'`);
        const oPartialChar ={};

        for(let p=0; p < aPartialChar.length; p++){
                let key = aPartialChar[p].CHAR_NAME +"|"+aPartialChar[p].CHAR_VALUE;
                oPartialChar[key] ??=true;
            }

      const uSData = await cds.run(`
    SELECT S.LOCATION_ID, S.CUSTOMER_GROUP,U.UNIQUE_ID,C.CHAR_NAME,CHAR_VALUE,SUM(S.ORD_QTY) AS QTY  FROM "CP_UNIQUE_ID_ITEM"  AS U
    INNER JOIN "CP_CHARACTERISTICS" AS C ON C.CHAR_NUM = U.CHAR_NUM
    INNER JOIN "V_SALES_H" AS S ON S.REF_PRODID = U.PRODUCT_ID AND S.UNIQUE_ID = U.UNIQUE_ID
    WHERE S.PRODUCT_ID='${sProduct}' AND S.MAT_AVAILDATE >='${sPastSalesDate}'
    GROUP BY S.LOCATION_ID,S.CUSTOMER_GROUP,U.UNIQUE_ID,C.CHAR_NAME,CHAR_VALUE

  `);
   
      const { charValueCountMap } = buildCharMaps(uSData);

      const allLocations = new Set();
      const allGroups = new Set();

      for (let char in charValueCountMap) {
        for (let val in charValueCountMap[char]) {
          for (let loc in charValueCountMap[char][val]) {
            allLocations.add(loc);

            for (let g in charValueCountMap[char][val][loc]) {
              allGroups.add(g);
            }
          }
        }
      }

      const groupMap = {};

      for (let row of result) {
        row.PROBABILITY = null;
        //only push if it exists in oPartialChar
        if(aPartialChar.length>0){
           if(oPartialChar[row.NODE_KEY] == true){
              const key = `${row.ROOT_KEY}|${row.PARENT_KEY}|${row.CHAR_NAME}`;
        (groupMap[key] ||= []).push(row);
        }
        }
        else{
                const key = `${row.ROOT_KEY}|${row.PARENT_KEY}|${row.CHAR_NAME}`;
        (groupMap[key] ||= []).push(row);
        }
       

      }

      for (let key in groupMap) {

        let children = groupMap[key];

        let locationTotals = {}; 

        for (let child of children) {

          for (let loc of allLocations) {

            if (!locationTotals[loc]) {
              locationTotals[loc] = {};
            }

            for (let group of allGroups) {
             
              var iQty =0;
              
              if( charValueCountMap?.[child.CHAR_NAME]?.[child.CHAR_VALUE]?.[loc]?.[group]){
                iQty = calculateQty(child,uSData,loc,group);
                charValueCountMap[child.CHAR_NAME][child.CHAR_VALUE][loc][group]=(iQty ==0?-1:iQty);
              }
              

              locationTotals[loc][group] =
                (locationTotals[loc][group] || 0) + iQty;
            }
          }
        }

        for (let child of children) {
          let locMap =
            charValueCountMap?.[child.CHAR_NAME]?.[child.CHAR_VALUE] || {};

          let probObj = {};

          for (let loc of allLocations) {

            probObj[loc] = {};

            for (let group of allGroups) {

              let count = Number(locMap?.[loc]?.[group] || 0);
              let total = locationTotals?.[loc]?.[group] || 0;

              if (total === 0) {
                probObj[loc][group] = Number((1 / children.length).toFixed(3));
              } else {
                probObj[loc][group] = Number((count / total).toFixed(3));
              }
              if(probObj[loc][group] < 0){
                probObj[loc][group] = 0;
              }
            }
          }

          child.PROBABILITY = JSON.stringify(probObj);
        }
      }
      return result.filter(r=>r.PROBABILITY != null);

            function buildCharMaps(data) {
      let charValueCountMap = {};

      for (let row of data) {
        const char = row.CHAR_NAME;
        const value = row.CHAR_VALUE;
        const group = row.CUSTOMER_GROUP;
         const location = row.LOCATION_ID;
        const qty = Number(row.QTY || 0);

        if (!charValueCountMap[char]) {
          charValueCountMap[char] = {};
        }

        if (!charValueCountMap[char][value]) {
          charValueCountMap[char][value] = {};
        }
        if (!charValueCountMap[char][value][location]) {
          charValueCountMap[char][value][location] = {};
        }
        // charValueCountMap[char][value][location][group] =
          // (charValueCountMap[char][value][location][group] || 0) + qty;
          charValueCountMap[char][value][location][group] =-1;
      }

      return { charValueCountMap };
    }

         function calculateQty(inp,uSData,Location,Customer) {
 
      function parseKey(key) {
        if (!key) return null;
        const [CHAR_NAME, CHAR_VALUE] = key.split('|');
        return { CHAR_NAME, CHAR_VALUE };
      }
 
      const conditions = [
        parseKey(inp.NODE_KEY),
        parseKey(inp.PARENT_KEY),
        parseKey(inp.ROOT_KEY)
      ].filter(Boolean);
 

      const keys = ["CHAR_NAME", "CHAR_VALUE"];
      let uniqueConditions = GenF.removeDuplicate(conditions, keys);
 
      const grouped = {};
      var iTotalSum =0;
      let aData = uSData.filter(f=>f.LOCATION_ID == Location && f.CUSTOMER_GROUP == Customer)
      for (const row of aData) {
        let sKey = row.CHAR_NAME+"|"+row.CHAR_VALUE;
        if(inp.NODE_KEY == sKey || inp.PARENT_KEY == sKey || inp.ROOT_KEY == sKey){
               const id = row.UNIQUE_ID;
 
        if (!grouped[id]) {
          grouped[id] = { qty: 0, chars: {},charLength:0 };
        }
          if(inp.NODE_KEY == sKey){
            grouped[id].qty += Number(row.QTY);
          }
        grouped[id].chars[row.CHAR_NAME] = row.CHAR_VALUE;
        grouped[id].charLength = Object.keys(grouped[id].chars).length;
        if(grouped[id].charLength == uniqueConditions.length){
          iTotalSum += grouped[id].qty;
        }
        }
   
      }
      return iTotalSum;
 
    }
    }

    async createDerivedNodes(filteredRecords,PRODUCT_ID){
      let cTree= createLongestPathNodes(filteredRecords)
     await createNodes(cTree,this,filteredRecords,PRODUCT_ID);
    
   function createLongestPathNodes(records){
    let tree = buildTreeNew(records)
    const maxDepthMap = getMaxDepthMap(tree);
    return pruneTree(tree, maxDepthMap);

    function getMaxDepthMap(tree) {

        let maxDepthMap = {};

        function traverse(node, obj, depth, root) {

            if (!maxDepthMap[root]) {
                maxDepthMap[root] = {};
            }

            if (!maxDepthMap[root][node] || maxDepthMap[root][node] < depth) {
                maxDepthMap[root][node] = depth;
            }

            for (let child in obj[node]) {
                traverse(child, obj[node], depth + 1, root);
            }
        }

        for (let root in tree) {
            traverse(root, tree, 0, root);
        }

        return maxDepthMap;
    }
    function pruneTree(tree, maxDepthMap) {

    function build(node, obj, depth, root) {

        let result = {};

        for (let child in obj[node]) {

            let maxDepth = maxDepthMap[root][child];

            let newKey = child;

            if (depth + 1 !== maxDepth) {
                newKey = child + "*";
            }

            result[newKey] = build(child, obj[node], depth + 1, root);
        }

        return result;
    }

    let finalTree = {};

    for (let root in tree) {
        finalTree[root] = build(root, tree, 0, root);
    }

    return finalTree;
}

    function buildTreeNew(records){

      if(records && records.length>0){
        //find Level 0 as starting point
        let ifSet = new Set();
        let thenSet = new Set();
        let oCharDep ={},oDep ={},oCharLevel ={};
        const oTree ={};
        for(let r =0; r< records.length; r++){
          let el= records[r];
          if(el.CLAUSE == 'IF'){
            ifSet.add(`${el.CHAR_NAME}|${el.CHAR_VALUE}`);
          }
          else{
            thenSet.add(`${el.CHAR_NAME}|${el.CHAR_VALUE}`);
          }
          let sDepkey =el.DEPENDENCY+"|"+el.RULE_ID;
          let oChar = el.CHAR_NAME+"|"+el.CHAR_VALUE;
         

          oDep[sDepkey] ??= {
              rows: [],
              ifCount: 0
            };

          el.CHARNAME_VALUE = oChar;
          oDep[sDepkey].rows.push(el);
          if (el.CLAUSE === 'IF') {
             oCharDep[oChar] ??=[];
          oCharDep[oChar].push(sDepkey);

             oDep[sDepkey].ifCount++;
          }

          oCharLevel[el.CHAR_NAME] ??=999;
        }
          
             let roots = [...ifSet].filter(char => !thenSet.has(char));

             function buildTree(smainRoot,sRoot,oCharDep,oDep,oTree,Clause,roots,oCharLevel,iLevel){
               let iLevelIndex = iLevel;
              let aDep = oCharDep[sRoot];
               if(aDep){
                aDep.sort((a, b) => {
                    return (oDep[a]?.ifCount || 0) - (oDep[b]?.ifCount || 0);
                });
                if(!oTree[sRoot] &&Clause!='THEN' ) oTree[sRoot]={};
               iLevelIndex++;
                for(let t =0; t < aDep.length; t++){
                  let aCond = oDep[aDep[t]];
                  let sRootChar = smainRoot.split("|")[0];
                  let aRows = aCond.rows.filter(f=>f.CHAR_NAME == sRootChar && f.CLAUSE == 'IF');
                  //check if its same main root
                  if(aRows.length>0){//check if value is same
                    if(aRows.findIndex(ind=>ind.CHARNAME_VALUE == smainRoot ) == -1){
                      continue;
                    }
                  }

                   let aThen = aCond.rows.filter(f=>f.CLAUSE =='THEN');
                   let oPath =  oTree[sRoot];
                  let aIf =[];
                  if(aCond.ifCount >0){
                     aIf = aCond.rows.filter(f=>f.CLAUSE =='IF' && f.CHARNAME_VALUE !=sRoot && f.CHAR_NAME !=sRootChar);
                  }
                  
                   //Create tree node if does not exists
                    aIf.forEach(n=>{
                      //if it belongs to different level 0, dont process
                        if(roots.includes(n.CHARNAME_VALUE)){
                            aThen =[];
                        }
                        else{
                          //if its above 
                          if(!(oCharLevel[n.CHAR_NAME] != 999 && iLevelIndex > oCharLevel[n.CHAR_NAME] )){
                             if(!oTree[sRoot][n.CHARNAME_VALUE]) oTree[sRoot][[n.CHARNAME_VALUE]]={};
                        //TODO what if 3 IF's
                         oPath =  oTree[sRoot][[n.CHARNAME_VALUE]];
                        }
                          }
                      

                    })

                     aThen.forEach(t => {
                      if( oCharLevel[t.CHAR_NAME]==999){
                      oCharLevel[t.CHAR_NAME] = iLevelIndex;
                      }
                      if (!oPath[t.CHARNAME_VALUE]) oPath[t.CHARNAME_VALUE] = {};

                     
                      buildTree(smainRoot,t.CHARNAME_VALUE,oCharDep,oDep,oPath,'THEN',roots,oCharLevel,iLevelIndex)
                });
                  
                }
               }
             }

              // oCharLevel[roots[4].split("|")[0]] =0;
              // buildTree(roots[4],roots[4],oCharDep,oDep,oTree,'IF',roots,oCharLevel,0)//Process 1 by 1 level 0;

             for(let t =0; t < roots.length; t++){
              oCharLevel[roots[t].split("|")[0]] =0;
             buildTree(roots[t],roots[t],oCharDep,oDep,oTree,'IF',roots,oCharLevel,0)//Process 1 by 1 level 0;
             }
             return oTree;
            
      }


    } 
}

      async function createNodes(tree,that,filteredRecords,PRODUCT_ID) {
      let result = [];
      const classNameMap = new Map((filteredRecords||[]).map(r => [`${r.CHAR_NAME}|${r.CHAR_VALUE}`, r.CLASS_NAME]));

      function traverse(node, parent = null, root = null, level = 0) {
        for (let key in node) {
          let isInvalid = key.endsWith("*");
          let cleanKey = isInvalid ? key.slice(0, -1) : key;
          let [charName, charValue] = cleanKey.split("|");
          result.push({
            PRODUCT_ID:PRODUCT_ID,
            NODE_KEY: key,
            CHAR_NAME: charName,
            CHAR_VALUE: charValue,
            PARENT_KEY: parent == null ?'':parent,
            ROOT_KEY: root,
            LEVEL: isInvalid ? -99 : level,
            CLASS_NAME: classNameMap.get(cleanKey) ?? null,
          });

          traverse(node[key], cleanKey, root,isInvalid ? level : level + 1);
        }
      }

      for (let rootKey in tree) {
        traverse(
          { [rootKey]: tree[rootKey] },
          null,
          rootKey,
          0
        );
      }

      
      //modify -99
      let aTree =[];
      if(result && result.length>0){
        for(let r=0; r< result.length; r++){
          if(result[r].LEVEL == -99){
            //find respective
            let key = result[r].NODE_KEY.replace('*','');
            let oRec = result.find(f=>f.NODE_KEY == key && f.ROOT_KEY == result[r].ROOT_KEY);
            if(oRec){
             const obj = Object.assign({},oRec);
            obj.NODE_KEY = result[r].NODE_KEY;
            obj.TYPE ='M';//Modified
           aTree.push(obj);
            }
          }
          else{
            result[r].TYPE='I';//Initial
            aTree.push(result[r]);
          }
        }
      }
      //Remove invalid paths
        let aFinal =[];
      if(aTree&& aTree.length>0){
        const oAllowed ={},oRoots ={};
        for(let t =0; t < aTree.length; t++){
          let el = aTree[t];
          if(el.TYPE =='M'){
            oAllowed[el.ROOT_KEY] ??={};
                oAllowed[el.ROOT_KEY][el.LEVEL] ??={};
                oAllowed[el.ROOT_KEY][el.LEVEL][el.CHAR_NAME] ??=new Set()
                oAllowed[el.ROOT_KEY][el.LEVEL][el.CHAR_NAME].add(el.CHAR_VALUE);
          }

          oRoots[el.ROOT_KEY] ??={};
        }
         for(let t =0; t < aTree.length; t++){
            let el = aTree[t];
           if(oAllowed[el.ROOT_KEY]?.[el.LEVEL]?.[el.CHAR_NAME]){
             if(!oAllowed[el.ROOT_KEY]?.[el.LEVEL]?.[el.CHAR_NAME]?.has(el.CHAR_VALUE)){
                                        continue;//skip this as it is not allowed
              }
           }
           oRoots[el.ROOT_KEY][el.NODE_KEY] ??=true;
           if(el.TYPE!='M'){
            if(el.LEVEL>0){
              if(!oRoots[el.ROOT_KEY][el.PARENT_KEY]){//if current node parent exists
                continue;
              }
            }
            aFinal.push(el);
           }
           
         }

      }
        //Create Path Links
        if (aFinal) {
          const nodeKeyMap = new Map(aFinal.filter(e => e.NODE_KEY && e.ROOT_KEY).map(e => [`${e.ROOT_KEY}||${e.NODE_KEY}`, e]));
          for (let f = 0; f < aFinal.length; f++) {
            let el = aFinal[f];
            if (!el.PARENT_KEY || !el.ROOT_KEY) continue;
            const chain = [];
            let current = el;
            while (current.PARENT_KEY) {
              const key = `${el.ROOT_KEY}||${current.PARENT_KEY}`;
              if (!nodeKeyMap.has(key)) break;
              current = nodeKeyMap.get(key);
              chain.unshift(current.NODE_KEY);
            }
            if (chain[0] !== el.ROOT_KEY) chain.unshift(el.ROOT_KEY);
            el.PARENT_CHAIN = chain.join(',');
          }
        }
      
     
      await that.generateProbabilty(aFinal,PRODUCT_ID);
       

    }
  
  }

   
    

   /**
 * Get Sales History for location - product.
 * Process each rule to get success and failed percentage of each rule
 * @param {*} lLocation
 * @param {*} lProduct
 */
  async genConfigValidityRules(sLocation,sProduct) {

    let aRules = await cds.run(`SELECT DEPENDENCY, RULE_ID, CHAR_NAME, CHAR_VALUE, CLAUSE, OPERATOR, VALID_FROM, VALID_TO
        FROM "CP_DERIVED_CHAR_RULES"
        WHERE PRODUCT_ID='${sProduct}' AND ACTIVE=true AND VALID_FROM>CURRENT_DATE`);


     await cds.run(
        `DELETE FROM "CP_UNIQUEID_RULE_VALIDITY"
          WHERE UNIQUE_ID IN (SELECT DISTINCT UNIQUE_ID FROM "CP_UNIQUE_ID_HEADER" WHERE UID_TYPE='U' AND PRODUCT_ID='${sProduct}')`
      );

        await cds.run(
        UPDATE("CP_UNIQUE_ID_HEADER")
          .set({
            VALID_FROM: '2000-01-01',
            VALID_TO: '9999-12-31'
          })
          .where({
            UID_TYPE: 'U',
            PRODUCT_ID: sProduct
          })
      );

    if (!aRules || aRules.length === 0) {
      return;
    }

    const aUItem = await cds.run(`
    SELECT "UNIQUE_ID","CHAR_NAME","CHAR_VALUE" 
    FROM "V_UNIQUE_ID_ITEM" 
    WHERE "PRODUCT_ID"='${sProduct}' AND "UID_TYPE"='U'
      AND CHAR_VALUE NOT LIKE 'NOT_%'
  `);

    let charMap = {};
    for (let row of aUItem) {
      let key = `${row.CHAR_NAME}|${row.CHAR_VALUE}`;
      if (!charMap[key]) {
        charMap[key] = new Set();
      }
      charMap[key].add(row.UNIQUE_ID);
    }

    let groupedRules = {};
    for (let rule of aRules) {
      let key = `${rule.DEPENDENCY}|${rule.RULE_ID}`;
      if (!groupedRules[key]) {
        groupedRules[key] = [];
      }
      groupedRules[key].push(rule);
    }

    const getSet = (charName, charValue) => {
      return charMap[`${charName}|${charValue}`] || new Set();
    };

    const intersectSets = (sets) => {
      if (!sets.length) return new Set();
      return sets.reduce((a, b) => new Set([...a].filter(x => b.has(x))));
    };

    let aRuleValData = [];

    for (let key in groupedRules) {
      let rules = groupedRules[key];

      let ifRules = rules.filter(r => r.CLAUSE === 'IF');
      let thenRules = rules.filter(r => r.CLAUSE === 'THEN');

      if (!ifRules.length || !thenRules.length) continue;

      let ifSets = ifRules.map(r => getSet(r.CHAR_NAME, r.CHAR_VALUE));
      let ifResult = intersectSets(ifSets);

      if(ifResult.size ==0){
        continue;
      }

      let thenSets = thenRules.map(r => getSet(r.CHAR_NAME, r.CHAR_VALUE));
      let thenResult = intersectSets(thenSets);

      let aCUID = [...ifResult].filter(x => thenResult.has(x));

      let { VALID_FROM, VALID_TO } = rules[0];
      let depName = key.split("|")[0]
      for (let uid of aCUID) {
        aRuleValData.push({
          UNIQUE_ID: uid,
          DEP_NAME: depName,
          VALID_FROM,
          VALID_TO
        });
      }
    }
    if (aRuleValData.length > 0) {
      await cds.run(
        INSERT.into("CP_UNIQUEID_RULE_VALIDITY").entries(aRuleValData)
      );
      let groupedUIDs = {};

      for (let row of aRuleValData) {
        let key = row.UNIQUE_ID;

        if (!groupedUIDs[key]) {
          groupedUIDs[key] = { ...row };
        } else {
          if (row.VALID_FROM > groupedUIDs[key].VALID_FROM) {
            groupedUIDs[key].VALID_FROM = row.VALID_FROM;
          }

          if (row.VALID_TO > groupedUIDs[key].VALID_TO) {
            groupedUIDs[key].VALID_TO = row.VALID_TO;
          }
        }
      }
      let aUHeader = Object.values(groupedUIDs);
      for (let row of aUHeader) {

        await cds.run(
          UPDATE("CP_UNIQUE_ID_HEADER")
            .set({
              VALID_FROM: row.VALID_FROM,
              VALID_TO: row.VALID_TO
            })
            .where({
              UNIQUE_ID: row.UNIQUE_ID,
              PRODUCT_ID: sProduct
            })
        );
      }

    }

  }

  
 
}
module.exports = DerivedConfig;
