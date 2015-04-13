require 'spec_helper'

describe Finance do
  let(:product) { Product.make! }

  it 'produce revenue reports' do
    expect(Finance.new.revenue_reports(product)).to eq([["Profits"], ["Expenses"], ["PlatformCosts"], ["Dates"]])
  end
end
