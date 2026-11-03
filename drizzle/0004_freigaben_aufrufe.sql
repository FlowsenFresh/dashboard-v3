CREATE TABLE "aufrufe" (
	"laden_id" integer NOT NULL,
	"tag" date NOT NULL,
	"anzahl" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "aufrufe_laden_id_tag_pk" PRIMARY KEY("laden_id","tag")
);
--> statement-breakpoint
CREATE TABLE "freigaben" (
	"id" serial PRIMARY KEY NOT NULL,
	"laden_id" integer NOT NULL,
	"code_hash" text NOT NULL,
	"code_gueltig_bis" timestamp with time zone NOT NULL,
	"fehlversuche" integer DEFAULT 0 NOT NULL,
	"eingeloest_am" timestamp with time zone,
	"zugriff_bis" timestamp with time zone,
	"beendet_am" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aufrufe" ADD CONSTRAINT "aufrufe_laden_id_laeden_id_fk" FOREIGN KEY ("laden_id") REFERENCES "public"."laeden"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freigaben" ADD CONSTRAINT "freigaben_laden_id_laeden_id_fk" FOREIGN KEY ("laden_id") REFERENCES "public"."laeden"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "freigaben_laden_idx" ON "freigaben" USING btree ("laden_id","erstellt_am");