# COOLbackend

Backend for www.ChessOpenings.OnLine

MySQL database met verbinding via MySQL Workbench en MySQL commandline.
Database Dummy met tables: Gebruiker en Dummy.
- Nieuwe gebruiker moet zich per e-mail aan pvdiepen@gmail.nl bekend maken.
- PvD zet e-mail in Gebruiker en stuurt e-mail met JSON Web Token.
- REST api met JSON voor COOLfrontend.
- Bekende gebruiker mag Dummy records toevoegen en bijwerken.
Zo veel mogelijk code in MySQL. De rest in node.js.

Verder nginx en ubuntu 18.04. LTS (zelfde als voor www.AAAPPP.nl)
