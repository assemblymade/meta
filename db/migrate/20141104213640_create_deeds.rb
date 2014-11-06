class CreateDeeds < ActiveRecord::Migration
  def change
    create_table :deeds do |t|

      t.string :user_id
      t.datetime :created_at
      t.integer :karma_value
      t.string :karma_event_type
      t.integer :karma_event_id
      t.belongs_to :chronicle
      t.belongs_to :user

    end
  end
end


#user
#action type
  # get tipped
  #
#id
