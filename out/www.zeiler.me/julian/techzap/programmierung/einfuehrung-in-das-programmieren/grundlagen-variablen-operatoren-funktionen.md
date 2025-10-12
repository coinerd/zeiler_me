# ZEILER .me - IT & Medien, Geschichte, Deutsch - Einführung in die Programmierung - Kapitel 1: Die Grundlagen

Sie würden gerne den Computer programmieren sind aber durch die Vielzahl an Fachausdrücken und Programmiertheorien eingeschüchtert? Dann machen Sie es sich in Ihrem Stuhl bequem und freuen Sie sich auf eine Einführung, die jeder versteht.

## 

Variablen oder "Wie der Computer sich etwas merkt"

Eine Computer-Anwendung (ein Programm) verarbeitet Informationen. Ein Schreibprogramm wie Microsoft Word oder OpenOffice.org arbeitet mit den Wörtern die Sie eintippen, mit Überschriften oder auch mit Fußnoten, welche auf jeder Seite erscheinen sollen. Diese Informationen werden vom Computer gespeichert und zwar in sogenannten Variablen. Eine Variable ist ein Speicherbereich im Computer auf den zum Beispiel der Text geschrieben wird, den Sie gerade als Überschrift markiert haben. Dieser Speicherbereich bekommt einen Namen, damit man ihn später wiederfindet. Der Variablenname ist also der Name für eine Information, die zuvor gespeichert wurde.

Eine Variable kann auch mehrere Informationen auf einmal beinhalten, Untervariablen sozusagen. Stellen Sie sich Ihre Überschrift als ein Objekt vor, in dem folgendes gespeichert wird: Der Text der Überschrift, die Schriftgröße und die Ausrichtung des Textes (also Links, Rechts oder Mitte). In diesem Objekt haben wir also drei Informationen, die in Variablen gespeichert werden. Dieses Objekt weist man nun einer weiteren Variablen zu. Dieser Ansatz stellt bereits einen kleinen Abstecher in die Objektorientierung dar.

## 

Operatoren oder "Wie der Computer kopfrechnet"

Computerprogramme verarbeiten Informationen, die in Variablen gespeichert werden. So weit sind wir jetzt. Doch wie rechnet er mit diesen Informationen? Hierfür stellt die Programmiersprache, in der Sie das Programm schreiben, Zeichen bereit wie +, -, % oder \*, die sie noch aus dem Schulunterricht kennen oder Wörter wie power (potenz), concat (Zeichenfolgen zusammenfügen) oder trim (Leerzeichen vor oder nach einer Zeichenkette wie z.B einem Satz entfernen).

Um dem Computer zu sagen "Rechne mal aus was 52327 + 29372 ist", schreiben Sie ganz einfach die erste Zahl (die auch eine Variable sein kann), dann den Operator + und dann die zweite Zahl, die wiederum auch eine Variable sein kann:

52327 + 29372

So, nun wollen wir diese Information speichern. Und das geht wie? Genau, mit einer Variablen (nennen wir sie hier ergebnis). Also schreiben wir z.B.:

ergebnis = 52327 + 29372

Wenn wir dieses Ergebnis nun noch mit 23 multiplizieren wollen, schreiben wir wiederum:

ergebnis \* 23

Und wenn wir diese Berechnung auch speichern wollen (z.B. in endresultat):

endresultat = ergebnis \* 23

Nun haben wir zwei Zahlen zusammengezählt und dieses Ergebnis - diese Information - weiterverarbeitet, indem wir sie in einer Variablen gespeichert und anschließend mit einer weiteren Zahl multipliziert haben. Die eigentliche Informationsverarbeitung in einem Computerprogramm findet also mit den Operatoren der verwendeten Programmiersprache statt.

## 

Kontrollstrukturen oder "Wie der Computer Entscheidungen trifft"

Manchmal gibt es Momente in denen der Computer in Abhängigkeit von Informationen, die er entweder vom Anwender bekommen oder die er selbst berechnet hat, entscheiden muss wie er weiter vorzugehen hat.

So kommt es auf Webseiten, welche häufig ebenfalls programmiert werden, z.B. vor, dass automatisch ein Einführungstext auf Basis des Haupttextes des eigentlichen Artikels erstellt wird. Soll dieser Einführungstext nicht länger als 200 Zeichen sein, so würde man zunächst die Artikellänge berechnen und anschließend den Text kürzen, wenn dieser länger als 200 Zeichen ist. Die Bedingung lautet also:

Wenn Artikellänge größer 200 Zeichen dann kürze Text auf 200 Zeichen

Der Wenn-Dann Teil des obigen sogenannten Pseudocodes ist eine Kontrollstruktur. Das heißt dass der Computer aufgrund einer Bedingung eine Berechnung oder Informationsverarbeitung durchführt oder eben auch nicht. Mit Kontrollstrukturen kann man dem Computer auch mitteilen, dass er bestimmte Berechnungen mehrmals durchführen soll, bis eine bestimmte Bedingung erfüllt ist.

## 

Funktionen oder "Wie der Computer sich Vorgehensweisen merkt"

Kommen wir nochmal auf das Beispiel des Schreibprogrammes zurück. Angenommen Sie haben eine Reihe von Anweisungen geschrieben, die eine Überschrift speichern und diese formatiert ausgeben. Sie könnten diese nun jedesmal wiederholen, wenn Sie eine neue Überschrift verarbeiten wollen. Einfacher wäre es aber doch, jedesmal die einmal geschriebenen Anweisungen auszuführen, nur eben mit einem anderen Text, einer anderen Schriftgröße und einer anderen Textausrichtung. Hier kommen die Funktionen ins Spiel.

Funktionen sind so eine Art Variablen für mehrere Anweisungen (Algorithmen). Man bennent seine Anweisungen und greift auf deren Namen einfach an der Stelle des Programmes zu, wo man sie benötigt. Man muss sie also nicht jedes Mal neu eingeben. Den Funktionen werden oft Werte oder Variablen übergeben, mit denen sie dann arbeiten. Eine Funktion könnte in Pseudocode wie folgt dargestellt werden:

formatiere\_ueberschrift mit text, schriftgroesse, ausrichtung:

Wenn ausrichtung gleich links:

schreibe text in Größe schriftgroesse

Ansonsten, wenn ausrichtung gleich rechts:

schreibe 30 Leerzeichen und schreibe text in Größe schriftgroesse

Ansonsten:

schreibe 15 Leerzeichen und schreibe text in Größe schriftgroesse

Ende von formatiere\_ueberschrift

Aufgerufen würde diese Funktion dann mittels:

formatiere\_ueberschrift mit "Einführung in die Programmierung", 15 Punkt, links

Somit kann man sich die einzelnen Anweisungen bei jeder Überschrift sparen und einfach die Funktion aufrufen.