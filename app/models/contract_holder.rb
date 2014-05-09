class ContractHolder < ActiveRecord::Base
  belongs_to :product, touch: true
  belongs_to :user
end
