# This should include more details for the show page
class WipHotSerializer < WipSerializer


  attributes :description

  def description
    object.description
  end

end
