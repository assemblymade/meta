require 'spec_helper'

describe Tweeter do
  let(:user) { User.make!(twitter_nickname: "asm2d2") }
  let(:product) { Product.make!(user: user) }
  let(:wip) { Task.make!(product: product, user: user) }

  it 'get product participants' do
    expect(Tweeter.new.product_participants(product)).to eq(["asm"])
  end

  it 'generate tweeter api password' do
    a = Tweeter.new.compute_password
    expect(a.length).to eq(64)
  end

  it 'find bounty participants' do
    expect(Tweeter.new.bounty_participants(wip)).to eq(["asm2d2", "asm"])
  end
end
