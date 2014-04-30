if ENV['TWITTER_API_KEY']
  Rails.application.config.middleware.use OmniAuth::Builder do
    provider :twitter, ENV['TWITTER_API_KEY'], ENV['TWITTER_API_SECRET'], secure_image_url: true
  end
end