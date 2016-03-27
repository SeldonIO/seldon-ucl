import numpy as np
import pandas as pd
import pytest
from dcs import load
import datetime

d = {'col1' : pd.Series([1.], index=[0]),
     'col2' : pd.Series([1., 2.], index=[0, 1])}

df = pd.DataFrame(d)


#--------------------------------(CSV to dataframe)-----------------------------

#test converting a CSV file to a pandas dataframe
def test_CSVtoDataframe1():
	testing_df = load.CSVtoDataFrame('inputCSV.csv')
	result_df = pd.read_csv('inputCSV.csv', encoding='utf-8', header=0)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#try using a file that containd some invalid rows, and auto recover from the error
def test_CSVtoDataframe3():
	d_res = {'day' : pd.Series([1,3]),'temperature' : pd.Series([20,20])}
	result_df = pd.DataFrame(d_res)
	testing_df = load.CSVtoDataFrame('inputRecover.csv')
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#--------------------------------(JSON to dataframe)-----------------------------

#test converting a JCON file to a pandas dataframe
def test_JSONtoDataframe1():
	testing_df = load.JSONtoDataFrame('inputJSON.json')
	result_df = df.copy()
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#-------------------------------(Dataframe to JSON)-----------------------------

#test conversion dataframe with some missing values
def test_toJSON():
	testing_df = df.copy()
	test_JSON = load.dataFrameToJSON(testing_df)
	result_JSON = testing_df.to_json(orient='split')
	assert test_JSON == result_JSON

#-----------------------------------(Remove Rows)----------------------------------

