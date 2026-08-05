using {
    V_SALESALL_WEEK,
    V_SALESUNQ_DATA,
    V_CIRUNIQUECHAR,
    V_RESTRICTION_ANALYTIC_VIEW,
    V_LOCPROD,
    V_FINAL_OPTION_PLAN,
    V_FINAL_OPTION_PLAN_NEW,
    V_OPT_FILTER_VIEW,
    V_COMPREQ_SNAPSHOT,
    V_ASSEMBLY_COMPONENT,
    V_DEMAND_AND_FORECAST_V2,
    CV_TS_HISTORY_CUST,
    V_PROD_ORDER_CONSUMPTION_NEW,
    V_DEMAND_AND_FORECAST_HM,
    V_FACTORYLOC,
    CV_PLANNED_ORDER_ANALYSIS,
    CV_ASSEMBLY_REQ_ANALYSIS,
    V_ASSEMBLY_COMPONENT_TELESCOPIC,
    V_ROLES_LOCPROD
} from '../db/data-model';


service AnalyticalService @(path: '/analytical') {
    entity getWeeklySalesData           as projection on V_SALESALL_WEEK;
    entity getDemandAndForecast         as projection on V_DEMAND_AND_FORECAST_V2;
    entity getUnqCharQty                as projection on V_CIRUNIQUECHAR;
    entity getSalesUnqData              as projection on V_SALESUNQ_DATA;
    // entity getCIRLogData                as projection on V_CIRLOG;
    entity getVendedCapacity            as projection on V_RESTRICTION_ANALYTIC_VIEW;
    entity getFinalOptionPercentages    as projection on V_FINAL_OPTION_PLAN;
    entity getFinalOptionPercentagesNew    as projection on V_FINAL_OPTION_PLAN_NEW;
    entity getOptFilterdata             as projection on V_OPT_FILTER_VIEW;
    entity getLocProdData               as projection on V_LOCPROD;
    entity getComponentReqData          as projection on V_COMPREQ_SNAPSHOT;
    entity getAssemblyCompQty           as projection on V_ASSEMBLY_COMPONENT;
    entity getTSHistoryCust             as projection on CV_TS_HISTORY_CUST;
    entity getProdOrdConsumptionNewAnly as projection on V_PROD_ORDER_CONSUMPTION_NEW;
    entity getDMDForecast               as projection on V_DEMAND_AND_FORECAST_HM;
    entity getFacLoc                    as projection on V_FACTORYLOC;
    entity getPlanOrderAnly             as projection on CV_PLANNED_ORDER_ANALYSIS;
    entity getAsmOrdAnly                as projection on CV_ASSEMBLY_REQ_ANALYSIS;
    entity getAssemblyCompTelescopic    as projection on V_ASSEMBLY_COMPONENT_TELESCOPIC;
    entity getAlytRolesLocProd          as projection on V_ROLES_LOCPROD;
}

//Sales Order Report Annotations
annotate AnalyticalService.getWeeklySalesData with {
    LOCATION_ID        @Analytics.Dimension: true              @Common.Label     : 'Demand Location';
    REF_PRODID         @Analytics.Dimension: true              @Common.Label     : 'Config Products';
    WEEK_DATE          @Analytics.Dimension: true              @Common.Label     : 'Week Date';
    PRODUCT_ID         @Analytics.Dimension: true              @Common.Label     : 'Product ID';
    SALES_ORG          @Analytics.Dimension: true              @Common.Label     : 'Sales Org';
    SAL_DOCU_TYPE      @Analytics.Dimension: true              @Common.Label     : 'Sales Doc Type';
    CUSTOMER_GROUP     @Analytics.Dimension: true              @Common.Label     : 'Customer Group';
    DISTR_CHANNEL      @Analytics.Dimension: true              @Common.Label     : 'DISTR Channel';
    DOC_CREATEDDATE    @Analytics.Dimension: true              @Common.Label     : 'Doc. Created Date';
    FACTORY_LOC        @Analytics.Dimension: true              @Common.Label     : 'Factory Location';
    IN_TRANSIT         @Analytics.Dimension: true              @Common.Label     : 'In Transit';
    MAT_AVAILDATE      @Analytics.Dimension: true              @Common.Label     : 'Mat. Avail Date';
    ON_HAND_STOCK      @Analytics.Dimension: true              @Common.Label     : 'On Hand Stock';
    PLAN_LOC           @Analytics.Dimension: true              @Common.Label     : 'Plan Location';
    SALE_LOCATION      @Analytics.Dimension: true              @Common.Label     : 'Sale Location';
    SALES_DOC          @Analytics.Dimension: true              @Common.Label     : 'Sales Doc.';
    SHIP_FROM_LOC      @Analytics.Dimension: true              @Common.Label     : 'Ship from Location';
    UNIQUE_ID          @Analytics.Dimension: true              @Common.Label     : 'Unique ID';
    DIVISION           @Analytics.Dimension: true              @Common.Label     : 'Division';
    PERIODDESC         @Analytics.Dimension: true              @Common.Label     : 'Period Desc';
    CHANGED_BY         @Analytics.Dimension: true              @Common.Label     : 'Changed By';
    CHANGED_DATE       @Analytics.Dimension: true              @Common.Label     : 'Changed Date';
    CHANGED_TIME       @Analytics.Dimension: true              @Common.Label     : 'Changed Time';
    CREATED_DATE       @Analytics.Dimension: true              @Common.Label     : 'Created Date';
    CREATED_TIME       @Analytics.Dimension: true              @Common.Label     : 'Created Time';
    IBP_CUSTOMER       @Analytics.Dimension: true              @Common.Label     : 'IBP Customer';
    ITEM_CHANGE_DATE   @Analytics.Dimension: true              @Common.Label     : 'Item Change Date';
    ITEM_CREATED_DATE  @Analytics.Dimension: true              @Common.Label     : 'Item Created Date';
    PRIMARY_ID         @Analytics.Dimension: true              @Common.Label     : 'Primary ID';
    REASON_REJ         @Analytics.Dimension: true              @Common.Label     : 'Reason Rej';
    RELEVENT_FOR_PLAN  @Analytics.Dimension: true              @Common.Label     : 'Relevent For Plan';
    SALESDOC_ITEM      @Analytics.Dimension: true              @Common.Label     : 'SalesDoc. Item';
    SCHEDULELINE_NUM   @Analytics.Dimension: true              @Common.Label     : 'Schedule Line Number';
    SEEDORD_CHK        @Analytics.Dimension: true              @Common.Label     : 'Seed Order Chk';
    CREATED_BY         @Analytics.Dimension: true              @Common.Label     : 'Created By';
    NET_VALUE          @Analytics.Dimension: true              @Common.Label     : 'Net Value';
    CONFIRMED_QTY      @Common.Label       : 'Confirmed Qty.'  @Analytics.Measure: true  @Aggregation.default: #SUM;
    ORD_QTY            @Common.Label       : 'Ord Qty'         @Analytics.Measure: true  @Aggregation.default: #SUM;
    YEAR               @Analytics.Dimension: true              @Common.Label     : 'Week Date Year';
    QUARTER            @Analytics.Dimension: true              @Common.Label     : 'Week Date Quarter';
    MONTH              @Analytics.Dimension: true              @Common.Label     : 'Week Date Month';
    RESERVE_FIELD1     @Analytics.Dimension: true              @Common.Label     : 'Reserve Field 1';
    RESERVE_FIELD2     @Analytics.Dimension: true              @Common.Label     : 'Reserve Field 2';
    RESERVE_FIELD3     @Analytics.Dimension: true              @Common.Label     : 'Reserve Field 3';
    RESERVE_FIELD4     @Analytics.Dimension: true              @Common.Label     : 'Reserve Field 4';
    RESERVE_FIELD5     @Analytics.Dimension: true              @Common.Label     : 'Reserve Field 5';
};

