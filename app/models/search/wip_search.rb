module Search
  class WipSearch
    attr_reader :total, :results, :facets

    def initialize(q, state=nil)
      search = {
        query: {
          multi_match: {
            query: q,
            fields: [ 'title', 'comments.sanitized_body' ],
            operator: 'or',
            fuzziness: 2
          }
        },

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
              term: { hidden: false }
            }
          },
        }
      }

      if filter = StateFilter.find(state)
        # TODO: (whatupdave) this is an extra call to ES to get the total doc count
        # without the filter. There's probably a more efficient way to get this number
        @total = Wip.search(search).response['hits']['total']

        search[:filter][:bool][:must] << {term: { state: filter.slug }}
      end


      @results = Wip.search(search)
      @total ||= @results.response['hits']['total']
      state_facets = @results.response['facets']['state']
      @facets = state_facets['terms'].map do |term|
        FacetFilter.new(StateFilter.find(term['term']), term['count'])
      end
    end
  end
end