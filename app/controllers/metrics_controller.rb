class MetricsController < ApplicationController
  before_filter :authenticate_product!
  skip_before_filter :verify_authenticity_token

  def create
    Counter.create_measurements(@product, metrics_params[:counters])
    render nothing: true, status: 200
  end

  def metrics_params
    params.permit(counters: [:measure_time, :name, :source, :value])
  end

  def authenticate_product!
    @product = authenticate_with_http_basic do |username, password|
      Product.find_by(slug: username, authentication_token: password)
    end

    render_authorization_required and return unless @product
  end

  def render_authorization_required
    render json: { errors: { request: ["Authorization Required"] } },
      status: :unauthorized
  end
end
