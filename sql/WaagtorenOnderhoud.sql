use waagtoren;

insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
("2324", "ije", 13, "t", "", '2024-04-01');


select p.naam, r.*, u.* from uitslag u
join ronde r on r.seizoen = u.seizoen and r.teamCode = u.teamCode and u.rondeNummer = r.rondeNummer
join persoon p on p.knsbNummer = u.knsbNummer
where u.teamCode <> u.anderTeam and u.datum <> r.datum; 

set @seizoen = "1920"; -- 20, 19, 18, 17, 16, 15, 13, 10, 8 en 1
set @seizoen = "2021"; -- 17
set @seizoen = "2122"; -- 25, 24, 23, 22, 21 en 20
set @seizoen = "2223"; -- 33, 32, 31, 30 en 29
set @seizoen = "2324"; -- 33

select * from uitslag where seizoen = @seizoen and teamCode = "int" and knsbNummer = 7099620;

insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
("2223", "int", 7, 0, 7099950, "e", "", 0, "", '2022-10-25', "int"),
("2223", "int", 16, 0, 7099950, "e", "", 0, "", '2023-01-10', "int"),
("2223", "int", 21, 0, 7099950, "e", "", 0, "", '2023-02-21', "int"),
-- ("2223", "int", 25, 0, 7129991, "e", "", 0, "", '2023-03-28', "int"),
("2223", "int", 27, 0, 7099950, "e", "", 0, "", '2023-04-11', "int");

delete from uitslag where seizoen = @seizoen and teamCode = "int" and knsbNummer = 7970094;

-- aantal interne uitslagen per speler per seizoen 
select naam, u.knsbNummer, count(*) uitslagen
from uitslag u join persoon p on u.knsbNummer = p.knsbNummer 
where seizoen = @seizoen and teamCode = "int"
group by u.knsbNummer
order by uitslagen desc;

select * from team where seizoen = "2324"; -- and teamCode = "nbb";
select * from ronde where seizoen = "2324" and teamCode = "nbb";