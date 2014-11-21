class UserIdentity < ActiveRecord::Base
  belongs_to :user

  has_many :markings, as: :markable
  has_many :marks, through: :markings

  def composition
    if markings = self.markings
      result = {}
      markings.each do |m|
        if result.has_key?(m.name)
          result[m.name] = result[m.name] + m.weight
        else
          result[m.name] = m.weight
        end
      end
      result
    end
  end

end
