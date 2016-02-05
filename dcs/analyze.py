import pandas as pd
import numpy as np

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

def textAnalysis(series):
	analysis = None
	if type(series) is pd.Series:
		analysis = {}
		minWordCount = float('inf')
		maxWordCount = 0
		totalWords = 0
		wordCounts = {}
		sumOfWordLengths = 0

		averageWordsPerCell = 0
		minWordLength = float('inf')
		maxWordLength = 0

		for row in series:
			if pd.isnull(row) == False:
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

		averageWordLength = sumOfWordLengths / totalWords
		averageWordCount = totalWords / series.count()

		uniqueWords = 0
		maxCount = 0
		mostProminentWords = []
		for word, count in wordCounts.iteritems():
			uniqueWords += 1
			if count > maxCount:
				maxCount = count
				mostProminentWords = [word]
			elif count == maxCount:
				mostProminentWords.append(word)
				
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
		analysis.update(calculateModeAndUniqueCount(series))

	return analysis

def numericalAnalysis(series):
	analysis = None
	if type(series) is pd.Series and issubclass(series.dtype.type, np.number):
		analysis = series.describe().to_dict()
		del analysis["count"]
		analysis["range"] = analysis["max"] - analysis["min"]
		analysis.update(calculateModeAndUniqueCount(series))

	return analysis 

def dateAnalysis(series):
	analysis = None
	if type(series) is pd.Series and issubclass(series.dtype.type, np.datetime64):
		analysis = series.describe().to_dict()
		for key in analysis:
			analysis[key] = str(analysis[key])

	return analysis 

# Returns a dictionary with the following keys:
#	'unique_count, 'mode' (if mode exists), and 'mode_frequency' (if mode exists) 
def calculateModeAndUniqueCount(series):
	counts = series.value_counts()
	mostFrequentValues = []
	firstCount = None
	for value, count in counts.iteritems():
		if firstCount is None:
			firstCount = count

		if count == firstCount:
			mostFrequentValues.append(value)
		else:
			break

	toReturn = {'unique_count' : len(counts)}
	if len(mostFrequentValues) < toReturn["unique_count"] and len(mostFrequentValues) > 0:
		toReturn['mode'] = mostFrequentValues
		toReturn['mode_frequency'] = firstCount

	return toReturn

def analysisForColumn(df, column):
	if type(df) is pd.DataFrame and column in df.columns:
		series = df[column]
		analysis = {}
		if issubclass(series.dtype.type, np.number):
			analysis = numericalAnalysis(series)
		elif issubclass(series.dtype.type, np.datetime64):
			analysis = dateAnalysis(series)
		else:
			analysis = textAnalysis(series)

		return analysis
	else:
		return None