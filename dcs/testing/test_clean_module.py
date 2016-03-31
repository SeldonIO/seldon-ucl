import numpy as np
import pandas as pd
import pytest
from dcs import clean

d = {'col1' : pd.Series([1., 2., 3., 4.], index=[0, 1, 3, 4]),
     'col2' : pd.Series([1., 2., 2., 4.], index=[0, 1, 2, 4]),
     'col3' : pd.Series([1., 2., 3., 4., 5.])}

df = pd.DataFrame(d)

#-----------------------------(fillDown)-----------------------------

#fill all columns of the dataframe
def test_fill_pad1():
	testing_df = df.copy()
	clean.fillDown(testing_df, 0, 1, 'pad')
	res = {'col1' : pd.Series([1., 2., 2., 3., 4.], index=[0, 1, 2, 3, 4]),
	'col2' : pd.Series([1., 2., 2., 2., 4.], index=[0, 1, 2, 3, 4]),
	'col3' : pd.Series([1., 2., 3., 4., 5.])}
	df_res = pd.DataFrame(res)
	assert (((testing_df.fillna(0) == df_res.fillna(0)).all()).all()) == True

#fill a single column of the dataframe
def test_fill_pad2():
	testing_df = df.copy()
	clean.fillDown(testing_df, 0, 0, 'pad')
	res = {'col1' : pd.Series([1., 2., 2., 3., 4.], index=[0, 1, 2, 3, 4]),
	'col2' : pd.Series([1., 2., 2., 4.], index=[0, 1, 2, 4]),
	'col3' : pd.Series([1., 2., 3., 4., 5.,])}
	df_res = pd.DataFrame(res)
	assert (((testing_df.fillna(0) == df_res.fillna(0)).all()).all()) == True

#dataframe column does not exist
def test_fill_pad3():
	testing_df = df.copy
	with pytest.raises(Exception):
		clean.fillDown(testing_df, 4, 4, 'pad')

#dataframe columnFrom > collumnTo
def test_fill_pad4():
	testing_df = df.copy() 
	clean.fillDown(testing_df, 1, 0,'pad')
	with pytest.raises(Exception):
		clean.fillDown(testing_df, 3, 3, 'pad')

