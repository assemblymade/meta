Split.redis           = $redis
Split.redis.namespace = "split:assembly"
Split.configure do |config|
  # config.enabled = !Rails.env.development?

  config.db_failover = true # handle redis errors gracefully
  config.db_failover_on_db_error = proc {|error| Rails.logger.error(error.message) }

  config.on_trial_choose   = :log_trial_choose
  config.on_trial_complete = :log_trial_complete
end

module SplitTests
  HOMEPAGE_VARIATION = "Homepage Variation"

  VOTE_UP = "Vote button text conversion"
  VOTE_UP_OPTIONS = ['Join for free', 'Sign up for launch']
end
