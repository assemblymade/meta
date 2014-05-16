class AddMainDiscussionsToProducts < ActiveRecord::Migration
  def change
    Product.find_each do |product|
      product.with_lock do
        unless product.discussions.where(number: 0).exists?
          product.discussions.create!(title: 'Main thread', user: product.user, number: 0)
        end
      end
    end
  end
end
