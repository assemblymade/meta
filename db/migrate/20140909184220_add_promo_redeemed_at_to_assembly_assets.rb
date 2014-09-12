class AddPromoRedeemedAtToAssemblyAssets < ActiveRecord::Migration
  def change
    add_column :assembly_assets, :promo_redeemed_at, :datetime
  end
end
