require 'spec_helper'

describe PromotedProductsQuery do
  it 'finds all products with the most recently promoted wips' do
    first_promoted_product = Product.make!
    second_promoted_product = Product.make!
    boring_product = Product.make!

    first_promoted_product.wips  << Task.make!(promoted_at: Time.now, number: 1)
    second_promoted_product.wips << Task.make!(promoted_at: 1.minute.ago)
    first_promoted_product.wips  << Task.make!(promoted_at: 5.minutes.ago, number: 2)

    promoted_products = PromotedProductsQuery.most_recently_promoted_products
    expect(promoted_products).to eq([first_promoted_product, second_promoted_product])
  end

  it 'finds the promoted products' do
    promoted_product = Product.make!
    boring_product = Product.make!

    promoted_product.wips << Task.make!(promoted_at: Time.now)

    expect(PromotedProductsQuery.promoted_products).to eq([promoted_product])
  end
end
