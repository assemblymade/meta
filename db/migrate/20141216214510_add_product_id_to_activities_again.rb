class AddProductIdToActivitiesAgain < ActiveRecord::Migration
  def change
    add_column :activities, :product_id, :uuid

    # Activity.includes(:subject).find_each do |activity|
    #   if product_id = (activity.try(:subject).try(:product_id) || activity.try(:subject).try(:product).try(:id) rescue nil)
    #     activity.update_column(:product_id, product_id)
    #   end
    # end
  end
end
