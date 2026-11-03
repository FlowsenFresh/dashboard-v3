ALTER TABLE "laeden" ADD COLUMN "branche" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "slogan" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "beschreibung" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "farbe" text;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "strasse" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "plz_ort" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "telefon" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "hinweis_zeiten" text;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "leistungen" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "oeffnungszeiten" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "anliegen" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "laeden" ADD COLUMN "ueber_uns" jsonb;