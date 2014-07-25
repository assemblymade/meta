module Api
  class TextcompletesController < ProductController
    respond_to :json

    def index
      @product = if params[:product_id].uuid?
        Product.find(params[:product_id])
      else
        Product.find_by!(slug: params[:product_id])
      end

      textcompletes = { textcompletes: TextcompleteSearch.call(@product, params[:query]) }
      respond_with textcompletes
    end
  end
end
