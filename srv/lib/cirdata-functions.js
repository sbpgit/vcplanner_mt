const GenFunctions = require("./gen-functions");
const cds = require("@sap/cds");
const hana = require("@sap/hana-client");

class CIRData {
    constructor() { }

    /**
     * Get CIR Data Weekly
     */
    async getCIRData(req) {
        console.log("Started CIR Service");
        let vDateFrom = req.data.FROMDATE; //"2022-03-04";
        let vDateTo = req.data.TODATE; //"2023-01-03";
        let oEntry = {};
        let aPlanningLoc = [];
        let aFilterLoc = [];
        let liCIRQty = [];

        // Selected Demand / Planned Locations
        if (req.data.PLANNING_LOC !== undefined && req.data.PLANNING_LOC !== null && req.data.PLANNING_LOC !== '') {
            aPlanningLoc = JSON.parse(req.data.PLANNING_LOC);
        }

        try {
            // const liCIRQty = await cds.run(
            liCIRQty = await cds.run(
                `SELECT *            
                   FROM "CP_CIR_GENERATED"             
                  INNER JOIN "CP_FACTORY_SALESLOC"
                     ON "CP_CIR_GENERATED"."PRODUCT_ID" = "CP_FACTORY_SALESLOC"."PRODUCT_ID"
                    AND "CP_CIR_GENERATED"."LOCATION_ID" = "CP_FACTORY_SALESLOC"."LOCATION_ID"
             INNER JOIN "CP_PARTIALPROD_INTRO"
                     ON "CP_PARTIALPROD_INTRO"."PRODUCT_ID"  = "CP_CIR_GENERATED"."PRODUCT_ID"
                    AND "CP_PARTIALPROD_INTRO"."LOCATION_ID" = "CP_CIR_GENERATED"."LOCATION_ID"
                  WHERE "CP_FACTORY_SALESLOC"."FACTORY_LOC" = '${req.data.LOCATION_ID}'
                    AND  "CP_PARTIALPROD_INTRO"."PRODUCT_ID" IN (
                        SELECT DISTINCT "PRODUCT_ID"
                          FROM "CP_PARTIALPROD_INTRO"
                        WHERE "LOCATION_ID" = '${req.data.LOCATION_ID}' 
                          AND ("PRODUCT_ID" = '${req.data.PRODUCT_ID}'
                                OR "REF_PRODID" = '${req.data.PRODUCT_ID}')
                          )
                  AND  "CP_CIR_GENERATED"."VERSION" = '${req.data.VERSION}' 
                  AND  "CP_CIR_GENERATED"."SCENARIO" = '${req.data.SCENARIO}' 
                  AND ("CP_CIR_GENERATED"."WEEK_DATE" <= '${vDateTo}' 
                  AND  "CP_CIR_GENERATED"."WEEK_DATE" >= '${vDateFrom}') 
                  AND  "CP_CIR_GENERATED"."MODEL_VERSION" = '${req.data.MODEL_VERSION}'
             ORDER BY 
                     "CP_CIR_GENERATED"."LOCATION_ID" ASC, 
                     "CP_CIR_GENERATED"."PRODUCT_ID" ASC,
                     "CP_CIR_GENERATED"."VERSION" ASC,
                     "CP_CIR_GENERATED"."SCENARIO" ASC,
                     "CP_CIR_GENERATED"."WEEK_DATE" ASC`
            );
            oEntry.liCIRQty = liCIRQty;
            if (aPlanningLoc.length > 0) {
                //Filter by Selected Demand / Planning Location
                // Filter array of objects based on another array of objects
                oEntry.liCIRQty = liCIRQty.filter((el) => {
                    return aPlanningLoc.some((f) => {
                        return f.DEMAND_LOC === el.LOCATION_ID && f.PLANNING_LOC === el.PLAN_LOC;
                    });
                });
            }
        } catch (e) {
            console.log(e);
        }

        if (liCIRQty.length > 0) {
            try {
                const liUniqueId = await cds.run(
                    ` SELECT DISTINCT 
                      "CP_CIR_GENERATED"."LOCATION_ID", 
                      "CP_CIR_GENERATED"."PRODUCT_ID",
                      "CP_CIR_GENERATED"."VERSION",
                      "CP_CIR_GENERATED"."SCENARIO",
                      "CP_CIR_GENERATED"."UNIQUE_ID",          
                      "CP_UNIQUE_ID_HEADER"."UNIQUE_DESC",
                      "CP_UNIQUE_ID_HEADER"."EX_IDENTIFICATION",
                      "CP_UNIQUE_ID_HEADER"."VALID_FROM",
                      "CP_UNIQUE_ID_HEADER"."VALID_TO",
                      "CP_PARTIALPROD_INTRO"."PROD_DESC",
                      "CP_FACTORY_SALESLOC"."LOCATION_ID" AS "DEMAND_LOC",
                      "CP_FACTORY_SALESLOC"."PLAN_LOC" AS "PLANNED_LOC",
                      "CP_LOCATION"."LOCATION_DESC"   AS "DEMANDLOC_DESC",
                      "CP_IBPVERSIONSCENARIO"."VERSION_NAME",
                      "CP_IBPVERSIONSCENARIO"."SCENARIO_NAME"
                                      FROM "CP_CIR_GENERATED" 
                                      inner join "CP_FACTORY_SALESLOC"
                                      ON "CP_CIR_GENERATED"."PRODUCT_ID" = "CP_FACTORY_SALESLOC"."PRODUCT_ID"
                                      AND "CP_CIR_GENERATED"."LOCATION_ID" = "CP_FACTORY_SALESLOC"."LOCATION_ID"
                                      INNER JOIN "CP_LOCATION"
                                      ON "CP_FACTORY_SALESLOC"."LOCATION_ID" = "CP_LOCATION"."LOCATION_ID"
                                      inner join "CP_PARTIALPROD_INTRO"
                                      ON "CP_CIR_GENERATED"."PRODUCT_ID" = "CP_PARTIALPROD_INTRO"."PRODUCT_ID"
                                      AND "CP_CIR_GENERATED"."LOCATION_ID" = "CP_PARTIALPROD_INTRO"."LOCATION_ID"
                                      inner join "CP_UNIQUE_ID_HEADER"
                                      ON "CP_CIR_GENERATED"."UNIQUE_ID" = "CP_UNIQUE_ID_HEADER"."UNIQUE_ID"
                                      AND "CP_PARTIALPROD_INTRO"."REF_PRODID" = "CP_UNIQUE_ID_HEADER"."PRODUCT_ID"
                                      INNER JOIN "CP_IBPVERSIONSCENARIO"
	                                     ON "CP_CIR_GENERATED"."VERSION" = "CP_IBPVERSIONSCENARIO"."VERSION"
	                                    AND "CP_CIR_GENERATED"."SCENARIO" = "CP_IBPVERSIONSCENARIO"."SCENARIO"
                                     WHERE "CP_FACTORY_SALESLOC"."FACTORY_LOC" = '${req.data.LOCATION_ID}'
                                        AND "CP_PARTIALPROD_INTRO"."PRODUCT_ID" IN (
                                                SELECT DISTINCT "PRODUCT_ID"
                                                  FROM "CP_PARTIALPROD_INTRO"
                                                 WHERE "LOCATION_ID" = '${req.data.LOCATION_ID}' 
                                                   AND ("PRODUCT_ID" = '${req.data.PRODUCT_ID}'
                                                    OR "REF_PRODID" = '${req.data.PRODUCT_ID}')
                                                ) 
                                        AND "CP_CIR_GENERATED"."VERSION" = '${req.data.VERSION}'
                                        AND "CP_CIR_GENERATED"."SCENARIO" = '${req.data.SCENARIO}' 
                                        AND ("CP_CIR_GENERATED"."WEEK_DATE" <= '${vDateTo}' 
                                        AND "CP_CIR_GENERATED"."WEEK_DATE" >= '${vDateFrom}') 
                                        AND "CP_CIR_GENERATED"."MODEL_VERSION" = '${req.data.MODEL_VERSION}'
                                   ORDER BY 
                                           "CP_CIR_GENERATED"."LOCATION_ID" ASC, 
                                           "CP_CIR_GENERATED"."PRODUCT_ID" ASC,
                                           "CP_CIR_GENERATED"."VERSION" ASC,
                                           "CP_CIR_GENERATED"."SCENARIO" ASC,
                                           "CP_CIR_GENERATED"."UNIQUE_ID" ASC`
                );


                oEntry.liUniqueId = liUniqueId;
                if (aPlanningLoc.length > 0) {
                    //Filter by Selected Demand / Planning Location
                    // Filter array of objects based on another array of objects
                    oEntry.liUniqueId = liUniqueId.filter((el) => {
                        return aPlanningLoc.some((f) => {
                            return f.DEMAND_LOC === el.DEMAND_LOC && f.PLANNING_LOC === el.PLANNED_LOC;
                        });
                    });
                }
            }
            catch (e) {
                console.log(e);
            }

            // Get Actual Sales Orders Quantity
            try {
                // const li_salesh = await cds.run(
                //     `SELECT *
                //        FROM "V_SALES_H"
                //       WHERE "FACTORY_LOC" = '${req.data.LOCATION_ID}'
                //         AND "PRODUCT_ID"  = '${req.data.PRODUCT_ID}'  
                //         AND "MAT_AVAILDATE"  >= '${vDateFrom}'
                //         AND "MAT_AVAILDATE"  <= '${vDateTo}'`
                // );

                const li_salesh = await cds.run(
                    `SELECT *
                   FROM "V_SALES_H"
                  WHERE "FACTORY_LOC" = '${req.data.LOCATION_ID}'
                  AND ("PRODUCT_ID" = '${req.data.PRODUCT_ID}'
                  OR "REF_PRODID" = '${req.data.PRODUCT_ID}')
                    AND "MAT_AVAILDATE"  >= '${vDateFrom}'
                    AND "MAT_AVAILDATE"  <= '${vDateTo}'`
                );

                oEntry.liSalesH = li_salesh;
                if (aPlanningLoc.length > 0) {
                    //Filter by Selected Demand / Planning Location
                    // Filter array of objects based on another array of objects
                    oEntry.liSalesH = li_salesh.filter((el) => {
                        return aPlanningLoc.some((f) => {
                            return f.DEMAND_LOC === el.SALE_LOCATION && f.PLANNING_LOC === el.PLAN_LOC;
                        });
                    });
                }

            } catch (e) {
                console.log(e);
            }

        } else {
            oEntry.liUniqueId = [];
            oEntry.liSalesH = [];
        }

        // oEntry.liCIRQty = liCIRQty;


        return oEntry;
    }
    /**
     * Get Unique Id Characteristics
     */
    async getUniqueIdCharacteristics(req) {
        let aPlanningLoc = [];
        let aUniqueIdItems = [];
        let aUniqueIds = [];



        // Get Unique Ids
        aUniqueIds = await cds.run(`SELECT DISTINCT "UNIQUE_ID", "LOCATION_ID", "PLAN_LOC"  
                                      FROM "V_SALES_H"                    
                                     WHERE "FACTORY_LOC" = '${req.data.LOCATION_ID}'     
                                       AND ( "PRODUCT_ID" = '${req.data.PRODUCT_ID}'
                                        OR  "REF_PRODID" = '${req.data.PRODUCT_ID}')`);



        if (req.data.PLANNING_LOC !== undefined && req.data.PLANNING_LOC !== null && req.data.PLANNING_LOC !== '') {
            aPlanningLoc = JSON.parse(req.data.PLANNING_LOC);
        }
        if (aPlanningLoc.length > 0) {
            //Filter by Selected Demand / Planning Location    
            // Filter array of objects based on another array of objects     
            aUniqueIds = aUniqueIds.filter((el) => {
                return aPlanningLoc.some((f) => {
                    return f.DEMAND_LOC === el.LOCATION_ID && f.PLANNING_LOC === el.PLAN_LOC;
                });
            });
        }
        // Get Unique Id Chars
        /**  aUniqueIdItems = await cds.run(
             // `SELECT *
             //    FROM "V_UNIQUE_ID_ITEM"
             //    WHERE UNIQUE_ID IN ( SELECT DISTINCT "UNIQUE_ID"
             //                                    FROM "CP_SALES_HM"
             //                                    WHERE "LOCATION_ID" = '${req.data.LOCATION_ID}'
             //                                      AND "PRODUCT_ID" = '${req.data.PRODUCT_ID}')` 
             `SELECT * 
                 FROM "V_UNIQUE_ID_ITEM"
                 WHERE UNIQUE_ID IN(SELECT DISTINCT "UNIQUE_ID"  
                                     FROM "V_SALES_H"                    
                                     WHERE "FACTORY_LOC" = '${req.data.LOCATION_ID}'     
                                     AND ( "PRODUCT_ID" = '${req.data.PRODUCT_ID}'
                                     OR  "REF_PRODID" = '${req.data.PRODUCT_ID}'))`
         ); */

        aUniqueIdItems = await cds.run(` SELECT 
                                        A.UNIQUE_ID,
                                        A.PRODUCT_ID,
                                        A.CLASS_NAME,
                                        A.CHAR_NUM,
                                        A.CHAR_NAME,
                                        A.CHAR_DESC,
                                        A.CHARVAL_NUM,
                                        A.CHAR_VALUE,
                                        A.CHARVAL_DESC,
                                        A.VALID_FROM,
                                        A.VALID_TO,
                                        A.UID_TYPE,
                                        A.MULTI_CHAR,
                                        A.REF_CHAR_NUM,
                                        A.REF_CHAR_NAME,
                                        A.REF_CHAR_DESC,
                                        A.REF_CHAR_VALUE,
                                        B.MEDIAN
                                    FROM V_UNIQUE_ID_ITEM AS A
                         LEFT OUTER JOIN V_CHARVAL_BUCKET AS B
                                      ON  A.CHAR_NUM = B.CHAR_NUM
                                     AND A.CHAR_VALUE = B.CHAR_VALUE
                                   WHERE UNIQUE_ID IN(SELECT DISTINCT "UNIQUE_ID"  
                                                                FROM "V_SALES_H"                    
                                                                WHERE "FACTORY_LOC" = '${req.data.LOCATION_ID}'     
                                                                AND ( "PRODUCT_ID" = '${req.data.PRODUCT_ID}'
                                                                OR  "REF_PRODID" = '${req.data.PRODUCT_ID}'))`
        );

        // Filtered Unique Ids based on selected demand & planned location
        if (aUniqueIds.length > 0) {
            aUniqueIdItems = aUniqueIdItems.filter((el) => {
                return aUniqueIds.some((f) => {
                    return f.UNIQUE_ID === el.UNIQUE_ID;
                });
            });
        }
        // // Selected Demand / Planned Locations        
        // if (req.data.PLANNING_LOC !== undefined) {
        //     aPlanningLoc = JSON.parse(req.data.PLANNING_LOC);
        // }
        // if (aPlanningLoc.length > 0) {
        //     //Filter by Selected Demand / Planning Location    
        //     // Filter array of objects based on another array of objects     
        //     aUniqueIdItems = aUniqueIdItems.filter((el) => {
        //         return aPlanningLoc.some((f) => {
        //             return f.DEMAND_LOC === el.LOCATION_ID && f.PLANNING_LOC === el.LOCATION_ID;
        //         });
        //     });
        // }
        return aUniqueIdItems;
        // return li_uniqueIdItem;
    }
    /**
     * Get Unique Id Characteristics
     */
    async getUniqueCharacteristics(req) {

        const li_uniqueIdItem = await cds.run(

            `SELECT *
                  FROM "V_UNIQUE_ID_ITEM"
                  WHERE UNIQUE_ID IN ( SELECT DISTINCT "UNIQUE_ID"
                                                  FROM "CP_SALES_HM"
                                                  WHERE "LOCATION_ID" = '${req.data.LOCATION_ID}'
                                                    AND "PRODUCT_ID" = '${req.data.PRODUCT_ID}' )`


            // `SELECT *
            // FROM "V_UNIQUE_ID_ITEM"
            // WHERE UNIQUE_ID IN ( SELECT DISTINCT "UNIQUE_ID"
            //                                 FROM "V_SALES_H"
            //                                 WHERE "FACTORY_LOC" = '${req.data.LOCATION_ID}'
            //                                   AND ( "PRODUCT_ID" = '${req.data.PRODUCT_ID}'
            //                                    OR "REF_PRODID" = '${req.data.PRODUCT_ID}' ) )`  

        );


        return li_uniqueIdItem;
    }

