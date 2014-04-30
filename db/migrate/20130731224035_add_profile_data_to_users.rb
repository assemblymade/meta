class AddProfileDataToUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string :tags, :array => true
      t.text :extra_data
    end
  end
end
