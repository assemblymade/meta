class AddCompletorToCompletedMissions < ActiveRecord::Migration
  def change
    add_column :completed_missions, :completor_id, :uuid
    CompletedMission.all.each do |cm|
      cm.update_attributes completor_id: cm.product.user_id
    end
    change_column :completed_missions, :completor_id, :uuid, null: false
  end
end
