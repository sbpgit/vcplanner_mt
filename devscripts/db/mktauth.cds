context mkt {
    entity CONSTRAINTS  {
        key ID : String(15) @title : 'Market Auth ID';
	    key TYPE : String(20) @title : 'Authorization Type';
        key SUBJECT : String(5000) @title : 'Subject';
        APPLICABILITY : String(1000) @title : 'Applicability';
        LEVEL : Integer @ title : 'Constraint Level'; 
        SEQUENCE : Integer @ title : 'Sequence At Constraint Level'; 
    }

    entity APPLICABILITY_RULES  {
        key ID : String(15) @title : 'Market Auth ID';
        key TYPE : String(20) @title : 'Authorization Type';
	    key CHAR_NAME : String(70) @title : 'Charateristic Name';
        key CHAR_VALUE : String(70) @title : 'Characteristic Value';
        key CHARVAL_OPERATOR : String(20) @title : 'Characteristic Value Operator';
        CHAR_OPERATOR : String(20) @title : 'Characteristic Operator';
        ROW_ID : Integer @ title : 'ROW_ID';
        LEVEL : Integer @ title : 'Constraint Level'; 
        SEQUENCE : Integer @ title : 'Sequence At Constraint Level';
    }

    entity INFERRED_RULES  {
        key ID : String(15) @title : 'Market Auth ID';
        key TYPE : String(20) @title : 'Authorization Type';
	    key CHAR_NAME : String(70) @title : 'Charateristic Name';
        key CHAR_VALUE : String(70) @title : 'Characteristic Value';
        key CHARVAL_OPERATOR : String(20) @title : 'Characteristic Value Operator';
        CHAR_OPERATOR : String(20) @title : 'Characteristic Operator';
        ROW_ID : Integer @ title : 'ROW_ID';
        LEVEL : Integer @ title : 'Constraint Level'; 
        SEQUENCE : Integer @ title : 'Sequence At Constraint Level';
    }
}