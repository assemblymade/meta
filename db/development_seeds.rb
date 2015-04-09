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
                 email:    'dave@assembly.com',
                 location: 'San Francisco, CA',
                 is_staff: true

chris = make_user name:     'Chris Lloyd',
                  username: 'chrislloyd',
                  email:    'chris@assembly.com',
                  location: 'San Francisco, CA',
                  is_staff: true

matt = make_user name:     'Matt Deiters',
                 username: 'mdeiters',
                 email:    'm@assembly.com',
                 location: 'San Francisco, CA',
                 is_staff: true


# example ideas

kjdb = Product.create!(
  user: dave,
  name: 'KJDB',
  pitch: 'Manage your Karaoke life',
  lead: 'Helps you find karaoke venues and songs to sing',
  description: 'An app that helps you find karaoke venues and songs to sing',
  submitted_at: 7.days.ago,
  evaluated_at: 5.days.ago,
  started_pitch_week: Time.now
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
  started_pitch_week: nil
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
  started_pitch_week: Time.now
)
