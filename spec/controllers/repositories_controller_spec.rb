require 'spec_helper'

describe RepositoriesController do
  let(:product) { Product.make! }
  let(:user) { User.make! }

  describe '#create' do
    before do
      sign_in user
    end

    it 'allows a core team member to create a repo' do
      product.team_memberships.create(user: user, is_core: true)
      post :create, product_id: product.slug, repository: { name: 'scoreunder' }
      expect(response.status).to eq(302)
    end
  end
end
