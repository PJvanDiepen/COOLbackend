use waagtoren; -- ga naar TODO

-- personen
select * from persoon order by knsbNummer;

update persoon set naam = "Adnan Basmaij" where knsbNummer = 153;

insert into persoon (knsbNummer, naam) values
(181, "Jack"),
(182, "Hugo"),
(183, "Semih Yavuz"),
(184, "Tiju Badrinath"),
(185, "Thomas"),
(186, "Olivia Pieterse"),
(187, "Rolando"),
(188, "Liam van Kuijeren - Jansen");

-- teams
insert into team (clubCode, seizoen, teamCode, reglement, bond, poule, omschrijving, borden, teamleider) values
(1, "2309", "ije", 0, "i", "je", "jeugd competitie", 0, 0),
(1, "2401", "ije", 0, "i", "je", "jeugd competitie", 0, 0);

-- ronden
insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(1, "2309", "ije", 1, "t", "", '2023-09-08'),
(1, "2309", "ije", 2, "t", "", '2023-09-15'),
(1, "2309", "ije", 3, "t", "", '2023-09-22'),
(1, "2309", "ije", 4, "t", "", '2023-09-29'),
(1, "2309", "ije", 5, "t", "", '2023-10-06'),
(1, "2309", "ije", 6, "t", "", '2023-10-13'),
(1, "2309", "ije", 7, "t", "", '2023-11-03'),
(1, "2309", "ije", 8, "t", "", '2023-11-10'),
(1, "2309", "ije", 9, "t", "", '2023-11-17'),
(1, "2309", "ije", 10, "t", "", '2023-11-24'),
(1, "2309", "ije", 11, "t", "", '2023-12-01'),
(1, "2309", "ije", 12, "t", "", '2023-12-08');

-- spelers TODO conversie 0-0-0.nl 0.8.61
select * from speler where clubCode = 0 and seizoen = "2324" and intern1 = "ije" and intern2 <> "int"; 

select naam, s.* from speler s join persoon p on s.knsbNummer = p.knsbNummer
where clubCode = 0 and seizoen = "2324" and intern1 = "ije" and intern2 = "int"; 

select naam, s.* from speler s join persoon p on s.knsbNummer = p.knsbNummer
where clubCode = 0 and seizoen = "2324" and intern1 = "ije" and (intern2 = "ira" or intern3 = "ira");

select naam, s.* from speler s join persoon p on s.knsbNummer = p.knsbNummer
where clubCode = 1 and seizoen = "2309";

-- uitslagen
select * from uitslag where clubCode = 0 and seizoen = "2324" and teamCode = "ije"
order by rondeNummer, bordNummer; 

update uitslag set clubCode = 1, seizoen = "2309" 
where clubCode = 0 and seizoen = "2324" and teamCode = "ije"; 
