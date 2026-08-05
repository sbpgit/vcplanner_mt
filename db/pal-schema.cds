//namespace sbp.pal;
namespace cp;

using {managed} from '@sap/cds/common';

type ModelVersion : String enum {
    Active;
    Simulation;
}
type  OPTIMIZATION_ALGORTIHM : String enum {
            NONE;
            LINEAR;
            GD;
            LD_SLSQP;
            LD_AUGLAG;
            LD_AUGLAG_EQ;
            LINEAR_GD;
}; 

type  DS_ALGORITHM : String enum {
            NONE;
};


type OPT_STATUS  : String enum {
    STARTED;
    RUNNING;
    ERROR;
    COMPLETED;
};



type PAL_TYPE_STATUS  : String enum {
    STARTED;
    RUNNING;
    ERROR;
    COMPLETED;
};

type ObjType      : String enum {
    OD;
    RT;
    PI;
};


// groupId is part of Parameters, Data, Models and other to support Parallelization
entity PalHgbtRegressionsV1 {
    key hgbtID               : String(50);
        createdAt            : Timestamp;
        Location             : String(4);
        Product              : String(40);
        regressionParameters : array of {
            groupId      : String(100);
            paramName    : String(100);
            intVal       : Integer;
            doubleVal    : Double;
            strVal       : String(100);
        };

        hgbtType             : Integer                       @assert.range: [
            1,
            30
        ];
        modelVersion         : ModelVersion default 'Active' @assert.range: [
            'Active',
            'Simulation'
        ]; // Active, Simulation

        regressionData       : array of {
            groupId      : String(100);
            ID           : Integer;
            att1         : Double;
            att2         : Double;
            att3         : Double;
            att4         : Double;
            att5         : Double;
            att6         : Double;
            att7         : Double;
            att8         : Double;
            att9         : Double;
            att10        : Double;
            att11        : Double;
            att12        : Double;
            att13         : Double;
            att14         : Double;
            att15         : Double;
            att16         : Double;
            att17         : Double;
            att18         : Double;
            att19         : Double;
            att20        : Double;
            att21        : Double;
            att22        : Double;
            att23         : Double;
            att24         : Double;
            att25         : Double;
            att26         : Double;
            att27         : Double;
            att28         : Double;
            att29         : Double;
            att30        : Double;
            target       : Double;
        };
        modelsOp             : array of {
            groupId      : String(100);
            rowIndex     : Integer;
            treeIndex    : Integer;
            modelContent : LargeString;
        };
        importanceOp         : array of {
            groupId      : String(100);
            variableName : String(256);
            importance   : Double;
        };
        statisticsOp         : array of {
            groupId      : String(100);
            statName     : String(1000);
            statValue    : String(1000);
        };
        paramSelectionOp     : array of {
            groupId      : String(100);
            paramName    : String(256);
            intVal       : Integer;
            doubleVal    : Double;
            strVal       : String(1000);
        };
}

//@readonly
// entity PalHgbtByGroup {
//     key hgbtGroupID          : String(50);
//     createdAt            : Timestamp;
//     Location             : String(4);
//     Product              : String(40);
//     groupId              : String(100);
//     Type                 : ObjType default 'OD'; //OD - Object Dependency, Restriction
//     modelVersion         : ModelVersion default 'Active' @assert.range: [
//         'Active',
//         'Simulation'
//     ]; // Active, Simulation
//     profile              : String(50);
//     regressionParameters : array of {
//         paramName    : String(100);
//         intVal       : Integer;
//         doubleVal    : Double;
//         strVal       : String(100);
//     };
//     hgbtType             : Integer                       @assert.range: [
//         1,
//         30
//     ];
//     importanceOp         : array of {
//         variableName : String(256);
//         importance   : Double;
//     };
//     statisticsOp         : array of {
//         statName     : String(1000);
//         statValue    : String(1000);
//     };
//     paramSelectionOp     : array of {
//         paramName    : String(256);
//         intVal       : Integer;
//         doubleVal    : Double;
//         strVal       : String(1000);
//     };
// }


entity PalHgbtPredictionsV1 {
    key hgbtID               : String(50);
        createdAt            : Timestamp; //@cds.on.insert : $now;
        Location             : String(4);
        Product              : String(40);
        groupId              : String(100);
        Type                 : ObjType default 'OD'; //OD - Object Dependency, Restriction
        modelVersion         : ModelVersion default 'Active' @assert.range: [
            'Active',
            'Simulation'
        ]; // Active, Simulation
        profile              : String(50);
        Version              : String(10);
        Scenario             : String(32);
        impactAnalysis       : Boolean;
        OptProfile : String(50);
        Optimization : Boolean default false @assert.range: [
            false,
            true
        ];
        OptAlgorithm         : OPTIMIZATION_ALGORTIHM default 'NONE' @assert.range: [
            'NONE',
            'LINEAR',
            'GD',
            'LD_SLSQP',
            'LD_AUGLAG',
            'LD_AUGLAG_EQ',
            'LINEAR_GD'
        ]; // NONE, LINEAR, GD
        OptFactor         : Double;
        DsAlgorithm     :   DS_ALGORITHM default 'NONE' @assert.range: [
            'NONE'
        ]; // NONE
        startDate            : Date;
        endDate              : Date;
        predictionParameters : array of {
            groupId    : String(100);
            paramName  : String(100);
            intVal     : Integer;
            doubleVal  : Double;
            strVal     : String(100);
        };
        hgbtType             : Integer                       @assert.range: [
            1,
            30
        ];
        predictionData       : array of {
            groupId    : String(100);
            //id   : Integer;
            ID         : Integer;
            att1       : Double;
            att2       : Double;
            att3       : Double;
            att4       : Double;
            att5       : Double;
            att6       : Double;
            att7       : Double;
            att8       : Double;
            att9       : Double;
            att10      : Double;
            att11      : Double;
            att12      : Double;
            att13         : Double;
            att14         : Double;
            att15         : Double;
            att16         : Double;
            att17         : Double;
            att18         : Double;
            att19         : Double;
            att20        : Double;
            att21        : Double;
            att22        : Double;
            att23         : Double;
            att24         : Double;
            att25         : Double;
            att26         : Double;
            att27         : Double;
            att28         : Double;
            att29         : Double;
            att30        : Double;
        };
        predictedResults     : array of {
            groupId    : String(100);
            id         : Integer;
            score      : String(100);
            confidence : Double;
        };
}

entity PalRdtRegressions {
    key rdtID                : String(50);
        createdAt            : Timestamp;
        Location             : String(4);
        Product              : String(40);
        regressionParameters : array of {
            groupId      : String(100);
            paramName    : String(100);
            intVal       : Integer;
            doubleVal    : Double;
            strVal       : String(100);
        };

        rdtType              : Integer                       @assert.range: [
            1,
            30
        ];
        modelVersion         : ModelVersion default 'Active' @assert.range: [
            'Active',
            'Simulation'
        ]; // Active, Simulation
        regressionData       : array of {
            groupId      : String(100);
            ID           : Integer;
            att1         : Double;
            att2         : Double;
            att3         : Double;
            att4         : Double;
            att5         : Double;
            att6         : Double;
            att7         : Double;
            att8         : Double;
            att9         : Double;
            att10        : Double;
            att11        : Double;
            att12        : Double;
            att13         : Double;
            att14         : Double;
            att15         : Double;
            att16         : Double;
            att17         : Double;
            att18         : Double;
            att19         : Double;
            att20        : Double;
            att21        : Double;
            att22        : Double;
            att23         : Double;
            att24         : Double;
            att25         : Double;
            att26         : Double;
            att27         : Double;
            att28         : Double;
            att29         : Double;
            att30        : Double;
            target       : Double;
        };
        modelsOp             : array of {
            groupId      : String(100);
            rowIndex     : Integer;
            treeIndex    : Integer;
            modelContent : LargeString;
        };
        importanceOp         : array of {
            groupId      : String(100);
            variableName : String(256);
            importance   : Double;
        };
        outOfBagOp           : array of {
            groupId      : String(100);
            treeIndex    : Integer;
            error        : Double;
        }
}

