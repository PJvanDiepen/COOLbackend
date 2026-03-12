use waagtoren; -- ga naar TODO
set @seizoen = "2526";
set @team = "n1";

-- @team.csv
select * from ronde where seizoen = @seizoen and teamCode = @team order by rondeNummer;
select * from uitslag where seizoen = @seizoen and teamCode = @team order by rondeNummer, bordNummer;

-- actieve gebruikers
select distinct m.knsbNummer, naam from mutatie m join persoon p on p.knsbNummer = m.knsbNummer order by naam;   

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

-- TODO wijzig datum externe KNSB wedstrijd
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

-- TODO wijzig datum externe NHSB wedstrijd en wissel ronden
set @seizoen = '2526';
set @team = 'n1';
set @oudeRonde = 6;
set @nieuweRonde = 5; 

select * from ronde where clubCode = 0 and seizoen = @seizoen and teamCode = @team;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer in (@oudeRonde, @nieuweRonde);
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer in (@oudeRonde, @nieuweRonde);

update ronde set uithuis = "u", tegenstander = "Bloemendaal N1", datum = '2026-03-04' 
where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @oudeRonde;
update ronde set uithuis = "t", tegenstander = "Purmerend N1", datum = '2026-02-10'
where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @nieuweRonde;

-- TODO partij wijzigen
set @seizoen = '2526';
set @team = 'int';
set @competitie = 'int';
set @ronde = 22;
set @bord = 14;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and bordNummer = @bord;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = "e";

set @wit   = 7210137; -- Arjen Dibbets
set @zwart = 5968611; -- Nico Hauwert

select * from persoon where knsbNummer = @wit;

set @oneven = 7529522; -- Willem Meyles
set @afwezig = 7758014; -- Alex Albrecht
set @extern = 6572511; -- Bert Buitink

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

select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer in(193, 194);

-- TODO wit / zwart wijzigen

update uitslag set witZwart = 'w'
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set witZwart = 'z'
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

-- teams
select * from team where clubCode = 0 and seizoen = @seizoen;

insert into team (clubCode, seizoen, teamCode, reglement, maand, jaar, bond, poule, omschrijving, borden, teamleider) values
(0, "2526", "", 0, 0, 0, "", "", "geen", 0, 0),
(0, "2526", "0", 0, 0, 0, "k", "", "KNSB bij andere schaakvereniging", 0, 0),
(0, "2526", "1", 0, 0, 0, "k", "2b", "KNSB 2B", 10, 0),
(0, "2526", "2", 0, 0, 0, "k", "3c", "KNSB 3C", 10, 0),
(0, "2526", "3", 0, 0, 0, "k", "4d", "KNSB 4D", 10, 0),
(0, "2526", "4", 0, 0, 0, "k", "6h", "KNSB 6H", 10, 0),
(0, "2526", "5", 0, 0, 0, "k", "6g", "KNSB 6G", 10, 0),
(0, "2526", "6", 0, 0, 0, "k", "6f", "KNSB 6F", 10, 0),
(0, "2526", "int", 3, 0, 0, "i", "nt", "interne competitie", 0, 0),
(0, "2526", "ira", 4, 0, 0, "i", "ra", "rapid competitie", 0, 0),
(0, "2526", "kbe", 0, 0, 0, "k", "be", "KNSB beker", 4, 0),
(0, "2526", "n1", 0, 0, 0, "n", "t", "NHSB T", 8, 0),
(0, "2526", "n2", 0, 0, 0, "n", "1a", "NHSB 1A", 8, 0),
(0, "2526", "n3", 0, 0, 0, "n", "2a", "NHSB 2A", 6, 0),
(0, "2526", "n4", 0, 0, 0, "n", "2b", "NHSB 2B", 6, 0),
(0, "2526", "n5", 0, 0, 0, "n", "2a", "NHSB 2A", 6, 0),
(0, "2526", "nbb", 0, 0, 0, "n", "b", "Brons", 4, 0),
(0, "2526", "nbe", 0, 0, 0, "n", "b", "Goud", 4, 0),
(0, "2526", "nbz", 0, 0, 0, "n", "b", "Zilver", 4, 0),
(0, "2526", "nv1", 0, 0, 0, "n", "vf", "NHSB VF",4,0);

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
(0,"2526","kbe",2,"u","De Wijker Toren",'2025-12-14'),
(0,"2526","kbe",3,"u","Kennemer Combinatie",'2026-02-08'),
(0,"2526","kbe",4,"u","HWP Haarlem",'2026-03-17');

select * from ronde where clubCode = 0 and seizoen = "2526" and teamCode = "kbe";
update ronde set datum = '2025-12-14' where clubCode = 0 and seizoen = "2526" and teamCode = "kbe" and rondeNummer = 2;
update ronde set datum = '2026-02-08' where clubCode = 0 and seizoen = "2526" and teamCode = "kbe" and rondeNummer = 3;
update ronde set datum = '2026-03-17' where clubCode = 0 and seizoen = "2526" and teamCode = "kbe" and rondeNummer = 4;

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0,"2526","kbe",4,"u","HWP Haarlem",'2026-03-17');

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0,"2526","nbb",1,"u","Vredeburg B",'2025-11-14'),
(0,"2526","nbe",1,"u","Opening 64 G",'2025-12-12'),
(0,"2526","nbz",1,"u","MSC Z",'2025-11-25');

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0,"2526","nbb",2,"u","Santpoort B",'2026-02-10'),
(0,"2526","nbe",2,"t",'HWP Haarlem G','2026-02-03'),
(0,"2526","nbz",2,"t","Het Spaarne Z",'2026-02-17');

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0,"2526","nbz",3,"u","De Uil Z",'2026-03-09');

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2526", "n1", 1, "t", "Opening 64 N1", '2025-09-23'),
(0, "2526", "n1", 2, "u", "Wijker Toren N1", '2025-10-16'),
(0, "2526", "n1", 3, "u", "HWP Haarlem N1", '2025-11-11'),
(0, "2526", "n1", 4, "t", "Chess Society Zandvoort N1", '2025-12-02'),
(0, "2526", "n1", 5, "u", "Bloemendaal N1", '2026-01-07'),
(0, "2526", "n1", 6, "t", "Purmerend N1", '2026-02-10'),
(0, "2526", "n1", 7, "u", "Santpoort N1", '2026-03-10'),
(0, "2526", "n1", 8, "t", "Caïssa-Eenhoorn N1", '2026-03-31'),
(0, "2526", "n1", 9, "u", "'t Saense Paard N1", '2026-04-17'),
(0, "2526", "n2", 1, "u", "Noordk. Comb. Magnus N1", '2025-09-26'),
(0, "2526", "n2", 2, "t", "Caïssa-Eenhoorn N2", '2025-10-14'),
(0, "2526", "n2", 3, "t", "Aartswoud N1", '2025-11-11'),
(0, "2526", "n2", 4, "u", "Schaakmat N1", '2025-12-02'),
(0, "2526", "n2", 5, "t", "Krommenie N1", '2026-02-10'),
(0, "2526", "n2", 6, "u", "Aris de Heer N1", '2026-03-09'),
(0, "2526", "n2", 7, "t", "Opening 64 N2", '2026-03-31'),
(0, "2526", "n3", 1, "u", "NKC MSC 2", '2025-09-30'),
(0, "2526", "n3", 2, "t", "Koedijk N1", '2025-10-28'),
(0, "2526", "n3", 3, "t", "De Waagtoren N5", '2025-11-18'),
(0, "2526", "n3", 4, "u", "HHW Pietbulls N1", '2025-12-11'),
(0, "2526", "n3", 5, "t", "Bergen N1", '2026-02-03'),
(0, "2526", "n3", 6, "u", "En Passant N", '2026-03-14'),
(0, "2526", "n3", 7, "t", "Oppositie N1", '2026-04-07'),
(0, "2526", "n4", 1, "t", "'t Saense Paard N3", '2025-09-30'),
(0, "2526", "n4", 2, "u", "KTV N1", '2025-10-31'),
(0, "2526", "n4", 3, "t", "Caïssa-Eenhoorn N3", '2025-11-18'),
(0, "2526", "n4", 4, "u", "Castricum N2", '2025-12-12'),
(0, "2526", "n4", 5, "t", "Krommenie N2", '2026-02-03'),
(0, "2526", "n4", 6, "u", "Aartswoud N2", '2026-03-06'),
(0, "2526", "n4", 7, "t", "Volendam N1", '2026-04-07'),
(0, "2526", "n5", 1, "u", "Oppositie N1", '2025-09-30'),
(0, "2526", "n5", 2, "t", "NKC MSC 2", '2025-10-28'),
(0, "2526", "n5", 3, "u", "De Waagtoren N3", '2025-11-18'),
(0, "2526", "n5", 4, "t", "Koedijk N1", '2025-12-09'),
(0, "2526", "n5", 5, "t", "HHW Pietbulls N1", '2026-02-03'),
(0, "2526", "n5", 6, "u", "Bergen N1", '2026-03-05'),
(0, "2526", "n5", 7, "t", "En Passant N", '2026-04-11');

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0,"2526","nv1",1,"u","Vredeburg V",'2025-11-14'),
(0,"2526","nv1",2,"u","Castricum V",'2025-11-28'),
(0,"2526","nv1",3,"t","'t Saense Paard V",'2026-01-06'),
(0,"2526","nv1",4,"t","Vredeburg V",'2026-02-10'),
(0,"2526","nv1",5,"u","'t Saense Paard V",'2026-03-09'),
(0,"2526","nv1",6,"t","Castricum V",'2026-03-31');

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

-- speler TODO compleet maken
with r as (select * from rating  where jaar = 2025 and maand = 8)
select r.knsbNaam, r.knsbRating, s.* 
from speler s left join r on s.knsbNummer = r.knsbNummer  
where seizoen = "2425" and s.knsbNummer < 7234567;

