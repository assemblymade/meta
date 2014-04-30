require 'activerecord/uuid'

class Metric < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :product

  has_many :measurements do
    def in_week(date)
      where(
        'date(measurements.created_at) >= ? and date(measurements.created_at) < ?',
        date.beginning_of_week,
        date.beginning_of_week + 7.days
      )
    end

    def in_month(date)
      where(
        'date(measurements.created_at) >= ? and date(measurements.created_at) < ?',
        date.beginning_of_month,
        date.beginning_of_month + 1.month
      )
    end
  end

  has_many :uniques do
    def on_day(date)
      where('date(uniques.created_at) = ?', date)
    end

    def in_week(date)
      where(
        'date(uniques.created_at) >= ? and date(uniques.created_at) < ?',
        date.beginning_of_week,
        date.beginning_of_week + 7.days
      )
    end

    def in_month(date)
      where(
        'date(uniques.created_at) >= ? and date(uniques.created_at) < ?',
        date.beginning_of_month,
        date.beginning_of_month + 1.month
      )
    end

    def count_uniq
      group(:distinct_id).count.count
    end
  end
end
