title: BackupPC Linux Client
description: How to configure a linux client to use and backup-pc server.
type: tutorial
category: tutorials
tags: [linux, openssh, ssh, backuppc, rsync]
date: 2012-12-12
---

## login on backup host
	
	::Bash
	sudo apt-get install openssh-server

## login on backup server

## switch user to backuppc
	
	::Bash
	sudo su backuppc
	/bin/bash
	cd /var/lib/backuppc
	ssh-copy-id -i .ssh/id_rsa $HOSTUSER@$HOSTNAME

## remote login on backup host
	
	::Bash
	ssh -i .ssh/id_rsa $HOSTUSER@$HOSTNAME
	sudo apt-get install rsync

## create backuppc host configuration

select xfer method rsync
set rync client command -l root to -l $USER
