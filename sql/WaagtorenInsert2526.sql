use waagtoren; -- ga naar TODO
set @seizoen = "2526";

-- TODO issue #37 afwezig en externe wedstrijd op dinsdag

-- aantal interne uitslagen per speler per seizoen
select naam, u.knsbNummer, count(*) uitslagen
from uitslag u join persoon p on u.knsbNummer = p.knsbNummer 
where clubCode = 0 and seizoen = @seizoen and teamCode = "int"
group by u.knsbNummer
order by uitslagen desc;

set @seizoen = '1819'; -- TODO Han Rauws en Bob de Mon 26
set @seizoen = '1920'; -- TODO 19, 18, 17, 16, 15, 13, 10, 8, 1
set @seizoen = '2122'; -- TODO 24, 23, 22, 21, 20
set @seizoen = '2223'; -- TODO 32, 31, 30, 29

with 
  e as (select * from uitslag where competitie = "int" and partij = "e")
select p.naam, u.teamCode, u.rondeNummer, u.partij, e.* from uitslag u
join persoon p on u.knsbNummer = p.knsbNummer
join e on u.clubCode = e.clubCode and u.seizoen = e.seizoen and u.knsbNummer = e.knsbNummer and u.datum = e.datum
where u.clubCode = 0 and u.seizoen = @seizoen and u.teamCode = "int" and u.partij = "a";

with
  e as (select * from uitslag where competitie = "int" and partij = "e")
update uitslag u
join e on u.clubCode = e.clubCode and u.seizoen = e.seizoen and u.knsbNummer = e.knsbNummer and u.datum = e.datum
set u.partij = "e"
where u.clubCode = 0 and u.seizoen = @seizoen and u.teamCode = "int" and u.partij = "a";

-- externe partijen op andere datums dan de wedstrijd
select p.naam, r.uithuis, r.tegenstander, r.datum, u.* from uitslag u
join ronde r on r.clubCode = u.clubCode and r.seizoen = u.seizoen and r.teamCode = u.teamCode and u.rondeNummer = r.rondeNummer
join persoon p on p.knsbNummer = u.knsbNummer
where u.teamCode <> u.anderTeam and u.datum <> r.datum; 

select * from uitslag where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 
select * from ronde where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 
update uitslag set datum = '2022-04-26' where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 

-- externe partijen zonder uitslag
select p.naam, u.* from uitslag u
join persoon p on u.knsbNummer = p.knsbNummer
where clubCode = 0 and seizoen = @seizoen and partij = "e" and resultaat not in ("1", "½", "0") order by seizoen, datum;

delete from uitslag
where clubCode = 0 and seizoen = @seizoen and partij = "e" and resultaat not in ("1", "½", "0") order by seizoen, datum;

-- issue #46 hack
insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2324", "int", 34, "t", "", '2024-06-30');

delete from ronde where clubCode = 0 and seizoen = "2324" and teamCode = "int" and rondeNummer = 34; 

-- aantal rating leden per maand 
select maand, jaar, count(*) leden from rating group by maand, jaar;

-- TODO wijzig datum externe wedstrijd
set @seizoen = '2526';
set @team = 'n1';
set @ronde = 1;
set @datum = '2025-10-10';

select * from ronde where clubCode = 0 and seizoen = @seizoen and teamCode = @team;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

update ronde set datum = @datum 
where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
update uitslag set partij = "p", datum = @datum 
where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde; 

-- TODO partij wijzigen
set @seizoen = '2526';
set @team = 'int';
set @competitie = 'int';
set @ronde = 1;
set @bord = 23;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and bordNummer = @bord;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = "e";

set @wit   = 8915346; -- Luca de Graaf
set @zwart = 192; -- Alexander van der Linden

select * from persoon where knsbNummer = @wit;

