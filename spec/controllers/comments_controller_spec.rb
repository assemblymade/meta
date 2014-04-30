require 'spec_helper'

describe CommentsController do
  let(:user) { User.make! }
  let(:product) { Product.make!(user: user, is_approved: true) }
  let(:wip) { Task.make!(user: user, product: product) }
  let(:watcher) { User.make! }

  describe '#create' do
    before do
      sign_in user

      wip.save!
      wip.watch! watcher

      post :create, product_id: product.slug, wip_id: wip.number, event_comment: { body: 'oh hai!', type: Event::Comment.to_s }
    end

    it "assigns event" do
      expect(assigns(:event))
    end
  end
end
