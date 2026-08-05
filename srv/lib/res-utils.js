const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
const rp = require('request-promise')

const xsenv = require("@sap/xsenv");
const JobSchedulerClient = require("@sap/jobs-client");

// Begin of Resource Functions
const resFuncs = require('./res-utils.js');
// End of Resource functions



// function getJobscheduler(req) {
exports.getJobscheduler = async function(req) {

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


// function getCfApiUrl() {
exports.getCfApiUrl = async function() {

    var tag = new RegExp('"cf_api"(.*)');
    const vcap_app = process.env.VCAP_APPLICATION;

    var uri = vcap_app.match(tag);
    if (uri) {
      var tag1 = new RegExp('"(.*)');
      uri = uri[1].match(tag1);
      let cf_api = "";
      for (let index = 0; index < uri[1].length; index++) {
        if (uri[1][index] != '"') {
            cf_api = cf_api + uri[1][index];
        }
        else {
          index = uri[1].length;
        }
      }
  
      return cf_api;
  
    }
  
}

// function getAppGuid() {
exports.getAppGuid = async function() 
{
    var tag = new RegExp('"application_id"(.*)');
    const vcap_app = process.env.VCAP_APPLICATION;

    var uri = vcap_app.match(tag);
    if (uri) {
            var tag1 = new RegExp('"(.*)');
            uri = uri[1].match(tag1);
            let application_id = "";
            for (let index = 0; index < uri[1].length; index++) {
            if (uri[1][index] != '"') {
                application_id = application_id + uri[1][index];
            }
            else {
                index = uri[1].length;
            }
        }

        return application_id;

    }

}

// function getAppName() {
exports.getAppName = async function() {
    var tag = new RegExp('"application_name"(.*)');
    const vcap_app = process.env.VCAP_APPLICATION;

    var uri = vcap_app.match(tag);
    if (uri) {
            var tag1 = new RegExp('"(.*)');
            uri = uri[1].match(tag1);
            let application_name = "";
            for (let index = 0; index < uri[1].length; index++) {
            if (uri[1][index] != '"') {
                application_name = application_name + uri[1][index];
            }
            else {
                index = uri[1].length;
            }
        }

        return application_name;

    }

}

exports._purgeResourceStats = async function(req,isGet) {

    console.log('_purgeResourceStats Request Time = ', new Date().toJSON());


    let createtAt = new Date();
    let id = uuidv1();
    let values = [];

    let message = "Request for Purge Resource Stats older than " + '15' + " Days Queued Sucessfully";

    values.push({ id, createtAt, message });

    let purgeError = false;

    let purgeResStatsSql = 'DELETE  FROM RS_APP_STATS WHERE DAYS_BETWEEN(STATS_TIME, CURRENT_DATE) > 15';
    console.log("purgeResStatsSql ", purgeResStatsSql);

    try {
       await cds.run(purgeResStatsSql);
    }
    catch (exception) {
      purgeError = true;
      console.log("sqlStr exception ", purgeResStatsSql);
      throw new Error(exception.toString());
    }

    if (purgeError == false)
    {
        let purgeResStatsSql = 'DELETE FROM RS_NODE_STATS WHERE DAYS_BETWEEN(STATS_TIME, CURRENT_DATE) > 15';
        console.log("purgeResStatsSql ", purgeResStatsSql);
        try {
            await cds.run(purgeResStatsSql);
        }
        catch (exception) {
            purgeError = true;
            console.log("sqlStr exception ", purgeResStatsSql);
            throw new Error(exception.toString());
        }

        if (purgeError == false)
        {
            let purgeResStatsSql = 'DELETE FROM RS_SYS_STATS WHERE DAYS_BETWEEN(STATS_TIME, CURRENT_DATE) > 15';
            console.log("purgeResStatsSql ", purgeResStatsSql);
            try {
                await cds.run(purgeResStatsSql);
            }
            catch (exception) {
                purgeError = true;
            console.log("sqlStr exception ", purgeResStatsSql);
            throw new Error(exception.toString());
            }
        }
    }


    let dataObj = {};

    if (purgeError == false) {
      dataObj["success"] = true;
      dataObj["message"] = "Purge Resource Stats Completed Successfully";
    }
    else {
      dataObj["success"] = false;
      dataObj["message"] = "Purge Resource Stats Errored";
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
    console.log('_purgeResourceStats Completed Time = ', new Date().toJSON());

}


exports._updateAppResourcesUsage = async function(req, startEnd, fromJobScheduler)
//async function _updateAppResourcesUsage(req, isGet)
{
    if(fromJobScheduler == true)
    {
        var vcRulesListReq = {};
        if (isGet == true) //GET -- Kludge
        {
            vcRulesListReq = JSON.parse(req.data);
        }
        else
        {
            vcRulesListReq = req.data;
        }

        let createdAt = new Date();


        let id = uuidv1();
        let values = [];	
        let message = "Request for _updateAppResourcesUsage Queued Sucessfully";

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
    }

    let jobId = 0;
    if (req.headers['x-sap-job-id'] > 0)
    {
        jobId = req.headers['x-sap-job-id'];
    }
 
    const vcap_app = process.env.VCAP_APPLICATION;
    var options;
    // let cf_api_url = 'https://api.cf.us10.hana.ondemand.com';
    console.log("_updateAppResourcesUsage vcap_app ", vcap_app);

    const cf_api_url = await resFuncs.getCfApiUrl();
    console.log("_updateAppResourcesUsage vcap_app getCfApiUrl () ", await resFuncs.getCfApiUrl());

    let cf_api_info =  cf_api_url+ '/info';

    // console.log("_updateAppResourcesUsage cf_api_info ", cf_api_info);    

    options = {
            'method': 'GET',
            'url': cf_api_info,
            'headers': {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        },
        'timeout': 5000,
        body: JSON.stringify({
            "grant_type": "password",
            "username": process.env.cc_user,
            "password": process.env.cc_passwd,
        })

    };


    // console.log('_updateAppResourcesUsage options = ', options);


    let ret_response ="";
    let error = false;
    let token_endpoint = "";

    console.log('_updateAppResourcesUsage Request Time = ', new Date());

    await rp(options)
    .then(function (response) {
        // console.log('_updateAppResourcesUsage Response Time = ', new Date().toJSON());
        // console.log('Response   = ', response);
        ret_response = JSON.parse(response);
        token_endpoint = ret_response.token_endpoint;
        
    })
    .catch(function (err) {
        console.log('_updateAppResourcesUsage - Error ');
        // ret_response = JSON.parse(err);
       error = true;

    });

    let access_token = "";

    if (token_endpoint.length > 0)
    {
        let token_url = token_endpoint + '/oauth/token';
        // console.log("_updateAppResourcesUsage token_url ", token_url);

        options = {
            'method': 'POST',
            'url': token_url,
            'headers': {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json;charset=utf-8",
        },
		'timeout': 5000,
        form: {
            'client_id': 'cf',
            'client_secret': '',
            'username': process.env.cc_user,
            'password': process.env.cc_passwd,
            'grant_type': 'password'
          }

        };

        // console.log("_updateAppResourcesUsage options ", options);
        // console.log('_updateAppResourcesUsage Bearer Token Request Time = ', new Date());

        await rp(options)
        .then(function (response) {
            // console.log('_updateAppResourcesUsage Response Time = ', new Date().toJSON());
            // console.log('Fetch Token Response   = ', response);
            ret_response = JSON.parse(response);
            access_token = ret_response.access_token;
            
        })
        .catch(function (err) {
            console.log('_updateAppResourcesUsage - Error ');
            // ret_response = JSON.parse(error);
            error = true;

        });


    }

    let appGuid = "";
    let appName = "";
    if(access_token.length > 0)
    {
        let bearer_token = 'Bearer ' + access_token;
        // let stats_url = 'https://api.cf.us10.hana.ondemand.com/v3/processes/a15d52c0-41b7-40aa-a369-ea5d3e1204a7/stats'
        appGuid = await resFuncs.getAppGuid();
        // console.log("_updateAppResourcesUsage appGuid ", appGuid);

        let stats_url = cf_api_url + '/v3/processes/' + appGuid+ '/stats';
        // console.log("_updateAppResourcesUsage stats_url ", stats_url);

        options = {
            'method': 'GET',
            'url': stats_url,
            'headers': {
              'Authorization': bearer_token,
            },
        'timeout': 5000,

        form: {

            }
        }

        // console.log("_updateAppResourcesUsage options ", options);
        // console.log('_updateAppResourcesUsage Bearer Token Request Time = ', new Date());

        await rp(options)
        .then(function (response) {
            // console.log('_updateAppResourcesUsage Response Time = ', new Date().toJSON());
            // console.log('Fectch Stats Response   = ', response);
            ret_response = JSON.parse(response);

        })
        .catch(function (err) {
            console.log('_updateAppResourcesUsage - Error ');
            // ret_response = JSON.parse(err);
            error = true;

        });
    }

    if (error == false)
    {
        appName = await resFuncs.getAppName();
        let instances = ret_response.resources.length;
        for (let index = 0; index < instances; index ++)
        {
            let appState = ret_response.resources[index].state;
            let appUptime =  ret_response.resources[index].uptime;
            let statsTime = ret_response.resources[index].usage.time;
            let instanceNum = index;
            let memQuota = (ret_response.resources[index].mem_quota/Math.pow(10,6)).toFixed(2);
            let diskQuota = (ret_response.resources[index].disk_quota/Math.pow(10,6)).toFixed(2);
            let cpuUsage = ((ret_response.resources[index].usage.cpu)*100).toFixed(2);
            let memUsage = (100*(ret_response.resources[index].usage.mem)/(ret_response.resources[0].mem_quota)).toFixed(2);
            let diskUsage = (100*(ret_response.resources[index].usage.disk)/(ret_response.resources[0].disk_quota)).toFixed(2);
            let logRate = ret_response.resources[index].usage.log_rate;

            let sqlStr = 'UPSERT "RS_APP_STATS" VALUES (' +
                            "'" + jobId + "'" + "," +
                            "'" + startEnd + "'" + "," +
                            "'" + appGuid + "'" + "," +
                            "'" + appName + "'" + "," +
                            "'" + statsTime + "'" + "," +
                            "'" + instanceNum + "'" + "," +
                            "'" + appState + "'" + "," +
                            "'" + appUptime + "'" + "," +
                            "'" + memQuota + "'" + "," +
                            "'" + diskQuota + "'" + "," +
                            "'" + cpuUsage  + "'" + "," +
                            "'" + memUsage  + "'" + "," +
                            "'" + diskUsage  + "'" + "," +
                            "'" + logRate +  "'" + ')' + ' WITH PRIMARY KEY';

            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                error = true;
                console.log("sqlStr UPSERT RS_APP_STATS", sqlStr);
                throw new Error(exception.toString());
            }
        }
    }

    if(fromJobScheduler == true)
    {
        let dataObj = {};
        if(error == true)
        {
            dataObj["success"] = false;
            dataObj["message"] = "_updateAppResourcesUsage Job errored";
        }
        else
        {
            dataObj["success"] = true;
            dataObj["message"] = "_updateAppResourcesUsage Job Success";
        }

        if (req.headers['x-sap-job-id'] > 0)
        {
            const scheduler = await resFuncs.getJobscheduler(req);

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
    }
	// return ret_response;
}

exports._updateNodeResourcesUsage = async function(req, startEnd, fromJobScheduler)
//async function _updateNodeResourcesUsage(req, isGet)
{
    if(fromJobScheduler == true)
    {
        var vcRulesListReq = {};
        if (isGet == true) //GET -- Kludge
        {
            vcRulesListReq = JSON.parse(req.data);
        }
        else
        {
            vcRulesListReq = req.data;
        }

        let createdAt = new Date();


        let id = uuidv1();
        let values = [];	
        let message = "Request for _updateAppResourcesUsage Queued Sucessfully";

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
    }
    let jobId = 0;
    if (req.headers['x-sap-job-id'] > 0)
    {
        jobId = req.headers['x-sap-job-id'];
    }
 
    const nodeProcess = require('node:process');
           
    // PROCESS SPECIFIC - like CDS RUN -- config_products-srv
    // console.log("Process PID", nodeProcess.pid, "Parent Process ID", nodeProcess.ppid, "Process Up Time", nodeProcess.uptime(), "V8 Memory Usage", nodeProcess.memoryUsage());
    let error = false;
    let processResourceUsage = nodeProcess.resourceUsage();
    let memUsage = nodeProcess.memoryUsage();
    let cpuUsage = nodeProcess.cpuUsage();

    let nodeResourcesSql = 'UPSERT "RS_NODE_STATS" VALUES (' +
                            "'" + jobId + "'" + "," +
                            "'" + startEnd + "'" + "," +
                            "'" + nodeProcess.pid + "'" + "," +
                            "'" + nodeProcess.ppid + "'" + "," +
                            "'" + new Date().toISOString() + "'" + "," +
                            "'" + (processResourceUsage.maxRSS/Math.pow(10,3)).toFixed(2) + "'" + "," +
                            "'" + (memUsage.rss/Math.pow(10,6)).toFixed(2) + "'" + "," +
                            "'" + (memUsage.heapTotal/Math.pow(10,6)).toFixed(2) + "'" + "," +
                            "'" + (memUsage.heapUsed/Math.pow(10,6)) + "'" + "," +
                            "'" + cpuUsage.user  + "'" + "," +
                            "'" + cpuUsage.system  +  "'" + ')' + ' WITH PRIMARY KEY';

    // console.log("nodeResourcesSql UPSERT RS_NODE_STATS", nodeResourcesSql);
    try {
        await cds.run(nodeResourcesSql);
    }
    catch (exception) {
        error = true;
        console.log("sqlStr UPSERT RS_APP_STATS", nodeResourcesSql);
        throw new Error(exception.toString());
    }
    if(fromJobScheduler == true)
    {
        let dataObj = {};
        if(error == true)
        {
            dataObj["success"] = false;
            dataObj["message"] = "_updateNodeResourcesUsage Job errored";
        }
        else
        {
            dataObj["success"] = true;
            dataObj["message"] = "_updateNodeResourcesUsage Job Success";
        }

        if (req.headers['x-sap-job-id'] > 0)
        {
            const scheduler = await resFuncs.getJobscheduler(req);

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
        // return true;  
    }
}

// async function _upsertSysStats(sysStatsSql)
exports._upsertSysStats = async function(sysStatsSql) 
{
    let error = false;
    try {
        await cds.run(sysStatsSql);
    }
    catch (exception) {
        error = true;
        console.log("sqlStr UPSERT RS_APP_STATS", sysStatsSql);
        throw new Error(exception.toString());
    }
    return error;
}

exports._updateSysResourcesUsage = async function(req, startEnd, fromJobScheduler) 
{
// async function _updateSysResourcesUsage(re, isGet) {
    if(fromJobScheduler == true)
    {
        var vcRulesListReq = {};
        if (isGet == true) //GET -- Kludge
        {
            vcRulesListReq = JSON.parse(req.data);
        }
        else
        {
            vcRulesListReq = req.data;
        }

        let createdAt = new Date();


        let id = uuidv1();
        let values = [];	
        let message = "Request for _updateAppResourcesUsage Queued Sucessfully";

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
    
    }

    let jobId = 0;
    if (req.headers['x-sap-job-id'] > 0)
    {
        jobId = req.headers['x-sap-job-id'];
    }
 
    const osu = require('node-os-utils');
    let drive = osu.drive;    
    let driveInfo = await drive.info();
    let sysResourcesSql = "";
    
    let error = false;
    var os 	= require('os-utils');
    os.cpuUsage(function(v){
        // // LINUX
        // console.log("Platform ", os.platform());
        // console.log("System Up Time ", os.sysUptime());
        
        // // SYSTEM RESOURCES - LINUX
        // console.log("Load Averge 1 Min", os.loadavg(1));
        // console.log("Load Averge 5 Min", os.loadavg(5));
        // console.log("Load Averge 15 Min", os.loadavg(15));
        // console.log("driveInfo ",driveInfo);
    
        
        // // OPERATING SYSTEM - NODE -V8 Specific
        // console.log("Process Up Time ", os.processUptime());
    
        // console.log("Cpu count ", os.cpuCount());
        // console.log( "CPU Usage (%): ", (100*v).toFixed(2) );
        // console.log( "CPU Free (%): ", (100*(1-v)).toFixed(2) );
    
        // console.log("Total Memory MB", (os.totalmem()).toFixed(2));
        // console.log("Free Memory MB", (os.freemem()).toFixed(2));
        // console.log("Used Memory MB", (os.totalmem() - os.freemem()).toFixed(2));
    
        // console.log("Used Memory Percentage ", (100*(1-os.freememPercentage())).toFixed(2));
        // console.log("Free Memory Percentage ", (100*os.freememPercentage()).toFixed(2));

        sysResourcesSql = 'UPSERT "RS_SYS_STATS" VALUES (' +
                            "'" + jobId + "'" + "," +
                            "'" + startEnd + "'" + "," +
                            "'" + os.platform() + "'" + "," +
                            "'" + new Date().toISOString() + "'" + "," +
                            "'" + (os.sysUptime()/1000).toFixed(0) + "'" + "," +
                            "'" + (os.processUptime()/1000).toFixed(0) + "'" + "," +
                            "'" + os.loadavg(1) + "'" + "," +
                            "'" + os.loadavg(5) + "'" + "," +
                            "'" + os.loadavg(15) + "'" + "," +
                            "'" + os.cpuCount() + "'" + "," +
                            "'" + (100*v).toFixed(2)  + "'" + "," +
                            "'" + (100*(1-v)).toFixed(2)  + "'" + "," +
                            "'" + (os.totalmem()).toFixed(2)  + "'" + "," +
                            "'" + (os.freemem()).toFixed(2)  + "'" + "," +
                            "'" + (100*(1-os.freememPercentage())).toFixed(2)  + "'" + "," +
                            "'" + (100*os.freememPercentage()).toFixed(2) +  "'" + ')' + ' WITH PRIMARY KEY';
        // console.log("sysResourcesSql UPSERT RS_SYS_STATS", sysResourcesSql);
        if (sysResourcesSql != "")
        {
            resFuncs._upsertSysStats(sysResourcesSql);           
        }      
    
    });

    if(fromJobScheduler == true)
    {
        let dataObj = {};
        if(error == true)
        {
            dataObj["success"] = false;
            dataObj["message"] = "_updateSysResourcesUsage Job errored";
        }
        else
        {
            dataObj["success"] = true;
            dataObj["message"] = "_updateSysResourcesUsage Job Success";
        }

        if (req.headers['x-sap-job-id'] > 0)
        {
            const scheduler = await resFuncs.getJobscheduler(req);

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
    }

}
