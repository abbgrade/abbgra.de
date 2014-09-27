tags: [algorithms, benchmark, multicore, gpgpu]
type: blog-post
category: blog
datetime: 2011-09-15 00:00:00
title: Parallele Praefixalgorithmen für Multi-Core- und Many-Core-Prozessoren
summary: Der Präfixscan ist eine primitive Operation, die als paralleler Baustein im Algorithmendesign verwendet wird.<br />Es gibt eine Vielzahl von Parallelen Präfixalgorithmen, die aber nicht vor dem Hintergrund moderner Rechnerarchitekturen mit ihren Cachehierachien oder den hochgradig parallelen Grafikkarten entwickelt wurden.<br />Diese Arbeit erklärt die Grundlagen des Präfixproblems und die existierenden Präfixalgorithmen inklusive einer theoretischen Bewertung. Eine Auswahl von Algorithmen wird mit OpenMP, OpenCL, CUDA und den PGI Accellerator Derectives implementiert, getestet und bewertet.<br />Das Ergebnis ist, dass der optimale Algorithmus im Einzelfall von Rechnerarchitektur, Problemgröße und Präfixoperation abhängt.
---

Einleitung
==========

Auf dem Präfixproblem aufbauend existieren Lösungen verschiedenster Probleme der Mathematik oder der Informatik. Hauptsächlich in den 80er und 90er Jahren wurden mehrere Parallele Präfixalgorithmen dazu vorgestellt. Seit dem haben sich die Architekturen der Parallelrechner aber deutlich, in durchaus verschiedene Richtungen, entwickelt. SMP-Prozessoren mit wenigen aber leistungsfähigen Kernen erfordern andere Programmieransätze als die massiv-parallelen Grafikkarten mit ihren zum Teil synchronen Recheneinheiten. Auch die spezifische Speicheranbindung harmoniert unterschiedlich gut mit den eingesetzten Algorithmen.

Das Ziel dieser Arbeit ist einen umfassenden Überblick zu geben. Dazu werden erst die Grundlagen geklärt und darauf aufbauend folgende Fragen geklärt. Was ist eigentlich das Präfixproblem und welche Varianten gibt es? Wobei kann man es anwenden und wie kann man verschiedene Einschränkungen von Algorithmen oder verfügbaren Rechnern umgehen? Nach welchen Kriterien und mit welchen Methoden kann man Algorithmen und Implementierungen bewerten? Was sind die wichtigsten Eigenschaften der Rechnerarchitekturen und APIs?

Im Kapitel [sec:alg] werden eine Reihe von Präfixalgorithmen vorgestellt und deren Besonderheiten erklärt. Oft handelt es sich dabei um Erweiterungen bereits bestehener Algorithmen, die Nachteile oder Beschränkungen aufheben. Andere Algorithmenvarianten sind auf spezifische Rechnerarchitekturen optimiert. Diese Algorithmen werden kategoriesiert und verglichen.

Das nächste Kapitel [sec:imp] beleuchtet, wie diese Algorithmen auf modernen Multi- und Manycore-Systemen implementiert werden können und was bei der Implementierung zu beachten ist. Konkret werden die APIs OpenMP, OpenCL, CUDA und die PGI Accellerator Derectives verwendet. Dazu wird erst eine Auswahl getroffen, welche Algorithmen überhaupt implementierbar sind und bei welchen Algorithmen eine Aussicht auf gute Resultate besteht.

Im Kontext dieser Implementierungen werden auch die Implementierungsunterschiede der APIs gezeigt.

Diese Implementierungen werden in Form einer Softwarebibliothek veröffentlicht. Die Sektion [sec:libstruct] erklärt deren Struktur und wie diese genutzt werden kann.

Die Auswirkungen dieser Unterschiede, der Algorithmen und deren Erweiterungen sowie der verwendeten Rechnerarchitekturen werden im Kapitel [sec:eval] herausgestellt. Dazu werden die Implementierungen vermessen. Die Messergebnisse werden dann verglichen und analysiert.

Zuletzt folgt noch eine Zusammenfassung der Ergebnisse in Kapitel [sec:con] mit dem Ausblick in Sektion [sec:con:fut].

Grundlagen
==========

[sec:base]

In diesem Kapitel werden ein paar mathematische und begriffliche Definitionen erklärt. Desweiteren sind eine unvollständige Auflistung von Anwendungsbereichen sowie Bewertungmethoden für Algorithmen Teil dieses Kapitels. Die letzte Sektion beinhaltet die grundlegenden Konzepte und Besonderheiten der in dieser Arbeit betrachteten APIs und deren zugrundeliegender Hardware.

Mathematische und begriffliche Definitionen
-------------------------------------------

Im Folgenden ist $P = \{p_0, p_1, \ldots, p_{p-1}\}$ die Menge und $p$ die Anzahl der Prozessoren. $X = [x_0, x_1, \ldots, x_{n-1}]$ ist ein Vektor mit Elementen vom Typ $D$. $ \otimes $ ist eine assoziative Operation auf $D$ und $n$ die Länge des Vektors.

Darauf aufbauend ist laut @pp_computation [, 1] $Scan_{\otimes} : D \rightarrow D$ eine inklusive Präfixoperation, eine Lösung für das Präfixproblem, definiert durch:

$$Scan_{\otimes}(X) = [(x_0), (x_0 \otimes x_1), \ldots, 
(x_0 \otimes x_1 \otimes \ldots \otimes x_{n-1})]$$

Die exklusive Präfixoperation ist definiert durch:

$$Prescan_{\otimes}(X) = [e, (x_0), (x_0 \otimes x_1), \ldots, 
(x_0 \otimes x_1 \otimes \ldots \otimes x_{n-2})]$$

Dabei ist $e$ das neutrale Element von $\otimes$. Sofern nichts anderes genannt ist, wird in dieser Arbeit die inklusive Präfixoperation betrachtet.

Die Reduktion ist mit dem Scan verwand und wird in einigen Algorithmen verwendet. Die Definition ist wie folgt:

$$Reduce_{\otimes}(X) = x_0 \otimes x_1 \otimes \ldots \otimes x_{n-1}$$

Wie in @scans_as [, 44] erklärt, ist "‘Päfixoperation"’ gleichbedeutend mit Scan. Das Scannen eines Vektors ist somit das Ausführen einer Präfixoperation auf einen Vektor. In manchen Dokumenten wird das Präfixproblem auch "‘Alle Partialsummen"’ kurz APL genannt.

Übliche Scan-Operatoren sind z.B. das logische *UND*, *ODER*, und *EXKLUSIVES ODER*. Für Reduktionen sind *SUMME*, *PRODUKT*, *MAXIMUM* und *MINIMUM* gängig. @data_par [, 5]

### Scans auf beliebige Vektoren

Viele Scan-Algorithmen haben die Beschränkung $p = n$. Dazu folgt später mehr in Sektion [sec:pram]. Diese größenbeschränkten Algorithmen sind aber trotzdem in jedem Fall anwendbar.

Im Fall $p > n$ können mit $x_i = e| n \geq i > p$ die ungenutzten Felder mit dem neutralen Element $e$ initialisiert werden. Dann enthält das Ergebnis der Länge $p$ das Ergebnis der Länge $n$. Eine andere Möglichkeit wäre die überflüssigen Prozessoren nicht zu nutzen oder zu deaktivieren.

Im Fall $p < n$ kann $X$ partitioniert werden. Die Partitionen werden für sich sequenziell, in sogenannte *processor sums*, gescannt. Diese Teilergebnisse können nach @prefixsums [, 7] in das gewünschte Ergebnis reduziert werden.

Die Reduktionsfunktion is dabei wie folgt definiert:

$$X \circ_\otimes Y  = [x_0, x_1, \ldots, x_i, x_i \otimes y_0, x_i \otimes y_1, x_i \otimes y_j]$$

Aus der Assoziativität von $\otimes$ folgt:

$$Scan_{\otimes}(X) = Scan_{\otimes}(Y \circ Z) = Scan_{\otimes}(Y) \circ_\otimes Scan_{\otimes}(Z)$$

### Segmentierte Präfixoperationen

Eine weitere Variante der Präfixoperation ist die *Segmentierte Präfixoperation*. @pip_pp [, 2] @prefixsums [, 18] Ein Beispiel für die Anwendung ist eine parallele Variante des Quicksort.

Einfach ausgedrückt gibt es beim segmentierten Scan einen weiteren Vektor von Flags, in der Länge des Eingabevektors. Ist ein Flag gesetzt, wird an dieser Stelle beim Scan die Summe zurückgesetzt.

$$(x_0, a_0) \otimes' (x_1, a_1) = (a_0 \vee a_1,\ if\ a_1\ then\ x_1,\ else\ x_0 \otimes x_1)$$

Algorithmen für die Segmentierte Präfixoperation werden in dieser Arbeit nicht weiter betrachtet.

Anwendungsgebiete des Präfixproblems
------------------------------------

Scans sind primitive Operationen, die für sich genommen einen geringen Nutzen haben. Mit der sequenziellen Verkettung solcher primitiven Operationen können aber komplexe Algorithmen für konkrete Probleme erstellt werden, in denen Scans als atomare Operationen benutzt werden. Durch die Parallelisierung dieser primitiven Operationen kann dann, für die Algorithmendesigner transparent, der Algorithmus parallelisiert und damit beschleunigt werden.

Scans können in einer Reihe von Problemen der Informatik eingesetzt werden. In den folgenden Sektionen werden drei dieser Anwendungen vorgestellt.

### Lösung von rekursiven Gleichungen

Nach Guy E. Blelloch @prefixsums [, 13-17] können verschiedene rekursive Gleichungen mit Hilfe von Präfixoperationen aufgelöst werden. Denn ein Scan kann selbst als rekursive Funktion dargestellt werden.

$$x'_i= \begin{cases}
    x_0, & \mbox{wenn }i = 0\\
    x'_i \otimes x_{i-1}, & \mbox{wenn } 0 < i < n
\end{cases}$$

Andere lineare Rekursionen erster Ordnung, können in der Simulation von zeitvariierten lineraren Systemen, beim Auflösen von tridiagonalen linearen Systemen sowie in der Auswertung von Polynomen benutzt werden. Das sieht dann wie in folgender Funktion aus.

