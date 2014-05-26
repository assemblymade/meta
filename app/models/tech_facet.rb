class TechFacet
  attr_reader :tech_filter
  attr_reader :count

  delegate :name, :slug, to: :tech_filter

  def initialize(tech_filter, count)
    @tech_filter = tech_filter
    @count = count
  end
end