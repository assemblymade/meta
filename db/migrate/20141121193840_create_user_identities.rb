class CreateUserIdentities < ActiveRecord::Migration
  def change
    create_table :user_identities, id: :uuid do |t|
      t.uuid :user_id
      t.timestamps
    end
  end
end
