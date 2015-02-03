require 'spec_helper'

describe ScreenshotsController do
  let(:user) { User.make! }
  let(:product) { Product.make!(user: user) }
  let(:attachment) { Attachment.make!(user: user) }

  before do
    sign_in user
  end

  it 'successfully creates a screenshot' do
    post :create,
      product_id: product.slug,
      asset: { name: 'asset', attachment_id: attachment.id },
      format: :json

    expect(assigns(:screenshot).position).to be_within(10).of(Time.now.to_i)
  end
end
