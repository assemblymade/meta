module Api
  class OrgsController < ApiController
    def show
      @product = Product.find_by(slug: params[:id])
      # (barisser) search by slug == id not working --> @chrislloyd
      if !@product
        @product = Product.find_by(id: params[:id])
      end
      render json: @product, serializer: OrgSerializer
    end

    def partners
      @product = Product.find_by(slug: params[:org_id])
      if !@product
        @product = Product.find_by(id: params[:org_id])
      end
      @users = TransactionLogEntry.product_partners_with_balances(@product.id).sort_by{|a, b| -b}.map{|a, b| {user: UserApiSerializer.new(User.find(a)), coins: b}}
      render json: @users
    end
  end
end
