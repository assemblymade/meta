class UserMailer < Devise::Mailer
  helper :markdown, :wip

  layout 'email', only: :welcome

  def welcome(user_id)
    tag 'user#welcome'

    @user = User.find(user_id)

    mail from: "matt@assemblymade.com",
           to:  @user.email,
      subject: "Your Assembly welcome package"
  end

  def follow_up(user_id)
    tag 'user#follow_up'

    @user = User.find(user_id)
    @user.touch(:personal_email_sent_on)

    mail from: "matt@assemblymade.com",
           to:  @user.email,
      subject: "Assembly"
  end

  def remind_user_of_their_claimed_work(user_id, wip_id)
    tag 'user#remind_user_claimed_work'

    @user     = User.find(user_id)
    @wip      = Wip.find(wip_id)
    @worker   = Wip::Worker.where(:user_id => @user.id, :wip_id => @wip.id).first
    @watchers = (@wip.watchers.random.limit(3).to_a - [@user])[0...2]

    mail from: "matt@assemblymade.com",
           to:  @user.email,
          bcc: "matt@assemblymade.com",
      subject: "RE: #{@wip.title}"
  end

  protected

  def tag(name)
    headers 'X-Mailgun-Tag' => name.to_s
  end
  
end
