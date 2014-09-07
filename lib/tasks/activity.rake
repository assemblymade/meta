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

  desc "Prune out weird and orphaned activities"
  task :prune => :environment do
    activities = Activity.all.includes(:subject, :target).select do |a|
      a.subject.nil? || a.target.nil?
    end
    puts "pruning #{activities.size} activities"
    activities.each do |a|
      puts "  activity: #{a.inspect}"
      a.destroy
    end
  end
end
