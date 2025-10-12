# ZEILER .me - IT & Medien, Geschichte, Deutsch - Mit grep Zeilen entfernen, die in zwei Dateien doppelt vorkommen

## 

Problem: Es sollen zwei Dateien verglichen werden und dabei alle Zeilen der ersten Datei, die ebenfalls in der zweiten Datei vorkommen, entfernt werden.

Der Unix / Linux Befehl grep wird meistens dafür verwendet nach einem bestimmten Ausdruck zu filtern. Man kann ihn jedoch auch mit Ausdrücken füttern, die nicht vorkommen sollen.

Bei unserem Problem benötigen wir diese Funktion, denn wir wollen alle Zeilen aus Datei A, die nicht ebenfalls in Datei B vorkommen ausgeben lassen.

## 

Lösung: Mit grep -vxf Datei\_B.txt Datei\_A.txt die gesuchten Zeilen finden

Um Zeilen rauszuschmeißen, die in Datei\_A.txt und ebenfalls in Datei\_B.txt vorkommen, verwenden wir folgenden Befehl:

grep -vxf Datei\_B.txt Datei\_A.txt

Die Kommandooption -v steht hierbei für das umkehren der Treffer, d.h. nur Zeilen aus Datei\_A.txt, die nicht in Datei\_B.txt vorkommen gelten als Treffer.

Die Kommandooption -x gibt an, dass jeweils die ganze Zeilen verglichen werden.

Mit der Kommandooption -f lesen wir die Ausdrücke aus der Datei Datei\_B.txt ein.

Somit wurde das Problem mit einem einzigen kurzen grep-Befehl gelöst.