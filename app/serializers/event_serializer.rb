class EventSerializer < ActiveModel::Serializer
  include ReadraptorTrackable
  include MarkdownHelper

  # FIXME Remove `rescue` as a conditional
  def self.for(event, user)
    # this check is for chat. we can clean this up when chat is not using wip_events
    if event.is_a? Event::Comment
      klass = EventSerializer
    else
      klass = "#{event.type}Serializer".constantize rescue EventSerializer
    end
    klass.new(event, scope: user)
  end

  attributes :id #, :url
  attributes :anchor
  attributes :body, :body_html, :body_sanitized, :number, :timestamp, :type, :created_at

  # FIXME (@chrislloyd) This is dog slow. For every win-event it does a
  #                     separate lookup for the award. Should probably
  #                     be cached.
  attributes :target

  attributes :product_id
  attributes :story_id

  # FIXME (@chrislloyd) Move clientside
  attributes :edit_url
  attributes :award_url

  has_one :user, key: :actor, serializer: AvatarSerializer

  def anchor
    "comment-#{object.number}"
  end

  def product_id
    object.wip.product_id
  end

  def award_url
    award_product_wip_url(product, wip) if wip.open?
  end

  def body_html
    Rails.cache.fetch([object, 'body']) do
      product_markdown(product, object.body)
    end
  end

  def body_sanitized
    Search::Sanitizer.new.sanitize(object.body.to_s)
  end

  def edit_url
    return nil if object.id.nil?

    if Ability.new(scope).can?(:update, object)
      # TODO: (whatupdave) there must be a better way...
      case wip
      when Discussion
        edit_product_discussion_comment_url(product, wip, object)
      else
        edit_product_wip_comment_url(product, wip, object)
      end
    end
  end

  def story_id
    Story.associated_with_ids(object).try(:first)
  end

  def target
    case object
    when Event::Win
      AvatarSerializer.new(object.winner)
    when Event::CommentReference
      # FIXME (@pletcher) This isn't terrible -- it just adds in a
      #                   couple of fields -- but there must be a better
      #                   way to do it
      Event::CommentReferenceSerializer.new(object)
    else
      object.try(:target)
    end
  end

  def timestamp
    if object.created_at
      object.created_at.iso8601
    end
  end

  def wip
    @wip ||= object.wip
  end

  def product
    @product ||= wip.product
  end
end
