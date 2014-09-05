class ExpenseClaim < ActiveRecord::Base
  belongs_to :user
  belongs_to :product

  has_many :expense_claim_attachments
  has_many :attachments, through: :expense_claim_attachments

  attr_accessor :total_dollars

  before_validation {
    self.total = (self.total_dollars.to_f * 100).to_i
  }
end