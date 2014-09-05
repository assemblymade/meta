class ExpenseClaimAttachment < ActiveRecord::Base
  belongs_to :expense_claim
  belongs_to :attachment
end