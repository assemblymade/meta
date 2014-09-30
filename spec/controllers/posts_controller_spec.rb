require 'spec_helper'

describe PostsController do

  let(:product) { Product.make! }
  let(:current_user) { User.make! }
  let(:subscriber) { User.make! }

  before do
    product.team_memberships.create(user: current_user, is_core: true)
  end

  describe "#new" do
    it "is successful" do
      sign_in current_user
      get :new, product_id: product.slug
      expect(response).to be_successful
    end
  end

  describe "#create" do
    it 'creates the update' do
      sign_in current_user
      post :create, product_id: product.slug, post: {
        title: 'A new hope',
        summary: 'It is a period of civil war',
        body: 'Rebel spaceships, striking from a hidden base, have won their first victory against the evil Galactic Empire.'
      }

      expect(assigns(:post)).to be_persisted
    end

    it 'sends email to subscribers' do
      sign_in current_user
      product.subscribers.create!(user: subscriber, email: subscriber.email)
      product.subscribers.create!(email: 'yoda@dagobah.org')

      post :create, product_id: product.slug, post: {
        title: 'A new hope',
        summary: 'It is a period of civil war',
        body: 'Rebel spaceships, striking from a hidden base, have won their first victory against the evil Galactic Empire.'
      }

      expect_mail_queued(PostMailer, :mailing_list, assigns(:post).id, subscriber.email)
      expect_mail_queued(PostMailer, :mailing_list, assigns(:post).id, 'yoda@dagobah.org')
    end
  end

  describe "#show" do
    let(:post) { Post.make!(product: product) }

    it "is successful" do
      get :show, product_id: product.slug, id: post.slug
      expect(response).to be_successful
    end

  end

end
