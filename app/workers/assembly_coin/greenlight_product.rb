module AssemblyCoin
  class GreenlightProduct < AssemblyCoin::Worker

    TOTAL_COINS_UPON_GREENLIGHT = 10_000_000
    MIN_TIME_BETWEEN_ISSUANCE=1_000

    def perform(product_id)
      product = Product.find_by(id: product_id)

      if not product.nil?
        AssemblyCoin::MaintainBtcBalance.new.perform(product_id)

        last_issued = product.issued_coins.to_i
        if last_issued.nil?
          last_issued = 0
        end

        time_since_issued = Time.now.to_i - last_issued

        if time_since_issued > MIN_TIME_BETWEEN_ISSUANCE
          Rails.logger.info "[coins] creating new coin for #{product.id}"
          AssemblyCoin::CreateCoin.new.perform(product_id, TOTAL_COINS_UPON_GREENLIGHT)
          #AssemblyCoin::TransactionsOnBlockchain.new.perform(product_id)
        else
          Rails.logger.info "[coins] you are attempting to issue coins too soon after last attempt: #{time_since_issued}"
        end
      end
    end
  end
end
