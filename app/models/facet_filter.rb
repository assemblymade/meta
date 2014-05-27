class FacetFilter
  attr_reader :filter
  attr_reader :count

  delegate :name, :slug, to: :filter

  def initialize(filter, count)
    @filter = filter
    @count = count
  end
end