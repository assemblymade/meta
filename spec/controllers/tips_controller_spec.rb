require 'spec_helper'

describe TipsController do
  let(:tipper) { User.make! }
  let(:event) { Event::Comment.make! }
  let(:product) { event.wip.product }

  before do
    sign_in tipper

    TransactionLogEntry.minted!(SecureRandom.uuid, Time.now, product, SecureRandom.uuid, tipper.id, 5)

    post :create, product_id: event.wip.product.slug, event_id: event.id, tip: { add: "5" }, format: :json
  end

  it "responds successfully with an HTTP 200 status code" do
    expect(response).to be_success
  end

  it "creates a Tip" do
    expect(assigns(:tip).product).to eq(product)
    expect(assigns(:tip).cents).to eq(5)
  end
end
