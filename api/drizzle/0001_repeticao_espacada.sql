ALTER TABLE "cartoes" ADD COLUMN "facilidade" real DEFAULT 2.5 NOT NULL;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "intervalo_dias" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "repeticoes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "cartoes" ADD COLUMN "proxima_revisao" timestamp DEFAULT now() NOT NULL;