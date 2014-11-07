require 'spec_helper'

describe UpdateCoreTeamEmailForwards do
  let(:user) { User.make!(email: 'vanwilder@partycloud.com') }
  let(:product) { Product.make!(slug: 'partycloud') }

  it 'calls mailgun api to update forwarding rules' do
    domain = product.domains.create!(user: user, name: 'partycloud.com')
    product.core_team << user

    VCR.use_cassette('update_domain_in_mailgun_with_new_core_team_member') do
      UpdateCoreTeamEmailForwards.new.perform(product.id)
    end
  end
end