annotate AnalyticalService.getWeeklySalesData with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        SALES_DOC,
        REF_PRODID,
        PRODUCT_ID,
        UNIQUE_ID,
        DOC_CREATEDDATE,
        MAT_AVAILDATE,
        WEEK_DATE,
        PERIODDESC,
        CUSTOMER_GROUP,
        LOCATION_ID,
        SALE_LOCATION,
        PLAN_LOC,
        FACTORY_LOC,
        SALES_ORG,
        DISTR_CHANNEL,
        DIVISION,
        SAL_DOCU_TYPE,
        ON_HAND_STOCK,
        IN_TRANSIT,
        SHIP_FROM_LOC,
        YEAR,
        QUARTER,
        MONTH,
        RESERVE_FIELD1,
        RESERVE_FIELD2,
        RESERVE_FIELD3,
        RESERVE_FIELD4,
        RESERVE_FIELD5
    ],
    AggregatableProperties: [
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: CONFIRMED_QTY
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: ORD_QTY,
        }
    ],
    PropertyRestrictions  : true,
    Transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

//Demand And Forecast Annotations
annotate AnalyticalService.getDemandAndForecast with {
    LOCATION_ID                @Analytics.Dimension: true  @Common.Label       : 'Demand Location';
    PRODUCT_ID                 @Analytics.Dimension: true  @Common.Label       : 'Product ID';
    UNIQUE_ID                  @Analytics.Dimension: true  @Common.Label       : 'Unique ID';
    CHAR_NUM                   @Analytics.Dimension: true  @Common.Label       : 'Characteristic ID';
    CHAR_DESC                  @Analytics.Dimension: true  @Common.Label       : 'Characteristic Description';
    CHARVAL_NUM                @Analytics.Dimension: true  @Common.Label       : 'Characteristic Value ID';
    CHARVAL_DESC               @Analytics.Dimension: true  @Common.Label       : 'Characteristic Value Description';
    CHAR_NAME                  @Analytics.Dimension: true  @Common.Label       : 'Characteristic Name';
    WEEK_PERIODDESC            @Analytics.Dimension: true  @Common.Label       : 'Period Desc';
    WEEK_DATE                  @Analytics.Dimension: true  @Common.Label       : 'Week Date';
    YEAR                       @Analytics.Dimension: true  @Common.Label       : 'Week Date Year';
    QUARTER                    @Analytics.Dimension: true  @Common.Label       : 'Week Date Quarter';
    MONTH                      @Analytics.Dimension: true  @Common.Label       : 'Week Date Month';
    TYPE                       @Analytics.Dimension: true  @Common.Label       : 'Type';
    YEAR_MONTH                 @Analytics.Dimension: true  @Common.Label       : 'Year Month';
    QUANTITY                   @Analytics.Measure  : true  @Aggregation.default: #SUM;
    ACTUAL_QTY                 @Analytics.Measure  : true  @Aggregation.default: #SUM;
    // FORECAST_QTY    @Analytics.Measure  : true  @Aggregation.default: #SUM;
    PERCENTAGE                 @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Percentage';
    FORECAST_SALES_PERCENTAGE  @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Forecast Sales Percent';
};


