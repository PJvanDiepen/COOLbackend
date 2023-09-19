use waagtoren; -- ga naar TODO

-- aantal leden per maand 
select maand, jaar, count(*) leden from rating group by maand, jaar;

-- TODO partij wijzigen
set @seizoen = '2324';
set @competitie = 'int';
set @ronde = 1;
set @bord = 17;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and bordNummer = @bord;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = "e";

set @wit = 7419621; -- Fritz
set @zwart = 8886625; -- Richard
set @oneven = 6212404; -- Peter
set @afwezig = 7691728; -- Karel
set @extern = 7758014; -- Alex

update uitslag set bordNummer = 0, partij = 'a', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where seizoen = '2122' and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @afwezig;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = 'i' order by bordNummer, witZwart;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in (@wit, @zwart, @oneven, @afwezig);

-- TODO afwezig maken

update uitslag set bordNummer = 0, partij = 'a', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @afwezig;

-- TODO oneven maken

update uitslag set bordNummer = 0, partij = 'o', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @oneven;

-- TODO extern maken

update uitslag set bordNummer = 0, partij = 'e', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @extern;

-- TODO partij wijzigen

select * from uitslag
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;

update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'w', tegenstanderNummer = @zwart, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'z', tegenstanderNummer = @wit, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

-- TODO wit / zwart wijzigen

update uitslag set witZwart = 'w'
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set witZwart = 'z'
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

-- teams
insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
("2324", "", "", "", "geen", 0, 0),
("2324", "1", "k", "m", "KNSB meester", 10, 0),
("2324", "2", "k", "3c", "KNSB 3c", 8, 0),
("2324", "3", "k", "4c", "KNSB 4c", 8, 0),
("2324", "4", "k", "6e", "KNSB 6e", 8, 0),
("2324", "5", "k", "6e", "KNSB 6e", 8, 0),
("2324", "int", "i", "nt", "interne competitie", 0, 0),
("2324", "ira", "i", "ra", "rapid competitie", 0, 0),
("2324", "n1", "n", "t", "NHSB top", 8, 0),
("2324", "n2", "n", "1a", "NHSB 1a", 8, 0),
("2324", "nbe", "n", "be", "NHSB beker", 4, 0);

-- TODO teamleiders 2023-2024
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

select t.*, naam from team t join persoon p on t.teamleider = p.knsbNummer where seizoen = "2324";

insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
("2324", "1", 1, "t", "Paul Keres 1", '2023-09-16'), -- KNSB competitie
("2324", "1", 2, "u", "Amevo Apeldoorn 1", '2023-10-07'),
("2324", "1", 3, "t", "Zukertort Amstelveen 1", '2023-11-04'),
("2324", "1", 4, "u", "HMC Den Bosch 1", '2023-11-25'),
("2324", "1", 5, "u", "Groninger Combinatie 1", '2023-12-16'),
("2324", "1", 6, "t", "LSG IntelliMagic 1", '2024-02-03'),
("2324", "1", 7, "u", "Zuid Limburg 1", '2024-03-02'),
("2324", "1", 8, "t", "Charlois Europoort 1", '2024-03-23'),
("2324", "1", 9, "u", "Kennemer Combinatie 1", '2024-04-20'),
("2324", "2", 1, "t", "AAS 1", '2023-09-16'),
("2324", "2", 2, "u", "VAS 2", '2023-10-07'),
("2324", "2", 3, "t", "De Wijker Toren 2", '2023-11-04'),
("2324", "2", 4, "u", "Santpoort 1", '2023-11-25'),
("2324", "2", 5, "u", "ZSC-HWP Combinatie 1", '2023-12-16'),
("2324", "2", 6, "t", "Aartswoud 1", '2024-02-03'),
("2324", "2", 7, "u", "Amsterdam West 1", '2024-03-02'),
("2324", "2", 8, "t", "Caissa 3", '2024-03-23'),
("2324", "2", 9, "u", "Caissa-Eenhoorn 2", '2024-04-20'),
("2324", "3", 1, "t", "Paul Keres 5", '2023-09-16'),
("2324", "3", 2, "u", "VAS 3", '2023-10-07'),
("2324", "3", 3, "t", "De Amstel 1", '2023-11-04'),
("2324", "3", 4, "u", "Bergen 1", '2023-11-25'),
("2324", "3", 6, "t", "Heerhugowaard 1", '2024-02-03'),
("2324", "3", 7, "u", "HWP-ZSC Combinatie 2", '2024-03-02'),
("2324", "3", 8, "t", "Opening '64 1", '2024-03-23'),
("2324", "3", 9, "u", "Purmerend 2", '2024-04-20'),
("2324", "4", 1, "u", "De Waagtoren 5", '2023-10-07'),
("2324", "4", 2, "t", "VAS 9", '2023-11-04'),
("2324", "4", 3, "u", "VAS 7", '2023-11-25'),
("2324", "4", 4, "u", "ZSC-Saende Combinatie 4", '2023-12-16'),
("2324", "4", 5, "t", "Aartswoud 2", '2024-02-03'),
("2324", "4", 6, "u", "Caissa 4", '2024-03-02'),
("2324", "4", 7, "t", "Purmerend 3", '2024-03-23'),
("2324", "5", 1, "t", "De Waagtoren 4", '2023-10-07'),
("2324", "5", 2, "u", "Aartswoud 2", '2023-11-04'),
("2324", "5", 3, "t", "Caissa 4", '2023-11-25'),
("2324", "5", 4, "u", "Purmerend 3", '2023-12-16'),
("2324", "5", 5, "t", "ZSC-Saende Combinatie 4", '2024-02-03'),
("2324", "5", 6, "t", "VAS 9", '2024-03-02'),
("2324", "5", 7, "u", "VAS 7", '2024-03-23');

insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
("2324", "int", 1, "t", "", '2023-09-12'), -- interne competitie
("2324", "int", 2, "t", "", '2023-09-19'),
("2324", "int", 3, "t", "", '2023-09-26'),
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
("2324", "n1", 1, "t", "Kennemer Combinatie N1", '2023-09-26'), -- NHSB competitie
("2324", "n1", 2, "u", "HWP Haarlem N1", '2023-10-17'),
("2324", "n1", 3, "t", "Bloemendaal N1", '2023-11-14'),
("2324", "n1", 4, "u", "Aartswoud N1", '2023-12-08'),
("2324", "n1", 5, "t", "Caïssa-Eenhoorn N1", '2024-02-06'),
("2324", "n1", 6, "u", "Santpoort N1", '2024-03-12'),
("2324", "n1", 7, "t", "ZSC/Witte Paard Combinatie N1", '2024-03-26'),
("2324", "n1", 8, "u", "Wijker Toren N1", '2024-04-11'),
("2324", "n2", 1, "t", "Castricum N1", '2023-09-26'),
("2324", "n2", 2, "u", "Volendam N1", '2023-10-19'),
("2324", "n2", 3, "t", "Purmerend N1", '2023-11-14'),
("2324", "n2", 4, "u", "Noordkopcomb. Magnus N1", '2023-12-08'),
("2324", "n2", 5, "t", "Opening 64 N1", '2024-02-13'),
("2324", "n2", 6, "u", "Krommenie N1", '2024-03-12'),
("2324", "n2", 7, "t", "Schaakmat N1", '2024-03-26');

-- ronde 1 

insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
("2324", "int", 1, 0, 103, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 143, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 6192098, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 6207520, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 6212404, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 6572511, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 6930957, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 6951362, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7099950, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7101193, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7269900, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7282033, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7292043, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7321534, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7386060, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7399469, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7419621, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7428960, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7518203, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7529522, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7535396, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7546506, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7582102, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7613166, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7640798, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7707832, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7758014, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7771665, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7904589, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7970094, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8073978, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8112654, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8224502, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8243312, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8350738, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8372881, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8400183, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8485059, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8587337, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8744494, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8750093, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8886625, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8931098, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 9023168, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 9023234, "m", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7099620, "n", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7649213, "n", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7665834, "n", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8472530, "n", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 8484443, "n", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 9023179, "n", "", 0, "", '2023-09-12', "int"),
("2324", "int", 1, 0, 7210137, "p", "", 0, "", '2023-09-12', "int");

set @team = "3";
set @ronde = 1;
select * from uitslag where seizoen = "2324" and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where seizoen = "2324" and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
("2324", "1", 1, 1, 7359913, "e", "z", 0, "1", '2023-09-16', "int"),
("2324", "1", 1, 2, 7584566, "e", "w", 0, "0", '2023-09-16', "int"),
("2324", "1", 1, 3, 7657342, "e", "z", 0, "0", '2023-09-16', "int"),
("2324", "1", 1, 4, 7970094, "e", "w", 0, "1", '2023-09-16', "int"),
("2324", "1", 1, 5, 7428960, "e", "z", 0, "0", '2023-09-16', "int"),
("2324", "1", 1, 6, 8096242, "e", "w", 0, "0", '2023-09-16', "int"),
("2324", "1", 1, 7, 8285574, "e", "z", 0, "0", '2023-09-16', "int"),
("2324", "1", 1, 8, 7828183, "e", "w", 0, "1", '2023-09-16', "int"),
("2324", "1", 1, 9, 7468417, "e", "z", 0, "0", '2023-09-16', "int"),
("2324", "1", 1, 10, 8611922, "e", "w", 0, "0", '2023-09-16', "int");

insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
("2324", "2", 1, 1, 5968611, "e", "z", 0, "1", '2023-09-16', "int"),
("2324", "2", 1, 2, 6335670, "e", "w", 0, "0", '2023-09-16', "int"),
("2324", "2", 1, 3, 7879520, "e", "z", 0, "1", '2023-09-16', "int"),
("2324", "2", 1, 4, 7129991, "e", "w", 0, "1", '2023-09-16', "int"),
("2324", "2", 1, 5, 7707832, "e", "z", 0, "1", '2023-09-16', "int"),
("2324", "2", 1, 6, 8795941, "e", "w", 0, "½", '2023-09-16', "int"),
("2324", "2", 1, 7, 8484443, "e", "z", 0, "½", '2023-09-16', "int"),
("2324", "2", 1, 8, 8400183, "e", "w", 0, "1", '2023-09-16', "int");

insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
("2324", "3", 1, 1, 7665834, "e", "z", 0, "1", '2023-09-16', "int"),
("2324", "3", 1, 2, 8112654, "e", "w", 0, "½", '2023-09-16', "int"),
("2324", "3", 1, 3, 6572511, "e", "z", 0, "½", '2023-09-16', "int"),
("2324", "3", 1, 4, 7758014, "e", "w", 0, "0", '2023-09-16', "int"),
("2324", "3", 1, 5, 7535385, "e", "z", 0, "1", '2023-09-16', "int"),
("2324", "3", 1, 6, 7904589, "e", "w", 0, "½", '2023-09-16', "int"),
("2324", "3", 1, 7, 8587337, "e", "z", 0, "1", '2023-09-16', "int"),
("2324", "3", 1, 8, 7699010, "e", "w", 0, "½", '2023-09-16', "int");





