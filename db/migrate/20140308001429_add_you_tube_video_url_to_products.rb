class AddYouTubeVideoUrlToProducts < ActiveRecord::Migration
  def change
    add_column :products, :you_tube_video_url, :string
  end
end
