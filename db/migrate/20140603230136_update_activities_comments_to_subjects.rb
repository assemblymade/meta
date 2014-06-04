class UpdateActivitiesCommentsToSubjects < ActiveRecord::Migration
  def change
    Activity.delete_all
    ActivityStream.delete_all

    main_thread_ids = Product.pluck(:main_thread_id)

    Event::Comment.
      includes(:user, wip: :product).
      order(:created_at).
      each do |comment|
        if !comment.wip.nil?
          klass = if main_thread_ids.include? comment.wip.id
            Activities::Chat
          else
            Activities::Comment
          end
          activity = klass.create!(
            created_at: comment.created_at,
            actor: comment.user,
            subject: comment,
            target: comment.wip
          )
          activity.streams.each do |s|
            s.redis_push(activity)
          end
        end
      end
  end
end
