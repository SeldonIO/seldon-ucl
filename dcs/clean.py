def clusterForColumn(df, colIndex, **kwargs):
	return pd.DataFrame(None)

def cleanClusteredValuesWithIdentifier(df, identifier, **kwargs):
	return None

def rowsWithValuesOutsideRangeInColumn(df, colIndex, **kwargs):
	return None

def fillDown(df, columnFrom, columnTo):
	try:
		for columnIndex in range(columnFrom, columnTo + 1):
			print("filling down ", df.columns[columnIndex])
			df[df.columns[columnIndex]].fillna(method='pad', inplace=True)
		return True
	except:
		pass
	return False