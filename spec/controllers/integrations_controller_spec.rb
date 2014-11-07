require 'spec_helper'

describe IntegrationsController do
  describe 'Google' do
    describe '#token' do
      let(:product) { Product.make! }
      let(:user) { User.make! }

      it 'parses the tokens from a successful request' do
        Integrations::Google.any_instance.stub(:token).and_return({ 'access_token' => 'secret_token', 'token_type' => 'Bearer' })

        get :token, product_id: product.id, provider: 'google', state: product.authentication_token
        expect(assigns(:integration).access_token).to eq('secret_token')
      end

      it 'redirects on error' do
        Integrations::Google.any_instance.stub(:token).and_return({ 'error' => 'uh-oh' })

        get :token, product_id: product.id, provider: 'google', state: product.authentication_token, error: 'uh-oh'
        expect(response.status).to eq(302)
      end
    end
  end
end
