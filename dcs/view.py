import pandas as pd
from matplotlib.dates import num2date
from matplotlib import pyplot
import scipy.stats
from StringIO import StringIO
import traceback

# Return (StringIO stream, axis information) tuple
# Tuple contains PNG image as stream & axis information as dictionary
# Will return None on failure
def histogram(df, columnIndices, options={}):
	try:
		pyplot.style.use('ggplot')
		fig = pyplot.figure(figsize=(10, 8))
		ax = fig.add_subplot(111)

		numberOfBins = 10
		if(type(options) is dict):
			if "numberOfBins" in options and type(options["numberOfBins"]) is int:
				numberOfBins = options["numberOfBins"]
			if "axis" in options and type(options["axis"]) is dict:
				ax.axis([options["axis"]["x"]["start"], options["axis"]["x"]["end"], options["axis"]["y"]["start"], options["axis"]["y"]["end"]])
		
		ax.hist([df[df.columns[colIndex]].dropna() for colIndex in columnIndices], bins=numberOfBins, label=[df.columns[colIndex] for colIndex in columnIndices])
		ax.legend(prop={'size': 10})
		ax.set_xlabel("Value")
		ax.set_ylabel("Frequency")

		stream = StringIO()
		fig.savefig(stream, format="png", dpi=300)
		axis = ax.axis()
		axisInformation = {"x": {"start": axis[0], "end": axis[1]}, "y": {"start": axis[2], "end": axis[3]}}

		return stream, axisInformation
	except:
		return None

# Return (StringIO stream, axis information) tuple
# Tuple contains PNG image as stream & axis information as dictionary
# Will return None on failure

# Limit to 6 y-axis variables for optimal color assignment
def scatter(df, xIndex, yIndices, options={}):
	try:
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
			lineOfBestFit = df[xColumn] * slope + intercept
			ax.plot(df[xColumn], lineOfBestFit, colors[index % len(colors)] + "-", label="best fit")
			ax.text(df[xColumn].max(), lineOfBestFit[df[xColumn].idxmax()], r' $R^{2} = %.3f$' % (r_value ** 2), fontsize=12)
		
		stream = StringIO()
		fig.savefig(stream, format="png", dpi=300)
		axis = ax.axis()
		axisInformation = {"x": {"start": axis[0], "end": axis[1]}, "y": {"start": axis[2], "end": axis[3]}}

		return stream, axisInformation
	except:
		print(traceback.format_exc())
		return None

# Return (StringIO stream, axis information) tuple
# Tuple contains PNG image as stream & axis information as dictionary
# Will return None on failure

# Limit to 6 y-axis variables for optimal color assignment
def line(df, xIndex, yIndices, options={}):
	try:
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
		fig.savefig(stream, format="png", dpi=300)
		axis = ax.axis()
		axisInformation = {"x": {"start": axis[0], "end": axis[1]}, "y": {"start": axis[2], "end": axis[3]}}

		return stream, axisInformation
	except:
		print(traceback.format_exc())
		return None

# Return (StringIO stream, axis information) tuple
# Tuple contains PNG image as stream & axis information as dictionary
# Will return None on failure

# Limit to 6 y-axis variables for optimal color assignment
def bar(df, xIndex, yIndices, options={}):
	try:
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
		fig.savefig(stream, format="png", dpi=300)
		axis = ax.axis()
		axisInformation = {"x": {"start": axis[0], "end": axis[1]}, "y": {"start": axis[2], "end": axis[3]}}

		return stream, axisInformation
	except:
		print(traceback.format_exc())
		return None

# Return (StringIO stream, axis information) tuple
# Tuple contains PNG image as stream & axis information as dictionary
# Will return None on failure

# Limit to 6 y-axis variables for optimal color assignment
def date(df, xIndex, yIndices, options={}):
	try:
		xColumn = df.columns[xIndex]
		yColumns = [df.columns[index] for index in yIndices]

		df = df.dropna(subset=[xColumn] + yColumns)

		pyplot.style.use('ggplot')
		fig = pyplot.figure(figsize=(10, 8))
		ax = fig.add_subplot(111)
		
		"""
		if(type(options) is dict):
			if "axis" in options and type(options["axis"]) is dict:
				ax.axis([options["axis"]["x"]["start"], options["axis"]["x"]["end"], options["axis"]["y"]["start"], options["axis"]["y"]["end"]])
		"""

		ax.set_xlabel(xColumn)
		ax.set_ylabel(yColumns[0] if len(yColumns) == 1 else "")

		# plot data
		colors = ["b", "m", "g", "y", "c", "k"]
		for index, column in enumerate(yColumns):
			ax.plot(df[xColumn], df[column], colors[index % len(colors)] + "-")
		ax.legend(loc=2, prop={'size': 10})

		pyplot.setp( ax.xaxis.get_majorticklabels(), rotation=45 )
		
		stream = StringIO()
		fig.savefig(stream, format="png", dpi=300)
		axis = ax.axis()
		axisInformation = {"x": {"start": num2date(axis[0]).isoformat(), "end": num2date(axis[1]).isoformat()}, "y": {"start": num2date(axis[2]).isoformat(), "end": num2date(axis[3]).isoformat()}}

		return stream, axisInformation
	except:
		print(traceback.format_exc())
		return None