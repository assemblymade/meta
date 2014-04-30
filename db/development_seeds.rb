puts "WARNING: Loading additional test data from db/development_seeds.rb"

FAKE_IP = '1.0.0.0'

def seed_idea_description(filename)
  File.read(File.join(Rails.root, 'db','seeds', filename))
end

def make_user(attributes = {})
  user = User.new(attributes)
  user.username ||= user.name.downcase.gsub(/\s/, '')
  user.password, user.password_confirmation = 'password'
  user.save!
  user
end

# Users

dave = make_user name:     'Dave Newman',
                 username: 'whatupdave',
                 email:    'dave@assemblymade.com',
                 location: 'San Francisco, CA',
                 is_staff: true

chris = make_user name:     'Chris Lloyd',
                  username: 'chrislloyd', 
                  email:    'chris@assemblymade.com',
                  location: 'San Francisco, CA',
                  is_staff: true

matt = make_user name:     'Matt Deiters',
                 username: 'mdeiters',
                 email:    'm@assemblymade.com',
                 location: 'San Francisco, CA',
                 is_staff: true

# --

allan = make_user name:     'Allan Branch',
                  email:    'allan@lesseverything.com',
                  location: 'Panama City, Florida'

garry = make_user name:       'Garry Tan',
                  email:      'm+garrytan@assemblymade.com',
                  location:   'Mountain View, CA',
                  avatar_url: 'avatars/garrytan.jpg'

emmet = make_user name:       'Emmett Shear',
                  email:      'm+emmett@assemblymade.com',
                  location:   'San Francisco, CA',
                  avatar_url: 'avatars/emmetshear.jpeg'

kevin = make_user name:       'Kevin Hale',
                  email:      'm+kevinhale@assemblymade.com',
                  location:   'San Francisco, CA',
                  avatar_url: 'avatars/kevinhale.jpeg'

stammy = make_user name:       'Paul Stamatiou',
                   email:      'm+stammy@assemblymade.com',
                   location:   'San Francisco, CA',
                   avatar_url: 'avatars/stammy.png'

josh = make_user name:       'Josh Elman',
                 email:      'm+joshelman@assemblymade.com',
                 location:   'California',
                 avatar_url: 'avatars/joshelman.png'

scoble = make_user name:       'Robert Scoble',
                   email:      'm+scobleizer@assemblymade.com',
                   location:   'Half Moon Bay, CA',
                   avatar_url: 'avatars/scoble.jpeg'

justin = make_user name:       'Justin Kan',
                   email:      'm+justin@assemblymade.com',
                   location:   'San Francisco, CA',
                   avatar_url: 'avatars/justinkan.jpg'

hunter = make_user name:       'Hunter Walk',
                   email:      'm+hunter@assemblymade.com',
                   location:   'California',
                   avatar_url: 'avatars/hunterwalk.png'


satya = make_user name:       'Satya Patel',
                  email:      'm+satyapatel@assemblymade.com',
                  location:   'California',
                  avatar_url: 'avatars/satyapatel.png'
# example ideas

kjdb = Product.create!(
  user: dave,
  name: 'KJDB',
  pitch: 'Manage your Karaoke life',
  lead: 'Helps you find karaoke venues and songs to sing',
  description: 'An app that helps you find karaoke venues and songs to sing',
  submitted_at: 7.days.ago,
  evaluated_at: 5.days.ago,
  is_approved: false
)

key_cutter = Product.create!(
  user: chris,
  created_at: 26.hours.ago,
  name: 'Key Cutter',
  pitch: 'Hassle free key cutting',
  lead: 'Take a photo of your key and you get a copy in the mail',
  description: 'Take a photo of your key and you get a copy in the mail',
  submitted_at: 7.days.ago,
  evaluated_at: 5.days.ago,
  is_approved: false
)

splitty = Product.create!(
  user: dave,
  slug: 'splitty',
  name: 'Splitty',
  pitch: 'Simple bill splitting',
  poster: 'posters/splitty.jpg',
  lead: 'Takes the hassle out of splitting the bill with friends at restaurants and other places.',
  description: seed_idea_description('splitty.md'),
  submitted_at: 3.days.ago,
  evaluated_at: 5.days.ago,
  is_approved: true,
  perks: [
    Perk.new(
      amount: 500,
      name: "One year unlimited",
      description: "Unlimited transactions for you and your friends when you use Splitty in the first year."
    )
  ] ,
  # features: [
  #   Feature.new(user: matt, title: 'Allow friends to pay you with photo of their credit card'),
  #   Feature.new(user: dave,  title: 'Integrate with Venmo for payment'),
  #   Feature.new(user: dave,  title: 'Integrate with Square for payment'),
  #   Feature.new(user: matt,  title: 'iOS SDK so other apps can use splitty')
  # ]
)

