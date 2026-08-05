context rs {
    entity APP_STATS {
        key JOB_ID              : Integer default 0 @title: 'JOB ID';
        key SERVICE_STATE       : String(50) default 'START' @title: 'SERVICE START v/s END';
        key ID                  : String(100)   @title: 'ID';
        key NAME                : String(100)   @title: 'NAME';
        key STATS_TIME          : Timestamp     @title: 'STATS TIME';
        key INSTANCE            : Integer       @title: 'APP INSTANCE'; // The zero-based index of running instances
        STATE                   : String(50)    @title: 'STATE'; //RUNNING, CRASHED, STARTING, DOWN
        UPTIME                  : Integer       @title: 'UPTIME SECONDS';
        MEMORY_QUOTA_MB         : Double        @title: 'MEMORY QUOTA MB';
        DISK_QUOTA_MB           : Double        @title: 'DISK QUOTA MB';
        CPU_USAGE_PERCENT       : Double        @title: 'CPU USAGE % ';
        MEMORY_USAGE_PERCENT    : Double        @title: 'MEMORY USAGE % ';
        DISK_USAGE_PERCENT      : Double        @title: 'DISK USAGE % ';
        LOG_RATE                : Integer       @title: 'LOG RATE BYTES/SECOND';

    }

    entity SYS_STATS {
        key JOB_ID              : Integer default 0 @title: 'JOB ID';
        key SERVICE_STATE       : String(50) default 'NONE' @title: 'SERVICE START v/s END';
        key PLATFORM            : String(100)   @title: 'PLATFORM';
        key STATS_TIME          : Timestamp     @title: 'STATS TIME';
        SYS_UPTIME              : Integer       @title: 'SYS UPTIME SECONDS';
        PROCESS_UPTIME          : Integer       @title: 'PROCESS UPTIME SECONDS';
        LOAD_AVG_1_MIN_PERCENT  : Double        @title: 'LOAD AVERAGE 1 MIN % ';
        LOAD_AVG_5_MIN_PERCENT  : Double        @title: 'LOAD AVERAGE 5 MIN % ';
        LOAD_AVG_10_MIN_PERCENT : Double        @title: 'LOAD AVERAGE 10 MIN % ';
        CPU_COUNT               : Integer       @title: 'CPU COUNT ';
        CPU_USAGE_PERCENT       : Double        @title: 'CPU USAGE % ';
        CPU_FREE_PERCENT        : Double        @title: 'CPU FREE % ';
        MEMORY_QUOTA_MB         : Double        @title: 'MEMORY QUOTA MB';
        MEMORY_FREE_MB          : Double        @title: 'MEMORY FREE MB';
        MEMORY_USAGE_PERCENT    : Double        @title: 'MEMORY USAGE % ';
        MEMORY_FREE_PERCENT     : Double        @title: 'MEMORY FREE % ';
    }

    entity NODE_STATS {
        key JOB_ID              : Integer default 0 @title: 'JOB ID';
        key SERVICE_STATE       : String(50) default 'START' @title: 'SERVICE START v/s END';
        key PROCESS_ID          : Integer       @title: 'PROCESS ID';
        key PARENT_PROCESS_ID   : Integer       @title: 'PARENT PROCESS ID';
        key STATS_TIME          : Timestamp     @title: 'STATS TIME';
        // maximum resident set size used in Megabytes.
        RSS_MAX_SIZE            : Double        @title: 'MAX RSS MB';
        // rss, Resident Set Size, is the amount of space occupied in the main memory device 
        // (that is a subset of the total allocated memory) for the process, 
        // including all C++ and JavaScript objects and code.
        RSS                     : Double        @title: 'RESIDENT SET SIZE MB';
        // heapTotal and heapUsed refer to V8's memory usage.
        HEAP_TOTAL              : Double        @title: 'HEAP TOTAL MB ';
        HEAP_USAGE              : Double        @title: 'HEAP USAGE MB ';
        // measure time spent in user and system code respectively, 
        // and may end up being greater than actual elapsed time 
        // if multiple CPU cores are performing work for this process.
        USER_CPU_TIME           : Integer       @title: 'USER CPU TIME MICROSECONDS';
        SYSTEM_CPU_TIME         : Integer       @title: 'SYSTEM CPU TIME MICROSECONDS';
    }

    
}
