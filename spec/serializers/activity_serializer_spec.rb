require 'spec_helper'

describe ActivitySerializer do
  let(:membership) { TeamMembership.make! }
  let(:product) { membership.product }
  let(:actor) { membership.user }
  let(:activity) { Activities::Introduce.create!(actor: actor, subject: membership, target: product)}

  it 'serializes with tipping info' do
    expect(
      ActivitySerializer.new(activity).to_json
    ).not_to eq({})
  end
end