$$x'_i= \begin{cases}
    x_0, & \mbox{wenn }i = 0\\
    (x'_i \otimes x_{i-1}) \odot b_i, & \mbox{wenn } 0 < i < n
\end{cases}$$

Diese können damit umgekehrt auch mit Scans aufgelöst werden, falls $\odot$ assoziativ ist.

Auch Rekursionen höherer Ordnungen, wie z.B. die beim Generieren der Fibonacci-Zahlen auftreten, können so umgeformt werden, dass diese mit Multiplikations-Scans auf $k \times k$-Matrizen gelöst werden können. @pp_few [, 1]@prefixsums [, 17]

### Dynamische Zuordnung von Arbeit auf Prozessoren

Beispielsweise beim Berechnen von Spielbäumen sind die Arbeitspakete vor dem Prozessstart unbekannt. In dem Fall kann ein Prozessor $p_i$ über ein Flag $f_i$ in einem Vektor $F$ mitteilen, dass er bereit ist ein neues Arbeitspaket zu verarbeiten. Ein $Scan_+(F)$ berechnet daraus den Vektor mit den Offsets zum Kopieren der Arbeitspakete. @prefixsums [, 20,21]

### Simulation von Mealy-Maschinen

Nach @pp_computation [, 5,6] ist es möglich Endliche Maschinen $ M = (\Sigma, \Delta, S, \delta, \lambda, s_0) $, und damit alle mealy-berechenbare Probleme, mit Scan-Operationen parallel zu simulieren. Ein Beispiel wäre die Addition von natürlichen Zahlen. @witt [, 111,114]

Für die Darstellung als Präfixproblem wird für jedes $x \in \Sigma $ eine Funktion $ M_x : S \rightarrow S $ mit $ sM_x = \delta(s, x)$ definiert.

Dann ist das Ergebnis von $ Scan_M(X) = s_0M_{x_0} \circ M_{x_1} \circ M_{x_2} \circ M_{x_n-1} $ gleich den Zustandsübergängen von $M$ nach der Eingabe des Wortes $X$. Dabei ist $\circ$ die Funktionale Komposition.

Bewertungsmethoden für Parallele Algorithmen
--------------------------------------------

Auf Grund der großen Zahl von Verfahren zur Präfixberechnung ist es notwendig eine Vorauswahl mit Hilfe von theoretischen Bewertungsmethoden zu treffen. Dabei wird abgeschätzt, wie gut diese auf aktuellen Architekturen skalieren können. Die andere Frage ist, wie die konkreten Implementierungen systematisch evaluiert werden können.

### Theoretische Bewertungsmethoden

Nach Paul G. H. Bachmann @bachmann [, 401] drückt die Funktion $O(n)$ eine Größe aus, deren Ordnung in Bezug auf $n$ die Ordnung $n$ nicht überschreitet.

Allgemein auf Algorithmen bezogen, kann damit die Schrittkomplexität ausgedrückt werden. Es kann also abgeschätzt werden, wie die Zahl der nötigen Rechenschritte mit der Problemgröße $n$ wächst. Es ist allerdings zu beachten, dass ein Algorithmus mit höherer $O$-Ordnung in manchen Fällen trotzdem die bessere Wahl ist, wenn er beispielsweise eine niedrigere untere Schranke $\Omega(n)$ hat. @knuth_bobobt [, 1]

Für parallele Algorithmen ist weiter die Arbeitskomplexität relevant, die ebenfalls mit der $O$-Notation beschrieben werden kann. Die Arbeitskomplexität ist die Ordnung der Rechenschritte aller Prozessoren in der Summe. Diese Funktion hat einen indirekten Einfluss auf die Effizienz eines Algorithmus. Beispielsweise beim Zugriff auf gemeinsamen Speicher kann eine hohe Arbeitskomplexität zu einer starken Konkurrenz der Prozessoren und damit zu Wartezeiten beim Zugriff führen.

Abhängig von der Rechnerarchitektur und der Leistungsfähigkeit des Kommunikationsnetzes, wirkt sich die Kommunikationskomplexität auf die Algorythmen-Effizienz aus. Da in dieser Arbeit keine verteilten Systeme betrachtet werden, wird die Kommunikationskomplexität nicht zur Bewertung herangezogen.

### Praktische Algorithmenbewertung

Neben den theoretischen Algorithmenbewertungen gibt es die Möglichkeit, die Algorithmen zu implementieren und die Programmlaufzeit $T(n, p)$ zu messen. Dazu wird das Programm mit Varianten eines Parameters gestartet. Bei Multicoresystemen kann die Prozessorzahl verändert werden und bei Multi- sowie Manycoresystemen kann zusätzlich noch die Problemgröße variiert werden. Aus den Programmlaufzeiten und diesen Parametern der Ausführung können dann Kennzahlen wie z.B. der Speedup $S(n, p)$ errechnet werden (siehe Gleichung [eq:speedup]).

Die Speedupkurve gibt die Beschleunigung des Programms durch den Einsatz zusätzlicher Prozessoren an. Als Referenz wird die Laufzeit des schnellsten seriellen Algorithmus $T_\star(n,1)$ genommen und nicht die Laufzeit des zu testenden Programms auf einem einzigen Prozessor. Wenn für die Tests von verschiedenen Algorithmen der Speedup mit dem selben seriellen Algorithmus bestimmt wird, können die Speedups der Algorithmen verglichen werden.

Der Speedup ist, wie Gene M. Amdahl @amdahl gezeigt hat, in der Regel nicht linear zu der Prozessorzahl, da manche Programmteile, die z.B. Verwaltungsaufgaben übernehmen, nicht parallelisiert werden können. Aus der Laufzeit dieser seriellen Teile ergibt sich eine obere Schranke für den Speedup.

$$\label{eq:speedup}
S(n,p) = \frac{T_\star(n,1)}{T(n,p)}$$

Nach John L. Gustafson @gustafson wachsen die parallelisierbaren Anteile eines Programms aber stärker mit der Problemgröße als die sequenziellen Anteile das tun. Damit verschiebt sich die obere Schranke des Speedups mit wachsender Problemgröße nach oben.

Eine Besonderheit von Primitiven, wie der Präfixoperation ist, dass die Abhänigkeit des Speedups von der konkreten Operation gemessen werden kann. Durch ein verändertes Verhältnis von Berechnung zu Kommunikation können begrenzende Faktoren bei einem anderen Punkt wirksam werden.

Betrachtete Programmierschnittstellen
-------------------------------------

Parallele Systeme unterscheiden sich darin, ob die Recheneinheiten gemeinsamen oder dedizierte Speicher haben, in Zahl und Leistungsfähigkeit der Recheneinheiten, darin ob die parallelen Recheneinheiten symmetrisch oder als heterogene Koprozessoren angebunden sind.

Um die diversen Architekturen zu programmieren gibt es spezialisierte APIs, mit denen sehr hardwarenah auf dem jeweiligen System gearbeitet werden kann. Beispiele dafür wären SSE-Bibliotheken für x86-Systeme oder CUDA für nVidia-Grafikkarten. Einen weiteren Ansatz verfolgt OpenMP oder die PGI Accelerator Compiler, bei denen Komplexität verborgen werden soll. Bei OpenCL hingegen ist eine Plattformunabhängigkeit das Ziel.

Alle drei Konzepte haben ihre Daseinsberechtigung und werden darum in dieser Arbeit berücksichtigt.

### Multicore- und Multiprozessorarchitekturen

[sec:bas:multi]

(8.000000,2.000000)–(8.000000,6.050000)–(58.000000,6.050000)–(58.000000,2.000000)–cycle; (8.000000,2.000000)–(8.000000,6.050000)–(58.000000,6.050000)–(58.000000,2.000000)–cycle; at (33.000000,4.180000)Layer 3 Cache; (10.000000,6.000000)–(10.000000,8.000000)–(18.000000,8.000000)–(18.000000,6.000000)–cycle; (10.000000,6.000000)–(10.000000,8.000000)–(18.000000,8.000000)–(18.000000,6.000000)–cycle; at (14.000000,7.155000)Layer 2 Cache; (10.000000,8.000000)–(10.000000,12.000000)–(18.000000,12.000000)–(18.000000,8.000000)–cycle; (10.000000,8.000000)–(10.000000,12.000000)–(18.000000,12.000000)–(18.000000,8.000000)–cycle; at (14.000000,10.155000)Core 2; (10.000000,12.000000)–(10.000000,14.000000)–(18.000000,14.000000)–(18.000000,12.000000)–cycle; (10.000000,12.000000)–(10.000000,14.000000)–(18.000000,14.000000)–(18.000000,12.000000)–cycle; at (14.000000,13.155000)Layer 2 Cache; (10.000000,14.000000)–(10.000000,18.000000)–(18.000000,18.000000)–(18.000000,14.000000)–cycle; (10.000000,14.000000)–(10.000000,18.000000)–(18.000000,18.000000)–(18.000000,14.000000)–cycle; at (14.000000,16.155000)Core 1; (10.000000,18.000000)–(10.000000,20.000000)–(18.000000,20.000000)–(18.000000,18.000000)–cycle; (10.000000,18.000000)–(10.000000,20.000000)–(18.000000,20.000000)–(18.000000,18.000000)–cycle; at (14.000000,19.155000)Layer 2 Cache; (10.000000,20.000000)–(10.000000,24.000000)–(18.000000,24.000000)–(18.000000,20.000000)–cycle; (10.000000,20.000000)–(10.000000,24.000000)–(18.000000,24.000000)–(18.000000,20.000000)–cycle; at (14.000000,22.155000)Core 0; (18.000000,6.000000)–(18.000000,24.000000)–(23.000000,24.000000)–(23.000000,6.000000)–cycle; (18.000000,6.000000)–(18.000000,24.000000)–(23.000000,24.000000)–(23.000000,6.000000)–cycle; at (20.500000,14.837500)Memory ; at (20.500000,15.472500)Controller; (23.000000,6.000000)–(23.000000,8.000000)–(31.000000,8.000000)–(31.000000,6.000000)–cycle; (23.000000,6.000000)–(23.000000,8.000000)–(31.000000,8.000000)–(31.000000,6.000000)–cycle; at (27.000000,7.155000)Layer 2 Cache; (23.000000,8.000000)–(23.000000,12.000000)–(31.000000,12.000000)–(31.000000,8.000000)–cycle; (23.000000,8.000000)–(23.000000,12.000000)–(31.000000,12.000000)–(31.000000,8.000000)–cycle; at (27.000000,10.155000)Core 5; (23.000000,12.000000)–(23.000000,14.000000)–(31.000000,14.000000)–(31.000000,12.000000)–cycle; (23.000000,12.000000)–(23.000000,14.000000)–(31.000000,14.000000)–(31.000000,12.000000)–cycle; at (27.000000,13.155000)Layer 2 Cache; (23.000000,14.000000)–(23.000000,18.000000)–(31.000000,18.000000)–(31.000000,14.000000)–cycle; (23.000000,14.000000)–(23.000000,18.000000)–(31.000000,18.000000)–(31.000000,14.000000)–cycle; at (27.000000,16.155000)Core 4; (23.000000,18.000000)–(23.000000,20.000000)–(31.000000,20.000000)–(31.000000,18.000000)–cycle; (23.000000,18.000000)–(23.000000,20.000000)–(31.000000,20.000000)–(31.000000,18.000000)–cycle; at (27.000000,19.155000)Layer 2 Cache; (23.000000,20.000000)–(23.000000,24.000000)–(31.000000,24.000000)–(31.000000,20.000000)–cycle; (23.000000,20.000000)–(23.000000,24.000000)–(31.000000,24.000000)–(31.000000,20.000000)–cycle; at (27.000000,22.155000)Core 3; (35.000000,6.000000)–(35.000000,8.000000)–(43.000000,8.000000)–(43.000000,6.000000)–cycle; (35.000000,6.000000)–(35.000000,8.000000)–(43.000000,8.000000)–(43.000000,6.000000)–cycle; at (39.000000,7.155000)Layer 2 Cache; (35.000000,8.000000)–(35.000000,12.000000)–(43.000000,12.000000)–(43.000000,8.000000)–cycle; (35.000000,8.000000)–(35.000000,12.000000)–(43.000000,12.000000)–(43.000000,8.000000)–cycle; at (39.000000,10.155000)Core 8; (35.000000,12.000000)–(35.000000,14.000000)–(43.000000,14.000000)–(43.000000,12.000000)–cycle; (35.000000,12.000000)–(35.000000,14.000000)–(43.000000,14.000000)–(43.000000,12.000000)–cycle; at (39.000000,13.155000)Layer 2 Cache; (35.000000,14.000000)–(35.000000,18.000000)–(43.000000,18.000000)–(43.000000,14.000000)–cycle; (35.000000,14.000000)–(35.000000,18.000000)–(43.000000,18.000000)–(43.000000,14.000000)–cycle; at (39.000000,16.155000)Core 7; (35.000000,18.000000)–(35.000000,20.000000)–(43.000000,20.000000)–(43.000000,18.000000)–cycle; (35.000000,18.000000)–(35.000000,20.000000)–(43.000000,20.000000)–(43.000000,18.000000)–cycle; at (39.000000,19.155000)Layer 2 Cache; (35.000000,20.000000)–(35.000000,24.000000)–(43.000000,24.000000)–(43.000000,20.000000)–cycle; (35.000000,20.000000)–(35.000000,24.000000)–(43.000000,24.000000)–(43.000000,20.000000)–cycle; at (39.000000,22.155000)Core 6; (43.000000,6.000000)–(43.000000,24.000000)–(48.000000,24.000000)–(48.000000,6.000000)–cycle; (43.000000,6.000000)–(43.000000,24.000000)–(48.000000,24.000000)–(48.000000,6.000000)–cycle; at (45.500000,14.837500)Memory ; at (45.500000,15.472500)Controller; (48.000000,6.000000)–(48.000000,8.000000)–(56.000000,8.000000)–(56.000000,6.000000)–cycle; (48.000000,6.000000)–(48.000000,8.000000)–(56.000000,8.000000)–(56.000000,6.000000)–cycle; at (52.000000,7.155000)Layer 2 Cache; (48.000000,8.000000)–(48.000000,12.000000)–(56.000000,12.000000)–(56.000000,8.000000)–cycle; (48.000000,8.000000)–(48.000000,12.000000)–(56.000000,12.000000)–(56.000000,8.000000)–cycle; at (52.000000,10.155000)Core 11; (48.000000,12.000000)–(48.000000,14.000000)–(56.000000,14.000000)–(56.000000,12.000000)–cycle; (48.000000,12.000000)–(48.000000,14.000000)–(56.000000,14.000000)–(56.000000,12.000000)–cycle; at (52.000000,13.155000)Layer 2 Cache; (48.000000,14.000000)–(48.000000,18.000000)–(56.000000,18.000000)–(56.000000,14.000000)–cycle; (48.000000,14.000000)–(48.000000,18.000000)–(56.000000,18.000000)–(56.000000,14.000000)–cycle; at (52.000000,16.155000)Core 10; (48.000000,18.000000)–(48.000000,20.000000)–(56.000000,20.000000)–(56.000000,18.000000)–cycle; (48.000000,18.000000)–(48.000000,20.000000)–(56.000000,20.000000)–(56.000000,18.000000)–cycle; at (52.000000,19.155000)Layer 2 Cache; (48.000000,20.000000)–(48.000000,24.000000)–(56.000000,24.000000)–(56.000000,20.000000)–cycle; (48.000000,20.000000)–(48.000000,24.000000)–(56.000000,24.000000)–(56.000000,20.000000)–cycle; at (52.000000,22.155000)Core 9; (8.000000,5.000000)–(8.000000,11.000000)–(10.000000,11.000000)–(10.000000,5.000000)–cycle; (8.000000,5.000000)–(8.000000,11.000000)–(10.000000,11.000000)–(10.000000,5.000000)–cycle; at (9.000000,8.155000)HT; (8.000000,11.000000)–(8.000000,17.000000)–(10.000000,17.000000)–(10.000000,11.000000)–cycle; (8.000000,11.000000)–(8.000000,17.000000)–(10.000000,17.000000)–(10.000000,11.000000)–cycle; at (9.000000,14.155000)HT; (31.000000,5.000000)–(31.000000,11.000000)–(33.000000,11.000000)–(33.000000,5.000000)–cycle; (31.000000,5.000000)–(31.000000,11.000000)–(33.000000,11.000000)–(33.000000,5.000000)–cycle; at (32.000000,8.155000)HT; (33.000000,5.000000)–(33.000000,11.000000)–(35.000000,11.000000)–(35.000000,5.000000)–cycle; (33.000000,5.000000)–(33.000000,11.000000)–(35.000000,11.000000)–(35.000000,5.000000)–cycle; at (34.000000,8.155000)HT; (31.000000,11.000000)–(31.000000,17.000000)–(33.000000,17.000000)–(33.000000,11.000000)–cycle; (31.000000,11.000000)–(31.000000,17.000000)–(33.000000,17.000000)–(33.000000,11.000000)–cycle; at (32.000000,14.155000)HT; (33.000000,11.000000)–(33.000000,17.000000)–(35.000000,17.000000)–(35.000000,11.000000)–cycle; (33.000000,11.000000)–(33.000000,17.000000)–(35.000000,17.000000)–(35.000000,11.000000)–cycle; at (34.000000,14.155000)HT; (56.000000,5.000000)–(56.000000,11.000000)–(58.000000,11.000000)–(58.000000,5.000000)–cycle; (56.000000,5.000000)–(56.000000,11.000000)–(58.000000,11.000000)–(58.000000,5.000000)–cycle; at (57.000000,8.155000)HT; (56.000000,11.000000)–(56.000000,17.000000)–(58.000000,17.000000)–(58.000000,11.000000)–cycle; (56.000000,11.000000)–(56.000000,17.000000)–(58.000000,17.000000)–(58.000000,11.000000)–cycle; at (57.000000,14.155000)HT;

[img:mc]

(20.000000,10.000000)–(20.000000,15.000000)–(25.000000,15.000000)–(25.000000,10.000000)–cycle; (20.000000,10.000000)–(20.000000,15.000000)–(25.000000,15.000000)–(25.000000,10.000000)–cycle; at (22.500000,12.319444)AMD; at (22.500000,13.025000)Opteron; (31.000000,10.000000)–(31.000000,15.000000)–(36.000000,15.000000)–(36.000000,10.000000)–cycle; (31.000000,10.000000)–(31.000000,15.000000)–(36.000000,15.000000)–(36.000000,10.000000)–cycle; at (33.500000,12.319444)AMD; at (33.500000,13.025000)Opteron; (20.000000,21.000000)–(20.000000,26.000000)–(25.000000,26.000000)–(25.000000,21.000000)–cycle; (20.000000,21.000000)–(20.000000,26.000000)–(25.000000,26.000000)–(25.000000,21.000000)–cycle; at (22.500000,23.319444)AMD; at (22.500000,24.025000)Opteron; (31.000000,21.000000)–(31.000000,26.000000)–(36.000000,26.000000)–(36.000000,21.000000)–cycle; (31.000000,21.000000)–(31.000000,26.000000)–(36.000000,26.000000)–(36.000000,21.000000)–cycle; at (33.500000,23.319444)AMD; at (33.500000,24.025000)Opteron; (13.000000,9.000000)–(13.000000,16.000000)–(16.000000,16.000000)–(16.000000,9.000000)–cycle; (13.000000,9.000000)–(13.000000,16.000000)–(16.000000,16.000000)–(16.000000,9.000000)–cycle; at (14.500000,12.319444)DDR3; at (14.500000,13.025000)RAM; (13.000000,20.000000)–(13.000000,27.000000)–(16.000000,27.000000)–(16.000000,20.000000)–cycle; (13.000000,20.000000)–(13.000000,27.000000)–(16.000000,27.000000)–(16.000000,20.000000)–cycle; at (14.500000,23.319444)DDR3; at (14.500000,24.025000)RAM; (40.000000,9.000000)–(40.000000,16.000000)–(43.000000,16.000000)–(43.000000,9.000000)–cycle; (40.000000,9.000000)–(40.000000,16.000000)–(43.000000,16.000000)–(43.000000,9.000000)–cycle; at (41.500000,12.319444)DDR3; at (41.500000,13.025000)RAM; (40.000000,20.000000)–(40.000000,27.000000)–(43.000000,27.000000)–(43.000000,20.000000)–cycle; (40.000000,20.000000)–(40.000000,27.000000)–(43.000000,27.000000)–(43.000000,20.000000)–cycle; at (41.500000,23.319444)DDR3; at (41.500000,24.025000)RAM; (19.000000,28.891700)–(19.000000,32.108367)–(26.000000,32.108367)–(26.000000,28.891700)–cycle; (19.000000,28.891700)–(19.000000,32.108367)–(26.000000,32.108367)–(26.000000,28.891700)–cycle; at (22.500000,30.319478)I/O; at (22.500000,31.025033)virtualization; (19.000000,35.000000)–(19.000000,38.000000)–(26.000000,38.000000)–(26.000000,35.000000)–cycle; (19.000000,35.000000)–(19.000000,38.000000)–(26.000000,38.000000)–(26.000000,35.000000)–cycle; at (22.500000,36.672222)South Bridge; (30.000000,29.000000)–(30.000000,32.000000)–(37.000000,32.000000)–(37.000000,29.000000)–cycle; (30.000000,29.000000)–(30.000000,32.000000)–(37.000000,32.000000)–(37.000000,29.000000)–cycle; at (33.500000,30.319444)I/O; at (33.500000,31.025000)virtualization;

[img:p4]

Moderne Mehrkernprozessoren, wie in diesem Fall ein AMD Opteron der 6100er Reihe (Begründung folgt in Sektion [sec:env]), nutzen eine stark ausgeprägte Speicherhierachie. Wie in Abbildung [img:mc] zu sehen, gibt es einen $12MiB$ großen Layer 3 Cache für alle Kerne des Prozessors, der die vergleichsweise langsamen Zugriffe über den Hyper Transport reduzieren soll.

Jeder Kern hat einen $64KiB$ Layer 1 und einen $512KiB$ Layer 2 Cache, welche die Zugriffszeiten weiter reduzieren sollen.

Bei diesen Caches wird für Kohärenz gesorgt, damit sind diese Caches transparent für den Programmierer. @int_mc Das hat aber außerdem zur Folge, dass bei Schreibzugriffen das entsprechende Datum aus den Caches der anderen Kerne entfernt wird und die Wartezeit beim nächsten Zugriff deutlich vergrößert.

Um größere Parallelität im wirtschaftlichen Rahmen zu erreichen, werden mehrere dieser Prozessoren auf Multisockelboards kombiniert. In diesem Fall erfolgt das mit der Direct Connect Architecture 2 und vier Prozessoren.

Wie in Abbildung [img:p4] zu sehen, ist jeder Prozessor über vier HyperThreading 3 8bit Verbindungen, also insgesamt $25,6GiB/s$, mit seinen DDR-RAM-Modulen verbunden. @int_mc Die Prozessoren verfügen untereinander und mit I/O-Geräten über jeweils eine nichtkohärente $16bit$ HT 3 Verbindung.

Diese Eigenschaft hat zur Folge, dass die Datenrate, mit der auf ein Datum zugegriffen werden kann, davon abhängt, welcher Prozessor zugreift. Wenn es im RAM des jeweiligen Prozessors liegt, beträgt die Datenrate maximal $25 GiB/s$ und wenn das Datum im RAM eines anderen Prozessors liegt, maximal $12,8 GiB/s$. Außerdem muss gegebenenfalls per Software dafür gesorgt werden, dass die Daten aktuell sind, da eben nicht für Kohärenz zwischen Prozessoren gesorgt ist.

### Aufbau einer Manycorearchitektur

[sec:bas:many]

(7.000000,1.000000)–(7.000000,4.000000)–(13.000000,4.000000)–(13.000000,1.000000)–cycle; (7.000000,1.000000)–(7.000000,4.000000)–(13.000000,4.000000)–(13.000000,1.000000)–cycle; at (10.000000,2.695000)Host; (7.000000,8.000000)–(7.000000,36.000000)–(13.000000,36.000000)–(13.000000,8.000000)–cycle; (7.000000,8.000000)–(7.000000,36.000000)–(13.000000,36.000000)–(13.000000,8.000000)–cycle; at (10.000000,21.795000)Host; at (10.000000,22.595000)Memory; (18.000000,1.000000)–(18.000000,3.000000)–(47.000000,3.000000)–(47.000000,1.000000)–cycle; (18.000000,1.000000)–(18.000000,3.000000)–(47.000000,3.000000)–(47.000000,1.000000)–cycle; at (32.500000,2.195000)Execution Queue; (17.000000,32.000000)–(17.000000,36.000000)–(48.000000,36.000000)–(48.000000,32.000000)–cycle; (17.000000,32.000000)–(17.000000,36.000000)–(48.000000,36.000000)–(48.000000,32.000000)–cycle; at (32.500000,33.795000)Device; at (32.500000,34.595000)Memory; at (14.000000,33.000000)DMA; at (14.000000,1.000000)Control; (19.000000,8.000000)–(19.000000,9.000000)–(23.000000,9.000000)–(23.000000,8.000000)–cycle; (19.000000,8.000000)–(19.000000,9.000000)–(23.000000,9.000000)–(23.000000,8.000000)–cycle; (19.000000,9.000000)–(19.000000,10.000000)–(23.000000,10.000000)–(23.000000,9.000000)–cycle; (19.000000,9.000000)–(19.000000,10.000000)–(23.000000,10.000000)–(23.000000,9.000000)–cycle; (19.000000,10.000000)–(19.000000,11.000000)–(23.000000,11.000000)–(23.000000,10.000000)–cycle; (19.000000,10.000000)–(19.000000,11.000000)–(23.000000,11.000000)–(23.000000,10.000000)–cycle; (19.000000,11.000000)–(19.000000,12.000000)–(23.000000,12.000000)–(23.000000,11.000000)–cycle; (19.000000,11.000000)–(19.000000,12.000000)–(23.000000,12.000000)–(23.000000,11.000000)–cycle; (19.000000,12.000000)–(19.000000,13.000000)–(23.000000,13.000000)–(23.000000,12.000000)–cycle; (19.000000,12.000000)–(19.000000,13.000000)–(23.000000,13.000000)–(23.000000,12.000000)–cycle; (19.000000,13.000000)–(19.000000,14.000000)–(23.000000,14.000000)–(23.000000,13.000000)–cycle; (19.000000,13.000000)–(19.000000,14.000000)–(23.000000,14.000000)–(23.000000,13.000000)–cycle; (19.000000,14.000000)–(19.000000,15.000000)–(23.000000,15.000000)–(23.000000,14.000000)–cycle; (19.000000,14.000000)–(19.000000,15.000000)–(23.000000,15.000000)–(23.000000,14.000000)–cycle; (19.000000,15.000000)–(19.000000,16.000000)–(23.000000,16.000000)–(23.000000,15.000000)–cycle; (19.000000,15.000000)–(19.000000,16.000000)–(23.000000,16.000000)–(23.000000,15.000000)–cycle; (19.000000,24.000000)–(19.000000,26.000000)–(23.000000,26.000000)–(23.000000,24.000000)–cycle; (19.000000,24.000000)–(19.000000,26.000000)–(23.000000,26.000000)–(23.000000,24.000000)–cycle; at (21.000000,25.195000)SFU; (18.000000,28.000000)–(18.000000,31.000000)–(24.000000,31.000000)–(24.000000,28.000000)–cycle; (18.000000,28.000000)–(18.000000,31.000000)–(24.000000,31.000000)–(24.000000,28.000000)–cycle; at (21.000000,29.295000)Hardware; at (21.000000,30.095000)Cache; (25.000000,8.000000)–(25.000000,9.000000)–(29.000000,9.000000)–(29.000000,8.000000)–cycle; (25.000000,8.000000)–(25.000000,9.000000)–(29.000000,9.000000)–(29.000000,8.000000)–cycle; (25.000000,9.000000)–(25.000000,10.000000)–(29.000000,10.000000)–(29.000000,9.000000)–cycle; (25.000000,9.000000)–(25.000000,10.000000)–(29.000000,10.000000)–(29.000000,9.000000)–cycle; (25.000000,10.000000)–(25.000000,11.000000)–(29.000000,11.000000)–(29.000000,10.000000)–cycle; (25.000000,10.000000)–(25.000000,11.000000)–(29.000000,11.000000)–(29.000000,10.000000)–cycle; (25.000000,11.000000)–(25.000000,12.000000)–(29.000000,12.000000)–(29.000000,11.000000)–cycle; (25.000000,11.000000)–(25.000000,12.000000)–(29.000000,12.000000)–(29.000000,11.000000)–cycle; (25.000000,12.000000)–(25.000000,13.000000)–(29.000000,13.000000)–(29.000000,12.000000)–cycle; (25.000000,12.000000)–(25.000000,13.000000)–(29.000000,13.000000)–(29.000000,12.000000)–cycle; (25.000000,13.000000)–(25.000000,14.000000)–(29.000000,14.000000)–(29.000000,13.000000)–cycle; (25.000000,13.000000)–(25.000000,14.000000)–(29.000000,14.000000)–(29.000000,13.000000)–cycle; (25.000000,14.000000)–(25.000000,15.000000)–(29.000000,15.000000)–(29.000000,14.000000)–cycle; (25.000000,14.000000)–(25.000000,15.000000)–(29.000000,15.000000)–(29.000000,14.000000)–cycle; (25.000000,15.000000)–(25.000000,16.000000)–(29.000000,16.000000)–(29.000000,15.000000)–cycle; (25.000000,15.000000)–(25.000000,16.000000)–(29.000000,16.000000)–(29.000000,15.000000)–cycle; (25.000000,24.000000)–(25.000000,26.000000)–(29.000000,26.000000)–(29.000000,24.000000)–cycle; (25.000000,24.000000)–(25.000000,26.000000)–(29.000000,26.000000)–(29.000000,24.000000)–cycle; at (27.000000,25.195000)SFU; (24.000000,28.000000)–(24.000000,31.000000)–(30.000000,31.000000)–(30.000000,28.000000)–cycle; (24.000000,28.000000)–(24.000000,31.000000)–(30.000000,31.000000)–(30.000000,28.000000)–cycle; at (27.000000,29.295000)Software; at (27.000000,30.095000)Cache; at (23.450000,8.950000)0; (25.000000,16.000000)–(25.000000,17.000000)–(29.000000,17.000000)–(29.000000,16.000000)–cycle; (25.000000,16.000000)–(25.000000,17.000000)–(29.000000,17.000000)–(29.000000,16.000000)–cycle; (25.000000,17.000000)–(25.000000,18.000000)–(29.000000,18.000000)–(29.000000,17.000000)–cycle; (25.000000,17.000000)–(25.000000,18.000000)–(29.000000,18.000000)–(29.000000,17.000000)–cycle; (25.000000,18.000000)–(25.000000,19.000000)–(29.000000,19.000000)–(29.000000,18.000000)–cycle; (25.000000,18.000000)–(25.000000,19.000000)–(29.000000,19.000000)–(29.000000,18.000000)–cycle; (25.000000,19.000000)–(25.000000,20.000000)–(29.000000,20.000000)–(29.000000,19.000000)–cycle; (25.000000,19.000000)–(25.000000,20.000000)–(29.000000,20.000000)–(29.000000,19.000000)–cycle; (25.000000,20.000000)–(25.000000,21.000000)–(29.000000,21.000000)–(29.000000,20.000000)–cycle; (25.000000,20.000000)–(25.000000,21.000000)–(29.000000,21.000000)–(29.000000,20.000000)–cycle; (25.000000,21.000000)–(25.000000,22.000000)–(29.000000,22.000000)–(29.000000,21.000000)–cycle; (25.000000,21.000000)–(25.000000,22.000000)–(29.000000,22.000000)–(29.000000,21.000000)–cycle; (25.000000,22.000000)–(25.000000,23.000000)–(29.000000,23.000000)–(29.000000,22.000000)–cycle; (25.000000,22.000000)–(25.000000,23.000000)–(29.000000,23.000000)–(29.000000,22.000000)–cycle; (25.000000,23.000000)–(25.000000,24.000000)–(29.000000,24.000000)–(29.000000,23.000000)–cycle; (25.000000,23.000000)–(25.000000,24.000000)–(29.000000,24.000000)–(29.000000,23.000000)–cycle; (19.000000,16.000000)–(19.000000,17.000000)–(23.000000,17.000000)–(23.000000,16.000000)–cycle; (19.000000,16.000000)–(19.000000,17.000000)–(23.000000,17.000000)–(23.000000,16.000000)–cycle; (19.000000,17.000000)–(19.000000,18.000000)–(23.000000,18.000000)–(23.000000,17.000000)–cycle; (19.000000,17.000000)–(19.000000,18.000000)–(23.000000,18.000000)–(23.000000,17.000000)–cycle; (19.000000,18.000000)–(19.000000,19.000000)–(23.000000,19.000000)–(23.000000,18.000000)–cycle; (19.000000,18.000000)–(19.000000,19.000000)–(23.000000,19.000000)–(23.000000,18.000000)–cycle; (19.000000,19.000000)–(19.000000,20.000000)–(23.000000,20.000000)–(23.000000,19.000000)–cycle; (19.000000,19.000000)–(19.000000,20.000000)–(23.000000,20.000000)–(23.000000,19.000000)–cycle; (19.000000,20.000000)–(19.000000,21.000000)–(23.000000,21.000000)–(23.000000,20.000000)–cycle; (19.000000,20.000000)–(19.000000,21.000000)–(23.000000,21.000000)–(23.000000,20.000000)–cycle; (19.000000,21.000000)–(19.000000,22.000000)–(23.000000,22.000000)–(23.000000,21.000000)–cycle; (19.000000,21.000000)–(19.000000,22.000000)–(23.000000,22.000000)–(23.000000,21.000000)–cycle; (19.000000,22.000000)–(19.000000,23.000000)–(23.000000,23.000000)–(23.000000,22.000000)–cycle; (19.000000,22.000000)–(19.000000,23.000000)–(23.000000,23.000000)–(23.000000,22.000000)–cycle; (19.000000,23.000000)–(19.000000,24.000000)–(23.000000,24.000000)–(23.000000,23.000000)–cycle; (19.000000,23.000000)–(19.000000,24.000000)–(23.000000,24.000000)–(23.000000,23.000000)–cycle; (36.000000,8.000000)–(36.000000,9.000000)–(40.000000,9.000000)–(40.000000,8.000000)–cycle; (36.000000,8.000000)–(36.000000,9.000000)–(40.000000,9.000000)–(40.000000,8.000000)–cycle; (36.000000,9.000000)–(36.000000,10.000000)–(40.000000,10.000000)–(40.000000,9.000000)–cycle; (36.000000,9.000000)–(36.000000,10.000000)–(40.000000,10.000000)–(40.000000,9.000000)–cycle; (36.000000,10.000000)–(36.000000,11.000000)–(40.000000,11.000000)–(40.000000,10.000000)–cycle; (36.000000,10.000000)–(36.000000,11.000000)–(40.000000,11.000000)–(40.000000,10.000000)–cycle; (36.000000,11.000000)–(36.000000,12.000000)–(40.000000,12.000000)–(40.000000,11.000000)–cycle; (36.000000,11.000000)–(36.000000,12.000000)–(40.000000,12.000000)–(40.000000,11.000000)–cycle; (36.000000,12.000000)–(36.000000,13.000000)–(40.000000,13.000000)–(40.000000,12.000000)–cycle; (36.000000,12.000000)–(36.000000,13.000000)–(40.000000,13.000000)–(40.000000,12.000000)–cycle; (36.000000,13.000000)–(36.000000,14.000000)–(40.000000,14.000000)–(40.000000,13.000000)–cycle; (36.000000,13.000000)–(36.000000,14.000000)–(40.000000,14.000000)–(40.000000,13.000000)–cycle; (36.000000,14.000000)–(36.000000,15.000000)–(40.000000,15.000000)–(40.000000,14.000000)–cycle; (36.000000,14.000000)–(36.000000,15.000000)–(40.000000,15.000000)–(40.000000,14.000000)–cycle; (36.000000,15.000000)–(36.000000,16.000000)–(40.000000,16.000000)–(40.000000,15.000000)–cycle; (36.000000,15.000000)–(36.000000,16.000000)–(40.000000,16.000000)–(40.000000,15.000000)–cycle; (36.000000,24.000000)–(36.000000,26.000000)–(40.000000,26.000000)–(40.000000,24.000000)–cycle; (36.000000,24.000000)–(36.000000,26.000000)–(40.000000,26.000000)–(40.000000,24.000000)–cycle; at (38.000000,25.195000)SFU; (35.000000,28.000000)–(35.000000,31.000000)–(41.000000,31.000000)–(41.000000,28.000000)–cycle; (35.000000,28.000000)–(35.000000,31.000000)–(41.000000,31.000000)–(41.000000,28.000000)–cycle; at (38.000000,29.295000)Hardware; at (38.000000,30.095000)Cache; (42.000000,8.000000)–(42.000000,9.000000)–(46.000000,9.000000)–(46.000000,8.000000)–cycle; (42.000000,8.000000)–(42.000000,9.000000)–(46.000000,9.000000)–(46.000000,8.000000)–cycle; (42.000000,9.000000)–(42.000000,10.000000)–(46.000000,10.000000)–(46.000000,9.000000)–cycle; (42.000000,9.000000)–(42.000000,10.000000)–(46.000000,10.000000)–(46.000000,9.000000)–cycle; (42.000000,10.000000)–(42.000000,11.000000)–(46.000000,11.000000)–(46.000000,10.000000)–cycle; (42.000000,10.000000)–(42.000000,11.000000)–(46.000000,11.000000)–(46.000000,10.000000)–cycle; (42.000000,11.000000)–(42.000000,12.000000)–(46.000000,12.000000)–(46.000000,11.000000)–cycle; (42.000000,11.000000)–(42.000000,12.000000)–(46.000000,12.000000)–(46.000000,11.000000)–cycle; (42.000000,12.000000)–(42.000000,13.000000)–(46.000000,13.000000)–(46.000000,12.000000)–cycle; (42.000000,12.000000)–(42.000000,13.000000)–(46.000000,13.000000)–(46.000000,12.000000)–cycle; (42.000000,13.000000)–(42.000000,14.000000)–(46.000000,14.000000)–(46.000000,13.000000)–cycle; (42.000000,13.000000)–(42.000000,14.000000)–(46.000000,14.000000)–(46.000000,13.000000)–cycle; (42.000000,14.000000)–(42.000000,15.000000)–(46.000000,15.000000)–(46.000000,14.000000)–cycle; (42.000000,14.000000)–(42.000000,15.000000)–(46.000000,15.000000)–(46.000000,14.000000)–cycle; (42.000000,15.000000)–(42.000000,16.000000)–(46.000000,16.000000)–(46.000000,15.000000)–cycle; (42.000000,15.000000)–(42.000000,16.000000)–(46.000000,16.000000)–(46.000000,15.000000)–cycle; (42.000000,24.000000)–(42.000000,26.000000)–(46.000000,26.000000)–(46.000000,24.000000)–cycle; (42.000000,24.000000)–(42.000000,26.000000)–(46.000000,26.000000)–(46.000000,24.000000)–cycle; at (44.000000,25.195000)SFU; (41.000000,28.000000)–(41.000000,31.000000)–(47.000000,31.000000)–(47.000000,28.000000)–cycle; (41.000000,28.000000)–(41.000000,31.000000)–(47.000000,31.000000)–(47.000000,28.000000)–cycle; at (44.000000,29.295000)Software; at (44.000000,30.095000)Cache; at (40.000000,9.000000)15; (42.000000,16.000000)–(42.000000,17.000000)–(46.000000,17.000000)–(46.000000,16.000000)–cycle; (42.000000,16.000000)–(42.000000,17.000000)–(46.000000,17.000000)–(46.000000,16.000000)–cycle; (42.000000,17.000000)–(42.000000,18.000000)–(46.000000,18.000000)–(46.000000,17.000000)–cycle; (42.000000,17.000000)–(42.000000,18.000000)–(46.000000,18.000000)–(46.000000,17.000000)–cycle; (42.000000,18.000000)–(42.000000,19.000000)–(46.000000,19.000000)–(46.000000,18.000000)–cycle; (42.000000,18.000000)–(42.000000,19.000000)–(46.000000,19.000000)–(46.000000,18.000000)–cycle; (42.000000,19.000000)–(42.000000,20.000000)–(46.000000,20.000000)–(46.000000,19.000000)–cycle; (42.000000,19.000000)–(42.000000,20.000000)–(46.000000,20.000000)–(46.000000,19.000000)–cycle; (42.000000,20.000000)–(42.000000,21.000000)–(46.000000,21.000000)–(46.000000,20.000000)–cycle; (42.000000,20.000000)–(42.000000,21.000000)–(46.000000,21.000000)–(46.000000,20.000000)–cycle; (42.000000,21.000000)–(42.000000,22.000000)–(46.000000,22.000000)–(46.000000,21.000000)–cycle; (42.000000,21.000000)–(42.000000,22.000000)–(46.000000,22.000000)–(46.000000,21.000000)–cycle; (42.000000,22.000000)–(42.000000,23.000000)–(46.000000,23.000000)–(46.000000,22.000000)–cycle; (42.000000,22.000000)–(42.000000,23.000000)–(46.000000,23.000000)–(46.000000,22.000000)–cycle; (42.000000,23.000000)–(42.000000,24.000000)–(46.000000,24.000000)–(46.000000,23.000000)–cycle; (42.000000,23.000000)–(42.000000,24.000000)–(46.000000,24.000000)–(46.000000,23.000000)–cycle; (36.000000,16.000000)–(36.000000,17.000000)–(40.000000,17.000000)–(40.000000,16.000000)–cycle; (36.000000,16.000000)–(36.000000,17.000000)–(40.000000,17.000000)–(40.000000,16.000000)–cycle; (36.000000,17.000000)–(36.000000,18.000000)–(40.000000,18.000000)–(40.000000,17.000000)–cycle; (36.000000,17.000000)–(36.000000,18.000000)–(40.000000,18.000000)–(40.000000,17.000000)–cycle; (36.000000,18.000000)–(36.000000,19.000000)–(40.000000,19.000000)–(40.000000,18.000000)–cycle; (36.000000,18.000000)–(36.000000,19.000000)–(40.000000,19.000000)–(40.000000,18.000000)–cycle; (36.000000,19.000000)–(36.000000,20.000000)–(40.000000,20.000000)–(40.000000,19.000000)–cycle; (36.000000,19.000000)–(36.000000,20.000000)–(40.000000,20.000000)–(40.000000,19.000000)–cycle; (36.000000,20.000000)–(36.000000,21.000000)–(40.000000,21.000000)–(40.000000,20.000000)–cycle; (36.000000,20.000000)–(36.000000,21.000000)–(40.000000,21.000000)–(40.000000,20.000000)–cycle; (36.000000,21.000000)–(36.000000,22.000000)–(40.000000,22.000000)–(40.000000,21.000000)–cycle; (36.000000,21.000000)–(36.000000,22.000000)–(40.000000,22.000000)–(40.000000,21.000000)–cycle; (36.000000,22.000000)–(36.000000,23.000000)–(40.000000,23.000000)–(40.000000,22.000000)–cycle; (36.000000,22.000000)–(36.000000,23.000000)–(40.000000,23.000000)–(40.000000,22.000000)–cycle; (36.000000,23.000000)–(36.000000,24.000000)–(40.000000,24.000000)–(40.000000,23.000000)–cycle; (36.000000,23.000000)–(36.000000,24.000000)–(40.000000,24.000000)–(40.000000,23.000000)–cycle; at (32.000000,9.000000). . .; (19.000000,5.000000)–(19.000000,6.900000)–(29.000000,6.900000)–(29.000000,5.000000)–cycle; (19.000000,5.000000)–(19.000000,6.900000)–(29.000000,6.900000)–(29.000000,5.000000)–cycle; at (24.000000,6.145000)Dual Warp Issue; (36.000000,5.000000)–(36.000000,6.900000)–(46.000000,6.900000)–(46.000000,5.000000)–cycle; (36.000000,5.000000)–(36.000000,6.900000)–(46.000000,6.900000)–(46.000000,5.000000)–cycle; at (41.000000,6.145000)Dual Warp Issue; (17.500000,4.500000)–(17.500000,31.500000)–(30.500000,31.500000)–(30.500000,4.500000)–cycle; (34.500000,4.500000)–(34.500000,31.500000)–(47.500000,31.500000)–(47.500000,4.500000)–cycle;

[img:fermi]

Probleme in der Bildbearbeitung lassen sich meist ausgezeichnet parallelisieren. Die dafür optimierten hochparallelen Grafikkarten, haben sich dahingehend entwickelt, dass sie sich freier programmieren, und damit auch für viele andere gut parallelisierbaren Aufgaben nutzen lassen.

Das hier vorgestellte Hardwaredesign gehört zur Fermi-GPU und wird beispielsweise in der später verwendeten NVidia M2050-Karte eingesetzt.

Wie in Abbildung [img:fermi] zu sehen, ist die Grafikkarte über PCIe via *Direct Memory Access* für den Datenaustausch und die Kontrolle der *Execution Queue* verbunden.

Die Multiprozessoren, die in der Zeichnung gepunktet umrandet sind, werden auch *Streaming Multiprocessor* genannt. Sie bestehen aus 32 *Streaming Processors*, die zu je 16 gruppiert sind. Erfordert die Berechnung Fließkommazahlen in doppelter Genauigkeit, so werden die beiden Gruppen kombiniert und der Multiprozessor arbeitet mit 16 Kernen. @pgi_cuda

Diese Streaming Processors teilen sich einen sehr schnellen, $64 KiB$ großen lokalen Speicher. Dieser kann je nach Anforderung als $16 KiB$ großer gemeinsamer Speicher und $48 KiB$ großer Level 1 Cache oder umgekehrt als $48 KiB$ großer gemeinsamer Speicher und $16 KiB$ großer Level 1 Cache konfiguiert werden. @pgi_cuda Außerdem ist ein $12 KiB$ großer Layer 1 Textur-Cache integriert.

Der $3 GiB$ große globale GDDR5-RAM kann über einen $768 KiB$ großen Layer 2 Cache angesprochen werden. Dieser Cache existiert einmal pro SM und dient den Lese- und Schreibzugriffen auf gewöhnlichen globalen Speicher, sowie dem Zugriff auf die nur lesbaren Texturspeicher. @fermi [, 16]

Der globale Gerätespeicher ist in $128 B$ Segmente gerastert. Eine Zeile der Caches ist genau diese $128 B$ lang und wird einem solchen Segment im Gerätespeicher zugeordnet. @cuda_man [, 163] Machen beispielsweise 32 Threads eines SM einen Lesezugriff auf jeweils einen $32 bit$ Integer des gleichen Segments, so ist selbst bei einem Cache-Miss nur eine Speichertransaktion nötig, um die Daten verfügbar zu haben. Liegen die Daten jedoch in verschiedenen Segmenten, so sind mehrere Tranaktionen erforderlich.

Die Texturspeicher haben weitere Besonderheiten. Sie sind darauf optimiert, fortlaufende Speicherzugriffe mit konstanter Latenz zu ermöglichen. Die Berechnungen zur Addressierung werden von dedizierten Einheiten erledigt. Die Hardware muss nicht für Kohärenz in den Caches sorgen. @cuda_man [, 93]

Ein weiterer wichtiger Bestandteil eines SM ist der *Dual Warp Issue*. Das ist ein sehr effizienter in Hardware implementierter Thread-Scheduler, der zum Einen die Arbeit auf die SPs verteilt und zum anderen z.B. auf Daten wartende Threads schlafen legt und stattdessen andere verfügbare Threads weiter rechnen lässt. @mat_gpu [, 25]

Ein Streaming Processor hat 1024, 32bit Register, die abhängig von den Anforderung des Kernels verteilt werden. Kommt ein Kernel mit weniger Registern aus, können mehr Threads auf einem SP synchron verarbeitet werden. @mat_gpu [, 26]

Die Threads eines SMs werden in *lockstep* ausgeführt. @cuda [, 106] Ein Streaming Multiprocessor hat also eine gewisse Ähnlichkeit mit einer SIMD-Einheit. Der Unterschied liegt darin, dass die Abläufe der Streaming Processor des gleichen Streaming Multiprocessors sich z.B. an Verzweigungen unterscheiden können.

### Grundlagen des OpenMP-API

[sec:bas:omp]

OpenMP ist eine Erweiterung für die Programmiersprachen C, C++ und Fortran. Dabei wird über Pragmas im Quelltext dem Kompiler mitgeteilt, wie der Programmteil zu parallelisieren ist. In dieser Arbeit wird OpenMP in der Version 2.5 verwendet.

Mit dem OpenMP-API können ausschließlich Programme für SMP-Systeme mit gemeinsamen Speicher erstellt werden.

Programmiert wird OpenMP, in dem beispielsweise über Pragmas der Beginn und das Ende einer parallelen Region gekennzeichnet werden, die dann nach dem Fork-Join-Modell abgearbeitet werden sollen. Konkret werden diese einzelnen Programmpfade als Threads aus einem Threadpool ausgeführt. Wie viele Forks dabei erstellt werden, kann der Programmierer direkt beeinflussen, oder zur Laufzeit z.B. anhand der Anzahl der Kerne des Prozessors entscheiden lassen. Das Scheduling erfolgt anders als bei der Fermi-GPU aus Sektion [sec:bas:many] nicht durch die Hardware, sondern wird vom Betriebssystem übernommen.

Beim Parallelisieren mit Pragmas werden private und gemeinsame Variablen als solche markiert, oder aber diverse Arten von Synchronisation umgesetzt. Mit weiteren Pragmas können Schleifen mit datenparallelen Berechnungen als parallele Region markiert werden. Dabei werden mehrere Schleifeniterationen auf Threads abgebildet. Es wird also im Normalfall nicht pro Iteration ein Thread angelegt.

### Compute Unified Device Architecture

[sec:bas:cuda]

Hinter der Marke CUDA verbirgt sich zum Einen die CUDA-Architektur samt Treiber und Laufzeitumgebung, die mit aktuellen nVidia-Grafikkarten genutzt werden können. Zum Anderen gibt es das CUDA-API, das nicht nur in konventionellen Grafikanwendungen, sondern auch in GPGPU-basierten Systemen eingesetzt werden kann. @cuda [, ix]

Mit diesem API ist es möglich, in CUDA-C programmierte Kernel auf den ALUs auszuführen und auf dem Speicher der Grafikkarte zu arbeiten. @cuda [, 7]

In der CUDA-Architektur gibt es drei verschiende Sichten auf das System.

Eine stellt die Gruppierung der Daten bzw. der Arbeit da. Dabei wird die Arbeit in einem *Grid* in *Blocks* aufgeteilt, die je nach Anforderung ein, zwei oder dreidimensional sein können.

Die nächste Sicht beinhaltet die logische Verarbeitung. Darin werden die Daten-Blöcke von mehreren *Threads* verarbeitet, die zu je 32 Threads, in den so genannten *Warps*, verwaltet werden. Der Zugriff auf gemeinsamen lokalen Speicher eines Warps kann durch Barrier, sowie durch vordefinierte atomare Operationen synchronisiert werden. @cuda [, 75,79,182] Die Warps aus der Execution Queue werden dann nach und nach auf die SMs verteilt und dort ausgeführt. Daher kommt es, dass die Threads des gleichen Warps, gemeinsamen lokalen Speicher haben, bei denen Lesezugriffe auf Konstanten-Speicher mit Broadcasts und Caching effizent realisiert werden können. @cuda [, 107]

Die Hardwaresicht der CUDA-Architektur wurde im Wesentlichen schon in Sektion [sec:bas:many] vorgestellt. Genauer gesagt implementiert die Fermi-GPU CUDA. Andere, wie z.B. die G80 oder die GT200 unterscheiden sich hauptsächlich in der Zahl, Art und Größe der SMs, der Caches und Register.

Aus den eben vorgestellten Gegebenheiten folgen einige Aspekte, die beim Progammieren und Optimieren beachtet werden sollten.

Nicht alle Threads laufen Synchron. Durch diese Stückelung der Arbeit liefern manche Algorithmen, die *in place* arbeiten, nicht ohne weitere Synchronisierung das korrekte Ergebnis. @scan_cuda [, 7]

Eine weitere Möglichkeit von CUDA ist, die GPU taskparallel mittels *Streams* zu programmieren. So kann das Problem gestückelt werden und die Berechnungen, parallel zum Datentransfer von Host-RAM zu dediziertem RAM der Grafikkarte, begonnen werden. @cuda [, 185]

### OpenCL Framework

[sec:bas:ocl]

OpenCL ist ein Framework das zum Programmieren von heterogenen parallelen Systemen geeignet ist. @opencl [, K. 2.1] Wie bei CUDA ist für OpenCL eine Laufzeitumgebung nötig. Die Hardware muss OpenCL unterstützen und als Programmiersprache der Kernel dient eine eigene C-Variante. Im Gegensatz zu CUDA unterstützt eine breitete Allianz von Unternehmen die *Open Computing Language*. Außerdem sind nicht nur Grafikkarten OpenCL-fähig, sondern auch einige DSPs und SMP-Systeme, wie z.B. Cell-Prozessoren oder moderne x86-Architekturen.

Das API bietet SIMD-Operationen, Möglichkeiten zur daten- und taskparallelen Programmierung, sowie Funktionen zum Zugriff auf den Gerätespeicher. Der Code wird erst in der Laufzeitumgebung kompiliert. @opencl [, K. 3.2]

Die Arbeitspakete werden in OpenCL nach den Vorgaben des Programmierers in Arbeisgruppen eingeteilt. Mehrere Arbeisgruppen werden dann auf einen *Streaming Multiprocessor*, und dessen Arbeitspakete jeweils auf einen *Scalar Processor* abgebildet.

Die Speicherhierachie ist ebenfalls vergleichbar mit der von CUDA. Es gibt globalen Speicher, nur lesbaren Speicher für effizienten Zugriff, lokalen Speicher für die einzelnen Work-Groups sowie privaten Speicher der einzelnen Threads. Die konkreten Eigenschaften bezüglich Performanz und Caching hängen von der Hardware ab. @opencl [, K. 2.5]

### PGI Accelerator Derectives

[sec:bas:pgi]

Seit 2011 können die PGI Compiler für Fortran und C99, x64-Code erzeugen, in dem geeignete Berechnungen über das CUDA-API auf eine GPU ausgelagert werden. Das Ziel dabei ist es, das Programmieren von GPGPU-Progammen zu erleichtern. Dafür gibt der Programmierer dem Kompiler über Pragmas vor, wie dieser die Datenlokalität und das Abbilden der Schleifen auf die ALUs handhaben soll. @pgi [, 5]

Beim Programmieren muss die GPU nicht selbst initialisiert werden. Auch das Kopieren der Daten vom Host auf die Grafikkarte läuft weitestgehend transparent für den Programmierer ab. Inwiefern von den Caching-Mechanismen der Hardware Gebrauch gemacht wird, kann nur indirekt über Pragmaparameter beeinflusst werden. @pgi [, 7]

Der grundsätzliche Ablauf ist der, dass die Daten zu Beginn einer parallelen Region auf die Grafikkarte kopiert werden. Schleifen und Funktionen werden zu CUDA-Kerneln kompiliert. Am Ende der parallelen Region werden die Daten zurück in den Host-RAM kopiert. @pgi [, 13, 17]

Das führt aber dazu, dass der Progammierer nur mit starken Einschränkungen Optimierungen durch Parameter der Pragmas umsetzen kann.

Algorithmenübersicht
====================

[sec:alg]

In diesem Kapitel werden die verschienenen parallelen Präfixalgorithmen vorgestellt. Bei der parallelen Lösung des Präfixproblems gibt es grundsätzlich zwei Hürden. Die erste und größere Hürde ist die Abhängigkeit der Teilergebnisse von einander. Das beinhaltet die Fragestellung, welcher Knoten mit welchem anderen Knoten kommuniziert und wie synchronisiert werden muss. Algorithmen für dieses Teilproblem werden im Kapitel [sec:pram] beschrieben. Die andere Hürde ist die Ungleichheit von Problemgröße und Knotenanzahl, welche von Algorithmen aus dem Kapitel [sec:p~n~eq~n~] gelöst werden. Die Algorithmen dafür können in der Regel kombiniert werden.

Die serielle Lösung dieses Problems ist eine Iteration über $X$ in Laufzeit und Arbeitskomplexität $O(n - 1)$. @pp_few [, 2]

Scans im PRAM-Modell
--------------------

[sec:pram]

Das PRAM-Modell wird in dieser Arbeit nicht genauer beschrieben. Es genügt für dieses Kapitel zu wissen, dass im PRAM-Modell eine beliebige Anzahl von Prozessoren zur Verfügung stehen. Wie diese Algorithmen trotzdem auf realer Hardware realisierbar sind, wird in Sektion [sec:p~n~eq~n~] gezeigt.

### Tree Scan

at (30.000000,8.000000)up-sweep; at (30.000000,12.000000)down-sweep; at (3.000000,3.195000)0; at (7.000000,3.195000)1; at (11.000000,3.195000)2; at (15.000000,3.195000)3; at (19.000000,3.195000)4; at (23.000000,3.195000)5; at (27.000000,3.195000)6; at (31.000000,3.195000)7; (5.292900,4.792900)–(6.707100,6.207100); (5.292900,6.207100)–(6.707100,4.792900); (13.292900,4.792900)–(14.707100,6.207100); (13.292900,6.207100)–(14.707100,4.792900); (21.292900,4.792900)–(22.707100,6.207100); (21.292900,6.207100)–(22.707100,4.792900); at (11.000000,17.195000)2; at (3.000000,17.195000)0; at (7.000000,17.195000)1; at (15.000000,17.195000)3; at (23.000000,17.195000)5; at (31.000000,17.195000)7; (17.292900,9.292900)–(18.707100,10.707100); (17.292900,10.707100)–(18.707100,9.292900); at (19.000000,17.195000)4; (25.292900,11.292900)–(26.707100,12.707100); (25.292900,12.707100)–(26.707100,11.292900); (29.292900,13.792900)–(30.707100,15.207100); (29.292900,15.207100)–(30.707100,13.792900); (21.292900,13.792900)–(22.707100,15.207100); (21.292900,15.207100)–(22.707100,13.792900); (13.292900,13.792900)–(14.707100,15.207100); (13.292900,15.207100)–(14.707100,13.792900); (29.292900,4.792900)–(30.707100,6.207100); (29.292900,6.207100)–(30.707100,4.792900); at (27.000000,17.195000)6; (25.292900,7.292900)–(26.707100,8.707100); (25.292900,8.707100)–(26.707100,7.292900); (9.292900,7.292900)–(10.707100,8.707100); (9.292900,8.707100)–(10.707100,7.292900); at (12.500000,14.068889); at (8.500000,12.068889); at (4.500000,14.068889); at (16.500000,9.568889); at (4.500000,5.068889); at (8.500000,7.568889); at (12.500000,5.068889); at (20.500000,5.068889); at (24.500000,7.568889); at (28.500000,5.068889); at (20.500000,14.068889); at (24.500000,11.568889); at (28.500000,14.068889);

[df:ts]

Der Tree Scan stammt von Guy E. Blelloch und ist in @scans_as [, 33, 34] beschrieben. Er benötigt einen ausbalancierten Binärbaum, bei dem als Ausgangszustand die Elemente des Vektors die Werte der Blätter sind. Die Elemente des Ergebnisvektors befinden sich nach dem Tree Scan in den Blättern des Baums.

Wie in Abb. [df:ts] zu sehen, gibt es zwei Phasen: den *up-sweep* und den *down-sweep*. Beim *up-sweep* wird die Operation auf beide Kindelemente ausgeführt und die Summe wird an das Elternelement übergeben. Der Wert des linken Kindelements wird im Speicher des Knotens gehalten. Beim *down-sweep* übergibt jedes Element den Wert seines Elternelementes an sein linkes Kindelement. Der Wert des Elternelements wird desweiteren mit dem gespeicherten Wert verknüpft und an das rechte Kindelement übergeben.

Wenn der Operator jedes Bit in nur einem Arbeitsschritt verarbeitet, kann der Tree Scan bitweise in einer Pipeline verarbeitet werden. Ein Beispiel dafür ist die ganzzahlige Addition.

Der Tree Scan hat eine Schrittkomplexität in $O(2 (m + log(n)))$ und in der Pipeline-Variante in $O(m + 2 log(n))$, wobei $m$ die Datenwortlänge ist.

Da dieser Algorithmus direkt auf einem Binärbaum basiert, sind die Berechnungen und die Datenhaltung dezentral. Die Kommunikation zwischen den Knoten ist stets auf drei benachbarte Knoten beschränkt. Dieser Algorithmus eigent sich daher als Schaltwerk oder für ein verteiltes System implementiert zu werden.

Für Multi- order Manycoresysteme müsste aber erst einmal der Binärbaum auf deren gemeinsame Speicher implementiert werden, wobei die Dezentralität verloren ginge. Es bliebe jedoch der Nachteil, dass jeder Prozessor nur einmal pro Phase aktiv wird und ansonsten untätig ist.

### Binomial Tree Algorithm

[sec:bin~t~ree]

at (29.000000,9.000000)Runde 2; at (29.000000,6.000000)Runde 1; at (-2.000000,12.000000)up-phase; at (-2.000000,15.000000)down-phase; at (12.000000,21.195000)2; at (6.000000,21.195000)0; at (9.000000,21.195000)1; at (15.000000,21.195000)3; at (21.000000,21.195000)5; at (27.000000,21.195000)7; at (18.000000,21.195000)4; at (24.000000,21.195000)6; (11.292900,17.292900)–(12.707100,18.707100); (11.292900,18.707100)–(12.707100,17.292900); (17.292900,17.292900)–(18.707100,18.707100); (17.292900,18.707100)–(18.707100,17.292900); (23.292900,17.292900)–(24.707100,18.707100); (23.292900,18.707100)–(24.707100,17.292900); (20.292900,14.292900)–(21.707100,15.707100); (20.292900,15.707100)–(21.707100,14.292900); at (6.000000,3.195000)0; at (9.000000,3.195000)1; at (12.000000,3.195000)2; at (15.000000,3.195000)3; at (18.000000,3.195000)4; at (21.000000,3.195000)5; at (24.000000,3.195000)6; at (27.000000,3.195000)7; (8.292900,5.292900)–(9.707100,6.707100); (8.292900,6.707100)–(9.707100,5.292900); (14.292900,5.292900)–(15.707100,6.707100); (14.292900,6.707100)–(15.707100,5.292900); (20.292900,5.292900)–(21.707100,6.707100); (20.292900,6.707100)–(21.707100,5.292900); (14.292900,8.292900)–(15.707100,9.707100); (14.292900,9.707100)–(15.707100,8.292900); (26.292900,11.292900)–(27.707100,12.707100); (26.292900,12.707100)–(27.707100,11.292900); (26.292900,5.292900)–(27.707100,6.707100); (26.292900,6.707100)–(27.707100,5.292900); (26.292900,8.292900)–(27.707100,9.707100); (26.292900,9.707100)–(27.707100,8.292900); at (29.000000,12.000000)Runde 3; at (29.000000,15.000000)Runde 2; at (29.000000,18.000000)Runde 1;

[df:bin~t~ree]

Wie in @scan_mpi [, 2] erklärt wird und in Abb. [df:bin~t~ree] zu sehen ist, besteht der Binomial Tree Algorithm wie der Tree Scan aus zwei Phasen mit jeweils $\lfloor log(n) \rfloor$ Iterationen. Die Arbeitskomplexität ist dabei in $O(2 n)$.

In der ersten Phase, der *up-phase*, ist für die Iterationen $j=0, 1, \ldots \lfloor log(n) \rfloor - 1$ unter der Bedingung $i \wedge 2^{j + 1} - 1 = 2^{j + 1} - 1$ das Zwischenergebnis $x_i = x_i \otimes x_{i - 2^j}$. Andernfalls bleibt es unverändert.

Wenn statt eines vollständigen Scan nur eine Reduktion ausgeführt werden soll, kann an dieser Stelle abgebrochen werden. Ansonsten folgt die *down-phase* mit den Iterationen $d = \lfloor
log(n) \rfloor - 1, \ldots, 0$. Im Inneren dieser Schleife folgt die Operation $x_i = x_i \otimes x_{i - 2^j}$ unter der Bedingung $i - 2^j \wedge 2^{j + 1} - 1 = 2^{j + 1} - 1, i - 2^j \geq 0$. Daraus folgt eine Laufzeitkomplexität dieses Scan in $O(2 log(n))$.

Dieser Algorithmus weist eine hohe Datenparallelität auf und eignet sich für Multi- sowie für Manycorearchitekturen. Es gibt jedoch einen Nachteil, der bei Implementierungen für Prozessoren auftritt, bei denen Threads in lockstep ausgeführt werden. Ein Beispiel für einen solchen Prozessor ist die Fermi-GPU. Insgesamt ist bei der Minderheit der Knoten die Bedingung für die Berechnung erfüllt. Es muss nur bei einem Thread des Warps diese Bedingung erfüllt sein, damit der gesamte Prozessor für die Zeit der Berechnung blockiert ist. Bei näherem Betrachten werden in der ersten Iteration $1/2$, in der Zweiten $1/4$ und in der Dritten $1/8$ der Kerne wirklich genutzt. Bei allen weiteren Iterationen wird nur noch ein Kern genutzt. Ist aber bei keinem Thread der Gruppe ist die Bedingung erfüllt, wird der Prozessor wird wieder freigegeben. Ob diese Ineffizienz oder die Speicheranbindung in diesem Fall der begrenzende Faktor ist, kann in dieser Arbeit nicht beantwortet werden.

Vor dem Hintergrund der Cachehierachie von Multicoresystemen, also das sich lokale Gruppen von Kernen, Caches teilen und bei Multisockelsystemen auch der Arbeitsspeicher verteilt ist und dessen Teile mit den einzelnen Prozessoren assoziiert sind, sollte auch das Kommunikationsverhalten der Knoten bei dem Binomial Tree Algorithm betrachtet werden. Die Knoten kommunizieren mit ihren direkten Nachbarn. Erst bei späteren Iterationen vergrößern sich die Distanzen. Dieses Verhalten entspricht grundsätzlich der erklärten Speicherhierachie.

#### Binomial Tree Prescan

Der Binomial Tree Prescan @prefixsums [, 8] ist eine Variante des Binomial Tree Algorithm, der statt $Scan_{\otimes}$, einen $Prescan_{\otimes}$ ausführt. Dabei entspricht die *up-phase* seinem Vorbild. Vor der *down-phase* wird in der *clear-phase*, wie in Algorithmus [alg:btpre] zu sehen, das letzte Element $x_{n-1} = e$ auf Null gesetzt.

$a_{n-1} \gets 0$ $t \gets a_{i+2^d-1}$ $a_{i+2^d-1} \gets a_{i+2^{d+1}-1}$ $a_{i+2^{d+1}-1} \gets a_{t + i+2^{d+1}-1}$

[alg:btpre]

### Simultaneous Binomial Tree Scan

[sec:alg:sim~b~in~t~ree]

at (3.041384,17.236384)0; at (6.000000,17.195000)1; at (9.000000,17.195000)2; at (12.041384,17.236384)3; at (26.000000,6.000000)Runde 1; at (26.000000,10.000000)Runde 2; at (15.041384,17.236384)4; at (18.000000,17.195000)5; at (21.000000,17.195000)6; at (24.041384,17.236384)7; at (36.000000,17.000000); (5.292900,5.292900)–(6.707100,6.707100); (5.292900,6.707100)–(6.707100,5.292900); (8.292900,5.292900)–(9.707100,6.707100); (8.292900,6.707100)–(9.707100,5.292900); (11.292900,5.292900)–(12.707100,6.707100); (11.292900,6.707100)–(12.707100,5.292900); (14.292900,5.292900)–(15.707100,6.707100); (14.292900,6.707100)–(15.707100,5.292900); (17.292900,5.292900)–(18.707100,6.707100); (17.292900,6.707100)–(18.707100,5.292900); (20.292900,5.292900)–(21.707100,6.707100); (20.292900,6.707100)–(21.707100,5.292900); (23.292900,5.292900)–(24.707100,6.707100); (23.292900,6.707100)–(24.707100,5.292900); at (3.041384,3.236384)0; at (6.000000,3.195000)1; at (9.000000,3.195000)2; at (12.041384,3.236384)3; at (15.041384,3.236384)4; at (18.041384,3.236384)5; at (21.041384,3.236384)6; at (24.041384,3.236384)7; (11.292900,9.292900)–(12.707100,10.707100); (11.292900,10.707100)–(12.707100,9.292900); (17.292900,9.292900)–(18.707100,10.707100); (17.292900,10.707100)–(18.707100,9.292900); (23.292900,9.292900)–(24.707100,10.707100); (23.292900,10.707100)–(24.707100,9.292900); (14.292900,9.292900)–(15.707100,10.707100); (14.292900,10.707100)–(15.707100,9.292900); (20.292900,9.292900)–(21.707100,10.707100); (20.292900,10.707100)–(21.707100,9.292900); (8.292900,9.292900)–(9.707100,10.707100); (8.292900,10.707100)–(9.707100,9.292900); (23.292900,13.292900)–(24.707100,14.707100); (23.292900,14.707100)–(24.707100,13.292900); (20.292900,13.292900)–(21.707100,14.707100); (20.292900,14.707100)–(21.707100,13.292900); (17.292900,13.292900)–(18.707100,14.707100); (17.292900,14.707100)–(18.707100,13.292900); (14.292900,13.292900)–(15.707100,14.707100); (14.292900,14.707100)–(15.707100,13.292900); at (26.000000,14.000000)Runde 3;

[df:sbin~t~ree]

Dieser Algorithmus stammt aus @data_par [, 4,5] und mit ihm wird das Problem in $\lfloor log(n) \rfloor$ Iterationen und einer Arbeitskomplexität in $O(n * log(n))$ gelöst. @scan_cuda [, 7]

Die Ergebnisse der einzelnen Iterationen ergeben sich aus der Berechnung $x_i = x_i \otimes x_{i - 2^{j-1}}$, wobei $j=1, 2, \ldots \lfloor log(n) \rfloor$ der Iterationsindex ist. Die Bedingung für diese Operation ist $i - 2^{j-1} \geq 0$. Wie aus Abbildung [df:sbin~t~ree] zu erkennen, gibt es eine Gegenabhängigkeit zwischen Datenelement $x_i$ und $x_{i-1}$. Bei nichtsimultaner Ausführung kann das zu Datenkonflikten führen. Da Multicoresysteme und die SMs der GPU nicht simultan arbeiten, kann dieser Algorithmus nicht ohne weitere Anpassungen eingesetzt werden. Aber auch dieser Algorithmus hat eine sehr hohe Datenparallelität, was ihn grundsätzlich für diese Systeme interessant macht.

Es gibt jedoch noch weitere Punkte, die bedacht werden sollten. Die Operationsbedingung ist im Regelfall erfüllt. Das führt dazu, dass das Effizienzproblem bei Bedingter Ausführung im lockstep nur in sehr geringem Ausmaß vorliegt. Das hat aber auch den Effekt, dass mehr Threads eines SMs Speicherzugriffe haben und daher die Speicheranbindung und der Layer 2 Cache stärker belastet und gegebenenfalls überlastet ist.

Wie auch schon beim Binomial Tree Scan kommt dieser Algorithmus den Cache-Hierachien auf Grund der gleichen Gegebenheiten entgegen. Durch den höheren Kommunikationsaufwand sind jedoch auch größere Caches nötig, da jeder Knoten ein anderes Datum zur weiteren Verarbeitung benötigt.

Ein weiterer Aspekt des Speicherzugriffsverhaltens ist, dass benachbarte Knoten auch auf benachbarte Datenelemente zugreifen. Das bringt eine veringerte Zahl von Speichertransaktionen bei der Fermi-GPU.

#### Double Buffered Simultaneous Binomial Tree

[sec:alg:db~s~im~b~in~t~ree]

In @scan_cuda [, 7] wird eine Anpassung gezeigt, die im Fall einer nichtsimultanen Ausführung das Auftreten von Datenkonflikten verhindert.

Dabei wird nie, wie in Listing [lst:rc] gezeigt, in zwei folgenden Iterationen, in die gleiche Variable geschrieben. Stattdessen wird nach jedem Schleifendurchlauf der Zugriffszeiger auf den Eingabevektor mit dem des Ausgabevektors vertauscht. Daher muss auch der gewöhnliche Arbeitsspeicher die doppelte Größe der Eingabedaten haben.

Das hat aber auch zur Folge, dass die Texturspeicher der GPU benutzt werden können.

    x[2][n]
    in = 0, out = 1 
    for j = 1 to log(n) do
        forall i in parallel do
            if i > 2j-1 then
                x[out][i] = x[in][i-2j-1] + x[in][i]
            else
                x[out][i] = x[in][i]
        swap(in,out)

### Hypercube Scan

at (29.000000,6.000000)Runde 1; at (18.000000,18.195000)2; at (6.000000,18.195000)0; at (12.000000,18.195000)1; at (24.000000,18.195000)3; (11.292900,5.292900)–(12.707100,6.707100); (11.292900,6.707100)–(12.707100,5.292900); (17.292900,9.292900)–(18.707100,10.707100); (17.292900,10.707100)–(18.707100,9.292900); (23.292900,5.292900)–(24.707100,6.707100); (23.292900,6.707100)–(24.707100,5.292900); at (6.000000,3.195000)0; at (9.000000,3.103333); at (12.000000,3.195000)1; at (15.000000,3.103333); at (18.000000,3.195000)2; at (21.000000,3.103333); at (24.000000,3.195000)3; at (27.000000,3.103333); (8.292900,5.292900)–(9.707100,6.707100); (8.292900,6.707100)–(9.707100,5.292900); (14.292900,5.292900)–(15.707100,6.707100); (14.292900,6.707100)–(15.707100,5.292900); (20.292900,5.292900)–(21.707100,6.707100); (20.292900,6.707100)–(21.707100,5.292900); (20.292900,9.292900)–(21.707100,10.707100); (20.292900,10.707100)–(21.707100,9.292900); (26.292900,14.292900)–(27.707100,15.707100); (26.292900,15.707100)–(27.707100,14.292900); (26.292900,5.292900)–(27.707100,6.707100); (26.292900,6.707100)–(27.707100,5.292900); (23.292900,14.292900)–(24.707100,15.707100); (23.292900,15.707100)–(24.707100,14.292900); (8.292900,9.292900)–(9.707100,10.707100); (8.292900,10.707100)–(9.707100,9.292900); (14.292900,14.292900)–(15.707100,15.707100); (14.292900,15.707100)–(15.707100,14.292900); at (29.000000,10.000000)Runde 2; at (5.000000,1.500000)x0; at (8.000000,1.500000)y0; at (11.000000,1.500000)x1; at (14.000000,1.500000)y1; at (17.000000,1.500000)x2; at (20.000000,1.500000)y2; at (23.000000,1.500000)x3; at (26.000000,1.500000)y3;

[df:hc~s~can]

Der Hypercube Scan wird in @pip_pp [, 4] vorgestellt. Mit ihm kann das Präfixproblem in $O(n log(n))$ Rechenoperationen mit einer Laufzeit in $O(log(n))$ gelöst werden. Dabei werden die Prozessoren in einem Binärbaum angeordnet und in-order im Dualsystem benannt ($id$). Jeder Knoten hat zusätzlich zur Speicherstelle $x_i$ ein $y_i$, welches mit $x_i$ initialisiert wird. Danach werden $j = 0, 1, \ldots, log(p)-1$ Iterationen ausgeführt.

In jeder Iteration wird ein neues $y_i$ berechnet:

$$y_{id} = y_{id} \otimes y_{id \oplus 2^j}$$

Falls $id > id \oplus 2^j$, wird auch ein neues $x_i$ berechnet:

$$x_{id} = x_{id} \otimes y_{id \oplus 2^j}$$

Der Ablauf wird in Abbildung [df:hc~s~can] veranschaulicht.

Beim Hypercube Scan herrscht eine hohe Datenlokalität. Er hat aber den Nachteil einer hohen Arbeitskomplexität und einer gewissen Ineffizienz. Zum Einen benötigt er den doppelten Arbeitsspeicher für Zwischenergebnisse. Zum Anderen tragen einige Berechnungen nicht zum Ergebnis bei und sind somit überflüssig. Er wurde für die heute nicht mehr gebräuchlichen verteilten Hypercubesysteme entwickelt.

### Pipelined Binary Tree

Dieser Algorithmus aus @scan_mpi [, 3] ist eine auf verteilte Systeme optimierte Form des Tree Scan, der sich auch für Scans bei $p < n$ eignet.

Die Verbesserungen bestehen darin, dass nur Berechnungen ausgeführt werden, die auch für das Endergebnis relevant sind. Z.B. die Knoten auf dem Pfad von der Wurzel zum äußeren rechten Rand führen in der up-phase keine Berechungen aus. Knoten, die keinen linken Kindknoten haben, empfangen keine Daten vom Elternknoten.

Für den Pipelined Binary Tree gilt das gleiche Fazit wie für den Tree Scan. Die Vorteile des Binärbaums greifen bei diesem Algorithmus nicht für Multi- und Manycoresysteme. Die verbesserte Arbeitskomplexität macht ihn hauptsächlich für verteile Systeme interessant.

### Workefficient Dataparallel Algorithm

Dieser Scan stammt aus @wse_scan [, 1,2] und besteht aus zwei Phasen. Einem *reduce* und einem *up-sweep*. Er basiert auf dem Binomial Tree Algorithm, löst aber die Speicherverwaltung etwas anders. Demensprechend ist auch hier die Schrittkomplexität in $O(2 log(n))$ und die Arbeitskomplexität in $O(2 n)$.

In der Reduktionsphase wird in jeder Iteration $j = 1, \ldots, log(n)$ ein neuer Vektor $X_j$ der Länge $n/2^j$ für die Zwischenergebnisse angelegt und gespeichert. Der genaue Ablauf kann dem Algorithmus [alg:wse~r~educe] entnommen werden. Beim up-sweep, der in Algorithmus [alg:wse~u~p~s~weep] gezeigt wird, werden diese Vektoren weiter verwendet.

Für beide Phasen gilt, das in einer Iteration nur mit zwei Vektoren gearbeitet wird. Außerdem wird auf einen der beiden Vektoren ausschließlich lesend zugegriffen. Dieser Umstand kommt den Manycoresystemen zugute, die mit Texturspeichern solchen Fällen besonders Rechnung tragen.

Aber wie auch beim Double Buffered Simultaneous Binomial Tree Algorithm wird insgesamt der Speicherverbrauch verdoppelt.

Auch bei diesem Algorithmus werden Vektorelemente, die von benachbarten Knoten verarbeitet werden, im Regelfall an benachbarten Speicherstellen gehalten. Wie bereits erklärt, verringert dies die Zahl der Speichertransaktionen beim Caching.

Allgemein eignet sich der Workefficient Dataparallel Algorithm für Multi- sowie Manycoresysteme.

$a_{j,i} \gets a_{j-1,2i} \otimes a_{j-1,2i + 1}$

[alg:wse~r~educe]

$a_{j,i} \gets a_{j+1,i/2}$ $a_{j,i} \gets a_{j,i} \otimes a_{j+1,(i/2)-1}$ $a_{j,i} \gets a_{j,i}$

[alg:wse~u~p~s~weep]

### Hybrid Scan

Der Hybrid Scan stammt ebenfalls aus @wse_scan [, 2] und nutzt den Umstand, dass sich die hohe Arbeitskomplexität des Simultaneous Binomial Tree erst bei bestimmten Problemgrößen negativ auswirkt. Daher beinhaltet er eine Art Weiche, die erst wenn das Problem größer als die Prozessorzahl ist, wie der Workefficient Dataparallel Algorithm verfährt. Im anderen Fall entspricht er dem Simultaneous Binomial Tree.

Grundsätzlich ist dieses Verfahren unabhängig von Algorithmus und API geeignet die Laufzeiten zu reduzieren. Jedoch unterscheidet sich der optimale Punkt des Wechsels bei den diversen APIs, Rechnern und den genutzten Scan-Operationen und sollte im Einzelfall gewählt werden.

Anpassungen für begrenzte Ressourcen
------------------------------------

[sec:p~n~eq~n~]

Die bisher vorgestellten Algorithmen für parallele Systeme sind vom PRAM-Modell ausgegangen. Auf realer Hardware hat man hingegen die Einschränkung, nicht unendlich viele Prozessoren nutzen zu können.

Um Unabhängigkeit von der Prozessorzahl zu erreichen, kann aus zwei grundlegenden Vorgehensweisen gewählt werden.

Bei der Ersten wird das Problem geteilt und diese Teile parallel zueinender sequentiell gescannt. Die Ergebnisse der Teilscans werden zum Endergebnis reduziert. Bei dem zweiten Verfahren werden sequentiell die Teile des Problems jeweils parallel gescannt. Algorithmen dazu werden in den folgenden Sektionen vorgestellt.

Diese müssen jedoch nicht immer explizit angewand werden. Bei dem OpenMP-API kann eine beliebige Parallelität als parallele Schleife angegeben werden. Wie in Sektion [sec:bas:omp] erklärt, kann diese virtuelle Parallelität dann auf den realen Multiprozessor abgebildet werden, indem Teile sequentiell abgearbeitet werden. Auch bei den GPGPU-APIs können mehrere tausend Threads auf z.B. $448$ reale Kerne mit Thread-Queues oder Pseudoparallelität abgebildet werden. Das kann, muss aber nicht das effizienteste Verfahren sein.

Ein anderer Grund das Problem zu partitionieren, kann die Größe des verfügbaren Speichers sein. Abhängig von der Hardware-Architektur hat der Prozessor keinen Zugriff auf den Hauptspeicher und die Daten müssen vor der Berechnung in unmittelbar erreichbaren Speicher kopiert werden. In diesem Fall begrenzt die Größe des erreichbaren Speichers auch die Partitionsgröße. Bei Architekturen, die das Caching von Daten unterstützen, kann die Partitionsgröße zumindest Einfluss auf die Laufzeit des Scans haben.

In dieser Sektion werden wieder die Eigenschaften der Algorithmen an Hand der $O$-Notation abgeschätzt. Diese sind auch von der Komplexität der darin verwendeten Algorithmen des PRAM-Modells abhängig. Das wird dann in diesem Abschnitt wie folgt notiert:

$$O(n/p * O_{PRAM}(p))$$

### KRS Parallel Prefix Algorithm

[subsec:krs]

Der KRS Algorithmus stammt von Clyde P. Kruskal, Larry Rudolph und Marc Snir und ist in @pp_few [, 2, 3] erklärt. Er löst das Präfixproblem für den Fall $p < n$.

In diesem Fall wird $X$ in $p$ zusammenhängende Vektoren $Y_1 = [x_0, x_1, \ldots, x_{m-1}],$ $Y_2 = [x_{m}, x_{m+1}, \ldots, x_{m+m-1}],$ $\ldots,$ $Y_p = [x_{(p-1)*m}, x_{(p-1)*m+1}, \ldots, x_{n-1}]$ der Länge $m = n / p$ partitioniert, die dann sequenziell gescannt werden. Die jeweils letzten Elemente der gescannten Partitionen werden als neuer Vektor $Z = [y_{1,m-1}, y_{2,m-1}, \ldots, y_{p,n-1}]$ gescannt. Dabei kommt ein Algorithmus aus Sektion [sec:pram] und alle Prozessoren zum Einsatz. Der Prozessor $p_j$ errechnet die Partialsumme von $y_{jm-1}$, die er dann an $p_{j+1}$ weiterschickt. Die von $p_j$ empfangene Partialsumme wird dann mit der Partition verknüpft:

$$y_{(j-1)m-1} \otimes^{\circ} Y_j$$

Die Schrittkomplexität ist in $O(2n/p - 2 + O_{PRAM}(p))$ und die Arbeitskomplexität ist in $O(2n + O_{PRAM}(p))$. Dabei wird die Ausführung erst durch die Parallelisierung beschleunigt, wenn $p > 2$ ist.

Dieser Algorithmus ist für Multicoresysteme und für verteilte Systeme geeignet. Die einzelnen Knoten arbeiten weitestgehend autark. Die Kommunikation und Synchronisation zwischen den Knoten ist sehr gering.

Für GPGPU ist er weniger geeignet. Das Threadscheduling erreicht die beste Auslastung des Systems bei großen Thread-Zahlen. Die minimale Threadzahl ist jedoch gerade ein wichtiges Merkmal des KRS-Algoritmus. Der Scan auf den Vektor $Z$ mit seiner geringen Größe, entspricht ebenfalls nicht der Auslegung der GPUs.

### New Parallel Prefix Algorithm

Dieser Algorithmus stammt aus @pp_few [, 3]. Bei ihm wird der Eingabevektor $X$ in die zwei Teilvektoren $Y_1 = [x_0, x_1, \ldots, x_{\alpha n-1}]$ und $Y_2 = [x_{\alpha n}, x_{\alpha n+1}, \ldots, x_{n-1}]$ geteilt. Die Prozessoren $p_0, p_1, p_2, \ldots, p_{p-2}$ scannen $Y_1$ rekursiv nach dem gleichen Verfahren und $p_{p-1}$ scannt $Y_2$ seriell. In der nächsten Phase werden alle Präfixe von $Y_2$ mit allen verfügbaren partiellen Produkten der Partitionen von $Y_1$ verknüpft. Das Verhältnis $\alpha$ der Längen von $Y_1$ und $Y_2$ sollte so gewählt werden, dass $p_0$ die gleiche Zeit für Berechnung und Kommunikation benötigt wie $p_{p-1}$.

Der New Parallel Präfix Algorithm ist eine Weiterentwicklung des KRS-Algorithmus, bei dem die Kommunikationslatenzen bei der Partitionierung von $X$ berücksichtigt werden. Also eignet sich auch er für Rechner mit wenigen Prozessoren und verteiltem Speicher. Bei Multicoresystemen ist jedoch die Kommunikationslatenz zwischen den Kernen nicht relevant, da über den gemeinsamen Speicher kommuniziert werden kann.

### Beliebige Problemgrößen beim Binomial Tree Algorithm

In @prefixsums [, 8] wird eine Variante des Binomial Tree Algorithm aus Sektion [sec:bin~t~ree] vorgestellt, welche sich für Probleme für den Fall $n > p$ eignet. Dabei wird das Problem wie bei dem KRS-Algorithmus partitioniert, dann aber pro Prozessor eine Prozessorsumme $z_i = Reduce_{\otimes}(Y_i)$ berechnet. Davon gefolgt werden die Prozessorsummen gescannt $Scan_{\otimes}(Z)$. Die Partialsummen $z_i$ werden zuletzt als Offset für die Scans auf $Y_i$ genutzt. Die Schrittkomplexität ist dabei $O(2n/p-2 + 2log(n))$ und die Arbeitskomplexität $O(2n + 2p)$.

Er eignet sich für Verteilte- und Multicoresysteme, bietet aber keine bedeutenden Vorteile. Unterm Strich wird im Vergleich zum KRS-Algorithmus nur eine serielle Vektoraddition durch eine serielle Reduktion ersetzt.

### Chunking und Scannen im Strom

Eine weitere Methode dieses Problem zu lösen, wäre den Eingabevektor in *Chunks* zu teilen. Diese Chunks sollten dann sequentiell wie in Algorithmus [alg:chunked~s~can] berechnet werden.

Die Chunkgröße $m$ sollte so gewählt werden, dass diese Blöcke effizient gescannt werden können. Also beispielsweise abhängig von der Prozessorzahl oder von der Größe des Speichers, auf den performant zugegriffen werden kann.

Das ergibt dann eine Schrittkomplexität in $O(O_{PRAM}(m)*n/m)$ und eine Arbeitskomplexität in $O(O_{PRAM}(m)*n/m)$.

Dieser Scan ist für Multicoresysteme nicht geeignet, denn der gesamte RAM ist vergleichsweise performant erreichbar. Würde man $m$ stattdessen an der Größe des Layer 3 Cache ausrichten, würde das eine ausgesprochen große Zahl an Blöcken bedeuten. Eine große Zahl von Blöcken führt zu einem größen Synchronisationsaufwand zwischen den Kernen.

Bei Grafikkarten ist die Aussicht jedoch anders. Die Datenrate bzw. die Latenz des PCIe haben einen deutlichen Einfluss auf die Laufzeit eines Programms, das GPGPU einsetzt. Sind Kommunikation und Berechnung asynchron, so könnte sich diese Laufzeit reduzieren.

$X_d = [x_0, x_1, \ldots, x_{m-1}]$ $X_d = [x'_{dm-1}, x_{dm}, x_{dm+1}, \ldots, x_{(d+1)m-1}]$ $X' = ParallelScan_\otimes(X_d)$

[alg:chunked~s~can]

Zusammenfassung
---------------

In den Tabellen [tab:PRAM] und [tab:pgtn] sind die wichtigesten Eigenschaften der vorgestellten Algorithmen zusammengefasst.

[!]

[!]r|l|l &\
& Schritte & Arbeit\
 &\
& $O(2 log(n))$ & $O(2 n)$\
 &\
& $O(2 log(n))$ & $O(2 n)$\
 &\
& $O(log(n))$ & $O(n log(n))$\
 &\
& $O(log(n))$ & $O(n log(n))$\
 &\
& $O(2 log(n))$ & $O(2 n)$\
 &\
& $O(log(n))$ & $O(n^2)$\
 &\
& $O(2 log(n))$ & $O(2 n)$\
 &\
& $O(2 log(n))$ & -\

[tab:PRAM]

[!]r|l|l &\
& Schritte & Arbeit\
 &\
& $O(2n/p - 2 + O_{PRAM}(p))$ & $O(2n + O_{PRAM}(p))$\
 &\
& $O(2n/p-2 + 2log(n))$ & $O(2n + 2p)$\
 &\
& $O(O_{PRAM}(m)*n/m)$ & $O(O_{PRAM}(m)*n/m)$\

[tab:pgtn]

Implementierung der Algorithmen
===============================

[sec:imp]

In diesem Kapitel wird in Sektion [sec:libstruct] der Aufbau der resultierenden Softwarebibliothek vorgestellt. In Sektion [sec:selection] eine Vorauswahl der Algorithmen getroffen, welche weiter untersucht werden. Außerdem werden in den Sektionen [sec:imp:omp] bis [sec:imp:pgi] die Besonderheiten der Implementierungen der diversen Scans erklärt. Die Quelltexte, Makefiles und Anleitungen dieser Programme sind auf der beiliegenden CD-ROM oder im Web zu finden (siehe Kapitel [sec:disc]). Sie unterliegen der GNU General Public License 3.0 und können unter den entsprechenden Bedingungen genutzt werden.

Struktur der Softwarebibliothek
-------------------------------

[sec:libstruct]

    typedef void (*scan_operator_function)(void* r, void* a, void* b);

    typedef struct {
        char* name;
        scan_operator_function function;
        void* neutral;
        int type_len;
    } scan_operator;

    typedef struct {
        char* pointer;
        long bytes_len;
        long vector_len;
    } scan_data;

    int scan(scan_data data, scan_operator op, int* processor_count);

Die Implementierungen sind weitestmöglich generisch gehalten, um Algorithmen und Operatoren einfach austauschen und ergänzen zu können.

Den Kern der Softwarebibliothek bildet der Prototyp der Funktion `scan`, aus der Headerdatei `scan.h`, dem alle Implementierungen entsprechen müssen. Die konkrete Definition ist in Listing [lst:lib] zu sehen.

Parameter des Scans sind eine Datenstruktur und eine Operatorstruktur. Die Datenstruktur enthält einen Zeiger auf den zu scannenden Vektor, die Vektorlänge, sowie Datengröße in Bytes. Die Operatorstruktur enthält die Länge des Datentyps in Bytes, das Neutrale Element der Operation und einen Zeiger auf die Operatorfunktion. Ein weiterer Teil der Struktur ist der Name des Operators, mit dem der Quelltext des OpenCL-Kernels zur Laufzeit geladen wird.

Die Rückgabe der Funktion ist ein Fehlercode, der soweit möglich die Laufzeitfehler der verwendeten APIs vereinheitlicht.

Die Operatorfunktion `scan_operator_function` ist nicht destruktiv und das Ergebnis muss an das Ziel des Zeigers `r` geschrieben werden.

Beim beim Einsatz in eigenen Programmen muss dann die gewünschte Implementierung von dem Compiler/Linker eingebunden werden.

Die CUDA-Implementierungen und daraus folgend auch die Lösungen mit dem PGI-Accellerator-Directives, müssen die Scan-Operation fest im Code haben, da ein dynamisches Laden der Kernel wie bei OpenCL nicht vorgesehen ist. Ein solches Verhalten wäre erst mit Wrappern wie z.B. PyCUDA möglich, bei denen der CUDA-Kernel ähnlich zu OpenCL erst zur Laufzeit kompiliert wird. Dieser Workaround bietet sich aber nicht für eine C-Bibliothek sondern nur für interpretierte Programmiersprachen an.

Algorithmenauswahl
------------------

[sec:selection]

Die Besonderheit des Tree Scan ist der zugrundeliegende Binärbaum. Aus der daraus resultierenden Unabhängigkeit der Knoten, eignet sich der Tree Scan zur direkten Implementierung in Hardware oder für verteile Systeme. Auf den hier betrachteten Plattformen ließe sich der Binärbaum aber nur auf Basis eines Arrays oder mit Zeigern auf Knoten realisieren. Der Binomial Tree Algorithm hingegen hat die gleiche, minimale Arbeitskomplexität und dient als Basis vieler Algorithmen. Außerdem kann er direkt auf ein Array zugreifen, ohne eine Baumstruktur zu simulieren. Eine Optimierung davon ist der Workefficient Dataparallel Algorithm, bei dem zu lesende und zu schreibende Daten getrennt werden können. Diese Trennung ermöglicht die Nutzung von nur lesbarem Speicher. Daher wird der Binomial Tree Algorithm umfassend mit den diversen vorgestellten Optimierungen getestet.

Der Simultaneous Binomial Tree hat eine minimale Zeitkomplexität auf Kosten einer hohen Arbeitskomplexität. Er nutzt die Multiprozessoren der Grafikkarten effizient aus und ermöglicht ebenfalls die Nutzung von Texturspeichern. In welchem Umfang das die Ergebnisse beeinflusst, wird in dieser Arbeit evaluiert. Dabei wird aber grundsätzlich die Variante Double Bufferd Simultaneous Binomial Tree Algorithm verwendet.

Der Hypercube Scan und der Pipelined Binary Tree Scan sind auf verteilte Systeme ausgelegt und beschränken sich auf geringe Verbesserungen in der Kommunikationskomplexität auf Kosten der Arbeitskomplexität oder auf optmierter Arbeitskomplexität des Tree Scan, aber ohne dessen ungeeignete Datenstruktur zu ändern. Daher werden diese Algorithmen nicht weiter beachtet.

Beim OpenMP-API besteht die Möglichkeit, die Anpassung des Algorithmus auf die reale Knotenzahl selbst zu erledigen. Dafür bietet sich der KRS-Algorithmus an. In diesem Kontext wird als PRAM-Algorithmus der serielle Scan verwendet, weil die geringe Größe dieses Teilproblems eine Parallelisierung nicht rechtfertigt.

OpenMP Implementierungen
------------------------

[sec:imp:omp]

Das OpenMP-API hat die Eigenschaft, dass Algorithmen auf dem PRAM-Modell mit wenigen Anpassungen implementiert werden können. Jeder Knoten wird dabei durch eine Iteration einer Schleife dargestellt. Diese Schleife kann dann mit dem Pragma `omp for` parallelisiert werden.

Dabei muss aber bedacht werden, dass diese parallelen Prozesspfade nicht synchron sind und daher Datenabhängigkeiten aufgelöst werden müssen.

Die Unterscheidung zwischen gemeinsamen und privaten Variablen, die bei OpenMP-Programmen getroffen werden muss, fällt hier nicht besonders schwer. Die Zeiger auf den Datenvektor und seine Puffer müssen wie auch die Operationsstruktur gemeinsam sichtbar sein. Sonstige Daten können konstant oder lokal definiert werden.

Die Implementierung des KRS-Algorithmus in Kombination mit der Multiplikation auf Fließkommamatritzen, hat eine versteckte Endlosschleife. Dieser Fehler liess sich auf verschiedenen Rechnern mit verschiedenen Compilern reproduzieren. Die Ursache konnte jedoch nicht ohne weiteres gefunden werden.

Programmierung von OpenCL
-------------------------

[sec:imp:ocl]

Bei OpenCL ist die Initialisierung der Umgebung sehr aufwändig. Diese umfasst das Erstellen eines Kontextes, bestehend aus Platformen und Geräten, die dazu geladen werden müssen, und dem Erstellen einer Command-Queue pro Gerät. Die Initialisierung besteht außerdem aus dem Laden und Kompilieren des Kernelquelltextes. Es muss Speicher auf dem Gerät alloziert und gegebenenfalls mit Daten gefüllt werden. Dann kann ein Kernel erstellt werden, dem folgend die Parameter zugewiesen werden können. Erst dann können die Kernel einer Command-Queue übergeben und damit gestartet werden. In umgekehrter Reihenfolge sollten die Ressourcen wieder freigegeben werden.

Bei allen ausgewählten Algorithmen ist zwischen den einzelnen Iterationen der Sweep-Phasen eine Barrier-Synchronisation aller Knoten nötig. Bei OpenCL ist eine solche globale Synchronisierung innerhalb eines Kernels nicht vorgesehen. Stattdessen kann der Kernel aber aufgeteilt werden. Daher werden diese Sweeps bei allen Implementierungen auf dem Host ausgeführt und nur die eigentlichen datenparallelen Operationen im Schleifeninneren werden auf der Grafikkarte berechnet.

Bei dem Simultaneous Binomial Tree Algorithm und bei dem Workefficient Dataparallel Scan wird pro Kernel auf die Eingabedaten ausschließlich lesend zugegriffen. Beim OpenCL-API kann beim Allozieren der Puffer definiert werden, ob der Speicher lesbar und/oder beschreibbar sein soll. Das soll abhängig von der verwendeten Hardware die Zugriffe beschleunigen.

Für beide genannten Algorithmen wurde eine Variante mit les- und beschreibbaren Puffern sowie eine Variante implementiert, bei der zwischen den Sweep-Iterationen die Daten vom beschreibbaren Ergebnispuffer in den nur lesbaren Eingabepuffer kopiert werden.

CUDA-Implementierungen
----------------------

[sec:imp:cuda]

Bei CUDA wird das Host-Programm in einer Variante von C++ geschrieben und muss mit dem nVIDIA-Compiler `nvcc` kompiliert werden. @cuda_man [, 26,28] Um diesen Aufruf aus einem C-Programm heraus zu starten, muss eine Wrapper-Funktion als `extern ”C”` deklariert werden. Andere Unterschiede zwischen C und C++, wie z.B. Exceptions werden vom Compiler behandelt.

Die Zahl der Schritte die nötig sind, um ein CUDA-Programm lauffähig zu bekommen, ist gering. Es muss der benötigte Speicher auf dem Gerät alloziert werden. Auf diesen kann dann mit `cudaMemcpy` zugegriffen werden. Ohne weitere Aktionen kann der Kernel bzw. dessen Wrapper-Funktion aufgerufen werden, bevor der Gerätespeicher wieder freigeben wird.

Wie auch beim OpenCL-API gibt es in CUDA keine globale Barrier-Synchonisation innerhalb eines Kernels. Daher muss auch hier der Kernel aufgeteilt werden.

Eine weitere Gemeinsamkeit mit dem OpenCL-API ist der Speicher für optimierten Lesezugriff. Da gibt es einen auf $64 KiB$ größenbeschränkten Konstanten-Speicher (siehe Sektion [sec:bas:cuda]). In diesen Fall ist der bereits vorgestellte Texturspeicher jedoch geeigneter. Der Texturspeicher unterscheidet sich vom globalem Speicher darin, dass eine Struktur von gewöhnlichem globalem Speicher vor dem Ausführen des Kernels auf eine Texturstruktur gebunden wird. Folgend kann auf diese Daten aus den Threads nur noch lesend über Fetch-Kommandos zugegriffen werden. Dabei wird intensiv von Caching Gebrauch gemacht. @mat_gpu [, 27] Im Gegensatz zu OpenCL müssen die Daten hier nicht kopiert werden. Das bedeutet also einen geringeren Mehraufwand, verglichen mit den Möglichkeiten des OpenCL-API.

In @scan_cuda [, 17] wird ein Verfahren vorgestellt, das helfen soll Bank-Konfikte zu reduzieren. Dabei wird der Array-Index mit einem Padding multipliziert, um nebeneinanderliegende Daten auf möglichst viele Speicherbänke zu streuen. Gerade bei den ersten Iterationen liegen die verknüpften Daten sehr nah beieinander. Dabei könnte dieses Muster Vorteile haben. Der Nachteil ist aber, dass die Daten vor und nach dem Scan aufwändig umstrukturiert werden müssen. Zusätzlich ist dieses Verfahren mittlerweile umstritten, weil die aktuelle GPU-Generation dieses Problem reduziert hat und bei Texturspeicher nicht aufweist.

PGI Accellerator Derectives
---------------------------

[sec:imp:pgi]

Bei der Programmierung mit den PGI Accellerator Derictives treten schnell einige Unterschiede zu den OpenMP Derektiven hervor, die wiederum Unterschiede der Implementierung mit sich bringen.

Es gibt hier grundsätzlich zwei Arten von Pragmas. Die, die Datenregionen markieren und konkret aussagen, welche Daten kopiert oder aktualisiert werden müssen. Man muss sich also, wie in Sektion [sec:bas:pgi] beschrieben, Gedanken zur Datenlokalität machen.

Zusätzlich gibt es noch die Pragmas für Rechenregionen, bei denen Schleifen markiert werden, ob diese auf dem Host oder auf der Grafikkarte, parallel oder sequenziell ausgeführt werden sollen.

Bei OpenMP jedoch ist man hier nicht auf Schleifen beschränkt. Da ist es problemlos möglich, eine Parallele Region zu haben, bei der jeder Prozessor genau einen eigenen Pfad hat. Nur damit ist es sinnvoll möglich, Algorithmen wie den KRS-Scan zu implementieren.

Andererseits gibt es bei den Accellerator-Pragmas die Möglichkeit, eine Schleife als Vektoroperation zu deklarieren. Das hat zur Folge, dass diese Schleife synchron ausgeführt wird. Beispielsweise der Simultaneous Binomial Tree Scan kann damit ohne zweiten Speicherbereich implementiert werden. Implementierungsvariante mit dieser Anpassung hab jedoch keine korrekten Ergebnisse geliefert.

Außerdem ist es Möglich, mit dem Prgama-Parameter `cache` das Caching-Verhalten indirekt zu beeinflussen. Dabei werden die angegebenen Variablen in der höchsten Cache-Hierachie gehalten. Dafür hat man im Vergleich zu CUDA keinen direkten Zugriff auf den Texturspeicher.

Test und Auswertung
===================

[sec:eval]

In diesem Kapitel werden die Implementierungen umfassend getestet und die Ergebnisse daraufhin bewertet, in welchen Fällen deren Stärken genutzt werden können.

In der Sektion [sec:env] wird die verwendete Hard- und Software der Testumgebung, sowie die Referenzimplementierung erklärt. In den zwei folgenden Sektionen [sec:res:api] und [sec:res:uni] werden die Programme getestet und die Messwerte nach API und nach Anwendungsfall gegliedert interpretiert. Dabei werden bei den OpenCL und bei den CUDA-Implementierungen jeweils eine Messreihe inklusive Geräteinitialisierung und Datentransfer getestet und eine Messreihe ohne Datentransfer. Das hat den Grund, dass in den Anwendungsfällen, in denen mehrere Scans kombiniert werden, die Initialsierungsphase nur einmal nötig ist.

Testumgebung
------------

[sec:env]

Alle Tests wurden auf der Plattform für Wissenschaftliches Rechnen der Hochschule Bonn Rhein Sieg ausgeführt. Die genaue Beschreibung der Hardware kann unter der URL <http://wr0.wr.inf.h-brs.de/wr/hardware/hardware.html> und sonstige Informationen zum Cluster können unter der URL <http://wr0.wr.inf.h-brs.de/wr/index.html> abgerufen werden.

Die Messungen der Referenzimplementierung sowie der OpenMP-Programme wurden auf dem Knoten WR17 vorgenommen. Dieser besteht aus einem Supermicro 2042G-TRF mit 4 AMD Opteron 6168, bietet also 48fache Parallelität.

Die GPGPU-Programme wurden auf dem Knoten WR18 getestet, welcher auf einem Supermicro 6016GT-TF-FM105 basiert und mit einem NVidia Tesla M2050 ausgerüstet ist.

Die Prozesse liefen exklusiv und wurden mehrfach wiederholt, wobei das beste Resultat verwendet wurde.

### Referenzimplementierung und Ergebnisvalidierung

Die Referenzimplementierung für den Geschwindigkeitsvergleich und die Berechnung des Speedups, ist eine serielle Iteration über den Eingabevektor, entsprechend dem folgenden Listing [lst:ref].

    for (index = 1; index < vector_length; index++)
    {
            void* target_pointer = data.pointer + index * op.type_len;
            op.function(target_pointer,                             //Resultat
                                    target_pointer,                             //A
                                    target_pointer - op.type_len);//B
    }

Getestet werden die Implementierungen soweit möglich mit verschiedenen Vektorgrößen mit Daten bis zu $8GiB$.

Die Operationen sind dabei zum Einen die Integer-Addition, die für besonders einfache Berechnungen steht und sehr gut den Kommunikations- und Verwaltungsaufwand hervorhebt. Die Korrektheit des Ergebnis wurde geprüft, indem in jedes Feld des Eingabevektors der Wert $1$ geschrieben wurde. Wenn das letzte Vektorelement nach dem Scan als Wert die Vektorlänge hat, ist der gesamte Scan mit guter Wahrscheinlichkeit korrekt. Ergebnisse anderer Vektorelemente wurden händisch nach dem Zufallsprinzip geprüft. Aufgrund des Wertebereich des Integer wurden die Tests nur bis zu einer Größe der Eingabedaten von $4 GiB$ getestet.

Die andere Operation ist die Multiplikation auf eine $16\times16$-Matrix mit Fließkommazahlen einfacher Genauigkeit und steht für aufwändige Berechnungen, bei denen z.B. eine geringe Arbeitskomplexität oder eine effiziente Speichernutzung wichtig sind. Die Korrektheit dieses Scans wurde geprüft, indem in jedes Vektorelement die Einheitsmatrix kopiert wurde. In das erste Element jedoch wurde eine beliebige andere Matrix geschrieben, die sich nach dem Scan in allen anderen Elementen des Vektors befinden muss.

Durch die maximale Größe der Eingabedaten von $8 GiB$ und der maximalen Größe Pufferspeicher wurden insgesamt $16 GiB$ Arbeitsspeicher verwendet.

Die gemessenen Referenzwerte können der Abbildnung [plot:ser~s~can] entnommen werden.

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s), legend style=at=(1,0), anchor=south east] table[x=Size,y=EpS] data/best/serial~n~aive~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/best/serial~n~aive~s~can~f~loat~m~atrix~m~ul.csv;

