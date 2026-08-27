using cp as od from '../db/data-model';
using cp_ds as ds from '../db/data-structures';
using V_OBDHDR from '../db/data-model';
using V_CLASSCHARVAL from '../db/data-model';
using V_SALESALL_WEEK from '../db/data-model';
using {
    V_SALES_H,
    V_PRODCLSCHAR,
    V_PRODCLSCHARVAL,
    V_ODPROFILES,
    V_PARTIALPRODCHAR,
    V_PARTIALPRODDESC,
    V_PARTIALPROD,
    V_NEWPRODREFCHAR,
    V_GETVARCHARPS,
    V_GETIBPCHARPS,
    V_UNIQUE_ID_ITEM,
    V_UNIQUE_ID_ITEMS,
    V_UNIQUE_ID,
    V_ODRESTRICT,
    V_LOCPRODLINERTR,
    V_CIR_QTY_VARDESC,
    V_CIRVERSCEN,
    V_BOM_DEMDFACLOC,
    V_GETASSEMBLY,
    V_GETASSEMBLY_NEW,
    V_PRODCONFIGAPI_UPDATED,
    V_PRODCONFIGAPI_COPY,
    V_IBP_SALESHCNFG_VC_IBPCUST,
    V_LINECAPACITY,
    V_BOMODCHAR,
    V_TS_LOCATION,
    V_OBJECTDEPCHARDESC,
    V_HISTORYVC,
    V_TS_PRODUCT,
    V_TSHIS_LOCATION,
    V_TSHIS_PRODUCT,
    V_DERIVEDPERCENTAGE,
    V_DEMANDLOC,
    V_SALESH_CONFIG,
    V_UNIQUEDIS,
    V_CHARDISTINCT,
    V_ASSEMBLYCOMP_DESC,
    V_LINEMASTERDESC,
    V_PRODLOCLINEDESC,
    V_BOMASSEMBLIES,
    V_PRODCOMPDESC,
    V_ACCESSNODES,
    V_RTRHEADER,
    V_ASMBLOC,
    V_CHARBASE_PLAN,
    V_DAILYHISVC,
    V_PRODSERIES,
    V_FPLAN_CONS,
    V_OPTIMIZEDPREDICTIONS,
    V_OPTIMIZEDFILTERS,
    V_OPTIMIZEDLOCATION,
    V_OPTIMIZEDPRODUCT,
    V_OPTIMIZEDMODELVERSION,
    V_OPTIMIZEDALGORITHM,
    V_OPTIMIZEDDATE,
    V_OPTIMIZEDVERSION,
    V_OPTIMIZEDSCENARIO,
    V_SNAPSHOT,
    V_OPTIMIZEDCHARVAL,
    V_PRODCLSCHARVAL_MASTER,
    V_MFLOCATIONMASTER,
    V_CUST_GROUP,
    V_PRIORITIZED_CHAR_VALUES,
    V_CP_HIS_PRIMARY_CHARVAL_TS,
    V_VARIANT_TABLES,
    V_CP_DAILY_PRIMARY_CHARVAL_TS,
    V_PRODCHARTYPE,
    V_CHARVAL_MASTER,
    V_NEWDEMANDLOC,
    V_ASMB_SNAPSHOT,
    V_COMP_SNAPSHOT,
    V_RTR_SNAPSHOT,
    V_FD_SNAPSHOT,
    V_OPT_SNAPSHOT,
    V_CHARVALUEUPDATE,
    V_VC_HISTORY_TS_CUST,
    V_IBP_PRODCLASS,
    V_ASSEMBLY_COMPONENT,
    V_ASSEMBLY_COMP,
    V_LOCPRODCLASSCHAR,
    V_TS_HISTORY_CUSTOMER,
    CV_CLUSTERS,
    V_PROD_ORDER_CONSUMPTION,
    V_PROD_ORDER_CONSUMPTION_NEW,
    CP_V_AHC_CLUSTERS_SORTED_COMBINED,
    V_RSTRREQ_PRODCONSD,
    V_WEEK_DESCRIPTOR,
    V_CLUSTER_DISTANCE,
    V_SALES_UNIQUE_ID,
    V_TELESCOPIC_FINAL_PLAN,
    V_TELESCOPIC_FINAL_PLAN_NEW,
    V_TELESCOPIC_FINAL_PLAN_NEW1,
    V_PROD_CHARBUCKET,
    CP_VC_PREDICTIONS_OPTIMIZED,
    CV_PLANNED_ORDER_ANALYSIS,
    CV_CP_CIR_GENERATED,
    CV_ASSEMBLY_REQ_ANALYSIS,
    CV_ASSEMBLY_COMPONENT,
    CV_TS_HISTORY_STAT,
    V_SNAPSHOT_LAG_CIR,
    V_SNAPSHOT_LAG_ASMB,
    V_CHANGELOG,
    V_ASSEMBLY_COMPONENT_BOM,
    CP_VC_OPTIMIZATION_PENALTIES,
    V_RESTRICTION_RULE,
    V_IBP_SALESH_ACTDEMD,
    CV_CLUSTER_HEATMAP05,
    V_LOC_CONFIG_PROD_TYPE,
    V_CAPACITY_CONSUMPTION,
    V_DMD_FORECAST_ANALYTICAL,
    V_LOC_CONFIGPRODUCT,
    V_ROLES_LOCPROD,
    V_ROLES_ACCESS,
    V_SALES_PROD_ORD,
    V_USER_ROLES,
    V_FUTUREDEMAND_VERSION,
    V_FCHARPLANTELEWEEK,
    V_PRODUCTCHAR
} from '../db/data-model';
// using V_ODPROFILES from '../db/data-model';
using V_BOMODCOND from '../db/data-model';
using V_SALESHCFG_CHARVAL from '../db/data-model';
using V_ODCHARVAL from '../db/data-model';
using V_LOCPROD from '../db/data-model';
using V_LOCPRODDATA from '../db/data-model';
using V_FACTORYLOC from '../db/data-model';
using V_MFLOCATION from '../db/data-model';
using V_FACTORY_LOCATION from '../db/data-model';
using V_PARTIALPRODUCT from '../db/data-model';
using V_SCENARIODIS from '../db/data-model';
using V_VERSIONDIS from '../db/data-model';
using V_LINECAPACITYVIEW from '../db/data-model';
using V_IBPVERSCENARIO from '../db/data-model';
using V_BOMPVS from '../db/data-model';
using V_COMPOD_TSPRED from '../db/data-model';
using V_ODCHARIMPACT_VALUE from '../db/data-model';
using {
    V_FCHARPLAN,
    V_ASMCOMP_REQ
} from '../db/data-model';
using V_PLANNEDCONFIG from '../db/data-model';
using V_NPI_CHARVAL from '../db/data-model';

