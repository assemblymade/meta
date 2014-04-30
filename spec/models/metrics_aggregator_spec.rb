require 'spec_helper'

describe MetricsAggregator do
  let(:product) { Product.make! }
  let(:at) { Date.parse('1/1/1') }

  describe '#by_week' do
    let(:metric) { Metric.create!(product: product, name: 'signups') }
    before do
      # increasing signups, twice a day for 6 weeks :D
      start_at = at - 6.weeks
      (6.weeks / 12.hours).times do |i|
        Measurement.create!(metric: metric, created_at: start_at + (i * 12).hours, value: i)
      end
    end

    subject { MetricsAggregator.new(product).by_week(6, at).first.to_struct }

    its(:sum_first_week) { should == 66.0 }
    its(:sum_last_week)  { should == 1043.0 }
    its(:sum_this_week)  { should == 165.0 }
  end

  context '#uniques' do
    let(:metric) { Metric.create!(product: product, name: 'actives') }
    before do
      6.times do |i|
        start_at = at - 6.weeks
        Unique.create!(metric: metric, created_at: start_at + i.weeks, distinct_id: i)
        Unique.create!(metric: metric, created_at: start_at + i.weeks + 1.hour, distinct_id: i)
      end
    end

    subject { MetricsAggregator.new(product).by_week(6, at).first.to_struct }

    its(:sum_first_week) { should == 1 }
    its(:sum_last_week) { should == 1 }
    its(:sum_this_week) { should == 0 }
  end
end