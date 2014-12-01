require 'spec_helper'

describe QueryMarks do
  let(:denmark) { Mark.create!({name: "DENMARK"}) }
  let(:product) { Product.make! }
  let(:finn_mark) { Mark.create({name: "FINN_MARK"})}
  let(:user) { User.make! }
  let(:wip) { Wip.make! }


  it 'test dot_products_on_vectors' do
    vector1 = [[denmark, 1.0], [finn_mark, 0.5]]
    vector2 = [[denmark, 0.2], [finn_mark, 3.0]]

    dot_product = QueryMarks.new.dot_product_vectors(vector1, vector2)
    expected_result = 1.7
    expect(dot_product).to eq(expected_result)
  end

  it 'test assign_top_bounties_for_user' do
    test_wip_vectors = [ [[denmark, 1.0], [finn_mark, 0.5]] , wip]
    result = QueryMarks.new.assign_top_bounties_for_user(1, user, test_wip_vectors)
  end

end
