class StaggerTeambuildingStartDates < ActiveRecord::Migration
  def change
    products = Product.teambuilding.
      sort_by { |p| p.events.select('MAX(events.created_at) AS last_active_at')[0][:last_active_at] }.
      each_slice(2)

    started_teambuilding_at = 4.days.ago

    products.each do |product_slice|
      product_slice.each do |product|
        product.update!(started_teambuilding_at: started_teambuilding_at)
      end

      started_teambuilding_at += 1.day
    end
  end
end
