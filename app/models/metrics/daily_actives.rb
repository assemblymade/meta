require 'activerecord/uuid'
require 'core_ext/time_ext'

class Metrics::DailyActives < ActiveRecord::Base
  include ActiveRecord::UUID

  scope :in_week, ->(date) {
    where('created_at >= ? and created_at < ?',
      date.beginning_of_week, date.beginning_of_week + 1.week
    )
  }
end