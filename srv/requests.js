### Get Products
Send Request
GET http://localhost:4004/sap/opu/odata/sap/catalog/$metadata HTTP/1.1


### POST Regressions
POST https://sbp-btp-sbpconsulting-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/generateRegModels
Content-Type: application/json

{
    "vcRulesList": [
      {
        "Location": "FR10",
        "Product": "KM_M219VBVS_BVS",
        "GroupID": "M219VV00105NN_1"
      }
    ]
}

### generate Future Primary and Unique IDS
GET http://localhost:4004/plstr-data/fgenPrimeAndUqiue()

### generate Future Primary ID Timeseries Data
GET http://localhost:4004/plstr-data/fgenFutureTsForPrimary()

### generate Primary ID Timeseries Data
GET http://localhost:4004/plstr-data/fgenTsForPrimary()

### generate Timeseries Data
GET http://localhost:4004/plstr-data/fgenTimeSeries()

### generate Master Data
GET http://localhost:4004/plstr-data/fgenMasterData()



### generate Partial Products Data
GET http://localhost:4004/plstr-data/fgenPartialProducts()

### UPDATE APP STATS
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/res/updateAppStats
Content-Type: application/json

{

}

### UPDATE SYS STATS 
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/res/updateSysStats
Content-Type: application/json

{

}


### purge Resource Stats
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/res/purgeResStats
Content-Type: application/json

{
}

### UPDATE SYS STATS 
POST http://localhost:4004/res/updateSysStats
Content-Type: application/json

{

}

### UPDATE NODE STATS 
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/res/updateNodeStats
Content-Type: application/json

{

}



### UPDATE SYS STATS 
POST http://localhost:4004/res/updateNodeStats
Content-Type: application/json

{

}


### UPDATE JOBS LOCALLY
GET http://localhost:4004/jobs/fUpdateJobs()



### UPDATE JOBS LOCALLY
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/jobs/updateJobs
{

}

### update Job Logs
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/jobs/syncJobs
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIklaWXVMSitHM3ZRdVlxaVpzS2pmQWxlbzU0VC9ub1hWTTc1YkpabU12T3M9In0.eyJqdGkiOiI4MmY1NzUwMjRhZmE0NDIyYWJjYjNkNjllMTQ4ZDM1YSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxODA4MTg0LCJleHAiOjE3MjE4MTE3ODQsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.jy40bpVA7MAfc9tWxMUTHJl1gdCl_OP9pSmnFGeMSj4htAaWRO2d2Oiju37_GXO0LzmR2cgAJlRzx3rP1Wcgp1O0yNR_PGLHb1ahsB60wrLzeW8PI2h7_6pAwE8gB1mmDoNZLSgMFAbxJ3GqKlwFffCQ6szbB4ryb_ddDVMjr_dvbIh4CePhMpq9AUz4SBUZ5uV_QYiGCVeiEN1Zr4zJNOIcZwRjwnSl1CH8Nb-ZOr80ZvEJrn65wnD3qJAhVOY0Bw5CYVWbUb7Jl9J6vYQD4Rpo6ZnaC8spBb9ZZKOkJlddILylUQSg4v4MVNRaP6LaC92zoEn6J2stDI7oxgqdyA

{
	"timer" : 60000
}

### update Job Logs
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/jobs/syncJobs
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogInBXYnU0MytUTCt0N1ZyK2xBY1BPbkRva0NWdDBMMkxLdUh4ZUo1YkM0NEk9In0.eyJqdGkiOiJmNmJkYzI0MmUyNTE0MGNmOGRhMDE5Zjc1NjE3ZTZlMyIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxODc1NDU5LCJleHAiOjE3MjE4NzkwNTksImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.PwaTKkduyC2CpDJo1rjj4g4C9Jgd6UdlEeD5dg0ZerDel-jlmapE7DRMB24h6zrzjZD5Ok-GXioGjje3-44faLrLgI1S02VOyjD71l5Grwdw-xMV-E12EJtyjw0ECQ55d3yy8y2337C5Et3qYTUmVyPr7hhKCoZwQNsDrMugieQcAXf8h5vo5rS9DTaajEFQzA7wiKV9oXlJYTf8g1bWPpAX18RW7fLAU6trpag3nUqg6AaRyQvMYdVUKZ27l9rQtD8OMFOAHpp4n74-0IiRpl0AjaV1IZfWngPJGnn_GC5mPqKqkpiE8EpMci8UprFqZqY952kX8lnexPseSzU9Fw

{
	"timer" : 0
}


### update Job Logs
POST http://localhost:4004/jobs/syncJobs
Content-Type: application/json
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogImdyT2JGVy9PMGxZM2M5L05tYm5EWDFrY3RhdWJ1d2VmODZnaWVQU2RZWEU9In0.eyJqdGkiOiJlMmE1OTgzYTY3YWI0ZjY5OWQ4ZWUwZDFkYzVkZDgxZiIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIzMDcwMzUyLCJleHAiOjE3MjMwNzM5NTIsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.KXxUZC7x9ZBI-y7CufY_XFKie2oMEq9XGezpiGUuYP1LFgh2V-eBh-PueUwtP_qvb76kTTM4GTyDDPmsp0sb4sM_DUqfJ6mEjYrD5hkiwKiGR1QQB1lpyBOT5C7SSXQsW3cuc1DlSaGy596ZPglV2sLKEhFi74V8YrtkA7P6Uu7NNai6VAFxWOd7uVykkMk3E0Xk551C8qti5NyJXHqvWkatHagoEfahBxiYRoF5Dqvdlz4TexdaXfLQH3kenVvADbXIOAFTlosZbXdPU11JIiMqDyFr4TR77g67033lrFKAHNIrqyHl6eZwC-7qg9iXpumVM3SAAtgsT1Z5N-lZ9w'

{
	"timer" : 0
}

### READ JOB SCHEDULES LOCALLY
GET http://localhost:4004/jobs/lreadJobSchedules(jobId=1950440)
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIjkyakMxN0t1VFlnNEx6R3FFNWNUZVNWNlErL1BDRFcxZmNWeEVaZ2xGOWs9In0.eyJqdGkiOiI2NWMwMzkzZmQ4ZTY0OGQ0YmYyN2JhNzBjZTMxMWIxNCIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxODEwNTE1LCJleHAiOjE3MjE4MTQxMTUsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.HcWqHM8Nb9RmjyWS_oc5F5qJu3JFavKbv8gxZXuYdPVLLNLeLpNFeIvPbuqAGq4lBWMvG5UYFyb3RY6tnHfj8xAZAbG_Yrp_iu5RNN-pt6iyzpmh-8vG5vMtDzTFwdq5Br4eKdzoYb2CxNRJ6VIgbyX4G2Z68yVB-e4pASuaxBK6vGr7zsKPTuILWwS0X32nV_I9s1xDN2IN5v-MKiL8xzb3jA7WYb2c-uiJOmycs1Ss7TuxcmawBKNaL8ZE-i-iNrvTZvp7rttmeLDZ17agIsNIaLKiObPgSdREwdeDSwvt6IRgAty0fseG5yXZ4gwddD8Scd1DNrKqTNDvMRgr1w'


### READ JOBS LOCALLY
GET http://localhost:4004/jobs/lreadJobs()
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIjkyakMxN0t1VFlnNEx6R3FFNWNUZVNWNlErL1BDRFcxZmNWeEVaZ2xGOWs9In0.eyJqdGkiOiI2NWMwMzkzZmQ4ZTY0OGQ0YmYyN2JhNzBjZTMxMWIxNCIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxODEwNTE1LCJleHAiOjE3MjE4MTQxMTUsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.HcWqHM8Nb9RmjyWS_oc5F5qJu3JFavKbv8gxZXuYdPVLLNLeLpNFeIvPbuqAGq4lBWMvG5UYFyb3RY6tnHfj8xAZAbG_Yrp_iu5RNN-pt6iyzpmh-8vG5vMtDzTFwdq5Br4eKdzoYb2CxNRJ6VIgbyX4G2Z68yVB-e4pASuaxBK6vGr7zsKPTuILWwS0X32nV_I9s1xDN2IN5v-MKiL8xzb3jA7WYb2c-uiJOmycs1Ss7TuxcmawBKNaL8ZE-i-iNrvTZvp7rttmeLDZ17agIsNIaLKiObPgSdREwdeDSwvt6IRgAty0fseG5yXZ4gwddD8Scd1DNrKqTNDvMRgr1w'

