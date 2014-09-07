class MigrateChatToChatRooms < ActiveRecord::Migration
  def up
    Activity.where(actor_type: 'PotentialUser').update_all(actor_type: Subscriber.to_s)

    Product.includes(:main_thread).find_each do |p|
      if (wip = p.main_thread) && p.slug.present?
        slug = p.slug == 'meta' ? 'general' : p.slug
        product = p.slug == 'meta' ? nil : p

        chat_room = ChatRoom.create!(
          slug: slug,
          product: product,
          wip: wip,
        )

        Activities::Chat.where(target: wip).update_all(target_id: chat_room.id, target_type: ChatRoom.to_s)
      end
    end

    ActivityStream.delete_all
    Activity.all.includes(:actor, :subject, :target).each do |activity|
      activity.streams.each do |s|
        s.redis_push(activity)
      end
    end
  end
end
