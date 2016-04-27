WebSocket API
=============

A majority of the communication between the Willow :doc:`backend </flask/index>` and :doc:`frontend </angular/index>` occurs over a WebSocket connection using SocketIO. WebSocket was chosen over HTTP because the Willow backend needs to be able to *push* the results of potentially long running data operations without the frontend being forced to continuously poll for results. 

Request Message Structure
-------------------------

WebSocket messages made with SocketIO consist of a title and JSON body. Our WebSocket API defines a common structure to requests:


**Title**

``<String>``

**Body**

.. code-block:: none

	{
		'operation': <String>,
		'sessionID': <String>,
		'requestID': <String>,
		...request-specific key-value pairs...
	}

Message title must match one of the defined :ref:`API requests <socket-requests>`.

Value for ``sessionID`` identifies the dataset the operation will be performed on and is a 30 character long hexadecimal string which gets returned after successfully :ref:`uploading a new dataset <flask-upload>`.

Value for ``requestID`` does not affect how the server performs the operation, but should be a unique string that the message sender remembers in order to identify the corresponding response message received from the backend. 

Value for ``operation`` must match the message title. 

Example Request
^^^^^^^^^^^^^^^

	**Title**

	changeColumnDataType

	**Body**

	.. code-block:: none

		{
			'operation': 'changeColumnDataType',
			'sessionID': '617646cb1e421f72b7e742dbdbd4cb',
			'requestID': '0002a43e',
			'column': 'Date',
			'newDataType': 'datetime64'
		}

Response Message Structure
--------------------------

After a well-formed request message for an operation is received and parsed by the Willow backend, the operation gets queued. Once the backend performs and completes the operation, a SocketIO response message with the following structure is sent to the client:

**Title**

<String>

**Body**

.. code-block:: none
	
	{
		'operation': <String>
		'sessionID': <String>,
		'requestID': <String>,
		'success': <Boolean>,
		'error': <String>,
		'errorDescription': <String>,
		...request-specific response key-value pairs...
	}

The message title and value for ``operation`` in the body will both holding the
name of the original operation. Besides ``operation``, ``requestID`` and ``sessionID`` will also be identical to the values specified in the original request, allowing the client to identify
which request the response corresponds to. 

``error`` and ``errorDescription`` keys will only be present in the response body if ``success`` is ``false``, meaning the operation failed. 

.. _socket-requests:

Requests
--------

The Willow WebSocket API defines the following requests. Note that the headings are the request names which should be supplied as the title of the SocketIO message. 

.. _socket-metadata:

``metadata``
^^^^^^^^^^^^
	Requests the metadata for a dataset. Metadata includes information such as dataset size (no. of rows and columns) and column names and datatypes.

	It is possible to request the metadata on a filtered and/or searched view of the dataset. This can be used to, for example, get the number of rows which contain outliers in a specific column. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'filterType': <String>,
			'filterColumnIndices': [<Integer>],
			'outliersStdDev': <Number>,
			'outliersTrimPortion': <Float>,
			'searchQuery': <String>,
			'searchColumnIndices': [<Integer],
			'searchIsRegex': <Boolean>
		}

	**Params**

	*	**filterType**, *optional*
		
		Supply a value to request the metadata on a filtered view of the specified 
		dataset. Valid options are:

		*	``'invalid'`` for missing/invalid values in specified columns
		*	``'outliers'`` for outliers in specified numerical columns
		*	``'duplicates'`` for duplicates in specified columns

	*	**filterColumnIndices**, *optional*
		
		Must be used with **filterType** parameter for specifying which columns the filter
		should be applied on. Value should be a list of column indices (integers). 
		
		.. note::

			The filter is applied using a boolean conjunction, meaning that a row must
			satisfy the filter condition for *all* specified columns to be included. 


	*	**outlierStdDev**, *optional*
		
		Must be used if **filterType** set to ``'outliers'`` to specify how many
		standard deviations a value must be to be considered an outlier. 

	*	**outliersTrimPortion**, *optional*
		
		Must be used if **filterType** set to ``'outliers'`` to specify a portion of the
		dataset to trim from highest and lowest values

	*	**searchQuery**, *optional*

		Supply a value to request the metadata on a searched view of the dataset. Can be
		a simple search term or a regular expression. 

	*	**searchColumnIndices**, *optional*

		Must be used with **searchQuery** parameter for specifying which columns the search
		will be performed on. 

		.. note::

			Unlike filters, the search is performed using a boolean disjunction, meaning
			that a row only has to contain the search term in one of the specified columns
			to be included. 

	*	**searchIsRegex**, *optional*

		Must be used with **searchQuery** parmeter for specifying whether or not the search term
		is a regular expression. 

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...,
			'undoAvailable': <Boolean>,
			'dataSize': {
				'rows': <Integer>,
				'columns': <Integer>
			},
			columns: [<String>],
			columnInfo: {
				<column_name>: {
					'dataType': <String>,
					'invalidValues': <Integer>,
				},
				...
			}
		}

	*	**undoAvailable** specifies whether or not an undo operation is currently possible for the dataset
	*	**dataSize** specifies the size of the data set as a dictionary indexed by 'rows' and 'columns'
	*	**columns** specifies the names of each column as a list
	*	**columnInfo** specifies the data type and number of invalid values in each column as a dictionary indexed by column name


