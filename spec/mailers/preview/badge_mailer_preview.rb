class BadgeMailerPreview < ActionMailer::Preview

  def awarded
    BadgeMailer.first_win Event::Win.sample.event.id
  end

end
