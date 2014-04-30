namespace :campaigns do
  
  task :follow_up => :environment do
    User.awaiting_personal_email.each do |user|
      UserMailer.delay.follow_up(user.id)
    end
  end
  
  task :idea_submitter_outreach => :environment do
    Product.waiting_approval.where("created_at < ?", 10.days.ago).each do |product|
      unless product.user.nil?
        puts "#{product.user.name} - #{product.name}"
        ProductMailer.delay.idea_process_update(product.id) 
      end
    end
  end
end