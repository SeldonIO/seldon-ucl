# Seldon + UCL Data Cleaning System
A data exploration and cleaning Web application developed by 2nd year UCL students for Seldon. Providing both spreadsheet and notebook style interfaces, this will be the perfect solution to load, clean, analyze and visualize data when it is actually developed. 
## Installation Instructions
### Vagrant VM
The easiest way to install and run the application is by creating a virtual machine within [Vagrant](https://www.vagrantup.com/downloads.html). Vagrant will automatically set up everything you need to run the web server inside an Ubuntu VM and bind it to port `5000` on your host machine.  

1. Download and install [Vagrant](https://www.vagrantup.com/downloads.html) on your local machine
2. Open a terminal and clone the project onto your local machine:
    ```
    git clone https://github.com/SeldonIO/seldon-ucl.git`
    cd seldon-ucl
    ```
2. Enter `vagrant up` in terminal. It may take a couple of minutes to download and configure the virtual machine, so sit back and think about all the exciting things you will be doing with the application. 
3. Once that completes, open up your browser and go to `localhost:5000`. You should see a beautifully designed user interface. 

If you wish, you can enter `vagrant ssh` in terminal to connect to the VM and mess around with the server. 

### Manual deployment
This is the more tedious and messy approach, as you will have to manually duplicate the server environment on your local machine. 
#### 1. Clone the project
Just Step 2 of **Vagrant VM** instructions
#### 2. Install all Python dependencies
We recommend that you do not install the Python dependencies directly on your local machine, but rather inside a [virtualenv](https://virtualenv.readthedocs.org/en/latest/) container. In Terminal, type these commands:

1. `pip install virtualenv` , if you do not have `virtualenv` already
2. `virtualenv venv` , this should create a `venv` directory inside `seldon-ucl` 
3. `source ./venv/bin/activate` to activate the virtual environment
4. `pip install -r requirements.txt` to install the required Python modules inside the virtual environment

There is a possibility that `pip install -r requirements.txt` will throw error messages. Known errors and solutions:
* `clang error code 1` when installing on `gevent` on OS X. Solved by appending std=c99 flag to CFLAGS environment variable. 
* multiple error messages when installing `pandas` on Ubuntu. Solved by installing `pandas` using system package manager `apt-get` by running `sudo apt-get install -y python-pandas`. 
* error message about missing HDF5 library on all operating systems. Solved by installing HDF5 libraries using the system package manager. 

#### 3. Install and setup RabbitMQ
The application makes use of [Celery](http://www.celeryproject.org/) for running data processing tasks in the background. The commands in  **Step 2** will have automatically installed Celery inside the virtual environment, but Celery requires running servers for a message broker and a results backend.  Our server uses [RabbitMQ](https://www.rabbitmq.com/) for both.
1. Download and install [RabbitMQ](https://www.rabbitmq.com/download.html) 
2. Enter `sudo rabbitmq-server` in Terminal, which should start the message broker server on `amqp://localhost:5672/`
#### 4. Start Celery worker server
With the message broker and results backend server running, the Celery component of the web server can now be started. 
1. Make sure your current working directory is `seldon-ucl`, the cloned project directory.
2. Make sure your virtual environment has been activated. If not, type `source ./venv/bin/activate`.
3. Enter `celery -A flaskApp:celery worker`. This should start the Celery worker server inside the terminal window. 
#### 5. Start Flask web server
1. Make sure your current working directory is `seldon-ucl`, the cloned project directory
2. Make sure your virtual environment has been activated. If not, type `source ./venv/bin/activate`.
2. With everything ready to start the web server, enter `python runserver.py` to start the Flask development server on `localhost:5000`. You should now be able to access web application with a browser at this address. 
#### (Optional) Run Flask application behind Gunicorn web server
The Web server started in **Step 5** is just the Flask development web server, and should not be used in production. It also does not support HTML5 WebSocket connections, so the web server currently forces browsers to revert to HTTP long polling. It is better to serve the Flask web app behind a WSGI server such as Gunicorn. 

1. Make sure your current working directory is `seldon-ucl`, the cloned project directory
2. Make sure your virtual environment has been activated. If not, type `source ./venv/bin/activate`.
3. Enter the following command as one line:
```
gunicorn --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker flaskApp:app --bind=127.0.0.1:5000
```

You may notice that Gunicorn is using the GeventWebSocket WSGI server, which is an extension of the Gevent server, for its worker processes. You do not have to worry about installing these Python modules, as they were already installed along with all other dependencies.

#### (Optional) Run Gunicorn web server behind Nginx web server
The ideal setup in the production setting is running the WSGI server behind another server which serves all the static content. The purpose of this is to boost performance by relieving the Flask web app of the responsibility of serving static files. We recommend using the lightweight [Nginx](http://nginx.org/en/) web server, which is actually what is used on the Vagrant VM.  

1. Download and install [Nginx](http://nginx.org/en/download.html).
2. ...to be written...

#### (Optional) Setup Gunicorn & Celery as Supervisor services
...to be written...

## Built using
### Back-end framework
[Flask](http://flask.pocoo.org)

### Front-end framework
[Angular.js](https://angularjs.org)

### Deployment
[Vagrant](https://github.com/mitchellh/vagrant)

[Ubuntu](http://www.ubuntu.com)

### Back-end libraries
[Flask-SocketIO](https://github.com/miguelgrinberg/Flask-SocketIO)

[Pandas](http://pandas.pydata.org)

### Back-end services
[Gunicorn](http://gunicorn.org)

[Gevent](http://www.gevent.org) and [Gevent-WebSocket](https://github.com/jgelens/gevent-websocket)

[Celery](http://www.celeryproject.org)

[RabbitMQ](https://www.rabbitmq.com)

[Supervisor](http://supervisord.org)

[nginx](https://www.nginx.com/resources/wiki/)

### Front end libraries
[Socket.IO](http://socket.io)

[ui-router](https://github.com/angular-ui/ui-router) for Angular.js

[Plot.ly](https://plot.ly)

[jQuery](https://jquery.com)

[DataTables](jquery datatables rails github) for jQuery

## Issues and Contributing
Please email [Gordon Cheng](mailto:kwok.cheng.14@ucl.ac.uk)
