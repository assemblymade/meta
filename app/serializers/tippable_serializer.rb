module TippableSerializer
  extend ActiveSupport::Concern

  included do
    attributes :tips
  end

  def tips
    ActiveModel::ArraySerializer.new(object.tips).as_json
  end
end
