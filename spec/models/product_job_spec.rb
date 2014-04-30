require 'spec_helper'

# category
# description

describe ProductJob do
  subject { ProductJob.new } 

  it { should respond_to(:category) }
  it { should respond_to(:description) }

  it 'is invalid without a category' do
    subject.description = "test"
    subject.should_not be_valid
  end

  it 'is invalid without a description' do
    subject.category = "test"
    subject.should_not be_valid
  end

  it 'is valid with a description and category' do
    subject.description = "test"
    subject.category = "test"
    subject.should be_valid
  end

end
