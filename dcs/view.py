import pandas as pd
import numpy as np
import matplotlib
from matplotlib.dates import num2date, date2num
from matplotlib import pyplot
import scipy.stats
from dcs.analyze import textAnalysis
from StringIO import StringIO
import traceback
import base64
import dateutil.parser

# Return filtered pd.DataFrame on success and None on failure 
def filterWithSearchQuery(df, columnIndices, query, isRegex=False):
	matchedIndices = pd.Series([False for _ in range(df.shape[0])], index=df.index)
	for index in columnIndices:
		column = df[df.columns[index]]
		matches = column.astype(str).str.contains(query, regex=isRegex)
		matches = matches[matches == True].index.tolist()
		for index in matches:
			if pd.notnull(column[index]):
				matchedIndices[index] = True

	return df[matchedIndices]

# Return dictionary containing image: base64 encoded PNG image of chart and axis: dict (window settings)
# Will return None on failure
def histogram(df, columnIndices, options={}):
	pyplot.style.use('ggplot')
	fig = pyplot.figure(figsize=(10, 8))
	ax = fig.add_subplot(111)

	numberOfBins = 10
	if type(options) is dict:
		if "numberOfBins" in options and type(options["numberOfBins"]) is int:
			numberOfBins = int(options["numberOfBins"])
		if "axis" in options and type(options["axis"]) is dict:
			ax.axis([options["axis"]["x"]["start"], options["axis"]["x"]["end"], options["axis"]["y"]["start"], options["axis"]["y"]["end"]])
	
	ax.hist([df[df.columns[colIndex]].dropna() for colIndex in columnIndices], bins=numberOfBins, label=[df.columns[colIndex] for colIndex in columnIndices])
	ax.legend(prop={'size': 10})
	ax.set_xlabel("Value")
	ax.set_ylabel("Frequency")

	stream = StringIO()
	fig.tight_layout()
	fig.savefig(stream, format="png", dpi=300)
	axis = ax.axis()
	axisInformation = {"x": {"start": axis[0], "end": axis[1]}, "y": {"start": axis[2], "end": axis[3]}}
	pyplot.close(fig)

	return {'image': base64.b64encode(stream.getvalue()).decode('utf-8'), 'axis': axisInformation}

# Return dictionary containing image: base64 encoded PNG image of chart and axis: dict (window settings)
def frequency(df, columnIndex, options={}):
	cutoff = 50
	useWords = False
	column = df[df.columns[columnIndex]]

	if type(options) is dict:
		if options.get("useWords", False) is True and not issubclass(column.dtype.type, np.datetime64) and not issubclass(column.dtype.type, np.number):
			useWords = True
		if options.get("cutoff", -1) > 0 and options.get("cutoff", -1) <= 50:
			cutoff = int(options["cutoff"])

	values = []
	counts = []
	if useWords:
		tuples = textAnalysis(column)["word_frequencies"]
		for x in reversed(tuples[:cutoff]):
			values.append(x[0].decode("utf-8", "replace") if isinstance(x[0], basestring) else x[0])
			counts.append(x[1])
	else:
		tuples = column.value_counts()
		for index in range(min(cutoff - 1, len(tuples)), -1, -1):
			values.append(tuples.index[index].decode("utf-8", "replace") if isinstance(tuples.index[index], basestring) else tuples.index[index])
			counts.append(tuples.iloc[index])
	
	pyplot.style.use('ggplot')
	fig = pyplot.figure(figsize=(10, 8))
	ax = fig.add_subplot(111)

	ax.set_ylim(-0.5, len(values) - 0.5)
	ax.barh(np.arange(len(values)), counts, tick_label=values, align="center")
	ax.set_xlabel("Frequency")
	ax.set_ylabel("Value")

	stream = StringIO()
	fig.savefig(stream, format="png", dpi=300)
	pyplot.close(fig)

	return {'image': base64.b64encode(stream.getvalue()).decode('utf-8')}