[plot:ser~s~can]

### Vorstellung der Messmethode

Die Laufzeitmessungen wurden mit der Funktion `gettimeofday` aus der Bibliothek `sys/time.h` durchgeführt, die eine Auflösung auf Mikrosekunden bietet. Die Messpunkte lagen direkt vor und nach dem Aufruf der entsprechenden `scan`-Funktion. Bei den Messungen bei GPGPU-Berechnungen ohne Datentransfer lagen weitere Messpunkte direkt vor dem Beginn der ersten Phase. Nach dem Ende der letzten Phase wurde erst ein `cudaThreadSynchronize` bzw. ein `clFinish` vor der Zeitmessung aufgerufen, damit mit Sicherheit alle Berechnungen beendet waren.

Im nächsten Schritt wurden die Scan-Ergebnisse in der `eval`-Funktion des entsprechenden Tests auf Korrektheit geprüft. Bei Erfolg wurden die Messwerte nach Algorithmen- und Operationsname mit Rechenkernzahl, Problemgröße automatisiert in CSV-Dateien abgelegt.

Speedup-, Effizienz- und Geschwindigkeits-Werte wurden ebenfalls automatisiert mit dem Skript `algomeas.py` berechnet und in weiteren CSV-Dateien abgelegt.

Informationen zur Reproduktion der Ergebnisse sind in Kapitel [sec:disc] zu finden.

