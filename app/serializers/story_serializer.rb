class StorySerializer < ApplicationSerializer
  include ActionView::Helpers::TextHelper

  has_many :actors
  has_one :product
  attributes :key, :sentences, :url, :updated

  def url
    story_path(object)
  end

  def body_preview
    if preview = object.body_preview
      preview.truncate(250).gsub(/\s+\r|\n\s+/, ' ').strip
    end
  end

  def product
    if product = object.subject.try(:product)
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
    [Time.now.to_i, object]
  end
end
