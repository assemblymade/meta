class FixingDavesBadMigrations < ActiveRecord::Migration
  def self.up
    %w(really-good-emails coderwall helpful).each do |slug|
      Product.find_by(slug: slug).update! live_at: Time.now
    end
    
    Product.find_each do |p|
      p.update_partners_count_cache
      p.save!
    end
  end
end
