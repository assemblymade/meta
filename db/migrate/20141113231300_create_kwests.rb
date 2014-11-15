class CreateKwests < ActiveRecord::Migration
  def change
    create_table :kwests, id: :uuid do |t|
      t.string :title
      t.uuid :user_id
      t.uuid :deed_id
      t.timestamps
    end
  end
end
