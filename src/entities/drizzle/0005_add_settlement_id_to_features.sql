ALTER TABLE `features` ADD `settlement_id` text REFERENCES settlements(id);--> statement-breakpoint
CREATE INDEX `features_settlement_id_idx` ON `features` (`settlement_id`);