module Financial
  class History

    def vested_coins_on_product(product)

    end

    def vested_coins_on_product_at_time(product, datetime)
      TransactionLogEntry.where(product_id: product.id).where('created_at < ?', datetime).sum(:cents)
    end

    def total_coins_on_product_at_time(datetime)  #add more sophistication here later
      10_000_000
    end

    def user_coins_at_time(product, datetime)
      data = TransactionLogEntry.where(product: product).where('created_at < ?', datetime).group('wallet_id').sum(:cents).sort_by{|k,v| -v}.select{|k, v| v > 0}
      data.map{|a, b| [User.find_by(id: a), b] }.select{|a, b| !a.nil?}.map{|a, b| [a.username, b]}
    end

    def coin_history(bins, product)
      sorted_txs = TransactionLogEntry.where(product: product).sort_by(&:created_at)
      start_date = sorted_txs.first.created_at
      end_date = sorted_txs.last.created_at

      interval = (end_date - start_date) / bins

      history = []

      (0..bins-1).each do |a|
        datef = a * interval + start_date.to_f
        date = DateTime.strptime(datef.to_s,'%s')
        data = {}
        data['date'] = date

        if a==0
          data['total'] = total_coins_on_product_at_time(date)
          data['vested'] = vested_coins_on_product_at_time(product, date)

          data['users'] = user_coins_at_time(product, date)
          history.append(data)
        else
          end_time = DateTime.strptime((datef + interval).to_s, '%s')_
          new_transactions = TransactionLogEntry.where(product: product).where('created_at > ?', date).where('created_at < ?', end_time)
          data['vested'] = data['vested'] + new_transactions.sum(:cents)
          data['users']
        end

      end
      return history
    end
  end

end
