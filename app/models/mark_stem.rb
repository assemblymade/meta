class MarkStem < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension
  
  has_many :marks

end
