require 'spec_helper'

describe MarkVectorFromText do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  describe '#perform' do
    it 'test marking a user from text' do
      Mark.create!({name: "elrond"})
      sample_text = "rails"
      MarkVectorFromText.new.perform(user.id, sample_text)
      # expect(
      #   QueryMarks.new.legible_mark_vector(user.user_identity.get_mark_vector)
      # ).to change(Marking, :count).by(1)

    end
  end
end
