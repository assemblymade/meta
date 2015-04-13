require 'spec_helper'

describe CsvCompiler do
  let(:product) { Product.make! }

  it 'get product_partner_breakdown' do
    expect(CsvCompiler.new.get_product_partner_breakdown(product, before_date=0.days.ago)).to eq(1)
  end
end
