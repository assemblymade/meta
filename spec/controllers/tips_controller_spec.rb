require 'spec_helper'

describe TipsController do
  let(:tipper) { User.make! }
  let(:via) { Activity.make! }
  let(:product) { via.target.product }

  before do
    sign_in tipper

    TransactionLogEntry.minted!(SecureRandom.uuid, Time.now, product, SecureRandom.uuid, tipper.id, 5)

    post :create,
      product_id: product.slug,
      tip: { add: "5", via_type: Activity.to_s, via_id: via.id },
      format: :json
  end

  it "responds successfully with an HTTP 200 status code" do
    expect(response).to be_success
  end

  it "creates a Tip" do
    expect(assigns(:tip).product).to eq(product)
    expect(assigns(:tip).cents).to eq(5)
  end
end
