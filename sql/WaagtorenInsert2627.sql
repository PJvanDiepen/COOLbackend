use waagtoren; -- ga naar SQL of TODO
set @seizoen = "2627";
set @team = "n1";

-- @team.csv
select * from team where seizoen = @seizoen;
select * from ronde where seizoen = @seizoen and teamCode = @team order by rondeNummer;
select * from uitslag where seizoen = @seizoen and teamCode = @team order by rondeNummer, bordNummer;

-- actieve gebruikers
select distinct m.knsbNummer, naam from mutatie m join persoon p on p.knsbNummer = m.knsbNummer order by naam;   

-- aantal interne uitslagen per speler per seizoen
select naam, u.knsbNummer, count(*) uitslagen
from uitslag u join persoon p on u.knsbNummer = p.knsbNummer 
where clubCode = 0 and seizoen = @seizoen and teamCode = "int"
group by u.knsbNummer
order by uitslagen desc;

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
set @seizoen = "2627";
set @team = "n1";
set @ronde = 1;
set @datum = '2025-10-10';

select * from ronde where clubCode = 0 and seizoen = @seizoen and teamCode = @team;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

update ronde set datum = @datum 
where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
update uitslag set partij = "p", datum = @datum 
where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde; 

-- TODO wijzig datum externe NHSB wedstrijd en wissel ronden
set @seizoen = "2627";
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

-- teams -------------------------------------------------------------------------------------------------------------------------------

set @seizoen = "2627";
select * from team where clubCode = 0 and seizoen = @seizoen;

insert into team (clubCode, seizoen, teamCode, reglement, maand, jaar, bond, poule, omschrijving, borden, teamleider) values
(0, "2627", "", 0, 0, 0, "", "", "geen", 0, 0),
(0, "2627", "0", 0, 0, 0, "k", "", "KNSB bij andere schaakvereniging", 0, 0),
(0, "2627", "1", 0, 0, 0, "k", "2a","KNSB 2A",8,0),
(0, "2627", "2", 0, 0, 0, "k", "4d","KNSB 4D",8,0),
(0, "2627", "3", 0, 0, 0, "k", "4e","KNSB 4E",8,0),
(0, "2627", "4", 0, 0, 0, "k", "5e","KNSB 5E",8,0),
(0, "2627", "5", 0, 0, 0, "k", "6f","KNSB 6F",8,0),
(0, "2627", "int", 3, 0, 0, "i", "nt", "interne competitie", 0, 0);

-- TODO compleet maken
insert into team (clubCode, seizoen, teamCode, reglement, maand, jaar, bond, poule, omschrijving, borden, teamleider) values
(0, "2627", "n1", 0, 0, 0, "n", "t", "NHSB Top", 8, 0),
(0, "2627", "n2", 0, 0, 0, "n", "1a", "NHSB 1A", 6, 0),
(0, "2627", "n3", 0, 0, 0, "n", "2a", "NHSB 2A", 6, 0),
(0, "2627", "n4", 0, 0, 0, "n", "2b", "NHSB 2B", 6, 0),
(0, "2627", "n5", 0, 0, 0, "n", "2a", "NHSB 2A", 6, 0);
-- (0, "2627", "nbb", 0, 0, 0, "n", "b", "Brons", 4, 0),
-- (0, "2627", "nbe", 0, 0, 0, "n", "b", "Goud", 4, 0),
-- (0, "2627", "nbz", 0, 0, 0, "n", "b", "Zilver", 4, 0),
-- (0, "2627", "nv1", 0, 0, 0, "n", "vf", "NHSB VF",4,0);

select * from team where clubCode = 0 and seizoen = "2627"and teamCode ="n2";
update team set borden = 6 where clubCode = 0 and seizoen = "2627"and teamCode ="n2";

-- ronden -------------------------------------------------------------------------------------------------------------------------------

