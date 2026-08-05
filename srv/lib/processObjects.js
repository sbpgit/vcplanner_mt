const math = require('mathjs');

class ProcessObjects {

    constructor() { };

    static async processDependency(aOD, aUID,oUniqueChar,Type,MAT_PARENT) {
        if (aOD[0].LINE.trim().startsWith("NOT SPECIFIED")) {
            const parts = aOD[0].LINE.trim().split(/\s+/);
            const code = parts.slice(2).join(" "); 
            aOD[0].LINE = `${code} NOT SPECIFIED`;
        }
    //    console.log(`Unique Id # of Characteristics ${aUID.length}`);
    //     console.log(`Dependency # of lines ${aOD.length}`);

        let aODChar = [];
        // Break the entire blob into individual characteristics
        aOD.forEach(value => {
            if (value.LINE.charAt(0) === '*') {
                return;
            }
            value.LINE.replace("(", " ( ");
            value.LINE.replace(")", " ) ");
            value.LINE.replace("[", " [ ");
            value.LINE.replace("]", " ] ");
            for (let i = 0; i < value.LINE.length; i++) {
                aODChar.push(value.LINE.charAt(i));
            }
        });


        let aODData = [];
        let waODData = {};
        let lLevel = 0;
        let lHighLevel = 0;
        let lField = 'CHAR_NAME';

        for (let i = 0; i < aODChar.length; i++) {
            if (aODChar[i] === ' ' || aODChar[i] === '') {
                continue
            };



            switch (lField) {
                case 'CHAR_NAME':     // Characteristic

                    if (Object.keys(waODData).length > 0) {
                        aODData.push(JSON.parse(JSON.stringify(waODData)));
                        waODData = {};
                    }

                    // Increase Level if Bracket is open                
                    if (aODChar[i] === '(') {
                        lLevel = parseInt(lLevel) + 1;
                        if (lHighLevel < lLevel) {
                            lHighLevel = parseInt(lLevel);
                        }
                        aODChar[i] = '';
                        continue;
                    }

                    // Reduce Level if Bracket is closed                    
                    if (aODChar[i] === ')') {
                        // parseInt(lLevel) = parseInt(lLevel) - 1;
                        lLevel = parseInt(lLevel) - 1;
                        aODChar[i] = '';
                        continue;
                    }

                    waODData['LEVEL'] = parseInt(lLevel);

                    // Populate Characteristic Name
                    waODData[lField] = '';
                    waODData['OPTION'] = '';
                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === ' ' || aODChar[j] === '') {
                            if (waODData[lField] === 'NOT') {
                                waODData['OPTION'] = 'NOT ';
                                waODData[lField] = '';
                            } else {
                                lField = 'OPTION'; break;
                            }

                        }
                        waODData[lField] = waODData[lField] + aODChar[j].toUpperCase();
                        aODChar[j] = '';
                    }
                    // Populate Characteristic Value
                    waODData['CHAR_VAL'] = [];
                    waODData['CHAR_NAME'] = waODData['CHAR_NAME'].trim(); 
                    //Process variant Table
                    if(waODData['CHAR_NAME'] == 'TABLE'){
                        lField = 'VALUE';
                    }
                    // if(waODData['CHAR_NAME'].trim() == 'TABLE'){
                    //     waODData['CHAR_NAME'] = waODData['CHAR_NAME'].trim();
                    //     lField = 'VALUE';
                    // }
                    for (let j = 0; j < aUID.length; j++) {
                        if (aUID[j].CHAR_NAME === waODData['CHAR_NAME']) {
                            waODData['CHAR_VAL'].push(JSON.parse(JSON.stringify(aUID[j].CHAR_VALUE)));
                            // break;
                        }
                    }
                    break;
                case 'OPTION':     // Equation
                    // Populate Option. It can be =, !=, EQ, NE etc...

                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === ' ' || aODChar[j] === '') {
                            if (waODData[lField] !== 'NOT') {
                                lField = 'VALUE'; break;
                            }
                        }
                        waODData[lField] = waODData[lField] + aODChar[j].toUpperCase();
                        if (aODChar[j] === '='){
                            aODChar[j] = '';
                            lField = 'VALUE';
                            break;
                        }
                        aODChar[j] = '';
                    }
                    // If the Optio is "SPECIFIED", Value will not be assigned. Go directly to Condition
                    if (waODData[lField] === 'SPECIFIED') {
                        lField = 'CONDITION'
                    }
                    break;

                case 'VALUE':     // Value
                    waODData[lField] = '';
                    let lEndValue = ' ';
                    let lFirst = 0;     // Do not consider the first record as it can be space

                    // Identify Value end alphabet based on start alphabet
                    if (aODChar[i] === "'") { lEndValue = "'" };
                    if (aODChar[i] === '(') { lEndValue = ')' };
                    if(waODData['CHAR_NAME']=='TABLE'){ lEndValue = ')'};
                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === lEndValue && lFirst === 1) {
                            if (aODChar[j] !== ' ') {
                                waODData[lField] = waODData[lField] + aODChar[j];
                                aODChar[j] = '';
                            }
                            if(waODData['CHAR_NAME']=='TABLE'){
                                waODData[lField] = waODData[lField];
                            }
                            else{
                                waODData[lField] = waODData[lField].replace(/'/g, '');
                            }
                           
                            lField = 'CONDITION';
                            break;
                        }
                        lFirst = 1;
                        waODData[lField] = waODData[lField] + aODChar[j];
                        aODChar[j] = '';
                    }
                    break;

                case 'CONDITION':     // Condition
                    // Populate Condition. The values can be AND or OR
                    waODData[lField] = '';
                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === ')') {
                            lLevel = parseInt(lLevel) - 1;

                            aODChar[i] = '';
                            continue;
                        }
                        if (aODChar[j] === ' ' || aODChar[j] === '') {
                            if (waODData[lField].toString().trim() !== '') {
                                lField = 'CHAR_NAME';
                                break;
                            }
                        }
                        //if (aODChar[j] === '(' || aODChar[j] === ')') { continue; } 
                        waODData[lField] = waODData[lField] + aODChar[j].toUpperCase();
                        aODChar[j] = '';
                    }
                    break;

                default:
                    break;
            }

        }
        // Insert the last record
        if (Object.keys(waODData).length > 0) {
            aODData.push(JSON.parse(JSON.stringify(waODData)));
            waODData = {};
        }

        // Compare the results
        for (let i = 0; i < aODData.length; i++) {
            // const element = aODData[i];
            aODData[i]['OPTION'] = aODData[i]['OPTION'].trim();
            aODData[i]['RESULT'] = false;
             if(Type == 'P'){//For R_MATERIAL
            if(aODData[i].CHAR_NAME == 'R_MATERIAL'){
                aODData[i].CHAR_VAL =[];
                aODData[i].CHAR_VAL.push(MAT_PARENT);
            }
            } 
            switch (aODData[i]['OPTION']) {
                case '=':
                case 'EQ':
                    for (let j = 0; j < aODData[i]['CHAR_VAL'].length; j++) {
                        let oCharVal = aODData[i]['CHAR_VAL'][j];
                        if (aODData[i]['VALUE'] === oCharVal) {
                            aODData[i]['RESULT'] = true;
                        }
                    }

                    if(Type == 'P'){
                        if(aODData[i]['VALUE'].toString().includes("(") || aODData[i]['VALUE'].toString().includes(")")){//check for opening or closing bracket
                         aODData[i]['VALUE']  = aODData[i]['VALUE'].replace(/[()]/g, '')
                         const parsedVal = this.parseValue(aODData[i]['VALUE'].toString().trim(), aUID);
                            if( aODData[i]['CHAR_VAL'].some(v => v == parsedVal)){
                             aODData[i]['RESULT'] = true;
                        }
                        }
                    } 
                    // if (aODData[i]['VALUE'] === aODData[i]['CHAR_VAL']) {
                    //     aODData[i]['RESULT'] = true;
                    // }
                    break;
                case '!=':
                case 'NOT EQ':
                case '<>':
                case 'NE':
                case 'NOT =': 
                    for (let index = 0; index < aODData[i]['CHAR_VAL'].length; index++) {
                        const element = aODData[i]['CHAR_VAL'][index];
                        if (aODData[i]['VALUE'] !== element) {
                            aODData[i]['RESULT'] = true;
                        }
                    }
                    // if (aODData[i]['VALUE'] !== aODData[i]['CHAR_VAL']) {
                    //     aODData[i]['RESULT'] = true;
                    // }
                    break;
                case '>=':
                case 'GE':
                case '>': 
                    if (aODData[i]['CHAR_VAL'] >= aODData[i]['VALUE']) {
                        aODData[i]['RESULT'] = true;
                    }
                     if(Array.isArray(aODData[i]['CHAR_VAL'])){
                        aODData[i]['RESULT'] = false;
                        compareArray(aODData[i]['CHAR_VAL'],((aODData[i]['OPTION'] == 'GE' || aODData[i]['OPTION'] == '>=' )?'>=':'>'),i)
                    }
                    break;
                case '<=':
                case 'LE':
                case '<':
                    // if (aODData[i]['CHAR_VAL'] <= aODData[i]['VALUE']) {
                    //     aODData[i]['RESULT'] = true;
                    // }
                     if(Array.isArray(aODData[i]['CHAR_VAL'])){
                        aODData[i]['RESULT'] = false;
                         compareArray(aODData[i]['CHAR_VAL'],((aODData[i]['OPTION'] == 'LE' || aODData[i]['OPTION'] == '<=' )?'<=':'<'),i)
                    }
                    break;

                case 'SPECIFIED':
                    if (aODData[i]['VALUE'] !== '') {
                        aODData[i]['RESULT'] = true;
                    }
                    //  if(Type == 'P' ){//check if it exists in Unique ID
                        var oCheck =  aUID.find(u=>u.CHAR_NAME == aODData[i].CHAR_NAME);
                        if(oCheck && oCheck?.CHAR_VALUE !='' &&  oCheck?.CHAR_VALUE !='ZZZZ'){
                            aODData[i]['RESULT'] = true;
                        }
                        else{
                             aODData[i]['RESULT'] = false;
                        }
                    // } 
                    break;
                case 'NOT SPECIFIED':
                    if (aODData[i]['VALUE'] === '') {
                        aODData[i]['RESULT'] = true;
                    }
                    //  if(Type == 'P' ){//check if it exists in Unique ID
                         var oCheck =  aUID.find(u=>u.CHAR_NAME == aODData[i].CHAR_NAME);
                         if(oCheck && oCheck?.CHAR_VALUE !='' &&  oCheck?.CHAR_VALUE !='ZZZZ'){
                            aODData[i]['RESULT'] = false;
                        }
                        else{
                             aODData[i]['RESULT'] = true;
                        }
                    // }
                    break;
                case 'IN':
                case 'NOT IN':
                    let aValue = aODData[i]['VALUE'].split(",")
                    for (let indValue = 0; indValue < aValue.length; indValue++) {
                        aValue[indValue] = aValue[indValue].replace('(', '');
                        aValue[indValue] = aValue[indValue].replace(')', '');
                        aValue[indValue] = aValue[indValue].trim();
                        // if (aValue[indValue] === aODData[i]['CHAR_VAL']) {
                        //     aODData[i]['RESULT'] = true;
                        // }
                        /**
                        for (let index = 0; index < aODData[i]['CHAR_VAL'].length; index++) {
                            const element = aODData[i]['CHAR_VAL'][index];
                            if (aODData[i]['VALUE'] === element) {
                                aODData[i]['RESULT'] = true;
                            }
                        } */
                        for (let index = 0; index < aODData[i]['CHAR_VAL'].length; index++) {
                            const element = aODData[i]['CHAR_VAL'][index];
                            if(aValue[indValue].includes('-')){
                              aODData[i]['RESULT'] = compareRange(aValue[indValue],element)
                            } 
                            else if (aValue[indValue] === element) {
                                aODData[i]['RESULT'] = true;
                            }
                        }
                    }
                    if (aODData[i]['OPTION'] === 'NOT IN') {
                        aODData[i]['RESULT'] = !aODData[i]['RESULT']
                    };

                    break;
                case ''://Table
                case 'NOT':
                    if(aODData[i]['CHAR_NAME'] !='TABLE'){
                        break;
                    }
                let aTableValue = aODData[i].VALUE.toString().split("(");
                let sTableName = aTableValue[0];

                let aConditions =[];
                let aChar = aTableValue[1].replace(/\)+$/, '').split(',').map(item => item.trim());
                if(aChar.length >0){   //Dynamic Query
                    let sQuery =`SELECT ROW_ID,COUNT(*) AS COUNT
                    FROM "CP_VAR_CONTNT"
                    WHERE TABLE_NAME ='${sTableName.toString().trim()}'  AND (`;
                    for(let t=0; t < aChar.length; t++){
                        let sCharName = aChar[t].split("=")[0].trim();
                        let sCharValue = aChar[t].split("=")[1].trim();
                        if(sCharValue.toString().startsWith("'") == false && aUID.findIndex(f=>f.CHAR_NAME == sCharValue) !=-1){// Get from aUID
                            sCharValue = aUID.filter(f=>f.CHAR_NAME == sCharValue).map(f => `'${f.CHAR_VALUE.toString().trim()}'`).join(', ');
                        }
                        // if(sCharValue.toString().startsWith("'") == false && oUniqueChar[sCharValue]){// Get from oUniqueChar
                        //     // sCharValue ='';
                        //     sCharValue = oUniqueChar[sCharValue].map(id => `'${id}'`).join(', ');
                        // }
                        else{
                            sCharValue = sCharValue;
                        }
                        if (!aConditions.includes(sCharName)) {
                            aConditions.push(sCharName);
                          }
                          if(sCharValue.toString().startsWith("'") == false){
                             sCharValue =`'${sCharValue}'`
                          }
                          
                        sQuery+= `
                        (CHAR_NAME = '${sCharName}' AND CHARACTERISTIC_VALUE IN (${sCharValue}))
                        `;
                          
                       
                        if(t != aChar.length - 1)  sQuery+= 'OR'
                    }
                    sQuery+= `)
                    GROUP BY ROW_ID
                    ORDER BY COUNT DESC`;
                let aResponse = await cds.run(sQuery);
                //If count >= conditions length, it is success
                if(aResponse && aResponse.length >0){
                    if(aResponse[0].COUNT >= aConditions.length){
                        aODData[i]['RESULT'] = true;
                    }
                }
                if(aODData[i]['OPTION'] =='NOT'){
                   aODData[i]['RESULT'] = !aODData[i]['RESULT']; 
                }
                }
                 break;
            }
        }

        // Get all of them to same level to get a single result
        for (let indHLevel = lHighLevel; indHLevel >= 0; indHLevel--) {

            for (let indLevel = 0; indLevel < aODData.length; indLevel++) {
                if (aODData[indLevel].LEVEL === indHLevel) {
                    let lNextRec = indLevel + 1;
                    if (lNextRec < aODData.length) {
                        if (aODData[indLevel].LEVEL === aODData[lNextRec].LEVEL) {
                            if (aODData[indLevel].CONDITION.toString().trim() === 'AND') {
                                if (aODData[indLevel].RESULT === false
                                    || aODData[lNextRec].RESULT === false) {
                                    aODData[lNextRec].RESULT = false;
                                }
                            }
                            if (aODData[indLevel].CONDITION.toString().trim() === 'OR') {
                                if (aODData[indLevel].RESULT === true
                                    || aODData[lNextRec].RESULT === true) {
                                    aODData[lNextRec].RESULT = true;
                                }
                            }

                            aODData[indLevel] = [];


                        } else {
                            if (aODData[indLevel].LEVEL >= 0) {
                                aODData[indLevel].LEVEL = parseInt(aODData[indLevel].LEVEL) - 1;
                            }
                        }
                    }
                    else {
                        if (aODData[indLevel].LEVEL >= 0) {
                            aODData[indLevel].LEVEL = parseInt(aODData[indLevel].LEVEL) - 1;
                        }
                    }
                }

            }
            // for (let indLevel = 0; indLevel < aODData.length; indLevel++) {
            //     if (Object.keys(aODData[indLevel]).length === 0) {
            //         aODData.splice(indLevel, 1);
            //     }
            // }

        }


        // console.log(aODData);

        if (aODData.length > 0) {
            return aODData[aODData.length - 1].RESULT;
        } else {
            return false;
        }
        function compareArray(aData,operator,mainIndex){
              for (let index = 0; index < aData.length; index++) {
                        const element = aData[index];
                        if (Function("a","b",`return Number(a) ${operator} Number(b);`)(element,aODData[mainIndex]['VALUE'])) {
                            aODData[mainIndex]['RESULT'] = true;
                         }
                    }
        }

        function compareRange(val,element){
            let bResult = false;
              let [min, max] = val.split('-').map(v => parseFloat(v.trim()));
                let numElement = parseFloat(element);
                 if (!isNaN(min) && !isNaN(max) && !isNaN(numElement)) {
                 if (numElement >= min && numElement <= max) {
                   bResult = true;
                     }
                    }
            return bResult;
        }

    }

    static odBreakDown(aOD) {

        console.log(`Dependency # of lines ${aOD.length}`);

        let aODChar = [];
        // Break the entire blob into individual characteristics
        aOD.forEach(value => {
            if (value.LINE.charAt(0) === '*') {
                return;
            }
            for (let i = 0; i < value.LINE.length; i++) {
                aODChar.push(value.LINE.charAt(i));
            }
        });


        let aODData = [];
        let waODData = {};
        let lLevel = 0;
        let lHighLevel = 0;
        let lField = 'CHAR_NAME';

        for (let i = 0; i < aODChar.length; i++) {
            if (aODChar[i] === ' ' || aODChar[i] === '') {
                continue
            };



            switch (lField) {
                case 'CHAR_NAME':     // Characteristic

                    if (Object.keys(waODData).length > 0) {
                        aODData.push(JSON.parse(JSON.stringify(waODData)));
                        waODData = {};
                    }

                    // Increase Level if Bracket is open                
                    if (aODChar[i] === '(') {
                        lLevel = parseInt(lLevel) + 1;
                        if (lHighLevel < lLevel) {
                            lHighLevel = parseInt(lLevel);
                        }
                        aODChar[i] = '';
                        continue;
                    }

                    // Reduce Level if Bracket is closed                    
                    if (aODChar[i] === ')') {
                        parseInt(lLevel) = parseInt(lLevel) - 1;
                        aODChar[i] = '';
                        continue;
                    }

                    waODData['LEVEL'] = parseInt(lLevel);

                    // Populate Characteristic Name
                    waODData[lField] = '';
                    waODData['OPTION'] = '';
                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === ' ' || aODChar[j] === '') {
                            if (waODData[lField] === 'NOT') {
                                waODData['OPTION'] = 'NOT ';
                                waODData[lField] = '';
                            } else {
                                lField = 'OPTION'; break;
                            }

                        }
                        waODData[lField] = waODData[lField] + aODChar[j].toUpperCase();
                        aODChar[j] = '';
                    }

                    // Populate Characteristic Value
                    waODData['CHAR_VAL'] = [];
                    break;
                case 'OPTION':     // Equation
                    // Populate Option. It can be =, !=, EQ, NE etc...

                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === ' ' || aODChar[j] === '') {
                            if (waODData[lField] !== 'NOT') {
                                lField = 'VALUE'; break;
                            }
                        }
                        waODData[lField] = waODData[lField] + aODChar[j].toUpperCase();
                        aODChar[j] = '';
                    }
                    // If the Optio is "SPECIFIED", Value will not be assigned. Go directly to Condition
                    if (waODData[lField] === 'SPECIFIED') {
                        lField = 'CONDITION'
                    }
                    break;

                case 'VALUE':     // Value
                    waODData[lField] = '';
                    let lEndValue = ' ';
                    let lFirst = 0;     // Do not consider the first record as it can be space

                    // Identify Value end alphabet based on start alphabet
                    if (aODChar[i] === "'") { lEndValue = "'" };
                    if (aODChar[i] === '(') { lEndValue = ')' };
                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === lEndValue && lFirst === 1) {
                            if (aODChar[j] !== ' ') {
                                waODData[lField] = waODData[lField] + aODChar[j];
                                aODChar[j] = '';
                            }
                            waODData[lField] = waODData[lField].replace(/'/g, '');
                            lField = 'CONDITION';
                            break;
                        }
                        lFirst = 1;
                        waODData[lField] = waODData[lField] + aODChar[j];
                        aODChar[j] = '';
                    }
                    break;

                case 'CONDITION':     // Condition
                    // Populate Condition. The values can be AND or OR
                    waODData[lField] = '';
                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === ' ' || aODChar[j] === '') { lField = 'CHAR_NAME'; break; }
                        waODData[lField] = waODData[lField] + aODChar[j].toUpperCase();
                        aODChar[j] = '';
                    }
                    break;

                default:
                    break;
            }

        }
        // Insert the last record
        if (Object.keys(waODData).length > 0) {
            aODData.push(JSON.parse(JSON.stringify(waODData)));
            waODData = {};
        }

        return aODData;
    }

    static odProcess(aODData, aUID) {
        let lHighLevel = 0;
        // Compare the results
        for (let i = 0; i < aODData.length; i++) {

            for (let j = 0; j < aUID.length; j++) {
                if (aUID[j].CHAR_NAME === aODData[i]['CHAR_NAME']) {
                    aODData[i]['CHAR_VAL'].push(JSON.parse(JSON.stringify(aUID[j].CHAR_VALUE)));
                    break;
                }
            }

            const element = aODData[i];
            aODData[i]['RESULT'] = false;
            switch (aODData[i]['OPTION']) {
                case '=':
                case 'EQ':
                    for (let j = 0; j < aODData[i]['CHAR_VAL'].length; j++) {
                        let oCharVal = aODData[i]['CHAR_VAL'][j];
                        if (aODData[i]['VALUE'] === oCharVal) {
                            aODData[i]['RESULT'] = true;
                        }

                    }
                    // if (aODData[i]['VALUE'] === aODData[i]['CHAR_VAL']) {
                    //     aODData[i]['RESULT'] = true;
                    // }
                    break;
                case '!=':
                case 'NOT EQ':
                case '<>':
                case 'NE':
                    for (let index = 0; index < aODData[i]['CHAR_VAL'].length; index++) {
                        const element = aODData[i]['CHAR_VAL'][index];
                        if (aODData[i]['VALUE'] !== element) {
                            aODData[i]['RESULT'] = true;
                        }
                    }
                    // if (aODData[i]['VALUE'] !== aODData[i]['CHAR_VAL']) {
                    //     aODData[i]['RESULT'] = true;
                    // }
                    break;
                case '>=':
                case 'GE':
                    if (aODData[i]['CHAR_VAL'] >= aODData[i]['VALUE']) {
                        aODData[i]['RESULT'] = true;
                    }
                    break;
                case '<=':
                case 'LE':
                    if (aODData[i]['CHAR_VAL'] <= aODData[i]['VALUE']) {
                        aODData[i]['RESULT'] = true;
                    }
                    break;

                case 'SPECIFIED':
                    if (aODData[i]['VALUE'] !== '') {
                        aODData[i]['RESULT'] = true;
                    }
                    break;
                case 'NOT SPECIFIED':
                    if (aODData[i]['VALUE'] === '') {
                        aODData[i]['RESULT'] = true;
                    }
                    break;
                case 'IN':
                case 'NOT IN':
                    let aValue = aODData[i]['VALUE'].split(",")
                    for (let indValue = 0; indValue < aValue.length; indValue++) {
                        aValue[indValue] = aValue[indValue].replace('(', '');
                        aValue[indValue] = aValue[indValue].replace(')', '');
                        aValue[indValue] = aValue[indValue].trim();
                        // if (aValue[indValue] === aODData[i]['CHAR_VAL']) {
                        //     aODData[i]['RESULT'] = true;
                        // }
                        for (let index = 0; index < aODData[i]['CHAR_VAL'].length; index++) {
                            const element = aODData[i]['CHAR_VAL'][index];
                            if (aODData[i]['VALUE'] === element) {
                                aODData[i]['RESULT'] = true;
                            }
                        }
                    }
                    if (aODData[i]['OPTION'] === 'NOT IN') {
                        aODData[i]['RESULT'] = !aODData[i]['RESULT']
                    };

                    break;
            }
        }

        // Get all of them to same level to get a single result
        for (let indHLevel = lHighLevel; indHLevel >= 0; indHLevel--) {

            for (let indLevel = 0; indLevel < aODData.length; indLevel++) {
                if (aODData[indLevel].LEVEL === indHLevel) {
                    let lNextRec = indLevel + 1;
                    if (lNextRec < aODData.length) {
                        if (aODData[indLevel].LEVEL === aODData[lNextRec].LEVEL) {
                            if (aODData[indLevel].CONDITION === 'AND') {
                                if (aODData[indLevel].RESULT === false
                                    || aODData[lNextRec].RESULT === false) {
                                    aODData[lNextRec].RESULT = false;
                                }
                            }
                            if (aODData[indLevel].CONDITION === 'OR') {
                                if (aODData[indLevel].RESULT === true
                                    || aODData[lNextRec].RESULT === true) {
                                    aODData[lNextRec].RESULT = true;
                                }
                            }

                            aODData[indLevel] = [];


                        } else {
                            if (aODData[indLevel].LEVEL >= 0) {
                                aODData[indLevel].LEVEL = parseInt(aODData[indLevel].LEVEL) - 1;
                            }
                        }
                    }
                    else {
                        if (aODData[indLevel].LEVEL >= 0) {
                            aODData[indLevel].LEVEL = parseInt(aODData[indLevel].LEVEL) - 1;
                        }
                    }
                }

            }
            for (let indLevel = 0; indLevel < aODData.length; indLevel++) {
                if (Object.keys(aODData[indLevel]).length === 0) {
                    aODData.splice(indLevel, 1);
                }
            }

        }

        // console.log(aODData);

        if (aODData.length > 0) {
            return aODData[0].RESULT;
        } else {
            return false;
        }
    }

      static async processProcedure(aPro, aUID,oUniqueChar,oPChar,item_Qty,MAT_PARENT) {


        let aProChar = [];
        var aReturn =[];
        try{
        //Add Trailing dot to end of Dependency if it doesn't exists
        if(aPro.length >0){
            if(aPro[aPro.length - 1].LINE.toString().trim().slice(-1) !='.'){
                aPro[aPro.length - 1].LINE+='.';
            }
        }
        // Break the entire blob into individual characteristics
        aPro.forEach(value => {   
            if (value.LINE.charAt(0) === '*') {
                return;
            }

            for (let i = 0; i < value.LINE.length; i++) {
                aProChar.push(value.LINE.charAt(i));
            }
        });
       aProChar = addCondition(aProChar);

        let aProData = [];
        let waProData = {};
        let lField = 'ASS_CHAR_NAME';

        for (let i = 0; i < aProChar.length; i++) {
            if (aProChar[i] === ' ' || aProChar[i] === '') {
                continue;
            };

            switch (lField) {
                case 'ASS_CHAR_NAME':     // Characteristic

                    if (Object.keys(waProData).length > 0) {
                        //Prevent pushing of duplicates
                        if(aProData.findIndex(p=>p.ASS_CHAR_NAME == waProData.ASS_CHAR_NAME && p.ASS_DEPENDENCY == waProData.ASS_DEPENDENCY && p.ASS_OPTION == waProData.ASS_OPTION
                            && p.ASS_VALUE == waProData.ASS_VALUE && p.ASS_RESULT == waProData.ASS_RESULT) == -1){
                                aProData.push(JSON.parse(JSON.stringify(waProData)));
                            }
                        
                        waProData = {};
                    }

                    // Populate Characteristic Name
                    waProData[lField] = '';
                     //Process variant Table
                    
                    for (let j = i; j < aProChar.length; j++) {
                        if (aProChar[j] === ' ' || aProChar[j] === '') { lField = 'ASS_OPTION'; break; }
                        waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                        aProChar[j] = '';
                    }

                    waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].replace(/\$SELF./g, '');
                    waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].replace(/\$PARENT./g, '');
                     if(waProData['ASS_CHAR_NAME'].trim() == 'TABLE'){
                        waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].trim();
                        lField = 'ASS_DEPENDENCY';
                    }
                    break;
                case 'ASS_OPTION':     // Equation
                    // Populate Option. It can be = etc...
                    waProData[lField] = '';
                    for (let j = i; j < aProChar.length; j++) {
                        if (aProChar[j] === ' ' || aProChar[j] === '') { lField = 'ASS_VALUE'; break; }
                        waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                        aProChar[j] = '';
                    }
                    break;

                case 'ASS_VALUE':
                    // Populate Characteristic Value
                    waProData[lField] = '';
                    for (let j = i; j < aProChar.length; j++) {
                        if (aProChar[j] === ',') {

                            waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
                            waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');
                            waProData['ASS_RESULT'] = true;

                            lField = 'ASS_CHAR_NAME';
                            aProChar[j] = '';
                            break;
                        }
                        waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                        waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
                        waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');

                        aProChar[j] = '';
                        if (waProData[lField].substr(waProData[lField].length - 4) === ' IF ') {
                            waProData[lField] = waProData[lField].slice(0, -4);
                            // waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
                            // waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');

                            lField = 'ASS_DEPENDENCY';
                            break;
                        }
                    }



                    // Identify Characteristics
                    console.log(waProData['ASS_VALUE'].length);
                    waProData['ASS_VALUE'] = waProData['ASS_VALUE'].toString().trim();
                    
                    let aValue = [];
                    let lChar = '';
                    let lAlphabet = '';
                    let lIgnore = false;
                    for (let i = 0; i < waProData['ASS_VALUE'].length; i++) {
                        lAlphabet = waProData['ASS_VALUE'].charAt(i);
                        if (lAlphabet === ' ') {
                            continue;
                        }
                        if (lAlphabet === "'") {
                            lIgnore = !lIgnore;
                            continue;
                        }

                        if ((lAlphabet === '*' ||
                            lAlphabet === '/' ||
                            lAlphabet === '+' ||
                            lAlphabet === '-' ||
                            lAlphabet === '(' ||
                            lAlphabet === ')' ||
                            i === waProData['ASS_VALUE'].length - 1) && lIgnore === false) {
                            // Search for Characteristic Value
                            for (let j = 0; j < aUID.length; j++) {
                                if (aUID[j].CHAR_NAME === lChar) {
                                    let lLenght = i - lChar.length - 1;
                                    waProData['ASS_VALUE'] = waProData['ASS_VALUE'].substr(0, lLenght)
                                        + JSON.parse(JSON.stringify(aUID[j].CHAR_VALUE)) +' '
                                        + waProData['ASS_VALUE'].substr(i);
                             let insertedValue = JSON.parse(JSON.stringify(aUID[j].CHAR_VALUE)) + ' ';
                                let newLength = insertedValue.length;
                                i = lLenght + newLength;
                                }
                                else if(oPChar[lChar]){//if exists in table
                                    //if initialized in same dependency
                                    if(aProData.length >0 && lChar == 'R_BOM_ITEM_QTY'){
                                        let aRec = aProData.filter(f=>f.ASS_CHAR_NAME ==  lChar);
                                        if(aRec.length >0){
                                           item_Qty =  aRec[aRec.length - 1].ASS_VALUE;
                                        }
                                    }
                                    //Setting Values to R_
                                    if(lChar == 'R_LINE_QTY'){//TODO R_LINE_QTY
                                        item_Qty = 1;
                                    }
                                    else if(lChar == 'R_MATERIAL'){//Replacing R_MATERIAL with MAT_PARENT
                                        item_Qty =MAT_PARENT;
                                    }
                                    waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(new RegExp(lChar, "g"), item_Qty);
                                }
                            }
                            lChar = '';
                            continue;
                        }
                        lChar = lChar + lAlphabet;


                    }

                    // console.log(math.evaluate(waProData['ASS_VALUE']));

                    break;

                case 'ASS_DEPENDENCY':     // Dependency
                    waProData[lField] = '';

                    let lBrackets = 0;

                    for (let j = i; j < aProChar.length; j++) {
                        if (aProChar[j] === ',' && lBrackets === 0) {
                            lField = 'ASS_CHAR_NAME';
                            aProChar[j] = '';
                            break;
                        }
                        if (aProChar[j] === '(') {
                            lBrackets++;
                        }

                        if (aProChar[j] === ')') {
                            lBrackets--;
                        }
                        waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                        aProChar[j] = '';

                    }

                    let waOD = [];
                    let aOD = [];

                    waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].replace(/\$SELF./g, '');
                    waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].replace(/\$PARENT./g, '');
                    waOD['LINE'] = waProData['ASS_DEPENDENCY'].toString().trim().replace(/\.$/, '');
                    if(waProData['ASS_CHAR_NAME']=='TABLE'){
                      waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].toString().replace(' IF ', '').trim();
                         waOD['LINE'] ="TABLE "+ waProData['ASS_DEPENDENCY'].replace(/\.$/, '');
                    }
                    aOD.push(waOD);
                    waProData['ASS_RESULT'] = await this.processDependency(aOD, aUID,oUniqueChar,'P',MAT_PARENT);
                    aProData.push(waProData);

                    break;
                    // case ''://Procedure
                    // let aTableValue = aProChar[i].VALUE.toString().split("(");
                    // let sTableName = aTableValue[0];
    
                    // let aConditions =[];
                    // let aChar = aTableValue[1].replace(/\)+$/, '').split(',').map(item => item.trim());
                    // if(aChar.length >0){   //Dynamic Query
                    //     let sQuery =`SELECT ROW_ID,COUNT(*) AS COUNT
                    //     FROM "CP_VAR_CONTNT"
                    //     WHERE TABLE_NAME ='${sTableName}'  AND (`;
                    //     for(let t=0; t < aChar.length; t++){
                    //         let sCharName = aChar[t].split("=")[0].trim();
                    //         let sCharValue = aChar[t].split("=")[1].trim();
                    //         if(sCharValue.toString().startsWith("'") == false && oUniqueChar[sCharName]){// Get from oUniqueChar
                    //             sCharValue ='';
                    //             sCharValue = oUniqueChar[sCharName].map(id => `'${id}'`).join(', ');
                    //         }
                    //         else{
                    //             sCharValue = sCharValue;
                    //         }
                    //         if (!aConditions.includes(sCharName)) {
                    //             aConditions.push(sCharName);
                    //           }
                    //         sQuery+= `
                    //         (CHAR_NAME = '${sCharName}' AND CHARACTERISTIC_VALUE IN (${sCharValue}))
                    //         `;
                    //         if(t != aChar.length - 1)  sQuery+= 'OR'
                    //     }
                    //     sQuery+= `)
                    //     GROUP BY ROW_ID
                    //     ORDER BY COUNT DESC`;
                    // let aResponse = await cds.run(sQuery);
                    // //If count >= conditions length, it is success
                    // if(aResponse && aResponse.length >0){
                    //     if(aResponse[0].COUNT >= aConditions.length){
                    //         waProData[i]['RESULT'] = true;
                    //     }
                    // }
                    // }
                    //  break;
                
                default:
                    break;
            }

        }
        // Insert the last record
        if (Object.keys(waProData).length > 0) {
              //Prevent pushing of duplicates
            if(aProData.findIndex(p=>p.ASS_CHAR_NAME == waProData.ASS_CHAR_NAME && p.ASS_DEPENDENCY == waProData.ASS_DEPENDENCY && p.ASS_OPTION == waProData.ASS_OPTION
                    && p.ASS_VALUE == waProData.ASS_VALUE && p.ASS_RESULT == waProData.ASS_RESULT) == -1){
            aProData.push(JSON.parse(JSON.stringify(waProData)));
                    }
            waProData = {};
        }

        var bSuccess = false;
        if (aProData.length > 0) {
            // for (let i = 0; i < aProData.length; i++) {
                // if (aProData[i].ASS_RESULT === true) {
                //     const oUID={};
                //     oUID['CHAR_NAME'] = aProData[i].ASS_CHAR_NAME;
                //     oUID['CHAR_VALUE'] = aProData[i].ASS_VALUE;

                //     aUID.push(oUID);
                // }
            // }

            const resolvedValues = {};
            //Loop for usage of variables
            for (const item of aProData) {
                if(item.ASS_CHAR_NAME == 'TABLE'){
                    bSuccess = item.ASS_RESULT;
                    break;
                }
                const name = item.ASS_CHAR_NAME.trim();
                let expr = item.ASS_VALUE.toString().trim();
 
                // Replace known variables in the expression
                for (const [varName, varVal] of Object.entries(resolvedValues)) {
                    const regex = new RegExp(`\\b${varName}\\b`, 'g');
                    expr = expr.replace(regex, varVal);
                }
 
                // Evaluate only if ASS_RESULT is true
                if (item.ASS_RESULT === true) {
                    try {
                        const result = eval(expr); // careful with eval!
                        resolvedValues[name] = result.toString();
                        item.ASS_VALUE = result.toString(); // update the item too
                    } catch (e) {
                        resolvedValues[name] = expr; // fallback to raw expression
                        item.ASS_VALUE = expr;
                    }
                } else {
                    item.ASS_VALUE = expr; // still update expression even if not evaluated
                }
            }
               
                for (let i = aProData.length - 1; i >= 0; i--) {
                    if(aProData[i].ASS_CHAR_NAME == 'TABLE'){
                         bSuccess = aProData[i].ASS_RESULT;
                         aReturn.push({
                            "CHAR_VALUE":item_Qty
                         })
                        break;
                    }
                     aProData[i].ASS_CHAR_NAME =  aProData[i].ASS_CHAR_NAME.replace(/[\n\t ]+/g, "");
                    //if No ASS_RESULT 
                    if((aProData[i].ASS_RESULT == undefined || aProData[i].ASS_RESULT == null) && oPChar[aProData[i].ASS_CHAR_NAME]){//check ASS_CHAR_NAME from CP_PROCEDURE_CHAR
                        //Replacing . with empty
                        aProData[i].ASS_VALUE = aProData[i].ASS_VALUE.toString().replace(/\.\s*$/, '');
                        aProData[i].ASS_RESULT = true;
                    }
                     if (aProData[i].ASS_RESULT === true) {
                        const oUID={};
                         oUID['CHAR_NAME'] = aProData[i].ASS_CHAR_NAME;
                         oUID['CHAR_VALUE'] =  this.parseValue(aProData[i].ASS_VALUE.toString().trim(),aUID);
                         if(oUID['CHAR_VALUE']!= ''){
                        aReturn.push(oUID);
                         bSuccess = true;
                         break;
                         }
                        
                    }
}
        }
    }
    catch(ex){
        bSuccess = false,
        aReturn =[];
    }


        return{
            bFlag :bSuccess,
            Quantity: (() => {
        const val = Math.round(aReturn[aReturn.length - 1]?.CHAR_VALUE);
        return isNaN(val) ? 1 : val;
    })()
        }

        function addCondition(aProChar){
        let inputStr = aProChar.join("");
    let parts = inputStr.split(",");
    let keywords = ["EQ", "NOT EQ", "NOT =", "GE", "LE", "SPECIFIED", "NOT SPECIFIED", "NOT IN"];
    //  Processing
    parts = parts.map(part => {
    let trimmed = part.trim();
    if ( keywords.some(k => trimmed.includes(k))&& !trimmed.includes("IF")) {
        let idx = part.indexOf("(");
        if (idx !== -1) {
            return part.slice(0, idx) + "IF " + part.slice(idx);
        }
    }
    return part;
    });
    let resultStr = parts.join(",");
    return resultStr.split("");
        }

        
    }

