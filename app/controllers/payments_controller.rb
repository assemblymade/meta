class PaymentsController < ProductController
  respond_to :html

  before_action :find_product!
  before_action :authenticate_user!
  before_action :authenticate_core_team!

  def index
    @active_plans = get_active_plans
  end

  def create
    create_new_plan

    flash[:plan_update] = true
    respond_with @product, location: product_payments_path(@product)
  end

  def destroy
    destroy_plan(params[:id])

    flash[:plan_update] = true
    respond_with @product, location: product_payments_path(@product)
  end

  private

  def authenticate_core_team!
    redirect_to(new_user_session_path) unless @product.core_team?(current_user)
  end

  def get_active_plans
    get "/products/#{@product.slug}/plans"
  end

  def create_new_plan
    PaymentsWorker.perform_async(
      :post,
      "/products/#{@product.slug}/plans",
      current_user.authentication_token,
      {
        name: payment_params[:name],
        amount: payment_params[:amount].to_f * 100.00
      }
    )
  end

  def destroy_plan(id)
    PaymentsWorker.perform_async(
      :delete,
      "/products/#{@product.slug}/plans/#{id}",
      current_user.authentication_token
    )
  end

  def get(url)
    _request :get, url
  end

  # we can't override the exiting #request method
  def _request(method, url, body = {})
    resp = connection.send(method) do |req|
      req.url url
      req.headers['Authorization'] = "#{current_user.authentication_token}"
      req.headers['Content-Type'] = 'application/json'
      req.body = body.to_json
    end

    JSON.load(resp.body)
  end

  def connection
    Faraday.new(url: ENV["PAYMENTS_URL"]) do |faraday|
      faraday.adapter  :net_http
    end
  end

  def payment_params
    params.permit(:name, :amount, :interval)
  end
end
