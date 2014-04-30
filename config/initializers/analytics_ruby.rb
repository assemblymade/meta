if ENV['SEGMENT_API_KEY']
  Analytics = AnalyticsRuby # Alias for convenience
  Analytics.init({
      secret: ENV['SEGMENT_API_KEY']
  })
else
  class Analytics
    def self.track(options)
      puts "Analytics.track user:#{options[:user_id]} #{options[:event]}  (#{options[:properties].inspect})"
    end
  end
end