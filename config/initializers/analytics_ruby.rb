require 'segment/analytics'

if ENV['SEGMENT_API_KEY']
  Analytics = Segment::Analytics.new({
      write_key: ENV['SEGMENT_API_KEY']
  })
else
  class Analytics
    def self.track(options)
      puts "Analytics.track user:#{options[:user_id]} #{options[:event]}  (#{options[:properties].inspect})"
    end
  end
end