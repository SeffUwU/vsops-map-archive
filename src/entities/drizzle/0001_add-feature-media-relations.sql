-- Migration: Add feature-media relations and migrate existing data
-- This migration:
-- 1. Adds feature_id column to media table
-- 2. Extracts image IDs from feature.properties.images (comma-separated string)
-- 3. Links existing media records to their features
-- 4. Sets used=true for linked media
--
-- IMPORTANT: Run this migration on a backup first!

PRAGMA foreign_keys=OFF;--> statement-breakpoint

-- Step 1: Recreate features table to ensure schema is correct
CREATE TABLE `__new_features` (
	`id` text PRIMARY KEY NOT NULL,
	`creator_id` text,
	`geometry` text NOT NULL,
	`properties` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_features`("id", "creator_id", "geometry", "properties", "created_at", "updated_at") SELECT "id", "creator_id", "geometry", "properties", "created_at", "updated_at" FROM `features`;--> statement-breakpoint
DROP TABLE `features`;--> statement-breakpoint
ALTER TABLE `__new_features` RENAME TO `features`;--> statement-breakpoint

-- Recreate indexes
CREATE INDEX `features_creator_id_idx` ON `features` (`creator_id`);--> statement-breakpoint

-- Step 2: Add feature_id column to media table
ALTER TABLE `media` ADD `feature_id` text REFERENCES features(id);--> statement-breakpoint

-- Create indexes for the new column
CREATE INDEX `media_feature_id_idx` ON `media` (`feature_id`);--> statement-breakpoint
CREATE INDEX `media_user_id_idx` ON `media` (`user_id`);--> statement-breakpoint

-- Step 3: Migrate existing media records
-- We need to parse comma-separated image IDs from properties.images
-- SQLite doesn't have great string splitting, so we'll use recursive CTE

-- Create a temporary table to hold the parsed relationships
CREATE TEMPORARY TABLE `temp_feature_images` (
	`feature_id` text NOT NULL,
	`image_id` text NOT NULL
);--> statement-breakpoint

-- Parse comma-separated image IDs using recursive CTE
-- This handles: "id1", "id1,id2", "id1,id2,id3", etc.
WITH RECURSIVE
-- First, extract the images string from properties
feature_images AS (
	SELECT 
		`id` as `feature_id`,
		json_extract(`properties`, '$.images') as `images_str`
	FROM `features`
	WHERE json_valid(`properties`)
	  AND json_extract(`properties`, '$.images') IS NOT NULL
	  AND json_extract(`properties`, '$.images') != ''
),
-- Split comma-separated values using recursive CTE
split(feature_id, image_id, remaining) AS (
	-- Base case: extract first ID and remaining string
	SELECT 
		`feature_id`,
		CASE 
			WHEN INSTR(`images_str`, ',') > 0 THEN TRIM(SUBSTR(`images_str`, 1, INSTR(`images_str`, ',') - 1))
			ELSE TRIM(`images_str`)
		END,
		CASE 
			WHEN INSTR(`images_str`, ',') > 0 THEN TRIM(SUBSTR(`images_str`, INSTR(`images_str`, ',') + 1))
			ELSE ''
		END
	FROM `feature_images`
	
	UNION ALL
	
	-- Recursive case: continue splitting remaining string
	SELECT 
		`feature_id`,
		CASE 
			WHEN INSTR(`remaining`, ',') > 0 THEN TRIM(SUBSTR(`remaining`, 1, INSTR(`remaining`, ',') - 1))
			ELSE TRIM(`remaining`)
		END,
		CASE 
			WHEN INSTR(`remaining`, ',') > 0 THEN TRIM(SUBSTR(`remaining`, INSTR(`remaining`, ',') + 1))
			ELSE ''
		END
	FROM `split`
	WHERE `remaining` != ''
)
-- Insert parsed relationships into temp table
INSERT INTO `temp_feature_images` (`feature_id`, `image_id`)
SELECT `feature_id`, `image_id`
FROM `split`
WHERE `image_id` != '';--> statement-breakpoint

-- Link media to features using the temp table
UPDATE `media`
SET `feature_id` = (
	SELECT `temp_feature_images`.`feature_id`
	FROM `temp_feature_images`
	WHERE `temp_feature_images`.`image_id` = `media`.`id`
	LIMIT 1
)
WHERE `media`.`id` IN (SELECT `image_id` FROM `temp_feature_images`);--> statement-breakpoint

-- Drop the temp table
DROP TABLE `temp_feature_images`;--> statement-breakpoint

-- Step 4: Update used flag for linked media
UPDATE `media`
SET `used` = 1
WHERE `feature_id` IS NOT NULL
  AND `used` = 0;--> statement-breakpoint

PRAGMA foreign_keys=ON;
