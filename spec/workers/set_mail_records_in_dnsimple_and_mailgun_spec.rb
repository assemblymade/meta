require 'spec_helper'

describe SetMailRecordsInDnsimpleAndMailgun do
  let(:user) { User.make! }
  let(:product) { Product.make! }


  it 'calls mailgun api to add domain' do
    domain = product.domains.create!(user: user, name: 'partycloud.com')

    VCR.use_cassette('new_domain_in_mailgun') do
      SetMailRecordsInDnsimpleAndMailgun.new.perform(domain.id)
    end
  end
end
