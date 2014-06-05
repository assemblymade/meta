class FeatureOnlyHelpful < ActiveRecord::Migration
  def change

    Product.update_all(featured_on: nil)
    Product.find_by(slug: 'helpful').feature!

  end
end
