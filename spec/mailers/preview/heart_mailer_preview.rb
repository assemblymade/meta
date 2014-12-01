class HeartMailerPreview < ActionMailer::Preview
  def hearts_received
    HeartMailer.hearts_received(User.sample.id, Heart.pluck(:id))
  end
end
