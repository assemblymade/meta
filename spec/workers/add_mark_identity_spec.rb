require 'spec_helper'

describe AddMarkIdentity do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  describe '#perform' do
    it 'add mark vector for user' do
      mark = Mark.create!({name: 'SWEDMARK'})
      mark_vector = [[mark.id,1.0]]
      AddMarkIdentity.new.perform(user.id, mark_vector, 1.5)
      expect(user.user_identity.get_mark_vector).to eq(mark_vector)
    end
  end
end
