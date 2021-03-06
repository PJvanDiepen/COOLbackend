-- uitslagen seizoen 2020-2021 tot einde 2020

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

insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
('2021', 'int', '1', '0', '8587337', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7809285', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '102', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '101', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '10', '103', 'z', '7321534', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '11', '107', 'w', '7691728', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '6192098', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '6', '6212404', 'z', '7282033', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '6214153', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '6572511', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '3', '7099950', 'z', '7824674', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '8', '7210137', 'w', '7269834', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '8', '7269834', 'z', '7210137', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '6', '7282033', 'w', '6212404', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7292043', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '10', '7321534', 'w', '103', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '5', '7399469', 'w', '7904589', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '7', '7502143', 'z', '8224502', '½', '2020-08-25', 'int'),
('2021', 'int', '1', '9', '7518203', 'z', '7546242', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '1', '7529522', 'w', '7970094', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '2', '7535396', 'z', '8096242', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7544438', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '9', '7546242', 'w', '7518203', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7566031', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7582102', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7640798', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '7649213', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '4', '7665834', 'w', '7758014', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '11', '7691728', 'z', '107', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '4', '7758014', 'z', '7665834', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '3', '7824674', 'w', '7099950', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '5', '7904589', 'z', '7399469', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '1', '7970094', 'z', '7529522', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8073978', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '2', '8096242', 'w', '7535396', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8112654', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '7', '8224502', 'w', '7502143', '½', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8276752', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8335415', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '12', '8485059', 'z', '8611922', '0', '2020-08-25', 'int'),
('2021', 'int', '1', '12', '8611922', 'w', '8485059', '1', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8750093', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '1', '0', '8865549', '', '3', '', '2020-08-25', 'int'),
('2021', 'int', '2', '9', '101', 'w', '7582102', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '102', '', '5', '', '2020-09-01', 'int'),
('2021', 'int', '2', '14', '103', 'w', '107', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '14', '107', 'z', '103', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '6192098', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '12', '6212404', 'w', '7399469', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '6214153', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '6572511', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '2', '7099950', 'w', '7665834', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '4', '7210137', 'z', '7691728', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '13', '7269834', 'w', '7546242', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '3', '7282033', 'w', '8611922', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7292043', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7321534', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '12', '7399469', 'z', '6212404', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '6', '7502143', 'w', '7544438', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7518203', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '10', '7529522', 'z', '7535396', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '10', '7535396', 'w', '7529522', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '6', '7544438', 'z', '7502143', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '13', '7546242', 'z', '7269834', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7566031', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '9', '7582102', 'z', '101', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7640798', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7649213', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '2', '7665834', 'z', '7099950', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '4', '7691728', 'w', '7210137', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '11', '7758014', 'w', '7824674', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '7', '7809285', 'w', '8276752', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '11', '7824674', 'z', '7758014', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '7904589', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '1', '7970094', 'w', '8096242', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '8073978', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '1', '8096242', 'z', '7970094', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '5', '8112654', 'w', '8224502', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '5', '8224502', 'z', '8112654', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '7', '8276752', 'z', '7809285', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '8335415', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '8485059', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '2', '8', '8587337', 'w', '8750093', '1', '2020-09-01', 'int'),
('2021', 'int', '2', '3', '8611922', 'z', '7282033', '½', '2020-09-01', 'int'),
('2021', 'int', '2', '8', '8750093', 'z', '8587337', '0', '2020-09-01', 'int'),
('2021', 'int', '2', '0', '8865549', '', '3', '', '2020-09-01', 'int'),
('2021', 'int', '3', '13', '101', 'z', '7824674', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '102', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '9', '103', 'w', '7691728', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '1', '107', 'w', '109', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '1', '109', 'z', '107', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '6192098', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '11', '6212404', 'w', '7809285', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '6214153', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '3', '6572511', 'z', '7502143', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7099950', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7210137', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '8', '7269834', 'z', '7582102', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '4', '7282033', 'z', '7970094', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7292043', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '7', '7321534', 'z', '7518203', '½', '2020-09-08', 'int'),
('2021', 'int', '3', '10', '7399469', 'z', '8224502', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '3', '7502143', 'w', '6572511', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '7', '7518203', 'w', '7321534', '½', '2020-09-08', 'int'),
('2021', 'int', '3', '12', '7529522', 'z', '8750093', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '6', '7535396', 'w', '7665834', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7544438', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7546242', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7566031', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '8', '7582102', 'w', '7269834', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '2', '7640798', 'z', '7649213', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '2', '7649213', 'w', '7640798', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '6', '7665834', 'z', '7535396', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '9', '7691728', 'z', '103', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7758014', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '11', '7809285', 'z', '6212404', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '13', '7824674', 'w', '101', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '7904589', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '4', '7970094', 'w', '7282033', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8073978', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8096242', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8112654', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '10', '8224502', 'w', '7399469', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8276752', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8335415', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8485059', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '3', '5', '8587337', 'z', '8611922', '0', '2020-09-08', 'int'),
('2021', 'int', '3', '5', '8611922', 'w', '8587337', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '12', '8750093', 'w', '7529522', '1', '2020-09-08', 'int'),
('2021', 'int', '3', '0', '8865549', '', '3', '', '2020-09-08', 'int'),
('2021', 'int', '4', '12', '101', 'w', '107', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '102', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '11', '103', 'z', '8335415', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '12', '107', 'z', '101', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '13', '109', 'z', '7529522', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '10', '6192098', 'w', '7649213', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '8', '6212404', 'z', '7321534', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '6214153', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '3', '6572511', 'w', '8096242', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '1', '7099950', 'w', '7970094', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7210137', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '5', '7269834', 'w', '7691728', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '6', '7282033', 'z', '8276752', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7292043', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '8', '7321534', 'w', '6212404', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7399469', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '9', '7502143', 'z', '8073978', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '7', '7518203', 'w', '8224502', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '13', '7529522', 'w', '109', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7535396', '', '5', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7544438', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7546242', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7566031', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7582102', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '4', '7640798', 'w', '8112654', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '10', '7649213', 'z', '6192098', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '2', '7665834', 'w', '8611922', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '5', '7691728', 'z', '7269834', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7758014', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7809285', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7824674', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '7904589', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '1', '7970094', 'z', '7099950', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '9', '8073978', 'w', '7502143', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '3', '8096242', 'z', '6572511', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '4', '8112654', 'z', '7640798', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '7', '8224502', 'z', '7518203', '½', '2020-09-15', 'int'),
('2021', 'int', '4', '6', '8276752', 'w', '7282033', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '11', '8335415', 'w', '103', '1', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '8485059', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '8587337', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '2', '8611922', 'z', '7665834', '0', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '8750093', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '4', '0', '8865549', '', '3', '', '2020-09-15', 'int'),
('2021', 'int', '5', '0', '101', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '1', '102', 'z', '109', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '15', '103', 'w', '6192098', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '16', '107', 'w', '7809285', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '1', '109', 'w', '102', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '15', '6192098', 'z', '103', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '11', '6212404', 'w', '8587337', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '12', '6214153', 'w', '7529522', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '7', '6572511', 'w', '8112654', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '2', '7099950', 'z', '8096242', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '4', '7210137', 'z', '8611922', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '10', '7269834', 'z', '8750093', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7282033', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7292043', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '5', '7321534', 'w', '7535396', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '13', '7399469', 'w', '8073978', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '8', '7502143', 'w', '7518203', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '8', '7518203', 'z', '7502143', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '12', '7529522', 'z', '6214153', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '5', '7535396', 'z', '7321534', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '9', '7544438', 'w', '8224502', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7546242', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '14', '7566031', 'z', '8865549', '½', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7582102', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '6', '7640798', 'z', '7904589', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7649213', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '3', '7665834', 'z', '7691728', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '3', '7691728', 'w', '7665834', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7758014', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '16', '7809285', 'z', '107', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7824674', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '6', '7904589', 'w', '7640798', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '7970094', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '13', '8073978', 'z', '7399469', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '2', '8096242', 'w', '7099950', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '7', '8112654', 'z', '6572511', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '9', '8224502', 'z', '7544438', '0', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '8276752', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '8335415', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '0', '8485059', '', '3', '', '2020-09-22', 'int'),
('2021', 'int', '5', '11', '8587337', 'z', '6212404', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '4', '8611922', 'w', '7210137', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '10', '8750093', 'w', '7269834', '1', '2020-09-22', 'int'),
('2021', 'int', '5', '14', '8865549', 'w', '7566031', '½', '2020-09-22', 'int'),
('2021', 'int', '6', '11', '101', 'z', '6212404', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '12', '102', 'z', '7566031', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '103', '', '1', '', '2020-09-29', 'int'),
('2021', 'int', '6', '14', '107', 'z', '8073978', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '109', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '10', '6192098', 'z', '7269834', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '11', '6212404', 'w', '101', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '7', '6214153', 'w', '7321534', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '2', '6572511', 'z', '7665834', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '1', '7099950', 'w', '8611922', '½', '2020-09-29', 'int'),
('2021', 'int', '6', '6', '7210137', 'w', '8750093', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '10', '7269834', 'w', '6192098', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '3', '7282033', 'w', '7535396', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7292043', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '7', '7321534', 'z', '6214153', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '9', '7399469', 'z', '7518203', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '4', '7502143', 'z', '7691728', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '9', '7518203', 'w', '7399469', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '13', '7529522', 'w', '8865549', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '3', '7535396', 'z', '7282033', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '5', '7544438', 'z', '8587337', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7546242', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '12', '7566031', 'w', '102', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7582102', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7640798', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7649213', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '2', '7665834', 'w', '6572511', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '4', '7691728', 'w', '7502143', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7758014', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7809285', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '8', '7824674', 'z', '8224502', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7904589', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '7970094', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '14', '8073978', 'w', '107', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '8096242', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '8112654', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '8', '8224502', 'w', '7824674', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '8276752', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '8335415', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '0', '8485059', '', '3', '', '2020-09-29', 'int'),
('2021', 'int', '6', '5', '8587337', 'w', '7544438', '1', '2020-09-29', 'int'),
('2021', 'int', '6', '1', '8611922', 'z', '7099950', '½', '2020-09-29', 'int'),
('2021', 'int', '6', '6', '8750093', 'z', '7210137', '0', '2020-09-29', 'int'),
('2021', 'int', '6', '13', '8865549', 'z', '7529522', '0', '2020-09-29', 'int'),
('2021', 'int', '7', '14', '101', 'w', '103', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '15', '102', 'w', '107', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '14', '103', 'z', '101', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '15', '107', 'z', '102', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '109', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '13', '6192098', 'w', '8073978', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '10', '6212404', 'z', '7649213', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '5', '6214153', 'z', '7282033', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '3', '6572511', 'z', '8611922', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '1', '7099950', 'z', '7535396', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7210137', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '9', '7269834', 'w', '8276752', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '5', '7282033', 'w', '6214153', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7292043', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '8', '7321534', 'z', '7758014', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7399469', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '6', '7502143', 'z', '8112654', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '12', '7518203', 'z', '7809285', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '11', '7529522', 'z', '8224502', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '1', '7535396', 'w', '7099950', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '7', '7544438', 'w', '7824674', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7546242', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7566031', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7582102', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '2', '7640798', 'w', '7665834', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '10', '7649213', 'w', '6212404', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '2', '7665834', 'z', '7640798', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '4', '7691728', 'z', '8587337', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '8', '7758014', 'w', '7321534', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '12', '7809285', 'w', '7518203', '½', '2020-10-06', 'int'),
('2021', 'int', '7', '7', '7824674', 'z', '7544438', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7904589', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '7970094', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '13', '8073978', 'z', '6192098', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '8096242', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '6', '8112654', 'w', '7502143', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '11', '8224502', 'w', '7529522', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '9', '8276752', 'z', '7269834', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '8335415', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '8485059', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '4', '8587337', 'w', '7691728', '1', '2020-10-06', 'int'),
('2021', 'int', '7', '3', '8611922', 'w', '6572511', '0', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '8750093', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '7', '0', '8865549', '', '3', '', '2020-10-06', 'int'),
('2021', 'int', '8', '9', '101', 'z', '102', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '9', '102', 'w', '101', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '7', '103', 'w', '7809285', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '10', '107', 'w', '8865549', '½', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '109', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '8', '6192098', 'z', '7529522', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '6', '6212404', 'z', '7566031', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '3', '6214153', 'z', '7640798', '½', '2020-10-13', 'int'),
('2021', 'int', '8', '1', '6572511', 'w', '7099950', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '1', '7099950', 'z', '6572511', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7210137', '', '5', '', '2020-10-13', 'int'),
('2021', 'int', '8', '4', '7269834', 'z', '7292043', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '5', '7282033', 'z', '7518203', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '4', '7292043', 'w', '7269834', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7321534', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7399469', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7502143', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '5', '7518203', 'w', '7282033', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '8', '7529522', 'w', '6192098', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7535396', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7544438', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7546242', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '6', '7566031', 'w', '6212404', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7582102', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '3', '7640798', 'w', '6214153', '½', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7649213', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '2', '7665834', 'w', '8587337', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7691728', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7758014', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '7', '7809285', 'z', '103', '1', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7824674', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7904589', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '7970094', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8073978', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8096242', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8112654', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8224502', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8276752', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8335415', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8485059', '', '3', '', '2020-10-13', 'int'),
('2021', 'int', '8', '2', '8587337', 'z', '7665834', '0', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8611922', '', '5', '', '2020-10-13', 'int'),
('2021', 'int', '8', '0', '8750093', '', '5', '', '2020-10-13', 'int'),
('2021', 'int', '8', '10', '8865549', 'z', '107', '½', '2020-10-13', 'int');

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