set @seizoen = "2627";
select * from ronde where clubCode = 0 and seizoen = @seizoen;

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0,"2627",1,1,"t","Philidor 1847 1",'2026-09-19'),
(0,"2627",1,2,"u","MSV 1",'2026-10-03'),
(0,"2627",1,3,"t","De Wijker Toren 1",'2026-10-31'),
(0,"2627",1,4,"u","SG Max Euwe 1",'2026-11-21'),
(0,"2627",1,5,"t","SG Max Euwe 2",'2026-12-12'),
(0,"2627",1,6,"u","Caissa-Eenhoorn 2",'2027-01-09'),
(0,"2627",1,7,"u","Groninger Combinatie 3",'2027-03-13'),
(0,"2627",1,8,"t","HWP Haarlem 2",'2027-04-03'),
(0,"2627",1,9,"u","Staunton Groningen 1",'2027-04-17'),
(0,"2627",2,1,"t","VAS 3",'2026-09-19'),
(0,"2627",2,2,"u","HHW Pietbulls 1",'2026-10-03'),
(0,"2627",2,3,"t","Het Spaarne 1",'2026-10-31'),
(0,"2627",2,4,"u","BSG 2",'2026-11-21'),
(0,"2627",2,5,"t","De Volewijckers 1",'2026-12-12'),
(0,"2627",2,6,"u","De Wijker Toren 2",'2027-01-09'),
(0,"2627",2,7,"u","De Queer Schaakclub 1",'2027-03-13'),
(0,"2627",2,8,"t","Aartswoud 1",'2027-04-03'),
(0,"2627",2,9,"u","Paul Keres 7",'2027-04-17'),
(0,"2627",3,1,"t","Oegstgeest '80 1",'2026-09-19'),
(0,"2627",3,2,"u","EsPion 1",'2026-10-03'),
(0,"2627",3,3,"t","DSC Delft 3",'2026-10-31'),
(0,"2627",3,4,"u","t Saense Paard 1",'2026-11-21'),
(0,"2627",3,5,"t","Caissa 3",'2026-12-12'),
(0,"2627",3,6,"u","Messemaker 1847 1",'2027-01-09'),
(0,"2627",3,7,"u","Zuidoost United 1",'2027-03-13'),
(0,"2627",3,8,"t","De Rode Loper 1",'2027-04-03'),
(0,"2627",3,9,"u","Philidor Leiden 3",'2027-04-17'),
(0,"2627",4,1,"u","VAS 4",'2026-10-03'),
(0,"2627",4,2,"t","Amsterdam West 2",'2026-10-31'),
(0,"2627",4,3,"u","'t Saense Paard 2",'2026-11-21'),
(0,"2627",4,4,"t","Caissa 4",'2026-12-12'),
(0,"2627",4,5,"u","Santpoort 2",'2027-01-09'),
(0,"2627",4,6,"u","HWP Haarlem 4",'2027-03-13'),
(0,"2627",4,7,"t","Zwart op Wit 1",'2027-04-03'),
(0,"2627",5,1,"u","Assendelft 1",'2026-10-03'),
(0,"2627",5,2,"t","HHW Pietbulls 2",'2026-10-31'),
(0,"2627",5,3,"u","'t Saense Paard 3",'2026-11-21'),
(0,"2627",5,4,"t","De Volewijckers 2",'2026-12-12'),
(0,"2627",5,5,"u","Castricum 1",'2027-01-09'),
(0,"2627",5,6,"u","Aartswoud 2",'2027-03-13'),
(0,"2627",5,7,"t","Bergen/Schaakmat 2",'2027-04-03'),
(0, "2627", "int", 1, "t", "", '2026-08-25'),
(0, "2627", "int", 2, "t", "", '2026-09-01'),
(0, "2627", "int", 3, "t", "", '2026-09-08'),
(0, "2627", "int", 4, "t", "", '2026-09-15'),
(0, "2627", "int", 5, "t", "", '2026-09-22'),
(0, "2627", "int", 6, "t", "", '2026-09-29'), -- Chess 960
(0, "2627", "int", 7, "t", "", '2026-10-06'),
(0, "2627", "int", 8, "t", "", '2026-10-20'),
(0, "2627", "int", 9, "t", "", '2026-10-27'),
(0, "2627", "int", 10, "t", "", '2026-11-03'),
(0, "2627", "int", 11, "t", "", '2026-11-10'),
(0, "2627", "int", 12, "t", "", '2026-11-17'),
(0, "2627", "int", 13, "t", "", '2026-11-24'),
(0, "2627", "int", 14, "t", "", '2026-12-01'),
(0, "2627", "int", 15, "t", "", '2026-12-08'),
(0, "2627", "int", 16, "t", "", '2026-12-15'),
(0, "2627", "int", 17, "t", "", '2027-01-05'),
(0, "2627", "int", 18, "t", "", '2027-01-12'),
(0, "2627", "int", 19, "t", "", '2027-01-19'),
(0, "2627", "int", 20, "t", "", '2027-01-26'),
(0, "2627", "int", 21, "t", "", '2027-02-02'),
(0, "2627", "int", 22, "t", "", '2027-02-09'),
(0, "2627", "int", 23, "t", "", '2027-02-16'),
(0, "2627", "int", 24, "t", "", '2027-03-02'),
(0, "2627", "int", 25, "t", "", '2027-03-09'),
(0, "2627", "int", 26, "t", "", '2027-03-16'),
(0, "2627", "int", 27, "t", "", '2027-03-23'),
(0, "2627", "int", 28, "t", "", '2027-03-30'),
(0, "2627", "int", 29, "t", "", '2027-04-06'),
(0, "2627", "int", 30, "t", "", '2027-04-13'),
(0, "2627", "int", 31, "t", "", '2027-05-11'),
(0, "2627", "int", 32, "t", "", '2027-05-18'),
(0, "2627", "int", 33, "t", "", '2027-05-25');

