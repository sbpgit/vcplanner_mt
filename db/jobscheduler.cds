// namespace js;

context js {
    type Jobs {
        name             : String;
        description      : String;
        action           : String;
        active           : Boolean;
        httpMethod       : String;
        startTime        : String;
        endTime          : String;
        ACTIVECOUNT      : Integer;
        createdAt        : String;
        INACTIVECOUNT    : Integer;
        jobId            : Integer;
        jobType          : String;
        signatureVersion : Integer;
        subDomain        : String;
        user             : String;
        _id              : Integer;
    }

    type Schedules {
        data           : String;
        description    : String;
        active         : Boolean;
        startTime      : String;
        endTime        : String;
        cron           : String;
        time           : String;
        repeatInterval : String;
        repeatAt       : String;
        nextRunAt      : String;
        scheduleId     : String;
        type           : String;
    }
    entity JOB_METRICS{
        key JOB_NAME     : String(100);
        key JOB_STARTTIME : Timestamp;
            JOB_ENDTIME   : Timestamp;
            USAGE         : LargeString;

    }

    entity JOB_LOGS {
        key JOB_NAME            : String(100) @title: 'Job Name';
        key EXECUTION_TIMESTAMP : String(50)  @title: 'Execution TimeStamp';
            LOG                 : LargeString @title: 'Run Log'
    }

    type RunLogs {
        runId               : String;
        httpStatus          : Integer;
        executionTimestamp  : String;
        runStatus           : String;
        runState            : String;
        statusMessage       : String;
        scheduleTimestamp   : String;
        completionTimestamp : String;
        runText             : String;
    }

    type mlJobs {
        name             : String;
        description      : String;
        action           : String;
        active           : Boolean;
        httpMethod       : String;
        startTime        : String;
        endTime          : String;
        ACTIVECOUNT      : Integer;
        createdAt        : String;
        INACTIVECOUNT    : Integer;
        jobId            : Integer;
        jobType          : String;
        signatureVersion : Integer;
        subDomain        : String;
        user             : String;
        _id              : Integer;
        schedules        : array of mlSchedules;
    }

    type mlSchedules {
        data                 : {
            vcRulesList      : array of {
                profile      : String(50);
                override     : Boolean;
                version      : String(10); // default 'BASELINE'; // IBP Version
                scenario     : String(32); // default 'BSL_SCENARIO'; // IBP Scenario
                Location     : String(4);
                Product      : String(40);
                GroupID      : String(20);
                Type         : String(10); // //OD - Object Dependency, Restriction
                modelVersion : String(20); // Active, Simulation// Active, Simulation
                dimensions   : Integer;
            }
        };
        description          : String;
        active               : Boolean;
        startTime            : String;
        endTime              : String;
        cron                 : String;
        time                 : String;
        repeatInterval       : String;
        repeatAt             : String;
    //   nextRunAt      : String;
    //   scheduleId     : String;
    //   type           : String;
    }

    type btpibpJobs {
        name             : String;
        description      : String;
        action           : String;
        active           : Boolean;
        httpMethod       : String;
        startTime        : String;
        endTime          : String;
        ACTIVECOUNT      : Integer;
        createdAt        : String;
        INACTIVECOUNT    : Integer;
        jobId            : Integer;
        jobType          : String;
        signatureVersion : Integer;
        subDomain        : String;
        user             : String;
        _id              : Integer;
        schedules        : array of btpibpSchedules;
    }

    type btpibpSchedules {
        data            : {
            LOCATION_ID : String(4);
            PRODUCT_ID  : String(40);
            VERSION     : String(10); // default 'BASELINE'; // IBP Version
            SCENARIO    : String(32); // default 'BSL_SCENARIO'; // IBP Scenario
            FROM_DATE   : Date;
            TO_DATE     : Date;
            PAST_DAYS   : Integer;
        };
        description     : String;
        active          : Boolean;
        startTime       : String;
        endTime         : String;
        cron            : String;
        time            : String;
        repeatInterval  : String;
        repeatAt        : String;
    }

    // type Template {
    //     TEMPLATE_ID : String;
    //     ACTIVITY_ID : String;
    //     STEP_NAME : String;
    //     ACT_POSITION : Integer;
    //     MAXSTEP : Integer;
    // }


    entity JOBS {
        key JOB_ID            : Integer     @title: 'Job ID';
        key JOB_NAME          : String(200) @title: 'Job Name';
        key ACTION            : String(200) @title: 'Action';
        key ACTIVE            : Boolean     @title: 'Active';
        key HTTP_METHOD       : String(50)  @title: 'Http Method';
        key CREATAT           : String(50)  @title: 'Created At';
            JOB_DES           : String(500) @title: 'Job Description';
            JOB_TYPE          : String(50)  @title: 'Job Type';
            START_TIME        : String(50)  @title: 'Start TIme';
            END_TIME          : String(50)  @title: 'End Time';
            ACTIVECOUNT       : Integer     @title: 'Active Count';
            INACTIVECOUNT     : Integer     @title: 'InActive Count';
            SIGNATURE_VERSION : Integer     @title: 'Signature Version';
            SUB_DOMAIN        : String      @title: 'Sub Domain';
            USER              : String(50)  @title: 'User';
        key SCHEDULE_ID       : String(50)  @title: 'Schedule ID';
    // key schedules : Association to many SCHEDULES @title : 'Schedule ID';
    }

    entity SCHEDULES {
        key SCHEDULE_ID   : String(50)  @title: 'Schedule ID';
            SCH_DESC      : String(100) @title: 'Schedule Description';
            SCH_DATA      : String      @title: 'Schedule Data';
            SCH_TYPE      : String(50)  @title: 'Cron/one-time';
            SCH_ACTIVE    : Boolean     @title: 'Schedule Active';
            SCH_STARTTIME : String(50)  @title: 'Schedule Startime';
            SCH_END_TIME  : String(50)  @title: 'Schedule Endtime';
            SCH_TIME      : String(50)  @title: 'Schedule Time';
            SCH_NEXTRUN   : String(50)  @title: 'Schedule Nextrun At';
            // key logs : Association to many LOGS @title : 'LOG ID';
        key RUN_ID        : String(50)  @title: 'Run ID';
    };


    entity LOGS {
        key RUN_ID              : String(50) @title: 'Run ID';
            HTTP_STATUS         : Integer    @title: 'HTTP Status code';
            EXECUTION_TIMESTAMP : String(50) @title: 'Execution TimeStamp'; //indicates when actually the scheduler invoked action endpoint
            RUN_STATUS          : String(50) @title: 'Run Status';
            RUN_STATE           : String(50) @title: 'Run State';
            STATUS_MESSAGE      : String     @title: 'Status Message';
            SCHEDULED_TIMESTAMP : String(50) @title: 'Scheduled Timestamp'; //indicates when the schedule was picked up for calculation of next-run
            COMPLETED_TIMESTAMP : String(50) @title: 'Completed Timestamp'; //indicates when the scheduler received response from the action endpoint
            // key TEXT_ID : String(50) @title : 'TextID';
            // runtext : array of {
            //     text          : String @title : 'Text';
            // }
            runtext             : String     @title: 'Run Text';
    }

    // entity LOGSTEXT {
    //     key TEXT_ID : String(50) @title : 'TextID';
    //     key LINE_ID : String(50) @title : 'LineID';
    //     runText : String  @title : 'Run Text';
    // }

    // entity RUNTEXTS {
    //         key TEXT_ID : String @ title : 'Text ID';
    //         TEXT : String @ title : 'Text';
    // }
    entity ACTIVITY_PARAMETERS {
        key PARAMETER_ID : String(50);
            PARAM_DESC   : String(150);
            BASE_URL     : String(150);
            CREATED_DATE : Date;
            CREATED_BY   : String @title: 'Created By';
            CREATED_TIME : Time;
            CHANGED_DATE : Date;
            CHANGED_BY   : String @title: 'Changed By';
            CHANGED_TIME : Time;
    }

    entity ACTIVITY_HEADER {
        key ACTIVITY_ID   : String(50);
            ACTIVITY_DESC : String(150);
            ACTION_URL    : String(150);
            LEVEL         : String(1);
            PREREQUISITE : String;
            PREREQCONDITION: String(5);
            CREATED_DATE  : Date;
            CREATED_BY    : String @title: 'Created By';
            CREATED_TIME  : Time;
            CHANGED_DATE  : Date;
            CHANGED_BY    : String @title: 'Changed By';
            CHANGED_TIME  : Time;
    }

    entity ACTIVITY_ITEM {
        key ACTIVITY_ID   : String(50);
        key PARAMETER_ID  : String(50);
            OPTION_SELECT : String(1);
            MANDATORY     : String(1);
            LEVEL         : String(1);
    }

    entity TEMPLATE_HEADER {
        key TEMPLATE_ID      : String(50);
        key VARIANT_NAME     : String(50) default 'NA';
            TEMPLATE_DESC    : String(150);
            STEPS            : Integer;
            LAYER_CODE       : String(12);
            LEVEL            : String(1);
            RECURRENCE       : String(20);
            RECURRENCE_VALUE : String(30);
            CREATED_DATE     : Date;
            CREATED_BY       : String;
            CREATED_TIME     : Time;
            CHANGED_DATE     : Date;
            CHANGED_BY       : String;
            CHANGED_TIME     : Time;
    }

    entity TEMPLATE_ACTITEM {
        key TEMPLATE_ID  : String(50);
        key VARIANT_NAME : String(50) default 'NA';
        key ACTIVITY_ID  : String(50);
        key ACT_POSITION : Integer;
            STEP_NAME    : String(100);  
            LEVEL        : String(1);          
    }

    entity VARIANT_ITEMS {
        key VARIANT_NAME : String(50) ;
        key VARIANT_DESC : String(100) ;
        key PARAMETER_ID  : String(50);
        key VALUE : String;        
    }

    entity TEMPLATE_ACTITEM_PARAM {
        key TEMPLATE_ID  : String(50);
        key VARIANT_NAME : String(50) default 'NA';
        key ACTIVITY_ID  : String(50);
        key ACT_POSITION : Integer;
        key PARAMETER_ID : String(50);
            VALUE        : LargeString;
            LEVEL        : String(1);

    }

   // Job Template Details
    entity JOB_TEMPLATEDETAILS {
        key JOB_ID                  : Integer @title: 'Job ID';
        key TEMPLATE_ID             : String(50);
        key ACTIVITY_ID             : String(50);
        key STEP                    : Double;
            STEP_NO               : Integer;
            SEQUENCE_ID             : String(50);
            SUBJOB_ID               : Integer; //
            SCHEDULE_ID             : String(200);
            PARAM_VALUE             : LargeString;
        key JOB_NAME                : String(100);
            LEVEL                   : String(1);
            TOTAL_STEPS             : Integer;
            JOB_TYPE                : String(20);
            RECURRENCE_VALUE_FORMAT : String(150); //
            RECURRENCE_VALUE        : String(50);
            JOB_STATUS              : String(20);
            ACTIVITY_STATUS         : String(20);
            LOG                     : String(1);
            JOB_STARTTIME           : Timestamp;
            JOB_ENDTIME             : Timestamp;
            SCH_STARTTIME           : Timestamp;
            SCH_ENDTIME             : Timestamp;
            ACTIVE                  : Boolean;
            CREATED_DATE            : Date;
            CREATED_BY              : String(100);
            CREATED_TIME            : Time;
            CHANGED_DATE            : Date;
            CHANGED_BY              : String(100);
            CHANGED_TIME            : Time;
            RUNTEXT                 : String;
            VARIANT_FLAG            : String(1) default '';
            SET                     : Integer;
            SUB_STEP                : Integer;
            MANDATORY               : String(1);
            MAIN_SET                : Integer;
            RUNNING                 : String default 'FALSE'
            
    }

    entity JOB_TEMPLATELOGS {
        key JOB_ID       : Integer @title: 'Job ID';
        key TEMPLATE_ID  : String(50);
        key ACTIVITY_ID  : String(50);
        key JOBTIMESTAMP : Timestamp;
            STATUS       : Boolean;
            COMMENTS     : String;
    }

    entity JOB_CREATIONDATA {
        key SEQUENCE_ID : String(50);        
        key VARIANT_NAME : String(50) default 'NA';
        key ACTIVITY_ID : String(50);
        key STEP        : Double;        
            STEP_NO   : Integer;
            TEMPLATE_ID : String(50);
            ACTION_URL  : String(150);
            STEP_DATA   : LargeString;
            SET         : Integer;
            SUB_STEP    : Integer;
            MANDATORY   : String(1);
            MAIN_SET    : Integer;
    }
}

