module Metrics
  class ProductUniques < KPI
    def initialize(cache, filter=nil)
      @cache = cache
      @filter = filter
    end

    def name
      filter_description = @filter.nil? ? "Total" : "(#{@filter})"
      [super, filter_description].join(' ')
    end

    def between(start_at, end_at)
      vals = filtered.map do |product, vals|
        vals.find {|year, week, _| year == start_at.year.to_s && week == start_at.strftime('%U') }
      end

      RawNumber.new vals.map{|_, _, count| count.to_i }.reduce(0, :+)
    end

    def filtered
      if @filter.nil?
        @cache.uniques
      else
        @cache.uniques.select{|product, _| product.analytics_category == @filter }
      end
    end
  end
end
