module AnalyticsHelper
  def track_engaged(event, options=nil)
    return if staff?
    content_for :javascript do
      content_tag(
        :script,
        "window._analyticsViewTarget = '#{event}'; window._analyticsEngagedProperties = #{options.to_json};".html_safe
      )
    end
  end

  def analytics_track_events
    events = (flash[:events] || [])
    if events.any?
      tracking = events.map do |event, options|
        track_inline(event, options)
      end

      content_tag(:script, tracking.join("\n").html_safe)
    end
  end

  def track_readraptor(entities)
    content_tag :div do
      entities.each do |entity|
        concat content_tag(:img, nil, class: 'hidden', src: ReadraptorTracker.new(ReadRaptorSerializer.serialize_entities(entity).first, current_user.id).url)
      end
    end
  end
end
