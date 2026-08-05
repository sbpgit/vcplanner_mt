const request = require('request');
const GenF = require("./gen-functions");
const Catservicefn = require("./catservice-function");
const DerivedConfig = require("./derivedchars-functions");
const {
    v1: uuidv1
} = require('uuid');
const GenTimeseriesC = require("./gen-timeseries-c");

class InitialProcess {

    /**
     * Constructor
     */
    constructor() {
        this.oReturn = {
            bError: false,
            message: "",
        };
    }

    async getData(arraydata, req) {
        const objCatFn = new Catservicefn();
        let lilocProd = [];
        let lsData = {},
            Flag = '';

        let data = JSON.parse(arraydata);

        let adata = data[0];
        // let adata = arraydata;

        let createtAt = new Date();
        let id = uuidv1();
        let values = [];
        let message = "Started Processing Sales Order";
        let res = req._.req.res;
        var iCounter = 0,
            sMessage = '';
        let oResponse = {
            bError: false,
            message: ''
        };
        let oResponseTS = {
            bError: false,
            message: ''
        };

        let lDate = new Date();
        let aLocProd = [];
        let lStartDate =''
        var iHistoryWeeks = 0,bUserSelectedWeeks = true;
        if(adata.HISTORY_WEEKS!= null && adata.HISTORY_WEEKS!='' && adata.HISTORY_WEEKS!= undefined){
            iHistoryWeeks= adata.HISTORY_WEEKS;
            lStartDate = new Date(
                lDate.getFullYear(),
                lDate.getMonth(),
                lDate.getDate() - (parseInt(iHistoryWeeks)) * 7);
    
            lStartDate = lStartDate.toISOString().slice(0, 10);
        }
        else{//Process all sales documents
            lStartDate='0001-01-01'
            bUserSelectedWeeks = false;
        }
       
        var sCharPr = '';
        // To consider only mondays 
        aLocProd = await cds.run(`SELECT DISTINCT LOCATION_ID, 
                                            PRODUCT_ID 
                                            FROM CP_SALESH
                                            WHERE ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) >= '${lStartDate}'`);

        if (aLocProd.length > 0) {
            // Location Filter

            if (adata.LOCATION_ID !== '' && adata.LOCATION_ID !== undefined) {
                let aLocations = adata.LOCATION_ID;
                // let aLocations = [];
                // aLocations.push({ LOCATION_ID: adata.LOCATION_ID });

                if(!Array.isArray(aLocations)){
                    aLocations =  Object.entries(aLocations);
                }
                
                aLocProd = aLocProd.filter((el) => {
                    return aLocations.some((f) => {
                        // return f.LOCATION_ID === el.LOCATION_ID;
                        return f === el.LOCATION_ID; // UnComment
                    });
                });
            }

            // Product Filter
            if (adata.PRODUCT_ID !== '' && adata.PRODUCT_ID !== undefined) {
                let aProducts = adata.PRODUCT_ID;
                // let aProducts = [];
                // aProducts.push({ PRODUCT_ID: adata.PRODUCT_ID });

                if(!Array.isArray(aProducts)){
                    aProducts =  Object.entries(aProducts);
                }

                aLocProd = aLocProd.filter((el) => {
                    return aProducts.some((f) => {
                        // return f.PRODUCT_ID === el.PRODUCT_ID;
                        return f === el.PRODUCT_ID; // Uncomment
                    });
                });
            }
        }

        if (aLocProd.length > 0) {
            GenF.log("Started Sales Orders Processing");
            values.push({
                id,
                createtAt,
                message,
                aLocProd
            });
               
            for (let i = 0; i < aLocProd.length; i++) {
                // Process Sales Orders and generate Unique / Primary Ids
                //check for characteristic prioritization here
                if((await cds.run(`SELECT  TOP 1 "PRODUCT_ID" FROM "V_GETVARCHARPS" WHERE "PRODUCT_ID"='${aLocProd[i].PRODUCT_ID}' AND "CHAR_TYPE"='P'`)).length == 0){
                     sCharPr = sCharPr + ''+`Characteristic prioritization missing for Product: ${aLocProd[i].PRODUCT_ID}`
                    continue;
                 }
                oResponse = await this.primaryProcess(aLocProd[i].LOCATION_ID, aLocProd[i].PRODUCT_ID, lStartDate, req,bUserSelectedWeeks);
                if (oResponse.bError == true) { //Error exists
                    iCounter++;
                    sMessage = sMessage + " " + oResponse.message;
                } else {
                    sMessage = sMessage + " " + `SO Process Completed for Location: ${aLocProd[i].LOCATION_ID}, Product: ${aLocProd[i].PRODUCT_ID}`
                    // Process Timeseries History
                    // oResponseTS = await obgenTimeseries.genTimeseries(aLocProd[i], lStartDate, req,bUserSelectedWeeks);
                    // if (oResponseTS.bError === true) {
                    //     sMessage = sMessage + " " + oResponseTS.message;
                    // } else {
                    //     sMessage = sMessage + " " + oResponseTS.message;
                    // }
                }
            }
        }
        else{//If combination of Location and Product not found in sales history
            iCounter =1;
            sMessage =`Location: ${adata.LOCATION_ID} and Product: ${adata.PRODUCT_ID} combination does not exists in Sales History for week dates greater than ${lStartDate}`
        }

        if (iCounter > 0) { //Error exists
            await GenF.jobSchMessage('', sCharPr+sMessage, req);
        } else {
            await GenF.jobSchMessage('X', sCharPr+'Completed Initialization Process', req);
        }
        res.statusCode = 202;
        res.send({
            values
        });
    }

    async processSalesDelta_old(req, oSalesHeader, liSalesData, matDate) {
        let liSalesh = [], sCharPr = '';
        //Validation - check characteristic prioritization
        if ((await cds.run(`SELECT  TOP 1 "PRODUCT_ID" FROM "V_GETVARCHARPS" WHERE "PRODUCT_ID"='${oSalesHeader.PRODUCT_ID}' AND "CHAR_TYPE"='P'`)).length == 0) {
            sCharPr = `Characteristic prioritization missing for Product: ${oSalesHeader.PRODUCT_ID}`
            return await GenF.jobSchMessage('', sCharPr, req);
        }

        let liPriChar = await cds.run(`SELECT "CHAR_NUM"
            FROM "CP_VARCHAR_PS"
           WHERE "PRODUCT_ID" = '${oSalesHeader.PRODUCT_ID}'
             AND "CHAR_TYPE" = 'P'`);

        let aDelta = await cds.run(`SELECT * FROM "CP_SALESH_CONFIG_DELTA"`);

        let lsSalesh = {}, lsSaleshConfig = {}, lsSOHM = {}, liSOHM = [], liUnique = [], lsUnique = {};
        await cds.run(`DELETE FROM "CP_SALESH_CONFIG_MASTER" WHERE SALES_DOC='${oSalesHeader.SALES_DOCUMENT}' AND "SALESDOC_ITEM"='${oSalesHeader?.SALES_DOCUMENT_ITEM}'`)
        await cds.run(`DELETE FROM "CP_SALESH_CONFIG" WHERE "SALES_DOC"='${oSalesHeader?.SALES_DOCUMENT}' AND "SALESDOC_ITEM"='${oSalesHeader?.SALES_DOCUMENT_ITEM}'`);
       try{
        await insertRecords(liSalesData)
       }
       catch(ex){
        console.log(ex.message);
       }

        async function insertRecords(liSalesData) {

            var aData = []
            for (let cntS = 0; cntS < liSalesData.length; cntS++) {
                liSalesData[cntS].SALES_DOCUMENT_ITEM = GenF.addleadzeros(liSalesData[cntS].SALES_DOCUMENT_ITEM.toString(), 6);
                liSalesData[cntS].CHARACTERSTIC_NUM = GenF.addleadzeros(GenF.parse(liSalesData[cntS].CHARACTERSTIC_NUM).toString(), 10);
                const obj = {

                    SALES_DOC: liSalesData[cntS].SALES_DOCUMENT,
                    SALESDOC_ITEM: liSalesData[cntS].SALES_DOCUMENT_ITEM,
                    CHAR_NUM: liSalesData[cntS].CHARACTERSTIC_NUM,
                    CHARVAL_NUM: liSalesData[cntS].CHARACTERSTIC_VALUE,
                    CHAR_VALUE: liSalesData[cntS].CHARACTERSTIC_VALUE,
                    PRODUCT_ID: liSalesData[cntS].PRODUCT_ID,
                    CHANGED_DATE: liSalesData[cntS].CHANGED_DATE,
                    CHANGED_BY: liSalesData[cntS].CHANGED_BY,
                    CREATED_DATE: liSalesData[cntS].CREATED_DATE,
                    CREATED_BY: liSalesData[cntS].CREATED_BY,
                    CHANGED_TIME: liSalesData[cntS].CHANGED_TIME,
                    CREATED_TIME: liSalesData[cntS].CREATED_TIME,
                }
                aData.push(obj)
            }
            await cds.run(INSERT.into("CP_SALESH_CONFIG_MASTER").entries(aData))
            await cds.run(`INSERT INTO CP_SALESH_CONFIG (SALES_DOC,
                                                    SALESDOC_ITEM, 
                                                    CHAR_NUM, 
                                                    CHARVAL_NUM, 
                                                    CHAR_VALUE, 
                                                    PRODUCT_ID) 
                                    (SELECT DISTINCT CP_SALESH_CONFIG_MASTER.SALES_DOC,
                                                    CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
                                                    V_CHARVAL.CHAR_NUM AS CHAR_NUM,
                                                    CP_SALESH_CONFIG_MASTER.CHAR_VALUE AS CHARVAL_NUM,
                                                    CP_SALESH_CONFIG_MASTER.CHAR_VALUE,
                                                    CP_SALESH_CONFIG_MASTER.PRODUCT_ID
                                                FROM CP_SALESH_CONFIG_MASTER
                                        INNER JOIN V_CHARVAL
                                                ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                                                AND V_CHARVAL.CHAR_TYPE NOT IN ('NUM','DATE')
                                                        WHERE V_CHARVAL.MULTI_CHAR <> 'X' AND CP_SALESH_CONFIG_MASTER.SALES_DOC='${oSalesHeader.SALES_DOCUMENT}' AND CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM='${oSalesHeader.SALES_DOCUMENT_ITEM}'
                                       );`)

            // Insert Multichar Characteristics with Value validation
            await cds.run(`INSERT INTO CP_SALESH_CONFIG (SALES_DOC,
                                                    SALESDOC_ITEM, 
                                                    CHAR_NUM, 
                                                    CHARVAL_NUM, 
                                                    CHAR_VALUE, 
                                                    PRODUCT_ID) 
                                (SELECT DISTINCT CP_SALESH_CONFIG_MASTER.SALES_DOC,
                                                    CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
                                                    V_CHARVAL.CHAR_NUM AS CHAR_NUM,
                                                    CP_SALESH_CONFIG_MASTER.CHARVAL_NUM,
                                                    CP_SALESH_CONFIG_MASTER.CHAR_VALUE,
                                                    CP_SALESH_CONFIG_MASTER.PRODUCT_ID
                                            FROM CP_SALESH_CONFIG_MASTER
                                        INNER JOIN V_CHARVAL
                                                ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                                                AND CP_SALESH_CONFIG_MASTER.CHAR_VALUE = V_CHARVAL.REF_CHAR_VALUE
                                                AND V_CHARVAL.CHAR_TYPE NOT IN ('NUM','DATE')
                                                        WHERE V_CHARVAL.MULTI_CHAR = 'X' AND CP_SALESH_CONFIG_MASTER.SALES_DOC='${oSalesHeader.SALES_DOCUMENT}' AND CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM='${oSalesHeader.SALES_DOCUMENT_ITEM}');`)

            // Insert Bucket Values
            const numRecords = await cds.run(`SELECT DISTINCT CP_SALESH_CONFIG_MASTER.SALES_DOC,
            CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
            IFNULL( B.CHAR_NUM, CP_SALESH_CONFIG_MASTER.CHAR_NUM ) AS CHAR_NUM,
            IFNULL( TRIM(B.CHAR_VALUE), TRIM(CP_SALESH_CONFIG_MASTER.CHAR_VALUE) ) AS CHARVAL_NUM,
            CP_SALESH_CONFIG_MASTER.CHAR_VALUE AS "SALES_CHAR",
            IFNULL( TRIM(B.CHAR_VALUE), TRIM(CP_SALESH_CONFIG_MASTER.CHAR_VALUE) ) AS CHAR_VALUE,
            CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
            B.RANGE_FROM,
            B.RANGE_TO
            FROM "CP_SALESH_CONFIG_MASTER"
            INNER JOIN CP_CHARACTERISTICS
            ON CP_CHARACTERISTICS.CHAR_NUM = CP_SALESH_CONFIG_MASTER.CHAR_NUM
            AND CP_CHARACTERISTICS.CHAR_TYPE = 'NUM'
            LEFT OUTER JOIN V_CHARVAL_BUCKET AS B
            ON B.CHAR_NUM = CP_SALESH_CONFIG_MASTER.CHAR_NUM 
            WHERE CP_SALESH_CONFIG_MASTER.SALES_DOC='${oSalesHeader.SALES_DOCUMENT}' AND CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM='${oSalesHeader.SALES_DOCUMENT_ITEM}'`)


            var aNumRecords = [];

            for (const record of numRecords) {
                const salesChar = record.SALES_CHAR?.trim();
                let isValid = false;

                if (!salesChar) {
                    const value = 0;
                    isValid = value >= record.RANGE_FROM && value <= record.RANGE_TO;
                } else if (salesChar.includes('-')) {
                    const parts = salesChar.split('-').map(part => parseFloat(part));
                    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                        const start = Math.round(parts[0]);
                        const end = Math.round(parts[1]);
                        const rangeDifference = Math.abs(end - start);
                        isValid = rangeDifference >= record.RANGE_FROM && rangeDifference <= record.RANGE_TO;
                    } else {
                        continue;
                    }
                } else {
                    const value = Math.round(parseFloat(salesChar));
                    if (!isNaN(value)) {
                        isValid = value >= record.RANGE_FROM && value <= record.RANGE_TO;
                    } else {
                        continue;
                    }
                }

                if (isValid) {
                    aNumRecords.push({
                        SALES_DOC: record.SALES_DOC,
                        SALESDOC_ITEM: record.SALESDOC_ITEM,
                        CHAR_NUM: record.CHAR_NUM,
                        CHARVAL_NUM: record.CHARVAL_NUM,
                        CHAR_VALUE: record.CHAR_VALUE,
                        PRODUCT_ID: record.PRODUCT_ID
                    });
                }
            }

            if (aNumRecords.length > 0) {
                const keys = ['SALES_DOC', 'SALESDOC_ITEM',"CHAR_NUM","CHARVAL_NUM","CHAR_VALUE","PRODUCT_ID"];
                aNumRecords = await GenF.removeDuplicate(aNumRecords, keys);
                await cds.run(INSERT.into('CP_SALESH_CONFIG').entries(aNumRecords));
            }
            
            await cds.run(`INSERT INTO CP_SALESH_CONFIG (SALES_DOC,
                                            SALESDOC_ITEM,
                                            CHAR_NUM,
                                            CHARVAL_NUM,
                                            CHAR_VALUE,
                                            PRODUCT_ID)
                                (SELECT DISTINCT CP_SALESH_CONFIG_MASTER.SALES_DOC,
                                            CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
                                            V_CHARVAL.CHAR_NUM,
                                            V_CHARVAL.CHARVAL_NUM,
                                            V_CHARVAL.CHAR_VALUE,
                                            CP_SALESH_CONFIG_MASTER.PRODUCT_ID
                                    FROM CP_SALESH_CONFIG_MASTER
                                INNER JOIN V_CHARVAL
                                        ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                                    WHERE V_CHARVAL.MULTI_CHAR = 'X'
                                        AND V_CHARVAL.CHAR_VALUE LIKE 'NOT_%'
                                         AND CP_SALESH_CONFIG_MASTER.SALES_DOC='${oSalesHeader.SALES_DOCUMENT}' AND CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM='${oSalesHeader.SALES_DOCUMENT_ITEM}'
            
                                        AND ((CP_SALESH_CONFIG_MASTER.SALES_DOC,
                                            CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
                                            CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
                                            V_CHARVAL.CHAR_NUM) NOT IN (SELECT DISTINCT CP_SALESH_CONFIG.SALES_DOC,
                                                                                        CP_SALESH_CONFIG.SALESDOC_ITEM,
                                                                                        CP_SALESH_CONFIG.PRODUCT_ID,
                                                                                        V_CHARVAL.CHAR_NUM AS CHAR_NUM
                                                                                    FROM CP_SALESH_CONFIG
                                                                            INNER JOIN V_CHARVAL
                                                                                    ON CP_SALESH_CONFIG.CHAR_NUM = V_CHARVAL.CHAR_NUM
                                                                                    WHERE V_CHARVAL.MULTI_CHAR = 'X')))`);



        }

        liSalesData = await cds.run(`SELECT * FROM "CP_SALESH_CONFIG"  WHERE SALES_DOC='${oSalesHeader?.SALES_DOCUMENT}' AND SALESDOC_ITEM='${oSalesHeader.SALES_DOCUMENT_ITEM}'`)

