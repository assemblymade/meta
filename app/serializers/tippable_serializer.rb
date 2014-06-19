module TippableSerializer
  extend ActiveSupport::Concern

  included do
    attributes :total_tips, :tips
  end

  def total_tips
    raw_tips.sum(:cents)
  end

  def raw_tips
    Tip.where(via: object)
  end

  def tips
    ActiveModel::ArraySerializer.new(raw_tips).as_json
  end
end
