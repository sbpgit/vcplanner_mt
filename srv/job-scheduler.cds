using js from '../db/jobscheduler';
using cp_ds as ds from '../db/data-structures';
using {
   V_ACTIVITYPARAMS,
    V_JOBLISTDATA,
    V_VARIANTDATA,
    V_VARIANTDETAILS
} from '../db/jobscheduler';

service JobScheduler @(impl: './lib/job-scheduler.js', path: '/job-scheduler') {

  // action   preDefinedHistory(LocProdData : String);
  function preDefinedHistory(LOCATION_ID : String(4), PRODUCT_ID : String(40))         returns String;
  action   preDefinedFuture(LocProdData : String);
  entity getActivities           as projection on js.ACTIVITY_HEADER; //list of all Activities

  @readonly
  entity getActParameters        as projection on js.ACTIVITY_PARAMETERS; //parameters value Help

  entity getParametersByActivity as projection on V_ACTIVITYPARAMS; //Parameters for selected Activity
  entity getJobMetrics as projection on js.JOB_METRICS;

  function maintainActivity(Flag : String(1), activityData : String)                   returns String;
  function maintainParameter(Flag : String(1), parameterData : String)                 returns String;

  // Templates

  // To read templates header table
  @readonly
  entity readTemplates           as projection on js.TEMPLATE_HEADER;

// To read template items tables
  @readonly
  entity readTemplateItems       as projection on js.TEMPLATE_ACTITEM;

// To read activities
  @readonly
  entity readActivityHeader      as projection on js.ACTIVITY_HEADER;

// To read activity items
  @readonly
  entity readActivityItems       as projection on js.ACTIVITY_ITEM;

  // To read job creation data
  @readonly
  entity readJobCreationData      as projection on js.JOB_CREATIONDATA;

// To read the template activity paramater values 
  @readonly
  entity readTemplateItemsParams as projection on js.TEMPLATE_ACTITEM_PARAM;

// To read job logs
  // @readonly
  // entity readJobLogs             as projection on V_JOBLISTDATA;
  function readJobLogs()                   returns String;

// To read job log details
  @readonly
  entity readJobDetailsLogs      as projection on js.JOB_TEMPLATEDETAILS;

   @readonly
  entity getVariantData       as projection on V_VARIANTDATA;

  @readonly
  entity getVariantDetails       as projection on V_VARIANTDETAILS;

   function deleteVariant(VARIANT_NAME : String)   returns String;

  function removeTemplate(TemplateData : String)                   returns String;

  // To save the template header and template Item.
  function genTemplateDetails(FLAG : String(1), VARIANT:String(1), TEMPDATA : LargeString, PARAMDATA : LargeString) returns String;
  
  
  function genJobDetails(Flag:String, JobDATA : LargeString)                                             returns String;

  function updateJobData(ACTIVE : Boolean , JOB_ID : Integer)   returns String;
// To delete variants
  function deleteJobData(JOB_ID : Integer, JOB_NAME:String(100))   returns String;

  action genJobDetailsPOST(Flag:String, JobDATA : LargeString) returns String;
  function getAuthorization() returns String;

  function genVariantData(FLAG:String(1), VARIANT_DATA:String) returns String;
}