### update Job Logs
POST http://localhost:4004/jobs/syncJobsOneTime
Content-Type: application/json
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIjkyakMxN0t1VFlnNEx6R3FFNWNUZVNWNlErL1BDRFcxZmNWeEVaZ2xGOWs9In0.eyJqdGkiOiI2NWMwMzkzZmQ4ZTY0OGQ0YmYyN2JhNzBjZTMxMWIxNCIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxODEwNTE1LCJleHAiOjE3MjE4MTQxMTUsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.HcWqHM8Nb9RmjyWS_oc5F5qJu3JFavKbv8gxZXuYdPVLLNLeLpNFeIvPbuqAGq4lBWMvG5UYFyb3RY6tnHfj8xAZAbG_Yrp_iu5RNN-pt6iyzpmh-8vG5vMtDzTFwdq5Br4eKdzoYb2CxNRJ6VIgbyX4G2Z68yVB-e4pASuaxBK6vGr7zsKPTuILWwS0X32nV_I9s1xDN2IN5v-MKiL8xzb3jA7WYb2c-uiJOmycs1Ss7TuxcmawBKNaL8ZE-i-iNrvTZvp7rttmeLDZ17agIsNIaLKiObPgSdREwdeDSwvt6IRgAty0fseG5yXZ4gwddD8Scd1DNrKqTNDvMRgr1w'

{
}


### update Job Logs
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/jobs/syncJobsOneTime
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogInBEVUVZVi9oaExycG9VNUJxakRkd21WWU9QS0RwdWxWVml6eUtFUkJVaVk9In0.eyJqdGkiOiI5ZWU1YzI5NzA3ZDI0MzJiOWY2YWQ0MWEyZTcyNGE4NCIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIzMDkzMDkwLCJleHAiOjE3MjMwOTY2OTAsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.iNbjSzsMrADKPtWm-X5lGASMI0AGa6AJEpdhxkkG2TeGM90gF02GTMlPO7dNFYapfysLw2ES0kxJ6wnLYOe1fXlgwKGstb4TEmbPizC2NW-XTeY0jaVx4O_JHXNTPmeT3rpiuyGb6tbZyNexwQOBDxpZpT6QRQsVyZGy5gspnDB1ofbGfxWMhSx1MIWtE8JetCTNBrz04aVXWyKGQZPkZrV8XoHfuyu8XSbuCpZJMo1XMFHDsYCV8Rxxgj94InsTnpigpAtBbu1CBPwRYi2DFlGVK7goPdYegWY0GeYvYikkdVoFRB1DBSXnkFYTSWryKBlCqya-kyRk4GyIROr7GA

{
}

### update Job Logs
POST http://localhost:4004/jobs/syncJobs
Content-Type: application/json
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIjkyakMxN0t1VFlnNEx6R3FFNWNUZVNWNlErL1BDRFcxZmNWeEVaZ2xGOWs9In0.eyJqdGkiOiI2NWMwMzkzZmQ4ZTY0OGQ0YmYyN2JhNzBjZTMxMWIxNCIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxODEwNTE1LCJleHAiOjE3MjE4MTQxMTUsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.HcWqHM8Nb9RmjyWS_oc5F5qJu3JFavKbv8gxZXuYdPVLLNLeLpNFeIvPbuqAGq4lBWMvG5UYFyb3RY6tnHfj8xAZAbG_Yrp_iu5RNN-pt6iyzpmh-8vG5vMtDzTFwdq5Br4eKdzoYb2CxNRJ6VIgbyX4G2Z68yVB-e4pASuaxBK6vGr7zsKPTuILWwS0X32nV_I9s1xDN2IN5v-MKiL8xzb3jA7WYb2c-uiJOmycs1Ss7TuxcmawBKNaL8ZE-i-iNrvTZvp7rttmeLDZ17agIsNIaLKiObPgSdREwdeDSwvt6IRgAty0fseG5yXZ4gwddD8Scd1DNrKqTNDvMRgr1w'

{
	"timer" : 0
}


### update Job Logs
POST http://localhost:4004/jobs/purgeJobLogs
Content-Type: application/json
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIktHSGg0WC94Z0hvYitUOUVJMFRMRU9wSk80Qi9BQkR5eEVpNEdXeEJwd0k9In0.eyJqdGkiOiI5MjJhMGZjODNkOWQ0YjhmYTEyNjFmYjYyMmYyNTY0ZiIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxNzk2NTY3LCJleHAiOjE3MjE4MDAxNjcsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.HAMmIIOfVdBVPdgc3TEGZGBlCBjdfFcEgnrcj7NytXj9po73Lq2G6_Pxb5-MXd_fRSvCzMIOmccDtsxwA38x0pSrvIl6yiahy0z0_k67YmGAx7HU4PnB-1KQPs_TqTQBfjPu_FosnCLPPPNGF9Abb5IKa_Q3c3-d4nvm4lN3VlHMQM2FiT8n2oPri5Sdudw-St-csSD3fv4VE6y_J4k5nwtYITid_j9y6RBysFJBl8ExCp98PtBbWeqVAhMtag5uxIPoMKGqXER8C15LubzX3N4tAHZXF2wTsld9csk0Ds8ovxkGhFTC1m6wd4A_hR47pkC9NWwAqEb7rxD5eBA9Eg'

{
	
}

### update Job Logs
POST http://localhost:4004/jobs/updateJobs
Content-Type: application/json
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIkNkeGlmQzN5SzRTVHhHeEtRcVhEV1BtdE9xV1pSRFFaSGZSQkd6THVNVGM9In0.eyJqdGkiOiI5ZDc0Mjk2ZTY5YzU0YjFhOTBlZWJhNTE1ZGY3ZGYyNiIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxNjczMzExLCJleHAiOjE3MjE2NzY5MTEsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.MkpcdGiT-y2yRzAUyxf-l79IGNnSfaJ5ymX_ignlFlWLMOjcfAztBjQresXmaAaMJW-0_DDz1haZMc4fRDQY-v_W_ddciPdYzxGox-9RJWpfW6qWJQFw1KlLODU0xlGGKVjtPBvf6D7kdfUnmmOZdtpkdZHh9gCbMcEKvd7n2_Tn_ElptwFFXRjogDLOJfZ6arJ7t1yc0F8XOFZ3XirQ1YszQVirVjHcgkE_ytD0fmecvJIwiU0PSpK9ndnfZ5KLkKdUUAduu3a0qDIjRKUnlaV_wo2Q3zdtgVJTuEDsFXNfhY-cWXHqe85KayE65APeOz-pl_eL9hrAzdjqoA4lYw'

{
}



### purge Job Logs
POST http://localhost:4004/jobs/purgeJobLogs
Content-Type: application/json
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIktHSGg0WC94Z0hvYitUOUVJMFRMRU9wSk80Qi9BQkR5eEVpNEdXeEJwd0k9In0.eyJqdGkiOiI5MjJhMGZjODNkOWQ0YjhmYTEyNjFmYjYyMmYyNTY0ZiIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxNzk2NTY3LCJleHAiOjE3MjE4MDAxNjcsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.HAMmIIOfVdBVPdgc3TEGZGBlCBjdfFcEgnrcj7NytXj9po73Lq2G6_Pxb5-MXd_fRSvCzMIOmccDtsxwA38x0pSrvIl6yiahy0z0_k67YmGAx7HU4PnB-1KQPs_TqTQBfjPu_FosnCLPPPNGF9Abb5IKa_Q3c3-d4nvm4lN3VlHMQM2FiT8n2oPri5Sdudw-St-csSD3fv4VE6y_J4k5nwtYITid_j9y6RBysFJBl8ExCp98PtBbWeqVAhMtag5uxIPoMKGqXER8C15LubzX3N4tAHZXF2wTsld9csk0Ds8ovxkGhFTC1m6wd4A_hR47pkC9NWwAqEb7rxD5eBA9Eg'
{
}

### purge Job Logs
POST http://localhost:4004/jobs/purgeJobLogsNew
Content-Type: application/json
Authorization: 'eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIm5tMUg0NmFoSk9BY3JpaEE4V08xN2dtcmJ5YXZKY3h6dDFZS3d4cHFCVm89In0.eyJqdGkiOiJlNTQ5NWIyNDMxOGE0N2RkOGFkOWI3NTk4MDlhYWY0MiIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIwNjEzOTUzLCJleHAiOjE3MjA2MTc1NTMsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.KcOzugu7A2IQEz9QWHBs6NmmOo1-EUY55olqYObPqSY9GoJkSBS2apYDwnhjKo1nJsF-RvNj3VfCBNOSm5Xpaiq63aIWfhyflU5_jzpgqqQalP043R_tIjsNGdriBypaomTmzCLnv6dPxa_KCbuk2ajXXYHUQDItVXbaazT6acg7jAG9knXBe9ugWo9ZUYROFQErS8MNpJr7X-i_LI_dDAjEaadO_1P6bGpFfC44So8u_RIilmA8hLG4ctUzs6S4OEp9m1iZ27FQUV_NC25jc69fnZRZxdcQqpGmnrBsd4j62CPAwzXiD6harxCflL5NLlUYSx9Ap6yobiV3y0LSpA'

{
}

### purge Job Logs
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/jobs/purgeJobLogs
Content-Type: application/json

{
}

