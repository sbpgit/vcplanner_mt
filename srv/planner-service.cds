using cp as pd from '../db/data-model';
using {
  CV_SNAPSHOT_LAG_OPT,
  CV_SNAPSHOT_LAG_RTR,
  CV_SNAPSHOT_LAG_PROD_DMD,
  CV_SNAPSHOT_LAG_ASMB,
  V_ROLES_LOCPROD,
  V_ASSEMBLY_DESC_DISTINCT
} from '../db/data-model';

service PlannerService @(impl: './lib/planner-service.js', path: '/planner') {
  entity getOptionPercentageLag as projection on CV_SNAPSHOT_LAG_OPT;
  entity getRestrictionLag      as projection on CV_SNAPSHOT_LAG_RTR;
  entity getProductDemandLag    as projection on CV_SNAPSHOT_LAG_PROD_DMD;
  entity getAssemblyLag         as projection on CV_SNAPSHOT_LAG_ASMB;
  //To get distinct assemblies data
  entity getAssemblyData        as projection on pd.SNAPSHOT_LAG_ASMB;
  //To get distinct restriction data
  entity getRTRData             as projection on pd.SNAPSHOT_LAG_RTR;
  //To get distinct Option percent data
  entity getOptPrtData          as projection on pd.SNAPSHOT_LAG_OPT;
  //To get distinct product demand data
  entity getPrdDmdData          as projection on pd.SNAPSHOT_LAG_PROD_DMD;

  //entity for Role based filter
  entity getPlannerLocProd      as projection on V_ROLES_LOCPROD;

  //entity for distinct assembly and assembly desc
  entity getAssemblyDesc as projection on V_ASSEMBLY_DESC_DISTINCT;

  //Function for Assembly lags
  function getAssemblyLagfun(FACTORY_LOCATION: String(10), LOCATION: String(10), PRODUCT: String(40), START_MONTH: String(20), END_MONTH: String(20))                                       returns String;
  //Function for option percentage lags
  function getOptPercentLagfun(FACTORY_LOACATION: String(10), LOCATION: String(10), PRODUCT: String(40), MONTH: String(40), CHARACTERISTIC: String(100), CHARACTERISTIC_VALUE: String(100)) returns String;
  function getOptPercentLagFun(FACTORY_LOCATION: String(10), LOCATION: String(10), PRODUCT: String(40), START_MONTH: String(20), END_MONTH: String(20))                                     returns String;
  //Function for Restriction Lags
  function getRestrictionLagfun(FACTORY_LOACATION: String(10), LOCATION: String(10), LINE: String(40), RESTRICTION_ID: String(50), MONTH: String(40))                                       returns String;
  function getRestrictionLagFun(FACTORY_LOCATION: String(10), LOCATION: String(10), START_MONTH: String(20), END_MONTH: String(20))                                                         returns String;
  //Function for ProductDemand lag
  function getPrdDmdLagfun(FACTORY_LOACATION: String(10), LOCATION: String(10), MONTH: String(40), PRODUCT: String(40))                                                                     returns String;
  //Function for Stat Forecast
  function getStatForecast(FACTORY_LOCATION: String(10), LOCATION: String(10),PRODUCT: String(40), START_MONTH: String(20), END_MONTH: String(20))  returns String;
  function getPrdDmdLagFun(FACTORY_LOCATION: String(10), LOCATION: String(10),PRODUCT: String(40), START_MONTH: String(20), END_MONTH: String(20))                                         returns String;
  function createVariantPlanner(Flag: String, USER: String, VARDATA: String)                                                                                                                returns String;
  function updateVariantPlanner(VARDATA: String)                                                                                                                                            returns String;

}
