module Search
  class Totals
    attr_writer :all_discussions, :discussions, :products

    def initialize(query)
      @query = query
    end

    def all_discussions
      @all_discussions ||= Search::WipSearch.new(q: @query).total
    end

    def discussions
      @discussions ||= Search::WipSearch.new(q: @query).total
    end

    def products
      @products ||= Search::ProductSearch.new(@query).total
    end
  end
end