### purge Job Logs
POST http://localhost:4004/jobs/purgeJobLogs
Content-Type: application/json

{
}


### purge Job Logs
POST http://localhost:4004/jobs/purgeJobLogs
Content-Type: application/json

{
	"purgeDays" : 5
}


### PURGE JOB LOGS
GET http://localhost:4004/jobs/fpurgeJobLogs(purgeDays=3)




### READ JOBS LOCALLY
GET http://localhost:4004/jobs/lreadJobs()

### READ JOB DETAILS LOCALLY
GET http://localhost:4004/jobs/lreadJobDetails(jobId=618946,displaySchedules=true)

### READ JOB SCHEDULES LOCALLY
GET http://localhost:4004/jobs/lreadJobSchedules(jobId=613878)

### READ JOB SCHEDULE LOCALLY
GET http://localhost:4004/jobs/lreadJobSchedule(jobId=530818,scheduleId='fb51db58-73f9-4695-80ab-b30fa9825d94',displayLogs=true)


### READ JOB ACTION LOGS LOCALLY
GET http://localhost:4004/jobs/lreadJobActionLogs(jobId=570765)

### READ JOB RUN LOGS LOCALLY
GET http://localhost:4004/jobs/lreadJobRunLogs(jobId=570765,scheduleId='f4b12dca-84e3-4cf3-a2cd-58aed4970377',page_size=55,offset=0)

### ADD ML JOB LOCALLY
GET http://localhost:4004/jobs/laddMLJob(jobDetails='{"name": "generateModelsz","description" : "Generate Machine Learning Models","action" :"%2Fpal%2FgenerateModels","active" : true,"active" : true,"httpMethod" : "POST","startTime" : "2022-04-22 14:00 +0000","endTime" : "2022-05-22 14:00+0000","schedules" : [{"data" : {"vcRulesList":[{"profile" : "SBP_HGBT_0","override" : true,"Location":"RX01","Product":"8150RW","GroupID": "1973254_1","Type" : "OD","modelVersion" : "Simulation"}]},"cron": "* * * * * *%2F60 0","active": true,"startTime": "2022-04-22 14:00 +0000"}]}')

### ADD ML JOB LOCALLY
GET http://localhost:4004/jobs/laddMLJob(jobDetails='{"name": "generateJobActionLogs","description" : "Generate Job Action Logs","action" :"%2Fjobs%2FupdateJobs","active" : true,"active" : true,"httpMethod" : "POST","startTime" : "2022-06-06 14:00 +0000","endTime" : "2022-06-07 14:00+0000","schedules" : [{"data" : {},"cron": "* * * * * *%2F15 0","active": true,"startTime": "2022-06-06 14:00 +0000"}]}')

### Add IBP locally
GET http://localhost:4004/jobs/laddMLJob(jobDetails='{"name": "generateIBPsz1","description" : "Generate IBP","action" :"%2Fibpimport-srv%2FgenerateFDemandQty","active" : true,"active" : true,"httpMethod" : "POST","startTime" : "2022-05-11 14:00 +0000","endTime" : "2022-05-22 14:00+0000","schedules" : [{"data" : {"LOCATION_ID":"RX01","PRODUCT_ID":"8150RW","VERSION":"__BASELINE","SCENARIO":""},"cron": "","time":"2022-05-02 14:32 +0000",active": true,"startTime": "2022-05-02 14:00 +0000"}]}')

### UPDATE JOB LOCALLY
GET http://localhost:4004/jobs/lupdateJob(jobDetails='{"jobId" : 513493,"active": true,"startTime" : "2022-04-29 00:00 +0000","endTime" : "2022-06-22 00:00 +0000"}')

### DELETE JOB LOCALLY
GET http://localhost:4004/jobs/ldeleteJob(jobId=505387)


### ADD  JOB SCHEDULE LOCALLY
GET http://localhost:4004/jobs/laddJobSchedule(schedule='{"jobId":499941, "data" : {"vcRulesList":[{"profile" : "SBP_HGBT_0","override" : true,"Location":"RX01","Product":"8150RW","GroupID": "1973253_1","Type" : "OD","modelVersion" : "Simulation"}]},"description" : "Recurring Cron Generate Model for OD 1973253_1","active" : true,"cron": "* * * * * *%2F5 0","startTime": "2022-04-25 23:00 +0000","endTime" : "2022-04-26 15:00 +0000" }')


### UPDATE JOB SCHEDULE LOCALLY
GET http://localhost:4004/jobs/lupdateMLJobSchedule(schedule='{"jobId":499941, "scheduleId" : "633977c8-09d6-4a57-b03e-b12d03c3d9e8", "data" : {"vcRulesList":[{"profile" : "SBP_HGBT_0","override" : true,"Location":"RX01","Product":"8150RW","GroupID": "1973253_1","Type" : "OD","modelVersion" : "Simulation"}]},"description" : "Recurring Cron (Every Hour) Generate Model for OD 1973253_1","active" : true,"cron": "* * * * * *%2F60 0","startTime": "2022-04-25 23:00 +0000","endTime" : "2022-04-26 15:00 +0000" }')


### DELETE  JOB SCHEDULE LOCALLY
GET http://localhost:4004/jobs/ldeleteMLJobSchedule(scheduleDetails='{"jobId":499941,"scheduleId":"ba7035b2-d6d1-4525-b176-2066aa95f07a"}')

### Dummy request
GET http://localhost:4004/odata/v4/catalog/dummyFunctionForTesting()

### CREATE ML JOB
POST http://localhost:4004/jobs/createMLJob
Content-Type: application/json

{
    "jobDetails" : {
    "name": "generateModels",
    "description" : "Generate Machine Learning Models",
    "action" : "https://sbpprovider-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/generateRegModels",
    "active" : true,
    "httpMethod" : "POST",
    "startTime" : "2022-03-31 09:00 +0000",
    "endTime" : "2022-03-31 10:00 +0000",
    "schedules" : [
        {
            "data" : {"vcRulesList":[
                            {
                                "profile" : "SBP_VARMA_0",
                                "override" : true,
                                "Location":"RX01",
                                "Product":"8150RW",
                                "GroupID": "1973254_1",
                                "Type" : "OD",
                                "modelVersion" : "Simulation"
                            }
                ]}
        
        }
    ]
    }
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": false,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : false
		}
	]
}


### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_RDT_0",
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000029",
			"GroupID": "8032_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000029",
			"GroupID": "8032_1",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : false,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "NONE"
		}
	]
}

### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_HGBT_1",
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000011",
			"GroupID": "7933_1",
			"Type": "PI",
			"modelVersion": "Active"
		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000011",
			"GroupID": "7933_1",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : false,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "NONE"
		}
	]
}


### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_MLR_1",
			"override": true,
			"Location": "1600",
			"Product": "VCP_1600",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active"
		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1600",
			"Product": "VCP_1600",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : false,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "NONE"
		}
	]
}



### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_RDT_0",
			"override": true,
			"Location": "1600",
			"Product": "VCP_1600",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active"
		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1600",
			"Product": "VCP_1600",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : false,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "NONE"
		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIngyNUJHMkdNUmRQRjNuYTNveEovOVI2WmNpVVBhQ200cE9ZUHpnb0R6Vnc9In0.eyJqdGkiOiI3NGExYTExOTU0ZDY0NGRkYmY2ZjRkZTcyMDFjYWFjZSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0cy1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF1dGhvcml0aWVzIjpbInVhYS5yZXNvdXJjZSJdLCJzY29wZSI6WyJ1YWEucmVzb3VyY2UiXSwiY2xpZW50X2lkIjoic2ItY29uZmlncHJvZHVjdHMtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJjaWQiOiJzYi1jb25maWdwcm9kdWN0cy1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3RzLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiJhNDg3ZGI5NCIsImlhdCI6MTcyNTAyMTQ3OCwiZXhwIjoxNzI1MDY0Njc4LCJpc3MiOiJodHRwczovL3ZjcHByb3ZpZGVyLXNjMGplb2pxLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJhdWQiOlsidWFhIiwic2ItY29uZmlncHJvZHVjdHMtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciXX0.aY3OK743PiJUHSei5B5ELQw3nDR1Dn9-r9bo8CPNKt-t5LUUjoO5zv2Vt3GQiyC6ZZWog8vv_Nf6i3z3oiRCjg1lQOwMtH-QTBon5q8agYv3i4wXPKdRjrWzeYpgpkh06NXUkELf0gYlX2yxsWkBU_XONXKXzSCmLWCJRbeqrTmsXLhnizqnSAoYOCYPxXA9oTSjxvVztMj6yw6MyQxYkkyWG2b_zPZRqJRXcp2lyYPt8nZK1H7mQU_yXlBvi6_92bgxwFcwi3l8I_85LjqXfrk11gfPhVks-6umxrw_c-v29ncuIcDkyri-ogGdplFreHEN57ZH19B6ofgfyDIRVw
{
	"vcRulesList": [
		{
			"override": false,
			"Location": "PLUS",
			"Product": "000000000000000029",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "NONE"
		}
	]
}

### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwLWRlbW8tYWFrdms0ZnQuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0yNzM4NTk4NjMiLCJ0eXAiOiJKV1QiLCJqaWQiOiAibklpbWppaGNwcktLS0w4d2VsWTV5V2x3VDRscSsrRSt5bzVnTHdXRVVsTT0ifQ.eyJqdGkiOiIzNDk0ZTJjNzdkMGY0NjExYjA4MWJmODg4MzMxM2Q4NCIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiJmYjY5YjRhMy02NTNhLTQxZmYtOWRiYy0yZGI5NDQ3MmE3NDMiLCJ6ZG4iOiJ2Y3AtZGVtby1hYWt2azRmdCJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLXNicHZjcGRlbW8tdGVzdCF0ODQzOTQiLCJhdXRob3JpdGllcyI6WyJ1YWEucmVzb3VyY2UiXSwic2NvcGUiOlsidWFhLnJlc291cmNlIl0sImNsaWVudF9pZCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImNpZCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJyZXZfc2lnIjoiY2I5OTEyZGYiLCJpYXQiOjE3MjQyNDY0OTgsImV4cCI6MTcyNDI1MDA5OCwiaXNzIjoiaHR0cHM6Ly92Y3AtZGVtby1hYWt2azRmdC5hdXRoZW50aWNhdGlvbi51czEwLmhhbmEub25kZW1hbmQuY29tL29hdXRoL3Rva2VuIiwiemlkIjoiZmI2OWI0YTMtNjUzYS00MWZmLTlkYmMtMmRiOTQ0NzJhNzQzIiwiYXVkIjpbInVhYSIsInNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCJdfQ.YiAjrsVR75nscogmRMndgJWUDzEBkMpL9EtZNwg292MaoJaOL4_mkgWXUKhQa7QBHgdGrjSsMbI9KnxIkI0qbSfVHjEMpjunmqrkmhqeqm-Plg8w0dsjDCsgWoYnuBbvnwO-cKUgUh7V9HWuZ_QRKzJ1PawQUZWeALJcwlbp_k4NhRHHgOqFbO4bOWmQ1vVRyYkGL2hGv35qcNgzcSBpSZO2SAYF22o7DCGB11zOinbG2eVmy6RNlx2kFbKW4y08ILVk2BN-mQBhazLuQN1Sog3_7yY7qq0NK-APZolgVsU_MIKGHOdzqy8-Ibf6CN7WzQz5xlwb0AvMS6F2VhZcTQ
{
	"vcRulesList": [
		{
			"override": false,
			"Location": "PLUS",
			"Product": "000000000000000011",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "LINEAR",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "NONE"
		}
	]
}


### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": false,
			"Location": "PLUS",
			"Product": "000000000000000011",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "LINEAR",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "NONE"
		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1520",
			"Product": "S_44A230",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : false,
			"OptAlgorithm" : "GD",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "NONE",
			"startDate": "2023-10-20",
            "endDate": "2023-10-27"
		}
	]
}


### generate Optimizations
POST http://localhost:4004/pal/genOptimizations
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwLWRlbW8tYWFrdms0ZnQuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0yNzM4NTk4NjMiLCJ0eXAiOiJKV1QiLCJqaWQiOiAibklpbWppaGNwcktLS0w4d2VsWTV5V2x3VDRscSsrRSt5bzVnTHdXRVVsTT0ifQ.eyJqdGkiOiIzNDk0ZTJjNzdkMGY0NjExYjA4MWJmODg4MzMxM2Q4NCIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiJmYjY5YjRhMy02NTNhLTQxZmYtOWRiYy0yZGI5NDQ3MmE3NDMiLCJ6ZG4iOiJ2Y3AtZGVtby1hYWt2azRmdCJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLXNicHZjcGRlbW8tdGVzdCF0ODQzOTQiLCJhdXRob3JpdGllcyI6WyJ1YWEucmVzb3VyY2UiXSwic2NvcGUiOlsidWFhLnJlc291cmNlIl0sImNsaWVudF9pZCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImNpZCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJyZXZfc2lnIjoiY2I5OTEyZGYiLCJpYXQiOjE3MjQyNDY0OTgsImV4cCI6MTcyNDI1MDA5OCwiaXNzIjoiaHR0cHM6Ly92Y3AtZGVtby1hYWt2azRmdC5hdXRoZW50aWNhdGlvbi51czEwLmhhbmEub25kZW1hbmQuY29tL29hdXRoL3Rva2VuIiwiemlkIjoiZmI2OWI0YTMtNjUzYS00MWZmLTlkYmMtMmRiOTQ0NzJhNzQzIiwiYXVkIjpbInVhYSIsInNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCJdfQ.YiAjrsVR75nscogmRMndgJWUDzEBkMpL9EtZNwg292MaoJaOL4_mkgWXUKhQa7QBHgdGrjSsMbI9KnxIkI0qbSfVHjEMpjunmqrkmhqeqm-Plg8w0dsjDCsgWoYnuBbvnwO-cKUgUh7V9HWuZ_QRKzJ1PawQUZWeALJcwlbp_k4NhRHHgOqFbO4bOWmQ1vVRyYkGL2hGv35qcNgzcSBpSZO2SAYF22o7DCGB11zOinbG2eVmy6RNlx2kFbKW4y08ILVk2BN-mQBhazLuQN1Sog3_7yY7qq0NK-APZolgVsU_MIKGHOdzqy8-Ibf6CN7WzQz5xlwb0AvMS6F2VhZcTQ

{
	"optimizationsList": [
		{
			"Location": "PLUS",
			"Product": "000000000000000029",
			"Type": "PI",
			"modelVersion" : "Active",
 			"version": "__BASELINE",
			"scenario": "_PLAN",
			"OptAlgorithm": "LINEAR",
			"OptFactor" : 0.9,
			"startDate": "2024-08-26",
            "endDate": "2024-10-30"
		}
	]
}


### generate Optimizations
POST http://localhost:4004/pal/genOptimizations
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwLWRlbW8tYWFrdms0ZnQuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0yNzM4NTk4NjMiLCJ0eXAiOiJKV1QiLCJqaWQiOiAibklpbWppaGNwcktLS0w4d2VsWTV5V2x3VDRscSsrRSt5bzVnTHdXRVVsTT0ifQ.eyJqdGkiOiIzNDk0ZTJjNzdkMGY0NjExYjA4MWJmODg4MzMxM2Q4NCIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiJmYjY5YjRhMy02NTNhLTQxZmYtOWRiYy0yZGI5NDQ3MmE3NDMiLCJ6ZG4iOiJ2Y3AtZGVtby1hYWt2azRmdCJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLXNicHZjcGRlbW8tdGVzdCF0ODQzOTQiLCJhdXRob3JpdGllcyI6WyJ1YWEucmVzb3VyY2UiXSwic2NvcGUiOlsidWFhLnJlc291cmNlIl0sImNsaWVudF9pZCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImNpZCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJyZXZfc2lnIjoiY2I5OTEyZGYiLCJpYXQiOjE3MjQyNDY0OTgsImV4cCI6MTcyNDI1MDA5OCwiaXNzIjoiaHR0cHM6Ly92Y3AtZGVtby1hYWt2azRmdC5hdXRoZW50aWNhdGlvbi51czEwLmhhbmEub25kZW1hbmQuY29tL29hdXRoL3Rva2VuIiwiemlkIjoiZmI2OWI0YTMtNjUzYS00MWZmLTlkYmMtMmRiOTQ0NzJhNzQzIiwiYXVkIjpbInVhYSIsInNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCJdfQ.YiAjrsVR75nscogmRMndgJWUDzEBkMpL9EtZNwg292MaoJaOL4_mkgWXUKhQa7QBHgdGrjSsMbI9KnxIkI0qbSfVHjEMpjunmqrkmhqeqm-Plg8w0dsjDCsgWoYnuBbvnwO-cKUgUh7V9HWuZ_QRKzJ1PawQUZWeALJcwlbp_k4NhRHHgOqFbO4bOWmQ1vVRyYkGL2hGv35qcNgzcSBpSZO2SAYF22o7DCGB11zOinbG2eVmy6RNlx2kFbKW4y08ILVk2BN-mQBhazLuQN1Sog3_7yY7qq0NK-APZolgVsU_MIKGHOdzqy8-Ibf6CN7WzQz5xlwb0AvMS6F2VhZcTQ

{
	"optimizationsList": [
		{
			"Location": "PUS1",
			"Product": "000000000000003041",
			"Type": "PI",
			"modelVersion" : "Active",
 			"version": "__BASELINE",
			"scenario": "_PLAN",
			"OptAlgorithm": "LINEAR",
			"OptFactor" : 0.9,
			"startDate": "2024-09-02",
            "endDate": "2024-09-02"
		}
	]
}


