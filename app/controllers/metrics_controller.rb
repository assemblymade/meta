class MetricsController < ProductController
  respond_to :html, :json

  def index
    find_product!

    snippet = render_to_string(partial: 'metrics/snippet', layout: false, formats: 'html')

    respond_to do |format|
      format.html
      format.json do
        render json: ProductSerializer.new(@product).as_json.merge(asmlytics_snippet: snippet)
      end
    end

  end
end
