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

  task :verify_gravatar => :environment do
    client = Faraday.new(url: "https://gravatar.com") do |faraday|
      faraday.adapter  :net_http
    end

    User.where('gravatar_checked_at is null or gravatar_checked_at < ?', 7.days.ago).find_each do |user|
      digest = Digest::MD5.hexdigest(user.email)
      status = client.get("/avatar/#{digest}", d: 404).status
      puts "gravatar check: #{user.email} #{status}"

      user.update!(
        gravatar_checked_at: Time.now,
        gravatar_verified_at: (Time.now if status != 404)
      )
    end
  end
end
