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
		minLength = float('inf')
		maxLength = 0
		totalWords = 0
		wordCounts = {}
		sumOfWordLengths = 0

		for row in series:
			if row is not None:
				words = str(row).split()
				numberOfWords = len(words)
				if numberOfWords < minLength:
					minLength = numberOfWords
				if numberOfWords > maxLength:
					maxLength = numberOfWords

				totalWords += numberOfWords

				for word in words:
					wordCounts[word] = wordCounts.get(word, 0) + 1
					sumOfWordLengths += len(word)

		averageWordLength = sumOfWordLengths / totalWords

		uniqueWords = 0
		maxCount = 0
		mostProminentWords = []
		for word, count in wordCounts.iteritems():
			uniqueWords += 1
			if count > maxCount:
				mostProminentWords = [word]
				maxCount = count
			elif count == maxCount:
				mostProminentWords.append(word)

		analysis = {}
		analysis["word_length_min"] = minLength
		analysis["word_length_max"] = maxLength
		analysis["word_length_range"] = maxLength - minLength
		analysis["word_length_average"] = averageWordLength
		analysis["word_total"] = totalWords
		analysis["word_unique"] = uniqueWords
		analysis["word_mode"] = mostProminentWords
		analysis["word_mode_count"] = maxCount
	return analysis

def numericalAnalysis(series):
	analysis = None
	if type(series) is pd.Series and issubclass(series.dtype.type, np.number):
		analysis = series.describe().to_dict()
		del analysis["count"]
		analysis["range"] = analysis["max"] - analysis["min"]

	return analysis 

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

		analysis["unique"] = len(counts)
		if len(mostFrequentValues) < analysis["unique"] and len(mostFrequentValues) > 0:
			analysis["mode"] = mostFrequentValues
			analysis["mode_count"] = firstCount
		else:
			analysis["mode"] = None

		return analysis
	else:
		return None