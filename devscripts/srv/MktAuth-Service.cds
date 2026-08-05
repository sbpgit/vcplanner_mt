using mkt from '../db/mktauth';



service MktAuthService @(impl : './lib/MktAuth-Service.js') {
   @readonly
  entity constraints as projection on mkt.CONSTRAINTS;

  @readonly
  entity applicabity as projection on mkt.APPLICABILITY_RULES;

  @readonly
  entity inferred as projection on mkt.INFERRED_RULES;

  action updateMktAuth();
  // KLUDGE function API for Alternate to POST updateJobs()
  function fupdateMktAuth() returns String;


}