Ergebnisvergleich je API
------------------------

[sec:res:api]

In dieser Sektion werden die Testresultate für die Algorithmen je API gezeigt und analysiert, um deren Eigenschaften besser vergleichen und bewerten zu können.

### OpenMP-Ergebnisse

[sec:eval:omp]

[xlabel=Threads, ylabel=Laufzeit $(\mu s)$, legend style=at=(1,1), anchor=north east] table[x=Threads,y=Time] data/speedup/openmp~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Threads,y=Time] data/speedup/openmp~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Threads,y=Time] data/speedup/openmp~w~e~d~p~s~can~i~nt~a~dd.csv; table[x=Threads,y=Time] data/speedup/openmp~n~aive~k~rs~s~can~i~nt~a~dd.csv;

[xlabel=Threads, ylabel=Laufzeit $(\mu s)$, legend style=at=(1,1), anchor=north east] table[x=Threads,y=Time] data/speedup/openmp~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Threads,y=Time] data/speedup/openmp~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Threads,y=Time] data/speedup/openmp~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv;

[xlabel=Threads, ylabel=Speedup] table[x=Threads,y=Speedup] data/speedup/openmp~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Threads,y=Speedup] data/speedup/openmp~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Threads,y=Speedup] data/speedup/openmp~w~e~d~p~s~can~i~nt~a~dd.csv; table[x=Threads,y=Speedup] data/speedup/openmp~n~aive~k~rs~s~can~i~nt~a~dd.csv;

