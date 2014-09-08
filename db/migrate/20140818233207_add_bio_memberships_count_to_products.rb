class AddBioMembershipsCountToProducts < ActiveRecord::Migration
  def change
    add_column :products, :bio_memberships_count, :integer, null: false, default: 0

    TeamMembership.all.includes(:product).each(&:update_counter_caches)
  end
end
