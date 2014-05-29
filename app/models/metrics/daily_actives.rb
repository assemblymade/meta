require 'activerecord/uuid'
require 'core_ext/time_ext'

class Metrics::DailyActives < ActiveRecord::Base
  include ActiveRecord::UUID

  scope :in_week, ->(date) { active_between(date.beginning_of_week, date.beginning_of_week + 1.week) }

  scope :active_between, ->(start_date, end_date) {
    where('created_at >= ? and created_at <= ?',
      start_date, end_date
    )
  }
end