class MigrateStartWipToPostWip < ActiveRecord::Migration
  def change
    Activity.where(type: 'Activities::Start').update_all(type: 'Activities::Post')
  end
end
