import numpy as np
import pandas as pd
import pytest
from dcs import clean

d = {'col1' : pd.Series([1., 2., 3., 4.], index=[0, 1, 3, 4]),
     'col2' : pd.Series([1., 2., 3., 4.], index=[0, 1, 2, 4]),
     'col3' : pd.Series([1., 2., 3., 4., 5.])}

df = pd.DataFrame(d)

#-----------------------------(fillDown)-----------------------------

#fill all columns of the dataframe
def test_fill_pad1():
	testing_df = df.copy()
	clean.fillDown(testing_df, 0, 1, 'pad')
	res = {'col1' : pd.Series([1., 2., 2., 3., 4.], index=[0, 1, 2, 3, 4]),
	'col2' : pd.Series([1., 2., 3., 3., 4.], index=[0, 1, 2, 3, 4]),
	'col3' : pd.Series([1., 2., 3., 4., 5.])}
	df_res = pd.DataFrame(res)
	assert (((testing_df.fillna(0) == df_res.fillna(0)).all()).all()) == True

#fill a single column of the dataframe
def test_fill_pad2():
	testing_df = df.copy()
	clean.fillDown(testing_df, 0, 0, 'pad')
	res = {'col1' : pd.Series([1., 2., 2., 3., 4.], index=[0, 1, 2, 3, 4]),
	'col2' : pd.Series([1., 2., 3., 4.], index=[0, 1, 2, 4]),
	'col3' : pd.Series([1., 2., 3., 4., 5.,])}
	df_res = pd.DataFrame(res)
	assert (((testing_df.fillna(0) == df_res.fillna(0)).all()).all()) == True

#dataframe column does not exist
def test_fill_pad3():
	testing_df = df.copy
	assert (clean.fillDown(testing_df, 4, 4, 'pad')) == False

#dataframe columnFrom > collumnTo
def test_fill_pad4():
	testing_df = df.copy() 
	clean.fillDown(testing_df, 1, 0,'pad')
	assert (clean.fillDown(testing_df, 3, 3, 'pad')) == False

#fill all columns of the dataframe
def test_fill_back1():
	testing_df =df.copy()
	clean.fillDown(testing_df, 0, 1, 'bfill')
	res = {'col1' : pd.Series([1., 2., 3., 3., 4.], index=[0, 1, 2, 3, 4]),
	'col2' : pd.Series([1., 2., 3., 4., 4.], index=[0, 1, 2, 3, 4]),
	'col3' : pd.Series([1., 2., 3., 4., 5.,])}
	df_res = pd.DataFrame(res)
	assert (((testing_df.fillna(0) == df_res.fillna(0)).all()).all()) == True

#fill a column that has no missing values
def test_fill_back2():
	testing_df = df.copy()
	clean.fillDown(testing_df, 2, 2, 'bfill')
	assert (((testing_df.fillna(0) == df.fillna(0)).all()).all()) == True

#-------------------------(invalid values)----------------------------------

#test for index positions of invalid values in a dataframe
def test_invalid1():
	testing_df = df.copy()
	result = clean.invalidValuesInDataFrame(testing_df)
	assert (result['col1']['hasInvalidValues'] == True)
	assert (result['col1']['invalidIndices'] == [2])
	assert (result['col2']['hasInvalidValues'] == True)
	assert (result['col2']['invalidIndices'] == [3])
	assert (result['col3']['hasInvalidValues'] == False)

#test for missing values in a dataaframe without any
def test_invalid2():
	testing_df = df.copy()
	result =clean.invalidValuesInDataFrame(testing_df.dropna())
	assert (result['col1']['hasInvalidValues'] == False)
	assert (result['col2']['hasInvalidValues'] == False)
	assert (result['col3']['hasInvalidValues'] == False)

#test for multiple missing values in a single column
def test_invalid3():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series([1., 2], index = [0, 4])
	result = clean.invalidValuesInDataFrame(testing_df)
	assert (result['col4']['hasInvalidValues'] == True)
	assert (result['col4']['invalidIndices'] == [1, 2, 3])

