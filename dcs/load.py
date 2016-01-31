import pandas as pd
import numpy as np
import json

# Returns Pandas.DataFrame on successful conversion, None on failure
def CSVtoDataFrame(filestream, encoding="utf-8", header=0):
	data = None
	if filestream:
		try:
			data = pd.read_csv(filestream, encoding=encoding, header=header)
		except:
			return None
	return data if type(data) is pd.DataFrame else None

# Returns JSON (str)
def dataFrameToJSON(df):
	toReturn = ""
	newDF = pd.DataFrame()
	if type(df) is pd.DataFrame:
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

		return newDF.to_json(orient="records")
	return toReturn

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
def removeRows(df, rowFrom, rowTo):
	try:
		df.drop(df.index[rowFrom:rowTo+1], inplace=True)
		df.reset_index(drop=True, inplace=True)
		return True
	except:
		pass
	return False

# Returns Pandas.Series with converted values
def dataFrameColumnAsNumericType(df, column):
	return pd.to_numeric(df[column], errors="coerce")

def changeColumnDataType(df, column, newDataType, **kwargs): 
	if isinstance(newDataType, basestring) and isinstance(column, basestring) and column in df.columns:
		try:
			newdtype = np.dtype(newDataType)
			print("converting from ", df[column].dtype, "/", df[column].dtype.type, " to ", newdtype, "/", newdtype.type)
			if issubclass(newdtype.type, np.character):
				# simple conversion to string
				print("simple conversion to string")
				df[column] = df[column].astype(newdtype)
				return True
			elif issubclass(df[column].dtype.type, np.number) and issubclass(newdtype.type, np.number):
				# simple conversion from number to number
				# BUT WILL fail if column with dtype float contains infinity or negative infinity
				print("simple conversion from number to number")
				converted = df[column].astype(newdtype)
				df[column] = converted
				return True
			elif issubclass(newdtype.type, np.number):
				# conversion from string to number
				print("complex conversion from stirng to number")
				backup = df[column]

				converted = pd.to_numeric(df[column], errors="coerce").astype(newdtype)
				df[column] = converted

				if converted.isnull().sum() != backup.isnull().sum():
					df["%s%s" % (column, "__original__b0YgCpYKkWwuJKypnOEZeDJM8__original__")] = backup
				return True
		except:
			pass
		
	return False