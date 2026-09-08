CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`imageUrl` text,
	`imageKey` text,
	`category` enum('event','good_action','candidate','news_dour','announcement') NOT NULL,
	`tags` text,
	`authorId` int NOT NULL,
	`authorName` varchar(255),
	`isAiGenerated` int NOT NULL DEFAULT 0,
	`aiPrompt` text,
	`aiModel` varchar(100),
	`candidateId` int,
	`eventId` int,
	`contestId` int,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`viewCount` int NOT NULL DEFAULT 0,
	`shareCount` int NOT NULL DEFAULT 0,
	`likeCount` int NOT NULL DEFAULT 0,
	`metaTitle` varchar(255),
	`metaDescription` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `article_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(50) NOT NULL,
	`url` varchar(500) NOT NULL,
	`sha256` varchar(64) NOT NULL,
	`filename` varchar(255),
	`mimeType` varchar(100),
	`sizeBytes` int,
	`durationSeconds` int,
	`width` int,
	`height` int,
	`tags` text,
	`description` text,
	`candidateId` int,
	`mediaJobId` int,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `assets_sha256_unique` UNIQUE(`sha256`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`actorUserId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`payloadJson` text,
	`ipHash` varchar(64),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(64) NOT NULL,
	`rarity` enum('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`category` enum('voting','sharing','engagement','special') NOT NULL DEFAULT 'engagement',
	`requirement` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `badges_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `candidate_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`shareClicksTotal` int NOT NULL DEFAULT 0,
	`uniqueShareClicks` int NOT NULL DEFAULT 0,
	`shareClicksToday` int NOT NULL DEFAULT 0,
	`profileViews` int NOT NULL DEFAULT 0,
	`uniqueProfileViews` int NOT NULL DEFAULT 0,
	`profileViewsToday` int NOT NULL DEFAULT 0,
	`influenceIndex` int NOT NULL DEFAULT 0,
	`influenceTrend` int NOT NULL DEFAULT 0,
	`lastResetDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidate_analytics_id` PRIMARY KEY(`id`),
	CONSTRAINT `candidate_analytics_candidateId_unique` UNIQUE(`candidateId`),
	CONSTRAINT `analytics_candidate_idx` UNIQUE(`candidateId`)
);
--> statement-breakpoint
CREATE TABLE `candidateApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`dateOfBirth` date NOT NULL,
	`city` varchar(100) NOT NULL,
	`country` varchar(100) NOT NULL DEFAULT 'Belgique',
	`region` enum('wallonie','flandre','bruxelles'),
	`category` enum('miss','mister','teen_miss','teen_mister'),
	`profilePhoto` text,
	`galleryPhotos` text,
	`videoPresentation` text,
	`bio` text,
	`motivation` text,
	`interests` text,
	`profession` varchar(255),
	`instagram` varchar(100),
	`facebook` varchar(100),
	`tiktok` varchar(100),
	`linkedin` varchar(100),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`acceptedTerms` int NOT NULL DEFAULT 0,
	`acceptedMedia` int NOT NULL DEFAULT 0,
	`acceptedNewsletter` int NOT NULL DEFAULT 0,
	`ipAddressHash` varchar(64),
	`contestId` int NOT NULL,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`candidateId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidateApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contestId` int NOT NULL,
	`category` enum('miss','mister','teen_miss','teen_mister') NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`dateOfBirth` timestamp,
	`phone` varchar(50),
	`address` text,
	`city` varchar(100),
	`country` varchar(100),
	`height` int,
	`weight` int,
	`measurements` varchar(100),
	`experience` text,
	`motivation` text,
	`bio` text,
	`profilePhoto` text,
	`instagram` varchar(100),
	`facebook` varchar(100),
	`tiktok` varchar(100),
	`linkedin` varchar(100),
	`acceptRules` int NOT NULL DEFAULT 0,
	`acceptMedia` int NOT NULL DEFAULT 0,
	`acceptNewsletter` int NOT NULL DEFAULT 0,
	`acceptCGU` int NOT NULL DEFAULT 0,
	`acceptCGUAt` timestamp,
	`consentVersion` varchar(20) DEFAULT 'v1.0',
	`accountEmail` varchar(320),
	`passwordHash` text,
	`accountCreatedAt` timestamp,
	`voteCount` int NOT NULL DEFAULT 0,
	`shareCount` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected','finalist','winner') NOT NULL DEFAULT 'pending',
	`profileSubmittedAt` timestamp,
	`profileReviewNote` text,
	`registrationDate` timestamp NOT NULL DEFAULT (now()),
	`validatedAt` timestamp,
	`validatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`contestId` int NOT NULL,
	`candidateId` int NOT NULL,
	`certificateId` varchar(64) NOT NULL,
	`assetHash` varchar(64) NOT NULL,
	`metadataHash` varchar(64) NOT NULL,
	`certificateHash` varchar(64) NOT NULL,
	`pdfUrl` text NOT NULL,
	`thumbnailUrl` text,
	`qrPayloadJson` text NOT NULL,
	`qrCodeUrl` text,
	`publicVerifyUrl` text NOT NULL,
	`blockchainTxHash` varchar(66),
	`blockchainTimestamp` timestamp,
	`blockchainNetwork` varchar(50),
	`status` enum('draft','issued','revoked') NOT NULL DEFAULT 'issued',
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	`revokedReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificateId_unique` UNIQUE(`certificateId`),
	CONSTRAINT `cert_id_idx` UNIQUE(`certificateId`)
);
--> statement-breakpoint
CREATE TABLE `contests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`year` int NOT NULL,
	`description` text,
	`status` enum('draft','registration','selection','ongoing','completed') NOT NULL DEFAULT 'draft',
	`startDate` timestamp,
	`endDate` timestamp,
	`location` varchar(255),
	`rules` text,
	`prizes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`juryId` int NOT NULL,
	`contestId` int NOT NULL,
	`eventId` int,
	`phase` enum('preliminary','semifinal','final') NOT NULL,
	`presentationScore` int,
	`talentScore` int,
	`charismaScore` int,
	`communicationScore` int,
	`overallScore` int,
	`comments` text,
	`strengths` text,
	`improvements` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventAttendees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int NOT NULL,
	`candidateId` int,
	`status` enum('invited','confirmed','attended','absent') NOT NULL DEFAULT 'invited',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eventAttendees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contestId` int NOT NULL,
	`isLiveMode` int NOT NULL DEFAULT 0,
	`eventDate` timestamp NOT NULL,
	`liveStartTime` timestamp,
	`liveEndTime` timestamp,
	`showLiveBanner` int NOT NULL DEFAULT 1,
	`showConfetti` int NOT NULL DEFAULT 1,
	`enableLiveNotifications` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_config_contestId_unique` UNIQUE(`contestId`),
	CONSTRAINT `event_config_contest_idx` UNIQUE(`contestId`)
);
--> statement-breakpoint
CREATE TABLE `event_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int NOT NULL,
	`candidateId` int,
	`status` enum('registered','confirmed','attended','absent','cancelled') NOT NULL DEFAULT 'registered',
	`registeredAt` timestamp NOT NULL DEFAULT (now()),
	`confirmedAt` timestamp,
	`notes` text,
	CONSTRAINT `event_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contestId` int NOT NULL,
	`type` enum('rehearsal','photo_session','public_event','finale','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`endDate` timestamp,
	`location` varchar(255),
	`duration` int,
	`maxAttendees` int,
	`organizerId` int NOT NULL,
	`status` enum('scheduled','ongoing','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` enum('admin','directeur','manager','photographe','candidat','jury','viewer') NOT NULL,
	`email` varchar(255) NOT NULL,
	`token` varchar(64) NOT NULL,
	`expires_at` timestamp,
	`max_uses` int DEFAULT 1,
	`used_count` int DEFAULT 0,
	`is_active` int NOT NULL DEFAULT 1,
	`permission_overrides` text,
	`created_by` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`candidate_application_id` int,
	`contest_id` int,
	`category` enum('miss','mister','teen_miss','teen_mister'),
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `ip_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipHash` varchar(64) NOT NULL,
	`candidateId` int NOT NULL,
	`actionType` enum('share','view') NOT NULL,
	`lastActionAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ip_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_garden` (
	`id` int AUTO_INCREMENT NOT NULL,
	`docType` enum('brand_style','video_template','execution_protocol','general') NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`version` varchar(20) NOT NULL DEFAULT '1.0.0',
	`isActive` int NOT NULL DEFAULT 1,
	`visibility` enum('public','internal','admin_only') NOT NULL DEFAULT 'internal',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_garden_id` PRIMARY KEY(`id`),
	CONSTRAINT `knowledge_garden_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `knowledge_garden_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int,
	`uploadedBy` int NOT NULL,
	`type` enum('photo','video','document') NOT NULL,
	`url` text NOT NULL,
	`fileKey` text NOT NULL,
	`thumbnail` text,
	`title` varchar(255),
	`description` text,
	`mimeType` varchar(100),
	`fileSize` int,
	`contestId` int,
	`eventId` int,
	`sessionName` varchar(255),
	`isPublic` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`contestId` int NOT NULL DEFAULT 1,
	`provider` varchar(50) NOT NULL DEFAULT 'flowithOS',
	`kind` varchar(100) NOT NULL,
	`status` enum('pending','ready','running','done','failed','needs_approval') NOT NULL DEFAULT 'pending',
	`format` varchar(50),
	`durationSeconds` int,
	`videoType` varchar(100),
	`idempotencyKey` varchar(255),
	`retries` int NOT NULL DEFAULT 0,
	`promptUsed` text,
	`missionPackJson` text,
	`outputUrl` varchar(500),
	`previewUrl` varchar(500),
	`thumbnailUrl` varchar(500),
	`logsJson` text,
	`errorMessage` text,
	`requestedBy` int NOT NULL,
	`processingStartedAt` timestamp,
	`processingCompletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_jobs_idempotencyKey_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`subject` varchar(255),
	`content` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`readAt` timestamp,
	`parentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text,
	`category` enum('admin','candidate','both') NOT NULL DEFAULT 'admin',
	`emailEnabled` int NOT NULL DEFAULT 1,
	`dashboardEnabled` int NOT NULL DEFAULT 1,
	`adminRecipients` text DEFAULT ('["admin","super_admin"]'),
	`emailSubjectTemplate` varchar(512),
	`emailBodyTemplate` text,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`isActive` int NOT NULL DEFAULT 1,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationSettings_eventType_unique` UNIQUE(`eventType`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('info','success','warning','error','message','event','evaluation') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`link` varchar(500),
	`isRead` int NOT NULL DEFAULT 0,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationsLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`recipientType` enum('admin','candidate','super_admin') NOT NULL,
	`recipientUserId` int,
	`recipientEmail` varchar(320),
	`title` varchar(512) NOT NULL,
	`body` text,
	`emailSent` int NOT NULL DEFAULT 0,
	`dashboardSent` int NOT NULL DEFAULT 0,
	`status` enum('pending','sent','failed','read') NOT NULL DEFAULT 'pending',
	`readAt` timestamp,
	`context` text,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationsLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`primaryColor` varchar(7) NOT NULL DEFAULT '#D4AF37',
	`secondaryColor` varchar(7) NOT NULL DEFAULT '#B8941E',
	`logoUrl` text,
	`faviconUrl` text,
	`certificateStyle` enum('bronze','gold','champagne') NOT NULL DEFAULT 'gold',
	`certificateLogoUrl` text,
	`certificateSignature` text,
	`verifyPageStyle` enum('classic','festival','premium') NOT NULL DEFAULT 'premium',
	`verifyPageBanner` text,
	`blockchainEnabled` int NOT NULL DEFAULT 0,
	`socialScoringEnabled` int NOT NULL DEFAULT 1,
	`voteAntifraudEnabled` int NOT NULL DEFAULT 1,
	`auditLogsEnabled` int NOT NULL DEFAULT 1,
	`customDomain` varchar(255),
	`customDomainVerified` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organization_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_settings_organizationId_unique` UNIQUE(`organizationId`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`ownerUserId` int NOT NULL,
	`plan` enum('free','starter','professional','enterprise','founder') NOT NULL DEFAULT 'free',
	`status` enum('active','suspended','cancelled') NOT NULL DEFAULT 'active',
	`maxEvents` int NOT NULL DEFAULT 1,
	`maxCandidates` int NOT NULL DEFAULT 50,
	`maxVotes` int NOT NULL DEFAULT 10000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `partner_benefits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`benefitType` enum('logo_website','logo_event','social_media_mention','vip_tickets','booth_space','program_ad','email_mention','certificate') NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`description` text,
	`isDelivered` int NOT NULL DEFAULT 0,
	`deliveredAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_benefits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contestId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`website` varchar(500),
	`level` enum('platinum','gold','silver','bronze','supporter') NOT NULL,
	`contributionAmount` int,
	`contributionType` enum('financial','inkind','both') NOT NULL DEFAULT 'financial',
	`logoUrl` text,
	`logoKey` text,
	`description` text,
	`slogan` varchar(255),
	`facebookUrl` varchar(500),
	`instagramUrl` varchar(500),
	`linkedinUrl` varchar(500),
	`twitterUrl` varchar(500),
	`isVisible` int NOT NULL DEFAULT 1,
	`displayOrder` int NOT NULL DEFAULT 0,
	`impressionCount` int NOT NULL DEFAULT 0,
	`clickCount` int NOT NULL DEFAULT 0,
	`contractStartDate` timestamp,
	`contractEndDate` timestamp,
	`contractDocument` text,
	`status` enum('pending','active','expired','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`),
	CONSTRAINT `partners_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(512) NOT NULL,
	`thumbnail` varchar(512),
	`title` varchar(255) NOT NULL,
	`description` text,
	`filename` varchar(255),
	`mimeType` varchar(100),
	`sizeBytes` int,
	`width` int,
	`height` int,
	`category` enum('portrait','event','backstage','performance','other') NOT NULL DEFAULT 'other',
	`tags` text,
	`candidateId` int,
	`uploadedBy` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professionals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('photographer','choreographer','jury') NOT NULL,
	`companyName` varchar(255),
	`specialties` text,
	`experience` text,
	`portfolio` text,
	`bio` text,
	`rate` int,
	`availability` text,
	`certifications` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `professionals_id` PRIMARY KEY(`id`),
	CONSTRAINT `professionals_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `profileEditTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`usedCount` int NOT NULL DEFAULT 0,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profileEditTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `profileEditTokens_token_unique` UNIQUE(`token`),
	CONSTRAINT `profile_token_token_idx` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `social_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contestId` int NOT NULL,
	`candidateId` int NOT NULL,
	`viewCount` int NOT NULL DEFAULT 0,
	`clickCount` int NOT NULL DEFAULT 0,
	`shareCount` int NOT NULL DEFAULT 0,
	`qrScanCount` int NOT NULL DEFAULT 0,
	`totalScore` int NOT NULL DEFAULT 0,
	`isClosed` int NOT NULL DEFAULT 0,
	`closedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracking_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contestId` int NOT NULL,
	`candidateId` int NOT NULL,
	`eventType` enum('view','click','share','qr_scan') NOT NULL,
	`fingerprint` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`referrer` text,
	`shareUrl` varchar(500),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tracking_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeCode` varchar(64) NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`isDisplayed` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL DEFAULT 1,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','candidate','press','photographer','staff','marketing','organizer','admin','super_admin','owner','jury','partner') NOT NULL DEFAULT 'user',
	`permissionOverrides` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `voteSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contestId` int NOT NULL,
	`sessionFingerprint` varchar(64) NOT NULL,
	`voterIp` varchar(45),
	`userId` int,
	`votesCount` int NOT NULL DEFAULT 0,
	`lastVoteAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `voteSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contestId` int NOT NULL,
	`candidateId` int NOT NULL,
	`userId` int,
	`voterIp` varchar(45),
	`voterFingerprint` varchar(64),
	`voterEmail` varchar(320),
	`voteCategory` varchar(100),
	`voteWeight` int NOT NULL DEFAULT 1,
	`isVerified` int NOT NULL DEFAULT 0,
	`verificationToken` varchar(64),
	`verifiedAt` timestamp,
	`userAgent` text,
	`referrer` varchar(500),
	`geoCountry` varchar(2),
	`geoCity` varchar(100),
	`isFraudulent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsappLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int,
	`phone` varchar(30) NOT NULL,
	`candidateName` varchar(200),
	`message` text NOT NULL,
	`templateType` varchar(50) DEFAULT 'custom',
	`messageId` varchar(100),
	`status` enum('sent','delivered','read','failed') NOT NULL DEFAULT 'sent',
	`errorMessage` text,
	`sentBy` int,
	`sentAt` bigint NOT NULL,
	`deliveredAt` bigint,
	`readAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsappLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `article_category_idx` ON `articles` (`category`);--> statement-breakpoint
CREATE INDEX `article_status_idx` ON `articles` (`status`);--> statement-breakpoint
CREATE INDEX `assets_sha256_idx` ON `assets` (`sha256`);--> statement-breakpoint
CREATE INDEX `assets_candidate_idx` ON `assets` (`candidateId`);--> statement-breakpoint
CREATE INDEX `assets_media_job_idx` ON `assets` (`mediaJobId`);--> statement-breakpoint
CREATE INDEX `audit_org_idx` ON `audit_logs` (`organizationId`);--> statement-breakpoint
CREATE INDEX `audit_actor_idx` ON `audit_logs` (`actorUserId`);--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_logs` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `badge_rarity_idx` ON `badges` (`rarity`);--> statement-breakpoint
CREATE INDEX `badge_category_idx` ON `badges` (`category`);--> statement-breakpoint
CREATE INDEX `candidateApplications_email_idx` ON `candidateApplications` (`email`);--> statement-breakpoint
CREATE INDEX `candidateApplications_status_idx` ON `candidateApplications` (`status`);--> statement-breakpoint
CREATE INDEX `candidateApplications_contest_idx` ON `candidateApplications` (`contestId`);--> statement-breakpoint
CREATE INDEX `cert_org_idx` ON `certificates` (`organizationId`);--> statement-breakpoint
CREATE INDEX `cert_hash_idx` ON `certificates` (`certificateHash`);--> statement-breakpoint
CREATE INDEX `ip_candidate_action_idx` ON `ip_tracking` (`ipHash`,`candidateId`,`actionType`);--> statement-breakpoint
CREATE INDEX `last_action_idx` ON `ip_tracking` (`lastActionAt`);--> statement-breakpoint
CREATE INDEX `knowledge_garden_doc_type_idx` ON `knowledge_garden` (`docType`);--> statement-breakpoint
CREATE INDEX `knowledge_garden_active_idx` ON `knowledge_garden` (`isActive`);--> statement-breakpoint
CREATE INDEX `media_jobs_candidate_idx` ON `media_jobs` (`candidateId`);--> statement-breakpoint
CREATE INDEX `media_jobs_status_idx` ON `media_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `media_jobs_created_at_idx` ON `media_jobs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `notif_event_type_idx` ON `notificationsLog` (`eventType`);--> statement-breakpoint
CREATE INDEX `notif_recipient_idx` ON `notificationsLog` (`recipientUserId`);--> statement-breakpoint
CREATE INDEX `notif_status_idx` ON `notificationsLog` (`status`);--> statement-breakpoint
CREATE INDEX `org_settings_idx` ON `organization_settings` (`organizationId`);--> statement-breakpoint
CREATE INDEX `benefit_partner_idx` ON `partner_benefits` (`partnerId`);--> statement-breakpoint
CREATE INDEX `partner_contest_idx` ON `partners` (`contestId`);--> statement-breakpoint
CREATE INDEX `partner_level_idx` ON `partners` (`level`);--> statement-breakpoint
CREATE INDEX `partner_status_idx` ON `partners` (`status`);--> statement-breakpoint
CREATE INDEX `photos_candidate_idx` ON `photos` (`candidateId`);--> statement-breakpoint
CREATE INDEX `photos_uploaded_by_idx` ON `photos` (`uploadedBy`);--> statement-breakpoint
CREATE INDEX `photos_status_idx` ON `photos` (`status`);--> statement-breakpoint
CREATE INDEX `photos_category_idx` ON `photos` (`category`);--> statement-breakpoint
CREATE INDEX `profile_token_candidate_idx` ON `profileEditTokens` (`candidateId`);--> statement-breakpoint
CREATE INDEX `user_badge_user_idx` ON `user_badges` (`userId`);--> statement-breakpoint
CREATE INDEX `user_badge_badge_idx` ON `user_badges` (`badgeCode`);--> statement-breakpoint
CREATE INDEX `unique_user_badge` ON `user_badges` (`userId`,`badgeCode`);--> statement-breakpoint
CREATE INDEX `user_org_idx` ON `users` (`organizationId`);--> statement-breakpoint
CREATE INDEX `wba_candidate_idx` ON `whatsappLogs` (`candidateId`);--> statement-breakpoint
CREATE INDEX `wba_status_idx` ON `whatsappLogs` (`status`);--> statement-breakpoint
CREATE INDEX `wba_sent_at_idx` ON `whatsappLogs` (`sentAt`);