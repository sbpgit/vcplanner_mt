using {
    managed,
    cuid,
    sap.common
} from '@sap/cds/common';

context cp {
    // Locations - Imported from ERP System(External System)
    entity LOCATION {
        key LOCATION_ID    : String(4)      @title: 'Location ';
            LOCATION_DESC  : String(30)     @title: 'Location Description';
            LOCATION_TYPE  : String(1)      @title: 'Location Type';
            LATITUDE       : Decimal(10, 8) @title: 'Latitude';
            LONGITUTE      : Decimal(10, 8) @title: 'Longitude';
            RESERVE_FIELD1 : String(40)     @title: 'Reserve Field1';
            RESERVE_FIELD2 : String(40)     @title: 'Reserve Field2';
            RESERVE_FIELD3 : String(40)     @title: 'Reserve Field3';
            RESERVE_FIELD4 : String(40)     @title: 'Reserve Field4';
            RESERVE_FIELD5 : String(40)     @title: 'Reserve Field5';
            AUTH_GROUP     : String(4)      @title: 'Authorization Group';
    };

    // Customer group - Imported from ERP System(External System)
    entity CUSTOMERGROUP {
        key CUSTOMER_GROUP : String(20) @title: 'Customer Group';
            CUSTOMER_DESC  : String(20) @title: 'Customer Description';
            RESERVE_FIELD1 : String(40) @title: 'Reserve Field1';
            RESERVE_FIELD2 : String(40) @title: 'Reserve Field2';
            RESERVE_FIELD3 : String(40) @title: 'Reserve Field3';
            RESERVE_FIELD4 : String(40) @title: 'Reserve Field4';
            RESERVE_FIELD5 : String(40) @title: 'Reserve Field5';
            AUTH_GROUP     : String(4)  @title: 'Authorization Group';
    };

    // Products  - Imported from ERP System(External System)
    entity PRODUCT {
        key PRODUCT_ID       : String(40) @title: 'Configurable Product';
            PROD_DESC        : String(40) @title: 'Product Description';
            PROD_FAMILY      : String(30) @title: 'Product Family';
            PROD_GROUP       : String(30) @title: 'Product Group';
            PROD_MODEL       : String(30) @title: 'Product Model';
            PROD_MDLRANGE    : String(30) @title: 'Product Range';
            PROD_SERIES      : String(30) @title: 'Product Series';
            PROD_TYPE        : String(4)  @title: 'Product Type';
            UOM               : String(3) default 'NA'   @title: 'Unit of Measure';   
            RESERVE_FIELD1   : String(40) @title: 'Reserve Field1';
            RESERVE_FIELD2   : String(40) @title: 'Reserve Field2';
            RESERVE_FIELD3   : String(40) @title: 'Reserve Field3';
            RESERVE_FIELD4   : String(40) @title: 'Reserve Field4';
            RESERVE_FIELD5   : String(40) @title: 'Reserve Field5';
            AUTH_GROUP       : String(4)  @title: 'Authorization Group';
            NON_CONFIGURABLE : String(1)  @title: 'Non-Configurable Flag';
    };

    // Product and Location table  - Imported from ERP System(External System)
    entity LOCATION_PRODUCT {
        key LOCATION_ID       : String(4)  @title: 'Location ';
        key PRODUCT_ID        : String(40) @title: 'Product';
            LOTSIZE_KEY       : String(2)  @title: 'Lot Size Key';
            LOT_SIZE          : Integer    @title: 'Lot Size';
            PROCUREMENT_TYPE  : String(1)  @title: 'Procurement Type';
            PLANNING_STRATEGY : String(2)  @title: 'Planning Strategy';
            MANUAL            : String(1)  @title: 'Manual Record';
            MRP_GROUP         : String(4)  @title: 'MRP Group';
            MRP_TYPE          : String(2)  @title: 'MRP TYPE';
            UOM               : String(3) default 'NA'   @title: 'Unit of Measure'; 
    };


    // Classes   - Imported from ERP System(External System)
    entity CLASS {
        key CLASS_NUM    : String(18)  @title: 'Internal class number';
            CLASS_NAME   : String(20)  @title: 'Class Name';
            CLASS_TYPE   : String(3)   @title: 'Class Type';
            CLASS_DESC   : String(150) @title: 'Class Description';
            IBPCHAR_CHK  : Boolean     @title: 'IBP Characteristics check';
            AUTHGROUP    : String(4)   @title: 'Authorization Group';
            CHANGED_BY   : String(50)  @title: 'Changed By';
            CHANGED_DATE : Date        @title: 'Changed Date';
            CHANGED_TIME : Time        @title: 'Changed Time';
    };

    //Characteristics   - Imported from ERP System(External System)
    entity CHARACTERISTICS {
        key CLASS_NUM     : String(18)  @title: 'Internal class number';
        key CHAR_NUM      : String(100) @title: 'Internal Char. number';
            CHAR_NAME     : String(80)  @title: 'Charateristic Name';
            CHAR_DESC     : String(160) @title: 'Charateristic Desc.';
            CHAR_GROUP    : String(10)  @title: 'Charateristic Group';
            CHAR_TYPE     : String(4)   @title: 'Charateristic Type';
            ENTRY_REQ     : String(1)   @title: 'Entry request';
            CHAR_CATGRY   : String(40)  @title: 'Charateristic Category';
            MULTI_CHAR    : String(1);
            REF_CHAR_NUM  : String(100) @title: 'Ref. Internal Char. number';
            REF_CHAR_NAME : String(80)  @title: 'Ref. Charateristic Name';
            REF_CHAR_DESC : String(160) @title: 'Ref. Charateristic Desc.';
    };

    // Characteristic Values
    entity CHAR_VALUES {
        key CHAR_NUM        : String(100) @title: 'Internal Char. number';
        key CHARVAL_NUM     : String(80)  @title: 'Internal Char. number';
        key CHAR_VALUE      : String(80)  @title: 'Charateristic Value';
            CHARVAL_DESC    : String(160) @title: 'Charateristic Value Desc.';
            CATCH_ALL       : String(1)   @title: 'Catch all';
            REF_CHAR_NUM    : String(100) @title: 'Ref. Internal Char. number';
            REF_CHARVAL_NUM : String(80)  @title: 'Ref. Internal Char. number';
            REF_CHAR_VALUE  : String(80)  @title: 'Charateristic Value';
            GENFLAG         : String(1)   @title: 'Generated Flag';
    };

    // Characteristics Value Num - Value Mapping - Imported from ERP System(External System)
    entity CHARVALUE_VALNUM {
        key CLASS_NUM    : String(18)  @title: 'Internal class number';
        key CHAR_NUM     : String(100) @title: 'Internal Char. number';
        key CHAR_VALUE   : String(80)  @title: 'Charateristic Value';
            CHAR_NAME    : String(80)  @title: 'Charateristic Name';
            CHARVAL_NUM  : String(80)  @title: 'Internal Char. number';
            CHARVAL_DESC : String(160) @title: 'Charateristic Value Desc.';
    }


    /**
     * Characteristics   - Imported from ERP System(External System)
     * Temporary staging table for CHARACTERISTICS table
     */
    entity CHARACTERISTICS_MASTER {
        key CLASS_NUM   : String(18)  @title: 'Internal class number';
        key CHAR_NUM    : String(100) @title: 'Internal Char. number';
            CHAR_NAME   : String(80)  @title: 'Charateristic Name';
            CHAR_DESC   : String(160) @title: 'Charateristic Desc.';
            CHAR_GROUP  : String(10)  @title: 'Charateristic Group';
            CHAR_TYPE   : String(4)   @title: 'Charateristic Type';
            ENTRY_REQ   : String(1)   @title: 'Entry request';
            CHAR_CATGRY : String(40)  @title: 'Charateristic Category';
            MULTI_CHAR  : String(1);
    };

    /**
     * Characteristic Values   - Imported from ERP System(External System)
     * Temporary staging table for CHAR_VALUES table
     */
    entity CHAR_VALUES_MASTER {
        key CHAR_NUM     : String(100) @title: 'Internal Char. number';
        key CHARVAL_NUM  : String(80)  @title: 'Internal Char. number';
        key CHAR_VALUE   : String(80)  @title: 'Charateristic Value';
            CHARVAL_DESC : String(160) @title: 'Charateristic Value Desc.';
            CATCH_ALL    : String(1)   @title: 'Catch all';
    };


    /**
     * BOM header - Imported from ERP System(External System)
     * This table consists of Assemblies i.e. the materials that are
     * next level to a configurable products that have object dependencies
     *  */
    entity BOMHEADER {
        key LOCATION_ID  : String(4)      @title: 'Location '; //Association to ZLOCATION;//
        key PRODUCT_ID   : String(40)     @title: 'Product';
        key ITEM_NUM     : String(6)      @title: 'Item Number ';
        key COMPONENT    : String(40)     @title: 'Component';
        key VALID_FROM   : Date           @title: 'Valid From';
            CRITICAL_ASM : String(1)      @title: 'Critical Assembly';
            COMP_TYPE    : String(4)      @title: 'Component Type';
            COMP_DESC    : String(40)     @title: 'Component Desc';
            COMP_QTY     : Decimal(13, 3) @title: 'Component Quantity';
            VALID_TO     : Date           @title: 'Valid To';
    };

    /**
    * BOM Object Dependency - Imported from ERP System(External System)
    * Table consists of list of dependencies for an assembly
    * */
    entity BOM_OBJDEPENDENCY {
        key LOCATION_ID : String(4)      @title: 'Location '; //Association to ZLOCATION;//
        key PRODUCT_ID  : String(40)     @title: 'Product';
        key ITEM_NUM    : String(6)      @title: 'Item Number ';
        key COMPONENT   : String(40)     @title: 'Component';
        key OBJ_DEP     : String(30)     @title: 'Object Dependency';
        key VALID_FROM  : Date           @title: 'Valid From';
            OBJDEP_DESC : String(30)     @title: 'Object Dependency Desc';
            COMP_QTY    : Decimal(13, 3) @title: 'Component Quantity';
            VALID_TO    : Date           @title: 'Valid To';
    };


    /**
    * Object dependency header
    * Contains Object Dependency rules in a formated way
     */
    entity OBJDEP_HEADER_MASTER {
        key OBJ_DEP      : String(30)              @title: 'Object Dependency';
        key OBJ_COUNTER  : Integer                 @title: 'Object Dependency Counter';
        key CLASS_NUM    : String(18)              @title: 'Internal class number';
        key CHAR_NUM     : String(100)             @title: 'Internal Char. number';
        key CHAR_COUNTER : Integer                 @title: 'Characteristic counter';
        key CHARVAL_NUM  : String(80)              @title: 'Internal Char. number';
        key CHAR_VALUE   : String(70) default 'NA' @title: 'Characteristics Value';
            OD_CONDITION : String(2)               @title: 'Object Dependency condition ';
            ROW_ID       : Integer                 @title: 'Attribute Index ';
    };

    // Contains Object Dependency rules in a formatted way handling Multi select and Integer Bucket logic
    entity OBJDEP_HEADER {
        key OBJ_DEP      : String(30)              @title: 'Object Dependency';
        key OBJ_COUNTER  : Integer                 @title: 'Object Dependency Counter';
        key CLASS_NUM    : String(18)              @title: 'Internal class number';
        key CHAR_NUM     : String(100)             @title: 'Internal Char. number';
        key CHAR_COUNTER : Integer                 @title: 'Characteristic counter';
        key CHARVAL_NUM  : String(80)              @title: 'Internal Char. number';
        key CHAR_VALUE   : String(70) default 'NA' @title: 'Characteristics Value';
            OD_CONDITION : String(2)               @title: 'Object Dependency condition ';
            ROW_ID       : Integer                 @title: 'Attribute Index ';
    };

    // Product class  - Imported from ERP System(External System)
    entity PRODUCT_CLASS {
        key PRODUCT_ID   : String(40) @title: 'Product Id';
        key CLASS_NUM    : String(18) @title: 'Class Num';
            CHANGED_DATE : Date       @title: 'Changed Date';
            CHANGED_BY   : String(50) @title: 'Changed By';
            CREATED_DATE : Date       @title: 'Created Date';
            CREATED_BY   : String(50) @title: 'Created By';
            CHANGED_TIME : Time       @title: 'Changed Time';
            CREATED_TIME : Time       @title: 'Created Time';
    };

    // Assembly- component for a location - Imported from ERP System(External System)
    entity ASSEMBLY_COMP {
        key LOCATION_ID   : String(4)                 @title: 'Location ID';
        key ASSEMBLY      : String(40)                @title: 'Assembly';
        key COMPONENT     : String(40)                @title: 'Component';
        key VALID_FROM    : Date default '2000-01-01' @title: 'Valid From';
            CRITICAL_COMP : String(1);
            COMP_TYPE     : String(4)                 @title: 'Component Type';
            COMP_DESC     : String(40)                @title: 'Component Desc';
            COMP_QTY      : Integer;
            VALID_TO      : Date                      @title: 'Valid To';
    }

    // Sales history
    // Contains order from ERP and also that are created from Seed Order Application
    entity SALESH {
        key SALES_DOC         : String(10)     @title: 'Sales Document';
        key SALESDOC_ITEM     : String(10)     @title: 'Sales Document Item'; // VP-1459 - Increased length of Sales Document Item
            DOC_CREATEDDATE   : Date           @title: 'Document Created on';
            SCHEDULELINE_NUM  : String(4)      @title: 'Schedule Line Number';
            PRODUCT_ID        : String(40)     @title: 'Product Id';
            MATERIAL_VARIANT  : String(40)     @title: 'Material Variant';
            REASON_REJ        : String(2)      @title: 'Reason rejection';
            UOM               : String(3)      @title: 'UOM';
            CONFIRMED_QTY     : Decimal(13, 3) @title: 'Confirmed Qty';
            ORD_QTY           : Decimal(13, 3) @title: 'Order Quantity';
            MAT_AVAILDATE     : Date           @title: 'Material Availability Date';
            NET_VALUE         : Decimal(15, 2) @title: 'Net Value';
            CUSTOMER_GROUP    : String(20)     @title: 'Customer Group';
            LOCATION_ID       : String(4)      @title: 'Location ID';
            SEEDORD_CHK       : String(1)      @title: 'Seed Order Check';
            SALES_ORG         : String(4)      @title: 'Sales Org.';
            DISTR_CHANNEL     : String(2)      @title: 'Distribution Channel';
            DIVISION          : String(2)      @title: 'Division';
            SAL_DOCU_TYPE     : String(4)      @title: 'Sales Doc. Type';
            ITEM_CREATED_DATE : Date;
            ITEM_CHANGE_DATE  : Date;
            OPEN_ORDER        : String(1);
            CHARG             : String(10);
            IBP_CUSTOMER      : String(10);
            RELEVENT_FOR_PLAN : String(1);
            ON_HAND_STOCK     : String(1);
            IN_TRANSIT        : String(1);
            SHIP_FROM_LOC     : String(4);
            RESERVE_FIELD1    : String(40);
            RESERVE_FIELD2    : String(40);
            RESERVE_FIELD3    : String(40);
            STOCK_LOC         : String(4);
            TRANS_TO_LOC      : String(4);
            TRANS_FROM_LOC    : String(4);
            CHANGED_DATE      : Date           @title: 'Changed Date';
            CHANGED_BY        : String(12)     @title: 'Changed By';
            CREATED_DATE      : Date           @title: 'Created Date';
            CREATED_BY        : String(12)     @title: 'Created By';
            CHANGED_TIME      : Time           @title: 'Changed Time';
            CREATED_TIME      : Time           @title: 'Created Time';
            DELETE_FLAG       : String(1)      @title: 'Delete Flag';
    };

    /* ************************************************
     * To be review the need to this table
    */
    entity SALESH_COPY {
        key SALES_DOC         : String(10)     @title: 'Sales Document';
        key SALESDOC_ITEM     : String(10)     @title: 'Sales Document Item'; // VP-1459 - Increased length of Sales Document Item
            DOC_CREATEDDATE   : Date           @title: 'Document Created on';
            SCHEDULELINE_NUM  : String(4)      @title: 'Schedule Line Number';
            PRODUCT_ID        : String(40)     @title: 'Product Id';
            REASON_REJ        : String(2)      @title: 'Reason rejection';
            UOM               : String(3)      @title: 'UOM';
            CONFIRMED_QTY     : Decimal(13, 3) @title: 'Confirmed Qty';
            ORD_QTY           : Decimal(13, 3) @title: 'Order Quantity';
            MAT_AVAILDATE     : Date           @title: 'Material Availability Date';
            NET_VALUE         : Decimal(15, 2) @title: 'Net Value';
            CUSTOMER_GROUP    : String(20)     @title: 'Customer Group';
            LOCATION_ID       : String(4)      @title: 'Location ID';
            SEEDORD_CHK       : String(1)      @title: 'Seed Order Check';
            SALES_ORG         : String(4)      @title: 'Sales Org.';
            DISTR_CHANNEL     : String(2)      @title: 'Distribution Channel';
            DIVISION          : String(2)      @title: 'Division';
            SAL_DOCU_TYPE     : String(4)      @title: 'Sales Doc. Type';
            ITEM_CREATED_DATE : Date;
            ITEM_CHANGE_DATE  : Date;
            OPEN_ORDER        : String(1);
            CHARG             : String(10);
            IBP_CUSTOMER      : String(10);
            RELEVENT_FOR_PLAN : String(1);
            ON_HAND_STOCK     : String(1);
            IN_TRANSIT        : String(1);
            SHIP_FROM_LOC     : String(4);
            RESERVE_FIELD1    : String(40);
            RESERVE_FIELD2    : String(40);
            RESERVE_FIELD3    : String(40);
            STOCK_LOC         : String(4);
            TRANS_TO_LOC      : String(4);
            TRANS_FROM_LOC    : String(4);
            CHANGED_DATE      : Date           @title: 'Changed Date';
            CHANGED_BY        : String(12)     @title: 'Changed By';
            CREATED_DATE      : Date           @title: 'Created Date';
            CREATED_BY        : String(12)     @title: 'Created By';
            CHANGED_TIME      : Time           @title: 'Changed Time';
            CREATED_TIME      : Time           @title: 'Created Time';
    };

    entity FORECAST_DELTA_WEEKS {
        key LOCATION_ID   : String(4)  @title: 'Location';
        key PRODUCT_ID    : String(40) @title: 'Product';
        key VERSION       : String(10) @title: 'VERSION';
        key SCENARIO      : String(32) @title: 'SCENARIO';
        key MODEL_VERSION : String(20) @title: 'Model Version';
        key WEEK_DATE     : Date       @title: 'WEEK_DATE';
    }

    //  Sales History with updated partial product and unique ID
    entity SALES_HM {
        key SALES_DOC     : String(10) @title: 'Sales Document';
        key SALESDOC_ITEM : String(10) @title: 'Sales Document Item'; // VP-1459 - Increased length of Sales Document Item
            PRODUCT_ID    : String(40) @title: 'Product Id';
            LOCATION_ID   : String(4)  @title: 'Location ID';
            UNIQUE_ID     : Integer    @title: 'Unique ID';
            PRIMARY_ID    : Integer    @title: 'Primary ID';
    }

    // Sales History configuration - Imported from S4 after processing
    // through SALESH_CONFIG_MASTER table
    entity SALESH_CONFIG {
        key SALES_DOC     : String(10)  @title: 'Sales Document';
        key SALESDOC_ITEM : String(10)  @title: 'Sales Document Item'; // VP-1459 - Increased length of Sales Document Item
        key CHAR_NUM      : String(100) @title: 'Internal number Char.';
        key CHARVAL_NUM   : String(80)  @title: 'Internal number Char. Value ';
            CHAR_VALUE    : String(70)  @title: 'Char Value';
            PRODUCT_ID    : String(40)  @title: 'Product Id';
            // PROD_AVAILDATE : Date      @title : 'Prod Availability Date';
            CHANGED_DATE  : Date        @title: 'Changed Date';
            CHANGED_BY    : String(12)  @title: 'Changed By';
            CREATED_DATE  : Date        @title: 'Created Date';
            CREATED_BY    : String(12)  @title: 'Created By';
            CHANGED_TIME  : Time        @title: 'Changed Time';
            CREATED_TIME  : Time        @title: 'Created Time';
    };

    //temporary table to check IMPORT_S4_SALESHISTORY job failure
    entity SALESH_CONFIG_TEMP {
        key SALES_DOC     : String(10)  @title: 'Sales Document';
        key SALESDOC_ITEM : String(10)  @title: 'Sales Document Item'; // VP-1459 - Increased length of Sales Document Item
        key CHAR_NUM      : String(100) @title: 'Internal number Char.';
        key CHARVAL_NUM   : String(80)  @title: 'Internal number Char. Value ';
            CHAR_VALUE    : String(70)  @title: 'Char Value';
            PRODUCT_ID    : String(40)  @title: 'Product Id';
            // PROD_AVAILDATE : Date      @title : 'Prod Availability Date';
            CHANGED_DATE  : Date        @title: 'Changed Date';
            CHANGED_BY    : String(12)  @title: 'Changed By';
            CREATED_DATE  : Date        @title: 'Created Date';
            CREATED_BY    : String(12)  @title: 'Created By';
            CHANGED_TIME  : Time        @title: 'Changed Time';
            CREATED_TIME  : Time        @title: 'Created Time';
    };

    //TODO Temp table for Component req analytics
    entity V_COMPONENT_REQ_TEMP {
        key LOCATION_ID   : String(4) not null      @title: 'LOCATION_ID';
        key PRODUCT_ID    : String(40) not null     @title: 'PRODUCT_ID';
        key WEEK_DATE     : Date not null           @title: 'WEEK_DATE';
        key FACTORY_LOC   : String(4) not null      @title: 'FACTORY_LOC';
        key VERSION       : String(10) not null     @title: 'VERSION';
        key SCENARIO      : String(32) not null     @title: 'SCENARIO';
        key ITEM_NUM      : String(6) not null      @title: 'ITEM_NUM';
        key ASSEMBLY      : String(40) not null     @title: 'ASSEMBLY';
        key COMPONENT     : String(40) not null     @title: 'COMPONENT';
            COMP_DESC     : String(40)              @title: 'COMP_DESC';
        key MODEL_VERSION : String(20) not null     @title: 'MODEL_VERSION';
            PERCENTAGE    : Decimal(34)             @title: 'PERCENTAGE';
            ASSEM_QTY     : Decimal(18, 3)          @title: 'ASSEM_QTY';
            IBP_DEMAND    : Decimal(18, 3) not null @title: 'IBP_DEMAND';
            ASMB_DESC     : String(40)              @title: 'ASMB_DESC';
            ASM_COM_QTY   : Integer                 @title: 'ASM_COM_QTY';
            COMP_QTY      : Decimal(28, 3)          @title: 'COMP_QTY';
            STRUC_NODE    : String(50)              @title: 'STRUC_NODE';
            ROW_COUNT     : Integer not null        @title: 'ROW_COUNT';
    }

    // Temporary staging table for Sales Configuration. This data will be moved to SALESH_CONFIG application
    entity SALESH_CONFIG_MASTER {
        key SALES_DOC     : String(10)  @title: 'Sales Document';
        key SALESDOC_ITEM : String(10)  @title: 'Sales Document Item'; // VP-1459 - Increased length of Sales Document Item
        key CHAR_NUM      : String(100) @title: 'Internal number Char.';
        key CHARVAL_NUM   : String(80)  @title: 'Internal number Char. Value ';
            CHAR_VALUE    : String(70)  @title: 'Char Value';
            PRODUCT_ID    : String(40)  @title: 'Product Id';
            // PROD_AVAILDATE : Date      @title : 'Prod Availability Date';
            CHANGED_DATE  : Date        @title: 'Changed Date';
            CHANGED_BY    : String(12)  @title: 'Changed By';
            CREATED_DATE  : Date        @title: 'Created Date';
            CREATED_BY    : String(12)  @title: 'Created By';
            CHANGED_TIME  : Time        @title: 'Changed Time';
            CREATED_TIME  : Time        @title: 'Created Time';
    };

    //Table to store delta of SALESH_CONFIG_MASTER
    entity SALESH_CONFIG_DELTA {
        key LOCATION_ID : String(4)  @title: 'Location ID';
        key PRODUCT_ID  : String(40) @title: 'Product Id';
        key WEEK_DATE   : Date       @title: 'Week Date';
    }

    // Object dep. Timeseries history
    /* To be reevaluated */
    entity TS_OBJDEPHDR {
        key CAL_DATE     : Date       @title: 'Date';
        key LOCATION_ID  : String(4)  @title: 'Location ID';
        key PRODUCT_ID   : String(40) @title: 'Product ID';
        key OBJ_TYPE     : String(2)  @title: 'Object Type';
        key OBJ_DEP      : String(30) @title: 'Object Dependency';
        key OBJ_COUNTER  : Integer    @title: 'Object Counter';
            SUCCESS      : Integer    @title: 'Count';
            SUCCESS_RATE : Double     @title: 'Sucess Rate';
    };

    // Timeseries Object dep. characteristics
    /* To be re-evaluated */
    entity TS_OBJDEP_CHARHDR {
        key CAL_DATE     : Date       @title: 'Date';
        key LOCATION_ID  : String(4)  @title: 'Location ID';
        key PRODUCT_ID   : String(40) @title: 'Product ID';
        key OBJ_TYPE     : String(2)  @title: 'Object Type';
        key OBJ_DEP      : String(30) @title: 'Object Dependency';
        key OBJ_COUNTER  : Integer    @title: 'Object Counter';
        key ROW_ID       : Integer    @title: ' Attribute Index';
            SUCCESS      : Integer    @title: 'Count';
            SUCCESS_RATE : Double     @title: 'Sucess Rate';
    };

    // Object dep. characteristics Timeseries- future
    entity TS_OBJDEP_CHARHDR_F {
        key CAL_DATE      : Date                        @title: 'Date';
        key LOCATION_ID   : String(4)                   @title: 'Location ID';
        key PRODUCT_ID    : String(40)                  @title: 'Product ID';
        key OBJ_TYPE      : String(2)                   @title: 'Object Type';
        key OBJ_DEP       : String(30)                  @title: 'Object Dependency';
        key OBJ_COUNTER   : Integer                     @title: 'Object Counter';
        key ROW_ID        : Integer                     @title: ' Attribute Index';
        key VERSION       : String(10)                  @title: 'Version';
        key SCENARIO      : String(32)                  @title: 'Scenario';
        key MODEL_VERSION : String(20) default 'Active' @title: 'Model Version';
            CHAR_NUM      : String(100);
            SUCCESS       : Double                      @title: 'Count';
            SUCCESS_RATE  : Double                      @title: 'Sucess Rate';
    };


    // PVS node master - Can be imported or maintained in VCP
    entity PVS_NODES : managed {
        key CHILD_NODE   : String(50); // @title : 'Child Node';
        key PARENT_NODE  : String(50); // @title : 'Parent Node';
            ACCESS_NODES : String(50);
            NODE_TYPE    : String(2); //  @title : 'Node Type';
            NODE_DESC    : String(200); //@tile  : 'Node Descriptions';
            AUTH_GROUP   : String(4); //  @title : 'Authorization Group';
            LOWERLIMIT   : Integer;
            UPPERLIMIT   : Integer;
    };

    // Product Access nodes - Can be imported or maintained in VCP
    entity PROD_ACCNODE : managed {
        key LOCATION_ID : String(4)  @title: 'Location ID';
        key PRODUCT_ID  : String(40) @title: 'Product ID';
            ACCESS_NODE : String(50) @title: 'Access Node';
    };

    // PVS for BOM - Can be imported or maintained in VCP
    entity PVS_BOM : managed {
        key LOCATION_ID : String(4)  @title: 'Location ID';
        key PRODUCT_ID  : String(40) @title: 'Product ID';
        key ITEM_NUM    : String(6)  @title: 'Item Number ';
        key COMPONENT   : String(40) @title: 'Component';
            STRUC_NODE  : String(50) @title: 'Structure Node'
    }

    // Order count on weekly basis for a location
    entity TS_ORDERRATE : managed {
        key WEEK_DATE   : Date      @title: 'Date';
        key LOCATION_ID : String(4) @title: 'Location ID';
            ORDER_COUNT : Integer   @title: 'Order Count';
    }

    // IBP Future demand - Demand will be received from IBP
    entity IBP_FUTUREDEMAND {
        key LOCATION_ID : String(4)      @title: 'Location ID';
        key PRODUCT_ID  : String(40)     @title: 'Product ID';
        key VERSION     : String(10)     @title: 'Version';
        key SCENARIO    : String(32)     @title: 'Scenario';
        key WEEK_DATE   : Date           @title: 'Weekly Date';
            QUANTITY    : Decimal(13, 3) @title: 'Demand Quantity';
    }

    // IBP Future demand at customer group level - Demand will be received from IBP
    entity IBP_FUTUREDEMAND_LOCPRODCUST {
        key LOCATION_ID    : String(4)      @title: 'Location ID';
        key PRODUCT_ID     : String(40)     @title: 'Product ID';
        key CUSTOMER_GROUP : String(20)     @title: 'Customer Group';
        key VERSION        : String(10)     @title: 'Version';
        key SCENARIO       : String(32)     @title: 'Scenario';
        key WEEK_DATE      : Date           @title: 'Weekly Date';
            QUANTITY       : Decimal(13, 3) @title: 'Demand Quantity';
    }

    // IBP Future characteristic plan - Received from IBP or can be maintained from VCP
    entity IBP_FCHARPLAN {
        key LOCATION_ID   : String(4)                   @title: 'Location ID';
        key PRODUCT_ID    : String(40)                  @title: 'Product ID';
        key CLASS_NUM     : String(20)                  @title: 'Class Name';
        key CHAR_NUM      : String(100)                 @title: 'Charateristic Name';
        key CHARVAL_NUM   : String(80)                  @title: 'Charateristic Value';
        key VERSION       : String(10)                  @title: 'Version';
        key SCENARIO      : String(32)                  @title: 'Scenario';
        key WEEK_DATE     : Date                        @title: 'Weekly Date';
        key MODEL_VERSION : String(20) default 'Active' @title: 'Model Version';
            OPT_PERCENT   : Decimal(5, 2)               @title: 'Option Percnetage';
            OPT_QTY       : Decimal(13, 3)              @title: 'Option Quantity';
            MANUALOPTION  : Decimal(5, 2)               @title: 'Manual Option Percnetage';
    }

    // PAL profiles
    entity PAL_PROFILEMETH {
        key PROFILE      : String(50)  @title: 'Profile';
            TYPE         : String(10)  @title: 'TYPE';
            METHOD       : String(50)  @title: 'Method Name';
            PRF_DESC     : String(200) @title: 'Profile Description';
            CREATED_DATE : Date        @title: 'Date';
            CREATED_BY   : String(50)  @title: 'Created By'
    }

    // PAL profile parameters
    entity PAL_PROFILEMETH_PARA {
        key PROFILE           : String(50);
        key METHOD            : String(50);
        key SUBMETHOD         : String(50);
        key PARA_NAME         : String(100);
            TYPE              : String(10);
            SUBMETHOD_PROFILE : String(100);
            INTVAL            : Integer;
            DOUBLEVAL         : Double;
            STRVAL            : String(20);
            PARA_DESC         : String(1000);
            PARA_DEP          : String(1000);
            CREATED_DATE      : Date;
            CREATED_BY        : String(12);
    }

    //PAL profile object dep. assigned to a structure node
    entity PAL_PROFILEOD : managed {
        key LOCATION_ID : String(4);
        key PRODUCT_ID  : String(40);
        key COMPONENT   : String(40);
        key PROFILE     : String(50);
        key OBJ_DEP     : String(30);
        key OBJ_TYPE    : String(2) default 'OD' @title: 'Object Type';
            STRUC_NODE  : String(50);
    }

    entity PAL_PROFILE_LOC_PROD : managed {
        key LOCATION_ID : String(4);
        key PRODUCT_ID  : String(40);
        key PROFILE     : String(50);
    }

    entity PROFILE_LOC_PROD {
        key LOCATION_ID          : String(4);
        key PRODUCT_ID           : String(40);
            PREDICTION_PROFILE   : String(50);
            PLANNING_PROFILE     : String(50);
            FORECASTING_PROFILE  : String(50);
            OPTION_PERCENT       : String(50);
            OPTIMIZATION_PROFILE : String(50);
            PERIOD_PROFILE       : String(30);
            DERIVED_PROFILE       : String(30);
            CREATED_DATE         : Date;
            CREATED_BY           : String(500) @title: 'Created By';
            CREATED_TIME         : Time        @title: 'Created Time';
            CHANGED_BY           : String(500) @title: 'Changed By';
            CHANGED_DATE         : Date;
            CHANGED_TIME         : Time        @title: 'Changed Time';


    }

    // Key Figure maintenance
    entity KEY_FIGURE_MASTER {
        key KEY_FIG_ID          : Integer                @title: 'Key Figure ID';
        key KEY_FIG_DESC        : String(100)            @title: 'Key Figure Name';
        key DISPLAY_ORDER       : Integer                @title: 'Display Order';
        key PRIORITY_ORDER      : Integer                @title: 'Sort Order';
        key KEY_DIFFERENCE      : String(4) default 'NA' @title: 'Key Difference';
            KEY_FIG_DESCRIPTION : String                 @title: 'Key Figure Description';
    }

    // Table to maintain Characteristic value buckets
    entity CHARVAL_BUCKET {
        key CHAR_NUM   : String(100) @title: 'Charateristic Name';
        key CHAR_VALUE : String(80)  @title: 'Charateristic Value';
            RANGE_FROM : Double      @title: 'From';
            RANGE_TO   : Double      @title: 'To';
            MEDIAN     : Double      @title: 'Median';
    }

    // Partial Product Header - Can be brough from ERP or manually created
    entity PARTIALPROD_INTRO {
        key PRODUCT_ID     : String(40) @title: 'New Product';
        key LOCATION_ID    : String(4)  @title: 'Location';
            PROD_TYPE      : String(4)  @title: 'Product Type';
            PROD_DESC      : String(40) @title: 'Product Description';
            REF_PRODID     : String(40) @title: ' Ref. Product';
            CONFIGPROD_CHK : String(1)  @title: 'ConfigProduct check';
            MANUAL         : String(1)  @title: 'Manual Record';
    }

    // Partial product fixed characteristics
    entity PARTIALPROD_CHAR {
        key PRODUCT_ID  : String(40)              @title: 'New Product';
        key LOCATION_ID : String(4)               @title: 'Location ';
        key CLASS_NUM   : String(20)              @title: 'Class Name';
        key CHAR_NUM    : String(100)             @title: 'Charateristic Name';
        key CHARVAL_NUM : String(80) default 'NA' @title: 'Charateristic Value';
        key CHAR_VALUE  : String(70) default 'NA' @title: 'Char Value';
    }

    // Partial product staging table for PARTIALPROD_CHAR
    entity PARTIALPROD_CHAR_MASTER {
        key PRODUCT_ID  : String(40)              @title: 'New Product';
        key LOCATION_ID : String(4)               @title: 'Location ';
        key CLASS_NUM   : String(20)              @title: 'Class Name';
        key CHAR_NUM    : String(100)             @title: 'Charateristic Name';
        key CHARVAL_NUM : String(80) default 'NA' @title: 'Charateristic Value';
        key CHAR_VALUE  : String(70) default 'NA' @title: 'Char Value';
    }

    // Characteristic prioritization tale
    entity VARCHAR_PS {
        key PRODUCT_ID   : String(40)  @title: 'New Product';
        key CHAR_NUM     : String(100) @title: 'Charateristic Name';
            CHAR_TYPE    : String(2)   @title: 'Characteristic Type';//Primary or Secondary
            SEQUENCE     : Integer     @title: 'Secondary Char. Position';
            GROUP_NAME   : String(100) @title: 'Group Name';
            CHANGED_BY   : String(50)  @title: 'Changed By';
            CHANGED_DATE : Date        @title: 'Changed Date';
            CHANGED_TIME : Time        @title: 'Changed Time';
            TYPE         : String(2)   @title:'Type';//Independent, dependent, Numeric or Multi Select
    }

    // Variant table - Table to be re-evaluated
    entity CUVTAB_IND {
        key VTINT : String(10) @title: 'Internal number of variant table';
        key INDID : String(4)  @title: 'Counter for value assignment alternative';
        key ATINN : String(10) @title: 'Internal characteristic';
    }

    // Variant table - Table to be re-evaluated
    entity CUVTAB_VALC {
        key VTINT : String(10) @title: 'Internal number of variant table';
        key SLNID : String(5)  @title: 'Counter for value assignment alternative';
        key ATINN : String(10) @title: 'Internal characteristic';
        key VLCNT : String(3)  @title: 'Characteristic value counter';
            VALC  : String(70) @title: 'Characteristic Value';
    }

    // Variant table - Table to be re-evaluated
    entity CUVTAB_VALC_TEMP {
        key VTINT : String(10) @title: 'Internal number of variant table';
        key SLNID : String(5)  @title: 'Counter for value assignment alternative';
        key ATINN : String(10) @title: 'Internal characteristic';
        key VLCNT : String(3)  @title: 'Characteristic value counter';
            VALC  : String(70) @title: 'Characteristic Value';
    }

    // Variant table - Table to be re-evaluated
    entity CUVTAB_FINAL {
        ATINN : String(10) @title: 'Internal characteristic';
        VALC  : String(70) @title: 'Characteristic Value';
    }

    // Unique ID Header
    entity UNIQUE_ID_HEADER {
        key UNIQUE_ID         : Integer     @title: 'Unique ID';
        key PRODUCT_ID        : String(40)  @title: 'New Product';
            UNIQUE_DESC       : String(100) @title: 'Description';
            UID_TYPE          : String(1)   @title: 'Primary Unique ID';
            UID_RATE          : Decimal(13, 2);
            ACTIVE            : Boolean;
            EX_IDENTIFICATION : String(40)  @title: 'External Identification';
            VALID_FROM        : Date        @title: 'Valid From';
            VALID_TO          : Date        @title: 'Valid To';
    }

    // Unique ID Characteristic
    entity UNIQUE_ID_ITEM {
        key UNIQUE_ID     : Integer                  @title: 'Unique ID';
        key PRODUCT_ID    : String(40)               @title: 'New Product';
        key CHAR_NUM      : String(100)              @title: 'Charateristic Name';
        key CHARVAL_NUM   : String(80)               @title: 'Charateristic Value';
        key CHAR_VALUE    : String(70) default 'NA'  @title: 'Char Value'  @Nullable: false;
            UID_CHAR_RATE : Decimal(13, 2);
    }


    // TMP Unique ID Header
    entity TMP_UNIQUE_ID_HEADER {
        key TMP_UNIQUE_ID   : String(10)     @title: 'Unique ID';
        key PRODUCT_ID      : String(40)     @title: 'New Product';
        key PROJECT_ID      : String(40)     @title: 'Project ID';
        key REF_UNIQUE_ID   : Integer        @title: 'Reference Unique ID';
            TMP_UNIQUE_DESC : String(100)    @title: 'Description';
            PARTIAL_PROD    : String(100)    @title: 'PArtial Product';
            WEIGHTAGE       : Decimal(10, 2) @title: 'Weightage';
            CONFIG          : LargeString    @title: 'Congig';
            ACTIVE          : Boolean;
            UID_TYPE        : String(1)      @title: 'Primary Unique ID';
            COPY_UID        : Integer        @title: 'Copy Unique ID';
            COPY_FLAG       : String(1)      @title: 'Copy UIF Flag';
            VALID_FROM      : Date           @title: 'Valid From';
            VALID_TO        : Date           @title: 'Valid To';
    }

    // // TMP Unique ID Characteristic
    // entity TMP_UNIQUE_ID_ITEM {
    //     key TMP_UNIQUE_ID : String(10)  @title: 'Unique ID';
    //     key PRODUCT_ID    : String(40)  @title: 'New Product';
    //     key PROJECT_ID    : String(40)  @title: 'Project ID';
    //     key REF_UNIQUE_ID : Integer     @title: 'Reference Unique ID';
    //     key CHAR_NUM      : String(100) @title: 'Charateristic Name';
    //     key CHARVAL_NUM   : String(80)  @title: 'Charateristic Value';
    //     key CHAR_VALUE    : String(80)  @title: 'Charateristic Value';
    //         // CHAR_NAME         : String(80);
    //         CHAR_DESC     : String(160);
    //         CHARVAL_DESC  : String(160);

    // }
    // Unique ID Header
    entity UNIQUE_ID_HEADER_NEW {
        key UNIQUE_ID         : Integer        @title: 'Unique ID';
        key PROJECT_ID        : String(40)     @title: 'Project ID';
        key PRODUCT_ID        : String(40)     @title: 'New Product';
        key REF_UNIQUE_ID     : Integer        @title: 'Reference Unique ID';
            UNIQUE_DESC       : String(100)    @title: 'Description';
            UID_TYPE          : String(1)      @title: 'Primary Unique ID';
            // UID_RATE          : Decimal(13, 2);
            WEIGHTAGE         : Decimal(10, 2) @title: 'Weightage';
            ACTIVE            : Boolean;
            EX_IDENTIFICATION : String(40)     @title: 'External Identification';
            VALID_FROM        : Date           @title: 'Valid From';
            VALID_TO          : Date           @title: 'Valid To';
            CONFIG            : LargeString    @title: 'Congig';
    }

    // Unique ID Characteristic
    entity UNIQUE_ID_ITEM_NEW {
        key UNIQUE_ID      : Integer     @title: 'Unique ID';
        key REF_UNIQUE_ID  : Integer     @title: 'Reference Unique ID';
        key PRODUCT_ID     : String(40)  @title: 'New Product';
        key CHAR_NUM       : String(100) @title: 'Charateristic Name';
            // key CHARVAL_NUM   : String(80)               @title: 'Charateristic Value';
        key CHAR_VALUE     : String(70)  @title: 'Char Value';
        key REF_CHAR_VALUE : String(70)  @title: 'Reference Char Value';
    // UID_CHAR_RATE : Decimal(13, 2);
    }


    // To be reevaluated
    entity UID_PRI_HEADER {
        key UNIQUE_ID   : Integer     @title: 'Unique ID';
        key PRODUCT_ID  : String(40)  @title: 'New Product';
            UNIQUE_DESC : String(100) @title: 'Description';
            UID_TYPE    : String(1)   @title: 'Primary Unique ID';
            ACTIVE      : Boolean;
    }

    // To be reevaluated
    entity UID_PRI_ITEM {
        key UNIQUE_ID   : Integer     @title: 'Unique ID';
        key PRODUCT_ID  : String(40)  @title: 'New Product';
        key CHAR_NUM    : String(100) @title: 'Charateristic Name';
            CHARVAL_NUM : String(80)  @title: 'Charateristic Value';
    }

    // New product introduction
    entity NEWPROD_INTRO {
        key PRODUCT_ID  : String(40) @title: 'New Product';
        key LOCATION_ID : String(4)  @title: 'Location';
            REF_PRODID  : String(40) @title: ' Ref. Product';
    }

    // New product characteristics
    entity NEWPROD_CHAR {
        key PRODUCT_ID      : String(40)  @title: 'New Product';
        key LOCATION_ID     : String(4)   @title: 'Location ';
        key CLASS_NUM       : String(20)  @title: 'Class Name';
        key CHAR_NUM        : String(100) @title: 'Charateristic Name';
        key CHARVAL_NUM     : String(80)  @title: 'Charateristic Value';
            REF_CLASS_NUM   : String(20)  @title: 'Class Name';
            REF_CHAR_NUM    : String(100) @title: 'Charateristic Name';
            REF_CHARVAL_NUM : String(80)  @title: 'Charateristic Value';
            REF_PRODID      : String(40)  @title: ' Ref. Product';
    }

    // Authorization object master
    entity USER_AUTHOBJ {
        key USER        : String(100) @title: 'User';
        key PARAMETER   : String(100) @title: 'Parameter';
        key AUTH_GROUP  : String(4)   @title: 'Authorization Object';
            DESCRIPTION : String(250) @title: 'Description';
    }

    // Roles for a user
    entity AUTH_EMP_ROLE : managed {
        key USER    : String(100) @title: 'User';
        key ROLE_ID : String(100) @title: 'Role ID';
    }

    // Roles master
    entity AUTH_ROLE : managed {
        key ROLE_ID     : String(100) @title: 'Role ID';
            DESCRIPTION : String(250) @title: 'Description';
    }

    // Authorization object for roles and its parameters
    entity AUTH_ROLE_OBJ : managed {
        key ROLE_ID       : String(100) @title: 'Role ID';
        key PARAMETER     : String(100) @title: 'Parameter';
        key PARAMETER_VAL : String(250) @title: 'Parameter';
    }

    entity PARAMETER_AUTH {
        key PARAMETER     : String(100) @title: 'Parameter';
            PARAMETER_VAL : String(250) @title: 'Parameter';
    }

    entity USERDETAILS {
        key username : String(50);
    }

    //Table to store user Preferences across applications - System Configuration
    entity USER_PREFERENCES {
        key PARAMETER       : String(50)  @title: 'Parameter';
            DESCRIPTION     : String(150) @title: 'Description';
            PARAMETER_VALUE : String(50)  @title: 'Parameter Value';
            TYPE            : String(10)  @title: 'Type Of Parameter';
            CREATED_DATE    : Date;
            CREATED_BY      : String      @title: 'Created By';
            CREATED_TIME    : Time;
            CHANGED_DATE    : Date;
            CHANGED_BY      : String      @title: 'Changed By';
            CHANGED_TIME    : Time;
    }

    // Restriction header
    entity RESTRICT_HEADER {
        key LOCATION_ID  : String(4)  @title: 'Location ';
        key LINE_ID      : String(40) @title: 'Line';
        key RESTRICTION  : String(30) @title: 'Restriction';
            RTR_DESC     : String(30) @title: 'Restriction Desc';
            RTR_TYPE     : String(10) @title: 'Restriction Type';
            RTR_QTY      : Integer    @title: 'Component Quantity';
            VALID_FROM   : Date       @title: 'Valid From';
            VALID_TO     : Date       @title: 'Valid To';
            CHANGED_DATE : Date       @title: 'Changed Date';
            CHANGED_BY   : String     @title: 'Changed By';
            CREATED_DATE : Date       @title: 'Created Date';
            CREATED_BY   : String     @title: 'Created By';
            CHANGED_TIME : Time       @title: 'Changed Time';
            CREATED_TIME : Time       @title: 'Created Time';
    }

    // Restriction details - restriction rules
    entity RESTRICT_DETAILS {
        key LOCATION_ID  : String(4)               @title: 'Location ';
        key LINE_ID      : String(40)              @title: 'Line';
        key RESTRICTION  : String(30)              @title: 'Restriction';
        key RTR_COUNTER  : Integer                 @title: 'Restriction Counter';
        key CLASS_NUM    : String(18)              @title: 'Internal class number';
        key CHAR_NUM     : String(100)             @title: 'Internal Char. number';
        key CHAR_COUNTER : Integer                 @title: 'Characteristic counter';
        key CHARVAL_NUM  : String(80)              @title: 'Internal Char. number';
        key CHAR_VALUE   : String(80) default 'NA' @title: 'Characteristic Value';
            OD_CONDITION : String(2)               @title: 'Restriction condition ';
            ROW_ID       : Integer                 @title: 'Attribute Index ';
            QUANTITY     : Integer                 @title: 'Quantity';
            CHANGED_DATE : Date                    @title: 'Changed Date';
            CHANGED_BY   : String                  @title: 'Changed By';
            CREATED_DATE : Date                    @title: 'Created Date';
            CREATED_BY   : String                  @title: 'Created By';
            CHANGED_TIME : Time                    @title: 'Changed Time';
            CREATED_TIME : Time                    @title: 'Created Time';
    };

    // Location-Product-Line mapping for Restrictions
    entity PROD_LOC_LINE {
        key LOCATION_ID  : String(4)  @title: 'Location ';
        key LINE_ID      : String(40) @title: 'Line';
        key PRODUCT_ID   : String(40) @title: 'Product';
            CHANGED_DATE : Date       @title: 'Changed Date';
            CHANGED_BY   : String     @title: 'Changed By';
            CREATED_DATE : Date       @title: 'Created Date';
            CREATED_BY   : String     @title: 'Created By';
            CHANGED_TIME : Time       @title: 'Changed Time';
            CREATED_TIME : Time       @title: 'Created Time';
    };

    // Line master
    entity LINEMASTER {
        key LOCATION_ID  : String(4)  @title: 'Location ';
        key LINE_ID      : String(40) @title: 'Line';
            LINE_DESC    : String(30) @title: 'Line Desc';
            CHANGED_DATE : Date       @title: 'Changed Date';
            CHANGED_BY   : String     @title: 'Changed By';
            CREATED_DATE : Date       @title: 'Created Date';
            CREATED_BY   : String     @title: 'Created By';
            CHANGED_TIME : Time       @title: 'Changed Time';
            CREATED_TIME : Time       @title: 'Created Time';
    };

    // Line capacity maintenance
    entity LINECAPACITY {
        key LOCATION_ID  : String(4)  @title: 'Location';
        key LINE_ID      : String(40) @title: 'Line';
        key PRODID       : String(40) @title: 'Partial Product';
            CAPACITY     : Integer    @title: 'Capacity';
            VALID_FROM   : Date       @title: 'Valid From';
            VALID_TO     : Date       @title: 'Valid To';
            CHANGED_DATE : Date       @title: 'Changed Date';
            CHANGED_BY   : String     @title: 'Changed By';
            CREATED_DATE : Date       @title: 'Created Date';
            CREATED_BY   : String     @title: 'Created By';
            CHANGED_TIME : Time       @title: 'Changed Time';
            CREATED_TIME : Time       @title: 'Created Time';
    };

    // Forecast Orders
    entity CIR_GENERATED {
        key LOCATION_ID         : String(4)      @title: 'Location ';
        key PRODUCT_ID          : String(40)     @title: 'Product';
        key WEEK_DATE           : Date           @title: 'Week Date';
        key CIR_ID              : Integer        @title: 'CIR ID';
        key MODEL_VERSION       : String(20)     @title: 'MODEL_VERSION';
        key VERSION             : String(10)     @title: 'Version';
        key SCENARIO            : String(32)     @title: 'Scenario';
            UNIQUE_ID           : Integer        @title: 'Unique ID';
            CIR_QTY             : Integer        @title: 'Quantity';
            BFORECHNG_CIRQTY    : Integer        @title: 'Before change CIR qty';
            SNAPSHOT_CHK        : String(1)      @title: 'Snapshot check';
            ACTUAL_QTY          : Integer        @title: 'Actual Quantity';
            UNCONSUMED_FORECAST : Integer        @title: 'UnConsumed Forecast';
            PRODORD_QTY         : Decimal(13, 3) @title: 'Production Orders Quantity';
            OPEN_ASSEMBLY       : Integer        @title: 'Open For Assembly';
            COMMENTS            : String(250)    @title: 'Comments';
    }

    // Derived Characteristics storage table
    entity MARKETAUTH_CFG {
        key WEEK_DATE   : Date        @title: 'Week Date';
        key LOCATION_ID : String(4)   @title: 'Location ';
        key PRODUCT_ID  : String(40)  @title: 'Product';
        key CLASS_NUM   : String(18)  @title: 'Internal class number';
        key CHAR_NUM    : String(100) @title: 'Internal Char. number';
        key CHARVAL_NUM : String(80)  @title: 'Internal Char. number';
        key VERSION     : String(10)  @title: 'Version';
        key SCENARIO    : String(32)  @title: 'Scenario';
            OPT_PERCENT : Double      @title: 'Option Percentage';
    }

    // Seed Order header
    entity SEEDORDER_HEADER {
        key SEED_ORDER     : String(10)     @title: 'Seed Order';
        key LOCATION_ID    : String(4)      @title: 'Location ';
            PRODUCT_ID     : String(40)     @title: 'Product';
            CUSTOMER_GROUP : String(20)     @title: 'Customer Group';
            UNIQUE_ID      : Integer        @title: 'Unique ID';
            ORD_QTY        : Decimal(13, 3) @title: 'Ordered Qty';
            MAT_AVAILDATE  : Date           @title: 'Material Avail. Date';
            CREATED_DATE   : Date           @title: 'Seed Order created Date';
    }

    // Planning configuration
    // Groups Header
    entity PLANNED_GROUPS {
        key GROUP_ID          : Integer;
            GROUP_DESCRIPTION : String(100);
            UNIT              : String(5);
    }

    // Group Parameters
    entity PLANNED_PARAMETERS {
            GROUP          : Association to PLANNED_GROUPS
                                 on GROUP.GROUP_ID = GROUP_ID;
        key PARAMETER_ID   : Integer;
        key GROUP_ID       : Integer;
        key SEQUENCE       : Integer;
            DESCRIPTION    : String(100);
            MIN_VALUE      : Integer;
            MAX_VALUE      : Integer;
            VALUE_HELP     : Boolean;
            VALUE_HELP_TAB : String(20);
    }

    // Execution Method
    entity METHOD_TYPES {
        key METHOD_TYP  : String(2);
            DESCRIPTION : String(20);
    }

    // Parameters Values
    entity PARAMETER_VALUES {
        key LOCATION_ID  : String(4);
        key PARAMETER_ID : Integer;
            VALUE        : String(500);
    }

    // Global Planning configuration
    entity GLOBAL_PLANG_CONFIG {
        key PARAMETER_ID : Integer;
            VALUE        : String(500);
    }

    // Location hierarchy
    entity FACTORY_SALESLOC {
        key LOCATION_ID : String(4)  @title: 'Demand Location ';
        key PRODUCT_ID  : String(40) @title: 'Product';
        key PLAN_LOC    : String(4)  @title: 'Planning Location ';
        key FACTORY_LOC : String(4)  @title: 'Factory Location ';
    }

    // Assembly requirements
    entity ASSEMBLY_REQ {
        key LOCATION_ID   : String(4)              @title: 'Location ';
        key PRODUCT_ID    : String(40)             @title: 'Product';
        key ITEM_NUM      : String(6)              @title: 'ITEM_NUM';
        key COMPONENT     : String(40)             @title: 'COMPONENT';
        key WEEK_DATE     : Date                   @title: 'Week Date';
        key MODEL_VERSION : String(20)             @title: 'MODEL_VERSION';
        key VERSION       : String(10)             @title: 'Version';
        key SCENARIO      : String(32)             @title: 'Scenario';
        key TYPE          : String(2)              @title: 'Object Type';
            REF_PRODID    : String(40)             @title: ' Ref. Product';
        key FACTORY_LOC   : String(4) default 'NA' @title: 'Factory Location';
        key UNIQUE_ID     : Integer default 0      @title: 'Unique Id';
            CIR_QTY       : Integer                @title: 'CIR QTY';
            COMPCIR_QTY   : Decimal(13, 3)         @title: 'CIR Component QTY';
            ACTUAL_QTY    : Integer                @title: 'Actual Quantity';
            FINAL_ASS   : String(1)    default ''  @title: 'Final Assembly';
    }

    // To be reevaluated
    entity SEEDORDER_ERRORLOG {
        key ID             : String(20) @title: 'ID';
        key LOCATION_ID    : String(4)  @title: 'Demand Location ';
        key PRODUCT_ID     : String(40) @title: 'Product';
        key CUSTOMER_GROUP : String(20) @title: 'Customer Group';
        key UNIQUE_ID      : Integer    @title: 'Unique ID';
            ERROR          : String(40) @title: 'Error Description';
            CREATED_DATE   : Date       @title: 'Created Date';
    }

    // Critical components
    entity CRITICAL_COMP {
        key LOCATION_ID          : String(4)  @title: 'Location ';
        key PRODUCT_ID           : String(40) @title: 'Product';
        key ITEM_NUM             : String(6)  @title: 'ITEM_NUM';
        key ASSEMBLY             : String(40) @title: 'Assembly';
        key COMPONENT            : String(40) @title: 'Component';
            COMP_DESC            : String(40) @title: 'Component Desc';
            CRITICALKEY          : String(1);
            ASSEMBLY_CRITICALKEY : String(1);
    }

    // Final table for derived characteristics
    entity DEF_MKTAUTH {
        key LOCATION_ID : String(4)   @title: 'Location ';
        key PRODUCT_ID  : String(40)  @title: 'Product';
        key CLASS_NUM   : String(18)  @title: 'Internal class number';
        key CHAR_NUM    : String(100) @title: 'Internal Char. number';
        key CHARVAL_NUM : String(80)  @title: 'Internal Char. number';
            OPT_PERCENT : Double      @title: 'Option Percentage';
    }

    entity CIRLOG {
        key PRODUCT_ID  : String(40)     @title: 'Product';
        key CIR_ID      : Integer        @title: 'CIR ID';
        key LOCATION_ID : String(4)      @title: 'Location ';
        key UNIQUE_ID   : Integer        @title: 'Unique ID';
        key WEEK_DATE   : Date           @title: 'Week Date';
        key CUST_PRODID : String(40)     @title: 'Partial Product';
            USER_ID     : String(241)    @title: 'Email Id / S-USER Id';
            COMPCIR_QTY : Decimal(13, 3) @title: 'CIR Component QTY';
            MSG_TYP     : String(1)      @title: 'Message Type';
            MESSAGE     : String(220)    @title: 'Message';
    }

    // Documentation header - to be reevaluated as this is moved to independent application
    entity PAGEHEADER {
        key PAGEID         : Integer;
            DESCRIPTION    : String(100);
            PARENTNODEID   : Integer;
            HEIRARCHYLEVEL : Integer;
    }

    // Documentation content - to be reevaluated as this is moved to independent application
    entity PAGEPARAGRAPH {
        key PAGEID      : Integer;
            DESCRIPTION : String(100);
            CONTENT     : hana.CLOB;
    }

    //IBP Version & Scenario and VCP Version mapping
    entity VERSION_DEMANDVERSION {
        key BTP_VERSION    : String(100) @title: 'Version';
        key BTP_SCENARIO   : String(100) @title: 'Scenario';
        key DEMAND_VERSION : String(100) @title: 'Demand Version';
        key ACTIVE         : String(100) @title: 'Active';
    }

    // Import IBP Version and Scenario
    entity IBPVERSIONSCENARIO {
        key VERSION       : String(10) @title: 'Version';
        key SCENARIO      : String(32) @title: 'Scenario';
            VERSION_NAME  : String(50) @title: 'Version_Name';
            SCENARIO_NAME : String(50) @title: 'Scenario_Name';
    };

    //Variant Tables - Header
    entity CREATEVARIANTHEADER {
        key VARIANTID        : Integer     @title: 'Variant ID';
        key VARIANTNAME      : String(100) @title: 'Variant Name';
        key USER             : String(100) @title: 'User';
            APPLICATION_NAME : String(100) @title: 'Application_Name';
            DEFAULT          : String(2)   @title: 'Default';
            SCOPE            : String(20)  @title: 'Scope';
    };

    //Variant Tables - Item
    entity CREATEVARIANT {
        key VARIANTID    : Integer     @title: 'Variant ID';
        key FIELD        : String(100) @title: 'Field';
        key FIELD_CENTER : String(100) @title: 'Field_Center';
        key VALUE        : String(100) @title: 'Value';
    };

    // IBP Product Attributes
    entity IBPCHAR_PS {
        key PRODUCT_ID : String(40)  @title: 'Configurable Product';
        key CHAR_NUM   : String(100) @title: 'Charateristic Name';
            CHAR_TYPE  : String(2)   @title: 'Characteristic Type';
            SEQUENCE   : Integer     @title: 'Secondary Char. Position';
    }

    // Component Availability
    entity COMPONENT_AVAIL {
        key WEEK_DATE     : Date       @title: 'Week Date';
        key LOCATION_ID   : String(4)  @title: 'Location ';
        key COMPONENT     : String(40) @title: 'Component';
            COMPAVAIL_QTY : Integer; //Decimal(13, 3);
    }

    // Restriction Availability
    entity RESTRICTION_AVAIL {
        key WEEK_DATE            : Date       @title: 'Week Date';
        key LOCATION_ID          : String(4)  @title: 'Location ';
        key RESTRICTION          : String(40) @title: 'Restriction';
            RESTRICTIONAVAIL_QTY : Integer;
    }

    // IBP Calendar
    entity IBPCALENDER_WEEK {
        key TPLEVEL        : Integer;
        key PERIODID       : String(8) @title: 'Week Date';
            LEVEL          : String(1); // Added new field for Telescopic
            PERIODSTART    : Timestamp;
            PERIODEND      : Timestamp;
            PERIODDESC     : String(50);
            WEEKWEIGHT     : Integer;
            MONTHWEIGHT    : Integer; // Added new field for Telescopic
            WEEK_STARTDATE : Date      @title: 'Week Date';
            WEEK_ENDDATE   : Date      @title: 'Week Date';
    }

    // IBP Calendar
    entity DUMMY_IBPCALENDER_WEEK {
        key TPLEVEL        : Integer;
        key PERIODID       : String(8) @title: 'Week Date';
            PERIODSTART    : Timestamp;
            PERIODEND      : Timestamp;
            PERIODDESC     : String(50);
            WEEKWEIGHT     : Integer;
            MONTHWEIGHT    : Integer;
            WEEK_STARTDATE : Date      @title: 'Week Date';
            WEEK_ENDDATE   : Date      @title: 'Week Date';
    }

    // Staging table for Derived Characteristics DERIVEDCHAR
    entity DERIVEDCHAR_MASTER {
        key PRODUCT_ID   : String(40);
        key RECORD_TYPE  : String(2);
        key CLAUSE       : String(2);
        key DEP_NAME     : String(30);
        key CLASS_NUM    : String(18) @title: 'Internal class number';
        key CHAR_NUM     : String(100);
        key CHARVAL_NUM  : String(80);
        key CHAR_VALUE   : String(70) default 'NA';
        key SORT_COUNTER : String(4);
        key CHAR_COUNTER : Integer;
            OD_CONDITION : String(2);
            RULE_TYPE    : String(30);
            CHANGE_NO    : String(12);
        key VALID_FROM   : Date       @title: 'Valid From';
            VALID_TO     : Date       @title: 'Valid To';
            CHANGED_DATE : Date;
            CHANGED_BY   : String(50);
            CREATED_DATE : Date;
            CREATED_BY   : String(50);
            CHANGED_TIME : Time;
            CREATED_TIME : Time;
    }


    // Derived characteristic rules
    entity DERIVEDCHAR {
        key PRODUCT_ID   : String(40);
        key RECORD_TYPE  : String(2);
        key CLAUSE       : String(2);
        key DEP_NAME     : String(30);
        key CLASS_NUM    : String(18) @title: 'Internal class number';
        key CHAR_NUM     : String(100);
        key CHARVAL_NUM  : String(80);
        key CHAR_VALUE   : String(70) default 'NA';
        key SORT_COUNTER : String(4);
        key CHAR_COUNTER : Integer;
            OD_CONDITION : String(2);
            RULE_TYPE    : String(30);
            CHANGE_NO    : String(12);
        key VALID_FROM   : Date       @title: 'Valid From';
            VALID_TO     : Date       @title: 'Valid To';
            CHANGED_DATE : Date;
            CHANGED_BY   : String(50);
            CREATED_DATE : Date;
            CREATED_BY   : String(50);
            CHANGED_TIME : Time;
            CREATED_TIME : Time;
    }

    // Derived Characteristic percentages
    entity DERIVED_PERCENTAGE {
        key LOCATION_ID : String(4)  @title: 'Location ';
        key PRODUCT_ID  : String(40);
        key DEP_NAME    : String(30);
        key CLASS_NUM   : String(18) @title: 'Internal class number';
        key CHAR_NUM    : String(100);
        key CHARVAL_NUM : String(80);
        key CHAR_VALUE  : String(70) default 'NA';
            SUCCESS_PER : Double     @title: 'Success Percentage';
            FAILED_PER  : Double     @title: 'Failed Percentage';
    }

    entity SDIERROR_LOGS {
        key KEY1         : String(20);
        key KEY2         : String(20);
        key ERROR_DATE   : Date;
        key ERROR_TIME   : Timestamp;
            ERROR_REASON : String(100);
            FG_NAME      : String(40);
    }

    entity SDIERROR_LOGS_FG {
        key KEY1         : String(20);
        key KEY2         : String(20);
        key ERROR_DATE   : Date;
        key ERROR_TIME   : Timestamp;
            ERROR_REASON : String(100);
            FG_NAME      : String(40);
    }

    entity OPTION_PERCENTAGE {
        key LOCATION_ID    : String(4);
        key PRODUCT_ID     : String(40);
        key CUSTOMER_GROUP : String(40);
        key CLASS_NUM      : String(20);
        key CHAR_NUM       : String(100);
        key CHARVAL_NUM    : String(80);
        key VERSION        : String(10);
        key SCENARIO       : String(32);
        key MODEL_VERSION  : String(20);
        key WEEK_DATE      : Date;
        key TYPE           : Integer;
            OPT_PERCENT    : Decimal(5, 2);
            OPT_QTY        : Decimal(13, 3);
            LOCK           : Boolean;
            COMMENTS       : String;
            USER           : String;
            OLD_VALUE      : Decimal(5, 2);
            DATE_TIME      : DateTime;
    }

    entity ASMBCONS_REQ {
        LOCATION_ID : String(4);
        PRODUCT_ID  : String(40);
        CLASS_NUM   : String(18);
        CHAR_NUM    : String(100);
        CHARVAL_NUM : String(80);
        WEEK_DATE   : Date;
        VERSION     : String(10);
        PER_TYPE    : String(1);
        PERCENTAGE  : Integer;
    }

    // Table to Store Master Data for Assembly to be Sent to IBP
    entity IBPMDT_ASSEMBLY {
        key LOCID           : String(4);
        key PRDID           : String(40);
        key PRDFR           : String(40);
        key VCSTRUCTURENODE : String(50);
        key VCSOURCEID      : String(50);
    }

    // Validity Dates For Product Config
    entity PARTIALPROD_CHAR_VALIDITY {
        key PRODUCT_ID  : String(40);
        key CLASS_NUM   : String(18);
        key CHAR_NUM    : String(100);
        key CHARVAL_NUM : String(80);
        key CHAR_VALUE  : String(70) default 'NA';
            VALID_FROM  : Date;
            VALID_TO    : Date;

    }

    // Unique ID assemblies
    entity BOM_UID {
        key LOCATION_ID : String(4);
        key PRODUCT_ID  : String(40);
        key UNIQUE_ID   : Integer    @title: 'Unique ID';
        key ITEM_NUM    : String(6);
        key ASSEMBLY    : String(40) @title: 'ASSEMBLY';
        key VALID_FROM  : Date;
        key VALID_TO    : Date;
            RULE_TYPE   : String(2);
            ASMB_QTY    : Decimal(13, 3);
            REF_PRODID  : String(40);
        key FACTORY_LOC : String(4);
            FINAL_ASS   : String(1)    default ''  @title: 'Final Assembly';
    }

    // Grouping of Months and Dates for Dynamic Frozen and Firm Horizon
    entity DYNAMIC_FROZEN_FIRM_GROUPTAB {
        key GROUP_NAME : String(40) @title: 'Group Name';
        key GROUP_ID   : String(20) @title: 'Group ID';
        key FROM_DATE  : Date       @title: 'From Date';
        key TO_DATE    : Date       @title: 'To Date';
    }

    // Snapshot Header
    entity SNAPSHOT_HEAD {
        key SNAP_TIMESTAMP : Timestamp              @title: 'Snapshot Timestamp';
            SNAPSHOT_DESC  : String(60)             @title: 'Snapshot Description';
            FROM_DATE      : Date                   @title: 'From Date';
            TO_DATE        : Date                   @title: 'To Date';
        key TYPE           : String(5) default 'NA' @title: 'Snapshot Type'
    }

    // Snapshot Data
    entity SNAPSHOT_DATA {
        key SNAP_TIMESTAMP      : Timestamp      @title: 'Snapshot Timestamp';
        key LOCATION_ID         : String(4);
        key PRODUCT_ID          : String(40);
        key UNIQUE_ID           : Integer        @title: 'Unique ID';
        key WEEK_DATE           : Date;
            CIR_QTY             : Integer        @title: 'Quantity';
            ACTUAL_QTY          : Integer        @title: 'Actual Quantity';
            UNCONSUMED_FORECAST : Integer        @title: 'Unconsumed Forecast';
            PRODORD_QTY         : Decimal(13, 3) @title: 'Production Order Quantity';
    }

    entity ASMB_SNAPSHOT_DATA {
        key SNAP_TIMESTAMP : Timestamp              @title: 'Snapshot Timestamp';
        key LOCATION_ID    : String(4)              @title: 'Location ';
        key PRODUCT_ID     : String(40)             @title: 'Product';
        key ITEM_NUM       : String(6)              @title: 'Item Number';
        key COMPONENT      : String(40)             @title: 'Component';
        key WEEK_DATE      : Date                   @title: 'Week Date';
        key UNIQUE_ID      : Integer default 0      @title: 'Unique ID';
            MODEL_VERSION  : String(20)             @title: 'Model Version';
            VERSION        : String(10)             @title: 'Version';
            SCENARIO       : String(32)             @title: 'Scenario';
        key TYPE           : String(2)              @title: 'Object Type';
            REF_PRODID     : String(40)             @title: 'Ref. Product';
        key FACTORY_LOC    : String(4) default 'NA' @title: 'Factory Location';
            CIR_QTY        : Integer                @title: 'CIR QTY';
            COMPCIR_QTY    : Decimal(13, 3)         @title: 'CIR Component QTY';
            ACTUAL_QTY     : Integer                @title: 'Actual Quantity';
    }

    entity COMP_SNAPSHOT_DATA {
        key SNAP_TIMESTAMP : Timestamp               @title: 'Snapshot Timestamp';
        key FACTORY_LOC    : String(4) default 'NA'  @title: 'Factory Location';
        key LOCATION_ID    : String(4)               @title: 'Location ';
        key PRODUCT_ID     : String(40)              @title: 'Product';
        key COMPONENT      : String(40)              @title: 'Component';
        key WEEK_DATE      : Date                    @title: 'Week Date';
            MODEL_VERSION  : String(20)              @title: 'Model Version';
            VERSION        : String(10)              @title: 'Version';
            SCENARIO       : String(32)              @title: 'Scenario';
            CIR_QTY        : Integer                 @title: 'CIR QTY';
            COMP_QTY       : Decimal(13, 3)          @title: 'CIR Component QTY';
            IBP_DEMAND     : Decimal(18, 3) not null @title: 'IBP_DEMAND';
            PERCENTAGE     : Decimal(34)             @title: 'PERCENTAGE';
    }

    entity RTR_SNAPSHOT_DATA {
        key SNAP_TIMESTAMP : Timestamp              @title: 'Snapshot Timestamp';
        key LOCATION_ID    : String(4)              @title: 'Location ';
        key PRODUCT_ID     : String(40)             @title: 'Product';
        key ITEM_NUM       : String(6)              @title: 'Item Number';
        key COMPONENT      : String(40)             @title: 'Component';
        key WEEK_DATE      : Date                   @title: 'Week Date';
            MODEL_VERSION  : String(20)             @title: 'Model Version';
            VERSION        : String(10)             @title: 'Version';
            SCENARIO       : String(32)             @title: 'Scenario';
        key TYPE           : String(2)              @title: 'Object Type';
            REF_PRODID     : String(40)             @title: 'Ref. Product';
        key FACTORY_LOC    : String(4) default 'NA' @title: 'Factory Location';
            CIR_QTY        : Integer                @title: 'CIR QTY';
            COMPCIR_QTY    : Decimal(13, 3)         @title: 'CIR Component QTY';
    }

    entity FD_SNAPSHOT_DATA {
        key SNAP_TIMESTAMP : Timestamp      @title: 'Snapshot Timestamp';
        key LOCATION_ID    : String(4)      @title: 'Location ';
        key PRODUCT_ID     : String(40)     @title: 'Product';
        key WEEK_DATE      : Date           @title: 'Week Date';
            VERSION        : String(10)     @title: 'Version';
            SCENARIO       : String(32)     @title: 'Scenario';
            QUANTITY       : Decimal(13, 3) @title: 'Demand Quantity';
    }

    entity OPT_SNAPSHOT_DATA {
        key SNAP_TIMESTAMP : Timestamp      @title: 'Snapshot Timestamp';
        key LOCATION_ID    : String(4)      @title: 'Location ';
        key PRODUCT_ID     : String(40)     @title: 'Product';
        key CUSTOMER_GROUP : String(40)     @title: 'Customer Group';
        key MODEL_VERSION  : String(20)     @title: 'Model Version';
        key CLASS_NUM      : String(20)     @title: 'Class Name';
        key CHAR_NUM       : String(100)    @title: 'Charateristic Name';
        key CHARVAL_NUM    : String(80)     @title: 'Charateristic Value';
        key VERSION        : String(10)     @title: 'Version';
        key TYPE           : Integer        @title: 'Key Figure Type';
        key SCENARIO       : String(32)     @title: 'Scenario';
        key WEEK_DATE      : Date           @title: 'Weekly Date';
            OPT_PERCENT    : Decimal(5, 2)  @title: 'Option Percnetage';
            OPT_QTY        : Decimal(13, 3) @title: 'Option Quantity';
    }


    // Partial Product Characteristic restriction
    // Only characteristic values that are maintained in this table will be imported for partial product
    entity PRODUCT_CHAR_VAL {
        key PRODUCT_ID   : String(40) @title: 'Product';
        key CHAR_NAME    : String(40) @title: 'Characteristic Name';
        key CHAR_DESC    : String(40) @title: 'Characteristic Description';
        key CHAR_VALUE   : String(70) @title: 'Characteristic Value';
        key CHARVAL_DESC : String(40) @title: 'Characteristic Value Description';
        key CHAR_NUM     : String(40) @title: 'Characteristic Number';
        key CHARVAL_NUM  : String(70) @title: 'Characteristic Value Number';
        key CLASS_DESC   : String(40) @title: 'Class Description';
        key CLASS_NAME   : String(40) @title: 'Class Name';
            CHANGED_BY   : String(50) @title: 'Changed By';
            CHANGED_DATE : Date       @title: 'Changed Date';
            CHANGED_TIME : Time       @title: 'Changed Time';

    }

    // User Visibility Roles
    entity USER_APPVISIBLITY_ROLES {
        key USER       : String(100) @title: 'User';
            CREATE_CHK : String(10)  @title: 'Create Check';
            UPDATE_CHK : String(10)  @title: 'Update Check';
            DELETE_CHK : String(10)  @title: 'Delete Check';
            READ_CHK   : String(10)  @title: 'Read Check';
            LEVEL      : String(1)   @title: 'Level Check';
            UPDATED_TIME : Timestamp @title: 'Last Updated Timestamp';
            LOGON_TIME  : Timestamp  @title: 'Last Login Timestamp';
            ROLES      : Composition of USER_ROLES
                             on ROLES.USER = $self.USER;
    }

    // Seed Order Option Percentage
    entity CHAR_VALUE_OPTPERCENT {
        key CHAR_NUM    : String(100);
        key CHARVAL_NUM : String(80);
        key PRODUCT_ID  : String(40) default 'NA' @title: 'Product';
            OPT_PERCENT : Double                  @title: 'Option Percentage';
            OPT_QTY     : Integer                 @title: 'Option Quantity';
    }

    // Unique ID and Rules validity
    entity UNIQUEID_RULE_VALIDITY {
        key UNIQUE_ID  : Integer    @title: 'UNIQUE_ID';
        key DEP_NAME   : String(30) @title: 'DEP_NAME';
            VALID_FROM : Date       @title: 'VALID_FROM';
            VALID_TO   : Date       @title: 'VALID_TO';
    }

    // Seed order Product Characteristics
    entity LOC_PROD_CHARACTERISTICS {
        key LOCATION_ID  : String(4)   @title: 'Location';
        key PRODUCT_ID   : String(40)  @title: 'Product';
        key CHAR_NUM     : String(160) @title: 'Characteristic Number';
        key CHAR_VALUE   : String(160) @title: 'Characteristic Value';
            CHAR_DESC    : String(160) @title: 'Characteristic Description';
            CHARVAL_DESC : String(160) @title: 'Characteristic Value Description';
        key CHARVAL_NUM  : String(160) @title: 'Characteristic Value Number';
    }


    // BOM Materials
    entity BOM_MAT {
        key LOCATION_ID    : String(4)      @title: 'Location '; //Association to ZLOCATION;//
            // key PRODUCT_ID    : String(40)     @title: 'Material Number';
        key COUNTER        : String(6)      @title: 'Item Number';
        key MAT_PARENT     : String(40)     @title: 'Parent Material';
        key MAT_CHILD      : String(40)     @title: 'Child Material';
        key VALID_FROM     : Date           @title: 'Valid From';
            VALID_TO       : Date           @title: 'Valid To';
            CHILD_LOC      : String(4)      @title: 'Child Location';
            // MRP_GROUP     : String(4)      @title: 'MRP Group';
            // MRP_TYPE      : String(2)      @title: 'MRP TYPE';
            COMP_TYPE      : String(4)      @title: 'Component Product Type';
            PHANTOM_IND    : String(1)      @title: 'Phantom Indicator';
            CONFIGURABLE   : String(1)      @title: 'Configurable';
            CLASS_FLG      : String(1)      @title: 'Class Flag';
            PROD_DESC      : String(40)     @title: 'Product Description';
            COMPONENT_QTY  : Decimal(13, 3) @title: 'Component Quantity';
            CRITICAL_ASM   : String(1)      @title: 'Critical Assembly';
            // COMP_FLAG     : String(1)      @title: 'Component Flag';
            COMPONENT_FLAG : String(1)      @title: 'Component Flag';
            CHANGE_NO      : String(12)     @title: 'Change Number';
            DELETE_FLAG    : String(1)      @title: 'Delete Flag';
            CHANGE_FLAG    : String(1)      @title: 'Change Flag';
    }

    // BOM Object Dependency header
    entity BOM_OD {
        key LOCATION_ID : String(4)      @title: 'Location '; //Association to ZLOCATION;//
            // key CONFIG_MAT  : String(40)     @title: 'Material Number';
        key COUNTER     : String(6)      @title: 'Item Number';
        key MAT_PARENT  : String(40)     @title: 'Parent Matrial';
        key MAT_CHILD   : String(40)     @title: 'Child Material';
        key OBJ_DEP     : String(30)     @title: 'Object Dependency';
        key VALID_FROM  : Date           @title: 'Valid From';
            VALID_TO    : Date           @title: 'Valid To';
            OBJDEP_DESC : String(30)     @title: 'Object Dependency Desc';
            COMP_QTY    : Decimal(13, 3) @title: 'Component Quantity';
            CHANGE_NO   : String(12)     @title: 'Change Number';
    }

    // BOM Object Dependency rules
    entity BOM_DEP {
        key DEPENDENCY     : String(30)  @title: 'Object Dependency';
        key DEP_COUNTER    : Integer     @title: 'Dependency Counter';
        key CHAR_NUM       : String(100) @title: 'Characteristic Number';
        key CHAR_COUNTER   : Integer     @title: 'Char Counter';
        key CHAR_VAL       : String(70)  @title: 'Characteristic Value';
            REF_CHAR_VALUE : String(70)  @title: 'Characteristic Value';
            OD_CONDITION   : String(70)  @title: 'OD Condition';
            ROW_ID         : Integer     @title: 'Row Id';
    }

    // BOM Object Dependency rules staging table for BOM_DEP
    entity BOM_DEP_MASTER {
        key DEPENDENCY   : String(30)  @title: 'Object Dependency';
        key DEP_COUNTER  : Integer     @title: 'Dependency Counter';
        key CHAR_NUM     : String(100) @title: 'Characteristic Number';
        key CHAR_COUNTER : Integer     @title: 'Char Counter';
        key CHAR_VAL     : String(70)  @title: 'Characteristic Value';
            OD_CONDITION : String(70)  @title: 'OD Condition';
            ROW_ID       : Integer     @title: 'Row Id';
    }

    entity BOM_OD_DEP {
        key DEPENDENCY      : String(30)  @title: 'Dependency';
        key LINE_NO         : Integer     @title: 'Line Number';
            LINE            : String(100) @title: 'Line';
            DEPENDENCY_TYPE : String(1)   @title: 'Dependency Type';
    }

    // New Product Introduction Tables
    // New Characteristic Value Assignment to Reference Characteristic Value
    entity NPI_CHARVAL {
        key PROJECT_ID         : String(40);
        key REF_PRODID         : String(40);
        key CHAR_NUM           : String(100);
        key CHAR_VALUE         : String(70);
        key REF_CHAR_VALUE     : String(70);
            CHAR_NAME          : String(40);
            WEIGHT             : Integer;
            VALID_FROM         : Date;
            VALID_TO           : Date;
            REF_CHARVALUE_DESC : String(100);
            CHARVAL_DESC       : String(100);
    }

    // Launch Dimension Assignment to New Characteristic Value
    entity NPI_CHARVAL_DIMENSION {
        key PROJECT_ID     : String(40);
        key REF_PRODID     : String(40);
        key CHAR_NUM       : String(100);
        key CHAR_VALUE     : String(70);
        key REF_CHAR_VALUE : String(70);
        key LOCATION_ID    : String(4);
        key PRODUCT_ID     : String(40);
            LOCATION_DESC  : String(100);
            PRODUCT_DESC   : String(100);
            HISTORY_DATE   : Date;
            PHASE_IN_START : Date;
    }

    //NPI- PhaseOut Char Val Details
    entity NPI_PHASEOUTDATA {
        key PROJECT_ID      : String(40);
        key REF_PRODID      : String(40);
        key CHAR_NUM        : String(100);
        key CHAR_VALUE      : String(70);
        key LOCATION_ID     : String(4);
        key PRODUCT_ID      : String(40);
            LOCATION_DESC   : String(100);
            PRODUCT_DESC    : String(100);
            REF_PROD_DESC   : String(100);
            CHARVAL_DESC    : String(100);
            CHARNUM_DESC    : String(100);
            PHASE_OUT_START : Date;
    }

    entity NPI_MAINTAINPROJDET {
        key PROJECT_ID   : String(50)  @title: 'Project Id';
            PROJECT_DET  : String(500) @title: 'Project Details';
            PROJ_STATUS  : Boolean     @title: 'Project Status';
            RELEASE_DATE : Date        @title: 'Release Date';
            CREATED_BY   : String(400) @title: 'Created By';
            CHANGED_BY   : String(400) @title: 'Changed By';
            CREATED_DATE : Date        @title: 'Created Date';
            CHANGED_DATE : Date        @title: 'Changed Date';
    }

    // Dummy Products to be sent to IBP for Multilocation BOM
    entity DUMMY_PRODUCT_LOC {
        key DUMMY_PRODUCTID : String(40) @title: 'Dummy Product';
        key LOCATION_ID     : String(4)  @title: 'Location';
        key FACTORY_LOC     : String(4)  @title: ' Factory Location';
            PRODUCT_ID      : String(40) @title: ' Factory Location';
    }

    entity PROD_ORD_CONSUMPTION {
        key LOCATION_ID       : String(4)      @title: 'Location';
        key SALES_DOC         : String(10)     @title: 'Sales Document';
        key SALESDOC_ITEM     : String(10)     @title: 'Sales Document Item'; // VP-1459 - Increased length of Sales Document Item
        key REF_PRODID        : String(40)     @title: 'Configurable Product';
        // key PROD_ORDER        : String(12)     @title: 'Production Order';
        key COMPONENT         : String(40)     @title: 'Component';
        key COMP_LOC          : String(4)      @title: 'Child Location';
            MAT_PARENT        : String(40)     @title: 'Parent Material';
            PARENT_LOC        : String(40)     @title: 'Parent Location';
            COMP_PROCURE_TYPE : String(1)      @title: 'Procurement Type';
            COMP_QTY          : Decimal(13, 3) @title: 'Component Quantity';
            // ORD_TYPE          : String(20)     @title: 'Planned / Production';
            WEEK_DATE         : Date           @title: 'Material avail Date';
    }

    entity SALES_PROD_ORD {
        key SALES_DOC         : String(10)     @title: 'Sales Document';
        key SALESDOC_ITEM     : String(10)     @title: 'Sales Document Item'; 
        key PROD_ORDER        : String(12)     @title: 'Production Order';
        key MAT_PARENT        : String(40)     @title: 'Parent Material';
            COMP_QTY          : Decimal(13, 3) @title: 'Component Quantity';
            ORD_TYPE          : String(20)     @title: 'Planned / Production';
    }

    entity  OPTIMIZATION_COMB_TEMP{
        Key  LOCATION_ID     : String(4) @title: 'Location';
        Key  PRODUCT_ID      : String(40) @title: 'Product';
        key  WEEK_DATE       : Date      @title: 'Week Date';
        key  MODEL_VERSION   : String(20) @title: 'Model Version';
        key  VERSION         : String(10) @title: 'Version';
        key  SCENARIO        : String(32) @title: 'Scenario';
        key  COMB_ID         : Integer    @title:'Combination ID';
        key  PRIMARY_ID      : Integer    @title: 'Primary ID';
             OPT_QTY         : Double     @title: 'Quantity';
             DEVIATION       : Double     @title: 'Deviation';
    }

    entity CHARACTERISTIC_GROUPS {
        key PRODUCT_ID   : String(40)     @title: 'Product Id';
        key GROUP_NAME   : String(100)    @title: 'Group Name';
        key WEIGHTAGE    : Decimal(13, 2) @title: 'Weightage';
            CHANGED_BY   : String(50)     @title: 'Changed By';
            CHANGED_DATE : Date           @title: 'Changed Date';
            CHANGED_TIME : Time           @title: 'Changed Time';
    }

    entity OPTION_PERCENT_THRESHOLD {
        key PRODUCT_ID : String(40) @title: 'Product ID';
        key CLASS_NAME : String(40) @title: 'Class Name';
        key CHAR_NAME  : String(80) @title: 'Characteristic Name';
            MINIMUM    : Integer    @title: 'Minimum Value';
            MAXIMUM    : Integer    @title: 'Maximum Value';
    }

    //VP-1241 Temporary tables
    entity SALESH_STB {
            MANDT                : String(3);
        key SALES_DOCUMENT       : String(10);
        key SALES_DOCUMENT_ITEM  : Integer;
            DOC_CREATED_DATE     : Date;
            SCHEDULE_LINE_NO     : Integer;
            PRODUCT_ID           : String(40);
            MATERIAL_VARIANT     : String(40);
            REASON_4REJECTION    : String(2);
            UOM                  : String(3);
            CONFIRMED_QTY        : Integer64;
            QTY_UNITS            : Integer64;
            PROD_AVAILABILITY_DT : Date;
            NET_VALUE            : Double;
            CUSTOMER_GROUP       : String(2);
            LOCATION_ID          : String(4);
            SALES_ORG            : String(4);
            DISTR_CHANNEL        : String(2);
            DIVISION             : String(2);
            SAL_DOCU_TYPE        : String(4);
            ITEM_CREATED_DATE    : Date;
            ITEM_CHANGE_DATE     : Date;
            OPEN_ORDER           : String(1);
            CHARG                : String(10);
            IBP_CUSTOMER         : String(10);
            NOT_PLANNING         : String(1);
            ON_HAND_STOCK        : String(1);
            IN_TRANSIT           : String(1);
            SHIP_FROM_LOC        : String(4);
            RESERVE_FIELD1       : String(40);
            RESERVE_FIELD2       : String(40);
            RESERVE_FIELD3       : String(40);
            STOCK_LOC            : String(4);
            TRANS_TO_LOC         : String(4);
            TRANS_FROM_LOC       : String(4);
            DELETE_FLAG          : String(1);
            CHANGED_DATE         : Date;
            CHANGED_TIME         : Time;
            CHANGED_BY           : String(12);
            CREATED_DATE         : Date;
            CREATED_TIME         : Time;
            CREATED_BY           : String(12);
    }

    entity SALESH_CONFIG_STB {
            MANDT                : String(3);
        key SALES_DOCUMENT       : String(10);
        key SALES_DOCUMENT_ITEM  : Integer;
        key CHARACTERSTIC        : String(30);
        key CHARACTERSTIC_VALUE  : String(70);
            PRODUCT_ID           : String(40);
            PROD_AVAILABILITY_DT : Date;
            CLASS                : String(18);
            CLASS_NUM            : Integer;
            CHARACTERSTIC_NUM    : Integer;
            VALUE_NUM            : Integer;
            DELETE_FLAG          : String(1);
            CHANGED_DATE         : Date;
            CHANGED_TIME         : Time;
            CHANGED_BY           : String(12);
            CREATED_DATE         : Date;
            CREATED_TIME         : Time;
            CREATED_BY           : String(12);
    }

    //Temporary table for Creating Sales Order Internal
    entity TEMP_SO_INTERNAL {
        key SEED_ORDER         : String(50)     @title: 'SalesOrderNumber ';
            PRODUCT_ID         : String(40)     @title: 'Materialnumber';
            LOCATION_ID        : String(4)      @title: 'Location';
            UNIQUE_ID          : Integer        @title: 'UID';
            MAT_AVAILDATE      : Date           @title: 'MaterialAvlDate';
            ORD_QTY            : Decimal(13, 3) @title: 'Quantity';
            SALES_ORGANIZATION : String(4)      @title: 'SalesOrganization';
            DIST_CHANNEL       : String(4)      @title: 'DistributionChannel';
            DIVISION           : String(4)      @title: 'Division';
            CUSTOMER_GROUP     : String(20)     @title: 'CustomerGroup';
    };

    // Delta Changes - Demand and Option Percent
    entity DEMAND_OPT_QUANTITY_DELTA {
        key LOCATION_ID   : String(4)                   @title: 'Location ID';
        key PRODUCT_ID    : String(40)                  @title: 'Product ID';
        key VERSION       : String(10)                  @title: 'Version';
        key SCENARIO      : String(32)                  @title: 'Scenario';
        key WEEK_DATE     : Date                        @title: 'Weekly Date';
        key MODEL_VERSION : String(20) default 'Active' @title: 'Model Version';
    // key CHANGED_AT     : Timestamp       @title: 'Changed at';
    };

    // Period Profile
    entity PERIOD_PROFILE {
        key PROFILE      : String(30)  @title: 'Profile';
            PROFILE_DESC : String(100) @title: 'Profile Description';
            WEEKLY       : Integer     @title: 'Weekly no of weeks';
            MONTHLY      : Integer     @title: 'Monthly no of weeks';
            QUARTERLY    : Integer     @title: 'Quarterly no of weeks';
            CREATED_DATE : Date;
            CREATED_BY   : String(500) @title: 'Created By';
            CHANGED_DATE : Date;
            CHANGED_BY   : String(500) @title: 'Changed By';

    };

    entity OPTIMIZATION_PROFILE {
        key PROFILE             : String(60)    @title: 'Profile';
            PROFILE_DESC        : String(100)   @title: 'Profile Description';
            ALGORITHM           : String(30)    @title: 'Algorithm';
            OPTIMIZATION_FACTOR : Decimal(4, 2) @title: 'Optimozation Factor';
            CHAR_WEIGHTAGE      : Boolean       @title: 'Char Weightage';
            CREATED_DATE        : Date;
            CREATED_BY          : String(500)   @title: 'Created By';
            CHANGED_DATE        : Date;
            CHANGED_BY          : String(500)   @title: 'Changed By';

    };

    entity TELESCOPIC_PERIODS {
        key PERIODSTART : Date;
        key PERIODEND   : Date;
        key PERIODDESC  : String(50);
            LEVEL       : String(1);
    };

    entity BOM_HIERARCHY {
        key LOCATION_ID : String(4)   @title: 'Location ';
        key BOM_PARENT  : String(40)  @title: 'Parent Material';
            BOM_CHILD   : LargeString @title: 'BOM Child';
    };


    entity VAR_HDR {
        key TABLE_NAME      : String(18) @title: 'Name of Variant Table';
            TABLE_DESC      : String(40) @title: 'Variant table description';
            BOM_IND         : String(1)  @title: 'BOM Indicator';
            CON_PROFILE_IND : String(1)  @title: 'Flag';
            PROCESS_DATE    : Date       @title: 'Changed Date';
            CHANGED_DATE    : Date;
            CHANGED_TIME    : Time;
            CHANGED_BY      : String(12);
            CREATED_DATE    : Date;
            CREATED_TIME    : Time;
            CREATED_BY      : String(12);
    };

    entity VAR_DEF {
        key TABLE_NAME   : String(18) @title: 'Name of Variant Table';
        key CHAR_NAME    : String(30) @title: 'Characteristic Name';
            CHAR_KEY     : String(1)  @title: 'Flag';
            CHANGED_DATE : Date;
            CHANGED_TIME : Time;
            CHANGED_BY   : String(50);
            CREATED_DATE : Date;
            CREATED_TIME : Time;
            CREATED_BY   : String(50);
    };

    entity VAR_CONTNT {
        key TABLE_NAME           : String(18) @title: 'Name of Variant Table';
        key ROW_ID               : String(5)  @title: 'Row ID';
        key COLUMN_ID            : String(5)  @title: 'Column ID';
        key CHAR_NAME            : String(30) @title: 'Characteristic Name';
            CHAR_NUM             : String(10) @title: 'Internal Characteristic';
            CHARACTERISTIC_VALUE : String(70) @title: 'Characteristic Value';
            CHANGED_DATE         : Date;
            CHANGED_TIME         : Time;
            CHANGED_BY           : String(12);
            CREATED_DATE         : Date;
            CREATED_TIME         : Time;
            CREATED_BY           : String(12);
    };

    //Entities for color code
    entity COLOR_CODE_MASTER {
        key ORDER                : Integer      @title: 'Order';
        key COLOR_CODE           : String(10)   @title: 'Color Code';
        key COLOR_NAME           : String(25)   @title: 'Color Name';
        key COLOR_FAMILY         : String(25)   @title: 'Color Family';
            COLORBLIND_RATIONALE : String(1000) @title: 'Colorblind Rationale';
    };

    entity COLOR_CODE_CHAR {
        key ORDER      : Integer    @title: 'Order';
        key COLOR_CODE : String(10) @title: 'Color Code';
        key COLOR_NAME : String(25) @title: 'Color Name';
    };

    //Table for Characteristics in Procedures
    entity PROCEDURE_CHAR {
        key CHARACTERISTIC : String     @title: 'Characteristic';
        key CHAR_TYPE      : String(10) @title: 'Characteristic Type';
    }

    //Table for Logs in Application
    entity ERROR_LOGS {
        key LOG_TIME : Timestamp default current_timestamp @title: 'Log Time Stamp';
            LOG_DATE : Date default current_date           @title: 'Log Date';
            SERVICE  : String                              @title: 'Service path';
            MESSAGE  : String                              @title: 'Log Message';
            TYPE     : String(10)                          @title: 'Error Type';
    }

    entity CP_STAT_FORECAST {
        key LOCATION_ID    : String(4)      @title: 'Location';
        key PRODUCT_ID     : String(40)     @title: 'Product';
        key CUSTOMER_GROUP : String(20)     @title: 'Customer Group';
        key PRIMARY_ID     : Integer        @title: 'Primary ID';
        key WEEK_DATE      : Date           @title: 'Week Date';
            QUANTITY       : Decimal(13, 3) @title: 'Quantity';
    }

    // Trigger table fo configuration change logs
    entity CONFIGURATION_CHANGE_LOGS {
        key LOCATION_ID  : String(4)   @title: 'Location ID';
        key PARAMETER_ID : Integer     @title: 'Parameter ID';
        key OLD_VALUE    : String(100) @title: 'Old Value';
        key NEW_VALUE    : String(100) @title: 'New Value';
        key CHANGED_BY   : String(100) @title: 'Changed By';
        key CHANGED_DATE : Date        @title: 'Changed Date';
        key CHANGED_TIME : Time        @title: 'Changed Time';
    }

    //TODO
    entity STAT_DISTRIBUTION_RESULTS {
        key PRIMARY_ID     : Integer        @title: 'Primary ID';
        key LOCATION_ID    : String(50)     @title: 'Location ID';
        key PRODUCT_ID     : String(50)     @title: 'Product ID';
        key CUSTOMER_GROUP : String(50)     @title: 'Customer Group';
        key QUANTITY       : Decimal(18, 2) @title: 'Quantity';
        key WEEK_DATE      : Date           @title: 'Week Date';
    }

    //S&OP Mapping
    entity BTP_MAPPING {
        key ENTITY_KEY    : String(100)           @title: 'Entity Key';
        key BTP_FIELD     : String(100)           @title: 'BTP Field';
        key MAPPING_FIELD : String(100)           @title: 'Mapping Field';
            REQUIRED      : Boolean default false @title: 'Required';
            Type          : String(5)             @title: 'Type';
            OPERATOR      : String(5)             @title: 'Operator for concatenation';
            SELECTION     : String(100)           @title: 'Selection';
            ENTITY_DESC   : String(200)           @title: 'Entity Description';
        key PLANNING_AREA : String(50)            @title: 'Planning Area';
            DATA_TYPE     : String(20)            @title: 'Data Type';
    }

    //Snapshot Lag Assembly
    entity SNAPSHOT_LAG_ASMB {
        key FACTORY_LOC  : String(4)   @title: 'Factory Location';
        key LOCATION_ID  : String(4)   @title: 'Location';
        key PRODUCT_ID   : String(40)  @title: 'Product';
        key ASSEMBLY     : String(200) @title: 'Assembly';
        key MONTH        : String(20)  @title: 'Telescopic month'; //Telescopic month
        key LAG_MONTH    : Integer     @title: 'Lag Month'; //1 Month Lag etc
            LAG_QTY      : Integer     @title: 'Lag Quantity';
            ACTUAL_MONTH : String(20)  @title: 'Actual Month';
            ACTUAL_QTY   : Integer     @title: 'Actual Quantity';
        key CREATED_TIME : Timestamp default current_timestamp
    }

    entity SNAPSHOT_LAG_OPT {
        key FACTORY_LOC  : String(4)   @title: 'Factory Location';
        key LOCATION_ID  : String(4)   @title: 'Location';
        key PRODUCT_ID   : String(40)  @title: 'Product';
        key CHAR_NUM     : String(100) @title: 'Charateristic Name';
        key CHAR_VALUE   : String(80)  @title: 'Charateristic Value';
        key MONTH        : String(20)  @title: 'Telescopic month'; //Telescopic month
        key LAG_MONTH    : Integer     @title: 'Lag Month'; //1 Month Lag etc
        key CREATED_TIME : Timestamp default current_timestamp;
            LAG_QTY      : Integer     @title: 'Lag Quantity';
            ACTUAL_MONTH : String(20)  @title: 'Actual Month';
            ACTUAL_QTY   : Integer     @title: 'Actual Quantity';
    }

    entity SNAPSHOT_LAG_RTR {
        key FACTORY_LOC  : String(4)  @title: 'Factory Location';
        key LOCATION_ID  : String(4)  @title: 'Location';
        key LINE_ID      : String(40) @title: 'Line ID';
        key RESTRICTION  : String(30) @title: 'Restriction';
        key MONTH        : String(20) @title: 'Telescopic month'; //Telescopic month
        key LAG_MONTH    : Integer    @title: 'Lag Month'; //1 Month Lag etc.
        key CREATED_TIME : Timestamp default current_timestamp;
            LAG_QTY      : Integer    @title: 'Lag Quantity';
            ACTUAL_MONTH : String(20) @title: 'Actual Month';
            ACTUAL_QTY   : Integer    @title: 'Actual Quantity';
    }

    entity SNAPSHOT_LAG_PROD_DMD {
        key FACTORY_LOC  : String(4)  @title: 'Factory Location';
        key LOCATION_ID  : String(4)  @title: 'Location';
        key PRODUCT_ID   : String(40) @title: 'Product';
        key MONTH        : String(20) @title: 'Telescopic month'; //Telescopic month
        key LAG_MONTH    : Integer    @title: 'Lag Month'; //1 Month Lag etc.
        key CREATED_TIME : Timestamp default current_timestamp;
            LAG_QTY      : Integer    @title: 'Lag Quantity';
            ACTUAL_MONTH : String(20) @title: 'Actual Month';
            ACTUAL_QTY   : Integer    @title: 'Actual Quantity';
    }
    //Lag Stat Forecast
     entity LAG_STAT_FORECAST {
        key FACTORY_LOC  : String(4)   @title: 'Factory Location';
        key LOCATION_ID  : String(4)   @title: 'Location';
        key PRODUCT_ID   : String(40)  @title: 'Product';
        key CHAR_NUM     : String(100) @title: 'Charateristic Name';
        key CHAR_VALUE   : String(80)  @title: 'Charateristic Value';
        key MONTH        : String(20)  @title: 'Telescopic month'; //Telescopic month
        key LAG_MONTH    : Integer     @title: 'Lag Month'; //1 Month Lag etc
        key CREATED_TIME : Timestamp default current_timestamp;
            LAG_QTY      : Integer     @title: 'Lag Quantity';
            ACTUAL_MONTH : String(20)  @title: 'Actual Month';
            ACTUAL_QTY   : Integer     @title: 'Actual Quantity';
    }

    //Technical Documentation applicaion
    entity ENTITY_USAGE {
        key TABLE_NAME   : String(100);
            DESCRIPTION  : String(250);
            UI_PATH      : LargeString;
            SERVICE_PATH : LargeString;
            ARTIFACT     : LargeString;
    }

    //Below is Staging table for all BTE from S4 which includes new data
    entity MASTER_DATA_STAGE {
        key TYPE              : String(100)                         @title: 'Type of Data';
        key CREATED_DATE_TIME : Timestamp default current_timestamp @title: 'Created Timestamp';
            LOCATION_ID       : LargeString                         @title: 'Location';
            PRODUCT_ID        : LargeString                         @title: 'Product';
            DATA              : LargeString                         @title: 'Data';
            COMMENTS          : LargeString                         @title: 'Comments';
            REASON            : String default ''                   @title: 'Reason for rejection';
            STATUS            : String(1) default ''                @title: 'Status';
    }

    //Entities for Data Level Authorization
    entity USER_ROLES {
        key USER        : String(100) @title: 'User';
        key ROLE_NAME   : String(100) @title: 'Role Name';
            DESCRIPTION : String(200) @title: 'Role Description';
    }

    entity ROLES {
        key ROLE_NAME    : String(100)          @title: 'Role Name';
            DESCRIPTION  : String(200)          @title: 'Role Description';
            ACTIVE       : Boolean default true @title: 'Role Status';
            Details      : Composition of many ROLE_DETAILS
                               on Details.ROLE_NAME = $self.ROLE_NAME;
            CREATED_BY   : String(100)          @title: 'Created By';
            CHANGED_BY   : String(100)          @title: 'Changed By';
            CREATED_DATE : Date                 @title: 'Created Date';
            CREATED_TIME : Time                 @title: 'Created Time';
            CHANGED_DATE : Date                 @title: 'Changed Date';
            CHANGED_TIME : Time                 @title: 'Changed Time';
    }

    entity ROLE_DETAILS{
        key ROLE_NAME     : String(100) @title: 'Role Name';
        key PARAMETER     : String(30)  @title:  'Parameter';
        key VALUE         : String(100) @title:  'Value';
            READ          : Boolean default false;
            CREATE        : Boolean default false;
            UPDATE        : Boolean default false;
            DELETE        : Boolean default false;
    }

     //App Names and Semantic + action details Table for Chatbot
    entity APPLICATION_DETAILS {
        key APP_ID    : String(100)     @title: 'Application ID';
            SEMANTIC_OBJECT  : String(100) @title: 'Semantic Object';
            ACTION : String(100) @title: 'Action';
            KEY_WORDS        : String(100) @title: 'Keywords';
        key APP_NAME: String(100) @title:'Application Name'
    };

    entity DERIVED_CHAR_CONFIG_PRF{
        key PRODUCT_ID   : String(40)  @title: 'Product ID';
        key RECORD_TYPE  : String(2)   @title: 'Record Type';
        key VALID_FROM   : String(8)   @title: 'Valid From';
        key DEPENDENCY   : String(30)  @title: 'Object Dependency';
        key LINE_NO      : Integer     @title: 'Line Count';
            LINE         : String(100) @title: 'Dependency line';
            VALID_TO     : String(8)   @title: 'Valid To';
            RULE_TYPE    : String(30)  @title: 'Rule Type';
            CHANGE_NO    : String(12)  @title: 'Change Number';
            DELETE_FLAG  : String(1)   @title: 'Flag';
            CHANGED_DATE : String(8)   @title: 'Changed Date';
            CHANGED_TIME : String(6)   @title: 'Changed Time';
            CHANGED_BY   : String(12)  @title: 'Changed By';
            CREATED_DATE : String(8)   @title: 'Created Date';
            CREATED_TIME : String(6)   @title: 'Created Time';
            CREATED_BY   : String(12)  @title: 'Created By';
    }

    entity DERIVED_CHAR_SEQUENCE{
        key PRODUCT_ID   : String(40)  @title: 'Product ID';
        key CHAR_NUM     : String(100) @title: 'Characteristic Number';
        key SEQUENCE     : Integer     @title: 'Characteristic Sequence';
            CHAR_NAME    : String(80)  @title:  'Characteristic Name';
            CHAR_DESC    : String(160) @title:'Characteristic Description';
            CHANGED_BY   : String(50)  @title: 'Changed By';
            CHANGED_DATE : Date        @title: 'Changed Date';
            CHANGED_TIME : Time        @title: 'Changed Time';

    }
    
    entity DERIVED_CHAR_RULES{
        key PRODUCT_ID    : String(40)           @title: 'Product ID';
        key DEPENDENCY    : String(50)           @title: 'Dependency';
        key RULE_ID       : Integer              @title: 'Rule ID';
        key CHAR_NAME     : String(80)           @title: 'Characteristic Name';
        key CHAR_VALUE    : String(80)           @title: 'Charateristic Value';
        key CLAUSE        : String(5)            @title: 'Clause';
        key OPERATOR      : String(5)            @title: 'Operator';
        key VALID_FROM    : String(10)            @title: 'Valid From';
            VALID_TO      : String(10)            @title: 'Valid To';
            OPERATOR_FLAG : String(5)            @title: 'Operator flag for application';
            ACTIVE        : Boolean default true @title: 'Rule state';
            TYPE          : String(1)            @title: 'Condition type';
            CLASS_NAME    : String(200)             @title: 'Class Name';
    }

    entity DERIVED_RULE_MAPPINGS {
        key PRODUCT_ID : String(40) @title: 'Product ID';
        key DEPENDENCY : String(50) @title: 'Dependency';
        key RULE_ID    : String(50) @title: 'Rule ID';
    }

    entity DERIVED_CHAR_PROFILE {
        key PROFILE        : String(30)  @title: 'Profile Name';
            PROFILE_DESC   : String(100) @title: 'Profile Description';
            PAST_SALES_ORD : Integer     @title: 'Past Sales Orders';
    }

    entity DERIVED_NODES {
        key PRODUCT_ID  : String(40)  @title: 'Product ID';
        key NODE_KEY    : String(500) @title: 'Node Key';
        key CHAR_NAME   : String(100) @title: 'Characteristic Name';
        key CHAR_VALUE  : String(100) @title: 'Characteristic Value';
        key PARENT_KEY  : String(500) @title: 'Parent Key';
        key ROOT_KEY    : String(500) @title: 'Root Key';
            LEVEL       : Integer     @title: 'Level';
            PROBABILITY : LargeString @title: 'Probability';
            TYPE        : String(1)   @title: 'Type';
            PARENT_CHAIN: LargeString @title: 'Parent Chain';
            CLASS_NAME  : String(200)  @title: 'Class Name';
    }

    // BOMUID Mapping for M1 Process
    entity UNIQUEID_OD {
      key LOCATION_ID  : String(4)                @title: 'Location';  
      key REF_PROID    : String(40)               @title: 'Configurable Product ID';
      key UNIQUE_ID    : Integer                  @title: 'UID';
      key OBJ_DEP      : String(30)               @title: 'Object Dependency';
      STATUS           : String(1)  default ' '   @title: 'Status (Success / Fail)';
    }
 
    entity UNIQUEID_OD_CHAR {
      key LOCATION_ID  : String(4)                 @title: 'Location';  
      key REF_PROID    : String(40)                @title: 'ConfigurableProduct ID';
      key UNIQUE_ID    : Integer                   @title: 'UID';
      key OBJ_DEP      : String(30)                @title: 'Object Dependency';
      key CHAR_NUM     : String(100)               @title: 'Characteristic Number';
      STATUS           : String(1)   default ' '   @title: 'Status (Success / Fail)';
    }

}


@cds.persistence.exists
entity ![V_OBDHDR] {
    key ![LOCATION_ID]   : String(4)      @title: 'Location';
    key ![PRODUCT_ID]    : String(40)     @title: 'Product';
    key ![ITEM_NUM]      : String(6)      @title: 'ITEM_NUM';
    key ![COMPONENT]     : String(40)     @title: 'COMPONENT';
    key ![COMP_QTY]      : Decimal(13, 3) @title: 'COMP_QTY';
    key ![OBJ_DEP]       : String(30)     @title: 'Object Dependency';
    key ![OBJDEP_DESC]   : String(30)     @title: 'OBJDEP_DESC';
    key ![CLASS_NUM]     : String(18)     @title: 'Internal Class Number';
    key ![CHAR_NUM]      : String(100)    @title: 'Char Num';
    key ![CHARVAL_NUM]   : String(80)     @title: 'Charval Num';
    key ![OD_CONDITION]  : String(2)      @title: 'OD_CONDITION';
    key ![OBJ_COUNTER]   : Integer        @title: 'OBJ_COUNTER';
    key ![CHAR_COUNTER]  : Integer        @title: 'CHAR_COUNTER';
    key ![ROW_ID]        : Integer        @title: 'ROW_ID';
    key ![OD_VALID_FROM] : Date           @title: 'VALID_FROM';
    key ![OD_VALID_TO]   : Date           @title: 'VALID_TO';
    key ![VALID_FROM]    : Date           @title: 'VALID_FROM';
    key ![VALID_TO]      : Date           @title: 'VALID_TO';
}

@cds.persistence.exists
entity ![V_CLASSCHARVAL] {
    key ![CLASS_NUM]       : String(18)  @title : 'CLASS_NUM';
    key ![CLASS_NAME]      : String(20)  @title : 'CLASS_NAME';
    key ![CLASS_DESC]      : String(150) @title : 'CLASS_DESC';
    key ![IBPCHAR_CHK]     : Boolean     @title : 'IBP Char. Check';
    key ![CHAR_NUM]        : String(100) @title : 'CHAR_NUM';
    key ![CHAR_NAME]       : String(80)  @title : 'CHAR_NAME';
    key ![CHAR_DESC]       : String(160) @title : 'CHAR_NAME';
    key ![CHAR_GROUP]      : String(10)  @title : 'CHAR_NAME';
    key ![CHAR_VALUE]      : String(80)  @title : 'CHAR_VALUE';
    key ![CHARVAL_NUM]     : String(80)  @title : 'CHARVAL_NUM';
    key ![CHARVAL_DESC]    : String(160) @title : 'CHAR_DESC';
    key ![MULTI_CHAR]      : String(1)   @titile: 'Multichar check';
    key ![REF_CHAR_NUM]    : String(100) @title : 'REF_CHAR_NUM';
    key ![REF_CHAR_NAME]   : String(30)  @title : 'REF_CHARNAME';
    key ![REF_CHAR_DESC]   : String(160) @title : 'REF_CHAR_DESC';
    key ![REF_CHARVAL_NUM] : String(80)  @title : 'REF_CHARVAL_NUM';
    key ![REF_CHAR_VALUE]  : String(80)  @title : 'REF_CHAR_VALUE';
    key ![GENFLAG]         : String(1)   @title : 'GENFLAG';
}

@cds.persistence.exists
entity ![V_CLASSCHARVAL_MASTER] {
    key ![CLASS_NUM]    : String(18)  @title : 'CLASS_NUM';
    key ![CLASS_NAME]   : String(20)  @title : 'CLASS_NAME';
    key ![CLASS_DESC]   : String(150) @title : 'CLASS_DESC';
    key ![IBPCHAR_CHK]  : Boolean     @title : 'IBP Char. Check';
    key ![CHAR_NUM]     : String(100) @title : 'CHAR_NUM';
    key ![CHAR_NAME]    : String(80)  @title : 'CHAR_NAME';
    key ![CHAR_DESC]    : String(160) @title : 'CHAR_NAME';
    key ![CHAR_GROUP]   : String(10)  @title : 'CHAR_NAME';
    key ![CHAR_VALUE]   : String(80)  @title : 'CHAR_VALUE';
    key ![CHARVAL_NUM]  : String(80)  @title : 'CHARVAL_NUM';
    key ![CHARVAL_DESC] : String(160) @title : 'CHAR_DESC';
    key ![MULTI_CHAR]   : String(1)   @titile: 'Multichar check';
}

@cds.persistence.exists
entity ![V_PRODCLSCHAR] {
    key ![PRODUCT_ID]    : String(40)  @title: 'PRODUCT_ID';
    key ![LOCATION_ID]   : String(4)   @title: 'LOCATION_ID';
    key ![CLASS_NUM]     : String(18)  @title: 'CLASS_NUM';
    key ![CLASS_NAME]    : String(20)  @title: 'CLASS_NAME';
    key ![CLASS_DESC]    : String(150) @title: 'CLASS_DESC';
    key ![PROD_DESC]     : String(40)  @title: 'PROD_DESC';
    key ![PROD_FAMILY]   : String(30)  @title: 'PROD_FAMILY';
    key ![PROD_GROUP]    : String(30)  @title: 'PROD_GROUP';
    key ![PROD_MODEL]    : String(30)  @title: 'PROD_MODEL';
    key ![PROD_MDLRANGE] : String(30)  @title: 'PROD_MDLRANGE';
    key ![PROD_SERIES]   : String(30)  @title: 'PROD_SERIES';
}

@cds.persistence.exists
entity ![V_LOCPRODCLASSCHAR] {
    key ![LOCATION_ID]     : String(4)   @title : 'LOCATION_ID';
    key ![PRODUCT_ID]      : String(40)  @title : 'PRODUCT_ID';
    key ![PROD_DESC]       : String(40)  @title : 'PROD_DESC';
    key ![CLASS_NUM]       : String(18)  @title : 'CLASS_NUM';
    key ![CLASS_NAME]      : String(20)  @title : 'CLASS_NAME';
    key ![CHAR_NUM]        : String(100) @title : 'CHAR_NUM';
    key ![CHAR_NAME]       : String(80)  @title : 'CHAR_NAME';
    key ![CHARVAL_NUM]     : String(80)  @title : 'CHARVAL_NUM';
    key ![CHAR_VALUE]      : String(80)  @title : 'CHAR_VALUE';
    key ![CHAR_TYPE]      : String(80)  @title : 'CHAR_TYPE';
    key ![IBPCHAR_CHK]     : Boolean     @title : 'IBPCHAR_CHK';
        ![MULTI_CHAR]      : String(1)   @titile: 'Multichar check';
        ![REF_CHAR_NUM]    : String(100) @title : 'REF_CHAR_NUM';
        ![REF_CHAR_NAME]   : String(30)  @title : 'REF_CHARNAME';
        ![REF_CHAR_DESC]   : String(160) @title : 'REF_CHAR_DESC';
        ![REF_CHARVAL_NUM] : String(80)  @title : 'REF_CHARVAL_NUM';
        ![REF_CHAR_VALUE]  : String(80)  @title : 'REF_CHAR_VALUE';
}

@cds.persistence.exists
entity ![V_BOMODCOND] {
    key ![LOCATION_ID] : String(4)      @title: 'LOCATION_ID';
    key ![PRODUCT_ID]  : String(40)     @title: 'PRODUCT_ID';
    key ![ITEM_NUM]    : String(6)      @title: 'ITEM_NUM';
    key ![COMPONENT]   : String(40)     @title: 'COMPONENT';
    key ![OBJ_DEP]     : String(42)     @title: 'OBJ_DEP';
    key ![OBJDEP_DESC] : String(30)     @title: 'OBJDEP_DESC';
    key ![COMP_QTY]    : Decimal(13, 3) @title: 'COMP_QTY';
    key ![VALID_FROM]  : Date           @title: 'VALID_FROM';
    key ![VALID_TO]    : Date           @title: 'VALID_TO';
    key ![ASMB_DESC]   : String(40)     @title: 'Assembly Description';
    key ![FACTORY_LOC] : String(4)      @title: ' Factory Location';
}


@cds.persistence.exists
entity ![V_ODPROFILES] {
    key ![LOCATION_ID]   : String(4)  @title: 'LOCATION_ID';
    key ![LOCATION_DESC] : String(40) @title: 'Factory Loc Description';
    key ![PRODUCT_ID]    : String(40) @title: 'PRODUCT_ID';
    key ![PROD_DESC]     : String(40) @title: 'Product Description';
    key ![ITEM_NUM]      : String(6)  @title: 'ITEM_NUM';
    key ![COMPONENT]     : String(40) @title: 'COMPONENT';
    key ![COMP_DESC]     : String(40) @title: 'Component Description';
    key ![STRUC_NODE]    : String(50) @title: 'STRUC_NODE';
    key ![PROFILE]       : String(50) @title: 'PROFILE';
}

@cds.persistence.exists
entity ![V_SALESHCFG_CHARVAL] {
    key ![SALES_DOC]        : String(10)     @title: 'Sales Document';
    key ![SALESDOC_ITEM]    : String(10)     @title: 'Sales Doc. Item'; // VP-1459 - Increased length of Sales Document Item
    key ![DOC_CREATEDDATE]  : Date           @title: 'Doc. Created Date';
    key ![SCHEDULELINE_NUM] : String(4)      @title: 'Schedule Line No.';
    key ![PRODUCT_ID]       : String(40)     @title: 'Product ID';
    key ![UOM]              : String(3)      @title: 'UOM';
    key ![CONFIRMED_QTY]    : Decimal(13, 3) @title: 'Confirmed Qty';
    key ![ORD_QTY]          : Decimal(13, 3) @title: 'Ordered Qty';
    key ![MAT_AVAILDATE]    : Date           @title: 'Material Avail. Date';
    key ![NET_VALUE]        : Decimal(15, 2) @title: 'Net Value';
    key ![CUSTOMER_GROUP]   : String(20)     @title: 'Customer Group';
    key ![LOCATION_ID]      : String(4)      @title: 'Location ID';
    key ![CHAR_NAME]        : String(80)     @title: 'Characteristic';
    key ![CHAR_VALUE]       : String(80)     @title: 'Characteristic Value';
}

@cds.persistence.exists
entity ![V_ODCHARVAL] {
    key ![OBJDEP]       : String(42)  @title: 'OBJDEP';
    key ![OBJ_DEP]      : String(42)  @title: 'OBJ_DEP';
    key ![CLASS_NUM]    : String(18)  @title: 'CLASS_NUM';
    key ![CLASS_NAME]   : String(20)  @title: 'CLASS_NAME';
    key ![CHAR_NUM]     : String(100) @title: 'CHAR_NUM';
    key ![CHAR_NAME]    : String(80)  @title: 'CHAR_NAME';
    key ![CHARVAL_NUM]  : String(80)  @title: 'CHARVAL_NUM';
    key ![CHAR_VALUE]   : String(80)  @title: 'CHAR_VALUE';
    key ![OD_CONDITION] : String(2)   @title: 'OD_CONDITION';
    key ![CHAR_COUNTER] : Integer     @title: 'CHAR_COUNTER';
    key ![ROW_ID]       : Integer     @title: 'ROW_ID';
    key ![CHARVAL_DESC] : String(160) @title: 'CHARVAL_DESC';
}

@cds.persistence.exists
entity ![V_PARTIALPROD] {
    key ![LOCATION_ID] : String(4)  @title: 'LOCATION_ID';
    key ![REF_PRODID]  : String(40) @title: 'REF_PRODID';
    key ![PRODUCT_ID]  : String(40) @title: 'PRODUCT_ID';
    key ![PROD_DESC]   : String(40) @title: 'Product Description';
}

@cds.persistence.exists
entity ![V_SALES_H] {
    key ![SALES_DOC]         : String(10)     @title: 'SALES_DOC';
    key ![SALESDOC_ITEM]     : String(10)     @title: 'SALESDOC_ITEM'; // VP-1459 - Increased length of Sales Document Item
        ![REF_PRODID]        : String(40)     @title: 'REF_PRODID';
        ![PRODUCT_ID]        : String(40)     @title: 'PRODUCT_ID';
        ![UNIQUE_ID]         : Integer        @title: 'UNIQUE_ID';
        ![PRIMARY_ID]        : Integer        @title: 'PRIMARY_ID';
        ![DOC_CREATEDDATE]   : Date           @title: 'DOC_CREATEDDATE';
        ![SCHEDULELINE_NUM]  : String(4)      @title: 'SCHEDULELINE_NUM';
        ![REASON_REJ]        : String(2)      @title: 'REASON_REJ';
        ![UOM]               : String(3)      @title: 'UOM';
        ![CONFIRMED_QTY]     : Decimal(13, 3) @title: 'CONFIRMED_QTY';
        ![ORD_QTY]           : Decimal(13, 3) @title: 'ORD_QTY';
        ![MAT_AVAILDATE]     : Date           @title: 'MAT_AVAILDATE';
        ![NET_VALUE]         : Decimal(15, 2) @title: 'NET_VALUE';
        ![CUSTOMER_GROUP]    : String(20)     @title: 'CUSTOMER_GROUP';
        ![LOCATION_ID]       : String(4)      @title: 'LOCATION_ID';
        ![SALE_LOCATION]     : String(4)      @title: 'SALE_LOCATION';
        ![PLAN_LOC]          : String(4)      @title: 'PLAN_LOC';
        ![FACTORY_LOC]       : String(4)      @title: 'FACTORY_LOC';
        ![SEEDORD_CHK]       : String(1)      @title: 'SEEDORD_CHK';
        ![SALES_ORG]         : String(4)      @title: 'SALES_ORG';
        ![DISTR_CHANNEL]     : String(2)      @title: 'DISTR_CHANNEL';
        ![DIVISION]          : String(2)      @title: 'DIVISION';
        ![SAL_DOCU_TYPE]     : String(4)      @title: 'SAL_DOCU_TYPE';
        ![ITEM_CREATED_DATE] : Date           @title: 'ITEM_CREATED_DATE';
        ![ITEM_CHANGE_DATE]  : Date           @title: 'ITEM_CHANGE_DATE';
        ![IBP_CUSTOMER]      : String(10)     @title: 'IBP_CUSTOMER';
        ![RELEVENT_FOR_PLAN] : String(1)      @title: 'RELEVENT_FOR_PLAN';
        ![ON_HAND_STOCK]     : String(1)      @title: 'ON_HAND_STOCK';
        ![IN_TRANSIT]        : String(1)      @title: 'IN_TRANSIT';
        ![SHIP_FROM_LOC]     : String(4)      @title: 'SHIP_FROM_LOC';
        ![CHANGED_DATE]      : Date           @title: 'CHANGED_DATE';
        ![CHANGED_BY]        : String(12)     @title: 'CHANGED_BY';
        ![CREATED_DATE]      : Date           @title: 'CREATED_DATE';
        ![CREATED_BY]        : String(12)     @title: 'CREATED_BY';
        ![CHANGED_TIME]      : Time           @title: 'CHANGED_TIME';
        ![CREATED_TIME]      : Time           @title: 'CREATED_TIME';
        ![UNIQUE_DESC]       : String(100)    @title: 'UNIQUE_DESC';
        ![EX_IDENTIFICATION] : String(40)     @title: 'EX_IDENTIFICATION';
        ![LOCATION_DESC]     : String(40)     @title: 'LOCATION_DESC';
        ![PROD_DESC]         : String(40)     @title: 'PROD_DESC';
        ![CUSTOMER_DESC]     : String(20)     @title: 'CUSTOMER_DESC';
}

@cds.persistence.exists
entity ![V_LOCPROD] {
    key ![PRODUCT_ID]    : String(40) @title: 'Product';
    key ![LOCATION_ID]   : String(4)  @title: 'Location';
    key ![PROD_DESC]     : String(40) @title: 'Product Description';
    key ![PROD_TYPE]     : String(4)  @title: 'Product Type';
    key ![LOCATION_DESC] : String(40) @title: 'Location Description';
}

@cds.persistence.exists
entity ![V_LOCPRODDATA] {
    key ![PRODUCT_ID]        : String(40) @title: 'Product';
    key ![LOCATION_ID]       : String(4)  @title: 'Location ';
        ![LOTSIZE_KEY]       : String(2)  @title: 'Lot Size Key';
        ![LOT_SIZE]          : Integer    @title: 'Lot Size';
        ![PROCUREMENT_TYPE]  : String(1)  @title: 'Procurement Type';
        ![PLANNING_STRATEGY] : String(2)  @title: 'Planning Strategy';
        ![PROD_DESC]         : String(40) @title: 'Product Description';
        ![LOCATION_DESC]     : String(30) @title: 'Location Description';
        ![MRP_TYPE]          : String(5)  @title: 'MRP Type';
        ![MRP_GROUP]         : String(5)  @title: 'MRP Group';
}

@cds.persistence.exists
entity V_ASSEMBLY_COMP_BOM {
    key LOCATION_ID           : String(4)          @title: 'LOCATION_ID';
    key PRODUCT_ID            : String(40)         @title: 'PRODUCT_ID';
    key ITEM_NUM              : String(6)          @title: 'ITEM_NUM';
    key ASSEMBLY              : String(40)         @title: 'ASSEMBLY';
    key MODEL_VERSION         : String(20)         @title: 'MODEL_VERSION';
    key VERSION               : String(10)         @title: 'VERSION';
    key SCENARIO              : String(32)         @title: 'SCENARIO';
    key RULE_TYPE             : String(2)          @title: 'RULE_TYPE';
    key TYPE                  : String(2)          @title: 'TYPE';
    key REF_PRODID            : String(40)         @title: 'REF_PRODID';
    key FACTORY_LOC           : String(4)          @title: 'FACTORY_LOC';
    key UNIQUE_ID             : String default '0' @title: 'UNIQUE_ID';
        FACTORY_LOCATION_DESC : String(30)         @title: 'FACTORY_LOCATION_DESC';
        LOCATION_DESC         : String(30)         @title: 'LOCATION_DESC';
        PROD_DESC             : String(40)         @title: 'PROD_DESC';
        // MRP_GROUP: String(4)  @title: 'MRP_GROUP' ;
        PHANTOM_IND           : String(1)          @title: 'PHANTOM_IND';
        CONFIGURABLE          : String(1)          @title: 'CONFIGURABLE';
        VERSION_NAME          : String(50)         @title: 'VERSION_NAME';
        SCENARIO_NAME         : String(50)         @title: 'SCENARIO_NAME';
        ASM_DESC              : String(40)         @title: 'ASM_DESC';
        CALENDAR_WEEK         : String(50)         @title: 'CALENDAR_WEEK';
        TELESCOPIC_WEEK       : String(50)         @title: 'TELESCOPIC_WEEK';
        WEEK_STARTDATE        : Date               @title: 'WEEK_STARTDATE';
        WEEK_ENDDATE          : Date               @title: 'WEEK_ENDDATE';
        TOTAL_COMPONENT_QTY   : Decimal(28, 6)     @title: 'TOTAL_COMPONENT_QTY';
    key REQ_TYPE              : String(2)          @title: 'REQ_TYPE';
}


@cds.persistence.exists
entity ![V_FACTORYLOC] {
    key ![FACTORY_LOC]   : String(4)   @title: 'Factory Location ';
    key ![LOCATION_DESC] : String(40)  @title: 'Factory Loc Description';
    key ![PLAN_LOC]      : String(4)   @title: 'Planning Location ';
    key ![PLANLOC_DESC]  : String(40)  @title: 'Planning Location Description';
    key ![DEMAND_LOC]    : String(4)   @title: 'Demand Location ';
    key ![DEMAND_DESC]   : String(40)  @title: 'Demand Location Description';
    key ![PRODUCT_ID]    : String(40)  @title: 'Product';
    key ![PROD_DESC]     : String(40)  @title: 'Product Description';
        ![REF_PRODID]    : String(40)  @title: 'Reference Product Id';
        ![REFPROD_DESC]  : String(100) @title: 'Reference Product Description';
        MRP_GROUP        : String(4)   @title: 'MRP Group';
        MATERIAL_TYPE    : String(4)   @title: 'Material Type';
// key![LOCATION_ID]   : String(4)  @title : 'Location ';
}


@cds.persistence.exists
entity ![V_MFLOCATION] {
    key ![FACTORY_LOC]   : String(4)  @title: 'Factory Location ';
    key ![LOCATION_DESC] : String(40) @title: 'Factory Loc Description';
    key ![PLAN_LOC]      : String(4)  @title: 'Planning Location ';
    key ![PLANLOC_DESC]  : String(40) @title: 'Planning Location Description';
    key ![DEMAND_LOC]    : String(4)  @title: 'Demand Location ';
    key ![DEMAND_DESC]   : String(40) @title: 'Demand Location Description';
}


@cds.persistence.exists
entity ![V_FACTORY_LOCATION] {
    key ![FACTORY_LOC]   : String(4)   @title: 'Manufacturing Location ';
    key ![LOCATION_DESC] : String(100) @title: 'Location Description ';
}

@cds.persistence.exists
entity ![V_TS_LOCATION] {
    key ![LOCATION_ID]   : String(4) @title: 'Location ';
    key ![LOCATION_DESC] : String(4) @title: 'Location Description ';
}

@cds.persistence.exists
entity ![V_TS_PRODUCT] {
    key ![PRODUCT_ID] : String(4) @title: 'Product ';
    key ![PROD_DESC]  : String(4) @title: 'Product Description ';
}

@cds.persistence.exists
entity V_PRODUCTCHAR {
    key PRODUCT_ID     : String(40)   @title: 'Product';
    key CHAR_NUM       : String(100)  @title: 'Characteristic';
    key CHAR_DESC      : String(160)          @title: 'Characteristic Description';
        CHAR_NAME      : String(80)           @title: 'Characteristic Name';
        CHAR_VALUE       : String(100) @title: 'Characteristic Value';
}

@cds.persistence.exists
entity ![V_OBJECTDEPCHARDESC] {
    key ![CAL_DATE]     : Date        @title: 'Date ';
    key ![LOCATION_ID]  : String(100) @title: 'Location';
    key ![PRODUCT_ID]   : String(100) @title: 'Product';
    key ![OBJ_TYPE]     : String(100) @title: 'Object Type ';
    key ![OBJ_DEP]      : String(100) @title: 'Object Dependency';
    key ![OBJ_COUNTER]  : String(100) @title: 'Object Counter ';
    key ![ROW_ID]       : String(100) @title: 'Row Id';
    key ![VERSION]      : String(100) @title: 'Version ';
    key ![SCENARIO]     : String(100) @title: 'Scenario';
        ![CHAR_NUM]     : String(100) @title: 'Characteristic Num';
        ![SUCCESS]      : String(100) @title: 'Success';
        ![SUCCESS_RATE] : String(100) @title: 'Success Rate';
        ![CHAR_DESC]    : String(160) @title: 'Characteristic Description';
    key ![CHAR_VALUE]   : String(100) @title: 'Characteristic Value';
        ![CHARVAL_DESC] : String(100) @title: 'Characteristic Value Description';
}

@cds.persistence.exists
entity ![V_HISTORYVC] {
    key ![CAL_DATE]         : Date        @title: 'Date ';
    key ![LOCATION_ID]      : String(100) @title: 'Location ';
    key ![LOCATION_DESC]    : String(40)  @title: 'Location Description ';
    key ![PRODUCT_ID]       : String(100) @title: 'Product ';
    key ![PROD_DESC]        : String(100) @title: 'Product Description ';
    key ![TYPE]             : String(100) @title: 'Type ';
    key ![GROUP_ID]         : String(100) @title: 'Group ID';
    key ![ROW_ID]           : String(100) @title: 'Row';
        ![CHAR_COUNT]       : String(100) @title: 'Characteristic Count ';
        ![CHAR_COUNT_RATE]  : String(100) @title: 'Characteristic Count Rate';
        ![GROUP_COUNT]      : String(100) @title: 'Group Count';
        ![GROUP_COUNT_RATE] : String(100) @title: 'Group Count Rate';
    key ![CHAR_NUM]         : String(100) @title: 'CHAR_NUM';
    key ![CHAR_DESC]        : String(160) @title: 'Characteristic Desc.';
    key ![CHAR_VALUE]       : String(100) @title: 'Characteristic Value';
        ![CHARVAL_DESC]     : String(100) @title: 'Characteristic Value Description';
}


@cds.persistence.exists
entity ![V_PARTIALPRODUCT] {
    key ![PRODUCT_ID] : String(4)  @title: 'Products ';
    key ![REF_PRODID] : String(40) @title: 'Reference Product Id';
        ![PROD_DESC]  : String(40) @title: 'Product Description ';
}

@cds.persistence.exists
entity ![V_SCENARIODIS] {
    key ![SCENARIO] : String(100) @title: 'Scenario ';
}

@cds.persistence.exists
entity ![V_VERSIONDIS] {
    key ![VERSION] : String(100) @title: 'Version ';
}

@cds.persistence.exists
entity ![V_LINECAPACITYVIEW] {
    key ![LOCATION_ID] : String(100) @title: 'Location ';
    key ![PRODUCT_ID]  : String(100) @title: 'Product ';
        ![PROD_DESC]   : String(100) @title: 'Product Description ';
}


@cds.persistence.exists
entity ![V_BOMPVS] {
    key ![LOCATION_ID] : String(4)      @title: 'LOCATION_ID';
    key ![PRODUCT_ID]  : String(40)     @title: 'PRODUCT_ID';
    key ![ITEM_NUM]    : String(6)      @title: 'ITEM_NUM';
    key ![COMPONENT]   : String(40)     @title: 'COMPONENT';
    key ![COMP_QTY]    : Decimal(13, 3) @title: 'COMP_QTY';
    key ![COMP_DESC]   : String(40)     @title: 'COMP_DESC';
    key ![VALID_FROM]  : Date           @title: 'VALID_FROM';
    key ![VALID_TO]    : Date           @title: 'VALID_TO';
    key ![STRUC_NODE]  : String(50)     @title: 'STRUC_NODE';
}

@cds.persistence.exists
entity ![V_IBPVERSCENARIO] {
    key ![LOCATION_ID]   : String(4)  @title: 'LOCATION_ID';
    key ![REF_PRODID]    : String(40) @title: 'REF PRODUCT_ID';
    key ![FACTORY_LOC]   : String(4)  @title: 'FACTORY_LOC';
    key ![PRODUCT_ID]    : String(40) @title: 'PRODUCT_ID';
    key ![VERSION]       : String(10) @title: 'VERSION';
    key ![VERSION_NAME]  : String(50) @title: 'VERSION';
    key ![SCENARIO]      : String(32) @title: 'SCENARIO';
    key ![SCENARIO_NAME] : String(50) @title: 'SCENARIO';
}


@cds.persistence.exists
entity ![V_TS_ODCHARPREDICTIONS] {
    key ![LOCATION_ID]   : String(4)  @title: 'LOCATION_ID';
    key ![PRODUCT_ID]    : String(40) @title: 'PRODUCT_ID';
    key ![OBJ_DEP]       : String(30) @title: 'OBJ_DEP';
    key ![OBJ_COUNTER]   : Integer    @title: 'OBJ_COUNTER';
    key ![MODEL_VERSION] : String(20) @title: 'MODEL_VERSION';
    key ![VERSION]       : String(10) @title: 'VERSION';
    key ![SCENARIO]      : String(32) @title: 'SCENARIO';
    key ![CAL_DATE]      : Date       @title: 'CAL_DATE';
    key ![PREDICTED]     : Double     @title: 'PREDICTED';
    key ![ROW_ID]        : Integer    @title: 'ROW_ID';
    key ![CHAR_NAME]     : String(80) @title: 'CHAR_NAME';
    key ![PREDICTED_VAL] : Double     @title: 'PREDICTED_VAL';
}

@cds.persistence.exists
entity ![V_BOM_TSPREDICTION] {
    key ![LOCATION_ID]   : String(4)  @title: 'LOCATION_ID';
    key ![PRODUCT_ID]    : String(40) @title: 'PRODUCT_ID';
    key ![ITEM_NUM]      : String(6)  @title: 'ITEM_NUM';
    key ![COMPONENT]     : String(40) @title: 'COMPONENT';
    key ![OBJ_DEP]       : String(30) @title: 'OBJ_DEP';
    key ![MODEL_VERSION] : String(20) @title: 'MODEL_VERSION';
    key ![VERSION]       : String(10) @title: 'VERSION';
    key ![SCENARIO]      : String(32) @title: 'SCENARIO';
    key ![CAL_DATE]      : Date       @title: 'CAL_DATE';
    key ![PREDICTED]     : Double     @title: 'PREDICTED';
}

@cds.persistence.exists
entity ![V_PROD_CHARBUCKET] {
    key ![CLASS_NUM]  : String(18)  @title: 'Class Number';
    key ![CHAR_NUM]   : String(100) @title: 'Characteristic Number';
    key ![CHAR_NAME]  : String(80)  @title: 'Characteristic Name';
    key ![CHAR_DESC]  : String(160) @title: 'Characteristic Description';
    key ![CHAR_TYPE]  : String(4)   @title: 'Characteristic Type';
    key ![PRODUCT_ID] : String(40)  @title: 'Product';
    key ![PROD_DESC]  : String(40)  @title: 'Product Description';
}

@cds.persistence.exists
entity ![V_COMPOD_TSPRED] {
    key ![LOCATION_ID]   : String(4)  @title: 'LOCATION_ID';
    key ![PRODUCT_ID]    : String(40) @title: 'PRODUCT_ID';
    key ![ITEM_NUM]      : String(6)  @title: 'ITEM_NUM';
    key ![COMPONENT]     : String(40) @title: 'COMPONENT';
    key ![OBJ_DEP]       : String(30) @title: 'OBJ_DEP';
    key ![OBJ_COUNTER]   : Integer    @title: 'OBJ_COUNTER';
    key ![MODEL_VERSION] : String(20) @title: 'MODEL_VERSION';
    key ![VERSION]       : String(10) @title: 'VERSION';
    key ![SCENARIO]      : String(32) @title: 'SCENARIO';
    key ![CAL_DATE]      : Date       @title: 'CAL_DATE';
    key ![PREDICTED]     : Double     @title: 'PREDICTED';
}

@cds.persistence.exists
entity ![V_ODCHARIMPACT_VALUE] {
    key ![LOCATION_ID]     : String(4)   @title: 'LOCATION_ID';
    key ![PRODUCT_ID]      : String(40)  @title: 'PRODUCT_ID';
    key ![OBJ_DEP]         : String(30)  @title: 'OBJ_DEP';
    key ![OBJ_COUNTER]     : Integer     @title: 'OBJ_COUNTER';
    key ![CHAR_NUM]        : String(100) @title: 'CHAR_NUM';
    key ![CHAR_DESC]       : String(160) @title: 'CHAR_NUM';
    key ![CHAR_NAME]       : String(80)  @title: 'CHAR_NAME';
    key ![ROW_ID]          : Integer     @title: 'ROW_ID';
    key ![MODEL_VERSION]   : String(20)  @title: 'MODEL_VERSION';
    key ![VERSION]         : String(10)  @title: 'VERSION';
    key ![SCENARIO]        : String(32)  @title: 'SCENARIO';
    key ![CAL_DATE]        : Date        @title: 'CAL_DATE';
    key ![CHAR_IMPACT_VAL] : Double      @title: 'CHAR_IMPACT_VAL';
    key ![PREDICTED_VAL]   : Double      @title: 'PREDICTED_VAL';
    key ![OPT_PERCENT]     : Double      @title: 'Option Percnetage';
}

@cds.persistence.exists
entity ![V_FCHARPLAN] {
    key ![WEEK_DATE]    : Date           @title: 'Week Date';
    key ![LOCATION_ID]  : String(4)      @title: 'Location';
    key ![PRODUCT_ID]   : String(40)     @title: 'Product';
    key ![CLASS_NUM]    : String(20)     @title: 'Int. Counter for Class';
    key ![CHAR_NUM]     : String(100)    @title: 'Int. Counter for Characteristic ';
    key ![CHAR_NAME]    : String(80)     @title: 'Characteristic';
    key ![CHAR_DESC]    : String(160)    @title: 'Char Desc';
    key ![CHARVAL_NUM]  : String(80)     @title: 'Int.counter for Characteristic';
    key ![CHAR_VALUE]   : String(80)     @title: 'Characteristic Value ';
    key ![CHARVAL_DESC] : String(160)    @title: 'CHAR_DESC';
    key ![VERSION]      : String(10)     @title: 'Version';
    key ![SCENARIO]     : String(32)     @title: 'Scenario';
    key ![OPT_PERCENT]  : Decimal(5, 2)  @title: 'Option Percent';
    key ![OPT_QTY]      : Decimal(13, 3) @title: 'Option Quantity';
}

@cds.persistence.exists
entity ![V_ASMCOMP_REQ] {
    key ![WEEK_DATE]     : Date       @title: 'CAL_DATE';
    key ![LOCATION_ID]   : String(4)  @title: 'LOCATION_ID';
        // addded
    key ![FACTORY_LOC]   : String(4)  @title: 'FACTORY_LOC';
        // end
    key ![PRODUCT_ID]    : String(40) @title: 'PRODUCT_ID';
    key ![ASSEMBLY]      : String(40) @title: 'ASSEMBLY';
    key ![COMPONENT]     : String(40) @title: 'COMPONENT';
    key ![COMP_QTY]      : Double     @title: 'COMP_QTY';
    key ![VERSION]       : String(10) @title: 'VERSION';
    key ![SCENARIO]      : String(32) @title: 'SCENARIO';
    key ![MODEL_VERSION] : String(20) @title: 'MODEL_VERSION';
}

@cds.persistence.exists
entity ![V_ASSEMBLY_COMP] {
    key ![LOCATION_ID] : String(4)  @title: 'LOCATION_ID';
    key ![ASSEMBLY]    : String(40) @title: 'ASSEMBLY';
    key ![COMPONENT]   : String(40) @title: 'COMPONENT';
    key ![PROD_DESC]   : String(40) @title: 'PROD_DESC';
}

@cds.persistence.exists
entity ![V_PRODCLSCHARVAL] {
    key ![PRODUCT_ID]    : String(40)  @title : 'Product';
    key ![CLASS_NUM]     : String(18)  @title : 'CLASS_NUM';
    key ![CLASS_NAME]    : String(20)  @title : 'CLASS_NAME';
    key ![CLASS_DESC]    : String(150) @title : 'CLASS_DESC';
    key ![IBPCHAR_CHK]   : Boolean     @title : 'IBPCHAR_CHK';
    key ![CHAR_NUM]      : String(100) @title : 'CHAR_NUM';
    key ![CHAR_NAME]     : String(80)  @title : 'CHAR_NAME';
    key ![CHAR_DESC]     : String(160) @title : 'CHAR_DESC';
    key ![CHARVAL_NUM]   : String(80)  @title : 'CHARVAL_NUM';
    key ![CHAR_VALUE]    : String(80)  @title : 'CHAR_VALUE';
    key ![CHARVAL_DESC]  : String(160) @title : 'CHAR_DESC';
    key ![MULTI_CHAR]    : String(1)   @titile: 'Multichar check';
    key ![REF_CHAR_NUM]  : String(100) @title : 'REF_CHAR_NUM';
    key ![REF_CHAR_NAME] : String(80)  @title : 'REF_CHAR_NAME';
        ![CHAR_TYPE]     : String(80)  @title : 'Characteristic Type';
}

@cds.persistence.exists
entity ![V_PRODCLSCHARVAL_MASTER] {
    key ![PRODUCT_ID]   : String(40)  @title : 'Product';
    key ![CLASS_NUM]    : String(18)  @title : 'CLASS_NUM';
    key ![CLASS_NAME]   : String(20)  @title : 'CLASS_NAME';
    key ![CLASS_DESC]   : String(150) @title : 'CLASS_DESC';
    key ![IBPCHAR_CHK]  : Boolean     @title : 'IBPCHAR_CHK';
    key ![CHAR_NUM]     : String(100) @title : 'CHAR_NUM';
    key ![CHAR_NAME]    : String(80)  @title : 'CHAR_NAME';
    key ![CHAR_DESC]    : String(160) @title : 'CHAR_DESC';
    key ![CHARVAL_NUM]  : String(80)  @title : 'CHARVAL_NUM';
    key ![CHAR_VALUE]   : String(80)  @title : 'CHAR_VALUE';
    key ![CHARVAL_DESC] : String(160) @title : 'CHAR_DESC';
    key ![MULTI_CHAR]   : String(1)   @titile: 'Multichar check';
}

@cds.persistence.exists
entity ![V_PARTIALPRODCHAR] {
    key ![PRODUCT_ID]     : String(40)  @title: 'Product';
    key ![LOCATION_ID]    : String(4)   @title: 'Location';
    key ![REF_PRODID]     : String(40)  @title: 'Reference Product Id';
    key ![PROD_DESC]      : String(100) @title: 'Product Description ';
    key ![PROD_TYPE]      : String(4)   @title: 'Product Description ';
    key ![CLASS_NUM]      : String(20)  @title: 'Class Num';
    key ![CLASS_NAME]     : String(20)  @title: 'Class Name';
    key ![CLASS_DESC]     : String(150) @title: 'Characteristic Num';
    key ![CHAR_NUM]       : String(100) @title: 'Characteristic Num';
    key ![CHAR_NAME]      : String(80)  @title: 'Characteristic Name';
    key ![CHAR_DESC]      : String(160) @title: 'Characteristic Description';
    key ![CHARVAL_NUM]    : String(80)  @title: 'Characteristic Value Num';
    key ![CHAR_VALUE]     : String(80)  @title: 'Characteristic Value';
    key ![CHARVAL_DESC]   : String(160) @title: 'Characteristic Value Description';
    key ![IBPCHAR_CHK]    : Boolean     @title: 'IBPCHAR_CHK';
    key ![CONFIGPROD_CHK] : String(1)   @title: 'ConfigProduct check';
}

@cds.persistence.exists
entity ![V_NEWPRODREFCHAR] {
    key ![PRODUCT_ID]      : String(40)  @title: 'PRODUCT_ID';
    key ![LOCATION_ID]     : String(4)   @title: 'LOCATION_ID';
    key ![REF_PRODID]      : String(40)  @title: 'REF_PRODID';
    key ![CLASS_NUM]       : String(20)  @title: 'CLASS_NUM';
    key ![CLASS_NAME]      : String(20)  @title: 'CLASS_NAME';
    key ![CHAR_NUM]        : String(100) @title: 'CHAR_NUM';
    key ![CHAR_NAME]       : String(80)  @title: 'CHAR_NAME';
    key ![CHARVAL_NUM]     : String(80)  @title: 'CHARVAL_NUM';
    key ![CHAR_VALUE]      : String(80)  @title: 'CHAR_VALUE';
    key ![REF_CLASS_NUM]   : String(20)  @title: 'REF_CLASS_NUM';
    key ![REF_CLASSNAME]   : String(20)  @title: 'REF_CLASSNAME';
    key ![REF_CHAR_NUM]    : String(100) @title: 'REF_CHAR_NUM';
    key ![REF_CHARNAME]    : String(30)  @title: 'REF_CHARNAME';
    key ![REF_CHARVAL_NUM] : String(80)  @title: 'REF_CHARVAL_NUM';
    key ![REF_CHARVAL]     : String(70)  @title: 'REF_CHARVAL';
}

@cds.persistence.exists
entity ![V_GETVARCHARPS] {
    key ![PRODUCT_ID] : String(40)  @title: 'PRODUCT_ID';
        // key![LOCATION_ID] : String(4)   @title : 'LOCATION_ID';
    key ![CHAR_NUM]   : String(100) @title: 'CHAR_NUM';
    key ![CHAR_NAME]  : String(80)  @title: 'CHAR_NAME';
    key ![CHAR_DESC]  : String(160) @title: 'CHAR_DESC';
    key ![CHAR_TYPE]  : String(2)   @title: 'CHAR_TYPE';
    key ![SEQUENCE]   : Integer     @title: 'SEQUENCE';
    key ![GROUP_NAME] : String(100) @title: 'Group Name';
}

@cds.persistence.exists
entity ![V_GETIBPCHARPS] {
    key ![PRODUCT_ID]   : String(40)  @title: 'PRODUCT_ID';
        // key![LOCATION_ID] : String(4)   @title : 'LOCATION_ID';
    key ![CHAR_NUM]     : String(100) @title: 'CHAR_NUM';
    key ![REF_CHAR_NUM] : String(100) @title: 'REF CHAR_NUM';
    key ![CHAR_NAME]    : String(80)  @title: 'CHAR_NAME';
    key ![CHAR_DESC]    : String(160) @title: 'CHAR_DESC';
    key ![CHAR_TYPE]    : String(2)   @title: 'CHAR_TYPE';
    key ![SEQUENCE]     : Integer     @title: 'SEQUENCE';
}

@cds.persistence.exists
entity ![V_UNIQUE_ID_ITEM] {
    key ![UNIQUE_ID]    : Integer     @title: 'MATVARID';
    key ![PRODUCT_ID]   : String(40)  @title: 'PRODUCT_ID';
    key ![UNIQUE_DESC]  : String(100) @title: 'UNIQUE DESC';
    key ![CLASS_NUM]    : String(18)  @title: 'CLASS_NUM';
    key ![CLASS_NAME]   : String(150) @title: 'CLASS_NAME';
    key ![CHAR_NUM]     : String(100) @title: 'CHAR_NUM';
    key ![CHAR_NAME]    : String(80)  @title: 'CHAR_NAME';
    key ![CHAR_DESC]    : String(160) @title: 'CHAR_DESC';
    key ![CHARVAL_NUM]  : String(80)  @title: 'CHARVAL_NUM';
    key ![CHAR_VALUE]   : String(80)  @title: 'CHAR_VALUE';
    key ![CHARVAL_DESC] : String(160) @title: 'CHARVAL_DESC';
    key ![UID_TYPE]     : String(1)   @title: 'UID_TYPE';
// key![UID_CHAR_RATE] : Decimal(13, 2) @title : 'UID_CHAR_RATE';
}

@cds.persistence.exists
entity ![V_UNIQUE_ID_ITEMS] {
    key ![UNIQUE_ID]   : Integer     @title: 'MATVARID';
    key ![PRODUCT_ID]  : String(40)  @title: 'PRODUCT_ID';
    key ![UNIQUE_DESC] : String(100) @title: 'UNIQUE DESC';
    key ![CHAR_NUM]    : String(100) @title: 'CHAR_NUM';
    key ![CHAR_NAME]   : String(80)  @title: 'CHAR_NAME';
    key ![CHAR_DESC]   : String(160) @title: 'CHAR_DESC';
    key ![CHARVAL_NUM] : String(80)  @title: 'CHARVAL_NUM';
    key ![CHAR_VALUE]  : String(80)  @title: 'CHAR_VALUE';
    key ![UID_TYPE]    : String(1)   @title: 'UID_TYPE';
}

@cds.persistence.exists
entity ![V_UNIQUE_ID] {
    key ![UNIQUE_ID]   : Integer     @title: 'MATVARID';
    key ![PRODUCT_ID]  : String(40)  @title: 'Product';
    key ![UNIQUE_DESC] : String(100) @title: 'UNIQUE DESC';
    key ![UID_TYPE]    : String(1)   @title: 'CHARVAL_NUM';
    key ![ACTIVE]      : Boolean     @title: 'CHAR_VALUE';
    key ![CHAR_NUM]    : String(100) @title: 'CHAR_NUM';
    key ![CHARVAL_NUM] : String(80)  @title: 'CHARVAL_NUM';
}

@cds.persistence.exists
entity ![V_ODRESTRICT] {
    key ![LOCATION_ID]  : String(4)   @title: 'LOCATION_ID';
    key ![LINE_ID]      : String(40)  @title: 'Line';
    key ![RESTRICTION]  : String(30)  @title: 'Restriction';
    key ![RTR_COUNTER]  : Integer     @title: 'Restriction Counter';
    key ![CLASS_NUM]    : String(18)  @title: 'Internal No. Class ';
    key ![CLASS_NAME]   : String(20)  @title: 'Class Name';
    key ![CLASS_DESC]   : String(150) @title: 'Class Description';
    key ![CHAR_NUM]     : String(100) @title: 'Internal No. Characteristic';
    key ![CHAR_NAME]    : String(80)  @title: 'Characteristic Name';
    key ![CHAR_DESC]    : String(160) @title: 'Characteristic Description';
    key ![CHARVAL_NUM]  : String(80)  @title: 'Internal No. Characteristic value';
    key ![CHAR_VALUE]   : String(80)  @title: 'Characteristic Value';
    key ![CHARVAL_DESC] : String(160) @title: 'Charateristic Value Desc.';
    key ![OD_CONDITION] : String(2)   @title: 'Object Dep. Condition';
    key ![CHAR_COUNTER] : Integer     @title: 'Characteristic Counter';
    key ![ROW_ID]       : Integer     @title: 'Row ID';
        QUANTITY        : Integer     @title: 'Quantity'
}

@cds.persistence.exists
entity ![V_LINECAPACITY] {
    key ![LOCATION_ID]   : String(4)  @title: 'Location';
        ![LOCATION_DESC] : String(40) @title: 'Product Description ';
    key ![LINE_ID]       : String(40) @title: 'Line';
    key ![PRODID]        : String(40) @title: 'Product';
        ![PROD_DESC]     : String(40) @title: 'Product Description ';
        ![CAPACITY]      : Integer    @title: 'Capacity';
        ![LINE_DESC]     : String(30) @title: 'Line Desc';
        ![VALID_FROM]    : Date       @title: 'Valid From';
        ![VALID_TO]      : Date       @title: 'Valid To';
}

@cds.persistence.exists
entity ![V_LOCPRODLINERTR] {
    key ![PRODUCT_ID]  : String(40) @title: 'PRODUCT_ID';
    key ![REF_PRODID]  : String(40) @title: 'REF_PRODID';
    key ![LOCATION_ID] : String(4)  @title: 'LOCATION_ID';
    key ![LINE_ID]     : String(40) @title: 'Line';
    key ![LINE_DESC]   : String(40) @title: 'LINE DESC';
    key ![RESTRICTION] : String(30) @title: 'Restriction';
    key ![RTR_DESC]    : String(30) @title: 'Restriction Description';
    key ![VALID_FROM]  : Date       @title: 'VALID_FROM';
    key ![VALID_TO]    : Date       @title: 'VALID_TO';
}

@cds.persistence.exists
entity ![V_CIR_CHAR_RATE] {
    key ![LOCATION_ID]   : String(4)       @title: 'LOCATION_ID';
    key ![PRODUCT_ID]    : String(40)      @title: 'PRODUCT_ID';
    key ![WEEK_DATE]     : Date            @title: 'WEEK_DATE';
    key ![MODEL_VERSION] : String(20)      @title: 'MODEL_VERSION';
    key ![VERSION]       : String(10)      @title: 'VERSION';
    key ![SCENARIO]      : String(32)      @title: 'SCENARIO';
    key ![CHAR_NUM]      : String(100)     @title: 'CHAR_NUM';
    key ![CHAR_NAME]     : String(80)      @title: 'Characteristic Name';
    key ![CHAR_DESC]     : String(160);
    key ![CHARVAL_NUM]   : String(80)      @title: 'CHARVAL_NUM';
    key ![CHAR_VALUE]    : String(80)      @title: 'Characteristic Value';
    key ![CHARVAL_DESC]  : String(160);
    key ![SEQUENCE]      : Integer         @title: 'SEQUENCE';
    key ![PLAN_QTY]      : Decimal(13, 3)  @title: 'PLAN_QTY';
    key ![GEN_QTY]       : Integer         @title: 'GEN_QTY';
    key ![DEVIATION]     : Decimal(31, 14) @title: 'DEVIATION';
}

@cds.persistence.exists
entity ![V_PLANNEDCONFIG] {
    key ![PARAMETER_ID]      : Integer     @title: 'PARAMETER_ID';
    key ![GROUP_ID]          : Integer     @title: 'GROUP_ID';
    key ![SEQUENCE]          : Integer     @title: 'SEQUENCE';
    key ![DESCRIPTION]       : String(100) @title: 'DESCRIPTION';
    key ![MIN_VALUE]         : Integer     @title: 'MIN_VALUE';
    key ![MAX_VALUE]         : Integer     @title: 'MAX_VALUE';
    key ![VALUE_HELP]        : Boolean     @title: 'VALUE_HELP';
    key ![VALUE_HELP_TAB]    : String(20)  @title: 'VALUE_HELP_TAB';
    key ![GROUP_DESCRIPTION] : String(100) @title: 'GROUP_DESCRIPTION';
    key ![UNIT]              : String(5)   @title: 'UNIT';
    key ![LOCATION_ID]       : String(4)   @title: 'LOCATION_ID';
    key ![VALUE]             : String(500) @title: 'VALUE';
}


@cds.persistence.exists
entity ![V_CIRVERSCEN] {
    key ![LOCATION_ID] : String(4)  @title: 'LOCATION_ID';
    key ![PRODUCT_ID]  : String(40) @title: 'PRODUCT_ID';
    key ![REF_PRODID]  : String(40) @title: 'REF_PRODID';
    key ![VERSION]     : String(10) @title: 'VERSION';
    key ![SCENARIO]    : String(32) @title: 'SCENARIO';
}


@cds.persistence.exists
entity ![V_GETASSEMBLY] {
    key ![LOCATION_ID]   : String(4)  @title: 'LOCATION_ID';
    key ![PRODUCT_ID]    : String(40) @title: 'PRODUCT_ID';
    key ![ITEM_NUM]      : String(6)  @title: 'ITEM_NUM';
    key ![ASSEMBLY]      : String(40) @title: 'ASSEMBLY';
    key ![ASMB_DESC]     : String(40) @title: 'ASSEMBLY DESC';
    key ![COMPONENT]     : String(40) @title: 'COMPONENT';
    key ![COMP_DESC]     : String(40) @title: 'COMPONENT DESC';
        ![VALID_FROM]    : Date       @title: 'VALID_FROM';
        ![VALID_TO]      : Date       @title: 'VALID_TO';
        ![CRITICAL_COMP] : String(1);
}


@cds.persistence.exists
entity ![V_BOMCRITICALCOMP] {
    key ![LOCATION_ID] : String(4)  @title: 'LOCATION_ID';
    key ![PRODUCT_ID]  : String(40) @title: 'PRODUCT_ID';
    key ![ITEM_NUM]    : String(6)  @title: 'ITEM_NUM';
    key ![ASSEMBLY]    : String(40) @title: 'ASSEMBLY';
    key ![COMPONENT]   : String(40) @title: 'COMPONENT';
    key ![COMP_DESC]   : String(40) @title: 'COMPONENT DESC';
        ![VALID_FROM]  : Date       @title: 'VALID_FROM';
        ![VALID_TO]    : Date       @title: 'VALID_TO';
        ![CRITICALKEY] : String(1)  @title: 'CRITICALKEY';
}

@cds.persistence.exists
entity ![V_GETASSEMBLY_NEW] {
    key ![LOCATION_ID]   : String(4)  @title: 'LOCATION_ID';
    key ![MAT_PARENT]    : String(40) @title: 'PRODUCT_ID';
    key ![COUNTER]       : String(6)  @title: 'ITEM_NUM';
    key ![ASSEMBLY]      : String(40) @title: 'ASSEMBLY';
    key ![ASMB_DESC]     : String(40) @title: 'ASSEMBLY DESC';
    key ![COMPONENT]     : String(40) @title: 'COMPONENT';
    key ![COMP_DESC]     : String(40) @title: 'COMPONENT DESC';
        ![VALID_FROM]    : Date       @title: 'VALID_FROM';
        ![VALID_TO]      : Date       @title: 'VALID_TO';
        ![CRITICAL_COMP] : String(1);
}

@cds.persistence.exists
entity ![V_CIR_QTY_VARDESC] {
    key ![LOCATION_ID]   : String(4)      @title: 'LOCATION_ID';
    key ![PRODUCT_ID]    : String(40)     @title: 'PRODUCT_ID';
    key ![WEEK_DATE]     : Date           @title: 'WEEK_DATE';
    key ![MODEL_VERSION] : String(20)     @title: 'MODEL_VERSION';
    key ![VERSION]       : String(10)     @title: 'VERSION';
    key ![SCENARIO]      : String(32)     @title: 'SCENARIO';
    key ![CHAR_NUM]      : String(100)    @title: 'CHAR_NUM';
    key ![CHARVAL_NUM]   : String(80)     @title: 'CHARVAL_NUM';
        ![CHAR_DESC]     : String(160)    @title: 'CHAR_DESC';
        ![CHARVAL_DESC]  : String(160)    @title: 'CHARVAL_DESC';
        ![SEQUENCE]      : Integer        @title: 'SEQUENCE';
        ![OPT_QTY]       : Decimal(13, 3) @title: 'OPT_QTY';
        ![CIR_QTY]       : Integer        @title: 'CIR_QTY';
        ![DIFF_QTY]      : Decimal(14, 3) @title: 'DIFF_QTY';
}

@cds.persistence.exists
entity ![V_SALESORDER_FUTURE] {
    key ![LOCATION_ID] : String(4)      @title: 'LOCATION_ID';
    key ![PRODUCT_ID]  : String(40)     @title: 'PRODUCT_ID';
    key ![WEEK_DATE]   : Date           @title: 'WEEK_DATE';
    key ![UNIQUE_ID]   : Integer        @title: 'UNIQUE_ID';
    key ![ORD_QTY]     : Decimal(13, 3) @title: 'ORD_QTY';
}

@cds.persistence.exists
entity ![V_BOM_DEMDFACLOC] {
    key ![LOCATION_ID] : String(4)      @title: 'LOCATION_ID';
    key ![FACTORY_LOC] : String(4)      @title: 'FACTORY_LOC';
    key ![PRODUCT_ID]  : String(40)     @title: 'PRODUCT_ID';
    key ![ITEM_NUM]    : String(6)      @title: 'ITEM_NUM';
    key ![COMPONENT]   : String(40)     @title: 'COMPONENT';
        ![COMP_TYPE]   : String(4)      @title: 'COMP_TYPE';
        ![COMP_QTY]    : Decimal(13, 3) @title: 'COMP_QTY';
        ![VALID_FROM]  : Date           @title: 'VALID_FROM';
        ![VALID_TO]    : Date           @title: 'VALID_TO';
}

@cds.persistence.exists
entity ![V_SALESALL_WEEK] {
    key ![SALES_DOC]         : String(10)     @title: 'SALES_DOC';
    key ![SALESDOC_ITEM]     : String(10)     @title: 'SALESDOC_ITEM'; // VP-1459 - Increased length of Sales Document Item
    key ![REF_PRODID]        : String(40)     @title: 'REF_PRODID';
    key ![PRODUCT_ID]        : String(40)     @title: 'PRODUCT_ID';
    key ![UNIQUE_ID]         : Integer        @title: 'UNIQUE_ID';
    key ![PRIMARY_ID]        : Integer        @title: 'PRIMARY_ID';
    key ![DOC_CREATEDDATE]   : Date           @title: 'DOC_CREATEDDATE';
    key ![SCHEDULELINE_NUM]  : String(4)      @title: 'SCHEDULELINE_NUM';
    key ![REASON_REJ]        : String(2)      @title: 'REASON_REJ';
    key ![UOM]               : String(3)      @title: 'UOM';
    key ![CONFIRMED_QTY]     : Decimal(13, 3) @title: 'CONFIRMED_QTY';
    key ![ORD_QTY]           : Decimal(13, 3) @title: 'ORD_QTY';
    key ![MAT_AVAILDATE]     : Date           @title: 'MAT_AVAILDATE';
    key ![WEEK_DATE]         : Date           @title: 'WEEK_DATE';
        YEAR                 : String         @title: 'WEEK_DATE-YEAR';
        QUARTER              : String         @title: 'WEEK_DATE-QUARTER';
        MONTH                : String         @title: 'WEEK_DATE-MONTH';
    key ![PERIODDESC]        : String(50)     @title: 'PERIODDESC';
    key ![NET_VALUE]         : Decimal(15, 2) @title: 'NET_VALUE';
    key ![CUSTOMER_GROUP]    : String(20)     @title: 'CUSTOMER_GROUP';
    key ![LOCATION_ID]       : String(4)      @title: 'LOCATION_ID';
    key ![SALE_LOCATION]     : String(4)      @title: 'SALE_LOCATION';
    key ![PLAN_LOC]          : String(4)      @title: 'PLAN_LOC';
    key ![FACTORY_LOC]       : String(4)      @title: 'FACTORY_LOC';
    key ![SEEDORD_CHK]       : String(1)      @title: 'SEEDORD_CHK';
    key ![SALES_ORG]         : String(4)      @title: 'SALES_ORG';
    key ![DISTR_CHANNEL]     : String(2)      @title: 'DISTR_CHANNEL';
    key ![DIVISION]          : String(2)      @title: 'DIVISION';
    key ![SAL_DOCU_TYPE]     : String(4)      @title: 'SAL_DOCU_TYPE';
    key ![ITEM_CREATED_DATE] : Date           @title: 'ITEM_CREATED_DATE';
    key ![ITEM_CHANGE_DATE]  : Date           @title: 'ITEM_CHANGE_DATE';
    key ![IBP_CUSTOMER]      : String(10)     @title: 'IBP_CUSTOMER';
    key ![RELEVENT_FOR_PLAN] : String(1)      @title: 'RELEVENT_FOR_PLAN';
    key ![ON_HAND_STOCK]     : String(1)      @title: 'ON_HAND_STOCK';
    key ![IN_TRANSIT]        : String(1)      @title: 'IN_TRANSIT';
    key ![SHIP_FROM_LOC]     : String(4)      @title: 'SHIP_FROM_LOC';
    key ![CHANGED_DATE]      : Date           @title: 'CHANGED_DATE';
    key ![CHANGED_BY]        : String(12)     @title: 'CHANGED_BY';
    key ![CREATED_DATE]      : Date           @title: 'CREATED_DATE';
    key ![CREATED_BY]        : String(12)     @title: 'CREATED_BY';
    key ![CHANGED_TIME]      : Time           @title: 'CHANGED_TIME';
    key ![CREATED_TIME]      : Time           @title: 'CREATED_TIME';
    key ![RESERVE_FIELD1]    : String(40)     @title: 'Reserve Field1';
    key ![RESERVE_FIELD2]    : String(40)     @title: 'Reserve Field2';
    key ![RESERVE_FIELD3]    : String(40)     @title: 'Reserve Field3';
    key ![RESERVE_FIELD4]    : String(40)     @title: 'Reserve Field4';
    key ![RESERVE_FIELD5]    : String(40)     @title: 'Reserve Field5';
}

@cds.persistence.exists
entity V_PRIORITIZED_CHAR_VALUES {
    key PRODUCT_ID   : String(40)  @title: 'Configurable Product';
    key CHAR_NUM     : String(100) @title: 'Characteristic Number';
        CHAR_NAME    : String(80)  @title: 'Characteristic Name';
        CHAR_DESC    : String(160) @title: 'Characteristic Description';
    key CHARVAL_NUM  : String(80)  @title: 'Characteristic Value ';
        CHARVAL_DESC : String(160) @title: 'Characteristic Value Description';
    key SEQUENCE     : Integer     @title: 'Characteristic Sequence'
}

@cds.persistence.exists
entity V_PRODCONFIGAPI {
    key LOCATION_ID    : String(4)   @title: 'Location';
    key LOCATION_DESC  : String(30)  @title: 'Location Description ';
    key PRODUCT_ID     : String(40)  @title: 'Product';
    key PROD_DESC      : String(40)  @title: 'Product Description ';
    key PROD_TYPE      : String(4)   @title: 'Product Type ';
    key CUSTOMER_GROUP : String(20)  @title: 'CUSTOMER_GROUP';
    key IBP_CUSTOMER   : String(10)  @title: 'IBP_CUSTOMER';
    key CLASS_NUM      : String(20)  @title: 'CLASS_NUM';
    key CLASS_NAME     : String(20)  @title: 'CLASS_NAME';
    key CLASS_DESC     : String(150) @title: 'Class Description';
    key CHAR_DESC      : String(160) @title: 'Characteristic Desc.';
    key CHAR_NUM       : String(100) @title: 'CHAR_NUM';
    key CHAR_NAME      : String(150) @title: 'CHAR_NAME';
    key CHARVAL_NUM    : String(80)  @title: 'CHARVAL_NUM';
    key CHAR_VALUE     : String(80)  @title: 'CHAR_VALUE';
    key CHARVAL_DESC   : String(160) @title: 'Characteristic Value Description';
    key IBPCHAR_CHK    : Boolean     @title: 'IBPCHAR_CHK';
    key VALID_FROM     : Date        @title: 'Valid From';
    key VALID_TO       : Date        @title: 'Valid To';
}

@cds.persistence.exists
entity V_PRODCONFIGAPI_UPDATED {
    key LOCATION_ID     : String(4)   @title: 'Location';
    key LOCATION_DESC   : String(30)  @title: 'Location Description ';
    key PRODUCT_ID      : String(40)  @title: 'Product';
    key PROD_DESC       : String(40)  @title: 'Product Description ';
    key PROD_TYPE       : String(4)   @title: 'Product Type ';
    key CUSTOMER_GROUP  : String(20)  @title: 'CUSTOMER_GROUP';
    key CLASS_NUM       : String(20)  @title: 'CLASS_NUM';
    key CLASS_NAME      : String(20)  @title: 'CLASS_NAME';
    key CLASS_DESC      : String(150) @title: 'Class Description';
    key CHAR_DESC       : String(160) @title: 'Characteristic Desc.';
    key CHAR_NUM        : String(100) @title: 'CHAR_NUM';
    key CHAR_NAME       : String(150) @title: 'CHAR_NAME';
    key CHARVAL_NUM     : String(80)  @title: 'CHARVAL_NUM';
    key CHAR_VALUE      : String(80)  @title: 'CHAR_VALUE';
    key CHARVAL_DESC    : String(160) @title: 'Characteristic Value Description';
    key IBPCHAR_CHK     : Boolean     @title: 'IBPCHAR_CHK';
    key VALID_FROM      : Date        @title: 'Valid From';
    key VALID_TO        : Date        @title: 'Valid To';
    key REF_CHAR_NUM    : String(100) @title: 'REF_CHAR_NUM';
    key REF_CHAR_NAME   : String(30)  @title: 'REF_CHARNAME';
    key REF_CHAR_DESC   : String(160) @title: 'REF_CHAR_DESC';
    key REF_CHARVAL_NUM : String(80)  @title: 'REF_CHARVAL_NUM';
    key REF_CHAR_VALUE  : String(80)  @title: 'REF_CHAR_VALUE';
    key GENFLAG         : String(1)   @title: 'GENFLAG';
}

@cds.persistence.exists
entity V_IBP_SALESHCNFG_VC_IBPCUST {
    key LOCATION_ID  : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID   : String(40)     @title: 'PRODUCT_ID';
    key REF_PRODID   : String(40)     @title: 'PRODUCT_ID';
    key IBP_CUSTOMER : String(10)     @title: 'IBP_CUSTOMER';
    key WEEK_DATE    : Date           @title: 'WEEK_DATE';
    key CLASS_NUM    : String(20)     @title: 'CLASS_NUM';
    key CHAR_NUM     : String(100)    @title: 'CHAR_NUM';
    key CHARVAL_NUM  : String(80)     @title: 'CHARVAL_NUM';
    key IBPCHAR_CHK  : Boolean        @title: 'IBPCHAR_CHK';
    key ORD_QTY      : Decimal(13, 3) @title: 'Ordered Qty';
    key ADJ_QTY      : Decimal(13, 3) @title: 'Ordered Qty';
}

//Where used List
@cds.persistence.exists
entity V_BOMODCHAR {
    key ![LOCATION_ID]   : String(4)   @title: 'LOCATION_ID';
    key ![PRODUCT_ID]    : String(40)  @title: 'PRODUCT_ID';
    key ![ITEM_NUM]      : String(6)   @title: 'Item Number';
    key ![ASSEMBLY]      : String(40)  @title: 'Assembly';
    key ![COMPONENT]     : String(40)  @title: 'Component';
    key ![ASSEMBLY_DESC] : String(4)   @title: 'Assembly Description ';
    key ![CLASS_NUM]     : String(18)  @title: 'Internal class number';
    key ![COMP_DESC]     : String(4)   @title: 'Component Description ';
    key ![CLASS_DESC]    : String(150) @title: 'Class Description';
    key ![CHAR_DESC]     : String(160) @title: 'Characteristic Desc.';
    key ![CHAR_NUM]      : String(100) @title: 'Internal Char. number';
    key ![CHAR_VALUE]    : String(80)  @title: 'Characteristic Value';
    key ![CHARVAL_DESC]  : String(160) @title: 'Characteristic Value Desc.';
    key ![OD_CONDITION]  : String(2)   @title: 'Object Dependency condition ';
}

@cds.persistence.exists
entity ![V_TSHIS_LOCATION] {
    key ![LOCATION_ID]   : String(4) @title: 'Location ';
    key ![LOCATION_DESC] : String(4) @title: 'Location Description ';
}

@cds.persistence.exists
entity ![V_TSHIS_PRODUCT] {
    key ![PRODUCT_ID] : String(4)  @title: 'Product ';
    key ![PROD_DESC]  : String(40) @title: 'Product Description ';
}

//Derived Percentage
@cds.persistence.exists
entity ![V_DERIVEDPERCENTAGE] {
    key ![WEEK_DATE]    : Date        @title: 'Week Date';
    key ![LOCATION_ID]  : String(4)   @title: 'Location ';
    key ![PRODUCT_ID]   : String(40)  @title: 'Product';
    key ![CLASS_NUM]    : String(18)  @title: 'Internal No. Class ';
    key ![CLASS_NAME]   : String(20)  @title: 'Class Name';
    key ![CLASS_DESC]   : String(150) @title: 'Class Description';
    key ![CHAR_NUM]     : String(100) @title: 'Internal No. Characteristic';
    key ![CHAR_NAME]    : String(80)  @title: 'Charateristic Name';
    key ![CHAR_DESC]    : String(160) @title: 'Characteristic Description';
    key ![CHARVAL_NUM]  : String(80)  @title: 'Internal No. Characteristic value';
    key ![CHAR_VALUE]   : String(80)  @title: 'Charateristic Value';
    key ![CHARVAL_DESC] : String(160) @title: 'Charateristic Value Desc.';
    key ![VERSION]      : String(10)  @title: 'Version';
    key ![SCENARIO]     : String(32)  @title: 'Scenario';
    key ![OPT_PERCENT]  : Double      @title: 'Option Percentage';
}

@cds.persistence.exists
entity ![V_DEMANDLOC] {
    key ![DEMAND_LOC]  : String(4)  @title: 'Demand Location';
    key ![DEMAND_DESC] : String(30) @title: 'Location Description';
}

@cds.persistence.exists
entity ![V_SALESH_CONFIG] {
    key ![LOCATION_ID]  : String(4)      @title: 'Location ';
    key ![PRODUCT_ID]   : String(40)     @title: 'Product';
    key ![UNIQUE_ID]    : Integer        @title: 'Unique ID';
    key ![UNIQUE_DESC]  : String(100)    @title: 'Description';
    key ![CHAR_NUM]     : String(100)    @title: 'Internal No. Characteristic';
    key ![CHAR_NAME]    : String(80)     @title: 'Charateristic Name';
    key ![CHAR_DESC]    : String(160)    @title: 'Characteristic Description';
    key ![CHARVAL_NUM]  : String(80)     @title: 'Internal No. Characteristic value';
    key ![CHAR_VALUE]   : String(80)     @title: 'Charateristic Value';
    key ![CHARVAL_DESC] : String(160)    @title: 'Charateristic Value Desc.';
    key ![ORD_QTY]      : Decimal(18, 3) @title: 'Order Quantity';
}

// Sales History configuration

entity SALESH_CONFIG_VT {
    key SALES_DOC     : String(10)  @title: 'Sales Document';
    key SALESDOC_ITEM : String(10)  @title: 'Sales Document Item'; // VP-1459 - Increased length of Sales Document Item
    key CHAR_NUM      : String(100) @title: 'Internal number Char.';
    key CHARVAL_NUM   : String(80)  @title: 'Internal number Char. Value ';
        LOCATION_ID   : String(4)   @title: 'Location ID';
        PRODUCT_ID    : String(40)  @title: 'Product Id';
};

@cds.persistence.exists
entity ![V_UNIQUEDIS] {
    key ![UNIQUE_ID]   : Integer     @title: 'Unique ID';
    key ![UNIQUE_DESC] : String(100) @title: 'Description';
}

@cds.persistence.exists
entity ![V_CHARDISTINCT] {
        // key![CLASS_NUM]   : String(18) @title: 'Class Num';
        // key![CHAR_NUM]    : String(100) @title: 'Internal Char. number';
    key ![CHAR_NAME] : String(80) @title: 'Charateristic Name';
// key![CHARVAL_NUM] : String(80) @title: 'Internal Char. number';
// key![PRODUCT_ID]  : String(40) @title: 'Product';
// key![REF_PRODID]  : String(40) @title: 'Reference Product Id';
}

@cds.persistence.exists

entity V_ASSEMBLYCOMP_DESC {
    key ![LOCATION_ID] : String(4) not null  @title: 'LOCATION_ID';
        LOCATION_DESC  : String(30)          @title: 'LOCATION_DESC';
    key ![ASSEMBLY]    : String(40) not null @title: 'ASSEMBLY';
        ASMB_DESC      : String(40)          @title: 'ASMB_DESC';
    key ![COMPONENT]   : String(40) not null @title: 'COMPONENT';
        CRITICAL_COMP  : String(1)           @title: 'CRITICAL_COMP';
        COMP_TYPE      : String(4)           @title: 'COMP_TYPE';
        COMP_DESC      : String(40)          @title: 'COMP_DESC';
        COMP_QTY       : Integer             @title: 'COMP_QTY';
        VALID_FROM     : Date                @title: 'VALID_FROM';
        VALID_TO       : Date                @title: 'VALID_TO';
        USER           : String(100)         @title: 'User'
}

@cds.persistence.exists
entity ![V_SALES_UNIQUE_ID] {
    key ![PRODUCT_ID]  : String(40)  @title: 'PRODUCT_ID';
    key ![UNIQUE_ID]   : Integer     @title: 'UNIQUE_ID';
        ![UNIQUE_DESC] : String(100) @title: 'UNIQUE_DESC';
        ![PROD_DESC]   : String(40)  @title: 'PROD_DESC';
}

@cds.persistence.exists
entity ![V_LINEMASTERDESC] {
    key ![LOCATION_ID]   : String(4) not null  @title: 'Location';
        ![LOCATION_DESC] : String(30)          @title: 'Location Description';
    key ![LINE_ID]       : String(40) not null @title: 'Line';
        ![LINE_DESC]     : String(30)          @title: 'Line Desc';
}

@cds.persistence.exists
entity ![V_PRODLOCLINEDESC] {
    key ![LOCATION_ID]   : String(4) not null  @title: 'Manufacturing Loc.';
        ![LOCATION_DESC] : String(30)          @title: 'Location Desc.';
    key ![PRODUCT_ID]    : String(40) not null @title: 'Product';
        ![PROD_DESC]     : String(40)          @title: 'Product Desc.';
    key ![LINE_ID]       : String(40) not null @title: 'Line';
        ![LINE_DESC]     : String(30)          @title: 'Line Desc';
}

@cds.persistence.exists
entity ![V_BOMASSEMBLIES] {
    key ![PRODUCT_ID]    : String(40) @title: 'Poduct';
    key ![LOCATION_ID]   : String(4)  @title: 'Location';
    key ![LOCATION_DESC] : String(50) @title: 'Location Description';
    key ![PROD_DESC]     : String(40) @title: 'Product Description';
    key ![PROD_TYPE]     : String(4)  @title: 'Product Type';
}

@cds.persistence.exists
entity ![V_PRODCOMPDESC] {
    key ![PRODUCT_ID] : String(40) @title: 'Product';
    key ![PROD_DESC]  : String(40) @title: 'Product Desc.';
}

@cds.persistence.exists
entity ![V_LOCPRODACCESNODE] {
    key ![LOCATION_ID]   : String(4)  @title: 'Location';
        ![LOCATION_DESC] : String(50) @title: 'Location Description';
    key ![PRODUCT_ID]    : String(40) @title: 'Product';
        ![PROD_DESC]     : String(40) @title: 'Product Desc.';
    key ![ACCESS_NODES]  : String(50);
        ![NODE_DESC]     : String(200); //@tile  : 'Node Descriptions';
}

@cds.persistence.exists
entity ![V_PARTIALPRODDESC] {
    key ![LOCATION_ID]    : String(4)  @title: 'Location Id';
        ![LOCATION_DESC]  : String(40) @title: 'Location Description';
    key ![REF_PRODID]     : String(40) @title: 'Reference Product Id';
        ![REFPROD_DESC]   : String(40) @title: 'Reference Product Description';
    key ![PRODUCT_ID]     : String(40) @title: 'Product Id';
        ![PROD_DESC]      : String(40) @title: 'Product Description';
        ![CONFIGPROD_CHK] : String(1);
}

@cds.persistence.exists
entity ![V_ACCESSNODES] {
    key ![LOCATION_ID]   : String(4)  @title: 'Location Id';
        ![LOCATION_DESC] : String(40) @title: 'Location Description';
    key ![PRODUCT_ID]    : String(40) @title: 'Product Id';
        ![PROD_DESC]     : String(40) @title: 'Product Description';
    key ![ACCESS_NODE]   : String(40) @title: 'Access Nodes';
}

@cds.persistence.exists
entity ![V_RTRHEADER] {
    key ![LOCATION_ID]   : String(4)  @title: 'Location Id';
        ![LOCATION_DESC] : String(40) @title: 'Location Description';
    key ![LINE_ID]       : String(40) @title: 'Line Id';
        ![LINE_DESC]     : String(40) @title: 'Product Description';
        ![PRODUCT_ID]    : String(40) @title: 'Product ID';
        ![RESTRICTION]   : String(40) @title: 'Restriction';
        ![RTR_DESC]      : String(40) @title: 'Restriction Description';
        ![RTR_TYPE]      : String(40) @title: 'Restriction Type';
        ![RTR_QTY]       : String(40) @title: 'Restriction Quantity';
        ![VALID_FROM]    : Date       @title: 'Valid From';
        ![VALID_TO]      : Date       @title: 'Valid To';
}

@cds.persistence.exists
entity ![V_ASMBLOC] {
    key ![LOCATION_ID]   : String(4)  @title: 'Location Id';
        ![LOCATION_DESC] : String(40) @title: 'Location Description';
    key ![ASSEMBLY]      : String(40) @title: 'Assembly';
        ![ASMB_DESC]     : String(40) @title: 'Assembly Description';
}

@cds.persistence.exists
entity ![V_CHARBASE_PLAN] {
    key ![LOCATION_ID]   : String(4)   @title: 'Location ID ';
    key ![PRODUCT_ID]    : String(40)  @title: 'Product ID ';
    key ![CLASS_NUM]     : String(18)  @title: 'Class ID ';
    key ![CHAR_NUM]      : String(100) @title: 'Characteristic ID ';
    key ![CHARVAL_NUM]   : String(80)  @title: 'Characteristic Value ID ';
        ![LOCATION_DESC] : String(30)  @title: 'Location Description ';
        ![PROD_DESC]     : String(40)  @title: 'Product Description ';
        ![CLASS_DESC]    : String(150) @title: 'Class Description ';
        ![CHAR_DESC]     : String(160) @title: 'Characteristic Description ';
        ![CHARVAL_DESC]  : String(160) @title: 'Characteristic Value Description ';
}

@cds.persistence.exists
entity ![V_DAILYHISVC] {
    key ![CAL_DATE]         : Date        @title: 'Date ';
    key ![LOCATION_ID]      : String(100) @title: 'Location ';
    key ![PRODUCT_ID]       : String(100) @title: 'Product ';
    key ![TYPE]             : String(100) @title: 'Type ';
    key ![GROUP_ID]         : String(100) @title: 'Group ID';
    key ![ROW_ID]           : String(100) @title: 'Row';
        ![CHAR_NUM]         : String(100) @title: 'Characterictic Number';
    key ![CHAR_COUNT]       : String(100) @title: 'Characteristic Count ';
    key ![CHAR_COUNT_RATE]  : String(100) @title: 'Characteristic Count Rate';
    key ![GROUP_COUNT]      : String(100) @title: 'Group Count';
    key ![GROUP_COUNT_RATE] : String(100) @title: 'Group Count Rate';
        ![CHAR_DESC]        : String(160) @title: 'Characteristic Desc.';
    key ![CHAR_VALUE]       : String(100) @title: 'Characteristic Value';
        ![CHARVAL_DESC]     : String(100) @title: 'Characteristic Value Description';
}

@cds.persistence.exists
entity ![V_PRODSERIES] {
    key ![PROD_SERIES] : String(30) @title: 'Product Series';
}

@cds.persistence.exists
entity ![V_OPTIMIZEDPREDICTIONS] {
    key ![CAL_DATE]             : Date        @title: 'Date ';
    key ![LOCATION_ID]          : String(100) @title: 'Location';
    key ![PRODUCT_ID]           : String(100) @title: 'Product';
    key ![MODEL_VERSION]        : String(100) @title: 'Model Version ';
    key ![VERSION]              : String(100) @title: 'Version';
    key ![SCENARIO]             : String(100) @title: 'Scenario';
    key ![ALGORITHM]            : String(100) @title: 'Algorithm';
    key ![CHARVAL_NUM]          : String(100) @title: 'Characterstic Value Number';
    key ![CHAR_NUM]             : String(100) @title: 'Characterstic Number';
    key ![PREDICTED_QTY]        : String(100) @title: 'Predicted Quantity';
    key ![IBP_PLANNED_QTY]      : String(100) @title: 'Planned Quantity';
    key ![OPTIMIZED_QTY]        : String(100) @title: 'Optimized Quantity';
    key ![CIRQTY]               : String(160) @title: 'CIR Quantity';
    key ![PREDICTED_DEVIATION]  : String(100) @title: 'Predicted Deviation';
    key ![OPTIMIZED_DEVIATION]  : String(100) @title: 'Optimized Deviation';
    key ![NORMALIZED_DEVIATION] : String(100) @title: 'Normalized Deviation';
    key ![CIR_DEVIATION]        : String(100) @title: 'CIR Deviation';
}

@cds.persistence.exists
entity ![V_OPTIMIZEDFILTERS] {
    key ![CAL_DATE]      : Date        @title: 'Date ';
    key ![LOCATION_ID]   : String(100) @title: 'Location';
    key ![LOCATION_DESC] : String(100) @title: 'Location Description';
    key ![PRODUCT_ID]    : String(100) @title: 'Product';
    key ![PROD_DESC]     : String(100) @title: 'Product Description';
    key ![MODEL_VERSION] : String(100) @title: 'Model Version ';
    key ![ALGORITHM]     : String(100) @title: 'Algorithm';
    key ![VERSION]       : String(100) @title: 'Version';
    key ![SCENARIO]      : String(100) @title: 'Scenario';
    key ![CHARVAL_NUM]   : String(100) @title: 'Characteristic Value Number';
}

@cds.persistence.exists
entity ![V_OPTIMIZEDLOCATION] {
    key ![LOCATION_ID]   : String(100) @title: 'Location';
    key ![LOCATION_DESC] : String(100) @title: 'Location Description';
}

@cds.persistence.exists
entity ![V_OPTIMIZEDALGORITHM] {
    key ![ALGORITHM]     : String(100) @title: 'Algorithm';
    key ![LOCATION_ID]   : String(100) @title: 'Location';
    key ![LOCATION_DESC] : String(100) @title: 'Location Description';
    key ![PRODUCT_ID]    : String(100) @title: 'Product';
    key ![PROD_DESC]     : String(100) @title: 'Product Description';
    key ![MODEL_VERSION] : String(100) @title: 'Model Version ';
}

@cds.persistence.exists
entity ![V_OPTIMIZEDDATE] {
    key ![CAL_DATE]      : Date        @title: 'Date ';
    key ![LOCATION_ID]   : String(100) @title: 'Location';
    key ![LOCATION_DESC] : String(100) @title: 'Location Description';
}

@cds.persistence.exists
entity ![V_OPTIMIZEDPRODUCT] {
    key ![PRODUCT_ID]    : String(100) @title: 'Product';
    key ![PROD_DESC]     : String(100) @title: 'Product Description';
    key ![LOCATION_ID]   : String(100) @title: 'Location';
    key ![LOCATION_DESC] : String(100) @title: 'Location Description';
}

@cds.persistence.exists
entity ![V_OPTIMIZEDMODELVERSION] {
    key ![MODEL_VERSION] : String(100) @title: 'Model Version ';
    key ![LOCATION_ID]   : String(100) @title: 'Location';
    key ![LOCATION_DESC] : String(100) @title: 'Location Description';
    key ![PRODUCT_ID]    : String(100) @title: 'Product';
    key ![PROD_DESC]     : String(100) @title: 'Product Description';
}

@cds.persistence.exists
entity ![V_OPTIMIZEDVERSION] {
    key ![VERSION]       : String(100) @title: 'Version';
    key ![LOCATION_ID]   : String(100) @title: 'Location';
    key ![LOCATION_DESC] : String(100) @title: 'Location Description';
}

@cds.persistence.exists
entity ![V_OPTIMIZEDSCENARIO] {
    key ![SCENARIO]      : String(100) @title: 'Scenario';
    key ![LOCATION_ID]   : String(100) @title: 'Location';
    key ![LOCATION_DESC] : String(100) @title: 'Location Description';
}

@cds.persistence.exists
entity ![V_OPTIMIZEDCHARVAL] {
    key ![MODEL_VERSION] : String(100) @title: 'Model Version ';
    key ![LOCATION_ID]   : String(100) @title: 'Location';
    key ![LOCATION_DESC] : String(100) @title: 'Location Description';
    key ![PRODUCT_ID]    : String(100) @title: 'Product';
    key ![PROD_DESC]     : String(100) @title: 'Product Description';
    key ![CHARVAL_NUM]   : String(100) @title: 'Characteristic Value Number';
    key ![ALGORITHM]     : String(100) @title: 'Algorithm';
}

entity JOB_SAVEDCONFIG_DATA {
    key SEQUENCE_ID : String(50);
        CONFIG_DATA : LargeString;
}


@cds.persistence.exists
entity V_PRODCONFIGAPI_COPY {
    key LOCATION_ID    : String(4)   @title: 'Location';
    key LOCATION_DESC  : String(30)  @title: 'Location Description ';
    key PRODUCT_ID     : String(40)  @title: 'Product';
    key PROD_DESC      : String(40)  @title: 'Product Description ';
    key PROD_TYPE      : String(4)   @title: 'Product Type ';
    key CUSTOMER_GROUP : String(20)  @title: 'CUSTOMER_GROUP';
    key IBP_CUSTOMER   : String(10)  @title: 'IBP_CUSTOMER';
    key CLASS_NUM      : String(20)  @title: 'CLASS_NUM';
    key CLASS_NAME     : String(20)  @title: 'CLASS_NAME';
    key CLASS_DESC     : String(150) @title: 'Class Description';
    key CHAR_DESC      : String(160) @title: 'Characteristic Desc.';
    key CHAR_NUM       : String(100) @title: 'CHAR_NUM';
    key CHAR_NAME      : String(80)  @title: 'CHAR_NAME';
    key CHARVAL_NUM    : String(80)  @title: 'CHARVAL_NUM';
    key CHAR_VALUE     : String(80)  @title: 'CHAR_VALUE';
    key CHARVAL_DESC   : String(160) @title: 'Characteristic Value Description';
    key IBPCHAR_CHK    : Boolean     @title: 'IBPCHAR_CHK';
    key VALID_FROM     : String(10)  @title: 'Valid From';
    key VALID_TO       : String(10)  @title: 'Valid To';
}

@cds.persistence.exists
entity V_SALESUNQ_DATA {
    key SALES_DOC              : String(10)      @title: 'SALES_DOC';
    key SALESDOC_ITEM          : String(10)      @title: 'SALESDOC_ITEM'; // VP-1459 - Increased length of Sales Document Item
        REF_PRODID             : String(40)      @title: 'REF_PRODID';
    key PRODUCT_ID             : String(40)      @title: 'PRODUCT_ID';
    key UNIQUE_ID              : Integer         @title: 'UNIQUE_ID';
        PRIMARY_ID             : Integer         @title: 'PRIMARY_ID';
        SCHEDULELINE_NUM       : String(4)       @title: 'SCHEDULELINE_NUM';
        REASON_REJ             : String(2)       @title: 'REASON_REJ';
        CONFIRMED_QTY          : Decimal(13, 3)  @title: 'CONFIRMED_QTY';
        ORD_QTY                : Decimal(13, 3)  @title: 'ORD_QTY';
        ORD_QTY_MAX            : Decimal(13, 3)  @title: 'ORD_QTY_MAX';
    key MAT_AVAILDATE          : Date            @title: 'MAT_AVAILDATE';
        WEEK_DATE              : Date            @title: 'WEEK_DATE';
        YEAR                   : String          @title: 'WEEK_DATE-YEAR';
        QUARTER                : String          @title: 'WEEK_DATE-QUARTER';
        MONTH                  : String          @title: 'WEEK_DATE-MONTH';
        PERIODDESC             : String(50)      @title: 'PERIODDESC';
        CUSTOMER_GROUP         : String(20)      @title: 'CUSTOMER_GROUP';
        LOCATION_ID            : String(4)       @title: 'LOCATION_ID';
        SEEDORD_CHK            : String(1)       @title: 'SEEDORD_CHK';
        SALES_ORG              : String(4)       @title: 'SALES_ORG';
        DISTR_CHANNEL          : String(2)       @title: 'DISTR_CHANNEL';
        DIVISION               : String(2)       @title: 'DIVISION';
        RESERVE_FIELD1         : String(40)      @title: 'Reserve Field1';
        RESERVE_FIELD2         : String(40)      @title: 'Reserve Field2';
        RESERVE_FIELD3         : String(40)      @title: 'Reserve Field3';
        RESERVE_FIELD4         : String(40)      @title: 'Reserve Field4';
        RESERVE_FIELD5         : String(40)      @title: 'Reserve Field5';
        UNIQUE_DESC            : String(100)     @title: 'UNIQUE_DESC';
        // key CLASS_NUM        : String(18)     @title: 'CLASS_NUM';
        //     CLASS_NAME       : String(20)     @title: 'CLASS_NAME';
    key CHAR_NUM               : String(100)     @title: 'CHAR_NUM';
        CHAR_NAME              : String(80)      @title: 'CHAR_NAME';
        CHAR_DESC              : String(160)     @title: 'CHAR_DESC';
    key CHARVAL_NUM            : String(80)      @title: 'CHARVAL_NUM';
        CHAR_VALUE             : String(80)      @title: 'CHAR_VALUE';
        CHARVAL_DESC           : String(160)     @title: 'CHARVAL_DESC';
        UID_CHAR_RATE          : Decimal(13, 2)  @title: 'UID_CHAR_RATE';
        VALID_FROM             : Date            @title: 'VALID_FROM';
        VALID_TO               : Date            @title: 'VALID_TO';
        CHAR_TOT_ORD_QTY       : Decimal(18, 3)  @title: 'CHAR_TOT_ORD_QTY';
        CHAR_TOT_CONFIRMED_QTY : Decimal(18, 3)  @title: 'CHAR_TOT_CONFIRMED_QTY';
        ORD_QTY_PERCENT        : Decimal(38, 22) @title: 'ORD_QTY_PERCENT';
        ASONFIRMED_QTY_PERCENT : Decimal(38, 22) @title: 'ASONFIRMED_QTY_PERCENT';
}


@cds.persistence.exists
entity V_COMPONENT_REQ {
    key LOCATION_ID   : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID    : String(40)     @title: 'PRODUCT_ID';
    key WEEK_DATE     : Date           @title: 'WEEK_DATE';
    key FACTORY_LOC   : String(4)      @title: 'FACTORY_LOC';
    key VERSION       : String(10)     @title: 'VERSION';
    key SCENARIO      : String(32)     @title: 'SCENARIO';
    key ASSEMBLY      : String(40)     @title: 'ASSEMBLY';
    key COMPONENT     : String(40)     @title: 'COMPONENT';
    key MODEL_VERSION : String(20)     @title: 'MODEL_VERSION';
    key IBP_DEMAND    : Decimal(18, 3) @title: 'IBP_DEMAND';
        ASMB_DESC     : String(40)     @title: 'ASMB_DESC';
        COMP_DESC     : String(40)     @title: 'COMP_DESC';
        STRUC_NODE    : String(50)     @title: 'STRUC_NODE';
        ASM_COM_QTY   : Integer        @title: 'ASM_COM_QTY';
        COMP_QTY      : Decimal(28, 3) @title: 'COMP_QTY';
    key ROW_COUNT     : Integer        @title: 'ROW_COUNT';
        ACT_ASSEM_QTY : Decimal(18, 3) @title: 'ACT_ASSEM_QTY';
}

@cds.persistence.exists
entity V_COMPONENT_REQ2 {
    key LOCATION_ID   : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID    : String(40)     @title: 'PRODUCT_ID';
    key WEEK_DATE     : Date           @title: 'WEEK_DATE';
    key FACTORY_LOC   : String(4)      @title: 'FACTORY_LOC';
    key VERSION       : String(10)     @title: 'VERSION';
    key SCENARIO      : String(32)     @title: 'SCENARIO';
    key ITEM_NUM      : String(6)      @title: 'ITEM_NUM';
    key ASSEMBLY      : String(40)     @title: 'ASSEMBLY';
    key COMPONENT     : String(40)     @title: 'COMPONENT';
        COMP_DESC     : String(40)     @title: 'COMP_DESC';
    key MODEL_VERSION : String(20)     @title: 'MODEL_VERSION';
        PERCENTAGE    : Decimal(34)    @title: 'PERCENTAGE';
        ASSEM_QTY     : Decimal(18, 3) @title: 'ASSEM_QTY';
    key IBP_DEMAND    : Decimal(18, 3) @title: 'IBP_DEMAND';
        ASMB_DESC     : String(40)     @title: 'ASMB_DESC';
        ASM_COM_QTY   : Integer        @title: 'ASM_COM_QTY';
        COMP_QTY      : Decimal(28, 3) @title: 'COMP_QTY';
        STRUC_NODE    : String(50)     @title: 'STRUC_NODE';
    key ROW_COUNT     : Integer        @title: 'ROW_COUNT';
}

@cds.persistence.exists
entity V_FPLAN_CONS_FCHAR {
    key LOCATION_ID     : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID      : String(40)     @title: 'PRODUCT_ID';
    key CHAR_NUM        : String(100)    @title: 'CHAR_NUM';
        CHAR_NAME       : String(80)     @title: 'CHAR_NAME';
        CHAR_DESC       : String(160)    @title: 'CHAR_DESC';
    key CHARVAL_NUM     : String(80)     @title: 'CHARVAL_NUM';
        CHAR_VALUE      : String(80)     @title: 'CHAR_VALUE';
        CHARVAL_DESC    : String(150)    @title: 'CHARVAL_DESC';
    key VERSION         : String(10)     @title: 'VERSION';
    key SCENARIO        : String(32)     @title: 'SCENARIO';
        VERSION_NAME    : String(50)     @title: 'VERSION NAME';
        SCENARIO_NAME   : String(50)     @title: 'SCENARIO NAME';
        CALENDAR_WEEK   : String(50)     @title: 'Calendar Week';
        TELESCOPIC_WEEK : String(50)     @title: 'Telescopic Week';
        WEEK_STARTDATE  : Date           @title: 'Week Date';
        WEEK_ENDDATE    : Date           @title: 'Week Date';
        OPT_PERCENT     : Decimal(5, 2)  @title: 'OPT_PERCENT';
        QUANTITY        : Decimal(13, 3) @title: 'QUANTITY';
}


@cds.persistence.exists 
entity V_FCHARPLANTELEWEEK {
        key LOCATION_ID: String(4)  @title: 'LOCATION_ID' ; 
        key PRODUCT_ID: String(40)  @title: 'PRODUCT_ID' ; 
        key CHAR_NUM: String(100)  @title: 'CHAR_NUM' ; 
        key CHARVAL_NUM: String(80)  @title: 'CHARVAL_NUM' ; 
        key VERSION: String(10)  @title: 'VERSION' ; 
        key SCENARIO: String(32)  @title: 'SCENARIO' ; 
        PERIODSTART: Date  @title: 'PERIODSTART' ; 
        PERIODEND: Date  @title: 'PERIODEND' ; 
        TELESCOPIC_WEEK: String(50)  @title: 'TELESCOPIC_WEEK' ; 
        PERCENT: Decimal(5, 2)  @title: 'PERCENT' ; 
        QUANTITY: Decimal(18, 3)  @title: 'QUANTITY' ; 
}
@cds.persistence.exists
entity V_FPLAN_CONS_FDEMAND {
    key LOCATION_ID     : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID      : String(40)     @title: 'PRODUCT_ID';
    key CHAR_NUM        : String(100)    @title: 'CHAR_NUM';
        CHAR_NAME       : String(80)     @title: 'CHAR_NAME';
        CHAR_DESC       : String(160)    @title: 'CHAR_DESC';
    key CHARVAL_NUM     : String(80)     @title: 'CHARVAL_NUM';
        CHAR_VALUE      : String(80)     @title: 'CHAR_VALUE';
        CHARVAL_DESC    : String(150)    @title: 'CHARVAL_DESC';
    key VERSION         : String(10)     @title: 'VERSION';
    key SCENARIO        : String(32)     @title: 'SCENARIO';
        VERSION_NAME    : String(50)     @title: 'VERSION NAME';
        SCENARIO_NAME   : String(50)     @title: 'SCENARIO NAME';
        CALENDAR_WEEK   : String(50)     @title: 'Calendar Week';
        TELESCOPIC_WEEK : String(50)     @title: 'Telescopic Week';
        WEEK_STARTDATE  : Date           @title: 'Week Date';
        WEEK_ENDDATE    : Date           @title: 'Week Date';
        OPT_PERCENT     : Decimal(5, 2)  @title: 'OPT_PERCENT';
        QUANTITY        : Decimal(13, 3) @title: 'QUANTITY';
}

@cds.persistence.exists
entity V_FPLAN_CONS {
    key LOCATION_ID     : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID      : String(40)     @title: 'PRODUCT_ID';
    key CHAR_NUM        : String(100)    @title: 'CHAR_NUM';
        CHAR_NAME       : String(80)     @title: 'CHAR_NAME';
        CHAR_DESC       : String(160)    @title: 'CHAR_DESC';
    key CHARVAL_NUM     : String(80)     @title: 'CHARVAL_NUM';
        CHAR_VALUE      : String(80)     @title: 'CHAR_VALUE';
        CHARVAL_DESC    : String(150)    @title: 'CHARVAL_DESC';
    key VERSION         : String(10)     @title: 'VERSION';
    key SCENARIO        : String(32)     @title: 'SCENARIO';
        VERSION_NAME    : String(50)     @title: 'VERSION NAME';
        SCENARIO_NAME   : String(50)     @title: 'SCENARIO NAME';
        CALENDAR_WEEK   : String(50)     @title: 'Calendar Week';
        TELESCOPIC_WEEK : String(50)     @title: 'Telescopic Week';
        WEEK_STARTDATE  : Date           @title: 'Week Date';
        WEEK_ENDDATE    : Date           @title: 'Week Date';
        OPT_PERCENT     : Decimal(5, 2)  @title: 'OPT_PERCENT';
        QUANTITY        : Decimal(13, 3) @title: 'QUANTITY';
}

@cds.persistence.exists
entity V_CIRUNIQUECHAR {
    key LOCATION_ID     : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID      : String(40)     @title: 'PRODUCT_ID';
    key REF_PRODID      : String(40)     @title: 'REF_PRODID';
    key WEEK_DATE       : Date           @title: 'WEEK_DATE';
        YEAR            : String         @title: 'WEEK_DATE-YEAR';
        QUARTER         : String         @title: 'WEEK_DATE-QUARTER';
        MONTH           : String         @title: 'WEEK_DATE-MONTH';
    key CIR_ID          : Integer        @title: 'CIR_ID';
    key MODEL_VERSION   : String(20)     @title: 'MODEL_VERSION';
    key VERSION         : String(10)     @title: 'VERSION';
    key SCENARIO        : String(32)     @title: 'SCENARIO';
    key VERSION_NAME    : String(100)    @title: 'VERSION Name';
    key SCENARIO_NAME   : String(100)    @title: 'SCENARIO Name';
    key UNIQUE_ID       : Integer        @title: 'UNIQUE_ID';
        CIR_QTY         : Integer        @title: 'CIR_QTY';
        CIR_QTY_AVG     : Integer        @title: 'CIR_QTY_AVG';
        CHAR_DESC       : String(160)    @title: 'CHAR_DESC';
        CHARVAL_DESC    : String(160)    @title: 'CHARVAL_DESC';
    key CHAR_NUM        : String(100)    @title: 'CHAR_NUM';
        CHAR_NAME       : String(80)     @title: 'CHAR_NAME';
    key CHARVAL_NUM     : String(80)     @title: 'CHARVAL_NUM';
        CHAR_VALUE      : String(80)     @title: 'CHAR_VALUE';
        PERIODDESC      : String(50)     @title: 'Period Description';
        RESERVE_FIELD1  : String(40)     @title: 'Reserve Field1';
        RESERVE_FIELD2  : String(40)     @title: 'Reserve Field2';
        RESERVE_FIELD3  : String(40)     @title: 'Reserve Field3';
        RESERVE_FIELD4  : String(40)     @title: 'Reserve Field4';
        RESERVE_FIELD5  : String(40)     @title: 'Reserve Field5';
        CIR_QTY_TOT     : Integer        @title: 'CIR_QTY_TOT';
        CIR_QTY_PERCENT : Decimal(19, 6) @title: 'CIR_QTY_PERCENT';
}

@cds.persistence.exists
entity V_COMPREQ_REP {
    key LOCATION_ID   : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID    : String(40)     @title: 'PRODUCT_ID';
    key ITEM_NUM      : String(6)      @title: 'ITEM_NUM';
    key COMPONENT     : String(40)     @title: 'COMPONENT';
    key WEEK_DATE     : Date           @title: 'WEEK_DATE';
    key FACTORY_LOC   : String(4)      @title: 'FACTORY_LOC';
    key VERSION       : String(10)     @title: 'VERSION';
    key SCENARIO      : String(32)     @title: 'SCENARIO';
    key MODEL_VERSION : String(20)     @title: 'MODEL_VERSION';
        PERCENTAGE    : Decimal(34)    @title: 'PERCENTAGE';
        COMP_QTY      : Decimal(18, 3) @title: 'COMP_QTY';
    key IBP_DEMAND    : Decimal(18, 3) @title: 'IBP_DEMAND';
}

@cds.persistence.exists
entity V_FCO_QTYS {
    key LOCATION_ID   : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID    : String(40)     @title: 'PRODUCT_ID';
    key WEEK_DATE     : Date           @title: 'WEEK_DATE';
    key MODEL_VERSION : String(20)     @title: 'MODEL_VERSION';
    key VERSION       : String(10)     @title: 'VERSION';
    key SCENARIO      : String(32)     @title: 'SCENARIO';
    key CHAR_NUM      : String(100)    @title: 'CHAR_NUM';
    key CHARVAL_NUM   : String(80)     @title: 'CHARVAL_NUM';
        OPT_QTY       : Decimal(18, 3) @title: 'OPT_QTY';
        CIR_QTY       : Integer        @title: 'CIR_QTY';
        DIFF_QTY      : Decimal(18, 3) @title: 'DIFF_QTY';
        ABS_DIFF      : Decimal(18, 3) @title: 'ABS_DIFF';
        CHAR_DESC     : String(160)    @title: 'CHAR_DESC';
        CHARVAL_DESC  : String(160)    @title: 'CHARVAL_DESC';
        CHAR_NAME     : String(80)     @title: 'CHAR_NAME';
        CHAR_VALUE    : String(80)     @title: 'CHAR_VALUE';
}

@cds.persistence.exists
entity V_SNAPSHOT {
    key SNAP_TIMESTAMP : Timestamp   @title: 'SNAP_TIMESTAMP';
    key LOCATION_ID    : String(4)   @title: 'LOCATION_ID';
        LOCATION_DESC  : String(30)  @title: 'Location Description';
    key PRODUCT_ID     : String(40)  @title: 'PRODUCT_ID';
        PROD_DESC      : String(40)  @title: 'Product Description';
    key UNIQUE_ID      : Integer     @title: 'UNIQUE_ID';
        UNIQUE_DESC    : String(100) @title: 'Unique ID Description';
    key WEEK_DATE      : Date        @title: 'WEEK_DATE';
        CIR_QTY        : Integer     @title: 'CIR_QTY';
        SNAPSHOT_DESC  : String(60)  @title: 'SNAPSHOT_DESC';
        FROM_DATE      : Date        @title: 'FROM_DATE';
        TO_DATE        : Date        @title: 'TO_DATE';
        TYPE           : String(5)   @title: 'Snapshot Type';
}

@cds.persistence.exists
entity V_ASMB_SNAPSHOT {
    key SNAP_TIMESTAMP : Timestamp              @title: 'SNAP_TIMESTAMP';
        SNAPSHOT_DESC  : String(60)             @title: 'SNAPSHOT_DESC';
        FROM_DATE      : Date                   @title: 'FROM_DATE';
        TO_DATE        : Date                   @title: 'TO_DATE';
        TYPE           : String(5) default 'NA' @title: 'Snapshot Type';
    key LOCATION_ID    : String(4)              @title: 'LOCATION_ID';
    key PRODUCT_ID     : String(40)             @title: 'PRODUCT_ID';
    key WEEK_DATE      : Date                   @title: 'WEEK_DATE';
        REF_PRODID     : String(40)             @title: 'Ref. Product';
        PROD_DESC      : String(40)             @title: 'Product Description';
        FACTORY_LOC    : String(4) default 'NA' @title: 'Factory Location';
        LOCATION_DESC  : String(30)             @title: 'Location Description';
        ITEM_NUM       : String(6)              @title: 'Item Number';
        COMPONENT      : String(40)             @title: 'Component';
        COMP_DESC      : String(40)             @title: 'Assembly Description';
        CIR_QTY        : Integer                @title: 'CIR QTY';
        COMPCIR_QTY    : Decimal(13, 3)         @title: 'CIR Component QTY';
}

@cds.persistence.exists
entity V_COMP_SNAPSHOT {
    key SNAP_TIMESTAMP : Timestamp              @title: 'SNAP_TIMESTAMP';
        SNAPSHOT_DESC  : String(60)             @title: 'SNAPSHOT_DESC';
        FROM_DATE      : Date                   @title: 'FROM_DATE';
        TO_DATE        : Date                   @title: 'TO_DATE';
        TYPE           : String(5) default 'NA' @title: 'Snapshot Type';
    key LOCATION_ID    : String(4)              @title: 'LOCATION_ID';
        LOCATION_DESC  : String(30)             @title: 'Location Description';
        PROD_DESC      : String(40)             @title: 'Product Description';
    key PRODUCT_ID     : String(40)             @title: 'PRODUCT_ID';
    key WEEK_DATE      : Date                   @title: 'WEEK_DATE';
        FACTORY_LOC    : String(4) default 'NA' @title: 'Factory Location';
        COMPONENT      : String(40)             @title: 'Component';
        COMP_DESC      : String(40)             @title: 'Component Description';
        CIR_QTY        : Integer                @title: 'CIR QTY';
        COMP_QTY       : Decimal(13, 3)         @title: 'CIR Component QTY';
// IBP_DEMAND     : Decimal(18, 3) not null @title : 'IBP_DEMAND';
// PERCENTAGE     : Decimal(34)             @title : 'PERCENTAGE';
}

@cds.persistence.exists
entity V_RTR_SNAPSHOT {
    key SNAP_TIMESTAMP : Timestamp              @title: 'SNAP_TIMESTAMP';
        SNAPSHOT_DESC  : String(60)             @title: 'SNAPSHOT_DESC';
        FROM_DATE      : Date                   @title: 'FROM_DATE';
        TO_DATE        : Date                   @title: 'TO_DATE';
        TYPE           : String(5) default 'NA' @title: 'Snapshot Type';
    key LOCATION_ID    : String(4)              @title: 'LOCATION_ID';
    key PRODUCT_ID     : String(40)             @title: 'PRODUCT_ID';
        LOCATION_DESC  : String(30)             @title: 'Location Description';
        PROD_DESC      : String(40)             @title: 'Product Description';
        RTR_DESC       : String(30)             @title: 'Restriction Desc';
        LINE_ID        : String(40)             @title: 'Line';
        LINE_DESC      : String(30)             @title: 'Line Desc';
    key WEEK_DATE      : Date                   @title: 'WEEK_DATE';
        REF_PRODID     : String(40)             @title: 'Ref. Product';
        FACTORY_LOC    : String(4) default 'NA' @title: 'Factory Location';
        ITEM_NUM       : String(6)              @title: 'Item Number';
        COMPONENT      : String(40)             @title: 'Component';
        CIR_QTY        : Integer                @title: 'CIR QTY';
        COMPCIR_QTY    : Decimal(13, 3)         @title: 'CIR Component QTY';
}

@cds.persistence.exists
entity V_FD_SNAPSHOT {
    key SNAP_TIMESTAMP : Timestamp              @title: 'SNAP_TIMESTAMP';
        SNAPSHOT_DESC  : String(60)             @title: 'SNAPSHOT_DESC';
        FROM_DATE      : Date                   @title: 'FROM_DATE';
        TO_DATE        : Date                   @title: 'TO_DATE';
        TYPE           : String(5) default 'NA' @title: 'Snapshot Type';
    key LOCATION_ID    : String(4)              @title: 'LOCATION_ID';
    key PRODUCT_ID     : String(40)             @title: 'PRODUCT_ID';
        LOCATION_DESC  : String(30)             @title: 'Location Description';
        PROD_DESC      : String(40)             @title: 'Product Description';
    key WEEK_DATE      : Date                   @title: 'WEEK_DATE';
        QUANTITY       : Decimal(13, 3)         @title: 'Demand Quantity';
}


@cds.persistence.exists
entity V_BOMUID_ASSEMBLY {
    key LOCATION_ID   : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID    : String(40)     @title: 'PRODUCT_ID';
    key COUNTER       : String(6)      @title: 'COUNTER';
    key COMPONENT     : String(40)     @title: 'COMPONENT';
    key WEEK_DATE     : Date           @title: 'WEEK_DATE';
    key MODEL_VERSION : String(6)      @title: 'MODEL_VERSION';
    key TYPE          : String(2)      @title: 'TYPE';
    key REF_PRODID    : String(40)     @title: 'REF_PRODID';
    key COMP_LOC      : String(4)      @title: 'COMP_LOC';
    key UNIQUE_ID     : Integer        @title: 'UNIQUE_ID';
    key CIR_QTY       : Integer        @title: 'CIR_QTY';
    key COMPCIR_QTY   : Integer        @title: 'COMPCIR_QTY';
    key ACTUAL_QTY    : Decimal(18, 3) @title: 'COMP_QTY';
}

@cds.persistence.exists
entity V_OPT_SNAPSHOT {
    key SNAP_TIMESTAMP : Timestamp              @title: 'SNAP_TIMESTAMP';
        SNAPSHOT_DESC  : String(60)             @title: 'SNAPSHOT_DESC';
        FROM_DATE      : Date                   @title: 'FROM_DATE';
        TO_DATE        : Date                   @title: 'TO_DATE';
        TYPE           : String(5) default 'NA' @title: 'Snapshot Type';
    key LOCATION_ID    : String(4)              @title: 'LOCATION_ID';
    key PRODUCT_ID     : String(40)             @title: 'PRODUCT_ID';
        LOCATION_DESC  : String(30)             @title: 'LOCATION_DESC';
        PROD_DESC      : String(40)             @title: 'PROD_DESC';
    key WEEK_DATE      : Date                   @title: 'WEEK_DATE';
        CUSTOMER_GROUP : String(40)             @title: 'Customer Group';
        KEY_TYPE       : Integer                @title: 'Key Figure Type';
        CHAR_NUM       : String(100)            @title: 'Charateristic Name';
        CHARVAL_NUM    : String(80)             @title: 'Charateristic Value';
        CHAR_DESC      : String(160)            @title: 'CHAR_DESC';
        CHARVAL_DESC   : String(160)            @title: 'CHARVAL_DESC';
        OPT_PERCENT    : Decimal(5, 2)          @title: 'Option Percnetage';
        OPT_QTY        : Decimal(13, 3)         @title: 'Option Quantity';
}

@cds.persistence.exists
entity V_SNAPSHOT_FILTERS {
    key SNAP_TIMESTAMP : Timestamp  @title: 'Snapshot  Timestamp';
        SNAPSHOT_DESC  : String(60) @title: 'Snapshot Description';
    key LOCATION_ID    : String(4)  @title: 'Location ID';
        LOCATION_DESC  : String(30) @title: 'Location Description';
    key PRODUCT_ID     : String(40) @title: 'Product ID';
        PROD_DESC      : String(40) @title: 'Product Description';
}


@cds.persistence.exists
entity ![V_MFLOCATIONMASTER] {
    key ![FACTORY_LOC]   : String(4)  @title: 'Factory Location ';
    key ![LOCATION_DESC] : String(40) @title: 'Factory Loc Description';
}

@cds.persistence.exists
entity ![V_CUST_GROUP] {
    key LOCATION_ID    : String(4)  @title: 'LOCATION_ID';
    key PRODUCT_ID     : String(40) @title: 'PRODUCT_ID';
        CUSTOMER_GROUP : String(20) @title: 'Customer Group';
}

//Option Percentage
@cds.persistence.exists
entity V_OPT_FILTER_VIEW {
    key LOCATION_ID    : String(4) not null   @title: 'Location';
    key PRODUCT_ID     : String(40) not null  @title: 'Product';
        LOCATION_DESC  : String(30)           @title: 'Location Description';
        PROD_DESC      : String(40)           @title: 'Product Description';
    key CUSTOMER_GROUP : String(40) not null  @title: 'Customer Group';
    key CHAR_NUM       : String(100) not null @title: 'Characteristic';
    key CHARVAL_NUM    : String(80) not null  @title: 'Characteristic Value';
        CHAR_DESC      : String(160)          @title: 'Characteristic Description';
        CHAR_NAME      : String(80)           @title: 'Characteristic Name';
        CHARVAL_DESC   : String(160)          @title: 'Characteristic Value Description';
    key MODEL_VERSION  : String(20) not null  @title: 'Model Version';
    key VERSION        : String(10) not null  @title: 'Version ';
        VERSION_NAME   : String(50)           @title: 'Version Name';
        SCENARIO_NAME  : String(50)           @title: 'Scenario Name';
    key SCENARIO       : String(32) not null  @title: 'Scenario';
    key USER           : String(100)          @title: 'User Name';
}

@cds.persistence.exists
entity V_OPT_MANUAL {
    LOCATION_ID    : String(4)    @title: 'Location';
    PRODUCT_ID     : String(40)   @title: 'Product';
    CUSTOMER_GROUP : String(40)   @title: 'Customer Group';
    CHAR_NUM       : String(100) @title: 'Characteristic';
    CHARVAL_NUM    : String(80)  @title: 'Characteristic Value';
    MODEL_VERSION  : String(20)  @title: 'Model Version';
    VERSION        : String(10)  @title: 'Version ';
    SCENARIO       : String(32)  @title: 'Scenario';
    TELESCOPIC_WEEK: String(50)  @title: 'Telescopic Week';
    PERIODSTART    :Date @title:'Period Start';
    PERIODEND      :Date @title:'Period End';
}

@cds.persistence.exists
entity V_FINAL_OPTION_PLAN {
    key LOCATION_ID     : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID      : String(40)     @title: 'PRODUCT_ID';
    key CUSTOMER_GROUP  : String(40)     @title: 'CUSTOMER_GROUP';
    key MODEL_VERSION   : String(20)     @title: 'MODEL_VERSION';
    key CHAR_NUM        : String(100)    @title: 'CHAR_NUM';
    key CHAR_NAME       : String(100)    @title: 'CHAR_NAME';
    key CHARVAL_NUM     : String(80)     @title: 'CHARVAL_NUM';
    key VERSION         : String(10)     @title: 'VERSION';
    key SCENARIO        : String(32)     @title: 'SCENARIO';
        // WEEK_DATE      : Date         @title: 'WEEK_DATE';
        OPT_PERCENT     : Decimal(5, 2)  @title: 'OPT_PERCENT';
        OPT_QTY         : Decimal(13, 3) @title: 'OPT_QTY';
    key TYPE            : Integer        @title: 'TYPE';
        CHAR_DESC       : String(160)    @title: 'CHAR_DESC';
        CHAR_TYPE       : String(4)      @title: 'Charateristic Type';
        CHARVAL_DESC    : String(160)    @title: 'CHARVAL_DESC';
        VERSION_NAME    : String(50)     @title: 'VERSION_NAME';
        SCENARIO_NAME   : String(50)     @title: 'SCENARIO_NAME';
        LOCATION_DESC   : String(30)     @title: 'LOCATION_DESC';
        PROD_DESC       : String(40)     @title: 'PROD_DESC';
        KEY_FIG_ID      : Integer        @title: 'Key Figure ID';
        KEY_FIG_DESC    : String(100)    @title: 'Key Figure Description';
        DISPLAY_ORDER   : Integer        @title: 'Display Order';
        PRIORITY_ORDER  : Integer        @title: 'Sort Order';
        CALENDAR_WEEK   : String(50)     @title: 'Calendar Week';
        TELESCOPIC_WEEK : String(50)     @title: 'Telescopic Week';
        WEEK_STARTDATE  : Date           @title: 'Week Start Date';
        WEEK_ENDDATE    : Date           @title: 'Week End Date';
        PERIODSTART     : Date           @title: 'Period Start Date';
        PERIODEND       : Date           @title: 'Period End Date';
        LOCK            : Boolean        @title: 'Lock';
        COMMENTS        : String         @title: 'Comments';
        USER            : String;
        OLD_VALUE       : Decimal(5, 2);
        DATE_TIME       : DateTime;
        ACT_DEM_VC      : Decimal(18, 3) @title: 'Actual Demand at VC';
        ACT_DEM_PERCENT : Double         @title: 'Actual Demand Percentage at VC';
}

@cds.persistence.exists
entity V_FINAL_OPTION_PLAN_NEW {
    key LOCATION_ID     : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID      : String(40)     @title: 'PRODUCT_ID';
    key CUSTOMER_GROUP  : String(40)     @title: 'CUSTOMER_GROUP';
    key MODEL_VERSION   : String(20)     @title: 'MODEL_VERSION';
    key CHAR_NUM        : String(100)    @title: 'CHAR_NUM';
    key CHAR_NAME       : String(100)    @title: 'CHAR_NAME';
    key CHARVAL_NUM     : String(80)     @title: 'CHARVAL_NUM';
    key VERSION         : String(10)     @title: 'VERSION';
    key SCENARIO        : String(32)     @title: 'SCENARIO';
        // WEEK_DATE      : Date         @title: 'WEEK_DATE';
        OPT_PERCENT     : Decimal(5, 2)  @title: 'OPT_PERCENT';
        OPT_QTY         : Decimal(13, 3) @title: 'OPT_QTY';
    key TYPE            : Integer        @title: 'TYPE';
        CHAR_DESC       : String(160)    @title: 'CHAR_DESC';
        CHAR_TYPE       : String(4)      @title: 'Charateristic Type';
        CHARVAL_DESC    : String(160)    @title: 'CHARVAL_DESC';
        VERSION_NAME    : String(50)     @title: 'VERSION_NAME';
        SCENARIO_NAME   : String(50)     @title: 'SCENARIO_NAME';
        LOCATION_DESC   : String(30)     @title: 'LOCATION_DESC';
        PROD_DESC       : String(40)     @title: 'PROD_DESC';
        KEY_FIG_ID      : Integer        @title: 'Key Figure ID';
        KEY_FIG_DESC    : String(100)    @title: 'Key Figure Description';
        DISPLAY_ORDER   : Integer        @title: 'Display Order';
        PRIORITY_ORDER  : Integer        @title: 'Sort Order';
        CALENDAR_WEEK   : String(50)     @title: 'Calendar Week';
        TELESCOPIC_WEEK : String(50)     @title: 'Telescopic Week';
        WEEK_STARTDATE  : Date           @title: 'Week Start Date';
        WEEK_ENDDATE    : Date           @title: 'Week End Date';
        PERIODSTART     : Date           @title: 'Period Start Date';
        PERIODEND       : Date           @title: 'Period End Date';
        LOCK            : Boolean        @title: 'Lock';
        COMMENTS        : String         @title: 'Comments';
        USER            : String;
        OLD_VALUE       : Decimal(5, 2);
        DATE_TIME       : DateTime;
        ACT_DEM_VC      : Decimal(18, 3) @title: 'Actual Demand at VC';
        ACT_DEM_PERCENT : Double         @title: 'Actual Demand Percentage at VC';
}

@cds.persistence.exists
entity V_TELESCOPIC_FINAL_PLAN {
    key LOCATION_ID     : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID      : String(40)     @title: 'PRODUCT_ID';
    key CUSTOMER_GROUP  : String(40)     @title: 'CUSTOMER_GROUP';
    key MODEL_VERSION   : String(20)     @title: 'MODEL_VERSION';
        CHAR_NUM        : String(100)    @title: 'CHAR_NUM';
        CHARVAL_NUM     : String(80)     @title: 'CHARVAL_NUM';
    key VERSION         : String(10)     @title: 'VERSION';
    key SCENARIO        : String(32)     @title: 'SCENARIO';
    key TYPE            : Integer        @title: 'TYPE';
        OPT_PERCENT     : Double         @title: 'OPT_PERCENT';
        OPT_QTY         : Double         @title: 'OPT_QTY';
        CHAR_DESC       : String(160)    @title: 'CHAR_DESC';
        CHAR_NAME       : String(80)     @title: 'CHAR_NAME';
        CHAR_TYPE       : String(2)      @title: 'CHAR_TYPE';
        CHARVAL_DESC    : String(160)    @title: 'CHARVAL_DESC';
        VERSION_NAME    : String(50)     @title: 'VERSION_NAME';
        SCENARIO_NAME   : String(50)     @title: 'SCENARIO_NAME';
        LOCATION_DESC   : String(30)     @title: 'LOCATION_DESC';
        PROD_DESC       : String(40)     @title: 'PROD_DESC';
    key KEY_FIG_ID      : Integer        @title: 'KEY_FIG_ID';
    key KEY_FIG_DESC    : String(100)    @title: 'KEY_FIG_DESC';
    key DISPLAY_ORDER   : Integer        @title: 'DISPLAY_ORDER';
    key PRIORITY_ORDER  : Integer        @title: 'PRIORITY_ORDER';
    key TELESCOPIC_WEEK : String(50)     @title: 'TELESCOPIC_WEEK';
    key PERIODSTART     : Date           @title: 'PERIODSTART';
    key PERIODEND       : Date           @title: 'PERIODEND';
        ACT_DEM_VC      : Decimal(18, 3) @title: 'Actual Demand at VC';
        ACT_DEM_PERCENT : Double         @title: 'Actual Demand Percentage at VC';
}

@cds.persistence.exists
entity V_TELESCOPIC_FINAL_PLAN_NEW {
    key LOCATION_ID     : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID      : String(40)     @title: 'PRODUCT_ID';
    key CUSTOMER_GROUP  : String(40)     @title: 'CUSTOMER_GROUP';
    key MODEL_VERSION   : String(20)     @title: 'MODEL_VERSION';
        CHAR_NUM        : String(100)    @title: 'CHAR_NUM';
        CHARVAL_NUM     : String(80)     @title: 'CHARVAL_NUM';
    key VERSION         : String(10)     @title: 'VERSION';
    key SCENARIO        : String(32)     @title: 'SCENARIO';
    key TYPE            : Integer        @title: 'TYPE';
        OPT_PERCENT     : Double         @title: 'OPT_PERCENT';
        OPT_QTY         : Double         @title: 'OPT_QTY';
        CHAR_DESC       : String(160)    @title: 'CHAR_DESC';
        CHAR_NAME       : String(80)     @title: 'CHAR_NAME';
        CHAR_TYPE       : String(2)      @title: 'CHAR_TYPE';
        CHARVAL_DESC    : String(160)    @title: 'CHARVAL_DESC';
        VERSION_NAME    : String(50)     @title: 'VERSION_NAME';
        SCENARIO_NAME   : String(50)     @title: 'SCENARIO_NAME';
        LOCATION_DESC   : String(30)     @title: 'LOCATION_DESC';
        PROD_DESC       : String(40)     @title: 'PROD_DESC';
    key KEY_FIG_ID      : Integer        @title: 'KEY_FIG_ID';
    key KEY_FIG_DESC    : String(100)    @title: 'KEY_FIG_DESC';
    key DISPLAY_ORDER   : Integer        @title: 'DISPLAY_ORDER';
    key PRIORITY_ORDER  : Integer        @title: 'PRIORITY_ORDER';
    key TELESCOPIC_WEEK : String(50)     @title: 'TELESCOPIC_WEEK';
    key PERIODSTART     : Date           @title: 'PERIODSTART';
    key PERIODEND       : Date           @title: 'PERIODEND';
        ACT_DEM_VC      : Decimal(18, 3) @title: 'Actual Demand at VC';
        ACT_DEM_PERCENT : Double         @title: 'Actual Demand Percentage at VC';
}


@cds.persistence.exists
entity V_TELESCOPIC_FINAL_PLAN_NEW1 {
    key LOCATION_ID     : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID      : String(40)     @title: 'PRODUCT_ID';
    key CUSTOMER_GROUP  : String(40)     @title: 'CUSTOMER_GROUP';
    key MODEL_VERSION   : String(20)     @title: 'MODEL_VERSION';
        CHAR_NUM        : String(100)    @title: 'CHAR_NUM';
        CHARVAL_NUM     : String(80)     @title: 'CHARVAL_NUM';
    key VERSION         : String(10)     @title: 'VERSION';
    key SCENARIO        : String(32)     @title: 'SCENARIO';
    key TYPE            : Integer        @title: 'TYPE';
        OPT_PERCENT     : Double         @title: 'OPT_PERCENT';
        OPT_QTY         : Double         @title: 'OPT_QTY';
        CHAR_DESC       : String(160)    @title: 'CHAR_DESC';
        CHAR_NAME       : String(80)     @title: 'CHAR_NAME';
        CHAR_TYPE       : String(2)      @title: 'CHAR_TYPE';
        CHARVAL_DESC    : String(160)    @title: 'CHARVAL_DESC';
        VERSION_NAME    : String(50)     @title: 'VERSION_NAME';
        SCENARIO_NAME   : String(50)     @title: 'SCENARIO_NAME';
        LOCATION_DESC   : String(30)     @title: 'LOCATION_DESC';
        PROD_DESC       : String(40)     @title: 'PROD_DESC';
    key KEY_FIG_ID      : Integer        @title: 'KEY_FIG_ID';
    key KEY_FIG_DESC    : String(100)    @title: 'KEY_FIG_DESC';
    key DISPLAY_ORDER   : Integer        @title: 'DISPLAY_ORDER';
    key PRIORITY_ORDER  : Integer        @title: 'PRIORITY_ORDER';
    key TELESCOPIC_WEEK : String(50)     @title: 'TELESCOPIC_WEEK';
    key PERIODSTART     : Date           @title: 'PERIODSTART';
    key PERIODEND       : Date           @title: 'PERIODEND';
        ACT_DEM_VC      : Decimal(18, 3) @title: 'Actual Demand at VC';
        ACT_DEM_PERCENT : Double         @title: 'Actual Demand Percentage at VC';
}



//Option Percentage
@cds.persistence.exists
entity V_OPTION_PERCENTAGE {
    key LOCATION_ID    : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID     : String(40)     @title: 'PRODUCT_ID';
    key CUSTOMER_GROUP : String(40)     @title: 'CUSTOMER_GROUP';
    key MODEL_VERSION  : String(20)     @title: 'MODEL_VERSION';
    key CHAR_NUM       : String(100)    @title: 'CHAR_NUM';
    key CHAR_NAME      : String(100)    @title: 'CHAR_NAME';
    key CHARVAL_NUM    : String(80)     @title: 'CHARVAL_NUM';
    key VERSION        : String(10)     @title: 'VERSION';
    key SCENARIO       : String(32)     @title: 'SCENARIO';
    key WEEK_DATE      : Date           @title: 'WEEK_DATE';
        OPT_PERCENT    : Decimal(5, 2)  @title: 'OPT_PERCENT';
        OPT_QTY        : Decimal(13, 3) @title: 'OPT_QTY';
    key TYPE           : Integer        @title: 'TYPE';
        CHAR_DESC      : String(160)    @title: 'CHAR_DESC';
        CHARVAL_DESC   : String(160)    @title: 'CHARVAL_DESC';
        VERSION_NAME   : String(50)     @title: 'VERSION_NAME';
        SCENARIO_NAME  : String(50)     @title: 'SCENARIO_NAME';
        LOCATION_DESC  : String(30)     @title: 'LOCATION_DESC';
        PROD_DESC      : String(40)     @title: 'PROD_DESC';
        KEY_FIG_ID     : Integer        @title: 'Key Figure ID';
        KEY_FIG_DESC   : String(100)    @title: 'Key Figure Description';
        DISPLAY_ORDER  : Integer        @title: 'Display Order';
        PRIORITY_ORDER : Integer        @title: 'Sort Order';
        LOCK           : Boolean        @title: 'Lock';
        COMMENTS       : String         @title: 'Comments';
        USER           : String;
        OLD_VALUE      : Decimal(5, 2);
        DATE_TIME      : DateTime;
}

@cds.persistence.exists
entity V_CIRLOG {
    key MANDT          : String(3) not null;
    key MATNR          : String(40) not null;
    key CIR_NUM        : String(10) not null;
    key PLANT          : String(34) not null;
    key UNIQUE_ID      : Integer not null;
    key WEEK_DATE      : String(8) not null;
    key CUST_MATERIAL  : String(35) not null;
        YEAR           : String     @title: 'WEEK_DATE-YEAR';
        QUARTER        : String     @title: 'WEEK_DATE-QUARTER';
        MONTH          : String     @title: 'WEEK_DATE-MONTH';
        USER_ID        : String(241);
        QUANTITY       : Decimal(13, 3);
        MSG_TYP        : String(1);
        MESSAGE        : String(220);
        W_DATE         : Date;
        RESERVE_FIELD1 : String(40) @title: 'Reserve Field1';
        RESERVE_FIELD2 : String(40) @title: 'Reserve Field2';
        RESERVE_FIELD3 : String(40) @title: 'Reserve Field3';
        RESERVE_FIELD4 : String(40) @title: 'Reserve Field4';
        RESERVE_FIELD5 : String(40) @title: 'Reserve Field5';
}

@cds.persistence.exists

entity ![V_CP_HIS_PRIMARY_CHARVAL_TS] {
    key ![CAL_DATE]         : Date        @title: 'Date';
    key ![LOCATION_ID]      : String(4)   @title: 'Location';
    key ![PRODUCT_ID]       : String(100) @title: 'Product';
    key ![TYPE]             : String(100) @title: 'Type';
    key ![GROUP_ID]         : String(50)  @title: 'Group ID';
    key ![ROW]              : String(100) @title: 'Row';
    key ![ATTRIBUTE]        : String(100) @title: 'Attribute';
    key ![CHAR_NUM]         : String(100) @title: 'Characteristic Number';
    key ![CHARVAL_NUM]      : String(100) @title: 'Characteristic Value number';
    key ![CHAR_NAME]        : String(100) @title: 'Characteristic Name';
    key ![CHAR_VALUE]       : String(100) @title: 'Characteristic Value';
    key ![CHAR_COUNT]       : String(100) @title: 'Characteristic Count';
    key ![CHAR_COUNT_RATE]  : String(100) @title: 'Characteristic Count Rate';
    key ![GROUP_COUNT]      : String(100) @title: 'Group Count';
    key ![GROUP_COUNT_RATE] : String(100) @title: 'Group Count Rate';

}

@cds.persistence.exists
entity V_FUTUREDEMAND_VERSION {
    key LOCATION_ID : String(4) @title: 'Location';
    key PRODUCT_ID  : String(40) @title: 'Product';
    key VERSION     : String(10) @title: 'Version';
    key SCENARIO    : String(32) @title:  'Scenario';
        VERSION_NAME    : String(50) @title:  'Version Name';
        SCENARIO_NAME    : String(50) @title:  'Scenario Name';
}
@cds.persistence.exists
entity V_WEEK_DESCRIPTOR {
    key PERIODSTART     : Date;
    key PERIODEND       : Date;
    key WEEK_STARTDATE  : Date;
    key WEEK_ENDDATE    : Date;
    key CALENDAR_WEEK   : String(10);
    key TELESCOPIC_WEEK : String(10);
}

@cds.persistence.exists

entity ![V_TS_HISTORY_WEEKLY] {
    key ![CAL_DATE]         : Date        @title: 'Date';
    key ![LOCATION_ID]      : String(4)   @title: 'Location';
    key ![PRODUCT_ID]       : String(100) @title: 'Product';
    key ![TYPE]             : String(100) @title: 'Type';
    key ![GROUP_ID]         : String(50)  @title: 'Group ID';
    key ![ROW]              : String(100) @title: 'Row';
    key ![ATTRIBUTE]        : String(100) @title: 'Attribute';
    key ![CHAR_NUM]         : String(100) @title: 'Characteristic Number';
    key ![CHAR_NAME]        : String(100) @title: 'Characteristic Name';
    key ![CHAR_VALUE]       : String(100) @title: 'Characteristic Value';
    key ![CHAR_COUNT]       : String(100) @title: 'Characteristic Count';
    key ![CHAR_COUNT_RATE]  : String(100) @title: 'Characteristic Count Rate';
    key ![GROUP_COUNT]      : String(100) @title: 'Group Count';
    key ![GROUP_COUNT_RATE] : String(100) @title: 'Group Count Rate';

}


@cds.persistence.exists

entity ![V_CLUSTER_DISTANCE] {
    key ![LOCATION_ID]       : String(4)   @title: 'Location';
    key ![PRODUCT_ID]        : String(100) @title: 'Product';
    key ![CLUSTER_ID]        : Integer     @title: 'Cluster ID';
    key ![PRPID]             : Integer     @title: 'PRPID';
    key ![TARGET_CLUSTER_ID] : Integer     @title: 'Target Cluster ID';
    key ![DISTANCE]          : Double      @title: 'Distance';
// key ![PID]                : Integer  @title: 'PID';

}

@cds.persistence.exists

entity ![V_TS_HISTORY_CUSTOMER] {
    key ![CAL_DATE]         : Date        @title: 'Date';
    key ![LOCATION_ID]      : String(4)   @title: 'Location';
    key ![PRODUCT_ID]       : String(100) @title: 'Product';
    key ![TYPE]             : String(100) @title: 'Type';
    key ![GROUP_ID]         : String(50)  @title: 'Group ID';
    key ![ROW]              : String(100) @title: 'Row';
    key ![ATTRIBUTE]        : String(100) @title: 'Attribute';
    key ![CHAR_NUM]         : String(100) @title: 'Characteristic Number';
    key ![CHAR_VALUE]       : String(100) @title: 'Characteristic Value';
    key ![CHAR_COUNT]       : String(100) @title: 'Characteristic Count';
    key ![CHAR_COUNT_RATE]  : String(100) @title: 'Characteristic Count Rate';
    key ![GROUP_COUNT]      : String(100) @title: 'Group Count';
    key ![GROUP_COUNT_RATE] : String(100) @title: 'Group Count Rate';
    key ![CUSTOMER_GROUP]   : String(100) @title: 'Customer Group';
}

@cds.persistence.exists
entity ![V_CP_DAILY_PRIMARY_CHARVAL_TS] {
    key ![CAL_DATE]         : Date        @title: 'Date';
    key ![LOCATION_ID]      : String(4)   @title: 'Location';
    key ![PRODUCT_ID]       : String(100) @title: 'Product';
    key ![TYPE]             : String(100) @title: 'Type';
    key ![GROUP_ID]         : String(50)  @title: 'Group ID';
    key ![ROW]              : String(100) @title: 'Row';
    key ![ATTRIBUTE]        : String(100) @title: 'Attribute';
    key ![CHAR_NUM]         : String(100) @title: 'Characteristic Number';
    key ![CHARVAL_NUM]      : String(100) @title: 'Characteristic Value number';
    key ![CHAR_NAME]        : String(100) @title: 'Characteristic Name';
    key ![CHAR_VALUE]       : String(100) @title: 'Characteristic Value';
    key ![CHAR_COUNT]       : String(100) @title: 'Characteristic Count';
    key ![CHAR_COUNT_RATE]  : String(100) @title: 'Characteristic Count Rate';
    key ![GROUP_COUNT]      : String(100) @title: 'Group Count';
    key ![GROUP_COUNT_RATE] : String(100) @title: 'Group Count Rate';

}

@cds.persistence.exists
entity ![V_HIS_M2_PRTLCHARVALNUM] {
    key ![LOCATION_ID] : String(4)   @title: 'Location';
    key ![PRODUCT_ID]  : String(100) @title: 'Product';
    key ![CHAR_NUM]    : String(100) @title: 'Characteristic Number';
    key ![CHARVAL_NUM] : String(100) @title: 'Characteristic Value number';
    key ![CHAR_NAME]   : String(100) @title: 'Characteristic Name';
    key ![CLASS_NUM]   : String(100) @title: 'Class Number';
}

@cds.persistence.exists
entity ![V_HIS_M2_SHBY_PRIMARY] {
    key ![LOCATION_ID] : String(4)   @title: 'Location';
    key ![PRODUCT_ID]  : String(100) @title: 'Product';
    key ![SALES_DOC]   : String(100) @title: 'Sales Doc.';
    key ![CAL_DATE]    : Date        @title: 'Date';
    key ![REF_PRODID]  : String(100) @title: 'Reference Prod.ID';
    key ![PRIMARY_ID]  : String(100) @title: 'Primary ID';
    key ![CHAR_NUM]    : String(100) @title: 'Characteristic Number';
    key ![CHARVAL_NUM] : String(100) @title: 'Characteristic Value number';
    key ![CHAR_NAME]   : String(100) @title: 'Characteristic Name';
    key ![CHAR_VALUE]  : String(100) @title: 'Characteristic Value';
    key ![ORD_QTY]     : String(100) @title: 'Order Qty';

}

@cds.persistence.exists
entity ![V_HIS_M2_TS_SALESDOC] {
    key ![LOCATION_ID] : String(4)   @title: 'Location';
    key ![PRODUCT_ID]  : String(100) @title: 'Product';
    key ![SALES_DOC]   : String(100) @title: 'Sales Doc.';
    key ![CAL_DATE]    : Date        @title: 'Date';
    key ![REF_PRODID]  : String(100) @title: 'Reference Prod.ID';
    key ![PRIMARY_ID]  : String(100) @title: 'Primary ID';
    key ![CHAR_NUM]    : String(100) @title: 'Characteristic Number';
    key ![CHARVAL_NUM] : String(100) @title: 'Characteristic Value number';
    key ![CHAR_NAME]   : String(100) @title: 'Characteristic Name';
    key ![CHAR_VALUE]  : String(100) @title: 'Characteristic Value';
    key ![ORD_QTY]     : String(100) @title: 'Order Qty';
    key ![SEQUENCE]    : String(100) @title: 'Row';
}

@cds.persistence.exists
entity ![V_CHARVAL] {
    key ![CLASS_NUM]       : String(18) not null  @title: 'CLASS_NUM';
    key ![CHAR_NUM]        : String(100) not null @title: 'CHAR_NUM';
    key ![CHAR_NAME]       : String(80)           @title: 'CHAR_NAME';
    key ![CHAR_DESC]       : String(160)          @title: 'CHAR_DESC';
    key ![CHAR_GROUP]      : String(10)           @title: 'CHAR_GROUP';
    key ![CHAR_TYPE]       : String(4)            @title: 'CHAR_TYPE';
    key ![ENTRY_REQ]       : String(1)            @title: 'ENTRY_REQ';
    key ![CHAR_CATGRY]     : String(40)           @title: 'CHAR_CATGRY';
    key ![MULTI_CHAR]      : String(1)            @title: 'MULTI_CHAR';
    key ![REF_CHAR_NUM]    : String(100)          @title: 'REF_CHAR_NUM';
    key ![REF_CHAR_NAME]   : String(80)           @title: 'REF_CHAR_NAME';
    key ![REF_CHAR_DESC]   : String(160)          @title: 'REF_CHAR_DESC';
    key ![CHAR_VALUE]      : String(80) not null  @title: 'CHAR_VALUE';
    key ![CHARVAL_NUM]     : String(80) not null  @title: 'CHARVAL_NUM';
    key ![CHARVAL_DESC]    : String(160)          @title: 'CHARVAL_DESC';
    key ![CATCH_ALL]       : String(1)            @title: 'CATCH_ALL';
    key ![REF_CHARVAL_NUM] : String(80)           @title: 'REF_CHARVAL_NUM';
    key ![REF_CHAR_VALUE]  : String(80)           @title: 'REF_CHAR_VALUE';
    key ![GENFLAG]         : String(1)            @title: 'GENFLAG';
}

@cds.persistence.exists
entity ![V_NPI_CHARVAL] {
    key ![PROJECT_ID]         : String(40)           @title: 'Project Id';
    key ![REF_PRODID]         : String(40) not null  @title: 'CONFIG PRODUCT_ID';
    key ![CHAR_NUM]           : String(100) not null @title: 'CHAR_NUM';
    key ![CHAR_VALUE]         : String(70) not null  @title: 'CHAR_VALUE';
    key ![REF_CHAR_VALUE]     : String(70) not null  @title: 'REF_CHAR_VALUE';
    key ![WEIGHT]             : Integer              @title: 'WEIGHT';
    key ![VALID_FROM]         : Date                 @title: 'VALID_FROM';
    key ![VALID_TO]           : Date                 @title: 'VALID_TO';
        // key ![ACTIVE]           : Boolean default false  @title: 'ACTIVE' ;
    key ![PROD_DESC]          : String(40)           @title: 'PROD_DESC';
        // key ![CHARVAL_DESC]    : String(160)  @title: 'CHARVAL_DESC' ;
    key ![REF_CHAR_NAME]      : String(80)           @title: 'REF_CHAR_NAME';
    key ![REF_CHAR_DESC]      : String(160)          @title: 'REF_CHAR_DESC';
    key ![CHARVAL_DESC]       : String(100)          @title: 'CHARVAL_DESC';
    key ![REF_CHARVALUE_DESC] : String(100)          @title: 'REF_CHARVALUE_DESC';
}

@cds.persistence.exists
entity V_RESTRICTION_ANALYTIC_VIEW {
    key LOCATION_ID    : String(4)      @title: 'Location ID';
    key PRODUCT_ID     : String(40)     @title: 'Product ID';
    key LINE_ID        : String(40)     @title: 'Line ID';
    key RESTRICTION    : String(30)     @title: 'Restriction';
    key WEEK_DATE      : Date           @title: 'Week Date';
    key MODEL_VERSION  : String(20)     @title: 'Model Version';
    key VERSION        : String(10)     @title: 'Version';
    key SCENARIO       : String(32)     @title: 'Scenario';
        YEAR           : String         @title: 'WEEK_DATE-YEAR';
        QUARTER        : String         @title: 'WEEK_DATE-QUARTER';
        MONTH          : String         @title: 'WEEK_DATE-MONTH';
        LOCATION_DESC  : String(30)     @title: 'Location Description';
        PROD_DESC      : String(40)     @title: 'Product Description';
        LINE_DESC      : String(30)     @title: 'Line Description';
        RTR_DESC       : String(30)     @title: 'Restriction Description';
        VERSION_NAME   : String(50)     @title: 'Version Name';
        SCENARIO_NAME  : String(50)     @title: 'Scenario Name';
        PLANNED_QTY    : Decimal(18, 3) @title: 'Restriction Quantity';
        ORD_QTY        : Decimal(13, 3) @title: 'Sales Order Quantity';
        RTR_CAP        : Integer        @title: 'Restriction Capacity';
        OPEN_RTR_QTY   : Decimal(20, 3) @title: 'Open Restriction Quantity';
        DIFF_QTY       : Decimal(20, 3) @title: 'Restriction Exceeded By';
        PERIODDESC     : String(50)     @title: 'Period Description';
        RESERVE_FIELD1 : String(40)     @title: 'Reserve Field1';
        RESERVE_FIELD2 : String(40)     @title: 'Reserve Field2';
        RESERVE_FIELD3 : String(40)     @title: 'Reserve Field3';
        RESERVE_FIELD4 : String(40)     @title: 'Reserve Field4';
        RESERVE_FIELD5 : String(40)     @title: 'Reserve Field5';
}

@cds.persistence.exists
entity ![V_PRODCHARTYPE] {
    key ![PRODUCT_ID]     : String(40) not null  @title: 'Product Id';
    key ![CLASS_NUM]      : String(40) not null  @title: 'Class Num';
    key ![CHAR_NUM]       : String(100) not null @title: 'CHAR_NUM';
    key ![CHAR_NAME]      : String(100) not null @title: 'CHAR_NAME';
    key ![CHAR_VALUE]     : String(70) not null  @title: 'CHAR_VALUE';
        ![CLASS_DESC]     : String(40)           @title: 'Class Desc';
        ![CLASS_NAME]     : String(40)           @title: 'Class Name';
        ![CHARVAL_NUM]    : String(70)           @title: 'CHARVAL_NUM';
        ![CHARVAL_DESC]   : String(70)           @title: 'CHARVAL_DESC';
        ![CHAR_DESC]      : String(100)          @title: 'CHAR_DESC';
        ![REF_CHAR_NAME]  : String(80)           @title: 'REF_CHAR_NAME';
        ![REF_CHAR_NUM]   : String(160)          @title: 'REF_CHAR_NUM';
        ![REF_CHAR_DESC]  : String(160)          @title: 'REF_CHAR_DESC';
        ![REF_CHAR_VALUE] : String(160)          @title: 'REF_CHAR_VALUE';
        ![CHAR_TYPE]      : String(160)          @title: 'CHAR_TYPE';
        ![MULTI_CHAR]     : String(40)           @title: 'Multi Char';
}

@cds.persistence.exists
entity ![V_CHARVAL_MASTER] {
    key ![CLASS_NUM]    : String(18) not null  @title: 'Class Num';
    key ![CHAR_NUM]     : String(100) not null @title: 'CHAR_NUM';
        ![CHAR_NAME]    : String(80)           @title: 'CHAR_NAME';
        ![CHAR_DESC]    : String(160)          @title: 'CHAR_VALUE';
        ![CHAR_GROUP]   : String(10)           @title: 'CHAR_GROUP';
        ![CHAR_TYPE]    : String(4)            @title: 'CHAR_TYPE';
        ![ENTRY_REQ]    : String(1)            @title: 'ENTRY_REQ';
        ![CHAR_CATGRY]  : String(40)           @title: 'CHAR_CATGRY';
        ![MULTI_CHAR]   : String(1)            @title: 'MULTI_CHAR';
    key ![CHAR_VALUE]   : String(80) not null  @title: 'CHAR_VALUE';
    key ![CHARVAL_NUM]  : String(80) not null  @title: 'CHARVAL_NUM';
        ![CHARVAL_DESC] : String(160)          @title: 'CHARVAL_DESC';
        ![CATCH_ALL]    : String(1)            @title: 'CATCH_ALL';
}

@cds.persistence.exists
entity ![V_NEWDEMANDLOC] {
    key ![DEMAND_LOC]  : String(4)   @title: 'Demand Location';
    key ![DEMAND_DESC] : String(30)  @title: 'Location Description';
    key ![PRODUCT_ID]  : String(100) @title: 'Product Id';
}

@cds.persistence.exists
entity ![V_CHARVALUEUPDATE] {
    key ![PROJECT_ID]         : String(40)           @title: 'Project Id';
    key ![REF_PRODID]         : String(40) not null  @title: 'CONFIG PRODUCT_ID';
    key ![CHAR_NUM]           : String(100) not null @title: 'CHAR_NUM';
    key ![CHAR_VALUE]         : String(70) not null  @title: 'CHAR_VALUE';
    key ![REF_CHAR_VALUE]     : String(70) not null  @title: 'REF_CHAR_VALUE';
    key ![WEIGHT]             : Integer              @title: 'WEIGHT';
    key ![VALID_FROM]         : Date                 @title: 'VALID_FROM';
    key ![VALID_TO]           : Date                 @title: 'VALID_TO';
    key ![REF_CHARVALUE_DESC] : String(100)          @title: 'REF_CHARVALUE_DESC';
    key ![CHARVAL_DESC]       : String(160)          @title: 'CHARVAL_DESC';
        ![CHAR_NAME]          : String(40)           @title: 'CHAR_NAME';
    key ![LOCATION_ID]        : String(80)           @title: 'LOCATION_ID';
        ![LOCATION_DESC]      : String(100)          @title: 'LOCATION_DESC';
    key ![PRODUCT_ID]         : String(160)          @title: 'PRODUCT_ID';
        ![PRODUCT_DESC]       : String(100)          @title: 'PRODUCT_DESC';
    key ![HISTORY_DATE]       : String(100)          @title: 'HISTORY_DATE';
    key ![PHASE_IN_START]     : String(100)          @title: 'PHASE_IN_START';
}

@cds.persistence.exists
entity ![V_VC_HISTORY_TS_CUST] {
    key ![PERIOD_NUM]       : Integer     @title: 'PERIOD_NUM';
        ![CAL_DATE]         : Date        @title: 'CAL_DATE';
    key ![LOCATION_ID]      : String(5)   @title: 'LOCATION_ID';
    key ![PRODUCT_ID]       : String(40)  @title: 'PRODUCT_ID';
    key ![TYPE]             : String(2)   @title: 'TYPE';
    key ![GROUP_ID]         : String(100) @title: 'GROUP_ID';
    key ![ROW]              : Integer     @title: 'ROW';
    key ![ATTRIBUTE]        : String(10)  @title: 'ATTRIBUTE';
    key ![CHAR_NUM]         : String(100) @title: 'CHAR_NUM';
    key ![CHAR_COUNT]       : Double      @title: 'CHAR_COUNT';
    key ![CHAR_COUNT_RATE]  : Double      @title: 'CHAR_COUNT_RATE';
    key ![GROUP_COUNT]      : Double      @title: 'GROUP_COUNT';
    key ![GROUP_COUNT_RATE] : Double      @title: 'GROUP_COUNT_RATE';
    key ![CUSTOMER_GROUP]   : String(10)  @title: 'CUSTOMER_GROUP';
}


@cds.persistence.exists
entity ![V_IBP_PRODCLASS] {
    key ![PRODUCT_ID]   : String(40)  @title: 'Product';
    key ![CLASS_NUM]    : String(18)  @title: 'Class Number';
    key ![CLASS_NAME]   : String(20)  @title: 'Class Name';
    key ![CLASS_TYPE]   : String(3)   @title: 'Class Type';
    key ![CLASS_DESC]   : String(150) @title: 'Class Description';
    key ![IBPCHAR_CHK]  : Boolean     @title: 'IBP Characteristics check';
    key ![PROD_DESC]    : String(40)  @title: 'IProduct Description';
        ![CHANGED_BY]   : String(100) @title: 'Changed By';
        ![CHANGED_DATE] : Date        @title: 'Changed Date';
        ![CHANGED_TIME] : Time        @title: 'Changed Time';
}

@cds.persistence.exists
entity V_COMPREQ_SNAPSHOT {
    key LOCATION_ID   : String(4)          @title: 'Location';
    key PRODUCT_ID    : String(40)         @title: 'Product';
    key COMPONENT     : String(40)         @title: 'Component';
    key FACTORY_LOC   : String(4) not null @title: 'Factory Location';
    key VERSION       : String(10)         @title: 'Version';
    key SCENARIO      : String(32)         @title: 'Scenario';
        COMP_DESC     : String(40)         @title: 'Component Desc';
        COMPAVAIL_QTY : Integer            @title: 'Component Avail Quantity';
        COMP_QTY      : Decimal(13, 3)     @title: 'Component Quantity';
        WEEK_DATE     : Date               @title: 'Week Date';
}

@cds.persistence.exists
entity V_RESTRICTIONUIDQTY {
    key WEEK_DATE     : Date               @title: 'Week Date';
    key LOCATION_ID   : String(40)         @title: 'Location ID';
    key PRODUCT_ID    : String(40)         @title: 'Product ID';
    key RESTRICTION   : String(4) not null @title: 'Restriction';
    key MODEL_VERSION : String(4) not null @title: 'Model version';
    key VERSION       : String(10)         @title: 'Version';
    key SCENARIO      : String(32)         @title: 'Scenario';
    key UNIQUE_ID     : String(32)         @title: 'Unique ID';
        RULE_TYPE     : String(2)          @title: 'Rule Type';
        LOCATION_DESC : String(40)         @title: 'location Desc';
        PROD_DESC     : Integer            @title: 'Prod desc';
        CIR_QTY       : Decimal(13, 3)     @title: 'Component Quantity';
}

@cds.persistence.exists
entity V_ASSEMBLY_COMPONENT {
    key LOCATION_ID           : String(4)      @title: 'Location';
        LOCATION_DESC         : String(100)    @title: 'Location Description';
        FACTORY_LOCATION_DESC : String(100)    @title: 'Factory Location Description';
    key PRODUCT_ID            : String(40)     @title: 'Product';
        PROD_DESC             : String(40)     @title: 'Product Description';
        ITEM_NUM              : String(6)      @title: 'Item Number';
    key ASSEMBLY              : String(40)     @title: 'Assembly';
        // ASSEMBLY_DESC       : String(100);
        ASM_DESC              : String(50);
        // WEEK_DATE     : Date;
        CALENDAR_WEEK         : String(50)     @title: 'Calendar Week';
        TELESCOPIC_WEEK       : String(50)     @title: 'Telescopic Week';
        WEEK_STARTDATE        : Date           @title: 'Week Start Date';
        WEEK_ENDDATE          : Date           @title: 'Week End Date';
        VERSION_NAME          : String(50)     @title: 'Version Name';
        SCENARIO_NAME         : String(50)     @title: 'Scenario Name';
        MODEL_VERSION         : String(20);
        VERSION               : String(10);
        SCENARIO              : String(32);
        RULE_TYPE             : String(2)      @title: 'Rule Type';
        REF_PRODID            : String(40);
        FACTORY_LOC           : String(4);
        MRP_GROUP             : String(4);
        MRP_TYPE              : String(4)      @title: 'MRP Type';
        // PHANTOM_IND     : String(1);
        // CONFIGURABLE    : String(1);
        REQ_TYPE              : String(2)      @title: 'Req Type';
        TYPE                  : String(2)      @title: 'Type';
        UNIQUE_ID             : String;

        @Core.Computed
        ASMB_QTY              : Decimal(18, 2) @title: 'Assembly Quantity';

        @Core.Computed
        CIR_QTY               : Decimal(18, 2) @title: 'Forecast Quantity';

        @Core.Computed
        CIR_ASMB_QTY          : Decimal(18, 2) @title: 'Unconsumed Quantity';

        @Core.Computed
        ACTUAL_QTY            : Decimal(18, 2) @title: 'Actual Quantity';

        @Core.Computed
        TOTAL_QTY             : Decimal(18, 2) @title: 'Total Quantity';

        @Core.Computed
        PROD_DEM              : Decimal(13)    @title: 'Product Demand';

        @Core.Computed
        COEFFICIENTS          : Decimal(34)    @title: 'Coefficients';
        USER                  : String(100)    @title:'User Email';
}

@cds.persistence.exists
entity V_ASSEMBLY_COMPONENT_TELESCOPIC {
    key LOCATION_ID           : String(4)      @title: 'Location';
        LOCATION_DESC         : String(100)    @title: 'Location Description';
        FACTORY_LOCATION_DESC : String(100)    @title: 'Factory Location Description';
    key PRODUCT_ID            : String(40)     @title: 'Product';
        PROD_DESC             : String(40)     @title: 'Product Description';
        ITEM_NUM              : String(6)      @title: 'Item Number';
    key ASSEMBLY              : String(40)     @title: 'Assembly';
        // ASSEMBLY_DESC       : String(100);
        ASM_DESC              : String(50);
        // WEEK_DATE     : Date;
        // CALENDAR_WEEK         : String(50) @title: 'Calendar Week';
        TELESCOPIC_WEEK       : String(50)     @title: 'Telescopic Week';
        PERIODSTART           : Date           @title: 'Period Start';
        PERIODEND             : Date           @title: 'Period End';
        VERSION_NAME          : String(50)     @title: 'Version Name';
        SCENARIO_NAME         : String(50)     @title: 'Scenario Name';
        MODEL_VERSION         : String(20);
        VERSION               : String(10);
        SCENARIO              : String(32);
        RULE_TYPE             : String(2)      @title: 'Rule Type';
        REF_PRODID            : String(40);
        FACTORY_LOC           : String(4);
        MRP_GROUP             : String(4);
        MRP_TYPE              : String(4)      @title: 'MRP Type';
        // PHANTOM_IND     : String(1);
        // CONFIGURABLE    : String(1);
        REQ_TYPE              : String(2)      @title: 'Req Type';
        TYPE                  : String(2)      @title: 'Type';
        UNIQUE_ID             : String;

        @Core.Computed
        ASMB_QTY              : Decimal(18, 2) @title: 'Assembly Quantity';

        @Core.Computed
        CIR_QTY               : Decimal(18, 2) @title: 'Forecast Quantity';

        @Core.Computed
        CIR_ASMB_QTY          : Decimal(18, 2) @title: 'Unconsumed Quantity';

        @Core.Computed
        ACTUAL_QTY            : Decimal(18, 2) @title: 'Actual Quantity';

        @Core.Computed
        TOTAL_QTY             : Decimal(18, 2) @title: 'Total Quantity';

        @Core.Computed
        PROD_DEM              : Decimal(13)    @title: 'Product Demand';

        @Core.Computed
        COEFFICIENTS          : Decimal(34)    @title: 'Coefficients';
        USER                  : String(100)    @title:'User Email';
}

@cds.persistence.exists
entity V_CHARGROUPWEIGHTAGE {
    key ![PRODUCT_ID]   : String(40)     @title: 'PRODUCT_ID';
    key ![CHAR_NUM]     : String(100)    @title: 'CHAR_NUM';
    key ![CHAR_NAME]    : String(80)     @title: 'CHAR_NAME';
    key ![CHAR_DESC]    : String(160)    @title: 'CHAR_DESC';
    key ![CHAR_TYPE]    : String(2)      @title: 'CHAR_TYPE';
    key ![SEQUENCE]     : Integer        @title: 'SEQUENCE';
    key ![GROUP_NAME]   : String(100)    @title: 'Group Name';
    key ![WEIGHTAGE]    : Decimal(13, 2) @title: 'Weightage';
        ![CHANGED_BY]   : String(100)    @title: 'Changed By';
        ![CHANGED_DATE] : Date           @title: 'Changed Date';
        ![CHANGED_TIME] : Time           @title: 'Changed Time';
}

@cds.persistence.exists
entity ![V_PRODPRIMARYID] {
    key ![LOCATION_ID]   : String(4)      @title: 'Location ';
    key ![PRODUCT_ID]    : String(40)     @title: 'Product';
    key ![PRIMARY_ID]    : Integer        @title: 'Primary ID';
        ![MAT_AVAILDATE] : Date           @title: 'MAT_AVAILDATE';
        ![QUANTITY]      : Decimal(13, 3) @title: 'Quantity';
}

@cds.persistence.exists
entity ![V_PIDCHARCTERISTICS] {
    key ![UNIQUE_ID]    : Integer     @title: 'Unique ID';
        ![CHAR_NUM]     : String(100) @title: 'CHAR_NUM';
        ![CHAR_NAME]    : String(160) @title: 'CHAR_NAME';
        ![CHAR_VALUE]   : String(80)  @title: 'CHAR_VALUE';
        ![CHARVAL_DESC] : String(160) @title: 'CHAR_DESC';
}

@cds.persistence.exists
entity V_SALESALL_WEEK_OFFSET {
    key LOCATION_ID                 : String(4);
    key PRODUCT_ID                  : String(40);
    key CUSTOMER_GROUP              : String(20);
    key WEEK_DATE                   : Date;
    key PERIODDESC                  : String(50);
    key CURRENT_TOTAL_CONFIRMED_QTY : Decimal(13, 3);
    key CURRENT_TOTAL_ORD_QTY       : Decimal(13, 3);
    key OFFSET_TOTAL_CONFIRMED_QTY  : Decimal(13, 3);
    key OFFSET_TOTAL_ORD_QTY        : Decimal(13, 3);
}


@cds.persistence.exists
entity V_DEMAND_AND_FORECAST {
        LOCATION_ID    : String(4)      @title: 'Location';
        PRODUCT_ID     : String(40)     @title: 'Product';
        REF_PRODID     : String(40)     @title: 'Config Product';
    key UNIQUE_ID      : Integer        @title: 'Unique ID';
        CHAR_NUM       : String(100)    @title: 'Characteristic Number';
        CHAR_DESC      : String(160)    @title: 'Characteristic Desc.';
        CHAR_NAME      : String(80)     @title: 'Characteristic Name';
        CHARVAL_NUM    : String(80)     @title: 'Characteristic Value Number';
        CHAR_VALUE     : String(80)     @title: 'Characteristic Value';
        CHARVAL_DESC   : String(160)    @title: 'Characteristic Value Description';
        PERIODDESC     : String(50)     @title: 'PERIODDESC';
        WEEK_DATE      : Date           @title: 'WEEK_DATE';
        YEAR           : String         @title: 'WEEK_DATE-YEAR';
        QUARTER        : String         @title: 'WEEK_DATE-QUARTER';
        MONTH          : String         @title: 'WEEK_DATE-MONTH';
        ORD_QTY        : Decimal(13, 3) @title: 'Sales Order Quantity';
        CIR_QTY        : Decimal(13, 3) @title: 'Forecast Order Quantity';
        QUANTITY       : Decimal(13, 3) @title: 'Total Quantity';
        RESERVE_FIELD1 : String(40)     @title: 'Reserve Field1';
        RESERVE_FIELD2 : String(40)     @title: 'Reserve Field2';
        RESERVE_FIELD3 : String(40)     @title: 'Reserve Field3';
        RESERVE_FIELD4 : String(40)     @title: 'Reserve Field4';
        RESERVE_FIELD5 : String(40)     @title: 'Reserve Field5';
}

@cds.persistence.exists
entity V_DEMAND_AND_FORECAST_V2 {
    key LOCATION_ID               : String(4) not null   @title: 'Location';
    key PRODUCT_ID                : String(40) not null  @title: 'Product';
    key UNIQUE_ID                 : Integer not null     @title: 'Unique ID';
    key CHAR_NUM                  : String(100) not null @title: 'Characteristic';
    key CHARVAL_NUM               : String(80) not null  @title: 'Characteristic Value';
        CHAR_DESC                 : String(160)          @title: 'Characteristic Description';
        CHAR_NAME                 : String(80)           @title: 'Characteristic Name';
        CHARVAL_DESC              : String(160)          @title: 'Characteristic Value Description';
        MODEL_VERSION             : String(20)           @title: 'Model Verison';
        VERSION                   : String(10)           @title: 'Version';
        SCENARIO                  : String(32)           @title: 'Scenario';
        VERSION_NAME              : String(50)           @title: 'Version Name';
        SCENARIO_NAME             : String(50)           @title: 'Scenario Name';
        WEEK_PERIODDESC           : String(50)           @title: 'Week Period Description';
        LOCATION_DESC             : String(30)           @title: 'Location Description';
        PROD_DESC                 : String(40)           @title: 'Product Description';
        WEEK_DATE                 : Date                 @title: 'Week Date';
        YEAR                      : String(11)           @title: 'Year';
        QUARTER                   : String(7)            @title: 'Quarter';
        MONTH                     : String               @title: 'Month';
        TYPE                      : String(1) not null   @title: 'Type';
        QUANTITY                  : Decimal(13, 3)       @title: 'Quantity';
        ACTUAL_QTY                : Decimal(18, 3)       @title: 'Actual Quantity';
        // FORECAST_QTY :  Decimal(18, 3) @title: 'Forecast Quantity';
        PERCENTAGE                : Decimal(18, 3)       @title: 'Percentage';
        FORECAST_SALES_PERCENTAGE : Decimal(18, 3)       @title: 'Forecast Sales Percent';
    YEAR_MONTH                : String               @title: 'Year Month';

}

@cds.persistence.exists
entity V_PROD_ORDER_CONSUMPTION {
    key LOCATION_ID       : String(10)     @title: 'Location ID';
    key SALES_DOC         : String(20)     @title: 'Sales Document';
    key SALESDOC_ITEM     : String(20)     @title: 'Sales Document Item';
    key REF_PRODID        : String(50)     @title: 'Referenced Product ID';
    // key PROD_ORDER        : String(50)     @title: 'Production Order';
    key COMPONENT         : String(50)     @title: 'Component';
    key MANU_LOC          : String(50)     @title: 'Component Location';
        MAT_PARENT        : String(50)     @title: 'Material Parent';
        PARENT_LOC      : String(50)     @title: 'Parent location';
        COMP_PROCURE_TYPE : String(20)     @title: 'Component Procurement Type';
        COMP_QTY          : Decimal(18, 2) @title: 'Component Quantity';
        // ORD_TYPE          : String(20)     @title: 'Order Type';
        UNIQUE_ID         : String(50)     @title: 'Unique ID';
        PROD_DESC         : String(40)     @title: 'Product Description';
        LOCATION_DESC     : String(40)     @title: 'Location Description';
        WEEK_DATE         : Date           @title: 'Material avail date';

}

@cds.persistence.exists
entity V_PROD_ORDER_CONSUMPTION_NEW {
    key LOCATION_ID                 : String(10)     @title: 'Location ID';
    key SALES_DOC                   : String(20)     @title: 'Sales Document';
    key SALESDOC_ITEM               : String(20)     @title: 'Sales Document Item';
    key REF_PRODID                  : String(50)     @title: 'Referenced Product ID';
    // key PROD_ORDER                  : String(50)     @title: 'Production Order';
    key COMPONENT                   : String(50)     @title: 'Component';
    key MANU_LOC                    : String(50)     @title: 'Component Location';
        MAT_PARENT                  : String(40)     @title: 'MAT_PARENT';
        PARENT_LOC      : String(50)     @title: 'Parent location';
        COMP_PROCURE_TYPE           : String(1)      @title: 'COMP_PROCURE_TYPE';
        COMP_QTY                    : Decimal(13, 3) @title: 'COMP_QTY';
        // ORD_TYPE                    : String(20)     @title: 'ORD_TYPE';
        WEEK_DATE                   : Date           @title: 'WEEK_DATE';
        UNIQUE_ID                   : String         @title: 'UNIQUE_ID';
        LOCATION_DESC               : String(30)     @title: 'LOCATION_DESC';
        PROD_DESC                   : String(40)     @title: 'PROD_DESC';
        CALENDAR_WEEK               : String(50)     @title: 'CALENDAR_WEEK';
        TELESCOPIC_WEEK             : String(50)     @title: 'TELESCOPIC_WEEK';
        CP_PROD_ORD_CONSUMPTION_SUM : Decimal(18, 3) @title: 'CP_PROD_ORD_CONSUMPTION_SUM';
}

@cds.persistence.exists
entity V_RSTRREQ_PRODCONSD {
    key LOCATION_ID          : String(10);
    key LINE_ID              : String(20);
    key RESTRICTION          : String(50);
    key WEEK_DATE            : Date;
    key MODEL_VERSION        : String(50);
    key VERSION              : String(50);
    key SCENARIO             : String(50);
        LOCATION_DESC        : String(50);
        LINE_DESC            : String(50);
        RTR_DESC             : String(50);
        VERSION_NAME         : String(100);
        SCENARIO_NAME        : String(100);
        RTR_QTY              : Decimal(18, 4);
        RESTRICTIONAVAIL_QTY : Decimal(18, 4);
        VALID_FROM           : Date;
        VALID_TO             : Date;
        CALENDAR_WEEK        : String(10);
        TELESCOPIC_WEEK      : Integer;
        WEEK_STARTDATE       : Date;
        WEEK_ENDDATE         : Date;
}

@cds.persistence.exists
entity V_RANKED_CHAR_VALUES {
    key CHAR_NUM    : String(100);
    key CHAR_VALUE  : String(80);
    key RANK_COLUMN : Integer;

}

@cds.persistence.exists
entity V_CHANGELOG {

    key DESCRIPTION  : String(100) @title: 'Prameter DEscription';
    key LOCATION_ID  : String(4)   @title: 'Location ID';
    key PARAMETER_ID : Integer     @title: 'Parameter ID';
    key OLD_VALUE    : String(100) @title: 'Old Value';
    key NEW_VALUE    : String(100) @title: 'New Value';
    key CHANGED_BY   : String(100) @title: 'Changed By';
    key CHANGED_DATE : Date        @title: 'Changed Date';
    key CHANGED_TIME : Time        @title: 'Changed Time';

}


@cds.persistence.exists
entity V_SNAPSHOT_LAG_CIR {
    key LOCATION_ID  : String(4)      @title: 'Location ID';
    key PRODUCT_ID   : String(40)     @title: 'Product ID';
    key UNIQUE_ID    : Integer        @title: 'Unique ID';
    key YEAR_MONTH   : String(7)      @title: 'Year-Month';
        LAG1_CIR     : Integer        @title: 'Lag 1 CIR';
        LAG2_CIR     : Integer        @title: 'Lag 2 CIR';
        LAG3_CIR     : Integer        @title: 'Lag 3 CIR';
        LAG4_CIR     : Integer        @title: 'Lag 4 CIR';
        LAG5_CIR     : Integer        @title: 'Lag 5 CIR';
        LAG6_CIR     : Integer        @title: 'Lag 6 CIR';
        LAG1_CIR_PCT : Decimal(15, 3) @title: 'Lag 1 CIR %';
        LAG2_CIR_PCT : Decimal(15, 3) @title: 'Lag 2 CIR %';
        LAG3_CIR_PCT : Decimal(15, 3) @title: 'Lag 3 CIR %';
        LAG4_CIR_PCT : Decimal(15, 3) @title: 'Lag 4 CIR %';
        LAG5_CIR_PCT : Decimal(15, 3) @title: 'Lag 5 CIR %';
        LAG6_CIR_PCT : Decimal(15, 3) @title: 'Lag 6 CIR %';
        LAG1_ACT     : Integer        @title: 'Lag 1 ACT';
        LAG2_ACT     : Integer        @title: 'Lag 2 ACT';
        LAG3_ACT     : Integer        @title: 'Lag 3 ACT';
        LAG4_ACT     : Integer        @title: 'Lag 4 ACT';
        LAG5_ACT     : Integer        @title: 'Lag 5 ACT';
        LAG6_ACT     : Integer        @title: 'Lag 6 ACT';
        LAG1_ACT_PCT : Decimal(15, 3) @title: 'Lag 1 ACT %';
        LAG2_ACT_PCT : Decimal(15, 3) @title: 'Lag 2 ACT %';
        LAG3_ACT_PCT : Decimal(15, 3) @title: 'Lag 3 ACT %';
        LAG4_ACT_PCT : Decimal(15, 3) @title: 'Lag 4 ACT %';
        LAG5_ACT_PCT : Decimal(15, 3) @title: 'Lag 5 ACT %';
        LAG6_ACT_PCT : Decimal(15, 3) @title: 'Lag 6 ACT %';
}

@cds.persistence.exists
entity V_SNAPSHOT_LAG_ASMB {
    key LOCATION_ID  : String(4)      @title: 'Location ID';
    key PRODUCT_ID   : String(40)     @title: 'Product ID';
    key COMPONENT    : String(40)     @title: 'Component';
    key UNIQUE_ID    : Integer        @title: 'Unique ID';
    key YEAR_MONTH   : String(7)      @title: 'Year-Month';
        LAG1_CIR     : Integer        @title: 'Lag 1 CIR';
        LAG2_CIR     : Integer        @title: 'Lag 2 CIR';
        LAG3_CIR     : Integer        @title: 'Lag 3 CIR';
        LAG4_CIR     : Integer        @title: 'Lag 4 CIR';
        LAG5_CIR     : Integer        @title: 'Lag 5 CIR';
        LAG6_CIR     : Integer        @title: 'Lag 6 CIR';
        LAG1_CIR_PCT : Decimal(15, 3) @title: 'Lag 1 CIR %';
        LAG2_CIR_PCT : Decimal(15, 3) @title: 'Lag 2 CIR %';
        LAG3_CIR_PCT : Decimal(15, 3) @title: 'Lag 3 CIR %';
        LAG4_CIR_PCT : Decimal(15, 3) @title: 'Lag 4 CIR %';
        LAG5_CIR_PCT : Decimal(15, 3) @title: 'Lag 5 CIR %';
        LAG6_CIR_PCT : Decimal(15, 3) @title: 'Lag 6 CIR %';
        LAG1_ACT     : Integer        @title: 'Lag 1 ACT';
        LAG2_ACT     : Integer        @title: 'Lag 2 ACT';
        LAG3_ACT     : Integer        @title: 'Lag 3 ACT';
        LAG4_ACT     : Integer        @title: 'Lag 4 ACT';
        LAG5_ACT     : Integer        @title: 'Lag 5 ACT';
        LAG6_ACT     : Integer        @title: 'Lag 6 ACT';
        LAG1_ACT_PCT : Decimal(15, 3) @title: 'Lag 1 ACT %';
        LAG2_ACT_PCT : Decimal(15, 3) @title: 'Lag 2 ACT %';
        LAG3_ACT_PCT : Decimal(15, 3) @title: 'Lag 3 ACT %';
        LAG4_ACT_PCT : Decimal(15, 3) @title: 'Lag 4 ACT %';
        LAG5_ACT_PCT : Decimal(15, 3) @title: 'Lag 5 ACT %';
        LAG6_ACT_PCT : Decimal(15, 3) @title: 'Lag 6 ACT %';
}

@cds.persistence.exists
entity V_ASSEMBLY_COMPONENT_BOM {
    key LOCATION_ID           : String(4)      @title: 'Location ID';
    key PRODUCT_ID            : String(40)     @title: 'Product ID';
    key ITEM_NUM              : String(6)      @title: 'Item Number';
    key ASSEMBLY              : String(40)     @title: 'Assembly';
    key COMPONENT             : String(40)     @title: 'Component';
    key MODEL_VERSION         : String(20)     @title: 'Model Version';
    key VERSION               : String(10)     @title: 'Version';
    key SCENARIO              : String(32)     @title: 'Scenario';
    key RULE_TYPE             : String(2)      @title: 'Rule Type';
    key TYPE                  : String(2)      @title: 'Type';
    key REF_PRODID            : String(40)     @title: 'Configurable Product';
    key FACTORY_LOC           : String(4)      @title: 'Factory Location';
    key UNIQUE_ID             : String         @title: 'Unique ID';
        FACTORY_LOCATION_DESC : String(30)     @title: 'Factory Location Description';
        LOCATION_DESC         : String(30)     @title: 'Location Description';
        PROD_DESC             : String(40)     @title: 'Product Description';
        // MRP_GROU.P              : String(4)   @title: 'MRP Group';
        PHANTOM_IND           : String(1)      @title: 'Phantom';
        CONFIGURABLE          : String(1)      @title: 'Configurable Product check';
        VERSION_NAME          : String(50)     @title: 'Version Name';
        SCENARIO_NAME         : String(50)     @title: 'Scenario Name';
        ASM_DESC              : String(40)     @title: 'Assembly Description';
        CALENDAR_WEEK         : String(50)     @title: 'Calendar Week';
        TELESCOPIC_WEEK       : String(50)     @title: 'Telescopic Week';
        WEEK_STARTDATE        : Date           @title: 'Week Start Date';
        WEEK_ENDDATE          : Date           @title: 'Week End Date';
        TOTAL_COMPONENT_QTY   : Decimal(28, 6) @title: 'Total Component Quantity';
        REQ_TYPE              : String(2)      @title: 'REQ Type';
        USER                  : String(100)    @title:'User Email';

}

@cds.persistence.exists
entity V_DEMAND_AND_FORECAST_HM {
    key LOCATION_ID     : String(4)      @title: 'Location';
    key PRODUCT_ID      : String(40)     @title: 'Product';
        UNIQUE_ID       : Integer        @title: 'Unique ID';
        MODEL_VERSION   : String(20)     @title: 'Model Version';
        VERSION         : String(10)     @title: 'Version';
        SCENARIO        : String(32)     @title: 'Scenario';
        VERSION_NAME    : String(50)     @title: 'Version Name';
        SCENARIO_NAME   : String(50)     @title: 'Scenario Name';
        LOCATION_DESC   : String(30)     @title: 'Location Description';
        PROD_DESC       : String(30)     @title: 'Product Description';
    key WEEK_DATE       : Date           @title: 'Week Date';
        YEAR            : Integer        @title: 'Year';
        WEEK_PERIODDESC : String(50)     @title: 'Week Period Description';
        QUARTER         : String(50)     @title: 'Quarter';
        MONTH           : String(50)     @title: 'Month';
    key TYPE            : String(17)     @title: 'Type';
        QUANTITY        : Decimal(18, 3) @title: 'Quantity';
        ACTUAL_QTY      : Decimal(18, 3) @title: 'Actual Quantity';
        YEAR_MONTH      : String         @title: 'Year Month';
}

@cds.persistence.exists
entity V_RESTRICTION_RULE {
    key LOCATION_ID   : String(4)      @title: 'LOCATION_ID';
    key PRODUCT_ID    : String(40)     @title: 'PRODUCT_ID';
    key LINE_ID       : String(40)     @title: 'LINE_ID';
    key CHAR_NUM      : String(100)    @title: 'CHAR_NUM';
    key CHARVAL_NUM   : String(80)     @title: 'CHARVAL_NUM';
    key VERSION       : String(10)     @title: 'VERSION';
    key SCENARIO      : String(32)     @title: 'SCENARIO';
        WEEK_DATE     : Date           @title: 'WEEK_DATE';
    key MODEL_VERSION : String(20)     @title: 'MODEL_VERSION';
    key RESTRICTION   : String(30)     @title: 'RESTRICTION';
        OPT_PERCENT   : Decimal(18, 2) @title: 'OPT_PERCENT';
        OPT_QTY       : Decimal(18, 3) @title: 'OPT_QTY';
}

@cds.persistence.exists
entity V_ASSEMBLY_DESC_DISTINCT {
    key MAT_CHILD   : String(4)      @title: 'LOCATION_ID';
    key PROD_DESC    : String(40)     @title: 'PRODUCT_ID';
   
}

@cds.persistence.exists
entity V_CAPACITY_CONSUMPTION {
        WEEK_DATE     : Date            @title: 'Week Date';
    key LOCATION_ID   : String(40)      @title: 'Location ID';
    key FACTORY_LOC   : String(40)      @title: 'Manufacturing Location';
        PRODUCT_ID    : String(40)      @title: 'Product ID';
        RESTRICTION   : String(30)      @title: 'Restriction';
        MODEL_VERSION : String(20)      @title: 'Model version';
        VERSION       : String(10)      @title: 'Version';
        SCENARIO      : String(32)      @title: 'Scenario';
        COMPONENT     : String(40)      @title: 'Component';
        LINE_ID       : String(40)      @title: 'Line ID';
        COMPCIR_QTY   : Decimal(13, 3)  @title: 'CompCir Qty';
        QUANTITY      : Decimal(13, 3)  @title: 'Qty;';
        COEFFCIENT    : Decimal(30, 17) @title: 'Coeffcient';
}

@cds.persistence.exists
entity V_ROLES_LOCPROD{
    key  FACTORY_LOC   : String(4)   @title: 'Factory Location ';
         LOCATION_DESC : String(30)  @title: 'Factory Loc Description';
    key  PLAN_LOC      : String(4)   @title: 'Planning Location ';
         PLANLOC_DESC  : String(30)  @title: 'Planning Location Description';
    key  DEMAND_LOC    : String(4)   @title: 'Demand Location ';
         DEMAND_DESC   : String(30)  @title: 'Demand Location Description';
    key  PRODUCT_ID    : String(40)  @title: 'Product';
         PROD_DESC     : String(40)  @title: 'Product Description';
    key  REF_PRODID    : String(40)  @title: 'Configurable Product';
         REFPROD_DESC  : String(100) @title: 'Configurable Product Description';
         MRP_GROUP     : String(4)   @title: 'MRP Group';
         MATERIAL_TYPE : String(4)   @title: 'Material Type'; 
    key  USER          : String(100) @title: 'User';
}

@cds.persistence.exists
entity V_ROLES_ACCESS{
    key  FACTORY_LOC   : String(4)   @title: 'Factory Location ';
    key  DEMAND_LOC    : String(4)   @title: 'Demand Location ';
    key  PRODUCT_ID    : String(40)  @title: 'Product';
    key  REF_PRODID    : String(40)  @title: 'Reference Product Id';
         MRP_GROUP     : String(4)   @title: 'MRP Group';
         MATERIAL_TYPE : String(4)   @title: 'Material Type'; 
    key  USER          : String(100) @title: 'User';
    key  CREATE        : Boolean     @title:'Create Access';
    key  UPDATE        : Boolean     @title:'Update Access';
    key  DELETE        : Boolean     @title:'Delete Access';
}

@cds.persistence.exists
entity V_VARIANT_TABLES {
    key TABLE_NAME           : String(18) @title: 'Variant Table Name';
    key ROW_ID               : String(5)  @title: 'Row ID';
    key COLUMN_ID            : String(5)  @title: 'Column ID';
    key CHAR_NAME            : String(30) @title: 'Characteristic Name';
        CHAR_NUM             : String(10) @title: 'Characteristic Number';
        CHARACTERISTIC_VALUE : String(70) @title: 'Characteristic Value';
        BOM_IND              : String(1)  @title: 'BOM Indicator';
}

@cds.persistence.exists
entity V_USER_ROLES{
    Key USER        : String(100) @title: 'User';
    Key ROLE_NAME   : String(100) @title: 'Role Name';
        DESCRIPTION : String(200) @title: 'Role Description';
        READ          : Boolean  @title: 'Read Access';
        CREATE        : Boolean  @title: 'Create Access';
        UPDATE        : Boolean  @title: 'Update Access';
        DELETE        : Boolean  @title: 'Delete Access';

}

@cds.persistence.exists
entity V_SALES_PROD_ORD{
    key SALES_DOC     : String(10)   @title:'SALES_DOC';
    key SALESDOC_ITEM      : String(10)  @title:'SALESDOC_ITEM';
    key   PROD_ORDER       : String(12)   @title:'PROD_ORDER';
    key PRODUCT_ID          : String(12)  @title: 'Product';
    key   COMP_QTY       :    Decimal(13, 3) @title:'COMP_QTY';
    key   ORD_TYPE       : String(20)   @title:'ORD_TYPE';
}

@cds.persistence.exists
entity V_LOC_CONFIGPRODUCT{
    key LOCATION_ID     : String(4)   @title:'All Locations';
        LOCATION_DESC   : String(30)  @title:'Location Description';
    key PRODUCT_ID      : String(40)  @title:'Configurable Product';
        PROD_DESC       : String(40)  @title:'Product Description';
        MRP_GROUP       : String(4)   @title:'MRP Group';
}

@cds.persistence.exists
entity V_LOC_CONFIG_PROD_TYPE{
    key LOCATION_ID     : String(4)   @title:'Locations';
    key PRODUCT_ID      : String(40)  @title:'Configurable Product';
        PROD_TYPE       : String(4)   @title:'Product Type';
        MRP_GROUP       : String(4)   @title:'MRP Group';
}
@cds.persistence.exists
@cds.persistence.calcview
entity CV_OPTPERCENTAGES {
    key LOCATION_ID    : String(4)   @title: 'Location ID';
    key PRODUCT_ID     : String(40)  @title: 'Product ID';
    key CUSTOMER_GROUP : String(40)  @title: 'Customer Group';
    key MODEL_VERSION  : String(20)  @title: 'Model Version';
    key CHAR_NUM       : String(100) @title: 'Characteristic Number';
    key CHARVAL_NUM    : String(80)  @title: 'Characteristic Value Number';
    key VERSION        : String(10)  @title: 'Version';
    key SCENARIO       : String(32)  @title: 'Scenario';
    key WEEK_DATE      : Date        @title: 'Week Date';
    key CHAR_DESC      : String(160) @title: 'Characteristic Description';
    key CHAR_NAME      : String(80)  @title: 'Characteristic Name';
    key CHARVAL_DESC   : String(160) @title: 'Characteristic Value Description';
    key VERSION_NAME   : String(50)  @title: 'Version Name';
    key SCENARIO_NAME  : String(50)  @title: 'Scenario Name';
    key LOCATION_DESC  : String(30)  @title: 'Location Description';
    key PROD_DESC      : String(40)  @title: 'Product Description';
        OPT_PERCENT    : Decimal(5)  @title: 'Option Percentage';
        OPT_QTY        : Decimal(27) @title: 'Option Quantity';
        PROD_DEMAND    : Decimal(13) @title: 'Product Demand';
        ACT_DEM_VC     : Decimal(18) @title: 'Actual Demand VC';
        ACT_DEM        : Decimal(18) @title: 'Actual Demand';
        EFFECTIVE_QTY  : Decimal(29) @title: 'Effective Quantity';
        EFFECTIVE_PER  : Decimal(34) @title: 'Effective Percentage';
}


@cds.persistence.exists
@cds.persistence.calcview
entity CV_FORECAST_CHAR_ANALYSIS {
    key LOCATION_ID          : String(4)    @title: 'LOCATION_ID: LOCATION_ID';
    key PRODUCT_ID           : String(40)   @title: 'PRODUCT_ID: PRODUCT_ID';
    key PROD_DESC            : String(40)   @title: 'PROD_DESC: PROD_DESC';
    key REF_PRODID           : String(40)   @title: 'REF_PRODID: REF_PRODID';
    key REF_PROD_DESC        : String(40)   @title: 'REF_PROD_DESC: REF_PROD_DESC';
    key MODEL_VERSION        : String(20)   @title: 'MODEL_VERSION: MODEL_VERSION';
    key VERSION              : String(10)   @title: 'VERSION: VERSION';
    key VERSION_NAME         : String(50)   @title: 'VERSION_NAME: VERSION_NAME';
    key SCENARIO             : String(32)   @title: 'SCENARIO: SCENARIO';
    key SCENARIO_NAME        : String(50)   @title: 'SCENARIO_NAME: SCENARIO_NAME';
    key UNIQUE_ID            : Integer      @title: 'UNIQUE_ID: UNIQUE_ID';
    key UNIQUE_DESC          : String(100)  @title: 'UNIQUE_DESC: UNIQUE_DESC';
    key CHAR_TYPE            : String(2)    @title: 'CHAR_TYPE: CHAR_TYPE';
    key SEQUENCE             : Integer      @title: 'SEQUENCE: SEQUENCE';
    key CHAR_NUM             : String(100)  @title: 'CHAR_NUM: CHAR_NUM';
    key CHAR_NAME            : String(80)   @title: 'CHAR_NAME: CHAR_NAME';
    key CHAR_DESC            : String(160)  @title: 'CHAR_DESC: CHAR_DESC';
    key CHARVAL_NUM          : String(80)   @title: 'CHARVAL_NUM: CHARVAL_NUM';
    key CHAR_VALUE           : String(70)   @title: 'CHAR_VALUE: CHAR_VALUE';
    key COLOR_CODE           : String(10)   @title: 'COLOR_CODE: COLOR_CODE';
    key COLOR_NAME           : String(25)   @title: 'COLOR_NAME: COLOR_NAME';
    key COLOR_FAMILY         : String(25)   @title: 'COLOR_FAMILY: COLOR_FAMILY';
    key COLORBLIND_RATIONALE : String(1000) @title: 'COLORBLIND_RATIONALE: COLORBLIND_RATIONALE';
        CIR_QTY              : Integer      @title: 'CIR_QTY: CIR_QTY';
        ACTUAL_QTY           : Integer      @title: 'ACTUAL_QTY: ACTUAL_QTY';
        UNCONSUMED_FORECAST  : Integer      @title: 'UNCONSUMED_FORECAST: UNCONSUMED_FORECAST';
}

// @cds.persistence.exists
// entity V_ASMB_COEEFICIENT{
//     key LOCATION_ID : String(4)  @title: 'Location ID';
//     key PRODUCT_ID : String(40)  @title :'Product ID';
//     key COMPONENT : String(40)  @title :'Component ID';
//     key   WEEK_DATE : Date  @title :'Date';
//         COMPCIR_QTY:Decimal (13,3) @title :'ComCir Qty';
//         QUANTITY :Decimal(13,3) @title : 'Quantity';
//         COEFFCIENT : Decimal(30,17) @title: 'Coefficient';
// }
@cds.persistence.exists
entity V_IBP_SALESH_ACTDEMD {
    key LOCATION_ID    : String(4)      @title: 'Location ID';
    key FACTORY_LOC    : String(4)      @title: 'FacLoc ID';
    key PRODUCT_ID     : String(40)     @title: 'Product ID';
    key REF_PRODID     : String(40)     @title: 'Ref ProdId';
    key CUSTOMER_GROUP : String(20)     @title: 'Customer Group';
        WEEK_DATE      : Date           @title: 'Date';
        ORD_QTY        : Decimal(18, 3) @title: 'Ord Qty';
        ADJ_QTY        : Decimal(18, 3) @title: 'Adj Quantity';

}

@cds.persistence.exists
entity V_DMD_FORECAST_ANALYTICAL {
    key COMP_TYPE        : String(40) @title: 'Type';
    key LOCATION_ID      : String(4)  @title: 'Location';
    key PRODUCT_ID       : String(40) @title: 'Product';
    key LOCATION_DESC    : String(30) @title: 'Location Description';
    key PROD_DESC        : String(30) @title: 'Product Description';
    key THIS_WEEK_DATE   : Date       @title: 'Current Week Date';
    key PREV_WEEK_DATE   : Date       @title: 'Last Week Date';
    key THIS_WEEK_VALUE  : Integer    @title: 'Current Week Qty';
    key PREV_WEEK_VALUE  : Integer    @title: 'Previous Week Qty';
    key ABS_DIFF_WOW     : Integer    @title: 'Absolute Difference';
    key PERCENT_DIFF_WOW : Decimal    @title: 'Percentage Difference';
}


// // @cds.persistence.exists
// // @cds.persistence.calcview
// // entity CV_PLANNED_ORDER_ANALYSIS {
// //         key     LOCATION_ID: String(4)  @title: 'LOCATION_ID' ;
// //         key     PRODUCT_ID: String(40)  @title: 'PRODUCT_ID' ;
// //         key     WEEK_DATE: Date  @title: 'WEEK_DATE' ;
// //         key     CIR_ID: Integer  @title: 'CIR_ID' ;
// //         key     MODEL_VERSION: String(20)  @title: 'MODEL_VERSION' ;
// //         key     VERSION: String(10)  @title: 'VERSION' ;
// //         key     SCENARIO: String(32)  @title: 'SCENARIO' ;
// //         key     UNIQUE_ID: Integer  @title: 'UNIQUE_ID' ;
// //         key     UNIQUE_DESC: String(100)  @title: 'UNIQUE_DESC' ;
// //         key     CHAR_NUM: String(100)  @title: 'CHAR_NUM' ;
// //         key     CHAR_NAME: String(80)  @title: 'CHAR_NAME' ;
// //         key     CHAR_DESC: String(160)  @title: 'CHAR_DESC' ;
// //         key     CHAR_VALUE: String(70)  @title: 'CHAR_VALUE' ;
// //         key     CHARVAL_NUM: String(80)  @title: 'CHARVAL_NUM' ;
// //                 CIR_QTY: Integer  @title: 'CIR_QTY' ;
// //                 BFORECHNG_CIRQTY: Integer  @title: 'BFORECHNG_CIRQTY' ;
// //         key     SNAPSHOT_CHK: String(1)  @title: 'SNAPSHOT_CHK' ;
// //                 ACTUAL_QTY: Integer  @title: 'ACTUAL_QTY' ;
// //                 UNCONSUMED_FORECAST: Integer  @title: 'UNCONSUMED_FORECAST' ;
// //                 PRODORD_QTY: Decimal(13, 3)  @title: 'PRODORD_QTY' ;
// //         key     OPEN_ASSEMBLY: Integer  @title: 'OPEN_ASSEMBLY' ;
// //         key     PROD_DESC: String(40)  @title: 'PROD_DESC' ;
// //         key     Config_Product: String(40)  @title: 'PRODUCT_ID_1' ;
// //         key     Config_Prodct_des: String(40)  @title: 'PROD_DESC_1' ;
// //         key     YEAR_QUAETER: String(13)  @title: 'Year Quarter' ;
// //                 Count: Integer  @title: 'Count' ;
// //         key     Char_CharValue: String(30)  @title: 'Char_CharValue' ;
// //         };

// // @cds.persistence.exists
// // @cds.persistence.calcview
// //         entity CV_CP_CIR_GENERATED {
// //             key     LOCATION_ID: String(4)  @title: 'LOCATION_ID' ;
// //             key     PRODUCT_ID: String(40)  @title: 'PRODUCT_ID' ;
// //             key     WEEK_DATE: Date  @title: 'WEEK_DATE' ;
// //             key     CIR_ID: Integer  @title: 'CIR_ID' ;
// //             key     MODEL_VERSION: String(20)  @title: 'MODEL_VERSION' ;
// //             key     VERSION: String(10)  @title: 'VERSION' ;
// //             key     SCENARIO: String(32)  @title: 'SCENARIO' ;
// //             key     UNIQUE_ID: Integer  @title: 'UNIQUE_ID' ;
// //                     CIR_QTY: Integer  @title: 'CIR_QTY' ;
// //                     BFORECHNG_CIRQTY: Integer  @title: 'BFORECHNG_CIRQTY' ;
// //             key     SNAPSHOT_CHK: String(1)  @title: 'SNAPSHOT_CHK' ;
// //                     ACTUAL_QTY: Integer  @title: 'ACTUAL_QTY' ;
// //                     UNCONSUMED_FORECAST: Integer  @title: 'UNCONSUMED_FORECAST' ;
// //                     PRODORD_QTY: Decimal(13, 3)  @title: 'PRODORD_QTY' ;
// //                     OPEN_ASSEMBLY: Integer  @title: 'OPEN_ASSEMBLY' ;
// //                     Count: Integer  @title: 'Count' ;
// //             }
// // @cds.persistence.exists
// // @cds.persistence.calcview
// //         entity CV_ASSEMBLY_REQ_ANALYSIS {
//                 key     LOCATION_ID: String(4)  @title: 'LOCATION_ID' ;
//                 key     PRODUCT_ID: String(40)  @title: 'PRODUCT_ID' ;
//                 key     ITEM_NUM: String(6)  @title: 'ITEM_NUM' ;
//                 key     COMPONENT: String(40)  @title: 'COMPONENT' ;
//                 key     WEEK_DATE: Date  @title: 'WEEK_DATE' ;
//                 key     MODEL_VERSION: String(20)  @title: 'MODEL_VERSION' ;
//                 key     VERSION: String(10)  @title: 'VERSION' ;
//                 key     SCENARIO: String(32)  @title: 'SCENARIO' ;
//                 key     TYPE: String(2)  @title: 'TYPE' ;
//                 key     REF_PRODID: String(40)  @title: 'REF_PRODID' ;
//                 key     FACTORY_LOC: String(4)  @title: 'FACTORY_LOC' ;
//                 key     UNIQUE_ID: Integer  @title: 'UNIQUE_ID' ;
//                         CIR_QTY: Integer  @title: 'CIR_QTY' ;
//                         COMPCIR_QTY: Decimal(13, 3)  @title: 'COMPCIR_QTY' ;
//                         ACTUAL_QTY: Integer  @title: 'ACTUAL_QTY' ;
//                 key     CALENDAR_WEEK: String(50)  @title: 'CALENDAR_WEEK' ;
//                 key     TELESCOPIC_WEEK: String(50)  @title: 'TELESCOPIC_WEEK' ;
//                 key     Assembly_Description: String(13)  @title: 'Assembly_Description' ;
//                         Count: Integer  @title: 'Count' ;
//                 key     YEAR_QUARTER: String(13)  @title: 'Year Quarter' ;
//                 }


@cds.persistence.exists
@cds.persistence.calcview
entity CV_PLANNED_ORDER_ANALYSIS {
    key LOCATION_ID               : String(4)   @title: 'LOCATION_ID';
    key PRODUCT_ID                : String(40)  @title: 'PRODUCT_ID';
    key WEEK_DATE                 : Date        @title: 'WEEK_DATE';
    key CIR_ID                    : Integer     @title: 'CIR_ID';
    key MODEL_VERSION             : String(20)  @title: 'MODEL_VERSION';
    key VERSION                   : String(10)  @title: 'VERSION';
    key SCENARIO                  : String(32)  @title: 'SCENARIO';
    key UNIQUE_ID                 : Integer     @title: 'UNIQUE_ID';
    key UNIQUE_DESC               : String(100) @title: 'UNIQUE_DESC';
    key CHAR_NUM                  : String(100) @title: 'CHAR_NUM';
    key CHAR_NAME                 : String(80)  @title: 'CHAR_NAME';
    key CHAR_DESC                 : String(160) @title: 'CHAR_DESC';
    key CHAR_VALUE                : String(70)  @title: 'CHAR_VALUE';
    key CHARVAL_NUM               : String(80)  @title: 'CHARVAL_NUM';
        CIR_QTY                   : Integer     @title: 'CIR_QTY';
        BFORECHNG_CIRQTY          : Integer     @title: 'BFORECHNG_CIRQTY';
    key SNAPSHOT_CHK              : String(1)   @title: 'SNAPSHOT_CHK';
        ACTUAL_QTY                : Integer     @title: 'ACTUAL_QTY';
        UNCONSUMED_FORECAST       : Integer     @title: 'UNCONSUMED_FORECAST';
        PRODORD_QTY               : Decimal(13) @title: 'PRODORD_QTY';
    key OPEN_ASSEMBLY             : Integer     @title: 'OPEN_ASSEMBLY';
    key PROD_DESC                 : String(40)  @title: 'PROD_DESC';
    key CONFIGURATION_PRODUCT     : String(40)  @title: 'PRODUCT_ID_1';
    key CONFIGURATION_PRODUCT_DES : String(40)  @title: 'PROD_DESC_1';
    key YEAR_QUAETER              : String(13)  @title: 'Year Quarter';
        COUNT                     : Integer     @title: 'Count';
    key CHAR_CHARVALUE            : String(30)  @title: 'Char_CharValue';
}


@cds.persistence.exists
@cds.persistence.calcview
entity CV_CP_CIR_GENERATED {
    key LOCATION_ID         : String(4)   @title: 'LOCATION_ID';
    key PRODUCT_ID          : String(40)  @title: 'PRODUCT_ID';
    key WEEK_DATE           : Date        @title: 'WEEK_DATE';
    key CIR_ID              : Integer     @title: 'CIR_ID';
    key MODEL_VERSION       : String(20)  @title: 'MODEL_VERSION';
    key VERSION             : String(10)  @title: 'VERSION';
    key SCENARIO            : String(32)  @title: 'SCENARIO';
    key UNIQUE_ID           : Integer     @title: 'UNIQUE_ID';
        CIR_QTY             : Integer     @title: 'CIR_QTY';
        BFORECHNG_CIRQTY    : Integer     @title: 'BFORECHNG_CIRQTY';
    key SNAPSHOT_CHK        : String(1)   @title: 'SNAPSHOT_CHK';
        ACTUAL_QTY          : Integer     @title: 'ACTUAL_QTY';
        UNCONSUMED_FORECAST : Integer     @title: 'UNCONSUMED_FORECAST';
        PRODORD_QTY         : Decimal(13) @title: 'PRODORD_QTY';
        OPEN_ASSEMBLY       : Integer     @title: 'OPEN_ASSEMBLY';
        COUNT               : Integer     @title: 'Count';
}


@cds.persistence.exists
@cds.persistence.calcview
entity CV_PID_UID_DISTRIBUTION {
    key LOCATION_ID             : String(4)   @title: 'LOCATION_ID';
    key PRODUCT_ID              : String(40)  @title: 'PRODUCT_ID';
    key CUSTOMER_GROUP          : String(20)  @title: 'CUSTOMER_GROUP';
    key PRIMARY_ID              : Integer     @title: 'PRIMARY_ID';
        PRIMARY_ID_TOT_ORD_QTY  : Decimal(13) @title: 'ORD_QTY';
    key UNIQUE_ID               : Integer     @title: 'UNIQUE_ID';
        ORD_QTY                 : Decimal(13) @title: 'ORD_QTY';
        DISTRIBUTION_PERCENTAGE : Decimal(13) @title: 'DISTRIBUTION_PERCENTAGE';
}


@cds.persistence.exists
@cds.persistence.calcview
entity CV_ASSEMBLY_REQ_ANALYSIS {
    key LOCATION_ID          : String(4)   @title: 'LOCATION_ID';
    key PRODUCT_ID           : String(40)  @title: 'PRODUCT_ID';
    key ITEM_NUM             : String(6)   @title: 'ITEM_NUM';
    key COMPONENT            : String(40)  @title: 'COMPONENT';
    key WEEK_DATE            : Date        @title: 'WEEK_DATE';
    key MODEL_VERSION        : String(20)  @title: 'MODEL_VERSION';
    key VERSION              : String(10)  @title: 'VERSION';
    key SCENARIO             : String(32)  @title: 'SCENARIO';
    key TYPE                 : String(2)   @title: 'TYPE';
    key REF_PRODID           : String(40)  @title: 'REF_PRODID';
    key FACTORY_LOC          : String(4)   @title: 'FACTORY_LOC';
    key UNIQUE_ID            : Integer     @title: 'UNIQUE_ID';
        CIR_QTY              : Integer     @title: 'CIR_QTY';
        COMPCIR_QTY          : Decimal(13) @title: 'COMPCIR_QTY';
        ACTUAL_QTY           : Integer     @title: 'ACTUAL_QTY';
    key CALENDAR_WEEK        : String(50)  @title: 'CALENDAR_WEEK';
    key TELESCOPIC_WEEK      : String(50)  @title: 'TELESCOPIC_WEEK';
    key ASSEMBLY_DESCRIPTION : String(13)  @title: 'Assembly_Description';
        MRP_GROUP            : String(4)   @title: 'MRP Group';
        MRP_TYPE             : String(2)   @title: 'MRP Type';
        COUNT                : Integer     @title: 'Count';
    key YEAR_QUARTER         : String(13)  @title: 'Year Quarter';
}

@cds.persistence.exists
@cds.persistence.calcview
entity CV_ASSEMBLY_COMPONENT {
    key LOCATION_ID           : String(4)   @title: 'LOCATION_ID';
    key LOCATION_DESC         : String(30)  @title: 'LOCATION_DESC';
    key PRODUCT_ID            : String(40)  @title: 'PRODUCT_ID';
    key PROD_DESC             : String(40)  @title: 'PROD_DESC';
    key ITEM_NUM              : String(6)   @title: 'ITEM_NUM';
    key ASSEMBLY              : String(40)  @title: 'COMPONENT';
    key MODEL_VERSION         : String(20)  @title: 'MODEL_VERSION';
    key VERSION               : String(10)  @title: 'VERSION';
    key SCENARIO              : String(32)  @title: 'SCENARIO';
    key RULE_TYPE             : String(2)   @title: 'TYPE_RULE_TYPE';
    key TYPE                  : String(2)   @title: 'TYPE';
    key REF_PRODID            : String(40)  @title: 'REF_PRODID';
    key FACTORY_LOC           : String(4)   @title: 'FACTORY_LOC';
    key FACTORY_LOCATION_DESC : String(30)  @title: 'LOCATION_DESC';
        // key MRP_GROUP             : String(4)   @title: 'MRP_GROUP';
    key PHANTOM_IND           : String(1)   @title: 'PHANTOM_IND';
    key CONFIGURABLE          : String(1)   @title: 'CONFIGURABLE';
    key UNIQUE_ID             : Integer     @title: 'UNIQUE_ID';
    key CALENDAR_WEEK         : String(50)  @title: 'CALENDAR_WEEK';
    key TELESCOPIC_WEEK       : String(50)  @title: 'TELESCOPIC_WEEK';
    key WEEK_STARTDATE        : Date        @title: 'WEEK_STARTDATE';
    key WEEK_ENDDATE          : Date        @title: 'WEEK_ENDDATE';
    key REQ_TYPE              : String(13)  @title: 'REQ_TYPE';
    key ASM_DESC              : String(13)  @title: 'ASM_DESC';
        ASMB_QTY              : Integer     @title: 'CIR_QTY_ASMB_QTY';
        CIR_QTY               : Integer     @title: 'CIR_QTY';
        CIR_ASMB_QTY          : Decimal(13) @title: 'COMPCIR_QTY';
        ACTUAL_QTY            : Integer     @title: 'ACTUAL_QTY';
        PROD_DEM              : Decimal(13) @title: 'QUANTITY';
        TOTAL_QTY             : Decimal(13) @title: 'TOTAL_QTY';
        COEFFICIENTS          : Integer     @title: 'COEFFICIENTS';
}


@cds.persistence.exists
@cds.persistence.calcview
entity CV_TS_HISTORY_STAT {
    key LOCATION_ID                 : String(4)   @title: 'LOCATION_ID';
    key PRODUCT_ID                  : String(40)  @title: 'PRODUCT_ID';
    key GROUP_ID                    : String(13)  @title: 'GROUP_ID';
    key CUSTOMER_GROUP              : String(20)  @title: 'CUSTOMER_GROUP';
    key WEEK_STARTDATE              : Date        @title: 'WEEK_STARTDATE';
        ROW_COUNT                   : Double      @title: 'ROW_COUNT';
        GROUP_COUNT                 : Decimal(13) @title: 'CONFIRMED_QTY';
        GROUP_COUNT_RATE            : Decimal(13) @title: 'GROUP_COUNT_RATE';
        CONFIRMED_QTY_TOT_CONFIRMED : Decimal(13) @title: 'CONFIRMED_QTY_TOT_CONFIRMED';
}

@cds.persistence.exists
@cds.persistence.calcview
entity CV_TS_HISTORY_CUST {
    key LOCATION_ID                 : String(4)      @title: 'Location ID';
    key PRODUCT_ID                  : String(40)     @title: 'Product ID';
    key WEEK_DATE                   : Date           @title: 'Week Date';
        GROUP_ID                    : Integer        @title: 'Planning relevant Primary ID';
        CUSTOMER_GROUP              : String(20)     @title: 'Customer Group';
        GROUP_COUNT                 : Decimal(13, 3) @title: 'Confirmed Quantity';
        GROUP_COUNT_RATE            : Decimal(13, 4) @title: 'Group Count Rate';
        CONFIRMED_QTY_TOT_CONFIRMED : Decimal(13, 3) @title: 'Confirmed Qty Not Confirmed';
}


@cds.persistence.exists
@cds.persistence.calcview
entity CV_CLUSTERS {
    key LOCATION_ID   : String(4)   @title: 'LOCATION_ID: LOCATION_ID';
    key PRODUCT_ID    : String(40)  @title: 'PRODUCT_ID: PRODUCT_ID';
    key MODEL_PROFILE : String(50)  @title: 'MODEL_PROFILE: MODEL_PROFILE';
    key CLUSTER_ID    : Integer     @title: 'CLUSTER_ID: CLUSTER_ID';
    key UNIQUE_ID     : String(50)  @title: 'UNIQUE_ID: UNIQUE_ID';
    key C1            : Double      @title: 'C1: C1';
    key C2            : Double      @title: 'C2: C2';
    key C3            : Double      @title: 'C3: C3';
    key C4            : Double      @title: 'C4: C4';
    key C5            : Double      @title: 'C5: C5';
    key C6            : Double      @title: 'C6: C6';
    key C7            : Double      @title: 'C7: C7';
    key C8            : Double      @title: 'C8: C8';
    key C9            : Double      @title: 'C9: C9';
    key C10           : Double      @title: 'C10: C10';
    key C11           : Double      @title: 'C11: C11';
    key C12           : Double      @title: 'C12: C12';
    key C13           : Double      @title: 'C13: C13';
    key C14           : Double      @title: 'C14: C14';
    key C15           : Double      @title: 'C15: C15';
    key C16           : Double      @title: 'C16: C16';
    key C17           : Double      @title: 'C17: C17';
    key C18           : Double      @title: 'C18: C18';
    key C19           : Double      @title: 'C19: C19';
    key C20           : Double      @title: 'C20: C20';
    key C21           : Double      @title: 'C21: C21';
    key C22           : Double      @title: 'C22: C22';
    key C23           : Double      @title: 'C23: C23';
    key C24           : Double      @title: 'C24: C24';
    key C25           : Double      @title: 'C25: C25';
    key C26           : Double      @title: 'C26: C26';
    key C27           : Double      @title: 'C27: C27';
    key C28           : Double      @title: 'C28: C28';
    key C29           : Double      @title: 'C29: C29';
    key C30           : Double      @title: 'C30: C30';

        DEMAND        : Decimal(18) @title: 'DEMAND: DEMAND';
    key END_DATE      : Date        @title: 'END_DATE: END_DATE';
    key START_DATE    : Date        @title: 'START_DATE: START_DATE';
    key YEAR_QUARTER  : String(13)  @title: 'YEAR_QUARTER: YEAR_QUARTER';
    key QUARTER       : String(13)  @title: 'QUARTER: QUARTER';
    key YEAR_MONTH    : String(13)  @title: 'YEAR_MONTH: YEAR_MONTH';
    key YEAR          : String(13)  @title: 'YEAR: YEAR';
    key YEAR_WEEK     : String(13)  @title: 'YEAR_WEEK: Year Week';
}


@cds.persistence.exists
entity CP_V_AHC_CLUSTERS_SORTED_COMBINED {
    key LOCATION_ID : String(4)      @title: 'LOCATION_ID: LOCATION_ID';
    key PRODUCT_ID  : String(40)     @title: 'PRODUCT_ID: PRODUCT_ID';
        // key     MODEL_PROFILE: String(50)  @title: 'MODEL_PROFILE: MODEL_PROFILE' ;
    key CLUSTER_ID  : Integer        @title: 'CLUSTER_ID: CLUSTER_ID';
    key UNIQUE_ID   : String(50)     @title: 'UNIQUE_ID: UNIQUE_ID';
    key START_DATE  : Date           @title: 'START_DATE: START_DATE';
    key END_DATE    : Date           @title: 'END_DATE: END_DATE';
        DEMAND      : Decimal(18, 3) @title: 'DEMAND: DEMAND';
    key MONTH       : Integer        @title: 'MONTH';
    key YEAR        : Integer        @title: 'YEAR';
    key QUARTER     : Integer        @title: 'QUARTER';
    key C1          : String(80)     @title: 'C1: C1';
    key C2          : String(80)     @title: 'C2: C2';
    key C3          : String(80)     @title: 'C3: C3';
    key C4          : String(80)     @title: 'C4: C4';
    key C5          : String(80)     @title: 'C5: C5';
    key C6          : String(80)     @title: 'C6: C6';
    key C7          : String(80)     @title: 'C7: C7';
    key C8          : String(80)     @title: 'C8: C8';
    key C9          : String(80)     @title: 'C9: C9';
    key C10         : String(80)     @title: 'C10: C10';
    key C11         : String(80)     @title: 'C11: C11';
    key C12         : String(80)     @title: 'C12: C12';
    key C13         : String(80)     @title: 'C13: C13';
    key C14         : String(80)     @title: 'C14: C14';
    key C15         : String(80)     @title: 'C15: C15';
    key C16         : String(80)     @title: 'C16: C16';
    key C17         : String(80)     @title: 'C17: C17';
    key C18         : String(80)     @title: 'C18: C18';
    key C19         : String(80)     @title: 'C19: C19';
    key C20         : String(80)     @title: 'C20: C20';
    key C21         : String(80)     @title: 'C21: C21';
    key C22         : String(80)     @title: 'C22: C22';
    key C23         : String(80)     @title: 'C23: C23';
    key C24         : String(80)     @title: 'C24: C24';
    key C25         : String(80)     @title: 'C25: C25';
    key C26         : String(80)     @title: 'C26: C26';
    key C27         : String(80)     @title: 'C27: C27';
    key C28         : String(80)     @title: 'C28: C28';
    key C29         : String(80)     @title: 'C29: C29';
    key C30         : String(80)     @title: 'C30: C30';
    key NC1         : Double         @title: 'NC1: NC1';
    key NC2         : Double         @title: 'NC2: NC2';
    key NC3         : Double         @title: 'NC3: NC3';
    key NC4         : Double         @title: 'NC4: NC4';
    key NC5         : Double         @title: 'NC5: NC5';
    key NC6         : Double         @title: 'NC6: NC6';
    key NC7         : Double         @title: 'NC7: NC7';
    key NC8         : Double         @title: 'NC8: NC8';
    key NC9         : Double         @title: 'NC9: NC9';
    key NC10        : Double         @title: 'NC10: NC10';
    key NC11        : Double         @title: 'NC11: NC11';
    key NC12        : Double         @title: 'NC12: NC12';
    key NC13        : Double         @title: 'NC13: NC13';
    key NC14        : Double         @title: 'NC14: NC14';
    key NC15        : Double         @title: 'NC15: NC15';
    key NC16        : Double         @title: 'NC16: NC16';
    key NC17        : Double         @title: 'NC17: NC17';
    key NC18        : Double         @title: 'NC18: NC18';
    key NC19        : Double         @title: 'NC19: NC19';
    key NC20        : Double         @title: 'NC20: NC20';
    key NC21        : Double         @title: 'NC21: NC21';
    key NC22        : Double         @title: 'NC22: NC22';
    key NC23        : Double         @title: 'NC23: NC23';
    key NC24        : Double         @title: 'NC24: NC24';
    key NC25        : Double         @title: 'NC25: NC25';
    key NC26        : Double         @title: 'NC26: NC26';
    key NC27        : Double         @title: 'NC27: NC27';
    key NC28        : Double         @title: 'NC28: NC28';
    key NC29        : Double         @title: 'NC29: NC29';
    key NC30        : Double         @title: 'NC30: NC30';
}

@cds.persistence.exists
@cds.persistence.calcview : false
entity CP_VC_OPTIMIZATION_PENALTIES {
    key LOCATION_ID  : String(5)   not null;
    key PRODUCT_ID   : String(40)  not null;
    key ALGORITHM    : String(10)  not null;
        PENALTY      : Integer     not null;
        PENALTY_TIME : Timestamp;
}

@cds.persistence.exists
@cds.persistence.calcview : false
entity CP_VC_PREDICTIONS_OPTIMIZED {
    key CAL_DATE                 : Date         not null;
    key LOCATION_ID              : String(5)    not null;
    key PRODUCT_ID               : String(40)   not null;
    key MODEL_VERSION            : String(20)   not null;
    key VERSION                  : String(10)   not null;
    key SCENARIO                 : String(32)   not null;
    key ALGORITHM                : String(10)   not null;
    key CHAR_NUM                 : String(100)  not null default 'NA';
    key CHARVAL_NUM              : String(70)   not null;
        PREDICTED_QTY            : Double;
        IBP_PLANNED_QTY          : Double;
        BTP_REVISED_QTY          : Double;
        PREDICTED_DEVIATION      : Double;
        POST_PREDICTED_DEVIATION : Double;
        NORMALIZED_DEVIATION     : Double;
}

@cds.persistence.exists
entity CV_CHARACTERISTIC_ANALYSIS {

    key LOCATION_ID   : String(4)   @title: 'Location';
    key REF_PRODID    : String(40)  @title: 'Ref Product';
    key PRODUCT_ID    : String(40)  @title: 'Product';
    key PRIMARY_ID    : Integer     @title: 'Primary ID';
    key CHAR_NUM      : String(100) @title: 'Char Num';
    key CHARVAL_NUM   : String(80)  @title: 'CHARVAL NUM';
    key CHAR_VALUE    : String(70)  @title: 'CHAR VALUE';
    key CHAR_NAME     : String(80)  @title: 'Characteristic Name';
    key CHAR_DESC     : String(160) @title: 'Characteristic Description';
    key CHAR_TYPE     : String(2)   @title: 'CHAR TYPE';
    key SEQUENCE      : Integer     @title: 'SEQUENCE';
        CONFIRMED_QTY : Decimal(13) @title: 'CONFIRMED QTY';
        ORD_QTY       : Decimal(13) @title: 'ORD QTY';
        NET_VALUE     : Decimal(15) @title: 'NET VALUE';
        COLOR_CODE    : String(40)  @title: 'Color Code';
        COLOR_NAME    : String(40)  @title: 'Color Name';
        COLOR_FAMILY  : String(40)  @title: 'Color Family'
}


@cds.persistence.exists
@cds.persistence.calcview
entity CV_CLUSTER_HEATMAP05 {
    key LOCATION_ID         : String(4)   @title: 'LOCATION_ID';
    key CONFIG_PRODUCT      : String(40)  @title: 'CONFIG_PRODUCT';
    key PRODUCT_ID          : String(40)  @title: 'PRODUCT_ID';
        // key     MAT_AVAILDATE: Date  @title: 'MAT_AVAILDATE' ;
    key CLUSTER_ID          : Integer     @title: 'CLUSTER_ID';
    key CLUSTER_SORT_SEQ    : Integer64   @title: 'SORT_SEQ';
    key PRIMARY_ID_SEQUENCE : Integer     @title: 'CALCULATED_RANK';
    key PRIMARY_ID          : Integer     @title: 'PRIMARY_ID';
    key CHAR_NUM            : String(100) @title: 'CHAR_NUM';
    key CHAR_DESC           : String(160) @title: 'CHAR_DESC';
    key CHARVAL_NUM         : String(80)  @title: 'CHARVAL_NUM';
        ORD_QTY             : Decimal(13) @title: 'ORD_QTY';
    key COLOR_CODE          : String(10)  @title: 'COLOR_CODE';
    key CHAR_SEQUENCE       : Integer     @title: 'CHAR_SEQUENCE';
    key WEIGHTAGE           : Decimal(13) @title: 'WEIGHTAGE';
    key RANK_COLUMN         : Double      @title: 'Rank_Column';
    key PID_FLAG            : Integer     @title: 'PID_FLAG';
    key CHAR_FLAG           : Integer     @title: 'PID_FLAG_CHAR';
    key CALCULATED_RANK     : Integer     @title: 'CALCULATED_RANK';
        // key     WEEK_DATE: Date  @title: 'WEEK_DATE' ;
    key YEAR                : String(13)  @title: 'YEAR';
        // key     YEAR_MONTH: String(13)  @title: 'YEAR_MONTH' ;
        // key     QUARTER: String(13)  @title: 'QUARTER' ;
        // key     YEAR_QUAETER: String(13)  @title: 'YEAR_QUAETER' ;
        UNIQUE_ID_COLOR     : Integer     @title: 'Unique ID Color'

}

//Lags
@cds.persistence.exists
@cds.persistence.calcview
entity CV_SNAPSHOT_LAG_ASMB {
    key FACTORY_LOC    : String(4)   @title: 'FACTORY_LOC';
    key LOCATION_ID    : String(4)   @title: 'LOCATION_ID';
    key PRODUCT_ID     : String(40)  @title: 'PRODUCT_ID';
    key ASSEMBLY       : String(200) @title: 'ASSEMBLY';
        MRP_GROUP      : String(4)   @title: 'MRP Group';
        MRP_TYPE       : String(2)   @title: 'MRP Type';
    key SELECTED_MONTH : String(20)  @title: 'MONTH';
    key LAG_MONTH      : Integer     @title: 'LAG_MONTH';
        ACTUAL_MONTH   : String(50)  @title: 'ACTUAL_MONTH';
        LAG_QTY        : Integer     @title: 'LAG_QTY';
        ACTUAL_QTY     : Integer     @title: 'ACTUAL_QTY';
        MAPE           : Integer     @title: 'ACTUAL_QTY';
        MAPE_QTY_ABS   : Integer     @title: 'MAPE_QTY_ABS';
        MAPE_QTY       : Integer     @title: 'MAPE_QTY';
}

@cds.persistence.exists
@cds.persistence.calcview
entity CV_SNAPSHOT_LAG_OPT {
    key FACTORY_LOC    : String(4)   @title: 'FACTORY_LOC';
    key LOCATION_ID    : String(4)   @title: 'LOCATION_ID';
    key PRODUCT_ID     : String(40)  @title: 'PRODUCT_ID';
    key CHAR_NUM       : String(100) @title: 'Characteristic Number';
    key CHARVAL_NUM    : String(80)  @title: 'Characteristic Value Number';
    key SELECTED_MONTH : String(20)  @title: 'MONTH';
    key LAG_MONTH      : Integer     @title: 'LAG_MONTH';
        ACTUAL_MONTH   : String(50)  @title: 'ACTUAL_MONTH';
        LAG_QTY        : Integer     @title: 'LAG_QTY';
        ACTUAL_QTY     : Integer     @title: 'ACTUAL_QTY';
        MAPE           : Integer     @title: 'ACTUAL_QTY';
        MAPE_QTY_ABS   : Integer     @title: 'MAPE_QTY_ABS';
        MAPE_QTY       : Integer     @title: 'MAPE_QTY';
}

@cds.persistence.exists
@cds.persistence.calcview
entity CV_SNAPSHOT_LAG_RTR {
    key FACTORY_LOC    : String(4)  @title: 'FACTORY_LOC';
    key LOCATION_ID    : String(4)  @title: 'LOCATION_ID';
    key LINE_ID        : String(40) @title: 'Line';
    key RESTRICTION    : String(30) @title: 'Restriction';
    key SELECTED_MONTH : String(20) @title: 'MONTH';
    key LAG_MONTH      : Integer    @title: 'LAG_MONTH';
        ACTUAL_MONTH   : String(50) @title: 'ACTUAL_MONTH';
        LAG_QTY        : Integer    @title: 'LAG_QTY';
        ACTUAL_QTY     : Integer    @title: 'ACTUAL_QTY';
        MAPE           : Integer    @title: 'ACTUAL_QTY';
        MAPE_QTY_ABS   : Integer    @title: 'MAPE_QTY_ABS';
        MAPE_QTY       : Integer    @title: 'MAPE_QTY';
}

@cds.persistence.exists
@cds.persistence.calcview
entity CV_SNAPSHOT_LAG_PROD_DMD {
    key FACTORY_LOC    : String(4)  @title: 'FACTORY_LOC';
    key LOCATION_ID    : String(4)  @title: 'LOCATION_ID';
    key PRODUCT_ID     : String(40) @title: 'PRODUCT_ID';
    key SELECTED_MONTH : String(20) @title: 'MONTH';
    key LAG_MONTH      : Integer    @title: 'LAG_MONTH';
        ACTUAL_MONTH   : String(50) @title: 'ACTUAL_MONTH';
        LAG_QTY        : Integer    @title: 'LAG_QTY';
        ACTUAL_QTY     : Integer    @title: 'ACTUAL_QTY';
        MAPE           : Integer    @title: 'ACTUAL_QTY';
        MAPE_QTY_ABS   : Integer    @title: 'MAPE_QTY_ABS';
        MAPE_QTY       : Integer    @title: 'MAPE_QTY';
}

