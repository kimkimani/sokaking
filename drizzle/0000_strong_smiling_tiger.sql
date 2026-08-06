CREATE TABLE "jackpot_fixtures" (
	"id" serial PRIMARY KEY NOT NULL,
	"jackpot_id" text NOT NULL,
	"fixture_number" integer NOT NULL,
	"home_team" text NOT NULL,
	"away_team" text NOT NULL,
	"prediction" text NOT NULL,
	"result" text DEFAULT 'pending' NOT NULL,
	"status" text DEFAULT 'NS' NOT NULL,
	"kickoff_time" text NOT NULL,
	"league_name" text NOT NULL,
	"league_flag" text,
	"country_name" text,
	"home_score" text,
	"away_score" text,
	"confidence" integer NOT NULL,
	"ai_analysis" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jackpots" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"games_count" integer NOT NULL,
	"price" integer NOT NULL,
	"estimated_pool" text NOT NULL,
	"next_game_start_time" text NOT NULL,
	"submissions_fill" text NOT NULL,
	"premium_count" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpesa_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"checkout_request_id" text NOT NULL,
	"merchant_request_id" text NOT NULL,
	"phone_number" text NOT NULL,
	"amount" integer NOT NULL,
	"item_type" text NOT NULL,
	"item_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"mpesa_receipt_number" text,
	"result_desc" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "mpesa_transactions_checkout_request_id_unique" UNIQUE("checkout_request_id")
);
--> statement-breakpoint
CREATE TABLE "odds_packs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tag" text NOT NULL,
	"price" integer NOT NULL,
	"duration_days" integer NOT NULL,
	"picks_per_day" integer NOT NULL,
	"odds_min_decimal" text NOT NULL,
	"description" text NOT NULL,
	"color" text NOT NULL,
	"risk_level" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"home_team" text NOT NULL,
	"away_team" text NOT NULL,
	"prediction" text NOT NULL,
	"result" text NOT NULL,
	"status" text NOT NULL,
	"kickoff_time" text NOT NULL,
	"league_name" text NOT NULL,
	"league_flag" text,
	"country_name" text,
	"home_score" text,
	"away_score" text,
	"confidence" integer NOT NULL,
	"ai_analysis" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"item_type" text NOT NULL,
	"item_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "vip_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"duration_days" integer NOT NULL,
	"description" text NOT NULL,
	"features" jsonb NOT NULL,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "jackpot_fixtures" ADD CONSTRAINT "jackpot_fixtures_jackpot_id_jackpots_id_fk" FOREIGN KEY ("jackpot_id") REFERENCES "public"."jackpots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpesa_transactions" ADD CONSTRAINT "mpesa_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "fixtures" (
	"fixture_id" text PRIMARY KEY NOT NULL,
	"date" timestamp,
	"status_short" text,
	"status_long" text,
	"status_elapsed" integer,
	"home_red_cards_count" integer,
	"away_red_cards_count" integer,
	"home_team_id" integer,
	"away_team_id" integer,
	"home_team_name" text,
	"away_team_name" text,
	"home_team_logo" text,
	"away_team_logo" text,
	"league_id" integer,
	"league_name" text,
	"league_type" text,
	"league_logo" text,
	"league_country" text,
	"country_flag" text,
	"popular_status" integer,
	"prediction_type" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fixture_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"fixture_ref" text NOT NULL,
	"fulltime_home" integer,
	"fulltime_away" integer,
	"halftime_home" integer,
	"halftime_away" integer,
	"extratime_home" integer,
	"extratime_away" integer,
	"penalty_home" integer,
	"penalty_away" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prediction_probabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"fixture_ref" text NOT NULL,
	"percent_pred_home" text,
	"percent_pred_draw" text,
	"percent_pred_away" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "betika_midweek_jackpot" (
	"id" serial PRIMARY KEY NOT NULL,
	"jackpot_name" text NOT NULL,
	"fixture_ref" text NOT NULL,
	"jackpot_position" integer,
	"jackpot_tip" text,
	"status_short" text,
	"status_long" text,
	"full_time_home" integer,
	"full_time_away" integer,
	"home_team_id" integer,
	"away_team_id" integer,
	"home_team_name" text,
	"away_team_name" text,
	"home_team_logo" text,
	"away_team_logo" text,
	"league_name" text,
	"country_name" text,
	"country_flag" text,
	"date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "betpawa_pick13_jackpot" (
	"id" serial PRIMARY KEY NOT NULL,
	"jackpot_name" text NOT NULL,
	"fixture_ref" text NOT NULL,
	"jackpot_position" integer,
	"jackpot_tip" text,
	"status_short" text,
	"status_long" text,
	"full_time_home" integer,
	"full_time_away" integer,
	"home_team_id" integer,
	"away_team_id" integer,
	"home_team_name" text,
	"away_team_name" text,
	"home_team_logo" text,
	"away_team_logo" text,
	"league_name" text,
	"country_name" text,
	"country_flag" text,
	"date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mozzart_bet_grand_jackpot" (
	"id" serial PRIMARY KEY NOT NULL,
	"jackpot_name" text NOT NULL,
	"fixture_ref" text NOT NULL,
	"jackpot_position" integer,
	"jackpot_tip" text,
	"status_short" text,
	"status_long" text,
	"full_time_home" integer,
	"full_time_away" integer,
	"home_team_id" integer,
	"away_team_id" integer,
	"home_team_name" text,
	"away_team_name" text,
	"home_team_logo" text,
	"away_team_logo" text,
	"league_name" text,
	"country_name" text,
	"country_flag" text,
	"date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mozzart_super_daily" (
	"id" serial PRIMARY KEY NOT NULL,
	"jackpot_name" text NOT NULL,
	"fixture_ref" text NOT NULL,
	"jackpot_position" integer,
	"jackpot_tip" text,
	"status_short" text,
	"status_long" text,
	"full_time_home" integer,
	"full_time_away" integer,
	"home_team_id" integer,
	"away_team_id" integer,
	"home_team_name" text,
	"away_team_name" text,
	"home_team_logo" text,
	"away_team_logo" text,
	"league_name" text,
	"country_name" text,
	"country_flag" text,
	"date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "odibet_laki_tatu" (
	"id" serial PRIMARY KEY NOT NULL,
	"jackpot_name" text NOT NULL,
	"fixture_ref" text NOT NULL,
	"jackpot_position" integer,
	"jackpot_tip" text,
	"status_short" text,
	"status_long" text,
	"full_time_home" integer,
	"full_time_away" integer,
	"home_team_id" integer,
	"away_team_id" integer,
	"home_team_name" text,
	"away_team_name" text,
	"home_team_logo" text,
	"away_team_logo" text,
	"league_name" text,
	"country_name" text,
	"country_flag" text,
	"date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sportpesa_mega_jackpot" (
	"id" serial PRIMARY KEY NOT NULL,
	"jackpot_name" text NOT NULL,
	"fixture_ref" text NOT NULL,
	"jackpot_position" integer,
	"jackpot_tip" text,
	"status_short" text,
	"status_long" text,
	"full_time_home" integer,
	"full_time_away" integer,
	"home_team_id" integer,
	"away_team_id" integer,
	"home_team_name" text,
	"away_team_name" text,
	"home_team_logo" text,
	"away_team_logo" text,
	"league_name" text,
	"country_name" text,
	"country_flag" text,
	"date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sportpesa_midweek_jackpot" (
	"id" serial PRIMARY KEY NOT NULL,
	"jackpot_name" text NOT NULL,
	"fixture_ref" text NOT NULL,
	"jackpot_position" integer,
	"jackpot_tip" text,
	"status_short" text,
	"status_long" text,
	"full_time_home" integer,
	"full_time_away" integer,
	"home_team_id" integer,
	"away_team_id" integer,
	"home_team_name" text,
	"away_team_name" text,
	"home_team_logo" text,
	"away_team_logo" text,
	"league_name" text,
	"country_name" text,
	"country_flag" text,
	"date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sportybet_jackpot" (
	"id" serial PRIMARY KEY NOT NULL,
	"jackpot_name" text NOT NULL,
	"fixture_ref" text NOT NULL,
	"jackpot_position" integer,
	"jackpot_tip" text,
	"status_short" text,
	"status_long" text,
	"full_time_home" integer,
	"full_time_away" integer,
	"home_team_id" integer,
	"away_team_id" integer,
	"home_team_name" text,
	"away_team_name" text,
	"home_team_logo" text,
	"away_team_logo" text,
	"league_name" text,
	"country_name" text,
	"country_flag" text,
	"date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "fixture_scores" ADD CONSTRAINT "fixture_scores_fixture_ref_fixtures_fixture_id_fk" FOREIGN KEY ("fixture_ref") REFERENCES "public"."fixtures"("fixture_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "prediction_probabilities" ADD CONSTRAINT "prediction_probabilities_fixture_ref_fixtures_fixture_id_fk" FOREIGN KEY ("fixture_ref") REFERENCES "public"."fixtures"("fixture_id") ON DELETE cascade ON UPDATE no action;
