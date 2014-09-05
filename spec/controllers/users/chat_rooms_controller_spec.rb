require 'spec_helper'

describe Users::ChatRoomsController do
  let!(:general) { ChatRoom.make!(slug: 'general', wip: Wip.make! ) }

  let(:product) { Product.make! }
  let(:room) { ChatRoom.make!(product: product) }
  let(:user) { User.make! }

  describe '#index' do
    before do
      sign_in user
      product.announcements!(user)
    end

    it 'only returns following products' do
      get :index, format: :json

      body = JSON.parse(response.body)
      expect(body["chat_rooms"].count).to eq(1)
    end
  end
end
