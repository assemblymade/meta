class CreateProductShortcuts < ActiveRecord::Migration
  def change
    create_table :product_shortcuts, id: :uuid do |t|
      t.uuid :product_id,   null: false
      t.integer :number,    null: false
      t.text :target_type,  null: false
      t.uuid :target_id,    null: false

      t.index [:product_id, :number], unique: true
    end

    ProductShortcut.delete_all
    Product.find_each do |p|
      p.wips.each do |wip|
        ProductShortcut.create! product_id: p.id, number: wip.number, target: wip
      end
    end

    change_column :wips, :number, :integer, null: true
    change_column :milestones, :number, :integer, null: true
  end
end
