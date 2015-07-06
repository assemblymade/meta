class UserMailer < BaseMailer
  helper :avatar, :markdown, :wip

  layout 'email', only: [:welcome,
                         :joined_team_no_introduction_yet,
                         :featured_wips,
                         :twelve_hour_reminder,
                         :bounty_holding_incoming,
                         :bounty_holding_incoming_take2]

  def bounty_holding_incoming(user_id, task_ids)
    @user = User.find(user_id)
    @wips = Task.find(task_ids)
    @product = @wips.first.product

    mail from: "Austin from Assembly <austin.smith@assembly.com>",
           to: @user.email,
      subject: "Bounty Expiration"
  end

  def bounty_holding_incoming_take2(user_id, task_ids)
    @user = User.find(user_id)
    @wips = Task.find(task_ids)

    mail from: "Chuck from Assembly <chuck@assembly.com>",
           to: @user.email,
      subject: "Bounty Expiration -- Take 2 (and apologies)"
  end

  def follow_up(user_id)
    mailgun_tag 'user#follow_up'
    mailgun_campaign 'community'

    @user = User.find(user_id)
    @user.touch(:personal_email_sent_on)

    mail from: "austin.smith@assembly.com",
           to:  @user.email,
      subject: "Assembly"
  end

  def twelve_hour_reminder(user_id, wip_id)
    mailgun_tag 'user#twelve_hour_bounty_reminder'

    @user = User.find(user_id)
    @wip = Task.find(wip_id)
    @product = @wip.product

    Analytics.track(
      user_id: @user.id,
      event: 'product.wip.send_twelve_hour_reminder',
      properties: WipAnalyticsSerializer.new(@wip, scope: @user).as_json
    )

    mail from: "austin.smith@assembly.com",
           to: @user.email,
      subject: "Just 12 hours left for #{@wip.title} on #{@product.name}"
  end

  def featured_wips(user)
    mailgun_tag 'user#featured_wips'
    mailgun_campaign 'notifications'

    @user = user

    mail from: "Austin from Assembly <austin.smith@assembly.com>",
           to: @user.email,
      subject: "Today’s featured bounties on Assembly"
  end

  def featured_work_apology(product, user)
    mailgun_campaign 'community'

    @product = product
    @user = user
    @example = Product.find_by(slug: 'coderwall')

    mail from: "Austin Smith <austin.smith@assembly.com>",
           to: @user.email,
      subject: "Can I help grow the #{@product.name} team?"
  end

  def remind_user_of_their_claimed_work(user_id, wip_id)
    mailgun_campaign 'community'
    mailgun_tag 'user#remind_user_claimed_work'

    @user     = User.find(user_id)
    @wip      = Wip.find(wip_id)
    @worker   = Wip::Worker.where(:user_id => @user.id, :wip_id => @wip.id).first
    @watchers = (@wip.product.followers.random.limit(3).to_a - [@user])[0...2]

    mail from: "matt@assembly.com",
           to:  @user.email,
          bcc: "matt@assembly.com",
      subject: "RE: #{@wip.title}"
  end

  def joined_team_no_introduction_yet(membership_id)
    mailgun_campaign 'notifications'
    mailgun_tag 'user#joined_team_no_introduction_yet'

    @membership = TeamMembership.find(membership_id)
    @user = @membership.user
    @product = @membership.product

    mail from: 'austin@assembly.com',
           to: @user.email,
      subject: "Introduce yourself to the #{@product.name} team"
  end

  protected

  def mailgun_tag(name)
    headers 'X-Mailgun-Tag' => name.to_s
  end

end
