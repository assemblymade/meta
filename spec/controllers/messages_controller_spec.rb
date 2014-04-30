require 'spec_helper'

describe MessagesController do

  describe "GET #index" do

    it "is successful" do
      get :index
      expect(response).to be_success
    end

  end

  describe "POST #create" do

    let(:current_user) { User.make! }
    before { sign_in(current_user) }

    it "creates a message" do
      expect {
        post :create, message: {body: 'Text'}
      }.to change { Message.count }.by(1)
    end

  end

end
