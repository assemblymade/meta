class WipMailerPreview < ActionMailer::Preview

  def wip_created
    wip = Wip.where('events_count > 0').first
    WipMailer.wip_created(User.first.id, wip.id)
  end

  Event::MAILABLE.each do |klass|
    define_method "wip_event_#{klass.name.gsub('Event::', '').underscore}" do
      WipMailer.wip_event_added(User.first.id, klass.first.id)
    end
  end

end
