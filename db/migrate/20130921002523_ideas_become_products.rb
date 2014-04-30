class IdeasBecomeProducts < ActiveRecord::Migration
  def change
    idea_ids = {}
    ActiveRecord::Base.connection.execute("select id as product_id, idea_id from products").each do |h|
      idea_ids[h['product_id']] = h['idea_id']
    end

    puts idea_ids.inspect

    StatusUpdate.find_each{|su| su.update_column :product_id, idea_ids[su.product_id] }
    Wip.find_each{|wip| wip.update_column :product_id, idea_ids[wip.product_id] }

    drop_table :products
    rename_table :ideas, :products

    rename_column :features, :idea_id, :product_id
    rename_column :perks, :idea_id, :product_id
    rename_column :work_applications, :idea_id, :product_id

    Vote.where(voteable_type: 'Idea').find_each{|v| v.update_column :voteable_type, 'Product' }

    if asm = Product.find_by(name: 'Assembly')
      asm.update_column :slug, 'asm'
    end
  end
end
