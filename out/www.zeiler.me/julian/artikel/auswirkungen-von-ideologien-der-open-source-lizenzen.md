# ZEILER .me - IT & Medien, Geschichte, Deutsch - Auswirkungen von Ideologien der Open Source Lizenzen

Linux ist Open Source. Das wissen wohl die meisten, die schon einmal von diesem Betriebssystem gehört haben. Vielleicht haben einige auch schon von der General Public License (GPL) gehört, der Lizenz, unter der ein großer Anteil der Open Source Software - auch Linux - veröffentlicht wurde und wird. Aber welche Auswirkungen diese und andere Lizenzen für Autoren, Entwickler und Anwender dieser Programme (oder auch Programmteile - so genannte Bibliotheken) haben, darüber wissen die Wenigsten Bescheid. Dieser Beitrag soll diesen Mißstand ausgleichen. Es wird über die verbreitetsten Lizenzmodelle im Open Source Bereich berichtet und deren Auswirkungen für Anwender und Programmierer aufgezeigt.

## 

Die Macht der Freiheit...

2001 - zehn Jahre nach Freigabe des ersten Linux Kernels - bemerkt auch Microsoft, wie wichtig inzwischen Open Source Software geworden ist und beginnt sich mit diesem Phänomen zu beschäftigen. Grund dafür war sicherlich das immer weiter zunehmende Interesse an Linux in den Medien, aber auch dass sich sich Netscape entschloss mit dem Mozilla Projekt Ihren beliebten Internet Browser quelloffen zur Verfügung zu stellen: Ein Projekt, aus dem inzwischen der beliebte Firefox entstanden ist.

## 

... und alle Macht der GPL

Was Microsoft an der Open Source Bewegung missfallen hat, war die Art, mit der die GPL - die verbreitetste Open Source Lizenz - versucht die Software Welt nach ihren Vorstellunge (um) zu formen. So darf eine unter die GPL gestellte Software oder Programmroutine nicht von anderen Programmen benutzt werden, wenn diese nicht auch unter der GPL stehen. Auch ein Abändern der Software ist nur möglich, wenn das Resultat wieder unter der GPL steht.

## 

Die Software-Anarchie

Begründer der GPL ist Richard Stallman, ein Anarchist, der sich jedoch auf die Software-Welt begrenzt. Seiner Meinung nach gibt es so etwas wie geistiges Eigentum nicht. Er bezeichnet diejenigen, die sich das Recht vorbehalten ihre Software nicht jedermann im Quelltext auszuhändigen, als Diebe an der Allgemeinheit. Stallmans Ansichten sind sicherlich interessant und klingen verlockend für den angehenden Programmierer, der sein erstes Projekt als Open Source veröffentlichen will. Welche Auswirkungen diese Lizenz hat, ist jedoch den wenigsten Einsteigern bekannt.

## 

Die Alternativen

Die GPL ist jedoch nicht die Älteste "freie" Lizenz und schon gar nicht die einzige. Schon 1979 - knappe zehn Jahre vor der GPL - wurde die BSD-Lizenz für das erste lizenzrechtlich freie Unix ins Leben gerufen. Diese Lizenz verlangt lediglich die Nennung des ursprünglichen Autors - in diesem Fall der Berkeley Software Distribution (BSD) - , wenn abgeleitete Software erstellt und verbreitet wird. Werke, die von Software unter der BSD-Lizenz abgeleitet werden, können unter jeder beliebigen freien oder nicht freien Lizenz veröffentlicht werden. Die Bedingung, dass der ursprüngliche Autor genannt werden soll, entspricht dem universitären Usus der Anerkennung geleisteter Arbeit. Stallman verdammt diesen Ansatz. Software, die unter der GPL steht, kann einfach kopiert und unter neuem Namen neu (unter der GPL) veröffentlicht werden. Sie gehört so zu sagen der "Community".

## 

Wer nutzt welche Lizenz?