annotate AnalyticalService.getDemandAndForecast with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        LOCATION_ID,
        PRODUCT_ID,
        UNIQUE_ID,
        CHAR_NUM,
        CHAR_DESC,
        CHARVAL_NUM,
        CHARVAL_DESC,
        CHAR_NAME,
        WEEK_PERIODDESC,
        WEEK_DATE,
        YEAR,
        QUARTER,
        MONTH,
        TYPE,
        YEAR_MONTH
    ],
    AggregatableProperties: [{
        $Type   : 'Aggregation.AggregatablePropertyType',
        Property: QUANTITY,
    }],
    PropertyRestrictions  : true,
    Transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

//Forecast Order Report Annotations
annotate AnalyticalService.getUnqCharQty with {
    LOCATION_ID      @Analytics.Dimension: true  @Common.Label       : 'Demand Location';
    PRODUCT_ID       @Analytics.Dimension: true  @Common.Label       : 'Partial Product';
    REF_PRODID       @Analytics.Dimension: true  @Common.Label       : 'Config Products';
    UNIQUE_ID        @Analytics.Dimension: true  @Common.Label       : 'Unique ID';
    CHAR_DESC        @Analytics.Dimension: true  @Common.Label       : 'Characteristic Description';
    CHARVAL_DESC     @Analytics.Dimension: true  @Common.Label       : 'Characteristic Value Description';
    CHAR_NUM         @Analytics.Dimension: true  @Common.Label       : 'Characteristic';
    CHAR_NAME        @Analytics.Dimension: true  @Common.Label       : 'Characteristic Name';
    CHAR_VALUE       @Analytics.Dimension: true  @Common.Label       : 'Characteristic Value Name';
    CHARVAL_NUM      @Analytics.Dimension: true  @Common.Label       : 'Characteristic Value';
    MODEL_VERSION    @Analytics.Dimension: true  @Common.Label       : 'Model Version';
    VERSION          @Analytics.Dimension: true  @Common.Label       : 'Version';
    CIR_ID           @Analytics.Dimension: true  @Common.Label       : 'CIR ID';
    CIR_QTY          @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Forecast Order Quantity';
    CIR_QTY_AVG      @Analytics.Measure  : true  @Aggregation.default: #MAX  @Common.Label: 'Forecast Order Quantity MAX';
    CIR_QTY_PERCENT  @Analytics.Measure  : true  @Aggregation.default: #AVG  @Common.Label: 'Forecast Order Percentage';
    SCENARIO         @Analytics.Dimension: true  @Common.Label       : 'Scenario';
    WEEK_DATE        @Analytics.Dimension: true  @Common.Label       : 'Week Date';
    YEAR             @Analytics.Dimension: true  @Common.Label       : 'Week Date Year';
    QUARTER          @Analytics.Dimension: true  @Common.Label       : 'Week Date Quarter';
    MONTH            @Analytics.Dimension: true  @Common.Label       : 'Week Date Month';
    RESERVE_FIELD1   @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 1';
    RESERVE_FIELD2   @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 2';
    RESERVE_FIELD3   @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 3';
    RESERVE_FIELD4   @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 4';
    RESERVE_FIELD5   @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 5';
};

annotate AnalyticalService.getUnqCharQty with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        LOCATION_ID,
        PRODUCT_ID,
        WEEK_DATE,
        VERSION,
        SCENARIO,
        CIR_ID,
        CHAR_DESC,
        CHARVAL_DESC,
        CHAR_NUM,
        CHAR_NAME,
        CHAR_VALUE,
        CHARVAL_NUM,
        MODEL_VERSION,
        REF_PRODID,
        UNIQUE_ID,
        YEAR,
        QUARTER,
        MONTH,
        RESERVE_FIELD1,
        RESERVE_FIELD2,
        RESERVE_FIELD3,
        RESERVE_FIELD4,
        RESERVE_FIELD5
    ],
    AggregatableProperties: [
        {Property: CIR_QTY},
        {Property: CIR_QTY_AVG}
    ],
    PropertyRestrictions  : true,
    Transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

