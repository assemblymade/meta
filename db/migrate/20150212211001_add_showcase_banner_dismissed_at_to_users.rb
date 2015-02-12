class AddShowcaseBannerDismissedAtToUsers < ActiveRecord::Migration
  def change
    add_column :users, :showcase_banner_dismissed_at, :datetime
  end
end
