# This is currently only used for the tip that goes to the bounty author
class TipContract
  attr_reader :percentage, :user

  def initialize(attributes = {})
    @percentage = attributes[:percentage]
    @user = attributes[:user]
  end
end
