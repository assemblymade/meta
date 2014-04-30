class RequireProductsAuthenticationTokenToNotBeNull < ActiveRecord::Migration
  def change
    Product.where(authentication_token: nil).each do |product|
      product.generate_authentication_token
      product.save!
    end

    change_column :products, :authentication_token, :string, null: false
  end
end
