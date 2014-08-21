class TextMailer < Devise::Mailer

  def pitch_week_intro(user_id, product_id)
    mailgun_tag 'user#pitch_week_intro'

    @user = User.find(user_id)
    @product = Product.find(product_id)

    mail from: "Austin Smith <austin@assembly.com>",
           to:  @user.email,
      subject: "hey"
  end

  protected

  def mailgun_tag(name)
    headers 'X-Mailgun-Tag' => name.to_s
  end

end