    async getPIDCharacteristics(req) {

        const li_uniqueIdItem = await cds.run(

            `SELECT *
                  FROM "V_UNIQUE_ID_ITEM"
                  WHERE UNIQUE_ID IN ( SELECT DISTINCT "PRIMARY_ID"
                                                  FROM "CP_SALES_HM"
                                                  WHERE "LOCATION_ID" = '${req.data.LOCATION_ID}'
                                                    AND "PRODUCT_ID" = '${req.data.PRODUCT_ID}' )`


            // `SELECT *
            // FROM "V_UNIQUE_ID_ITEM"
            // WHERE UNIQUE_ID IN ( SELECT DISTINCT "UNIQUE_ID"
            //                                 FROM "V_SALES_H"
            //                                 WHERE "FACTORY_LOC" = '${req.data.LOCATION_ID}'
            //                                   AND ( "PRODUCT_ID" = '${req.data.PRODUCT_ID}'
            //                                    OR "REF_PRODID" = '${req.data.PRODUCT_ID}' ) )`  

        );


        return li_uniqueIdItem;
    }

    /**
     * Get Distinct Unique Ids 
     */
    async getDistinctUniqueIds(req) {
        // const li_uniqueId = await cds.run(
        //     `SELECT DISTINCT "UNIQUE_ID", "UNIQUE_DESC"
        //     FROM "V_UNIQUE_ID_ITEM"
        //     WHERE "LOCATION_ID" = '` +
        //     req.data.LOCATION_ID +
        //     `'
        //     AND "PRODUCT_ID" = '` +
        //     req.data.PRODUCT_ID +
        //     `'`
        // );

        const li_uniqueId = await cds.run(
            `SELECT DISTINCT 
                    "CP_SALES_HM"."UNIQUE_ID",
                    "V_UNIQUE_ID_ITEM"."UNIQUE_DESC"
               FROM "CP_SALES_HM"
              INNER JOIN "V_UNIQUE_ID_ITEM"
                 ON "CP_SALES_HM"."UNIQUE_ID" = "V_UNIQUE_ID_ITEM"."UNIQUE_ID"
              WHERE "CP_SALES_HM"."LOCATION_ID" = '`
            + req.data.LOCATION_ID + `'
                AND "CP_SALES_HM"."PRODUCT_ID" = '` +
            req.data.PRODUCT_ID +
            `'`
        );

        return li_uniqueId;
    }