set @oneven = 7518203; -- Theo de Bruijn
set @afwezig = 7771665; -- Yvonne Schol
set @extern = 7758014; -- Alex

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = 'i' order by bordNummer, witZwart;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in (@wit, @zwart, @oneven, @afwezig);

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in (@wit, @zwart, @afwezig);

-- TODO afwezig maken

update uitslag set bordNummer = 0, partij = 'a', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @afwezig;

-- TODO oneven maken

update uitslag set bordNummer = 0, partij = 'o', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @oneven;

-- TODO extern maken

update uitslag set bordNummer = 0, partij = 'e', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @extern;

-- TODO partij wijzigen

update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'w', tegenstanderNummer = @zwart, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'z', tegenstanderNummer = @wit, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

-- TODO wit / zwart wijzigen

update uitslag set witZwart = 'w'
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set witZwart = 'z'
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

-- teams
update team set omschrijving = "Viertallen D" where clubCode = 0 and seizoen = "2425" and teamCode = "nv1"; 

insert into team (clubCode, seizoen, teamCode, reglement, maand, jaar, bond, poule, omschrijving, borden, teamleider) values
(0, "2526", "", 0, 0, 0, "", "", "geen", 0, 0),
(0, "2526", "0", 0, 0, 0, "k", "", "KNSB bij andere schaakvereniging", 0, 0),
(0, "2526", "1", 0, 0, 0, "k", "2b", "KNSB 2B", 10, 0),
(0, "2526", "2", 0, 0, 0, "k", "3c", "KNSB 3C", 10, 0),
(0, "2526", "3", 0, 0, 0, "k", "4d", "KNSB 4D", 10, 0),
(0, "2526", "4", 0, 0, 0, "k", "5g", "KNSB 6H", 10, 0),
(0, "2526", "5", 0, 0, 0, "k", "6g", "KNSB 6G", 10, 0),
(0, "2526", "6", 0, 0, 0, "k", "6f", "KNSB 6F", 10, 0),
(0, "2526", "int", 3, 0, 0, "i", "nt", "interne competitie", 0, 0),
(0, "2526", "ira", 4, 0, 0, "i", "ra", "rapid competitie", 0, 0),
(0, "2526", "kbe", 0, 0, 0, "k", "be", "KNSB beker", 4, 0);

insert into team (clubCode, seizoen, teamCode, reglement, maand, jaar, bond, poule, omschrijving, borden, teamleider) values -- TODO 0-0-0.nl
(0, "2526", "n0", 0, 0, 0, "n", "", "NHSB bij andere schaakvereniging", 0, 0),
(0, "2526", "n1", 0, 0, 0, "n", "t", "NHSB top", 8, 0),
(0, "2526", "n2", 0, 0, 0, "n", "1a", "NHSB 1A", 8, 0),
(0, "2526", "n3", 0, 0, 0, "n", "2b", "NHSB 2B", 6, 0),
(0, "2526", "n4", 0, 0, 0, "n", "2a", "NHSB 2A", 6, 0),
(0, "2526", "n5", 0, 0, 0, "n", "3a", "NHSB 3A", 6, 0),
(0, "2526", "nbb", 0, 0, 0, "n", "b", "Brons", 4, 0),
(0, "2526", "nbe", 0, 0, 0, "n", "b", "Goud", 4, 0),
(0, "2526", "nbz", 0, 0, 0, "n", "b", "Zilver", 4, 0),
(0, "2526", "nv1", 0, 0, 0, "n", "vd", "Viertallen D", 4, 0);

