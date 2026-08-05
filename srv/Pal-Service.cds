
//using { sbp.pal as pal } from '../db/pal-schema';
using { cp as pal } from '../db/pal-schema';
// using V_PREDLOCATION from '../db/pal-schema';
// using V_PREDPRODUCT from '../db/pal-schema';
// service PalService @(requires: 'authenticated-user'){
service PalService @(path: '/pal') {
    entity aesForecast as projection on pal.PalAesForecast;

    entity hgbtRegressionsV1 as projection on pal.PalHgbtRegressionsV1;
    // entity hgbtByGroup as projection on pal.PalHgbtByGroup;
    entity hgbtPredictionsV1 as projection on pal.PalHgbtPredictionsV1;

    entity rdtRegressions as projection on pal.PalRdtRegressions;
    // entity rdtByGroup as projection on pal.PalRdtByGroup;
    entity rdtPredictions as projection on pal.PalRdtPredictions;

    entity automlRegressions as projection on pal.PalAutomlRegressions;
    // entity automlByGroup as projection on pal.PalAutomlByGroup;
    entity automlPredictions as projection on pal.PalAutomlPredictions;
    

    entity mlrRegressions as projection on pal.PalMlrRegressions;
    // entity mlrByGroup as projection on pal.PalMlrByGroup;
    entity mlrPredictions as projection on pal.PalMlrPredictions;

    entity varmaModels as projection on pal.PalVarmaModels;
    // entity varmaByGroup as projection on pal.PalVarmaByGroup;
    entity varmaPredictions as projection on pal.PalVarmaPredictions;


    entity generateRegModels as projection on pal.PalGenRegressionModels;
    entity generatePredictions as projection on pal.PalGenPredictions;

    // entity generateOptimizations as projection on pal.OptimizePredictions;


    entity getPredictions as projection on pal.TS_PREDICTIONS;
    // entity getIbpResultPlan as projection on pal.IBP_RESULTPLAN_TS;
    entity getODImpactVals as projection on pal.TS_OBJDEP_CHAR_IMPACT_F;
    entity getODModelVersions as projection on pal.OD_MODEL_VERSIONS;


    entity generateAhcClusters as projection on pal.PalGenClusters;
    entity generatePcaCatComp as projection on pal.PalGenPcaComps;


    entity getClustersInput as projection on pal.CLUSTER_DATA;
    entity getClusterStages as projection on pal.AHC_COMBINE_PROCESS;
    entity getClusterIds as projection on pal.AHC_RESULTS;

    entity getClustersByDistance as projection on pal.V_AHC_CLUSTER_RESULTS; 
    entity getClusterChars as projection on pal.V_CLUSTER_CHARS;

    entity getPredLocation as projection on pal.V_PREDLOCATION;
    entity getPredProduct as projection on pal.V_PREDPRODUCT;
    @readonly
    entity getPrePredictions as projection on pal.V_BOM_TSPREDICTIONV3;

    entity getLocPredictions as projection on pal.V_LOCPREDICTIONS;
    entity getProdPredictions as projection on pal.V_PRODPREDICTIONS;

    // PROFILES
    entity getPlanningProfile as projection on pal.PLANNING_PROFILE;
    entity palProfiles as projection on pal.PAL_PROFILES_LOCPROD;
    entity palProfilesLocProd as projection on pal.PAL_PROFILES_LOCPROD;
    entity palProfilesLoc as projection on pal.PAL_PROFILES_LOC;
    entity palPrpidsPrimaryIds as projection on pal.PRPIDS_USER_ASSIGNED_PIDS;
    entity palPrpidsDistances as projection on pal.PRPIDS_DISTANCES;
    entity palMappedVarchars as projection on pal.VARCHARS_MAPPED;

    // PCA CATEGORICAL COMPONENTS
    entity palPcaCatScores as projection on pal.PCA_CAT_SCORES_GRP_TAB;
    entity palPcaCatScoringInfo as projection on pal.PCA_CAT_SCALING_INFORMATION_GRP_TAB;
    entity palPcaLoadings as projection on pal.PCA_CAT_LOADINGS_GRP_TAB;
    entity palPcaLoadingsInfo as projection on pal.PCA_CAT_LOADINGS_INFORMATION_GRP_TAB;


    entity clusterGroupDistances as projection on pal.V_CLUSTERS_GROUP_DISTANCES;



    // @odata.draft.enabled
    // entity modelProfiles as projection on pal.PalModelProfiles;

    //entity hgbtPred as projection on pal.PalHgbtPred;

    entity get_palparameters as projection on pal.PAL_PARAMETERS;
    //entity correlation as projection on pal.Palinputs;
    type result {
        resultStatus : String;
        success : Boolean;
    }

    type clusterQtyType : Integer enum {
        ACTUALS_HISTORY=1;
        ACTUALS_FUTURE=2;
        FORECAST_UNCONSUMED=3;
    }

    action genTimeSeriesData();
    action generateModels(vcRulesList : array of{
            profile      : String(50);
            override     : Boolean;
            Location     : String(4);
            Product      : String(40);
            GroupID      : String(20);
            Type         : String(10); // //OD - Object Dependency, Restriction
            modelVersion : String(20);// Active, Simulation
            //modelType : Integer;//  @assert.range: [ 1, 2 ]; // 1 - MLR, 2 - HGBT
            dimensions   : Integer;
        });

        action genPredictions(vcRulesList : array of {
            profile      : String(50);
            override     : Boolean;
            version      : String(10); // default 'BASELINE'; // IBP Version
            scenario     : String(32); // default 'BSL_SCENARIO'; // IBP Scenario
            Location     : String(4);
            Product      : String(40);
            GroupID      : String(20);
            Type         : String(10); // //OD - Object Dependency, Restriction
            modelVersion : String(20);// Active, Simulation// Active, Simulation
            dimensions   : Integer;
            impactAnalysis : Boolean default 1 @assert.range: [
                0,
                1
            ]; // Active, Simulation
            OptProfile : String(50);
            Optimization : Boolean default 0 @assert.range: [
                0,
                1
            ];
            // OptAlgorithm         :  String(10); 
            // OptFactor         : Double;
            // DsAlgorithm     :   String(10); 
            startDate    : Date;
            endDate    : Date;
        });

        action purgePredictionModels(vcRulesList : array of {
            Location     : String(4);
            Product      : String(40);
            GroupID      : String(20);
            Type         : String(10); // Object Dependency, Restriction, Primary
        });

        // action genClusterUniqueIDS
        // (
        //     Location     : String(4),
        //     Product      : String(40),
        // );

        action generatePrpids(vcRulesList : array of{
            Location     : String(4);
            Product      : String(40);
        });

        action genClusters(vcRulesList : array of{
            profile      : String(50);
            override     : Boolean;
            Location     : String(4);
            Product      : String(40);
            numClusters  : Int16;
            UUID         : String(50);
        });

        function fgenPcaCat(vcRulesList : String) returns String;
        action genPcaCat(vcRulesList : array of{
            profile      : String(50);
            Location     : String(4);
            Product      : String(40);
            UUID         : String(50);
        });

        action genUniqueIdCharVals(Location: String(4),Product: String(40));
        action genUidCharValsForClusterResults(Location: String(4),Product: String(40), Profile: String(50));

        action getClusterUniqueIDs(Location: String(4), Product: String(40), Profile : String(50), UniqueId : String(50));


        action genFutureOptions(vcRulesList : array of{
            profile      : String(50);
            override     : Boolean;
            Location     : String(4);
            Product      : String(40);
            Customer     : String(40);
            GroupID      : String(20);
            Type         : String(10); 
            modelVersion : String(20);
            Version      : String(10); 
            Scenario     : String(32); 
        });

        function fgModels(vcRulesList : String) returns String;
        function fgPredictions(vcRulesList : String) returns String;
        function  fgenClusterUniqueIDS(Location: String(4), Product: String(40)) returns String;
        function  fgenUniqueIdCharVals(Location: String(4), Product: String(40)) returns String;
        function  fgenUidCharValsForClusterResults(Location: String(4), Product: String(40), Profile: String(50)) returns String;

        function fgetClusterUniqueIDs(Location: String(4), Product: String(40), Profile : String(50),  UniqueId : String(50)) returns String;

        action genOptimizations(optimizationsList : array of {
            Location: String(4);
            Product: String(40);
            Type : String(10);
            modelVersion : String(20); // Active/Simulation
            version      : String(10); // default 'BASELINE'; // IBP Version
            scenario     : String(32); // default 'BSL_SCENARIO'; // IBP Scenario
            // OptAlgorithm: String(10); 
            OptProfile : String(50);
            Optimization : Boolean default 1 @assert.range: [
                1,
                1
            ];
            // OptFactor : Double;
            startDate: Date; 
            endDate: Date;
            initPredictions : Boolean default 1 @assert.range: [
                0,
                1
            ];
            minFactor : Double default 0.5 @assert.range: [
                0.1,
                0.9
            ];
            override     : Boolean;
        }, optUniqueId: String(50));
        // Type is ObjType - OD, RT, PI
        function fgOptimizations(Location: String(4), Product: String(40),Type : String(10),  modelVersion : String(20),
                                version      : String(10), scenario     : String(32), OptAlgorithm: String(10), OptProfile: Boolean, OptFactor : Double,
                                startDate: Date, endDate: Date) returns String;

        // function f_genPredictions(vcRulesList : array of {
        //     profile      : String(50);
        //     override     : Boolean;
        //     version      : String(10); // default 'BASELINE'; // IBP Version
        //     scenario     : String(32); // default 'BSL_SCENARIO'; // IBP Scenario
        //     Location     : String(4);
        //     Product      : String(40);
        //     GroupID      : String(20);
        //     Type         : String(10); // //OD - Object Dependency, Restriction
        //     modelVersion : String(20);// Active, Simulation// Active, Simulation
        //     dimensions   : Integer;
        // }) returns String;

// CUD operations, CREATE, UPDATE, DELETE  
        function fhandlePlanningProfiles(cudType : String(10), profilesList : LargeString) returns String;
        action handlePlanningProfiles(cudType : String(10), profilesList : array of
        {
            PLANNING_PROFILE    : String(10)  @title: 'PLANNING PROFILE ';
            MIMIMUM_PRIMARY_IDS : Integer   @title: 'MINIMUM PRIMARY IDS for Clustering';
            MINIMUM_CLUSTERS    : Int16   @title: 'Minimum Clusters ';
            MAXIMUM_CLUSTERS    : Int16   @title: 'Maximum Clusters ';
            PERCENTAGE          : Int16       @title: 'Primary IDs Percentage';
            PAST_PERIODS        : Int16       @title: 'Past Weeks';
            FUTURE_PERIODS      : Int16       @title: 'Future Weeks';
            THRESHOLD_DMD       : Integer     @title: 'Threshold Demand';
            CLUSTERING_PROFILE  : String(10)  @titile: 'Clustering Profile';
        });

        function fassignProfilesAtLocProd(cudType : String(10), profilesList : String) returns String;
        action assignProfilesAtLocProd(cudType : String(10), profilesList : array of
        {
            LOCATION_ID         : String(4)   @title: 'Location ID';
            PRODUCT_ID          : String(40)  @title: 'Product ID';
            PREDICTIVE_PROFILE      : String(10)  @title: 'PREDICTIVE PROFILE ';
            FORECASTING_PROFILE     : String(10)  @title: 'FORECASTING PROFILE';
            PLANNING_PROFILE        : String(10)  @title: 'PLANNING PROFILE ';
        });

        function fassignProfilesAtLoc(cudType : String(10), profilesList : String) returns String;
        action assignProfilesAtLoc(cudType : String(10), profilesList : array of
        {
            LOCATION_ID         : String(4)   @title: 'Location ID';
            PREDICTIVE_PROFILE      : String(10)  @title: 'PREDICTIVE PROFILE ';
            FORECASTING_PROFILE     : String(10)  @title: 'FORECASTING PROFILE';
            PLANNING_PROFILE        : String(10)  @title: 'PLANNING PROFILE ';
        });

        function fassignPrimaryIds(cudType : String(10), primaryIdsList : String) returns String;
        action assignPrimaryIds(cudType : String(10), primaryIdsList : array of
        {
            LOCATION_ID     : String(4)   @title: 'Location ID';
            PRODUCT_ID      : String(40)  @title: 'Product ID';
            PRIMARY_ID      : Integer     @title: 'Primary ID';
        });


        function fgetClustersSequence(LOCATION_ID: String(4), PRODUCT_ID : String(40), CLUSTER_ID : Integer, MODEL_PROFILE : String(50)) returns String; 

        // function fgetClustersQty(LOCATION_ID: String(4), PRODUCT_ID : String(40), CLUSTER_ID : String(5), MODEL_PROFILE : String(50), 
        //                          START_DATE : String(12), END_DATE : String(12), QTY_TYPE : Integer, MODEL_VERSION: String(20),
        //                          VERSION : String(10), SCENARIO : String(32) ) returns String; 
        function fgetClustersQty(LOCATION_ID: String(4), PRODUCT_ID : String(40), CLUSTER_ID : String(5), MODEL_PROFILE : String(50), 
                                 START_DATE : String(12), END_DATE : String(12), QTY_TYPE : Integer ) returns String;


}

   
/*
   // action testCorrelation(inputs : correlation)
    action testCorrelation(inputs : corrinput)
      returns result;
 

    function execCorrelation(a : Integer, b :  Integer)
      returns result;
*/
//}   entity getLeftClusters as projection on pal.V_AHC_LEFT_CLUSTER;
