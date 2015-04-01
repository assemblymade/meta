require 'spec_helper'

describe Api::SubscribersController do
  let(:product) { Product.make! }
  let(:user) { User.make!(email: 'zanzibar@z.com') }

  describe '#create' do
    it 'creates a mailing list subscription' do
      post :create, product_id: product.slug, email: 'foo@bar.com', format: :json

      expect(response).to be_successful
    end

    it 'does not email a user if they already have an account' do
      post :create, product_id: product.slug, email: user.email, format: :json

      expect(response).to be_successful
      expect_any_instance_of(ProductMailer).not_to receive(:mailing_list)
    end
  end
end
