class Work < ActiveRecord::Base
  self.table_name = "work"

  belongs_to :product
  belongs_to :user

  has_many :votes, :as => :voteable

  after_create :auto_upvote

  def upvote!(user, ip)
    votes.create!(user: user, ip: ip)
    product.watch!(user)
    TransactionLogEntry.voted!(Time.current, product, self.id, user.id, 1)
  end

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

  def has_user_voted?(user)
    Vote.voted?(user, self)
  end

  def coins
    product.decorate.current_exchange_rate * score
  end

  def coins_add
    score_multiplier * product.decorate.current_exchange_rate
  end

  protected
  def auto_upvote
    upvote!(user, user.last_sign_in_ip || '0.0.0.0')
  end
end