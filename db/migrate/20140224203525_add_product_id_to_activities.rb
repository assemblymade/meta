class AddProductIdToActivities < ActiveRecord::Migration
  def change
    add_column :activities, :product_id, :uuid

    Activity.all.each do |activity|
      product = activity && activity.wip && activity.wip.product
      activity.update!(product_id: product.id) if product
    end
  end
end
