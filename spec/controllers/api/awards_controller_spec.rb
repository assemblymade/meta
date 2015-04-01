require 'spec_helper'
require 'pry'

describe Api::AwardsController do
  let!(:bounty) { Task.make! }
  let!(:product) { bounty.product }
  let!(:user) { bounty.user }
  let!(:winner) { User.make!(email: 'jimmy@assembly.com') }

  before do
    product.core_team << user
  end

  describe '#create' do
    it 'creates contract' do
      sign_in user

      post :create,
        product_id: product.slug,
        bounty_id: bounty.number,
        email: 'jimmy@assembly.com',
        reason: 'Tweeted about Helpful',
        format: :json

      expect(response).to be_successful
      expect(bounty.awards.size).to eq(1)
    end
  end
end
