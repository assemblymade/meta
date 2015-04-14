class RegroupStories
  include Sidekiq::Worker

  def perform
    query = Activities::Comment.order(:target_id, :created_at).where(product_id: Product.find_by_slug('firesize').id)
    count = query.count

    i = 1
    target_groups(query) do |target_id, activities|
      story = activities.first.story
      activities.each do |a|
        puts "story: #{story.inspect}"
        if story.nil? || a.created_at > story_end(story)
          story = Story.create!(
            created_at: a.created_at,
            verb: a.verb,
            subject_type: a.verb_subject
          )
          Rails.logger.info "    story=#{story.id} start=#{a.created_at} end=#{story_end(story)}"
        end

        Rails.logger.info "#{i.to_s.rjust(count.to_s.size)}/#{count} target=#{target_id} start=#{story.created_at}"
        a.update_columns story_id: story.id
        story.update_columns updated_at: a.created_at

        i += 1
      end
    end
  end

  def target_groups(query, &blk)
    target_id = nil
    group = []
    query.each.with_index do |a, i|
      if target_id != a.target_id
        target_id = a.target_id
        blk.call(target_id, group) if group.any?
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
