title: OpenVZ Networking
description: How to configure and virtual network adapter in an openvz guest.
type: tutorial
category: tutorials
tags: [linux, server, networking, virtualization, openvz]
date: 2012-12-12
---

	nano /var/lib/vz/private/10x/etc/network/interfaces


	auto lo
	iface lo inet loopback
	
	auto eth0
	iface eth0 inet dhcp

	vzctl set 10x --netif_add eth0 --save
