require 'spec_helper'

describe QueryMarks do
  let(:den_mark) { Mark.create!({name: "DEN_MARK"}) }
  let(:product) { Product.make! }
  let(:finn_mark) { Mark.create({name: "FINN_MARK"})}

  it 'test dot_products_on_vectors' do
    vector1 = [[den_mark, 1.0], [finn_mark, 0.5]]
    vector2 = [[den_mark, 0.2], [finn_mark, 3.0]]

    dot_product = QueryMarks.new.dot_product_vectors(vector1, vector2)
    expected_result = 1.7
    expect(dot_product).to eq(expected_result)
  end

end
