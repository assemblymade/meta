class Event::CommentReferenceSerializer < EventSerializer

  attributes :target_type,
             :target_url,
             :target_title

  def target_type
    case target.wip
    when Task
      'task'
    when Discussion
      'discussion'
    end
  end

  def target_url
    case target.wip
    when Task
      product_wip_path(object.product, target.wip)
    when Discussion
      product_discussion_path(object.product, target.wip)
    end
  end

  def target_title
    "##{target.wip.number} #{target.wip.title}"
  end

# --

  def target
    object.event
  end

end
