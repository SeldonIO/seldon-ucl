# returns DataFrame or None
def CSVtoDataFrame(filestream, encoding="utf-8", header=0):
	data = None
	if filestream:
		try:
			data = pd.read_csv(filestream, encoding=encoding, header=header)
		except:
			pass
	return data if type(data) is pd.DataFrame else None

def dataFrameToJSON(data):
	if type(data) is pd.DataFrame:
		return data.to_json(orient="index") if type(data) is pd.DataFrame else ""