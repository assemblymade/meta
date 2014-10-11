namespace :bounties do
  
  task :open => :environment do
    require 'csv'
    include ActionView::Helpers::DateHelper
    puts "Enter output file name:"
    filename = STDIN.gets.chomp || 'open_bounties.csv'
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
end

