class MoveProductStateIntoStateField < ActiveRecord::Migration
  def change
    Product.all.each do |product|
      Product.transaction do
        state = legacy_stage(product)
        state = 'team_building' if state == 'teambuilding'
        product.state = state
        product.save!
      end
    end
  end

  def legacy_stage(product)
    if product.profitable_at.present?
      'profitable'
    elsif product.greenlit_at.present?
      'greenlit'
    elsif product.started_teambuilding_at.present?
      'teambuilding'
    else
      'stealth'
    end
  end
end
