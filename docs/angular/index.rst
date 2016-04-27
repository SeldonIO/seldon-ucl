AngularJS *frontend*
====================

*Language: JavaScript*

The web appplication that serves as the frontend for Willow, presenting the user with a graphical interface for performing data operations. It is important to note that the Angular application serves solely as a frontend, communicating requests and receiving data from the backend. 

Dependencies
------------
*	`AngularJS <https://angularjs.org/>`_ as the web application framework 
*	`Angular Material <https://material.angularjs.org/latest/>`_ for UI components and styling
*	`SocketIO <http://socket.io/>`_ for establishing a WebSocket connection with the :doc:`Willow backend </flask/index>`
*	`Angular-UI Router <https://github.com/angular-ui/ui-router>`_ for routing and structuring views
*	`ng-file-upload <https://github.com/danialfarid/ng-file-upload>`_ for the file upload component 
*	`Handsontable <https://handsontable.com/>`_ for spreadsheet component
*	`Jasmine <http://jasmine.github.io/>`_ for unit testing
*	`Karma <https://karma-runner.github.io/0.13/index.html>`_ as a unit test runner

.. _angular-classes:

Classes
------- 

The AngularJS framework enforces a Model-View-Controller (MVC) architecture to achieve separation of concerns during development. HTML files serve as views and JavaScript classes are used to encapsulate models and define controllers.

AngularJS defines three categories of classes:

*	**controllers** which serve as the Controllers in the MVC paradigm
*	**directives** which are used to extend HTML and manipulate the DOM the Angular way by defining HTML elements, tags or attributes
*	**providers** which are singletons that provide supporting services to controllers and directives. 

.. _angular-router:

Router
------

Our Angular application uses Angular-UIRouter to maange the global state of the application and 
route the user to different :ref:`views <angular-views>` (managed by :ref:`controllers <angular-controllers>`) depending on the state. 

The state of the application gets reflected in the URL, thus allowing users to, say, navigating to ``/<sessionID>``,
which causes Angular-UIRouter to initialize and present the correct view and controller. 

The following states are defined:

*	|	**URL**: ``/``
	|	**State Name**: ``upload``
	|	**Controller**: :ref:`UploadController <angular-upload-controller>`

*	|	**URL**: ``/<sessionID>``, where sessionID is a 30 character long hexadecimal string
	|	**State Name**: ``main``
	|	**Controller**: :ref:`MainController <angular-main-controller>`

	**Nested States/Views**

	*	|	**State Name**: ``clean``
		|	**Controller**: :ref:`CleanController <angular-clean-controller>`

	*	|	**State Name**: ``analyze``
		|	**Controller**: :ref:`AnalyzeController <angular-analyze-controller>`

	*	|	**State Name**: ``visualize``
		|	**Controller**: :ref:`VisualizeController <angular-visualize-controller>`

.. _angular-views:

Views
-----

Angular views are partial HTML files, referred to as 'partials'. Partials are regular HTML files
which contain custom Angular tags and attributes that enable Angular's powerful two-way data binding and scope features. 

.. _angular-controllers:

Controllers
-----------

.. _angular-upload-controller:

*	**UploadController**

	Manages the Upload screen view for the ``upload`` state, before a session has been started. 

	Responsible for ``POST``ing CSV, JSON and Excel files to the :ref:`/upload <flask-upload>` endpoint
	for the :doc:`Flask application <flask/index>`. After a successful upload, it redirects to the MainController view through the router. 

.. _angular-main-controller:

*	**MainController**

	Manages the tabbed main screen view for the ``main`` state, after a session has been successfully started. 

	Responsible for initializing the :ref:`socketConnection <angular-socket-connection>` and :ref:`session <angular-session>` providers,
	which are critical to the Angular application. 

	MainController also manages the application toolbar, and is thus responsible for requesting
	the :ref:`'undo' <socket-undo>` operation over WebSocket through :ref:`analysis <angular-session>` provider as well as the 
	:ref:`CSV download <flask-download-CSV>` and :ref:`JSON download <flask-download-JSON>` operations through ``HTTP GET``.

.. _angular-clean-controller:

*	**CleanController**

	Manages the Transform tab view under the ``main`` state. 

	Responsible for displaying the data in a spreadsheet format using Handsontable and the Transform sidebar, which is composed of
	directives that request all data transformation operations from the Willow backend. 

.. _angular-analyze-controller:

*	**AnalyzeController**

	Manages the Analyze tab view under the ``main`` state. 

	Responsible for displaying requested statistics computed by the Willow backend on the columns specified by the user.

.. _angular-visualize-controller:

*	**Visualizecontroller**

	Manages the Visualize tab view under the ``main`` state.

	Responsible for displaying requested data visualizations generated by the Willow backend. 

.. _angular-directives:

Directives
----------
*	**analysisColumn**

	Element directive used with AnalyzeController. 

	Requests :ref:`'analysis' <socket-analysis>` operation over WebSocket through :ref:`analysis <angular-session>` provider on a specified column.
	Displays the computed statistics in a tabular layout, and automatically requests new analysis and updates the view when the dataset changes.

*	**clean.inspectorBar**

	Element directive used with CleanController

	Displays important statisical metrics on the column the user has currently selected in the data table. Requests :ref:`'analysis' <socket-analysis>` operation over WebSocket through :ref:`analysis <angular-session>` provider. 

