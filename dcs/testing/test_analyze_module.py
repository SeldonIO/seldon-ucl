import numpy as np 
import pandas as pd 
import pytest
from dcs import analyze
import datetime

d = {'col1' : pd.Series([1, 2, 2, 2, 3, 3, 3, 4]),
     'col2' : pd.Series(['hello hello', 'hello world 2', 'world world', '1 world', 'random', 'random'])}

df = pd.DataFrame(d)

#-------------------------(test analysis for string datatype)------------------------

#test min word length
def test_string_min_length():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["word_length_min"] == 1

#test max word length
def test_string_max_length():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["word_length_max"] == 6

#test word length average
def test_string_average():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["word_length_average"] == 4

#test max words in an entry
def test_words_max():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["word_count_max"] == 3

#test min words in an entry
def test_words_min():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["word_count_min"] == 1

#test average words in an entry
def test_words_average():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["word_count_average"] == 1

#test total number of words
def test_total_words():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["word_total"] == 11

#test number of unique words
def test_unique_words():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["word_unique_count"] == 5

#test the most common word(s)
def test_common_word():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["word_mode"] == ['world']

#test occurences of the most common word(s)
def test_common_word_mode():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["word_mode_frequency"] == 4

#test word frequencies
def test_word_frequency():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["word_frequencies"] == [('world', 4), ('hello', 3), ('random', 2), ('1', 1), ('2', 1)]

#test number of invalid entries
def test_invalid_entries():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["invalid"] == 2

#test number of unique entries
def test_unique_entries():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["unique_count"] == 5

#test frequncies of entries
def test_frequencies_entries():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["frequencies"] == [('random', 2), ('1 world', 1), ('hello world 2', 1), ('hello hello', 1), ('world world', 1)]

#test mode of entries
def test_mode_entries():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["mode"] == ['random']

#test mode count for entries
def test_mode_count_entries():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	assert test_analysis["mode_frequency"] == 2

#------------------------(test analysis for numeric types)-----------------------

#test standard deviation
def test_numeric_sd():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["std"] == test_series.std()

#test minimum value
def test_numeric_min():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["min"] == test_series.min()

#test maximum value
def test_numeric_max():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["max"] == test_series.max()

#test mean
def test_numeric_mean():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["mean"] == test_series.mean()

#test lower quartile value
def test_numeric_lowerQ():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["25%"] == test_series.quantile(0.25)

#test upper quartile value
def test_numeric_upperQ():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["75%"] == test_series.quantile(0.75)

#test middle quartile value
def test_numeric_middleQ():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["50%"] == test_series.quantile(0.50)

#test range of numbers
def test_numeric_range():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["range"] == (test_series.max() - test_series.min())

#test unique values count
def test_numeric_unique_count():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["unique_count"] == 4

#test frequencies of entries
def test_numeric_frequencies():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["frequencies"] == [(3, 3), (2, 3), (4, 1), (1, 1)]

#test mode
def test_numeric_mode():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["mode"] == [3]

#test mode count
def test_numeric_mode_count():
	test_series = df['col1']
	test_analysis = analyze.numericalAnalysis(test_series)
	assert test_analysis["mode_frequency"] == 3


#------------------------(test analysis for date types)----------------------------

date_stngs = ('2008-12-20','2008-12-20','2000-12-22','2010-12-23')
date_series = pd.Series([pd.to_datetime(date) for date in date_stngs])

#test mode for date
def test_date_mode():
	test_series = date_series
	print test_series[0].isoformat()
	test_analysis = analyze.dateAnalysis(test_series)
	assert test_analysis["mode"] == ['2008-12-20T00:00:00Z']

#test mode count for date
def test_date_mode_count():
	test_series = date_series
	print test_series[0].isoformat()
	test_analysis = analyze.dateAnalysis(test_series)
	assert test_analysis["mode_frequency"] == 2

#test frequencies of date entries
def test_date_freqquencies():
	test_series = date_series
	print test_series[0].isoformat()
	test_analysis = analyze.dateAnalysis(test_series)
	assert test_analysis["frequencies"] == [('2008-12-20T00:00:00Z', 2), ('2010-12-23T00:00:00Z', 1), ('2000-12-22T00:00:00Z', 1)]

#test mode count for date
def test_date_mode_count():
	test_series = date_series
	print test_series[0].isoformat()
	test_analysis = analyze.dateAnalysis(test_series)
	assert test_analysis["mode_frequency"] == 2

#test invalid count for date
def test_date_invalid_count():
	test_series = date_series
	print test_series[0].isoformat()
	test_analysis = analyze.dateAnalysis(test_series)
	assert test_analysis["invalid"] == 0

#test max for date
def test_date_max():
	test_series = date_series
	print test_series[0].isoformat()
	test_analysis = analyze.dateAnalysis(test_series)
	assert test_analysis["max"] == "2010-12-23T00:00:00Z"

#test min for date
def test_date_min():
	test_series = date_series
	print test_series[0].isoformat()
	test_analysis = analyze.dateAnalysis(test_series)
	assert test_analysis["min"] == "2000-12-22T00:00:00Z"

#test median for date
def test_date_median():
	test_series = date_series
	print test_series[0].isoformat()
	test_analysis = analyze.dateAnalysis(test_series)
	assert test_analysis["median"] == "2008-12-20T00:00:00Z"

#test unique entries count or date
def test_date_unique_count():
	test_series = date_series
	print test_series[0].isoformat()
	test_analysis = analyze.dateAnalysis(test_series)
	assert test_analysis["unique_count"] == 3
