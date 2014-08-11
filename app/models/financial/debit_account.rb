module Financial
  class DebitAccount < Account
    def balance
      unless contra
        debits_balance - credits_balance
      else
        credits_balance - debits_balance
      end
    end
  end
end
