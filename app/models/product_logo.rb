class ProductLogo < ActiveRecord::Base
  belongs_to :product
  belongs_to :attachment
  belongs_to :user
end
