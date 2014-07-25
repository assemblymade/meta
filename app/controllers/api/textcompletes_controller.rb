module Api
  class TextcompletesController < ProductController
    respond_to :json

    def index
      @product = Product.find_by(id: params[:product_id])
      textcompletes = { textcompletes: TextcompleteSearch.call(@product, params[:query]) }
      respond_with textcompletes
    end
  end
end
