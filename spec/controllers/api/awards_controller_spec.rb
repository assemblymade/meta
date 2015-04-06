require 'spec_helper'

describe Api::AwardsController do
  let!(:bounty) { Task.make!(value: 100) }
  let!(:product) { bounty.product }
  let!(:user) { bounty.user }

  before do
    product.core_team << user
  end

  describe '#create' do
    context 'existing user' do
      let!(:winner) { User.make!(email: 'jimmy@assembly.com') }
      it 'creates contract' do
        sign_in user

        post :create,
          org_id: product.slug,
          bounty_id: bounty.number,
          email: 'jimmy@assembly.com',
          reason: 'Tweeted about Helpful',
          format: :json

        expect(response).to be_successful
        expect(bounty.awards.size).to eq(1)
        expect(bounty.awards.first.winner).to eq(winner)
      end
    end

    context 'guest user' do
      it 'creates contract' do
        sign_in user

        post :create,
          org_id: product.slug,
          bounty_id: bounty.number,
          email: 'someguy@example.com',
          reason: 'Tweeted about Helpful',
          format: :json

        expect(response).to be_successful
        expect(bounty.awards.size).to eq(1)
        expect(bounty.awards.first.guest.email).to eq('someguy@example.com')
      end
    end
  end
end
