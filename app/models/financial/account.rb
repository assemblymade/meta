require 'activerecord/uuid'

module Financial
  # http://en.wikipedia.org/wiki/Debits_and_credits

  # TYPE        | NORMAL BALANCE    | DESCRIPTION
  # --------------------------------------------------------------------------
  # Asset       | Debit             | Resources owned by the Business Entity
  # Liability   | Credit            | Debts owed to outsiders
  # Equity      | Credit            | Owners rights to the Assets
  # Revenue     | Credit            | Increases in owners equity
  # Expense     | Debit             | Assets or services consumed in the generation of revenue

  # Examples
  # Financial::Asset.create! product: product, name: 'Bank'                       # the product's bank account
  # Financial::Expense.create! product: product, name: 'Software Services'        # expenses from software services used eg. hosting
  # Financial::Expense.create! product: product, name: 'Distributions Paid'       # distributions paid to contributors
  # Financial::Revenue.create! product: product, name: 'Sales'                    # sales of the product
  # Financial::Liability.create! product: product, name: 'Distributions Payable'  # distributions to pay to contributors
  # Financial::Liability.create! product: product, name: 'Assembly Loan'          # money borrowed from Assembly to pay expenses

  class Account < ActiveRecord::Base
    @table_name = 'financial_accounts'

    include ActiveRecord::UUID

    belongs_to :product
    
    has_many :credit_amounts, :extend => AmountsExtension
    has_many :debit_amounts, :extend => AmountsExtension
    has_many :credit_transactions, :through => :credit_amounts, :source => :transaction
    has_many :debit_transactions, :through => :debit_amounts, :source => :transaction

    validates :product, presence: true
    validates :type, presence: true
    validates :name, presence: true, uniqueness: true

    def credits_balance
      credit_amounts.balance
    end

    def debits_balance
      debit_amounts.balance
    end
  end
end
