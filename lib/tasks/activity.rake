namespace :activity do

  desc "Builds all the ActivityStreams (chat) in Redis"
  task :build => :environment do
    rooms = Hash[Product.all.map{|p| [p.id, p.chat_rooms.first.try(:id)] }]

    Activity.includes(:actor, :subject, :target).find_each do |activity|
      if product_id = activity.subject.try(:product_id) || activity.target.try(:product_id)
        if room = rooms[product_id]
          puts "redis: #{activity.inspect}"
          ActivityStream.new(room).redis_push(activity)
        end
      end
    end

    general = ChatRoom.find_by(slug: 'general')
    Activity.where(target: general)_find_each do |activity|
      ActivityStream.new(general.id).redis_push(activity)
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
