class StatusMessagesController < ApplicationController
  respond_to :json

  before_action :find_product

  def create
    authorize! :update, @product
    @message = @product.status_messages.create(status_message_params.merge(user: current_user))
    respond_with @message, location: request.referer
  end

private

  def find_product
    @product = ProductDecorator.find_by_slug!(params.fetch(:product_id)).decorate
  end

  def status_message_params
    params.require(:status_message).permit(:body)
  end

end