### generate Optimizations
POST http://localhost:4004/pal/genOptimizations
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwLWRlbW8tYWFrdms0ZnQuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0yNzM4NTk4NjMiLCJ0eXAiOiJKV1QiLCJqaWQiOiAibklpbWppaGNwcktLS0w4d2VsWTV5V2x3VDRscSsrRSt5bzVnTHdXRVVsTT0ifQ.eyJqdGkiOiIzNDk0ZTJjNzdkMGY0NjExYjA4MWJmODg4MzMxM2Q4NCIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiJmYjY5YjRhMy02NTNhLTQxZmYtOWRiYy0yZGI5NDQ3MmE3NDMiLCJ6ZG4iOiJ2Y3AtZGVtby1hYWt2azRmdCJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLXNicHZjcGRlbW8tdGVzdCF0ODQzOTQiLCJhdXRob3JpdGllcyI6WyJ1YWEucmVzb3VyY2UiXSwic2NvcGUiOlsidWFhLnJlc291cmNlIl0sImNsaWVudF9pZCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImNpZCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCIsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJyZXZfc2lnIjoiY2I5OTEyZGYiLCJpYXQiOjE3MjQyNDY0OTgsImV4cCI6MTcyNDI1MDA5OCwiaXNzIjoiaHR0cHM6Ly92Y3AtZGVtby1hYWt2azRmdC5hdXRoZW50aWNhdGlvbi51czEwLmhhbmEub25kZW1hbmQuY29tL29hdXRoL3Rva2VuIiwiemlkIjoiZmI2OWI0YTMtNjUzYS00MWZmLTlkYmMtMmRiOTQ0NzJhNzQzIiwiYXVkIjpbInVhYSIsInNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtc2JwdmNwZGVtby10ZXN0IXQ4NDM5NCJdfQ.YiAjrsVR75nscogmRMndgJWUDzEBkMpL9EtZNwg292MaoJaOL4_mkgWXUKhQa7QBHgdGrjSsMbI9KnxIkI0qbSfVHjEMpjunmqrkmhqeqm-Plg8w0dsjDCsgWoYnuBbvnwO-cKUgUh7V9HWuZ_QRKzJ1PawQUZWeALJcwlbp_k4NhRHHgOqFbO4bOWmQ1vVRyYkGL2hGv35qcNgzcSBpSZO2SAYF22o7DCGB11zOinbG2eVmy6RNlx2kFbKW4y08ILVk2BN-mQBhazLuQN1Sog3_7yY7qq0NK-APZolgVsU_MIKGHOdzqy8-Ibf6CN7WzQz5xlwb0AvMS6F2VhZcTQ

{
	"optimizationsList": [
		{
			"Location": "PUS1",
			"Product": "000000000000003041",
			"Type": "PI",
			"modelVersion" : "Active",
 			"version": "__BASELINE",
			"scenario": "_PLAN",
			"OptAlgorithm": "LINEAR",
			"OptFactor" : 0.9
		}
	]
}


### generate Optimizations
POST http://localhost:4004/OData/v4/pal/genOptimizations
Content-Type: application/json

{
	"optimizationsList": [
		{
			"Location": "PLUS",
			"Product": "000000000000000029",
			"Type": "PI",
			"modelVersion" : "Active",
 			"version": "__BASELINE",
			"scenario": "_PLAN",
			"OptAlgorithm": "GD",
			"OptFactor" : 0.9,
			"startDate": "2024-06-01",
            "endDate": "2024-06-15"
		}
	]
}

### generate Optimizations
POST http://localhost:4004/pal/genOptimizations
Content-Type: application/json

{
	"optimizationsList": [
		{
			"Location": "1520",
			"Product": "S_44A230",
			"Type": "PI",
			"modelVersion" : "Active",
 			"version": "__BASELINE",
			"scenario": "_PLAN",
			"OptAlgorithm": "GD",
			"OptFactor" : 0.9,
			"startDate": "2023-12-18",
            "endDate": "2023-12-18"
		}
	]
}


### generate Models
POST http://localhost:4004/pal/genFutureOptions
Content-Type: application/json
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogImRXNDZRMGk2RFd5Q1VQaTlMaFdJYStpN1V4ZmQ4RitXQ2YwOWFBajA4eGs9In0.eyJqdGkiOiJkMjAxZDFkZmQxN2M0ZThlOTNiMmIyNmVkYzVhZGE5YyIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxMDMxNjEzLCJleHAiOjE3MjEwMzUyMTMsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.UDJNGVI-q2fvWs9veTTfLz_FM6BPic-0osDUNWG5uM6fjfg3JsQZF7T3-XoUT4eK1sBgEb0CuVpzRNuxr9rv4A3yfPBZAxFGPw-TSg6KklVSwJMA4DtqPXGzSwvISO2eeikCQ3hhlSWfbnr0C-SeS3cW-V5R2H0DTt9xfoBMY9GgtZQBplvVNCL22MJHasQ49AohfHSeb_sY34YBCgIhTqXtVVRXzFR9WUmObGJ9UTotSFAIp7kLJpWmTgsaDfU8wbZL70VaE0dEFq-uFmnEjpwGynxVB0J2PZngPOCPaLXbQNc0Bfv4-Nb88Za8dM__P4eFENsKtwWug3tsGzWMHA'

