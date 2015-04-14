require 'spec_helper'

describe QueryMarks do
  let(:denmark) { Mark.create!({name: "DENMARK"}) }
  let(:product) { Product.make! }
  let(:product2) { Product.make! }
  let(:finn_mark) { Mark.create({name: "FINN_MARK"})}
  let(:user) { User.make! }
  let(:wip) { Wip.make! }
  let(:vector1) { [[denmark.id, 1.0], [finn_mark.id, 0.5]] }
  let(:vector2) { [[denmark.id, 0.2], [finn_mark.id, 3.0]] }

  it 'test dot_products_on_vectors' do
    dot_product = QueryMarks.new.dot_product_vectors(vector1, vector2)
    expected_result = 1.7
    expect(dot_product).to eq(expected_result)
  end

  it 'test assign_top_bounties_for_user' do
    test_wip_vectors = [ [[denmark, 1.0], [finn_mark, 0.5]] , wip]
    result = QueryMarks.new.assign_top_bounties_for_user(1, user, test_wip_vectors)
  end

  it 'compare two mark vectors' do
    MakeMarks.new.mark_with_name(product, 'DENMARK')
    comparison = QueryMarks.new.compare_mark_vectors(product, product)
    expect(comparison.round(0)).to eq(1)
  end

  it 'subtract two vectors' do
    subtracted = QueryMarks.new.subtract_vectors(vector1, vector2)
    expect(subtracted).to eq([[denmark.id, 0.8], [finn_mark.id, -2.5]])
  end

  it 'update markings on object from vector' do
    QueryMarks.new.update_markings_to_vector_for_object(product2, vector1)
    expect(product2.mark_vector).to match_array(vector1)
  end

  it 'get all wip vectors' do
    MakeMarks.new.mark_with_name(wip, 'DENMARK')
    wip.product.update!(state: 'greenlit')
    wip_vectors = QueryMarks.new.get_all_wip_vectors
    expect(wip_vectors).to eq([])
  end

  it 'get all product vectors' do
    product_vectors = QueryMarks.new.get_all_product_vectors
    expect(product_vectors).to eq([])
  end

  it 'make mark vector legible' do
    expect(QueryMarks.new.legible_mark_vector(vector1)).to eq([['DENMARK', 1.0], ['FINN_MARK', 0.5]])
  end

  it 'find mark from name' do
    Mark.create!({name: 'testmarker'})
    expect(QueryMarks.new.find_mark_from_name('testmarker'))
  end

end
