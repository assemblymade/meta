class Sidekiq::Middleware::LogStats
  def call(worker, item, queue)
    Sidekiq::Logging.with_context("#{worker.class.to_s} JID-#{item['jid']}") do
      begin
        start = Time.now
        yield
        log_result(start, 'success')
      rescue Exception
        log_result(start, 'fail')
        raise
      end
    end
  end

  def elapsed(start)
    ((Time.now - start) * 1000).round
  end

  def log_result(start, result)
    logger.info { "count#sidekiq.success=1 sample#sidekiq.job.time=#{elapsed(start)}ms sample#sidekiq.enqueued=#{Sidekiq::Stats.new.enqueued}" }

  end

  def logger
    Sidekiq.logger
  end
end