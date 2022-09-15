use waagtoren;

select naam, g.* from gebruiker g join persoon p on g.knsbNummer = p.knsbNummer order by naam;

select naam, s.* from speler s join persoon p on s.knsbNummer = p.knsbNummer  where seizoen = '2223' order by naam;

select naam, u.* from uitslag u join persoon p on u.knsbNummer = p.knsbNummer where seizoen = '2223' and teamCode = 'n2' and rondeNummer = 1 order by naam;

select * from uitslag u join persoon p on u.knsbNummer = p.knsbNummer where seizoen = '2223' and u.knsbNummer in (7584566, 8285574, 7359913, 7468417, 7828183) order by naam;

delete from uitslag where seizoen = '2223' and knsbNummer = 7970094 and teamCode = 'n2';

delete from gebruiker where uuidToken = '06cbc61f-3476-11ed-a8a7-525400be7013';

select * from speler where seizoen = '2223';

delete from speler where seizoen = '2223' and knsbNummer = 6212404;

select * from speler where seizoen = '2223'and knsbNummer < 1000000;

select * from persoon where knsbNummer < 1000000;


insert into speler (seizoen, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5) values
("2223", "", "", 7101193, 1547, '2022-09-05', 1547, "int", "ira", "", "", ""); -- Jacob Bleijendaal

insert into speler (seizoen, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5) values
("2223", "", "", 126, 1997, '2022-09-05', 1997, "int", "ira", "", "", ""); -- Alberto Alvarez Alonso

insert into speler (seizoen, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5) values
("2223", "", "", 127, 1000, '2022-09-05', 1000, "int", "ira", "", "", ""); -- Daniel Younk

select * from team where seizoen = '2223';
delete from team where seizoen = '2223';

select * from team where omschrijving = 'geen';

update team set omschrijving = 'geen' where seizoen = '2223' and omschrijving = 'geen team';

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
('2223', '', '', '', 'geen', 0, 0),
('2223', 'int', 'i', 'nt', 'interne competitie', 0, 0),
('2223', 'ira', 'i', 'ra', 'rapid competitie', 0, 0);

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
('2223', '1', 'k', '1a', 'KNSB 1a', '10', '0'),
('2223', '2', 'k', '3d', 'KNSB 3d', '8', '0'),
('2223', '3', 'k', '4d', 'KNSB 4d', '8', '0'),
('2223', '4', 'k', '6c', 'KNSB 6c', '8', '0');

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
('2223', 'n1', 'n', 't', 'NHSB top', '8', '0'),
('2223', 'n2', 'n', '1a', 'NHSB 1a', '8', '0');

insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
("2223", "int", 1, "t", "", '2022-09-06'),
("2223", "int", 2, "t", "", '2022-09-13'),
("2223", "int", 3, "t", "", '2022-09-20'),
("2223", "int", 4, "t", "", '2022-09-27'),
("2223", "int", 5, "t", "", '2022-10-04'),
("2223", "int", 6, "t", "", '2022-10-11'),
("2223", "int", 7, "t", "", '2022-10-25'),
("2223", "int", 8, "t", "", '2022-11-01'),
("2223", "int", 9, "t", "", '2022-11-08'),
("2223", "int", 10, "t", "", '2022-11-15'),
("2223", "int", 11, "t", "", '2022-11-22'),
("2223", "int", 12, "t", "", '2022-11-29'),
("2223", "int", 13, "t", "", '2022-12-06'),
("2223", "int", 14, "t", "", '2022-12-13'),
("2223", "int", 15, "t", "", '2023-01-03'),
("2223", "int", 16, "t", "", '2023-01-10'),
("2223", "int", 17, "t", "", '2023-01-17'),
("2223", "int", 18, "t", "", '2023-01-31'),
("2223", "int", 19, "t", "", '2023-02-07'),
("2223", "int", 20, "t", "", '2023-02-14'),
("2223", "int", 21, "t", "", '2023-02-21'),
("2223", "int", 22, "t", "", '2023-03-07'),
("2223", "int", 23, "t", "", '2023-03-14'),
("2223", "int", 24, "t", "", '2023-03-21'),
("2223", "int", 25, "t", "", '2023-03-28'),
("2223", "int", 26, "t", "", '2023-04-04'),
("2223", "int", 27, "t", "", '2023-04-11'),
("2223", "int", 28, "t", "", '2023-04-18'),
("2223", "int", 29, "t", "", '2023-04-25'),
("2223", "int", 30, "t", "", '2023-05-09'),
("2223", "int", 31, "t", "", '2023-05-16'),
("2223", "int", 32, "t", "", '2023-05-23'),
("2223", "int", 33, "t", "", '2023-05-30'),
("2223", "ira", 1, "t", "", '2022-10-18'),
("2223", "ira", 2, "t", "", '2022-10-18'),
("2223", "ira", 3, "t", "", '2022-10-18'),
("2223", "ira", 4, "t", "", '2023-02-28'),
("2223", "ira", 5, "t", "", '2023-02-28'),
("2223", "ira", 6, "t", "", '2023-02-28'),
("2223", "ira", 7, "t", "", '2023-05-02'),
("2223", "ira", 8, "t", "", '2023-05-02'),
("2223", "ira", 9, "t", "", '2023-05-02');

insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
('2223', '1', '1', 't', 'En Passant 1', '2022-09-17'),
('2223', '1', '2', 'u', 'HWP Haarlem 1', '2022-10-08'),
('2223', '1', '3', 'u', 'Caissa-Eenhoorn 1', '2022-11-05'),
('2223', '1', '4', 't', 'LSG 2', '2022-11-26'),
('2223', '1', '5', 'u', 'MSV 1', '2022-12-17'),
('2223', '1', '6', 't', 'Philidor 1847 1', '2023-02-11'),
('2223', '1', '7', 'u', 'Caissa 1', '2023-03-11'),
('2223', '1', '8', 't', 'Purmerend 1', '2023-04-01'),
('2223', '1', '9', 'u', 'Wageningen 1', '2023-04-22'),
('2223', '2', '1', 't', 'Santpoort 1', '2022-09-17'),
('2223', '2', '2', 'u', 'HWP Haarlem 2', '2022-10-08'),
('2223', '2', '3', 'u', 'Amsterdam Berserkers 1', '2022-11-05'),
('2223', '2', '4', 't', 'Het Spaarne 1', '2022-11-26'),
('2223', '2', '5', 'u', 'Aartswoud 1', '2022-12-17'),
('2223', '2', '6', 't', 'Paul Keres 3', '2023-02-11'),
('2223', '2', '7', 'u', 'Caissa 2', '2023-03-11'),
('2223', '2', '8', 't', 'De Wijker Toren 2', '2023-04-01'),
('2223', '2', '9', 'u', 'ZSC-HWP Combinatie 1', '2023-04-22'),
('2223', '3', '1', 't', 'Volendam 1', '2022-09-17'),
('2223', '3', '2', 'u', 'HWP Haarlem 3', '2022-10-08'),
('2223', '3', '3', 'u', 'Caissa-Eenhoorn 2', '2022-11-05'),
('2223', '3', '4', 't', 'Bergen 1', '2022-11-26'),
('2223', '3', '5', 'u', 'ZSC-HWP Combinatie 3', '2022-12-17'),
('2223', '3', '6', 't', 'Heerhugowaard 1', '2023-02-11'),
('2223', '3', '7', 'u', 'Kennemer Combinatie 3', '2023-03-11'),
('2223', '3', '8', 't', 'Purmerend 2', '2023-04-01'),
('2223', '3', '9', 'u', 'HWP-ZSC Combinatie 2', '2023-04-22'),
('2223', '4', '1', 'u', 'HWP Haarlem 5', '2022-10-08'),
('2223', '4', '2', 'u', 'VAS 6', '2022-11-05'),
('2223', '4', '3', 't', 'Combiteam KL 2', '2022-11-26'),
('2223', '4', '5', 't', 'Magnus Anna Paulowna Combinatie 3', '2023-02-11'),
('2223', '4', '6', 'u', 'Almere 4', '2023-03-11'),
('2223', '4', '7', 't', 'Zukertort Amstelveen 5', '2023-04-01'),
('2223', '4', '4', 'u', 'ZSC-Saende Combinatie 4', '2022-12-17');

insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
('2223', 'n1', '1', 'u', 'Kennemer Combinatie N1', '2022-09-30'),
('2223', 'n1', '2', 't', 'De Wijker Toren N1', '2022-10-25'),
('2223', 'n1', '3', 'u', 'De Uil N1', '2022-11-14'),
('2223', 'n1', '4', 't', 'Aartswoud N1', '2023-01-10'),
('2223', 'n1', '5', 'u', 'Bloemendaal N1', '2023-02-01'),
('2223', 'n1', '6', 't', 'Krommenie N1', '2023-02-21'),
('2223', 'n1', '7', 'u', 'Chess Society Zandvoort N1', '2023-03-24'),
('2223', 'n1', '8', 't', 'HWP Haarlem N1', '2023-04-11'),
('2223', 'n2', '1', 'u', 'En Passant N1', '2022-09-24'),
('2223', 'n2', '2', 't', 'Purmerend N1', '2022-10-25'),
('2223', 'n2', '3', 'u', 'Vredeburg N1', '2022-11-18'),
('2223', 'n2', '4', 't', 'Noordkopcombinatie Magnus N1', '2022-12-06'),
('2223', 'n2', '5', 'u', 'Caïssa-Eenhoorn N1', '2023-01-31'),
('2223', 'n2', '6', 't', 'Opening ''64 N1', '2023-02-21'),
('2223', 'n2', '7', 'u', 'KTV N1', '2023-03-24');

-- TODO ranglijst Rapid
set @competitie = 'ira';
set @ronde = 5;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = '2122' and teamCode = @competitie and rondeNummer = @ronde order by bordNummer, witZwart;  -- and u.knsbNummer in (@wit, @zwart);

-- TODO alle mutaties van Peter van Diepen verwijderen

delete from mutatie where knsbNummer = 6212404;

-- TODO partij wijzigen

set @seizoen = '2223';
set @competitie = 'int';
set @ronde = 1;
set @bord = 22;
set @wit = 7691728; -- Karel Beentjes
set @zwart = 7269900; -- Jan Ens
set @oneven = 6212404; -- Peter van Diepen
set @afwezig = 6212404; -- Peter van Diepen

set @wit = 7699010; -- Ruud Niewenhuis
set @zwart = 6572511; -- Bert Buitink

set @wit = 6187885; -- Bob de Mon
set @zwart = 123; -- Kees van Montfoort

update uitslag set bordNummer = 0, partij = 'a', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where seizoen = '2122' and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @afwezig;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = 'i' order by bordNummer, witZwart;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in (@wit, @zwart, @oneven, @afwezig);

-- TODO afwezig maken

update uitslag set bordNummer = 0, partij = 'a', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where seizoen = '2122' and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @afwezig;

-- TODO oneven maken

update uitslag set partij = 'o'
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @oneven;

-- TODO partij wijzigen

update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'w', tegenstanderNummer = @zwart, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'z', tegenstanderNummer = @wit, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

-- TODO wit / zwart wijzigen

update uitslag set witZwart = 'w'
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set witZwart = 'z'
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

-- TODO spelers selecteren
select naam, s.knsbNummer, knsbRating, knsbOpgegeven, nhsbOpgegeven 
from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where seizoen = '2122' order by knsbRating desc; -- naam;

-- TODO wedstrijd tijdens interne competitie
set @team = 'n2'; -- Waagtoren n2 - Aartswoud n1
set @ronde = 3;
set @intern = 21;
set @uithuis = 't';