// entity PalRdtByGroup {
//     key rdtGroupID           : String(50);
//     createdAt            : Timestamp;
//     Location             : String(4);
//     Product              : String(40);
//     groupId              : String(100);
//     Type                 : ObjType default 'OD'; //OD - Object Dependency, Restriction
//     modelVersion         : ModelVersion default 'Active' @assert.range: [
//         'Active',
//         'Simulation'
//     ]; // Active, Simulation
//     profile              : String(50);
//     regressionParameters : array of {
//         paramName    : String(100);
//         intVal       : Integer;
//         doubleVal    : Double;
//         strVal       : String(100);
//     };
//     rdtType              : Integer                       @assert.range: [
//         1,
//         30
//     ];
//     importanceOp         : array of {
//         variableName : String(256);
//         importance   : Double;
//     };
//     outOfBagOp           : array of {
//         treeIndex    : Integer;
//         error        : Double;
//     }
// }

entity PalRdtPredictions {
    key rdtID                : String(50);
        createdAt            : Timestamp; //@cds.on.insert : $now;
        Location             : String(4);
        Product              : String(40);
        groupId              : String(30);
        Type                 : ObjType default 'OD'; //OD - Object Dependency, Restriction
        modelVersion         : ModelVersion default 'Active' @assert.range: [
            'Active',
            'Simulation'
        ]; // Active, Simulation
        profile              : String(50);
        Version              : String(10);
        Scenario             : String(32);
        impactAnalysis       : Boolean;
        OptProfile : String(50);
        Optimization : Boolean default false @assert.range: [
            false,
            true
        ];
        OptAlgorithm         : OPTIMIZATION_ALGORTIHM default 'NONE' @assert.range: [
            'NONE',
            'LINEAR',
            'GD',
            'LD_SLSQP',
            'LD_AUGLAG',
            'LD_AUGLAG_EQ',
            'LINEAR_GD'
        ]; // NONE, LINEAR
        OptFactor         : Double;
        DsAlgorithm     :   DS_ALGORITHM default 'NONE' @assert.range: [
            'NONE'
        ]; // NONE
        startDate            : Date;
        endDate              : Date;
        predictionParameters : array of {
            groupId    : String(100);
            paramName  : String(100);
            intVal     : Integer;
            doubleVal  : Double;
            strVal     : String(100);
        };
        rdtType              : Integer                       @assert.range: [
            1,
            30
        ];
        predictionData       : array of {
            groupId    : String(100);
            //id   : Integer;
            ID         : Integer;
            att1       : Double;
            att2       : Double;
            att3       : Double;
            att4       : Double;
            att5       : Double;
            att6       : Double;
            att7       : Double;
            att8       : Double;
            att9       : Double;
            att10      : Double;
            att11      : Double;
            att12      : Double;
            att13         : Double;
            att14         : Double;
            att15         : Double;
            att16         : Double;
            att17         : Double;
            att18         : Double;
            att19         : Double;
            att20        : Double;
            att21        : Double;
            att22        : Double;
            att23         : Double;
            att24         : Double;
            att25         : Double;
            att26         : Double;
            att27         : Double;
            att28         : Double;
            att29         : Double;
            att30        : Double;
        };
        predictedResults     : array of {
            groupId    : String(100);
            id         : Integer;
            score      : String(100);
            confidence : Double;
        };
}

entity PalAutomlRegressions {
    key automlID             : String(50);
        createdAt            : Timestamp;
        Location             : String(4);
        Product              : String(40);
        regressionParameters : array of {
            groupId      : String(100);
            paramName    : String(100);
            intVal       : Integer;
            doubleVal    : Double;
            strVal       : String(1000);
        };

        automlType           : Integer                       @assert.range: [
            1,
            30
        ];
        modelVersion         : ModelVersion default 'Active' @assert.range: [
            'Active',
            'Simulation'
        ]; // Active, Simulation

        regressionData       : array of {
            groupId      : String(100);
            ID           : Integer;
            att1         : Double;
            att2         : Double;
            att3         : Double;
            att4         : Double;
            att5         : Double;
            att6         : Double;
            att7         : Double;
            att8         : Double;
            att9         : Double;
            att10        : Double;
            att11        : Double;
            att12        : Double;
            att13         : Double;
            att14         : Double;
            att15         : Double;
            att16         : Double;
            att17         : Double;
            att18         : Double;
            att19         : Double;
            att20        : Double;
            att21        : Double;
            att22        : Double;
            att23         : Double;
            att24         : Double;
            att25         : Double;
            att26         : Double;
            att27         : Double;
            att28         : Double;
            att29         : Double;
            att30        : Double;
            target       : Double;
        };
        modelsOp             : array of {
            groupId      : String(100);
            rowIndex     : Integer;
            modelContent : LargeString;
        };
        pipelineOp           : array of {
            groupId      : String(100);
            id           : Integer;
            pipeline     : String(1000);
            scores       : String(1000);
        };
        statisticsOp         : array of {
            groupId      : String(100);
            statName     : String(1000);
            statValue    : String(1000);
        };
}

//@readonly
// entity PalAutomlByGroup {
//     key automlGroupID        : String(50);
//     createdAt            : Timestamp;
//     Location             : String(4);
//     Product              : String(40);
//     groupId              : String(100);
//     Type                 : ObjType default 'OD'; //OD - Object Dependency, Restriction
//     modelVersion         : ModelVersion default 'Active' @assert.range: [
//         'Active',
//         'Simulation'
//     ]; // Active, Simulation
//     profile              : String(50);
//     regressionParameters : array of {
//         paramName : String(100);
//         intVal    : Integer;
//         doubleVal : Double;
//         strVal    : String(100);
//     };
//     automlType           : Integer                       @assert.range: [
//         1,
//         30
//     ];
//     pipelineOp           : array of {
//         id        : Integer;
//         pipeline  : String(1000);
//         scores    : String(1000);
//     };
//     statisticsOp         : array of {
//         statName  : String(1000);
//         statValue : String(1000);
//     };
// }


entity PalAutomlPredictions {
    key automlID             : String(50);
        createdAt            : Timestamp; //@cds.on.insert : $now;
        Location             : String(4);
        Product              : String(40);
        groupId              : String(100);
        Type                 : ObjType default 'OD'; //OD - Object Dependency, Restriction
        modelVersion         : ModelVersion default 'Active' @assert.range: [
            'Active',
            'Simulation'
        ]; // Active, Simulation
        profile              : String(50);
        Version              : String(10);
        Scenario             : String(32);
        impactAnalysis       : Boolean default false;
        OptProfile : String(50);
        Optimization : Boolean default false @assert.range: [
            false,
            true
        ];
        OptAlgorithm         : OPTIMIZATION_ALGORTIHM default 'NONE' @assert.range: [
            'NONE',
            'LINEAR',
            'GD',
            'LD_SLSQP',
            'LD_AUGLAG',
            'LD_AUGLAG_EQ',
            'LINEAR_GD'
        ]; // NONE, LINEAR
        OptFactor         : Double;
        DsAlgorithm     :   DS_ALGORITHM default 'NONE' @assert.range: [
            'NONE'
        ]; // NONE
        startDate            : Date;
        endDate              : Date;
        predictionParameters : array of {
            groupId    : String(100);
            paramName  : String(100);
            intVal     : Integer;
            doubleVal  : Double;
            strVal     : String(1000);
        };
        automlType           : Integer                       @assert.range: [
            1,
            30
        ];
        predictionData       : array of {
            groupId    : String(100);
            //id   : Integer;
            ID         : Integer;
            att1       : Double;
            att2       : Double;
            att3       : Double;
            att4       : Double;
            att5       : Double;
            att6       : Double;
            att7       : Double;
            att8       : Double;
            att9       : Double;
            att10      : Double;
            att11      : Double;
            att12      : Double;
            att13         : Double;
            att14         : Double;
            att15         : Double;
            att16         : Double;
            att17         : Double;
            att18         : Double;
            att19         : Double;
            att20        : Double;
            att21        : Double;
            att22        : Double;
            att23         : Double;
            att24         : Double;
            att25         : Double;
            att26         : Double;
            att27         : Double;
            att28         : Double;
            att29         : Double;
            att30        : Double;
        };
        predictedResults     : array of {
            groupId    : String(100);
            id         : Integer;
            score      : String(100);
            confidence : Double;
        };
}


