class BadgeMailerPreview < ActionMailer::Preview

  def first_win
    BadgeMailer.first_win Event::Win.sample.event.id
  end

end
