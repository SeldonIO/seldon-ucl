# -*- coding: utf-8 -*- 

import traceback
import pandas as pd
import numpy as np
import dcs
import re

def fillDown(df, columnFrom, columnTo, method):
	"""Replaces invalid values in specified columns with the last/next valid value, in-place

	Multiple columns can be specified by giving a range of column indices. Therefore the operation can only be performed on a series of adjacent columns.
	The function makes use of the :meth:`pandas.Series.fillna` method.  

	Args:
		df (pandas.DataFrame): data frame
		columnFrom (int): starting index for range of columns 
		columnTo (int): ending index for range of columns (inclusive) 
		method (str): 'bfill' for backwards fill (next valid value) and 'pad' for forward fill (last valid value)
	"""

	for columnIndex in range(columnFrom, columnTo + 1):
		print("filling down ", df.columns[columnIndex], " using ", method)
		if method == 'pad':
			df[df.columns[columnIndex]].fillna(method='pad', inplace=True)
		else:
			df[df.columns[columnIndex]].fillna(method='bfill', inplace=True)

def fillByInterpolation(df, columnIndex, method, order):
	"""Fills in invalid values in the specified column by performing interpolation, in-place

	.. warning::

		The function only works on numeric columns and will raise an exception in any other case. 

	The function makes use of the :meth:`pandas.Series.interpolate` method.  

	Args:
		df (pandas.DataFrame): data frame
		columnIndex (int): index of numeric column 
		method (str): passed directly to ``method`` kwarg for :meth:`pandas.Series.interpolate`, options include 'linear', 'spline' and 'polynomial' 
		order (int): passed direclty to ``order`` kwarg for :meth:`pandas.Series.interpolate`, required for certain methods such as 'polynomial'
	"""

	method = method.lower()
	if method == 'polynomial' or method == 'spline':
		df[df.columns[columnIndex]].interpolate(method=method, order=order, inplace=True)
	else:
		df[df.columns[columnIndex]].interpolate(method=method, inplace=True)

def fillWithCustomValue(df, columnIndex, newValue):
	"""Fills in all invalid values in the specified column with a custom specified value, in-place

	Args:
		df (pandas.DataFrame): data frame
		columnIndex (int): index of column 
		newValue: value to fill with
	"""

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
	"""Fills in invalid values in the specified column with an average metric, in-place

	Average metrics that can be used to fill with are: mean, median and mode. 

	.. warning::
		Using mean or median metric on a non numeric column will raise an exception.  

	Args:
		df (pandas.DataFrame): data frame
		columnIndex (int): index of column 
		metric (str): average metric to use, options are: 'mean', 'median' and 'mode'

	Returns:
		bool: True on success, False on failure
	"""

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

def normalize(df, columnIndex, rangeFrom=0, rangeTo=1):
	"""Performs normalization on a numeric column, in-place

	Uniformally scales the values in a numeric data set to fit in the specified range

	.. warning::
		Calling the function on a non numeric column will raise an exception.  

	Args:
		df (pandas.DataFrame): data frame
		columnIndex (int): index of column 
		rangeFrom (int/float, optional): range start
		rangeTo (int/float, optional): range end
	"""

	if (df[df.columns[columnIndex]].max() - df[df.columns[columnIndex]].min()) != 0:
		df[df.columns[columnIndex]] = rangeFrom + ((df[df.columns[columnIndex]] - df[df.columns[columnIndex]].min()) * (rangeTo - rangeFrom)) / (df[df.columns[columnIndex]].max() - df[df.columns[columnIndex]].min())

def standardize(df, columnIndex):
	"""Performs standardization on a numeric column, in-place

	Uniformally scales the values in a numeric data set so that the mean is 0 and standard deviation is 1. 

	.. warning::
		Calling the function on a non numeric column will raise an exception.  

	Args:
		df (pandas.DataFrame): data frame
		columnIndex (int): index of column
	"""

	if df[df.columns[columnIndex]].std() != 0:
		df[df.columns[columnIndex]] = (df[df.columns[columnIndex]] - df[df.columns[columnIndex]].mean()) / df[df.columns[columnIndex]].std()

def deleteRowsWithNA(df, columnIndex):
	"""Drops all rows with missing values in the specified column

	The function uses the :meth:`pandas.DataFrame.dropna` function, 
	before resetting the index of the dataframe with :meth:`pandas.DataFrame.reset_index`

	Args:
		df (pandas.DataFrame): data frame
		columnIndex (int): index of column
	"""

	df.dropna(subset=[df.columns[columnIndex]], inplace=True)
	df.reset_index(drop=True, inplace=True)

