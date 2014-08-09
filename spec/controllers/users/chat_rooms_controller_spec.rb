require 'spec_helper'

describe Users::ChatRoomsController do
  let(:product) { Product.make! }
  let(:product2) { Product.make! }
  let(:user) { User.make! }

  describe '#index' do
    before do
      sign_in user
      Watching.announcements!(user, product)
      Watching.watch!(user, product2)
    end

    it 'only returns following products' do
      get :index

      body = JSON.parse(response.body)
      expect(body["chat_rooms"].count).to eq(1)
      expect(body["chat_rooms"].first["id"]).to eq('chat_' + product2.id)
      expect(body["sort_keys"].count).to eq(0)
    end
  end
end
