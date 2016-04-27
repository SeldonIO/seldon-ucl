# -*- coding: utf-8 -*- 

import pandas as pd
import numpy as np
import matplotlib
from matplotlib.dates import num2date, date2num
from matplotlib import pyplot
import scipy.stats
from dcs.analyze import textAnalysis
import traceback
import base64
import dateutil.parser
from StringIO import StringIO # USE for production
# from io import StringIO # ONLY USE for Python 3 (when compiling sphinx documentation)


def filterWithSearchQuery(df, columnIndices, query, isRegex=False):
	"""Filters the rows of :class:`pandas.DataFrame` object that match a pattern in the specified column(s), returning a :class:`pandas.DataFrame` object
	containing the search results

	The search can be performed with a regular expression. 

	.. note::

		If filtering with multiple columns, a row is considered a match if the pattern occurs in *any* of the specified columns. 

	.. note::

		The search is performed on the string representation of the column, meaning a floating point column with value ``2`` will match the pattern ``'2.0'``


	Args:
		df (pandas.DataFrame): data frame
		columnIndices (list<int>): indices of columns to include in search
		query (str): search query or regular expression
		isRegex (bool, optional): must be set to ``True`` if searching using regular expression

	Returns:
		pandas.DataFrame: data frame containing search results (all columns included, not just search columns)
	"""

	matchedIndices = pd.Series([False for _ in range(df.shape[0])], index=df.index)
	for index in columnIndices:
		column = df[df.columns[index]]
		matches = column.astype(str).str.contains(query, regex=isRegex)
		matches = matches[matches == True].index.tolist()
		for index in matches:
			if pd.notnull(column[index]):
				matchedIndices[index] = True

	return df[matchedIndices]

def histogram(df, columnIndices, options={}):
	"""Uses ``matplotlib`` to generate a histogram of the specified :class:`pandas.DataFrame` column(s)

	The function supports multiple columns. The function uses the :func:`matplotlib.axes.Axes.hist` function to plot a histogram, exports the generated chart to a PNG image and encodes the
	image into a string using Base64. 

	.. note::

		The *options* kwarg can be used to customize the plot and may have the following key-value pairs:

		*	**numberOfBins** : an ``int`` directly passed to *bins* argument of :func:`matplotlib.axes.Axes.hist` 
		*	**axis** : a ``dict`` specifying the axis/window settings for the plot with the structure
			``{'x': {'start': x-axis min, 'end': x-axis max}, 'y': {'start': y-axis min, 'end': y-axis max}}``

	The function returns a dictionary with the following key-value pairs:

	*	**image** : *StringIO.StringIO* – :class:`StringIO.StringIO` object containing Base64 encoded PNG image of generated plot
	*	**axis** : *dict* – dictionary containing axis/window settings for the generated plot with the structure
		``{'x': {'start': x-axis min, 'end': x-axis max}, 'y': {'start': y-axis min, 'end': y-axis max}}``

	Args:
		df (pandas.DataFrame): data frame
		columnIndices (list<int>): 'indices of columns to plot'
		options (dict, optional): options dictionary

	Returns:
		dict: dictionary containing image and axis settings		
	"""

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

def frequency(df, columnIndex, options={}):
	"""Uses ``matplotlib`` to generate a horizontal frequency bar chart of the specified :class:`pandas.DataFrame` column

	This function uses the :meth:`pandas.Series.value_counts` method (or :func:`dcs.analyze.textAnalysis`['word_frequencies'] if plotting word frequency)
	to get the (value, frequency) tuples for the specified column. A horizontal bar chart is generated with the :func:`matplotlib.axes.Axes.barh` function,
	and the chart is exported to a PNG image and then encoded into a string using Base64. 

	.. note::

		The *options* kwarg can be used to customize the plot and may have the following key-value pairs:

		*	**useWords** : a ``bool`` flag which may be set to ``True`` to plot word frequencies instad of row value frequencies for a string column
		*	**cutoff** : an ``int`` specifying the top *n* values by frequency to plot, default is 50, maximum is 50

	The function returns a dictionary with the following key-value pairs:

	*	**image** : *StringIO.StringIO* – :class:`StringIO.StringIO` object containing Base64 encoded PNG image of generated plot

	Args:
		df (pandas.DataFrame): data frame
		columnIndices (list<int>): indices of columns to plot
		options (dict, optional): options dictionary

	Returns:
		dict: dictionary containing image
	"""

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
		for index in range(min(cutoff - 1, len(tuples) - 1), -1, -1):
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