.. _socket-data:

``data``
^^^^^^^^
	Requests the data for a dataset in JSON format. 

	It is possible to request the data of a filtered, sorted and/or searched view of the dataset. This can be used to, for example, get the rows and columns that are duplicated.

	.. note::

		Because Willow generally handles large datasets, you must always specify a slice when retrieving data through this request. Although is nothing to prevent specifying the entire
		dataset as the slice, performance will definitely take a hit. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'rowIndexFrom': <Integer>,
			'rowIndexTo': <Integer>,
			'columnIndexFrom': <Integer>,
			'columnIndexTo': <Integer>,
			'filterType': <String>,
			'filterColumnIndices': [<Integer>],
			'outliersStdDev': <Number>,
			'outliersTrimPortion': <Float>,
			'searchQuery': <String>,
			'searchColumnIndices': [<Integer],
			'searchIsRegex': <Boolean>,
			'sortColumnIndex': <Integer>,
			'sortAscending': <Boolean>
		}

	**Params**

	*	**rowIndexFrom**

		A required parameter for specifying the slice of the dataset to view

	*	**rowIndexTo**

		A required parameter for specifying the slice of the dataset to view

	*	**columnIndexFrom**

		A required parameter for specifying the slice of the dataset to view

	*	**columnIndexTo**

		A required parameter for specifying the slice of the dataset to view
		
	*	**sortColumnIndex**, *optional*

		Index of a column to sort the dataset by
	
	* 	**sortAscending**, *optional*

		Specify ``true`` to sort in ascending order, ``false`` for descending

	Remaining parameters behave identically to the parameters for :ref:```metadata`` <socket-metadata>`. 

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...,
			'data': {
				index: [<Integer>],
				columns: [<String>],
				data -> [[<Any>]]
			}
		}

	The data is encapsulated in a dictionary under the **data** key in the response. The dictionary holds the indices of the requested slice, names of the requested columns and the actual data as an array of arrays. 

.. _socket-analyze:

``analyze``
^^^^^^^^
	Compute statistics on the specified column.

	The Willow backend will provide the appropriate statistics based on the data type of column. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'column': <String>
		}

	**Params**

	*	**column**

		Name of column to analyze


	**Response Body Structure**

	.. code-block:: none

		{
			'invalid': <Integer>,
			'unique_count': <Integer>,
			'mode': [<Any>],
			'mode_count': <Integer>,
			'frequencies': [
				<value>: <Integer>,
				...
			],
			...data-type specific statistical metrics...
		}

	*	**invalid** specifies the number of invalid/missing values in the column
	*	**unique_count** specifies the number of unique values in the column
	*	**mode** specifies the most frequently occuring values as a list
	*	**mode_count** specifies the frequency of the mode(s)
	*	**frequencies** is a list of the top 50 most commonly occurring values and their frequencies

	The returned response will also contain more statistical metrics depending on the data type. 

.. _socket-change-column-data-type:

