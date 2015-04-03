class Proposal < ActiveRecord::Base
  belongs_to :product
  belongs_to :user
  has_many :choices
  has_many :vestings
  has_one :news_feed_item, foreign_key: 'target_id'

  after_commit :push_to_news_feed, on: :create
  after_commit :update_news_feed_item

  def contracts
    if self.contract_type == "vesting"
      self.vestings
    else
      []
    end
  end

  def vote_ratio
    if self.choices.count > 0
      (self.choices.to_a.sum{|a| a.value*a.weight}).round(2)
    else
      0
    end
  end

  def votes_ratio_absolute
    self.choices.sum{|a| if a.value > 0
      1
    else
      -1
    end
      } / self.choices.count
  end

  def votes_core
    self.choices.where(type: "")
  end

  def won?  #define win criteria here
    self.vote_ratio > 0.5
  end

  def passed?
    self.state == "passed"
  end

  def update_state
    if self.won? && !self.expired?
      newstate = "passed"
    elsif !self.won? && !self.expired?
      newstate = "open"
    elsif !self.won? && !self.expired? && self.state != "passed"
      newstate = "failed"
    elsif self.expired? && self.state=="open"
      newstate = "expired"
    end
    self.update!({state: newstate})
  end

  def win_criteria_text #update this also with win criteria
    "/ 50 %"
  end

  def user_weight(user)
    my_coins = user.transaction_log_entries.where(product_id: self.product.id).sum(:cents)
    total_coins = TransactionLogEntry.where(product_id: product.id).sum(:cents)
    if total_coins > 0
      weight = my_coins.to_f / total_coins.to_f
    else
      weight = 0
    end
    weight
  end

  def vote(user, value)
    weight = user_weight(user)
    if self.choices.map(&:user).include?(user)
      self.choices.where(user_id: user.id).update({value: value, weight: weight})  #overrides any old vote if it exists
    else
      new_choice = Choice.create!({
        value: value,
        weight: weight,
        type: "",
        proposal: self,
        user: user
        })
        self.choices.append(new_choice)
    end
  end

  def status
    (self.vote_ratio.to_f*100).round(0)
  end

  def user_vote_status(user)
    self.choices.map{|a| a.user_id}.include?(user.id)
  end

  def expired?
    self.expiration - Time.now < 0
  end

  def time_left_text
    days = ((self.expiration - Time.now)/86400).to_i.abs

    if days == 0
      days = ((self.expiration - Time.now)/3600).to_i
      days = days.to_s + " hours"
    else
      days = days.to_s + " days"
    end

    if self.state=="open"
      days = "Expires " + days + " from now"
    elsif self.state=="failed" || self.state=="expired"
      days = "Expired " + days + " ago"
    elsif self.state == "passed"
      days = ""
    end
    days
  end

  def push_to_news_feed
    NewsFeedItem.create_with_target(self)
  end

  def update_news_feed_item
    if self.news_feed_item
      self.news_feed_item.update(updated_at: Time.now)
    end
  end

  def enforce
    if self.contract_type == "vesting"
      self.contracts.each do |c|
        c.check_for_payout
      end
    end
  end

  def url_params
    [self.product, self]
  end

end
