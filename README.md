# Seldon + UCL Data Cleaning System
A data exploration and cleaning Web application developed by 2nd year UCL students for Seldon. A user-friendly and scalable solution to load, clean, analyze and visualize data. [Click here](http://students.cs.ucl.ac.uk/2015/group19/) for our project website.

## Installation Instructions
### Vagrant VM
The easiest way to install and run the application is by creating a virtual machine within [Vagrant](https://www.vagrantup.com/downloads.html). Vagrant will automatically set up everything you need to run the web server inside a virtual machine and bind it to port `5000` on your host machine.  

1. Download and install [Vagrant](https://www.vagrantup.com/downloads.html) on your local machine
2. Open a terminal and clone the project onto your local machine:
    ```
    git clone https://github.com/SeldonIO/seldon-ucl.git`
    cd seldon-ucl
    ```
2. Enter `vagrant up` in terminal. It may take a couple of minutes to download and configure the virtual machine. 
3. Once that completes, open up your browser and go to `localhost:5000`. 

If you wish, you can enter `vagrant ssh` in terminal to connect to the VM and mess around with the server. 

## Built using
### Back-end framework
[Flask](http://flask.pocoo.org)

### Front-end framework
[Angular.js](https://angularjs.org)

[Angular Material](https://material.angularjs.org/latest/)

### Deployment
[Vagrant](https://github.com/mitchellh/vagrant)

[Debian](https://www.debian.org/)

### Back-end libraries
[Pandas](http://pandas.pydata.org)

[SciPy](http://www.scipy.org/)

[NumPy](http://www.numpy.org/)

[Eventlet](http://eventlet.net/)

[Flask-SocketIO](https://github.com/miguelgrinberg/Flask-SocketIO)

[Flask-SQLAchemy](http://flask-sqlalchemy.pocoo.org/) and [SQLite](https://www.sqlite.org/)

[matplotlib](http://matplotlib.org/)

[chardet](https://chardet.github.io/)

[requests](http://python-requests.org/)

### Back-end services
[Gunicorn](http://gunicorn.org)

[Celery](http://www.celeryproject.org)

[RabbitMQ](https://www.rabbitmq.com)

[Supervisor](http://supervisord.org)

[nginx](https://www.nginx.com/resources/wiki/)

### Front end libraries
[Socket.IO](http://socket.io)

[ui-router](https://github.com/angular-ui/ui-router) for Angular.js

[Handsontable](https://handsontable.com/)

## Issues and Contributing
Please visit the [project website](http://students.cs.ucl.ac.uk/2015/group19/) for more information. 
