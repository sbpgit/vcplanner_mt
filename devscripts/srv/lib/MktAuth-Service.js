const JobSchedulerClient = require("@sap/jobs-client");
const xsenv = require("@sap/xsenv");
const { v1: uuidv1} = require('uuid')


const request = require('request');
const rp = require('request-promise')
const lbaseUrl = "https://sbpprovider-dev-config-products-srv.cfapps.us10.hana.ondemand.com"; 
const vcap_app = process.env.VCAP_APPLICATION;

function getBaseUrl()
{
    var tag = new RegExp('"application_uris"(.*)');
    var uri = vcap_app.match(tag);
    if (uri)
    {
        var tag1 = new RegExp('"(.*)');
        uri =uri[1].match(tag1);
        let application_uris = "";
        for (let index  = 0; index < uri[1].length; index++)
        {
            if( uri[1][index] != '"')
            {
                application_uris = application_uris + uri[1][index];
            }
            else
            {
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

module.exports = async function (srv) {

  srv.on ('updateMktAuth',    async req => {
     return (await _updateMktAuthorizations(req,false));
  })

  srv.on ('fupdateMktAuth',    async req => {
    return (await _updateMktAuthorizations(req,true));
  })


  async function _updateMktAuthorizations(req,isGet) {

    var reqData = "Request for UpdatMArket Authorizationss Queued Sucessfully";

    console.log("_updateJobs reqData : ", reqData);
    let createtAt = new Date();
    let id = uuidv1();
    let values = [];	
  
    values.push({id, createtAt, reqData});    

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

    let sqlStr = 'SELECT DISTINCT "ID", "TYPE", "SUBJECT", "APPLICABILITY" FROM "MKT_CONSTRAINTS" ORDER BY "ID" ASC'; 
    let results = await cds.run(sqlStr);
    // console.log("Constraint IDs's List ", results);

    // UPDATE FOR APPLICABILITY
    for (let ruleIndex = 0; ruleIndex < results.length; ruleIndex = ruleIndex+1)
    {
        console.log("ID = ", results[ruleIndex].ID, "TYPE = ", results[ruleIndex].TYPE);
        let applicability = results[ruleIndex].APPLICABILITY;
        if (applicability != null)
        {
            applicability = applicability.replace('(', '');
            applicability = applicability.replace(')', '');

            let match = applicability.match(/AND|OR/g);
            let str = applicability.split(/ OR | AND /);

            console.log("match = ", match, "str = ", str);

            for (let index = 0; index < str.length; index = index+1)
            {
                let chvalOp = "";
                let chOp = "";

                let char_charval = [];
                let row_id = index + 1;
                if(str[index].match(/!=/g))
                {
                    chvalOp = '!=';
                    char_charval = str[index].split(/!=/g)
                    if(match != null)
                    {
                        if (index < str.length -1)
                        {
                            chOp = match[index];
                        }
                        console.log("ROW = ", index+1, "Char = ",char_charval[0],"charval = ",char_charval[1],"chvalOp is ",'EQ',"chOp = ",match[index]);
                    }
                    else
                    {
                        chOp = '';
                        console.log("ROW = ", index+1, "Char = ",char_charval[0],"charval = ",char_charval[1],"chvalOp is ",'EQ');
                    }
                }
                else if(str[index].match(/=/g))
                {
                    chvalOp = '=';
                    char_charval = str[index].split(/=/g)
                    if(match != null)
                    {
                        if (index < str.length -1)
                        {
                            chOp = match[index];
                        }
                        console.log("ROW = ", index+1, "Char = ",char_charval[0],"charval = ",char_charval[1],"chvalOp is ",'EQ',"chOp = ",match[index]);
                    }
                    else
                    {
                        console.log("ROW = ", index+1, "Char = ",char_charval[0],"charval = ",char_charval[1],"chvalOp is ",'EQ');
                    }
                }
                

                char_charval[0] = char_charval[0].replace(/[']/g, '');
                char_charval[1] = char_charval[1].replace(/[']/g, '');
                console.log("char_charval[0] ",char_charval[0], "char_charval[1] ",char_charval[1]);
                sqlStr = 'UPSERT "MKT_APPLICABILITY_RULES" VALUES (' +
                            "'" + results[ruleIndex].ID + "'" + "," +
                            "'" + results[ruleIndex].TYPE + "'," +
                            "'" + char_charval[0]     + "'," + 
                            "'" + char_charval[1] + "'" + "," +
                            "'" + chvalOp + "'" + "," +
                            "'" + chOp  + "'" + "," +
                            row_id  + "," +
                            null  + "," +
                            null  + ')' + ' WITH PRIMARY KEY';

                            // null + " + null + "'" + ')' + ' WITH PRIMARY KEY';
        

                await cds.run(sqlStr);


            }
        }
    }

// UPDATE FOR SUBJECT

    for (let ruleIndex = 0; ruleIndex < results.length; ruleIndex = ruleIndex+1)
    {
        console.log("ID = ", results[ruleIndex].ID, "TYPE = ", results[ruleIndex].TYPE);
        let subject = results[ruleIndex].SUBJECT;
        subject = subject.replace('(', '');
        subject = subject.replace(')', '');

        let match = subject.match(/AND|OR/g);
        let str = subject.split(/ OR | AND /);

        console.log("match = ", match, "str = ", str);

        for (let index = 0; index < str.length; index = index+1)
        {
            let chvalOp = "";
            let chOp = "";

            let char_charval = [];
            let row_id = index + 1;
            if(str[index].match(/!=/g))
            {
                chvalOp = '!=';
                char_charval = str[index].split(/!=/g)
                if(match != null)
                {
                    if (index < str.length -1)
                    {
                        chOp = match[index];
                    }
                    console.log("ROW = ", index+1, "Char = ",char_charval[0],"charval = ",char_charval[1],"chvalOp is ",'NEQ',"chOp = ",match[index]);
                }
                else
                {
                    chOp = '';
                    console.log("ROW = ", index+1, "Char = ",char_charval[0],"charval = ",char_charval[1],"chvalOp is ",'NEQ');
                }
            }
            else if(str[index].match(/=/g))
            {
                chvalOp = '=';
                char_charval = str[index].split(/=/g)
                if(match != null)
                {
                    if (index < str.length -1)
                    {
                        chOp = match[index];
                    }
                    console.log("ROW = ", index+1, "Char = ",char_charval[0],"charval = ",char_charval[1],"chvalOp is ",'EQ',"chOp = ",match[index]);
                }
                else
                {
                    console.log("ROW = ", index+1, "Char = ",char_charval[0],"charval = ",char_charval[1],"chvalOp is ",'EQ');
                }
            }
            

            char_charval[0] = char_charval[0].replace(/[']/g, '');
            char_charval[1] = char_charval[1].replace(/[']/g, '');
            console.log("char_charval[0] ",char_charval[0], "char_charval[1] ",char_charval[1]);
            sqlStr = 'UPSERT "MKT_INFERRED_RULES" VALUES (' +
                        "'" + results[ruleIndex].ID + "'" + "," +
                        "'" + results[ruleIndex].TYPE + "'," +
                        "'" + char_charval[0]     + "'," + 
                        "'" + char_charval[1] + "'" + "," +
                        "'" + chvalOp + "'" + "," +
                        "'" + chOp  + "'" + "," +
                        row_id  + "," +
                        null  + "," +
                        null  + ')' + ' WITH PRIMARY KEY';

                        // null + " + null + "'" + ')' + ' WITH PRIMARY KEY';
    

            await cds.run(sqlStr);


        }
    }


    let dataObj = {};
    dataObj["success"] = true;
    dataObj["message"] = "update MArket Authorizations Completed Successfully at " +  new Date();


    // if (req.headers['x-sap-job-id'] > 0)
    // {
    //     const scheduler = getJobscheduler(req);

    //     var updateReq = {
    //         jobId: req.headers['x-sap-job-id'],
    //         scheduleId: req.headers['x-sap-job-schedule-id'],
    //         runId: req.headers['x-sap-job-run-id'],
    //         data : dataObj
    //         };

    //         scheduler.updateJobRunLog(updateReq, function(err, result) {
    //         if (err) {
    //             return console.log('Error updating run log: %s', err);
    //         }

    //         });
    // }

  }

};
