class CombineCertainTrustFieldsOnProducts < ActiveRecord::Migration
  def change
    remove_column :products, :trust_android_at
    remove_column :products, :trust_data_at
    rename_column :products, :trust_ios_at, :trust_mobile_at
  end
end
