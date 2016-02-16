import pandas as pd
import numpy as np
import json
import traceback
import random
import chardet
import os

# Attempts to guess encoding of a file and returns a Python text encoding string e.g. 'utf-8' and 'latin-1'
# Returns None if file cannot be read
def guessEncoding(filename):
	try:
		file = open(filename, "rb")
		while True:
			data = file.read(1024)
			if len(data) == 0:
			    break
			guess = chardet.detect(data)
			if guess['confidence'] > 0.80:
			    encoding = guess['encoding']
			    break
		file.close()

		return "utf-8" if encoding is None else encoding
	except:
		return None

# Performs in-place conversion of file encoding
# Returns True on success and False on failure 
def convertEncoding(filename, source="utf-8", destination="utf-8", buffer=1024):
	try:
		temp = open(filename + '.tmp', 'wb')
		file = open(filename, 'rb')
		while True:
			data = file.read(buffer)
			if len(data) == 0:
				break
			temp.write(data.decode(source, "replace").encode(destination, "replace"))
		file.close()
		temp.close()
		os.remove(filename)
		os.rename(filename + '.tmp', filename)
		return True
	except:
		return False

# Returns Pandas.DataFrame on successful conversion, None on failure
def CSVtoDataFrame(filename, header=0, initialSkip=0, sampleSize=100, seed='___DoNotUseThisAsSeed___', headerIncluded='true'):
	# convert file to UTF-8 encoding
	if not convertEncoding(filename, guessEncoding(filename), "utf-8"):
		return None

	try:
		numberOfLines = sum(1 for line in open(filename))
		header = 0 if headerIncluded == 'true' else None
		initialSkip = 0 if initialSkip > numberOfLines else initialSkip
		dataStartLine = initialSkip + (1 if headerIncluded == 'true' else 0)
		if seed is not '___DoNotUseThisAsSeed___':
			random.seed(seed)
		linesToSkipIdx = []
		if sampleSize < 100 and sampleSize > 0:
			linesToSkipIdx = random.sample(range(dataStartLine, numberOfLines-1), int((numberOfLines-initialSkip)*((100-sampleSize)/100.0)))
		if initialSkip > 0:
			for i in range(0, initialSkip):
				linesToSkipIdx.append(i)
	except Exception, e:
		print(str(e))
		return None

	data = None
	if filename:
		try:
			data = pd.read_csv(filename, header=header, skiprows=linesToSkipIdx)
		except Exception, e:
			print(str(e))
			return None
	return data if type(data) is pd.DataFrame else None

# Returns JSON : str on successful conversion or False on failure
def dataFrameToJSON(df, rowIndexFrom=None, rowIndexTo=None, columnIndexFrom=None, columnIndexTo=None):
	if type(df) is not pd.DataFrame:
		return None

	if rowIndexFrom is None and rowIndexTo is None and columnIndexFrom is None and columnIndexTo is None:
		rowIndexFrom = 0
		rowIndexTo = df.shape[0] - 1
		columnIndexFrom = 0
		columnIndexTo = df.shape[1] - 1

	if type(rowIndexFrom) is not int or type(rowIndexTo) is not int or type(columnIndexFrom) is not int or type(columnIndexTo) is not int:
		return None
	if rowIndexFrom < 0 or rowIndexFrom > df.shape[0] or rowIndexTo < 0 or rowIndexTo > df.shape[0] or columnIndexFrom < 0 or columnIndexFrom > df.shape[1] or columnIndexFrom < 0 or columnIndexFrom > df.shape[1]:
		return None
		
	newDF = pd.DataFrame()
	for index in range(columnIndexFrom, columnIndexTo + 1):
		columnName = df.columns[index]
		if "__original__b0YgCpYKkWwuJKypnOEZeDJM8__original__" not in columnName:
			if "%s%s" % (columnName, "__original__b0YgCpYKkWwuJKypnOEZeDJM8__original__") in df.columns:
				# column holds failed conversions
				mergedColumn = df[columnName][rowIndexFrom: rowIndexTo + 1].astype('object')
				originalColumn = df["%s%s" % (columnName, "__original__b0YgCpYKkWwuJKypnOEZeDJM8__original__")][rowIndexFrom: rowIndexTo + 1]

				missingIndices = [index for (index, isnull) in originalColumn.isnull().iteritems() if isnull] 
				for index in missingIndices:
					mergedColumn[index] = "%s (original)" % originalColumn[index]

				newDF[columnName] = mergedColumn
			else:
				# normal column
				newDF[columnName] = df[columnName][rowIndexFrom:rowIndexTo + 1]

	return newDF.to_json(orient="split", date_format="iso", force_ascii=False)

# Returns True on successful rename, False on failure
def renameColumn(df, column, newName):
	if (isinstance(column, basestring) and isinstance(newName, basestring)) and column in df.columns:
		try:
			df.rename(columns={column: newName}, inplace=True)
			return True
		except:
			pass # Returns True on successful removes, False on failure
	return False

# Returns True on successful removal of rows, False on failure
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

# Returns Pandas.DataFrame containing rows which have invalid values in all (not any) specified columns
# Returns None on failure
def rowsWithInvalidValuesInColumns(df, columnIndices):
	if type(df) is pd.DataFrame and type(columnIndices) is list and len(columnIndices) > 0:
		try:
			for columnIndex in columnIndices:
				columnName = df.columns[columnIndex]
				df = df[df[columnName].isnull()]
			return df
		except:
			print(traceback.format_exc())
	return None

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
				df[column] = converted

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