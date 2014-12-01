require 'spec_helper'

describe AssetsController do
  let(:current_user) { User.make! }

  describe '#create' do
    let(:current_user) { User.make! }
    let(:product) { Product.make! }
    let(:attachment) { Attachment.make!(user: current_user) }
    let(:wip) { Task.make!(product: product, user: current_user) }
    let(:event) {
      Event::Comment.make!(
        attachments: [attachment],
        user: current_user,
        wip: wip
      )
    }

    before do
      sign_in current_user
    end

    it "transfers an event's attachments if passed an event_id" do
      pending "Getting a 302, but not sure where it's coming from"
    end

    it "transfers one attachment if passed an attachment_url" do
      pending "Getting a 302, but not sure where it's coming from"
    end

    it "creates an asset if passed an attachment_id and name" do
      pending "Getting a 302, but not sure where it's coming from"
    end
  end
end
