module Fake
  def self.uuid(num)
    [8, 4, 4, 4, 12].map{|len| num.to_s.rjust(len, '0')}.join('-')
  end
end