-- speler
insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol) values
(0, "2526", "int", "", "", 200, 0, '2025-09-01', 1200, "int", "", "", "", "", "");

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol) values
(0, "2526", "int", "", "", 103, 0, '2025-09-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "0", "0", 132, 0, '2000-09-01', 1300, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 191, 0, '2025-09-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "0", "0", 192, 0, '2000-09-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "0", "0", 193, 0, '2000-09-01', 1550, "int", "", "", "", "", ""),
(0, "2526", "int", "0", "0", 194, 0, '2000-09-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "0", "0", 195, 0, '2000-09-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "0", "0", 196, 0, '2000-09-01', 1450, "int", "", "", "", "", ""),
(0, "2526", "int", "0", "0", 197, 0, '2000-09-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "n0", "0", 198, 0, '2026-02-02', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 199, 0, '2025-09-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 200, 0, '2025-09-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "n1", "2", 5968611, 2102, '2025-08-01', 2102, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 6187885, 1615, '2025-09-01', 1615, "int", "", "", "", "", ""),
(0, "2526", "int", "n2", "3", 6207520, 1962, '2025-08-01', 1962, "int", "", "", "", "", ""),
(0, "2526", "int", "n4", "5", 6212404, 1771, '2025-08-01', 1771, "int", "", "", "", "", ""),
(0, "2526", "int", "n4", "", 6214153, 1790, '2025-08-01', 1790, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 6225934, 1885, '2025-08-01', 1885, "int", "", "", "", "", ""),
(0, "2526", "int", "", "2", 6335670, 2027, '2025-09-01', 2027, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 6420557, 1864, '2025-08-01', 1864, "int", "", "", "", "", ""),
(0, "2526", "int", "n3", "", 6565801, 1902, '2025-08-01', 1902, "int", "", "", "", "", ""),
(0, "2526", "int", "", "3", 6572511, 1912, '2025-08-01', 1912, "int", "", "", "", "", ""),
(0, "2526", "int", "n3", "3", 6930957, 1900, '2025-08-01', 1900, "int", "", "", "", "", ""),
(0, "2526", "int", "", "5", 6951362, 1778, '2025-09-01', 1778, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7084022, 1888, '2025-08-01', 1888, "int", "", "", "", "", ""),
(0, "2526", "int", "n2", "1", 7099950, 2010, '2025-08-01', 2010, "int", "", "", "", "", ""),
(0, "2526", "int", "n5", "", 7101193, 1731, '2025-08-01', 1731, "int", "", "", "", "", ""),
(0, "2526", "int", "n1", "2", 7129991, 2045, '2025-08-01', 2045, "int", "", "", "", "", ""),
(0, "2526", "int", "n4", "", 7210137, 1792, '2025-08-01', 1792, "int", "", "", "", "", ""),
(0, "2526", "int", "", "5", 7269900, 1785, '2025-08-01', 1785, "int", "", "", "", "", ""),
(0, "2526", "int", "n4", "4", 7282033, 1850, '2025-08-01', 1850, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7292043, 1879, '2025-09-01', 1879, "int", "", "", "", "", ""),
(0, "2526", "int", "n5", "6", 7321534, 1655, '2025-08-01', 1655, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7386060, 1811, '2025-08-01', 1811, "int", "", "", "", "", ""),
(0, "2526", "int", "n5", "5", 7399469, 1757, '2025-08-01', 1757, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7419621, 1782, '2025-08-01', 1782, "int", "", "", "", "", ""),
(0, "2526", "int", "n1", "1", 7428960, 2227, '2025-09-01', 2227, "int", "", "", "", "", ""),
(0, "2526", "int", "n0", "", 7441346, 1878, '2025-08-01', 1878, "int", "", "", "", "", ""),
(0, "2526", "int", "", "5", 7443172, 1776, '2025-09-01', 1776, "int", "", "", "", "", ""),
(0, "2526", "int", "n3", "", 7468362, 1880, '2025-08-01', 1880, "int", "", "", "", "", ""),
(0, "2526", "int", "", "1", 7468417, 2018, '2025-08-01', 2018, "int", "", "", "", "", ""),
(0, "2526", "int", "", "4", 7504310, 1809, '2025-08-01', 1809, "int", "", "", "", "", ""),
(0, "2526", "int", "", "2", 7509920, 1986, '2025-08-01', 1986, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7518203, 1652, '2025-08-01', 1652, "int", "", "", "", "", ""),
(0, "2526", "int", "n5", "4", 7519930, 1678, '2025-08-01', 1678, "int", "", "", "", "", ""),
(0, "2526", "int", "n3", "", 7529522, 1860, '2025-08-01', 1860, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7535385, 1808, '2025-08-01', 1808, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7535396, 1929, '2025-08-01', 1929, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7544438, 1923, '2025-08-01', 1923, "int", "", "", "", "", ""),
(0, "2526", "int", "n4", "4", 7546506, 1861, '2025-09-01', 1861, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7582102, 1554, '2025-08-01', 1554, "int", "", "", "", "", ""),
(0, "2526", "int", "", "1", 7584566, 2326, '2025-08-01', 2326, "int", "", "", "", "", ""),
(0, "2526", "int", "n1", "2", 7613166, 2047, '2025-09-01', 2047, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7649213, 1769, '2025-08-01', 1769, "int", "", "", "", "", ""),
(0, "2526", "int", "", "1", 7657342, 2274, '2025-08-01', 2274, "int", "", "", "", "", ""),
(0, "2526", "int", "", "3", 7665834, 1951, '2025-08-01', 1951, "int", "", "", "", "", ""),
(0, "2526", "int", "", "6", 7691728, 1589, '2025-08-01', 1589, "int", "", "", "", "", ""),
(0, "2526", "int", "", "4", 7699010, 1826, '2025-09-01', 1826, "int", "", "", "", "", ""),
(0, "2526", "int", "n1", "2", 7707832, 2040, '2025-08-01', 2040, "int", "", "", "", "", ""),
(0, "2526", "int", "n3", "", 7731812, 1850, '2025-08-01', 1850, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7757409, 1857, '2025-08-01', 1857, "int", "", "", "", "", ""),
(0, "2526", "int", "n4", "4", 7758014, 1803, '2025-08-01', 1803, "int", "", "", "", "", ""),
(0, "2526", "int", "", "6", 7771665, 1433, '2025-09-01', 1433, "int", "", "", "", "", ""),
(0, "2526", "int", "", "6", 7777715, 1463, '2025-09-01', 1463, "int", "", "", "", "", ""),
(0, "2526", "int", "", "4", 7809285, 1846, '2025-08-01', 1846, "int", "", "", "", "", ""),
(0, "2526", "int", "n2", "", 7824674, 1915, '2025-08-01', 1915, "int", "", "", "", "", ""),
(0, "2526", "int", "", "1", 7828183, 2075, '2025-08-01', 2075, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 7879520, 2054, '2025-09-01', 2054, "int", "", "", "", "", ""),
(0, "2526", "int", "", "4", 7904589, 1816, '2025-08-01', 1816, "int", "", "", "", "", ""),
(0, "2526", "int", "n1", "1", 7970094, 2219, '2025-08-01', 2219, "int", "", "", "", "", ""),
(0, "2526", "int", "", "5", 8073978, 1663, '2025-08-01', 1663, "int", "", "", "", "", ""),
(0, "2526", "int", "n1", "1", 8096242, 2172, '2025-09-01', 2172, "int", "", "", "", "", ""),
(0, "2526", "int", "n2", "2", 8112654, 1985, '2025-08-01', 1985, "int", "", "", "", "", ""),
(0, "2526", "int", "", "5", 8182416, 1736, '2025-08-01', 1736, "int", "", "", "", "", ""),
(0, "2526", "int", "", "6", 8224502, 1661, '2025-08-01', 1661, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8226317, 0, '2025-08-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8243312, 1593, '2025-08-01', 1593, "int", "", "", "", "", ""),
(0, "2526", "int", "n5", "", 8276752, 1736, '2025-08-01', 1736, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8285574, 2195, '2025-08-01', 2195, "", "", "", "", "", ""),
(0, "2526", "int", "", "", 8335415, 1537, '2025-08-01', 1537, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8350738, 1468, '2025-08-01', 1468, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8358966, 1565, '2025-08-01', 1565, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8372881, 1820, '2025-08-01', 1820, "int", "", "", "", "", ""),
(0, "2526", "int", "", "3", 8400183, 1871, '2025-08-01', 1871, "int", "", "", "", "", ""),
(0, "2526", "int", "", "5", 8472530, 1658, '2025-08-01', 1658, "int", "", "", "", "", ""),
(0, "2526", "int", "n2", "3", 8484443, 1924, '2025-08-01', 1924, "int", "", "", "", "", ""),
(0, "2526", "int", "n5", "", 8485059, 1734, '2025-08-01', 1734, "int", "", "", "", "", ""),
(0, "2526", "int", "n1", "2", 8587337, 1939, '2025-09-01', 1939, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8617367, 1710, '2025-08-01', 1710, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8744494, 1668, '2025-08-01', 1668, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8750093, 1810, '2025-08-01', 1810, "int", "", "", "", "", ""),
(0, "2526", "int", "n0", "0", 8795941, 2232, '2025-09-01', 2232, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8851073, 1200, '2025-08-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8915346, 0, '2025-08-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8931098, 0, '2025-08-01', 1200, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8950876, 1310, '2025-08-01', 1310, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 8956805, 2217, '2025-08-01', 2217, "", "", "", "", "", ""),
(0, "2526", "int", "", "6", 8978717, 1483, '2025-08-01', 1483, "int", "", "", "", "", ""),
(0, "2526", "int", "", "6", 9023234, 1618, '2025-08-01', 1618, "int", "", "", "", "", ""),
(0, "2526", "int", "n3", "3", 9056674, 1879, '2025-08-01', 1879, "int", "", "", "", "", ""),
(0, "2526", "int", "n2", "3", 9065100, 2006, '2025-08-01', 2006, "int", "", "", "", "", ""),
(0, "2526", "int", "", "6", 9077651, 1630, '2025-09-01', 1630, "int", "", "", "", "", ""),
(0, "2526", "int", "", "", 9157841, 0, '2025-09-01', 1200, "int", "", "", "", "", "");

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

-- ronde 2
insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 2, 0, 5968611, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 6207520, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 6565801, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7101193, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7210137, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7399469, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7518203, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7544438, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7758014, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7771665, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7824674, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 7904589, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8226317, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8243312, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8358966, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8400183, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8472530, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8617367, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8750093, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 0, 8978717, "a", "", 0, "", '2025-09-09', "int"),
(0, "2526", "int", 2, 1, 7129991, "i", "w", 7613166, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 1, 7613166, "i", "z", 7129991, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 2, 7441346, "i", "w", 7099950, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 2, 7099950, "i", "z", 7441346, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 3, 7546506, "i", "w", 8112654, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 3, 8112654, "i", "z", 7546506, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 4, 7443172, "i", "w", 7529522, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 4, 7529522, "i", "z", 7443172, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 5, 6187885, "i", "w", 7282033, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 5, 7282033, "i", "z", 6187885, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 6, 7519930, "i", "w", 8073978, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 6, 8073978, "i", "z", 7519930, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 7, 9077651, "i", "w", 7321534, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 7, 7321534, "i", "z", 9077651, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 8, 7535396, "i", "w", 8915346, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 8, 8915346, "i", "z", 7535396, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 9, 6951362, "i", "w", 7419621, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 9, 7419621, "i", "z", 6951362, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 10, 7699010, "i", "w", 8372881, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 10, 8372881, "i", "z", 7699010, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 11, 8335415, "i", "w", 9023234, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 11, 9023234, "i", "z", 8335415, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 12, 6212404, "i", "w", 8795941, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 12, 8795941, "i", "z", 6212404, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 13, 7970094, "i", "w", 7428960, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 13, 7428960, "i", "z", 7970094, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 14, 9065100, "i", "w", 7707832, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 14, 7707832, "i", "z", 9065100, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 15, 8224502, "i", "w", 7777715, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 15, 7777715, "i", "z", 8224502, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 16, 7649213, "i", "w", 8484443, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 16, 8484443, "i", "z", 7649213, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 17, 8485059, "i", "w", 8276752, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 17, 8276752, "i", "z", 8485059, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 18, 132, "i", "w", 7582102, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 18, 7582102, "i", "z", 132, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 19, 7665834, "i", "w", 6572511, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 19, 6572511, "i", "z", 7665834, "½", '2025-09-09', "int"),
(0, "2526", "int", 2, 20, 7292043, "i", "w", 6930957, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 20, 6930957, "i", "z", 7292043, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 21, 8587337, "i", "w", 7386060, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 21, 7386060, "i", "z", 8587337, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 22, 7731812, "i", "w", 7269900, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 22, 7269900, "i", "z", 7731812, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 23, 192, "i", "w", 8950876, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 23, 8950876, "i", "z", 192, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 24, 193, "i", "w", 194, "0", '2025-09-09', "int"),
(0, "2526", "int", 2, 24, 194, "i", "z", 193, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 25, 7084022, "i", "w", 8350738, "1", '2025-09-09', "int"),
(0, "2526", "int", 2, 25, 8350738, "i", "z", 7084022, "0", '2025-09-09', "int");

-- ronde 3
insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 3, 0, 132, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 192, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 193, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 6207520, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 6565801, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 6951362, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7084022, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7210137, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7269900, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7428960, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7519930, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7649213, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7665834, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7699010, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7758014, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7771665, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7904589, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8226317, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8243312, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8276752, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8372881, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8400183, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8472530, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8484443, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8587337, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8617367, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8750093, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8795941, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8978717, "a", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 7777715, "o", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 0, 8950876, "o", "", 0, "", '2025-09-16', "int"),
(0, "2526", "int", 3, 1, 7546506, "i", "w", 7129991, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 1, 7129991, "i", "z", 7546506, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 2, 7282033, "i", "w", 7529522, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 2, 7529522, "i", "z", 7282033, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 3, 7321534, "i", "w", 7441346, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 3, 7441346, "i", "z", 7321534, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 4, 7099950, "i", "w", 7970094, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 4, 7970094, "i", "z", 7099950, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 5, 9023234, "i", "w", 7535396, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 5, 7535396, "i", "z", 9023234, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 6, 7613166, "i", "w", 7292043, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 6, 7292043, "i", "z", 7613166, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 7, 8112654, "i", "w", 7386060, "½", '2025-09-16', "int"),
(0, "2526", "int", 3, 7, 7386060, "i", "z", 8112654, "½", '2025-09-16', "int"),
(0, "2526", "int", 3, 8, 7707832, "i", "w", 7443172, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 8, 7443172, "i", "z", 7707832, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 9, 6187885, "i", "w", 9065100, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 9, 9065100, "i", "z", 6187885, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 10, 5968611, "i", "w", 7419621, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 10, 7419621, "i", "z", 5968611, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 11, 194, "i", "w", 8915346, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 11, 8915346, "i", "z", 194, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 12, 8073978, "i", "w", 7544438, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 12, 7544438, "i", "z", 8073978, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 13, 8224502, "i", "w", 9077651, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 13, 9077651, "i", "z", 8224502, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 14, 6572511, "i", "w", 9056674, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 14, 9056674, "i", "z", 6572511, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 15, 7518203, "i", "w", 7399469, "½", '2025-09-16', "int"),
(0, "2526", "int", 3, 15, 7399469, "i", "z", 7518203, "½", '2025-09-16', "int"),
(0, "2526", "int", 3, 16, 6212404, "i", "w", 7101193, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 16, 7101193, "i", "z", 6212404, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 17, 7824674, "i", "w", 7582102, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 17, 7582102, "i", "z", 7824674, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 18, 8485059, "i", "w", 8335415, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 18, 8335415, "i", "z", 8485059, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 19, 6930957, "i", "w", 8358966, "1", '2025-09-16', "int"),
(0, "2526", "int", 3, 19, 8358966, "i", "z", 6930957, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 20, 8350738, "i", "w", 7731812, "0", '2025-09-16', "int"),
(0, "2526", "int", 3, 20, 7731812, "i", "z", 8350738, "1", '2025-09-16', "int");

-- ronde 4
set @seizoen = "2526";
set @team = "int";
set @ronde = 4;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 4, 0, 193, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 194, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 5968611, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 6187885, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 6207520, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7084022, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7101193, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7269900, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7399469, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7529522, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7535396, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7649213, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7707832, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7758014, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7771665, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8224502, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8243312, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8372881, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8400183, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8472530, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8485059, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8617367, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8795941, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 9056674, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 9065100, "a", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7099950, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7129991, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7428960, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7613166, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 7970094, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8096242, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8112654, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 0, 8587337, "e", "", 0, "", '2025-09-23', "int"),
(0, "2526", "int", 4, 1, 7441346, "i", "w", 7282033, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 1, 7282033, "i", "z", 7441346, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 2, 7519930, "i", "w", 7546506, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 2, 7546506, "i", "z", 7519930, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 3, 8484443, "i", "w", 7699010, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 3, 7699010, "i", "z", 8484443, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 4, 7544438, "i", "w", 7321534, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 4, 7321534, "i", "z", 7544438, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 5, 7777715, "i", "w", 9077651, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 5, 9077651, "i", "z", 7777715, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 6, 7386060, "i", "w", 7210137, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 6, 7210137, "i", "z", 7386060, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 7, 8276752, "i", "w", 6212404, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 7, 6212404, "i", "z", 8276752, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 8, 9023234, "i", "w", 7665834, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 8, 7665834, "i", "z", 9023234, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 9, 7292043, "i", "w", 7824674, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 9, 7824674, "i", "z", 7292043, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 10, 7879520, "i", "w", 6951362, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 10, 6951362, "i", "z", 7879520, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 11, 6930957, "i", "w", 6565801, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 11, 6565801, "i", "z", 6930957, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 12, 7419621, "i", "w", 7443172, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 12, 7443172, "i", "z", 7419621, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 13, 8750093, "i", "w", 7518203, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 13, 7518203, "i", "z", 8750093, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 14, 7731812, "i", "w", 8073978, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 14, 8073978, "i", "z", 7731812, "½", '2025-09-23', "int"),
(0, "2526", "int", 4, 15, 192, "i", "w", 6572511, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 15, 6572511, "i", "z", 192, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 16, 8915346, "i", "w", 7904589, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 16, 7904589, "i", "z", 8915346, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 17, 8950876, "i", "w", 132, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 17, 132, "i", "z", 8950876, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 18, 7582102, "i", "w", 8978717, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 18, 8978717, "i", "z", 7582102, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 19, 8226317, "i", "w", 8335415, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 19, 8335415, "i", "z", 8226317, "1", '2025-09-23', "int"),
(0, "2526", "int", 4, 20, 8358966, "i", "w", 8350738, "0", '2025-09-23', "int"),
(0, "2526", "int", 4, 20, 8350738, "i", "z", 8358966, "1", '2025-09-23', "int");

-- ronde 5
set @seizoen = "2526";
set @team = "int";
set @ronde = 5;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 5, 0, 132, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 193, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 194, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 6207520, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7084022, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7428960, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7535396, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7544438, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7613166, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7649213, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7699010, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7707832, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7771665, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7970094, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8096242, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8335415, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8372881, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8400183, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8472530, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8484443, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8587337, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8617367, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8750093, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8795941, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8915346, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8950876, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8978717, "a", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 6212404, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 6214153, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 6565801, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 6930957, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7101193, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7210137, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7282033, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7321534, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7399469, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7468362, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7519930, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7529522, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7546506, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7731812, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 7758014, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8276752, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 8485059, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 0, 9056674, "e", "", 0, "", '2025-09-30', "int"),
(0, "2526", "int", 5, 1, 7129991, "i", "w", 9065100, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 1, 9065100, "i", "z", 7129991, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 2, 8112654, "i", "w", 7441346, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 2, 7441346, "i", "z", 8112654, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 3, 5968611, "i", "w", 7099950, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 3, 7099950, "i", "z", 5968611, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 4, 9077651, "i", "w", 7292043, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 4, 7292043, "i", "z", 9077651, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 5, 7665834, "i", "w", 7879520, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 5, 7879520, "i", "z", 7665834, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 6, 7269900, "i", "w", 7419621, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 6, 7419621, "i", "z", 7269900, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 7, 7386060, "i", "w", 7777715, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 7, 7777715, "i", "z", 7386060, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 8, 7824674, "i", "w", 6572511, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 8, 6572511, "i", "z", 7824674, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 9, 7904589, "i", "w", 9023234, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 9, 9023234, "i", "z", 7904589, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 10, 6951362, "i", "w", 8073978, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 10, 8073978, "i", "z", 6951362, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 11, 7443172, "i", "w", 6187885, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 11, 6187885, "i", "z", 7443172, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 12, 7518203, "i", "w", 8224502, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 12, 8224502, "i", "z", 7518203, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 13, 8350738, "i", "w", 192, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 13, 192, "i", "z", 8350738, "½", '2025-09-30', "int"),
(0, "2526", "int", 5, 14, 7582102, "i", "w", 8243312, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 14, 8243312, "i", "z", 7582102, "0", '2025-09-30', "int"),
(0, "2526", "int", 5, 15, 8358966, "i", "w", 8226317, "1", '2025-09-30', "int"),
(0, "2526", "int", 5, 15, 8226317, "i", "z", 8358966, "0", '2025-09-30', "int");

-- ronde 6
insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 6, 0, 132, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 192, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 193, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 194, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 195, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 196, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 6207520, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7084022, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7101193, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7210137, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7399469, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7441346, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7468362, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7518203, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7519930, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7535396, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7546506, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7649213, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7691728, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7699010, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7707832, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7758014, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7771665, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7879520, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7904589, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7970094, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8096242, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8276752, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8372881, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8400183, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8472530, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8484443, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8485059, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8587337, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8617367, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8744494, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8795941, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8931098, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8978717, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 9065100, "a", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 7824674, "o", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 0, 8350738, "o", "", 0, "", '2025-10-07', "int"),
(0, "2526", "int", 6, 1, 7282033, "i", "w", 7129991, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 1, 7129991, "i", "z", 7282033, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 2, 8112654, "i", "w", 5968611, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 2, 5968611, "i", "z", 8112654, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 3, 7529522, "i", "w", 7613166, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 3, 7613166, "i", "z", 7529522, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 4, 9056674, "i", "w", 9077651, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 4, 9077651, "i", "z", 9056674, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 5, 7544438, "i", "w", 7665834, "½", '2025-10-07', "int"),
(0, "2526", "int", 6, 5, 7665834, "i", "z", 7544438, "½", '2025-10-07', "int"),
(0, "2526", "int", 6, 6, 7292043, "i", "w", 7099950, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 6, 7099950, "i", "z", 7292043, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 7, 7321534, "i", "w", 6212404, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 7, 6212404, "i", "z", 7321534, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 8, 7419621, "i", "w", 6930957, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 8, 6930957, "i", "z", 7419621, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 9, 7428960, "i", "w", 6951362, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 9, 6951362, "i", "z", 7428960, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 10, 6565801, "i", "w", 7386060, "½", '2025-10-07', "int"),
(0, "2526", "int", 6, 10, 7386060, "i", "z", 6565801, "½", '2025-10-07', "int"),
(0, "2526", "int", 6, 11, 7269900, "i", "w", 8750093, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 11, 8750093, "i", "z", 7269900, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 12, 6572511, "i", "w", 7443172, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 12, 7443172, "i", "z", 6572511, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 14, 6214153, "i", "w", 7731812, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 14, 7731812, "i", "z", 6214153, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 15, 7777715, "i", "w", 9023234, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 15, 9023234, "i", "z", 7777715, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 16, 8073978, "i", "w", 8224502, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 16, 8224502, "i", "z", 8073978, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 17, 8950876, "i", "w", 6187885, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 17, 6187885, "i", "z", 8950876, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 18, 8335415, "i", "w", 7582102, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 18, 7582102, "i", "z", 8335415, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 19, 8915346, "i", "w", 8358966, "1", '2025-10-07', "int"),
(0, "2526", "int", 6, 19, 8358966, "i", "z", 8915346, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 20, 8226317, "i", "w", 8243312, "0", '2025-10-07', "int"),
(0, "2526", "int", 6, 20, 8243312, "i", "z", 8226317, "1", '2025-10-07', "int");

