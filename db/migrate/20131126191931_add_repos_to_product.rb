class AddReposToProduct < ActiveRecord::Migration
  def change
    change_table :products do |t|
      t.text :repos, array: true

      t.index :repos
    end
  end
end
