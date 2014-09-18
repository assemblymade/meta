class SetCanAdvertiseForExistingProducts < ActiveRecord::Migration
  def up
    Product.update_all(can_advertise: true)

    not_advertisable = Product::PRIVATE + ['meta']
    Product.where(slug: not_advertisable).update_all(can_advertise: false)
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
