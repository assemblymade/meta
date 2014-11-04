require 'spec_helper'

describe Dnsimple::StartDomainTransfer do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  it 'aborts with error on error' do
    domain = product.domains.create!(name: 'partycloud.com', transfer_auth_code: 'duffman')

    VCR.use_cassette('start_domain_transfer_error') do
      Dnsimple::StartDomainTransfer.new.perform(domain.id)
    end

    domain.reload

    expect(domain.state).to eq('external')
    expect(domain.status).to eq('The domain partycloud.com is already registered')
  end

  it 'calls api' do
    domain = product.domains.create!(name: 'choosefun.com', transfer_auth_code: 'hey joe')

    VCR.use_cassette('start_domain_transfer_success') do
      Dnsimple::StartDomainTransfer.new.perform(domain.id)
    end

    expect(domain.reload.state).to eq('transferring')
  end
end
