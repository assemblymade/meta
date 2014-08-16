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
    logger.info {
      gc_stats = GC.stat.slice(
        :heap_used,
        :heap_length,
        :heap_increment,
        :heap_live_num,
        :heap_free_num,
        :heap_final_num,
        :total_allocated_object,
        :total_freed_object,
        :malloc_increase,
        :malloc_limit,
        :oldmalloc_increase,
        :oldmalloc_limit
      ).map{|k,v| "sample#gc_#{k}=#{v}" }

      (gc_stats + [ "count#sidekiq.success=1",
        "sample#sidekiq.job.time=#{elapsed(start)}ms",
        "sample#sidekiq.enqueued=#{Sidekiq::Stats.new.enqueued}"
      ]).join(' ')
    }

  end

  def logger
    Sidekiq.logger
  end
end
