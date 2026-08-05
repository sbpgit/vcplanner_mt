//Class for Generic Functions
const xsenv = require("@sap/xsenv");
const axios = require('axios');
const JobSchedulerClient = require("@sap/jobs-client");
const jwt = require("jsonwebtoken");
// const moment = require('moment');
class GenFunctions {
  constructor() { }

  /**
   * Change the current date format
   * @returns Date in YYYY-MM-DD Format
   */
  static getCurrentDate() {
    const lDate = new Date();
    return lDate.toISOString().split("T")[0];
  }

  /**
   * Get the date of the previous week
   * @param {Date} imDate
   * @returns The Last Week date
   */
  static getLastWeekDate(imDate) {
    const lDate = new Date(imDate);
    const lLastWeek = new Date(
      lDate.getFullYear(),
      lDate.getMonth(),
      lDate.getDate() - 7
    );

    return lLastWeek.toISOString().split("T")[0];
  }

  /**
   * Get next sunda
   * @param {Date} imDate
   * @returns Next sunday in YYYY-MM-DD Format
   */
  static getNextSunday(imDate) {
    const lDate = new Date(imDate);
    let lDay = lDate.getDay();
    if (lDay !== 0) lDay = 7 - lDay;
    const lNextSun = new Date(
      lDate.getFullYear(),
      lDate.getMonth(),
      lDate.getDate() + lDay
    );

    return lNextSun.toISOString().split("T")[0];
  }

  /**
   * Get next Monday
   * @param {Date} imDate
   * @returns Next monday in YYYY-MM-DD format
   */
  static getNextMondayCmp(imDate) {
    var vDate, vMonth, vYear;
    const lDate = new Date(imDate);
    let lDay = lDate.getDay();
    if (lDay === 1) {
      lDay = 0;
    } else {
      if (lDay !== 0) lDay = 7 - lDay;
      lDay = lDay + 1;
    }
    const lNextSun = new Date(
      lDate.getFullYear(),
      lDate.getMonth(),
      lDate.getDate() + lDay
    );

    return lNextSun.toISOString().split("T")[0];
  }
  static getPreviousMondayCmp(imDate) {
    const lDate = new Date(imDate);
    let lDay = lDate.getDay();
    if (lDay === 0) {
      lDay = 7;
    }
    // Subtract days to reach previous Monday
    const prevMonday = new Date(
      lDate.getFullYear(),
      lDate.getMonth(),
      lDate.getDate() - (lDay - 1)
    );

    return prevMonday.toISOString().split("T")[0];
  }
  static getNextMondayCmpForCIR(imDate) {
    var vDate, vMonth, vYear;
    const lDate = new Date(imDate);
    let lDay = lDate.getDay();
    if (lDay !== 0) lDay = 7 - lDay;
    lDay = lDay + 1;
    const lNextSun = new Date(
      lDate.getFullYear(),
      lDate.getMonth(),
      lDate.getDate() + lDay
    );

    return lNextSun.toISOString().split("T")[0];
  }