//Characteristic History Analysis Annotations
annotate AnalyticalService.getSalesUnqData with {
    LOCATION_ID       @Analytics.Dimension: true  @Common.Label       : 'Demand Location';
    REF_PRODID        @Analytics.Dimension: true  @Common.Label       : 'Config Products';
    WEEK_DATE         @Analytics.Dimension: true  @Common.Label       : 'Week Date';
    PRODUCT_ID        @Analytics.Dimension: true  @Common.Label       : 'Partial Product';
    SALES_ORG         @Analytics.Dimension: true  @Common.Label       : 'Sales Org';
    CUSTOMER_GROUP    @Analytics.Dimension: true  @Common.Label       : 'Customer Group';
    MAT_AVAILDATE     @Analytics.Dimension: true  @Common.Label       : 'Mat. Avail Date';
    SALES_DOC         @Analytics.Dimension: true  @Common.Label       : 'Sales Doc.';
    UNIQUE_ID         @Analytics.Dimension: true  @Common.Label       : 'Unique ID';
    DIVISION          @Analytics.Dimension: true  @Common.Label       : 'Division';
    PERIODDESC        @Analytics.Dimension: true  @Common.Label       : 'Period Desc';
    PRIMARY_ID        @Analytics.Dimension: true  @Common.Label       : 'Primary ID';
    REASON_REJ        @Analytics.Dimension: true  @Common.Label       : 'Reason Rej';
    SALESDOC_ITEM     @Analytics.Dimension: true  @Common.Label       : 'SalesDoc. Item';
    SCHEDULELINE_NUM  @Analytics.Dimension: true  @Common.Label       : 'Schedule Line Number';
    SEEDORD_CHK       @Analytics.Dimension: true  @Common.Label       : 'Seed Order Chk';
    CHAR_DESC         @Analytics.Dimension: true  @Common.Label       : 'Characteristic Description';
    CHAR_NUM          @Analytics.Dimension: true  @Common.Label       : 'Characteristic ID';
    // CLASS_NAME        @Analytics.Dimension: true  @Common.Label       : 'Class Description';
    // CLASS_NUM         @Analytics.Dimension: true  @Common.Label       : 'Class ID';
    CHARVAL_DESC      @Analytics.Dimension: true  @Common.Label       : 'Characteristic Value Description';
    UID_CHAR_RATE     @Analytics.Dimension: true  @Common.Label       : 'Uid Characteristic Rate';
    VALID_FROM        @Analytics.Dimension: true  @Common.Label       : 'Valid From';
    VALID_TO          @Analytics.Dimension: true  @Common.Label       : 'Valid To';
    CONFIRMED_QTY     @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Confirmed Quantity';
    ORD_QTY           @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Ord Qty';
    ORD_QTY_MAX       @Analytics.Measure  : true  @Aggregation.default: #MAX  @Common.Label: 'Ord Qty Max';
    ORD_QTY_PERCENT   @Analytics.Measure  : true  @Aggregation.default: #AVG  @Common.Label: 'Ord Percentage';
    YEAR              @Analytics.Dimension: true  @Common.Label       : 'Week Date Year';
    QUARTER           @Analytics.Dimension: true  @Common.Label       : 'Week Date Quarter';
    MONTH             @Analytics.Dimension: true  @Common.Label       : 'Week Date Month';
    RESERVE_FIELD1    @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 1';
    RESERVE_FIELD2    @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 2';
    RESERVE_FIELD3    @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 3';
    RESERVE_FIELD4    @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 4';
    RESERVE_FIELD5    @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 5';
};

annotate AnalyticalService.getSalesUnqData with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        SALES_DOC,
        SALESDOC_ITEM,
        REF_PRODID,
        PRODUCT_ID,
        UNIQUE_ID,
        PRIMARY_ID,
        SCHEDULELINE_NUM,
        REASON_REJ,
        MAT_AVAILDATE,
        WEEK_DATE,
        YEAR,
        QUARTER,
        MONTH,
        PERIODDESC,
        CUSTOMER_GROUP,
        LOCATION_ID,
        SEEDORD_CHK,
        SALES_ORG,
        DISTR_CHANNEL,
        DIVISION,
        RESERVE_FIELD1,
        RESERVE_FIELD2,
        RESERVE_FIELD3,
        RESERVE_FIELD4,
        RESERVE_FIELD5,
        UNIQUE_DESC,
        // CLASS_NUM,
        // CLASS_NAME,
        CHAR_NUM,
        CHAR_NAME,
        CHAR_DESC,
        CHAR_VALUE,
        CHARVAL_DESC,
        UID_CHAR_RATE,
        VALID_FROM,
        VALID_TO
    ],
    AggregatableProperties: [
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: CONFIRMED_QTY
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: ORD_QTY
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: ORD_QTY_MAX
        }
    ],
    PropertyRestrictions  : true,
    Transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

//Cir Log Annotations
annotate AnalyticalService.getCIRLogData with {
    MANDT           @Analytics.Dimension: true;
    MATNR           @Analytics.Dimension: true;
    CIR_NUM         @Analytics.Dimension: true;
    PLANT           @Analytics.Dimension: true;
    UNIQUE_ID       @Analytics.Dimension: true;
    WEEK_DATE       @Analytics.Dimension: true;
    CUST_MATERIAL   @Analytics.Dimension: true;
    USER_ID         @Analytics.Dimension: true;
    QUANTITY        @Analytics.Measure  : true  @Aggregation.default: #SUM;
    MSG_TYP         @Analytics.Dimension: true;
    MESSAGE         @Analytics.Dimension: true;
    W_DATE          @Analytics.Dimension: true;
    YEAR            @Analytics.Dimension: true  @Common.Label       : 'Week Date Year';
    QUARTER         @Analytics.Dimension: true  @Common.Label       : 'Week Date Quarter';
    MONTH           @Analytics.Dimension: true  @Common.Label       : 'Week Date Month';
    RESERVE_FIELD1  @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 1';
    RESERVE_FIELD2  @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 2';
    RESERVE_FIELD3  @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 3';
    RESERVE_FIELD4  @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 4';
    RESERVE_FIELD5  @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 5';
}

annotate AnalyticalService.getCIRLogData with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        MANDT,
        MATNR,
        CIR_NUM,
        PLANT,
        UNIQUE_ID,
        WEEK_DATE,
        CUST_MATERIAL,
        USER_ID,
        QUANTITY,
        MSG_TYP,
        MESSAGE,
        W_DATE,
        YEAR,
        QUARTER,
        MONTH,
        RESERVE_FIELD1,
        RESERVE_FIELD2,
        RESERVE_FIELD3,
        RESERVE_FIELD4,
        RESERVE_FIELD5
    ],
    AggregatableProperties: [{
        $Type   : 'Aggregation.AggregatablePropertyType',
        Property: QUANTITY
    }],
    PropertyRestrictions  : true,
    Transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

