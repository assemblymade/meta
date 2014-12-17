class HeartMailerPreview < ActionMailer::Preview
  def hearts_received
    HeartMailer.hearts_received(User.sample.id, Heart.limit(10).pluck(:id))
  end
end
