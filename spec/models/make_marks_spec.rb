require 'spec_helper'

describe MakeMarks do

  let(:user) { User.make! }
  let(:mark) { Mark.create!(name: 'altmark') }
  let(:mark2) { Mark.create!(name: 'sudmark') }
  let(:product) { Product.make! }
  let(:wip) { Wip.make! }

  it 'test marking additively' do
    MakeMarks.new.mark_additively(user.user_identity, mark.id, 1.0)
    MakeMarks.new.mark_additively(user.user_identity, mark.id, 1.0)
    expect(user.user_identity.markings.count).to eq(1)
  end

  it 'mark with name' do
    MakeMarks.new.mark_with_name(user.user_identity, 'ostmark')
    expect(user.user_identity.markings.count).to eq(1)
  end

  it 'merge marks' do
    firstmark = Mark.create!({name: 'tyrol'})
    secondmark = Mark.create!({name: 'pommern'})
    Marking.create!({markable: user.user_identity, mark_id: firstmark.id, weight: 1.0})
    Marking.create!({markable: user.user_identity, mark_id: secondmark.id, weight: 1.0})
    MakeMarks.new.merge_marks('pommern', 'tyrol')
    expect(firstmark.markings.count).to eq(1)
  end

  it 'mark with vector additively' do
    MakeMarks.new.mark_with_vector_additively(user.user_identity, [[mark.id, 1.0]], 2.0)
    expect(user.user_identity.get_mark_vector).to eq([[mark.id, 1.0]])
  end

  it 'mark with object for viewings' do
    MakeMarks.new.mark_with_object_for_viewings(user.id, product.id, "Product", 2.0)
    MakeMarks.new.mark_with_object_for_viewings(user.id, product.id, "Product", 2.0)
    MakeMarks.new.mark_with_object_for_viewings(user.id, wip.id, "Wip", 2.0)
  end

end
