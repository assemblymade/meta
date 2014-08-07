class StorySerializer < ApplicationSerializer
  include ActionView::Helpers::TextHelper

  attributes :actor_ids, :verb, :subject_type, :body_preview, :url, :product_name, :product_slug, :key
  attributes :subjects, :target

  has_many :activities, serializer: ActivitySerializer

  def actor_ids
    object.activities.map(&:actor_id)
  end

  def url
    story_path(object)
  end

  def body_preview
    if preview = object.body_preview
      preview.truncate(250).gsub(/\s+\r|\n\s+/, ' ').strip
    end
  end

  def product_name
    object.activities.first.target.product.name
  end

  def product_slug
    object.activities.first.target.product.slug
  end

  def updated
    object.updated_at.try(:to_i)
  end

  def subjects
    ActiveModel::ArraySerializer.new(
      object.activities.map(&:subject)
    )
  end

  def target
    target = object.activities.first.target
    target.active_model_serializer.new(target)
  end

  def key
    "Story_#{object.id}"
  end
end
