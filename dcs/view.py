import pandas as pd

def searchInColumn(df, colIndex, keyword):
	return pd.DataFrame(None)

# Returns Pandas.DataFrame containing a sample of dataframe
# Sampled according to sample size after sorting specified column
# Returns None on failure
def sortedSample(df, sampleSize, sampleColumnIndex, dataColumnIndices):
	if type(df) is not pd.DataFrame or type(sampleSize) is not int or type(sampleColumnIndex) is not int or type(dataColumnIndices) is not list or sampleSize < 1:
		return None

	try:
		newDF = pd.DataFrame()
		newDF[df.columns[sampleColumnIndex]] = df[df.columns[sampleColumnIndex]]
		for columnIndex in dataColumnIndices:
			newDF[df.columns[columnIndex]] = df[df.columns[columnIndex]]

		newDF.sort_values(df.columns[sampleColumnIndex], inplace=True)
		newDF.dropna(subset=[df.columns[sampleColumnIndex]], inplace=True)

		sampledDF = pd.DataFrame()
		if sampleSize is 1:
			sampledDF = sampledDF.append(newDF.iloc[newDF.shape[0] / 2])
		else:
			interval = float(newDF.shape[0] - 1) / float(sampleSize - 1)
			index = 0
			for x in range(sampleSize):
				sampledDF = sampledDF.append(newDF.iloc[int(x * interval)])

		return sampledDF

	except:
		pass
	return None