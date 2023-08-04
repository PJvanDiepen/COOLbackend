use waagtoren; -- ga naar TODO

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
("2324", "", "", "", "geen", 0, 0),
("2324", "int", "i", "nt", "interne competitie", 0, 0),
("2324", "ira", "i", "ra", "rapid competitie", 0, 0);

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
("2324", "1", "k", "m", "KNSB meester", 10, 6214153), -- Jan Poland TODO 9 augustus 2023
("2324", "2", "k", "3c", "KNSB 3d", 8, 7129991), -- Gerard de Geus
("2324", "3", "k", "4d", "KNSB 4d", 8, 7758014), -- Alex Albrecht
("2324", "4", "k", "6c", "KNSB 6c", 8, 6212404), -- Peter van Diepen
("2324", "kbe", "k", "be", "KNSB beker", 4, 6214153), -- Jan Poland
("2324", "n1", "n", "t", "NHSB top", 8, 7428960), -- Frank Agter
("2324", "n2", "n", "1a", "NHSB 1a", 8, 7529522), -- Willem Meyles
("2324", "n3", "n", "2b", "NHSB 2b", 6, 6214153), -- Jan Poland
("2324", "nbe", "n", "be", "NHSB beker", 4, 7529522), -- Willem Meyles
("2324", "nv1", "n", "vf", "NHSB vf", 4, 7321534), -- Ronald Kamps
("2324", "nv2", "n", "vb", "NHSB vb", 4, 7691728); -- Karel Beentjes

select t.*, naam from team t join persoon p on t.teamleider = p.knsbNummer where seizoen = "2223";

insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
("2324", "1", 1, "t", "En Passant 1", '2023-09-17'), -- KNSB competitie
("2324", "1", 2, "u", "HWP Haarlem 1", '2023-10-08'),
("2324", "1", 3, "u", "Caissa-Eenhoorn 1", '2023-11-05'),
("2324", "1", 4, "t", "LSG 2", '2023-11-26'),
("2324", "1", 5, "u", "MSV 1", '2023-12-17'),
("2324", "1", 6, "t", "Philidor 1847 1", '2024-02-11'),
("2324", "1", 7, "u", "Caissa 1", '2024-03-11'),
("2324", "1", 8, "t", "Purmerend 1", '2024-04-01'),
("2324", "1", 9, "u", "Wageningen 1", '2024-04-22'),
("2324", "2", 1, "t", "Santpoort 1", '2023-09-17'),
("2324", "2", 2, "u", "HWP Haarlem 2", '2023-10-08'),
("2324", "2", 3, "u", "Amsterdam Berserkers 1", '2023-11-05'),
("2324", "2", 4, "t", "Het Spaarne 1", '2023-11-26'),
("2324", "2", 5, "u", "Aartswoud 1", '2023-12-17'),
("2324", "2", 6, "t", "Paul Keres 3", '2024-02-11'),
("2324", "2", 7, "u", "Caissa 2", '2024-03-11'),
("2324", "2", 8, "t", "De Wijker Toren 2", '2024-04-01'),
("2324", "2", 9, "u", "ZSC-HWP Combinatie 1", '2024-04-22'),
("2324", "3", 1, "t", "Volendam 1", '2023-09-17'),
("2324", "3", 2, "u", "HWP Haarlem 3", '2023-10-08'),
("2324", "3", 3, "u", "Caissa-Eenhoorn 2", '2023-11-05'),
("2324", "3", 4, "t", "Bergen 1", '2023-11-26'),
("2324", "3", 5, "u", "ZSC-HWP Combinatie 3", '2023-12-17'),
("2324", "3", 6, "t", "Heerhugowaard 1", '2024-02-11'),
("2324", "3", 7, "u", "Kennemer Combinatie 3", '2024-03-11'),
("2324", "3", 8, "t", "Purmerend 2", '2024-04-01'),
("2324", "3", 9, "u", "HWP-ZSC Combinatie 2", '2024-04-22'),
("2324", "4", 1, "u", "HWP Haarlem 5", '2023-10-08'),
("2324", "4", 2, "u", "VAS 6", '2023-11-05'),
("2324", "4", 3, "t", "Combiteam KL 2", '2023-11-26'),
("2324", "4", 4, "u", "ZSC-Saende Combinatie 4", '2023-12-17'),
("2324", "4", 5, "t", "Magnus Anna Paulowna Combinatie 3", '2024-02-11'),
("2324", "4", 6, "u", "Almere 4", '2024-03-11'),
("2324", "kbe", 1, "u", "Bergen", '2023-10-27'), -- KNSB beker
("2324", "kbe", 2, "u", "Caissa-Eenhoorn", '2023-12-06');

insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
("2324", "int", 1, "t", "", '2024-09-12'), -- interne competitie
("2324", "int", 2, "t", "", '2024-09-19'),
("2324", "int", 3, "t", "", '2024-09-26'),
("2324", "int", 4, "t", "", '2023-10-03'),
("2324", "int", 5, "t", "", '2023-10-10'),
("2324", "int", 6, "t", "", '2023-10-17'),
("2324", "int", 7, "t", "", '2023-10-31'),
("2324", "int", 8, "t", "", '2023-11-07'),
("2324", "int", 9, "t", "", '2023-11-14'),
("2324", "int", 10, "t", "", '2023-11-21'),
("2324", "int", 11, "t", "", '2023-11-28'),
("2324", "int", 12, "t", "", '2023-12-12'),
("2324", "int", 13, "t", "", '2024-01-02'),
("2324", "int", 14, "t", "", '2024-01-09'),
("2324", "int", 15, "t", "", '2024-01-16'),
("2324", "int", 16, "t", "", '2024-01-30'),
("2324", "int", 17, "t", "", '2024-02-06'),
("2324", "int", 18, "t", "", '2024-02-13'),
("2324", "int", 19, "t", "", '2024-02-27'),
("2324", "int", 20, "t", "", '2024-03-05'),
("2324", "int", 21, "t", "", '2024-03-12'),
("2324", "int", 22, "t", "", '2024-03-19'),
("2324", "int", 23, "t", "", '2024-03-26'),
("2324", "int", 24, "t", "", '2024-04-02'),
("2324", "int", 25, "t", "", '2024-04-09'),
("2324", "int", 26, "t", "", '2024-04-16'),
("2324", "int", 27, "t", "", '2024-04-23'),
("2324", "int", 28, "t", "", '2024-05-07'),
("2324", "int", 29, "t", "", '2024-05-14'),
("2324", "int", 30, "t", "", '2024-05-21'),
("2324", "int", 31, "t", "", '2024-05-28'),
("2324", "int", 32, "t", "", '2024-06-04'),
("2324", "int", 33, "t", "", '2024-06-11'),
("2324", "ira", 1, "t", "", '2023-10-24'), -- rapid competitie
("2324", "ira", 2, "t", "", '2023-10-24'),
("2324", "ira", 3, "t", "", '2023-10-24'),
("2324", "ira", 4, "t", "", '2024-02-20'),
("2324", "ira", 5, "t", "", '2024-02-20'),
("2324", "ira", 6, "t", "", '2024-02-20'),
("2324", "ira", 7, "t", "", '2024-04-30'),
("2324", "ira", 8, "t", "", '2024-04-30'),
("2324", "ira", 9, "t", "", '2024-04-30');

insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
("2324", "n1", 1, "u", "Kennemer Combinatie N1", '2023-09-30'), -- NHSB competitie TODO wacht op Gerard Groot
("2324", "n1", 2, "t", "De Wijker Toren N1", '2023-10-25'),
("2324", "n1", 3, "u", "De Uil N1", '2023-11-14'),
("2324", "n1", 4, "t", "Aartswoud N1", '2024-01-10'),
("2324", "n1", 5, "u", "Bloemendaal N1", '2024-02-01'),
("2324", "n1", 6, "t", "Krommenie N1", '2024-02-21'),
("2324", "n1", 7, "u", "Chess Society Zandvoort N1", '2024-03-28'),
("2324", "n1", 8, "t", "HWP Haarlem N1", '2024-04-11'),
("2324", "n2", 1, "u", "En Passant N1", '2023-09-24'),
("2324", "n2", 2, "t", "Purmerend N1", '2023-10-25'),
("2324", "n2", 3, "u", "Vredeburg N1", '2023-11-18'),
("2324", "n2", 4, "t", "Noordkopcombinatie Magnus N1", '2023-12-06'),
("2324", "n2", 5, "u", "Caïssa-Eenhoorn N1", '2024-01-31'),
("2324", "n2", 6, "t", "Opening '64 N1", '2024-02-21'),
("2324", "n2", 7, "u", "KTV N1", '2024-03-31'),
("2324", "n3", 1, "u", "Castricum N1", '2023-10-14'),
("2324", "n3", 2, "t", "Bergen N", '2023-11-08'),
("2324", "n3", 3, "u", "Krommenie N2", '2023-11-29'),
("2324", "n3", 4, "t", "Oppositie N", '2024-02-14'),
("2324", "n3", 5, "u", "Koedijk N1", '2024-03-14'),
("2324", "nbe", 1, "u", "ZSC Saende", '2024-03-27'),
("2324", "nv1", 1, "u", "Santpoort V", '2023-11-22'),
("2324", "nv1", 2, "t", "Het Spaarne V2", '2023-12-13'),
("2324", "nv1", 3, "u", "Wijker Toren V1", '2024-01-12'),
("2324", "nv1", 4, "t", "Santpoort V", '2024-02-07'),
("2324", "nv1", 5, "t", "Wijker Toren V1", '2024-03-07'),
("2324", "nv1", 6, "u", "Het Spaarne V2", '2024-03-30'),
("2324", "nv2", 1, "t", "Castricum V", '2023-11-22'),
("2324", "nv2", 2, "t", "Vredeburg V2", '2024-01-10'),
("2324", "nv2", 3, "u", "Vredeburg V2", '2024-03-07'),
("2324", "nv2", 4, "u", "Castricum V", '2024-03-14'),
("2324", "nv2", 5, "u", "Heerhugowaard V", '2024-03-23'),
("2324", "nv2", 6, "t", "Heerhugowaard V", '2024-03-28');

