const GenF = require("./gen-functions");

module.exports = (srv) => {

    //Authorization
    // srv.after('READ', 'getAssemblyData', async (data, req) => {
    //         let sUser = req.headers['x-user-id']
    //         if (sUser) {
    //             let aRolesData = await cds.run(`SELECT DISTINCT PARAMETER,VALUE FROM "CP_ROLE_DETAILS"
    //                 INNER JOIN "CP_ROLES" ON CP_ROLES.ROLE_NAME = CP_ROLE_DETAILS.ROLE_NAME AND CP_ROLES.ACTIVE = true
    //                 AND CP_ROLE_DETAILS.ROLE_NAME IN (SELECT DISTINCT ROLE_NAME FROM "CP_USER_ROLES"
    //             WHERE USER='${sUser}')`);
    //              if (aRolesData.length > 0) {

    //              const roleMap = aRolesData.reduce((acc, cur) => {
    //                 if (!acc[cur.PARAMETER]) acc[cur.PARAMETER] = [];
    //                 acc[cur.PARAMETER].push(cur.VALUE);
    //                 return acc;
    //              }, {});
                    
    //                //Full Access if any role contains '*'
    //                if (["LOCATION_ID","REF_PRODID","MATERIAL_TYPE","MRP_GROUP"]
    //                 .some(key => roleMap[key]?.includes("*"))) {
    //              return req.results = data;
    //             }
    //             let aLocProd = await cds.run(`SELECT DISTINCT FACTORY_LOC AS LOCATION_ID,PRODUCT_ID,MRP_GROUP FROM "V_FACTORYLOC" `);
    //             const aLocProdType = await cds.run(`SELECT * FROM V_LOC_CONFIG_PROD_TYPE`);
    //             const resultMap = {};

    //             const applyFilter = (paramKey, values, field, dataset) => {
    //              if (!values?.length) return;
    //                 const allowed = new Set(values);
    //                 const matched = dataset
    //                 .filter(row => allowed.has(row[field]))
    //                 .map(row => row.LOCATION_ID);
    //                 resultMap[paramKey] = new Set(matched);
    //             };

    //            applyFilter("LOCATION_ID", roleMap.LOCATION_ID, "LOCATION_ID", aLocProd);
    //            applyFilter("MRP_GROUP", roleMap.MRP_GROUP, "MRP_GROUP", aLocProd);
    //            applyFilter("MATERIAL_TYPE", roleMap.MATERIAL_TYPE, "PROD_TYPE", aLocProdType);
    //            applyFilter("REF_PRODID", roleMap.REF_PRODID, "PRODUCT_ID", aLocProd);

    //              let validSets = Object.values(resultMap);
    //             let finalSet = validSets.length
    //             ? validSets.reduce((a, b) => new Set([...a].filter(x => b.has(x))))
    //             : null;

    //         req.results = data.filter(item =>
    //             !finalSet ? true : finalSet.has(item.LOCATION_ID)
    //      );

    //         }
    //             else{
    //                 req.results =[];
    //             }
    //         }
    //     })

 srv.on("getAssemblyLagfun", async (req) => {
        try {
            const { FACTORY_LOCATION, LOCATION, PRODUCT, START_MONTH, END_MONTH } = req.data;
            const query = `
            SELECT *
            FROM "CV_SNAPSHOT_LAG_ASMB"
            (
                placeholder."$$FACTORY_LOCATION$$" => '${FACTORY_LOCATION}',
                placeholder."$$LOCATION$$" => '${LOCATION}',
                placeholder."$$PRODUCT$$" => '${PRODUCT}',
                placeholder."$$START_MONTH$$" => '${START_MONTH}',
                placeholder."$$END_MONTH$$" => '${END_MONTH}'
            )
        `;
            const Data = await cds.run(query);
            return JSON.stringify(Data);

        } catch (e) {
            console.error("Full error:", e);
            console.error("Error stack:", e.stack);
            req.error(500, `Error fetching data: ${e.message}`);
        }
    })

 srv.on("getOptPercentLagFun", async (req) => {
        try {
            const { FACTORY_LOCATION, LOCATION, PRODUCT,START_MONTH, END_MONTH } = req.data;
            const query = `
            SELECT *
            FROM "CV_SNAPSHOT_LAG_OPT"
            (
                placeholder."$$FACTORY_LOCATION$$" => '${FACTORY_LOCATION}',
                placeholder."$$LOCATION$$" => '${LOCATION}',
                placeholder."$$PRODUCT$$" => '${PRODUCT}',
                placeholder."$$START_MONTH$$" => '${START_MONTH}',
                placeholder."$$END_MONTH$$" => '${END_MONTH}'
            )
        `;
            const Data = await cds.run(query);
            return JSON.stringify(Data);

        } catch (e) {
            console.error("Full error:", e);
            console.error("Error stack:", e.stack);
            req.error(500, `Error fetching data: ${e.message}`);
        }
    })  

    srv.on("getRestrictionLagFun", async (req) => {
        try {
            const { FACTORY_LOCATION, LOCATION, START_MONTH, END_MONTH } = req.data;
            const query = `
            SELECT *
            FROM "CV_SNAPSHOT_LAG_RTR"
            (
                placeholder."$$FACTORY_LOCATION$$" => '${FACTORY_LOCATION}',
                placeholder."$$LOCATION$$" => '${LOCATION}',
                placeholder."$$START_MONTH$$" => '${START_MONTH}',
                placeholder."$$END_MONTH$$" => '${END_MONTH}'
            )
        `;
            const Data = await cds.run(query);
            return JSON.stringify(Data);

        } catch (e) {
            console.error("Full error:", e);
            console.error("Error stack:", e.stack);
            req.error(500, `Error fetching data: ${e.message}`);
        }
    }) 

    srv.on("getPrdDmdLagFun", async (req) => {
        try {
            const { FACTORY_LOCATION, LOCATION, PRODUCT, START_MONTH,END_MONTH } = req.data;
            const query = `
            SELECT *
            FROM "CV_SNAPSHOT_LAG_PROD_DMD"
            (
                placeholder."$$FACTORY_LOCATION$$" => '${FACTORY_LOCATION}',
                placeholder."$$LOCATION$$" => '${LOCATION}',                
                placeholder."$$PRODUCT$$" => '${PRODUCT}',
                placeholder."$$START_MONTH$$" => '${START_MONTH}',
                 placeholder."$$END_MONTH$$" => '${END_MONTH}'
            )
        `;
            const Data = await cds.run(query);
            return JSON.stringify(Data);

        } catch (e) {
            console.error("Full error:", e);
            console.error("Error stack:", e.stack);
            req.error(500, `Error fetching data: ${e.message}`);
        }
    }) 

     srv.on("getStatForecast", async (req) => {
        try {
            const { FACTORY_LOCATION, LOCATION, PRODUCT, START_MONTH,END_MONTH } = req.data;
            const query = `
            SELECT *
            FROM "CV_LAG_STAT_FORECAST"
            (
                placeholder."$$FACTORY_LOCATION$$" => '${FACTORY_LOCATION}',
                placeholder."$$LOCATION$$" => '${LOCATION}',                
                placeholder."$$PRODUCT$$" => '${PRODUCT}',
                placeholder."$$START_MONTH$$" => '${START_MONTH}',
                 placeholder."$$END_MONTH$$" => '${END_MONTH}'
            )
        `;
            const Data = await cds.run(query);
            return JSON.stringify(Data);

        } catch (e) {
            console.error("Full error:", e);
            console.error("Error stack:", e.stack);
            req.error(500, `Error fetching data: ${e.message}`);
        }
    }) 

     srv.on("createVariantPlanner", async req => {
            let lsResults = {};
            let liResults = {};
            let hResults = {};
            let headerResults = [];
            let finalResults = [];
            var responseMessage1;
            var Flag = req.data.Flag;
            // var User = req.headers["x-username"].toLowerCase();
            var User = req.data.USER.toLowerCase();
            lsResults = JSON.parse(req.data.VARDATA);
            var maxId = await cds.run(
                `SELECT Max(VARIANTID) as VALUE from CP_CREATEVARIANTHEADER`
            );
            if (maxId[0].VALUE === null) {
                maxId = 0;
            }
            else {
                maxId = maxId[0].VALUE
            }
            if (Flag === "X") {
                for (var i = 0; i < lsResults.length; i++) {
                    liResults.VARIANTID = maxId + 1;
                    liResults.FIELD = lsResults[i].Field;
                    liResults.FIELD_CENTER = lsResults[i].FieldCenter;
                    liResults.VALUE = lsResults[i].Value;
                    finalResults.push(liResults)
                    liResults = {};
                }
                hResults.VARIANTID = maxId + 1;
                hResults.VARIANTNAME = lsResults[0].IDNAME;
                hResults.USER = User;
                hResults.DEFAULT = lsResults[0].Default;
                hResults.APPLICATION_NAME = lsResults[0].App_Name;
                hResults.SCOPE = lsResults[0].SCOPE;
                headerResults.push(hResults);
                hResults = {};
    
                try {
                    await cds.run(INSERT.into("CP_CREATEVARIANTHEADER").entries(headerResults));
                    await cds.run(INSERT.into("CP_CREATEVARIANT").entries(finalResults));
                    responseMessage1 = "Created Successfully";
    
                } catch (e) {
                    responseMessage1 = "Creation Failed";
                }
            }
            else if (Flag === "D") {
                for (var j = 0; j < lsResults.length; j++) {
                    liResults.VARIANTID = lsResults[j].ID
                    finalResults.push(liResults);
                    try {
                        await cds.delete("CP_CREATEVARIANTHEADER", liResults);
                        await cds.delete("CP_CREATEVARIANT", liResults);
                        responseMessage1 = "Deletion successfull";
                    } catch (e) {
                        responseMessage1 = "Deletion Failed";
                        break;
    
                    }
                    finalResults = [];
                }
    
            }
            else if (Flag === "E") {
                liResults.VARIANTID = lsResults[0].ID
                try {
                    // await cds.delete("CP_CREATEVARIANTHEADER", liResults);
                    await cds.delete("CP_CREATEVARIANT", liResults);
                    responseMessage1 = "Deletion successfull";
                } catch (e) {
                    responseMessage1 = "Deletion Failed";
                }
                liResults = {};
                for (var i = 0; i < lsResults.length; i++) {
                    liResults.VARIANTID = lsResults[i].ID;
                    liResults.FIELD = lsResults[i].Field;
                    liResults.FIELD_CENTER = lsResults[i].FieldCenter;
                    liResults.VALUE = lsResults[i].Value;
                    finalResults.push(liResults)
                    liResults = {};
                }
                hResults.VARIANTID = lsResults[0].ID;
                hResults.VARIANTNAME = lsResults[0].IDNAME;
                hResults.USER = User;
                hResults.DEFAULT = lsResults[0].Default;
                hResults.APPLICATION_NAME = lsResults[0].App_Name;
                hResults.SCOPE = lsResults[0].SCOPE;
                headerResults.push(hResults);
                hResults = {};
    
                try {
                    // await cds.run(INSERT.into("CP_CREATEVARIANTHEADER").entries(headerResults));
                    await cds.run(INSERT.into("CP_CREATEVARIANT").entries(finalResults));
                    responseMessage1 = "Created Successfully";
    
                } catch (e) {
                    responseMessage1 = "Creation Failed";
                }   
    
    
            }
            else if (Flag === "N") {
                var ID = await cds.run(
                    `SELECT * from CP_CREATEVARIANTHEADER WHERE APPLICATION_NAME = '${lsResults[0].App_Name}' AND "USER" ='${User}' AND VARIANTNAME ='${lsResults[0].IDNAME}'`
                );
                if (ID.length > 0) {
                    liResults.VARIANTID = ID[0].VARIANTID
                    try {
                        await cds.delete("CP_CREATEVARIANTHEADER", liResults);
                        await cds.delete("CP_CREATEVARIANT", liResults);
                        responseMessage1 = "Deletion successfull";
                    } catch (e) {
                        responseMessage1 = "Deletion Failed";
                    }
                    liResults = {};
                    for (var i = 0; i < lsResults.length; i++) {
                        liResults.VARIANTID = ID[0].VARIANTID;
                        liResults.FIELD = lsResults[i].Field;
                        liResults.FIELD_CENTER = lsResults[i].FieldCenter;
                        liResults.VALUE = lsResults[i].Value;
                        finalResults.push(liResults)
                        liResults = {};
                    }
                    hResults.VARIANTID = ID[0].VARIANTID;
                    hResults.VARIANTNAME = lsResults[0].IDNAME;
                    hResults.USER = User;
                    hResults.DEFAULT = "N";
                    hResults.APPLICATION_NAME = lsResults[0].App_Name;
                    hResults.SCOPE = lsResults[0].SCOPE;
                    headerResults.push(hResults);
                    hResults = {};
    
                    try {
                        await cds.run(INSERT.into("CP_CREATEVARIANTHEADER").entries(headerResults));
                        await cds.run(INSERT.into("CP_CREATEVARIANT").entries(finalResults));
                        responseMessage1 = "Updated Successfully";
    
                    } catch (e) {
                        responseMessage1 = "Updation Failed";
                    }
                }
                else {
                    for (var i = 0; i < lsResults.length; i++) {
                        liResults.VARIANTID = maxId + 1;
                        liResults.FIELD = lsResults[i].Field;
                        liResults.FIELD_CENTER = lsResults[i].FieldCenter;
                        liResults.VALUE = lsResults[i].Value;
                        finalResults.push(liResults)
                        liResults = {};
                    }
                    hResults.VARIANTID = maxId + 1;
                    hResults.VARIANTNAME = lsResults[0].IDNAME;
                    hResults.USER = User;
                    hResults.DEFAULT = "N";
                    hResults.APPLICATION_NAME = lsResults[0].App_Name;
                    hResults.SCOPE = lsResults[0].SCOPE;
                    headerResults.push(hResults);
                    hResults = {};
    
                    try {
                        await cds.run(INSERT.into("CP_CREATEVARIANTHEADER").entries(headerResults));
                        await cds.run(INSERT.into("CP_CREATEVARIANT").entries(finalResults));
                        responseMessage1 = "Updated Successfully";
    
                    } catch (e) {
                        responseMessage1 = "Updation Failed";
                    }
                }
            }
          
            return JSON.stringify(headerResults);
        });
    
    
        srv.on("updateVariantPlanner", async req => {
            let lsResults = {};
            let liResults = [];
            var responseMessage;
            lsResults = JSON.parse(req.data.VARDATA);
            liResults.push(lsResults);
            if (liResults.length > 0) {
                try {
                    await UPDATE`CP_CREATEVARIANTHEADER`
                        .with({
                            DEFAULT: lsResults[0].DEFAULT
                        })
                        .where(`VARIANTID = '${lsResults[0].VARIANTID}'
                                                            AND VARIANTNAME = '${lsResults[0].VARIANTNAME}'`);
    
                    responseMessage = " Creation/Updation successful";
                } catch (e) {
                    responseMessage = " Creation failed";
                }
            }
    return responseMessage;
    
        });
}