use waagtoren;

drop function rating;

delimiter $$
create function rating(seizoen char(4), knsbNummer int) 
returns int deterministic
begin
    declare knsbRating int;
    select s.knsbRating
    into knsbRating
    from speler s
    where s.seizoen = seizoen and s.knsbNummer = knsbNummer;
    return knsbRating;
end;
$$
delimiter ;

-- seizoenVersie, subgroep, waardeCijfer, punten en totalen bevatten de logica voor verschillende reglementen voor de interne competie van de Waagtoren
-- versie 1 is de oorspronkelijke versie van Alkmaar systeem (geen SQL code)
-- versie 2 afzeggingenAftrek in seizoen = 1819, 1920, 2021
-- versie 3 geen afzeggingenAftrek in seizoen = 2122, 2223, enz.
-- versie 4 rapid in seizoen = 21ra, 22ra, enz.

drop function seizoenVersie;

delimiter $$
create function seizoenVersie(seizoen char(4), versie int)
returns int deterministic
begin
    if versie <> 0 then
        return versie;
	elseif seizoen in ('1819', '1920', '2021') then 
        return 2;
	elseif seizoen in ('2122', '2223') then 
        return 3;
	elseif seizoen in ('21ra', '22ra') then -- rapid
        return 4;
	else 
        return -1;
	end if;
end;
$$
delimiter ;

drop function subgroep;

delimiter $$
create function subgroep(seizoen char(4), versie int, knsbNummer int)
returns char(1) deterministic
begin
    declare knsbRating int;
    set knsbRating = rating(seizoen, knsbNummer);
    if versie = 4 then -- geen subgroep bij rapid
        return ' ';
	elseif knsbRating < 1400 then
        return 'H';
	elseif knsbRating < 1500 then
        return 'G';
	elseif knsbRating < 1600 then
        return 'F';
    elseif knsbRating < 1700 then
        return 'E';
    elseif knsbRating < 1800 then
        return 'D';
    elseif knsbRating < 1900 then
        return 'C';
    elseif knsbRating < 2000 then
        return 'B';
    else
        return 'A';
    end if;
end;
$$
delimiter ;

drop function waardeCijfer;

delimiter $$
create function waardeCijfer(versie int, knsbRating int) 
returns int deterministic
begin
    if versie = 4 then -- geen waardeCijfer bij rapid
        return 0;
    elseif knsbRating < 1400 then
        return 5; -- H
	elseif knsbRating < 1500 then
        return 6; -- G
	elseif knsbRating < 1600 then
        return 7; -- F
    elseif knsbRating < 1700 then
        return 8; -- E
    elseif knsbRating < 1800 then
        return 9; -- D
    elseif knsbRating < 1900 then
        return 10; -- C
    elseif knsbRating < 2000 then
        return 11; -- B
    else
        return 12; -- A
    end if;
end;
$$
delimiter ;

drop function punten;

delimiter $$
create function punten(seizoen char(4), versie int, knsbNummer int, eigenWaardeCijfer int, teamCode char(3), partij char(1), tegenstander int, resultaat char(1))
    returns int deterministic -- reglement artikel 12
begin
    if versie = 4 then -- rapidPunten bij rapid
        return rapidPunten(partij, resultaat);
    elseif partij = 'i' and resultaat = '1' then
        return waardeCijfer(versie, rating(seizoen, tegenstander)) + 12;
    elseif partij = 'i' and resultaat = '½' then
        return waardeCijfer(versie, rating(seizoen, tegenstander));
    elseif partij = 'i' and resultaat = '0' then
        return waardeCijfer(versie, rating(seizoen, tegenstander)) - 12;
    elseif partij = 'a' then -- afwezig
        return eigenWaardeCijfer - 4;
    elseif partij = 'r' then -- reglementaire remise of vrijgesteld
        return eigenWaardeCijfer;
    elseif partij = 'o' then -- oneven
		return eigenWaardeCijfer + 12;
    elseif partij = 'w' then -- reglementaire winst
        return eigenWaardeCijfer + 12;
	elseif partij = 'v' then -- reglementair verlies
		return eigenWaardeCijfer - 12;
    elseif partij = 'e' and teamCode = 'int' then -- externe partij tijdens interne ronde
        return eigenWaardeCijfer;
	elseif partij = 'e' then -- elke externe partij
        return 4;
	else
		return 0;   
    end if;
end;
$$
delimiter ;

drop function rapidPunten;

delimiter $$
create function rapidPunten(partij char(1), resultaat char(1))
    returns int deterministic
begin
    if partij = 'i' and resultaat = '1' then
        return 30;
    elseif partij = 'i' and resultaat = '½' then
        return 15;
    elseif partij = 'i' and resultaat = '0' then
        return 0;
    elseif partij = 'o' then -- oneven
		return 30;
	else
		return 10; -- bye  
    end if;
