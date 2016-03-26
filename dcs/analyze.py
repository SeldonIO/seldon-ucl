import pandas as pd
import numpy as np
import datetime

def textAnalysis(series):
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
	if not(type(series) is pd.Series and issubclass(series.dtype.type, np.number)):
		raise ValueError('dcs.analyze.numericalAnalysis takes number pandas.Series as parameter')
	
	analysis = series.describe().to_dict()
	del analysis["count"]
	analysis["range"] = analysis["max"] - analysis["min"]
	analysis.update(genericAnalysis(series))
	analysis["invalid"] = series.isnull().sum()

	return analysis 

def dateAnalysis(series):
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

# Returns a dictionary with the following keys:
#	'unique_count' (number of unique values), 'frequencies' (list of value-frequency tuples), 'mode' (if mode exists), and 'mode_frequency' (if mode exists) 
def genericAnalysis(series):
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
	series = df[column]
	analysis = {}
	if issubclass(series.dtype.type, np.number):
		analysis = numericalAnalysis(series)
	elif issubclass(series.dtype.type, np.datetime64):
		analysis = dateAnalysis(series)
	else:
		analysis = textAnalysis(series)

	return analysis