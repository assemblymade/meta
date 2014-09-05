class AddLiveAtToProducts < ActiveRecord::Migration
  def change
    add_column :products, :live_at, :datetime

    %w(really-good-emails coderwall helpful).each do |slug|
      Product.find_by(slug: slug).update! live_at: Time.now
    end
  end
end
