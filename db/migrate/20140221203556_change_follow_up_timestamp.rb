class ChangeFollowUpTimestamp < ActiveRecord::Migration
  def change
    rename_column(:users, :followed_up_on, :personal_email_sent_on)
  end
end
