CREATE TABLE `candidate_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidate_id` int NOT NULL,
	`parent_id` int,
	`author_name` varchar(100) NOT NULL,
	`author_email` varchar(320),
	`content` text NOT NULL,
	`likes` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
	`ip_hash` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `candidate_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comment_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comment_id` int NOT NULL,
	`ip_hash` varchar(64) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `cl_unique_like` UNIQUE(`comment_id`,`ip_hash`)
);
--> statement-breakpoint
CREATE INDEX `cc_candidate_idx` ON `candidate_comments` (`candidate_id`);--> statement-breakpoint
CREATE INDEX `cc_status_idx` ON `candidate_comments` (`status`);--> statement-breakpoint
CREATE INDEX `cc_parent_idx` ON `candidate_comments` (`parent_id`);--> statement-breakpoint
CREATE INDEX `cl_comment_idx` ON `comment_likes` (`comment_id`);--> statement-breakpoint
CREATE INDEX `cl_ip_idx` ON `comment_likes` (`ip_hash`);