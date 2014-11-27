class AddSentAtToHearts < ActiveRecord::Migration
  def change
    add_column :hearts, :sent_at, :datetime
    add_index :hearts, :sent_at
  end
end
