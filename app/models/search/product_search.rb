module Search
  class ProductSearch
    attr_reader :total, :results, :facets

    def initialize(q, filters={})
      tech_filter = TechFilter.find(filters[:tech])

      search = {
        query: {
          multi_match: {
            query: q,
            fields: [ 'name.raw^2', 'name', 'pitch', 'sanitized_description' ],
            operator: 'or',
            fuzziness: 2
          }
        },

        filter: {
          term: {
            hidden: false
          }
        },

        highlight: {
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
          fields: {
            name: { number_of_fragments: 1 },
            pitch: { number_of_fragments: 1 },
            sanitized_description: { number_of_fragments: 1 }
          }
        },

        facets: {
          tech: {
            terms: {
              field: 'tech'
            },
            facet_filter: {
              term: { hidden: false }
            }
          },
        }
      }

      if tech_filter
        # TODO: (whatupdave) this is an extra call to ES to get the total doc count
        # without the filter. There's probably a more efficient way to get this number
        @total = Product.search(search).response['hits']['total']

        search[:filter][:term].update tech: tech_filter.slug
      end

      @results = Product.search(search)
      @total ||= @results.response['hits']['total']

      tech_facets = @results.response['facets']['tech']

      @facets = tech_facets['terms'].map do |term|
        FacetFilter.new(TechFilter.find(term['term']), term['count'])
      end
      @facets.sort_by!{|f| -f.count }
    end
  end
end