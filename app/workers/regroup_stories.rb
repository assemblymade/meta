class RegroupStories
  include Sidekiq::Worker

  def perform(from=nil)
    reassign_activities(from)
    remove_empty_stories
  end

  def reassign_activities(from)
    query = Activities::Comment.order(:target_id, :created_at)
    if !from.nil?
      query = query.where('created_at > ?', from)
    end
    count = query.count

    i = 1
    target_groups(query) do |target_id, activities|
      story = activities.first.story
      activities.each do |a|
        puts "  #{i.to_s.rjust(count.to_s.size)}/#{count} target=#{target_id} start=#{story.try(:created_at)}"
        if story.nil? || a.created_at > story_end(story)
          story = a.story
        end

        if story.nil? || a.created_at > story_end(story)
          if !story.nil?
            push_to_feeds(story)
          end

          story = Story.create!(
            created_at: a.created_at,
            verb: a.verb,
            subject_type: a.verb_subject
          )
        end

        a.update_columns story_id: story.id
        story.update_columns updated_at: a.created_at

        i += 1
      end
      push_to_feeds(story)
    end
  end

  def remove_empty_stories
    Story.
      joins('left join activities a on a.story_id = stories.id').
      where('a.id is null').
      delete_all
  end

  def push_to_feeds(story)
    story.reader_ids.each do |user_id|
      NewsFeed.new(User, user_id).push(story)
    end
  end

  def target_groups(query, &blk)
    target_id = nil
    group = []
    query.each.with_index do |a, i|
      if target_id != a.target_id
        blk.call(target_id, group) if group.any?
        target_id = a.target_id
        group = []
      end
      group << a
    end

    blk.call(target_id, group) if group.any?
  end

  def story_end(story)
    (story.created_at + (Time.now - story.created_at) / 2)
  end
end
