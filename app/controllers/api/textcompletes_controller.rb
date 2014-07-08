module Api
  class TextcompletesController < ProductController
    before_action :find_product!

    respond_to :json

    def index
      textcompletes = { textcompletes: TextcompleteSearch.call(@product, params[:query]) }
      respond_with textcompletes
    end
  end
end
