use waagtoren;

set @seizoen = '2324';
set @competitie = 'int';
set @ronde = 22;

select * from uitslag where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde; 
delete from ronde where seizoen = @seizoen and teamCode = @competitie and rondeNummer = @ronde; 


set @bord = 14;

set @wit = 126;
set @zwart = 9065100;

select * from gebruiker where knsbNummer = @wit;
select * from gebruiker where knsbNummer = @zwart;

select * from mutatie where knsbNummer = @wit;
select * from mutatie where knsbNummer = @zwart;

select * from persoon where knsbNummer = @wit;
select * from persoon where knsbNummer = @zwart;

select * from ranglijst;

select * from rating where knsbNummer = @zwart;

select * from speler where knsbNummer = @wit;
select * from speler where knsbNummer = @zwart;

select * from uitslag where knsbNummer = @wit;
select * from uitslag where knsbNummer = @zwart;

show tables;


update speler set intern2 = "ira" where seizoen = "2324" and knsbNummer = 7699010;

select * from ronde where seizoen = "2324" and teamCode = "nv2" and rondeNummer = 5;
update ronde set datum = '2024-03-08' where seizoen = "2324" and teamCode = "nv2" and rondeNummer = 5;


select * from uitslag where seizoen = "2324" and teamCode = "nv2" and rondeNummer = 5;
update uitslag set datum = '2024-03-08' where seizoen = "2324" and teamCode = "nv2" and rondeNummer = 5;


insert into ronde (seizoen, teamCode, rondeNummer, uithuis, tegenstander, datum) values
("2324", "ije", 13, "t", "", '2024-04-01');


select p.naam, r.*, u.* from uitslag u
join ronde r on r.seizoen = u.seizoen and r.teamCode = u.teamCode and u.rondeNummer = r.rondeNummer
join persoon p on p.knsbNummer = u.knsbNummer
where u.teamCode <> u.competitie and u.datum <> r.datum;

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



select * from team where seizoen = "2324"; -- and teamCode = "nbb";
select * from ronde where seizoen = "2324" and teamCode = "nbb";