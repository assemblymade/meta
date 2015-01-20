class BadgeMailerPreview < ActionMailer::Preview

  def first_win
    BadgeMailer.first_win NewsFeedItemComment.sample.id
  end

end