@cds.persistence.exists
entity![V_JOBSTATUS]{
    key![JOB_ID]              : Integer      @title: 'Job ID';
    key![JOB_NAME]            : String(200)  @title: 'Job Name';
    key![ACTION]              : String(200)  @title: 'Action';
    key![JOB_DES]             : String(500)  @title: 'Job Description';
    key![SCH_STARTTIME]       : String(50)   @title: 'Scheduled Start Time';
    key![SCH_END_TIME]        : String(50)   @title: 'Scheduled End time';
    key![SCH_TIME]            : String(50)   @title: 'Scheduled Time';
    key![SCH_NEXTRUN]         : String(50)   @title: 'Scheduled Next Run';
    key![RUN_ID]              : String(50)   @title: 'Run ID';
    key![RUN_STATUS]          : String(50)   @title: 'Run Status';
    key![CRITICALSTATUS]      : Integer      @title: 'CRITICALSTATUS';
    key![RUN_STATE]           : String(50)   @title: 'Run State';
    key![CRITICALSTATE]       : Integer      @title: 'CRITICALSTATE';
    key![STATUS_MESSAGE]      : String(5000) @title: 'Status Message';
    key![SCHEDULED_TIMESTAMP] : String(50)   @title: 'Scheduled Timestamp';
    key![COMPLETED_TIMESTAMP] : String(50)   @title: 'Completed Timestamp';
    key![RUNTEXT]             : LargeString  @title: 'Run Text';
}