-- ronde
select * from ronde where clubCode = 0 and seizoen = @seizoen;
delete from ronde where clubCode = 0 and seizoen = @seizoen;

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2526", "1", 1, "u", "Promotie 1", '2025-09-20'),
(0, "2526", "1", 2, "t", "Spijkenisse 1", '2025-10-04'),
(0, "2526", "1", 3, "u", "Kennemer Combinatie 2", '2025-11-01'),
(0, "2526", "1", 4, "t", "Caissa-Eenhoorn 2", '2025-11-22'),
(0, "2526", "1", 5, "u", "VAS 2", '2025-12-13'),
(0, "2526", "1", 6, "t", "Leiderdorp 1", '2026-01-10'),
(0, "2526", "1", 7, "t", "CSV 1", '2026-02-07'),
(0, "2526", "1", 8, "u", "De Wijker Toren 1", '2026-03-07'),
(0, "2526", "1", 9, "t", "Philidor Leiden 1", '2026-04-11'),
(0, "2526", "2", 1, "u", "Caissa 2", '2025-09-20'),
(0, "2526", "2", 2, "t", "’t Saense Paard 1", '2025-10-04'),
(0, "2526", "2", 3, "u", "Zukertort Amstelveen 2", '2025-11-01'),
(0, "2526", "2", 4, "t", "Santpoort 1", '2025-11-22'),
(0, "2526", "2", 5, "u", "De Amstel 1", '2025-12-13'),
(0, "2526", "2", 6, "t", "Laurierboom-Gambiet 1", '2026-01-10'),
(0, "2526", "2", 7, "t", "Amsterdam West 1", '2026-02-07'),
(0, "2526", "2", 8, "u", "HWP Haarlem 2", '2026-03-07'),
(0, "2526", "2", 9, "t", "Emanuel Lasker 1", '2026-04-11'),
(0, "2526", "3", 1, "u", "Aartswoud 1", '2025-09-20'),
(0, "2526", "3", 2, "t", "Purmerend 2", '2025-10-04'),
(0, "2526", "3", 3, "u", "Zuidoost United 1", '2025-11-01'),
(0, "2526", "3", 4, "t", "Het Spaarne 1", '2025-11-22'),
(0, "2526", "3", 5, "u", "Opening '64 1", '2025-12-13'),
(0, "2526", "3", 6, "t", "Boven IJ / de Volewijckers 1", '2026-01-10'),
(0, "2526", "3", 7, "t", "Amsterdam West 2", '2026-02-07'),
(0, "2526", "3", 8, "u", "De Wijker Toren 2", '2026-03-07'),
(0, "2526", "3", 9, "t", "Philidor Leiden 2", '2026-04-11'),
(0, "2526", "4", 1, "t", "DSC Delft 6", '2025-10-04'),
(0, "2526", "4", 2, "u", "’t Saense Paard 4", '2025-11-01'),
(0, "2526", "4", 3, "t", "LSG 7", '2025-11-22'),
(0, "2526", "4", 4, "u", "Almere 4", '2025-12-13'),
(0, "2526", "4", 5, "t", "Kennemer Combinatie 5", '2026-01-10'),
(0, "2526", "4", 6, "t", "Amsterdam West 3", '2026-02-07'),
(0, "2526", "4", 7, "u", "DD 5", '2026-03-07'),
(0, "2526", "5", 1, "t", "Muider Schaakkring 1", '2025-10-04'),
(0, "2526", "5", 2, "u", "Zuidoost United 2", '2025-11-01'),
(0, "2526", "5", 3, "t", "De Queer Schaakclub 2", '2025-11-22'),
(0, "2526", "5", 4, "u", "VAS 9", '2025-12-13'),
(0, "2526", "5", 5, "t", "Kennemer Combinatie 6", '2026-01-10'),
(0, "2526", "5", 6, "t", "HWP Haarlem 7", '2026-02-07'),
(0, "2526", "5", 7, "u", "De Rode Loper 3", '2026-03-07'),
(0, "2526", "6", 1, "t", "Assendelft 1", '2025-10-04'),
(0, "2526", "6", 2, "u", "Purmerend 3", '2025-11-01'),
(0, "2526", "6", 3, "t", "Santpoort 3", '2025-11-22'),
(0, "2526", "6", 4, "u", "HHW Pietbulls 2", '2025-12-13'),
(0, "2526", "6", 5, "t", "Boven IJ / de Volewijckers 2", '2026-01-10'),
(0, "2526", "6", 6, "t", "Magnus 2", '2026-02-07'),
(0, "2526", "6", 7, "u", "HWP Haarlem 6", '2026-03-07');

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2526", "int", 1, "t", "", '2025-09-02'),
(0, "2526", "int", 2, "t", "", '2025-09-09'),
(0, "2526", "int", 3, "t", "", '2025-09-16'),
(0, "2526", "int", 4, "t", "", '2025-09-23'),
(0, "2526", "int", 5, "t", "", '2025-09-30'),
(0, "2526", "int", 6, "t", "", '2025-10-07'),
(0, "2526", "int", 7, "t", "", '2025-10-14'),
(0, "2526", "int", 8, "t", "", '2025-10-28'),
(0, "2526", "int", 9, "t", "", '2025-11-04'),
(0, "2526", "int", 10, "t", "", '2025-11-11'),
(0, "2526", "int", 11, "t", "", '2025-11-18'),
(0, "2526", "int", 12, "t", "", '2025-11-25'),
(0, "2526", "int", 13, "t", "", '2025-12-02'),
(0, "2526", "int", 14, "t", "", '2025-12-09'),
(0, "2526", "int", 15, "t", "", '2025-12-16'),
(0, "2526", "int", 16, "t", "", '2026-01-06'),
(0, "2526", "int", 17, "t", "", '2026-01-13'),
(0, "2526", "int", 18, "t", "", '2026-01-20'),
(0, "2526", "int", 19, "t", "", '2026-02-03'),
(0, "2526", "int", 20, "t", "", '2026-02-10'),
(0, "2526", "int", 21, "t", "", '2026-02-17'),
(0, "2526", "int", 22, "t", "", '2026-03-03'),
(0, "2526", "int", 23, "t", "", '2026-03-10'),
(0, "2526", "int", 24, "t", "", '2026-03-17'),
(0, "2526", "int", 25, "t", "", '2026-03-24'),
(0, "2526", "int", 26, "t", "", '2026-03-31'),
(0, "2526", "int", 27, "t", "", '2026-04-07'),
(0, "2526", "int", 28, "t", "", '2026-04-14'),
(0, "2526", "int", 29, "t", "", '2026-04-21'),
(0, "2526", "int", 30, "t", "", '2026-05-05'),
(0, "2526", "int", 31, "t", "", '2026-05-12'),
(0, "2526", "int", 32, "t", "", '2026-05-19'),
(0, "2526", "int", 33, "t", "", '2026-05-26'),
(0, "2526", "ira", 1, "t", "", '2025-10-21'),
(0, "2526", "ira", 2, "t", "", '2025-10-21'),
(0, "2526", "ira", 3, "t", "", '2025-10-21'),
(0, "2526", "ira", 4, "t", "", '2025-10-21'),
(0, "2526", "ira", 5, "t", "", '2026-02-24'),
(0, "2526", "ira", 6, "t", "", '2026-02-24'),
(0, "2526", "ira", 7, "t", "", '2026-02-24'),
(0, "2526", "ira", 8, "t", "", '2026-02-24'),
(0, "2526", "ira", 9, "t", "", '2026-04-28'),
(0, "2526", "ira", 10, "t", "", '2026-04-28'),
(0, "2526", "ira", 11, "t", "", '2026-04-28'),
(0, "2526", "ira", 12, "t", "", '2026-04-28');

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values -- TODO NHSB
(0, "2526", "n1", 1, "u", "'t Saense Paard N1", '2024-09-25');

