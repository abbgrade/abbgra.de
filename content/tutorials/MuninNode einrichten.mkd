title: Munin Node Installation
description: How to install and configure a munin node on ubuntu.
type: tutorial
category: tutorials
tags: [linux, munin, monitoring, ubuntu]
date: 2013-08-24
---

## Node Side

Some steps must be executed as superuser.

	sudo su

This steps install and configure the node.
	
	MUNIN_MASTER=munin.local
	# Install.
	apt-get install -y munin-node munin-plugins-extra avahi-utils
	# Configure the node by allowing the acces by the munin-master to the new installed node.
	avahi-resolve -n4 $MUNIN_MASTER | python -c "import sys;print '\nallow ^%s$\n' % sys.stdin.readlines()[0].split('\t')[1].strip().replace('.','\.')" >> /etc/munin/munin-node.conf
	# Configure the plugins.
	munin-node-configure --shell --families=contrib,auto | sh -x
	# Restart the node.
	/etc/init.d/munin-node restart
	echo done
	
## Master Side

Configure the master by adding to "/etc/munin/munin.conf":

	[diaspora.abbgra.de]
	    address diaspora.local
	    use_node_name yes

Replace "diaspora.abbgra.de" by the name and "diaspora.local" by the hostname or ip address.