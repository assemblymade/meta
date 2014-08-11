class Work < ActiveRecord::Base
  self.table_name = "work"

  belongs_to :product
  belongs_to :user

  has_many :votes, :as => :voteable

  alias_method :winner, :user

  def votable?
    true
  end

  def promoted?
    true
  end

  def score
    votes_count
  end

  def downvotable?
    false
  end

  def score_multiplier
    1
  end

  def coins
    product.decorate.current_exchange_rate * score
  end

  def coins_add
    score_multiplier * product.decorate.current_exchange_rate
  end

  def contracts
    WorkContracts.new(self)
  end
end