-- speler TODO compleet maken
with r as (select * from rating  where jaar = 2025 and maand = 8)
select r.knsbNaam, r.knsbRating, s.* 
from speler s left join r on s.knsbNummer = r.knsbNummer  
where seizoen = "2425" and s.knsbNummer < 7234567;

-- speler toevoegen met knsbNummer
insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien)
with r as (select * from rating  where jaar = 2025 and maand = 8) -- augustus
select 0, "2526", "int", "", "", p.knsbNummer, r.knsbRating, "2025-08-01", r.knsbRating, "int", "", "", "", "", 0, 0, 0
from persoon p join r on p.knsbNummer = r.knsbNummer  
where p.knsbNummer in(8978717, 6420557, 7509920); -- Ellen van der Hoeven, Jasper Seelmeijer, Dirk van der Meiden

-- speler toevoegen met knsbNummer
insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien)
with r as (select * from rating  where jaar = 2025 and maand = 8) -- augustus
select 0, "2526", "int", "", "", p.knsbNummer, r.knsbRating, "2025-08-01", r.knsbRating, "int", "", "", "", "", 0, 0, 0
from persoon p join r on p.knsbNummer = r.knsbNummer  
where p.knsbNummer = 7084022; -- John Kramer

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2526", "int", "", "", 7084022, 1888, '2025-08-01', 1888, "int", "", "", "", "", 0, 0, 0);

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2526", "int", "", "", 6187885, 1615, '2025-09-01', 1615, "int", "", "", "", "", 0, 0, 0); -- Bob de Mon

