const JobSchedulerClient = require("@sap/jobs-client");
const xsenv = require("@sap/xsenv");
const { v1: uuidv1 } = require('uuid');

const request = require('request');
const rp = require('request-promise')
const lbaseUrl = "https://sbpmtt-dev-vcplanner-mt-srv.cfapps.us10-001.hana.ondemand.com";
const vcap_app = process.env.VCAP_APPLICATION;
const GenFunctions = require("./gen-functions");
const { getCFLogs } = require('./logs-functions');

var jobsSyncInProgress = false;
var syncIntervalId;
var periodicTimer = 60000;
var jobIdsRunStatus = [];

function getBaseUrl() {
  var tag = new RegExp('"application_uris"(.*)');
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

function getJobscheduler(req) {

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


function getModifiedreq(req, action, aData) {
  var request = '';
  switch (action) {
    //For functions which need only request
    case '/ibpimport-srv/exportIBPLocation':
    case '/ibpimport-srv/exportIBPCustomer':
    case '/ibpimport-srv/exportIBPMasterProd':
    case '/ibpimport-srv/exportIBPClass':
      case '/ibpimport-srv/exportIBPLocProd':
      request = req;
      request.data = {};
      if (action == '/ibpimport-srv/exportIBPClass') {
        const obj = {
          CLASS_NUM: "ALL"
        }
        request.data = obj;
      }
      break;
    case '/catalog/generateSeedOrders':
      request = req;
      if (aData) {
        const obj = {
          LOCATION_ID: aData.LOCATION_ID,
          PRODUCT_ID: aData.PRODUCT_ID,
          CUSTOMER_GROUP: aData.CUSTOMER_GROUP,
          FROMDATE: aData.FROM_DATE,
          TODATE: aData.TO_DATE,
          CHARDATA : '',
          CHAROPTFLAG:''
        }
        request.data = obj;
      }
      break;
      case '/sdi/ImportECCSalesh':
        request = req;
        if (aData) {
          const obj = {
            LOCATION_ID: aData.LOCATION_ID,
            PRODUCT_ID: aData.PRODUCT_ID,
            FROM_DATE:aData.FROM_DATE,
            TO_DATE: aData.TO_DATE
          }
          if (aData.FROM_DATE == "" || aData.TO_DATE == "") {
                obj.FROM_DATE = '9999-12-31';
                obj.TO_DATE =  '9999-12-31';
              }
          request.data = obj;
        }
        break;
    case '/pal/genPredictions':
      request = req;
      if (aData) {
        let aProducts = aData.PRODUCT_ID;
        var aList = [];
        if (Array.isArray(aProducts)) {
          if (aProducts.length > 0) {
            aProducts.forEach(el => {
              const obj = {
                GroupID: 'ALL',
                Location: aData.LOCATION_ID,
                Product: el,
                Type: '',
                version: '',
                scenario: '',
                modelVersion: '',
                override: false,
                impactAnalysis: false,
                Optimization:false,
                OptProfile:'',
                // OptAlgorithm: 'None',
                // OptFactor: 0.9,
                // DsAlgorithm: 'None'
              }
              if (aData.GEN_TYPE) {
                obj.Type = aData.GEN_TYPE;
              }
              if (aData.VERSION) {
                obj.version = aData.VERSION;
              }
              if (aData.SCENARIO) {
                obj.scenario = aData.SCENARIO;
              }
              if (aData.MODEL_VERSION) {
                obj.modelVersion = aData.MODEL_VERSION;
              }
              if (aData.OVERRIDE_ASSIGNMENT) {
                obj.override = aData.OVERRIDE_ASSIGNMENT;
              }
              if (aData.IMPACT_ANALYSIS) {
                obj.impactAnalysis = aData.IMPACT_ANALYSIS;
              }
              if (aData.Optimization) {
                obj.Optimization = aData.Optimization;
              }
              if (aData.POptProfile) {
                obj.OptProfile = aData.POptProfile;
              }
              // if (aData.OptAlgorithm) {
              //   obj.OptAlgorithm = aData.OptAlgorithm;
              // }
              // if (aData.OptFactor) {
              //   obj.OptFactor = aData.OptFactor;
              // }
              // if (aData.DsAlgorithm) {
              //   obj.DsAlgorithm = aData.DsAlgorithm;
              // }

              aList.push(obj);
            })
          }
        } else {
          const obj = {
            GroupID: 'ALL',
            Location: aData.LOCATION_ID,
            Product: aData.PRODUCT_ID,
            Type: '',
            version: '',
            scenario: '',
            modelVersion: '',
            override: false,
            impactAnalysis: false,
            Optimization:false,
            OptProfile:'',
            // OptAlgorithm: 'None',
            // OptFactor: 0.9,
            // DsAlgorithm: 'None'
          }
          if (aData.GEN_TYPE) {
            obj.Type = aData.GEN_TYPE;
          }
          if (aData.VERSION) {
            obj.version = aData.VERSION;
          }
          if (aData.SCENARIO) {
            obj.scenario = aData.SCENARIO;
          }
          if (aData.MODEL_VERSION) {
            obj.modelVersion = aData.MODEL_VERSION;
          }
          if (aData.OVERRIDE_ASSIGNMENT) {
            obj.override = aData.OVERRIDE_ASSIGNMENT;
          }
          if (aData.IMPACT_ANALYSIS) {
            obj.impactAnalysis = aData.IMPACT_ANALYSIS;
          }
          // if (aData.OptProfile) {
          //   obj.OptProfile = aData.OptProfile;
          // }
          if (aData.Optimization) {
            obj.Optimization = aData.Optimization;
          }
          if (aData.POptProfile) {
            obj.OptProfile = aData.POptProfile;
          }
          // if (aData.OptFactor) {
          //   obj.OptFactor = aData.OptFactor;
          // }
          // if (aData.DsAlgorithm) {
          //   obj.DsAlgorithm = aData.DsAlgorithm;
          // }
          aList.push(obj);
        }
      }
      request.data = {
        vcRulesList: aList
      };
    break;
    case '/pal/genOptimizations':
      request = req;
      if (aData) {
        let aProducts = aData.PRODUCT_ID;
        var aList = [];
        if (Array.isArray(aProducts)) {
          if (aProducts.length > 0) {
            aProducts.forEach(el => {
              const obj = {
                Location: aData.LOCATION_ID,
                Product: el,
                Type: '',
                version: '',
                scenario: '',
                modelVersion: '',
                Optimization:true,
                OptProfile:'',
                override: false,
                // OptAlgorithm: 'None',
                // OptFactor: 0.9
                startDate : '',
                endDate : ''
              }
              if (aData.GEN_TYPE) {
                obj.Type = aData.GEN_TYPE;
              }
              if (aData.VERSION) {
                obj.version = aData.VERSION;
              }
              if (aData.SCENARIO) {
                obj.scenario = aData.SCENARIO;
              }
              if (aData.MODEL_VERSION) {
                obj.modelVersion = aData.MODEL_VERSION;
              }
              if (aData.OptProfile) {
                obj.OptProfile = aData.OptProfile;
              }
              // if (aData.OptAlgorithm) {
              //   obj.OptAlgorithm = aData.OptAlgorithm;
              // }
              if (aData.OptFactor) {
                obj.OptFactor = aData.OptFactor;
              }

              if (aData.OVERRIDE_ASSIGNMENT) {
                obj.override = aData.OVERRIDE_ASSIGNMENT;
              }

              if (aData.FROM_DATE !== '') {
                obj.startDate = aData.FROM_DATE;
              }
              if (aData.TO_DATE !== '') {
                obj.endDate = aData.TO_DATE;
              }
              

              aList.push(obj);
            })
          }
        } else {
          const obj = {
            Location: aData.LOCATION_ID,
            Product: aData.PRODUCT_ID,
            Type: '',
            version: '',
            scenario: '',
            modelVersion: '',
            Optimization:true,
            OptProfile:'',
            override: false,
            // OptAlgorithm: 'None',
            // OptFactor: 0.9,
            startDate : '',
                endDate : ''
          }
          if (aData.GEN_TYPE) {
            obj.Type = aData.GEN_TYPE;
          }
          if (aData.VERSION) {
            obj.version = aData.VERSION;
          }
          if (aData.SCENARIO) {
            obj.scenario = aData.SCENARIO;
          }
          if (aData.MODEL_VERSION) {
            obj.modelVersion = aData.MODEL_VERSION;
          }
          if (aData.OptProfile) {
            obj.OptProfile = aData.OptProfile;
          }
          if (aData.OVERRIDE_ASSIGNMENT) {
            obj.override = aData.OVERRIDE_ASSIGNMENT;
          }
          // if (aData.OptAlgorithm) {
          //   obj.OptAlgorithm = aData.OptAlgorithm;
          // }
          // if (aData.OptFactor) {
          //   obj.OptFactor = aData.OptFactor;
          // }
          if (aData.FROM_DATE) {
            obj.startDate = aData.FROM_DATE;
          }
          if (aData.TO_DATE) {
            obj.endDate = aData.TO_DATE;
          }
          aList.push(obj);
        }
      }
      request.data = {
        optimizationsList: aList
      };
    break;
    case '/pal/generatePrpids':
      request = req;
      if (aData) {
        let aProducts = aData.PRODUCT_ID;
        var aList = [];
        if (Array.isArray(aProducts)) {
          if (aProducts.length > 0) {
            aProducts.forEach(el => {
              const obj = {
                Location: aData.LOCATION_ID,
                Product: el
              }
              aList.push(obj);
            })
          }
        } else {
          const obj = {
            Location: aData.LOCATION_ID,
            Product: aData.PRODUCT_ID
          }
          aList.push(obj);
        }
      }
      request.data = {
        vcRulesList: aList
      };
    break;
      case '/ibpimport-srv/exportIBPAssembly':
        request = req;
      if (aData) {
        const obj = {
          LOCATION_ID: aData.LOCATION_ID,
          PRODUCT_ID: aData.PRODUCT_ID
        }
        request.data = obj;
      }
      break;
    //For Functions which need LOCATION_ID as Input
    // case '/ibpimport-srv/exportIBPLocProd':
    // case '/ibpimport-srv/exportIBPAssembly':
    case '/ibpimport-srv/exportIBPAssemblyComp':
      request = req;
      if (aData) {
        const obj = {
          LOCATION_ID: aData.LOCATION_ID
        }
        request.data = obj;
      }
      break;
    //For Functions which require LocProdData
    case '/ibpimport-srv/exportIBPSalesTrans':
    case '/ibpimport-srv/exportIBPSeedOrdTrans':
    case '/ibpimport-srv/exportActCompDemand':
    case '/ibpimport-srv/exportComponentReq':
    case '/ibpimport-srv/exportIBPCIR':
    case '/catalog/generateTimeseriesF':
      case '/catalog/updateOptionQuantities':
    case '/catalog/genFullConfigDemand':
    case '/ibpimport-srv/generateFDemandQty':
    case '/ibpimport-srv/generateFDemandQty_VCPIBP':
    case '/catalog/generateTimeseries':
    case '/ibpimport-srv/generateDCFCharPlan':
    case '/catalog/generateTimeseriesCust':
      request = req;
      if (aData) {
        let aProducts = aData.PRODUCT_ID;
        var aList = [];
        if (Array.isArray(aProducts)) {
          if (aProducts.length > 0) {
            aProducts.forEach(el => {
              const obj = {
                LOCATION_ID: aData.LOCATION_ID,
                PRODUCT_ID: el,
              }
              if (aData.MODEL_VERSION) {
                obj.MODEL_VERSION = aData.MODEL_VERSION;
              }
              if (aData.VERSION) {
                obj.VERSION = aData.VERSION;
              }
              if (aData.SCENARIO) {
                obj.SCENARIO = aData.SCENARIO;
              }
              if (aData.FROM_DATE) {
                obj.FROMDATE = aData.FROM_DATE;
              }
              if (aData.TO_DATE) {
                obj.TODATE = aData.TO_DATE;
              }
              if (aData.CRITICAL_ASSEMBLY) {
                obj.CRITICALKEY = aData.CRITICAL_ASSEMBLY;
              }

              if (aData.DAILY) {
                if (aData.DAILY === true) {
                  obj.DAILY = 'X';
                } else {
                  obj.DAILY = '';
                }
              }
              if (action == '/catalog/generateTimeseriesCust') {
                obj.CUSTOMER_GROUP = aData.CUSTOMER_GROUP;
              }
              aList.push(obj);
            })
          }
        } else {
          const obj = {
            LOCATION_ID: aData.LOCATION_ID,
            PRODUCT_ID: aProducts
          }
          if (aData.MODEL_VERSION) {
            obj.MODEL_VERSION = aData.MODEL_VERSION;
          }
          if (aData.VERSION) {
            obj.VERSION = aData.VERSION;
          }
          if (aData.SCENARIO) {
            obj.SCENARIO = aData.SCENARIO;
          }
          if (aData.FROM_DATE) {
            obj.FROMDATE = aData.FROM_DATE;
          }
          if (aData.TO_DATE) {
            obj.TODATE = aData.TO_DATE;
          }
          // if (aData.CRITICAL_ASSEMBLY) {
          //   obj.CRITICALKEY = aData.CRITICAL_ASSEMBLY;
          // }
          if (aData.DAILY) {
            if (aData.DAILY === true) {
              obj.DAILY = 'X';
            } else {
              obj.DAILY = '';
            }
          }
          if (action == '/catalog/generateTimeseriesCust') {
            obj.CUSTOMER_GROUP = aData.CUSTOMER_GROUP;
          }
          aList.push(obj);
        }
        if (action == '/ibpimport-srv/exportComponentReq') {
          request.data = aList[0];//Single Product
          if (aData.Rolling === true) {
            let fromDate = new Date(),
              toDate = "",
              rolingTime = parseInt(aData.Rolling_Timestamp);
            toDate = new Date(new Date().getTime() + rolingTime * 7 * 24 * 60 * 60 * 1000);

            let padL = (nr, _len = 2, chr = `0`) => `${nr}`.padStart(2, chr);

            let StartDate =
              `${fromDate.getFullYear()}-${padL(fromDate.getMonth() + 1)}-${padL(fromDate.getDate())}`
            let EndDate =
              `${toDate.getFullYear()}-${padL(toDate.getMonth() + 1)}-${padL(toDate.getDate())}`
            request.data.FROMDATE = StartDate;
            request.data.TODATE = EndDate;

          }

        }
        else {
          request.data = {
            LocProdData: JSON.stringify(aList)
          };
        }

      }
      break;
case '/ibpimport-srv/exportRestrictionCapacity':
      request = req;
      if (aData) {
        const obj = {
          LOCATION_ID: aData.LOCATION_ID,
          // PRODUCT_ID: aData.PRODUCT_ID,
          // MODEL_VERSION: aData.MODEL_VERSION,
          // VERSION: aData.VERSION,
          // SCENARIO: aData.SCENARIO
        }
        request.data = {
            LocProdData: JSON.stringify(obj)
          };
      }
      break;
      case '/ibpimport-srv/exportComponentCoefficient':
      request = req;
      if (aData) {
        const obj = {
          LOCATION_ID: aData.LOCATION_ID,
          PRODUCT_ID: aData.PRODUCT_ID,
          MODEL_VERSION: aData.MODEL_VERSION,
          VERSION: aData.VERSION,
          SCENARIO: aData.SCENARIO
        }
        request.data = {
            LocProdData: JSON.stringify(obj)
          };
      }
      break;
      case '/ibpimport-srv/exportCapacityConsumption':
      request = req;
      if (aData) {
        const obj = {
          LOCATION_ID: aData.LOCATION_ID,
          PRODUCT_ID: aData.PRODUCT_ID,
          MODEL_VERSION: aData.MODEL_VERSION,
          VERSION: aData.VERSION,
          SCENARIO: aData.SCENARIO
        }
        request.data = {
            LocProdData: JSON.stringify(obj)
          };
      }
      break;

      case '/ibpimport-srv/exportIBPResourceLoc':
      request = req;
      if (aData) {
        const obj = {
          LOCATION_ID: aData.LOCATION_ID,
          // PRODUCT_ID: aData.PRODUCT_ID
        }
        request.data = {
            LocProdData: JSON.stringify(obj)
          };
      }
      break;

      case '/ibpimport-srv/exportIBPResource':
      request = req;
      if (aData) {
        const obj = {
          LOCATION_ID: aData.LOCATION_ID,
          // PRODUCT_ID: aData.PRODUCT_ID
        }
        request.data = {
            LocProdData: JSON.stringify(obj)
          };
      }
      break;

      case '/ibpimport-srv/exportIBPProductionResource':
      request = req;
      if (aData) {
        const obj = {
          LOCATION_ID: aData.LOCATION_ID,
          // PRODUCT_ID: aData.PRODUCT_ID
        }
       request.data = {
            LocProdData: JSON.stringify(obj)
          };
      }
      break;

    case '/catalog/genBOMUIDMapping':
      request = req;
      if (aData) {
        let fullrun = aData.FULL_RUN === true ? 'X' : '';
        let aProducts = aData.PRODUCT_ID;
        var aList = [];
        if (Array.isArray(aProducts)) {
          if (aProducts.length > 0) {
            aProducts.forEach(el => {
              const obj = {
                LOCATION_ID: aData.LOCATION_ID,
                PRODUCT_ID: el,
                FULL_RUN : fullrun
              }

              aList.push(obj);
            })
          }
        } else {
          const obj = {
            LOCATION_ID: aData.LOCATION_ID,
            PRODUCT_ID: aProducts,
            FULL_RUN : fullrun
          }
          aList.push(obj);
        }

        request.data = {
          LocProdData: JSON.stringify(aList)
        };
      }
      break;
    case '/catalog/initialProcess':
      request = req;
      if (aData) {
        // let aProducts = aData.PRODUCT_ID;
        var aList = [];
       
        if (Array.isArray(aData.LOCATION_ID) && Array.isArray(aData.PRODUCT_ID) ) {

        const obj = {
          LOCATION_ID: aData.LOCATION_ID,
          PRODUCT_ID: aData.PRODUCT_ID,
          HISTORY_WEEKS: aData.HISTORY_WEEKS
        }
        aList.push(obj);
      } else {
        var LocArray = [];
        var ProdArray = [];
          if(!Array.isArray(aData.LOCATION_ID)){
          let obj = {
            LOCATION_ID : aData.LOCATION_ID
          }        
          // LocArray.push(obj);
          LocArray = Object.values(obj);
        } else {
          LocArray = aData.LOCATION_ID;
        }

        if(!Array.isArray(aData.PRODUCT_ID)){
          let obj = {
            PRODUCT_ID : aData.PRODUCT_ID
          }        
          // ProdArray.push(obj);
          ProdArray = Object.values(obj);
        } else {
          ProdArray = aData.PRODUCT_ID;
        }

        const obj = {
          LOCATION_ID: LocArray,
          PRODUCT_ID: ProdArray,
          HISTORY_WEEKS: aData.HISTORY_WEEKS
        }
        aList.push(obj);
      }


        request.data = {
          LocProdWeeksData: JSON.stringify(aList)
        };
      }
      break;

      case '/catalog/maintainSnapShotjob':
      request = req;
      if (aData) {
        // let aProducts = aData.PRODUCT_ID;
        var aList = [];

        const obj = {
          SNAPSHOT_DESC: aData.SnapShot_Desc,
          Mode: aData.SnapShot,
          VERSION : aData.VERSION
        }
        aList.push(obj);


        request.data = {
          SnapData: JSON.stringify(aList)
        };
      }
      break;

    case '/catalog/deleteLocProdData':
      request = req;
      if (aData) {
        let aProducts = aData.PRODUCT_ID;
        var aList = [];
        if (Array.isArray(aProducts)) {
          if (aProducts.length > 0) {
            aProducts.forEach(el => {
              const obj = {
                LOCATION_ID: aData.LOCATION_ID,
                PRODUCT_ID: el,
              }
              if (aData.FROM_DATE) {
                obj.FROMDATE = aData.FROM_DATE;
              }
              if (aData.TO_DATE) {
                obj.TODATE = aData.TO_DATE;
              }
              if (aData.OPERATOR) {
                obj.OPERATOR = aData.OPERATOR;
              }
              if (aData.SINGLE_DATE) {
                obj.SINGLE_DATE = aData.SINGLE_DATE;
              }

              aList.push(obj);
            })
          }
        } else {
          const obj = {
            LOCATION_ID: aData.LOCATION_ID,
            PRODUCT_ID: aProducts
          }

          if (aData.FROM_DATE) {
            obj.FROMDATE = aData.FROM_DATE;
          }
          if (aData.TO_DATE) {
            obj.TODATE = aData.TO_DATE;
          }
          if (aData.OPERATOR) {
            obj.OPERATOR = aData.OPERATOR;
          }
          if (aData.SINGLE_DATE) {
            obj.SINGLE_DATE = aData.SINGLE_DATE;
          }
          aList.push(obj);
        }

        request.data = {
          LocProdDate: JSON.stringify(aList)
        };


      }
      break;
    case '/pal/generateModels':
    case '/pal/genFutureOptions':
      request = req;
      var aList = [];
      if (aData) {
        let aProducts = aData.PRODUCT_ID;
        if (Array.isArray(aProducts)) {
          if (aProducts.length > 0) {
            aProducts.forEach(el => {
              var obj = {
                Location: aData.LOCATION_ID,
                Product: el,
                override: aData.OVERRIDE_ASSIGNMENT,
                GroupID: 'ALL',
                Type: aData.GEN_TYPE,
                modelVersion: aData.MODEL_VERSION
              }
              if (action == '/pal/genFutureOptions') {
                // obj.Customer = 'ALL';
                obj.Customer = aData.CUSTOMER_GROUP;
                obj.Version = aData.VERSION;
                obj.Scenario = aData.SCENARIO;
                obj.profile = aData.FORECAST_ALGORITHM;
              }
              else{
                obj.profile =  aData.PREDICTION_PROFILE;
              }
              aList.push(obj);
            })
          }
        } else {
          var obj = {
            Location: aData.LOCATION_ID,
            Product: aProducts,
            override: aData.OVERRIDE_ASSIGNMENT,
            GroupID: 'ALL',
            Type: aData.GEN_TYPE,
            modelVersion: aData.MODEL_VERSION
          }
          if (action == '/pal/genFutureOptions') {
            // obj.Customer = 'ALL';
            obj.Customer = aData.CUSTOMER_GROUP;
            obj.Version = aData.VERSION;
            obj.Scenario = aData.SCENARIO;
            obj.profile = aData.FORECAST_ALGORITHM
          }
          else{
            obj.profile =  aData.PREDICTION_PROFILE;
          }
          aList.push(obj);
        }
        request.data = {
          vcRulesList: aList
        };
      }
      break;
    //For Functions which require both LOCATION_ID and PRODUCT_ID
    case '/catalog/generateAssemblyReq':
    case '/catalog/genUniqueID':
    case '/catalog/postCIRQuantitiesToS4':
      request = req;
      if (aData) {
        const obj = {
          LOCATION_ID: aData.LOCATION_ID,
          PRODUCT_ID: aData.PRODUCT_ID
        }
        if (aData.MODEL_VERSION) {
          obj.MODEL_VERSION = aData.MODEL_VERSION;
        }
        if (aData.VERSION) {
          obj.VERSION = aData.VERSION;
        }
        if (aData.SCENARIO) {
          obj.SCENARIO = aData.SCENARIO;
        }
        if (aData.FROM_DATE) {
          obj.FROMDATE = aData.FROM_DATE;
        }
        if (aData.TO_DATE) {
          obj.TODATE = aData.TO_DATE;
        }
        if (aData.VALIDUSER) {
          obj.VALIDUSER = aData.VALIDUSER;
        }
        if (aData.USER_ID) {
          obj.USER_ID = aData.USER_ID;
        }
        //For Publish Forecast Orders
        if (action == '/catalog/postCIRQuantitiesToS4') {
          obj.FORECAST_SNAPTIME = '';//Setting empty as parameter type declared as String
          obj.PLANNING_LOC = '';
          obj.LOCATION_ID = aData.MF_LOCATION_ID;
          if (aData.Rolling === true) {
            let fromDate = new Date(),
              toDate = "",
              rolingTime = parseInt(aData.Rolling_Timestamp);
            toDate = new Date(new Date().getTime() + rolingTime * 7 * 24 * 60 * 60 * 1000);

            let padL = (nr, _len = 2, chr = `0`) => `${nr}`.padStart(2, chr);

            let StartDate =
              `${fromDate.getFullYear()}-${padL(fromDate.getMonth() + 1)}-${padL(fromDate.getDate())}`
            let EndDate =
              `${toDate.getFullYear()}-${padL(toDate.getMonth() + 1)}-${padL(toDate.getDate())}`

            obj.FROMDATE = StartDate;
            obj.TODATE = EndDate;

          }
        }
        request.data = obj;
      }
      break;
      //To update jobs with timer 
      case '/jobs/syncJobs':
      request = req;
      request.data = {};
        const syncobj = {
          timer: (aData.TIMER)?aData.TIMER:0
        }
        request.data = syncobj;
       break;
    case '/catalog/generateOptionPercentage':
      request = req;
      request.data = {};
      let prodData = JSON.stringify(aData.PRODUCT_ID);
      var obj = {
        LOCATION_ID: aData.LOCATION_ID,
        PRODUCT_ID: prodData,
        FROM_DATE: aData.FROM_DATE,
        TO_DATE: aData.TO_DATE,
        VERSION : aData.VERSION,
        SCENARIO : aData.SCENARIO,
        MODEL_VERSION : aData.MODEL_VERSION
      }
      request.data = obj;
    break;
    default: //for Imports
      request = req;
      request.data = {};
      break;
  }
  return request;
}

async function _getJobRunStatus(req, _jobId, _scheduleId, _runId)
{
  let lreadJobScheduleUrl;
  let hostName = req.headers.host;
  let displayLogs = true;
  if (hostName.includes("localhost:4004")) {
    lreadJobScheduleUrl = lbaseUrl + '/jobs/readJobSchedule(jobId=' + _jobId + ',' + 'scheduleId=' + "'" + _scheduleId + "'" + "," + 'displayLogs=' + displayLogs + ')';
  }
  else {
    let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
    lreadJobScheduleUrl = baseUrl + '/jobs/readJobSchedule(jobId=' + _jobId + ',' + 'scheduleId=' + "'" + _scheduleId + "'" + "," + 'displayLogs=' + displayLogs + ')';
  }

  // console.log('lreadJobScheduleUrl ', lreadJobScheduleUrl);
  var auth = await GenFunctions.getAuthorization();
  options = {
    'method': 'GET',
    'url': lreadJobScheduleUrl,
    'headers': {
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
    'Authorization': auth
    },
      'timeout': 120000
  }
  let ret_schedlog_response = "";
  respAck = false;

  await rp(options)
    .then(function (response) {
    // console.log('readJobSchedule Response Time = ', Date.now());
    ret_schedlog_response = JSON.parse(response);
    respAck = true;
    })
    .catch(function (error) {
    console.log('readJobSchedules - Error ', error);
    ret_schedlog_response = JSON.parse(error);
    respAck = true;
    });
  // console.log("ret_schedlog_response  ", ret_schedlog_response);
  // console.log("ret_schedlog_response respAck ", respAck);
  if (respAck &&
    (ret_schedlog_response.value.logs != undefined)) 
  {
    // console.log("ret_schedlog_response logs ", ret_schedlog_response.value.logs);
    let runId = ret_schedlog_response.value.logs[0].runId;
    if (_runId == runId)
    {
      return ret_schedlog_response.value.logs[0].runStatus;
    }
    else
    {
      return 'NOT_FOUND';
    }    
  }
}

module.exports = async function (srv) {
  srv.on('syncJobsOneTime', async req => {
    return (await _syncJobsOneTime(req, false));
  }) 
  srv.on('syncJobs', async req => {
    return (await _syncJobs(req, false));
  })

  srv.on('updateJobs', async req => {
    return (await _updateJobs(req, false,false,0));
  })

  srv.on('fsyncJobsOneTime', async req => {
    return (await _syncJobsOneTime(req, true));
  })

  srv.on('fsyncJobs', async req => {
    return (await _syncJobs(req, true));
  })

  srv.on('fUpdateJobs', async req => {
    return (await _updateJobs(req, true,false,0));
  })
  srv.before('READ', 'getJobStatus', (req) => {
    console.log("get Job Status User Info", req.user);
  })

  srv.on('purgeJobLogs', async req => {
    return (await _purgeJobLogs(req, false));
  })

  srv.on('fpurgeJobLogs', async req => {
    return (await _purgeJobLogs(req, true));
  })

  srv.on('purgeJobLogsNew', async req => {
    let purgeData = (await _purgeJobLogs(req, false));

    let DateTime = new Date(new Date().setDate(new Date().getDate() - 15));

    let padL = (nr, _len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
    let endDate =
      `${DateTime.getFullYear()}-${padL(DateTime.getMonth() + 1)}-${padL(DateTime.getDate())} ${padL(DateTime.getHours())}:${padL(DateTime.getMinutes())}:${padL(DateTime.getSeconds())}`

    //Delete from Error logs table
    await cds.run(`DELETE FROM "CP_ERROR_LOGS" WHERE LOG_TIME<'${endDate}'`);

      let liData = await cds.run(
      `SELECT JOB_ID, SEQUENCE_ID, JOB_ENDTIME FROM "JS_JOB_TEMPLATEDETAILS"
                WHERE "JOB_ENDTIME" < '` + endDate + `'
                ORDER BY 
                "JOB_ID" ASC`
    );
    if (liData.length > 0) {
      for (let index = 0; index < liData.length; index++) {
        let jobId = liData[index].JOB_ID;
        let Seq = liData[index].SEQUENCE_ID;
        let success = "";
        try {
          await cds.run(
            `DELETE FROM "JS_JOB_TEMPLATEDETAILS" 
                WHERE "JOB_ID" = '${jobId}'
                `);
          success = "";

        } catch (e) {
          await GenFunctions.jobSchMessage('', `Purge unsuccessful for Job Overview Table.Reason: ${e.message}`, '');
        }
        if (success === "") {
          try {
            await cds.run(
              `DELETE FROM "JS_JOB_CREATIONDATA" 
                  WHERE "SEQUENCE_ID" = '${Seq}'
                  `);
              await GenFunctions.jobSchMessage('', "Purge of sequence data successfull", '');
          } catch (e) {
            await GenFunctions.jobSchMessage('', `Purge unsuccessful for Job Creation Table.Reason: ${e.message}`, '');
          }
        }

        
      }
    }

    // Delete configuration chnage logs.
    let ChangeDate = new Date(new Date().setDate(new Date().getDate() - 60)).toISOString().split('T')[0];

    try {
          await cds.run(
            `DELETE FROM "CP_CONFIGURATION_CHANGE_LOGS" 
                WHERE "CHANGED_DATE" < '${ChangeDate}'
                `);
          success = "";
          await GenFunctions.jobSchMessage('', "successfully purged configuration logs", '');

        } catch (e) {
          await GenFunctions.jobSchMessage('', `Purge configuration logs unsuccessful.Reason: ${e.message}`, '');
        }


  })

  async function _purgeJobLogs(req, isGet) {
    console.log('_purgeJobLogs Job IDs Request Time = ', new Date().toJSON());


    let createtAt = new Date();
    let id = uuidv1();
    let values = [];

    let message = "Request for Purge Job Logs Older than " + '15' + " Days Queued Sucessfully";

    values.push({ id, createtAt, message });


    let purgeJobsListSql =
      'SELECT DISTINCT JOB_ID FROM JS_JOBS ' +
      ' INNER JOIN JS_SCHEDULES AS JS ON ' +
      ' JS_JOBS.SCHEDULE_ID NOT IN (SELECT DISTINCT SCHEDULE_ID FROM JS_SCHEDULES) ' +
      ' AND ((JS.SCH_TYPE = ' + "'" + 'one-time' + "'" + ')' + ' OR (JS.SCH_END_TIME < CURRENT_DATE))' +
      ' AND DAYS_BETWEEN(TO_TIMESTAMP(JS_JOBS.CREATAT, ' + "'" + 'YYYY-MM-DD HH24:MI:SS' + "')," + ' CURRENT_DATE) > 15 ' +
      ' ORDER BY JOB_ID ASC';
    console.log("purgeJobsListSql ", purgeJobsListSql);

    let purgeJobsList;
    try {
      purgeJobsList = await cds.run(purgeJobsListSql);
    }
    catch (exception) {
      console.log("sqlStr exception ", purgeJobsListSql);
      throw new Error(exception.toString());
    }

    console.log(" purgeJobsList ", purgeJobsList);
    let purgeError = false;

    if (purgeJobsList.length == 0) {
      let createtAt = new Date();
      let id = uuidv1();
      let values = [];

      let message = "No New Jobs to Purge - Request Completed";

      values.push({ id, createtAt, message });

      if (isGet == true) {
        req.reply({ values });
      }
      else {
        let res = req._.req.res;
        res.statusCode = 202;
        res.send({ values });
      }
    }
    else {
      await _updateJobs(req, isGet,false,0);

      let hostName = req.headers.host;

      for (let purgeIdx = 0; purgeIdx < purgeJobsList.length; purgeIdx++) {
        let deleteJobUrl;
        if (hostName.includes("localhost:4004")) {
          deleteJobUrl = lbaseUrl + '/jobs/deleteJob'; //(jobId=' + purgeJobsList[purgeIdx].JOB_ID + ')';
        }
        else {
          let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
          deleteJobUrl = baseUrl + '/jobs/deleteJob'; //(jobId=' + purgeJobsList[purgeIdx].JOB_ID + ')';
        }
        var auth = await GenFunctions.getAuthorization();
        options = {
          'method': 'POST',
          'url': deleteJobUrl,
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': auth
          },
          'timeout': 5000,
          body: JSON.stringify({ "jobId": purgeJobsList[purgeIdx].JOB_ID })
        }
        await rp(options)
          .then(function (response) {
            // console.log('PurgeJob Response Time = ', new Date().toJSON());
            ret_response = JSON.parse(response);
          })
          .catch(function (err) {
            console.log('PurgeJob - Error ', err);
            // ret_response =  JSON.parse(err);
            // purgeError = true;

          });
      }


      try {
        purgeJobsListSql = 'DELETE FROM JS_JOBS WHERE JOB_ID IN (' + purgeJobsListSql + ')';
        console.log("purgeJobsListSql ", purgeJobsListSql);
        await cds.run(purgeJobsListSql);
      }
      catch (exception) {
        purgeError = true;
        console.log("_purgeJobLogs  purgeJobsListSql ", purgeJobsListSql);
        throw new Error(exception.toString());
      }
    }

    let dataObj = {};

    if (purgeError == false) {
      dataObj["success"] = true;
      dataObj["message"] = "Purge Job Logs Completed Successfully";
    }
    else {
      dataObj["success"] = false;
      dataObj["message"] = "Purge Job Logs Errored";
    }

    if (req.headers['x-sap-job-id'] > 0) {
      const scheduler = getJobscheduler(req);

      var updateReq = {
        jobId: req.headers['x-sap-job-id'],
        scheduleId: req.headers['x-sap-job-schedule-id'],
        runId: req.headers['x-sap-job-run-id'],
        data: dataObj
      };

      scheduler.updateJobRunLog(updateReq, function (err, result) {
        if (err) {
          return console.log('Error updating run log: %s', err);
        }
      });
    }
    console.log('_purgeJobLogs Job IDs Completed Time = ', new Date().toJSON());


  }

  async function _syncJobsOneTime(req, isGet) {
       
    let createdAt = new Date();
    
    let id = uuidv1();
    let values = [];	
    let message = "Request for _syncJobsoneTime Queued Sucessfully";

    values.push({id, createdAt, message});    


    if (isGet == true)
    {
        req.reply({values});
    }
    else
    {
        let res = req._.req.res;
        res.statusCode = 202;
        res.send({values});
    }

    if( jobsSyncInProgress == false)
    {
      let syncCount = 0;
      await syncJobsDataOneTime();
      async function syncJobsDataOneTime() {    

        if(jobsSyncInProgress == false) 
        {     
          if (req.headers['x-sap-job-id'] > 0) {
             console.log("jobId = ", req.headers['x-sap-job-id'], "syncCount ", syncCount);
          }
          else
          {
            console.log("syncCount ", syncCount);
          }
          clearInterval(syncIntervalId);

          syncCount = syncCount + 1;
          console.log("syncJobsDataOneTime Start time ", new Date(),"syncCount ", syncCount);
          jobsSyncInProgress = true;
          await _updateJobs(req,false,true,syncCount);
          syncIntervalId = setInterval(syncJobsDataOneTime, 100); 
          console.log("syncJobsDataOneTime Sync Interval Set time ", new Date(),"syncCount ", syncCount);
          jobsSyncInProgress = false;       

          if (syncCount >= 2 )
          {

            console.log("_syncJobsOneTime syncCount Clearing Interval at ", syncCount, "jobsSyncInProgress ", jobsSyncInProgress);
            console.log("syncJobsDataOneTime completed time ", new Date());
            clearInterval(syncIntervalId);
          }
        }       
      }    
    }    
  }

  async function _syncJobs(req, isGet) {
    var synJobsReq = {};
    if (isGet == true) //GET -- Kludge
    {
        synJobsReq = JSON.parse(req.data.timer);
    }
    else
    {
        synJobsReq = req.data.timer;
    }
    
    periodicTimer = req.data.timer;

    let createdAt = new Date();
    
    let id = uuidv1();
    let values = [];	
    let message = "Request for _syncJobs Queued Sucessfully";

    values.push({id, createdAt, message, synJobsReq});    


    if (isGet == true)
    {
        req.reply({values});
    }
    else
    {
        let res = req._.req.res;
        res.statusCode = 202;
        res.send({values});
    }

    if( jobsSyncInProgress == false)
    {
      let syncCount = 0;
      await syncJobsData();
      async function syncJobsData() {        

        if(jobsSyncInProgress == false) 
        {     
          if (req.headers['x-sap-job-id'] > 0) {
             console.log("jobId = ", req.headers['x-sap-job-id'], "syncCount ", syncCount);
          }
          else
          {
            console.log("syncCount ", syncCount);
          }
          clearInterval(syncIntervalId);

          jobsSyncInProgress = true;
          console.log("syncJobsData Start time ", new Date(), "INPUT TIMER ", periodicTimer);
          await _updateJobs(req,false,true,0);
          syncCount ++;
          console.log("syncJobsData completed time ", new Date());
          jobsSyncInProgress = false;
          console.log("periodicTimer ", periodicTimer, "syncCount", syncCount);  
          if(( periodicTimer != 0) || 
             ((periodicTimer==0) && (syncCount < 2)))
          {
            syncIntervalId = setInterval(syncJobsData, periodicTimer);  
          }

        }
        if ((periodicTimer == 0) &&
            (syncCount == 1 ))
        {
          console.log('JS_LOGS SYNC Response Time = ', new Date().toJSON());

          // console.log("jobScheduleLogs ", jobScheduleLogs);

          let dataObj = {};
          dataObj["success"] = true;
          dataObj["message"] = "Sync Job Logs Completed Successfully";

          if (req.headers['x-sap-job-id'] > 0) {
            const scheduler = getJobscheduler(req);

            var updateReq = {
              jobId: req.headers['x-sap-job-id'],
              scheduleId: req.headers['x-sap-job-schedule-id'],
              runId: req.headers['x-sap-job-run-id'],
              data: dataObj
            };

            scheduler.updateJobRunLog(updateReq, function (err, result) {
              if (err) {
                return console.log('Error updating run log: %s', err);
              }

            });
          }
        }
        else if( (periodicTimer == 0) &&
            (syncCount > 1))
        {
          console.log("syncJobsData Clearing intervalId periodicTimer ", periodicTimer);  
          clearInterval(syncIntervalId);
        }
                      
      }    
    }
    
  }

  async function _updateJobs(req, isGet,syncRequest,syncCount) {

    var reqData = "Request for Update Delta Job Logs Queued Sucessfully";

    console.log("_updateDeltaJobs reqData : ", reqData);
    let createtAt = new Date();
    let id = uuidv1();
    let values = [];

    values.push({ id, createtAt, reqData });

    if(syncRequest == false)
    {
      if (isGet == true) {
        req.reply({ values });
      }
      else {
        let res = req._.req.res;
        res.statusCode = 202;
        res.send({ values });
      }
    }

    let readJobsUrl;
    let hostName = req.headers.host;

    if (hostName.includes("localhost:4004")) {
      readJobsUrl = lbaseUrl + '/jobs/readJobs()';
    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
      readJobsUrl = baseUrl + '/jobs/readJobs()';
    }

    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': readJobsUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 120000
    }

    let ret_response = "";

    console.log('Readjobs Request Time = ', new Date().toJSON());
    await rp(options)
      .then(function (response) {
        console.log('Readjobs Response Time = ', new Date().toJSON());
        // console.log('Response   = ', response);
        ret_response = JSON.parse(response);
      })
      .catch(function (error) {
        console.log('readJobs - Error ', error);
        ret_response = JSON.parse(error);
      });

    console.log('length of ret_response.value ', ret_response.value.length);
    let updateJobsList = [];
    for (let jobIndex = 0; jobIndex < ret_response.value.length; jobIndex++) {
      let jobId = ret_response.value[jobIndex].jobId;
      let startTime = ret_response.value[jobIndex].startTime;
      let endTime = ret_response.value[jobIndex].endTime;
      let active = ret_response.value[jobIndex].active;
      let name = ret_response.value[jobIndex].name;
      let signatureVersion = ret_response.value[jobIndex].signatureVersion;
      let activeCount = ret_response.value[jobIndex].ACTIVECOUNT;
      let inactiveCount = ret_response.value[jobIndex].INACTIVECOUNT;

      // let schedules = ret_response.value[jobIndex].schedules;
      let updateRequired = true;
      let reconciled = false;
      let updateJobRow = {
        JOB_ID: jobId, JOB_NAME: name, START_TIME: startTime, END_TIME: endTime,
        ACTIVE: active, SIG_VERSION: signatureVersion,
        ACTIVE_COUNT: activeCount, INACTIVE_COUNT: inactiveCount,
        UPDATE_REQUIRED: updateRequired,
        RECONCILED: reconciled
      };
      updateJobsList.push(updateJobRow);
      // console.log(" ret_response.value[ ", jobIndex, "] = ",  ret_response.value[jobIndex]);
    }

    // console.log("Jobs List in Server ", updateJobsList);

    // let existingJobsSql =
    //   ' SELECT DISTINCT JOB_ID, ACTIVE, ACTIVECOUNT, INACTIVECOUNT FROM JS_JOBS ' +
    //   ' ORDER BY JOB_ID DESC';


    let existingJobsSql =
              ' SELECT DISTINCT JOB_ID, ACTIVE, ACTIVECOUNT, INACTIVECOUNT, SCHEDULE_ID, SCH_TYPE, RUN_ID, RUN_STATUS, RUN_STATE FROM V_JOBSTATUS ' +
               'ORDER BY JOB_ID DESC';
    console.log("existingJobsSql ", existingJobsSql);

    let existingJobsList = [];

    try {
      existingJobsList = await cds.run(existingJobsSql);
    }
    catch (exception) {
      console.log("existingJobsSql exception ", existingJobsSql);
      throw new Error(exception.toString());
    }

    // console.log("existingJobs  ", existingJobsList);

    // console.log("existingJobs length ", existingJobsList.length);

    // DELTA JOBS UPDATE

    if (existingJobsList.length > 0) {

      let deleteJobsList = [];
      let deleteRequired = true;
      for (let jobIndex = 0; jobIndex < existingJobsList.length; jobIndex++) {
        let jobId = existingJobsList[jobIndex].JOB_ID;
        let deleteJobRow = {
          JOB_ID: jobId, ACTIVE: existingJobsList[jobIndex].ACTIVE,
          ACTIVECOUNT: existingJobsList[jobIndex].ACTIVECOUNT,
          INACTIVECOUNT: existingJobsList[jobIndex].INACTIVECOUNT,
          DELETE_REQUIRED: deleteRequired
        };
        deleteJobsList.push(deleteJobRow);
      }

      let jobIdRunStatusSql =
            ' SELECT DISTINCT JOB_ID, SCHEDULE_ID, RUN_ID, SCH_TYPE, RUN_STATUS, RUN_STATE, ACTIVECOUNT, INACTIVECOUNT FROM V_JOBSTATUS ' +
                      ' WHERE RUN_STATUS != ' + "'" + 'Completed' + "'" + 
                      ' AND RUN_STATE != ' + "'" + 'Success' + "'" + ' ORDER BY JOB_ID DESC ';
      console.log("jobIdRunStatusSql ", jobIdRunStatusSql);
      let jobIdRunStatus;

      try {
        jobIdRunStatus = await cds.run(jobIdRunStatusSql);
      }
      catch (exception) {
        console.log("jobIdRunStatusSql exception ", jobIdRunStatusSql);
        throw new Error(exception.toString());
      }
   
      if (jobIdRunStatus.length > 0 )
      {
        for (let jobIndex = 0; jobIndex < updateJobsList.length; jobIndex++) 
        {
          let jobId = updateJobsList[jobIndex].JOB_ID; 
          let active = updateJobsList[jobIndex].ACTIVE; 
          let activeCount = updateJobsList[jobIndex].ACTIVE_COUNT;
          let inactiveCount = updateJobsList[jobIndex].INACTIVE_COUNT;
          // let reconciled = false;
          let totalCount = activeCount + inactiveCount;
          let updateJobIdTime =  new Date(updateJobsList[jobIndex].END_TIME);
          let currentTime = new Date();
          if (updateJobIdTime < currentTime) 
          {
            updateJobsList[jobIndex].UPDATE_REQUIRED = false;
          }
          else
          {
            let existingTotalCount = 0;
            let updateRequiredCount = 0;
            for (let eIndex = 0; eIndex < jobIdRunStatus.length; eIndex++) 
            {         
              if (jobId == jobIdRunStatus[eIndex].JOB_ID)
              {
                updateJobsList[jobIndex].RECONCILED = true;
                let scheduleId = jobIdRunStatus[eIndex].SCHEDULE_ID;
                let runId = jobIdRunStatus[eIndex].RUN_ID;
                let sch_type = jobIdRunStatus[eIndex].SCH_TYPE;
                let run_status = jobIdRunStatus[eIndex].RUN_STATUS;
                let run_state = jobIdRunStatus[eIndex].RUN_STATE;
                existingTotalCount = jobIdRunStatus[eIndex].ACTIVECOUNT + jobIdRunStatus[eIndex].INACTIVECOUNT;
              
                if (totalCount != existingTotalCount)
                {
                  updateJobsList[jobIndex].UPDATE_REQUIRED = true;
                  // if (jobId == 2004880)
                  // {
                  //   console.log("totalCount jobId ", jobId, "run_status", run_status);
                  //   console.log("totalCount jobId ", jobId, "activeCount", activeCount, "inactiveCount", inactiveCount,"j_activeCount", jobIdRunStatus[eIndex].ACTIVECOUNT, "j_inactiveCount", jobIdRunStatus[eIndex].INACTIVECOUNT );

                  // }
                  break;
                }
                else
                {
                  if( (sch_type == 'one-time') )
                  { 
                    // if (jobId == 2004880)
                    // {
                    //   console.log("jobId ", jobId, "run_status", run_status);
                    //   console.log("jobId ", jobId, "activeCount", activeCount, "inactiveCount", inactiveCount,"j_activeCount", jobIdRunStatus[eIndex].ACTIVECOUNT, "j_inactiveCount", jobIdRunStatus[eIndex].INACTIVECOUNT );

                    // }

                    if( run_status.toUpperCase() == 'RUNNING' )
                    {
                      let runStatus = await _getJobRunStatus(req, jobId, scheduleId, runId);
                      // DO not update until Run State Changes
                      console.log("jobId = ",jobId, "runStatus ", runStatus, "run_status", run_status.toUpperCase(), "ScheduleId", scheduleId, "runId ", runId);
                      if (runStatus == run_status.toUpperCase())                           
                      {
                        updateJobsList[jobIndex].UPDATE_REQUIRED = false;
                      }
                    }
                    else if ( run_status == 'Completed' )
                    {
                      updateJobsList[jobIndex].UPDATE_REQUIRED = false;
                    }
                  }
                  else if(sch_type == 'recurring')
                  {
                    if(!((run_status != 'Completed') && 
                        (run_state != 'Success') &&
                        (jobIdRunStatus[eIndex].ACTIVECOUNT != activeCount) &&
                        (jobIdRunStatus[eIndex].INACTIVECOUNT != inactiveCount)) )

                    {
                      // updateRequiredCount ++;
                      // updateJobsList[jobIndex].UPDATE_REQUIRED = false;
                      if( run_status.toUpperCase() == 'RUNNING' )
                      {
                        let runStatus = await _getJobRunStatus(req, jobId, scheduleId, runId);
                        // DO not update until Run State Changes
                        console.log("jobId = ",jobId, "runStatus ", runStatus, "run_status", run_status.toUpperCase(), "ScheduleId", scheduleId, "runId ", runId);
                        if (runStatus == run_status.toUpperCase())
                        {
                          updateJobsList[jobIndex].UPDATE_REQUIRED = false;
                        }
                      }
                      else if ( (run_status == 'Completed' ) ||
                                (run_status == 'Scheduled') )
                      {
                        updateJobsList[jobIndex].UPDATE_REQUIRED = false;
                      }

                    }
                  
                  }
                  else if(activeCount == 0)
                  {
                    updateJobsList[jobIndex].UPDATE_REQUIRED = false;
                    
                  }
                }
                
              }
            
            }
   
          }
        
        }
      }

      // console.log("After 1st Reconcilation updateJobsList ", updateJobsList );
      // for (let eIndex = 0; eIndex < existingJobsList.length; eIndex++) {
      //   for (let jobIndex = 0; jobIndex < updateJobsList.length; jobIndex++) {
      //     let jobId = updateJobsList[jobIndex].JOB_ID;
      //     let startTime = updateJobsList[jobIndex].START_TIME;
      //     let endTime = updateJobsList[jobIndex].END_TIME;
      //     let jobName = updateJobsList[jobIndex].JOB_NAME;
      //     let active = updateJobsList[jobIndex].ACTIVE;
      //     let activeCount = updateJobsList[jobIndex].ACTIVE_COUNT;
      //     let inactiveCount = updateJobsList[jobIndex].INACTIVE_COUNT;
      //     let sigVersion = updateJobsList[jobIndex].SIG_VERSION;
      //     let schActive = false;
      //     if (jobId == existingJobsList[eIndex].JOB_ID) {
            
      //       let isOneTimeJobSql = ' SELECT DISTINCT JS_JOBS.JOB_ID FROM JS_JOBS ' +
      //                             ' INNER JOIN JS_SCHEDULES AS JS ON ' +
      //                             ' JS_JOBS.SCHEDULE_ID = JS.SCHEDULE_ID  ' +
      //                             ' INNER JOIN JS_LOGS AS JSL ON ' +
      //                             ' JS.RUN_ID = JSL.RUN_ID ' +
      //                             ' AND (JS.SCH_TYPE = ' + "'" + 'one-time' + "'"  +
      //                             ' AND  (JSL.RUN_STATUS != ' + "'" + 'COMPLETED' + "'" + 
      //                             ' AND   JSL.RUN_STATE != ' + "'" + 'SUCCESS' + "'" + ')' + 
      //                             ' OR  (JS_JOBS.ACTIVECOUNT != ' + "'" + activeCount + "'" +
      //                             ' OR    JS_JOBS.INACTIVECOUNT != ' + "'" + inactiveCount + "'" + ')' + ')' + 
      //                             ' OR ( JSL.RUN_STATUS != ' + "'" + 'COMPLETED' + "'" + 
      //                             ' AND JSL.RUN_STATE != ' + "'" + 'SUCCESS' + "'" +
      //                             ' AND JS.SCH_TYPE = ' + "'" + 'recurring' + "'"  + 
      //                             ' AND JS_JOBS.ACTIVECOUNT != ' + "'" + activeCount + "'" +
      //                             ' AND JS_JOBS.INACTIVECOUNT != ' + "'" + inactiveCount + "'" + ')' +
      //                             ' WHERE JS_JOBS.JOB_ID = ' + "'" + jobId + "'";
      //         // console.log("isOneTimeJobSql ", isOneTimeJobSql);
      //       let isOneTimeJob = [];
      //       try {
      //         isOneTimeJob = await cds.run(isOneTimeJobSql);
      //       }
      //       catch (exception) {
      //         console.log("isOneTimeJobSql ", isOneTimeJobSql);
      //         throw new Error(exception.toString());
      //       }
      //       // if( (jobId == 1972333) || (jobId == 1993951) || (jobId == 1997185))
      //       // {
      //       //   console.log("jobID ", jobId, "isOneTimeJobSql ", isOneTimeJobSql);
      //       // }
      //       if (isOneTimeJob.length == 0) {
      //         // console.log("isOneTimeJobSql ", isOneTimeJobSql);
      //         // console.log(" jobId ", jobId, "isOneTimeJob.length", isOneTimeJob.length)

      //         updateJobsList[jobIndex].UPDATE_REQUIRED = false;
      //       }
      //       break;
      //     }
      //   }
      // }

      // // DELETE JOBS NOT IN SAP JOB SCHEDULER
      // for (let eIndex = 0; eIndex < updateJobsList.length; eIndex++) {
      //   for (let jobIndex = 0; jobIndex < deleteJobsList.length; jobIndex++) {
      //     let jobId = deleteJobsList[jobIndex].JOB_ID;

      //     if (jobId == updateJobsList[eIndex].JOB_ID) {
      //       deleteJobsList[jobIndex].DELETE_REQUIRED = false;
      //     }
      //   }
      // }


      // // DELETE EXisting records not in SAP Job Scheduler
      // for (let jobIndex = 0; jobIndex < deleteJobsList.length; jobIndex++) {
      //   if (deleteJobsList[jobIndex].DELETE_REQUIRED === true) {
      //     let jobId = deleteJobsList[jobIndex].JOB_ID;

      //     let delSqlStr = ' DELETE FROM JS_LOGS WHERE RUN_ID IN ' + '(' +
      //       ' SELECT DISTINCT RUN_ID FROM JS_SCHEDULES WHERE SCHEDULE_ID IN ' + '(' +
      //       ' SELECT DISTINCT SCHEDULE_ID FROM JS_JOBS WHERE JOB_ID = ' + "'" + jobId + "'" + ')' + ')';
      //     // console.log(" delSqlStr ", delSqlStr);

      //     try {
      //       await cds.run(delSqlStr);
      //     }
      //     catch (exception) {
      //       console.log("sqlStr exception ", delSqlStr);
      //       throw new Error(exception.toString());
      //     }

      //     delSqlStr = ' DELETE FROM JS_SCHEDULES WHERE SCHEDULE_ID IN ' + '(' +
      //       ' SELECT DISTINCT SCHEDULE_ID FROM JS_JOBS WHERE JOB_ID = ' + "'" + jobId + "'" + ')';
      //     // console.log(" delSqlStr ", delSqlStr);

      //     try {
      //       await cds.run(delSqlStr);
      //     }
      //     catch (exception) {
      //       console.log("sqlStr exception ", delSqlStr);
      //       throw new Error(exception.toString());
      //     }

      //     delSqlStr = 'DELETE FROM JS_JOBS WHERE JOB_ID = ' + "'" + jobId + "'";
      //     try {
      //       await cds.run(delSqlStr);
      //     }
      //     catch (exception) {
      //       console.log("sqlStr exception ", delSqlStr);
      //       throw new Error(exception.toString());
      //     }
      //   }
      // }
    }

    let existingJobIdsSql =
      ' SELECT DISTINCT JOB_ID, ACTIVE, ACTIVECOUNT, INACTIVECOUNT, SCHEDULE_ID FROM JS_JOBS ' +
      ' ORDER BY JOB_ID DESC';


    // console.log("existingJobIdsSql ", existingJobIdsSql);

    let existingJobIdsList = [];

    try {
      existingJobIdsList = await cds.run(existingJobsSql);
    }
    catch (exception) {
      console.log("existingJobsSql exception ", existingJobIdsSql);
      throw new Error(exception.toString());
    }

    // console.log("existingJobIdsList  ", existingJobIdsList);

    if (existingJobIdsList.length > 0) {

      let deleteJobsList = [];
      let deleteRequired = true;
      for (let jobIndex = 0; jobIndex < existingJobIdsList.length; jobIndex++) {
        let jobId = existingJobIdsList[jobIndex].JOB_ID;
        let deleteJobRow = {
          JOB_ID: jobId, ACTIVE: existingJobIdsList[jobIndex].ACTIVE,
          ACTIVECOUNT: existingJobIdsList[jobIndex].ACTIVECOUNT,
          INACTIVECOUNT: existingJobIdsList[jobIndex].INACTIVECOUNT,
          DELETE_REQUIRED: deleteRequired
        };
        deleteJobsList.push(deleteJobRow);
      }

      // console.log("Before 2nd Reconcilation updateJobsList ", updateJobsList );

      for (let jobIndex = 0; jobIndex < updateJobsList.length; jobIndex++) 
      {
        let jobId = updateJobsList[jobIndex].JOB_ID; 
        // let active = updateJobsList[jobIndex].ACTIVE; 
        let activeCount = updateJobsList[jobIndex].ACTIVE_COUNT;
        let inactiveCount = updateJobsList[jobIndex].INACTIVE_COUNT;
        let updateJobIdTime =  new Date(updateJobsList[jobIndex].END_TIME);
        if ( (updateJobsList[jobIndex].UPDATE_REQUIRED == true ) &&
            (updateJobsList[jobIndex].RECONCILED == false) )
        {
          let currentTime = new Date();
          // if(jobId = 1960143)
          // {
          //   console.log("2nd Reconciliation jobId ", jobId, "updateJobsList[", jobIndex, "].END_TIME", updateJobIdTime, "currentTime", currentTime);

          // }
          if (updateJobIdTime < currentTime) 
          {
            updateJobsList[jobIndex].UPDATE_REQUIRED = false;
          }
          else
          {
            for (let eIndex = 0; eIndex < existingJobIdsList.length; eIndex++) 
            {         

              if (jobId == existingJobIdsList[eIndex].JOB_ID) {
                // console.log("jobIndex", jobIndex, "eIndex", eIndex, "jobId ", jobId,  updateJobsList[jobIndex].UPDATE_REQUIRED, "activeCount", activeCount, "inactiveCount", inactiveCount);
                // console.log("jobIndex", jobIndex, "eIndex", eIndex, "jobId ", jobId,  "Existing activeCount", existingJobIdsList[eIndex].ACTIVECOUNT, "Existing inactiveCount", existingJobIdsList[eIndex].INACTIVECOUNT);
                  if((existingJobIdsList[eIndex].ACTIVECOUNT == activeCount) &&
                      (existingJobIdsList[eIndex].INACTIVECOUNT == inactiveCount))
                  {
                    updateJobsList[jobIndex].UPDATE_REQUIRED = false;
                    // console.log("2nd Reconciliation jobId ", jobId);
                    break;
                  } 
              }
            }
          }
        }
      }

      // console.log("After 2nd Reconcilation updateJobsList ", updateJobsList );
    
      // DELETE JOBS NOT IN SAP JOB SCHEDULER
      for (let eIndex = 0; eIndex < updateJobsList.length; eIndex++) {
        for (let jobIndex = 0; jobIndex < deleteJobsList.length; jobIndex++) {
          let jobId = deleteJobsList[jobIndex].JOB_ID;

          if (jobId == updateJobsList[eIndex].JOB_ID) {
            deleteJobsList[jobIndex].DELETE_REQUIRED = false;
          }
        }
      }


      // DELETE EXisting records not in SAP Job Scheduler
      for (let jobIndex = 0; jobIndex < deleteJobsList.length; jobIndex++) {
        if (deleteJobsList[jobIndex].DELETE_REQUIRED === true) {
          let jobId = deleteJobsList[jobIndex].JOB_ID;

          let delSqlStr = ' DELETE FROM JS_LOGS WHERE RUN_ID IN ' + '(' +
            ' SELECT DISTINCT RUN_ID FROM JS_SCHEDULES WHERE SCHEDULE_ID IN ' + '(' +
            ' SELECT DISTINCT SCHEDULE_ID FROM JS_JOBS WHERE JOB_ID = ' + "'" + jobId + "'" + ')' + ')';
          // console.log(" delSqlStr ", delSqlStr);

          try {
            await cds.run(delSqlStr);
          }
          catch (exception) {
            console.log("sqlStr exception ", delSqlStr);
            throw new Error(exception.toString());
          }

          delSqlStr = ' DELETE FROM JS_SCHEDULES WHERE SCHEDULE_ID IN ' + '(' +
            ' SELECT DISTINCT SCHEDULE_ID FROM JS_JOBS WHERE JOB_ID = ' + "'" + jobId + "'" + ')';
          // console.log(" delSqlStr ", delSqlStr);

          try {
            await cds.run(delSqlStr);
          }
          catch (exception) {
            console.log("sqlStr exception ", delSqlStr);
            throw new Error(exception.toString());
          }

          delSqlStr = 'DELETE FROM JS_JOBS WHERE JOB_ID = ' + "'" + jobId + "'";
          try {
            await cds.run(delSqlStr);
          }
          catch (exception) {
            console.log("sqlStr exception ", delSqlStr);
            throw new Error(exception.toString());
          }
        }
      }
    }



    let jobIdSchedulesStatusSql =
          ' SELECT DISTINCT JOB_ID, SCHEDULE_ID FROM V_JOBSTATUS ' +
                    ' WHERE RUN_STATUS != ' + "'" + 'Completed' + "'" + 
                    ' AND RUN_STATE != ' + "'" + 'Success' + "'" + ' ORDER BY JOB_ID DESC ';
    console.log("jobIdScheduleStatusSql ", jobIdSchedulesStatusSql);
    let jobIdSchedulesStatus;

    try {
      jobIdSchedulesStatus = await cds.run(jobIdSchedulesStatusSql);
    }
    catch (exception) {
      console.log("jobIdSchedulesStatusSql exception ", jobIdSchedulesStatusSql);
      throw new Error(exception.toString());
    }

    
    let jobScheduleIds = [];

    console.log('readJobSchedules Job IDs Request Time = ', new Date().toJSON());
    let tableObj = [];
    let jobCount = 0;
    console.log(" updateJobsList length ", updateJobsList.length);
    for (let jobIndex = 0; jobIndex < updateJobsList.length; jobIndex++) {
      //  console.log('jobIndex ', jobIndex, 'readJobSchedules  jobId', updateJobsList[jobIndex].JOB_ID, 
      //               'Name ', updateJobsList[jobIndex].JOB_NAME, ' update Required ', updateJobsList[jobIndex].UPDATE_REQUIRED);

      if (updateJobsList[jobIndex].UPDATE_REQUIRED == true) {
        jobCount++;
        let jobId = updateJobsList[jobIndex].JOB_ID;

        // console.log('lreadJobSchedules  jobId', jobId, 'Name ', ret_response.value[jobIndex].name);
        // console.log('jobIndex ', jobIndex, 'readJobSchedules  jobId', jobId, 'Name ', updateJobsList[jobIndex].JOB_NAME);

        if ((jobCount == 100)) {
          console.log('readJobSchedules  jobIndex', jobIndex, 'jobId', jobId, 'length ', ret_response.value.length, "Date ", new Date().toJSON());
          jobCount = 0;
        }
        // console.log('lreadJobSchedules  jobIndex', jobIndex, 'length ', ret_response.value.length);

        // let lreadJobSchedulesUrl = baseUrl + '/jobs/readJobSchedules(jobId=' + jobId + ')';
        let lreadJobSchedulesUrl;
        if (hostName.includes("localhost:4004")) {
          lreadJobSchedulesUrl = lbaseUrl + '/jobs/readJobSchedules(jobId=' + jobId + ')';
        }
        else {
          let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
          lreadJobSchedulesUrl = baseUrl + '/jobs/readJobSchedules(jobId=' + jobId + ')';
        }

        // console.log('lreadJobSchedulesUrl ', lreadJobSchedulesUrl);
        var auth = await GenFunctions.getAuthorization();
        options = {
          'method': 'GET',
          'url': lreadJobSchedulesUrl,
          'headers': {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'Authorization': auth
          },
          'timeout': 120000

        }
        let ret_sched_response = "";
        let respAck = false;

        await rp(options)
          .then(function (response) {
            // console.log('readJobSchedules Response Time = ', Date.now());
            ret_sched_response = JSON.parse(response);
            respAck = true;
          })
          .catch(function (error) {
            console.log('readJobSchedules - Error ', error);
            ret_sched_response = JSON.parse(error);
            respAck = true;
          });



        if (respAck) {

          for (let schIndex = 0; schIndex < ret_sched_response.value.length; schIndex++) {
            let scheduleId = ret_sched_response.value[schIndex].scheduleId;
            let scheduleExists = false;
            for (let eIndex = 0; eIndex < existingJobIdsList.length; eIndex++) 
            {     
              if (jobId == existingJobIdsList[eIndex].JOB_ID) {
                if(existingJobIdsList[eIndex].SCHEDULE_ID == ret_sched_response.value[schIndex].scheduleId)
                {
                  scheduleExists = true;
                }
              }
            }
            if(scheduleExists == false)
            {
              jobScheduleIds.push({ jobId, scheduleId });
            }
            else //schedule Exists --> check if it requires any update
            {
              let existingJobScheduleNotCompleted = false;
              for( let eschIdx = 0; eschIdx < jobIdSchedulesStatus.length; eschIdx++)
              {
                if( (jobIdSchedulesStatus[eschIdx].JOB_ID == jobId) &&
                    (jobIdSchedulesStatus[eschIdx].SCHEDULE_ID == scheduleId) )
                {
                  existingJobScheduleNotCompleted = true;
                }
              }
              if( existingJobScheduleNotCompleted == true)
              {
                jobScheduleIds.push({ jobId, scheduleId });
              }

            }

            // if( (jobId == '2037323') || (jobId == '2037439') )
            // {
            //   // console.log("jobId ", jobId, "updateJobsList SCHEDULE_IDS", updateJobsList[jobIndex].SCHEDULE_IDS)


            //   console.log("jobId ", jobId, "SCHEDULE_IDS", jobScheduleIds)
              
            // }


            let rowObj = {
              JOB_ID: ret_response.value[jobIndex].jobId,
              JOB_NAME: ret_response.value[jobIndex].name,
              ACTION: ret_response.value[jobIndex].action,
              ACTIVE: ret_response.value[jobIndex].active,
              HTTP_METHOD: ret_response.value[jobIndex].httpMethod,
              CREATAT: ret_response.value[jobIndex].createdAt,
              JOB_DES: ret_response.value[jobIndex].description,
              JOB_TYPE: ret_response.value[jobIndex].jobType,
              START_TIME: ret_response.value[jobIndex].startTime,
              END_TIME: ret_response.value[jobIndex].endTime,
              ACTIVECOUNT: ret_response.value[jobIndex].ACTIVECOUNT,
              INACTIVECOUNT: ret_response.value[jobIndex].INACTIVECOUNT,
              SIGNATURE_VERSION: ret_response.value[jobIndex].signatureVersion,
              SUB_DOMAIN: ret_response.value[jobIndex].subDomain,
              USER: ret_response.value[jobIndex].user,
              SCHEDULE_ID: scheduleId
            };

            tableObj.push(rowObj);
          }
        }
      }

    }

    if (tableObj.length > 0) {
      cqnQuery = { UPSERT: { into: { ref: ['JS_JOBS'] }, entries: tableObj } };
      // await cds.run(cqnQuery);

      try {
        await cds.run(cqnQuery);
      }
      catch (exception) {
        console.log("cqnQuery ", cqnQuery);
        throw new Error(exception.toString());
      }

      console.log('readJobSchedules Job IDs Response Time = ', new Date().toJSON());



      // console.log("jobScheduleIds ", jobScheduleIds);

      let jobScheduleLogs = [];
      let jobLogs = [];

      let schLogCount = 0;
      for (let jobSchLogIndex = 0; jobSchLogIndex < jobScheduleIds.length; jobSchLogIndex++) {
        schLogCount++;
        let jobId = jobScheduleIds[jobSchLogIndex].jobId;
        let scheduleId = jobScheduleIds[jobSchLogIndex].scheduleId;
        let displayLogs = true;
        console.log('lreadJobSchedule  jobId :', jobId, 'scheduleId :', scheduleId, 'displayLogs :', displayLogs);
        if (schLogCount == 100) {
          console.log('readJobSchedule  jobSchLogIndex :', jobSchLogIndex, 'scheduleId :', scheduleId, 'jobScheduleIds.length :', jobScheduleIds.length, new Date().toJSON());
          schLogCount = 0;
        }
        // let lreadJobScheduleUrl = baseUrl +
        //   '/jobs/readJobSchedule(jobId=' + jobId + ',' + 'scheduleId=' + "'" + scheduleId + "'" + "," + 'displayLogs=' + displayLogs + ')';
        let lreadJobScheduleUrl;
        if (hostName.includes("localhost:4004")) {
          lreadJobScheduleUrl = lbaseUrl + '/jobs/readJobSchedule(jobId=' + jobId + ',' + 'scheduleId=' + "'" + scheduleId + "'" + "," + 'displayLogs=' + displayLogs + ')';
        }
        else {
          let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
          lreadJobScheduleUrl = baseUrl + '/jobs/readJobSchedule(jobId=' + jobId + ',' + 'scheduleId=' + "'" + scheduleId + "'" + "," + 'displayLogs=' + displayLogs + ')';
        }

        // console.log('lreadJobScheduleUrl ', lreadJobScheduleUrl);
        var auth = await GenFunctions.getAuthorization();
        options = {
          'method': 'GET',
          'url': lreadJobScheduleUrl,
          'headers': {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'Authorization': auth
          },
          'timeout': 120000
        }
        let ret_schedlog_response = "";
        respAck = false;

        await rp(options)
          .then(function (response) {
            // console.log('readJobSchedule Response Time = ', Date.now());
            ret_schedlog_response = JSON.parse(response);
            respAck = true;
          })
          .catch(function (error) {
            console.log('readJobSchedules - Error ', error);
            ret_schedlog_response = JSON.parse(error);
            respAck = true;
          });
        // console.log("ret_schedlog_response  ", ret_schedlog_response);
        // console.log("ret_schedlog_response respAck ", respAck);
        if (respAck &&
          (ret_schedlog_response.value.logs != undefined)) {
          // console.log("ret_schedlog_response logs ", ret_schedlog_response.value.logs);

          for (let logIndex = 0; logIndex < (ret_schedlog_response.value.logs.length); logIndex++) {
            let runId = ret_schedlog_response.value.logs[logIndex].runId;
            // jobScheduleLogs.push({ jobId, scheduleId, runId });

            let schData = ret_schedlog_response.value.data;
            // console.log("logIndex ", logIndex, "schData ", schData)
            if (schData != null) {
              if (ret_schedlog_response.value.data.length >= 5000) {
                schData = schData.slice(0, 4995) + "...";
              }
              let startTime = "";
              let endTime = "";
              let schTime = "";
              let schNextRunTime = "";
              if (ret_schedlog_response.value.startTime != undefined) {
                startTime = ret_schedlog_response.value.startTime;
              }
              if (ret_schedlog_response.value.endTime != undefined) {
                endTime = ret_schedlog_response.value.endTime;
              }
              if (ret_schedlog_response.value.time != undefined) {
                schTime = ret_schedlog_response.value.time;
              }
              if (ret_schedlog_response.value.nextRunAt != undefined) {
                schNextRunTime = ret_schedlog_response.value.nextRunAt;
              }

              let rowObj = {
                SCHEDULE_ID: ret_schedlog_response.value.scheduleId,
                SCH_DESC: ret_schedlog_response.value.description,
                SCH_DATA: schData,
                SCH_TYPE: ret_schedlog_response.value.type,
                SCH_ACTIVE: ret_schedlog_response.value.active,
                SCH_STARTTIME: startTime,
                SCH_END_TIME: endTime,
                SCH_TIME: schTime,
                SCH_NEXTRUN: schNextRunTime,
                RUN_ID: runId
              };

              jobScheduleLogs.push(rowObj);

              let httpStatus = ret_schedlog_response.value.logs[logIndex].httpStatus;
              let executionTimestamp = ret_schedlog_response.value.logs[logIndex].executionTimestamp;
              let runStatus = ret_schedlog_response.value.logs[logIndex].runStatus;
              let runState = ret_schedlog_response.value.logs[logIndex].runState;
              let statusMessage = ret_schedlog_response.value.logs[logIndex].statusMessage;
              let scheduleTimestamp = ret_schedlog_response.value.logs[logIndex].scheduleTimestamp;
              let completionTimestamp = ret_schedlog_response.value.logs[logIndex].completionTimestamp;
              let runText = ret_schedlog_response.value.logs[logIndex].runText;
              let runStr = runText.replace(/'/g, '"');
              if (runStr.length >= 5000) {
                runStr = runStr.slice(0, 4995) + "...";
              }

              let logObj = {
                RUN_ID: runId,
                HTTP_STATUS: httpStatus,
                EXECUTION_TIMESTAMP: executionTimestamp,
                RUN_STATUS: runStatus,
                RUN_STATE: runState,
                STATUS_MESSAGE: statusMessage,
                SCHEDULED_TIMESTAMP: scheduleTimestamp,
                COMPLETED_TIMESTAMP: completionTimestamp,
                RUNTEXT: runStr
              };

              jobLogs.push(logObj);

            }
          }
        }
      }


      console.log("jobScheduleLogs length ", jobScheduleLogs.length);
      let scheduleLogs = [];
      let scheduleCounts = 0;
      for (let i = 0; i < jobScheduleLogs.length; i++) {
        scheduleCounts++;
        scheduleLogs.push(jobScheduleLogs[i]);
        if (scheduleCounts == 500) {
          console.log("Upsert Job Schedule Logs For  jobScheduleLogs Index = ", i, "scheduleCounts ", scheduleCounts);
          cqnQuery = { UPSERT: { into: { ref: ['JS_SCHEDULES'] }, entries: scheduleLogs } };
          await cds.run(cqnQuery);
          scheduleCounts = 0;
          scheduleLogs = [];
        }
      }

      console.log("scheduleLogs Length ", scheduleLogs.length, "scheduleCounts ", scheduleCounts);
      if (scheduleLogs.length > 0) {
        cqnQuery = { UPSERT: { into: { ref: ['JS_SCHEDULES'] }, entries: scheduleLogs } };
        // await cds.run(cqnQuery);

        try {
          await cds.run(cqnQuery);
        }
        catch (exception) {
          console.log("cqnQuery ", cqnQuery);
          throw new Error(exception.toString());
        }
      }

      console.log('JS_SCHEDULES UPDATE Response Time = ', new Date().toJSON());

      if (jobLogs.length > 0) {

        cqnQuery = { UPSERT: { into: { ref: ['JS_LOGS'] }, entries: jobLogs } };
        // await cds.run(cqnQuery);
        try {
          await cds.run(cqnQuery);
        }
        catch (exception) {
          console.log("cqnQuery ", cqnQuery);
          throw new Error(exception.toString());
        }
      }
    }
    console.log('JS_LOGS UPDATE Response Time = ', new Date().toJSON());

    // console.log("jobScheduleLogs ", jobScheduleLogs);

    
    if(syncRequest == false)
    {
      let dataObj = {};
      dataObj["success"] = true;
      dataObj["message"] = "generate Job Logs Completed Successfully";
      if (req.headers['x-sap-job-id'] > 0) {
        const scheduler = getJobscheduler(req);
  
        var updateReq = {
          jobId: req.headers['x-sap-job-id'],
          scheduleId: req.headers['x-sap-job-schedule-id'],
          runId: req.headers['x-sap-job-run-id'],
          data: dataObj
        };
  
        scheduler.updateJobRunLog(updateReq, function (err, result) {
          if (err) {
            return console.log('Error updating run log: %s', err);
          }
  
        });
      }
    }
    else
    {

        console.log("Sync Job Logs syncJobsDataOneTime ",syncCount);
        let dataObj = {};
        dataObj["success"] = true;
        dataObj["message"] = "Sync Job Logs syncJobsDataOneTime Completed count " + syncCount + " Successfully";
        console.log('JS_LOGS syncJobsDataOneTime Response Time = ', new Date().toJSON(), "dataObj ", dataObj);
        if (req.headers['x-sap-job-id'] > 0) {
          const scheduler = getJobscheduler(req);

          var updateReq = {
            jobId: req.headers['x-sap-job-id'],
            scheduleId: req.headers['x-sap-job-schedule-id'],
            runId: req.headers['x-sap-job-run-id'],
            data: dataObj
          };

          scheduler.updateJobRunLog(updateReq, function (err, result) {
            if (err) {
              return console.log('Error updating run log: %s', err);
            }

          });
      }
    }
  
  }


  srv.on("lreadJobs", async req => {

    var readJobsUrl = "";

    let hostName = req.headers.host;
    console.log("lreadJobs hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      readJobsUrl = lbaseUrl + '/jobs/readJobs()';
    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
      readJobsUrl = baseUrl + '/jobs/readJobs()';
    }
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': readJobsUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    var values = [];
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('lreadJobs - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });

  srv.on("lreadJobDetails", async (req) => {
    let jobId = req.data.jobId;
    let displaySchedules = req.data.displaySchedules;


    var lreadJobDetailsUrl = "";

    let hostName = req.headers.host;
    console.log("lreadJobDetails hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      lreadJobDetailsUrl = lbaseUrl + '/jobs/readJobDetails(jobId=' + jobId + ',displaySchedules=' + displaySchedules + ')';
    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
      lreadJobDetailsUrl = baseUrl + '/jobs/readJobDetails(jobId=' + jobId + ',displaySchedules=' + displaySchedules + ')';
    }

    console.log('lreadJobDetails  jobId', jobId, 'displayJobSchedules ', displaySchedules);
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': lreadJobDetailsUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    var values = [];
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('lreadJobDetails - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });

  srv.on("lreadJobSchedules", async (req) => {
    let jobId = req.data.jobId;

    console.log('lreadJobSchedules  jobId', jobId);

    var lreadJobSchedulesUrl = "";

    let hostName = req.headers.host;
    console.log("lreadJobSchedules hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      lreadJobSchedulesUrl = lbaseUrl + '/jobs/readJobSchedules(jobId=' + jobId + ')';
    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
      lreadJobSchedulesUrl = baseUrl + '/jobs/readJobSchedules(jobId=' + jobId + ')';
    }
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': lreadJobSchedulesUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    var values = [];
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('lreadJobSchedules - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });


  srv.on("lreadJobSchedule", async (req) => {
    let jobId = req.data.jobId;
    let scheduleId = req.data.scheduleId;
    let displayLogs = req.data.displayLogs;
    console.log('lreadJobSchedule  jobId :', jobId, 'scheduleId :', scheduleId, 'displayLogs :', displayLogs);

    var lreadJobScheduleUrl = "";

    let hostName = req.headers.host;
    console.log("lreadJobSchedule hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      lreadJobScheduleUrl = lbaseUrl +
        '/jobs/readJobSchedule(jobId=' + jobId + ',' + 'scheduleId=' + "'" + scheduleId + "'" + "," + 'displayLogs=' + displayLogs + ')';
    }
    else {
      // let baseUrl = req.headers['x-forwarded-proto'] + '://' + req.headers.host; 
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
      lreadJobScheduleUrl = baseUrl +
        '/jobs/readJobSchedule(jobId=' + jobId + ',' + 'scheduleId=' + "'" + scheduleId + "'" + "," + 'displayLogs=' + displayLogs + ')';
    }
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': lreadJobScheduleUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    var values = [];
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('lreadJobSchedule - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });

  srv.on("lreadJobActionLogs", async (req) => {
    let jobId = req.data.jobId;

    console.log('lreadJobActionLogs  jobId', jobId);

    var lreadJobActionLogsUrl = "";

    let hostName = req.headers.host;
    console.log("lreadJobActionLogs hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      lreadJobActionLogsUrl = lbaseUrl + '/jobs/readJobActionLogs(jobId=' + jobId + ')';
    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
      lreadJobActionLogsUrl = baseUrl + '/jobs/readJobActionLogs(jobId=' + jobId + ')';
    }
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': lreadJobActionLogsUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    var values = [];
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('lreadJobActionLogs - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });

  srv.on("lreadJobRunLogs", async (req) => {
    let jobId = req.data.jobId;
    let scheduleId = req.data.scheduleId;
    let page_size = req.data.page_size;
    let offset = req.data.offset;


    console.log('lreadJobRunLogs  jobId :', jobId, 'scheduleId :', scheduleId, 'page_size :', page_size, 'offset =', offset);

    var lreadJobRunLogsUrl = "";

    let hostName = req.headers.host;
    console.log("lreadJobRunLogs hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      lreadJobRunLogsUrl = lbaseUrl +
        '/jobs/readJobRunLogs(jobId=' + jobId + ',' + 'scheduleId=' + "'" + scheduleId + "'" + "," + 'page_size=' + page_size + ',' + 'offset=' + offset + ')';
    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
      lreadJobRunLogsUrl = baseUrl +
        '/jobs/readJobRunLogs(jobId=' + jobId + ',' + 'scheduleId=' + "'" + scheduleId + "'" + "," + 'page_size=' + page_size + ',' + 'offset=' + offset + ')';
    }
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': lreadJobRunLogsUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    var values = [];
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('lreadJobRunLogs - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });

  srv.on("laddMLJob", async req => {

    let jobDetails = req.data.jobDetails;
    let jDetails = jobDetails.replace(/[/]/g, "%2F");

    console.log('jDetails ', jDetails);


    var addJobsUrl = "";

    let hostName = req.headers.host;
    console.log("addJobsUrl hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      addJobsUrl = lbaseUrl + '/jobs/addMLJob(jobDetails=' + "'" + jDetails + "'" + ')';
    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
      addJobsUrl = baseUrl + '/jobs/addMLJob(jobDetails=' + "'" + jDetails + "'" + ')';
    }
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': addJobsUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    var values = [];
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('laddMLJob - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });


  srv.on("lupdateJob", async (req) => {

    let jobDetails = req.data.jobDetails;
    let jDetails = jobDetails.replace(/[/]/g, "%2F");
    console.log('jDetails ', jDetails);

    var lupdateJobUrl = "";

    let hostName = req.headers.host;
    console.log("lupdateJob hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      lupdateJobUrl = lbaseUrl + '/jobs/updateMLJob(jobDetails=' + "'" + jDetails + "'" + ')';
    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();

      lupdateJobUrl = baseUrl + '/jobs/updateMLJob(jobDetails=' + "'" + jDetails + "'" + ')';
    }
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': lupdateJobUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('lupdateJob - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });

  srv.on("ldeleteJob", async (req) => {
    let jobId = req.data.jobId;


    console.log('ldeleteJob  jobId :', jobId);



    var ldeleteJobUrl = "";

    let hostName = req.headers.host;
    console.log("ldeleteJob hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      ldeleteJobUrl = lbaseUrl +
        '/jobs/deleteMLJob(jobId=' + jobId + ')';
    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();

      ldeleteJobUrl = baseUrl +
        '/jobs/deleteMLJob(jobId=' + jobId + ')';
    }
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': ldeleteJobUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('ldeleteJob - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });



  srv.on("laddJobSchedule", async req => {


    let scheduleDetails = req.data.schedule;

    console.log("laddJobSchedule req.data :", req.data);
    let sDetails = scheduleDetails.replace(/[/]/g, "%2F");

    console.log("laddJobSchedule sDetails :", sDetails);
    var addJobScheduleUrl = "";

    let hostName = req.headers.host;
    console.log("laddJobSchedule hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      addJobScheduleUrl = lbaseUrl + '/jobs/addJobSchedule(schedule=' + "'" + sDetails + "'" + ')';

    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();

      addJobScheduleUrl = baseUrl + '/jobs/addJobSchedule(schedule=' + "'" + sDetails + "'" + ')';

    }
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': addJobScheduleUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('laddJobSchedule - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });

  srv.on("lupdateMLJobSchedule", async req => {


    let scheduleDetails = req.data.schedule;

    console.log("lupdateMLJobSchedule req.data :", req.data);
    let sDetails = scheduleDetails.replace(/[/]/g, "%2F");

    console.log("lupdateMLJobSchedule sDetails :", sDetails);

    var updateMLJobScheduleUrl = "";

    let hostName = req.headers.host;
    console.log("lupdateMLJobSchedule hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      updateMLJobScheduleUrl = lbaseUrl + '/jobs/updateMLJobSchedule(schedule=' + "'" + sDetails + "'" + ')';
    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();

      updateMLJobScheduleUrl = baseUrl + '/jobs/updateMLJobSchedule(schedule=' + "'" + sDetails + "'" + ')';
    }
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': updateMLJobScheduleUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('updateMLJobSchedule - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });

  srv.on("ldeleteMLJobSchedule", async req => {


    let scheduleDetails = req.data.scheduleDetails;

    console.log("ldeleteMLJobSchedule req.data :", req.data);
    let sDetails = scheduleDetails.replace(/[/]/g, "%2F");

    console.log("ldeleteMLJobSchedule sDetails :", sDetails);

    var ldeleteMLJobScheduleUrl = "";

    let hostName = req.headers.host;
    console.log("ldeleteMLJobSchedule hostName ", hostName);

    if (hostName.includes("localhost:4004")) {
      ldeleteMLJobScheduleUrl = lbaseUrl + '/jobs/deleteMLJobSchedule(scheduleDetails=' + "'" + sDetails + "'" + ')';
    }
    else {
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();

      ldeleteMLJobScheduleUrl = baseUrl + '/jobs/deleteMLJobSchedule(scheduleDetails=' + "'" + sDetails + "'" + ')';
    }
    var auth = await GenFunctions.getAuthorization();
    options = {
      'method': 'GET',
      'url': ldeleteMLJobScheduleUrl,
      'headers': {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': auth
      },
      'timeout': 1000
    }
    let ret_response = "";

    await request(options, async function (error, response) {

      console.log('statusCode:', response.statusCode); // Print the response status code if a response was received
      if (error) {
        console.log('ldeleteMLJobSchedule - Error ', error);
        ret_response = JSON.parse(error);
      }
      if (response.statusCode == 200) {
        ret_response = JSON.parse(response.body);
      }
    })
    const sleep = require('await-sleep');
    await sleep(1000);
    req.reply(ret_response);

  });

  srv.on("readJobs", (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      if (scheduler) {
        var query = {};
        scheduler.fetchAllJobs(query, function (err, result) {
          if (err) {
            reject(req.error("Error retrieving jobs"));
          }
          //Jobs retrieved successfully
          if (result && result.results && result.results.length > 0) {
            // console.log("readJobs ", result.results);

            resolve(result.results);
            // resolve(JSON.stringify(result.results));
          } else {
            reject(req.warn("Can't find any job"));
          }
        });
      }
    });
  });

  srv.on("readJobDetails", (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      if (scheduler) {

        console.log("readJobDetails req.data", req.data, 'displaySchedules', req.data.displaySchedules);

        let query = {
          jobId: req.data.jobId,
          displaySchedules: req.data.displaySchedules
        };
        console.log("readJobDetails query", query);
        scheduler.fetchJob(query, function (err, result) {
          if (err) {
            reject(req.error("Error retrieving job"));
          } else {
            // job was created successfully
            console.log("readJobDetails ", result);
            resolve(result);
          }
        });
      }
    });
  });

  srv.on("readJobSchedules", (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      if (scheduler) {
        var query = {
          //by Id
          jobId: req.data.jobId,
        };
        scheduler.fetchJobSchedules(query, function (err, result) {
          if (err) {
            reject(req.error("Error retrieving job schedules"));
          } else {
            // job was created successfully
            resolve(result.results);
          }
        });
      }
    });
  });

  srv.on("readJobSchedule", (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      console.log(" readJobSchedule displayLogs ", req.data.displayLogs);


      if (scheduler) {
        var query = {
          //by Id
          jobId: req.data.jobId,
          scheduleId: req.data.scheduleId,
          displayLogs: req.data.displayLogs
        };

        console.log(" readJobSchedule query ", query);
        scheduler.fetchJobSchedule(query, function (err, result) {
          if (err) {
            reject(req.error("Error retrieving job schedules"));
          } else {
            // job was created successfully
            // console.log("readJobSchedule ", result);

            resolve(result);
          }
        });
      }
    });
  });

  srv.on("readJobActionLogs", (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      if (scheduler) {
        var query = {
          jobId: req.data.jobId,
        };
        scheduler.getJobActionLogs(query, function (err, result) {
          if (err) {
            reject(req.error("Error retrieving job action logs"));
          } else {
            console.log(result.results);
            resolve(JSON.stringify(result.results));
          }
        });
      }
    });
  });

  srv.on("readJobRunLogs", (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      if (scheduler) {
        var query = {
          jobId: req.data.jobId,
          scheduleId: req.data.scheduleId,
          page_size: req.data.page_size,
          offset: req.data.offset,
        };
        scheduler.getRunLogs(query, function (err, result) {
          if (err) {
            reject(req.error("Error retrieving job run logs"));
          } else {
            resolve(result.results);
          }
        });
      }
    });
  });

  srv.on(["createJob"], (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      if (scheduler) {
        var myJob = {
          name: "validateSalesOrder",
          description: "cron job that validates sales order requests",
          action: req.data.url,
          active: true,
          httpMethod: "POST",
          schedules: [
            {
              cron: req.data.cron,
              description:
                "this schedule runs as defined from the input paramter",
              data: {},
              active: true,
              startTime: {
                date: "2021-01-04 15:00 +0000",
                format: "YYYY-MM-DD HH:mm Z",
              },
            },
          ],
        };
        var scJob = { job: myJob };
        scheduler.createJob(scJob, function (err, result) {
          if (err) {
            reject(req.error(err.message));
          } else {
            // job was created successfully
            resolve(result._id);
          }
        });
      }
    });
  });

  srv.on("addMLJob", (req) => {

    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);

      let jobDetails = req.data.jobDetails;
      let jDetails = jobDetails.replace(/%2F/g, "/");
      var inputData = JSON.parse(jDetails);

      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();

      let actionUrl = baseUrl + inputData.action;
      if (scheduler) {
        var myJob = {
          name: inputData.name,
          description: inputData.description,
          action: actionUrl,
          active: true,
          httpMethod: "POST",
          startTime: inputData.startTime,
          endTime: inputData.endTime,
          schedules: inputData.schedules
        };
        console.log("myJob :", myJob)
        var scJob = { job: myJob };
        scheduler.createJob(scJob, function (err, result) {
          if (err) {
            reject(req.error(err.message));
          } else {
            // job was created successfully
            resolve(result._id);
          }
        });
      }
    });
  });

  srv.on("createMLJob", (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      console.log("createMLJob req.data :", req.data);
      var inputData = req.data.jobDetails;
      console.log("createMLJob inputData :", inputData);
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();

      let actionUrl = baseUrl + inputData.action;


      if (scheduler) {
        var myJob = {
          name: inputData.name,
          description: inputData.description,
          action: actionUrl,
          active: true,
          httpMethod: "POST",
          startTime: inputData.startTime,
          endTime: inputData.endTime,
          schedules: inputData.schedules
        };
        console.log("myJob :", myJob)
        var scJob = { job: myJob };
        scheduler.createJob(scJob, function (err, result) {
          if (err) {
            reject(req.error(err.message));
          } else {
            // job was created successfully
            resolve(result._id);
          }
        });
      }
    });
  });


  srv.on("updateMLJob", (req) => {
    console.log("updateMLJob jobDetails :", JSON.parse(req.data.jobDetails));

    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      console.log("updateMLJob req.data :", req.data);

      let jobDetails = req.data.jobDetails;
      let jDetails = jobDetails.replace(/%2F/g, "/");

      var inputData = JSON.parse(jDetails);
      console.log("updateMLJob inputData :", inputData);

      if (scheduler) {
        var theJob = {
          active: inputData.active,
          description: inputData.description,
          httpMethod: inputData.httpMethod,
          startTime: inputData.startTime,
          endTime: inputData.endTime,
        };

        console.log("updateJob theJob :", theJob)
        var suJob = { jobId: inputData.jobId, job: theJob };

        scheduler.updateJob(suJob, (err, result) => {
          if (err) {
            reject(req.error(err.message));
          } else {
            resolve(JSON.stringify(result));
          }
        });
      }
    });
  });

  srv.on("updateJob", (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      if (scheduler) {
        var inputData = req.data.jobDetails;

        var theJob = {
          active: inputData.active,
          description: inputData.description,
          httpMethod: inputData.httpMethod,
          startTime: inputData.startTime,
          endTime: inputData.endTime,
        };

        console.log("updateJob theJob :", theJob)
        var suJob = { jobId: inputData.jobId, job: theJob };

        scheduler.updateJob(suJob, (err, result) => {
          if (err) {
            reject(req.error(err.message));
          } else {
            // job was created successfully
            resolve(JSON.stringify(result));
          }
        });
      }
    });
  });


  srv.on("deleteMLJob", (req) => {
    console.log("deleteMLJob jobDetails :", JSON.parse(req.data.jobId));

    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      console.log("deletMLJob req.data :", req.data);

      if (scheduler) {


        var suJob = { jobId: req.data.jobId };

        scheduler.deleteJob(suJob, (err, result) => {
          if (err) {
            reject(req.error(err.message));
          } else {
            resolve(JSON.stringify(result));
          }
        });
      }
    });
  });

  srv.on(["deleteJob"], (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      if (scheduler) {
        var jreq = {
          jobId: req.data.jobId,
        };
        scheduler.deleteJob(jreq, (err, result) => {
          if (err) {
            reject(req.error(err.message));
          } else {
            // job was created successfully
            resolve(JSON.stringify(result));
          }
        });
      }
    });
  });

  srv.on("createJobSchedule", (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      console.log("createJobSchedule req.data :", req.data);
      var inputData = req.data.jobSchedule;
      console.log("createJobSchedule inputData :", inputData);

      if (scheduler) {
        var myJob = {
          data: inputData.data,
          description: inputData.description,
          active: inputData.active,
          startTime: inputData.startTime,
          endTime: inputData.endTime,
          cron: inputData.cron,
          time: inputData.time,
          repeatInterval: inputData.repeatInterval,
          repeatAt: inputData.repeatAt
        };
        var scJob = { jobId: req.data.jobId, schedule: myJob };
        console.log("scJob :", scJob)


        scheduler.createJobSchedule(scJob, function (err, result) {
          if (err) {
            reject(req.error(err.message));
          } else {
            // job was created successfully
            resolve(result);
          }
        });
      }
    });
  });


  srv.on("addJobSchedule", (req) => {
    console.log("schedule :", JSON.parse(req.data.schedule));


    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      console.log("addJobSchedule req.data :", req.data);
      var inputData = JSON.parse(req.data.schedule);
      console.log("addJobSchedule inputData :", inputData);

      if (scheduler) {

        var myJob = {
          data: inputData.data,
          description: inputData.description,
          active: inputData.active,
          startTime: inputData.startTime,
          endTime: inputData.endTime,
          cron: inputData.cron,
          time: inputData.time,
          repeatInterval: inputData.repeatInterval,
          repeatAt: inputData.repeatAt
        };

        var scJob = { jobId: inputData.jobId, schedule: myJob };
        console.log("scJob :", scJob)

        scheduler.createJobSchedule(scJob, (err, result) => {
          if (err) {
            reject(req.error(err.message));
          } else {
            resolve(JSON.stringify(result));
          }
        });
      }
    });
  });

  srv.on("updateMLJobSchedule", (req) => {
    console.log("schedule :", JSON.parse(req.data.schedule));


    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      console.log("updateMLJobSchedule req.data :", req.data);

      let schedule = req.data.schedule;
      console.log("updateMLJobSchedule schedule :", schedule);

      let jSchedule = schedule.replace(/%2F/g, "/");

      var inputData = JSON.parse(jSchedule);

      console.log("updateMLJobSchedule inputData :", inputData);

      if (scheduler) {

        var myJob = {
          data: inputData.data,
          description: inputData.description,
          active: inputData.active,
          startTime: inputData.startTime,
          endTime: inputData.endTime,
          cron: inputData.cron,
          time: inputData.time,
          repeatInterval: inputData.repeatInterval,
          repeatAt: inputData.repeatAt
        };

        var scJob = { jobId: inputData.jobId, scheduleId: inputData.scheduleId, schedule: myJob };
        console.log("scJob :", scJob)

        scheduler.updateJobSchedule(scJob, (err, result) => {
          if (err) {
            reject(req.error(err.message));
          } else {
            resolve(JSON.stringify(result));
          }
        });
      }
    });
  });

  srv.on(["deleteJobSchedule"], (req) => {

    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      if (scheduler) {


        var inputData = req.data;
        console.log("deleteJobSchedule inputData :", inputData);

        var jreq = {
          jobId: req.data.jobId,
          scheduleId: req.data.scheduleId
        };
        scheduler.deleteJobSchedule(jreq, (err, result) => {
          if (err) {
            reject(req.error(err.message));
          } else {
            // job was created successfully
            resolve(JSON.stringify(result));
          }
        });
      }
    });
  });


  srv.on("deleteMLJobSchedule", (req) => {
    console.log("deleteMLJobSchedule scheduleDetails :", JSON.parse(req.data.scheduleDetails));



    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);

      if (scheduler) {
        let scheduleDetails = JSON.parse(req.data.scheduleDetails);
        console.log("deleteMLJobSchedule scheduleDetails :", scheduleDetails);
        var jreq = {
          jobId: scheduleDetails.jobId,
          scheduleId: scheduleDetails.scheduleId
        };

        console.log("deleteMLJobSchedule jreq :", jreq);

        scheduler.deleteJobSchedule(jreq, (err, result) => {
          if (err) {
            reject(req.error(err.message));
          } else {
            resolve(JSON.stringify(result));
          }
        });
      }
    });
  });


  srv.on("updateJobSchedule", (req) => {
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
      console.log("updateJobSchedule req.data :", req.data);
      var inputData = req.data.jobSchedule;
      console.log("updateJobSchedule inputData :", inputData);

      if (scheduler) {
        var myJob = {
          data: inputData.data,
          description: inputData.description,
          active: inputData.active,
          startTime: inputData.startTime,
          endTime: inputData.endTime,
          cron: inputData.cron,
          time: inputData.time,
          repeatInterval: inputData.repeatInterval,
          repeatAt: inputData.repeatAt
        };
        var scJob = { jobId: req.data.jobId, scheduleId: req.data.scheduleId, schedule: myJob };
        console.log("scJob :", scJob)


        scheduler.updateJobSchedule(scJob, function (err, result) {
          if (err) {
            reject(req.error(err.message));
          } else {
            // job was created successfully
            resolve(result);
          }
        });
      }
    });
  });
  //Seed Order Job
  srv.on("addSeedOrderJob", (req) => {

    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);

      let jobDetails = req.data.jobDetails;
      let jDetails = jobDetails.replace(/%2F/g, "/");
      var inputData = JSON.parse(jDetails);

      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();

      let actionUrl = baseUrl + inputData.action;
      if (scheduler) {
        var myJob = {
          name: inputData.name,
          description: inputData.description,
          action: actionUrl,
          active: true,
          httpMethod: "POST",
          startTime: inputData.startTime,
          endTime: inputData.endTime,
          schedules: inputData.schedules
        };
        var scJob = { job: myJob };
        scheduler.createJob(scJob, function (err, result) {
          if (err) {
            reject(req.error(err.message));
          } else {
            // job was created successfully
            resolve(result._id);
          }
        });
      }
    });
  });

  srv.on("genParamValues", async req => {
    let liTempHeader = [];
    let liTempItem = [];
    let lsresults = {};
    let lsItems = {};
    let liTempdata = {};

  });

  srv.on("insertJobData", async (req) => {
    var sequence = req.data.Sequence;
    var aData = JSON.parse(req.data.jobData);
    var liresults = [];
    // if(VARIANT === "X"){
    //   let Variant = sequence;
    // } else {
    //   let Variant = 'NA';
    // }
    if (aData.length > 0) {
      aData.forEach(el => {
        const obj = Object.assign({});
        obj.SEQUENCE_ID = sequence;
        // obj.VARIANT_NAME = Variant;
        obj.ACTIVITY_ID = el.ACTIVITY_ID;
        obj.STEP = el.STEP;
        obj.STEP_NO = el.STEP_NO;
        obj.SET = el.SET;
        obj.SUB_STEP = el.SUBSTEP;
        obj.MANDATORY = el.MANDATORY;
        obj.MAIN_SET = el.MAIN_STEP;
        obj.STEP_DATA = JSON.stringify(el.STEP_DATA);
        obj.TEMPLATE_ID = el.TEMPLATE_ID,
          obj.ACTION_URL = el.ACTION_URL,
          liresults.push(obj);
      })
    }
    if (liresults.length > 0) {
      try {
        if (req.data.Flag === "X") {
          await cds.run(`DELETE FROM "JS_JOB_CREATIONDATA" 
                       WHERE "SEQUENCE_ID" = '${sequence}' `);
        }
        await cds.run(INSERT.into("JS_JOB_CREATIONDATA").entries(liresults));
        return sequence;
      }
      catch {
        return sequence;
      }
    }
  })

  srv.on("addJobCreation", (req) => {
 
    return new Promise((resolve, reject) => {
      const scheduler = getJobscheduler(req);
 
      let jobDetails = req.data.jobDetails;
      let jDetails = jobDetails.replace(/%2F/g, "/");
      var inputData = JSON.parse(jDetails);
      const subdomain = req.user.authInfo?.getSubdomain?.();
      let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();

      let actionUrl = baseUrl + inputData.action + '?host=' + subdomain;
      if (scheduler) {
        var myJob = {
          name: inputData.name,
          description: inputData.description,
          action: actionUrl,
          active: true,
          httpMethod: "POST",
          startTime: inputData.startTime,
          endTime: inputData.endTime,
          schedules: inputData.schedules
        };
        var scJob = { job: myJob };
        scheduler.createJob(scJob, async function (err, result) {
          if (err) {
            reject(req.error(err.message));
          } else {
            const obj = {
              'sequenceId': JSON.parse(result.schedules[0].data),
              'jobId': result._id
            }
            // try {
            //   await UPDATE`JS_JOB_TEMPLATEDETAILS`
            //     .with({
            //       JOB_ID: obj.jobId
            //     })
            //     .where(`SEQUENCE_ID = '${obj.sequenceId}'`);
            // } catch (e) {
            //   console.log(e)
            // }
            resolve(obj);
          }
        });
      }
    });
  });



    //Service for UI to create Job without POST request
    srv.on("createJobFeed", async (req)=>{
      cds.context.tenant=req.data.tenant
      req.tenant=req.data.tenant
      return (await _processJobFeed(req,true, req.data.userName));
    })
  //Parallel Job Creation for Variants
  srv.on("executeJobFeed", async (req) => {
    return (await _processJobFeed(req,false,'External User'));
  });

  async function _processJobFeed(req,isApplication,userName) {
    var iRefreshInterval = 1000 //1 Second
  //  var baseUrl =  req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
    var baseUrl = 'https://sbpmtt-dev-vcplanner-mt-srv.cfapps.us10-001.hana.ondemand.com' ;
    var iJobLimit = 1;
    var CurrJobName = "";
    var aPreferences = await cds.run(
      `SELECT * FROM "CP_USER_PREFERENCES"
     WHERE "PARAMETER" = 'PARALLEL_JOBS'`
    );
    if (aPreferences.length > 0) {
      iJobLimit = parseInt(aPreferences[0].PARAMETER_VALUE);
    }
    var sVariantName = req.data.jobFeedName; // getting Variant Name

    //Getting all the data of all Activities based on variant
    var liSequences = await cds.run(
      `SELECT * FROM "JS_JOB_CREATIONDATA"
     WHERE "SEQUENCE_ID" = '` + sVariantName + `'
     ORDER BY
     "STEP" ASC`
    );
    var res = req._.req.res;
    res.statusCode = 202;
    if (liSequences.length > 0) { //checking if variant exists
      //Scenario 1 - To not process same variant(This is getting handled at cap_servs)
      // var aRunningJobs = await cds.run(`SELECT * FROM "JS_JOB_TEMPLATEDETAILS" WHERE "ACTIVE" = true AND "JOB_STATUS" = 'Pending' AND "SEQUENCE_ID" = '${sVariantName}'`)
      // if (aRunningJobs.length > 0) {
      //   var obj ={
      //     Type: "WARNING",
      //     Description: "Cannot Process,job execution is already in progress for Job Feed: " + aRunningJobs[0].JOB_NAME,
      //     statusCode: 199
      //   }
      //   if(isApplication == true){
      //     req.reply(obj);
      //   }
      //   else{
      //     res.send(obj);
      //   }
      //   return;
      // }

      var HTTPrequest = require('request');
      //insert into table JS_JOB_TEMPLATEDETAILS
      var aNewJobsData = [];
      // let padL = (nr, _len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
      // var sTimeStamp =
      //   `${new Date().getFullYear()}-${padL(new Date().getMonth() + 1)}-${padL(new Date().getDate())} ${padL(new Date().getHours())}:${padL(new Date().getMinutes())}:${padL(new Date().getSeconds())}`
      var rFormat = new Date().toISOString();

      var jobName =   sVariantName.toString() + "_" + new Date().getTime(); //Setting Job Name and job Description same as job feed
      CurrJobName = jobName;
      for (var x = 0; x < liSequences.length; x++) {
        let el = liSequences[x];
        const obj = {
          JOB_ID: 9999,
          TEMPLATE_ID: el.TEMPLATE_ID,
          ACTIVITY_ID: el.ACTIVITY_ID,
          STEP: el.STEP,
          SEQUENCE_ID: sVariantName,
          SUBJOB_ID:null,
          SCHEDULE_ID: null,
          JOB_NAME:jobName,
          PARAM_VALUE: el.STEP_DATA,
          JOB_TYPE: 'Single Run',
          RECURRENCE_VALUE_FORMAT: rFormat,
          RECURRENCE_VALUE: rFormat,
          JOB_STATUS: 'Pending',
          ACTIVITY_STATUS: 'Not Triggered',
          ACTIVE: true,
          CREATED_BY:userName,
          RUNTEXT:'',
          TOTAL_STEPS:liSequences.length,
          VARIANT_FLAG:'X',
          LEVEL:'E',
          SET : el.SET,
          SUB_STEP: el.SUB_STEP,
          MAIN_SET: el.MAIN_SET,
          RUNNING: 'FALSE',
          CREATED_DATE:  new Date().toISOString().slice(0, 10),
          CREATED_TIME: new Date().toTimeString().slice(0, 8)
                }
        aNewJobsData.push(obj);
      }
      await cds.run(INSERT.into("JS_JOB_TEMPLATEDETAILS").entries(aNewJobsData));

      var obj ={
        Type: "ACCEPTED",
        Description: "Started Processing  with job Name: " + jobName,
        statusCode: 202
      }
      if(isApplication == true){
        req.reply(obj);
      }
      else{ //Sending response for API
        res.send(obj);
      }
     
     
      var jobCount = liSequences.length;
      var iLoopIndex = 0;
      let mainJobID = 9999;

      var liJobs = await cds.run(
        `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
      WHERE "JOB_ID" = '` + mainJobID + `'
        AND "SEQUENCE_ID" = '` + sVariantName + `'        
        AND "JOB_NAME" ='` + CurrJobName + `'
      ORDER BY
      "STEP" ASC`
      );

      //Recursive Function for Jobs
      async function jobLoop(jobIndex, stepNumber,subdomain) {
        //For Latest Data if steps don't have SUBJOB_ID
        liSequences = await cds.run(
          `SELECT * FROM "JS_JOB_CREATIONDATA"
           WHERE "SEQUENCE_ID" = '` + sVariantName + `'
           ORDER BY
           "STEP" ASC`
        );

        var liJobs = await cds.run(
          `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
        WHERE "JOB_ID" = '` + mainJobID + `'
          AND "SEQUENCE_ID" = '` + sVariantName + `'          
        AND "JOB_NAME" ='` + CurrJobName + `'
        ORDER BY
        "STEP" ASC`
        );
        if(liJobs[jobIndex]['RUNNING'] == 'TRUE'){
          return;
        }
        await updateStatenew('TRUE',mainJobID,liJobs[jobIndex].TEMPLATE_ID,liJobs[jobIndex].ACTIVITY_ID,liJobs[jobIndex].STEP, sVariantName,CurrJobName);
        //Now Create jobs by step wise
        let jobName = liJobs[jobIndex].ACTIVITY_ID + " (" + mainJobID.toString() + ")" + "_" + new Date().getTime();//Setting Job Name and job Description same as ACTIVITY_ID

        let oStepData = '{}';
        if (liSequences[jobIndex].STEP_DATA) {
          oStepData = liSequences[jobIndex].STEP_DATA.toString();
        }
        let request = getModifiedreq(req, liSequences[jobIndex].ACTION_URL, JSON.parse(oStepData))

        var sDate = new Date().toISOString().split("T"),
              sTime = sDate[1].split(":");
            var schTime = sDate[0] + " " + sTime[0] + ":" + sTime[1] + " " + "+0000";

        //To set read job logs interval
        if (liSequences[jobIndex].ACTION_URL == "/pal/genPredictions") {
          iRefreshInterval = 30000 // 30seconds
          if (request.data?.vcRulesList && request.data?.vcRulesList?.length > 0) { //check for impact analysis
            if (request.data.vcRulesList[0].impactAnalysis == true) {
              iRefreshInterval = 60000 // 60 seconds
            }
          }
        }
          //Process Sales Order or Generate Forecast Order
          else if(liSequences[jobIndex].ACTION_URL == "/catalog/genUniqueID" || liSequences[jobIndex].ACTION_URL == "/catalog/genFullConfigDemand"){
            iRefreshInterval = 30000 // 30seconds
          }
        else {
          iRefreshInterval = 1000 // 1 Second
        }
        //To set job amd scheedule start time and end time
        var sDate = new Date().toISOString().split("T"),
          sTime = sDate[1].split(":");
        var schStartTime = sDate[0] + " " + sTime[0] + ":" + sTime[1] + " " + "+0000";
        var schTime2 = new Date().setHours(new Date().getHours() + 24);
        var sDate2 = new Date(schTime2).toISOString().split("T"),
          sTime2 = sDate2[1].split(":");
        var schEndTime = sDate2[0] + " " + sTime2[0] + ":" + sTime2[1] + " " + "+0000";

        var sCron = '';
        const obj = {
          action: liSequences[jobIndex].ACTION_URL+ '?host=' + subdomain,
          startTime: schStartTime,
          endTime: schEndTime,
          schedules: [{
            data: JSON.stringify(request.data),
            cron: sCron,
            time: schStartTime,
            active: true,
            startTime: schStartTime,
            endTime: schEndTime,
          }]
        }
        if (liSequences[jobIndex].ACTION_URL == "/catalog/postCIRQuantitiesToS4") {
          saveJobSnapshot(JSON.parse(oStepData), req);
        }
        createTemplateJobs(jobName, req, obj, baseUrl, liSequences[jobIndex].TEMPLATE_ID, liSequences[jobIndex].ACTIVITY_ID, liSequences[jobIndex].STEP,liSequences[jobIndex].SET).then(async el => {
          //After Job Creation, update SubJobID in JS_JOB_TEMPLATEDETAILS
          let templateObj = {
            jobID: 9999,
            TEMPLATE_ID: el.TEMPLATE_ID,
            ACTIVITY_ID: el.ACTIVITY_ID,
            ACTIVITY_STATUS: 'Pending',
            SCHEDULE_ID: el.scheduleID,
            SUBJOB_ID:el.jobID,
            STEP: el.STEP,
            SET: el.SET,
            SEQUENCE_ID: sVariantName,
            jobName: jobName,
            RUNTEXT: '',
            JOB_STARTTIME: null,
            JOB_ENDTIME: null,
            SCH_STARTTIME: null,
            SCH_ENDTIME: null,
          }
          await updateJobDetails(templateObj, CurrJobName);
          var jobInterval = setInterval(async () => {
            if (el) { //Read from Job Logs (lreadJobRunLogs),to get Job State
              var auth = await GenFunctions.getAuthorization();
              let sUrl = baseUrl + '/jobs/readJobRunLogs(jobId=' + el.jobID + ',scheduleId=' + "'" + el.scheduleID + "'" + ',page_size=' + 55 + ',offset=' + 0 + ')';
              var options = {
                'method': 'GET',
                'url': sUrl,
                'headers': {
                  'Accept': 'application/json',
                  'Accept-Charset': 'utf-8',
                  'Authorization': auth
                },
              };
              HTTPrequest(options, async function (error, response) {
                if (error) { //Stop execution                                
                  templateObj.ACTIVITY_STATUS = "Error"
                  await updateJobDetails(templateObj, CurrJobName);
                  await updateJobStatus('Error', templateObj,CurrJobName);
                  // await _updateJobs(req, false)
                  if(jobInterval){
                    clearInterval(jobInterval);
                    jobInterval = null; 
                  }
                } else { //Success
                  try {
                    if(jobInterval){
                    var oResponse = JSON.parse(response.body);
                    if(oResponse?.value?.length >0){
                    var oJobinfo = oResponse.value[0];
                    if (oJobinfo) {
                        if(await checkJobFeedStatus(mainJobID,CurrJobName) == false){//Job has error , stop the process
                                    clearInterval(jobInterval);
                                    jobInterval = null; 
                                  req.headers["x-sap-job-id"] = el.jobID;
                                  req.headers["x-sap-job-schedule-id"] = el.scheduleID;
                                  req.headers["x-sap-job-run-id"] = oJobinfo.runId;
                                 return  await GenFunctions.jobSchMessage('', `Job execution has stopped due to Internal Server Error.`, req);
                                  }
                      //Update JS_JOB_TEMPLATEDETAILS ACTIVITY_STATUS
                      const templateObj = {
                        jobID: 9999,
                        SEQUENCE_ID: sVariantName,
                        TEMPLATE_ID: el.TEMPLATE_ID,
                        ACTIVITY_ID: el.ACTIVITY_ID,
                        ACTIVITY_STATUS: '',
                        SCHEDULE_ID: el.scheduleID,
                        SUBJOB_ID:el.jobID,
                        STEP: el.STEP,
                        SET: el.SET,
                        jobName: jobName,
                        RUNTEXT: '',
                        JOB_STARTTIME: null,
                        JOB_ENDTIME: null,
                        SCH_STARTTIME: null,
                        SCH_ENDTIME: null
                      }
                      if (oJobinfo.runState == 'SUCCESS') {
                        clearInterval(jobInterval);
                        jobInterval = null; 
                        let runStr = oJobinfo.runText.replace(/'/g, '"');
                        if (runStr.length >= 5000) {
                          runStr = runStr.slice(0, 4995) + "...";
                        }
                        templateObj.RUNTEXT = runStr;
                        templateObj.ACTIVITY_STATUS = "Success";
                        templateObj.JOB_STARTTIME = oJobinfo.scheduleTimestamp;
                        templateObj.SCH_STARTTIME = oJobinfo.scheduleTimestamp;
                        templateObj.JOB_ENDTIME = oJobinfo.completionTimestamp;
                        templateObj.SCH_ENDTIME = oJobinfo.completionTimestamp;
                        templateObj.SCH_ENDTIME = oJobinfo.completionTimestamp;
                        liJobs[jobIndex].ACTIVITY_STATUS = "Success";

                        await updateJobDetails(templateObj, CurrJobName);

                        //Increment index to next Job
                        iLoopIndex++;
                        console.log("iLoopIndex" , iLoopIndex);

                        if (iLoopIndex < jobCount) { //Next jobs
                          var iNextStep = stepNumber + 1;
                          //Now check if previous step(s) are successful or not
                          var aData = await cds.run(`SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                               WHERE ( "JOB_NAME" = '${jobName}' )
                                 AND ( "STEP" < '${iNextStep}' );
                               `);
                               var aData1 = aData.filter(f => f.ACTIVITY_STATUS != "Success" && f.MANDATORY == 'X');//if error in mandatory set
                               if(liJobs[jobIndex].MANDATORY == 'X'){//if it is mandatory step, all previous steps must be completed
                                 aData1 = aData.filter(f => f.ACTIVITY_STATUS != "Success")
                               }
                                 if (aData1.length == 0) {//All previous steps are completed
                                        // var iMultiLoopIndex = iLoopIndex;
                                        // var iLoop = processMultiJobs(iJobLimit, liSequences, iLoopIndex);
                                        // for (var j = 0; j < iLoop; j++) {
                                        //   jobLoop(iMultiLoopIndex, stepNumber + iLoop);
                                        //   if (j < iLoop - 1) {
                                        //     iMultiLoopIndex++;
                                        //   }
                                        // }
                                        let iIndex = liJobs.findIndex(li=>li.STEP == iNextStep)
                                        if(iIndex!= -1 && liJobs[iIndex]?.MANDATORY == 'X'){//if current step is mandatory, previous steps must be completed
                                            let aCheck = aData.filter(f => f.ACTIVITY_STATUS == "Error");
                                            if(aCheck.length >0){//Error exists
                                              clearInterval(jobInterval);
                                              jobInterval = null; 
                                              return;
                                            }
                                        }
                                        
                                        liJobs[jobIndex].RUNNING = 'TRUE';
                                        // await updateState('TRUE',mainJobID,templateObj.TEMPLATE_ID,templateObj.ACTIVITY_ID,templateObj.STEP);
                                        var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex);
                                        console.log("iLoop1",JSON.stringify(iLoop))
                                        for (var j = 0; j < iLoop.length; j++) {
                                        jobLoop(iLoop[j].STEP -1, iLoop[j].STEP,subdomain);
                                        }
                          }
                        } else { //All jobs are finished and Successful,updating Job Status to Success
                          // updateJobStatus('Success',templateObj,CurrJobName);
                          var aData = await cds.run(`SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                            WHERE ( "JOB_NAME" = '${jobName}' );
                            `);

                            let error = aData.filter(el=> el.ACTIVITY_STATUS === "Error");

                            if(error.length > 0){
                              await updateJobStatus('Warning',templateObj,CurrJobName);
                            } else {
                              await updateJobStatus('Success',templateObj,CurrJobName);
                            }
                        }
                      } else if (oJobinfo.runState.toString().includes('ERROR')) { //Stop execution
                        clearInterval(jobInterval);
                        jobInterval = null; 
                        let runStr = oJobinfo.runText.replace(/'/g, '"');
                        if (runStr.length >= 5000) {
                          runStr = runStr.slice(0, 4995) + "...";
                        }
                        templateObj.RUNTEXT = runStr;
                        templateObj.ACTIVITY_STATUS = "Error";
                        templateObj.JOB_STARTTIME = oJobinfo.scheduleTimestamp;
                        templateObj.SCH_STARTTIME = oJobinfo.scheduleTimestamp;
                        templateObj.JOB_ENDTIME = oJobinfo.completionTimestamp;
                        templateObj.SCH_ENDTIME = oJobinfo.completionTimestamp;
                       await updateJobDetails(templateObj,CurrJobName);
                      //  await updateJobStatus('Error', templateObj,CurrJobName);
                        let iNextSetIndex = 0;
                              if(el.MANDATORY == 'X'){//if error in mandatory step, stop the job
                                iNextSetIndex = -1;
                              }
                              if(iNextSetIndex!=1){
                                iNextSetIndex = liJobs.findIndex(j=>j.SET == el.SET+1);
                              }
                              if(iNextSetIndex != -1){//Next Set/sub step exists, skip steps till next step start
                                console.log("setinfo -SET -STEP",el.SET,el.STEP)
                                for(var jIndex =0; jIndex < liJobs.length ; jIndex++){
                                  if(liJobs[jIndex].SET == el.SET  && liJobs[jIndex].STEP > el.STEP){
                                    liJobs[jIndex].RUNNING = 'TRUE';
                                    try {
                                      await UPDATE`JS_JOB_TEMPLATEDETAILS`
                                        .with({
                                          RUNNING: 'TRUE'
                                        })
                                        .where(`JOB_ID = '${mainJobID}'
                                              AND JOB_NAME = '${CurrJobName}'
                                              AND SET = '${liJobs[jIndex].SET}'
                                              AND STEP = '${liJobs[jIndex].STEP}'`);
                                
                                
                                    } catch (e) {
                                      //DONOTHING
                                    }
                                  }
                                }
                                iLoopIndex = iNextSetIndex;
                                    //Start next set
                                  liJobs[jobIndex].RUNNING = 'TRUE';
                                  // await updateState('TRUE',mainJobID,templateObj.TEMPLATE_ID,templateObj.ACTIVITY_ID,templateObj.STEP);
                                  var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex);
                                  if(iLoop.length > 0){
                                    await updateJobStatus('Pending', templateObj,CurrJobName);
                                  } else {
                                    var aData = await cds.run(`SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                      WHERE ( "JOB_NAME" = '${jobName}' );
                                      `);
          
                                      let success = aData.filter(el=> el.ACTIVITY_STATUS === "Success");
          
                                      if(success.length > 0){
                                        await updateJobStatus('Warning',templateObj,CurrJobName);
                                      } else {
                                        await updateJobStatus('Error',templateObj,CurrJobName);
                                      }
                                  }
                                  console.log("cIndex",JSON.stringify(iLoop))
                                  for (var j = 0; j < iLoop.length; j++) {
                                  jobLoop(iLoop[j].STEP -1, iLoop[j].STEP,subdomain);
                                  }
                              } else {
                                var aData = await cds.run(`SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                  WHERE ( "JOB_NAME" = '${jobName}' );
                                  `);
      
                                  let success = aData.filter(el=> el.ACTIVITY_STATUS === "Success");
      
                                  if(success.length > 0){
                                    await updateJobStatus('Warning',templateObj,CurrJobName);
                                  } else {
                                    await updateJobStatus('Error',templateObj,CurrJobName);
                                  }
                              }
                      }
                    }
                  }
                }
                  } catch (ex) {
                    let runStr = ex.message.toString().replace(/'/g, '"');
                    if (runStr.length >= 5000) {
                      runStr = runStr.slice(0, 4995) + "...";
                    }
                    templateObj.RUNTEXT = runStr;
                    templateObj.ACTIVITY_STATUS = "Error";
                   await updateJobDetails(templateObj, CurrJobName);
                   await updateJobStatus('Error', templateObj,CurrJobName);
                   if(jobInterval){
                    clearInterval(jobInterval);
                    jobInterval = null; 
                  }
                  }

                }
              });
            }
          }, iRefreshInterval); //Interval of 1 second
        })
          .catch(ex => {
            
          })
      }
      var iLoop = processMultiJobs(iJobLimit,liJobs , iLoopIndex);
      for (var j = 0; j < iLoop.length; j++) {
        jobLoop(iLoop[j].STEP -1, iLoop[j].STEP,req.data.domain);
      }
      async function checkJobFeedStatus(mainJobID,JOB_NAME){
          let aCheck = await cds.run(`SELECT JOB_STATUS FROM "JS_JOB_TEMPLATEDETAILS" WHERE JOB_ID='${mainJobID}' AND JOB_NAME='${JOB_NAME}'`);
          let bValid = true;
          if(aCheck && aCheck?.length >0){
            if(aCheck[0].JOB_STATUS == 'Error'){
              bValid = false;//stop reading logs
            }
          }
          else{//job does not exists, stop reading logs
            bValid = false;
          }
          return bValid;
        }

    }
    else {//Varaint doesn't exist
      var obj ={
        Type: "ERROR",
        Description: "Job Feed:" + sVariantName + " doesn't exist",
        statusCode: 400
      }
      if(isApplication == true){
        req.reply(obj);
      }
      else{ //Sending response for API
        res.send(obj);
      }
    }
    //
    function processMultiJobs(iJobLimit, liJobs, iLoopIndex) {
      // if (liJobs[iLoopIndex] && liJobs[iLoopIndex + 1]) {
      //   if (liJobs[iLoopIndex].ACTIVITY_ID == liJobs[iLoopIndex + 1].ACTIVITY_ID) {
      //     if (iJobLimit > 2) { //Check all next steps
      //       let iCount = 0,
      //         i = iLoopIndex,
      //         sActivity = liJobs[iLoopIndex].ACTIVITY_ID;
      //       while (i < iJobLimit + iLoopIndex) {
      //         if (liJobs[i]) {
      //           if (sActivity == liJobs[i].ACTIVITY_ID) {
      //             iCount++;
      //           } else {
      //             break;
      //           }
      //         } else {
      //           break;
      //         }
      //         i++;
      //       }
      //       return iCount;
      //     } else {
      //       return iJobLimit;
      //     }
      //   } else { //Next activity is not same
      //     return 1;
      //   }
      // } else { //Next job doesn't exist, create only 1 normal sequence instead of parallel
      //   return 1;
      // }

      // //if Any of Previous steps is mandatory and its error or not triggered- Don't create next jobs
        if(liJobs.filter(j=>j.MANDATORY == 'X' && Math.round(j.STEP) <  Math.round(liJobs[iLoopIndex].STEP) && 
        (j.ACTIVITY_STATUS == 'Error' || j.ACTIVITY_STATUS == null  || j.ACTIVITY_STATUS == '' || j.ACTIVITY_STATUS =='Not Triggered' )).length >0){
          return []
        }
        if (liJobs[iLoopIndex] && liJobs[iLoopIndex + 1]) {
          if(liJobs[iLoopIndex]?.MANDATORY == 'X'){//Run one SET at a time if its a mandatory SET
            //if any previous steps has error, check here
            if(liJobs.findIndex(f=>f.ACTIVITY_STATUS == 'Error' && Math.round(f.STEP) <  Math.round(liJobs[iLoopIndex].STEP)) == -1){
              return [
                {
                  "STEP":liJobs[iLoopIndex].STEP
                }
              ];
            }
            else{
              return []
            }
           
          }
          else if(iJobLimit > 1){
            let aSets = liJobs.filter(f=>f.MAIN_SET == liJobs[iLoopIndex].MAIN_SET &&  Math.round(f.STEP) >=   Math.round(liJobs[iLoopIndex].STEP) && f.RUNNING == 'FALSE' );
            var aMultiSteps = [];
            for(var s =0; s < aSets.length; s++){
              if(aMultiSteps.findIndex(m=>m.SET == aSets[s].SET ) == -1 ){
                //If previous step is not success, dont push it into below arra
                let aPreviousStep = liJobs.find(f=>f.MAIN_SET == liJobs[iLoopIndex].MAIN_SET && f.SET ==  liJobs[iLoopIndex].SET && f.STEP == (Math.round(liJobs[iLoopIndex].STEP) - 1) );
                if(aPreviousStep){//previous step exists, check if its success or not
                 if(aPreviousStep?.ACTIVITY_STATUS == 'Success'){
                  aMultiSteps.push({
                    "SET":aSets[s].SET,
                    "STEP":aSets[s].STEP
                  })
                 }
                }
                else{
                  aMultiSteps.push({
                    "SET":aSets[s].SET,
                    "STEP":aSets[s].STEP
                  })
                }
               
              }
            }
          return aMultiSteps;
          }
          else{
            return [
              {
                "STEP":liJobs[iLoopIndex].STEP
              }
            ]
          }
        }
        else {//Next job doesn't exist, create only 1 normal sequence instead of parallel
          if(liJobs[iLoopIndex]?.MANDATORY == 'X'){//Run one SET at a time if its a mandatory SET
            //if any previous steps has error, check here
            if(liJobs.findIndex(f=>f.ACTIVITY_STATUS == 'Error' && Math.round(f.STEP) <  Math.round(liJobs[iLoopIndex].STEP)) == -1){
              return [
                {
                  "STEP":liJobs[iLoopIndex].STEP
                }
              ];
            }
            else{
              return []
            }
           
          }
          else{
            return [
              {
                "STEP":liJobs[iLoopIndex].STEP
              }
            ]
          }
        }

    }

    async function updateStatenew(Flag,mainJobID,TEMPLATE_ID,ACTIVITY_ID,STEP,SEQUENCE_ID,JOB_NAME){
      try {
        await UPDATE`JS_JOB_TEMPLATEDETAILS`
          .with({
            RUNNING: Flag
          })
          .where(`JOB_ID = '${mainJobID}'
                AND TEMPLATE_ID = '${TEMPLATE_ID}'
                AND JOB_NAME = '${JOB_NAME}'
                AND ACTIVITY_ID = '${ACTIVITY_ID}'
                AND SEQUENCE_ID = '${SEQUENCE_ID}'
                AND STEP = '${STEP}'`);
  
  
      } catch (e) {
        //DONOTHING
      }
    }
    async function saveJobSnapshot(oSnapData, req) {
      //Call Snapshot function if SnapShot is not empty
      try {
        if (oSnapData.SnapShot) {
          let hostName = req.headers.host;
          var snapShotURL = "";
          if (hostName.includes("localhost:4004")) {
            snapShotURL = lbaseUrl + '/v2/catalog/maintainSnapShot';
          } else {
            let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
            snapShotURL = baseUrl + '/v2/catalog/maintainSnapShot';
          }
          const HTTPReq = require('https');
          // Define the URL and parameters
          const queryParams = {
            SNAPSHOT_DESC: oSnapData.SnapShot_Desc,
            Mode: oSnapData.SnapShot,
            FROM_DATE: oSnapData.FROM_DATE,
            TO_DATE: oSnapData.TO_DATE,
            VERSION: oSnapData.VERSION
          };
          const url = `${snapShotURL}?${new URLSearchParams(queryParams)}`;
          var auth = await GenFunctions.getAuthorization();
          const options = {
            headers: {
              'Authorization': auth
            }
          };
          // Make the GET request
          HTTPReq.get(url, options, (_response) => { }).on('error', (error) => {
            console.log(`Error: ${error.message}`);
          });
        }
      } catch (ex) {
        console.log(ex);
      }
    }

    function createTemplateJobs(jobName, req, jobData, baseUrl, TEMPLATE_ID, ACTIVITY_ID, STEP,SET) {
      return new Promise((resolve, reject) => {
        const scheduler = getJobscheduler(req);
        var inputData = jobData;
        let actionUrl = baseUrl + inputData.action;
        if (scheduler) {
          var myJob = {
            name: jobName+"_" + new Date().getTime(),
            description: jobName+"_" + new Date().getTime(),
            action: actionUrl,
            active: true,
            httpMethod: "POST",
            startTime: inputData.startTime,
            endTime: inputData.endTime,
            ansConfig: {
              "onError": true,
              "onSuccess": false
              },
            schedules: inputData.schedules
          };
          var scJob = {
            job: myJob
          };
          scheduler.createJob(scJob, function (err, result) {
            if (err) {
              reject(req.error(err.message));
            } else { // job was created successfully,returning JobID and scheduler ID
              resolve({
                "jobID": result._id,
                "scheduleID": result.schedules[0].scheduleId,
                "TEMPLATE_ID": TEMPLATE_ID,
                "ACTIVITY_ID": ACTIVITY_ID,
                "STEP": STEP,
                "SET" : SET
              });
            }
          });
        }
      })
    }
    async function updateJobDetails(data,CurrJobName) {
      try {
        await UPDATE`JS_JOB_TEMPLATEDETAILS`
          .with({
            JOB_ID: data.jobID,
            SUBJOB_ID: data.SUBJOB_ID,
            ACTIVITY_STATUS: data.ACTIVITY_STATUS,
            SCHEDULE_ID: data.SCHEDULE_ID,
            RUNTEXT: data.RUNTEXT,
            JOB_STARTTIME: data.JOB_STARTTIME,
            JOB_ENDTIME: data.JOB_ENDTIME,
            SCH_STARTTIME: data.SCH_STARTTIME,
            SCH_ENDTIME: data.SCH_ENDTIME
          })
          .where(`TEMPLATE_ID = '${data.TEMPLATE_ID}'
                 AND ACTIVITY_ID = '${data.ACTIVITY_ID}'
                 AND JOB_NAME = '${CurrJobName}'
                 AND SEQUENCE_ID = '${data.SEQUENCE_ID}'
                 AND STEP = '${data.STEP}'`);

      } catch (e) {
        //DONOTHING
        console.log("error to update", e)

      }
    }
    async function updateJobStatus(JOB_STATUS,data,CurrJobName) {
      try {
        await UPDATE`JS_JOB_TEMPLATEDETAILS`
          .with({
            JOB_STATUS: JOB_STATUS
          })
          .where(` JOB_NAME = '${CurrJobName}'`);

      } catch (e) {
        //DONOTHING
      }
      try{
        const id = {
          JOb_NAME:data.SEQUENCE_ID,
          REQ_TYPE: "CREATE"
        };
      
        const newValue = {
          STATUS: JOB_STATUS
        };
            // let baseUrl1 = "https://" + getBaseUrl() + `/catalog/Config_Job_Status/${id.JOb_NAME}/${id.REQ_TYPE}`
            baseUrl1="https://sbpmtt-dev-vcplanner-mt-srv.cfapps.us10-001.hana.ondemand.com" + `/catalog/Config_Job_Status/${id.JOb_NAME}/${id.REQ_TYPE}`
              let newBaseUrl = baseUrl1.replace('vcplanner-mt', 'cap-servs-mt');
              const axios = require("axios");
                await axios.put(
                  newBaseUrl,
                    newValue,
                    {
                      auth: {
                        username: 'vcpsteelcase',
                        password: 'sbpcorp'
                      }
                    }
                );
              
      }
      catch(ex){
        console.log("cap_servslog",ex.message);
      }
    }
  }
  
  srv.on("getJobFeedLog", async (req) => {
    var sQuery = `SELECT 
    "JOB_NAME" AS "jobName",
  "TEMPLATE_ID" AS "Template",
  "ACTIVITY_ID" AS "Activity",
  "STEP" AS "Step",
  "ACTIVITY_STATUS" AS "stepStatus",
  "JOB_STATUS" AS "jobStatus",
  REPLACE("RUNTEXT", '\\', '') AS "Log"
  FROM "JS_JOB_TEMPLATEDETAILS"
  WHERE "VARIANT_FLAG" = 'X'  `;

  if(req.data.jobName){
    sQuery += `AND "JOB_NAME" = '${req.data.jobName}' ORDER BY "STEP" ASC`
  }
  else{
    sQuery += ` ORDER BY "JOB_NAME","STEP" ASC`;
  }
  
    var aJobData = await cds.run(sQuery);
    if (aJobData.length == 0) {
      const obj = {
        jobFeed: req.data.jobName,
        Log: 'No Logs exists for JobFeed: ' + req.data.jobName
      }
      aJobData.push(obj)
    }
    return aJobData;
  })

  srv.on("getJobFeedData", async (req) => {
    var sQuery = `SELECT 
    "VARIANT_NAME" AS "Variant",
    "VARIANT_NAME" AS "JobTemplateName",
    "TEMPLATE_DESC" AS "JobTemplateText"
      FROM "JS_TEMPLATE_HEADER"
      WHERE "VARIANT_NAME" != 'NA'  `;

      var aJobData = await cds.run(sQuery);
      
        return aJobData;
  })

  ///Function to getPredictions
  srv.on("getPredictionNew", async(req) =>{
  let loc = req.data.LOCATION_ID
  let prod = req.data.PRODUCT_ID
  let Ver = req.data.VERSION
  let Scen = req.data.SCENARIO
  let ModelVer = req.data.MODEL_VERSION
  let CAL_DATE = req.data.CAL_DATE
  let ValidFrom = CAL_DATE.split("--")[0]
  let ValidTo = CAL_DATE.split("--")[1]
  let sQuery = `SELECT * FROM "CP_TS_PREDICTIONS"
  WHERE "LOCATION_ID"='${loc}'
  AND "PRODUCT_ID"='${prod}'
  AND "VERSION"='${Ver}'
  AND "SCENARIO"='${Scen}'
  AND "MODEL_VERSION"='${ModelVer}'
  AND "CAL_DATE">='${ValidFrom}'
  AND "CAL_DATE"<='${ValidTo}'`;
  return JSON.stringify(await cds.run(sQuery))
})

    ///#region Job created by Sets
    srv.on("ParallelSetjobsCreation_old", async (req) => {
      let hostName = req.headers.host;
      var baseUrl = lbaseUrl;
      var iRefreshInterval = 1000 //1 Second
      if (hostName.includes("localhost:4004") == false) {//For Deployment
        baseUrl = req.headers['x-forwarded-proto'] + '://' + req.headers.host;
      }
      var iJobLimit = 1;
      var aPreferences = await cds.run(
        `SELECT * FROM "CP_USER_PREFERENCES"
      WHERE "PARAMETER" = 'PARALLEL_JOBS'`
      );
      if (aPreferences.length > 0) {
        iJobLimit = parseInt(aPreferences[0].PARAMETER_VALUE);
      }
      var sequence = JSON.parse(req.data.JOBDATA);
      //Getting all the data of all Activities based on sequence_ID 
      var liSequences = await cds.run(
        `SELECT * FROM "JS_JOB_CREATIONDATA"
      WHERE "SEQUENCE_ID" = '` + sequence + `'
      ORDER BY 
      "STEP" ASC`
      );
      if (liSequences.length > 0) {
        var HTTPrequest = require('request');
        // req.headers['x-sap-job-id'] = 2292707;
        //Get Job Details from JS_JOB_TEMPLATEDETAILS 
        var liJobs = await cds.run(
          `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
        WHERE "SEQUENCE_ID" = '` + sequence + `'
        ORDER BY 
        "STEP" ASC`
        );
        if (liJobs.length > 0) {
        var mainJobID = liJobs[0].JOB_ID;
          var jobCount = liJobs.length;
          var iLoopIndex = 0;
          //Making all jobs as running False in case of crash scenario
          try {
            await UPDATE`JS_JOB_TEMPLATEDETAILS`
              .with({
                RUNNING: 'FALSE',
                JOB_STATUS: 'Pending'
              })
              .where(`JOB_ID = '${mainJobID}'`);
      
      
          } catch (e) {
            //DONOTHING
          }
          //Recursive Function for Jobs
          async function jobLoop(jobIndex, stepNumber) {
            //For Latest Data if steps don't have SUBJOB_ID
            liSequences = await cds.run(
              `SELECT * FROM "JS_JOB_CREATIONDATA"
            WHERE "SEQUENCE_ID" = '` + sequence + `'
            ORDER BY
            "STEP" ASC`
            );
    
            liJobs = await cds.run(
              `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
            WHERE "JOB_ID" = '` + mainJobID + `'
            ORDER BY
            "STEP" ASC`
            );
            if(liJobs[jobIndex]['RUNNING'] == 'TRUE'){
              return;
            }
            await updateState('TRUE',mainJobID,liJobs[jobIndex].TEMPLATE_ID,liJobs[jobIndex].ACTIVITY_ID,liJobs[jobIndex].STEP);
            //Now Create jobs by step wise
            let jobName = liJobs[jobIndex].ACTIVITY_ID + " (" + mainJobID.toString() + ")" + "_" + new Date().getTime();//Setting Job Name and job Description same as ACTIVITY_ID
    
            let oStepData = '{}';
            if (liSequences[jobIndex].STEP_DATA) {
              oStepData = liSequences[jobIndex].STEP_DATA.toString();
            }
            let request = getModifiedreq(req, liSequences[jobIndex].ACTION_URL, JSON.parse(oStepData))
    
            var sDate = new Date().toISOString().split("T"),
              sTime = sDate[1].split(":");
            var schTime = sDate[0] + " " + sTime[0] + ":" + sTime[1] + " " + "+0000";

            var schTime2 = new Date().setHours(new Date().getHours() + 6);
              var sDate2 = new Date(schTime2).toISOString().split("T"),
                sTime2 = sDate2[1].split(":");
              var schEndTime = sDate2[0] + " " + sTime2[0] + ":" + sTime2[1] + " " + "+0000";

              var jobendTime = new Date(liJobs[jobIndex].JOB_ENDTIME);

              if(new Date() > jobendTime){
                var jobETime = new Date(jobendTime).setDate(new Date().getDate() + 1);
              } else {
                var jobETime = jobendTime;
              }

              var EndDate = new Date(jobETime);

              var padL = (nr, _len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
              var JEndDate =
                    `${EndDate.getFullYear()}-${padL(EndDate.getMonth() + 1)}-${padL(EndDate.getDate())} ${padL(EndDate.getHours())}:${padL(EndDate.getMinutes())}:${padL(EndDate.getSeconds())}` + ".000000000"
              var SStartDate =
                    `${new Date().getFullYear()}-${padL(new Date().getMonth() + 1)}-${padL(new Date().getDate())} ${padL(new Date().getHours())}:${padL(new Date().getMinutes())}:${padL(new Date().getSeconds())}` + ".000000000"
                var SEndDate =
                `${new Date(schTime2).getFullYear()}-${padL(new Date(schTime2).getMonth() + 1)}-${padL(new Date(schTime2).getDate())} ${padL(sTime2[0])}:${padL(sTime2[1])}:${padL(sTime2[2].split(".")[0])}` + ".000000000"

          console.log("Schedule start time", SStartDate);
          console.log("Schedule end time", SEndDate);
            //To set read job logs interval
            if (liSequences[jobIndex].ACTION_URL == "/pal/genPredictions") {
              iRefreshInterval = 30000 // 30seconds
              if (request.data?.vcRulesList && request.data?.vcRulesList?.length > 0) {//check for impact analysis
                if (request.data.vcRulesList[0].impactAnalysis == true) {
                  iRefreshInterval = 60000// 60 seconds
                }
              }
            }
            //Process Sales Order or Generate Forecast Order
            else if(liSequences[jobIndex].ACTION_URL == "/catalog/genUniqueID" || liSequences[jobIndex].ACTION_URL == "/catalog/genFullConfigDemand"){
              iRefreshInterval = 1000 // 30seconds
            }
            else {
              iRefreshInterval = 1000 // 1 Second
            }
            // try{
            //   var oResponse = await GenFunctions.getCpuUsage();
            //   console.log("cpuUsage"+JSON.stringify(oResponse));
            // }
            // catch(ex){
            //   console.log("cpuerror"+ex);
            // }
            if (liJobs[jobIndex].SUBJOB_ID) {//Already exists,add schedule
              // var schTime2 = new Date().setHours(new Date().getHours() + 1);
              // var sDate2 = new Date(schTime2).toISOString().split("T"),
              //   sTime2 = sDate2[1].split(":");
              // var schEndTime = sDate2[0] + " " + sTime2[0] + ":" + sTime2[1] + " " + "+0000";
    
              if (liSequences[jobIndex].ACTION_URL == "/catalog/postCIRQuantitiesToS4") {
                saveJobSnapshot(JSON.parse(oStepData), req);
              }
    
              addJobScheduleFn(schTime, schEndTime, JSON.stringify(request.data), liJobs[jobIndex].SUBJOB_ID,
                liJobs[jobIndex].TEMPLATE_ID, liJobs[jobIndex].ACTIVITY_ID, liJobs[jobIndex].STEP, req,liJobs[jobIndex].SET)
                .then(async el => {
                  //After Schedule Creation, update SubJobID in JS_JOB_TEMPLATEDETAILS
                  let templateObj = {
                    mainJobID: mainJobID,
                    jobID: el.jobID,
                    TEMPLATE_ID: el.TEMPLATE_ID,
                    ACTIVITY_ID: el.ACTIVITY_ID,
                    ACTIVITY_STATUS: 'Pending',
                    JOB_STATUS: 'Pending',
                    SCHEDULE_ID: el.scheduleID,
                    STEP: el.STEP,
                    JOB_ENDTIME: JEndDate,
                    SCH_STARTTIME: SStartDate,
                    SCH_ENDTIME:SEndDate
                  }
                 await updateJobDetails(templateObj);
                  var jobInterval = setInterval(async () => {
                    if (el) {//Read from Job Logs (lreadJobRunLogs),to get Job State
                      var auth = await GenFunctions.getAuthorization();
                      let sUrl = baseUrl + '/jobs/readJobRunLogs(jobId=' + el.jobID + ',scheduleId=' + "'" + el.scheduleID + "'" + ',page_size=' + 55 + ',offset=' + 0 + ')';
                      var options = {
                        'method': 'GET',
                        'url': sUrl,
                        'headers': {
                          'Accept': 'application/json',
                          'Accept-Charset': 'utf-8',
                          'Authorization': auth
                        },
                      };
                      HTTPrequest(options, async function (error, response) {
                        if (error) {//Stop execution                                 
                          templateObj.ACTIVITY_STATUS = "Error"
                          await updateJobDetails(templateObj);
                          await updateJobStatus('Error', mainJobID);
                          if(jobInterval){
                            clearInterval(jobInterval);
                            jobInterval = null; 
                          }
                        }
                        else {//Success
                          try {
                            if(jobInterval){
                            var oResponse = JSON.parse(response.body);
                            if(oResponse?.value?.length >0){
                            var oJobinfo = oResponse.value[0];
                            if (oJobinfo) {
                              //Update JS_JOB_TEMPLATEDETAILS ACTIVITY_STATUS
                              const templateObj = {
                                mainJobID: mainJobID,
                                jobID: el.jobID,
                                TEMPLATE_ID: el.TEMPLATE_ID,
                                ACTIVITY_ID: el.ACTIVITY_ID,
                                ACTIVITY_STATUS: '',
                                JOB_STATUS: 'Pending',
                                SCHEDULE_ID: el.scheduleID,
                                STEP: el.STEP,
                                JOB_ENDTIME: JEndDate,
                                SCH_STARTTIME: SStartDate,
                                SCH_ENDTIME:SEndDate
                              }
                              if (oJobinfo.runState == 'SUCCESS') {
                                  clearInterval(jobInterval);
                                  jobInterval = null; 
                                templateObj.ACTIVITY_STATUS = "Success"
                                liJobs[jobIndex].ACTIVITY_STATUS = "Success"
                                await updateJobDetails(templateObj);
                                //Increment index to next Job
                                iLoopIndex++;
                                if (iLoopIndex < jobCount) {//Next jobs
                                  var iNextStep = stepNumber + 1;
                                  //Now check if previous step(s) are successful or not
                                  var aData = await cds.run(`SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                  WHERE ( "JOB_ID" = '${mainJobID}' )
                                    AND ( "STEP" < '${iNextStep}' );
                                  `);
                                  var aData1 = aData.filter(f => f.ACTIVITY_STATUS != "Success" && f.MANDATORY == 'X');//if error in mandatory set
  
                                  if(liJobs[jobIndex].MANDATORY == 'X'){//if it is mandatory step, all previous steps must be completed
                                    aData1 = aData.filter(f => f.ACTIVITY_STATUS != "Success")
                                  }
                                    if (aData1.length == 0) {//All previous steps are completed
                                      let iIndex = liJobs.findIndex(li=>li.STEP == iNextStep)
                                      if(iIndex!= -1 && liJobs[iIndex]?.MANDATORY == 'X'){//if current step is mandatory, previous steps must be completed
                                          let aCheck = aData.filter(f => f.ACTIVITY_STATUS == "Error");
                                          if(aCheck.length >0){//Error exists
                                              clearInterval(jobInterval);
                                              jobInterval = null; 
                                            return;
                                          }
                                      }
                                      liJobs[jobIndex].RUNNING = 'TRUE';
                                      // await updateState('TRUE',mainJobID,templateObj.TEMPLATE_ID,templateObj.ACTIVITY_ID,templateObj.STEP);
                                      var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex);
                                      console.log("iLoop1",JSON.stringify(iLoop))
                                      for (var j = 0; j < iLoop.length; j++) {
                                      jobLoop(iLoop[j].STEP -1, iLoop[j].STEP);
                                      }
                                    }
                                }
                                else {//All jobs are finished and Successful,updating Job Status to Success
                                  // await updateJobStatus('Success', mainJobID);
                                  let aData = await cds.run(
                                    `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                  WHERE "JOB_ID" = '` + mainJobID + `'
                                  ORDER BY
                                  "STEP" ASC`
                                  );
        
                                    let error = aData.filter(el=> el.ACTIVITY_STATUS === "Error");
                                    if(error.length > 0){
                                      await updateJobStatus('Warning',mainJobID);
                                    } else {
                                      await updateJobStatus('Success', mainJobID);
                                    }
                                }
                              }
                              else if (oJobinfo.runState.toString().includes('ERROR')) {//Stop execution
                                clearInterval(jobInterval);
                                jobInterval = null; 
                                templateObj.ACTIVITY_STATUS = "Error";
                                liJobs[jobIndex].ACTIVITY_STATUS = "Error"
                                await updateJobDetails(templateObj);
                                // await updateJobStatus('Error', mainJobID);
                                let iNextSetIndex = 0;
                                if(el.MANDATORY == 'X'){//if error in mandatory step, stop the job
                                  iNextSetIndex = -1;
                                }
  
                                if(iNextSetIndex!=1){
                                  iNextSetIndex = liJobs.findIndex(j=>j.SET == el.SET+1);
                                }
                                if(iNextSetIndex != -1){//Next Set/sub step exists, skip steps till next step start
  
                                  console.log("setinfo -SET -STEP",el.SET,el.STEP)
                                  for(var jIndex =0; jIndex < liJobs.length ; jIndex++){
                                    if(liJobs[jIndex].SET == el.SET  && liJobs[jIndex].STEP > el.STEP){
                                      liJobs[jIndex].RUNNING = 'TRUE';
                                      try {
                                        await UPDATE`JS_JOB_TEMPLATEDETAILS`
                                          .with({
                                            RUNNING: 'TRUE'
                                          })
                                          .where(`JOB_ID = '${mainJobID}'
                                                AND SET = '${liJobs[jIndex].SET}'
                                                AND STEP = '${liJobs[jIndex].STEP}'`);
                                  
                                  
                                      } catch (e) {
                                        //DONOTHING
                                      }
                                    }
                                  }
                                  iLoopIndex = iNextSetIndex;
                                      //Start next set
                                    liJobs[jobIndex].RUNNING = 'TRUE';
                                    // await updateState('TRUE',mainJobID,templateObj.TEMPLATE_ID,templateObj.ACTIVITY_ID,templateObj.STEP);
                                    var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex);
                                    console.log("cIndex",JSON.stringify(iLoop))

                                    if(iLoop.length > 0){
                                      await updateJobStatus('Pending', mainJobID);
                                    } 
                                    else{
                                      let aData = await cds.run(
                                        `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                      WHERE "JOB_ID" = '` + mainJobID + `'
                                      ORDER BY
                                      "STEP" ASC`
                                      );
                                      let success = aData.filter(el=> el.ACTIVITY_STATUS === "Success");
          
                                      if(success.length > 0){
                                        await updateJobStatus('Warning',mainJobID);
                                      } else {
                                        await updateJobStatus('Error',mainJobID);
                                      }
                                    }
                                    for (var j = 0; j < iLoop.length; j++) {
                                    jobLoop(iLoop[j].STEP -1, iLoop[j].STEP);
                                    }
                                }
                                else{
                                  let aData = await cds.run(
                                    `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                  WHERE "JOB_ID" = '` + mainJobID + `'
                                  ORDER BY
                                  "STEP" ASC`
                                  );
                                  let success = aData.filter(el=> el.ACTIVITY_STATUS === "Success");
      
                                  if(success.length > 0){
                                    await updateJobStatus('Warning',mainJobID);
                                  } else {
                                    await updateJobStatus('Error',mainJobID);
                                  }
                                }
    
                              }
                            }
                          }
                          }
                        }
                          catch (ex) {
                            templateObj.ACTIVITY_STATUS = "Error";
                            await updateJobDetails(templateObj);
                            await updateJobStatus('Error', mainJobID);
                            console.log("err" + ex.message)
                            if(jobInterval){
                              clearInterval(jobInterval);
                              jobInterval = null; 
                            }
                          }
    
                        }
                      });
                    }
                  }, iRefreshInterval);//Interval of 1 second
                })
                .catch(ex => {
    
                })
            }
            else {
              var sCron = '', STime = schTime;
              const obj = {
                action: liSequences[jobIndex].ACTION_URL,
                startTime: liJobs[jobIndex].JOB_STARTTIME,
                endTime: liJobs[jobIndex].JOB_ENDTIME,
                schedules: [
                  {
                    data: JSON.stringify(request.data),
                    cron: sCron,
                    time: STime,
                    active: true,
                    // startTime: liJobs[jobIndex].SCH_STARTTIME,
                    // endTime: liJobs[jobIndex].SCH_ENDTIME,
                    startTime: schTime,
                    endTime: schEndTime,
                  }
                ]
              }
              if (liSequences[jobIndex].ACTION_URL == "/catalog/postCIRQuantitiesToS4") {
                saveJobSnapshot(JSON.parse(oStepData), req);
              }
              createTemplateJobs(jobName, req, obj, baseUrl, liJobs[jobIndex]).then(async el => {
                //After Job Creation, update SubJobID in JS_JOB_TEMPLATEDETAILS
                let templateObj = {
                  mainJobID: mainJobID,
                  jobID: el.jobID,
                  TEMPLATE_ID: el.TEMPLATE_ID,
                  ACTIVITY_ID: el.ACTIVITY_ID,
                  ACTIVITY_STATUS: 'Pending',
                  SCHEDULE_ID: el.scheduleID,
                  STEP: el.STEP,                  
                  JOB_ENDTIME: JEndDate,
                  SCH_STARTTIME: SStartDate,
                  SCH_ENDTIME:SEndDate

                }
                console.log("templateObj", templateObj);
                await updateJobDetails(templateObj);
                var jobInterval = setInterval(async () => {
                  if (el) {//Read from Job Logs (lreadJobRunLogs),to get Job State
                    var auth = await GenFunctions.getAuthorization();
                    let sUrl = baseUrl + '/jobs/readJobRunLogs(jobId=' + el.jobID + ',scheduleId=' + "'" + el.scheduleID + "'" + ',page_size=' + 55 + ',offset=' + 0 + ')';
                    var options = {
                      'method': 'GET',
                      'url': sUrl,
                      'headers': {
                        'Accept': 'application/json',
                        'Accept-Charset': 'utf-8',
                        'Authorization': auth
                      },
                    };
                    HTTPrequest(options, async function (error, response) {
                      if (error) {//Stop execution                                 
                        templateObj.ACTIVITY_STATUS = "Error"
                        await updateJobDetails(templateObj);
                        await updateJobStatus('Error', mainJobID);
                        if(jobInterval){
                          clearInterval(jobInterval);
                          jobInterval = null; 
                        }
                      }
                      else {//Success
                        try {
                          if(jobInterval){
                            var oResponse = JSON.parse(response.body);
                            if(oResponse?.value?.length >0){
                            var oJobinfo = oResponse.value[0];
                            if (oJobinfo) {
                              //Update JS_JOB_TEMPLATEDETAILS ACTIVITY_STATUS
                              const templateObj = {
                                mainJobID: mainJobID,
                                jobID: el.jobID,
                                TEMPLATE_ID: el.TEMPLATE_ID,
                                ACTIVITY_ID: el.ACTIVITY_ID,
                                ACTIVITY_STATUS: '',
                                SCHEDULE_ID: el.scheduleID,
                                STEP: el.STEP,
                                JOB_ENDTIME: JEndDate,
                                SCH_STARTTIME: SStartDate,
                                SCH_ENDTIME:SEndDate
                              }
                              if (oJobinfo.runState == 'SUCCESS') {
                                console.log('Current Step',el.STEP)
                                  clearInterval(jobInterval);
                                  jobInterval = null; 
                                templateObj.ACTIVITY_STATUS = "Success"
                                liJobs[jobIndex].ACTIVITY_STATUS = "Success"
                                await updateJobDetails(templateObj);
                                //Increment index to next Job
                                iLoopIndex++;
                                if (iLoopIndex < jobCount) {//Next jobs
                                  var iNextStep = stepNumber + 1;
                                  //Now check if previous step(s) are successful or not
                                  var aData = await cds.run(`SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                  WHERE ( "JOB_ID" = '${mainJobID}' )
                                    AND ( "STEP" < '${iNextStep}' );
                                  `);
                                  var aData1 = aData.filter(f => f.ACTIVITY_STATUS != "Success" && f.MANDATORY == 'X');//if error in mandatory set
  
                                  if(liJobs[jobIndex].MANDATORY == 'X'){//if it is mandatory step, all previous steps must be completed
                                    aData1 = aData.filter(f => f.ACTIVITY_STATUS != "Success")
                                  }
                                    if (aData1.length == 0) {//All previous steps are completed
                                      let iIndex = liJobs.findIndex(li=>li.STEP == iNextStep)
                                      if(iIndex!= -1 && liJobs[iIndex]?.MANDATORY == 'X'){//if current step is mandatory, previous steps must be completed
                                          let aCheck = aData.filter(f => f.ACTIVITY_STATUS == "Error");
                                          if(aCheck.length >0){//Error exists
                                              clearInterval(jobInterval);
                                              jobInterval = null; 
                                            return;
                                          }
                                      }
                                      liJobs[jobIndex].RUNNING = 'TRUE';
                                      // await updateState('TRUE',mainJobID,templateObj.TEMPLATE_ID,templateObj.ACTIVITY_ID,templateObj.STEP);
                                      var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex);
                                      console.log("iLoop1",JSON.stringify(iLoop))
                                      for (var j = 0; j < iLoop.length; j++) {
                                      jobLoop(iLoop[j].STEP -1, iLoop[j].STEP);
                                      }
                                    }
                                }
                                else {//All jobs are finished and Successful,updating Job Status to Success
                                  // await updateJobStatus('Success', mainJobID);
                              
                                  let aData = await cds.run(
                                    `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                  WHERE "JOB_ID" = '` + mainJobID + `'
                                  ORDER BY
                                  "STEP" ASC`
                                  );

                                    let error = aData.filter(el=> el.ACTIVITY_STATUS === "Error");
                                    if(error.length > 0){
                                      await updateJobStatus('Warning',mainJobID);
                                    } else {
                                      await updateJobStatus('Success', mainJobID);
                                    }

                                }
                              }
                              else if (oJobinfo.runState.toString().includes('ERROR')) {
                                  clearInterval(jobInterval);
                                  jobInterval = null; 
                                templateObj.ACTIVITY_STATUS = "Error";
                                liJobs[jobIndex].ACTIVITY_STATUS = "Error"
                                await updateJobDetails(templateObj);
                                // await updateJobStatus('Error', mainJobID);
                                let iNextSetIndex = 0;
                                if(el.MANDATORY == 'X'){//if error in mandatory step, stop the job
                                  iNextSetIndex = -1;
                                }
  
                                if(iNextSetIndex!=1){
                                  iNextSetIndex = liJobs.findIndex(j=>j.SET == el.SET+1);
                                }
                                if(iNextSetIndex != -1){//Next Set/sub step exists, skip steps till next step start
  
                                  console.log("setinfo -SET -STEP",el.SET,el.STEP)
                                  for(var jIndex =0; jIndex < liJobs.length ; jIndex++){
                                    if(liJobs[jIndex].SET == el.SET  && liJobs[jIndex].STEP > el.STEP){
                                      liJobs[jIndex].RUNNING = 'TRUE';
                                      try {
                                        await UPDATE`JS_JOB_TEMPLATEDETAILS`
                                          .with({
                                            RUNNING: 'TRUE'
                                          })
                                          .where(`JOB_ID = '${mainJobID}'
                                                AND SET = '${liJobs[jIndex].SET}'
                                                AND STEP = '${liJobs[jIndex].STEP}'`);
                                  
                                  
                                      } catch (e) {
                                        //DONOTHING
                                      }
                                    }
                                  }
                                  iLoopIndex = iNextSetIndex;
                                      //Start next set
                                    liJobs[jobIndex].RUNNING = 'TRUE';
                                    // await updateState('TRUE',mainJobID,templateObj.TEMPLATE_ID,templateObj.ACTIVITY_ID,templateObj.STEP);
                                    var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex);
                                    console.log("cIndex",JSON.stringify(iLoop))
                                    if(iLoop.length >0){
                                      await updateJobStatus('Pending', mainJobID);
                                    }
                                    else{
                                      let aData = await cds.run(
                                        `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                      WHERE "JOB_ID" = '` + mainJobID + `'
                                      ORDER BY
                                      "STEP" ASC`
                                      );
                                      let success = aData.filter(el=> el.ACTIVITY_STATUS === "Success");
          
                                      if(success.length > 0){
                                        await updateJobStatus('Warning',mainJobID);
                                      } else {
                                        await updateJobStatus('Error',mainJobID);
                                      }
                                    }
                                    for (var j = 0; j < iLoop.length; j++) {
                                    jobLoop(iLoop[j].STEP -1, iLoop[j].STEP);
                                    }
                                }
                                else{
                                  let aData = await cds.run(
                                    `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                  WHERE "JOB_ID" = '` + mainJobID + `'
                                  ORDER BY
                                  "STEP" ASC`
                                  );
                                  let success = aData.filter(el=> el.ACTIVITY_STATUS === "Success");
      
                                  if(success.length > 0){
                                    await updateJobStatus('Warning',mainJobID);
                                  } else {
                                    await updateJobStatus('Error',mainJobID);
                                  }

                                }
                              
                              }
                            }
                          }
                          }
                        }
                        catch (ex) {
                          templateObj.ACTIVITY_STATUS = "Error";
                          await updateJobDetails(templateObj);
                          await updateJobStatus('Error', mainJobID);
                          console.log("Joberror3" + JSON.stringify(ex.message));
                          if(jobInterval){
                            clearInterval(jobInterval);
                            jobInterval = null; 
                          }
                        }
    
                      }
                    });
                  }
                }, iRefreshInterval);//Interval of 1 second
              })
                .catch(ex => {
                  console.log(ex)
                })
            }
          }
          var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex);
          for (var j = 0; j < iLoop.length; j++) {
            jobLoop(iLoop[j].STEP -1, iLoop[j].STEP);
          }
        }
      }
      //
     async function processMultiJobs(iJobLimit, liJobs, iLoopIndex) {
      //if Any of Previous steps is mandatory and its error or not triggered- Don't create next jobs
        if(liJobs.filter(j=>j.MANDATORY == 'X' && Math.round(j.STEP) <  Math.round(liJobs[iLoopIndex].STEP) && (j.ACTIVITY_STATUS == 'Error' || j.ACTIVITY_STATUS == null 
                          || j.ACTIVITY_STATUS == '' )).length >0){
          return []
        }
        if (liJobs[iLoopIndex] && liJobs[iLoopIndex + 1]) {
          if(liJobs[iLoopIndex]?.MANDATORY == 'X'){//Run one SET at a time if its a mandatory SET
            //if any previous steps has error, check here
            if(liJobs.findIndex(f=>f.ACTIVITY_STATUS == 'Error' && Math.round(f.STEP) <  Math.round(liJobs[iLoopIndex].STEP)) == -1){
              return [
                {
                  "STEP":liJobs[iLoopIndex].STEP
                }
              ];
            }
            else{
              return []
            }
           
          }
          else if(iJobLimit > 1){
            let aSets = liJobs.filter(f=>f.MAIN_SET == liJobs[iLoopIndex].MAIN_SET &&  Math.round(f.STEP) >=   Math.round(liJobs[iLoopIndex].STEP) && f.RUNNING == 'FALSE' );
            var aMultiSteps = [];
            for(var s =0; s < aSets.length; s++){
              if(aMultiSteps.findIndex(m=>m.SET == aSets[s].SET ) == -1 ){
                //If previous step is not success, dont push it into below arra
                let aPreviousStep = liJobs.find(f=>f.MAIN_SET == liJobs[iLoopIndex].MAIN_SET && f.SET ==  liJobs[iLoopIndex].SET && f.STEP == (Math.round(liJobs[iLoopIndex].STEP) - 1) );
                if(aPreviousStep){//previous step exists, check if its success or not
                 if(aPreviousStep?.ACTIVITY_STATUS == 'Success'){
                  aMultiSteps.push({
                    "SET":aSets[s].SET,
                    "STEP":aSets[s].STEP
                  })
                 }
                }
                else{
                  aMultiSteps.push({
                    "SET":aSets[s].SET,
                    "STEP":aSets[s].STEP
                  })
                }
               
              }
            }
          return aMultiSteps;
          }
          else{
            return [
              {
                "STEP":liJobs[iLoopIndex].STEP
              }
            ]
          }
        }
        else {//Next job doesn't exist, create only 1 normal sequence instead of parallel
          if(liJobs[iLoopIndex]?.MANDATORY == 'X'){//Run one SET at a time if its a mandatory SET
            //if any previous steps has error, check here
            if(liJobs.findIndex(f=>f.ACTIVITY_STATUS == 'Error' && Math.round(f.STEP) <  Math.round(liJobs[iLoopIndex].STEP)) == -1){
              return [
                {
                  "STEP":liJobs[iLoopIndex].STEP
                }
              ];
            }
            else{
              return []
            }
           
          }
          else{
            return [
              {
                "STEP":liJobs[iLoopIndex].STEP
              }
            ]
          }
        }
      }

      async function updateState(Flag,mainJobID,TEMPLATE_ID,ACTIVITY_ID,STEP){
        try {
          await UPDATE`JS_JOB_TEMPLATEDETAILS`
            .with({
              RUNNING: Flag
            })
            .where(`JOB_ID = '${mainJobID}'
                  AND TEMPLATE_ID = '${TEMPLATE_ID}'
                  AND ACTIVITY_ID = '${ACTIVITY_ID}'
                  AND STEP = '${STEP}'`);
    
    
        } catch (e) {
          //DONOTHING
        }
      }
      
      async function saveJobSnapshot(oSnapData, req) {
        //Call Snapshot function if SnapShot is not empty
        try {
          if (oSnapData.SnapShot) {
            let hostName = req.headers.host;
            var snapShotURL = "";
            if (hostName.includes("localhost:4004")) {
              snapShotURL = lbaseUrl + '/v2/catalog/maintainSnapShot';
            } else {
              let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
              snapShotURL = baseUrl + '/v2/catalog/maintainSnapShot';
            }
            const HTTPReq = require('https');
            // Define the URL and parameters
            const queryParams = {
              SNAPSHOT_DESC: oSnapData.SnapShot_Desc,
              Mode: oSnapData.SnapShot,
              FROM_DATE: oSnapData.FROM_DATE,
              TO_DATE: oSnapData.TO_DATE,
              VERSION: oSnapData.VERSION
            };
            const url = `${snapShotURL}?${new URLSearchParams(queryParams)}`;
            var auth = await GenFunctions.getAuthorization();
            const options = {
              headers: {
                'Authorization': auth
              }
            };
            // Make the GET request
            HTTPReq.get(url, options, (_response) => {
            }).on('error', (error) => {
              console.log(`Error: ${error.message}`);
            }
            );
          }
        }
        catch (ex) {
          console.log(ex);
        }
      }
      function createTemplateJobs(jobName, req, jobData, baseUrl,oJob) {
        return new Promise((resolve, reject) => {
          const scheduler = getJobscheduler(req);
          var inputData = jobData;
          let actionUrl = baseUrl + inputData.action;
          if (scheduler) {
            var myJob = {
              name: jobName,
              description: jobName,
              action: actionUrl,
              active: true,
              httpMethod: "POST",
              startTime: inputData.startTime,
              endTime: inputData.endTime,
              ansConfig: {
                "onError": true,
                "onSuccess": false
                },
              schedules: inputData.schedules
            };
            var scJob = { job: myJob };
            scheduler.createJob(scJob, function (err, result) {
              if (err) {
                reject(req.error(err.message));
              } else {// job was created successfully,returning JobID and scheduler ID
                resolve(
                  {
                    "jobID": result._id,
                    "scheduleID": result.schedules[0].scheduleId,
                    "TEMPLATE_ID": oJob.TEMPLATE_ID,
                    "ACTIVITY_ID": oJob.ACTIVITY_ID,
                    "STEP": oJob.STEP,
                    "SET": oJob.SET
                  }
                );
              }
            });
          }
        })
      }
      function addJobScheduleFn(startTime, endTime, schData, SUBJOB_ID, TEMPLATE_ID, ACTIVITY_ID, STEP, req,SET) {
        return new Promise((resolve, reject) => {
          const scheduler = getJobscheduler(req);
          if (scheduler) {
            var myJob = {
              data: schData,
              // description: inputData.description,
              active: true,
              startTime: startTime,
              endTime: endTime,
              cron: '',
              time: startTime,
            };
            var scJob = { jobId: SUBJOB_ID, schedule: myJob };
            scheduler.createJobSchedule(scJob, (err, result) => {
              if (err) {
                reject(req.error(err.message));
              } else {
                resolve(
                  {
                    "jobID": SUBJOB_ID,
                    "scheduleID": result.scheduleId,
                    "TEMPLATE_ID": TEMPLATE_ID,
                    "ACTIVITY_ID": ACTIVITY_ID,
                    "STEP": STEP,
                    "SET":SET
                  })
              }
            });
          }
        });
      }
      async function updateJobDetails(data) {
        console.log("Data to Update in Table", data);
        try {
          await UPDATE`JS_JOB_TEMPLATEDETAILS`
            .with({
              SUBJOB_ID: data.jobID,
              ACTIVITY_STATUS: data.ACTIVITY_STATUS,
              SCHEDULE_ID: data.SCHEDULE_ID,
              JOB_ENDTIME: data.JOB_ENDTIME,
              SCH_STARTTIME: data.SCH_STARTTIME,
              SCH_ENDTIME: data.SCH_ENDTIME
            })
            .where(`JOB_ID = '${data.mainJobID}'
                  AND TEMPLATE_ID = '${data.TEMPLATE_ID}'
                  AND ACTIVITY_ID = '${data.ACTIVITY_ID}'
                  AND STEP = '${data.STEP}'`);
    
    
        } catch (e) {
          //DONOTHING
        }
      }
      async function updateJobStatus(JOB_STATUS, mainJobID) {
        try {
          await UPDATE`JS_JOB_TEMPLATEDETAILS`
            .with({
              JOB_STATUS: JOB_STATUS
            })
            .where(`JOB_ID = '${mainJobID}'`);
    
        } catch (e) {
          //DONOTHING
        }
      }
    });
    srv.on("resumeSetParallelJobs_old", async (req) => {
      let hostName = req.headers.host;
      var baseUrl = lbaseUrl;
      var iRefreshInterval = 1000 //1 Second
      // if (hostName.includes("localhost:4004") == false) { //For Deployment
      //   baseUrl = req.headers['x-forwarded-proto'] + '://' + req.headers.host;
      // }
      var iJobLimit = 1;
      var aPreferences = await cds.run(
        `SELECT * FROM "CP_USER_PREFERENCES"
         WHERE "PARAMETER" = 'PARALLEL_JOBS'`
      );
      if (aPreferences.length > 0) {
        iJobLimit = parseInt(aPreferences[0].PARAMETER_VALUE);
      }
 
      var sequence = JSON.parse(req.data.SEQUENCE_ID),
        mainJobID = req.data.JOB_ID,
        step = req.data.STEP;
      req.headers['x-sap-job-id'] = mainJobID; //Updating JobID with existing JobID
      //Getting all the data of all Activities based on sequence_ID 
      var liSequences = await cds.run(
        `SELECT * FROM "JS_JOB_CREATIONDATA"
         WHERE "SEQUENCE_ID" = '` + sequence + `'
         ORDER BY 
         "STEP" ASC`
      );
      if (liSequences.length > 0) {
        var HTTPrequest = require('request');
        //Get Job Details from JS_JOB_TEMPLATEDETAILS
        var liJobs = await cds.run(
          `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
           WHERE "JOB_ID" = '` + mainJobID + `'
           ORDER BY 
           "STEP" ASC`
        );
        if (liJobs.length > 0) {
          var jobCount = liJobs.length;
          var iLoopIndex = step;
          //Recursive Function for Jobs
          async function jobLoop(jobIndex, stepNumber) {
            //For Latest Data if steps don't have SUBJOB_ID
            liSequences = await cds.run(
              `SELECT * FROM "JS_JOB_CREATIONDATA"
           WHERE "SEQUENCE_ID" = '` + sequence + `'
           ORDER BY
           "STEP" ASC`
            );
 
            liJobs = await cds.run(
              `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
           WHERE "JOB_ID" = '` + mainJobID + `'
           ORDER BY
           "STEP" ASC`
            );
            if(liJobs[jobIndex]['RUNNING'] == 'TRUE'){
              return;
            }
            await updateState('TRUE',mainJobID,liJobs[jobIndex].TEMPLATE_ID,liJobs[jobIndex].ACTIVITY_ID,liJobs[jobIndex].STEP);
            //Now Create jobs by step wise
            let jobName = liJobs[jobIndex].ACTIVITY_ID + " (" + mainJobID.toString() + ")" + "_" + new Date().getTime(); //Setting Job Name and job Description same as ACTIVITY_ID
 
            let oStepData = '{}';
            if (liSequences[jobIndex].STEP_DATA) {
              oStepData = liSequences[jobIndex].STEP_DATA.toString();
            }
            let request = getModifiedreq(req, liSequences[jobIndex].ACTION_URL, JSON.parse(oStepData))

            
            var sDate = new Date().toISOString().split("T"),
            sTime = sDate[1].split(":");
          var schTime = sDate[0] + " " + sTime[0] + ":" + sTime[1] + " " + "+0000";

          var schTime2 = new Date().setHours(new Date().getHours() + 6);
            var sDate2 = new Date(schTime2).toISOString().split("T"),
              sTime2 = sDate2[1].split(":");
            var schEndTime = sDate2[0] + " " + sTime2[0] + ":" + sTime2[1] + " " + "+0000";

            var jobendTime = new Date(liJobs[jobIndex].JOB_ENDTIME);

            if(new Date() > jobendTime){
              var jobETime = new Date(jobendTime).setDate(new Date().getDate() + 1);
            } else {
              var jobETime = jobendTime;
            }

            var EndDate = new Date(jobETime);

            var padL = (nr, _len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
            var JEndDate =
                  `${EndDate.getFullYear()}-${padL(EndDate.getMonth() + 1)}-${padL(EndDate.getDate())} ${padL(EndDate.getHours())}:${padL(EndDate.getMinutes())}:${padL(EndDate.getSeconds())}` + ".000000000"
            var SStartDate =
                  `${new Date().getFullYear()}-${padL(new Date().getMonth() + 1)}-${padL(new Date().getDate())} ${padL(new Date().getHours())}:${padL(new Date().getMinutes())}:${padL(new Date().getSeconds())}` + ".000000000"
              var SEndDate =
                  `${new Date(schTime2).getFullYear()}-${padL(new Date(schTime2).getMonth() + 1)}-${padL(new Date(schTime2).getDate())} ${padL(sTime2[0])}:${padL(sTime2[1])}:${padL(sTime2[2].split(".")[0])}` + ".000000000"

 
            //To set read job logs interval
            if (liSequences[jobIndex].ACTION_URL == "/pal/genPredictions") {
              iRefreshInterval = 30000 // 30seconds
              if (request.data?.vcRulesList && request.data?.vcRulesList?.length > 0) { //check for impact analysis
                if (request.data.vcRulesList[0].impactAnalysis == true) {
                  iRefreshInterval = 60000 // 60 seconds
                }
              }
            }
            //Process Sales Order or Generate Forecast Order
            else if (liSequences[jobIndex].ACTION_URL == "/catalog/genUniqueID" || liSequences[jobIndex].ACTION_URL == "/catalog/genFullConfigDemand") {
              iRefreshInterval = 30000 // 30seconds
            } else {
              iRefreshInterval = 1000 // 1 Second
            }

            
 
            if (liJobs[jobIndex].SUBJOB_ID) { //Already exists,add schedule
              // var schTime2 = new Date().setHours(new Date().getHours() + 1);
              // var sDate2 = new Date(schTime2).toISOString().split("T"),
              //   sTime2 = sDate2[1].split(":");
              // var schEndTime = sDate2[0] + " " + sTime2[0] + ":" + sTime2[1] + " " + "+0000";
 
              if (liSequences[jobIndex].ACTION_URL == "/catalog/postCIRQuantitiesToS4") {
                saveJobSnapshot(JSON.parse(oStepData), req);
              }
              // addJobScheduleFn(schTime, schEndTime, JSON.stringify(request.data), liJobs[jobIndex].SUBJOB_ID,
              // liJobs[jobIndex].TEMPLATE_ID, liJobs[jobIndex].ACTIVITY_ID, liJobs[jobIndex].STEP, req,liJobs[jobIndex].SET)
              addJobScheduleFn(schTime, schEndTime, JSON.stringify(request.data), liJobs[jobIndex].SUBJOB_ID,
                  liJobs[jobIndex].TEMPLATE_ID, liJobs[jobIndex].ACTIVITY_ID, liJobs[jobIndex].STEP, req,liJobs[jobIndex].SET)
                .then(async el => {
                  //After Schedule Creation, update SubJobID in JS_JOB_TEMPLATEDETAILS
                  let templateObj = {
                    mainJobID: mainJobID,
                    jobID: el.jobID,
                    TEMPLATE_ID: el.TEMPLATE_ID,
                    ACTIVITY_ID: el.ACTIVITY_ID,
                    ACTIVITY_STATUS: 'Pending',
                    SCHEDULE_ID: el.scheduleID,
                    STEP: el.STEP,
                    JOB_ENDTIME: JEndDate,
                    SCH_STARTTIME: SStartDate,
                    SCH_ENDTIME:SEndDate
                  }
                  await updateJobDetails(templateObj);
                  await updateJobStatus('Pending', mainJobID);
                  var jobInterval = setInterval(async () => {
                    if (el) { //Read from Job Logs (lreadJobRunLogs),to get Job State
                      //For Oauth 2.0 we need to add authorization
                      var auth = await GenFunctions.getAuthorization();
                      let sUrl = baseUrl + '/jobs/readJobRunLogs(jobId=' + el.jobID + ',scheduleId=' + "'" + el.scheduleID + "'" + ',page_size=' + 55 + ',offset=' + 0 + ')';
                      var options = {
                        'method': 'GET',
                        'url': sUrl,
                        'headers': {
                          'Accept': 'application/json',
                          'Accept-Charset': 'utf-8',
                          'Authorization': auth
                        },
                      };
                      HTTPrequest(options, async function (error, response) {
                        if (error) { //Stop execution                                 
                          templateObj.ACTIVITY_STATUS = "Error"
                          await updateJobDetails(templateObj);
                          await updateJobStatus('Error', mainJobID);
                          if(jobInterval){
                            clearInterval(jobInterval);
                            jobInterval = null; 
                          }
                        } else { //Success
                          try {
                            if(jobInterval){
                            var oResponse = JSON.parse(response.body);
                            if (oResponse?.value?.length > 0) {
                              var oJobinfo = oResponse.value[0];
                              if (oJobinfo) {
                                //Update JS_JOB_TEMPLATEDETAILS ACTIVITY_STATUS
                                const templateObj = {
                                  mainJobID: mainJobID,
                                  jobID: el.jobID,
                                  TEMPLATE_ID: el.TEMPLATE_ID,
                                  ACTIVITY_ID: el.ACTIVITY_ID,
                                  ACTIVITY_STATUS: '',
                                  SCHEDULE_ID: el.scheduleID,
                                  STEP: el.STEP,
                                  JOB_ENDTIME: JEndDate,
                                  SCH_STARTTIME: SStartDate,
                                  SCH_ENDTIME:SEndDate
                                }
                                if (oJobinfo.runState == 'SUCCESS') {
                                  clearInterval(jobInterval);
                                  jobInterval = null; 
                                  templateObj.ACTIVITY_STATUS = "Success";
                                  liJobs[jobIndex].ACTIVITY_STATUS = "Success";
                                  await updateJobDetails(templateObj);
                                  //Increment index to next Job
                                  let bFlag = false;
                                  do{
                                    iLoopIndex++;
                                    console.log("iLoopIndex1",iLoopIndex)
                                    let iIndex = liJobs.findIndex(j=>j.STEP == iLoopIndex);
                                    if (iIndex == -1) {
                                      bFlag = false;
                                      break;
                                    }
                                    if(liJobs[iIndex]?.ACTIVITY_STATUS !='Success'){
                                      bFlag = false;
                                      iLoopIndex = iIndex;
                                      break;
                                    }
                                    else{
                                      bFlag = true;
                                    }
                                  }
                                  while(bFlag == true)
                                if (iLoopIndex < jobCount) {
                                    var iNextStep = stepNumber + 1;
                                    //Now check if previous step(s) are successful or not
                                    var aData = await cds.run(`SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                   WHERE  "JOB_ID" = '${mainJobID}' 
                                     AND  "STEP" < '${iNextStep}' 
                                   `);
                                   var aData1 = aData.filter(f => f.ACTIVITY_STATUS != "Success" && f.MANDATORY == 'X');
                                   if(liJobs[jobIndex].MANDATORY == 'X'){//if it is mandatory step, all previous steps must be completed
                                    aData1 = aData.filter(f => f.ACTIVITY_STATUS != "Success")
                                  }
                                   if (aData1.length == 0) {//All previous steps are completed
                                    let iIndex = liJobs.findIndex(li=>li.STEP == iNextStep)
                                    if(iIndex!= -1 && liJobs[iIndex]?.MANDATORY == 'X'){//if current step is mandatory, previous steps must be completed
                                        let aCheck = aData.filter(f => f.ACTIVITY_STATUS == "Error");
                                        if(aCheck.length >0){//Error exists
                                          clearInterval(jobInterval);
                                          jobInterval = null; 
                                          return;
                                        }
                                    }
                                    liJobs[jobIndex].RUNNING = 'TRUE';
                                    var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex);
                                      console.log("iLoop1",JSON.stringify(iLoop))
                                      for (var j = 0; j < iLoop.length; j++) {
                                      jobLoop(iLoop[j].STEP -1, iLoop[j].STEP);
                                      }
                                   }
                                  } else { //All jobs are finished and Successful,updating Job Status to Success
                                    // updateJobStatus('Success', mainJobID);
                                    let aData = await cds.run(
                                      `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                    WHERE "JOB_ID" = '` + mainJobID + `'
                                    ORDER BY
                                    "STEP" ASC`
                                    );
  
                                      let error = aData.filter(el=> el.ACTIVITY_STATUS === "Error");
                                      if(error.length > 0){
                                        await updateJobStatus('Warning',mainJobID);
                                      } else {
                                        await updateJobStatus('Success', mainJobID);
                                      }
                                  }
                                } else if (oJobinfo.runState.toString().includes('ERROR')) { //Stop execution
                                  clearInterval(jobInterval);
                                  jobInterval = null; 
                                  templateObj.ACTIVITY_STATUS = "Error";
                                  liJobs[jobIndex].ACTIVITY_STATUS = "Error"
                                  await updateJobDetails(templateObj);
                                  // await updateJobStatus('Error', mainJobID);
                                  
                                  let iNextSetIndex = 0;
                                  if(el.MANDATORY == 'X'){//if error in mandatory step, stop the job
                                    iNextSetIndex = -1;
                                  }
                                  if(iNextSetIndex!=1){
                                    var bFlag2 = false,iSetCount = 1;
                                    do{
                                      let nextSet =  el.SET+iSetCount;
                                      if(liJobs.findIndex(j=>j.SET == (nextSet)) != -1){//Next set exists
                                        iNextSetIndex = liJobs.findIndex(j=>j.SET == (nextSet) && j.ACTIVITY_STATUS != 'Success');
                                        iSetCount++;
                                        if(iNextSetIndex != -1){//stop loop and proceed to next set
                                          bFlag2 = false;
                                        }
                                      }
                                      else{
                                        bFlag2 = false;
                                      }
                                    }
                                    while(bFlag2 == true)
                                  }
                                  if(iNextSetIndex != -1){//Next Set/sub step exists, skip steps till next step start
    
                                    console.log("setinfo -SET -STEP",el.SET,el.STEP)
                                    for(var jIndex =0; jIndex < liJobs.length ; jIndex++){
                                      if(liJobs[jIndex].SET == el.SET  && liJobs[jIndex].STEP > el.STEP){
                                        liJobs[jIndex].RUNNING = 'TRUE';
                                        try {
                                          await UPDATE`JS_JOB_TEMPLATEDETAILS`
                                            .with({
                                              RUNNING: 'TRUE'
                                            })
                                            .where(`JOB_ID = '${mainJobID}'
                                                  AND SET = '${liJobs[jIndex].SET}'
                                                  AND STEP = '${liJobs[jIndex].STEP}'`);
                                    
                                    
                                        } catch (e) {
                                          //DONOTHING
                                        }
                                      }
                                    }
                                    iLoopIndex = iNextSetIndex;
                                        //Start next set
                                      liJobs[jobIndex].RUNNING = 'TRUE';
                                      // await updateState('TRUE',mainJobID,templateObj.TEMPLATE_ID,templateObj.ACTIVITY_ID,templateObj.STEP);
                                      var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex);
                                      console.log("cIndex",JSON.stringify(iLoop))
                                      if(iLoop.length >0){
                                        await updateJobStatus('Pending', mainJobID);
                                      }
                                      else{
                                        let aData = await cds.run(
                                          `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                        WHERE "JOB_ID" = '` + mainJobID + `'
                                        ORDER BY
                                        "STEP" ASC`
                                        );
                                        let success = aData.filter(el=> el.ACTIVITY_STATUS === "Success");
            
                                        if(success.length > 0){
                                          await updateJobStatus('Warning',mainJobID);
                                        } else {
                                          await updateJobStatus('Error',mainJobID);
                                        }
                                      }
                                      for (var j = 0; j < iLoop.length; j++) {
                                      jobLoop(iLoop[j].STEP -1, iLoop[j].STEP);
                                      }
                                  }
                                  else{
                                    let aData = await cds.run(
                                      `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                    WHERE "JOB_ID" = '` + mainJobID + `'
                                    ORDER BY
                                    "STEP" ASC`
                                    );
                                    let success = aData.filter(el=> el.ACTIVITY_STATUS === "Success");
        
                                    if(success.length > 0){
                                      await updateJobStatus('Warning',mainJobID);
                                    } else {
                                      await updateJobStatus('Error',mainJobID);
                                    }
                                  }
                                }
                              }
                            }
                          } 
                        } catch (ex) {
                            templateObj.ACTIVITY_STATUS = "Error";
                            await updateJobDetails(templateObj);
                            await updateJobStatus('Error', mainJobID);
                            console.log("Joberror3" + JSON.stringify(ex.message));
                            if(jobInterval){
                              clearInterval(jobInterval);
                              jobInterval = null; 
                            }
                          }
 
                        }
                      });
                    }
                  }, iRefreshInterval); //Interval of 1 second
                })
                .catch(ex => {
 
                })
            } else {
              const obj = {
                action: liSequences[jobIndex].ACTION_URL,
                startTime: liJobs[jobIndex].JOB_STARTTIME,
                endTime: liJobs[jobIndex].JOB_ENDTIME,
                schedules: [{
                  data: JSON.stringify(request.data),
                  cron: '',
                  time: schTime,
                  active: true,
                  // startTime: liJobs[jobIndex].SCH_STARTTIME,
                  // endTime: liJobs[jobIndex].SCH_ENDTIME,
                  startTime: schTime,
                  endTime: schEndTime,
                }]
              }
              if (liSequences[jobIndex].ACTION_URL == "/catalog/postCIRQuantitiesToS4") {
                saveJobSnapshot(JSON.parse(oStepData), req);
              }
              createTemplateJobs(jobName, req, obj, baseUrl, liJobs[jobIndex].TEMPLATE_ID, liJobs[jobIndex].ACTIVITY_ID, liJobs[jobIndex].STEP,liJobs[jobIndex].SET).then(async el => {
                  //After Job Creation, update SubJobID in JS_JOB_TEMPLATEDETAILS
                  let templateObj = {
                    mainJobID: mainJobID,
                    jobID: el.jobID,
                    TEMPLATE_ID: el.TEMPLATE_ID,
                    ACTIVITY_ID: el.ACTIVITY_ID,
                    ACTIVITY_STATUS: 'Pending',
                    SCHEDULE_ID: el.scheduleID,
                    STEP: el.STEP,
                    JOB_ENDTIME: JEndDate,
                    SCH_STARTTIME: SStartDate,
                    SCH_ENDTIME:SEndDate
                  }
                  await updateJobDetails(templateObj);
                  await updateJobStatus('Pending', mainJobID);
                  var jobInterval = setInterval(async () => {
                    if (el) { //Read from Job Logs (lreadJobRunLogs),to get Job State
                      var auth = await GenFunctions.getAuthorization();
                      let sUrl = baseUrl + '/jobs/readJobRunLogs(jobId=' + el.jobID + ',scheduleId=' + "'" + el.scheduleID + "'" + ',page_size=' + 55 + ',offset=' + 0 + ')';
                      var options = {
                        'method': 'GET',
                        'url': sUrl,
                        'headers': {
                          'Accept': 'application/json',
                          'Accept-Charset': 'utf-8',
                          'Authorization': auth
                        },
                      };
                      HTTPrequest(options, async function (error, response) {
                        if (error) { //Stop execution                                 
                          templateObj.ACTIVITY_STATUS = "Error"
                          await updateJobDetails(templateObj);
                          await updateJobStatus('Error', mainJobID);
                          if(jobInterval){
                            clearInterval(jobInterval);
                            jobInterval = null; 
                          }
                        } else { //Success
                          try {
                            if(jobInterval){
                            var oResponse = JSON.parse(response.body);
                            if (oResponse?.value?.length > 0) {
                              var oJobinfo = oResponse.value[0];
                              if (oJobinfo) {
                                //Update JS_JOB_TEMPLATEDETAILS ACTIVITY_STATUS
                                const templateObj = {
                                  mainJobID: mainJobID,
                                  jobID: el.jobID,
                                  TEMPLATE_ID: el.TEMPLATE_ID,
                                  ACTIVITY_ID: el.ACTIVITY_ID,
                                  ACTIVITY_STATUS: '',
                                  SCHEDULE_ID: el.scheduleID,
                                  STEP: el.STEP,
                                  JOB_ENDTIME: JEndDate,
                                  SCH_STARTTIME: SStartDate,
                                  SCH_ENDTIME:SEndDate
                                }
                                if (oJobinfo.runState == 'SUCCESS') {
                                  clearInterval(jobInterval);
                                  jobInterval = null; 
                              templateObj.ACTIVITY_STATUS = "Success"
                              liJobs[jobIndex].ACTIVITY_STATUS = "Success"
                              await updateJobDetails(templateObj);
                              //Increment index to next Job
                              let bFlag = false;
                              do{
                                iLoopIndex++;
                                let iIndex = liJobs.findIndex(j=>j.STEP == iLoopIndex);
                                if (iIndex == -1) {
                                  bFlag = false;
                                  break;
                                }
                                if(liJobs[iIndex]?.ACTIVITY_STATUS !='Success'){
                                  bFlag = false;
                                  iLoopIndex = iIndex;
                                  break;
                                }
                                else{
                                  bFlag = true;
                                }
                              }
                              while(bFlag == true)
                              if (iLoopIndex < jobCount) {//Next jobs
                                var iNextStep = stepNumber + 1;
                                //Now check if previous step(s) are successful or not
                                var aData = await cds.run(`SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                WHERE ( "JOB_ID" = '${mainJobID}' )
                                  AND ( "STEP" < '${iNextStep}' );
                                `);
                                var aData1 = aData.filter(f => f.ACTIVITY_STATUS != "Success" && f.MANDATORY == 'X');//if error in mandatory set

                                if(liJobs[jobIndex].MANDATORY == 'X'){//if it is mandatory step, all previous steps must be completed
                                  aData1 = aData.filter(f => f.ACTIVITY_STATUS != "Success")
                                }
                                  if (aData1.length == 0) {//All previous steps are completed
                                    let iIndex = liJobs.findIndex(li=>li.STEP == iNextStep)
                                    if(iIndex!= -1 && liJobs[iIndex]?.MANDATORY == 'X'){//if current step is mandatory, previous steps must be completed
                                        let aCheck = aData.filter(f => f.ACTIVITY_STATUS == "Error");
                                        if(aCheck.length >0){//Error exists
                                          clearInterval(jobInterval);
                                          jobInterval = null; 
                                          return;
                                        }
                                    }
                                    liJobs[jobIndex].RUNNING = 'TRUE';
                                   
                                    var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex);
                                    console.log("iLoop1",JSON.stringify(iLoop))
                                    for (var j = 0; j < iLoop.length; j++) {
                                    jobLoop(iLoop[j].STEP -1, iLoop[j].STEP);
                                    }
                                  }
                              }
                              else {//All jobs are finished and Successful,updating Job Status to Success
                                // await updateJobStatus('Success', mainJobID);
                                let aData = await cds.run(
                                  `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                WHERE "JOB_ID" = '` + mainJobID + `'
                                ORDER BY
                                "STEP" ASC`
                                );

                                  let error = aData.filter(el=> el.ACTIVITY_STATUS === "Error");
                                  if(error.length > 0){
                                    await updateJobStatus('Warning',mainJobID);
                                  } else {
                                    await updateJobStatus('Success', mainJobID);
                                  }
                              }
                                } else if (oJobinfo.runState.toString().includes('ERROR')) { //Stop execution
                                  clearInterval(jobInterval);
                                  jobInterval = null; 
                                  templateObj.ACTIVITY_STATUS = "Error";
                                  liJobs[jobIndex].ACTIVITY_STATUS = "Error"
                                  await updateJobDetails(templateObj);
                                  // await updateJobStatus('Error', mainJobID);
                                  let iNextSetIndex = 0;
                                  if(el.MANDATORY == 'X'){//if error in mandatory step, stop the job
                                    iNextSetIndex = -1;
                                  }
    
                                  if(iNextSetIndex!=1){
                                    var bFlag2 = false,iSetCount = 1;
                                    do{
                                      if(liJobs.findIndex(j=>j.SET == el.SET+iSetCount)!=-1){
                                        iNextSetIndex = liJobs.findIndex(j=>j.SET == el.SET+iSetCount && j.ACTIVITY_STATUS != 'Success');
                                        iSetCount++;
                                        if(iNextSetIndex != -1){
                                          bFlag2 = false;
                                        }
                                      }
                                      else{
                                        bFlag2 = false;
                                      }
                                    }
                                    while(bFlag2 == true)
                                  }
                                  if(iNextSetIndex != -1){//Next Set/sub step exists, skip steps till next step start
    
                                    console.log("setinfo -SET -STEP",el.SET,el.STEP)
                                    for(var jIndex =0; jIndex < liJobs.length ; jIndex++){
                                      if(liJobs[jIndex].SET == el.SET  && liJobs[jIndex].STEP > el.STEP){
                                        liJobs[jIndex].RUNNING = 'TRUE';
                                        try {
                                          await UPDATE`JS_JOB_TEMPLATEDETAILS`
                                            .with({
                                              RUNNING: 'TRUE'
                                            })
                                            .where(`JOB_ID = '${mainJobID}'
                                                  AND SET = '${liJobs[jIndex].SET}'
                                                  AND STEP = '${liJobs[jIndex].STEP}'`);
                                    
                                    
                                        } catch (e) {
                                          //DONOTHING
                                        }
                                      }
                                    }
                                    iLoopIndex = iNextSetIndex;
                                        //Start next set
                                      liJobs[jobIndex].RUNNING = 'TRUE';
                                      // await updateState('TRUE',mainJobID,templateObj.TEMPLATE_ID,templateObj.ACTIVITY_ID,templateObj.STEP);
                                      var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex);
                                      console.log("cIndex",JSON.stringify(iLoop))
                                      if(iLoop.length >0){
                                        await updateJobStatus('Pending', mainJobID);
                                      }
                                      else{
                                        let aData = await cds.run(
                                          `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                        WHERE "JOB_ID" = '` + mainJobID + `'
                                        ORDER BY
                                        "STEP" ASC`
                                        );
                                        let success = aData.filter(el=> el.ACTIVITY_STATUS === "Success");
            
                                        if(success.length > 0){
                                          await updateJobStatus('Warning',mainJobID);
                                        } else {
                                          await updateJobStatus('Error',mainJobID);
                                        }
                                      }
                                      for (var j = 0; j < iLoop.length; j++) {
                                      jobLoop(iLoop[j].STEP -1, iLoop[j].STEP);
                                      }
                                  }
                                  else{
                                    let aData = await cds.run(
                                      `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
                                    WHERE "JOB_ID" = '` + mainJobID + `'
                                    ORDER BY
                                    "STEP" ASC`
                                    );
                                    let success = aData.filter(el=> el.ACTIVITY_STATUS === "Success");
        
                                    if(success.length > 0){
                                      await updateJobStatus('Warning',mainJobID);
                                    } else {
                                      await updateJobStatus('Error',mainJobID);
                                    }
                                  }
                                }
                              }
                            }
                          } 
                        } catch (ex) {
                            templateObj.ACTIVITY_STATUS = "Error";
                            await updateJobDetails(templateObj);
                            await updateJobStatus('Error', mainJobID);
                            if(jobInterval){
                              clearInterval(jobInterval);
                              jobInterval = null; 
                            }
                            console.log("Joberror4" + JSON.stringify(ex.message));
                          }
 
                        }
                      });
                    }
                  }, iRefreshInterval); //Interval of 1 second
                })
                .catch(ex => {
 
                })
            }
 
          }
          try {
            for(var t =0; t< liJobs?.length; t++){
              if(liJobs[t].JOB_ID ==  mainJobID && liJobs[t].STEP >= iLoopIndex && liJobs[t].ACTIVITY_STATUS != 'Success'){
                liJobs[t].RUNNING = 'FALSE';
                await UPDATE`JS_JOB_TEMPLATEDETAILS`
                .with({
                  RUNNING: 'FALSE'
                })
                .where(`JOB_ID = '${mainJobID}'
                      AND STEP = '${liJobs[t].STEP}'`);
              }
            }
          } catch (e) {
            //DONOTHING
          }
          var iLoop = await processMultiJobs(iJobLimit, liJobs, iLoopIndex - 1);
          for (var j = 0; j < iLoop.length; j++) {
            jobLoop(iLoop[j].STEP -1, iLoop[j].STEP);
          }
        }
      }
 
      async function processMultiJobs(iJobLimit, liJobs, iLoopIndex) {
        //if Any of Previous steps is mandatory and its error or not triggered- Don't create next jobs
          if(liJobs.filter(j=>j.MANDATORY == 'X' && Math.round(j.STEP) <  Math.round(liJobs[iLoopIndex].STEP) && (j.ACTIVITY_STATUS == 'Error' || j.ACTIVITY_STATUS == null || j.ACTIVITY_STATUS == '' )).length >0){
            return []
          }
          if (liJobs[iLoopIndex] && liJobs[iLoopIndex + 1]) {
            if(liJobs[iLoopIndex]?.MANDATORY == 'X'){//Run one SET at a time if its a mandatory SET
              //if any previous steps has error, check here
              if(liJobs.findIndex(f=>f.ACTIVITY_STATUS == 'Error' && Math.round(f.STEP) <  Math.round(liJobs[iLoopIndex].STEP)) == -1){
                return [
                  {
                    "STEP":liJobs[iLoopIndex].STEP
                  }
                ];
              }
              else{
                return []
              }
             
            }
            else if(iJobLimit > 1){
              let aSets = liJobs.filter(f=>f.MAIN_SET == liJobs[iLoopIndex].MAIN_SET &&  Math.round(f.STEP) >=   Math.round(liJobs[iLoopIndex].STEP) && f.RUNNING == 'FALSE' );
              var aMultiSteps = [];
              for(var s =0; s < aSets.length; s++){
                if(aMultiSteps.findIndex(m=>m.SET == aSets[s].SET ) == -1 ){
                  //If previous step is not success, dont push it into below arra
                  let aPreviousStep = liJobs.find(f=>f.MAIN_SET == liJobs[iLoopIndex].MAIN_SET && f.SET ==  liJobs[iLoopIndex].SET && f.STEP == (Math.round(liJobs[iLoopIndex].STEP) - 1) );
                  if(aPreviousStep){//previous step exists, check if its success or not
                   if(aPreviousStep?.ACTIVITY_STATUS == 'Success'){
                    aMultiSteps.push({
                      "SET":aSets[s].SET,
                      "STEP":aSets[s].STEP
                    })
                   }
                  }
                  else{
                    aMultiSteps.push({
                      "SET":aSets[s].SET,
                      "STEP":aSets[s].STEP
                    })
                  }
                 
                }
              }
            return aMultiSteps;
            }
            else{
              return [
                {
                  "STEP":liJobs[iLoopIndex].STEP
                }
              ]
            }
          }
          else {//Next job doesn't exist, create only 1 normal sequence instead of parallel
            if(liJobs[iLoopIndex]?.MANDATORY == 'X'){//Run one SET at a time if its a mandatory SET
              //if any previous steps has error, check here
              if(liJobs.findIndex(f=>f.ACTIVITY_STATUS == 'Error' && Math.round(f.STEP) <  Math.round(liJobs[iLoopIndex].STEP)) == -1){
                return [
                  {
                    "STEP":liJobs[iLoopIndex].STEP
                  }
                ];
              }
              else{
                return []
              }
             
            }
            else{
              return [
                {
                  "STEP":liJobs[iLoopIndex].STEP
                }
              ]
            }
          }
        }
        async function updateState(Flag,mainJobID,TEMPLATE_ID,ACTIVITY_ID,STEP){
          try {
            await UPDATE`JS_JOB_TEMPLATEDETAILS`
              .with({
                RUNNING: Flag
              })
              .where(`JOB_ID = '${mainJobID}'
                    AND TEMPLATE_ID = '${TEMPLATE_ID}'
                    AND ACTIVITY_ID = '${ACTIVITY_ID}'
                    AND STEP = '${STEP}'`);
      
      
          } catch (e) {
            //DONOTHING
          }
        }
      async function saveJobSnapshot(oSnapData, req) {
        //Call Snapshot function if SnapShot is not empty
        try {
          if (oSnapData.SnapShot) {
            let hostName = req.headers.host;
            var snapShotURL = "";
            if (hostName.includes("localhost:4004")) {
              snapShotURL = lbaseUrl + '/v2/catalog/maintainSnapShot';
            } else {
              let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
              snapShotURL = baseUrl + '/v2/catalog/maintainSnapShot';
            }
            const HTTPReq = require('https');
            // Define the URL and parameters
            const queryParams = {
              SNAPSHOT_DESC: oSnapData.SnapShot_Desc,
              Mode: oSnapData.SnapShot,
              FROM_DATE: oSnapData.FROM_DATE,
              TO_DATE: oSnapData.TO_DATE,
              VERSION: oSnapData.VERSION
            };
            const url = `${snapShotURL}?${new URLSearchParams(queryParams)}`;
            var auth = await GenFunctions.getAuthorization();
            const options = {
              headers: {
                'Authorization': auth
              }
            };
            // Make the GET request
            HTTPReq.get(url, options, (_response) => {}).on('error', (error) => {
              console.log(`Error: ${error.message}`);
            });
          }
        } catch (ex) {
          console.log(ex);
        }
      }
 
      function createTemplateJobs(jobName, req, jobData, baseUrl, TEMPLATE_ID, ACTIVITY_ID, STEP,SET) {
        return new Promise((resolve, reject) => {
          const scheduler = getJobscheduler(req);
          var inputData = jobData;
          let actionUrl = baseUrl + inputData.action;
          if (scheduler) {
            var myJob = {
              name: jobName,
              description: jobName,
              action: actionUrl,
              active: true,
              httpMethod: "POST",
              startTime: inputData.startTime,
              endTime: inputData.endTime,
              ansConfig: {
                "onError": true,
                "onSuccess": false
                },
              schedules: inputData.schedules
            };
            var scJob = {
              job: myJob
            };
            scheduler.createJob(scJob, function (err, result) {
              if (err) {
                reject(req.error(err.message));
              } else { // job was created successfully,returning JobID and scheduler ID
                resolve({
                  "jobID": result._id,
                  "scheduleID": result.schedules[0].scheduleId,
                  "TEMPLATE_ID": TEMPLATE_ID,
                  "ACTIVITY_ID": ACTIVITY_ID,
                  "STEP": STEP,
                  "SET": SET
                });
              }
            });
          }
        })
      }
 
      function addJobScheduleFn(startTime, endTime, schData, SUBJOB_ID, TEMPLATE_ID, ACTIVITY_ID, STEP, req,SET) {
        return new Promise((resolve, reject) => {
          const scheduler = getJobscheduler(req);
          if (scheduler) {
            var myJob = {
              data: schData,
              // description: inputData.description,
              active: true,
              startTime: startTime,
              endTime: endTime,
              cron: '',
              time: startTime,
            };
            var scJob = {
              jobId: SUBJOB_ID,
              schedule: myJob
            };
            scheduler.createJobSchedule(scJob, (err, result) => {
              if (err) {
                reject(req.error(err.message));
              } else {
                resolve({
                  "jobID": SUBJOB_ID,
                  "scheduleID": result.scheduleId,
                  "TEMPLATE_ID": TEMPLATE_ID,
                  "ACTIVITY_ID": ACTIVITY_ID,
                  "STEP": STEP,
                  "SET": SET
                })
              }
            });
          }
        });
      }
      async function updateJobDetails(data) {
        try {
          await UPDATE `JS_JOB_TEMPLATEDETAILS`
            .with({
              SUBJOB_ID: data.jobID,
              ACTIVITY_STATUS: data.ACTIVITY_STATUS,
              SCHEDULE_ID: data.SCHEDULE_ID,
              JOB_ENDTIME: data.JOB_ENDTIME,
              SCH_STARTTIME: data.SCH_STARTTIME,
              SCH_ENDTIME: data.SCH_ENDTIME
            })
            .where(`JOB_ID = '${data.mainJobID}'
                 AND TEMPLATE_ID = '${data.TEMPLATE_ID}'
                 AND ACTIVITY_ID = '${data.ACTIVITY_ID}'
                 AND STEP = '${data.STEP}'`);
 
 
        } catch (e) {
          //DONOTHING
        }
      }
      async function updateJobStatus(JOB_STATUS, mainJobID) {
        try {
          await UPDATE `JS_JOB_TEMPLATEDETAILS`
            .with({
              JOB_STATUS: JOB_STATUS
            })
            .where(`JOB_ID = '${mainJobID}'`);
 
        } catch (e) {
          //DONOTHING
        }
      }
      async function updateNextSteps(mainJobID, STEP,SET) {
        try {
          await UPDATE `JS_JOB_TEMPLATEDETAILS`
            .with({
              ACTIVITY_STATUS: ''
            })
            .where(`JOB_ID = '${mainJobID}'
           AND STEP > '${STEP}'
            AND SET = '${SET}'`);
 
          await UPDATE `JS_JOB_TEMPLATEDETAILS`
            .with({
              JOB_STATUS: 'Pending'
            })
            .where(`JOB_ID = '${mainJobID}'`);
 
        } catch (e) {
          console.log(e)
        }
      }
    });
      srv.on("ParallelSetjobsCreation", async (req) => {
      let hostName = req.headers.host;
      var baseUrl = lbaseUrl;
      var iRefreshInterval = 1000 //1 Second;
      var iReqTimeout = 10000;//Timeout of 10 seconds
      // if (hostName.includes("localhost:4004") == false) {//For Deployment
      //   baseUrl = req.headers['x-forwarded-proto'] + '://' + req.headers.host;
      // }
      var iJobLimit = 1;
      var aPreferences = await cds.run(
        `SELECT * FROM "CP_USER_PREFERENCES"
        WHERE "PARAMETER" = 'PARALLEL_JOBS'`
      );
      if (aPreferences.length > 0) {
        iJobLimit = parseInt(aPreferences[0].PARAMETER_VALUE);
      }
      var Sequence_ID = JSON.parse(req.data.JOBDATA);
      //Getting all the data of all Activities based on sequence_ID 
      var liJobs = await cds.run(
        `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
        WHERE "SEQUENCE_ID" = '` + Sequence_ID + `'
        ORDER BY
        "STEP" ASC`
      );
      if (liJobs.length > 0) {
        var HTTPrequest = require('request');
        var mainJobID = liJobs[0].JOB_ID;
        var iSetIndex = 0;
        var aErrorList =[];
        //Making all jobs as running False in case of crash scenario
        try {
          await UPDATE`JS_JOB_TEMPLATEDETAILS`
            .with({
              RUNNING: 'FALSE',
              JOB_STATUS: 'Pending',
              ACTIVITY_STATUS:null
            })
            .where(`JOB_ID = '${mainJobID}'`);
        } catch (e) {
          //DONOTHING
        }
        var oJobs = {};
        var orderedSets = [];
        const oAlert ={},aAlert =[];
        for (var i = 0; i < liJobs.length; i++) {
          let el = liJobs[i];
          let oParameter = el.PARAM_VALUE.toString();
          oAlert[el.STEP] ??={};
          if(oParameter){
            let aParsed = JSON.parse(oParameter);
          oAlert[el.STEP] = {
            "LOCATION_ID":aParsed.LOCATION_ID ?? "*",
            "PRODUCT_ID":aParsed.PRODUCT_ID ?? "*",
            "CUSTOMER_GROUP":aParsed.CUSTOMER_GROUP ?? "",
            "VERSION":aParsed.VERSION ?? "",
            "SCENARIO":aParsed.SCENARIO ?? "",
            "MODEL_VERSION":aParsed.MODEL_VERSION ?? "",
            "ACTIVITY_ID":el.ACTIVITY_ID
           };
           if(Array.isArray(oAlert[el.STEP]["PRODUCT_ID"])){//Forecast Orders product in array format
            oAlert[el.STEP]["PRODUCT_ID"] = oAlert[el.STEP]["PRODUCT_ID"][0]
          }
          if(Array.isArray(oAlert[el.STEP]["LOCATION_ID"])){
            oAlert[el.STEP]["LOCATION_ID"] = oAlert[el.STEP]["LOCATION_ID"][0]
          }
          }

          if (!(el.SET in oJobs)) {
            oJobs[el.SET] = {
              jobs: [],
              MANDATORY: el.MANDATORY,
              COMPLETED:false
            };
            orderedSets.push(el.SET);
          }
          oJobs[el.SET].jobs.push(el);
        }
        const finalChunks = splitAndChunkJobs(oJobs, orderedSets, iJobLimit);
  
        setLoop(finalChunks[0],req);//Entry point
  
        function setLoop(setData,req){//Looping sets for Parallelization
          let aSets = setData;
          for (const [setKey, setData] of Object.entries(aSets)) { // Parallel sets here
            jobLoop(setData.jobs,setData.jobs[0],req,setKey);
          }
        }
  
        async function jobLoop(aJobs,oCurrentJob,req,index){//Recursive function to schedule Jobs
          //if current step is Mandatory and Previous step had error, don't trigger any job
          if(oCurrentJob.MANDATORY =='X' && aErrorList.length >0){
            await updateStatusByCondition(mainJobID,'Success','Error',aAlert,req);
            return;
          }
          var liSequences = await cds.run(
            `SELECT * FROM "JS_JOB_CREATIONDATA"
            WHERE "SEQUENCE_ID"='${oCurrentJob.SEQUENCE_ID}'
            AND "MAIN_SET"='${oCurrentJob.MAIN_SET}'
            AND "SET"='${oCurrentJob.SET}'
            AND "STEP"='${oCurrentJob.STEP}'
            AND "TEMPLATE_ID"='${oCurrentJob.TEMPLATE_ID}'
            AND "ACTIVITY_ID"='${oCurrentJob.ACTIVITY_ID}'
            ORDER BY "STEP" ASC`
          )
          let jobName = oCurrentJob.ACTIVITY_ID + " (" + oCurrentJob.JOB_ID.toString() + ")" + "_" + new Date().getTime();//Setting Job Name and job Description same as ACTIVITY_ID

          let oStepData = '{}';
          if (liSequences[0].STEP_DATA) {
            oStepData = liSequences[0].STEP_DATA.toString();
          }
          let request = getModifiedreq(req, liSequences[0].ACTION_URL, JSON.parse(oStepData))

          var sDate = new Date().toISOString().split("T"),
            sTime = sDate[1].split(":");
          var schTime = sDate[0] + " " + sTime[0] + ":" + sTime[1] + " " + "+0000";
          var schTime2 = new Date().setHours(new Date().getHours() + 6);
          var sDate2 = new Date(schTime2).toISOString().split("T"),
            sTime2 = sDate2[1].split(":");
          var schEndTime = sDate2[0] + " " + sTime2[0] + ":" + sTime2[1] + " " + "+0000";
          var jobendTime = new Date(oCurrentJob.JOB_ENDTIME);
                if(new Date() > jobendTime){
            var jobETime = new Date(jobendTime).setDate(new Date().getDate() + 1);
          } else {
            var jobETime = jobendTime;
          }
          var EndDate = new Date(jobETime);
          var padL = (nr, _len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
          var JEndDate =
            `${EndDate.getFullYear()}-${padL(EndDate.getMonth() + 1)}-${padL(EndDate.getDate())} ${padL(EndDate.getHours())}:${padL(EndDate.getMinutes())}:${padL(EndDate.getSeconds())}` + ".000000000"
          var SStartDate =
            `${new Date().getFullYear()}-${padL(new Date().getMonth() + 1)}-${padL(new Date().getDate())} ${padL(new Date().getHours())}:${padL(new Date().getMinutes())}:${padL(new Date().getSeconds())}` + ".000000000"
          var SEndDate =
            `${new Date(schTime2).getFullYear()}-${padL(new Date(schTime2).getMonth() + 1)}-${padL(new Date(schTime2).getDate())} ${padL(sTime2[0])}:${padL(sTime2[1])}:${padL(sTime2[2].split(".")[0])}` + ".000000000"

          //To set read job logs interval
          if (liSequences[0].ACTION_URL == "/pal/genPredictions") {
            iRefreshInterval = 30000 // 30seconds
            if (request.data?.vcRulesList && request.data?.vcRulesList?.length > 0) {//check for impact analysis
              if (request.data.vcRulesList[0].impactAnalysis == true) {
                iRefreshInterval = 60000// 60 seconds
              }
            }
          }
          //Process Sales Order or Generate Forecast Order
              else if(liSequences[0].ACTION_URL == "/catalog/genUniqueID" || liSequences[0].ACTION_URL == "/catalog/genFullConfigDemand"){
            iRefreshInterval = 1000 // 30seconds
          }
          else {
            iRefreshInterval = 1000 // 1 Second
          }
          if (liSequences[0].ACTION_URL == "/catalog/postCIRQuantitiesToS4") {
            saveJobSnapshot(JSON.parse(oStepData), req);
          }
          var sCron = '', STime = schTime;
          let subdomain = req.user.authInfo?.getSubdomain?.();
          const obj = {
            action: liSequences[0].ACTION_URL + '?host=' + subdomain,
            startTime: oCurrentJob.JOB_STARTTIME,
            endTime: oCurrentJob.JOB_ENDTIME,
            schedules: [
              {
                data: JSON.stringify(request.data),
                cron: sCron,
                time: STime,
                active: true,
                startTime: schTime,
                endTime: schEndTime,
              }
            ]
          }
                console.log(`Scheduled - SET:${oCurrentJob.SET} STEP:${oCurrentJob.STEP}  `+new Date().toISOString().slice(0, 19).replace('T', ' '))
                  createJobandSchedule(jobName, req, obj, baseUrl, oCurrentJob,schTime,schEndTime,JSON.stringify(request.data)).then(async el => {
            //After Job Creation, update SubJobID in JS_JOB_TEMPLATEDETAILS
            let templateObj = {
              mainJobID: oCurrentJob.JOB_ID,
              jobID: el.jobID,
              TEMPLATE_ID: el.TEMPLATE_ID,
              ACTIVITY_ID: el.ACTIVITY_ID,
              ACTIVITY_STATUS: 'Pending',
              SCHEDULE_ID: el.scheduleID,
              STEP: el.STEP,
              JOB_ENDTIME: JEndDate,
              SCH_STARTTIME: SStartDate,
                    SCH_ENDTIME:SEndDate
            }
            await updateJobDetails(templateObj);
            oCurrentJob.bJobRunning = false;
            var jobInterval = setInterval(async () => {
                    if(oCurrentJob.bJobRunning) return;
              if (el) {//Read from Job Logs (lreadJobRunLogs),to get Job State
                var auth = await GenFunctions.getAuthorization();
                      let sUrl = baseUrl + '/jobs/readJobRunLogs(jobId=' + el.jobID + ',scheduleId=' + "'" + el.scheduleID + "'" + ',page_size=' + 55 + ',offset=' + 0 + ')';
                var options = {
                  'method': 'GET',
                  'url': sUrl,
                  'headers': {
                    'Accept': 'application/json',
                    'Accept-Charset': 'utf-8',
                    'Authorization': auth
                  },
                        timeout:iReqTimeout
                };
                oCurrentJob.bJobRunning = true;
                HTTPrequest(options, async function (error, response) {
                  if (error) {//Stop execution    
                          if (error.code == 'ESOCKETTIMEDOUT' ) {//In case of socket timeout, retrying the request
                            if(jobInterval){
                        oCurrentJob.bJobRunning = false;
                      }
                    }
                          else{
                      oCurrentJob.bJobRunning = true;
                      templateObj.ACTIVITY_STATUS = "Error";
                          await updateJobDetails(templateObj,aAlert,oAlert,'',null);
                      await updateJobStatus('Error', templateObj.mainJobID);
                          if(jobInterval){
                        clearInterval(jobInterval);
                        jobInterval = null;
                      }
                    }
                  }
                  else {//Success
                    try {
                            if(jobInterval){
                        oCurrentJob.bJobRunning = false;
                      }
                            if(jobInterval && response && response?.body){
                        var oResponse = JSON.parse(response.body);
                              if(oResponse?.value?.length >0){
                          var oJobinfo = oResponse.value[0];
                          if (oJobinfo) {
                                  if(await checkJobStatus(mainJobID) == false){//Job has error , stop the process,this is regarding error logs
                              clearInterval(jobInterval);
                              jobInterval = null;
                              req.headers["x-sap-job-id"] = el.jobID;
                              req.headers["x-sap-job-schedule-id"] = el.scheduleID;
                              req.headers["x-sap-job-run-id"] = oJobinfo.runId;
                                 return  await GenFunctions.jobSchMessage('', `Job execution has stopped due to Internal Server Error.`, req);
                            }
                            //Update JS_JOB_TEMPLATEDETAILS ACTIVITY_STATUS
                            const templateObj = {
                              mainJobID: mainJobID,
                              jobID: el.jobID,
                              TEMPLATE_ID: el.TEMPLATE_ID,
                              ACTIVITY_ID: el.ACTIVITY_ID,
                              ACTIVITY_STATUS: '',
                              SCHEDULE_ID: el.scheduleID,
                              STEP: el.STEP,
                              JOB_ENDTIME: JEndDate,
                              SCH_STARTTIME: SStartDate,
                                  SCH_ENDTIME:SEndDate
                            }
                            if (oJobinfo.runState == 'SUCCESS') {
                                  console.log(`Completed - SET:${el.SET} STEP:${el.STEP}  `+new Date().toISOString().slice(0, 19).replace('T', ' '))
                              clearInterval(jobInterval);
                              jobInterval = null;
                              templateObj.ACTIVITY_STATUS = "Success"
                                  let jobMsg='';
                                  if(oJobinfo.runText){
                                const parsed = JSON.parse(oJobinfo.runText);
                                jobMsg = parsed[parsed.length - 1].text.replace(/\s?(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s.*$/, "").trim();
                              }
                                  await updateJobDetails(templateObj,aAlert,oAlert,jobMsg,oJobinfo);
                              //Go to Next job in the SET
                                  let aNextStep = finalChunks[iSetIndex][index]['jobs'].filter(f=>f.STEP == el.STEP +1);
                                  if(aNextStep.length >0){//Go to next job in SET
                                    jobLoop(aJobs,aNextStep[0],req,index)
                              }
                                  else{//Go to Next SET
                                    finalChunks[iSetIndex][index]['COMPLETED']= true;
                                    if(finalChunks[iSetIndex + 1]){//if next sets Exists
                                      if(checkCompleted(finalChunks[iSetIndex]) == true){
                                        iSetIndex+=1;
                                          setLoop(finalChunks[iSetIndex],req);
                                  }
                                }
                                   else{//update Job status here
                                     updateStatusByCondition(mainJobID,'Error','Success',aAlert,req);
                                }
                              }
                            }
                            else if (oJobinfo.runState.toString().includes('ERROR')) {
                              //if Error, mark that Set as completed
                              clearInterval(jobInterval);
                              jobInterval = null;
                                  finalChunks[iSetIndex][index]['COMPLETED']= true;
                              templateObj.ACTIVITY_STATUS = "Error";
                                  let jobMsg='';
                                  if(oJobinfo.runText){
                                const parsed = JSON.parse(oJobinfo.runText);
                                jobMsg = parsed[parsed.length - 1].text.replace(/\s?(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s.*$/, "").trim();
                              }
                                  await updateJobDetails(templateObj,aAlert,oAlert,jobMsg,oJobinfo);
                              aErrorList.push({
                                "STEP": el.STEP
                              })
                                   console.log("Error at Step:"+el.STEP);
                                   if(finalChunks[iSetIndex + 1] && finalChunks[iSetIndex][index]['MANDATORY']!='X'){//if next sets Exists and Error not in Mandatory set
                                    if(checkCompleted(finalChunks[iSetIndex]) == true){
                                      iSetIndex+=1;
                                        setLoop(finalChunks[iSetIndex],req);
                                }
                              }
                                   else{//update Job status here
                                     updateStatusByCondition(mainJobID,'Success','Error',aAlert,req);
                              }

                            }
                          }
                        }
                      }
                    }
                    catch (ex) {
                      templateObj.ACTIVITY_STATUS = "Error";
                            let jobMsg=ex.message;
                      if (jobMsg.length >= 5000) {
                        jobMsg = jobMsg.slice(0, 4995) + "...";
                      }
                            await updateJobDetails(templateObj,aAlert,oAlert,jobMsg,null);
                      await updateJobStatus('Error', mainJobID);
                      console.log("Joberror3" + JSON.stringify(ex.message));
                            if(jobInterval){
                        clearInterval(jobInterval);
                        jobInterval = null;
                      }
                    }

                  }
                });
              }
            }, iRefreshInterval);//Interval of 1 second
          })
            .catch(ex => {
              console.log(ex)
            })
        }
      }
    })
     
        srv.on("resumeSetParallelJobs", async (req) => {
        let hostName = req.headers.host;
        var baseUrl = lbaseUrl;
        var iRefreshInterval = 1000; //1 Second
        var iReqTimeout = 10000;//Timeout of 10 seconds
        if (hostName.includes("localhost:4004") == false) { //For Deployment
          baseUrl = req.headers['x-forwarded-proto'] + '://' + req.headers.host;
        }
        var iJobLimit = 1;
        var aPreferences = await cds.run(
          `SELECT * FROM "CP_USER_PREFERENCES"
           WHERE "PARAMETER" = 'PARALLEL_JOBS'`
        );
        if (aPreferences.length > 0) {
          iJobLimit = parseInt(aPreferences[0].PARAMETER_VALUE);
        }
        
        var  mainJobID = req.data.JOB_ID;
        req.headers['x-sap-job-id'] = mainJobID; //Updating JobID with existing JobID
            //Getting all the data of all Activities based on sequence_ID 
          
            var liJobs = await cds.run(
              `SELECT * FROM "JS_JOB_TEMPLATEDETAILS" WHERE 
              "JOB_ID"='${mainJobID}' AND  ( "ACTIVITY_STATUS" IS NULL OR "ACTIVITY_STATUS" != 'Success' )
              AND "STEP">='${req.data.STEP}'
              ORDER BY "STEP" `
            )
      if (liJobs.length > 0) {
        var HTTPrequest = require('request');
        var iSetIndex = 0;
        var aErrorList =[];
  
        try {
          await UPDATE`JS_JOB_TEMPLATEDETAILS`
            .with({
              JOB_STATUS: 'Pending'
            })
            .where(`JOB_ID = '${mainJobID}'`);
        } catch (e) {
          //DONOTHING
        }
        var oJobs = {};
        var orderedSets = [];
         const oAlert ={},aAlert =[];
        for (var i = 0; i < liJobs.length; i++) {
          let el = liJobs[i];
           let oParameter = el.PARAM_VALUE.toString();
          oAlert[el.STEP] ??={};
          if(oParameter){
            let aParsed = JSON.parse(oParameter);
          oAlert[el.STEP] = {
            "LOCATION_ID":aParsed.LOCATION_ID ?? "*",
            "PRODUCT_ID":aParsed.PRODUCT_ID ?? "*",
            "CUSTOMER_GROUP":aParsed.CUSTOMER_GROUP ?? "",
            "VERSION":aParsed.VERSION ?? "",
            "SCENARIO":aParsed.SCENARIO ?? "",
            "MODEL_VERSION":aParsed.MODEL_VERSION ?? "",
           "ACTIVITY_ID":el.ACTIVITY_ID
           };
          }

          if (!(el.SET in oJobs)) {
            oJobs[el.SET] = {
              jobs: [],
              MANDATORY: el.MANDATORY,
              COMPLETED:false
            };
            orderedSets.push(el.SET);
          }
          oJobs[el.SET].jobs.push(el);
        }
        const finalChunks = splitAndChunkJobs(oJobs, orderedSets, iJobLimit);
        setLoop(finalChunks[0],req);//Entry point
        function setLoop(setData,req){//Looping sets for Parallelization
          let aSets = setData;
          for (const [setKey, setData] of Object.entries(aSets)) { // Parallel sets here
            jobLoop(setData.jobs,setData.jobs[0],req,setKey);
          }
        }
  
        async function jobLoop(aJobs,oCurrentJob,req,index){//Recursive function to schedule Jobs
          //if current step is Mandatory and Previous step had error, don't trigger any job
          if(oCurrentJob.MANDATORY =='X' && aErrorList.length >0){
           await updateStatusByCondition(mainJobID,'Success','Error',aAlert,req);
            return;
          }
          var liSequences = await cds.run(
            `SELECT * FROM "JS_JOB_CREATIONDATA"
            WHERE "SEQUENCE_ID"='${oCurrentJob.SEQUENCE_ID}'
            AND "MAIN_SET"='${oCurrentJob.MAIN_SET}'
            AND "SET"='${oCurrentJob.SET}'
            AND "STEP"='${oCurrentJob.STEP}'
            AND "TEMPLATE_ID"='${oCurrentJob.TEMPLATE_ID}'
            AND "ACTIVITY_ID"='${oCurrentJob.ACTIVITY_ID}'
            ORDER BY "STEP" ASC`
          )
              let jobName = oCurrentJob.ACTIVITY_ID + " (" + oCurrentJob.JOB_ID.toString() + ")" + "_" + new Date().getTime();//Setting Job Name and job Description same as ACTIVITY_ID
      
              let oStepData = '{}';
              if (liSequences[0].STEP_DATA) {
                oStepData = liSequences[0].STEP_DATA.toString();
              }
              let request = getModifiedreq(req, liSequences[0].ACTION_URL, JSON.parse(oStepData))
      
              var sDate = new Date().toISOString().split("T"),
                sTime = sDate[1].split(":");
              var schTime = sDate[0] + " " + sTime[0] + ":" + sTime[1] + " " + "+0000";
              var schTime2 = new Date().setHours(new Date().getHours() + 6);
                var sDate2 = new Date(schTime2).toISOString().split("T"),
                  sTime2 = sDate2[1].split(":");
                var schEndTime = sDate2[0] + " " + sTime2[0] + ":" + sTime2[1] + " " + "+0000";
                var jobendTime = new Date(oCurrentJob.JOB_ENDTIME);
                if(new Date() > jobendTime){
                  var jobETime = new Date(jobendTime).setDate(new Date().getDate() + 1);
                } else {
                  var jobETime = jobendTime;
                }
                var EndDate = new Date(jobETime);
                var padL = (nr, _len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
                var JEndDate =
                      `${EndDate.getFullYear()}-${padL(EndDate.getMonth() + 1)}-${padL(EndDate.getDate())} ${padL(EndDate.getHours())}:${padL(EndDate.getMinutes())}:${padL(EndDate.getSeconds())}` + ".000000000"
                var SStartDate =
                      `${new Date().getFullYear()}-${padL(new Date().getMonth() + 1)}-${padL(new Date().getDate())} ${padL(new Date().getHours())}:${padL(new Date().getMinutes())}:${padL(new Date().getSeconds())}` + ".000000000"
                  var SEndDate =
                  `${new Date(schTime2).getFullYear()}-${padL(new Date(schTime2).getMonth() + 1)}-${padL(new Date(schTime2).getDate())} ${padL(sTime2[0])}:${padL(sTime2[1])}:${padL(sTime2[2].split(".")[0])}` + ".000000000"
  
              //To set read job logs interval
              if (liSequences[0].ACTION_URL == "/pal/genPredictions") {
                iRefreshInterval = 30000 // 30seconds
                if (request.data?.vcRulesList && request.data?.vcRulesList?.length > 0) {//check for impact analysis
                  if (request.data.vcRulesList[0].impactAnalysis == true) {
                    iRefreshInterval = 60000// 60 seconds
                  }
                }
              }
              //Process Sales Order or Generate Forecast Order
              else if(liSequences[0].ACTION_URL == "/catalog/genUniqueID" || liSequences[0].ACTION_URL == "/catalog/genFullConfigDemand"){
                iRefreshInterval = 1000 // 30seconds
              }
              else {
                iRefreshInterval = 1000 // 1 Second
              }
              if (liSequences[0].ACTION_URL == "/catalog/postCIRQuantitiesToS4") {
                saveJobSnapshot(JSON.parse(oStepData), req);
              }
                var sCron = '', STime = schTime;
                const obj = {
                  action: liSequences[0].ACTION_URL,
                  startTime: oCurrentJob.JOB_STARTTIME,
                  endTime: oCurrentJob.JOB_ENDTIME,
                  schedules: [
                    {
                      data: JSON.stringify(request.data),
                      cron: sCron,
                      time: STime,
                      active: true,
                      startTime: schTime,
                      endTime: schEndTime,
                    }
                  ]
                }
                console.log(`Scheduled - SET:${oCurrentJob.SET} STEP:${oCurrentJob.STEP}  `+new Date().toISOString().slice(0, 19).replace('T', ' '))
                  createJobandSchedule(jobName, req, obj, baseUrl, oCurrentJob,schTime,schEndTime,JSON.stringify(request.data)).then(async el => {
                  //After Job Creation, update SubJobID in JS_JOB_TEMPLATEDETAILS
                  let templateObj = {
                    mainJobID: oCurrentJob.JOB_ID,
                    jobID: el.jobID,
                    TEMPLATE_ID: el.TEMPLATE_ID,
                    ACTIVITY_ID: el.ACTIVITY_ID,
                    ACTIVITY_STATUS: 'Pending',
                    SCHEDULE_ID: el.scheduleID,
                    STEP: el.STEP,                  
                    JOB_ENDTIME: JEndDate,
                    SCH_STARTTIME: SStartDate,
                    SCH_ENDTIME:SEndDate
                  }
                  await updateJobDetails(templateObj);
                  oCurrentJob.bJobRunning = false;
                  var jobInterval = setInterval(async () => {
                     if(oCurrentJob.bJobRunning) return;
                    if (el) {//Read from Job Logs (lreadJobRunLogs),to get Job State
                      var auth = await GenFunctions.getAuthorization();
                      let sUrl = baseUrl + '/jobs/readJobRunLogs(jobId=' + el.jobID + ',scheduleId=' + "'" + el.scheduleID + "'" + ',page_size=' + 55 + ',offset=' + 0 + ')';
                      var options = {
                        'method': 'GET',
                        'url': sUrl,
                        'headers': {
                          'Accept': 'application/json',
                          'Accept-Charset': 'utf-8',
                          'Authorization': auth
                        },
                        timeout:iReqTimeout
                      };
                      oCurrentJob.bJobRunning = true;
                      HTTPrequest(options, async function (error, response) {
                        if (error) {//Stop execution       
                           if (error.code == 'ESOCKETTIMEDOUT' ) {//In case of socket timeout, retrying the request
                            if(jobInterval){
                            oCurrentJob.bJobRunning = false;
                            }
                          }
                          else{
                            oCurrentJob.bJobRunning = true;                          
                          templateObj.ACTIVITY_STATUS = "Error";
                          await updateJobDetails(templateObj,aAlert,oAlert,'',null);
                          await updateJobStatus('Error', templateObj.mainJobID);
                          if(jobInterval){
                            clearInterval(jobInterval);
                            jobInterval = null; 
                          }
                        }
                        }
                        else {//Success
                          try {
                            if(jobInterval){
                             oCurrentJob.bJobRunning = false;
                            }
                            if(jobInterval && response && response?.body){
                              var oResponse = JSON.parse(response.body);
                              if(oResponse?.value?.length >0){
                              var oJobinfo = oResponse.value[0];
                              if (oJobinfo) {
                                 if(await checkJobStatus(mainJobID) == false){//Job has error , stop the process
                                    clearInterval(jobInterval);
                                    jobInterval = null; 
                                  req.headers["x-sap-job-id"] = el.jobID;
                                  req.headers["x-sap-job-schedule-id"] = el.scheduleID;
                                  req.headers["x-sap-job-run-id"] = oJobinfo.runId;
                                 return  await GenFunctions.jobSchMessage('', `Job execution has stopped due to Internal Server Error.`, req);
                                  }
                                //Update JS_JOB_TEMPLATEDETAILS ACTIVITY_STATUS
                                const templateObj = {
                                  mainJobID: mainJobID,
                                  jobID: el.jobID,
                                  TEMPLATE_ID: el.TEMPLATE_ID,
                                  ACTIVITY_ID: el.ACTIVITY_ID,
                                  ACTIVITY_STATUS: '',
                                  SCHEDULE_ID: el.scheduleID,
                                  STEP: el.STEP,
                                  JOB_ENDTIME: JEndDate,
                                  SCH_STARTTIME: SStartDate,
                                  SCH_ENDTIME:SEndDate
                                }
                                if (oJobinfo.runState == 'SUCCESS') {
                                  console.log(`Completed - SET:${el.SET} STEP:${el.STEP}  `+new Date().toISOString().slice(0, 19).replace('T', ' '))
                                    clearInterval(jobInterval);
                                    jobInterval = null; 
                                  templateObj.ACTIVITY_STATUS = "Success"
                                  let jobMsg='';
                                  if(oJobinfo.runText){
                                    const parsed = JSON.parse(oJobinfo.runText);
                                  jobMsg = parsed[parsed.length - 1].text.replace(/\s?(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s.*$/, "").trim();
                                  }
                                  await updateJobDetails(templateObj,aAlert,oAlert,jobMsg,oJobinfo);
                                  //Go to Next job in the SET
                                  let aNextStep = finalChunks[iSetIndex][index]['jobs'].filter(f=>f.STEP == el.STEP +1);
                                  if(aNextStep.length >0){//Go to next job in SET
                                    jobLoop(aJobs,aNextStep[0],req,index)
                                  }
                                  else{//Go to Next SET
                                    finalChunks[iSetIndex][index]['COMPLETED']= true;
                                    if(finalChunks[iSetIndex + 1]){//if next sets Exists
                                      if(checkCompleted(finalChunks[iSetIndex]) == true){
                                        iSetIndex+=1;
                                          setLoop(finalChunks[iSetIndex],req);
                                        }
                                    }
                                   else{//update Job status here
                                      updateStatusByCondition(mainJobID,'Error','Success',aAlert,req);
                                   }
                                  }
                                }
                                else if (oJobinfo.runState.toString().includes('ERROR')) {
                                  //if Error, mark that Set as completed
                                  clearInterval(jobInterval);
                                  jobInterval = null; 
                                  finalChunks[iSetIndex][index]['COMPLETED']= true;
                                  templateObj.ACTIVITY_STATUS = "Error"
                                   let jobMsg='';
                                  if(oJobinfo.runText){
                                    const parsed = JSON.parse(oJobinfo.runText);
                                     jobMsg = parsed[parsed.length - 1].text.replace(/\s?(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s.*$/, "").trim();
                                  }
                                  await updateJobDetails(templateObj,aAlert,oAlert,jobMsg,oJobinfo);
                                  aErrorList.push({
                                    "STEP": el.STEP
                                  })
                                   console.log("Error at Step:"+el.STEP);
                                   if(finalChunks[iSetIndex + 1] && finalChunks[iSetIndex][index]['MANDATORY']!='X'){//if next sets Exists and Error not in Mandatory set
                                    if(checkCompleted(finalChunks[iSetIndex]) == true){
                                      iSetIndex+=1;
                                        setLoop(finalChunks[iSetIndex],req);
                                      }
                                   }
                                   else{//update Job status here
                                    updateStatusByCondition(mainJobID,'Success','Error',aAlert,req);
                                   }
                                
                                }
                              }
                            }
                            }
                          }
                          catch (ex) {
                            templateObj.ACTIVITY_STATUS = "Error";
                                   let jobMsg=ex.message;
                            if (jobMsg.length >= 5000) {
                              jobMsg = jobMsg.slice(0, 4995) + "...";
                              }
                            await updateJobDetails(templateObj,aAlert,oAlert,jobMsg,null);
                            await updateJobStatus('Error', mainJobID);
                            console.log("Joberror3" + JSON.stringify(ex.message));
                            if(jobInterval){
                              clearInterval(jobInterval);
                              jobInterval = null; 
                            }
                          }
      
                        }
                      });
                    }
                  }, iRefreshInterval);//Interval of 1 second
                })
                  .catch(ex => {
                    console.log(ex)
                  })
        }
      }
  
      })
       //#region Job Scheduler Resuable functions
    function splitAndChunkJobs(oJobs, orderedKeys, chunkSize) {
      const chunks = [];
      let currentChunk = {};

      for (const setKey of orderedKeys) {
        const setData = oJobs[setKey];
        if (setData.MANDATORY) {
          if (Object.keys(currentChunk).length > 0) {
            chunks.push(currentChunk);
            currentChunk = {};
          }
          chunks.push({ [setKey]: setData });
        } else {
          currentChunk[setKey] = setData;
          if (Object.keys(currentChunk).length >= chunkSize) {
            chunks.push(currentChunk);
            currentChunk = {};
          }
        }
      }

      // Push any remaining non-mandatory sets
      if (Object.keys(currentChunk).length > 0) {
        chunks.push(currentChunk);
      }

      return chunks;
    }
    function checkCompleted(aSets){
      var bCompleted = true;
      for (const [_setKey, setData] of Object.entries(aSets)) {
        if(setData.COMPLETED == false){
          bCompleted = false;
          break;
        }
      }
      return bCompleted;
    }
    
    async function updateStatusByCondition(mainJobID,check,status,aAlert,req){
      let aData = await cds.run(
        `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
      WHERE "JOB_ID" = '` + mainJobID + `'
      ORDER BY
      "STEP" ASC`
      );
      let sStatus =status;

      let aCheck = aData.filter(el=> el.ACTIVITY_STATUS === check);
      if(aCheck.length > 0){
        sStatus ='Warning'
      } 

      try {
        await UPDATE`JS_JOB_TEMPLATEDETAILS`
          .with({
            JOB_STATUS: sStatus
          })
          .where(`JOB_ID = '${mainJobID}'`);
  
      } catch (e) {
        //DONOTHING
      }

      if(aAlert.length >0){
         await GenFunctions.sendAlert('C', aAlert, req);
      }

    }
    
    async function updateJobDetails(data,aAlert,oAlert,jobMsg,oJobInfo) {
      try {
        await UPDATE`JS_JOB_TEMPLATEDETAILS`
          .with({
            SUBJOB_ID: data.jobID,
            ACTIVITY_STATUS: data.ACTIVITY_STATUS,
            SCHEDULE_ID: data.SCHEDULE_ID,
            JOB_ENDTIME: data.JOB_ENDTIME,
            SCH_STARTTIME: data.SCH_STARTTIME,
            SCH_ENDTIME: data.SCH_ENDTIME,
            RUNTEXT:jobMsg
          })
          .where(`JOB_ID = '${data.mainJobID}'
                AND TEMPLATE_ID = '${data.TEMPLATE_ID}'
                AND ACTIVITY_ID = '${data.ACTIVITY_ID}'
                AND STEP = '${data.STEP}'`);
  
  
      } catch (e) {
        //DONOTHING
      }
      //If optimizations
//       if (data.ACTIVITY_ID == 'GENERATE_OPTIMIZATIONS' && data.ACTIVITY_STATUS != 'Pending' && oJobInfo) {
//         try{
//         const parsed = JSON.parse(oJobInfo.runText);
//         const result = await getCFLogs({
//     appName       : 'config_products-srv',
//     startTimestamp: parsed[0].time,
//     endTimestamp  : parsed[parsed.length - 1].time,
//     logLevel      : 'ALL'
// });

// let sJName = data.ACTIVITY_ID +"_"+data.jobID
// //Delete and insert into JS_JOB_LOGS based on JOB_NAME
// await cds.run(`DELETE FROM "JS_JOB_LOGS" WHERE JOB_NAME='${sJName}'`)

// await cds.run(INSERT.into("JS_JOB_LOGS").entries({
//     "JOB_NAME":sJName,
//     "EXECUTION_TIMESTAMP":oJobInfo.executionTimestamp,
//     "LOG":JSON.stringify(result.logs)
// }));
//         }
//         catch(ex){
//           console.log("Error in fetching BTP optimization logs:"+ex.message)
//         }

//       }
      
      //Save into alerts array if it is Success or Error
       const oAlertLog = { MSGID: 'S01', APPL: 'VCPLANNER', MSGGRP: 'PROCESS_JOBS' , "LOCATION_ID":'*', "PRODUCT_ID":'*',"PARA1":'',"PARA2":"","PARA3":"","PARA4":'',"MSGTXT":''};
      if(data.ACTIVITY_STATUS == 'Success'){
       oAlertLog.LOCATION_ID = oAlert[data.STEP]?.LOCATION_ID;
       oAlertLog.PRODUCT_ID = oAlert[data.STEP]?.PRODUCT_ID;
       oAlertLog.PARA1 = oAlert[data.STEP]?.CUSTOMER_GROUP;
       oAlertLog.PARA2 = oAlert[data.STEP]?.VERSION;
       oAlertLog.PARA3 = oAlert[data.STEP]?.SCENARIO;
       oAlertLog.PARA4 = oAlert[data.STEP]?.MODEL_VERSION;
       oAlertLog.PARA5 = oAlert[data.STEP]?.ACTIVITY_ID;
       oAlertLog.MSGTXT = jobMsg;
       aAlert.push(oAlertLog);
      }
      else if(data.ACTIVITY_STATUS == 'Error'){
      oAlertLog.MSGID ='S02';
      oAlertLog.LOCATION_ID = oAlert[data.STEP]?.LOCATION_ID;
       oAlertLog.PRODUCT_ID = oAlert[data.STEP]?.PRODUCT_ID;
       oAlertLog.PARA1 = oAlert[data.STEP]?.CUSTOMER_GROUP;
       oAlertLog.PARA2 = oAlert[data.STEP]?.VERSION;
       oAlertLog.PARA3 = oAlert[data.STEP]?.SCENARIO;
       oAlertLog.PARA4 = oAlert[data.STEP]?.MODEL_VERSION;
       oAlertLog.PARA5 = oAlert[data.STEP]?.ACTIVITY_ID;
      oAlertLog.MSGTXT = jobMsg;
       aAlert.push(oAlertLog);
      }
    }
    async function updateJobStatus(JOB_STATUS, mainJobID) {
      try {
        await UPDATE`JS_JOB_TEMPLATEDETAILS`
          .with({
            JOB_STATUS: JOB_STATUS
          })
          .where(`JOB_ID = '${mainJobID}'`);
  
      } catch (e) {
        //DONOTHING
      }
    }

    function createJobandSchedule(jobName, req, jobData, baseUrl,oJob,startTime, endTime,schData){
      if(oJob.SUBJOB_ID){//Create Schedule
        return new Promise((resolve, reject) => {
          const scheduler = getJobscheduler(req);
          if (scheduler) {
            var myJob = {
              data: schData,
              active: true,
              startTime: startTime,
              endTime: endTime,
              cron: '',
              time: startTime,
            };
            var scJob = { jobId: oJob.SUBJOB_ID, schedule: myJob };
            scheduler.createJobSchedule(scJob, (err, result) => {
              if (err) {
                reject(req.error(err.message));
              } else {
                resolve(
                  {
                    "jobID": oJob.SUBJOB_ID,
                    "scheduleID": result.scheduleId,
                    "TEMPLATE_ID": oJob.TEMPLATE_ID,
                    "ACTIVITY_ID": oJob.ACTIVITY_ID,
                    "STEP": oJob.STEP,
                    "SET":oJob.SET
                  })
              }
            });
          }
        });
      }
      else{//Create Job
        return new Promise((resolve, reject) => {
          const scheduler = getJobscheduler(req);
          var inputData = jobData;
          let actionUrl = baseUrl + inputData.action;
          if (scheduler) {
            var myJob = {
              name: jobName,
              description: jobName,
              action: actionUrl,
              active: true,
              httpMethod: "POST",
              startTime: inputData.startTime,
              endTime: inputData.endTime,
              ansConfig: {
                "onError": true,
                "onSuccess": false
                },
              schedules: inputData.schedules
            };
            var scJob = { job: myJob };
            scheduler.createJob(scJob, function (err, result) {
              if (err) {
                reject(req.error(err.message));
              } else {// job was created successfully,returning JobID and scheduler ID
                resolve(
                  {
                    "jobID": result._id,
                    "scheduleID": result.schedules[0].scheduleId,
                    "TEMPLATE_ID": oJob.TEMPLATE_ID,
                    "ACTIVITY_ID": oJob.ACTIVITY_ID,
                    "STEP": oJob.STEP,
                    "SET": oJob.SET,
                    "JOB_NAME":jobName
                  }
                );
              }
            });
          }
        })
      }
     }
     async function saveJobSnapshot(oSnapData, req) {
      //Call Snapshot function if SnapShot is not empty
      try {
        if (oSnapData.SnapShot) {
          let hostName = req.headers.host;
          var snapShotURL = "";
          if (hostName.includes("localhost:4004")) {
            snapShotURL = lbaseUrl + '/v2/catalog/maintainSnapShot';
          } else {
            let baseUrl = req.headers['x-forwarded-proto'] + '://' + getBaseUrl();
            snapShotURL = baseUrl + '/v2/catalog/maintainSnapShot';
          }
          const HTTPReq = require('https');
          // Define the URL and parameters
          const queryParams = {
            SNAPSHOT_DESC: oSnapData.SnapShot_Desc,
            Mode: oSnapData.SnapShot,
            FROM_DATE: oSnapData.FROM_DATE,
            TO_DATE: oSnapData.TO_DATE,
            VERSION: oSnapData.VERSION
          };
          const url = `${snapShotURL}?${new URLSearchParams(queryParams)}`;
          var auth = await GenFunctions.getAuthorization();
          const options = {
            headers: {
              'Authorization': auth
            }
          };
          // Make the GET request
          HTTPReq.get(url, options, (_response) => {
          }).on('error', (error) => {
            console.log(`Error: ${error.message}`);
          }
          );
        }
      }
      catch (ex) {
        console.log(ex);
      }
    }
    async function checkJobStatus(mainJobID){
          let aCheck = await cds.run(`SELECT JOB_STATUS FROM "JS_JOB_TEMPLATEDETAILS" WHERE JOB_ID='${mainJobID}'`);
          let bValid = true;
          if(aCheck && aCheck?.length >0){
            if(aCheck[0].JOB_STATUS == 'Error'){
              bValid = false;//stop reading logs
            }
          }
          else{//job does not exists, stop reading logs
            bValid = false;
          }
          return bValid;
        }

    //#endregion
    
    ///#endregion

  //Update JobSchedules
  srv.on("updateJobSchedules", async (req) => {
    var sequence = JSON.parse(req.data.SEQUENCE_ID),
      mainJobID = req.data.JOB_ID;
    var liSequences = await cds.run(
      `SELECT * FROM "JS_JOB_CREATIONDATA"
    WHERE "SEQUENCE_ID" = '` + sequence + `'
    ORDER BY 
    "STEP" ASC`
    );
    if (liSequences.length > 0) {

      var liJobs = await cds.run(
        `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
      WHERE "JOB_ID" = '` + mainJobID + `'
      ORDER BY 
      "STEP" ASC`
      );
      if (liJobs.length > 0) {

        await UPDATE`JS_JOB_TEMPLATEDETAILS`.with({ ACTIVE: true })
          .where(`JOB_ID = '${req.data.JOB_ID}'`);

        var jobCount = liJobs.length;
        var iLoopIndex1 = 0,
          iLoopIndex2 = 0;
        ///Function to make jobs active 
        function activateJobs(jobIndex) {
          let subJobID = liJobs[jobIndex].SUBJOB_ID;
          if (subJobID) { //If jobID exists and not null
            const obj = {
              "SUBJOB_ID": subJobID,
              "JOB_STARTTIME": liJobs[jobIndex].JOB_STARTTIME,
              "JOB_ENDTIME": liJobs[jobIndex].JOB_ENDTIME,
            }
            updateJobState(obj).then(_el => {
              iLoopIndex1++;
              if (iLoopIndex1 < jobCount) {
                activateJobs(iLoopIndex1); //Next Job
              } else { //All jobs are activated and now proceed to schedules updation
                jobLoop(iLoopIndex2)
              }
            })
              .catch(ex => {

              })
          }
        }
        //Recursive Function for Job schedules updation
        function jobLoop(jobIndex) {
          let subJobID = liJobs[jobIndex].SUBJOB_ID;
          if (subJobID) {
            let oStepData = '{}';
            if (liSequences[jobIndex].STEP_DATA) {
              oStepData = liSequences[jobIndex].STEP_DATA.toString();
            }
            let request = getModifiedreq(req, liSequences[jobIndex].ACTION_URL, JSON.parse(oStepData))
            var CronValue = '',
              time = liJobs[jobIndex].RECURRENCE_VALUE;
            if (liJobs[jobIndex].JOB_TYPE == 'Cron') {
              CronValue = liJobs[jobIndex].RECURRENCE_VALUE;
              time = '';
            }
            const obj = {
              SUBJOB_ID: liJobs[jobIndex].SUBJOB_ID,
              SCHEDULE_ID: liJobs[jobIndex].SCHEDULE_ID,
              schedules: [{
                data: JSON.stringify(request.data),
                cron: CronValue,
                time: time,
                active: true,
                startTime: liJobs[jobIndex].SCH_STARTTIME,
                endTime: liJobs[jobIndex].SCH_ENDTIME,
              }]
            }
            updateSchedules(req, obj).then(_el => {
              iLoopIndex2++;
              if (iLoopIndex2 < jobCount) {
                jobLoop(iLoopIndex2); //Next Job
              }
            })
              .catch(_ex => {

              })
          }
        }
        activateJobs(iLoopIndex1);
      }
    }

    function updateSchedules(req, jobData) {
      return new Promise((resolve, reject) => {
        const scheduler = getJobscheduler(req);
        if (scheduler) {
          var scJob = {
            jobId: jobData.SUBJOB_ID,
            scheduleId: jobData.scheduleId,
            schedule: jobData.schedules[0]
          };
          scheduler.updateJobSchedule(scJob, (err, _result) => {
            if (err) {
              reject(req.error(err.message));
            } else {
              resolve(true);
            }
          });
        }
      });
    }

    function updateJobState(obj) {
      return new Promise((resolve, reject) => {
        const scheduler = getJobscheduler(req);
        if (scheduler) {
          var theJob = {
            active: true,
            httpMethod: "POST",
            startTime: obj.JOB_STARTTIME,
            endTime: obj.JOB_ENDTIME,
          };
          var suJob = {
            jobId: obj.SUBJOB_ID,
            job: theJob
          };
          scheduler.updateJob(suJob, (err, _result) => {
            if (err) {
              reject(req.error(err.message));
            } else {
              resolve(true);
            }
          });
        }
      });
    }

  });

  //Update updateJobDetails
  srv.on("updateJobDetails", async (req) => {
    var mainJobID = req.data.JOB_ID;

    let Active = true;

    if (req.data.ACTIVE === 'false') {
      Active = false;
    }

    if (mainJobID !== '' || mainJobID !== undefined) {
      var liJobs = await cds.run(
        `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
        WHERE "JOB_ID" = '` + mainJobID + `'
        ORDER BY 
        "STEP" ASC`
      );

      let obj = {
        "SUBJOB_ID": mainJobID,
        "JOB_STARTTIME": liJobs[0].JOB_STARTTIME,
        "JOB_ENDTIME": liJobs[0].JOB_ENDTIME,
      }

      liJobs.push(obj);


      if (liJobs.length > 0) {
        var jobCount = liJobs.length;
        var iLoopIndex1 = 0,
          iLoopIndex2 = 0;
        ///Function to make jobs active 
        function activateJobs(jobIndex) {
          let subJobID = liJobs[jobIndex].SUBJOB_ID;

          if (subJobID) { //If jobID exists and not null
            const obj = {
              "SUBJOB_ID": subJobID,
              "JOB_STARTTIME": liJobs[jobIndex].JOB_STARTTIME,
              "JOB_ENDTIME": liJobs[jobIndex].JOB_ENDTIME,
              "ACTIVE": Active
            }
            changeJobState(obj).then(_el => {
              iLoopIndex1++;
              if (iLoopIndex1 < jobCount) {
                activateJobs(iLoopIndex1); //Next Job
              }
            })
              .catch(ex => {

              })
          }
        }
        activateJobs(iLoopIndex1);
      }
    }

    function changeJobState(obj) {
      return new Promise((resolve, reject) => {
        const scheduler = getJobscheduler(req);
        if (scheduler) {
          var theJob = {
            active: obj.ACTIVE,
            httpMethod: "POST",
            startTime: obj.JOB_STARTTIME,
            endTime: obj.JOB_ENDTIME,
          };
          var suJob = {
            jobId: obj.SUBJOB_ID,
            job: theJob
          };
          scheduler.updateJob(suJob, (err, _result) => {
            if (err) {
              reject(req.error(err.message));
            } else {
              resolve(true);
            }
          });
        }
      });
    }
  });

  //Delete Jobs
  srv.on("deleteJobs", async (req) => {
    var mainJobID = req.data.JOB_ID;
    var JobName = req.data.JOB_NAME;


    if (mainJobID !== '' || mainJobID !== undefined) {
      var liJobs = await cds.run(
        `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
        WHERE "JOB_ID" = ${req.data.JOB_ID} 
              AND "JOB_NAME" =  '${req.data.JOB_NAME}'  
        ORDER BY 
        "STEP" ASC`
      );
      
      if(req.data.VARIANT_FLAG === ""){
        let obj = {
          "SUBJOB_ID": mainJobID
        }
        liJobs.push(obj);
      }

      


      if (liJobs.length > 0) {
        var jobCount = liJobs.length;
        var iLoopIndex1 = 0,
          iLoopIndex2 = 0;
        ///Function to make jobs active 
        function activateJobs(jobIndex) {
          let subJobID = liJobs[jobIndex].SUBJOB_ID;

          if (subJobID) { //If jobID exists and not null
            const obj = {
              "SUBJOB_ID": subJobID,
            }
            changeJobState(obj).then(_el => {
              iLoopIndex1++;
              if (iLoopIndex1 < jobCount) {
                activateJobs(iLoopIndex1); //Next Job
              }
            })
              .catch(ex => {

              })
          }
        }
        activateJobs(iLoopIndex1);
      }
    }

    function changeJobState(obj) {
      return new Promise((resolve, reject) => {
        const scheduler = getJobscheduler(req);
        if (scheduler) {

          var suJob = {
            jobId: obj.SUBJOB_ID
          };
          scheduler.deleteJob(suJob, (err, _result) => {
            if (err) {
              reject(req.error(err.message));
            } else {
              resolve(true);
            }
          });
        }
      });
    }
  });

  //Action to Synchronize Templates
  srv.on("SyncTemplates", async (req) => {
    const liActHeader = await cds.run('SELECT * FROM "JS_ACTIVITY_HEADER"');
    const liActItems = await cds.run(`SELECT *  FROM "JS_ACTIVITY_ITEM"`)
    console.log("req.tenant:", req.tenant);

    //Patch to change value of LEVEL 
    var liTemplateHeaders = await cds.run(`SELECT * FROM "JS_TEMPLATE_HEADER"`);
    var liTempActItem = await cds.run(`SELECT * FROM "JS_TEMPLATE_ACTITEM"`);
    var liTempActItemParams = await cds.run(`SELECT * FROM "JS_TEMPLATE_ACTITEM_PARAM"`);
    //JS_TEMPLATE_HEADER
    if (liTemplateHeaders.length > 0) {
      let aEmptyLevels = liTemplateHeaders.filter(f => f.LEVEL == '' || f.LEVEL == null || f.LEVEL == undefined);
      if (aEmptyLevels.length > 0) {
        for (var a = 0; a < aEmptyLevels.length; a++) {
          let el = aEmptyLevels[a], cLevel = 'E';
          // if(el.LAYER_CODE == 'Global'){//find from liActHeader
          let oData = liActHeader.find(f => f.ACTIVITY_ID == el.TEMPLATE_ID);
          if (oData) {
            cLevel = oData.LEVEL;
          }
          // }
          await UPDATE`JS_TEMPLATE_HEADER`
            .with({
              LEVEL: cLevel
            })
            .where(`TEMPLATE_ID = '${el.TEMPLATE_ID}'`);
        }
      }
    }
    //JS_TEMPLATE_ACTITEM
    if (liTempActItem.length > 0) {
      let aEmptyLevels = liTempActItem.filter(f => f.LEVEL == '' || f.LEVEL == null || f.LEVEL == undefined);
      if (aEmptyLevels.length > 0) {
        for (var a = 0; a < aEmptyLevels.length; a++) {
          let el = aEmptyLevels[a], cLevel = 'E';
          // if(el.TEMPLATE_ID == el.ACTIVITY_ID && el.ACT_POSITION == 1){//find from liActHeader
          let oData = liActHeader.find(f => f.ACTIVITY_ID == el.TEMPLATE_ID);
          if (oData) {
            cLevel = oData.LEVEL;
          }
          // }
          await UPDATE`JS_TEMPLATE_ACTITEM`
            .with({
              LEVEL: cLevel
            })
            .where(`TEMPLATE_ID = '${el.TEMPLATE_ID}' AND ACTIVITY_ID='${el.ACTIVITY_ID}' AND ACT_POSITION ='${el.ACT_POSITION}' `);
        }
      }
    }
    //JS_TEMPLATE_ACTITEM_PARAM
    if (liTempActItemParams.length > 0) {
      let aEmptyLevels = liTempActItemParams.filter(f => f.LEVEL == '' || f.LEVEL == null || f.LEVEL == undefined);
      if (aEmptyLevels.length > 0) {
        for (var a = 0; a < aEmptyLevels.length; a++) {
          let el = aEmptyLevels[a], cLevel = 'E';
          // if(el.TEMPLATE_ID == el.ACTIVITY_ID && el.VALUE == ''){//find from liActHeader
          let oData = liActHeader.find(f => f.ACTIVITY_ID == el.TEMPLATE_ID);
          if (oData) {
            cLevel = oData.LEVEL;
          }
          // }
          await UPDATE`JS_TEMPLATE_ACTITEM_PARAM`
            .with({
              LEVEL: cLevel
            })
            .where(`TEMPLATE_ID = '${el.TEMPLATE_ID}' AND ACTIVITY_ID='${el.ACTIVITY_ID}' AND ACT_POSITION='${el.ACT_POSITION}' AND PARAMETER_ID='${el.PARAMETER_ID}'`);
        }
      }
    }
    //Patch to change value of LEVEL 


    const liTemplateHeader = await cds.run(`SELECT *
FROM "JS_TEMPLATE_HEADER" WHERE ( UPPER("LAYER_CODE") = UPPER('Global') );`);
    const liTemplateActItems = await cds.run(`SELECT *
FROM "JS_TEMPLATE_ACTITEM" WHERE ( UPPER("ACT_POSITION") = UPPER('1') 
AND "TEMPLATE_ID" = "ACTIVITY_ID" );`)
    const liTemplateActItemParams = await cds.run(`SELECT *FROM "JS_TEMPLATE_ACTITEM_PARAM"
WHERE ( UPPER("ACT_POSITION") = UPPER('1') 
  AND "TEMPLATE_ID" = "ACTIVITY_ID");
`)
    const isDataInParent = (a, b) => a.ACTIVITY_ID.toString().trim() === b.TEMPLATE_ID.toString().trim();

    function isParametersInParent(a, b) {
      var sParameter = a.PARAMETER_ID.toString().trim();
      if (a.PARAMETER_ID == "MF_LOCATION") {
        sParameter = "MF_LOCATION_ID";
      } else if (a.PARAMETER_ID == "DM_LOCATION") {
        sParameter = "LOCATION_ID";
      } else if (a.PARAMETER_ID == "PARTIAL_PRODUCT" || a.PARAMETER_ID == "CONFIG_PRODUCT") {
        sParameter = "PRODUCT_ID";
      }
      return (
        a.ACTIVITY_ID.toString().trim() === b.TEMPLATE_ID.toString().trim() &&
        sParameter === b.PARAMETER_ID.toString().trim()
      );
    }
    const onlyInLeft = (left, right, compareFunction) =>
      left.filter(leftValue =>
        !right.some(rightValue =>
          compareFunction(leftValue, rightValue)));

    var aTemplates = [],
      aTempActItems = [],
      aTempAItemParams = [];
    try {
      await GenFunctions.logMessage(req, `Started Syncing Templates Data`);
      //#region Template Header
      if (liTemplateHeader.length == 0) { //No data exists in Template Header,directly insert into JS_TEMPLATE_HEADER
        liActHeader.forEach(el => {
          const obj1 = {
            TEMPLATE_ID: el.ACTIVITY_ID.toString().trim(),
            TEMPLATE_DESC: el.ACTIVITY_DESC,
            STEPS: 1,
            LAYER_CODE: "Global",
            LEVEL: el.LEVEL
          }
          aTemplates.push(obj1);
        })
      } else { //Already exists, now compare and check anything new exists in JS_ACTIVITY_HEADER
        var aDiff = onlyInLeft(liActHeader, liTemplateHeader, isDataInParent);
        if (aDiff.length > 0) {
          aDiff.forEach(el => {
            const obj1 = {
              TEMPLATE_ID: el.ACTIVITY_ID.toString().trim(),
              TEMPLATE_DESC: el.ACTIVITY_DESC,
              STEPS: 1,
              LAYER_CODE: "Global",
              LEVEL: el.LEVEL
            }
            aTemplates.push(obj1);
          })
        }
      }
      if (aTemplates.length > 0) {
        await cds.run(INSERT.into("JS_TEMPLATE_HEADER").entries(aTemplates));
      }
      //#endregion

      //#region Template ACTItem
      if (liTemplateActItems.length == 0) { //No data exists in Template Act Items,directly insert into JS_TEMPLATE_ACTITEM
        liActHeader.forEach(el => {
          const obj2 = {
            TEMPLATE_ID: el.ACTIVITY_ID.toString().trim(),
            ACTIVITY_ID: el.ACTIVITY_ID.toString().trim(),
            ACT_POSITION: 1,
            STEP_NAME: el.ACTIVITY_ID.toString().trim(),
            LEVEL: el.LEVEL
          }
          aTempActItems.push(obj2);
        })
      } else { //Already exists, now compare and check anything new exists in JS_ACTIVITY_HEADER
        var aItemsDiff = onlyInLeft(liActHeader, liTemplateActItems, isDataInParent);
        if (aItemsDiff.length > 0) {
          aItemsDiff.forEach(el => {
            const obj2 = {
              TEMPLATE_ID: el.ACTIVITY_ID.toString().trim(),
              ACTIVITY_ID: el.ACTIVITY_ID.toString().trim(),
              ACT_POSITION: 1,
              STEP_NAME: el.ACTIVITY_ID.toString().trim(),
              LEVEL: el.LEVEL
            }
            aTempActItems.push(obj2);
          })
        }
      }
      if (aTempActItems.length > 0) {
        await cds.run(INSERT.into("JS_TEMPLATE_ACTITEM").entries(aTempActItems));
      }
      //#endregion

      //#region  Template ACTItem Params
      if (liTemplateActItemParams.length == 0) { //No data exists,directly insert into JS_TEMPLATE_ACTITEM_PARAM
        liActItems.forEach(el => {
          var sParameter = el.PARAMETER_ID.toString().trim();
          if (el.PARAMETER_ID == "MF_LOCATION") {
            sParameter = "MF_LOCATION_ID";
          } else if (el.PARAMETER_ID == "DM_LOCATION") {
            sParameter = "LOCATION_ID";
          } else if (el.PARAMETER_ID == "PARTIAL_PRODUCT" || el.PARAMETER_ID == "CONFIG_PRODUCT") {
            sParameter = "PRODUCT_ID";
          }
          const obj3 = {
            TEMPLATE_ID: el.ACTIVITY_ID.toString().trim(),
            ACTIVITY_ID: el.ACTIVITY_ID.toString().trim(),
            ACT_POSITION: 1,
            PARAMETER_ID: sParameter,
            VALUE: '',
            LEVEL: el.LEVEL
          }
          aTempAItemParams.push(obj3);
        })
      } else { //Already exists, now compare and check anything new exists in JS_ACTIVITY_ITEM
        var aItemParamsDiff = onlyInLeft(liActItems, liTemplateActItemParams, isParametersInParent);
        if (aItemParamsDiff.length > 0) {
          aItemParamsDiff.forEach(el => {
            var sParameter = el.PARAMETER_ID.toString().trim();
            if (el.PARAMETER_ID == "MF_LOCATION") {
              sParameter = "MF_LOCATION_ID";
            } else if (el.PARAMETER_ID == "DM_LOCATION") {
              sParameter = "LOCATION_ID";
            } else if (el.PARAMETER_ID == "PARTIAL_PRODUCT" || el.PARAMETER_ID == "CONFIG_PRODUCT") {
              sParameter = "PRODUCT_ID";
            }
            const obj3 = {
              TEMPLATE_ID: el.ACTIVITY_ID.toString().trim(),
              ACTIVITY_ID: el.ACTIVITY_ID.toString().trim(),
              ACT_POSITION: 1,
              PARAMETER_ID: sParameter,
              VALUE: '',
              LEVEL: el.LEVEL
            }
            aTempAItemParams.push(obj3);
          })
        }
      }
      if (aTempAItemParams.length > 0) {
        await cds.run(INSERT.into("JS_TEMPLATE_ACTITEM_PARAM").entries(aTempAItemParams));
      }
      //#endregion

      //All steps completed, Log Job scheduler as success
      await GenFunctions.jobSchMessage('X', "Templates Sync Completed!", req);
    } catch (ex) {
      console.log(ex);
      await GenFunctions.jobSchMessage('', `Templates Sync Failed due to ${ex}`, req);
    }
  })
  //Action to map CHAR_VALUE with CHARVAL_NUM for multiple tables
  srv.on("modifyTablesData", async (req) => {
    try {
      await updateCharValue("CP_OBJDEP_HEADER_MASTER");
      await updateCharValue("CP_OBJDEP_HEADER");
      await updateCharValue("CP_PARTIALPROD_CHAR");
      await updateCharValue("CP_PARTIALPROD_CHAR_MASTER");
      await updateCharValue("CP_UNIQUE_ID_ITEM");
      await updateCharValue("CP_DERIVEDCHAR");
      await updateCharValue("CP_DERIVEDCHAR_MASTER");
      await updateCharValue("CP_DERIVED_PERCENTAGE");
      await updateCharValue("CP_PARTIALPROD_CHAR_VALIDITY");
      await updateCharValue("CP_SALESH_CONFIG");


      //for CP_ASSEMBLY_REQ , update FACTORY_LOC with FACTORY_LOC from CP_FACTORY_SALESLOC based on matching LOCATION_ID, PRODUCT_ID

      await cds.run(`UPDATE "CP_ASSEMBLY_REQ"
                        SET "FACTORY_LOC" = (
                                              SELECT "CP_FACTORY_SALESLOC"."FACTORY_LOC"
                                                FROM "CP_FACTORY_SALESLOC"
                                               WHERE "CP_ASSEMBLY_REQ"."LOCATION_ID" = "CP_FACTORY_SALESLOC"."LOCATION_ID"
                                                 AND "CP_ASSEMBLY_REQ"."PRODUCT_ID" = "CP_FACTORY_SALESLOC"."PRODUCT_ID"
                                            )
                      WHERE "FACTORY_LOC" = 'NA'
                        AND EXISTS (
                                     SELECT 1
                                       FROM "CP_FACTORY_SALESLOC"
                                      WHERE "CP_ASSEMBLY_REQ"."LOCATION_ID" = "CP_FACTORY_SALESLOC"."LOCATION_ID"
                                        AND "CP_ASSEMBLY_REQ"."PRODUCT_ID" = "CP_FACTORY_SALESLOC"."PRODUCT_ID"
                                    );`)


      // Update CHARVALUE-VALNUM table
      let aCharVal = [], aCharValNum = [];
      aCharValNum = await cds.run(`SELECT * FROM CP_CHARVALUE_VALNUM`);
      if (aCharValNum.length === 0) {
        aCharVal = await cds.run(`SELECT DISTINCT CLASS_NUM,
                                         CHAR_NUM,
                                         CHAR_VALUE,
                                         CHAR_NAME,
                                         CHARVAL_NUM,
                                         CHARVAL_DESC
                                  FROM V_CLASSCHARVAL`);

        if (aCharVal.length > 0) {
          await cds.run(INSERT.into("CP_CHARVALUE_VALNUM").entries(aCharVal));
        }
      }




      await GenFunctions.jobSchMessage('X', "Tables mapping completed!", req);
    } catch (ex) {
      await GenFunctions.jobSchMessage('', `Tables mapping Failed due to ${ex.message}`, req);
    }
    async function updateCharValue(tableName) {
      await GenFunctions.logMessage(req, `Started mapping ${tableName}`);
      let aCharVal = [], aTabData = [];
      aCharVal = await cds.run(`SELECT * FROM V_CLASSCHARVAL`);
      aTabData = await cds.run(`SELECT * FROM ${tableName} WHERE CHAR_VALUE = 'NA'`);
      // await cds.run(`UPDATE ${tableName}
      //                   SET "CHAR_VALUE" = "CHARVAL_NUM"
      //                 WHERE ( UPPER("CHAR_VALUE") = UPPER('NA') )`);

      if (aTabData.length > 0) {
        const keys = ['CHAR_NUM', 'CHARVAL_NUM'];
        aTabData = GenFunctions.removeDuplicate(aTabData, keys);

        for (let i = 0; i < aTabData.length; i++) {
          let oCharValue = {};
          oCharValue = aCharVal.find(
            (oCharVal) => oCharVal.CHAR_NUM === aTabData[i].CHAR_NUM &&
              oCharVal.CHARVAL_NUM === aTabData[i].CHARVAL_NUM
          );

          if (oCharValue) {
            try {
              await cds.run(`UPDATE ${tableName}
                              SET "CHAR_VALUE" = '${oCharValue.CHAR_VALUE}',
                                  "CHARVAL_NUM" = '${oCharValue.CHAR_VALUE}'
                            WHERE "CHAR_NUM" = '${aTabData[i].CHAR_NUM}'
                              AND "CHARVAL_NUM" = '${aTabData[i].CHARVAL_NUM}'
                              AND  "CHAR_VALUE" = 'NA'`);
            } catch (e) {
              console.log(tableName + ' : ' + e);
            }
          }
        }
      }

      await GenFunctions.logMessage(req, `Finished mapping ${tableName}`);
    }
  })
  srv.on("getJobStatusNew", async (req) => {
    let loc = req.data.LOCATION_ID
    let prod = req.data.PRODUCT_ID;
    let restart = "Restart Job";
    var sQuery = ''
    if(loc !== '' && prod !== ''){
      sQuery = `SELECT * FROM "V_JOBSTATUS"  WHERE "RUNTEXT" LIKE ('%${loc}%') AND "RUNTEXT" LIKE('%${prod}%') AND "JOB_NAME" NOT LIKE('%${restart}%')  ORDER BY "JOB_ID" DESC`;
    } else if(loc !== '' && prod === ''){
      sQuery = `SELECT * FROM "V_JOBSTATUS"  WHERE "RUNTEXT" LIKE ('%${loc}%') AND "JOB_NAME" NOT LIKE('%${restart}%')  ORDER BY "JOB_ID" DESC`;
    } else if(loc === '' && prod !== ''){
      sQuery = `SELECT * FROM "V_JOBSTATUS"  WHERE "RUNTEXT" LIKE ('%${prod}%') AND "JOB_NAME" NOT LIKE('%${restart}%')  ORDER BY "JOB_ID" DESC`;
    }
    else{
      sQuery =`SELECT * FROM "V_JOBSTATUS" WHERE "JOB_NAME" NOT LIKE('%${restart}%') ORDER BY "JOB_ID" DESC`
    }
           
            return JSON.stringify(await cds.run(sQuery));
  });
  //Purging Alerts 
  srv.on("purgeAlerts", async (req) => {
    const axios = require("axios");

    const { baseUrl, auth } = await GenFunctions.getAlertToken(req);
    const newBaseUrl = baseUrl + `/catalog/purgeAlerts`

     await axios.post(newBaseUrl,{}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      }
    });
    await GenFunctions.jobSchMessage('X', "Purge Alerts is Successfull", req);
  })

  //Lag Calculation
  srv.on("maintainLags", async(req)=>{
    //If it is a Recurring Job, execute it only on calendar End Date
    let currentDate = new Date().toISOString().split('T')[0];
    let ijobId = req.headers['x-sap-job-id'];
    if(ijobId){
      let aJob = await cds.run(`SELECT DISTINCT "JOB_TYPE" FROM "JS_JOB_TEMPLATEDETAILS" WHERE SUBJOB_ID='${ijobId}'`);
      if(aJob && aJob.length >0){
        if(aJob[0].JOB_TYPE == 'Recurrence Pattern'){//Recurrence
          let aCalendar = await cds.run(`SELECT DISTINCT PERIODDESC,WEEK_STARTDATE,WEEK_ENDDATE FROM "CP_IBPCALENDER_WEEK" WHERE "LEVEL"='M' AND "WEEK_ENDDATE"='${currentDate}'`)
          if(aCalendar.length == 0){
             await GenFunctions.jobSchMessage('X', "Calendar month Lags generation skipped — current date is not at the end of the calendar month", req);
             return;
          }
        }
      }
    }
    let iDate = parseInt(currentDate.split("-")[2]);
    let iLags = await GenFunctions.getSystemConfig("LAGS");
    let aCal = await cds.run(`SELECT DISTINCT PERIODDESC,WEEK_STARTDATE,WEEK_ENDDATE FROM "CP_IBPCALENDER_WEEK" WHERE "LEVEL"='M' AND '${currentDate}'>=WEEK_STARTDATE AND '${currentDate}'<=WEEK_ENDDATE`)
    if(aCal.length >0){//End of Calendar Month
        await generateLags(currentDate,iLags,aCal)//Generating Lag for future months
        // if(iDate <7){//First week of the month,refresh previous Lag
        //   let aPreviousCalendar = await cds.run(`SELECT TOP 1 PERIODDESC,WEEK_STARTDATE,WEEK_ENDDATE FROM "CP_IBPCALENDER_WEEK" WHERE "LEVEL"='M' AND WEEK_STARTDATE < '${aCal[0].WEEK_STARTDATE}'
        // ORDER BY WEEK_STARTDATE DESC`);
        // if(aPreviousCalendar.length >0){
        //   await generateLags(aPreviousCalendar[0].WEEK_ENDDATE,iLags,aPreviousCalendar);
        // }
        // }
          await GenFunctions.jobSchMessage('X', "Calendar month Lags Generation is Successful", req);
    }
    else{
       await GenFunctions.jobSchMessage('', "Calendar month Lags Generation Failed - Current Date not maintained in Calendar", req);
    }
    
    async function generateLags(currentDate,iLags,aCalendar){
       //#region  Assembly Lag
        let aAssemblyData = await cds.run(
          `WITH REF_MONTHS AS (
    SELECT DISTINCT PERIODDESC
    FROM "CP_IBPCALENDER_WEEK"
    WHERE "LEVEL"='M'
      AND "WEEK_STARTDATE" > '${currentDate}'
    ORDER BY PERIODDESC ASC
    LIMIT '${iLags}'
),
ALL_COMB AS (
    SELECT DISTINCT "FACTORY_LOC","LOCATION_ID", "PRODUCT_ID", "COMPONENT"
    FROM "CP_ASSEMBLY_REQ"
    WHERE VERSION='__BASELINE'
      AND SCENARIO='_PLAN'
),
ACTUAL_QTY AS (
    SELECT DISTINCT
        CASE
            WHEN AR."FACTORY_LOC" IS NULL OR AR."FACTORY_LOC" = 'NA' OR AR."FACTORY_LOC" = ''
            THEN FS."FACTORY_LOC"
            ELSE AR."FACTORY_LOC"
        END AS "FACTORY_LOC",
        AR."LOCATION_ID",
        AR."PRODUCT_ID",
        AR."COMPONENT",
        SUM(AR.COMPCIR_QTY) AS "ACT_QTY"
    FROM "CP_ASSEMBLY_REQ" AR
    LEFT JOIN "CP_FACTORY_SALESLOC" FS
        ON AR."LOCATION_ID" = FS."LOCATION_ID"
       AND AR."PRODUCT_ID" = FS."PRODUCT_ID"
    WHERE AR.VERSION='__BASELINE'
      AND AR.SCENARIO='_PLAN'
      AND AR.WEEK_DATE BETWEEN '${aCalendar[0].WEEK_STARTDATE}' AND '${aCalendar[0].WEEK_ENDDATE}'
    GROUP BY
        CASE
            WHEN AR."FACTORY_LOC" IS NULL OR AR."FACTORY_LOC" = 'NA' OR AR."FACTORY_LOC" = ''
            THEN FS."FACTORY_LOC"
            ELSE AR."FACTORY_LOC"
        END,
        AR."LOCATION_ID",
        AR."PRODUCT_ID",
        AR."COMPONENT"
),
DATA AS (
    SELECT
       CASE
       WHEN  AC."FACTORY_LOC" IS NULL OR  AC."FACTORY_LOC" ='NA' OR  AC."FACTORY_LOC"=''
       THEN FS."FACTORY_LOC"
       ELSE  AC."FACTORY_LOC"
       END AS "FACTORY_LOC",
        AC."LOCATION_ID",
        AC."PRODUCT_ID",
        AC."COMPONENT" AS "ASSEMBLY",
        RM.PERIODDESC AS "MONTH",
        -- TO_VARCHAR(CAL.WEEK_STARTDATE, 'YYYY-MM') AS YEAR_MONTH,
        COALESCE(SUM(AR."COMPCIR_QTY"), 0) AS "LAG_QTY",
          '${aCalendar[0].PERIODDESC}' AS "ACTUAL_MONTH"
    FROM REF_MONTHS RM
    CROSS JOIN ALL_COMB AC
    LEFT JOIN "CP_IBPCALENDER_WEEK" CAL
        ON CAL.PERIODDESC = RM.PERIODDESC
       AND CAL.LEVEL='M'
    LEFT JOIN "CP_ASSEMBLY_REQ" AR
        ON AR.WEEK_DATE >= CAL.WEEK_STARTDATE
       AND AR.WEEK_DATE <= CAL.WEEK_ENDDATE
       AND AR."LOCATION_ID" = AC."LOCATION_ID"
       AND AR."PRODUCT_ID" = AC."PRODUCT_ID"
       AND AR."COMPONENT" = AC."COMPONENT"
       AND AR.VERSION='__BASELINE'
       AND AR.SCENARIO='_PLAN'
    LEFT JOIN "CP_FACTORY_SALESLOC" FS
        ON AC."LOCATION_ID" = FS."LOCATION_ID"
       AND AC."PRODUCT_ID" = FS."PRODUCT_ID"
    GROUP BY
        CASE
        WHEN AC."FACTORY_LOC" IS NULL 
             OR AC."FACTORY_LOC" = 'NA' 
             OR AC."FACTORY_LOC" = ''
        THEN FS."FACTORY_LOC"
        ELSE AC."FACTORY_LOC"
    	END,
        AC."LOCATION_ID",
        AC."PRODUCT_ID",
        AC."COMPONENT",
        RM.PERIODDESC
)
SELECT D.*,
	COALESCE(A."ACT_QTY", 0) AS "ACTUAL_QTY",
       ROW_NUMBER() OVER (
           PARTITION BY D."FACTORY_LOC", D."LOCATION_ID", D."PRODUCT_ID", D."ASSEMBLY"
           ORDER BY D."MONTH"
       ) AS LAG_MONTH
FROM DATA D
LEFT JOIN ACTUAL_QTY A
	ON D."FACTORY_LOC" = A."FACTORY_LOC"
    AND  D."LOCATION_ID" = A."LOCATION_ID"
   AND D."PRODUCT_ID" = A."PRODUCT_ID"
   AND D."ASSEMBLY" = A."COMPONENT"
ORDER BY "FACTORY_LOC", "LOCATION_ID", "PRODUCT_ID", "ASSEMBLY", "MONTH";
`
        )
        if(aAssemblyData.length >0){
          await cds.run(`DELETE FROM "CP_SNAPSHOT_LAG_ASMB" WHERE ACTUAL_MONTH='${aCalendar[0].PERIODDESC}'`);
           await cds.run(INSERT.into("CP_SNAPSHOT_LAG_ASMB").entries(aAssemblyData));
        }
        aAssemblyData = null;
      //#endregion

      //#region Option Percentage Lag
        let aFCharPlan = await cds.run(`WITH REF_MONTHS AS (
    SELECT DISTINCT PERIODDESC
    FROM "CP_IBPCALENDER_WEEK"
    WHERE "LEVEL"='M'
      AND "WEEK_STARTDATE" > '${currentDate}'
    ORDER BY PERIODDESC ASC
    LIMIT '${iLags}'
),
ALL_COMB AS (
    SELECT DISTINCT "LOCATION_ID", "PRODUCT_ID", "CHAR_NUM","CHARVAL_NUM"
    FROM "CP_IBP_FCHARPLAN"
    WHERE VERSION='__BASELINE'
      AND SCENARIO='_PLAN'
),
ACTUAL_QTY AS (
    SELECT 
        "LOCATION_ID",
        "PRODUCT_ID",
        "CHAR_NUM",
        "CHARVAL_NUM",
        SUM(OPT_QTY) AS "ACT_QTY"
    FROM "CP_IBP_FCHARPLAN"
    WHERE VERSION='__BASELINE'
      AND SCENARIO='_PLAN'
     AND WEEK_DATE BETWEEN '${aCalendar[0].WEEK_STARTDATE}' AND '${aCalendar[0].WEEK_ENDDATE}'
    GROUP BY "LOCATION_ID", "PRODUCT_ID","CHAR_NUM","CHARVAL_NUM"
),
DATA AS (
	SELECT
        FS."FACTORY_LOC",
        AC."LOCATION_ID",
        AC."PRODUCT_ID",
        AC."CHAR_NUM" AS "CHAR_NUM",
        AC."CHARVAL_NUM" AS "CHAR_VALUE",
        RM.PERIODDESC AS "MONTH",
        -- TO_VARCHAR(CAL.WEEK_STARTDATE, 'YYYY-MM') AS YEAR_MONTH,
        COALESCE(SUM(AR."OPT_QTY"), 0) AS "LAG_QTY",
          '${aCalendar[0].PERIODDESC}' AS "ACTUAL_MONTH"
    FROM REF_MONTHS RM
    CROSS JOIN ALL_COMB AC
    LEFT JOIN "CP_IBPCALENDER_WEEK" CAL
        ON CAL.PERIODDESC = RM.PERIODDESC
       AND CAL.LEVEL='M'
    LEFT JOIN "CP_IBP_FCHARPLAN" AR
        ON AR.WEEK_DATE >= CAL.WEEK_STARTDATE
       AND AR.WEEK_DATE <= CAL.WEEK_ENDDATE
       AND AR."LOCATION_ID" = AC."LOCATION_ID"
       AND AR."PRODUCT_ID" = AC."PRODUCT_ID"
       AND AR."CHAR_NUM" = AC."CHAR_NUM"
       AND AR."CHARVAL_NUM" = AC."CHARVAL_NUM"
       AND AR.VERSION='__BASELINE'
       AND AR.SCENARIO='_PLAN'
    LEFT JOIN "CP_FACTORY_SALESLOC" FS
        ON AC."LOCATION_ID" = FS."LOCATION_ID"
       AND AC."PRODUCT_ID" = FS."PRODUCT_ID"
    GROUP BY
        FS."FACTORY_LOC",
        AC."LOCATION_ID",
        AC."PRODUCT_ID",
        AC."CHAR_NUM",
        AC."CHARVAL_NUM",
        RM.PERIODDESC
)
SELECT D.*,
	COALESCE(A."ACT_QTY", 0) AS "ACTUAL_QTY",
       ROW_NUMBER() OVER (
           PARTITION BY D."FACTORY_LOC",D."LOCATION_ID",D."PRODUCT_ID",D."CHAR_NUM",D."CHAR_VALUE"
           ORDER BY D."MONTH"
       ) AS LAG_MONTH
FROM DATA D
LEFT JOIN ACTUAL_QTY A
    ON D."LOCATION_ID" = A."LOCATION_ID"
   AND D."PRODUCT_ID" = A."PRODUCT_ID"
   AND D."CHAR_NUM" = A."CHAR_NUM"
   AND D."CHAR_VALUE" = A."CHARVAL_NUM"
  ORDER BY D."FACTORY_LOC", D."LOCATION_ID", D."PRODUCT_ID", D."CHAR_NUM",D."CHAR_VALUE",D."MONTH";`); 
        if(aFCharPlan.length>0){
           await cds.run(`DELETE FROM "CP_SNAPSHOT_LAG_OPT" WHERE ACTUAL_MONTH='${aCalendar[0].PERIODDESC}'`);
               await cds.run(INSERT.into("CP_SNAPSHOT_LAG_OPT").entries(aFCharPlan));
          }
          aFCharPlan = null;
      //#endregion

        //#region Restrictions Lag
          let aRestrictions = await cds.run(`WITH REF_MONTHS AS (
    SELECT DISTINCT PERIODDESC
    FROM "CP_IBPCALENDER_WEEK"
    WHERE "LEVEL"='M'
      AND "WEEK_STARTDATE" > '${currentDate}'
    ORDER BY PERIODDESC ASC
    LIMIT '${iLags}'
),
ALL_COMB AS (
    SELECT DISTINCT "LOCATION_ID", "LINE_ID", "RESTRICTION"
    FROM "V_RSTRREQ_PRODCONSD"
    WHERE VERSION='__BASELINE'
      AND SCENARIO='_PLAN'
),
FAC_LOC AS (
	SELECT DISTINCT FACTORY_LOC,LOCATION_ID FROM "CP_FACTORY_SALESLOC"
),
ACTUAL_QTY AS (
    SELECT 
        "LOCATION_ID",
        "LINE_ID",
        "RESTRICTION",
        SUM(RTR_QTY) AS "ACT_QTY"
    FROM "V_RSTRREQ_PRODCONSD"
    WHERE VERSION='__BASELINE'
      AND SCENARIO='_PLAN'
      AND WEEK_DATE BETWEEN '${aCalendar[0].WEEK_STARTDATE}' AND '${aCalendar[0].WEEK_ENDDATE}'
    GROUP BY "LOCATION_ID", "LINE_ID","RESTRICTION"
),
DATA AS (
	SELECT
        FS."FACTORY_LOC",
        AC."LOCATION_ID",
        AC."LINE_ID",
        AC."RESTRICTION" ,
        RM.PERIODDESC AS "MONTH",
        COALESCE(SUM(AR."RTR_QTY"), 0) AS "LAG_QTY",
         '${aCalendar[0].PERIODDESC}' AS "ACTUAL_MONTH"
    FROM REF_MONTHS RM
    CROSS JOIN ALL_COMB AC
    LEFT JOIN "CP_IBPCALENDER_WEEK" CAL
        ON CAL.PERIODDESC = RM.PERIODDESC
       AND CAL.LEVEL='M'
    LEFT JOIN "V_RSTRREQ_PRODCONSD" AR
        ON AR.WEEK_DATE >= CAL.WEEK_STARTDATE
       AND AR.WEEK_DATE <= CAL.WEEK_ENDDATE
       AND AR."LOCATION_ID" = AC."LOCATION_ID"
       AND AR."LINE_ID" = AC."LINE_ID"
       AND AR."RESTRICTION" = AC."RESTRICTION"
       AND AR.VERSION='__BASELINE'
       AND AR.SCENARIO='_PLAN'
    LEFT JOIN "FAC_LOC" FS
        ON AC."LOCATION_ID" = FS."LOCATION_ID" OR  AC."LOCATION_ID" = FS."FACTORY_LOC"
    GROUP BY
        FS."FACTORY_LOC",
        AC."LOCATION_ID",
        AC."LINE_ID",
        AC."RESTRICTION",
        RM.PERIODDESC
)
SELECT  D.*,
		COALESCE(A."ACT_QTY", 0) AS "ACTUAL_QTY",
       ROW_NUMBER() OVER (
           PARTITION BY D."FACTORY_LOC", D."LOCATION_ID", D."LINE_ID", D."RESTRICTION"
           ORDER BY D."MONTH"
       ) AS LAG_MONTH
FROM DATA D
LEFT JOIN ACTUAL_QTY A
    ON D."LOCATION_ID" = A."LOCATION_ID"
   AND D."LINE_ID" = A."LINE_ID"
   AND D."RESTRICTION" = A."RESTRICTION"
          ORDER BY D."FACTORY_LOC", D."LOCATION_ID", D."LINE_ID", D."RESTRICTION",D."MONTH";`)
          if(aRestrictions.length>0){
            await cds.run(`DELETE FROM "CP_SNAPSHOT_LAG_RTR" WHERE ACTUAL_MONTH='${aCalendar[0].PERIODDESC}'`);
               await cds.run(INSERT.into("CP_SNAPSHOT_LAG_RTR").entries(aRestrictions));
           }
           aRestrictions = null;
        //#endregion

        //#endregion Product Demand
          let aPDemand = await cds.run(`WITH REF_MONTHS AS (
    SELECT DISTINCT PERIODDESC
    FROM "CP_IBPCALENDER_WEEK"
    WHERE "LEVEL"='M'
      AND "WEEK_STARTDATE" > '${currentDate}'
    ORDER BY PERIODDESC ASC
    LIMIT '${iLags}'
),
ALL_COMB AS (
    SELECT DISTINCT "LOCATION_ID", "PRODUCT_ID"
    FROM "CP_IBP_FUTUREDEMAND"
    WHERE VERSION='__BASELINE'
      AND SCENARIO='_PLAN'
),
ACTUAL_QTY AS (
    SELECT 
        "LOCATION_ID",
        "PRODUCT_ID",
        SUM(QUANTITY) AS "ACT_QTY"
    FROM "CP_IBP_FUTUREDEMAND"
    WHERE VERSION='__BASELINE'
      AND SCENARIO='_PLAN'
      AND WEEK_DATE BETWEEN '${aCalendar[0].WEEK_STARTDATE}' AND '${aCalendar[0].WEEK_ENDDATE}'
    GROUP BY "LOCATION_ID", "PRODUCT_ID"
),
DATA AS (
    SELECT
        FS."FACTORY_LOC",
        AC."LOCATION_ID",
        AC."PRODUCT_ID",
        RM.PERIODDESC AS "MONTH",
        COALESCE(SUM(AR."QUANTITY"), 0) AS "LAG_QTY",
        '${aCalendar[0].PERIODDESC}' AS "ACTUAL_MONTH"
    FROM REF_MONTHS RM
    CROSS JOIN ALL_COMB AC
    LEFT JOIN "CP_IBPCALENDER_WEEK" CAL
        ON CAL.PERIODDESC = RM.PERIODDESC
       AND CAL.LEVEL='M'
    LEFT JOIN "CP_IBP_FUTUREDEMAND" AR
        ON AR.WEEK_DATE >= CAL.WEEK_STARTDATE
       AND AR.WEEK_DATE <= CAL.WEEK_ENDDATE
       AND AR."LOCATION_ID" = AC."LOCATION_ID"
       AND AR."PRODUCT_ID" = AC."PRODUCT_ID"
       AND AR.VERSION='__BASELINE'
       AND AR.SCENARIO='_PLAN'
    LEFT JOIN "CP_FACTORY_SALESLOC" FS
        ON AC."LOCATION_ID" = FS."LOCATION_ID"
       AND AC."PRODUCT_ID" = FS."PRODUCT_ID"
    GROUP BY
        FS."FACTORY_LOC",
        AC."LOCATION_ID",
        AC."PRODUCT_ID",
        RM.PERIODDESC
)
SELECT 
    D.*,
    COALESCE(A."ACT_QTY", 0) AS "ACTUAL_QTY",
    ROW_NUMBER() OVER (
        PARTITION BY D."FACTORY_LOC", D."LOCATION_ID", D."PRODUCT_ID"
        ORDER BY D."MONTH"
    ) AS "LAG_MONTH"
FROM DATA D
LEFT JOIN ACTUAL_QTY A
    ON D."LOCATION_ID" = A."LOCATION_ID"
   AND D."PRODUCT_ID" = A."PRODUCT_ID"
ORDER BY 
    D."FACTORY_LOC", D."LOCATION_ID", D."PRODUCT_ID", D."MONTH";
        `)         
      if(aPDemand.length>0){
              await cds.run(`DELETE FROM "CP_SNAPSHOT_LAG_PROD_DMD" WHERE ACTUAL_MONTH='${aCalendar[0].PERIODDESC}'`);
               await cds.run(INSERT.into("CP_SNAPSHOT_LAG_PROD_DMD").entries(aPDemand));
           }
           aPDemand = null;
        //#endregion

           //#region Stat Forecast Lag
          let aStatForecast = await cds.run(`WITH REF_MONTHS AS (
    SELECT DISTINCT PERIODDESC
    FROM "CP_IBPCALENDER_WEEK"
    WHERE "LEVEL"='M'
      AND "WEEK_STARTDATE" > '${currentDate}'
    ORDER BY PERIODDESC ASC
    LIMIT '${iLags}'
),
ALL_COMB AS (
    SELECT DISTINCT "LOCATION_ID", "PRODUCT_ID", "CHAR_NUM","CHARVAL_NUM"
    FROM "CP_PAL_FCHARPLAN"
    WHERE VERSION='__BASELINE'
      AND SCENARIO='_PLAN'
),
ACTUAL_QTY AS (
    SELECT 
        "LOCATION_ID",
        "PRODUCT_ID",
        "CHAR_NUM",
        "CHARVAL_NUM",
        SUM(OPT_QTY) AS "ACT_QTY"
    FROM "CP_PAL_FCHARPLAN"
    WHERE VERSION='__BASELINE'
      AND SCENARIO='_PLAN'
     AND WEEK_DATE BETWEEN '${aCalendar[0].WEEK_STARTDATE}' AND '${aCalendar[0].WEEK_ENDDATE}'
    GROUP BY "LOCATION_ID", "PRODUCT_ID","CHAR_NUM","CHARVAL_NUM"
),
DATA AS (
	SELECT
        FS."FACTORY_LOC",
        AC."LOCATION_ID",
        AC."PRODUCT_ID",
        AC."CHAR_NUM" AS "CHAR_NUM",
        AC."CHARVAL_NUM" AS "CHAR_VALUE",
        RM.PERIODDESC AS "MONTH",
        -- TO_VARCHAR(CAL.WEEK_STARTDATE, 'YYYY-MM') AS YEAR_MONTH,
        COALESCE(SUM(AR."OPT_QTY"), 0) AS "LAG_QTY",
          '${aCalendar[0].PERIODDESC}' AS "ACTUAL_MONTH"
    FROM REF_MONTHS RM
    CROSS JOIN ALL_COMB AC
    LEFT JOIN "CP_IBPCALENDER_WEEK" CAL
        ON CAL.PERIODDESC = RM.PERIODDESC
       AND CAL.LEVEL='M'
    LEFT JOIN "CP_PAL_FCHARPLAN" AR
        ON AR.WEEK_DATE >= CAL.WEEK_STARTDATE
       AND AR.WEEK_DATE <= CAL.WEEK_ENDDATE
       AND AR."LOCATION_ID" = AC."LOCATION_ID"
       AND AR."PRODUCT_ID" = AC."PRODUCT_ID"
       AND AR."CHAR_NUM" = AC."CHAR_NUM"
       AND AR."CHARVAL_NUM" = AC."CHARVAL_NUM"
       AND AR.VERSION='__BASELINE'
       AND AR.SCENARIO='_PLAN'
    LEFT JOIN "CP_FACTORY_SALESLOC" FS
        ON AC."LOCATION_ID" = FS."LOCATION_ID"
       AND AC."PRODUCT_ID" = FS."PRODUCT_ID"
    GROUP BY
        FS."FACTORY_LOC",
        AC."LOCATION_ID",
        AC."PRODUCT_ID",
        AC."CHAR_NUM",
        AC."CHARVAL_NUM",
        RM.PERIODDESC
)
SELECT D.*,
	COALESCE(A."ACT_QTY", 0) AS "ACTUAL_QTY",
       ROW_NUMBER() OVER (
           PARTITION BY D."FACTORY_LOC",D."LOCATION_ID",D."PRODUCT_ID",D."CHAR_NUM",D."CHAR_VALUE"
           ORDER BY D."MONTH"
       ) AS LAG_MONTH
FROM DATA D
LEFT JOIN ACTUAL_QTY A
    ON D."LOCATION_ID" = A."LOCATION_ID"
   AND D."PRODUCT_ID" = A."PRODUCT_ID"
   AND D."CHAR_NUM" = A."CHAR_NUM"
   AND D."CHAR_VALUE" = A."CHARVAL_NUM"
          ORDER BY D."FACTORY_LOC", D."LOCATION_ID", D."PRODUCT_ID", D."CHAR_NUM",D."CHAR_VALUE",D."MONTH";`)
            if(aStatForecast.length>0){
              await cds.run(`DELETE FROM "CP_LAG_STAT_FORECAST" WHERE ACTUAL_MONTH='${aCalendar[0].PERIODDESC}'`);
               await cds.run(INSERT.into("CP_LAG_STAT_FORECAST").entries(aStatForecast));
            }
            aStatForecast= null;
      //#endregion
    }
  })
};