        for (let cntSO = 0; cntSO < liSalesData.length; cntSO++) {//Map fields here
            if (cntSO === 0 ||
                liSalesData[cntSO].SALES_DOC !== liSalesData[GenF.subOne(cntSO, liSalesData.length)].SALES_DOC ||
                liSalesData[cntSO].SALESDOC_ITEM !== liSalesData[GenF.subOne(cntSO, liSalesData.length)].SALESDOC_ITEM) {
                lsSalesh = {};
                lsSalesh['SALES_DOC'] = GenF.parse(liSalesData[cntSO].SALES_DOC);
                lsSalesh['SALESDOC_ITEM'] = GenF.parse(liSalesData[cntSO].SALESDOC_ITEM);
                lsSalesh['CONFIG'] = [];
                lsSalesh['PCONFIG'] = [];
            }

            lsSaleshConfig = {};
            lsSaleshConfig['CHAR_NUM'] = liSalesData[cntSO].CHAR_NUM;
            lsSaleshConfig['CHARVAL_NUM'] = GenF.parse(liSalesData[cntSO].CHARVAL_NUM);
            lsSaleshConfig['CHAR_VALUE'] = GenF.parse(liSalesData[cntSO].CHAR_VALUE);
            lsSalesh['MATERIAL_VARIANT'] = GenF.parse(oSalesHeader.MATERIAL_VARIANT);
            lsSalesh['CONFIG'].push(lsSaleshConfig);
            lsSalesh['CONFIG'] = lsSalesh['CONFIG'].sort(GenF.dynamicSortMultiple("CHAR_NUM", "CHARVAL_NUM", "CHAR_VALUE"));

            let lsTempPriChar = {};
            lsTempPriChar = liPriChar.find((lsChar) =>
                lsChar.CHAR_NUM === GenF.addleadzeros(liSalesData[cntSO].CHAR_NUM.toString(), 10)
            );
            if (lsTempPriChar) {
                lsSalesh['PCONFIG'].push(lsSaleshConfig);
                lsSalesh['PCONFIG'] = lsSalesh['PCONFIG'].sort(GenF.dynamicSortMultiple("CHAR_NUM", "CHARVAL_NUM", "CHAR_VALUE"));
            }

            if (cntSO === GenF.addOne(cntSO, liSalesData.length) ||
                liSalesData[cntSO].SALES_DOC !== liSalesData[GenF.addOne(cntSO, liSalesData.length)].SALES_DOC ||
                liSalesData[cntSO].SALESDOC_ITEM !== liSalesData[GenF.addOne(cntSO, liSalesData.length)].SALESDOC_ITEM) {
                lsSalesh.configString = JSON.stringify(lsSalesh.CONFIG);
                lsSalesh.configStringP = JSON.stringify(lsSalesh.PCONFIG);
                liSalesh.push(lsSalesh);

            }
        }


        //Upsert into CP_SALESH_CONFIG_DELTA
        let iFind = aDelta.findIndex(d => d.LOCATION_ID == oSalesHeader.LOCATION_ID && d.PRODUCT_ID == oSalesHeader.PRODUCT_ID && d.WEEK_DATE == matDate);
        if (iFind == -1) {//insert
            await cds.run(INSERT.into("CP_SALESH_CONFIG_DELTA").entries({
                LOCATION_ID: oSalesHeader.LOCATION_ID,
                PRODUCT_ID: oSalesHeader.PRODUCT_ID,
                WEEK_DATE: matDate
            }));
        }
        GenF.log("Order Count: " + liSalesh.length);

        var liUniqueData = await this.getUnique(oSalesHeader.PRODUCT_ID);
        // Get Partial Products
        const liPartialProd = await cds.run(
            `SELECT *
                    FROM V_PARTIALPRODCHAR
                    WHERE REF_PRODID    = '${oSalesHeader.PRODUCT_ID}'
                      AND LOCATION_ID   = '${oSalesHeader.LOCATION_ID}'
                      AND PRODUCT_ID != '${oSalesHeader.PRODUCT_ID}'
                    ORDER BY LOCATION_ID,
                             PRODUCT_ID,
                             CLASS_NUM,
                             CHAR_NUM`
        );

        // 2024-04-26 - Begin
        let aPartialProd = [];
        if (liPartialProd.length > 0) {
            //     //Delete records from CP_SALES_HM which are mapped to configurable product
            //     await cds.run(`
            //         DELETE FROM "CP_SALES_HM" WHERE (SALES_DOC,SALESDOC_ITEM,LOCATION_ID,PRODUCT_ID)
            //         IN ( SELECT SALES_DOC,SALESDOC_ITEM,LOCATION_ID,PRODUCT_ID  FROM V_SALES_H
            // WHERE LOCATION_ID   = '${oSalesHeader.LOCATION_ID}'
            //     AND REF_PRODID   = '${oSalesHeader.PRODUCT_ID}'
            //     AND (DELETE_FLAG IS NULL OR DELETE_FLAG != 'X')
            //     AND PRODUCT_ID NOT IN (SELECT DISTINCT PRODUCT_ID FROM V_PARTIALPRODCHAR WHERE LOCATION_ID='${oSalesHeader.LOCATION_ID}' AND REF_PRODID='${oSalesHeader.PRODUCT_ID}' AND PRODUCT_ID !='${oSalesHeader.PRODUCT_ID}'))`)
            // Build nested array for Partial Product Data
            aPartialProd = liPartialProd.reduce((aProd, curr) => {
                const ITEM = [];
                const {
                    LOCATION_ID,
                    PRODUCT_ID,
                    CLASS_NUM,
                    CHAR_NUM,
                    CHAR_VALUE,
                } = curr;
                const findObj = aProd.find((o) => o.LOCATION_ID === LOCATION_ID && o.PRODUCT_ID === PRODUCT_ID);
                if (!findObj) {
                    ITEM.push({
                        LOCATION_ID,
                        PRODUCT_ID,
                        CLASS_NUM,
                        CHAR_NUM,
                        CHAR_VALUE,
                    });
                    aProd.push({
                        LOCATION_ID,
                        PRODUCT_ID,
                        ITEM
                    });
                } else {
                    findObj.ITEM.push({
                        LOCATION_ID,
                        PRODUCT_ID,
                        CLASS_NUM,
                        CHAR_NUM,
                        CHAR_VALUE,
                    });
                }
                return aProd;
            }, []);
        }
        // Determine if there is any change in Sales Config


        GenF.log("Started UniqueID check");
        const liSalesUnique = await cds.run(
            `SELECT *
                    FROM V_SALES_H
                    WHERE LOCATION_ID   = '${oSalesHeader.LOCATION_ID}'
                        AND REF_PRODID   = '${oSalesHeader.PRODUCT_ID}'`);
        //Making as objects for optimization
        var oSales = {}, oUnique = {};
        for (var x = 0; x < liSalesUnique.length; x++) {
            var key = liSalesUnique[x].SALES_DOC + "||" + liSalesUnique[x].SALESDOC_ITEM;
            if (!oSales[key]) {
                oSales[key] = [];
            }
            oSales[key].push(liSalesUnique[x]);
        }

        for (var y = 0; y < liUniqueData.length; y++) {
            var key = liUniqueData[y].UNIQUE_ID;
            liUniqueData[y].CONFIG = liUniqueData[y].CONFIG.sort(GenF.dynamicSortMultiple("CHAR_NUM", "CHARVAL_NUM", "CHAR_VALUE"));
            liUniqueData[y].configString = JSON.stringify(liUniqueData[y].CONFIG)//Stringify here 
            if (!oUnique[key]) {
                oUnique[key] = [];
            }
            oUnique[key].push(liUniqueData[y]);
        }

        for (let cntSO = 0; cntSO < liSalesh.length; cntSO++) {
            // Get the existing unique ID
            let lsSalesUnique = {}, oSalesH = liSalesh[cntSO];
            lsSalesUnique = oSales[oSalesH.SALES_DOC + "||" + oSalesH.SALESDOC_ITEM];
            if (lsSalesUnique) {
                // Check if there is any change in sales order config
                let lsUnique = {};
                lsUnique = oUnique[lsSalesUnique[0].UNIQUE_ID]
                if (lsUnique) {
                    if (oSalesH.configString === lsUnique[0].configString) {
                        //check for similar config and add unique_id
                        let lsSOHM = {};
                        lsSOHM['SALES_DOC'] = GenF.parse(oSalesH.SALES_DOC);
                        lsSOHM['SALESDOC_ITEM'] = GenF.parse(oSalesH.SALESDOC_ITEM);
                        lsSOHM['PRODUCT_ID'] = GenF.parse(oSalesHeader.PRODUCT_ID);
                        lsSOHM['LOCATION_ID'] = GenF.parse(oSalesHeader.LOCATION_ID);
                        lsSOHM['UNIQUE_ID'] = lsUnique[0].UNIQUE_ID;
                        lsSOHM['CONFIG'] = GenF.parse(oSalesH.CONFIG);
                        lsSOHM['PCONFIG'] = GenF.parse(oSalesH.PCONFIG);
                        lsSOHM['configString'] = oSalesH.configString;
                        lsSOHM['configStringP'] = oSalesH.configStringP;
                        lsSOHM['MATERIAL_VARIANT'] = GenF.parse(oSalesH.MATERIAL_VARIANT);
                        lsSOHM['PRIMARY_ID'] = liUniqueData.find(f => f.configString === oSalesH.configStringP && f.UID_TYPE == 'P')?.UNIQUE_ID ?? 0;
                        liSOHM.push(lsSOHM);
                        continue;
                    }
                    else {//If the Unique ID and Primary ID is not mapped to any sales doc,Make those  as inactive
                        if (liSalesUnique.findIndex(f => f.SALES_DOC != oSalesH.SALES_DOC && f.UNIQUE_ID == lsSalesUnique[0].UNIQUE_ID) == -1) {
                            await UPDATE`CP_UNIQUE_ID_HEADER`
                                .with({
                                    ACTIVE: false
                                })
                                .where(`UNIQUE_ID = '${lsSalesUnique[0].UNIQUE_ID}'`);
                        }
                        if (lsSalesUnique[0].PRIMARY_ID) {
                            if (liSalesUnique.findIndex(f => f.SALES_DOC != oSalesH.SALES_DOC && f.PRIMARY_ID == lsSalesUnique[0].PRIMARY_ID) == -1) {

                                await UPDATE`CP_UNIQUE_ID_HEADER`
                                    .with({
                                        ACTIVE: false
                                    })
                                    .where(`UNIQUE_ID = '${lsSalesUnique[0].PRIMARY_ID}'`);
                            }
                        }
                    }
                }
            };

            lsSOHM = {};
            lsSOHM['SALES_DOC'] = GenF.parse(oSalesH.SALES_DOC);
            lsSOHM['SALESDOC_ITEM'] = GenF.parse(oSalesH.SALESDOC_ITEM).toString();
            lsSOHM['PRODUCT_ID'] = GenF.parse(oSalesHeader.PRODUCT_ID);
            lsSOHM['LOCATION_ID'] = GenF.parse(oSalesHeader.LOCATION_ID);
            lsSOHM['UNIQUE_ID'] = 0;
            lsSOHM['PRIMARY_ID'] = 0;
            lsSOHM['CONFIG'] = GenF.parse(oSalesH.CONFIG);
            lsSOHM['PCONFIG'] = GenF.parse(oSalesH.PCONFIG);
            lsSOHM['MATERIAL_VARIANT'] = GenF.parse(oSalesH.MATERIAL_VARIANT);

            lsSOHM['UNIQUE_ID'] = liUniqueData.find(f => f.configString === oSalesH.configString && lsSOHM['UNIQUE_ID'] === 0 && f.UID_TYPE == 'U')?.UNIQUE_ID ?? 0;
            lsSOHM['PRIMARY_ID'] = liUniqueData.find(f => f.configString === oSalesH.configStringP && lsSOHM['PRIMARY_ID'] === 0 && f.UID_TYPE == 'P')?.UNIQUE_ID ?? 0;


            lsUnique = {};
            lsUnique['CONFIG'] = [];

            if (lsSOHM['UNIQUE_ID'] === 0) {
                lsUnique['CONFIG'] = oSalesH.CONFIG;
                lsUnique['UID_TYPE'] = 'U';
                // If Unique ID is already planned to be created, do not add again
                for (let cntU = 0; cntU < liUnique.length; cntU++) {
                    if (JSON.stringify(lsUnique['CONFIG']) === JSON.stringify(liUnique[cntU].CONFIG)) {
                        lsUnique['CONFIG'] = []
                        break;
                    }
                }
            }
            if (lsUnique['CONFIG'].length > 0) {
                lsUnique.configString = oSalesH.configString;
                liUnique.push(lsUnique);
            }

            lsUnique = {};
            lsUnique['CONFIG'] = [];

            if (lsSOHM['PRIMARY_ID'] === 0) {
                lsUnique['CONFIG'] = oSalesH.PCONFIG;
                lsUnique['UID_TYPE'] = 'P';
                // If Unique ID is already planned to be created, do not add again
                for (let cntU = 0; cntU < liUnique.length; cntU++) {
                    if (JSON.stringify(lsUnique['CONFIG']) === JSON.stringify(liUnique[cntU].CONFIG) && liUnique[cntU].UID_TYPE === 'P') {
                        lsUnique['CONFIG'] = []
                        break;
                    }
                }
            }
            if (lsUnique['CONFIG'].length > 0) {
                lsUnique.configStringP = oSalesH.configStringP;
                liUnique.push(lsUnique);
            }
            lsSOHM.configString = oSalesH.configString;
            lsSOHM.configStringP = oSalesH.configStringP;
            liSOHM.push(lsSOHM);
        }

        liSalesh = null;

        var iUniqueId = parseInt(await GenF.getSystemConfig('UNIQUE_ID'));

        const lsUniqueInd = await SELECT.one.columns("MAX(UNIQUE_ID) AS MAX_ID")
            .from('CP_UNIQUE_ID_HEADER');
        if (lsUniqueInd.MAX_ID !== null) {
            iUniqueId = parseInt(lsUniqueInd.MAX_ID);
        } else {
            iUniqueId = 0;
        }
        if (liUnique.length > 0) {
            let iUIDCount = iUniqueId + parseInt(liUnique.length);
            if (iUniqueId !== '' && iUIDCount !== '') {
                try {
                    await UPDATE`CP_USER_PREFERENCES`
                        .with({
                            PARAMETER_VALUE: iUIDCount.toString()
                        })
                        .where(`PARAMETER = 'UNIQUE_ID'`);
                } catch (e) {
                    GenF.log(e);
                }
            }
        }

