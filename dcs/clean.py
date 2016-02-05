import traceback

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
			average = df[df.columns[columnIndex]].mode().iloc[0]
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
		print("START DROPPING")
		df.dropna(subset=[df.columns[columnIndex]], inplace=True)
		print("FINISH DROPPING")
		return True
	except Exception, e:
		print(str(e))
		
	return False