module Metrics
  class NewUsers < KPI
    def between(start_at, end_at)
      RawNumber.new User.where('created_at >= ? and created_at < ?', start_at, end_at).count
    end
  end
end
