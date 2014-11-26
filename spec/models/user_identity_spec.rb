require 'spec_helper'

describe UserIdentity do
  let(:user_identity) { UserIdentity.make! }
  let(:wip1) { Wip.make! }
  let(:wip2) { Wip.make! }
  let(:product) { Product.make! }

  it 'test for mark vector on user identity' do
    sample_mark = Mark.create!({name: "DEN_MARK"})
    sample_marking = Marking.create!({markable: user_identity, mark_id: sample_mark.id, weight: 1.0})

    mark_vector = user_identity.get_mark_vector

    expect(mark_vector).to eq([[sample_mark, 1.0]])

  end

  it 'should be able to assign markings from wips and viewings' do

    wips_won = [wip1, wip2]

    user_identity.assign_markings_from_wips([wip1, wip2])

    viewing = Viewing.create!({user_id: user_identity.user.id, viewable_id: product.id, viewable_type: "Product"})
    user_identity.assign_markings_from_viewings
  end

end
