require 'spec_helper'

describe Users::RegistrationsController do
  before :each do
    request.env["devise.mapping"] = Devise.mappings[:user]
  end

  let!(:kernel) { User.make!(username: 'kernel') }

  describe "POST #create" do

    context "valid user" do

      let(:user_attributes) do
        {
          email: "user#{rand(100000)}@example.com",
          password: "foobar01",
          password_confirmation: "foobar01",
          username: "finn"
        }
      end

      it "redirects to the discover products page by default" do
        post :create, user: user_attributes
        expect(response).to redirect_to(discover_path)
      end

      it "creates a signed up news feed item" do
        post :create, user: user_attributes
        hello = NewsFeedItem.find_by(source_id: assigns(:user).id)
        expect(hello.target).to eq(assigns(:user))
      end

      it "gets kernel to heart the news feed item" do
        post :create, user: user_attributes
        hello = NewsFeedItem.find_by(source_id: assigns(:user).id)

        expect(hello.hearts.first.user).to eq(kernel)
      end
    end
  end

end
