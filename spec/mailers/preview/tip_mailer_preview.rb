class TipMailerPreview < ActionMailer::Preview

  def tipped
    TipMailer.tipped(Tip.sample)
  end

end