[xlabel=Threads, ylabel=Speedup] table[x=Threads,y=Speedup] data/speedup/openmp~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Threads,y=Speedup] data/speedup/openmp~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Threads,y=Speedup] data/speedup/openmp~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv;

[plot:omp:speedup]

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/openmp~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/openmp~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/openmp~w~e~d~p~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/openmp~n~aive~k~rs~s~can~i~nt~a~dd.csv;

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/openmp~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/openmp~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/openmp~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/openmp~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/openmp~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/openmp~w~e~d~p~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/openmp~n~aive~k~rs~s~can~i~nt~a~dd.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/openmp~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/openmp~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/openmp~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv;

[plot:omp:par]

Die Abbildung [plot:omp:speedup] zeigt einen fast linearen Speedup. Das bedeutet eine fast konstante Effizienz der Scans mit den verschiedenen Algorithmen. Das wiederum bedeutet, dass mit dem Einsatz weiterer Prozessoren noch deutlich bessere Laufzeiten zu erwarten sind.

Betrachtet man dazu noch die Geschwindigkeiten der Scans mit variierter Problemgröße aus Abbildung [plot:omp:par], so kann man erkennen, dass durchweg die besten Resultate mit dem KRS-Algorithmus erreicht werden. Das ist damit zu begründen, dass dabei nur soviel Parallelität verwaltet werden muss, wie auch die Hardware vorhält. Die anderen Algorithmen hingegen behandeln jedes Vektorelement als paralleles Element und diese massive Parallelität wird dann auf die verfügbaren Prozessoren gemappt, was nicht nur einen gewissen Verwaltungsaufwand bedeutet. Das bedeutet auch eine größere Zahl von Operationen. Wird ein Teilvektor auf einem Knoten von dem arbeitseffizientesten parallelen Algorithmus gescannt, benötigt dieser doppelt so viele Operationen wie ein Knoten, der einen vergleichbaren Vektor mit einer einfachen Iteration scannt.

