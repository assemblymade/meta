class Sidekiq::Middleware::LogStats
  def call(worker, msg, queue)
    yield

    $stdout.puts("sample#sidekiq.enqueued=#{Sidekiq::Stats.new.enqueued}")
  end
end