  static dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    let props = arguments;
    const that = this;
    return function (obj1, obj2) {
      var i = 0,
        result = 0,
        numberOfProperties = props.length;
      /* try getting a different result from 0 (equal)
       * as long as we have extra properties to compare
       */
      while (result === 0 && i < numberOfProperties) {
        result = that.dynamicSort(props[i])(obj1, obj2);
        i++;
      }
      return result;
    };
  }

  static dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      /* next line works with strings and numbers,
       * and you may want to customize it to your needs
       */
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  }

  /**
   * Parse the input
   * @param {String} input
   * @returns Parsed Value
   */
  static parse(input) {
    return JSON.parse(JSON.stringify(input));
  }

  /**
   * Add one to couneter till it reaches the maximum value.
   * @param {Counter} i
   * @param {Maximum value} lMax
   * @returns
   */
  static addOne(i, lMax) {
    if (i + 1 === lMax) return i;

    return i + 1;
  }

  /**
   * Subtract counter till it reaches zero
   * @param {Counter} i
   * @returns
   */
  static subOne(i) {
    if (i === 0) return i;
    return i - 1;
  }

  static subOnenew(i) {
    if (i === 0) return i;
    return i + 1;
  }

  /**
   * Add days to the date
   * @param {Date} imDate
   * @param {Days} imDays
   * @returns Date after addition in YYYY-MM-DD format
   */
  static addDays(imDate, imDays) {
    var vDate, vMonth, vYear;
    const lDate = new Date(imDate);
    const lNextWeekDay = new Date(
      lDate.getFullYear(),
      lDate.getMonth(),
      lDate.getDate() + imDays
    );

    vDate = lNextWeekDay.getDate();
    vMonth = lNextWeekDay.getMonth() + 1;
    vYear = lNextWeekDay.getFullYear();
    if (vDate < 10) {
      vDate = "0" + vDate;
    }
    if (vMonth < 10) {
      vMonth = "0" + vMonth;
    }
    return vYear + "-" + vMonth + "-" + vDate;
    //  return lNextWeekDay.toISOString().split('T')[0];
  }

  /**
   * Subtract days to the date
   * @param {Date} imDate
   * @param {Days} imDays
   * @returns Date after subtraction in YYYY-MM-DD format
   */
  static removeDays(imDate, imDays) {
    const lDate = new Date(imDate);
    const lNextWeekDay = new Date(
      lDate.getFullYear(),
      lDate.getMonth(),
      lDate.getDate() - imDays
    );

    return lNextWeekDay.toISOString().split("T")[0];

    // var result = new Date(date);
    // result.setDate(result.getDate() + days);
    // return result;
  }

  /**
   * Add Months to date
   * @param {Date} imDate
   * @param {Months} months
   * @returns Date after Months addition
   */
  static addMonths(imDate, months) {
    var d = new Date(imDate); //.getDate();
    // imDate.setMonth(imDate.getMonth() + +months);
    // if (imDate.getDate() != d) {
    //     imDate.setDate(0);
    // }
    var newDate = new Date(d.setMonth(d.getMonth() + months));
    return newDate;
  }

  /**
   * Check if input is a date
   * @param {Date} d
   * @returns
   */
  static getDateIfDate(d) {
    var m = d.match(/\/Date\((\d+)\)\//);
    return m
      ? new Date(+m[1]).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      : d;
  }

  /**
   * Remove duplicates in a array with respect to the key
   * @param {Array} array
   * @param {Key} keys
   * @returns
   */
  static removeDuplicate(array, keys) {
    // var check = new Set();
    // return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
    // const keys = ['PRODUCT_ID', 'VERSION', 'SCENARIO'];
    const filtered = array.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join("|"))
      )(new Set())
    );
    return filtered;
  }

  /**
   * Log a message
   * @param {Message} lMessage
   */
  static log(lMessage) {
    console.log(`VCP: ${lMessage}`);
  }

  /**
   * Get Job Scheduler
   * @param {REQ} req
   * @returns
   */
  static getJobscheduler(req) {
    xsenv.loadEnv();
    const services = xsenv.getServices({
      jobscheduler: { tags: "jobscheduler" },
    });
    if (services.jobscheduler) {
      const options = {
        baseURL: services.jobscheduler.url,
        user: services.jobscheduler.user,
        password: services.jobscheduler.password,
      };
      return new JobSchedulerClient.Scheduler(options);
    } else {
      req.error("no jobscheduler service instance found");
    }
  }

  /**
   * Log message into Job Scheduler
   * @param {REQ} req
   * @param {Message} lMessage
   */
  static async logMessage(req, lMessage) {
    this.log(lMessage);

    let errorObj = {};
    // errorObj["success"] = true;
    errorObj["message"] = lMessage;
    if (req.headers["x-sap-job-id"] > 0) {
      const scheduler = this.getJobscheduler(req);
      let updateReq = {
        jobId: req.headers["x-sap-job-id"],
        scheduleId: req.headers["x-sap-job-schedule-id"],
        runId: req.headers["x-sap-job-run-id"],
        data: errorObj,
      };
      scheduler.updateJobRunLog(updateReq, function (err, result) {
        if (err) {
          return console.log("Error updating run log: %s", err);
        }
      });
    }
  }

  /**
   * Get VCP Configuration Parameters
   * @param {Location} lLocation
   * @param {Parameter} lParameter
   */
  static async getParameterValue(lLocation, lParameter) {
    const lsValue = await SELECT.one
      .from("CP_PARAMETER_VALUES")
      .columns("VALUE")
      .where(
        `LOCATION_ID = '${lLocation}' AND PARAMETER_ID = ${parseInt(
          lParameter
        )}`
      );
    // To avoid returning value from undefined parameter  
    if (lsValue) {
      return lsValue.VALUE;
    } else {
      lsValue;
    }
    // return lsValue.VALUE;
  }

  /**
   * Get IBP Configuration Parameters
   * @param {Location} lLocation
   * @param {Parameter} lParameter
   */
  static async getIBPParameterValue() {
    // Get Planning area and Prefix configurations for IBP
    let liParaValue = await SELECT.from("CP_PARAMETER_VALUES")
      .columns("PARAMETER_ID", "VALUE")
      .where(`PARAMETER_ID = ${parseInt(8)} OR PARAMETER_ID = ${parseInt(10)}`)
      .orderBy("PARAMETER_ID");
    let lKeys = ["PARAMETER_ID", "VALUE"];
    liParaValue = this.removeDuplicate(liParaValue, lKeys);
    return liParaValue; //[liParaValue[0].VALUE, liParaValue[1].VALUE];
  }

  /**
   * Add Leading zeros to the number value till the total size is met
   * @param {Value} num
   * @param {Size} size
   * @returns
   */
  static addleadzeros(num, size) {
    num = num.toString();

    while (num.length < size) num = "0" + num;

    return num;
  }

  /**
   * Remove leading zeros in the value
   * @param {Value} num
   * @returns
   */
  static removeSOleadzeros(num) {
    num = num.toString();
    num = num.replace(/^0+/, "");

    // while (num.length < size) num = "0" + num;

    return num;
  }

  /**
   * Get Cluster Profile
   */
  static getClusterProfile(iUIDCnt) {
    let sProfile = "SBP_AHC_3";

    // Based on Unique Id Count, profile is changed as per the test script config
    if (iUIDCnt >= 1 && iUIDCnt <= 10) {
      sProfile = "SBP_AHC_3";
    } else if (iUIDCnt >= 11 && iUIDCnt <= 20) {
      sProfile = "SBP_AHC_4";
    } else if (iUIDCnt >= 21 && iUIDCnt <= 30) {
      sProfile = "SBP_AHC_5";
    } else if (iUIDCnt >= 31 && iUIDCnt <= 40) {
      sProfile = "SBP_AHC_6";
    } else if (iUIDCnt >= 41 && iUIDCnt <= 50) {
      sProfile = "SBP_AHC_7";
    } else if (iUIDCnt >= 51 && iUIDCnt <= 60) {
      sProfile = "SBP_AHC_8";
    } else if (iUIDCnt >= 61 && iUIDCnt <= 70) {
      sProfile = "SBP_AHC_9";
    } else if (iUIDCnt >= 71 && iUIDCnt <= 80) {
      sProfile = "SBP_AHC_10";
    } else if (iUIDCnt >= 81 && iUIDCnt <= 90) {
      sProfile = "SBP_AHC_11";
    } else if (iUIDCnt >= 91 && iUIDCnt <= 100) {
      sProfile = "SBP_AHC_12";
    } else if (iUIDCnt >= 101 && iUIDCnt <= 110) {
      sProfile = "SBP_AHC_13";
    } else if (iUIDCnt >= 111 && iUIDCnt <= 120) {
      sProfile = "SBP_AHC_14";
    } else {
      sProfile = "SBP_AHC_0";
    }

    return sProfile;
  }

  /**
   * Maintain Job logs
   * @param {Complete Flag} lFlag
   * @param {Message} lMessage
   * @param {REQ} req
   */
  static async jobSchMessage(lFlag, lMessage, req) {
    this.log(lMessage);
    let jobid = req.headers["x-sap-job-id"];
    lFlag = lFlag == '' ? 'E' : lFlag;
    if (jobid) {
      try {
        await UPDATE`JS_JOB_TEMPLATEDETAILS`
          .with({
            LOG: lFlag
          })
          .where(`SUBJOB_ID = '${jobid}'`);
      } catch (e) {
        console.log("error to update the log flag");
      }
    }

    if (lFlag === "X") {
      let dataObj = {};
      dataObj["success"] = true;
      dataObj["message"] = lMessage;

      if (req.headers["x-sap-job-id"] > 0) {
        const scheduler = this.getJobscheduler(req);

        var updateReq = {
          jobId: req.headers["x-sap-job-id"],
          scheduleId: req.headers["x-sap-job-schedule-id"],
          runId: req.headers["x-sap-job-run-id"],
          data: dataObj,
        };
        const vMessaage = lMessage + "and exported, to update req";
        console.log(vMessaage, updateReq);
        console.log("updateReq", updateReq);
        scheduler.updateJobRunLog(updateReq, function (err, result) {
          if (err) {
            return console.log("Error updating run log: %s", err);
          }
          //Run log updated successfully
          const vMessaage2 = lMessage + " and job update results are ";
          console.log(vMessaage2, result);
        });
      }
    } else {
      let dataObj = {};
      dataObj["success"] = false;
      dataObj["message"] = lMessage;

      if (req.headers["x-sap-job-id"] > 0) {
        const scheduler = this.getJobscheduler(req);

        var updateReq = {
          jobId: req.headers["x-sap-job-id"],
          scheduleId: req.headers["x-sap-job-schedule-id"],
          runId: req.headers["x-sap-job-run-id"],
          data: dataObj,
        };

        const vMessaage = lMessage + "and exported, to update req";
        console.log(vMessaage, updateReq);

        scheduler.updateJobRunLog(updateReq, function (err, result) {
          if (err) {
            return console.log("Error updating run log: %s", err);
          }
          //Run log updated successfully
          const vMessaage2 = lMessage + " and job update results are ";
          console.log(vMessaage2, result);
        });
      }
    }
  }

  /**
   * Get Configurable product
   * @param {Location} lLocation
   * @param {Product} lProduct
   * @returns Configurable Product
   */
  static async getConfigProd(lLocation, lProduct) {
    let lsMainProduct = await SELECT.one
      .from("CP_PARTIALPROD_INTRO")
      .columns("REF_PRODID")
      .where(`LOCATION_ID = '${lLocation}' AND PRODUCT_ID = '${lProduct}'`);
    if (lsMainProduct === null || lsMainProduct == undefined) {
      return GenF.parse(lProduct);
    } else {
      return lsMainProduct.REF_PRODID;
    }
  }

  /**
   * Get Job Logs
   * @param {Flag} flag
   * @param {REQ} req
   * @param {Login User} User
   * @returns
   */
  static getLogInput(flag, req, User) {
    //Get User Email ,if not authenticating via xsuaa get userId
    var sUser = req.user.id;
    if (User) {
      sUser = User;
    }
    // (req.req.authInfo)?sUser = req.req.authInfo.getEmail() : sUser =req.user.id;
    var d = new Date();
    let month = d.getUTCMonth() + 1;
    month = month.toString().length == 1 ? "0" + month : month;
    let date = d.getUTCDate();
    date = date.toString().length == 1 ? "0" + date : date;
    var currentDate = d.getUTCFullYear() + "-" + month + "-" + date;
    //Storing as UTC Time Format
    let hrs =
      d.getUTCHours().toString().length == 1
        ? "0" + d.getUTCHours()
        : d.getUTCHours();
    let mns =
      d.getUTCMinutes().toString().length == 1
        ? "0" + d.getUTCMinutes()
        : d.getUTCMinutes();
    let sec =
      d.getUTCSeconds().toString().length == 1
        ? "0" + d.getUTCSeconds()
        : d.getUTCSeconds();
    var currentTime = hrs + ":" + mns + ":" + sec;
    if (flag == "C") {
      //If new Data is getting inserted into table
      return {
        CREATED_DATE: currentDate,
        CREATED_BY: sUser,
        CREATED_TIME: currentTime,
      };
    } else {
      //If existing data is getting modified from table
      return {
        CHANGED_DATE: currentDate,
        CHANGED_BY: sUser,
        CHANGED_TIME: currentTime,
      };
    }
  }
  /**
   * 
   * @param {Location} lLocation 
   * @param {Product} lProduct
   */
  static async getFactoryLoc(lLocation, lProduct) {
    let lsFactory = await SELECT.one
      .from('CP_FACTORY_SALESLOC')
      .columns('FACTORY_LOC')
      .where(`LOCATION_ID = '${lLocation}' AND PRODUCT_ID = '${lProduct}'`);
    if (lsFactory === null) {
      return this.parse('');
    } else {
      return this.parse(lsFactory.FACTORY_LOC);
    }
  }

  /**
   * Calculate number of weeks between the dates considering weekstart day as monday 
   * @param {startDate} startDate 
   * @param {endDate} endDate
   */
  static async getWeeksBetween(startDate, endDate) {
    const dayTimestamp = 24 * 3600 * 1000;
    //count how many days between 2 dates
    const days = 1 + Math.round((endDate - startDate) / dayTimestamp);

    //get the day difference from the current date with Monday
    const dayDiff = (startDate.getDay() + 6) % 7

    //the default count is always 1, and calculate how many full weeks go from the start date to the end date
    //a full week will be 7 days
    return 1 + Math.floor((days + dayDiff) / 7);
  }
  /**
  * Get VCP Configuration Parameters
  * @param {ParamName} lParameter
  */
  static async getSystemConfig(ParamName) {
    const lsValue = await SELECT.one
      .from("CP_USER_PREFERENCES")
      .columns("PARAMETER_VALUE")
      .where(
        `PARAMETER = '${ParamName}'`
      );
    return lsValue.PARAMETER_VALUE;
  }
  /**
  * returns Option Percentage sum as 100 for characteristics
  * @param {ParamName} aData
  */
  static async optionPercentageCheck(aData) {
    var aTempData = [];
    var lKeys = ["CHAR_NUM", "CHARVAL_NUM", "WEEK_DATE"];
    var aDistinctChar = this.removeDuplicate(aData, lKeys);
    if (aDistinctChar.length > 0) {
      for (var i = 0; i < aDistinctChar.length; i++) {
        let el = aDistinctChar[i];
        if (el.CHAR_NUM) {
          //Filter all the data of that char_num and check the option percentage sum
          let aFilteredData = aData.filter(f => f.CHAR_NUM == el.CHAR_NUM && f.WEEK_DATE == el.WEEK_DATE);
          var sumOptQty = aFilteredData.reduce(function (sum, item) {
            return {
              qty: parseFloat(sum.qty) + parseFloat(item.OPT_QTY),
              percentage: parseFloat(sum.percentage) + parseFloat(item.OPT_PERCENT)
            };
          }, { qty: 0, percentage: 0 });

          if (sumOptQty.percentage > 100) {//This characteristics need to be modified
            aFilteredData.forEach(x => {
              if (parseFloat(sumOptQty.qty) > 0) {
                x.OPT_PERCENT = (parseFloat(x.OPT_QTY) / sumOptQty.qty) * 100;
              } else {
                x.OPT_PERCENT = 0.00;
              }
              if (x.OPT_PERCENT < 100) {
                x.OPT_PERCENT = x.OPT_PERCENT.toFixed(2)
              }
            })
            aTempData = aTempData.concat(aFilteredData);
          }
          else {
            aTempData = aTempData.concat(aFilteredData);
          }
        }
        else {
          aTempData.push(el);
        }
      }
    }
    aTempData = this.removeDuplicate(aTempData, lKeys);
    return aTempData;
  }
  /**
* returns CHAR_VALUE/CHARVAL_NUM based on Import/Export
* @param {ParamName} aData
*/
  static async mapCharValue(aData, flag) {
    let bMap = await this.getSystemConfig('MAP_CHARVALUE_CHARVALNUM');
    var sChar = aData.CHARVAL_NUM;
    if (bMap == 'Yes') {//proceed with mapping
      var sQuery = 'CHARVAL_NUM';
      if (flag == 'E') {//Exports, compare with CHAR_VALUE
        sQuery = 'CHAR_VALUE'
      }
      var liCharValues = await cds.run(`SELECT * FROM "CP_CHARVALUE_VALNUM" WHERE CLASS_NUM='${aData.CLASS_NUM}' AND CHAR_NUM='${aData.CHAR_NUM}' 
      AND ${sQuery} ='${aData.CHARVAL_NUM}'`);
      if (liCharValues.length == 0) {//IF  combination doesn't exists in CP_CHARVALUE_VALNUM, return original value
        return sChar;
      }
      if (flag == 'I') {//For Imports
        return sChar = liCharValues[0]?.CHAR_VALUE;
      }
      else {//for Exports
        return sChar = liCharValues[0]?.CHARVAL_NUM;
      }
    }
    else {
      return sChar;
    }
  }

  /**
   * Get Week Number by Week Date
   * @param {Week Date} lWeekDate
   * @returns
   */
  static getWeekNumber(lWeekDate) {
    // Get Week Number
    let lDate = new Date(lWeekDate);

    let lyearStart = new Date(lDate.getFullYear(), 0, 1);
    let ltoday = new Date(lDate.getFullYear(), lDate.getMonth(), lDate.getDate());
    let ldayOfYear = ((ltoday - lyearStart + 1) / 86400000);
    let lWeekNo = Math.ceil(ldayOfYear / 7);             //The Math.celi()


    // let lWeekNo = lDate.getWeek();
    if (lWeekNo < 10) {
      return `${lDate.getFullYear()}0${lWeekNo}`;
    } else {
      return `${lDate.getFullYear()}${lWeekNo}`;
    }
  }
  //This function returns Bearer token required for authorization
  static async getAuthorization() {
    try {
      const xsuaaService = xsenv.getServices({
        uaa: {
          name: 'configprodoauth' // Replace with the exact name of the desired service instance
        }
      });
      const clientId = xsuaaService.uaa.clientid;
      const clientSecret = xsuaaService.uaa.clientsecret;
      const tokenUrl = xsuaaService.uaa.url + '/oauth/token';
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);

      const response = await axios.post(tokenUrl, params);
      const accessToken = response.data.access_token;
      let authorization = "Bearer " +
        accessToken;
      return authorization;
    } catch (error) {
      console.log("Error obtaining access token:", error);
      return '';
    }
  }
  // This function is to remove special characters rejected By IBP  
  static async removeSpecialChar(lString) {
    lString = lString.replace(/([()'"<>])/mg, ' ');
    return lString;
  }
  //Function returns CPU usage metrics
  static async getCpuUsage() {
    const vcap = JSON.parse(process.env.VCAP_APPLICATION);
    function getCurrentInstanceMetrics() {
      const used = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      return {
        metrics: {
          memory: {
            used: Math.round(used.rss / 1024 / 1024), // MB
            total: process.env.MEMORY_LIMIT,
            usagePercentage: ((used.rss / (parseInt(process.env.MEMORY_LIMIT) * 1024 * 1024)) * 100).toFixed(2)
          },
          cpu: {
            usage: ((cpuUsage.user + cpuUsage.system) / 1000000).toFixed(2),
            usagePercentage: ((cpuUsage.user + cpuUsage.system) / 1000000 / 100).toFixed(2)
          }
        }
      };
    }
    const currentMetrics = getCurrentInstanceMetrics();
    const response = {
      applicationName: vcap.application_name,
      instances: currentMetrics,
    };
    return response;
  }

  //#region Alerts
  static async getAlertToken(req) {
    function getBaseUrl() {
      var tag = new RegExp('"application_uris"(.*)');
      const vcap_app = process.env.VCAP_APPLICATION;
      var uri = vcap_app.match(tag);
      if (uri) {
        var tag1 = new RegExp('"(.*)');
        uri = uri[1].match(tag1);
        let application_uris = "";
        for (let index = 0; index < uri[1].length; index++) {
          if (uri[1][index] != '"') {
            application_uris = application_uris + uri[1][index];
          }
          else {
            index = uri[1].length;
          }
        }

        return application_uris;

      }

    }
    var baseUrl = '', auth = '';
    try {
      let baseUrl1 = "https://" + getBaseUrl()
      baseUrl = baseUrl1.replace('vcplanner-mt', 'vcpalerts-mt');
      const credentials = JSON.parse(process.env.vcp_alerts);
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new Error("Authorization header not found");
      }
      const aToken = authHeader.replace("Bearer ", "");
      const jwtpayload = jwt.decode(aToken);
      const subdomain = jwtpayload?.ext_attr?.zdn;
      if (!subdomain) {
        throw new Error("Subdomain not found in JWT");
      }
      // const tokenUrl = `${credentials.url}/oauth/token`;
      const tokenUrl = `${credentials.url.replace("mttsbpdigital", subdomain)}/oauth/token`;
      
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', credentials.clientid);
      params.append('client_secret', credentials.clientsecret);

      const resp = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',

        }
      });

      const accessToken = resp.data.access_token;
      auth = "Bearer " + accessToken;
    } catch (error) {
      console.log('Error sending alert:', error.message);
    }
    return {
      baseUrl,
      auth
    }
  }
  static async sendAlert(flag, dataArray, req) {
    try {
      const { baseUrl, auth } = await this.getAlertToken(req);
      if (auth != '') {
        const userName = req.user.id
        const objArr = JSON.stringify(dataArray)
        const newBaseUrl = baseUrl + `/catalog/maintainAlertLogs`
        const response = await axios.post(newBaseUrl, {
          FLAG: flag,
          USERNAME: userName,
          OBJ: objArr
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
          }
        });
        return response.data.value;
      }

    } catch (error) {
      console.log('Error sending alert:', error.message);
    }
  }
  static async sendTimeseriesAlert(aData, req) {
    try{
    if (aData.length > 0) {
      //Get Unique ID description
      let aUnique = await cds.run(`SELECT DISTINCT UNIQUE_ID,UNIQUE_DESC FROM "CP_UNIQUE_ID_HEADER" WHERE  "UID_TYPE"='P'`);
      let oUnique = {};
      for (var u = 0; u < aUnique.length; u++) {
        oUnique[aUnique[u].UNIQUE_ID + "_1"] ??= '';
        oUnique[aUnique[u].UNIQUE_ID + "_1"] = aUnique[u].UNIQUE_DESC;
      }

      var aAlertData = [];
      //Alert if combination of PERIOD_NUM,PRODUCT_ID,GROUP_ID is less than  3
      const counts = aData.reduce((acc, obj) => {
        const key = `${obj.PERIOD_NUM}|${obj.PRODUCT_ID}|${obj.GROUP_ID}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const filtered = aData.filter(obj => {
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
        await this.sendAlert('C', result, req);
      }
    }
  }
  catch(ex){
    console.log(ex.message)
  }
  }
  //Below function is for IBP S&OP mapping
  static async mappingData(ENTITY_KEY, PLANNING_AREA, TABLE_NAME, aInput,) {
    let aData = [];
    let aMappingData = await cds.run(`SELECT * FROM "CP_BTP_MAPPING" WHERE "ENTITY_KEY"='${ENTITY_KEY}' AND "PLANNING_AREA" = '${PLANNING_AREA}' `);
    if (aMappingData && aMappingData.length > 0) {
      if (aInput.length > 0) {//Array manipulation
        let oMapping = {};
        for (var m = 0; m < aMappingData.length; m++) {
          let el = aMappingData[m];
          oMapping[el.BTP_FIELD] ??= '';
          oMapping[el.BTP_FIELD] = el.MAPPING_FIELD;
        }
        //Default
        let aDefault = aMappingData.filter(f => f.TYPE == 'D');
        let aCustomize = aMappingData.filter(f => f.TYPE == 'C');

        for (let i = 0; i < aInput.length; i++) {
          const entries = Object.entries(aInput[i]);
          const obj = {};

          for (let j = 0; j < entries.length; j++) {
            const [key, value] = entries[j];
            const mappedKey = oMapping[key];
            if (mappedKey) {
              obj[mappedKey] = value;
            }
          }
          if (aDefault.length > 0) {
            aDefault.map(d => {
              const rawValue = d.BTP_FIELD;
              // // // const numValue = Number(rawValue);

              // // // if (!Number.isNaN(numValue) && Number.isInteger(numValue)) {
              // // //   obj[d.MAPPING_FIELD] = numValue.toString();      // integer form
              // // // } else {
              // // //   obj[d.MAPPING_FIELD] = String(rawValue); // string form
              // // // }
              // // obj[d.MAPPING_FIELD] = rawValue.toString();
              // obj[d.MAPPING_FIELD] = rawValue != null ? rawValue.toString() : rawValue;

              if (obj[d.MAPPING_FIELD] !== null) {
                obj[d.MAPPING_FIELD] = d.DATA_TYPE == 'String' ? rawValue.toString() : d.DATA_TYPE == 'Integer' ? parseInt(rawValue) : parseFloat(rawValue);
              }
            });
          }
          if (aCustomize.length > 0) {
            aCustomize.forEach(d => {
              let aCustom = d.MAPPING_FIELD.split("_OPERATOR_");
              let sCombined = "";

              aCustom.forEach((c, index) => {
                let mappedField = oMapping[c];
                let fieldValue = "";
                if (mappedField && obj[mappedField] !== undefined) {
                  fieldValue = obj[mappedField];
                } else if (aInput[i][c] !== undefined) {
                  fieldValue = aInput[i][c];
                } else {
                  fieldValue = "";
                }
                sCombined += fieldValue;
                if (index !== aCustom.length - 1) sCombined += d.OPERATOR;
              });
              obj[d.BTP_FIELD] = sCombined;
            });
          }
          aData.push(obj);
        }
      }
    }
    return aData;
  }
  static async getParameterID() {
    let laPlandParamValues = await cds.run(`SELECT *
                    FROM CP_PARAMETER_VALUES
                    INNER JOIN CP_LOCATION
                    ON CP_LOCATION.LOCATION_ID = CP_PARAMETER_VALUES.LOCATION_ID
                    WHERE PARAMETER_ID IN(
                    (10))` );
    const keys = ['PARAMETER_ID'];

    if (laPlandParamValues.length > 0) {
      laPlandParamValues = this.removeDuplicate(laPlandParamValues, keys);

    }
    return laPlandParamValues;

  }
  static async getParameterPrefix() {
    let laPlandParamValues = await cds.run(`SELECT * 
                    FROM CP_PARAMETER_VALUES
                    INNER JOIN CP_LOCATION 
                    ON CP_LOCATION.LOCATION_ID = CP_PARAMETER_VALUES.LOCATION_ID
                    WHERE PARAMETER_ID IN(
                    (8))` );
    let keys = ['PARAMETER_ID'];

    if (laPlandParamValues.length > 0) {
      laPlandParamValues = this.removeDuplicate(laPlandParamValues, keys);

    }
    return laPlandParamValues;
  }


  //Generate PDF with password
  static async generatePasswordProtectedPDF(roles, roleDetails, password) {
    const PDFDocument = require('pdfkit');
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        userPassword: password,
        ownerPassword: password + '_owner',
        permissions: {
          printing: 'highResolution',
          modifying: false,
          copying: false
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);


      // Roles section
      if (roles && roles.length > 0) {
        doc.fontSize(16).text('Roles Header:', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12).text(JSON.stringify(roles, null, 2));
        doc.moveDown();
      }

      // Role Details section
      if (roleDetails && roleDetails.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Role Details:', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12).text(JSON.stringify(roleDetails, null, 2));
      }
      doc.end();
    });
  }
  static async extractPDF(pdfArray, password) {
    try {
      const unpdf = require('unpdf');

      const { getDocumentProxy, extractText } = unpdf;

      const pdfBytes = Uint8Array.from(pdfArray);
      const pdf = await getDocumentProxy(pdfBytes, { password });
      const { totalPages, text } = await extractText(pdf, { mergePages: true });

      return { totalPages, text };
    }
    catch {
      let pages = 0, text = '';
      return { pages, text };
    }

  }


  //#endregion
}

module.exports = GenFunctions;
