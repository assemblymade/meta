class AssemblyAssetsController < ProductController
  before_action :authenticate_user!
  before_action :set_product

  def create
    unless AssemblyAsset.find_by(user: current_user, product: @product).where('promo_redeemed_at is not null').any?
      if @product == Product.find_by_slug('assemblycoins')
        asset = AssemblyAsset.create!(
          product: @product,
          user: current_user,
          amount: 10,
          promo_redeemed_at: Time.now
        )

        asset.grant!(promo=true)

        flash[:assets_granted] = true
      end
    end

    redirect_to product_path(@product)
  end
end
