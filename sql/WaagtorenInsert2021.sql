-- Error Code: 1452. Cannot add or update a child row: a foreign key constraint fails --
-- Oplossing: eerst
SET foreign_key_checks = 0;
-- Daarna:
SET foreign_key_checks = 1;

-- 44 deelnemers in seizoen 2021
insert into persoon (knsbNummer, naam, dummy) values
('101', 'Ramon Witte', ''),
('102', 'Ellen van der Hoeven', ''),
('103', 'Charles Stoorvogel', ''),
('107', 'Joris Beerda', ''),
('109', 'Ron van den Bogert', ''),
('6192098', 'Nico Brugman', ''),
('6212404', 'Peter van Diepen', ''),
('6214153', 'Jan Poland', ''),
('6572511', 'Bert Buitink', ''),
('7099950', 'Jos Vlaming', ''),
('7210137', 'Arjen Dibbets', ''),
('7269834', 'Arie Boots', ''),
('7282033', 'Gerrit Lemmen', ''),
('7292043', 'Rob Freer', ''),
('7321534', 'Ronald Kamps', ''),
('7399469', 'Nico Mak', ''),
('7502143', 'Rob Heijink', ''),
('7518203', 'Theo de Bruijn', ''),
('7529522', 'Willem Meyles', ''),
('7535396', 'John Leek', ''),
('7544438', 'Fred Driesse', ''),
('7546242', 'Ronald Brink', ''),
('7566031', 'Corné van der Horst', ''),
('7582102', 'Onno Vellinga', ''),
('7640798', 'Johan Wester', ''),
('7649213', 'Dick Bouma', ''),
('7665834', 'David Baanstra', ''),
('7691728', 'Karel Beentjes', ''),
('7758014', 'Alex Albrecht', ''),
('7809285', 'Albert van der Meiden', ''),
('7824674', 'Guido Florijn', ''),
('7904589', 'Wim Nieland', ''),
('7970094', 'Danny de Ruiter', ''),
('8073978', 'Gerrit Peereboom', ''),
('8096242', 'Michael van Liempt', ''),
('8112654', 'Ton Fasel', ''),
('8224502', 'Jan van Gijsen', ''),
('8276752', 'Theo Bakker', ''),
('8335415', 'Koos de Graaf', ''),
('8485059', 'Peter Duijs', ''),
('8587337', 'Max Hooijmans', ''),
('8611922', 'Tycho Bakker', ''),
('8750093', 'Martin Rep', ''),
('8865549', 'Erno Brouwer', '');

insert into speler (seizoen, nhsbTeam, knsbTeam, knsbNummer, knsbRating, datumRating, subgroep) values
('2021', '', '', '7970094', '2248', '2020-08-01', 'A'),
('2021', '', '', '8096242', '2119', '2020-08-01', 'A'),
('2021', '', '', '7099950', '2079', '2020-08-01', 'A'),
('2021', '', '', '7665834', '1939', '2020-08-01', 'B'),
('2021', '', '', '6572511', '1907', '2020-08-01', 'B'),
('2021', '', '', '8112654', '1890', '2020-08-01', 'C'),
('2021', '', '', '7529522', '1889', '2020-08-01', 'C'),
('2021', '', '', '7535396', '1882', '2020-08-01', 'C'),
('2021', '', '', '7544438', '1871', '2020-08-01', 'C'),
('2021', '', '', '7292043', '1860', '2020-08-01', 'C'),
('2021', '', '', '7640798', '1860', '2020-08-01', 'C'),
('2021', '', '', '7824674', '1845', '2020-08-01', 'C'),
('2021', '', '', '7758014', '1829', '2020-08-01', 'C'),
('2021', '', '', '7904589', '1829', '2020-08-01', 'C'),
('2021', '', '', '7809285', '1794', '2020-08-01', 'D'),
('2021', '', '', '6214153', '1754', '2020-08-01', 'D'),
('2021', '', '', '7282033', '1736', '2020-08-01', 'D'),
('2021', '', '', '7502143', '1719', '2020-08-01', 'D'),
('2021', '', '', '8611922', '1712', '2020-08-01', 'D'),
('2021', '', '', '7210137', '1701', '2020-08-01', 'D'),
('2021', '', '', '8276752', '1697', '2020-08-01', 'E'),
('2021', '', '', '7649213', '1691', '2020-08-01', 'E'),
('2021', '', '', '7399469', '1671', '2020-08-01', 'E'),
('2021', '', '', '8750093', '1664', '2020-08-01', 'E'),
('2021', '', '', '6212404', '1652', '2020-08-01', 'E'),
('2021', '', '', '8587337', '1628', '2020-08-01', 'E'),
('2021', '', '', '8485059', '1611', '2020-08-01', 'E'),
('2021', '', '', '8224502', '1579', '2020-08-01', 'F'),
('2021', '', '', '7269834', '1573', '2020-08-01', 'F'),
('2021', '', '', '7518203', '1551', '2020-08-01', 'F'),
('2021', '', '', '7321534', '1540', '2020-08-01', 'F'),
('2021', '', '', '8073978', '1503', '2020-08-01', 'F'),
('2021', '', '', '6192098', '1481', '2020-08-01', 'G'),
('2021', '', '', '7691728', '1425', '2020-08-01', 'G'),
('2021', '', '', '7546242', '1360', '2020-08-01', 'H'),
('2021', '', '', '101', '1290', '2019-08-01', 'H'),
('2021', '', '', '7582102', '1281', '2020-08-01', 'H'),
('2021', '', '', '8335415', '1229', '2020-08-01', 'H'),
('2021', '', '', '103', '1150', '2019-08-01', 'H'),
('2021', '', '', '102', '1000', '2019-08-01', 'H'),
('2021', '', '', '107', '1000', '2019-08-01', 'H'),
('2021', '', '', '109', '1000', '2019-08-01', 'H'),
('2021', '', '', '7566031', '500', '2020-08-01', 'H'),
('2021', '', '', '8865549', '500', '2020-08-01', 'H');