//Vended good capacity annotations
annotate AnalyticalService.getVendedCapacity with {
    LOCATION_ID     @Analytics.Dimension: true;
    PRODUCT_ID      @Analytics.Dimension: true;
    LOCATION_DESC   @Analytics.Dimension: true;
    PROD_DESC       @Analytics.Dimension: true;
    LINE_ID         @Analytics.Dimension: true;
    LINE_DESC       @Analytics.Dimension: true;
    RESTRICTION     @Analytics.Dimension: true  @Common.Label       : 'Resource';
    RTR_DESC        @Analytics.Dimension: true  @Common.Label       : 'Resource Description';
    WEEK_DATE       @Analytics.Dimension: true;
    MODEL_VERSION   @Analytics.Dimension: true;
    VERSION         @Analytics.Dimension: true;
    SCENARIO        @Analytics.Dimension: true;
    VERSION_NAME    @Analytics.Dimension: true;
    SCENARIO_NAME   @Analytics.Dimension: true;
    ORD_QTY         @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Sales Order Quantity';
    RTR_CAP         @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Resource Capacity';
    DIFF_QTY        @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Resource Exceeded By';
    PLANNED_QTY     @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Resource Capacity';
    OPEN_RTR_QTY    @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Open Resource Quantity';
    YEAR            @Analytics.Dimension: true  @Common.Label       : 'Week Date Year';
    QUARTER         @Analytics.Dimension: true  @Common.Label       : 'Week Date Quarter';
    MONTH           @Analytics.Dimension: true  @Common.Label       : 'Week Date Month';
    RESERVE_FIELD1  @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 1';
    RESERVE_FIELD2  @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 2';
    RESERVE_FIELD3  @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 3';
    RESERVE_FIELD4  @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 4';
    RESERVE_FIELD5  @Analytics.Dimension: true  @Common.Label       : 'Reserve Field 5';
}

annotate AnalyticalService.getVendedCapacity with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        LOCATION_ID,
        PRODUCT_ID,
        LOCATION_DESC,
        PROD_DESC,
        LINE_ID,
        LINE_DESC,
        RESTRICTION,
        RTR_DESC,
        WEEK_DATE,
        MODEL_VERSION,
        VERSION,
        SCENARIO,
        VERSION_NAME,
        SCENARIO_NAME,
        PERIODDESC,
        YEAR,
        QUARTER,
        MONTH,
        RESERVE_FIELD1,
        RESERVE_FIELD2,
        RESERVE_FIELD3,
        RESERVE_FIELD4,
        RESERVE_FIELD5
    ],
    AggregatableProperties: [
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: ORD_QTY
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: RTR_CAP
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: PLANNED_QTY
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: DIFF_QTY
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: OPEN_RTR_QTY
        }
    ],
    PropertyRestrictions  : true,
    Transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

//Annotations for Final Option Precentages
// annotate AnalyticalService.getOptFilterdata with {
//     LOCATION_ID      @Analytics.Dimension: true  @Common.Label: 'Location';
//     LOCATION_DESC    @Analytics.Dimension: true  @Common.Label: 'Location Description';
//     PRODUCT_ID       @Analytics.Dimension: true  @Common.Label: 'Product';
//     PROD_DESC        @Analytics.Dimension: true  @Common.Label: 'Product Description';
//     CHAR_NUM         @Analytics.Dimension: true  @Common.Label: 'Characteristic';
//     CHAR_DESC        @Analytics.Dimension: true  @Common.Label: 'Characteristic Description';
//     CHARVAL_NUM      @Analytics.Dimension: true  @Common.Label: 'Characteristic Value';
//     CHARVAL_DESC     @Analytics.Dimension: true  @Common.Label: 'Characteristic Value Description';
//     VERSION          @Analytics.Dimension: true  @Common.Label: 'Version';
//     VERSION_NAME     @Analytics.Dimension: true  @Common.Label: 'Version Name';
//     SCENARIO         @Analytics.Dimension: true  @Common.Label: 'Scenario';
//     SCENARIO_NAME    @Analytics.Dimension: true  @Common.Label: 'Scenario Name';
// };

annotate AnalyticalService.getOptFilterdata with {
    LOCATION_ID    @Analytics.Dimension: true  @Common.Label: 'Location';
    LOCATION_DESC  @Analytics.Dimension: true  @Common.Label: 'Location Description';
    PRODUCT_ID     @Analytics.Dimension: true  @Common.Label: 'Product';
    PROD_DESC      @Analytics.Dimension: true  @Common.Label: 'Product Description';

    @Analytics.Dimension     : true
    @Common.Label            : 'Characteristic'
    @ObjectModel.text.element: ['CHAR_DESC']
    CHAR_NUM;

    @Analytics.Dimension     : true
    @Common.Label            : 'Characteristic Description'
    @ObjectModel.text        : true
    CHAR_DESC;

    CHARVAL_NUM    @Analytics.Dimension: true  @Common.Label: 'Characteristic Value';
    CHARVAL_DESC   @Analytics.Dimension: true  @Common.Label: 'Characteristic Value Description';
    VERSION        @Analytics.Dimension: true  @Common.Label: 'Version';
    VERSION_NAME   @Analytics.Dimension: true  @Common.Label: 'Version Name';
    SCENARIO       @Analytics.Dimension: true  @Common.Label: 'Scenario';
    SCENARIO_NAME  @Analytics.Dimension: true  @Common.Label: 'Scenario Name';
}

