module Financial
  class CreditAccount < Account
    def balance
      unless contra
        credits_balance - debits_balance
      else
        debits_balance - credits_balance
      end
    end
  end
end