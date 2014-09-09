class AllowAssetIdOnAssemblyAssetsToBeNull < ActiveRecord::Migration
  def change
    change_column_null :assembly_assets, :asset_id, true
  end
end
