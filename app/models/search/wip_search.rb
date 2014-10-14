module Search
  class WipSearch
    attr_reader :total, :results, :facets

    def initialize(filters={})
      search = {
        filter: {
          bool: {
            must: [{
              term: { hidden: false }
            }]
          }
        },

        highlight: {
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
          fields: {
            title: { number_of_fragments: 1 },
            'comments.sanitized_body' => { number_of_fragments: 1 }
          }
        },

        facets: {
          state: {
            terms: {
              field: 'state'
            },
            facet_filter: {
              bool: {
                must: [{
                  term: { hidden: false }
                }]
              }
            }
          },
        }
      }

      if filters[:q].present?
        search[:query] = {
          multi_match: {
            query: filters[:q],
            fields: [ 'title', 'comments.sanitized_body' ],
            operator: 'or'
          }
        }
      end

      filter_terms = []

      if filters[:state].present? && filter = StateFilter.find(filters[:state])
        filter_terms << { state: filter.slug }
      end

      if filter = filters[:product_id]
        filter_terms << { 'product.slug' => filter }
        search[:facets][:state][:facet_filter][:bool][:must] << {term: { 'product.slug' => filter }}
      end

      filter_terms.each do |filter|
        search[:filter][:bool][:must] << { term: filter }
      end

      @results = Wip.search(search)

      state_facets = @results.response['facets']['state']
      @total = state_facets['total']

      @facets = state_facets['terms'].map do |term|
        if filter = StateFilter.find(term['term'])
          FacetFilter.new(filter, term['count'])
        end
      end.compact

    end
  end
end
