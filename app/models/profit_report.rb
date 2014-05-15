class ProfitReport < ActiveRecord::Base
  belongs_to :product, touch: true

  validates :revenue, presence: :true
  validates :expenses, presence: :true
  validates :end_at, presence: :true
  validates :royalty, presence: :true

  def profit
    revenue - expenses
  end
end