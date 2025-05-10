CREATE TABLE "compliments" (
	"id" serial PRIMARY KEY NOT NULL,
	"give" varchar NOT NULL,
	"receive" varchar NOT NULL,
	"comment" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intros" (
	"userID" varchar PRIMARY KEY NOT NULL,
	"message" varchar NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "key_value" (
	"key" varchar PRIMARY KEY NOT NULL,
	"value" varchar
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userID" varchar NOT NULL,
	"medium" varchar(15) NOT NULL,
	"date" timestamp
);
--> statement-breakpoint
CREATE TABLE "strikes" (
	"id" serial PRIMARY KEY NOT NULL,
	"userID" varchar NOT NULL,
	"reason" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets_application" (
	"id" serial PRIMARY KEY NOT NULL,
	"userID" varchar NOT NULL,
	"channel" varchar,
	"opened" timestamp DEFAULT now() NOT NULL,
	"closed" timestamp,
	"reason" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "tickets_issue" (
	"id" serial PRIMARY KEY NOT NULL,
	"userID" varchar NOT NULL,
	"channel" varchar,
	"opened" timestamp DEFAULT now() NOT NULL,
	"closed" timestamp,
	"reason" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "tickets_misc" (
	"id" serial PRIMARY KEY NOT NULL,
	"userID" varchar NOT NULL,
	"channel" varchar,
	"opened" timestamp DEFAULT now() NOT NULL,
	"closed" timestamp,
	"reason" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"userID" text PRIMARY KEY NOT NULL,
	"name" varchar(35) NOT NULL,
	"displayname" varchar(35) NOT NULL,
	"primary" varchar(80) NOT NULL,
	"continent" varchar(80) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "compliments" ADD CONSTRAINT "compliments_give_users_userID_fk" FOREIGN KEY ("give") REFERENCES "public"."users"("userID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliments" ADD CONSTRAINT "compliments_receive_users_userID_fk" FOREIGN KEY ("receive") REFERENCES "public"."users"("userID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intros" ADD CONSTRAINT "intros_userID_users_userID_fk" FOREIGN KEY ("userID") REFERENCES "public"."users"("userID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userID_users_userID_fk" FOREIGN KEY ("userID") REFERENCES "public"."users"("userID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strikes" ADD CONSTRAINT "strikes_userID_users_userID_fk" FOREIGN KEY ("userID") REFERENCES "public"."users"("userID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets_application" ADD CONSTRAINT "tickets_application_userID_users_userID_fk" FOREIGN KEY ("userID") REFERENCES "public"."users"("userID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets_issue" ADD CONSTRAINT "tickets_issue_userID_users_userID_fk" FOREIGN KEY ("userID") REFERENCES "public"."users"("userID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets_misc" ADD CONSTRAINT "tickets_misc_userID_users_userID_fk" FOREIGN KEY ("userID") REFERENCES "public"."users"("userID") ON DELETE no action ON UPDATE no action;