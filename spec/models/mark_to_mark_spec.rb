require 'spec_helper'

describe MarkToMark do
  let(:product) { Product.make! }

  before do
    mark = Mark.create!({name: "api"})
    user = User.make!({username: "kernel"})
    MakeMarks.new.mark_it(user, mark)
  end

  it 'creates post on product' do
    expect(MarkToMark.new.inspect_user_markings(User.find_by(username: "kernel"))).to eq([])
  end
end
