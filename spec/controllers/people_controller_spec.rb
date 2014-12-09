require 'spec_helper'

describe PeopleController do
  let(:product) { Product.make! }
  let(:user) { User.make! }
  let(:follower) { User.make! }

  describe 'GET #show' do
    it 'is successful' do
      get :index, product_id: product.slug

      expect(response).to be_successful
    end
  end

  describe 'POST #create' do
    before do
      sign_in user
    end

    it 'is successful' do
      post :create, product_id: product.slug, format: :json

      expect(response).to be_successful
    end

    it 'creates a membership' do
      post :create, product_id: product.slug, format: :json

      expect(assigns(:membership)).to be_persisted
    end
  end

  describe 'PATCH #update' do
    before do
      sign_in user
    end

    it 'updates a user' do
      product.team_memberships.create!(user: user, is_core: false)
      patch :update, product_id: product.slug, id: user.id, membership: { bio: 'foo' }, format: :json

      expect(response).to be_successful
    end

    it 'sends mail to followers the first time a bio is set' do
      product.followers << follower
      product.team_memberships.create!(user: user, is_core: false)

      patch :update, product_id: product.slug, id: user.id, membership: { bio: 'foo' }, format: :json

      mail_job_args = Sidekiq::Extensions::DelayedMailer.jobs.first['args'].first

      expect(mail_job_args).to include('new_introduction')
    end

    it "doesn't send email when an existing bio is updated" do
      product.followers << follower
      product.team_memberships.create!(user: user, is_core: false, bio: 'My first intro')

      patch :update, product_id: product.slug, id: user.id, membership: { bio: 'My updated intro' }, format: :json

      expect(Sidekiq::Extensions::DelayedMailer).to have(0).jobs
    end

    it 'creates a story' do
      product.team_memberships.create!(user: user, is_core: false)
      patch :update, product_id: product.slug, id: user.id, membership: { bio: 'foo' }, format: :json

      expect(PublishActivity.jobs.size).to eq(1)
    end
  end

  describe 'DELETE #destroy' do
    before do
      sign_in user
    end

    it 'removes a membership' do
      delete :destroy, product_id: product.slug, id: user.id, format: :json

      expect(response).to be_successful
    end
  end

end