annotate AnalyticalService.getOptFilterdata with @Aggregation.ApplySupported: {
    GroupableProperties : [
        LOCATION_ID,
        PRODUCT_ID,
        CUSTOMER_GROUP,
        MODEL_VERSION,
        CHAR_NUM,
        CHARVAL_NUM,
        VERSION,
        SCENARIO
    ],
    PropertyRestrictions: true,
    Transformations     : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

//Location Product annotations
annotate AnalyticalService.getLocProdData with {
    LOCATION_ID    @Analytics.Dimension: true  @Common.Label: 'Location';
    PRODUCT_ID     @Analytics.Dimension: true  @Common.Label: 'Product';
    LOCATION_DESC  @Analytics.Dimension: true  @Common.Label: 'Location Description';
    PROD_DESC      @Analytics.Dimension: true  @Common.Label: 'Product Description';
};

annotate AnalyticalService.getLocProdData with @Aggregation.ApplySupported: {
    GroupableProperties : [
        LOCATION_ID,
        PRODUCT_ID
    ],
    PropertyRestrictions: true,
    Transformations     : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

//Annotations for Component Requirements view
annotate AnalyticalService.getComponentReqData with {
    LOCATION_ID    @Analytics.Dimension: true  @Common.Label       : 'Location';
    PRODUCT_ID     @Analytics.Dimension: true  @Common.Label       : 'Product';
    FACTORY_LOC    @Analytics.Dimension: true  @Common.Label       : 'Factory Location';
    COMPONENT      @Analytics.Dimension: true  @Common.Label       : 'Component';
    COMP_DESC      @Analytics.Dimension: true  @Common.Label       : 'Component Description';
    VERSION        @Analytics.Dimension: true  @Common.Label       : 'Version';
    SCENARIO       @Analytics.Dimension: true  @Common.Label       : 'Scenario';
    WEEK_DATE      @Analytics.Dimension: true  @Common.Label       : 'Week Date';
    COMPAVAIL_QTY  @Analytics.Measure  : true  @Aggregation.default: #SUM;
    COMP_QTY       @Analytics.Measure  : true  @Aggregation.default: #SUM;
};

annotate AnalyticalService.getComponentReqData with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        LOCATION_ID,
        PRODUCT_ID,
        COMPONENT,
        FACTORY_LOC,
        COMP_DESC,
        VERSION,
        SCENARIO,
        WEEK_DATE
    ],
    AggregatableProperties: [
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: COMPAVAIL_QTY
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: COMP_QTY
        }
    ],
    PropertyRestrictions  : true,
    Transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

//Annotations for material requirements
annotate AnalyticalService.getAssemblyCompQty with {
    LOCATION_ID    @Analytics.Dimension: true  @Common.Label       : 'Location';
    LOCATION_DESC  @Analytics.Dimension: true  @Common.Label       : 'Location Description';
    PRODUCT_ID     @Analytics.Dimension: true  @Common.Label       : 'Product';
    PROD_DESC      @Analytics.Dimension: true  @Common.Label       : 'Product Description';
    ITEM_NUM       @Analytics.Dimension: true  @Common.Label       : 'Item Number';
    ASSEMBLY       @Analytics.Dimension: true  @Common.Label       : 'Assembly';
    ASM_DESC       @Analytics.Dimension: true  @Common.Label       : 'Assembly Description';
    MODEL_VERSION  @Analytics.Dimension: true  @Common.Label       : 'Model Version';
    VERSION        @Analytics.Dimension: true  @Common.Label       : 'Version';
    SCENARIO       @Analytics.Dimension: true  @Common.Label       : 'Scenario';
    RULE_TYPE      @Analytics.Dimension: true  @Common.Label       : 'Rule Type';
    REF_PRODID     @Analytics.Dimension: true  @Common.Label       : 'Config Product';
    FACTORY_LOC    @Analytics.Dimension: true  @Common.Label       : 'Factory Location';
    // MRP_GROUP      @Analytics.Dimension: true  @Common.Label       : 'MRP Group';
    // PHANTOM_IND    @Analytics.Dimension: true  @Common.Label       : 'Phantom Indicator';
    // CONFIGURABLE   @Analytics.Dimension: true  @Common.Label       : 'Configurable';
    CIR_QTY        @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Forecast Order Quantity';
    ASMB_QTY       @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Component Quantity';
    CIR_ASMB_QTY   @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Assembly Requirements';
};

annotate AnalyticalService.getAssemblyCompQty with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        LOCATION_ID,
        LOCATION_DESC,
        PRODUCT_ID,
        PROD_DESC,
        ITEM_NUM,
        ASSEMBLY,
        ASM_DESC,
        MODEL_VERSION,
        VERSION,
        SCENARIO,
        RULE_TYPE,
        REF_PRODID,
        FACTORY_LOC,
        MRP_GROUP,
        MRP_TYPE
    // PHANTOM_IND,
    // CONFIGURABLE
    ],
    AggregatableProperties: [
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: CIR_QTY
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: ASMB_QTY
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: CIR_ASMB_QTY
        }
    ],
    PropertyRestrictions  : true,
    Transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