entity PalMlrRegressions {
        //key mlrID : UUID;
    key mlrID                : String(50);
        createdAt            : Timestamp;
        Location             : String(4);
        Product              : String(40);
        regressionParameters : array of {
            groupId          : String(100);
            paramName        : String(256);
            intVal           : Integer;
            doubleVal        : Double;
            strVal           : String(1000);
        };
        mlrType              : Integer                       @assert.range: [
            1,
            30
        ];
        modelVersion         : ModelVersion default 'Active' @assert.range: [
            'Active',
            'Simulation'
        ]; // Active, Simulation
        regressionData       : array of {
            groupId          : String(100);
            ID               : Integer;
            target           : Double;
            att1             : Double;
            att2             : Double;
            att3             : Double;
            att4             : Double;
            att5             : Double;
            att6             : Double;
            att7             : Double;
            att8             : Double;
            att9             : Double;
            att10            : Double;
            att11            : Double;
            att12            : Double;
            att13             : Double;
            att14             : Double;
            att15             : Double;
            att16             : Double;
            att17             : Double;
            att18             : Double;
            att19             : Double;
            att20            : Double;
            att21             : Double;
            att22             : Double;
            att23             : Double;
            att24             : Double;
            att25             : Double;
            att26             : Double;
            att27             : Double;
            att28             : Double;
            att29             : Double;
            att30            : Double;
        };
        coefficientOp        : array of {
            groupId          : String(100);
            variableName     : String(1000);
            coefficientValue : Double;
            tValue           : Double;
            pValue           : Double;
        };
        pmmlOp               : array of {
            groupId          : String(100);
            rowIndex         : Integer;
            modelContent     : LargeString;
        };
        fittedOp             : array of {
            groupId          : String(100);
            ID               : Integer;
            value            : Double;
        };
        statisticsOp         : array of {
            groupId          : String(100);
            statName         : String(256);
            statValue        : String(1000);
        };
        optimalParamOp       : array of {
            groupId          : String(100);
            paramName        : String(256);
            intVal           : Integer;
            doubleVal        : Double;
            strVal           : String(1000);
        };
}

//@readonly
// entity PalMlrByGroup {
//     key mlrGroupID           : String(50);
//     createdAt            : Timestamp;
//     Location             : String(4);
//     Product              : String(40);
//     groupId              : String(100);
//     Type                 : ObjType default 'OD'; //OD - Object Dependency, Restriction
//     modelVersion         : ModelVersion default 'Active' @assert.range: [
//         'Active',
//         'Simulation'
//     ]; // Active, Simulation
//     profile              : String(50);
//     regressionParameters : array of {
//         paramName        : String(256);
//         intVal           : Integer;
//         doubleVal        : Double;
//         strVal           : String(1000);
//     };
//     mlrType              : Integer                       @assert.range: [
//         1,
//         30
//     ];
//     coefficientOp        : array of {
//         variableName     : String(1000);
//         coefficientValue : Double;
//         tValue           : Double;
//         pValue           : Double;
//     };
//     fittedOp             : array of {
//         ID               : Integer;
//         value            : Double;
//     };
//     statisticsOp         : array of {
//         statName         : String(256);
//         statValue        : String(1000);
//     };
//     optimalParamOp       : array of {
//         paramName        : String(256);
//         intVal           : Integer;
//         doubleVal        : Double;
//         strVal           : String(1000);
//     };
// }

entity PalMlrPredictions {
        //key mlrpID : UUID;
    key mlrpID               : String(50);
        createdAt            : Timestamp; //@cds.on.insert : $now;
        Location             : String(4);
        Product              : String(40);
        groupId              : String(30);
        Type                 : ObjType default 'OD'; //OD - Object Dependency, Restriction
        modelVersion         : ModelVersion default 'Active' @assert.range: [
            'Active',
            'Simulation'
        ]; // Active, Simulation
        Version              : String(10);
        profile              : String(50);
        Scenario             : String(32);
        impactAnalysis       : Boolean;
        OptProfile : String(50);
        Optimization : Boolean default false @assert.range: [
            false,
            true
        ];
        OptAlgorithm         : OPTIMIZATION_ALGORTIHM default 'NONE' @assert.range: [
            'NONE',
            'LINEAR',
            'GD',
            'LD_SLSQP',
            'LD_AUGLAG',
            'LD_AUGLAG_EQ',
            'LINEAR_GD'
        ]; // NONE, LINEAR
        OptFactor         : Double;
        DsAlgorithm     :   DS_ALGORITHM default 'NONE' @assert.range: [
            'NONE'
        ]; // NONE
        startDate            : Date;
        endDate              : Date;
        predictionParameters : array of {
            groupId   : String(100);
            paramName : String(256);
            intVal    : Integer;
            doubleVal : Double;
            strVal    : String(1000);
        };

        mlrpType             : Integer                       @assert.range: [
            1,
            30
        ];
        predictionData       : array of {
            groupId   : String(100);
            ID        : Integer;
            att1      : Double;
            att2      : Double;
            att3      : Double;
            att4      : Double;
            att5      : Double;
            att6      : Double;
            att7      : Double;
            att8      : Double;
            att9      : Double;
            att10     : Double;
            att11     : Double;
            att12     : Double;
            att13         : Double;
            att14         : Double;
            att15         : Double;
            att16         : Double;
            att17         : Double;
            att18         : Double;
            att19         : Double;
            att20        : Double;
            att21        : Double;
            att22        : Double;
            att23         : Double;
            att24         : Double;
            att25         : Double;
            att26         : Double;
            att27         : Double;
            att28         : Double;
            att29         : Double;
            att30        : Double;
        };
        fittedResults        : array of {
            groupId   : String(100);
            ID        : Integer;
            value     : Double;
        }
}

entity PalVarmaModels {
    key varmaID           : String(50);
        createdAt         : Timestamp;
        Location          : String(4);
        Product           : String(40);
        controlParameters : array of {
            groupId      : String(100);
            paramName    : String(100);
            intVal       : Integer;
            doubleVal    : Double;
            strVal       : String(100);
        };
        varmaType         : Integer                       @assert.range: [
            1,
            30
        ];
        modelVersion      : ModelVersion default 'Active' @assert.range: [
            'Active',
            'Simulation'
        ]; // Active, Simulation
        varmaData         : array of {
            groupId      : String(100);
            //timestamp : Integer;
            ID           : Integer;
            att1         : Double;
            att2         : Double;
            att3         : Double;
            att4         : Double;
            att5         : Double;
            att6         : Double;
            att7         : Double;
            att8         : Double;
            att9         : Double;
            att10        : Double;
            att11        : Double;
            att12        : Double;
            att13         : Double;
            att14         : Double;
            att15         : Double;
            att16         : Double;
            att17         : Double;
            att18         : Double;
            att19         : Double;
            att20        : Double;
            att21        : Double;
            att22        : Double;
            att23         : Double;
            att24         : Double;
            att25         : Double;
            att26         : Double;
            att27         : Double;
            att28         : Double;
            att29         : Double;
            att30        : Double;
            target       : Double;
        };
        modelsOp          : array of {
            groupId      : String(100);
            contentIndex : Integer;
            contentValue : LargeString;
        };
        fittedOp          : array of {
            groupId      : String(100);
            nameCol      : LargeString;
            idx          : Integer;
            fitting      : Double;
            residual     : Double;
        };
        irfOp             : array of {
            groupId      : String(100);
            col1         : LargeString;
            col2         : LargeString;
            idx          : Integer;
            response     : Double;
        };
}

//@readonly
// entity PalVarmaByGroup {
//     key varmaGroupID      : String(50);
//     createdAt         : Timestamp;
//     Location          : String(4);
//     Product           : String(40);
//     groupId           : String(100);
//     Type              : ObjType default 'OD'; //OD - Object Dependency, Restriction
//     modelVersion      : ModelVersion default 'Active' @assert.range: [
//         'Active',
//         'Simulation'
//     ]; // Active, Simulation
//     profile           : String(50);
//     controlParameters : array of {
//         paramName : String(100);
//         intVal    : Integer;
//         doubleVal : Double;
//         strVal    : String(100);
//     };
//     varmaType         : Integer                       @assert.range: [
//         1,
//         30
//     ];
//     varmaData         : array of {
//         //timestamp : Integer;
//         ID        : Integer;
//         att1      : Double;
//         att2      : Double;
//         att3      : Double;
//         att4      : Double;
//         att5      : Double;
//         att6      : Double;
//         att7      : Double;
//         att8      : Double;
//         att9      : Double;
//         att10     : Double;
//         att11     : Double;
//         att12     : Double;
//         target    : Double;
//     };
//     fittedOp          : array of {
//         nameCol   : LargeString;
//         idx       : Integer;
//         fitting   : Double;
//         residual  : Double;
//     };
//     irfOp             : array of {
//         col1      : LargeString;
//         col2      : LargeString;
//         idx       : Integer;
//         response  : Double;
//     };
// }