-- rating 1-9-2025
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 8795941; -- Guido van Hesseling 
update speler set interneRating = 2232, knsbRating = 2232, datum = '2025-09-01', nhsbTeam = "n0" 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 8795941;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7428960; -- Frank Agter 
update speler set interneRating = 2227, knsbRating = 2227, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7428960;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 8096242; -- Michaël van Liempt 
update speler set interneRating = 2172, knsbRating = 2172, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 8096242;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 6335670; -- Hebert Perez Garcia 
update speler set interneRating = 2027, knsbRating = 2027, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 6335670;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7613166; -- Peter Kalisvaart 
update speler set interneRating = 2047, knsbRating = 2047, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7613166;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 8587337; -- Max Hooijmans 
update speler set interneRating = 1939, knsbRating = 1939, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 8587337;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7292043; -- Rob Freer 
update speler set interneRating = 1879, knsbRating = 1879, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7292043;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7546506; -- Edward Schenkel
update speler set interneRating = 1861, knsbRating = 1861, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7546506;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7699010; -- Ruud Niewenhuis
update speler set interneRating = 1826, knsbRating = 1826, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7699010;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 6951362; -- Johan Plooijer 
update speler set interneRating = 1778, knsbRating = 1778, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 6951362;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7443172; -- Anton Schermer 
update speler set interneRating = 1776, knsbRating = 1776, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7443172;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 9077651; -- Lennart van der Kraan
update speler set interneRating = 1630, knsbRating = 1630, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 9077651;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7777715; -- Richard Gooijers
update speler set interneRating = 1463, knsbRating = 1463, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7777715;

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer  
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and s.knsbNummer = 7771665; -- Yvonne Schol
update speler set interneRating = 1433, knsbRating = 1433, datum = '2025-09-01' 
where clubCode = 0 and seizoen = "2526" and teamCode = "int" and knsbNummer = 7771665;

select * from speler where knsbNummer = 7084022;

update speler set knsbRating = 1888 where knsbNummer = 7084022;

insert into gebruiker (knsbNummer, mutatieRechten, uuidToken, email, datumEmail, telefoon) values
(7084022, 1, uuid(), "john-kramer@kpnmail.nl", "2025-08-27", "");

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer 
where s.knsbNummer = 7084022; -- John Kramer

update speler set knsbTeam = "0" where seizoen = "2526" and knsbNummer = 8795941; -- Guido van Hesseling 


-- gebruiker toevoegen
set @seizoen = '2526';

select * from speler
where seizoen = @seizoen and knsbNummer in(7359913, 8285574, 8611922, 189, 190, 8966133, 9040845, 9045388); 
-- Dimitri Reinderman, Maaike Keetman, Tycho Bakker, Julian en Christian Huisman, Jelle Koopmans 