annotate AnalyticalService.getProdOrdConsumptionNewAnly with {
    LOCATION_ID    @Analytics.Dimension: true  @Common.Label: 'Location';
    LOCATION_DESC  @Analytics.Dimension: true  @Common.Label: 'Location Description';
    MAT_PARENT     @Analytics.Dimension: true  @Common.Label: 'Parent';
    PROD_DESC      @Analytics.Dimension: true  @Common.Label: 'Product Description';
    SALES_DOC      @Analytics.Dimension: true  @Common.Label: 'Sales Document';
    SALESDOC_ITEM  @Analytics.Dimension: true  @Common.Label: 'Sales Document Item';
    UNIQUE_ID      @Analytics.Dimension: true  @Common.Label: 'Unique ID';
    REF_PRODID     @Analytics.Dimension: true  @Common.Label: 'Config Product';
    PROD_ORDER     @Analytics.Dimension: true  @Common.Label: 'Production Order';
    MANU_LOC       @Analytics.Dimension: true  @Common.Label: 'Manufacturing Location';
    COMPONENT      @Analytics.Dimension: true  @Common.Label: 'Component';
};


annotate AnalyticalService.getProdOrdConsumptionNewAnly with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        COMPONENT,
        MAT_PARENT,
        SALES_DOC,
        SALESDOC_ITEM,
        UNIQUE_ID,
        LOCATION_ID,
        LOCATION_DESC,
        REF_PRODID,
        PROD_ORDER,
        MANU_LOC
    ],
    AggregatableProperties: [{
        $Type   : 'Aggregation.AggregatablePropertyType',
        Property: COMP_QTY
    }],
    PropertyRestrictions  : true,
    Transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

annotate AnalyticalService.getDMDForecast with {
    LOCATION_ID  @Analytics.Dimension: true  @Common.Label       : 'Demand Location';
    PRODUCT_ID   @Analytics.Dimension: true  @Common.Label       : 'Product ID';
    UNIQUE_ID    @Analytics.Dimension: true  @Common.Label       : 'Unique ID';
    WEEK_DATE    @Analytics.Dimension: true  @Common.Label       : 'Week Date';
    YEAR         @Analytics.Dimension: true  @Common.Label       : 'Week Date Year';
    QUARTER      @Analytics.Dimension: true  @Common.Label       : 'Week Date Quarter';
    MONTH        @Analytics.Dimension: true  @Common.Label       : 'Week Date Month';
    TYPE         @Analytics.Dimension: true  @Common.Label       : 'Type';
    YEAR_MONTH   @Analytics.Dimension: true  @Common.Label       : 'Year Month';
    QUANTITY     @Analytics.Measure  : true  @Aggregation.default: #SUM;
    ACTUAL_QTY   @Analytics.Measure  : true  @Aggregation.default: #SUM;
};


annotate AnalyticalService.getDMDForecast with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        LOCATION_ID,
        PRODUCT_ID,
        UNIQUE_ID,
        WEEK_DATE,
        YEAR,
        QUARTER,
        MONTH,
        TYPE,
        YEAR_MONTH
    ],
    AggregatableProperties: [
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: ACTUAL_QTY,
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: QUANTITY,
        }
    ],
    PropertyRestrictions  : true,
    Transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};


annotate AnalyticalService.getFacLoc with @Aggregation.ApplySupported: {
    GroupableProperties : [
        FACTORY_LOC,
        LOCATION_DESC,
        PLAN_LOC,
        PLANLOC_DESC,
        DEMAND_DESC,
        PRODUCT_ID,
        PROD_DESC,
        REF_PRODID,
        REFPROD_DESC
    ],
    PropertyRestrictions: true,
    Transformations     : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};

annotate AnalyticalService.getAlytRolesLocProd with @Aggregation.ApplySupported: {
    GroupableProperties : [
        FACTORY_LOC,
        LOCATION_DESC,
        PLAN_LOC,
        PLANLOC_DESC,
        DEMAND_LOC,
        DEMAND_DESC,
        PRODUCT_ID,
        PROD_DESC,
        REF_PRODID,
        REFPROD_DESC,
        MRP_GROUP,
        MATERIAL_TYPE,
        USER
    ],
    PropertyRestrictions: true,
    Transformations     : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};


