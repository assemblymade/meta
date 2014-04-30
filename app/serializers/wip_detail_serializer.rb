# This should include more details for the show page
class WipDetailSerializer < WipSerializer
  has_many :watchers, serializer: UserSerializer

  attributes :design_deliverables

  def design_deliverables
    {
      items: object.design_deliverables.map{|dd| DesignDeliverableSerializer.new(dd).as_json }
    } if object.is_a?(Task) && object.design_deliverables.any?
  end
end