delete from speler
where seizoen = @seizoen and knsbNummer in(7359913, 8285574, 7778100, 8611922, 189, 190, 8966133, 9040845, 9045388); 
-- Dimitri Reinderman, Maaike Keetman, Arlette van Weersel, Tycho Bakker, Julian en Christian Huisman, Jelle Koopmans 

select * from uitslag 
where seizoen = @seizoen and teamCode ="1" and rondeNummer = 3 and knsbNummer = 8795941;

delete from uitslag 
where seizoen = @seizoen and teamCode ="1" and rondeNummer = 3 and knsbNummer = 8795941;

-- kopieer spelers van vorig seizoen met knsbNummer
insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien)
with r as (select * from rating  where jaar = 2025 and maand = 8) -- augustus
select 0, "2526", "int", "", "", s.knsbNummer, r.knsbRating, "2025-08-01", r.knsbRating, "int", "", "", "", "", 0, 0, 0
from speler s join r on s.knsbNummer = r.knsbNummer  
where seizoen = "2425";

-- kopieer spelers van vorig seizoen zonder knsbNummer
insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien)
select 0, "2526", "int", "", "", knsbNummer, 0, "2025-09-01", 1000, "int", "", "", "", "", 0, 0, 0
from speler  
where seizoen = "2425" and knsbNummer < 1000000;

select p.naam, s.* 
from speler s join persoon p on s.knsbNummer = p.knsbNummer
where seizoen = @seizoen order by p.naam;

with r as (select * from rating  where jaar = 2025 and maand = 9) -- TODO september 
select r.knsbRating, r.knsbNaam, s.* 
from speler s join r on s.knsbNummer = r.knsbNummer
where seizoen = @seizoen;

-- update spelers met rating van 1 september
with r as (select * from rating  where jaar = 2025 and maand = 9) -- TODO september
update speler s join r on s.knsbNummer = r.knsbNummer
set s.knsbRating = r.knsbRating, s.interneRating = r.knsbRating, s.datum = "2025-09-01"
where seizoen = @seizoen;  

-- spelers op rating
select naam, s.* 
from speler s join persoon p on p.knsbNummer = s.knsbNummer
where clubCode = 0 and seizoen = "2526" and teamCode = "int" 
order by s.knsbRating desc; 