entity PalVarmaPredictions {
    key varmaID              : String(50);
        createdAt            : Timestamp;
        Location             : String(4);
        Product              : String(40);
        groupId              : String(30);
        Type                 : ObjType default 'OD'; //OD - Object Dependency, Restriction
        modelVersion         : ModelVersion default 'Active' @assert.range: [
            'Active',
            'Simulation'
        ]; // Active, Simulation
        profile              : String(50);
        Version              : String(10);
        Scenario             : String(32);
        impactAnalysis       : Boolean default false;
        OptProfile : String(50);
        Optimization : Boolean default false @assert.range: [
            false,
            true
        ];
        OptAlgorithm         : OPTIMIZATION_ALGORTIHM default 'NONE' @assert.range: [
            'NONE',
            'LINEAR',
            'GD',
            'LD_SLSQP',
            'LD_AUGLAG',
            'LD_AUGLAG_EQ',
            'LINEAR_GD'
        ]; // NONE, LINEAR, GD
        OptFactor         : Double;
        DsAlgorithm     :   DS_ALGORITHM default 'NONE' @assert.range: [
            'NONE'
        ]; // NONE
        startDate            : Date;
        endDate              : Date;
        predictionParameters : array of {
            groupId    : String(100);
            paramName  : String(100);
            intVal     : Integer;
            doubleVal  : Double;
            strVal     : String(100);
        };
        varmaType            : Integer                       @assert.range: [
            1,
            30
        ];
        predictionData       : array of {
            groupId    : String(100);
            //timestampIdx : Integer;
            ID         : Integer;
            att1       : Double;
            att2       : Double;
            att3       : Double;
            att4       : Double;
            att5       : Double;
            att6       : Double;
            att7       : Double;
            att8       : Double;
            att9       : Double;
            att10      : Double;
            att11      : Double;
            att12      : Double;
            att13         : Double;
            att14         : Double;
            att15         : Double;
            att16         : Double;
            att17         : Double;
            att18         : Double;
            att19         : Double;
            att20        : Double;
            att21        : Double;
            att22        : Double;
            att23         : Double;
            att24         : Double;
            att25         : Double;
            att26         : Double;
            att27         : Double;
            att28         : Double;
            att29         : Double;
            att30        : Double;
        };
        predictedResults     : array of {
            groupId    : String(100);
            columnName : String(50);
            idx        : Integer;
            forecast   : Double;
            se         : Double;
            lo95       : Double;
            hi95       : Double;
        };
}


entity PalGenRegressionModels {
    key regressionsID : String(50);
        //modelsID : String(50);
        createdAt     : Timestamp;
        //modelType : Integer;//  @assert.range: [ 1, 2 ]; // 1 - MLR, 2 - HGBT
        modelType     : String(10);
        vcRulesList   : array of {
            profile      : String(50);
            override     : Boolean;
            Location     : String(4);
            Product      : String(40);
            GroupID      : String(30);
            Type         : ObjType default 'OD'; //OD - Object Dependency, Restriction
            modelVersion : ModelVersion default 'Active' @assert.range: [
                'Active',
                'Simulation'
            ]; // Active, Simulation
            //modelType : Integer;//  @assert.range: [ 1, 2 ]; // 1 - MLR, 2 - HGBT
            dimensions   : Integer;
        };
}


entity PalGenClusters {
    key clustersID        : String(50);
        createdAt         : Timestamp;
        Location          : String(4);
        Product           : String(40);
        clusterParameters : array of {
            groupId   : String(100);
            paramName : String(100);
            intVal    : Integer;
            doubleVal : Double;
            strVal    : String(100);
        };

        clusterType       : Integer @assert.range: [
            1,
            20
        ];

        // clusterData       : array of {
        //     groupId   : String(100);
        //     ID        : String(100);
        //     att1      : String(70);
        //     att2      : String(70);
        //     att3      : String(70);
        //     att4      : String(70);
        //     att5      : String(70);
        //     att6      : String(70);
        //     att7      : String(70);
        //     att8      : String(70);
        //     att9      : String(70);
        //     att10     : String(70);
        //     att11     : String(70);
        //     att12     : String(70);
        //     att13     : String(70);
        //     att14     : String(70);
        //     att15     : String(70);
        //     att16     : String(70);
        //     att17     : String(70);
        //     att18     : String(70);
        //     att19     : String(70);
        //     att20     : String(70);
        // };
        clusterData       : array of {
            groupId   : String(100);
            // ID        : String(100);
            LEFT_POINT      : String(10);
            RIGHT_POINT    : String(10);
            DISTANCE      : Double;
        };

}

entity PalGenPcaComps {
    key Location          : String(4);
    key Product           : String(40);
        pcaCatParameters : array of {
            groupId   : String(100);
            paramName : String(100);
            intVal    : Integer;
            doubleVal : Double;
            strVal    : String(100);
        };

        pcaCatData       : array of {
            groupId   : String(100);
            ID        : String(100);
            att1      : String(70);
            att2      : String(70);
            att3      : String(70);
            att4      : String(70);
            att5      : String(70);
            att6      : String(70);
            att7      : String(70);
            att8      : String(70);
            att9      : String(70);
            att10     : String(70);
            att11     : String(70);
            att12     : String(70);
            att13     : String(70);
            att14     : String(70);
            att15     : String(70);
            att16     : String(70);
            att17     : String(70);
            att18     : String(70);
            att19     : String(70);
            att20     : String(70);
            att21      : String(70);
            att22      : String(70);
            att23      : String(70);
            att24      : String(70);
            att25      : String(70);
            att26      : String(70);
            att27      : String(70);
            att28      : String(70);
            att29      : String(70);
            att30     : String(70);
        };

}


// entity OptimizePredictions {
//         Location             : String(4);
//         Product              : String(40);
//         Type                : ObjType default 'OD';
//         Version              : String(10);
//         Scenario             : String(32);
//         StartDate            : Date;
//         EndDate              : Date;
        
//         Algorithm : ModelVersion default 'LINEAR' @assert.range: [
//                 'LINEAR',
//                 'GD',
//                 'NL'
//             ]; // LINEAR , GD: GRADIENT-DESCENT, NL - NON LINEAR 


// }


entity OD_MODEL_VERSIONS {
    key LOCATION_ID   : String(4)    @title: 'Location ID';
    key PRODUCT_ID    : String(40)   @title: 'Product ID';
    key OBJ_DEP       : String(30)   @title: 'Object Dependency';
    key OBJ_COUNTER   : Integer      @title: 'Object Counter';
    key OBJ_TYPE      : String(2)    @title: 'Object Type';
        MODEL_TYPE    : String(10)   @title: 'PAL Model Type';
    key MODEL_VERSION : ModelVersion @title: 'Model Version - Active/Simulation';
        MODEL_PROFILE : String(50)   @title: 'PAL Model Profile';
        DIMENSIONS    : Integer      @title: 'Number of Independent Variables';
        TIMESTAMP     : Timestamp    @title: 'Model Generated Date and Time'
}

entity PalGenPredictions {
    key predictionsID : String(50);
        createdAt     : Timestamp;
        modelType     : String(10);
        vcRulesList   : array of {
            profile      : String(50);
            override     : Boolean;
            version      : String(10) default 'BASELINE'; // IBP Version
            scenario     : String(32) default 'BSL_SCENARIO'; // IBP Scenario
            Location     : String(4);
            Product      : String(40);
            GroupID      : String(30);
            Type         : ObjType default 'OD'; //OD - Object Dependency, Restriction
            modelVersion : ModelVersion default 'Active' @assert.range: [
                'Active',
                'Simulation'
            ]; // Active, Simulation
            dimensions   : Integer;
        };
}


entity PAL_PARAMETERS {
    key METHOD      : String(20)   @title: 'Method Name';
    key PARA_NAME   : String(30)   @title: 'Parameter Name';
        DATATYPE    : String(30)   @title: 'Data Type';
        DEFAULTVAL  : String(100)  @title: 'Default Value';
        INTVAL      : Integer      @title: 'Integer';
        DOUBLEVAL   : Double       @title: 'Double';
        STRVAL      : String(50)   @title: 'String';
        DESCRIPTION : String(1000) @title: ' Description';
        DEPENDENCY  : String(1000) @title: ' Dependency';
}