Der Simultaneous Binomial Tree Scan zeigte durchweg die schlechtesten Resultate. Das hat mehrere Ursachen. Zum Einen die hohe Arbeitskomplexität, deren Auswirkungen in folgender Berechnung klar werden sollten. Der Plus-Scan wurde in diesem Beispiel auf $536.870.912$ Elemente ausgeführt. Dann ist die Zahl der Operationen:

$$O(n log(n)) = 536.870.912 * log(536.870.912) = 536.870.912 * 29 = 15.569.256.448$$

Im gleichen Beispiel wären für einen Binomial Tree Scan $1.073.741.824$ Rechenoperationen nötig. Dazu kommen bei beiden Algorithmen Speicheroperationen in ähnlicher Größenordnung.

Weiter fällt die Speedupdifferenz zwischen Binomial Tree Scan und Workefficient Dataparallel Scan jeweils bei der Integer-Addition und der Matrixmultiplikation auf. Beim Plus-Scan ist der Binomial Tree Scan um einiges langsamer. Das kann damit erklärt werden, dass die Operanden im Regelfall weit verstreut sind und so pro Operand eine Speichertransaktion nötig ist. Beim Workefficient Dataparallel Scan jedoch liegen die Operanden nebeneinander und profitieren von den Caches. Die $16 \times 16$-Matrix ist jedoch zu groß für eine Cache-Line und kann von diesem Umstand nicht profitieren. Ein zusätzlicher Grund ist der Umstand, dass bei der Matrixmultiplikation die $265$ Leseoperationen auf die Daten im Layer 3 Cache ausgeführt werden können und die Transaktionen auf den RAM in Relation zu Berechnungszeit einen geringen Anteil an der Gesamtlaufzeit haben. Daher sind bei der Matrixmultiplikation beide Algorithmen auf einem ähnlichem Geschwindigkeitsniveau.

