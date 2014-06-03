class CreateAssets < ActiveRecord::Migration
  def change
    create_table :assets, id: :uuid do |t|
      t.uuid :product_id,     null: false
      t.uuid :attachment_id,  null: false
      t.uuid :user_id,        null: false
      t.string :name,         null: false
      t.datetime :created_at, null: false
    end

    Deliverable.find_each do |deliverable|
      product = deliverable.wip.product
      product.assets.create(
        user: deliverable.attachment.user,
        name: deliverable.attachment.name,
        attachment_id: deliverable.attachment.id
      )
    end
  end
end
