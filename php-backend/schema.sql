-- SOKA Predictions - MySQL Database Dump for cheerplex.co.ke/soka_king
-- Database: `cheerple_soka_king`

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

--
-- Table structure for table `betika_midweek_jackpot`
--

CREATE TABLE IF NOT EXISTS `betika_midweek_jackpot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jackpot_name` varchar(255) DEFAULT NULL,
  `fixture_ref` varchar(255) DEFAULT NULL,
  `jackpot_position` int(11) DEFAULT NULL,
  `jackpot_tip` varchar(255) DEFAULT NULL,
  `status_short` varchar(255) DEFAULT NULL,
  `status_long` varchar(255) DEFAULT NULL,
  `full_time_home` int(11) DEFAULT NULL,
  `full_time_away` int(11) DEFAULT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `home_team_name` varchar(255) DEFAULT NULL,
  `away_team_name` varchar(255) DEFAULT NULL,
  `home_team_logo` varchar(255) DEFAULT NULL,
  `away_team_logo` varchar(255) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `country_name` varchar(100) DEFAULT NULL,
  `country_flag` varchar(250) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `ai_analysis` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `betpawa_pick13_jackpot`
--

CREATE TABLE IF NOT EXISTS `betpawa_pick13_jackpot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jackpot_name` varchar(255) DEFAULT NULL,
  `fixture_ref` varchar(255) DEFAULT NULL,
  `jackpot_position` int(11) DEFAULT NULL,
  `jackpot_tip` varchar(255) DEFAULT NULL,
  `status_short` varchar(255) DEFAULT NULL,
  `status_long` varchar(255) DEFAULT NULL,
  `full_time_home` datetime DEFAULT NULL,
  `full_time_away` datetime DEFAULT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `home_team_name` varchar(255) DEFAULT NULL,
  `away_team_name` varchar(255) DEFAULT NULL,
  `home_team_logo` varchar(255) DEFAULT NULL,
  `away_team_logo` varchar(255) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `country_name` varchar(100) DEFAULT NULL,
  `country_flag` varchar(250) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `ai_analysis` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` varchar(50) DEFAULT 'new',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fixtures`
--

