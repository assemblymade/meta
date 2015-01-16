namespace :governance do

  task :enforce => :environment do
    GovernanceWorker.new.perform_async
  end
end
