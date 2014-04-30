namespace :ideas do
  # advance products through missions they may have already completed
  task :update_missions => :environment do
    Product.all.each do |p|
      while p.current_mission.try(:complete?)
        p.current_mission.complete!(p.user)
      end
    end
  end
end
