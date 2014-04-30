class EventSerializer < ActiveModel::Serializer
  include MarkdownHelper

  # FIXME Remove `rescue` as a conditional
  def self.for(event, user)
    klass = "#{event.type}Serializer".constantize rescue EventSerializer
    klass.new(event, scope: user)
  end

  attributes :id #, :url
  attributes :anchor, :edit_path
  attributes :body, :body_html, :number, :timestamp, :type
  attributes :previous_type, :previous_type_name
  attributes :award_path, :can_award

  has_one :wip
  has_one :user, :key => :actor

  def anchor
    "event-#{object.number}"
  end

  def award_path
    award_product_wip_path(product, wip)
  end

  # TODO this stuff is a mess...
  def previous_type
    object.previous_type if object.is_a? Event::TypeChange
  end

  # TODO this stuff is a mess...
  def previous_type_name
    object.previous_type_name.singularize if object.is_a? Event::TypeChange
  end

  # TODO There's no ? on this method because AMS doesn't serialize question
  #      marks
  def can_award
    scope && scope.can?(:award, object)
  end

  def body_html
    wip_markdown(object.body, product_wips_path(product))
  end

  def edit_path
    if scope && scope.can?(:update, object)
      # TODO: (whatupdave) there must be a better way...
      case wip
      when Discussion
        edit_product_discussion_comment_path(product, wip, object)
      else
        edit_product_wip_comment_path(product, wip, object)
      end
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
