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

    it "redirects to #show" do
      post :create, user: {interested_tags: ['design']}
      expect(response).to redirect_to('/welcome/thanks')
    end

    it "doesn't require any answers" do
      post :create, user: {previous_experience: "", platforms: [""]}
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
      user.reload
      expect(user.interested_tags).to eq(["strategy", "marketing"])
      expect(user.most_important_quality).to eq("interesting work")
      expect(user.how_much_time).to eq("lots")
      expect(user.previous_experience).to eq("I like pies.")
      expect(user.platforms).to eq(["web", "ios"])
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
