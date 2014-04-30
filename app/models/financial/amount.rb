require 'activerecord/uuid'

module Financial
  class Amount < ActiveRecord::Base
    @table_name = 'financial_amounts'

    include ActiveRecord::UUID

    belongs_to :financial_transaction, class_name: 'Financial::Transaction'
    belongs_to :account

    def account_name=(name)
      self.account = account.product.financial_accounts.find_by(name: name)
    end
  end
end