$redis = ConnectionPool::Wrapper.new(size: 16, timeout: 3) { Redis.connect }