entity TS_PREDICTIONS {
    key CAL_DATE         : Date       @title: 'Date';
    key LOCATION_ID      : String(4)  @title: 'Location ID';
    key PRODUCT_ID       : String(40) @title: 'Product ID';
    key OBJ_TYPE         : String(2)  @title: 'Object Type';
    key OBJ_DEP          : String(30) @title: 'Object Dependency';
    key OBJ_COUNTER      : Integer    @title: 'Object Counter';
        MODEL_TYPE       : String(10) @title: 'PAL Model Type';
    key MODEL_VERSION    : String(20) @title: 'OBJ Model Version';
        MODEL_PROFILE    : String(50) @title: 'PAL Model Profile';
    key VERSION          : String(10) @title: 'Version';
    key SCENARIO         : String(32) @title: 'Scenario';
    PREDICTED           : Double      @title: 'Optimized';
    PREDICTED_TIME      : Timestamp   @title: 'Optimized Time';
    OPT_STARTTIME       : Timestamp   @title: 'Optimization Start Time';
    DELTA_TIME          : Timestamp   @title: 'Delta Changes Time';
    PREDICTED_STATUS    : String(8)  @title: 'Predicted Status';
    PRE_OPTIMIZED        : Double     @title: 'Predicted';
    PRE_OPTIMIZED_TIME   : Timestamp  @title: 'Pre Optimized Time';
    OPT_ALGORITHM  : OPTIMIZATION_ALGORTIHM default 'NONE' @assert.range: [
            'NONE',
            'LINEAR',
            'GD',
            'LD_SLSQP',
            'LD_AUGLAG',
            'LD_AUGLAG_EQ',
            'LINEAR_GD'
        ]; // NONE, LINEAR, GD


};

entity TS_PREDICTIONS_TEMP {
    key CAL_DATE         : Date       @title: 'Date';
    key LOCATION_ID      : String(4)  @title: 'Location ID';
    key PRODUCT_ID       : String(40) @title: 'Product ID';
    key OBJ_TYPE         : String(2)  @title: 'Object Type';
    key OBJ_DEP          : String(30) @title: 'Object Dependency';
    key OBJ_COUNTER      : Integer    @title: 'Object Counter';
        MODEL_TYPE       : String(10) @title: 'PAL Model Type';
    key MODEL_VERSION    : String(20) @title: 'OBJ Model Version';
        MODEL_PROFILE    : String(50) @title: 'PAL Model Profile';
    key VERSION          : String(10) @title: 'Version';
    key SCENARIO         : String(32) @title: 'Scenario';
    PREDICTED           : Double     @title: 'Predicted';
    PREDICTED_TIME      : Timestamp  @title: 'Predicted Time';
    OPT_STARTTIME       : Timestamp  @title: 'Optimization Start Time';
    DELTA_TIME          : Timestamp  @title: 'Delta Changes Time';
    PREDICTED_STATUS    : String(8)  @title: 'Predicted Status';
    PRE_OPTIMIZED        : Double     @title: 'Predicted';
    PRE_OPTIMIZED_TIME   : Timestamp  @title: 'Pre Optimized Time';
    OPT_ALGORITHM  : OPTIMIZATION_ALGORTIHM default 'NONE' @assert.range: [
            'NONE',
            'LINEAR',
            'GD',
            'LD_SLSQP',
            'LD_AUGLAG',
            'LD_AUGLAG_EQ',
            'LINEAR_GD'
        ]; // NONE, LINEAR, GD
};

entity TS_PREDICTIONS_CUST {
    key CAL_DATE         : Date       @title: 'Date';
    key LOCATION_ID      : String(4)  @title: 'Location ID';
    key PRODUCT_ID       : String(40) @title: 'Product ID';
    key CUSTOMER_GROUP   : String(40) @title: 'CUSTOMER GROUP';
    key OBJ_TYPE         : String(2)  @title: 'Object Type';
    key OBJ_DEP          : String(30) @title: 'Object Dependency';
    key OBJ_COUNTER      : Integer    @title: 'Object Counter';
        MODEL_TYPE       : String(10) @title: 'PAL Model Type';
    key MODEL_VERSION    : String(20) @title: 'OBJ Model Version';
        MODEL_PROFILE    : String(50) @title: 'PAL Model Profile';
    key VERSION          : String(10) @title: 'Version';
    key SCENARIO         : String(32) @title: 'Scenario';
    PREDICTED        : Double     @title: 'Predicted';
    PREDICTED_TIME   : Timestamp  @title: 'Predicted Time';
    PREDICTED_STATUS : String(8)  @title: 'Predicted Status';
    PRE_OPTIMIZED        : Double     @title: 'Predicted';
    PRE_OPTIMIZED_TIME   : Timestamp  @title: 'Pre Optimized Time';
    OPT_ALGORITHM  : OPTIMIZATION_ALGORTIHM default 'NONE' @assert.range: [
            'NONE',
            'LINEAR',
            'GD',
            'LD_SLSQP',
            'LD_AUGLAG',
            'LD_AUGLAG_EQ',
            'LINEAR_GD'
        ]; // NONE, LINEAR, GD
};

  // PAL FORECAST characteristic plan
    entity PAL_FCHARPLAN {
        key LOCATION_ID  : String(4)      @title: 'Location ID';
        key PRODUCT_ID   : String(40)     @title: 'Product ID';
        key CUSTOMER_GROUP   : String(40) @title: 'Customer Group';
        key MODEL_VERSION    : String(20) @title: 'Model Version';
        key CLASS_NUM    : String(20)     @title: 'Class Name';
        key CHAR_NUM     : String(100)    @title: 'Charateristic Name';
        key CHARVAL_NUM  : String(80)     @title: 'Charateristic Value';
        key VERSION      : String(10)     @title: 'Version';
        key SCENARIO     : String(32)     @title: 'Scenario';
        key WEEK_DATE    : Date           @title: 'Weekly Date';
            OPT_PERCENT  : Double         @title: 'Option Percnetage';
            OPT_QTY      : Double         @title: 'Option Quantity';
        key TYPE         : Integer        @title: 'Key Figyre Type';
            UNROUNDED    : Double         @tiele: 'Unrounded Option Quantity';
	        ROUNDED      : Double         @title: 'Rounded Option Quantity';
            DELTA        : Double         @title: 'Unrounded - Rounded';
    }
// entity IBP_RESULTPLAN_TS {
//     key CAL_DATE         : Date           @title: 'Date';
//     key LOCATION_ID      : String(4)      @title: 'Location ID';
//     key PRODUCT_ID       : String(40)     @title: 'Product ID';
//     key OBJ_TYPE         : String(2)      @title: 'Object Type';
//     key OBJ_DEP          : String(30)     @title: 'Object Dependency';
//     key OBJ_COUNTER      : Integer        @title: 'Object Counter';
//         MODEL_VERSION    : String(20)     @title: 'OBJ Model Version';
//         MODEL_PROFILE    : String(50)     @title: 'PAL Model Profile';
//     key VERSION          : String(10)     @title: 'Version';
//     key SCENARIO         : String(32)     @title: 'Scenario';
//         PREDICTED        : Decimal(13, 2) @title: 'Predicted';
//         PREDICTED_TIME   : Timestamp      @title: 'Predicted Time';
//         PREDICTED_STATUS : String(8)      @title: 'Predicted Status';
// };

entity TS_OBJDEP_CHAR_IMPACT_F {
    key CAL_DATE            : Date           @title: 'Date';
    key LOCATION_ID         : String(4)      @title: 'Location ID';
    key PRODUCT_ID          : String(40)     @title: 'Product ID';
    key OBJ_TYPE            : String(2)      @title: 'Object Type';
    key OBJ_DEP             : String(30)     @title: 'Object Dependency';
    key OBJ_COUNTER         : Integer        @title: 'Object Counter';
    key ROW_ID              : Integer        @title: ' Attribute Index';
        MODEL_TYPE          : String(10)     @title: 'PAL Model Type';
    key MODEL_VERSION       : String(20)     @title: 'OBJ Model Version';
        MODEL_PROFILE       : String(50)     @title: 'PAL Model Profile';
    key VERSION             : String(10)     @title: 'Version';
    key SCENARIO            : String(32)     @title: 'Scenario';
        CHAR_COUNT          : Decimal(13, 2) @title: 'Character Count';
        CHAR_IMPACT_VAL     : Decimal(13, 2) @title: 'Character Impact Value';
        CHAR_IMPACT_PERCENT : Decimal(13, 2) @title: 'Character Impact Percent';
        PREDICTED_VAL       : Decimal(13, 2) @title: 'Predicted Value';
        PREDICTED_TIME      : Timestamp      @title: 'Predicted Time';

};

