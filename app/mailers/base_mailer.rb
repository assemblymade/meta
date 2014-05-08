class BaseMailer < ActionMailer::Base

  layout 'email'

  before_action :set_list_unsubscribe_headers
  before_action :set_date
  after_action  :prevent_delivery_to_unsubscribed_users

  private

  def mailgun_tag(name)
    @mailgun_tag = name.to_s
    headers 'X-Mailgun-Tag' => @mailgun_tag
  end

  def set_list_unsubscribe_headers
    headers 'List-Unsubscribe' => '%unsubscribe_email%'
  end

  def set_date
    @date = Date.today
  end

  def prevent_delivery_to_unsubscribed_users
    if @user && @user.mail_never?
      mail.perform_deliveries = false
    end
  end

end
