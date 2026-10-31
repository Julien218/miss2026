CREATE TABLE IF NOT EXISTS `candidateContractTemplates` (
  `organizationId` int PRIMARY KEY,
  `template` mediumtext NOT NULL
);
ALTER TABLE `candidateApplications`
  ADD `organizationSignedBy` int NULL,
  ADD `contractSnapshot` mediumtext NULL,
  ADD `contractHistory` mediumtext NULL,
  ADD `contractRenewalHash` varchar(64) NULL,
  ADD `contractRenewalExpiresAt` timestamp NULL;