        let liSalesUpdate = [], lsSalesUpdate = {};
        for (let cntU = 0; cntU < liUnique.length; cntU++) {

            if (liUnique[cntU]['CONFIG'].length > 0) {
                // Get the last next available unique ID number
                iUniqueId = iUniqueId + 1;
                liUnique[cntU]['UNIQUE_ID'] = iUniqueId;

                await cds.run({
                    INSERT: {
                        into: {
                            ref: ['CP_UNIQUE_ID_HEADER']
                        },
                        values: [
                            liUnique[cntU].UNIQUE_ID,
                            oSalesHeader.PRODUCT_ID,
                            liUnique[cntU].UNIQUE_ID.toString(),
                            liUnique[cntU].UID_TYPE,
                            0.0,
                            true,
                            ' ',
                            '2000-01-01',
                            '9999-12-31'
                        ]
                    }
                });
                GenF.log("Unique ID Created: " + liUnique[cntU].UNIQUE_ID);
                // Create unique ID Characteristics
                let liChar = [];
                liChar = liUnique[cntU]['CONFIG'];
                liChar = liChar.map(function (obj) {
                    return { ...obj, "UNIQUE_ID": iUniqueId, "PRODUCT_ID": oSalesHeader.PRODUCT_ID, "UID_CHAR_RATE": 0 };
                })

                try {
                    console.log(`Unique Id Config +${liChar.length}`);
                    await cds.run({
                        INSERT: {
                            into: {
                                ref: ['CP_UNIQUE_ID_ITEM']
                            },
                            entries: liChar
                        }
                    });
                } catch (e) {
                    console.log(e);
                }

                // Process through sales Order       
                // Update Sales Orders with Unique ID & Primary Id
                for (let cntSO = 0; cntSO < liSOHM.length; cntSO++) {
                    var elUnique = liUnique[cntU];
                    var el = liSOHM[cntSO];
                    if (el.UNIQUE_ID === 0 && el.configString === elUnique.configString) {
                        liSOHM[cntSO].UNIQUE_ID = elUnique.UNIQUE_ID;
                    }
                    if (el.PRIMARY_ID === 0 && el.configStringP === elUnique.configStringP) {
                        liSOHM[cntSO].PRIMARY_ID = elUnique.UNIQUE_ID;
                    }
                }

            }
        }
        let liPartialConfig = [];
        for (let cntSO = 0; cntSO < liSOHM.length; cntSO++) {
            let el = liSOHM[cntSO];
            if (el.MATERIAL_VARIANT !== "" && el.MATERIAL_VARIANT !== null) {
                el.PRODUCT_ID = el.MATERIAL_VARIANT;
            }
            else {
                for (let cntPC = 0; cntPC < aPartialProd.length; cntPC++) {
                    liPartialConfig = [];
                    let elPartialProd = aPartialProd[cntPC];
                    // Filter array of objects based on another array
                    liPartialConfig = el.CONFIG.filter((el) => {
                        return elPartialProd.ITEM.some((f) => {
                            return f.CHAR_NUM === el.CHAR_NUM && f.CHAR_VALUE === el.CHAR_VALUE;
                        });
                    });
                    // Check if length of filtered sales config matches with partial prod config
                    if (liPartialConfig.length === elPartialProd.ITEM.length) {
                        el.PRODUCT_ID = GenF.parse(elPartialProd.PRODUCT_ID);
                        break;
                    }
                }
            }

            await cds.run(
                `DELETE FROM CP_SALES_HM
                    WHERE SALES_DOC   = '${el.SALES_DOC}'
                        AND SALESDOC_ITEM    = '${el.SALESDOC_ITEM}'`
            );

            lsSalesUpdate = {};
            lsSalesUpdate['SALES_DOC'] = GenF.parse(el.SALES_DOC);
            lsSalesUpdate['SALESDOC_ITEM'] = GenF.parse(el.SALESDOC_ITEM).toString();
            lsSalesUpdate['PRODUCT_ID'] = GenF.parse(el.PRODUCT_ID);
            lsSalesUpdate['LOCATION_ID'] = GenF.parse(el.LOCATION_ID);
            lsSalesUpdate['UNIQUE_ID'] = GenF.parse(el.UNIQUE_ID);
            lsSalesUpdate['PRIMARY_ID'] = GenF.parse(el.PRIMARY_ID);
            liSalesUpdate.push(lsSalesUpdate);
        }
        GenF.log("Sales Orders updated Count: " + liSOHM.length);
        if (liSalesUpdate.length > 0) {
            const keys = ['SALES_DOC', 'SALESDOC_ITEM'];
            liSalesUpdate = GenF.removeDuplicate(liSalesUpdate, keys);
            await INSERT(liSalesUpdate).into('CP_SALES_HM');
        }
        console.log("Process Completed");
        await this.updateUniqueRate(oSalesHeader.LOCATION_ID, oSalesHeader.PRODUCT_ID);
        console.log("UID Rate Updated");
        await GenF.jobSchMessage('X', 'Completed Sales Orders Processing', req);
    }
    async processSalesDelta( oSalesHeader, liSalesData, matDate,req) {
        let aCharVal = await cds.run(`SELECT DISTINCT CLASS_NUM,CHAR_NUM,REF_CHAR_NUM,REF_CHAR_VALUE,CHAR_VALUE,CHAR_TYPE,MULTI_CHAR,GENFLAG FROM "V_PRODCLSCHARVAL" WHERE "PRODUCT_ID"='${oSalesHeader.PRODUCT_ID}'`);
        let aMultiChar = aCharVal.filter(f=>f.MULTI_CHAR =='X');
        let aSalesConfig =[];
        let aCharValBucket = await cds.run(`SELECT DISTINCT "CHAR_NUM",TRIM("CHAR_VALUE") AS CHAR_VALUE,"RANGE_FROM","RANGE_TO","MEDIAN" FROM "V_CHARVAL_BUCKET"
            WHERE "CHAR_NUM" IN (SELECT DISTINCT CHAR_NUM FROM "V_PRODCLSCHARVAL" WHERE "PRODUCT_ID"='${oSalesHeader.PRODUCT_ID}')
           `);
                   let aCharZ = await cds.run(`SELECT DISTINCT CHAR_NUM FROM "CP_CHARACTERISTICS"
                INNER JOIN "V_IBP_PRODCLASS" ON V_IBP_PRODCLASS.CLASS_NUM = CP_CHARACTERISTICS.CLASS_NUM
                WHERE V_IBP_PRODCLASS.PRODUCT_ID='${oSalesHeader.PRODUCT_ID}' AND V_IBP_PRODCLASS.IBPCHAR_CHK = true
                AND ENTRY_REQ !='X' AND CHAR_TYPE!='NUM' AND CHAR_NUM=REF_CHAR_NUM`);

        for(var i =0; i < liSalesData.length; i++){
            liSalesData[i].SALES_DOCUMENT_ITEM = GenF.addleadzeros(liSalesData[i].SALES_DOCUMENT_ITEM.toString(), 10);
            liSalesData[i].CHARACTERSTIC_NUM = GenF.addleadzeros(GenF.parse(liSalesData[i].CHARACTERSTIC_NUM).toString(), 10);
            let el = liSalesData[i];
            
            let aNumChar = aCharValBucket.filter(n=>n.CHAR_NUM ==  el.CHARACTERSTIC_NUM);
            if(aNumChar.length >0){
                for (const record of aNumChar) {
                    const salesChar = el.CHARACTERSTIC_VALUE.toString().trim();
                    let isValid = false;
    
                    if (!salesChar) {
                        const value = 0;
                        isValid = value >= record.RANGE_FROM && value <= record.RANGE_TO;
                    } else if (salesChar.includes('-')) {
                        const parts = salesChar.split('-').map(part => parseFloat(part));
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                            const start = Math.round(parts[0]);
                            const end = Math.round(parts[1]);
                            const rangeDifference = Math.abs(end - start);
                            isValid = rangeDifference >= record.RANGE_FROM && rangeDifference <= record.RANGE_TO;
                        } else {
                            continue;
                        }
                    } else {
                        const value = Math.round(parseFloat(salesChar));
                        if (!isNaN(value)) {
                            isValid = value >= record.RANGE_FROM && value <= record.RANGE_TO;
                        } else {
                            continue;
                        }
                    }
    
                    if (isValid) {
                        aSalesConfig.push({
                            CHAR_NUM: record.CHAR_NUM,
                            CHARVAL_NUM: record.MEDIAN.toString(),
                            CHAR_VALUE: record.MEDIAN.toString(),
                            PRODUCT_ID: oSalesHeader.PRODUCT_ID,
                            UNIQUE_ID:0,
                            UID_CHAR_RATE:0
                        });
                    }
                }
            }
            //#region MultiChar
            let aChar = aMultiChar.filter(f=>f.REF_CHAR_NUM == el.CHARACTERSTIC_NUM && f.CHAR_VALUE == el.CHARACTERSTIC_VALUE);
            if(aChar.length >0){//If exists
                const obj = {
                    CHAR_NUM: aChar[0].CHAR_NUM,
                    CHARVAL_NUM: el.CHARACTERSTIC_VALUE.toString(),
                    CHAR_VALUE: el.CHARACTERSTIC_VALUE.toString(),
                    PRODUCT_ID: el.PRODUCT_ID,
                    UNIQUE_ID:0,
                    UID_CHAR_RATE:0
                }
                aSalesConfig.push(obj);
            }
            else if(aNumChar.length ==0){//Not multiChar,not numeric
                const obj = {
                    CHAR_NUM: el.CHARACTERSTIC_NUM,
                    CHARVAL_NUM: el.CHARACTERSTIC_VALUE.toString(),
                    CHAR_VALUE: el.CHARACTERSTIC_VALUE.toString(),
                    PRODUCT_ID: el.PRODUCT_ID,
                    UNIQUE_ID:0,
                    UID_CHAR_RATE:0
                }
                aSalesConfig.push(obj);
            }
            //#endregion
        
        }
        let aNotMultiChar = aMultiChar.filter(m=>m.GENFLAG == 'X');//Not values 
        for(var j =0; j < aNotMultiChar.length; j++){
            let aSales = aSalesConfig.filter(s=>s.CHAR_NUM == aNotMultiChar[j].CHAR_NUM);//
            if(aSales.length == 0){
                const obj = {
                    CHAR_NUM: aNotMultiChar[j].CHAR_NUM,
                    CHARVAL_NUM: aNotMultiChar[j].CHAR_VALUE.toString(),
                    CHAR_VALUE: aNotMultiChar[j].CHAR_VALUE.toString(),
                    PRODUCT_ID: oSalesHeader.PRODUCT_ID,
                    UNIQUE_ID:0,
                    UID_CHAR_RATE:0
                }
                aSalesConfig.push(obj);
            }
        }
         //Adding ZZZZ values
            if(aCharZ.length >0){
                   const salesSet = new Set(
                        aSalesConfig.map(item => item.CHAR_NUM));
                    aCharZ = aCharZ.filter(item =>
                    !salesSet.has(item.CHAR_NUM)
                    );

                    if(aCharZ.length>0){
                        aCharZ.forEach(el=>{
                             const obj = {
                    CHAR_NUM: el.CHAR_NUM,
                    CHARVAL_NUM: 'ZZZZ',
                    CHAR_VALUE: 'ZZZZ',
                    PRODUCT_ID: oSalesHeader.PRODUCT_ID,
                    UNIQUE_ID:0,
                    UID_CHAR_RATE:0
                }
                aSalesConfig.push(obj);
                        })
                    }
            }
       
        //#region Unique ID
        //    let sQuery =`SELECT TOP 1 "UNIQUE_ID",COUNT(*) AS COUNT FROM "V_UNIQUE_ID" WHERE "PRODUCT_ID"='${oSalesHeader.PRODUCT_ID}' AND UID_TYPE='U' AND (`;
        //    for(var s =0; s < aSalesConfig.length; s++){
        //     sQuery+=`("CHAR_NUM"='${aSalesConfig[s].CHAR_NUM}' AND "CHAR_VALUE"='${aSalesConfig[s].CHAR_VALUE}')`;
        //     if(s != aSalesConfig.length -1) sQuery+='OR'
        //    }
        //    sQuery+=`) GROUP BY UNIQUE_ID
        //    ORDER BY COUNT DESC`;

        let sQuery = `SELECT TOP 1 v."UNIQUE_ID",COUNT(*) AS COUNT FROM "V_UNIQUE_ID" v
                    JOIN (
                         SELECT "UNIQUE_ID", COUNT(*) AS COUNT_ITEM FROM "CP_UNIQUE_ID_ITEM" WHERE "PRODUCT_ID"='${oSalesHeader.PRODUCT_ID}'
                        GROUP BY "UNIQUE_ID"
                        ) i
                    ON v."UNIQUE_ID" = i."UNIQUE_ID" WHERE v."PRODUCT_ID"='${oSalesHeader.PRODUCT_ID}' AND v."UID_TYPE"='U'  AND (`
   for(var s =0; s < aSalesConfig.length; s++){
            sQuery+=`("CHAR_NUM"='${aSalesConfig[s].CHAR_NUM}' AND "CHAR_VALUE"='${aSalesConfig[s].CHAR_VALUE}')`;
            if(s != aSalesConfig.length -1) sQuery+='OR'
           }

           sQuery+= `) GROUP BY v."UNIQUE_ID", i.COUNT_ITEM HAVING COUNT(*) = i.COUNT_ITEM ORDER BY COUNT DESC`
           let aResult = await cds.run(sQuery);
           const countMatch = aResult?.[0]?.COUNT === aSalesConfig.length;
           //Get Last Unique ID
           var lsUniqueInd = await SELECT.one.columns("MAX(UNIQUE_ID) AS MAX_ID")
           .from('CP_UNIQUE_ID_HEADER');
           var iUniqueID =0;
       if (lsUniqueInd.MAX_ID !== null) {
        iUniqueID = parseInt(lsUniqueInd.MAX_ID);
       } else {
        iUniqueID = 0;
       }
       var iPrimaryID =iUniqueID;
           if (countMatch) {
            iUniqueID = aResult?.[0].UNIQUE_ID;
          }
          else{//create Unique ID and update user preference table
            iUniqueID+=1;
            iPrimaryID = iUniqueID;
           await createUniquePrimary(iUniqueID,oSalesHeader,'U',aSalesConfig);
          }
    
          //#endregion
    
        //#region  Primary ID
        let liPriChar = await cds.run(`SELECT DISTINCT "CHAR_NUM"
            FROM "CP_VARCHAR_PS"
           WHERE "PRODUCT_ID" = '${oSalesHeader.PRODUCT_ID}' AND "CHAR_TYPE" = 'P'`);
        let aPriData =[];
        for(var x =0; x < aSalesConfig.length; x++){
            if(liPriChar.findIndex(p=>p.CHAR_NUM == aSalesConfig[x].CHAR_NUM) !=-1){
                aPriData.push(aSalesConfig[x]);
            }
        }
    
        // let sPriQuery =`SELECT TOP 1 "UNIQUE_ID",COUNT(*) AS COUNT FROM "V_UNIQUE_ID" WHERE "PRODUCT_ID"='${oSalesHeader.PRODUCT_ID}' AND UID_TYPE='P' AND (`;
        // for(var s =0; s < aPriData.length; s++){
        //  sPriQuery+=`("CHAR_NUM"='${aPriData[s].CHAR_NUM}' AND "CHAR_VALUE"='${aPriData[s].CHAR_VALUE}')`;
        //  if(s != aPriData.length -1) sPriQuery+='OR'
        // }
        // sPriQuery+=`) GROUP BY UNIQUE_ID
        // ORDER BY COUNT DESC`;

        let sPriQuery = `SELECT TOP 1 v."UNIQUE_ID",COUNT(*) AS COUNT FROM "V_UNIQUE_ID" v
        JOIN (
        SELECT "UNIQUE_ID", COUNT(*) AS COUNT_ITEM FROM "CP_UNIQUE_ID_ITEM" WHERE "PRODUCT_ID"='${oSalesHeader.PRODUCT_ID}' GROUP BY "UNIQUE_ID"
        ) i
         ON v."UNIQUE_ID" = i."UNIQUE_ID" WHERE v."PRODUCT_ID"='${oSalesHeader.PRODUCT_ID}' AND v."UID_TYPE"='P'  AND (`
    for(var s =0; s < aPriData.length; s++){
         sPriQuery+=`("CHAR_NUM"='${aPriData[s].CHAR_NUM}' AND "CHAR_VALUE"='${aPriData[s].CHAR_VALUE}')`;
         if(s != aPriData.length -1) sPriQuery+='OR'
        }
        sPriQuery+= `) GROUP BY v."UNIQUE_ID", i.COUNT_ITEM HAVING COUNT(*) = i.COUNT_ITEM ORDER BY COUNT DESC`
        let aPriResult = await cds.run(sPriQuery);
        const countMatchP = aPriResult?.[0]?.COUNT === aPriData.length;
        if(countMatchP){
            iPrimaryID = aPriResult[0].UNIQUE_ID;
        }
        else{
            iPrimaryID+=1;
            await createUniquePrimary(iPrimaryID,oSalesHeader,'P',aPriData); 
        }
        //#endregion
    
        //Insert into CP_SALES_HM
        const oSales ={
            SALES_DOC:oSalesHeader.SALES_DOCUMENT,
            SALESDOC_ITEM:oSalesHeader.SALES_DOCUMENT_ITEM,
            PRODUCT_ID:oSalesHeader.PRODUCT_ID,
            LOCATION_ID:oSalesHeader.LOCATION_ID,
            UNIQUE_ID:iUniqueID,
            PRIMARY_ID:iPrimaryID
        }
        if(oSalesHeader.MATERIAL_VARIANT!= '' && oSalesHeader.MATERIAL_VARIANT!=null){//Material variant
            oSales.PRODUCT_ID = oSalesHeader.MATERIAL_VARIANT;
        }
        else{
            const liPartialProd = await cds.run(
                `SELECT *
                        FROM V_PARTIALPRODCHAR
                        WHERE REF_PRODID    = '${oSalesHeader.PRODUCT_ID}'
                          AND LOCATION_ID   = '${oSalesHeader.LOCATION_ID}'
                          AND PRODUCT_ID != '${oSalesHeader.PRODUCT_ID}'
                        ORDER BY LOCATION_ID,
                                 PRODUCT_ID,
                                 CLASS_NUM,
                                 CHAR_NUM`
            );
            if(liPartialProd.length >0){
                let aPartialProd = [];
                if (liPartialProd.length > 0) {
                    let liPartialConfig = [];
                    aPartialProd = liPartialProd.reduce((aProd, curr) => {
                        const ITEM = [];
                        const {
                            LOCATION_ID,
                            PRODUCT_ID,
                            CLASS_NUM,
                            CHAR_NUM,
                            CHAR_VALUE,
                        } = curr;
                        const findObj = aProd.find((o) => o.LOCATION_ID === LOCATION_ID && o.PRODUCT_ID === PRODUCT_ID);
                        if (!findObj) {
                            ITEM.push({
                                LOCATION_ID,
                                PRODUCT_ID,
                                CLASS_NUM,
                                CHAR_NUM,
                                CHAR_VALUE,
                            });
                            aProd.push({
                                LOCATION_ID,
                                PRODUCT_ID,
                                ITEM
                            });
                        } else {
                            findObj.ITEM.push({
                                LOCATION_ID,
                                PRODUCT_ID,
                                CLASS_NUM,
                                CHAR_NUM,
                                CHAR_VALUE,
                            });
                        }
                        return aProd;
                    }, []);
                    for (let cntPC = 0; cntPC < aPartialProd.length; cntPC++) {
                        liPartialConfig = [];
                        let elPartialProd = aPartialProd[cntPC];
                        // Filter array of objects based on another array
                        liPartialConfig = aSalesConfig.filter((el) => {
                            return elPartialProd.ITEM.some((f) => {
                                return f.CHAR_NUM === el.CHAR_NUM && f.CHAR_VALUE === el.CHAR_VALUE;
                            });
                        });
                        // Check if length of filtered sales config matches with partial prod config
                        if (liPartialConfig.length === elPartialProd.ITEM.length) {
                            oSales.PRODUCT_ID = GenF.parse(elPartialProd.PRODUCT_ID);
                            break;
                        }
                    }
                }
            }
        }
       
        await INSERT(oSales).into('CP_SALES_HM');
        //  this.updateUniqueRate(oSalesHeader.LOCATION_ID, oSalesHeader.PRODUCT_ID);
        // console.log("UID Rate Updated");
    
        //Inserting into Delta table
        await cds.run(UPSERT.into("CP_SALESH_CONFIG_DELTA").entries({
            LOCATION_ID: oSalesHeader.LOCATION_ID,
            PRODUCT_ID: oSalesHeader.PRODUCT_ID,
            WEEK_DATE: matDate
        }));

        let aQuery = `SELECT DISTINCT
            -- Current week Monday
                ADD_DAYS(
                    CURRENT_DATE,
                    - (CASE DAYOFWEEK(CURRENT_DATE)
                        WHEN 1 THEN 6   -- if Sunday
                        ELSE DAYOFWEEK(CURRENT_DATE) - 2
                    END)
                ) AS CURRENT_WEEK_MONDAY,
                ADD_DAYS(
                    CURRENT_DATE,
                    - (CASE DAYOFWEEK(CURRENT_DATE)
                        WHEN 1 THEN 6
                        ELSE DAYOFWEEK(CURRENT_DATE) - 2
                    END)
                    + (CFG.VALUE * 7)
                ) AS FROZEN_END_DATE
            FROM "V_PLANNEDCONFIG" CFG
            WHERE CFG.PARAMETER_ID = 9 AND LOCATION_ID='${oSalesHeader.LOCATION_ID}'`
        var aValidDates = await cds.run(aQuery);
        if (aValidDates.length > 0 && matDate && (matDate >= aValidDates[0].CURRENT_WEEK_MONDAY && matDate <= aValidDates[0].FROZEN_END_DATE)) {
            const alertLog = [{ MSGID: 'S08', APPL: 'VCPLANNER', MSGGRP: 'DATA', LOCATION_ID: oSalesHeader.LOCATION_ID, PRODUCT_ID: oSalesHeader.PRODUCT_ID, MSGTXT: matDate }];
            await GenF.sendAlert('C', alertLog, req);
        }
 
        console.log("Process Completed");
        //Alert for actual demand and actual demand at VC
         const objCatFn = new Catservicefn();
        await objCatFn.dataValidationAlert(req,'ACTUAL_DEMAND');
        await objCatFn.dataValidationAlert(req,'ACTUAL_DEMAND_VC');
        async function createUniquePrimary(iUniqueID,oSalesHeader,UID_TYPE,aSalesConfig){
            await cds.run({
                INSERT: {
                    into: {
                        ref: ['CP_UNIQUE_ID_HEADER']
                    },
                    values: [
                        iUniqueID,
                        oSalesHeader.PRODUCT_ID,
                        iUniqueID.toString(),
                        UID_TYPE,
                        0.0,
                        true,
                        ' ',
                        '2000-01-01',
                        '9999-12-31'
                    ]
                }
            });
            (UID_TYPE == 'U') ? GenF.log("Unique ID Created: " + iUniqueID):GenF.log("Primary ID Created: " + iUniqueID)
    
            try {
                aSalesConfig = aSalesConfig.map(function (obj) {
                    return { ...obj, "UNIQUE_ID": iUniqueID };
                  })
                await cds.run({
                    INSERT: {
                        into: {
                            ref: ['CP_UNIQUE_ID_ITEM']
                        },
                        entries: aSalesConfig
                    }
                });
            } catch (e) {
                console.log(e);
            }
    
            try {
                await UPDATE`CP_USER_PREFERENCES`
                    .with({
                        PARAMETER_VALUE: iUniqueID.toString()
                    })
                    .where(`PARAMETER = 'UNIQUE_ID'`);
            } catch (e) {
                GenF.log(e);
            }
        }
        }

    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
    async processUniqueID_old(lLocation, lProduct, lHisWeeks, lSO, req,bUserSelectedWeeks) {
 
        var liSalesh = await this.getSalesHistory(lLocation, lProduct, lSO, lHisWeeks,bUserSelectedWeeks);
        GenF.log("Order Count: " + liSalesh.length);

        const liUniqueData = await this.getUnique(lProduct);
      
        let liSOHM = [];
        let lsSOHM = {};
        let liUnique = [];
        let lsUnique = {};
        const keys = ['SALES_DOC', 'SALESDOC_ITEM', 'UNIQUE_ID', 'PRIMARY_ID','LOCATION_ID','PRODUCT_ID'];
      
   // //Scenario when process is completed with config products and now need to be mapped to Partials
   // Get Partial Products
         const liPartialProd = await cds.run(
    `SELECT *
            FROM V_PARTIALPRODCHAR
            WHERE REF_PRODID    = '${lProduct}'
              AND LOCATION_ID   = '${lLocation}'
              AND PRODUCT_ID != '${lProduct}'
            ORDER BY LOCATION_ID,
                     PRODUCT_ID,
                     CLASS_NUM,
                     CHAR_NUM`
            );
            // 2024-04-26 - Begin
            let aPartialProd = [];
            if (liPartialProd.length > 0) {
                //Delete records from CP_SALES_HM which are mapped to configurable product
                await cds.run(`
                    DELETE FROM "CP_SALES_HM" WHERE (SALES_DOC,SALESDOC_ITEM,LOCATION_ID,PRODUCT_ID)
                    IN ( SELECT SALES_DOC,SALESDOC_ITEM,LOCATION_ID,PRODUCT_ID  FROM V_SALES_H
            WHERE LOCATION_ID   = '${lLocation}'
                AND REF_PRODID   = '${lProduct}'
                AND (DELETE_FLAG IS NULL OR DELETE_FLAG != 'X')
                AND PRODUCT_ID NOT IN (SELECT DISTINCT PRODUCT_ID FROM V_PARTIALPRODCHAR WHERE LOCATION_ID='${lLocation}' AND REF_PRODID='${lProduct}' AND PRODUCT_ID !='${lProduct}'))`)
                // Build nested array for Partial Product Data
                aPartialProd = liPartialProd.reduce((aProd, curr) => {
                    const ITEM = [];
                    const {
                        LOCATION_ID,
                        PRODUCT_ID,
                        CLASS_NUM,
                        CHAR_NUM,
                        CHAR_VALUE,
                    } = curr;
                    const findObj = aProd.find((o) => o.LOCATION_ID === LOCATION_ID && o.PRODUCT_ID === PRODUCT_ID);
                    if (!findObj) {
                        ITEM.push({
                            LOCATION_ID,
                            PRODUCT_ID,
                            CLASS_NUM,
                            CHAR_NUM,
                            CHAR_VALUE,
                        });
                        aProd.push({
                            LOCATION_ID,
                            PRODUCT_ID,
                            ITEM
                        });
                    } else {
                        findObj.ITEM.push({
                            LOCATION_ID,
                            PRODUCT_ID,
                            CLASS_NUM,
                            CHAR_NUM,
                            CHAR_VALUE,
                        });
                    }
                    return aProd;
                }, []);
            }
            // 2024-04-26 - End
      
        GenF.log("Started UniqueID check");
        const liSalesUnique = await cds.run(
            `SELECT *
                    FROM V_SALES_H
                    WHERE LOCATION_ID   = '${lLocation}'
                        AND REF_PRODID   = '${lProduct}'
                        AND (DELETE_FLAG IS NULL OR DELETE_FLAG != 'X')`);
        //Making as objects for optimization
        var oSales = {},oUnique ={};
          for (var x = 0; x < liSalesUnique.length; x++) {
            var key = liSalesUnique[x].SALES_DOC+"||" + liSalesUnique[x].SALESDOC_ITEM;
            if (!oSales[key]) {
                oSales[key] = [];
                }
                oSales[key].push(liSalesUnique[x]);
          }

          for (var y = 0; y < liUniqueData.length; y++) {
            var key = liUniqueData[y].UNIQUE_ID;
            liUniqueData[y].configString = JSON.stringify(liUniqueData[y].CONFIG)//Stringify here 
            if (!oUnique[key]) {
                oUnique[key] = [];
                }
                oUnique[key].push(liUniqueData[y]);
          }
        // Determine Unique ID
        const aTotalSalesh = liSalesh;
        liSalesh = await this.removeDuplicates(liSalesh);
        async function updateSimilarConfigData(sData, length, liUniqueData, _liUnique, UNIQUE_ID, PRIMARY_ID, Flag) {
            let aData = aTotalSalesh.filter(a => a.CONFIG?.length === length)?.filter(f => f.configString === sData);
            //for this data ,filter which doesn't exist in V_SALES_H
            var aReturn = [];
            for (let a = 0; a < aData?.length; a++) {
                let lsSalesUnique = {},
                    el = aData[a];
                //New
                lsSalesUnique = oSales[el.SALES_DOC+"||"+el.SALESDOC_ITEM];
                if (!lsSalesUnique) {
                    let lsSOHM = {};
                    lsSOHM['SALES_DOC'] = GenF.parse(el.SALES_DOC);
                    lsSOHM['SALESDOC_ITEM'] = GenF.parse(el.SALESDOC_ITEM);
                    lsSOHM['PRODUCT_ID'] = GenF.parse(lProduct);
                    lsSOHM['LOCATION_ID'] = GenF.parse(lLocation);
                    lsSOHM['UNIQUE_ID'] = UNIQUE_ID;
                    lsSOHM['CONFIG'] = GenF.parse(el.CONFIG);
                    lsSOHM['PCONFIG'] = GenF.parse(el.PCONFIG);
                    lsSOHM['PRIMARY_ID'] = PRIMARY_ID;
                    lsSOHM['configString'] = el.configString;
                    lsSOHM['configStringP'] = el.configStringP;
                    // lsSOHM['MATERIAL_VARIANT'] = GenF.parse(el.MATERIAL_VARIANT);
                    if (Flag != 'X' && lsSOHM['PRIMARY_ID'] === 0) { //Will be executed only if  unique_id already exists
                        lsSOHM['PRIMARY_ID'] = liUniqueData.find(f => f.configString === el.configStringP && f.UID_TYPE =='P') ?.UNIQUE_ID ?? 0;
                    }
                    aReturn.push(lsSOHM);
                }
                else if(lsSalesUnique && lsSalesUnique[0]?.PRIMARY_ID == 0){
                    let lsSOHM = {};
                    lsSOHM['SALES_DOC'] = GenF.parse(el.SALES_DOC);
                    lsSOHM['SALESDOC_ITEM'] = GenF.parse(el.SALESDOC_ITEM);
                    lsSOHM['PRODUCT_ID'] = GenF.parse(lProduct);
                    lsSOHM['LOCATION_ID'] = GenF.parse(lLocation);
                    lsSOHM['UNIQUE_ID'] = UNIQUE_ID;
                    lsSOHM['CONFIG'] = GenF.parse(el.CONFIG);
                    lsSOHM['PCONFIG'] = GenF.parse(el.PCONFIG);
                    lsSOHM['PRIMARY_ID'] = PRIMARY_ID;
                    lsSOHM['configString'] = el.configString;
                    lsSOHM['configStringP'] = el.configStringP;
                    // lsSOHM['MATERIAL_VARIANT'] = GenF.parse(el.MATERIAL_VARIANT);
                    if (Flag != 'X' && lsSOHM['PRIMARY_ID'] === 0) { //Will be executed only if  unique_id already exists
                        lsSOHM['PRIMARY_ID'] = liUniqueData.find(f => f.configString === el.configStringP && f.UID_TYPE =='P') ?.UNIQUE_ID ?? 0;
                    }
                    aReturn.push(lsSOHM);
                }
                else if(lsSalesUnique && lsSalesUnique[0]?.PRIMARY_ID !=0 ){
                    //Check if config is changed
                    let oUnique = liUniqueData.find(u=>u.UNIQUE_ID == lsSalesUnique[0].UNIQUE_ID)
                    if(oUnique){
                        if(oUnique.configString != el.configString){
                            let lsSOHM = {};
                            lsSOHM['SALES_DOC'] = GenF.parse(el.SALES_DOC);
                            lsSOHM['SALESDOC_ITEM'] = GenF.parse(el.SALESDOC_ITEM);
                            lsSOHM['PRODUCT_ID'] = GenF.parse(lProduct);
                            lsSOHM['LOCATION_ID'] = GenF.parse(lLocation);
                            lsSOHM['UNIQUE_ID'] = UNIQUE_ID;
                            lsSOHM['CONFIG'] = GenF.parse(el.CONFIG);
                            lsSOHM['PCONFIG'] = GenF.parse(el.PCONFIG);
                            lsSOHM['PRIMARY_ID'] = PRIMARY_ID;
                            lsSOHM['configString'] = el.configString;
                            lsSOHM['configStringP'] = el.configStringP;
                            // lsSOHM['MATERIAL_VARIANT'] = GenF.parse(el.MATERIAL_VARIANT);
                            if (Flag != 'X' && lsSOHM['PRIMARY_ID'] === 0) { //Will be executed only if  unique_id already exists
                                lsSOHM['PRIMARY_ID'] = liUniqueData.find(f => f.configString === el.configStringP && f.UID_TYPE =='P') ?.UNIQUE_ID ?? 0;
                            }
                            aReturn.push(lsSOHM);
                        }
                    }
                }
            }
            return aReturn;
        }
      

      
        // Determine Unique ID
        for (let cntSO = 0; cntSO < liSalesh.length; cntSO++) {
            
            // Get the existing unique ID
            let lsSalesUnique = {},oSalesH= liSalesh[cntSO];
            //New
            lsSalesUnique = oSales[oSalesH.SALES_DOC+"||"+oSalesH.SALESDOC_ITEM];
            if (lsSalesUnique) {
                // Check if there is any change in sales order config
                let lsUnique = {};
                //New
                lsUnique = oUnique[lsSalesUnique[0].UNIQUE_ID]
                if (lsUnique) {
                    if (oSalesH.configString === lsUnique[0].configString) {
                        //check for similar config and add unique_id
                        let aData = await updateSimilarConfigData(oSalesH.configString, oSalesH.CONFIG.length, liUniqueData, liUnique, lsUnique[0].UNIQUE_ID, 0, '');
                        liSOHM = liSOHM.concat(aData);
                        if(aData.filter(a=>a.PRIMARY_ID == 0 && a.SALES_DOC == oSalesH.SALES_DOC).length ==0){
                            continue;
                        }
                    }
                }
            };
      
            lsSOHM = {};
            lsSOHM['SALES_DOC'] = GenF.parse(oSalesH.SALES_DOC);
            lsSOHM['SALESDOC_ITEM'] = GenF.parse(oSalesH.SALESDOC_ITEM);
            lsSOHM['PRODUCT_ID'] = GenF.parse(lProduct);
            lsSOHM['LOCATION_ID'] = GenF.parse(lLocation);
            lsSOHM['UNIQUE_ID'] = 0;
            lsSOHM['PRIMARY_ID'] = 0;
            lsSOHM['CONFIG'] = GenF.parse(oSalesH.CONFIG);
            lsSOHM['PCONFIG'] = GenF.parse(oSalesH.PCONFIG);
            // lsSOHM['MATERIAL_VARIANT'] = GenF.parse(oSalesH.MATERIAL_VARIANT);

            if(lsSOHM['UNIQUE_ID'] === 0){
                lsSOHM['UNIQUE_ID'] = liUniqueData.find(f => f.configString === oSalesH.configString && f.UID_TYPE == 'U') ?.UNIQUE_ID ?? 0;
            }
            if(lsSOHM['PRIMARY_ID'] === 0){
                lsSOHM['PRIMARY_ID'] = liUniqueData.find(f =>f.configString === oSalesH.configStringP&& f.UID_TYPE == 'P') ?.UNIQUE_ID ?? 0;
            }
      
      
            lsUnique = {};
            lsUnique['CONFIG'] = [];
      
            var bAddSales = false;
            if (lsSOHM['UNIQUE_ID'] === 0) {
                lsUnique['CONFIG'] = oSalesH.CONFIG;
                lsUnique['UID_TYPE'] = 'U';
                // If Unique ID is already planned to be created, do not add again
                for (let cntU = 0; cntU < liUnique.length; cntU++) {
                    if (JSON.stringify(lsUnique['CONFIG']) === JSON.stringify(liUnique[cntU].CONFIG)) {
                        lsUnique['CONFIG'] = []
                        break;
                    }
                }
            }
            else{//
                bAddSales = true;
            }
            if (lsUnique['CONFIG'].length > 0) {
                lsUnique.configString = oSalesH.configString;
                liUnique.push(lsUnique);
            }
      
            lsUnique = {};
            lsUnique['CONFIG'] = [];
      
            if (lsSOHM['PRIMARY_ID'] === 0) {
                lsUnique['CONFIG'] = oSalesH.PCONFIG;
                lsUnique['UID_TYPE'] = 'P';
                // If Unique ID is already planned to be created, do not add again
                for (let cntU = 0; cntU < liUnique.length; cntU++) {
                    if (JSON.stringify(lsUnique['CONFIG']) === JSON.stringify(liUnique[cntU].CONFIG) && liUnique[cntU].UID_TYPE === 'P') {
                        lsUnique['CONFIG'] = []
                        break;
                    }
                }
            }
            else{
                bAddSales = true;
            }
            if (lsUnique['CONFIG'].length > 0) {
                lsUnique.configStringP = oSalesH.configStringP;
                liUnique.push(lsUnique);
            }
            lsSOHM.configString = oSalesH.configString;
            lsSOHM.configStringP = oSalesH.configStringP;
            // liSOHM.push(lsSOHM);
            if(bAddSales == true){//Scenario when purge is done and unique ID's exists
                let aTempData = await updateSimilarConfigData(oSalesH.configString, oSalesH.CONFIG.length, liUniqueData, [], lsSOHM['UNIQUE_ID'], lsSOHM['PRIMARY_ID'], '');
                if(aTempData.length >0){
                liSOHM = liSOHM.concat(aTempData);
                    liSOHM = GenF.removeDuplicate(liSOHM, keys);
                }
            }
            else{
                liSOHM.push(lsSOHM);
            }
        }
      
        liSalesh = null;
      
        var iUniqueId = parseInt(await GenF.getSystemConfig('UNIQUE_ID'));
      
        const lsUniqueInd = await SELECT.one.columns("MAX(UNIQUE_ID) AS MAX_ID")
            .from('CP_UNIQUE_ID_HEADER');
        if (lsUniqueInd.MAX_ID !== null) {
            iUniqueId = parseInt(lsUniqueInd.MAX_ID);
        } else {
            iUniqueId = 0;
        }
      
        if (liUnique.length > 0) {
            let iUIDCount = iUniqueId + parseInt(liUnique.length);
            if (iUniqueId !== '' && iUIDCount !== '') {
                try {
                    await UPDATE `CP_USER_PREFERENCES`
                        .with({
                            PARAMETER_VALUE: iUIDCount.toString()
                        })
                        .where(`PARAMETER = 'UNIQUE_ID'`);
                } catch (e) {
                    GenF.log(e);
                }
            }
        }
      
        let liSalesUpdate = [];
        let lsSalesUpdate = {};
        for (let cntU = 0; cntU < liUnique.length; cntU++) {
      
            if (liUnique[cntU]['CONFIG'].length > 0) {
      
                // Get the last next available unique ID number
                iUniqueId = iUniqueId + 1;
                liUnique[cntU]['UNIQUE_ID'] = iUniqueId;
      
                await cds.run({
                    INSERT: {
                        into: {
                            ref: ['CP_UNIQUE_ID_HEADER']
                        },
                        values: [
                            liUnique[cntU].UNIQUE_ID,
                            lProduct,
                            liUnique[cntU].UNIQUE_ID.toString(),
                            liUnique[cntU].UID_TYPE,
                            0.0,
                            true,
                            ' ',
                            '2000-01-01',
                            '9999-12-31'
                        ]
                    }
                });
                GenF.log("Unique ID Created: " + liUnique[cntU].UNIQUE_ID);
      
                // Insert Unique Id Config
                // Create unique ID Characteristics
                let liChar = [];
                liChar = liUnique[cntU]['CONFIG'];
                      liChar = liChar.map(function (obj) {
                          return { ...obj, "UNIQUE_ID": iUniqueId,"PRODUCT_ID":lProduct,"UID_CHAR_RATE":0 };
                        })
      
                try {
                    console.log(`Unique Id Config +${liChar.length}`);
                    await cds.run({
                        INSERT: {
                            into: {
                                ref: ['CP_UNIQUE_ID_ITEM']
                            },
                            entries: liChar
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
      
                // Process through sales Order       
      
                // Update Sales Orders with Unique ID & Primary Id
                 
                for (let cntSO = 0; cntSO < liSOHM.length; cntSO++) {
                    var bNewUniqueID = false;
                    var aSimilarConfig =[],elUnique = liUnique[cntU];
                    var el = liSOHM[cntSO];
                    if (el.UNIQUE_ID === 0 && el.configString === elUnique.configString) {
                        bNewUniqueID = true;
                        liSOHM[cntSO].UNIQUE_ID = elUnique.UNIQUE_ID;
                    }
                    if (el.PRIMARY_ID === 0 && el.configStringP === elUnique.configStringP) {
                        liSOHM[cntSO].PRIMARY_ID = elUnique.UNIQUE_ID;
                    }
                    if (bNewUniqueID) {
                        let aTempData = await updateSimilarConfigData(el.configString, el.CONFIG.length, [], [], el.UNIQUE_ID, el.PRIMARY_ID, 'X');
                        aSimilarConfig = aSimilarConfig.concat(aTempData);
                    }
                   if(aSimilarConfig.length>0){
                    liSOHM = liSOHM.concat(aSimilarConfig);//concatenate to liSOHM
                    liSOHM = GenF.removeDuplicate(liSOHM, keys);
                   }
                }
      
            }
        }
        let liPartialConfig = [];
        for (let cntSO = 0; cntSO < liSOHM.length; cntSO++) {
            let el = liSOHM[cntSO];
            // if(el.MATERIAL_VARIANT !== "" && el.MATERIAL_VARIANT !== null){
            //     el.PRODUCT_ID = el.MATERIAL_VARIANT;
            // }
            // else{
                for (let cntPC = 0; cntPC < aPartialProd.length; cntPC++) {
                    liPartialConfig = [];
                   let elPartialProd = aPartialProd[cntPC];
                    // Filter array of objects based on another array
                    liPartialConfig = el.CONFIG.filter((el) => {
                        return elPartialProd.ITEM.some((f) => {
                            return f.CHAR_NUM === el.CHAR_NUM && f.CHAR_VALUE === el.CHAR_VALUE;
                        });
                    });
                    // Check if length of filtered sales config matches with partial prod config
                    if (liPartialConfig.length === elPartialProd.ITEM.length) {
                        el.PRODUCT_ID = GenF.parse(elPartialProd.PRODUCT_ID);
                        break;
                    }
                }
            // }
           
            await cds.run(
                `DELETE FROM CP_SALES_HM
                    WHERE SALES_DOC   = '${el.SALES_DOC}'
                        AND SALESDOC_ITEM    = '${el.SALESDOC_ITEM}'`
            );
      
            lsSalesUpdate = {};
            lsSalesUpdate['SALES_DOC'] = GenF.parse(el.SALES_DOC);
            lsSalesUpdate['SALESDOC_ITEM'] = GenF.parse(el.SALESDOC_ITEM);
            lsSalesUpdate['PRODUCT_ID'] = GenF.parse(el.PRODUCT_ID);
            lsSalesUpdate['LOCATION_ID'] = GenF.parse(el.LOCATION_ID);
            lsSalesUpdate['UNIQUE_ID'] = GenF.parse(el.UNIQUE_ID);
            lsSalesUpdate['PRIMARY_ID'] = GenF.parse(el.PRIMARY_ID);
            liSalesUpdate.push(lsSalesUpdate);
      
        }
      
      
        GenF.log("Sales Orders updated Count: " + liSOHM.length);
      
        if (liSalesUpdate.length > 0) {
            const keys = ['SALES_DOC', 'SALESDOC_ITEM'];
            liSalesUpdate = GenF.removeDuplicate(liSalesUpdate, keys);
            await INSERT(liSalesUpdate).into('CP_SALES_HM');
        }
      
        console.log("Process Completed");
      
        await this.updateUniqueRate(lLocation, lProduct);
      
        console.log("UID Rate Updated");
      
      }

      async processUniqueID(lLocation, lProduct, lHisWeeks, lSO, req, bUserSelectedWeeks) {
          // Get Partial Products
          const liPartialProd = await cds.run(
            `SELECT *
                FROM V_PARTIALPRODCHAR
                WHERE REF_PRODID    = '${lProduct}'
                  AND LOCATION_ID   = '${lLocation}'
                  AND PRODUCT_ID != '${lProduct}'
                ORDER BY LOCATION_ID,
                         PRODUCT_ID,
                         CLASS_NUM,
                         CHAR_NUM`
        );
        var oData = await this.getSalesHistory(lLocation, lProduct, lSO, lHisWeeks, bUserSelectedWeeks,liPartialProd.length);
        let oUniqueID = oData.oUniqueID,
            oPrimaryID = oData.oPrimaryID,
            oSalesConfig = oData.oSalesConfig;
        // //Scenario when process is completed with config products and now need to be mapped to Partials
      
        let aPartialProd = [];
        if (liPartialProd.length > 0) {
            //Delete records from CP_SALES_HM which are mapped to configurable product
            await cds.run(`
                        DELETE FROM "CP_SALES_HM" WHERE (SALES_DOC,SALESDOC_ITEM,LOCATION_ID,PRODUCT_ID)
                        IN ( SELECT SALES_DOC,SALESDOC_ITEM,LOCATION_ID,PRODUCT_ID  FROM V_SALES_H
                WHERE LOCATION_ID   = '${lLocation}'
                    AND REF_PRODID   = '${lProduct}'
                    AND (DELETE_FLAG IS NULL OR DELETE_FLAG != 'X')
                    AND PRODUCT_ID NOT IN (SELECT DISTINCT PRODUCT_ID FROM V_PARTIALPRODCHAR WHERE LOCATION_ID='${lLocation}' AND REF_PRODID='${lProduct}' AND PRODUCT_ID !='${lProduct}'))`)
            // Build nested array for Partial Product Data
            aPartialProd = liPartialProd.reduce((aProd, curr) => {
                const ITEM = [];
                const {
                    LOCATION_ID,
                    PRODUCT_ID,
                    CLASS_NUM,
                    CHAR_NUM,
                    CHAR_VALUE,
                } = curr;
                const findObj = aProd.find((o) => o.LOCATION_ID === LOCATION_ID && o.PRODUCT_ID === PRODUCT_ID);
                if (!findObj) {
                    ITEM.push({
                        LOCATION_ID,
                        PRODUCT_ID,
                        CLASS_NUM,
                        CHAR_NUM,
                        CHAR_VALUE,
                    });
                    aProd.push({
                        LOCATION_ID,
                        PRODUCT_ID,
                        ITEM
                    });
                } else {
                    findObj.ITEM.push({
                        LOCATION_ID,
                        PRODUCT_ID,
                        CLASS_NUM,
                        CHAR_NUM,
                        CHAR_VALUE,
                    });
                }
                return aProd;
            }, []);
        }
    
        GenF.log("Started UniqueID check");
        const liUniqueData = await this.getUnique(lProduct);
    
        var iUniqueId = parseInt(await GenF.getSystemConfig('UNIQUE_ID'));
    
        const lsUniqueInd = await SELECT.one.columns("MAX(UNIQUE_ID) AS MAX_ID")
            .from('CP_UNIQUE_ID_HEADER');
        if (lsUniqueInd.MAX_ID !== null) {
            iUniqueId = parseInt(lsUniqueInd.MAX_ID);
        } else {
            iUniqueId = 0;
        }
        let liSalesUnique = await cds.run(
            `SELECT  DISTINCT SALES_DOC,SALESDOC_ITEM,PRODUCT_ID,UNIQUE_ID,PRIMARY_ID
                    FROM V_SALES_H
                    WHERE LOCATION_ID   = '${lLocation}'
                        AND REF_PRODID   = '${lProduct}'
                        AND (DELETE_FLAG IS NULL OR DELETE_FLAG != 'X')`);
        //Making as objects for optimization
        var oUnique = {},
            oPrimary = {},oSales={};
            
            for (var x = 0; x < liSalesUnique.length; x++) {
                let el = liSalesUnique[x];
                // oSales[el.SALES_DOC] ??= {};
                // oSales[el.SALES_DOC][el.SALESDOC_ITEM] ??= {};
                // oSales[el.SALES_DOC][el.SALESDOC_ITEM][el.PRODUCT_ID] ??={};
                // oSales[el.SALES_DOC][el.SALESDOC_ITEM][el.PRODUCT_ID][el.UNIQUE_ID] ??={};
                // oSales[el.SALES_DOC][el.SALESDOC_ITEM][el.PRODUCT_ID][el.UNIQUE_ID][el.PRIMARY_ID] ??='X';
                var key = el.SALES_DOC+"||" + el.SALESDOC_ITEM +"||"+el.PRODUCT_ID+"||"+el.UNIQUE_ID+"||"+el.PRIMARY_ID;
                if (!oSales[key]) {
                    oSales[key] = [];
                    }
                    oSales[key] = 'X'
            }
            liSalesUnique.length =0;
        for (var y = 0; y < liUniqueData.length; y++) {
            var key = JSON.stringify(liUniqueData[y].CONFIG);
            if (liUniqueData[y].UID_TYPE == 'U') {
                if (!oUnique[key]) {
                    oUnique[key] = [];
                }
                oUnique[key].push(liUniqueData[y]);
            } else {
                if (!oPrimary[key]) {
                    oPrimary[key] = [];
                }
                oPrimary[key].push(liUniqueData[y]);
            }
        }
    
        //Loop UniqueID's
        GenF.log("Processing Unique ID's")
        for (let u in oUniqueID) {
            //check if characteristics exists in Unique ID table
            if (!oUnique[u]) { //create unique ID
                iUniqueId = iUniqueId + 1;
                await cds.run({
                    INSERT: {
                        into: {
                            ref: ['CP_UNIQUE_ID_HEADER']
                        },
                        values: [
                            iUniqueId,
                            lProduct,
                            iUniqueId.toString(),
                            'U',
                            0.0,
                            true,
                            ' ',
                            '2000-01-01',
                            '9999-12-31'
                        ]
                    }
                });
                let liChar = [];
                liChar = JSON.parse(u).map(function (obj) {
                    return {
                        ...obj,
                        "UNIQUE_ID": iUniqueId,
                        "PRODUCT_ID": lProduct,
                        "UID_CHAR_RATE": 0,
                        CHARVAL_NUM: obj.CHAR_VALUE
                    };
                })
                try {
                    await cds.run({
                        INSERT: {
                            into: {
                                ref: ['CP_UNIQUE_ID_ITEM']
                            },
                            entries: liChar
                        }
                    });
                    GenF.log(`Unique ID ${iUniqueId} created with Config +${liChar.length}`);
                } catch (e) {
                    console.log(e);
                }
                //Map Unique ID's to sales Docs
                // let aConfig = JSON.parse(u);
                // for (var s = 0; s < oUniqueID[u].length; s++) {
                //     // oSalesConfig[oUniqueID[u][s].SALES_DOC][oUniqueID[u][s].SALESDOC_ITEM]['CONFIG'].push(JSON.parse(u));
                //     //Map Partial Product here
                //     var sProduct = lProduct;
                //     for (let cntPC = 0; cntPC < aPartialProd.length; cntPC++) {
                //         liPartialConfig = [];
                //         let elPartialProd = aPartialProd[cntPC];
                //         // Filter array of objects based on another array
                //         liPartialConfig = aConfig.filter((el) => {
                //             return elPartialProd.ITEM.some((f) => {
                //                 return f.CHAR_NUM === el.CHAR_NUM && f.CHAR_VALUE === el.CHAR_VALUE;
                //             });
                //         });
                //         // Check if length of filtered sales config matches with partial prod config
                //         if (liPartialConfig.length === elPartialProd.ITEM.length) {
                //             sProduct = GenF.parse(elPartialProd.PRODUCT_ID);
                //             break;
                //         }
                //     }
                //     oSalesConfig[oUniqueID[u][s].SALES_DOC][oUniqueID[u][s].SALESDOC_ITEM]['PRODUCT_ID'] = sProduct;
                //     oSalesConfig[oUniqueID[u][s].SALES_DOC][oUniqueID[u][s].SALESDOC_ITEM]['UID'] = iUniqueId;
                // }
                 //Map Unique ID's to sales Docs
                 let aConfig = JSON.parse(u);
                 let uniqueSales = oUniqueID[u];
 
                 for (let s = 0; s < uniqueSales.length; s++) {
                     let salesDoc = uniqueSales[s].SALES_DOC;
                     let salesItem = uniqueSales[s].SALESDOC_ITEM;
                     let sProduct = lProduct;
                     let salesConfig = oSalesConfig[salesDoc][salesItem];
                     if(salesConfig['MATERIAL_VARIANT']!='' && salesConfig['MATERIAL_VARIANT']!= null){
                         sProduct = salesConfig['MATERIAL_VARIANT'];
                     }
                     else{
                     for (let elPartialProd of aPartialProd) {
                         let liPartialConfig = aConfig.filter(el =>
                             elPartialProd.ITEM.some(f => f.CHAR_NUM === el.CHAR_NUM && f.CHAR_VALUE === el.CHAR_VALUE)
                         );
 
                         if (liPartialConfig.length === elPartialProd.ITEM.length) {
                             sProduct = GenF.parse(elPartialProd.PRODUCT_ID);
                             break;
                         }
                     }
                    }
                     salesConfig['PRODUCT_ID'] = sProduct;
                     salesConfig['UID'] =iUniqueId;
                 }
            } else {
                //Map Unique ID's to sales Docs
                let aConfig = JSON.parse(u);
                let uniqueSales = oUniqueID[u];

                for (let s = 0; s < uniqueSales.length; s++) {
                    let salesDoc = uniqueSales[s].SALES_DOC;
                    let salesItem = uniqueSales[s].SALESDOC_ITEM;
                    let sProduct = lProduct;
                    let salesConfig = oSalesConfig[salesDoc][salesItem];
                    if(salesConfig['MATERIAL_VARIANT']!='' && salesConfig['MATERIAL_VARIANT']!= null){
                        sProduct = salesConfig['MATERIAL_VARIANT'];
                    }
                    else{
                        for (let elPartialProd of aPartialProd) {
                            let liPartialConfig = aConfig.filter(el =>
                                elPartialProd.ITEM.some(f => f.CHAR_NUM === el.CHAR_NUM && f.CHAR_VALUE === el.CHAR_VALUE)
                            );
    
                            if (liPartialConfig.length === elPartialProd.ITEM.length) {
                                sProduct = GenF.parse(elPartialProd.PRODUCT_ID);
                                break;
                            }
                        }
                    }
                    salesConfig['PRODUCT_ID'] = sProduct;
                    salesConfig['UID'] = oUnique[u][0].UNIQUE_ID;
                }
            }
        }
        GenF.log("Processing Primary ID's")
        //Loop Primary ID's
        for (let p in oPrimaryID) {
            //check if characteristics exists in Unique ID table
            if (!oPrimary[p]) { //create Primary ID
                iUniqueId = iUniqueId + 1;
                await cds.run({
                    INSERT: {
                        into: {
                            ref: ['CP_UNIQUE_ID_HEADER']
                        },
                        values: [
                            iUniqueId,
                            lProduct,
                            iUniqueId.toString(),
                            'P',
                            0.0,
                            true,
                            ' ',
                            '2000-01-01',
                            '9999-12-31'
                        ]
                    }
                });
                let liChar = [];
                liChar = JSON.parse(p).map(function (obj) {
                    return {
                        ...obj,
                        "UNIQUE_ID": iUniqueId,
                        "PRODUCT_ID": lProduct,
                        "UID_CHAR_RATE": 0,
                        CHARVAL_NUM: obj.CHAR_VALUE
                    };
                })
                try {
                    await cds.run({
                        INSERT: {
                            into: {
                                ref: ['CP_UNIQUE_ID_ITEM']
                            },
                            entries: liChar
                        }
                    });
                    GenF.log(`Primary ID ${iUniqueId} created with Config +${liChar.length}`);
                } catch (e) {
                    console.log(e);
                }
                //Map Primary ID's to sales Docs
                for (var s = 0; s < oPrimaryID[p].length; s++) {
                    oSalesConfig[oPrimaryID[p][s].SALES_DOC][oPrimaryID[p][s].SALESDOC_ITEM]['PID'] = iUniqueId;
                }
            } else { //Purge
                for (var s = 0; s < oPrimaryID[p].length; s++) {
                    oSalesConfig[oPrimaryID[p][s].SALES_DOC][oPrimaryID[p][s].SALESDOC_ITEM]['PID'] = oPrimary[p][0].UNIQUE_ID;
                }
            }
        }
    
   
            try {
                await UPDATE `CP_USER_PREFERENCES`
                    .with({
                        PARAMETER_VALUE: iUniqueId.toString()
                    })
                    .where(`PARAMETER = 'UNIQUE_ID'`);
            } catch (e) {
                GenF.log(e);
            }
        
        let lsSalesUpdate = {},
            liSalesUpdate = [],aSalesForAlert=[];
            //check for Alerts
             let sQuery = `SELECT DISTINCT
-- Current week Monday
    ADD_DAYS(
        CURRENT_DATE,
        - (CASE DAYOFWEEK(CURRENT_DATE)
              WHEN 1 THEN 6   -- if Sunday
              ELSE DAYOFWEEK(CURRENT_DATE) - 2
         END)
    ) AS CURRENT_WEEK_MONDAY,
    ADD_DAYS(
        CURRENT_DATE,
        - (CASE DAYOFWEEK(CURRENT_DATE)
              WHEN 1 THEN 6
              ELSE DAYOFWEEK(CURRENT_DATE) - 2
         END)
        + (CFG.VALUE * 7)
    ) AS FROZEN_END_DATE
FROM "V_PLANNEDCONFIG" CFG
WHERE CFG.PARAMETER_ID = 9 AND LOCATION_ID='${lLocation}'`
            var aValidDates = await cds.run(sQuery);
        for (let h in oSalesConfig) {
            for (let i in oSalesConfig[h]) {
                // if(oSales[h][i][oSalesConfig[h][i]['PRODUCT_ID']][oSalesConfig[h][i]['UID']][oSalesConfig[h][i]['PID']] != 'X'){
                if(oSales[h+"||" +i+"||"+oSalesConfig[h][i]['PRODUCT_ID']+"||"+oSalesConfig[h][i]['UID']+"||"+oSalesConfig[h][i]['PID']] !='X'){
                    await cds.run(
                        `DELETE FROM CP_SALES_HM
                                WHERE SALES_DOC   = '${h}'
                                    AND SALESDOC_ITEM    = '${i}'`
                    );
        
                    lsSalesUpdate = {};
                    lsSalesUpdate['SALES_DOC'] = GenF.parse(h);
                    lsSalesUpdate['SALESDOC_ITEM'] = GenF.parse(i);
                    lsSalesUpdate['PRODUCT_ID'] = GenF.parse(oSalesConfig[h][i]['PRODUCT_ID']);
                    lsSalesUpdate['LOCATION_ID'] = GenF.parse(lLocation);
                    lsSalesUpdate['UNIQUE_ID'] = GenF.parse(oSalesConfig[h][i]['UID']);
                    lsSalesUpdate['PRIMARY_ID'] = GenF.parse(oSalesConfig[h][i]['PID']);
                    liSalesUpdate.push(lsSalesUpdate);
                    let week_date = GenF.parse(oSalesConfig[h][i]['MAT_AVAILDATE']);
                    if(aValidDates.length>0 && week_date && (lsSalesUpdate.SALES_DOC.startsWith("SE") == false) && (week_date>=aValidDates[0].CURRENT_WEEK_MONDAY && week_date<=aValidDates[0].FROZEN_END_DATE)){
                        aSalesForAlert.push(week_date)
                    }
                }
            }
        }
    
        GenF.log("Sales Orders updated Count: " + liSalesUpdate.length);
        if (liSalesUpdate.length > 0) {
            await INSERT(liSalesUpdate).into('CP_SALES_HM');
        //Alert for actual demand and actual demand at VC
         const objCatFn = new Catservicefn();
        await objCatFn.dataValidationAlert(req,'ACTUAL_DEMAND');
        await objCatFn.dataValidationAlert(req,'ACTUAL_DEMAND_VC');
        }

        //Alert only for sales orders
        if(aSalesForAlert.length>0){
        let uniqueDates = [...new Set(aSalesForAlert)]; 
        let sDates = uniqueDates.map(d => `'${d}'`).join(', ');
        if (sDates.length >= 5000) {
    sDates = sDates.slice(0, 4995) + "...";
        }
         const alertLog = [{ MSGID: 'S08', APPL: 'VCPLANNER', MSGGRP: 'DATA' , LOCATION_ID:lLocation, PRODUCT_ID:lProduct,MSGTXT:sDates}];
        await GenF.sendAlert('C', alertLog, req);
        }
        console.log("Process Completed");
        // await this.updateUniqueRate(lLocation, lProduct);
    
        // console.log("UID Rate Updated");
    }
    /**
     * 
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
    async updateUniqueRate(lLocation, lProduct) {

        const liSalesProd = await SELECT.columns(`LOCATION_ID`,
                `PRODUCT_ID`,
                `sum(ORD_QTY) as ORD_QTY`)
            .from("V_SALES_H")
            .where(`LOCATION_ID = '${lLocation}'
                                        AND REF_PRODID = '${lProduct}'`)
            .groupBy("LOCATION_ID", "PRODUCT_ID")
            .orderBy("LOCATION_ID", "PRODUCT_ID");

        const liSalesUni = await SELECT.columns(`LOCATION_ID`,
                `PRODUCT_ID`,
                "UNIQUE_ID",
                `sum(ORD_QTY) as ORD_QTY`)
            .from("V_SALES_H")
            .where(`LOCATION_ID = '${lLocation}'
                                AND REF_PRODID = '${lProduct}'`)
            .groupBy("LOCATION_ID", "PRODUCT_ID", "UNIQUE_ID")
            .orderBy("LOCATION_ID", "PRODUCT_ID", "UNIQUE_ID");

        const liSalesChar = await cds.run(
            `SELECT 
                                    V_SALES_H.LOCATION_ID,
                                    V_SALES_H.PRODUCT_ID,
                                    V_SALESH_UID_CONFIG.CHAR_NUM,
                                    V_SALESH_UID_CONFIG.CHARVAL_NUM,
                                    sum(V_SALES_H."ORD_QTY") as ORD_QTY
                                FROM 
                                    V_SALES_H
                                    INNER JOIN
                                    V_SALESH_UID_CONFIG
                                    ON V_SALES_H."SALES_DOC" = V_SALESH_UID_CONFIG."SALES_DOC"
                                        AND V_SALES_H."SALESDOC_ITEM" = V_SALESH_UID_CONFIG."SALESDOC_ITEM"
                                WHERE V_SALES_H.LOCATION_ID = '${lLocation}'
                                    AND V_SALES_H.REF_PRODID = '${lProduct}'
                                GROUP BY 
                                    V_SALES_H.LOCATION_ID,
                                    V_SALES_H.PRODUCT_ID,
                                    V_SALESH_UID_CONFIG.CHAR_NUM,
                                    V_SALESH_UID_CONFIG.CHARVAL_NUM;`
        );

        for (let cntSP = 0; cntSP < liSalesProd.length; cntSP++) {
            for (let cntUID = 0; cntUID < liSalesUni.length; cntUID++) {
                if (liSalesUni[cntUID].LOCATION_ID === liSalesProd[cntSP].LOCATION_ID &&
                    liSalesUni[cntUID].PRODUCT_ID === liSalesProd[cntSP].PRODUCT_ID) {
                    if (liSalesProd[cntSP].ORD_QTY > 0) {
                        await UPDATE `CP_UNIQUE_ID_HEADER`
                            .with({
                                UID_RATE: ((liSalesUni[cntUID].ORD_QTY * 100 / liSalesProd[cntSP].ORD_QTY)).toFixed(2)
                            })
                            .where(`UNIQUE_ID = '${liSalesUni[cntUID].UNIQUE_ID}'
                                AND PRODUCT_ID = '${lProduct}'`)

                    }
                }
            }

            for (let cntUC = 0; cntUC < liSalesChar.length; cntUC++) {
                if (liSalesChar[cntUC].LOCATION_ID === liSalesProd[cntSP].LOCATION_ID &&
                    liSalesChar[cntUC].PRODUCT_ID === liSalesProd[cntSP].PRODUCT_ID) {
                    if (liSalesProd[cntSP].ORD_QTY > 0) {
                        await UPDATE `CP_UNIQUE_ID_ITEM`
                            .with({
                                UID_CHAR_RATE: (liSalesChar[cntUC].ORD_QTY * 100 / liSalesProd[cntSP].ORD_QTY).toFixed(2)
                            })
                            .where(`PRODUCT_ID = '${lProduct}'
                                AND CHAR_NUM = '${liSalesChar[cntUC].CHAR_NUM}'
                                AND CHARVAL_NUM = '${liSalesChar[cntUC].CHARVAL_NUM}'`)
                    }
                }
            }
        }


    }
    /**
     * Get Sales History
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
   async getSalesHistory(lLocation, lProduct, lSO, lStartDate,bUserSelectedWeeks,iPartials) {

        let liSalesData = [],liSales =[],liSeedOrders=[];

        //check if delta exists in CP_SALESH_CONFIG_DELTA
        let aSalesDeltaData = await cds.run(`SELECT * FROM "CP_SALESH_CONFIG_DELTA" WHERE "LOCATION_ID"='${lLocation}' AND "PRODUCT_ID"='${lProduct}'`);
        if(bUserSelectedWeeks == true){
            //    liSales = await cds.run(
            // `SELECT A.SALES_DOC,A.SALESDOC_ITEM,B.CHAR_NUM,B.CHAR_VALUE,A.MATERIAL_VARIANT
            //             FROM CP_SALESH AS A
            //             INNER JOIN CP_SALESH_CONFIG AS B
            //                 ON A.SALES_DOC = B.SALES_DOC
            //                 AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
            //               WHERE A.LOCATION_ID   = '${lLocation}'
            //                 AND B.PRODUCT_ID    = '${lProduct}'
            //                 AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) >= '${lStartDate}'
            //             ORDER BY A.SALES_DOC,
            //                     A.SALESDOC_ITEM,
            //                     B.CHAR_NUM,
            //                     B.CHARVAL_NUM`); 

            liSales = await cds.run(`
                SELECT A.SALES_DOC,A.SALESDOC_ITEM,C.CHAR_NUM,C.CHAR_VALUE,A.MATERIAL_VARIANT,A.DELETE_FLAG,A.MAT_AVAILDATE
                        FROM CP_SALESH AS A
                        INNER JOIN V_SALES_H AS B
                            ON A.SALES_DOC = B.SALES_DOC
                            AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
                        INNER JOIN "CP_UNIQUE_ID_ITEM" AS C
                        ON B.REF_PRODID = C.PRODUCT_ID AND B.UNIQUE_ID = C.UNIQUE_ID
                          WHERE A.LOCATION_ID   = '${lLocation}'
                            AND B.REF_PRODID    = '${lProduct}'
                            AND ADD_DAYS( A.MAT_AVAILDATE, ( WEEKDAY(A.MAT_AVAILDATE) * -1 ) ) >= '${lStartDate}'
                            AND A.SALES_DOC NOT LIKE '%SE%'
                        ORDER BY A.SALES_DOC,
                                A.SALESDOC_ITEM,
                                C.CHAR_NUM,
                                C.CHAR_VALUE`);
            //Seed Orders
            liSeedOrders = await cds.run(`
                SELECT A.SALES_DOC,A.SALESDOC_ITEM,C.CHAR_NUM,C.CHAR_VALUE,A.MATERIAL_VARIANT,A.DELETE_FLAG,A.MAT_AVAILDATE
                        FROM CP_SALESH AS A
                        INNER JOIN "CP_SEEDORDER_HEADER" AS B 
                        ON A.LOCATION_ID = B.LOCATION_ID AND A.PRODUCT_ID = B.PRODUCT_ID AND A.SALES_DOC = B.SEED_ORDER
                        INNER JOIN "CP_UNIQUE_ID_ITEM" AS C
                        ON A.PRODUCT_ID = C.PRODUCT_ID AND B.UNIQUE_ID = C.UNIQUE_ID
                          WHERE A.LOCATION_ID   = '${lLocation}'
                            AND B.PRODUCT_ID    = '${lProduct}'
                            AND ADD_DAYS( A.MAT_AVAILDATE, ( WEEKDAY(A.MAT_AVAILDATE) * -1 ) ) >= '${lStartDate}'
                            AND A.SALES_DOC  LIKE '%SE%'
                        ORDER BY A.SALES_DOC,
                                A.SALESDOC_ITEM,
                                C.CHAR_NUM,
                                C.CHAR_VALUE`)
        }
        else if(aSalesDeltaData.length > 0){

            //#region OLD
            // liSales = await cds.run(
            //     `SELECT A.SALES_DOC,A.SALESDOC_ITEM,B.CHAR_NUM,B.CHAR_VALUE,A.MATERIAL_VARIANT
            //                 FROM CP_SALESH AS A
            //                 INNER JOIN CP_SALESH_CONFIG AS B
            //                     ON A.SALES_DOC = B.SALES_DOC
            //                     AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
            //                   WHERE A.LOCATION_ID   = '${lLocation}'
            //                     AND B.PRODUCT_ID    = '${lProduct}'
            //                      AND EXISTS (
            //                          SELECT 1
            //                          FROM CP_SALESH_CONFIG_DELTA AS C
            //                          WHERE C.LOCATION_ID = A.LOCATION_ID
            //                          AND C.PRODUCT_ID = B.PRODUCT_ID
            //                          AND C.WEEK_DATE = A.MAT_AVAILDATE
            //                         )
            //                 ORDER BY A.SALES_DOC,
            //                         A.SALESDOC_ITEM,
            //                         B.CHAR_NUM,
            //                         B.CHARVAL_NUM`);
            //#endregion
            
            liSales = await cds.run(
                `SELECT A.SALES_DOC,A.SALESDOC_ITEM,C.CHAR_NUM,C.CHAR_VALUE,A.MATERIAL_VARIANT,A.DELETE_FLAG,A.MAT_AVAILDATE
                            FROM CP_SALESH AS A
                         INNER JOIN V_SALES_H AS B
                            ON A.SALES_DOC = B.SALES_DOC
                            AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
                        INNER JOIN "CP_UNIQUE_ID_ITEM" AS C
                        ON B.REF_PRODID = C.PRODUCT_ID AND B.UNIQUE_ID = C.UNIQUE_ID
                              WHERE A.LOCATION_ID   = '${lLocation}'
                                AND B.REF_PRODID    = '${lProduct}'
                                 AND EXISTS (
                                     SELECT 1
                                     FROM CP_SALESH_CONFIG_DELTA AS C
                                     WHERE C.LOCATION_ID = A.LOCATION_ID
                                     AND C.PRODUCT_ID = B.REF_PRODID
                                     AND C.WEEK_DATE = A.MAT_AVAILDATE
                                    )
                                 AND A.SALES_DOC NOT LIKE '%SE%'
                            ORDER BY A.SALES_DOC,
                                    A.SALESDOC_ITEM,
                                    C.CHAR_NUM,
                                    C.CHAR_VALUE`);


            //Seed orders
            liSeedOrders = await cds.run(`
                SELECT A.SALES_DOC,A.SALESDOC_ITEM,C.CHAR_NUM,C.CHAR_VALUE,A.MATERIAL_VARIANT,A.DELETE_FLAG,A.MAT_AVAILDATE
                            FROM CP_SALESH AS A
                        INNER JOIN "CP_SEEDORDER_HEADER" AS B 
                        ON A.LOCATION_ID = B.LOCATION_ID AND A.PRODUCT_ID = B.PRODUCT_ID AND A.SALES_DOC = B.SEED_ORDER
                        INNER JOIN "CP_UNIQUE_ID_ITEM" AS C
                        ON A.PRODUCT_ID = C.PRODUCT_ID AND B.UNIQUE_ID = C.UNIQUE_ID
                              WHERE A.LOCATION_ID   = '${lLocation}'
                                AND B.PRODUCT_ID    = '${lProduct}'
                                 AND EXISTS (
                                     SELECT 1
                                     FROM CP_SALESH_CONFIG_DELTA AS C
                                     WHERE C.LOCATION_ID = A.LOCATION_ID
                                     AND C.PRODUCT_ID = B.PRODUCT_ID
                                     AND C.WEEK_DATE = A.MAT_AVAILDATE
                                    )
                                  AND A.SALES_DOC  LIKE '%SE%'
                            ORDER BY A.SALES_DOC,
                                    A.SALESDOC_ITEM,
                                    C.CHAR_NUM,
                                    C.CHAR_VALUE`)

                if(iPartials >0){
            //         var liSalesforDeletion = await cds.run(`SELECT  A.SALES_DOC,A.SALESDOC_ITEM,B.CHAR_NUM,B.CHAR_VALUE,A.MATERIAL_VARIANT
            //             FROM CP_SALESH AS A
            //             INNER JOIN CP_SALESH_CONFIG AS B
            //                 ON A.SALES_DOC = B.SALES_DOC
            //                 AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
            //               WHERE A.LOCATION_ID   = '${lLocation}'
            //                 AND B.PRODUCT_ID    = '${lProduct}'
            //                 AND A.SALES_DOC IN (SELECT DISTINCT SALES_DOC FROM "CP_SALES_HM" WHERE (SALES_DOC,SALESDOC_ITEM,LOCATION_ID,PRODUCT_ID)
            //         IN ( SELECT SALES_DOC,SALESDOC_ITEM,LOCATION_ID,PRODUCT_ID  FROM V_SALES_H
            // WHERE LOCATION_ID   = '${lLocation}'
            //     AND REF_PRODID   = '${lProduct}'
            //     AND (DELETE_FLAG IS NULL OR DELETE_FLAG != 'X')
            //     AND PRODUCT_ID NOT IN (SELECT DISTINCT PRODUCT_ID FROM V_PARTIALPRODCHAR WHERE LOCATION_ID='${lLocation}' AND REF_PRODID='${lProduct}' AND PRODUCT_ID !='${lProduct}')))
            //     ORDER BY A.SALES_DOC,
            //                         A.SALESDOC_ITEM,
            //                         B.CHAR_NUM,
            //                         B.CHARVAL_NUM`);

                                    var liSalesforDeletion =     await cds.run(`SELECT  A.SALES_DOC,A.SALESDOC_ITEM,C.CHAR_NUM,C.CHAR_VALUE,A.MATERIAL_VARIANT,A.DELETE_FLAG,A.MAT_AVAILDATE
                        FROM CP_SALESH AS A
                       INNER JOIN CP_SALES_HM AS B
                            ON A.SALES_DOC = B.SALES_DOC
                            AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
                        INNER JOIN "CP_UNIQUE_ID_ITEM" AS C
                        ON B.PRODUCT_ID = C.PRODUCT_ID AND B.UNIQUE_ID = C.UNIQUE_ID
                          WHERE A.LOCATION_ID   = '${lLocation}'
                            AND B.PRODUCT_ID    = '${lProduct}'
                            AND A.SALES_DOC IN (SELECT DISTINCT SALES_DOC FROM "CP_SALES_HM" WHERE (SALES_DOC,SALESDOC_ITEM,LOCATION_ID,PRODUCT_ID)
                    IN ( SELECT SALES_DOC,SALESDOC_ITEM,LOCATION_ID,PRODUCT_ID  FROM V_SALES_H
            WHERE LOCATION_ID   = '${lLocation}'
                AND REF_PRODID   = '${lProduct}'
                AND (DELETE_FLAG IS NULL OR DELETE_FLAG != 'X')
                AND PRODUCT_ID NOT IN (SELECT DISTINCT PRODUCT_ID FROM V_PARTIALPRODCHAR WHERE LOCATION_ID='${lLocation}' AND REF_PRODID='${lProduct}' AND PRODUCT_ID !='${lProduct}')))
                ORDER BY A.SALES_DOC,
                                    A.SALESDOC_ITEM,
                                    C.CHAR_NUM,
                                    C.CHAR_VALUE`)
              
                liSales = liSales.concat(liSalesforDeletion)
                const keys = ['SALES_DOC', 'SALESDOC_ITEM',"CHAR_NUM","CHAR_VALUE","MATERIAL_VARIANT"];
                liSales = await GenF.removeDuplicate(liSales, keys);
           
            }
               
                  
        }
        else{
            // liSales = await cds.run(
            //     `SELECT A.SALES_DOC,A.SALESDOC_ITEM,B.CHAR_NUM,B.CHAR_VALUE,A.MATERIAL_VARIANT
            //                 FROM CP_SALESH AS A
            //                 INNER JOIN CP_SALESH_CONFIG AS B
            //                     ON A.SALES_DOC = B.SALES_DOC
            //                     AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
            //                   WHERE A.LOCATION_ID   = '${lLocation}'
            //                     AND B.PRODUCT_ID    = '${lProduct}'
            //                     AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) >= '${lStartDate}'
            //                 ORDER BY A.SALES_DOC,
            //                         A.SALESDOC_ITEM,
            //                         B.CHAR_NUM,
            //                         B.CHARVAL_NUM`);

            liSales = await cds.run(`
                SELECT A.SALES_DOC,A.SALESDOC_ITEM,C.CHAR_NUM,C.CHAR_VALUE,A.MATERIAL_VARIANT,A.DELETE_FLAG,A.MAT_AVAILDATE
                            FROM CP_SALESH AS A
                           INNER JOIN V_SALES_H AS B
                            ON A.SALES_DOC = B.SALES_DOC
                            AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
                        INNER JOIN "CP_UNIQUE_ID_ITEM" AS C
                        ON B.REF_PRODID = C.PRODUCT_ID AND B.UNIQUE_ID = C.UNIQUE_ID
                              WHERE A.LOCATION_ID   = '${lLocation}'
                                AND B.REF_PRODID    = '${lProduct}'
                                AND ADD_DAYS( A.MAT_AVAILDATE, ( WEEKDAY(A.MAT_AVAILDATE) * -1 ) ) >= '${lStartDate}'
                                 AND A.SALES_DOC NOT LIKE '%SE%'
                            ORDER BY A.SALES_DOC,
                                    A.SALESDOC_ITEM,
                                    C.CHAR_NUM,
                                    C.CHAR_VALUE`);
            //Seed orders
            liSeedOrders = await cds.run(`
                SELECT A.SALES_DOC,A.SALESDOC_ITEM,C.CHAR_NUM,C.CHAR_VALUE,A.MATERIAL_VARIANT,A.DELETE_FLAG,A.MAT_AVAILDATE
                            FROM CP_SALESH AS A
                         INNER JOIN "CP_SEEDORDER_HEADER" AS B 
                        ON A.LOCATION_ID = B.LOCATION_ID AND A.PRODUCT_ID = B.PRODUCT_ID AND A.SALES_DOC = B.SEED_ORDER
                        INNER JOIN "CP_UNIQUE_ID_ITEM" AS C
                        ON A.PRODUCT_ID = C.PRODUCT_ID AND B.UNIQUE_ID = C.UNIQUE_ID
                              WHERE A.LOCATION_ID   = '${lLocation}'
                                AND B.PRODUCT_ID    = '${lProduct}'
                                AND ADD_DAYS( A.MAT_AVAILDATE, ( WEEKDAY(A.MAT_AVAILDATE) * -1 ) ) >= '${lStartDate}'
                                 AND A.SALES_DOC  LIKE '%SE%'
                            ORDER BY A.SALES_DOC,
                                    A.SALESDOC_ITEM,
                                    C.CHAR_NUM,
                                    C.CHAR_VALUE
                `)

        }
        //Append seed orders to liSales
        liSales = liSales.concat(liSeedOrders);
        liSales = await GenF.removeDuplicate(liSales, ['SALES_DOC', 'SALESDOC_ITEM',"CHAR_NUM","CHAR_VALUE","MATERIAL_VARIANT"]);
            let aDeleted = liSales.filter(s=>s.DELETE_FLAG == 'X');
            if(aDeleted.length>0){//If there are any deleted sales doc, loop and proceed with making unique,primary ID's as inactive
                let aInactive = await cds.run(`SELECT *
                    FROM V_SALES_H
                    WHERE LOCATION_ID   = '${lLocation}'
                        AND REF_PRODID   = '${lProduct}'
                        AND DELETE_FLAG = 'X'
                          AND NOT EXISTS (
                                SELECT 1
                                FROM V_SALES_H AS T
                                WHERE T.UNIQUE_ID = V_SALES_H.UNIQUE_ID
                                AND T.PRIMARY_ID = V_SALES_H.PRIMARY_ID
                                AND T.SALES_DOC <> V_SALES_H.SALES_DOC
                                )`);
                    if(aInactive?.length>0){
                        for(let u = 0 ; u <aInactive?.length ; u++){
                            await UPDATE `CP_UNIQUE_ID_HEADER`
                            .with({
                                ACTIVE: false
                            })
                            .where(`UNIQUE_ID = '${aInactive[u].UNIQUE_ID}'`);

                            // await UPDATE `CP_UNIQUE_ID_HEADER`
                            // .with({
                            //     ACTIVE: false
                            // })
                            // .where(`UNIQUE_ID = '${aInactive[u].PRIMARY_ID}'`);
                        }
                    }

            }
            liSalesData = liSales.filter(s=>s.DELETE_FLAG != 'X');

        let liPriChar = [];

        liPriChar = await cds.run(`SELECT "CHAR_NUM"
                                         FROM "CP_VARCHAR_PS"
                                        WHERE "PRODUCT_ID" = '${lProduct}'
                                          AND "CHAR_TYPE" = 'P'`);

         var oPriChar = {};
          for (var x = 0; x < liPriChar.length; x++) {
            var key = liPriChar[x].CHAR_NUM;
            if (!oPriChar[key]) {
                oPriChar[key] = [];
                }
                oPriChar[key].push(liPriChar[x]);
          }
          liPriChar.length = 0;

        var iSalesLength  = liSalesData.length;
        var oSalesConfig ={};
        for (let cntSO = 0; cntSO < iSalesLength; cntSO++) {
            let el = liSalesData[cntSO],oChar = {
                "CHAR_NUM":el.CHAR_NUM,
                "CHARVAL_NUM":el.CHAR_VALUE,
                "CHAR_VALUE":el.CHAR_VALUE
            };
            oSalesConfig[el.SALES_DOC] ??= {};
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM] ??= {};
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['UID'] ??=[];
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['PID'] ??=[];
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['CONFIG'] ??=[];
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['LOCATION_ID'] ??='';
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['PRODUCT_ID'] ??='';
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['MATERIAL_VARIANT'] ??='';
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['MAT_AVAILDATE'] ??='';
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['LOCATION_ID'] = lLocation;
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['PRODUCT_ID'] = lProduct;
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['MATERIAL_VARIANT'] =el.MATERIAL_VARIANT;
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['MAT_AVAILDATE'] =el.MAT_AVAILDATE;
            oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['UID'].push(oChar);
            
            if(oPriChar[el.CHAR_NUM]){
                oSalesConfig[el.SALES_DOC][el.SALESDOC_ITEM]['PID'].push(oChar);
            }
            
        }
        liSalesData.length = 0;
        let oUniqueID={},oPrimaryID={};
        for(let h in oSalesConfig){
            for(let i in oSalesConfig[h]){
                let sUnique = JSON.stringify(oSalesConfig[h][i]['UID']);
                let sPrimary = JSON.stringify(oSalesConfig[h][i]['PID']);
                oUniqueID [sUnique] ??=[];
                oPrimaryID [sPrimary] ??=[];
                oUniqueID [sUnique].push({
                    SALES_DOC : h,
                    SALESDOC_ITEM : i
                })

                oPrimaryID [sPrimary].push({
                    SALES_DOC : h,
                    SALESDOC_ITEM : i
                })
                oSalesConfig[h][i]['UID'] =0;
                oSalesConfig[h][i]['PID'] =0;
            }
        }
        return{
            oUniqueID :oUniqueID,
            oPrimaryID:oPrimaryID,
            oSalesConfig:oSalesConfig
        }
    }

    async getSalesHistory_old(lLocation, lProduct, lSO, lStartDate,bUserSelectedWeeks) {

        let liSalesData = [],liSales =[];

        //check if delta exists in CP_SALESH_CONFIG_DELTA
        let aSalesDeltaData = await cds.run(`SELECT * FROM "CP_SALESH_CONFIG_DELTA" WHERE "LOCATION_ID"='${lLocation}' AND "PRODUCT_ID"='${lProduct}'`);
        if(bUserSelectedWeeks == true){
            liSales = await cds.run(
                `SELECT *
                            FROM CP_SALESH AS A
                            INNER JOIN CP_SALESH_CONFIG AS B
                                ON A.SALES_DOC = B.SALES_DOC
                                AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
                              WHERE A.LOCATION_ID   = '${lLocation}'
                                AND B.PRODUCT_ID    = '${lProduct}'
                                AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) >= '${lStartDate}'
                            ORDER BY A.SALES_DOC,
                                    A.SALESDOC_ITEM,
                                    B.CHAR_NUM,
                                    B.CHARVAL_NUM`);
        }
        else if(aSalesDeltaData.length > 0){
            liSales = await cds.run(
                `SELECT *
                            FROM CP_SALESH AS A
                            INNER JOIN CP_SALESH_CONFIG AS B
                                ON A.SALES_DOC = B.SALES_DOC
                                AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
                              WHERE A.LOCATION_ID   = '${lLocation}'
                                AND B.PRODUCT_ID    = '${lProduct}'
                                 AND EXISTS (
                                     SELECT 1
                                     FROM CP_SALESH_CONFIG_DELTA AS C
                                     WHERE C.LOCATION_ID = A.LOCATION_ID
                                     AND C.PRODUCT_ID = B.PRODUCT_ID
                                     AND C.WEEK_DATE = A.MAT_AVAILDATE
                                    )
                            ORDER BY A.SALES_DOC,
                                    A.SALESDOC_ITEM,
                                    B.CHAR_NUM,
                                    B.CHARVAL_NUM`);
        }
        else{
            liSales = await cds.run(
                `SELECT *
                            FROM CP_SALESH AS A
                            INNER JOIN CP_SALESH_CONFIG AS B
                                ON A.SALES_DOC = B.SALES_DOC
                                AND A.SALESDOC_ITEM = B.SALESDOC_ITEM
                              WHERE A.LOCATION_ID   = '${lLocation}'
                                AND B.PRODUCT_ID    = '${lProduct}'
                                AND ADD_DAYS( MAT_AVAILDATE, ( WEEKDAY(MAT_AVAILDATE) * -1 ) ) >= '${lStartDate}'
                            ORDER BY A.SALES_DOC,
                                    A.SALESDOC_ITEM,
                                    B.CHAR_NUM,
                                    B.CHARVAL_NUM`);
        }
       
                               
            let aDeleted = liSales.filter(s=>s.DELETE_FLAG == 'X');
            if(aDeleted.length>0){//If there are any deleted sales doc, loop and proceed with making unique,primary ID's as inactive
                let aInactive = await cds.run(`SELECT *
                    FROM V_SALES_H
                    WHERE LOCATION_ID   = '${lLocation}'
                        AND REF_PRODID   = '${lProduct}'
                        AND DELETE_FLAG = 'X'
                          AND NOT EXISTS (
                                SELECT 1
                                FROM V_SALES_H AS T
                                WHERE T.UNIQUE_ID = V_SALES_H.UNIQUE_ID
                                AND T.PRIMARY_ID = V_SALES_H.PRIMARY_ID
                                AND T.SALES_DOC <> V_SALES_H.SALES_DOC
                                )`);
                    if(aInactive?.length>0){
                        for(let u = 0 ; u <aInactive?.length ; u++){
                            await UPDATE `CP_UNIQUE_ID_HEADER`
                            .with({
                                ACTIVE: false
                            })
                            .where(`UNIQUE_ID = '${aInactive[u].UNIQUE_ID}'`);

                            await UPDATE `CP_UNIQUE_ID_HEADER`
                            .with({
                                ACTIVE: false
                            })
                            .where(`UNIQUE_ID = '${aInactive[u].PRIMARY_ID}'`);
                        }
                    }

            }
            liSalesData = liSales.filter(s=>s.DELETE_FLAG != 'X');

        let liPriChar = [];

        liPriChar = await cds.run(`SELECT "CHAR_NUM"
                                         FROM "CP_VARCHAR_PS"
                                        WHERE "PRODUCT_ID" = '${lProduct}'
                                          AND "CHAR_TYPE" = 'P'`)
        let liSalesh = [];
        let lsSalesh = {};
        let lsSaleshConfig = {};

        for (let cntSO = 0; cntSO < liSalesData.length; cntSO++) {
            if (cntSO === 0 ||
                liSalesData[cntSO].SALES_DOC !== liSalesData[GenF.subOne(cntSO, liSalesData.length)].SALES_DOC ||
                liSalesData[cntSO].SALESDOC_ITEM !== liSalesData[GenF.subOne(cntSO, liSalesData.length)].SALESDOC_ITEM) {
                lsSalesh = {};
                lsSalesh['SALES_DOC'] = GenF.parse(liSalesData[cntSO].SALES_DOC);
                lsSalesh['SALESDOC_ITEM'] = GenF.parse(liSalesData[cntSO].SALESDOC_ITEM);
                lsSalesh['CONFIG'] = [];
                lsSalesh['PCONFIG'] = [];
            }

            lsSaleshConfig = {};
            lsSaleshConfig['CHAR_NUM'] = GenF.parse(liSalesData[cntSO].CHAR_NUM);
            lsSaleshConfig['CHARVAL_NUM'] = GenF.parse(liSalesData[cntSO].CHAR_VALUE);
            lsSaleshConfig['CHAR_VALUE'] = GenF.parse(liSalesData[cntSO].CHAR_VALUE);
            // lsSalesh['MATERIAL_VARIANT'] = GenF.parse(liSalesData[cntSO].MATERIAL_VARIANT);
            lsSalesh['CONFIG'].push(lsSaleshConfig);

            let lsTempPriChar = {};
            lsTempPriChar = liPriChar.find((lsChar) =>
                lsChar.CHAR_NUM === liSalesData[cntSO].CHAR_NUM
            );
            if (lsTempPriChar) {
                lsSalesh['PCONFIG'].push(lsSaleshConfig);
            }

            /*
            for (let cntPC = 0; cntPC < liPriChar.length; cntPC++) {
                if (liSalesData[cntSO].CHAR_NUM === liPriChar[cntPC].CHAR_NUM) {
                    lsSaleshConfig = {};
                    lsSaleshConfig['CHAR_NUM'] = GenF.parse(liSalesData[cntSO].CHAR_NUM);
                    lsSaleshConfig['CHARVAL_NUM'] = GenF.parse(liSalesData[cntSO].CHAR_VALUE);
                    lsSaleshConfig['CHAR_VALUE'] = GenF.parse(liSalesData[cntSO].CHAR_VALUE);
                    lsSalesh['PCONFIG'].push(lsSaleshConfig);
                    break;
                }
            }
            */

            if (cntSO === GenF.addOne(cntSO, liSalesData.length) ||
                liSalesData[cntSO].SALES_DOC !== liSalesData[GenF.addOne(cntSO, liSalesData.length)].SALES_DOC ||
                liSalesData[cntSO].SALESDOC_ITEM !== liSalesData[GenF.addOne(cntSO, liSalesData.length)].SALESDOC_ITEM) {
                    lsSalesh.configString = JSON.stringify(lsSalesh.CONFIG);
                    lsSalesh.configStringP = JSON.stringify(lsSalesh.PCONFIG);
                liSalesh.push(lsSalesh);
            }
        }

        return liSalesh;
    }

    /**
     * Get Unique ID
     * @param {Location} lLocation 
     * @param {Product} lProduct 
     */
    async getUnique(lProduct) {

        const liUniqueGet = await cds.run(
            `SELECT "UNIQUE_ID",
                        "PRODUCT_ID",
                        "CHAR_NUM",
                        "CHAR_VALUE",
                        "UID_TYPE"
                   FROM "V_UNIQUE_ID"
                  WHERE PRODUCT_ID  = '${lProduct}'
                ORDER BY UNIQUE_ID,
                         PRODUCT_ID,
                         CHAR_NUM,
                         CHAR_VALUE,
                         UID_TYPE`
        );

        let lsUniqueConfig = {};
        let lsUnique = {};
        let liUniqueData = [];

        for (let cntU = 0; cntU < liUniqueGet.length; cntU++) {
            if (cntU === 0 ||
                liUniqueGet[cntU].UNIQUE_ID !== liUniqueGet[GenF.subOne(cntU, liUniqueGet.length)].UNIQUE_ID ||
                liUniqueGet[cntU].PRODUCT_ID !== liUniqueGet[GenF.subOne(cntU, liUniqueGet.length)].PRODUCT_ID) {
                lsUnique = {};
                lsUnique['UNIQUE_ID'] = GenF.parse(liUniqueGet[cntU].UNIQUE_ID);
                lsUnique['PRODUCT_ID'] = GenF.parse(liUniqueGet[cntU].PRODUCT_ID);
                lsUnique['UID_TYPE'] = GenF.parse(liUniqueGet[cntU].UID_TYPE);
                lsUnique['CONFIG'] = [];
            }
            lsUniqueConfig = {};
            lsUniqueConfig['CHAR_NUM'] = GenF.parse(liUniqueGet[cntU].CHAR_NUM);
            lsUniqueConfig['CHARVAL_NUM'] = GenF.parse(liUniqueGet[cntU].CHAR_VALUE);
            lsUniqueConfig['CHAR_VALUE'] = GenF.parse(liUniqueGet[cntU].CHAR_VALUE);
            lsUnique['CONFIG'].push(lsUniqueConfig);

            if (cntU === GenF.addOne(cntU, liUniqueGet.length) ||
                liUniqueGet[cntU].UNIQUE_ID !== liUniqueGet[GenF.addOne(cntU, liUniqueGet.length)].UNIQUE_ID ||
                liUniqueGet[cntU].PRODUCT_ID !== liUniqueGet[GenF.addOne(cntU, liUniqueGet.length)].PRODUCT_ID) {
                liUniqueData.push(lsUnique);
            }
        }

        return liUniqueData;
    }

    /**
     * Generate Dummy Product for BOM under alternate locations
     */
    async generateDummy() {
        const objCatFn = new Catservicefn();
        objCatFn.getDummyProd();
    }


    /**
     * Function to update primary ids validity dates
     * @param {*} lLocation 
     * @param {*} lProduct 
     */
    async updatePrimaryIdValidity(lLocation, lProduct) {
        let aFilUniqueID = [],
            aFilUniqueIDHdr = [];

        let aPrimaryIdHeader = await cds.run(`SELECT *
                                                    FROM CP_UNIQUE_ID_HEADER
                                                    WHERE PRODUCT_ID = '${lProduct}'
                                                      AND UID_TYPE = 'P'`);

        if (aPrimaryIdHeader.length > 0) {
            // Loop through each Primary Id 
            for (let iPid = 0; iPid < aPrimaryIdHeader.length; iPid++) {
                try {
                    // Update Valid From and Valid To of Primary Ids 
                    await UPDATE `CP_UNIQUE_ID_HEADER`
                        .with({
                            VALID_FROM: '2000-01-01',
                            VALID_TO: '9999-12-31'
                        })
                        .where(`UNIQUE_ID = '${aPrimaryIdHeader[iPid].UNIQUE_ID}'
                       AND PRODUCT_ID = '${lProduct}'`);
                } catch (e) {
                    console.log('Unable to update validity date for primary id:' + aPrimaryIdHeader[iPid].UNIQUE_ID);
                    console.log(e);
                }
            }
        }


        /**
        // Get Unique & Primary Ids header data for Config Product
        let aUniqPriIdHeader = await cds.run(`SELECT *
                                               FROM CP_UNIQUE_ID_HEADER
                                              WHERE PRODUCT_ID = '${lProduct}'`);

        // Get mapping of Unique & Primary Ids for Location-Config Product from sales history
        let aUniPriIds = await cds.run(`SELECT DISTINCT 
                                               UNIQUE_ID,
                                               PRIMARY_ID
                                          FROM V_SALES_H
                                         WHERE LOCATION_ID = '${lLocation}'
                                           AND REF_PRODID = '${lProduct}'`);


        // Split an Array into an object of arrays based on UID TYPE(U, P)
        let oUIDPIDs = aUniqPriIdHeader.reduce((aCurrData, item) => {
            if (!aCurrData[item.UID_TYPE]) {
                aCurrData[item.UID_TYPE] = [];
            }

            aCurrData[item.UID_TYPE].push(item);
            return aCurrData;
        }, {});

        // If Unique Ids and Primary Ids are defined
        if (oUIDPIDs !== undefined) {
            let aPID = [], aUID = [];
            if (oUIDPIDs.P !== undefined && oUIDPIDs.P !== " ") {
                aPID = oUIDPIDs.P;
            }
            aUID = oUIDPIDs.U;
            if (aPID.length > 0) {
                // Loop through each Primary Id 
                for (let iPid = 0; iPid < aPID.length; iPid++) {
                    aFilUniqueID = [];
                    aFilUniqueIDHdr = [];
                    // Filter Primary Ids to get Unique IDs mapped to it
                    aFilUniqueID = aUniPriIds.filter(function (aUIDs) {
                        return aUIDs.PRIMARY_ID === aPID[iPid].UNIQUE_ID;
                    });

                    if (aFilUniqueID.length > 0) {
                        // Filter an array of Objects based on another array
                        // For the above filtered Unique IDs get header details (Valid From and Valid To)
                        aFilUniqueIDHdr = aUID.filter((elem) => {
                            return aFilUniqueID.some((ele) => {
                                return ele.UNIQUE_ID === elem.UNIQUE_ID;
                            });
                        });
                        if (aFilUniqueIDHdr.length > 0) {
                            // // Get Minimum Valid From and Maximum ValidTo from an array of Unique Ids
                            // aPID[iPid].VALID_FROM = aFilUniqueIDHdr.reduce((min, p) => p.VALID_FROM < min ? p.VALID_FROM : min, aFilUniqueIDHdr[0].VALID_FROM);
                            // aPID[iPid].VALID_TO = aFilUniqueIDHdr.reduce((max, p) => p.VALID_TO > max ? p.VALID_TO : max, aFilUniqueIDHdr[0].VALID_TO);

                            try {
                                // Update Valid From and Valid To of Primary Ids based on Rules
                                await UPDATE`CP_UNIQUE_ID_HEADER`
                                    .with({
                                        VALID_FROM: '2000-01-01',
                                        VALID_TO: '9999-12-31'
                                    })
                                    .where(`UNIQUE_ID = '${aPID[iPid].UNIQUE_ID}'
                                   AND PRODUCT_ID = '${lProduct}'`);
                                // await UPDATE`CP_UNIQUE_ID_HEADER`
                                //     .with({
                                //         VALID_FROM: aPID[iPid].VALID_FROM,
                                //         VALID_TO: aPID[iPid].VALID_TO
                                //     })
                                //     .where(`UNIQUE_ID = '${aPID[iPid].UNIQUE_ID}'
                                //    AND PRODUCT_ID = '${lProduct}'`);
                            } catch (e) {
                                console.log('Unable to update validity date for primary id:' + aPID[iPid].UNIQUE_I);
                                console.log(e);
                            }
                        }
                    }

                }
            }

        }
        */
    }

    /**
     * Function to process unique id valid from and valid to and update at each partial product characteristic level
     * @param {Location} lLocation
     * @param {Product} lProduct
     */

    async genConfigValidity(lLocation, lProduct) {

        let oPartialProdConfig = {},
            aPartialProdConfig = [];


        // Get all Characteristic Values for Location-Config Product

        let aDistLocProdConfig = await cds.run(`SELECT DISTINCT PRODUCT_ID,
                                                        CLASS_NUM,
                                                        CHAR_NUM,
                                                        CHAR_VALUE
                                                    FROM V_PARTIALPRODCLASSCHAR
                                                    WHERE LOCATION_ID = '${lLocation}'
                                                    AND REF_PRODID = '${lProduct}'`);

            //Delete CP_PARTIALPROD_CHAR_VALIDITY
            await cds.run(

                `DELETE FROM CP_PARTIALPROD_CHAR_VALIDITY
                  WHERE (PRODUCT_ID,CLASS_NUM,CHAR_NUM,CHAR_VALUE) IN  (SELECT DISTINCT PRODUCT_ID,
                                                        CLASS_NUM,
                                                        CHAR_NUM,
                                                        CHAR_VALUE
                                                    FROM V_PARTIALPRODCLASSCHAR
                                                    WHERE LOCATION_ID = '${lLocation}'
                                                    AND REF_PRODID = '${lProduct}')`
            );

        // Get all the Unique Characteristics from Sales History

        let aUniqChar = await cds.run(`SELECT DISTINCT V_SALES_H.LOCATION_ID,
                                               V_SALES_H.PRODUCT_ID,
                                               V_UNIQUE_ID_ITEM.UNIQUE_ID,
                                               V_UNIQUE_ID_ITEM.CLASS_NUM,
                                               V_UNIQUE_ID_ITEM.CHAR_NUM,
                                               V_UNIQUE_ID_ITEM.CHAR_VALUE,
                                               V_UNIQUE_ID_ITEM.VALID_FROM,
                                               V_UNIQUE_ID_ITEM.VALID_TO
                                            FROM V_SALES_H
                                            JOIN V_UNIQUE_ID_ITEM
                                              ON V_SALES_H.UNIQUE_ID = V_UNIQUE_ID_ITEM.UNIQUE_ID 
                                            WHERE V_SALES_H.LOCATION_ID = '${lLocation}'
                                              AND V_SALES_H.REF_PRODID = '${lProduct}'`);

            var oUniqueChar ={};
        for (let u = 0; u < aUniqChar.length; u++) {
            let el = aUniqChar[u];
            oUniqueChar[el.CLASS_NUM] ??= {};
            oUniqueChar[el.CLASS_NUM][el.CHAR_NUM] ??= {};
            oUniqueChar[el.CLASS_NUM][el.CHAR_NUM][el.CHAR_VALUE] ??=[];
            oUniqueChar[el.CLASS_NUM][el.CHAR_NUM][el.CHAR_VALUE].push(el);
            
        }
        aUniqChar.length =0;
        if (aDistLocProdConfig.length > 0) {

            for (let iProds = 0; iProds < aDistLocProdConfig.length; iProds++) {
                oPartialProdConfig = {};
                let el = aDistLocProdConfig[iProds];
                // await cds.run(

                //     `DELETE FROM CP_PARTIALPROD_CHAR_VALIDITY
                //       WHERE PRODUCT_ID     = '${aDistLocProdConfig[iProds].PRODUCT_ID}'
                //         AND CLASS_NUM      = '${aDistLocProdConfig[iProds].CLASS_NUM}'
                //         AND CHAR_NUM       = '${aDistLocProdConfig[iProds].CHAR_NUM}'
                //         AND CHAR_VALUE    = '${aDistLocProdConfig[iProds].CHAR_VALUE}'`
                // );



                oPartialProdConfig.PRODUCT_ID = el.PRODUCT_ID;
                oPartialProdConfig.CLASS_NUM = el.CLASS_NUM;
                oPartialProdConfig.CHAR_NUM = el.CHAR_NUM;
                oPartialProdConfig.CHARVAL_NUM = el.CHAR_VALUE;
                oPartialProdConfig.CHAR_VALUE = el.CHAR_VALUE;


                let aUniqueConfig =[];
                //  aUniqueConfig = aUniqChar.filter(function (aUIDChar) {

                //     return aUIDChar.CLASS_NUM === el.CLASS_NUM &&
                //         aUIDChar.CHAR_NUM === el.CHAR_NUM &&
                //         aUIDChar.CHAR_VALUE === el.CHAR_VALUE;

                // });

                aUniqueConfig = oUniqueChar[el.CLASS_NUM]?.[el.CHAR_NUM]?.[el.CHAR_VALUE] ??[];

                if (aUniqueConfig.length > 0) {

                    // Get Minimum Valid From and Maximum ValidTo from an array of Unique Ids

                    oPartialProdConfig.VALID_FROM = aUniqueConfig.reduce((min, p) => p.VALID_FROM < min ? p.VALID_FROM : min, aUniqueConfig[0].VALID_FROM);

                    oPartialProdConfig.VALID_TO = aUniqueConfig.reduce((max, p) => p.VALID_TO > max ? p.VALID_TO : max, aUniqueConfig[0].VALID_TO);

                    aPartialProdConfig.push(GenF.parse(oPartialProdConfig));

                }

            }


            // Insert Data to Partial Prod Config Validity Table
            if (aPartialProdConfig.length > 0) {
                await cds.run({
                    INSERT: {
                        into: {
                            ref: ['CP_PARTIALPROD_CHAR_VALIDITY']
                        },
                        entries: aPartialProdConfig
                    }

                });

            }

        }



    }

    async primaryProcess(lLocation, lProduct, lStartDate, req,bUserSelectedWeeks) {
        var oReturn = {
            bError: false,
            message: ''
        }
        GenF.log(`Started Process Unique Id for Location: ${lLocation} , Product: ${lProduct}`);

        await this.processUniqueID(lLocation, lProduct, lStartDate, '', req,bUserSelectedWeeks);
        GenF.log(`Process Unique Id complete for Location: ${lLocation} , Product: ${lProduct}`);

        //Process to calculate ValidFrom and ValidTo from Rules
        let bUIDVldty = await GenF.getParameterValue(lLocation, 14);
        if (bUIDVldty === 'true') {
            const objDerConfig = new DerivedConfig();
            await objDerConfig.genConfigValidityRules(lLocation, lProduct);
            GenF.log("Rules Validation complete");
        }

        // Process to Update Validity Dates for Primary Ids
        await this.updatePrimaryIdValidity(lLocation, lProduct);
        GenF.log("Primary ID validation complete");

        // Begin Of Process ValidFrom and ValidTo from Unique Ids to be sent to IBP
        await this.genConfigValidity(lLocation, lProduct);
        GenF.log("Configuration Validity complete");

        /** Begin Of Derived Percentage */
        // Fetch History weeks
        let iHisWeeks = await GenF.getParameterValue(lLocation, 4);

        if (iHisWeeks === '' || iHisWeeks === null || iHisWeeks === undefined) {
            oReturn.bError = true;
            oReturn.message = `Missing history consideration in planning config, could not process generation of rule percent! for Location: ${adata.LOCATION_ID} 
                        and Product: ${adata.PRODUCT_ID}`;
        } else {
            // await GenF.jobSchMessage('X', 'Started Processing Rule Percentage for Sales History', req);
            // await objDerConfig.genSalesHRulePercentage(adata.LOCATION_ID, adata.PRODUCT_ID, iHisWeeks);
            // await GenF.jobSchMessage('X', 'Completed Processing Rule Percentage for Sales History', req);
            oReturn.bError = false;
            oReturn.message = `Completed Processing Rule Percentage for Sales History`;
        }

        GenF.log(`SO Process Completed for Location: ${lLocation} , Product: ${lProduct}`);
        return oReturn;
    }
    async removeDuplicates(records) {
        const uniqueRecords = [];
        const seenConfigs = new Set();

        records.forEach(record => {
            if (!seenConfigs.has(record.configString)) {
                // If not, add CONFIG to the Set and the record to uniqueRecords
                seenConfigs.add(record.configString);
                uniqueRecords.push(record);
            }
        });
        return uniqueRecords;
    }

}

module.exports = InitialProcess;