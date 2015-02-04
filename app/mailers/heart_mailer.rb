class HeartMailer < BaseMailer
  layout 'email_tile'

  helper :markdown
  helper :app_icon
  helper :firesize

  def hearts_received(user_id, heart_ids)
    mailgun_campaign 'hearts'
    mailgun_tag 'hearts'

    @user = User.find(user_id)
    @hearts = Heart.find(heart_ids)
    @heartables = @hearts.group_by(&:heartable)
    @lovers = User.where(id: @hearts.group_by(&:user_id).keys)
    @products = @heartables.keys.map(&:product).compact.uniq

    lovers_description = case @lovers.size
    when 1
      "@#{@lovers[0].username} likes"
    when 2
      "@#{@lovers[0].username} and @#{@lovers[1].username} like"
    else
      "@#{@lovers[0].username} and #{@lovers.size - 1} others like"
    end

    @fun = [
      "It's in the air.",
      "Everywhere I look around.",
      "In the whisper of the trees.",
      "In the rising of the sun.",
    ].sample

    prevent_delivery_to_unsubscribed_users

    mail   to: @user.email,
      subject: "#{lovers_description} your stuff!"
  end
end
