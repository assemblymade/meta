class AsmMetricsWorker < ActiveJob::Base
  queue_as :default

  def perform(name, value, at=Time.current)
    return unless ENV['ASM_METRICS_ENDPOINT']
    queue = Librato::Metrics::Queue.new(client: client)
    queue.add "#{name}" => { type: :counter, value: value, measure_time: at }
    queue.submit
  end

  def client
    @client ||= begin
      client = Librato::Metrics::Client.new
      client.authenticate 'asm', Product.find_by!(slug: 'asm').authentication_token
      client.api_endpoint = ENV['ASM_METRICS_ENDPOINT']
      client
    end
  end
end
