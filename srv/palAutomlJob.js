const hana = require('@sap/hana-client');
const cds = require('@sap/cds');

const dbHostPort = process.argv[2];
const procedure = process.argv[3];
const execId = process.argv[4];
const classicalSchema = process.argv[5];
const modelGroupId = process.argv[6];
const automlType = process.argv[7];
const automlModelVersion = process.argv[8];
const userId = process.argv[9];
const passwd = process.argv[10];
// const containerSchema = process.argv[9];


// DISABLES THIS FOR RUNNING ON BAS
const connParams = {
    serverNode  : dbHostPort, 
    uid         : userId, 
    pwd         : passwd,
    encrypt: 'TRUE',
    sslValidateCertificate: false

};

console.log("procedure ", procedure);
console.log("dbHostPort ", dbHostPort);
console.log("classicalSchema ", classicalSchema);
console.log("execId ", execId);


// ENABLE THIS FOR BAS 
// const connParams = {
//   serverNode  : dbHostPort,
//   uid         : "SBPTECHTEAM", 
//   pwd         : "Sbpcorp@23",
//   encrypt: 'TRUE',
//   sslValidateCertificate: false
// };
console.log("connParams ", connParams);


// const connParams = {
//     serverNode  : cds.env.requires.db.credentials.host + ":" + cds.env.requires.db.credentials.port,
//     uid         : "SBPTECHTEAM", 
//     pwd         : "Sbpcorp@23",
//     encrypt: 'TRUE'
// };

  const client = hana.createConnection();
  client.connect(connParams);
  var sqlStr = 'SET SCHEMA ' + classicalSchema;  
  // // console.log('sqlStr: ', sqlStr);            
  var stmt=client.prepare(sqlStr);
  stmt.exec();
  stmt.drop();



  client.exec(procedure,  function (err, execId) 
  {
    if (err) 
    {
      console.error(`Error executing PAL_WRAPPER_ASYNC:`, err);
    } else 
    {
      console.log(`PAL job executed for EXEC_ID: ${execId}`);

      sqlStr =  'SELECT * FROM PAL_AUTOML_MODEL_GRP_TAB WHERE GROUP_ID = ' + "'" + modelGroupId + "'";

      stmt=client.prepare(sqlStr);
      let modelResults = stmt.exec();
      stmt.drop();
 
      if (modelResults.length > 0)
      {
        var modelsObj = [];

        for (let i=0; i< modelResults.length; i++)
        {     
            let groupId = modelResults[i].GROUP_ID;
            let rowIndex = modelResults[i].ROW_INDEX;
            let modelContent = modelResults[i].MODEL_CONTENT;
            modelsObj.push({groupId,rowIndex,modelContent});

        }

        console.log('AUTOML _runRegressionAutomlGroup ',new Date());
        // console.log('AUTOML _runRegressionAutomlGroup modelsObj',modelsObj);


        var pipelineObj = [];

        sqlStr =  'SELECT * FROM PAL_AUTOML_PIPELINES_GRP_TAB WHERE GROUP_ID = ' + "'" + modelGroupId + "'";

        stmt=client.prepare(sqlStr);
        let pipelineResults = stmt.exec();
        stmt.drop();

        for (let i=0; i< pipelineResults.length; i++)
        {     
            let groupId = pipelineResults[i].GROUP_ID;
            let id = pipelineResults[i].ID;
            let pipeline = pipelineResults[i].PIPELINE;
            let scores = pipelineResults[i].SCORES;
            pipelineObj.push({groupId,id,pipeline,scores});
        }

        console.log('AUTOML _runRegressionAutomlGroup ',new Date());
        console.log('AUTOML _runRegressionAutomlGroup pipelineObj',pipelineObj);

        var statisticsObj = [];

        sqlStr =  'SELECT * FROM PAL_AUTOML_STATS_GRP_TAB WHERE GROUP_ID = ' + "'" + modelGroupId + "'";
        console.log("AUTOML modelGroupId ", modelGroupId, "sqlStr ", sqlStr);

        stmt=client.prepare(sqlStr);
        let statResults = stmt.exec();
        stmt.drop();

        for (let i=0; i< statResults.length; i++)
        {     
            let groupId = statResults[i].GROUP_ID;
            let statName = statResults[i].STAT_NAME;
            let statValue = statResults[i].STAT_VALUE;
            statisticsObj.push({groupId,statName,statValue});
        }

        console.log('AUTOML _runRegressionAutomlGroup ',new Date());
        console.log('AUTOML _runRegressionAutomlGroup statisticsObj',statisticsObj);

        var createtAtObj = new Date();

        inGroups = [];
        inGroup = modelGroupId;
        inGroups.push(inGroup);
        
        let obj_dep;
        let obj_counter;         
          
            
        let grpStr=modelGroupId.split('#');
        let profileID = grpStr[0]; 
        let type = grpStr[1];
        let GroupId = grpStr[2];
        // get location from grpStr
        let loc_start_index = profileID.length + 1 + type.length + 1 + GroupId.length + 1;
        let loc_length = 4;
        let location = inGroups[0].substr(loc_start_index, loc_length);
        // let location = grpStr[3];
        // product start index = location end Index + 1(For 0 based index) + 1 (for Hash)
        let product_start_index = loc_start_index + loc_length + 1;
        let product = inGroups[0].substr(product_start_index);
        // let product = grpStr[4];
        console.log("grpStr ", grpStr);
        console.log("profileId", profileID, "type ", type, "GroupId", GroupId, "location ", location, "product", product);

        let objStr = GroupId;

        let lastIndex = objStr.lastIndexOf('_');
        obj_dep = objStr.slice(0, lastIndex);

        obj_counter = objStr.slice(lastIndex + 1);

        sqlStr = 'UPSERT "CP_OD_MODEL_VERSIONS" VALUES (' +
                    "'" + location + "'" + "," +
                    "'" + product + "'" + "," +
                    "'" + obj_dep + "'" + "," +
                    "'" + obj_counter + "'" + "," +
                    "'" + type + "'" + "," +
                    "'" + 'AUTOML' + "'" + "," +
                    "'" + automlModelVersion + "'" + "," +
                    "'" + profileID  + "'" +  "," +
                    "'" + automlType +  "'" + "," +
                    "'" + createtAtObj.toISOString() + "'" + ')' + ' WITH PRIMARY KEY';
          cds.connect.to('db')
          .then(() => {
            // Step 1: Connected to the database
            console.log('Connected to the database');
            return cds.run(sqlStr);
          })
          .then(results => {
            // Step 2: Handle query result
            console.log('Fetched results:', results);

            /********* Begin of Disable this part to View Input Data & Profile parameters */
            // DELETE INPUT DATA & PARAMETERS AFTER MODEL GENERATION
            const groupId = modelGroupId;
    
            // Validate input early
            if (automlType < 1 || automlType > 30) {
                return req.error(400, `Invalid automlType: ${automlType}`);
            }
    
            // Construct table name dynamically
            const tableName = `PAL_AUTOML_FIT_DATA_GRP_TAB_${automlType}T`;
            console.log("AUTOML tableName ", tableName, "groupId ", groupId);
    
            try {
               
                // Delete from dynamic table
                let stmt = client.prepare(
                    `DELETE FROM ${tableName} WHERE GROUP_ID = ?`
                );
                stmt.exec([groupId]);
                stmt.drop();
    
    
                // Delete from parameter table
                stmt = client.prepare(
                    `DELETE FROM PAL_AUTOML_PARAMETER_GRP_TAB WHERE GROUP_ID = ?`
                );
                stmt.exec([groupId]);
                stmt.drop();
    
            } catch (err) {
                console.error("DB Error:", err);
                req.error(500, err.message);
            } finally {
                client.disconnect(); // IMPORTANT
            }
            
        /********* End of Disable this part to View Data & Profile parameters */
            
            client.disconnect();
            console.log("Closed DB connection & Exiting Child Process ");
        
            process.exit(0);
          })
          .catch(error => {
            // Step 3: Handle any errors from connection or query
            console.error('An error occurred:', error);
            client.disconnect();
            console.log("Closed DB connection & Exiting Child Process ");
          });
      }

    }

  });