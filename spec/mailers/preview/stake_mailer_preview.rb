class StakeMailerPreview < ActionMailer::Preview

  def stake_updated
    event = Event::Win.sample
    user = event.user
    StakeMailer.coin_balance(event.wip.product.id, user.id)
  end

end