-- TODO compleet maken

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
(0,"2627","n1",1,"u","Opening 64 N1",'2026-09-25'),
(0,"2627","n1",2,"t","Santpoort N1",'2026-10-06'),
(0,"2627","n1",3,"u","Chess Society Zandvoort N1",'2026-11-13'),
(0,"2627","n1",4,"t","HWP Haarlem N1",'2026-12-01'),
(0,"2627","n1",5,"u","Aartswoud N1",'2027-01-08'),
(0,"2627","n1",6,"t","Caïssa-Eenhoorn N1",'2027-02-02'),
(0,"2627","n1",7,"t","Wijker Toren N1",'2027-03-16'),
(0,"2627","n1",8,"u","Bloemendaal N1",'2027-04-07'),
(0,"2627","n1",9,"t","'t Saense Paard N1",'2027-04-20'),
(0,"2627","n2",1,"t","Aris de Heer N1",'2026-09-22'),
(0,"2627","n2",2,"u","Krommenie N1",'2026-10-06'),
(0,"2627","n2",3,"t","Schaakmat N1",'2026-11-10'),
(0,"2627","n2",4,"u","Noordk. Comb. Magnus N1",'2026-12-04'),
(0,"2627","n2",5,"u","Purmerend N1",'2027-02-04'),
(0,"2627","n2",6,"t","En Passant N1",'2027-03-20'),
(0,"2627","n2",7,"u","Volendam N1",'2027-04-08');

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0,"2627","n3",1,"u","HHW Pietbulls N1",'2026-10-08'),
(0,"2627","n3",2,"t","Opening 64 N2",'2026-10-27'),
(0,"2627","n3",3,"u","De Waagtoren N5",'2026-11-17'),
(0,"2627","n3",4,"t","Bergen N1",'2026-12-08'),
(0,"2627","n3",5,"u","Koedijk N1",'2027-02-09'),
(0,"2627","n3",6,"t","Aartswoud N3",'2027-03-09'),
(0,"2627","n3",7,"u","Oppositie N1",'2027-04-13'),
(0,"2627","n4",1,"t","Aartswoud N2",'2026-10-20'),
(0,"2627","n4",2,"u","Krommenie N2",'2026-10-27'),
(0,"2627","n4",3,"t","Castricum N2",'2026-11-17'),
(0,"2627","n4",4,"u","'t Saense Paard N3",'2026-12-11'),
(0,"2627","n4",5,"u","KTV N1",'2027-02-12'),
(0,"2627","n4",6,"t","Warmenhuizen'76 N1",'2027-03-09'),
(0,"2627","n4",7,"u","Caïssa-Eenhoorn N2",'2027-04-20'),
(0,"2627","n5",1,"t","Aartswoud N3",'2026-10-06'),
(0,"2627","n5",2,"u","Oppositie N1",'2026-10-27'),
(0,"2627","n5",3,"t","De Waagtoren N3",'2026-11-17'),
(0,"2627","n5",4,"u","Opening 64 N2",'2026-12-11'),
(0,"2627","n5",5,"u","HHW Pietbulls N1",'2027-02-11'),
(0,"2627","n5",6,"t","Bergen N1",'2027-03-09'),
(0,"2627","n5",7,"u","Koedijk N1",'2027-04-13');

