require 'spec_helper'

describe Newsletter do

  it "isn't published" do
    expect(subject).to_not be_published
  end

  it "isn't cancelled" do
    expect(subject).to_not be_cancelled
  end

  describe "#publish!" do
    it "publishes" do
      subject.publish!
      expect(subject).to be_published
    end
  end

  describe "#cancel!" do
    it "cancels the broadcast" do
      subject.cancel!
      expect(subject).to be_cancelled
    end
  end

end
