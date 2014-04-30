require 'spec_helper'

describe DiscussionsController do
  render_views

  let(:user) { User.make! }
  let(:product) { Product.make!(user: user, is_approved: true) }
  let(:wip) { Discussion.make!(product: product) }

  describe '#show' do
    before do
      wip
      get :show, product_id: product.slug, id: wip.number
    end

    it "assigns wip" do
      expect(assigns(:wip))
    end
  end

  context 'completing discussions mission' do
    before {
      sign_in user

      post :create, product_id: product.slug, discussion: { title: 'First!' }
      post :create, product_id: product.slug, discussion: { title: 'Second!', description: 'Such wow' }
    }

    it 'advances to next mission' do
      expect(product.current_mission.id).to eq(:tasks)
    end

    it 'assigns flash message' do
      expect(flash[:mission_completed]).to be_true
    end
  end
end
