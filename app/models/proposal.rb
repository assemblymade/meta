class Proposal < ActiveRecord::Base
  belongs_to :product
  belongs_to :user
  has_many :choices
  has_many :accords

  def vote_ratio
    if self.choices.count > 0
      self.choices.to_a.sum{|a| a.value*a.weight} / self.choices.to_a.sum{|a| a.weight}
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
    self.vote_ratio > 0
  end

  def vote(user, value)
    my_coins = user.transaction_log_entries.where(product_id: self.product.id).sum(:cents)
    puts my_coins
    total_coins = TransactionLogEntry.where(product_id: product.id).sum(:cents)
    puts total_coins
    if total_coins > 0
      weight = my_coins.to_f / total_coins.to_f
    else
      weight = 0
    end
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
    "#{self.vote_ratio*100} %"
  end

end
