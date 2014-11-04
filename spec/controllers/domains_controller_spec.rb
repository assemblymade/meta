require 'spec_helper'

describe DomainsController do
  let(:product) { Product.make! }
  let(:user) { User.make! }

  describe 'new domain transfer' do
    it 'creates a domain' do
      post :create, product_id: product.slug, domain: {
          name: 'candykingdom.com',
          transfer_auth_code: 'bubblegum'
        }

      expect(
        assigns(:domain).transfer_auth_code
      ).to eq('bubblegum')
      expect(
        assigns(:domain).name
      ).to eq('candykingdom.com')
      expect(
        assigns(:domain).transfer_auth_code
      ).to eq('bubblegum')
      expect(
        assigns(:domain).state
      ).to eq('transferring')
    end

  end
end