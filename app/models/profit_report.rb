class ProfitReport < ActiveRecord::Base
  belongs_to :product, touch: true
end