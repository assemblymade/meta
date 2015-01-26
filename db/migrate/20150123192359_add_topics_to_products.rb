class AddTopicsToProducts < ActiveRecord::Migration
  def change
    add_column :products, :topics, :string, array: true
  end
end
