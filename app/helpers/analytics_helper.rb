module AnalyticsHelper
  def track_inline(event, options=nil)
    if options
      js = "analytics.track('#{event}', #{options.to_json});"
    else
      js = "analytics.track('#{event}');"
    end
    js.html_safe
  end

  def track(event, options=nil)
    content_tag :script, track_inline(event, options)
  end

  def track_vote(product)
    track_inline 'vote.created', product_properties(product)
  end

  def track_presale(presale)
    track 'presale.created', {
      'amount' => presale.amount,
    }.merge(product_properties(presale.product))
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

  def product_properties(product)
    {
      'backers.count'      => product.count_presignups,
      'bank.total'         => product.total_banked,
      'applications.count' => product.watchings.count,
      'features.count'     => product.wips.count,
      'perks.count'        => product.perks.count,
      'views.count'        => product.view_count,
      'votes.count'        => product.votes.count,
    }
  end
end
