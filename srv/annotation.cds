using cp as service from '../db/data-model';
using cp as pal from '../db/pal-schema';
using V_SALESHCFG_CHARVAL from '../db/data-model';
using V_FACTORYLOC from '../db/data-model';
using V_LOCPRODDATA from '../db/data-model';
using V_JOBSTATUS from '../db/jobscheduler';
using V_PRODLOCLINEDESC from '../db/data-model';
using V_VC_HISTORY_TS_CUST from '../db/data-model';
using js from '../db/jobscheduler';

// Product annotations
annotate service.PRODUCT with @(
    UI       : {
        SelectionFields        : [
            PRODUCT_ID,
            PROD_SERIES
        ],
        LineItem               : [
            {
                $Type                 : 'UI.DataField',
                Value                 : PRODUCT_ID,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : PROD_DESC,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : PROD_TYPE,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '10rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : PROD_FAMILY,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : PROD_SERIES,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '10rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : PROD_MODEL,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '10rem'}
            }
        ],
        HeaderInfo             : {
            Title         : {Value: PRODUCT_ID},
            Description   : {Value: PROD_DESC},
            TypeName      : 'Product',
            TypeNamePlural: 'Configurable Products'
        },
        HeaderFacets           : [{
            $Type             : 'UI.ReferenceFacet',
            Target            : '@UI.FieldGroup#Description',
            ![@UI.Importance] : #Medium
        }],
        FieldGroup #Description: {Data: [{
            $Type: 'UI.DataField',
            Value: PROD_DESC
        }]},
        FieldGroup #Details    : {Data: [
            {
                $Type: 'UI.DataField',
                Value: PROD_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: PROD_TYPE
            },
            {
                $Type: 'UI.DataField',
                Value: PROD_FAMILY
            },
            {
                $Type: 'UI.DataField',
                Value: PROD_GROUP
            },
            {
                $Type: 'UI.DataField',
                Value: PROD_SERIES
            },
            {
                $Type: 'UI.DataField',
                Value: PROD_MODEL
            },
            {
                $Type: 'UI.DataField',
                Value: PROD_MDLRANGE
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD1
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD2
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD3
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD4
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD5
            }
        ]}
    },
    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'ProdDetails',
        Label : 'Configurable Product Details',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Product Details',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

//////////////////////////////////////////////////////////////////////
//******************************************************************//
//////////////////////////////////////////////////////////////////////
annotate service.LOCATION with @(
    UI       : {
        SelectionFields        : [
            LOCATION_ID,
            LOCATION_TYPE
        ],
        LineItem               : [
            {
                $Type                 : 'UI.DataField',
                //Label : 'Location ID',
                Value                 : LOCATION_ID,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                //Label : 'Description',
                Value                 : LOCATION_DESC,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                //Label : 'Location Type',
                Value                 : LOCATION_TYPE,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '10rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : LATITUDE,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : LONGITUTE,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            }
        // {
        //     $Type : 'UI.DataField',
        //     Value : RESERVE_FIELD1,
        // ![@UI.Importance] : #High
        // },
        // {
        //     $Type : 'UI.DataField',
        //     Value : RESERVE_FIELD2,
        // ![@UI.Importance] : #High
        // },
        // {
        //     $Type : 'UI.DataField',
        //     Value : RESERVE_FIELD3,
        // ![@UI.Importance] : #High
        // },
        // {
        //     $Type : 'UI.DataField',
        //     Value : RESERVE_FIELD4,
        // ![@UI.Importance] : #High
        // },
        // {
        //     $Type : 'UI.DataField',
        //     Value : RESERVE_FIELD5,
        // ![@UI.Importance] : #High
        // }
        ],
        // BOI
        HeaderInfo             : {
            Title         : {Value: LOCATION_ID},
            Description   : {Value: LOCATION_DESC},
            TypeName      : 'Location',
            TypeNamePlural: 'Locations',
        },
        HeaderFacets           : [{
            $Type             : 'UI.ReferenceFacet',
            Target            : '@UI.FieldGroup#Description',
            ![@UI.Importance] : #Medium,

        }],
        FieldGroup #Description: {Data: [
            {
                $Type: 'UI.DataField',
                Value: LOCATION_ID
            },
            {
                $Type: 'UI.DataField',
                Value: LOCATION_DESC
            },
        ]},
        FieldGroup #Details    : {Data: [
            {
                $Type: 'UI.DataField',
                Value: LOCATION_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD1
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD2
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD3
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD4
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD5
            }
        ]}

    },
    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'LocDetails',
        Label : 'Location Details',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Location Details',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);


// Customer Group annotations
annotate service.CUSTOMERGROUP with @(
    UI       : {
        SelectionFields        : [CUSTOMER_GROUP],
        LineItem               : [
            {
                Label             : 'Customer Group',
                Value             : CUSTOMER_GROUP,
                ![@UI.Importance] : #High
            },
            {
                Label             : 'Description',
                Value             : CUSTOMER_DESC,
                ![@UI.Importance] : #High
            }
        ],
        HeaderInfo             : {
            Title         : {Value: CUSTOMER_GROUP},
            Description   : {Value: CUSTOMER_DESC},
            TypeName      : 'Customer Group',
            TypeNamePlural: 'Customer Groups',
        },
        HeaderFacets           : [{
            $Type             : 'UI.ReferenceFacet',
            Target            : '@UI.FieldGroup#Description',
            ![@UI.Importance] : #Medium,

        }],
        FieldGroup #Description: {Data: [
            {
                $Type: 'UI.DataField',
                Value: CUSTOMER_GROUP
            },
            {
                $Type: 'UI.DataField',
                Value: CUSTOMER_DESC
            },
        ]},
        FieldGroup #Details    : {Data: [
            {
                $Type: 'UI.DataField',
                Value: CUSTOMER_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD1
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD2
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD3
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD4
            },
            {
                $Type: 'UI.DataField',
                Value: RESERVE_FIELD5
            }
        ]}
    },
    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'custDetails',
        Label : 'Customer Group Details',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Customer Group Details',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

// // Product attributes
// annotate service.PROD_ATTRIBUTES with @(
//     UI        : {
//         SelectionFields     : [
//             PRODUCT_ID,
//             PROD_FAMILY
//         ],
//         LineItem            : [
//             {
//                 $Type : 'UI.DataField',
//                 Value : PRODUCT_ID,
//                 ![@UI.Importance]   : #High
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PROD_GROUP,
//                 ![@UI.Importance]   : #High
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PROD_FAMILY,
//                 ![@UI.Importance]   : #High
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PROD_SERIES,
//                 ![@UI.Importance]   : #High
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PROD_MODEL,
//                 ![@UI.Importance]   : #High
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PROD_MDLRANGE,
//                 ![@UI.Importance]   : #High
//             }
//         ],
//         HeaderInfo          : {
//             Title          : {Value : LOCATION_ID},
//             Description    : {Value : PRODUCT_ID},
//             TypeName       : 'Product',
//             TypeNamePlural : 'Products',
//         },
//         FieldGroup #Details : {Data : [
//             {
//                 $Type : 'UI.DataField',
//                 Value : PROD_FAMILY
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PROD_GROUP
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PROD_SERIES
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PROD_MODEL
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PROD_MDLRANGE
//             }
//         ]}
//     },
//     // Page Facets
//     UI.Facets : [{
//         $Type  : 'UI.CollectionFacet',
//         ID     : 'ProdaTR',
//         Label  : 'Product Attributes',
//         Facets : [{
//             $Type  : 'UI.ReferenceFacet',
//             Label  : 'Product Attributes',
//             Target : '@UI.FieldGroup#Details'
//         }]
//     }]
// );

