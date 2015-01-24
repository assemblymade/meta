require 'spec_helper'

describe Admin::AppsController do

  let(:current_user) { User.make!(is_staff: true) }
  let(:showcase) { Showcase.create!(slug: 'energy') }
  let(:app) { Product.make! }

  before do
    sign_in(current_user)
  end

  describe "update showcase" do
    it "updates" do
      patch :update, id: app.id, showcase: showcase.slug
      expect(app.reload.showcases.first).to eq(showcase)
    end
  end

end
