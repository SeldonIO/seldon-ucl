import traceback
import pandas as pd
import numpy as np
import dcs
import re

def fillDown(df, columnFrom, columnTo, method):
	for columnIndex in range(columnFrom, columnTo + 1):
		print("filling down ", df.columns[columnIndex], " using ", method)
		if method == 'pad':
			df[df.columns[columnIndex]].fillna(method='pad', inplace=True)
		else:
			df[df.columns[columnIndex]].fillna(method='bfill', inplace=True)

def invalidValuesInDataFrame(df):
	toReturn = {}
	for column in df.columns:
		if "__original__b0YgCpYKkWwuJKypnOEZeDJM8__original__" not in column:
			nullBooleanMask = df[column].isnull()
			toReturn[column] = {}
			if nullBooleanMask.sum() > 0:
				toReturn[column]["hasInvalidValues"] = True
				toReturn[column]["invalidIndices"] = [index for (index, isNull) in nullBooleanMask.iteritems() if isNull]
			else:
				toReturn[column]["hasInvalidValues"] = False
	return toReturn

def fillByInterpolation(df, columnIndex, method, order):
	method = method.lower()
	if method == 'polynomial' or method == 'spline':
		df[df.columns[columnIndex]].interpolate(method=method, order=order, inplace=True)
	else:
		df[df.columns[columnIndex]].interpolate(method=method, inplace=True)

def fillWithCustomValue(df, columnIndex, newValue):
	if (df[df.columns[columnIndex]].dtype == np.float64):
		try:
			newValue = float(newValue)
		except ValueError:
			pass
	elif (df[df.columns[columnIndex]].dtype == np.int64):
		try:
			newValue = int(float(newValue))
		except ValueError:
			pass
	df[df.columns[columnIndex]].fillna(value=newValue, inplace=True)

def fillWithAverage(df, columnIndex, metric):
	if metric == "mean":
		average = df[df.columns[columnIndex]].mean()
	elif metric == "median":
		average = df[df.columns[columnIndex]].median()
	elif metric == "mode":
		analysis = dcs.analyze.genericAnalysis(df[df.columns[columnIndex]])
		if "mode" in analysis:
			average = analysis["mode"][0]
		else:
			return False
	else:
		return False
	df[df.columns[columnIndex]].fillna(value=average, inplace=True)

def normalize(df, columnIndex, rangeFrom=0, rangeTo=1):
	if (df[df.columns[columnIndex]].max() - df[df.columns[columnIndex]].min()) != 0:
		df[df.columns[columnIndex]] = rangeFrom + ((df[df.columns[columnIndex]] - df[df.columns[columnIndex]].min()) * (rangeTo - rangeFrom)) / (df[df.columns[columnIndex]].max() - df[df.columns[columnIndex]].min())

def standardize(df, columnIndex):
	if df[df.columns[columnIndex]].std() != 0:
		df[df.columns[columnIndex]] = (df[df.columns[columnIndex]] - df[df.columns[columnIndex]].mean()) / df[df.columns[columnIndex]].std()

def deleteRowsWithNA(df, columnIndex):
	df.dropna(subset=[df.columns[columnIndex]], inplace=True)
	df.reset_index(drop=True, inplace=True)

def findReplace(df, columnIndex, toReplace, replaceWith, matchRegex):
	for i in range(0, len(toReplace)):
		df[df.columns[columnIndex]].replace(to_replace=str(toReplace[i]), value=str(replaceWith[i]), regex=matchRegex, inplace=True)
		
		try:
			df[df.columns[columnIndex]].replace(to_replace=float(toReplace[i]), value=replaceWith[i], regex=matchRegex, inplace=True)
		except ValueError:
			pass

def generateDummies(df, columnIndex, inplace):
	dummies = pd.get_dummies(df[df.columns[columnIndex]])
	dummiesCount = len(dummies.columns)
	
	for i in range(0, dummiesCount):
		df.insert(columnIndex+i+1, str(df.columns[columnIndex])+"_"+str(dummies.columns[i]), dummies[dummies.columns[i]], allow_duplicates=True)
	'''
	df = pd.concat([df, dummies], axis=1)
	cols = df.columns.tolist()
	cols = cols[:columnIndex+1] + cols[-dummiesCount:] + cols[columnIndex+1:-dummiesCount]
	df = df[cols]
	'''
	if inplace:
		df.drop(df.columns[columnIndex], axis=1, inplace=True)

def insertDuplicateColumn(df, columnIndex):
	df.insert(columnIndex + 1, str(df.columns[columnIndex]) + "_copy", df.iloc[:, columnIndex], allow_duplicates=True)

def splitColumn(df, columnIndex, delimiter, regex=False):
	tempDF = df.copy()
	tempDF[tempDF.columns[columnIndex]].replace(to_replace=np.nan, value="", inplace=True)
	if regex:
		newColumns = tempDF[tempDF.columns[columnIndex]].apply(lambda x: pd.Series(re.split(delimiter, x)))
	else:
		newColumns = tempDF[tempDF.columns[columnIndex]].apply(lambda x: pd.Series(x.split(delimiter)))
	newColumnsCount = len(newColumns.columns)
	for i in range(0, newColumnsCount):
		newColumns[newColumns.columns[i]].replace(to_replace="", value=np.nan, inplace=True)
		df.insert(columnIndex+i+1, str(df.columns[columnIndex])+"_"+str(newColumns.columns[i]), newColumns[newColumns.columns[i]], allow_duplicates=True)

def combineColumns(df, columnHeadings, seperator="", newName="merged_column", insertIndex=0):
	if len(columnHeadings) < 2:
		raise ValueError('dcs.clean.combineColumns must be provided at least two columns to combine')

	newColumn = df[columnHeadings].apply(lambda x: seperator.join(x.astype(str)[x.astype(str) != "nan"]), axis=1)
	'''
	newColumn = df[columnHeadings[0]].astype(str)
	newColumn = newColumn.apply(lambda x: (x + seperator) if x != "nan" else "")
	for i in range(1, len(columnHeadings)):
		nextValue = df[columnHeadings[i]].astype(str)
		nextValue = nextValue.apply(lambda x: (x + seperator) if x != "nan" else "")
		newColumn += nextValue
	'''
	df.insert(insertIndex, newName, newColumn, allow_duplicates=True)

def discretize(df, columnIndex, cutMode, numberOfBins):
	if (cutMode == "discretization"):
		if type(numberOfBins) is not int:
			numberOfBins = numberOfBins.split(',')
			numberOfBins = map(float, numberOfBins)
		df[df.columns[columnIndex]] = pd.cut(df[df.columns[columnIndex]], numberOfBins).astype(str)
	elif (cutMode == "quantiling"):
		if type(numberOfBins) is not int:
			numberOfBins = numberOfBins.split(',')
			numberOfBins = map(float, numberOfBins)
		df[df.columns[columnIndex]] = pd.qcut(df[df.columns[columnIndex]], numberOfBins).astype(str)
	else:
		return False

	# Replace 'nan' strings with np.nan
	df[df.columns[columnIndex]].replace(to_replace="nan", value=np.nan, inplace=True)

# HIGHWAY TO THE DANGER ZONE
def executeCommand(df, command):
	exec command