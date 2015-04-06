class AddTrustFieldsToProducts < ActiveRecord::Migration
  def change
    add_column :products, :trust_domain_at, :datetime
    add_column :products, :trust_ip_at, :datetime
    add_column :products, :trust_hosting_at, :datetime
    add_column :products, :trust_data_at, :datetime
    add_column :products, :trust_finances_at, :datetime
    add_column :products, :trust_ios_at, :datetime
    add_column :products, :trust_android_at, :datetime
  end
end
