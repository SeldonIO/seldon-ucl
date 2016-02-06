import pandas as pd
import numpy as np
import json
import traceback
import random

# Returns Pandas.DataFrame on successful conversion, None on failure
def CSVtoDataFrame(filestream, encoding="utf-8", header=0, initialSkip=0, sampleSize=100, seed='___DoNotUseThisAsSeed___', headerIncluded='true'):
	try:
		numberOfLines = sum(1 for line in open(filestream))
		header = 0 if headerIncluded == 'true' else None
		initialSkip = 0 if initialSkip > numberOfLines else initialSkip
		dataStartLine = initialSkip + (1 if headerIncluded == 'true' else 0)
		if seed is not '___DoNotUseThisAsSeed___':
			random.seed(seed)
		linesToSkipIdx = []
		if sampleSize < 100 and sampleSize > 0:
			linesToSkipIdx = random.sample(range(dataStartLine, numberOfLines-1), int((numberOfLines-initialSkip)*((100-sampleSize)/100.0)))
		if initialSkip > 0:
			for i in range(0, initialSkip-1):
				linesToSkipIdx.append(i)
	except Exception, e:
		print(str(e))
		return None
	data = None
	if filestream:
		try:
			data = pd.read_csv(filestream, encoding=encoding, header=header, skiprows=linesToSkipIdx)
		except Exception, e:
			print(str(e))
			return None
	return data if type(data) is pd.DataFrame else None

# Returns JSON (str)
def dataFrameToJSON(df, filename=None):
	if type(df) is pd.DataFrame:
		newDF = pd.DataFrame()
		for column in df.columns:
			if "__original__b0YgCpYKkWwuJKypnOEZeDJM8__original__" not in column:
				if "%s%s" % (column, "__original__b0YgCpYKkWwuJKypnOEZeDJM8__original__") in df.columns:
					# column holds failed conversions
					mergedColumn = df[column].astype('object')
					originalColumn = df["%s%s" % (column, "__original__b0YgCpYKkWwuJKypnOEZeDJM8__original__")]

					missingIndices = [index for (index, isNull) in df[column].isnull().iteritems() if isNull] 
					for index in missingIndices:
						mergedColumn[index] = "%s (original)" % originalColumn[index]

					newDF[column] = mergedColumn
				else:
					# normal column
					newDF[column] = df[column]

		if filename is not None:
			with open(filename, 'w') as file:
				print(filename)
				newDF.to_json(path_or_buf=file, orient="records", date_format="iso")
		else:
			return newDF.to_json(orient="records", date_format="iso")
	else:
		return None

# Returns True on successful rename, False on failure
def renameColumn(df, column, newName):
	if (isinstance(column, basestring) and isinstance(newName, basestring)) and column in df.columns:
		try:
			df.rename(columns={column: newName}, inplace=True)
			return True
		except:
			pass
	return False

# Returns True on successful removes, False on failure
def removeRows(df, rowIndices):
	try:
		rowIndices = [df.index[x] for x in rowIndices]
		for index in rowIndices:
			df.drop(index, inplace=True)
		
		df.reset_index(drop=True, inplace=True)
		return True
	except:
		pass
	return False

# Returns Pandas.Series with converted values
def dataFrameColumnAsNumericType(df, column):
	return pd.to_numeric(df[column], errors="coerce")

def changeColumnDataType(df, column, newDataType, dateFormat=None): 
	if isinstance(newDataType, basestring) and isinstance(column, basestring) and column in df.columns:
		try:
			newdtype = np.dtype(newDataType)
			print("converting from ", df[column].dtype, "/", df[column].dtype.type, " to ", newdtype, "/", newdtype.type)
			if issubclass(newdtype.type, np.character):
				# simple conversion to string
				df[column] = df[column].astype(newdtype)
				return True
			elif issubclass(df[column].dtype.type, np.number) and issubclass(newdtype.type, np.number):
				# simple conversion from number to number
				# BUT WILL fail if column with dtype float contains infinity or negative infinity
				converted = df[column].astype(newdtype)
				df[column] = converted
				return True
			elif issubclass(newdtype.type, np.number):
				# conversion from string to number
				backup = df[column]

				converted = pd.to_numeric(df[column], errors="coerce").astype(newdtype)
				df[column] = cosnverted

				if converted.isnull().sum() != backup.isnull().sum():
					df["%s%s" % (column, "__original__b0YgCpYKkWwuJKypnOEZeDJM8__original__")] = backup
				return True
			elif issubclass(newdtype.type, np.datetime64):
				# conversion from string to date
				print("complex conversion from string to date")
				backup = df[column]

				converted = None
				if dateFormat is None:
					converted = pd.to_datetime(df[column], infer_datetime_format=True)
				else:
					converted = pd.to_datetime(df[column], format=dateFormat)
				df[column] = converted

				if converted.isnull().sum() != backup.isnull().sum():
					df["%s%s" % (column, "__original__b0YgCpYKkWwuJKypnOEZeDJM8__original__")] = backup
				return True
		except Exception as e:
			print(traceback.format_exc())
		
	return False