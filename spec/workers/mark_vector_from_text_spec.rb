require 'spec_helper'

describe MarkVectorFromText do
  let(:user) { User.make! }
  let(:product) { Product.make! }
  let(:marker) {Mark.create!({name: "Westernesse"})}

  describe '#perform' do
    it 'test marking a user from text' do
      sample_text = "Westernesse was in the lands of Arnor, in the Second Age."
      expect {
        MarkVectorFromText.new.perform(user.id, sample_text)
      }.to change(Marking, :count).by(1)

    end
  end
end
