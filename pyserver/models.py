# -*- coding: utf-8 -*-
"""
Created on Wed Apr 11 20:00:31 2018

@author: Darek
"""
def classificationModels():

    models = {}
    
    ######################################
    # Logistic Regression
    ######################################
    from sklearn.linear_model import LogisticRegression
    models['Logistic Classification'] = LogisticRegression()
    
    ######################################
    # Random Forest
    ######################################
    from sklearn.ensemble import RandomForestClassifier
    models['Random Forests Classification'] = RandomForestClassifier()
    
    ######################################
    # K Nearest Neighbors
    ######################################
    from sklearn.neighbors import KNeighborsClassifier
    models['K Nearest Neighbors Classification'] = KNeighborsClassifier()
    
    ######################################
    # AdaBoost
    ######################################
    from sklearn.ensemble import AdaBoostClassifier
    from sklearn.tree import DecisionTreeClassifier
    models['Ada Boost Classification'] = AdaBoostClassifier()
    
    ######################################
    # X Gradient Boosting
    ######################################
    from xgboost import XGBClassifier
    models['X Gradient Boosting Classification'] = XGBClassifier()
    
    ######################################
    # Neural Networks: MultiLayer Perceptron
    ######################################
    from sklearn.neural_network import MLPClassifier
    models['MultiLayer Perceptron Classification'] = MLPClassifier()
    
    return models

def regressionModels():

    models = {}
    
    ######################################
    # Linear Regression
    ######################################
    from sklearn.linear_model import LinearRegression
    models['Linear Regression'] = {}
    models['Linear Regression'] = LinearRegression()
    
    ######################################
    # Random Forest
    ######################################
    from sklearn.ensemble import RandomForestRegressor
    models['Random Forests Regression'] = RandomForestRegressor()
    
    ######################################
    # K Nearest Neighbors
    ######################################
    from sklearn.neighbors import KNeighborsRegressor
    models['K Nearest Neighbors Regression'] = KNeighborsRegressor()
    
    ######################################
    # AdaBoost
    ######################################
    from sklearn.ensemble import AdaBoostRegressor
    from sklearn.tree import DecisionTreeRegressor
    models['AdaBoost Regression'] = AdaBoostRegressor()
    
    ######################################
    # X Gradient Boosting
    ######################################
    from xgboost import XGBRegressor
    models['X Gradient Boosting Regression'] = XGBRegressor()
    
    ######################################
    # Neural Networks: MultiLayer Perceptron
    ######################################
    from sklearn.neural_network import MLPRegressor
    models['MultiLayer Perceptron Regression'] = MLPRegressor()
    
    return models