require 'spec_helper'

describe Question do
  describe 'by_group' do
    before { Question.base_path = 'spec/fixtures/questions' }
    subject { Question.by_group('hitchhiking') }
    its(:size) { should = 2 }
  end

  context 'from_file' do
    subject { Question.from_file Rails.root.join('spec/fixtures/questions/hitchhiking.markdown') }

    it 'has questions' do
      subject.size.should == 2
      subject.first.title.should == 'What advice do you have?'
      subject.first.body.should == "Don't Panic."
    end
  end
end