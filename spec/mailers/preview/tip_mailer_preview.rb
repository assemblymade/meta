class TipMailerPreview < ActionMailer::Preview

  def tipped
    begin
      tip = Tip.where(via_type: NewsFeedItemComment).sample
    end until !tip.via.nil?

    TipMailer.tipped(tip)
  end

end
