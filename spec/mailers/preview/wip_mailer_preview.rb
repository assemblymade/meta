class WipMailerPreview < ActionMailer::Preview

  def wip_created
    wip = Wip.where('events_count > 0').sample
    WipMailer.wip_created(User.sample.id, wip.id)
  end

  Event::MAILABLE.each do |klass|
    define_method "wip_event_#{klass.name.gsub('Event::', '').underscore}" do
      WipMailer.wip_event_added(User.sample.id, klass.sample.id)
    end
  end

end
