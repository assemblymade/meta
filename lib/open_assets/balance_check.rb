module OpenAssets
  class BalanceCheck

    def coins_issued_on_product(product)
      expected = expected_coins_on_product(product)
      coinholder_data = coinholders_on_asset_address(product)
      if !coinholder_data['coinholders']
        puts "cannot get data"
        false
      else
        puts coinholder_data
        existing = sum_coins_with_holders(coinholder_data)
        existing >= expected
      end
    end

    def coinholders_on_asset_address(product)
      remote = OpenAssets::Remote.new("http://coins.assembly.com/")
      if product.coin_info
        asset_id = product.coin_info.asset_address
        if asset_id
          end_url = "v2/coinholders/#{asset_id}"
          coinholders = remote.get end_url
        end
      end
    end

    def sum_coins_with_holders(coinholder_data)
      owners = coinholder_data['coinholders']['owners']
      owners.sum{|a| a['asset_quantity'].to_i}
    end

    def expected_coins_on_product(product)
      if product.state == ['greenlit', 'profitable']
        10_000_000
      else
        0
      end
    end

    def expected_coins_on_user_for_product(user, product)
      TransactionLogEntry.where(product_id: product.id).where(wallet_id: user.id).sum(:cents)
    end

    def coins_on_user_product(coinholder_data, product)
      owners = coinholder_data['coinholders']['owners']
      r = []
      owners.each do |a|
        address = a['address']
        if user = User.find_by(wallet_public_address: address)
          expected_amount = expected_coins_on_user_for_product(user, product).to_i
          actual_amount = a['asset_quantity'].to_i
          if expected_amount != actual_amount
            r.append([user.username, user.wallet_public_address, actual_amount, expected_amount, expected_amount - actual_amount])
            puts "BAD USER AMOUNT ON #{product.name} for #{user.username} at #{user.wallet_public_address} has #{actual_amount} and should have #{expected_amount}"
          end
        end
      end
      r
    end

    def check_users_balances_on_product(product)
      coinholder_data = coinholders_on_asset_address(product)
      coins_on_user_product(coinholder_data, product)
    end

    def rectify_coins_on_product(product)
      diff = check_users_balances_on_product(product)
      diff.each do |d|
        coindiff = d[4]
        if coindiff < 0
          coins = -1 * coindiff
          puts "SENDING #{coins} back to #{product.name} from #{user.username}"
          OpenAssets::Transactions.new.return_coins_to_product_address(user, product, coins)
        elsif coindiff > 0
          coins = coindiff
          puts "SENDING #{coins} to #{user.username} from product #{product.name}"
          OpenAssets::Transactions.new.award_coins(product.id, user.id, coins)
        end
      end
    end

  end
end
