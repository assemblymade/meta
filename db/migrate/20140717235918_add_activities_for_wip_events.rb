class AddActivitiesForWipEvents < ActiveRecord::Migration
  def change
    mappings = {
      Event::CopyAdded => Activities::Post,
      Event::Win => Activities::Award,
      Event::PullRequestReference => Activities::Reference,
      Event::Allocation => Activities::Assign,
      Event::DesignDeliverable => Activities::Post,
      Event::Close => Activities::Close,
      Event::Reopen => Activities::Open,
      Event::ReviewReady => Activities::Post,
      Event::Unallocation => Activities::Unassign,
      Event::TitleChange => Activities::Post,
      Event::CommentReference => Activities::Reference,
      Event::CommitReference => Activities::Reference,
      Event::CodeAdded => Activities::Post
    }

    mappings.each do |event_klass, activity_verb|
      puts "#{event_klass} => #{activity_verb}"

      if event_klass == Event::CommitReference
        query = event_klass
      else
        query = event_klass.includes(:user, :wip)
      end

      query.find_each do |e|
        next if e.wip.nil?

        activity_verb.create!(
          created_at: e.created_at,
          actor: e.user,
          subject: e,
          target: e.wip
        )
      end
    end
  end
end