*	**columnPicker**

	Element directive used in multiple controllers and directives. 

	Displays a form element for choosing a column in the data set by text entry with autocomplete features. 


The following directives are used for the sidebar managed by CleanController. They are context-aware with respect to the user's selection in the data table, meaning that they show themselves only when appropriate. 

*	**clean.sidebar.inspect**

	Element directive for the entire Inspect tab, allowing the user to inspect the currently selected column in the data table. 

	Requests :ref:`'analysis' <socket-analysis>` operation over WebSocket through :ref:`analysis <angular-session>` provider.

* 	**clean.sidebar.columnOperations**

	Element directive for "Column Operations" card in the Operate tab.

	Requests :ref:`'splitColumn' <socket-split-column>` and :ref:`'combineColumns' <socket-combine-columns>` operations over WebSocket through :ref:`session <angular-session>` provider. 

*	**clean.sidebar.dangerZone**

	Element directive for the "Highway to the Danger Zone" card in the Operate tab, providing tools for command execution. 

	Requests :ref:`'executeCommand' <socket-execute-command>` operation over WebSocket through :ref:`session <angular-session>` provider. 

*	**clean.sidebar.discretization**

	Element directive for the "Discretization & Quantiling" card in the Operate tab

	Requests :ref:`'discretize' <socket-execute-command>` operation over WebSocket through :ref:`session <angular-session>` provider. 

*	**clean.sidebar.editCell**

	Element directive for the "Edit Cell" card in the View tab

	Requests :ref:`'newCellValue' <socket-new-cell-value>` operation over WebSocket through :ref:`session <angular-session>` provider. 

*	**clean.sidebar.editColumn***

	Element directive for the "Edit Column" card in the View tab

	Requests :ref:`'renameColumn' <socket-rename-column>`, :ref:`'changeColumnDataType' <socket-change-column-data-type>` and :ref:`'deleteColumns' <socket-delete-columns>` operations over WebSocket through :ref:`session <angular-session>` provider.  

*	**clean.sidebar.editRow***

	Element directive for the "Edit Row" card in the View tab

	Requests :ref:`'deleteRows' <socket-delete-rows>` operation over WebSocket through :ref:`session <angular-session>` provider.  

*	**clean.sidebar.featureEncoding***

	Element directive for the "Feature Encoding" card in the Operate tab

	Requests :ref:`'generateDummies' <socket-generate-dummies>` operation over WebSocket through :ref:`session <angular-session>` provider.  

*	**clean.sidebar.featureScaling**
	
	Element directive for the "Feature Scaling" card in the Operate tab

	Requests :ref:`'standardize' <socket-standardize>` and :ref:`'normalize' <socket-normalize>` operations over WebSocket through :ref:`session <angular-session>` provider. 

*	**clean.sidebar.filter**

	Element directive for the "Filter" card in the View tab. 

	Requests filtered :ref:`'data' <socket-data>` and :ref:`'metadata' <socket-metadata>` operations over WebSocket through :ref:`CleanController <angular-clean-controller>`.

*	**clean.sidebar.findReplace**

	Element directive for the "Find & Replace" card in the Operate tab. 

	Requests :ref:`'findReplace' <socket-find-replace>` operation over WebSocket through :ref:`session <angular-session>` provider. 

*	**clean.sidebar.missingValues**

	Element directive for the "Missing Data" card in the Operate tab. 

	Requests :ref:`'interpolate' <socket-interpolate>`, :ref:`'fillWithAverage' <socket-fill-with-average>` and :ref:`'fillWithCustomValue' <socket-fill-with-custom-value>` operations over WebSocket through :ref:`session <angular-session>` provider. 

*	**clean.sidebar.search**

	Element directive for the "Search" card in the View tab

	Requests searched :ref:`'data' <socket-data>` and :ref:`'metadata' <socket-metadata>` operations over WebSocket through :ref:`CleanController <angular-clean-controller>`.

*	**clean.sidebar.sort**

	Element directive for the "Sort" card in the View tab

	Requests sorted :ref:`'data' <socket-data>` and :ref:`'metadata' <socket-metadata>` operations over WebSocket through :ref:`CleanController <angular-clean-controller>`.

.. _angular-providers:

Providers
---------

.. _angular-socket-connection:

*	**socketConnection**

	Serves as a façade to the SocketIO library, providing functions for sending requests to the Willow backend using the :doc:`WebSocket API </socketAPI/index>`. Note that the provider makes extensive use of callbacks in order to notify callers of the results of their requested operations. 

.. _angular-session:

*	**session**

	Encapsulates the current session of the client, maintaining data such as the session ID and a copy of the latest metadata of the dataset. The provider also serves as a proxy to the *socketConnection* provider, handling all data laoding, transformation and visualization requests to the Willow backend. Note that the provider makes extensive use of callbacks in order to notify callers of the results of their requested operations. Provides a publisher/subscriber scheme for listening to changes in the dataset. 

.. _angular-analysis:

*	**analysis**

	Proxies all data analysis requests to the **session** provider provides caching functionality for improved performance. Provides a publisher/subscriber scheme for listening to changes in analyses resulting from changes in the dataset.  

.. _angular-dialogs:

*	**dialogs**
	
	Provides universal functions for displaying error dialogs 