//     static async processProcedure(aPro, aUID,oUniqueChar,oPChar,item_Qty,MAT_PARENT) {


//         let aProChar = [];
//         var aReturn =[];
      
//         //Add Trailing dot to end of Dependency if it doesn't exists
//         if(aPro.length >0){
//             if(aPro[aPro.length - 1].LINE.toString().trim().slice(-1) !='.'){
//                 aPro[aPro.length - 1].LINE+='.';
//             }
//         }
//         // Break the entire blob into individual characteristics
//         aPro.forEach(value => {   
//             if (value.LINE.charAt(0) === '*') {
//                 return;
//             }

//             for (let i = 0; i < value.LINE.length; i++) {
//                 aProChar.push(value.LINE.charAt(i));
//             }
//         });
//        aProChar = addCondition(aProChar);

//         let aProData = [];
//         let waProData = {};
//         let lField = 'ASS_CHAR_NAME';

//         for (let i = 0; i < aProChar.length; i++) {
//             if (aProChar[i] === ' ' || aProChar[i] === '') {
//                 continue;
//             };

//             switch (lField) {
//                 case 'ASS_CHAR_NAME':     // Characteristic

//                     if (Object.keys(waProData).length > 0) {
//                         //Prevent pushing of duplicates
//                         if(aProData.findIndex(p=>p.ASS_CHAR_NAME == waProData.ASS_CHAR_NAME && p.ASS_DEPENDENCY == waProData.ASS_DEPENDENCY && p.ASS_OPTION == waProData.ASS_OPTION
//                             && p.ASS_VALUE == waProData.ASS_VALUE && p.ASS_RESULT == waProData.ASS_RESULT) == -1){
//                                 aProData.push(JSON.parse(JSON.stringify(waProData)));
//                             }
                        
