module Api
  class OrgsController < ApiController
    def show
      @product = Product.find_by!(slug: params[:id])

      render json: @product, serializer: OrgSerializer
    end

    def partners
      @product = Product.find_by!(slug: params[:org_id])
      render json: @product, serializer: ProductApiSerializer
    end
  end
end
