require 'spec_helper'

describe MarkVectorFromText do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  describe '#perform' do
    it 'test marking a user from text' do
      pending "Test depends on a downstream worker and class; add spies and test that they're called correctly ASAP"
      Mark.create!({name: "elrond"})
      sample_text = "elrond"
      MarkVectorFromText.new.perform(user.id, sample_text)
    end
  end
end