-- ronde 7
insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 7, 0, 132, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 192, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 193, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 194, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 6565801, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7084022, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7101193, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7210137, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7269900, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7428960, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7441346, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7468362, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7519930, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7535396, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7546506, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7582102, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7691728, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7707832, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7758014, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7771665, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7879520, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7904589, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7970094, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8096242, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8243312, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8276752, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8335415, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8358966, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8372881, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8400183, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8472530, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8485059, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8617367, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8744494, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8750093, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8795941, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8915346, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8931098, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 9023234, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 9056674, "a", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 6207520, "e", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7099950, "e", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 7824674, "e", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8112654, "e", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 8484443, "e", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 0, 9065100, "e", "", 0, "", '2025-10-14', "int"),
(0, "2526", "int", 7, 1, 7129991, "i", "w", 5968611, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 1, 5968611, "i", "z", 7129991, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 2, 7613166, "i", "w", 7282033, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 2, 7282033, "i", "z", 7613166, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 3, 6930957, "i", "w", 6212404, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 3, 6212404, "i", "z", 6930957, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 4, 7529522, "i", "w", 7544438, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 4, 7544438, "i", "z", 7529522, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 5, 9077651, "i", "w", 7665834, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 5, 7665834, "i", "z", 9077651, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 6, 7386060, "i", "w", 6572511, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 6, 6572511, "i", "z", 7386060, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 7, 7292043, "i", "w", 6214153, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 7, 6214153, "i", "z", 7292043, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 8, 7699010, "i", "w", 7321534, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 8, 7321534, "i", "z", 7699010, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 9, 8224502, "i", "w", 7419621, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 9, 7419621, "i", "z", 8224502, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 10, 7399469, "i", "w", 6951362, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 10, 6951362, "i", "z", 7399469, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 11, 7443172, "i", "w", 8950876, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 11, 8950876, "i", "z", 7443172, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 12, 7731812, "i", "w", 8587337, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 12, 8587337, "i", "z", 7731812, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 13, 8978717, "i", "w", 8350738, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 13, 8350738, "i", "z", 8978717, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 14, 7518203, "i", "w", 7649213, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 14, 7649213, "i", "z", 7518203, "1", '2025-10-14', "int"),
(0, "2526", "int", 7, 15, 8073978, "i", "w", 7777715, "½", '2025-10-14', "int"),
(0, "2526", "int", 7, 15, 7777715, "i", "z", 8073978, "½", '2025-10-14', "int"),
(0, "2526", "int", 7, 16, 6187885, "i", "w", 196, "½", '2025-10-14', "int"),
(0, "2526", "int", 7, 16, 196, "i", "z", 6187885, "½", '2025-10-14', "int"),
(0, "2526", "int", 7, 17, 195, "i", "w", 8226317, "0", '2025-10-14', "int"),
(0, "2526", "int", 7, 17, 8226317, "i", "z", 195, "1", '2025-10-14', "int");

-- ronde 8
insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 8, 0, 132, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 193, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 194, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 195, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 196, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 6187885, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 6207520, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 6572511, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 6951362, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7084022, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7101193, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7129991, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7210137, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7269900, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7386060, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7428960, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7518203, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7544438, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7691728, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7699010, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7707832, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7758014, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7771665, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7879520, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7904589, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7970094, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8096242, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8335415, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8358966, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8372881, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8400183, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8472530, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8484443, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8587337, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8744494, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8795941, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8915346, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8931098, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8950876, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8978717, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 9065100, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 9077651, "a", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 6565801, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 6930957, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7321534, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7399469, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7468362, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7519930, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7529522, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 7731812, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8276752, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8485059, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 8617367, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 0, 9056674, "e", "", 0, "", '2025-10-28', "int"),
(0, "2526", "int", 8, 1, 7282033, "i", "w", 8112654, "0", '2025-10-28', "int"),
(0, "2526", "int", 8, 1, 8112654, "i", "z", 7282033, "1", '2025-10-28', "int"),
(0, "2526", "int", 8, 2, 5968611, "i", "w", 7613166, "1", '2025-10-28', "int"),
(0, "2526", "int", 8, 2, 7613166, "i", "z", 5968611, "0", '2025-10-28', "int"),
(0, "2526", "int", 8, 3, 7099950, "i", "w", 7546506, "½", '2025-10-28', "int"),
(0, "2526", "int", 8, 3, 7546506, "i", "z", 7099950, "½", '2025-10-28', "int"),
(0, "2526", "int", 8, 4, 7665834, "i", "w", 7292043, "1", '2025-10-28', "int"),
(0, "2526", "int", 8, 4, 7292043, "i", "z", 7665834, "0", '2025-10-28', "int"),
(0, "2526", "int", 8, 5, 7824674, "i", "w", 7535396, "½", '2025-10-28', "int"),
(0, "2526", "int", 8, 5, 7535396, "i", "z", 7824674, "½", '2025-10-28', "int"),
(0, "2526", "int", 8, 6, 6212404, "i", "w", 7419621, "½", '2025-10-28', "int"),
(0, "2526", "int", 8, 6, 7419621, "i", "z", 6212404, "½", '2025-10-28', "int"),
(0, "2526", "int", 8, 7, 7441346, "i", "w", 7443172, "½", '2025-10-28', "int"),
(0, "2526", "int", 8, 7, 7443172, "i", "z", 7441346, "½", '2025-10-28', "int"),
(0, "2526", "int", 8, 8, 8350738, "i", "w", 6214153, "0", '2025-10-28', "int"),
(0, "2526", "int", 8, 8, 6214153, "i", "z", 8350738, "1", '2025-10-28', "int"),
(0, "2526", "int", 8, 9, 8750093, "i", "w", 9023234, "½", '2025-10-28', "int"),
(0, "2526", "int", 8, 9, 9023234, "i", "z", 8750093, "½", '2025-10-28', "int"),
(0, "2526", "int", 8, 10, 7582102, "i", "w", 7649213, "0", '2025-10-28', "int"),
(0, "2526", "int", 8, 10, 7649213, "i", "z", 7582102, "1", '2025-10-28', "int"),
(0, "2526", "int", 8, 11, 8243312, "i", "w", 8224502, "0", '2025-10-28', "int"),
(0, "2526", "int", 8, 11, 8224502, "i", "z", 8243312, "1", '2025-10-28', "int"),
(0, "2526", "int", 8, 12, 192, "i", "w", 7777715, "0", '2025-10-28', "int"),
(0, "2526", "int", 8, 12, 7777715, "i", "z", 192, "1", '2025-10-28', "int"),
(0, "2526", "int", 8, 13, 8226317, "i", "w", 8073978, "0", '2025-10-28', "int"),
(0, "2526", "int", 8, 13, 8073978, "i", "z", 8226317, "1", '2025-10-28', "int");

-- ronde 9 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 9;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

-- Error Code: 1452. Cannot add or update a child row: a foreign key constraint fails 
-- (`waagtoren`.`uitslag`, CONSTRAINT `fk_uitslag_tegenstander` FOREIGN KEY (`tegenstanderNummer`) REFERENCES `persoon` (`knsbNummer`) ON UPDATE CASCADE)

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 9, 0, 132, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 192, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 193, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 194, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 195, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 196, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 6207520, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 6565801, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 6951362, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7084022, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7101193, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7441346, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7468362, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7509920, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7519930, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7529522, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7582102, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7649213, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7691728, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7699010, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7707832, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7771665, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7777715, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7879520, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7904589, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 7970094, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8073978, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8096242, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8243312, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8276752, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8335415, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8358966, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8372881, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8400183, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8472530, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8484443, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8485059, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8587337, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8744494, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8750093, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8795941, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8915346, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8931098, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 8950876, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 9023234, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 0, 9065100, "a", "", 0, "", '2025-11-04', "int"),
(0, "2526", "int", 9, 1, 8112654, "i", "w", 7129991, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 1, 7129991, "i", "z", 8112654, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 2, 5968611, "i", "w", 7282033, "½", '2025-11-04', "int"),
(0, "2526", "int", 9, 2, 7282033, "i", "z", 5968611, "½", '2025-11-04', "int"),
(0, "2526", "int", 9, 3, 7546506, "i", "w", 7665834, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 3, 7665834, "i", "z", 7546506, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 4, 9056674, "i", "w", 6930957, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 4, 6930957, "i", "z", 9056674, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 5, 7613166, "i", "w", 7099950, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 5, 7099950, "i", "z", 7613166, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 6, 6572511, "i", "w", 7535396, "½", '2025-11-04', "int"),
(0, "2526", "int", 9, 6, 7535396, "i", "z", 6572511, "½", '2025-11-04', "int"),
(0, "2526", "int", 9, 7, 6212404, "i", "w", 7428960, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 7, 7428960, "i", "z", 6212404, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 8, 7210137, "i", "w", 7824674, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 8, 7824674, "i", "z", 7210137, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 9, 7292043, "i", "w", 7399469, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 9, 7399469, "i", "z", 7292043, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 10, 6214153, "i", "w", 7269900, "½", '2025-11-04', "int"),
(0, "2526", "int", 9, 10, 7269900, "i", "z", 6214153, "½", '2025-11-04', "int"),
(0, "2526", "int", 9, 11, 7419621, "i", "w", 7544438, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 11, 7544438, "i", "z", 7419621, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 12, 7443172, "i", "w", 9077651, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 12, 9077651, "i", "z", 7443172, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 13, 8224502, "i", "w", 7386060, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 13, 7386060, "i", "z", 8224502, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 14, 7758014, "i", "w", 7321534, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 14, 7321534, "i", "z", 7758014, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 15, 8350738, "i", "w", 8617367, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 15, 8617367, "i", "z", 8350738, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 16, 7731812, "i", "w", 7518203, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 16, 7518203, "i", "z", 7731812, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 17, 6187885, "i", "w", 8978717, "0", '2025-11-04', "int"),
(0, "2526", "int", 9, 17, 8978717, "i", "z", 6187885, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 18, 8226317, "i", "w", 197, "1", '2025-11-04', "int"),
(0, "2526", "int", 9, 18, 197, "i", "z", 8226317, "0", '2025-11-04', "int");

-- ronde 10 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 10;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 10, 0, 132, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 192, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 193, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 195, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 196, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 197, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 6207520, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 6565801, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7084022, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7101193, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7210137, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7269900, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7399469, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7441346, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7468362, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7519930, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7544438, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7582102, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7649213, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7665834, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7691728, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7699010, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7707832, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7771665, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7777715, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7879520, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7904589, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7970094, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8226317, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8276752, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8358966, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8372881, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8400183, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8472530, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8485059, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8744494, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8750093, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8795941, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8931098, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8950876, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8978717, "a", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 5968611, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7099950, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7129991, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7428960, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7509920, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7529522, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7535396, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7613166, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 7824674, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8096242, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8112654, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8484443, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 8587337, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 9065100, "e", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 0, 6187885, "o", "", 0, "", '2025-11-11', "int"),
(0, "2526", "int", 10, 1, 6930957, "i", "w", 7282033, "0", '2025-11-11', "int"),
(0, "2526", "int", 10, 1, 7282033, "i", "z", 6930957, "1", '2025-11-11', "int"),
(0, "2526", "int", 10, 2, 6572511, "i", "w", 7546506, "1", '2025-11-11', "int"),
(0, "2526", "int", 10, 2, 7546506, "i", "z", 6572511, "0", '2025-11-11', "int"),
(0, "2526", "int", 10, 3, 7292043, "i", "w", 9056674, "½", '2025-11-11', "int"),
(0, "2526", "int", 10, 3, 9056674, "i", "z", 7292043, "½", '2025-11-11', "int"),
(0, "2526", "int", 10, 4, 9077651, "i", "w", 6212404, "1", '2025-11-11', "int"),
(0, "2526", "int", 10, 4, 6212404, "i", "z", 9077651, "0", '2025-11-11', "int"),
(0, "2526", "int", 10, 5, 8224502, "i", "w", 6214153, "0", '2025-11-11', "int"),
(0, "2526", "int", 10, 5, 6214153, "i", "z", 8224502, "1", '2025-11-11', "int"),
(0, "2526", "int", 10, 6, 7419621, "i", "w", 7758014, "0", '2025-11-11', "int"),
(0, "2526", "int", 10, 6, 7758014, "i", "z", 7419621, "1", '2025-11-11', "int"),
(0, "2526", "int", 10, 7, 9023234, "i", "w", 7443172, "0", '2025-11-11', "int"),
(0, "2526", "int", 10, 7, 7443172, "i", "z", 9023234, "1", '2025-11-11', "int"),
(0, "2526", "int", 10, 8, 7321534, "i", "w", 7731812, "0", '2025-11-11', "int"),
(0, "2526", "int", 10, 8, 7731812, "i", "z", 7321534, "1", '2025-11-11', "int"),
(0, "2526", "int", 10, 9, 6951362, "i", "w", 7386060, "½", '2025-11-11', "int"),
(0, "2526", "int", 10, 9, 7386060, "i", "z", 6951362, "½", '2025-11-11', "int"),
(0, "2526", "int", 10, 10, 8073978, "i", "w", 8617367, "1", '2025-11-11', "int"),
(0, "2526", "int", 10, 10, 8617367, "i", "z", 8073978, "0", '2025-11-11', "int"),
(0, "2526", "int", 10, 11, 194, "i", "w", 8350738, "0", '2025-11-11', "int"),
(0, "2526", "int", 10, 11, 8350738, "i", "z", 194, "1", '2025-11-11', "int"),
(0, "2526", "int", 10, 12, 7518203, "i", "w", 8915346, "½", '2025-11-11', "int"),
(0, "2526", "int", 10, 12, 8915346, "i", "z", 7518203, "½", '2025-11-11', "int"),
(0, "2526", "int", 10, 13, 8243312, "i", "w", 8335415, "1", '2025-11-11', "int"),
(0, "2526", "int", 10, 13, 8335415, "i", "z", 8243312, "0", '2025-11-11', "int");

-- ronde 11 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 11;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 11, 0, 132, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 192, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 193, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 195, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 196, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 197, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 6187885, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 6207520, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 6572511, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 6951362, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7084022, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7099950, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7129991, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7269900, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7292043, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7428960, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7441346, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7509920, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7582102, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7613166, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7665834, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7691728, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7707832, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7758014, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7771665, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7824674, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7879520, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7904589, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7970094, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8073978, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8096242, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8112654, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8224502, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8226317, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8335415, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8350738, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8358966, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8372881, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8400183, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8472530, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8484443, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8587337, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8744494, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8750093, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8915346, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8931098, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8950876, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8978717, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 9023234, "a", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 6212404, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 6214153, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 6565801, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 6930957, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7101193, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7210137, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7282033, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7321534, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7399469, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7468362, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7519930, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7529522, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7535396, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7546506, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7731812, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8276752, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 8485059, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 9056674, "e", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 0, 7386060, "o", "", 0, "", '2025-11-18', "int"),
(0, "2526", "int", 11, 1, 9065100, "i", "w", 5968611, "½", '2025-11-18', "int"),
(0, "2526", "int", 11, 1, 5968611, "i", "z", 9065100, "½", '2025-11-18', "int"),
(0, "2526", "int", 11, 2, 7544438, "i", "w", 9077651, "1", '2025-11-18', "int"),
(0, "2526", "int", 11, 2, 9077651, "i", "z", 7544438, "0", '2025-11-18', "int"),
(0, "2526", "int", 11, 3, 8795941, "i", "w", 7699010, "1", '2025-11-18', "int"),
(0, "2526", "int", 11, 3, 7699010, "i", "z", 8795941, "0", '2025-11-18', "int"),
(0, "2526", "int", 11, 4, 7443172, "i", "w", 7419621, "½", '2025-11-18', "int"),
(0, "2526", "int", 11, 4, 7419621, "i", "z", 7443172, "½", '2025-11-18', "int"),
(0, "2526", "int", 11, 5, 7777715, "i", "w", 7649213, "0", '2025-11-18', "int"),
(0, "2526", "int", 11, 5, 7649213, "i", "z", 7777715, "1", '2025-11-18', "int"),
(0, "2526", "int", 11, 6, 8617367, "i", "w", 8243312, "1", '2025-11-18', "int"),
(0, "2526", "int", 11, 6, 8243312, "i", "z", 8617367, "0", '2025-11-18', "int"),
(0, "2526", "int", 11, 7, 7518203, "i", "w", 194, "1", '2025-11-18', "int"),
(0, "2526", "int", 11, 7, 194, "i", "z", 7518203, "0", '2025-11-18', "int");

