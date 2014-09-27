title: Das letzte #Spoti...
slug: diaspora-abbgra-de-p-97
category: timeline
type: base
datetime: 2014-07-05 14:38:28
actions: [["show diaspora", "https://diaspora.abbgra.de/p/97"]]
---
Das letzte [#Spotify](/tags/Spotify) Update verursacht einen Fehler unter
Ubuntu:

> E: Problem with MergeList /var/lib/apt/lists/repository.spotify
.com_dists_stable_non-free_i18n_Translation-de%5fDE

Das kann man leicht beheben:

> sudo mv /var/lib/apt/lists/repository.spotify.com_dists_stable_non-
free_i18n_Translation-de%5fDE /var/lib/apt/lists/repository.spotify
.com_dists_stable_non-free_i18n_Translation-de_DE


