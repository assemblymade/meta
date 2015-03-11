class Stage < ActiveRecord::Base

  has_many :checklist_types
  has_many :products
  has_many :ideas

end
