class Admin::StaffPicksController < AdminController

  def index
    @days = (3.days.ago.to_date .. 2.weeks.from_now.to_date).map do |day|
      [day, Showcase.display_order.showcasing_on_date(day).count]
    end

    @showcases = Showcase.display_order.page(params[:page])
  end

  def create
    @product = Product.find(showcase_params.fetch(:product_id))
    @showcase = Showcase.create(product: @product, showcased_at: Date.today)
    respond_with(@showcase, location: product_path(@product))
  end

  def destroy
    @showcase = Showcase.find(params.fetch(:id))
    @showcase.destroy
    respond_with(@showcase, location: admin_staff_picks_path)
  end

private

  def showcase_params
    params.require(:showcase).permit(:product_id)
  end

end
