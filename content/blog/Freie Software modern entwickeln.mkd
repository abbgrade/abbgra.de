title: Freie Software modern entwickeln
tags: draft
type: blog-post
category: blog
datetime: 2013-02-22 00:00:00
summary: Wie könnte die Entwicklung von Freier Software aussehen? Wie müssen etablierte Methoden für solche Projekte angepasst werden, um hohe Qualität zu erreichen? Wie kommt man von der Idee zu Arbeitspaketen? Welche Dokumente haben welchen Zweck und werden woraus erstellt? Einige Überlegungen dazu.
thumbnail: scenario_based_design.svg
---
## Wo liegt das Problem?

Das folgende Problem ist bei Hobbyprogrammieren und Entwicklern von freier Software sicher nicht ganz selten: Man hat eine Idee für ein Projekt und auch schon den Lösungsansatz im Hinterkopf.
Die Entwicklungsumgebung ist schnell gestartet und vielleicht auch ein Projekt auf GitHub, BitBucket, etc. angelegt.
Nach ein paar Stunden oder Tagen ist der Plan umgesetzt.
Das Programm ist mehr oder weniger fertig.

Das Problem offenbart sich dann erst später.
Die Usability ist eher dürftig, die Lösung skaliert nicht, der Code ist kaum wartbar und irgendwie gibt es Funktionen, die man nicht braucht und  Andere fehlen dafür.
Das sind jedoch alles Probleme, die mit modernen Entwicklungsmethoden eingedämmt werden können.
Ansätze wie Scenario-Based-Design und Scrum passen jedoch aus folgenden Gründen nicht reibungslos auf solche freien Projekte.

- Beim Scenario-Based-Design wird viel Energie darauf verwendet, den Benutzer zu verstehen.
Wenn man ein Programm selbst nutzen möchte, sollte man den Nutzer bereits verstanden haben.
Es hilft jedoch dabei die Anforderungen, Ziele, Aktionen und den Kontext herauszuarbeiten.
- Scrum behandelt das Projektmanagement und damit eher Aspekte wie Kommunikation, Rollenverteilung, Meilensteine und Ressourcennutzung.
Zumindest am Anfang eines Projekts wird keine Entwicklergemeinde zu koordinieren sein.
Zeitdruck und harte Fristen gibt es ebenfalls nicht. 
Trotzdem hilft es dabei eine gewisse Qualität zu erreichen, Aufgaben zu zerlegen und effizient zu arbeiten.

## Die angepasste Methode

Ausgangssituation ist in der Regel ein Problem oder eine Vision.
Manchmal auch ein Szenario, das einen konkreten Ablauf im Wirken eines Menschen innerhalb eines bestimmten Kontextes beschreibt.
Was es auch ist, es sollte aufgeschrieben werden, damit man es nicht vergisst und weiter daran arbeiten kann.

Problem bzw. Vision sollten kurz und Prägnant den Ist- bzw. den Soll-Zustand beschreiben und dabei klar benennen, was daran falsch ist oder wo genau die Vorteile liegen.
Das hilft das System zu erklären und bei der Entwicklung nicht das Ziel aus den Augen zu verlieren.
So ein Szenario eines Nutzers (User Story) kann sehr frei aufgeschrieben werden.
Technische Lösungen sind irrelevant oder sogar eher zu vermeiden.
Abzuschweifen ist kein Problem, sondern bringt mehr Einblick in potentielle Ziele, Anforderungen und Besonderheiten des Nutzers.

Im Folgenden sollten weitere User Stories formuliert werden, die die Breite des Problems abdecken und einige Sonderfälle beinhalten.
Auf Redundanz muss keine Rücksicht genommen werden.
User Stories können auch in einer Art Brainstorming gefunden werden.
Vorerst fertig ist man, wenn die Ideen zu weit vom eigentlichen Problem bzw. von dem initialen Szenario entfernt sind.

### Strukturieren der Zwischenergebnisse

Vor dem Hintergrund User Stories, sollte eine kurze Übersicht zum Nutzer erstellt werden.
Falls man selber Nutzer ist, kann diese Persona Beschreibung kürzer ausfallen.
Grundsätzlich sind aber Informationen wie Fähigkeiten, Werte/Einstellungen und Ressourcen relevant.
Nutzer und Entwickler können daran sehen ob sie zur Zielgruppe gehören.
Weiter sollte soll aus diesen Informationen zum Nutzer und den User Stories eine Hand voll Design-Prinzipien erstellt werden, mit denen Entscheidungen zwischen Lösungsoptionen getroffen werden sollen.
Hört sich Überflüssig an, aber das Optimieren von Kriterien wie Ressourcenverbrauch, Ausfallsicherheit, Datenschutz, Platformunabhängigkeit und Systemkomplexität führt zu Zielkonflikten, die einheitlich gelöst werden sollten.