annotate AnalyticalService.getPlanOrderAnly with {
    LOCATION_ID                @Analytics.Dimension: true  @Common.Label       : 'Location';
    PRODUCT_ID                 @Analytics.Dimension: true  @Common.Label       : 'Product';
    WEEK_DATE                  @Analytics.Dimension: true  @Common.Label       : 'Week Date';
    CIR_ID                     @Analytics.Dimension: true  @Common.Label       : 'CIR ID';
    MODEL_VERSION              @Analytics.Dimension: true  @Common.Label       : 'Model Version';
    VERSION                    @Analytics.Dimension: true  @Common.Label       : 'Version';
    SCENARIO                   @Analytics.Dimension: true  @Common.Label       : 'Scenario';
    UNIQUE_ID                  @Analytics.Dimension: true  @Common.Label       : 'Unique ID';
    UNIQUE_DESC                @Analytics.Dimension: true  @Common.Label       : 'Unique Description';
    CHAR_NUM                   @Analytics.Dimension: true  @Common.Label       : 'Characteristic Number';
    CHAR_NAME                  @Analytics.Dimension: true  @Common.Label       : 'Characteristic Name';
    CHAR_DESC                  @Analytics.Dimension: true  @Common.Label       : 'Characteristic Description';
    CHAR_VALUE                 @Analytics.Dimension: true  @Common.Label       : 'Characteristic Value';
    CHARVAL_NUM                @Analytics.Dimension: true  @Common.Label       : 'Characteristic Value Number';
    SNAPSHOT_CHK               @Analytics.Dimension: true  @Common.Label       : 'Snapshot Check';
    OPEN_ASSEMBLY              @Analytics.Dimension: true  @Common.Label       : 'Open Assembly';
    PROD_DESC                  @Analytics.Dimension: true  @Common.Label       : 'Product Description';
    CONFIGURATION_PRODUCT      @Analytics.Dimension: true  @Common.Label       : 'Configuration Product';
    CONFIGURATION_PRODUCT_DES  @Analytics.Dimension: true  @Common.Label       : 'Configuration Product Description';
    YEAR_QUAETER               @Analytics.Dimension: true  @Common.Label       : 'Year Quarter';
    CHAR_CHARVALUE             @Analytics.Dimension: true  @Common.Label       : 'Characteristic Value Pair';

    CIR_QTY                    @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'CIR Quantity';
    BFORECHNG_CIRQTY           @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Before Change CIR Quantity';
    ACTUAL_QTY                 @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Actual Quantity';
    UNCONSUMED_FORECAST        @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Unconsumed Forecast';
    PRODORD_QTY                @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Production Order Quantity';
    COUNT                      @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Count';
};

annotate AnalyticalService.getPlanOrderAnly with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        LOCATION_ID,
        PRODUCT_ID,
        WEEK_DATE,
        MODEL_VERSION,
        VERSION,
        SCENARIO,
        UNIQUE_DESC,
        CHAR_NUM,
        CHAR_NAME,
        CHAR_DESC,
        CHAR_VALUE,
        CHARVAL_NUM,
        SNAPSHOT_CHK,
        PROD_DESC,
        CONFIGURATION_PRODUCT,
        CONFIGURATION_PRODUCT_DES,
        YEAR_QUAETER,
        CHAR_CHARVALUE,
    ],
    AggregatableProperties: [
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: CIR_QTY,
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: BFORECHNG_CIRQTY,
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: ACTUAL_QTY,
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: UNCONSUMED_FORECAST,
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: PRODORD_QTY,
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: OPEN_ASSEMBLY,
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: COUNT,
        }
    ],
    PropertyRestrictions  : true,
    Transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};


annotate AnalyticalService.getAsmOrdAnly with {
    LOCATION_ID           @Analytics.Dimension: true  @Common.Label       : 'Location';
    PRODUCT_ID            @Analytics.Dimension: true  @Common.Label       : 'Product';
    ITEM_NUM              @Analytics.Dimension: true  @Common.Label       : 'Item Number';
    COMPONENT             @Analytics.Dimension: true  @Common.Label       : 'Component';
    WEEK_DATE             @Analytics.Dimension: true  @Common.Label       : 'Week Date';
    MODEL_VERSION         @Analytics.Dimension: true  @Common.Label       : 'Model Version';
    VERSION               @Analytics.Dimension: true  @Common.Label       : 'Version';
    SCENARIO              @Analytics.Dimension: true  @Common.Label       : 'Scenario';
    TYPE                  @Analytics.Dimension: true  @Common.Label       : 'Type';
    REF_PRODID            @Analytics.Dimension: true  @Common.Label       : 'Reference Product ID';
    FACTORY_LOC           @Analytics.Dimension: true  @Common.Label       : 'Factory Location';
    UNIQUE_ID             @Analytics.Dimension: true  @Common.Label       : 'Unique ID';
    CALENDAR_WEEK         @Analytics.Dimension: true  @Common.Label       : 'Calendar Week';
    TELESCOPIC_WEEK       @Analytics.Dimension: true  @Common.Label       : 'Telescopic Week';
    ASSEMBLY_DESCRIPTION  @Analytics.Dimension: true  @Common.Label       : 'Assembly Description';
    YEAR_QUARTER          @Analytics.Dimension: true  @Common.Label       : 'Year Quarter';

    CIR_QTY               @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'CIR Quantity';
    COMPCIR_QTY           @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Component CIR Quantity';
    ACTUAL_QTY            @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Actual Quantity';
    COUNT                 @Analytics.Measure  : true  @Aggregation.default: #SUM  @Common.Label: 'Count';
};


annotate AnalyticalService.getAsmOrdAnly with @Aggregation.ApplySupported: {
    GroupableProperties   : [
        LOCATION_ID,
        PRODUCT_ID,
        ITEM_NUM,
        COMPONENT,
        WEEK_DATE,
        MODEL_VERSION,
        VERSION,
        SCENARIO,
        TYPE,
        REF_PRODID,
        FACTORY_LOC,
        UNIQUE_ID,
        CALENDAR_WEEK,
        TELESCOPIC_WEEK,
        ASSEMBLY_DESCRIPTION,
        YEAR_QUARTER,
    ],
    AggregatableProperties: [
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: CIR_QTY,
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: COMPCIR_QTY,
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: ACTUAL_QTY,
        },
        {
            $Type   : 'Aggregation.AggregatablePropertyType',
            Property: COUNT,
        }
    ],
    PropertyRestrictions  : true,
    transformations       : [
        'aggregate',
        'bottompercent',
        'bottomsum',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search',
        'compute',
        'topcount',
        'toppercent',
        'topsum'
    ]
};
