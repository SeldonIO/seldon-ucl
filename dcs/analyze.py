# -*- coding: utf-8 -*- 

import pandas as pd
import numpy as np
import datetime

def textAnalysis(series):
	"""Analyzes a :class:`pandas.Series` of type ``str``, returning a dictionary containing computed statistics

	The returned dictionary has the following structure: {*metric*: *value*}. The calculated metrics are:

	*	**word_count_min**: minimum number of words in each row
	*	**word_count_max**: maximum number of words in each row
	*	**word_count_average**: average number of words in each row
	*	**word_length_min**: length of shortest word
	*	**word_length_max**: length of longets word
	*	**word_total**: total number of words
	*	**word_mode**: most frequently occurring word
	*	**word_mode_frequency**: frequency of **word_mode**
	*	**word_frequencies**: a ``list<tuple<str, int>>`` object containing top 50 words (by frequency) and their counts
	*	**invalid**: number of invalid values

	The returned dictionary will also contain the general statistical metrics returned by :func:`dcs.analyze.genericAnalysis`

	Args:
		series (pandas.Series): series to analyze

	Returns:
		dict: dictionary containing statistical metric–value pairs
	"""

	analysis = {}
	minWordCount = float('inf')
	maxWordCount = 0
	totalWords = 0
	wordCounts = {}
	sumOfWordLengths = 0
	wordFrequencies = []
	frequencyCount = 0

	averageWordsPerCell = 0
	minWordLength = float('inf')
	maxWordLength = 0

	for row in series:
		if pd.notnull(row):
			words = str(row).split()
			numberOfWords = len(words)
			if numberOfWords < minWordCount:
				minWordCount = numberOfWords
			if numberOfWords > maxWordCount:
				maxWordCount = numberOfWords
			totalWords += numberOfWords

			for word in words:
				wordLength = len(word)
				wordCounts[word] = wordCounts.get(word, 0) + 1
				sumOfWordLengths += wordLength
				if wordLength < minWordLength:
					minWordLength = wordLength
				elif wordLength > maxWordLength:
					maxWordLength = wordLength

	averageWordLength = sumOfWordLengths / totalWords if totalWords > 0 else 0 
	averageWordCount = totalWords / series.count() if series.count() > 0 else 0

	uniqueWords = 0
	maxCount = 0
	mostProminentWords = []
	for word, count in wordCounts.iteritems():
		uniqueWords += 1
		if count > maxCount:
			maxCount = count
			mostProminentWords = [word]
			maxCount = count
		elif count == maxCount:
			mostProminentWords.append(word)
	for w in sorted(wordCounts, key=wordCounts.get, reverse=True):
			if frequencyCount < 50:
				wordFrequencies.append((w, wordCounts[w]))
				frequencyCount += 1
			else:
				break
	#wordFrequencies = {k: wordCounts[k] for k in wordCounts.keys()[:50]}


	analysis = {}
	analysis["word_count_min"] = minWordCount
	analysis["word_count_max"] = maxWordCount
	analysis["word_count_average"] = averageWordCount
	analysis["word_length_min"] = minWordLength
	analysis["word_length_max"] = maxWordLength
	analysis["word_length_average"] = averageWordLength
	analysis["word_total"] = totalWords
	analysis["word_unique_count"] = uniqueWords
	analysis["word_mode"] = mostProminentWords
	analysis["word_mode_frequency"] = maxCount
	analysis["word_frequencies"] = wordFrequencies
	analysis["invalid"] = series.isnull().sum()
	analysis.update(genericAnalysis(series))

	return analysis

def numericalAnalysis(series):
	"""Analyzes a :class:`pandas.Series` of numerical type, returning a dictionary containing computed statistics

	The returned dictionary has the following structure: {*metric*: *value*}. On top of the metrics calculated by :meth:`pandas.Series.describe` which include
	quartiles and various averages, the calculated metrics are:

	*	**range**: difference between maximum and minium 
	*	**invalid**: number of invalid values

	The returned dictionary will also contain the general statistical metrics returned by :func:`dcs.analyze.genericAnalysis`

	Args:
		series (pandas.Series): series to analyze

	Returns:
		dict: dictionary containing statistical metric–value pairs

	Raises:
		ValueError: if provided :class:`pandas.Series` not of numerical data type
	"""

	if not(type(series) is pd.Series and issubclass(series.dtype.type, np.number)):
		raise ValueError('dcs.analyze.numericalAnalysis takes number pandas.Series as parameter')
	
	analysis = series.describe().to_dict()
	del analysis["count"]
	analysis["range"] = analysis["max"] - analysis["min"]
	analysis.update(genericAnalysis(series))
	analysis["invalid"] = series.isnull().sum()

	return analysis 

