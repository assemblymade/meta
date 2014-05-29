namespace :redis do
  task :flush => :environment do
    $redis.flushdb
  end

  desc "Sync redis with activity streams"
  task :sync_streams => :environment do
    $redis.keys('activitystream:*').each{|key| $redis.del key }
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
end