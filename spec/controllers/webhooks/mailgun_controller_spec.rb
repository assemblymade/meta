require 'spec_helper'

describe Webhooks::MailgunController do
  describe '#reply' do

    let(:user) { User.make!(email: 'joey@example.com') }
    let(:product) { Product.make!(slug: 'asm') }
    let(:wip) { Task.make!(product: product, user: user, number: 100) }

    before do
      controller.stub(:verify_webhook) { true }

      reply_to = SecureReplyTo.new('wip', wip.id, user.username).to_s

      post :reply,
        'To' => "asm/#{wip.number} <#{reply_to}>",
        'stripped-text' => 'An insightful comment'
    end

    it "returns 200" do
      expect(response.response_code).to eq(200)
    end

    it 'saves a new comment' do
      wip.reload.events.last.body.should == 'An insightful comment'
    end

  end

end