// Product Configuration



//PIR
// annotate service.PIR_CH with @(
//     UI        : {
//         SelectionFields         : [
//             PRODUCT_ID,
//             PLANT
//         ],
//         LineItem                : [
//             {
//                 $Type : 'UI.DataField',
//                 Value : PRODUCT_ID
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PLANT
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : CHAR_NAME
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : CHAR_VALUE
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : CH_QTY
//             }

//         ],
//         HeaderInfo              : {
//             Title          : {Value : PRODUCT_ID},
//             Description    : {Value : PLANT},
//             TypeName       : 'PIR Char',
//             TypeNamePlural : 'PIR Chars',
//         },
//         HeaderFacets            : [{
//             $Type             : 'UI.ReferenceFacet',
//             Target            : '@UI.FieldGroup#Description',
//             ![@UI.Importance] : #Medium
//         }],
//         FieldGroup #Description : {Data : [{
//             $Type : 'UI.DataField',
//             Value : PLANT
//         }]},
//         FieldGroup #Details     : {Data : [
//             {
//                 $Type : 'UI.DataField',
//                 Value : REQ_DATE
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PT_NUMBER
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PT_LINE
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : SESSION_ID
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : CHAR_NAME
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : CHAR_VALUE
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : FLAG_USAGE
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PROCESS_FLAG
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : CH_QTY
//             },
//             {
//                 $Type : 'UI.DataField',
//                 Value : PLANT
//             }
//         ]},

//     },
//     // Page Facets
//     UI.Facets : [{
//         $Type  : 'UI.CollectionFacet',
//         ID     : 'PIRDetails',
//         Label  : 'PIR Config Details',
//         Facets : [{
//             $Type  : 'UI.ReferenceFacet',
//             Label  : 'PIR Config Details',
//             Target : '@UI.FieldGroup#Details'
//         }]
//     }]
// );

//TS_OBJHEADER
annotate service.TS_OBJDEPHDR with @(
    UI       : {
        SelectionFields    : [
            CAL_DATE,
            LOCATION_ID,
            PRODUCT_ID
        ],
        LineItem           : [
            {
                $Type             : 'UI.DataField', //Label : 'Product Family',
                Value             : CAL_DATE,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Family',
                Value             : LOCATION_ID,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product ID',
                Value             : PRODUCT_ID,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Description',
                Value             : OBJ_TYPE,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product ID',
                Value             : OBJ_DEP,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Description',
                Value             : OBJ_COUNTER,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Series',
                Value             : SUCCESS,
                ![@UI.Importance] : #High
            }
        ],
        HeaderInfo         : {
            Title         : {Value: CAL_DATE},
            Description   : {Value: PRODUCT_ID},
            TypeName      : 'Timeseries',
            TypeNamePlural: 'Timeseries',
        },
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: CAL_DATE
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: LOCATION_ID
            },
            {
                $Type: 'UI.DataField', //Label : 'Product ID',
                Value: PRODUCT_ID
            },
            {
                $Type: 'UI.DataField', //Label : 'Description',
                Value: OBJ_TYPE
            },
            {
                $Type: 'UI.DataField', //Label : 'Product ID',
                Value: OBJ_DEP
            },
            {
                $Type: 'UI.DataField', //Label : 'Description',
                Value: OBJ_COUNTER
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Series',
                Value: SUCCESS
            }
        ]}
    },
    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'Timeser',
        Label : 'Timeseries',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Timeseries',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

//TS_OBJDEP_CHARHDR
annotate service.TS_OBJDEP_CHARHDR with @(
    UI       : {
        SelectionFields    : [
            CAL_DATE,
            LOCATION_ID,
            PRODUCT_ID
        ],
        LineItem           : [
            {
                $Type             : 'UI.DataField',
                Value             : CAL_DATE,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : LOCATION_ID,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : PRODUCT_ID,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : OBJ_TYPE,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : OBJ_DEP,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : OBJ_COUNTER,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : ROW_ID,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : SUCCESS,
                ![@UI.Importance] : #High
            }
        ],
        HeaderInfo         : {
            Title         : {Value: CAL_DATE},
            Description   : {Value: PRODUCT_ID},
            TypeName      : 'Timeseries',
            TypeNamePlural: 'Timeseries',
        },
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: CAL_DATE
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: LOCATION_ID
            },
            {
                $Type: 'UI.DataField', //Label : 'Product ID',
                Value: PRODUCT_ID
            },
            {
                $Type: 'UI.DataField', //Label : 'Description',
                Value: OBJ_TYPE
            },
            {
                $Type: 'UI.DataField', //Label : 'Product ID',
                Value: OBJ_DEP
            },
            {
                $Type: 'UI.DataField', //Label : 'Description',
                Value: OBJ_COUNTER
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Series',
                Value: ROW_ID
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Series',
                Value: SUCCESS
            }
        ]}
    },
    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'Timeser',
        Label : 'Timeseries',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Timeseries',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

annotate V_LOCPRODDATA with @(
    UI       : {
        SelectionFields        : [
            LOCATION_ID,
            PRODUCT_ID
        ],
        LineItem               : [
            {
                $Type             : 'UI.DataField',
                Value             : LOCATION_ID,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '8rem'}
            },
            {
                $Type             : 'UI.DataField',
                Value             : LOCATION_DESC,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '12rem'}
            },
            {
                $Type             : 'UI.DataField',
                Value             : PRODUCT_ID,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '12rem'}
            },
            {
                $Type             : 'UI.DataField',
                Value             : PROD_DESC,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '12rem'}
            },
            {
                $Type             : 'UI.DataField',
                Value             : LOTSIZE_KEY,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '8rem'}
            },
            {
                $Type             : 'UI.DataField',
                Value             : LOT_SIZE,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '8rem'}
            },
            {
                $Type             : 'UI.DataField',
                Value             : PROCUREMENT_TYPE,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '10rem'}
            },
            {
                $Type             : 'UI.DataField',
                Value             : PLANNING_STRATEGY,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '10rem'}
            }
        ],
        HeaderInfo             : {
            // Title          : {Value : LOCATION_ID},
            Title         : {Value: LOCATION_DESC},
            Description   : {Value: PROD_DESC},
            // Description    : {Value : PRODUCT_ID},
            TypeName      : 'Location-Product',
            TypeNamePlural: 'Location-Product',
        },
        HeaderFacets           : [{
            $Type             : 'UI.ReferenceFacet',
            Target            : '@UI.FieldGroup#Description',
            ![@UI.Importance] : #Medium
        }],
        FieldGroup #Description: {Data: [{
            $Type: 'UI.DataField',
            Value: LOTSIZE_KEY
        }]},
        FieldGroup #Details    : {Data: [
            {
                $Type: 'UI.DataField',
                Value: LOT_SIZE
            },
            {
                $Type: 'UI.DataField',
                Value: PROCUREMENT_TYPE
            },
            {
                $Type: 'UI.DataField',
                Value: PLANNING_STRATEGY
            }
        ]}
    },

    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'LocationProducts',
        Label : 'Location Products',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Location Products',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