Davon unabhängig kann man sagen, dass die Scans abhängig von dem Aufwand der Operation, bei etwa einer Million Elementen, die maximale Geschwindigkeit erreichen und halten. Je aufwändiger die Operation ist, desto niedriger liegt dieser Punkt.

### OpenCL-Ergebnisse

[sec:eval:ocl]

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/opencl~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/opencl~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/opencl~w~e~d~p~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/opencl~t~ex~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv;

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/opencl~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/opencl~s~im~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/opencl~w~e~d~p~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/opencl~t~ex~s~im~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv;

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/opencl~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/opencl~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/opencl~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/opencl~t~ex~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv;

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/opencl~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/opencl~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/opencl~w~e~d~p~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/opencl~t~ex~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv;

[plot:ocl:time]

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/opencl~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~w~e~d~p~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~t~ex~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/opencl~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~s~im~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~w~e~d~p~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~t~ex~s~im~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/opencl~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~t~ex~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/opencl~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~w~e~d~p~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~t~ex~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv;

[plot:ocl:speed]

In Abbilung [plot:ocl:time] sind die Laufzeiten und in [plot:ocl:speed] sind die Geschwindigkeiten der OpenCL-Scans zu sehen.

Vorweg muss angemerkt werden, dass wie in [sec:imp:ocl] erklärt wurde, die Vorbereitung der Hardware und der Laufzeitumgebung deutlich aufwändiger als z.B. bei CUDA ist. Das hat zur Folge, dass insbesondere Berechnungen mit kleiner Problemgröße einen vergleichsweise geringen Datendurchsatz erreichen. Bei größeren Berechnungen, die insgesamt mehr Zeit beanspruchen, hat die konstante Initialisierungsphase einen kleineren Einfluss.

