class AssetsController < ProductController
  respond_to :html, :json

  before_action :authenticate_user!, :except => [:index]
  before_action :find_product!

  def index
    @assets = @product.assets.order('created_at desc').page(params[:page]).per(4*4)
  end

  def new
    @asset = @product.assets.new
  end

  def create
    if params[:attachment_url]
      add_attachment
    else
      @asset = @product.assets.create(asset_params.merge(user: current_user))
      @room = Room.create_for!(@asset.product, @asset)
    end

    respond_with @asset, location: product_assets_path(@product)
  end

  def destroy
    return head(:forbidden) unless can? :update, @product
    Asset.find(params[:id]).delete!

    respond_to do |format|
      format.html { redirect_to product_assets_path(@product) }
      format.json { render json: { id: params[:id] }, status: 200 }
    end
  end

  # private

  def asset_params
    params.require(:asset).permit(:attachment_id, :name)
  end

  def add_attachment
    asset_path = URI.parse(params[:attachment_url]).path[1..-1]
    unescaped_asset_path = URI.unescape(asset_path)

    create_from_attachment(Attachment.find_by(asset_path: unescaped_asset_path))
  end

  def create_from_attachment(attachment)
    return if attachment.nil?
    # prevent duplicates
    return if @product.assets.where(attachment_id: attachment.id).any?

    validate_user

    @asset = attachment.assign_to_product!(@product, current_user)
  end

  def validate_user
    head(:forbidden) unless can? :update, @product
  end
end
