use waagtoren; -- ga naar TODO

-- TODO issue #37 afwezig en externe wedstrijd op dinsdag

-- aantal interne uitslagen per speler per seizoen
select naam, u.knsbNummer, count(*) uitslagen
from uitslag u join persoon p on u.knsbNummer = p.knsbNummer 
where seizoen = @seizoen and teamCode = "int"
group by u.knsbNummer
order by uitslagen desc;
set @seizoen = '1819'; -- TODO Han Rauws en Bob de Mon 26
set @seizoen = '1920'; -- TODO 19, 18, 17, 16, 15, 13, 10, 8, 1
set @seizoen = '2122'; -- TODO 24, 23, 22, 21, 20
set @seizoen = '2223'; -- TODO 32, 31, 30, 29
set @seizoen = '2324';
set @seizoen = '2324';
set @seizoen = '2425';


with 
  e as (select * from uitslag where anderTeam = "int" and partij = "e")
select p.naam, u.teamCode, u.rondeNummer, u.partij, e.* from uitslag u
join persoon p on u.knsbNummer = p.knsbNummer
join e on u.seizoen = e.seizoen and u.knsbNummer = e.knsbNummer and u.datum = e.datum
where u.seizoen = @seizoen and u.teamCode = "int" and u.partij = "a";

with
  e as (select * from uitslag where anderTeam = "int" and partij = "e")
update uitslag u
join e on u.seizoen = e.seizoen and u.knsbNummer = e.knsbNummer and u.datum = e.datum
set u.partij = "e"
where u.seizoen = @seizoen and u.teamCode = "int" and u.partij = "a";

-- externe partijen op andere datums dan de wedstrijd
select p.naam, r.uithuis, r.tegenstander, r.datum, u.* from uitslag u
join ronde r on r.seizoen = u.seizoen and r.teamCode = u.teamCode and u.rondeNummer = r.rondeNummer
join persoon p on p.knsbNummer = u.knsbNummer
where u.teamCode <> u.anderTeam and u.datum <> r.datum; 

select * from uitslag where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 
select * from ronde where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 
update uitslag set datum = '2022-04-26' where seizoen = "2122" and teamCode = "n2" and rondeNummer = 3; 

-- externe partijen zonder uitslag
select p.naam, u.* from uitslag u
join persoon p on u.knsbNummer = p.knsbNummer
where seizoen = @seizoen and partij = "e" and resultaat not in ("1", "½", "0") order by seizoen, datum;

delete from uitslag
where seizoen = @seizoen and partij = "e" and resultaat not in ("1", "½", "0") order by seizoen, datum;

-- issue #46 hack
insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2324", "int", 34, "t", "", '2024-06-30');

delete from ronde where clubCode = 0 and seizoen = "2324" and teamCode = "int" and rondeNummer = 34; 

-- aantal rating leden per maand 
select maand, jaar, count(*) leden from rating group by maand, jaar;

-- TODO wijzig datum externe wedstrijd
set @seizoen = '2324';
set @team = 'int';
set @ronde = 32;
set @datum = '2024-02-20';

select * from ronde where seizoen = @seizoen and teamCode = @team;
select * from uitslag where seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;

update ronde set datum = @datum where seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde;
update uitslag set partij = "p", datum = @datum where seizoen = @seizoen and teamCode = @team and rondeNummer = @ronde; 

-- TODO partij wijzigen
set @seizoen = '2425';
set @team = 'int';
set @competitie = 'int';
set @ronde = 33;
set @bord = 19;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and bordNummer = @bord;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = "e";

set @wit = 7321534; -- Ronald Kamps
set @zwart = 9001586; -- Abdul Rashid

set @oneven = 6212404; -- Peter
set @afwezig = 9001586; -- Abdul Rashid
set @extern = 7758014; -- Alex

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = @club and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and partij = 'i' order by bordNummer, witZwart;

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = @club and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in (@wit, @zwart, @oneven, @afwezig);

