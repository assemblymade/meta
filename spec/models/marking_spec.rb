require 'spec_helper'

describe Marking do

  before do
    @marking = Marking.create!({markable: Product.first, weight: 1.0, mark_id: Mark.first})
  end

  it 'weight should be 1' do
    @marking[:weight].should == 1.0
  end

  it 'product should have marking' do
    Product.first.marks.include?(@marking).should == true
  end

end
