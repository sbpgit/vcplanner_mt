import os
import nlopt
from numpy import *
import json
from flask import Flask, jsonify, request
from flask_restful import Resource, Api

from cfenv import AppEnv
from hdbcli import dbapi


from nloptutils import *
from sympy import *


from scipy.optimize import minimize
from scipy.optimize import rosen_der

#app = Flask(__name__)
# creating the flask app
app = Flask(__name__)
# creating an API object
api = Api(app)

env = AppEnv()

# hana_service = 'hana'
# hana = env.get_service(label=hana_service)
# print("host ", hana.credentials['host'], "port ", hana.credentials['port'])
# print("user ", hana.credentials['user'], "password ", hana.credentials['password'])
# print("schema ", hana.credentials['schema'])


cf_port = os.getenv("PORT")
print("cf_port ", cf_port)

port = int(os.environ.get('PORT', 3000))

# @app.route('/')
# def hello():
#     if hana is None:
#         return "Can't connect to HANA service '{}' – check service name?".format(hana_service)
#     else:
#         # conn = dbapi.connect(address=hana.credentials['host'],
#         #                      port=int(hana.credentials['port']),
#         #                      user=hana.credentials['user'],
#         #                      password=hana.credentials['password'],
#         #                      encrypt='true',
#         #                      sslTrustStore=hana.credentials['certificate'])
#         conn = dbapi.connect(address=hana.credentials['host'],
#                              port=int(hana.credentials['port']),
#                              user=hana.credentials['user'],
#                              password=hana.credentials['password'],
#                              currentSchema=hana.credentials['schema'],
#                              encrypt='true',
#                              sslTrustStore=hana.credentials['certificate'])

#         cursor = conn.cursor()
#         # cursor.execute("select CURRENT_UTCTIMESTAMP from DUMMY")
#         cursor.execute("SELECT COUNT(*) AS COUNTS FROM CP_OD_MODEL_VERSIONS")
#         ro = cursor.fetchone()
#         cursor.close()
#         conn.close()

#         # return "Current time is: " + str(ro["CURRENT_UTCTIMESTAMP"])
#         return "NUMBER OF MODELS: " + str(ro["COUNTS"])

# making a class for a particular resource
# the get, post methods correspond to get and post requests
# they are automatically mapped by flask_restful.
# other methods include put, delete, etc.
class Test(Resource):
  
    # corresponds to the GET request.
    # this function is called whenever there
    # is a GET request for this resource
    def get(self):
  
        return jsonify({'message': 'hello world'})
  
    # Corresponds to POST request
    def post(self):          
        data = request.get_json()     # status code
        print("post data ", data)
        # return jsonify({'data': data}), 201
        response = jsonify(data)
        response.status_code = 201 # or 400 or whatever
        return response  
  
# another resource to calculate the square of a number
class Square(Resource):
  
    def get(self, num):
  
        return jsonify({'square': num**2})
def myfunc(x, grad):
    if grad.size > 0:
        grad[0] = 0.0
        grad[1] = 0.5 / sqrt(x[1])
    return sqrt(x[1])

def myconstraint(x, grad, a, b):
    if grad.size > 0:
        grad[0] = 3 * a * (a*x[0] + b)**2
        grad[1] = -1.0
    return (a*x[0] + b)**3 - x[1]