Nachdem der abstrakte Nutzer mit seinen Aktivitäten, dem Nutzungskontext sowie das konkrete Problem bzw. die Vision entwickelt wurde. 
Sollte ein konzeptuelles Szenario beschrieben werden. 
Das sollte alle User Stories zusammenfassen, und komprimieren.
Kaum umsetzbare, redundante User Stories und solche, die zu weit abseits der Vision sind werden dabei nicht berücksichtigt.
Auch dieses konzeptuelle Scenario sollte Lösungsansätze ignorieren um sich alle Optionen offen zu halten.
Damit hat man eine Übersicht der Anwendungsmöglichkeiten des Systems und eine erste Abgrenzung was man nicht will oder erst in einer späteren Version des Systems.

### Definition von Abläufe und Aufgaben
<div class="thumbnail col-lg-6 pull-right">
	<img src="scenario_based_design.svg" class=""/>
	<div class="caption">
	<h4>Entwicklungsprozess der Artefakte</h4>
	</div>
</div>
In den Szenarien und in einigen User Stories verbergen sich konkrete Ziele oder Soll-Zustände.
Oft auch schon Abläufe zum Erreichen dieser Ziele.
Diese Abläufe mit ihren Teilaufgaben, Abhängigkeiten sollten herausgearbeitet werden.
Je nach Komplexität bieten hierarchische Listen oder Grafiken eine gute Übersicht.
Wichtig sind Aufgaben, die zum erreichen des Ziels notwendig sind, nicht jedoch Interaktionen.
Am Beispiel eines Shops wären das die Aufgaben: Produktangebot erstellen, Artikel auswählen, Rechnung schreiben, Kontoinformationen mitteilen, Betrag abbuchen, Produkte versenden.
Das sind Aufgaben, die grundsätzlich nötig sind um etwas in einem Online-Shop zu bestellen, passen aber eigentlich auch auf den klassischen Versandhandel mit Katalogen.
Mit etwas Phantasie treffen diese Aufgaben auch auf das Treiben in einem Supermarkt zu.
Die Ziele werden erreicht, denn der Nutzer bekommt die gewünschten Produkte und der Händler bekommt Geld.
Die technische Umsetzung bleibt aber weitgehend offen.
Anders gesagt, es ist nicht klar, ob eine Aufgabe vom System oder vom Nutzer erledigt wird. 
Trotzdem werden dabei die wichtigen Objekte und Aktionen klar, die für Lösungskonzepte und Interaktionsdesign wichtig werden.

### Definition der Anforderungen

### Konzept zur Systemarchitektur

Jetzt sind die Szenarios verstanden, die Ziele und Aufgaben sind klar, wichtige Objekte und Aktionen sind bekannt.
Es wird Zeit, die Lösung in den Fokus zu rücken.
Um ein Konzept zu erarbeiten sollte man die Aufgaben iterativ durcharbeiten und dabei die Verantwortlichkeiten klären.
Soll eine Aufgabe vom System übernommen werden sollte man sich überlegen, was sich daraus für Anforderungen ergeben.
Soll z.B. etwas ausgewählt werden, ist eine Datenstruktur mit den Optionen nötig. 
Wie groß kann diese Datenstruktur werden?
Reicht der Arbeitsspeicher oder ist eine Datenbank nötig?
Sind die Ressourcen eines Smartphones,eines lokalen Server oder eines Cloud-Dienstes ausreichend?
Auch die Kommunikationsstruktur sollte geklärt werden, wenn es ein verteiltes System werden soll.
Wichtig sind natürlich auch die Plattform des Systems.
An dieser Stelle sind die bereits erstellten Design-Prinzipien nützlich, mit denen Optionen bewertet oder ausgeschlossen werden können.
In diesem Architektur-Konzept sollten zur Verbesserung der Nachvollziehbarkeit auch die verworfenen Ansätze mit dem jeweiligen Grund notiert werden.

Hat man sich auf einen Lösungsansatz festgelegt, sollte dieser zu einer vollständigen Architektur ausgebaut werden.
Das beinhaltet erst einmal das Definieren von Komponenten, Schnittstellen, deren Laufzeitverhaltung und Verteilung.
Das funktionale Verhalten der Komponenten, oder genauer deren Funktionen und Subfunktionen, sollte genauer definiert werden.
Dazu sollten Anforderungen (UseCases) erstellt werden, die zumindest einen Namen sowie eine Vor- und eine Nachbedingung erhalten.
Diese UseCases eigenen sich zum Einen als Arbeitspakete und zum Anderen können daraus UnitTests abgeleitet werden, die sich für Test-Driven-Developement eignen.

Die technischen Aspekte der Lösung können neue Aufgaben und User Stories erfordern.
Bei einer Client-Server-Architektur z.B. muss der Benutzer den Server auswählen können.
Gibt es solche Änderungen müssen die jeweils abgeleiteten Artefakte ebenfalls aktualisiert werden.

<!--
<span class="clearfix"/>
### Design der Benutzerschnittstelle
-->

## Referenzen

- ["Designing Interactive Systems: A Comprehensive Guide to Hci and Interaction Design"](http://books.google.de/books?id=P923PwAACAAJ)
- ["Arc42 - Template zur Entwicklung, Dokumentation und Kommunikation von Software-Architekturen"](http://arc42.org/template.html)