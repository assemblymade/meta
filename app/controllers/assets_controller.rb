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
      add_all_event_assets
    elsif params[:attachment_url]
      add_attachment
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

  def add_all_event_assets
    event = Event.find(params[:event_id])

    event.attachments.map do |attachment_id|
      create_from_attachment(Attachment.find(attachment_id))
    end
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

    asset_to_create = {
      attachment_id: attachment.id,
      name: attachment.name
    }

    @asset = @product.assets.create(asset_to_create.merge(user: current_user))
    Room.create_for!(@asset.product, @asset)
  end
end
