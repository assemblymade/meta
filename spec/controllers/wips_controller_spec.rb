require 'spec_helper'

describe TasksController do
  let(:user) { User.make! }
  let(:worker) { User.make! }
  let(:product) { Product.make!(user: user, is_approved: true) }
  let!(:wips) { [Task.make!(user: user, product: product)] }
  let!(:event) { Event::Comment.make!(wip: wips.first, user: worker) }

  describe '#index' do
    before do
      sign_in user
      get :index, product_id: product.slug
    end

    it "is succesful" do
      expect(response).to be_successful
    end

    it "assigns wips" do
      expect(assigns(:wips)).to be
    end
  end

  describe '#award' do
    before do
      sign_in user
      product.core_team << user
      patch :award, product_id: product.id, id: wips.first.number, event_id: event.id, format: :js
    end

    it "sends awarded mail" do
      expect(
        Sidekiq::Extensions::DelayedMailer.jobs.size
      ).to eq(1)
    end
  end

end
