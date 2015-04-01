module Api
  class OrgsController < ApiController
    def show
      @product = Product.find_by!(slug: params[:id])

      render json: @product, serializer: OrgSerializer
    end
  end
end
