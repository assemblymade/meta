require 'spec_helper'

describe Api::BountiesController do
  let(:product) { Product.make! }
  let(:user) { User.make!(email: 'zanzibar@z.com') }

  describe '#create' do
    context 'core team' do
      before do
        product.core_team << user
      end
      it 'creates a bounty with coins' do
        sign_in user

        post :create, org_id: product.slug, title: 'A new hope', description: 'A long long time ago...', coins: 15000, format: :json

        expect(response).to be_successful
        bounty = JSON.parse(response.body)
        expect(bounty['title']).to eq('A new hope')
        expect(bounty['description']).to eq('A long long time ago...')
        expect(bounty['coins']).to eq(15000)
      end
    end
  end
end
