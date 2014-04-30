class RenameTechStack < ActiveRecord::Migration
  def change
    rename_column :products, :tech_stack, :tags
  end
end
