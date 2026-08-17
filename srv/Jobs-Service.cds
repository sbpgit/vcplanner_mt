using js from '../db/jobscheduler';
using {V_JOBSTATUS,
       V_JOBRUNSTATUS,
       V_JOBRUNSTATE
 } from '../db/jobscheduler';
using cp_ds as ds from '../db/data-structures';

service JobsService @(impl : './lib/Jobs-Service.js', path: '/jobs') {
   @readonly
  entity jobs as projection on js.JOBS;

  @readonly
  entity schedules as projection on js.SCHEDULES;

  
  @readonly
  entity logs as projection on js.LOGS;

//   entity getJobStatus  as projection on V_JOBSTATUS;
  entity getJobStatus  as projection on V_JOBSTATUS;
      
  entity getJobRunStatus as projection on V_JOBRUNSTATUS; 
  entity getJobRunState as projection on V_JOBRUNSTATE; 

  @readonly
  entity getJobLogs as projection on js.JOB_LOGS;
  
  action syncJobsOneTime();

  action syncJobs(timer : Integer);
  action updateJobs();
  action purgeJobLogs() returns String;

  // KLUDGE function API for Alternate to POST updateJobs()
  function fsyncJobsOneTime() returns String;
  function fsyncJobs(timer : Integer) returns String;

  function fUpdateJobs() returns String;

  function fpurgeJobLogs() returns String;

  action purgeJobLogsNew() returns String;

// LOCAL API's for UI purpose
  function lreadJobs() returns String;
  function lreadJobDetails(jobId : Integer, displaySchedules: Boolean) returns String;
  function lreadJobSchedules(jobId : Integer) returns String;
  function lreadJobSchedule(jobId : Integer, scheduleId : String, displayLogs: Boolean) returns String;
  function lreadJobActionLogs(jobId : Integer) returns String;
  function lreadJobRunLogs(jobId : Integer, scheduleId : String, page_size : Integer, offset : Integer) returns String;
  function laddMLJob(jobDetails : String) returns String;
  function laddIBPBTPJob(jobDetails : String) returns String;
  function lupdateJob(jobDetails : String) returns String;
  function ldeleteJob(jobId : Integer) returns String;
  function laddJobSchedule(schedule : String) returns String;
  function ldeleteMLJobSchedule(scheduleDetails : String) returns String;
  function lupdateMLJobSchedule(schedule : String) returns String;



    // GET API's job-scheduler
  function readJobs() returns array of js.Jobs;
  function readJobDetails(jobId : Integer, displaySchedules: Boolean) returns  js.JobDetailsResult;
  function readJobSchedules(jobId : Integer) returns array of js.Schedules;
  function readJobSchedule(jobId : Integer, scheduleId : String, displayLogs: Boolean) returns String;

  function readJobActionLogs(jobId : Integer) returns String; // array of js.ActionLogs;
  function readJobRunLogs(jobId : Integer, scheduleId : String, page_size : Integer, offset : Integer) returns array of js.RunLogs;
  
  // KLUDGE function API's for Alternate to POST
  function addMLJob(jobDetails : String) returns Integer;
  function updateMLJob(jobDetails : String) returns String;
  function deleteMLJob(jobId : Integer) returns String;
  function addJobSchedule(schedule : String) returns String;
  function deleteMLJobSchedule(scheduleDetails : String) returns String;
  function updateMLJobSchedule(schedule : String) returns String;
  
  function getJobFeedLog(jobName : String) returns array of ds.Varaint_Feed_Log;
  function createJobFeed(jobFeedName : String,userName: String) returns ds.jobFeedFormat;
  function getJobFeedData() returns array of ds.Variant_JobFeed;

  function getPredictionNew(LOCATION_ID:String(4), PRODUCT_ID:String(40),VERSION:String(40), SCENARIO:String(40),
  MODEL_VERSION:String(40),CAL_DATE:String(40)) returns String;
  
  action createJob(url : String, cron : String) returns Integer;
  action createMLJob(jobDetails : js.mlJobs) returns Integer;
//   action updateJob(jobId : Integer, active : Boolean) returns String;
  action updateJob(jobDetails : js.Jobs) returns String;
  action deleteJob(jobId : Integer) returns String;
  action createJobSchedule(jobId : Integer, jobSchedule : js.mlSchedules) returns String;
  action deleteJobSchedule(jobId : Integer, scheduleId : String) returns String;
  action updateJobSchedule(jobId : Integer, scheduleId : String,jobSchedule : js.mlSchedules) returns String;

  //Job Scheduler for seedOrders
  function addSeedOrderJob(jobDetails : String) returns String;

    //Function to insert Data into temporary Table
  function insertJobData(Flag:String,Sequence:String,jobData : LargeString) returns String;
  
  function getJobStatusNew(LOCATION_ID:String(4),PRODUCT_ID:String(40))  returns String;
  //Action for job
  action   jobCreation(JOBDATA : String); 
  //Action for Varaint Parallel jobs 
  action executeJobFeed(jobFeedName : String);
  //Action for parallel jobs by set
  action ParallelSetjobsCreation(JOBDATA : String);
  action resumeSetParallelJobs(SEQUENCE_ID : String,JOB_ID : Integer, STEP : Integer);
  //Action to sync Templates
  action SyncTemplates(JOBDATA : String);
  //Function to create job
  function addJobCreation(jobDetails : String) returns {
    sequenceId : String;
    jobId : Integer;
  };

  function updateJobSchedules(SEQUENCE_ID : String, JOB_ID: Integer) returns String;

  function updateJobDetails(ACTIVE : Boolean, JOB_ID: Integer) returns String;

  function deleteJobs(JOB_ID: Integer, JOB_NAME: String(100), VARIANT_FLAG:String(1)) returns String;

  action resumeJobs(SEQUENCE_ID : String,JOB_ID : Integer, STEP : Integer);

  action purgeAlerts();
 //Service for Lags
  action maintainLags();


//Action to modify charvalue/FactoryLoc in multiple tables
action modifyTablesData();

}