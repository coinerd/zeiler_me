# ZEILER .me - IT & Medien, Geschichte, Deutsch - Perl Einzeiler: Suchen und Ersetzen in Dateien

## 

Problem: In Dateien soll mit einem einzeiligen Perl-Befehl eine Zeichenfolge durch eine andere ersetzt werden und das Ergebnis wieder in die jeweilige Datei gespeichert werden.

Mit Hilfe von Perl-Einzeilern lassen sich eine Menge Probleme lösen. So auch das oben geschilderte "Suchen und Ersetzen" Problem. Dabei kann der Befehl für eine oder mehrere Dateien verwendet werden.

## 

Lösung: perl -p -i.bak -e "~s|suchen|ersetzen|" datei1.txt datei2.txt datei3.txt

Mit Hilfe des -e Parameters wird perl angewiesen, das Script direkt von der Kommandozeile einzulesen. Somit lassen sich wunderbar einzeilige Skripte in Perl erstellen.

Der -p Parameter gibt an, dass über die Eingabedatei eine Schleife für jede Zeile gelegt werden soll und diese einzeln ausgegeben werden sollen.

Mit -i.bak gibt man an, dass die Datei beim editieren direkt wieder gespeichert wird. .bak steht hierbei für die Endung die für die Sicherheitskopien der Originaldateien verwendet werden soll. Unter Unix/Linux ist es möglich diese wegzulassen und nur -i anzugeben. Unter Windows ist dies jedoch leider nicht möglich.

Die Kommandozeile lautet also:

perl -p -i.bak -e "~s|suchen|ersetzen|" datei1.txt datei2.txt datei3.txt

Unter Unix/Linux ist es hier wiederum möglich mehrere Dateien durch \*.txt oder \*.html für txt- bzw. html-Dateien anzugeben unter Windows müssen die Dateien leider einzeln angegeben werden.

Somit haben wir die drei Dateien datei1.txt, datei2.txt und datei3.txt nach "suchen" durchsucht und jedes Vorkommen durch "ersetzen" ersetzt. Dabei wurden die drei Backup-Dateien datei1.txt.bak, datei2.txt.bak und datei3.txt.bak erstellt, die die Originaldaten als Sicherungskopien enthalten.