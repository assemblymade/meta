namespace :activity do

  desc "Builds all the ActivityStreams (chat) in Redis"
  task :build => :environment do
    rooms = Hash[Product.all.map{|p| [p.id, p.chat_rooms.first.try(:id)] }]

    Activity.all.includes(:actor, :subject, :target).each do |activity|
      if product_id = activity.subject.try(:product_id) || activity.target.try(:product_id)
        if room = rooms[product_id]
          puts "redis: #{activity.inspect}"
          ActivityStream.new(room).redis_push(activity)
        end
      end
    end
    
    general = ChatRoom.find_by(slug: 'general')
    Activity.where(target: general).each do |activity|
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


  task :commits_vs_account_age => :environment do
    require 'csv'
    headers = ["gitPushCount", "accountAge", "username", "userType"]
    CSV.open('cva.csv', 'a') do |csv|
      csv << headers

      User.all.each do |u|
        csv << [u.activities.where(type: 'Activities::GitPush').count, 
                (Time.now - u.created_at)/(60*60*24),
                u.username,
                u.staff? ? "Staff" : u.products.count > 0 ? "Core" : "Contributor"]
      end
    end
  end

  task :product_commits => :environment do
    require 'csv'
    headers = ["work", "productAge", "productName"]
    CSV.open('pcva.csv', 'a') do |csv|
      csv << headers

      Product.all.each do |p|
        csv << [p.work.count,
                (Time.now - p.created_at)/(60*60*24),
                p.name]
      end
    end
  end

  task :activity_vs_age => :environment do
    require 'csv'
    headers = ["Activity Count", "Account Age", "Username", "User Type"]
    CSV.open('ava.csv', 'a') do |csv|
      csv << headers

      User.all.each do |u|
        csv << [u.activities.count, 
                (Time.now - u.created_at)/(60*60*24),
                u.username,
                u.staff? ? "Staff" : u.products.count > 0 ? "Core" : "Contributor"]
      end
    end
  end

end