end;
$$
delimiter ;

drop function totalen;

delimiter $$
create function totalen(seizoen char(4), versie int, knsbNummer int, totDatum date) returns varchar(600) deterministic
begin
    declare sorteer int default 0; -- 0
    declare prijs int default 1; -- 1
    declare winstIntern int default 0; -- 2
    declare winstExtern int default 0; -- 3
    declare knsbRating int; -- 4
    declare remiseIntern int default 0; -- 5
    declare verliesIntern int default 0; -- 6
    declare witIntern int default 0; -- 7
    declare zwartIntern int default 0; -- 8
    declare oneven int default 0; -- 9
	declare afzeggingen int default 0; -- 10
    declare aftrek int default 0; -- 11
    declare totaal int default 0; -- 12
    declare startPunten int default 0; -- 13
    declare eigenWaardeCijfer int; -- 14
	declare remiseExtern int default 0; -- 15
    declare verliesExtern int default 0; -- 16
    declare witExtern int default 0; -- 17
    declare zwartExtern int default 0; -- 18
   	declare rondenVerschil int default 0; -- 19
    declare tegenstanders varchar(500) default ''; -- 20
    declare reglementairGewonnen int default 0;
    declare externTijdensInterneRonde int default 0;
    declare minimumInternePartijen int default 0; 
    declare teamCode char(3);
    declare rondeNummer int;
    declare partij char(1);
    declare tegenstander int;
    declare witZwart char(1);
    declare resultaat char(1);
    declare found boolean default true;
    declare uitslagen cursor for
        select u.teamCode, u.rondeNummer, u.partij, u.tegenstanderNummer, u.witZwart, u.resultaat
        from uitslag u
        where u.seizoen = seizoen
            and u.knsbNummer = knsbNummer
            and u.anderTeam = 'int'
            and u.datum < totDatum;
    declare continue handler for not found set found = false;
    if versie <> 4 then -- niet bij rapid
        set startPunten = 300; -- reglement artikel 11
		set minimumInternePartijen = 20; -- reglement artikel 2
		set rondenVerschil = 7; -- reglement artikel 3
	end if;
    set knsbRating = rating(seizoen, knsbNummer); 
    set eigenWaardeCijfer = waardeCijfer(versie, knsbRating);
    open uitslagen;
    fetch uitslagen into teamCode, rondeNummer, partij, tegenstander, witZwart, resultaat;
    while found
        do
            if partij = 'i' and resultaat = '1' then
                set winstIntern = winstIntern + 1;
            elseif partij = 'i' and resultaat = '½' then
                set remiseIntern = remiseIntern + 1;
            elseif partij = 'i' and resultaat = '0' then
                set verliesIntern = verliesIntern + 1;
            elseif partij = 'a' then
                set afzeggingen = afzeggingen + 1;
            elseif partij = 'o' then
                set oneven = oneven + 1;
            elseif partij = 'w' then
                set reglementairGewonnen = reglementairGewonnen + 1;
            elseif partij = 'e' and teamCode = 'int' then
                set externTijdensInterneRonde = externTijdensInterneRonde + 1;
            elseif partij = 'e' and resultaat = '1' then
                set winstExtern = winstExtern + 1;
            elseif partij = 'e' and resultaat = '½' then
                set remiseExtern = remiseExtern + 1;
            elseif partij = 'e' and resultaat = '0' then
                set verliesExtern = verliesExtern + 1;
            end if;
            if partij = 'i' and witZwart = 'w' then
                set witIntern = witIntern + 1;
                set tegenstanders = concat(tegenstanders, ' ', rondeNummer, ' 1 ', tegenstander);
            elseif partij = 'i' and witZwart = 'z' then
                set zwartIntern = zwartIntern + 1;
                set tegenstanders = concat(tegenstanders, ' ', rondeNummer, ' 0 ', tegenstander);
            elseif partij = 'e' and witZwart = 'w' then
                set witExtern = witExtern + 1;
            elseif partij = 'e' and witZwart = 'z' then
                set zwartExtern = zwartExtern + 1;
            end if;
            set totaal = totaal + punten(seizoen, versie, knsbNummer, eigenWaardeCijfer, teamCode, partij, tegenstander, resultaat);
            fetch uitslagen into teamCode, rondeNummer, partij, tegenstander, witZwart, resultaat;
        end while; 
    close uitslagen;
    set tegenstanders = concat(tegenstanders, ' 0 ', knsbNummer); -- TODO lees paring voor voorkeuren 
    if witIntern = 0 and zwartIntern = 0 then
        set prijs = 0;
        set sorteer = witExtern + zwartExtern;
	else
        if (witIntern + zwartIntern + oneven + reglementairGewonnen + externTijdensInterneRonde) < minimumInternePartijen then
			set prijs = 0;
		end if;
        set aftrek = afzeggingenAftrek(seizoen, versie, afzeggingen);
        set sorteer = startPunten + totaal - aftrek;
    end if;
    return concat(
        lpad(sorteer,3,'0'), ' ', -- 0
        prijs, ' ', -- 1
        lpad(winstIntern,2,'0'), ' ', -- 2
        lpad(winstExtern,2,'0'), ' ', -- 3
        lpad(knsbRating,4, '0'), ' ', -- 4
        remiseIntern, ' ', -- 5
        verliesIntern, ' ', -- 6
        witIntern, ' ', -- 7
        zwartIntern, ' ', -- 8
        oneven, ' ', -- 9
        afzeggingen, ' ', -- 10
        aftrek, ' ', -- 11
        totaal, ' ', -- 12
        startPunten, ' ', -- 13
        eigenWaardeCijfer, ' ', -- 14
        remiseExtern, ' ', -- 15
        verliesExtern, ' ', -- 16
        witExtern, ' ', -- 17
        zwartExtern, ' ', -- 18
        rondenverschil, -- 19
        tegenstanders); -- 20
