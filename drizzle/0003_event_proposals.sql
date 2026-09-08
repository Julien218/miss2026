-- Event proposals: sorties proposées par les membres (candidats/bénévoles),
-- validées par un admin (Olivier) avant d'entrer au calendrier partagé.
CREATE TABLE IF NOT EXISTS `event_proposals` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `proposerId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `proposedDate` timestamp NOT NULL,
  `endDate` timestamp NULL,
  `location` varchar(255),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `priority` int NOT NULL DEFAULT 100,
  `reviewedBy` int NULL,
  `reviewedAt` timestamp NULL,
  `reviewNote` text,
  `eventId` int NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_proposal_proposer` (`proposerId`),
  INDEX `idx_proposal_status` (`status`),
  INDEX `idx_proposal_date` (`proposedDate`)
);
