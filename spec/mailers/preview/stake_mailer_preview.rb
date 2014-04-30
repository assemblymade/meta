class StakeMailerPreview < ActionMailer::Preview

  def stake_updated
    user = Stake::AllocationEvent.sample.user
    StakeMailer.stake_updated(user.id)
  end

end
