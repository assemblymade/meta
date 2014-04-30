require 'activerecord/uuid'

module Financial
  # http://en.wikipedia.org/wiki/Journal_entry

  class Transaction < ActiveRecord::Base
    @table_name = 'financial_transactions'

    include ActiveRecord::UUID

    belongs_to :product

    has_many :credit_amounts, :inverse_of => :financial_transaction, :extend => AmountsExtension
    has_many :debit_amounts, :inverse_of => :financial_transaction, :extend => AmountsExtension
    has_many :credit_accounts, :through => :credit_amounts, :source => :account
    has_many :debit_accounts, :through => :debit_amounts, :source => :account

    accepts_nested_attributes_for :credit_amounts, :debit_amounts
    alias_method :credits=, :credit_amounts_attributes=
    alias_method :debits=, :debit_amounts_attributes=

    validate :has_credit_amounts?
    validate :has_debit_amounts?
    validate :amounts_cancel?

    # private

    def description=(s)
      self.details = s.split.inject({}) {|h, pair| k,v = pair.split('='); h[k] = v; h }
    end

    def has_credit_amounts?
      errors[:base] << "Transaction must have at least one credit amount" if self.credit_amounts.blank?
    end

    def has_debit_amounts?
      errors[:base] << "Transaction must have at least one debit amount" if self.debit_amounts.blank?
    end

    def amounts_cancel?
      errors[:base] << "The credit and debit amounts are not equal" if credit_amounts.balance != debit_amounts.balance
    end
  end
end
