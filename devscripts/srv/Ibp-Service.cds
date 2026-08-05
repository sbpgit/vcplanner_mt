
// using {IBPDemandsrv as external} from './external/IBPDemandsrv.csn';
service IbpService @(impl : './lib/Ibp-Service.js') {
  action genMasterData() returns String;
  action genTxData() returns String;
  
}