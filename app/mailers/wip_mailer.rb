class WipMailer < BaseMailer
  helper :markdown
  helper :wip

  layout 'mail/wip_mailer'

  def wip_created(user_id, wip_id)
    mailgun_campaign 'notifications'
    mailgun_tag 'wip#created'

    @wip = Wip.find(wip_id)

    # Don't spam the core team when Kernel creates a wip
    return if @wip.user == User.find_by(username: 'kernel')
    @user = User.find(user_id)
    @product = @wip.product
    @events = @wip.events

    wip_slug = [@product.slug, @wip.number]

    options = list_headers(Wip.to_s, @wip.id, @user.username, wip_slug, wip_slug, product_wip_url(@product, @wip)).merge(
      from: from_address_for(@wip.user),
      to:   @user.email,
      subject: "[#{@wip.product.slug}] #{@wip.title} (##{@wip.number})"
    )

    if ENV['STOP_EMAILS']
      mail.perform_deliveries = false
      Rails.logger.info "prevent_mail=wip_created to=#{@user.username} wip=#{@wip.id}"
    end

    mail options
  end

  def wip_event_added(user_id, event_id)
    mailgun_campaign 'notifications'
    mailgun_tag "wip#event_added"

    @user = User.find(user_id)
    @event = Event.find(event_id)
    @wip = @event.wip
    @product = @wip.product

    event_template = "wip_event_" + @event.type.gsub('Event::', '').underscore

    wip_slug = [@product.slug, @wip.number]
    event_slug = [@product.slug, @wip.number, @event.number]

    options = list_headers(Wip.to_s, @wip.id, @user.username, wip_slug, event_slug, product_wip_url(@product, @wip)).merge(
      from: from_address_for(@event.user),
      to: @user.email,
      subject: "[#{@product.slug}] #{@wip.title} (##{@wip.number})"
    )

    mail(options) do |format|
      begin
        format.html { render event_template }
      end
    end.tap do |mail|
      if ENV['STOP_EMAILS']
        mail.perform_deliveries = false
        Rails.logger.info "prevent_mail=wip_event_added to=#{@user.username} wip=#{@event.id}"
      end
    end
  end

# private

  def tag(name)
    headers 'X-Mailgun-Tag' => name.to_s
  end

end