def scatter(df, xIndex, yIndices, options={}):
	"""Uses ``matplotlib`` to generate a scatter plot of the specified :class:`pandas.DataFrame` column(s)

	This function uses :func:`matplotlib.axes.Axes.scatter` function to generate a scatter plot, exports the chart to a PNG image
	and encodes the image into a string using Base64. 

	The function also performs linear regression using :func:`scipy.stats.linregress` to plot a linear trend-line and compute an |R2| value
	for each y-axis column. The |R2| value, along with the Pearson correlation p-value computed with :func:`scipy.stats.pearsonr`, is then
	rendered next to the trend-line. 

	.. note::
		
		The function supports plotting multiple columns with respect to one axis, but the number of columns should be limited to 6 
		for optimal color assignment of the plot points. 

	.. note::

		The *options* kwarg can be used to customize the plot and may have the following key-value pairs:

		*	**axis** : a ``dict`` specifying the axis/window settings for the plot with the structure
			``{'x': {'start': x-axis min, 'end': x-axis max}, 'y': {'start': y-axis min, 'end': y-axis max}}``

	The function returns a dictionary with the following key-value pairs:

	*	**image** : *StringIO.StringIO* – :class:`StringIO.StringIO` object containing Base64 encoded PNG image of generated plot
	*	**axis** : *dict* – dictionary containing axis/window settings for the generated plot with the structure
		``{'x': {'start': x-axis min, 'end': x-axis max}, 'y': {'start': y-axis min, 'end': y-axis max}}``

	Args:
		df (pandas.DataFrame): data frame
		xIndex (int): index of column to plot on x-axis
		yIndices (list<int>, optional): indices of columns to plot on y-axis
		options (dict, optional): options dictionary

	Returns:
		dict: dictionary containing image and axis settings

	.. |R2| replace:: R\ :sup:`2`
	"""

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

def line(df, xIndex, yIndices, options={}):
	"""Uses ``matplotlib`` to generate a line chart of the specified :class:`pandas.DataFrame` column(s)

	This function uses :func:`matplotlib.axes.Axes.plot` function to plot a line chart, exports the chart to a PNG image
	and encodes the image into a string using Base64. 

	.. note::
		
		The function supports plotting multiple columns with respect to one axis, but the number of columns should be limited to 6 
		for optimal color assignment of the plot points. 

	.. note::

		The *options* kwarg can be used to customize the plot and may have the following key-value pairs:

		*	**axis** : a ``dict`` specifying the axis/window settings for the plot with the structure
			``{'x': {'start': x-axis min, 'end': x-axis max}, 'y': {'start': y-axis min, 'end': y-axis max}}``

	The function returns a dictionary with the following key-value pairs:

	*	**image** : *StringIO.StringIO* – :class:`StringIO.StringIO` object containing Base64 encoded PNG image of generated plot
	*	**axis** : *dict* – dictionary containing axis/window settings for the generated plot with the structure
		``{'x': {'start': x-axis min, 'end': x-axis max}, 'y': {'start': y-axis min, 'end': y-axis max}}``

	Args:
		df (pandas.DataFrame): data frame
		xIndex (int): index of column to plot on x-axis
		yIndices (list<int>, optional): indices of columns to plot on y-axis
		options (dict, optional): options dictionary

	Returns:
		dict: dictionary containing image and axis settings"""

	xColumn = df.columns[xIndex]
	yColumns = [df.columns[index] for index in yIndices]

	df = df.dropna(subset=[xColumn])

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

def date(df, xIndex, yIndices, options={}):
	"""Uses ``matplotlib`` to generate a time-series chart of the specified :class:`pandas.DataFrame` column(s)

	This function uses :func:`matplotlib.axes.Axes.plot` function to plot a line chart, exports the chart to a PNG image
	and encodes the image into a string using Base64. 

	.. note::
		
		The function supports plotting multiple columns with respect to one axis, but the number of columns should be limited to 6 
		for optimal color assignment of the plot points. 

	.. note::

		The *options* kwarg can be used to customize the plot and may have the following key-value pairs:

		*	**axis** : a ``dict`` specifying the axis/window settings for the plot with the structure
			``{'x': {'start': x-axis min, 'end': x-axis max}, 'y': {'start': y-axis min, 'end': y-axis max}}``.

			The values in the **axis** dictionary should be strings that are parseable using :func:`dateutil.parser.parse`

	The function returns a dictionary with the following key-value pairs:

	*	**image** : *StringIO.StringIO* – :class:`StringIO.StringIO` object containing Base64 encoded PNG image of generated plot
	*	**axis** : *dict* – dictionary containing axis/window settings for the generated plot with the structure
		``{'x': {'start': x-axis min, 'end': x-axis max}, 'y': {'start': y-axis min, 'end': y-axis max}}``

		The values in the **axis** dictionary are date strings formatted using the :meth:`ISO8601 date format <python:datetime.datetime.isoformat>`

	Args:
		df (pandas.DataFrame): data frame
		xIndex (int): index of column to plot on x-axis
		yIndices (list<int>, optional): indices of columns to plot on y-axis
		options (dict, optional): options dictionary

	Returns:
		dict: dictionary containing image and axis settings"""

	xColumn = df.columns[xIndex]
	yColumns = [df.columns[index] for index in yIndices]

	df = df.dropna(subset=[xColumn])
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