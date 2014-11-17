require 'spec_helper'

describe Mark do

  before do
    @mark = Mark.new({name: "test"})
  end

  it 'something should happen' do
    @mark[:name].should == "test"
  end
end