select * from speler where seizoen = @seizoen and knsbNummer = 8978717;
delete from speler where seizoen = @seizoen;

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol, emailZien, telefoonZien) values
(0, "2526", "int", "", "", 103, 0, '2025-09-01', 1000, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 189, 0, '2025-09-01', 1000, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 190, 0, '2025-09-01', 1000, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 191, 0, '2025-09-01', 1000, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 5968611, 2102, '2025-08-01', 2102, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6207520, 1962, '2025-08-01', 1962, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6212404, 1771, '2025-08-01', 1771, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6214153, 1790, '2025-08-01', 1790, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6225934, 1885, '2025-08-01', 1885, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6335670, 2024, '2025-08-01', 2024, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6420557, 1864, '2025-08-01', 1864, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6565801, 1902, '2025-08-01', 1902, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6572511, 1912, '2025-08-01', 1912, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6930957, 1900, '2025-08-01', 1900, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 6951362, 1792, '2025-08-01', 1792, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7099950, 2010, '2025-08-01', 2010, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7101193, 1731, '2025-08-01', 1731, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7129991, 2045, '2025-08-01', 2045, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7210137, 1792, '2025-08-01', 1792, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7269900, 1785, '2025-08-01', 1785, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7282033, 1850, '2025-08-01', 1850, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7292043, 1892, '2025-08-01', 1892, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7321534, 1655, '2025-08-01', 1655, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7359913, 2523, '2025-08-01', 2523, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7386060, 1811, '2025-08-01', 1811, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7399469, 1757, '2025-08-01', 1757, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7419621, 1782, '2025-08-01', 1782, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7428960, 2250, '2025-08-01', 2250, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7441346, 1878, '2025-08-01', 1878, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7443172, 1755, '2025-08-01', 1755, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7468362, 1880, '2025-08-01', 1880, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7468417, 2018, '2025-08-01', 2018, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7504310, 1809, '2025-08-01', 1809, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7509920, 1986, '2025-08-01', 1986, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7518203, 1652, '2025-08-01', 1652, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7519930, 1678, '2025-08-01', 1678, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7529522, 1860, '2025-08-01', 1860, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7535385, 1808, '2025-08-01', 1808, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7535396, 1929, '2025-08-01', 1929, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7544438, 1923, '2025-08-01', 1923, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7546506, 1816, '2025-08-01', 1816, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7582102, 1554, '2025-08-01', 1554, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7584566, 2326, '2025-08-01', 2326, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7613166, 2019, '2025-08-01', 2019, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7649213, 1769, '2025-08-01', 1769, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7657342, 2274, '2025-08-01', 2274, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7665834, 1951, '2025-08-01', 1951, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7691728, 1589, '2025-08-01', 1589, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7699010, 1841, '2025-08-01', 1841, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7707832, 2040, '2025-08-01', 2040, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7731812, 1850, '2025-08-01', 1850, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7757409, 1857, '2025-08-01', 1857, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7758014, 1803, '2025-08-01', 1803, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7771665, 1438, '2025-08-01', 1438, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7777715, 1495, '2025-08-01', 1495, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7778100, 2140, '2025-08-01', 2140, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7809285, 1846, '2025-08-01', 1846, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7824674, 1915, '2025-08-01', 1915, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7828183, 2075, '2025-08-01', 2075, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7904589, 1816, '2025-08-01', 1816, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 7970094, 2219, '2025-08-01', 2219, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8073978, 1663, '2025-08-01', 1663, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8096242, 2116, '2025-08-01', 2116, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8112654, 1985, '2025-08-01', 1985, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8182416, 1736, '2025-08-01', 1736, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8224502, 1661, '2025-08-01', 1661, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8226317, 0, '2025-08-01', 0, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8243312, 1593, '2025-08-01', 1593, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8276752, 1736, '2025-08-01', 1736, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8285574, 2138, '2025-08-01', 2138, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8335415, 1537, '2025-08-01', 1537, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8350738, 1468, '2025-08-01', 1468, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8358966, 1565, '2025-08-01', 1565, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8372881, 1820, '2025-08-01', 1820, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8400183, 1871, '2025-08-01', 1871, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8472530, 1658, '2025-08-01', 1658, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8484443, 1924, '2025-08-01', 1924, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8485059, 1734, '2025-08-01', 1734, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8587337, 2004, '2025-08-01', 2004, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8611922, 1957, '2025-08-01', 1957, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8617367, 1710, '2025-08-01', 1710, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8744494, 1668, '2025-08-01', 1668, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8750093, 1810, '2025-08-01', 1810, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8795941, 2263, '2025-08-01', 2263, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8851073, 1200, '2025-08-01', 1200, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8886625, 1630, '2025-08-01', 1630, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8915346, 0, '2025-08-01', 0, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8931098, 0, '2025-08-01', 0, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8950876, 1310, '2025-08-01', 1310, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8966133, 0, '2025-08-01', 0, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 8978717, 1483, '2025-08-01', 1483, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9008967, 1787, '2025-08-01', 1787, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9023234, 1618, '2025-08-01', 1618, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9040845, 0, '2025-08-01', 0, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9045388, 1342, '2025-08-01', 1342, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9056674, 1879, '2025-08-01', 1879, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9065100, 2006, '2025-08-01', 2006, "int", "", "", "", "", 0, 0, 0),
(0, "2526", "int", "", "", 9077651, 1595, '2025-08-01', 1595, "int", "", "", "", "", 0, 0, 0);