    async getDistinctUnqIds(req) {
        let aPrpids = [], aDistuniqueIds = [];
        let aUniqueIds = [];
        try {
            // Validate required parameters
            if (!req.data?.LOCATION_ID || !req.data?.PRODUCT_ID || !req.data?.UNIQUE_ID) {
                throw new Error('Missing required parameters: LOCATION_ID, PRODUCT_ID, or UNIQUE_ID');
            }

            aPrpids = await cds.run(`SELECT DISTINCT 
                                            A.PRPID,
                                            B.DISTANCE
                                        FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS AS A
                                  INNER JOIN CP_AHC_CLUSTER_DISTANCES AS B
                                          ON A.LOCATION_ID = B.LOCATION_ID
                                         AND A.PRODUCT_ID = B.PRODUCT_ID
                                         AND A.CLUSTER_ID = B.TARGET_CLUSTER_ID
                                       WHERE A.LOCATION_ID = '${req.data.LOCATION_ID}'
                                         AND A.PRODUCT_ID = '${req.data.PRODUCT_ID}'
                                         AND (B.SOURCE_CLUSTER_ID IN (SELECT DISTINCT CLUSTER_ID
                                                                        FROM CP_CLUSTER_PRPIDS_MAPPED_PIDS
                                                                        WHERE LOCATION_ID = '${req.data.LOCATION_ID}'
                                                                          AND PRODUCT_ID = '${req.data.PRODUCT_ID}'
                                                                          AND (PRPID IN (SELECT DISTINCT PRPID
                                                                                           FROM "V_UID_PID_PRPID"
                                                                                          WHERE "LOCATION_ID" = '${req.data.LOCATION_ID}'
                                                                                            AND "PRODUCT_ID" = '${req.data.PRODUCT_ID}'
                                                                                            AND UID = '${req.data.UNIQUE_ID}'))))
                                    ORDER BY B.DISTANCE ASC;
                                    `);

            if (aPrpids.length > 0) {
                for (let i = 0; i < aPrpids.length; i++) {
                    if (aDistuniqueIds.length >= 20) {
                        break;
                    }
                    aUniqueIds = [];
                    aUniqueIds = await cds.run(`SELECT TOP 20
                                                UNIQUE_ID,
                                                UNIQUE_DESC,
                                                COUNT(*) AS total
                                            FROM V_UNIQUE_ID_ITEMS
                                            WHERE ((UNIQUE_ID IN (SELECT DISTINCT A.UID
                                                    FROM "V_UID_PID_PRPID" AS A
                                                    WHERE A."LOCATION_ID" = '${req.data.LOCATION_ID}'
                                                        AND A."PRODUCT_ID" = '${req.data.PRODUCT_ID}'
                                                        AND A.PRPID = '${aPrpids[i].PRPID}'
                                            ))
                                                AND ((CHAR_NUM, CHAR_VALUE) IN (SELECT DISTINCT 
                                                        CHAR_NUM,
                                                        CHAR_VALUE
                                                    FROM CP_UNIQUE_ID_ITEM
                                                    WHERE UNIQUE_ID = '${req.data.UNIQUE_ID}')))
                                            GROUP BY UNIQUE_ID, UNIQUE_DESC
                                            ORDER BY COUNT(*) DESC`);

                    if (aUniqueIds.length > 0) {
                        aDistuniqueIds = [...aDistuniqueIds, ...aUniqueIds];
                    }

                }

            } else {
                aDistuniqueIds = await cds.run(
                    `SELECT DISTINCT 
                                                    "CP_SALES_HM"."UNIQUE_ID",
                                                    "V_UNIQUE_ID_ITEM"."UNIQUE_DESC"
                                            FROM "CP_SALES_HM"
                                            INNER JOIN "V_UNIQUE_ID_ITEM"
                                                ON "CP_SALES_HM"."UNIQUE_ID" = "V_UNIQUE_ID_ITEM"."UNIQUE_ID"
                                            WHERE "CP_SALES_HM"."LOCATION_ID" = '${req.data.LOCATION_ID}'
                                              AND "CP_SALES_HM"."PRODUCT_ID" = '${req.data.PRODUCT_ID}'`
                );
            }

            return aDistuniqueIds;
        } catch (error) {
            console.error('Error in getDistinctUnqIds:', error);
            throw error;
        }
    }

