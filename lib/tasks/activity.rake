namespace :activity do

  desc "Builds all the ActivityStreams in Redis"
  task :build => :environment do
    Activity.all.includes(:actor, :subject, :target).each do |activity|
      activity.streams.each do |s|
        s.redis_push(activity)
      end
    end
  end

  desc "Destroys all the ActivityStreams in Redis"
  task :destroy => :environment do
    ActivityStream.delete_all
  end

  desc "Rebuilds all the ActivityStreams in Redis"
  task :rebuild => [:destroy, :build]

  desc "Rebuild user stream"
  task :user => :environment do
    Activity.where.not(type: Activities::Chat).includes(:actor, :subject, :target).find_each do |activity|
      if activity.target
        activity.target.watchers.each do |watcher|
          stream = ActivityStream.new(watcher)
          stream.redis_push(activity)
        end
      end
    end
  end
end