// Product Configuration
annotate V_SALESHCFG_CHARVAL with @(
    UI       : {
        SelectionFields        : [
            SALES_DOC,
            DOC_CREATEDDATE,
            PRODUCT_ID
        ],
        LineItem               : [
            {
                $Type             : 'UI.DataField', //Label : 'Product ID',
                Value             : SALES_DOC,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Description',
                Value             : SALESDOC_ITEM,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Family',
                Value             : DOC_CREATEDDATE,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Series',
                Value             : SCHEDULELINE_NUM,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Series',
                Value             : PRODUCT_ID,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Series',
                Value             : CUSTOMER_GROUP,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Series',
                Value             : LOCATION_ID,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Series',
                Value             : ORD_QTY,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Series',
                Value             : NET_VALUE,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Series',
                Value             : MAT_AVAILDATE,
                ![@UI.Importance] : #High
            }

        ],
        HeaderInfo             : {
            Title         : {Value: SALES_DOC},
            Description   : {Value: SALESDOC_ITEM},
            TypeName      : 'Sales History',
            TypeNamePlural: 'Sales History',
        },
        HeaderFacets           : [{
            $Type             : 'UI.ReferenceFacet',
            Target            : '@UI.FieldGroup#Description',
            ![@UI.Importance] : #Medium
        }],
        FieldGroup #Description: {Data: [
            {
                $Type: 'UI.DataField',
                Value: DOC_CREATEDDATE
            },
            {
                $Type: 'UI.DataField',
                Value: PRODUCT_ID
            },
            {
                $Type: 'UI.DataField',
                Value: LOCATION_ID
            }
        ]},
        FieldGroup #Details    : {Data: [
            {
                $Type: 'UI.DataField',
                Value: SCHEDULELINE_NUM
            },
            // {
            //     $Type : 'UI.DataField',
            //     Value : REASON_REJ
            // },
            {
                $Type: 'UI.DataField',
                Value: CONFIRMED_QTY
            },
            {
                $Type: 'UI.DataField',
                Value: ORD_QTY
            },
            {
                $Type: 'UI.DataField',
                Value: MAT_AVAILDATE
            },
            {
                $Type: 'UI.DataField',
                Value: CUSTOMER_GROUP
            },
            {
                $Type: 'UI.DataField',
                Value: NET_VALUE
            },
            {
                $Type: 'UI.DataField',
                Value: CHAR_NAME
            },
            {
                $Type: 'UI.DataField',
                Value: CHAR_VALUE
            }
        ]}
    },
    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'saleshisC',
        Label : 'Sales History Configuration',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Sales History Configuration',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);


// Product Accessnode
/**
 * ***
 */
annotate service.PROD_ACCNODE with @(UI: {
    SelectionFields: [
        LOCATION_ID,
        PRODUCT_ID,
        ACCESS_NODE
    ],
    LineItem       : [
        {
            $Type             : 'UI.DataField', //Label : 'Description',
            Value             : LOCATION_ID,
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField', //Label : 'Product ID',
            Value             : PRODUCT_ID,
            ![@UI.Importance] : #High
        },
        {
            $Type: 'UI.DataField', //Label : 'Product Family',
            Value: ACCESS_NODE
        }
    ]
});

/**
 * ***
 */
// IBP Future Character Plan
/**
 * ***
 */
annotate pal.TS_PREDICTIONS with @(
    UI       : {
        SelectionFields    : [
            LOCATION_ID,
            PRODUCT_ID,
            OBJ_DEP
        ],
        LineItem           : [
            {
                $Type             : 'UI.DataField',
                Value             : CAL_DATE,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '6rem'}
            },
            {
                $Type             : 'UI.DataField', //Label : 'Description',
                Value             : LOCATION_ID,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '6rem'}
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product ID',
                Value             : PRODUCT_ID,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '11rem'}
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Family',
                Value             : OBJ_TYPE,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '6rem'}
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Family',
                Value             : OBJ_DEP,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '8rem'}
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Family',
                Value             : OBJ_COUNTER,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '6rem'}
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Family',
                Value             : VERSION,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '6rem'}
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Series',
                Value             : SCENARIO,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '6rem'}
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Family',
                Value             : PREDICTED,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '10rem'}
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Family',
                Value             : PREDICTED_TIME,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '12rem'}
            },
            {
                $Type             : 'UI.DataField', //Label : 'Product Family',
                Value             : PREDICTED_STATUS,
                ![@UI.Importance] : #High,
                @HTML5.CssDefaults: {width: '8rem'}
            }
        ],
        HeaderInfo         : {
            Title         : {Value: LOCATION_ID},
            Description   : {Value: PRODUCT_ID},
            TypeName      : 'Object Dependencies Predicted',
            TypeNamePlural: 'Object Dependencies Predicted',
        },
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField', //Label : 'Product ID',
                Value: LOCATION_ID
            },
            {
                $Type: 'UI.DataField', //Label : 'Description',
                Value: CAL_DATE
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Series',
                Value: PRODUCT_ID
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: OBJ_TYPE
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: OBJ_DEP
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: OBJ_COUNTER
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: VERSION
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Series',
                Value: SCENARIO
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: MODEL_TYPE
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: MODEL_VERSION
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: MODEL_PROFILE
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: PREDICTED
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: PREDICTED_TIME
            },
            {
                $Type: 'UI.DataField', //Label : 'Product Family',
                Value: PREDICTED_STATUS
            }
        ]}
    },
    //Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'OBJ_DEP',
        Label : 'Object Dependencies Predicted',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Object Dependencies Predicted',
            Target: '@UI.FieldGroup#Details'
        }]
    }]

);

/**
 * ***
 */
// IBP Future Character Plan View
/**
 * ***
 */
annotate V_FCHARPLAN with @(UI: {
    SelectionFields: [
        LOCATION_ID,
        PRODUCT_ID
    ],
    LineItem       : [

        {
            $Type             : 'UI.DataField', //Label : 'Description',
            Value             : LOCATION_ID,
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField', //Label : 'Product ID',
            Value             : PRODUCT_ID,
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField', //Label : 'Product Family',
            Value             : CLASS_NAME,
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField', //Label : 'Product Series',
            Value             : CHAR_NAME,
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : CHAR_VALUE,
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField', //Label : 'Product Family',
            Value             : VERSION,
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField', //Label : 'Product Series',
            Value             : SCENARIO,
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : WEEK_DATE,
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : OPT_PERCENT,
            ![@UI.Importance] : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : OPT_QTY,
            ![@UI.Importance] : #High
        }
    ]
});

//Auth object annotations
annotate service.USER_AUTHOBJ with @(
    UI       : {
        SelectionFields    : [
            USER,
            AUTH_GROUP
        ],
        LineItem           : [
            {
                $Type             : 'UI.DataField',
                Value             : USER,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : PARAMETER,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : AUTH_GROUP,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : DESCRIPTION,
                ![@UI.Importance] : #High
            }
        ],
        HeaderInfo         : {
            Title         : {Value: USER},
            Description   : {Value: AUTH_GROUP},
            TypeName      : 'Authorization',
            TypeNamePlural: 'Authorizations'
        },
        // HeaderFacets            : [{
        //     $Type             : 'UI.ReferenceFacet',
        //     Target            : '@UI.FieldGroup#Description',
        //     ![@UI.Importance] : #Medium
        // }],
        // FieldGroup #Description : {Data : [{
        //     $Type : 'UI.DataField',
        //     Value : DESCRIPTION
        // }]}
        //,
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField',
                Value: USER
            },
            {
                $Type: 'UI.DataField',
                Value: PARAMETER
            },
            {
                $Type: 'UI.DataField',
                Value: AUTH_GROUP
            },
            {
                $Type: 'UI.DataField',
                Value: DESCRIPTION
            }
        ]}
    },
    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'USERAUTH',
        Label : 'User Authorization',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'User Authorization',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

/**
 * ***
 */
// Job Status
/**
 * ***
 */