CREATE TABLE IF NOT EXISTS `fixtures` (
  `fixture_id` varchar(255) NOT NULL,
  `date` datetime DEFAULT NULL,
  `status_short` varchar(255) DEFAULT NULL,
  `status_long` varchar(255) DEFAULT NULL,
  `status_elapsed` int(11) DEFAULT NULL,
  `home_red_cards_count` int(11) DEFAULT NULL,
  `away_red_cards_count` int(11) DEFAULT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `home_team_name` varchar(255) DEFAULT NULL,
  `away_team_name` varchar(255) DEFAULT NULL,
  `home_team_logo` varchar(255) DEFAULT NULL,
  `away_team_logo` varchar(255) DEFAULT NULL,
  `league_id` int(11) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `league_type` varchar(255) DEFAULT NULL,
  `league_logo` varchar(255) DEFAULT NULL,
  `league_country` varchar(100) DEFAULT NULL,
  `country_flag` varchar(255) DEFAULT NULL,
  `popular_status` int(11) DEFAULT NULL,
  `prediction_type` varchar(255) DEFAULT NULL,
  `ai_analysis` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`fixture_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fixture_scores`
--

CREATE TABLE IF NOT EXISTS `fixture_scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fixture_ref` varchar(255) DEFAULT NULL,
  `fulltime_home` int(11) DEFAULT NULL,
  `fulltime_away` int(11) DEFAULT NULL,
  `halftime_home` int(11) DEFAULT NULL,
  `halftime_away` int(11) DEFAULT NULL,
  `extratime_home` datetime DEFAULT NULL,
  `extratime_away` datetime DEFAULT NULL,
  `penalty_home` varchar(255) DEFAULT NULL,
  `penalty_away` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jackpots`
--

CREATE TABLE IF NOT EXISTS `jackpots` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `games_count` int(11) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `estimated_pool` varchar(255) DEFAULT NULL,
  `next_game_start_time` datetime DEFAULT NULL,
  `submissions_fill` varchar(255) DEFAULT NULL,
  `premium_count` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mozzart_bet_grand_jackpot`
--

CREATE TABLE IF NOT EXISTS `mozzart_bet_grand_jackpot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jackpot_name` varchar(255) DEFAULT NULL,
  `fixture_ref` varchar(255) DEFAULT NULL,
  `jackpot_position` int(11) DEFAULT NULL,
  `jackpot_tip` varchar(255) DEFAULT NULL,
  `status_short` varchar(255) DEFAULT NULL,
  `status_long` varchar(255) DEFAULT NULL,
  `full_time_home` datetime DEFAULT NULL,
  `full_time_away` datetime DEFAULT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `home_team_name` varchar(255) DEFAULT NULL,
  `away_team_name` varchar(255) DEFAULT NULL,
  `home_team_logo` varchar(255) DEFAULT NULL,
  `away_team_logo` varchar(255) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `country_name` varchar(100) DEFAULT NULL,
  `country_flag` varchar(250) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `ai_analysis` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mozzart_super_daily`
--

CREATE TABLE IF NOT EXISTS `mozzart_super_daily` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jackpot_name` varchar(255) DEFAULT NULL,
  `fixture_ref` varchar(255) DEFAULT NULL,
  `jackpot_position` int(11) DEFAULT NULL,
  `jackpot_tip` varchar(255) DEFAULT NULL,
  `status_short` varchar(255) DEFAULT NULL,
  `status_long` varchar(255) DEFAULT NULL,
  `full_time_home` int(11) DEFAULT NULL,
  `full_time_away` int(11) DEFAULT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `home_team_name` varchar(255) DEFAULT NULL,
  `away_team_name` varchar(255) DEFAULT NULL,
  `home_team_logo` varchar(255) DEFAULT NULL,
  `away_team_logo` varchar(255) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `country_name` varchar(100) DEFAULT NULL,
  `country_flag` varchar(250) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `ai_analysis` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mpesa_transactions`
--

CREATE TABLE IF NOT EXISTS `mpesa_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `checkout_request_id` varchar(255) NOT NULL,
  `merchant_request_id` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `amount` int(11) NOT NULL,
  `item_type` varchar(255) NOT NULL,
  `item_id` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT 'pending',
  `mpesa_receipt_number` varchar(255) DEFAULT NULL,
  `result_desc` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `checkout_request_id` (`checkout_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `odds_packs`
--

CREATE TABLE IF NOT EXISTS `odds_packs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `duration_days` int(11) DEFAULT NULL,
  `picks_per_day` int(11) DEFAULT NULL,
  `odds_min_decimal` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `risk_level` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `odibet_laki_tatu`
--

CREATE TABLE IF NOT EXISTS `odibet_laki_tatu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jackpot_name` varchar(255) DEFAULT NULL,
  `fixture_ref` varchar(255) DEFAULT NULL,
  `jackpot_position` int(11) DEFAULT NULL,
  `jackpot_tip` varchar(255) DEFAULT NULL,
  `status_short` varchar(255) DEFAULT NULL,
  `status_long` varchar(255) DEFAULT NULL,
  `full_time_home` datetime DEFAULT NULL,
  `full_time_away` datetime DEFAULT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `home_team_name` varchar(255) DEFAULT NULL,
  `away_team_name` varchar(255) DEFAULT NULL,
  `home_team_logo` varchar(255) DEFAULT NULL,
  `away_team_logo` varchar(255) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `country_name` varchar(100) DEFAULT NULL,
  `country_flag` varchar(250) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `ai_analysis` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE IF NOT EXISTS `partners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `url` text NOT NULL,
  `anchor_text` text NOT NULL,
  `description` text DEFAULT NULL,
  `category` text NOT NULL,
  `logo_url` text DEFAULT NULL,
  `is_dofollow` tinyint(1) NOT NULL DEFAULT 1,
  `rel` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `external_links`
--

CREATE TABLE IF NOT EXISTS `external_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `anchor_text` varchar(255) NOT NULL,
  `url` varchar(500) NOT NULL,
  `rel` varchar(50) NOT NULL DEFAULT 'dofollow',
  `is_dofollow` tinyint(1) NOT NULL DEFAULT 1,
  `tag` varchar(100) DEFAULT 'Football Predictions',
  `target` varchar(20) NOT NULL DEFAULT '_blank',
  `description` text DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `external_links`
--

INSERT INTO `external_links` (`id`, `anchor_text`, `url`, `rel`, `is_dofollow`, `tag`, `target`, `description`, `order_index`, `is_active`) VALUES
(1, 'Sokapedia Football Predictions', 'https://sokapedia.com/', 'dofollow', 1, 'Football Predictions', '_blank', 'Expert match previews, team form metrics, and daily football predictions.', 1, 1),
(2, 'Betwinner360 Predictions & Jackpot Tips', 'https://betwinner360.com/', 'dofollow', 1, 'Jackpot Tips', '_blank', 'Accurate SportPesa, Betika Midweek and weekend mega jackpot selections.', 2, 1),
(3, 'Forebet Mathematical Football Predictions', 'https://www.forebet.com/', 'dofollow', 1, 'AI Predictions', '_blank', 'Mathematical football predictions and statistical analysis algorithms.', 3, 1),
(4, 'Cheerplex Soccer Predictions Today', 'https://cheerplex.co.ke/', 'dofollow', 1, 'Daily Tips', '_blank', 'East Africa premier soccer tips, 254 sure predictions, and 1X2 slips.', 4, 1),
(5, 'Sunpel Soccer Predictions & Tips', 'https://sunpel.com/', 'dofollow', 1, 'Daily Tips', '_blank', 'Free daily betting tips, over/under goal guides, and European fixtures.', 5, 1),
(6, 'Victorspredict Football Betting Tips', 'https://victorspredict.com/', 'dofollow', 1, 'Football Predictions', '_blank', 'Free banker bets, double chance, and accumulator combination tips.', 6, 1),
(7, 'Windrawwin Football Predictions & Stats', 'https://www.windrawwin.com/', 'dofollow', 1, 'Stats & Analysis', '_blank', 'Free football predictions, betting statistics, football results and league tables.', 7, 1),
(8, 'Statarea Soccer Facts & Predictions', 'https://www.statarea.com/', 'dofollow', 1, 'Stats & Analysis', '_blank', 'In-depth league trends, head-to-head records, and historical comparisons.', 8, 1),
(9, 'Vitibet Free Football Tips & Tables', 'https://www.vitibet.com/', 'dofollow', 1, 'Football Predictions', '_blank', 'Daily football betting tips, index-based mathematical predictions and tables.', 9, 1),
(10, 'Flashscore Live Football Scores', 'https://www.flashscore.com/', 'nofollow', 0, 'Live Scores', '_blank', 'Real-time live soccer scores, goal notifications, and match stats.', 10, 1),
(11, 'LiveScore Real-time Sports Results', 'https://www.livescore.com/', 'nofollow', 0, 'Live Scores', '_blank', 'Instant scores and sports updates covering football competitions worldwide.', 11, 1),
(12, 'SportPesa Kenya Official Portal', 'https://www.sportpesa.co.ke/', 'nofollow', 0, 'Bookmakers', '_blank', 'SportPesa Kenya licensed betting company and mega jackpot host.', 12, 1),
(13, 'Betika Kenya Sports Betting', 'https://www.betika.com/', 'nofollow', 0, 'Bookmakers', '_blank', 'Betika Kenya licensed sports wagering and midweek jackpot provider.', 13, 1),
(14, 'MozzartBet Kenya Grand Jackpot', 'https://www.mozzartbet.co.ke/', 'nofollow', 0, 'Bookmakers', '_blank', 'Mozzart Bet Kenya daily super jackpot and grand jackpot gaming platform.', 14, 1);


-- --------------------------------------------------------

--
-- Table structure for table `prediction_probabilities`
--

CREATE TABLE IF NOT EXISTS `prediction_probabilities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fixture_ref` varchar(255) DEFAULT NULL,
  `percent_pred_home` varchar(255) DEFAULT NULL,
  `percent_pred_draw` varchar(255) DEFAULT NULL,
  `percent_pred_away` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prediction_votes`
--

CREATE TABLE IF NOT EXISTS `prediction_votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fixture_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `vote` varchar(32) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_fixture` (`fixture_id`),
  UNIQUE KEY `uniq_fixture_user` (`fixture_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fixture_vote_counts`
--

CREATE TABLE IF NOT EXISTS `fixture_vote_counts` (
  `fixture_id` varchar(255) NOT NULL,
  `votes_1` int(11) NOT NULL DEFAULT 0,
  `votes_x` int(11) NOT NULL DEFAULT 0,
  `votes_2` int(11) NOT NULL DEFAULT 0,
  `total_votes` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`fixture_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE IF NOT EXISTS `purchases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_type` varchar(255) NOT NULL,
  `item_id` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `site_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(255) DEFAULT NULL,
  `telegram` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sportpesa_mega_jackpot`
--

CREATE TABLE IF NOT EXISTS `sportpesa_mega_jackpot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jackpot_name` varchar(255) DEFAULT NULL,
  `fixture_ref` varchar(255) DEFAULT NULL,
  `jackpot_position` int(11) DEFAULT NULL,
  `jackpot_tip` varchar(255) DEFAULT NULL,
  `status_short` varchar(255) DEFAULT NULL,
  `status_long` varchar(255) DEFAULT NULL,
  `full_time_home` datetime DEFAULT NULL,
  `full_time_away` datetime DEFAULT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `home_team_name` varchar(255) DEFAULT NULL,
  `away_team_name` varchar(255) DEFAULT NULL,
  `home_team_logo` varchar(255) DEFAULT NULL,
  `away_team_logo` varchar(255) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `country_name` int(11) DEFAULT NULL,
  `country_flag` int(11) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `ai_analysis` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sportpesa_midweek_jackpot`
--

CREATE TABLE IF NOT EXISTS `sportpesa_midweek_jackpot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jackpot_name` varchar(255) DEFAULT NULL,
  `fixture_ref` varchar(255) DEFAULT NULL,
  `jackpot_position` int(11) DEFAULT NULL,
  `jackpot_tip` varchar(255) DEFAULT NULL,
  `status_short` varchar(255) DEFAULT NULL,
  `status_long` varchar(255) DEFAULT NULL,
  `full_time_home` datetime DEFAULT NULL,
  `full_time_away` datetime DEFAULT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `home_team_name` varchar(255) DEFAULT NULL,
  `away_team_name` varchar(255) DEFAULT NULL,
  `home_team_logo` varchar(255) DEFAULT NULL,
  `away_team_logo` varchar(255) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `country_name` varchar(100) DEFAULT NULL,
  `country_flag` varchar(250) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `ai_analysis` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sportybet_jackpot`
--

CREATE TABLE IF NOT EXISTS `sportybet_jackpot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jackpot_name` varchar(255) DEFAULT NULL,
  `fixture_ref` varchar(255) DEFAULT NULL,
  `jackpot_position` int(11) DEFAULT NULL,
  `jackpot_tip` varchar(255) DEFAULT NULL,
  `status_short` varchar(255) DEFAULT NULL,
  `status_long` varchar(255) DEFAULT NULL,
  `full_time_home` varchar(50) DEFAULT NULL,
  `full_time_away` varchar(50) DEFAULT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `home_team_name` varchar(255) DEFAULT NULL,
  `away_team_name` varchar(255) DEFAULT NULL,
  `home_team_logo` varchar(255) DEFAULT NULL,
  `away_team_logo` varchar(255) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `country_name` varchar(100) DEFAULT NULL,
  `country_flag` varchar(250) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `ai_analysis` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vip_packages`
--

CREATE TABLE IF NOT EXISTS `vip_packages` (
  `id` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `duration_days` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `features` text DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- SEED DATA INSERTS
-- --------------------------------------------------------

-- Jackpots Overview
INSERT INTO `jackpots` (`id`, `slug`, `name`, `games_count`, `price`, `estimated_pool`, `next_game_start_time`, `submissions_fill`, `premium_count`, `created_at`) VALUES
('sportpesa-mega', 'sportpesa-mega', 'SportPesa Mega Jackpot', 17, 1, 'KES 385,400,000', 'Starts Saturday: 16:30 EAT', '94%', 12450, NOW()),
('betika-midweek', 'betika-midweek', 'Betika Midweek Jackpot', 15, 1, 'KES 15,000,000', 'Starts Wednesday: 18:00 EAT', '88%', 9820, NOW()),
('mozzart-grand', 'mozzart-grand', 'Mozzart Super Grand Jackpot', 20, 1, 'KES 200,000,000', 'Starts Saturday: 17:00 EAT', '91%', 8430, NOW()),
('sportpesa-midweek', 'sportpesa-midweek', 'SportPesa Midweek Jackpot', 13, 1, 'KES 28,500,000', 'Starts Tuesday: 19:30 EAT', '86%', 7100, NOW()),
('sportybet-jackpot', 'sportybet-jackpot', 'SportyBet 12 Games Jackpot', 12, 1, 'KES 5,000,000', 'Starts Saturday: 16:00 EAT', '82%', 5900, NOW()),
('betpawa-pick-jackpot', 'betpawa-pick-jackpot', 'betPawa Pick13 Jackpot', 13, 1, 'KES 10,000,000', 'Starts Friday: 20:00 EAT', '85%', 6400, NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `estimated_pool` = VALUES(`estimated_pool`);

-- Sample SportPesa Mega Jackpot Matches
INSERT INTO `sportpesa_mega_jackpot` (`fixture_ref`, `jackpot_position`, `jackpot_tip`, `status_short`, `status_long`, `full_time_home`, `full_time_away`, `home_team_name`, `away_team_name`, `league_name`, `country_name`, `date`, `ai_analysis`, `created_at`) VALUES
('SPMJ-01', 1, 'Double Chance (1X)', 'NS', 'Not Started', NULL, NULL, 'Manchester United', 'Chelsea', 'Premier League', 'England', NOW() + INTERVAL 2 DAY, 'High stakes EPL match. Tactical setups lean heavily on home advantage.', NOW()),
('SPMJ-02', 2, 'Double Chance (X2)', 'NS', 'Not Started', NULL, NULL, 'Bournemouth', 'Newcastle', 'Premier League', 'England', NOW() + INTERVAL 2 DAY, 'Low expected goals model favors away double chance.', NOW()),
('SPMJ-03', 3, 'Away Win (2)', 'NS', 'Not Started', NULL, NULL, 'Albacete', 'Valladolid', 'Segunda Division', 'Spain', NOW() + INTERVAL 2 DAY, 'Valladolid holds superior squad depth and head-to-head record.', NOW()),
('SPMJ-04', 4, 'Double Chance (X2)', 'NS', 'Not Started', NULL, NULL, 'Tondela', 'Estrela', 'Primeira Liga', 'Portugal', NOW() + INTERVAL 2 DAY, 'Estrela is currently in stable defensive shape.', NOW()),
('SPMJ-05', 5, 'Home Win (1)', 'NS', 'Not Started', NULL, NULL, 'Empoli', 'Lecce', 'Serie A', 'Italy', NOW() + INTERVAL 2 DAY, 'Empoli strong home conversion rate gives them edge.', NOW());

-- VIP Packages Seed Data
INSERT INTO `vip_packages` (`id`, `slug`, `name`, `price`, `duration_days`, `description`, `features`, `is_featured`, `created_at`) VALUES
('daily-pass', 'daily-pass', '24-Hour VIP Access Pass', 100, 1, 'Full 24-hour access to all premium banker predictions & SMS slips.', '["Full 24h VIP Predictions Access", "M-Pesa Instant Unlocks", "Telegram VIP Channel Access", "24/7 Support"]', 0, NOW()),
('weekly-pass', 'weekly-pass', '7-Day Weekly VIP Membership', 350, 7, '7 days of daily sure tips, jackpot double chances, and high odds accumulators.', '["7 Days VIP Access", "All Major Jackpot Slips Included", "High Odds Multibet Slips", "M-Pesa Auto-Renewal Option"]', 1, NOW()),
('monthly-pass', 'monthly-pass', '30-Day Monthly VIP Membership', 999, 30, 'Ultimate 30-day VIP pass with unlimited access to all betting products.', '["30 Days Unlimited Access", "Exclusive Guaranteed Bankers", "Personalized SMS Slip Delivery", "Dedicated VIP Analyst Support"]', 0, NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `price` = VALUES(`price`);

COMMIT;