//                         waProData = {};
//                     }

//                     // Populate Characteristic Name
//                     waProData[lField] = '';
//                      //Process variant Table
                    
//                     for (let j = i; j < aProChar.length; j++) {
//                         if (aProChar[j] === ' ' || aProChar[j] === '') { lField = 'ASS_OPTION'; break; }
//                         waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
//                         aProChar[j] = '';
//                     }

//                     waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].replace(/\$SELF./g, '');
//                     waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].replace(/\$PARENT./g, '');
//                      if(waProData['ASS_CHAR_NAME'].trim() == 'TABLE'){
//                         waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].trim();
//                         lField = 'ASS_DEPENDENCY';
//                     }
//                     break;
//                 case 'ASS_OPTION':     // Equation
//                     // Populate Option. It can be = etc...
//                     waProData[lField] = '';
//                     for (let j = i; j < aProChar.length; j++) {
//                         if (aProChar[j] === ' ' || aProChar[j] === '') { lField = 'ASS_VALUE'; break; }
//                         waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
//                         aProChar[j] = '';
//                     }
//                     break;

//                 case 'ASS_VALUE':
//                     // Populate Characteristic Value
//                     waProData[lField] = '';
//                     for (let j = i; j < aProChar.length; j++) {
//                         if (aProChar[j] === ',') {

