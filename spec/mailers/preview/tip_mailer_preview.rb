class TipMailerPreview < ActionMailer::Preview

  def tipped
    begin
      tip = Tip.uncached{ Tip.where(via_type: Activity).sample }
    end until !tip.via.nil?

    TipMailer.tipped(tip)
  end

end
