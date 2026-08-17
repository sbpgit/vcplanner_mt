const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const cloudSdkUtil = require('@sap-cloud-sdk/util');
const xsenv = require('@sap/xsenv');
const axios = require('axios');
const bodyParser = require('body-parser')
const registerUpsert  = require('../srv/lib/upsert')
const jwt = require("jsonwebtoken");
cloudSdkUtil.setGlobalLogLevel('debug');

cds.on("bootstrap", app => {
   
    app.use(async (req, res, next) => {
        try{
               await authenticate(req,next);
        }
        catch (error) {
            console.error('Error getting access token:', JSON.stringify(error));
            next(); 
        }

      
    });
    app.use(proxy());
    app.use(bodyParser.json({ limit: '10mb' }))
    app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))
});

async function authenticate(req, next) {
    if (req.method == 'POST' && req.headers['user-agent'] == undefined && req.query.host) {//JobScheduler
        const xsuaaService = xsenv.getServices({
            uaa: {
                name: 'vcplanner_mt-auth' // Replace with the exact name of the desired service instance
            }
        });
        const clientId = xsuaaService.uaa.clientid;
        const clientSecret = xsuaaService.uaa.clientsecret;
        // const tokenUrl = xsuaaService.uaa.url + '/oauth/token';
        const tokenUrl = xsuaaService.uaa.url.replace("mttsbpdigital", req.query.host) + '/oauth/token';
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        try {
            const response = await axios.post(tokenUrl, params);

            const accessToken = response.data.access_token;
            req.headers.authorization = `Bearer ${accessToken}`;
            const jwtPayload = jwt.decode(accessToken);
            if (!jwtPayload) {
                throw new Error("Invalid JWT");
            }
            const tenantId = jwtPayload?.zid;
            // const liActivities = await cds.tx({ tenantId }, async (tx) => {
            //         return tx.run(`SELECT "ACTION_URL" FROM "JS_ACTIVITY_HEADER"`);
            //     });
            const JsActivityHeader = cds.entities['js.ACTIVITY_HEADER'];
            const liActivities = await cds.tx({ tenant: tenantId }, async (tx) => {
                return await tx.run(
                    SELECT.from(JsActivityHeader).columns('ACTION_URL')
                );
            });
            console.log(liActivities.length);


            liActivities.push({ ACTION_URL: "/jobs/ParallelSetjobsCreation" });
            liActivities.push({ ACTION_URL: "/jobs/resumeSetParallelJobs" });
            liActivities.push({ ACTION_URL: "/catalog/generateTempUID" });
            liActivities.push({ ACTION_URL: "/jobs/SyncTemplates" });
            liActivities.push({ ACTION_URL: "/catalog/jobSeedOrder" });
            liActivities.push({ ACTION_URL: "/pal/purgePredictionModels" });
            liActivities.push({ ACTION_URL: "/catalog/salesOrderCreation" });

            next();
        } catch (error) {
            console.log("Error obtaining access token1:", error);
        }
        //    await axios.post(tokenUrl, params)
        //         .then(async (response) => {
        //             const accessToken = response.data.access_token;
        //             req.headers.authorization = "Bearer "+ 
        //             accessToken;
        //               var liActivities = await cds.run(`SELECT "ACTION_URL" FROM "JS_ACTIVITY_HEADER"`);
        // console.log("test2")
        // liActivities.push({"ACTION_URL":"/jobs/ParallelSetjobsCreation"});//Jobs creation by set service
        // liActivities.push({"ACTION_URL":"/jobs/resumeSetParallelJobs"});//Jobs resume by set service
        // liActivities.push({"ACTION_URL":"/catalog/generateTempUID"});
        // liActivities.push({"ACTION_URL":"/jobs/SyncTemplates"}); // for templates Sync from Activity to Template Tables
        // liActivities.push({"ACTION_URL":"/catalog/jobSeedOrder"});//for old seed order application
        // liActivities.push({"ACTION_URL":"/catalog/genProductBatch"});//For Planning configuration app, excel upload
        // liActivities.push({"ACTION_URL":"/pal/purgePredictionModels"});//Service to purge models, predictions from characteristic configuration application    
        // liActivities.push({"ACTION_URL":"/catalog/salesOrderCreation"});//service to create sales order internally
        // console.log(JSON.stringify(liActivities))
        // //if it is a job action
        // next();
        //         }).catch(error => {
        //             console.log("Error obtaining access token:", error);
        //         });

        //    if(liActivities.filter(a=>a.ACTION_URL == req.url.split('?')[0]).length > 0){

        //    }
        //    else{
        //     next();
        //    }
    }
    else if (req.headers.authorization && (req.url.toString().includes('generateUniqueId') || req.url.toString().includes('deactivateUniqueID')
        || req.url.toString().includes('getLocProdCharAPI') || req.url.toString().includes('getLocProdConfigAPI') || req.url.toString().includes('getLocProdActDemandAPI')
        || req.url.toString().includes('getLocProdActualDemandAPI') || req.url.toString().includes('getLocProdActDemandAPICopy') || req.url.toString().includes('getClassCharAPI') || req.url.toString().includes('getMDTAssembly')
    )) {//cpids
        /*Need to add authorization manually as CPIDS client credentials don't match with config_products */
        const xsuaaService = xsenv.getServices({
            uaa: {
                name: 'vcplanner_mt-auth' // Replace with the exact name of the desired service instance
            }
        });
        const clientId = xsuaaService.uaa.clientid;
        const clientSecret = xsuaaService.uaa.clientsecret;
        const tokenUrl = xsuaaService.uaa.url + '/oauth/token';
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        await axios.post(tokenUrl, params)
            .then(response => {
                const accessToken = response.data.access_token;
                req.headers.authorization = "Bearer " +
                    accessToken;
                next();
            }).catch(error => {
                console.log("Error obtaining access token2:", error);
                next();
            });
    }
    else {
        next();
    }
}

