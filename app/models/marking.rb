class Marking < ActiveRecord::Base
  DEFAULT_WEIGHT = 1.0

  belongs_to :mark
  belongs_to :markable, polymorphic: true
  
  validates :weight, presence: true

  before_validation :set_default_weight

  def set_default_weight
    self.weight ||= DEFAULT_WEIGHT
  end
end