#---------------------------(interpolation)--------------------------------

#fill a single column of dataframe
def test_interpolate_polynomial1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.fillByInterpolation(testing_df, 0, 'polynomial', 2)
	result_df['col1'].interpolate(method='polynomial', order=2, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#fill a column that does not exist
def test_intrpolate_polynomial2():
	testing_df = df.copy()
	assert clean.fillByInterpolation(testing_df, 4, 'polynomial', 2) == False

#fill a single column of a dataframe
def test_interpolate_spline1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.fillByInterpolation(testing_df, 1, 'spline', 1)
	result_df['col2'].interpolate(method='spline', order=1, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#fill a single column of a dataframe
def test_interpolate_linear1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.fillByInterpolation(testing_df, 1, 'linear', 6)
	result_df['col2'].interpolate(method='linear', inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#fill a single column of a dataframe
def test_interpolate_pchip1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.fillByInterpolation(testing_df, 0, 'PCHIP', 4)
	result_df['col1'].interpolate(method='pchip',inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#apply to a column that has no missing values
def test_interpolate_all1():
	testing_df = df.copy()
	clean.fillByInterpolation(testing_df, 2, 'linear', 4)
	assert (((testing_df.fillna(0) == df.fillna(0)).all()).all()) == True

#-----------------------------(custom value)-------------------------------------

#fill missing values in a single column with a custom value
def test_custom_value1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.fillWithCustomValue(testing_df, 1, 'testValue')
	result_df['col2'].fillna(value='testValue', inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#select a column that does not exist
def test_custom_value2():
	testing_df = df.copy()
	assert clean.fillWithCustomValue(testing_df, 6, 'testValue') == False

#-----------------------------(fill with average)----------------------------------

#fill missng values in a single column with an average
def test_average_mean1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.fillWithAverage(testing_df, 1, 'mean')
	average = result_df['col2'].mean()
	result_df['col2'].fillna(value=average, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

def test_average_median1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.fillWithAverage(testing_df, 1, 'median')
	average = result_df['col2'].median()
	result_df['col2'].fillna(value=average, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#select a column that is already full
def test_average_all2():
	testing_df = df.copy()
	clean.fillWithAverage(testing_df, 2, 'mean')
	assert (((testing_df.fillna(0) == df.fillna(0)).all()).all()) == True


#---------------------------------(normalize)-----------------------------------------

#test normalistaion on a single column using a positive range
def test_normalize1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.normalize(testing_df, 1, 0 ,18)
	result_df['col2'] = 0 + ((result_df['col2'] - result_df['col2'].min()) * (18 - 0)) / (result_df['col2'].max() - result_df['col2'].min())
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True


#test normalistaion on a single column using a negative range
def test_normalize2():
	testing_df = df.copy()
	result_df = df.copy()
	clean.normalize(testing_df, 1, -3 , -18)
	result_df['col2'] = -3 + ((result_df['col2'] - result_df['col2'].min()) * (-18 - (-3))) / (result_df['col2'].max() - result_df['col2'].min())
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#nomalize a column that has a range = 0
def test_normalize3():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series([1, 1, 1], index = [0, 1, 2])
	result_df = testing_df.copy()
	clean.normalize(testing_df, 3, 0 , 18)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#-----------------------------------(standardize)---------------------------------------

#test standardisation on a single column
def test_standardize1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.standardize(testing_df, 0)
	result_df['col1'] = (result_df['col1'] - result_df['col1'].mean()) / result_df['col1'].std()
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test on a column index that does not exist
def test_standaardize2():
	testing_df = df.copy()
	assert clean.standardize(testing_df, 6,) == False

#standardize a column that has a standard deviation = 0
def test_standardize3():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series([1, 1, 1], index = [0, 1, 2])
	result_df = testing_df.copy()
	clean.standardize(testing_df, 3)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True


