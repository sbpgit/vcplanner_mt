service SDIService @(impl : './lib/sdi-service.js', path: '/sdi') {    
    // function ImportECCLocProdfn() returns String; 
    action ImportECCLoc();// returns String;     
    action ImportECCProd();     
    action ImportECCCustGrp(); 
    action ImportECCBOM();     
    action ImportECCLocProd(); 
    action ImportECCODhdr() ; 
    action ImportECCProdClass(); 
    action ImportECCClass() ; 
    // action ImportECCSalesh(); 
    action ImportECCAsmbcomp();
    action ImportDeriveChar(); 
    action ImportCIRLog(); 
    action ImportPartialProd();
    action ImportSOStock(); 
    action ImportPVSNode();
    action ImportECCCharValueNum();
    action ImportECCProdOrdQnty();
    action ImportVariantTables();
    action ImportECCSalesh(LOCATION_ID : String(4), PRODUCT_ID : String(40),FROM_DATE:Date, TO_DATE:Date); 

}