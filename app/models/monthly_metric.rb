class MonthlyMetric < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :product

  default_scope -> { order(date: :desc) }
end
