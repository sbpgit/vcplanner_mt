const cds = require('@sap/cds')
const JobSchedulerClient = require("@sap/jobs-client");
const xsenv = require("@sap/xsenv");

// const ibpParams = {
//     uid:    "BTPUSER",//process.env.ibpDemand,
//     pwd: 	"Sbp@btpproductdevelopment01" //cds.env.requires.db.credentials.ibpPwd, 
// }
// const app = express();
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

// module.exports = srv => {
module.exports = async function (srv) {
      
     srv.on ('genMasterData',    async req => {

         console.log('Input Headers: ', req.headers);           
         console.log('Input Data: ', req.data); 
          

         let createtAt = new Date();
         let values = [];
         let respString = "Generate IBP MASTER DATA request queued, Check Response by Running Logs"

         values.push({createtAt, respString});    

         console.log('values :', values);
         console.log('Response completed Time  :', createtAt);
         var res = req._.req.res;
         res.statusCode = 202;
         res.send({values});    

         var sqlStr = 'call P_UPSERT_IBP_MASTER_TABLES(?)';
         var results = await cds.run(sqlStr); 
         console.log("P_UPSERT_IBP_MASTER_TABLES results", results);

         let url = req.headers['x-sap-scheduler-host'] + '/scheduler/jobs/' +
                   req.headers['x-sap-job-id'] + '/schedules/' +
                   req.headers['x-sap-job-schedule-id'] + /runs/ +
                   req.headers['x-sap-job-run-id'];
         console.log("P_UPSERT_IBP_MASTER_TABLES url",url);
         let dataObj = {};
         dataObj["success"] = true;
         dataObj["message"] = "IBP Master Data generated For" + 
                              " \n class_rows : " + results[0].class_rows +
                              " \n customer_rows : " + results[0].customer_rows +
                              " \n product_rows : " + results[0].product_rows +
                              " \n location_product_rows : " + results[0].location_product_rows +
                              " \n loc_prod_comp_rows : " + results[0].loc_prod_comp_rows +
                              " \n restriction_rows : " + results[0].restriction_rows +
                              " \n loc_restriction_rows : " + results[0].loc_restriction_rows +
                              " \n timestamp : " + results[0].timestamp ;


        //  dataObj["message"] = "'" + results[0] + "'";

        console.log("P_UPSERT_IBP_MASTER_TABLES dataObj",dataObj);

        const scheduler = getJobscheduler(req);

        var updateReq = {
            jobId: req.headers['x-sap-job-id'],
            scheduleId: req.headers['x-sap-job-schedule-id'],
            runId: req.headers['x-sap-job-run-id'],
            data : dataObj
          };

          console.log("P_UPSERT_IBP_MASTER_TABLES job update req",updateReq);

          scheduler.updateJobRunLog(updateReq, function(err, result) {
            if (err) {
              return console.log('Error updating run log: %s', err);
            }
            //Run log updated successfully
            console.log("P_UPSERT_IBP_MASTER_TABLES job update results",result);

          });

        // _updateScheduler(url,dataObj);
         
     })
 
     srv.on ('genTxData',    async req => {
       
        let createtAt = new Date();
         let values = [];
         let respString = "Generate IBP TX DATA request queued, Check Response by Running Logs"

         values.push({createtAt, respString});    

         console.log('values :', values);
         console.log('Response completed Time  :', createtAt);
         var res = req._.req.res;
         res.statusCode = 202;
         res.send({values});   
         
        // var sqlStr = 'call P_UPSERT_IBP_TS_TABLES(?, ?, ?)';
        var sqlStr = 'call P_UPSERT_IBP_TS_TABLES(?)';
        var results = await cds.run(sqlStr);
        console.log("P_UPSERT_IBP_TS_TABLES results", results);


        let url = req.headers['x-sap-scheduler-host'] + '/scheduler/jobs/' +
                   req.headers['x-sap-job-id'] + '/schedules/' +
                   req.headers['x-sap-job-schedule-id'] + /runs/ +
                   req.headers['x-sap-job-run-id'];
         console.log("P_UPSERT_IBP_TS_TABLES url",url);
         let dataObj = {};
         dataObj["success"] = true;
         dataObj["message"] = "IBP Time Series Data generated For" + 
                              " \n Variant Configuration Demand Rows : " + results[0].vcdemand_rows +
                              " \n Location Product Customer Demand Rows : " + results[0].demand_rows +
                              " \n Location Product Component Demand Rows : " + results[0].comp_demand_rows +
                              " \n Location Product Component Requirement Rows : " + results[0].compreq_rows +
                              " \n TimeStamp : " + results[0].timestamp ;


        console.log("P_UPSERT_IBP_TS_TABLES dataObj",dataObj);

        const scheduler = getJobscheduler(req);

        var updateReq = {
            jobId: req.headers['x-sap-job-id'],
            scheduleId: req.headers['x-sap-job-schedule-id'],
            runId: req.headers['x-sap-job-run-id'],
            data : dataObj
          };

          console.log("P_UPSERT_IBP_TS_TABLES job update req",updateReq);

          scheduler.updateJobRunLog(updateReq, function(err, result) {
            if (err) {
              return console.log('Error updating run log: %s', err);
            }
            //Run log updated successfully
            console.log("P_UPSERT_IBP_TS_TABLES job update results",result);

          });

     })
  }
//  module.exports = cds.service.impl(async function() {
//          const { SBPVCP } = this.entities;
//         //  const service = await cdse.connect.to('IBPDemandsrv');
//          const service = await cds.connect.to('IBPDemandsrv');
//          this.on('READ', SBPVCP, request => {
//              try{
//              return service.tx(request).run(request.query);
//              }
//              catch(err){
//                  console.log(err);
//              }
//          });
//     });