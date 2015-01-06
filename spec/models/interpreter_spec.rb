require 'spec_helper'

describe Interpreter do

  let(:user) { User.make! }
  let(:mark) { Mark.create!(name: 'altmark') }
  let(:mark2) { Mark.create!(name: 'sudmark') }
  let(:product) { Product.make! }
  let(:wip) { Wip.make! }

  it 'mark_vector_from_text' do
    firstmark = Mark.create!({name: 'tyrol'})
    secondmark = Mark.create!({name: 'pommern'})
    r = (2**-0.5).round(2)
    vector = Interpreter.new.mark_vector_from_text("Tyrol Pommern!!!")
    vector = vector.map{|v| [v[0], v[1].round(2)]}
    expect(vector).to eq([[firstmark.id, r], [secondmark.id, r]])
  end

end
