class EventSerializer < ActiveModel::Serializer
  include MarkdownHelper

  # FIXME Remove `rescue` as a conditional
  def self.for(event, user)
    klass = "#{event.type}Serializer".constantize rescue EventSerializer
    klass.new(event, scope: user)
  end

  attributes :id #, :url
  attributes :anchor
  attributes :body, :body_html, :number, :timestamp, :type
  attributes :edit_url
  attributes :award_url, :can_award
  attributes :product_id

  has_one :wip, serializer: WipSerializer
  has_one :user, key: :actor, serializer: UserSerializer

  def anchor
    "comment-#{object.number}"
  end

  def product_id
    object.product.id
  end

  def award_url
    award_product_wip_url(product, wip) if can_award
  end

  def can_award
    Ability.new(scope).can?(:award, object) && object.awardable?
  end

  def body_html
    product_markdown(product, object.body)
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
