class PerkDecorator < ApplicationDecorator
  def formatted_amount(user)
    if user && user.preordered_perk?(self)
      "Pre-ordered"
    else
      "Pre-order for #{helpers.amount_to_currency(discount_amount)}"
    end
  end

  def formatted_discount_percent_off
    "-#{discount_percent_off}%"
  end
end
