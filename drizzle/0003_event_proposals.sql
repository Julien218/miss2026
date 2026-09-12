CREATE TABLE IF NOT EXISTS `event_proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`proposedDate` timestamp NOT NULL,
	`endDate` timestamp,
	`location` varchar(255),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`priority` int NOT NULL DEFAULT 100,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNote` text,
	`eventId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_proposals_id` PRIMARY KEY(`id`)
);