{
	"vcRulesList": [
		{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "PUS1",
			"Product": "000000000000003041",
			"Customer": "01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		}
	]
}

### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogImdyT2JGVy9PMGxZM2M5L05tYm5EWDFrY3RhdWJ1d2VmODZnaWVQU2RZWEU9In0.eyJqdGkiOiJlMmE1OTgzYTY3YWI0ZjY5OWQ4ZWUwZDFkYzVkZDgxZiIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIzMDcwMzUyLCJleHAiOjE3MjMwNzM5NTIsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.KXxUZC7x9ZBI-y7CufY_XFKie2oMEq9XGezpiGUuYP1LFgh2V-eBh-PueUwtP_qvb76kTTM4GTyDDPmsp0sb4sM_DUqfJ6mEjYrD5hkiwKiGR1QQB1lpyBOT5C7SSXQsW3cuc1DlSaGy596ZPglV2sLKEhFi74V8YrtkA7P6Uu7NNai6VAFxWOd7uVykkMk3E0Xk551C8qti5NyJXHqvWkatHagoEfahBxiYRoF5Dqvdlz4TexdaXfLQH3kenVvADbXIOAFTlosZbXdPU11JIiMqDyFr4TR77g67033lrFKAHNIrqyHl6eZwC-7qg9iXpumVM3SAAtgsT1Z5N-lZ9w'

{
	"vcRulesList": [
		{
			"profile": "SBP_VARMA_0",
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000011",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}


### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIm5vRDIyZVZTSEtIV21sWVFTek9VMlNaUExSS3FGcnJ1N093eG1NOHI3N1E9In0.eyJqdGkiOiI4OGNhYzY1MThiNTE0N2FhYmIwNzZmMTA5YjUzZmQ5ZiIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxNzMyNTEwLCJleHAiOjE3MjE3MzYxMTAsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.bxnTNL4_-tcpd7kTgthKxRupGq1OqIiHLhA5107wd1apP8wIJA165xrXEVjkgR8UFq20h4ksDkniLG7oxslsMPa7DwjeuGCM48J_QisRHfCb6ZO39eZBkh4H5-6q92hPhKNqGm1WxEZj_7tjnZIlIjMRd0AKv4pa7VUodJsFNl3jFuEtMJUhARsx2uC4zvrWtD4i7YSY2M5HI2qQqPcLqyf5jaPqUCzPllxOMDUJllzdn7-yYjmljnnv3YdR9862P9297onuaXN2tPOPzZ2famFoOd4SiIsfz6ByB8z9ecO5V-e3Vgp_RT8Gok1hpthVZzqYw6vKz5o_LXF0wdE5qA'

{
	"vcRulesList": [
		{
			"profile": "SBP_HGBT_1",
			"override": true,
			"Location": "PLUS",
			"Product": "000&&!!$#(0000011",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIkRkb1V0NGRwRUZtWTVmTWFpMTErQXJYd0lZaHJ2SG85a3NBZHEzRmxQa2c9In0.eyJqdGkiOiI1NGRhYWRkNTg2MGE0NDgyYWVlNDdhZjU5ZGEyNzVjOCIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxODI0OTk2LCJleHAiOjE3MjE4Mjg1OTYsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.fdFGzbsBo2LHMJr6k0dgoE4M8mVtaeZdvQUHlJXvLVHDnq3u8BrajG9uVnR2ZT6KzVUYhuV5isaw6WZhmJSq6bUzaGvPumpXUP-1LitVeXytOCAEV3MutsJX1YGMnMnruobXEpmDaiHcGjVkrTn7eJB5mhLorZiIKn1QE9jEpV11UeOitqup27a7Hp_LJsgUrZPhv3LIuyfqKW83UTCdEgO9PyBR3E4MpQEERKB0WYuKU3jWo6MMhgIGYtNSyMM2WopNVW8aBpUAKN1f5ZCJSY1ns0nUUbBzqt9I-0pbKX3W9-MqDVPPwGoXJwrUJdFBXb9-CG2cthiwyw6qU3fwzA

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000011",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : false,
			"OptAlgorithm" : "None",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "None"
		}
	]
}


### generate Models
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/generateModels
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIkkwM2huaFVXOWx3cFZYRWp5OGpQN1pidUtCQmx3eE5yYkxSRDRrU3lpRUU9In0.eyJqdGkiOiIwNThlZWZhYzFmMzk0ZGM3YTBlOGNkOWE0YTQ1NzcwYSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxMjY5NTg1LCJleHAiOjE3MjEyNzMxODUsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.FgO_fa9_JWq-JIt0rwExHOUuNMzg7dTasc1sClHGZfRtiwtoH6nYLTe64SiAIF3a05HznUa_BSLfRsgQQUtSh32oYRG3VPMmf2v95oaynpjOnt6jEvN18HR1EV-ahy-sXy0dNG4ozuZLU9HHpOfiRmrBwTWdlGkYYiW-ePMWsn6xDH6cTAkxvIuaVXGrrQFE4tFnM_aAnPkOBWiRIo7fZli3KOqaVAgFXc_sB6cumYRoLMPhfaLPZIOUbTj01C3a0tKP1R8TDIrma8OoZJae8e__831xhsNB4NtokQcPzh-_1PbwB7eX02mYNCjOCwxeOVlE0WBW0dbNwSFObIFevw

{
	"vcRulesList": [
		{
			"profile": "SBP_HGBT_1",
			"override": true,
			"Location": "PLUS",
			"Product": "000&&!!$#(0000011",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}

### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIkkwM2huaFVXOWx3cFZYRWp5OGpQN1pidUtCQmx3eE5yYkxSRDRrU3lpRUU9In0.eyJqdGkiOiIwNThlZWZhYzFmMzk0ZGM3YTBlOGNkOWE0YTQ1NzcwYSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxMjY5NTg1LCJleHAiOjE3MjEyNzMxODUsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.FgO_fa9_JWq-JIt0rwExHOUuNMzg7dTasc1sClHGZfRtiwtoH6nYLTe64SiAIF3a05HznUa_BSLfRsgQQUtSh32oYRG3VPMmf2v95oaynpjOnt6jEvN18HR1EV-ahy-sXy0dNG4ozuZLU9HHpOfiRmrBwTWdlGkYYiW-ePMWsn6xDH6cTAkxvIuaVXGrrQFE4tFnM_aAnPkOBWiRIo7fZli3KOqaVAgFXc_sB6cumYRoLMPhfaLPZIOUbTj01C3a0tKP1R8TDIrma8OoZJae8e__831xhsNB4NtokQcPzh-_1PbwB7eX02mYNCjOCwxeOVlE0WBW0dbNwSFObIFevw

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLUS",
			"Product": "000&&!!$#(0000011",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : false,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "NONE"
		}
	]
}

### generate Optimizations
POST http://localhost:4004/pal/genOptimizations
Content-Type: application/json
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogImRXNDZRMGk2RFd5Q1VQaTlMaFdJYStpN1V4ZmQ4RitXQ2YwOWFBajA4eGs9In0.eyJqdGkiOiJkMjAxZDFkZmQxN2M0ZThlOTNiMmIyNmVkYzVhZGE5YyIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxMDMxNjEzLCJleHAiOjE3MjEwMzUyMTMsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.UDJNGVI-q2fvWs9veTTfLz_FM6BPic-0osDUNWG5uM6fjfg3JsQZF7T3-XoUT4eK1sBgEb0CuVpzRNuxr9rv4A3yfPBZAxFGPw-TSg6KklVSwJMA4DtqPXGzSwvISO2eeikCQ3hhlSWfbnr0C-SeS3cW-V5R2H0DTt9xfoBMY9GgtZQBplvVNCL22MJHasQ49AohfHSeb_sY34YBCgIhTqXtVVRXzFR9WUmObGJ9UTotSFAIp7kLJpWmTgsaDfU8wbZL70VaE0dEFq-uFmnEjpwGynxVB0J2PZngPOCPaLXbQNc0Bfv4-Nb88Za8dM__P4eFENsKtwWug3tsGzWMHA'

{
	"optimizationsList": [
		{
			"Location": "PUS1",
			"Product": "000000000000003041",
			"Type": "PI",
			"modelVersion" : "Active",
 			"version": "__BASELINE",
			"scenario": "_PLAN",
			"OptAlgorithm": "GD",
			"OptFactor" : 0.9,
			"startDate": "2024-07-15",
            "endDate": "2025-01-15"
		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json
Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogImRXNDZRMGk2RFd5Q1VQaTlMaFdJYStpN1V4ZmQ4RitXQ2YwOWFBajA4eGs9In0.eyJqdGkiOiJkMjAxZDFkZmQxN2M0ZThlOTNiMmIyNmVkYzVhZGE5YyIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiYXV0aG9yaXRpZXMiOlsidWFhLnJlc291cmNlIl0sInNjb3BlIjpbInVhYS5yZXNvdXJjZSJdLCJjbGllbnRfaWQiOiJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiY2lkIjoic2ItY29uZmlncHJvZHVjdHNvYXV0aC1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3Rzb2F1dGgtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwicmV2X3NpZyI6IjdhODhmNzI0IiwiaWF0IjoxNzIxMDMxNjEzLCJleHAiOjE3MjEwMzUyMTMsImlzcyI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjlkMTJmNmZkLWJkZmQtNGIyMC05OGE2LTU5OTNmYmEzODUzNCIsImF1ZCI6WyJ1YWEiLCJzYi1jb25maWdwcm9kdWN0c29hdXRoLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3Il19.UDJNGVI-q2fvWs9veTTfLz_FM6BPic-0osDUNWG5uM6fjfg3JsQZF7T3-XoUT4eK1sBgEb0CuVpzRNuxr9rv4A3yfPBZAxFGPw-TSg6KklVSwJMA4DtqPXGzSwvISO2eeikCQ3hhlSWfbnr0C-SeS3cW-V5R2H0DTt9xfoBMY9GgtZQBplvVNCL22MJHasQ49AohfHSeb_sY34YBCgIhTqXtVVRXzFR9WUmObGJ9UTotSFAIp7kLJpWmTgsaDfU8wbZL70VaE0dEFq-uFmnEjpwGynxVB0J2PZngPOCPaLXbQNc0Bfv4-Nb88Za8dM__P4eFENsKtwWug3tsGzWMHA'

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PUS1",
			"Product": "000000000000003041",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 0.9,
			"startDate": "2024-07-15",
            "endDate": "2024-07-15"
		}
	]
}



### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000011",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "GD",
			"OptFactor" : 0.9,
			"startDate": "2024-05-06",
            "endDate": "2024-09-20"
		}
	]
}

### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000029",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "GD",
			"OptFactor" : 0.9,
			"startDate": "2024-05-06",
            "endDate": "2024-05-06"
		}
	]
}

### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1710",
			"Product": "ALL",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "SLSQP",
			"OptFactor" : 1,
			"DsAlgorithm" : "NONE"
		}
	]
}



### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIlVrR1pteGtuVzE3dmErSnczekVhUHl5elZyUDdwMklZaEYrYkR6NSs5VUk9In0.eyJqdGkiOiJiYjFjMDk5MzYzZmI0OTYxYWI5Y2U5MTkzZWM4OTBhOSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0cy1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF1dGhvcml0aWVzIjpbInVhYS5yZXNvdXJjZSJdLCJzY29wZSI6WyJ1YWEucmVzb3VyY2UiXSwiY2xpZW50X2lkIjoic2ItY29uZmlncHJvZHVjdHMtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJjaWQiOiJzYi1jb25maWdwcm9kdWN0cy1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3RzLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiJhNDg3ZGI5NCIsImlhdCI6MTcyNDkyNjU1OSwiZXhwIjoxNzI0OTY5NzU5LCJpc3MiOiJodHRwczovL3ZjcHByb3ZpZGVyLXNjMGplb2pxLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJhdWQiOlsidWFhIiwic2ItY29uZmlncHJvZHVjdHMtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciXX0.YxLtwUHNkxwbpZr1ZthqE_UdH3GOM1otv86c61uzt7DppweZReqWgEjNcEBmhFXP2nnRw-Y86QvOojDil8v_g3RlcbGlyzrk7KLZsFY6wVyNqNGJ-xnmNVvIskgRuw4TsbKuwzotyUNY5S1s3wMNYJRFH-leS2au9x4iQDfvqMhJ79TVWibI-FV6tagVeVJ1DjGJpU6LQG1ygJHEtUueHQ23buFUjHFZlo7T2QqaFbvhXgB67v-BGUuyVO10IWRSd9ehnrmkvZR1PChGRw0kiYqQb-3ibXTEg__ReVqlhjtcZpXWdV7zJhxxpN74Iu9miqSLTtwtOL6kYmMWNzD3HQ

