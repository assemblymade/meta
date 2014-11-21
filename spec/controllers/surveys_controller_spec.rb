require 'spec_helper'

describe SurveysController do

  let(:user) { User.make! }

  describe "#new" do
    it "is successful" do
      sign_in(user)
      get :new
      expect(response).to be_successful
    end
  end

  describe "#create" do
    before do
      sign_in(user)
    end

    it "redirects to discover" do
      post :create, user: {interested_tags: ['design']}
      expect(response).to redirect_to(discover_path)
    end

    it "doesn't require any answers" do
      post :create
      expect(response).to redirect_to('/discover')
    end

    it 'saves all the answers' do
      post :create, user: {
        interested_tags: ["strategy", "marketing"],
        most_important_quality: "interesting work",
        how_much_time: "lots",
        previous_experience: "I like pies.",
        platforms: ["web", "ios", ""]
      }

      # we now ignore everything up interested_tags
      user.reload
      expect(user.interested_tags).to eq(["strategy", "marketing"])
    end
  end

  describe "#show" do
    it "is successful" do
      sign_in(user)
      get :show
      expect(response).to be_successful
    end
  end
end