annotate V_JOBSTATUS with @(
    UI       : {
        SelectionFields        : [
            JOB_ID,
            RUN_STATE,
            RUN_STATUS,
            CRITICALSTATUS
        ],
        LineItem               : [
            {
                $Type             : 'UI.DataField',
                Value             : JOB_ID,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : JOB_NAME,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : SCH_STARTTIME,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : SCH_END_TIME,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : RUN_STATUS,
                Criticality       : CRITICALSTATUS,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : RUN_STATE,
                Criticality       : CRITICALSTATE,
                ![@UI.Importance] : #High
            }
        ],
        HeaderInfo             : {
            Title         : {Value: JOB_ID},
            Description   : {Value: JOB_NAME},
            TypeName      : 'Job Logs',
            TypeNamePlural: 'Job Logs',
        },
        HeaderFacets           : [{
            $Type             : 'UI.ReferenceFacet',
            Target            : '@UI.FieldGroup#Description',
            ![@UI.Importance] : #Medium
        }],
        FieldGroup #Description: {Data: [{
            $Type: 'UI.DataField',
            Value: RUN_STATE
        }]},
        FieldGroup #Details    : {Data: [
            {
                $Type: 'UI.DataField',
                Value: JOB_DES
            },
            {
                $Type: 'UI.DataField',
                Value: ACTION
            },
            {
                $Type: 'UI.DataField',
                Value: SCH_STARTTIME
            },
            {
                $Type: 'UI.DataField',
                Value: SCH_END_TIME
            },
            {
                $Type: 'UI.DataField',
                Value: SCH_TIME
            },
            {
                $Type: 'UI.DataField',
                Value: SCH_NEXTRUN
            },
            {
                $Type: 'UI.DataField',
                Value: RUN_ID
            },
            {
                $Type: 'UI.DataField',
                Value: RUN_STATUS
            },
            {
                $Type: 'UI.DataField',
                Value: STATUS_MESSAGE
            },
            {
                $Type: 'UI.DataField',
                Value: SCHEDULED_TIMESTAMP
            },
            {
                $Type: 'UI.DataField',
                Value: COMPLETED_TIMESTAMP
            }
        ]}
    },
    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'Joblogs',
        Label : 'Job Scheduler Logs',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Job Logs',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

//Location Product Line
annotate V_PRODLOCLINEDESC with @(
    UI       : {
        SelectionFields    : [
            LOCATION_ID,
            PRODUCT_ID,
            LINE_ID
        ],
        LineItem           : [
            {
                $Type                 : 'UI.DataFieldForAnnotation',
                Label                 : 'Location/ Desc.',
                Target                : '@UI.FieldGroup#column1',
                ![@HTML5.CssDefaults] : {
                    $Type: 'HTML5.CssDefaultsType',
                    width: 'auto',
                },
            },
            {
                $Type                 : 'UI.DataFieldForAnnotation',
                Label                 : 'Line/ Desc.',
                Target                : '@UI.FieldGroup#column2',
                ![@HTML5.CssDefaults] : {
                    $Type: 'HTML5.CssDefaultsType',
                    width: 'auto',
                },
            },
            {
                $Type                 : 'UI.DataFieldForAnnotation',
                Label                 : 'Product/ Desc.',
                Target                : '@UI.FieldGroup#column3',
                ![@HTML5.CssDefaults] : {
                    $Type: 'HTML5.CssDefaultsType',
                    width: 'auto',
                },
            },
        ],
        HeaderInfo         : {
            Title         : {Value: PRODUCT_ID},
            Description   : {Value: PROD_DESC},
            TypeName      : 'Product Line Mapping',
            TypeNamePlural: 'Product Line Mappings'
        },
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField',
                Value: LOCATION_ID
            },
            {
                $Type: 'UI.DataField',
                Value: LOCATION_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: LINE_ID
            },
            {
                $Type: 'UI.DataField',
                Value: LINE_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: PRODUCT_ID
            },
            {
                $Type: 'UI.DataField',
                Value: PROD_DESC
            }
        ]},
        FieldGroup #column1: {
            $Type: 'UI.FieldGroupType',
            Data : [
                {
                    $Type: 'UI.DataField',
                    Value: LOCATION_ID,
                },
                {
                    $Type: 'UI.DataField',
                    Value: LOCATION_DESC,
                }
            ]
        },
        FieldGroup #column2: {
            $Type: 'UI.FieldGroupType',
            Data : [
                {
                    $Type: 'UI.DataField',
                    Value: LINE_ID,
                },
                {
                    $Type: 'UI.DataField',
                    Value: LINE_DESC,
                }
            ]
        },
        FieldGroup #column3: {
            $Type: 'UI.FieldGroupType',
            Data : [
                {
                    $Type: 'UI.DataField',
                    Value: PRODUCT_ID,
                },
                {
                    $Type: 'UI.DataField',
                    Value: PROD_DESC,
                }
            ]
        }
    },
    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'PRODLINE',
        Label : 'Location-Product-Line',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Location-Product-Line',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

//Product restrictions
// annotate service.PRODRESTRICT with @(
//     UI       : {
//         SelectionFields    : [
//             LOCATION_ID,
//             PRODUCT_ID,
//             RESTRICTION
//         ],
//         LineItem           : [
//             {
//                 $Type            : 'UI.DataField',
//                 Value            : LOCATION_ID,
//                 ![@UI.Importance]: #High
//             },
//             {
//                 $Type            : 'UI.DataField',
//                 Value            : PRODUCT_ID,
//                 ![@UI.Importance]: #High
//             },
//             {
//                 $Type            : 'UI.DataField',
//                 Value            : RESTRICTION,
//                 ![@UI.Importance]: #High
//             },
//             {
//                 $Type            : 'UI.DataField',
//                 Value            : RTR_QTY,
//                 ![@UI.Importance]: #High
//             },
//             {
//                 $Type            : 'UI.DataField',
//                 Value            : VALID_FROM,
//                 ![@UI.Importance]: #High
//             },
//             {
//                 $Type            : 'UI.DataField',
//                 Value            : VALID_TO,
//                 ![@UI.Importance]: #High
//             }
//         ],
//         HeaderInfo         : {
//             Title         : {Value: LOCATION_ID},
//             Description   : {Value: PRODUCT_ID},
//             TypeName      : 'Prod. Restriction',
//             TypeNamePlural: 'Prod. Restrictions'
//         },
//         FieldGroup #Details: {Data: [
//             {
//                 $Type: 'UI.DataField',
//                 Value: LOCATION_ID
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Value: PRODUCT_ID
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Value: RESTRICTION
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Value: RTR_QTY
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Value: VALID_FROM
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Value: VALID_TO
//             }
//         ]}
//     },
//     // Page Facets
//     UI.Facets: [{
//         $Type : 'UI.CollectionFacet',
//         ID    : 'PRODRTR',
//         Label : 'Product Restrictions',
//         Facets: [{
//             $Type : 'UI.ReferenceFacet',
//             Label : 'Product Restrictions',
//             Target: '@UI.FieldGroup#Details'
//         }]
//     }]
// );

