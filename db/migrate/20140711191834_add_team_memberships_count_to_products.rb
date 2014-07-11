class AddTeamMembershipsCountToProducts < ActiveRecord::Migration
  def change
    add_column :products, :team_memberships_count, :integer, default: 0

    Product.find_each do |product|
      product.team_memberships_count = product.team_memberships.active.count
      product.save!

      Product.reset_counters(product.id, :watchings)
    end
  end
end