-- spelers -------------------------------------------------------------------------------------------------------------------------------

-- TODO insert local

-- interne competitie -------------------------------------------------------------------------------------------------------------------------------

-- ronde 1 TODO
set @seizoen = "2627";
set @team = "int";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

-- Waagtoren KNSB beker
set @seizoen = "2627";
set @team = "kbe";
set @ronde = 4;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, competitie) values
(0, "2526", "kbe", 2, 1, 7657342, "e", "w", 0, "1", '2025-12-14', "int"),
(0, "2526", "kbe", 2, 2, 7970094, "e", "z", 0, "1", '2025-12-14', "int"),
(0, "2526", "kbe", 2, 3, 8795941, "e", "w", 0, "1", '2025-12-14', "int"),
(0, "2526", "kbe", 2, 4, 8285574, "e", "z", 0, "½", '2025-12-14', "int"),
(0, "2526", "kbe", 3, 1, 7657342, "e", "z", 0, "1", '2026-02-08', "int"),
(0, "2526", "kbe", 3, 2, 7970094, "e", "w", 0, "1", '2026-02-08', "int"),
(0, "2526", "kbe", 3, 3, 8795941, "e", "z", 0, "0", '2026-02-08', "int"),
(0, "2526", "kbe", 3, 4, 7099950, "e", "w", 0, "0", '2026-02-08', "int"),
(0, "2526", "kbe", 4, 1, 7584566, "e", "z", 0, "0", '2026-03-17', "int"),
(0, "2526", "kbe", 4, 2, 7970094, "e", "w", 0, "½", '2026-03-17', "int"),
(0, "2526", "kbe", 4, 3, 7428960, "e", "z", 0, "0", '2026-03-17', "int"),
(0, "2526", "kbe", 4, 4, 8795941, "e", "w", 0, "1", '2026-03-17', "int");

-- Waagtoren 1 TODO
set @seizoen = "2627";
set @team = "1";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, resultaten, datum, competitie) values
(0,"2627","1",1,1,7657342,"e","z",0,"0","0",'2026-09-19',"int"),
(0,"2627","1",1,2,7926259,"e","w",0,"1","1",'2026-09-19',"int"),
(0,"2627","1",1,3,6938624,"e","z",0,"½","½",'2026-09-19',"int"),
(0,"2627","1",1,4,7584566,"e","w",0,"1","1",'2026-09-19',"int"),
(0,"2627","1",1,5,7428960,"e","z",0,"1","1",'2026-09-19',"int"),
(0,"2627","1",1,6,7970094,"e","w",0,"½","½",'2026-09-19',"int"),
(0,"2627","1",1,7,7828183,"e","z",0,"½","½",'2026-09-19',"int"),
(0,"2627","1",1,8,8096242,"e","w",0,"1","1",'2026-09-19',"int");

-- Waagtoren 2 TODO 
set @seizoen = "2627";
set @team = "2";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, resultaten, datum, competitie) values
(0,"2627","2",1,1,7099950,"e","z",0,"1","1",'2026-09-19',"int"),
(0,"2627","2",1,2,7613166,"e","w",0,"½","½",'2026-09-19',"int"),
(0,"2627","2",1,3,7707832,"e","z",0,"0","0",'2026-09-19',"int"),
(0,"2627","2",1,4,7665834,"e","w",0,"1","1",'2026-09-19',"int"),
(0,"2627","2",1,5,7509920,"e","z",0,"0","0",'2026-09-19',"int"),
(0,"2627","2",1,6,6335670,"e","w",0,"0","0",'2026-09-19',"int"),
(0,"2627","2",1,7,8702595,"e","z",0,"½","½",'2026-09-19',"int"),
(0,"2627","2",1,8,5968611,"e","w",0,"1","1",'2026-09-19',"int");

