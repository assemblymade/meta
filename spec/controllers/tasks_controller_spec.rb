require 'spec_helper'

describe TasksController do
  let(:user) { User.make! }
  let(:worker) { User.make! }
  let(:product) { Product.make!(user: user, state: 'team_building') }
  let!(:wips) { [Task.make!(user: user, product: product)] }
  let!(:event) { NewsFeedItemComment.make!(user: worker) }

  describe '#create' do
    let(:follower) { User.make! }
    before do
      sign_in user
    end

    it 'adds creator as a follower' do
      post :create, product_id: product.slug, task: { title: 'It was a dark and stormy night', description: 'Get ye flask' }

      expect(assigns(:bounty).followers).to include(user)
    end

    it 'does not automatically add product followers as wip followers' do
      product.followers << follower

      post :create, product_id: product.slug, task: { title: 'It was a dark and stormy night', description: 'Get ye flask' }

      expect(assigns(:bounty).followers).not_to include(follower)

    end

  end

  describe '#index' do
    before do
      sign_in user
      get :index, product_id: product.slug
    end

    it "is succesful" do
      expect(response).to be_successful
    end

    it "assigns wips" do
      expect(assigns(:bounties)).to be
    end
  end

  describe '#award' do
    before do
      sign_in user
      product.team_memberships.create(user: user, is_core: true)
      patch :award, product_id: product.slug, id: wips.first.number, event_id: event.id, format: :js
    end

    it "sends awarded mail" do
      expect(
        Sidekiq::Extensions::DelayedMailer.jobs.size
      ).to eq(1)
    end
  end

  describe '#update' do
    before do
      sign_in user
      product.team_memberships.create(user: user, is_core: true)
    end

    it 'updates a wip' do
      patch :update, product_id: product.slug, id: wips.first.number, task: { title: 'Foo' }
      expect(response.status).to eq(302)
    end
  end

  describe '#tag' do
    before do
      sign_in user
    end

    it 'tags a wip' do
      patch :tag, product_id: product.slug, wip_id: wips.first.number, task: { tag_list: ['foo', 'bar', 'baz'] }
      expect(response.status).to eq(302)
      expect(assigns(:wip)).to be
    end
  end

  describe '#mute' do
    before do
      sign_in user
      request.env["HTTP_REFERER"] = "/"
    end

    it 'unfollows the wip' do
      patch :mute, product_id: product.slug, wip_id: wips.first.number, task: { title: 'Foo' }

      expect(assigns(:wip)).to_not be_followed_by(user)
    end
  end

  # effectively an un-mute
  describe '#watch' do
    let(:wip) { wips.first }

    before do
      sign_in worker
      request.env["HTTP_REFERER"] = "/"
      product.watch!(worker)
      wip.unfollow!(worker)
    end

    it 'unmutes a wip' do
      patch :watch, product_id: product.slug, wip_id: wip.number, task: { title: 'Foo' }
      expect(response.status).to eq(302)
      expect(assigns(:wip).followed_by?(worker)).to be_truthy
    end
  end

  describe '#flag' do
    let(:wip) { wips.first }

    before do
      sign_in user
    end

    it 'sets flagged_at and flagged_by on wip' do
      patch :flag, product_id: product.slug, wip_id: wip.number
      expect(assigns(:wip).flagged_at).to be_within(10).of(Time.now)
      expect(assigns(:wip).flagged_by).to eq(user)
    end
  end
end