insert into team (seizoen, teamCode, bond, poule, omschrijving, borden) values
('2021', '', '', '', 'geen team', '0'),
('2021', '1', 'k', '2?', 'KNSB 2?', '8'),
('2021', '2', 'k', '3?', 'KNSB 3?', '8'),
('2021', '3', 'k', '4?', 'KNSB 4?', '8'),
('2021', 'int', 'i', 'nt', 'interne competitie', '0');

insert into ronde (seizoen, teamCode, rondeNummer, compleet, uithuis, tegenstander, plaats, datum) values
('2021', 'int', '1', '', 't', '', 'Alkmaar', '2020-08-25'),
('2021', 'int', '2', '', 't', '', 'Alkmaar', '2020-09-01'),
('2021', 'int', '3', '', 't', '', 'Alkmaar', '2020-09-08'),
('2021', 'int', '4', '', 't', '', 'Alkmaar', '2020-09-15'),
('2021', 'int', '5', '', 't', '', 'Alkmaar', '2020-09-22'),
('2021', 'int', '6', '', 't', '', 'Alkmaar', '2020-09-29'),
('2021', 'int', '7', '', 't', '', 'Alkmaar', '2020-10-06'),
('2021', 'int', '8', '', 't', '', 'Alkmaar', '2020-10-13'),
('2021', 'int', '9', '', 't', '', 'Alkmaar', '2020-10-20'),
('2021', 'int', '10', '', 't', '', 'Alkmaar', '2020-10-27'),
('2021', 'int', '11', '', 't', '', 'Alkmaar', '2020-11-03'),
('2021', 'int', '12', '', 't', '', 'Alkmaar', '2020-11-10'),
('2021', 'int', '13', '', 't', '', 'Alkmaar', '2020-11-17'),
('2021', 'int', '14', '', 't', '', 'Alkmaar', '2020-11-24'),
('2021', 'int', '15', '', 't', '', 'Alkmaar', '2020-12-08'),
('2021', 'int', '16', '', 't', '', 'Alkmaar', '2020-12-15'),
('2021', 'int', '17', '', 't', '', 'Alkmaar', '2021-01-05'),
('2021', 'int', '18', '', 't', '', 'Alkmaar', '2021-01-12'),
('2021', 'int', '19', '', 't', '', 'Alkmaar', '2021-01-19'),
('2021', 'int', '20', '', 't', '', 'Alkmaar', '2021-02-02'),
('2021', 'int', '21', '', 't', '', 'Alkmaar', '2021-02-09'),
('2021', 'int', '22', '', 't', '', 'Alkmaar', '2021-02-16'),
('2021', 'int', '23', '', 't', '', 'Alkmaar', '2021-03-02'),
('2021', 'int', '24', '', 't', '', 'Alkmaar', '2021-03-09'),
('2021', 'int', '25', '', 't', '', 'Alkmaar', '2021-03-16'),
('2021', 'int', '26', '', 't', '', 'Alkmaar', '2021-03-23'),
('2021', 'int', '27', '', 't', '', 'Alkmaar', '2021-03-30'),
('2021', 'int', '28', '', 't', '', 'Alkmaar', '2021-04-06'),
('2021', 'int', '29', '', 't', '', 'Alkmaar', '2021-04-13'),
('2021', 'int', '30', '', 't', '', 'Alkmaar', '2021-04-20'),
('2021', 'int', '31', '', 't', '', 'Alkmaar', '2021-05-11'),
('2021', 'int', '32', '', 't', '', 'Alkmaar', '2021-05-18'),
('2021', 'int', '33', '', 't', '', 'Alkmaar', '2021-05-25');

insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
('2021', 'int', '1', '0', '101', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '102', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '10', '103', 'i', 'z', '7321534', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '11', '107', 'i', 'w', '7691728', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '6192098', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '6', '6212404', 'i', 'z', '7282033', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '6214153', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '6572511', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '3', '7099950', 'i', 'z', '7824674', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '8', '7210137', 'i', 'w', '7269834', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '8', '7269834', 'i', 'z', '7210137', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '6', '7282033', 'i', 'w', '6212404', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7292043', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '10', '7321534', 'i', 'w', '103', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '5', '7399469', 'i', 'w', '7904589', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '7', '7502143', 'i', 'z', '8224502', '½', '2020-08-25', 'int'),
('2021', 'int', '1', '9', '7518203', 'i', 'z', '7546242', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '1', '7529522', 'i', 'w', '7970094', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '2', '7535396', 'i', 'z', '8096242', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7544438', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '9', '7546242', 'i', 'w', '7518203', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7566031', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7582102', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7640798', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7649213', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '4', '7665834', 'i', 'w', '7758014', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '11', '7691728', 'i', 'z', '107', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '4', '7758014', 'i', 'z', '7665834', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7809285', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '3', '7824674', 'i', 'w', '7099950', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '5', '7904589', 'i', 'z', '7399469', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '1', '7970094', 'i', 'z', '7529522', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8073978', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '2', '8096242', 'i', 'w', '7535396', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8112654', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '7', '8224502', 'i', 'w', '7502143', '½', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8276752', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8335415', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '12', '8485059', 'i', 'z', '8611922', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8587337', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '12', '8611922', 'i', 'w', '8485059', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8750093', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8865549', 'a', '', '0', '', '2020-08-25', 'int'),
('2021', 'int', '2', '9', '101', 'i', 'w', '7582102', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '102', 'w', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '14', '103', 'i', 'w', '107', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '14', '107', 'i', 'z', '103', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '6192098', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '12', '6212404', 'i', 'w', '7399469', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '6214153', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '6572511', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '2', '7099950', 'i', 'w', '7665834', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '4', '7210137', 'i', 'z', '7691728', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '13', '7269834', 'i', 'w', '7546242', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '3', '7282033', 'i', 'w', '8611922', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7292043', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7321534', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '12', '7399469', 'i', 'z', '6212404', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '6', '7502143', 'i', 'w', '7544438', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7518203', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '10', '7529522', 'i', 'z', '7535396', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '10', '7535396', 'i', 'w', '7529522', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '6', '7544438', 'i', 'z', '7502143', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '13', '7546242', 'i', 'z', '7269834', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7566031', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '9', '7582102', 'i', 'z', '101', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7640798', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7649213', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '2', '7665834', 'i', 'z', '7099950', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '4', '7691728', 'i', 'w', '7210137', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '11', '7758014', 'i', 'w', '7824674', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '7', '7809285', 'i', 'w', '8276752', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '11', '7824674', 'i', 'z', '7758014', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7904589', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '1', '7970094', 'i', 'w', '8096242', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '8073978', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '1', '8096242', 'i', 'z', '7970094', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '5', '8112654', 'i', 'w', '8224502', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '5', '8224502', 'i', 'z', '8112654', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '7', '8276752', 'i', 'z', '7809285', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '8335415', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '8485059', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '2', '8', '8587337', 'i', 'w', '8750093', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '3', '8611922', 'i', 'z', '7282033', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '8', '8750093', 'i', 'z', '8587337', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '8865549', 'a', '', '0', '', '2020-09-01', 'int'),
('2021', 'int', '3', '13', '101', 'i', 'z', '7824674', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '102', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '9', '103', 'i', 'w', '7691728', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '1', '107', 'i', 'w', '109', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '1', '109', 'i', 'z', '107', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '6192098', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '11', '6212404', 'i', 'w', '7809285', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '6214153', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '3', '6572511', 'i', 'z', '7502143', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7099950', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7210137', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '8', '7269834', 'i', 'z', '7582102', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '4', '7282033', 'i', 'z', '7970094', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7292043', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '7', '7321534', 'i', 'z', '7518203', '½', '2020-09-08', 'int'),
('2021', 'int', '3', '10', '7399469', 'i', 'z', '8224502', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '3', '7502143', 'i', 'w', '6572511', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '7', '7518203', 'i', 'w', '7321534', '½', '2020-09-08', 'int'),
('2021', 'int', '3', '12', '7529522', 'i', 'z', '8750093', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '6', '7535396', 'i', 'w', '7665834', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7544438', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7546242', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7566031', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '8', '7582102', 'i', 'w', '7269834', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '2', '7640798', 'i', 'z', '7649213', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '2', '7649213', 'i', 'w', '7640798', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '6', '7665834', 'i', 'z', '7535396', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '9', '7691728', 'i', 'z', '103', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7758014', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '11', '7809285', 'i', 'z', '6212404', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '13', '7824674', 'i', 'w', '101', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7904589', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '4', '7970094', 'i', 'w', '7282033', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8073978', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8096242', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8112654', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '10', '8224502', 'i', 'w', '7399469', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8276752', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8335415', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8485059', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '3', '5', '8587337', 'i', 'z', '8611922', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '5', '8611922', 'i', 'w', '8587337', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '12', '8750093', 'i', 'w', '7529522', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8865549', 'a', '', '0', '', '2020-09-08', 'int'),
('2021', 'int', '4', '12', '101', 'i', 'w', '107', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '102', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '11', '103', 'i', 'z', '8335415', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '12', '107', 'i', 'z', '101', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '13', '109', 'i', 'z', '7529522', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '10', '6192098', 'i', 'w', '7649213', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '8', '6212404', 'i', 'z', '7321534', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '6214153', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '3', '6572511', 'i', 'w', '8096242', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '1', '7099950', 'i', 'w', '7970094', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7210137', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '5', '7269834', 'i', 'w', '7691728', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '6', '7282033', 'i', 'z', '8276752', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7292043', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '8', '7321534', 'i', 'w', '6212404', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7399469', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '9', '7502143', 'i', 'z', '8073978', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '7', '7518203', 'i', 'w', '8224502', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '13', '7529522', 'i', 'w', '109', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7535396', 'w', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7544438', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7546242', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7566031', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7582102', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '4', '7640798', 'i', 'w', '8112654', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '10', '7649213', 'i', 'z', '6192098', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '2', '7665834', 'i', 'w', '8611922', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '5', '7691728', 'i', 'z', '7269834', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7758014', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7809285', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7824674', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7904589', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '1', '7970094', 'i', 'z', '7099950', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '9', '8073978', 'i', 'w', '7502143', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '3', '8096242', 'i', 'z', '6572511', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '4', '8112654', 'i', 'z', '7640798', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '7', '8224502', 'i', 'z', '7518203', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '6', '8276752', 'i', 'w', '7282033', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '11', '8335415', 'i', 'w', '103', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '8485059', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '8587337', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '2', '8611922', 'i', 'z', '7665834', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '8750093', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '8865549', 'a', '', '0', '', '2020-09-15', 'int'),
('2021', 'int', '5', '0', '101', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '1', '102', 'i', 'z', '109', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '15', '103', 'i', 'w', '6192098', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '16', '107', 'i', 'w', '7809285', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '1', '109', 'i', 'w', '102', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '15', '6192098', 'i', 'z', '103', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '11', '6212404', 'i', 'w', '8587337', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '12', '6214153', 'i', 'w', '7529522', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '7', '6572511', 'i', 'w', '8112654', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '2', '7099950', 'i', 'z', '8096242', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '4', '7210137', 'i', 'z', '8611922', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '10', '7269834', 'i', 'z', '8750093', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7282033', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7292043', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '5', '7321534', 'i', 'w', '7535396', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '13', '7399469', 'i', 'w', '8073978', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '8', '7502143', 'i', 'w', '7518203', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '8', '7518203', 'i', 'z', '7502143', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '12', '7529522', 'i', 'z', '6214153', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '5', '7535396', 'i', 'z', '7321534', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '9', '7544438', 'i', 'w', '8224502', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7546242', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '14', '7566031', 'i', 'z', '8865549', '½', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7582102', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '6', '7640798', 'i', 'z', '7904589', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7649213', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '3', '7665834', 'i', 'z', '7691728', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '3', '7691728', 'i', 'w', '7665834', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7758014', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '16', '7809285', 'i', 'z', '107', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7824674', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '6', '7904589', 'i', 'w', '7640798', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7970094', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '13', '8073978', 'i', 'z', '7399469', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '2', '8096242', 'i', 'w', '7099950', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '7', '8112654', 'i', 'z', '6572511', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '9', '8224502', 'i', 'z', '7544438', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '8276752', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '8335415', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '8485059', 'a', '', '0', '', '2020-09-22', 'int'),
('2021', 'int', '5', '11', '8587337', 'i', 'z', '6212404', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '4', '8611922', 'i', 'w', '7210137', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '10', '8750093', 'i', 'w', '7269834', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '14', '8865549', 'i', 'w', '7566031', '½', '2020-09-22', 'int'),
('2021', 'int', '6', '11', '101', 'i', 'z', '6212404', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '12', '102', 'i', 'z', '7566031', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '103', 'o', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '14', '107', 'i', 'z', '8073978', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '109', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '10', '6192098', 'i', 'z', '7269834', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '11', '6212404', 'i', 'w', '101', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '7', '6214153', 'i', 'w', '7321534', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '2', '6572511', 'i', 'z', '7665834', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '1', '7099950', 'i', 'w', '8611922', '½', '2020-09-29', 'int'),
('2021', 'int', '6', '6', '7210137', 'i', 'w', '8750093', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '10', '7269834', 'i', 'w', '6192098', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '3', '7282033', 'i', 'w', '7535396', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7292043', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '7', '7321534', 'i', 'z', '6214153', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '9', '7399469', 'i', 'z', '7518203', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '4', '7502143', 'i', 'z', '7691728', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '9', '7518203', 'i', 'w', '7399469', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '13', '7529522', 'i', 'w', '8865549', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '3', '7535396', 'i', 'z', '7282033', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '5', '7544438', 'i', 'z', '8587337', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7546242', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '12', '7566031', 'i', 'w', '102', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7582102', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7640798', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7649213', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '2', '7665834', 'i', 'w', '6572511', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '4', '7691728', 'i', 'w', '7502143', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7758014', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7809285', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '8', '7824674', 'i', 'z', '8224502', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7904589', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7970094', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '14', '8073978', 'i', 'w', '107', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '8096242', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '8112654', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '8', '8224502', 'i', 'w', '7824674', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '8276752', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '8335415', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '8485059', 'a', '', '0', '', '2020-09-29', 'int'),
('2021', 'int', '6', '5', '8587337', 'i', 'w', '7544438', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '1', '8611922', 'i', 'z', '7099950', '½', '2020-09-29', 'int'),
('2021', 'int', '6', '6', '8750093', 'i', 'z', '7210137', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '13', '8865549', 'i', 'z', '7529522', '0', '2020-09-29', 'int'),
('2021', 'int', '7', '14', '101', 'i', 'w', '103', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '15', '102', 'i', 'w', '107', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '14', '103', 'i', 'z', '101', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '15', '107', 'i', 'z', '102', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '109', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '13', '6192098', 'i', 'w', '8073978', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '10', '6212404', 'i', 'z', '7649213', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '5', '6214153', 'i', 'z', '7282033', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '3', '6572511', 'i', 'z', '8611922', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '1', '7099950', 'i', 'z', '7535396', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7210137', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '9', '7269834', 'i', 'w', '8276752', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '5', '7282033', 'i', 'w', '6214153', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7292043', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '8', '7321534', 'i', 'z', '7758014', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7399469', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '6', '7502143', 'i', 'z', '8112654', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '12', '7518203', 'i', 'z', '7809285', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '11', '7529522', 'i', 'z', '8224502', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '1', '7535396', 'i', 'w', '7099950', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '7', '7544438', 'i', 'w', '7824674', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7546242', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7566031', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7582102', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '2', '7640798', 'i', 'w', '7665834', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '10', '7649213', 'i', 'w', '6212404', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '2', '7665834', 'i', 'z', '7640798', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '4', '7691728', 'i', 'z', '8587337', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '8', '7758014', 'i', 'w', '7321534', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '12', '7809285', 'i', 'w', '7518203', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '7', '7824674', 'i', 'z', '7544438', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7904589', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7970094', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '13', '8073978', 'i', 'z', '6192098', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '8096242', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '6', '8112654', 'i', 'w', '7502143', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '11', '8224502', 'i', 'w', '7529522', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '9', '8276752', 'i', 'z', '7269834', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '8335415', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '8485059', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '4', '8587337', 'i', 'w', '7691728', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '3', '8611922', 'i', 'w', '6572511', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '8750093', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '8865549', 'a', '', '0', '', '2020-10-06', 'int'),
('2021', 'int', '8', '9', '101', 'i', 'z', '102', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '9', '102', 'i', 'w', '101', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '7', '103', 'i', 'w', '7809285', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '10', '107', 'i', 'w', '8865549', '½', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '109', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '8', '6192098', 'i', 'z', '7529522', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '6', '6212404', 'i', 'z', '7566031', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '3', '6214153', 'i', 'z', '7640798', '½', '2020-10-13', 'int'),
('2021', 'int', '8', '1', '6572511', 'i', 'w', '7099950', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '1', '7099950', 'i', 'z', '6572511', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7210137', 'w', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '4', '7269834', 'i', 'z', '7292043', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '5', '7282033', 'i', 'z', '7518203', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '4', '7292043', 'i', 'w', '7269834', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7321534', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7399469', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7502143', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '5', '7518203', 'i', 'w', '7282033', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '8', '7529522', 'i', 'w', '6192098', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7535396', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7544438', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7546242', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '6', '7566031', 'i', 'w', '6212404', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7582102', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '3', '7640798', 'i', 'w', '6214153', '½', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7649213', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '2', '7665834', 'i', 'w', '8587337', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7691728', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7758014', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '7', '7809285', 'i', 'z', '103', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7824674', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7904589', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7970094', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8073978', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8096242', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8112654', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8224502', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8276752', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8335415', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8485059', 'a', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '2', '8587337', 'i', 'z', '7665834', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8611922', 'w', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8750093', 'w', '', '0', '', '2020-10-13', 'int'),
('2021', 'int', '8', '10', '8865549', 'i', 'z', '107', '½', '2020-10-13', 'int');

-- 109 deelnemers in alle seizoenen
insert into persoon (knsbNummer, naam, dummy) values
('101', 'Ramon Witte', ''),
('102', 'Ellen van der Hoeven', ''),
('103', 'Charles Stoorvogel', ''),
('104', 'Sietske de Greeuw', ''),
('105', 'Richard Meijer', ''),
('106', 'Abdul Rashid Ayobi', ''),
('107', 'Joris Beerda', ''),
('108', 'Aad Schuit', ''),
('109', 'Ron van den Bogert', ''),
('6187885', 'Bob de Mon', ''),
('6192098', 'Nico Brugman', ''),
('6212404', 'Peter van Diepen', ''),
('6214153', 'Jan Poland', ''),
('6225934', 'Ruud Adema', ''),
('6335670', 'Hebert Perez Garcia', ''),
('6483455', 'Jeroen Smorenberg', ''),
('6572511', 'Bert Buitink', ''),
('6661721', 'Herman Nijhuis', ''),
('6930957', 'Leo van Steenoven', ''),
('6951362', 'Johan Plooijer', ''),
('7079743', 'Juan de Roda Husman', ''),
('7099620', 'Peter Hoekstra', ''),
('7099950', 'Jos Vlaming', ''),
('7129991', 'Gerard de Geus', ''),
('7210137', 'Arjen Dibbets', ''),
('7227264', 'Kiek Schouten', ''),
('7269834', 'Arie Boots', ''),
('7269900', 'Jan Ens', ''),
('7282033', 'Gerrit Lemmen', ''),
('7292043', 'Rob Freer', ''),
('7321534', 'Ronald Kamps', ''),
('7399469', 'Nico Mak', ''),
('7419621', 'Frits Leenart', ''),
('7428960', 'Frank Agter', ''),
('7468362', 'Paul Toepoel', ''),
('7468417', 'Daan Geerke', ''),
('7502143', 'Rob Heijink', ''),
('7504310', 'Leonard Haakman', ''),
('7509920', 'Dirk van der Meiden', ''),
('7518203', 'Theo de Bruijn', ''),
('7529522', 'Willem Meyles', ''),
('7535385', 'Marten Coerts', ''),
('7535396', 'John Leek', ''),
('7544438', 'Fred Driesse', ''),
('7546242', 'Ronald Brink', ''),
('7561653', 'Mariska de Mie', ''),
('7566031', 'Corné van der Horst', ''),
('7579154', 'Robbert Waas', ''),
('7582102', 'Onno Vellinga', ''),
('7584566', 'Yong Hoon de Rover', ''),
('7640798', 'Johan Wester', ''),
('7649213', 'Dick Bouma', ''),
('7657342', 'Frank van Tellingen', ''),
('7665834', 'David Baanstra', ''),
('7691728', 'Karel Beentjes', ''),
('7699010', 'Ruud Niewenhuis', ''),
('7701122', 'Jan Drewes', ''),
('7707832', 'Ronald Groot', ''),
('7731812', 'Alexander Versluis', ''),
('7739314', 'Piet Pover', ''),
('7758014', 'Alex Albrecht', ''),
('7809285', 'Albert van der Meiden', ''),
('7824674', 'Guido Florijn', ''),
('7828183', 'Rob Konijn', ''),
('7879520', 'Vincent Pandelaar', ''),
('7904589', 'Wim Nieland', ''),
('7970094', 'Danny de Ruiter', ''),
('8073978', 'Gerrit Peereboom', ''),
('8096242', 'Michael van Liempt', ''),
('8112654', 'Ton Fasel', ''),
('8144191', 'Gerard Brouwers', ''),
('8182416', 'Andre Bremmers', ''),
('8193548', 'Daan de Vries', ''),
('8224502', 'Jan van Gijsen', ''),
('8243312', 'Harry Sluiter', ''),
('8271560', 'Bernard Mohl', ''),
('8276752', 'Theo Bakker', ''),
('8285574', 'Maaike Keetman', ''),
('8291877', 'Jawdat Adib', ''),
('8305473', 'Klaas Silver', ''),
('8314834', 'Henk Kleijn', ''),
('8323029', 'Runa de Vries', ''),
('8335415', 'Koos de Graaf', ''),
('8363982', 'Afshin Mehnavian', ''),
('8372881', 'Egbert van Oene', ''),
('8400183', 'Daan de Vetten', ''),
('8461354', 'Luuk van Steenoven', ''),
('8472409', 'Klaas Jan Koedijk', ''),
('8472530', 'Rosa Leek', ''),
('8484443', 'Chaim Bookelman', ''),
('8485059', 'Peter Duijs', ''),
('8505585', 'Max Bookelman', ''),
('8521480', 'Julian de Boer', ''),
('8536319', 'Jonathan Venema', ''),
('8544646', 'José van der Donk', ''),
('8547110', 'Milan de Boer', ''),
('8547946', 'Sander Meijer', ''),
('8552038', 'Kevin Brands', ''),
('8571453', 'Marit de Boer', ''),
('8580374', 'Jos Bakker', ''),
('8580385', 'Han Rauws', ''),
('8587337', 'Max Hooijmans', ''),
('8587348', 'Merijn Hooijmans', ''),
('8611922', 'Tycho Bakker', ''),
('8617367', 'Arend Noordam', ''),
('8716972', 'Gijs Schaveling', ''),
('8750093', 'Martin Rep', ''),
('8773633', 'Gerard Kortooms', ''),
('8865549', 'Erno Brouwer', '');