{
		"vcRulesList": [
		{
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000029",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "LINEAR_GD",
			"OptFactor" : 0.9,
			"startDate": "2024-08-29",
            "endDate": "2024-09-10"
		}
	]
}

### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json

{
		"vcRulesList": [
		{
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000029",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "LINEAR_GD",
			"OptFactor" : 0.9
		},
		{
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000011",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "LINEAR_GD",
			"OptFactor" : 0.9
		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vdmNwcHJvdmlkZXItc2MwamVvanEuYXV0aGVudGljYXRpb24udXMxMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xMzEwMjc2Njc2IiwidHlwIjoiSldUIiwiamlkIjogIlVrR1pteGtuVzE3dmErSnczekVhUHl5elZyUDdwMklZaEYrYkR6NSs5VUk9In0.eyJqdGkiOiJiYjFjMDk5MzYzZmI0OTYxYWI5Y2U5MTkzZWM4OTBhOSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJ6ZG4iOiJ2Y3Bwcm92aWRlci1zYzBqZW9qcSJ9LCJzdWIiOiJzYi1jb25maWdwcm9kdWN0cy1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF1dGhvcml0aWVzIjpbInVhYS5yZXNvdXJjZSJdLCJzY29wZSI6WyJ1YWEucmVzb3VyY2UiXSwiY2xpZW50X2lkIjoic2ItY29uZmlncHJvZHVjdHMtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciLCJjaWQiOiJzYi1jb25maWdwcm9kdWN0cy1TQlBCVFBfdmNwcHJvdmlkZXItc2MwamVvanEtZGV2IXQ5NDQyNyIsImF6cCI6InNiLWNvbmZpZ3Byb2R1Y3RzLVNCUEJUUF92Y3Bwcm92aWRlci1zYzBqZW9qcS1kZXYhdDk0NDI3IiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiJhNDg3ZGI5NCIsImlhdCI6MTcyNDkyNjU1OSwiZXhwIjoxNzI0OTY5NzU5LCJpc3MiOiJodHRwczovL3ZjcHByb3ZpZGVyLXNjMGplb2pxLmF1dGhlbnRpY2F0aW9uLnVzMTAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiI5ZDEyZjZmZC1iZGZkLTRiMjAtOThhNi01OTkzZmJhMzg1MzQiLCJhdWQiOlsidWFhIiwic2ItY29uZmlncHJvZHVjdHMtU0JQQlRQX3ZjcHByb3ZpZGVyLXNjMGplb2pxLWRldiF0OTQ0MjciXX0.YxLtwUHNkxwbpZr1ZthqE_UdH3GOM1otv86c61uzt7DppweZReqWgEjNcEBmhFXP2nnRw-Y86QvOojDil8v_g3RlcbGlyzrk7KLZsFY6wVyNqNGJ-xnmNVvIskgRuw4TsbKuwzotyUNY5S1s3wMNYJRFH-leS2au9x4iQDfvqMhJ79TVWibI-FV6tagVeVJ1DjGJpU6LQG1ygJHEtUueHQ23buFUjHFZlo7T2QqaFbvhXgB67v-BGUuyVO10IWRSd9ehnrmkvZR1PChGRw0kiYqQb-3ibXTEg__ReVqlhjtcZpXWdV7zJhxxpN74Iu9miqSLTtwtOL6kYmMWNzD3HQ

{
		"vcRulesList": [
		{
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000011",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "LINEAR_GD",
			"OptFactor" : 0.9,
			"startDate": "2024-08-29",
            "endDate": "2024-09-10"
		}
	]
}

### generate Predictions
POST http://localhost:4004/Odata/v4/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLUS",
			"Product": "000000000000000011",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "LINEAR",
			"OptFactor" : 0.9,
			"startDate": "2024-06-11",
            "endDate": "2024-06-20"
		}
	]
}

### generate Models
POST http://localhost:4004/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AES_TESM",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}


### generate Models
POST http://localhost:4004/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"Customer": "01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active"
		}
	]
}

### generate Models
POST http://localhost:4004/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AES_TESM",
			"override": true,
			"Location": "1520",
			"Product": "VCP_200",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active"
		}
	]
}


### generate Future Options
POST http://localhost:4004/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"Customer": "01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "UPSIDE",
			"Scenario": "_PLAN"
		}
	]
}



### generate Future Options
POST http://localhost:4004/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
			{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"Customer":"01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		}
	]
}


### generate Future Options
POST http://localhost:4004/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AES_TESM",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"Customer":"01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		},
		{
			"profile": "SBP_AES_TESM",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002251",
			"Customer":"01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		},
		{
			"profile": "SBP_AES_TESM",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"Customer":"02",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		},
		{
			"profile": "SBP_AES_TESM",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002251",
			"Customer":"02",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		}
	]
}




### generate Future Options
POST http://localhost:4004/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
			{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"Customer":"01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		},
		{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002251",
			"Customer":"01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		},
		{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"Customer":"02",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		},
		{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002251",
			"Customer":"02",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		}

	]
}



### generate Future Options
POST http://localhost:4004/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"Customer":"01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		}

	]
}


### generate Future Options
POST http://localhost:4004/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
			{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"Customer":"01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		},
		{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002251",
			"Customer":"01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		}

	]
}

### generate Future Options
POST http://localhost:4004/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002251",
			"Customer": "01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		}
	]
}


### generate Models
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"Customer": "01",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		}
	]
}


### generate Models
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AES_AUTO",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002251",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"Version": "__BASELINE",
			"Scenario": "_PLAN"
		}
	]
}

### generate Future Options
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genFutureOptions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AES_TESM",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002251",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}


### generate Models
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_HGBT_1",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002251",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}




### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_HGBT_1",
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}


### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_VARMA_0",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}


### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_VARMA_0",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002262",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1520",
			"Product": "VCP_200",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 1,
			"DsAlgorithm" : "NONE"
		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1710",
			"Product": "0000000000000000000000000000000000002250",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "LINEAR",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "NONE"
		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1710",
			"Product": "000000000000002262",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 1,
			"DsAlgorithm" : "NONE"
		}
	]
}

### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1520",
			"Product": "VCP_200",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : false,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 1,
			"DsAlgorithm" : "NONE"
		}
	]
}

### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : false,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 1,
			"DsAlgorithm" : "NONE"
		}
	]
}

### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1710",
			"Product": "000000000000002262",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : false,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 1,
			"DsAlgorithm" : "NONE"
		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "NONE",
			"OptFactor" : 1,
			"DsAlgorithm" : "NONE",
			"startDate": "2025-07-14",
            "endDate": "2025-07-14"
		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "SLSQP",
			"OptFactor" : 0.8,
			"DsAlgorithm" : "NONE",
			"startDate": "2023-11-10",
            "endDate": "2023-11-17"
		}
	]
}


### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "SLSQP",
			"OptFactor" : 0.8,
			"DsAlgorithm" : "NONE"
		}
	]
}
### generate Predictions

POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"impactAnalysis": true,
			"Location": "1710",
			"Product": "000000000000002242",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN"
		}
	]
}

### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"impactAnalysis": true,
			"Location": "1710",
			"Product": "000000000000002242",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN"
		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": false,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN"

		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "AS01",
			"Product": "000000000000000059",
			"GroupID": "33_1",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN"

		}
	]
}

### generate Optimizations
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genOptimizations
Content-Type: application/json

{
	"optimizationsList": [
		{
			"Location": "1710",
			"Product": "000000000000002262",
			"Type": "PI",
			"ModelVersion" : "Active",
 			"Version": "__BASELINE",
			"Scenario": "_PLAN",
			"Algorithm": "GD",
            "StartDate": "2023-12-20",
            "EndDate": "2023-12-31"
		}
	]
}

### generate Optimizations
POST http://localhost:4004/pal/genOptimizations
Content-Type: application/json

{
	"optimizationsList": [
		{
			"Location": "1520",
			"Product": "S_44A230",
			"Type": "PI",
			"modelVersion" : "Active",
 			"version": "__BASELINE",
			"scenario": "_PLAN",
			"OptAlgorithm": "LINEAR",
			"OptFactor" : 0.9,
            "startDate": "2023-10-09",
            "endDate": "2023-10-09",
			"initPredictions": false,
			"minFactor": 0.4
		}
	]
}


### generate Optimizations
POST http://localhost:4004/pal/genOptimizations
Content-Type: application/json

