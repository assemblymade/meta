namespace :bounties do

  task :product_analysis => :environment do
    require 'csv'
    puts "Enter output file name (or press [enter] for default):"
    input = STDIN.gets.chomp
    filename = input.empty? ? "#{Time.now.strftime("%m%d%y")}_product_response.csv" : input
    CSV.open(filename, 'w') do |row|
      row << ["Product", "time to first award", "comment responsiveness"]

      Product.all.each do |p|
        # average time to first award
        avg_time_to_award = -1
        tasks_with_awards = p.tasks.where(state: [:awarded, :resolved])

        unless tasks_with_awards.blank?
          avg_time_to_award = 0
          tasks_with_awards.each do |t|
            next if t.awards.blank?
            avg_time_to_award += (t.awards.minimum(:created_at).to_i - t.created_at.to_i).abs
          end
          avg_time_to_award = avg_time_to_award.to_f / p.tasks.where(state: [:awarded, :resolved]).count
        end

        # average time for comments to receive responses
        # weighted average of responsiveness across product tasks
        avg_time_to_comment = -1
        tasks_with_comments = p.tasks.where('comments_count > 0')

        unless tasks_with_comments.blank?
          avg_time_to_comment_weighted_numerators = []
          tasks_with_comments.each do |t|
            avg_time_to_comment_weighted_numerators <<
              (t.comments.maximum(:created_at).to_i - t.created_at.to_i) / [t.comments_count - 1, 1].max * t.comments_count
          end
          avg_time_to_comment = avg_time_to_comment_weighted_numerators.sum / tasks_with_comments.sum(:comments_count)
        end

        row << [p.name, avg_time_to_award, avg_time_to_comment]
      end
    end
  end


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
                "https://cove.assembly.com/#{q.slug rescue 'nil'}"]
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
    # remove bounty nfi comments and hearts
    # Heart.joins('inner join news_feed_item_comments nfic on hearts.heartable_id = nfic.id').delete_all
    # NewsFeedItemComment.joins('inner join events on events.id = news_feed_item_comments.target_id').delete_all

    wips = 0
    Wip.includes(:comments).find_each do |wip|
      next if ChatRoom.find_by(wip_id: wip.id)

      wips += 1
      if NewsFeedItem.find_by(product_id: wip.product_id, target_id: wip.id).nil?
        puts "#{wip.id} #{wips} - adding"
        item = NewsFeedItem.create(
          created_at: wip.created_at,
          updated_at: wip.updated_at,
          product: wip.product,
          source_id: wip.user.id,
          target: wip
        )
        item.update_columns updated_at: wip.updated_at
      else
        puts "#{wip.id} #{wips} - skipping"
      end

      comments = 0
      wip.comments.each do |comment|
        comments += 1
        if NewsFeedItemComment.find_by(target_id: comment.id).nil?
          puts "#{wip.id} #{wips} - adding #{comment.id} #{comments}"
          nfi = NewsFeedItem.find_by!(target_id: comment.wip_id)
          item = nfi.comments.create!(
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            body: comment.body,
            target_id: comment.id,
            user: comment.user
          )
          item.update_columns updated_at: comment.updated_at
        else
          puts "#{wip.id} #{wips} - skipping #{comment.id} #{comments}"
        end
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
    Task.where.not(locked_at: nil).each do |task|
      now = Time.now
      task_expiration = task.locked_at + 59.hours

      if now > task_expiration
        begin
          task.stop_work!(User.find(task.locked_by))
        rescue => e
          puts "#stop_work! failed!\n #{e}"
        end
      elsif task_expiration - now < 12.hours
        unless task.state == 'reviewing'
          EmailLog.send_once task.locked_by, "#{task.id}-#{task.locked_at}" do
            # UserMailer.delay(queue: 'mailer').twelve_hour_reminder(task.locked_by, task.id)
          end
        end
      end
    end
  end
end
