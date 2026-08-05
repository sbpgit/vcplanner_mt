const cds = require('@sap/cds')

// Begin of Resource Functions
const resourceFuncs = require('./lib/res-utils.js');
// Begin of Resource Functions

const OptUtilities = require('./Pred-Optimizations.js');
const { relativeTimeRounding } = require('moment-timezone');
const { entitySerializer } = require('@sap-cloud-sdk/core/dist/odata-common/entity-serializer.js');


class GenOptimization
{
    // globalObjectives = [];
    constructor() {
        this.globalObjective = [];
        this.PRIMARY_IDS = [];
        this.PRIMARY_IDS_PREDVALS = [];
        this.CHARVAL_COUNTS = [];
        this.CHAR_COUNTS = [];
        this.IBP_CHARVAL_COUNTS = [];
        this.IBP_CHAR_COUNTS = [];
        this.PRIMARY_IDS_COUNT = 0;
        this.GD_DELTA_DEVIATION = 5;
        this.MAX_DEVIATION = Math.pow(10,10);
        this.UUID = 'NONE';
        this.STATUS = 'NONE';
        this.OPTIMIZATION_TIME = 1000;
        this.OPTIMIZATION_DEVIATION = Math.pow(10,10);
        this.CAL_DATE = 'NONE';
    }

    _getOptimizationStatus = function()
    {
        let statusObj = {"CAL_DATE":this.CAL_DATE, "STATUS":this.STATUS, "OPTIMIZATION_TIME": this.OPTIMIZATION_TIME, "OPTIMIZATION_DEVIATION": this.OPTIMIZATION_DEVIATION};
        return statusObj;
    }

    _getGlobalObjective = async function()
    {
        return this.globalObjective;
    }
    
    _getObjective = function()
    {
        return this.globalObjective;
    }

    _getPrimaryIds = async function()
    {
        return this.PRIMARY_IDS;
    }

    _getPids = function()
    {
        return this.PRIMARY_IDS;
    }

    _setGlobalObjective = async function(objective)
    {
        this.globalObjective = objective;
    }

    _setPrimaryIds = async function(pids)
    {
        this.PRIMARY_IDS = pids;
    }
    
    _initialize_constraints_data_V1 = async function (PRIMARY_IDS)
    {
        let new_constraint_data = [];
        for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex ++)
        {
            new_constraint_data.push({"VARIABLE": PRIMARY_IDS[pidIndex].PID_ENCODED, "VALUE": 0, "DERIVATIVE": 0})

        }
        new_constraint_data.push({"VARIABLE": "K", "VALUE": 0, "DERIVATIVE": 0})

        return new_constraint_data;

    }

    _nonlinear_generic_UniqueIDS_V1 = async function (LOCATION_ID, PRODUCT_ID, TYPE, 
        MODEL_VERSION, VERSION, SCENARIO, ALGORITHM, FACTOR, CAL_DATE,
        MODEL_TYPE, MODEL_PROFILE)
    {
        console.log("_nonlinear_UniqueIDs_generic_UniqueIDS LOCATION_ID ", LOCATION_ID, "PRODUCT_ID ", PRODUCT_ID, "TYPE ", TYPE, "CAL_DATE ", CAL_DATE);

        let cal_date = CAL_DATE;
        this.CAL_DATE = CAL_DATE;

        let loc_id = LOCATION_ID;
        let prod_id = PRODUCT_ID;
        let objType = TYPE;
        let modelVersion = MODEL_VERSION;
        let ibpVersion = VERSION;
        let ibpScenario = SCENARIO;
        let algorithm = ALGORITHM;
        let modelType = MODEL_TYPE;
        let modelProfile = MODEL_PROFILE;


        let resultsByCharValNum;

        // SELECT DISTINCT CHARACTERISTICS AND CHARVALS OF THE PRODUCT
        let sqlStr = 'SELECT DISTINCT PBC.CHAR_NUM, CHVAL.CHARVAL_NUM' + 
                    ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
                    'INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                    ' PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
                    ' AND PBC.LOCATION_ID = IFC.LOCATION_ID ' +
                    ' AND PBC.PRODUCT_ID = IFC.PRODUCT_ID ' +
                    ' AND PBC.CAL_DATE = IFC.WEEK_DATE ' +
                    // ' RIGHT JOIN V_CHARVAL AS CHVAL ON ' +
                    // ' PBC.CHAR_NUM = CHVAL.CHAR_NUM ' +
                    ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND "OBJ_TYPE" =  ' + "'" + objType + "'" +
                    ' AND PBC.MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
                    ' ORDER BY CHAR_NUM, CHARVAL_NUM';
        // let sqlStr = 'SELECT DISTINCT PBC.CLASS_NUM, PBC.CHAR_NUM, CHVAL.CHARVAL_NUM' + 
        //             ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
        //             'INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
        //             ' PBC.CLASS_NUM = IFC.CLASS_NUM AND PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
        //             ' RIGHT JOIN V_CHARVAL AS CHVAL ON ' +
        //             ' PBC.CLASS_NUM = CHVAL.CLASS_NUM AND PBC.CHAR_NUM = CHVAL.CHAR_NUM ' +
        //             ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
        //             ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
        //             ' AND "OBJ_TYPE" =  ' + "'" + objType + "'" +
        //             ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
        //             ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
        //             ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
        //             ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
        //             ' ORDER BY CLASS_NUM, CHAR_NUM, CHARVAL_NUM';
        try {
                resultsByCharValNum = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

    //    console.log("_lpsolveUniqueIDs_generic_UniqueIDS sqlStr =",sqlStr);

        // console.log("_lpsolveUniqueIDs resultsByCharValNum length =",resultsByCharValNum.length);

        var resultsByCharNum;

        // SELECT DISTINCT CHARACTERISTICS  OF THE PRODUCT
        sqlStr = 'SELECT DISTINCT PBC.CHAR_NUM' + 
                ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
                'INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                ' PBC.CHAR_NUM = IFC.CHAR_NUM ' +
                ' AND PBC.LOCATION_ID = IFC.LOCATION_ID ' +
                ' AND PBC.PRODUCT_ID = IFC.PRODUCT_ID ' +
                ' AND PBC.CAL_DATE = IFC.WEEK_DATE ' +
                // ' RIGHT JOIN V_CHARVAL AS CHVAL ON ' +
                // ' PBC.CHAR_NUM = CHVAL.CHAR_NUM ' +
                ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PBD.PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                ' AND PBC.MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
                ' ORDER BY CHAR_NUM ';
        // sqlStr = 'SELECT DISTINCT PBC.CLASS_NUM, PBC.CHAR_NUM' + 
        //         ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
        //         'INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
        //         ' PBC.CLASS_NUM = IFC.CLASS_NUM AND PBC.CHAR_NUM = IFC.CHAR_NUM ' +
        //         ' RIGHT JOIN V_CHARVAL AS CHVAL ON ' +
        //         ' PBC.CLASS_NUM = CHVAL.CLASS_NUM AND PBC.CHAR_NUM = CHVAL.CHAR_NUM ' +
        //         ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
        //         ' AND PBD.PRODUCT_ID =  ' + "'" + prod_id + "'" +
        //         ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
        //         ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
        //         ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
        //         ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
        //         ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
        //         ' ORDER BY CLASS_NUM, CHAR_NUM ';
        try {
            resultsByCharNum = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        console.log("resultsByCharNum sqlStr ", sqlStr);

        // PREDICTED VALUES BY PRIMARY IDS (=OBJ_DEP+ '_' + OBJ_COUNTER)
        var results;
        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, OPT_STARTTIME, DELTA_TIME, PRE_OPTIMIZED, PRE_OPTIMIZED_TIME FROM CP_V_PREDICTIONS_BY_CHAR' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                    ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND "CAL_DATE" =  ' + "'" + cal_date + "'" +
                    ' ORDER BY LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER';
        try {
                results = await cds.run(sqlStr);
        }
        catch (exception) {
                console.log("sqlStr ", sqlStr);
                throw new Error(exception.toString());
        }
        // console.log("_lpsolveUniqueIDs sqlStr =",sqlStr);
        // console.log("_lpsolveUniqueIDs results =",results);

        var PRIMARY_IDS_PREDVALS = [];
        var PRIMARY_IDS = [];
        let optStartTime = new Date().toISOString();
        let deltaTime = results[0].DELTA_TIME;
        if( deltaTime == null)
        {
            deltaTime = results[0].PRE_OPTIMIZED_TIME;
        }
        for (let index = 0; index < results.length; index++)
        {
            let primary_id = results[index].LOCATION_ID + '#' + 
            results[index].PRODUCT_ID + '#' +
            results[index].OBJ_DEP + '#' +  results[index].OBJ_COUNTER;
            PRIMARY_IDS.push({"PRIMARY_ID": primary_id,  "PID_ENCODED": "P" + (index + 1), 
                "OPT_STARTTIME":results[index].OPT_STARTTIME,"DELTA_TIME":results[index].DELTA_TIME,
                "PREDICTED":results[index].PRE_OPTIMIZED,  "PREDICTED_TIME":results[index].PRE_OPTIMIZED_TIME,
                "OPT_STARTTIME":optStartTime,"DELTA_TIME": deltaTime,
                "RESTORE_TIME":results[index].OPT_STARTTIME});

        }

        //    console.log("_lpsolveUniqueIDs PRIMARY_IDS =",PRIMARY_IDS);



        //    console.log("_lpsolveUniqueIDs PRIMARY_IDS_PREDVALS =",PRIMARY_IDS_PREDVALS);

        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, OPT_STARTTIME, DELTA_TIME, CHAR_NUM, CHARVAL_NUM, PRE_OPTIMIZED ' +
                    ' FROM CP_V_PREDICTIONS_BY_CHAR' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                    ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND "CAL_DATE" =  ' + "'" + cal_date + "'" +
                    ' ORDER BY LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, CHAR_NUM, CHARVAL_NUM';

        var predictedVals;
        try {
                predictedVals = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        //    console.log("_lpsolveUniqueIDs predictedVals =",predictedVals);



        for (let pvalIndex =0; pvalIndex < predictedVals.length; pvalIndex++)
        {
            let pvalId = predictedVals[pvalIndex].LOCATION_ID + '#' + 
            predictedVals[pvalIndex].PRODUCT_ID + '#' +
            predictedVals[pvalIndex].OBJ_DEP + '#' +  predictedVals[pvalIndex].OBJ_COUNTER;
            let pvalCharNum = predictedVals[pvalIndex].CHAR_NUM;
            let pvalCharValNum = predictedVals[pvalIndex].CHARVAL_NUM;

            PRIMARY_IDS_PREDVALS.push({"PRIMARY_ID": pvalId, "PID_ENCODED": "P" + (pvalIndex + 1), "CHAR_NUM": pvalCharNum, "CHARVAL_NUM": pvalCharValNum, "PREDICTED": predictedVals[pvalIndex].PRE_OPTIMIZED});

        }

        //    console.log("_lpsolveUniqueIDs PRIMARY_IDS_PREDVALS =",PRIMARY_IDS_PREDVALS);


        // for (let primaryIndex = 0; primaryIndex < PRIMARY_IDS.length; primaryIndex ++)
        // {

        //     lp.addColumn(PRIMARY_IDS[primaryIndex].PID_ENCODED,false,false);
        // }


        var CHARVAL_COUNTS = [];
        var LOC_PROD_ID = loc_id + '#' + prod_id;

        for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
        {
            CHARVAL_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID,  "CHAR_NUM": resultsByCharValNum[charNumIndex].CHAR_NUM, "CHARVAL_NUM" : resultsByCharValNum[charNumIndex].CHARVAL_NUM, "PREDICTED": 0});                  
        }
        //    console.log("_lpsolveUniqueIDs CHARVAL_COUNTS INITIALIZED =",CHARVAL_COUNTS);

        // console.log(" Before Adding Variables for CHVAL_COUNTS")

        var CHARVAL_IDS = [];

        for (let charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx ++)
        {
            let variable = CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID + '-' + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM;
            CHARVAL_IDS.push({"CHARVAL_ID":variable, "CHARVAL_ID_ENCODED": "C" + (charvalIdx + 1)})
            // lp.addColumn(variable,false,false); 

        }

        // console.log(" After Adding Variables for CHARVAL_COUNTS")

        for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
        {
            for (let pidIndex = 0; pidIndex < PRIMARY_IDS_PREDVALS.length; pidIndex++)
            {


                if( (CHARVAL_COUNTS[charNumIndex].CHAR_NUM === PRIMARY_IDS_PREDVALS[pidIndex].CHAR_NUM) &&
                    (CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM === PRIMARY_IDS_PREDVALS[pidIndex].CHARVAL_NUM) )
                {

                    CHARVAL_COUNTS[charNumIndex].PREDICTED = CHARVAL_COUNTS[charNumIndex].PREDICTED + PRIMARY_IDS_PREDVALS[pidIndex].PREDICTED;
                }

            }
        }

        // console.log("_lpsolveUniqueIDs CHARVAL_COUNTS AGGREGATED =",CHARVAL_COUNTS);

        let UID_CHARVAL_MATRIX = [];
        for (var uidIdx = 0; uidIdx < PRIMARY_IDS.length; uidIdx++) {
            UID_CHARVAL_MATRIX[uidIdx]=[];
            for (var charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++) {
                UID_CHARVAL_MATRIX[uidIdx][charvalIdx] = 0;
            }
        }

        for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex++)
        {
            for (let pvalIndex = 0; pvalIndex < PRIMARY_IDS_PREDVALS.length; pvalIndex++)
            {
                if(PRIMARY_IDS[pidIndex].PRIMARY_ID === PRIMARY_IDS_PREDVALS[pvalIndex].PRIMARY_ID)
                {
                    for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
                    {

                        if( (CHARVAL_COUNTS[charNumIndex].CHAR_NUM === PRIMARY_IDS_PREDVALS[pvalIndex].CHAR_NUM) &&
                            (CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM === PRIMARY_IDS_PREDVALS[pvalIndex].CHARVAL_NUM) )
                        {
                            UID_CHARVAL_MATRIX[pidIndex][charNumIndex] = 1;
                        }

                    }
                }
            }
        }

        //    console.log("UID_CHARVAL_MATRIX ", UID_CHARVAL_MATRIX);





        // console.log("_lpsolveUniqueIDs CHARVAL_COUNTS =",CHARVAL_COUNTS);

        // console.log("_lpsolveUniqueIDs resultsByCharNum =",resultsByCharNum);


        var CHAR_COUNTS = [];
        for (let charIndex = 0; charIndex < resultsByCharNum.length; charIndex ++)
        {
            let charCount = 0;

            for (let charValIndex = 0; charValIndex < resultsByCharValNum.length; charValIndex++)   
            {
                if( resultsByCharNum[charIndex].CHAR_NUM === CHARVAL_COUNTS[charValIndex].CHAR_NUM)
                {
                    charCount = charCount + CHARVAL_COUNTS[charValIndex].PREDICTED;
                } 
            }
            CHAR_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": resultsByCharNum[charIndex].CHAR_NUM, "PREDICTED": charCount});              

        }



        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, "VERSION", "SCENARIO", CHAR_NUM, CHARVAL_NUM,  OPT_QTY '+
                    ' FROM CP_V_IBP_FCHARPLAN_BY_PRIMARY_CHARS' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND "WEEK_DATE" =  ' + "'" + cal_date + "'" +
                    ' AND "MODEL_VERSION" = ' + "'" + modelVersion + "'" +
                    ' ORDER BY LOCATION_ID, PRODUCT_ID, "VERSION", "SCENARIO", CHAR_NUM, CHARVAL_NUM';

        let ibpResultsByCharvalNum;
        try {
            ibpResultsByCharvalNum = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        // console.log("ibpResultsByCharvalNum ", ibpResultsByCharvalNum);
        let IBP_CHARVAL_COUNTS = [];


        // INITIALIZE SIZE OF IBP option quantities to be in sync with BTP predicted quantities
        for (let charvalIndex = 0; charvalIndex < CHARVAL_COUNTS.length; charvalIndex ++)
        {

            IBP_CHARVAL_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": CHARVAL_COUNTS[charvalIndex].CHAR_NUM, 
                                        "CHARVAL_NUM": CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM, "IBP_OPT_QTY": 0});              
        }

        // UPDATE IBP option quantities from ibpResultsByCharvalNum

        for (let charvalIndex = 0; charvalIndex < CHARVAL_COUNTS.length; charvalIndex ++)
        {
            for (let ibpIdx = 0; ibpIdx < ibpResultsByCharvalNum.length; ibpIdx ++)
            {

                if( (CHARVAL_COUNTS[charvalIndex].LOC_PROD_ID  == (ibpResultsByCharvalNum[ibpIdx].LOCATION_ID + '#' + ibpResultsByCharvalNum[ibpIdx].PRODUCT_ID )) &&
                    (CHARVAL_COUNTS[charvalIndex].CHAR_NUM  == ibpResultsByCharvalNum[ibpIdx].CHAR_NUM) &&
                    (CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM  == ibpResultsByCharvalNum[ibpIdx].CHARVAL_NUM) )
                {
                    IBP_CHARVAL_COUNTS[charvalIndex].CHAR_NUM = ibpResultsByCharvalNum[ibpIdx].CHAR_NUM;
                    IBP_CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM = ibpResultsByCharvalNum[ibpIdx].CHARVAL_NUM;
                    IBP_CHARVAL_COUNTS[charvalIndex].IBP_OPT_QTY = ibpResultsByCharvalNum[ibpIdx].OPT_QTY;
                }

            }
        }

        // console.log("IBP_CHARVAL_COUNTS = ", IBP_CHARVAL_COUNTS);

        let IBP_CHAR_COUNTS = [];
        // INITIALIZE SIZE OF IBP char quantities to be in sync with BTP predicted char quantities
        for (let charIndex = 0; charIndex < CHAR_COUNTS.length; charIndex ++)
        {

            IBP_CHAR_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": CHAR_COUNTS[charIndex].CHAR_NUM, "IBP_CHAR_QTY": 0});              
        }

        // UPDATE IBP option quantities from ibpResultsByCharvalNum

        for (let charIndex = 0; charIndex < CHAR_COUNTS.length; charIndex ++)
        {
            let charCount = 0;
            for (let charvalIdx = 0; charvalIdx < IBP_CHARVAL_COUNTS.length; charvalIdx ++)
            {
                if( (IBP_CHAR_COUNTS[charIndex].LOC_PROD_ID  == IBP_CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID) &&
                    (IBP_CHAR_COUNTS[charIndex].CHAR_NUM  == IBP_CHARVAL_COUNTS[charvalIdx].CHAR_NUM)  )
                {
                    IBP_CHAR_COUNTS[charIndex].IBP_CHAR_QTY = IBP_CHAR_COUNTS[charIndex].IBP_CHAR_QTY +
                                            Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY);

                }
            }
        }


        let ibp_total_qty = IBP_CHAR_COUNTS[0].IBP_CHAR_QTY;

        console.log("IBP_CHAR_COUNTS = ", IBP_CHAR_COUNTS);
        let constraint_var = []; 
        let constraint_var_minus = [];


        for (var charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++)
        {
            // NLopt always expects constraints to be of the form myconstraint(x) ≤ 0

            // constraint_var.push({"CHARIDX": charvalIdx + 1, "CONSTANT": -Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY), "CHARVAL_ID_ENCODED": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "CHARVAL_ID_DERIVATIVE": -1}); 
            // constraint_var_minus.push({"CHARIDX": charvalIdx + 1, "CONSTANT": Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY), "CHARVAL_ID_ENCODED": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "CHARVAL_ID_DERIVATIVE": -1});
            let ibpOptQty = Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY);
            let ibpValue = 0;
            if (ibpOptQty != 0)
            {
                ibpValue = -1*ibpOptQty;
            }
            constraint_var.push({"VARIDX": charvalIdx + 1 ,"TYPE": "KID", "VARIABLE": "K", "VALUE": ibpValue, "DERIVATIVE": 0});
            
            for (let uidIdx = 0; uidIdx < PRIMARY_IDS.length; uidIdx ++)
            {
                // if(UID_CHARVAL_MATRIX[uidIdx][charvalIdx] === 1)
                // {
            
                    constraint_var.push({"VARIDX": charvalIdx + 1 ,"TYPE": "PID", "VARIABLE": PRIMARY_IDS[uidIdx].PID_ENCODED, "VALUE": UID_CHARVAL_MATRIX[uidIdx][charvalIdx], "DERIVATIVE": UID_CHARVAL_MATRIX[uidIdx][charvalIdx]});
                    // constraint_var_minus.push({"VARIDX": charvalIdx + 1 ,"TYPE": "PID", "VARIABLE": PRIMARY_IDS[uidIdx].PID_ENCODED, "VALUE": 1, "DERIVATIVE": -1});

                // }
            }   
        
        }

        sqlStr = 'SELECT SUM(PRE_OPTIMIZED) AS TOTAL_PREDICTED FROM V_CP_TS_PREDICTIONS_TELESCOPIC  ' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND CAL_DATE =  ' + "'" + cal_date + "'";

        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        let loc_prod_predicted = 0;

        if (results.length > 0)
        {
            loc_prod_predicted = results[0].TOTAL_PREDICTED;
        }

        sqlStr = 'SELECT QUANTITY FROM V_IBP_FUTUREDEMAND_TELESCOPIC  ' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND WEEK_DATE =  ' + "'" + cal_date + "'";
        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        let loc_prod_ibp_qty = 0;

        if (results.length > 0)
        {
            loc_prod_ibp_qty = results[0].QUANTITY;
        }

        let min_qty_factor = 0;
        if( loc_prod_predicted >= loc_prod_ibp_qty)
        {
            min_qty_factor = FACTOR*loc_prod_ibp_qty/loc_prod_predicted;
            // min_qty_factor = loc_prod_ibp_qty/loc_prod_predicted;

        }
        else
        {
            min_qty_factor = FACTOR*loc_prod_predicted/loc_prod_ibp_qty;
            // min_qty_factor = loc_prod_predicted/loc_prod_ibp_qty;

        }

        console.log("loc_prod_predicted ", loc_prod_predicted, "loc_prod_ibp_qty =",loc_prod_ibp_qty,  "OptFactor =", FACTOR, "min_qty_factor", min_qty_factor);
        let pid_total_constraint_var = [];
        let pid_constraint_var = [];

        pid_total_constraint_var.push({"VARIDX": 1,"CONSTRAINT_NAME": "TOTAL", "CONSTRAINT_TYPE" : "EQUALITY", "VARIABLE": "K", "VALUE": -ibp_total_qty, "DERIVATIVE": 0});
        // pid_total_constraint_var.push({"VARIDX": 1,"CONSTRAINT_NAME": "TOTAL", "CONSTRAINT_TYPE" : "EQUALITY", "VARIABLE": "K", "VALUE": ibp_total_qty, "DERIVATIVE": 0});

        for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex++)
        {
            // let variable = PRIMARY_IDS[pidIndex].PRIMARY_ID;
            // variable = variable.replace(/'/g,'');
            pid_total_constraint_var.push({"VARIDX": 1, "CONSTRAINT_NAME": "TOTAL", "CONSTRAINT_TYPE" : "EQUALITY", "PRIMARY_ID": PRIMARY_IDS[pidIndex].PRIMARY_ID, "VARIABLE": PRIMARY_IDS[pidIndex].PID_ENCODED, "VALUE": 1, "DERIVATIVE": -1});
            
            pid_constraint_var.push({"VARIDX": pidIndex+1, "CONSTRAINT_NAME": "MINIMUM", "CONSTRAINT_TYPE" : "INEQUALITY", "PRIMARY_ID": PRIMARY_IDS[pidIndex].PRIMARY_ID, "VARIABLE": 'K', "VALUE": min_qty_factor*PRIMARY_IDS[pidIndex].PREDICTED,"DERIVATIVE": 0})
            pid_constraint_var.push({"VARIDX": pidIndex+1, "CONSTRAINT_NAME": "MINIMUM", "CONSTRAINT_TYPE" : "INEQUALITY", "PRIMARY_ID": PRIMARY_IDS[pidIndex].PRIMARY_ID, "VARIABLE": PRIMARY_IDS[pidIndex].PID_ENCODED, "VALUE": 1,"DERIVATIVE": -1})


        }

            //     objective.push({"VARIDX": 1, "CONSTRAINT_TYPE": "OBJECTIVE", "VARIABLE": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "VALUE": 1, "DERIVATIVE": 1});

        // for (var charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++)
        // {
        
        //     pid_constraint_var.push({"VARIDX": charvalIdx+1, "CONSTRAINT_NAME": "MINIMUM", "CONSTRAINT_TYPE" : "INEQUALITY", "CHARVAL_IDS": PRIMARY_IDS[pidIndex].PRIMARY_ID, "VARIABLE": 'K', "VALUE": min_qty_factor*PRIMARY_IDS[pidIndex].PREDICTED,"DERIVATIVE": 0})
        //     pid_constraint_var.push({"VARIDX": charvalIdx+1, "CONSTRAINT_NAME": "MINIMUM", "CONSTRAINT_TYPE" : "INEQUALITY", "CHARVAL_IDS": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "VARIABLE": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "VALUE": 1,"DERIVATIVE": 1})


        // }

        // pid_total_constraint_var.push({"CONSTRAINT_NAME": "TOTAL", "CONSTRAINT_TYPE" : "EQUALITY", "VARIABLE": "K", "VALUE": ibp_total_qty, "DERIVATIVE": 0});

        // console.log("AFTER // ADD CONSTRAINTS ON PRIMARY IDS")


        // console.log("AFTER  // ADD PRIMARY ID VALUES WHOSE VALUES ARE TO BE ESTIMATED BY SOLVER")





        /***************/


        let ibp_planned_quantities = [];
        let btp_predicted_quantities = [];
        let ibp_penalties =[];
        for (let ibpIdx = 0; ibpIdx < IBP_CHARVAL_COUNTS.length; ibpIdx++)
        {
            ibp_planned_quantities[ibpIdx] = IBP_CHARVAL_COUNTS[ibpIdx].IBP_OPT_QTY;
            btp_predicted_quantities[ibpIdx] = CHARVAL_COUNTS[ibpIdx].PREDICTED;

        }


        console.log("ibp_planned_quantities ", ibp_planned_quantities);
        console.log("btp_predicted_quantities ", btp_predicted_quantities);


        let objective = [];

        // for (var charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++)
        // {
        //     objective.push({"VARIDX": 1, "CONSTRAINT_TYPE": "OBJECTIVE", "VARIABLE": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "VALUE": 1, "DERIVATIVE": 1});

        // }

        // console.log("objective = ",objective);
        // console.log("pid_total_constraint_var = ",pid_total_constraint_var);
        // console.log("pid_constraint Minimum = ",pid_constraint_var);
        // console.log("constraint_var = ",constraint_var);
        // console.log("constraint_var_minus = ",constraint_var_minus);

        let AllConstraints = [];

        // let new_constraint_data = await OptUtilities._initialize_constraints_data_V1(PRIMARY_IDS)
        // let next_varIdx =  objective[0].VARIDX;
        // let current_varidx = objective[0].VARIDX;
        let constraints_count = 0;


        // for (let constraintIdx = 0; constraintIdx < objective.length; constraintIdx++)
        // {
        //     next_varIdx = objective[constraintIdx].VARIDX;

        //     // console.log( "next_varIdx ", next_varIdx, "current_varidx ", current_varidx, "constraintIdx", constraintIdx)

        //     if (next_varIdx === current_varidx)
        //     {
        //         for (let varIdx = 0; varIdx < new_constraint_data.length; varIdx++)
        //         {
        //             constraints_count ++;
        //             if(new_constraint_data[varIdx].VARIABLE == objective[constraintIdx].VARIABLE)
        //             {
        //                 new_constraint_data[varIdx].VALUE = objective[constraintIdx].VALUE;
        //                 new_constraint_data[varIdx].DERIVATIVE = objective[constraintIdx].DERIVATIVE;

        //             }
        //         }

        //     }
        //     else
        //     {

        //         AllConstraints.push({"CONSTRAINT_TYPE":"OBJECTIVE", "CONSTRAINT_DATA":new_constraint_data})

        //         new_constraint_data = await OptUtilities._initialize_constraints_data(PRIMARY_IDS)


        //         current_varidx = objective[constraintIdx].VARIDX;

        //         if(new_constraint_data[new_constraint_data.length-1].VARIABLE == objective[constraintIdx].VARIABLE)
        //         {
        //             new_constraint_data[new_constraint_data.length-1].VALUE = objective[constraintIdx].VALUE;
        //             new_constraint_data[new_constraint_data.length-1].DERIVATIVE = objective[constraintIdx].DERIVATIVE;
        //         }
        
        //     }
        
        // }
        // // PUSH data for last Variable
        // AllConstraints.push({"CONSTRAINT_TYPE":"OBJECTIVE", "CONSTRAINT_DATA":new_constraint_data})

        //************************BEGIN  OF CONSTRAINT OBJECTIVE **************/

        let new_constraint_data = await OptUtilities._initialize_constraints_data_V1(PRIMARY_IDS)

        let next_varIdx =  constraint_var[0].VARIDX;
        let current_varidx = constraint_var[0].VARIDX;

        // let constraints_count = 0;

        // constraint_var
        for (let constraintIdx = 0; constraintIdx < constraint_var.length; constraintIdx++)
        {
            next_varIdx = constraint_var[constraintIdx].VARIDX;

            // console.log( "next_varIdx ", next_varIdx, "current_varidx ", current_varidx, "constraintIdx", constraintIdx)

            if (next_varIdx === current_varidx)
            {
                for (let varIdx = 0; varIdx < new_constraint_data.length; varIdx++)
                {
                    constraints_count ++;
                    // console.log( "varIdx ", varIdx, "constraintIdx ", constraintIdx)
                    // console.log("constraintIdx", constraintIdx,"new_constraint_data[varIdx].VARIABLE", new_constraint_data[varIdx].VARIABLE, "constraint_var[constraintIdx].VARIABLE", constraint_var[constraintIdx].VARIABLE );
                    if(new_constraint_data[varIdx].VARIABLE == constraint_var[constraintIdx].VARIABLE)
                    {
                        new_constraint_data[varIdx].VALUE = constraint_var[constraintIdx].VALUE;
                        new_constraint_data[varIdx].DERIVATIVE = constraint_var[constraintIdx].DERIVATIVE;

                    }
                }

            }
            else
            {

                AllConstraints.push({"CONSTRAINT_TYPE":"OBJECTIVE", "CONSTRAINT_DATA":new_constraint_data})

                new_constraint_data = await OptUtilities._initialize_constraints_data_V1(PRIMARY_IDS, CHARVAL_IDS)


                current_varidx = constraint_var[constraintIdx].VARIDX;

                if(new_constraint_data[new_constraint_data.length-1].VARIABLE == constraint_var[constraintIdx].VARIABLE)
                {
                    new_constraint_data[new_constraint_data.length-1].VALUE = constraint_var[constraintIdx].VALUE;
                    new_constraint_data[new_constraint_data.length-1].DERIVATIVE = constraint_var[constraintIdx].DERIVATIVE;
                }
        
            }
        
        }
        // PUSH data for last Variable
        AllConstraints.push({"CONSTRAINT_TYPE":"OBJECTIVE", "CONSTRAINT_DATA":new_constraint_data})

        //************************END  OF CONSTRAINT OBJECTIVE **************/

        //************************BEGIN OF TOTAL CONSTRAINT **************/

        new_constraint_data = await OptUtilities._initialize_constraints_data_V1(PRIMARY_IDS)

        next_varIdx =  pid_total_constraint_var[0].VARIDX;
        current_varidx = pid_total_constraint_var[0].VARIDX;


        // TOTAL constraint_var
        for (let constraintIdx = 0; constraintIdx < pid_total_constraint_var.length; constraintIdx++)
        {
            next_varIdx = pid_total_constraint_var[constraintIdx].VARIDX;

            // console.log( "next_varIdx ", next_varIdx, "current_varidx ", current_varidx, "constraintIdx", constraintIdx)

            if (next_varIdx === current_varidx)
            {
                for (let varIdx = 0; varIdx < new_constraint_data.length; varIdx++)
                {
                    constraints_count ++;
                    if(new_constraint_data[varIdx].VARIABLE == pid_total_constraint_var[constraintIdx].VARIABLE)
                    {
                        new_constraint_data[varIdx].VALUE = pid_total_constraint_var[constraintIdx].VALUE;
                        new_constraint_data[varIdx].DERIVATIVE = pid_total_constraint_var[constraintIdx].DERIVATIVE;

                    }
                }

            }
            else
            {

                AllConstraints.push({"CONSTRAINT_TYPE":"EQUALITY", "CONSTRAINT_DATA":new_constraint_data})

                new_constraint_data = await OptUtilities._initialize_constraints_data_V1(PRIMARY_IDS)


                current_varidx = pid_total_constraint_var[constraintIdx].VARIDX;

                if(new_constraint_data[new_constraint_data.length-1].VARIABLE == pid_total_constraint_var[constraintIdx].VARIABLE)
                {
                    new_constraint_data[new_constraint_data.length-1].VALUE = pid_total_constraint_var[constraintIdx].VALUE;
                    new_constraint_data[new_constraint_data.length-1].DERIVATIVE = pid_total_constraint_var[constraintIdx].DERIVATIVE;
                }
        
            }
        
        }
        // PUSH data for last Variable
        AllConstraints.push({"CONSTRAINT_TYPE":"EQUALITY", "CONSTRAINT_DATA":new_constraint_data})

        //************************END  OF TOTAL CONSTRAINT **************/

        //************************BEGIN  OF CONSTRAINT MINIMUM **************/

        new_constraint_data = await OptUtilities._initialize_constraints_data_V1(PRIMARY_IDS)

        next_varIdx =  pid_constraint_var[0].VARIDX;
        current_varidx = pid_constraint_var[0].VARIDX;


        // pid_constraint_var
        for (let constraintIdx = 0; constraintIdx < pid_constraint_var.length; constraintIdx++)
        {
            next_varIdx = pid_constraint_var[constraintIdx].VARIDX;

            // console.log( "next_varIdx ", next_varIdx, "current_varidx ", current_varidx, "constraintIdx", constraintIdx)

            if (next_varIdx === current_varidx)
            {
                for (let varIdx = 0; varIdx < new_constraint_data.length; varIdx++)
                {
                    constraints_count ++;
                    if(new_constraint_data[varIdx].VARIABLE == pid_constraint_var[constraintIdx].VARIABLE)
                    {
                        new_constraint_data[varIdx].VALUE = pid_constraint_var[constraintIdx].VALUE;
                        new_constraint_data[varIdx].DERIVATIVE = pid_constraint_var[constraintIdx].DERIVATIVE;

                    }
                }

            }
            else
            {

                AllConstraints.push({"CONSTRAINT_TYPE":"INEQUALITY_MINIMUM", "CONSTRAINT_DATA":new_constraint_data})

                new_constraint_data = await OptUtilities._initialize_constraints_data_V1(PRIMARY_IDS)


                current_varidx = pid_constraint_var[constraintIdx].VARIDX;

                if(new_constraint_data[new_constraint_data.length-1].VARIABLE == pid_constraint_var[constraintIdx].VARIABLE)
                {
                    new_constraint_data[new_constraint_data.length-1].VALUE = pid_constraint_var[constraintIdx].VALUE;
                    new_constraint_data[new_constraint_data.length-1].DERIVATIVE = pid_constraint_var[constraintIdx].DERIVATIVE;
                }
        
            }
        
        }
        // PUSH data for last Variable
        AllConstraints.push({"CONSTRAINT_TYPE":"INEQUALITY_MINIMUM", "CONSTRAINT_DATA":new_constraint_data})

        //************************END  OF CONSTRAINT MINIMUM **************/




        for (let constraintsIdx = 0; constraintsIdx < AllConstraints.length; constraintsIdx++)
        {
            console.log("AllConstraints[",constraintsIdx,"].CONSTRAINT_TYPE", AllConstraints[constraintsIdx].CONSTRAINT_TYPE)
            console.log("AllConstraints[",constraintsIdx,"].CONSTRAINT_DATA", AllConstraints[constraintsIdx].CONSTRAINT_DATA)

        }

        const rp = require('request-promise');

        //    var pythonSvc = process.env.python_srv_url + "/test";
        // var pythonSvc =  "https://pythonapp.cfapps.us10.hana.ondemand.com/nlopt"      
        var pythonSvc = process.env.python_srv_url + "/nlopt";

        // console.log(" Python Service URL ", pythonSvc);
        const nlOptTimeout = 120000;
        var options;
        options = {
            'method': 'POST',
            'url': pythonSvc,
            'headers': {
                'Content-Type': 'application/json'
        },
        'timeout': nlOptTimeout,

        body: JSON.stringify({
            "Algorithm" : ALGORITHM,
            "OptFactor" : FACTOR,
            "Constraints" : AllConstraints
        })

        };

        let ret_response ="";
        let error = false;

        console.log('_postPythonRequest Request Time = ', new Date());

        await rp(options)
        .then(function (response) {
            console.log('_postPythonRequest Response Time = ', new Date());
            console.log('PYTHONSVC Response = ', response);

            // console.log('Response   = ', response);
            ret_response = JSON.parse(response);
            // ret_response = response;
            
        })
        .catch(function (err) {
            console.log('_postPythonRequest - Error ', err);
            ret_response = err;
            error = true;

        });

        if( error == true)
            return;

        console.log("ret_response ", ret_response)

            // PRIMARY_IDS.push({"PRIMARY_ID": primary_id,  "PID_ENCODED": "P" + (index + 1),"PREDICTED":results[index].PRE_OPTIMIZED,  "PREDICTED_TIME":results[index].PRE_OPTIMIZED_TIME});


        var PID_OPTIMIZED = [];
        let PID_OPTIMIZED_SUM = 0;
        pidVals= JSON.parse(ret_response)
        console.log("ret_response ", "P1 ", pidVals.P1,  "P2 ",pidVals.P2,"P3 ", pidVals.P3, "P4 ",pidVals.P4)
        for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex ++)
        {
            pid = PRIMARY_IDS[pidIndex].PID_ENCODED;
            let optimized_qty = pidVals[pid]
            PID_OPTIMIZED.push({"PRIMARY_ID": PRIMARY_IDS[pidIndex].PRIMARY_ID, "OPTIMIZED_PRIMARY_QTY" : optimized_qty});
            PID_OPTIMIZED_SUM = PID_OPTIMIZED_SUM + optimized_qty;
        }
        // console.log("PRIMARY_IDS", PRIMARY_IDS);

        // console.log("PID_OPTIMIZED", PID_OPTIMIZED);
        console.log("PID_OPTIMIZED_SUM", PID_OPTIMIZED_SUM);




        // Initialize Revized PRIMARY ID Predicted values and then update with  PID_OPTIMIZED
        var OPTIMIZED_PRIMARY_IDS_PREDVALS = [];
        // console.log("INIT REVISED_PRIMARY_IDS_PREDVALS = ", REVISED_PRIMARY_IDS_PREDVALS);   
        for (let pidIndex = 0; pidIndex < PRIMARY_IDS_PREDVALS.length; pidIndex++)
        {

            OPTIMIZED_PRIMARY_IDS_PREDVALS.push({"PRIMARY_ID":PRIMARY_IDS_PREDVALS[pidIndex].PRIMARY_ID,
                        "CHAR_NUM":PRIMARY_IDS_PREDVALS[pidIndex].CHAR_NUM,
                        "CHARVAL_NUM":PRIMARY_IDS_PREDVALS[pidIndex].CHARVAL_NUM,
                        "OPTIMIZED_PRIMARY_QTY":0});


        }

        for (let revIndex = 0; revIndex < OPTIMIZED_PRIMARY_IDS_PREDVALS.length; revIndex++)
        {
            for (let pcalcIndex = 0; pcalcIndex < PID_OPTIMIZED.length; pcalcIndex++)
            {
                if ( (OPTIMIZED_PRIMARY_IDS_PREDVALS[revIndex].PRIMARY_ID == PID_OPTIMIZED[pcalcIndex].PRIMARY_ID))
                {

                    OPTIMIZED_PRIMARY_IDS_PREDVALS[revIndex].OPTIMIZED_PRIMARY_QTY =  PID_OPTIMIZED[pcalcIndex].OPTIMIZED_PRIMARY_QTY;
                }
            }
        }

        //    console.log("OPTIMIZED_PRIMARY_IDS_PREDVALS ", OPTIMIZED_PRIMARY_IDS_PREDVALS);

        let OPTIMIZED_CHARVAL_COUNTS = [];

        for (let charNumIndex = 0; charNumIndex < CHARVAL_COUNTS.length; charNumIndex++)
        {

            OPTIMIZED_CHARVAL_COUNTS.push({"LOC_PROD_ID":CHARVAL_COUNTS[charNumIndex].LOC_PROD_ID, 
                "CHAR_NUM": CHARVAL_COUNTS[charNumIndex].CHAR_NUM, 
                "CHARVAL_NUM": CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM,
                "OPTIMIZED_CHAR_QTY": 0});
        }
        // console.log("INITIALIZED OPTIMIZED_CHARVAL_COUNTS = ", OPTIMIZED_CHARVAL_COUNTS);


        for (let revcharNumIndex = 0; revcharNumIndex < OPTIMIZED_CHARVAL_COUNTS.length; revcharNumIndex++)
        {
            for (let revpidvalIdx = 0; revpidvalIdx < OPTIMIZED_PRIMARY_IDS_PREDVALS.length; revpidvalIdx++)
            {
                let primaryId = OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].PRIMARY_ID;
                let locprodId = OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].LOC_PROD_ID;

                if (primaryId.includes(locprodId) &&
                ( OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].CHAR_NUM == OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].CHAR_NUM) &&
                ( OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].CHARVAL_NUM == OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].CHARVAL_NUM))
                {
                    OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].OPTIMIZED_CHAR_QTY = 
                    OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].OPTIMIZED_CHAR_QTY + 
                    OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].OPTIMIZED_PRIMARY_QTY;

                }
            }
        }
        // console.log("UPDATED OPTIMIZED_CHARVAL_COUNTS = ", OPTIMIZED_CHARVAL_COUNTS);

        let btp_optimized_char_quantities = [];
        for (let revIdx = 0; revIdx < OPTIMIZED_CHARVAL_COUNTS.length; revIdx++)
        {
            btp_optimized_char_quantities[revIdx] = OPTIMIZED_CHARVAL_COUNTS[revIdx].OPTIMIZED_CHAR_QTY;
        }

        var tableObj = [];	

        for (let index =0; index < btp_optimized_char_quantities.length; index++)
        {


            let pred_dev = 0;
            let pred_post_dev = 0;
            let normalized_dev = 0;
            if (ibp_planned_quantities[index] != 0)
            {
                pred_dev = (100*Math.abs(ibp_planned_quantities[index]-btp_predicted_quantities[index])/ibp_planned_quantities[index]).toFixed(2);
                pred_post_dev = (100*Math.abs(ibp_planned_quantities[index]-btp_optimized_char_quantities[index])/ibp_planned_quantities[index]).toFixed(2);
                normalized_dev = 100*Math.abs(ibp_planned_quantities[index]-btp_optimized_char_quantities[index])/loc_prod_ibp_qty;
            }

            let charNum = CHARVAL_COUNTS[index].CHAR_NUM;
            let charvalNum = CHARVAL_COUNTS[index].CHARVAL_NUM;
            var rowObj = { CAL_DATE : cal_date, 
            LOCATION_ID : loc_id,
            PRODUCT_ID : prod_id,
            MODEL_VERSION : modelVersion,
            VERSION : ibpVersion,
            SCENARIO : ibpScenario,
            ALGORITHM : algorithm,
            CHAR_NUM :  charNum ,
            CHARVAL_NUM :  charvalNum ,
            PREDICTED_QTY : (btp_predicted_quantities[index]).toFixed(4),
            IBP_PLANNED_QTY : ibp_planned_quantities[index],
            BTP_REVISED_QTY : (btp_optimized_char_quantities[index]).toFixed(2),
            PREDICTED_DEVIATION: pred_dev, 
            POST_PREDICTED_DEVIATION : pred_post_dev,
            NORMALIZED_DEVIATION : normalized_dev};

            tableObj.push(rowObj);


        }
        sqlStr = 'DELETE FROM CP_VC_PREDICTIONS_OPTIMIZED ' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND ALGORITHM =  ' + "'" + algorithm + "'" +
                ' AND "CAL_DATE" =  ' + "'" + cal_date + "'";
        try {
            await cds.run(sqlStr);
            //  console.log("sqlstr = ", sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        // console.log("tableObj ", tableObj);
        let cqnQuery = {UPSERT:{ into: { ref: ['CP_VC_PREDICTIONS_OPTIMIZED'] }, entries:  tableObj }};

        await cds.run(cqnQuery);

        var optimizedTime = new Date().toISOString();

        sqlStr = ' SELECT PERIODSTART, WEEKS FROM V_TELESCOPIC_WEEKS_PER_PERIOD ' +
                     ' WHERE PERIODSTART = ' + "'" + cal_date + "'" ;
        let telescopicWeeks;
        try {
            telescopicWeeks = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log(" telescopicWeeks sqlStr ", sqlStr,  "locId : ",loc_id, "prodId : ", prod_id);
            throw new Error(exception.toString());
        }
        

        let weekDates = '(';
        let dateStr = telescopicWeeks[0].PERIODSTART; //'2025-05-31';
        let numberOfWeeks = telescopicWeeks[0].WEEKS;
        for (let weekIdx = 0; weekIdx < numberOfWeeks ; weekIdx++)
        {
            const inputDate = new Date(dateStr);
            inputDate.setDate(inputDate.getDate() + 7*weekIdx);
            const result = inputDate.toISOString().split('T')[0];
            if(weekIdx < numberOfWeeks - 1)
                weekDates = weekDates + "'" + result + "'" + ",";
            else
                weekDates =  weekDates +  "'" + result + "'"  + ")";
        }

        console.log("weekDate ", weekDates);
        let ibpQtysAggResults;
        sqlStr = ' SELECT  SUM(QUANTITY) AS QUANTITY FROM CP_IBP_FUTUREDEMAND ' +
                    ' WHERE WEEK_DATE IN ' + weekDates + 
                ' AND LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" ;
        try {
            ibpQtysAggResults = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("ibpQtysAggResults sqlStr ", sqlStr, "locId : ",loc_id, "prodId : ", prod_id);
            throw new Error(exception.toString());
        }
        console.log("ibpQtysAggResults ", ibpQtysAggResults);

        let ibpQtysResults;
        sqlStr = ' SELECT DISTINCT WEEK_DATE, QUANTITY FROM CP_IBP_FUTUREDEMAND ' +
                    ' WHERE WEEK_DATE IN ' + weekDates + 
                    ' AND LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" ;
        try {
            ibpQtysResults = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log(" ibpQtysResults sqlStr ", sqlStr, "locId : ",loc_id, "prodId : ", prod_id);
            throw new Error(exception.toString());
        }
        console.log("ibpQtysResults ", ibpQtysResults);
        let disAggregatedValues = [];
        for(let ratioIdx = 0; ratioIdx < ibpQtysResults.length; ratioIdx ++)
        {
            let ratio = ibpQtysResults[ratioIdx].QUANTITY/ibpQtysAggResults[0].QUANTITY;
            disAggregatedValues.push({WEEK_DATE:ibpQtysResults[ratioIdx].WEEK_DATE,
                                        QUANTITY:ibpQtysResults[ratioIdx].QUANTITY,
                                        RATIO:ratio});
        }

        console.log("disAggregatedValues ", disAggregatedValues);
        let preOptimizedResults = [];
        let sqlStrPreOptimized = 'SELECT DISTINCT CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_TYPE, OBJ_DEP, OBJ_COUNTER, ' +
                                  'MODEL_TYPE, MODEL_VERSION, MODEL_PROFILE, VERSION, SCENARIO, PREDICTED, PREDICTED_TIME, ' +
                                  ' OPT_STARTTIME, DELTA_TIME, PREDICTED_STATUS, PRE_OPTIMIZED, PRE_OPTIMIZED_TIME, ' +
                                  ' OPT_ALGORITHM FROM CP_TS_PREDICTIONS' +
                                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                                    ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                                    ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                                    ' AND CAL_DATE IN ' + weekDates + 
                                    ' ORDER BY CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER';
        try {
            preOptimizedResults = await cds.run(sqlStrPreOptimized);
        }
        catch (exception) {
            console.log("sqlStrPreOptimized ", sqlStrPreOptimized);
            throw new Error(exception.toString());
        }
    
        
        let optimizationsTable = [];
        
        for (let disaggIdx = 0; disaggIdx < disAggregatedValues.length; disaggIdx++)
        {

            for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex ++)
            {
                let pid = PID_OPTIMIZED[pidIndex].PRIMARY_ID;


                let pidStr=pid.split('#');
                let locId = pidStr[0];
                let prodId = pidStr[1];
                let objDep = pidStr[2];
                let objCounter = pidStr[3];
                let disaggDate = disAggregatedValues[disaggIdx].WEEK_DATE;
                let disaggOptimized = disAggregatedValues[disaggIdx].RATIO*PID_OPTIMIZED[pidIndex].OPTIMIZED_PRIMARY_QTY;
                // let disaggPredicted = disAggregatedValues[disaggIdx].RATIO*PRIMARY_IDS[pidIndex].PREDICTED;
                // let disaggPredicted = PRIMARY_IDS[pidIndex].PREDICTED;

                var rowObj = { CAL_DATE : disaggDate, 
                    LOCATION_ID : locId,
                    PRODUCT_ID : prodId,
                    OBJ_TYPE: objType,
                    OBJ_DEP: objDep,
                    OBJ_COUNTER: objCounter,
                    MODEL_TYPE: modelType,
                    MODEL_VERSION : modelVersion,
                    MODEL_PROFILE: modelProfile,
                    VERSION : ibpVersion,
                    SCENARIO : ibpScenario,
                    PREDICTED: disaggOptimized,
                    PREDICTED_TIME: optimizedTime,
                    OPT_STARTTIME: PRIMARY_IDS[pidIndex].OPT_STARTTIME,
                    DELTA_TIME: PRIMARY_IDS[pidIndex].DELTA_TIME, 
                    PREDICTED_STATUS: 'SUCCESS',
                    // PRE_OPTIMIZED: disaggPredicted,
                    // PRE_OPTIMIZED_TIME: PRIMARY_IDS[pidIndex].PREDICTED_TIME,
                    OPT_ALGORITHM : ALGORITHM};
            
                    optimizationsTable.push(rowObj);
            }
        }
        let predictionsTable = [];
        for(let pIndex = 0; pIndex < preOptimizedResults.length; pIndex++)
        {
            if( (preOptimizedResults[pIndex].CAL_DATE == optimizationsTable[pIndex].CAL_DATE) &&
                (preOptimizedResults[pIndex].OBJ_DEP == optimizationsTable[pIndex].OBJ_DEP))
            {
                let rowObj = { CAL_DATE : optimizationsTable[pIndex].CAL_DATE, 
                    LOCATION_ID : optimizationsTable[pIndex].LOCATION_ID,
                    PRODUCT_ID : optimizationsTable[pIndex].PRODUCT_ID,
                    OBJ_TYPE: optimizationsTable[pIndex].OBJ_TYPE,
                    OBJ_DEP: optimizationsTable[pIndex].OBJ_DEP,
                    OBJ_COUNTER: optimizationsTable[pIndex].OBJ_COUNTER,
                    MODEL_TYPE: optimizationsTable[pIndex].MODEL_TYPE,
                    MODEL_VERSION : optimizationsTable[pIndex].MODEL_VERSION,
                    MODEL_PROFILE: optimizationsTable[pIndex].MODEL_PROFILE,
                    VERSION : optimizationsTable[pIndex].VERSION,
                    SCENARIO : optimizationsTable[pIndex].SCENARIO,
                    PREDICTED: optimizationsTable[pIndex].PREDICTED,
                    PREDICTED_TIME: optimizationsTable[pIndex].PREDICTED_TIME,
                    OPT_STARTTIME: optimizationsTable[pIndex].OPT_STARTTIME,
                    DELTA_TIME: optimizationsTable[pIndex].DELTA_TIME, 
                    PREDICTED_STATUS: optimizationsTable[pIndex].PREDICTED_STATUS,
                    PRE_OPTIMIZED: preOptimizedResults[pIndex].PRE_OPTIMIZED,
                    PRE_OPTIMIZED_TIME: preOptimizedResults[pIndex].PRE_OPTIMIZED_TIME,
                    OPT_ALGORITHM : optimizationsTable[pIndex].OPT_ALGORITHM};            
                    predictionsTable.push(rowObj);   
            }
            else
            {
                let rowObj = { CAL_DATE : preOptimizedResults[pIndex].CAL_DATE, 
                    LOCATION_ID : preOptimizedResults[pIndex].LOCATION_ID,
                    PRODUCT_ID : preOptimizedResults[pIndex].PRODUCT_ID,
                    OBJ_TYPE: preOptimizedResults[pIndex].OBJ_TYPE,
                    OBJ_DEP: preOptimizedResults[pIndex].OBJ_DEP,
                    OBJ_COUNTER: preOptimizedResults[pIndex].OBJ_COUNTER,
                    MODEL_TYPE: preOptimizedResults[pIndex].MODEL_TYPE,
                    MODEL_VERSION : preOptimizedResults[pIndex].MODEL_VERSION,
                    MODEL_PROFILE: preOptimizedResults[pIndex].MODEL_PROFILE,
                    VERSION : preOptimizedResults[pIndex].VERSION,
                    SCENARIO : preOptimizedResults[pIndex].SCENARIO,
                    PREDICTED: preOptimizedResults[pIndex].PREDICTED,
                    PREDICTED_TIME: preOptimizedResults[pIndex].PREDICTED_TIME,
                    OPT_STARTTIME: preOptimizedResults[pIndex].OPT_STARTTIME,
                    DELTA_TIME: preOptimizedResults[pIndex].DELTA_TIME, 
                    PREDICTED_STATUS: preOptimizedResults[pIndex].PREDICTED_STATUS,
                    PRE_OPTIMIZED: preOptimizedResults[pIndex].PRE_OPTIMIZED,
                    PRE_OPTIMIZED_TIME: preOptimizedResults[pIndex].PRE_OPTIMIZED_TIME,
                    OPT_ALGORITHM : preOptimizedResults[pIndex].OPT_ALGORITHM};            
                    predictionsTable.push(rowObj);   
            }
        }
        if(predictionsTable.length > 0)
        {
            cqnQuery = {UPSERT:{ into: { ref: ['CP_TS_PREDICTIONS'] }, entries:  predictionsTable }};
            try {
                await cds.run(cqnQuery);
            }
            catch(exception) {
                console.log("cqnQuery ", cqnQuery, "locId : ",loc_id, "prodId : ", prod_id, );
                throw new Error(exception.toString());
            }
        }

    }
    
    _nonlinear_generic_UniqueIDS = async function (LOCATION_ID, PRODUCT_ID, TYPE, 
        MODEL_VERSION, VERSION, SCENARIO, ALGORITHM, FACTOR, CAL_DATE,
        MODEL_TYPE, MODEL_PROFILE, UNIQUE_ID,CHAR_WEIGHTAGE)
    {
        // console.log("OPTIMIZATION BEGIN _nonlinear_generic_UniqueIDS", process.memoryUsage());

        console.log("_nonlinear_UniqueIDs_generic_UniqueIDS LOCATION_ID ", LOCATION_ID, "PRODUCT_ID ", PRODUCT_ID, "TYPE ", TYPE, "CAL_DATE ", CAL_DATE, "UNIQUE_ID", UNIQUE_ID,"CHAR_WEIGHTAGE",CHAR_WEIGHTAGE);

        let cal_date = CAL_DATE;
        this.CAL_DATE = CAL_DATE;

        let loc_id = LOCATION_ID;
        let prod_id = PRODUCT_ID;
        let objType = TYPE;
        let modelVersion = MODEL_VERSION;
        let ibpVersion = VERSION;
        let ibpScenario = SCENARIO;
        let algorithm = ALGORITHM;
        let modelType = MODEL_TYPE;
        let modelProfile = MODEL_PROFILE;


        let resultsByCharValNum;

 // SELECT DISTINCT CHARACTERISTICS AND CHARVALS OF THE PRODUCT
        let sqlStr = 'SELECT DISTINCT PBC.CHAR_NUM, IFC.CHARVAL_NUM' + 
                    ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
                    ' INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                    ' PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
                    ' AND PBC.LOCATION_ID = IFC.LOCATION_ID ' +
                    ' AND PBC.PRODUCT_ID = IFC.PRODUCT_ID ' +
                    ' AND PBC.CAL_DATE = IFC.WEEK_DATE ' +
                    // ' RIGHT JOIN V_CHARVAL AS CHVAL ON ' +
                    // ' PBC.CHAR_NUM = CHVAL.CHAR_NUM ' +
                    ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND "OBJ_TYPE" =  ' + "'" + objType + "'" +
                    ' AND PBC.MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
                    ' ORDER BY CHAR_NUM, CHARVAL_NUM';
        try {
                resultsByCharValNum = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

    //    console.log("_lpsolveUniqueIDs_generic_UniqueIDS sqlStr =",sqlStr);

        // console.log("_lpsolveUniqueIDs resultsByCharValNum length =",resultsByCharValNum.length);

        var resultsByCharNum;

        // SELECT DISTINCT CHARACTERISTICS  OF THE PRODUCT
        sqlStr = 'SELECT DISTINCT PBC.CHAR_NUM' + 
                ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
                ' INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                ' PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
                ' AND PBC.LOCATION_ID = IFC.LOCATION_ID ' +
                ' AND PBC.PRODUCT_ID = IFC.PRODUCT_ID ' +
                ' AND PBC.CAL_DATE = IFC.WEEK_DATE ' +
                ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                ' AND PBC.MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
                ' ORDER BY PBC.CHAR_NUM ';

        try {
            resultsByCharNum = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        // PREDICTED VALUES BY PRIMARY IDS (=OBJ_DEP+ '_' + OBJ_COUNTER)
        var results;
        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, OPT_STARTTIME, DELTA_TIME, PRE_OPTIMIZED, PRE_OPTIMIZED_TIME FROM CP_V_PREDICTIONS_BY_CHAR' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                    ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND "CAL_DATE" =  ' + "'" + cal_date + "'" +
                    ' ORDER BY LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER';
        try {
                results = await cds.run(sqlStr);
        }
        catch (exception) {
                console.log("sqlStr ", sqlStr);
                throw new Error(exception.toString());
        }
        // console.log("_lpsolveUniqueIDs sqlStr =",sqlStr);
        // console.log("_lpsolveUniqueIDs results =",results);

        var PRIMARY_IDS_PREDVALS = [];
        var PRIMARY_IDS = [];
        let optStartTime = new Date().toISOString();
        let deltaTime = results[0].DELTA_TIME;
        if( deltaTime == null)
        {
            deltaTime = results[0].PRE_OPTIMIZED_TIME;
        }
        for (let index = 0; index < results.length; index++)
        {
            let primary_id = results[index].LOCATION_ID + '#' + 
            results[index].PRODUCT_ID + '#' +
            results[index].OBJ_DEP + '#' +  results[index].OBJ_COUNTER;
            PRIMARY_IDS.push({"PRIMARY_ID": primary_id,  "PID_ENCODED": "P" + (index + 1),
                                "PREDICTED":results[index].PRE_OPTIMIZED,  "PREDICTED_TIME":results[index].PRE_OPTIMIZED_TIME,
                                "OPT_STARTTIME":optStartTime,"DELTA_TIME": deltaTime,
                                "RESTORE_TIME":results[index].OPT_STARTTIME
                            });

        }

        //    console.log("_lpsolveUniqueIDs PRIMARY_IDS =",PRIMARY_IDS);



        //    console.log("_lpsolveUniqueIDs PRIMARY_IDS_PREDVALS =",PRIMARY_IDS_PREDVALS);

        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, OPT_STARTTIME, DELTA_TIME, CHAR_NUM, CHARVAL_NUM, PRE_OPTIMIZED FROM CP_V_PREDICTIONS_BY_CHAR' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                    ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND "CAL_DATE" =  ' + "'" + cal_date + "'" +
                    ' ORDER BY LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, CHAR_NUM, CHARVAL_NUM';

        var predictedVals;
        try {
                predictedVals = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        //    console.log("_lpsolveUniqueIDs predictedVals =",predictedVals);



        for (let pvalIndex =0; pvalIndex < predictedVals.length; pvalIndex++)
        {
            let pvalId = predictedVals[pvalIndex].LOCATION_ID + '#' + 
            predictedVals[pvalIndex].PRODUCT_ID + '#' +
            predictedVals[pvalIndex].OBJ_DEP + '#' +  predictedVals[pvalIndex].OBJ_COUNTER;
            let pvalCharNum = predictedVals[pvalIndex].CHAR_NUM;
            let pvalCharValNum = predictedVals[pvalIndex].CHARVAL_NUM;

            PRIMARY_IDS_PREDVALS.push({"PRIMARY_ID": pvalId, "PID_ENCODED": "P" + (pvalIndex + 1), "CHAR_NUM": pvalCharNum, "CHARVAL_NUM": pvalCharValNum, "PREDICTED": predictedVals[pvalIndex].PRE_OPTIMIZED});

        }

        //    console.log("_lpsolveUniqueIDs PRIMARY_IDS_PREDVALS =",PRIMARY_IDS_PREDVALS);


        // for (let primaryIndex = 0; primaryIndex < PRIMARY_IDS.length; primaryIndex ++)
        // {

        //     lp.addColumn(PRIMARY_IDS[primaryIndex].PID_ENCODED,false,false);
        // }


        var CHARVAL_COUNTS = [];
        var LOC_PROD_ID = loc_id + '#' + prod_id;

        for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
        {
            CHARVAL_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID,  "CHAR_NUM": resultsByCharValNum[charNumIndex].CHAR_NUM, "CHARVAL_NUM" : resultsByCharValNum[charNumIndex].CHARVAL_NUM, "PREDICTED": 0});                  
        }
        //    console.log("_lpsolveUniqueIDs CHARVAL_COUNTS =",CHARVAL_COUNTS);

        // console.log(" Before Adding Variables for CHVAL_COUNTS")

        var CHARVAL_IDS = [];

        for (let charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx ++)
        {
            let variable = CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID + '-' + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM;
            CHARVAL_IDS.push({"CHARVAL_ID":variable, "CHARVAL_ID_ENCODED": "C" + (charvalIdx + 1)})
            // lp.addColumn(variable,false,false); 

        }

        // console.log(" After Adding Variables for CHARVAL_COUNTS")

        for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
        {
            for (let pidIndex = 0; pidIndex < PRIMARY_IDS_PREDVALS.length; pidIndex++)
            {


                if( (CHARVAL_COUNTS[charNumIndex].CHAR_NUM === PRIMARY_IDS_PREDVALS[pidIndex].CHAR_NUM) &&
                    (CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM === PRIMARY_IDS_PREDVALS[pidIndex].CHARVAL_NUM) )
                {

                    CHARVAL_COUNTS[charNumIndex].PREDICTED = CHARVAL_COUNTS[charNumIndex].PREDICTED + PRIMARY_IDS_PREDVALS[pidIndex].PREDICTED;
                }

            }
        }

        let UID_CHARVAL_MATRIX = [];
        for (var uidIdx = 0; uidIdx < PRIMARY_IDS.length; uidIdx++) {
            UID_CHARVAL_MATRIX[uidIdx]=[];
            for (var charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++) {
                UID_CHARVAL_MATRIX[uidIdx][charvalIdx] = 0;
            }
        }

        for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex++)
        {
            for (let pvalIndex = 0; pvalIndex < PRIMARY_IDS_PREDVALS.length; pvalIndex++)
            {
                if(PRIMARY_IDS[pidIndex].PRIMARY_ID === PRIMARY_IDS_PREDVALS[pvalIndex].PRIMARY_ID)
                {
                    for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
                    {

                        if( (CHARVAL_COUNTS[charNumIndex].CHAR_NUM === PRIMARY_IDS_PREDVALS[pvalIndex].CHAR_NUM) &&
                            (CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM === PRIMARY_IDS_PREDVALS[pvalIndex].CHARVAL_NUM) )
                        {
                            UID_CHARVAL_MATRIX[pidIndex][charNumIndex] = 1;
                        }

                    }
                }
            }
        }

        //    console.log("UID_CHARVAL_MATRIX ", UID_CHARVAL_MATRIX);





        // console.log("_lpsolveUniqueIDs CHARVAL_COUNTS =",CHARVAL_COUNTS);

        // console.log("_lpsolveUniqueIDs resultsByCharNum =",resultsByCharNum);


        var CHAR_COUNTS = [];
        for (let charIndex = 0; charIndex < resultsByCharNum.length; charIndex ++)
        {
            let charCount = 0;

            for (let charValIndex = 0; charValIndex < resultsByCharValNum.length; charValIndex++)   
            {
                if( resultsByCharNum[charIndex].CHAR_NUM === CHARVAL_COUNTS[charValIndex].CHAR_NUM)
                {
                    charCount = charCount + CHARVAL_COUNTS[charValIndex].PREDICTED;
                } 
            }
            CHAR_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": resultsByCharNum[charIndex].CHAR_NUM, "PREDICTED": charCount});              

        }



        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, "VERSION", "SCENARIO", CHAR_NUM, CHARVAL_NUM,  OPT_QTY '+
                    ' FROM CP_V_IBP_FCHARPLAN_BY_PRIMARY_CHARS' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND "WEEK_DATE" =  ' + "'" + cal_date + "'" +
                    ' AND "MODEL_VERSION" = ' + "'" + modelVersion + "'" +
                    ' ORDER BY LOCATION_ID, PRODUCT_ID, "VERSION", "SCENARIO", CHAR_NUM, CHARVAL_NUM';

        let ibpResultsByCharvalNum;
        try {
            ibpResultsByCharvalNum = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        // console.log("ibpResultsByCharvalNum ", ibpResultsByCharvalNum);
        let IBP_CHARVAL_COUNTS = [];


        // INITIALIZE SIZE OF IBP option quantities to be in sync with BTP predicted quantities
        for (let charvalIndex = 0; charvalIndex < CHARVAL_COUNTS.length; charvalIndex ++)
        {

            IBP_CHARVAL_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": CHARVAL_COUNTS[charvalIndex].CHAR_NUM, 
                                        "CHARVAL_NUM": CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM, "IBP_OPT_QTY": 0});              
        }

        // UPDATE IBP option quantities from ibpResultsByCharvalNum

        for (let charvalIndex = 0; charvalIndex < CHARVAL_COUNTS.length; charvalIndex ++)
        {
            for (let ibpIdx = 0; ibpIdx < ibpResultsByCharvalNum.length; ibpIdx ++)
            {

                if( (CHARVAL_COUNTS[charvalIndex].LOC_PROD_ID  == (ibpResultsByCharvalNum[ibpIdx].LOCATION_ID + '#' + ibpResultsByCharvalNum[ibpIdx].PRODUCT_ID )) &&
                    (CHARVAL_COUNTS[charvalIndex].CHAR_NUM  == ibpResultsByCharvalNum[ibpIdx].CHAR_NUM) &&
                    (CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM  == ibpResultsByCharvalNum[ibpIdx].CHARVAL_NUM) )
                {
                    IBP_CHARVAL_COUNTS[charvalIndex].CHAR_NUM = ibpResultsByCharvalNum[ibpIdx].CHAR_NUM;
                    IBP_CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM = ibpResultsByCharvalNum[ibpIdx].CHARVAL_NUM;
                    IBP_CHARVAL_COUNTS[charvalIndex].IBP_OPT_QTY = ibpResultsByCharvalNum[ibpIdx].OPT_QTY;
                }

            }
        }

        // console.log("IBP_CHARVAL_COUNTS = ", IBP_CHARVAL_COUNTS);

        let IBP_CHAR_COUNTS = [];
        // INITIALIZE SIZE OF IBP char quantities to be in sync with BTP predicted char quantities
        for (let charIndex = 0; charIndex < CHAR_COUNTS.length; charIndex ++)
        {

            IBP_CHAR_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": CHAR_COUNTS[charIndex].CHAR_NUM, "IBP_CHAR_QTY": 0});              
        }

        // UPDATE IBP option quantities from ibpResultsByCharvalNum

        for (let charIndex = 0; charIndex < CHAR_COUNTS.length; charIndex ++)
        {
            let charCount = 0;
            for (let charvalIdx = 0; charvalIdx < IBP_CHARVAL_COUNTS.length; charvalIdx ++)
            {
                if( (IBP_CHAR_COUNTS[charIndex].LOC_PROD_ID  == IBP_CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID) &&
                    (IBP_CHAR_COUNTS[charIndex].CHAR_NUM  == IBP_CHARVAL_COUNTS[charvalIdx].CHAR_NUM)  )
                {
                    IBP_CHAR_COUNTS[charIndex].IBP_CHAR_QTY = IBP_CHAR_COUNTS[charIndex].IBP_CHAR_QTY +
                                            Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY);

                }
            }
        }

        if ( IBP_CHAR_COUNTS.length == 0)
        {
            console.log("NOTHING to Optimize");
            // let startMilliSecs = new Date().getTime();
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs + 50;
            console.log("UNIQUE_ID ", UNIQUE_ID);
            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                            "'" + UNIQUE_ID + "'" + "," +
                                            "'" + 'COMPLETED' + "'" + "," +
                                            "'" + OptRunTime + "'" + "," +
                                            "'" +  this.MAX_DEVIATION + "'" + "," +
                                            "'" +  loc_id + "'" + "," +
                                            "'" +  prod_id + "'" + "," +
                                            "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';                     

            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return;
        }

        let ibp_total_qty = IBP_CHAR_COUNTS[0].IBP_CHAR_QTY;

        console.log("IBP_CHAR_COUNTS = ", IBP_CHAR_COUNTS);

        sqlStr = 'SELECT DISTINCT REF_PRODID FROM V_SALES_H WHERE PRODUCT_ID = ' + "'" + prod_id  + "'";
        let sqlResults;
        try {
            sqlResults = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
    
        // DEFAULT CHARVAL WEIGHTS ARE ALL INITIALIZED TO 1
        let charWeightResults = [];
    
        for (let charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++)
        {
            let weight = 1;
            // charWeightResults[charvalIdx] = 1;
            charWeightResults.push({"WEIGHTAGE":weight});
    
        }
    
        console.log("DEFAULT CHARVAL WEIGHTS ", charWeightResults);
    
        let totalWeight = 0;
        if (CHAR_WEIGHTAGE == true)
        {
    
            let charWeightsSql = ' SELECT DISTINCT CW.CHAR_NUM, IFC.CHARVAL_NUM, WEIGHTAGE FROM V_CHARGROUPWEIGHTAGE AS CW ' +
                                    'INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                                    'CW.CHAR_NUM = IFC.CHAR_NUM ' +
                                    ' WHERE CW.PRODUCT_ID = ' + "'" + sqlResults[0].REF_PRODID + "'" +
                                    ' AND IFC.PRODUCT_ID =' + "'" + prod_id + "'" +
                                    ' AND CHAR_TYPE = \'P\'' +
                                    ' ORDER BY CHAR_NUM, CHARVAL_NUM';
    
    
            try {
                charWeightResults = await cds.run(charWeightsSql);
            }
            catch (exception) {
                console.log("charWeightsSql ", charWeightsSql);
                throw new Error(exception.toString());
            }
            console.log("charWeightsSql ", charWeightsSql);
    
            console.log("charWeightResults ", charWeightResults,"charWeightResults[0].WEIGHTAGE:", parseInt(charWeightResults[0].WEIGHTAGE));

            for (let weightIdx = 0; weightIdx < charWeightResults.length; weightIdx++)
            {
                totalWeight = totalWeight + parseInt(charWeightResults[weightIdx].WEIGHTAGE);
            }
            console.log("totalWeight ", totalWeight);

        }
        else
        {
            totalWeight = 1;
        }

        let constraint_var = []; 
        let constraint_var_minus = [];


        for (var charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++)
        {
            // NLopt always expects constraints to be of the form myconstraint(x) ≤ 0

            // constraint_var.push({"CHARIDX": charvalIdx + 1, "CONSTANT": -Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY), "CHARVAL_ID_ENCODED": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "CHARVAL_ID_DERIVATIVE": -1}); 
            // constraint_var_minus.push({"CHARIDX": charvalIdx + 1, "CONSTANT": Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY), "CHARVAL_ID_ENCODED": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "CHARVAL_ID_DERIVATIVE": -1});
            let ibpOptQty = Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY);
            let ibpValue = 0;
            if (ibpOptQty != 0)
            {
                ibpValue = -1*ibpOptQty;
            }
            // constraint_var.push({"VARIDX": charvalIdx + 1 ,"TYPE": "KID", "VARIABLE": "K", "VALUE": -1 * Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY), "DERIVATIVE": 0});
            constraint_var.push({"VARIDX": charvalIdx + 1 ,"TYPE": "KID", "VARIABLE": "K", "VALUE": ibpValue, "DERIVATIVE": 0});

            constraint_var_minus.push({"VARIDX": charvalIdx + 1 ,"TYPE": "KID", "VARIABLE": "K", "VALUE": Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY), "DERIVATIVE": 0});
            
            constraint_var.push({"VARIDX": charvalIdx + 1 ,"TYPE": "CHID", "VARIABLE": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "VALUE": 1, "DERIVATIVE": -1});
            constraint_var_minus.push({"VARIDX": charvalIdx + 1 ,"TYPE": "CHID", "VARIABLE": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "VALUE": 1, "DERIVATIVE": -1});

            
            // constraint_var.push({"VARIDX": charvalIdx + 1, "CONSTANT": -Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY), "VARIABLE": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "DERIVATIVE": -1}); 
            // constraint_var_minus.push({"VARIDX": charvalIdx + 1, "CONSTANT": Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY), "VARIABLE": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "DERIVATIVE": -1});

            for (let uidIdx = 0; uidIdx < PRIMARY_IDS.length; uidIdx ++)
            {
                if(UID_CHARVAL_MATRIX[uidIdx][charvalIdx] === 1)
                {

                            
                    // constraint_var.push({"VARIDX": charvalIdx + 1 ,"PRIMARY_ID": PRIMARY_IDS[uidIdx].PRIMARY_ID, "VARIABLE": PRIMARY_IDS[uidIdx].PID_ENCODED, "DERIVATIVE": 1});
                    // constraint_var_minus.push({"VARIDX": charvalIdx + 1, "PRIMARY_ID": PRIMARY_IDS[uidIdx].PRIMARY_ID, "VARIABLE": PRIMARY_IDS[uidIdx].PID_ENCODED, "DERIVATIVE": -1});
                    
                    constraint_var.push({"VARIDX": charvalIdx + 1 ,"TYPE": "PID", "VARIABLE": PRIMARY_IDS[uidIdx].PID_ENCODED, "VALUE": 1, "DERIVATIVE": 1});
                    constraint_var_minus.push({"VARIDX": charvalIdx + 1 ,"TYPE": "PID", "VARIABLE": PRIMARY_IDS[uidIdx].PID_ENCODED, "VALUE": 1, "DERIVATIVE": -1});

                    // constraint_var.push({"VARIDX": charvalIdx + 1 ,"TYPE": "PID", "VARIABLE": PRIMARY_IDS[uidIdx].PID_ENCODED, "VALUE": charWeightResults[charvalIdx].WEIGHTAGE, "DERIVATIVE": charWeightResults[charvalIdx].WEIGHTAGE});
                    // constraint_var_minus.push({"VARIDX": charvalIdx + 1 ,"TYPE": "PID", "VARIABLE": PRIMARY_IDS[uidIdx].PID_ENCODED, "VALUE": charWeightResults[charvalIdx].WEIGHTAGE, "DERIVATIVE": -charWeightResults[charvalIdx].WEIGHTAGE});

                    // constraint_var.push({"VARIDX": charvalIdx + 1 ,"TYPE": "PID", "VARIABLE": PRIMARY_IDS[uidIdx].PID_ENCODED, "VALUE": 1, "DERIVATIVE": 1});
                    // constraint_var_minus.push({"VARIDX": charvalIdx + 1 ,"TYPE": "PID", "VARIABLE": PRIMARY_IDS[uidIdx].PID_ENCODED, "VALUE": 1, "DERIVATIVE": -1});

                }
            }   
        
        }

        sqlStr = 'SELECT SUM(PRE_OPTIMIZED) AS TOTAL_PREDICTED FROM V_CP_TS_PREDICTIONS_TELESCOPIC  ' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND CAL_DATE =  ' + "'" + cal_date + "'";

        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        let loc_prod_predicted = 0;

        if (results.length > 0)
        {
            loc_prod_predicted = results[0].TOTAL_PREDICTED;
        }

        if(loc_prod_predicted == 0)
        {
            console.log("Optimization will not be done, please check why loc_prod_predicted is ", loc_prod_predicted);
            // let endMilliSecs = new Date().getTime();
            // OptRunTime = endMilliSecs - startMilliSecs;
            // let startMilliSecs = new Date().getTime();
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs + 50;
            console.log("UNIQUE_ID ", UNIQUE_ID);

            console.log("UNIQUE_ID ", UNIQUE_ID);
            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                            "'" + UNIQUE_ID + "'" + "," +
                                            "'" + 'COMPLETED' + "'" + "," +
                                            "'" + OptRunTime + "'" + "," +
                                            "'" +  this.MAX_DEVIATION + "'" + "," +
                                            "'" +  loc_id + "'" + "," +
                                            "'" +  prod_id + "'" + "," +
                                            "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';        
                                            
            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("NON LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }
            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return;
        }
        sqlStr = 'SELECT QUANTITY FROM V_IBP_FUTUREDEMAND_TELESCOPIC  ' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND WEEK_DATE =  ' + "'" + cal_date + "'";
        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        let loc_prod_ibp_qty = 0;

        if (results.length > 0)
        {
            loc_prod_ibp_qty = results[0].QUANTITY;
        }

        if(loc_prod_ibp_qty == 0)
        {
            console.log("Optimization will not be done, please check why loc_prod_ibp_qty is ", loc_prod_ibp_qty);
            // let endMilliSecs = new Date().getTime();
            // OptRunTime = endMilliSecs - startMilliSecs;
            // console.log("UNIQUE_ID ", UNIQUE_ID);

            // let startMilliSecs = new Date().getTime();
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs + 50;
            console.log("UNIQUE_ID ", UNIQUE_ID);

            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                            "'" + UNIQUE_ID + "'" + "," +
                                            "'" + 'COMPLETED' + "'" + "," +
                                            "'" + OptRunTime + "'" + "," +
                                            "'" +  this.MAX_DEVIATION + "'" + "," +
                                            "'" +  loc_id + "'" + "," +
                                            "'" +  prod_id + "'" + "," +
                                            "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("NON LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }
            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return;
        }
        let min_qty_factor = 0;
        if( loc_prod_predicted >= loc_prod_ibp_qty)
        {
            min_qty_factor = FACTOR*loc_prod_ibp_qty/loc_prod_predicted;

        }
        else
        {
            min_qty_factor = FACTOR*loc_prod_predicted/loc_prod_ibp_qty;

        }

        console.log("loc_prod_predicted ", loc_prod_predicted, "loc_prod_ibp_qty =",loc_prod_ibp_qty,  "OptFactor =", FACTOR, "min_qty_factor", min_qty_factor);
        let pid_total_constraint_var = [];
        let pid_constraint_var = [];

        // pid_total_constraint_var.push({"VARIDX": 1,"CONSTRAINT_NAME": "TOTAL", "CONSTRAINT_TYPE" : "EQUALITY", "VARIABLE": "K", "VALUE": ibp_total_qty, "DERIVATIVE": 0});
        pid_total_constraint_var.push({"VARIDX": 1,"CONSTRAINT_NAME": "TOTAL", "CONSTRAINT_TYPE" : "EQUALITY", "VARIABLE": "K", "VALUE": -ibp_total_qty, "DERIVATIVE": 0});

        for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex++)
        {
            // let variable = PRIMARY_IDS[pidIndex].PRIMARY_ID;
            // variable = variable.replace(/'/g,'');
            pid_total_constraint_var.push({"VARIDX": 1, "CONSTRAINT_NAME": "TOTAL", "CONSTRAINT_TYPE" : "EQUALITY", "PRIMARY_ID": PRIMARY_IDS[pidIndex].PRIMARY_ID, "VARIABLE": PRIMARY_IDS[pidIndex].PID_ENCODED, "VALUE": 1, "DERIVATIVE": -1});
            
            pid_constraint_var.push({"VARIDX": pidIndex+1, "CONSTRAINT_NAME": "MINIMUM", "CONSTRAINT_TYPE" : "INEQUALITY", "PRIMARY_ID": PRIMARY_IDS[pidIndex].PRIMARY_ID, "VARIABLE": 'K', "VALUE": min_qty_factor*PRIMARY_IDS[pidIndex].PREDICTED,"DERIVATIVE": 0})
            // pid_constraint_var.push({"VARIDX": pidIndex+1, "CONSTRAINT_NAME": "MINIMUM", "CONSTRAINT_TYPE" : "INEQUALITY", "PRIMARY_ID": PRIMARY_IDS[pidIndex].PRIMARY_ID, "VARIABLE": PRIMARY_IDS[pidIndex].PID_ENCODED, "VALUE": 1,"DERIVATIVE": -1})
            pid_constraint_var.push({"VARIDX": pidIndex+1, "CONSTRAINT_NAME": "MINIMUM", "CONSTRAINT_TYPE" : "INEQUALITY", "PRIMARY_ID": PRIMARY_IDS[pidIndex].PRIMARY_ID, "VARIABLE": PRIMARY_IDS[pidIndex].PID_ENCODED, "VALUE": 1,"DERIVATIVE": 1})

            // pid_constraint_var.push({"VARIDX": pidIndex+1, "CONSTRAINT_NAME": "MINIMUM", "CONSTRAINT_TYPE" : "INEQUALITY", "MIN_QTY" : min_qty_factor*PRIMARY_IDS[pidIndex].PREDICTED, "PRIMARY_ID": PRIMARY_IDS[pidIndex].PRIMARY_ID, "VARIABLE": PRIMARY_IDS[pidIndex].PID_ENCODED, "VALUE": 1,"DERIVATIVE": -1})

        }

        // pid_total_constraint_var.push({"CONSTRAINT_NAME": "TOTAL", "CONSTRAINT_TYPE" : "EQUALITY", "VARIABLE": "K", "VALUE": ibp_total_qty, "DERIVATIVE": 0});

        // console.log("AFTER // ADD CONSTRAINTS ON PRIMARY IDS")


        // console.log("AFTER  // ADD PRIMARY ID VALUES WHOSE VALUES ARE TO BE ESTIMATED BY SOLVER")





        /***************/


        let ibp_planned_quantities = [];
        let btp_predicted_quantities = [];
        let ibp_penalties =[];
        for (let ibpIdx = 0; ibpIdx < IBP_CHARVAL_COUNTS.length; ibpIdx++)
        {
            ibp_planned_quantities[ibpIdx] = IBP_CHARVAL_COUNTS[ibpIdx].IBP_OPT_QTY;
            btp_predicted_quantities[ibpIdx] = CHARVAL_COUNTS[ibpIdx].PREDICTED;

        }


        console.log("ibp_planned_quantities ", ibp_planned_quantities);
        console.log("btp_predicted_quantities ", btp_predicted_quantities);


        // let objective = new Row();
        let objective = [];

        for (var charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++)
        {
            // objective.push({"CHARVAL_ID_ENCODED": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "CHARVAL_ID_DERIVATIVE": 1});
            let normalizedWeight = parseInt(charWeightResults[charvalIdx].WEIGHTAGE)/totalWeight;
            objective.push({"VARIDX": 1, "CONSTRAINT_TYPE": "OBJECTIVE", "VARIABLE": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "VALUE": normalizedWeight, "DERIVATIVE": normalizedWeight});

            // objective.push({"VARIDX": 1, "CONSTRAINT_TYPE": "OBJECTIVE", "VARIABLE": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "VALUE": 1, "DERIVATIVE": 1});
            // objective.push({"VARIDX": 1, "CONSTRAINT_TYPE": "OBJECTIVE", "VARIABLE": CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED, "VALUE": 100, "DERIVATIVE": 100});

            // CHARVAL_IDS.push({"CHARVAL_ID":variable, "CHARVAL_ID_ENCODED": "C" + charvalIdx})

        }

        // console.log("objective = ",objective);
        // console.log("pid_total_constraint_var = ",pid_total_constraint_var);
        // console.log("pid_constraint Minimum = ",pid_constraint_var);
        // console.log("constraint_var = ",constraint_var);
        // console.log("constraint_var_minus = ",constraint_var_minus);

        let AllConstraints = [];

        // let new_constraint_data = await OptUtilities._initialize_constraints_data(PRIMARY_IDS, CHARVAL_IDS)
        let new_constraint_data = await this._initialize_constraints_data(PRIMARY_IDS, CHARVAL_IDS)

        let next_varIdx =  objective[0].VARIDX;
        let current_varidx = objective[0].VARIDX;
        let constraints_count = 0;


        for (let constraintIdx = 0; constraintIdx < objective.length; constraintIdx++)
        {
            next_varIdx = objective[constraintIdx].VARIDX;

            // console.log( "next_varIdx ", next_varIdx, "current_varidx ", current_varidx, "constraintIdx", constraintIdx)

            if (next_varIdx === current_varidx)
            {
                for (let varIdx = 0; varIdx < new_constraint_data.length; varIdx++)
                {
                    constraints_count ++;
                    if(new_constraint_data[varIdx].VARIABLE == objective[constraintIdx].VARIABLE)
                    {
                        new_constraint_data[varIdx].VALUE = objective[constraintIdx].VALUE;
                        new_constraint_data[varIdx].DERIVATIVE = objective[constraintIdx].DERIVATIVE;

                    }
                }

            }
            else
            {

                AllConstraints.push({"CONSTRAINT_TYPE":"OBJECTIVE", "CONSTRAINT_DATA":new_constraint_data})

                new_constraint_data = await this._initialize_constraints_data(PRIMARY_IDS, CHARVAL_IDS)


                current_varidx = objective[constraintIdx].VARIDX;

                if(new_constraint_data[new_constraint_data.length-1].VARIABLE == objective[constraintIdx].VARIABLE)
                {
                    new_constraint_data[new_constraint_data.length-1].VALUE = objective[constraintIdx].VALUE;
                    new_constraint_data[new_constraint_data.length-1].DERIVATIVE = objective[constraintIdx].DERIVATIVE;
                }
        
            }
        
        }
        // PUSH data for last Variable
        AllConstraints.push({"CONSTRAINT_TYPE":"OBJECTIVE", "CONSTRAINT_DATA":new_constraint_data})



        //************************BEGIN OF TOTAL CONSTRAINT **************/

        new_constraint_data = await this._initialize_constraints_data(PRIMARY_IDS, CHARVAL_IDS)

        next_varIdx =  pid_total_constraint_var[0].VARIDX;
        current_varidx = pid_total_constraint_var[0].VARIDX;


        // TOTAL constraint_var
        for (let constraintIdx = 0; constraintIdx < pid_total_constraint_var.length; constraintIdx++)
        {
            next_varIdx = pid_total_constraint_var[constraintIdx].VARIDX;

            // console.log( "next_varIdx ", next_varIdx, "current_varidx ", current_varidx, "constraintIdx", constraintIdx)

            if (next_varIdx === current_varidx)
            {
                for (let varIdx = 0; varIdx < new_constraint_data.length; varIdx++)
                {
                    constraints_count ++;
                    if(new_constraint_data[varIdx].VARIABLE == pid_total_constraint_var[constraintIdx].VARIABLE)
                    {
                        new_constraint_data[varIdx].VALUE = pid_total_constraint_var[constraintIdx].VALUE;
                        new_constraint_data[varIdx].DERIVATIVE = pid_total_constraint_var[constraintIdx].DERIVATIVE;

                    }
                }

            }
            else
            {

                AllConstraints.push({"CONSTRAINT_TYPE":"EQUALITY", "CONSTRAINT_DATA":new_constraint_data})

                new_constraint_data = await this._initialize_constraints_data(PRIMARY_IDS, CHARVAL_IDS)


                current_varidx = pid_total_constraint_var[constraintIdx].VARIDX;

                if(new_constraint_data[new_constraint_data.length-1].VARIABLE == pid_total_constraint_var[constraintIdx].VARIABLE)
                {
                    new_constraint_data[new_constraint_data.length-1].VALUE = pid_total_constraint_var[constraintIdx].VALUE;
                    new_constraint_data[new_constraint_data.length-1].DERIVATIVE = pid_total_constraint_var[constraintIdx].DERIVATIVE;
                }
        
            }
        
        }
        // PUSH data for last Variable
        AllConstraints.push({"CONSTRAINT_TYPE":"EQUALITY", "CONSTRAINT_DATA":new_constraint_data})

        //************************END  OF TOTAL CONSTRAINT **************/

        //************************BEGIN  OF CONSTRAINT MINIMUM **************/

        new_constraint_data = await this._initialize_constraints_data(PRIMARY_IDS, CHARVAL_IDS)

        next_varIdx =  pid_constraint_var[0].VARIDX;
        current_varidx = pid_constraint_var[0].VARIDX;


        // pid_constraint_var
        for (let constraintIdx = 0; constraintIdx < pid_constraint_var.length; constraintIdx++)
        {
            next_varIdx = pid_constraint_var[constraintIdx].VARIDX;

            // console.log( "next_varIdx ", next_varIdx, "current_varidx ", current_varidx, "constraintIdx", constraintIdx)

            if (next_varIdx === current_varidx)
            {
                for (let varIdx = 0; varIdx < new_constraint_data.length; varIdx++)
                {
                    constraints_count ++;
                    if(new_constraint_data[varIdx].VARIABLE == pid_constraint_var[constraintIdx].VARIABLE)
                    {
                        new_constraint_data[varIdx].VALUE = pid_constraint_var[constraintIdx].VALUE;
                        new_constraint_data[varIdx].DERIVATIVE = pid_constraint_var[constraintIdx].DERIVATIVE;

                    }
                }

            }
            else
            {

                AllConstraints.push({"CONSTRAINT_TYPE":"INEQUALITY_MINIMUM", "CONSTRAINT_DATA":new_constraint_data})

                new_constraint_data = await this._initialize_constraints_data(PRIMARY_IDS, CHARVAL_IDS)


                current_varidx = pid_constraint_var[constraintIdx].VARIDX;

                if(new_constraint_data[new_constraint_data.length-1].VARIABLE == pid_constraint_var[constraintIdx].VARIABLE)
                {
                    new_constraint_data[new_constraint_data.length-1].VALUE = pid_constraint_var[constraintIdx].VALUE;
                    new_constraint_data[new_constraint_data.length-1].DERIVATIVE = pid_constraint_var[constraintIdx].DERIVATIVE;
                }
        
            }
        
        }
        // PUSH data for last Variable
        AllConstraints.push({"CONSTRAINT_TYPE":"INEQUALITY_MINIMUM", "CONSTRAINT_DATA":new_constraint_data})

        //************************END  OF CONSTRAINT MINIMUM **************/


        //************************BEGIN  OF CONSTRAINT PLUS **************/

        new_constraint_data = await this._initialize_constraints_data(PRIMARY_IDS, CHARVAL_IDS)

        next_varIdx =  constraint_var[0].VARIDX;
        current_varidx = constraint_var[0].VARIDX;

        // let constraints_count = 0;

        // constraint_var
        for (let constraintIdx = 0; constraintIdx < constraint_var.length; constraintIdx++)
        {
            next_varIdx = constraint_var[constraintIdx].VARIDX;

            // console.log( "next_varIdx ", next_varIdx, "current_varidx ", current_varidx, "constraintIdx", constraintIdx)

            if (next_varIdx === current_varidx)
            {
                for (let varIdx = 0; varIdx < new_constraint_data.length; varIdx++)
                {
                    constraints_count ++;
                    // console.log( "varIdx ", varIdx, "constraintIdx ", constraintIdx)
                    // console.log("constraintIdx", constraintIdx,"new_constraint_data[varIdx].VARIABLE", new_constraint_data[varIdx].VARIABLE, "constraint_var[constraintIdx].VARIABLE", constraint_var[constraintIdx].VARIABLE );
                    if(new_constraint_data[varIdx].VARIABLE == constraint_var[constraintIdx].VARIABLE)
                    {
                        new_constraint_data[varIdx].VALUE = constraint_var[constraintIdx].VALUE;
                        new_constraint_data[varIdx].DERIVATIVE = constraint_var[constraintIdx].DERIVATIVE;

                    }
                }

            }
            else
            {

                AllConstraints.push({"CONSTRAINT_TYPE":"INEQUALITY", "CONSTRAINT_DATA":new_constraint_data})

                new_constraint_data = await this._initialize_constraints_data(PRIMARY_IDS, CHARVAL_IDS)


                current_varidx = constraint_var[constraintIdx].VARIDX;

                if(new_constraint_data[new_constraint_data.length-1].VARIABLE == constraint_var[constraintIdx].VARIABLE)
                {
                    new_constraint_data[new_constraint_data.length-1].VALUE = constraint_var[constraintIdx].VALUE;
                    new_constraint_data[new_constraint_data.length-1].DERIVATIVE = constraint_var[constraintIdx].DERIVATIVE;
                }
        
            }
        
        }
        // PUSH data for last Variable
        AllConstraints.push({"CONSTRAINT_TYPE":"INEQUALITY", "CONSTRAINT_DATA":new_constraint_data})

        //************************END  OF CONSTRAINT PLUS **************/

        //************************BEGIN  OF CONSTRAINT MINUS **************/

        new_constraint_data = await this._initialize_constraints_data(PRIMARY_IDS, CHARVAL_IDS)

        next_varIdx =  constraint_var_minus[0].VARIDX;
        current_varidx = constraint_var_minus[0].VARIDX;

        // constraint_var_minus
        for (let constraintIdx = 0; constraintIdx < constraint_var_minus.length; constraintIdx++)
        {
            next_varIdx = constraint_var_minus[constraintIdx].VARIDX;
            if (next_varIdx === current_varidx)
            {
                for (let varIdx = 0; varIdx < new_constraint_data.length; varIdx++)
                {
                    constraints_count ++;
                    // console.log( "varIdx ", varIdx, "constraintIdx ", constraintIdx)

                    if(new_constraint_data[varIdx].VARIABLE == constraint_var_minus[constraintIdx].VARIABLE)
                    {
                        new_constraint_data[varIdx].VALUE = constraint_var_minus[constraintIdx].VALUE;
                        new_constraint_data[varIdx].DERIVATIVE = constraint_var_minus[constraintIdx].DERIVATIVE;

                    }
                }

            }
            else
            {

                AllConstraints.push({"CONSTRAINT_TYPE":"INEQUALITY", "CONSTRAINT_DATA":new_constraint_data})

                new_constraint_data = await this._initialize_constraints_data(PRIMARY_IDS, CHARVAL_IDS)

                current_varidx = constraint_var_minus[constraintIdx].VARIDX;

                if(new_constraint_data[new_constraint_data.length-1].VARIABLE == constraint_var_minus[constraintIdx].VARIABLE)
                {
                    new_constraint_data[new_constraint_data.length-1].VALUE = constraint_var_minus[constraintIdx].VALUE;
                    new_constraint_data[new_constraint_data.length-1].DERIVATIVE = constraint_var_minus[constraintIdx].DERIVATIVE;
                }
        
            }
        
        }
        // PUSH data for last Variable
        AllConstraints.push({"CONSTRAINT_TYPE":"INEQUALITY", "CONSTRAINT_DATA":new_constraint_data})
        // console.log("AllConstraints ", AllConstraints)
        //************************END  OF CONSTRAINT MINUS **************/

        // for (let constraintsIdx = 0; constraintsIdx < AllConstraints.length; constraintsIdx++)
        // {
        //     console.log("AllConstraints[",constraintsIdx,"].CONSTRAINT_TYPE", AllConstraints[constraintsIdx].CONSTRAINT_TYPE)
        //     console.log("AllConstraints[",constraintsIdx,"].CONSTRAINT_DATA", AllConstraints[constraintsIdx].CONSTRAINT_DATA)

        // }

        const rp = require('request-promise');

        //    var pythonSvc = process.env.python_srv_url + "/test";
        // var pythonSvc = "https://pythonapp.cfapps.us10.hana.ondemand.com/nlopt";
        // var pythonSvc =  "https://polestar-prod-k7w0np0s-prod-config-products-py3srv.cfapps.eu10-004.hana.ondemand.com/nlopt";
        var pythonSvc = process.env.python_srv_url + "/nlopt";

        // console.log(" Python Service URL ", pythonSvc);
        const nlOptTimeout = 120000;
        var options;
        options = {
            'method': 'POST',
            'url': pythonSvc,
            'headers': {
                'Content-Type': 'application/json'
        },
        'timeout': nlOptTimeout,

        body: JSON.stringify({
            "Algorithm" : ALGORITHM,
            "OptFactor" : FACTOR,
            "Constraints" : AllConstraints
        })

        };

        let ret_response ="";
        let error = false;

        console.log('_postPythonRequest Request Time = ', new Date());
        let startMilliSecs = new Date().getTime();

        await rp(options)
        .then(function (response) {
            console.log('_postPythonRequest Response Time = ', new Date());
            console.log('PYTHONSVC Response = ', response);

            // console.log('Response   = ', response);
            ret_response = JSON.parse(response);
            // ret_response = response;
            
        })
        .catch(function (err) {
            console.log('_postPythonRequest - Error ', err);
            ret_response = err;
            error = true;

        });
        let endMilliSecs = new Date().getTime();
        let OptRunTime = endMilliSecs - startMilliSecs;

        if( error == true)
        {
            console.log("UNIQUE_ID ", UNIQUE_ID);
            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                            "'" + UNIQUE_ID + "'" + "," +
                                            "'" + 'COMPLETED' + "'" + "," +
                                            "'" + OptRunTime + "'" + "," +
                                            "'" +  this.MAX_DEVIATION + "'" + "," +
                                            "'" +  loc_id + "'" + "," +
                                            "'" +  prod_id + "'" + "," +
                                            "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("NON LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return;
        }
        console.log("ret_response ", ret_response)

            // PRIMARY_IDS.push({"PRIMARY_ID": primary_id,  "PID_ENCODED": "P" + (index + 1),"PREDICTED":results[index].PRE_OPTIMIZED,  "PREDICTED_TIME":results[index].PRE_OPTIMIZED_TIME});


        var PID_OPTIMIZED = [];
        let PID_OPTIMIZED_SUM = 0;
        let pidVals= JSON.parse(ret_response)
        console.log("ret_response ", "P1 ", pidVals.P1,  "P2 ",pidVals.P2,"P3 ", pidVals.P3, "P4 ",pidVals.P4)
        for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex ++)
        {
            let pid = PRIMARY_IDS[pidIndex].PID_ENCODED;
            let optimized_qty = pidVals[pid]
            PID_OPTIMIZED.push({"PRIMARY_ID": PRIMARY_IDS[pidIndex].PRIMARY_ID, "OPTIMIZED_PRIMARY_QTY" : optimized_qty});
            PID_OPTIMIZED_SUM = PID_OPTIMIZED_SUM + optimized_qty;
        }
        // console.log("PRIMARY_IDS", PRIMARY_IDS);

        // console.log("PID_OPTIMIZED", PID_OPTIMIZED);
        console.log("PID_OPTIMIZED_SUM", PID_OPTIMIZED_SUM);




        // Initialize Revized PRIMARY ID Predicted values and then update with  PID_OPTIMIZED
        var OPTIMIZED_PRIMARY_IDS_PREDVALS = [];
        // console.log("INIT REVISED_PRIMARY_IDS_PREDVALS = ", REVISED_PRIMARY_IDS_PREDVALS);   
        for (let pidIndex = 0; pidIndex < PRIMARY_IDS_PREDVALS.length; pidIndex++)
        {

            OPTIMIZED_PRIMARY_IDS_PREDVALS.push({"PRIMARY_ID":PRIMARY_IDS_PREDVALS[pidIndex].PRIMARY_ID,
                        "CHAR_NUM":PRIMARY_IDS_PREDVALS[pidIndex].CHAR_NUM,
                        "CHARVAL_NUM":PRIMARY_IDS_PREDVALS[pidIndex].CHARVAL_NUM,
                        "OPTIMIZED_PRIMARY_QTY":0});


        }

        for (let revIndex = 0; revIndex < OPTIMIZED_PRIMARY_IDS_PREDVALS.length; revIndex++)
        {
            for (let pcalcIndex = 0; pcalcIndex < PID_OPTIMIZED.length; pcalcIndex++)
            {
                if ( (OPTIMIZED_PRIMARY_IDS_PREDVALS[revIndex].PRIMARY_ID == PID_OPTIMIZED[pcalcIndex].PRIMARY_ID))
                {

                    OPTIMIZED_PRIMARY_IDS_PREDVALS[revIndex].OPTIMIZED_PRIMARY_QTY =  PID_OPTIMIZED[pcalcIndex].OPTIMIZED_PRIMARY_QTY;
                }
            }
        }

        //    console.log("OPTIMIZED_PRIMARY_IDS_PREDVALS ", OPTIMIZED_PRIMARY_IDS_PREDVALS);

        let OPTIMIZED_CHARVAL_COUNTS = [];

        for (let charNumIndex = 0; charNumIndex < CHARVAL_COUNTS.length; charNumIndex++)
        {

            OPTIMIZED_CHARVAL_COUNTS.push({"LOC_PROD_ID":CHARVAL_COUNTS[charNumIndex].LOC_PROD_ID, 
                "CHAR_NUM": CHARVAL_COUNTS[charNumIndex].CHAR_NUM, 
                "CHARVAL_NUM": CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM,
                "OPTIMIZED_CHAR_QTY": 0});
        }
        // console.log("INITIALIZED OPTIMIZED_CHARVAL_COUNTS = ", OPTIMIZED_CHARVAL_COUNTS);


        for (let revcharNumIndex = 0; revcharNumIndex < OPTIMIZED_CHARVAL_COUNTS.length; revcharNumIndex++)
        {
            for (let revpidvalIdx = 0; revpidvalIdx < OPTIMIZED_PRIMARY_IDS_PREDVALS.length; revpidvalIdx++)
            {
                let primaryId = OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].PRIMARY_ID;
                let locprodId = OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].LOC_PROD_ID;

                if (primaryId.includes(locprodId) &&
                ( OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].CHAR_NUM == OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].CHAR_NUM) &&
                ( OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].CHARVAL_NUM == OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].CHARVAL_NUM))
                {
                    OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].OPTIMIZED_CHAR_QTY = 
                    OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].OPTIMIZED_CHAR_QTY + 
                    OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].OPTIMIZED_PRIMARY_QTY;

                }
            }
        }
        // console.log("UPDATED OPTIMIZED_CHARVAL_COUNTS = ", OPTIMIZED_CHARVAL_COUNTS);

        let btp_optimized_char_quantities = [];
        for (let revIdx = 0; revIdx < OPTIMIZED_CHARVAL_COUNTS.length; revIdx++)
        {
            btp_optimized_char_quantities[revIdx] = OPTIMIZED_CHARVAL_COUNTS[revIdx].OPTIMIZED_CHAR_QTY;
        }

        var tableObj = [];	

        for (let index =0; index < btp_optimized_char_quantities.length; index++)
        {


            let pred_dev = 0;
            let pred_post_dev = 0;
            let normalized_dev = 0;
            if (ibp_planned_quantities[index] != 0)
            {
                pred_dev = (100*Math.abs(ibp_planned_quantities[index]-btp_predicted_quantities[index])/ibp_planned_quantities[index]).toFixed(2);
                pred_post_dev = (100*Math.abs(ibp_planned_quantities[index]-btp_optimized_char_quantities[index])/ibp_planned_quantities[index]).toFixed(2);
                normalized_dev = 100*Math.abs(ibp_planned_quantities[index]-btp_optimized_char_quantities[index])/loc_prod_ibp_qty;
            }

            let charNum = CHARVAL_COUNTS[index].CHAR_NUM;
            let charvalNum = CHARVAL_COUNTS[index].CHARVAL_NUM;
            var rowObj = { CAL_DATE : cal_date, 
            LOCATION_ID : loc_id,
            PRODUCT_ID : prod_id,
            MODEL_VERSION : modelVersion,
            VERSION : ibpVersion,
            SCENARIO : ibpScenario,
            ALGORITHM : algorithm,
            CHAR_NUM :  charNum ,
            CHARVAL_NUM :  charvalNum ,
            PREDICTED_QTY : (btp_predicted_quantities[index]).toFixed(4),
            IBP_PLANNED_QTY : ibp_planned_quantities[index],
            BTP_REVISED_QTY : (btp_optimized_char_quantities[index]).toFixed(2),
            PREDICTED_DEVIATION: pred_dev, 
            POST_PREDICTED_DEVIATION : pred_post_dev,
            NORMALIZED_DEVIATION : normalized_dev};

            tableObj.push(rowObj);


        }
        sqlStr = 'DELETE FROM CP_VC_PREDICTIONS_OPTIMIZED ' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND ALGORITHM =  ' + "'" + algorithm + "'" +
                ' AND "CAL_DATE" =  ' + "'" + cal_date + "'";
        try {
            await cds.run(sqlStr);
            //  console.log("sqlstr = ", sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        // console.log("tableObj ", tableObj);
        let cqnQuery = {UPSERT:{ into: { ref: ['CP_VC_PREDICTIONS_OPTIMIZED'] }, entries:  tableObj }};

        await cds.run(cqnQuery);

        var optimizedTime = new Date().toISOString();
        sqlStr = ' SELECT PERIODSTART, WEEKS FROM V_TELESCOPIC_WEEKS_PER_PERIOD ' +
                        ' WHERE PERIODSTART = ' + "'" + cal_date + "'" ;
        let telescopicWeeks;
        try {
            telescopicWeeks = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log(" telescopicWeeks sqlStr ", sqlStr,  "locId : ",loc_id, "prodId : ", prod_id);
            throw new Error(exception.toString());
        }
        

        let weekDates = '(';
        let dateStr = telescopicWeeks[0].PERIODSTART; //'2025-05-31';
        let numberOfWeeks = telescopicWeeks[0].WEEKS;
        for (let weekIdx = 0; weekIdx < numberOfWeeks ; weekIdx++)
        {
            const inputDate = new Date(dateStr);
            inputDate.setDate(inputDate.getDate() + 7*weekIdx);
            const result = inputDate.toISOString().split('T')[0];
            if(weekIdx < numberOfWeeks - 1)
                weekDates = weekDates + "'" + result + "'" + ",";
            else
                weekDates =  weekDates +  "'" + result + "'"  + ")";
        }

        console.log("weekDate ", weekDates);
        let ibpQtysAggResults;
        sqlStr = ' SELECT  SUM(QUANTITY) AS QUANTITY FROM CP_IBP_FUTUREDEMAND ' +
                    ' WHERE WEEK_DATE IN ' + weekDates + 
                ' AND LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" ;
        try {
            ibpQtysAggResults = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("ibpQtysAggResults sqlStr ", sqlStr, "locId : ",loc_id, "prodId : ", prod_id);
            throw new Error(exception.toString());
        }
        console.log("ibpQtysAggResults ", ibpQtysAggResults);

        let ibpQtysResults;
        sqlStr = ' SELECT DISTINCT WEEK_DATE, QUANTITY FROM CP_IBP_FUTUREDEMAND ' +
                    ' WHERE WEEK_DATE IN ' + weekDates + 
                    ' AND LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" ;
        try {
            ibpQtysResults = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log(" ibpQtysResults sqlStr ", sqlStr, "locId : ",loc_id, "prodId : ", prod_id);
            throw new Error(exception.toString());
        }
        console.log("ibpQtysResults ", ibpQtysResults);
        let disAggregatedValues = [];
        for(let ratioIdx = 0; ratioIdx < ibpQtysResults.length; ratioIdx ++)
        {
            let ratio = ibpQtysResults[ratioIdx].QUANTITY/ibpQtysAggResults[0].QUANTITY;
            disAggregatedValues.push({WEEK_DATE:ibpQtysResults[ratioIdx].WEEK_DATE,
                                        QUANTITY:ibpQtysResults[ratioIdx].QUANTITY,
                                        RATIO:ratio});
        }

        console.log("disAggregatedValues ", disAggregatedValues);
        let preOptimizedResults = [];
        let sqlStrPreOptimized = 'SELECT DISTINCT CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_TYPE, OBJ_DEP, OBJ_COUNTER, ' +
                                  'MODEL_TYPE, MODEL_VERSION, MODEL_PROFILE, VERSION, SCENARIO, PREDICTED, PREDICTED_TIME, ' +
                                  ' OPT_STARTTIME, DELTA_TIME, PREDICTED_STATUS, PRE_OPTIMIZED, PRE_OPTIMIZED_TIME, ' +
                                  ' OPT_ALGORITHM FROM CP_TS_PREDICTIONS' +
                                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                                    ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                                    ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                                    ' AND CAL_DATE IN ' + weekDates + 
                                    ' ORDER BY CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER';
        try {
            preOptimizedResults = await cds.run(sqlStrPreOptimized);
        }
        catch (exception) {
            console.log("sqlStrPreOptimized ", sqlStrPreOptimized);
            throw new Error(exception.toString());
        }
    
        
        let optimizationsTable = [];
                    

        
        for (let disaggIdx = 0; disaggIdx < disAggregatedValues.length; disaggIdx++)
        {

            for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex ++)
            {
                let pid = PID_OPTIMIZED[pidIndex].PRIMARY_ID;


                let pidStr=pid.split('#');
                let locId = pidStr[0];
                let prodId = pidStr[1];
                let objDep = pidStr[2];
                let objCounter = pidStr[3];
                let disaggDate = disAggregatedValues[disaggIdx].WEEK_DATE;
                let disaggOptimized = disAggregatedValues[disaggIdx].RATIO*PID_OPTIMIZED[pidIndex].OPTIMIZED_PRIMARY_QTY;
                // let disaggPredicted = disAggregatedValues[disaggIdx].RATIO*PRIMARY_IDS[pidIndex].PREDICTED;
                // let disaggPredicted = PRIMARY_IDS[pidIndex].PREDICTED;
                var rowObj = { CAL_DATE : disaggDate, 
                    LOCATION_ID : locId,
                    PRODUCT_ID : prodId,
                    OBJ_TYPE: objType,
                    OBJ_DEP: objDep,
                    OBJ_COUNTER: objCounter,
                    MODEL_TYPE: modelType,
                    MODEL_VERSION : modelVersion,
                    MODEL_PROFILE: modelProfile,
                    VERSION : ibpVersion,
                    SCENARIO : ibpScenario,
                    PREDICTED: disaggOptimized,
                    PREDICTED_TIME: optimizedTime,
                    OPT_STARTTIME: PRIMARY_IDS[pidIndex].OPT_STARTTIME,
                    DELTA_TIME: PRIMARY_IDS[pidIndex].DELTA_TIME, 
                    PREDICTED_STATUS: 'SUCCESS',
                    // PRE_OPTIMIZED: disaggPredicted,
                    // PRE_OPTIMIZED_TIME: PRIMARY_IDS[pidIndex].PREDICTED_TIME,
                    OPT_ALGORITHM : ALGORITHM};            
                    optimizationsTable.push(rowObj);
            }
        }
        let predictionsTable = [];
        for(let pIndex = 0; pIndex < preOptimizedResults.length; pIndex++)
        {
            if( (preOptimizedResults[pIndex].CAL_DATE == optimizationsTable[pIndex].CAL_DATE) &&
                (preOptimizedResults[pIndex].OBJ_DEP == optimizationsTable[pIndex].OBJ_DEP))
            {
                let rowObj = { CAL_DATE : optimizationsTable[pIndex].CAL_DATE, 
                    LOCATION_ID : optimizationsTable[pIndex].LOCATION_ID,
                    PRODUCT_ID : optimizationsTable[pIndex].PRODUCT_ID,
                    OBJ_TYPE: optimizationsTable[pIndex].OBJ_TYPE,
                    OBJ_DEP: optimizationsTable[pIndex].OBJ_DEP,
                    OBJ_COUNTER: optimizationsTable[pIndex].OBJ_COUNTER,
                    MODEL_TYPE: optimizationsTable[pIndex].MODEL_TYPE,
                    MODEL_VERSION : optimizationsTable[pIndex].MODEL_VERSION,
                    MODEL_PROFILE: optimizationsTable[pIndex].MODEL_PROFILE,
                    VERSION : optimizationsTable[pIndex].VERSION,
                    SCENARIO : optimizationsTable[pIndex].SCENARIO,
                    PREDICTED: optimizationsTable[pIndex].PREDICTED,
                    PREDICTED_TIME: optimizationsTable[pIndex].PREDICTED_TIME,
                    OPT_STARTTIME: optimizationsTable[pIndex].OPT_STARTTIME,
                    DELTA_TIME: optimizationsTable[pIndex].DELTA_TIME, 
                    PREDICTED_STATUS: optimizationsTable[pIndex].PREDICTED_STATUS,
                    PRE_OPTIMIZED: preOptimizedResults[pIndex].PRE_OPTIMIZED,
                    PRE_OPTIMIZED_TIME: preOptimizedResults[pIndex].PRE_OPTIMIZED_TIME,
                    OPT_ALGORITHM : optimizationsTable[pIndex].OPT_ALGORITHM};            
                    predictionsTable.push(rowObj);   
            }
            else
            {
                let rowObj = { CAL_DATE : preOptimizedResults[pIndex].CAL_DATE, 
                    LOCATION_ID : preOptimizedResults[pIndex].LOCATION_ID,
                    PRODUCT_ID : preOptimizedResults[pIndex].PRODUCT_ID,
                    OBJ_TYPE: preOptimizedResults[pIndex].OBJ_TYPE,
                    OBJ_DEP: preOptimizedResults[pIndex].OBJ_DEP,
                    OBJ_COUNTER: preOptimizedResults[pIndex].OBJ_COUNTER,
                    MODEL_TYPE: preOptimizedResults[pIndex].MODEL_TYPE,
                    MODEL_VERSION : preOptimizedResults[pIndex].MODEL_VERSION,
                    MODEL_PROFILE: preOptimizedResults[pIndex].MODEL_PROFILE,
                    VERSION : preOptimizedResults[pIndex].VERSION,
                    SCENARIO : preOptimizedResults[pIndex].SCENARIO,
                    PREDICTED: preOptimizedResults[pIndex].PREDICTED,
                    PREDICTED_TIME: preOptimizedResults[pIndex].PREDICTED_TIME,
                    OPT_STARTTIME: preOptimizedResults[pIndex].OPT_STARTTIME,
                    DELTA_TIME: preOptimizedResults[pIndex].DELTA_TIME, 
                    PREDICTED_STATUS: preOptimizedResults[pIndex].PREDICTED_STATUS,
                    PRE_OPTIMIZED: preOptimizedResults[pIndex].PRE_OPTIMIZED,
                    PRE_OPTIMIZED_TIME: preOptimizedResults[pIndex].PRE_OPTIMIZED_TIME,
                    OPT_ALGORITHM : preOptimizedResults[pIndex].OPT_ALGORITHM};            
                    predictionsTable.push(rowObj);   
            }
        }

        if(predictionsTable.length > 0)
        {
            cqnQuery = {UPSERT:{ into: { ref: ['CP_TS_PREDICTIONS'] }, entries:  predictionsTable }};
            try {
                await cds.run(cqnQuery);
            }
            catch(exception) {
                console.log("cqnQuery ", cqnQuery, "locId : ",loc_id, "prodId : ", prod_id, );
                throw new Error(exception.toString());
            }
        }
        
        console.log("UNIQUE_ID ", UNIQUE_ID);
        sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                        "'" + UNIQUE_ID + "'" + "," +
                                        "'" + 'COMPLETED' + "'" + "," +
                                        "'" + OptRunTime + "'" + "," +
                                        "'" +  this.MAX_DEVIATION + "'" + "," +
                                        "'" +  loc_id + "'" + "," +
                                        "'" +  prod_id + "'" + "," +
                                        "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
        try {
            await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("NON LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
            throw new Error(exception.toString());
        }

        this.UUID = UNIQUE_ID;
        this.STATUS = 'COMPLETED';
        this.OPTIMIZATION_TIME = OptRunTime;
        this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;


        // console.log ("NON LINEAR CP_OPTIMIZATION_STATUS sqlStr ", sqlStr);
        // console.log("OPTIMIZATION END", process.memoryUsage());
    }

    _initialize_constraints_data = async function (PRIMARY_IDS, CHARVAL_IDS)
    {
        let new_constraint_data = [];
        for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex ++)
        {
            new_constraint_data.push({"VARIABLE": PRIMARY_IDS[pidIndex].PID_ENCODED, "VALUE": 0, "DERIVATIVE": 0})

        }
        for (let charvalIdx = 0; charvalIdx < CHARVAL_IDS.length; charvalIdx ++)
        {
            let charvalId = CHARVAL_IDS[charvalIdx].CHARVAL_ID_ENCODED;
            new_constraint_data.push({"VARIABLE": charvalId, "VALUE": 0, "DERIVATIVE": 0})
        }
        new_constraint_data.push({"VARIABLE": "K", "VALUE": 0, "DERIVATIVE": 0})

        return new_constraint_data;

    }
    // IN USE
    _lpsolveUniqueIDs_generic_UniqueIDS = async function (LOCATION_ID, PRODUCT_ID, TYPE, 
                                        MODEL_VERSION, VERSION, SCENARIO, ALGORITHM, FACTOR, CAL_DATE,
                                        MODEL_TYPE, MODEL_PROFILE, UNIQUE_ID, CHAR_WEIGHTAGE)
    {
    console.log("_lpsolveUniqueIDs_generic_UniqueIDS LOCATION_ID ", LOCATION_ID, "PRODUCT_ID ", PRODUCT_ID, "TYPE ", TYPE, "CAL_DATE ", CAL_DATE, "UNIQUE_ID", UNIQUE_ID,"CHAR_WEIGHTAGE",CHAR_WEIGHTAGE);
        var lpsolve = require('lp_solve');
    var Row = lpsolve.Row;

    var lp = new lpsolve.LinearProgram();


    // BY CAL_DATE, LOCATION, PRODUCT, OBJ_DEP, OBJ_COUNTER

    //    let cal_date = '2023-07-31';
    
    //    let loc_id = 'AS01';
    //    let prod_id = '000000000000000059';

        let cal_date = CAL_DATE;
        this.CAL_DATE = CAL_DATE;
        
        let loc_id = LOCATION_ID;
        let prod_id = PRODUCT_ID;
        let objType = TYPE;
        let modelVersion = MODEL_VERSION;
        let ibpVersion = VERSION;
        let ibpScenario = SCENARIO;
        let algorithm = ALGORITHM;
        let modelType = MODEL_TYPE;
        let modelProfile = MODEL_PROFILE;

    // let loc_id = 'PLNO';
    // let prod_id = '000000000000000066';
    let resultsByCharValNum;
    
    // SELECT DISTINCT CHARACTERISTICS AND CHARVALS OF THE PRODUCT
    let sqlStr = 'SELECT DISTINCT PBC.CHAR_NUM, IFC.CHARVAL_NUM' + 
                ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
                ' INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                ' PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
                ' AND PBC.LOCATION_ID = IFC.LOCATION_ID ' +
                ' AND PBC.PRODUCT_ID = IFC.PRODUCT_ID ' +
                ' AND PBC.CAL_DATE = IFC.WEEK_DATE ' +
                // ' RIGHT JOIN V_CHARVAL AS CHVAL ON ' +
                // ' PBC.CHAR_NUM = CHVAL.CHAR_NUM ' +
                ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND "OBJ_TYPE" =  ' + "'" + objType + "'" +
                ' AND PBC.MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
                ' ORDER BY CHAR_NUM, CHARVAL_NUM';
    // let sqlStr = 'SELECT DISTINCT PBC.CLASS_NUM, PBC.CHAR_NUM, CHVAL.CHARVAL_NUM' + 
    //                 ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
    //                 ' INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
    //                 ' PBC.CLASS_NUM = IFC.CLASS_NUM AND PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
    //                 ' RIGHT JOIN V_CHARVAL AS CHVAL ON ' +
    //                 ' PBC.CLASS_NUM = CHVAL.CLASS_NUM AND PBC.CHAR_NUM = CHVAL.CHAR_NUM ' +
    //                 ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
    //                 ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
    //                 ' AND "OBJ_TYPE" =  ' + "'" + objType + "'" +
    //                 ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
    //                 ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
    //                 ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
    //                 ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
    //                 ' ORDER BY CLASS_NUM, CHAR_NUM, CHARVAL_NUM';
    try {
        resultsByCharValNum = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr ", sqlStr);
        throw new Error(exception.toString());
    }

    console.log("_lpsolveUniqueIDs_generic_UniqueIDS sqlStr =",sqlStr);

    //    console.log("_lpsolveUniqueIDs resultsByCharValNum length =",resultsByCharValNum.length);

    var resultsByCharNum;

    // SELECT DISTINCT CHARACTERISTICS  OF THE PRODUCT
    sqlStr = 'SELECT DISTINCT PBC.CHAR_NUM' + 
                ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
                ' INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                ' PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
                ' AND PBC.LOCATION_ID = IFC.LOCATION_ID ' +
                ' AND PBC.PRODUCT_ID = IFC.PRODUCT_ID ' +
                ' AND PBC.CAL_DATE = IFC.WEEK_DATE ' +
                // ' RIGHT JOIN V_CHARVAL AS CHVAL ON ' +
                // ' PBC.CHAR_NUM = CHVAL.CHAR_NUM ' +
                ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                ' AND PBC.MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
                ' ORDER BY PBC.CHAR_NUM ';
    // sqlStr = 'SELECT DISTINCT PBC.CLASS_NUM, PBC.CHAR_NUM' + 
    //                 ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
    //                 ' INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
    //                 ' PBC.CLASS_NUM = IFC.CLASS_NUM AND PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
    //                 ' RIGHT JOIN V_CHARVAL AS CHVAL ON ' +
    //                 ' PBC.CLASS_NUM = CHVAL.CLASS_NUM AND PBC.CHAR_NUM = CHVAL.CHAR_NUM ' +
    //                 ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
    //                 ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
    //                 ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
    //                 ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
    //                 ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
    //                 ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
    //                 ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
    //                 ' ORDER BY CLASS_NUM, CHAR_NUM ';
    try {
        resultsByCharNum = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr ", sqlStr);
        throw new Error(exception.toString());
    }

    // PREDICTED VALUES BY PRIMARY IDS (=OBJ_DEP+ '_' + OBJ_COUNTER)
    var results = [];
    sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, OPT_STARTTIME, DELTA_TIME, PRE_OPTIMIZED, PRE_OPTIMIZED_TIME FROM CP_V_PREDICTIONS_BY_CHAR' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND "CAL_DATE" =  ' + "'" + cal_date + "'" +
                ' ORDER BY LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER';
    try {
        results = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr ", sqlStr);
        throw new Error(exception.toString());
    }
    // console.log("_lpsolveUniqueIDs sqlStr =",sqlStr);
    // console.log("_lpsolveUniqueIDs results =",results);

    var PRIMARY_IDS_PREDVALS = [];
    var PRIMARY_IDS = [];
    let optStartTime = new Date().toISOString();
    let deltaTime = results[0].DELTA_TIME;
    if( deltaTime == null)
    {
        deltaTime = results[0].PRE_OPTIMIZED_TIME;
    }
    for (let index = 0; index < results.length; index++)
    {
        let primary_id = results[index].LOCATION_ID + '#' + 
                            results[index].PRODUCT_ID + '#' +
                            results[index].OBJ_DEP + '#' +  results[index].OBJ_COUNTER;
        PRIMARY_IDS.push({"PRIMARY_ID": primary_id, "DELTA":results[index].DELTA, "PREDICTED":results[index].PRE_OPTIMIZED,  
                            "PREDICTED_TIME":results[index].PRE_OPTIMIZED_TIME,
                            "OPT_STARTTIME":optStartTime,"DELTA_TIME": deltaTime,
                            "RESTORE_TIME":results[index].OPT_STARTTIME
                        });

    }

    //    console.log("_lpsolveUniqueIDs PRIMARY_IDS =",PRIMARY_IDS);



    //    console.log("_lpsolveUniqueIDs PRIMARY_IDS_PREDVALS =",PRIMARY_IDS_PREDVALS);

    sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, OPT_STARTTIME, DELTA_TIME, CHAR_NUM, CHARVAL_NUM, PRE_OPTIMIZED FROM CP_V_PREDICTIONS_BY_CHAR' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND "CAL_DATE" =  ' + "'" + cal_date + "'" +
                ' ORDER BY LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, CHAR_NUM, CHARVAL_NUM';

    var predictedVals;
    try {
        predictedVals = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr ", sqlStr);
        throw new Error(exception.toString());
    }
    //    console.log("_lpsolveUniqueIDs predictedVals =",predictedVals);



    for (let pvalIndex = 0; pvalIndex < predictedVals.length; pvalIndex++)
    {
        let pvalId = predictedVals[pvalIndex].LOCATION_ID + '#' + 
                    predictedVals[pvalIndex].PRODUCT_ID + '#' +
                    predictedVals[pvalIndex].OBJ_DEP + '#' +  predictedVals[pvalIndex].OBJ_COUNTER;
        let pvalCharNum = predictedVals[pvalIndex].CHAR_NUM;
        let pvalCharValNum = predictedVals[pvalIndex].CHARVAL_NUM;

        PRIMARY_IDS_PREDVALS.push({"PRIMARY_ID": pvalId,"CHAR_NUM": pvalCharNum, "CHARVAL_NUM": pvalCharValNum, "PREDICTED": predictedVals[pvalIndex].PRE_OPTIMIZED});

    }

    //    console.log("_lpsolveUniqueIDs PRIMARY_IDS_PREDVALS =",PRIMARY_IDS_PREDVALS);

    
    for (let primaryIndex = 0; primaryIndex < PRIMARY_IDS.length; primaryIndex ++)
    {
        lp.addColumn(PRIMARY_IDS[primaryIndex].PRIMARY_ID,false,false);
        // lp.addColumn(PRIMARY_IDS[primaryIndex].PRIMARY_ID,true);
    }


    var CHARVAL_COUNTS = [];
    var LOC_PROD_ID = loc_id + '#' + prod_id;

    for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
    {

        CHARVAL_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": resultsByCharValNum[charNumIndex].CHAR_NUM, "CHARVAL_NUM" : resultsByCharValNum[charNumIndex].CHARVAL_NUM, "PREDICTED": 0});                  
    }
    //    console.log("_lpsolveUniqueIDs CHARVAL_COUNTS =",CHARVAL_COUNTS);

    //    console.log(" Before Adding Variables for CHVAL_COUNTS")

    for (let charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx ++)
    {
        let variable = CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID + '-' + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM;
        lp.addColumn(variable,false,false); 
        // lp.addColumn(variable,true); 
    }

    //    console.log(" After Adding Variables for CHARVAL_COUNTS")

    for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
    {
        for (let pidIndex = 0; pidIndex < PRIMARY_IDS_PREDVALS.length; pidIndex++)
        {


            if( (CHARVAL_COUNTS[charNumIndex].CHAR_NUM === PRIMARY_IDS_PREDVALS[pidIndex].CHAR_NUM) &&
                (CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM === PRIMARY_IDS_PREDVALS[pidIndex].CHARVAL_NUM) )
            {

                CHARVAL_COUNTS[charNumIndex].PREDICTED = CHARVAL_COUNTS[charNumIndex].PREDICTED + PRIMARY_IDS_PREDVALS[pidIndex].PREDICTED;
            }

        }
    }

    let UID_CHARVAL_MATRIX = [];
    for (var uidIdx = 0; uidIdx < PRIMARY_IDS.length; uidIdx++) {
        UID_CHARVAL_MATRIX[uidIdx]=[];
        for (var charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++) {
            UID_CHARVAL_MATRIX[uidIdx][charvalIdx] = 0;
        }
    }

    for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex++)
    {
        for (let pvalIndex = 0; pvalIndex < PRIMARY_IDS_PREDVALS.length; pvalIndex++)

        {
            if(PRIMARY_IDS[pidIndex].PRIMARY_ID === PRIMARY_IDS_PREDVALS[pvalIndex].PRIMARY_ID)
            {
                for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)

                {
                    // console.log("charNumIndex ", charNumIndex, "pidIndex", pidIndex, CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM, PRIMARY_IDS_PREDVALS[pvalIndex].CHARVAL_NUM);

                    if( (CHARVAL_COUNTS[charNumIndex].CHAR_NUM === PRIMARY_IDS_PREDVALS[pvalIndex].CHAR_NUM) &&
                        (CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM === PRIMARY_IDS_PREDVALS[pvalIndex].CHARVAL_NUM) )
                    {

                        // CHARVAL_COUNTS[charNumIndex].PREDICTED = CHARVAL_COUNTS[charNumIndex].PREDICTED + PRIMARY_IDS_PREDVALS[pidIndex].PREDICTED;
                        UID_CHARVAL_MATRIX[pidIndex][charNumIndex] = 1;
                        // console.log("UID_CHARVAL_MATRIX[",pidIndex, "]", "[",charNumIndex, "]", UID_CHARVAL_MATRIX[pidIndex][charNumIndex])

                    }

                }
            }
        }
    }

    //    console.log("UID_CHARVAL_MATRIX ", UID_CHARVAL_MATRIX);
    




    // console.log("_lpsolveUniqueIDs CHARVAL_COUNTS =",CHARVAL_COUNTS);

    // console.log("_lpsolveUniqueIDs resultsByCharNum =",resultsByCharNum);


    var CHAR_COUNTS = [];
    for (let charIndex = 0; charIndex < resultsByCharNum.length; charIndex ++)
    {
        let charCount = 0;

        for (let charValIndex = 0; charValIndex < resultsByCharValNum.length; charValIndex++)   
        {
            if( resultsByCharNum[charIndex].CHAR_NUM === CHARVAL_COUNTS[charValIndex].CHAR_NUM)
            {
                charCount = charCount + CHARVAL_COUNTS[charValIndex].PREDICTED;
            } 
        }
        CHAR_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": resultsByCharNum[charIndex].CHAR_NUM, "PREDICTED": charCount});              

    }



    sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, "VERSION", "SCENARIO", CHAR_NUM, CHARVAL_NUM,  OPT_QTY '+
            ' FROM CP_V_IBP_FCHARPLAN_BY_PRIMARY_CHARS' +
            ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
            ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
            ' AND VERSION =  ' + "'" + ibpVersion + "'" +
            ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
            ' AND "WEEK_DATE" =  ' + "'" + cal_date + "'" +                    
            ' AND "MODEL_VERSION" = ' + "'" + modelVersion + "'" +
            ' ORDER BY LOCATION_ID, PRODUCT_ID, "VERSION", "SCENARIO", CHAR_NUM, CHARVAL_NUM';

    let ibpResultsByCharvalNum;
    try {
        ibpResultsByCharvalNum = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr ", sqlStr);
        throw new Error(exception.toString());
    }
    // console.log("ibpResultsByCharvalNum ", ibpResultsByCharvalNum);
    let IBP_CHARVAL_COUNTS = [];

    // INITIALIZE SIZE OF IBP option quantities to be in sync with BTP predicted quantities
    for (let charvalIndex = 0; charvalIndex < CHARVAL_COUNTS.length; charvalIndex ++)
    {

        IBP_CHARVAL_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": CHARVAL_COUNTS[charvalIndex].CHAR_NUM, 
                                    "CHARVAL_NUM": CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM, "IBP_OPT_QTY": 0});   
    }

    // UPDATE IBP option quantities from ibpResultsByCharvalNum

    for (let charvalIndex = 0; charvalIndex < CHARVAL_COUNTS.length; charvalIndex ++)
    {
        for (let ibpIdx = 0; ibpIdx < ibpResultsByCharvalNum.length; ibpIdx ++)
        {

            if( (CHARVAL_COUNTS[charvalIndex].LOC_PROD_ID  == (ibpResultsByCharvalNum[ibpIdx].LOCATION_ID + '#' + ibpResultsByCharvalNum[ibpIdx].PRODUCT_ID )) &&
                (CHARVAL_COUNTS[charvalIndex].CHAR_NUM  == ibpResultsByCharvalNum[ibpIdx].CHAR_NUM) &&
                (CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM  == ibpResultsByCharvalNum[ibpIdx].CHARVAL_NUM) )
            {
                IBP_CHARVAL_COUNTS[charvalIndex].CHAR_NUM = ibpResultsByCharvalNum[ibpIdx].CHAR_NUM;
                IBP_CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM = ibpResultsByCharvalNum[ibpIdx].CHARVAL_NUM;
                IBP_CHARVAL_COUNTS[charvalIndex].IBP_OPT_QTY = ibpResultsByCharvalNum[ibpIdx].OPT_QTY;
            }

        }
    }
                      
    //    console.log("IBP_CHARVAL_COUNTS = ", IBP_CHARVAL_COUNTS);

    let IBP_CHAR_COUNTS = [];
    // INITIALIZE SIZE OF IBP char quantities to be in sync with BTP predicted char quantities
    for (let charIndex = 0; charIndex < CHAR_COUNTS.length; charIndex ++)
    {

        IBP_CHAR_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": CHAR_COUNTS[charIndex].CHAR_NUM, "IBP_CHAR_QTY": 0});              
    }

    // UPDATE IBP option quantities from ibpResultsByCharvalNum

    for (let charIndex = 0; charIndex < CHAR_COUNTS.length; charIndex ++)
    {
        let charCount = 0;
        for (let charvalIdx = 0; charvalIdx < IBP_CHARVAL_COUNTS.length; charvalIdx ++)
        {
            

            if( (IBP_CHAR_COUNTS[charIndex].LOC_PROD_ID  == IBP_CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID) &&
                (IBP_CHAR_COUNTS[charIndex].CHAR_NUM  == IBP_CHARVAL_COUNTS[charvalIdx].CHAR_NUM)  )
            {
                IBP_CHAR_COUNTS[charIndex].IBP_CHAR_QTY = IBP_CHAR_COUNTS[charIndex].IBP_CHAR_QTY +
                                                            Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY);
                
            }

        }
    }


    if ( IBP_CHAR_COUNTS.length == 0)
        {
            console.log("NOTHING to Optimize");
            // let startMilliSecs = new Date().getTime();
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs + 50;
            console.log("UNIQUE_ID ", UNIQUE_ID);
            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                            "'" + UNIQUE_ID + "'" + "," +
                                            "'" + 'COMPLETED' + "'" + "," +
                                            "'" + OptRunTime + "'" + "," +
                                            "'" +  this.MAX_DEVIATION + "'" + "," +
                                            "'" +  loc_id + "'" + "," +
                                            "'" +  prod_id + "'" + "," +
                                            "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';                     

            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return;
        }

    let ibp_total_qty = IBP_CHAR_COUNTS[0].IBP_CHAR_QTY;

    console.log("IBP_CHAR_COUNTS = ", IBP_CHAR_COUNTS);

    sqlStr = 'SELECT DISTINCT REF_PRODID FROM V_SALES_H WHERE PRODUCT_ID = ' + "'" + prod_id  + "'";
    let sqlResults;
    try {
        sqlResults = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr ", sqlStr);
        throw new Error(exception.toString());
    }

    // DEFAULT CHARVAL WEIGHTS ARE ALL INITIALIZED TO 1
    let charWeightResults = [];

    // console.log("IBP_CHARVAL_COUNTS ", IBP_CHARVAL_COUNTS);
    // console.log("CHARVAL_COUNTS ", CHARVAL_COUNTS);

    for (let charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++)
    {
        let weight = 1;
        // // let weight = 0;
        // // if(parseFloat(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY) !== CHARVAL_COUNTS[charvalIdx].PREDICTED)
        // // {
        // //     weight = 1;
        // // }    
        // // if( (CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM === 'TURBO') || 
        // //    (CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM === '1SPD') ) {
        // // // if( (CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM === '1SPD') )         {
        // //     weight = 1;
        // // }   

        //  if(CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM === 'TURBO')
        // {
        //     weight = 1;
        //     console.log("CHARVAL_COUNTS[", charvalIdx,"].CHARVAL_NUM",CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM, "OPT_QTY",CHARVAL_COUNTS[charvalIdx].PREDICTED)
        // }   

        // charWeightResults[charvalIdx] = 1;
        charWeightResults.push({"WEIGHTAGE":weight});

    }

    console.log("DEFAULT CHARVAL WEIGHTS ", charWeightResults);
    let totalWeight = 0;

    if (CHAR_WEIGHTAGE == true)
    {

        let charWeightsSql = ' SELECT DISTINCT CW.CHAR_NUM, IFC.CHARVAL_NUM, WEIGHTAGE FROM V_CHARGROUPWEIGHTAGE AS CW ' +
                                'INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                                'CW.CHAR_NUM = IFC.CHAR_NUM ' +
                                ' WHERE CW.PRODUCT_ID = ' + "'" + sqlResults[0].REF_PRODID + "'" +
                                ' AND IFC.PRODUCT_ID =' + "'" + prod_id + "'" +
                                ' AND CHAR_TYPE = \'P\'' +
                                ' ORDER BY CHAR_NUM, CHARVAL_NUM';


        try {
            charWeightResults = await cds.run(charWeightsSql);
        }
        catch (exception) {
            console.log("charWeightsSql ", charWeightsSql);
            throw new Error(exception.toString());
        }
        console.log("charWeightsSql ", charWeightsSql);

        console.log("charWeightResults ", charWeightResults,"charWeightResults[0].WEIGHTAGE:", parseInt(charWeightResults[0].WEIGHTAGE));

        for (let weightIdx = 0; weightIdx < charWeightResults.length; weightIdx++)
        {
            totalWeight = totalWeight + parseInt(charWeightResults[weightIdx].WEIGHTAGE);
        }
        console.log("totalWeight ", totalWeight);
    }
    else
    {
        totalWeight = 1;
    }

   


    // ADD variables for CHARVAL NUMBER

    // for (let charvalIndex = 0; charvalIndex < CHARVAL_COUNTS.length; charvalIndex ++)
    // {
    //     // let tempVar = "'" + CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM + "'";
    //     // CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM = lp.addColumn(tempVar,false,false); 
    //     CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM = lp.addColumn(CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM,false,false); 

    // }

    // console.log(" CHARVAL_COUNTS ", CHARVAL_COUNTS);
    


    for (var charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++)
    {

        let constraint_var = new Row();
        let constraint_var_minus = new Row();


        for (let uidIdx = 0; uidIdx < PRIMARY_IDS.length; uidIdx ++)
        {
            if(UID_CHARVAL_MATRIX[uidIdx][charvalIdx] === 1)
            {
                // console.log("ibp_penalties[", charvalIdx, "] = ",ibp_penalties[charvalIdx]);
                
                // constraint_var = constraint_var.Add(PRIMARY_IDS[uidIdx].PRIMARY_ID, charWeightResults[charvalIdx].WEIGHTAGE);
                // constraint_var_minus = constraint_var_minus.Add(PRIMARY_IDS[uidIdx].PRIMARY_ID, -charWeightResults[charvalIdx].WEIGHTAGE);
                constraint_var = constraint_var.Add(PRIMARY_IDS[uidIdx].PRIMARY_ID, 1);
                constraint_var_minus = constraint_var_minus.Add(PRIMARY_IDS[uidIdx].PRIMARY_ID, -1);
                // if(charWeightResults[charvalIdx].WEIGHTAGE !== 0)
                // {    
                    // constraint_var = constraint_var.Add(PRIMARY_IDS[uidIdx].PRIMARY_ID, 1);
                    // constraint_var_minus = constraint_var_minus.Add(PRIMARY_IDS[uidIdx].PRIMARY_ID, -1);
                // }    
                // constraint_var = constraint_var.Add(PRIMARY_IDS[uidIdx].PRIMARY_ID, 1);
                // constraint_var_minus = constraint_var_minus.Add(PRIMARY_IDS[uidIdx].PRIMARY_ID, -1);

            }
        }   


        constraint_var = constraint_var.Add(CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID + '-' + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM, -1);
        constraint_var_minus = constraint_var_minus.Add(CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID + '-' + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM, -1);

        lp.addConstraint(constraint_var, 'LE', Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY), "'" + CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID + '-' + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM + "^+ constraint");
        lp.addConstraint(constraint_var_minus, 'LE', -Number(IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY), "'" + CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID + '-' + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM + "^- constraint");

        // lp.addConstraint(constraint_var, 'LE', IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY, "'" + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM + "^+ constraint");
        // lp.addConstraint(constraint_var_minus, 'LE', -IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY, "'" + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM + "^- constraint");

    }

    sqlStr = 'SELECT SUM(PRE_OPTIMIZED) AS TOTAL_PREDICTED FROM V_CP_TS_PREDICTIONS_TELESCOPIC  ' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND CAL_DATE =  ' + "'" + cal_date + "'";

    try {
        results = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr ", sqlStr);
        throw new Error(exception.toString());
    }

    let loc_prod_predicted = 0;

    if (results.length > 0)
    {
        loc_prod_predicted = results[0].TOTAL_PREDICTED;
    }

    sqlStr = 'SELECT QUANTITY FROM V_IBP_FUTUREDEMAND_TELESCOPIC  ' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND WEEK_DATE =  ' + "'" + cal_date + "'";
    try {
        results = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr ", sqlStr);
        throw new Error(exception.toString());
    }

    let loc_prod_ibp_qty = 0;

    if (results.length > 0)
    {
        loc_prod_ibp_qty = results[0].QUANTITY;
    }
    if(loc_prod_ibp_qty == 0)
    {
        console.log("Optimization will not be done, please check why loc_prod_ibp_qty is ", loc_prod_ibp_qty);
        // let endMilliSecs = new Date().getTime();
        // OptRunTime = endMilliSecs - startMilliSecs;
        // console.log("UNIQUE_ID ", UNIQUE_ID);

        // let startMilliSecs = new Date().getTime();
        // let endMilliSecs = new Date().getTime();
        let OptRunTime = 100; //endMilliSecs - startMilliSecs + 50;
        console.log("UNIQUE_ID ", UNIQUE_ID);

        sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                        "'" + UNIQUE_ID + "'" + "," +
                                        "'" + 'COMPLETED' + "'" + "," +
                                        "'" + OptRunTime + "'" + "," +
                                        "'" +  this.MAX_DEVIATION + "'" + "," +
                                        "'" +  loc_id + "'" + "," +
                                        "'" +  prod_id + "'" + "," +
                                        "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
        try {
            await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
            throw new Error(exception.toString());
        }

        this.UUID = UNIQUE_ID;
        this.STATUS = 'COMPLETED';
        this.OPTIMIZATION_TIME = OptRunTime;
        this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

        return;
    }

    let min_qty_factor = 0;
    if( loc_prod_predicted >= loc_prod_ibp_qty)
    {
        //    min_qty_factor = 0.90 * loc_prod_ibp_qty/loc_prod_predicted;
        min_qty_factor = FACTOR*loc_prod_ibp_qty/loc_prod_predicted;

    }
    else
    {
        //    min_qty_factor = 0.90 *  loc_prod_predicted/loc_prod_ibp_qty;
            min_qty_factor = FACTOR*loc_prod_predicted/loc_prod_ibp_qty;

    }

    console.log("loc_prod_predicted ", loc_prod_predicted, "loc_prod_ibp_qty =",loc_prod_ibp_qty,  "OptFactor =", FACTOR, "min_qty_factor", min_qty_factor);
    let pid_total_constraint_var = new Row();
    for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex++)
    {
        // let variable = PRIMARY_IDS[pidIndex].PRIMARY_ID;
        // variable = variable.replace(/'/g,'');
        pid_total_constraint_var = pid_total_constraint_var.Add(PRIMARY_IDS[pidIndex].PRIMARY_ID,1); 
        let pid_constraint = new Row().Add(PRIMARY_IDS[pidIndex].PRIMARY_ID,1);
        lp.addConstraint(pid_constraint, 'GE', min_qty_factor*PRIMARY_IDS[pidIndex].PREDICTED, PRIMARY_IDS[pidIndex].PRIMARY_ID + " CONSTRAINT");

    }
    lp.addConstraint(pid_total_constraint_var, 'EQ', ibp_total_qty, PRIMARY_IDS_PREDVALS[0].PRIMARY_ID + " PRIMARY ID's TOTAL CONSTRAINT");

    //    console.log("AFTER // ADD CONSTRAINTS ON PRIMARY IDS")

    
    //    console.log("AFTER  // ADD PRIMARY ID VALUES WHOSE VALUES ARE TO BE ESTIMATED BY SOLVER")


    


        /***************/

    
    let ibp_planned_quantities = [];
    let btp_predicted_quantities = [];
    //    let ibp_penalties =[];
    for (let ibpIdx = 0; ibpIdx < IBP_CHARVAL_COUNTS.length; ibpIdx++)
    {
        ibp_planned_quantities[ibpIdx] = IBP_CHARVAL_COUNTS[ibpIdx].IBP_OPT_QTY;
        btp_predicted_quantities[ibpIdx] = CHARVAL_COUNTS[ibpIdx].PREDICTED;
    }

    
    console.log("ibp_planned_quantities ", ibp_planned_quantities);
    console.log("btp_predicted_quantities ", btp_predicted_quantities);

    let objective = new Row();
    for (let charvalIdx = 0; charvalIdx < CHARVAL_COUNTS.length; charvalIdx++)
    {

        //  objective.Add(CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM,1)
        let charWeight = parseInt(charWeightResults[charvalIdx].WEIGHTAGE )/ totalWeight;
        console.log("charvalIdx ", charvalIdx, "charWeight ", charWeight, "CHARVAL_COUNTS Length ", CHARVAL_COUNTS.length );
        // if(charWeight !== 0)
            objective.Add(CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID + '-' + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM,charWeight);

            // objective.Add(CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID + '-' + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM,1);
            // objective.Add(CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID + '-' + CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM,ibp_penalties[charvalIdx]);

    }
    
    
    //    console.log("objective = ",objective);

    lp.setObjective(objective,true);

    
    //    console.log(lp.dumpProgram());
    //    console.log(lp.solve());
    //    console.log('objective =', lp.getObjectiveValue());
    //    console.log('solution variables =', lp.getSolutionVariables());

        // LinearProgram.SolveResult = {
        //     '-5': 'UNKNOWNERROR',
        //     '-4': 'DATAIGNORED',
        //     '-3': 'NOBFP',
        //     '-2': 'NOMEMORY',
        //     '-1': 'NOTRUN',
        //     '0': 'OPTIMAL',
        //     '1': 'SUBOPTIMAL',
        //     '2': 'INFEASIBLE',
        //     '3': 'UNBOUNDED',
        //     '4': 'DEGENERATE',
        //     '5': 'NUMFAILURE',
        //     '6': 'USERABORT',
        //     '7': 'TIMEOUT',
        //     '8': 'RUNNING',
        //     '9': 'PRESOLVED'
        // };

        let startMilliSecs = new Date().getTime();

    lp.solve();
    console.log('objective Value =', lp.getObjectiveValue());
    console.log('solution variables =', lp.getSolutionVariables());
    let endMilliSecs = new Date().getTime();
    let OptRunTime = endMilliSecs - startMilliSecs;

    let solutionStatus = lp.lprec.get_status();
    // 'INFEASIBLE' = 2
    if(solutionStatus == 2)
    {
            console.log("lp_solve SOLUTION INFEASIBLE ");
            console.log("lp_solve Status ", lp.lprec.get_status());
            // let endMilliSecs = new Date().getTime();
            // OptRunTime = endMilliSecs - startMilliSecs;
            console.log("UNIQUE_ID ", UNIQUE_ID);
            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                            "'" + UNIQUE_ID + "'" + "," +
                                            "'" + 'FAILED' + "'" + "," +
                                            "'" + OptRunTime + "'" + "," +
                                            "'" +  this.MAX_DEVIATION + "'" + "," +
                                            "'" +  loc_id + "'" + "," +
                                            "'" +  prod_id + "'" + "," +
                                            "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("NON LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'FAILED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return solutionStatus;
    }
    var PID_OPTIMIZED = [];
    let PID_OPTIMIZED_SUM = 0;

    for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex ++)
    {
        let optimized_qty = lp.get(PRIMARY_IDS[pidIndex].PRIMARY_ID);

        PID_OPTIMIZED.push({"PRIMARY_ID": PRIMARY_IDS[pidIndex].PRIMARY_ID, "OPTIMIZED_PRIMARY_QTY" : optimized_qty});
        PID_OPTIMIZED_SUM = PID_OPTIMIZED_SUM + optimized_qty;
    }

    //    console.log("PID_OPTIMIZED", PID_OPTIMIZED);
    // console.log("PID_OPTIMIZED_SUM", PID_OPTIMIZED_SUM);

    // Initialize Revized PRIMARY ID Predicted values and then update with  PID_OPTIMIZED
    var OPTIMIZED_PRIMARY_IDS_PREDVALS = [];
    // console.log("INIT REVISED_PRIMARY_IDS_PREDVALS = ", REVISED_PRIMARY_IDS_PREDVALS);   
    for (let pidIndex = 0; pidIndex < PRIMARY_IDS_PREDVALS.length; pidIndex++)
    {

        OPTIMIZED_PRIMARY_IDS_PREDVALS.push({"PRIMARY_ID":PRIMARY_IDS_PREDVALS[pidIndex].PRIMARY_ID,
                                            "CHAR_NUM":PRIMARY_IDS_PREDVALS[pidIndex].CHAR_NUM,
                                            "CHARVAL_NUM":PRIMARY_IDS_PREDVALS[pidIndex].CHARVAL_NUM,
                                            "OPTIMIZED_PRIMARY_QTY":0});


    }

    for (let revIndex = 0; revIndex < OPTIMIZED_PRIMARY_IDS_PREDVALS.length; revIndex++)
    {
        for (let pcalcIndex = 0; pcalcIndex < PID_OPTIMIZED.length; pcalcIndex++)
        {
            if ( (OPTIMIZED_PRIMARY_IDS_PREDVALS[revIndex].PRIMARY_ID == PID_OPTIMIZED[pcalcIndex].PRIMARY_ID))
            {

                OPTIMIZED_PRIMARY_IDS_PREDVALS[revIndex].OPTIMIZED_PRIMARY_QTY =  PID_OPTIMIZED[pcalcIndex].OPTIMIZED_PRIMARY_QTY;
            }
        }
    }

    //    console.log("OPTIMIZED_PRIMARY_IDS_PREDVALS ", OPTIMIZED_PRIMARY_IDS_PREDVALS);

    let OPTIMIZED_CHARVAL_COUNTS = [];

    for (let charNumIndex = 0; charNumIndex < CHARVAL_COUNTS.length; charNumIndex++)
    {

        OPTIMIZED_CHARVAL_COUNTS.push({"LOC_PROD_ID":CHARVAL_COUNTS[charNumIndex].LOC_PROD_ID, 
                                        "CHAR_NUM": CHARVAL_COUNTS[charNumIndex].CHAR_NUM, 
                                        "CHARVAL_NUM": CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM,
                                        "OPTIMIZED_CHAR_QTY": 0});
    }
    // console.log("INITIALIZED OPTIMIZED_CHARVAL_COUNTS = ", OPTIMIZED_CHARVAL_COUNTS);


    for (let revcharNumIndex = 0; revcharNumIndex < OPTIMIZED_CHARVAL_COUNTS.length; revcharNumIndex++)
    {
        for (let revpidvalIdx = 0; revpidvalIdx < OPTIMIZED_PRIMARY_IDS_PREDVALS.length; revpidvalIdx++)
        {
            let primaryId = OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].PRIMARY_ID;
            let locprodId = OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].LOC_PROD_ID;

            if (primaryId.includes(locprodId) &&
                ( OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].CHAR_NUM == OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].CHAR_NUM) &&
                ( OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].CHARVAL_NUM == OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].CHARVAL_NUM))
            {
                OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].OPTIMIZED_CHAR_QTY = 
                                OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].OPTIMIZED_CHAR_QTY + 
                                OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].OPTIMIZED_PRIMARY_QTY;

            }
        }
    }
    //    console.log("UPDATED OPTIMIZED_CHARVAL_COUNTS = ", OPTIMIZED_CHARVAL_COUNTS);

    let btp_optimized_char_quantities = [];
    for (let revIdx = 0; revIdx < OPTIMIZED_CHARVAL_COUNTS.length; revIdx++)
    {
        btp_optimized_char_quantities[revIdx] = OPTIMIZED_CHARVAL_COUNTS[revIdx].OPTIMIZED_CHAR_QTY;
    }

    var tableObj = [];	

    for (let index =0; index < btp_optimized_char_quantities.length; index++)
    {


        let pred_dev = 0;
        let pred_post_dev = 0;
        let normalized_dev = 0;
        if (ibp_planned_quantities[index] != 0)
        {
            pred_dev = (100*Math.abs(ibp_planned_quantities[index]-btp_predicted_quantities[index])/ibp_planned_quantities[index]).toFixed(2);
            pred_post_dev = (100*Math.abs(ibp_planned_quantities[index]-btp_optimized_char_quantities[index])/ibp_planned_quantities[index]).toFixed(2);
            normalized_dev = 100*Math.abs(ibp_planned_quantities[index]-btp_optimized_char_quantities[index])/loc_prod_ibp_qty;
        }

        let charNum = CHARVAL_COUNTS[index].CHAR_NUM;
        let charvalNum = CHARVAL_COUNTS[index].CHARVAL_NUM;
        let revisedQty = (btp_optimized_char_quantities[index]).toFixed(2);
        // when Optimization Fails
        if (revisedQty == 0)
        {
            revisedQty = (btp_predicted_quantities[index]).toFixed(4);
            pred_post_dev = pred_dev;
        }
        var rowObj = { CAL_DATE : cal_date, 
            LOCATION_ID : loc_id,
            PRODUCT_ID : prod_id,
            MODEL_VERSION : modelVersion,
            VERSION : ibpVersion,
            SCENARIO : ibpScenario,
            ALGORITHM : algorithm,
            CHAR_NUM :  charNum ,
            CHARVAL_NUM :  charvalNum ,
            PREDICTED_QTY : (btp_predicted_quantities[index]).toFixed(4),
            IBP_PLANNED_QTY : ibp_planned_quantities[index],
            BTP_REVISED_QTY : revisedQty,
            PREDICTED_DEVIATION: pred_dev, 
            POST_PREDICTED_DEVIATION : pred_post_dev,
            NORMALIZED_DEVIATION : normalized_dev};

        //    console.log(" rowObj CP_VC_PREDICTIONS_OPTIMIZED index ", index, " rowObj ", rowObj);


        tableObj.push(rowObj);


    }
    sqlStr = 'DELETE FROM CP_VC_PREDICTIONS_OPTIMIZED ' +
            ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
            ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
            ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
            ' AND VERSION =  ' + "'" + ibpVersion + "'" +
            ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
            ' AND ALGORITHM =  ' + "'" + algorithm + "'" +
            ' AND "CAL_DATE" =  ' + "'" + cal_date + "'";
    try {
            await cds.run(sqlStr);
        //  console.log("sqlstr = ", sqlStr);
    }
    catch (exception) {
        console.log("sqlStr ", sqlStr);
        throw new Error(exception.toString());
    }

    //    console.log(" DELETE FROM CP_VC_PREDICTIONS_OPTIMIZED sqlStr ", sqlStr);

    //    console.log("tableObj ", tableObj);
    let cqnQuery = {UPSERT:{ into: { ref: ['CP_VC_PREDICTIONS_OPTIMIZED'] }, entries:  tableObj }};

    await cds.run(cqnQuery);

    var optimizedTime = new Date().toISOString();
    sqlStr = ' SELECT PERIODSTART, WEEKS FROM V_TELESCOPIC_WEEKS_PER_PERIOD ' +
                     ' WHERE PERIODSTART = ' + "'" + cal_date + "'" ;
    let telescopicWeeks;
    try {
        telescopicWeeks = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log(" telescopicWeeks sqlStr ", sqlStr,  "locId : ",loc_id, "prodId : ", prod_id);
        throw new Error(exception.toString());
    }
    

    let weekDates = '(';
    let dateStr = telescopicWeeks[0].PERIODSTART; //'2025-05-31';
    let numberOfWeeks = telescopicWeeks[0].WEEKS;
    for (let weekIdx = 0; weekIdx < numberOfWeeks ; weekIdx++)
    {
        const inputDate = new Date(dateStr);
        inputDate.setDate(inputDate.getDate() + 7*weekIdx);
        const result = inputDate.toISOString().split('T')[0];
        if(weekIdx < numberOfWeeks - 1)
            weekDates = weekDates + "'" + result + "'" + ",";
        else
            weekDates =  weekDates +  "'" + result + "'"  + ")";
    }

    console.log("weekDate ", weekDates);
    let ibpQtysAggResults;
    sqlStr = ' SELECT  SUM(QUANTITY) AS QUANTITY FROM CP_IBP_FUTUREDEMAND ' +
                ' WHERE WEEK_DATE IN ' + weekDates + 
            ' AND LOCATION_ID = ' + "'" + loc_id + "'" +
            ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
            ' AND VERSION =  ' + "'" + ibpVersion + "'" +
            ' AND SCENARIO =  ' + "'" + ibpScenario + "'" ;
    try {
        ibpQtysAggResults = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("ibpQtysAggResults sqlStr ", sqlStr, "locId : ",loc_id, "prodId : ", prod_id);
        throw new Error(exception.toString());
    }
    console.log("ibpQtysAggResults ", ibpQtysAggResults);

    let ibpQtysResults;
    sqlStr = ' SELECT DISTINCT WEEK_DATE, QUANTITY FROM CP_IBP_FUTUREDEMAND ' +
                ' WHERE WEEK_DATE IN ' + weekDates + 
                ' AND LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" ;
    try {
        ibpQtysResults = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log(" ibpQtysResults sqlStr ", sqlStr, "locId : ",loc_id, "prodId : ", prod_id);
        throw new Error(exception.toString());
    }
    console.log("ibpQtysResults ", ibpQtysResults);
    let disAggregatedValues = [];
    for(let ratioIdx = 0; ratioIdx < ibpQtysResults.length; ratioIdx ++)
    {
        let ratio = ibpQtysResults[ratioIdx].QUANTITY/ibpQtysAggResults[0].QUANTITY;
        disAggregatedValues.push({WEEK_DATE:ibpQtysResults[ratioIdx].WEEK_DATE,
                                    QUANTITY:ibpQtysResults[ratioIdx].QUANTITY,
                                    RATIO:ratio});
    }

    console.log("disAggregatedValues ", disAggregatedValues);

    let preOptimizedResults = [];
    let sqlStrPreOptimized = 'SELECT DISTINCT CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_TYPE, OBJ_DEP, OBJ_COUNTER, ' +
                              'MODEL_TYPE, MODEL_VERSION, MODEL_PROFILE, VERSION, SCENARIO, PREDICTED, PREDICTED_TIME, ' +
                              ' OPT_STARTTIME, DELTA_TIME, PREDICTED_STATUS, PRE_OPTIMIZED, PRE_OPTIMIZED_TIME, ' +
                              ' OPT_ALGORITHM FROM CP_TS_PREDICTIONS' +
                                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                                ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                                ' AND CAL_DATE IN ' + weekDates + 
                                ' ORDER BY CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER';
    try {
        preOptimizedResults = await cds.run(sqlStrPreOptimized);
    }
    catch (exception) {
        console.log("sqlStrPreOptimized ", sqlStrPreOptimized);
        throw new Error(exception.toString());
    }

    
    let optimizationsTable = [];


    for (let disaggIdx = 0; disaggIdx < disAggregatedValues.length; disaggIdx++)
    {
        for (let pidIndex = 0; pidIndex < PRIMARY_IDS.length; pidIndex ++)
        {
            let pid = PID_OPTIMIZED[pidIndex].PRIMARY_ID;

            
            let pidStr=pid.split('#');
            let locId = pidStr[0];
            let prodId = pidStr[1];
            let objDep = pidStr[2];
            let objCounter = pidStr[3];
            if (PID_OPTIMIZED[pidIndex].OPTIMIZED_PRIMARY_QTY != null)
            {

                let disaggDate = disAggregatedValues[disaggIdx].WEEK_DATE;
                let disaggOptimized = disAggregatedValues[disaggIdx].RATIO*PID_OPTIMIZED[pidIndex].OPTIMIZED_PRIMARY_QTY;
                // let disaggPredicted = disAggregatedValues[disaggIdx].RATIO*PRIMARY_IDS[pidIndex].PREDICTED;
                // let disaggPredicted = PRIMARY_IDS[pidIndex].PRE_OPTIMIZED;

                var rowObj = { CAL_DATE : disaggDate, 
                    LOCATION_ID : locId,
                    PRODUCT_ID : prodId,
                    OBJ_TYPE: objType,
                    OBJ_DEP: objDep,
                    OBJ_COUNTER: objCounter,
                    MODEL_TYPE: modelType,
                    MODEL_VERSION : modelVersion,
                    MODEL_PROFILE: modelProfile,
                    VERSION : ibpVersion,
                    SCENARIO : ibpScenario,
                    PREDICTED: disaggOptimized,
                    PREDICTED_TIME: optimizedTime,
                    OPT_STARTTIME: PRIMARY_IDS[pidIndex].OPT_STARTTIME,
                    DELTA_TIME: PRIMARY_IDS[pidIndex].DELTA_TIME, 
                    PREDICTED_STATUS: 'SUCCESS',
                    // PRE_OPTIMIZED: disaggPredicted,
                    // PRE_OPTIMIZED_TIME: PRIMARY_IDS[pidIndex].PREDICTED_TIME,
                    OPT_ALGORITHM : ALGORITHM};            
                    optimizationsTable.push(rowObj);   
            }        
        }
    }

    let predictionsTable = [];
    for(let pIndex = 0; pIndex < preOptimizedResults.length; pIndex++)
    {
        if( (preOptimizedResults[pIndex].CAL_DATE == optimizationsTable[pIndex].CAL_DATE) &&
            (preOptimizedResults[pIndex].OBJ_DEP == optimizationsTable[pIndex].OBJ_DEP))
        {
            let rowObj = { CAL_DATE : optimizationsTable[pIndex].CAL_DATE, 
                LOCATION_ID : optimizationsTable[pIndex].LOCATION_ID,
                PRODUCT_ID : optimizationsTable[pIndex].PRODUCT_ID,
                OBJ_TYPE: optimizationsTable[pIndex].OBJ_TYPE,
                OBJ_DEP: optimizationsTable[pIndex].OBJ_DEP,
                OBJ_COUNTER: optimizationsTable[pIndex].OBJ_COUNTER,
                MODEL_TYPE: optimizationsTable[pIndex].MODEL_TYPE,
                MODEL_VERSION : optimizationsTable[pIndex].MODEL_VERSION,
                MODEL_PROFILE: optimizationsTable[pIndex].MODEL_PROFILE,
                VERSION : optimizationsTable[pIndex].VERSION,
                SCENARIO : optimizationsTable[pIndex].SCENARIO,
                PREDICTED: optimizationsTable[pIndex].PREDICTED,
                PREDICTED_TIME: optimizationsTable[pIndex].PREDICTED_TIME,
                OPT_STARTTIME: optimizationsTable[pIndex].OPT_STARTTIME,
                DELTA_TIME: optimizationsTable[pIndex].DELTA_TIME, 
                PREDICTED_STATUS: optimizationsTable[pIndex].PREDICTED_STATUS,
                PRE_OPTIMIZED: preOptimizedResults[pIndex].PRE_OPTIMIZED,
                PRE_OPTIMIZED_TIME: preOptimizedResults[pIndex].PRE_OPTIMIZED_TIME,
                OPT_ALGORITHM : optimizationsTable[pIndex].OPT_ALGORITHM};            
                predictionsTable.push(rowObj);   
        }
        else
        {
            let rowObj = { CAL_DATE : preOptimizedResults[pIndex].CAL_DATE, 
                LOCATION_ID : preOptimizedResults[pIndex].LOCATION_ID,
                PRODUCT_ID : preOptimizedResults[pIndex].PRODUCT_ID,
                OBJ_TYPE: preOptimizedResults[pIndex].OBJ_TYPE,
                OBJ_DEP: preOptimizedResults[pIndex].OBJ_DEP,
                OBJ_COUNTER: preOptimizedResults[pIndex].OBJ_COUNTER,
                MODEL_TYPE: preOptimizedResults[pIndex].MODEL_TYPE,
                MODEL_VERSION : preOptimizedResults[pIndex].MODEL_VERSION,
                MODEL_PROFILE: preOptimizedResults[pIndex].MODEL_PROFILE,
                VERSION : preOptimizedResults[pIndex].VERSION,
                SCENARIO : preOptimizedResults[pIndex].SCENARIO,
                PREDICTED: preOptimizedResults[pIndex].PREDICTED,
                PREDICTED_TIME: preOptimizedResults[pIndex].PREDICTED_TIME,
                OPT_STARTTIME: preOptimizedResults[pIndex].OPT_STARTTIME,
                DELTA_TIME: preOptimizedResults[pIndex].DELTA_TIME, 
                PREDICTED_STATUS: preOptimizedResults[pIndex].PREDICTED_STATUS,
                PRE_OPTIMIZED: preOptimizedResults[pIndex].PRE_OPTIMIZED,
                PRE_OPTIMIZED_TIME: preOptimizedResults[pIndex].PRE_OPTIMIZED_TIME,
                OPT_ALGORITHM : preOptimizedResults[pIndex].OPT_ALGORITHM};            
                predictionsTable.push(rowObj);   
        }

    }

    if(predictionsTable.length > 0)
    {
        let cqnQuery = {UPSERT:{ into: { ref: ['CP_TS_PREDICTIONS'] }, entries:  predictionsTable }};
        try {
            await cds.run(cqnQuery);
        }
        catch(exception) {
            console.log("cqnQuery ", cqnQuery, "locId : ",loc_id, "prodId : ", prod_id, );
            throw new Error(exception.toString());
        }
    }
    
    console.log("UNIQUE_ID ", UNIQUE_ID);
    sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                    "'" + UNIQUE_ID + "'" + "," +
                                    "'" + 'COMPLETED' + "'" + "," +
                                    "'" + OptRunTime + "'" + "," +
                                    "'" +  this.MAX_DEVIATION + "'" + "," +
                                    "'" +  loc_id + "'" + "," +
                                    "'" +  prod_id + "'" + "," +
                                    "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
    try {
        await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
        throw new Error(exception.toString());
    }

    console.log ("CP_OPTIMIZATION_STATUS sqlStr ", sqlStr);

    this.UUID = UNIQUE_ID;
    this.STATUS = 'COMPLETED';
    this.OPTIMIZATION_TIME = OptRunTime;
    this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

    return solutionStatus;

}

    _lpsolveUniqueIDs = async function ()
    {
    
    var lpsolve = require('lp_solve');
    var Row = lpsolve.Row;

    var lp = new lpsolve.LinearProgram();

    

    let UID_MIN_VALS = [7,1,10,1,12,4];

    
    let ibp_total_qty = 60;

    let ibp_planned_percent = [40,35,25,70,30,50,20,30];

    let ibp_planned_quantities = [];

    for (let ibpIdx = 0; ibpIdx < ibp_planned_percent.length; ibpIdx++)
    {
        ibp_planned_quantities[ibpIdx] =  ibp_total_qty*ibp_planned_percent[ibpIdx]/100;
    }

    console.log("ibp_planned_quantities ", ibp_planned_quantities);
    //    let ibp_penalties = [3,3,3,6,6,10,10,10];
        let ibp_penalties = [1,1,1,1,1,1,1,1];

    //    let ibp_penalties = [1,1,1,2,2,3,3,3];

    let CH_UID_MIN = [12,18, 24, 39, 15, 2, 27, 25];

    let UID_NUMS =['UID_1','UID_2','UID_3','UID_4','UID_5','UID_6'];
    let UIDVAL_COUNTS = [];

    for (let uidIdx = 0; uidIdx < UID_MIN_VALS.length; uidIdx++)
    {
        UIDVAL_COUNTS.push({"UID_NUM":UID_NUMS[uidIdx],"UID_VALS":UID_MIN_VALS[uidIdx]});
    }

    for (let uidIdx = 0; uidIdx < UIDVAL_COUNTS.length; uidIdx ++)
    {
        UIDVAL_COUNTS[uidIdx].UID_NUM = lp.addColumn(UIDVAL_COUNTS[uidIdx].UID_NUM,false,false); 
    }

    console.log("UIDVAL_COUNTS ", UIDVAL_COUNTS);
    let CHARVAL_NUMS = ['CH11','CH12', 'CH13','CH21','CH22','CH31','CH32','CH33'];

    let matrix = [];
    for (var uidIdx = 0; uidIdx < UID_NUMS.length; uidIdx++) {
        matrix[uidIdx]=[];
        for (var charvalIdx = 0; charvalIdx < CHARVAL_NUMS.length; charvalIdx++) {
            matrix[uidIdx][charvalIdx] = 0;
        }
    }
    matrix[0][0] =1;
    matrix[0][4] =1;
    matrix[0][7] =1;
    matrix[1][0] =1;
    matrix[1][4] =1;
    matrix[1][5] =1;
    matrix[2][1] =1;
    matrix[2][3] =1;
    matrix[2][7] =1;
    matrix[3][1] =1;
    matrix[3][4] =1;
    matrix[3][6] =1;
    matrix[4][2] =1;
    matrix[4][3] =1;
    matrix[4][6] =1;
    matrix[5][2] =1;
    matrix[5][3] =1;
    matrix[5][6] =1;

    let CHVAL_COUNTS = [];


    // let variable = UIDVAL_COUNTS[uidIdx].UID_NUM;
    // // variable = variable.replace(/'/g,'')
    // let constraint_var = new Row().Add(variable,0);
    // constraint_var = constraint_var.Add(variable, 1);

    for (var charvalIdx = 0; charvalIdx < CHARVAL_NUMS.length; charvalIdx++)
    {

        let charvalNums = new Row();
        let charvalNums_minus = new Row();
        
        for (let uidIdx = 0; uidIdx < UIDVAL_COUNTS.length; uidIdx ++)
        {
            if(matrix[uidIdx][charvalIdx] === 1)
            {
                charvalNums = charvalNums.Add(UIDVAL_COUNTS[uidIdx].UID_NUM, ibp_penalties[charvalIdx]);
                charvalNums_minus = charvalNums_minus.Add(UIDVAL_COUNTS[uidIdx].UID_NUM, -ibp_penalties[charvalIdx]);

            }
        } 
        
        // CHVAL_COUNTS.push({"CHVAL_NUM":CHARVAL_NUMS[charvalIdx], "CHVAL_VALUE":charvalNums});
        CHVAL_COUNTS.push({"CHVAL_NUM":CHARVAL_NUMS[charvalIdx], "CHVAL_VALUE":charvalNums,"CHVAL_VALUE_MINUS":charvalNums_minus, "IBP_QTY":ibp_planned_quantities[charvalIdx]});



    }


    for (let charvalIdx = 0; charvalIdx < CHVAL_COUNTS.length; charvalIdx ++)
    {
        CHVAL_COUNTS[charvalIdx].CHVAL_NUM = lp.addColumn(CHVAL_COUNTS[charvalIdx].CHVAL_NUM,false,false); 
    }

    // CHARVAL_NUMS[0] = UIDVAL_COUNTS[0].UID_NUM + UIDVAL_COUNTS[1].UID_NUM;
    // CHARVAL_NUMS[1] = UIDVAL_COUNTS[2].UID_NUM + UIDVAL_COUNTS[3].UID_NUM;
    // CHARVAL_NUMS[2] = UIDVAL_COUNTS[4].UID_NUM + UIDVAL_COUNTS[5].UID_NUM;
    // CHARVAL_NUMS[3] = UIDVAL_COUNTS[2].UID_NUM + UIDVAL_COUNTS[4].UID_NUM + UIDVAL_COUNTS[5].UID_NUM;
    // CHARVAL_NUMS[4] = UIDVAL_COUNTS[0].UID_NUM + UIDVAL_COUNTS[1].UID_NUM + UIDVAL_COUNTS[3].UID_NUM;
    // CHARVAL_NUMS[5] = UIDVAL_COUNTS[1].UID_NUM;
    // CHARVAL_NUMS[6]  = UIDVAL_COUNTS[3].UID_NUM + UIDVAL_COUNTS[4].UID_NUM + UIDVAL_COUNTS[5].UID_NUM;
    // CHARVAL_NUMS[7] = UIDVAL_COUNTS[0].UID_NUM + UIDVAL_COUNTS[2].UID_NUM;

    // let CHARVAL_VALS =[12,18,24,39,15,2,27,25];


    
    console.log(" CHVAL_COUNTS ",  CHVAL_COUNTS);


    for (var charvalIdx = 0; charvalIdx < CHARVAL_NUMS.length; charvalIdx++)
    {

        let constraint_var = new Row();
        let constraint_var_minus = new Row();


        for (let uidIdx = 0; uidIdx < UIDVAL_COUNTS.length; uidIdx ++)
        {
            if(matrix[uidIdx][charvalIdx] === 1)
            {
                
                // constraint_var = constraint_var.Add(UIDVAL_COUNTS[uidIdx].UID_NUM, ibp_penalties[charvalIdx]);
                // constraint_var_minus = constraint_var_minus.Add(UIDVAL_COUNTS[uidIdx].UID_NUM, -ibp_penalties[charvalIdx]);
                constraint_var = constraint_var.Add(UIDVAL_COUNTS[uidIdx].UID_NUM, 1);
                constraint_var_minus = constraint_var_minus.Add(UIDVAL_COUNTS[uidIdx].UID_NUM, -1);

            }
        }   


        constraint_var = constraint_var.Add(CHVAL_COUNTS[charvalIdx].CHVAL_NUM, -1);
        constraint_var_minus = constraint_var_minus.Add(CHVAL_COUNTS[charvalIdx].CHVAL_NUM, -1);

        lp.addConstraint(constraint_var, 'LE', CHVAL_COUNTS[charvalIdx].IBP_QTY, "'" + CHVAL_COUNTS[charvalIdx].CHVAL_NUM + "^+ constraint");
        lp.addConstraint(constraint_var_minus, 'LE', -CHVAL_COUNTS[charvalIdx].IBP_QTY, "'" + CHVAL_COUNTS[charvalIdx].CHVAL_NUM + "^- constraint");

            
        //    lp.addConstraint(constraint_var, 'LE', CHVAL_COUNTS[charvalIdx].IBP_QTY, "'" + CHVAL_COUNTS[charvalIdx].CHVAL_NUM + "^+ constraint");
        //    lp.addConstraint(constraint_var_minus, 'GE', -CHVAL_COUNTS[charvalIdx].IBP_QTY, "'" + CHVAL_COUNTS[charvalIdx].CHVAL_NUM + "^- constraint");

        // lp.addConstraint(constraint_var, 'EQ', CHVAL_COUNTS[charvalIdx].IBP_QTY, "'" + CHVAL_COUNTS[charvalIdx].CHVAL_NUM + "^+ constraint");

    }
    

    for (let uidIdx = 0; uidIdx < UIDVAL_COUNTS.length; uidIdx++)
    {
        let variable = UIDVAL_COUNTS[uidIdx].UID_NUM;
        // variable = variable.replace(/'/g,'')
        let constraint_var = new Row().Add(variable,0);
        constraint_var = constraint_var.Add(variable, 1);
        lp.addConstraint(constraint_var, 'GE', UID_MIN_VALS[uidIdx], UIDVAL_COUNTS[uidIdx].UID_NUM);
    }

                            
    let uid_all_constraint = new Row().Add(UIDVAL_COUNTS[0].UID_NUM,1)
                            .Add(UIDVAL_COUNTS[1].UID_NUM,1)
                            .Add(UIDVAL_COUNTS[2].UID_NUM,1)
                            .Add(UIDVAL_COUNTS[3].UID_NUM,1)
                            .Add(UIDVAL_COUNTS[4].UID_NUM,1)
                            .Add(UIDVAL_COUNTS[5].UID_NUM,1);  

    lp.addConstraint(uid_all_constraint, 'EQ', ibp_total_qty, 'UID_ALL_NUMS');


    




    let objective = new Row();
    for (var charvalIdx = 0; charvalIdx < CHVAL_COUNTS.length; charvalIdx++)
    {

            objective.Add(CHVAL_COUNTS[charvalIdx].CHVAL_NUM,ibp_penalties[charvalIdx])
            // objective.Add(CHVAL_COUNTS[charvalIdx].CHVAL_NUM,1)


    }


    //    7
    //    1
    //    10
    //    1
    //    12
    //    4
    
        // objective = objective.Add(UIDVAL_COUNTS[0].UID_NUM,8).Add(UIDVAL_COUNTS[1].UID_NUM,8);
        // objective = objective.Add(UIDVAL_COUNTS[2].UID_NUM,7).Add(UIDVAL_COUNTS[3].UID_NUM,7);    
        // objective = objective.Add(UIDVAL_COUNTS[4].UID_NUM,5).Add(UIDVAL_COUNTS[5].UID_NUM,5);

        // objective = objective.Add(UIDVAL_COUNTS[2].UID_NUM,7).Add(UIDVAL_COUNTS[4].UID_NUM,7).Add(UIDVAL_COUNTS[5].UID_NUM,7);
        // objective = objective.Add(UIDVAL_COUNTS[0].UID_NUM,7).Add(UIDVAL_COUNTS[1].UID_NUM,7).Add(UIDVAL_COUNTS[3].UID_NUM,7);

        // objective = objective.Add(UIDVAL_COUNTS[1].UID_NUM,10);
        // objective = objective.Add(UIDVAL_COUNTS[3].UID_NUM,10).Add(UIDVAL_COUNTS[4].UID_NUM,10).Add(UIDVAL_COUNTS[5].UID_NUM,10);
        // objective = objective.Add(UIDVAL_COUNTS[0].UID_NUM,10).Add(UIDVAL_COUNTS[2].UID_NUM,10);
    

    /****************************/
    //    objective = objective.Add(UIDVAL_COUNTS[0].UID_NUM,3).Add(UIDVAL_COUNTS[1].UID_NUM,3);
    //    objective = objective.Add(UIDVAL_COUNTS[2].UID_NUM,3).Add(UIDVAL_COUNTS[3].UID_NUM,3);    
    //    objective = objective.Add(UIDVAL_COUNTS[4].UID_NUM,3).Add(UIDVAL_COUNTS[5].UID_NUM,3);

    //    objective = objective.Add(UIDVAL_COUNTS[2].UID_NUM,6).Add(UIDVAL_COUNTS[4].UID_NUM,6).Add(UIDVAL_COUNTS[5].UID_NUM,6);
    //    objective = objective.Add(UIDVAL_COUNTS[0].UID_NUM,6).Add(UIDVAL_COUNTS[1].UID_NUM,6).Add(UIDVAL_COUNTS[3].UID_NUM,6);

    //    objective = objective.Add(UIDVAL_COUNTS[1].UID_NUM,10);
    //    objective = objective.Add(UIDVAL_COUNTS[3].UID_NUM,10).Add(UIDVAL_COUNTS[4].UID_NUM,10).Add(UIDVAL_COUNTS[5].UID_NUM,10);
    //    objective = objective.Add(UIDVAL_COUNTS[0].UID_NUM,10).Add(UIDVAL_COUNTS[2].UID_NUM,10);
    /*********************************/


    
    lp.setObjective(objective,true);

    console.log("objective = ", objective );



    /********************************************* */

    console.log(lp.dumpProgram());
    console.log(lp.solve());
    console.log('objective =', lp.getObjectiveValue());
    console.log('solution variables =', lp.getSolutionVariables());
        

    }

    _lpsolveExcel_working = async function()
    {
        var lpsolve = require('lp_solve');
        var Row = lpsolve.Row;

        var lp = new lpsolve.LinearProgram();

        var x = lp.addColumn('x',true,false); // TV Set
        var y = lp.addColumn('y',true,false); // Strereo
        var z = lp.addColumn('z',true,false); // Speaker


        var objective = new Row().Add(x, 75*100,false).Add(y, 50*100,false).Add(z,35*100,false);

        // lp.setObjective(objective);
    // Set the Objective function to Maximize (minimize = false)

        lp.setObjective(objective,false);

        var chasis = new Row().Add(x, 100).Add(y, 100);

        var pictureTube = new Row().Add(x, 100);

        var speaker = new Row().Add(x, 200).Add(y, 200).Add(z,100);


        var powerSupply = new Row().Add(x,100).Add(y, 100);

        var electronic = new Row().Add(x, 200).Add(y, 100).Add(z, 100);


        lp.setObjective(objective,false);



    // Maximum Demand

        lp.addConstraint(chasis, 'LE', 450, 'chasis');
        lp.addConstraint(pictureTube, 'LE', 250, 'pictureTube');
        lp.addConstraint(speaker, 'LE', 800, 'speaker');
        lp.addConstraint(powerSupply, 'LE', 450, 'powerSupply');
        lp.addConstraint(electronic, 'LE', 600, 'electronic');

        console.log(lp.dumpProgram());
        console.log(lp.solve());
        console.log('objective =', lp.getObjectiveValue())
        console.log('x =', lp.get(x));
        console.log('y =', lp.get(y));
        console.log('z =', lp.get(z));

        console.log('chasis =', lp.calculate(chasis));
        console.log('pictureTube =', lp.calculate(pictureTube));
        console.log('speaker =', lp.calculate(speaker));
        console.log('powerSupply =', lp.calculate(powerSupply));
        console.log('electronic =', lp.calculate(electronic));

    }


    _lpsolveExcel = async function _lpsolveExcel()
    {
        var lpsolve = require('lp_solve');
        var Row = lpsolve.Row;

        var lp = new lpsolve.LinearProgram();

        var x = lp.addColumn('x',true,false); // TV Set
        var y = lp.addColumn('y',true,false); // Strereo
        var z = lp.addColumn('z',true,false); // Speaker

        // var variables = [100,100,150];

        var variables = [1,1,1];

        var objective = new Row().Add(x, 75*variables[0],false).Add(y, 50*variables[1],false).Add(z,35*variables[2],false);

        // lp.setObjective(objective);
    // Set the Objective function to Maximize (minimize = false)

        
        lp.setObjective(objective,false);



        var chasis = new Row().Add(x, variables[0]).Add(y, variables[1]);

        var pictureTube = new Row().Add(x, variables[0]);

        var speaker = new Row().Add(x, 2*variables[0]).Add(y, 2*variables[1]).Add(z,variables[2]);


        var powerSupply = new Row().Add(x,variables[0]).Add(y, variables[1]);

        var electronic = new Row().Add(x, 2*variables[0]).Add(y, variables[1]).Add(z, variables[2]);


        lp.setObjective(objective,false);



    // Maximum Demand

        lp.addConstraint(chasis, 'LE', 450, 'chasis');

        lp.addConstraint(chasis, 'LE', 450, 'chasis');
        lp.addConstraint(pictureTube, 'LE', 250, 'pictureTube');
        lp.addConstraint(speaker, 'LE', 800, 'speaker');
        lp.addConstraint(powerSupply, 'LE', 450, 'powerSupply');
        lp.addConstraint(electronic, 'LE', 600, 'electronic');

        console.log(lp.dumpProgram());
        console.log(lp.solve());
        console.log('objective =', lp.getObjectiveValue())
        console.log('x =', lp.get(x));
        console.log('y =', lp.get(y));
        console.log('z =', lp.get(z));

        console.log('chasis =', lp.calculate(chasis));
        console.log('pictureTube =', lp.calculate(pictureTube));
        console.log('speaker =', lp.calculate(speaker));
        console.log('powerSupply =', lp.calculate(powerSupply));
        console.log('electronic =', lp.calculate(electronic));

    }

    // genetic algorithm
    _ga_generic_UniqueIDS = async function(LOCATION_ID, PRODUCT_ID, TYPE, 
        MODEL_VERSION, VERSION, SCENARIO, ALGORITHM, FACTOR, CAL_DATE,
        MODEL_TYPE, MODEL_PROFILE,PENALTY_EXISTS, INPUT_PENALTY,UNIQUE_ID, RUNTIME,CHAR_WEIGHTAGE)
    {
        console.log("_ga_generic_UniqueIDS LOCATION_ID ", LOCATION_ID, "PRODUCT_ID ", PRODUCT_ID, "TYPE ", TYPE, "CAL_DATE ", CAL_DATE);
        console.log("_ga_generic_UniqueIDS PENALTY_EXISTS ", PENALTY_EXISTS, "INPUT_PENALTY ", INPUT_PENALTY, "UNIQUE_ID", UNIQUE_ID, "RUNTIME", RUNTIME,"CHAR_WEIGHTAGE",CHAR_WEIGHTAGE);

        // const optimize = require('genetic-algorithm')
        // const optimize = require('geneticalgorithm');

        let cal_date = CAL_DATE;
        this.CAL_DATE = CAL_DATE;

        let loc_id = LOCATION_ID;
        let prod_id = PRODUCT_ID;
        let objType = TYPE;
        let modelVersion = MODEL_VERSION;
        let ibpVersion = VERSION;
        let ibpScenario = SCENARIO;
        let algorithm = ALGORITHM;
        let modelType = MODEL_TYPE;
        let modelProfile = MODEL_PROFILE;

        let resultsByCharValNum;


        // SELECT DISTINCT CHARACTERISTICS AND CHARVALS OF THE PRODUCT
        let sqlStr = 'SELECT DISTINCT PBC.CHAR_NUM, CHVAL.CHARVAL_NUM' + 
                    ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
                    ' INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                    ' PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
                    ' AND PBC.LOCATION_ID = IFC.LOCATION_ID ' +
                    ' AND PBC.PRODUCT_ID = IFC.PRODUCT_ID ' +
                    ' AND PBC.CAL_DATE = IFC.WEEK_DATE ' +
                    // ' RIGHT JOIN V_CHARVAL AS CHVAL ON ' +
                    // ' PBC.CHAR_NUM = CHVAL.CHAR_NUM ' +
                    ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND "OBJ_TYPE" =  ' + "'" + objType + "'" +
                    ' AND PBC.MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
                    ' ORDER BY CHAR_NUM, CHARVAL_NUM';

        try {
            resultsByCharValNum = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        // console.log("_gd_generic_UniqueIDS resultsByCharValNum length =",resultsByCharValNum.length);

        var resultsByCharNum;
        sqlStr = 'SELECT DISTINCT PBC.CHAR_NUM' + 
                    ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
                    ' INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                    ' PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
                    ' AND PBC.LOCATION_ID = IFC.LOCATION_ID ' +
                    ' AND PBC.PRODUCT_ID = IFC.PRODUCT_ID ' +
                    ' AND PBC.CAL_DATE = IFC.WEEK_DATE ' +
                    // ' RIGHT JOIN V_CHARVAL AS CHVAL ON ' +
                    // ' PBC.CHAR_NUM = CHVAL.CHAR_NUM ' +
                    ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                    ' AND PBC.MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
                    ' ORDER BY CHAR_NUM ';
                ' ORDER BY CLASS_NUM, CHAR_NUM ';
        try {
            resultsByCharNum = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        // PREDICTED VALUES BY PRIMARY IDS (=OBJ_DEP+ '_' + OBJ_COUNTER)
        var results;
        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, OPT_STARTTIME, DELTA_TIME, PRE_OPTIMIZED, PRE_OPTIMIZED_TIME FROM CP_V_PREDICTIONS_BY_CHAR' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND "CAL_DATE" =  ' + "'" + cal_date + "'" +
                ' ORDER BY LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER';
        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        // console.log("_ga_generic_UniqueIDS sqlStr =",sqlStr);
        // console.log("_ga_generic_UniqueIDS results =",results);
        let optStartTime = new Date().toISOString();
        let deltaTime = results[0].DELTA_TIME;
        if( deltaTime == null)
        {
            deltaTime = results[0].PRE_OPTIMIZED_TIME;
        }
        for (let index = 0; index < results.length; index++)
        {
            let primary_id = results[index].LOCATION_ID + '#' + 
            results[index].PRODUCT_ID + '#' +
            results[index].OBJ_DEP + '#' +  results[index].OBJ_COUNTER;
            this.PRIMARY_IDS.push({"PRIMARY_ID": primary_id, "DELTA":results[index].DELTA, "PREDICTED":results[index].PRE_OPTIMIZED, 
                                    "PREDICTED_TIME":results[index].PRE_OPTIMIZED_TIME,
                                    "OPT_STARTTIME":optStartTime,"DELTA_TIME": deltaTime,
                                    "RESTORE_TIME":results[index].OPT_STARTTIME
                                });

        }


        // console.log("_ga_generic_UniqueIDS PRIMARY_IDS =",PRIMARY_IDS);



        // console.log("_ga_generic_UniqueIDS PRIMARY_IDS_PREDVALS =",PRIMARY_IDS_PREDVALS);

        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, CHAR_NUM, CHARVAL_NUM, PRE_OPTIMIZED, PRE_OPTIMIZED_TIME FROM CP_V_PREDICTIONS_BY_CHAR' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND "CAL_DATE" =  ' + "'" + cal_date + "'" +
                ' ORDER BY LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, CHAR_NUM, CHARVAL_NUM';

        var predictedVals;
        try {
            predictedVals = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        // console.log("_ga_generic_UniqueIDS predictedVals =",predictedVals);

        this.PRIMARY_IDS_COUNT = predictedVals.length;
        this.MAX_DEVIATION = Math.pow(10,10);
        if (this.PRIMARY_IDS_COUNT > 100)
        {
            this.GD_DELTA_DEVIATION = 10;
        }
        else
        {
            this.GD_DELTA_DEVIATION = 5;
        }

        for (let pvalIndex = 0; pvalIndex < predictedVals.length; pvalIndex++)
        {
            let pvalId = predictedVals[pvalIndex].LOCATION_ID + '#' + 
            predictedVals[pvalIndex].PRODUCT_ID + '#' +
            predictedVals[pvalIndex].OBJ_DEP + '#' +  predictedVals[pvalIndex].OBJ_COUNTER;
            let pvalCharNum = predictedVals[pvalIndex].CHAR_NUM;
            let pvalCharValNum = predictedVals[pvalIndex].CHARVAL_NUM;

            this.PRIMARY_IDS_PREDVALS.push({"PRIMARY_ID": pvalId,"CHAR_NUM": pvalCharNum, "CHARVAL_NUM": pvalCharValNum, "PREDICTED": predictedVals[pvalIndex].PRE_OPTIMIZED});

        }



        // var CHARVAL_COUNTS = [];
        var LOC_PROD_ID = loc_id + '#' + prod_id;

        for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
        {

            this.CHARVAL_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": resultsByCharValNum[charNumIndex].CHAR_NUM, "CHARVAL_NUM" : resultsByCharValNum[charNumIndex].CHARVAL_NUM, "PREDICTED": 0});                  
        }
        // console.log("_ga_generic_UniqueIDS this.CHARVAL_COUNTS =",this.CHARVAL_COUNTS);

        // console.log(" Before Adding Variables for CHVAL_COUNTS")


        // console.log(" After Adding Variables for this.CHARVAL_COUNTS")

        for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
        {
            for (let pidIndex = 0; pidIndex < this.PRIMARY_IDS_PREDVALS.length; pidIndex++)
            {


                if( (this.CHARVAL_COUNTS[charNumIndex].CHAR_NUM === this.PRIMARY_IDS_PREDVALS[pidIndex].CHAR_NUM) &&
                    (this.CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM === this.PRIMARY_IDS_PREDVALS[pidIndex].CHARVAL_NUM) )
                {

                    this.CHARVAL_COUNTS[charNumIndex].PREDICTED = this.CHARVAL_COUNTS[charNumIndex].PREDICTED + this.PRIMARY_IDS_PREDVALS[pidIndex].PREDICTED;
                }

            }
        }

        let UID_CHARVAL_MATRIX = [];
        for (var uidIdx = 0; uidIdx < this.PRIMARY_IDS.length; uidIdx++) 
        {
            UID_CHARVAL_MATRIX[uidIdx]=[];
            for (var charvalIdx = 0; charvalIdx < this.CHARVAL_COUNTS.length; charvalIdx++) 
            {
                UID_CHARVAL_MATRIX[uidIdx][charvalIdx] = 0;
            }
        }

        for (let pidIndex = 0; pidIndex < this.PRIMARY_IDS.length; pidIndex++)
        {
            for (let pvalIndex = 0; pvalIndex < this.PRIMARY_IDS_PREDVALS.length; pvalIndex++)

            {
                if(this.PRIMARY_IDS[pidIndex].PRIMARY_ID === this.PRIMARY_IDS_PREDVALS[pvalIndex].PRIMARY_ID)
                {
                    for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)

                    {
                    // console.log("charNumIndex ", charNumIndex, "pidIndex", pidIndex, this.CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM, PRIMARY_IDS_PREDVALS[pvalIndex].CHARVAL_NUM);

                        if( (this.CHARVAL_COUNTS[charNumIndex].CHAR_NUM === this.PRIMARY_IDS_PREDVALS[pvalIndex].CHAR_NUM) &&
                            (this.CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM === this.PRIMARY_IDS_PREDVALS[pvalIndex].CHARVAL_NUM) )
                        {

                            // this.CHARVAL_COUNTS[charNumIndex].PREDICTED = this.CHARVAL_COUNTS[charNumIndex].PREDICTED + PRIMARY_IDS_PREDVALS[pidIndex].PREDICTED;
                            UID_CHARVAL_MATRIX[pidIndex][charNumIndex] = 1;
                            // console.log("UID_CHARVAL_MATRIX[",pidIndex, "]", "[",charNumIndex, "]", UID_CHARVAL_MATRIX[pidIndex][charNumIndex])

                        }

                    }
                }
            }
        }

        // console.log("UID_CHARVAL_MATRIX ", UID_CHARVAL_MATRIX);





        // console.log("_ga_generic_UniqueIDS this.CHARVAL_COUNTS =",this.CHARVAL_COUNTS);

        // console.log("_ga_generic_UniqueIDS resultsByCharNum =",resultsByCharNum);


        // var CHAR_COUNTS = [];
        for (let charIndex = 0; charIndex < resultsByCharNum.length; charIndex ++)
        {
            let charCount = 0;

            for (let charValIndex = 0; charValIndex < resultsByCharValNum.length; charValIndex++)   
            {
                if( resultsByCharNum[charIndex].CHAR_NUM === this.CHARVAL_COUNTS[charValIndex].CHAR_NUM)
                {
                    charCount = charCount + this.CHARVAL_COUNTS[charValIndex].PREDICTED;
                } 
            }
            this.CHAR_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": resultsByCharNum[charIndex].CHAR_NUM, "PREDICTED": charCount});              

        }



        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, "VERSION", "SCENARIO", CHAR_NUM, CHARVAL_NUM,  OPT_QTY '+
                ' FROM CP_V_IBP_FCHARPLAN_BY_PRIMARY_CHARS' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND "WEEK_DATE" =  ' + "'" + cal_date + "'" +
                ' AND "MODEL_VERSION" = ' + "'" + modelVersion + "'" +
                ' ORDER BY LOCATION_ID, PRODUCT_ID, "VERSION", "SCENARIO", CHAR_NUM, CHARVAL_NUM';

        let ibpResultsByCharvalNum;
        try {
            ibpResultsByCharvalNum = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        // console.log("ibpResultsByCharvalNum ", ibpResultsByCharvalNum);
        // let IBP_CHARVAL_COUNTS = [];


        // INITIALIZE SIZE OF IBP option quantities to be in sync with BTP predicted quantities
        for (let charvalIndex = 0; charvalIndex < this.CHARVAL_COUNTS.length; charvalIndex ++)
        {

            this.IBP_CHARVAL_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": this.CHARVAL_COUNTS[charvalIndex].CHAR_NUM, 
                "CHARVAL_NUM": this.CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM, "IBP_OPT_QTY": 0});              
        }

        // UPDATE IBP option quantities from ibpResultsByCharvalNum

        for (let charvalIndex = 0; charvalIndex < this.CHARVAL_COUNTS.length; charvalIndex ++)
        {
            for (let ibpIdx = 0; ibpIdx < ibpResultsByCharvalNum.length; ibpIdx ++)
            {

                if( (this.CHARVAL_COUNTS[charvalIndex].LOC_PROD_ID  == (ibpResultsByCharvalNum[ibpIdx].LOCATION_ID + '#' + ibpResultsByCharvalNum[ibpIdx].PRODUCT_ID )) &&
                    (this.CHARVAL_COUNTS[charvalIndex].CHAR_NUM  == ibpResultsByCharvalNum[ibpIdx].CHAR_NUM) &&
                    (this.CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM  == ibpResultsByCharvalNum[ibpIdx].CHARVAL_NUM) )
                {
                    this.IBP_CHARVAL_COUNTS[charvalIndex].CHAR_NUM = ibpResultsByCharvalNum[ibpIdx].CHAR_NUM;
                    this.IBP_CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM = ibpResultsByCharvalNum[ibpIdx].CHARVAL_NUM;
                    this.IBP_CHARVAL_COUNTS[charvalIndex].IBP_OPT_QTY = ibpResultsByCharvalNum[ibpIdx].OPT_QTY;
                }

            }
        }

        // console.log("IBP_CHARVAL_COUNTS = ", this.IBP_CHARVAL_COUNTS);

        // let IBP_CHAR_COUNTS = [];
        // INITIALIZE SIZE OF IBP char quantities to be in sync with BTP predicted char quantities
        for (let charIndex = 0; charIndex < this.CHAR_COUNTS.length; charIndex ++)
        {

            this.IBP_CHAR_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": this.CHAR_COUNTS[charIndex].CHAR_NUM, "IBP_CHAR_QTY": 0});              
        }

        // UPDATE IBP option quantities from ibpResultsByCharvalNum

        for (let charIndex = 0; charIndex < this.CHAR_COUNTS.length; charIndex ++)
        {
            let charCount = 0;
            for (let charvalIdx = 0; charvalIdx < this.IBP_CHARVAL_COUNTS.length; charvalIdx ++)
            {


                if( (this.IBP_CHAR_COUNTS[charIndex].LOC_PROD_ID  == this.IBP_CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID) &&
                    (this.IBP_CHAR_COUNTS[charIndex].CHAR_NUM  == this.IBP_CHARVAL_COUNTS[charvalIdx].CHAR_NUM)  )
                {
                    this.IBP_CHAR_COUNTS[charIndex].IBP_CHAR_QTY = this.IBP_CHAR_COUNTS[charIndex].IBP_CHAR_QTY +
                                                    Number(this.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY);
                }

            }
        }

        if ( this.IBP_CHAR_COUNTS.length == 0)
        {
            console.log("NOTHING to Optimize");
            // let startMilliSecs = new Date().getTime();
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs + 50;
            console.log("UNIQUE_ID ", UNIQUE_ID);
            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                        "'" + UNIQUE_ID + "'" + "," +
                        "'" + 'COMPLETED' + "'" + "," +
                        "'" + OptRunTime + "'" + "," +
                        "'" +  this.MAX_DEVIATION + "'" + "," +
                        "'" +  loc_id + "'" + "," +
                        "'" +  prod_id + "'" + "," +
                        "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';                      

            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("GA OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return;
        }

        let ibp_total_qty = this.IBP_CHAR_COUNTS[0].IBP_CHAR_QTY;

        // console.log("IBP_CHAR_COUNTS = ", this.IBP_CHAR_COUNTS);


        let ibp_penalties =  [];
        for (let ibpIdx = 0; ibpIdx < this.IBP_CHARVAL_COUNTS.length; ibpIdx ++)
        {
            // ibp_penalties[ibpIdx] = 1;
            // ibp_penalties[ibpIdx] = 100;
            // ibp_penalties[ibpIdx] = 10;
            ibp_penalties[ibpIdx] = INPUT_PENALTY;
        }


        
        console.log("ibp_penalties = ", ibp_penalties);



        // console.log("global.objective ", global.objective);

        sqlStr = 'SELECT SUM(PRE_OPTIMIZED) AS TOTAL_PREDICTED FROM V_CP_TS_PREDICTIONS_TELESCOPIC  ' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND CAL_DATE =  ' + "'" + cal_date + "'";

        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        let loc_prod_predicted = 0;

        if (results.length > 0)
        {
            loc_prod_predicted = results[0].TOTAL_PREDICTED;
        }

        sqlStr = 'SELECT QUANTITY FROM V_IBP_FUTUREDEMAND_TELESCOPIC  ' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND WEEK_DATE =  ' + "'" + cal_date + "'";
        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        console.log("IBP FUTURE DEMAND sqlStr ", sqlStr);

        let loc_prod_ibp_qty = 0;

        if (results.length > 0)
        {
            loc_prod_ibp_qty = results[0].QUANTITY;
        }

        if(loc_prod_ibp_qty == 0)
        {
            console.log("Optimization will not be done, please check why loc_prod_ibp_qty is ", loc_prod_ibp_qty);
            // let endMilliSecs = new Date().getTime();
            // OptRunTime = endMilliSecs - startMilliSecs;
            // console.log("UNIQUE_ID ", UNIQUE_ID);

            // let startMilliSecs = new Date().getTime();
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs + 50;
            console.log("UNIQUE_ID ", UNIQUE_ID);

            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                        "'" + UNIQUE_ID + "'" + "," +
                        "'" + 'COMPLETED' + "'" + "," +
                        "'" + OptRunTime + "'" + "," +
                        "'" +  this.MAX_DEVIATION + "'" + "," +
                        "'" +  loc_id + "'" + "," +
                        "'" +  prod_id + "'" + "," +
                        "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("GD OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return;
        }
        let min_qty_factor = 0;
        if( loc_prod_predicted >= loc_prod_ibp_qty)
        {
            // min_qty_factor = 0.9 * loc_prod_ibp_qty/loc_prod_predicted;
            min_qty_factor = FACTOR * loc_prod_ibp_qty/loc_prod_predicted;
        }
        else
        {
            // min_qty_factor = 0.9 *  loc_prod_predicted/loc_prod_ibp_qty;
            min_qty_factor = FACTOR *  loc_prod_predicted/loc_prod_ibp_qty;

        }

        console.log("loc_prod_predicted ", loc_prod_predicted, "loc_prod_ibp_qty =",loc_prod_ibp_qty,  "OptFactor =", FACTOR, "min_qty_factor", min_qty_factor);

        if ( loc_prod_ibp_qty == 0)
        {
            console.log("NOTHING to Optimize");
            // let endMilliSecs = new Date().getTime();
            // OptRunTime = endMilliSecs - startMilliSecs;
            // console.log("UNIQUE_ID ", UNIQUE_ID);

            // let startMilliSecs = new Date().getTime();
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs + 50;
            console.log("UNIQUE_ID ", UNIQUE_ID);

            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                        "'" + UNIQUE_ID + "'" + "," +
                        "'" + 'COMPLETED' + "'" + "," +
                        "'" + OptRunTime + "'" + "," +
                        "'" +  this.MAX_DEVIATION + "'" + "," +
                        "'" +  loc_id + "'" + "," +
                        "'" +  prod_id + "'" + "," +
                        "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("GENETIC ALGORITHM OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return  this.MAX_DEVIATION;
        }
        // console.log("AFTER // ADD CONSTRAINTS ON PRIMARY IDS")


        // console.log("AFTER  // ADD PRIMARY ID VALUES WHOSE VALUES ARE TO BE ESTIMATED BY SOLVER")


        console.log("loc_prod_predicted ", loc_prod_predicted, "loc_prod_ibp_qty =",loc_prod_ibp_qty,  "min_qty_factor", min_qty_factor);


        let minimum_qtys = [];



        let pid_total_var = '';
        // let min_qty_penalty = 6;
        // let total_qty_penalty = 18;
        let min_qty_penalty = 1;

        let total_qty_penalty = 1;


        // let min_qty_penalty = 1;
        // let total_qty_penalty = 1;
        var that = this;

        global.objective = '';
        // This function block inline is for global.objective creation with setTimeout 
        // It is to prevent switching over during creation of objective function

        // Initialize the variable `done` to `undefined`
        // Create the function wait, which is available inside itself
        // Note: `var` is hoisted but `let` is not so we need to use `var`

        var done = (function wait () {

        // As long as it's nor marked as done, create a new event+queue
        if (!done) setTimeout(wait, 100);

        // No return value; done will resolve to false (undefined)
        for (var charvalIdx = 0; charvalIdx < that.CHARVAL_COUNTS.length; charvalIdx++)
        {

            let chUids = '';


            for (let uidIdx = 0; uidIdx < that.PRIMARY_IDS.length; uidIdx ++)
            {
                if(UID_CHARVAL_MATRIX[uidIdx][charvalIdx] === 1)
                {              
                    chUids = chUids + that.PRIMARY_IDS[uidIdx].PRIMARY_ID + ' + ' ; //+ '\r\n';
                }
            }   

            // chUids = chUids + '-' + this.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY;
            // chUids = chUids + '-' + that.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY;
            if(that.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY < 0)
            {
                chUids = chUids + '+' + (that.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY);
            }
            else
            {
                // chUids = chUids + '+' + that.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY;
                chUids = chUids + '+' + (-1*that.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY);

            }


            // console.log("chUids ", chUids);

            global.objective = global.objective + '+' + ibp_penalties[charvalIdx] + '*Math.pow((' + chUids + '),2) ' + '+' + '\r\n'; 


            // console.log("global.objective ", global.objective);


        }
        for (let pidIndex = 0; pidIndex < that.PRIMARY_IDS.length; pidIndex++)
        {
            // let variable = PRIMARY_IDS[pidIndex].PRIMARY_ID;
            // variable = variable.replace(/'/g,'');
            pid_total_var = pid_total_var + '+' + that.PRIMARY_IDS[pidIndex].PRIMARY_ID; 
            // Apply a penalty of 2 for minimum constraints
            if( min_qty_factor*(that.PRIMARY_IDS[pidIndex].PREDICTED) >= 0 )
            {
                global.objective = global.objective + '+' + min_qty_penalty + '*Math.pow((' + that.PRIMARY_IDS[pidIndex].PRIMARY_ID + '-' + min_qty_factor*(that.PRIMARY_IDS[pidIndex].PREDICTED) + '),2) ' + '+' + '\r\n';
            }
            else
            {
                global.objective = global.objective + '+' + min_qty_penalty + '*Math.pow((' + that.PRIMARY_IDS[pidIndex].PRIMARY_ID + '+' + min_qty_factor*(that.PRIMARY_IDS[pidIndex].PREDICTED) + '),2) ' + '+' + '\r\n';
            }
            minimum_qtys[pidIndex] = min_qty_factor*(that.PRIMARY_IDS[pidIndex].PREDICTED);

        }


        // Apply a penalty for Total constraint
        // global.objective = global.objective + total_qty_penalty +'*Math.pow((' + pid_total_var + '-' + ibp_total_qty + '),2) ';

        global.objective = global.objective + '+' + total_qty_penalty +'*Math.pow((' + pid_total_var + '-' + ibp_total_qty + '),2) ';
        //    console.log(" in var done global.objective ", global.objective);
        //    console.log(" in var done minimum_qtys ", minimum_qtys);

        done = true;
        })();
        await this._setGlobalObjective(global.objective);

        // this.globalObjective = global.objective;


        // console.log(" this.globalObjective ", await this._getGlobalObjective())
        // console.log(" PRIMARY_IDS ", await this._getPrimaryIds())
        

        let min_pid_total_qty = 0;
        for(let minIdx = 0; minIdx < minimum_qtys.length; minIdx++)
        {
            min_pid_total_qty = min_pid_total_qty + minimum_qtys[minIdx];

        } 

        let factored_minimum_qtys = [];
        for(let minIdx = 0; minIdx < minimum_qtys.length; minIdx++)
        {
            factored_minimum_qtys[minIdx] = (loc_prod_ibp_qty/min_pid_total_qty)*minimum_qtys[minIdx];
        }

        

        let ibp_planned_quantities = [];
        let btp_predicted_quantities = [];
        let ibp_all_charval_qtys = 0;
        console.log("Before ibp_all_charval_qtys ", ibp_all_charval_qtys);
        // console.log("IBP_CHARVAL_COUNTS ", this.IBP_CHARVAL_COUNTS);

        for (let ibpIdx = 0; ibpIdx < this.IBP_CHARVAL_COUNTS.length; ibpIdx++)
        {
            ibp_planned_quantities[ibpIdx] = this.IBP_CHARVAL_COUNTS[ibpIdx].IBP_OPT_QTY;
            btp_predicted_quantities[ibpIdx] = this.CHARVAL_COUNTS[ibpIdx].PREDICTED;
            ibp_all_charval_qtys = ibp_all_charval_qtys + parseInt(this.IBP_CHARVAL_COUNTS[ibpIdx].IBP_OPT_QTY);
        }


        console.log("ibp_planned_quantities ", ibp_planned_quantities);
        console.log("btp_predicted_quantities ", btp_predicted_quantities);
        // console.log("After ibp_all_charval_qtys ", ibp_all_charval_qtys);
        console.log("ibp_all_charval_qtys ", ibp_all_charval_qtys);
        // console.log("rangeMin - minimum_qtys ", minimum_qtys);
        // console.log("rangeMax ", rangeMax);

        // console.log("init ", init);



        if ( ibp_all_charval_qtys == 0)
        {
            console.log("ibp_all_charval_qtys ", ibp_all_charval_qtys);
            console.log("NOTHING TO OPTIMIZE - RETURNING FOR CAL_DATE ", CAL_DATE);
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs;
            console.log("UNIQUE_ID ", UNIQUE_ID);
            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                        "'" + UNIQUE_ID + "'" + "," +
                        "'" + 'COMPLETED' + "'" + "," +
                        "'" + OptRunTime + "'" + "," +
                        "'" +  this.MAX_DEVIATION + "'" + "," +
                        "'" +  loc_id + "'" + "," +
                        "'" +  prod_id + "'" + "," +
                        "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("GENETIC OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return;
        }


        let count = 0;
        let ppDeviation;
        let OptRunTime = RUNTIME;
        const rangeMin = minimum_qtys;
        const rangeMax = rangeMin.map(x => 1.0 *(x /FACTOR)); 
        let optimizedSolution = rangeMax;
        minimumVal();

        function minimumVal() 
        {
            console.log("count ", count, "StartTime ", new Date(), "CAL_DATE ", CAL_DATE);
            let startMilliSecs = new Date().getTime();
            const populationSize = 100; 
            // const rangeMin = minimum_qtys;
            // const rangeMax = rangeMin.map(x => 1.0 *(x /FACTOR)); 
            console.log("rangeMin - minimum_qtys ", minimum_qtys);
            console.log("rangeMax ", rangeMax);

            function fitnessFunction (individual)            
            { 
                // console.log("fitnessFunction individual", individual);
                if( (individual == undefined) || 
                    (individual == null) )
                {
                    console.log("fitnessFunction individual", individual);

                    return 0;
                }
                // let solution = [...individual];
                let solution = individual;
                

                if(solution == undefined)
                {
                    console.log("fitnessFunction solution undefined");

                    return 0;
                }

                let local_objective = that._getObjective();
                // console.log("fitnessFunction ", local_objective);

                let PRIMARY_IDS = that._getPids();

                // console.log("PRIMARY_IDS length ", PRIMARY_IDS.length);

                let PIDS = []; 
            

                let replacements = [ ];
                for (let index = 0; index < PRIMARY_IDS.length; index++)
                {
                    PIDS[index] = solution[index];
                    let map = [PRIMARY_IDS[index].PRIMARY_ID, PIDS[index]];
                    replacements[index] = map;
                }

                // console.log("replacements ", replacements);
                let replaced_objective = replacements.reduce((acc, [oldStr, newStr]) => {
                                        return acc.replaceAll(oldStr, newStr);
                                        }, local_objective);

                // console.log("replaced Objective ", replaced_objective);

                // // Negate for minimum value
                // replaced_objective = -1*replaced_objective;

                let evaluatedVal;
                try
                {
                    evaluatedVal = eval(replaced_objective);
                }
                catch (exception) {
                    // console.log("obj_pids ", obj_pids);
                    // console.log("local_objective ", local_objective);
                    // console.log("LOCAL_PIDS ", LOCAL_PIDS);
                    console.log("local_objective ", local_objective);
                    console.log("PRIMARY_IDS ", PRIMARY_IDS);
    
                    console.log("replaced_objective ", replaced_objective);
                    throw new Error(exception.toString());
                }
                // console.log("fitnessFunction evaluatedVal ", evaluatedVal);
                
                // Negate for minimum value

                return -evaluatedVal;

            }
            let bestSolution = rangeMax;
            let maxGenerations = 300;

            function mutationFunction(solution)
            { 
                let PRIMARY_IDS = that._getPids();

                // console.log(" mutationFunction solution ", solution, "PRIMARY IDs count", PRIMARY_IDS.length)
                let mutated = [];
                // let mutationRate = 0.2; // 20% mutation chance
                let mutationRate = 0.01;

                for (let index = 0; index < PRIMARY_IDS.length; index++)
                {
                    // console.log(" mutationFunction for loop index ", index)
                    if (Math.random() < mutationRate) {
                        // mutated.push(solution[index] + (Math.random() - 0.5) * 2);
                        if(solution[index] > 1 )
                            mutated.push(solution[index] + (Math.random() - 0.5) * 2);
                        else
                            mutated.push(solution[index] + (Math.random() + 0.5)*2);

                    }
                    else
                    {
                        mutated.push(solution[index]);
                    }
                
                }
                // console.log("mutationFunction mutated", mutated )
                return mutated;
            }

            function crossoverFunction(parent1, parent2) {
                // Blend crossover: average the parents


                const crossoverPoint =  Math.floor(Math.random()*((parent1.length-1) - 0));

                const child1 = parent1;
                const child2 = parent2;
                child1[crossoverPoint] = parent2[crossoverPoint];
                child2[crossoverPoint] = parent1[crossoverPoint];
                // console.log("crossoverFunction child1 ", child1, "child 2", child2);

                return [child1, child2];
            }

            function initializePopulation(size, rangeMin, rangeMax) {
                console.log(" initializePopulation size ", size);
                let initPopulation = [];
                let randomValues = [];
                let PRIMARY_IDS = that._getPids();


                for (let oIndex = 0; oIndex < size; oIndex++) 
                {
                    for (let index = 0; index < PRIMARY_IDS.length; index++)
                    {
                        randomValues.push(Math.random() * (rangeMax[index] - rangeMin[index]) + rangeMin[index]);
                        // console.log(" index = ", index, "randomValues ", randomValues);
                        if(index === (PRIMARY_IDS.length-1))
                        {
                            initPopulation.push(randomValues);
                            randomValues = [];
                        }
                    }
                    // initPopulation.push(randomValues);

                }
                console.log("randomValues ", randomValues)

                console.log("initiPopulation ", initPopulation)
                return initPopulation;
            }
            function doesABeatBFunction(phenoTypeA, phenoTypeB) {
                return fitnessFunction(phenoTypeA) >= fitnessFunction(phenoTypeB)
            }
            const config = {
                mutationFunction: mutationFunction,
                crossoverFunction: crossoverFunction,
                fitnessFunction: fitnessFunction,
                doesABeatBFunction: doesABeatBFunction,
                population: initializePopulation(populationSize, rangeMin, rangeMax),
                // mutationRate: 0.2,
                // crossoverRate: 0.7,
                fittestNSurvives: 1,
                maxGenerations: maxGenerations,
            };


            var GeneticAlgorithmConstructor = require('geneticalgorithm')
            var geneticalgorithm = GeneticAlgorithmConstructor( config )
            // Evolve the population
            // const { bestSolution, bestScore } = geneticalgorithm.evolve();
            // console.log('Best Solution:', geneticalgorithm.evolve());

            // console.log('Best Solution:', bestSolution);
            // console.log('Best Score:', -bestScore); // Negate to get the actual minimized value

            // await geneticalgorithm.evolve();

            // for( var i = 0 ; i < 2 ; i++ )
            //     await geneticalgorithm.evolve();


            let lastScore = 0;
            let currentScore = 0;
            let constantScoreCount = 0;
            for( let index = 0 ; index < maxGenerations ; index++ ) 
            {
                geneticalgorithm.evolve();
                currentScore = geneticalgorithm.bestScore();
                bestSolution = geneticalgorithm.best();
                optimizedSolution = bestSolution;
                console.log("index ", index, "geneticalgorithm bestscore: ", geneticalgorithm.bestScore());
                // if( (lastScore == currentScore))
                // {
                //     constantScoreCount++;
                //     bestSolution = geneticalgorithm.best();
                //     optimizedSolution = bestSolution;
                //     if (constantScoreCount > maxGenerations/5)
                //     {
                //         console.log("Achieved Minimal Point Score ", currentScore);
                //         console.log('best phenoType:', geneticalgorithm.best());
                //         // bestSolution = geneticalgorithm.best();
                //         // optimizedSolution = bestSolution;
                //         break;
                //     }

                // }
                // if(currentScore != lastScore)
                // {
                //     constantScoreCount = 0;
                // }
                // lastScore = currentScore;

            }
        }


            // const bestSolution = geneticalgorithm.best();

            // console.log('bestScore:', geneticalgorithm.bestScore());
            // // console.log('scoredPopulation:', geneticalgorithm.scoredPopulation());
            // console.log('best phenoType:', bestSolution);




            // // Function to generate a random solution
            // function getRandomSolution() {
            //     var { x, y } = {
            //     x: Math.random() * 10 - 5, // Random x in range [-5, 5]
            //     y: Math.random() * 10 - 5, // Random y in range [-5, 5]
            //   };
            //   console.log(" getRandomSolution x ", x, " getRandomSolution y ", y);
            //   return({ x, y } )
            // }
            
            // // Fitness function to evaluate how good a solution is
            // function fitnessFunction(solution) {
            //   const { x, y } = solution;
            //   const rastriginValue = 20 + x ** 2 + y ** 2 - 10 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y));
            //   console.log(" solution ", solution, "x", x, "y ", y);

            //   console.log(" fitnessFunction ", -rastriginValue);
            //   return -rastriginValue; // Negate because the library maximizes by default

            // }
            
            // // Mutation function to introduce variations
            // function mutationFunction(solution) {
            //   const mutated = { ...solution };
            //   const geneToMutate = Math.random() < 0.5 ? 'x' : 'y';
            //   mutated[geneToMutate] += (Math.random() - 0.5) * 0.1; // Small mutation
            //   console.log("mutated ", mutated);
            //   return mutated;
            // }
            
            // // Crossover function to combine two parents
            // function crossoverFunction(parent1, parent2) {
            //   const crossoverPoint = Math.random() < 0.5 ? 'x' : 'y';
            //   const child1 = { ...parent1 };
            //   const child2 = { ...parent2 };
            //   child1[crossoverPoint] = parent2[crossoverPoint];
            //   child2[crossoverPoint] = parent1[crossoverPoint];

            //   console.log("crossoverFunction child1 ", child1, "child2", child2);

            //   return [child1, child2];
            // }
            
            // // Configuration for the genetic algorithm
            // const config = {
            //   mutationFunction,
            //   crossoverFunction,
            //   fitnessFunction,
            //   population: Array.from({ length: 100 }, getRandomSolution),
            //   mutationRate: 0.1,
            //   crossoverRate: 0.7,
            //   fittestNSurvives: 1,
            //   maxGenerations: 100,
            // };
            
            // var geneticAlgorithmConstructor = require('geneticalgorithm')
            // // var geneticalgorithm = GeneticAlgorithmConstructor( config )
            // // Create the genetic algorithm
            // const geneticAlgorithm = geneticAlgorithmConstructor(config);
            // console.log('1st Generation Best Score:', geneticAlgorithm.bestScore()); // Negate to get the actual minimized value

            // const bestSolution = geneticAlgorithm.evolve();
            // // console.log(`Best solution: x = ${bestSolution[0]}, y = ${bestSolution[1]}, f(x, y) = ${-(fitnessFunction(bestSolution))}`);
            // console.log('2nd Generation Best Score:', bestSolution.bestScore()); // Negate to get the actual minimized value

            // console.log('3rd Generation Best Score:', bestSolution.evolve().evolve().bestScore()); // Negate to get the actual minimized value
            // console.log('4th Generation Best Score:', bestSolution.evolve().evolve().evolve().bestScore()); // Negate to get the actual minimized value
            // console.log('5th Generation Best Score:', bestSolution.evolve().evolve().evolve().evolve().bestScore()); // Negate to get the actual minimized value







            // // Evolve the population
            // // const { bestSolution, bestScore } = geneticAlgorithm.evolve();
            // // console.log('Best Solution:', bestSolution);
            // // console.log('Best Score:', -bestScore); // Negate to get the actual minimized value
            
            // // var best = geneticAlgorithm.best()
            // console.log('BscoredPopulation bestScore:', geneticAlgorithm.bestScore());


            // console.log('BscoredPopulation scoredpopulation:', geneticAlgorithm.scoredPopulation());


            


            var PID_OPTIMIZED = [];
            let PID_OPTIMIZED_SUM = 0;

            for (let pidIndex = 0; pidIndex < that.PRIMARY_IDS.length; pidIndex ++)
            {
                // let optimized_qty = new_init[pidIndex];
                // let optimized_qty = prev_init[pidIndex];
                let optimized_qty = optimizedSolution[pidIndex];

                PID_OPTIMIZED.push({"PRIMARY_ID": that.PRIMARY_IDS[pidIndex].PRIMARY_ID, "OPTIMIZED_PRIMARY_QTY" : optimized_qty});
                PID_OPTIMIZED_SUM = PID_OPTIMIZED_SUM + optimized_qty;
            }

            // console.log("PID_OPTIMIZED", PID_OPTIMIZED);
            // console.log("PID_OPTIMIZED_SUM", PID_OPTIMIZED_SUM);

            // Initialize Revized PRIMARY ID Predicted values and then update with  PID_OPTIMIZED
            var OPTIMIZED_PRIMARY_IDS_PREDVALS = [];
            // console.log("INIT REVISED_PRIMARY_IDS_PREDVALS = ", REVISED_PRIMARY_IDS_PREDVALS);   
            for (let pidIndex = 0; pidIndex < (that.PRIMARY_IDS_PREDVALS).length; pidIndex++)
            {

                OPTIMIZED_PRIMARY_IDS_PREDVALS.push({"PRIMARY_ID":that.PRIMARY_IDS_PREDVALS[pidIndex].PRIMARY_ID,
                                        "CHAR_NUM":that.PRIMARY_IDS_PREDVALS[pidIndex].CHAR_NUM,
                                        "CHARVAL_NUM":that.PRIMARY_IDS_PREDVALS[pidIndex].CHARVAL_NUM,
                                        "OPTIMIZED_PRIMARY_QTY":0});


            }

            for (let revIndex = 0; revIndex < OPTIMIZED_PRIMARY_IDS_PREDVALS.length; revIndex++)
            {
                for (let pcalcIndex = 0; pcalcIndex < PID_OPTIMIZED.length; pcalcIndex++)
                {
                    if ( (OPTIMIZED_PRIMARY_IDS_PREDVALS[revIndex].PRIMARY_ID == PID_OPTIMIZED[pcalcIndex].PRIMARY_ID))
                    {

                        OPTIMIZED_PRIMARY_IDS_PREDVALS[revIndex].OPTIMIZED_PRIMARY_QTY =  PID_OPTIMIZED[pcalcIndex].OPTIMIZED_PRIMARY_QTY;
                    }
                }
            }

            // console.log("OPTIMIZED_PRIMARY_IDS_PREDVALS ", OPTIMIZED_PRIMARY_IDS_PREDVALS);

            let OPTIMIZED_CHARVAL_COUNTS = [];

            for (let charNumIndex = 0; charNumIndex < that.CHARVAL_COUNTS.length; charNumIndex++)
            {

                OPTIMIZED_CHARVAL_COUNTS.push({"LOC_PROD_ID":that.CHARVAL_COUNTS[charNumIndex].LOC_PROD_ID, 
                                "CHAR_NUM": that.CHARVAL_COUNTS[charNumIndex].CHAR_NUM, 
                                "CHARVAL_NUM": that.CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM,
                                "OPTIMIZED_CHAR_QTY": 0});
            }
            // console.log("INITIALIZED OPTIMIZED_CHARVAL_COUNTS = ", OPTIMIZED_CHARVAL_COUNTS);


            for (let revcharNumIndex = 0; revcharNumIndex < OPTIMIZED_CHARVAL_COUNTS.length; revcharNumIndex++)
            {
                for (let revpidvalIdx = 0; revpidvalIdx < OPTIMIZED_PRIMARY_IDS_PREDVALS.length; revpidvalIdx++)
                {
                    let primaryId = OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].PRIMARY_ID;
                    let locprodId = OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].LOC_PROD_ID;

                    if (primaryId.includes(locprodId) &&
                        ( OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].CHAR_NUM == OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].CHAR_NUM) &&
                        ( OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].CHARVAL_NUM == OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].CHARVAL_NUM))
                    {
                        OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].OPTIMIZED_CHAR_QTY = 
                                    OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].OPTIMIZED_CHAR_QTY + 
                                    OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].OPTIMIZED_PRIMARY_QTY;

                    }
                }
            }
            // console.log("UPDATED OPTIMIZED_CHARVAL_COUNTS = ", OPTIMIZED_CHARVAL_COUNTS);

            let btp_optimized_char_quantities = [];
            for (let revIdx = 0; revIdx < OPTIMIZED_CHARVAL_COUNTS.length; revIdx++)
            {
                btp_optimized_char_quantities[revIdx] = OPTIMIZED_CHARVAL_COUNTS[revIdx].OPTIMIZED_CHAR_QTY;
            }

            var tableObj = [];	

            for (let index =0; index < btp_optimized_char_quantities.length; index++)
            {


                let pred_dev = 0;
                let pred_post_dev = 0;
                let normalized_dev = 0;
                if (ibp_planned_quantities[index] != 0)
                {
                    pred_dev = (100*Math.abs(ibp_planned_quantities[index]-btp_predicted_quantities[index])/ibp_planned_quantities[index]).toFixed(2);
                    pred_post_dev = (100*Math.abs(ibp_planned_quantities[index]-btp_optimized_char_quantities[index])/ibp_planned_quantities[index]).toFixed(2);
                    normalized_dev = 100*Math.abs(ibp_planned_quantities[index]-btp_optimized_char_quantities[index])/loc_prod_ibp_qty;
                }

                let charNum = that.CHARVAL_COUNTS[index].CHAR_NUM;
                let charvalNum = that.CHARVAL_COUNTS[index].CHARVAL_NUM;
                let revisedQty = (btp_optimized_char_quantities[index]).toFixed(2);
                // when Optimization Fails
                if (revisedQty == 0)
                {
                    revisedQty = (btp_predicted_quantities[index]).toFixed(4);
                    pred_post_dev = pred_dev;
                }
                var rowObj = { CAL_DATE : cal_date, 
                    LOCATION_ID : loc_id,
                    PRODUCT_ID : prod_id,
                    MODEL_VERSION : modelVersion,
                    VERSION : ibpVersion,
                    SCENARIO : ibpScenario,
                    ALGORITHM : algorithm,
                    CHAR_NUM :  charNum ,
                    CHARVAL_NUM :  charvalNum ,
                    PREDICTED_QTY : (btp_predicted_quantities[index]).toFixed(4),
                    IBP_PLANNED_QTY : ibp_planned_quantities[index],
                    BTP_REVISED_QTY : revisedQty,
                    PREDICTED_DEVIATION: pred_dev, 
                    POST_PREDICTED_DEVIATION : pred_post_dev,
                    NORMALIZED_DEVIATION: normalized_dev};

                tableObj.push(rowObj);


            }
            sqlStr = 'DELETE FROM CP_VC_PREDICTIONS_OPTIMIZED ' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND ALGORITHM =  ' + "'" + algorithm + "'" +
                    ' AND "CAL_DATE" =  ' + "'" + cal_date + "'";
            try {
                await cds.run(sqlStr);

                //  console.log("sqlstr = ", sqlStr);
            }
            catch (exception) {
                console.log("sqlStr ", sqlStr);
                throw new Error(exception.toString());
            }

            // console.log("tableObj ", tableObj);
            let cqnQuery = {UPSERT:{ into: { ref: ['CP_VC_PREDICTIONS_OPTIMIZED'] }, entries:  tableObj }};

            await cds.run(cqnQuery);

            // let ppDeviation;
            sqlStr = 'SELECT SUM(POST_PREDICTED_DEVIATION) AS PP_DEVIATION FROM CP_VC_PREDICTIONS_OPTIMIZED ' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND ALGORITHM =  ' + "'" + algorithm + "'" +
                    ' AND "CAL_DATE" =  ' + "'" + cal_date + "'";
            try {
                results = await cds.run(sqlStr);
                ppDeviation = results[0].PP_DEVIATION;
                //  console.log("sqlstr = ", sqlStr);
            }
            catch (exception) {
                console.log("sqlStr ", sqlStr);
                throw new Error(exception.toString());
            }

            console.log("INPUT_PENALTY ", INPUT_PENALTY, " PP_DEVIATION ", ppDeviation);
            console.log("UNIQUE_ID ", UNIQUE_ID);
            if(ppDeviation < that.MAX_DEVIATION)
            {
                sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                    "'" + UNIQUE_ID + "'" + "," +
                                    "'" + 'COMPLETED' + "'" + "," +
                                    "'" + OptRunTime + "'" + "," +
                                    "'" +  ppDeviation + "'" + "," +
                                    "'" +  loc_id + "'" + "," +
                                    "'" +  prod_id + "'" + "," +
                                    "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';

                that.UUID = UNIQUE_ID;
                that.STATUS = 'COMPLETED';
                that.OPTIMIZATION_TIME = OptRunTime;
                that.OPTIMIZATION_DEVIATION = ppDeviation;
                        
            }
            else
            {
                sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                "'" + UNIQUE_ID + "'" + "," +
                                "'" + 'COMPLETED' + "'" + "," +
                                "'" + OptRunTime + "'" + "," +
                                "'" +  that.MAX_DEVIATION + "'" + "," +
                                "'" +  loc_id + "'" + "," +
                                "'" +  prod_id + "'" + "," +
                                "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';     

                that.UUID = UNIQUE_ID;
                that.STATUS = 'COMPLETED';
                that.OPTIMIZATION_TIME = OptRunTime;
                that.OPTIMIZATION_DEVIATION = that.MAX_DEVIATION;
                    
            }                      

            try {
                await cds.run(sqlStr);

            }
            catch (exception) {
                console.log("GD OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            console.log ("CP_OPTIMIZATION_STATUS sqlStr ", sqlStr);
            if(PENALTY_EXISTS == true)
            {
                var optimizedTime = new Date().toISOString();

                for (let pidIndex = 0; pidIndex < that.PRIMARY_IDS.length; pidIndex ++)
                {
                    let pid = PID_OPTIMIZED[pidIndex].PRIMARY_ID;


                    let pidStr=pid.split('#');
                    let locId = pidStr[0];
                    let prodId = pidStr[1];
                    let objDep = pidStr[2];
                    let objCounter = pidStr[3];
                    if (PID_OPTIMIZED[pidIndex].OPTIMIZED_PRIMARY_QTY != null)
                    {
                        sqlStr = 'UPSERT "CP_TS_PREDICTIONS" VALUES (' + "'" + cal_date + "'" + "," +
                                        "'" + locId + "'" + "," +
                                        "'" + prodId + "'" + "," +
                                        "'" + objType + "'" + "," +
                                        "'" + objDep + "'" + "," +
                                        "'" + objCounter + "'" + "," +
                                        "'" + modelType + "'" + "," +
                                        "'" + modelVersion  + "'" + "," +
                                        "'" + modelProfile  + "'" + "," +
                                        "'" + ibpVersion + "'" + "," +
                                        "'" + ibpScenario + "'" + "," + 
                                        "'" + PID_OPTIMIZED[pidIndex].OPTIMIZED_PRIMARY_QTY+ "'" + "," +
                                        "'" + optimizedTime + "'" + "," +
                                        "'" + that.PRIMARY_IDS[pidIndex].OPT_STARTTIME + "'" + "," +
                                        "'" + that.PRIMARY_IDS[pidIndex].DELTA_TIME + "'" + "," +
                                        "'" + 'SUCCESS' + "'" + "," +
                                        "'" + that.PRIMARY_IDS[pidIndex].PREDICTED+ "'" + "," +
                                        "'" + that.PRIMARY_IDS[pidIndex].PREDICTED_TIME + "'" + "," +
                                        "'" + ALGORITHM + "'" +')' + ' WITH PRIMARY KEY';
                            
                    }
                    else
                    {
                        sqlStr = 'UPSERT "CP_TS_PREDICTIONS" VALUES (' + "'" + cal_date + "'" + "," +
                                "'" + locId + "'" + "," +
                                "'" + prodId + "'" + "," +
                                "'" + objType + "'" + "," +
                                "'" + objDep + "'" + "," +
                                "'" + objCounter + "'" + "," +
                                "'" + modelType + "'" + "," +
                                "'" + modelVersion  + "'" + "," +
                                "'" + modelProfile  + "'" + "," +
                                "'" + ibpVersion + "'" + "," +
                                "'" + ibpScenario + "'" + "," + 
                                "'" + this.PRIMARY_IDS[pidIndex].PREDICTED+ "'" + "," +
                                "'" + this.PRIMARY_IDS[pidIndex].PREDICTED_TIME + "'" + "," +
                                "'" + that.PRIMARY_IDS[pidIndex].OPT_STARTTIME + "'" + "," +
                                "'" + that.PRIMARY_IDS[pidIndex].RESTORE_TIME + "'" + "," +
                                "'" + 'SUCCESS' + "'" + "," +
                                "'" + this.PRIMARY_IDS[pidIndex].PREDICTED+ "'" + "," +
                                "'" + this.PRIMARY_IDS[pidIndex].PREDICTED_TIME + "'" + "," +
                                "'" + ALGORITHM + "'" +')' + ' WITH PRIMARY KEY';
                    }
                    try {
                        await cds.run(sqlStr);

                    }
                    catch (exception) {
                        console.log("sqlStr ", sqlStr, "index = ", index, "locId : ",locId, "prodId : ", prodId, "objDep", objDep);
                        throw new Error(exception.toString());
                    }
                }
            return ppDeviation;


        }
    }
    

    // IN USE
    _gd_generic_UniqueIDS = async function(LOCATION_ID, PRODUCT_ID, TYPE, 
                                        MODEL_VERSION, VERSION, SCENARIO, ALGORITHM, FACTOR, CAL_DATE,
                                        MODEL_TYPE, MODEL_PROFILE,PENALTY_EXISTS, INPUT_PENALTY,UNIQUE_ID, RUNTIME,CHAR_WEIGHTAGE)
    {
        console.log("_gd_generic_UniqueIDS LOCATION_ID ", LOCATION_ID, "PRODUCT_ID ", PRODUCT_ID, "TYPE ", TYPE, "CAL_DATE ", CAL_DATE);
        console.log("_gd_generic_UniqueIDS PENALTY_EXISTS ", PENALTY_EXISTS, "INPUT_PENALTY ", INPUT_PENALTY, "UNIQUE_ID", UNIQUE_ID, "RUNTIME", RUNTIME,"CHAR_WEIGHTAGE",CHAR_WEIGHTAGE);

    const optimize = require('gradient-descent')

    let cal_date = CAL_DATE;
    this.CAL_DATE = CAL_DATE;
        
    let loc_id = LOCATION_ID;
    let prod_id = PRODUCT_ID;
    let objType = TYPE;
    let modelVersion = MODEL_VERSION;
    let ibpVersion = VERSION;
    let ibpScenario = SCENARIO;
    let algorithm = ALGORITHM;
    let modelType = MODEL_TYPE;
    let modelProfile = MODEL_PROFILE;

        let resultsByCharValNum;
    
   
 // SELECT DISTINCT CHARACTERISTICS AND CHARVALS OF THE PRODUCT
    let sqlStr = 'SELECT DISTINCT PBC.CHAR_NUM, IFC.CHARVAL_NUM' + 
                ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
                ' INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                ' PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
                ' AND PBC.LOCATION_ID = IFC.LOCATION_ID ' +
                ' AND PBC.PRODUCT_ID = IFC.PRODUCT_ID ' +
                ' AND PBC.CAL_DATE = IFC.WEEK_DATE ' +
                ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND "OBJ_TYPE" =  ' + "'" + objType + "'" +
                ' AND PBC.MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
                ' ORDER BY CHAR_NUM, CHARVAL_NUM';
   try {
        resultsByCharValNum = await cds.run(sqlStr);
    }
    catch (exception) {
        console.log("sqlStr ", sqlStr);
        throw new Error(exception.toString());
    }

        // console.log("_gd_generic_UniqueIDS resultsByCharValNum length =",resultsByCharValNum.length);

        var resultsByCharNum; 
        // SELECT DISTINCT CHARACTERISTICS  OF THE PRODUCT
        sqlStr = 'SELECT DISTINCT PBC.CHAR_NUM' + 
                    ' FROM CP_V_PREDICTIONS_BY_CHAR AS PBC ' +
                    ' INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                    ' PBC.CHAR_NUM = IFC.CHAR_NUM  AND PBC.CHARVAL_NUM = IFC.CHARVAL_NUM ' +
                    ' AND PBC.LOCATION_ID = IFC.LOCATION_ID ' +
                    ' AND PBC.PRODUCT_ID = IFC.PRODUCT_ID ' +
                    ' AND PBC.CAL_DATE = IFC.WEEK_DATE ' +
                    ' WHERE PBC.LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PBC.PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                    ' AND PBC.MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND PBC.VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND PBC.SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND PBC.CAL_DATE =  ' + "'" + cal_date + "'" +
                    ' ORDER BY PBC.CHAR_NUM ';
        try {
            resultsByCharNum = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
    
        // PREDICTED VALUES BY PRIMARY IDS (=OBJ_DEP+ '_' + OBJ_COUNTER)
        var results;
        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, DELTA_TIME, PRE_OPTIMIZED, PRE_OPTIMIZED_TIME FROM CP_V_PREDICTIONS_BY_CHAR' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                    ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                    ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                    ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                    ' AND "CAL_DATE" =  ' + "'" + cal_date + "'" +
                    ' ORDER BY LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER';
        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        // console.log("_gd_generic_UniqueIDS sqlStr =",sqlStr);
        // console.log("_gd_generic_UniqueIDS results =",results);

        // var PRIMARY_IDS_PREDVALS = [];
        // var PRIMARY_IDS = [];
        // global.PRIMARY_IDS = [];
 
        let optStartTime = new Date().toISOString();
        let deltaTime = results[0].DELTA_TIME;
        if( deltaTime == null)
        {
            deltaTime = results[0].PRE_OPTIMIZED_TIME;
        }
        for (let index = 0; index < results.length; index++)
        {
            let primary_id = results[index].LOCATION_ID + '#' + 
                                results[index].PRODUCT_ID + '#' +
                                results[index].OBJ_DEP + '#' +  results[index].OBJ_COUNTER;
            this.PRIMARY_IDS.push({"PRIMARY_ID": primary_id, "DELTA":results[index].DELTA, "PREDICTED":results[index].PRE_OPTIMIZED, 
                                    "PREDICTED_TIME":results[index].PRE_OPTIMIZED_TIME,
                                    "OPT_STARTTIME":optStartTime,"DELTA_TIME": deltaTime,
                                    "RESTORE_TIME":results[index].OPT_STARTTIME});

        }


        // console.log("_gd_generic_UniqueIDS PRIMARY_IDS =",PRIMARY_IDS);



        // console.log("_gd_generic_UniqueIDS PRIMARY_IDS_PREDVALS =",PRIMARY_IDS_PREDVALS);

        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, CHAR_NUM, CHARVAL_NUM, PRE_OPTIMIZED, PRE_OPTIMIZED_TIME FROM CP_V_PREDICTIONS_BY_CHAR' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND "CAL_DATE" =  ' + "'" + cal_date + "'" +
                ' ORDER BY LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER, CHAR_NUM, CHARVAL_NUM';

        var predictedVals;
        try {
            predictedVals = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        // console.log("_gd_generic_UniqueIDS predictedVals =",predictedVals);

        this.PRIMARY_IDS_COUNT = predictedVals.length;
        this.MAX_DEVIATION = Math.pow(10,10);
        if (this.PRIMARY_IDS_COUNT > 100)
        {
            this.GD_DELTA_DEVIATION = 10;
        }
        else
        {
            this.GD_DELTA_DEVIATION = 5;
        }

        for (let pvalIndex = 0; pvalIndex < predictedVals.length; pvalIndex++)
        {
            let pvalId = predictedVals[pvalIndex].LOCATION_ID + '#' + 
                        predictedVals[pvalIndex].PRODUCT_ID + '#' +
                        predictedVals[pvalIndex].OBJ_DEP + '#' +  predictedVals[pvalIndex].OBJ_COUNTER;
            let pvalCharNum = predictedVals[pvalIndex].CHAR_NUM;
            let pvalCharValNum = predictedVals[pvalIndex].CHARVAL_NUM;

            this.PRIMARY_IDS_PREDVALS.push({"PRIMARY_ID": pvalId,"CHAR_NUM": pvalCharNum, "CHARVAL_NUM": pvalCharValNum, "PREDICTED": predictedVals[pvalIndex].PRE_OPTIMIZED});

        }

    

        // var CHARVAL_COUNTS = [];
        var LOC_PROD_ID = loc_id + '#' + prod_id;

        for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
        {

            this.CHARVAL_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": resultsByCharValNum[charNumIndex].CHAR_NUM, "CHARVAL_NUM" : resultsByCharValNum[charNumIndex].CHARVAL_NUM, "PREDICTED": 0});                  
        }
        // console.log("_gd_generic_UniqueIDS this.CHARVAL_COUNTS =",this.CHARVAL_COUNTS);

        // console.log(" Before Adding Variables for CHVAL_COUNTS")


        // console.log(" After Adding Variables for this.CHARVAL_COUNTS")

        for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)
        {
            for (let pidIndex = 0; pidIndex < this.PRIMARY_IDS_PREDVALS.length; pidIndex++)
            {


                if( (this.CHARVAL_COUNTS[charNumIndex].CHAR_NUM === this.PRIMARY_IDS_PREDVALS[pidIndex].CHAR_NUM) &&
                    (this.CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM === this.PRIMARY_IDS_PREDVALS[pidIndex].CHARVAL_NUM) )
                {

                    this.CHARVAL_COUNTS[charNumIndex].PREDICTED = this.CHARVAL_COUNTS[charNumIndex].PREDICTED + this.PRIMARY_IDS_PREDVALS[pidIndex].PREDICTED;
                }

            }
        }

        let UID_CHARVAL_MATRIX = [];
        for (var uidIdx = 0; uidIdx < this.PRIMARY_IDS.length; uidIdx++) {
            UID_CHARVAL_MATRIX[uidIdx]=[];
            for (var charvalIdx = 0; charvalIdx < this.CHARVAL_COUNTS.length; charvalIdx++) {
                UID_CHARVAL_MATRIX[uidIdx][charvalIdx] = 0;
            }
        }

        for (let pidIndex = 0; pidIndex < this.PRIMARY_IDS.length; pidIndex++)
        {
            for (let pvalIndex = 0; pvalIndex < this.PRIMARY_IDS_PREDVALS.length; pvalIndex++)

            {
                if(this.PRIMARY_IDS[pidIndex].PRIMARY_ID === this.PRIMARY_IDS_PREDVALS[pvalIndex].PRIMARY_ID)
                {
                    for (let charNumIndex = 0; charNumIndex < resultsByCharValNum.length; charNumIndex++)

                    {
                        // console.log("charNumIndex ", charNumIndex, "pidIndex", pidIndex, this.CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM, PRIMARY_IDS_PREDVALS[pvalIndex].CHARVAL_NUM);

                        if( (this.CHARVAL_COUNTS[charNumIndex].CHAR_NUM === this.PRIMARY_IDS_PREDVALS[pvalIndex].CHAR_NUM) &&
                            (this.CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM === this.PRIMARY_IDS_PREDVALS[pvalIndex].CHARVAL_NUM) )
                        {

                            // this.CHARVAL_COUNTS[charNumIndex].PREDICTED = this.CHARVAL_COUNTS[charNumIndex].PREDICTED + PRIMARY_IDS_PREDVALS[pidIndex].PREDICTED;
                            UID_CHARVAL_MATRIX[pidIndex][charNumIndex] = 1;
                            // console.log("UID_CHARVAL_MATRIX[",pidIndex, "]", "[",charNumIndex, "]", UID_CHARVAL_MATRIX[pidIndex][charNumIndex])

                        }

                    }
                }
            }
        }

        // console.log("UID_CHARVAL_MATRIX ", UID_CHARVAL_MATRIX);
        




        // console.log("_gd_generic_UniqueIDS this.CHARVAL_COUNTS =",this.CHARVAL_COUNTS);

        // console.log("_gd_generic_UniqueIDS resultsByCharNum =",resultsByCharNum);


        // var CHAR_COUNTS = [];
        for (let charIndex = 0; charIndex < resultsByCharNum.length; charIndex ++)
        {
            let charCount = 0;

            for (let charValIndex = 0; charValIndex < resultsByCharValNum.length; charValIndex++)   
            {
                if( resultsByCharNum[charIndex].CHAR_NUM === this.CHARVAL_COUNTS[charValIndex].CHAR_NUM)
                {
                    charCount = charCount + this.CHARVAL_COUNTS[charValIndex].PREDICTED;
                } 
            }
            this.CHAR_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": resultsByCharNum[charIndex].CHAR_NUM, "PREDICTED": charCount});              

        }



        sqlStr = 'SELECT DISTINCT LOCATION_ID, PRODUCT_ID, "VERSION", "SCENARIO", CHAR_NUM, CHARVAL_NUM,  OPT_QTY '+
                ' FROM CP_V_IBP_FCHARPLAN_BY_PRIMARY_CHARS' +
                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                ' AND "WEEK_DATE" =  ' + "'" + cal_date + "'" +
                ' AND "MODEL_VERSION" = ' + "'" + modelVersion + "'" +
                ' ORDER BY LOCATION_ID, PRODUCT_ID, "VERSION", "SCENARIO", CHAR_NUM, CHARVAL_NUM';

        let ibpResultsByCharvalNum;
        try {
            ibpResultsByCharvalNum = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        // console.log("ibpResultsByCharvalNum ", ibpResultsByCharvalNum);
        // let IBP_CHARVAL_COUNTS = [];


        // INITIALIZE SIZE OF IBP option quantities to be in sync with BTP predicted quantities
        for (let charvalIndex = 0; charvalIndex < this.CHARVAL_COUNTS.length; charvalIndex ++)
        {

            this.IBP_CHARVAL_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": this.CHARVAL_COUNTS[charvalIndex].CHAR_NUM, 
                                    "CHARVAL_NUM": this.CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM, "IBP_OPT_QTY": 0});              
        }

        // UPDATE IBP option quantities from ibpResultsByCharvalNum

        for (let charvalIndex = 0; charvalIndex < this.CHARVAL_COUNTS.length; charvalIndex ++)
        {
            for (let ibpIdx = 0; ibpIdx < ibpResultsByCharvalNum.length; ibpIdx ++)
            {

                if( (this.CHARVAL_COUNTS[charvalIndex].LOC_PROD_ID  == (ibpResultsByCharvalNum[ibpIdx].LOCATION_ID + '#' + ibpResultsByCharvalNum[ibpIdx].PRODUCT_ID )) &&
                    (this.CHARVAL_COUNTS[charvalIndex].CHAR_NUM  == ibpResultsByCharvalNum[ibpIdx].CHAR_NUM) &&
                    (this.CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM  == ibpResultsByCharvalNum[ibpIdx].CHARVAL_NUM) )
                {
                    this.IBP_CHARVAL_COUNTS[charvalIndex].CHAR_NUM = ibpResultsByCharvalNum[ibpIdx].CHAR_NUM;
                    this.IBP_CHARVAL_COUNTS[charvalIndex].CHARVAL_NUM = ibpResultsByCharvalNum[ibpIdx].CHARVAL_NUM;
                    this.IBP_CHARVAL_COUNTS[charvalIndex].IBP_OPT_QTY = ibpResultsByCharvalNum[ibpIdx].OPT_QTY;
                }

            }
        }

        // console.log("IBP_CHARVAL_COUNTS = ", this.IBP_CHARVAL_COUNTS);

        // let IBP_CHAR_COUNTS = [];
        // INITIALIZE SIZE OF IBP char quantities to be in sync with BTP predicted char quantities
        for (let charIndex = 0; charIndex < this.CHAR_COUNTS.length; charIndex ++)
        {

            this.IBP_CHAR_COUNTS.push({"LOC_PROD_ID":LOC_PROD_ID, "CHAR_NUM": this.CHAR_COUNTS[charIndex].CHAR_NUM, "IBP_CHAR_QTY": 0});              
        }

        // UPDATE IBP option quantities from ibpResultsByCharvalNum

        for (let charIndex = 0; charIndex < this.CHAR_COUNTS.length; charIndex ++)
        {
            let charCount = 0;
            for (let charvalIdx = 0; charvalIdx < this.IBP_CHARVAL_COUNTS.length; charvalIdx ++)
            {
                

                if( (this.IBP_CHAR_COUNTS[charIndex].LOC_PROD_ID  == this.IBP_CHARVAL_COUNTS[charvalIdx].LOC_PROD_ID) &&
                    (this.IBP_CHAR_COUNTS[charIndex].CHAR_NUM  == this.IBP_CHARVAL_COUNTS[charvalIdx].CHAR_NUM)  )
                {
                    this.IBP_CHAR_COUNTS[charIndex].IBP_CHAR_QTY = this.IBP_CHAR_COUNTS[charIndex].IBP_CHAR_QTY +
                                                                Number(this.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY);
                
                }

            }
        }

        if ( this.IBP_CHAR_COUNTS.length == 0)
        {
            console.log("NOTHING to Optimize");
            // let startMilliSecs = new Date().getTime();
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs + 50;
            console.log("UNIQUE_ID ", UNIQUE_ID);
            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                            "'" + UNIQUE_ID + "'" + "," +
                                            "'" + 'COMPLETED' + "'" + "," +
                                            "'" + OptRunTime + "'" + "," +
                                            "'" +  this.MAX_DEVIATION + "'" + "," +
                                            "'" +  loc_id + "'" + "," +
                                            "'" +  prod_id + "'" + "," +
                                            "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';                      

            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("NON LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return;
        }

        let ibp_total_qty = this.IBP_CHAR_COUNTS[0].IBP_CHAR_QTY;

        // console.log("IBP_CHAR_COUNTS = ", this.IBP_CHAR_COUNTS);

        
        let ibp_penalties =  [];
      
        if (CHAR_WEIGHTAGE == true)
        {
            // DEFAULT CHARVAL WEIGHTS ARE ALL INITIALIZED TO 1
            sqlStr = 'SELECT DISTINCT REF_PRODID FROM V_SALES_H WHERE PRODUCT_ID = ' + "'" + prod_id  + "'";
            let sqlResults;
            try {
                sqlResults = await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("sqlStr ", sqlStr);
                throw new Error(exception.toString());
            }
            let charWeightResults = [];

            for (let charvalIdx = 0; charvalIdx < (this.CHARVAL_COUNTS).length; charvalIdx++)
            {
                let weight = 1;
                // charWeightResults[charvalIdx] = 1;
                charWeightResults.push({"WEIGHTAGE":weight});
                ibp_penalties[charvalIdx] = 1;
                // ibp_penalties[charvalIdx] = 0;
                // // let weight = 1;
                // let weight = 0;
                // // if(parseFloat(this.IBP_CHARVAL_COUNTS[charvalIndex].IBP_OPT_QTY) !== this.CHARVAL_COUNTS[charvalIndex].PREDICTED)
                // // {
                // //     ibp_penalties[charvalIdx] = 1;
                // // }   
                //  if( (CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM === 'TURBO') || 
                //     (CHARVAL_COUNTS[charvalIdx].CHARVAL_NUM === '1SPD') )
                // {
                //     weight = 1;
                // }   

            }

            console.log("DEFAULT CHARVAL WEIGHTS ", charWeightResults);

            let charWeightsSql = ' SELECT DISTINCT CW.CHAR_NUM, IFC.CHARVAL_NUM, WEIGHTAGE FROM V_CHARGROUPWEIGHTAGE AS CW ' +
                                    'INNER JOIN V_IBP_FCHARPLAN_TELESCOPIC AS IFC ON ' +
                                    'CW.CHAR_NUM = IFC.CHAR_NUM ' +
                                    ' WHERE CW.PRODUCT_ID = ' + "'" + sqlResults[0].REF_PRODID + "'" +
                                    ' AND IFC.PRODUCT_ID =' + "'" + prod_id + "'" +
                                    ' AND CHAR_TYPE = \'P\'' +
                                    ' ORDER BY CHAR_NUM, CHARVAL_NUM';


            try {
                charWeightResults = await cds.run(charWeightsSql);
            }
            catch (exception) {
                console.log("charWeightsSql ", charWeightsSql);
                throw new Error(exception.toString());
            }
            console.log("charWeightsSql ", charWeightsSql);

            console.log("charWeightResults ", charWeightResults,"charWeightResults[0].WEIGHTAGE:", parseInt(charWeightResults[0].WEIGHTAGE));
            let totalWeight = 0;
            for (let weightIdx = 0; weightIdx < charWeightResults.length; weightIdx++)
            {
                // totalWeight = totalWeight + (charWeightResults[weightIdx].WEIGHTAGE*charWeightResults[weightIdx].WEIGHTAGE);
                totalWeight = totalWeight + parseInt(charWeightResults[weightIdx].WEIGHTAGE);

            }
            console.log("totalWeight ", totalWeight);
            for (let charvalIdx = 0; charvalIdx < (this.CHARVAL_COUNTS).length; charvalIdx++)
            {
                // ibp_penalties[charvalIdx] = charWeightResults[charvalIdx].WEIGHTAGE * charWeightResults[charvalIdx].WEIGHTAGE;
                ibp_penalties[charvalIdx] = parseInt(charWeightResults[charvalIdx].WEIGHTAGE);

                ibp_penalties[charvalIdx] = ibp_penalties[charvalIdx]/totalWeight;
            }

        }
        else
        {
            for (let ibpIdx = 0; ibpIdx < this.IBP_CHARVAL_COUNTS.length; ibpIdx ++)
            {
                ibp_penalties[ibpIdx] = INPUT_PENALTY;
                // if(Number(this.IBP_CHARVAL_COUNTS[ibpIdx].IBP_OPT_QTY) !== this.CHARVAL_COUNTS[ibpIdx].PREDICTED)
                // {
                //     ibp_penalties[ibpIdx] = INPUT_PENALTY;
                // }
                // else
                // {
                //     ibp_penalties[ibpIdx] = 0;
                // }    
                    
            }       

        }

        console.log("Charval Weights = ", ibp_penalties);

        // console.log("global.objective ", global.objective);

        sqlStr = 'SELECT SUM(PRE_OPTIMIZED) AS TOTAL_PREDICTED FROM V_CP_TS_PREDICTIONS_TELESCOPIC  ' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND CAL_DATE =  ' + "'" + cal_date + "'";

        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }

        let loc_prod_predicted = 0;

        if (results.length > 0)
        {
            loc_prod_predicted = results[0].TOTAL_PREDICTED;
        }

        sqlStr = 'SELECT QUANTITY FROM V_IBP_FUTUREDEMAND_TELESCOPIC  ' +
                    ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                    ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                    ' AND WEEK_DATE =  ' + "'" + cal_date + "'";
        try {
            results = await cds.run(sqlStr);
        }
        catch (exception) {
            console.log("sqlStr ", sqlStr);
            throw new Error(exception.toString());
        }
        console.log("IBP FUTURE DEMAND sqlStr ", sqlStr);

        let loc_prod_ibp_qty = 0;

        if (results.length > 0)
        {
            loc_prod_ibp_qty = results[0].QUANTITY;
        }

        if(loc_prod_ibp_qty == 0)
        {
            console.log("Optimization will not be done, please check why loc_prod_ibp_qty is ", loc_prod_ibp_qty);
            // let endMilliSecs = new Date().getTime();
            // OptRunTime = endMilliSecs - startMilliSecs;
            // console.log("UNIQUE_ID ", UNIQUE_ID);

            // let startMilliSecs = new Date().getTime();
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs + 50;
            console.log("UNIQUE_ID ", UNIQUE_ID);

            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                            "'" + UNIQUE_ID + "'" + "," +
                                            "'" + 'COMPLETED' + "'" + "," +
                                            "'" + OptRunTime + "'" + "," +
                                            "'" +  this.MAX_DEVIATION + "'" + "," +
                                            "'" +  loc_id + "'" + "," +
                                            "'" +  prod_id + "'" + "," +
                                            "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("GD OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return;
        }
        let min_qty_factor = 0;
        if( loc_prod_predicted >= loc_prod_ibp_qty)
        {
            // min_qty_factor = 0.9 * loc_prod_ibp_qty/loc_prod_predicted;
            min_qty_factor = FACTOR * loc_prod_ibp_qty/loc_prod_predicted;

        }
        else
        {
            // min_qty_factor = 0.9 *  loc_prod_predicted/loc_prod_ibp_qty;
            min_qty_factor = FACTOR *  loc_prod_predicted/loc_prod_ibp_qty;

        }

        console.log("loc_prod_predicted ", loc_prod_predicted, "loc_prod_ibp_qty =",loc_prod_ibp_qty,  "OptFactor =", FACTOR, "min_qty_factor", min_qty_factor);
        
        if ( loc_prod_ibp_qty == 0)
        {
            console.log("NOTHING to Optimize");
            // let endMilliSecs = new Date().getTime();
            // OptRunTime = endMilliSecs - startMilliSecs;
            // console.log("UNIQUE_ID ", UNIQUE_ID);

            // let startMilliSecs = new Date().getTime();
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs + 50;
            console.log("UNIQUE_ID ", UNIQUE_ID);
            
            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                            "'" + UNIQUE_ID + "'" + "," +
                                            "'" + 'COMPLETED' + "'" + "," +
                                            "'" + OptRunTime + "'" + "," +
                                            "'" +  this.MAX_DEVIATION + "'" + "," +
                                            "'" +  loc_id + "'" + "," +
                                            "'" +  prod_id + "'" + "," +
                                            "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("NON LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return  this.MAX_DEVIATION;
        }
        // console.log("AFTER // ADD CONSTRAINTS ON PRIMARY IDS")

    
        // console.log("AFTER  // ADD PRIMARY ID VALUES WHOSE VALUES ARE TO BE ESTIMATED BY SOLVER")


        console.log("loc_prod_predicted ", loc_prod_predicted, "loc_prod_ibp_qty =",loc_prod_ibp_qty,  "min_qty_factor", min_qty_factor);
        
        
        let minimum_qtys = [];
        


        let pid_total_var = '';
        // let min_qty_penalty = 6;
        // let total_qty_penalty = 18;
        let min_qty_penalty = 1;

        let total_qty_penalty = 1;


        // let min_qty_penalty = 1;
        // let total_qty_penalty = 1;
        var that = this;

        global.objective = '';
        // This function block inline is for global.objective creation with setTimeout 
        // It is to prevent switching over during creation of objective function

        // Initialize the variable `done` to `undefined`
        // Create the function wait, which is available inside itself
        // Note: `var` is hoisted but `let` is not so we need to use `var`
        
        var done = (function wait () {

            // As long as it's nor marked as done, create a new event+queue
            if (!done) setTimeout(wait, 100);
          
            // No return value; done will resolve to false (undefined)
            for (var charvalIdx = 0; charvalIdx < that.CHARVAL_COUNTS.length; charvalIdx++)
            {
        
                let chUids = '';
        
        
                for (let uidIdx = 0; uidIdx < that.PRIMARY_IDS.length; uidIdx ++)
                {
                    if(UID_CHARVAL_MATRIX[uidIdx][charvalIdx] === 1)
                    {              
                        chUids = chUids + that.PRIMARY_IDS[uidIdx].PRIMARY_ID + ' + ' ; //+ '\r\n';
                    }
                }   

                // chUids = chUids + '-' + this.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY;
                // chUids = chUids + '-' + that.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY;
                if(that.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY < 0)
                {
                    chUids = chUids + '+' + (that.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY);
                }
                else
                {
                    // chUids = chUids + '+' + that.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY;
                    chUids = chUids + '+' + (-1*that.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY);

                }


                // console.log("chUids ", chUids);
                global.objective = global.objective + '+' + ibp_penalties[charvalIdx] + '*Math.pow((' + chUids + '),2) ' + '+' + '\r\n';
                // if(Number(that.IBP_CHARVAL_COUNTS[charvalIdx].IBP_OPT_QTY) !== that.CHARVAL_COUNTS[charvalIdx].PREDICTED)
                // {    
                //     global.objective = global.objective + '+' + ibp_penalties[charvalIdx] + '*Math.pow((' + chUids + '),2) ' + '+' + '\r\n'; 
                // }

                // console.log("global.objective ", global.objective);

        
            }
            for (let pidIndex = 0; pidIndex < that.PRIMARY_IDS.length; pidIndex++)
            {
                // let variable = PRIMARY_IDS[pidIndex].PRIMARY_ID;
                // variable = variable.replace(/'/g,'');
                pid_total_var = pid_total_var + '+' + that.PRIMARY_IDS[pidIndex].PRIMARY_ID; 
                // Apply a penalty of 2 for minimum constraints
                if( min_qty_factor*(that.PRIMARY_IDS[pidIndex].PREDICTED) >= 0 )
                {
                    global.objective = global.objective + '+' + min_qty_penalty + '*Math.pow((' + that.PRIMARY_IDS[pidIndex].PRIMARY_ID + '-' + min_qty_factor*(that.PRIMARY_IDS[pidIndex].PREDICTED) + '),2) ' + '+' + '\r\n';
                }
                else
                {
                    global.objective = global.objective + '+' + min_qty_penalty + '*Math.pow((' + that.PRIMARY_IDS[pidIndex].PRIMARY_ID + '+' + min_qty_factor*(that.PRIMARY_IDS[pidIndex].PREDICTED) + '),2) ' + '+' + '\r\n';
                }
                minimum_qtys[pidIndex] = min_qty_factor*(that.PRIMARY_IDS[pidIndex].PREDICTED);

            }
            

            // Apply a penalty for Total constraint
            // global.objective = global.objective + total_qty_penalty +'*Math.pow((' + pid_total_var + '-' + ibp_total_qty + '),2) ';

            global.objective = global.objective + '+' + total_qty_penalty +'*Math.pow((' + pid_total_var + '-' + ibp_total_qty + '),2) ';
        //    console.log(" in var done global.objective ", global.objective);
        //    console.log(" in var done minimum_qtys ", minimum_qtys);

            done = true;
        })();
        await this._setGlobalObjective(global.objective);

        // this.globalObjective = global.objective;


        // console.log(" this.globalObjective ", await this._getGlobalObjective())
        // console.log(" PRIMARY_IDS ", await this._getPrimaryIds())
        const gdFunction = async function (U1 = undefined, U2 = undefined, U3 = undefined,
            U4 = undefined, U5 = undefined, U6 = undefined,  U7 = undefined, U8 = undefined,
            U9 = undefined, U10 = undefined, U11 = undefined, U12 = undefined, U13 = undefined, U14 = undefined,
            U15 = undefined, U16 = undefined, U17 = undefined, U18 = undefined, U19 = undefined, U20 = undefined,
            U21 = undefined, U22 = undefined, U23 = undefined, U24 = undefined, U25 = undefined, U26 = undefined,
            U27 = undefined, U28 = undefined, U29 = undefined, U30 = undefined, U31 = undefined, U32 = undefined,
            U33 = undefined, U34 = undefined, U35 = undefined, U36 = undefined, U37 = undefined, U38 = undefined, 
            U39 = undefined, U40 = undefined, U41 = undefined, U42 = undefined, U43 = undefined, U44 = undefined,
            U45 = undefined, U46 = undefined, U47 = undefined, U48 = undefined, U49 = undefined, U50 = undefined,
            U51 = undefined, U52 = undefined, U53 = undefined, U54 = undefined, U55 = undefined, U56 = undefined,
            U57 = undefined, U58 = undefined, U59 = undefined, U60 = undefined, U61 = undefined, U62 = undefined,
            U63 = undefined, U64 = undefined, U65 = undefined, U66 = undefined, U67 = undefined, U68 = undefined,
            U69 = undefined, U70 = undefined, U71 = undefined, U72 = undefined, U73 = undefined, U74 = undefined,
            U75 = undefined, U76 = undefined, U77 = undefined, U78 = undefined, U79 = undefined, U80 = undefined,
            U81 = undefined, U82 = undefined, U83 = undefined, U84 = undefined, U85 = undefined, U86 = undefined,
            U87 = undefined, U88 = undefined, U89 = undefined, U90 = undefined, U91 = undefined, U92 = undefined,
            U93 = undefined, U94 = undefined, U95 = undefined, U96 = undefined, U97 = undefined, U98 = undefined,
            U99 = undefined, U100 = undefined, 
            U101 = undefined, U102 = undefined, U103 = undefined, U104 = undefined,
            U105 = undefined, U106 = undefined, U107 = undefined, U108 = undefined, U109 = undefined, U110 = undefined, 
            U111 = undefined, U112 = undefined, U113 = undefined, U114 = undefined, U115 = undefined, U116 = undefined,
            U117 = undefined, U118 = undefined, U119 = undefined, U120 = undefined, U121 = undefined, U122 = undefined, 
            U123 = undefined, U124 = undefined, U125 = undefined, U126 = undefined, U127 = undefined, U128 = undefined, 
            U129 = undefined, U130 = undefined, U131 = undefined, U132 = undefined, U133 = undefined, U134 = undefined,
            U135 = undefined, U136 = undefined, U137 = undefined, U138 = undefined, U139 = undefined, U140 = undefined, 
            U141 = undefined, U142 = undefined, U143 = undefined, U144 = undefined, U145 = undefined, U146 = undefined, 
            U147 = undefined, U148 = undefined, U149 = undefined, U150 = undefined, U151 = undefined, U152 = undefined, 
            U153 = undefined, U154 = undefined, U155 = undefined, U156 = undefined, U157 = undefined, U158 = undefined, 
            U159 = undefined, U160 = undefined, U161 = undefined, U162 = undefined, U163 = undefined, U164 = undefined, 
            U165 = undefined, U166 = undefined, U167 = undefined, U168 = undefined, U169 = undefined, U170 = undefined,
            U171 = undefined, U172 = undefined, U173 = undefined, U174 = undefined, U175 = undefined, U176 = undefined, 
            U177 = undefined, U178 = undefined, U179 = undefined, U180 = undefined, U181 = undefined, U182 = undefined, 
            U183 = undefined, U184 = undefined, U185 = undefined, U186 = undefined, U187 = undefined, U188 = undefined,
            U189 = undefined, U190 = undefined, U191 = undefined, U192 = undefined, U193 = undefined, U194 = undefined, 
            U195 = undefined, U196 = undefined, U197 = undefined, U198 = undefined, U199 = undefined, U200 = undefined,
            U201 = undefined, U202 = undefined, U203 = undefined, U204 = undefined,
            U205 = undefined, U206 = undefined, U207 = undefined, U208 = undefined, U209 = undefined, U210 = undefined, 
            U211 = undefined, U212 = undefined, U213 = undefined, U214 = undefined, U215 = undefined, U216 = undefined,
            U217 = undefined, U218 = undefined, U219 = undefined, U220 = undefined, U221 = undefined, U222 = undefined, 
            U223 = undefined, U224 = undefined, U225 = undefined, U226 = undefined, U227 = undefined, U228 = undefined, 
            U229 = undefined, U230 = undefined, U231 = undefined, U232 = undefined, U233 = undefined, U234 = undefined,
            U235 = undefined, U236 = undefined, U237 = undefined, U238 = undefined, U239 = undefined, U240 = undefined, 
            U241 = undefined, U242 = undefined, U243 = undefined, U244 = undefined, U245 = undefined, U246 = undefined, 
            U247 = undefined, U248 = undefined, U249 = undefined, U250 = undefined, U251 = undefined, U252 = undefined, 
            U253 = undefined, U254 = undefined, U255 = undefined, U256 = undefined, U257 = undefined, U258 = undefined, 
            U259 = undefined, U260 = undefined, U261 = undefined, U262 = undefined, U263 = undefined, U264 = undefined, 
            U265 = undefined, U266 = undefined, U267 = undefined, U268 = undefined, U269 = undefined, U270 = undefined,
            U271 = undefined, U272 = undefined, U273 = undefined, U274 = undefined, U275 = undefined, U276 = undefined, 
            U277 = undefined, U278 = undefined, U279 = undefined, U280 = undefined, U281 = undefined, U282 = undefined, 
            U283 = undefined, U284 = undefined, U285 = undefined, U286 = undefined, U287 = undefined, U288 = undefined,
            U289 = undefined, U290 = undefined, U291 = undefined, U292 = undefined, U293 = undefined, U294 = undefined, 
            U295 = undefined, U296 = undefined, U297 = undefined, U298 = undefined, U299 = undefined, U300 = undefined,
            U301 = undefined, U302 = undefined, U303 = undefined, U304 = undefined,
            U305 = undefined, U306 = undefined, U307 = undefined, U308 = undefined, U309 = undefined, U310 = undefined, 
            U311 = undefined, U312 = undefined, U313 = undefined, U314 = undefined, U315 = undefined, U316 = undefined,
            U317 = undefined, U318 = undefined, U319 = undefined, U320 = undefined, U321 = undefined, U322 = undefined, 
            U323 = undefined, U324 = undefined, U325 = undefined, U326 = undefined, U327 = undefined, U328 = undefined, 
            U329 = undefined, U330 = undefined, U331 = undefined, U332 = undefined, U333 = undefined, U334 = undefined,
            U335 = undefined, U336 = undefined, U337 = undefined, U338 = undefined, U339 = undefined, U340 = undefined, 
            U341 = undefined, U342 = undefined, U343 = undefined, U344 = undefined, U345 = undefined, U346 = undefined, 
            U347 = undefined, U348 = undefined, U349 = undefined, U350 = undefined, U351 = undefined, U352 = undefined, 
            U353 = undefined, U354 = undefined, U355 = undefined, U356 = undefined, U357 = undefined, U358 = undefined, 
            U359 = undefined, U360 = undefined, U361 = undefined, U362 = undefined, U363 = undefined, U364 = undefined, 
            U365 = undefined, U366 = undefined, U367 = undefined, U368 = undefined, U369 = undefined, U370 = undefined,
            U371 = undefined, U372 = undefined, U373 = undefined, U374 = undefined, U375 = undefined, U376 = undefined, 
            U377 = undefined, U378 = undefined, U379 = undefined, U380 = undefined, U381 = undefined, U382 = undefined, 
            U383 = undefined, U384 = undefined, U385 = undefined, U386 = undefined, U387 = undefined, U388 = undefined,
            U389 = undefined, U390 = undefined, U391 = undefined, U392 = undefined, U393 = undefined, U394 = undefined, 
            U395 = undefined, U396 = undefined, U397 = undefined, U398 = undefined, U399 = undefined, U400 = undefined,
            U401 = undefined, U402 = undefined, U403 = undefined, U404 = undefined,
            U405 = undefined, U406 = undefined, U407 = undefined, U408 = undefined, U409 = undefined, U410 = undefined, 
            U411 = undefined, U412 = undefined, U413 = undefined, U414 = undefined, U415 = undefined, U416 = undefined,
            U417 = undefined, U418 = undefined, U419 = undefined, U420 = undefined, U421 = undefined, U422 = undefined, 
            U423 = undefined, U424 = undefined, U425 = undefined, U426 = undefined, U427 = undefined, U428 = undefined, 
            U429 = undefined, U430 = undefined, U431 = undefined, U432 = undefined, U433 = undefined, U434 = undefined,
            U435 = undefined, U436 = undefined, U437 = undefined, U438 = undefined, U439 = undefined, U440 = undefined, 
            U441 = undefined, U442 = undefined, U443 = undefined, U444 = undefined, U445 = undefined, U446 = undefined, 
            U447 = undefined, U448 = undefined, U449 = undefined, U450 = undefined, U451 = undefined, U452 = undefined, 
            U453 = undefined, U454 = undefined, U455 = undefined, U456 = undefined, U457 = undefined, U458 = undefined, 
            U459 = undefined, U460 = undefined, U461 = undefined, U462 = undefined, U463 = undefined, U464 = undefined, 
            U465 = undefined, U466 = undefined, U467 = undefined, U468 = undefined, U469 = undefined, U470 = undefined,
            U471 = undefined, U472 = undefined, U473 = undefined, U474 = undefined, U475 = undefined, U476 = undefined, 
            U477 = undefined, U478 = undefined, U479 = undefined, U480 = undefined, U481 = undefined, U482 = undefined, 
            U483 = undefined, U484 = undefined, U485 = undefined, U486 = undefined, U487 = undefined, U488 = undefined,
            U489 = undefined, U490 = undefined, U491 = undefined, U492 = undefined, U493 = undefined, U494 = undefined, 
            U495 = undefined, U496 = undefined, U497 = undefined, U498 = undefined, U499 = undefined, U500 = undefined,
            U501 = undefined, U502 = undefined, U503 = undefined, U504 = undefined,
            U505 = undefined, U506 = undefined, U507 = undefined, U508 = undefined, U509 = undefined, U510 = undefined, 
            U511 = undefined, U512 = undefined, U513 = undefined, U514 = undefined, U515 = undefined, U516 = undefined,
            U517 = undefined, U518 = undefined, U519 = undefined, U520 = undefined, U521 = undefined, U522 = undefined, 
            U523 = undefined, U524 = undefined, U525 = undefined, U526 = undefined, U527 = undefined, U528 = undefined, 
            U529 = undefined, U530 = undefined, U531 = undefined, U532 = undefined, U533 = undefined, U534 = undefined,
            U535 = undefined, U536 = undefined, U537 = undefined, U538 = undefined, U539 = undefined, U540 = undefined, 
            U541 = undefined, U542 = undefined, U543 = undefined, U544 = undefined, U545 = undefined, U546 = undefined, 
            U547 = undefined, U548 = undefined, U549 = undefined, U550 = undefined, U551 = undefined, U552 = undefined, 
            U553 = undefined, U554 = undefined, U555 = undefined, U556 = undefined, U557 = undefined, U558 = undefined, 
            U559 = undefined, U560 = undefined, U561 = undefined, U562 = undefined, U563 = undefined, U564 = undefined, 
            U565 = undefined, U566 = undefined, U567 = undefined, U568 = undefined, U569 = undefined, U570 = undefined,
            U571 = undefined, U572 = undefined, U573 = undefined, U574 = undefined, U575 = undefined, U576 = undefined, 
            U577 = undefined, U578 = undefined, U579 = undefined, U580 = undefined, U581 = undefined, U582 = undefined, 
            U583 = undefined, U584 = undefined, U585 = undefined, U586 = undefined, U587 = undefined, U588 = undefined,
            U589 = undefined, U590 = undefined, U591 = undefined, U592 = undefined, U593 = undefined, U594 = undefined, 
            U595 = undefined, U596 = undefined, U597 = undefined, U598 = undefined, U599 = undefined, U600 = undefined,
            U601 = undefined, U602 = undefined, U603 = undefined, U604 = undefined,
            U605 = undefined, U606 = undefined, U607 = undefined, U608 = undefined, U609 = undefined, U610 = undefined, 
            U611 = undefined, U612 = undefined, U613 = undefined, U614 = undefined, U615 = undefined, U616 = undefined,
            U617 = undefined, U618 = undefined, U619 = undefined, U620 = undefined, U621 = undefined, U622 = undefined, 
            U623 = undefined, U624 = undefined, U625 = undefined, U626 = undefined, U627 = undefined, U628 = undefined, 
            U629 = undefined, U630 = undefined, U631 = undefined, U632 = undefined, U633 = undefined, U634 = undefined,
            U635 = undefined, U636 = undefined, U637 = undefined, U638 = undefined, U639 = undefined, U640 = undefined, 
            U641 = undefined, U642 = undefined, U643 = undefined, U644 = undefined, U645 = undefined, U646 = undefined, 
            U647 = undefined, U648 = undefined, U649 = undefined, U650 = undefined, U651 = undefined, U652 = undefined, 
            U653 = undefined, U654 = undefined, U655 = undefined, U656 = undefined, U657 = undefined, U658 = undefined, 
            U659 = undefined, U660 = undefined, U661 = undefined, U662 = undefined, U663 = undefined, U664 = undefined, 
            U665 = undefined, U666 = undefined, U667 = undefined, U668 = undefined, U669 = undefined, U670 = undefined,
            U671 = undefined, U672 = undefined, U673 = undefined, U674 = undefined, U675 = undefined, U676 = undefined, 
            U677 = undefined, U678 = undefined, U679 = undefined, U680 = undefined, U681 = undefined, U682 = undefined, 
            U683 = undefined, U684 = undefined, U685 = undefined, U686 = undefined, U687 = undefined, U688 = undefined,
            U689 = undefined, U690 = undefined, U691 = undefined, U692 = undefined, U693 = undefined, U694 = undefined, 
            U695 = undefined, U696 = undefined, U697 = undefined, U698 = undefined, U699 = undefined, U700 = undefined,
            U701 = undefined, U702 = undefined, U703 = undefined, U704 = undefined,
            U705 = undefined, U706 = undefined, U707 = undefined, U708 = undefined, U709 = undefined, U710 = undefined, 
            U711 = undefined, U712 = undefined, U713 = undefined, U714 = undefined, U715 = undefined, U716 = undefined,
            U717 = undefined, U718 = undefined, U719 = undefined, U720 = undefined, U721 = undefined, U722 = undefined, 
            U723 = undefined, U724 = undefined, U725 = undefined, U726 = undefined, U727 = undefined, U728 = undefined, 
            U729 = undefined, U730 = undefined, U731 = undefined, U732 = undefined, U733 = undefined, U734 = undefined,
            U735 = undefined, U736 = undefined, U737 = undefined, U738 = undefined, U739 = undefined, U740 = undefined, 
            U741 = undefined, U742 = undefined, U743 = undefined, U744 = undefined, U745 = undefined, U746 = undefined, 
            U747 = undefined, U748 = undefined, U749 = undefined, U750 = undefined, U751 = undefined, U752 = undefined, 
            U753 = undefined, U754 = undefined, U755 = undefined, U756 = undefined, U757 = undefined, U758 = undefined, 
            U759 = undefined, U760 = undefined, U761 = undefined, U762 = undefined, U763 = undefined, U764 = undefined, 
            U765 = undefined, U766 = undefined, U767 = undefined, U768 = undefined, U769 = undefined, U770 = undefined,
            U771 = undefined, U772 = undefined, U773 = undefined, U774 = undefined, U775 = undefined, U776 = undefined, 
            U777 = undefined, U778 = undefined, U779 = undefined, U780 = undefined, U781 = undefined, U782 = undefined, 
            U783 = undefined, U784 = undefined, U785 = undefined, U786 = undefined, U787 = undefined, U788 = undefined,
            U789 = undefined, U790 = undefined, U791 = undefined, U792 = undefined, U793 = undefined, U794 = undefined, 
            U795 = undefined, U796 = undefined, U797 = undefined, U798 = undefined, U799 = undefined, U800 = undefined,
			U801 = undefined, U802 = undefined, U803 = undefined, U804 = undefined,
            U805 = undefined, U806 = undefined, U807 = undefined, U808 = undefined, U809 = undefined, U810 = undefined, 
            U811 = undefined, U812 = undefined, U813 = undefined, U814 = undefined, U815 = undefined, U816 = undefined,
            U817 = undefined, U818 = undefined, U819 = undefined, U820 = undefined, U821 = undefined, U822 = undefined, 
            U823 = undefined, U824 = undefined, U825 = undefined, U826 = undefined, U827 = undefined, U828 = undefined, 
            U829 = undefined, U830 = undefined, U831 = undefined, U832 = undefined, U833 = undefined, U834 = undefined,
            U835 = undefined, U836 = undefined, U837 = undefined, U838 = undefined, U839 = undefined, U840 = undefined, 
            U841 = undefined, U842 = undefined, U843 = undefined, U844 = undefined, U845 = undefined, U846 = undefined, 
            U847 = undefined, U848 = undefined, U849 = undefined, U850 = undefined, U851 = undefined, U852 = undefined, 
            U853 = undefined, U854 = undefined, U855 = undefined, U856 = undefined, U857 = undefined, U858 = undefined, 
            U859 = undefined, U860 = undefined, U861 = undefined, U862 = undefined, U863 = undefined, U864 = undefined, 
            U865 = undefined, U866 = undefined, U867 = undefined, U868 = undefined, U869 = undefined, U870 = undefined,
            U871 = undefined, U872 = undefined, U873 = undefined, U874 = undefined, U875 = undefined, U876 = undefined, 
            U877 = undefined, U878 = undefined, U879 = undefined, U880 = undefined, U881 = undefined, U882 = undefined, 
            U883 = undefined, U884 = undefined, U885 = undefined, U886 = undefined, U887 = undefined, U888 = undefined,
            U889 = undefined, U890 = undefined, U891 = undefined, U892 = undefined, U893 = undefined, U894 = undefined, 
            U895 = undefined, U896 = undefined, U897 = undefined, U898 = undefined, U899 = undefined, U900 = undefined,
            U901 = undefined, U902 = undefined, U903 = undefined, U904 = undefined,
            U905 = undefined, U906 = undefined, U907 = undefined, U908 = undefined, U909 = undefined, U910 = undefined, 
            U911 = undefined, U912 = undefined, U913 = undefined, U914 = undefined, U915 = undefined, U916 = undefined,
            U917 = undefined, U918 = undefined, U919 = undefined, U920 = undefined, U921 = undefined, U922 = undefined, 
            U923 = undefined, U924 = undefined, U925 = undefined, U926 = undefined, U927 = undefined, U928 = undefined, 
            U929 = undefined, U930 = undefined, U931 = undefined, U932 = undefined, U933 = undefined, U934 = undefined,
            U935 = undefined, U936 = undefined, U937 = undefined, U938 = undefined, U939 = undefined, U940 = undefined, 
            U941 = undefined, U942 = undefined, U943 = undefined, U944 = undefined, U945 = undefined, U946 = undefined, 
            U947 = undefined, U948 = undefined, U949 = undefined, U950 = undefined, U951 = undefined, U952 = undefined, 
            U953 = undefined, U954 = undefined, U955 = undefined, U956 = undefined, U957 = undefined, U958 = undefined, 
            U959 = undefined, U960 = undefined, U961 = undefined, U962 = undefined, U963 = undefined, U964 = undefined, 
            U965 = undefined, U966 = undefined, U967 = undefined, U968 = undefined, U969 = undefined, U970 = undefined,
            U971 = undefined, U972 = undefined, U973 = undefined, U974 = undefined, U975 = undefined, U976 = undefined, 
            U977 = undefined, U978 = undefined, U979 = undefined, U980 = undefined, U981 = undefined, U982 = undefined, 
            U983 = undefined, U984 = undefined, U985 = undefined, U986 = undefined, U987 = undefined, U988 = undefined,
            U989 = undefined, U990 = undefined, U991 = undefined, U992 = undefined, U993 = undefined, U994 = undefined, 
            U995 = undefined, U996 = undefined, U997 = undefined, U998 = undefined, U999 = undefined, U1000 = undefined
        )
        
        { 
        
            // let local_objective = global.objective;

            // console.log(" gdFunction globalObjective ", await that._getGlobalObjective())
            // console.log(" gdFunction PRIMARY_IDS ", await that._getPrimaryIds())

            let local_objective = await that._getGlobalObjective();
            let PRIMARY_IDS = await that._getPrimaryIds();

            // let obj_pids = await this.fetchGlobalObjective();
            // let local_objective = await obj_pids.GLOBAL_OBJECTIVE;
            // let LOCAL_PIDS = await obj_pids.PRIMARY_IDS;

            
            // console.log("PRIMARY_IDS.length ", PRIMARY_IDS.length);   
            
            // console.log("UXs Inputs", U1 , U2 , U3, U4, U5, U6, U7, U8, U9, U10, U11, U12, U13, U14, U15, U16, U17, U19, U19, U20);

            let PIDS = []; 
            

            let replacements = [ ];
            
            for (let index = 0; index < PRIMARY_IDS.length; index++)
            {
                PIDS[index] = arguments[index];
                let map = [PRIMARY_IDS[index].PRIMARY_ID, PIDS[index]];
                replacements[index] = map;
            }

            // console.log("PIDs ", PIDS);   
            

            // for (let index = 0; index < LOCAL_PIDS.length; index++)
            // {
            //     let map = [LOCAL_PIDS[index].PRIMARY_ID, PIDS[index]];
                
            //     replacements[index] = map;
            // }
            // console.log("replacements ", replacements);

            let replaced_objective = replacements.reduce((acc, [oldStr, newStr]) => {
                return acc.replaceAll(oldStr, newStr);
            }, local_objective);

            //   console.log("replaced Objective ", replaced_objective);
            // let local_objective = global.objective.replace(/%(\d+)/g, (_, n) => PIDS[+n-1]);
            // console.log("local_objective", local_objective);

            let evaluatedVal;
            try
            {
                evaluatedVal = await eval(replaced_objective);
            }
            catch (exception) {
                // console.log("obj_pids ", obj_pids);
                // console.log("local_objective ", local_objective);
                // console.log("LOCAL_PIDS ", LOCAL_PIDS);
                console.log("local_objective ", local_objective);
                console.log("PRIMARY_IDS ", PRIMARY_IDS);

                console.log("replaced_objective ", replaced_objective);
                throw new Error(exception.toString());
            }
            return evaluatedVal;
            // return eval(replaced_objective);

            // return eval(replaced_objective);
            // return (local_objective);


        }

        let min_pid_total_qty = 0;
        for(let minIdx = 0; minIdx < minimum_qtys.length; minIdx++)
        {
            min_pid_total_qty = min_pid_total_qty + minimum_qtys[minIdx];

        } 

        let factored_minimum_qtys = [];
        for(let minIdx = 0; minIdx < minimum_qtys.length; minIdx++)
        {
            factored_minimum_qtys[minIdx] = (loc_prod_ibp_qty/min_pid_total_qty)*minimum_qtys[minIdx];
        }

        const init = minimum_qtys;
        // var init = [];
        // init[0] = UNIQUE_ID;
        // for(let mIndex = 0; mIndex < minimum_qtys.length; mIndex++)
        // {
        //     init[mIndex+1] = minimum_qtys[mIndex];
        // }
        
        // const init = factored_minimum_qtys;
        //  console.log("Minimum Initial Qtys ", init);
        
        /***************/
    

        let ibp_planned_quantities = [];
        let btp_predicted_quantities = [];
        let ibp_all_charval_qtys = 0;
        console.log("Before ibp_all_charval_qtys ", ibp_all_charval_qtys);
        // console.log("IBP_CHARVAL_COUNTS ", this.IBP_CHARVAL_COUNTS);

        for (let ibpIdx = 0; ibpIdx < this.IBP_CHARVAL_COUNTS.length; ibpIdx++)
        {
            ibp_planned_quantities[ibpIdx] = this.IBP_CHARVAL_COUNTS[ibpIdx].IBP_OPT_QTY;
            btp_predicted_quantities[ibpIdx] = this.CHARVAL_COUNTS[ibpIdx].PREDICTED;
            ibp_all_charval_qtys = ibp_all_charval_qtys + parseInt(this.IBP_CHARVAL_COUNTS[ibpIdx].IBP_OPT_QTY);
        }

    
        console.log("ibp_planned_quantities ", ibp_planned_quantities);
        console.log("btp_predicted_quantities ", btp_predicted_quantities);
        // console.log("After ibp_all_charval_qtys ", ibp_all_charval_qtys);
        console.log("ibp_all_charval_qtys ", ibp_all_charval_qtys);
        console.log("minimum_qtys ", minimum_qtys);
        console.log("init ", init);



        if ( ibp_all_charval_qtys == 0)
        {
            console.log("ibp_all_charval_qtys ", ibp_all_charval_qtys);
            console.log("NOTHING TO OPTIMIZE - RETURNING FOR CAL_DATE ", CAL_DATE);
            // let endMilliSecs = new Date().getTime();
            let OptRunTime = 100; //endMilliSecs - startMilliSecs;
            console.log("UNIQUE_ID ", UNIQUE_ID);
            sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                            "'" + UNIQUE_ID + "'" + "," +
                                            "'" + 'COMPLETED' + "'" + "," +
                                            "'" + OptRunTime + "'" + "," +
                                            "'" +  this.MAX_DEVIATION + "'" + "," +
                                            "'" +  loc_id + "'" + "," +
                                            "'" +  prod_id + "'" + "," +
                                            "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';  
            try {
                await cds.run(sqlStr);
            }
            catch (exception) {
                console.log("NON LINEAR OPTIMIZATION sqlStr exception ", sqlStr);
                throw new Error(exception.toString());
            }

            this.UUID = UNIQUE_ID;
            this.STATUS = 'COMPLETED';
            this.OPTIMIZATION_TIME = OptRunTime;
            this.OPTIMIZATION_DEVIATION = this.MAX_DEVIATION;

            return;
        }

        let learning_rate = 0.0001;
        const res = await optimize(init, gdFunction,learning_rate);
        // const res = await optimize(init, gdFunction(...init),learning_rate);

        // console.log("Initial response ", res);


        // const res = await optimize(init, gdFunction,0.0001);
        // console.log("Initial response ", res);

        for (let rIndex = 0; rIndex < res.length; rIndex ++)
        {
            if (res[rIndex] < 0)
            {
                res[rIndex] = res[rIndex] * -1;
            }
        }
        let prev_init = res; //[res[0], res[1], res[2], res[3], res[4], res[5]];
        let new_init = res; //[res[0], res[1],res[2], res[3],res[4], res[5]];
        let initVal =  await gdFunction(...prev_init);
        console.log(" initial point ", prev_init);
        let count = 0;
        let ppDeviation;
        let OptRunTime = RUNTIME;
        minimumVal();
        // var intervalId = setInterval(async () =>{
        var intervalId;
        var finalResponse = prev_init;
        async function minimumVal() {
            clearInterval(intervalId);
            intervalId = setInterval(minimumVal, OptRunTime);
            console.log("count ", count, "StartTime ", new Date(), "CAL_DATE ", CAL_DATE);
            let startMilliSecs = new Date().getTime();
            prev_init =  new_init;

            let new_response = await optimize(new_init, gdFunction,learning_rate);
            // const new_response = await optimize(new_init,gdFunction(...new_init),learning_rate);

            // let new_response = await optimize(new_init, gdFunctionEvaluated,learning_rate);
            for (let rIndex = 0; rIndex < new_response.length; rIndex ++)
            {
                if (new_response[rIndex] < 0)
                {
                    new_response[rIndex] = new_response[rIndex] * -1;
                }
            }
            new_init = new_response;
            count ++;

            let endMilliSecs = new Date().getTime();
            // Optimum Extra Seconds to Allow Other Services to Run during Next Interval
            OptRunTime = endMilliSecs - startMilliSecs;

    //        OptRunTime = endMilliSecs - startMilliSecs + 1000;
            if(OptRunTime <= 100)
            {
                OptRunTime = OptRunTime + 50;

            }
            else if(OptRunTime <= 250)
            {
                OptRunTime = OptRunTime + 100;
            }
            else if (OptRunTime <= 1000)
            {
                OptRunTime = OptRunTime + 200;
            }
            else if(OptRunTime <= 1500)
            {
                OptRunTime = OptRunTime + 300;
            }
            else if(OptRunTime <= 2000)
            {
                OptRunTime = OptRunTime + 400;
            }
            else if(OptRunTime <= 3000)
            {
                OptRunTime = OptRunTime + 600; 
            }
            else if(OptRunTime <= 5000)
            {
                OptRunTime = OptRunTime + 1000; 
            }
            else
            {
                OptRunTime = OptRunTime + 1500; 
            }

            let prev_minima = await gdFunction(...prev_init);

            let new_minima = await gdFunction(...new_init);
            if(new_minima < prev_minima)
            {
                finalResponse = prev_init;
            }

            console.log("count ", count, "initVal ", initVal, "0.95*initVal", 0.95*initVal, "prev_minima ", prev_minima);
            console.log("count ", count, "new_minima ", new_minima);

            // otherwise do things
            // if( (new_minima > prev_minima) || (Number.isNaN(prev_minima)) || Number.isNaN(new_minima))
            if( (new_minima > prev_minima) ||
                ( ((prev_minima - new_minima) < that.GD_DELTA_DEVIATION) && (OptRunTime > 3000)) ||
                 (new_minima > that.MAX_DEVIATION) || Number.isNaN(new_minima) ||
                 (( initVal - new_minima) > 0.95*initVal) ||
                 ( (count > 30) && (OptRunTime > 3000) ) ||
                // ( (count > 60) && (OptRunTime > 3000) ) ||
                 ( (count > 10) && (PENALTY_EXISTS === false )) )
                //  ||
                //  ( (count > 40) && (OptRunTime < 2000) ) ||
                //  ( (count > 45) && (OptRunTime < 1500))  ||
                //  ( (count > 50) && (OptRunTime < 1000)))
            {   
                clearInterval(intervalId);
                if( (new_minima > that.MAX_DEVIATION) ||
                    Number.isNaN(new_minima) )
                {
                    sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                            "'" + UNIQUE_ID + "'" + "," +
                                            "'" + 'COMPLETED' + "'" + "," +
                                            "'" + OptRunTime + "'" + "," +
                                            "'" +  that.MAX_DEVIATION + "'" + "," +
                                            "'" +  loc_id + "'" + "," +
                                            "'" +  prod_id + "'" + "," +
                                            "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';   
   

                    try {
                        await cds.run(sqlStr);
                    }
                    catch (exception) {
                        console.log("GD OPTIMIZATION sqlStr exception ", sqlStr);
                        throw new Error(exception.toString());
                    }

                    that.UUID = UNIQUE_ID;
                    that.STATUS = 'COMPLETED';
                    that.OPTIMIZATION_TIME = OptRunTime;
                    that.OPTIMIZATION_DEVIATION = that.MAX_DEVIATION;
        
                    return;
                }

                
                console.log("Breaking While true Loop ", "count :", count, "new_response ", new_response, "EndTime ", new Date());
                // console.log("Breaking While true Loop ", "count :", count, new_response, "previous initial values", prev_minima, "New initial values", new_minima, "EndTime ", new Date());
                // Enable this based on User provisioned environment variable setting
                // await resourceFuncs._updateAppResourcesUsage(req,'GD FOR '+ PRODUCT_ID + ' AT ' + CAL_DATE + ' '+ count,false);
                

                var PID_OPTIMIZED = [];
                let PID_OPTIMIZED_SUM = 0;

                for (let pidIndex = 0; pidIndex < that.PRIMARY_IDS.length; pidIndex ++)
                {
                    // let optimized_qty = new_init[pidIndex];
                    // let optimized_qty = prev_init[pidIndex];
                    let optimized_qty = finalResponse[pidIndex];

                    PID_OPTIMIZED.push({"PRIMARY_ID": that.PRIMARY_IDS[pidIndex].PRIMARY_ID, "OPTIMIZED_PRIMARY_QTY" : optimized_qty});
                    PID_OPTIMIZED_SUM = PID_OPTIMIZED_SUM + optimized_qty;
                }

                // console.log("PID_OPTIMIZED", PID_OPTIMIZED);
                // console.log("PID_OPTIMIZED_SUM", PID_OPTIMIZED_SUM);

                // Initialize Revized PRIMARY ID Predicted values and then update with  PID_OPTIMIZED
                var OPTIMIZED_PRIMARY_IDS_PREDVALS = [];
                // console.log("INIT REVISED_PRIMARY_IDS_PREDVALS = ", REVISED_PRIMARY_IDS_PREDVALS);   
                for (let pidIndex = 0; pidIndex < (that.PRIMARY_IDS_PREDVALS).length; pidIndex++)
                {

                    OPTIMIZED_PRIMARY_IDS_PREDVALS.push({"PRIMARY_ID":that.PRIMARY_IDS_PREDVALS[pidIndex].PRIMARY_ID,
                                                        "CHAR_NUM":that.PRIMARY_IDS_PREDVALS[pidIndex].CHAR_NUM,
                                                        "CHARVAL_NUM":that.PRIMARY_IDS_PREDVALS[pidIndex].CHARVAL_NUM,
                                                        "OPTIMIZED_PRIMARY_QTY":0});


                }

                for (let revIndex = 0; revIndex < OPTIMIZED_PRIMARY_IDS_PREDVALS.length; revIndex++)
                {
                    for (let pcalcIndex = 0; pcalcIndex < PID_OPTIMIZED.length; pcalcIndex++)
                    {
                        if ( (OPTIMIZED_PRIMARY_IDS_PREDVALS[revIndex].PRIMARY_ID == PID_OPTIMIZED[pcalcIndex].PRIMARY_ID))
                        {

                            OPTIMIZED_PRIMARY_IDS_PREDVALS[revIndex].OPTIMIZED_PRIMARY_QTY =  PID_OPTIMIZED[pcalcIndex].OPTIMIZED_PRIMARY_QTY;
                        }
                    }
                }

                // console.log("OPTIMIZED_PRIMARY_IDS_PREDVALS ", OPTIMIZED_PRIMARY_IDS_PREDVALS);

                let OPTIMIZED_CHARVAL_COUNTS = [];

                for (let charNumIndex = 0; charNumIndex < that.CHARVAL_COUNTS.length; charNumIndex++)
                {

                    OPTIMIZED_CHARVAL_COUNTS.push({"LOC_PROD_ID":that.CHARVAL_COUNTS[charNumIndex].LOC_PROD_ID, 
                                                "CHAR_NUM": that.CHARVAL_COUNTS[charNumIndex].CHAR_NUM, 
                                                "CHARVAL_NUM": that.CHARVAL_COUNTS[charNumIndex].CHARVAL_NUM,
                                                "OPTIMIZED_CHAR_QTY": 0});
                }
                // console.log("INITIALIZED OPTIMIZED_CHARVAL_COUNTS = ", OPTIMIZED_CHARVAL_COUNTS);


                for (let revcharNumIndex = 0; revcharNumIndex < OPTIMIZED_CHARVAL_COUNTS.length; revcharNumIndex++)
                {
                    for (let revpidvalIdx = 0; revpidvalIdx < OPTIMIZED_PRIMARY_IDS_PREDVALS.length; revpidvalIdx++)
                    {
                        let primaryId = OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].PRIMARY_ID;
                        let locprodId = OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].LOC_PROD_ID;

                        if (primaryId.includes(locprodId) &&
                            ( OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].CHAR_NUM == OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].CHAR_NUM) &&
                            ( OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].CHARVAL_NUM == OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].CHARVAL_NUM))
                        {
                            OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].OPTIMIZED_CHAR_QTY = 
                                            OPTIMIZED_CHARVAL_COUNTS[revcharNumIndex].OPTIMIZED_CHAR_QTY + 
                                            OPTIMIZED_PRIMARY_IDS_PREDVALS[revpidvalIdx].OPTIMIZED_PRIMARY_QTY;

                        }
                    }
                }
                // console.log("UPDATED OPTIMIZED_CHARVAL_COUNTS = ", OPTIMIZED_CHARVAL_COUNTS);

                let btp_optimized_char_quantities = [];
                for (let revIdx = 0; revIdx < OPTIMIZED_CHARVAL_COUNTS.length; revIdx++)
                {
                    btp_optimized_char_quantities[revIdx] = OPTIMIZED_CHARVAL_COUNTS[revIdx].OPTIMIZED_CHAR_QTY;
                }

                var tableObj = [];	

                for (let index =0; index < btp_optimized_char_quantities.length; index++)
                {


                    let pred_dev = 0;
                    let pred_post_dev = 0;
                    let normalized_dev = 0;
                    if (ibp_planned_quantities[index] != 0)
                    {
                        pred_dev = (100*Math.abs(ibp_planned_quantities[index]-btp_predicted_quantities[index])/ibp_planned_quantities[index]).toFixed(2);
                        pred_post_dev = (100*Math.abs(ibp_planned_quantities[index]-btp_optimized_char_quantities[index])/ibp_planned_quantities[index]).toFixed(2);
                        normalized_dev = 100*Math.abs(ibp_planned_quantities[index]-btp_optimized_char_quantities[index])/loc_prod_ibp_qty;
                    }

                    let charNum = that.CHARVAL_COUNTS[index].CHAR_NUM;
                    let charvalNum = that.CHARVAL_COUNTS[index].CHARVAL_NUM;
                    let revisedQty = (btp_optimized_char_quantities[index]).toFixed(2);
                    // when Optimization Fails
                    if (revisedQty == 0)
                    {
                    revisedQty = (btp_predicted_quantities[index]).toFixed(4);
                    pred_post_dev = pred_dev;
                    }
                    var rowObj = { CAL_DATE : cal_date, 
                                    LOCATION_ID : loc_id,
                                    PRODUCT_ID : prod_id,
                                    MODEL_VERSION : modelVersion,
                                    VERSION : ibpVersion,
                                    SCENARIO : ibpScenario,
                                    ALGORITHM : algorithm,
                                    CHAR_NUM :  charNum ,
                                    CHARVAL_NUM :  charvalNum ,
                                    PREDICTED_QTY : (btp_predicted_quantities[index]).toFixed(4),
                                    IBP_PLANNED_QTY : ibp_planned_quantities[index],
                                    BTP_REVISED_QTY : revisedQty,
                                    PREDICTED_DEVIATION: pred_dev, 
                                    POST_PREDICTED_DEVIATION : pred_post_dev,
                                    NORMALIZED_DEVIATION: normalized_dev};

                    tableObj.push(rowObj);


                }
                sqlStr = 'DELETE FROM CP_VC_PREDICTIONS_OPTIMIZED ' +
                        ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                        ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                        ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                        ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                        ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                        ' AND ALGORITHM =  ' + "'" + algorithm + "'" +
                        ' AND "CAL_DATE" =  ' + "'" + cal_date + "'";
                try {
                    await cds.run(sqlStr);
                    //  console.log("sqlstr = ", sqlStr);
                }
                catch (exception) {
                    console.log("sqlStr ", sqlStr);
                    throw new Error(exception.toString());
                }

                // console.log("tableObj ", tableObj);
                let cqnQuery = {UPSERT:{ into: { ref: ['CP_VC_PREDICTIONS_OPTIMIZED'] }, entries:  tableObj }};

                await cds.run(cqnQuery);
                // let ppDeviation;
                sqlStr = 'SELECT SUM(POST_PREDICTED_DEVIATION) AS PP_DEVIATION FROM CP_VC_PREDICTIONS_OPTIMIZED ' +
                        ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                        ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                        ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                        ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                        ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                        ' AND ALGORITHM =  ' + "'" + algorithm + "'" +
                        ' AND "CAL_DATE" =  ' + "'" + cal_date + "'";
                try {
                    results = await cds.run(sqlStr);
                    ppDeviation = results[0].PP_DEVIATION;
                    //  console.log("sqlstr = ", sqlStr);
                }
                catch (exception) {
                    console.log("sqlStr ", sqlStr);
                    throw new Error(exception.toString());
                }

                console.log("INPUT_PENALTY ", INPUT_PENALTY, " PP_DEVIATION ", ppDeviation);
                console.log("UNIQUE_ID ", UNIQUE_ID);
                if(ppDeviation < that.MAX_DEVIATION)
                {
                    sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                                    "'" + UNIQUE_ID + "'" + "," +
                                                    "'" + 'COMPLETED' + "'" + "," +
                                                    "'" + OptRunTime + "'" + "," +
                                                    "'" +  ppDeviation + "'" + "," +
                                                    "'" +  loc_id + "'" + "," +
                                                    "'" +  prod_id + "'" + "," +
                                                    "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';
                    that.UUID = UNIQUE_ID;
                    that.STATUS = 'COMPLETED';
                    that.OPTIMIZATION_TIME = OptRunTime;
                    that.OPTIMIZATION_DEVIATION = ppDeviation;    
                    console.log("IF OPTIMIZATION_DEVIATION ", that.OPTIMIZATION_DEVIATION, "ppDeviation", ppDeviation);                                    
                }
                else
                {
                    sqlStr = 'UPSERT "CP_OPTIMIZATION_STATUS" VALUES (' +
                                                "'" + UNIQUE_ID + "'" + "," +
                                                "'" + 'COMPLETED' + "'" + "," +
                                                "'" + OptRunTime + "'" + "," +
                                                "'" +  that.MAX_DEVIATION + "'" + "," +
                                                "'" +  loc_id + "'" + "," +
                                                "'" +  prod_id + "'" + "," +
                                                "'" +  cal_date + "'" + ')' + ' WITH PRIMARY KEY';     
                    that.UUID = UNIQUE_ID;
                    that.STATUS = 'COMPLETED';
                    that.OPTIMIZATION_TIME = OptRunTime;
                    that.OPTIMIZATION_DEVIATION = that.MAX_DEVIATION;
                    console.log("ELSE OPTIMIZATION_DEVIATION ", that.OPTIMIZATION_DEVIATION, "ppDeviation", ppDeviation);                                    
        
                }                      

                try {
                    await cds.run(sqlStr);
                }
                catch (exception) {
                    console.log("GD OPTIMIZATION sqlStr exception ", sqlStr);
                    throw new Error(exception.toString());
                }

                console.log ("CP_OPTIMIZATION_STATUS sqlStr ", sqlStr);
                if(PENALTY_EXISTS == true)
                {
                    var optimizedTime = new Date().toISOString();

                    sqlStr = ' SELECT PERIODSTART, WEEKS FROM V_TELESCOPIC_WEEKS_PER_PERIOD ' +
                     ' WHERE PERIODSTART = ' + "'" + cal_date + "'" ;
                    let telescopicWeeks;
                    try {
                        telescopicWeeks = await cds.run(sqlStr);
                    }
                    catch (exception) {
                        console.log(" telescopicWeeks sqlStr ", sqlStr,  "locId : ",loc_id, "prodId : ", prod_id);
                        throw new Error(exception.toString());
                    }
                    

                    let weekDates = '(';
                    let dateStr = telescopicWeeks[0].PERIODSTART; //'2025-05-31';
                    let numberOfWeeks = telescopicWeeks[0].WEEKS;
                    for (let weekIdx = 0; weekIdx < numberOfWeeks ; weekIdx++)
                    {
                        const inputDate = new Date(dateStr);
                        inputDate.setDate(inputDate.getDate() + 7*weekIdx);
                        const result = inputDate.toISOString().split('T')[0];
                        if(weekIdx < numberOfWeeks - 1)
                            weekDates = weekDates + "'" + result + "'" + ",";
                        else
                            weekDates =  weekDates +  "'" + result + "'"  + ")";
                    }

                    console.log("weekDate ", weekDates);
                    let ibpQtysAggResults;
                    sqlStr = ' SELECT  SUM(QUANTITY) AS QUANTITY FROM CP_IBP_FUTUREDEMAND ' +
                                ' WHERE WEEK_DATE IN ' + weekDates + 
                            ' AND LOCATION_ID = ' + "'" + loc_id + "'" +
                            ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                            ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                            ' AND SCENARIO =  ' + "'" + ibpScenario + "'" ;
                    try {
                        ibpQtysAggResults = await cds.run(sqlStr);
                    }
                    catch (exception) {
                        console.log("ibpQtysAggResults sqlStr ", sqlStr, "locId : ",loc_id, "prodId : ", prod_id);
                        throw new Error(exception.toString());
                    }
                    console.log("ibpQtysAggResults ", ibpQtysAggResults);

                    let ibpQtysResults;
                    sqlStr = ' SELECT DISTINCT WEEK_DATE, QUANTITY FROM CP_IBP_FUTUREDEMAND ' +
                                ' WHERE WEEK_DATE IN ' + weekDates + 
                                ' AND LOCATION_ID = ' + "'" + loc_id + "'" +
                                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" ;
                    try {
                        ibpQtysResults = await cds.run(sqlStr);
                    }
                    catch (exception) {
                        console.log(" ibpQtysResults sqlStr ", sqlStr, "locId : ",loc_id, "prodId : ", prod_id);
                        throw new Error(exception.toString());
                    }
                    console.log("ibpQtysResults ", ibpQtysResults);
                    let disAggregatedValues = [];
                    for(let ratioIdx = 0; ratioIdx < ibpQtysResults.length; ratioIdx ++)
                    {
                        let ratio = ibpQtysResults[ratioIdx].QUANTITY/ibpQtysAggResults[0].QUANTITY;
                        disAggregatedValues.push({WEEK_DATE:ibpQtysResults[ratioIdx].WEEK_DATE,
                                                    QUANTITY:ibpQtysResults[ratioIdx].QUANTITY,
                                                    RATIO:ratio});
                    }

                    console.log("disAggregatedValues ", disAggregatedValues);
                    let preOptimizedResults = [];
                    let sqlStrPreOptimized = 'SELECT DISTINCT CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_TYPE, OBJ_DEP, OBJ_COUNTER, ' +
                                              'MODEL_TYPE, MODEL_VERSION, MODEL_PROFILE, VERSION, SCENARIO, PREDICTED, PREDICTED_TIME, ' +
                                              ' OPT_STARTTIME, DELTA_TIME, PREDICTED_STATUS, PRE_OPTIMIZED, PRE_OPTIMIZED_TIME, ' +
                                              ' OPT_ALGORITHM FROM CP_TS_PREDICTIONS' +
                                ' WHERE LOCATION_ID = ' + "'" + loc_id + "'" +
                                ' AND PRODUCT_ID =  ' + "'" + prod_id + "'" +
                                ' AND OBJ_TYPE =  ' + "'" + objType + "'" +
                                ' AND MODEL_VERSION =  ' + "'" + modelVersion + "'" +
                                ' AND VERSION =  ' + "'" + ibpVersion + "'" +
                                ' AND SCENARIO =  ' + "'" + ibpScenario + "'" +
                                ' AND CAL_DATE IN ' + weekDates + 
                                ' ORDER BY CAL_DATE, LOCATION_ID, PRODUCT_ID, OBJ_DEP, OBJ_COUNTER';
                    try {
                        preOptimizedResults = await cds.run(sqlStrPreOptimized);
                    }
                    catch (exception) {
                        console.log("sqlStrPreOptimized ", sqlStrPreOptimized);
                        throw new Error(exception.toString());
                    }
                
                    
                    let optimizationsTable = [];
                                

                    
                    for (let disaggIdx = 0; disaggIdx < disAggregatedValues.length; disaggIdx++)
                    {

                        for (let pidIndex = 0; pidIndex < that.PRIMARY_IDS.length; pidIndex ++)
                        {
                            let pid = PID_OPTIMIZED[pidIndex].PRIMARY_ID;

                            
                            let pidStr=pid.split('#');
                            let locId = pidStr[0];
                            let prodId = pidStr[1];
                            let objDep = pidStr[2];
                            let objCounter = pidStr[3];
                            if (PID_OPTIMIZED[pidIndex].OPTIMIZED_PRIMARY_QTY != null)
                            {
                                let disaggDate = disAggregatedValues[disaggIdx].WEEK_DATE;
                                let disaggOptimized = disAggregatedValues[disaggIdx].RATIO*PID_OPTIMIZED[pidIndex].OPTIMIZED_PRIMARY_QTY;
                                // let disaggPredicted = disAggregatedValues[disaggIdx].RATIO*that.PRIMARY_IDS[pidIndex].PREDICTED;
                                let disaggPredicted = that.PRIMARY_IDS[pidIndex].PREDICTED;

                                var rowObj = { CAL_DATE : disaggDate, 
                                    LOCATION_ID : locId,
                                    PRODUCT_ID : prodId,
                                    OBJ_TYPE: objType,
                                    OBJ_DEP: objDep,
                                    OBJ_COUNTER: objCounter,
                                    MODEL_TYPE: modelType,
                                    MODEL_VERSION : modelVersion,
                                    MODEL_PROFILE: modelProfile,
                                    VERSION : ibpVersion,
                                    SCENARIO : ibpScenario,
                                    PREDICTED: disaggOptimized,
                                    PREDICTED_TIME: optimizedTime,
                                    OPT_STARTTIME: that.PRIMARY_IDS[pidIndex].OPT_STARTTIME,
                                    DELTA_TIME: that.PRIMARY_IDS[pidIndex].DELTA_TIME, 
                                    PREDICTED_STATUS: 'SUCCESS',
                                    // PRE_OPTIMIZED: disaggPredicted,
                                    // PRE_OPTIMIZED_TIME: that.PRIMARY_IDS[pidIndex].PREDICTED_TIME,
                                    OPT_ALGORITHM : ALGORITHM};
                            
                                    optimizationsTable.push(rowObj);
                            }
                        }
                    }
                    let predictionsTable = [];
                    for(let pIndex = 0; pIndex < preOptimizedResults.length; pIndex++)
                    {
                        if( (preOptimizedResults[pIndex].CAL_DATE == optimizationsTable[pIndex].CAL_DATE) &&
                            (preOptimizedResults[pIndex].OBJ_DEP == optimizationsTable[pIndex].OBJ_DEP))
                        {
                            let rowObj = { CAL_DATE : optimizationsTable[pIndex].CAL_DATE, 
                                LOCATION_ID : optimizationsTable[pIndex].LOCATION_ID,
                                PRODUCT_ID : optimizationsTable[pIndex].PRODUCT_ID,
                                OBJ_TYPE: optimizationsTable[pIndex].OBJ_TYPE,
                                OBJ_DEP: optimizationsTable[pIndex].OBJ_DEP,
                                OBJ_COUNTER: optimizationsTable[pIndex].OBJ_COUNTER,
                                MODEL_TYPE: optimizationsTable[pIndex].MODEL_TYPE,
                                MODEL_VERSION : optimizationsTable[pIndex].MODEL_VERSION,
                                MODEL_PROFILE: optimizationsTable[pIndex].MODEL_PROFILE,
                                VERSION : optimizationsTable[pIndex].VERSION,
                                SCENARIO : optimizationsTable[pIndex].SCENARIO,
                                PREDICTED: optimizationsTable[pIndex].PREDICTED,
                                PREDICTED_TIME: optimizationsTable[pIndex].PREDICTED_TIME,
                                OPT_STARTTIME: optimizationsTable[pIndex].OPT_STARTTIME,
                                DELTA_TIME: optimizationsTable[pIndex].DELTA_TIME, 
                                PREDICTED_STATUS: optimizationsTable[pIndex].PREDICTED_STATUS,
                                PRE_OPTIMIZED: preOptimizedResults[pIndex].PRE_OPTIMIZED,
                                PRE_OPTIMIZED_TIME: preOptimizedResults[pIndex].PRE_OPTIMIZED_TIME,
                                OPT_ALGORITHM : optimizationsTable[pIndex].OPT_ALGORITHM};            
                                predictionsTable.push(rowObj);   
                        }
                        else
                        {
                            let rowObj = { CAL_DATE : preOptimizedResults[pIndex].CAL_DATE, 
                                LOCATION_ID : preOptimizedResults[pIndex].LOCATION_ID,
                                PRODUCT_ID : preOptimizedResults[pIndex].PRODUCT_ID,
                                OBJ_TYPE: preOptimizedResults[pIndex].OBJ_TYPE,
                                OBJ_DEP: preOptimizedResults[pIndex].OBJ_DEP,
                                OBJ_COUNTER: preOptimizedResults[pIndex].OBJ_COUNTER,
                                MODEL_TYPE: preOptimizedResults[pIndex].MODEL_TYPE,
                                MODEL_VERSION : preOptimizedResults[pIndex].MODEL_VERSION,
                                MODEL_PROFILE: preOptimizedResults[pIndex].MODEL_PROFILE,
                                VERSION : preOptimizedResults[pIndex].VERSION,
                                SCENARIO : preOptimizedResults[pIndex].SCENARIO,
                                PREDICTED: preOptimizedResults[pIndex].PREDICTED,
                                PREDICTED_TIME: preOptimizedResults[pIndex].PREDICTED_TIME,
                                OPT_STARTTIME: preOptimizedResults[pIndex].OPT_STARTTIME,
                                DELTA_TIME: preOptimizedResults[pIndex].DELTA_TIME, 
                                PREDICTED_STATUS: preOptimizedResults[pIndex].PREDICTED_STATUS,
                                PRE_OPTIMIZED: preOptimizedResults[pIndex].PRE_OPTIMIZED,
                                PRE_OPTIMIZED_TIME: preOptimizedResults[pIndex].PRE_OPTIMIZED_TIME,
                                OPT_ALGORITHM : preOptimizedResults[pIndex].OPT_ALGORITHM};            
                                predictionsTable.push(rowObj);   
                        }
                    }

                    if(predictionsTable.length > 0)
                    {
                        let cqnQuery = {UPSERT:{ into: { ref: ['CP_TS_PREDICTIONS'] }, entries:  predictionsTable }};
                        try {
                            await cds.run(cqnQuery);
                        }
                        catch(exception) {
                            console.log("cqnQuery ", cqnQuery, "locId : ",loc_id, "prodId : ", prod_id, );
                            throw new Error(exception.toString());
                        }
                    }
                }
                return ppDeviation;


            }
        }
        // }, RUNTIME); 

    }

    _gdUniqueIDs = async function ()
    {
    
        var lpsolve = require('lp_solve');
        var Row = lpsolve.Row;
    
        var lp = new lpsolve.LinearProgram();
    
        
    
        let UID_MIN_VALS = [7,1,10,1,12,4];
    
        
        let ibp_total_qty = 60;
    
        let ibp_planned_percent = [40,35,25,70,30,50,20,30];
    
        let ibp_planned_quantities = [];
    
        for (let ibpIdx = 0; ibpIdx < ibp_planned_percent.length; ibpIdx++)
        {
            ibp_planned_quantities[ibpIdx] =  ibp_total_qty*ibp_planned_percent[ibpIdx]/100;
        }
    
        console.log("ibp_planned_quantities ", ibp_planned_quantities);
        let ibp_penalties = [3,3,3,6,6,10,10,10];
    
        let UID_NUMS =['UID_1','UID_2','UID_3','UID_4','UID_5','UID_6'];
        global.UIDVAL_COUNTS = [];
    
        for (let uidIdx = 0; uidIdx < UID_MIN_VALS.length; uidIdx++)
        {
            UIDVAL_COUNTS.push({"UID_NUM":UID_NUMS[uidIdx],"UID_VALS":UID_MIN_VALS[uidIdx]});
        }
    
        for (let uidIdx = 0; uidIdx < UIDVAL_COUNTS.length; uidIdx ++)
        {
            UIDVAL_COUNTS[uidIdx].UID_NUM = lp.addColumn(UIDVAL_COUNTS[uidIdx].UID_NUM,false,false); 
        }
    
        console.log("UIDVAL_COUNTS ", UIDVAL_COUNTS);
        let CHARVAL_NUMS = ['CH11','CH12', 'CH13','CH21','CH22','CH31','CH32','CH33'];
    
        let matrix = [];
        for (var uidIdx = 0; uidIdx < UID_NUMS.length; uidIdx++) {
            matrix[uidIdx]=[];
            for (var charvalIdx = 0; charvalIdx < CHARVAL_NUMS.length; charvalIdx++) {
                matrix[uidIdx][charvalIdx] = 0;
            }
        }
        matrix[0][0] =1;
        matrix[0][4] =1;
        matrix[0][7] =1;
        matrix[1][0] =1;
        matrix[1][4] =1;
        matrix[1][5] =1;
        matrix[2][1] =1;
        matrix[2][3] =1;
        matrix[2][7] =1;
        matrix[3][1] =1;
        matrix[3][4] =1;
        matrix[3][6] =1;
        matrix[4][2] =1;
        matrix[4][3] =1;
        matrix[4][6] =1;
        matrix[5][2] =1;
        matrix[5][3] =1;
        matrix[5][6] =1;
    
        let CHVAL_COUNTS = [];
    
    
        for (var charvalIdx = 0; charvalIdx < CHARVAL_NUMS.length; charvalIdx++)
        {
    
            let charvalNums = new Row();
            let charvalNums_minus = new Row();
            
            for (let uidIdx = 0; uidIdx < UIDVAL_COUNTS.length; uidIdx ++)
            {
                if(matrix[uidIdx][charvalIdx] === 1)
                {
                    charvalNums = charvalNums.Add(UIDVAL_COUNTS[uidIdx].UID_NUM, ibp_penalties[charvalIdx]);
                    charvalNums_minus = charvalNums_minus.Add(UIDVAL_COUNTS[uidIdx].UID_NUM, -ibp_penalties[charvalIdx]);
    
                }
            } 
            
            CHVAL_COUNTS.push({"CHVAL_NUM":CHARVAL_NUMS[charvalIdx], "CHVAL_VALUE":charvalNums,"CHVAL_VALUE_MINUS":charvalNums_minus, "IBP_QTY":ibp_planned_quantities[charvalIdx]});
    
    
    
        }
    
    
    
        console.log(" CHVAL_COUNTS ",  CHVAL_COUNTS);
    
    
    
    
        const optimize = require('gradient-descent')
    
    //    var vars = ['x','y','z'];
    
    
        // global.objective = '1*Math.pow((UID_1 +  UID_2-24),2) ' + '\r\n' + 
        //                     '1*Math.pow((UID_3 + UID_4-21),2)'  + '\r\n' +
        //                     ' 1*Math.pow((UID_5 + UID_6-15),2) '+ '\r\n' +
        //                     ' 2*Math.pow((UID_3 + UID_5-42),2) '+ '\r\n' +
        //                     ' 2*Math.pow((UID_1 + UID_2-18),2) '+ '\r\n' +
        //                     ' 3*Math.pow((UID_2 -30),2) '+ '\r\n' +
        //                     ' 3*Math.pow((UID_4 + UID_5 + UID_6-12),2) '+ '\r\n' +
        //                     ' 3*Math.pow(( UID_1 + UID_3-18),2) ' + '\r\n' +
        //                     ' 18*Math.pow((UID_1+UID_2+UID_3+UID_4+UID_5+UID_6-60),2) ' + '\r\n' +
        //                     ' 6*Math.pow((UID_1 - 7),2) '+ '\r\n' +
        //                     ' 6*Math.pow((UID_2 -1),2) '+ '\r\n' +
        //                     ' 6*Math.pow((UID_3 -10),2) '+ '\r\n' +
        //                     ' 6*Math.pow((UID_4 -1),2) '+ '\r\n' +
        //                     ' 6*Math.pow((UID_5 -12),2) '+ '\r\n' +
        //                     ' 6*Math.pow((UID_6 -4),2) ';
    
        global.objective = '1*Math.pow((UID_1 +  UID_2-24),2) ' + '+' + '\r\n' + 
                    '1*Math.pow((UID_3 + UID_4-21),2)'  + '+' + '\r\n' +
                    ' 1*Math.pow((UID_5 + UID_6-15),2) '+ '+' + '\r\n' +
                    ' 2*Math.pow((UID_3 + UID_5-42),2) '+ '+' + '\r\n' +
                    ' 2*Math.pow((UID_1 + UID_2-18),2) '+ '+' + '\r\n' +
                    ' 3*Math.pow((UID_2 -30),2) '+ '+' + '\r\n' +
                    ' 3*Math.pow((UID_4 + UID_5 + UID_6-12),2) '+ '+' + '\r\n' +
                    ' 3*Math.pow(( UID_1 + UID_3-18),2) ' + '+' + '\r\n' +
                    ' 18*Math.pow((UID_1+UID_2+UID_3+UID_4+UID_5+UID_6-60),2) ' + '+' + '\r\n' +
                    ' 6*Math.pow((UID_1 - 7),2) '+ '+' + '\r\n' +
                    ' 6*Math.pow((UID_2 -1),2) '+ '+' + '\r\n' +
                    ' 6*Math.pow((UID_3 -10),2) '+ '+' + '\r\n' +
                    ' 6*Math.pow((UID_4 -1),2) '+ '+' + '\r\n' +
                    ' 6*Math.pow((UID_5 -12),2) '+ '+' + '\r\n' +
                    ' 6*Math.pow((UID_6 -4),2) ';
    
        // objective.push({"coefficient":1,"expression":'UID_1+UID_2', "constant":-24, "power":2})
        // objective.push({"coefficient":1,"expression":'UID_3 + UID_4', "constant":-21, "power":2})
        // objective.push({"coefficient":1,"expression":'UID_5 + UID_6', "constant":-15, "power":2})
        // objective.push({"coefficient":1,"expression":'UID_3 + UID_5', "constant":-42, "power":2})
        // objective.push({"coefficient":1,"expression":'UID_1 + UID_2)', "constant":-18, "power":2})
        // objective.push({"coefficient":1,"expression":'UID_2', "constant":-30, "power":2})
        // objective.push({"coefficient":1,"expression":'UID_4 + UID_5 + UID_6', "constant":-12, "power":2})
        // objective.push({"coefficient":1,"expression":'UID_1 + UID_3', "constant":-18, "power":2})
    
    
        const func = async function (U1 = undefined, U2 = undefined, U3 = undefined,
                        U4 = undefined, U5 = undefined, U6 = undefined,  U7 = undefined, U8 = undefined,
                        U9 = undefined, U10 = undefined, U11 = undefined, U12 = undefined, U13 = undefined, U14 = undefined,
                        U15 = undefined, U16 = undefined, U17 = undefined, U18 = undefined, U19 = undefined, U20 = undefined,
                        U21 = undefined, U22 = undefined, U23 = undefined, U24 = undefined, U25 = undefined, U26 = undefined,
                        U27 = undefined, U28 = undefined, U29 = undefined, U30 = undefined, U31 = undefined, U32 = undefined,
                        U33 = undefined, U34 = undefined, U35 = undefined, U36 = undefined, U37 = undefined, U38 = undefined, 
                        U39 = undefined, U40 = undefined, U41 = undefined, U42 = undefined, U43 = undefined, U44 = undefined,
                        U45 = undefined, U46 = undefined, U47 = undefined, U48 = undefined, U49 = undefined, U50 = undefined,
                        U51 = undefined, U52 = undefined, U53 = undefined, U54 = undefined, U55 = undefined, U56 = undefined,
                        U57 = undefined, U58 = undefined, U59 = undefined, U60 = undefined, U61 = undefined, U62 = undefined,
                        U63 = undefined, U64 = undefined, U65 = undefined, U66 = undefined, U67 = undefined, U68 = undefined,
                        U69 = undefined, U70 = undefined, U71 = undefined, U72 = undefined, U73 = undefined, U74 = undefined,
                        U75 = undefined, U76 = undefined, U77 = undefined, U78 = undefined, U79 = undefined, U80 = undefined,
                        U81 = undefined, U82 = undefined, U83 = undefined, U84 = undefined, U85 = undefined, U86 = undefined,
                        U87 = undefined, U88 = undefined, U89 = undefined, U90 = undefined, U91 = undefined, U92 = undefined,
                        U93 = undefined, U94 = undefined, U95 = undefined, U96 = undefined, U97 = undefined, U98 = undefined,
                        U99 = undefined, U100 = undefined)
    
    
        { 
    
            let local_objective = global.objective;
    
            // console.log("BEGIN A B C D E F ", A, B, C, D, E , F);
    
            // console.log("BEGIN local_objective ", local_objective);
            // console.log("BEGIN local_uid_val_counts ", local_uid_val_counts);
            // console.log("BEGIN A ", A);
    
            // // let strReplace = "'" + 'UID_1' + "'";
            if(U1 != undefined)
                local_objective = local_objective.replace(/UID_1/g,U1);
            if(U2 != undefined)
                local_objective = local_objective.replace(/UID_2/g,U2);
    
            if(U3 != undefined)
                local_objective = local_objective.replace(/UID_3/g,U3);
    
            if(U4 != undefined)
                local_objective = local_objective.replace(/UID_4/g,U4);
    
            if(U5 != undefined)
                local_objective = local_objective.replace(/UID_5/g,U5);
            
            if(U6 != undefined)
                local_objective = local_objective.replace(/UID_6/g,U6);
    
            if(U7 != undefined)
                local_objective = local_objective.replace(/UID_7/g,U7);
    
            if(U8 != undefined)
                local_objective = local_objective.replace(/UID_8/g,U8);
    
            if(U9 != undefined)
                local_objective = local_objective.replace(/UID_9/g,U9);
    
            if(U10 != undefined)
                local_objective = local_objective.replace(/UID_10/g,U10);
    
    
            if(U11 != undefined)
                local_objective = local_objective.replace(/UID_11/g,U11);
            if(U12 != undefined)
                local_objective = local_objective.replace(/UID_12/g,U12);
    
            if(U13 != undefined)
                local_objective = local_objective.replace(/UID_13/g,U13);
    
            if(U14 != undefined)
                local_objective = local_objective.replace(/UID_14/g,U14);
    
            if(U15 != undefined)
                local_objective = local_objective.replace(/UID_15/g,U15);
    
            if(U16 != undefined)
                local_objective = local_objective.replace(/UID_16/g,U16);
    
            if(U17 != undefined)
                local_objective = local_objective.replace(/UID_17/g,U17);
    
            if(U18 != undefined)
                local_objective = local_objective.replace(/UID_18/g,U18);
    
            if(U19 != undefined)
                local_objective = local_objective.replace(/UID_19/g,U19);
    
            if(U20 != undefined)
                local_objective = local_objective.replace(/UID_20/g,U20);
    
            if(U21 != undefined)
                local_objective = local_objective.replace(/UID_21/g,U21);
            if(U22 != undefined)
                local_objective = local_objective.replace(/UID_22/g,U22);
            
            if(U23 != undefined)
                local_objective = local_objective.replace(/UID_23/g,U23);
            
            if(U24 != undefined)
                local_objective = local_objective.replace(/UID_24/g,U24);
            
            if(U25 != undefined)
                local_objective = local_objective.replace(/UID_25/g,U25);
            
            if(U26 != undefined)
                local_objective = local_objective.replace(/UID_26/g,U26);
            
            if(U27 != undefined)
                local_objective = local_objective.replace(/UID_27/g,U27);
            
            if(U28 != undefined)
                local_objective = local_objective.replace(/UID_28/g,U28);
            
            if(U29 != undefined)
                local_objective = local_objective.replace(/UID_29/g,U29);
            
            if(U30 != undefined)
                local_objective = local_objective.replace(/UID_30/g,U30);
    
            if(U31 != undefined)
                local_objective = local_objective.replace(/UID_31/g,U31);
                
            if(U32 != undefined)
                local_objective = local_objective.replace(/UID_32/g,U32);
            
            if(U33 != undefined)
                local_objective = local_objective.replace(/UID_33/g,U33);
            
            if(U34 != undefined)
                local_objective = local_objective.replace(/UID_34/g,U34);
            
            if(U35 != undefined)
                local_objective = local_objective.replace(/UID_35/g,U35);
            
            if(U36 != undefined)
                local_objective = local_objective.replace(/UID_36/g,U36);
            
            if(U37 != undefined)
                local_objective = local_objective.replace(/UID_37/g,U37);
            
            if(U38 != undefined)
                local_objective = local_objective.replace(/UID_38/g,U38);
            
            if(U39 != undefined)
                local_objective = local_objective.replace(/UID_39/g,U39);
            
            if(U40 != undefined)
                local_objective = local_objective.replace(/UID_40/g,U40);
    
            if(U41 != undefined)
                local_objective = local_objective.replace(/UID_41/g,U41);
                
            if(U42 != undefined)
                local_objective = local_objective.replace(/UID_42/g,U42);
            
            if(U43 != undefined)
                local_objective = local_objective.replace(/UID_43/g,U43);
            
            if(U44 != undefined)
                local_objective = local_objective.replace(/UID_44/g,U44);
            
            if(U45 != undefined)
                local_objective = local_objective.replace(/UID_45/g,U45);
            
            if(U46 != undefined)
                local_objective = local_objective.replace(/UID_46/g,U46);
            
            if(U47 != undefined)
                local_objective = local_objective.replace(/UID_47/g,U47);
            
            if(U48 != undefined)
                local_objective = local_objective.replace(/UID_48/g,U48);
            
            if(U49 != undefined)
                local_objective = local_objective.replace(/UID_49/g,U49);
            
            if(U50 != undefined)
                local_objective = local_objective.replace(/UID_50/g,U50);
    
                if(U51 != undefined)
                local_objective = local_objective.replace(/UID_51/g,U51);
                
            if(U52 != undefined)
                local_objective = local_objective.replace(/UID_52/g,U52);
            
            if(U53 != undefined)
                local_objective = local_objective.replace(/UID_53/g,U53);
            
            if(U54 != undefined)
                local_objective = local_objective.replace(/UID_54/g,U54);
            
            if(U55 != undefined)
                local_objective = local_objective.replace(/UID_55/g,U55);
            
            if(U56 != undefined)
                local_objective = local_objective.replace(/UID_56/g,U56);
            
            if(U57 != undefined)
                local_objective = local_objective.replace(/UID_57/g,U57);
            
            if(U58 != undefined)
                local_objective = local_objective.replace(/UID_58/g,U58);
            
            if(U59 != undefined)
                local_objective = local_objective.replace(/UID_59/g,U59);
            
            if(U60 != undefined)
                local_objective = local_objective.replace(/UID_60/g,U60);
    
            if(U61 != undefined)
                local_objective = local_objective.replace(/UID_61/g,U61);
                
            if(U62 != undefined)
                local_objective = local_objective.replace(/UID_62/g,U62);
            
            if(U63 != undefined)
                local_objective = local_objective.replace(/UID_63/g,U63);
            
            if(U64 != undefined)
                local_objective = local_objective.replace(/UID_64/g,U64);
            
            if(U65 != undefined)
                local_objective = local_objective.replace(/UID_65/g,U65);
            
            if(U66 != undefined)
                local_objective = local_objective.replace(/UID_66/g,U66);
            
            if(U67 != undefined)
                local_objective = local_objective.replace(/UID_67/g,U67);
            
            if(U68 != undefined)
                local_objective = local_objective.replace(/UID_68/g,U68);
            
            if(U69 != undefined)
                local_objective = local_objective.replace(/UID_69/g,U69);
            
            if(U70 != undefined)
                local_objective = local_objective.replace(/UID_70/g,U70);
    
            if(U71 != undefined)
                local_objective = local_objective.replace(/UID_71/g,U71);
                
            if(U72 != undefined)
                local_objective = local_objective.replace(/UID_72/g,U72);
            
            if(U73 != undefined)
                local_objective = local_objective.replace(/UID_73/g,U73);
            
            if(U74 != undefined)
                local_objective = local_objective.replace(/UID_74/g,U74);
            
            if(U75 != undefined)
                local_objective = local_objective.replace(/UID_75/g,U75);
            
            if(U76 != undefined)
                local_objective = local_objective.replace(/UID_76/g,U76);
            
            if(U77 != undefined)
                local_objective = local_objective.replace(/UID_77/g,U77);
            
            if(U78 != undefined)
                local_objective = local_objective.replace(/UID_78/g,U78);
            
            if(U79 != undefined)
                local_objective = local_objective.replace(/UID_79/g,U79);
            
            if(U80 != undefined)
                local_objective = local_objective.replace(/UID_80/g,U80);
    
            if(U81 != undefined)
                local_objective = local_objective.replace(/UID_81/g,U81);
                
            if(U82 != undefined)
                local_objective = local_objective.replace(/UID_82/g,U82);
            
            if(U83 != undefined)
                local_objective = local_objective.replace(/UID_83/g,U83);
            
            if(U84 != undefined)
                local_objective = local_objective.replace(/UID_84/g,U84);
            
            if(U85 != undefined)
                local_objective = local_objective.replace(/UID_85/g,U85);
            
            if(U86 != undefined)
                local_objective = local_objective.replace(/UID_86/g,U86);
            
            if(U87 != undefined)
                local_objective = local_objective.replace(/UID_87/g,U87);
            
            if(U88 != undefined)
                local_objective = local_objective.replace(/UID_88/g,U88);
            
            if(U89 != undefined)
                local_objective = local_objective.replace(/UID_89/g,U89);
            
            if(U90 != undefined)
                local_objective = local_objective.replace(/UID_90/g,U90);
    
            if(U91 != undefined)
                local_objective = local_objective.replace(/UID_91/g,U91);
                
            if(U92 != undefined)
                local_objective = local_objective.replace(/UID_92/g,U92);
            
            if(U93 != undefined)
                local_objective = local_objective.replace(/UID_93/g,U93);
            
            if(U94 != undefined)
                local_objective = local_objective.replace(/UID_94/g,U94);
            
            if(U95 != undefined)
                local_objective = local_objective.replace(/UID_95/g,U95);
            
            if(U96 != undefined)
                local_objective = local_objective.replace(/UID_96/g,U96);
            
            if(U97 != undefined)
                local_objective = local_objective.replace(/UID_97/g,U97);
            
            if(U98 != undefined)
                local_objective = local_objective.replace(/UID_98/g,U98);
            
            if(U99 != undefined)
                local_objective = local_objective.replace(/UID_99/g,U99);
            
            if(U100 != undefined)
                local_objective = local_objective.replace(/UID_100/g,U100);
            // console.log("local_obective replaced ", local_objective);
            // console.log("local_obective eval ", eval(local_objective));
    
    
    
            return eval(local_objective);
        }
        
    
    
    
        const init = [10, 2, 15, 3, 18, 6]; // dimension is obtained from initial point
        
    
        const res = await optimize(init, func,0.0001);
    
        //  console.log("response ", res);
        //  console.log("func(...init) ", await func(...init));
    
    
        let prev_init = [res[0], res[1], res[2], res[3], res[4], res[5]];
        let new_init = [res[0], res[1],res[2], res[3],res[4], res[5]];
    
        let count = 0;
    
        while(true)
        {
    
            prev_init =  new_init;
    
            let new_response = await optimize(new_init, func,0.0001);
            new_init = [new_response[0], new_response[1],  new_response[2],  new_response[3],  new_response[4],  new_response[5]];
            count ++;
            
            let prev_minima = await func(...prev_init);
            let new_minima = await func(...new_init);
    

            //  console.log("new_init", new_init, "minima ", await func(...new_init));
    
            if( (new_minima > prev_minima) )
            {        
                console.log("Breaking For Loop ", "count :", count, new_response, "previous initial values", prev_minima, "New initial values", new_minima);
                break;
            }
        }
    
    }

    _optimize_gd = async function()
    {
    
        const optimize = require('gradient-descent')
        const func = async function(args, constant=0) 
        { 
            let response = constant;
            // console.log("args[0] ", args[0] , args[1]);
            for (let index = 0; index<args.length; index++)
            {
                response = response + args[index]*args[index];
            }
            return response;
        };



        const init = [3,4,5]; // dimension is obtained from initial point

        const res = await optimize(init, func,0.00000001);
        var assert = require('assert');
        console.log("response ", res);

        console.log("response ", res);
        console.log("func(...init) ", await func(...init));
        // console.log("func(...res) ", await func(...res));
        // assert(await func(...res) < await func(...init));

        // let prev_init = [0, 0,0];
        // let new_init = [res[0], res[1],res[2]];
        let prev_init = [res[0], res[1], res[2]];
        let new_init = [res[0], res[1], res[2]];

        let count = 0;
        // for (let index = 0; index < 100; index ++)
        // while (await func(...new_init) > 0.00001)
        while (true)
        {

            prev_init =  new_init;

            let new_response = await optimize(new_init, func,0.001);
            // console.log("index :", index+1, new_response, "initial values", await func(...new_init));
            new_init = [new_response[0], new_response[1], new_response[2]];
            count ++;
            
            let prev_minima = await func(...prev_init);
            let new_minima = await func(...new_init);
            for (let dIndex  = 0; dIndex < new_minima.length; dIndex ++)
            {

            }
            let delta = Math.abs((new_minima - prev_minima));
            // console.log("prev_minima", prev_minima, "new_minima", new_minima, "delta ", delta)

            // if (await func(...new_init) < 0.05)
            console.log("new_init", new_init, "minima ", await func(...new_init));

            // if ( (delta <= 0.00001) || count > 1000)
            if( (new_minima > prev_minima) )
            // if (count > 1000)

            {        
                console.log("Breaking For Loop ", "count :", count, new_response, "previous initial values", prev_minima, "New initial values", new_minima);
                break;
            }
        }
        console.log("new_init", new_init, "minima ", await func(...new_init));

    }


    _runlpsolve = async function()
    {
        var lpsolve = require('lp_solve');
        var Row = lpsolve.Row;

        var lp = new lpsolve.LinearProgram();

        var x = lp.addColumn('x'); // lp.addColumn('x', true) for integer variable
        var y = lp.addColumn('y'); // lp.addColumn('y', false, true) for binary variable


        var objective = new Row().Add(x, 1).Add(y, 1);

        lp.setObjective(objective);

        var machineatime = new Row().Add(x, 50).Add(y, 24);
        lp.addConstraint(machineatime, 'LE', 2400, 'machine a time')

        var machinebtime = new Row().Add(x, 30).Add(y, 33);
        lp.addConstraint(machinebtime, 'LE', 2100, 'machine b time')

        lp.addConstraint(new Row().Add(x, 1), 'GE', 75 - 30, 'meet demand of x')
        lp.addConstraint(new Row().Add(y, 1), 'GE', 95 - 90, 'meet demand of y')

        console.log(lp.dumpProgram());
        console.log(lp.solve());
        console.log('objective =', lp.getObjectiveValue())
        console.log('x =', lp.get(x));
        console.log('y =', lp.get(y));
        console.log('machineatime =', lp.calculate(machineatime));
        console.log('machinebtime =', lp.calculate(machinebtime));
    }
    

    _nlopt = async function()
    {
        // const nlopt = require('nlopt-js')
        // // ES6: import nlopt from 'nlopt-js'
        // const opt = new nlopt.Optimize(nlopt.Algorithm.LD_SLSQP, 2);
        // opt.setMinObjective((x, grad) => {
        //   if (grad) {
        //     grad[0] = 0;
        //     grad[1] = 0.5 / Math.sqrt(x[1]);
        //   }
        //   return Math.sqrt(x[1]);
        // }, 1e-4);
        // const res = opt.optimize([1, 6]);

        
    var nlopt = requires('nlopt');
    var myfunc = function(n, x, grad){
    if(grad){
        grad[0] = 0.0;
        grad[1] = 0.5 / Math.sqrt(x[1]);
    }
    return Math.sqrt(x[1]);
    }
    var createMyConstraint = function(cd){
    return {
        callback:function(n, x, grad){
        if(grad){
            grad[0] = 3.0 * cd[0] * (cd[0]*x[0] + cd[1]) * (cd[0]*x[0] + cd[1])
            grad[1] = -1.0
        }
        tmp = cd[0]*x[0] + cd[1]
        return tmp * tmp * tmp - x[1]
        },
        tolerance:1e-8
    }
    }
    options = {
    algorithm: "LD_MMA",
    numberOfParameters:2,
    minObjectiveFunction: myfunc,
    inequalityConstraints:[createMyConstraint([2.0, 0.0]), createMyConstraint([-1.0, 1.0])],
    xToleranceRelative:1e-4,
    initalGuess:[1.234, 5.678],
    lowerBounds:[Number.MIN_VALUE, 0]
    }
    console.log(nlopt(options).parameterValues);

    }
}

module.exports = GenOptimization;