``changeColumnDataType``
^^^^^^^^^^^^^^^^^^^^^^^^
	Change the data type of a column

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'column': <String>,
			'newDataType': <String>,
			'dateFormat': <String>
		}

	**Params**

	*	**column**

		Name of column to change data type of

	*	**newDataType**

		Any valid type string that can be parsed by :class:`numpy.dtype() <numpy.dtype>`. 

	*	**dateFormat**, *optional*

		Supply a :ref:`Python date format string <python:strftime-strptime-behavior>` to override automatic date parsing when converting a column to :class:`numpy.datetime64`. 


	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-combine-columns:

``combineColumns``
^^^^^^^^^^^^^^^^^^
	Combines multiple columns into a new column, concatenating each value using a specified separator. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnsToCombine': [<Integer>],
			'seperator': <String>,
			'newName': <String>,
			'insertIndex': <Integer>
		}

	**Params**

	*	**columnIndex**

		List of columns to combine

	*	**seperator**

		Separator character or string

	*	**newName**

		Name for column containing combined values

	*	**insertIndex**

		Index to insert new column at


	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-delete-columns:

``deleteColumns``
^^^^^^^^^^^^^^^^^
	Rename a column

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndices': [<Integer>]
		}

	**Params**

	*	**columnIndices**

		List of column indices

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-delete-rows:

``deleteRows``
^^^^^^^^^^^^^^
	Delete rows

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'rowIndices': [<Integer>]
		}

	**Params**

	*	**columnIndices**

		List of row indices

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-delete-rows-with-na:

``deleteRowsWithNA``
^^^^^^^^^^^^^^^^^^^^
	Delete rows with missing values in the specified column

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>
		}

	**Params**

	*	**columnIndex**

		Index of column for operation

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-empty-string-to-nan:

``emptyStringToNaN``
^^^^^^^^^^^^^^^^^^^^
	
	Replaces all instances of '' (empty string) with ``NaN`` for a specified string column. Useful for a 
	consistent definition of "missing/invalid" value. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>
		}

	**Params**

	*	**columnIndex**

		Index of column for operation

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-execute-command:

``executeCommand``
^^^^^^^^^^^^^^^^^^

	Executes a Python statement in a pre-configured environment

	.. danger::

		Using this function carries direct risk, as any arbitrary command can be executed

	The *command* parameter can be a string containing multiple lines of Python statements. The command is executed
	in a pre-configured environment with ``df`` holding a reference to the data frame, and multiple modules loaded,
	including ``pandas`` and ``numpy``. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'command': <String>
		}

	**Params**

	*	**command**

		String containing a single Python command, or multiple Python commands delimited by newline

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-fill-down:

``fillDown``
^^^^^^^^^^^^
	Fill missing values with last or next seen valid value for a range of columns

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnFrom': <Integer>,
			'columnTo': <Integer>,
			'method': <String>
		}

	**Params**

	*	**columnFrom**

		Starting index of column range

	*	**columnTo**

		Ending index of column range (inclusive)

	*	**method**

		Mode of operation: specify 'bfill' for backwards fill (next valid value) and 'pad' for forward fill (last valid value)


	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-fill-with-custom-value:

``fillWithCustomValue``
^^^^^^^^^^^^^^^^^^^^^^^
	Fill missing values with a custom specified value, in-place

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>,
			'newValue': <Any>
		}

	**Params**

	*	**columnIndex**

		Index of column to operate on

	*	**newValue**

		Fill value


	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-fill-with-average:

``fillWithAverage``
^^^^^^^^^^^^^^^^^^^
	Fill missing values with an average metric. Average metrics that can be used to fill with are: mean, median and mode. 

	.. warning::
		
		Using mean or median metric on a non numeric column will result in an error response. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>,
			'metric': <Integer>
		}

	**Params**

	*	**columnIndex**

		Index of column to operate on

	*	**metric**

		Average metric to use, options are: 'mean', 'median' and 'mode'


	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}


.. _socket-find-replace:

``findReplace``
^^^^^^^^^^^^^^^
	Finds all values matching the given patterns in the specified column and replaces them with a value.

	Searching for multiple patterns is supported, and search patterns can be strings which will be matched as a whole
	or regular expressions (if **matchRegex** param set to ``true``). 

	Standard Pythonic :func:`regex subsitutions <python:re.sub>` are also possible. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>,
			'toReplace': [<String>],
			'replaceWith': [<String>],
			'matchRegex': <Boolean>
		}

	**Params**

	*	**columnIndex**

		Index of column for operation

	*	**toReplace**

		List of search strings or regular expressions. Length of list must match length of **replaceWith** parameter. 

	*	**replaceWith**

		List of replacement strings or regular expressions. Length of list must match length of **toReplace** parameter. 

	*	**matchRegex**

		Must be set to ``true`` if supplying list of regular expressions

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-generate-dummies:

``findReplace``
^^^^^^^^^^^^^^^
	Generates dummies/indicator variable columns from a specified column (containing categorical data)

	Searching for multiple patterns is supported, and search patterns can be strings which will be matched as a whole
	or regular expressions (if **matchRegex** param set to ``true``). 

	Standard Pythonic :func:`regex subsitutions <python:re.sub>` are also possible. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>,
			'inplace': <Boolean>
		}

	**Params**

	*	**columnIndex**

		Index of column for operation

	*	**inplace**

		Removes original column if set to ``true``

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-interpolate:

``interpolate``
^^^^^^^^^^^^^^^
	Fill missing values for specified numeric column using interpolatoin

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>,
			'method': <String>,
			'order': <Integer>
		}

	**Params**

	*	**columnIndex**

		Index of numeric column to operate on

	*	**method**

		Interpolation method. Options include 'linear', 'spline' and 'polynomial'. Refer to list of all available methods of interpolation :meth:`here <pandas.Series.interpolate>`. 

	*	**order**, *optional*

		Must be specified if using 'polynomial' or 'spline' interpolation. 

		.. warning::

			The higher the order (and larger the dataset), the more computationally expensive the interpolation will be. 
		

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-insert-duplicate-column:

``insertDuplicateColumn``
^^^^^^^^^^^^^^^^^^^^^^^^^
	Duplicates a column, inserting the new column to the right of the original column. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>
		}

	**Params**

	*	**columnIndex**

		Index of column to duplicate
		

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-new-cell-value:

``newCellValue``
^^^^^^^^^^^^^^^^
	Modifies the value of a specified cell. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>,
			'rowIndex': <Integer>,
			'newValue': <Any>
		}

	**Params**

	*	**columnIndex**

		Integer index of column 

	*	**rowIndex**

		Integer index of row 

	*	**newValue**

		New value for cell

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-normalize:

``normalize``
^^^^^^^^^^^^^
	Performs normalization on a numeric column, uniformally scaling the values to fit in the specified range

	.. warning::
		Requesting ``normalize`` on a non numeric column will invoke an error response. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>,
			'rangeFrom': <Number>,
			'rangeTo': <Number>
		}

	**Params**

	*	**columnIndex**

		Index of (numeric) column to normalize

	*	**rangeStart**, *optional*

		Start of scaling range, default = 0

	*	**rangeEnd**, *optional*

		End of scaling range, default = 1

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-rename-column:

``renameColumn``
^^^^^^^^^^^^^^^^
	Rename a column

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'column': <String>,
			'newName': <String>
		}

	**Params**

	*	**column**

		Name of column to rename

	*	**newName**

		New name

	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-split-column:

``splitColumn``
^^^^^^^^^^^^^^^
	Splits a string column according to a specified delimiter or regular expression. 

	The split values are put in new columns inserted to the right of the original column. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>,
			'delimiter': <String>,
			'regex': <Boolean>
		}

	**Params**

	*	**columnIndex**

		Index of (string) column to split

	*	**delimiter**

		Delimiting character, string or regular expression for splitting each row

	*	**regex**

		Set to ``true`` if delimiter is a regular expression


	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-standardize:

``standardize``
^^^^^^^^^^^^^^^
	Performs standardization on a numeric column, unformally scales the values so that mean equals 0 and standard deviation equals 1. 

	.. warning::
		Requesting ``normalize`` on a non numeric column will invoke an error response. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'columnIndex': <Integer>
		}

	**Params**

	*	**columnIndex**

		Index of (numeric) column to standardize


	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-undo:

``undo``
^^^^^^^^
	Undo the previous operation

	.. note::

		The Willow backend does not track changes past the most recent operation, meaning that the effective number of undo's is limited to 1. Requesting undo twice equates to a redo.  

	It should be made sure that the undo operation is available for the dataset, by checking the ``undoAvailable`` key in the response of a :ref:`socket-metadata` request. Otherwise, an error response will be given. 

	**Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...
		}


	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...
		}

