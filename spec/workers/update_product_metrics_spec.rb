require 'spec_helper'
require 'sidekiq/testing'

describe UpdateProductMetrics do
  let!(:product) { Product.make! }

  describe '#perform' do
    it 'records metrics' do
      u = UpdateProductMetrics.new

      expect(u).to receive(:visits) do
        [{
          "app_id" => product.asmlytics_key,
          "date"=>"2015-02-26 00:00:00",
          "uniques" => "1610",
          "visits" => "2049",
          "registered_visits" => "409"
        }]
      end

      expect(u).to receive(:total_accounts) do
        [{
          "app_id" => product.asmlytics_key,
          "date" => Date.parse("2015-02-26"),
          "registered_users" => "5489"
        }]
      end

      u.perform

      metric = product.daily_metrics.first

      expect(metric).to_not be_nil
      expect(metric.date).to eq(Date.parse('2015-02-26'))
      expect(metric.uniques).to eq(1610)
      expect(metric.visits).to eq(2049)
      expect(metric.registered_visits).to eq(409)
      expect(metric.total_accounts).to eq(5489)
    end
  end
end
