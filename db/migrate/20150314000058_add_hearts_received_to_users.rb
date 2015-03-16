class AddHeartsReceivedToUsers < ActiveRecord::Migration
  def change
    add_column :users, :hearts_received, :integer, default: 0, null: false
    add_column :users, :last_hearted_at, :datetime

    Heart.group(:target_user_id).
          pluck('target_user_id', 'max(created_at)', 'count(*)').each do |user_id, last_hearted_at, hearts|

      next if user_id.nil?

      User.find(user_id).update_columns(
        hearts_received: hearts,
        last_hearted_at: last_hearted_at
      )
    end
  end
end
