require 'spec_helper'

describe AutoBounty do
  let(:product) { Product.make! }

  it 'create bounty on product' do
    description = "Put the Stripe API on the Blockchain"
    title = "Call of Duty: Global Disruption"
    value = 9001
    AutoBounty.new.make_bounty(product, description, title, value)
    expect(product.tasks.count).to eq(1)
  end
end
