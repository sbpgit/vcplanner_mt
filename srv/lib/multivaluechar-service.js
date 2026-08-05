const GenFunctions = require("./gen-functions");
const cds = require("@sap/cds");
const hana = require("@sap/hana-client");
class MultiValueChar {
    constructor() { }
    async processCharandValues() {
        let vFlagChar = '', liCharacteristics_num = [];
        let bSuccess = false;

        // Delete char. which doesnot exist in Master import
        let liDelChar = await cds.run(` SELECT CLASS_NUM,
                                               CHAR_NUM 
                                               FROM V_CHARVAL
                                              WHERE MULTI_CHAR = 'X'
                                                AND (CLASS_NUM, REF_CHAR_NUM , REF_CHAR_VALUE) NOT IN ( SELECT CLASS_NUM,
                                                                                                                CHAR_NUM,
                                                                                                                CHAR_VALUE
                                                                                                            FROM V_CHARVAL_MASTER
                                                                                                            WHERE MULTI_CHAR = 'X')
                                                ORDER BY 
                                                        CLASS_NUM ASC, 
                                                        CHAR_NUM ASC, 
                                                        CHARVAL_NUM ASC`);
        // Delete char. Val which doesnot exist in Master import
        let liDelCharVal = await cds.run(` SELECT CHAR_NUM,
                                                  CHAR_VALUE
                                             FROM V_CHARVAL
                                            WHERE MULTI_CHAR = 'X'
                                              AND (CLASS_NUM, REF_CHAR_NUM , REF_CHAR_VALUE) NOT IN ( SELECT CLASS_NUM,
                                                                                                              CHAR_NUM,
                                                                                                              CHAR_VALUE
                                                                                                         FROM V_CHARVAL
                                                                                                        WHERE MULTI_CHAR = 'X')
                                            ORDER BY 
                                                    CLASS_NUM ASC, 
                                                    CHAR_NUM ASC, 
                                                    CHAR_VALUE ASC`);
        // Delete is not handled as it should reflect in UID and PID 

        // Insert for char.

        // WHEN MULTI_CHAR = 'X' THEN CONCAT( concat( CHAR_NUM, '_' ), CHARVAL_NUM )
        // let liCharacteristics = await cds.run(`SELECT DISTINCT
        //                                                     CLASS_NUM,
        //                                                     CASE
        //                                                         WHEN MULTI_CHAR = 'X' THEN CONCAT( concat( CHAR_NUM, '_' ), CHAR_VALUE )
        //                                                         ELSE CHAR_NUM
        //                                                     END AS CHAR_NUM,
        //                                                     CASE
        //                                                         WHEN MULTI_CHAR = 'X' THEN CHAR_VALUE
        //                                                         ELSE CHAR_NAME
        //                                                     END AS CHAR_NAME,
        //                                                     CASE
        //                                                         WHEN MULTI_CHAR = 'X' THEN CHARVAL_DESC
        //                                                         ELSE CHAR_DESC
        //                                                     END AS CHAR_DESC,
        //                                                     CHAR_GROUP,
        //                                                     CHAR_TYPE,
        //                                                     ENTRY_REQ,
        //                                                     CHAR_CATGRY,
        //                                                     MULTI_CHAR,
        //                                                     CHAR_NUM AS REF_CHAR_NUM,
        //                                                     CHAR_NAME AS REF_CHAR_NAME,
        //                                                     CHAR_DESC AS REF_CHAR_DESC
        //                                                 FROM V_CHARVAL_MASTER                                                        
        //                                                 WHERE V_CHARVAL_MASTER.CHAR_TYPE NOT IN ('DATE', 'NUM' )`);

        let liCharacteristics = await cds.run(`SELECT DISTINCT 
                                                    A.CLASS_NUM,
                                                    CASE 
                                                    WHEN (
                                                    CASE
                                                        WHEN A.MULTI_CHAR = 'X' THEN CONCAT( concat( A.CHAR_NUM, '_' ), B.CHAR_VALUE )
                                                        ELSE A.CHAR_NUM
                                                    END IS NULL 
                                                    
                                                    ) THEN A.CHAR_NUM
                                                    ELSE CASE
                                                        WHEN A.MULTI_CHAR = 'X' THEN CONCAT( concat( A.CHAR_NUM, '_' ), B.CHAR_VALUE )
                                                        ELSE A.CHAR_NUM
                                                    END 
                                                    END AS CHAR_NUM,
                                                    CASE 
                                                    WHEN (
                                                    CASE
                                                        WHEN A.MULTI_CHAR = 'X' THEN B.CHAR_VALUE
                                                        ELSE A.CHAR_NAME
                                                    END IS NULL 
                                                    ) THEN A.CHAR_NAME
                                                    ELSE CASE
                                                        WHEN A.MULTI_CHAR = 'X' THEN B.CHAR_VALUE
                                                        ELSE A.CHAR_NAME
                                                    END 
                                                    END AS CHAR_NAME,
                                                    CASE 
                                                    WHEN (
                                                    CASE
                                                        WHEN A.MULTI_CHAR = 'X' THEN B.CHARVAL_DESC
                                                        ELSE A.CHAR_DESC
                                                    END IS NULL 
                                                    ) THEN A.CHAR_DESC
                                                    ELSE CASE
                                                        WHEN A.MULTI_CHAR = 'X' THEN B.CHARVAL_DESC
                                                        ELSE A.CHAR_DESC
                                                    END 
                                                    END AS CHAR_DESC,
                                                    A.CHAR_GROUP,
                                                    A.CHAR_TYPE,
                                                    A.ENTRY_REQ,
                                                    A.CHAR_CATGRY,
                                                    A.MULTI_CHAR,
                                                    A.CHAR_NUM AS REF_CHAR_NUM,
                                                    A.CHAR_NAME AS REF_CHAR_NAME,
                                                    A.CHAR_DESC AS REF_CHAR_DESC
                                                FROM CP_CHARACTERISTICS_MASTER AS A
                                                LEFT OUTER JOIN V_CHARVAL_MASTER AS B
                                                ON A.CLASS_NUM = B.CLASS_NUM
                                                AND A.CHAR_NUM = B.CHAR_NUM
                                                WHERE (A.CHAR_TYPE NOT IN ('DATE', 'NUM')
                                                )`);
                                                
        liCharacteristics_num = await cds.run(`SELECT DISTINCT
                                                        CLASS_NUM,
                                                        CHAR_NUM,
                                                        CHAR_NAME,
                                                        CHAR_DESC,
                                                        CHAR_GROUP,
                                                        CHAR_TYPE,
                                                        ENTRY_REQ,
                                                        CHAR_CATGRY,
                                                        MULTI_CHAR,
                                                        CHAR_NUM AS REF_CHAR_NUM,
                                                        CHAR_NAME AS REF_CHAR_NAME,
                                                        CHAR_DESC AS REF_CHAR_DESC
                                                    FROM CP_CHARACTERISTICS_MASTER                                                        
                                                    WHERE CP_CHARACTERISTICS_MASTER.CHAR_TYPE IN ('NUM')`);
        if (liCharacteristics_num.length > 0) {
            liCharacteristics = [...liCharacteristics, ...liCharacteristics_num];
        }
        // Insert to char values
        let liCharValues = await cds.run(`SELECT DISTINCT CASE
                                                 WHEN MULTI_CHAR = 'X' THEN CONCAT( concat( CHAR_NUM, '_' ), CHAR_VALUE )
                                                                    ELSE CHAR_NUM
                                                                END AS CHAR_NUM,
                                                                CHARVAL_NUM,
                                                                CHAR_VALUE,
                                                                CHARVAL_DESC,
                                                                CATCH_ALL,
                                                                CHAR_NUM AS REF_CHAR_NUM ,
                                                                CHARVAL_NUM AS REF_CHARVAL_NUM,
                                                                CHAR_VALUE AS REF_CHAR_VALUE,
                                                                '' AS GENFLAG 
                                                                FROM V_CHARVAL_MASTER
                                                                WHERE V_CHARVAL_MASTER.CHAR_TYPE NOT IN ('DATE','NUM')`);
        // Insert to char values      

        // let liCharValN = await cds.run(`SELECT DISTINCT CONCAT(concat(CHAR_NUM, '_'),CHAR_VALUE) as CHAR_NUM,
        //                                                 CONCAT(CONCAT(CHARVAL_NUM, '_'), 'N') AS CHARVAL_NUM,
        //                                                 CONCAT('NOT_',CHAR_VALUE) AS CHAR_VALUE,
        //                                                 CONCAT('No ',CHARVAL_DESC) AS CHARVAL_DESC,
        //                                                 CATCH_ALL,
        //                                                 CHAR_NUM AS REF_CHAR_NUM ,
        //                                                 CHARVAL_NUM AS REF_CHARVAL_NUM,
        //                                                 CHAR_VALUE AS REF_CHAR_VALUE,
        //                                                  'X' AS GENFLAG
        //                                           FROM V_CHARVAL_MASTER
        //                                          WHERE MULTI_CHAR = 'X'                                                 
        //                                          AND V_CHARVAL_MASTER.CHAR_TYPE NOT IN ('DATE')`);

        let liCharValN = await cds.run(`SELECT DISTINCT CONCAT(concat(CHAR_NUM, '_'),CHAR_VALUE) as CHAR_NUM,
                                                        CONCAT('NOT_',CHAR_VALUE) AS CHARVAL_NUM,
                                                        CONCAT('NOT_',CHAR_VALUE) AS CHAR_VALUE,
                                                        CONCAT('No ',CHARVAL_DESC) AS CHARVAL_DESC,
                                                        CATCH_ALL,
                                                        CHAR_NUM AS REF_CHAR_NUM ,
                                                        CHARVAL_NUM AS REF_CHARVAL_NUM,
                                                        CHAR_VALUE AS REF_CHAR_VALUE,
                                                         'X' AS GENFLAG
                                                  FROM V_CHARVAL_MASTER
                                                 WHERE MULTI_CHAR = 'X'                                                 
                                                 AND V_CHARVAL_MASTER.CHAR_TYPE NOT IN ('DATE','NUM')`);

        if (liCharacteristics.length > 0) {
            try {
                await cds.run(`DELETE FROM CP_CHARACTERISTICS`);

            } catch (error) {
                console.log('Charateristicts deletion failed: ' + error);
            }
            try {
                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_CHARACTERISTICS'] },
                        entries: liCharacteristics
                    }
                })
                vFlagChar = 'X';
            } catch (error) {
                console.log("Unable to insert Multi Char. Master :" + error);
            }
        }
        if (liCharValues.length > 0 && vFlagChar === 'X') {
            try {
                await cds.run(`DELETE FROM CP_CHAR_VALUES`);
            } catch (error) {
                console.log('Charateristicts value deletion failed: ' + error);
            }
            try {
                if(liCharValues.length > 0){
                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_CHAR_VALUES'] },
                        entries: liCharValues
                    }
                });
            }
            if(liCharValN.length > 0){
                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_CHAR_VALUES'] },
                        entries: liCharValN
                    }
                })
            }
                bSuccess = true;
            } catch (error) {
                console.log("Unable to insert Multi Char values:" + error);
            }

        }
        if(bSuccess === true) {
            await this.updateCharValueBuckets();
          }
    }
    async processSalesConfigC() {
        let liSalesConfigNoVal = [];
        let liSalesConfig = await cds.run(`
                                            SELECT DISTINCT
                                            CP_SALESH_CONFIG_MASTER.SALES_DOC,
                                            CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
                                            CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
                                            V_CHARVAL.CHAR_NUM AS CHAR_NUM,
                                            CP_SALESH_CONFIG_MASTER.CHARVAL_NUM,
                                            CP_SALESH_CONFIG_MASTER.CHAR_VALUE
                                        FROM 
                                            CP_SALESH_CONFIG_MASTER
                                            INNER JOIN
                                            V_CHARVAL
                                            ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                                                AND V_CHARVAL.CHAR_TYPE NOT IN ('NUM','DATE')
                                           WHERE V_CHARVAL.MULTI_CHAR <> 'X' `);
                                        //    AND ( CP_SALESH_CONFIG_MASTER.SALES_DOC, CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM) NOT IN 
                                        //             (SELECT DISTINCT SALES_DOC,SALESDOC_ITEM FROM CP_SALESH_CONFIG) `);
        let liSalesConfigYes_Multi = [];
        liSalesConfigYes_Multi = await cds.run(`
                                                    SELECT DISTINCT
                                                    CP_SALESH_CONFIG_MASTER.SALES_DOC,
                                                    CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
                                                    CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
                                                    V_CHARVAL.CHAR_NUM AS CHAR_NUM,
                                                    CP_SALESH_CONFIG_MASTER.CHARVAL_NUM,
                                                    CP_SALESH_CONFIG_MASTER.CHAR_VALUE
                                                FROM 
                                                    CP_SALESH_CONFIG_MASTER
                                                    INNER JOIN
                                                    V_CHARVAL
                                                    ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                                                         AND CP_SALESH_CONFIG_MASTER.CHARVAL_NUM = V_CHARVAL.REF_CHARVAL_NUM
                                                        AND V_CHARVAL.CHAR_TYPE NOT IN ('NUM','DATE')
                                                   WHERE V_CHARVAL.MULTI_CHAR = 'X'`);
                                                //    AND 
                                                //    ( CP_SALESH_CONFIG_MASTER.SALES_DOC, CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM) NOT IN 
                                                //             (SELECT DISTINCT SALES_DOC,SALESDOC_ITEM FROM CP_SALESH_CONFIG) `);
        if (liSalesConfigYes_Multi.length > 0) {
            liSalesConfig = [...liSalesConfig, ...liSalesConfigYes_Multi];
        }

        // let liSalesConfigBucket = await cds.run(`
        //                                         SELECT DISTINCT 
        //                                                 CP_SALESH_CONFIG_MASTER.SALES_DOC,
        //                                                 CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
        //                                                 CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
        //                                                 V_CHARVAL_BUCKET.CHAR_NUM,
        //                                                 V_CHARVAL_BUCKET.CHAR_VALUE AS CHARVAL_NUM,
        //                                                 V_CHARVAL_BUCKET.CHAR_VALUE
        //                                         FROM CP_SALESH_CONFIG_MASTER
        //                                   INNER JOIN V_CHARVAL_BUCKET
        //                                           ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL_BUCKET.CHAR_NUM
        //                                          AND CASE CP_SALESH_CONFIG_MASTER.CHAR_VALUE
        //                                                     WHEN '' THEN 0.
        //                                                     ELSE TO_INTEGER(ROUND( CP_SALESH_CONFIG_MASTER.CHAR_VALUE, 0, ROUND_HALF_DOWN ))
        //                                                 END BETWEEN V_CHARVAL_BUCKET.RANGE_FROM AND V_CHARVAL_BUCKET.RANGE_TO
        //                                     WHERE ((CP_SALESH_CONFIG_MASTER.SALES_DOC, CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM, CP_SALESH_CONFIG_MASTER.CHAR_NUM) NOT IN (SELECT DISTINCT 
        //                                         SALES_DOC,
        //                                         SALESDOC_ITEM,
        //                                         CHAR_NUM
        //                                     FROM CP_SALESH_CONFIG))`);

        // let liSalesConfigBucket = await cds.run(`SELECT DISTINCT 
        //                                                     CP_SALESH_CONFIG_MASTER.SALES_DOC,
        //                                                     CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
        //                                                     CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
        //                                                     V_CHARVAL_BUCKET.CHAR_NUM,
        //                                                     V_CHARVAL_BUCKET.CHAR_VALUE AS CHARVAL_NUM,
        //                                                     V_CHARVAL_BUCKET.CHAR_VALUE
        //                                                 FROM CP_SALESH_CONFIG_MASTER
        //                                           INNER JOIN V_CHARVAL_BUCKET
        //                                                   ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL_BUCKET.CHAR_NUM
        //                                                  AND CASE CP_SALESH_CONFIG_MASTER.CHAR_VALUE
        //                                                                 WHEN '' THEN 0.
        //                                                                 ELSE TO_INTEGER(ROUND( CP_SALESH_CONFIG_MASTER.CHAR_VALUE, 0, ROUND_HALF_DOWN ))
        //                                                             END BETWEEN V_CHARVAL_BUCKET.RANGE_FROM AND V_CHARVAL_BUCKET.RANGE_TO
        //                                                 WHERE ((CP_SALESH_CONFIG_MASTER.SALES_DOC, 
        //                                                         CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM, 
        //                                                         CP_SALESH_CONFIG_MASTER.CHAR_NUM) NOT IN (SELECT DISTINCT 
        //                                                                 SALES_DOC,
        //                                                                 SALESDOC_ITEM,
        //                                                                 CHAR_NUM
        //                                                             FROM CP_SALESH_CONFIG)
        //                                                   AND (CP_SALESH_CONFIG_MASTER.CHAR_NUM IN (SELECT DISTINCT "CHAR_NUM"
        //                                                                                                     FROM"CP_CHARACTERISTICS"
        //                                                                                                     WHERE CHAR_TYPE = 'NUM')))`);

        let liSalesConfigBucket = [], liSaleshConfig = [];
        // liSalesConfigBucket = await cds.run(`SELECT DISTINCT 
        //                                                 CP_SALESH_CONFIG_MASTER.SALES_DOC,
        //                                                 CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
        //                                                 CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
        //                                                 V_CHARVAL_BUCKET.CHAR_NUM,
        //                                                 V_CHARVAL_BUCKET.CHAR_VALUE AS CHARVAL_NUM,
        //                                                 V_CHARVAL_BUCKET.CHAR_VALUE
        //                                             FROM CP_SALESH_CONFIG_MASTER
        //                                         INNER JOIN V_CHARVAL_BUCKET
        //                                             ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL_BUCKET.CHAR_NUM
        //                                             AND CASE CP_SALESH_CONFIG_MASTER.CHAR_VALUE
        //                                                             WHEN '' THEN 0.
        //                                                             ELSE TO_INTEGER(ROUND( CP_SALESH_CONFIG_MASTER.CHAR_VALUE, 0, ROUND_HALF_DOWN ))
        //                                                         END BETWEEN V_CHARVAL_BUCKET.RANGE_FROM AND V_CHARVAL_BUCKET.RANGE_TO
        //                                             WHERE CP_SALESH_CONFIG_MASTER.CHAR_NUM IN (SELECT DISTINCT "CHAR_NUM"
        //                                                                                                 FROM"CP_CHARACTERISTICS"
        //                                                                                                 WHERE CHAR_TYPE = 'NUM')`);


        liSalesConfigBucket = await cds.run(`SELECT DISTINCT 
                                                    CP_SALESH_CONFIG_MASTER.SALES_DOC,
                                                    CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
                                                    CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
                                                    IFNULL( V_CHARVAL_BUCKET.CHAR_NUM, CP_SALESH_CONFIG_MASTER.CHAR_NUM ) AS CHAR_NUM,
                                                    IFNULL(
                                                        V_CHARVAL_BUCKET.CHAR_VALUE, 
                                                        CP_SALESH_CONFIG_MASTER.CHAR_VALUE
                                                    ) AS CHARVAL_NUM,
                                                    IFNULL(
                                                        V_CHARVAL_BUCKET.CHAR_VALUE, 
                                                        CP_SALESH_CONFIG_MASTER.CHAR_VALUE
                                                    ) AS CHAR_VALUE
                                                FROM 
                                                    CP_SALESH_CONFIG_MASTER
                                                    INNER JOIN
                                                    CP_CHARACTERISTICS
                                                    ON CP_CHARACTERISTICS.CHAR_NUM = CP_SALESH_CONFIG_MASTER.CHAR_NUM
                                                        AND CP_CHARACTERISTICS.CHAR_TYPE = 'NUM'
                                                    LEFT OUTER JOIN
                                                    V_CHARVAL_BUCKET
                                                    ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL_BUCKET.CHAR_NUM
                                                        AND CASE CP_SALESH_CONFIG_MASTER.CHAR_VALUE
                                                                WHEN '' THEN 0.
                                                                ELSE TO_INTEGER(ROUND( CP_SALESH_CONFIG_MASTER.CHAR_VALUE, 0, ROUND_HALF_DOWN ))
                                                            END BETWEEN V_CHARVAL_BUCKET.RANGE_FROM AND V_CHARVAL_BUCKET.RANGE_TO`);

        liSaleshConfig = await cds.run(`SELECT DISTINCT 
                                                   SALES_DOC,
                                                   SALESDOC_ITEM,
                                                   CHAR_NUM
                                              FROM CP_SALESH_CONFIG`);
                                              
        // Filter an array of objects based on another array
        //  -- Filter array1 with only those objects which are not contained in array2

        // if (liSalesConfigBucket.length > 0 && liSaleshConfig.length > 0) {
        //     const filterByReference = (arr1, arr2) => {
        //         let res = [];
        //         res = arr1.filter(el => {
        //             return !arr2.find(element => {
        //                 return element.SALES_DOC === el.SALES_DOC
        //                     && element.SALESDOC_ITEM === el.SALESDOC_ITEM
        //                     && element.CHAR_NUM === el.CHAR_NUM;
        //             });
        //         });
        //         return res;
        //     }

        //     liSalesConfigBucket = filterByReference(liSalesConfigBucket, liSaleshConfig);
        // }

        if (liSalesConfig.length > 0) {
            // Delete Sales Config Data
            try {
                await cds.run(`DELETE FROM CP_SALESH_CONFIG WHERE SALES_DOC NOT LIKE 'SE%'`);
            } catch (error) {
                console.log('Sales Config Deletion Failed: ' + error);
            }
            try {
                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_SALESH_CONFIG'] },
                        entries: liSalesConfig
                    }
                })
            } catch (error) {
                console.log("Unable to insert into Sales Config :" + error);
            }
        }

        if (liSalesConfigBucket.length > 0) {
            try {
                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_SALESH_CONFIG'] },
                        entries: liSalesConfigBucket
                    }
                })
            } catch (error) {
                console.log("Unable to insert into Sales Config :" + error);
            }
        }
        // let liSalesConfigYesVal = await cds.run(`
        //                                     SELECT DISTINCT
        //                                     V_SALESH_UID_CONFIG.SALES_DOC,
        //                                     V_SALESH_UID_CONFIG.SALESDOC_ITEM,
        //                                     V_SALESH_UID_CONFIG.PRODUCT_ID,
        //                                     V_CHARVAL.CHAR_NUM AS CHAR_NUM,
        //                                     V_SALESH_UID_CONFIG.CHARVAL_NUM
        //                                 FROM 
        //                                     V_SALESH_UID_CONFIG
        //                                     INNER JOIN
        //                                     V_CHARVAL
        //                                     ON V_SALESH_UID_CONFIG.CHAR_NUM = V_CHARVAL.CHAR_NUM
        //                                         AND V_SALESH_UID_CONFIG.CHARVAL_NUM = V_CHARVAL.CHARVAL_NUM 
        //                                     WHERE V_CHARVAL.MULTI_CHAR = 'X'
        //                                     ORDER BY V_SALESH_UID_CONFIG.SALES_DOC,
        //                                             V_SALESH_UID_CONFIG.SALESDOC_ITEM,
        //                                             V_SALESH_UID_CONFIG.PRODUCT_ID,
        //                                             V_CHARVAL.CHAR_NUM ,
        //                                             V_SALESH_UID_CONFIG.CHARVAL_NUM`)

        let liSalesConfigYesVal = await cds.run(`
                                                    SELECT DISTINCT
                                                    CP_SALESH_CONFIG.SALES_DOC,
                                                    CP_SALESH_CONFIG.SALESDOC_ITEM,
                                                    CP_SALESH_CONFIG.PRODUCT_ID,
                                                    V_CHARVAL.CHAR_NUM AS CHAR_NUM,
                                                    CP_SALESH_CONFIG.CHARVAL_NUM,
                                                    CP_SALESH_CONFIG.CHAR_VALUE
                                                FROM CP_SALESH_CONFIG
                                          INNER JOIN V_CHARVAL
                                                  ON CP_SALESH_CONFIG.CHAR_NUM = V_CHARVAL.CHAR_NUM
                                                 AND CP_SALESH_CONFIG.CHAR_VALUE = V_CHARVAL.CHAR_VALUE 
                                               WHERE V_CHARVAL.MULTI_CHAR = 'X'
                                            ORDER BY CP_SALESH_CONFIG.SALES_DOC,
                                                            CP_SALESH_CONFIG.SALESDOC_ITEM,
                                                            CP_SALESH_CONFIG.PRODUCT_ID,
                                                            V_CHARVAL.CHAR_NUM ,
                                                            CP_SALESH_CONFIG.CHAR_VALUE`)
        // Add No values for all the Sales orders which doesnot have no values
        let liConfigNoVal = [];
        liConfigNoVal = await cds.run(`SELECT DISTINCT 
                                                    CP_SALESH_CONFIG_MASTER.SALES_DOC,
                                                    CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
                                                    CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
                                                    V_CHARVAL.CHAR_NUM ,
                                                    V_CHARVAL.CHARVAL_NUM,
                                                    V_CHARVAL.CHAR_VALUE
                                                FROM 
                                                    CP_SALESH_CONFIG_MASTER
                                                INNER JOIN
                                                    V_CHARVAL
                                                    ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM 
                                                WHERE V_CHARVAL.MULTI_CHAR = 'X'
                                                  AND V_CHARVAL.CHAR_VALUE LIKE 'NOT_%' 
                                                ORDER BY CP_SALESH_CONFIG_MASTER.SALES_DOC,
                                                         CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
                                                         CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
                                                         V_CHARVAL.CHAR_NUM ,
                                                         V_CHARVAL.CHAR_VALUE`);

        // Get only No values for the char values which doesnot exists in SO

        liSalesConfigNoVal = liConfigNoVal.filter(function (aConfig) {
            let sDoc = aConfig.SALES_DOC,
                sDocItem = aConfig.SALESDOC_ITEM;
            var aData = liSalesConfigYesVal.filter(f => f.SALES_DOC == sDoc && f.SALESDOC_ITEM == sDocItem &&
                (f.CHAR_NUM == aConfig.CHAR_NUM || "NOT_" + f.CHAR_VALUE == aConfig.CHAR_VALUE))
            if (aData.length == 0) {//_N values that doesn't exists
                return aConfig;
            }
        });


        // liSalesConfigNoVal = liConfigNoVal.filter(function (aConfig) {
        //     let sDoc = aConfig.SALES_DOC,
        //         sDocItem = aConfig.SALESDOC_ITEM;
        //     var aData = liSalesConfigYesVal.filter(f => f.SALES_DOC == sDoc && f.SALESDOC_ITEM == sDocItem &&
        //         (f.CHAR_NUM == aConfig.CHAR_NUM || f.CHARVAL_NUM + "_N" == aConfig.CHARVAL_NUM))
        //     if (aData.length == 0) {//_N values that doesn't exists
        //         return aConfig;
        //     }
        // });
        if (liSalesConfigNoVal.length > 0) {
            try {
                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_SALESH_CONFIG'] },
                        entries: liSalesConfigNoVal
                    }
                })
            } catch (error) {
                console.log("Unable to insert NO values into Sales Config :" + error);
            }
        }

        liConfigNoVal = [];
        // liConfigNoVal = await cds.run(`SELECT DISTINCT  CP_SALESH_CONFIG_MASTER.SALES_DOC,
        //                                                 CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
        //                                                 CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
        //                                                 V_PRODCLSCHARVAL.CHAR_NUM,
        //                                                 V_PRODCLSCHARVAL.CHARVAL_NUM,
        //                                                 V_PRODCLSCHARVAL.CHAR_VALUE,
        //                                                 CP_SALESH_CONFIG_MASTER.PRODUCT_ID
        //                                             FROM CP_SALESH_CONFIG_MASTER
        //                                       INNER JOIN V_PRODCLSCHARVAL
        //                                               ON CP_SALESH_CONFIG_MASTER.PRODUCT_ID = V_PRODCLSCHARVAL.PRODUCT_ID
        //                                             WHERE V_PRODCLSCHARVAL.MULTI_CHAR = 'X'
        //                                                 AND V_PRODCLSCHARVAL.CHAR_VALUE LIKE 'Not_%'
        //                                                 AND ((CP_SALESH_CONFIG_MASTER.SALES_DOC, CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM, V_PRODCLSCHARVAL.CHAR_NUM) NOT IN (SELECT 
        //                                                         SALES_DOC,
        //                                                         SALESDOC_ITEM,
        //                                                         CHAR_NUM
        //                                                     FROM CP_SALESH_CONFIG))
        //                                             ORDER BY 
        //                                                 CP_SALESH_CONFIG_MASTER.SALES_DOC ASC, 
        //                                                 CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM ASC, 
        //                                                 CP_SALESH_CONFIG_MASTER.PRODUCT_ID ASC, 
        //                                                 V_PRODCLSCHARVAL.CHAR_NUM ASC, 
        //                                                 V_PRODCLSCHARVAL.CHARVAL_NUM ASC,
        //                                                 CP_SALESH_CONFIG_MASTER.PRODUCT_ID ASC`);

        liConfigNoVal = await cds.run(`SELECT DISTINCT  CP_SALESH_CONFIG_MASTER.SALES_DOC,
                                                        CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
                                                        CP_SALESH_CONFIG_MASTER.PRODUCT_ID,
                                                        V_PRODCLSCHARVAL.CHAR_NUM,
                                                        V_PRODCLSCHARVAL.CHARVAL_NUM,
                                                        V_PRODCLSCHARVAL.CHAR_VALUE,
                                                        CP_SALESH_CONFIG_MASTER.PRODUCT_ID
                                                    FROM CP_SALESH_CONFIG_MASTER
                                              INNER JOIN V_PRODCLSCHARVAL
                                                      ON CP_SALESH_CONFIG_MASTER.PRODUCT_ID = V_PRODCLSCHARVAL.PRODUCT_ID
                                                    WHERE V_PRODCLSCHARVAL.MULTI_CHAR = 'X'
                                                        AND V_PRODCLSCHARVAL.CHAR_VALUE LIKE 'NOT_%'                                                        
                                                    ORDER BY 
                                                        CP_SALESH_CONFIG_MASTER.SALES_DOC ASC, 
                                                        CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM ASC, 
                                                        CP_SALESH_CONFIG_MASTER.PRODUCT_ID ASC, 
                                                        V_PRODCLSCHARVAL.CHAR_NUM ASC, 
                                                        V_PRODCLSCHARVAL.CHARVAL_NUM ASC,
                                                        CP_SALESH_CONFIG_MASTER.PRODUCT_ID ASC`);

        if (liConfigNoVal.length > 0) {
            try {
                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_SALESH_CONFIG'] },
                        entries: liConfigNoVal
                    }
                })
            } catch (error) {
                console.log("Unable to insert NO values into Sales Config :" + error);
            }
        }

    }
    async processSalesConfig() {

        // Check if the connection is established and records are available in the table
        let lRecords =  await cds.run(`SELECT count(*)
                                                       FROM CP_SALESH_CONFIG_MASTER
                                                 INNER JOIN V_CHARVAL
                                                         ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                                                        AND V_CHARVAL.CHAR_TYPE NOT IN ('NUM','DATE')`);
        if (lRecords === 0) {
            return;
        }
        
        
        // Delete all the records except for Seed Orders
        try {
            await cds.run(`DELETE FROM CP_SALESH_CONFIG WHERE SALES_DOC NOT LIKE 'SE%'`);
        } catch (error) {
            console.log('Sales Config Deletion Failed: ' + error);
        }


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
                                            WHERE V_CHARVAL.MULTI_CHAR <> 'X');`)

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
                                            WHERE V_CHARVAL.MULTI_CHAR = 'X');`)

        // Insert Bucket Values
        await cds.run(`INSERT INTO CP_SALESH_CONFIG (SALES_DOC,
                                                    SALESDOC_ITEM, 
                                                    CHAR_NUM, 
                                                    CHARVAL_NUM, 
                                                    CHAR_VALUE, 
                                                    PRODUCT_ID) 
                                (SELECT DISTINCT CP_SALESH_CONFIG_MASTER.SALES_DOC,
                                                    CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
                                                    IFNULL( V_CHARVAL_BUCKET.CHAR_NUM, CP_SALESH_CONFIG_MASTER.CHAR_NUM ) AS CHAR_NUM,
                                                    IFNULL( V_CHARVAL_BUCKET.CHAR_VALUE, CP_SALESH_CONFIG_MASTER.CHAR_VALUE ) AS CHARVAL_NUM,
                                                    IFNULL( V_CHARVAL_BUCKET.CHAR_VALUE, CP_SALESH_CONFIG_MASTER.CHAR_VALUE ) AS CHAR_VALUE,
                                                    CP_SALESH_CONFIG_MASTER.PRODUCT_ID
                                            FROM CP_SALESH_CONFIG_MASTER
                                        INNER JOIN CP_CHARACTERISTICS
                                                ON CP_CHARACTERISTICS.CHAR_NUM = CP_SALESH_CONFIG_MASTER.CHAR_NUM
                                                AND CP_CHARACTERISTICS.CHAR_TYPE = 'NUM'
                                    LEFT OUTER JOIN V_CHARVAL_BUCKET
                                                ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL_BUCKET.CHAR_NUM
                                                AND CASE CP_SALESH_CONFIG_MASTER.CHAR_VALUE
                                                    WHEN '' THEN 0.
                                                    ELSE TO_INTEGER(ROUND( CP_SALESH_CONFIG_MASTER.CHAR_VALUE, 0, ROUND_HALF_DOWN ))
                                                    END BETWEEN V_CHARVAL_BUCKET.RANGE_FROM AND V_CHARVAL_BUCKET.RANGE_TO);`)     
                                                    
                                                    

        // Insert Bucket Values
        // await cds.run(`INSERT INTO CP_SALESH_CONFIG (SALES_DOC,
        //                                             SALESDOC_ITEM, 
        //                                             CHAR_NUM, 
        //                                             CHARVAL_NUM, 
        //                                             CHAR_VALUE, 
        //                                             PRODUCT_ID) 
        //                            (SELECT DISTINCT CP_SALESH_CONFIG_MASTER.SALES_DOC,
        //                                             CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
        //                                             V_CHARVAL.CHAR_NUM,
        //                                             V_CHARVAL.CHARVAL_NUM,
        //                                             V_CHARVAL.CHAR_VALUE,
        //                                             CP_SALESH_CONFIG_MASTER.PRODUCT_ID
        //                                        FROM CP_SALESH_CONFIG_MASTER
	    //                                  INNER JOIN V_CHARVAL
	    //                                          ON CP_SALESH_CONFIG_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
        //                                       WHERE V_CHARVAL.MULTI_CHAR = 'X'
	    //                                         AND V_CHARVAL.CHAR_VALUE LIKE 'NOT_%'
	    //                                         AND ((CP_SALESH_CONFIG_MASTER.SALES_DOC, 
        //                                             CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM, 
        //                                             CP_SALESH_CONFIG_MASTER.PRODUCT_ID, 
        //                                             V_CHARVAL.CHAR_NUM, 
        //                                             V_CHARVAL.CHARVAL_NUM, 
        //                                             V_CHARVAL.CHAR_VALUE) NOT IN (SELECT DISTINCT CP_SALESH_CONFIG.SALES_DOC,
        //                                                                                           CP_SALESH_CONFIG.SALESDOC_ITEM,
        //                                                                                           CP_SALESH_CONFIG.PRODUCT_ID,
        //                                                                                           V_CHARVAL.CHAR_NUM AS CHAR_NUM,
        //                                                                                           CP_SALESH_CONFIG.CHARVAL_NUM,
        //                                                                                           CP_SALESH_CONFIG.CHAR_VALUE
		//                                                                                      FROM CP_SALESH_CONFIG
        //                                                                                INNER JOIN V_CHARVAL
        //                                                                                        ON CP_SALESH_CONFIG.CHAR_NUM = V_CHARVAL.CHAR_NUM
		// 		                                                                              AND CP_SALESH_CONFIG.CHAR_VALUE = V_CHARVAL.CHAR_VALUE
		//                                                                                     WHERE V_CHARVAL.MULTI_CHAR = 'X')))`);    
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

        // Insert Bucket Values
        // await cds.run(`INSERT INTO CP_SALESH_CONFIG (SALES_DOC,
        //                                             SALESDOC_ITEM, 
        //                                             CHAR_NUM, 
        //                                             CHARVAL_NUM, 
        //                                             CHAR_VALUE, 
        //                                             PRODUCT_ID) 
        //                            (SELECT DISTINCT CP_SALESH_CONFIG_MASTER.SALES_DOC,
        //                                             CP_SALESH_CONFIG_MASTER.SALESDOC_ITEM,
        //                                             V_PRODCLSCHARVAL.CHAR_NUM,
        //                                             V_PRODCLSCHARVAL.CHARVAL_NUM,
        //                                             V_PRODCLSCHARVAL.CHAR_VALUE,
        //                                             CP_SALESH_CONFIG_MASTER.PRODUCT_ID
        //                                        FROM CP_SALESH_CONFIG_MASTER
        //                                  INNER JOIN V_PRODCLSCHARVAL
        //                                          ON CP_SALESH_CONFIG_MASTER.PRODUCT_ID = V_PRODCLSCHARVAL.PRODUCT_ID
        //                                       WHERE V_PRODCLSCHARVAL.MULTI_CHAR = 'X'
        //                                         AND V_PRODCLSCHARVAL.CHAR_VALUE LIKE 'NOT_%' )`)                                                     
        
       

    }
    //Update multivalue char. for Object Dependency Rules
    async processBOMOD() {
        let vFlagChar = '';
        let liBOMODep = [];
        // Chnage char num for multivalues
        liBOMODep = await cds.run(`SELECT distinct
                                    CP_OBJDEP_HEADER_MASTER.OBJ_DEP,
                                    CP_OBJDEP_HEADER_MASTER.OBJ_COUNTER,
                                    CP_OBJDEP_HEADER_MASTER.CLASS_NUM,
                                    V_CHARVAL.CHAR_NUM,
                                    CP_OBJDEP_HEADER_MASTER.CHAR_COUNTER,
                                    CP_OBJDEP_HEADER_MASTER.CHARVAL_NUM,
                                    CP_OBJDEP_HEADER_MASTER.CHAR_VALUE,
                                    CP_OBJDEP_HEADER_MASTER.OD_CONDITION,
                                    CP_OBJDEP_HEADER_MASTER.ROW_ID
                                FROM 
                                        CP_OBJDEP_HEADER_MASTER
                                        INNER JOIN
                                        V_CHARVAL
                                        ON CP_OBJDEP_HEADER_MASTER.CLASS_NUM = V_CHARVAL.CLASS_NUM
                                        and CP_OBJDEP_HEADER_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                                        and CP_OBJDEP_HEADER_MASTER.CHAR_VALUE = V_CHARVAL.REF_CHAR_VALUE
                                    `);
        if (liBOMODep.length > 0) {
            try {
                await cds.run(`DELETE FROM CP_OBJDEP_HEADER`);

            } catch (error) {
                console.log('Object Dep. deletion failed: ' + error);
            }
            try {
                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_OBJDEP_HEADER'] },
                        entries: liBOMODep
                    }
                })
                vFlagChar = 'X';
            } catch (error) {
                console.log("Unable to insert Object Dep. Master :" + error);
            }
        }
        if (vFlagChar === 'X') {
            let liBOMOD = [];
            liBOMOD = await cds.run(`SELECT * 
                                     FROM CP_OBJDEP_HEADER
                                     ORDER BY OBJ_DEP,
                                              OBJ_COUNTER,
                                              CLASS_NUM,
                                              CHAR_NUM,
                                              CHARVAL_NUM,
                                              ROW_ID`);
            for (let iODCnt = 0; iODCnt < liBOMOD.length; iODCnt++) {
                // Check for a obj Dep. if the char. is same as before
                if (iODCnt === 0 || liBOMOD[iODCnt].OBJ_DEP === liBOMOD[GenFunctions.subOne(iODCnt, liBOMOD.length)].OBJ_DEP &&
                    liBOMOD[iODCnt].OBJ_COUNTER === liBOMOD[GenFunctions.subOne(iODCnt, liBOMOD.length)].OBJ_COUNTER &&
                    liBOMOD[iODCnt].CHAR_NUM == liBOMOD[GenFunctions.subOne(iODCnt, liBOMOD.length)].CHAR_NUM) {
                    liBOMOD[iODCnt].ROW_ID = liBOMOD[GenFunctions.subOne(iODCnt, liBOMOD.length)].ROW_ID;
                }
                // if char. is not equal increament the rowID
                else if (liBOMOD[iODCnt].OBJ_DEP === liBOMOD[GenFunctions.subOne(iODCnt, liBOMOD.length)].OBJ_DEP &&
                    liBOMOD[iODCnt].OBJ_COUNTER === liBOMOD[GenFunctions.subOne(iODCnt, liBOMOD.length)].OBJ_COUNTER &&
                    liBOMOD[iODCnt].CHAR_NUM !== liBOMOD[GenFunctions.subOne(iODCnt, liBOMOD.length)].CHAR_NUM) {
                    liBOMOD[iODCnt].ROW_ID = parseInt(liBOMOD[GenFunctions.subOne(iODCnt, liBOMOD.length)].ROW_ID) + 1;
                }
                // Update each ROW_ID
                try {
                    await UPDATE`CP_OBJDEP_HEADER`
                        .with({
                            ROW_ID: liBOMOD[iODCnt].ROW_ID
                        })
                        .where(`OBJ_DEP = '${liBOMOD[iODCnt].OBJ_DEP}'
                    AND OBJ_COUNTER = '${liBOMOD[iODCnt].OBJ_COUNTER}' 
                    AND CLASS_NUM = '${liBOMOD[iODCnt].CLASS_NUM}'
                    AND CHAR_NUM = '${liBOMOD[iODCnt].CHAR_NUM}'
                    AND CHAR_COUNTER = '${liBOMOD[iODCnt].CHAR_COUNTER}'
                    AND CHARVAL_NUM  = '${liBOMOD[iODCnt].CHARVAL_NUM}' 
                    AND CHAR_VALUE  = '${liBOMOD[iODCnt].CHAR_VALUE}'                           
                    `);
                } catch (error) {
                    console.log(error);
                }

            }
        }

        /// Update Multi-Char and Char Value Buckets for CP_BOM_DEP Data

        let vFlagCharMul = '';
        let liBOMODepMul = [];
        // Change char num for multivalues
        /** Commented below code as Numeric Type characteristics with selection conditions appear with special characters
         * to be handled in BOM-UID Mapping using CP_BOM_OD_DEP (BLOB table) */
        liBOMODepMul = await cds.run(`SELECT distinct
                                    CP_BOM_DEP_MASTER.DEPENDENCY,
                                    CP_BOM_DEP_MASTER.DEP_COUNTER,
                                    V_CHARVAL.CHAR_NUM,
                                    CP_BOM_DEP_MASTER.CHAR_COUNTER,
                                    V_CHARVAL.CHAR_VALUE AS CHAR_VAL,
                                    CP_BOM_DEP_MASTER.CHAR_VAL AS REF_CHAR_VALUE,
                                    CP_BOM_DEP_MASTER.OD_CONDITION,
                                    CP_BOM_DEP_MASTER.ROW_ID
                                FROM CP_BOM_DEP_MASTER
                         INNER JOIN  V_CHARVAL
                                        ON CP_BOM_DEP_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                                        AND CP_BOM_DEP_MASTER.CHAR_VAL = V_CHARVAL.REF_CHAR_VALUE
                                       AND  V_CHARVAL.CHAR_TYPE NOT IN ('NUM', 'DATE')
                                    WHERE V_CHARVAL.MULTI_CHAR = 'X'
                                    `);
        let liBOMODepNonMultiChar = [];
        liBOMODepNonMultiChar = await cds.run(`SELECT distinct
                                    CP_BOM_DEP_MASTER.DEPENDENCY,
                                    CP_BOM_DEP_MASTER.DEP_COUNTER,
                                    V_CHARVAL.CHAR_NUM,
                                    CP_BOM_DEP_MASTER.CHAR_COUNTER,
                                    CP_BOM_DEP_MASTER.CHAR_VAL AS CHAR_VAL,
                                    CP_BOM_DEP_MASTER.CHAR_VAL AS REF_CHAR_VALUE,
                                    CP_BOM_DEP_MASTER.OD_CONDITION,
                                    CP_BOM_DEP_MASTER.ROW_ID
                                FROM CP_BOM_DEP_MASTER
                         INNER JOIN  V_CHARVAL
                                        ON CP_BOM_DEP_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                                       AND  V_CHARVAL.CHAR_TYPE NOT IN ('NUM', 'DATE')
                                    WHERE V_CHARVAL.MULTI_CHAR <> 'X'
                                    `);
        if (liBOMODepNonMultiChar.length > 0) {
            liBOMODepMul = [...liBOMODepMul, ...liBOMODepNonMultiChar];
        }
        if (liBOMODepMul.length > 0) {
            try {
                await cds.run(`DELETE FROM CP_BOM_DEP`);

            } catch (error) {
                console.log('Object Dep. deletion failed: ' + error);
            }
            try {
                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_BOM_DEP'] },
                        entries: liBOMODepMul
                    }
                })
                vFlagCharMul = 'X';
            } catch (error) {
                console.log("Unable to insert Object Dep. Master :" + error);
            }
        }
        if (vFlagCharMul === 'X') {
            let liBOMODMul = [];
            liBOMODMul = await cds.run(`SELECT * 
                                     FROM CP_BOM_DEP
                                     ORDER BY DEPENDENCY,
                                              DEP_COUNTER,
                                              CHAR_NUM,
                                              CHAR_VAL,
                                              ROW_ID`);
            for (let iODCnt = 0; iODCnt < liBOMODMul.length; iODCnt++) {
                // Check for a obj Dep. if the char. is same as before
                if (iODCnt === 0 || liBOMODMul[iODCnt].OBJ_DEP === liBOMODMul[GenFunctions.subOne(iODCnt, liBOMODMul.length)].OBJ_DEP &&
                    liBOMODMul[iODCnt].OBJ_COUNTER === liBOMODMul[GenFunctions.subOne(iODCnt, liBOMODMul.length)].OBJ_COUNTER &&
                    liBOMODMul[iODCnt].CHAR_NUM == liBOMODMul[GenFunctions.subOne(iODCnt, liBOMODMul.length)].CHAR_NUM) {
                    liBOMODMul[iODCnt].ROW_ID = liBOMODMul[GenFunctions.subOne(iODCnt, liBOMODMul.length)].ROW_ID;
                }
                // if char. is not equal increament the rowID
                else if (liBOMODMul[iODCnt].OBJ_DEP === liBOMODMul[GenFunctions.subOne(iODCnt, liBOMODMul.length)].OBJ_DEP &&
                    liBOMODMul[iODCnt].OBJ_COUNTER === liBOMODMul[GenFunctions.subOne(iODCnt, liBOMODMul.length)].OBJ_COUNTER &&
                    liBOMODMul[iODCnt].CHAR_NUM !== liBOMODMul[GenFunctions.subOne(iODCnt, liBOMODMul.length)].CHAR_NUM) {
                    liBOMODMul[iODCnt].ROW_ID = parseInt(liBOMODMul[GenFunctions.subOne(iODCnt, liBOMODMul.length)].ROW_ID) + 1;
                }
                // Update each ROW_ID
                try {
                    await UPDATE`CP_BOM_DEP`
                        .with({
                            ROW_ID: liBOMODMul[iODCnt].ROW_ID
                        })
                        .where(`DEPENDENCY = '${liBOMODMul[iODCnt].DEPENDENCY}'
                    AND DEP_COUNTER = '${liBOMODMul[iODCnt].DEP_COUNTER}' 
                    AND CHAR_NUM = '${liBOMODMul[iODCnt].CHAR_NUM}'
                    AND CHAR_COUNTER = '${liBOMODMul[iODCnt].CHAR_COUNTER}'
                    AND CHAR_VAL  = '${liBOMODMul[iODCnt].CHAR_VAL}'                            
                    `);
                } catch (error) {
                    console.log(error);
                }

            }
        }
            // */
       
        /** Commented below code as Numeric Type characteristics with selection conditions appear with special characters
         * to be handled in BOM-UID Mapping using CP_BOM_OD_DEP (BLOB table) 
        liBOMODepMul = [];
                    liBOMODepMul = await cds.run(`SELECT DISTINCT 
                    CP_BOM_DEP_MASTER.DEPENDENCY,
                    CP_BOM_DEP_MASTER.DEP_COUNTER,
                    IFNULL( V_CHARVAL_BUCKET.CHAR_NUM, CP_BOM_DEP_MASTER.CHAR_NUM ) AS CHAR_NUM,
                    CP_BOM_DEP_MASTER.CHAR_COUNTER,
                    IFNULL( V_CHARVAL_BUCKET.CHAR_VALUE, CP_BOM_DEP_MASTER.CHAR_VAL ) AS CHAR_VAL,
                    CP_BOM_DEP_MASTER.CHAR_VAL AS REF_CHAR_VALUE,
                    CP_BOM_DEP_MASTER.OD_CONDITION,
                    CP_BOM_DEP_MASTER.ROW_ID
                FROM CP_BOM_DEP_MASTER
                INNER JOIN	CP_CHARACTERISTICS
                        ON CP_CHARACTERISTICS.CHAR_NUM = CP_BOM_DEP_MASTER.CHAR_NUM
                    AND CP_CHARACTERISTICS.CHAR_TYPE = 'NUM'
                LEFT OUTER JOIN V_CHARVAL_BUCKET
                        ON CP_BOM_DEP_MASTER.CHAR_NUM = V_CHARVAL_BUCKET.CHAR_NUM
                    AND CASE CP_BOM_DEP_MASTER.CHAR_VAL
                  WHEN '' THEN 0.
                                ELSE TO_INTEGER(ROUND( CP_BOM_DEP_MASTER.CHAR_VAL, 0, ROUND_HALF_DOWN ))
                            END BETWEEN V_CHARVAL_BUCKET.RANGE_FROM AND V_CHARVAL_BUCKET.RANGE_TO`);

        if (liBOMODepMul.length > 0) {
            try {
                await cds.run({
                    INSERT:
                    {
                        into: { ref: ['CP_BOM_DEP'] },
                        entries: liBOMODepMul
                    }
                });
            } catch (error) {
                console.log("Unable to insert Object Dep. Master :" + error);
            }
        }
        */

    }

    //Update multivalue char. for Parital products
    async processPartialProd() {
        let liPartialProd = await cds.run(`SELECT DISTINCT
                                                    CP_PARTIALPROD_CHAR_MASTER.PRODUCT_ID,
                                                    CP_PARTIALPROD_CHAR_MASTER.LOCATION_ID,                                                    
                                                    CP_PARTIALPROD_CHAR_MASTER.CLASS_NUM,
                                                    V_CHARVAL.CHAR_NUM,
                                                    CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE  AS CHARVAL_NUM,
                                                    CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE
                                             FROM CP_PARTIALPROD_CHAR_MASTER
                                       INNER JOIN V_CHARVAL
                                        ON CP_PARTIALPROD_CHAR_MASTER.CLASS_NUM = V_CHARVAL.CLASS_NUM
                                       AND CP_PARTIALPROD_CHAR_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                                       AND V_CHARVAL.CHAR_TYPE NOT IN ('NUM','DATE')
                                       WHERE V_CHARVAL.MULTI_CHAR <> 'X'
                                    `);
        let liPartialProdMulti = [];
        liPartialProdMulti = await cds.run(`SELECT DISTINCT
                                    CP_PARTIALPROD_CHAR_MASTER.PRODUCT_ID,
                                    CP_PARTIALPROD_CHAR_MASTER.LOCATION_ID,                                                    
                                    CP_PARTIALPROD_CHAR_MASTER.CLASS_NUM,
                                    V_CHARVAL.CHAR_NUM,
                                    CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE  AS CHARVAL_NUM,
                                    CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE
                             FROM CP_PARTIALPROD_CHAR_MASTER
                       INNER JOIN V_CHARVAL
                        ON CP_PARTIALPROD_CHAR_MASTER.CLASS_NUM = V_CHARVAL.CLASS_NUM
                       AND CP_PARTIALPROD_CHAR_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                       AND CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE = V_CHARVAL.REF_CHAR_VALUE
                       AND V_CHARVAL.CHAR_TYPE NOT IN ('NUM','DATE')
                       WHERE V_CHARVAL.MULTI_CHAR = 'X'
                    `);
        if (liPartialProd.length > 0) {
            liPartialProd = [...liPartialProd, ...liPartialProdMulti];
        }
        //2025-02-07 Deepa Change - Start
        let liPartialProdBucket = await cds.run(`SELECT DISTINCT
            CP_PARTIALPROD_CHAR_MASTER.PRODUCT_ID,
            CP_PARTIALPROD_CHAR_MASTER.LOCATION_ID,
            CP_PARTIALPROD_CHAR_MASTER.CLASS_NUM,
            IFNULL(
                V_CHARVAL_BUCKET.CHAR_NUM,
                CP_PARTIALPROD_CHAR_MASTER.CHAR_NUM
            ) AS CHAR_NUM,
            IFNULL(
                V_CHARVAL_BUCKET.CHAR_VALUE,
                CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE
            ) AS CHARVAL_NUM,
            IFNULL(
                V_CHARVAL_BUCKET.CHAR_VALUE,
                CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE
            ) AS CHAR_VALUE
        FROM
            CP_PARTIALPROD_CHAR_MASTER
            LEFT OUTER JOIN
            V_CHARVAL_BUCKET
            ON CP_PARTIALPROD_CHAR_MASTER.CHAR_NUM = V_CHARVAL_BUCKET.CHAR_NUM
                AND CASE CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE
                        WHEN '' THEN 0.
                        ELSE TO_INTEGER(ROUND(CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE, 0, ROUND_HALF_DOWN ))
                    END BETWEEN TO_INTEGER(V_CHARVAL_BUCKET.RANGE_FROM) AND TO_INTEGER(V_CHARVAL_BUCKET.RANGE_TO)
        WHERE (CP_PARTIALPROD_CHAR_MASTER.CHAR_NUM IN (SELECT DISTINCT "CHAR_NUM"
        FROM "CP_CHARACTERISTICS"
        WHERE CHAR_TYPE = 'NUM'))`);
        
        //2025-02-07 Deepa Change - Start
        // let liPartialProdBucket = await cds.run(`SELECT DISTINCT
        //                                                 CP_PARTIALPROD_CHAR_MASTER.PRODUCT_ID,
        //                                                 CP_PARTIALPROD_CHAR_MASTER.LOCATION_ID,                                                    
        //                                                 CP_PARTIALPROD_CHAR_MASTER.CLASS_NUM,
        //                                                 V_CHARVAL_BUCKET.CHAR_NUM,
        //                                                 V_CHARVAL_BUCKET.CHAR_VALUE AS CHARVAL_NUM,
        //                                                 V_CHARVAL_BUCKET.CHAR_VALUE
        //                                             FROM CP_PARTIALPROD_CHAR_MASTER
        //                                       INNER JOIN V_CHARVAL_BUCKET
        //                                      ON  CP_PARTIALPROD_CHAR_MASTER.CHAR_NUM = V_CHARVAL_BUCKET.CHAR_NUM
        //                                     AND CASE CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE
        //                                         WHEN '' THEN 0.
        //                                         ELSE TO_INTEGER(ROUND( CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE, 0, ROUND_HALF_DOWN ))
        //                                         END BETWEEN V_CHARVAL_BUCKET.RANGE_FROM AND V_CHARVAL_BUCKET.RANGE_TO
        //                                   WHERE (CP_PARTIALPROD_CHAR_MASTER.CHAR_NUM IN (SELECT DISTINCT "CHAR_NUM"
        //                                                                                    FROM "CP_CHARACTERISTICS"
        //                                                                                   WHERE CHAR_TYPE = 'NUM'))`);

        // let liPartialProdBucket = await cds.run(`SELECT DISTINCT
        //                                             CP_PARTIALPROD_CHAR_MASTER.PRODUCT_ID,
        //                                             CP_PARTIALPROD_CHAR_MASTER.LOCATION_ID,                                                    
        //                                             CP_PARTIALPROD_CHAR_MASTER.CLASS_NUM,
        //                                             V_CHARVAL_BUCKET.CHAR_NUM,
        //                                             V_CHARVAL_BUCKET.CHAR_VALUE AS CHARVAL_NUM,
        //                                             V_CHARVAL_BUCKET.CHAR_VALUE
        //                                         FROM CP_PARTIALPROD_CHAR_MASTER
        //                                     INNER JOIN V_CHARVAL_BUCKET
        //                                     ON  CP_PARTIALPROD_CHAR_MASTER.CHAR_NUM = V_CHARVAL_BUCKET.CHAR_NUM
                                            
        //                                     WHERE (CP_PARTIALPROD_CHAR_MASTER.CHAR_NUM IN (SELECT DISTINCT "CHAR_NUM"
        //                                                                             FROM "CP_CHARACTERISTICS"
        //                                                                             WHERE CHAR_TYPE = 'NUM'))
        //                                       AND CASE CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE
        //                                           WHEN '' THEN 0.
        //                                           ELSE TO_INTEGER(ROUND( CP_PARTIALPROD_CHAR_MASTER.CHAR_VALUE, 0, ROUND_HALF_DOWN ))
        //                                           END BETWEEN V_CHARVAL_BUCKET.RANGE_FROM AND V_CHARVAL_BUCKET.RANGE_TO`);
        if (liPartialProd.length > 0) {
            try {
                await cds.run(`DELETE FROM CP_PARTIALPROD_CHAR`);

            } catch (error) {
                console.log('Partial Product: ' + error);
            }
            try {
                await cds.run({
                    UPSERT:
                    {
                        into: { ref: ['CP_PARTIALPROD_CHAR'] },
                        entries: liPartialProd
                    }
                });

                if (liPartialProdBucket.length > 0) {
                    await cds.run({
                        UPSERT:
                        {
                            into: { ref: ['CP_PARTIALPROD_CHAR'] },
                            entries: liPartialProdBucket
                        }
                    });
                }
            } catch (error) {
                console.log("Unable to insert Parital product Char :" + error);
            }
        }

        if (liPartialProdBucket.length > 0) {
            try {
                await cds.run({
                    UPSERT:
                    {
                        into: { ref: ['CP_PARTIALPROD_CHAR'] },
                        entries: liPartialProdBucket
                    }
                });

            } catch (error) {
                console.log("Unable to insert Parital product Char :" + error);
            }
        }
    }
    async processVariantRules() {
        let bFlag = false, vFlagChar = false;
        //     let liVariantRules = await cds.run(`SELECT DISTINCT 
        //                                                     CP_DERIVEDCHAR_MASTER.PRODUCT_ID,
        //                                                     CP_DERIVEDCHAR_MASTER.RECORD_TYPE,
        //                                                     CP_DERIVEDCHAR_MASTER.CLAUSE,
        //                                                     CP_DERIVEDCHAR_MASTER.DEP_NAME,
        //                                                     CP_DERIVEDCHAR_MASTER.CLASS_NUM,
        //                                                     V_CHARVAL.CHAR_NUM,
        //                                                     CP_DERIVEDCHAR_MASTER.CHARVAL_NUM,
        //                                                     CP_DERIVEDCHAR_MASTER.SORT_COUNTER,
        //                                                     CP_DERIVEDCHAR_MASTER.CHAR_COUNTER,
        //                                                     CP_DERIVEDCHAR_MASTER.OD_CONDITION,
        //                                                     CP_DERIVEDCHAR_MASTER.RULE_TYPE,
        //                                                     CP_DERIVEDCHAR_MASTER.CHANGE_NO,
        //                                                     CP_DERIVEDCHAR_MASTER.VALID_FROM,
        //                                                     CP_DERIVEDCHAR_MASTER.VALID_TO,
        //                                                     CP_DERIVEDCHAR_MASTER.CHANGED_DATE,
        //                                                     CP_DERIVEDCHAR_MASTER.CHANGED_BY,
        //                                                     CP_DERIVEDCHAR_MASTER.CREATED_DATE,
        //                                                     CP_DERIVEDCHAR_MASTER.CREATED_BY,
        //                                                     CP_DERIVEDCHAR_MASTER.CHANGED_TIME,
        //                                                     CP_DERIVEDCHAR_MASTER.CREATED_TIME
        //                                                 FROM 
        //                                                     CP_DERIVEDCHAR_MASTER
        //                                                     INNER JOIN
        //                                                     V_CHARVAL
        //                                                     ON CP_DERIVEDCHAR_MASTER.CLASS_NUM = V_CHARVAL.CLASS_NUM
        //                                                         AND CP_DERIVEDCHAR_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
        //                                                         AND CP_DERIVEDCHAR_MASTER.CHARVAL_NUM = V_CHARVAL.REF_CHARVAL_NUM;
        // `);
        //if (liVariantRules.length > 0) {
        try {
            await cds.run(`DELETE FROM CP_DERIVEDCHAR`);
            bFlag = true;

        } catch (error) {
            console.log('Variant Rules Deletion: ' + error);
        }
        if (bFlag === true) {
            try {
                await cds.run(`INSERT INTO CP_DERIVEDCHAR (SELECT DISTINCT 
                                                                            CP_DERIVEDCHAR_MASTER.PRODUCT_ID,
                                                                            CP_DERIVEDCHAR_MASTER.RECORD_TYPE,
                                                                            CP_DERIVEDCHAR_MASTER.CLAUSE,
                                                                            CP_DERIVEDCHAR_MASTER.DEP_NAME,
                                                                            CP_DERIVEDCHAR_MASTER.CLASS_NUM,
                                                                            V_CHARVAL.CHAR_NUM,
                                                                            CP_DERIVEDCHAR_MASTER.CHAR_VALUE AS CHARVAL_NUM, 
                                                                            CP_DERIVEDCHAR_MASTER.CHAR_VALUE,
                                                                            CP_DERIVEDCHAR_MASTER.SORT_COUNTER,
                                                                            CP_DERIVEDCHAR_MASTER.CHAR_COUNTER,
                                                                            CP_DERIVEDCHAR_MASTER.OD_CONDITION,
                                                                            CP_DERIVEDCHAR_MASTER.RULE_TYPE,
                                                                            CP_DERIVEDCHAR_MASTER.CHANGE_NO,
                                                                            CP_DERIVEDCHAR_MASTER.VALID_FROM,
                                                                            CP_DERIVEDCHAR_MASTER.VALID_TO,
                                                                            CP_DERIVEDCHAR_MASTER.CHANGED_DATE,
                                                                            CP_DERIVEDCHAR_MASTER.CHANGED_BY,
                                                                            CP_DERIVEDCHAR_MASTER.CREATED_DATE,
                                                                            CP_DERIVEDCHAR_MASTER.CREATED_BY,
                                                                            CP_DERIVEDCHAR_MASTER.CHANGED_TIME,
                                                                            CP_DERIVEDCHAR_MASTER.CREATED_TIME
                                                                        FROM 
                                                                            CP_DERIVEDCHAR_MASTER
                                                                            INNER JOIN
                                                                            V_CHARVAL
                                                                            ON CP_DERIVEDCHAR_MASTER.CLASS_NUM = V_CHARVAL.CLASS_NUM
                                                                                AND CP_DERIVEDCHAR_MASTER.CHAR_NUM = V_CHARVAL.REF_CHAR_NUM
                                                                                AND CP_DERIVEDCHAR_MASTER.CHAR_VALUE = V_CHARVAL.REF_CHAR_VALUE)`);


                vFlagChar = true;
            } catch (error) {
                console.log("Unable to insert Derived Char rules :" + error);
            }
        }
        if (vFlagChar === true) {
            let liRule = [];
            liRule = await cds.run(`SELECT * 
                                     FROM CP_DERIVEDCHAR
                                     ORDER BY PRODUCT_ID,
                                              CLAUSE,
                                              DEP_NAME,
                                              CLASS_NUM,
                                              CHAR_NUM,
                                              CHARVAL_NUM,
                                              CHAR_VALUE,
                                              CHAR_COUNTER`);
            for (let iODCnt = 0; iODCnt < liRule.length; iODCnt++) {
                // Check for a obj Dep. if the char. is same as before
                if (iODCnt === 0 || liRule[iODCnt].PRODUCT_ID === liRule[GenFunctions.subOne(iODCnt, liRule.length)].PRODUCT_ID &&
                    liRule[iODCnt].DEP_NAME === liRule[GenFunctions.subOne(iODCnt, liRule.length)].DEP_NAME &&
                    liRule[iODCnt].CLAUSE === liRule[GenFunctions.subOne(iODCnt, liRule.length)].CLAUSE &&
                    liRule[iODCnt].CHAR_NUM == liRule[GenFunctions.subOne(iODCnt, liRule.length)].CHAR_NUM) {
                    liRule[iODCnt].CHAR_COUNTER = liRule[GenFunctions.subOne(iODCnt, liRule.length)].CHAR_COUNTER;
                }
                // if char. is not equal increament the rowID
                else if (liRule[iODCnt].PRODUCT_ID === liRule[GenFunctions.subOne(iODCnt, liRule.length)].PRODUCT_ID &&
                    liRule[iODCnt].DEP_NAME === liRule[GenFunctions.subOne(iODCnt, liRule.length)].DEP_NAME &&
                    liRule[iODCnt].CLAUSE === liRule[GenFunctions.subOne(iODCnt, liRule.length)].CLAUSE &&
                    liRule[iODCnt].CHAR_NUM !== liRule[GenFunctions.subOne(iODCnt, liRule.length)].CHAR_NUM) {
                    liRule[iODCnt].CHAR_COUNTER = parseInt(liRule[GenFunctions.subOne(iODCnt, liRule.length)].CHAR_COUNTER) + 1;
                }
                // Update each ROW_ID
                try {
                    await UPDATE`CP_DERIVEDCHAR`
                        .with({
                            CHAR_COUNTER: liRule[iODCnt].CHAR_COUNTER
                        })
                        .where(`PRODUCT_ID = '${liRule[iODCnt].PRODUCT_ID}'
                            AND DEP_NAME = '${liRule[iODCnt].DEP_NAME}'
                            AND CLAUSE = '${liRule[iODCnt].CLAUSE}'
                            AND CLASS_NUM = '${liRule[iODCnt].CLASS_NUM}'
                            AND CHAR_NUM = '${liRule[iODCnt].CHAR_NUM}'
                            AND CHARVAL_NUM  = '${liRule[iODCnt].CHARVAL_NUM}'
                            AND CHAR_VALUE  = '${liRule[iODCnt].CHAR_VALUE}'                     
                       `);
                } catch (error) {
                    console.log(error);
                }

            }
        }
    }
    async updateCharValueBuckets() {
        let aCharValues = [], aCharValBucket = [], aFilCharValBucket = [];
        aCharValues = await cds.run(`SELECT DISTINCT
            CHAR_NUM,
            CHAR_VALUE,
            CASE
            WHEN CHAR_VALUE LIKE '%-%' THEN SUBSTR_BEFORE(CHAR_VALUE, '-' )
                ELSE CHAR_VALUE
            END AS RANGE_FROM,
            CASE
            WHEN CHAR_VALUE LIKE '%-%' THEN SUBSTR_AFTER(CHAR_VALUE, '-' )
                ELSE CHAR_VALUE
            END AS RANGE_TO,
            CASE
            WHEN CHAR_VALUE LIKE '%-%'
                THEN (CAST(SUBSTR_BEFORE( CHAR_VALUE, '-' ) AS DECIMAL(15,4)) + CAST(SUBSTR_AFTER( CHAR_VALUE, '-' ) AS DECIMAL(15,4))) / 2
                ELSE CHAR_VALUE
            END AS MEDIAN
        FROM V_CHARVAL_MASTER
        WHERE V_CHARVAL_MASTER.CHAR_TYPE IN ('NUM')
        GROUP BY MULTI_CHAR,
                CHAR_NUM,
                CHAR_VALUE`);
 
 
        //   aCharValBucket = await cds.run(`SELECT DISTINCT CHAR_NUM FROM CP_CHARVAL_BUCKET`);
 
        //   // Check if array of objects does not exists in another array of objects
        //   aFilCharValBucket = aCharValues.filter((el) => {
        //      return !aCharValBucket.some((f) => {
        //          return f.CHAR_NUM === el.CHAR_NUM;
        //      });
        //  });       
         
        //  if(aFilCharValBucket.length > 0) {
        //      try {
        //          await cds.run({
        //              INSERT:
        //              {
        //                  into: { ref: ['CP_CHARVAL_BUCKET'] },
        //                  entries: aFilCharValBucket
        //              }
        //          });
 
        //          GenFunctions.log(`Characteristics Value Buckets inserted successfully`)
                 
        //      } catch (error) {
        //          GenFunctions.log(`Unable to insert Char Value Buckets : ${error}`);
        //      }
        //  }

        if(aCharValues.length > 0) {
             try {                
                await cds.run(UPSERT.into('CP_CHARVAL_BUCKET').entries(aCharValues));
 
                 GenFunctions.log(`Characteristics Value Buckets inserted successfully`)
                 
             } catch (error) {
                 GenFunctions.log(`Unable to insert Char Value Buckets : ${error}`);
             }
         }
 
         
     }
}
module.exports = MultiValueChar;