//To Track and log errors in VCPlanner
cds.on('served', async () => {
    const db = await cds.connect.to('db')
    if (cds.db) {
        registerUpsert(cds.db)
    }
    // for (const srv of cds.services) {
    //     const _dispatch = srv.dispatch;
    //     srv.dispatch = async function (req) {
    //         try {
    //              return await Promise.resolve(_dispatch.call(this, req));
    //         } catch (err) {//to catch req.reject(), query errors, coding bugs
    //             try {
    //                 if (!req._errorLogged) {
    //                     req._errorLogged = true;
    //                     const tx = db.transaction();
    //                     var hostName = req.headers.host;
    //                     if(!hostName){
    //                         hostName ='';
    //                     }
    //                     //#region JobScheduler 
    //                     const method =req._.req?.method || req.method;
    //                      if(method == 'POST' || (method =='GET' && req.event == "createJobFeed")){
    //                         if(hostName.includes("localhost") == false){//If running from BAS, Not required to update job to Error& stop it
    //                         let aAct = await tx.run(`SELECT DISTINCT ACTION_URL FROM "JS_ACTIVITY_HEADER"`);
    //                          aAct.push({ "ACTION_URL": "/jobs/ParallelSetjobsCreation" });//Jobs creation by set service
    //                          aAct.push({ "ACTION_URL": "/jobs/resumeSetParallelJobs" });//Jobs resume by set service
    //                          aAct.push({ "ACTION_URL": "/catalog/generateTempUID" });
    //                          aAct.push({ "ACTION_URL": "/jobs/SyncTemplates" }); // for templates Sync from Activity to Template Tables
    //                          aAct.push({ "ACTION_URL": "/catalog/jobSeedOrder" });//for old seed order application
    //                          aAct.push({ "ACTION_URL": "/catalog/genProductBatch" });//For Planning configuration app, excel upload
    //                          aAct.push({ "ACTION_URL": "/pal/purgePredictionModels" });//Service to purge models, predictions from characteristic configuration application    
    //                          aAct.push({ "ACTION_URL": "/catalog/salesOrderCreation" });
    //                          aAct.push({ "ACTION_URL": "/jobs/createJobFeed" });//jobfeed
    //                          if(aAct.findIndex(a=>a.ACTION_URL.includes(req.event))!=-1){
    //                             await tx.run(
    //                              UPDATE('JS_JOB_TEMPLATEDETAILS')
    //                             .set({ JOB_STATUS: 'Error' })
    //                              .where(
    //                             `JOB_STATUS IS NULL OR JOB_STATUS = '' OR JOB_STATUS = 'Pending'`
    //                                  )
    //                                 );

    //                              await tx.run(
    //                              UPDATE('JS_JOB_TEMPLATEDETAILS')
    //                                 .set({ ACTIVITY_STATUS: 'Error' })
    //                                 .where(
    //                                  `ACTIVITY_STATUS = 'Pending'`
    //                             )
    //                         );
    //                          }
    //                         }
                            
    //                     }
                       
    //                     //#endregion
                       
    //                     if(err.message == 'Internal Server Error!'){
    //                       return;
    //                     }
    //                     else if (err.stack) {//for code issues
    //                       var sSepartor = "at async next";
    //                       if(err.stack.includes("at next")){
    //                         sSepartor ="at next"
    //                       }
    //                       let sError = err.stack.split(sSepartor)[0];
    //                       console.log("Error: ", sError);
    //                             await tx.run(
    //                       INSERT.into("CP_ERROR_LOGS").entries({
    //                       MESSAGE: sError,
    //                       SERVICE : req.event,
    //                       TYPE:"CODE"
    //                     }));
    //                     }
    //                     else if(err.query){//for incorrect queries
    //                          let sError = err.query +","+err.message;
    //                     console.log("Error: ", sError);
    //                       await tx.run(
    //                       INSERT.into("CP_ERROR_LOGS").entries({
    //                       MESSAGE: sError,
    //                       SERVICE : req.event,
    //                        TYPE:"QUERY"
    //                     }));
    //                     }
    //                     await tx.commit();
    //                 }
    //             } catch (dbErr) {
    //                 console.error("Exception: ", dbErr)
    //             }
    //             req.reject(500, 'Internal Server Error!');
    //             return
    //         }
    //     }
    // }
})
//Error Handler to handle crash
  process.on('unhandledRejection', async (error) => {
    console.log("Instance has crashed");
    const db = await cds.connect.to('db');
    try {
        //Updating running Job status and Activity status to Error
        await db.run(
            UPDATE('JS_JOB_TEMPLATEDETAILS')
              .set({ JOB_STATUS: 'Error' })
              .where(
                `JOB_STATUS IS NULL OR JOB_STATUS = '' OR JOB_STATUS = 'Pending'`
              )
          );

          await db.run(
            UPDATE('JS_JOB_TEMPLATEDETAILS')
              .set({ ACTIVITY_STATUS: 'Error' })
              .where(
                `ACTIVITY_STATUS = 'Pending'`
              )
          );
    } catch (err) {
      console.log('Failed to update status', err.message);
    }
    process.exit(1); // Exit to prevent inconsistent state
  });