    async getDistinctPIds(req) {
        // const li_uniqueId = await cds.run(
        //     `SELECT DISTINCT "UNIQUE_ID", "UNIQUE_DESC"
        //     FROM "V_UNIQUE_ID_ITEM"
        //     WHERE "LOCATION_ID" = '` +
        //     req.data.LOCATION_ID +
        //     `'
        //     AND "PRODUCT_ID" = '` +
        //     req.data.PRODUCT_ID +
        //     `'`
        // );

        const li_uniqueId = await cds.run(
            `SELECT DISTINCT 
                    "CP_SALES_HM"."PRIMARY_ID" as UNIQUE_ID,
                    "V_UNIQUE_ID_ITEM"."UNIQUE_DESC"
               FROM "CP_SALES_HM"
              INNER JOIN "V_UNIQUE_ID_ITEM"
                 ON "CP_SALES_HM"."PRIMARY_ID" = "V_UNIQUE_ID_ITEM"."UNIQUE_ID"
              WHERE "CP_SALES_HM"."LOCATION_ID" = '`
            + req.data.LOCATION_ID + `'
                AND "CP_SALES_HM"."PRODUCT_ID" = '` +
            req.data.PRODUCT_ID +
            `'`
        );

        return li_uniqueId;
    }

    /**
     * Get Primary & Secondary Characteristics
     */
    async getVarcharPS(req) {
        // const li_varchar_ps = await cds.run(
        //     `SELECT DISTINCT *
        //        FROM "CP_VARCHAR_PS"
        //       INNER JOIN "CP_PARTIALPROD_INTRO"
        //          ON "CP_VARCHAR_PS"."PRODUCT_ID"  = "CP_PARTIALPROD_INTRO"."REF_PRODID"
        //       WHERE "CP_PARTIALPROD_INTRO"."PRODUCT_ID" = '` + req.data.PRODUCT_ID + `'`
        // );
        let li_varchar_ps = await cds.run(
            `SELECT DISTINCT "CP_VARCHAR_PS"."PRODUCT_ID",
                             "CP_PARTIALPROD_INTRO"."REF_PRODID",
                             "CP_VARCHAR_PS"."CHAR_NUM",
                             "CP_VARCHAR_PS"."CHAR_TYPE",
                             "CP_VARCHAR_PS"."SEQUENCE"
                        FROM "CP_VARCHAR_PS"
                       INNER JOIN "CP_PARTIALPROD_INTRO"
                          ON "CP_VARCHAR_PS"."PRODUCT_ID"  = "CP_PARTIALPROD_INTRO"."REF_PRODID"
                       WHERE "CP_PARTIALPROD_INTRO"."PRODUCT_ID" = '` + req.data.PRODUCT_ID + `'`
        );
        return li_varchar_ps;
    }