//seed order
annotate service.SEEDORDER_HEADER with @(
    UI       : {
        SelectionFields    : [
            LOCATION_ID,
            PRODUCT_ID,
            SEED_ORDER
        ],
        LineItem           : [
            {
                $Type             : 'UI.DataField',
                Value             : SEED_ORDER,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : LOCATION_ID,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : PRODUCT_ID,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : UNIQUE_ID,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : ORD_QTY,
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                Value             : MAT_AVAILDATE,
                ![@UI.Importance] : #High
            }
        ],
        HeaderInfo         : {
            Title         : {Value: LOCATION_ID},
            Description   : {Value: PRODUCT_ID},
            TypeName      : 'Seed Order Creation',
            TypeNamePlural: 'Seed Order Creation'
        },
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField',
                Value: SEED_ORDER
            },
            {
                $Type: 'UI.DataField',
                Value: LOCATION_ID
            },
            {
                $Type: 'UI.DataField',
                Value: PRODUCT_ID
            },
            {
                $Type: 'UI.DataField',
                Value: UNIQUE_ID
            },
            {
                $Type: 'UI.DataField',
                Value: ORD_QTY
            },
            {
                $Type: 'UI.DataField',
                Value: MAT_AVAILDATE
            }
        ]}
    },
    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'SEEDORD',
        Label : 'Seed Order Creation',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Seed Order Creation',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);


annotate V_FACTORYLOC with @(
    UI       : {
        SelectionFields    : [
            DEMAND_LOC,
            FACTORY_LOC,
            PRODUCT_ID
        ],

        LineItem           : [
            {
                $Type                 : 'UI.DataFieldForAnnotation',
                Label                 : 'Location/ Desc.',
                Target                : '@UI.FieldGroup#column1',
                ![@HTML5.CssDefaults] : {
                    $Type: 'HTML5.CssDefaultsType',
                    width: 'auto',
                },
            },
            {
                $Type                 : 'UI.DataFieldForAnnotation',
                Label                 : 'Product/ Desc.',
                Target                : '@UI.FieldGroup#column2',
                ![@HTML5.CssDefaults] : {
                    $Type: 'HTML5.CssDefaultsType',
                    width: 'auto',
                },
            },
            {
                $Type                 : 'UI.DataFieldForAnnotation',
                Label                 : 'Planning Location/ Desc.',
                Target                : '@UI.FieldGroup#column3',
                ![@HTML5.CssDefaults] : {
                    $Type: 'HTML5.CssDefaultsType',
                    width: 'auto',
                },
            },
            {
                $Type                 : 'UI.DataFieldForAnnotation',
                Label                 : 'Factory Location/ Desc.',
                Target                : '@UI.FieldGroup#column4',
                ![@HTML5.CssDefaults] : {
                    $Type: 'HTML5.CssDefaultsType',
                    width: 'auto',
                },
            }
        ],
        HeaderInfo         : {
            Title         : {Value: DEMAND_DESC},
            Description   : {Value: PROD_DESC},
            TypeName      : 'Demand, Planning , Factory Location w.r.t Product',
            TypeNamePlural: 'Demand, Planning , Factory Location w.r.t Product',
        },
        // HeaderFacets            : [{
        //     $Type             : 'UI.ReferenceFacet',
        //     Target            : '@UI.FieldGroup#Description',
        //     ![@UI.Importance] : #Medium
        // }],
        // FieldGroup #Description : {Data : [{
        //     $Type : 'UI.DataField',
        //     Value : LOTSIZE_KEY
        // }]},
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField',
                Value: DEMAND_LOC
            },
            {
                $Type: 'UI.DataField',
                Value: DEMAND_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: PLAN_LOC
            },
            {
                $Type: 'UI.DataField',
                Value: PLANLOC_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: PRODUCT_ID
            },
            {
                $Type: 'UI.DataField',
                Value: PROD_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: FACTORY_LOC
            },
            {
                $Type: 'UI.DataField',
                Value: LOCATION_DESC
            }
        ]

        },
        FieldGroup #column1: {
            $Type: 'UI.FieldGroupType',
            Data : [
                {
                    $Type: 'UI.DataField',
                    Value: DEMAND_LOC,
                },
                {
                    $Type: 'UI.DataField',
                    Value: DEMAND_DESC,
                }
            ]
        },
        FieldGroup #column2: {
            $Type: 'UI.FieldGroupType',
            Data : [
                {
                    $Type: 'UI.DataField',
                    Value: PRODUCT_ID,
                },
                {
                    $Type: 'UI.DataField',
                    Value: PROD_DESC,
                }
            ]
        },
        FieldGroup #column3: {
            $Type: 'UI.FieldGroupType',
            Data : [
                {
                    $Type: 'UI.DataField',
                    Value: PLAN_LOC,
                },
                {
                    $Type: 'UI.DataField',
                    Value: PLANLOC_DESC,
                }
            ]
        },
        FieldGroup #column4: {
            $Type: 'UI.FieldGroupType',
            Data : [
                {
                    $Type: 'UI.DataField',
                    Value: FACTORY_LOC,
                },
                {
                    $Type: 'UI.DataField',
                    Value: LOCATION_DESC,
                }
            ]
        },
    },

    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'FactoryLocation',
        Label : 'Demand, Planning , Factory Location w.r.t Product',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Demand, Planning , Factory Location w.r.t Product Details',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

// Customer Group annotations
annotate V_LINEMASTERDESC with @(
    UI       : {
        SelectionFields    : [
            LOCATION_ID,
            LINE_ID
        ],
        LineItem           : [
            {
                $Type             : 'UI.DataField',
                Label             : 'Manufacturing Location',
                Value             : LOCATION_ID,
                @HTML5.CssDefaults: {width: 'auto'}
            },
            {
                $Type             : 'UI.DataField',
                Label             : 'Location Desc.',
                Value             : LOCATION_DESC,
                @HTML5.CssDefaults: {width: 'auto'}
            },
            {
                $Type             : 'UI.DataField',
                //Label : 'Location ID',
                Value             : LINE_ID,
                @HTML5.CssDefaults: {width: 'auto'}
            },
            {
                $Type             : 'UI.DataField',
                //Label : 'Description',
                Value             : LINE_DESC,
                @HTML5.CssDefaults: {width: 'auto'}
            }
        ],
        HeaderInfo         : {
            Title         : {Value: LINE_ID},
            Description   : {Value: LINE_DESC},
            TypeName      : 'Line Master',
            TypeNamePlural: 'Line Master',
        },
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField',
                Value: LOCATION_ID
            },
            {
                $Type: 'UI.DataField',
                Value: LOCATION_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: LINE_ID
            },
            {
                $Type: 'UI.DataField',
                Value: LINE_DESC
            }
        ]}

    },
    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'linemstr',
        Label : 'Line Master',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Line Master',
            Target: '@UI.FieldGroup#Details'
        }]
    }]

);

// BTP/IBP Version-Scenario
annotate service.VERSION_DEMANDVERSION with @(
    UI       : {
        SelectionFields    : [
            BTP_VERSION,
            BTP_SCENARIO
        ],
        LineItem           : [
            {
                $Type             : 'UI.DataField',
                //Label : 'Location ID',
                Value             : BTP_VERSION,
                @HTML5.CssDefaults: {width: '25%'},
                ![@UI.Importance] : #High,
            },
            {
                $Type             : 'UI.DataField',
                //Label : 'Location ID',
                Value             : BTP_SCENARIO,
                @HTML5.CssDefaults: {width: '25%'},
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                //Label : 'Location ID',
                Value             : DEMAND_VERSION,
                @HTML5.CssDefaults: {width: '15%'},
                ![@UI.Importance] : #High
            },
            {
                $Type             : 'UI.DataField',
                // Criticality :ACTIVE,
                //Label : 'Description',
                Value             : ACTIVE,
                @HTML5.CssDefaults: {width: '15%'},
                ![@UI.Importance] : #High
            }
        ],
        HeaderInfo         : {
            Title         : {Value: DEMAND_VERSION},
            Description   : {Value: DEMAND_VERSION},
            TypeName      : 'IBP/BTP Version-Scenario',
            TypeNamePlural: 'IBP/BTP Version-Scenario',
        },
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField',
                Value: BTP_VERSION
            },
            {
                $Type: 'UI.DataField',
                Value: BTP_SCENARIO
            },
            {
                $Type: 'UI.DataField',
                Value: DEMAND_VERSION
            },
            {
                $Type: 'UI.DataField',
                Value: ACTIVE
            }
        ]}
    },

    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'version-scenario',
        Label : 'IBP/BTP Version-Scenario',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'IBP/BTP Version-Scenario',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

