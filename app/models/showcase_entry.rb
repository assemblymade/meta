class ShowcaseEntry < ActiveRecord::Base
  belongs_to :product
  belongs_to :showcase
end