    /**
     * Get ForecastCIR Data
     * @param {*} req 
     * @returns 
     */
    async getForeCastCIRData(req) {
        console.log("Started CIR Service");
        let vDateFrom = req.data.FROMDATE; //"2022-03-04";
        let vDateTo = req.data.TODATE; //"2023-01-03";
        let oEntry = {};
        let aPlanningLoc = [];
        let liCIRQty = [];
        let manLocations = JSON.parse(req.data.LOCATION_ID).map(item => `'${item}'`);
        // let demLocations = JSON.parse(req.data.PLANNING_LOC).map(item => `''${item}''`);
        let products = JSON.parse(req.data.PRODUCT_ID).map(item => `'${item}'`);
        let versions = JSON.parse(req.data.VERSION).map(item => `'${item}'`);
        let scenarios = JSON.parse(req.data.SCENARIO).map(item => `'${item}'`);
        // Selected Demand / Planned Locations
        if (req.data.PLANNING_LOC !== undefined && req.data.PLANNING_LOC !== null && req.data.PLANNING_LOC !== '') {
            aPlanningLoc = JSON.parse(req.data.PLANNING_LOC);
        }

        try {
    //         //         var sQuery = `SELECT *            
    // //         FROM "CP_CIR_GENERATED"             
    // //        INNER JOIN "CP_FACTORY_SALESLOC"
    // //           ON "CP_CIR_GENERATED"."PRODUCT_ID" = "CP_FACTORY_SALESLOC"."PRODUCT_ID"
    // //          AND "CP_CIR_GENERATED"."LOCATION_ID" = "CP_FACTORY_SALESLOC"."PLAN_LOC"
    // //   INNER JOIN "CP_PARTIALPROD_INTRO"
    // //           ON "CP_PARTIALPROD_INTRO"."PRODUCT_ID"  = "CP_CIR_GENERATED"."PRODUCT_ID"
    // //          AND "CP_PARTIALPROD_INTRO"."LOCATION_ID" = "CP_CIR_GENERATED"."LOCATION_ID"
    // //        WHERE "CP_FACTORY_SALESLOC"."FACTORY_LOC" IN (${manLocations.join(',')})
    // //          AND  "CP_PARTIALPROD_INTRO"."PRODUCT_ID" IN (
    // //              SELECT DISTINCT "PRODUCT_ID"
    // //                FROM "CP_PARTIALPROD_INTRO"
    // //              WHERE "LOCATION_ID" IN (${manLocations.join(',')}) 
    // //                AND ("PRODUCT_ID" IN (${products.join(',')})
    // //                      OR "REF_PRODID" IN (${products.join(',')})
    // //                ))
    // //        AND  "CP_CIR_GENERATED"."VERSION" IN (${versions.join(',')}) 
    // //        AND  "CP_CIR_GENERATED"."SCENARIO" IN (${scenarios.join(',')}) 
    // //        AND ("CP_CIR_GENERATED"."WEEK_DATE" <= '${vDateTo}' 
    // //        AND  "CP_CIR_GENERATED"."WEEK_DATE" >= '${vDateFrom}') 
    // //        AND  "CP_CIR_GENERATED"."MODEL_VERSION" = '${req.data.MODEL_VERSION}'
    // //   ORDER BY 
    // //           "CP_CIR_GENERATED"."LOCATION_ID" ASC, 
    // //           "CP_CIR_GENERATED"."PRODUCT_ID" ASC,
    // //           "CP_CIR_GENERATED"."VERSION" ASC,
    // //           "CP_CIR_GENERATED"."SCENARIO" ASC,
    // //           "CP_CIR_GENERATED"."WEEK_DATE" ASC`;
    // var sQuery = `SELECT *            
    //         FROM "CP_CIR_GENERATED"             
    //        INNER JOIN "CP_FACTORY_SALESLOC"
    //           ON "CP_CIR_GENERATED"."PRODUCT_ID" = "CP_FACTORY_SALESLOC"."PRODUCT_ID"
    //          AND "CP_CIR_GENERATED"."LOCATION_ID" = "CP_FACTORY_SALESLOC"."PLAN_LOC"
    //   INNER JOIN "CP_PARTIALPROD_INTRO"
    //           ON "CP_PARTIALPROD_INTRO"."PRODUCT_ID"  = "CP_CIR_GENERATED"."PRODUCT_ID"
    //          AND "CP_PARTIALPROD_INTRO"."LOCATION_ID" = "CP_CIR_GENERATED"."LOCATION_ID"
    //        WHERE "CP_FACTORY_SALESLOC"."FACTORY_LOC" IN (${manLocations.join(',')})
    //          AND  "CP_CIR_GENERATED"."PRODUCT_ID" IN (
    //              SELECT DISTINCT "PRODUCT_ID"
    //                FROM "CP_PARTIALPROD_INTRO"
    //              WHERE "LOCATION_ID" IN (${manLocations.join(',')}) 
    //                AND "PRODUCT_ID" IN (${products.join(',')})
                         
    //                )
    //        AND  "CP_CIR_GENERATED"."VERSION" IN (${versions.join(',')}) 
    //        AND  "CP_CIR_GENERATED"."SCENARIO" IN (${scenarios.join(',')}) 
    //        AND ("CP_CIR_GENERATED"."WEEK_DATE" <= '${vDateTo}' 
    //        AND  "CP_CIR_GENERATED"."WEEK_DATE" >= '${vDateFrom}') 
    //        AND  "CP_CIR_GENERATED"."MODEL_VERSION" = '${req.data.MODEL_VERSION}'
    //   ORDER BY 
    //           "CP_CIR_GENERATED"."LOCATION_ID" ASC, 
    //           "CP_CIR_GENERATED"."PRODUCT_ID" ASC,
    //           "CP_CIR_GENERATED"."VERSION" ASC,
    //           "CP_CIR_GENERATED"."SCENARIO" ASC,
    //           "CP_CIR_GENERATED"."WEEK_DATE" ASC`;

     var sQuery = `SELECT *            
            FROM "CP_CIR_GENERATED"             
           INNER JOIN "CP_FACTORY_SALESLOC"
              ON "CP_CIR_GENERATED"."PRODUCT_ID" = "CP_FACTORY_SALESLOC"."PRODUCT_ID"
             AND "CP_CIR_GENERATED"."LOCATION_ID" = "CP_FACTORY_SALESLOC"."LOCATION_ID"
      INNER JOIN "CP_PARTIALPROD_INTRO"
              ON "CP_PARTIALPROD_INTRO"."PRODUCT_ID"  = "CP_CIR_GENERATED"."PRODUCT_ID"
             AND "CP_PARTIALPROD_INTRO"."LOCATION_ID" = "CP_CIR_GENERATED"."LOCATION_ID"
           WHERE "CP_FACTORY_SALESLOC"."FACTORY_LOC" IN (${manLocations.join(',')})
             AND  "CP_CIR_GENERATED"."PRODUCT_ID" IN (${products.join(',')})
           AND  "CP_CIR_GENERATED"."VERSION" IN (${versions.join(',')}) 
           AND  "CP_CIR_GENERATED"."SCENARIO" IN (${scenarios.join(',')}) 
           AND "CP_CIR_GENERATED"."WEEK_DATE" BETWEEN '${vDateFrom}' AND '${vDateTo}'
           
           AND  "CP_CIR_GENERATED"."MODEL_VERSION" = '${req.data.MODEL_VERSION}'
      ORDER BY 
              "CP_CIR_GENERATED"."LOCATION_ID" ASC, 
              "CP_CIR_GENERATED"."PRODUCT_ID" ASC,
              "CP_CIR_GENERATED"."VERSION" ASC,
              "CP_CIR_GENERATED"."SCENARIO" ASC,
              "CP_CIR_GENERATED"."WEEK_DATE" ASC`;
              
            // const liCIRQty = await cds.run(
            liCIRQty = await cds.run(sQuery);
            oEntry.liCIRQty = liCIRQty;
            if (aPlanningLoc.length > 0) {
                oEntry.liCIRQty = liCIRQty.filter((el) => {
                    return aPlanningLoc.some((f) => {
                        return f.DEMAND_LOC === el.LOCATION_ID && f.PLANNING_LOC === el.PLAN_LOC;
                    });
                });
            }
        } catch (e) {
            console.log(e);
        }

        if (liCIRQty.length > 0) {
            try {
                const liUniqueId = await cds.run(
                    ` SELECT DISTINCT 
                      "CP_CIR_GENERATED"."LOCATION_ID", 
                      "CP_CIR_GENERATED"."PRODUCT_ID",
                      "CP_CIR_GENERATED"."VERSION",
                      "CP_CIR_GENERATED"."SCENARIO",
                      "CP_CIR_GENERATED"."MODEL_VERSION",
                      "CP_CIR_GENERATED"."UNIQUE_ID",          
                      "CP_UNIQUE_ID_HEADER"."UNIQUE_DESC",
                      "CP_UNIQUE_ID_HEADER"."EX_IDENTIFICATION",
                      "CP_UNIQUE_ID_HEADER"."VALID_FROM",
                      "CP_UNIQUE_ID_HEADER"."VALID_TO",
                      "CP_PARTIALPROD_INTRO"."PROD_DESC",
                      "CP_FACTORY_SALESLOC"."LOCATION_ID" AS "DEMAND_LOC",
                      "CP_FACTORY_SALESLOC"."PLAN_LOC" AS "PLANNED_LOC",
                      "CP_LOCATION"."LOCATION_DESC"   AS "DEMANDLOC_DESC",
                      "CP_IBPVERSIONSCENARIO"."VERSION_NAME",
                      "CP_IBPVERSIONSCENARIO"."SCENARIO_NAME"
                                      FROM "CP_CIR_GENERATED" 
                                      inner join "CP_FACTORY_SALESLOC"
                                      ON "CP_CIR_GENERATED"."PRODUCT_ID" = "CP_FACTORY_SALESLOC"."PRODUCT_ID"
                                      AND "CP_CIR_GENERATED"."LOCATION_ID" = "CP_FACTORY_SALESLOC"."LOCATION_ID"
                                      INNER JOIN "CP_LOCATION"
                                      ON "CP_FACTORY_SALESLOC"."LOCATION_ID" = "CP_LOCATION"."LOCATION_ID"
                                      inner join "CP_PARTIALPROD_INTRO"
                                      ON "CP_CIR_GENERATED"."PRODUCT_ID" = "CP_PARTIALPROD_INTRO"."PRODUCT_ID"
                                      AND "CP_CIR_GENERATED"."LOCATION_ID" = "CP_PARTIALPROD_INTRO"."LOCATION_ID"
                                      inner join "CP_UNIQUE_ID_HEADER"
                                      ON "CP_CIR_GENERATED"."UNIQUE_ID" = "CP_UNIQUE_ID_HEADER"."UNIQUE_ID"
                                      AND "CP_PARTIALPROD_INTRO"."REF_PRODID" = "CP_UNIQUE_ID_HEADER"."PRODUCT_ID"
                                      INNER JOIN "CP_IBPVERSIONSCENARIO"
	                                     ON "CP_CIR_GENERATED"."VERSION" = "CP_IBPVERSIONSCENARIO"."VERSION"
	                                    AND "CP_CIR_GENERATED"."SCENARIO" = "CP_IBPVERSIONSCENARIO"."SCENARIO"
                                     WHERE "CP_FACTORY_SALESLOC"."FACTORY_LOC" IN (${manLocations.join(',')}) 
                                        AND "CP_PARTIALPROD_INTRO"."PRODUCT_ID" IN (
                                                SELECT DISTINCT "PRODUCT_ID"
                                                  FROM "CP_PARTIALPROD_INTRO"
                                                 WHERE "LOCATION_ID" IN (${manLocations.join(',')})  
                                                    AND "PRODUCT_ID" IN (${products.join(',')})
                                                ) 
                                        AND "CP_CIR_GENERATED"."VERSION" IN (${versions.join(',')})
                                        AND "CP_CIR_GENERATED"."SCENARIO" IN (${scenarios.join(',')}) 
                                        AND ("CP_CIR_GENERATED"."WEEK_DATE" <= '${vDateTo}' 
                                        AND "CP_CIR_GENERATED"."WEEK_DATE" >= '${vDateFrom}') 
                                        AND "CP_CIR_GENERATED"."MODEL_VERSION" = '${req.data.MODEL_VERSION}'
                                   ORDER BY 
                                           "CP_CIR_GENERATED"."LOCATION_ID" ASC, 
                                           "CP_CIR_GENERATED"."PRODUCT_ID" ASC,
                                           "CP_CIR_GENERATED"."VERSION" ASC,
                                           "CP_CIR_GENERATED"."SCENARIO" ASC,
                                           "CP_CIR_GENERATED"."UNIQUE_ID" ASC`
                );


                oEntry.liUniqueId = liUniqueId;
                if (aPlanningLoc.length > 0) {
                    oEntry.liUniqueId = liUniqueId.filter((el) => {
                        return aPlanningLoc.some((f) => {
                            return f.DEMAND_LOC === el.DEMAND_LOC && f.PLANNING_LOC === el.PLANNED_LOC;
                        });
                    });
                }
            }
            catch (e) {
                console.log(e);
            }

            // Get Actual Sales Orders Quantity
            try {
                const li_salesh = await cds.run(
                    `SELECT 
	               "PRODUCT_ID",
	               "UNIQUE_ID",
	               SUM("CONFIRMED_QTY") AS CONFIRMED_QTY,
	               SUM("ORD_QTY") AS ORD_QTY,
	               ADD_DAYS("MAT_AVAILDATE",WEEKDAY("MAT_AVAILDATE") * -1 ) AS MAT_AVAILDATE,
	               "LOCATION_ID"
                FROM "V_SALES_H"
                WHERE "FACTORY_LOC" IN (${manLocations.join(',')})
                    AND "PRODUCT_ID" IN (${products.join(',')}) 
                    AND "MAT_AVAILDATE"  >= '${vDateFrom}'
                    AND "MAT_AVAILDATE"  <= '${vDateTo}'
                GROUP BY PRODUCT_ID,
                    UNIQUE_ID,
                    MAT_AVAILDATE,
                    LOCATION_ID`
                );

                oEntry.liSalesH = li_salesh;
                if (aPlanningLoc.length > 0) {
                    oEntry.liSalesH = li_salesh.filter((el) => {
                        return aPlanningLoc.some((f) => {
                            return f.DEMAND_LOC === el.LOCATION_ID;
                        });
                    });
                }

            } catch (e) {
                console.log(e);
            }

        } else {
            oEntry.liUniqueId = [];
            oEntry.liSalesH = [];
        }
        return oEntry;
    }

