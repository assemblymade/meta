class StatusUpdatesController < ApplicationController
  respond_to :html

  before_action :find_product

  def new
    authorize! :status_update, @product
  end

  def create
    authorize! :status_update, @product
    @update = StatusUpdate.create(status_update_params.merge(user: current_user, product: @product))
    respond_with @update, location: product_dashboard_path(@product)
  end

  def show
    # This isn't particularly pretty. I'd rather have it be like:
    #
    #    @product.status_updates.find(params[:id])
    #
    # but I couldn't get that working with Draper ~@chrislloyd
    @status_update = StatusUpdate.find_by!(
      product_id: @product.id,
      slug: params.fetch(:id)
    ).decorate
  end

private

  def find_product
    @product = ProductDecorator.find_by_slug!(params.fetch(:product_id)).decorate
  end

  def status_update_params
    params.require(:status_update).permit(:title, :body)
  end

end
