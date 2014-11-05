require 'spec_helper'

describe DomainsController do
  let(:product) { Product.make! }
  let(:user) { User.make! }

  describe 'new domain transfer' do
    it 'creates a domain' do
      product.core_team << user
      sign_in user

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
    end

  end
end