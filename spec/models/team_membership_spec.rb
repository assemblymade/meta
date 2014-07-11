require 'spec_helper'

describe TeamMembership do
  let(:product) { Product.make! }
  let(:member) { User.make! }

  it 'updates counter_cache on create' do
    expect {
      membership = product.team_memberships.create(user: member, is_core: false)
      membership.run_callbacks(:commit)
    }.to change{
      product.reload.team_memberships_count
    }.to(1)
  end

  it 'updates counter_cache on soft delete' do
    membership = product.team_memberships.create(user: member, is_core: false)
    membership.run_callbacks(:commit)

    expect {
      membership.update_attributes deleted_at: Time.now
      membership.run_callbacks(:commit)
    }.to change{
      product.reload.team_memberships_count
    }.to(0)
  end
end