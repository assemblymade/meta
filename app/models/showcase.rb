require 'core_ext/time_ext'

class Showcase < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension

  MIN_EACH_DAY = 10
  MAX_DAYS = 7

  belongs_to :product
  belongs_to :wip

  validates :product, presence: true
  validates :showcased_at, presence: true

  scope :display_order, -> {
    includes(:product).order("products.votes_count DESC")
  }

  scope :today, -> { showcasing_on_date(Date.today) }

  scope :showcasing_on_date, ->(date) {
    showcasing_in_date_range(date.advance(days: -MAX_DAYS), date)
  }

  scope :showcasing_in_date_range, ->(start_date, end_date) {
    includes(:product)
    .where('showcased_at > ?', start_date.beginning_of_day)
    .where('showcased_at <= ?', end_date.end_of_day)
  }

  scope :showcased_on_date, ->(date) {
    includes(:product).where(showcased_at: date)
  }

  scope :featureable, -> {
    includes(:product).where('products.flagged_at' => nil)
                      .references(:product)
  }

  def self.this_weeks_products
    display_order.limit(10).collect(&:product)
  end

  def ideal?
    product.updated_at >= 1.week.ago &&
    product.poster.present? &&
    product.description.present?
  end

end