-- Waagtoren 3 TODO 
set @seizoen = "2627";
set @team = "3";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, resultaten, datum, competitie) values
(0,"2627","3",1,1,8484443,"e","z",0,"0","0",'2026-09-19',"int"),
(0,"2627","3",1,2,9056674,"e","w",0,"0","0",'2026-09-19',"int"),
(0,"2627","3",1,3,7758014,"e","z",0,"0","0",'2026-09-19',"int"),
(0,"2627","3",1,4,6572511,"e","w",0,"½","½",'2026-09-19',"int"),
(0,"2627","3",1,5,6207520,"e","z",0,"½","½",'2026-09-19',"int"),
(0,"2627","3",1,6,6420557,"e","w",0,"1","1",'2026-09-19',"int"),
(0,"2627","3",1,7,6930957,"e","z",0,"1","1",'2026-09-19',"int"),
(0,"2627","3",1,8,8400183,"e","w",0,"1","1",'2026-09-19',"int");

-- Waagtoren 4 TODO 
set @seizoen = "2627";
set @team = "4";
set @ronde = 7;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, resultaten, datum, competitie) values
();

-- Waagtoren 5 TODO 
set @seizoen = "2627";
set @team = "5";
set @ronde = 7;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, resultaten, datum, competitie) values
();

-- Waagtoren NHSB beker goud
set @seizoen = "2627";
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
set @seizoen = "2627";
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
set @seizoen = "2627";
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
set @seizoen = "2627";
set @team = "n1";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, resultaten, datum, competitie) values
(0,"2627","n1",1,1,8096242,"e","w",0,"0","0",'2026-09-25',"int"),
(0,"2627","n1",1,2,7099950,"e","z",0,"1","1",'2026-09-25',"int"),
(0,"2627","n1",1,3,7613166,"e","w",0,"½","½",'2026-09-25',"int"),
(0,"2627","n1",1,4,5968611,"e","z",0,"½","½",'2026-09-25',"int"),
(0,"2627","n1",1,5,7129991,"e","w",0,"1","1",'2026-09-25',"int"),
(0,"2627","n1",1,6,9056674,"e","z",0,"1","1",'2026-09-25',"int"),
(0,"2627","n1",1,7,8112654,"e","w",0,"½","½",'2026-09-25',"int"),
(0,"2627","n1",1,8,7529522,"e","z",0,"1","1",'2026-09-25',"int");

-- Waagtoren n2 TODO
set @team = "n2";
set @ronde = 1;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, resultaten, datum, competitie) values
( 0,"2627","n2",1,1,8587337,"e","z",0,"0","0",'2026-09-22',"int"),
( 0,"2627","n2",1,2,7758014,"e","w",0,"0","0",'2026-09-22',"int"),
( 0,"2627","n2",1,3,6207520,"e","z",0,"1","1",'2026-09-22',"int"),
( 0,"2627","n2",1,4,7282033,"e","w",0,"½","½",'2026-09-22',"int"),
( 0,"2627","n2",1,5,7824674,"e","z",0,"0","0",'2026-09-22',"int"),
( 0,"2627","n2",1,6,7535396,"e","w",0,"½","½",'2026-09-22',"int");

-- Waagtoren n3 TODO
set @team = "n3";
set @ronde = 7;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, resultaten, datum, competitie) values
();

-- Waagtoren n4 TODO
set @team = "n4";
set @ronde = 7;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, resultaten, datum, competitie) values
();

-- Waagtoren n5 TODO
set @team = "n5";
set @ronde = 7;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, resultaten, datum, competitie) values
();

-- Waagtoren nv1 TODO
set @seizoen = "2627";
set @team = "nv1";
set @ronde = 6;
select * from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
delete from uitslag where clubCode = 0 and seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

insert into uitslag (clubCode, seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, resultaten, datum, competitie) values
();

-- complete lijst van issues met eventueel SQL oplossingen ------------------------------------------------------------------------------------------------------------- 

set @speler = 6212404; -- Peter van Diepen	6212404

select * from gebruiker where mutatieRechten > 1;
update gebruiker set mutatieRechten = 2 where knsbNummer = @speler;

-- TODO issue #75 Mutatie vervangen door log
-- TODO issue #74 Gebruiker zonder mutatieRechten en speler met rol

set @speler = 7926259; -- Robert Ris
select * from gebruiker where knsbNummer = speler; 
insert into gebruiker (knsbNummer, mutatieRechten, uuidToken, email, datumEmail, telefoon, voorkeur) values
(@speler, 1, uuid(), "email", now(), "telefoon", "");