// const request = require('request');
// const cfenv = require('cfenv');

// /*********************************************************************
//  *************** Step 1: Read the environment variables ***************
//  *********************************************************************/
// const oServices = cfenv.getAppEnv().getServices();
// const uaa_service = cfenv.getAppEnv().getService('uaa_config_products');
// const dest_service = cfenv.getAppEnv().getService('config_products-mdestination-service');
// const sUaaCredentials = dest_service.credentials.clientid + ':' + dest_service.credentials.clientsecret;

// const sDestinationName = 'USERAPI';
// const sEndpoint = '/service/user';

// /*********************************************************************
//  **** Step 2: Request a JWT token to access the destination service ***
//  *********************************************************************/
// const post_options = {
//     url: uaa_service.credentials.url + '/oauth/token',
//     method: 'POST',
//     headers: {
//         'Authorization': 'Basic ' + Buffer.from(sUaaCredentials).toString('base64'),
//         'Content-type': 'application/x-www-form-urlencoded'
//     },
//     form: {
//         'client_id': dest_service.credentials.clientid,
//         'grant_type': 'client_credentials'
//     }
// }

// request(post_options, (err, res, data) => {
//     if (res.statusCode === 200) {

//         /*************************************************************
//          *** Step 3: Search your destination in the destination service ***
//          *************************************************************/
//         const token = JSON.parse(data).access_token;
//         const get_options = {
//             url: dest_service.credentials.uri + '/destination-configuration/v1/destinations/' + sDestinationName,
//             headers: {
//                 'Authorization': 'Bearer ' + token
//             }
//         }

//         request(get_options, (err, res, data) => {

//             /*********************************************************
//              ********* Step 4: Access the destination securely *******
//              *********************************************************/
//             const oDestination = JSON.parse(data);
//             const token = oDestination.authTokens[0];

//             const options = {
//                 method: 'GET',
//                 url: oDestination.destinationConfiguration.URL + sEndpoint,
//                 headers: {
//                     'Authorization': `${token.type} ${token.value}`
//                 }
//             };

//             request(options).on('data', (s) => {
//                 console.log(s.toString())
//             });
//         });
//     }
// });
module.exports = cds.server;