import numpy as np 
import pandas as pd 
import pytest
from dcs import analyze

d = {'col1' : pd.Series([1, 2, 2, 2., 3, 3, 3, 4]),
     'col2' : pd.Series(['helloy', 'hello bello', 'hello world 1', 'world', '1 2 3 4 5 6', 'random'])}

df = pd.DataFrame(d)

#-------------------------(test analysis for string datatype)------------------------

#test min word length
def test_string_min_length():
	test_series = df['col2']
	test_analysis = analyze.textAnalysis(test_series)
	print(test_analysis)
	assert test_analysis["word_length_min"] == 1

# #test max word length
# def test_string_max_length():
# 	test_series = df['col2']
# 	test_analysis = analyze.textAnalysis(test_series)
# 	assert test_analysis["word_length_max"] == 6


# #test word length range
# def test_string_range():
# 	test_series = df['col2']
# 	test_analysis = analyze.textAnalysis(test_series)
# 	assert test_analysis["word_length_range"] == 5

# #test word length average
# def test_string_average():
# 	test_series = df['col2']
# 	test_analysis = analyze.textAnalysis(test_series)
# 	assert test_analysis["word_length_average"] == 4

# #test total number of words
# def test_total_words():
# 	test_series = df['col2']
# 	test_analysis = analyze.textAnalysis(test_series)
# 	assert test_analysis["word_total"] == 6

# #test number of unique words
# def test_unique_words():
# 	test_series = df['col2']
# 	test_analysis = analyze.textAnalysis(test_series)
# 	assert test_analysis["word_unique"] == 4

# #test the most common word(s)
# def test_common_word():
# 	test_series = df['col2']
# 	test_analysis = analyze.textAnalysis(test_series)
# 	assert test_analysis["word_mode"] == ['world', 'hello']

# #test occurences of the most common word(s)
# def test_common_word_mode():
# 	test_series = df['col2']
# 	test_analysis = analyze.textAnalysis(test_series)
# 	assert test_analysis["word_mode_count"] == 2

# #------------------------(test analysis for numeric types)-----------------------

# #test standard deviation
# def test_numeric_sd():
# 	test_series = df['col1']
# 	test_analysis = analyze.numericalAnalysis(test_series)
# 	assert test_analysis["std"] == test_series.std()

# #test minimum value
# def test_numeric_min():
# 	test_series = df['col1']
# 	test_analysis = analyze.numericalAnalysis(test_series)
# 	assert test_analysis["min"] == test_series.min()

# #test maximum value
# def test_numeric_sd():
# 	test_series = df['col1']
# 	test_analysis = analyze.numericalAnalysis(test_series)
# 	assert test_analysis["max"] == test_series.max()

# #test mean
# def test_numeric_mean():
# 	test_series = df['col1']
# 	test_analysis = analyze.numericalAnalysis(test_series)
# 	assert test_analysis["mean"] == test_series.mean()

# #test lower quartile value
# def test_numeric_lowerQ():
# 	test_series = df['col1']
# 	test_analysis = analyze.numericalAnalysis(test_series)
# 	assert test_analysis["25%"] == test_series.quantile(0.25)

# #test upper quartile value
# def test_numeric_upperQ():
# 	test_series = df['col1']
# 	test_analysis = analyze.numericalAnalysis(test_series)
# 	assert test_analysis["75%"] == test_series.quantile(0.75)

# #test middle quartile value
# def test_numeric_middleQ():
# 	test_series = df['col1']
# 	test_analysis = analyze.numericalAnalysis(test_series)
# 	assert test_analysis["50%"] == test_series.quantile(0.50)

# #test range of numbers
# def test_numeric_range():
# 	test_series = df['col1']
# 	test_analysis = analyze.numericalAnalysis(test_series)
# 	assert test_analysis["range"] == (test_series.max() - test_series.min())

# #------------------------(test analysis for columns)----------------------------

# #test upper quartile value
# def test_numeric_sd():
# 	test_series = df.copy()
# 	test_analysis = analyze.analysisForColumn(test_series, 'col1')
# 	assert test_analysis["25%"] == test_series.quantile(0.50)



