-- TODO issue #73 Overzicht voor bestuur overzichtelijker maken
-- TODO issue #72 0-0-0.nl versie 0.8.66 ---> Versie_0_8_67
-- TODO issue #71 Teamindeling in 0-0-0 maken
-- TODO issue #70 Jaarkalender in 0-0-0 maken
-- TODO issue #69 Nieuwe speler aanmelden werkt niet meer

select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer where s.clubCode = 0 and s.seizoen = "2627";
delete from speler where clubCode = 0 and seizoen = "2627"; -- and knsbNummer = 103; -- 6212404;

-- teamleiders
describe gebruiker;
select p.naam, g.* from gebruiker g join persoon p on g.knsbNummer = p.knsbNummer where mutatieRechten > 1 order by p.naam;

update gebruiker set mutatieRechten = 2 where knsbNummer in(6420557, 6565801); -- Jasper Seelemeijer, Ernst Hoogenes

-- speler toevoegen / verwijderen
set @speler = 7926259; -- Robert Ris
set @rating = 2441;
select * from persoon where knsbNummer = @speler;
select naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer where clubCode = 0 and s.knsbNummer = @speler;
delete from speler where clubCode = 0 and seizoen = "2627" and knsbNummer = @speler;

insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol) values
(0, "2627", "int", "", "", @speler, coalesce(@Rating, 0), '2026-09-01', coalesce(nullif(@rating, 0), 1200), "int", "", "", "", "", "");

-- rating bijwerken
update speler set knsbRating = @rating, interneRating = @rating where clubCode = 0 and seizoen = "2627" and knsbNummer = @speler;  

-- knsbTeam invullen
select p.naam, s.* from speler s join persoon p on p.knsbNummer = s.knsbNummer where s.clubCode = 0 and s.seizoen = "2627" and teamCode = "int" order by knsbTeam;

update speler set knsbTeam = "0" where clubCode = 0 and seizoen = "2627" and knsbNummer in(
7441346, -- Matthias van Zwet
8539135); -- Devran Gulave

select * from uitslag where clubCode = 0 and seizoen = "2627" and knsbNummer = 6335670;

delete from uitslag where clubCode = 0 and seizoen = "2627" and teamCode = "3" and knsbNummer = 6335670;

-- TODO opstellingen inlezen van Netstand
update speler set knsbTeam = "1" where clubCode = 0 and seizoen = "2627" and knsbNummer in(
7926259, -- Robert Ris
6938624, -- Manuel Bosboom
7584566, -- Yong Hoon de Rover
7657342, -- Frank van Tellingen
7970094, -- Danny de Ruiter
7428960, -- Frank Agter
8096242, -- Michaël van Liempt
7828183); -- Rob Konijn

update speler set knsbTeam = "" where clubCode = 0 and seizoen = "2627" and knsbNummer = 8587337; -- Max Hooijmans

update speler set knsbTeam = "2" where clubCode = 0 and seizoen = "2627" and knsbNummer in(
5968611, -- Nico Hauwert
7613166, -- Peter Kalisvaart
7509920, -- Dirk van der Meiden
7129991, -- Gerard de Geus
7099950, -- Jos Vlaming
7665834, -- David Baanstra
6335670, -- Hebert Perez Garcia
8702595); -- Johan Bakker

update speler set knsbTeam = "3" where clubCode = 0 and seizoen = "2627" and knsbNummer in(
9056674, -- Fabio Pasti
6572511, -- Bert Buitink
6207520, -- Henk van der Hauw
7758014, -- Alex Albrecht
6420557, -- Jasper Seelemeijer
7282033, -- Gerrit Lemmen
8484443, -- Chaim Bookelman
6930957); -- Leo van Steenoven

update speler set knsbTeam = "4" where clubCode = 0 and seizoen = "2627" and knsbNummer in(
7504310, -- Leonard Haakman
7269900, -- Jan Ens
7546506, -- Edward Schenkel
7904589, -- Wim Nieland
6951362, -- Johan Plooijer
7699010, -- Ruud Niewenhuis
8182416, -- André Bremmers
6212404); -- Peter van Diepen

