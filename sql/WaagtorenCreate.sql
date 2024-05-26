use waagtoren;

CREATE DATABASE  IF NOT EXISTS `waagtoren`;
USE `waagtoren`;

drop table if exists rating; -- 0-0-0.nl versie 0.8.27
create table rating (
	knsbNummer int not null,
    knsbNaam varchar(60),
    titel varchar(3),
    federatie varchar(3),
    knsbRating int not null,
    partijen int not null,
    geboorteJaar int not null,
    sekse char(1),
    maand int not null,
    jaar int not null,
    PRIMARY KEY (maand, knsbNummer)
);

drop table if exists persoon; -- 0-0-0.nl versie 0.1
create table persoon (
	knsbNummer int not null,
    naam varchar(45),
    PRIMARY KEY (knsbNummer)
);

drop table if exists gebruiker; -- 0-0-0.nl versie 0.1
-- TODO knsbNummer unique
-- TODO telefoon char(15)
-- TODO wat nog meer vastleggen naast datumEmail ?
-- TODO mutatieRechten naar rol in speler
create table gebruiker (
	knsbNummer int not null,
    mutatieRechten int not null,
    uuidToken char(36),
    email varchar(100),
    datumEmail date,
    primary key (uuidToken)
);

alter table gebruiker
add constraint fk_gebruiker_persoon
    foreign key (knsbNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
        
drop table if exists team; -- 0-0-0.nl versie 0.8.56
-- TODO bond en poule verwijderen
-- TODO teamleider naar rol in speler
-- TODO verwijder fk_team_persoon
create table team (
    clubCode int not null,
	seizoen char(4) not null,
    teamCode char(3) not null,
    bond char(1),
    poule char(2),
    omschrijving varchar(45),
    borden int not null,
    teamleider int not null,
    primary key (clubCode, seizoen, teamCode)
);

alter table team
add constraint fk_team_persoon
    foreign key (teamleider)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;

DROP TABLE IF EXISTS speler; -- 0-0-0.nl versie 0.8.56
-- TODO telefoon int not null
-- TODO datum verwijderen
-- TODO nhsbTeam, knsbTeam, intern1..5 verwijderen
CREATE TABLE speler (
    clubCode int not null,
    seizoen char(4) not null,
    teamCode char(3) not null,
	nhsbTeam char(3) not null,
	knsbTeam char(3) not null,
    knsbNummer int not null,
    knsbRating int not null,
    datum date not null,
    interneRating int not null,
    intern1 char(3) not null,
	intern2 char(3) not null,
    intern3 char(3) not null,
    intern4 char(3) not null,
    intern5 char(3) not null,
    rol int not null,
    emailZien int not null,
    telefoonZien int not null,
    PRIMARY KEY (clubCode, seizoen, teamCode, knsbNummer)
);

alter table speler
add CONSTRAINT fk_speler_team
    FOREIGN KEY (clubCode, seizoen, teamCode)
    REFERENCES team (clubCode, seizoen, teamCode)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;

alter table speler
add constraint fk_speler_persoon
    foreign key (knsbNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
      
DROP TABLE IF EXISTS ronde; -- 0-0-0.nl versie 0.8.56
CREATE TABLE ronde (
    clubCode int not null,
    seizoen char(4) not null,
    teamCode char(3) not null,
    rondeNummer int not null,
    uithuis char(1) not null,
    tegenstander varchar(45),
    datum date not null,
    PRIMARY KEY (clubCode, seizoen, teamCode, rondeNummer)
);

alter table ronde
add CONSTRAINT fk_ronde_team
    FOREIGN KEY (clubCode, seizoen, teamCode)
    REFERENCES team (clubCode, seizoen, teamCode)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
    
DROP TABLE IF EXISTS uitslag; -- 0-0-0.nl versie 0.8.56
-- TODO competitie i.p.v. anderTeam
-- TODO fk_uitslag_competitie i.p.v. fk_uitslag_ander_team 
CREATE TABLE uitslag (
    clubCode int not null,
    seizoen char(4) not null,
    teamCode char(3) not null,
    rondeNummer int not null,
    bordNummer int not null,
    knsbNummer int not null,
    partij char(1),
    witZwart char(1),
    tegenstanderNummer int,
    resultaat char(1),
    datum date comment 'indien op een andere datum dan ronde',
    anderTeam char(3),
    competitie char(3),
    PRIMARY KEY (clubCode, seizoen, teamCode, rondeNummer, knsbNummer)
);

alter table uitslag
add CONSTRAINT fk_uitslag_team
    FOREIGN KEY (clubCode, seizoen, teamCode)
    REFERENCES team (clubCode, seizoen, teamCode)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;

alter table uitslag
add CONSTRAINT fk_uitslag_ander_team
    FOREIGN KEY (clubCode, seizoen, anderTeam)
    REFERENCES team (clubCode, seizoen, teamCode)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
            
alter table uitslag
add constraint fk_uitslag_persoon
    foreign key (knsbNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;
    
alter table uitslag
add constraint fk_uitslag_tegenstander
    foreign key (tegenstanderNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;

alter table uitslag
add CONSTRAINT fk_uitslag_ronde
    FOREIGN KEY (clubCode, seizoen, teamCode, rondeNummer)
    REFERENCES ronde (clubCode, seizoen, teamCode, rondeNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;

drop table if exists mutatie; -- 0-0-0.nl versie 0.2
-- TODO volgNummer autoincrement
create table mutatie (
    tijdstip datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP comment 'geen tijdzone conversie',
    volgNummer int not null,
	knsbNummer int not null,
    url varchar(100),
    aantal int,
    invloed int,
    primary key (tijdstip, volgNummer)
);

alter table mutatie
add constraint fk_mutatie_persoon
    foreign key (knsbNummer)
    references persoon (knsbNummer)
    ON DELETE NO ACTION
    ON UPDATE CASCADE;

show tables;