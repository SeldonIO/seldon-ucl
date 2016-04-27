Deployment
==========

Willow's current deployment method, as outlined in our `user documentation <http://students.cs.ucl.ac.uk/2015/group19/user-docs.html>`_ and `GitHub page <https://github.com/SeldonIO/seldon-ucl>`_, is locally inside a Vagrant virtual machine. 

Vagrant Provisioning
--------------------

Users are instructed to download a `Vagrantfile <https://github.com/SeldonIO/seldon-ucl/blob/master/Vagrantfile>`_ which instructs Vagrant to download a `custom virtual machine image <https://atlas.hashicorp.com/bandienkhamgalan/boxes/seldonucldcs>`_ hosted on our servers. The virtual machine is a 64-bit `Debian Jessie <https://www.debian.org/>`_ installation with 2GB RAM pre-configured with all of Willow's :ref:`backend dependencies <architecture-server>`. 

Every time the virtual machine starts up, a provisioning script automatically updates Willow by pulling the latest commit from the master branch of our GitHub repo, starts the backend daemons and maps port 80 of the virtual machine to port 5000 on the user's host machine, allowing them to access Willow by navigating to localhost:5000 on a Web browser.

Remote Deployment and Other Strategies
--------------------------------------
Although Willow only supports local deployment out of the box, we architected the system with future support for multiple deployment strategies in mind. The client-server architecture of Willow means that it *can* quite easily be deployed remotely on a dedicated server in a public or private network, which would allow users to access and manipulate their datasets in the cloud. 

.. warning::

	Willow, as a proof of concept, was not developed with security in mind. Developers should seriously consider
	implementing security features such as a user and permission management system, before deploying Willow
	on a remote server. 