class NLOpt(Resource):

    def post(self):
        data = request.get_json(force=True, silent=True)     # status code
        constraints = data['Constraints']
        ALGORITHM = data['Algorithm']
        FACTOR = data['OptFactor']
        # print("Constraints Length" , len(constraints))
        print("Constraints" , constraints)
        minValuesList = []
        optimizedVariablesList = []
        objectiveFunc = ""
        numConstraints = len(constraints)
        targetQty = 0
        pid_sum_minimum = 0
        for index in range(numConstraints):
            # print("CONTSRAINT_TYPE [",index,"]", constraints[index]['CONSTRAINT_TYPE'])
            # print("CONSTRAINT_DATA [",index,"]", constraints[index]['CONSTRAINT_DATA'])
            constraintType = constraints[index]['CONSTRAINT_TYPE']
            constraintData = constraints[index]['CONSTRAINT_DATA']


            if(constraintType == 'OBJECTIVE'):
                print("constraintType ", constraintType)
                print("constraintData ", constraintData)
                variablesList = []
                derivativeValues = []
                lowerBoundList = []
                upperBoundList = []
                optimizedValuesList = []

                numVariables = len(constraintData) - 1
                for dataIdx in range(numVariables):
                    variablesList.append(constraintData[dataIdx]['VALUE'])
                    derivativeValues.append(constraintData[dataIdx]['DERIVATIVE'])
                    lowerBoundList.append(0)
                    minValuesList.append(0)
                    optimizedValuesList.append(0)
                    optimizedVariablesList.append(constraintData[dataIdx]['VARIABLE'])
                # print("variablesList Values",variablesList)
                # print("derivativeValues ",derivativeValues)

                # print("lowerBoundList Values",lowerBoundList)
                # print("minValuesList Values",minValuesList)
                    
                # objectiveFunc_name = 'objective_' + str(len(variablesList))
                objectiveFunc_name = 'objective';

                # objectiveFunc = objective_mapping[objectiveFunc_name]
                objectiveFunc = getObjectiveName(objectiveFunc_name)
                # print("objectiveFunc",objectiveFunc) 
                setGradients(variablesList)
                initOptimizedValues(optimizedValuesList)
                # opt = nlopt.opt(nlopt.LD_SLSQP, numVariables) #SUPPORTED (SEQUENTIAL LEAST SQUARES QUADRATIC PROGRAMMING)
                
                # opt = nlopt.opt(nlopt.LN_COBYLA, numVariables)  #SUPPORTED    - NOT RECOMMENDED DUE HIGH NON OPTIMIZED CHARVALS ALSO NEEDS INITIAL STEP SIZE
                # opt = nlopt.opt(nlopt.GN_ISRES, numVariables) #SUPPORTED - NOT RECOMMENDED AS OUR CONSTRAINTS DO NOT HAVE UPPER BOUNDS
                # opt = nlopt.opt(nlopt.GN_DIRECT_L, numVariables) # DOES NOT SUPPORT ALL CONSTRAINTS - LOCALLY BIASED     
                # opt = nlopt.opt(nlopt.LN_BOBYQA, numVariables) # NOT RECOMMENDED AS OBJECTIVE FUNCTION HAS to BE TWICE DIFFERNTIABLE for not performing poorly
                # opt = nlopt.opt(nlopt.LN_NEWUOA_BOUND, numVariables) # NOT RECOMMENDED - ValueError: invalid algorithm for constraints
                # opt = nlopt.opt(nlopt.LD_LBFGS, numVariables) # NOT RECOMMENDED - ValueError: invalid algorithm for constraints
                # opt = nlopt.opt(nlopt.LD_TNEWTON, numVariables)  # NOT RECOMMENDED - ValueError: invalid algorithm for constraints

                # opt = nlopt.opt(nlopt.LD_AUGLAG, numVariables)
                if (ALGORITHM == 'AUGLAG'):
                    opt = nlopt.opt(nlopt.LD_AUGLAG, numVariables)
                    lopt = nlopt.opt(nlopt.LD_SLSQP, numVariables) 
                    opt.set_local_optimizer(lopt)
                elif ( ALGORITHM == 'AUGLAG_EQ'):
                    opt = nlopt.opt(nlopt.LD_AUGLAG_EQ, numVariables)
                    lopt = nlopt.opt(nlopt.LD_SLSQP, numVariables) 
                    opt.set_local_optimizer(lopt)
                elif ( ALGORITHM == 'SLSQP'):
                    opt = nlopt.opt(nlopt.LD_SLSQP, numVariables) #SUPPORTED (SEQUENTIAL LEAST SQUARES QUADRATIC PROGRAMMING) 

                # opt.set_lower_bounds(lowerBoundList)
                opt.set_min_objective(objectiveFunc)

            elif( (constraintType == 'EQUALITY') or (constraintType == 'INEQUALITY') or 
                  (constraintType == 'INEQUALITY_MINIMUM') ):
                variablesList = []
                derivativesList = []
                numVariables = len(constraintData)
                numDerivatives = len(constraintData) - 1
                for dataIdx in range(numVariables):
                    variablesList.append(constraintData[dataIdx]['VALUE'])
                    if (dataIdx < numDerivatives):
                        derivativesList.append(constraintData[dataIdx]['DERIVATIVE'])
                
                # constraintFunc_name = 'myconstraint_' + str(len(derivativesList))
                constraintFunc_name = 'myconstraint';

                constraintFunc = getConstraintName(constraintFunc_name)

                print("constraintFunc",constraintFunc) 

                if(constraintType == 'INEQUALITY'):
                    if(variablesList[numVariables-1] != 0):
                        # print("index ", index, "constraintType ",constraintType, "numVariables", numVariables, "variablesList", variablesList)
                        # print("index ", index, "constraintType ",constraintType, "numDerivatives", numDerivatives, "derivativesList", derivativesList)
                        setVarVals(variablesList)
                        setDerVals(derivativesList)
                        opt.add_inequality_constraint(lambda x,grad: constraintFunc(x,grad), 1e-10)
                        # opt.add_inequality_constraint(lambda x,grad: constraintFunc(x,grad,variablesList,derivativesList), 1e-10)
                elif(constraintType == 'INEQUALITY_MINIMUM'):
                    # print("index ", index, "constraintType ",constraintType, "numVariables", numVariables, "variablesList", variablesList)
                    # print("index ", index, "constraintType ",constraintType, "numDerivatives", numDerivatives, "derivativesList", derivativesList)
                    setVarVals(variablesList)
                    setDerVals(derivativesList)
                    opt.add_inequality_constraint(lambda x,grad: constraintFunc(x,grad), 1e-10)
                    # opt.add_inequality_constraint(lambda x,grad: constraintFunc(x,grad,variablesList,derivativesList), 1e-10)
                elif(constraintType == 'EQUALITY'):
                    # print("index ", index, "constraintType ",constraintType, "numVariables", numVariables, "variablesList", variablesList)
                    # print("index ", index, "constraintType ",constraintType, "numDerivatives", numDerivatives, "derivativesList", derivativesList)
                    setVarVals(variablesList)
                    setDerVals(derivativesList)
                    opt.add_equality_constraint(lambda x,grad: constraintFunc(x,grad), 1e-10)
                    # opt.add_equality_constraint(lambda x,grad: constraintFunc(x,grad,variablesList,derivativesList), 1e-10)
                    targetQty = variablesList[len(variablesList)-1]
                if(constraintType == 'INEQUALITY_MINIMUM'):
                    cdVariables = len(constraintData)
                    for index in range(cdVariables):
                        varName = constraintData[index]['VARIABLE']
                        varLength = len(varName)
                        value = constraintData[index]['VALUE']
                        # print("varName", varName, "varLength ", varLength)
                        # print("varName[:1]", varName[:1], "value", value, "length ", cdVariables)
                        # last VARIABLE with index = (cdVariables - 1) is variable 'K' - which holds the minimum value 
                        if( (value == 1) and (index < cdVariables-1)):
                            minValuesList[index] = constraintData[cdVariables-1]['VALUE']
                            if (minValuesList[index] < 0):
                                minValuesList[index] = 0
                            # print("index", index, "minValuesList ", minValuesList)
                            pid_sum_minimum = pid_sum_minimum +  minValuesList[index]
                            
        numVars = len(minValuesList)
        print("minValuesList", minValuesList)
        # print("minValuesList[0]", minValuesList[0])
        print("targetQty ", targetQty, "abs(targetQty)", abs(targetQty), "pid_sum_minimum", pid_sum_minimum, "OptFactor", FACTOR )
        bounds = []
        for varIdx in range(numVars):
            # minValuesList[varIdx] = FACTOR*(abs(targetQty)/pid_sum_minimum)*minValuesList[varIdx]
            temp = 0
            lowerBoundList[varIdx] = minValuesList[varIdx]
            if (pid_sum_minimum <= abs(targetQty) ):
                minValuesList[varIdx] = float(FACTOR)*abs(float(targetQty))/float(pid_sum_minimum)*minValuesList[varIdx]
                # minValuesList[varIdx] = FACTOR*(abs(targetQty)/pid_sum_minimum)*minValuesList[varIdx]
                # minValuesList[varIdx] = (abs(targetQty)/pid_sum_minimum)*minValuesList[varIdx]
            else:
                minValuesList[varIdx] = float(FACTOR)*float(pid_sum_minimum)/float(abs(targetQty))*minValuesList[varIdx]
                # minValuesList[varIdx] = FACTOR*(pid_sum_minimum/abs(targetQty))*minValuesList[varIdx]
                # minValuesList[varIdx] = (pid_sum_minimum/abs(targetQty))*minValuesList[varIdx]
            if(lowerBoundList[varIdx] > minValuesList[varIdx]):
                lowerBoundList[varIdx] = minValuesList[varIdx]
            temp_bound = (lowerBoundList[varIdx],temp)
            bounds.append(temp_bound)
        print("minValuesList ", minValuesList)
        print("lowerBoundList ", lowerBoundList)
        # print("bounds ", bounds)
        
        opt.set_lower_bounds(lowerBoundList)

        opt.set_xtol_rel(1e-4)
        if ( (ALGORITHM == 'AUGLAG') or ( ALGORITHM == 'AUGLAG_EQ')):
            lopt.set_xtol_rel(1e-4)


        # opt.set_maxeval(15)
        # lopt.set_maxeval(15)

        print(" Tolerance Set")

        # x = opt.optimize(minValuesList)

        try:
            x = opt.optimize(minValuesList)
        except nlopt.RoundoffLimited:
            x = getOptimizedVals()
            print("optimized Values ", x)

        print(" Optimization Set")

        min = opt.last_optimum_value()
        print("Min optimum Value called", min)
        if(min == inf):
            min = 0

        # print("optimum at ", x[0], x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],x[9],x[10],x[11],x[12],x[13],x[14],x[15])
        print("optimum at ",x)
        print("Min value = ", min)
        print("result code = ", opt.last_optimize_result())
        print("found Minima after evaluations\n", count);
        print("result code = ", opt.last_optimize_result())
        # response_list = []
        optimized_values = {}
        for optIndex in range(len(optimizedVariablesList)):
            varId = optimizedVariablesList[optIndex]
            optimized_values[varId] = x[optIndex]
        optimized_values['MINVAL'] = min
        optimized_values['RESULT_CODE'] = opt.last_optimize_result()
        # response_list.append(optimized_values)
        json_data = json.dumps(optimized_values)
        print("RESPONSE DATA", json_data)
        return(json_data)

        # response = jsonify({"x[0]": x[0], "x[1]": x[1], "x[2]": x[2], "x[3]" : x[3], "minimum ": min, "result code " : opt.last_optimize_result()})
        # response.status_code = 201 # or 400 or whatever
        # return response


    def post_scipi(self):
        data = request.get_json(force=True, silent=True)     # status code
        constraints = data['Constraints']
        ALGORITHM = data['Algorithm']
        FACTOR = data['OptFactor']
        # print("Constraints Length" , len(constraints))
        print("Constraints" , constraints)
        minValuesList = []
        optimizedVariablesList = []
        objectiveFunc = ""
        numConstraints = len(constraints)
        targetQty = 0
        pid_sum_minimum = 0
        AllConstraints = []
        for index in range(numConstraints):
            # print("CONTSRAINT_TYPE [",index,"]", constraints[index]['CONSTRAINT_TYPE'])
            # print("CONSTRAINT_DATA [",index,"]", constraints[index]['CONSTRAINT_DATA'])
            constraintType = constraints[index]['CONSTRAINT_TYPE']
            constraintData = constraints[index]['CONSTRAINT_DATA']


            if(constraintType == 'OBJECTIVE'):
                print("constraintType ", constraintType)
                print("constraintData ", constraintData)
                variablesList = []
                optimizedVariablesList = []
                derivativeValues = []
                lowerBoundList = []
                upperBoundList = []
                optimizedValuesList = []

                numVariables = len(constraintData) - 1
                for dataIdx in range(numVariables):
                    variablesList.append(constraintData[dataIdx]['VALUE'])
                    derivativeValues.append(constraintData[dataIdx]['DERIVATIVE'])
                    lowerBoundList.append(0)
                    minValuesList.append(0)
                    optimizedValuesList.append(0)
                    optimizedVariablesList.append(constraintData[dataIdx]['VARIABLE'])
                print("constraintType = OBJECTIVE", "variablesList Values",variablesList)
                print("constraintType = OBJECTIVE", "derivativeValues ",derivativeValues)

                # print("lowerBoundList Values",lowerBoundList)
                # print("minValuesList Values",minValuesList)
                    
                # objectiveFunc_name = 'objective_' + str(len(variablesList))
                objectiveFunc_name = 'objective';

                # objectiveFunc = objective_mapping[objectiveFunc_name]
                objectiveFunc = getObjectiveName(objectiveFunc_name)
                # print("objectiveFunc",objectiveFunc) 
                setGradients(variablesList)
                initOptimizedValues(optimizedValuesList)

            elif( (constraintType == 'EQUALITY') or (constraintType == 'INEQUALITY') or 
                  (constraintType == 'INEQUALITY_MINIMUM') ):
                variablesList = []
                derivativesList = []
                numVariables = len(constraintData)
                numDerivatives = len(constraintData) - 1
                for dataIdx in range(numVariables):
                    variablesList.append(constraintData[dataIdx]['VALUE'])
                    if (dataIdx < numDerivatives):
                        derivativesList.append(constraintData[dataIdx]['DERIVATIVE'])
                
                # constraintFunc_name = 'myconstraint_' + str(len(derivativesList))
                constraintFunc_name = 'myconstraint';

                constraintFunc = getConstraintName(constraintFunc_name)

                print("constraintFunc",constraintFunc) 

                if(constraintType == 'INEQUALITY'):
                    if(variablesList[numVariables-1] != 0):
                        # print("index ", index, "constraintType ",constraintType, "numVariables", numVariables, "variablesList", variablesList)
                        # print("index ", index, "constraintType ",constraintType, "numDerivatives", numDerivatives, "derivativesList", derivativesList)
                        setVarVals(variablesList)
                        setDerVals(derivativesList)
                        constraint = {'type': 'ineq', 'fun':constraintFunc}
                        AllConstraints.append(constraint)
                elif(constraintType == 'INEQUALITY_MINIMUM'):
                    # print("index ", index, "constraintType ",constraintType, "numVariables", numVariables, "variablesList", variablesList)
                    # print("index ", index, "constraintType ",constraintType, "numDerivatives", numDerivatives, "derivativesList", derivativesList)
                    setVarVals(variablesList)
                    setDerVals(derivativesList)
                    constraint = {'type': 'ineq', 'fun':constraintFunc}
                    AllConstraints.append(constraint)
                elif(constraintType == 'EQUALITY'):
                    # print("index ", index, "constraintType ",constraintType, "numVariables", numVariables, "variablesList", variablesList)
                    # print("index ", index, "constraintType ",constraintType, "numDerivatives", numDerivatives, "derivativesList", derivativesList)
                    setVarVals(variablesList)
                    setDerVals(derivativesList)
                    constraint = {'type': 'eq', 'fun':constraintFunc}
                    AllConstraints.append(constraint)                    
                    targetQty = variablesList[len(variablesList)-1]
                if(constraintType == 'INEQUALITY_MINIMUM'):
                    cdVariables = len(constraintData)
                    for index in range(cdVariables):
                        varName = constraintData[index]['VARIABLE']
                        varLength = len(varName)
                        value = constraintData[index]['VALUE']
                        # print("varName", varName, "varLength ", varLength)
                        # print("varName[:1]", varName[:1], "value", value, "length ", cdVariables)
                        # last VARIABLE with index = (cdVariables - 1) is variable 'K' - which holds the minimum value 
                        if( (value == 1) and (index < cdVariables-1)):
                            minValuesList[index] = constraintData[cdVariables-1]['VALUE']
                            if (minValuesList[index] < 0):
                                minValuesList[index] = 0
                            # print("index", index, "minValuesList ", minValuesList)
                            pid_sum_minimum = pid_sum_minimum +  minValuesList[index]

        numVars = len(minValuesList)
        print("targetQty ", targetQty, "pid_sum_minimum", pid_sum_minimum, "OptFactor", FACTOR )
        initValuesList = []
        bounds = []
        for varIdx in range(numVars):
            temp = 0
            lowerBoundList[varIdx] = FACTOR*minValuesList[varIdx]
            if (pid_sum_minimum <= abs(targetQty) ):
                # minValuesList[varIdx] = (abs(targetQty)/pid_sum_minimum)*minValuesList[varIdx]
                temp = (abs(targetQty)/pid_sum_minimum)*minValuesList[varIdx]
            else:
                # minValuesList[varIdx] = (pid_sum_minimum/abs(targetQty))*minValuesList[varIdx]
                temp = (pid_sum_minimum/abs(targetQty))*minValuesList[varIdx]
            initValuesList.append(temp)
            # initValuesList.append(FACTOR*temp)
            temp_bound = (lowerBoundList[varIdx],temp)
            bounds.append(temp_bound)
        print("minValuesList ", minValuesList)
        print("lowerBoundList ", lowerBoundList)
        print("initValuesList ", initValuesList)
        print("bounds ", bounds)
        # result = minimize(objective_fcn,initValuesList,method='SLSQP',jac=rosen_der,bounds=bounds,constraints=constraint)

        result = minimize(objective_fcn,initValuesList,method='SLSQP',bounds=bounds,constraints=constraint)
        print(" Optimization Set")

        print(result)
        

        
        optimized_values = {}
        for optIndex in range(len(optimizedVariablesList)):
            varId = optimizedVariablesList[optIndex]
            optimized_values[varId] = result.x[optIndex]
        optimized_values['MINVAL'] = result.fun
        optimized_values['RESULT_CODE'] = result.status
        # response_list.append(optimized_values)
        json_data = json.dumps(optimized_values)
        print("RESPONSE DATA", json_data)
        return(json_data)

        # response = jsonify({"x[0]": x[0], "x[1]": x[1], "x[2]": x[2], "x[3]" : x[3], "minimum ": min, "result code " : opt.last_optimize_result()})
        # response.status_code = 201 # or 400 or whatever
        # return response


    def post_squared_objective(self):
        data = request.get_json(force=True, silent=True)     # status code
        constraints = data['Constraints']
        ALGORITHM = data['Algorithm']
        FACTOR = data['OptFactor']
        # print("Constraints Length" , len(constraints))
        print("Constraints" , constraints)
        # minValuesList = []
        optimizedVariablesList = []
        objectiveFunc = ""
        numConstraints = len(constraints)
        targetQty = 0
        pid_sum_minimum = 0
        objectiveFunction = 0
        globalObjective = 0
        AllConstraints = []
        for index in range(numConstraints):
            # print("CONTSRAINT_TYPE [",index,"]", constraints[index]['CONSTRAINT_TYPE'])
            # print("CONSTRAINT_DATA [",index,"]", constraints[index]['CONSTRAINT_DATA'])
            constraintType = constraints[index]['CONSTRAINT_TYPE']
            constraintData = constraints[index]['CONSTRAINT_DATA']

            if(constraintType == 'OBJECTIVE'):
                print("constraintType ", constraintType)
                print("constraintData ", constraintData)
                variablesList = []
                optimizedVariablesList = []
                derivativeValues = []
                lowerBoundList = []
                upperBoundList = []
                optimizedValuesList = []
                minValuesList = []
                charvalObj = 0

                numVariables = len(constraintData) - 1
                for dataIdx in range(numVariables):
                    variablesList.append(constraintData[dataIdx]['VALUE'])
                    derivativeValues.append(constraintData[dataIdx]['DERIVATIVE'])
                    lowerBoundList.append(0)
                    minValuesList.append(0)
                    optimizedValuesList.append(0)
                    optimizedVariablesList.append(constraintData[dataIdx]['VARIABLE'])

                for dataIdx in range(numVariables+1):                    
                    if(constraintData[dataIdx]['VARIABLE'] == 'K'):
                        charvalObj = charvalObj + constraintData[dataIdx]['VALUE']
                        print("charvalObj ", charvalObj)
                    elif((constraintData[dataIdx]['VALUE'] == 1)):
                        charvalObj = charvalObj + Symbol(constraintData[dataIdx]['VARIABLE'])
                        # print("charvalObj ", charvalObj)

                charvalObj = charvalObj * charvalObj
                print("charvalObj squared ", charvalObj)

                globalObjective = globalObjective + charvalObj
               

            elif( (constraintType == 'EQUALITY') or (constraintType == 'INEQUALITY') or 
                  (constraintType == 'INEQUALITY_MINIMUM') ):
                variablesList = []
                derivativesList = []
                numVariables = len(constraintData)
                numDerivatives = len(constraintData) - 1
                for dataIdx in range(numVariables):
                    variablesList.append(constraintData[dataIdx]['VALUE'])
                    if (dataIdx < numDerivatives):
                        derivativesList.append(constraintData[dataIdx]['DERIVATIVE'])
                
                # constraintFunc_name = 'myconstraint_' + str(len(derivativesList))
                constraintFunc_name = 'myconstraint'

                constraintFunc = getConstraintName(constraintFunc_name)

                print("constraintFunc",constraintFunc) 

                if(constraintType == 'INEQUALITY'):
                    if(variablesList[numVariables-1] != 0):
                        # print("index ", index, "constraintType ",constraintType, "numVariables", numVariables, "variablesList", variablesList)
                        # print("index ", index, "constraintType ",constraintType, "numDerivatives", numDerivatives, "derivativesList", derivativesList)
                        setVarVals(variablesList)
                        setDerVals(derivativesList)
                        constraint = {'type': 'ineq', 'fun':constraintFunc}
                        AllConstraints.append(constraint)
                elif(constraintType == 'INEQUALITY_MINIMUM'):
                    # print("index ", index, "constraintType ",constraintType, "numVariables", numVariables, "variablesList", variablesList)
                    # print("index ", index, "constraintType ",constraintType, "numDerivatives", numDerivatives, "derivativesList", derivativesList)
                    setVarVals(variablesList)
                    setDerVals(derivativesList)
                    constraint = {'type': 'ineq', 'fun':constraintFunc}
                    AllConstraints.append(constraint)
                elif(constraintType == 'EQUALITY'):
                    print("globalObjective ", globalObjective)
                    print("constraintType ", constraintType)
                    x = [0]*(numVariables-1)
                    for varIdx in range(numVariables-1):
                        if(varIdx == 0):
                            x[0] = Symbol('x[0]')
                            P1 = Symbol('P1')
                            globalObjective = globalObjective.replace(P1,x[0])
                            # print("varIdx ", varIdx, "globalObjective ", globalObjective)
                        if(varIdx == 1):
                            x[1] = Symbol('x[1]')
                            P2 = Symbol('P2')
                            globalObjective = globalObjective.replace(P2,x[1])
                        if(varIdx == 2):
                            x[2] = Symbol('x[2]')
                            P3 = Symbol('P3')
                            globalObjective = globalObjective.replace(P3,x[2])
                        if(varIdx == 3):
                            x[3] = Symbol('x[3]')
                            P4 = Symbol('P4')
                            globalObjective = globalObjective.replace(P4,x[3])
                        if(varIdx == 4):
                            x[4] = Symbol('x[4]')
                            P5 = Symbol('P5')
                            globalObjective = globalObjective.replace(P5,x[4])
                        if(varIdx == 5):
                            x[5] = Symbol('x[5]')
                            P6 = Symbol('P6')
                            globalObjective = globalObjective.replace(P6,x[5])
                        if(varIdx == 6):
                            x[6] = Symbol('x[6]')
                            P7 = Symbol('P7')
                            globalObjective = globalObjective.replace(P7,x[6])
                        if(varIdx == 7):
                            x[7] = Symbol('x[7]')
                            P8 = Symbol('P8')
                            globalObjective = globalObjective.replace(P8,x[7])
                        if(varIdx == 8):
                            x[8] = Symbol('x[8]')
                            P9 = Symbol('P9')
                            globalObjective = globalObjective.replace(P9,x[8])
                        if(varIdx == 9):
                            x[9] = Symbol('x[9]')
                            P10 = Symbol('P10')
                            globalObjective = globalObjective.replace(P10,x[9])
                        if(varIdx == 10):
                            x[10] = Symbol('x[10]')
                            P11 = Symbol('P11')
                            globalObjective = globalObjective.replace(P11,x[10])
                    print("globalObjective ", globalObjective)

                    derivatives = [0]*(numVariables-1)
                    for derIdx in range(len(derivatives)):
                        derivatives[derIdx]  = globalObjective.diff(x[derIdx])
                        # derivatives[derIdx] = (derivatives[derIdx]).evalf()                   
                    print("After Replace globalObjective ", globalObjective)                 
                    print("derivatives ", derivatives)
                    objectiveFunc_name = 'objective'

                    # objectiveFunc_name = 'objective_' + str(len(variablesList))

                    # objectiveFunc = objective_mapping[objectiveFunc_name]
                    objectiveFunc = getObjectiveName(objectiveFunc_name)
                    # print("objectiveFunc",objectiveFunc) 
                    # setGradients(variablesList)
                    setObjective(globalObjective)
                    setGradients(derivatives)
                    resetCount()
                    initOptimizedValues(optimizedValuesList)




                    # print("index ", index, "constraintType ",constraintType, "numVariables", numVariables, "variablesList", variablesList)
                    # print("index ", index, "constraintType ",constraintType, "numDerivatives", numDerivatives, "derivativesList", derivativesList)
                    setVarVals(variablesList)
                    setDerVals(derivativesList)
                    constraint = {'type': 'eq', 'fun':constraintFunc}
                    AllConstraints.append(constraint)          
                    targetQty = variablesList[len(variablesList)-1]
                if(constraintType == 'INEQUALITY_MINIMUM'):
                    cdVariables = len(constraintData)
                    for index in range(cdVariables):
                        varName = constraintData[index]['VARIABLE']
                        varLength = len(varName)
                        value = constraintData[index]['VALUE']
                        # print("varName", varName, "varLength ", varLength)
                        # print("varName[:1]", varName[:1], "value", value, "length ", cdVariables)
                        # last VARIABLE with index = (cdVariables - 1) is variable 'K' - which holds the minimum value 
                        if( (value == 1) and (index < cdVariables-1)):
                            minValuesList[index] = constraintData[cdVariables-1]['VALUE']
                            if (minValuesList[index] < 0):
                                minValuesList[index] = 0
                            print("index", index, "minValuesList ", minValuesList)
                            pid_sum_minimum = pid_sum_minimum +  minValuesList[index]

        numVars = len(minValuesList)
        print("targetQty ", targetQty, "pid_sum_minimum", pid_sum_minimum, "OptFactor", FACTOR )
        initValuesList = []
        bounds = []
        for varIdx in range(numVars):
            temp = 0
            lowerBoundList[varIdx] = FACTOR*minValuesList[varIdx]
            if (pid_sum_minimum <= abs(targetQty) ):
                # minValuesList[varIdx] = (abs(targetQty)/pid_sum_minimum)*minValuesList[varIdx]
                temp = (abs(targetQty)/pid_sum_minimum)*minValuesList[varIdx]
            else:
                # minValuesList[varIdx] = (pid_sum_minimum/abs(targetQty))*minValuesList[varIdx]
                temp = (pid_sum_minimum/abs(targetQty))*minValuesList[varIdx]
            # initValuesList.append(FACTOR*temp)
            initValuesList.append(FACTOR*temp)
            temp_bound = (lowerBoundList[varIdx],temp)
            bounds.append(temp_bound)
        print("minValuesList ", minValuesList)
        print("lowerBoundList ", lowerBoundList)
        print("initValuesList ", initValuesList)
        print("bounds ", bounds)
        # result = minimize(objective_fcn,initValuesList,method='SLSQP',jac=rosen_der,bounds=bounds,constraints=constraint)

        result = minimize(objective_fcn,initValuesList,method='SLSQP',bounds=bounds,constraints=constraint)
        print(" Optimization Set")

        print(result)
        
    
        optimized_values = {}
        for optIndex in range(len(optimizedVariablesList)):
            varId = optimizedVariablesList[optIndex]
            print("optInde", optIndex, "varId ", varId)
            optimized_values[varId] = result.x[optIndex]
        optimized_values['MINVAL'] = result.fun
        optimized_values['RESULT_CODE'] = result.status
        # response_list.append(optimized_values)
        json_data = json.dumps(optimized_values)
        print("RESPONSE DATA", json_data)
        return(json_data)


        # response = jsonify({"x[0]": x[0], "x[1]": x[1], "x[2]": x[2], "x[3]" : x[3], "minimum ": min, "result code " : opt.last_optimize_result()})
        # response.status_code = 201 # or 400 or whatever
        # return response

# adding the defined resources along with their corresponding urls
api.add_resource(Test, '/test')
api.add_resource(Square, '/square/<int:num>')
api.add_resource(NLOpt, '/nlopt')



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)