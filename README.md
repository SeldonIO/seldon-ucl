# Willow (Seldon/UCL Data Cleaning System)
A data exploration and cleaning Web application developed by 2nd year UCL students for [Seldon](http://www.seldon.io/). A user-friendly and powerful solution for cleaning, analyzing and visualizing datasets. [Click here](http://students.cs.ucl.ac.uk/2015/group19/) for more detailed information on the project, including user documentation and developer guide. 

## Installation Instructions
### Vagrant VM
The easiest way to get Willow up and running is with [Vagrant](https://www.vagrantup.com/downloads.html). Using Vagrant will automatically install and configure the system inside a virtual machine and bind the Web application to port `5000` on your host machine.  

1. Download and install [Vagrant](https://www.vagrantup.com/downloads.html) and [VirtualBox](https://www.virtualbox.org/wiki/Downloads) on your local machine. 
2. Download the [Willow Vagrantfile](http://students.cs.ucl.ac.uk/2015/group19/assets/file/Vagrantfile) and save it inside an empty directory. 
3. Open a terminal and `cd` into the directory containing the Vagrantfile. 
4. Type `vagrant up` to begin the installation process. It may take a couple of minutes to download and configure the virtual machine. 
3. Once that completes, open  your browser and navigate to `localhost:5000`. You should see the Willow upload screen. 

## Built using
### Back-end framework
[Flask](http://flask.pocoo.org)

### Front-end framework
[Angular.js](https://angularjs.org)

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
[Angular Material](https://material.angularjs.org/latest/)

[Socket.IO](http://socket.io)

[ui-router](https://github.com/angular-ui/ui-router) for Angular.js

[Handsontable](https://handsontable.com/)

## Issues and Contributing
Please visit the [project website](http://students.cs.ucl.ac.uk/2015/group19/) for more information.
