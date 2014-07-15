require 'spec_helper'

describe PostsController do

  let(:product) { Product.make! }
  let(:post) { Post.make!(product: product) }
  let(:current_user) { User.make! }

  before do
    product.team_memberships.create(user: current_user, is_core: true)
  end

  describe "#new" do

    it "is successful" do
      sign_in current_user
      get :new, product_id: post.product.slug
      expect(response).to be_successful
    end

  end

  describe "#show" do

    it "is successful" do
      get :show, product_id: product.slug, id: post.slug
      expect(response).to be_successful
    end

  end

end
