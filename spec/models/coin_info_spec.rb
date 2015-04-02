require 'spec_helper'

describe CoinInfo do
  let(:product) { Product.make! }

  it 'create coin_info on product' do
    CoinInfo.create_from_product!(product)
    product.reload
    expect(product.coin_info.version).to eq("1.0")
  end
end
