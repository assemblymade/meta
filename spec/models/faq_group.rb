require 'spec_helper'

describe FaqGroup do
  before { described_class.base_path = 'spec/fixtures/faq_groups' }

  describe ".find_by_slug!" do
    subject { described_class.new('hitchhiking', 'The Guide') }
    it "finds questions from h1s" do
      expect(subject.questions.length).to eq(2)
    end
  end

end