def dateAnalysis(series):
	"""Analyzes a :class:`pandas.Series` of type ``datetime``, returning a dictionary containing computed statistics

	The returned dictionary has the following structure: {*metric*: *value*}. The calculated metrics are:

	*	**max**
	*	**min**
	*	**median**
	*	**invalid**: number of invalid values

	The returned dictionary will also contain the general statistical metrics returned by :func:`dcs.analyze.genericAnalysis`

	Args:
		series (pandas.Series): series to analyze

	Returns:
		dict: dictionary containing statistical metric–value pairs

	Raises:
		ValueError: if provided :class:`pandas.Series` not of datetime data type
	"""

	if not(type(series) is pd.Series and issubclass(series.dtype.type, np.datetime64)):
		raise ValueError('dcs.analyze.dateAnalysis takes datetime pandas.Series as parameter')

	analysis = genericAnalysis(series)
	if 'mode' in analysis:
		analysis['mode'] = [datetime.datetime.strftime(x, "%Y-%m-%dT%H:%M:%SZ") for x in analysis['mode']]

	analysis['frequencies'] = [(datetime.datetime.strftime(value, "%Y-%m-%dT%H:%M:%SZ"), count) for (value, count) in analysis['frequencies']]

	sortedDates = series[series.notnull()].sort_values()
	if len(sortedDates) > 0:
		minimum = sortedDates.iloc[0]
		maximum = sortedDates.iloc[-1]
		median = sortedDates.iloc[len(sortedDates) / 2] if len(sortedDates) % 2 == 1 else sortedDates.iloc[(len(sortedDates) / 2) - 1] + (sortedDates.iloc[len(sortedDates) / 2] - sortedDates.iloc[(len(sortedDates) / 2) - 1]) / 2

	analysis["invalid"] = series.isnull().sum()
	analysis["max"] = datetime.datetime.strftime(maximum, "%Y-%m-%dT%H:%M:%SZ")
	analysis["median"] = datetime.datetime.strftime(median, "%Y-%m-%dT%H:%M:%SZ")
	analysis["min"] = datetime.datetime.strftime(minimum, "%Y-%m-%dT%H:%M:%SZ")

	return analysis

def genericAnalysis(series):
	"""Computes various general statistics on a :class:`pandas.Series` object, returning a dictionary containing computed metrics

	The returned dictionary has the following structure: {*metric*: *value*}. The calculated metrics are:
	
	*	**unique_count**: total number of unique values
	*	**frequencies**: a ``list<tuple<str, int>>`` object containing top 50 most commonly occurring values and their frequencies
	*	**mode**: a list of the most frequently occurring value
	*	**mode_count**: frequency of mode(s)

	Args:
		series (pandas.Series): series to analyze

	Returns:
		dict: dictionary containing statistical metric–value pairs
	"""

	counts = series.value_counts()
	mostFrequentValues = []
	frequencies = []
	firstCount = None
	for value, count in counts.iteritems():
		if firstCount is None:
			firstCount = count
		
		if count is firstCount:
			mostFrequentValues.append(value)

		frequencies.append((value, count))

	toReturn = {'unique_count' : len(counts)}
	toReturn['frequencies'] = frequencies
	
	if (len(mostFrequentValues) is 1 or len(mostFrequentValues) < toReturn["unique_count"]) and len(mostFrequentValues) > 0:
		toReturn['mode'] = mostFrequentValues
		toReturn['mode_frequency'] = firstCount

	return toReturn

def analysisForColumn(df, column):
	"""Computes statistics on a :class:`pandas.DataFrame` column, returning a dictionary containing computed metrics

	The function detects the data type of the :class:`pandas.Series` object, and delegates the actual analysis to the appropriate analysis function:

	*	:func:`dcs.analyze.numericalAnalysis` for numerical
	*	:func:`dcs.analyze.textAnalysis` for string
	*	:func:`dcs.analyze.dateAnalysis` for datetime

	Args:
		df (pandas.DataFrame): data frame
		column (str): name of column to analyze

	Returns:
		dict: dictionary containing statistical metric–value pairs
	"""

	series = df[column]
	analysis = {}
	if issubclass(series.dtype.type, np.number):
		analysis = numericalAnalysis(series)
	elif issubclass(series.dtype.type, np.datetime64):
		analysis = dateAnalysis(series)
	else:
		analysis = textAnalysis(series)

	return analysis