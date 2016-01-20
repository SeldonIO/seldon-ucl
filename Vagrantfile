Vagrant.configure(2) do |config|
	config.vm.box = "ubuntu/trusty64"
	config.vm.network :forwarded_port, host: 5000, guest: 80
	config.vm.provision :shell, path: "vagrant_provisioning/bootstrap.sh"
end