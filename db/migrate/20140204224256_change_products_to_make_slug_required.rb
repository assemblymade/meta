class ChangeProductsToMakeSlugRequired < ActiveRecord::Migration
  def change
    # generate unique slugs for all the products
    slugs = Product.where(slug: nil).map do |p|
      {
        product: p,

        # Gerry The Cat's Product => gerry-the-cats-product
        slug: p.name.downcase.
          gsub(/\s+/, '-').
          gsub(/[^a-z-]/,'').
          gsub(/--+/,'').
          gsub(/^-|-$/,'')
      }
    end

    slugs.group_by {|ps| ps[:slug] }.each do |slug, group|
      group.each.with_index do |ps, i|
        new_slug = i > 0 ? "#{slug}-#{i+1}" : slug
        puts "#{ps[:product].name} => #{new_slug}"
        ps[:product].update_attributes slug: new_slug
      end
    end

    change_column :products, :slug, :string, null: false
  end
end