//                             waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
//                             waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');
//                             waProData['ASS_RESULT'] = true;

//                             lField = 'ASS_CHAR_NAME';
//                             aProChar[j] = '';
//                             break;
//                         }
//                         waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
//                         waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
//                         waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');

//                         aProChar[j] = '';
//                         if (waProData[lField].substr(waProData[lField].length - 4) === ' IF ') {
//                             waProData[lField] = waProData[lField].slice(0, -4);
//                             // waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
//                             // waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');

//                             lField = 'ASS_DEPENDENCY';
//                             break;
//                         }
//                     }



//                     // Identify Characteristics
//                     console.log(waProData['ASS_VALUE'].length);
//                     waProData['ASS_VALUE'] = waProData['ASS_VALUE'].toString().trim();
                    
//                     let aValue = [];
//                     let lChar = '';
//                     let lAlphabet = '';
//                     let lIgnore = false;
//                     for (let i = 0; i < waProData['ASS_VALUE'].length; i++) {
//                         lAlphabet = waProData['ASS_VALUE'].charAt(i);
//                         if (lAlphabet === ' ') {
//                             continue;
//                         }
//                         if (lAlphabet === "'") {
//                             lIgnore = !lIgnore;
//                             continue;
//                         }

//                         if ((lAlphabet === '*' ||
//                             lAlphabet === '/' ||
//                             lAlphabet === '+' ||
//                             lAlphabet === '-' ||
//                             lAlphabet === '(' ||
//                             lAlphabet === ')' ||
//                             i === waProData['ASS_VALUE'].length - 1) && lIgnore === false) {
//                             // Search for Characteristic Value
//                             for (let j = 0; j < aUID.length; j++) {
//                                 if (aUID[j].CHAR_NAME === lChar) {
//                                     let lLenght = i - lChar.length - 1;
//                                     waProData['ASS_VALUE'] = waProData['ASS_VALUE'].substr(0, lLenght)
//                                         + JSON.parse(JSON.stringify(aUID[j].CHAR_VALUE)) +' '
//                                         + waProData['ASS_VALUE'].substr(i);
//                              let insertedValue = JSON.parse(JSON.stringify(aUID[j].CHAR_VALUE)) + ' ';
//                                 let newLength = insertedValue.length;
//                                 i = lLenght + newLength;
//                                 }
//                                 else if(oPChar[lChar]){//if exists in table
//                                     //if initialized in same dependency
//                                     if(aProData.length >0 && lChar == 'R_BOM_ITEM_QTY'){
//                                         let aRec = aProData.filter(f=>f.ASS_CHAR_NAME ==  lChar);
//                                         if(aRec.length >0){
//                                            item_Qty =  aRec[aRec.length - 1].ASS_VALUE;
//                                         }
//                                     }
//                                     //Setting Values to R_
//                                     if(lChar == 'R_LINE_QTY'){//TODO R_LINE_QTY
//                                         item_Qty = 1;
//                                     }
//                                     else if(lChar == 'R_MATERIAL'){//Replacing R_MATERIAL with MAT_PARENT
//                                         item_Qty =MAT_PARENT;
//                                     }
//                                     waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(new RegExp(lChar, "g"), item_Qty);
//                                 }
//                             }
//                             lChar = '';
//                             continue;
//                         }
//                         lChar = lChar + lAlphabet;


//                     }

//                     // console.log(math.evaluate(waProData['ASS_VALUE']));

//                     break;

//                 case 'ASS_DEPENDENCY':     // Dependency
//                     waProData[lField] = '';

//                     let lBrackets = 0;

//                     for (let j = i; j < aProChar.length; j++) {
//                         if (aProChar[j] === ',' && lBrackets === 0) {
//                             lField = 'ASS_CHAR_NAME';
//                             aProChar[j] = '';
//                             break;
//                         }
//                         if (aProChar[j] === '(') {
//                             lBrackets++;
//                         }

//                         if (aProChar[j] === ')') {
//                             lBrackets--;
//                         }
//                         waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
//                         aProChar[j] = '';

//                     }

//                     let waOD = [];
//                     let aOD = [];

//                     waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].replace(/\$SELF./g, '');
//                     waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].replace(/\$PARENT./g, '');
//                     waOD['LINE'] = waProData['ASS_DEPENDENCY'].toString().trim().replace(/\.$/, '');
//                     if(waProData['ASS_CHAR_NAME']=='TABLE'){
//                       waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].toString().replace(' IF ', '').trim();
//                          waOD['LINE'] ="TABLE "+ waProData['ASS_DEPENDENCY'].replace(/\.$/, '');
//                     }
//                     aOD.push(waOD);
//                     waProData['ASS_RESULT'] = await this.processDependency(aOD, aUID,oUniqueChar,'P',MAT_PARENT);
//                     aProData.push(waProData);

//                     break;
//                     // case ''://Procedure
//                     // let aTableValue = aProChar[i].VALUE.toString().split("(");
//                     // let sTableName = aTableValue[0];
    
//                     // let aConditions =[];
//                     // let aChar = aTableValue[1].replace(/\)+$/, '').split(',').map(item => item.trim());
//                     // if(aChar.length >0){   //Dynamic Query
//                     //     let sQuery =`SELECT ROW_ID,COUNT(*) AS COUNT
//                     //     FROM "CP_VAR_CONTNT"
//                     //     WHERE TABLE_NAME ='${sTableName}'  AND (`;
//                     //     for(let t=0; t < aChar.length; t++){
//                     //         let sCharName = aChar[t].split("=")[0].trim();
//                     //         let sCharValue = aChar[t].split("=")[1].trim();
//                     //         if(sCharValue.toString().startsWith("'") == false && oUniqueChar[sCharName]){// Get from oUniqueChar
//                     //             sCharValue ='';
//                     //             sCharValue = oUniqueChar[sCharName].map(id => `'${id}'`).join(', ');
//                     //         }
//                     //         else{
//                     //             sCharValue = sCharValue;
//                     //         }
//                     //         if (!aConditions.includes(sCharName)) {
//                     //             aConditions.push(sCharName);
//                     //           }
//                     //         sQuery+= `
//                     //         (CHAR_NAME = '${sCharName}' AND CHARACTERISTIC_VALUE IN (${sCharValue}))
//                     //         `;
//                     //         if(t != aChar.length - 1)  sQuery+= 'OR'
//                     //     }
//                     //     sQuery+= `)
//                     //     GROUP BY ROW_ID
//                     //     ORDER BY COUNT DESC`;
//                     // let aResponse = await cds.run(sQuery);
//                     // //If count >= conditions length, it is success
//                     // if(aResponse && aResponse.length >0){
//                     //     if(aResponse[0].COUNT >= aConditions.length){
//                     //         waProData[i]['RESULT'] = true;
//                     //     }
//                     // }
//                     // }
//                     //  break;
                
//                 default:
//                     break;
//             }

