require 'spec_helper'

describe Users::ChatRoomsController do
  let(:product) { Product.make! }
  let(:product2) { Product.make! }
  let(:user) { User.make! }

  describe '#index' do
    before do
      sign_in user
      product.announcements!(user)
      product2.watch!(user)
    end

    it 'only returns following products' do
      get :index

      body = JSON.parse(response.body)
      expect(body["chat_rooms"].count).to eq(1)
      expect(body["chat_rooms"].first["id"]).to eq('chat_' + product2.id)
    end
  end
end
