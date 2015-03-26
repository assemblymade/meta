require 'spec_helper'

describe AutoBounty do
  let(:product) { Product.make! }
  before do
    User.make!({username: "kernel"})
  end

  it 'creates bounty on product' do
    description = "Put the Stripe API on the Blockchain"
    title = "Call of Duty: Global Disruption"
    value = 9001
    AutoBounty.new.make_bounty(product, description, title, value)
    product.reload
    expect(product.tasks.count).to eq(1)
  end
end
