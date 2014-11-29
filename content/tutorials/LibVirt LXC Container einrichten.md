title: LXC and LibVirt Virtual Machines
description: How to create and configure a lxc guest with libvirt.
type: tutorial
category: tutorials
tags: [linux, server, virtualization, lxc, libvirt]
date: 2012-12-12
---

## create container

	::Bash
	CONTAINERNAME=new_container
	VNETNAME=default
	sudo lxc-create -t ubuntu -n $CONTAINERNAME -- -S .ssh/id_rsa.pub --bindhome $(whoami)

## edit or create template

You can edit an existing template by updating the containername in the name-tag and in the filesystem source dir.
And updating the source network name.

	::Bash
	nano lxc2libvirt.xml

or by crating a new one:

	::Bash
	echo "<domain type='lxc'>
	  <name>$CONTAINERNAME</name>
	  <memory>1048576</memory>
	  <os>
	    <type>exe</type>
	    <init>/sbin/init</init>
	  </os>
	  <vcpu>1</vcpu>
	  <clock offset='utc'/>
	  <on_poweroff>destroy</on_poweroff>
	  <on_reboot>restart</on_reboot>
	  <on_crash>destroy</on_crash>
	  <devices>
	    <emulator>/usr/lib/libvirt/libvirt_lxc</emulator>
	    <filesystem type='mount'>
	      <source dir='/var/lib/lxc/$CONTAINERNAME/rootfs'/>
	      <target dir='/'/>
	    </filesystem>
	    <interface type='network'>
	      <source network='$VNETNAME'/>
	    </interface>
	    <console type='pty' />
	  </devices>
	</domain>" > lxc2libvirt.xml

## add libvirt domain

	::Bash
	sudo virsh -c lxc:/// define lxc2libvirt.xml

## create network configuration

The following command creates a DHCP configuration for the virtual network device.

	::Bash
	sudo echo "# This file describes the network interfaces available on your system
	# and how to activate them. For more information, see interfaces(5).
	
	# The loopback network interface
	auto lo
	iface lo inet loopback
	
	auto eth0
	iface eth0 inet dhcp" > sudo /var/lib/lxc/$CONTAINERNAME/rootfs/etc/network/interfaces

## start container

You can start the new container using the virt-manager on your Desktop, if it is configurated.
Using the virt-manager console, you are able to login with your username and password, from your lxc-host.

## fix language configuration

	::Bash
	export LANGUAGE=de_DE.UTF-8
	export LANG=de_DE.UTF-8
	export LC_ALL=de_DE.UTF-8
	sudo locale-gen de_DE.UTF-8
	sudo dpkg-reconfigure locales

## install extra software

At first, it's necessary to update the software repository

    ::Bash
	sudo apt-get update

The following command installs the avahi-daemon, which is used as a local DNS service.

	::Bash
	sudo apt-get install libnss-mdns

The next step is to fix avahi in virtual machines by disabling "rlimit-nproc" with a comment:

	::Bash
	sudo vi /etc/avahi/avahi-daemon.conf 
	
	#rlimit-nproc=3

reload the avahi daemon by:

	::Bash
	sudo service avahi-daemon reload

Now you can login via ssh

	::Bash
	ssh username@containername.local

## user creation

If you left out the following parameter on the container creation, then you have to create a new user.

	::Bash
	-- -S .ssh/id_rsa.pub --bindhome $(whoami)

### add new user

	::Bash
	sudo useradd $USERNAME -s /bin/bash -m
	sudo passwd $USERNAME
	sudo adduser $USERNAME sudo

### delete inscure default user

	::Bash
	sudo userdel -r ubuntu
