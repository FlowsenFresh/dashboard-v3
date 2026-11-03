CREATE TYPE "public"."benutzer_rolle" AS ENUM('admin', 'laden');--> statement-breakpoint
CREATE TABLE "benutzer" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"passwort_hash" text NOT NULL,
	"rolle" "benutzer_rolle" DEFAULT 'laden' NOT NULL,
	"laden_id" integer,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "benutzer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sitzungen" (
	"id" text PRIMARY KEY NOT NULL,
	"benutzer_id" integer NOT NULL,
	"laeuft_ab_am" timestamp with time zone NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "benutzer" ADD CONSTRAINT "benutzer_laden_id_laeden_id_fk" FOREIGN KEY ("laden_id") REFERENCES "public"."laeden"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sitzungen" ADD CONSTRAINT "sitzungen_benutzer_id_benutzer_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."benutzer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sitzungen_benutzer_idx" ON "sitzungen" USING btree ("benutzer_id");