class ProductLogosController < ProductController
  respond_to :html, :json

  before_action :find_product!
  before_action :authenticate_user!

  def create
    attachment = Attachment.create!(logo_params.merge(user: current_user))
    @logo = @product.product_logos.create!(name: logo_params[:name], attachment: attachment, user: current_user, product: @product)
    @product.current_product_logo = @logo
    @room = Room.create_for!(@logo.product, @logo)

    respond_with @logo, location: product_assets_path(@product)
  end

  def show
  end

  def update
  end

  def destroy
  end

  def logo_params
    params.permit(:name, :size, :content_type)
  end

end