// using {IBPDemandsrv as externalget} from './external/IBPDemandsrv.csn';
// using {IBPMasterDataAPI as externalPost} from './external/IBPMasterDataAPI.csn';
// using V_ASMCOMP_REQ from '../db/data-model';
service CatalogService @(impl: './lib/cat-service.js',path: '/catalog') {

    entity getVERSION_DMDVERSION    as projection on od.VERSION_DEMANDVERSION;

    @readonly
    entity getPageHdr               as projection on od.PAGEHEADER;

    @readonly
    entity getPagePgrh              as projection on od.PAGEPARAGRAPH;

    //Create Variant
    @readonly
    entity getVariant               as projection on od.CREATEVARIANT;

    @readonly
    entity getVariantHeader         as projection on od.CREATEVARIANTHEADER;

    // Get Products
    // @readonly
    entity getProducts              as projection on od.PRODUCT;

    // Get locations
    // @readonly
    entity getLocation              as projection on od.LOCATION;

    @readonly
    entity getLocationtemp          as projection on od.LOCATION;

    // Get customer group
    // @readonly
    entity getCustgroup             as projection on od.CUSTOMERGROUP;

    // Get Sales history
    @readonly
    entity getSalesh                as projection on V_SALES_H; //od.SALESH;

    @readonly
    entity getCustomerGroups        as projection on V_CUST_GROUP;

    //Get location product
    @readonly
    // entity getLocProd             as projection on od.LOCATION_PRODUCT;
    @cds.query.limit: 0
    entity getLocProd               as projection on V_LOCPRODDATA;

    entity getBOMLocProdDet         as projection on V_BOMASSEMBLIES;
    // Get Location products based on product master
    entity getLocProdDet            as projection on V_LOCPROD;
    entity getProdCompDesc          as projection on V_PRODCOMPDESC;
    function getLocProdDetNew()                                                                                                                                                                                                                                                                                                          returns String;

    // Get Factory Location based on factory location
    @readonly
    entity getfactorylocdesc        as projection on V_FACTORYLOC;


    entity getRolesLocProd          as projection on V_ROLES_LOCPROD;
    entity getRolesAccess           as projection on V_ROLES_ACCESS;
    entity getUserRoles             as projection on V_USER_ROLES;

    entity getMfLocation            as projection on V_MFLOCATION;
    entity getMFMaster              as projection on V_MFLOCATIONMASTER;
    entity getFactoryLocation       as projection on V_FACTORY_LOCATION;
    entity getPartialProduct        as projection on V_PARTIALPRODUCT;
    entity getDistinctScenario      as projection on V_SCENARIODIS;
    entity getDistinctVersion       as projection on V_VERSIONDIS;

    @readonly
    entity getObjDepCharDesc        as projection on V_OBJECTDEPCHARDESC;

    @readonly
    entity getHistoryVC             as projection on V_HISTORYVC;

    entity getTSLocation            as projection on V_TS_LOCATION;
    entity getTSProduct             as projection on V_TS_PRODUCT;
    entity getTSHisLocation         as projection on V_TSHIS_LOCATION;
    entity getTSHisProduct          as projection on V_TSHIS_PRODUCT;


    // Get sales history configuration
    @readonly
    entity getSalesCfg              as projection on od.SALESH_CONFIG;

    // Get sales history configuration and its characteristics
    @readonly
    entity getSaleshCfg             as projection on V_SALESHCFG_CHARVAL;

    // Get BOM header
    @readonly
    entity gBomHeaderet             as projection on V_BOM_DEMDFACLOC; //od.BOMHEADER;

    // BOM object dependency
    @readonly
    entity getBomOD                 as projection on od.BOM_OBJDEPENDENCY;

    //History timeseries for Object dependency
    entity getODHdr                 as projection on od.TS_OBJDEPHDR;
    //History timeseries for Object dependency characteristics
    entity getODCharHdr             as projection on od.TS_OBJDEP_CHARHDR;
    entity getClass                 as projection on od.CLASS;
    entity getProductClass          as projection on od.PRODUCT_CLASS;
    // entity getClassProduct           as projection on V_PRODCLSCHAR;

    @readonly
    entity getCharacteristics       as projection on od.CHARACTERISTICS;

    ///*****/IBP Future demand and IBP Future Characteristic plan/*****/
    @readonly
    entity getIBPFdem               as projection on od.IBP_FUTUREDEMAND;

    @readonly
    entity getIBPFChar               as projection on od.IBP_FCHARPLAN;

      @readonly
    entity getIBPFCharView               as projection on V_FCHARPLANTELEWEEK;

    @readonly
    entity getCharMaster               as projection on od.CHARACTERISTICS_MASTER;

    @readonly
    entity getIBPFplan              as projection on V_FCHARPLAN;

    @readonly
    entity getIBPFplanCons          as projection on V_FPLAN_CONS;

    @readonly
    entity getTimeseriesF           as projection on od.TS_OBJDEP_CHARHDR_F;

    ///*****/ Product Variant Structure/*****/
    // Get PVS nodes ( Access, Structure and View nodes)
    entity getPVSNodes              as projection on od.PVS_NODES;
    // Get Product access node
    entity genProdAccessNode        as projection on V_ACCESSNODES; //od.PROD_ACCNODE;
    // PVS BOM details
    entity genCompStrcNode          as projection on od.PVS_BOM;
    // Structure node for BOM
    entity getPVSBOM                as projection on V_BOMPVS;
    // Get profiles
    entity getProfiles              as projection on od.PAL_PROFILEMETH;
    // Get Profile parameters
    entity getProfileParameters     as projection on od.PAL_PROFILEMETH_PARA;
    // Get Object dependency rules and characteristic details
    entity getMODHeader             as projection on V_OBDHDR;
    // get master data profile Object dependency
    entity getProfileOD             as projection on od.PAL_PROFILEOD;
    // Fetch OD profiles
    entity getODProfiles            as projection on V_ODPROFILES;
    // @odata.draft.enabled
    entity getDynHorizonGrpData     as projection on od.DYNAMIC_FROZEN_FIRM_GROUPTAB;
    //*****/ Services for F4 in application /*****/
    // Get products, location and class  details
    entity getProdClass             as projection on V_PRODCLSCHAR;
    // Get products, location and class  details
    entity getProdClsChar           as projection on V_PRODCLSCHARVAL;
    entity getProdClsCharMaster     as projection on V_PRODCLSCHARVAL_MASTER;
    // Get class , characteristics and its values
    entity getClassChar             as projection on V_CLASSCHARVAL;
    entity getClassCharMaster       as projection on V_CLASSCHARVAL;
    // Service to get BOM and OD condition
    entity getBomOdCond             as projection on V_BOMODCOND;
    // Get Object dependency rule characteristics
    entity getODcharval             as projection on V_ODCHARVAL;
    //Char Val Master
    entity getCharValMaster         as projection on V_CHARVAL_MASTER;
    //Get IBP version scenario
    entity getIbpVerScn             as projection on V_IBPVERSCENARIO;
    // Get Object dependency
    ///*****/ Assembly req  /*****/
    // Get Assembly component requirements
    entity getAsmbCompReq           as projection on V_ASMCOMP_REQ;

    // Master data for Assembly and component
    @readonly
    entity getAsmbComp              as projection on od.ASSEMBLY_COMP;

    @readonly
    entity getAssembComp            as projection on V_ASSEMBLY_COMP;

    @readonly
    entity getAsmbCompDesc          as projection on V_ASSEMBLYCOMP_DESC;

    @readonly
    entity getFutureDemandDates     as projection on od.IBP_FUTUREDEMAND;
   
    entity getFutureDemandVersionScn as projection on V_FUTUREDEMAND_VERSION;
    // Component Req. weekly at Demand Location Level

    ///*****/ Timeseries for job creation /*****/
    // Get Object dependency characteristics impact and prediction values
    entity getOdCharImpact          as projection on V_ODCHARIMPACT_VALUE;
    // Get BOM component-OD predcitions
    entity getBOMPred               as projection on V_COMPOD_TSPRED;

    ////*****/ Partial /*****/
    @readonly
    entity genPartialProd           as projection on V_PARTIALPRODDESC; //od.PARTIALPROD_INTRO;

    entity genConfigProd            as projection on V_LINECAPACITYVIEW;
    entity getprodChar              as projection on V_PRODUCTCHAR;
    @readonly
    entity getPartialProd           as projection on V_PARTIALPROD;

    entity getPartialChar           as projection on V_PARTIALPRODCHAR;
    ///*****/  New product intorduction /*****/
    entity genNewProd               as projection on od.NEWPROD_INTRO;
    // Get new product characteristics
    entity getNewProdChar           as projection on V_NEWPRODREFCHAR;
    ///*****/ Unique ID /*****/
    entity getUniqueHeader          as projection on od.UNIQUE_ID_HEADER;
    entity getUniqueItem            as projection on V_UNIQUE_ID_ITEM;
    entity getUniqueItems           as projection on V_UNIQUE_ID_ITEMS;
    entity getUniqueId              as projection on V_UNIQUE_ID;
    ///*****/  Method 2 /*****/

    entity genvarcharps             as projection on od.VARCHAR_PS;
    entity getPriSecChar            as projection on V_GETVARCHARPS;
    /**
     * \*\*
     */
    // IBP char.
    /**
     * \*\*
     */
    entity getIBPPriSecChar         as projection on V_GETIBPCHARPS;

    ///*****/ Authorizations /*****/
    @odata.draft.enabled
    entity getARObj                 as projection on od.USER_AUTHOBJ;

    entity getParameters            as projection on od.PARAMETER_AUTH;
    entity getUsers                 as projection on od.USERDETAILS;
    entity getUserPreferences       as projection on od.USER_PREFERENCES;

    ///*****/ Restrictions /*****/
    //Get Restriction header
    @odata.draft.enabled
    entity genRtrHeader             as projection on V_RTRHEADER; //od.RESTRICT_HEADER;

    //Object dependency restric
    @odata.draft.enabled
    entity getODHdrRstr             as projection on V_ODRESTRICT;

    // @odata.draft.enabled
    @readonly
    entity getProdlocline           as projection on V_PRODLOCLINEDESC; //od.PROD_LOC_LINE;

    // @odata.draft.enabled
    // entity getPartialProdlocline  as projection on od.PARTIALPROD_LOC_LINE;
    @readonly
    entity getLineCapacity          as projection on V_LINECAPACITY; //od.LINECAPACITY;

    entity getLineCap               as projection on V_LINECAPACITY;

    // @odata.draft.enabled
    @readonly
    entity getLine                  as projection on V_LINEMASTERDESC; //od.LINEMASTER;

    entity getProdLocRtrLine        as projection on V_LOCPRODLINERTR;
    ///*****/ CIR char rate /*****/
    entity getCIRCharRate           as projection on V_CIR_QTY_VARDESC; //V_CIR_CHAR_RATE;
    entity getCIRVerScen            as projection on V_CIRVERSCEN;

    ///*****/ Planning Configuration /*****/
    // BOI - Deepa
    @readonly
    entity Method_Types             as projection on od.METHOD_TYPES;

    entity V_Parameters             as projection on V_PLANNEDCONFIG;
    entity getPlancfgPara           as projection on od.PARAMETER_VALUES;
    entity getCIRGenerated          as projection on od.CIR_GENERATED;

    ///*****/ CIR weekly /*****/
    @readonly
    entity getCIRLog                as projection on od.CIRLOG;

    // IBP Calender Week
    entity getIBPCalenderWeek       as projection on od.IBPCALENDER_WEEK;

    // Derived Characteristics Implementation

    // EOI - Deepa
    //entity getSalesStock             as projection on od.SALES_S;
    entity getasmblyData            as projection on V_GETASSEMBLY;
    //entity to get assembly data new
    entity getAssemblyNewView       as projection on V_GETASSEMBLY_NEW;

    entity getFactoryLoc            as projection on od.FACTORY_SALESLOC;


    // Get IBP Version Scenario

    entity getVerScnmaster          as projection on od.IBPVERSIONSCENARIO;
    //**Constraints**//
    entity genCompConstraint        as projection on od.COMPONENT_AVAIL;
    // Analytical services
    entity getKeyFiguareSet         as projection on od.OPTION_PERCENTAGE;
    entity getWeeklySalesData       as projection on V_SALESALL_WEEK;
    entity getForecastSnapshotLag   as projection on V_SNAPSHOT_LAG_CIR;
    entity getAssemblySnapshotLag   as projection on V_SNAPSHOT_LAG_ASMB;

    //Get Product configuration  for S&OP service call
    //  @requires : 'authenticated-user'
    // entity getLocProdCharAPI      as projection on V_PRODCONFIGAPI;
    // // Prod config QTY
    // // @requires : 'authenticated-user'
    // entity getLocProdActDemandAPI as projection on V_IBP_SALESHCNFG_VC_IBPCUST;
    entity getWhereUsed             as projection on V_BOMODCHAR;

    //Derived Percentage
    @readonly
    entity getDerivedPercentage     as projection on V_DERIVEDPERCENTAGE;

    @readonly
    entity getSalesConfig           as projection on V_SALESH_CONFIG;

    entity getDistinctUniqueID      as projection on V_UNIQUEDIS;
    entity getDistinctChar          as projection on V_CHARDISTINCT;
    entity getDemandLoc             as projection on V_DEMANDLOC;
    entity getASMBLOC               as projection on V_ASMBLOC;
    //Start of Create AUTOML Profiles -Pradeep
    entity get_palProfiles          as projection on od.PAL_PROFILEMETH;
    entity getCharBasePlan          as projection on V_CHARBASE_PLAN;


    @readonly
    entity getHistoryVCDaily        as projection on V_DAILYHISVC;

    entity getProdSeries            as projection on V_PRODSERIES;

    //Entity for Optimized Predictions
    @readonly
    entity getOptimizedPred         as projection on V_OPTIMIZEDPREDICTIONS;

    entity getOptimizedFilters      as projection on V_OPTIMIZEDFILTERS;
    entity getOptimizedLocation     as projection on V_OPTIMIZEDLOCATION;
    entity getOptimizedProduct      as projection on V_OPTIMIZEDPRODUCT;
    entity getOptimizedModelVersion as projection on V_OPTIMIZEDMODELVERSION;
    entity getOptimizedDate         as projection on V_OPTIMIZEDDATE;
    entity getOptimizedVersion      as projection on V_OPTIMIZEDVERSION;
    entity getOptimizedScenario     as projection on V_OPTIMIZEDSCENARIO;
    entity getOptimizedAlgorithm    as projection on V_OPTIMIZEDALGORITHM;
    entity getOptimizedCharValNum   as projection on V_OPTIMIZEDCHARVAL;
    entity getSnapshot              as projection on V_SNAPSHOT;
    entity getSnapshotHead          as projection on od.SNAPSHOT_HEAD;
    entity getSnapshotData          as projection on od.SNAPSHOT_DATA;

    entity getCIRSnapshot           as projection on V_SNAPSHOT;
    entity getASMBSnapshot          as projection on V_ASMB_SNAPSHOT;
    entity getCOMPSnapshot          as projection on V_COMP_SNAPSHOT;
    entity getRTRSnapshot           as projection on V_RTR_SNAPSHOT;
    entity getFDSnapshot            as projection on V_FD_SNAPSHOT;
    entity getOPTSnapshot           as projection on V_OPT_SNAPSHOT;


    entity getUserAppVisibility     as projection on od.USER_APPVISIBLITY_ROLES;
    entity getCharValOptPercent     as projection on od.CHAR_VALUE_OPTPERCENT;
    entity getUIDRulesValidity      as projection on od.UNIQUEID_RULE_VALIDITY;
    //Entity and Function for Location Product Characteristics
    entity getLocProdChars          as projection on od.LOC_PROD_CHARACTERISTICS;
    //Entity  for sales_hm
    entity getSalesHM               as projection on od.SALES_HM;
    //Option Percentage
    entity getKeyFigureMaster       as projection on od.KEY_FIGURE_MASTER;
    entity getCharValBucket         as projection on od.CHARVAL_BUCKET;
    entity getRestrLikelihood_tel   as projection on V_RSTRREQ_PRODCONSD;

    //Method2
    entity getHistoryDataVC         as projection on V_CP_HIS_PRIMARY_CHARVAL_TS;
    entity getHistoryDailyDataVC    as projection on V_CP_DAILY_PRIMARY_CHARVAL_TS;
    entity getTimeSeriesCustomer    as projection on V_VC_HISTORY_TS_CUST;
    // New Product Introduction Services
    entity getNPICharVal            as projection on V_NPI_CHARVAL;
    entity getPhaseOutDet           as projection on od.NPI_PHASEOUTDATA
    entity getProjDetails           as projection on od.NPI_MAINTAINPROJDET
    entity getCharValDimentions     as projection on od.NPI_CHARVAL_DIMENSION;
    entity getNPICharData           as projection on V_CHARVALUEUPDATE;
    entity getTmpUIDHeader          as projection on od.TMP_UNIQUE_ID_HEADER;
    entity getIBPProdClass          as projection on V_IBP_PRODCLASS;
    entity getAssemblyCompQty       as projection on V_ASSEMBLY_COMPONENT;

    entity getSalesConfigDelta      as projection on od.SALESH_CONFIG_DELTA;
    entity getProfileLocProd        as projection on od.PROFILE_LOC_PROD;
    // entity getCharGroupWeightage as projection on V_CHARGROUPWEIGHTAGE;
    //VP-1241 Temporary entities
    entity getSalesConfigSTB        as projection on od.SALESH_CONFIG_STB;
    entity getSalesSTB              as projection on od.SALESH_STB;


    entity getCharType              as projection on V_PRODCHARTYPE;

    entity getProdDemandLoc         as projection on V_NEWDEMANDLOC;
    entity getCharacteristicGroups  as projection on od.CHARACTERISTIC_GROUPS;
    entity getOptPercentThreshold   as projection on od.OPTION_PERCENT_THRESHOLD;
    entity getLocProdClassChar      as projection on V_LOCPRODCLASSCHAR;
    //Entity for TS History @customer
    entity getTSHisCust             as projection on V_TS_HISTORY_CUSTOMER;
    entity getPeriodProfile         as projection on od.PERIOD_PROFILE;
    entity getClusterData           as projection on CV_CLUSTERS;
    entity getClusterQty            as projection on CP_V_AHC_CLUSTERS_SORTED_COMBINED;
    entity getOptimizations         as projection on od.OPTIMIZATION_PROFILE;
    entity getOptPenalties          as projection on CP_VC_OPTIMIZATION_PENALTIES;
    entity getPredictionsOptimized as projection on CP_VC_PREDICTIONS_OPTIMIZED;

    entity getTelescopicData        as projection on od.TELESCOPIC_PERIODS;

    entity getProdOrdConsumption    as projection on V_PROD_ORDER_CONSUMPTION;
    // Added this duplicate service to display telescopic periods in pivot table.
    entity getProdOrdConsumptionNew as projection on V_PROD_ORDER_CONSUMPTION_NEW;

    entity getWeeks                 as projection on V_WEEK_DESCRIPTOR;
    entity getColorCodeChar         as projection on od.COLOR_CODE_CHAR;
    entity getColorCodeMaster       as projection on od.COLOR_CODE_MASTER;
    entity getClusterDistance       as projection on V_CLUSTER_DISTANCE;
    entity getManualOptionData      as projection on od.OPTION_PERCENTAGE;
    entity getSalesUniqueID         as projection on V_SALES_UNIQUE_ID;

    entity getTelescopicFinalPlan   as projection on V_TELESCOPIC_FINAL_PLAN;
    entity getTelescopicFinalPlanNew   as projection on V_TELESCOPIC_FINAL_PLAN_NEW;
    entity getTelescopicFinalPlanNew1   as projection on V_TELESCOPIC_FINAL_PLAN_NEW1;

    entity getProdCharBucket        as projection on V_PROD_CHARBUCKET;

    // entity getcharAnalysis as projection on CV_CHARACTERISTIC_ANALYSIS;
    entity getProcedureChar         as projection on od.PROCEDURE_CHAR;
    entity getErrorLogs             as projection on od.ERROR_LOGS;

    entity getPlannedOrdAnalysis    as projection on CV_PLANNED_ORDER_ANALYSIS;
    entity getCirGen                as projection on CV_CP_CIR_GENERATED;
    entity getAsmbReqAnalysis       as projection on CV_ASSEMBLY_REQ_ANALYSIS;
    entity getCVassemblycomp        as projection on CV_ASSEMBLY_COMPONENT;
    entity getHistoryStat           as projection on CV_TS_HISTORY_STAT;
    entity getConfig_Change_logs    as projection on V_CHANGELOG;
    entity getClusterHeatmap        as projection on CV_CLUSTER_HEATMAP05;
    // entity getForecastCharAnalysis        as projection on CV_FORECAST_CHAR_ANALYSIS;



    entity getAsmbCompBOM           as projection on V_ASSEMBLY_COMPONENT_BOM;
    entity getMappings              as projection on od.BTP_MAPPING;

    entity getRestrictionRule       as projection on V_RESTRICTION_RULE;
    // entity getAsmCoefficient         as projection on V_ASMB_COEEFICIENT;
    entity getIbpSalesActDemand     as projection on V_IBP_SALESH_ACTDEMD;
    entity getEntityUsage           as projection on od.ENTITY_USAGE;
    entity getCapConsumption        as projection on V_CAPACITY_CONSUMPTION;

    entity getMasterDataStage       as projection on od.MASTER_DATA_STAGE;
    entity getDMDAnalytical         as projection on V_DMD_FORECAST_ANALYTICAL;
    entity getAssemblyRequirements as projection on od.ASSEMBLY_REQ;

    //Role based Authorization 
    entity getRoles as projection on od.ROLES;
    entity getAssignedUserRoles as projection on od.USER_ROLES;
    @cds.query.limit: 0
    entity getLocConfigProduct as projection on V_LOC_CONFIGPRODUCT;
    
    @cds.query.limit: 0
    entity getMaterialTypes as projection on V_LOC_CONFIG_PROD_TYPE;
   
//    entity getSalesProductionOrder as projection on od.SALES_PROD_ORD;
   entity getSalesProductionOrder as projection on V_SALES_PROD_ORD;
   //get app details for chatbot
   entity getAppDetails as projection on od.APPLICATION_DETAILS;
    //Entity for Derived Characteristic Sequence
    entity getDerivedCharSequence as projection on od.DERIVED_CHAR_SEQUENCE;
    entity getPrioritizedCharValues as projection on V_PRIORITIZED_CHAR_VALUES;
    entity getDerivedCharProfile as projection on od.DERIVED_CHAR_PROFILE;

    entity getBOMVariants as projection on V_VARIANT_TABLES;
    
    entity getDerivedCharRules as projection on od.DERIVED_CHAR_RULES;
    
    entity getDerivedNodes  as projection on od.DERIVED_NODES;
    /**
     * Functions
     */
    function getMultiBOMODConditionNew(LOCATION_ID: String(4), PRODUCT_ID: String(40), VALID_FROM: String(10), VALID_TO: String(10))                                                                                                                                                                                                     returns String;
    function getAssemblyNew(LOCATION_ID: String(4), PRODUCT_ID: String(40), VALID_FROM: String(10), VALID_TO: String(10))                                                                                                                                                                                                                returns String;
    function getSaleshNew(LOCATION_ID: String(4), REF_PRODID: String, PRODUCT_ID: String, FROM_DATE: Date, TO_DATE: Date)                                                                                                                                                                                                                returns LargeString;
    function updateIBPClass(CLASSDATA: String)                                                                                                                                                                                                                                                                                           returns String;
    function verifyIBPClass(PRODUCT_ID: String(40), CLASS_NUM: String(20))                                                                                                                                                                                                                                                               returns String;
    //function to access DYNAMIC_FROZEN_FIRM_GROUPTAB
    function createDynamicFFG(Flag: String, PRODATA: String)                                                                                                                                                                                                                                                                             returns String;
    //productaccess node
    function genProdAN(LOCATION_ID: String(4), PRODUCT_ID: String(40), ACCESS_NODE: String(50))                                                                                                                                                                                                                                          returns array of genProdAccessNode;
    //component structure node
    function genCompSN(LOCATION_ID: String(4), PRODUCT_ID: String(40), ITEM_NUM: String(5), COMPONENT: String(40), STRUC_NODE: String(50))                                                                                                                                                                                               returns array of genCompStrcNode;
    //fucntion createProfiles and parameters
    function createProfiles(PROFILE: String(50), METHOD: String(50), PRF_DESC: String(200), CREATED_DATE: Date, CREATED_BY: String(12), PARAMETERS: LargeString, TYPE: String(10))                                                                                                                                                       returns String;
    // Create Profile parameters
    function createProfilePara(FLAG: String(1), PROFILE: String(50), METHOD: String(50), PARA_NAME: String(100), INTVAL: Integer, DOUBLEVAL: Double, STRVAL: String(20), PARA_DESC: String(1000), PARA_DEP: String(1000), CREATED_DATE: Date, CREATED_BY: String(12))                                                                    returns String;
    // Assign OD to a profile
    function assignProfilesOD(FLAG: String(1), LOCATION_ID: String(4), PRODUCT_ID: String(40), COMPONENT: String(40), PROFILE: String(50), STRUC_NODE: String(50))                                                                                                                                                                       returns String;
    function get_objdep()                                                                                                                                                                                                                                                                                                                returns array of ds.objectDep; //objectDep;
    function getAllProd(LOCATION_ID: String(4))                                                                                                                                                                                                                                                                                          returns array of ds.locProd;
    function getAllProdNew(LOC: String)                                                                                                                                                                                                                                                                                                  returns array of ds.locProd;
    function getAllVerScen(LOCATION_ID: String(4))                                                                                                                                                                                                                                                                                       returns array of ds.prodVerScen;
    function getAllVerScenMulti(LOC: String)                                                                                                                                                                                                                                                                                             returns array of ds.prodVerScen;
    function getProdAsmbComp()                                                                                                                                                                                                                                                                                                           returns array of getProducts;
    function getClassCharNew(CLASS_NAME: String(20), CHAR_NAME: String(80))                                                                                                                                                                                                                                                              returns String;
    //Component requirement qunatity determination
    function getCompreqQty(LOCATION_ID: String(4), PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32))                                                                                                                                                                                                                    returns String;
    // Create PVS node structure
    function genpvs(NODE_TYPE: String(2), CHILD_NODE: String(50), PARENT_NODE: String(50), ACCESS_NODES: String(50), NODE_DESC: String(200), UPPERLIMIT: Integer, LOWERLIMIT: Integer, FLAG: String(1))                                                                                                                                  returns array of getPVSNodes;
    // Gen Full Configured Demand
    function gen_FullConfigDemand(LOCATION_ID: String(4), PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32), MODEL_VERSION: String(20))                                                                                                                                                                                  returns String;
    // Assembly req old
    function getCompReqFWeekly(LOCATION_ID: String(4), PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32), COMPONENT: String(40), STRUCNODE: String(50), FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20), CRITICALKEY: String(1))                                                                                 returns array of ds.asmbreq;
    // Assembly req new
    function getCompReqFWeeklyNew(LOCATION_ID: String(4), PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32), COMPONENT: String(40), STRUCNODE: String(50), FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20), CRITICALKEY: String(1), SEL: String(10), pageStart: Integer, pageEnd: Integer, searchText: String)   returns array of ds.asmbreq_new;
    //Assembly Req multi
    function getCompReqFWeeklyMulti(LOCATION_ID: String(4), PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32), COMPONENT: String(40), STRUCNODE: String(50), FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20), CRITICALKEY: String(1), SEL: String(10), pageStart: Integer, pageEnd: Integer, searchText: String) returns array of ds.asmbreq_new;
    // Component Req. weekly
    function getAsmbCompReqFWeekly(LOCATION_ID: String(4), VERSION: String(10), SCENARIO: String(32), FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20))                                                                                                                                                                           returns array of ds.compreq;
    // Component Req. weekly at Partial Product level
    function getAsmbCompReqFWeeklyPP(LOCATION_ID: String(4), VERSION: String(10), SCENARIO: String(32), FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20), SEL: String(10), pageStart: Integer, pageEnd: Integer, searchText: String, type: String, Flag: String(1))                                                               returns array of ds.compreq_new;
    function getAsmbCompReqFWeeklymulti(LOCATION_ID: String(4), VERSION: String(10), SCENARIO: String(32), FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20), SEL: String(10), pageStart: Integer, pageEnd: Integer, searchText: String, type: String)                                                                             returns array of ds.compreq_new;
    function generate_timeseriesH(LOCATION_ID: String(4), PRODUCT_ID: String(40))                                                                                                                                                                                                                                                        returns String;
    function generate_timeseries(LOCATION_ID: String(4), PRODUCT_ID: String(40), DAILY: String(1))                                                                                                                                                                                                                                       returns String;
    // Generate Timeseries
    // function generate_timeseriesF(LocProdData : String)
    function generate_timeseriesF(LOCATION_ID: String(4), PRODUCT_ID: String(40))                                                                                                                                                                                                                                                        returns String; // Local                                                                                                                                                                                                                        returns String;

    //Products Info
    function getAllProductsList()                                                                                                                                                                                                                                                                                                        returns array of ds.prodList;
    function getAllLocProd()                                                                                                                                                                                                                                                                                                             returns array of ds.alllocProd;
    function maintainPartialProd(FLAG: String(1), LOCATION_ID: String(4), PRODUCT_ID: String(40), PROD_DESC: String(40), REF_PRODID: String(40))                                                                                                                                                                                         returns String;
    function maintainPartialProdChar(FLAG: String(1), PRODCHAR: String)                                                                                                                                                                                                                                                                  returns String;
    function maintainNewProd(FLAG: String(1), LOCATION_ID: String(4), PRODUCT_ID: String(40), REF_PRODID: String(40))                                                                                                                                                                                                                    returns String;
    function maintainNewProdChar(FLAG: String(1), PRODCHAR: String)                                                                                                                                                                                                                                                                      returns String;
    function getLocProdChar(LOCATION_ID: String(4), PRODUCT_ID: String(40))                                                                                                                                                                                                                                                              returns array of ds.locProdChars;
    function getMultiLocProdChar(PRODUCT_ID: String, CHAR: String, CHARVAL: String)                                                                                                                                                                                                                                                      returns array of ds.locProdChars;
    function gen_UniqueID(LOCATION_ID: String(4), PRODUCT_ID: String(40))                                                                                                                                                                                                                                                                returns String;
    function changeUnique(UNIQUE_ID: Integer, PRODUCT_ID: String(40), UID_TYPE: String(1), UNIQUE_DESC: String(50), ACTIVE: String(1), FLAG: String, EX_IDENTIFICATION: String, VALID_FROM: Date, VALID_TO: Date, IS_PLANNING: Boolean)                                                                                                  returns String;
    function maintainUniqueChar(FLAG: String(1), UNIQUECHAR: String)                                                                                                                                                                                                                                                                     returns String;
    function generateUniqueIds()                                                                                                                                                                                                                                                                                                         returns String;
    function getSecondaryChar(FLAG: String(1), PRODUCT_ID: String(40))                                                                                                                                                                                                                                                                   returns array of getPriSecChar;
    function getCharGroupWeightage(PRODUCT_ID: String(40))                                                                                                                                                                                                                                                                               returns LargeString;
    function getCharLevelData(PRODUCT_ID: String(40))                                                                                                                                                                                                                                                                               returns LargeString;
    function changeToPrimary(PRODUCT_ID: String(40), CHAR_NUM: String(10), CHAR_TYPE: String(1), SEQUENCE: Integer, FLAG: String(1), GROUP_NAME: String)                                                                                                                                                                                 returns String;
    function changeToPrimaryNewMulti(CharData: LargeString)                                                                                                                                                                                                                                                                              returns String;
    function changeToPrimaryIBP(PRODUCT_ID: String(40), CHAR_NUM: String(10), CHAR_TYPE: String(1), SEQUENCE: Integer, FLAG: String(1))                                                                                                                                                                                                  returns String;
    function changeToPrimaryIBPMulti(CharData: LargeString)                                                                                                                                                                                                                                                                              returns String;
    function getPrimaryCharIBP(FLAG: String(1), PRODUCT_ID: String(40))                                                                                                                                                                                                                                                                  returns array of getIBPPriSecChar;
    function changeToSecondary(ProdData: LargeString)                                                                                                                                                                                                                                                                                    returns String;
    function genVariantStruc(CHAR_NUM: String(10), CHAR_NAME: String(30))                                                                                                                                                                                                                                                                returns String;
    function userInfo()                                                                                                                                                                                                                                                                                                                  returns String; // using req.user approach (user attribute - of class cds.User - from the request object)
    function userInfoUAA()                                                                                                                                                                                                                                                                                                               returns String; // usi
    function maintainUserPreferences(FLAG: String(1), PREFERENCEDATA: String)                                                                                                                                                                                                                                                            returns {
    msg   : String;
    error : Boolean;
};
    function getTimeZones()                                                                                                                                                                                                                                                                                                              returns String;
    function deleteLine(Lines: String)                                                                                                                                                                                                                                                                                                   returns String;
    function maintainRestrHdr(LOCATION_ID: String(4), LINE_ID: String(40), RESTRICTION: String(30), RTR_DESC: String(30), RTR_QTY: Integer, VALID_FROM: Date, VALID_TO: Date, Flag: String(1), User: String)                                                                                                                             returns String;
    function maintainRestrDet(FLAG: String(1), RTRCHAR: String)                                                                                                                                                                                                                                                                          returns String;
    function maintainRestrDetail(FLAG: String(1), RTRCHAR: String, User: String)                                                                                                                                                                                                                                                         returns String;
    function getRestrLikelihood(LOCATION_ID: String(4), VERSION: String(10), SCENARIO: String(32), FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20))                                                                                                                                                                              returns array of ds.restrreq;
    function getSeedOrder(LOCATION_ID: String(4), PRODUCT_ID: String(40), UNIQUE_ID: Integer, FROMDATE: Date, TODATE: Date)                                                                                                                                                                                                              returns array of ds.seedorddata;
    function maintainSeedOrder(FLAG: String(1), SEEDDATA: String)                                                                                                                                                                                                                                                                        returns String;
    // Seed Order Error Logs //
    function getSeedOrderErrorLog(FROMDATE: Date, TODATE: Date)                                                                                                                                                                                                                                                                          returns array of ds.seedordErrorLog;
    function genSeedorderErrorlog(SEEDDATA: String)                                                                                                                                                                                                                                                                                      returns String;
    function getUniqIdData(SEEDDATA: String)                                                                                                                                                                                                                                                                                             returns String;
    function postParameterValues(FLAG: String(1), PARAMVALS: String)                                                                                                                                                                                                                                                                     returns String;
    function updateGlobaPlanningConfig(PARAMVALUES: String, Flag: String(1))                                                                                                                                                                                                                                                             returns String;
    function getGlobalPlanningConfig()                                                                                                                                                                                                                                                                                                   returns String;
    function getCIRWeekly(LOCATION_ID: String(4), PLANNING_LOC: String, PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32), FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20))                                                                                                                                      returns array of ds.cirWkly;
    function getForecastCIRWeekly(LOCATION_ID: String(4), PLANNING_LOC: String, PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32), FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20), UNIQUE_ID: String)                                                                                                           returns array of ds.ForecastCIRWkly;
    function getForeCastDemand(LOCATION_ID: String, PRODUCT_ID: String(40), FROM_DATE: String, TO_DATE: String)                                                                                                                                                                                                                          returns array of ds.forecastDemand;
    function getUniqueIdItems(UNIQUE_ID: Integer)                                                                                                                                                                                                                                                                                        returns array of ds.uniqueCharItems;
    // Publish CIR data to ECC
    function postCIRQuantities(LOCATION_ID: String(4), PLANNING_LOC: String, PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32), FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20), VALIDUSER: String(12), USER_ID: String(100))                                                                                    returns String;
    function modifyCIRFirmQuantities(FLAG: String(1), CIR_QUANTITIES: String)                                                                                                                                                                                                                                                            returns String;
    function generateDynamicFrozenFirmHorizon()                                                                                                                                                                                                                                                                                          returns String;
    function getCFAuthToken()                                                                                                                                                                                                                                                                                                            returns String;
    function getCFDestinationUser(TOKEN: String)                                                                                                                                                                                                                                                                                         returns String;
    // Get Partial Products & Locations
    function getPartialProdLoc()                                                                                                                                                                                                                                                                                                         returns array of ds.partialProdLoc;
    function genAssemblyreq(LOCATION_ID: String(4), PRODUCT_ID: String(40))                                                                                                                                                                                                                                                              returns String;
    function getProductpidChars(LOCATION_ID: String(4), PRODUCT_ID: String(40), PAST_WEEKS: Integer, FUTURE_WEEKS: Integer)                                                                                                                                                                                                              returns LargeString;
    //VC Planner Documentation Maintenance- Pradeep
    function moveData(Flag: String, CONTENT: String, PAGEID: Integer, DESCRIPTION: String)                                                                                                                                                                                                                                               returns String;
    function addPAGEHEADER(Flag1: String, PAGEID: Integer, DESCRIPTION: String, PARENTNODEID: Integer, HEIRARCHYLEVEL: Integer)                                                                                                                                                                                                          returns String;
    function addPAGEPARAGRAPH(Flag1: String, PAGEID: Integer, DESCRIPTION: String, CONTENT: String)                                                                                                                                                                                                                                      returns String;
    function deletePAGEHEADER(Flag1: String, PAGEID: Integer)                                                                                                                                                                                                                                                                            returns String;
    function deletePAGEPARAGRAPH(Flag1: String, PAGEID: Integer)                                                                                                                                                                                                                                                                         returns String;
    function editPAGEHEADER(Flag1: String, PAGEID: Integer, DESCRIPTION: String, PARENTNODEID: Integer, HEIRARCHYLEVEL: Integer)                                                                                                                                                                                                         returns String;
    function editPAGEPARAGRAPH(Flag1: String, PAGEID: Integer, DESCRIPTION: String, CONTENT: String)                                                                                                                                                                                                                                     returns String;
    //End of VC Planner Documentation Maintenance- Pradeep
    function removeNPIChar(PROJECT_ID: String(40), REF_PRODID: String(40), CHAR_VALUE: String(70), REF_CHAR_VALUE: String(70))                                                                                                                                                                                                           returns String;
    function removeNPIUID(PROJECT_ID: String(40), PRODUCT_ID: String(40), TMP_UNIQUE_ID: String(10), REF_UNIQUE_ID: Integer)                                                                                                                                                                                                             returns String;
    function tmpuniqueid(PROJECT_ID: String(40), PRODUCT_ID: String, FLAG: String(1))                                                                                                                                                                                                                                                    returns array of ds.tmpuid;
    // To save the Temporary Unique IDs.
    function genTmpUniqueID(HeadData: String, ItemData: String, Flag: String(1))                                                                                                                                                                                                                                                         returns String;
    function getTMPGenCount(PROJECT_ID: String(40))                                                                                                                                                                                                                                                                                      returns String;
    function getCopyUID(PROJECT_ID: String(40))                                                                                                                                                                                                                                                                                          returns String;
    //Start of Create Variant- Pradeep
    function createVariant(Flag: String, USER: String, VARDATA: String)                                                                                                                                                                                                                                                                  returns array of getVariantHeader;
    function updateVariant(VARDATA: String)                                                                                                                                                                                                                                                                                              returns String;
    //End of Create Variant- Pradeep
    //Start of Factory-Product description - Pradeep
    function createProductBatch(Flag: String, PRODATA: LargeString)                                                                                                                                                                                                                                                                      returns String;
    function createLineBatch(PRODATA: String, User: String)                                                                                                                                                                                                                                                                              returns String;
    function createLineMasterBatch(PRODATA: String, Flag: String, User: String)                                                                                                                                                                                                                                                          returns String;
    function createPartialLineBatch(Flag: String, PRODATA: String, User: String)                                                                                                                                                                                                                                                         returns String;
    //End of Factory-Product description- Pradeep
    function createVerScen(VERDATA: String)                                                                                                                                                                                                                                                                                              returns String;
    //*****/ Critical Comp /*****/
    // entity getCriticalComp        as projection on V_BOMCRITICALCOMP; //od.CRITICAL_COMP;
    function changeToCritical(criticalComp: String)                                                                                                                                                                                                                                                                                      returns String;
    function getCriticalComp(FLAG: String(1), LOCATION_ID: String(4), PRODUCT_ID: String(40))                                                                                                                                                                                                                                            returns array of ds.assemblycompdata;
    //*****/ Factory Location/*****/
    // Get Unique Characteristics
    function getUniqueChars(UNIQUE_ID: Integer, PRODUCT_ID: String(40), LOCATION_ID: String(4))                                                                                                                                                                                                                                          returns array of ds.uniqueCharacteristics;
    function getProdPredCheck()                                                                                                                                                                                                                                                                                                          returns array of ds.prodpredictchk;
    // Get Component Capacity Weekly
    function getCompCapacityWeekly(LOCATION_ID: String(4), FROMDATE: Date, TODATE: Date)                                                                                                                                                                                                                                                 returns array of ds.compCapacityWeekly;
    // Maintain Component Capacity
    function maintainCompCapacity(COMP_CAPACITY: String)                                                                                                                                                                                                                                                                                 returns String;
    function getAssemblyUID(LOCATION_ID: String(4), COMPONENT: String(40), WEEK_DATE: Date, VERSION: String(10), SCENARIO: String(32))                                                                                                                                                                                                   returns array of ds.asmblyProdUID;
    function getAssemblyUIDNEW(LOCATION_ID: String(4), COMPONENT: String(40), WEEK_DATE: Date, VERSION: String(10), SCENARIO: String(32))                                                                                                                                                                                                returns array of ds.asmblyProdUID;
    function getComponentUID(LOCATION_ID: String(4), PRODUCT_ID: String(40), ASSEMBLY: String(40), WEEK_DATE: Date, VERSION: String(10), SCENARIO: String(32))                                                                                                                                                                           returns array of ds.CompProdUID;
    // Change Unique Description
    function changeUniqueIdDesc(UNIQUE_ID: Integer, LOCATION_ID: String(4), PRODUCT_ID: String(40), UNIQUE_DESC: String(50))                                                                                                                                                                                                             returns String;
    /*Restriction Availability*/
    function getRestrictionAvailability(LOCATION_ID: String(4), LINE_ID: String(40), FROMDATE: Date, TODATE: Date)                                                                                                                                                                                                                       returns array of ds.restrictionCapacityWeekly;
    // Maintain Restriction Capacity
    function maintainRestrictionCapacity(RES_CAPACITY: String)                                                                                                                                                                                                                                                                           returns String;
    function getRestrictionProdQty(WEEK_DATE: Date, LOCATION_ID: String(4), LINE_ID: String(40), RESTRICTION: String(30), VERSION: String(10), SCENARIO: String(32), MODEL_VERSION: String(20))                                                                                                                                          returns array of ds.restrprodqty;
    function getRestrictionUID(WEEK_DATE: Date, PRODUCT_ID: String(40), LOCATION_ID: String(4), RESTRICTION: String(30), VERSION: String(10), SCENARIO: String(32), MODEL_VERSION: String(20), RULE_TYPE: String(2))                                                                                                                     returns String;
    //function for UniqueCharacterists Json comparison
    function getUniqueData(vcRulesList: String)                                                                                                                                                                                                                                                                                          returns String;



    function saveProjDetails(NEWPROJDET: String, FLAG: String(1))                                                                                                                                                                                                                                                                        returns String;

    // Get User Info
    @requires: 'authenticated-user'
    function getUserInfo()                                                                                                                                                                                                                                                                                                               returns String;

    function getUserVariant()                                                                                                                                                                                                                                                                                                            returns String;
    function dragDrop(ParentNodeId: Integer, ParentHeirarchy: Integer, ChildNodeId: Integer)                                                                                                                                                                                                                                             returns String;
    function createHeaderProfiles(Flag: String(2), PROFILE: String(50), METHOD: String(50), PRF_DESC: String(200))                                                                                                                                                                                                                       returns String;
    function createParamProfiles(Flag: String(2), VARDATA: String)                                                                                                                                                                                                                                                                       returns String;
    //End of Create AUTOML Profiles -Pradeep

    function DeleteLineBatch(PRODATA: String)                                                                                                                                                                                                                                                                                            returns String;
    //start of Assembly Component delete
    function deleteAssmbComp(Flag: String, PRODATA: String)                                                                                                                                                                                                                                                                              returns String;
    //end of Assembly Component delete

    function getAsmCompWhereUsed(LOCATION_ID: String(4), PRODUCT_ID: String(40), ASSEMBLY: String(40), COMPONENT: String(40))                                                                                                                                                                                                            returns array of ds.asmCompWhrUsd;
    function getCharPlan()                                                                                                                                                                                                                                                                                                               returns String;
    function purgeTimeseriesModelsPredictions(PRODUCT_ID: String(40))                                                                                                                                                                                                                                                                    returns String;
    function getProductCharVal(Flag: String, PRODATA: String)                                                                                                                                                                                                                                                                            returns LargeString; //returns array of getProdClsChar;
    function getProdClasCharVal(PRODUCT_ID: String(40))                                                                                                                                                                                                                                                                                  returns String;

    //SnapShot
    // function maintainSnapShotLevels(SNAPSHOT_DESC : String, Mode : String(1), FROM_DATE : String(10), TO_DATE : String(10), VERSION : String)                                                                                                                                                                                                              returns {
    //     Type : String(15);
    //     Description : String;
    // };
    function maintainSnapShotLevels(SnapData: String)                                                                                                                                                                                                                                                                                    returns {
        Type        : String(15);
        Description : String;
    };

    function getHandsontableKey()                                                                                                                                                                                                                                                                                                        returns String;

    function maintainSnapShot(SNAPSHOT_DESC: String, Mode: String(1), FROM_DATE: String(10), TO_DATE: String(10), VERSION: String)                                                                                                                                                                                                       returns {
        Type        : String(15);
        Description : String;
    };

    function testing()                                                                                                                                                                                                                                                                                                                   returns String;
    function postCharOptionPercent(CHAROPTPERCENT: String)                                                                                                                                                                                                                                                                               returns String;
    function genUserAppVisibility(FLAG: String, USERDATA: String)                                                                                                                                                                                                                                                                        returns array of getUserAppVisibility;
    function getCFUsers()                                                                                                                                                                                                                                                                                                                returns array of ds.CFUsers;
    function getCleanupOldData(LOCATION_ID: String(4), PRODUCT_ID: String(40), FROMDATE: Date, TODATE: Date)                                                                                                                                                                                                                             returns String;
    function getLOCPRODCHAR(FLAG: String, LOCPRODCHAR: String)                                                                                                                                                                                                                                                                           returns String;
    function getLocProdSalesH(Flag: String, PRODUCT_ID: String(40))                                                                                                                                                                                                                                                                      returns array of getSalesh;
    function getOptPercentage()                                                                                                                                                                                                                                                                                                          returns String;
    function modifyCharValBucket(Flag: String(1), charValData: String)                                                                                                                                                                                                                                                                   returns String;
    function saveOptionPercentData(optData: String)                                                                                                                                                                                                                                                                                      returns String;
    function saveIBPOptionData(optData: String)                                                                                                                                                                                                                                                                                          returns String;
    // NPI - Save New Characteristic Value Details
    function saveNPICharValDetails(NEWCHARVALUEDATA: String)                                                                                                                                                                                                                                                                             returns String;
    //NPI- Save PhaseOut Characteristic Value Details
    function savePhaseOutCharValDetails(PHASEOUTDATA: String)                                                                                                                                                                                                                                                                            returns String;

    function saveKeyFigMasterData(keyFigData: String)                                                                                                                                                                                                                                                                                    returns String;

    function modifyVersionScenario(VS_DATA: String, FLAG: String)                                                                                                                                                                                                                                                                        returns String;
    function getUniqueIdData(UNIQUE_ID: Integer)                                                                                                                                                                                                                                                                                         returns String;
    function getObjDepData(OBJ_DEP: String(30))                                                                                                                                                                                                                                                                                          returns String;
    function dummyFunctionForTesting()                                                                                                                                                                                                                                                                                                   returns String;

    function getUniqueIds(PRODUCT_ID: String(40), UID_TYPE: String(1))                                                                                                                                                                                                                                                                   returns String;
    function getUniqueIdsNewFun(PRODUCT_ID: String(40), UID_TYPE: String(1))                                                                                                                                                                                                                                                             returns String;
    function getSalesCustgroup(PRODUCT_ID: String(40))                                                                                                                                                                                                                                                                                   returns String;
    function getUniqueIdsSelected(PRODUCT_ID: String(40), UID_TYPE: String(1))                                                                                                                                                                                                                                                           returns String;
    function getProdClassNew()                                                                                                                                                                                                                                                                                                           returns String;
    function funcCharValBucket()                                                                                                                                                                                                                                                                                                         returns String;
    function getPartialProdbyLocation(LOCATION_ID: String, Flag: String(1))                                                                                                                                                                                                                                                              returns String;
    // function getUniqueIdItemsNew(PRODUCT_ID: String(100), UNIQUE_ID: Integer)                                                                                                                                                                                                                                                            returns String;
    function getUniqueIdItemsNew( UNIQUE_ID: Integer)                                                                                                                                                                                                                                                            returns String;
    function modifyCustomerGroup(Flag: String(1), customerGroupData: String)                                                                                                                                                                                                                                                             returns String;
    // Function to save Location product and Profiles
    function maintainLocProdProfile(LocProdData: LargeString)                                                                                                                                                                                                                                                                            returns String;
    function maintainlocprodpid(locPid: LargeString, DelData: LargeString)                                                                                                                                                                                                                                                               returns String;
    function maintainOptThreshold(LocProdData: String, FLAG: String(1))                                                                                                                                                                                                                                                                  returns String;
    function deletePlanningNoteComments(dltCmt: String)                                                                                                                                                                                                                                                                                  returns String;
    function getClusterPRPid(LOCATION_ID: String(4), PRODUCT_ID: String(40))                                                                                                                                                                                                                                                             returns LargeString;
    function getSalesHConfigDetails(SALES_DOC: String(10), SALESDOC_ITEM: String(10))                                                                                                                                                                                                                                                    returns LargeString;
    function getTSData(TSDATA: String)                                                                                                                                                                                                                                                                                                   returns LargeString;
    function genPeriodProfile(ProfileData: LargeString, FLAG: String(1))                                                                                                                                                                                                                                                                 returns String;

    //function to retrieve week_dates from V_CIR_QTY_VARDESC
    function getWeekDatesCIR(WEEKDATE: LargeString)                                                                                                                                                                                                                                                                                      returns String;

    function maintainOptimizations(OPTM: String, FLAG: String(1))                                                                                                                                                                                                                                                                        returns String;

    function maintainColorCodeChars(CCR: String, FLAG: String(1))                                                                                                                                                                                                                                                                        returns String;

    function getClusterPIDChars(PRIMARY_ID: Integer, PRODUCT_ID: String(40), LOCATION_ID: String(4))                                                                                                                                                                                                                                     returns array of ds.PIDuniqueCharacteristics;
    function getConfigProd()                                                                                                                                                                                                                                                                                                             returns LargeString;

    function genPartialProdNew()                                                                                                                                                                                                                                                                                                         returns LargeString;
    function getfactorylocdescNew()                                                                                                                                                                                                                                                                                                      returns LargeString;

    //Production order consumption
    function getProdOrdFilters()                                                                                                                                                                                                                                                                                                         returns array of {
        LOCATION_ID   : String;
        LOCATION_DESC : String;
        REF_PRODID    : String;
        PROD_DESC     : String;
        COMPONENT     : String;
        UNIQUE_ID     : String
    };

    function getSalesDocItems(LOCATION_ID: String, PRODUCT_ID: String, UNIQUE_ID: LargeString, COMPONENT: LargeString)                                                                                                                                                                                                                   returns LargeString;
    function getForecastCIRTel(LOCATION_ID: String, PLANNING_LOC: String, PRODUCT_ID: String, VERSION: String, SCENARIO: String, FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20), UNIQUE_ID: String, weekType: String)                                                                                            returns String;
    function getcharAnalysis(FROM_DATE: Date, TO_DATE: Date,LOCATION_ID: String(4),  PRODUCT_ID: String(40))                                                                                                                                                                                                                                                                             returns LargeString;
    function getForecastCharAnalysis(FROM_DATE: Date, TO_DATE: Date, LOCATION_ID: String(4),  PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32), MODEL_VERSION: String(10))                                                                                                                                      returns LargeString;

    function GenerateDataClassfication(LOCATION_ID: String, PRODUCT_ID: String, PROFILE_NAME: String)                                                                                                                                                                                                                                    returns String;

    function getPlannedOrderData(CHAR_DATA: String,
                                 LOCATION_ID: String(4),
                                 PRODUCT_ID: String(100),
                                 CONFIG_PROD: String(100),
                                 MODEL_VERSION: String,
                                 START_DATE: String,
                                 END_DATE: String,
                                 UNIQUE_ID: String)                                                                                                                                                                                                                                                                                      returns String;

    function getClusterFilter(loc: String, cProd: String, prod: String, year: String)                                                                                                                                                                                                                                                    returns String;
    function getClusterYear(loc: String, cProd: String, prod: String)                                                                                                                                                                                                                                                                    returns String;
    function getClusterHeatmapFun(loc: String, cProd: String, prod: String, year: String, clusterId: String, charDesc: String, primaryId: String)                                                                                                                                                                                        returns String;
    
    function getObjectDepByAssembly(manLoc: String, Asem: String)    returns String;
    function importRoles(ROLES: LargeString,USER : String(100)) returns String;
   function downloadRoles(ROLES : LargeString) returns {
        fileName: String;
        data: String;  
    };
    function uploadRoles(ROLES : LargeString,USER : String(100)) returns String;
    function deleteAssignedRoles(ROLES: String) returns String;
    //get url for chatbot
    function getChatbotUrl() returns String;
    //Url for saving app name
    function createAppDetails(APPDATA: String) returns String;
    //
    /**
 * Actions
 */

    // Generate Timeseries
    action   generateTimeseries(LocProdData: String);
    action   generateTimeseriesCust(LocProdData: String);
    // Generate Timeseries
    action   generateTimeseriesF(LocProdData: String);
    // Generate Unique

    action   genUniqueID(LOCATION_ID: String(4), PRODUCT_ID: String(40));
    action   initialProcess(LocProdWeeksData: String);
    action   initialProcessWorker(LocProdWeeksData: String);
    function initial_Process(LOCATION_ID: String(4), PRODUCT_ID: String(40), HISTORY_WEEKS: String(3))                                                                                                                                                                                                                                   returns String;
    // Generate Fully Configured Demand
    action   genFullConfigDemand(LocProdData: String); // (LOCATION_ID : String(4), PRODUCT_ID : String(40)) ;

    /// /*****/ Market Authorizations /*****/
    action   trigrMAWeek();
    action   generateMarketAuth(MARKETDATA: String);


    /// Snapshot //////
    action   maintainSnapShotjob(SnapData: String);
    // function maintainSnapShotjob(SnapData :String) returns String;
    ///*****/ Seed Order Creation /*****/
    // entity getSeedOrder           as projection on od.SEEDORDER_HEADER;
    // Seed Order Error Logs //

    action   jobSeedOrder(FLAG: String(1), SEEDDATA: String); //Action for Seed Order Job

    //TO get Demand Quantity for weeks in forecast order
    action   postCIRQuantitiesToS4(LOCATION_ID: String(4), PLANNING_LOC: String, PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32), FROMDATE: Date, TODATE: Date, MODEL_VERSION: String(20), VALIDUSER: String(12), USER_ID: String(100), FORECAST_SNAPTIME: String);
    function   postCIRQuantitiesToS4API(LOCATION_ID: String(4), PRODUCT_ID: String(40), FROMDATE: Date, TODATE: Date) returns LargeString;
    action   genDynamicFrozenFirmHorizon();
    ///*****/ Assembly Requirements /*****/
    action   generateAssemblyReq(LOCATION_ID: String(4), PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32));
    action   generateAssemblyReqRest(LOCATION_ID: String(4), PRODUCT_ID: String(40), VERSION: String(10), SCENARIO: String(32));

    // Action Call to generate Temporary Unique IDS.
    action   generateTempUID(PROJECT_ID: String(40), PRODUCT_ID: String, PROJ_ACTIVE: String(1))                                                                                                                                                                                                                                         returns String;
    // function   generateTempUID(PROJECT_ID : String(40), PRODUCT_ID : String, PROJ_ACTIVE: String(1))                                                                                                                                                                                                       returns String;


    // // Saved Configuration API
    // action generateUniqueId(vcRulesList : array of ds.UniqueIdDetails);
    
    action   uploadUniqueId(sequence_ID: String)                                                                                                                                                                                                                                                                                         returns ds.uniqueIdResponse;
    action   generateSeedOrders(LOCATION_ID: String(4), PRODUCT_ID: String(40), CUSTOMER_GROUP: String(20), FROMDATE: Date, TODATE: Date, CHARDATA: String, CHAROPTFLAG: String(1))                                                                                                                                                      returns String;
    action   deleteLocProdData(LocProdDate: String)                                                                                                                                                                                                                                                                                      returns String;
    action   genBOMUIDMapping(LocProdData: String);
    // Action call to save Plan, factory, demand Locations and respective Product combinations for network maintenance tab
    action   genProductBatch(LocProdData: String);
    //function to get Object Dependencies for Multi Level BOM application
    function getBOMMultiObjDep(OBJ_DEP: String)                                                                                                                                                                                                                                                                                          returns String;
    function getBOMLocProdNode()                                                                                                                                                                                                                                                                                                         returns String;
    function getSalesData()                                                                                                                                                                                                                                                                                                              returns String;
    function updateCharConfig(CHARDATA: String)                                                                                                                                                                                                                                                                                          returns String;
    function getUniqueIDsNew(PRODUCT_ID: String(40))                                                                                                                                                                                                                                                                                     returns LargeString;
    function InsertIntoTempSO(SODATA: LargeString)                                                                                                                                                                                                                                                                                       returns String;
    //function for Time Series History and Future
    function getTimeSeriesData(Skip: Integer, TopCount: Integer, TSDATA: String)                                                                                                                                                                                                                                                         returns LargeString;
    function saveProductDemandData(demData: String)                                                                                                                                                                                                                                                                                      returns String;

    action   salesDeltaProcess(SALESDATA: String)                                                                                                                                                                                                                                                                                        returns String;
    action   salesDeltaProcessBatch(SALESDATA: String)                                                                                                                                                                                                                                                                                        returns String;
    // function salesNewProcess() returns String;
    action salesNewProcess() ;
    action   salesOrderCreation(SALESDATANEW: LargeString);
    action   generateOptionPercentage(LOCATION_ID: String(4), PRODUCT_ID: String, FROM_DATE: String(10), TO_DATE: String(10), MODEL_VERSION: String(20), VERSION: String(10), SCENARIO: String(32));
   
    action   generateOptionPercentagenew(LOCATION_ID: String(4), PRODUCT_ID: String, FROM_DATE: String(10), TO_DATE: String(10), MODEL_VERSION: String(20), VERSION: String(10), SCENARIO: String(32));
    
    function getPlannedOptionPercentage(LOCATION_ID: String(4), PRODUCT_ID: String, FROM_DATE: Date, TO_DATE: Date, MODEL_VERSION: String(20), VERSION: String(10), SCENARIO: String(32))                                                                                                                                                returns String;
   
   function getPlannedOptionPercentagenew(LOCATION_ID: String(4), PRODUCT_ID: String, FROM_DATE: Date, TO_DATE: Date, MODEL_VERSION: String(20), VERSION: String(10), SCENARIO: String(32))                                                                                                                                                returns String;
    function getStaticToDerivedData(LOCATION_ID: String(4),
                                         PRODUCT_ID: String(40),
                                         FROM_DATE: Date,
                                         TO_DATE: Date,
                                         MODEL_VERSION: String(20),
                                         VERSION: String(10),
                                         SCENARIO: String(32)) returns LargeString; 
    // Delta Changes - Demand and Option Percentage from Stat Forecast
    action   updateOptionQuantities(LocProdData: String);
    //Function for getting characteristics data for partial prod
    function getPartialProdChars(ProdLocData: String)                                                                                                                                                                                                                                                                                    returns LargeString;
    // Function to delete Option Percentage Data
    function deleteOptionPerData(dData: String)                                                                                                                                                                                                                                                                                          returns String;

    function genRtrHeaderData()                                                                                                                                                                                                                                                                                                          returns LargeString;
    function getprodclassData(LOCATION_ID: String(4), LINE_ID: String(40), RESTRICTION: String(30))                                                                                                                                                                                                                                      returns String;
    action   productData(PRODUCTDATA: LargeString)                                                                                                                                                                                                                                                                                       returns String;
    //Function for column view CV_PIDS_CLUSTERED_DEMAND
    function getClusters(data: String)                                                                                                                                                                                                                                                                                                   returns String;
    function getUniqueIdWithCharVal(PRODUCT_ID: String, data: String) returns String;
   
    action   generateteleperiods();

    function getTelescopicValues()                                                                                                                                                                                                                                                                                                       returns String;
    //Function to update/save calender weeks from app
    action updateCalenderWeek(CalendarData: LargeString)                                                                                                                                                                                                                                                                               returns String;
    //Function to fetch alert token
    function getAlertToken()                                                                                                                                                                                                                                                                                                             returns String;
    function maintainMappings(mappingData: LargeString)                                                                                                                                                                                                                                                                                       returns String;
    function DeleteMappings(ENTITY_KEY:String(100), PLANNING_AREA:String(50))                                                                                                                                                                                                                                                                                       returns String;
    function getAlertLocProd()                                                                                                                                                                                                                                                                                                           returns String;
    //Custom Controls
    function getControl(Type : String(50)) returns String;
    function getCharacteristicUniques(UNIQUEDATA: LargeString) returns LargeString;

    action   maintainProdOrdConsumption(PRDORDDATA: LargeString) returns String;

    action   approveProductData(PRODUCTDATA: LargeString)    returns String;
    //Derived Characteristics rules generation after sequence updation
    function generateRuleEngine(PRODUCT_ID : String,PROD_DESC:String) returns String;
    function simulateDerivedValues(LOCATION_ID: String(4),PRODUCT_ID : String,VERSION:String(10),SCENARIO:String(32),MODEL_VERSION:String(20),WEEK:String,Data:String) returns String;
    function generateNodes(PRODUCT_ID : String) returns String;
    function postPIRData(LOCATION_ID: String(4), ASSEMBLY: String, FROM_DATE: String(10), TO_DATE: String(10))         returns LargeString;
}


