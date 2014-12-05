class StorySerializer < ApplicationSerializer
  include ActionView::Helpers::TextHelper

  attributes :actor_ids, :verb, :subject_type, :body_preview, :url, :product_name, :product_slug, :key
  attributes :subjects, :target

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
    object.activities.first.try(:target).try(:product).try(:name)
  end

  def product_slug
    object.activities.first.try(:target).try(:product).try(:slug)
  end

  def updated
    object.updated_at.try(:to_i)
  end

  def subjects
    if subject = object.activities.first.try(:subject)
      if serializer = Story.subject_serializer(subject)
        object.activities.map(&:subject).map{|s| serializer.new(subject) }
      end
    end || []
  end

  def target
    if target = object.activities.first.try(:target)
      if serializer = Story.subject_serializer(target)
        serializer.new(target)
      end
    end
  end

  def key
    "Story_#{object.id}"
  end
end
