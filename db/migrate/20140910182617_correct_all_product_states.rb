class CorrectAllProductStates < ActiveRecord::Migration
  def change
    Product.all.each do |product|
      if ['coderwall', 'helpful', 'really-good-emails'].include?(product.slug)
        product.update!(profitable_at: Time.now, greenlit_at: Time.now, started_teambuilding_at: Time.now)
      end

      if product.partners.count >= 8
        product.update!(greenlit_at: Time.now, started_teambuilding_at: Time.now)
      end

      if product.quality.to_i > 2 && !product.flagged? && product.events.where('events.created_at > ?', 30.days.ago).exists?
        product.update!(started_teambuilding_at: Time.now)
      end
    end
  end
end
