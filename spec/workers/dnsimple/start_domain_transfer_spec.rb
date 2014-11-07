require 'spec_helper'

describe Dnsimple::StartDomainTransfer do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  it 'aborts with error on error' do
    domain = product.domains.create!(user: user, name: 'partycloud.com', transfer_auth_code: 'duffman')

    VCR.use_cassette('start_domain_transfer_error') do
      Dnsimple::StartDomainTransfer.new.perform(domain.id)
    end

    domain.reload

    expect(domain.state).to eq('transfer_fail')
    expect(domain.status).to eq('The domain partycloud.com is already registered')
    expect(
      Sidekiq::Extensions::DelayedMailer.jobs.size
    ).to eq(1)
  end

  it 'transitions to transferring on success' do
    domain = product.domains.create!(user: user, name: 'choosefun.com', transfer_auth_code: 'hey joe')

    VCR.use_cassette('start_domain_transfer_success') do
      Dnsimple::StartDomainTransfer.new.perform(domain.id)
    end

    expect(domain.reload.state).to eq('transferring')
  end
end
