module Api
  class TextcompletesController < ApplicationController
    before_action :set_product

    respond_to :json

    def index
      textcompletes = { textcompletes: TextcompleteSearch.call(@product, params[:query]) }
      respond_with textcompletes
    end
  end
end
