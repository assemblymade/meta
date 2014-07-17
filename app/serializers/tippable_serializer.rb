module TippableSerializer
  extend ActiveSupport::Concern

  included do
    attributes :total_tips, :tips
  end

  def total_tips
    object.sum_tip_cents
  end

  def tips
    ActiveModel::ArraySerializer.new(object.tips).as_json
  end
end