Anerkannte professionelle Programmierer und akademische Forscher favorisieren eher eine BSD-artige Lizenz. So zum Beispiel Donald E. Knuth, der mit TeX einen Standard für Zeichensetzungssysteme im universitären Bereich erschaffen hat. Er verlangt nur, dass ein von TeX abgeleitetes Werk nicht TeX genannt werden soll. Studenten, die mit ihren Programmen die Massen ansprechen wollen und die den großen Softwarekonzernen eins auswischen wollen, setzen eher auf die GPL. Die Wahl der Lizenz hängt jedoch häufig einfach davon ab, zu welcher Community der Programmierer dazugehören will. Stammt er eher aus dem GPL-lastigen Linuxbereich, wählt er in der Regel die GPL, kommt er aus dem BSD-Lager, wählt er eine BSD-artige Lizenz.

## 

Der Begriff "Open Source"

Da der Begriff "freie Software" - vor allem durch Stallmans Free Software Foundation - zu ideologisch belastet war, beschlossen Tim O'Reilley, Eric S. Raymond und Bruce Perens einen neuen marketingtauglicheren Begriff zu erfinden: Open Source. Gleichzeitig gründeten sie die Open Source Inititiative (OSI), aus der auch die Mozilla Public License entstand, die zum Beispiel der Firefox Browser verwendet.

## 

Komplexität der Lizenzmodelle

Um Stallmans Ideologie "freier Software" umzusetzen, benötigte er eine komplexe Lizenzvereinbarung, die demnächst in der dritten Version erscheinen wird. Während die BSD-Lizenz mit ungefähr 500 Wörtern auskommt, hat die GPL in Version zwei weit über 2000 Wörter. Daraus ergeben sich oft Szenarien, bei denen der Programmierer nicht mehr weiß, wie diese Lizenz nun auszulegen ist.

## 

Die Doppel-Lizenz

Um einerseits die Gunst der Open Source Jünger zu gewinnen und die Vorteile von quelloffener Software zu genießen, aber gleichzeitig die Möglichkeit zu haben, mit dem eigenen Programm Geld zu verdienen, setzen viele Firmen auf zwei Lizenzen. Eine gewährleistet, dass die "Community" Zugriff auf den Quelltext hat, die andere schließt in der Regel ein Servicepaket ein und richtet sich an andere Firmen. Diese - so der Gedanke - müssen dann zahlen, entweder um das Programm überhaupt kommerziell einsetzen zu dürfen, oder um Support zu bekommen.

## 

Sieg der Entropie

Geld wird inzwischen auch mit Open Source Software gemacht. Das kann und will die GPL auch gar nicht verhindern. Ihr Ziel ist es, jedem Programmierer und jedem Anwender Zugang zu jeder Software zu geben. Ein nobles Ziel, welches sie aber nicht erreicht und nie erreichen wird. Statt dessen überfordert sie Entwickler und Distributoren gleichermaßen mit Ihrer Komplexität und den tausenden von möglichen rechtlichen Szenarios. Sie ist eine Lizenz für Juristen, die Spaß am Austüfteln von verzwickten Situationen haben, und nicht - was sie eigentlich sein sollte - eine Lizenz für Programmierer und Firmen, die einfachen Zugang zu den Quelltexten ihrer Programme ermöglichen wollen.

## 

Dunkle Gedankenspiele

Zum Abschluss will ich einmal gedanklich ein Szenario durchspielen, in dem wichtige Komponenten des Internets unter der GPL stehen sollen. Denken Sie Microsoft hätte den TCP-IP Stack von einem BSD-System übernommen, wenn dieser unter der GPL gestanden hätte? Hätte die Firma Microsoft deshalb Windows auch unter die GPL gestellt und jedem die Möglichkeit gegeben ihr Betriebssystem zu kopieren? Nein, vermutlich würden wir heute nicht über das Internet kommunizieren, sondern über MSN und AOL eigene Netze. Vermutlich würde das Internet weiter nur im universitären Bereich existieren. Ein Glück für uns, dass Innovationen meist nicht unter die GPL gestellt werden. Auch IBM & Co veröffentlichen nur Software unter der GPL, die es seit Jahren schon in professionellen Betriebssystemen und Programmen gibt. Die Anwendungen, die inzwischen weit verbreitet sind, und nichts wirklich Neues.

*Dieser Eintrag wurde geschrieben von Julian Zeiler am Freitag, 23. Juni 2006 um 22:53.*