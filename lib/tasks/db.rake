namespace :db do

  task :smash => ['redis:flush', 'db:schema:load', 'db:test:prepare', 'db:seed']

  namespace :download do
    desc 'Create a production database backup'
    task :generate do
      Bundler.with_clean_env do
        sh("heroku pgbackups:capture --expire --app asm-production")
      end
    end

    desc 'Download latest database backup'
    task :latest do
      Bundler.with_clean_env do
        sh("curl `heroku pgbackups:url` -o db/latest.dump")
      end
    end

    desc 'Load local database backup into dev'
    task :load => :environment do
      raise 'local dump not found' unless File.exists? 'db/latest.dump'

      puts 'Cleaning out local database tables'
      ActiveRecord::Base.connection.tables.each do |table|
        puts "Dropping #{table}"
        ActiveRecord::Base.connection.execute("DROP TABLE #{table};")
      end

      puts 'Loading Production database locally'
      `pg_restore --verbose --clean --no-acl --no-owner -h localhost -d asm_development db/latest.dump`

      puts '!!!!========= YOU MUST RESTART YOUR SERVER =========!!!!'
    end

    task :clean do
      `rm db/latest.dump`
    end
  end

  task :restore => ['db:download:generate', 'db:download:latest', 'db:download:load', 'db:download:clean', 'db:migrate']

  desc 'ActiveRecord can you shut up for 30 minutes?'
  task :mute => :environment do
    ActiveRecord::Base.logger = nil
  end
end