def findReplace(df, columnIndex, toReplace, replaceWith, matchRegex):
	"""Finds all values matching the given patterns in the specified column and replaces them with a value 

	The function supports searching for multiple patterns, and uses the :meth:`pandas:pandas.Series.replace` method
	Patterns can be strings which will be matched as a whole, or regular expressions (if *matchRegex* boolean flag is set to ``True``). 

	Standard Pythonic :func:`regex subsitutions <python:re.sub>` are also possible. 

	Args:
		df (pandas.DataFrame): data frame
		columnIndex (int): index of column
		toReplace (list<str>): list of search strings or regular expressions
		replaceWith (list<str>): list of replacement strings or regular expressions
		matchRegex (bool): must be set to True if supplying list of regular expressions
	"""

	for i in range(0, len(toReplace)):
		df[df.columns[columnIndex]].replace(to_replace=str(toReplace[i]), value=str(replaceWith[i]), regex=matchRegex, inplace=True)
		
		try:
			df[df.columns[columnIndex]].replace(to_replace=float(toReplace[i]), value=replaceWith[i], regex=matchRegex, inplace=True)
		except ValueError:
			pass

def generateDummies(df, columnIndex, inplace):
	"""Generates dummies/indicator variable columns from a specified column (containing categorical data) 

	The function uses the :func:`pandas.get_dummies` function. 
	
	Args:
		df (pandas.DataFrame): data frame
		columnIndex (int): index of column
		inplace (bool): removes original column if ``True``
	"""

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
	"""Duplicates a column, inserting the new column to the right of the original column

	Args:
		df (pandas.DataFrame): data frame
		columnIndex (int): index of column to duplicate
	"""

	df.insert(columnIndex + 1, str(df.columns[columnIndex]) + "_copy", df.iloc[:, columnIndex], allow_duplicates=True)

def splitColumn(df, columnIndex, delimiter, regex=False):
	"""Splits a string column according to a specified delimiter or regular expression.

	The split values are put in new columns inserted to the right of the original column 

	Args:
		df (pandas.DataFrame): data frame
		columnIndex (int): index of column to split
		delimiter (str): delimiting character, string or regular expression for splitting each row
		regex (bool, optional): must be set to ``True`` if delimiter is a regular expression
	"""

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
	"""Combines multiple columns into a new column, concatenating each value using a specified separator 

	Args:
		df (pandas.DataFrame): data frame
		columnHeadings (list<str>): list of columns to combine
		seperator (str, optional): separator character or string
		newName (str, optional): name for column containing combined values
		insertIndex (int, optional): index to insert new column at

	Raises:
		ValueError: if *columnHeadings* parameter doesn't contain at least two columns
	"""

	if len(columnHeadings) < 2:
		raise ValueError('dcs.clean.combineColumns must be provided at least two columns to combine')

	newColumn = pd.Series(index=df.index, dtype=str)
	for index, row in df.iterrows():
		strings = []
		for column in columnHeadings:
			if pd.notnull(row[column]):
				strings.append(str(row[column]))

		newColumn[index] = seperator.join(strings)

	df.insert(insertIndex, newName, newColumn, allow_duplicates=True)

def discretize(df, columnIndex, cutMode, numberOfBins):
	"""Performs in-place discretization on a numeric column

	The function has two modes of operation: discretization and quantiling, using the :func:`pandas.cut`
	and :func:`pandas.qcut` functions respectively. 

	Args:
		df (pandas.DataFrame): data frame
		columnIndex (int): index of column to discretize
		cutMode (str): 'quantiling' or 'discretization'
		numberOfBins (int): arg passed directly into pandas.cut() and pandas.qcut() functions
	"""

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
	"""Executes a Python statement in a pre-configured environment

	.. danger::

		Using this function carries direct risk, as any arbitrary command can be executed

	The *command* parameter can be a string containing multiple lines of Python statements. The command is executed
	in a pre-configured environment with ``df`` holding a reference to the data frame, and multiple modules loaded,
	including ``pandas`` and ``numpy``

	
	Args:
		df (pandas.DataFrame): data frame
		command (str): string containing a single Python command, or multiple Python commands delimited by newline
	"""

	exec(command)