    /**
    * Get CIR Log Data from S4 Virtual Table
    */

    async getCIRLogData(req) {
        let aCIRLogData_VT = [];
        let vDateFrom = req.data.FROMDATE; //"2022-03-04";
        let vDateTo = req.data.TODATE;     //"2023-01-03";
        let aSchema = [], sTable1 = '';
        let aPlanningLoc = [];
        aSchema = await cds.run(`SELECT * FROM "SYS"."VIRTUAL_TABLES" WHERE TABLE_NAME = 'CONFIG_PRODUCTS::VT_CIRLOG'`);
        sTable1 = '"' + aSchema[0].SCHEMA_NAME + '"' + '.' + '"CONFIG_PRODUCTS::VT_CIRLOG"';

        vDateFrom = vDateFrom.toString();
        vDateFrom = vDateFrom.replace(/-/g, '');      // replace all occurrences of '-'

        vDateTo = vDateTo.toString();
        vDateTo = vDateTo.replace(/-/g, '');

        aCIRLogData_VT = await cds.run(`SELECT  MATNR,
                                                PLANT,
                                                UNIQUE_ID,
                                                WEEK_DATE,
                                                CUST_MATERIAL,
                                                SUM(QUANTITY) AS CIR_QTY
                                          FROM ${sTable1}
                                         WHERE ( MATNR = '${req.data.PRODUCT_ID}'
                                            OR   CUST_MATERIAL = '${req.data.PRODUCT_ID}' )
                                           AND ( WEEK_DATE <= '${vDateTo}'
                                                 AND WEEK_DATE >= '${vDateFrom}' )
                                            AND MSG_TYP = 'S'
                                       GROUP BY MATNR,
                                                PLANT,
                                                UNIQUE_ID,
                                                WEEK_DATE,
                                                CUST_MATERIAL`);

        if (req.data.PLANNING_LOC !== undefined && req.data.PLANNING_LOC !== null && req.data.PLANNING_LOC !== '') {
            aPlanningLoc = JSON.parse(req.data.PLANNING_LOC);
        }
        if (aPlanningLoc.length > 0 && aCIRLogData_VT.length > 0) {
            //Filter by Selected Demand / Planning Location    
            // Filter array of objects based on another array of objects     
            aCIRLogData_VT = aCIRLogData_VT.filter((el) => {
                return aPlanningLoc.some((f) => {
                    return f.DEMAND_LOC === el.PLANT && f.PLANNING_LOC === el.PLANT;
                });
            });
        }

        return aCIRLogData_VT;
    }


