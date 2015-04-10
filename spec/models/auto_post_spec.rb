require 'spec_helper'

describe AutoPost do
  let(:product) { Product.make! }
  before do
    User.make!({username: "kernel"})
    Idea.create!({product_id: product.id, user_id: User.find_by(username: "kernel").id, name: "social_media_for_social_media_founders" })
  end

  it 'creates post on product' do
    AutoPost.new.generate_idea_product_transition_post(product)
    expect(product.posts.count).to eq(1)
  end
end