-- ronde 12 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 12;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 12, 0, 132, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 192, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 193, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 195, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 196, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 197, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 5968611, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 6187885, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 6207520, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 6951362, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7084022, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7129991, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7210137, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7321534, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7428960, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7441346, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7468362, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7509920, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7518203, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7519930, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7535396, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7544438, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7546506, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7582102, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7613166, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7649213, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7665834, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7691728, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7699010, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7758014, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7771665, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7824674, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7879520, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7904589, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7970094, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8096242, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8112654, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8224502, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8226317, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8276752, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8335415, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8358966, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8372881, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8400183, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8472530, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8485059, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8587337, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8617367, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8744494, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8795941, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8915346, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8931098, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8950876, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 9023234, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 9065100, "a", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 6930957, "e", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7529522, "e", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 8484443, "e", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 9056674, "e", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 0, 7419621, "o", "", 0, "", '2025-11-25', "int"),
(0, "2526", "int", 12, 1, 7099950, "i", "w", 7282033, "½", '2025-11-25', "int"),
(0, "2526", "int", 12, 1, 7282033, "i", "z", 7099950, "½", '2025-11-25', "int"),
(0, "2526", "int", 12, 2, 6214153, "i", "w", 6572511, "½", '2025-11-25', "int"),
(0, "2526", "int", 12, 2, 6572511, "i", "z", 6214153, "½", '2025-11-25', "int"),
(0, "2526", "int", 12, 3, 9077651, "i", "w", 6565801, "0", '2025-11-25', "int"),
(0, "2526", "int", 12, 3, 6565801, "i", "z", 9077651, "1", '2025-11-25', "int"),
(0, "2526", "int", 12, 4, 7707832, "i", "w", 7292043, "½", '2025-11-25', "int"),
(0, "2526", "int", 12, 4, 7292043, "i", "z", 7707832, "½", '2025-11-25', "int"),
(0, "2526", "int", 12, 5, 7269900, "i", "w", 7399469, "0", '2025-11-25', "int"),
(0, "2526", "int", 12, 5, 7399469, "i", "z", 7269900, "1", '2025-11-25', "int"),
(0, "2526", "int", 12, 6, 6212404, "i", "w", 7443172, "0", '2025-11-25', "int"),
(0, "2526", "int", 12, 6, 7443172, "i", "z", 6212404, "1", '2025-11-25', "int"),
(0, "2526", "int", 12, 7, 7386060, "i", "w", 7731812, "1", '2025-11-25', "int"),
(0, "2526", "int", 12, 7, 7731812, "i", "z", 7386060, "0", '2025-11-25', "int"),
(0, "2526", "int", 12, 8, 8750093, "i", "w", 8073978, "0", '2025-11-25', "int"),
(0, "2526", "int", 12, 8, 8073978, "i", "z", 8750093, "1", '2025-11-25', "int"),
(0, "2526", "int", 12, 9, 7101193, "i", "w", 8350738, "1", '2025-11-25', "int"),
(0, "2526", "int", 12, 9, 8350738, "i", "z", 7101193, "0", '2025-11-25', "int"),
(0, "2526", "int", 12, 10, 8978717, "i", "w", 7777715, "1", '2025-11-25', "int"),
(0, "2526", "int", 12, 10, 7777715, "i", "z", 8978717, "0", '2025-11-25', "int"),
(0, "2526", "int", 12, 11, 194, "i", "w", 8243312, "0", '2025-11-25', "int"),
(0, "2526", "int", 12, 11, 8243312, "i", "z", 194, "1", '2025-11-25', "int");

-- ronde 13 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 13;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 13, 0, 132, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 192, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 193, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 194, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 195, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 196, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 197, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 6207520, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 6565801, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 6572511, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 6930957, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 6951362, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7084022, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7101193, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7210137, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7269900, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7468362, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7509920, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7519930, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7544438, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7582102, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7665834, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7691728, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7699010, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7758014, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7771665, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7777715, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7879520, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7904589, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7970094, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8226317, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8335415, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8358966, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8372881, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8400183, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8472530, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8484443, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8485059, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8617367, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8744494, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8750093, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8795941, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8915346, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8931098, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8950876, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 9023234, "a", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 5968611, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7099950, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7129991, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7428960, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7535396, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7546506, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7613166, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7707832, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 7824674, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8096242, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8112654, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 8587337, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 9065100, "e", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 0, 6212404, "o", "", 0, "", '2025-12-02', "int"),
(0, "2526", "int", 13, 1, 7282033, "i", "w", 9056674, "0", '2025-12-02', "int"),
(0, "2526", "int", 13, 1, 9056674, "i", "z", 7282033, "1", '2025-12-02', "int"),
(0, "2526", "int", 13, 2, 6214153, "i", "w", 7529522, "0", '2025-12-02', "int"),
(0, "2526", "int", 13, 2, 7529522, "i", "z", 6214153, "1", '2025-12-02', "int"),
(0, "2526", "int", 13, 3, 7292043, "i", "w", 9077651, "1", '2025-12-02', "int"),
(0, "2526", "int", 13, 3, 9077651, "i", "z", 7292043, "0", '2025-12-02', "int"),
(0, "2526", "int", 13, 4, 7399469, "i", "w", 7443172, "½", '2025-12-02', "int"),
(0, "2526", "int", 13, 4, 7443172, "i", "z", 7399469, "½", '2025-12-02', "int"),
(0, "2526", "int", 13, 5, 7419621, "i", "w", 7386060, "½", '2025-12-02', "int"),
(0, "2526", "int", 13, 5, 7386060, "i", "z", 7419621, "½", '2025-12-02', "int"),
(0, "2526", "int", 13, 6, 8073978, "i", "w", 8276752, "1", '2025-12-02', "int"),
(0, "2526", "int", 13, 6, 8276752, "i", "z", 8073978, "0", '2025-12-02', "int"),
(0, "2526", "int", 13, 7, 7731812, "i", "w", 7441346, "1", '2025-12-02', "int"),
(0, "2526", "int", 13, 7, 7441346, "i", "z", 7731812, "0", '2025-12-02', "int"),
(0, "2526", "int", 13, 8, 7649213, "i", "w", 8224502, "½", '2025-12-02', "int"),
(0, "2526", "int", 13, 8, 8224502, "i", "z", 7649213, "½", '2025-12-02', "int"),
(0, "2526", "int", 13, 9, 8978717, "i", "w", 7321534, "0", '2025-12-02', "int"),
(0, "2526", "int", 13, 9, 7321534, "i", "z", 8978717, "1", '2025-12-02', "int"),
(0, "2526", "int", 13, 10, 8350738, "i", "w", 8243312, "0", '2025-12-02', "int"),
(0, "2526", "int", 13, 10, 8243312, "i", "z", 8350738, "1", '2025-12-02', "int"),
(0, "2526", "int", 13, 11, 6187885, "i", "w", 7518203, "½", '2025-12-02', "int"),
(0, "2526", "int", 13, 11, 7518203, "i", "z", 6187885, "½", '2025-12-02', "int");

-- ronde 14 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 14;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 14, 0, 132, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 192, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 193, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 194, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 195, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 196, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 197, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 6187885, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 6207520, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 6420557, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 6565801, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 6572511, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7084022, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7099950, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7129991, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7210137, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7269900, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7428960, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7441346, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7468362, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7504310, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7509920, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7535396, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7546506, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7582102, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7613166, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7665834, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7691728, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7699010, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7731812, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7757409, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7758014, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7771665, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7809285, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7824674, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7879520, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7904589, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7970094, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8096242, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8112654, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8182416, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8226317, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8243312, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8335415, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8358966, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8372881, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8400183, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8472530, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8484443, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8587337, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8744494, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8750093, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8795941, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8915346, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8931098, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8950876, "a", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7101193, "e", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7321534, "e", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7399469, "e", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7519930, "e", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8276752, "e", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 8485059, "e", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 0, 7443172, "o", "", 0, "", '2025-12-09', "int"),
(0, "2526", "int", 14, 1, 8350738, "i", "w", 7518203, "0", '2025-12-09', "int"),
(0, "2526", "int", 14, 1, 7518203, "i", "z", 8350738, "1", '2025-12-09', "int"),
(0, "2526", "int", 14, 2, 7777715, "i", "w", 8617367, "0", '2025-12-09', "int"),
(0, "2526", "int", 14, 2, 8617367, "i", "z", 7777715, "1", '2025-12-09', "int"),
(0, "2526", "int", 14, 3, 7529522, "i", "w", 5968611, "0", '2025-12-09', "int"),
(0, "2526", "int", 14, 3, 5968611, "i", "z", 7529522, "1", '2025-12-09', "int"),
(0, "2526", "int", 14, 4, 7282033, "i", "w", 9065100, "1", '2025-12-09', "int"),
(0, "2526", "int", 14, 4, 9065100, "i", "z", 7282033, "0", '2025-12-09', "int"),
(0, "2526", "int", 14, 5, 6930957, "i", "w", 7292043, "0", '2025-12-09', "int"),
(0, "2526", "int", 14, 5, 7292043, "i", "z", 6930957, "1", '2025-12-09', "int"),
(0, "2526", "int", 14, 6, 9056674, "i", "w", 7707832, "0", '2025-12-09', "int"),
(0, "2526", "int", 14, 6, 7707832, "i", "z", 9056674, "1", '2025-12-09', "int"),
(0, "2526", "int", 14, 7, 7544438, "i", "w", 6214153, "½", '2025-12-09', "int"),
(0, "2526", "int", 14, 7, 6214153, "i", "z", 7544438, "½", '2025-12-09', "int"),
(0, "2526", "int", 14, 8, 7386060, "i", "w", 8073978, "1", '2025-12-09', "int"),
(0, "2526", "int", 14, 8, 8073978, "i", "z", 7386060, "0", '2025-12-09', "int"),
(0, "2526", "int", 14, 9, 9077651, "i", "w", 7419621, "0", '2025-12-09', "int"),
(0, "2526", "int", 14, 9, 7419621, "i", "z", 9077651, "1", '2025-12-09', "int"),
(0, "2526", "int", 14, 10, 8224502, "i", "w", 6212404, "0", '2025-12-09', "int"),
(0, "2526", "int", 14, 10, 6212404, "i", "z", 8224502, "1", '2025-12-09', "int"),
(0, "2526", "int", 14, 11, 6951362, "i", "w", 7649213, "½", '2025-12-09', "int"),
(0, "2526", "int", 14, 11, 7649213, "i", "z", 6951362, "½", '2025-12-09', "int"),
(0, "2526", "int", 14, 12, 9023234, "i", "w", 8978717, "1", '2025-12-09', "int"),
(0, "2526", "int", 14, 12, 8978717, "i", "z", 9023234, "0", '2025-12-09', "int");

-- ronde 15 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 15;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 15, 0, 132, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 192, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 193, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 194, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 195, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 196, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 197, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 6187885, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 6207520, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 6420557, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 6565801, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 6951362, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7210137, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7269900, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7399469, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7441346, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7468362, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7504310, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7509920, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7519930, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7535396, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7582102, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7613166, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7665834, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7691728, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7699010, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7731812, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7757409, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7758014, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7771665, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7809285, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7879520, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7904589, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 7970094, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8096242, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8182416, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8224502, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8226317, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8335415, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8372881, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8400183, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8472530, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8484443, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8587337, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8744494, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8750093, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8795941, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8915346, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8931098, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8950876, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 8978717, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 9056674, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 0, 9065100, "a", "", 0, "", '2025-12-16', "int"),
(0, "2526", "int", 15, 1, 8350738, "i", "w", 9023234, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 1, 9023234, "i", "z", 8350738, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 2, 8358966, "i", "w", 7777715, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 2, 7777715, "i", "z", 8358966, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 3, 5968611, "i", "w", 7292043, "½", '2025-12-16', "int"),
(0, "2526", "int", 15, 3, 7292043, "i", "z", 5968611, "½", '2025-12-16', "int"),
(0, "2526", "int", 15, 4, 7428960, "i", "w", 7282033, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 4, 7282033, "i", "z", 7428960, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 5, 7099950, "i", "w", 8112654, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 5, 8112654, "i", "z", 7099950, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 6, 7129991, "i", "w", 7529522, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 6, 7529522, "i", "z", 7129991, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 7, 7707832, "i", "w", 6930957, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 7, 6930957, "i", "z", 7707832, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 8, 6572511, "i", "w", 7544438, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 8, 7544438, "i", "z", 6572511, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 9, 7546506, "i", "w", 7443172, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 9, 7443172, "i", "z", 7546506, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 10, 6212404, "i", "w", 6214153, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 10, 6214153, "i", "z", 6212404, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 11, 7824674, "i", "w", 7386060, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 11, 7386060, "i", "z", 7824674, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 12, 7419621, "i", "w", 8073978, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 12, 8073978, "i", "z", 7419621, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 13, 8276752, "i", "w", 9077651, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 13, 9077651, "i", "z", 8276752, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 14, 7649213, "i", "w", 7321534, "½", '2025-12-16', "int"),
(0, "2526", "int", 15, 14, 7321534, "i", "z", 7649213, "½", '2025-12-16', "int"),
(0, "2526", "int", 15, 15, 7101193, "i", "w", 8485059, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 15, 8485059, "i", "z", 7101193, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 16, 8617367, "i", "w", 7084022, "0", '2025-12-16', "int"),
(0, "2526", "int", 15, 16, 7084022, "i", "z", 8617367, "1", '2025-12-16', "int"),
(0, "2526", "int", 15, 17, 8243312, "i", "w", 7518203, "½", '2025-12-16', "int"),
(0, "2526", "int", 15, 17, 7518203, "i", "z", 8243312, "½", '2025-12-16', "int");

-- ronde 16 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 16;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 16, 0, 132, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 192, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 194, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 195, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 196, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 197, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 198, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 5968611, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 6187885, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 6207520, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 6420557, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 6572511, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 6951362, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7084022, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7101193, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7129991, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7269900, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7419621, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7428960, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7441346, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7468362, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7504310, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7509920, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7519930, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7535396, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7544438, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7546506, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7582102, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7613166, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7665834, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7691728, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7699010, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7757409, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7758014, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7771665, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7777715, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7809285, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7824674, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7879520, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7904589, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7970094, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8073978, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8096242, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8112654, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8182416, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8226317, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8243312, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8276752, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8335415, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8358966, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8372881, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8400183, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8472530, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8587337, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8617367, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8744494, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8750093, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8795941, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8915346, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8931098, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8950876, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 8978717, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 9023234, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 9056674, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 9065100, "a", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 0, 7731812, "o", "", 0, "", '2026-01-06', "int"),
(0, "2526", "int", 16, 1, 7282033, "i", "w", 7292043, "1", '2026-01-06', "int"),
(0, "2526", "int", 16, 1, 7292043, "i", "z", 7282033, "0", '2026-01-06', "int"),
(0, "2526", "int", 16, 2, 7707832, "i", "w", 7099950, "0", '2026-01-06', "int"),
(0, "2526", "int", 16, 2, 7099950, "i", "z", 7707832, "1", '2026-01-06', "int"),
(0, "2526", "int", 16, 3, 7529522, "i", "w", 6930957, "1", '2026-01-06', "int"),
(0, "2526", "int", 16, 3, 6930957, "i", "z", 7529522, "0", '2026-01-06', "int"),
(0, "2526", "int", 16, 4, 6214153, "i", "w", 8484443, "1", '2026-01-06', "int"),
(0, "2526", "int", 16, 4, 8484443, "i", "z", 6214153, "0", '2026-01-06', "int"),
(0, "2526", "int", 16, 5, 6565801, "i", "w", 7399469, "0", '2026-01-06', "int"),
(0, "2526", "int", 16, 5, 7399469, "i", "z", 6565801, "1", '2026-01-06', "int"),
(0, "2526", "int", 16, 6, 7443172, "i", "w", 7210137, "½", '2026-01-06', "int"),
(0, "2526", "int", 16, 6, 7210137, "i", "z", 7443172, "½", '2026-01-06', "int"),
(0, "2526", "int", 16, 7, 7386060, "i", "w", 6212404, "1", '2026-01-06', "int"),
(0, "2526", "int", 16, 7, 6212404, "i", "z", 7386060, "0", '2026-01-06', "int"),
(0, "2526", "int", 16, 9, 7321534, "i", "w", 9077651, "½", '2026-01-06', "int"),
(0, "2526", "int", 16, 9, 9077651, "i", "z", 7321534, "½", '2026-01-06', "int"),
(0, "2526", "int", 16, 10, 7649213, "i", "w", 8485059, "1", '2026-01-06', "int"),
(0, "2526", "int", 16, 10, 8485059, "i", "z", 7649213, "0", '2026-01-06', "int"),
(0, "2526", "int", 16, 11, 8224502, "i", "w", 7518203, "½", '2026-01-06', "int"),
(0, "2526", "int", 16, 11, 7518203, "i", "z", 8224502, "½", '2026-01-06', "int"),
(0, "2526", "int", 16, 12, 193, "i", "w", 8350738, "1", '2026-01-06', "int"),
(0, "2526", "int", 16, 12, 8350738, "i", "z", 193, "0", '2026-01-06', "int");

