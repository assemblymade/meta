class AddWelcomeBannerDismissedAtToUsers < ActiveRecord::Migration
  def change
    add_column :users, :welcome_banner_dismissed_at, :datetime
  end
end
