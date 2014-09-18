class AssemblyAssetsController < ProductController
  before_action :authenticate_user!
  before_action :set_product

  def create
    unless AssemblyAsset.find_by(user: current_user, product: @product).try(:where, 'promo_redeemed_at is not null').try(:any?)
      if @product == Product.find_by_slug('assemblycoins')
        asset = AssemblyAsset.new(
          product: @product,
          user: current_user,
          amount: 10,
          promo_redeemed_at: Time.now
        )

        asset.grant!(promo=true)

        flash[:first_assets_granted] = true
      end
    end

    redirect_to product_path(@product)
  end

  def email_promo
    unless AssemblyAsset.find_by(user: current_user, product: @product).try(:where, 'promo_redeemed_at is not null').try(:any?)
      if @product == Product.find_by_slug('assemblycoins')
        asset = AssemblyAsset.new(
          product: @product,
          user: current_user,
          amount: 10,
          promo_redeemed_at: Time.now
        )

        asset.grant!(promo=true)

        flash[:first_assets_granted] = true
      end
    end

    redirect_to product_path(@product)
  end
end
