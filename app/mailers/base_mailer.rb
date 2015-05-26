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

  def mailgun_campaign(campaign_id)
    @mailgun_campaign = campaign_id.to_s
    headers 'X-Mailgun-Campaign-Id' => @mailgun_campaign
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

  def prevent_delivery
    mail.perform_deliveries = false
  end

  def list_headers(object_type, object_id, username, thread_parts, message_parts, archive_url)
    reply_address = SecureReplyTo.new(object_type, object_id, username).to_s

    thread_id = thread_parts.join('/')
    thread_address = "<#{thread_id}@assembly.com>"
    message_id = "<#{message_parts.join('/')}@assembly.com>"

    {
      "Reply-To" => "#{thread_parts.join('/')} <#{reply_address}>",

      "Message-ID" => message_id,
      "In-Reply-To" => thread_address,
      "References"  => thread_address,

      "List-ID" => "#{thread_id} <#{thread_parts.join('.')}.assembly.com>",
      "List-Archive" => archive_url,
      "List-Post"  => "<mailto:#{reply_address}>",
      "Precedence" => "list",
    }
  end

  def target_name(nfi)
    owner = nfi.source == @user ? 'owner' : 'other'
    target_type = nfi.target.class.name.underscore
    I18n.t("stories.subjects.long.#{target_type}.#{owner}", nfi.target.attributes.symbolize_keys)
  end

  def from_address_for(user)
    "@#{user.username} <notifications@assemblymail.com>"
  end
end
