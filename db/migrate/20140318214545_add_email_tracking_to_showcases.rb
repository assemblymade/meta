class AddEmailTrackingToShowcases < ActiveRecord::Migration
  def change
    change_table :showcases do |t|
      t.datetime :email_upcoming_sent_at
      t.datetime :email_public_sent_at
    end
  end
end
