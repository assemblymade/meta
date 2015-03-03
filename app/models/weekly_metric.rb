class WeeklyMetric < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  default_scope -> { order(date: :desc) }
end