entity TS_OBJDEP_CHAR_IMPACT_F_TEMP{
    key CAL_DATE            : Date           @title: 'Date';
    key LOCATION_ID         : String(4)      @title: 'Location ID';
    key PRODUCT_ID          : String(40)     @title: 'Product ID';
    key OBJ_TYPE            : String(2)      @title: 'Object Type';
    key OBJ_DEP             : String(30)     @title: 'Object Dependency';
    key OBJ_COUNTER         : Integer        @title: 'Object Counter';
    key ROW_ID              : Integer        @title: ' Attribute Index';
        MODEL_TYPE          : String(10)     @title: 'PAL Model Type';
    key MODEL_VERSION       : String(20)     @title: 'OBJ Model Version';
        MODEL_PROFILE       : String(50)     @title: 'PAL Model Profile';
    key VERSION             : String(10)     @title: 'Version';
    key SCENARIO            : String(32)     @title: 'Scenario';
        CHAR_COUNT          : Decimal(13, 2) @title: 'Character Count';
        CHAR_IMPACT_VAL     : Decimal(13, 2) @title: 'Character Impact Value';
        CHAR_IMPACT_PERCENT : Decimal(13, 2) @title: 'Character Impact Percent';
        PREDICTED_VAL       : Decimal(13, 2) @title: 'Predicted Value';
        PREDICTED_TIME      : Timestamp      @title: 'Predicted Time';

};

entity CLUSTER_DATA {
    key LOCATION_ID : String(4)  @title: 'Location ID';
    key PRODUCT_ID  : String(40) @title: 'Product ID';
    key UNIQUE_ID   : String(50) @title: 'Unique ID';
        C1          : String(80) @title: 'CHAR1';
        C2          : String(80) @title: 'CHAR2';
        C3          : String(80) @title: 'CHAR3';
        C4          : String(80) @title: 'CHAR4';
        C5          : String(80) @title: 'CHAR5';
        C6          : String(80) @title: 'CHAR6';
        C7          : String(80) @title: 'CHAR7';
        C8          : String(80) @title: 'CHAR8';
        C9          : String(80) @title: 'CHAR9';
        C10         : String(80) @title: 'CHAR10';
        C11         : String(80) @title: 'CHAR11';
        C12         : String(80) @title: 'CHAR12';
        C13         : String(80) @title: 'CHAR13';
        C14         : String(80) @title: 'CHAR14';
        C15         : String(80) @title: 'CHAR15';
        C16         : String(80) @title: 'CHAR16';
        C17         : String(80) @title: 'CHAR17';
        C18         : String(80) @title: 'CHAR18';
        C19         : String(80) @title: 'CHAR19';
        C20         : String(80) @title: 'CHAR20';
        C21         : String(80) @title: 'CHAR21';
        C22         : String(80) @title: 'CHAR22';
        C23         : String(80) @title: 'CHAR23';
        C24         : String(80) @title: 'CHAR24';
        C25         : String(80) @title: 'CHAR25';
        C26         : String(80) @title: 'CHAR26';
        C27         : String(80) @title: 'CHAR27';
        C28         : String(80) @title: 'CHAR28';
        C29         : String(80) @title: 'CHAR29';
        C30         : String(80) @title: 'CHAR30';
};

entity CLUSTER_DATA_CATEGORICAL {
    key LOCATION_ID : String(4)  @title: 'Location ID';
    key PRODUCT_ID  : String(40) @title: 'Product ID';
    key UNIQUE_ID   : String(50) @title: 'Unique ID';
        C1          : String(10) @title: 'CHAR1';
        C2          : String(10) @title: 'CHAR2';
        C3          : String(10) @title: 'CHAR3';
        C4          : String(10) @title: 'CHAR4';
        C5          : String(10) @title: 'CHAR5';
        C6          : String(10) @title: 'CHAR6';
        C7          : String(10) @title: 'CHAR7';
        C8          : String(10) @title: 'CHAR8';
        C9          : String(10) @title: 'CHAR9';
        C10         : String(10) @title: 'CHAR10';
        C11         : String(10) @title: 'CHAR11';
        C12         : String(10) @title: 'CHAR12';
        C13         : String(10) @title: 'CHAR13';
        C14         : String(10) @title: 'CHAR14';
        C15         : String(10) @title: 'CHAR15';
        C16         : String(10) @title: 'CHAR16';
        C17         : String(10) @title: 'CHAR17';
        C18         : String(10) @title: 'CHAR18';
        C19         : String(10) @title: 'CHAR19';
        C20         : String(10) @title: 'CHAR20';
        C21         : String(10) @title: 'CHAR21';
        C22         : String(10) @title: 'CHAR22';
        C23         : String(10) @title: 'CHAR23';
        C24         : String(10) @title: 'CHAR24';
        C25         : String(10) @title: 'CHAR25';
        C26         : String(10) @title: 'CHAR26';
        C27         : String(10) @title: 'CHAR27';
        C28         : String(10) @title: 'CHAR28';
        C29         : String(10) @title: 'CHAR29';
        C30         : String(10) @title: 'CHAR30';
        WEIGHT      : Integer    @title: 'Unique ID Color Weight';
};

entity CLUSTERS_UID_SEQUENCE {
    key LOCATION_ID     : String(4)  @title: 'Location ID';
    key PRODUCT_ID      : String(40) @title: 'Product ID';
    key CLUSTER_ID      : Integer     @title: ' Cluster ID';
    key SORT_SEQ        : Integer     @title: 'Sorting Sequence of Cluster Ids';
    key UNIQUE_ID       : String(50) @title: 'Unique ID';
    Distance            : Double    @title: 'Distance';
};

entity VARCHARS_MAPPED
{
    key LOCATION_ID : String(4)  @title: 'Location ID';
    key PRODUCT_ID  : String(40) @title: 'Product ID';
    key CHAR_NUM    : String(100)    @title: 'Charateristic Number';
    CHAR_NAME       : String(30) @title: 'Characteristic Name';
    INPUT_SEQUENCE  : Integer   @title: 'Input Sequence';
    MAPPED_SEQUENCE  : Integer   @title: 'Mapped Sequence';
}


entity PRECALCULATED_DISTANCE_DATA {
    key LOCATION_ID : String(4)  @title: 'Location ID';
    key PRODUCT_ID  : String(40) @title: 'Product ID';
    key LEFT_POINT  : String(10) @title: 'Left Unique ID';
    key RIGHT_POINT : String(10) @title: 'Right Unique ID';
    DISTANCE        : Double     @titile: 'Distance b/w Left & Right IDs';
};

entity AHC_COMBINE_PROCESS {
    key LOCATION_ID   : String(4)  @title: 'Location ID';
    key PRODUCT_ID    : String(40) @title: 'Product ID';
    key MODEL_PROFILE : String(50) @title: 'Profile';
        // key UNIQUE_ID : String(50)@title : 'Unique ID';
    key STAGE         : Integer    @title: 'Stage';
    key LEFT_ID       : String(50) @title: 'Left Unique ID';
    key RIGHT_ID      : String(50) @title: 'Right Unique ID';
    key DISTANCE      : Double     @title: 'Distance between Left and RIght Unique IDs'
};

entity AHC_RESULTS {
    key LOCATION_ID   : String(4)  @title: 'Location ID';
    key PRODUCT_ID    : String(40) @title: 'Product ID';
    key MODEL_PROFILE : String(50) @title: 'PAL Model Profile';
    key UNIQUE_ID     : String(50) @title: 'Unique ID';
    key CLUSTER_ID    : Integer    @title: 'Cluster ID';
};


entity AHC_CLUSTER_GROUPAVG_DISTANCES {
    key LOCATION_ID         : String(4)  @title: 'Location ID';
    key PRODUCT_ID          : String(40) @title: 'Product ID';
    key MODEL_PROFILE       : String(50) @title: 'Profile';
    key SOURCE_CLUSTER_ID   : Integer    @title: 'Source Cluster';
    key TARGET_CLUSTER_ID   : Integer    @title: 'Target Cluster';
    key SOURCE_PID          : String(50) @title: 'Source PID';
    key TARGET_PID          : String(50) @title: 'Target PID';
    DISTANCE                : Double     @title: 'Distance between Source and Target PIDS b/w clusters'
};

entity AHC_CLUSTER_DISTANCES {
    key LOCATION_ID         : String(4)  @title: 'Location ID';
    key PRODUCT_ID          : String(40) @title: 'Product ID';
    key MODEL_PROFILE       : String(50) @title: 'Profile';
    key SOURCE_CLUSTER_ID   : Integer    @title: 'Source Cluster';
    key TARGET_CLUSTER_ID   : Integer    @title: 'Target Cluster';
    DISTANCE                : Double     @title: 'Distance between Source and Target Cluster IDs'
};

