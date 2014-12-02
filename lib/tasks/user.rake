namespace :users do

  task :reset_authentication_tokens => :environment do
    User.all.each do |user|
      user.update(authentication_token: user.generate_authentication_token)
    end
  end
end
