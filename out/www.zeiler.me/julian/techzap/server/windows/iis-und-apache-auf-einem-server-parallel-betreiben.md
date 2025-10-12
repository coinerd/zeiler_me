# ZEILER .me - IT & Medien, Geschichte, Deutsch - IIS und Apache auf einem Server parallel betreiben

## 

Problem: IIS und Apache sollen auf einem Server parallel betrieben werden

Um die Web-Server IIS und Apache parallel betreiben zu können, muss ein Server, in diesem Fall Apache, alle HTTP-Anfragen annehmen und diese bei bestimmten Webseiten an den anderen Server, in diesem Fall IIS, weiterleiten bzw. diese durchschleifen.

## 

Lösung:

Möglich wird der Parallelbetrieb von IIS und Apache dadurch, dass Apache als Proxy für einige Domains (Virtual hosts) fungiert.

Hierfür muss das Proxymodul in der httpd.conf Konfigurationsdatei aktiviert werden. Das geschieht durch das Entfernen der Kommentarzeichen (#) vor den folgenden Zeilen bzw. durch einfügen dieser Zeilen in der httpd.conf Datei, die sich im Ordner \\conf\\ unterhalb des Apache-Installationspfads befindet:

LoadModule proxy\_module modules/mod\_proxy.so

LoadModule proxy\_http\_module modules/mod\_proxy\_http.so

Anschließend muss für die Domains, die IIS ausliefern soll ein <VirtualHost> Bereich in die Datei \\conf\\extra\\httpd-vhosts.conf eingefügt werden, der folgendermaßen aufgebaut ist:

<VirtualHost 192.168.0.1:80>

ServerAdmin admin@ihredomain.de

ServerName ihredomain.de

ErrorLog logs/ihredomain.de-error\_log

CustomLog logs/ihredomain.de-access\_log common

\# Avoid open you server to proxying

ProxyRequests Off

\# Let apache correctly rewrite redirect

ProxyPassReverse / http://127.0.0.1:80/

\# Let apache pass the original host not the ProxyPass one

ProxyPreserveHost On

RewriteEngine on

RewriteRule ^(.\*) http://127.0.0.1:80$1 \[P\]

</VirtualHost>

Dabei müssen Sie jeweils ihredomain.de durch Ihre Domain-Adresse ersetzen und 192.168.0.1 durch die IP-Adresse des Servers. Achten Sie darauf, dass Sie unter NameVirtualHost ebenfalls 192.168.0.1:80 bzw. eben Ihre IP-Adresse angeben müssen.

Nun muss IIS nur noch so eingerichtet werden, dass die entsprechende Webseite auf 127.0.0.1 Port 80 ausgeliefert wird. Hierfür können Sie einfach über den IIS Manager unter den Eigenschaften der gewünschten Webseite die IP-Adresse 127.0.0.1 und der Port 80 einstellen.

Natürlich darf Apache nicht auch auf 127.0.0.1 Port 80 lauschen. Deshalb sollte in der httpd.conf explizit die IP-Adresse Ihres Servers angegeben werden:

Listen 192.168.0.1:80

Wobei Sie 192.168.0.1 einfach durch die IP-Adresse Ihres Servers ersetzen.

Falls IIS versucht auf alle verfügbaren IPs (also auch die Server-IP) zu binden, beachten Sie bitte den folgenden Artikel:

[Problem: IIS bindet nur an bestimmte IP-Adressen oder an alle vorhandenen](https://www.zeiler.me/listenonlylist-registry-werte-iis-an-ip-binden.html)