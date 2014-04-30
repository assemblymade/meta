require 'spec_helper'

describe Perks::PreordersController do
  let(:perk) { Perk.make! }
  let(:current_user) { User.make! }
  let(:stripe_customer) { FakeStripeCustomer.new }

  describe '#create' do
    before do
      sign_in current_user

      StripeCustomerEnsurer.stub(:new) { FakeStripeCustomerEnsurer.new }

      post :create, stripeToken: 's_1234', perk_id: perk.id, variation: 'v1234'
    end

    it "redirects to ideas" do
      expect(response).to redirect_to product_path(perk.product)
    end

    it "saves preorder with variation" do
      assigns(:preorder).variation.should == 'v1234'
    end
  end
end