-- ronde 17 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 17;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 17, 0, 132, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 192, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 193, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 194, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 195, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 196, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 197, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 198, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 6187885, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 6207520, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 6420557, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 6951362, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7210137, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7269900, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7428960, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7468362, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7504310, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7509920, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7519930, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7544438, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7613166, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7691728, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7699010, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7707832, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7757409, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7758014, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7771665, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7879520, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7904589, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7970094, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8096242, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8182416, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8224502, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8226317, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8335415, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8350738, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8358966, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8372881, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8400183, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8472530, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8485059, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8587337, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8617367, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8744494, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8750093, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8795941, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8915346, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8931098, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8978717, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 9065100, "a", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7518203, "e", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 8950876, "e", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 9023234, "e", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 9077651, "e", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7292043, "o", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 0, 7386060, "o", "", 0, "", '2026-01-13', "int"),
(0, "2526", "int", 17, 1, 7099950, "i", "w", 5968611, "0", '2026-01-13', "int"),
(0, "2526", "int", 17, 1, 5968611, "i", "z", 7099950, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 2, 7529522, "i", "w", 7282033, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 2, 7282033, "i", "z", 7529522, "0", '2026-01-13', "int"),
(0, "2526", "int", 17, 3, 7665834, "i", "w", 7129991, "½", '2026-01-13', "int"),
(0, "2526", "int", 17, 3, 7129991, "i", "z", 7665834, "½", '2026-01-13', "int"),
(0, "2526", "int", 17, 4, 8112654, "i", "w", 6214153, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 4, 6214153, "i", "z", 8112654, "0", '2026-01-13', "int"),
(0, "2526", "int", 17, 5, 9056674, "i", "w", 7546506, "0", '2026-01-13', "int"),
(0, "2526", "int", 17, 5, 7546506, "i", "z", 9056674, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 6, 7399469, "i", "w", 6930957, "0", '2026-01-13', "int"),
(0, "2526", "int", 17, 6, 6930957, "i", "z", 7399469, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 7, 8484443, "i", "w", 7535396, "½", '2026-01-13', "int"),
(0, "2526", "int", 17, 7, 7535396, "i", "z", 8484443, "½", '2026-01-13', "int"),
(0, "2526", "int", 17, 8, 7419621, "i", "w", 6572511, "0", '2026-01-13', "int"),
(0, "2526", "int", 17, 8, 6572511, "i", "z", 7419621, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 9, 7443172, "i", "w", 7824674, "0", '2026-01-13', "int"),
(0, "2526", "int", 17, 9, 7824674, "i", "z", 7443172, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 11, 6565801, "i", "w", 7731812, "½", '2026-01-13', "int"),
(0, "2526", "int", 17, 11, 7731812, "i", "z", 6565801, "½", '2026-01-13', "int"),
(0, "2526", "int", 17, 12, 8276752, "i", "w", 7649213, "0", '2026-01-13', "int"),
(0, "2526", "int", 17, 12, 7649213, "i", "z", 8276752, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 13, 6212404, "i", "w", 7321534, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 13, 7321534, "i", "z", 6212404, "0", '2026-01-13', "int"),
(0, "2526", "int", 17, 14, 8073978, "i", "w", 7101193, "0", '2026-01-13', "int"),
(0, "2526", "int", 17, 14, 7101193, "i", "z", 8073978, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 15, 7441346, "i", "w", 7084022, "0", '2026-01-13', "int"),
(0, "2526", "int", 17, 15, 7084022, "i", "z", 7441346, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 16, 8243312, "i", "w", 7809285, "½", '2026-01-13', "int"),
(0, "2526", "int", 17, 16, 7809285, "i", "z", 8243312, "½", '2026-01-13', "int"),
(0, "2526", "int", 17, 17, 7777715, "i", "w", 7582102, "1", '2026-01-13', "int"),
(0, "2526", "int", 17, 17, 7582102, "i", "z", 7777715, "0", '2026-01-13', "int");

-- ronde 18 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 18;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 18, 0, 132, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 192, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 194, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 195, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 196, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 197, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 198, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 5968611, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 6187885, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 6207520, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 6420557, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 6930957, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 6951362, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7129991, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7269900, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7399469, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7428960, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7441346, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7443172, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7468362, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7504310, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7509920, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7518203, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7519930, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7535396, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7544438, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7665834, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7691728, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7699010, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7707832, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7757409, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7758014, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7771665, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7879520, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 7904589, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8073978, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8096242, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8112654, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8182416, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8226317, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8243312, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8276752, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8335415, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8372881, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8400183, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8472530, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8484443, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8587337, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8744494, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8795941, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8915346, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8931098, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8978717, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 9065100, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 9077651, "a", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 0, 8224502, "o", "", 0, "", '2026-01-20', "int"),
(0, "2526", "int", 18, 1, 7582102, "i", "w", 8350738, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 1, 8350738, "i", "z", 7582102, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 2, 8358966, "i", "w", 193, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 2, 193, "i", "z", 8358966, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 3, 7099950, "i", "w", 7529522, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 3, 7529522, "i", "z", 7099950, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 4, 7546506, "i", "w", 7282033, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 4, 7282033, "i", "z", 7546506, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 5, 7292043, "i", "w", 7970094, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 5, 7970094, "i", "z", 7292043, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 6, 6572511, "i", "w", 7613166, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 6, 7613166, "i", "z", 6572511, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 7, 6214153, "i", "w", 7824674, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 7, 7824674, "i", "z", 6214153, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 8, 7386060, "i", "w", 9056674, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 8, 9056674, "i", "z", 7386060, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 9, 7649213, "i", "w", 7731812, "½", '2026-01-20', "int"),
(0, "2526", "int", 18, 9, 7731812, "i", "z", 7649213, "½", '2026-01-20', "int"),
(0, "2526", "int", 18, 10, 7210137, "i", "w", 7419621, "½", '2026-01-20', "int"),
(0, "2526", "int", 18, 10, 7419621, "i", "z", 7210137, "½", '2026-01-20', "int"),
(0, "2526", "int", 18, 11, 6212404, "i", "w", 6565801, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 11, 6565801, "i", "z", 6212404, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 12, 7084022, "i", "w", 7101193, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 12, 7101193, "i", "z", 7084022, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 13, 7321534, "i", "w", 9023234, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 13, 9023234, "i", "z", 7321534, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 14, 7809285, "i", "w", 8485059, "0", '2026-01-20', "int"),
(0, "2526", "int", 18, 14, 8485059, "i", "z", 7809285, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 15, 8617367, "i", "w", 8750093, "½", '2026-01-20', "int"),
(0, "2526", "int", 18, 15, 8750093, "i", "z", 8617367, "½", '2026-01-20', "int"),
(0, "2526", "int", 18, 16, 8950876, "i", "w", 7777715, "1", '2026-01-20', "int"),
(0, "2526", "int", 18, 16, 7777715, "i", "z", 8950876, "0", '2026-01-20', "int");

-- ronde 19 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 19;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 19, 0, 132, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 192, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 194, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 195, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 196, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 197, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 5968611, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 6187885, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 6207520, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 6212404, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 6214153, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 6420557, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 6565801, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 6572511, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 6930957, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 6951362, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7084022, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7099950, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7101193, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7210137, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7269900, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7282033, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7321534, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7399469, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7428960, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7441346, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7468362, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7504310, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7509920, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7519930, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7529522, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7535396, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7544438, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7546506, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7691728, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7699010, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7707832, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7731812, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7757409, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7758014, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7771665, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7809285, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7824674, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7879520, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7904589, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7970094, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8073978, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8096242, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8182416, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8276752, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8335415, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8350738, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8358966, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8372881, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8400183, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8472530, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8484443, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8485059, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8587337, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8617367, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8744494, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8750093, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8795941, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8915346, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8931098, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 8978717, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 9023234, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 9056674, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 9077651, "a", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7292043, "o", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 0, 7582102, "o", "", 0, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 1, 7613166, "i", "w", 7129991, "1", '2026-02-03', "int"),
(0, "2526", "int", 19, 1, 7129991, "i", "z", 7613166, "0", '2026-02-03', "int"),
(0, "2526", "int", 19, 2, 9065100, "i", "w", 8112654, "1", '2026-02-03', "int"),
(0, "2526", "int", 19, 2, 8112654, "i", "z", 9065100, "0", '2026-02-03', "int"),
(0, "2526", "int", 19, 3, 7665834, "i", "w", 7386060, "½", '2026-02-03', "int"),
(0, "2526", "int", 19, 3, 7386060, "i", "z", 7665834, "½", '2026-02-03', "int"),
(0, "2526", "int", 19, 4, 7419621, "i", "w", 7649213, "1", '2026-02-03', "int"),
(0, "2526", "int", 19, 4, 7649213, "i", "z", 7419621, "0", '2026-02-03', "int"),
(0, "2526", "int", 19, 5, 7443172, "i", "w", 8224502, "½", '2026-02-03', "int"),
(0, "2526", "int", 19, 5, 8224502, "i", "z", 7443172, "½", '2026-02-03', "int"),
(0, "2526", "int", 19, 6, 7518203, "i", "w", 8950876, "1", '2026-02-03', "int"),
(0, "2526", "int", 19, 6, 8950876, "i", "z", 7518203, "0", '2026-02-03', "int"),
(0, "2526", "int", 19, 7, 7777715, "i", "w", 8243312, "0", '2026-02-03', "int"),
(0, "2526", "int", 19, 7, 8243312, "i", "z", 7777715, "1", '2026-02-03', "int"),
(0, "2526", "int", 19, 8, 193, "i", "z", 7582102, "", '2026-02-03', "int"),
(0, "2526", "int", 19, 9, 8226317, "i", "w", 198, "1", '2026-02-03', "int"),
(0, "2526", "int", 19, 9, 198, "i", "z", 8226317, "0", '2026-02-03', "int");

-- ronde 20 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 20;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "int", 20, 0, 132, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 192, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 193, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 194, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 195, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 196, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 197, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 5968611, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 6187885, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 6207520, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 6420557, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 6565801, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 6951362, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7099950, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7101193, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7129991, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7210137, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7269900, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7321534, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7419621, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7428960, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7441346, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7468362, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7504310, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7509920, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7518203, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7519930, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7535396, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7544438, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7613166, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7665834, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7691728, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7699010, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7707832, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7757409, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7758014, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7771665, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7809285, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7824674, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7879520, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7904589, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7970094, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8096242, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8112654, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8182416, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8226317, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8243312, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8276752, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8335415, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8358966, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8372881, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8400183, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8472530, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8484443, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8485059, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8587337, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8744494, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8750093, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8795941, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8915346, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8931098, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8950876, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8978717, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 9023234, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 9056674, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 9065100, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 9077651, "a", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 6572511, "e", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 7529522, "o", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 0, 8073978, "o", "", 0, "", '2026-02-10', "int"),
(0, "2526", "int", 20, 1, 7582102, "i", "w", 8617367, "1", '2026-02-10', "int"),
(0, "2526", "int", 20, 1, 8617367, "i", "z", 7582102, "0", '2026-02-10', "int"),
(0, "2526", "int", 20, 2, 8350738, "i", "w", 8224502, "0", '2026-02-10', "int"),
(0, "2526", "int", 20, 2, 8224502, "i", "z", 8350738, "1", '2026-02-10', "int"),
(0, "2526", "int", 20, 3, 7282033, "i", "w", 7386060, "1", '2026-02-10', "int"),
(0, "2526", "int", 20, 3, 7386060, "i", "z", 7282033, "0", '2026-02-10', "int"),
(0, "2526", "int", 20, 4, 7292043, "i", "w", 7546506, "0", '2026-02-10', "int"),
(0, "2526", "int", 20, 4, 7546506, "i", "z", 7292043, "1", '2026-02-10', "int"),
(0, "2526", "int", 20, 6, 6930957, "i", "w", 6214153, "1", '2026-02-10', "int"),
(0, "2526", "int", 20, 6, 6214153, "i", "z", 6930957, "0", '2026-02-10', "int"),
(0, "2526", "int", 20, 7, 7399469, "i", "w", 6212404, "1", '2026-02-10', "int"),
(0, "2526", "int", 20, 7, 6212404, "i", "z", 7399469, "0", '2026-02-10', "int"),
(0, "2526", "int", 20, 8, 7731812, "i", "w", 7443172, "0", '2026-02-10', "int"),
(0, "2526", "int", 20, 8, 7443172, "i", "z", 7731812, "1", '2026-02-10', "int"),
(0, "2526", "int", 20, 9, 7649213, "i", "w", 7084022, "½", '2026-02-10', "int"),
(0, "2526", "int", 20, 9, 7084022, "i", "z", 7649213, "½", '2026-02-10', "int"),
(0, "2526", "int", 20, 10, 198, "i", "w", 7777715, "0", '2026-02-10', "int"),
(0, "2526", "int", 20, 10, 7777715, "i", "z", 198, "1", '2026-02-10', "int");

-- ronde 21 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 21;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 22 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 22;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 23 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 23;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 24 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 24;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 25 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 25;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 26 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 26;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 27 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 27;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 28 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 28;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 29 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 29;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 30 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 30;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 31 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 31;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 32 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 32;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- ronde 33 TODO
set @seizoen = "2526";
set @team = "int";
set @ronde = 33;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;


-- Waagtoren KNSB beker TODO
set @seizoen = "2526";
set @team = "kbe";
set @ronde = 2;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","kbe",2,1,7657342,"e","w",0,"1",'2025-12-14',"int"),
(0,"2526","kbe",2,2,7970094,"e","z",0,"1",'2025-12-14',"int"),
(0,"2526","kbe",2,3,8795941,"e","w",0,"1",'2025-12-14',"int"),
(0,"2526","kbe",2,4,8285574,"e","z",0,"½",'2025-12-14',"int");

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","kbe",3,1,7657342,"e","z",0,"1",'2026-02-08',"int"),
(0,"2526","kbe",3,2,7970094,"e","w",0,"1",'2026-02-08',"int"),
(0,"2526","kbe",3,3,8795941,"e","z",0,"0",'2026-02-08',"int"),
(0,"2526","kbe",3,4,7099950,"e","w",0,"0",'2026-02-08',"int");

-- Waagtoren 1 TODO
set @seizoen = "2526";
set @team = "1";
set @ronde = 8;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","1",1,6,7099950,"e","z",0,"½",'2025-09-20',"int"),
(0,"2526","1",1,2,7428960,"e","z",0,"1",'2025-09-20',"int"),
(0,"2526","1",1,8,7468417,"e","z",0,"1",'2025-09-20',"int"),
(0,"2526","1",1,3,7584566,"e","w",0,"1",'2025-09-20',"int"),
(0,"2526","1",1,4,7657342,"e","z",0,"1",'2025-09-20',"int"),
(0,"2526","1",1,7,7828183,"e","w",0,"1",'2025-09-20',"int"),
(0,"2526","1",1,1,7970094,"e","w",0,"1",'2025-09-20',"int"),
(0,"2526","1",1,5,8096242,"e","w",0,"½",'2025-09-20',"int"),
(0,"2526","1",2,8,7099950,"e","w",0,"½",'2025-10-04',"int"),
(0,"2526","1",2,4,7428960,"e","w",0,"1",'2025-10-04',"int"),
(0,"2526","1",2,7,7468417,"e","z",0,"1",'2025-10-04',"int"),
(0,"2526","1",2,3,7584566,"e","z",0,"1",'2025-10-04',"int"),
(0,"2526","1",2,2,7657342,"e","w",0,"1",'2025-10-04',"int"),
(0,"2526","1",2,6,7828183,"e","w",0,"0",'2025-10-04',"int"),
(0,"2526","1",2,1,7970094,"e","z",0,"1",'2025-10-04',"int"),
(0,"2526","1",2,5,8096242,"e","z",0,"0",'2025-10-04',"int"),
(0,"2526","1",3,1,7584566,"e","w",0,"½",'2025-11-01',"int"),
(0,"2526","1",3,2,8956805,"e","z",0,"1",'2025-11-01',"int"),
(0,"2526","1",3,3,7657342,"e","w",0,"0",'2025-11-01',"int"),
(0,"2526","1",3,4,7970094,"e","z",0,"½",'2025-11-01',"int"),
(0,"2526","1",3,5,8285574,"e","w",0,"1",'2025-11-01',"int"),
(0,"2526","1",3,6,8096242,"e","z",0,"0",'2025-11-01',"int"),
(0,"2526","1",3,7,7428960,"e","w",0,"½",'2025-11-01',"int"),
(0,"2526","1",3,8,7468417,"e","z",0,"0",'2025-11-01',"int"),
(0,"2526","1",4,1,7099950,"e","z",0,"½",'2025-11-22',"int"),
(0,"2526","1",4,2,7428960,"e","w",0,"1",'2025-11-22',"int"),
(0,"2526","1",4,3,7584566,"e","z",0,"0",'2025-11-22',"int"),
(0,"2526","1",4,4,7970094,"e","w",0,"½",'2025-11-22',"int"),
(0,"2526","1",4,5,7657342,"e","z",0,"1",'2025-11-22',"int"),
(0,"2526","1",4,6,7468417,"e","w",0,"0",'2025-11-22',"int"),
(0,"2526","1",4,7,5968611,"e","z",0,"½",'2025-11-22',"int"),
(0,"2526","1",4,8,8096242,"e","w",0,"1",'2025-11-22',"int"),
(0,"2526","1",5,1,7657342,"e","w",0,"1",'2025-12-13',"int"),
(0,"2526","1",5,2,7428960,"e","z",0,"0",'2025-12-13',"int"),
(0,"2526","1",5,3,7584566,"e","w",0,"0",'2025-12-13',"int"),
(0,"2526","1",5,4,7099950,"e","z",0,"0",'2025-12-13',"int"),
(0,"2526","1",5,5,8285574,"e","w",0,"1",'2025-12-13',"int"),
(0,"2526","1",5,6,7828183,"e","z",0,"1",'2025-12-13',"int"),
(0,"2526","1",5,7,8096242,"e","w",0,"0",'2025-12-13',"int"),
(0,"2526","1",5,8,7970094,"e","z",0,"1",'2025-12-13',"int");

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","1",7,1,8956805,"e","z",0,"1",'2026-02-07',"int"),
(0,"2526","1",7,2,7428960,"e","w",0,"1",'2026-02-07',"int"),
(0,"2526","1",7,3,7584566,"e","z",0,"0",'2026-02-07',"int"),
(0,"2526","1",7,4,7970094,"e","w",0,"1",'2026-02-07',"int"),
(0,"2526","1",7,5,7657342,"e","z",0,"½",'2026-02-07',"int"),
(0,"2526","1",7,6,5968611,"e","w",0,"½",'2026-02-07',"int"),
(0,"2526","1",7,7,8285574,"e","z",0,"1",'2026-02-07',"int"),
(0,"2526","1",7,8,7468417,"e","w",0,"1",'2026-02-07',"int"),
(0,"2526","1",8,1,7657342,"e","w",0,"0",'2026-03-07',"int"),
(0,"2526","1",8,2,7970094,"e","z",0,"1",'2026-03-07',"int"),
(0,"2526","1",8,3,7828183,"e","w",0,"1",'2026-03-07',"int"),
(0,"2526","1",8,4,7584566,"e","z",0,"1",'2026-03-07',"int"),
(0,"2526","1",8,5,7428960,"e","w",0,"½",'2026-03-07',"int"),
(0,"2526","1",8,6,8096242,"e","z",0,"1",'2026-03-07',"int"),
(0,"2526","1",8,7,7468417,"e","w",0,"1",'2026-03-07',"int"),
(0,"2526","1",8,8,7099950,"e","z",0,"½",'2026-03-07',"int");

