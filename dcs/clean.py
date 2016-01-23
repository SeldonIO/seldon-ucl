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