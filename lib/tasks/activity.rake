namespace :activity do
  class Activity < ActiveRecord::Base; 
    belongs_to :owner,
      class_name: 'User'

    belongs_to :subject,
      polymorphic: true
  end;
  task move: :environment do
    StreamEvent.delete_all
    Activity.find_each do |activity|
      puts "Processing: #{activity.key}"
      case activity.key
       when 'create', 'created' then
         next if activity.subject.nil?
         target  = find_target(activity.subject)
         puts target.to_s
         puts activity.subject.title
         StreamEvent.add_create_event!(actor: activity.owner, subject: activity.subject, target: target, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'comment' then
         target  = activity.subject.wip
         StreamEvent.add_create_event!(actor: activity.owner, subject: activity.subject, target: target, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'close'
         wip  =  activity.subject
         StreamEvent.add_closed_event!(actor: activity.owner, subject: wip, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'pr'
         wip = activity.subject
         StreamEvent.add_pull_request_event!(actor: activity.owner, subject: wip, target: wip.product, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'product' then
         StreamEvent.add_create_event!(actor: activity.owner, subject: activity.subject, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'signup' then
         StreamEvent.add_signup_event!(actor: activity.owner, subject: activity.subject, target: activity.subject.voteable, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'mission' then
         StreamEvent.add_mission_completed_event!(actor: activity.owner, subject: activity.subject, target: activity.subject.product, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'promote'
         StreamEvent.add_promoted_event!(actor: activity.owner, subject: activity.subject, target: activity.subject.product, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'demote'
         StreamEvent.add_demoted_event!(actor: activity.owner, subject: activity.subject, target: activity.subject.product, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'allocate'
         StreamEvent.add_allocated_event!(actor: activity.owner, subject: activity.subject, target: activity.subject.product, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'unallocate'
         StreamEvent.add_unallocated_event!(actor: activity.owner, subject: activity.subject, target: activity.subject.product, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'review'
         StreamEvent.add_reviewable_event!(actor: activity.owner, subject: activity.subject, target: activity.subject.product, created_at: activity.created_at, updated_at: activity.updated_at)
       when 'github_commit'
         StreamEvent.add_work_event!(actor: activity.owner, subject: activity.subject, target: activity.subject.product, created_at: activity.created_at, updated_at: activity.updated_at)
      else
        
         #ignore
      end 
    end
    
    Event::Win.find_each do |event|
      StreamEvent.add_win_event!(actor: event.winner, subject: event, target: event.wip, created_at: event.created_at, updated_at: event.updated_at)
    end
    
    Event::DesignDeliverable.find_each do |event|
      StreamEvent.add_work_event!(actor: event.user, subject: event, target: event.wip, created_at: event.created_at, updated_at: event.updated_at)
    end
    
    Event::CopyAdded.find_each do |event|
      StreamEvent.add_work_event!(actor: event.user, subject: event, target: event.wip, created_at: event.created_at, updated_at: event.updated_at)
    end
    
    Event::CodeAdded.find_each do |event|
      StreamEvent.add_work_event!(actor: event.user, subject: event, target: event.wip, created_at: event.created_at, updated_at: event.updated_at)
    end
  end
  
  def find_target(subject)
    subject.product if subject.class.name == 'Task'
    subject.product if subject.class.name == 'Discussion'
  end
  
  task fixwork: :environment do
    Work.find_each do |work|
      begin
        puts work.url
        commit = work.url.split('/').last
        new_url = work.url.gsub("https://github.com/", "https://api.github.com/repos/")
        new_url = new_url.gsub("commit", "commits")
        puts "FETCHING #{new_url}"
        JSON RestClient.get new_url
      rescue Exception => ex
        puts ex.message
      end
    end
  end
  
  task test: :environment do
    url = 'https://api.github.com/repos/asm-helpful/helpful-web/commits/d6b0eaf07db8a3dcc299699e7c9f4d485309c8b3'
    r   = get_json(url)
  end
  
  def get_json(url)
    JSON.parse RestClient.get(url)
  end
end