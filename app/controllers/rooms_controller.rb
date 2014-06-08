class RoomsController < ProductController

  respond_to :html

  def show
    find_product!
    @room = @product.rooms.find_by!(number: params.fetch(:id))
    respond_with(@room)
  end

  def deprecated_redirect
    find_product!
    @room = @product.rooms.find_by(number: params[:number])

    if @room.nil? || @room.root?
      redirect_to product_discuss_path(@product)
    else
      redirect_to [@product, @room.target]
    end
  end

end
