class AddSubheadingsToProducts < ActiveRecord::Migration
  def change
    add_column :products, :subsections, :json
  end
end
