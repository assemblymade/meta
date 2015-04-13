class AwardMailerPreview < ActionMailer::Preview
  def pending_award
    award = Award.where.not(guest_id: nil).sample
    AwardMailer.pending_award(award.guest_id, award.id)
  end
end
