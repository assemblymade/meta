class StorySerializer < ApplicationSerializer
  include ActionView::Helpers::TextHelper

  has_many :actors
  has_one :owner
  has_one :product
  attributes :key, :body_preview, :sentences, :updated, :url

  def url
    object.url_params && url_for(object.url_params)
  end

  def subject
    object.activities.first.subject
  end

  def body_preview
    if preview = (subject.try(:preview) || subject.try(:body) || subject.try(:description))
      Search::Sanitizer.new.sanitize(preview).
        gsub(/\s+\r|\n\s+/, ' ').
        truncate(250).
        strip
    end
  end

  def owner
    if object.subject.is_a? Event::Win
      object.subject.winner
    else
      object.target.try(:user)
    end
  end

  def product
    if product = subject.try(:product)
      ProductShallowSerializer.new(product)
    end
  end

  # unix timestamp to match readraptor
  def updated
    object.updated_at.try(:to_i)
  end

  def key
    "Story_#{object.id}"
  end

  cached

  def cache_key
    ['v1', object]
  end
end