Sehr gut zu sehen ist dieser Effekt, wenn man die Messwerte des Plus-Scan und die des Scans mit Matrixmultiplikation vergleicht. Bei den Scans mit Matrixmultiplikation ist die Laufzeit etwa $500\times$ länger als beim Plus-Scan. Auf diese Laufzeit hat, wie in Abbilung [plot:ocl:time] gut sichtbar, die Berechnung den größten Einfluss. Beim Plus-Scan jedoch ist der Anteil der Berechnungszeit an der Gesamtlaufzeit maximal $30 \%$.

Eine weitere Erkenntnis ist, dass sich das Kopieren der Daten in einen nur lesbaren Speicher beim OpenCL-API nicht rentiert. Wie aus Abbildung [plot:ocl:speed] abgelesen werden kann, bedeutet dieser zusätzliche Aufwand bei der Addition einen Geschwindigkeitsverlust von etwa $50\%$. Bei der Matrix-Multiplilation, bei der viele Leseoperationen pro Speicherstelle anfallen, hat sich dieser Effekt ausgeglichen. Erst bei Operationen, bei denen das Schreib-/Leseverhältnis noch extremer ist, kann mit einem Geschwindigkeitsgewinn gerechnet werden.

Die höchsten Geschwindigkeiten können mit dem Workefficient Dataparellel Scan erreicht werden. Der Nachteil dieses Algorithmus ist jedoch der Speicherverbrauch. Die Puffer benötigen in der Summe die gleiche Specherkapazität wie die Eingabedaten selbst. Daher sollte der Binomial Tree Algorithm verwendet werden, wenn die Eingabedaten größer als $1GiB$ sind. Bei Einem Plus-Scan auf bis zu $500.000$ können die höchsten Geschwindigkeit mit dem Simultaneous Binomial Tree Scan erreicht werden.

### CUDA-Ergebnisse

[sec:eval:cuda]

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/cuda~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/cuda~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/cuda~w~e~d~p~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/cuda~t~ex~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/cuda~t~ex~w~e~d~p~s~can~i~nt~a~dd.csv;

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/cuda~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/cuda~s~im~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/cuda~w~e~d~p~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/cuda~t~ex~s~im~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/cuda~t~ex~w~e~d~p~s~can~i~nt~a~dd~n~o~c~omm.csv;

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/cuda~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/cuda~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/cuda~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/cuda~t~ex~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/cuda~t~ex~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv;

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/cuda~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/cuda~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/cuda~w~e~d~p~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/cuda~t~ex~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=Time] data/max~p~ar/cuda~t~ex~w~e~d~p~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv;

[plot:cuda:time]

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/cuda~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~w~e~d~p~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~t~ex~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~t~ex~w~e~d~p~s~can~i~nt~a~dd.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/cuda~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~s~im~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~w~e~d~p~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~t~ex~s~im~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~t~ex~w~e~d~p~s~can~i~nt~a~dd~n~o~c~omm.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/cuda~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~t~ex~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~t~ex~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/cuda~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~w~e~d~p~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~t~ex~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~t~ex~w~e~d~p~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv;

[plot:cuda:speed]

Wie in Sektion [sec:imp:cuda] bereits erklärt wurde, müssen die Daten nicht in den Texturspeicher kopiert werden, sondern es muss der betreffende globale Speicher nur auf eine Texturstruktur gebunden werden. Diese Einsparung wirkt sich direkt auf die Geschwindigkeit der Programme aus.

Wie den Abbildungen [plot:cuda:time] und [plot:cuda:speed] entnommen werden kann, bedeutet die Nutzung der Texturspeicher bei der Integer-Addition eine Verminderung des Datendurchsatzes von bis zu $10\%$. Bei der Matrix-Multiplikation bedeutet sie jedoch eine Beschleunigung von etwa $50\%$. Die Geschwindigkeitsdifferenz der Operationen ist auch hier dem Verhältnis von Schreib- und Lesezugriffen geschuldet.

Wie auch schon bei den Implementierungen gegen das OpenCL-API liefert der Simultaneous Binomial Tree Algorithm vergleichsweise schlechte Ergebnisse. Das ist wieder auf die hohe Arbeitskomplexität zurück zu führen. Das Problem dabei sind nicht die vielen redundanten Rechenoperationen, denn durch die massive Parallelität und durch die Ausführung im Gleichschritt innerhalb des Warps, benötigen alle Iterationen in etwa gleich viel Zeit. Problematisch sind offenbar die daraus folgenden vielen Schreiboperationen. Dieser Scan kann offenbar nicht ausrechend von der effizienten Nutzung der Streaming Multiprocessors profitieren.

Auffallend ist die Steigerung der Geschwindigkeiten, der Matrixmultiplikations-Scans auf etwa $250.000$ Elemente, bei Binomial Tree Scan und Simultaneous Binomial Tree Scan. Die Laufzeit der Berrechnung ist von dieser Problemgröße, bis zum jeweiligen Maximum praktisch konstant. Eine Erklärung dafür kann an dieser Stelle nicht gegeben werden.

Das Fazit bei der Algorithmenwahl bezogen auf das CUDA-API, ist der Bewertung der OpenCL-Implementierungen ähnlich. Im Normalfall erhält man mit dem Workefficient Dataparallel Scan am schnellsten die Resultate. Sind viele Leseoperationen zu erwarten sollte Texturspeicher verwendet werden. Kommt dazu noch eine Problemgröße zwischen $50\%$ und $100\%$ des Grafikspeichers, liefert der Binomial Tree Algorithm gute Laufzeiten. Ist das Problem eine einfache Operation auf bis zu $100.000$ Elemente, so ist auch der Simultaneous Binomial Tree Scan eine gute Option.

### Ergebnisse mit PGI Accellerator Derectives

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/serial~n~aive~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/pgiacc~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/pgiacc~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=Time] data/max~p~ar/pgiacc~w~e~d~p~s~can~i~nt~a~dd.csv;

[xlabel=Vektorgröße, ylabel=Laufzeit ($\mu s$)] table[x=Size,y=Time] data/max~p~ar/serial~n~aive~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/pgiacc~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/pgiacc~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=Time] data/max~p~ar/pgiacc~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/serial~n~aive~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/pgiacc~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/pgiacc~s~im~b~in~t~ree~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/pgiacc~w~e~d~p~s~can~i~nt~a~dd.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/serial~n~aive~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/pgiacc~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/pgiacc~s~im~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/pgiacc~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv;

[plot:pgi]

Die Abbildung [plot:pgi] zeigt, dass die erreichten Geschwindigkeiten grundsätzlich sehr niedrig sind und mit den Geschwindigkeiten der Implementierungen gegen die anderen betrachteten APIs kaum konkurrieren können.

Die besten Resultate dabei erreichten der Binomial Tree Algorithm und der Workefficient Dataparallel Scan bei der Multiplikation auf Fließkomma-Matritzen, die bei $1 GiB$ Eingabedaten einen Speedup gegenüber der Referenzimplementierung von etwa $1,75$ erreichten.

Die in Sektion [sec:imp:pgi] vorgestellten Parameter zur optimierten Nutzung von Caches, zeigten weder beim Simultaneous Binomial Tree Scan, noch beim Workefficient Dataparallel Scan eine signifikante Beschleunigung der Ausführung.

Eine synchrone Implementierung des Simultaneous Binomial Tree Scan, bei der auf den zweiten Speicherbereich verzichtet werden kann, ließ sich nicht kompilieren.

Universeller Ergebnisvergleich nach Anwendungsfall
--------------------------------------------------

[sec:res:uni]

In dieser Sektion werden erst die Ergebnisse der Scans mit der Integer-Addition miteinander vergleichen. Im zweiten Teil wird der Fall betrachtet, in dem die aufwändige Matrixmultiplikation der Scan-Operator ist.

### Vergleich der Scans mit einfachen Operationen

Vergleicht man die Diagramme der Abbildungen [plot:int~a~dd], also die Ergebnisse der Scans inklusive und exklusive der Geräteinitialisierung und des Datentransfers, fällt noch einmal die Differenz der Ergebnisse von OpenCL- und CUDA-Implementierung auf. Diese Differenz bedeutet, dass die grundsätzlich schnellere OpenCL-Implememtierung erst eine geringere Laufzeit hat, wenn mehrere Scans auf die gleichen Daten ausgeführt werden und der Vektor mehr als 5 Millionen Elemente hat.

Hat der Vektor jedoch mehr als 250 Millionen Elemente, also mehr als $1 GiB$, dann liefert der Binomial Tree Algorithm mit dem CUDA-API die besten Ergebnisse auf Grafikkarten.

Bei den guten Resultaten der OpenMP-Implementierung sei darauf hingewiesen, dass diese Tests auf einem System mit $48$ Kernen ausgeführt wurde. Die Geschwindigkeiten bei weniger Kernen fallen entsprechend niedriger aus.

Auf Multicoresystemen kann grundsätzlich zum KRS-Algorithmus geraten werden.

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/serial~n~aive~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/openmp~n~aive~k~rs~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~w~e~d~p~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~w~e~d~p~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/pgiacc~w~e~d~p~s~can~i~nt~a~dd.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/serial~n~aive~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/openmp~n~aive~k~rs~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~w~e~d~p~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~w~e~d~p~s~can~i~nt~a~dd~n~o~c~omm.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/serial~n~aive~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/openmp~n~aive~k~rs~s~can~i~nt~a~dd.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~b~in~t~ree~s~can~i~nt~a~dd~n~o~c~omm.csv;

[plot:int~a~dd]

### Vergleich der Scans mit aufwändigen Operationen

Ein Geschwindigkeitsvergleich der APIs kann in den Abbildungen [plot:float] gefunden werden.

Bei der aufwändigen Matrixmultiplikation auf Fließkommazahlen kann die Ausführung durch den Einsatz von Texturspeichern beschleunigt werden. Davon profitieren vor allem die CUDA-Implementierungen aus bereits genannten Gründen. Dabei wird mit dem Workefficient Dataparallel Scan das beste Ergebnis erreicht. Es sei denn, die Problemgröße ist größer als 250 Millionen Elemente. In einem solche Szenario ist der Binomial Tree Scan vorzuziehen.

Im Vergleich von Abbildung [plot:int~a~dd] und [plot:float] wird klar, dass GPGPU-basierte Lösungen von einer aufwändigeren Operation stärker als multicorebasierte Systeme profitieren können.

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/serial~n~aive~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/openmp~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~t~ex~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/pgiacc~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/serial~n~aive~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/openmp~b~in~t~ree~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~w~e~d~p~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~t~ex~w~e~d~p~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv;

[xlabel=Vektorgröße, ylabel=Geschwindigkeit (E/s)] table[x=Size,y=EpS] data/max~p~ar/serial~n~aive~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/openmp~w~e~d~p~s~can~f~loat~m~atrix~m~ul.csv; table[x=Size,y=EpS] data/max~p~ar/opencl~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv; table[x=Size,y=EpS] data/max~p~ar/cuda~b~in~t~ree~s~can~f~loat~m~atrix~m~ul~n~o~c~omm.csv;

[plot:float]

Fazit
=====

[sec:con]

Das Ergebnis dieser Arbeit ist nicht die grundsätzliche Empfehlung für einen Algorithmus, der das volle Potenzial moderner Prozessoren ausschöpfen könnte. Vielmehr sollte der konkrete Anwendungsfall, vor dem Hindergrund der hier beschriebenen Erkenntnisse, geprüft werden. Dabei sollten die Kriterien, wie Zahl und Art der Prozessoren, die Speicherarchtitektur des Systems und im Besonderen die Operation des Scans selbst in den Entscheidungsprozess eingebracht werden.

Es hat sich gezeigt, dass die Arbeitskomplexität einen beträchtlichen Einfluss auf die Laufzeiten hat und eine höhere Schrittkomplexität unter Umständen in den Hintergrund rücken kann. Diese Tatsache kann man aus den diversen Vergleichen zwischen Simultaneous Binomial Tree und den anderen Varianten des Binomial Tree Scan schliessen, denn nur bei den Plus-Scans auf GPGPU-Systemen bis etwa $100.000$ Elementen, konnte der Simultaneous Binomial Tree die besten Ergebnisse liefern.

Bezüglich der Algorithmusverbesserungen, wie dem Workefficient Dataparallel Scan oder den Varianten, die den Texturspeicher ausnutzen, ist das Ergebnis, dass diese nicht grundsätzlich schneller arbeiten. Einige Algorithmusverbesserungen zeigen nur in gewissen Grenzen der Vektorlängen den gewünschten Effekt. Andere wie z.B. die Verwendung von Texturspeichern bedeutet einen Mehraufwand, der erst wieder mit vielen Lesezugriffen eingespart werden muss.

Auch die Organisation der Daten ist von großer Bedeutung. Können bei Algorithmen wie dem Workefficient Dataparallel Algorithm mehrere Elemente mit einer Speichertransaktion in den Cache aufgenommen werden, kann das erhebliche Laufzeitverbesserungen bedeuten.

Eine weitere Erkenntnis ist, dass das Präfixproblem nicht für Multicore- oder für Manycore-Systeme prädestiniert ist, sondern mit beiden Rechnerkategorien effizient gelöst werden kann.

Ausblick
--------

[sec:con:fut]

Wie sich die erreichbaren Geschwindigkeiten in der Zukunft entwickeln, bleibt offen, wobei die fast linearen Speedupkurven der OpenMP-Implementierungen Hoffnung auf weiteren Speedup durch mehr Rechenkerne wecken. Die GPGPU-Implementierun"-gen könnten durch eine verbesserte Speicheranbindung sicherlich noch geringere Laufzeiten erreichen. In einem solchen Szenario würde vermutlich insbesondere der Simultaneous Binomial Tree Scan profitieren. Die Geschwindigkeitsentwicklung bei aufwändigen CUDA-Scans hingegen, würde sich vermutlich bei einem größeren Grafikspeicher fortsetzen.

In Anwendungen werden oft mehrere verschiedene Scans mit verschiedenen Operationen sequentiell ausgeführt. Im Besonderen für Scans, deren Daten nicht komplett in den Speicher der Grafikkarten passen, wäre es interessant, ein Verfahren mit minimaler Kommunikation zwischen Host und Grafikkarte anzuwenden. Dabei könnten asynchroner Datentransfer und Scans von Chunks geprüft werden. Es sollte auch geklärt werden, unter welchen Bedingungen diese verschiedenen Scans parallel oder zeitlich verschoben ausgeführt werden können. Unter diesem Aspekt wären auch die Scan-Algorithmen neu zu bewerten, denn beispielsweise beim Simultaneous Binomial Tree Scan stehen die Endergebnisse einzelner Datenelemente früher fest, als beim Binoial Tree Algorithm.

Ein weiterer Aspekt, der in dieser Arbeit nicht weiter verfolgt wurde, ist der, dass beim OpenCL-API mehrere verschiedene *devices* zugleich angesprochen werden können. Beispielsweise könnten die Multicore-CPU und die (verschiedenen) Grafikkarte(n) gemeinsam arbeiten. So ein Zusammenspiel wirft wiederum Probleme bezüglich der Datenaufteilung oder der Datenlokalität auf. Eine Beschleunigung der Berechnung ist aber sicherlich nicht ausgeschlossen.

Quellcode und Messwerte {.unnumbered}
=======================

[sec:disc]

Sämtliche Daten dieser Arbeit befinden sich auf dieser CD-ROM, sowie unter der URL <http://www2.inf.h-bonn-rhein-sieg.de/~skampm2s/>.

Dazu gehören:

-   Quelltexte, Benutzer-Anleitung und Lizenztext der Bibliothek.

-   Messwerte, Skripte der Tests.

-   Entwicklungsdateien dieses Dokumentes und dieses Dokument im PDF.

-   Die Literatur dieser Arbeit, sofern diese frei verfügbar ist.


