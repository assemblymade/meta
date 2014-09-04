require 'spec_helper'

describe UsersController do
  let!(:user) { User.make! }
  let!(:product) { Product.make!(user: user, is_approved: true) }
  let!(:wip) { Task.make!(user: user, product: product) }

  before { sign_in user }

  describe '#show' do
    it 'is successful' do
      get :show, id: user.username

      expect(response).to be_successful
    end

    it 'assigns wips' do
      get :show, id: user.username

      expect(assigns(:wips)).to be
    end
  end

  describe '#tracking' do
    it 'returns a ReadRaptor tracking URL' do
      get :tracking, article_id: wip.id

      expect(response).to be_successful
      expect(response.body).to include('.gif')
    end
  end
end
