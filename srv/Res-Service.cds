
using rs from '../db/resources-schema';


service ResService  @(impl : './lib/Res-Service.js', path: '/res'){
    entity appStats as projection on rs.APP_STATS;
    entity sysStats as projection on rs.SYS_STATS;
    entity nodeStats as projection on rs.NODE_STATS;

    action updateAppStats();
    function fUpdateAppStats() returns String;

    action updateSysStats();
    function fUpdateSysStats() returns String;

    action updateNodeStats();
    function fUpdateNodeStats() returns String;

    action purgeResStats();
    function fpurgeResStats() returns String;

}
