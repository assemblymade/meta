class HeartNFISerializer < ApplicationSerializer
  attributes :description, :last_hearted_at, :product, :url, :users

  # cached
  #
  # def cache_key
  #   [object]
  # end

  def description
    text = Search::Sanitizer.new.sanitize(
      I18n.t("stories.subjects.long.#{type}.owner", target.attributes.symbolize_keys)
    )
    text.present? ? text : '...'
  end

  def last_hearted_at
    object.hearts.map(&:created_at).max.try(:iso8601)
  end

  def product
    if product = object.try(:product)
      {
        logo_url: product.full_logo_url
      }
    end
  end

  def target
    object.try(:target) || object
  end

  def type
    target.class.name.underscore
  end

  def url
    url_for(object.url_params)
  end

  def users
    {
      ids: object.hearts.pluck(:user_id).take(3),
      count: object.hearts.count
    }
  end
end
