class ProductSearch
  attr_reader :total, :results, :tech_facets

  def initialize(q, tech)
    tech_filter = TechFilter.find(tech)

    search = {
      query: { match: { _all: q } },

      highlight: {
        pre_tags: ['<span class="highlight">'],
        post_tags: ['</span>'],
        fields: { name: {}, pitch: {}, description: {}}
      },

      facets: {
        tech: {
          terms: {
            field: 'tech'
          },
        },
      }
    }

    if tech_filter
      # TODO: (whatupdave) this is an extra call to ES to get the total doc count
      # without the filter. There's probably a more efficient way to get this number
      @total = Product.search(search).response['hits']['total']

      search[:filter] = {term: { tech: tech_filter.slug } }
    end

    @results = Product.search(search)
    @total ||= @results.response['hits']['total']

    tech_facets = @results.response['facets']['tech']

    @tech_facets = tech_facets['terms'].map do |term|
      TechFacet.new(TechFilter.find(term['term']), term['count'])
    end
    @tech_facets.sort_by!{|f| -f.count }
  end
end