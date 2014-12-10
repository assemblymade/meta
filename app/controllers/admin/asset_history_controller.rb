class Admin::AssetHistoryController < AdminController

  def index
    @asset_data = {}
    (1..12).each do |m|
      t = DateTime.new(DateTime.now.year, 13-m, 1)
      if t< DateTime.now
        @asset_data[t] = {}
        @asset_data[t]['btc_assets'] = OpenAssets::Transactions.new.btc_assets_as_of_date(t)
        @asset_data[t]['USD_change'] = OpenAssets::Transactions.new.gainloss_for_month(t)
        @asset_data[t]['dollars_spent'] = OpenAssets::Transactions.new.dollars_spent_on_btc_per_month(t)
        @asset_data[t]['USD_outflows'] = OpenAssets::Transactions.new.dollar_outflows_as_btc_per_month(t)
        @asset_data[t]['USD_average'] = OpenAssets::Transactions.new.average_bought_price_as_of_date(t)
      end
    end
  end
end
