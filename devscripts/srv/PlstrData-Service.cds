// using mkt from '../db/mktauth';



service PlstrDataService @(impl : './lib/PlstrData-Service.js') {


  action genMasterData();
  // KLUDGE function API for Alternate to POST gen MasterDta()
  function fgenMasterData() returns String;

  
  action genPartialProducts();
  // KLUDGE function API for Alternate to POST Partial Products()
  function fgenPartialProducts() returns String;
  
  action genTimeSeries();
  // KLUDGE function API for Alternate to POST genTimeseries()
  function fgenTimeSeries() returns String;

  action genTsForPrimary();
  // KLUDGE function API for Alternate to POST genTsForPrimary()
  function fgenTsForPrimary() returns String;



  action genFutureTsForPrimary();
  // KLUDGE function API for Alternate to POST genFutureTsForPrimary()
  function fgenFutureTsForPrimary() returns String;

  action genPrimeAndUqiue();
  // KLUDGE function API for Alternate to POST genPrimeAndUqiue()
  function fgenPrimeAndUqiue() returns String;  
  
}