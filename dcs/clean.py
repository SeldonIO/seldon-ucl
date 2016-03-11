import traceback
import pandas as pd
import numpy as np
import dcs
import re

def clusterForColumn(df, colIndex, **kwargs):
	return pd.DataFrame(None)

def cleanClusteredValuesWithIdentifier(df, identifier, **kwargs):
	return None

def rowsWithValuesOutsideRangeInColumn(df, colIndex, **kwargs):
	return None

def fillDown(df, columnFrom, columnTo, method):
	try:
		for columnIndex in range(columnFrom, columnTo + 1):
			print("filling down ", df.columns[columnIndex], " using ", method)
			if method == 'pad':
				df[df.columns[columnIndex]].fillna(method='pad', inplace=True)
			else:
				df[df.columns[columnIndex]].fillna(method='bfill', inplace=True)
		return True
	except:
		pass
	return False

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
	try:
		method = method.lower()
		if method == 'polynomial' or method == 'spline':
			df[df.columns[columnIndex]].interpolate(method=method, order=order, inplace=True)
		else:
			df[df.columns[columnIndex]].interpolate(method=method, inplace=True)
		return True
	except Exception:
		print(traceback.format_exc())
	
	return False

def fillWithCustomValue(df, columnIndex, newValue):
	try:
		if (df[df.columns[columnIndex]].dtype == np.float64):
			try:
				newValue = float(newValue)
			except ValueError:
				pass
		elif (df[df.columns[columnIndex]].dtype == np.int64):
			try:
				newValue = int(newValue)
			except ValueError:
				pass
		df[df.columns[columnIndex]].fillna(value=newValue, inplace=True)
		return True
	except Exception, e:
		print(str(e))
		
	return False

def fillWithAverage(df, columnIndex, metric):
	try:
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
		return True
	except Exception, e:
		print(str(e))
		
	return False

def normalize(df, columnIndex, rangeFrom=0, rangeTo=1):
	try:
		if (df[df.columns[columnIndex]].max() - df[df.columns[columnIndex]].min()) != 0:
			df[df.columns[columnIndex]] = rangeFrom + ((df[df.columns[columnIndex]] - df[df.columns[columnIndex]].min()) * (rangeTo - rangeFrom)) / (df[df.columns[columnIndex]].max() - df[df.columns[columnIndex]].min())
		return True
	except Exception, e:
		print(str(e))
		
	return False

def standardize(df, columnIndex):
	try:
		if df[df.columns[columnIndex]].std() != 0:
			df[df.columns[columnIndex]] = (df[df.columns[columnIndex]] - df[df.columns[columnIndex]].mean()) / df[df.columns[columnIndex]].std()
		return True
	except Exception, e:
		print(str(e))
		
	return False

def deleteRowsWithNA(df, columnIndex):
	try:
		df.dropna(subset=[df.columns[columnIndex]], inplace=True)
		df.reset_index(drop=True, inplace=True)
		return True
	except Exception, e:
		print(str(e))
		
	return False

def findReplace(df, columnIndex, toReplace, replaceWith, matchRegex):
	try:
		for i in range(0, len(toReplace)):
			df[df.columns[columnIndex]].replace(to_replace=str(toReplace[i]), value=str(replaceWith[i]), regex=matchRegex, inplace=True)
			try:
				df[df.columns[columnIndex]].replace(to_replace=float(toReplace[i]), value=replaceWith[i], regex=matchRegex, inplace=True)
			except ValueError:
				pass
		return True
	except Exception, e:
		print(str(e))
		
	return False

def generateDummies(df, columnIndex, inplace):
	try:
		dummies = pd.get_dummies(df[df.columns[columnIndex]])
		dummiesCount = len(dummies.columns)
		print(dummiesCount)
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
		return True
	except Exception:
		print(traceback.format_exc())
		
	return False

def insertDuplicateColumn(df, columnIndex):
	try:
		copy = df[df.columns[columnIndex]]
		df.insert(columnIndex+1, str(df.columns[columnIndex])+"_copy", copy, allow_duplicates=True)
		return True
	except Exception, e:
		print(str(e))
		
	return False

def splitColumn(df, columnIndex, delimiter, regex=False):
	try:
		if regex:
			newColumns = df[df.columns[columnIndex]].apply(lambda x: pd.Series(re.split(delimiter, x)))
		else:
			newColumns = df[df.columns[columnIndex]].apply(lambda x: pd.Series(x.split(delimiter)))
		newColumnsCount = len(newColumns.columns)
		for i in range(0, newColumnsCount):
			df.insert(columnIndex+i+1, str(df.columns[columnIndex])+"_"+str(newColumns.columns[i]), newColumns[newColumns.columns[i]], allow_duplicates=True)
		return True
	except Exception, e:
		print(str(e))
		
	return False

def combineColumns(df, columnHeadings, seperator="", newName="merged_column", insertIndex=0):
	try:
		if len(columnHeadings) < 2:
			return False

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
		return True
	except Exception, e:
		print(str(e))
		
	return False

def discretize(df, columnIndex, cutMode, numberOfBins):
	try:
		if (cutMode == "discretization"):
			df[df.columns[columnIndex]] = pd.cut(df[df.columns[columnIndex]], numberOfBins).astype(str)
			return True
		elif (cutMode == "quantiling"):
			if type(numberOfBins) is not int:
				numberOfBins = numberOfBins.split(',')
				numberOfBins = map(float, numberOfBins)
			df[df.columns[columnIndex]] = pd.qcut(df[df.columns[columnIndex]], numberOfBins).astype(str)
			return True
		return False
	except Exception, e:
		print(str(e))
		
	return False

# HIGHWAY TO THE DANGER ZONE
def executeCommand(df, command):
	try:
		exec command
		return True
	except Exception, e:
		print(str(e))
		
	return False