select naam, u.* from uitslag u join persoon p on u.knsbNummer = p.knsbNummer 
where seizoen = '2122' and ((teamCode = 'int' and rondeNummer = @intern) or (teamCode = @team and rondeNummer = @ronde)) and u.knsbNummer in 
(select knsbNummer from uitslag where seizoen = '2122' and teamCode = @team and rondeNummer = @ronde);

update uitslag set partij = 't'
where seizoen = '2122' and teamCode = 'int' and rondeNummer = @intern and knsbNummer in 
(8611922, 7529522, 6930957, 7758014, 8400183, 8587337, 8484443);
update uitslag set partij = 't'
where seizoen = '2122' and teamCode = @team and rondeNummer = @ronde and knsbNummer in 
(8611922, 7529522, 6930957, 7758014, 8400183, 8587337, 8484443);

select naam, u.* from uitslag u join persoon p on u.knsbNummer = p.knsbNummer
where seizoen = '2122' and teamCode = @team and rondeNummer = @ronde;

select * from uitslag where seizoen = '2122' and teamCode = @team and rondeNummer = @ronde and bordNummer = 0;
delete from uitslag where seizoen = '2122' and teamCode = @team and rondeNummer = @ronde and bordNummer = 0;
update uitslag set knsbNummer = 1 where seizoen = '2122' and teamCode = @team and rondeNummer = @ronde and knsbNummer = 0;

insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
('2122', @team, @ronde, 0, 8750093, @uithuis, '', 0, '', '2022-04-19', 'int'), -- Martin Rep (Waagtoren n4 - Heerhugowaard n1)
('2122', @team, @ronde, 0, 7399469, @uithuis, '', 0, '', '2022-04-19', 'int'), -- Nico Mak
('2122', @team, @ronde, 0, 7321534, @uithuis, '', 0, '', '2022-04-19', 'int'), -- Ronald Kamps
('2122', @team, @ronde, 0, 8472530, @uithuis, '', 0, '', '2022-04-19', 'int'), -- Rosa Leek
('2122', @team, @ronde, 0, 7518203, @uithuis, '', 0, '', '2022-04-19', 'int'); -- Theo de Bruijn

-- TODO speler toevoegen 
insert into persoon (knsbNummer, naam) values
(7838963, 'Kevin Tan');

insert into speler (seizoen, nhsbTeam, nhsbOpgegeven, knsbTeam, knsbOpgegeven, knsbNummer, knsbRating, datumRating) values
('2122', '', '', '', '', 7838963, 2194, '2022-06-01');

-- TODO wedstrijden en ronden voor vandaag opruimen
set @datum = '2022-03-19';
select * from uitslag where datum < @datum and partij in ('m', 'n', 'u', 't') order by datum;

delete from uitslag where seizoen = '2122' and datum < @datum and partij in ('m', 'n', 'u', 't');

delete from uitslag where seizoen = '21ra' and datum < '2022-03-12' and partij in ('m', 'n', 'u', 't');

-- TODO partij = 'e' voor externe wedstrijd op dinsdag
select * from uitslag i
where seizoen = '2122' and teamCode = 'int' and rondeNummer = 13 and knsbNummer in 
(select knsbNummer from uitslag where seizoen = '2122' and teamCode <> 'int' and datum = i.datum) 
order by partij; 

update uitslag set partij = 'e' 
where seizoen = '2122' and teamCode = 'int' and rondeNummer = 13 and knsbNummer in (7707832, 8112654, 7970094, 7879520, 6225934, 6483455, 7129991, 7428960); 

-- deze werkt niet!
update uitslag i set partij = 'e'
where seizoen = '2122' and teamCode = 'int' and rondeNummer = 13 and knsbNummer in 
(select knsbNummer from uitslag where seizoen = '2122' and teamCode <> 'int' and datum = i.datum); 

delete from uitslag where seizoen = '2122' and datum < '2022-03-01' and partij in ('m', 'n', 'u', 't');