.. _socket-visualize:

``visualize``
^^^^^^^^^^^^^
	Generate a visualization on the specified column. 

	Supported visualizations are frequency bar charts, histograms, scatter plots, time series plots and line charts. The image is encoded as a Base64 PNG image string in the response. 

	**Histogram Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'type': 'histogram',
			'columnIndices': [<Integer>],
			'options': {
				'numberOfBins': <Integer>,
				'axis': {
					'x': {
						'start': <Number>,
						'end': <Number>
					},
					'y': {
						'start': <Number>,
						'end': <Number>					
					}
				}
			}
		}

	**Histogram Request Body Params**

	*	**columnIndices** 

		List of column indices for plotting (histograms support multiple columns)

	*	**options**, *optional*

		Custom settings for plotting:

		*	**numberOfBins**, *optional*

			Number of bins to categorize values into

		*	**axis**, *optional*

			Dictionary specifying axis/window settings

	**Frequency Chart Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'type': 'frequency',
			'columnIndex': <Integer>,
			'options': {
				'useWords': <Boolean>,
				'cutoff': <Integer>
			}
		}

	**Frequency Chart Request Body Params**

	*	**columnIndex** 

		Index of column to plot

	*	**options**, *optional*

		Custom settings for plotting:

		*	**useWords**, *optional*

			Set to ``true`` to plot word frequencies instead of row value frequencies for a string column

		*	**cutoff**, *optional*

			Specify the top *n* values by frequency to plot, default is 50, maximum is 50

	**Scatter Plot Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'type': 'scatter',
			'xColumnIndex': <Integer>,
			'yColumnIndices': [<Integer>],
			'options': {
				'axis': {
					'x': {
						'start': <Number>,
						'end': <Number>
					},
					'y': {
						'start': <Number>,
						'end': <Number>					
					}
				}
			}
		}

	**Scatter Plot Request Body Params**

	*	**xColumnIndex** 

		Index of column to plot on x-axis

	*	**yColumnIndices** 

		List of indices of columns to plot on y-axis.

		.. note::
		
			The function supports plotting multiple columns with respect to one axis, but the number of columns should be limited to 6 for optimal color assignment of the plot points. 

	*	**options**, *optional*

		Custom settings for plotting:

		*	**axis**, *optional*

			Dictionary specifying axis/window settings

	**Line Chart Request Body Structure**

	.. code-block:: none

		{
			...standard request key-value pairs...,
			'type': 'line',
			'xColumnIndex': <Integer>,
			'yColumnIndices': [<Integer>],
			'options': {
				'axis': {
					'x': {
						'start': <Number>,
						'end': <Number>
					},
					'y': {
						'start': <Number>,
						'end': <Number>					
					}
				}
			}
		}

	**Line Chart Request Body Params**

	*	**xColumnIndex** 

		Index of column to plot on x-axis

	*	**yColumnIndices** 

		List of indices of columns to plot on y-axis.

		.. note::
		
			The function supports plotting multiple columns with respect to one axis, but the number of columns should be limited to 6 for optimal color assignment of the plot points. 

	*	**options**, *optional*

		Custom settings for plotting:

		*	**axis**, *optional*

			Dictionary specifying axis/window settings


	**Response Body Structure**

	.. code-block:: none

		{
			...standard response key-value pairs...,
			'image': <String>,
			'axis': {
				'x': {
					'start': <Number>,
					'end': <Number>
				},
				'y': {
					'start': <Number>,
					'end': <Number>
				}
			}
		}

	*	**image**

		Base64 encoded PNG image string of generated plot

	*	**axis**

		Dictionary specifying axis/window settings used in the generated chart


Notifications
-------------

Besides sending request messages, clients which are connected to the Willow backend should be prepared the receive the following notifications: 

``dataChanged``
^^^^^^^^^^^^^^^

	Notification sent when a dataset has been changed, due to an data manipulation operation
	performed by any client using the same sessionID (operating on the same dataset). 

	**Notification Body Structure**

	.. code-block:: none

		{
			'sessionID': <String>
		}