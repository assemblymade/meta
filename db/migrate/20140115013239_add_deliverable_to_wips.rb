class AddDeliverableToWips < ActiveRecord::Migration
  def change
    add_column :wips, :deliverable, :string, null: false, default: 'other'
  end
end
