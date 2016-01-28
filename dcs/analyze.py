# text analysis methods
def frequencyChartForColumn(df, colIndex):
	return pd.Series(None)

def uniqueWordsForColumn(df, colIndex):
	return pd.Series(None)

def averageWordLengthForColumn(df, colIndex):
	return 0

def rangeOfWordLengthsForColumn(df, colIndex):
	return 0

def totalWords(df, colIndex):
	return 0

def analysisForColumnIndex(df, colIndex):
	if type(df) is pd.DataFrame and type(colIndex) is int:
		column = df[df.columns[colIndex]]
		toReturn = {}
		if issubclass(column.dtype.type, np.character):
			# text analysis is 
			pass
		elif issubclass(newdtype.type, np.number):
			toReturn = column.describe().to_dict()
		elif issubclass(newdtype.type, np.character):
			pass
		return toReturn