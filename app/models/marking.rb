class Marking < ActiveRecord::Base
  belongs_to :markable, polymorphic: true
  belongs_to :mark
end
