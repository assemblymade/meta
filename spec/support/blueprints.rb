require 'machinist/active_record'

Activity.blueprint do
  subject  { Task.make! }
  actor    { User.make! }
  target   { Event::Comment.make! }
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

Discussion.blueprint do
  user
  product
  number      { (sn.to_i * 10) + 1 }
  title { "Title #{sn}"}
end

Milestone.blueprint do
  user
  product
  wip
end

Interest.blueprint do
  slug { "interest_#{sn}"}
end

Perk.blueprint do
  product
  amount      { sn.to_i * 100 }
  name        { Faker::Company.name }
  description { Faker::Lorem.paragraph(1) }
end

Product.blueprint do
  user
  name  { "Product #{sn}" }
  pitch { Faker::Lorem.paragraph(1) }
  can_advertise { true }
end

Preorder.blueprint do
  user
  perk
  card_id { "card_103PgS2eZvKYlo2CpomG3L9L" }
end

Task.blueprint do
  user
  product
  number      { (sn.to_i * 100) + 1 }
  title       { Faker::Company.name }
  deliverable { 'design' }
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

Event::Comment.blueprint do
  user
  wip  { Discussion.make! }
  body { Faker::Lorem.paragraph }
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

Post.blueprint do
  product
  author
  title { "My Post #{sn}" }
  summary { "Post subject #{sn}" }
  body { Faker::Lorem.paragraphs(3).join }
end
