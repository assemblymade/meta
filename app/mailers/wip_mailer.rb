class WipMailer < BaseMailer
  helper :markdown
  helper :wip

  layout 'mail/wip_mailer'

  def wip_created(user_id, wip_id)
    mailgun_tag 'wip#created'

    @user = User.find(user_id)
    @wip = Wip.find(wip_id)
    @product = @wip.product
    @events = @wip.events

    wip_slug = [@product.slug, @wip.number]

    options = list_headers(wip_slug, wip_slug, product_wip_url(@product, @wip)).merge(
      from: from_address_for(@wip.user),
      to:   @user.email,
      subject: "[#{@wip.product.slug}] #{@wip.title} (##{@wip.number})"
    )

    mail options
  end

  def wip_event_added(user_id, event_id)
    mailgun_tag "wip#event_added"

    @user = User.find(user_id)
    @event = Event.find(event_id)
    @wip = @event.wip
    @product = @wip.product

    event_template = "wip_event_" + @event.type.gsub('Event::', '').underscore

    wip_slug = [@product.slug, @wip.number]
    event_slug = [@product.slug, @wip.number, @event.number]

    options = list_headers(wip_slug, event_slug, product_wip_url(@product, @wip)).merge(
      from: from_address_for(@event.user),
      to: @user.email,
      subject: "[#{@product.slug}] #{@wip.title} (##{@wip.number})"
    )

    mail(options) do |format|
      begin
        format.text { render event_template }
        format.html { render event_template }
      end
    end
  end

  def list_headers(thread_parts, message_parts, archive_url)
    reply_address = SecureReplyTo.new('wip', @wip.id, @user.username).to_s

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

# private

  def tag(name)
    headers 'X-Mailgun-Tag' => name.to_s
  end

  def from_address_for(user)
    "#{user.username} <notifications@assemblymail.com>"
  end

end
