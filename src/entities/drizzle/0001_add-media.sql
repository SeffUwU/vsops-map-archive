CREATE TABLE IF NOT EXISTS "vs-map-tracker"."media" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"data" "bytea",
	"mime_type" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vs-map-tracker"."media" ADD CONSTRAINT "media_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "vs-map-tracker"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
