title: Local EMail Redirection
slug: mail-redirect
description: How to configure a redicetion from a local mailbox.
type: tutorial
category: tutorials
tags: [linux, server, postfix, email]
date: 2012-12-12
---

## Installation and Configuration of Postfix

	::Bash
	sudo apt-get install postfix
	sudo nano /etc/postfix/main.cf

The config file should contain something like:

	::Bash
	myhostname = HOSTNAME
	mydestination = HOSTNAME.DOMAIN, HOSTNAME, localhost.localdomain, localhost
	inet_interfaces = loopback-only
	relayhost = MAILHOSTNAME.DOMAIN
	virtual_alias_maps = hash:/etc/postfix/virtual
	
if your mailserver requires SSL/TLS, this is also required:
	
	::Bash
	smtpd_use_tls=yes
	smtp_tls_security_level = may

## Configuration of Generic Adresses

	::Bash
	nano /etc/postfix/virtual

This should redirect all local mails to the admin account.

	::Bash
	@HOSTNAME.DOMAIN admin@MAILHOSTNAME.DOMAIN

## Check and Activation

	::Bash
	sudo postmap /etc/postfix/virtual
	sudo /etc/init.d/postfix reload
