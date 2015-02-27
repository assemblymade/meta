class AddAsmlyticsKeyToProducts < ActiveRecord::Migration
  def change
    add_column :products, :asmlytics_key, :text

    Product.find_each do |p|
      p.generate_asmlytics_key
      if !p.save
        puts "fail :( #{p.attributes.inspect}"
      end
    end

    add_index :products, :asmlytics_key, unique: true
  end
end