{
	"optimizationsList": [
		{
			"Location": "1520",
			"Product": "VCP_210",
			"Type": "PI",
			"modelVersion" : "Active",
 			"version": "__BASELINE",
			"scenario": "_PLAN",
			"OptAlgorithm": "LINEAR",
			"OptFactor" : 0.9,
            "startDate": "2023-10-09",
            "endDate": "2023-10-09",
			"initPredictions": false,
			"minFactor": 0.7
		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1520",
			"Product": "VCP_210",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "GD",
			"OptFactor" : 0.6,
			"DsAlgorithm" : "NONE"
		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1520",
			"Product": "S_44A230",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "GD",
			"OptFactor" : 0.9,
			"DsAlgorithm" : "NONE",
			"startDate": "2023-10-09",
            "endDate": "2023-10-09"
		}
	]
}


### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_HGBT_0",
			"override": false,
			"Location": "PL20",
			"Product": "534EDPI0E131",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}

### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "1520",
			"Product": "S_44A230",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}



### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_HGBT_1",
			"override": true,
			"Location": "PLBE",
			"Product": "000000000000000062",
			"GroupID": "3471_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}

### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_HGBT_1",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002262",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active"
		},
		{
			"profile": "SBP_MLR_1",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002262",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_RDT_0",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active"

		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"

		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": false,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true

		},
				{
			"override": false,
			"Location": "1710",
			"Product": "000000000000002262",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true

		}
	]
}


### generate Models
POST http://localhost:4004/pal/purgePredictionModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI"
		},
		{
			"Location": "1710",
			"Product": "000000000000002262",
			"GroupID": "ALL",
			"Type": "PI"
		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": false,
			"Location": "1710",
			"Product": "000000000000002242",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN"
		}
	]
}

### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_HGBT_1",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_HGBT_1",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002262",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}



### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true
		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"impactAnalysis" : true,
			"OptAlgorithm" : "LINEAR",
			"OptFactor" : 0.8,
			"DsAlgorithm" : "NONE"
		}
	]
}


### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_HGBT_1",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}

### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_MLR_0",
			"override": true,
			"Location": "1710",
			"Product": "000000000000002261",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active"
		}
	]
}

### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}

### generate Predictions
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "3511_1",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "_PLAN"
		}
	]
}

### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "13_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "15_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}


### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "13_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "15_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "17_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "19_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "21_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "23_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "25_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "27_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "29_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "31_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "33_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "35_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "37_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "39_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "42_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "44_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "46_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "48_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "50_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "56_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "58_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "60_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "63_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
		{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "65_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "67_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "69_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "73_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "75_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "79_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "82_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "84_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "87_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "91_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "94_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "96_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "98_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "101_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "104_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "106_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "109_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "117_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		},
				{
			"profile": "SBP_AUTOML_1",
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000055",
			"GroupID": "120_1",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
		
	]
}


### generate Models
POST https://sbpbtp-vcpprovider-sc0jeojq-dev-config-products-srv.cfapps.us10.hana.ondemand.com/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_MLR_1",
			"override": true,
			"Location": "1520",
			"Product": "VCP_200",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}


### generate Models
POST http://localhost:4004/pal/generateModels
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_MLR_1",
			"override": true,
			"Location": "ALL",
			"Product": "ALL",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation"
		}
	]
}




### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": false,
			"Location": "PL20",
			"Product": "534EDPI0E131",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "BSL_SCENARIO",
            "startDate": "2022-11-21",
            "endDate": "2022-12-28"

		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PL20",
			"Product": "534EDPI0E119",
			"GroupID": "534EDPI0E119_2741",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "BSL_SCENARIO",
            "startDate" : "2022-10-24"
		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PL20",
			"Product": "534EDPI0E119",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "BSL_SCENARIO",
            "startDate" : "2022-10-24"
		}
	]
}



### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "AS01",
			"Product": "000000000000000059",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"startDate" : "2023-05-15",
			"endDate": "2023-07-31"

		},
		{
			"override": true,
			"Location": "AS01",
			"Product": "000000000000000069",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"startDate" : "2023-05-15",
			"endDate": "2023-07-31"

		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000074",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"startDate" : "2023-07-01",
			"endDate": "2024-01-22"

		}
	]
}




### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000077",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"startDate" : "2023-07-01",
			"endDate": "2024-01-22"

		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "3710",
			"Product": "IBP-100",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN"
        }
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLDE",
			"Product": "000000000000000078",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"startDate" : "2023-07-03",
			"endDate": "2024-01-31"

		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLDE",
			"Product": "000000000000000078",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN",
			"startDate" : "2023-01-30",
			"endDate": "2023-06-30"

		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000074",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN"

		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLSE",
			"Product": "000000000000000077",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN"

		}
	]
}

### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "PLDE",
			"Product": "000000000000000078",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Active",
			"version": "__BASELINE",
			"scenario": "_PLAN"

		}
	]
}


### generate Predictions
POST http://localhost:4004/pal/genPredictions
Content-Type: application/json

{
	"vcRulesList": [
		{
			"override": true,
			"Location": "ALL",
			"Product": "ALL",
			"GroupID": "ALL",
			"Type": "PI",
			"modelVersion": "Simulation",
			"version": "__BASELINE",
			"scenario": "_PLAN"

		}
	]
}

### generate Clusters Input Data
POST http://localhost:4004/pal/genClusterUniqueIDS
Content-Type: application/json

{
	"Location" : "PL20",
	"Product" : "ALL",
	"ProdType": true
}

### generate Clusters Input Data
POST http://localhost:4004/pal/genClusterUniqueIDS
Content-Type: application/json

{
	"Location" : "PL20",
	"Product" : "534EDPI"
}


### generate Clusters Input Data
POST http://localhost:4004/pal/getClusterUniqueIDs
Content-Type: application/json

{
	"Location" : "PL20",
	"Product" : "534EDPI",
	"Profile" : "SBP_AHC_0",
	"UniqueId" : "212"
}

### generate UniqueId CharVals  Input Data
POST http://localhost:4004/pal/genUniqueIdCharVals
Content-Type: application/json

{
	"Location" : "PL20",
	"Product" : "534EDPI"
}


### generate UniqueId CharVals  Input Data
POST http://localhost:4004/pal/genUidCharValsForClusterResults
Content-Type: application/json

{
	"Location" : "PL20",
	"Product" : "534EDPI",
	"Profile" : "SBP_AHC_0"

}

### generate UniqueId CharVals  Input Data
GET http://localhost:4004/pal/fgenUniqueIdCharVals(Location='PL20',Product='534EDPI0E119')

### generate Clusters Input Data
GET http://localhost:4004/pal/fgenClusterUniqueIDS(Location='PL20',Product='ALL')


### generate Clusters
POST http://localhost:4004/pal/genClusters
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AHC_0",
			"override": false,
			"Location": "PL20",
			"Product": "534EDPI"
		}
	]
}


### generate Clusters
POST http://localhost:4004/pal/genClusters
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AHC_0",
			"override": false,
			"Location": "PLCN",
			"Product": "000000000000000057"
		}
	]
}

### generate Clusters
POST http://localhost:4004/pal/genClusters
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AHC_0",
			"override": false,
			"Location": "PL20",
			"Product": "534EDPI0E119"
		},
		{
			"profile": "SBP_AHC_0",
			"override": false,
			"Location": "PL20",
			"Product": "534EDPI0E131"
		},
		{
			"profile": "SBP_AHC_0",
			"override": false,
			"Location": "PL20",
			"Product": "534EDPI0E139"
		},
		{
			"profile": "SBP_AHC_0",
			"override": false,
			"Location": "PL20",
			"Product": "534EDPI0E161"
		},
		{
			"profile": "SBP_AHC_0",
			"override": false,
			"Location": "PL20",
			"Product": "534EDPI0E215"
		}
	]
}

### generate Clusters
POST http://localhost:4004/pal/genClusters
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AHC_0",
			"override": false,
			"Location": "PL20",
			"Product": "534EDPI"
		},
		{
			"profile": "SBP_AHC_0",
			"override": false,
			"Location": "PL20",
			"Product": "534ECPP"
		}
	]
}



### generate Clusters
POST http://localhost:4004/pal/genClusters
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AHC_1",
			"override": false,
			"Location": "PL20",
			"Product": "ALL"
		}
	]
}

### generate Clusters
POST http://localhost:4004/pal/genClusters
Content-Type: application/json

{
	"vcRulesList": [
		{
			"profile": "SBP_AHC_0",
			"override": true,
			"Location": "PLCN",
			"Product": "000000000000000057"
		}
	]
}



### Get Products
GET http://localhost:4004/catalog/generateTempUID(PROJECT_ID='PROJ000004',PRODUCT_ID='AS_A61A',DELFLAG='')





### post temp UID
GET http://localhost:4004/catalog/modifyVersionScenario(VS_DATA='',FLAG='C')


###

GET http://localhost:4004/jobs/createJobFeed(jobFeedName='Job Feed for Testing')