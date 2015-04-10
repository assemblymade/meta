class AwardMailer < BaseMailer
  layout 'email_tile'

  helper :markdown
  helper :app_icon
  helper :firesize

  def pending_award(guest_id, award_id)
    @guest = Guest.find(guest_id)
    @award = Award.find(award_id)
    @bounty = @award.wip
    @product = @bounty.product

    @fun = "Let's get it started"

    mail   to: @guest.email,
      subject: "You've received #{@award.cents} #{@product.name} coins"
  end
end