select naam, u.* from uitslag u join persoon p on p.knsbNummer = u.knsbNummer
where clubCode = @club and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and u.knsbNummer in (@wit, @zwart, @afwezig);

-- TODO afwezig maken

update uitslag set bordNummer = 0, partij = 'a', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where clubCode = @club and seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @afwezig;

-- TODO oneven maken

update uitslag set bordNummer = 0, partij = 'o', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @oneven;

-- TODO extern maken

update uitslag set bordNummer = 0, partij = 'e', witZwart = '', tegenstanderNummer = 0, resultaat = ''
where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde and knsbNummer = @extern;

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

-- TODO teams offline
select * from team where clubCode = 0 and seizoen = "2425";
delete from team where clubCode = 0 and seizoen = "2425";

insert into team (clubCode, seizoen, teamCode, reglement, bond, poule, omschrijving, borden, teamleider) values
(0, "2425", "",    0,  "",  "",   "geen",               0, 0),
(0, "2425", "int", 3,  "i", "nt", "interne competitie", 0, 0),
(0, "2425", "ira", 4,  "i", "ra", "rapid competitie", 0, 0);

-- teams
insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
("2425", "ije", "i", "je", "jeugd competitie", 0, 0),
("2425", "ijv", "i", "jv", "jeugd voorjaarscompetitie", 0, 0); 

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
("2425", "", "", "", "geen", 0, 0),
("2425", "0", "k", "", "KNSB bij andere schaakvereniging", 0, 0),
("2425", "n0", "n", "", "NHSB bij andere schaakvereniging", 0, 0),
("2425", "1", "k", "m", "KNSB meester", 10, 0),
("2425", "2", "k", "3c", "KNSB 3c", 8, 0),
("2425", "3", "k", "4c", "KNSB 4c", 8, 0),
("2425", "4", "k", "6e", "KNSB 6e", 8, 0),
("2425", "5", "k", "6e", "KNSB 6e", 8, 0),
("2425", "kbe", "k", "be", "KNSB beker", 4, 0),
("2425", "int", "i", "nt", "interne competitie", 0, 0),
("2425", "ira", "i", "ra", "rapid competitie", 0, 0),
("2425", "n1", "n", "t", "NHSB top", 8, 0),
("2425", "n2", "n", "1a", "NHSB 1a", 8, 0),
("2425", "n3", "n", "2a", "NHSB 2a", 6, 0),
("2425", "n4", "n", "3a", "NHSB 3a", 8, 0),
("2425", "nv1", "n", "vc", "NHSB vc", 4, 0),
("2425", "nv2", "n", "vb", "NHSB vb", 4, 0);

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden, teamleider) values
("2425", "nbe", "n", "be", "NHSB beker", 4, 0),
("2425", "nbz", "n", "bz", "NHSB beker (zilver)", 4, 0),
("2425", "nbb", "n", "bb", "NHSB beker (brons)", 4, 0);

-- teamleiders 2023-2024
select naam, team.* from team join persoon on knsbNummer = teamleider where seizoen = "2425";
update team set teamleider = 6214153 where seizoen = "2425" and teamCode = "1"; -- Jan Poland
update team set teamleider = 7129991 where seizoen = "2425" and teamCode = "2"; -- Gerard de Geus
update team set teamleider = 7758014 where seizoen = "2425" and teamCode = "3"; -- Alex Albrecht
update team set teamleider = 6212404 where seizoen = "2425" and teamCode = "4"; -- Peter van Diepen
update team set teamleider = 7321534 where seizoen = "2425" and teamCode = "5"; -- Ronald Kamps
update team set teamleider = 6214153 where seizoen = "2425" and teamCode = "kbe"; -- Jan Poland
update team set teamleider = 7428960 where seizoen = "2425" and teamCode = "nbe"; -- Frank Agter
update team set teamleider = 7529522 where seizoen = "2425" and teamCode = "nbz"; -- Willem Meyles
update team set teamleider = 6212404 where seizoen = "2425" and teamCode = "nbb"; -- Peter van Diepen
update team set teamleider = 7428960 where seizoen = "2425" and teamCode = "n1"; -- Frank Agter
update team set teamleider = 7529522 where seizoen = "2425" and teamCode = "n2"; -- Willem Meyles
update team set teamleider = 6214153 where seizoen = "2425" and teamCode = "n3"; -- Jan Poland
update team set teamleider = 6212404 where seizoen = "2425" and teamCode = "n4"; -- Peter van Diepen
update team set teamleider = 7321534 where seizoen = "2425" and teamCode = "nv1"; -- Ronald Kamps
update team set teamleider = 8950876 where seizoen = "2425" and teamCode = "nv2"; -- Jos Albers

