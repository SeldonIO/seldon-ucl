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
		minWordsCell = float('inf')
		maxWordsCell = 0
		totalWords = 0
		wordCounts = {}
		sumOfWordLengths = 0
		averageWordsPerCell = 0
		wordMinLength = float('inf')
		wordMaxLength = 0

		for row in series:
			if(pd.isnull(row) == False):
				words = str(row).split()
				numberOfWords = len(words)
				if numberOfWords < minWordsCell:
					minWordsCell = numberOfWords
				if numberOfWords > maxWordsCell:
					maxWordsCell = numberOfWords

				totalWords += numberOfWords

				for word in words:
					wordCounts[word] = wordCounts.get(word, 0) + 1
					sumOfWordLengths += len(word)
					wordLength = 0
					for letters in word:
						wordLength +=1
					if wordLength < wordMinLength:
						wordMinLength = wordLength
					elif wordLength > wordMaxLength:
						wordMaxLength = wordLength

		averageWordLength = sumOfWordLengths / totalWords
		averageWordsPerCell = totalWords / series.count()

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
		analysis["word_cell_min"] = minWordsCell
		analysis["word_cell_max"] = maxWordsCell
		analysis["word_cell_range"] = maxWordsCell - minWordsCell
		analysis["word_average_length"] = averageWordLength
		analysis["word_total"] = totalWords
		analysis["word_unique"] = uniqueWords
		analysis["word_mode"] = mostProminentWords
		analysis["word_mode_count"] = maxCount
		analysis["word_cell_average"] = averageWordsPerCell
		analysis["word_max_length"] = wordMaxLength
		analysis["word_min_length"] = wordMinLength
		analysis["word_range"] = wordMaxLength - wordMinLength
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