// CIR log
annotate service.CIRLOG with @(
    UI       : {
        SelectionFields    : [
            LOCATION_ID,
            PRODUCT_ID
        ],
        LineItem           : [
            {
                $Type                 : 'UI.DataField',
                Value                 : WEEK_DATE,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : LOCATION_ID,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : PRODUCT_ID,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : CIR_ID,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : UNIQUE_ID,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : MESSAGE,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            }
        ],
        HeaderInfo         : {
            Title         : {Value: CIR_ID},
            Description   : {Value: WEEK_DATE},
            TypeName      : 'CIR Log',
            TypeNamePlural: 'CIR Logs',
        },
        // HeaderFacets            : [{
        //     $Type             : 'UI.ReferenceFacet',
        //     Target            : '@UI.FieldGroup#Description',
        //     ![@UI.Importance] : #Medium
        // }],
        // FieldGroup #Description : {Data : [{
        //     $Type : 'UI.DataField',
        //     Value : LOTSIZE_KEY
        // }]},
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField',
                Value: LOCATION_ID
            },
            {
                $Type: 'UI.DataField',
                Value: PRODUCT_ID
            },
            {
                $Type: 'UI.DataField',
                Value: UNIQUE_ID
            },
            {
                $Type: 'UI.DataField',
                Value: CUST_PRODID
            },
            {
                $Type: 'UI.DataField',
                Value: COMPCIR_QTY
            },
            {
                $Type: 'UI.DataField',
                Value: MSG_TYP
            },
            {
                $Type: 'UI.DataField',
                Value: MESSAGE
            }
        ]}
    },

    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'Cirlog',
        Label : 'CIR Logs',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'CIR Logs Details',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

/// Annotation for Future timeseries
// CIR log
annotate service.TS_OBJDEP_CHARHDR_F with @(
    UI       : {
        SelectionFields    : [
            CAL_DATE,
            LOCATION_ID,
            PRODUCT_ID
        ],
        LineItem           : [
            {
                $Type                 : 'UI.DataField',
                Value                 : CAL_DATE,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : LOCATION_ID,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : PRODUCT_ID,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : OBJ_TYPE,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : OBJ_DEP,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : OBJ_COUNTER,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            }
        ],
        HeaderInfo         : {
            Title         : {Value: CAL_DATE},
            Description   : {Value: LOCATION_ID},
            TypeName      : 'Time Series Future',
            TypeNamePlural: 'Time Series Future',
        },
        // HeaderFacets            : [{
        //     $Type             : 'UI.ReferenceFacet',
        //     Target            : '@UI.FieldGroup#Description',
        //     ![@UI.Importance] : #Medium
        // }],
        // FieldGroup #Description : {Data : [{
        //     $Type : 'UI.DataField',
        //     Value : LOTSIZE_KEY
        // }]},
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField',
                Value: LOCATION_ID
            },
            {
                $Type: 'UI.DataField',
                Value: PRODUCT_ID
            },
            {
                $Type: 'UI.DataField',
                Value: OBJ_TYPE
            },
            {
                $Type: 'UI.DataField',
                Value: ROW_ID
            },
            {
                $Type: 'UI.DataField',
                Value: VERSION
            },
            {
                $Type: 'UI.DataField',
                Value: SCENARIO
            },
            {
                $Type: 'UI.DataField',
                Value: SUCCESS
            },
            {
                $Type: 'UI.DataField',
                Value: SUCCESS_RATE
            }
        ]}
    },

    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'TIMESERIESF',
        Label : 'Time Series Future',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Time Series Future',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

/// Annotation for Future timeseries
// CIR log
annotate service.CLASS with @(
    UI       : {
        SelectionFields    : [CLASS_NAME],
        LineItem           : [
            {
                $Type                 : 'UI.DataField',
                Value                 : CLASS_NAME,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : CLASS_DESC,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : CLASS_TYPE,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Value                 : IBPCHAR_CHK,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            }
        ],
        HeaderInfo         : {
            Title         : {Value: CLASS_NAME},
            TypeName      : 'Class Detail',
            TypeNamePlural: 'Class Details',
        },
        // HeaderFacets            : [{
        //     $Type             : 'UI.ReferenceFacet',
        //     Target            : '@UI.FieldGroup#Description',
        //     ![@UI.Importance] : #Medium
        // }],
        // FieldGroup #Description : {Data : [{
        //     $Type : 'UI.DataField',
        //     Value : LOTSIZE_KEY
        // }]},
        FieldGroup #Details: {Data: [
            {
                $Type: 'UI.DataField',
                Value: CLASS_NAME
            },
            {
                $Type: 'UI.DataField',
                Value: CLASS_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: CLASS_TYPE
            },
            {
                $Type: 'UI.DataField',
                Value: IBPCHAR_CHK
            }
        ]}
    },

    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'classdet',
        Label : 'Class Details',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Class',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

annotate service.CLASS with @(Capabilities: {
    Insertable: false,
    Updatable : true,
    Deletable : false
});

annotate V_ASSEMBLYCOMP_DESC with @(
    UI       : {
        SelectionFields    : [
            LOCATION_ID,
            ASSEMBLY,
            COMPONENT
        ],
        LineItem           : [
            {
                $Type                 : 'UI.DataFieldForAnnotation',
                Label                 : 'Location/ Desc.',
                Target                : '@UI.FieldGroup#column1',
                ![@HTML5.CssDefaults] : {
                    $Type: 'HTML5.CssDefaultsType',
                    width: 'auto',
                },
            },
            {
                $Type                 : 'UI.DataFieldForAnnotation',
                Label                 : 'Assembly / Desc.',
                Target                : '@UI.FieldGroup#column2',
                ![@HTML5.CssDefaults] : {
                    $Type: 'HTML5.CssDefaultsType',
                    width: 'auto',
                },
            },
            {
                $Type                 : 'UI.DataFieldForAnnotation',
                Label                 : 'Component / Desc.',
                Target                : '@UI.FieldGroup#column3',
                ![@HTML5.CssDefaults] : {
                    $Type: 'HTML5.CssDefaultsType',
                    width: 'auto',
                },
            },
            {
                $Type                 : 'UI.DataField',
                Label                 : 'Valid From',
                Value                 : VALID_FROM,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            },
            {
                $Type                 : 'UI.DataField',
                Label                 : 'Valid To',
                Value                 : VALID_TO,
                ![@UI.Importance]     : #High,
                ![@HTML5.CssDefaults] : {width: '15rem'}
            }
        ],
        HeaderInfo         : {
            Title         : {Value: COMP_DESC},
            TypeName      : 'Assembly Component',
            TypeNamePlural: 'Assembly Components',
        },
        // HeaderFacets            : [{
        //     $Type             : 'UI.ReferenceFacet',
        //     Target            : '@UI.FieldGroup#Description',
        //     ![@UI.Importance] : #Medium
        // }],
        // FieldGroup #Description : {Data : [{
        //     $Type : 'UI.DataField',
        //     Value : LOTSIZE_KEY
        // }]},
        FieldGroup #Details: {Data: [

            {
                $Type: 'UI.DataField',
                Value: LOCATION_ID
            },
            {
                $Type: 'UI.DataField',
                Value: LOCATION_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: ASSEMBLY
            },
            {
                $Type: 'UI.DataField',
                Value: ASMB_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: COMPONENT
            },
            {
                $Type: 'UI.DataField',
                Value: COMP_TYPE
            },
            {
                $Type: 'UI.DataField',
                Value: COMP_DESC
            },
            {
                $Type: 'UI.DataField',
                Value: COMP_QTY
            },
            {
                $Type: 'UI.DataField',
                Value: VALID_FROM
            },
            {
                $Type: 'UI.DataField',
                Value: VALID_TO
            }
        ]},
        FieldGroup #column1: {
            $Type: 'UI.FieldGroupType',
            Data : [
                {
                    $Type: 'UI.DataField',
                    Value: LOCATION_ID,
                },
                {
                    $Type: 'UI.DataField',
                    Value: LOCATION_DESC,
                }
            ]
        },
        FieldGroup #column2: {
            $Type: 'UI.FieldGroupType',
            Data : [
                {
                    $Type: 'UI.DataField',
                    Value: ASSEMBLY,
                },
                {
                    $Type: 'UI.DataField',
                    Value: ASMB_DESC,
                }
            ]
        },
        FieldGroup #column3: {
            $Type: 'UI.FieldGroupType',
            Data : [
                {
                    $Type: 'UI.DataField',
                    Value: COMPONENT,
                },
                {
                    $Type: 'UI.DataField',
                    Value: COMP_DESC,
                }
            ]
        }
    },

    // Page Facets
    UI.Facets: [{
        $Type : 'UI.CollectionFacet',
        ID    : 'comp',
        Label : 'Assembly Components',
        Facets: [{
            $Type : 'UI.ReferenceFacet',
            Label : 'Assembly Components Details',
            Target: '@UI.FieldGroup#Details'
        }]
    }]
);

