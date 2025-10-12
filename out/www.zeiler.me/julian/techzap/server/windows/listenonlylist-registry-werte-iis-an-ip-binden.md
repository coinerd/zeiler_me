# ZEILER .me - IT & Medien, Geschichte, Deutsch - ListenOnlyList Registry Werte - IIS an IP binden

## 

Problem: IIS bindet nur an bestimmte IP-Adressen oder an alle vorhandenen

Wenn IIS auf einem bestimmten Port auf Anfragen reagieren soll, bindet er in der Regel an alle vorhandenen IP-Adressen. Die folgende Lösung zeigt, wie man IIS über den Registry Schlüssel ListenOnlyList so einstellen kann, dass er nur noch auf einer IP-Adresse antwortet.

## 

Lösung:

Mit Hilfe des netstat Kommandos können Sie sich anzeigen lassen, welche Dienste an welche IPs binden und auf welchem Port Sie auf Anfragen reagieren.

Um zu sehen, welche Dienste z.B. auf den Ports 80 oder 443 lauschen, geben Sie bitte folgendes Kommando auf der Windows Eingabeaufforderung (Start -> Ausführen -> cmd eingeben und auf OK klicken) ein:

netstat -ano

Sie bekommen eine Liste IPs mit Ports angezeigt, die durch einen Doppelpunkt (:) voneinander getrennt sind. Wenn auf der IP und dem Port auf dem Sie den IIS konfigurieren wollen bereits ein anderer Dienst lauscht, so müssen Sie diesen zunächst beenden oder anders konfigurieren.

Wenn die Ports nicht verwendet werden, suchen Sie in der Registry nach der mehrzeiligen Zeichenfolge ListenOnlyList:

-   Klicken Sie dafür auf Start -> Ausführen -> Geben Sie regedit ein und klicken Sie auf OK.
-   Suchen Sie im Registrierungs-Editor nach dem Schlüssel HKEY\_LOCAL\_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\HTTP\\Parameters\\ListenOnlyList
-   Wenn dieser nicht existiert, legen Sie ihn als mehrteilige Zeichenfolge mit dem Namen ListenOnlyList unterhalb von Parameters an.
-   Ändern Sie nun den Wert von ListenOnlyList und geben Sie in jeder Zeile eine IP-Adresse an, auf der IIS konfiguriert werden soll.

Starten Sie nun den IIS neu (z.B. über "net stop http /y" und ein darauf folgendes "net start w3svc" in der Windows Eingabeaufforderung) und richten Sie die entsprechende Webseite im IIS-Manager über einen Rechtsklick auf die Webseite -> Eigenschaften ein.