garrys_groups = Product.create!(
  user:   garry,
  slug:   'garrys-groups',
  name:   "Garry's Groups",
  poster: 'posters/garrys-groups.jpg',
  pitch:  'Simple, private & fun email groups',
  lead:   "Garry's Groups is a tool that lets groups of people send emails to each other. It should be easy and friendly to use. The product doesn't have to be complicated, it just does one thing well: manage lists for people to email.",
  description: seed_idea_description('garrys-groups.md'),
  submitted_at: 3.days.ago,
  is_approved: true,
  perks: [
    Perk.new(
      amount: 1900,
      name: "3 Months Unlimited",
      description: "3 months of unlimited groups Garry's Groups to run your own groups. Add as many members to your groups and everyone can receive their groups's messages over the web, their inbox, and configurable webhooks."
    ),
    Perk.new(
      amount: 3900,
      name: '6 Months Unlimited',
      description: "An entire year of unlimited groups Garry's Groups to run your own groups. Add as many members to your groups and everyone can receive their groups's messages over the web, their inbox, and configurable webhooks."
    ),
    Perk.new(
      amount: 290000,
      name:   '2 years enterprise',
      description: "Run Garry's groups and all its features in your enterprise behind the firewall. Get a unlimited seat license to use Garry's Groups in your enterprise on your own infrastructure for a full two years."
    )
  ]
)

amail = Product.create!(
  user:   emmet,
  slug:   'amail',
  name:   "AMail",
  poster: 'posters/amail.jpg',
  pitch:  "Email that doesn't read your email",
  lead:   "A hassle-free hacker-friendly alternative to GMail. Simple freemium model, no ads, and complete privacy. Even use your own domain.",
  description: seed_idea_description('amail.md'),
  submitted_at: 3.hours.ago,
  is_approved: true,
  perks: [
    Perk.new(
      amount: 5000,
      name: "1 year hosted",
      description: "Full year of hosted, private email with your own domain and unlimited storage"
    )
  ]
)

support_foo = Product.create!(
  user:   kevin,
  slug:   'support-foo',
  name:   "Support Foo",
  poster: 'posters/support-foo.jpg',
  pitch:  "Support that makes you better at support",
  lead:   "Light & fast performance incentivized support software.",
  description: seed_idea_description('supportfoo.md'),
  submitted_at: 1.week.ago,
  is_approved: true,
  perks: [
    Perk.new(
      amount: 19900,
      name: "One year Cloud",
      description: "Full year of unlimited support issues and users"
    ),
    Perk.new(
      amount: 200000,
      name: "One year Enterprise",
      description: "Host SupportFoo in your environment and handle unlimited support issues and users for a full year."
    )
  ]
)

rawbox = Product.create!(
  user:   stammy,
  slug:   'raw-box',
  name:   "RAW Box",
  poster: 'posters/raw-box.jpg',
  pitch:  "RAW photos in the cloud",
  lead:   "There comes a time in every photographer's life when they must ask themselves what to do about all those photo RAWs filling up the tiny-compared-to-spinning-platters SSD on their primary machine. Rawbox would be a cheap and redudant storage solution for photography professionals & enthusiasts.",
  description: seed_idea_description('rawbox.md'),
  submitted_at: 1.month.ago,
  is_approved: true,
  perks: [
    Perk.new(
      amount: 10000,
      name: "One year unlimited",
      description: "A full year of RAWbox for your personal use (does not include AWS fees)"
    )
  ],
  # features: [
  #   Feature.new(user: stammy, title: "Tag individual photos as priority so they are more readily accessible", body: "Priority photos would be stored on S3 and/or remain local."),
  #   Feature.new(user: stammy, title: "Keep small jpegs terof photos & albums locally. ", body: "User can specify what resolution to store locally"),
  #   Feature.new(user: stammy, title: "Simple filters to view photos taken by year, album, & location"),
  #   Feature.new(user: stammy, title: "Mark an albulm to be restored from backup", body: "Initiates a Glacier retrieval locally or on S3, with email notification when transfers are complete")
  # ]
)

