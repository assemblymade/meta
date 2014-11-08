class Chronicle < ActiveRecord::Base
  has_many :deeds

  def self.get_deeds
    myuser = self.user_id
    deeds = Deed.where(user_id: myuser)
  end

  def self.get_sum_karma

  end

end