-- Waagtoren 2 TODO 
set @seizoen = "2526";
set @team = "2";
set @ronde = 8;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","2",1,1,5968611,"e","w",0,"½",'2025-09-20',"int"),
(0,"2526","2",1,2,6335670,"e","z",0,"½",'2025-09-20',"int"),
(0,"2526","2",1,3,7129991,"e","w",0,"1",'2025-09-20',"int"),
(0,"2526","2",1,6,7509920,"e","z",0,"1",'2025-09-20',"int"),
(0,"2526","2",1,5,7613166,"e","w",0,"½",'2025-09-20',"int"),
(0,"2526","2",1,4,7707832,"e","z",0,"0",'2025-09-20',"int"),
(0,"2526","2",1,7,8112654,"e","w",0,"1",'2025-09-20',"int"),
(0,"2526","2",1,8,8587337,"e","z",0,"1",'2025-09-20',"int"),
(0,"2526","2",2,3,5968611,"e","z",0,"½",'2025-10-04',"int"),
(0,"2526","2",2,2,6335670,"e","w",0,"0",'2025-10-04',"int"),
(0,"2526","2",2,7,7129991,"e","z",0,"0",'2025-10-04',"int"),
(0,"2526","2",2,4,7509920,"e","w",0,"½",'2025-10-04',"int"),
(0,"2526","2",2,1,7613166,"e","z",0,"½",'2025-10-04',"int"),
(0,"2526","2",2,8,7707832,"e","w",0,"½",'2025-10-04',"int"),
(0,"2526","2",2,5,8112654,"e","z",0,"0",'2025-10-04',"int"),
(0,"2526","2",2,6,8587337,"e","w",0,"0",'2025-10-04',"int"),
(0,"2526","2",3,1,6335670,"e","w",0,"0",'2025-11-01',"int"),
(0,"2526","2",3,2,5968611,"e","z",0,"1",'2025-11-01',"int"),
(0,"2526","2",3,3,7509920,"e","w",0,"0",'2025-11-01',"int"),
(0,"2526","2",3,4,7613166,"e","z",0,"1",'2025-11-01',"int"),
(0,"2526","2",3,5,8587337,"e","w",0,"1",'2025-11-01',"int"),
(0,"2526","2",3,6,8112654,"e","z",0,"0",'2025-11-01',"int"),
(0,"2526","2",3,7,9065100,"e","w",0,"½",'2025-11-01',"int"),
(0,"2526","2",3,8,7535396,"e","z",0,"½",'2025-11-01',"int"),
(0,"2526","2",4,1,7129991,"e","z",0,"0",'2025-11-22',"int"),
(0,"2526","2",4,2,7879520,"e","w",0,"0",'2025-11-22',"int"),
(0,"2526","2",4,3,8587337,"e","z",0,"1",'2025-11-22',"int"),
(0,"2526","2",4,4,8112654,"e","w",0,"0",'2025-11-22',"int"),
(0,"2526","2",4,5,6335670,"e","z",0,"0",'2025-11-22',"int"),
(0,"2526","2",4,6,7509920,"e","w",0,"0",'2025-11-22',"int"),
(0,"2526","2",4,7,7707832,"e","z",0,"0",'2025-11-22',"int"),
(0,"2526","2",4,8,7613166,"e","w",0,"1",'2025-11-22',"int"),
(0,"2526","2",5,1,5968611,"e","w",0,"½",'2025-12-13',"int"),
(0,"2526","2",5,2,6335670,"e","z",0,"0",'2025-12-13',"int"),
(0,"2526","2",5,3,8587337,"e","w",0,"0",'2025-12-13',"int"),
(0,"2526","2",5,4,7613166,"e","z",0,"1",'2025-12-13',"int"),
(0,"2526","2",5,5,8112654,"e","w",0,"½",'2025-12-13',"int"),
(0,"2526","2",5,6,7292043,"e","z",0,"½",'2025-12-13',"int"),
(0,"2526","2",5,7,7707832,"e","w",0,"1",'2025-12-13',"int"),
(0,"2526","2",5,8,7509920,"e","z",0,"1",'2025-12-13',"int");

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","2",7,1,8112654,"e","z",0,"½",'2026-02-07',"int"),
(0,"2526","2",7,2,7613166,"e","w",0,"1",'2026-02-07',"int"),
(0,"2526","2",7,3,7129991,"e","z",0,"1",'2026-02-07',"int"),
(0,"2526","2",7,4,8587337,"e","w",0,"0",'2026-02-07',"int"),
(0,"2526","2",7,5,7707832,"e","z",0,"0",'2026-02-07',"int"),
(0,"2526","2",7,6,9056674,"e","w",0,"½",'2026-02-07',"int"),
(0,"2526","2",7,7,7509920,"e","z",0,"0",'2026-02-07',"int"),
(0,"2526","2",7,8,6335670,"e","w",0,"½",'2026-02-07',"int"),
(0,"2526","2",8,1,7129991,"e","w",0,"0",'2026-03-07',"int"),
(0,"2526","2",8,2,5968611,"e","z",0,"½",'2026-03-07',"int"),
(0,"2526","2",8,3,7613166,"e","w",0,"½",'2026-03-07',"int"),
(0,"2526","2",8,4,8587337,"e","z",0,"0",'2026-03-07',"int"),
(0,"2526","2",8,5,6335670,"e","w",0,"0",'2026-03-07',"int"),
(0,"2526","2",8,6,8112654,"e","z",0,"0",'2026-03-07',"int"),
(0,"2526","2",8,7,7707832,"e","w",0,"0",'2026-03-07',"int"),
(0,"2526","2",8,8,7509920,"e","z",0,"1",'2026-03-07',"int");

-- Waagtoren 3 TODO 
set @seizoen = "2526";
set @team = "3";
set @ronde = 8;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","3",1,2,6207520,"e","z",0,"1",'2025-09-20',"int"),
(0,"2526","3",1,8,6420557,"e","z",0,"1",'2025-09-20',"int"),
(0,"2526","3",1,5,6930957,"e","w",0,"0",'2025-09-20',"int"),
(0,"2526","3",1,6,7292043,"e","z",0,"0",'2025-09-20',"int"),
(0,"2526","3",1,3,7665834,"e","w",0,"½",'2025-09-20',"int"),
(0,"2526","3",1,4,8484443,"e","z",0,"0",'2025-09-20',"int"),
(0,"2526","3",1,7,9056674,"e","w",0,"1",'2025-09-20',"int"),
(0,"2526","3",1,1,9065100,"e","w",0,"0",'2025-09-20',"int"),
(0,"2526","3",2,2,6207520,"e","w",0,"0",'2025-10-04',"int"),
(0,"2526","3",2,6,6420557,"e","w",0,"0",'2025-10-04',"int"),
(0,"2526","3",2,4,6572511,"e","w",0,"0",'2025-10-04',"int"),
(0,"2526","3",2,7,6930957,"e","z",0,"1",'2025-10-04',"int"),
(0,"2526","3",2,8,8400183,"e","w",0,"1",'2025-10-04',"int"),
(0,"2526","3",2,3,8484443,"e","z",0,"0",'2025-10-04',"int"),
(0,"2526","3",2,5,9056674,"e","z",0,"1",'2025-10-04',"int"),
(0,"2526","3",2,1,9065100,"e","z",0,"1",'2025-10-04',"int"),
(0,"2526","3",3,1,9056674,"e","w",0,"0",'2025-11-01',"int"),
(0,"2526","3",3,2,6930957,"e","z",0,"0",'2025-11-01',"int"),
(0,"2526","3",3,3,7665834,"e","w",0,"0",'2025-11-01',"int"),
(0,"2526","3",3,4,8400183,"e","z",0,"0",'2025-11-01',"int"),
(0,"2526","3",3,5,7529522,"e","w",0,"½",'2025-11-01',"int"),
(0,"2526","3",3,6,6572511,"e","z",0,"½",'2025-11-01',"int"),
(0,"2526","3",3,7,7292043,"e","w",0,"0",'2025-11-01',"int"),
(0,"2526","3",3,8,6420557,"e","z",0,"0",'2025-11-01',"int"),
(0,"2526","3",4,1,6207520,"e","z",0,"0",'2025-11-22',"int"),
(0,"2526","3",4,2,9065100,"e","w",0,"½",'2025-11-22',"int"),
(0,"2526","3",4,3,9056674,"e","z",0,"0",'2025-11-22',"int"),
(0,"2526","3",4,4,6930957,"e","w",0,"½",'2025-11-22',"int"),
(0,"2526","3",4,5,7665834,"e","z",0,"0",'2025-11-22',"int"),
(0,"2526","3",4,6,6572511,"e","w",0,"1",'2025-11-22',"int"),
(0,"2526","3",4,7,8400183,"e","z",0,"½",'2025-11-22',"int"),
(0,"2526","3",4,8,8484443,"e","w",0,"1",'2025-11-22',"int"),
(0,"2526","3",5,1,9065100,"e","w",0,"½",'2025-12-13',"int"),
(0,"2526","3",5,2,8484443,"e","z",0,"1",'2025-12-13',"int"),
(0,"2526","3",5,3,7665834,"e","w",0,"1",'2025-12-13',"int"),
(0,"2526","3",5,4,6420557,"e","z",0,"0",'2025-12-13',"int"),
(0,"2526","3",5,5,6930957,"e","w",0,"½",'2025-12-13',"int"),
(0,"2526","3",5,6,6572511,"e","z",0,"0",'2025-12-13',"int"),
(0,"2526","3",5,7,7757409,"e","w",0,"½",'2025-12-13',"int"),
(0,"2526","3",5,8,7546506,"e","z",0,"1",'2025-12-13',"int");

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","3",7,1,9065100,"e","z",0,"0",'2026-02-07',"int"),
(0,"2526","3",7,2,8484443,"e","w",0,"0",'2026-02-07',"int"),
(0,"2526","3",7,3,7665834,"e","z",0,"0",'2026-02-07',"int"),
(0,"2526","3",7,4,6207520,"e","w",0,"½",'2026-02-07',"int"),
(0,"2526","3",7,5,6930957,"e","z",0,"0",'2026-02-07',"int"),
(0,"2526","3",7,6,8400183,"e","w",0,"1",'2026-02-07',"int"),
(0,"2526","3",7,7,6572511,"e","z",0,"1",'2026-02-07',"int"),
(0,"2526","3",7,8,6420557,"e","w",0,"1",'2026-02-07',"int"),
(0,"2526","3",8,1,8484443,"e","w",0,"1",'2026-03-07',"int"),
(0,"2526","3",8,2,6572511,"e","z",0,"½",'2026-03-07',"int"),
(0,"2526","3",8,3,9056674,"e","w",0,"0",'2026-03-07',"int"),
(0,"2526","3",8,4,6207520,"e","z",0,"½",'2026-03-07',"int"),
(0,"2526","3",8,5,6420557,"e","w",0,"½",'2026-03-07',"int"),
(0,"2526","3",8,6,6930957,"e","z",0,"0",'2026-03-07',"int"),
(0,"2526","3",8,7,7665834,"e","w",0,"1",'2026-03-07',"int"),
(0,"2526","3",8,8,8400183,"e","z",0,"½",'2026-03-07',"int");


-- Waagtoren 4 TODO 
set @seizoen = "2526";
set @team = "4";
set @ronde = 7;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","4",1,1,7282033,"e","z",0,"0",'2025-10-04',"int"),
(0,"2526","4",1,8,7504310,"e","w",0,"1",'2025-10-04',"int"),
(0,"2526","4",1,7,7519930,"e","z",0,"½",'2025-10-04',"int"),
(0,"2526","4",1,3,7546506,"e","z",0,"0",'2025-10-04',"int"),
(0,"2526","4",1,4,7699010,"e","w",0,"1",'2025-10-04',"int"),
(0,"2526","4",1,6,7758014,"e","w",0,"1",'2025-10-04',"int"),
(0,"2526","4",1,2,7809285,"e","w",0,"1",'2025-10-04',"int"),
(0,"2526","4",1,5,7904589,"e","z",0,"1",'2025-10-04',"int"),
(0,"2526","4",2,1,7699010,"e","w",0,"½",'2025-11-01',"int"),
(0,"2526","4",2,2,7758014,"e","z",0,"1",'2025-11-01',"int"),
(0,"2526","4",2,3,7282033,"e","w",0,"0",'2025-11-01',"int"),
(0,"2526","4",2,4,6214153,"e","z",0,"1",'2025-11-01',"int"),
(0,"2526","4",2,5,7546506,"e","w",0,"1",'2025-11-01',"int"),
(0,"2526","4",2,6,7904589,"e","z",0,"½",'2025-11-01',"int"),
(0,"2526","4",2,7,7504310,"e","w",0,"½",'2025-11-01',"int"),
(0,"2526","4",2,8,7519930,"e","z",0,"1",'2025-11-01',"int"),
(0,"2526","4",3,1,7546506,"e","z",0,"½",'2025-11-22',"int"),
(0,"2526","4",3,2,7758014,"e","w",0,"½",'2025-11-22',"int"),
(0,"2526","4",3,3,7699010,"e","z",0,"1",'2025-11-22',"int"),
(0,"2526","4",3,4,8750093,"e","w",0,"1",'2025-11-22',"int"),
(0,"2526","4",3,5,7809285,"e","z",0,"1",'2025-11-22',"int"),
(0,"2526","4",3,6,7904589,"e","w",0,"1",'2025-11-22',"int"),
(0,"2526","4",3,7,7504310,"e","z",0,"1",'2025-11-22',"int"),
(0,"2526","4",3,8,7519930,"e","w",0,"1",'2025-11-22',"int"),
(0,"2526","4",4,1,7809285,"e","w",0,"1",'2025-12-13',"int"),
(0,"2526","4",4,2,7282033,"e","z",0,"1",'2025-12-13',"int"),
(0,"2526","4",4,3,7699010,"e","w",0,"0",'2025-12-13',"int"),
(0,"2526","4",4,4,7758014,"e","z",0,"1",'2025-12-13',"int"),
(0,"2526","4",4,5,7904589,"e","w",0,"1",'2025-12-13',"int"),
(0,"2526","4",4,6,7519930,"e","z",0,"½",'2025-12-13',"int"),
(0,"2526","4",4,7,7504310,"e","w",0,"1",'2025-12-13',"int"),
(0,"2526","4",4,8,9077651,"e","z",0,"½",'2025-12-13',"int");

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","4",6,1,7546506,"e","z",0,"1",'2026-02-07',"int"),
(0,"2526","4",6,2,7758014,"e","w",0,"0",'2026-02-07',"int"),
(0,"2526","4",6,3,8750093,"e","z",0,"0",'2026-02-07',"int"),
(0,"2526","4",6,4,7282033,"e","w",0,"1",'2026-02-07',"int"),
(0,"2526","4",6,5,9077651,"e","z",0,"0",'2026-02-07',"int"),
(0,"2526","4",6,6,7904589,"e","w",0,"0",'2026-02-07',"int"),
(0,"2526","4",6,7,7504310,"e","z",0,"1",'2026-02-07',"int"),
(0,"2526","4",6,8,7519930,"e","w",0,"½",'2026-02-07',"int"),
(0,"2526","4",7,1,7758014,"e","w",0,"½",'2026-03-07',"int"),
(0,"2526","4",7,2,6225934,"e","z",0,"1",'2026-03-07',"int"),
(0,"2526","4",7,3,7546506,"e","w",0,"1",'2026-03-07',"int"),
(0,"2526","4",7,4,7699010,"e","z",0,"1",'2026-03-07',"int"),
(0,"2526","4",7,5,7519930,"e","w",0,"½",'2026-03-07',"int"),
(0,"2526","4",7,6,7292043,"e","z",0,"1",'2026-03-07',"int"),
(0,"2526","4",7,7,7504310,"e","w",0,"1",'2026-03-07',"int"),
(0,"2526","4",7,8,7904589,"e","z",0,"1",'2026-03-07',"int");


