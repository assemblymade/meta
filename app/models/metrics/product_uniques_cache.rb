module Metrics
  class ProductUniquesCache
    attr_reader :uniques
    def initialize(start_at, end_at)
      results = Integration.all.map do |i|
        begin
          client = GAClient.new(i.refresh_token, i.config)
          [i.product, client.weekly('ga:users', start_at - 1.week, end_at)]
        rescue => e
          Rails.logger.info "integration=#{i.id} error=#{e}"
          nil
        end
      end.compact

      @uniques = Hash[results]
    end
  end
end
