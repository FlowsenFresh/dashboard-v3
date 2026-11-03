ALTER TABLE "benutzer" ADD COLUMN "ist_inhaber" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "benutzer" ADD COLUMN "darf_webseite" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "benutzer" ADD COLUMN "name" text;--> statement-breakpoint
-- Von Hand ergänzt: Wer bisher einen Laden-Login hatte, ist der Inhaber und darf alles.
UPDATE "benutzer" SET "ist_inhaber" = true, "darf_webseite" = true WHERE "rolle" = 'laden';