-- TODO ronde offline
select * from ronde where clubCode = 0 and seizoen = "2425";
delete from ronde where clubCode = 0 and seizoen = "2425";

insert into ronde (clubCode, seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
(0, "2425", "int", 1, "t", "", '2024-09-10'), -- interne competitie
(0, "2425", "int", 2, "t", "", '2024-09-17'),
(0, "2425", "int", 3, "t", "", '2024-09-24'),
(0, "2425", "int", 4, "t", "", '2024-10-01'),
(0, "2425", "int", 5, "t", "", '2024-10-15'),
(0, "2425", "int", 6, "t", "", '2024-10-22'),
(0, "2425", "int", 7, "t", "", '2024-11-05'),
(0, "2425", "int", 8, "t", "", '2024-11-12'),
(0, "2425", "int", 9, "t", "", '2024-11-19'),
(0, "2425", "int", 10, "t", "", '2024-11-26'),
(0, "2425", "int", 11, "t", "", '2024-12-03'),
(0, "2425", "int", 12, "t", "", '2024-12-10'),
(0, "2425", "int", 13, "t", "", '2024-12-17'),
(0, "2425", "int", 14, "t", "", '2025-01-07'),
(0, "2425", "int", 15, "t", "", '2025-01-14'),
(0, "2425", "int", 16, "t", "", '2025-01-21'),
(0, "2425", "int", 17, "t", "", '2025-02-04'),
(0, "2425", "int", 18, "t", "", '2025-02-11'),
(0, "2425", "int", 19, "t", "", '2025-02-25'),
(0, "2425", "int", 20, "t", "", '2025-03-04'),
(0, "2425", "int", 21, "t", "", '2025-03-11'),
(0, "2425", "int", 22, "t", "", '2025-03-18'),
(0, "2425", "int", 23, "t", "", '2025-03-25'),
(0, "2425", "int", 24, "t", "", '2025-04-01'),
(0, "2425", "int", 25, "t", "", '2025-04-08'),
(0, "2425", "int", 26, "t", "", '2025-04-15'),
(0, "2425", "int", 27, "t", "", '2025-04-22'),
(0, "2425", "int", 28, "t", "", '2025-05-06'),
(0, "2425", "int", 29, "t", "", '2025-05-13'),
(0, "2425", "int", 30, "t", "", '2025-05-20'),
(0, "2425", "int", 31, "t", "", '2025-05-27'),
(0, "2425", "int", 32, "t", "", '2025-06-03'),
(0, "2425", "int", 33, "t", "", '2025-06-10'),
(0, "2425", "ira", 1, "t", "", '2024-10-29'), -- rapid competitie
(0, "2425", "ira", 2, "t", "", '2024-10-29'),
(0, "2425", "ira", 3, "t", "", '2024-10-29'),
(0, "2425", "ira", 4, "t", "", '2024-10-29'),
(0, "2425", "ira", 5, "t", "", '2025-02-18'),
(0, "2425", "ira", 6, "t", "", '2025-02-18'),
(0, "2425", "ira", 7, "t", "", '2025-02-18'),
(0, "2425", "ira", 8, "t", "", '2025-02-18'),
(0, "2425", "ira", 9, "t", "", '2025-04-29'),
(0, "2425", "ira", 10, "t", "", '2025-04-29'),
(0, "2425", "ira", 11, "t", "", '2025-04-29'),
(0, "2425", "ira", 12, "t", "", '2025-04-29');
