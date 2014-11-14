namespace :bounties do
  task :analysis => :environment do

    def seconds_to_days(seconds)
      seconds.to_f / 60 / 60 / 24
    end

    def first_event(instance, event_type)
      instance.events.where(type: event_type).order(:created_at).first
    end

    require 'csv'
    puts "Enter output file name:"
    input = STDIN.gets.chomp
    filename = input.empty? ? 'bounty_analysis.csv' : input
    CSV.open(filename, 'w') do |row|
      row << ["time to award", "time to first comment",
              "comment count", "time to start work",
              "time from start work to first award",
              "time from first comment to first award",
              "closed?", "awarded?"]
      Task.all.each do |t|
        row << [(seconds_to_days(t.awards.first.created_at - t.created_at).abs rescue -1),
                (seconds_to_days(t.comments.first.created_at - t.created_at).abs rescue -1),
                t.comments_count,
                (seconds_to_days(first_event(t, "Event::Allocation").created_at - t.created_at).abs rescue -1),
                (seconds_to_days(t.awards.first.created_at - first_event(t, "Event::Allocation").created_at).abs rescue -1),
                (seconds_to_days(t.comments.first.created_at - t.awards.first.created_at).abs rescue -1),
                t.state == "resolved" ? 1 : 0,
                t.awards.empty? ? 0 : 1]
      end
    end
  end

  task :open => :environment do
    require 'csv'
    include ActionView::Helpers::DateHelper
    puts "Enter output file name:"
    input STDIN.gets.chomp
    filename = input.empty? ? 'open_bounties.csv' : input
    query = Task.open.where('created_at <= :six_months_ago', :six_months_ago => Time.now - 6.months)

    CSV.open(filename, 'w') do |row|
      row << ['Product', 'Bounty', 'Comments', 'created at', 'updated at', 'State', 'Link']
      query.each do |q|
        row << [q.title, (q.product.name rescue 'nil'),
                q.comments_count, time_ago_in_words(q.created_at),
                time_ago_in_words(q.updated_at), q.state,
                "https://assembly.com/#{q.slug rescue 'nil'}"]
      end
    end
  end

  task :staff_activity => :environment do
    def percent_change(a, b)
      "#{(((a-b).to_f / b) * 100).round(1)}%"
    end

    def filtered_query(query)
      query.
      select{|t| t.user.staff? &&
                 t.user.username != "kernel" &&
                 t.product.slug != "meta"}
    end

    require 'date'

    rows = []
    weeks = 4.downto(-1).to_a
    ceiling = weeks.max

    weeks.each do |d|
      silence_stream(STDOUT) do
        if d == -1
          query = Task.where(created_at: Date.today.beginning_of_week..Time.now)
        else
          query = Task.where(created_at: (d+1).week.ago.beginning_of_week..d.week.ago.beginning_of_week)
        end

        prev_row = rows[ceiling-1-d]

        # anything written to STDOUT here will be silenced
        rows << [ "#{(d+1).week.ago.beginning_of_week.strftime('%b %d, %y')}",
                  # created
                  created = filtered_query(query).count.to_f,
                  d == ceiling ? " - " : percent_change(created, prev_row[1]),
                  # award/creation ratio
                  awd_crtd = (filtered_query(query.where(state: :awarded)).count / created),
                  d == ceiling ? " - " : percent_change(awd_crtd, prev_row[3]),
                  # close/creation ratio
                  clsd_crtd = (filtered_query(query.where(state: :resolved)).count / created),
                  d == ceiling ? " - " : percent_change(clsd_crtd, prev_row[5])
                ]
      end
    end
    puts Terminal::Table.new :headings => ['Date', 'Created', '% change', 'Awarded/Created', '% change', 'Closed/Created', '% change'], :rows => rows
  end

  task :historical_ratios => :environment do
    def percent_change(a, b)
      "#{(((a-b).to_f / b) * 100).round(1)}%"
    end

    def filtered_query(query, user_type=nil)
      query = query.
              select{|t| t.user.username != "kernel" &&
                         t.product.slug != "meta" &&
                         t.product.slug != "asm" &&
                         t.product.slug != "asm-ideas" &&
                         t.comments_count > 0}
      if user_type == "core"
        query = query.select{|t| t.product.core_team?(t.user)}
      elsif user_type == "staff"
        query = query.select{|t| t.user.staff?}
      end
      query
    end

    require 'date'

    rows_global, rows_core, rows_staff = [], [], []
    weeks = 4.downto(-1).to_a
    ceiling = weeks.max

    weeks.each do |d|
      puts "getting stats..Week #{d}"
      silence_stream(STDOUT) do
        if d == -1
          query = Task.where(["created_at < ?", Time.now])
        else
          query = Task.where(["created_at < ?", d.week.ago.beginning_of_week])
        end

        prev_row = rows_global[ceiling-1-d]

        # anything written to STDOUT here will be silenced
        rows_global << [ "#{(d+1).week.ago.beginning_of_week.strftime('%b %d, %y')}",
                  # created
                  created = filtered_query(query).count.to_f,
                  d == ceiling ? " - " : percent_change(created, prev_row[1]),
                  # award/creation ratio
                  awd_crtd = (filtered_query(query.where(state: :awarded)).count / created),
                  d == ceiling ? " - " : percent_change(awd_crtd, prev_row[3]),
                  # close/creation ratio
                  clsd_crtd = (filtered_query(query.where(state: :resolved)).count / created),
                  d == ceiling ? " - " : percent_change(clsd_crtd, prev_row[5])
                ]

        prev_row = rows_core[ceiling-1-d]

        # anything written to STDOUT here will be silenced
        rows_core << [ "#{(d+1).week.ago.beginning_of_week.strftime('%b %d, %y')}",
                  # created
                  created = filtered_query(query, "core").count.to_f,
                  d == ceiling ? " - " : percent_change(created, prev_row[1]),
                  # award/creation ratio
                  awd_crtd = (filtered_query(query.where(state: :awarded), "core").count / created),
                  d == ceiling ? " - " : percent_change(awd_crtd, prev_row[3]),
                  # close/creation ratio
                  clsd_crtd = (filtered_query(query.where(state: :resolved), "core").count / created),
                  d == ceiling ? " - " : percent_change(clsd_crtd, prev_row[5])
                ]

        prev_row = rows_staff[ceiling-1-d]

        # anything written to STDOUT here will be silenced
        rows_staff << [ "#{(d+1).week.ago.beginning_of_week.strftime('%b %d, %y')}",
                  # created
                  created = filtered_query(query, "staff").count.to_f,
                  d == ceiling ? " - " : percent_change(created, prev_row[1]),
                  # award/creation ratio
                  awd_crtd = (filtered_query(query.where(state: :awarded), "staff").count / created),
                  d == ceiling ? " - " : percent_change(awd_crtd, prev_row[3]),
                  # close/creation ratio
                  clsd_crtd = (filtered_query(query.where(state: :resolved), "staff").count / created),
                  d == ceiling ? " - " : percent_change(clsd_crtd, prev_row[5])
                ]
      end
    end
    puts "GLOBAL _________________________"
    puts Terminal::Table.new :headings => ['Date', 'Created', '% change', 'Awarded/Created', '% change', 'Closed/Created', '% change'], :rows => rows_global
    puts "CORE ___________________________"
    puts Terminal::Table.new :headings => ['Date', 'Created', '% change', 'Awarded/Created', '% change', 'Closed/Created', '% change'], :rows => rows_core
    puts "STAFF __________________________"
    puts Terminal::Table.new :headings => ['Date', 'Created', '% change', 'Awarded/Created', '% change', 'Closed/Created', '% change'], :rows => rows_staff
  end

  task :push_to_news_feed => :environment do
    Task.where(created_at: 2.months.ago..Time.now).each do |task|
      if NewsFeedItem.find_by(product_id: task.product_id, target_id: task.id).nil?
        puts "adding #{task.id}"
        item = NewsFeedItem.create(
          created_at: task.created_at,
          updated_at: task.updated_at,
          product: task.product,
          source_id: task.user.id,
          target: task
        )
        item.update_columns updated_at: task.updated_at
      else
        puts "skipping #{task.id}"
      end
    end
  end

  task switch_to_bounty_holding: :environment do
    Task.where('closed_at is null').each do |task|
      if worker = task.workers.order(:created_at).first
        task.update(
          locked_at: Time.now,
          locked_by: worker.id
        )
      end
    end
  end

  task check_locked_bounties: :environment do
    Task.where('locked_at is not null').each do |task|
      now = Time.now
      task_expiration = Task.locked_at + 60.hours

      if task_expiration - now < 12.hours
        UserMailer.twelve_hour_reminder(task.locked_by, task.id)
      elsif now > task_expiration
        task.stop_work!(User.find(task.locked_by))
      end
    end
  end
end