calmail = Product.create!(
  user: josh,
  slug:   'calmail',
  name:   "CalMail",
  poster: 'posters/calmail.jpg',
  pitch:  "Your day's meetings summarized nightly",
  lead:   "Calmail would integrate with your calendar to send a summarization of your day's meetings in a clean daily email digest. Each digest could help you recall the action items for the day, easily create follow-up reminders, and could be archived & searched for later all from your favorite mail client.",
  description: seed_idea_description('calmail.md'),
  submitted_at: 3.days.ago,
  is_approved: true,
  perks: [
    Perk.new(
      amount: 5000,
      name: "Pro Account",
      description: "A full year of Calmail ad-free with all the pro features enabled."
    )
  ]
)

housecall = Product.create!(
  user: josh,
  slug:   'housecall',
  name:   "Housecall",
  poster: 'posters/housecall.jpg',
  pitch:  "Facetime with a professional handyman",
  lead:   "Something broken or needing repair at your house? Housecall would connect you to a reputable professional handyman in minutes to help you diagnos or even solve the problem.",
  description: seed_idea_description('housecall.md'),
  submitted_at: 3.days.ago,
  is_approved: true,
  perks: [
    Perk.new(
      amount: 3000,
      name: "Backer",
      description: "3 Handyman consultations"
    )
  ]
)

glass_juice = Product.create!(
  user:   scoble,
  slug:   'glass-juice',
  name:   "Glass Juice",
  poster: 'posters/glass-juice.jpg',
  pitch:  "Turn-by-turn navigation to power outlets",
  lead:   "Have a long wait in an airport, simply say 'OK Glass, where is the closest power outlet?' and Glass Juice will give you turn by turn navigation to a power source.",
  description: seed_idea_description('glass-juice.md'),
  submitted_at: 1.hour.ago,
  is_approved: true,
  perks: [
    Perk.new(
      amount: 900,
      name: "Domestic",
      description: "Unlimited requests from your Google Glass, iPhone, or Andriod for power outlets at all mapped Domestic airport terminals"
    )
  ]
)

follow_roulette = Product.create!(
  user:   allan,
  slug:   "follow-roulette",
  name:   "Follow Roulette",
  # poster: 'posters/housecall.jpg',
  pitch:  "A better feed for your Twitter",
  lead:   "anyone can promoted.",
  description: seed_idea_description('follow-roulette.md'),
  submitted_at: 1.hour.ago,
  is_approved: false,
  perks: [],
  # features: []
)

hands_free_kitchen  = Product.create!(
  user:   justin,
  slug:   "hands-free-kitchen",
  name:   "Hands Free Kitchen",
  poster: 'posters/glass-cook-book.png',
  pitch:  "Hands-free Google Glass cookbook",
  lead:   "Step-by-step instructions to prepare and cook an amazing meal. Using simple voice commands, Google Glass would display each step of a receipe, leaving your completely hands free.",
  description: seed_idea_description('hands-free-kitchen.md'),
  submitted_at: 1.hour.ago,
  is_approved: true,
  perks: []
)

swear_jar = Product.create!(
  user:   hunter,
  slug:   "swear-jar",
  name:   "Swear Jar",
  poster: 'posters/swear-jar.jpg',
  pitch:  "Incentivizing Groups' Goals",
  lead:   "One or more people commit to a goal and then pay money into a communal jar if they fail to meet goal.",
  description: seed_idea_description('swear-jar.md'),
  submitted_at: 1.hour.ago,
  is_approved: true,
  perks: [
    Perk.new(
      amount: 1900,
      name: "Uncensored",
      description: "Unlimited swear jars for unlimited team members for 3 months. (credit card processing not included)"
    )
  ]
)


logistical = Product.create!(
  user:   satya,
  slug:   "logistical",
  name:   "Logistical",
  poster: 'posters/logistics.jpg',
  pitch:  "Stripe for Logistics",
  lead:   "..",
  description: seed_idea_description('logistical.md'),
  submitted_at: 1.hour.ago,
  is_approved: true,
  # perks: [
  #   Perk.new(
  #     amount: 9000,
  #     name: "Unlimited",
  #     description: "One year of unlimited use"
  #   )
  # ]
)

# Build leaderboard

IdeaLeaderboard.new(Leaderboard.new($redis)).rebuild!
