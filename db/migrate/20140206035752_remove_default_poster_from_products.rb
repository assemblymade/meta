class RemoveDefaultPosterFromProducts < ActiveRecord::Migration
  def change
    change_column_default :products, :poster, nil
    Product.where(poster: 'default_poster.jpg').update_all(poster: nil)
  end
end
