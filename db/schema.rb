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

ActiveRecord::Schema.define(version: 20140918141924) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "hstore"
  enable_extension "pg_stat_statements"
  enable_extension "uuid-ossp"

  create_table "activities", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.string   "type"
    t.uuid     "actor_id"
    t.string   "actor_type"
    t.uuid     "subject_id"
    t.string   "subject_type"
    t.uuid     "target_id"
    t.string   "target_type"
    t.datetime "created_at"
    t.uuid     "story_id"
  end

  add_index "activities", ["story_id"], name: "index_activities_on_story_id", using: :btree
  add_index "activities", ["target_id"], name: "index_activities_on_target_id", using: :btree

  create_table "allocation_events", id: false, force: true do |t|
    t.uuid     "id",                                        null: false
    t.uuid     "allocation_run_id",                         null: false
    t.uuid     "user_id",                                   null: false
    t.integer  "score",                                     null: false
    t.decimal  "stake",             precision: 8, scale: 6, null: false
    t.datetime "created_at",                                null: false
  end

  create_table "allocation_runs", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "product_id", null: false
    t.datetime "created_at", null: false
    t.hstore   "parameters"
  end

  create_table "assembly_assets", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.string   "asset_id"
    t.uuid     "user_id",           null: false
    t.uuid     "product_id",        null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "amount"
    t.datetime "promo_redeemed_at"
  end

  create_table "assets", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "product_id",    null: false
    t.uuid     "attachment_id", null: false
    t.uuid     "user_id",       null: false
    t.string   "name",          null: false
    t.datetime "created_at",    null: false
  end

  create_table "attachments", id: false, force: true do |t|
    t.uuid     "id",           null: false
    t.uuid     "user_id"
    t.string   "asset_path"
    t.string   "name"
    t.string   "content_type"
    t.integer  "size"
    t.datetime "created_at"
  end

  create_table "auto_tip_contracts", force: true do |t|
    t.uuid     "product_id", null: false
    t.uuid     "user_id",    null: false
    t.decimal  "amount",     null: false
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
  end

  create_table "awards", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "awarder_id"
    t.uuid     "event_id"
    t.uuid     "wip_id"
    t.uuid     "winner_id"
    t.integer  "cents"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "bounty_postings", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "bounty_id",  null: false
    t.uuid     "poster_id",  null: false
    t.datetime "created_at", null: false
    t.datetime "expired_at"
  end

  add_index "bounty_postings", ["expired_at", "bounty_id"], name: "index_bounty_postings_on_expired_at_and_bounty_id", unique: true, using: :btree

  create_table "chat_rooms", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.string   "slug",       null: false
    t.uuid     "wip_id"
    t.uuid     "product_id"
    t.datetime "deleted_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "chat_rooms", ["slug"], name: "index_chat_rooms_on_slug", unique: true, using: :btree

  create_table "code_deliverables", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "wip_id",     null: false
    t.uuid     "user_id",    null: false
    t.string   "url",        null: false
    t.datetime "created_at"
  end

  create_table "completed_missions", id: false, force: true do |t|
    t.uuid     "id",           null: false
    t.uuid     "product_id",   null: false
    t.string   "mission_id",   null: false
    t.datetime "created_at",   null: false
    t.uuid     "completor_id", null: false
  end

  create_table "contract_holders", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "product_id", null: false
    t.uuid     "user_id",    null: false
    t.integer  "annuity",    null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "copy_deliverables", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "wip_id",     null: false
    t.uuid     "user_id",    null: false
    t.text     "body",       null: false
    t.datetime "created_at"
  end

  create_table "core_team_memberships", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "product_id", null: false
    t.uuid     "user_id",    null: false
    t.datetime "created_at"
  end

  add_index "core_team_memberships", ["user_id", "product_id"], name: "index_core_team_memberships_on_user_id_and_product_id", unique: true, using: :btree

  create_table "daily_actives", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.integer  "count"
    t.datetime "created_at"
  end

  create_table "deliverables", id: false, force: true do |t|
    t.uuid     "id",            null: false
    t.uuid     "wip_id",        null: false
    t.uuid     "attachment_id", null: false
    t.datetime "created_at"
  end

  create_table "email_logs", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "user_id",    null: false
    t.text     "key",        null: false
    t.hstore   "params",     null: false
    t.datetime "created_at", null: false
  end

  create_table "events", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.integer  "number",     null: false
    t.uuid     "wip_id",     null: false
    t.uuid     "user_id",    null: false
    t.string   "type",       null: false
    t.text     "body"
    t.text     "url"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.uuid     "event_id"
  end

  add_index "events", ["type", "wip_id"], name: "index_events_on_type_and_wip_id", using: :btree
  add_index "events", ["user_id"], name: "index_events_on_user_id", using: :btree
  add_index "events", ["wip_id", "number"], name: "index_events_on_wip_id_and_number", unique: true, using: :btree
  add_index "events", ["wip_id"], name: "index_events_on_wip_id", using: :btree

  create_table "expense_claim_attachments", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "expense_claim_id", null: false
    t.uuid     "attachment_id",    null: false
    t.datetime "created_at",       null: false
  end

  create_table "expense_claims", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "product_id",  null: false
    t.uuid     "user_id",     null: false
    t.integer  "total",       null: false
    t.string   "description"
    t.datetime "paid_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "features", id: false, force: true do |t|
    t.uuid     "id",                      null: false
    t.uuid     "user_id"
    t.uuid     "product_id"
    t.text     "title"
    t.text     "body"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "votes_count", default: 0, null: false
  end

  create_table "financial_accounts", id: false, force: true do |t|
    t.uuid     "id",                         null: false
    t.uuid     "product_id",                 null: false
    t.string   "name",                       null: false
    t.string   "type",                       null: false
    t.boolean  "contra",     default: false, null: false
    t.datetime "created_at",                 null: false
  end

  create_table "financial_amounts", id: false, force: true do |t|
    t.uuid    "id",             null: false
    t.string  "type",           null: false
    t.uuid    "account_id",     null: false
    t.uuid    "transaction_id", null: false
    t.integer "amount",         null: false
  end

  create_table "financial_transactions", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "product_id", null: false
    t.hstore   "details",    null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "global_interests", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "user_id"
    t.datetime "design"
    t.datetime "frontend"
    t.datetime "backend"
    t.datetime "marketing"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "interests", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.text     "slug",       null: false
    t.datetime "created_at", null: false
  end

  create_table "invites", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
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

  create_table "measurements", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "metric_id",  null: false
    t.decimal  "value",      null: false
    t.datetime "created_at", null: false
  end

  create_table "messages", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "author_id",  null: false
    t.text     "body"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "metrics", id: false, force: true do |t|
    t.uuid   "id",         null: false
    t.uuid   "product_id", null: false
    t.string "name",       null: false
  end

  create_table "milestone_images", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "user_id",       null: false
    t.uuid     "milestone_id",  null: false
    t.uuid     "attachment_id", null: false
    t.datetime "created_at",    null: false
  end

  create_table "milestone_tasks", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "milestone_id", null: false
    t.uuid     "task_id",      null: false
    t.datetime "created_at"
  end

  add_index "milestone_tasks", ["milestone_id", "task_id"], name: "index_milestone_tasks_on_milestone_id_and_task_id", unique: true, using: :btree

  create_table "milestones", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
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

  create_table "mutings", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "wip_id",     null: false
    t.uuid     "user_id",    null: false
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
  end

  create_table "newsletters", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.string   "subject"
    t.text     "body"
    t.datetime "published_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "cancelled_at"
  end

  create_table "offers", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "bounty_id",  null: false
    t.uuid     "user_id",    null: false
    t.integer  "amount",     null: false
    t.inet     "ip",         null: false
    t.datetime "created_at", null: false
  end

  create_table "perks", id: false, force: true do |t|
    t.uuid     "id",          null: false
    t.uuid     "product_id"
    t.integer  "amount"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",        null: false
  end

  create_table "pitch_week_applications", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "product_id",   null: false
    t.uuid     "applicant_id", null: false
    t.boolean  "is_approved"
    t.datetime "reviewed_at"
    t.uuid     "reviewer_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "posts", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "product_id", null: false
    t.uuid     "author_id",  null: false
    t.text     "body",       null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "title"
    t.string   "slug"
    t.text     "summary"
    t.datetime "flagged_at"
  end

  add_index "posts", ["flagged_at"], name: "index_posts_on_flagged_at", using: :btree
  add_index "posts", ["product_id", "flagged_at"], name: "index_posts_on_product_id_and_flagged_at", using: :btree
  add_index "posts", ["product_id", "slug"], name: "index_posts_on_product_id_and_slug", unique: true, using: :btree

  create_table "preorders", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "vote_id"
    t.integer  "amount",     null: false
    t.string   "charge_id"
    t.string   "card_id",    null: false
    t.datetime "charged_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.uuid     "user_id",    null: false
    t.uuid     "perk_id"
    t.inet     "ip"
    t.text     "variation"
  end

  create_table "product_subscriptions", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "product_id", null: false
    t.uuid     "user_id",    null: false
    t.datetime "created_at"
  end

  add_index "product_subscriptions", ["product_id", "user_id"], name: "index_product_subscriptions_on_product_id_and_user_id", unique: true, using: :btree

  create_table "product_trends", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "product_id"
    t.decimal  "score"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "product_trends", ["product_id"], name: "index_product_trends_on_product_id", unique: true, using: :btree

  create_table "products", id: false, force: true do |t|
    t.uuid     "id",                                                null: false
    t.string   "slug",                                              null: false
    t.string   "name",                                              null: false
    t.string   "pitch"
    t.text     "description"
    t.integer  "assembly_contribution",             default: 0,     null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.uuid     "user_id",                                           null: false
    t.text     "lead"
    t.integer  "view_count",                        default: 0
    t.text     "suggested_perks"
    t.string   "poster"
    t.integer  "votes_count",                       default: 0,     null: false
    t.uuid     "evaluator_id"
    t.datetime "greenlit_at"
    t.text     "free_perk"
    t.integer  "watchings_count",                   default: 0,     null: false
    t.text     "repos",                                                          array: true
    t.string   "authentication_token",                              null: false
    t.datetime "featured_on"
    t.string   "tags",                              default: [],                 array: true
    t.boolean  "can_advertise",                     default: false
    t.datetime "flagged_at"
    t.text     "flagged_reason"
    t.string   "homepage_url"
    t.string   "you_tube_video_url"
    t.integer  "commit_count",                      default: 0,     null: false
    t.datetime "founded_at"
    t.datetime "public_at"
    t.uuid     "main_thread_id"
    t.uuid     "logo_id"
    t.integer  "team_memberships_count",            default: 0
    t.hstore   "info"
    t.integer  "quality"
    t.datetime "last_activity_at"
    t.integer  "bio_memberships_count",             default: 0,     null: false
    t.datetime "started_building_at"
    t.datetime "live_at"
    t.integer  "partners_count"
    t.string   "wallet_public_address"
    t.binary   "encrypted_wallet_private_key"
    t.binary   "encrypted_wallet_private_key_salt"
    t.binary   "encrypted_wallet_private_key_iv"
    t.datetime "started_teambuilding_at"
    t.datetime "profitable_at"
  end

  add_index "products", ["authentication_token"], name: "index_products_on_authentication_token", unique: true, using: :btree
  add_index "products", ["profitable_at"], name: "index_products_on_profitable_at", using: :btree
  add_index "products", ["repos"], name: "index_products_on_repos", using: :btree
  add_index "products", ["slug"], name: "index_products_on_slug", unique: true, using: :btree
  add_index "products", ["started_teambuilding_at"], name: "index_products_on_started_teambuilding_at", using: :btree

  create_table "profit_reports", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid    "product_id",             null: false
    t.date    "end_at",                 null: false
    t.integer "revenue",                null: false
    t.integer "expenses",               null: false
    t.integer "coins"
    t.integer "annuity",    default: 0, null: false
  end

  create_table "rooms", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid    "product_id",  null: false
    t.integer "number",      null: false
    t.text    "target_type", null: false
    t.uuid    "target_id",   null: false
  end

  add_index "rooms", ["product_id", "number"], name: "index_rooms_on_product_id_and_number", unique: true, using: :btree

  create_table "saved_searches", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "user_id"
    t.text     "query"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "showcases", id: false, force: true do |t|
    t.uuid     "id",                     null: false
    t.uuid     "product_id"
    t.uuid     "wip_id"
    t.datetime "showcased_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "email_upcoming_sent_at"
    t.datetime "email_public_sent_at"
  end

  create_table "status_messages", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "product_id", null: false
    t.uuid     "user_id",    null: false
    t.string   "body",       null: false
    t.datetime "created_at", null: false
  end

  create_table "stories", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.string   "verb",         null: false
    t.string   "subject_type", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "stream_events", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "actor_id"
    t.uuid     "product_id"
    t.uuid     "subject_id",                      null: false
    t.string   "subject_type",                    null: false
    t.uuid     "target_id"
    t.string   "target_type"
    t.string   "verb",                            null: false
    t.string   "type",                            null: false
    t.boolean  "product_flagged", default: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "subscribers", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.datetime "created_at", null: false
    t.string   "email",      null: false
    t.uuid     "product_id", null: false
    t.uuid     "user_id"
    t.datetime "deleted_at"
  end

  add_index "subscribers", ["email", "product_id"], name: "index_subscribers_on_email_and_product_id", unique: true, using: :btree

  create_table "team_membership_interests", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "team_membership_id", null: false
    t.uuid     "interest_id",        null: false
    t.datetime "created_at",         null: false
  end

  create_table "team_memberships", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "product_id", null: false
    t.uuid     "user_id",    null: false
    t.boolean  "is_core",    null: false
    t.text     "bio"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "deleted_at"
  end

  add_index "team_memberships", ["user_id", "product_id"], name: "index_team_memberships_on_user_id_and_product_id", unique: true, using: :btree

  create_table "tips", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "product_id",                      null: false
    t.uuid     "from_id",                         null: false
    t.uuid     "to_id",                           null: false
    t.uuid     "via_id",                          null: false
    t.integer  "cents",                           null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "via_type",   default: "Activity", null: false
  end

  add_index "tips", ["product_id", "from_id", "to_id", "via_id"], name: "index_tips_on_product_id_and_from_id_and_to_id_and_via_id", unique: true, using: :btree

  create_table "transaction_log_entries", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "product_id",     null: false
    t.uuid     "work_id"
    t.uuid     "wallet_id",      null: false
    t.string   "action",         null: false
    t.text     "value"
    t.datetime "created_at"
    t.uuid     "transaction_id"
    t.hstore   "extra"
    t.integer  "cents"
  end

  create_table "uniques", id: false, force: true do |t|
    t.uuid     "id",          null: false
    t.uuid     "metric_id",   null: false
    t.string   "distinct_id", null: false
    t.datetime "created_at",  null: false
  end

  add_index "uniques", ["distinct_id", "created_at"], name: "index_uniques_on_distinct_id_and_created_at", using: :btree

  create_table "user_balance_entries", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.datetime "created_at",       null: false
    t.uuid     "user_id",          null: false
    t.uuid     "profit_report_id", null: false
    t.integer  "coins",            null: false
    t.integer  "earnings",         null: false
  end

  create_table "user_payment_options", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid   "user_id",         null: false
    t.string "type",            null: false
    t.string "bitcoin_address"
    t.string "recipient_id"
    t.string "last4"
  end

  create_table "user_tax_infos", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "user_id",            null: false
    t.string   "full_name"
    t.string   "business_name"
    t.string   "taxpayer_id"
    t.string   "taxpayer_type"
    t.string   "classification"
    t.string   "address"
    t.string   "city"
    t.string   "state"
    t.string   "zip"
    t.string   "country"
    t.string   "foreign_tax_id"
    t.string   "reference_number"
    t.date     "date_of_birth"
    t.string   "signatory"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "type",               null: false
    t.string   "citizenship"
    t.string   "mailing_address"
    t.string   "mailing_city"
    t.string   "mailing_state"
    t.string   "mailing_zip"
    t.string   "mailing_country"
    t.string   "treaty_article"
    t.string   "treaty_withholding"
    t.string   "treaty_income_type"
    t.string   "treaty_reasons"
    t.string   "signature_capacity"
  end

  create_table "user_withdrawals", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "user_id",         null: false
    t.integer  "reference",       null: false
    t.integer  "total_amount",    null: false
    t.integer  "amount_withheld", null: false
    t.datetime "payment_sent_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", id: false, force: true do |t|
    t.uuid     "id",                                                  null: false
    t.string   "name"
    t.string   "customer_id"
    t.boolean  "is_staff",                          default: false,   null: false
    t.string   "email",                                               null: false
    t.string   "encrypted_password"
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                     default: 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "confirmation_sent_at"
    t.datetime "confirmed_at"
    t.string   "confirmation_token"
    t.string   "unconfirmed_email"
    t.datetime "email_failed_at"
    t.string   "facebook_uid"
    t.text     "location"
    t.datetime "last_request_at"
    t.string   "avatar_url"
    t.text     "extra_data"
    t.string   "authentication_token"
    t.text     "bio"
    t.string   "archetype"
    t.string   "username",                                            null: false
    t.string   "mail_preference",                   default: "daily", null: false
    t.integer  "github_uid"
    t.string   "github_login"
    t.string   "payment_option"
    t.string   "paypal_email"
    t.string   "bank_account_id"
    t.string   "bank_name"
    t.string   "bank_last4"
    t.string   "address_line1"
    t.string   "address_line2"
    t.string   "address_city"
    t.string   "address_state"
    t.string   "address_zip"
    t.string   "address_country"
    t.datetime "personal_email_sent_on"
    t.text     "twitter_uid"
    t.text     "twitter_nickname"
    t.uuid     "recent_product_ids",                                               array: true
    t.string   "remember_token"
    t.string   "wallet_public_address"
    t.binary   "encrypted_wallet_private_key"
    t.binary   "encrypted_wallet_private_key_salt"
    t.binary   "encrypted_wallet_private_key_iv"
    t.datetime "welcome_banner_dismissed_at"
  end

  add_index "users", ["authentication_token"], name: "index_users_on_authentication_token", unique: true, using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["facebook_uid"], name: "index_users_on_facebook_uid", unique: true, using: :btree
  add_index "users", ["github_uid"], name: "index_users_on_github_uid", unique: true, using: :btree
  add_index "users", ["name"], name: "index_users_on_name", using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  add_index "users", ["username"], name: "index_users_on_username", unique: true, using: :btree

  create_table "versions", id: false, force: true do |t|
    t.uuid     "id",             null: false
    t.uuid     "versioned_id",   null: false
    t.string   "versioned_type", null: false
    t.uuid     "user_id",        null: false
    t.text     "modifications",  null: false
    t.integer  "number",         null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "votes", id: false, force: true do |t|
    t.uuid     "id",                             null: false
    t.uuid     "voteable_id",                    null: false
    t.uuid     "user_id",                        null: false
    t.inet     "ip",                             null: false
    t.datetime "created_at",                     null: false
    t.string   "voteable_type", default: "Idea"
  end

  add_index "votes", ["user_id", "voteable_id"], name: "index_votes_on_user_id_and_voteable_id", unique: true, using: :btree

  create_table "watchings", id: false, force: true do |t|
    t.uuid     "id",                 null: false
    t.uuid     "user_id",            null: false
    t.uuid     "watchable_id",       null: false
    t.string   "watchable_type",     null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "auto_subscribed_at"
    t.datetime "unwatched_at"
  end

  add_index "watchings", ["unwatched_at", "user_id", "watchable_type"], name: "index_watchings_on_unwatched_at_and_user_id_and_watchable_type", using: :btree
  add_index "watchings", ["watchable_id", "watchable_type"], name: "index_watchings_on_watchable_id_and_watchable_type", using: :btree

  create_table "whiteboard_assets", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "event_id",   null: false
    t.string   "image_url",  null: false
    t.string   "format",     null: false
    t.integer  "height",     null: false
    t.integer  "width",      null: false
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
  end

  add_index "whiteboard_assets", ["event_id", "image_url"], name: "index_whiteboard_assets_on_event_id_and_image_url", unique: true, using: :btree

  create_table "wip_taggings", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "wip_tag_id", null: false
    t.uuid     "wip_id",     null: false
    t.datetime "created_at"
  end

  create_table "wip_tags", id: false, force: true do |t|
    t.uuid     "id",                          null: false
    t.string   "name",                        null: false
    t.datetime "created_at"
    t.integer  "watchings_count", default: 0, null: false
  end

  add_index "wip_tags", ["name"], name: "index_wip_tags_on_name", unique: true, using: :btree

  create_table "wip_workers", id: false, force: true do |t|
    t.uuid     "id",                           null: false
    t.uuid     "wip_id",                       null: false
    t.uuid     "user_id",                      null: false
    t.datetime "created_at"
    t.datetime "last_checkin_at"
    t.datetime "last_response_at"
    t.integer  "checkin_count",    default: 0
  end

  add_index "wip_workers", ["wip_id", "user_id"], name: "index_wip_workers_on_wip_id_and_user_id", unique: true, using: :btree

  create_table "wips", id: false, force: true do |t|
    t.uuid     "id",                                           null: false
    t.uuid     "user_id",                                      null: false
    t.uuid     "product_id",                                   null: false
    t.text     "title",                                        null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "number"
    t.uuid     "closer_id"
    t.datetime "closed_at"
    t.integer  "votes_count",                default: 0,       null: false
    t.uuid     "winning_event_id"
    t.datetime "promoted_at"
    t.integer  "events_count",               default: 0,       null: false
    t.integer  "comments_count",             default: 0,       null: false
    t.datetime "pinned_at"
    t.integer  "trending_score",   limit: 8
    t.string   "state"
    t.string   "type"
    t.string   "deliverable",                default: "other", null: false
    t.decimal  "multiplier",                 default: 1.0,     null: false
    t.decimal  "author_tip",                 default: 0.0,     null: false
    t.text     "description"
  end

  add_index "wips", ["product_id", "number"], name: "index_wips_on_product_id_and_number", unique: true, using: :btree
  add_index "wips", ["product_id", "promoted_at"], name: "index_wips_on_product_id_and_promoted_at", using: :btree
  add_index "wips", ["product_id"], name: "index_wips_on_product_id", using: :btree

  create_table "work", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "product_id",              null: false
    t.uuid     "user_id"
    t.text     "url",                     null: false
    t.json     "metadata",                null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "votes_count", default: 0, null: false
  end

  create_table "work_applications", id: false, force: true do |t|
    t.uuid     "id",         null: false
    t.uuid     "user_id",    null: false
    t.uuid     "product_id", null: false
    t.datetime "created_at"
  end

end
