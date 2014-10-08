class UserMailer < BaseMailer
  helper :avatar, :markdown, :wip

  layout 'email', only: [:welcome, :joined_team_no_work_yet, :joined_team_no_introduction_yet, :featured_wips]

  def welcome(user_id)
    mailgun_tag 'user#welcome'
    mailgun_campaign 'community'

    @user = User.find(user_id)

    mail from: "matt@assembly.com",
           to:  @user.email,
      subject: "Your Assembly welcome package"
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

  def joined_team_no_work_yet(membership_id)
    mailgun_campaign 'community'
    mailgun_tag 'user#joined_team_no_work_yet'

    @membership = TeamMembership.find(membership_id)
    @user = @membership.user
    @product = @membership.product

    mail from: 'austin@assembly.com',
           to: @user.email,
      subject: "Need help getting started on #{@product.name}?"
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