end;
$$
delimiter ;

drop function afzeggingenAftrek;

delimiter $$
create function afzeggingenAftrek(seizoen char(4), versie int, afzeggingen int)
returns int deterministic
begin
    if afzeggingen > 10 and seizoenVersie(seizoen, versie) = 2 then -- reglement artikel 12
        return (afzeggingen - 10) * 8;
	else
        return 0;
    end if;
end;
$$
delimiter ;

set @seizoen = '2122';
set @versie = 0;

set @knsbNummer = 6212404; -- Peter van Diepen

-- ranglijst
select
  s.knsbNummer,
  naam,
  subgroep(@seizoen, @versie, s.knsbNummer) as subgroep,
  totalen(@seizoen, @versie, s.knsbNummer, @datum) as totalen
from speler s
join persoon p on s.knsbNummer = p.knsbNummer
where seizoen = @seizoen
order by totalen desc;

-- punten van alle uitslagen per speler
select u.datum,
       u.rondeNummer,
       u.bordNummer,
       u.witZwart,
       u.tegenstanderNummer,
       p.naam,
       u.resultaat,
       u.teamCode,
       u.partij,
       r.uithuis,
       r.tegenstander,
       punten(
          @seizoen,
          @versie,
          @knsbNummer,
          waardeCijfer(@versie, rating(@seizoen, @knsbNummer)),
          u.teamCode,
          u.partij,
          u.tegenstanderNummer,
          u.resultaat) as punten
from uitslag u
join persoon p on u.tegenstanderNummer = p.knsbNummer
join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
where u.seizoen = @seizoen
    and u.knsbNummer = @knsbNummer
    and u.anderTeam = 'int'
order by u.datum, u.bordNummer;

-- aantal mutaties per gebruiker 
select naam, m.knsbNummer, count(*)
from mutatie m join persoon p on m.knsbNummer = p.knsbNummer where invloed > 0
group by m.knsbNummer
order by naam;

-- agenda voor alle interne en externe ronden per speler
with
  s as (select * from speler where seizoen = @seizoen and knsbNummer = @knsbNummer),
  u as (select * from uitslag where seizoen = @seizoen and knsbNummer = @knsbNummer)
select r.*, u.bordNummer, u.partij, u.witZwart, u.tegenstanderNummer, u.resultaat
  from ronde r
  join s on r.seizoen = s.seizoen
  left join u on r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
where r.seizoen = @seizoen and r.teamCode in ('int', s.knsbTeam, s.nhsbTeam, 'ipv')
order by r.datum;

-- alle externe wedstrijden van het seizoen
select r.*, bond, poule, omschrijving, borden, naam from ronde r
join team t on r.seizoen = t.seizoen and r.teamCode = t.teamCode
join persoon on teamleider = knsbNummer
where r.seizoen = @seizoen and r.teamCode not in ('int', 'ipv')
order by r.datum, r.teamCode;

-- volgende externe wedstrijd
select datum from uitslag where seizoen = @seizoen and teamCode not in ('int', 'ipv') and partij in ('m', 'n') order by datum limit 1;

-- volgende interne ronde
select rondeNummer, datum from uitslag where seizoen = @seizoen and teamCode = 'int' and partij in ('m', 'n') order by datum limit 1;

select * from uitslag where seizoen = @seizoen and teamCode not in ('int', 'ipv') order by datum;

