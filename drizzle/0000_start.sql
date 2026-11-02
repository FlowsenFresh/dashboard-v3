CREATE TYPE "public"."nachricht_status" AS ENUM('neu', 'gelesen', 'beantwortet');--> statement-breakpoint
CREATE TABLE "kontakte" (
	"id" serial PRIMARY KEY NOT NULL,
	"laden_id" integer NOT NULL,
	"vorname" text NOT NULL,
	"nachname" text NOT NULL,
	"email" text,
	"telefon" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "laeden" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"termine_aufbewahren_monate" integer DEFAULT 24 NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "laeden_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "nachrichten" (
	"id" serial PRIMARY KEY NOT NULL,
	"laden_id" integer NOT NULL,
	"kontakt_id" integer NOT NULL,
	"anliegen" text,
	"betreff" text NOT NULL,
	"inhalt" text,
	"wunsch_datum" date,
	"wunsch_zeit" time,
	"status" "nachricht_status" DEFAULT 'neu' NOT NULL,
	"eingegangen_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "termine" (
	"id" serial PRIMARY KEY NOT NULL,
	"laden_id" integer NOT NULL,
	"kontakt_id" integer NOT NULL,
	"auftragsnummer" integer NOT NULL,
	"datum" date NOT NULL,
	"titel" text NOT NULL,
	"notiz" text,
	"erledigt" boolean DEFAULT false NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kontakte" ADD CONSTRAINT "kontakte_laden_id_laeden_id_fk" FOREIGN KEY ("laden_id") REFERENCES "public"."laeden"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nachrichten" ADD CONSTRAINT "nachrichten_laden_id_laeden_id_fk" FOREIGN KEY ("laden_id") REFERENCES "public"."laeden"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nachrichten" ADD CONSTRAINT "nachrichten_kontakt_id_kontakte_id_fk" FOREIGN KEY ("kontakt_id") REFERENCES "public"."kontakte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "termine" ADD CONSTRAINT "termine_laden_id_laeden_id_fk" FOREIGN KEY ("laden_id") REFERENCES "public"."laeden"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "termine" ADD CONSTRAINT "termine_kontakt_id_kontakte_id_fk" FOREIGN KEY ("kontakt_id") REFERENCES "public"."kontakte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kontakte_laden_idx" ON "kontakte" USING btree ("laden_id");--> statement-breakpoint
CREATE INDEX "nachrichten_laden_idx" ON "nachrichten" USING btree ("laden_id","eingegangen_am");--> statement-breakpoint
CREATE INDEX "termine_laden_idx" ON "termine" USING btree ("laden_id","datum");