@cds.persistence.exists
entity![V_JOBRUNSTATE]{
    key![RUN_STATE] : String(17) @title: 'RUN_STATE';
}

@cds.persistence.exists
entity![V_JOBRUNSTATUS]{
    key![RUN_STATUS] : String(9) @title: 'RUN_STATUS';
}

@cds.persistence.exists
entity![V_ACTIVITYPARAMS]{
    key![ACTIVITY_ID]   : String(50)  @title: 'Activity ID';
    key![PARAMETER_ID]  : String(50)  @title: 'Parameter ID';
       ![PARAM_DESC]    : String(150) @title: 'Parameter Description';
       ![OPTION_SELECT] : String(50)  @title: 'Option Selected';
       ![MANDATORY]     : String(1)   @title: 'Mandatory';
}

@cds.persistence.exists
entity![V_VARIANTDATA]{
    key![VARIANT_NAME]   : String(50)  @title: 'Variant Name';
    key![VARIANT_DESC]   : String(50)  @title: 'Variant DESC';
}
@cds.persistence.exists
entity![V_VARIANTDETAILS]{
    key![VARIANT_NAME]   : String(50)  @title: 'Variant Name';
    key![VARIANT_DESC]   : String(50)  @title: 'Variant DESC';
    key![PARAMETER_ID]  : String(50)  @title: 'Parameter ID';
       ![VALUE]     : String   @title: 'Value';
}

@cds.persistence.exists
entity![V_JOBLISTDATA]{
    key![JOB_ID]        : Integer      @title: 'JOB Id';
       ![JOB_NAME]      : String(100)  @title: 'Job Name';
       ![JOB_STATUS]    : String(10)   @title: 'Job Status';
       ![TOTAL_STEPS]   : Integer      @title: 'total steps';
       ![TEMPLATE_ID]   : String(50);
       ![ACTIVE]        : Boolean      @title: 'Active';
       ![SEQUENCE_ID]        : String(50)      @title: 'Sequence';
       ![JOB_TYPE]      : String(50)   @title: 'Job Type';
       ![LEVEL]      : String(1)   @title: 'Level';
       ![JOB_STARTTIME] : Date         @title: 'Job start Time';
       ![JOB_ENDTIME] : Date         @title: 'Job end Time';
       ![CREATED_BY]    : String(100) @title: 'Created By';
       ![VARIANT_FLAG]    : String(1) @title: 'Variant Flag';
       ![MAIN_SET]    : Integer @title: 'Main Set';
       ![SET]    : Integer @title: 'Set';
}
