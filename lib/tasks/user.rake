namespace :users do

  task :reset_authentication_tokens => :environment do
    def generate_authentication_token
      loop do
        token = Devise.friendly_token
        break token unless User.where(authentication_token: token).first
      end
    end

    User.all.each do |user|
      user.update(authentication_token: generate_authentication_token)
    end
  end
end
