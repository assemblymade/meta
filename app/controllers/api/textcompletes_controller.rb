module Api
  class TextcompletesController < ProductController
    respond_to :json

    def index
      if product_id = params[:product_id]
        @product = if product_id.uuid?
          Product.find(product_id)
        else
          Product.find_by!(slug: product_id)
        end
      end

      textcompletes = { textcompletes: TextcompleteSearch.call(@product, params[:query]) }
      respond_with textcompletes
    end
  end
end
