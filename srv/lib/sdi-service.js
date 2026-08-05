const cds = require('@sap/cds');
const hana = require("@sap/hana-client");
const JobSchedulerClient = require("@sap/jobs-client");
const { v1: uuidv1 } = require('uuid')
const xsenv = require("@sap/xsenv");
const GenF = require("./gen-functions");
const Catservicefn = require("./catservice-function");
const SOFunctions = require("./so-function");
const MultiValueServices = require("./multivaluechar-service");
const oMVCharfn = new MultiValueServices();
const AsmbFunctions = require("./assembly-req");
const oAsmbReq = new AsmbFunctions();
const InitialProcess = require("./initial-process");


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

    const dbClass = require("sap-hdbext-promisfied");
    const hdbext = require("@sap/hdbext");
    srv.on("ImportECCProd", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Products";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
         var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_PRODUCTS_SP');
                const output = await dbConn.callProcedurePromisified(sp, [])
                console.log(output.results);
                flag = 'X';
            } catch (error) {
                 sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            // Update config prod
            const objSOFn = new SOFunctions();
            await objSOFn.genPartialProd();
            // Return to Job scheduler logs
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Product is successfull";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Product Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Product job update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue ";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Product job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Product job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Product has failed."+sError;


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Product job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Product job update results", result);

                });
            }
        }

    });
     srv.on("ImportECCLoc", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Location";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
        var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_LOCATION_SP')
                await dbConn.callProcedurePromisified(sp, [])
                flag = 'X';
            } catch (error) {
                sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Location is successfull.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Location Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Location job update results", result);

                });

                // Update Global Configuration for new locations
                const objCatFn = new Catservicefn();
                await objCatFn.updateGlobalConfigNewLoc(req);
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Location job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Location job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Location has failed."+sError;


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Location job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Location job update results", result);

                });
            }
        }

    });
      srv.on("ImportECCCustGrp", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Customer Group";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
        var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)));
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_CUSTOMERGROUP_SP');
                await dbConn.callProcedurePromisified(sp, [])
                flag = 'X';
            } catch (error) {
                 sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of CustomerGroup is successfull.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("CustomerGroup Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of CustomerGroup job update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of CustomerGroup job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of CustomerGroup job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of CustomerGroup has failed."+sError;


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of CustomerGroup job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of CustomerGroup job update results", result);

                });
            }
        }
    });
    srv.on("ImportECCBOM", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing BOM Header";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
        // Verify Multilevel - BOM Check         
        let sBOMConfig = await GenF.getSystemConfig('MULTILEVEL_CONFIGPRODUCT');  //('MULTIBOM');
         var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_BOMHEADER_SP')
                const sp2 = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_BOMOBJDEPENDENCY_SP')
                await dbConn.callProcedurePromisified(sp, []);
                await dbConn.callProcedurePromisified(sp2, []);
                // Multilevel BOM procedure execution
                let spBOM = '', outputBOM = '';
                spBOM = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_BOM_MAT_NEW_SP')
                outputBOM = await dbConn.callProcedurePromisified(spBOM, [])

                spBOM = '', outputBOM = '';
                spBOM = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_BOM_DEP_SP')
                outputBOM = await dbConn.callProcedurePromisified(spBOM, [])

                spBOM = '', outputBOM = '';
                spBOM = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_BOM_OD_NEW_SP')
                outputBOM = await dbConn.callProcedurePromisified(spBOM, [])

                spBOM = '', outputBOM = '';
                spBOM = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_BOM_OD_DEP_SP')
                outputBOM = await dbConn.callProcedurePromisified(spBOM, [])

                // Update Critical Comp Table
                // if (sBOMConfig === 'Yes') {
                //     spBOM = '', outputBOM = '';
                //     spBOM = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_CRITICALCOMP_SP')
                //     outputBOM = await dbConn.callProcedurePromisified(spBOM, [])
                // }


                // Generate Dummy Product for BOM under alternate locations
                const objCatFn = new Catservicefn();
                // await objCatFn.getDummyProd();
                await objCatFn.generateDummy();
                GenF.log("Generate Dummy Product is complete");

                await oMVCharfn.processBOMOD();

                // await objCatFn.mapBOMProductClass();
                flag = 'X';

            } catch (error) {
               sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {

            // Call Critial check
            const objSOFn = new SOFunctions();
            if (sBOMConfig === 'No') {
                await objSOFn.GenerateCritical(false);
                // await objSOFn.UpdateCriticalComp();
            }
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of BOM is successfull";


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
                    //Run log updated successfully
                    console.log("Import of BOM Header job update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue";


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
                    //Run log updated successfully
                    console.log("Import of BOM Header job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of BOM has failed."+sError;


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
                    //Run log updated successfully
                    console.log("Import of BOM Header job update results", result);

                });
            }
        }

    });
    srv.on("ImportECCODhdr", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Object dependencies";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
         var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_OBJDEP_HEADER_SP')
                const output = await dbConn.callProcedurePromisified(sp, [])
                console.log(output.results);
                // Process multivalue char in OD rules
                await oMVCharfn.processBOMOD();
                // Process BOM UID mapping
                // await oAsmbReq.genBOMUID(req);
                flag = 'X';
            } catch (error) {
                sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {

            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Obj. Dependency Header is successfull";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Obj. Dependency Header Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Obj. Dependency Header job update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue ";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Obj. Dependency Header job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Obj. Dependency Header job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Obj. Dependency Header has failed."+sError;


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Obj. Dependency Header job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Obj. Dependency Header job update results", result);

                });
            }
        }

    });
    srv.on("ImportECCProdClass", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Product Class";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
        var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_PRODUCTCLASS_SP')
                const output = await dbConn.callProcedurePromisified(sp, [])
                console.log(output.results);

                // Story VP - 1377 - To handle assembly requirements generation for non-configurable Products
                // -- Here we are updating the flag in CP_PRODUCT if any class is not assigned to a Product
                // Update Variant Rules with Only IFs and Only THENs
                const objCatFn = new Catservicefn();
                await objCatFn.updateNonConfigProduct(req);

                flag = 'X';
            } catch (error) {
                sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Product-class is successfull";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Product-class Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Product-class job update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue ";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Product-class job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Product-class job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Product-class has failed."+sError


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Product-class job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Product-class job update results", result);

                });
            }
        }

    });
    srv.on("ImportECCClass", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Class, Characteristics and Char. Values";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
        var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_CLASS_SP')
                const sp2 = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_CHARACTERISTICS_SP')
                const sp3 = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_CHAR_VALUES_SP')
                await dbConn.callProcedurePromisified(sp, []);
                await dbConn.callProcedurePromisified(sp2, []);
                await dbConn.callProcedurePromisified(sp3, []);
                // Generate Multivalues char in master data'
                await oMVCharfn.processCharandValues();
                flag = 'X';
            } catch (error) {
                sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Class is successfull";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Class Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Class job update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Class job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Class job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Class has failed."+sError;


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Class job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Class job update results", result);

                });
            }
        }


    });
     srv.on("ImportECCLocProd", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Location-Product";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
         var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_LOCATIONPROD_SP')
                await dbConn.callProcedurePromisified(sp, [])
                flag = 'X';
            } catch (error) {
                sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Location-Product is successfull.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Location-Product Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Location-Product job update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Location-Product job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Location-Product job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Location-Product has failed."+sError;

            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Location-Product job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Location-Product job update results", result);

                });
            }
        }
    });

    // srv.on("ImportECCSalesh", async (req) => {
    //     var flag = '';
    //     let location = req.data.LOCATION_ID;
    //     let product = req.data.PRODUCT_ID;
    //     let createtAt = new Date();
    //     let id = uuidv1();
    //     let values = [];
    //     let message = "Started importing Sales History and Configuration";
    //     let res = req._.req.res;
    //     values.push({ id, createtAt, message });
    //     res.statusCode = 202;
    //     res.send({ values });
    //     var returnFlag = await ConnectionCheck(req);
    //     if(returnFlag === "Y"){
    //     try {

    //         // Delete All sales History
    //         // const objCatFn = new Catservicefn();
    //         // await objCatFn.deleteSalesHistory('X');
            
    //         function findUnmatched(arr1, arr2) {
    //             let unmatched = [];
    //             let unmatchedSet = new Set();
    //             let existingSet = new Set(arr2.map(obj2 => 
    //                 `${obj2.SALES_DOC}-${obj2.SALESDOC_ITEM}-${obj2.CHAR_NUM}-${obj2.CHAR_VALUE}-${obj2.PRODUCT_ID}-${obj2.LOCATION_ID}`
    //             ));
                
    //             // Loop through arr1 and find records that are not in the Set
    //             arr1.forEach(obj1 => {
    //                 let key = `${obj1.SALES_DOC}-${obj1.SALESDOC_ITEM}-${obj1.CHAR_NUM}-${obj1.CHAR_VALUE}-${obj1.PRODUCT_ID}-${obj1.LOCATION_ID}`;
    //                 if (!existingSet.has(key)) {
    //                     var formattedDate = '0000-00-00';
    //                     if(obj1.PROD_AVAILABILITY_DT){
    //                         let dateStr = obj1.PROD_AVAILABILITY_DT;
    //                          formattedDate = (dateStr.slice(0, 4) + '-' + dateStr.slice(4, 6) + '-' + dateStr.slice(6));
    //                     }
    //                     if(obj1.PRODUCT_ID && obj1.LOCATION_ID){
    //                         // Create a unique key for unmatched items based on relevant fields
    //                         let unmatchedKey = `${obj1.PRODUCT_ID}-${obj1.LOCATION_ID}-${formattedDate}`;
                            
    //                         // Only add to unmatched if this key is not already in unmatchedSet
    //                         if (!unmatchedSet.has(unmatchedKey)) {
    //                             unmatchedSet.add(unmatchedKey); // Add unique key to the Set
    //                             unmatched.push({
    //                                 "PRODUCT_ID": obj1.PRODUCT_ID,
    //                                 "WEEK_DATE": (formattedDate != '0000-00-00') ? formattedDate : '1970-01-01',
    //                                 "LOCATION_ID": obj1.LOCATION_ID
    //                             });
    //                         }
    //                     }
    //                 }
    //             });
                
    //             return unmatched;
    //         }
            
    //         // let aVirtualTblData = await cds.run(`
    //         //     SELECT DISTINCT
    //         //       A."SALES_DOCUMENT" AS "SALES_DOC",
    //         //         A."SALES_DOCUMENT_ITEM" AS "SALESDOC_ITEM",
    //         //         A."CHARACTERSTIC_NUM" AS "CHAR_NUM",
    //         //         A."CHARACTERSTIC_VALUE" AS "CHAR_VALUE",
    //         //         A."PRODUCT_ID",
    //         //         B."LOCATION_ID", 
    //         //         B."PROD_AVAILABILITY_DT" 
    //         //     FROM "CONFIG_PRODUCTS::VT_SALESH_CONFIG_UPD" AS A
    //         //     LEFT OUTER JOIN "CONFIG_PRODUCTS::VT_SALESH_UPDN" AS B
    //         //     ON A.SALES_DOCUMENT = B.SALES_DOCUMENT
    //         //     AND A.SALES_DOCUMENT_ITEM = B.SALES_DOCUMENT_ITEM
    //         //     ORDER BY A."SALES_DOCUMENT", A."SALES_DOCUMENT_ITEM", A."CHARACTERSTIC_NUM", A."CHARACTERSTIC_VALUE", A."PRODUCT_ID", B."LOCATION_ID"
    //         // `);

            
    //         // let aExisting = await cds.run(`
    //         //     SELECT DISTINCT A."SALES_DOC", A."SALESDOC_ITEM", A."CHAR_NUM", A."CHAR_VALUE", B."PRODUCT_ID",B."LOCATION_ID" 
    //         //     FROM "CP_SALESH_CONFIG_MASTER" AS A
    //         //     LEFT OUTER JOIN "CP_SALESH" AS B
    //         //     ON A.SALES_DOC = B.SALES_DOC
    //         //     AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
    //         //     ORDER BY  A."SALES_DOC", A."SALESDOC_ITEM", A."CHAR_NUM", A."CHAR_VALUE", B."PRODUCT_ID",B."LOCATION_ID" 
    //         // `);
            
    //         // let unmatchedRecords = findUnmatched(aVirtualTblData, aExisting);
            
    //         // if (unmatchedRecords.length > 0) {
    //         //     //insert the data into table 
    //         //     await cds.run(`DELETE FROM "CP_SALESH_CONFIG_DELTA"`)
    //         //     await cds.run(INSERT.into("CP_SALESH_CONFIG_DELTA").entries(unmatchedRecords));
    //         // } else {
    //         //     console.log("All records match.");
    //         // }

    //         let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
    //         // const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_SALESH_SP')
    //         const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_SALESH_NEW_SP')
    //         const output = await dbConn.callProcedurePromisified(sp, [])
    //         const spcfg = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_SALESH_CONFIG_SP')
    //         const outputcfg = await dbConn.callProcedurePromisified(spcfg, [])
    //         console.log(output.results);
    //         console.log(outputcfg.results);
    //         //process sales config
    //         await oMVCharfn.processSalesConfig();
    //         flag = 'X';
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }
    //     if (flag === 'X') {
    //         // Update IBP Customer
    //         const objSOFn = new SOFunctions();
    //         await objSOFn.updateIBPCustomer();
    //         let dataObj = {};
    //         dataObj["success"] = true;
    //         dataObj["message"] = "Import of Sales History is successfull at " + new Date();


    //         if (req.headers['x-sap-job-id'] > 0) {
    //             const scheduler = getJobscheduler(req);

    //             var updateReq = {
    //                 jobId: req.headers['x-sap-job-id'],
    //                 scheduleId: req.headers['x-sap-job-schedule-id'],
    //                 runId: req.headers['x-sap-job-run-id'],
    //                 data: dataObj
    //             };

    //             console.log("Sales History Imported, to update req", updateReq);

    //             scheduler.updateJobRunLog(updateReq, function (err, result) {
    //                 if (err) {
    //                     return console.log('Error updating run log: %s', err);
    //                 }
    //                 //Run log updated successfully
    //                 console.log("Import of Sales History job update results", result);

    //             });
    //         }
    //     }
    //     else if(returnFlag ==="N"){
    //         let dataObj = {};
    //         dataObj["success"] = false;
    //         dataObj["message"] = "Service connectivity issue " + new Date();


    //         if (req.headers['x-sap-job-id'] > 0) {
    //             const scheduler = getJobscheduler(req);

    //             var updateReq = {
    //                 jobId: req.headers['x-sap-job-id'],
    //                 scheduleId: req.headers['x-sap-job-schedule-id'],
    //                 runId: req.headers['x-sap-job-run-id'],
    //                 data: dataObj
    //             };

    //             console.log("Import of Sales History job update req", updateReq);

    //             scheduler.updateJobRunLog(updateReq, function (err, result) {
    //                 if (err) {
    //                     return console.log('Error updating run log: %s', err);
    //                 }
    //                 //Run log updated successfully
    //                 console.log("Import of Sales History job update results", result);

    //             });
    //         }
    //     }
    //     else {
    //         let dataObj = {};
    //         dataObj["success"] = false;
    //         dataObj["message"] = "Import of Sales History has failed at" + new Date();


    //         if (req.headers['x-sap-job-id'] > 0) {
    //             const scheduler = getJobscheduler(req);

    //             var updateReq = {
    //                 jobId: req.headers['x-sap-job-id'],
    //                 scheduleId: req.headers['x-sap-job-schedule-id'],
    //                 runId: req.headers['x-sap-job-run-id'],
    //                 data: dataObj
    //             };

    //             console.log("Import of Sales History job update req", updateReq);

    //             scheduler.updateJobRunLog(updateReq, function (err, result) {
    //                 if (err) {
    //                     return console.log('Error updating run log: %s', err);
    //                 }
    //                 //Run log updated successfully
    //                 console.log("Import of Sales History job update results", result);

    //             });
    //         }
    //     }

    // });


    srv.on("ImportECCSalesh", async (req) => {
        var flag = '';
        let location = req.data.LOCATION_ID;
        let product = req.data.PRODUCT_ID;
        let fromdate = req.data.FROM_DATE;
        let todate = req.data.TO_DATE;
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Sales History and Configuration";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var returnFlag = await ConnectionCheck(req);
        var sError='';
        if(returnFlag === "Y"){
        try {

            // Delete All sales History
            // const objCatFn = new Catservicefn();
            // await objCatFn.deleteSalesHistory('X');
            

            // calling sales config data and creating Unique ID without saving sales config data.
            // getting config data from virtual table based on Location and Product adn dates filters.
            let WeekFrom = '';
            let WeekTo = '';

            if(fromdate !== '9999-12-31' || todate !== '9999-12-31'){
                WeekFrom = fromdate + " 00:00:00.000000000";
                WeekTo = todate + " 23:59:00.000000000";
            } else {
                let weeks = await cds.run(`SELECT VALUE FROM CP_PARAMETER_VALUES 
                                        WHERE LOCATION_ID = '${location}' and PARAMETER_ID = 4 `);

                    WeekFrom = new Date(new Date().setDate(new Date().getDate() - weeks*7)).toISOString().split('T')[0] + " 00:00:00.000000000";
                    WeekTo = new Date().toISOString().split('T')[0] + " 23:59:00.000000000";
                
            }
            let weeksData = await cds.run(` SELECT PERIODSTART, PERIODEND FROM CP_IBPCALENDER_WEEK 
                                                 WHERE  PERIODSTART >= (SELECT PERIODSTART FROM CP_IBPCALENDER_WEEK  WHERE PERIODSTART <= '${WeekFrom}' and PERIODEND >= '${WeekFrom}'  and LEVEL = 'W') and PERIODEND <= '${WeekTo}' and LEVEL = 'W' `)

            console.log("message", message);

            for(let d=0; d<weeksData.length; d++){
                let from = new Date(weeksData[d].PERIODSTART).getFullYear() +  String(new Date(weeksData[d].PERIODSTART).getMonth() + 1).padStart(2, '0')  +  String(new Date(weeksData[d].PERIODSTART).getDate()).padStart(2, '0') ;
                let to = new Date(weeksData[d].PERIODEND).getFullYear() +  String(new Date(weeksData[d].PERIODEND).getMonth() + 1).padStart(2, '0')  +  String(new Date(weeksData[d].PERIODEND).getDate()).padStart(2, '0') ;

                console.log("fromDate", from);
                console.log("toDate", to);
            let oSalesHeader = await cds.run(`SELECT * from "CONFIG_PRODUCTS::VT_SALESH_UPDT"
                                         WHERE LOCATION_ID = '${location}' and PRODUCT_ID = '${product}' and 
                                         PROD_AVAILABILITY_DT BETWEEN '${from}' AND '${to}'`);
           

            let oSalesconfigData =   await cds.run(`SELECT * from "CONFIG_PRODUCTS::VT_SALESH_CONFIG_UPDT"
                                         WHERE PRODUCT_ID = '${product}' and 
                                         PROD_AVAILABILITY_DT BETWEEN '${from}' AND '${to}'`);
            
            console.log("oSalesHeader", oSalesHeader.length);
            console.log("oSalesconfigData", oSalesconfigData.length);

            function dateConversion(filter,flag){
                let string = filter;
                let conDate = new Date(string.slice(0,4), parseInt(string.slice(4,6)) - 1,string.slice(6,8) )
                // let month = parseInt(string.slice(4,6)) - 1;
                // let conDate = string.slice(0,4) + "-" + month.toString()  + "-" + string.slice(6,8);
                conDate = conDate.toISOString();
                if(flag === 'D'){
                    conDate = conDate.split('T')[0];
                } else {
                    conDate = new Date().toISOString().split('T')[1].split('.')[0];
                }
                return conDate;
            }

            // Process sales config and create process data to generate Unique ID.
            for(let i=0; i<oSalesHeader.length; i++){

                let sSalesDocItem = GenF.addleadzeros(oSalesHeader[i].SALES_DOCUMENT_ITEM.toString(), 10);
                    
                          //Delete from CP_SALESH and CP_SALES_HM
                          await cds.run(`DELETE FROM "CP_SALESH" WHERE "SALES_DOC"='${oSalesHeader[i].SALES_DOCUMENT}' AND 
                            ("SALESDOC_ITEM"='${oSalesHeader[i].SALES_DOCUMENT_ITEM}' OR "SALESDOC_ITEM"='${sSalesDocItem}')`);
                          await cds.run(`DELETE FROM "CP_SALES_HM" WHERE "SALES_DOC"='${oSalesHeader[i].SALES_DOCUMENT}' AND 
                          ("SALESDOC_ITEM"='${oSalesHeader[i].SALES_DOCUMENT_ITEM}' OR "SALESDOC_ITEM"='${sSalesDocItem}')`);
                        
                          oSalesHeader[i].SALES_DOCUMENT_ITEM = sSalesDocItem;
                        oSalesHeader[i].SCHEDULE_LINE_NO = GenF.addleadzeros(oSalesHeader[i].SCHEDULE_LINE_NO.toString(), 4);
               
                const oHeader = {
                            SALES_DOC: oSalesHeader[i].SALES_DOCUMENT,
                            SALESDOC_ITEM: oSalesHeader[i].SALES_DOCUMENT_ITEM,
                            DOC_CREATEDDATE: (oSalesHeader[i].DOC_CREATED_DATE) ? dateConversion(oSalesHeader[i].DOC_CREATED_DATE, "D") : null,
                            SCHEDULELINE_NUM: oSalesHeader[i].SCHEDULE_LINE_NO.toString(),
                            PRODUCT_ID: oSalesHeader[i].PRODUCT_ID,
                            MATERIAL_VARIANT: oSalesHeader[i].MATERIAL_VARIANT,
                            REASON_REJ: oSalesHeader[i].REASON_4REJECTION,
                            UOM: oSalesHeader[i].UOM,
                            CONFIRMED_QTY: oSalesHeader[i].CONFIRMED_QTY,
                            ORD_QTY: oSalesHeader[i].QTY_UNITS,
                            MAT_AVAILDATE: (oSalesHeader[i].PROD_AVAILABILITY_DT) ? dateConversion(oSalesHeader[i].PROD_AVAILABILITY_DT, "D") : null,
                            NET_VALUE: oSalesHeader[i].NET_VALUE,
                            CUSTOMER_GROUP: oSalesHeader[i].CUSTOMER_GROUP,
                            LOCATION_ID: oSalesHeader[i].LOCATION_ID,
                            SEEDORD_CHK: null,
                            SALES_ORG: oSalesHeader[i].SALES_ORG,
                            DISTR_CHANNEL: oSalesHeader[i].DISTR_CHANNEL,
                            DIVISION: oSalesHeader[i].DIVISION,
                            SAL_DOCU_TYPE: oSalesHeader[i].SAL_DOCU_TYPE,
                            ITEM_CREATED_DATE: (oSalesHeader[i].ITEM_CREATED_DATE) ? dateConversion(oSalesHeader[i].ITEM_CREATED_DATE, "D") : null,
                            ITEM_CHANGE_DATE: (oSalesHeader[i].ITEM_CHANGE_DATE) ? dateConversion(oSalesHeader[i].ITEM_CHANGE_DATE, "D") : null,
                            OPEN_ORDER: oSalesHeader[i].OPEN_ORDER,
                            CHARG: oSalesHeader[i].CHARG,
                            IBP_CUSTOMER: oSalesHeader[i].IBP_CUSTOMER,
                            RELEVENT_FOR_PLAN: oSalesHeader[i].NOT_PLANNING,
                            ON_HAND_STOCK: oSalesHeader[i].ON_HAND_STOCK,
                            IN_TRANSIT: oSalesHeader[i].IN_TRANSIT,
                            SHIP_FROM_LOC: oSalesHeader[i].SHIP_FROM_LOC,
                            RESERVE_FIELD1: oSalesHeader[i].RESERVE_FIELD1,
                            RESERVE_FIELD2: oSalesHeader[i].RESERVE_FIELD2,
                            RESERVE_FIELD3: oSalesHeader[i].RESERVE_FIELD3,
                            STOCK_LOC: null,
                            TRANS_TO_LOC: null,
                            TRANS_FROM_LOC: null,
                            CHANGED_DATE: (oSalesHeader[i].CHANGED_DATE) ? dateConversion(oSalesHeader[i].CHANGED_DATE,"D") : null ,
                            CHANGED_BY: oSalesHeader[i].CHANGED_BY ,
                            CREATED_DATE: (oSalesHeader[i].CREATED_DATE) ? dateConversion(oSalesHeader[i].CREATED_DATE, "D") : null ,
                            CREATED_BY: oSalesHeader[i].CREATED_BY,
                            CHANGED_TIME: (oSalesHeader[i].CHANGED_TIME) ? dateConversion(oSalesHeader[i].CHANGED_TIME, "T") : null ,
                            CREATED_TIME: (oSalesHeader[i].CREATED_TIME) ? dateConversion(oSalesHeader[i].CREATED_TIME, "T") : null ,
                            DELETE_FLAG: oSalesHeader[i].DELETE_FLAG
                        }


                        let fHeader = [];
                        fHeader.push(oHeader);
                        let cqnQuery = {UPSERT:{ into: { ref: ['CP_SALESH'] }, entries:  fHeader }};
                    try {
                        await cds.run(cqnQuery);
                        let liSalesData = oSalesconfigData.filter(el=> el.SALES_DOCUMENT === oSalesHeader[i].SALES_DOCUMENT &&
                            el.SALES_DOCUMENT_ITEM == oSalesHeader[i].SALES_DOCUMENT_ITEM);

                        console.log("liSalesData", liSalesData.length);                                                                     
                        const objInitProcs = new InitialProcess();
                // let matDate = oHeader.MAT_AVAILDATE.getFullYear() + "-" + String(oHeader.MAT_AVAILDATE.getMonth() + 1).padStart(2, '0')  + "-" + String(oHeader.MAT_AVAILDATE.getDate()).padStart(2, '0');
                        await objInitProcs.processSalesDelta(oSalesHeader[i], liSalesData, oHeader.MAT_AVAILDATE,req);
                        console.log("Unique ID generation completed", new Date(), oSalesHeader[i]);
                    }
                    catch (exception) {
                        error = true;
                        // console.log("tableObj ", tableObj);
                        // console.log("Query exception ", cqnQuery);
                        // throw new Error(exception.toString());
                        responseMessage = exception.toString();
                        console.log(responseMessage);
                        sError += exception.message;
                        return responseMessage;
                    }
                        // await cds.run(INSERT.into("CP_SALESH").entries(oHeader));

                       

            }
        }

            //process sales config
            // await oMVCharfn.processSalesConfig();
            flag = 'X';
       
        } catch (error) {
            console.error(error);
        }
    }

    console.log("Import of Sales History and generation of UID completed", new Date());
        if (flag === 'X') {
            // Update IBP Customer
            const objSOFn = new SOFunctions();
            await objSOFn.updateIBPCustomer();
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Sales History is successfull";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Sales History Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Sales History job update results", result);

                });
            }
        }
        else if(returnFlag ==="N"){
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue ";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Sales History job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Sales History job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Sales History has failed.Reason: "+sError;


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Sales History job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Sales History job update results", result);

                });
            }
        }

    });

    
   srv.on("ImportECCAsmbcomp", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Assembly -Components";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
         var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_ASMBCOMP_SP')
                await dbConn.callProcedurePromisified(sp, [])
                flag = 'X';
            } catch (error) {
               sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {

            //Patch to remove configurable assemblies in CP_ASSEMBLY_COMP after sdi import
            var aConfigAssemblies = await cds.run(`SELECT DISTINCT LOCATION_ID,ASSEMBLY,COMPONENT FROM "CP_ASSEMBLY_COMP"
            WHERE ASSEMBLY  IN (SELECT DISTINCT MAT_CHILD FROM CP_BOM_MAT WHERE CONFIGURABLE = 'X')`);
            if (aConfigAssemblies.length > 0) {
                for (var i = 0; i < aConfigAssemblies.length; i++) {
                    let el = aConfigAssemblies[i];
                    await cds.run(`DELETE FROM "CP_ASSEMBLY_COMP" WHERE LOCATION_ID='${el.LOCATION_ID}'
                    AND ASSEMBLY='${el.ASSEMBLY}' AND COMPONENT='${el.COMPONENT}'`)
                }
            }
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Assembly components is successfull.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Assembly components Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Assembly components job update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Assembly components job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Assembly components job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Assembly components has failed."+sError;


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Assembly components job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Assembly components job update results", result);

                });
            }
        }

    });
    srv.on("ImportDeriveChar", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Derived Characteristics";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
         var sError='';
        if (returnFlag === "Y") {
            try {
                //New
               let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp1 = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_DERIVED_CHAR_CONFIG_PRF_SP');
               await dbConn.callProcedurePromisified(sp1, []);

                //Old
            //     let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
            //     const sp3 = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_DERIVECHAR_SP');
            //    await dbConn.callProcedurePromisified(sp3, []);
            //     //call multivalue char for variant rules
            //     await oMVCharfn.processVariantRules();
                // const sp = await dbConn.loadProcedurePromisified(null, '"FG_CUVTAB_IND_SP"');
                // const sp2 = await dbConn.loadProcedurePromisified(null, '"FG_CUVTAB_VALC_SP"');
                // const output = await dbConn.callProcedurePromisified(sp, []);
                // const output2 = await dbConn.callProcedurePromisified(sp2, []);
                // console.log(output.results);
                flag = 'X';
            } catch (error) {
                  sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Derived Characteristics is successfull.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Derived Characteristics imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Derived Characteristics job update results", result);

                });
            }
            // Update Variant Rules with Only IFs and Only THENs
            // const objCatFn = new Catservicefn();
            // await objCatFn.modifyVariantRules(req);
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Derived Characteristics job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Derived Characteristics job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Derived Characteristics has failed."+sError;


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Derived Characteristics job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Derived Characteristics job update results", result);

                });
            }
        }

    });
     srv.on("ImportCIRLog", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Forecast Demand Logs";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
        var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_LOGCIR_SP');
                 await dbConn.callProcedurePromisified(sp, []);
                flag = 'X';
            } catch (error) {
                  sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Forecast Demand Logs is successfull.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("CIR Logs imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("CIR Logs update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("CIR Logs job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("CIR Logs job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Forecast Demand Logs has failed."+sError;


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("CIR Logs job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("CIR Logs job update results", result);

                });
            }
        }

    });

    srv.on("ImportPartialProd", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let ManualData =[];
        let message = "Started importing Parital Products and Configurations";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
// Added for manually created partial products//
        //  ManualData = await cds.run(`SELECT * FROM "CP_PARTIALPROD_INTRO" 
        //                                 WHERE "CP_PARTIALPROD_INTRO"."MANUAL" = 'X' `);
        // console.log("ManualData Length", ManualData.length);
        var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_PARTIALPROD_SP');
                // const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_PARTIALPROD_TEST_SP');
                const sp2 = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_PARTIALPRODCFG_SP');
                await dbConn.callProcedurePromisified(sp, []);
                await dbConn.callProcedurePromisified(sp2, []);
                await oMVCharfn.processPartialProd();
                flag = 'X';
            } catch (error) {
                 sError ='Reason: ' +error.message;
            }
        }
        const objSOFn = new SOFunctions();
        await objSOFn.genPartialProd();

        
        if (flag === 'X') {
            // Update config prod
            // const objSOFn = new SOFunctions();
            // await objSOFn.genPartialProd();
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Partial Products is successfull";
            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);
                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };
    // Added for manually created partial products//
                // console.log("Manual data", ManualData.length);
                // if (ManualData.length > 0) {
                //     console.log("Manual flag data", ManualData)
                //     let cqnQuery = {UPSERT:{ into: { ref: ['CP_PARTIALPROD_INTRO'] }, entries:  ManualData }};
                //     try {
                //         await cds.run(cqnQuery);
                //         console.log("Manual data insertion Successful");
                //     }
                //     catch (ex) {
                //         console.log("Manual data insertion failed");
                //         console.log(ex);
                //     }
                // }
                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Partial Products job update results", result);
                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue ";
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
                    //Run log updated successfully
                    console.log("Partial Products job update results", result);
                });
            }
        }
        else {

            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Partial Products has failed."+sError;
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
                    //Run log updated successfully
                    console.log("Partial Products job update results", result);
                });
            }
        }
    });
    srv.on("ImportPVSNode", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing PVS Node structure";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
         var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_PVSNODE_SP');
                const sp1 = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_PRODACCESSNODE_SP');
                const sp2 = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_PVSBOM_SP');
                await dbConn.callProcedurePromisified(sp, [])
                await dbConn.callProcedurePromisified(sp1, [])
                await dbConn.callProcedurePromisified(sp2, [])
                flag = 'X';
            } catch (error) {
               sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            await GenF.jobSchMessage('X', "Import of PVS node structure is successfull.", req);
        }
        else if (returnFlag === "N") {
            await GenF.jobSchMessage('', "Service connectivity issue.", req);
        }
        else {
            await GenF.jobSchMessage('', "Import of PVS node structure has failed."+sError, req);
        }

    });
    srv.on("ImportPVSBOM", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing PVS-BOM";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp1 = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_PRODACCESSNODE_SP');
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_PVSBOM_SP');
                const output1 = await dbConn.callProcedurePromisified(sp1, [])
                const output = await dbConn.callProcedurePromisified(sp, [])
                console.log(output.results);
                flag = 'X';
            } catch (error) {
                console.error(error);
            }
        }
        if (flag === 'X') {
            await GenF.jobSchMessage('X', "Import of PVS-BOM is successfull ", req);
        }
        else if (returnFlag === "N") {
            await GenF.jobSchMessage('', "Service connectivity issue ", req);
        }
        else {
            await GenF.jobSchMessage('', "Import of PVS-BOM has failed", req);
        }
    });
    srv.on("ImportSOStock", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Salesorder Stock";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
        var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_IBPSTOCK_SP');
                await dbConn.callProcedurePromisified(sp, [])
                flag = 'X';
            } catch (error) {
               sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            await GenF.jobSchMessage('X', "Import of Salesorder Stock is successfull.", req);
        }
        else if (returnFlag === "N") {
            await GenF.jobSchMessage('', "Service connectivity issue.", req);
        }
        else {
            await GenF.jobSchMessage('', "Import of Salesorder Stock has failed."+sError, req);
        }
    });

    srv.on("ImportECCCharValueNum", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing CharVal-CharValueNum";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
         var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_CHARVAL_VALNUM_SP')
                await dbConn.callProcedurePromisified(sp, [])
                flag = 'X';
            } catch (error) {
                sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of CharVal-CharValueNum is successfull.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("CharVal-CharValueNum Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of CharVal-CharValueNum job update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of CharVal-CharValueNum job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of CharVal-CharValueNum job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of CharVal-CharValueNum has failed."+sError;


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of CharVal-CharValueNum job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of CharVal-CharValueNum job update results", result);

                });
            }
        }

    });

    srv.on("ImportECCProdOrdQnty", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started imorting Production Orders Quantity";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
        var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)));
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_PRDORD_CONSUMPTN_SP');
                 await dbConn.callProcedurePromisified(sp, [])
                flag = 'X';
            } catch (error) {
                sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Production Order Component Quantity is successfull.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Production Order Component Quantity Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Production Order Component Quantity job update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Production Order Component Quantity job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Production Order Component Quantity job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Production Order Component Quantity has failed."+sError;

            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Production Order Component Quantity job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Production Order Component Quantity job update results", result);

                });
            }
        }
    });



    srv.on("ImportVariantTables", async (req) => {
        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started importing Variant tables";
        let res = req._.req.res;
        values.push({ id, createtAt, message });
        res.statusCode = 202;
        res.send({ values });
        var flag = '';
        var returnFlag = await ConnectionCheck(req);
        var sError='';
        if (returnFlag === "Y") {
            try {
                let dbConn = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
                const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_VAR_HDR_SP')
                const sp2 = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_VAR_DEF_SP')
                const sp3 = await dbConn.loadProcedurePromisified(hdbext, null, 'FG_VAR_CONTNT_SP')
                await dbConn.callProcedurePromisified(sp, [])
                await dbConn.callProcedurePromisified(sp2, [])
                await dbConn.callProcedurePromisified(sp3, [])
                
                let aTables = await cds.run(`SELECT * FROM "CP_VAR_CONTNT"`);
                if(aTables.length>0){
                    // aTables.forEach(el=>{
                    //      if(isNaN(el.CHARACTERISTIC_VALUE) == false){//If numeric type,remove 0 after decimals
                    // el.CHARACTERISTIC_VALUE =  el.CHARACTERISTIC_VALUE.trim().replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
                    // }
                    // })
                    await cds.run('DELETE FROM "CP_VAR_CONTNT"');
                     await cds.run(INSERT.into("CP_VAR_CONTNT").entries(aTables));
                }
                flag = 'X';
            } catch (error) {
                sError ='Reason: ' +error.message;
            }
        }
        if (flag === 'X') {
            let dataObj = {};
            dataObj["success"] = true;
            dataObj["message"] = "Import of Variant tables is successfull.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Variant table Imported, to update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Variant table job update results", result);

                });
            }
        }
        else if (returnFlag === "N") {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Service connectivity issue.";


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Variant table job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Variant table job update results", result);

                });
            }
        }
        else {
            let dataObj = {};
            dataObj["success"] = false;
            dataObj["message"] = "Import of Variant tables has failed."+sError;


            if (req.headers['x-sap-job-id'] > 0) {
                const scheduler = getJobscheduler(req);

                var updateReq = {
                    jobId: req.headers['x-sap-job-id'],
                    scheduleId: req.headers['x-sap-job-schedule-id'],
                    runId: req.headers['x-sap-job-run-id'],
                    data: dataObj
                };

                console.log("Import of Variant table job update req", updateReq);

                scheduler.updateJobRunLog(updateReq, function (err, result) {
                    if (err) {
                        return console.log('Error updating run log: %s', err);
                    }
                    //Run log updated successfully
                    console.log("Import of Variant table job update results", result);

                });
            }
        }


    });
};

async function ConnectionCheck(req) {
    var Flag = 'N';
    try {
        const data = await cds.run(`SELECT * FROM "CONFIG_PRODUCTS::VT_LOCATION"`);
        if (data.length > 0) {
            Flag = "Y";
        }
    }
    catch (error) {
        console.log(error);
    }
    return Flag;
}