annotate V_ASSEMBLYCOMP_DESC with {
    // ASSEMBLY    @Common.Label: 'Assembly';
    // COMPONENT   @Common.Label: 'Component';
    LOCATION_ID @common.Label: 'Location Id';

};

// Line Capacity
annotate V_LINECAPACITY with {
    LOCATION_ID @Common: {ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Location',
        CollectionPath: 'getFactoryLocation',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: LOCATION_ID,
                ValueListProperty: 'FACTORY_LOC'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'LOCATION_DESC'
            }
        ]
    }};
    PRODID      @Common: {ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Product',
        CollectionPath: 'genPartialProd',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: PRODID,
                ValueListProperty: 'PRODUCT_ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'PROD_DESC'
            },
            {
                $Type            : 'Common.ValueListParameterIn',
                LocalDataProperty: LOCATION_ID,
                ValueListProperty: 'LOCATION_ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'LOCATION_DESC'
            }
        ]
    }};
    LINE_ID     @Common: {ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Line ID',
        CollectionPath: 'getLine',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: LINE_ID,
                ValueListProperty: 'LINE_ID'
            },
            {
                $Type            : 'Common.ValueListParameterIn',
                LocalDataProperty: LOCATION_ID,
                ValueListProperty: 'LOCATION_ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'LINE_DESC'
            }
        ]
    }};
};

//Table Columns
annotate V_LINECAPACITY with
@(
    UI.LineItem                   : [
        {
            $Type                 : 'UI.DataFieldForAnnotation',
            Label                 : 'Manufacturing Location/ Desc.',
            Target                : '@UI.FieldGroup#column1',
            ![@HTML5.CssDefaults] : {
                $Type: 'HTML5.CssDefaultsType',
                width: 'auto',
            },
        },
        {
            $Type                 : 'UI.DataFieldForAnnotation',
            Label                 : 'Product/ Desc.',
            Target                : '@UI.FieldGroup#column2',
            ![@HTML5.CssDefaults] : {
                $Type: 'HTML5.CssDefaultsType',
                width: 'auto',
            },
        },
        {
            $Type                 : 'UI.DataFieldForAnnotation',
            Label                 : 'Line/ Desc.',
            Target                : '@UI.FieldGroup#column3',
            ![@HTML5.CssDefaults] : {
                $Type: 'HTML5.CssDefaultsType',
                width: 'auto',
            },
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Valid From',
            Value             : VALID_FROM,
            @HTML5.CssDefaults: {width: 'auto'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Valid To',
            Value             : VALID_TO,
            @HTML5.CssDefaults: {width: 'auto'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Capacity',
            Value             : CAPACITY,
            @HTML5.CssDefaults: {width: 'auto'}
        },

        {
            $Type             : 'UI.DataField',
            Label             : 'Valid From',
            Value             : VALID_FROM,
            @HTML5.CssDefaults: {width: 'auto'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Valid To',
            Value             : VALID_TO,
            @HTML5.CssDefaults: {width: 'auto'}
        }
    ],
    UI.SelectionFields            : [
        LOCATION_ID,
        PRODID,
        LINE_ID
    ],
    //Object Page Custom fields
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Manufacturing Location',
                Value: LOCATION_ID,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Location Desc',
                Value: LOCATION_DESC,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Line',
                Value: LINE_ID,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Line Desc',
                Value: LINE_DESC,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Product',
                Value: PRODID,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Product Desc',
                Value: PROD_DESC,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Capacity',
                Value: CAPACITY,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Valid From',
                Value: VALID_FROM,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Valid To',
                Value: VALID_TO,
            },
        ],
    },

    UI.FieldGroup #column2        : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: PRODID,
            },
            {
                $Type: 'UI.DataField',
                Value: PROD_DESC,
            }
        ]
    },
    UI.FieldGroup #column1        : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: LOCATION_ID,
            },
            {
                $Type: 'UI.DataField',
                Value: LOCATION_DESC,
            }
        ]
    },
    UI.FieldGroup #column3        : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: LINE_ID,
            },
            {
                $Type: 'UI.DataField',
                Value: LINE_DESC,
            }
        ]
    },
    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        // Label: 'Location-Partial Product-Line',
        Label : 'Line Capacity',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }],
    UI.HeaderInfo                 : {
        Title         : {
            $Type: 'UI.DataField',
            Value: LOCATION_ID
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: PRODID
        },
        TypeName      : 'Line Capacity',
        TypeNamePlural: 'Line Capacity',
    }
);

//Line Master

annotate V_LINEMASTERDESC with {
    LOCATION_ID @Common: {
                          // Text            : LOCATION_ID_LOCATION_ID,
                          // TextArrangement : #TextOnly,
                          // //insert your value list here
                         ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Manufacturing Location',
        CollectionPath: 'getFactoryLocation',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: LOCATION_ID,
                ValueListProperty: 'FACTORY_LOC'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'LOCATION_DESC'
            }
        ]
    }};
    LINE_ID     @Common: {
                          // Text            : LOCATION_ID_LOCATION_ID,
                          // TextArrangement : #TextOnly,
                          // //insert your value list here
                         ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Manufacturing Location',
        CollectionPath: 'getLine',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: LINE_ID,
                ValueListProperty: 'LINE_ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'LINE_DESC'
            },
            {
                $Type            : 'Common.ValueListParameterIn',
                LocalDataProperty: LOCATION_ID,
                ValueListProperty: 'LOCATION_ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'LOCATION_DESC'
            }
        ]
    }};
}

annotate V_LINEMASTERDESC with {
    LOCATION_ID @Common.Label: 'Manufacturing Location';
};

