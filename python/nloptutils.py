import nlopt
from numpy import *
# from server import gradients
from sympy import *
import regex as re
count = 0
# gradients = setGradients.gradients

gradients = []
g_varVals = []
g_derVals = []
g_optimizedVals = []
g_objective = "";

def resetCount():
    global count
    count = 0
    print("reset count to ", count)
    return count

def getObjectiveName(objectiveFunc_name):
    return objective_mapping[objectiveFunc_name]

def getConstraintName(constraintFunc_name):
    return constraint_mapping[constraintFunc_name]

def setGradients(_gradients):
    global gradients
    gradients = _gradients
    # print("setGradients gradients", gradients)
    return gradients

def setVarVals(_varVals):
    global g_varVals
    g_varVals = _varVals
    # print("setvariableVals g_varVals", g_varVals)
    return g_varVals

def setDerVals(_derVals):
    global g_derVals
    g_derVals = _derVals
    # print("setvariableVals g_derVals", g_derVals)
    return g_derVals

def initOptimizedValues(_optimizedValues):
    global g_optimizedVals
    g_optimizedVals = _optimizedValues
    return g_optimizedVals

def setOptimizedValues(_optimizedValues):
    global g_optimizedVals
    g_optimizedVals = _optimizedValues
    print("g_optimizedVals", g_optimizedVals)
    return g_optimizedVals

def getOptimizedVals():
    global g_optimizedVals
    return g_optimizedVals   

def setObjective(_objective):
    global g_objective
    g_objective = _objective;
    print("function call setObjective ", g_objective)
    return g_objective

def getObjective():
    global g_objective
    # print("function call getObjective ", g_objective)
    return g_objective

def objective_fcn(x):
    global count
    global gradients
    count = count + 1;
    index = 0
    setOptimizedValues(x)
    objective = 0
    print("objective gradients size", len(gradients), "gradients ", gradients)

    for i in range(len(x)):
        objective = objective + gradients[i]*x[i]
        # objective = objective + float(gradients[i])*float(x[i])
    print("objective_fcn objective x size", len(x), "x = ", x)
    print("objective_fcn objective value", objective)
    return (objective)

def myconstraint_fcn(x):
    index = 0
    global g_varvals
    global g_derVals
    constraintVal = 0
    for i in range(len(g_derVals)):
        constraintVal = constraintVal + (g_derVals[i])*(x[i])
        # constraintVal = constraintVal + float(g_derVals[i])*float(x[i])
    print("myconstraint g_dervals size", len(g_derVals))
    return (constraintVal + g_varVals[len(g_varVals)-1])

# def objective_fcn(y, grad):
def objective_fcn_sum_squared(y):
    global count
    global gradients
    global g_objective
    count = count + 1;
    index = 0
    numVariables = len(y)
    x = [0]*numVariables

    # if grad.size > 0:       
    #     # print("gradients[0]", gradients[0])
    #     for idx in range(numVariables):
    #         x[idx] = Symbol('x[' + str(idx) + ']')

    #     temp = 0
    #     for gradIdx in range(numVariables):
    #         for idx in range(numVariables):
    #             temp = temp + y[idx]*(gradients[gradIdx].diff(x[idx]))
    #         tokens = re.split(r'[+-]+', str(gradients[gradIdx]))
    #         constant = float(tokens[len(tokens)-1])
    #         grad[gradIdx] = temp + constant
    #         # print("temp ", temp, "constant ", constant, "grad[", gradIdx, "] ", grad[gradIdx])       
    setOptimizedValues(y)
    # print("g_objective ", g_objective)
    objective =  getObjective();
    # print("get global objective ", getObjective())
    # temp = 0
    for objIdx in range(numVariables):
        x[objIdx] = Symbol('x[' + str(objIdx) + ']')
        objective = objective.replace(x[objIdx], y[objIdx])
        # print("updated objective ", objective)

    print("count ", count, "final objective ", objective)

    return (float(objective))
 
# Supports upto 100 variables, Beyond 100 Variables needs to be further enhanced by adding objective_xx functions
def objective(x, grad):
    global count
    global gradients
    count = count + 1;
    index = 0
    if grad.size > 0:
        print("grad ", grad)
        for i in grad:
            grad[index] = gradients[index]
            index = index + 1
    setOptimizedValues(x)
    print("objective x ",x)
    print("objective grad ",grad)
    objective = 0
    for i in range(len(x)):
        # objective = objective + (gradients[i])*(x[i])
        objective = objective + float(gradients[i])*float(x[i])
    print("objective grad size ", len(grad), "x size", len(x))
    print("objective value", objective)
    return (objective)

def myconstraint(x, grad):
    index = 0
    global g_varvals
    global g_derVals
    if grad.size > 0:
        for i in grad:
            grad[index] = g_derVals[index]
            index = index + 1
    constraintVal = 0
    for i in range(len(g_derVals)):
          constraintVal = constraintVal + (g_derVals[i])*float(x[i])
        # constraintVal = constraintVal + float(g_derVals[i])*float(x[i])
    print("myconstraint grad size ", len(grad), "g_dervals size", len(g_derVals))
    return (constraintVal + g_varVals[len(g_varVals)-1])

objective_mapping = {
    "objective":objective
}
constraint_mapping = {
        "myconstraint":myconstraint

}