#fill all columns of the dataframe
def test_fill_back1():
	testing_df =df.copy()
	clean.fillDown(testing_df, 0, 1, 'bfill')
	res = {'col1' : pd.Series([1., 2., 3., 3., 4.], index=[0, 1, 2, 3, 4]),
	'col2' : pd.Series([1., 2., 2., 4., 4.], index=[0, 1, 2, 3, 4]),
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

#test for missing/invalid values in a dataframe without any
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
	with pytest.raises(Exception):
		clean.fillByInterpolation(testing_df, 4, 'polynomial', 2)

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
	with pytest.raises(Exception):
		clean.fillWithCustomValue(testing_df, 6, 'testValue')

#-----------------------------(fill with average)----------------------------------

#fill missng values in a single column with mean value
def test_average_mean1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.fillWithAverage(testing_df, 1, 'mean')
	average = result_df['col2'].mean()
	result_df['col2'].fillna(value=average, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#fill missng values in a single column with median value
def test_average_median1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.fillWithAverage(testing_df, 1, 'median')
	average = result_df['col2'].median()
	result_df['col2'].fillna(value=average, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#fill missng values in a single column with mode value
def test_average_mode1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.fillWithAverage(testing_df, 1, 'mode')
	average = 2
	result_df['col2'].fillna(value=average, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#fill missng values in a single column with mode when there are multiple modes
def test_average_mode2():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series([2., 2., 3., 3.], index=[0, 1, 4, 5])
	result_df = testing_df.copy()
	clean.fillWithAverage(testing_df, 3, 'mode')
	average = 2
	result_df['col4'].fillna(value=average, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#select a column that is already full
def test_average_all2():
	testing_df = df.copy()
	clean.fillWithAverage(testing_df, 2, 'mean')
	assert (((testing_df.fillna(0) == df.fillna(0)).all()).all()) == True

#select a column that does not exist
def test_average_all3():
	testing_df = df.copy()
	with pytest.raises(Exception):
		clean.fillWithAverage(testing_df, 10, 'mean')


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

#nomalize a column that does not exist
def test_normalize4():
	testing_df = df.copy()
	with pytest.raises(Exception):
		clean.normalize(testing_df, 20, 0 , 18)

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
	with pytest.raises(Exception):
		clean.standardize(testing_df, 6,)

#standardize a column that has a standard deviation = 0
def test_standardize3():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series([1, 1, 1], index = [0, 1, 2])
	result_df = testing_df.copy()
	clean.standardize(testing_df, 3)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#-------------------------------(delete rows with na)----------------------------------

#test deleting all rows in a single column that have NA values
def test_delete_na1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.deleteRowsWithNA(testing_df, 0)
	result_df.dropna(subset=['col1'], inplace=True)
	result_df.reset_index(drop=True, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test deleting rows that have na on a column with no NA values
def test_delete_na2():
	testing_df = df.copy()
	result_df = df.copy()
	clean.deleteRowsWithNA(testing_df, 2)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#select a column that does not exist
def test_delete_na3():
	testing_df = df.copy()
	with pytest.raises(Exception):
		clean.deleteRowsWithNA(testing_df, 16) 

#----------------------------------(find and replace)-------------------------------

#test replacing a single type of value in a single column (Numeric)
def test_find_replace1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.findReplace(result_df, 0, [2], [8], False)
	testing_df['col1'].replace(to_replace=2, value=8, regex=False, inplace=True)
	result_df = result_df.astype(float)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test replacing multiple values in a single column (Numeric)
def test_find_replace2():
	testing_df = df.copy()
	result_df = df.copy()
	clean.findReplace(result_df, 0, [2, 3], [8, 10], False)
	testing_df['col1'].replace(to_replace=2, value=8, regex=False, inplace=True)
	testing_df['col1'].replace(to_replace=3, value=10, regex=False, inplace=True)
	result_df = result_df.astype(float)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test replacing a value that dose not exist in a column (Numeric)
def test_find_replace3():
	testing_df = df.copy()
	result_df = df.copy()
	clean.findReplace(result_df, 0, [16], [32], False)
	result_df = result_df.astype(float)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test replacing a single type of value in a column (String)
def test_find_replace4():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series(['hello', 'world', 'wild'], index = [0, 1, 2])
	result_df = testing_df.copy()
	clean.findReplace(result_df, 0, ['hello'], ['bello'], False)
	testing_df['col1'].replace(to_replace='hello', value='bello', regex=False, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test replacing a multiple values in a column (String)
def test_find_replace5():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series(['hello', 'world', 'wild'], index = [0, 1, 2])
	result_df = testing_df.copy()
	clean.findReplace(result_df, 0, ['hello', 'wild', 'world'], ['bello', 'bello', 'bello'], False)
	testing_df['col1'].replace(to_replace='hello', value='bello', regex=False, inplace=True)
	testing_df['col1'].replace(to_replace='wild', value='bello', regex=False, inplace=True)
	testing_df['col1'].replace(to_replace='world', value='bello', regex=False, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test replacing all number values using regex in a column (Numeric)
def test_find_replace6():
	testing_df = df.copy()
	result_df = df.copy()
	clean.findReplace(result_df, 0, ["[0-9]+\.?[0-9]*"], [32], True)
	testing_df['col1'].replace(to_replace='[0-9]+\.?[0-9]*', value='32', regex=True, inplace=True)
	result_df = result_df.astype(float)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test replacing all string values using regex in a column (String)
def test_find_replace7():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series(['hello', 'world', 'wild'], index = [0, 1, 2])
	result_df = testing_df.copy()
	clean.findReplace(result_df, 3, [".*"], ['hello'], True)
	testing_df['col4'].replace(to_replace='.*', value='hello', regex=True, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#select a column that does not exist
def test_find_replace8():
	testing_df = df.copy()
	with pytest.raises(Exception):
		clean.findReplace(testing_df, 30, [".*"], ['hello'], True) 

#------------------------------------(Geneate Dummies)----------------------------------------

#test genearting dummies on a column with NA values
def test_generate_dummies1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.generateDummies(testing_df, 0 , False)
	result_df.insert(1, 'col1_1.0', [1,0,0,0,0], allow_duplicates=True)
	result_df.insert(2, 'col1_2.0', [0,1,0,0,0], allow_duplicates=True)
	result_df.insert(3, 'col1_3.0', [0,0,0,1,0], allow_duplicates=True)
	result_df.insert(4, 'col1_4.0', [0,0,0,0,1], allow_duplicates=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test genearting dummies on a column with a single repeated value which is a string
def test_generate_dummies2():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series(['hello'], index = [2])
	result_df = testing_df.copy()
	clean.generateDummies(testing_df, 3 , False)
	result_df.insert(4, 'col4_hello', [0,0,1,0,0], allow_duplicates=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#select a column that does not exist
def test_generate_dummmies3():
	testing_df = df.copy()
	with pytest.raises(Exception):
		clean.generateDummies(testing_df, 30 , False)

#----------------------------------(insert Duplicate Column)----------------------------------

#test adding a duplicate column to a dataframe
def test_duplicate_column1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.insertDuplicateColumn(testing_df, 0)
	result_df.insert(1, 'col1_copy', result_df['col1'], allow_duplicates=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test adding a duplicate column using a column index that does not exist
def test_duplicate_column2():
	testing_df = df.copy()
	with pytest.raises(Exception):
		clean.insertDuplicateColumn(testing_df, 6) 

#----------------------------------------(Split Column)---------------------------------------

#split a column using '.' as a delimeter
def test_split_delimeter():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series(['hello.world', 'world.hello', 'p.4q', 'r', 's'])
	result_df = testing_df.copy()
	clean.splitColumn(testing_df, 3, '.', regex=False)
	result_df['col4_0'] = pd.Series(['hello', 'world', 'p','r', 's'])
	result_df['col4_1'] = pd.Series(['world', 'hello', '4q'])
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#split a column using a delimetr that is not present in a column
def test_split_delimeter2():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series(['hello.world', 'world.hello', 'p.4q', 'r', 's'])
	result_df = testing_df.copy()
	clean.splitColumn(testing_df, 3, '-', regex=False)
	result_df['col4_0'] = result_df['col4']
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#split a column using regex as delimeter
def test_split_delimeter3():
	testing_df = df.copy()
	testing_df['col4'] = pd.Series(['hello.world', 'world.hello', 'p.4q', 'r', 's'])
	result_df = testing_df.copy()
	clean.splitColumn(testing_df, 3, '\.', regex=True)
	result_df['col4_0'] = pd.Series(['hello', 'world', 'p','r', 's'])
	result_df['col4_1'] = pd.Series(['world', 'hello', '4q'])
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test splitting a column that dose not exist
def test_split_delimeter4():
	testing_df = df.copy()
	with pytest.raises(Exception):
		clean.splitColumn(testing_df, 7, '.') 

#--------------------------------------(Combine Columns)---------------------------------------

#test combining two columns that contain some NA values
def test_combine1():
	testing_df = df.copy()
	result_df = df.copy()
	clean.combineColumns(testing_df, ['col1', 'col2'], seperator=' ', newName="combined")
	result_df.insert(0, 'combined', ['1.0 1.0', '2.0 2.0', '2.0', '3.0', '4.0 4.0'], allow_duplicates=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test combining less than two columns
def test_combine2():
	testing_df = df.copy()
	result_df = df.copy()
	with pytest.raises(Exception):
		clean.combineColumns(testing_df, ['col1'], seperator=' ', newName="combined")

#test combining a column that exists with one that does not
def test_combine3():
	testing_df = df.copy()
	result_df = df.copy()
	with pytest.raises(Exception):
		clean.combineColumns(testing_df, ['col1', 'col16'], seperator=' ', newName="combined")