annotate V_LINEMASTERDESC with
@(Capabilities.DeleteRestrictions.Deletable: false);


// Assembly Component
annotate V_ASSEMBLYCOMP_DESC with {
    LOCATION_ID @Common: {ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Location',
        CollectionPath: 'getLocation',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: LOCATION_ID,
                ValueListProperty: 'LOCATION_ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'LOCATION_DESC'
            }

        ]
    }};
    ASSEMBLY    @Common: {ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Assembly',
        CollectionPath: 'getASMBLOC',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: ASSEMBLY,
                ValueListProperty: 'ASSEMBLY'
            },
            {
                $Type            : 'Common.ValueListParameterIn',
                LocalDataProperty: LOCATION_ID,
                ValueListProperty: 'LOCATION_ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'ASMB_DESC'
            },
        // {
        //     $Type             : 'Common.ValueListParameterDisplayOnly',
        //     ValueListProperty : 'LOCATION_DESC'
        // }
        ]
    }};
    COMPONENT   @Common: {ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Component',
        CollectionPath: 'V_ASSEMBLYCOMP_DESC',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: COMPONENT,
                ValueListProperty: 'COMPONENT'
            },
            {
                $Type            : 'Common.ValueListParameterIn',
                LocalDataProperty: LOCATION_ID,
                ValueListProperty: 'LOCATION_ID'
            },
            {
                $Type            : 'Common.ValueListParameterIn',
                LocalDataProperty: ASSEMBLY,
                ValueListProperty: 'ASSEMBLY'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'COMP_DESC'
            },
        // {
        //     $Type             : 'Common.ValueListParameterDisplayOnly',
        //     ValueListProperty : 'LOCATION_DESC'
        // }
        ]
    }};

};

annotate V_ASSEMBLYCOMP_DESC with {
    LOCATION_ID   @Common.Label: 'Location ID';
    LOCATION_DESC @Common.Label: 'Location Description';
    ASSEMBLY      @Common.Label: 'Assembly';
    ASMB_DESC     @Common.Label: 'Assembly Description';
    COMPONENT     @Common.Label: 'Component';
    COMP_TYPE     @Common.Label: 'Component Type';
    COMP_DESC     @Common.Label: 'Component Description';
    COMP_QTY      @Common.Label: 'Component Quantity';
    VALID_FROM    @Common.Label: 'Valid From';
    VALID_TO      @Common.Label: 'Valid To';
};

annotate V_ASSEMBLYCOMP_DESC with @(Capabilities: {FilterRestrictions: {
    $Type             : 'Capabilities.FilterRestrictionsType',
    RequiredProperties: [LOCATION_ID]
}, });

// Parameters
annotate js.ACTIVITY_PARAMETERS with
@(
    UI.SelectionFields            : [
        PARAMETER_ID,
        PARAM_DESC
    ],
    UI.LineItem                   : [
        {
            $Type             : 'UI.DataField',
            Label             : 'Parameter ID',
            Value             : PARAMETER_ID,
            @HTML5.CssDefaults: {width: 'auto'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Parameter Description',
            Value             : PARAM_DESC,
            @HTML5.CssDefaults: {width: 'auto'}
        }
    ],
    //Object Page Custom fields
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Parameter ID',
                Value: PARAMETER_ID,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Parameter Description',
                Value: PARAM_DESC,
            },
        ],
    },


    UI.Facets                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'Parameter Info',
        Target: '@UI.FieldGroup#GeneratedGroup1',
    }],
    UI.HeaderInfo                 : {
        Title         : {
            $Type: 'UI.DataField',
            Value: PARAMETER_ID
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: PARAM_DESC
        },
        TypeName      : 'Parameter',
        TypeNamePlural: 'Parameters',
    }
);

annotate js.ACTIVITY_PARAMETERS with {
    PARAMETER_ID @Common.Label: 'Parameter ID';
    PARAM_DESC   @Common.Label: 'Parameter Description';
    BASE_URL     @Common.Label: 'Base URL';
    CREATED_DATE @Common.Label: 'Created Date';
    CREATED_BY   @Common.Label: 'Created By';
    CREATED_TIME @Common.Label: 'Created Time';
    CHANGED_DATE @Common.Label: 'Changed Date';
    CHANGED_BY   @Common.Label: 'Changed By';
    CHANGED_TIME @Common.Label: 'Changed Time';
};

annotate js.ACTIVITY_PARAMETERS with {
    PARAMETER_ID @Common: {ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Parameter',
        CollectionPath: 'getActParameters',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: PARAMETER_ID,
                ValueListProperty: 'PARAMETER_ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'PARAM_DESC'
            }
        ]
    }};
    PARAM_DESC   @Common: {ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Parameter Description',
        CollectionPath: 'getActParameters',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: PARAM_DESC,
                ValueListProperty: 'PARAM_DESC'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'PARAMETER_ID'
            }
        ]
    }};
};

//Location Product
annotate V_PRODLOCLINEDESC with {
    LOCATION_ID @Common: {
                          // Text            : LOCATION_ID_LOCATION_ID,
                          // TextArrangement : #TextOnly,
                         ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Manufacturing Location',
        CollectionPath: 'getFactoryLocation',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: LOCATION_ID,
                ValueListProperty: 'FACTORY_LOC'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'LOCATION_DESC'
            }
        ]
    }};
    PRODUCT_ID  @Common: {ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Configurable Products',
        CollectionPath: 'getProducts',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: PRODUCT_ID,
                ValueListProperty: 'PRODUCT_ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'PROD_DESC'
            }
        // ,
        //  {
        //     $Type             : 'Common.ValueListParameterIn',
        //     LocalDataProperty : LOCATION_ID,
        //     ValueListProperty : 'LOCATION_ID'
        // }
        ]
    }};
    LINE_ID     @Common: {ValueList: {
        $Type         : 'Common.ValueListType',
        Label         : 'Line ID',
        CollectionPath: 'getLine',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterOut',
                LocalDataProperty: LINE_ID,
                ValueListProperty: 'LINE_ID'
            },
            {
                $Type            : 'Common.ValueListParameterIn',
                LocalDataProperty: LOCATION_ID,
                ValueListProperty: 'LOCATION_ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'LINE_DESC'
            }
        ]
    }};
};

annotate V_PRODLOCLINEDESC with {
    PRODUCT_ID  @Common.Label: 'Configurable Products';
    LOCATION_ID @Common.Label: 'Manufacturing Location';
};

annotate V_PRODLOCLINEDESC with @(Capabilities: {FilterRestrictions: {
    $Type             : 'Capabilities.FilterRestrictionsType',
    RequiredProperties: [LOCATION_ID]
}, });


// Distinct Unique ID's

annotate V_UNIQUEDIS with @Aggregation: {ApplySupported: {
    $Type               : 'Aggregation.ApplySupportedType',
    GroupableProperties : [
        UNIQUE_ID,
        UNIQUE_DESC
    ],
    Transformations     : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'expand',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ],
    PropertyRestrictions: true
}, };

//Annotations for time series customer
annotate V_VC_HISTORY_TS_CUST with @Aggregation: {ApplySupported: {
    $Type               : 'Aggregation.ApplySupportedType',
    GroupableProperties : [
        LOCATION_ID,
        PRODUCT_ID,
        PERIOD_NUM,
        TYPE,
        GROUP_ID,
        ROW,
        ATTRIBUTE,
        CHAR_NUM,
        CHAR_COUNT,
        CHAR_COUNT_RATE,
        GROUP_COUNT,
        GROUP_COUNT_RATE,
        CUSTOMER_GROUP
    ],
    Transformations     : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'expand',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ],
    PropertyRestrictions: true
}, };
