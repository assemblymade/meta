class AddQualityToProducts < ActiveRecord::Migration
  def change
    change_table :products do |t|
      t.integer :quality
      t.datetime :last_activity_at
    end

    Product.find_each do |product|
      updated_at = [
        Activity.where(target_id: product.id).maximum(:created_at) || product.created_at,
        Activity.where(subject_id: product.id).maximum(:created_at) || product.created_at
      ].max
      product.update! last_activity_at: updated_at
    end
  end
end
