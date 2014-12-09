namespace :query_marks do
  task :update_suggestions => :environment do
    #QueryMarks.new.retroactively_generate_all_user_markings
    QueryMarks.new.assign_all(10)
  end
end