update speler set knsbTeam = "5" where clubCode = 0 and seizoen = "2627" and knsbNummer in(
7519930, -- John Norder
8472530, -- Rosa Leek
8073978, -- Gerrit Peereboom
9023234, -- Albert Boekema
9077651, -- Lennart van der Kraan
8350738, -- Ramon Witte
9175353, -- Thomas Hubers
9176024); -- Amit Roy

-- TODO nhsbTeam invullen

update speler set nhsbTeam = "" where clubCode = 0 and seizoen = "2627" and knsbNummer = 7707832; -- Ronald Groot

update speler set nhsbTeam = "" where clubCode = 0 and seizoen = "2627" and knsbNummer = 7970094; -- Danny de Ruiter


update speler set nhsbTeam = "n1" where clubCode = 0 and seizoen = "2627" and knsbNummer in(
7970094, -- Danny de Ruiter
7428960, -- Frank Agter
8096242, -- Michaël van Liempt
5968611, -- Nico Hauwert
7129991, -- Gerard de Geus
7099950, -- Jos Vlaming
7529522, -- Willem Meyles
9056674); -- Fabio Pasti

update speler set nhsbTeam = "n2" where clubCode = 0 and seizoen = "2627" and knsbNummer in(
6207520, -- Henk van der Hauw
8587337, -- Max Hooijmans
7282033, -- Gerrit Lemmen
8484443, -- Chaim Bookelman
7758014, -- Alex Albrecht
7824674); -- Guido Florijn

update speler set nhsbTeam = "n3" where clubCode = 0 and seizoen = "2627" and knsbNummer in(
6930957, -- Leo van Steenoven
7468362, -- Paul Toepoel
6565801, -- Ernst Hoogenes
7731812, -- Alexander Versluis
7504310, -- Leonard Haakman
7546506); -- Edward Schenkel

update speler set nhsbTeam = "n4" where clubCode = 0 and seizoen = "2627" and knsbNummer in(
7386060, -- Jan Meringa
6214153, -- Jan Poland
7210137, -- Arjen Dibbets
8485059, -- Peter Duijs
7101193, -- Jacob Bleijendaal
6212404); -- Peter van Diepen

update speler set nhsbTeam = "n5" where clubCode = 0 and seizoen = "2627" and knsbNummer in(
8276752, -- Theo Bakker	8276752
7443172, -- Anton Schermer	7443172
8539135, -- Devran Gulave	8539135
7519930, -- John Norder	7519930
7321534, -- Ronald Kamps	7321534
9077651); -- Lennart van der Kraan	9077651

-- kopieer spelers van vorige seizoen met knsbRating van 1 augustus en zelfde rating voor interneRating of 1200
insert into speler (clubCode, seizoen, teamCode, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datum, interneRating, intern1, intern2, intern3, intern4, intern5, rol)
select s.clubCode, "2627", s.teamCode, "", "", s.knsbNummer, coalesce(r.knsbRating, 0), '2026-08-01', coalesce(nullif(r.knsbRating, 0), 1200), s.intern1, s.intern2, s.intern3, s.intern4, s.intern5, s.rol
from speler s left join rating r on r.knsbNummer = s.knsbNummer and r.jaar = 2026 and r.maand = 8
where s.clubCode = 0 and s.seizoen = "2526"; -- and s.knsbNummer = 6212404; -- 103;

use waagtoren;
select * from speler where clubCode = 0 and seizoen = "2627" and knsbNummer = 6212404;

-- bijwerken spelers dit seizoen met knsbRating van 1 september en zelfde rating voor interneRating of 1200
update speler s left join rating r on r.knsbNummer = s.knsbNummer and r.jaar = 2026 and r.maand = 9
set s.knsbRating = coalesce(r.knsbRating, 0), s.datum = '2026-09-01', s.interneRating = coalesce(nullif(r.knsbRating, 0), 1200)
where s.clubCode = 0 and s.seizoen = "2627"; -- and s.knsbNummer = 6212404; -- 103;

-- TODO issue #66 Meer partijen per ronde tegen dezelfde tegenstander 
set @ronde = 6;
set @bord = 5;
set @resultatenWitZwart = "00";
set @resultaatWit = "0";
set @resultatenZwartWit = "11";
set @resultaatZwart = "1";

