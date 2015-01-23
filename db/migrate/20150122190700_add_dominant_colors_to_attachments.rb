class AddDominantColorsToAttachments < ActiveRecord::Migration
  def change
    add_column :attachments, :dominant_colors, :string, array: true
  end
end
