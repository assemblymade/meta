class GrowthHack

  def self.staff_auto_love(activity)
    if ["Comment", "Post"].include?(activity.verb)
      user = User.where(is_staff: true).sample
      target_entity = activity.subject_type == 'Event' ? activity.target : activity.subject

      attributes = {
        user_id: user.id, 
        heartable_id: target_entity.news_feed_item.id, 
        heartable_type: "NewsFeedItem"
      }

      Heart.delay_for((rand(1..20) * 30).seconds).
      create(attributes) unless Heart.exists?(attributes)
    end
  end

end
