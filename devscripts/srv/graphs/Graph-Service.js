const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
const hana = require('@sap/hana-client');
const rp = require('request-promise');

const genGraphsTimeout = 60000; // 60 seconds 

// Begin of GRAPH Functions
const graphMethods = require('./HanaGraphFuncs.js');
// End of GRAPH functions
const JobSchedulerClient = require("@sap/jobs-client");
const xsenv = require("@sap/xsenv");

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

  module.exports = srv => {
 
    srv.on ('CREATE', 'runAlgorithm',    graphMethods._runGraphAlgorithm);

    srv.on ('generateGraphs',    async req => {
        return (await _generateGraphs(req,false));
    })
    srv.on ('fgenerateGraphs',    async req => {
        return (await _generateGraphs(req,true));
    })

}

   

async function _postGenerateGraphs(req, vcRuleList, verticesData,edgesData)
{
    var options;
    var baseUrl = req.headers['x-forwarded-proto'] + '://' + req.headers.host; 

    // var baseUrl = 'http' + '://' + req.headers.host + '/odata/v4';

    let url =  baseUrl + '/graph/runAlgorithm';
    options = {
        'method': 'POST',
        'url': url,
        'headers': {
            'Content-Type': 'application/json',
            // 'Authorization' : auth
    },
    'timeout': genGraphsTimeout,

    body: JSON.stringify({
        "PRODUCT_ID": vcRuleList.PRODUCT_ID,
        "LOCATION_ID": vcRuleList.LOCATION_ID,
        "OBJ_TYPE": vcRuleList.OBJ_TYPE,
        // "MODEL_VERSION":vcRuleList.MODEL_VERSION,
        "ALGORITHM": vcRuleList.ALGORITHM,
        "START_VERTEX_ID": vcRuleList.START_VERTEX_ID,
        "END_VERTEX_ID": vcRuleList.END_VERTEX_ID,
        "K_SHORTEST_PATHS": vcRuleList.K_SHORTEST_PATHS,
        "DIRECTION": vcRuleList.DIRECTION,
        "MIN_DEPTH": vcRuleList.MIN_DEPTH,
        "MAX_DEPTH": vcRuleList.MAX_DEPTH,
        "verticesData" : verticesData,
        "edgesData" : edgesData

    })

    };
    
    
    let ret_response ="";
    let error = false;

    console.log('_postGenerateGraphs Request Time = ', new Date());

    await rp(options)
    .then(function (response) {
        console.log('_postGenerateGraphs Response Time = ', new Date());
        // console.log('Response   = ', response);
        // ret_response = JSON.parse(response);
        ret_response = response;
        
    })
    .catch(function (err) {
       console.log('_postGenerateGraphs - Error ');
       ret_response = err;
       error = true;

    });


    if (error == false)
    {
        let responseData = JSON.parse(ret_response);
        console.log("Generate Graphs SUCCESS Response Data", responseData);

    }
    else
    {


        let errorObj = {};
        errorObj["success"] = false;

        errorObj["message"] = 'ERROR _postGenerateGraphs ' + ret_response + ' AT ' + new Date() +
                                    '\n Response Details :' + 
                                    '\n LOCATION_ID : ' + vcRuleList.LOCATION_ID +
                                    '\n PRODUCT_ID : ' + vcRuleList.PRODUCT_ID  +
                                    '\n OBJ_TYPE : ' + vcRuleList.OBJ_TYPE +
                                    // '\n MODEL_VERSION : ' + vcRuleList.MODEL_VERSION +
                                    '\n ALGORITHM : ' + vcRuleList.ALGORITHM;
        if (req.headers['x-sap-job-id'] > 0)
        {
            const scheduler = getJobscheduler(req);

            var updateReq = {
                jobId: req.headers['x-sap-job-id'],
                scheduleId: req.headers['x-sap-job-schedule-id'],
                runId: req.headers['x-sap-job-run-id'],
                data : errorObj
                };


            scheduler.updateJobRunLog(updateReq, function(err, result) {
            if (err) {
                return console.log('Error updating run log: %s', err);
            }


            });
        }

    }

    return error;
}

