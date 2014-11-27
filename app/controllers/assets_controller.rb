class AssetsController < ProductController
  respond_to :html

  before_action :authenticate_user!, :except => [:index]
  before_action :find_product!

  def index
    @assets = @product.assets.order('created_at desc').page(params[:page]).per(4*4)
  end

  def new
    @asset = @product.assets.new
  end

  def create
    if params[:event_id]
      event = Event.find(params[:event_id])

      event.attachments.map do |attachment_id|
        attachment = Attachment.find(attachment_id)

        asset_to_create = {
          attachment_id: attachment.id,
          name: attachment.name
        }

        asset = @product.assets.create(asset_to_create.merge(user: current_user))
        Room.create_for!(asset.product, asset)
      end
    else
      @asset = @product.assets.create(asset_params.merge(user: current_user))
      @room = Room.create_for!(@asset.product, @asset)
    end

    respond_with @asset, location: product_assets_path(@product)
  end

  # private

  def asset_params
    params.require(:asset).permit(:attachment_id, :name)
  end
end