-- Waagtoren 5 TODO 
set @seizoen = "2526";
set @team = "5";
set @ronde = 7;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","5",1,4,6212404,"e","w",0,"0",'2025-10-04',"int"),
(0,"2526","5",1,2,6951362,"e","w",0,"0",'2025-10-04',"int"),
(0,"2526","5",1,6,7269900,"e","w",0,"1",'2025-10-04',"int"),
(0,"2526","5",1,5,7399469,"e","z",0,"0",'2025-10-04',"int"),
(0,"2526","5",1,3,7443172,"e","z",0,"0",'2025-10-04',"int"),
(0,"2526","5",1,1,8073978,"e","z",0,"½",'2025-10-04',"int"),
(0,"2526","5",1,7,8182416,"e","z",0,"1",'2025-10-04',"int"),
(0,"2526","5",1,8,8472530,"e","w",0,"½",'2025-10-04',"int"),
(0,"2526","5",2,1,7269900,"e","w",0,"½",'2025-11-01',"int"),
(0,"2526","5",2,2,7399469,"e","z",0,"½",'2025-11-01',"int"),
(0,"2526","5",2,3,6951362,"e","w",0,"1",'2025-11-01',"int"),
(0,"2526","5",2,4,7443172,"e","z",0,"½",'2025-11-01',"int"),
(0,"2526","5",2,5,6212404,"e","w",0,"½",'2025-11-01',"int"),
(0,"2526","5",2,6,8182416,"e","z",0,"½",'2025-11-01',"int"),
(0,"2526","5",2,7,8472530,"e","w",0,"½",'2025-11-01',"int"),
(0,"2526","5",2,8,8073978,"e","z",0,"1",'2025-11-01',"int"),
(0,"2526","5",3,1,8073978,"e","z",0,"0",'2025-11-22',"int"),
(0,"2526","5",3,2,8182416,"e","w",0,"1",'2025-11-22',"int"),
(0,"2526","5",3,3,6951362,"e","z",0,"0",'2025-11-22',"int"),
(0,"2526","5",3,4,7399469,"e","w",0,"1",'2025-11-22',"int"),
(0,"2526","5",3,5,7443172,"e","z",0,"1",'2025-11-22',"int"),
(0,"2526","5",3,6,7269900,"e","w",0,"1",'2025-11-22',"int"),
(0,"2526","5",3,7,7419621,"e","z",0,"1",'2025-11-22',"int"),
(0,"2526","5",3,8,8472530,"e","w",0,"0",'2025-11-22',"int"),
(0,"2526","5",4,1,7443172,"e","w",0,"1",'2025-12-13',"int"),
(0,"2526","5",4,2,6214153,"e","z",0,"0",'2025-12-13',"int"),
(0,"2526","5",4,3,7101193,"e","w",0,"1",'2025-12-13',"int"),
(0,"2526","5",4,4,7399469,"e","z",0,"½",'2025-12-13',"int"),
(0,"2526","5",4,5,8182416,"e","w",0,"1",'2025-12-13',"int"),
(0,"2526","5",4,6,6951362,"e","z",0,"0",'2025-12-13',"int"),
(0,"2526","5",4,7,8073978,"e","w",0,"0",'2025-12-13',"int"),
(0,"2526","5",4,8,6212404,"e","z",0,"0",'2025-12-13',"int");

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","5",6,1,7269900,"e","z",0,"1",'2026-02-07',"int"),
(0,"2526","5",6,2,7399469,"e","w",0,"1",'2026-02-07',"int"),
(0,"2526","5",6,3,8182416,"e","z",0,"1",'2026-02-07',"int"),
(0,"2526","5",6,4,7443172,"e","w",0,"0",'2026-02-07',"int"),
(0,"2526","5",6,5,6951362,"e","z",0,"1",'2026-02-07',"int"),
(0,"2526","5",6,6,8073978,"e","w",0,"0",'2026-02-07',"int"),
(0,"2526","5",6,7,6212404,"e","z",0,"1",'2026-02-07',"int"),
(0,"2526","5",6,8,7419621,"e","w",0,"1",'2026-02-07',"int"),
(0,"2526","5",7,1,7269900,"e","w",0,"0",'2026-03-07',"int"),
(0,"2526","5",7,2,6214153,"e","z",0,"½",'2026-03-07',"int"),
(0,"2526","5",7,3,8182416,"e","w",0,"½",'2026-03-07',"int"),
(0,"2526","5",7,4,7443172,"e","z",0,"1",'2026-03-07',"int"),
(0,"2526","5",7,5,6951362,"e","w",0,"1",'2026-03-07',"int"),
(0,"2526","5",7,6,8073978,"e","z",0,"0",'2026-03-07',"int"),
(0,"2526","5",7,7,6212404,"e","w",0,"½",'2026-03-07',"int"),
(0,"2526","5",7,8,8472530,"e","z",0,"1",'2026-03-07',"int");

-- Waagtoren 6 TODO 
set @seizoen = "2526";
set @team = "6";
set @ronde = 7;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","6",1,5,6187885,"e","z",0,"0",'2025-10-04',"int"),
(0,"2526","6",1,2,7321534,"e","w",0,"0",'2025-10-04',"int"),
(0,"2526","6",1,8,7771665,"e","w",0,"0",'2025-10-04',"int"),
(0,"2526","6",1,1,8224502,"e","z",0,"1",'2025-10-04',"int"),
(0,"2526","6",1,6,8243312,"e","w",0,"½",'2025-10-04',"int"),
(0,"2526","6",1,7,8978717,"e","z",0,"0",'2025-10-04',"int"),
(0,"2526","6",1,4,9023234,"e","w",0,"0",'2025-10-04',"int"),
(0,"2526","6",1,3,9077651,"e","z",0,"0",'2025-10-04',"int"),
(0,"2526","6",2,1,8224502,"e","w",0,"½",'2025-11-01',"int"),
(0,"2526","6",2,2,7321534,"e","z",0,"½",'2025-11-01',"int"),
(0,"2526","6",2,3,9077651,"e","w",0,"1",'2025-11-01',"int"),
(0,"2526","6",2,4,9023234,"e","z",0,"0",'2025-11-01',"int"),
(0,"2526","6",2,5,8744494,"e","w",0,"1",'2025-11-01',"int"),
(0,"2526","6",2,6,7582102,"e","z",0,"0",'2025-11-01',"int"),
(0,"2526","6",2,7,7777715,"e","w",0,"0",'2025-11-01',"int"),
(0,"2526","6",2,8,8950876,"e","z",0,"0",'2025-11-01',"int"),
(0,"2526","6",3,1,8224502,"e","z",0,"0",'2025-11-22',"int"),
(0,"2526","6",3,2,7321534,"e","w",0,"0",'2025-11-22',"int"),
(0,"2526","6",3,3,9077651,"e","z",0,"½",'2025-11-22',"int"),
(0,"2526","6",3,4,7582102,"e","w",0,"0",'2025-11-22',"int"),
(0,"2526","6",3,5,8978717,"e","z",0,"0",'2025-11-22',"int"),
(0,"2526","6",3,6,8350738,"e","w",0,"0",'2025-11-22',"int"),
(0,"2526","6",3,7,7777715,"e","z",0,"½",'2025-11-22',"int"),
(0,"2526","6",3,8,8335415,"e","w",0,"0",'2025-11-22',"int"),
(0,"2526","6",4,1,8224502,"e","w",0,"0",'2025-12-13',"int"),
(0,"2526","6",4,2,7321534,"e","z",0,"0",'2025-12-13',"int"),
(0,"2526","6",4,3,9023234,"e","w",0,"0",'2025-12-13',"int"),
(0,"2526","6",4,4,6187885,"e","z",0,"0",'2025-12-13',"int"),
(0,"2526","6",4,5,8335415,"e","w",0,"0",'2025-12-13',"int"),
(0,"2526","6",4,6,8978717,"e","z",0,"0",'2025-12-13',"int"),
(0,"2526","6",4,7,7777715,"e","w",0,"0",'2025-12-13',"int"),
(0,"2526","6",4,8,8950876,"e","z",0,"0",'2025-12-13',"int"),
(0,"2526","6",7,1,7321534,"e","w",0,"0",'2026-03-07',"int"),
(0,"2526","6",7,2,8224502,"e","z",0,"0",'2026-03-07',"int"),
(0,"2526","6",7,3,9077651,"e","w",0,"1",'2026-03-07',"int"),
(0,"2526","6",7,4,7777715,"e","z",0,"0",'2026-03-07',"int"),
(0,"2526","6",7,5,9058555,"e","w",0,"0",'2026-03-07',"int"),
(0,"2526","6",7,6,8226317,"e","z",0,"0",'2026-03-07',"int"),
(0,"2526","6",7,7,9040801,"e","w",0,"½",'2026-03-07',"int"),
(0,"2526","6",7,8,8950876,"e","z",0,"0",'2026-03-07',"int");


-- Waagtoren NHSB beker goud
set @seizoen = "2526";
set @team = "nbe";
set @ronde = 2;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","nbe",1,1,8795941,"e","w",0,"1",'2025-12-12',"int"),
(0,"2526","nbe",1,2,8096242,"e","z",0,"1",'2025-12-12',"int"),
(0,"2526","nbe",1,3,7428960,"e","w",0,"½",'2025-12-12',"int"),
(0,"2526","nbe",1,4,5968611,"e","z",0,"1",'2025-12-12',"int"),
(0,"2526","nbe",2,1,7970094,"e","z",0,"1",'2026-02-03',"int"),
(0,"2526","nbe",2,2,7428960,"e","w",0,"0",'2026-02-03',"int"),
(0,"2526","nbe",2,3,8096242,"e","z",0,"½",'2026-02-03',"int"),
(0,"2526","nbe",2,4,5968611,"e","w",0,"0",'2026-02-03',"int");

-- Waagtoren NHSB beker zilver
set @seizoen = "2526";
set @team = "nbz";
set @ronde = 3;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","nbz",1,1,6930957,"e","w",0,"½",'2025-11-25',"int"),
(0,"2526","nbz",1,2,7529522,"e","z",0,"1",'2025-11-25',"int"),
(0,"2526","nbz",1,3,9056674,"e","w",0,"1",'2025-11-25',"int"),
(0,"2526","nbz",1,4,8484443,"e","z",0,"1",'2025-11-25',"int"),
(0,"2526","nbz",2,1,6930957,"e","z",0,"0",'2026-02-17',"int"),
(0,"2526","nbz",2,2,7529522,"e","w",0,"1",'2026-02-17',"int"),
(0,"2526","nbz",2,3,9056674,"e","z",0,"½",'2026-02-17',"int"),
(0,"2526","nbz",2,4,8484443,"e","w",0,"1",'2026-02-17',"int"),
(0,"2526","nbz",3,1,6930957,"e","w",0,"0",'2026-03-09',"int"),
(0,"2526","nbz",3,2,7529522,"e","z",0,"1",'2026-03-09',"int"),
(0,"2526","nbz",3,3,7535396,"e","w",0,"0",'2026-03-09',"int"),
(0,"2526","nbz",3,4,9056674,"e","z",0,"1",'2026-03-09',"int");

-- Waagtoren NHSB beker brons
set @seizoen = "2526";
set @team = "nbb";
set @ronde = 2;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","nbb",1,1,8276752,"e","w",0,"½",'2025-11-14',"int"),
(0,"2526","nbb",1,2,8182416,"e","z",0,"1",'2025-11-14',"int"),
(0,"2526","nbb",1,3,8485059,"e","w",0,"0",'2025-11-14',"int"),
(0,"2526","nbb",1,4,7321534,"e","z",0,"1",'2025-11-14',"int"),
(0,"2526","nbb",2,1,8276752,"e","w",0,"0",'2026-02-10',"int"),
(0,"2526","nbb",2,2,8182416,"e","z",0,"½",'2026-02-10',"int"),
(0,"2526","nbb",2,3,7101193,"e","w",0,"1",'2026-02-10',"int"),
(0,"2526","nbb",2,4,7321534,"e","z",0,"½",'2026-02-10',"int");

-- Waagtoren n1 TODO
set @seizoen = "2526";
set @team = "n1";
set @ronde = 7;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n1",1,1,7970094,"e","z",0,"1",'2025-09-23',"int"),
(0,"2526","n1",1,2,7428960,"e","w",0,"1",'2025-09-23',"int"),
(0,"2526","n1",1,3,8096242,"e","z",0,"½",'2025-09-23',"int"),
(0,"2526","n1",1,4,7099950,"e","w",0,"1",'2025-09-23',"int"),
(0,"2526","n1",1,5,7613166,"e","z",0,"1",'2025-09-23',"int"),
(0,"2526","n1",1,6,7129991,"e","w",0,"1",'2025-09-23',"int"),
(0,"2526","n1",1,7,8112654,"e","z",0,"½",'2025-09-23',"int"),
(0,"2526","n1",1,8,8587337,"e","w",0,"1",'2025-09-23',"int"),
(0,"2526","n1",2,1,8096242,"e","w",0,"½",'2025-10-16',"int"),
(0,"2526","n1",2,2,5968611,"e","z",0,"1",'2025-10-16',"int"),
(0,"2526","n1",2,3,7970094,"e","w",0,"1",'2025-10-16',"int"),
(0,"2526","n1",2,4,7099950,"e","z",0,"½",'2025-10-16',"int"),
(0,"2526","n1",2,5,7613166,"e","w",0,"0",'2025-10-16',"int"),
(0,"2526","n1",2,6,7509920,"e","z",0,"0",'2025-10-16',"int"),
(0,"2526","n1",2,7,8112654,"e","w",0,"1",'2025-10-16',"int"),
(0,"2526","n1",2,8,8587337,"e","z",0,"½",'2025-10-16',"int"),
(0,"2526","n1",3,1,7129991,"e","w",0,"½",'2025-11-11',"int"),
(0,"2526","n1",3,2,7428960,"e","z",0,"0",'2025-11-11',"int"),
(0,"2526","n1",3,3,8096242,"e","w",0,"½",'2025-11-11',"int"),
(0,"2526","n1",3,4,5968611,"e","z",0,"½",'2025-11-11',"int"),
(0,"2526","n1",3,5,7613166,"e","w",0,"0",'2025-11-11',"int"),
(0,"2526","n1",3,6,8587337,"e","z",0,"1",'2025-11-11',"int"),
(0,"2526","n1",3,7,7509920,"e","w",0,"0",'2025-11-11',"int"),
(0,"2526","n1",3,8,7535396,"e","z",0,"½",'2025-11-11',"int"),
(0,"2526","n1",4,1,5968611,"e","z",0,"0",'2025-12-02',"int"),
(0,"2526","n1",4,2,7584566,"e","w",0,"1",'2025-12-02',"int"),
(0,"2526","n1",4,3,8096242,"e","z",0,"½",'2025-12-02',"int"),
(0,"2526","n1",4,4,7428960,"e","w",0,"½",'2025-12-02',"int"),
(0,"2526","n1",4,5,7613166,"e","z",0,"½",'2025-12-02',"int"),
(0,"2526","n1",4,6,7129991,"e","w",0,"½",'2025-12-02',"int"),
(0,"2526","n1",4,7,7707832,"e","z",0,"½",'2025-12-02',"int"),
(0,"2526","n1",4,8,8587337,"e","w",0,"1",'2025-12-02',"int"),
(0,"2526","n1",5,1,7428960,"e","z",0,"1",'2026-02-10',"int"),
(0,"2526","n1",5,2,7970094,"e","w",0,"0",'2026-02-10',"int"),
(0,"2526","n1",5,3,7129991,"e","z",0,"0",'2026-02-10',"int"),
(0,"2526","n1",5,4,5968611,"e","w",0,"½",'2026-02-10',"int"),
(0,"2526","n1",5,5,7613166,"e","z",0,"1",'2026-02-10',"int"),
(0,"2526","n1",5,6,8587337,"e","w",0,"1",'2026-02-10',"int"),
(0,"2526","n1",5,7,8484443,"e","z",0,"0",'2026-02-10',"int"),
(0,"2526","n1",5,8,7707832,"e","w",0,"0",'2026-02-10',"int"),
(0,"2526","n1",6,1,7428960,"e","w",0,"½",'2026-03-04',"int"),
(0,"2526","n1",6,2,7970094,"e","z",0,"½",'2026-03-04',"int"),
(0,"2526","n1",6,3,7613166,"e","w",0,"1",'2026-03-04',"int"),
(0,"2526","n1",6,4,8587337,"e","z",0,"0",'2026-03-04',"int"),
(0,"2526","n1",6,5,7129991,"e","w",0,"0",'2026-03-04',"int"),
(0,"2526","n1",6,6,7707832,"e","z",0,"0",'2026-03-04',"int"),
(0,"2526","n1",6,7,8484443,"e","w",0,"0",'2026-03-04',"int"),
(0,"2526","n1",6,8,7509920,"e","z",0,"1",'2026-03-04',"int"),
(0,"2526","n1",7,1,7970094,"e","w",0,"½",'2026-03-10',"int"),
(0,"2526","n1",7,2,7428960,"e","z",0,"1",'2026-03-10',"int"),
(0,"2526","n1",7,3,5968611,"e","w",0,"1",'2026-03-10',"int"),
(0,"2526","n1",7,4,7129991,"e","z",0,"0",'2026-03-10',"int"),
(0,"2526","n1",7,5,8096242,"e","w",0,"0",'2026-03-10',"int"),
(0,"2526","n1",7,6,9065100,"e","z",0,"0",'2026-03-10',"int"),
(0,"2526","n1",7,7,8587337,"e","w",0,"0",'2026-03-10',"int"),
(0,"2526","n1",7,8,9056674,"e","z",0,"0",'2026-03-10',"int");