async function _generateGraphs(req,isGet) {

    var vcRulesListReq = {};
    if (isGet == true) //GET -- Kludge
    {
        vcRulesListReq = JSON.parse(req.data.vcRulesList);
    }
    else
    {
        vcRulesListReq = req.data.vcRulesList;
    }
   
    let createdAt = new Date();
    // let sizeof = require('sizeof'); 
    // console.log("SIZE of Date Time", sizeof.sizeof(createdAt))
   
    let id = uuidv1();
    let values = [];	
    let message = "Request for Generate Graphs Queued Sucessfully";
   
    values.push({id, createdAt, message, vcRulesListReq});    
   
   
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
    
   
 
    var sqlStr ="";



    for (let index=0; index<vcRulesListReq.length; index++) 
    {

        if ( (vcRulesListReq[index].LOCATION_ID != "ALL") &&
                (vcRulesListReq[index].PRODUCT_ID != "ALL") )
        {
            varSql =  ' "LOCATION_ID" =' + "'" +   vcRulesListReq[index].LOCATION_ID + "'" +
                        ' AND "PRODUCT_ID" =' + "'" +   vcRulesListReq[index].PRODUCT_ID + "'";
        }
        else if ( (vcRulesListReq[index].LOCATION_ID == "ALL") &&
                (vcRulesListReq[index].PRODUCT_ID != "ALL") )
        {
            varSql =  ' "PRODUCT_ID" =' + "'" +   vcRulesListReq[index].PRODUCT_ID + "'";
        }
        else if ( (vcRulesListReq[index].LOCATION_ID != "ALL") &&
                (vcRulesListReq[index].PRODUCT_ID == "ALL") )
        {
            varSql =  ' "LOCATION_ID" =' + "'" +   vcRulesListReq[index].LOCATION_ID + "'";
        }
    
            
        // sqlStr = 'SELECT DISTINCT "LOCATION_ID", "PRODUCT_ID", "OBJ_TYPE", "VERTEX_ID" FROM "GRAPHS_VERTICES"' + 
        //         ' WHERE ' + varSql +
        //         ' AND "OBJ_TYPE" =' + "'" +  vcRulesListReq[index].OBJ_TYPE + "'" +
        //         ' ORDER BY "LOCATION_ID", "PRODUCT_ID", "OBJ_TYPE", "VERTEX_ID"';
        sqlStr = 'SELECT DISTINCT "VERTEX_ID" AS "ID" FROM "GRAPHS_VERTICES"' + 
                ' WHERE ' + varSql +
                ' AND "OBJ_TYPE" =' + "'" +  vcRulesListReq[index].OBJ_TYPE + "'" +
                ' ORDER BY "VERTEX_ID"';
        console.log("vcRuleListReqSql ", sqlStr);
        let verticesData;       
        try {
            verticesData = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        console.log("verticesData ", verticesData);

        
        // sqlStr = 'SELECT DISTINCT "ID", "LOCATION_ID", "PRODUCT_ID", "OBJ_TYPE", "SOURCE", "TARGET", "WEIGHT" FROM "GRAPHS_EDGES"' + 
        //         ' WHERE ' + varSql +
        //         ' AND "OBJ_TYPE" =' + "'" +  vcRulesListReq[index].OBJ_TYPE + "'" +
        //         ' ORDER BY "ID", "LOCATION_ID", "PRODUCT_ID", "OBJ_TYPE", "SOURCE", "TARGET"';
        sqlStr = 'SELECT DISTINCT "ID", "SOURCE", "TARGET", "WEIGHT" FROM "GRAPHS_EDGES"' + 
                    ' WHERE ' + varSql +
                    ' AND "OBJ_TYPE" =' + "'" +  vcRulesListReq[index].OBJ_TYPE + "'" +
                    ' ORDER BY "ID", "SOURCE", "TARGET"';
        console.log("vcRuleListReqSql ", sqlStr);
        let edgesData;       
        try {
            edgesData = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }


        console.log("edgesData ", edgesData);
        await _postGenerateGraphs(req,vcRulesListReq[index], verticesData,edgesData);

        
    }
    

    let dataObj = {};
    dataObj["success"] = true;
    dataObj["message"] = "Generate Graphs Job Completed Successfully at " +  new Date();


    if (req.headers['x-sap-job-id'] > 0)
    {
        const scheduler = getJobscheduler(req);

        var updateReq = {
            jobId: req.headers['x-sap-job-id'],
            scheduleId: req.headers['x-sap-job-schedule-id'],
            runId: req.headers['x-sap-job-run-id'],
            data : dataObj
            };

            scheduler.updateJobRunLog(updateReq, function(err, result) {
            if (err) {
                return console.log('Error updating run log: %s', err);
            }

            });
    }
    // createdAt = new Date();
    // console.log("CURRENT_TIME", createdAt, "GENERATE GRAPHS END ", "PROCESS ID", process.getegid(), "MEMORY :", process.memoryUsage(), "CPU :", process.cpuUsage());
    // console.log("nodeCpuUsage", cpuUsage(startNodeCpuUsage));
   
} 
   