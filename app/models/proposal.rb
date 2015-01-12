class Proposal < ActiveRecord::Base
  belongs_to :product
  belongs_to :user
  has_many :choices
  has_many :vestings

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
    "#{self.vote_ratio.to_f*100} %"
  end

  def user_vote_status(user)
    self.choices.map{|a| a.user_id}.include?(user.id)
  end

end
