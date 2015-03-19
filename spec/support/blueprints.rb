require 'machinist/active_record'

Activity.blueprint do
  subject  { NewsFeedItem.make! }
  actor    { User.make! }
  target   { NewsFeedItemComment.make! }
end

Activities::Post.blueprint do
  subject  { Task.make! }
  actor    { User.make! }
  target   { NewsFeedItemComment.make! }
end

AssemblyAsset.blueprint do
  product { Product.make! }
  user { User.make! }
  amount { 10 }
end

Asset.blueprint do
  product { Product.make! }
  user { User.make! }
  attachment { Attachment.make!(user: user) }
end

Attachment.blueprint do
  user
  name { Faker::Name.name }
end

AutoTipContract.blueprint do
  user
  product
  amount { 0.1 }
end

Award.blueprint do
  awarder
  winner
  event
  wip
end

BountyPosting.blueprint do
  poster { User.make! }
  bounty
end

ChatRoom.blueprint do
  wip
  slug { "room_#{sn}" }
end

Discussion.blueprint do
  user
  product
  number      { (sn.to_i * 10) + 1 }
  title { "Title #{sn}"}
end

Heart.blueprint do
  user
  heartable { NewsFeedItem.make! }
end

Milestone.blueprint do
  user
  product
  wip
end

Idea.blueprint do
  user
  body { Faker::Lorem.paragraphs(2).join }
  name { Faker::Company.name }
  news_feed_item { NewsFeedItem.make! }
  greenlit_at { nil }
end

Interest.blueprint do
  slug { "interest_#{sn}"}
end

NewsFeedItem.blueprint do
  source
  product
  target { Task.make! }
end

NewsFeedItemPost.blueprint do
  product
  news_feed_item { NewsFeedItem.make! }
end

NewsFeedItemComment.blueprint do
  news_feed_item
  user
  body { Faker::Lorem.paragraph(1) }
end

Post.blueprint do
  product
  author
  title { "My Post #{sn}" }
  summary { "Post subject #{sn}" }
  body { Faker::Lorem.paragraphs(3).join }
end

Product.blueprint do
  user
  name  { "Product #{sn}" }
  slug  { "product-#{sn}" }
  pitch { Faker::Lorem.paragraph(1) }
end

Story.blueprint do
  verb          { 'Start' }
  subject_type  { 'Discussion' }
  activities    { [Activities::Post.make!(subject: Discussion.make!)] }
end

Task.blueprint do
  user
  product
  number      { (sn.to_i * 100) + 1 }
  title       { Faker::Company.name }
  description { 'Make it awesome' }
end

TeamMembership.blueprint do
  user
  product
  is_core { false }
  bio { Faker::Lorem.paragraph(1) }
end

User.blueprint do
  name     { Faker::Name.name }
  username { "#{Faker::Name.first_name.gsub(/\W/, '').downcase}#{sn}" }
  email    { Faker::Internet.email }
  password              { 'password' }
  password_confirmation { 'password' }
  last_sign_in_ip       { '1.1.1.1'}
  flagged_at { nil }
end

UserIdentity.blueprint do
  user
end

Wip.blueprint do
  user
  product
  number { (sn.to_i * 1000) + 1 }
  title { "Title #{sn}" }
end

Work.blueprint do
  url do
    "https://github.com/helpful/web/commit/#{OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new('sha1'), '', SecureRandom.uuid)}"
  end
  user
  product
  metadata {{
    author: {
      name: "Dave Newman",
      email: "dave@assembly.com",
      username: "whatupdave"
    },
    message: "I just made some rad code",
    distinct: true
  }}
end

Financial::Account.blueprint do
  name { "Account #{sn}" }
  contra { false }
end

Financial::Asset.blueprint {}
Financial::Liability.blueprint {}
Financial::Equity.blueprint {}
Financial::Revenue.blueprint {}
Financial::Expense.blueprint {}
