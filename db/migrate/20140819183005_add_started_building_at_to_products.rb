class AddStartedBuildingAtToProducts < ActiveRecord::Migration
  def change
    add_column :products, :started_building_at, :datetime

    Product.update_all started_building_at: Time.now

    PitchWeekApplication.all.each do |app|
      app.product.update! started_building_at: nil
    end
  end
end