-- Waagtoren n2 TODO
set @team = "n2";
set @ronde = 6;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n2",1,1,8112654,"e","w",0,"0",'2025-09-26',"int"),
(0,"2526","n2",1,2,9065100,"e","z",0,"1",'2025-09-26',"int"),
(0,"2526","n2",1,3,7529522,"e","w",0,"1",'2025-09-26',"int"),
(0,"2526","n2",1,4,6207520,"e","z",0,"½",'2025-09-26',"int"),
(0,"2526","n2",1,5,8484443,"e","w",0,"½",'2025-09-26',"int"),
(0,"2526","n2",1,6,7824674,"e","z",0,"1",'2025-09-26',"int"),
(0,"2526","n2",2,1,7099950,"e","z",0,"1",'2025-10-14',"int"),
(0,"2526","n2",2,2,9065100,"e","w",0,"1",'2025-10-14',"int"),
(0,"2526","n2",2,3,8112654,"e","z",0,"1",'2025-10-14',"int"),
(0,"2526","n2",2,4,6207520,"e","w",0,"1",'2025-10-14',"int"),
(0,"2526","n2",2,5,8484443,"e","z",0,"1",'2025-10-14',"int"),
(0,"2526","n2",2,6,7824674,"e","w",0,"½",'2025-10-14',"int"),
(0,"2526","n2",3,1,9065100,"e","z",0,"1",'2025-11-11',"int"),
(0,"2526","n2",3,2,8112654,"e","w",0,"0",'2025-11-11',"int"),
(0,"2526","n2",3,3,7099950,"e","z",0,"1",'2025-11-11',"int"),
(0,"2526","n2",3,4,8484443,"e","w",0,"0",'2025-11-11',"int"),
(0,"2526","n2",3,5,7824674,"e","z",0,"0",'2025-11-11',"int"),
(0,"2526","n2",3,6,7529522,"e","w",0,"1",'2025-11-11',"int"),
(0,"2526","n2",4,1,7099950,"e","w",0,"½",'2025-12-02',"int"),
(0,"2526","n2",4,2,9065100,"e","z",0,"½",'2025-12-02',"int"),
(0,"2526","n2",4,3,7535396,"e","w",0,"0",'2025-12-02',"int"),
(0,"2526","n2",4,4,8112654,"e","z",0,"½",'2025-12-02',"int"),
(0,"2526","n2",4,5,7824674,"e","w",0,"0",'2025-12-02',"int"),
(0,"2526","n2",4,6,7546506,"e","z",0,"½",'2025-12-02',"int"),
(0,"2526","n2",5,1,7099950,"e","z",0,"½",'2026-02-10',"int"),
(0,"2526","n2",5,2,6207520,"e","w",0,"½",'2026-02-10',"int"),
(0,"2526","n2",5,3,8112654,"e","z",0,"1",'2026-02-10',"int"),
(0,"2526","n2",5,4,7535396,"e","w",0,"0",'2026-02-10',"int"),
(0,"2526","n2",5,5,6572511,"e","z",0,"1",'2026-02-10',"int"),
(0,"2526","n2",5,6,7824674,"e","w",0,"½",'2026-02-10',"int"),
(0,"2526","n2",6,1,7099950,"e","w",0,"½",'2026-03-09',"int"),
(0,"2526","n2",6,2,9065100,"e","z",0,"0",'2026-03-09',"int"),
(0,"2526","n2",6,3,8112654,"e","w",0,"1",'2026-03-09',"int"),
(0,"2526","n2",6,4,6207520,"e","z",0,"½",'2026-03-09',"int"),
(0,"2526","n2",6,5,8484443,"e","w",0,"0",'2026-03-09',"int"),
(0,"2526","n2",6,6,7824674,"e","z",0,"½",'2026-03-09',"int");

-- Waagtoren n3 TODO
set @team = "n3";
set @ronde = 5;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n3",1,1,6930957,"e","w",0,"½",'2025-09-30',"int"),
(0,"2526","n3",1,2,7529522,"e","z",0,"1",'2025-09-30',"int"),
(0,"2526","n3",1,3,9056674,"e","w",0,"1",'2025-09-30',"int"),
(0,"2526","n3",1,4,6565801,"e","z",0,"0",'2025-09-30',"int"),
(0,"2526","n3",1,5,7468362,"e","w",0,"0",'2025-09-30',"int"),
(0,"2526","n3",1,6,7731812,"e","z",0,"1",'2025-09-30',"int"),
(0,"2526","n3",2,1,6930957,"e","z",0,"1",'2025-10-28',"int"),
(0,"2526","n3",2,2,7529522,"e","w",0,"1",'2025-10-28',"int"),
(0,"2526","n3",2,3,9056674,"e","z",0,"1",'2025-10-28',"int"),
(0,"2526","n3",2,4,6565801,"e","w",0,"1",'2025-10-28',"int"),
(0,"2526","n3",2,5,7468362,"e","z",0,"1",'2025-10-28',"int"),
(0,"2526","n3",2,6,7731812,"e","w",0,"½",'2025-10-28',"int"),
(0,"2526","n3",3,1,6930957,"e","z",0,"1",'2025-11-18',"int"),
(0,"2526","n3",3,2,7529522,"e","w",0,"0",'2025-11-18',"int"),
(0,"2526","n3",3,3,9056674,"e","z",0,"1",'2025-11-18',"int"),
(0,"2526","n3",3,4,6565801,"e","w",0,"0",'2025-11-18',"int"),
(0,"2526","n3",3,5,7468362,"e","z",0,"0",'2025-11-18',"int"),
(0,"2526","n3",3,6,7731812,"e","w",0,"0",'2025-11-18',"int"),
(0,"2526","n3",4,1,6930957,"e","w",0,"½",'2025-12-11',"int"),
(0,"2526","n3",4,2,7529522,"e","z",0,"1",'2025-12-11',"int"),
(0,"2526","n3",4,3,7699010,"e","w",0,"0",'2025-12-11',"int"),
(0,"2526","n3",4,4,6565801,"e","z",0,"0",'2025-12-11',"int"),
(0,"2526","n3",4,5,7731812,"e","w",0,"1",'2025-12-11',"int"),
(0,"2526","n3",4,6,7292043,"e","z",0,"½",'2025-12-11',"int"),
(0,"2526","n3",5,1,6930957,"e","z",0,"0",'2026-02-03',"int"),
(0,"2526","n3",5,2,7529522,"e","w",0,"1",'2026-02-03',"int"),
(0,"2526","n3",5,3,9056674,"e","z",0,"½",'2026-02-03',"int"),
(0,"2526","n3",5,4,6572511,"e","w",0,"1",'2026-02-03',"int"),
(0,"2526","n3",5,5,7468362,"e","z",0,"1",'2026-02-03',"int"),
(0,"2526","n3",5,6,7731812,"e","w",0,"½",'2026-02-03',"int");

-- Waagtoren n4 TODO
set @team = "n4";
set @ronde = 5;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n4",6,1,7546506,"e","w",0,"0",'2026-03-06',"int"),
(0,"2526","n4",6,2,7292043,"e","z",0,"0",'2026-03-06',"int"),
(0,"2526","n4",6,3,7758014,"e","w",0,"1",'2026-03-06',"int"),
(0,"2526","n4",6,4,6214153,"e","z",0,"0",'2026-03-06',"int"),
(0,"2526","n4",6,5,7210137,"e","w",0,"0",'2026-03-06',"int"),
(0,"2526","n4",6,6,6212404,"e","z",0,"0",'2026-03-06',"int");

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n4",1,1,7546506,"e","z",0,"0",'2025-09-30',"int"),
(0,"2526","n4",1,2,7282033,"e","w",0,"1",'2025-09-30',"int"),
(0,"2526","n4",1,3,7758014,"e","z",0,"½",'2025-09-30',"int"),
(0,"2526","n4",1,4,7210137,"e","w",0,"0",'2025-09-30',"int"),
(0,"2526","n4",1,5,6214153,"e","z",0,"0",'2025-09-30',"int"),
(0,"2526","n4",1,6,6212404,"e","w",0,"½",'2025-09-30',"int"),
(0,"2526","n4",2,1,7282033,"e","w",0,"0",'2025-10-31',"int"),
(0,"2526","n4",2,2,7758014,"e","z",0,"½",'2025-10-31',"int"),
(0,"2526","n4",2,3,7546506,"e","w",0,"1",'2025-10-31',"int"),
(0,"2526","n4",2,4,7210137,"e","z",0,"0",'2025-10-31',"int"),
(0,"2526","n4",2,5,6214153,"e","w",0,"½",'2025-10-31',"int"),
(0,"2526","n4",2,6,6212404,"e","z",0,"1",'2025-10-31',"int"),
(0,"2526","n4",3,1,7546506,"e","z",0,"1",'2025-11-18',"int"),
(0,"2526","n4",3,2,7535396,"e","w",0,"1",'2025-11-18',"int"),
(0,"2526","n4",3,3,7282033,"e","z",0,"0",'2025-11-18',"int"),
(0,"2526","n4",3,4,7210137,"e","w",0,"1",'2025-11-18',"int"),
(0,"2526","n4",3,5,6214153,"e","z",0,"1",'2025-11-18',"int"),
(0,"2526","n4",3,6,6212404,"e","w",0,"½",'2025-11-18',"int"),
(0,"2526","n4",4,1,7758014,"e","w",0,"0",'2025-12-12',"int"),
(0,"2526","n4",4,2,7282033,"e","z",0,"½",'2025-12-12',"int"),
(0,"2526","n4",4,3,7546506,"e","w",0,"0",'2025-12-12',"int"),
(0,"2526","n4",4,4,6420557,"e","z",0,"1",'2025-12-12',"int"),
(0,"2526","n4",4,5,6214153,"e","w",0,"0",'2025-12-12',"int"),
(0,"2526","n4",4,6,7210137,"e","z",0,"1",'2025-12-12',"int"),
(0,"2526","n4",5,1,7546506,"e","z",0,"½",'2026-02-03',"int"),
(0,"2526","n4",5,2,7758014,"e","w",0,"1",'2026-02-03',"int"),
(0,"2526","n4",5,3,7282033,"e","z",0,"1",'2026-02-03',"int"),
(0,"2526","n4",5,4,7210137,"e","w",0,"½",'2026-02-03',"int"),
(0,"2526","n4",5,5,6212404,"e","z",0,"½",'2026-02-03',"int"),
(0,"2526","n4",5,6,6214153,"e","w",0,"1",'2026-02-03',"int");

-- Waagtoren n5 TODO
set @team = "n5";
set @ronde = 5;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n5",6,1,7386060,"e","w",0,"0",'2026-03-05',"int"),
(0,"2526","n5",6,2,7101193,"e","z",0,"0",'2026-03-05',"int"),
(0,"2526","n5",6,3,8485059,"e","w",0,"1",'2026-03-05',"int"),
(0,"2526","n5",6,4,8276752,"e","z",0,"0",'2026-03-05',"int"),
(0,"2526","n5",6,5,7519930,"e","w",0,"1",'2026-03-05',"int"),
(0,"2526","n5",6,6,7321534,"e","z",0,"0",'2026-03-05',"int");

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","n5",1,1,7399469,"e","w",0,"0",'2025-09-30',"int"),
(0,"2526","n5",1,2,8276752,"e","z",0,"0",'2025-09-30',"int"),
(0,"2526","n5",1,3,8485059,"e","w",0,"0",'2025-09-30',"int"),
(0,"2526","n5",1,4,7101193,"e","z",0,"1",'2025-09-30',"int"),
(0,"2526","n5",1,5,7519930,"e","w",0,"0",'2025-09-30',"int"),
(0,"2526","n5",1,6,7321534,"e","z",0,"1",'2025-09-30',"int"),
(0,"2526","n5",2,1,7399469,"e","z",0,"½",'2025-10-28',"int"),
(0,"2526","n5",2,2,8276752,"e","w",0,"1",'2025-10-28',"int"),
(0,"2526","n5",2,3,8485059,"e","z",0,"1",'2025-10-28',"int"),
(0,"2526","n5",2,4,8617367,"e","w",0,"0",'2025-10-28',"int"),
(0,"2526","n5",2,5,7519930,"e","z",0,"½",'2025-10-28',"int"),
(0,"2526","n5",2,6,7321534,"e","w",0,"0",'2025-10-28',"int"),
(0,"2526","n5",3,1,7399469,"e","w",0,"0",'2025-11-18',"int"),
(0,"2526","n5",3,2,8276752,"e","z",0,"1",'2025-11-18',"int"),
(0,"2526","n5",3,3,7101193,"e","w",0,"0",'2025-11-18',"int"),
(0,"2526","n5",3,4,8485059,"e","z",0,"1",'2025-11-18',"int"),
(0,"2526","n5",3,5,7519930,"e","w",0,"1",'2025-11-18',"int"),
(0,"2526","n5",3,6,7321534,"e","z",0,"1",'2025-11-18',"int"),
(0,"2526","n5",4,1,7399469,"e","z",0,"1",'2025-12-09',"int"),
(0,"2526","n5",4,2,8276752,"e","w",0,"½",'2025-12-09',"int"),
(0,"2526","n5",4,3,8485059,"e","z",0,"0",'2025-12-09',"int"),
(0,"2526","n5",4,4,7101193,"e","w",0,"1",'2025-12-09',"int"),
(0,"2526","n5",4,5,7519930,"e","z",0,"1",'2025-12-09',"int"),
(0,"2526","n5",4,6,7321534,"e","w",0,"1",'2025-12-09',"int"),
(0,"2526","n5",5,1,7399469,"e","z",0,"0",'2026-02-03',"int"),
(0,"2526","n5",5,2,8276752,"e","w",0,"0",'2026-02-03',"int"),
(0,"2526","n5",5,3,8485059,"e","z",0,"0",'2026-02-03',"int"),
(0,"2526","n5",5,4,7101193,"e","w",0,"0",'2026-02-03',"int"),
(0,"2526","n5",5,5,7519930,"e","z",0,"0",'2026-02-03',"int"),
(0,"2526","n5",5,6,7321534,"e","w",0,"½",'2026-02-03',"int");

-- Waagtoren nv1 TODO
set @seizoen = "2526";
set @team = "nv1";
set @ronde = 5;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0,"2526","nv1",1,1,8243312,"e","w",0,"1",'2025-11-14',"int"),
(0,"2526","nv1",1,2,9077651,"e","z",0,"1",'2025-11-14',"int"),
(0,"2526","nv1",1,3,9023234,"e","w",0,"1",'2025-11-14',"int"),
(0,"2526","nv1",1,4,8950876,"e","z",0,"1",'2025-11-14',"int"),
(0,"2526","nv1",2,1,7321534,"e","w",0,"0",'2025-11-28',"int"),
(0,"2526","nv1",2,2,9077651,"e","z",0,"1",'2025-11-28',"int"),
(0,"2526","nv1",2,3,7582102,"e","w",0,"1",'2025-11-28',"int"),
(0,"2526","nv1",2,4,8950876,"e","z",0,"1",'2025-11-28',"int"),
(0,"2526","nv1",3,1,7518203,"e","z",0,"0",'2026-01-13',"int"),
(0,"2526","nv1",3,2,9077651,"e","w",0,"0",'2026-01-13',"int"),
(0,"2526","nv1",3,3,9023234,"e","z",0,"0",'2026-01-13',"int"),
(0,"2526","nv1",3,4,8950876,"e","w",0,"1",'2026-01-13',"int"),
(0,"2526","nv1",4,1,7518203,"e","z",0,"0",'2026-02-10',"int"),
(0,"2526","nv1",4,2,9077651,"e","w",0,"1",'2026-02-10',"int"),
(0,"2526","nv1",4,3,9023234,"e","z",0,"1",'2026-02-10',"int"),
(0,"2526","nv1",4,4,8950876,"e","w",0,"0",'2026-02-10',"int"),
(0,"2526","nv1",5,1,7518203,"e","w",0,"½",'2026-03-09',"int"),
(0,"2526","nv1",5,2,9077651,"e","z",0,"1",'2026-03-09',"int"),
(0,"2526","nv1",5,3,9023234,"e","w",0,"1",'2026-03-09',"int"),
(0,"2526","nv1",5,4,8950876,"e","z",0,"0",'2026-03-09',"int");