-- ronde 1
insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 1, 0, 6565801, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7101193, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7399469, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7544438, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7582102, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7649213, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7665834, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7707832, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 7771665, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8400183, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8472530, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8484443, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8795941, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8978717, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 9065100, "a", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 0, 8226317, "p", "", 0, "", '2025-09-02', "int"),
(0, "2526", "int", 1, 1, 7535396, "i", "w", 5968611, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 1, 5968611, "i", "z", 7535396, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 2, 7613166, "i", "w", 7824674, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 2, 7824674, "i", "z", 7613166, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 3, 6572511, "i", "w", 7129991, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 3, 7129991, "i", "z", 6572511, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 4, 7099950, "i", "w", 6930957, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 4, 6930957, "i", "z", 7099950, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 5, 7084022, "i", "w", 8112654, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 5, 8112654, "i", "z", 7084022, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 6, 6207520, "i", "w", 7292043, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 6, 7292043, "i", "z", 6207520, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 7, 7441346, "i", "w", 8587337, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 7, 8587337, "i", "z", 7441346, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 8, 7386060, "i", "w", 7546506, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 8, 7546506, "i", "z", 7386060, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 9, 7529522, "i", "w", 7758014, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 9, 7758014, "i", "z", 7529522, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 10, 7210137, "i", "w", 7731812, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 10, 7731812, "i", "z", 7210137, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 11, 7282033, "i", "w", 7269900, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 11, 7269900, "i", "z", 7282033, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 12, 7419621, "i", "w", 7699010, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 12, 7699010, "i", "z", 7419621, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 13, 8372881, "i", "w", 6951362, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 13, 6951362, "i", "z", 8372881, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 14, 7443172, "i", "w", 7904589, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 14, 7904589, "i", "z", 7443172, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 15, 9023234, "i", "w", 6212404, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 15, 6212404, "i", "z", 9023234, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 16, 8617367, "i", "w", 6187885, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 16, 6187885, "i", "z", 8617367, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 17, 8243312, "i", "w", 7519930, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 17, 7519930, "i", "z", 8243312, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 18, 8073978, "i", "w", 8358966, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 18, 8358966, "i", "z", 8073978, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 19, 8335415, "i", "w", 8224502, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 19, 8224502, "i", "z", 8335415, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 20, 7321534, "i", "w", 8350738, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 20, 8350738, "i", "z", 7321534, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 21, 7777715, "i", "w", 7518203, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 21, 7518203, "i", "z", 7777715, "½", '2025-09-02', "int"),
(0, "2526", "int", 1, 22, 9077651, "i", "w", 8950876, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 22, 8950876, "i", "z", 9077651, "0", '2025-09-02', "int"),
(0, "2526", "int", 1, 23, 8915346, "i", "w", 192, "1", '2025-09-02', "int"),
(0, "2526", "int", 1, 23, 192, "i", "z", 8915346, "0", '2025-09-02', "int");

-- ronde 2 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 2;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 2, 0, 192, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 6212404, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 6565801, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 6572511, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 6930957, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 6951362, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7099950, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7101193, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7269900, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7282033, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7292043, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7321534, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7419621, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7443172, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7519930, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7529522, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7544438, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7546506, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7649213, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7665834, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7699010, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7707832, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7731812, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7771665, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8073978, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8112654, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8224502, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8243312, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8358966, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8587337, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 9023234, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 9065100, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 9077651, "m", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7399469, "n", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7535396, "n", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7758014, "n", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 5968611, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 6187885, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 6207520, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7084022, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7129991, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7210137, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7386060, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7441346, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7518203, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7582102, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7613166, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7777715, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7824674, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7904589, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8226317, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8335415, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8350738, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8372881, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8400183, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8472530, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8484443, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8617367, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8795941, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8915346, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8950876, "p", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8978717, "p", "", 0, "", '2025-09-09', "int");


-- ronde 3 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 2;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- Waagtoren KNSB beker

-- Waagtoren 1
set @team = "1";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

-- Waagtoren NHSB beker

-- Waagtoren n1
set @team = "n1";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