entity PCA_CAT_LOADINGS_GRP_TAB {
    key LOCATION_ID   : String(4)  @title: 'Location ID';
    key PRODUCT_ID    : String(40) @title: 'Product ID';
    key MODEL_PROFILE : String(50) @title: 'PAL Model Profile';
    key VARIABLE_NAME     : String(100) @title: 'Variable Name'; 
	key COMPONENT_ID      : Integer     @title: 'Component Id';
	COMPONENT_LOADING : Double      @title: 'Component Loading';
}

entity PCA_CAT_LOADINGS_INFORMATION_GRP_TAB {
    key LOCATION_ID   : String(4)   @title: 'Location ID';
    key PRODUCT_ID    : String(40)  @title: 'Product ID';
    key MODEL_PROFILE : String(50)  @title: 'PAL Model Profile';
	key COMPONENT_ID      : Integer     @title: 'Component Id';
	key METRIC_NAME       : String(128) @title: 'Metric Name';
    METRIC_VALUE      : Double      @title: 'Metric Value';
}

entity PCA_CAT_SCORES_GRP_TAB {
    key LOCATION_ID   : String(4)   @title: 'Location ID';
    key PRODUCT_ID    : String(40)  @title: 'Product ID';
    key MODEL_PROFILE : String(50)  @title: 'PAL Model Profile';
    key ID                : Integer     @title: 'Unique ID';
	key COMPONENT_ID      : Integer     @title: 'Component Id';
	COMPONENT_SCORE   : Double      @title: 'Component Score';
}

entity PCA_CAT_SCALING_INFORMATION_GRP_TAB {
    key LOCATION_ID     : String(4)     @title: 'Location ID';
    key PRODUCT_ID      : String(40)    @title: 'Product ID';
    key MODEL_PROFILE   : String(50)    @title: 'PAL Model Profile';
    key VARIABLE_NAME       : String(100)   @title: 'Variable Name';
	MEAN                : Double        @title: 'Mean';
	SCALE               : Double        @title: 'Scale';
}

entity PCA_CAT_QUANTIFICATION_GRP_TAB {
    key LOCATION_ID     : String(4)     @title: 'Location ID';
    key PRODUCT_ID      : String(40)    @title: 'Product ID';
    key MODEL_PROFILE   : String(50)    @title: 'PAL Model Profile';
    key VARIABLE_NAME       : String(100)   @title: 'Variable Name';
	key CATEGORY_VALUE      : String(1000)  @title: 'Mean';
	COMPONENT_ID        : Integer       @title: 'Component ID';
    QUANTIFICATION      : Double        @title: 'Quantification';
}

entity PCA_CAT_STAT_GRP_TAB {
    key LOCATION_ID     : String(4)     @title: 'Location ID';
    key PRODUCT_ID      : String(40)    @title: 'Product ID';
    key MODEL_PROFILE   : String(50)    @title: 'PAL Model Profile';
    key STAT_NAME           : String(100)   @title: 'Stat Name';
	STAT_VALUE          : String(100)   @title: 'Stat Value';
}
entity PalAesForecast {
        //key mlrID : UUID;
    key aesID                : String(50);
        createdAt            : Timestamp;
        Location             : String(4);
        Product              : String(40);
        Customer             : String(40);
        forecastParams          : array of {
            groupId          : String(100);
            paramName        : String(256);
            intVal           : Integer;
            doubleVal        : Double;
            strVal           : String(1000);
        };
        modelVersion         : ModelVersion default 'Active' @assert.range: [
            'Active',
            'Simulation'
        ]; // Active, Simulation
        Version              : String(10);
        Scenario             : String(32);
        timeseriesData       : array of {
            groupId          : String(100);
            timestamp        : Integer;
            value            : Double;
            
        };
        statisticsOp         : array of {
            groupId          : String(100);
            statName         : String(256);
            statValue        : String(1000);
        };
        forecastedValues     : array of {
            groupId          : String(100);
            timestamp        : Integer;
            pi1_lower        : Double;
            pi1_upper        : Double;
            pi2_lower        : Double;
            pi2_upper        : Double;        
        };
}

entity OPTIMIZATION_STATUS {
        //key mlrID : UUID;
    key UNIQUE_ID  : String(50);
    STATUS  : OPT_STATUS default 'STARTED' @assert.range: [
            'STARTED',
            'RUNNING',
            'ERROR',
            'COMPLETED'
        ];
    OPTIMIZATION_TIME : Double;
    OPTIMIZED_DEVIATION : Double;
    key LOCATION_ID   : String(4)  default 'NONE' @title: 'Location ID';
    key PRODUCT_ID    : String(40) default 'NONE' @title: 'Product ID';
    key WEEK_DATE     : Date   default '2024-01-01' @title: 'Weekly Date';
}

// key UNIQUE_ID  : String(50);
entity PAL_PROCESS_STATUS {
    UNIQUE_ID  : String(50);
    key PROCESS_NAME : String(50);
    key LOCATION_ID   : String(4)  default 'NONE' @title: 'Location ID';
    key PRODUCT_ID    : String(40) default 'NONE' @title: 'Product ID';
    key STATUS  : PAL_TYPE_STATUS default 'STARTED' @assert.range: [
        'RUNNING',
        'ERROR',
        'COMPLETED'
    ];
    STATUS_MESSAGE : String(1000) @title: 'STATUS MESSAGE';
}


entity CLUSTER_PRIMARY_ID_QTYS
{
    key LOCATION_ID    : String(12)  @title: 'Location ID';
    key PRODUCT_ID     : String(40)  @title: 'Product ID';
    key PROFILE        : String(12)  @title: 'CLUSTERING PROFILE ';
    key PRIMARY_ID     : Integer     @title: 'PRIMARY ID';
    CLUSTER_ID         : Int16       @title: 'CLUSTER ID';
    QUANTITY           : Int16       @title: 'PRIMARY ID QTY';
}

entity CLUSTER_PRIMARY_REPPID_QTYS
{
    key LOCATION_ID    : String(12)  @title: 'Location ID';
    key PRODUCT_ID     : String(40)  @title: 'Product ID';
    key PROFILE        : String(12)  @title: 'CLUSTERING PROFILE ';
    key PRIMARY_ID     : Integer     @title: 'PRIMARY ID';
    key REP_PID        : Integer     @title: 'REP PID';
    CLUSTER_ID         : Int16       @title: 'CLUSTER ID';
}

entity PRPIDS
{
    key LOCATION_ID     : String(4)   @title: 'Location ID';
    key PRODUCT_ID      : String(40)  @title: 'Product ID';
    key PRP_PID         : Integer     @title: 'Planning Relevant Primary ID';
    PRP_PID_TYPE        : Int16       @title: 'Planning Relevant Primary ID Type';
    PROFILE             : String(12)   @title: 'CLUSTERING PROFILE ';

}

entity CLUSTER_PRPIDS_MAPPED_PIDS
{
    key LOCATION_ID     : String(4)   @title: 'Location ID';
    key PRODUCT_ID      : String(40)  @title: 'Product ID';
    PROFILE             : String(12)  @title: 'CLUSTERING PROFILE ';
    key CLUSTER_ID      : Integer     @title: 'CLUSTER ID';
    key PRPID           : Integer     @title: 'Planning Relevant Primary ID';
    key PID             : Integer     @title: 'Primary ID';

}

entity PLANNING_PROFILE
{
    key PLANNING_PROFILE    : String(12)  @title: 'PLANNING PROFILE ';
    MIMIMUM_PRIMARY_IDS : Integer @title: 'MINIMUM PRIMARY IDS for Clustering';
    MINIMUM_CLUSTERS    : Int16   @title: 'Minimum Clusters ';
    MAXIMUM_CLUSTERS    : Int16   @title: 'Maximum Clusters ';
    PERCENTAGE          : Int16   @title: 'Primary IDs Percentage';
    PAST_PERIODS        : Int16   @title: 'Past Weeks';
    FUTURE_PERIODS      : Int16   @title: 'Future Weeks';
    THRESHOLD_DMD       : Integer @title: 'Threshold Demand';
    CLUSTERING_PROFILE  : String(10)  @titile: 'Clustering Profile';
}

entity PAL_PROFILES_LOCPROD
{
    key LOCATION_ID         : String(4)   @title: 'Location ID';
    key PRODUCT_ID          : String(40)  @title: 'Product ID';
    PREDICTIVE_PROFILE      : String(12)  @title: 'PREDICTIVE PROFILE ';
    FORECASTING_PROFILE     : String(12)  @title: 'FORECASTING PROFILE';
    PLANNING_PROFILE        : String(12)  @title: 'PLANNING PROFILE ';
}



