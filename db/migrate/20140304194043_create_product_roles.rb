class CreateProductRoles < ActiveRecord::Migration
  def change
    create_table :product_roles, id: false do |t|
      t.primary_key :id, :uuid, default:nil
      t.uuid :product_job_id, null: false
      t.uuid :user_id, null: false
      t.timestamps
    end
  end
end
