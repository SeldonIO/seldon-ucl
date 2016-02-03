import numpy as np
import pandas as pd
import pytest
from dcs import load

d = {'col1' : pd.Series([1.], index=[0]),
     'col2' : pd.Series([1., 2.], index=[0, 1])}

df = pd.DataFrame(d)


#--------------------------------(CSV to dataframe)-----------------------------

#test converting a CSV file to a pandas dataframe
def test_CSVtoDataframe1():
	testing_df = load.CSVtoDataFrame('inputCSV.csv')
	result_df = pd.read_csv('inputCSV.csv', encoding='utf-8', header=0)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

# try using a .txt file consisting of csv content
def test_CSVtoDataframe2():
	testing_df = load.CSVtoDataFrame('inputTXT.txt')
	result_df = pd.read_csv('inputTXT.txt', encoding='utf-8', header=0)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#try using a file that does not consist of csv content
def test_CSVtoDataframe3():
	assert load.CSVtoDataFrame('inputReject.csv') == None

#-------------------------------(Dataframe to JSON)-----------------------------

#test conversion dataframe with some missing values
def test_toJSON():
	testing_df = df.copy()
	test_JSON = load.dataFrameToJSON(testing_df)
	result_JSON = testing_df.to_json(orient='records')
	assert test_JSON == result_JSON

#-----------------------------------(Remove Rows)----------------------------------

#test removing a single row from a dataframe
def test_removeRow1():
	testing_df = df.copy()
	result_df = df.copy()
	load.removeRows(testing_df, 0, 0)
	result_df.drop(result_df.index[0], inplace=True)
	result_df.reset_index(drop=True, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test removing multiple rows
def test_removeRows2():
	testing_df = df.copy()
	result_df = df.copy()
	load.removeRows(testing_df, 0, 1)
	result_df.drop(result_df.index[0 : 2], inplace=True)
	result_df.reset_index(drop=True, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test removing a row that does not exist
def test_removeRow3():
	testing_df = df.copy
	assert load.removeRows(testing_df, 6, 6) == False

#-------------------------------(Rename Column)-----------------------------------

#test renaming a column
def test_renameColumn1():
	testing_df = df.copy()
	result_df = df.copy()
	load.renameColumn(testing_df, 'col1', 'hello')
	result_df.rename(columns={'col1': 'hello'}, inplace=True)
	assert ((testing_df.dtypes.index == result_df.dtypes.index).all()) == True

#test renaming a column that does not exist
def test_renameColumn2():
	testing_df = df.copy()
	assert load.renameColumn(testing_df, 'col26', 'hello') == False


#-------------------------------(Change column Type)--------------------------------

#test converting float to int without NaN values
def test_floatToInt1():
	testing_df = df.copy()
	assert testing_df['col2'].dtype == 'float64'
	load.changeColumnDataType(testing_df, 'col1', 'int64')
	assert testing_df['col1'].dtype == 'float64'

#test converting float to int with NaN values
def test_floatToInt2():
	testing_df = df.copy()
	assert testing_df['col1'].dtype == 'float64'
	load.changeColumnDataType(testing_df, 'col2', 'int64')
	assert testing_df['col2'].dtype == 'int64'

#test converting float to string with NaN values
def test_floatToObj1():
	testing_df = df.copy()
	assert testing_df['col1'].dtype == 'float64'
	load.changeColumnDataType(testing_df, 'col1', 'str')
	assert testing_df['col1'].dtype == 'object'

#test converting int to float without Null values
def test_intToFloat1():
	testing_df = df.copy()
	newType = np.dtype('int64')
	testing_df['col2'] = testing_df['col2'].astype(newType)
	assert testing_df['col2'].dtype == 'int64'
	load.changeColumnDataType(testing_df, 'col2', 'float64')
	assert testing_df['col2'].dtype == 'float64'

#test converting int to object without Null values
def test_intToObj():
	testing_df = df.copy()
	newType = np.dtype('int64')
	testing_df['col2'] = testing_df['col2'].astype(newType)
	assert testing_df['col2'].dtype == 'int64'
	load.changeColumnDataType(testing_df, 'col2', 'str')
	assert testing_df['col2'].dtype == 'object'

#test converting object to a float
def test_objToFloat():
	testing_df = df.copy()
	testing_df['col3'] = pd.Series(['1', '2'], index = [0, 1])
	assert testing_df['col3'].dtype == 'object'
	load.changeColumnDataType(testing_df, 'col3', 'float64')
	assert testing_df['col3'].dtype == 'float64'

#test converting an object to an int without null values
def test_objToInt1():
	testing_df = df.copy()
	testing_df['col3'] = pd.Series(['1', '2'], index = [0, 1])
	assert testing_df['col3'].dtype == 'object'
	load.changeColumnDataType(testing_df, 'col3', 'int64')
	assert testing_df['col3'].dtype == 'int64'

#test converting an object to an int with null values
def test_objToInt2():
	testing_df = df.copy()
	testing_df['col3'] = pd.Series(['1'], index = [0])
	assert testing_df['col3'].dtype == 'object'
	load.changeColumnDataType(testing_df, 'col3', 'int64')
	assert testing_df['col3'].dtype == 'object'