# Return dictionary containing image: base64 encoded PNG image of chart and axis: dict (window settings)
# Limit to 6 y-axis variables for optimal color assignment
def scatter(df, xIndex, yIndices, options={}):
	xColumn = df.columns[xIndex]
	yColumns = [df.columns[index] for index in yIndices]

	df = df.dropna(subset=[xColumn] + yColumns)

	pyplot.style.use('ggplot')
	fig = pyplot.figure(figsize=(10, 8))
	ax = fig.add_subplot(111)
	
	if(type(options) is dict):
		if "axis" in options and type(options["axis"]) is dict:
			ax.axis([options["axis"]["x"]["start"], options["axis"]["x"]["end"], options["axis"]["y"]["start"], options["axis"]["y"]["end"]])

	ax.set_xlabel(xColumn)
	ax.set_ylabel(yColumns[0] if len(yColumns) == 1 else "")

	# plot data
	colors = ["b", "m", "g", "y", "c", "k"]
	for index, column in enumerate(yColumns):
		ax.scatter(df[xColumn], df[column], c=colors[index % len(colors)], marker="x")
	ax.legend(loc=2, prop={'size': 10})

	# plot trendlines
	for index, column in enumerate(yColumns):
		slope, intercept, r_value, p_value, std_err = scipy.stats.linregress(df[xColumn], df[column])
		pearson, p_value = scipy.stats.pearsonr(df[xColumn], df[column])
		lineOfBestFit = df[xColumn] * slope + intercept
		ax.plot(df[xColumn], lineOfBestFit, colors[index % len(colors)] + "-", label="best fit")
		ax.text(df[xColumn].max(), lineOfBestFit[df[xColumn].idxmax()], r' $R^{2} = %.3f$' % (r_value ** 2) + "\n" + r' $p = %.3f$' % pearson, fontsize=12)

	stream = StringIO()
	fig.tight_layout()
	fig.savefig(stream, format="png", dpi=300)
	axis = ax.axis()
	axisInformation = {"x": {"start": axis[0], "end": axis[1]}, "y": {"start": axis[2], "end": axis[3]}}
	pyplot.close(fig)

	return {'image': base64.b64encode(stream.getvalue()).decode('utf-8'), 'axis': axisInformation}

# Return dictionary containing image: base64 encoded PNG image of chart and axis: dict (window settings)
# Limit to 6 y-axis variables for optimal color assignment
def line(df, xIndex, yIndices, options={}):
	xColumn = df.columns[xIndex]
	yColumns = [df.columns[index] for index in yIndices]

	df = df.dropna(subset=[xColumn] + yColumns)

	pyplot.style.use('ggplot')
	fig = pyplot.figure(figsize=(10, 8))
	ax = fig.add_subplot(111)
	
	if(type(options) is dict):
		if "axis" in options and type(options["axis"]) is dict:
			ax.axis([options["axis"]["x"]["start"], options["axis"]["x"]["end"], options["axis"]["y"]["start"], options["axis"]["y"]["end"]])

	ax.set_xlabel(xColumn)
	ax.set_ylabel(yColumns[0] if len(yColumns) == 1 else "")

	# plot data
	colors = ["b", "m", "g", "y", "c", "k"]
	for index, column in enumerate(yColumns):
		ax.plot(df[xColumn], df[column], colors[index % len(colors)] + "-")
	ax.legend(loc=2, prop={'size': 10})
	
	stream = StringIO()
	fig.tight_layout()
	fig.savefig(stream, format="png", dpi=300)
	axis = ax.axis()
	axisInformation = {"x": {"start": axis[0], "end": axis[1]}, "y": {"start": axis[2], "end": axis[3]}}
	pyplot.close(fig)

	return {'image': base64.b64encode(stream.getvalue()).decode('utf-8'), 'axis': axisInformation}

# Return dictionary containing image: base64 encoded PNG image of chart and axis: dict (window settings)
# Limit to 6 y-axis variables for optimal color assignment
def date(df, xIndex, yIndices, options={}):
	xColumn = df.columns[xIndex]
	yColumns = [df.columns[index] for index in yIndices]

	df = df.dropna(subset=[xColumn] + yColumns)
	df.sort_values(xColumn, inplace=True)

	pyplot.style.use('ggplot')
	fig = pyplot.figure(figsize=(10, 8))
	ax = fig.add_subplot(111)
	
	if(type(options) is dict):
		if "axis" in options and type(options["axis"]) is dict:
			xStart = date2num(dateutil.parser.parse(options["axis"]["x"]["start"]))
			xEnd = date2num(dateutil.parser.parse(options["axis"]["x"]["end"]))
			ax.axis([xStart, xEnd, options["axis"]["y"]["start"], options["axis"]["y"]["end"]])

	pyplot.setp( ax.xaxis.get_majorticklabels(), rotation=45 )

	# plot data
	colors = ["b", "m", "g", "y", "c", "k"]
	for index, column in enumerate(yColumns):
		ax.plot(df[xColumn], df[column], colors[index % len(colors)] + "-")
	ax.legend(loc=2, prop={'size': 10})

	ax.set_xlabel(xColumn)
	ax.set_ylabel(yColumns[0] if len(yColumns) == 1 else "")
	
	stream = StringIO()
	fig.tight_layout()
	fig.savefig(stream, format="png", dpi=300)
	axis = ax.axis()
	axisInformation = {"x": {"start": num2date(axis[0]).isoformat(), "end": num2date(axis[1]).isoformat()}, "y": {"start": axis[2], "end": axis[3]}}
	pyplot.close(fig)

	return {'image': base64.b64encode(stream.getvalue()).decode('utf-8'), 'axis': axisInformation}