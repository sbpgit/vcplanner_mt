

using {IBPDemandsrv as external} from './external/IBPDemandsrv.csn';
using {IBPMasterDataAPI as externalPost} from './external/IBPMasterDataAPI.csn';
using {IBPChangeHistory as externalChlogPost} from './external/IBPChangeHistory.csn';
service IBPImportSrv @(impl : './lib/ibpimport-service.js', path: '/ibpimport-srv') {
   
    // actions for testing from CF/ jobscheduler 
     // Outbound to IBP
    action exportIBPMasterProd(LOCATION_ID : String(4));  
    // function exportIBPMasterProd(LOCATION_ID : String(4)) returns String; 
    action exportIBPLocation();
    action exportIBPCustomer();
    action exportIBPClass(CLASS_NUM: String(18));  
    action exportComponentReq(LOCATION_ID : String(4),PRODUCT_ID : String(40), VERSION : String(10), SCENARIO : String(32),FROMDATE: Date, TODATE: Date,CRITICALKEY :String(1));
    
    action exportIBPLocProd(LOCATION_ID : String(4));
    //  function exportIBPLocProd(LOCATION_ID : String(4)) returns String;
    action exportRestrDetails(LOCATION_ID: String(4)); 
    action exportIBPAssembly(LOCATION_ID : String(4),PRODUCT_ID : String(40));
    //  function exportIBPAssembly(LOCATION_ID : String(4)) returns String;
  
    action exportIBPSalesTrans(LocProdData: String);
    action exportIBPSeedOrdTrans(LocProdData: String);
    action exportActCompDemand(LocProdData: String);
    
    action exportRestrReq(LocProdData: String);
    action exportMktAuth(LocProdData: String);
    action exportIBPCIR(LocProdData: String); 
   //Inbound from BTP
    action generateFDemandQty_VCPIBP(LocProdData: String);//(LOCATION_ID : String(4), PRODUCT_ID : String(40)) returns String;//
    action generateFDemandQty(LocProdData: String);//(LOCATION_ID : String(4), PRODUCT_ID : String(40)) returns String;//
    action generateFCharPlan(LOCATION_ID : String(4), PRODUCT_ID : String(40), FROMDATE : Date, TODATE : Date);
    action generateMarketAuth( MARKETDATA : String);
    action generateDCFCharPlan(LocProdData: String);
    action exportIBPAssemblyComp(LOCATION_ID : String(4));
    action exportLocProdConfigAPI();
    action importIBPVersionScenarios();
    action exportComponentCoefficient(LocProdData:String);
    action exportCapacityConsumption(LocProdData:String);
    action exportRestrictionCapacity(LocProdData:String);
    
    action exportIBPResourceLoc(LocProdData:String);
    action exportIBPResource(LocProdData:String);
    action exportIBPProductionResource(LocProdData:String);
    

    // action importChngelogMktAuth();    

    function importibpversce() returns String; 
    function importChngelogMktAuth() returns String;
    function importComponentAvail() returns String;

// Testing
    // function exportComponentReq(LOCATION_ID : String(4),PRODUCT_ID : String(40),FROMDATE: Date, TODATE: Date,CRITICALKEY :String(1)) returns String;   
    function exportActCompDemandfn(LOCATION_ID : String(4), PRODUCT_ID : String(40), CRITICALKEY: String(1)) returns String;
    function exportIBPSalesTrans_fn(LOCATION_ID : String(4),PRODUCT_ID : String(40)) returns String;
    function exportRestrDetails_fn(LOCATION_ID : String(4)) returns String;
    // function exportIBPClass() returns String;  
    function generateDCFCharPlan_fn(LOCATION_ID : String(4), PRODUCT_ID : String(40)) returns String;
    function getIBPPlanPrefixApi() returns String;
    // function generateFDemandQty(LOCATION_ID : String(4), PRODUCT_ID : String(40)) returns String;//
    // function exportIBPMasterProd() returns String;
    // function exportIBPAssembly(LOCATION_ID : String(4)) returns String;
}
@protocol : 'rest'
service IbpImportRest {
}