entity PAL_PROFILES_LOC
{
    key LOCATION_ID             : String(4)   @title: 'Location ID';
    PREDICTIVE_PROFILE      : String(12)  @title: 'PREDICTIVE PROFILE ';
    FORECASTING_PROFILE     : String(12)  @title: 'FORECASTING PROFILE';
    PLANNING_PROFILE        : String(12)  @title: 'PLANNING PROFILE ';
}



entity PRPIDS_USER_ASSIGNED_PIDS
{
    key LOCATION_ID     : String(4)   @title: 'Location ID';
    key PRODUCT_ID      : String(40)  @title: 'Product ID';
    key PRIMARY_ID      : Integer     @title: 'Primary ID';
}

entity PRPIDS_DISTANCES
{
    key LOCATION_ID     : String(4)   @title: 'Location ID';
    key PRODUCT_ID      : String(40)  @title: 'Product ID';
    key PRP_PID_1       : Integer     @title: 'Planning Relevant Primary ID 1';
    key PRP_PID_2       : Integer     @title: 'Planning Relevant Primary ID 2';
    DISTANCE            : Double      @title: 'Distance between PRP_PIDS';
    PROFILE             : String(12)  @title: 'Clustering Profile';      
}

// entity TS_PERIODS {
//         key  PERIODSTART    : Date;
//         key  PERIODEND      : Date;
//         key  PERIODDESC     : String(50);

// };

// entity STATFORECAST_UNIQUE_QTYS_LOCPROD
// {
//     key CAL_DATE : Date        @title: 'Date';
//     key LOCATION_ID     : String(4)   @title: 'Location ID';
//     key PRODUCT_ID      : String(40)  @title: 'Product ID';
//     key UNIQUE_ID       : Integer    @title: 'UNIQUE_ID';
//     key MODEL_VERSION   : String(50)  @title: 'Model Version';
//     key VERSION         : String(100) @title: 'Version';
//     key SCENARIO        : String(100) @title: 'Scenario';
// 	UNIQUE_QTY          : Double      @title: 'Unique Id Quantity';		
// }

// entity STATFORECAST_PRIMARY_UNIQUE_QTYS
// {
//     key CAL_DATE : Date        @title: 'Date';
//     key LOCATION_ID     : String(4)   @title: 'Location ID';
//     key PRODUCT_ID      : String(40)  @title: 'Product ID';
//     key CUSTOMER_GROUP  : String(40) @title: 'CUSTOMER GROUP';
//     key PRIMARY_ID      : Integer     @title: 'PRIMARY ID';
//     key UNIQUE_ID       : Integer    @title: 'UNIQUE_ID';
//     key MODEL_VERSION   : String(50)  @title: 'Model Version';
//     key VERSION         : String(100) @title: 'Version';
//     key SCENARIO        : String(100) @title: 'Scenario';
//     UNIQUE_PRECENT      : Double      @title: 'Unique Percent';
// 	UNROUNDED           : Double      @title: 'Unrounded';
//     ROUNDED             : Double      @title: 'Rounded';
// 	UNIQUE_QTY          : Double      @title: 'Unique Id Quantity';		
// }

@cds.persistence.exists
entity![V_AHC_LEFT_CLUSTER]{
    key![LOCATION_ID]     : String(4)      @title: 'LOCATION_ID';
    key![PRODUCT_ID]      : String(40)     @title: 'PRODUCT_ID';
    key![PROFILE]         : String(50)     @title: 'PROFILE';
    key![LEFT_ID_CLUSTER] : Integer        @title: 'LEFT_ID_CLUSTER';
    key![LEFT_ID]         : String(50)     @title: 'LEFT_ID';
    key![RIGHT_ID]        : String(50)     @title: 'RIGHT_ID';
    key![DISTANCE]        : Decimal(13, 4) @title: 'DISTANCE';
}

@cds.persistence.exists
entity![V_AHC_CLUSTER_RESULTS]{
    key![LOCATION_ID]      : String(4)      @title: 'LOCATION_ID';
    key![PRODUCT_ID]       : String(40)     @title: 'PRODUCT_ID';
    key![PROFILE]          : String(50)     @title: 'PROFILE';
    key![LEFT_ID_CLUSTER]  : Integer        @title: 'LEFT_ID_CLUSTER';
    key![RIGHT_ID_CLUSTER] : Integer        @title: 'RIGHT_ID_CLUSTER';
    key![LEFT_ID]          : String(50)     @title: 'LEFT_ID';
    key![RIGHT_ID]         : String(50)     @title: 'RIGHT_ID';
    key![DISTANCE]         : Decimal(13, 4) @title: 'DISTANCE';
}

@cds.persistence.exists
entity![V_CLUSTER_CHARS]{
    key![LOCATION_ID] : String(4)  @title: 'LOCATION_ID';
    key![PRODUCT_ID]  : String(40) @title: 'PRODUCT_ID';
    key![UNIQUE_ID]   : Integer    @title: 'UNIQUE_ID';
    key![CHAR_NAME]   : String(30) @title: 'CHAR_NAME';
    key![CHAR_VALUE]  : String(70) @title: 'CHAR_VALUE';
    key![CHARVAL_NUM] : String(70) @title: 'CHARVAL_NUM';
}


@cds.persistence.exists
entity![V_CLUSTERS_GROUP_DISTANCES]{
    key![LOCATION_ID]      : String(4)      @title: 'LOCATION_ID';
    key![PRODUCT_ID]       : String(40)     @title: 'PRODUCT_ID';
    key![MODEL_PROFILE]    : String(50)     @title: 'PROFILE';
    key![SOURCE_CLUSTER_ID]  : Integer      @title: 'SOURCE_CLUSTER_ID';
    key![TARGET_CLUSTER_ID]  : Integer       @title: 'TARGET_CLUSTER_ID';
    key![SOURCE_PID]       : String(50)  @title: 'SOURCE_PID';
    key![TARGET_PID]       : String(50)   @title: 'TARGET_PID';
    key![DISTANCE]         : Decimal(13, 4) @title: 'DISTANCE';
}

@cds.persistence.exists
entity![V_PREDLOCATION]{
    key![LOCATION_ID] : String(4) @title: 'Location';
    key![LOCATION_DESC] : String(30) @title: 'Location Description';
}

@cds.persistence.exists
entity![V_PREDPRODUCT]{
    key![PRODUCT_ID] : String(100) @title: 'Product';
    key![PROD_DESC] : String(100) @title: 'Product Description';
    key![LOCATION_ID]:String(100) @title: 'Location';
    key![LOCATION_DESC] : String(100) @title: 'Location Description';
}


@cds.persistence.exists
entity![V_BOM_TSPREDICTIONV3]{
    key![LOCATION_ID]   : String(4)   @title: 'Location';
    key![PRODUCT_ID]    : String(100) @title: 'Product';
    key![OBJ_TYPE]      : String(100) @title: 'Object Type';
    key![MODEL_VERSION] : String(50)  @title: 'Model Version';
    key![VERSION]       : String(100) @title: 'Version';
    key![SCENARIO]      : String(100) @title: 'Scenario';
    key![CAL_DATE]      : Date        @title: 'Date';
       ![PREDICTED]     : Double      @title: 'Predicted';
    key![ITEM_NUM]      : String(100) @title: 'Item Number';
    key![COMPONENT]     : String(100) @title: 'Component';

}

@cds.persistence.exists
entity![V_PRODPREDICTIONS]{
    key![PRODUCT_ID] : String(100) @title: 'Product';
    key![PROD_DESC] : String(100) @title: 'Product Description';
}
@cds.persistence.exists
entity![V_LOCPREDICTIONS]{
    key![LOCATION_ID] : String(4) @title: 'Location';
    key![LOCATION_DESC] : String(30) @title: 'Location Description';
}

@cds.persistence.exists
entity![V_PALPARTIALPRODDESC]{
    key![LOCATION_ID]    : String(4)  @title: 'LOCATION_ID';
       ![LOCATION_DESC]  : String(40) @title: 'PROD_DESC';
    key![REF_PRODID]     : String(40) @title: 'REF_PRODID';
       ![REFPROD_DESC]   : String(40) @title: 'PROD_DESC';
        ![PRODUCT_ID]     : String(40) @title: 'PRODUCT_ID';
       ![PROD_DESC]      : String(40) @title: 'PROD_DESC';
}
