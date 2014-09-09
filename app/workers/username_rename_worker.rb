class UsernameRenameWorker < ActiveJob::Base
  queue_as :default

  # This is a little hacky, we should probably store metadata in the comments we can use to help update them
  def perform(user_id, previous_username)
    user = User.find(user_id)

    Event::Comment.find_each do |c|
      if c.body.include? "@#{previous_username}"
        c.update_attributes body: c.body.gsub("@#{previous_username}", "@#{user.username}")
      end
    end
  end
end
