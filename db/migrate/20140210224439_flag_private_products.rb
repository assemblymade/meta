class FlagPrivateProducts < ActiveRecord::Migration
  def change
    flag = ['asm-ideas', 'coderwall', 'asm', 'morning-snow', 'mista-condom']
    flag.each do |slug|
      puts "Flagging: #{slug}"
      if product = Product.find_by(slug: slug)
        product.touch(:flagged_at)
      end
    end
  end
end
