CREATE SCHEMA "vs-map-tracker";
--> statement-breakpoint
CREATE TYPE "vs-map-tracker"."user_locale" AS ENUM('en', 'ru');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vs-map-tracker"."features" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text,
	"geometry" jsonb NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vs-map-tracker"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"login" varchar NOT NULL,
	"passwordHash" varchar NOT NULL,
	"locale" "vs-map-tracker"."user_locale" DEFAULT 'en',
	"uiLocale" "vs-map-tracker"."user_locale" DEFAULT 'en',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_login_unique" UNIQUE("login")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vs-map-tracker"."features" ADD CONSTRAINT "features_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "vs-map-tracker"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "features_id_pkey" ON "vs-map-tracker"."features" USING btree ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "creator_id_fk" ON "vs-map-tracker"."features" USING btree ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_id_pkey" ON "vs-map-tracker"."users" USING btree ("id");