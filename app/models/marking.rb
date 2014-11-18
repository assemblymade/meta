class Marking < ActiveRecord::Base
  belongs_to :mark
  belongs_to :markable, polymorphic: true
end
