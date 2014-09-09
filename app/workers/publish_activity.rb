class PublishActivity < ActiveJob::Base
  queue_as :default

  attr_accessor :activity

  def perform(activity_id)
    @activity = Activity.find(activity_id)

    story = create_story!
    push_to_feeds!(story)
    register_with_readraptor!(story)
  end

  def create_story!
    activity.with_lock do
      Story.create!(
        verb: activity.verb,
        subject_type: activity.verb_subject
      ).tap do |story|
        activity.update_attributes story_id: story.id
      end
    end
  end

  def push_to_feeds!(story)
    (story.reader_ids - [activity.actor_id]).each do |user_id|
      NewsFeed.new(User, user_id).push(story)
    end
  end

  def register_with_readraptor!(story)
    ReadRaptor::RegisterArticleWorker.enqueue(
      key: ReadRaptorSerializer.serialize_entity('Story', story.id),
      recipients: story.reader_ids
    )
  end
end
