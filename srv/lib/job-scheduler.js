const preDefHistoryCls = require("./jobscheduler-function");
const GenFunctions = require("./gen-functions");
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

module.exports = (srv) => {

   //Roles for Template application 
      srv.after('READ', ['readTemplateItemsParams','getVariantDetails'], async (data, req) => {
       let sUser = req.headers['x-user-id']
        if (sUser && data.length >0) {
          //  let aRoles = await cds.run(`SELECT DISTINCT FACTORY_LOC,DEMAND_LOC,PRODUCT_ID,REF_PRODID FROM "V_ROLES_LOCPROD" WHERE USER='${sUser}'`);
           let aRoles = await cds.run(`SELECT DISTINCT FACTORY_LOC,DEMAND_LOC,PRODUCT_ID,REF_PRODID FROM "V_ROLES_ACCESS" WHERE USER='${sUser}' AND  CREATE=true`);
        if (aRoles.length > 0) {
          const locSet = new Set();
          const prodSet = new Set();
          aRoles.forEach(r => {
            if (r.FACTORY_LOC) locSet.add(r.FACTORY_LOC);
            if (r.DEMAND_LOC) locSet.add(r.DEMAND_LOC);

            if (r.PRODUCT_ID) prodSet.add(r.PRODUCT_ID);
            if (r.REF_PRODID) prodSet.add(r.REF_PRODID);
          });
          for (var i = 0; i < data.length; i++) {
            let paramObj = data[i];
            let sLoc = null,sMLoc = null,sDloc = null,sPartial =null,sProd = null,sConfig='';
            switch(paramObj.PARAMETER_ID){
              case 'LOCATION_ID':
                sLoc = paramObj.VALUE
                break;
                   case 'MF_LOCATION_ID':
                sMLoc = paramObj.VALUE
                break;
                   case 'DEMAND_LOC':
                sDloc = paramObj.VALUE
                break;
                case 'PARTIAL_PRODUCT':
                sPartial = paramObj.VALUE
                break;
                   case 'PRODUCT_ID':
                sProd = paramObj.VALUE
                break;
                   case 'CONFIG_PRODUCT':
                sConfig = paramObj.VALUE
                break;
            }
              const locations = [
                ...toArray(sLoc),
                ...toArray(sMLoc),
                ...toArray(sDloc)
              ];
              const products = [
                ...toArray(sPartial),
                ...toArray(sProd),
                ...toArray(sConfig)
              ];

              const locationMatch = locations.filter(loc => locSet.has(loc));
              const productMatch = products.filter(prod => prodSet.has(prod));

              const hasLocations = locations.length > 0;
              const hasProducts = products.length > 0;
              if(hasLocations){
                if(locationMatch.length>0){
                  data[i].VALUE = locationMatch.join(',');
                }
                else{
                  data[i].VALUE ='';
                }

              }

              if(hasProducts){
                if(productMatch.length>0){
                  data[i].VALUE = productMatch.join(',');
                }
                else{
                   data[i].VALUE ='';
                }
              }
          }
        }
        else{
           req.results =[];
        }
        }
         function toArray(val) {
    if (!val) return [];

    if (Array.isArray(val)) {
        return val.flatMap(v =>
            typeof v === 'string' ? v.split(',').map(s => s.trim()) : v
        );
    }

    if (typeof val === 'string') {
        return val.split(',').map(s => s.trim());
    }

    return [val];
}

      })
      
  srv.on("preDefinedHistory", async (req) => {
    const obgenJSFunction = new preDefHistoryCls();

    let lMessage = '';
    let lSuccess = '';
    let responce = '';
    // SDI Functions
    await obgenJSFunction.ImportECCLoc(req, lMessage, lSuccess, responce);
  });


  srv.on("preDefinedFuture", async (req) => {
    // const obgenJSFFunction = new preDefFutureCls();
    await obgenJSFFunction.generateFDemandQty(req);

  });

  srv.on("maintainActivity", async (req) => {
    var flag = req.data.Flag;
    var oData = JSON.parse(req.data.activityData);
    var responseMessage = '',
      errorFlag = false;
    if (flag == 'C' || flag == 'U') {
      let logData = GenFunctions.getLogInput(flag, req, oData.CREATED_BY);
      let oResult = {
        ACTIVITY_ID: oData.ACTIVITY_ID,
        ACTIVITY_DESC: oData.ACTIVITY_DESC,
        ACTION_URL: oData.ACTION_URL
      }
      oResult = Object.assign(oResult, logData)
      //Insert/Update into JS_ACTIVITY_HEADER First
      if (flag == 'C') {
        try {
          await cds.run(INSERT.into("JS_ACTIVITY_HEADER").entries(oResult));
          responseMessage = "Creation Successful";
        } catch(ex) {
          if(ex.message == 'ENTITY_ALREADY_EXISTS'){
            responseMessage = `Creation Failed, Activity: ${oData.ACTIVITY_ID} already Exists!`;
          }
          else{
            responseMessage = "Creation Failed";
          }
          errorFlag = true;
        }

      } else {
        try {
          await UPDATE`JS_ACTIVITY_HEADER`
            .with({
              ACTIVITY_DESC: oData.ACTIVITY_DESC,
              ACTION_URL: oData.ACTION_URL
            })
            .where(`ACTIVITY_ID = '${oData.ACTIVITY_ID}'`);
          responseMessage = "Updation Successful";
        } catch {
          responseMessage = "Updation Failed";
          errorFlag = true;
        }
      }

      //Next Insert into JS_ACTIVITY_ITEM
      var aItems = [],
        aTemplateItems = [];
      if (oData.ParameterList.length > 0) {
        oData.ParameterList.forEach(el => {
          const obj = {
            ACTIVITY_ID: oData.ACTIVITY_ID,
            PARAMETER_ID: el.PARAMETER_ID,
            OPTION_SELECT: el.OPTION_SELECT,
            MANDATORY: el.MANDATORY
          }
          aItems.push(obj);

          var sParameter = el.PARAMETER_ID;
          if (el.PARAMETER_ID.toString().includes('PRODUCT')) {
            sParameter = "PRODUCT_ID";
          } else if (el.PARAMETER_ID.toString().includes('LOCATION')) {
            sParameter = "LOCATION_ID";
          }
          const obj2 = {
            TEMPLATE_ID: oData.ACTIVITY_ID,
            ACTIVITY_ID: oData.ACTIVITY_ID,
            PARAMETER_ID: sParameter,
            VALUE: '',
            ACT_POSITION:1
          };
          aTemplateItems.push(obj2);
        })
      }
      if (flag == 'C') {
        try {
          if (aItems.length > 0) {
            await cds.run(INSERT.into("JS_ACTIVITY_ITEM").entries(aItems));
            if(errorFlag == false){
              responseMessage = "Creation Successful";
            }
          }
        } catch(ex) {
          if(ex.message == 'ENTITY_ALREADY_EXISTS'){
            responseMessage = `Creation Failed, Activity: ${oData.ACTIVITY_ID} already Exists!`;
          }
          else{
            responseMessage = "Creation Failed";
          }
          errorFlag = true;
        }
      } else {
        try {
          await cds.run(
            `DELETE FROM "JS_ACTIVITY_ITEM" 
                            WHERE "ACTIVITY_ID" = '${oData.ACTIVITY_ID}'
                            `).then(async function () {
              if (aItems.length > 0) {
                await cds.run(INSERT.into("JS_ACTIVITY_ITEM").entries(aItems));
              }
            });
          responseMessage = "Updation Successful";
        } catch (ex) {
          responseMessage = "Updation Failed";
          errorFlag = true;
        }
      }

      //Next Insert/Update into JS_TEMPLATE_HEADER 
      let oTemplateResult = {
        TEMPLATE_ID: oData.ACTIVITY_ID,
        TEMPLATE_DESC: oData.ACTIVITY_ID,
        STEPS: 1,
        LAYER_CODE: 'Global'
      }
      oTemplateResult = Object.assign(oTemplateResult, logData);
      if (flag == 'C') {
        try {
          await cds.run(INSERT.into("JS_TEMPLATE_HEADER").entries(oTemplateResult));
        } catch (e) { }
      } else {
        try {
          await UPDATE`JS_TEMPLATE_HEADER`
            .with({
              TEMPLATE_DESC: oData.ACTIVITY_DESC
            })
            .where(`TEMPLATE_ID = '${oData.ACTIVITY_ID}'`);
        } catch { }
      }

      //Next Insert/Update into JS_TEMPLATE_ITEM
      const oTemplateItemResult = {
        TEMPLATE_ID: oData.ACTIVITY_ID,
        ACTIVITY_ID: oData.ACTIVITY_ID,
        STEP_NAME: oData.ACTIVITY_ID,
        ACT_POSITION: 1
      }
      if (flag == 'C') {
        try {
          await cds.run(INSERT.into("JS_TEMPLATE_ACTITEM").entries(oTemplateItemResult));
        } catch { }
      }

      //Next Insert/update into JS_TEMPLATE_ACTITEM_PARAM
      if (flag == 'C') {
        try {
          if (aTemplateItems.length > 0) {
            await cds.run(INSERT.into("JS_TEMPLATE_ACTITEM_PARAM").entries(aTemplateItems));
          } else{
            const obj2 = {
              TEMPLATE_ID: oData.ACTIVITY_ID,
              ACTIVITY_ID: oData.ACTIVITY_ID,
              PARAMETER_ID: '',
              VALUE: '',
              ACT_POSITION:1
            };
            aTemplateItems.push(obj2);
            await cds.run(INSERT.into("JS_TEMPLATE_ACTITEM_PARAM").entries(aTemplateItems));
          }
        } catch(ex) {
          console.log(ex);
         }
      } else {
        try {
          await cds.run(
            `DELETE FROM "JS_TEMPLATE_ACTITEM_PARAM" 
                            WHERE "ACTIVITY_ID" = '${oData.ACTIVITY_ID}'
                            `);
          if (aTemplateItems.length > 0) {
            await cds.run(INSERT.into("JS_TEMPLATE_ACTITEM_PARAM").entries(aTemplateItems));
          }
        } catch (ex) { }
      }
    } else if (flag == 'D') { //Delete Activity
      //First Check  ACTIVITY_ID from JS_JOB_TEMPLATEDETAILS
      var aList =[];
      var liTemplates = await cds.run(
        `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
            WHERE "ACTIVITY_ID" = '` + oData.ACTIVITY_ID + `'
            `
      );
      if (liTemplates.length > 0) {
       var iCurrentTime = new Date(oData.deletionTime).getTime();
        liTemplates.forEach((el) => {
          var sJobEnd = el.JOB_ENDTIME;
          if (el.JOB_TYPE == 'One Time' || el.JOB_TYPE == null || el.JOB_TYPE =='' || el.JOB_TYPE == undefined || el.JOB_TYPE == 'Cron') {//check if current Time is after sJobEnd
            if(iCurrentTime < new Date(sJobEnd).getTime()){
              aList.push({
                TEMPLATE_ID : el.TEMPLATE_ID,
                JOB_ID:el.JOB_ID,
                JOB_NAME:el.JOB_NAME,
                ACTIVITY_ID :el.ACTIVITY_ID
              })
              errorFlag = true;
              responseMessage =  JSON.stringify(aList);
            }
          }
        })
        if(aList.length == 0){//Proceed to Delete as current time is greather than JobEndTime
          deleteActivity();
        }
      } else { //Activity Not Used in any Jobs
        deleteActivity();
      }

     async function deleteActivity(){
               try{
           cds.run(
                `DELETE FROM "JS_ACTIVITY_HEADER" 
                    WHERE "ACTIVITY_ID" = '${oData.ACTIVITY_ID}'
                    `);

               cds.run(
                       `DELETE FROM "JS_ACTIVITY_ITEM" 
                          WHERE "ACTIVITY_ID" = '${oData.ACTIVITY_ID}'
                          `);
               responseMessage = "Deletion Successful";
          //     //Get All templates with ACTIVITY_ID
              var liTemplates = await cds.run(
                `SELECT * FROM "JS_TEMPLATE_ACTITEM"
                    WHERE "ACTIVITY_ID" = '` + oData.ACTIVITY_ID + `'
                    `
              );
              if(liTemplates.length >0){
                liTemplates.forEach(el=>{
                   cds.run(
                    `DELETE FROM "JS_TEMPLATE_HEADER" 
                      WHERE "TEMPLATE_ID" = '${el.TEMPLATE_ID}'`);

                       cds.run(
                        `DELETE FROM "JS_TEMPLATE_ACTITEM" 
                          WHERE "TEMPLATE_ID" = '${el.TEMPLATE_ID}'
                          `);

                           cds.run(
                            `DELETE FROM "JS_TEMPLATE_ACTITEM_PARAM" 
                              WHERE "TEMPLATE_ID" = '${el.TEMPLATE_ID}'
                              `);
                    
                })
              }
              responseMessage = "Deletion Successful";
            }
             catch{
                responseMessage = "Deletion Failed";
                errorFlag = true;
             }
      }
    }
    return {
      msg: responseMessage,
      error: errorFlag
    };
  })

  srv.on("maintainParameter", async (req) => {
    var flag = req.data.Flag;
    var oData = JSON.parse(req.data.parameterData);
    var responseMessage = '',
      errorFlag = false,liActivities =[];
      
    if (flag == 'C' || flag == 'U') {
      let logData = GenFunctions.getLogInput(flag, req, oData.CREATED_BY);
      let oResult = {
        PARAMETER_ID: oData.PARAMETER_ID,
        PARAM_DESC: oData.PARAM_DESC
      }
      oResult = Object.assign(oResult, logData)
      if (flag == 'C') {
        try {
          await cds.run(INSERT.into("JS_ACTIVITY_PARAMETERS").entries(oResult));
          responseMessage = "Creation Successful";
        } catch(ex) {
          if(ex.message == 'ENTITY_ALREADY_EXISTS'){
            responseMessage = `Creation Failed, Parameter: ${oData.PARAMETER_ID} already Exists!`;
          }
          else{
            responseMessage = "Creation Failed";
          }
          errorFlag = true;
        }

      } else {
        try {
          await UPDATE`JS_ACTIVITY_PARAMETERS`
            .with({
              PARAM_DESC: oData.PARAM_DESC,
              CHANGED_BY: logData.CHANGED_BY,
              CHANGED_DATE: logData.CHANGED_DATE,
              CHANGED_TIME: logData.CHANGED_TIME
            })
            .where(`PARAMETER_ID = '${oData.PARAMETER_ID}'`);
          responseMessage = "Updation Successful";
        } catch {
          responseMessage = "Updation Failed";
          errorFlag = true;
        }
      }
    }
    else if(flag == 'D'){
      let aParameters  = oData.PARAMETER_ID;
      var query ='',actQuery ='';
      //find Activities which uses the parameter(s)
      aParameters.forEach((el,i)=>{
        if(i ==0){
          query = `SELECT * FROM "JS_ACTIVITY_ITEM"
          WHERE "PARAMETER_ID" = '` + el +  `'`;
        }
        else{
          query = query +  `
          OR "PARAMETER_ID" = '` + el + `'`;
        }
   
      })
       liActivities = await cds.run(query);
      if(liActivities.length >0){
        //find jobs which uses the activities
        liActivities.forEach((el,i)=>{
          if(i ==0){
            actQuery = `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
            WHERE "ACTIVITY_ID" = '` + el.ACTIVITY_ID +  `'`;
          }
          else{
            actQuery = actQuery +  `
            OR "ACTIVITY_ID" = '` + el.ACTIVITY_ID + `'`;
          }
     
        })
        const liTemplates = await cds.run(actQuery);
        if(liTemplates.length >0){
          var iCurrentTime = new Date(oData.deletionTime).getTime();
          let aList= [];
          liTemplates.forEach((el) => {
            var sJobEnd = el.JOB_ENDTIME;
            if (el.JOB_TYPE == 'One Time' || el.JOB_TYPE == null || el.JOB_TYPE =='' || el.JOB_TYPE == undefined || el.JOB_TYPE == 'Cron') {//check if current Time is after sJobEnd
              if(iCurrentTime < new Date(sJobEnd).getTime()){
              //find parameters for the activity
              let aParameters =  liActivities.filter(a=>a.ACTIVITY_ID == el.ACTIVITY_ID);
              aParameters = aParameters.map(m=>m.PARAMETER_ID)
              aList.push({
                TEMPLATE_ID : el.TEMPLATE_ID,
                JOB_ID:el.JOB_ID,
                JOB_NAME:el.JOB_NAME,
                ACTIVITY_ID :el.ACTIVITY_ID,
                PARAMETER_ID: aParameters.toString()
              })
              errorFlag = true;
              responseMessage =  JSON.stringify(aList);
              }
            }
          })
          if(errorFlag != true){//if no error cases
            deleteParameter();
          }
        }
        else{//Delete Directly
          deleteParameter();
        }
      }
      else{//Delete Directly
        deleteParameter();
      }
      async function deleteParameter(){
        try{
          aParameters.forEach(p=>{
            cds.run(
              `DELETE FROM "JS_ACTIVITY_PARAMETERS" 
                  WHERE "PARAMETER_ID" = '${p}'
                  `);
                  
          })
        responseMessage = "Deletion Successful";
     }
     catch{
         responseMessage = "Deletion Failed";
         errorFlag = true;
     }
}
    }
    return {
      msg: responseMessage,
      error: errorFlag
    };
  });

  //Data level authorization for delete job template
  srv.before("removeTemplate", async req => {
     let sUser = req.headers['x-user-id'];
      req._unauthorized = false;
     if(sUser){
      try{
      var oData = JSON.parse(req.data.TemplateData);
      if(oData){
        let data = await cds.run(`SELECT * FROM "JS_TEMPLATE_ACTITEM_PARAM" WHERE TEMPLATE_ID='${oData.TEMPLATE_ID}'`);
        if(data.length>0){
           let aRoles = await cds.run(`SELECT DISTINCT FACTORY_LOC,DEMAND_LOC,PRODUCT_ID,REF_PRODID FROM "V_ROLES_ACCESS" WHERE USER='${sUser}' AND  DELETE=true`);
            if (aRoles.length > 0) {
          const locSet = new Set();
          const prodSet = new Set();
          aRoles.forEach(r => {
            if (r.FACTORY_LOC) locSet.add(r.FACTORY_LOC);
            if (r.DEMAND_LOC) locSet.add(r.DEMAND_LOC);

            if (r.PRODUCT_ID) prodSet.add(r.PRODUCT_ID);
            if (r.REF_PRODID) prodSet.add(r.REF_PRODID);
          });
          for (var i = 0; i < data.length; i++) {
            let paramObj = data[i];
             paramObj.VALUE =  paramObj.VALUE.toString()
            let sLoc = null,sMLoc = null,sDloc = null,sPartial =null,sProd = null,sConfig='';
            switch(paramObj.PARAMETER_ID){
              case 'LOCATION_ID':
                sLoc = paramObj.VALUE
                break;
                   case 'MF_LOCATION_ID':
                sMLoc = paramObj.VALUE
                break;
                   case 'DEMAND_LOC':
                sDloc = paramObj.VALUE
                break;
                case 'PARTIAL_PRODUCT':
                sPartial = paramObj.VALUE
                break;
                   case 'PRODUCT_ID':
                sProd = paramObj.VALUE
                break;
                   case 'CONFIG_PRODUCT':
                sConfig = paramObj.VALUE
                break;
            }
              const locations = [
                ...toArray(sLoc),
                ...toArray(sMLoc),
                ...toArray(sDloc)
              ];
              const products = [
                ...toArray(sPartial),
                ...toArray(sProd),
                ...toArray(sConfig)
              ];

              const locationMatch = locations.filter(loc => locSet.has(loc));
              const productMatch = products.filter(prod => prodSet.has(prod));

              const hasLocations = locations.length > 0;
              const hasProducts = products.length > 0;
              if(hasLocations){
                if(locationMatch.length != locations.length){
                  req._unauthorized = true;
                 break;
                }
              }

              if(hasProducts){
                if(productMatch.length != products.length){
                    req._unauthorized = true;
                   break;
                }
              }
          }
          }
         else{
           req._unauthorized = true;
         }
          }
      }
      }
      catch(ex){
        console.log("Error:",ex.message)
      }

     }
      function toArray(val) {
                if (!val) return [];

                if (Array.isArray(val)) {
                    return val.flatMap(v =>
                        typeof v === 'string' ? v.split(',').map(s => s.trim()) : v
                    );
                }

                if (typeof val === 'string') {
                    return val.split(',').map(s => s.trim());
                }

                return [val];
            }
 
});

  srv.on("removeTemplate", async req => {
    if(req._unauthorized == true){
      return "403"
    }
    var oData = JSON.parse(req.data.TemplateData);
    var responseMessage = '',
        errorFlag = '';
    let count = 0;
    let Jobs = [];

    //First Check  TEMPLATE_ID from JS_JOB_TEMPLATEDETAILS
    let aList =[];
    let liTemplates = await cds.run(
        `SELECT * FROM "JS_JOB_TEMPLATEDETAILS"
            WHERE "TEMPLATE_ID" = '` + oData.TEMPLATE_ID + `'
            `
      );
      if (liTemplates.length > 0) {
        let iCurrentTime = new Date(oData.deletionTime).getTime();
        liTemplates.forEach((el) => {
          let sJobEnd = el.JOB_ENDTIME;
          if(iCurrentTime > new Date(sJobEnd).getTime() || el.ACTIVE === false){
            count = count + 1;
            
            } else {
              Jobs.push(el.JOB_ID);
            }
          
        })
        if(count > 0){//Proceed to Delete as current time is greather than JobEndTime
           try{
          //Get All templates with ACTIVITY_ID 
          await cds.run(
                      `DELETE FROM "JS_TEMPLATE_HEADER" 
                        WHERE "TEMPLATE_ID" = '${oData.TEMPLATE_ID}' `);
         
                        await cds.run( `DELETE FROM "JS_TEMPLATE_ACTITEM" 
                        WHERE "TEMPLATE_ID" = '${oData.TEMPLATE_ID}' `);
         
                        await cds.run(
                              `DELETE FROM "JS_TEMPLATE_ACTITEM_PARAM" 
                                WHERE "TEMPLATE_ID" = '${oData.TEMPLATE_ID}' `);
                      
                responseMessage = "Deletion Successful";
                errorFlag = 'X';
        //  return responseMessage;
              }
               catch{
                  responseMessage = "Deletion Failed";
                  errorFlag = 'Y';
        //  return responseMessage;
         
               }
        } else {
          responseMessage = "Selected template is added for the JOB which is active";
          // return responseMessage;
        }
      } else {
        try{
          //Get All templates with ACTIVITY_ID 
          await cds.run(
                      `DELETE FROM "JS_TEMPLATE_HEADER" 
                        WHERE "TEMPLATE_ID" = '${oData.TEMPLATE_ID}' `);
         
                        await cds.run( `DELETE FROM "JS_TEMPLATE_ACTITEM" 
                        WHERE "TEMPLATE_ID" = '${oData.TEMPLATE_ID}' `);
         
                        await cds.run(
                              `DELETE FROM "JS_TEMPLATE_ACTITEM_PARAM" 
                                WHERE "TEMPLATE_ID" = '${oData.TEMPLATE_ID}' `);
                                      
                responseMessage = "Deletion Successful";
                errorFlag = 'X';
        //  return responseMessage;
         
              }
               catch{
                  responseMessage = "Deletion Failed";
                  errorFlag = 'Y';
        //  return responseMessage;         
               }
      }
      return responseMessage;


//       async function deleteActivity(){
//         try{
//  //Get All templates with ACTIVITY_ID
       
//  await cds.run(
//              `DELETE FROM "JS_TEMPLATE_HEADER" 
//                WHERE "TEMPLATE_ID" = '${oData.TEMPLATE_ID}' `);

//                await cds.run( `DELETE FROM "JS_TEMPLATE_ACTITEM" 
//                WHERE "TEMPLATE_ID" = '${oData.TEMPLATE_ID}' `);

//                await cds.run(
//                      `DELETE FROM "JS_TEMPLATE_ACTITEM_PARAM" 
//                        WHERE "TEMPLATE_ID" = '${oData.TEMPLATE_ID}' `);
             
       
//        responseMessage = "Deletion Successful";
//        errorFlag = 'X';
// return responseMessage;


//      }
//       catch{
//          responseMessage = "Deletion Failed";
//          errorFlag = 'Y';
// return responseMessage;

//       }
// }
      // if(errorFlag === ""){
      //   responseMessage = "Selected template is added for the JOB which is active"
      // }

// return responseMessage;

});


// To save new template details
srv.on("genTemplateDetails", async req => {
  let liTempHeader = [];
  let liTempItem = [];
  let lsresults = {};
  let lsItems = {};
  let liTempdata = {};
  let Creation_FLAG = req.data.FLAG;
  let Variant = req.data.VARIANT;

  let TemplateHeader =  '',
      TemplateItem = '',
      TemplateActitem = '';

  let liParamData = [];
  let liParamTemp = {};
  let tFlag = "",
      taFlag = "",
      dFlag = "",
      daFlag = "",
      FDflag = "";
      let VarName = 'NA';


  let datetime = new Date();
  let curDate = datetime.toISOString().slice(0, 10);

// template data and parameter values
  liTempdata = JSON.parse(req.data.TEMPDATA);
  liParamData = JSON.parse(req.data.PARAMDATA);

  let logData = GenFunctions.getLogInput('C', req, liTempdata[0].CREATED_BY);

  if(Variant === ""){
    TemplateHeader = `DELETE FROM "JS_TEMPLATE_HEADER"
                      WHERE "JS_TEMPLATE_HEADER"."TEMPLATE_ID" = '${liTempdata[0].TEMPLATE_ID}'
                      AND "JS_TEMPLATE_HEADER"."VARIANT_NAME" = '${VarName}'  `;

    TemplateItem = `DELETE FROM "JS_TEMPLATE_ACTITEM"
                      WHERE "JS_TEMPLATE_ACTITEM"."TEMPLATE_ID" = '${liTempdata[0].TEMPLATE_ID}'
                      AND "JS_TEMPLATE_ACTITEM"."VARIANT_NAME" = '${VarName}'  `;

     TemplateActitem = `DELETE FROM "JS_TEMPLATE_ACTITEM_PARAM"
                      WHERE "JS_TEMPLATE_ACTITEM_PARAM"."TEMPLATE_ID" = '${liTempdata[0].TEMPLATE_ID}'
                      AND "JS_TEMPLATE_ACTITEM_PARAM"."VARIANT_NAME" = '${VarName}'  `;
  } else {
    VarName = liTempdata[0].VARIANT_NAME;
    TemplateHeader = `DELETE FROM "JS_TEMPLATE_HEADER"
                      WHERE "JS_TEMPLATE_HEADER"."TEMPLATE_ID" = '${liTempdata[0].TEMPLATE_ID}'
                      AND "JS_TEMPLATE_HEADER"."VARIANT_NAME" = '${VarName}'  `;

    TemplateItem = `DELETE FROM "JS_TEMPLATE_ACTITEM"
                      WHERE "JS_TEMPLATE_ACTITEM"."TEMPLATE_ID" = '${liTempdata[0].TEMPLATE_ID}'
                      AND "JS_TEMPLATE_ACTITEM"."VARIANT_NAME" = '${VarName}'  `;

     TemplateActitem = `DELETE FROM "JS_TEMPLATE_ACTITEM_PARAM"
                      WHERE "JS_TEMPLATE_ACTITEM_PARAM"."TEMPLATE_ID" = '${liTempdata[0].TEMPLATE_ID}'
                      AND "JS_TEMPLATE_ACTITEM_PARAM"."VARIANT_NAME" = '${VarName}'  `;
  }

  if(Creation_FLAG === "E"){
    if(Variant === ""){
    var liTemplateData = await cds.run(
      `SELECT * FROM "JS_TEMPLATE_HEADER"
          WHERE "TEMPLATE_ID" = '` + liTempdata[0].TEMPLATE_ID + `'
          AND "VARIANT_NAME" =  '` + 'NA' + `'
          `
    );
  } else {
    var liTemplateData = await cds.run(
      `SELECT * FROM "JS_TEMPLATE_HEADER"
          WHERE "TEMPLATE_ID" = '` + liTempdata[0].TEMPLATE_ID + `'
          AND "VARIANT_NAME" =  '` + liTempdata[0].VARIANT_NAME + `'
          `
    );
  }
    lsresults.CREATED_DATE = liTemplateData[0].CREATED_DATE;
    lsresults.CREATED_BY = liTemplateData[0].CREATED_BY;
    lsresults.CREATED_TIME = liTemplateData[0].CREATED_TIME;

    lsresults.CHANGED_DATE = logData.CREATED_DATE;
    lsresults.CHANGED_BY   = logData.CREATED_BY ;
    lsresults.CHANGED_TIME = logData.CREATED_TIME;
  } else {
    lsresults.CREATED_DATE = logData.CREATED_DATE;
    lsresults.CREATED_BY = logData.CREATED_BY;
    lsresults.CREATED_TIME = logData.CREATED_TIME;
  }

  // Template Header data
  lsresults.TEMPLATE_ID = liTempdata[0].TEMPLATE_ID;
  lsresults.TEMPLATE_DESC = liTempdata[0].TEMPLATE_DESC;
  lsresults.STEPS = liTempdata[0].MAXSTEP;
  // lsresults.CREATED_DATE = logData.CREATED_DATE;
  // lsresults.CREATED_BY = logData.CREATED_BY;
  lsresults.LAYER_CODE = liTempdata[0].LAYER_CODE;
  lsresults.RECURRENCE = "";
  lsresults.RECURRENCE_VALUE = "";
  lsresults.LEVEL = liTempdata[0].LEVEL;

  // lsresults.RECURRENCE_VALUE_FORMAT = liTempdata[0].RECURRENCE_VALUE_FORMAT;
  // lsresults.CREATED_TIME = logData.CREATED_TIME;
  // lsresults.CHANGED_DATE = liTempdata.;
  // lsresults.CHANGED_BY   = liTempdata.;
  // lsresults.CHANGED_TIME = liTempdata.;

  if(Variant === "X"){
    lsresults.VARIANT_NAME = liTempdata[0].VARIANT_NAME;
  }

  liTempHeader.push(lsresults);
  lsresults = {};
  
  // Generating Template Item data
  for (let i = 0; i < liTempdata.length; i++) {
    lsItems.TEMPLATE_ID = liTempdata[i].TEMPLATE_ID;
    lsItems.ACTIVITY_ID = liTempdata[i].ACTIVITY_ID;
    lsItems.STEP_NAME = liTempdata[i].STEP_NAME;
    lsItems.ACT_POSITION = liTempdata[i].ACT_POSITION;
    lsItems.LEVEL = liTempdata[i].LEVEL;
    lsItems.VARIANT_NAME = liTempdata[0].VARIANT_NAME;
    liTempItem.push(lsItems);
    lsItems = {};
  }
  if (liTempdata.length > 0) {
    if(Creation_FLAG === "E"){
      try {
        // await cds.run( `DELETE FROM "JS_TEMPLATE_HEADER" 
        //                   WHERE "TEMPLATE_ID" = '${liTempHeader[0].TEMPLATE_ID}' `);
        await cds.run(TemplateHeader);
       
                          dFlag = "X";
        // responseMessage = "Updation Successful";
      } catch (ex) {
        responseMessage = "Failed to edit";
        dFlag = "";
      }

      if(dFlag === "X"){
        try {
          // await cds.run( `DELETE FROM "JS_TEMPLATE_ACTITEM" 
          //                 WHERE "TEMPLATE_ID" = '${liTempHeader[0].TEMPLATE_ID}' `);
          await cds.run(TemplateItem);
     
                          daFlag = "X";
        } catch (e) {
          daFlag = "";
          responseMessage = "Failed to edit";
        }
        if(daFlag === "X"){
        try {
          // await cds.run( `DELETE FROM "JS_TEMPLATE_ACTITEM_PARAM" 
          //                 WHERE "TEMPLATE_ID" = '${liTempHeader[0].TEMPLATE_ID}' `);
          await cds.run(TemplateActitem);
                          FDflag = "X";
          responseMessage = "Template saved successfully";
    
        } catch (e) {
          FDflag = "";
          responseMessage = "Failed to edit";
        }
    
      }
      }
    } else {
      FDflag = "X";
    }
  // }

    if(FDflag === "X"){
    
    try {
      // Saving template header data
      await cds.run(INSERT.into("JS_TEMPLATE_HEADER").entries(liTempHeader));   
       tFlag = "X";
    } catch (e) {
       tFlag = "";
      responseMessage = "Template failed to save";
      GenFunctions.log(e.originalMessage + "orgininalmessage");
      GenFunctions.log(e.message + "JS_TEMPLATE_HEADER");
    }
    if(tFlag === "X"){
    try {
      // Saving template item data with activity    
      await cds.run(INSERT.into("JS_TEMPLATE_ACTITEM").entries(liTempItem));
       taFlag = "X";
    } catch (e) {
       taFlag = "";
      responseMessage = "Template Activity items failed to save";
      // await cds.run( `DELETE FROM "JS_TEMPLATE_HEADER" 
      //                     WHERE "TEMPLATE_ID" = '${liTempItem[0].TEMPLATE_ID}' `);
      // await cds.run( `DELETE FROM "JS_TEMPLATE_ACTITEM" 
      //                     WHERE "TEMPLATE_ID" = '${liTempItem[0].TEMPLATE_ID}' `);

      await cds.run(TemplateHeader);
      await cds.run(TemplateItem);
    }
    if(taFlag === "X"){
    try {
      // Saving parameters for the template activity  
      await cds.run(INSERT.into("JS_TEMPLATE_ACTITEM_PARAM").entries(liParamData));
      responseMessage = "Template saved successfully";

    } catch (e) {
      responseMessage = "Template Activity item parameters failed to save";
      // await cds.run( `DELETE FROM "JS_TEMPLATE_HEADER" 
      //                     WHERE "TEMPLATE_ID" = '${liTempItem[0].TEMPLATE_ID}' `);
      // await cds.run( `DELETE FROM "JS_TEMPLATE_ACTITEM" 
      //                     WHERE "TEMPLATE_ID" = '${liTempItem[0].TEMPLATE_ID}' `);
      // await cds.run( `DELETE FROM "JS_TEMPLATE_ACTITEM_PARAM" 
      //                     WHERE "TEMPLATE_ID" = '${liTempItem[0].TEMPLATE_ID}' `);
      await cds.run(TemplateHeader);
      await cds.run(TemplateItem);
      await cds.run(TemplateActitem);
    }

  }
  }
}
  } else {
    responseMessage = "No Data to save";
  }

  return responseMessage;


});

  srv.on("readJobLogs", async (req) => {
    let sUser = req.headers['x-user-id'];
    var aData = [], aFiltered = [];
    if (sUser) {
      aData = await cds.run(`SELECT 
	JOB_ID,
	JOB_NAME,
	JOB_STATUS,
	TOTAL_STEPS,
	TEMPLATE_ID,
	ACTIVE,
	SEQUENCE_ID,
	JOB_TYPE,
	LEVEL,
	JOB_STARTTIME,
    JOB_ENDTIME,
	CREATED_BY,
	VARIANT_FLAG,
	MAIN_SET,
	"SET",
	"PARAM_VALUE"
FROM 
JS_JOB_TEMPLATEDETAILS ORDER BY JOB_STARTTIME DESC`);
      if (aData.length > 0) {
        // let aRoles = await cds.run(`SELECT DISTINCT FACTORY_LOC,DEMAND_LOC,PRODUCT_ID,REF_PRODID FROM "V_ROLES_LOCPROD" WHERE USER='${sUser}'`);
        let aRoles = await cds.run(`SELECT DISTINCT FACTORY_LOC,DEMAND_LOC,PRODUCT_ID,REF_PRODID,UPDATE,DELETE FROM "V_ROLES_ACCESS" WHERE USER='${sUser}'`);
        if (aRoles.length > 0) {
          const locSet = new Set();
          const prodSet = new Set();
          aRoles.forEach(r => {
            r.UPDATE  = Boolean(r.UPDATE);
            r.DELETE  = Boolean(r.DELETE);
            if (r.FACTORY_LOC) locSet.add(r.FACTORY_LOC);
            if (r.DEMAND_LOC) locSet.add(r.DEMAND_LOC);

            if (r.PRODUCT_ID) prodSet.add(r.PRODUCT_ID);
            if (r.REF_PRODID) prodSet.add(r.REF_PRODID);
          });
          for (var i = 0; i < aData.length; i++) {
            let el = aData[i];
            let oParam = el.PARAM_VALUE.toString();
            if (oParam == '{}') {
              delete el.PARAM_VALUE;
              //since no parameters, check if user has access to any update or delete
               el.UPDATE = false;
              el.DELETE = false;
              if(aRoles.findIndex(f=>f.UPDATE == true) !=-1){
                 el.UPDATE = true;
              }
              if(aRoles.findIndex(f=>f.DELETE == true) !=-1){
                 el.DELETE = true;
              }
              aFiltered.push(el);
              continue;
            }
            else {
              let paramObj = {};
              try {
                paramObj = JSON.parse(oParam);
              } catch (e) {

              }
              const locations = [
                ...toArray(paramObj.LOCATION_ID),
                ...toArray(paramObj.MF_LOCATION_ID),
                ...toArray(paramObj.DEMAND_LOC)
              ];
              const products = [
                ...toArray(paramObj.PARTIAL_PRODUCT),
                ...toArray(paramObj.PRODUCT_ID)
              ];

              const locationMatch = locations.some(loc => locSet.has(loc));
              const productMatch = products.some(prod => prodSet.has(prod));

              const hasLocations = locations.length > 0;
              const hasProducts = products.length > 0;

              let isMatch = false;

              if (hasLocations && hasProducts) {//location and product are inputs
                isMatch = locationMatch && productMatch;
              } else if (hasLocations) {//only Location is job input
                isMatch = locationMatch;
              } else if (hasProducts) {//only product is job input
                isMatch = productMatch;
              } else {
                isMatch = true;
              }

              if (isMatch) {
                delete el.PARAM_VALUE;
                 // Find roles that match this element's locations/products
              const matchingRoles = aRoles.filter(r => {
                const roleLocMatch = !r.FACTORY_LOC && !r.DEMAND_LOC 
                  ? true 
                  : (r.FACTORY_LOC && locations.includes(r.FACTORY_LOC)) || 
                    (r.DEMAND_LOC && locations.includes(r.DEMAND_LOC));

                const roleProdMatch = !r.PRODUCT_ID && !r.REF_PRODID 
                  ? true 
                  : (r.PRODUCT_ID && products.includes(r.PRODUCT_ID)) || 
                    (r.REF_PRODID && products.includes(r.REF_PRODID));

                return roleLocMatch && roleProdMatch;
              });
              el.UPDATE = matchingRoles.some(r => r.UPDATE);
              el.DELETE = matchingRoles.some(r => r.DELETE);
                aFiltered.push(el);
              }
            }
          }
          aData = aFiltered;

        }
        else {
          aData = [];//No roles assigned
        }

      }
    }
    else {
      aData = await cds.run(`SELECT * FROM "V_JOBLISTDATA"`);
    }
    const keys = ['JOB_ID', 'JOB_NAME'];
    let JobData = GenFunctions.removeDuplicate(aData, keys);


    return JSON.stringify(JobData);

    function toArray(val) {
      if (!val) {
        return [];
      }
      return Array.isArray(val) ? val : [val];
    }
  })

// To save Job details
srv.on("genJobDetails", async req => {
  let liJobData = [];
  let liTempdata = {};
  let lsresults = {};


  let datetime = new Date();
  let curDate = datetime.toISOString().slice(0, 10);


  liTempdata = JSON.parse(req.data.JobDATA);

  if(req.data.Flag === "R"){

    try {
      await UPDATE`JS_JOB_TEMPLATEDETAILS`
          .with({
            RECURRENCE_VALUE: liTempdata[0].RECURRENCE_VALUE,
            RECURRENCE_VALUE_FORMAT : liTempdata[0].RECURRENCE_VALUE_FORMAT ,
            // JOB_STARTTIME : liTempdata[0].JOB_STARTTIME ,
            JOB_ENDTIME : liTempdata[0].JOB_ENDTIME ,
            SCH_STARTTIME : liTempdata[0].SCH_STARTTIME ,
            SCH_ENDTIME : liTempdata[0].SCH_ENDTIME
          })
          .where(`JOB_ID = '${liTempdata[0].JOB_ID}'`);

      responseMessage = "Updated Successfully";
  } catch (e) {
      responseMessage = "Failed to update data";
  }



  } else if(req.data.Flag === "U"){

    try {
      await UPDATE`JS_JOB_TEMPLATEDETAILS`
          .with({
            JOB_ID: liTempdata[0].JOB_ID
          })
          .where(`SEQUENCE_ID = '${liTempdata[0].SEQUENCE_ID}'`);

            responseMessage = "Job Updated Successfully";
        } catch (e) {
            responseMessage = "Failed to update data";
        }



  } else {

  let logData = GenFunctions.getLogInput('C', req, liTempdata[0].CREATED_BY);

  
  for (let i = 0; i < liTempdata.length; i++) {
    lsresults.JOB_ID = liTempdata[i].JOB_ID;
    lsresults.SUBJOB_ID = liTempdata[i].SUBJOB_ID;
    lsresults.SEQUENCE_ID = liTempdata[i].SEQUENCE_ID;
    lsresults.SCHEDULE_ID = liTempdata[i].SCHEDULE_ID;
    lsresults.JOB_NAME = liTempdata[i].JOB_NAME;
    lsresults.TEMPLATE_ID = liTempdata[i].TEMPLATE_ID;
    lsresults.ACTIVITY_ID = liTempdata[i].ACTIVITY_ID;
    lsresults.PARAM_VALUE = JSON.stringify(liTempdata[i].PARAM_VALUE);
    lsresults.STEP = liTempdata[i].STEP;
    lsresults.STEP_NO = liTempdata[i].STEP_NO;
    lsresults.SET = liTempdata[i].SET;
    lsresults.SUB_STEP = liTempdata[i].SUBSTEP;
    lsresults.MANDATORY = liTempdata[i].MANDATORY;
    lsresults.MAIN_SET = liTempdata[i].MAIN_STEP;
    lsresults.TOTAL_STEPS = liTempdata[i].TOTAL_STEPS;
    lsresults.JOB_TYPE = liTempdata[i].JOB_TYPE;
    if(liTempdata[i].LEVEL === "" || liTempdata[i].LEVEL === undefined || liTempdata[i].LEVEL === null){
      liTempdata[i].LEVEL = "E"
    }
    lsresults.LEVEL = liTempdata[i].LEVEL;
    lsresults.RECURRENCE_VALUE = liTempdata[i].RECURRENCE_VALUE;
    lsresults.RECURRENCE_VALUE_FORMAT = liTempdata[i].RECURRENCE_VALUE_FORMAT;
    lsresults.JOB_STARTTIME = liTempdata[i].JOB_STARTTIME;
    lsresults.JOB_ENDTIME = liTempdata[i].JOB_ENDTIME;
    lsresults.SCH_STARTTIME = liTempdata[i].SCH_STARTTIME;
    lsresults.SCH_ENDTIME = liTempdata[i].SCH_ENDTIME;
    lsresults.ACTIVE = true;
    lsresults.CREATED_DATE = logData.CREATED_DATE;
    lsresults.CREATED_BY = logData.CREATED_BY;
    lsresults.CREATED_TIME = logData.CREATED_TIME;

    liJobData.push(lsresults);
    lsresults = {};
  }


  if (liJobData.length > 0) {
    try {
      if(req.data.Flag === "X"){
        await cds.run( `DELETE FROM "JS_JOB_TEMPLATEDETAILS" 
                          WHERE "JOB_NAME" = '${liJobData[0].JOB_NAME}' `);
      }
      await cds.run(INSERT.into("JS_JOB_TEMPLATEDETAILS").entries(liJobData));
      responseMessage = "Job data saved successfully";
    } catch (e) {
            //DONOTHING
      responseMessage = "Job data failed to save";
    }
  }


} 
  return responseMessage;
});


srv.on("genJobDetailsPOST", async req => {
  let liJobData = [];
  let liTempdata = {};
  let lsresults = {};


  let datetime = new Date();
  let curDate = datetime.toISOString().slice(0, 10);


  liTempdata = JSON.parse(req.data.JobDATA);

  if(req.data.Flag === "R"){

    try {
      await UPDATE`JS_JOB_TEMPLATEDETAILS`
          .with({
            RECURRENCE_VALUE: liTempdata[0].RECURRENCE_VALUE,
            RECURRENCE_VALUE_FORMAT : liTempdata[0].RECURRENCE_VALUE_FORMAT ,
            // JOB_STARTTIME : liTempdata[0].JOB_STARTTIME ,
            JOB_ENDTIME : liTempdata[0].JOB_ENDTIME ,
            SCH_STARTTIME : liTempdata[0].SCH_STARTTIME ,
            SCH_ENDTIME : liTempdata[0].SCH_ENDTIME
          })
          .where(`JOB_ID = '${liTempdata[0].JOB_ID}'`);

      responseMessage = "Updated Successfully";
  } catch (e) {
      responseMessage = "Failed to update data";
  }



  } else if(req.data.Flag === "U"){

    try {
      await UPDATE`JS_JOB_TEMPLATEDETAILS`
          .with({
            JOB_ID: liTempdata[0].JOB_ID
          })
          .where(`SEQUENCE_ID = '${liTempdata[0].SEQUENCE_ID}'`);

            responseMessage = "Job Updated Successfully";
        } catch (e) {
            responseMessage = "Failed to update data";
        }



  } else {

  let logData = GenFunctions.getLogInput('C', req, liTempdata[0].CREATED_BY);

  
  for (let i = 0; i < liTempdata.length; i++) {
    lsresults.JOB_ID = liTempdata[i].JOB_ID;
    lsresults.SUBJOB_ID = liTempdata[i].SUBJOB_ID;
    lsresults.SEQUENCE_ID = liTempdata[i].SEQUENCE_ID;
    lsresults.SCHEDULE_ID = liTempdata[i].SCHEDULE_ID;
    lsresults.JOB_NAME = liTempdata[i].JOB_NAME;
    lsresults.TEMPLATE_ID = liTempdata[i].TEMPLATE_ID;
    lsresults.ACTIVITY_ID = liTempdata[i].ACTIVITY_ID;
    lsresults.PARAM_VALUE = JSON.stringify(liTempdata[i].PARAM_VALUE);
    lsresults.STEP = liTempdata[i].STEP;
    lsresults.STEP_NO = liTempdata[i].STEP_NO;
    lsresults.SET = liTempdata[i].SET;
    lsresults.SUB_STEP = liTempdata[i].SUBSTEP;
    lsresults.MANDATORY = liTempdata[i].MANDATORY;
    lsresults.MAIN_SET = liTempdata[i].MAIN_STEP;
    lsresults.TOTAL_STEPS = liTempdata[i].TOTAL_STEPS;
    lsresults.JOB_TYPE = liTempdata[i].JOB_TYPE;
    if(liTempdata[i].LEVEL === "" || liTempdata[i].LEVEL === undefined || liTempdata[i].LEVEL === null){
      liTempdata[i].LEVEL = "E"
    }
    lsresults.LEVEL = liTempdata[i].LEVEL;
    lsresults.RECURRENCE_VALUE = liTempdata[i].RECURRENCE_VALUE;
    lsresults.RECURRENCE_VALUE_FORMAT = liTempdata[i].RECURRENCE_VALUE_FORMAT;
    lsresults.JOB_STARTTIME = liTempdata[i].JOB_STARTTIME;
    lsresults.JOB_ENDTIME = liTempdata[i].JOB_ENDTIME;
    lsresults.SCH_STARTTIME = liTempdata[i].SCH_STARTTIME;
    lsresults.SCH_ENDTIME = liTempdata[i].SCH_ENDTIME;
    lsresults.ACTIVE = true;
    lsresults.CREATED_DATE = logData.CREATED_DATE;
    lsresults.CREATED_BY = logData.CREATED_BY;
    lsresults.CREATED_TIME = logData.CREATED_TIME;

    liJobData.push(lsresults);
    lsresults = {};
  }


  if (liJobData.length > 0) {
    try {
      if(req.data.Flag === "X"){
        await cds.run( `DELETE FROM "JS_JOB_TEMPLATEDETAILS" 
                          WHERE "JOB_NAME" = '${liJobData[0].JOB_NAME}' `);
      }
      await cds.run(INSERT.into("JS_JOB_TEMPLATEDETAILS").entries(liJobData));
      responseMessage = "Job data saved successfully";
    } catch (e) {
            //DONOTHING
      responseMessage = "Job data failed to save";
    }
  }


} 
  return responseMessage;
});
srv.on("updateJobData",async req => {
  let liJobData = [];
  let liTempdata = {};
  let lsresults = {};

  let status = true;

  if(req.data.ACTIVE === 'false'){
    status = false;
  }

  // liTempdata = JSON.parse(req.data.JobData);


  if(req.data.JOB_ID !== undefined){
    try {
        await UPDATE`JS_JOB_TEMPLATEDETAILS`
            .with({
              ACTIVE: status
            })
            .where(`JOB_ID = '${req.data.JOB_ID}'`);

    responseMessage = "Job Status changed";
    } catch (e) {
        responseMessage = "Failed to update job status";
    }
}

return responseMessage;

});

srv.on("deleteJobData",async req => {
  let liJobData = [];
  let liTempdata = {};
  let lsresults = {};

  if(req.data.JOB_ID !== undefined){
    try {
      await cds.run( `DELETE FROM "JS_JOB_TEMPLATEDETAILS" 
                      WHERE "JOB_ID" = '${req.data.JOB_ID}'
                        AND "JOB_NAME" = '${req.data.JOB_NAME}' `);
         responseMessage = "Job deleted";
    } catch (e) {
      daFlag = "";
      responseMessage = "Failed to delete job";
    }
}

return responseMessage;

});



srv.on("deleteVariant",async req => {
  var responseMessage ='Variant Deleted';
  if(req.data.VARIANT_NAME !== undefined){
    try {
      await cds.run( `DELETE FROM "JS_TEMPLATE_HEADER" 
                      WHERE "VARIANT_NAME" = '${req.data.VARIANT_NAME}' `);
         
    } catch (e) {
      daFlag = "";
      responseMessage = "Failed to delete Variant";
    }

    try {
      await cds.run( `DELETE FROM "JS_TEMPLATE_ACTITEM" 
                      WHERE "VARIANT_NAME" = '${req.data.VARIANT_NAME}' `);
         
    } catch (e) {
      daFlag = "";
      responseMessage = "Failed to delete Variant";
    }

    try {
      await cds.run( `DELETE FROM "JS_TEMPLATE_ACTITEM_PARAM" 
                      WHERE "VARIANT_NAME" = '${req.data.VARIANT_NAME}' `);
        
    } catch (e) {
      daFlag = "";
      responseMessage = "Failed to delete Variant";
    }

    try {
      await cds.run( `DELETE FROM "JS_JOB_CREATIONDATA" 
                      WHERE "SEQUENCE_ID" = '${req.data.VARIANT_NAME}' `);
         
    } catch (e) {
      daFlag = "";
      responseMessage = "Failed to delete Variant";
    }
}

return responseMessage;

});

//Service to get oAuth2.0 Bearer token
srv.on("getAuthorization", async ()=>{
  let auth = await GenFunctions.getAuthorization();
  return auth;
});


srv.on("genVariantData", async (req) => {

  let flag = req.data.FLAG;
  let varData = JSON.parse(req.data.VARIANT_DATA);
  let responseMessage = '';


  if(flag == 'E'){

    let cqnQuery = { UPSERT: { into: { ref: ['JS_VARIANT_ITEMS'] }, entries: varData } };
            try {
              await cds.run(
                          `DELETE FROM "JS_VARIANT_ITEMS"
                                WHERE "VARIANT_NAME" = '${varData[0].VARIANT_NAME}'
                                              `);
                await cds.run(cqnQuery);
                responseMessage = "Successfully updated the variant data";
            }
            catch (exception) {
                error = true;
                console.log("Query exception ", cqnQuery);
                responseMessage = exception.toString();
            }

  } else if(flag == 'D'){
     try {
                        await cds.run(
                          `DELETE FROM "JS_VARIANT_ITEMS"
                                WHERE "VARIANT_NAME" = '${varData[0].VARIANT_NAME}'
                                              `);
                                              responseMessage = "Variant deleted successfully";
            }
            catch (e) {
                responseMessage = "Variant failed to delete";
            }
  } else {
        try {
                await cds.run(INSERT.into("JS_VARIANT_ITEMS").entries(varData));
                
                responseMessage = "Variant created successfully";
            }
            catch (e) {
                responseMessage = "Variant Creation failed";
            }
  }

  return responseMessage;


});
}













