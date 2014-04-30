class AddProductNameToActivity < ActiveRecord::Migration
  def change
    add_column :activities, :product_name, :string

    Activity.all.each do |activity|
      if activity.product
        activity.product_name = activity.product.name
        activity.save!
      end
    end
  end
end
