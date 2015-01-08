class Choice < ActiveRecord::Base
  belongs_to :user
  belongs_to :proposal

  def weighted
    self.decision_weight * self.choice_weight
  end

  def unweighted
    self.decision_weight
  end
end
