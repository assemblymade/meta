class MigrateCommentsToActivities < ActiveRecord::Migration
  def up
    main_thread_ids = Product.pluck(:main_thread_id)

    Event::Comment.
      where(wip_id: main_thread_ids).
      order(number: :asc).
      each do |comment|
        Activities::Comment.publish!(
          actor: comment.user,
          target: comment,
          created_at: comment.created_at
        )
      end
  end

  def down
    Activity.delete_all
  end
end
