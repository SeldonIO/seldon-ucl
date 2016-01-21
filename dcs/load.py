import pandas as pd
import numpy as np

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
def dataFrameToJSON(data):
	if type(data) is pd.DataFrame:
		return data.to_json(orient="records")

# Returns True on successful rename, False on failure
def renameColumn(df, column, newName):
	try:
		df = df.rename(columns={column: newName}, inplace=True)
		return True
	except:
		pass
	return False

# Returns True on successful removes, False on failure
def removeRows(df, rowFrom, rowTo):
	try:
		df = df.drop(df.index[[rowFrom,rowTo]])
		return True
	except:
		pass
	return False

# Returns Pandas.Series with converted values
def dataFrameColumnAsNumericType(df, colIndex):
	return pd.to_numeric(data.columns[colIndex], errors="coerce")

def setDateTypeForColumn(df, format=None, index=None, name=None):
	return 0