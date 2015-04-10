require 'spec_helper'

describe AssemblyCoin::MaintainBtcBalance do

  it 'determines send amount' do
    expect(AssemblyCoin::MaintainBtcBalance.new.get_send_amount(0)).to be >= 0.0
  end

end
