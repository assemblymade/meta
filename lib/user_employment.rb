class UserEmployment
  attr_reader :employer, :position

  def initialize(history)
    @employer = history.first['employer']['name']
    @position = history.first['position']['name']
  end
end