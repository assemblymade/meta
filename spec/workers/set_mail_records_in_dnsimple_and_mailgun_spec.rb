require 'spec_helper'

describe SetMailRecordsInDnsimpleAndMailgun do
  let(:user) { User.make! }
  let(:product) { Product.make! }


  it 'calls mailgun api to add domain' do
    domain = product.domains.create!(user: user, name: 'partycloud.com', state: 'owned')

    VCR.use_cassette('new_domain_in_mailgun') do
      SetMailRecordsInDnsimpleAndMailgun.new.perform(domain.id)
    end

    expect(domain.reload.state).to eq('forwarding_email')
  end
end
