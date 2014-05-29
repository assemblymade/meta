namespace :activity do

  desc "Builds all the ActivityStreams in Redis"
  task :build => :environment do
    Activity.all.each do |activity|
      activity.publish
    end
  end

  desc "Destroys all the ActivityStreams in Redis"
  task :destroy => :environment do
    ActivityStream.delete_all
  end

  desc "Rebuilds all the ActivityStreams in Redis"
  task :rebuild => [:destroy, :build]

end
