const cds = require("@sap/cds");
const Catservicefn = require("./catservice-function");
class UniqueCompareFn {

    constructor() { }
  /**
   * oUniqueHData is the Object with structure of CP_UNIQUE_ID_HEADER
   * aInputChar is an array of objects with fields CHAR_NUM,CHARVAL_NUM and CHAR_VALUE
   */
     async compareConfig(oUniqueHData, aInputChar) {
        var logObj = {
            "Type": "",
            "Description": "",
            "statusCode": '',
            "resultData": "",
            "SameConfig":false
        } 
        var aUniqueItemsData =[];
        var aData = await cds.run(`SELECT UNIQUE_ID,CHAR_NUM,CHARVAL_NUM,CHAR_VALUE FROM "CP_UNIQUE_ID_ITEM" 
        WHERE "UNIQUE_ID" IN (SELECT "UNIQUE_ID" FROM "CP_UNIQUE_ID_HEADER" 
        WHERE "PRODUCT_ID" ='${oUniqueHData.PRODUCT_ID}' 
        AND "ACTIVE"=true 
        AND "UID_TYPE" ='U')
        ORDER BY UNIQUE_ID,CHAR_NUM,CHARVAL_NUM,CHAR_VALUE`);
        var oDataHeader = await cds.run(`SELECT "UNIQUE_ID" FROM "CP_UNIQUE_ID_HEADER" 
WHERE "PRODUCT_ID" ='${oUniqueHData.PRODUCT_ID}' 
AND "ACTIVE"=true 
AND "UID_TYPE" ='U' `);
        if (oDataHeader.length > 0) {
            var index = 0;
            while (index < oDataHeader.length) {
                aUniqueItemsData = aData.filter(f => f.UNIQUE_ID == oDataHeader[index].UNIQUE_ID);
                aUniqueItemsData = aUniqueItemsData.map(({
                    ['UNIQUE_ID']: deletedField,
                    ...rest
                }) => rest);

                const bEqual = JSON.stringify(aInputChar) === JSON.stringify(aUniqueItemsData);
                if (bEqual) { //Same Config Exists,update header details  for that unique ID
                    await updateUHeader(oUniqueHData, oDataHeader[index].UNIQUE_ID, oUniqueHData.PRODUCT_ID);
                    aInputChar = [];
                    break;
                }
                index++;
            }
        }
        if (aInputChar.length == 0) { //Same Config exists
            logObj.Type = "SUCCESS";
            logObj.Description = "Creation/Updation of UniqueID is successful";
            logObj.SameConfig = true;
        }
        else{//create New Unique ID 
            const objCatFn = new Catservicefn();
            let vID = await objCatFn.maintainUniqueHeader('B', oUniqueHData,[],'');
            if (JSON.parse(vID).length >0) {
                var liresults = [];
                for (let j = 0; j < aInputChar.length; j++) {
                    var lsresults = {
                        PRODUCT_ID: oUniqueHData.PRODUCT_ID,
                        UNIQUE_ID: JSON.parse(vID)[0].UID,
                        CHAR_NUM: aInputChar[j].CHAR_NUM,
                        CHARVAL_NUM: aInputChar[j].CHARVAL_NUM,
                        CHAR_VALUE: aInputChar[j].CHARVAL_NUM,
                    }
                    //checking CHARVAL_NUM as well as the characteristics can be single or multi value
                    if (liresults.findIndex(el => el.CHAR_NUM == lsresults.CHAR_NUM && (el.CHAR_VALUE == lsresults.CHAR_VALUE || "NOT_" + el.CHAR_VALUE == lsresults.CHAR_VALUE)) === -1) {
                        liresults.push(lsresults);
                    }
                    lsresults = {};
                }
                if (liresults.length > 0) {
                    try {
                        await cds.run(INSERT.into("CP_UNIQUE_ID_ITEM").entries(liresults));
                        logObj.Type = "SUCCESS";
                        logObj.Description = "Creation/Updation of UniqueID is successful";
                    } catch (e) {
                        logObj.Type = "ERROR";
                        logObj.Description = "Creation Failed";
                        console.log(e);
                    }
                }
            } else if (vID == 'U') {
                logObj.Type = "SUCCESS";
                logObj.Description = "Creation/Updation of UniqueID is successful";
            } else {
                logObj.Type = "ERROR";
                logObj.Description = "Creation Failed";
            }
        }
        return logObj;


       async function updateUHeader(oUniqueData, UNIQUE_ID, sConfigProduct) {
            await UPDATE `CP_UNIQUE_ID_HEADER`
                .with({
                    EX_IDENTIFICATION: oUniqueData.externalIdentification,
                    VALID_FROM: (!oUniqueData.VALID_FROM) ? '1947-01-01' : oUniqueData.VALID_FROM,
                    VALID_TO: (!oUniqueData.VALID_TO) ? '9999-12-30' : oUniqueData.VALID_TO,
                    UNIQUE_DESC: (oUniqueData.UNIQUE_DESC) ? oUniqueData.UNIQUE_DESC : ""
                })
                .where(`UNIQUE_ID = '${UNIQUE_ID}' AND PRODUCT_ID = '${sConfigProduct}'`);
        }
    }


}

module.exports = UniqueCompareFn;