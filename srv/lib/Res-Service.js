const cds = require('@sap/cds')
const { v1: uuidv1} = require('uuid')
const rp = require('request-promise')

// Begin of Resource Functions
const resFuncs = require('./res-utils.js');
// End of Resource functions

module.exports = srv => {
    srv.on('updateAppStats', async req => {
        return (await resFuncs._updateAppResourcesUsage(req, 'JOB_SCHEDULER', false));
      });
    srv.on('fupdateAppStats', async req => {
        return (await resFuncs._updateAppResourcesUsage(req, 'JOB_SCHEDULER', true));
    });

    srv.on('updateSysStats', async req => {
        return (await resFuncs._updateSysResourcesUsage(req, 'JOB_SCHEDULER', false));
      });
    srv.on('fupdateSysStats', async req => {
        return (await resFuncs._updateSysResourcesUsage(req, 'JOB_SCHEDULER', true));
    });

    srv.on('updateNodeStats', async req => {
        return (await resFuncs._updateNodeResourcesUsage(req, 'JOB_SCHEDULER', false));
      });
    srv.on('fupdateNodeStats', async req => {
        return (await resFuncs._updateNodeResourcesUsage(req, 'JOB_SCHEDULER', true));
    });

    srv.on('purgeResStats', async req => {
      return (await resFuncs._purgeResourceStats(req, false));
    })
  
    srv.on('fpurgeResStats', async req => {
      return (await resFuncs._purgeResourceStats(req, true));
    })
}


