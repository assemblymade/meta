class AddUniqueIndexToCoreTeamMembership < ActiveRecord::Migration
  def change
    Product.find_each do |p|
      p.core_team_memberships.group(:user).count.select{|user, count| count > 1 }.each do |user, count|
        (count-1).times do
          puts "removing #{user.username} from #{p.name}"
          p.core_team_memberships.where(user: user).first.delete
        end
      end
    end
    add_index :core_team_memberships, [:user_id, :product_id], unique: true
  end
end
