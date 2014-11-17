require 'spec_helper'

describe Marking do

  before do
    @marking = Marking.new({markable: Product.first, weight: 1.0, mark_id: Mark.first})
  end

  it 'something should happen' do
    @marking[:weight].should == 1.0
  end
end
