title: BackupPC Server
description: How to configure a backup-pc server.
type: tutorial
category: tutorials
tags: [linux, backuppc, ssh, rsync]
date: 2012-12-12
---

## install backuppc
	
	::Bash
	sudo apt-get install backuppc

## create admin logon
	
	::Bash
	sudo htpasswd /etc/backuppc/htpasswd backuppc

## create ssh id for remote auth
	
	::Bash
	sudo su backuppc
	/bin/bash
	cd /var/lib/backuppc
	ssh-keygen -t rsa

## configure default host configuration

select xfer method rsync
append to rync client command -i /var/lib/backuppc/.ssh/id_rsa