update uitslag set resultaten = @resultatenWitZwart, resultaat = @resultaatWit
where clubCode = 0 and seizoen = "2627" and teamCode = "int" and rondeNummer = @ronde and bordNummer = @bord and witZwart = "w";
update uitslag set resultaten = @resultatenZwartWit, resultaat = @resultaatZwart
where clubCode = 0 and seizoen = "2627" and teamCode = "int" and rondeNummer = @ronde and bordNummer = @bord and witZwart = "z";

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = "2627" and teamCode = "int" and rondeNummer = @ronde and bordNummer = @bord order by witZwart;

-- TODO issue #65 Aanmelden voor competitie of toernooi
-- TODO issue #64 Van HTML op 0-0-0.nl naar MD op GitHub.com
-- TODO issue #63 speler met 1 teamCode in plaats van knsbTeam, nhsbTeam, intern1..5
-- TODO issue #62 Teamleider kan vaste speler of invaller aanmelden

-- wedstrijd uit agenda speler verwijderen
set @speler = 6212404; -- Peter van Diepen	6212404
set @team = "2";
set @ronde = 1;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer 
where clubCode = 0 and seizoen = "2627" and u.knsbNummer = @speler; -- and teamCode = @team;
delete from uitslag where clubCode = 0 and seizoen = "2627" and teamCode = @team and rondeNummer = @ronde and knsbNummer = @speler;

-- TODO issue #61 Signaleer gespeelde externe wedstrijden
-- TODO issue #60 ISO datum in plaats van Date
-- TODO issue #59 Meer mogelijkheden invaller voor viertal
-- TODO ISSUE #58 Uitslag verbeteren

set @seizoen = "2627";
set @team = 'int';
set @competitie = 'int';
set @ronde = 6;

-- TODO partij wijzigen
set @bord = 8;
set @wit   = 6951362; -- Johan Plooijer
set @zwart = 9077651; -- Lennart van der Kraan

set @bord = 14;
set @wit   = 9164639; -- Marnix Burgers
set @zwart = 7699010; -- Ruud Niewenhuis

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer 
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in(@wit, @zwart) order by witZwart;

update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'w', tegenstanderNummer = @zwart, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @wit;
update uitslag set bordNummer = @bord, partij = 'i', witZwart = 'z', tegenstanderNummer = @wit, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @zwart;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and bordNummer > 0 order by bordNummer, witZwart;

-- TODO afwezig maken
set @afwezig = 6951362; -- Johan Plooijer

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer = @afwezig;

update uitslag set bordNummer = 0, partij = 'a', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @afwezig;

-- TODO oneven maken
set @oneven = 8350738; -- Ramon Witte

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer = @oneven;

update uitslag set bordNummer = 0, partij = 'o', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @oneven;

-- TODO extern maken

update uitslag set bordNummer = 0, partij = 'e', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where clubCode = 0 and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @extern;

-- TODO issue #56 Dinsdag 19:00 indeling automatisch definitief maken
-- TODO issue #55 Automatisch uitslagen inlezen van KNSB en NHSB websites
-- TODO issue #54 Handmatige SQL vervangen door JavaScript
-- TODO issue #52 0-0-0 waarschuwt als team niet compleet is
-- TODO issue #50 In gelijke puntengroepen Zwitsers indelen
-- TODO issue #49 Objecten boom synchroniseren met server
-- TODO issue #48 Handmatig indelen werkt niet meer
-- TODO issue #47 Voorlopige indeling en dreiging oneven
-- TODO issue #46 Niets werkt na de laatste ronde van het seizoen
-- TODO issue #45 zyq.js verwijderen
-- TODO issue #44 KNSB rating kolom
-- TODO issue #43 Database documentatie is niet compleet
-- TODO issue #42 Indeling definitief maken gaat fout
-- TODO issue #40 Indelen gaat fout
-- TODO issue #38 CSS voor select
-- TODO issue #37 Afgezegd op dinsdagavond en externe wedstrijd op dezelfde avond

set @seizoen = "1819"; -- TODO Han Rauws en Bob de Mon 26
set @seizoen = "1920"; -- TODO 19, 18, 17, 16, 15, 13, 10, 8, 1
set @seizoen = "2122"; -- TODO 24, 23, 22, 21, 20
set @seizoen = "2223"; -- TODO 32, 31, 30, 29
set @seizoen = "2627";

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
