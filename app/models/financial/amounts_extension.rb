module Financial
  module AmountsExtension
    def balance
      balance = 0
      each do |amount_record|
        if amount_record.amount
          balance += amount_record.amount
        else
          balance = nil
        end
      end

      balance
    end
  end
end