    // /**
    //  * Get Auth Token
    //  */
    //  async getCFAuthToken() {
    //     const request = require('request');
    //     const rp = require('request-promise');
    //     const cfenv = require('cfenv');

    //     /*********************************************************************
    //      *************** Step 1: Read the environment variables ***************
    //      *********************************************************************/
    //     const oServices = cfenv.getAppEnv().getServices();
    //     const uaa_service = cfenv.getAppEnv().getService('config_products-xsuaa-service');
    //     const dest_service = cfenv.getAppEnv().getService('config_products-destination-service');
    //     const sUaaCredentials = dest_service.credentials.clientid + ':' + dest_service.credentials.clientsecret;

    //     const sDestinationName = 'S4D_HTTP';
    //     const sEndpoint = '/secure/';

    //     /*********************************************************************
    //      **** Step 2: Request a JWT token to access the destination service ***
    //      *********************************************************************/
    //     const post_options = {
    //         url: uaa_service.credentials.url + '/oauth/token',
    //         method: 'POST',
    //         headers: {
    //             'Authorization': 'Basic ' + Buffer.from(sUaaCredentials).toString('base64'),
    //             'Content-type': 'application/x-www-form-urlencoded'
    //         },
    //         form: {
    //             'client_id': dest_service.credentials.clientid,
    //             'grant_type': 'client_credentials'
    //         }
    //     }