//         }
//         // Insert the last record
//         if (Object.keys(waProData).length > 0) {
//               //Prevent pushing of duplicates
//             if(aProData.findIndex(p=>p.ASS_CHAR_NAME == waProData.ASS_CHAR_NAME && p.ASS_DEPENDENCY == waProData.ASS_DEPENDENCY && p.ASS_OPTION == waProData.ASS_OPTION
//                     && p.ASS_VALUE == waProData.ASS_VALUE && p.ASS_RESULT == waProData.ASS_RESULT) == -1){
//             aProData.push(JSON.parse(JSON.stringify(waProData)));
//                     }
//             waProData = {};
//         }

//         var bSuccess = false;
//         if (aProData.length > 0) {
//             // for (let i = 0; i < aProData.length; i++) {
//                 // if (aProData[i].ASS_RESULT === true) {
//                 //     const oUID={};
//                 //     oUID['CHAR_NAME'] = aProData[i].ASS_CHAR_NAME;
//                 //     oUID['CHAR_VALUE'] = aProData[i].ASS_VALUE;

//                 //     aUID.push(oUID);
//                 // }
//             // }

//             const resolvedValues = {};
//             //Loop for usage of variables
//             for (const item of aProData) {
//                 if(item.ASS_CHAR_NAME == 'TABLE'){
//                     bSuccess = item.ASS_RESULT;
//                     break;
//                 }
//                 const name = item.ASS_CHAR_NAME.trim();
//                 let expr = item.ASS_VALUE.toString().trim();
 
//                 // Replace known variables in the expression
//                 for (const [varName, varVal] of Object.entries(resolvedValues)) {
//                     const regex = new RegExp(`\\b${varName}\\b`, 'g');
//                     expr = expr.replace(regex, varVal);
//                 }
 
//                 // Evaluate only if ASS_RESULT is true
//                 if (item.ASS_RESULT === true) {
//                     try {
//                         const result = eval(expr); // careful with eval!
//                         resolvedValues[name] = result.toString();
//                         item.ASS_VALUE = result.toString(); // update the item too
//                     } catch (e) {
//                         resolvedValues[name] = expr; // fallback to raw expression
//                         item.ASS_VALUE = expr;
//                     }
//                 } else {
//                     item.ASS_VALUE = expr; // still update expression even if not evaluated
//                 }
//             }
               
//                 for (let i = aProData.length - 1; i >= 0; i--) {
//                     if(aProData[i].ASS_CHAR_NAME == 'TABLE'){
//                          bSuccess = aProData[i].ASS_RESULT;
//                          aReturn.push({
//                             "CHAR_VALUE":item_Qty
//                          })
//                         break;
//                     }
//                      aProData[i].ASS_CHAR_NAME =  aProData[i].ASS_CHAR_NAME.replace(/[\n\t ]+/g, "");
//                     //if No ASS_RESULT 
//                     if((aProData[i].ASS_RESULT == undefined || aProData[i].ASS_RESULT == null) && oPChar[aProData[i].ASS_CHAR_NAME]){//check ASS_CHAR_NAME from CP_PROCEDURE_CHAR
//                         //Replacing . with empty
//                         aProData[i].ASS_VALUE = aProData[i].ASS_VALUE.toString().replace(/\.\s*$/, '');
//                         aProData[i].ASS_RESULT = true;
//                     }
//                      if (aProData[i].ASS_RESULT === true) {
//                         const oUID={};
//                          oUID['CHAR_NAME'] = aProData[i].ASS_CHAR_NAME;
//                          oUID['CHAR_VALUE'] =  this.parseValue(aProData[i].ASS_VALUE.toString().trim(),aUID);
//                          if(oUID['CHAR_VALUE']!= ''){
//                         aReturn.push(oUID);
//                          bSuccess = true;
//                          break;
//                          }
                        
//                     }
// }
//         }


//         return{
//             bFlag :bSuccess,
//             Quantity: (() => {
//         const val = Math.round(aReturn[aReturn.length - 1]?.CHAR_VALUE);
//         return isNaN(val) ? 1 : val;
//     })()
//         }

