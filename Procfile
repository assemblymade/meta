web: bin/bundle exec puma --port $PORT --threads ${PUMA_MIN_THREADS:-0}:${PUMA_MAX_THREADS:-4} --workers ${PUMA_WORKERS:-1} --environment ${RACK_ENV:-development} --quiet
worker:  bin/bundle exec sidekiq --concurrency ${SIDEKIQ_THREADS:-5} --queue critical --queue default --queue elasticsearch --queue mailer