    //     let ret_response = "";
    //     await rp(post_options)
    //         .then(function (response) {
    //             console.log('Get Token - Success');
    //             let sToken = JSON.parse(response).access_token;
    //             ret_response = getCFDestUser(sToken);

    //         })
    //         .catch(function (error) {
    //             console.log('Get Token - Error ', error);
    //             ret_response = JSON.parse(error);
    //         });

    //     console.log(ret_response);
    //     return ret_response;

    // }

    // /**
    //  * Get Destination User 
    //  */
    //   async getCFDestUser(sToken) {
    //     const request = require('request');
    //     const rp = require('request-promise');
    //     const cfenv = require('cfenv');

    //     /*********************************************************************
    //      *************** Step 1: Read the environment variables ***************
    //      *********************************************************************/
    //     const oServices = cfenv.getAppEnv().getServices();
    //     const uaa_service = cfenv.getAppEnv().getService('config_products-xsuaa-service');
    //     const dest_service = cfenv.getAppEnv().getService('config_products-destination-service');
    //     const sUaaCredentials = dest_service.credentials.clientid + ':' + dest_service.credentials.clientsecret;

    //     const sDestinationName = 'S4D_HTTP';
    //     const sEndpoint = '/secure/';
    //     /*************************************************************
    //      *** Step 3: Search your destination in the destination service ***
    //      *************************************************************/
    //      const token = sToken; //req.data.TOKEN;   //JSON.parse(req.data.DATA).access_token;
    //      const get_options = {
    //          url: dest_service.credentials.uri + '/destination-configuration/v1/destinations/' + sDestinationName,
    //          headers: {
    //              'Authorization': 'Bearer ' + token
    //          }
    //      }

    //      let ret_response = "";
    //      await rp(get_options)
    //          .then(function (response) {
    //              const oDestination = JSON.parse(response);
    //              console.log(oDestination.destinationConfiguration.User);
    //              ret_response = oDestination.destinationConfiguration.User;
    //          })
    //          .catch(function (error) {
    //              console.log('Get Destination - Error ', error);
    //              ret_response = JSON.parse(error);
    //          });

    //      console.log(ret_response);
    //      return ret_response;

    // }

}

module.exports = CIRData;
