class PublishActivity
  include Sidekiq::Worker

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
        verb: activity.class.name.split('::').last,
        subject_type: activity.subject.class.name.split('::').last
      ).tap do |story|
        activity.update_attributes story_id: story.id
      end
    end
  end

  def push_to_feeds!(story)
    story.stream_targets.each do |watcher|
      NewsFeed.new(watcher).push(story)
    end
  end

  def register_with_readraptor!(story)
    ReadRaptor::RegisterArticleWorker.perform_async(
      key: ReadRaptorSerializer.serialize_entity('Story', story.id),
      recipients: story.stream_targets.map(&:id)
    )
  end
end
