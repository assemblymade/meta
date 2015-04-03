# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150401205759) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "hstore"
  enable_extension "pg_stat_statements"
  enable_extension "uuid-ossp"

  create_table "activities", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.string   "type",         limit: 255
    t.uuid     "actor_id"
    t.string   "actor_type",   limit: 255
    t.uuid     "subject_id"
    t.string   "subject_type", limit: 255
    t.uuid     "target_id"
    t.string   "target_type",  limit: 255
    t.datetime "created_at"
    t.uuid     "story_id"
    t.integer  "hearts_count",             default: 0, null: false
    t.uuid     "product_id"
  end

  add_index "activities", ["story_id"], name: "index_activities_on_story_id", using: :btree
  add_index "activities", ["target_id"], name: "index_activities_on_target_id", using: :btree

  create_table "allocation_events", id: :uuid, force: :cascade do |t|
    t.uuid     "allocation_run_id",                         null: false
    t.uuid     "user_id",                                   null: false
    t.integer  "score",                                     null: false
    t.decimal  "stake",             precision: 8, scale: 6, null: false
    t.datetime "created_at",                                null: false
  end

  create_table "allocation_runs", id: :uuid, force: :cascade do |t|
    t.uuid     "product_id", null: false
    t.datetime "created_at", null: false
    t.hstore   "parameters"
  end

  create_table "assembly_assets", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.string   "asset_id",          limit: 255
    t.uuid     "user_id",                       null: false
    t.uuid     "product_id",                    null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "amount"
    t.datetime "promo_redeemed_at"
  end

  create_table "assets", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id",                null: false
    t.uuid     "attachment_id",             null: false
    t.uuid     "user_id",                   null: false
    t.string   "name",          limit: 255, null: false
    t.datetime "created_at",                null: false
    t.datetime "deleted_at"
  end

  create_table "attachments", id: :uuid, force: :cascade do |t|
    t.uuid     "user_id"
    t.string   "asset_path",      limit: 255
    t.string   "name",            limit: 255
    t.string   "content_type",    limit: 255
    t.integer  "size"
    t.datetime "created_at"
    t.string   "dominant_colors",             array: true
    t.datetime "deleted_at"
  end

  create_table "auto_tip_contracts", force: :cascade do |t|
    t.uuid     "product_id", null: false
    t.uuid     "user_id",    null: false
    t.decimal  "amount",     null: false
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
  end

  create_table "awards", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "awarder_id"
    t.uuid     "event_id"
    t.uuid     "wip_id"
    t.uuid     "winner_id"
    t.integer  "cents"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "transaction_hash"
  end

  create_table "bounty_postings", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "bounty_id",  null: false
    t.uuid     "poster_id",  null: false
    t.datetime "created_at", null: false
    t.datetime "expired_at"
  end

  add_index "bounty_postings", ["expired_at", "bounty_id"], name: "index_bounty_postings_on_expired_at_and_bounty_id", unique: true, using: :btree

  create_table "btc_payments", force: :cascade do |t|
    t.integer  "btcusdprice_at_moment"
    t.datetime "created_at"
    t.string   "action",                limit: 255
    t.string   "sender",                limit: 255
    t.string   "sender_address",        limit: 255
    t.string   "recipient",             limit: 255
    t.string   "recipient_address",     limit: 255
    t.integer  "btc_change",            limit: 8
  end

  create_table "chat_rooms", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.string   "slug",       limit: 255, null: false
    t.uuid     "wip_id"
    t.uuid     "product_id"
    t.datetime "deleted_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "chat_rooms", ["slug"], name: "index_chat_rooms_on_slug", unique: true, using: :btree

  create_table "choices", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.float    "value"
    t.float    "weight"
    t.string   "type"
    t.uuid     "proposal_id"
    t.uuid     "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "chronicles", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "code_deliverables", id: :uuid, force: :cascade do |t|
    t.uuid     "wip_id",                 null: false
    t.uuid     "user_id",                null: false
    t.string   "url",        limit: 255, null: false
    t.datetime "created_at"
  end

  create_table "coin_infos", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
    t.string   "asset_address"
    t.string   "contract_url"
    t.string   "name"
    t.string   "issuer"
    t.string   "description"
    t.string   "description_mime"
    t.string   "coin_type"
    t.string   "divisibility"
    t.boolean  "link_to_website"
    t.string   "icon_url"
    t.string   "image_url"
    t.string   "version"
    t.uuid     "product_id"
  end

  create_table "completed_missions", id: :uuid, force: :cascade do |t|
    t.uuid     "product_id",               null: false
    t.string   "mission_id",   limit: 255, null: false
    t.datetime "created_at",               null: false
    t.uuid     "completor_id",             null: false
  end

  create_table "contract_holders", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id", null: false
    t.uuid     "user_id",    null: false
    t.integer  "annuity",    null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "copy_deliverables", id: :uuid, force: :cascade do |t|
    t.uuid     "wip_id",     null: false
    t.uuid     "user_id",    null: false
    t.text     "body",       null: false
    t.datetime "created_at"
  end

  create_table "core_team_memberships", id: :uuid, force: :cascade do |t|
    t.uuid     "product_id", null: false
    t.uuid     "user_id",    null: false
    t.datetime "created_at"
  end

  add_index "core_team_memberships", ["user_id", "product_id"], name: "index_core_team_memberships_on_user_id_and_product_id", unique: true, using: :btree

  create_table "daily_actives", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.integer  "count"
    t.datetime "created_at"
  end

  create_table "daily_metrics", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
    t.uuid     "product_id",        null: false
    t.date     "date",              null: false
    t.integer  "uniques",           null: false
    t.integer  "visits",            null: false
    t.integer  "registered_visits", null: false
    t.integer  "total_accounts",    null: false
  end

  add_index "daily_metrics", ["product_id", "date"], name: "index_daily_metrics_on_product_id_and_date", unique: true, using: :btree
  add_index "daily_metrics", ["product_id"], name: "index_daily_metrics_on_product_id", using: :btree

  create_table "deeds", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id"
    t.datetime "created_at"
    t.integer  "karma_value"
    t.string   "karma_event_type", limit: 255
    t.uuid     "karma_event_id"
    t.integer  "chronicle_id"
  end

  create_table "deliverables", id: :uuid, force: :cascade do |t|
    t.uuid     "wip_id",        null: false
    t.uuid     "attachment_id", null: false
    t.datetime "created_at"
  end

  create_table "domains", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id",                      null: false
    t.uuid     "user_id",                         null: false
    t.string   "name",                limit: 255, null: false
    t.string   "state",               limit: 255, null: false
    t.string   "registrar",           limit: 255
    t.string   "registrar_domain_id", limit: 255
    t.string   "transfer_auth_code",  limit: 255
    t.string   "status",              limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "email_logs", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id",    null: false
    t.text     "key",        null: false
    t.hstore   "params",     null: false
    t.datetime "created_at", null: false
  end

  create_table "events", id: :uuid, force: :cascade do |t|
    t.integer  "number",                               null: false
    t.uuid     "wip_id",                               null: false
    t.uuid     "user_id",                              null: false
    t.string   "type",        limit: 255,              null: false
    t.text     "body"
    t.text     "url"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.uuid     "event_id"
    t.uuid     "attachments",             default: [],              array: true
    t.datetime "deleted_at"
  end

  add_index "events", ["deleted_at"], name: "index_events_on_deleted_at", using: :btree
  add_index "events", ["type", "wip_id"], name: "index_events_on_type_and_wip_id", using: :btree
  add_index "events", ["user_id"], name: "index_events_on_user_id", using: :btree
  add_index "events", ["wip_id", "number"], name: "index_events_on_wip_id_and_number", unique: true, using: :btree
  add_index "events", ["wip_id"], name: "index_events_on_wip_id", using: :btree

  create_table "expense_claim_attachments", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "expense_claim_id", null: false
    t.uuid     "attachment_id",    null: false
    t.datetime "created_at",       null: false
  end

  create_table "expense_claims", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id",              null: false
    t.uuid     "user_id",                 null: false
    t.integer  "total",                   null: false
    t.string   "description", limit: 255
    t.datetime "paid_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "features", id: :uuid, force: :cascade do |t|
    t.uuid     "user_id"
    t.uuid     "product_id"
    t.text     "title"
    t.text     "body"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "votes_count", default: 0, null: false
  end

  create_table "financial_accounts", id: :uuid, force: :cascade do |t|
    t.uuid     "product_id",                             null: false
    t.string   "name",       limit: 255,                 null: false
    t.string   "type",       limit: 255,                 null: false
    t.boolean  "contra",                 default: false, null: false
    t.datetime "created_at",                             null: false
  end

  create_table "financial_amounts", id: :uuid, force: :cascade do |t|
    t.string  "type",           limit: 255, null: false
    t.uuid    "account_id",                 null: false
    t.uuid    "transaction_id",             null: false
    t.integer "amount",                     null: false
  end

  create_table "financial_transactions", id: :uuid, force: :cascade do |t|
    t.uuid     "product_id", null: false
    t.hstore   "details",    null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "global_interests", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id"
    t.datetime "design"
    t.datetime "frontend"
    t.datetime "backend"
    t.datetime "marketing"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "guests", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "email",      null: false
  end

  add_index "guests", ["email"], name: "index_guests_on_email", unique: true, using: :btree

  create_table "hearts", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id",                    null: false
    t.uuid     "heartable_id",               null: false
    t.string   "heartable_type", limit: 255, null: false
    t.datetime "created_at",                 null: false
    t.datetime "sent_at"
    t.uuid     "target_user_id"
    t.uuid     "product_id"
  end

  add_index "hearts", ["sent_at"], name: "index_hearts_on_sent_at", using: :btree
  add_index "hearts", ["user_id", "heartable_id"], name: "index_hearts_on_user_id_and_heartable_id", unique: true, using: :btree

  create_table "ideas", id: :uuid, force: :cascade do |t|
    t.string   "slug",                 limit: 255,                                 null: false
    t.string   "name",                 limit: 255,                                 null: false
    t.text     "body"
    t.uuid     "user_id",                                                          null: false
    t.boolean  "claimed",                          default: false
    t.uuid     "product_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "score",                            default: 0.0
    t.datetime "last_score_update",                default: '2013-06-06 00:00:00'
    t.datetime "greenlit_at"
    t.boolean  "founder_preference"
    t.integer  "tilting_threshold"
    t.datetime "flagged_at"
    t.text     "topics",                           default: [],                                 array: true
    t.text     "categories",                       default: [],                                 array: true
    t.datetime "deleted_at"
    t.datetime "last_tweeted_at"
    t.string   "tentative_name"
    t.datetime "last_tilt_email_sent"
    t.integer  "total_visitors",                   default: 0,                     null: false
  end

  add_index "ideas", ["deleted_at"], name: "index_ideas_on_deleted_at", using: :btree
  add_index "ideas", ["flagged_at"], name: "index_ideas_on_flagged_at", using: :btree

  create_table "integrations", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id",                null: false
    t.string   "access_token",  limit: 255, null: false
    t.string   "refresh_token", limit: 255
    t.string   "token_type",    limit: 255
    t.string   "provider",      limit: 255, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.json     "config"
  end

  add_index "integrations", ["product_id"], name: "index_integrations_on_product_id", unique: true, using: :btree

  create_table "interests", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.text     "slug",       null: false
    t.datetime "created_at", null: false
  end

  create_table "invites", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "invitor_id",    null: false
    t.uuid     "via_id"
    t.text     "via_type"
    t.text     "note"
    t.integer  "tip_cents",     null: false
    t.uuid     "invitee_id"
    t.text     "invitee_email"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "sent_at"
    t.datetime "deleted_at"
    t.datetime "claimed_at"
    t.hstore   "extra"
  end

  create_table "kwests", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.string   "title",      limit: 255
    t.uuid     "user_id"
    t.uuid     "deed_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "leader_positions", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.string   "leader_type"
    t.integer  "rank"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.uuid     "user_id"
  end

  create_table "mark_clusters", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "name"
  end

  create_table "mark_stems", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.string   "name",        limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "marks_count",             default: 0
  end

  create_table "markings", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.string   "markable_type", limit: 255
    t.uuid     "markable_id"
    t.uuid     "mark_id"
    t.float    "weight"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "markings", ["markable_id", "mark_id"], name: "index_markings_on_markable_id_and_mark_id", unique: true, using: :btree

  create_table "marks", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.string   "name",            limit: 255, null: false
    t.datetime "created_at"
    t.uuid     "mark_stem_id"
    t.uuid     "mark_cluster_id"
  end

  add_index "marks", ["mark_stem_id"], name: "index_marks_on_mark_stem_id", using: :btree
  add_index "marks", ["name"], name: "index_marks_on_name", unique: true, using: :btree

  create_table "measurements", id: :uuid, force: :cascade do |t|
    t.uuid     "metric_id",  null: false
    t.decimal  "value",      null: false
    t.datetime "created_at", null: false
  end

  create_table "messages", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "author_id",  null: false
    t.text     "body"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "metrics", id: :uuid, force: :cascade do |t|
    t.uuid   "product_id",             null: false
    t.string "name",       limit: 255, null: false
  end

  create_table "milestone_images", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id",       null: false
    t.uuid     "milestone_id",  null: false
    t.uuid     "attachment_id", null: false
    t.datetime "created_at",    null: false
  end

  create_table "milestone_tasks", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "milestone_id", null: false
    t.uuid     "task_id",      null: false
    t.datetime "created_at"
  end

  add_index "milestone_tasks", ["milestone_id", "task_id"], name: "index_milestone_tasks_on_milestone_id_and_task_id", unique: true, using: :btree

  create_table "milestones", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id",                            null: false
    t.uuid     "product_id",                         null: false
    t.integer  "number"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.uuid     "wip_id",                             null: false
    t.integer  "milestone_images_count", default: 0, null: false
  end

  add_index "milestones", ["product_id", "number"], name: "index_milestones_on_product_id_and_number", unique: true, using: :btree

  create_table "monthly_metrics", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.uuid     "product_id",              null: false
    t.date     "date",                    null: false
    t.integer  "ga_uniques"
    t.integer  "uniques"
    t.integer  "visits"
    t.integer  "registered_visits"
    t.integer  "total_accounts"
    t.integer  "uniques_override"
    t.integer  "total_accounts_override"
  end

  add_index "monthly_metrics", ["product_id"], name: "index_monthly_metrics_on_product_id", using: :btree

  create_table "mutings", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "wip_id",     null: false
    t.uuid     "user_id",    null: false
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
  end

  create_table "news_feed_item_comments", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "news_feed_item_id"
    t.uuid     "user_id"
    t.text     "body"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "deleted_at"
    t.integer  "hearts_count",      default: 0, null: false
    t.uuid     "target_id"
    t.integer  "tips_total",        default: 0, null: false
  end

  add_index "news_feed_item_comments", ["news_feed_item_id", "created_at"], name: "index_news_feed_item_comments_for_dashboard", using: :btree
  add_index "news_feed_item_comments", ["user_id"], name: "index_news_feed_item_comments_on_user_id", using: :btree

  create_table "news_feed_item_posts", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "news_feed_item_id"
    t.text     "title"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "url"
    t.uuid     "product_id",        null: false
  end

  create_table "news_feed_items", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "source_id"
    t.uuid     "product_id"
    t.uuid     "target_id",                                 null: false
    t.string   "target_type",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "deleted_at"
    t.datetime "popular_at"
    t.integer  "hearts_count",                  default: 0, null: false
    t.datetime "last_commented_at"
    t.integer  "watchings_count"
    t.datetime "archived_at"
    t.integer  "comments_count",                default: 0
  end

  add_index "news_feed_items", ["product_id", "target_type", "archived_at", "last_commented_at"], name: "index_news_feed_items_for_dashboard", using: :btree
  add_index "news_feed_items", ["product_id"], name: "index_news_feed_items_on_product_id", using: :btree
  add_index "news_feed_items", ["target_id", "target_type"], name: "index_news_feed_items_on_target_id_and_target_type", using: :btree
  add_index "news_feed_items", ["target_id"], name: "index_news_feed_items_on_target_id", unique: true, using: :btree

  create_table "newsletters", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.string   "subject",      limit: 255
    t.text     "body"
    t.datetime "published_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "cancelled_at"
  end

  create_table "offers", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "bounty_id",  null: false
    t.uuid     "user_id",    null: false
    t.integer  "amount",     null: false
    t.inet     "ip",         null: false
    t.datetime "created_at", null: false
  end

  create_table "ownership_statuses", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id"
    t.string   "state"
    t.string   "asset"
    t.text     "description"
    t.datetime "pending_until"
    t.datetime "state_updated_at"
    t.datetime "owned_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "ownership_statuses", ["product_id"], name: "index_ownership_statuses_on_product_id", using: :btree

  create_table "perks", id: :uuid, force: :cascade do |t|
    t.uuid     "product_id"
    t.integer  "amount"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",        limit: 255, null: false
  end

  create_table "pitch_week_applications", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id",   null: false
    t.uuid     "applicant_id", null: false
    t.boolean  "is_approved"
    t.datetime "reviewed_at"
    t.uuid     "reviewer_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "platform_metrics", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "calculated_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "mean_core_responsiveness"
    t.integer  "median_core_responsiveness"
    t.integer  "mean_noncore_responsiveness"
    t.integer  "median_noncore_responsiveness"
  end

  create_table "posts", id: :uuid, force: :cascade do |t|
    t.uuid     "product_id",             null: false
    t.uuid     "author_id",              null: false
    t.text     "body",                   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "title",      limit: 255
    t.string   "slug",       limit: 255
    t.text     "summary"
    t.datetime "flagged_at"
  end

  add_index "posts", ["flagged_at"], name: "index_posts_on_flagged_at", using: :btree
  add_index "posts", ["product_id", "flagged_at"], name: "index_posts_on_product_id_and_flagged_at", using: :btree
  add_index "posts", ["product_id", "slug"], name: "index_posts_on_product_id_and_slug", unique: true, using: :btree

  create_table "preorders", id: :uuid, force: :cascade do |t|
    t.uuid     "vote_id"
    t.integer  "amount",                 null: false
    t.string   "charge_id",  limit: 255
    t.string   "card_id",    limit: 255, null: false
    t.datetime "charged_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.uuid     "user_id",                null: false
    t.uuid     "perk_id"
    t.inet     "ip"
    t.text     "variation"
  end

  create_table "product_metrics", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "comments_count",          default: 0
    t.integer  "core_responsiveness"
    t.integer  "noncore_responsiveness"
    t.text     "response_times"
    t.integer  "trailing_month_activity"
  end

  add_index "product_metrics", ["product_id"], name: "index_product_metrics_on_product_id", using: :btree

  create_table "product_subscriptions", id: :uuid, force: :cascade do |t|
    t.uuid     "product_id", null: false
    t.uuid     "user_id",    null: false
    t.datetime "created_at"
  end

  add_index "product_subscriptions", ["product_id", "user_id"], name: "index_product_subscriptions_on_product_id_and_user_id", unique: true, using: :btree

  create_table "product_trends", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id"
    t.decimal  "score"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "product_trends", ["product_id"], name: "index_product_trends_on_product_id", unique: true, using: :btree

  create_table "products", id: :uuid, force: :cascade do |t|
    t.string   "slug",                              limit: 255,                null: false
    t.string   "name",                              limit: 255,                null: false
    t.string   "pitch",                             limit: 255
    t.text     "description"
    t.integer  "assembly_contribution",                         default: 0,    null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.uuid     "user_id",                                                      null: false
    t.text     "lead"
    t.integer  "view_count",                                    default: 0
    t.text     "suggested_perks"
    t.string   "poster",                            limit: 255
    t.integer  "votes_count",                                   default: 0,    null: false
    t.uuid     "evaluator_id"
    t.datetime "greenlit_at"
    t.text     "free_perk"
    t.integer  "watchings_count",                               default: 0,    null: false
    t.text     "repos",                                                                     array: true
    t.string   "authentication_token",              limit: 255,                null: false
    t.datetime "featured_on"
    t.string   "tags",                                          default: [],                array: true
    t.boolean  "can_advertise",                                 default: true
    t.datetime "flagged_at"
    t.text     "flagged_reason"
    t.string   "homepage_url",                      limit: 255
    t.string   "you_tube_video_url",                limit: 255
    t.integer  "commit_count",                                  default: 0,    null: false
    t.datetime "founded_at"
    t.datetime "public_at"
    t.uuid     "main_thread_id"
    t.uuid     "logo_id"
    t.integer  "team_memberships_count",                        default: 0
    t.hstore   "info"
    t.integer  "quality"
    t.datetime "last_activity_at"
    t.integer  "bio_memberships_count",                         default: 0,    null: false
    t.datetime "started_building_at"
    t.datetime "live_at"
    t.integer  "partners_count"
    t.string   "wallet_public_address",             limit: 255
    t.binary   "encrypted_wallet_private_key"
    t.binary   "encrypted_wallet_private_key_salt"
    t.binary   "encrypted_wallet_private_key_iv"
    t.datetime "started_team_building_at"
    t.datetime "profitable_at"
    t.string   "state",                             limit: 255
    t.datetime "last_checked_btc"
    t.datetime "issued_coins"
    t.text     "try_url"
    t.string   "topics",                                                                    array: true
    t.integer  "wips_count",                                    default: 0,    null: false
    t.datetime "deleted_at"
    t.json     "subsections"
    t.text     "asmlytics_key"
    t.integer  "total_visitors",                                default: 0,    null: false
    t.text     "analytics_category"
    t.datetime "trust_domain_at"
    t.datetime "trust_ip_at"
    t.datetime "trust_hosting_at"
    t.datetime "trust_finances_at"
    t.datetime "trust_mobile_at"
  end

  add_index "products", ["asmlytics_key"], name: "index_products_on_asmlytics_key", unique: true, using: :btree
  add_index "products", ["authentication_token"], name: "index_products_on_authentication_token", unique: true, using: :btree
  add_index "products", ["deleted_at"], name: "index_products_on_deleted_at", using: :btree
  add_index "products", ["profitable_at"], name: "index_products_on_profitable_at", using: :btree
  add_index "products", ["repos"], name: "index_products_on_repos", using: :btree
  add_index "products", ["slug"], name: "index_products_on_slug", unique: true, using: :btree
  add_index "products", ["started_team_building_at"], name: "index_products_on_started_team_building_at", using: :btree
  add_index "products", ["state"], name: "index_products_on_state", using: :btree

  create_table "profit_reports", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid    "product_id",             null: false
    t.date    "end_at",                 null: false
    t.integer "revenue",                null: false
    t.integer "expenses",               null: false
    t.integer "coins"
    t.integer "annuity",    default: 0, null: false
  end

  create_table "proposals", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.string   "name"
    t.string   "description"
    t.string   "state"
    t.string   "contract_type"
    t.datetime "expiration"
    t.uuid     "product_id"
    t.uuid     "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "rooms", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid    "product_id",  null: false
    t.integer "number",      null: false
    t.text    "target_type", null: false
    t.uuid    "target_id",   null: false
  end

  add_index "rooms", ["product_id", "number"], name: "index_rooms_on_product_id_and_number", unique: true, using: :btree

  create_table "saved_searches", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id"
    t.text     "query"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "screenshots", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "created_at",             null: false
    t.uuid     "asset_id",               null: false
    t.integer  "position",   default: 0
    t.datetime "deleted_at"
  end

  create_table "showcase_entries", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "created_at",  null: false
    t.uuid     "showcase_id", null: false
    t.uuid     "product_id",  null: false
  end

  create_table "showcases", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string   "slug",       null: false
    t.datetime "ended_at"
    t.string   "background"
  end

  add_index "showcases", ["ended_at"], name: "index_showcases_on_ended_at", using: :btree

  create_table "status_messages", id: :uuid, force: :cascade do |t|
    t.uuid     "product_id",             null: false
    t.uuid     "user_id",                null: false
    t.string   "body",       limit: 255, null: false
    t.datetime "created_at",             null: false
  end

  create_table "stories", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.string   "verb",         limit: 255, null: false
    t.string   "subject_type", limit: 255, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "stream_events", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "actor_id"
    t.uuid     "product_id"
    t.uuid     "subject_id",                                  null: false
    t.string   "subject_type",    limit: 255,                 null: false
    t.uuid     "target_id"
    t.string   "target_type",     limit: 255
    t.string   "verb",            limit: 255,                 null: false
    t.string   "type",            limit: 255,                 null: false
    t.boolean  "product_flagged",             default: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "subscribers", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "created_at",             null: false
    t.string   "email",      limit: 255, null: false
    t.uuid     "product_id",             null: false
    t.uuid     "user_id"
    t.datetime "deleted_at"
  end

  add_index "subscribers", ["email", "product_id"], name: "index_subscribers_on_email_and_product_id", unique: true, using: :btree

  create_table "team_membership_interests", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "team_membership_id", null: false
    t.uuid     "interest_id",        null: false
    t.datetime "created_at",         null: false
  end

  create_table "team_memberships", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id", null: false
    t.uuid     "user_id",    null: false
    t.boolean  "is_core",    null: false
    t.text     "bio"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "deleted_at"
  end

  add_index "team_memberships", ["user_id", "product_id"], name: "index_team_memberships_on_user_id_and_product_id", unique: true, using: :btree

  create_table "tips", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id",                                  null: false
    t.uuid     "from_id",                                     null: false
    t.uuid     "to_id",                                       null: false
    t.uuid     "via_id",                                      null: false
    t.integer  "cents",                                       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "via_type",   limit: 255, default: "Activity", null: false
  end

  add_index "tips", ["product_id", "from_id", "to_id", "via_id"], name: "index_tips_on_product_id_and_from_id_and_to_id_and_via_id", unique: true, using: :btree

  create_table "top_bounties", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id"
    t.float    "score"
    t.integer  "rank"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.uuid     "wip_id"
  end

  create_table "top_products", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id"
    t.float    "score"
    t.integer  "rank"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.uuid     "product_id"
  end

  add_index "top_products", ["user_id"], name: "index_top_products_on_user_id", using: :btree

  create_table "transaction_log_entries", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id",                   null: false
    t.uuid     "work_id"
    t.uuid     "wallet_id",                    null: false
    t.string   "action",           limit: 255, null: false
    t.text     "value"
    t.datetime "created_at"
    t.uuid     "transaction_id"
    t.hstore   "extra"
    t.integer  "cents"
    t.string   "queue_id",         limit: 255
    t.string   "transaction_hash", limit: 255
    t.boolean  "success"
    t.string   "destination",      limit: 255
    t.string   "color_address",    limit: 255
    t.integer  "color_amount"
    t.string   "transaction_type", limit: 255
  end

  add_index "transaction_log_entries", ["wallet_id", "product_id", "cents"], name: "transaction_log_entries_index_for_dashboard", using: :btree
  add_index "transaction_log_entries", ["wallet_id", "product_id"], name: "index_transaction_log_entries_on_wallet_id_and_product_id", using: :btree
  add_index "transaction_log_entries", ["wallet_id"], name: "index_transaction_log_entries_on_wallet_id", using: :btree

  create_table "uniques", id: :uuid, force: :cascade do |t|
    t.uuid     "metric_id",               null: false
    t.string   "distinct_id", limit: 255, null: false
    t.datetime "created_at",              null: false
  end

  add_index "uniques", ["distinct_id", "created_at"], name: "index_uniques_on_distinct_id_and_created_at", using: :btree

  create_table "user_balance_entries", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "created_at",       null: false
    t.uuid     "user_id",          null: false
    t.uuid     "profit_report_id", null: false
    t.integer  "coins",            null: false
    t.integer  "earnings",         null: false
  end

  add_index "user_balance_entries", ["profit_report_id", "user_id"], name: "index_user_balance_entries_on_profit_report_id_and_user_id", unique: true, using: :btree

  create_table "user_clusters", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.float    "variance"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "user_identities", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "user_payment_options", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid   "user_id",                     null: false
    t.string "type",            limit: 255, null: false
    t.string "bitcoin_address", limit: 255
    t.string "recipient_id",    limit: 255
    t.string "last4",           limit: 255
  end

  create_table "user_tax_infos", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id",                        null: false
    t.string   "full_name",          limit: 255
    t.string   "business_name",      limit: 255
    t.string   "taxpayer_id",        limit: 255
    t.string   "taxpayer_type",      limit: 255
    t.string   "classification",     limit: 255
    t.string   "address",            limit: 255
    t.string   "city",               limit: 255
    t.string   "state",              limit: 255
    t.string   "zip",                limit: 255
    t.string   "country",            limit: 255
    t.string   "foreign_tax_id",     limit: 255
    t.string   "reference_number",   limit: 255
    t.date     "date_of_birth"
    t.string   "signatory",          limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "type",               limit: 255, null: false
    t.string   "citizenship",        limit: 255
    t.string   "mailing_address",    limit: 255
    t.string   "mailing_city",       limit: 255
    t.string   "mailing_state",      limit: 255
    t.string   "mailing_zip",        limit: 255
    t.string   "mailing_country",    limit: 255
    t.string   "treaty_article",     limit: 255
    t.string   "treaty_withholding", limit: 255
    t.string   "treaty_income_type", limit: 255
    t.string   "treaty_reasons",     limit: 255
    t.string   "signature_capacity", limit: 255
  end

  create_table "user_withdrawals", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id",         null: false
    t.integer  "reference",       null: false
    t.integer  "total_amount",    null: false
    t.integer  "amount_withheld", null: false
    t.datetime "payment_sent_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", id: :uuid, force: :cascade do |t|
    t.string   "name",                              limit: 255
    t.string   "customer_id",                       limit: 255
    t.boolean  "is_staff",                                      default: false,   null: false
    t.string   "email",                             limit: 255,                   null: false
    t.string   "encrypted_password",                limit: 255
    t.string   "reset_password_token",              limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                                 default: 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "confirmation_sent_at"
    t.datetime "confirmed_at"
    t.string   "confirmation_token",                limit: 255
    t.string   "unconfirmed_email",                 limit: 255
    t.datetime "email_failed_at"
    t.string   "facebook_uid",                      limit: 255
    t.text     "location"
    t.datetime "last_request_at"
    t.string   "avatar_url",                        limit: 255
    t.text     "extra_data"
    t.string   "authentication_token",              limit: 255
    t.text     "bio"
    t.string   "archetype",                         limit: 255
    t.string   "username",                          limit: 255,                   null: false
    t.string   "mail_preference",                   limit: 255, default: "daily", null: false
    t.integer  "github_uid"
    t.string   "github_login",                      limit: 255
    t.string   "payment_option",                    limit: 255
    t.string   "paypal_email",                      limit: 255
    t.string   "bank_account_id",                   limit: 255
    t.string   "bank_name",                         limit: 255
    t.string   "bank_last4",                        limit: 255
    t.string   "address_line1",                     limit: 255
    t.string   "address_line2",                     limit: 255
    t.string   "address_city",                      limit: 255
    t.string   "address_state",                     limit: 255
    t.string   "address_zip",                       limit: 255
    t.string   "address_country",                   limit: 255
    t.datetime "personal_email_sent_on"
    t.text     "twitter_uid"
    t.text     "twitter_nickname"
    t.uuid     "recent_product_ids",                                                           array: true
    t.string   "remember_token",                    limit: 255
    t.string   "wallet_public_address",             limit: 255
    t.binary   "encrypted_wallet_private_key"
    t.binary   "encrypted_wallet_private_key_salt"
    t.binary   "encrypted_wallet_private_key_iv"
    t.datetime "welcome_banner_dismissed_at"
    t.datetime "deleted_at"
    t.string   "interested_tags",                               default: [],                   array: true
    t.string   "most_important_quality",            limit: 255
    t.string   "how_much_time",                     limit: 255
    t.text     "previous_experience"
    t.string   "platforms",                                     default: [],                   array: true
    t.datetime "gravatar_checked_at"
    t.datetime "gravatar_verified_at"
    t.uuid     "user_cluster_id"
    t.datetime "flagged_at"
    t.datetime "showcase_banner_dismissed_at"
    t.datetime "coin_callout_viewed_at"
    t.integer  "hearts_received",                               default: 0,       null: false
    t.datetime "last_hearted_at"
  end

  add_index "users", ["authentication_token"], name: "index_users_on_authentication_token", unique: true, using: :btree
  add_index "users", ["deleted_at"], name: "index_users_on_deleted_at", using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["facebook_uid"], name: "index_users_on_facebook_uid", unique: true, using: :btree
  add_index "users", ["github_uid"], name: "index_users_on_github_uid", unique: true, using: :btree
  add_index "users", ["gravatar_checked_at"], name: "index_users_on_gravatar_checked_at", using: :btree
  add_index "users", ["gravatar_verified_at"], name: "index_users_on_gravatar_verified_at", using: :btree
  add_index "users", ["last_request_at"], name: "index_users_on_last_request_at", using: :btree
  add_index "users", ["name"], name: "index_users_on_name", using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  add_index "users", ["username"], name: "index_users_on_username", unique: true, using: :btree

  create_table "versions", id: :uuid, force: :cascade do |t|
    t.uuid     "versioned_id",               null: false
    t.string   "versioned_type", limit: 255, null: false
    t.uuid     "user_id",                    null: false
    t.text     "modifications",              null: false
    t.integer  "number",                     null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "vestings", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "proposal_id"
    t.datetime "start_date"
    t.datetime "expiration_date"
    t.integer  "intervals"
    t.integer  "intervals_paid"
    t.integer  "coins"
    t.uuid     "user_id"
    t.string   "state"
    t.uuid     "product_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "viewings", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "user_id"
    t.string   "viewable_type", limit: 255
    t.uuid     "viewable_id"
    t.datetime "created_at"
    t.float    "weight"
  end

  create_table "votes", id: :uuid, force: :cascade do |t|
    t.uuid     "voteable_id",                                null: false
    t.uuid     "user_id",                                    null: false
    t.inet     "ip",                                         null: false
    t.datetime "created_at",                                 null: false
    t.string   "voteable_type", limit: 255, default: "Idea"
  end

  add_index "votes", ["user_id", "voteable_id"], name: "index_votes_on_user_id_and_voteable_id", unique: true, using: :btree

  create_table "watchings", id: :uuid, force: :cascade do |t|
    t.uuid     "user_id",                        null: false
    t.uuid     "watchable_id",                   null: false
    t.string   "watchable_type",     limit: 255, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "auto_subscribed_at"
    t.datetime "unwatched_at"
  end

  add_index "watchings", ["unwatched_at", "user_id", "watchable_type"], name: "index_watchings_on_unwatched_at_and_user_id_and_watchable_type", using: :btree
  add_index "watchings", ["user_id", "watchable_id"], name: "index_watchings_on_user_id_and_watchable_id", unique: true, using: :btree
  add_index "watchings", ["watchable_id", "watchable_type"], name: "index_watchings_on_watchable_id_and_watchable_type", using: :btree

  create_table "weekly_metrics", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
    t.uuid     "product_id",        null: false
    t.date     "date",              null: false
    t.integer  "uniques",           null: false
    t.integer  "visits",            null: false
    t.integer  "registered_visits", null: false
    t.integer  "total_accounts",    null: false
  end

  add_index "weekly_metrics", ["product_id", "date"], name: "index_weekly_metrics_on_product_id_and_date", unique: true, using: :btree
  add_index "weekly_metrics", ["product_id"], name: "index_weekly_metrics_on_product_id", using: :btree

  create_table "whiteboard_assets", id: :uuid, force: :cascade do |t|
    t.uuid     "event_id",               null: false
    t.string   "image_url",  limit: 255, null: false
    t.string   "format",     limit: 255, null: false
    t.integer  "height",                 null: false
    t.integer  "width",                  null: false
    t.datetime "created_at",             null: false
    t.datetime "deleted_at"
  end

  add_index "whiteboard_assets", ["event_id", "image_url"], name: "index_whiteboard_assets_on_event_id_and_image_url", unique: true, using: :btree

  create_table "wip_taggings", id: :uuid, force: :cascade do |t|
    t.uuid     "wip_tag_id", null: false
    t.uuid     "wip_id",     null: false
    t.datetime "created_at"
  end

  create_table "wip_tags", id: :uuid, force: :cascade do |t|
    t.string   "name",            limit: 255,             null: false
    t.datetime "created_at"
    t.integer  "watchings_count",             default: 0, null: false
  end

  add_index "wip_tags", ["name"], name: "index_wip_tags_on_name", unique: true, using: :btree

  create_table "wip_workers", id: :uuid, force: :cascade do |t|
    t.uuid     "wip_id",                       null: false
    t.uuid     "user_id",                      null: false
    t.datetime "created_at"
    t.datetime "last_checkin_at"
    t.datetime "last_response_at"
    t.integer  "checkin_count",    default: 0
  end

  add_index "wip_workers", ["wip_id", "user_id"], name: "index_wip_workers_on_wip_id_and_user_id", unique: true, using: :btree

  create_table "wips", id: :uuid, force: :cascade do |t|
    t.uuid     "user_id",                                            null: false
    t.uuid     "product_id",                                         null: false
    t.text     "title",                                              null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "number"
    t.uuid     "closer_id"
    t.datetime "closed_at"
    t.integer  "votes_count",                      default: 0,       null: false
    t.uuid     "winning_event_id"
    t.datetime "promoted_at"
    t.integer  "events_count",                     default: 0,       null: false
    t.integer  "comments_count",                   default: 0,       null: false
    t.datetime "pinned_at"
    t.integer  "trending_score",       limit: 8
    t.string   "state",                limit: 255
    t.string   "type",                 limit: 255
    t.string   "deliverable",          limit: 255, default: "other", null: false
    t.decimal  "author_tip",                       default: 0.0,     null: false
    t.text     "description"
    t.datetime "flagged_at"
    t.uuid     "flagged_by_id"
    t.integer  "earnable_coins_cache"
    t.integer  "total_coins_cache"
    t.integer  "watchings_count"
    t.datetime "locked_at"
    t.uuid     "locked_by"
    t.integer  "priority"
    t.integer  "hearts_count",                     default: 0,       null: false
    t.datetime "deleted_at"
    t.integer  "display_order"
    t.integer  "value"
  end

  add_index "wips", ["deleted_at"], name: "index_wips_on_deleted_at", using: :btree
  add_index "wips", ["flagged_at"], name: "index_wips_on_flagged_at", using: :btree
  add_index "wips", ["product_id", "number"], name: "index_wips_on_product_id_and_number", unique: true, using: :btree
  add_index "wips", ["product_id", "priority"], name: "index_wips_on_product_id_and_priority", using: :btree
  add_index "wips", ["product_id", "promoted_at"], name: "index_wips_on_product_id_and_promoted_at", using: :btree
  add_index "wips", ["product_id"], name: "index_wips_on_product_id", using: :btree

  create_table "work", id: :uuid, default: "uuid_generate_v4()", force: :cascade do |t|
    t.uuid     "product_id",              null: false
    t.uuid     "user_id"
    t.text     "url",                     null: false
    t.json     "metadata",                null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "votes_count", default: 0, null: false
  end

  create_table "work_applications", id: :uuid, force: :cascade do |t|
    t.uuid     "user_id",    null: false
    t.uuid     "product_id", null: false
    t.datetime "created_at"
  end

  add_foreign_key "daily_metrics", "products"
  add_foreign_key "hearts", "products"
  add_foreign_key "markings", "marks"
  add_foreign_key "monthly_metrics", "products"
  add_foreign_key "news_feed_item_comments", "news_feed_items"
  add_foreign_key "screenshots", "assets"
  add_foreign_key "showcase_entries", "products"
  add_foreign_key "showcase_entries", "showcases"
  add_foreign_key "weekly_metrics", "products"
end
