CREATE TABLE "baralhos" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"idioma_id" integer NOT NULL,
	"titulo" varchar(80) NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"nivel" varchar(2) DEFAULT 'A1' NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cartoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"baralho_id" integer NOT NULL,
	"frente" varchar(200) NOT NULL,
	"verso" varchar(200) NOT NULL,
	"exemplo" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idiomas" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"nome" varchar(60) NOT NULL,
	"codigo" varchar(10) NOT NULL,
	"bandeira" varchar(16) DEFAULT '🌐' NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessoes_estudo" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"baralho_id" integer NOT NULL,
	"acertos" integer DEFAULT 0 NOT NULL,
	"erros" integer DEFAULT 0 NOT NULL,
	"duracao_segundos" integer DEFAULT 0 NOT NULL,
	"realizada_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(80) NOT NULL,
	"email" varchar(120) NOT NULL,
	"senha_hash" text NOT NULL,
	"versao_token" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "baralhos" ADD CONSTRAINT "baralhos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baralhos" ADD CONSTRAINT "baralhos_idioma_id_idiomas_id_fk" FOREIGN KEY ("idioma_id") REFERENCES "public"."idiomas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_baralho_id_baralhos_id_fk" FOREIGN KEY ("baralho_id") REFERENCES "public"."baralhos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idiomas" ADD CONSTRAINT "idiomas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes_estudo" ADD CONSTRAINT "sessoes_estudo_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes_estudo" ADD CONSTRAINT "sessoes_estudo_baralho_id_baralhos_id_fk" FOREIGN KEY ("baralho_id") REFERENCES "public"."baralhos"("id") ON DELETE cascade ON UPDATE no action;