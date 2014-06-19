module TippableSerializer
  extend ActiveSupport::Concern

  included do
    attributes :total_tips
    has_many :tips
  end

  def total_tips
    tips.sum(:cents)
  end

  def tips
    Tip.where(via: object)
  end
end
