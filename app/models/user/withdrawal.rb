class User::Withdrawal < ActiveRecord::Base
  belongs_to :user

  validates :user, presence: true
  validates :amount, presence: true

  acts_as_sequenced column: :reference, start_at: 1
end