annotate CatalogService.getUIDRulesValidity with @Aggregation.ApplySupported: {
    GroupableProperties : [
        UNIQUE_ID,
        DEP_NAME,
        VALID_FROM,
        VALID_TO
    ],
    PropertyRestrictions: true,
    Transformations     : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

//Annotations for Optimized Predictions
annotate CatalogService.getOptimizedPred with {
    LOCATION_ID   @Analytics.Dimension: true;
    PRODUCT_ID    @Analytics.Dimension: true;
    MODEL_VERSION @Analytics.Dimension: true;
    VERSION       @Analytics.Dimension: true;
    SCENARIO      @Analytics.Dimension: true;
    ALGORITHM     @Analytics.Dimension: true;
    CHAR_NUM      @Analytics.Dimension: true;
    CHARVAL_NUM   @Analytics.Dimension: true;
    CAL_DATE      @Analytics.Dimension: true;
};

annotate CatalogService.getOptimizedPred with @Aggregation.ApplySupported: {
    GroupableProperties : [
        LOCATION_ID,
        PRODUCT_ID,
        MODEL_VERSION,
        VERSION,
        SCENARIO,
        ALGORITHM,
        CHAR_NUM,
        CHARVAL_NUM,
        CAL_DATE
    ],
    PropertyRestrictions: true,
    Transformations     : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

//Annotations for version scenario maintenance
annotate CatalogService.getIbpVerScn with {
    VERSION       @Analytics.Dimension: true;
    SCENARIO      @Analytics.Dimension: true;
    VERSION_NAME  @Analytics.Dimension: true;
    SCENARIO_NAME @Analytics.Dimension: true;
}

annotate CatalogService.getIbpVerScn with @Aggregation.ApplySupported: {
    GroupableProperties : [
        VERSION,
        SCENARIO,
        VERSION_NAME,
        SCENARIO_NAME
    ],
    PropertyRestrictions: true,
    Transformations     : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};


//Annotations for getMasterLocTemp
annotate CatalogService.getLocationtemp with {
    LOCATION_ID    @Analytics.Dimension: true;
    LOCATION_DESC  @Analytics.Dimension: true;
    LOCATION_TYPE  @Analytics.Dimension: true;
    AUTH_GROUP     @Analytics.Dimension: true;
    LATITUDE       @Analytics.Dimension: true;
    LONGITUTE      @Analytics.Dimension: true;
    RESERVE_FIELD1 @Analytics.Dimension: true;
    RESERVE_FIELD2 @Analytics.Dimension: true;
    RESERVE_FIELD3 @Analytics.Dimension: true;
    RESERVE_FIELD4 @Analytics.Dimension: true;
    RESERVE_FIELD5 @Analytics.Dimension: true;
}

annotate CatalogService.getLocationtemp with @Aggregation.ApplySupported: {
    GroupableProperties : [
        LOCATION_ID,
        LOCATION_DESC,
        LOCATION_TYPE,
        AUTH_GROUP,
        LATITUDE,
        LONGITUTE,
        RESERVE_FIELD1,
        RESERVE_FIELD2,
        RESERVE_FIELD3,
        RESERVE_FIELD4,
        RESERVE_FIELD5
    ],
    PropertyRestrictions: true,
    Transformations     : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};


// CPIDS Service
service BTPCPIService @(path: '/btpcpi') {

    //  @requires : 'authenticated-user'
    entity getLocProdCharAPI         as projection on V_PRODCONFIGAPI_UPDATED;
    entity getClassCharAPI           as projection on V_CLASSCHARVAL;
    entity getLocProdConfigAPI       as projection on V_PRODCONFIGAPI_UPDATED;
    entity getLocProdConfigAPICopy   as projection on V_PRODCONFIGAPI_COPY;
    // Prod config QTY
    entity getLocProdActDemandAPI    as projection on V_IBP_SALESHCNFG_VC_IBPCUST;
    entity getLocProdActualDemandAPI as projection on V_IBP_SALESHCNFG_VC_IBPCUST;
    // Export Master Data of Assembly to IBP
    entity getMDTAssembly            as projection on od.IBPMDT_ASSEMBLY;
    // Saved Configuration API
    action generateUniqueId(vcRulesList: array of ds.UniqueIdDetails)                                                                                                                                                                                                                                                                    returns ds.uniqueIDFnResponse;
    //saved Configuration Deactivate API
    action deactivateUniqueID(vcRulesList: array of ds.UniqueIdStatus)                                                                                                                                                                                                                                                                   returns ds.uniqueIDFnResponse;
}
