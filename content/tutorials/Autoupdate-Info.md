title: Autoupdate Notification
description: How to configure a mail notification on software updates.
type: tutorial
category: tutorials
tags: [linux, server, autoupdate, cron-apt, email]
date: 2012-12-12
---

## Installation and Configuration of cron-apt
	
	::Bash
	sudo apt-get install cron-apt
	sudo nano /etc/cron-apt/config
	
## Notification Configuration
	
	::Bash
	MAILON="always"

## Cron Activation

	::Bash
	sudo ln -s /usr/sbin/cron-apt /etc/cron.daily/cron-apt
