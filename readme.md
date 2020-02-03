 # Willkommen bei der Arbeitszeiterfassung. 
 
 ## Das Projekt befindet sich auf Glitch.com
 - Accountname julian-ha
 - Projektname hierfür ist cuddly-jackfruit
 
 ## Zus Ausführung notwendigen Anweisungen
 
 
 # Vorab Information
 Für die Umsetzung wurde eine MySQL Datenbank verwendet, die sich auf unserem Webserver befindet.
 Die Zugangsdaten hierfür sind:
 - Link
 - Benutzername:
 - Passwort:
 - Datenbankname: k121749_Web_Scharle
 

# Vorab, welche Funktionen aus Aufgabe 3 eingebunden wurden.
- Eine grafische Oberfläche
- Das Anlegen und Verwalten von Projekten und Kunden
- Das Speichern und Verwalten von Stundensätzen je Kunde
- Rechnungserstellung für Kunden/ jeden Arbeitsauftrag

## zusätzlich: 
- die Verwaltung von Mitarbeitern
- Zuweisung eines Projekts zu einem Kunden




# Genauere Erläuterung

In diesem Programm können Mitarbeiter, Kunden sowie Projekte angelegt sowie gepflegt werden.
Auf das löschen dieser Daten wurde verzichtet, da diese teilweise in Verbindung stehen und so andere Daten unbrauchbar gemacht werden könnten.
Gelöst werden könnten dies mit einem Datenbankenfeld für die Aktivität bzw is_active.

Arbeitszeiten können über das Formular auf der Startseite ausgefüllt werden. 
Die hierfür notwendigen Daten (Mitarbeiter, Kunde, Projekt) werden aus der Datenbank geladen.
Es werden auch nur Projekte des voraus gewählten Kunden angezeigt.

Arbeitszeiten können auf dem Reiter Verwaltung - Arbeitszeiten eingesehen werden. Am Ende der Tabelle ist immer ein Feld zur Erstellung der Rechung
für den spezifischen Arbeitsauftrag.
Je nachdem ob der Kunde nach jedem Auftrag Quartalsweise eine Rechnung erstellt haben möchte werden alle Rechnungspositionen aufgelistet.


Alle Preise auf der Seite sowie auf den Rechnungen beinhalten schon die Fahrtkostenpauschale.
Diese beträgt 0.25€ pro gefahreren Kilometer.




# Vorgehensweise:
- Erstellung einer MySQL Datenbank zur Seicherung der generierten Daten des Arbeitszeitprogramms
- Erstellung von Mitarbeitern, Kunden und Projekten, Layout sowie Routen mit Abspeicherung in Datenbank
- Verwaltung von Mitarbeitern, Kunden und Projekten, Layout sowie Routen mit Abspeicherung in Datenbank
- Erstellung Layout der Arbeitszeiterfassung
- Speicherung der Arbeitszeit in der Datenbank
- Überprüfung der im Arbeitszeitformular übertragenen Daten
- Erstellung Übersichtsseite der Arbeitszeiten
- Rechnungserstellung
