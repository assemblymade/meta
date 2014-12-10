class Work < ActiveRecord::Base
  self.table_name = "work"

  belongs_to :product
  belongs_to :user

  has_many :votes, :as => :voteable

  alias_method :winner, :user

  def promoted?
    true
  end

  def contracts
    WorkContracts.new(self)
  end
end
