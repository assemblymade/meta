require 'spec_helper'

describe Screenshot do
  let(:product) { Product.make! }
  let(:user) { User.make! }
  let(:attachment) { Attachment.make!(user: user) }
  let(:asset) { Asset.make!(attachment: attachment, product: product, user: user, name: 'asset') }

  it 'creates a screenshot belonging to an asset' do
    screenshot = Screenshot.create(asset: asset, position: 0)

    expect(screenshot.position).to eq(0)
  end

  it 'allows multiple screenshots' do
    expect {
      Screenshot.create!(asset: asset, position: 0)
      Screenshot.create!(asset: asset, position: 1)
    }.not_to raise_error
  end

  it 'does not allow duplicate positions on one asset' do
    expect {
      Screenshot.create!(asset: asset, position: 0)
      Screenshot.create!(asset: asset, position: 0)
    }.to raise_error
  end
end