//         function addCondition(aProChar){
//         let inputStr = aProChar.join("");
//     let parts = inputStr.split(",");
//     let keywords = ["EQ", "NOT EQ", "NOT =", "GE", "LE", "SPECIFIED", "NOT SPECIFIED", "NOT IN"];
//     //  Processing
//     parts = parts.map(part => {
//     let trimmed = part.trim();
//     if ( keywords.some(k => trimmed.includes(k))&& !trimmed.includes("IF")) {
//         let idx = part.indexOf("(");
//         if (idx !== -1) {
//             return part.slice(0, idx) + "IF " + part.slice(idx);
//         }
//     }
//     return part;
//     });
//     let resultStr = parts.join(",");
//     return resultStr.split("");
//         }

        
//     }
    static async processProcedure(aPro, aUID, oUniqueChar, oPChar, item_Qty, MAT_PARENT) {


        let aProChar = [];
        var aReturn = [];
        try {
            //Add Trailing dot to end of Dependency if it doesn't exists
            if (aPro.length > 0) {
                if (aPro[aPro.length - 1].LINE.toString().trim().slice(-1) != '.') {
                    aPro[aPro.length - 1].LINE += '.';
                }
            }
            // Break the entire blob into individual characteristics
            aPro.forEach(value => {
                if (value.LINE.charAt(0) === '*') {
                    return;
                }

                for (let i = 0; i < value.LINE.length; i++) {
                    aProChar.push(value.LINE.charAt(i));
                }
            });
            aProChar = addCondition(aProChar);

            let aProData = [];
            let waProData = {};
            let lField = 'ASS_CHAR_NAME';

            for (let i = 0; i < aProChar.length; i++) {
                if (aProChar[i] === ' ' || aProChar[i] === '') {
                    continue;
                };

                switch (lField) {
                    case 'ASS_CHAR_NAME':     // Characteristic

                        if (Object.keys(waProData).length > 0) {
                            //Prevent pushing of duplicates
                            if (aProData.findIndex(p => p.ASS_CHAR_NAME == waProData.ASS_CHAR_NAME && p.ASS_DEPENDENCY == waProData.ASS_DEPENDENCY && p.ASS_OPTION == waProData.ASS_OPTION
                                && p.ASS_VALUE == waProData.ASS_VALUE && p.ASS_RESULT == waProData.ASS_RESULT) == -1) {
                                aProData.push(JSON.parse(JSON.stringify(waProData)));
                            }

                            waProData = {};
                        }

                        // Populate Characteristic Name
                        waProData[lField] = '';
                        //Process variant Table

                        for (let j = i; j < aProChar.length; j++) {
                            if (aProChar[j] === ' ' || aProChar[j] === '') { lField = 'ASS_OPTION'; break; }
                            waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                            aProChar[j] = '';
                        }

                        waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].replace(/\$SELF./g, '');
                        waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].replace(/\$PARENT./g, '');
                        if (waProData['ASS_CHAR_NAME'].trim() == 'TABLE') {
                            waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].trim();
                            lField = 'ASS_DEPENDENCY';
                        }
                        break;
                    case 'ASS_OPTION':     // Equation
                        // Populate Option. It can be = etc...
                        waProData[lField] = '';
                        for (let j = i; j < aProChar.length; j++) {
                            if (aProChar[j] === ' ' || aProChar[j] === '') { lField = 'ASS_VALUE'; break; }
                            waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                            aProChar[j] = '';
                        }
                        break;

                    case 'ASS_VALUE':
                        // Populate Characteristic Value
                        waProData[lField] = '';
                        for (let j = i; j < aProChar.length; j++) {
                            if (aProChar[j] === ',') {

                                waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
                                waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');
                                waProData['ASS_RESULT'] = true;

                                lField = 'ASS_CHAR_NAME';
                                aProChar[j] = '';
                                break;
                            }
                            waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                            waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
                            waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');

                            aProChar[j] = '';
                            if (waProData[lField].substr(waProData[lField].length - 4) === ' IF ') {
                                waProData[lField] = waProData[lField].slice(0, -4);
                                // waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
                                // waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');

                                lField = 'ASS_DEPENDENCY';
                                break;
                            }
                        }



                        // Identify Characteristics
                        console.log(waProData['ASS_VALUE'].length);
                        waProData['ASS_VALUE'] = waProData['ASS_VALUE'].toString().trim();

                        let aValue = [];
                        let lChar = '';
                        let lAlphabet = '';
                        let lIgnore = false;
                        for (let i = 0; i < waProData['ASS_VALUE'].length; i++) {
                            lAlphabet = waProData['ASS_VALUE'].charAt(i);
                            if (lAlphabet === ' ') {
                                continue;
                            }
                            if (lAlphabet === "'") {
                                lIgnore = !lIgnore;
                                continue;
                            }

                            if ((lAlphabet === '*' ||
                                lAlphabet === '/' ||
                                lAlphabet === '+' ||
                                lAlphabet === '-' ||
                                lAlphabet === '(' ||
                                lAlphabet === ')' ||
                                i === waProData['ASS_VALUE'].length - 1) && lIgnore === false) {
                                // Search for Characteristic Value
                                for (let j = 0; j < aUID.length; j++) {
                                    if (aUID[j].CHAR_NAME === lChar) {
                                        let lLenght = i - lChar.length - 1;
                                        waProData['ASS_VALUE'] = waProData['ASS_VALUE'].substr(0, lLenght)
                                            + JSON.parse(JSON.stringify(aUID[j].CHAR_VALUE)) + ' '
                                            + waProData['ASS_VALUE'].substr(i);
                                        let insertedValue = JSON.parse(JSON.stringify(aUID[j].CHAR_VALUE)) + ' ';
                                        let newLength = insertedValue.length;
                                        i = lLenght + newLength;
                                    }
                                    else if (oPChar[lChar]) {//if exists in table
                                        //if initialized in same dependency
                                        if (aProData.length > 0 && lChar == 'R_BOM_ITEM_QTY') {
                                            let aRec = aProData.filter(f => f.ASS_CHAR_NAME == lChar);
                                            if (aRec.length > 0) {
                                                item_Qty = aRec[aRec.length - 1].ASS_VALUE;
                                            }
                                        }
                                        //Setting Values to R_
                                        if (lChar == 'R_LINE_QTY') {//TODO R_LINE_QTY
                                            item_Qty = 1;
                                        }
                                        else if (lChar == 'R_MATERIAL') {//Replacing R_MATERIAL with MAT_PARENT
                                            item_Qty = MAT_PARENT;
                                        }
                                        waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(new RegExp(lChar, "g"), item_Qty);
                                    }
                                }
                                lChar = '';
                                continue;
                            }
                            lChar = lChar + lAlphabet;


                        }

                        // console.log(math.evaluate(waProData['ASS_VALUE']));

                        break;

                    case 'ASS_DEPENDENCY':     // Dependency
                        waProData[lField] = '';

                        let lBrackets = 0;

                        for (let j = i; j < aProChar.length; j++) {
                            if (aProChar[j] === ',' && lBrackets === 0) {
                                lField = 'ASS_CHAR_NAME';
                                aProChar[j] = '';
                                break;
                            }
                            if (aProChar[j] === '(') {
                                lBrackets++;
                            }

                            if (aProChar[j] === ')') {
                                lBrackets--;
                            }
                            waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                            aProChar[j] = '';

                        }

                        let waOD = [];
                        let aOD = [];

                        waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].replace(/\$SELF./g, '');
                        waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].replace(/\$PARENT./g, '');
                        waOD['LINE'] = waProData['ASS_DEPENDENCY'].toString().trim().replace(/\.$/, '');
                        if (waProData['ASS_CHAR_NAME'] == 'TABLE') {
                            waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].toString().replace(' IF ', '').trim();
                            waOD['LINE'] = "TABLE " + waProData['ASS_DEPENDENCY'].replace(/\.$/, '');
                        }
                        aOD.push(waOD);
                        waProData['ASS_RESULT'] = await this.processDependency(aOD, aUID, oUniqueChar, 'P', MAT_PARENT);
                        aProData.push(waProData);

                        break;
                    // case ''://Procedure
                    // let aTableValue = aProChar[i].VALUE.toString().split("(");
                    // let sTableName = aTableValue[0];

                    // let aConditions =[];
                    // let aChar = aTableValue[1].replace(/\)+$/, '').split(',').map(item => item.trim());
                    // if(aChar.length >0){   //Dynamic Query
                    //     let sQuery =`SELECT ROW_ID,COUNT(*) AS COUNT
                    //     FROM "CP_VAR_CONTNT"
                    //     WHERE TABLE_NAME ='${sTableName}'  AND (`;
                    //     for(let t=0; t < aChar.length; t++){
                    //         let sCharName = aChar[t].split("=")[0].trim();
                    //         let sCharValue = aChar[t].split("=")[1].trim();
                    //         if(sCharValue.toString().startsWith("'") == false && oUniqueChar[sCharName]){// Get from oUniqueChar
                    //             sCharValue ='';
                    //             sCharValue = oUniqueChar[sCharName].map(id => `'${id}'`).join(', ');
                    //         }
                    //         else{
                    //             sCharValue = sCharValue;
                    //         }
                    //         if (!aConditions.includes(sCharName)) {
                    //             aConditions.push(sCharName);
                    //           }
                    //         sQuery+= `
                    //         (CHAR_NAME = '${sCharName}' AND CHARACTERISTIC_VALUE IN (${sCharValue}))
                    //         `;
                    //         if(t != aChar.length - 1)  sQuery+= 'OR'
                    //     }
                    //     sQuery+= `)
                    //     GROUP BY ROW_ID
                    //     ORDER BY COUNT DESC`;
                    // let aResponse = await cds.run(sQuery);
                    // //If count >= conditions length, it is success
                    // if(aResponse && aResponse.length >0){
                    //     if(aResponse[0].COUNT >= aConditions.length){
                    //         waProData[i]['RESULT'] = true;
                    //     }
                    // }
                    // }
                    //  break;

                    default:
                        break;
                }

            }
            // Insert the last record
            if (Object.keys(waProData).length > 0) {
                //Prevent pushing of duplicates
                if (aProData.findIndex(p => p.ASS_CHAR_NAME == waProData.ASS_CHAR_NAME && p.ASS_DEPENDENCY == waProData.ASS_DEPENDENCY && p.ASS_OPTION == waProData.ASS_OPTION
                    && p.ASS_VALUE == waProData.ASS_VALUE && p.ASS_RESULT == waProData.ASS_RESULT) == -1) {
                    aProData.push(JSON.parse(JSON.stringify(waProData)));
                }
                waProData = {};
            }

            var bSuccess = false;
            if (aProData.length > 0) {
                // for (let i = 0; i < aProData.length; i++) {
                // if (aProData[i].ASS_RESULT === true) {
                //     const oUID={};
                //     oUID['CHAR_NAME'] = aProData[i].ASS_CHAR_NAME;
                //     oUID['CHAR_VALUE'] = aProData[i].ASS_VALUE;

                //     aUID.push(oUID);
                // }
                // }

                const resolvedValues = {};
                //Loop for usage of variables
                for (const item of aProData) {
                    if (item.ASS_CHAR_NAME == 'TABLE') {
                        bSuccess = item.ASS_RESULT;
                        break;
                    }
                    const name = item.ASS_CHAR_NAME.trim();
                    let expr = item.ASS_VALUE.toString().trim();

                    // Replace known variables in the expression
                    for (const [varName, varVal] of Object.entries(resolvedValues)) {
                        const regex = new RegExp(`\\b${varName}\\b`, 'g');
                        expr = expr.replace(regex, varVal);
                    }

                    // Evaluate only if ASS_RESULT is true
                    if (item.ASS_RESULT === true) {
                        try {
                            const result = eval(expr); // careful with eval!
                            resolvedValues[name] = result.toString();
                            item.ASS_VALUE = result.toString(); // update the item too
                        } catch (e) {
                            resolvedValues[name] = expr; // fallback to raw expression
                            item.ASS_VALUE = expr;
                        }
                    } else {
                        item.ASS_VALUE = expr; // still update expression even if not evaluated
                    }
                }

                for (let i = aProData.length - 1; i >= 0; i--) {
                    if (aProData[i].ASS_CHAR_NAME == 'TABLE') {
                        bSuccess = aProData[i].ASS_RESULT;
                        aReturn.push({
                            "CHAR_VALUE": item_Qty
                        })
                        break;
                    }
                    aProData[i].ASS_CHAR_NAME = aProData[i].ASS_CHAR_NAME.replace(/[\n\t ]+/g, "");
                    //if No ASS_RESULT 
                    if ((aProData[i].ASS_RESULT == undefined || aProData[i].ASS_RESULT == null) && oPChar[aProData[i].ASS_CHAR_NAME]) {//check ASS_CHAR_NAME from CP_PROCEDURE_CHAR
                        //Replacing . with empty
                        aProData[i].ASS_VALUE = aProData[i].ASS_VALUE.toString().replace(/\.\s*$/, '');
                        aProData[i].ASS_RESULT = true;
                    }
                    if (aProData[i].ASS_RESULT === true) {
                        const oUID = {};
                        oUID['CHAR_NAME'] = aProData[i].ASS_CHAR_NAME;
                        oUID['CHAR_VALUE'] = this.parseValue(aProData[i].ASS_VALUE.toString().trim(), aUID);
                        if (oUID['CHAR_VALUE'] != '') {
                            aReturn.push(oUID);
                            bSuccess = true;
                            break;
                        }

                    }
                }
            }
        }
        catch (ex) {
            bSuccess = false,
                aReturn = [];
        }


        return {
            bFlag: bSuccess,
            Quantity: (() => {
                const val = Math.round(aReturn[aReturn.length - 1]?.CHAR_VALUE);
                return isNaN(val) ? 1 : val;
            })()
        }

        function addCondition(aProChar) {
            let inputStr = aProChar.join("");
            let parts = inputStr.split(",");
            let keywords = ["EQ", "NOT EQ", "NOT =", "GE", "LE", "SPECIFIED", "NOT SPECIFIED", "NOT IN"];
            //  Processing
            parts = parts.map(part => {
                let trimmed = part.trim();
                if (keywords.some(k => trimmed.includes(k)) && !trimmed.includes("IF")) {
                    let idx = part.indexOf("(");
                    if (idx !== -1) {
                        return part.slice(0, idx) + "IF " + part.slice(idx);
                    }
                }
                return part;
            });
            let resultStr = parts.join(",");
            return resultStr.split("");
        }


    }

    static  parseValue(val,aUID) {
         const regex = /^[0-9+\-*/().\s]+$/;
         //check if it is a math function
         let sResponse ='';
         try{
            if(eval("Math"+"."+val.toLowerCase())){
                return eval("Math"+"."+val.toLowerCase());
            }
         }
         catch{
           
         }
         
         if (regex.test(val)) {//if its a numeric value
             return Function(`return ${val}`)();
        }
        else{//if its a characteristic from Unique ID
            let aData = aUID.find(u=>u.CHAR_NAME == val);
            if(aData){
                return aData.CHAR_VALUE;
            }
        }
        return sResponse;
            
        }

   /** I_VP-2100 - Functions for M1 Process Execution */
   // Process Dependency for M1 Process
    static async processDependencyM1(aOD, aUID, oUniqueChar, Type, MAT_PARENT, LOCATION) {
        if (aOD[0].LINE.trim().startsWith("NOT SPECIFIED")) {
            const parts = aOD[0].LINE.trim().split(/\s+/);
            const code = parts.slice(2).join(" ");
            aOD[0].LINE = `${code} NOT SPECIFIED`;
        }
        //    console.log(`Unique Id # of Characteristics ${aUID.length}`);
        //     console.log(`Dependency # of lines ${aOD.length}`);

        let aODChar = [];
        // Break the entire blob into individual characteristics
        aOD.forEach(value => {
            if (value.LINE.charAt(0) === '*') {
                return;
            }
            value.LINE.replace("(", " ( ");
            value.LINE.replace(")", " ) ");
            value.LINE.replace("[", " [ ");
            value.LINE.replace("]", " ] ");
            for (let i = 0; i < value.LINE.length; i++) {
                aODChar.push(value.LINE.charAt(i));
            }
        });


        let aODData = [];
        let waODData = {};
        let lLevel = 0;
        let lHighLevel = 0;
        let lField = 'CHAR_NAME';

        for (let i = 0; i < aODChar.length; i++) {
            if (aODChar[i] === ' ' || aODChar[i] === '') {
                continue
            };



            switch (lField) {
                case 'CHAR_NAME':     // Characteristic

                    if (Object.keys(waODData).length > 0) {
                        aODData.push(JSON.parse(JSON.stringify(waODData)));
                        waODData = {};
                    }

                    // Increase Level if Bracket is open                
                    if (aODChar[i] === '(') {
                        lLevel = parseInt(lLevel) + 1;
                        if (lHighLevel < lLevel) {
                            lHighLevel = parseInt(lLevel);
                        }
                        aODChar[i] = '';
                        continue;
                    }

                    // Reduce Level if Bracket is closed                    
                    if (aODChar[i] === ')') {
                        // parseInt(lLevel) = parseInt(lLevel) - 1;
                        lLevel = parseInt(lLevel) - 1;
                        aODChar[i] = '';
                        continue;
                    }

                    waODData['LEVEL'] = parseInt(lLevel);

                    // Populate Characteristic Name
                    waODData[lField] = '';
                    waODData['OPTION'] = '';
                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === ' ' || aODChar[j] === '') {
                            if (waODData[lField] === 'NOT') {
                                waODData['OPTION'] = 'NOT ';
                                waODData[lField] = '';
                            } else {
                                lField = 'OPTION'; break;
                            }

                        }
                        waODData[lField] = waODData[lField] + aODChar[j].toUpperCase();
                        aODChar[j] = '';
                    }
                    // Populate Characteristic Value
                    waODData['CHAR_VAL'] = [];
                    waODData['CHAR_NAME'] = waODData['CHAR_NAME'].trim();
                    //Process variant Table
                    if (waODData['CHAR_NAME'] == 'TABLE') {
                        lField = 'VALUE';
                    }
                    // if(waODData['CHAR_NAME'].trim() == 'TABLE'){
                    //     waODData['CHAR_NAME'] = waODData['CHAR_NAME'].trim();
                    //     lField = 'VALUE';
                    // }
                    for (let j = 0; j < aUID.length; j++) {
                        if (aUID[j].CHAR_NAME === waODData['CHAR_NAME']) {
                            waODData['CHAR_VAL'].push(JSON.parse(JSON.stringify(aUID[j].CHAR_VALUE)));
                            // break;
                        }
                    }
                    break;
                case 'OPTION':     // Equation
                    // Populate Option. It can be =, !=, EQ, NE etc...

                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === ' ' || aODChar[j] === '') {
                            if (waODData[lField] !== 'NOT') {
                                lField = 'VALUE'; break;
                            }
                        }
                        waODData[lField] = waODData[lField] + aODChar[j].toUpperCase();
                        if (aODChar[j] === '=') {
                            aODChar[j] = '';
                            lField = 'VALUE';
                            break;
                        }
                        aODChar[j] = '';
                    }
                    // If the Optio is "SPECIFIED", Value will not be assigned. Go directly to Condition
                    if (waODData[lField] === 'SPECIFIED') {
                        lField = 'CONDITION'
                    }
                    break;

                case 'VALUE':     // Value
                    waODData[lField] = '';
                    let lEndValue = ' ';
                    let lFirst = 0;     // Do not consider the first record as it can be space

                    // Identify Value end alphabet based on start alphabet
                    if (aODChar[i] === "'") { lEndValue = "'" };
                    if (aODChar[i] === '(') { lEndValue = ')' };
                    if (waODData['CHAR_NAME'] == 'TABLE') { lEndValue = ')' };
                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === lEndValue && lFirst === 1) {
                            if (aODChar[j] !== ' ') {
                                waODData[lField] = waODData[lField] + aODChar[j];
                                aODChar[j] = '';
                            }
                            if (waODData['CHAR_NAME'] == 'TABLE') {
                                waODData[lField] = waODData[lField];
                            }
                            else {
                                waODData[lField] = waODData[lField].replace(/'/g, '');
                            }

                            lField = 'CONDITION';
                            break;
                        }
                        lFirst = 1;
                        waODData[lField] = waODData[lField] + aODChar[j];
                        aODChar[j] = '';
                    }
                    break;

                case 'CONDITION':     // Condition
                    // Populate Condition. The values can be AND or OR
                    waODData[lField] = '';
                    for (let j = i; j < aODChar.length; j++) {
                        if (aODChar[j] === ')') {
                            lLevel = parseInt(lLevel) - 1;

                            aODChar[i] = '';
                            continue;
                        }
                        if (aODChar[j] === ' ' || aODChar[j] === '') {
                            if (waODData[lField].toString().trim() !== '') {
                                lField = 'CHAR_NAME';
                                break;
                            }
                        }
                        //if (aODChar[j] === '(' || aODChar[j] === ')') { continue; } 
                        waODData[lField] = waODData[lField] + aODChar[j].toUpperCase();
                        aODChar[j] = '';
                    }
                    break;

                default:
                    break;
            }

        }
        // Insert the last record
        if (Object.keys(waODData).length > 0) {
            aODData.push(JSON.parse(JSON.stringify(waODData)));
            waODData = {};
        }

        // Compare the results
        for (let i = 0; i < aODData.length; i++) {
            // const element = aODData[i];
            aODData[i]['OPTION'] = aODData[i]['OPTION'].trim();
            aODData[i]['RESULT'] = false;
            if (Type == 'P') {//For R_MATERIAL
                if (aODData[i].CHAR_NAME == 'R_MATERIAL') {
                    aODData[i].CHAR_VAL = [];
                    aODData[i].CHAR_VAL.push(MAT_PARENT);
                }
            }
            switch (aODData[i]['OPTION']) {
                case '=':
                case 'EQ':
                    for (let j = 0; j < aODData[i]['CHAR_VAL'].length; j++) {
                        let oCharVal = aODData[i]['CHAR_VAL'][j];
                        if (aODData[i]['VALUE'] === oCharVal) {
                            aODData[i]['RESULT'] = true;
                        }
                    }

                    if (Type == 'P') {
                        if (aODData[i]['VALUE'].toString().includes("(") || aODData[i]['VALUE'].toString().includes(")")) {//check for opening or closing bracket
                            aODData[i]['VALUE'] = aODData[i]['VALUE'].replace(/[()]/g, '')
                            const parsedVal = this.parseValue(aODData[i]['VALUE'].toString().trim(), aUID);
                            if (aODData[i]['CHAR_VAL'].some(v => v == parsedVal)) {
                                aODData[i]['RESULT'] = true;
                            }
                        }
                    }
                    // if (aODData[i]['VALUE'] === aODData[i]['CHAR_VAL']) {
                    //     aODData[i]['RESULT'] = true;
                    // }
                    break;
                case '!=':
                case 'NOT EQ':
                case '<>':
                case 'NE':
                case 'NOT =':
                    for (let index = 0; index < aODData[i]['CHAR_VAL'].length; index++) {
                        const element = aODData[i]['CHAR_VAL'][index];
                        if (aODData[i]['VALUE'] !== element) {
                            aODData[i]['RESULT'] = true;
                        }
                    }
                    // if (aODData[i]['VALUE'] !== aODData[i]['CHAR_VAL']) {
                    //     aODData[i]['RESULT'] = true;
                    // }
                    break;
                case '>=':
                case 'GE':
                case '>':
                    if (aODData[i]['CHAR_VAL'] >= aODData[i]['VALUE']) {
                        aODData[i]['RESULT'] = true;
                    }
                    if (Array.isArray(aODData[i]['CHAR_VAL'])) {
                        aODData[i]['RESULT'] = false;
                        compareArray(aODData[i]['CHAR_VAL'], ((aODData[i]['OPTION'] == 'GE' || aODData[i]['OPTION'] == '>=') ? '>=' : '>'), i)
                    }
                    break;
                case '<=':
                case 'LE':
                case '<':
                    // if (aODData[i]['CHAR_VAL'] <= aODData[i]['VALUE']) {
                    //     aODData[i]['RESULT'] = true;
                    // }
                    if (Array.isArray(aODData[i]['CHAR_VAL'])) {
                        aODData[i]['RESULT'] = false;
                        compareArray(aODData[i]['CHAR_VAL'], ((aODData[i]['OPTION'] == 'LE' || aODData[i]['OPTION'] == '<=') ? '<=' : '<'), i)
                    }
                    break;

                case 'SPECIFIED':
                    if (aODData[i]['VALUE'] !== '') {
                        aODData[i]['RESULT'] = true;
                    }
                    //  if(Type == 'P' ){//check if it exists in Unique ID
                    var oCheck = aUID.find(u => u.CHAR_NAME == aODData[i].CHAR_NAME);
                    if (oCheck && oCheck?.CHAR_VALUE != '' && oCheck?.CHAR_VALUE != 'ZZZZ') {
                        aODData[i]['RESULT'] = true;
                    }
                    else {
                        aODData[i]['RESULT'] = false;
                    }
                    // } 
                    break;
                case 'NOT SPECIFIED':
                    if (aODData[i]['VALUE'] === '') {
                        aODData[i]['RESULT'] = true;
                    }
                    //  if(Type == 'P' ){//check if it exists in Unique ID
                    var oCheck = aUID.find(u => u.CHAR_NAME == aODData[i].CHAR_NAME);
                    if (oCheck && oCheck?.CHAR_VALUE != '' && oCheck?.CHAR_VALUE != 'ZZZZ') {
                        aODData[i]['RESULT'] = false;
                    }
                    else {
                        aODData[i]['RESULT'] = true;
                    }
                    // }
                    break;
                case 'IN':
                case 'NOT IN':
                    let aValue = aODData[i]['VALUE'].split(",")
                    for (let indValue = 0; indValue < aValue.length; indValue++) {
                        aValue[indValue] = aValue[indValue].replace('(', '');
                        aValue[indValue] = aValue[indValue].replace(')', '');
                        aValue[indValue] = aValue[indValue].trim();
                        // if (aValue[indValue] === aODData[i]['CHAR_VAL']) {
                        //     aODData[i]['RESULT'] = true;
                        // }
                        /**
                        for (let index = 0; index < aODData[i]['CHAR_VAL'].length; index++) {
                            const element = aODData[i]['CHAR_VAL'][index];
                            if (aODData[i]['VALUE'] === element) {
                                aODData[i]['RESULT'] = true;
                            }
                        } */
                        for (let index = 0; index < aODData[i]['CHAR_VAL'].length; index++) {
                            const element = aODData[i]['CHAR_VAL'][index];
                            if (aValue[indValue].includes('-')) {
                                aODData[i]['RESULT'] = compareRange(aValue[indValue], element)
                            }
                            else if (aValue[indValue] === element) {
                                aODData[i]['RESULT'] = true;
                            }
                        }
                    }
                    if (aODData[i]['OPTION'] === 'NOT IN') {
                        aODData[i]['RESULT'] = !aODData[i]['RESULT']
                    };

                    break;
                case ''://Table
                case 'NOT':
                    if (aODData[i]['CHAR_NAME'] != 'TABLE') {
                        break;
                    }
                    let aTableValue = aODData[i].VALUE.toString().split("(");
                    let sTableName = aTableValue[0];

                    let aConditions = [];
                    let aChar = aTableValue[1].replace(/\)+$/, '').split(',').map(item => item.trim());
                    if (aChar.length > 0) {   //Dynamic Query
                        let sQuery = `SELECT ROW_ID,COUNT(*) AS COUNT
                    FROM "CP_VAR_CONTNT"
                    WHERE TABLE_NAME ='${sTableName.toString().trim()}'  AND (`;
                        for (let t = 0; t < aChar.length; t++) {
                            let sCharName = aChar[t].split("=")[0].trim();
                            let sCharValue = aChar[t].split("=")[1].trim();
                            if (sCharValue.toString().startsWith("'") == false && aUID.findIndex(f => f.CHAR_NAME == sCharValue) != -1) {// Get from aUID
                                sCharValue = aUID.filter(f => f.CHAR_NAME == sCharValue).map(f => `'${f.CHAR_VALUE.toString().trim()}'`).join(', ');
                            }
                            // if(sCharValue.toString().startsWith("'") == false && oUniqueChar[sCharValue]){// Get from oUniqueChar
                            //     // sCharValue ='';
                            //     sCharValue = oUniqueChar[sCharValue].map(id => `'${id}'`).join(', ');
                            // }
                            else {
                                sCharValue = sCharValue;
                            }
                            if (!aConditions.includes(sCharName)) {
                                aConditions.push(sCharName);
                            }
                            if (sCharValue.toString().startsWith("'") == false) {
                                sCharValue = `'${sCharValue}'`
                            }

                            sQuery += `
                        (CHAR_NAME = '${sCharName}' AND CHARACTERISTIC_VALUE IN (${sCharValue}))
                        `;


                            if (t != aChar.length - 1) sQuery += 'OR'
                        }
                        sQuery += `)
                    GROUP BY ROW_ID
                    ORDER BY COUNT DESC`;
                        let aResponse = await cds.run(sQuery);
                        //If count >= conditions length, it is success
                        if (aResponse && aResponse.length > 0) {
                            if (aResponse[0].COUNT >= aConditions.length) {
                                aODData[i]['RESULT'] = true;
                            }
                        }
                        if (aODData[i]['OPTION'] == 'NOT') {
                            aODData[i]['RESULT'] = !aODData[i]['RESULT'];
                        }
                    }
                    break;
            }
        }

        // Get all of them to same level to get a single result
        for (let indHLevel = lHighLevel; indHLevel >= 0; indHLevel--) {

            for (let indLevel = 0; indLevel < aODData.length; indLevel++) {
                if (aODData[indLevel].LEVEL === indHLevel) {
                    let lNextRec = indLevel + 1;
                    if (lNextRec < aODData.length) {
                        if (aODData[indLevel].LEVEL === aODData[lNextRec].LEVEL) {
                            if (aODData[indLevel].CONDITION.toString().trim() === 'AND') {
                                if (aODData[indLevel].RESULT === false
                                    || aODData[lNextRec].RESULT === false) {
                                    aODData[lNextRec].RESULT = false;
                                }
                            }
                            if (aODData[indLevel].CONDITION.toString().trim() === 'OR') {
                                if (aODData[indLevel].RESULT === true
                                    || aODData[lNextRec].RESULT === true) {
                                    aODData[lNextRec].RESULT = true;
                                }
                            }

                            aODData[indLevel] = [];


                        } else {
                            if (aODData[indLevel].LEVEL >= 0) {
                                aODData[indLevel].LEVEL = parseInt(aODData[indLevel].LEVEL) - 1;
                            }
                        }
                    }
                    else {
                        if (aODData[indLevel].LEVEL >= 0) {
                            aODData[indLevel].LEVEL = parseInt(aODData[indLevel].LEVEL) - 1;
                        }
                    }
                }

            }
            // for (let indLevel = 0; indLevel < aODData.length; indLevel++) {
            //     if (Object.keys(aODData[indLevel]).length === 0) {
            //         aODData.splice(indLevel, 1);
            //     }
            // }

        }


        // console.log(aODData);

        // Update UID OD Tables for M1 Process
        let bFlag = false;

        if (aODData.length > 0) {
            bFlag = await this.updateUIDODStatus(aOD, aUID, aODData, LOCATION);
            return aODData[aODData.length - 1].RESULT;
        } else {
            return false;
        }
        function compareArray(aData, operator, mainIndex) {
            for (let index = 0; index < aData.length; index++) {
                const element = aData[index];
                if (Function("a", "b", `return Number(a) ${operator} Number(b);`)(element, aODData[mainIndex]['VALUE'])) {
                    aODData[mainIndex]['RESULT'] = true;
                }
            }
        }

        function compareRange(val, element) {
            let bResult = false;
            let [min, max] = val.split('-').map(v => parseFloat(v.trim()));
            let numElement = parseFloat(element);
            if (!isNaN(min) && !isNaN(max) && !isNaN(numElement)) {
                if (numElement >= min && numElement <= max) {
                    bResult = true;
                }
            }
            return bResult;
        }

    }

     static async processProcedureM1(aPro, aUID, oUniqueChar, oPChar, item_Qty, MAT_PARENT, LOCATION) {


        let aProChar = [];
        var aReturn = [];
        try {
            //Add Trailing dot to end of Dependency if it doesn't exists
            if (aPro.length > 0) {
                if (aPro[aPro.length - 1].LINE.toString().trim().slice(-1) != '.') {
                    aPro[aPro.length - 1].LINE += '.';
                }
            }
            // Break the entire blob into individual characteristics
            aPro.forEach(value => {
                if (value.LINE.charAt(0) === '*') {
                    return;
                }

                for (let i = 0; i < value.LINE.length; i++) {
                    aProChar.push(value.LINE.charAt(i));
                }
            });
            aProChar = addCondition(aProChar);

            let aProData = [];
            let waProData = {};
            let lField = 'ASS_CHAR_NAME';

            for (let i = 0; i < aProChar.length; i++) {
                if (aProChar[i] === ' ' || aProChar[i] === '') {
                    continue;
                };

                switch (lField) {
                    case 'ASS_CHAR_NAME':     // Characteristic

                        if (Object.keys(waProData).length > 0) {
                            //Prevent pushing of duplicates
                            if (aProData.findIndex(p => p.ASS_CHAR_NAME == waProData.ASS_CHAR_NAME && p.ASS_DEPENDENCY == waProData.ASS_DEPENDENCY && p.ASS_OPTION == waProData.ASS_OPTION
                                && p.ASS_VALUE == waProData.ASS_VALUE && p.ASS_RESULT == waProData.ASS_RESULT) == -1) {
                                aProData.push(JSON.parse(JSON.stringify(waProData)));
                            }

                            waProData = {};
                        }

                        // Populate Characteristic Name
                        waProData[lField] = '';
                        //Process variant Table

                        for (let j = i; j < aProChar.length; j++) {
                            if (aProChar[j] === ' ' || aProChar[j] === '') { lField = 'ASS_OPTION'; break; }
                            waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                            aProChar[j] = '';
                        }

                        waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].replace(/\$SELF./g, '');
                        waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].replace(/\$PARENT./g, '');
                        if (waProData['ASS_CHAR_NAME'].trim() == 'TABLE') {
                            waProData['ASS_CHAR_NAME'] = waProData['ASS_CHAR_NAME'].trim();
                            lField = 'ASS_DEPENDENCY';
                        }
                        break;
                    case 'ASS_OPTION':     // Equation
                        // Populate Option. It can be = etc...
                        waProData[lField] = '';
                        for (let j = i; j < aProChar.length; j++) {
                            if (aProChar[j] === ' ' || aProChar[j] === '') { lField = 'ASS_VALUE'; break; }
                            waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                            aProChar[j] = '';
                        }
                        break;

                    case 'ASS_VALUE':
                        // Populate Characteristic Value
                        waProData[lField] = '';
                        for (let j = i; j < aProChar.length; j++) {
                            if (aProChar[j] === ',') {

                                waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
                                waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');
                                waProData['ASS_RESULT'] = true;

                                lField = 'ASS_CHAR_NAME';
                                aProChar[j] = '';
                                break;
                            }
                            waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                            waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
                            waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');

                            aProChar[j] = '';
                            if (waProData[lField].substr(waProData[lField].length - 4) === ' IF ') {
                                waProData[lField] = waProData[lField].slice(0, -4);
                                // waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$SELF./g, '');
                                // waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(/\$PARENT./g, '');

                                lField = 'ASS_DEPENDENCY';
                                break;
                            }
                        }



                        // Identify Characteristics
                        console.log(waProData['ASS_VALUE'].length);
                        waProData['ASS_VALUE'] = waProData['ASS_VALUE'].toString().trim();

                        let aValue = [];
                        let lChar = '';
                        let lAlphabet = '';
                        let lIgnore = false;
                        for (let i = 0; i < waProData['ASS_VALUE'].length; i++) {
                            lAlphabet = waProData['ASS_VALUE'].charAt(i);
                            if (lAlphabet === ' ') {
                                continue;
                            }
                            if (lAlphabet === "'") {
                                lIgnore = !lIgnore;
                                continue;
                            }

                            if ((lAlphabet === '*' ||
                                lAlphabet === '/' ||
                                lAlphabet === '+' ||
                                lAlphabet === '-' ||
                                lAlphabet === '(' ||
                                lAlphabet === ')' ||
                                i === waProData['ASS_VALUE'].length - 1) && lIgnore === false) {
                                // Search for Characteristic Value
                                for (let j = 0; j < aUID.length; j++) {
                                    if (aUID[j].CHAR_NAME === lChar) {
                                        let lLenght = i - lChar.length - 1;
                                        waProData['ASS_VALUE'] = waProData['ASS_VALUE'].substr(0, lLenght)
                                            + JSON.parse(JSON.stringify(aUID[j].CHAR_VALUE)) + ' '
                                            + waProData['ASS_VALUE'].substr(i);
                                        let insertedValue = JSON.parse(JSON.stringify(aUID[j].CHAR_VALUE)) + ' ';
                                        let newLength = insertedValue.length;
                                        i = lLenght + newLength;
                                    }
                                    else if (oPChar[lChar]) {//if exists in table
                                        //if initialized in same dependency
                                        if (aProData.length > 0 && lChar == 'R_BOM_ITEM_QTY') {
                                            let aRec = aProData.filter(f => f.ASS_CHAR_NAME == lChar);
                                            if (aRec.length > 0) {
                                                item_Qty = aRec[aRec.length - 1].ASS_VALUE;
                                            }
                                        }
                                        //Setting Values to R_
                                        if (lChar == 'R_LINE_QTY') {//TODO R_LINE_QTY
                                            item_Qty = 1;
                                        }
                                        else if (lChar == 'R_MATERIAL') {//Replacing R_MATERIAL with MAT_PARENT
                                            item_Qty = MAT_PARENT;
                                        }
                                        waProData['ASS_VALUE'] = waProData['ASS_VALUE'].replace(new RegExp(lChar, "g"), item_Qty);
                                    }
                                }
                                lChar = '';
                                continue;
                            }
                            lChar = lChar + lAlphabet;


                        }

                        // console.log(math.evaluate(waProData['ASS_VALUE']));

                        break;

                    case 'ASS_DEPENDENCY':     // Dependency
                        waProData[lField] = '';

                        let lBrackets = 0;

                        for (let j = i; j < aProChar.length; j++) {
                            if (aProChar[j] === ',' && lBrackets === 0) {
                                lField = 'ASS_CHAR_NAME';
                                aProChar[j] = '';
                                break;
                            }
                            if (aProChar[j] === '(') {
                                lBrackets++;
                            }

                            if (aProChar[j] === ')') {
                                lBrackets--;
                            }
                            waProData[lField] = waProData[lField] + aProChar[j].toUpperCase();
                            aProChar[j] = '';

                        }

                        let waOD = [];
                        let aOD = [];

                        waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].replace(/\$SELF./g, '');
                        waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].replace(/\$PARENT./g, '');
                        waOD['LINE'] = waProData['ASS_DEPENDENCY'].toString().trim().replace(/\.$/, '');
                        if (waProData['ASS_CHAR_NAME'] == 'TABLE') {
                            waProData['ASS_DEPENDENCY'] = waProData['ASS_DEPENDENCY'].toString().replace(' IF ', '').trim();
                            waOD['LINE'] = "TABLE " + waProData['ASS_DEPENDENCY'].replace(/\.$/, '');
                        }
                        aOD.push(waOD);
                        waProData['ASS_RESULT'] = await this.processDependency(aOD, aUID, oUniqueChar, 'P', MAT_PARENT);
                        aProData.push(waProData);

                        break;
                   
                    default:
                        break;
                }

            }
            // Insert the last record
            if (Object.keys(waProData).length > 0) {
                //Prevent pushing of duplicates
                if (aProData.findIndex(p => p.ASS_CHAR_NAME == waProData.ASS_CHAR_NAME && p.ASS_DEPENDENCY == waProData.ASS_DEPENDENCY && p.ASS_OPTION == waProData.ASS_OPTION
                    && p.ASS_VALUE == waProData.ASS_VALUE && p.ASS_RESULT == waProData.ASS_RESULT) == -1) {
                    aProData.push(JSON.parse(JSON.stringify(waProData)));
                }
                waProData = {};
            }

            var bSuccess = false;
            if (aProData.length > 0) {
                // for (let i = 0; i < aProData.length; i++) {
                // if (aProData[i].ASS_RESULT === true) {
                //     const oUID={};
                //     oUID['CHAR_NAME'] = aProData[i].ASS_CHAR_NAME;
                //     oUID['CHAR_VALUE'] = aProData[i].ASS_VALUE;

                //     aUID.push(oUID);
                // }
                // }

                const resolvedValues = {};
                //Loop for usage of variables
                for (const item of aProData) {
                    if (item.ASS_CHAR_NAME == 'TABLE') {
                        bSuccess = item.ASS_RESULT;
                        break;
                    }
                    const name = item.ASS_CHAR_NAME.trim();
                    let expr = item.ASS_VALUE.toString().trim();

                    // Replace known variables in the expression
                    for (const [varName, varVal] of Object.entries(resolvedValues)) {
                        const regex = new RegExp(`\\b${varName}\\b`, 'g');
                        expr = expr.replace(regex, varVal);
                    }

                    // Evaluate only if ASS_RESULT is true
                    if (item.ASS_RESULT === true) {
                        try {
                            const result = eval(expr); // careful with eval!
                            resolvedValues[name] = result.toString();
                            item.ASS_VALUE = result.toString(); // update the item too
                        } catch (e) {
                            resolvedValues[name] = expr; // fallback to raw expression
                            item.ASS_VALUE = expr;
                        }
                    } else {
                        item.ASS_VALUE = expr; // still update expression even if not evaluated
                    }
                }

                for (let i = aProData.length - 1; i >= 0; i--) {
                    if (aProData[i].ASS_CHAR_NAME == 'TABLE') {
                        bSuccess = aProData[i].ASS_RESULT;
                        aReturn.push({
                            "CHAR_VALUE": item_Qty
                        })
                        break;
                    }
                    aProData[i].ASS_CHAR_NAME = aProData[i].ASS_CHAR_NAME.replace(/[\n\t ]+/g, "");
                    //if No ASS_RESULT 
                    if ((aProData[i].ASS_RESULT == undefined || aProData[i].ASS_RESULT == null) && oPChar[aProData[i].ASS_CHAR_NAME]) {//check ASS_CHAR_NAME from CP_PROCEDURE_CHAR
                        //Replacing . with empty
                        aProData[i].ASS_VALUE = aProData[i].ASS_VALUE.toString().replace(/\.\s*$/, '');
                        aProData[i].ASS_RESULT = true;
                    }
                    if (aProData[i].ASS_RESULT === true) {
                        const oUID = {};
                        oUID['CHAR_NAME'] = aProData[i].ASS_CHAR_NAME;
                        oUID['CHAR_VALUE'] = this.parseValue(aProData[i].ASS_VALUE.toString().trim(), aUID);
                        if (oUID['CHAR_VALUE'] != '') {
                            aReturn.push(oUID);
                            bSuccess = true;
                            break;
                        }

                    }
                }
            }
        }
        catch (ex) {
            bSuccess = false,
                aReturn = [];
        }

         bResult = await this.updateUIDODStatus(aPro, aUID, aProData, LOCATION);
        return {
            bFlag: bSuccess,
            Quantity: (() => {
                const val = Math.round(aReturn[aReturn.length - 1]?.CHAR_VALUE);
                return isNaN(val) ? 1 : val;
            })()
        }

        function addCondition(aProChar) {
            let inputStr = aProChar.join("");
            let parts = inputStr.split(",");
            let keywords = ["EQ", "NOT EQ", "NOT =", "GE", "LE", "SPECIFIED", "NOT SPECIFIED", "NOT IN"];
            //  Processing
            parts = parts.map(part => {
                let trimmed = part.trim();
                if (keywords.some(k => trimmed.includes(k)) && !trimmed.includes("IF")) {
                    let idx = part.indexOf("(");
                    if (idx !== -1) {
                        return part.slice(0, idx) + "IF " + part.slice(idx);
                    }
                }
                return part;
            });
            let resultStr = parts.join(",");
            return resultStr.split("");
        }


    }

     static async updateUIDODStatus(aOD, aUID, aODData, LOCATION) {
        // let oUIDOD = {}, oUIDODCHAR = {};
        // let aUIDODCHAR = [], aUIDOD = [];


        const resolveStatus = (entry) =>
            (entry.ASS_RESULT !== undefined ? entry.ASS_RESULT : entry.RESULT) === true ? 'S' : 'F';

        const baseFields = {
            LOCATION_ID: LOCATION,
            REF_PROID: aUID[0].REF_PRODID,
            UNIQUE_ID: aUID[0].UNIQUE_ID,
            OBJ_DEP: aOD[0].DEPENDENCY,
        };

        const oUIDOD = { ...baseFields, STATUS: resolveStatus(aODData[aODData.length - 1]) };

        const charNumByName = new Map(aUID.map(item => [item.CHAR_NAME, item.CHAR_NUM]));
        const aUIDODCHAR = aODData.map(entry => ({
            ...baseFields,
            STATUS: resolveStatus(entry),
            CHAR_NUM: charNumByName.get(entry.CHAR_NAME),
        }));

        try {
            await Promise.all([
                cds.run(UPSERT.into('CP_UNIQUEID_OD').entries(oUIDOD)),
                cds.run({ UPSERT: { into: { ref: ['CP_UNIQUEID_OD_CHAR'] }, entries: aUIDODCHAR } }),
            ]);
        } catch (e) {
            console.error('updateUIDODStatus DB error:', e);
        }

        return true;
    }
    

}

module.exports = ProcessObjects;