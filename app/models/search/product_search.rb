module Search
  class ProductSearch
    attr_reader :total, :results, :facets

    def initialize(q, filters={})
      tech_filter = filters[:tech] && TechFilter.find(filters[:tech])

      search = {
        query: {
          multi_match: {
            query: q,
            fields: [ 'name.raw^2', 'name', 'pitch', 'sanitized_description' ],
            operator: 'or',
            fuzziness: 1
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
        search[:filter][:term].update tech: tech_filter.slug
      end

      @results = Product.search(search)

      tech_facets = @results.response['facets']['tech']
      @total = tech_facets['total']

      @facets = tech_facets['terms'].map do |term|
        if filter = TechFilter.find(term['term'])
          FacetFilter.new(filter, term['count'])
        end
      end
      @facets.compact.sort_by!{|f| -f.count }
    end
  end
end
