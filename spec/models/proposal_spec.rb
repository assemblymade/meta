require 'spec_helper'

describe Proposal do
  let(:user) { User.make! }
  let(:product) { Product.make! }
  let(:proposal) {Proposal.create!({user: user, product: product})}
  let(:choice) {Choice.create!({value: 1.0, weight: 100000, type: "", proposal: proposal, user: user})}

  it 'test vote ratio' do
    proposal.choices.append(choice)
    Proposal.new
    expect(proposal.status > 0).to eq(true)
  end

end
