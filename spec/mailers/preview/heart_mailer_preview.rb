class HeartMailerPreview < ActionMailer::Preview
  def hearts_received
    HeartMailer.hearts_received(
      User.sample.id,
      Heart.random.limit(100).select{|h| !h.heartable.nil? }.take(10).map(&:id)
    )
  end
end