#test removing a single row from a dataframe
def test_removeRow1():
	testing_df = df.copy()
	result_df = df.copy()
	load.removeRows(testing_df, [0])
	result_df.drop(result_df.index[0], inplace=True)
	result_df.reset_index(drop=True, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test removing multiple rows
def test_removeRows2():
	testing_df = df.copy()
	result_df = df.copy()
	load.removeRows(testing_df, [0, 1])
	result_df.drop(result_df.index[0 : 2], inplace=True)
	result_df.reset_index(drop=True, inplace=True)
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test removing a row that does not exist
def test_removeRow3():
	with pytest.raises(Exception):
		load.removeRows(testing_df, [6, 12])

#-------------------------------(Rename Column)-----------------------------------

#test renaming a column
def test_renameColumn1():
	testing_df = df.copy()
	result_df = df.copy()
	load.renameColumn(testing_df, 'col1', 'hello')
	result_df.rename(columns={'col1': 'hello'}, inplace=True)
	assert ((testing_df.dtypes.index == result_df.dtypes.index).all()) == True

#test renaming a column that does not exist should nit change the dataframe
def test_renameColumn2():
	testing_df = df.copy()
	(load.renameColumn(testing_df, 'col26hbbj', 'hello'))
	result_df = df.copy()
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#-------------------------------(empty sting to nan)-------------------------------

#test concverting empty cells to nan values
def test_emptyToNAN1():
	testing_df = df.copy()
	load.emptyStringToNan(testing_df, 0)
	result_df = df.copy()
	result_df['col1'].replace(to_replace="", value=np.nan, inplace=True)
	assert  (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test converting a column that has no empty values
def test_emptyToNAN2():
	testing_df = df.copy()
	load.emptyStringToNan(testing_df, 1)
	result_df = df.copy()
	assert  (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#select a column that does not exist (should keep the dataframe unchanged)
def test_emptyToNAN3():
	testing_df = df.copy()
	result_df = df.copy()
	load.emptyStringToNan(testing_df, 16)
	assert  (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True


#------------------------------(change the value of a cell)-------------------------

#test changing the value of a single cell to an int 
def test_changeCellValue1():
	testing_df = df.copy()
	result_df = df.copy()
	load.newCellValue(testing_df, 0, 0, 10)
	result_df.loc[0, 'col1'] = 10;
	assert  (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test changing the value of a single cell to a string 
def test_changeCellValue2():
	testing_df = df.copy()
	result_df = df.copy()
	load.newCellValue(testing_df, 0, 0, 'hello')
	result_df.loc[0, 'col1'] = 'hello'
	assert  (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test changing the value of a cell that does not exist (should keep the dataframe unchanged)
def test_changeCellCalue3():
	testing_df = df.copy()
	result_df =df.copy()
	load.newCellValue(testing_df, 16, 16, 'hello')
	assert (((testing_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#----------------(return rows containing invalid values in a column)----------------

#retunrn rows containing ivalid values in a column
def test_invalidRows1():
	testing_df = df.copy()
	result_df = df.copy()
	return_df = load.rowsWithInvalidValuesInColumns(testing_df, [0])
	result_df.drop(result_df.index[0], inplace=True)
	assert (((return_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#retunrn rows containing ivalid values in multiple columns
def test_invalidRows2():
	testing_df = df.copy()
	testing_df['col3'] = pd.Series(['1'], index = [0])
	result_df = testing_df.copy()
	return_df = load.rowsWithInvalidValuesInColumns(testing_df, [0, 2])
	result_df.drop(result_df.index[0], inplace=True)
	assert (((return_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#return rows containing invalid values in every column (should return an empty dataframe)
def test_invalidRows3():
	testing_df = df.copy()
	testing_df['col3'] = pd.Series(['1'], index = [1])
	result_df = testing_df.copy()
	return_df = load.rowsWithInvalidValuesInColumns(testing_df, [0, 1, 2])
	result_df.drop(result_df.index[0], inplace=True)
	result_df.drop(result_df.index[0], inplace=True)
	print result_df
	print return_df
	assert (((return_df.fillna(0) == result_df.fillna(0)).all()).all()) == True


#----------------(return rows containing duplicate values in a column)--------------

#retunrn rows containing duplicate values in a column
def test_duplicateRows1():
	testing_df = df.copy()
	testing_df['col3'] = pd.Series([2,2])
	result_df = testing_df.copy()
	return_df = load.duplicateRowsInColumns(testing_df, [2])
	assert (((return_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#test on a column that does not contain duplicate values - should return an empty dataframe
def test_duplicateRows2():
	testing_df = df.copy()
	result_df = testing_df.copy()
	return_df = load.duplicateRowsInColumns(testing_df, [1])
	result_df.drop(result_df.index[0], inplace=True)
	result_df.drop(result_df.index[0], inplace=True)
	assert (((return_df.fillna(0) == result_df.fillna(0)).all()).all()) == True

#-------------------------------(Change column Type)--------------------------------

#test converting float to int without NaN values
def test_floatToInt1():
	testing_df = df.copy()
	assert testing_df['col2'].dtype == 'float64'
	load.changeColumnDataType(testing_df, 'col2', 'int64')
	assert testing_df['col2'].dtype == 'int64'

#test converting float to int with NaN values
def test_floatToInt2():
	testing_df = df.copy()
	assert testing_df['col1'].dtype == 'float64'
	with pytest.raises(Exception):
		load.changeColumnDataType(testing_df, 'col1', 'int64')

#test converting float to string with NaN values
def test_floatToString1():
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

#test converting int to String without Null values
def test_intToString():
	testing_df = df.copy()
	newType = np.dtype('int64')
	testing_df['col2'] = testing_df['col2'].astype(newType)
	assert testing_df['col2'].dtype == 'int64'
	load.changeColumnDataType(testing_df, 'col2', 'str')
	assert testing_df['col2'].dtype == 'object'

#test converting String to a float
def test_stringToFloat():
	testing_df = df.copy()
	testing_df['col3'] = pd.Series(['1', '2'], index = [0, 1])
	assert testing_df['col3'].dtype == 'object'
	load.changeColumnDataType(testing_df, 'col3', 'float64')
	assert testing_df['col3'].dtype == 'float64'

#test converting a String to an int without null values
def test_stringToInt1():
	testing_df = df.copy()
	testing_df['col3'] = pd.Series(['1', '2'], index = [0, 1])
	assert testing_df['col3'].dtype == 'object'
	load.changeColumnDataType(testing_df, 'col3', 'int64')
	assert testing_df['col3'].dtype == 'int64'

#test converting a String to an int with null values
def test_stringToInt2():
	testing_df = df.copy()
	testing_df['col3'] = pd.Series(['1'], index = [0])
	with pytest.raises(Exception):
		load.changeColumnDataType(testing_df, 'col3', 'int64')

#test converting a string to a date
def test_stringToDate1():
	testing_df = df.copy()
	testing_df['col3'] = pd.Series(['01/01/2000', '10/01/1995'])
	assert testing_df['col3'].dtype == 'object'
	load.changeColumnDataType(testing_df, 'col3', 'datetime64')
	print testing_df['col3'].dtype
	assert testing_df['col3'].dtype == 'datetime64[ns]'





