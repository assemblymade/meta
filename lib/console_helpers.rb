module ASM
  module Console
    def help
      puts "add_monthly_financials product, eom_date, revenue_in_cents, expenses_in_cents"
      puts "  example: add_monthly_financials 'runbook', '30-jun-2015', 2138, 4995"
      puts
      puts "coin_balance wallet"
      puts "  example: balance 'whatupdave'"
      puts "  example: balance 'firesize'"
      puts
      puts "change_slug from, to"
      puts
      puts "mint_new_coins product, coins"
      puts "  creates new coins for a product"
      puts "  example: mint_new_coins 'firesize', 150_000"
      puts
      puts "remove_from_core_team product, user"
      puts
      puts "transactions product"
      puts
      puts "transfer_coins product, from, to, coins"
      puts "  transfer coins from one wallet to another"
      puts "  example: transfer_coins 'firesize', 'firesize', 'whatupdave', 150_000"
      puts
      puts "unlink_twitter user"
      puts

      # github repo commands
    end

    def add_monthly_financials(slug, date, revenue, expenses)
      product = prod!(slug)

      raise "revenue should be in cents" unless revenue.is_a? Fixnum
      raise "expenses should be in cents" unless expenses.is_a? Fixnum

      ProfitReport.create!(
        product: product,
        end_at: Date.parse(date),
        revenue: revenue,
        expenses: expenses,
        annuity: 0
      )

      puts ["revenue:", "$%.02f" % (revenue / 100.0), "  expenses:", "$%.02f" % (expenses / 100.0)].join(' ')
    end

    def change_slug(from, to)
      product = Product.find_by!(slug: from)
      product.update!(slug: to)
      puts "Changed to #{app.url_for(product.url_params)}"
    end

    def coin_balance(wallet_name)
      wallet = (prod(wallet_name) || u!(wallet_name)).id

      balances = TransactionLogEntry.where(wallet_id: wallet).group(:product_id).sum(:cents)
      slugs = Product.find(balances.keys).each_with_object({}){|p, h| h[p.id] = p.slug}
      col = slugs.values.map(&:length).max
      balances.sort_by{|k,v| -v}.each do |product_id, coins|
        puts "#{slugs[product_id].rjust(col)}: #{coins}"
      end; nil
    end

    def mint_new_coins(slug, coins)
      product = prod!(slug)

      TransactionLogEntry.minted!(
        SecureRandom.uuid,
        Time.now,
        product,
        product.id,
        coins,
        comment: 'additional coins'
      )

      unallocated = TransactionLogEntry.where(wallet_id: product.id).sum(:cents)
      puts "minted #{coins} new coins on #{slug}. There are #{unallocated} coins unallocated"
    end

    def remove_from_core_team(slug, username)
      product = prod!(slug)
      user = u!(username)

      membership = product.team_memberships.find_by!(user: user)
      membership.upate!(is_core: false)

      puts "#{username} removed from #{slug} core team"
    end

    def transactions(slug)
      product = prod!(slug)

      pp_log(product, product.transaction_log_entries.order(:created_at))
    end

    def transfer_coins(slug, from_name, to_name, coins)
      product = prod!(slug)
      from = u(from_name) || prod!(from_name)
      to = u!(to_name)

      TransactionLogEntry.transfer!(
        product,
        from.id,
        to.id,
        coins,
        product.id
      ) || raise('Transfer failed')

      from_balance = TransactionLogEntry.where(wallet_id: from.id).sum(:cents)
      to_balance = TransactionLogEntry.where(wallet_id: to.id).sum(:cents)

      puts "transferred #{coins} coins from #{from_name} to #{to}"
      puts "#{from_name}: #{from_balance} coins"
      puts "#{to_name}: #{to_balance} coins"
    end

    def unlink_twitter(username)
      (u(username) || raise("#{username} not found")).update!(twitter_uid: nil, twitter_nickname: nil)

      puts "#{username}: unlinked twitter"
    end


    %w(whatupdave chrislloyd mdeiters vanstee).each do |username|
      define_method(username) do
        u(username)
      end
    end

    def prod(slug)
      Product.find_by(slug: slug)
    end

    def prod!(slug)
      Product.find_by!(slug: slug)
    end

    def u(username)
      User.unscoped.find_by(username: username)
    end

    def u!(username)
      User.unscoped.find_by!(username: username)
    end

    %w(helpful).each do |slug|
      define_method(slug) do
        prod(slug)
      end
    end

    # asm/wips/20
    def wip(path)
      product, _, number = path.split('/')
      prod(product).wips.find_by(number: number)
    end

    def db_mute
      ActiveRecord::Base.logger = nil
    end


    # utc('2013-11-01')
    def utc(s)
      s += ' 00:00:00' unless s =~ /\d\d:\d\d:\d\d/

      s + ' UTC'
      DateTime.strptime(s + ' UTC', "%Y-%m-%d %H:%M:%S %Z")
    end

    def pp_log(product, entries)
      users = Hash[User.where(id: entries.pluck(:wallet_id)).pluck(:id, :username)]
      wips = Hash[Wip.where(id: entries.pluck(:wallet_id)).pluck(:id, :number)]

      total = 0
      entries.each do |e|
        owner = e.wallet_id

        if user = users[e.wallet_id]
          owner += " (@#{user})"
        elsif product.id == e.wallet_id
          owner += " (#{product.slug})"
        elsif wip = wips[e.wallet_id]
          puts "#{wip.inspect}"
          owner += " (##{wip})"
        end

        action = e.action.ljust(10)
        action = case action
        when 'minted'
          action.yellow
        else
          action
        end

        total += (e.cents || 0)

        puts [
          e.id,
          e.created_at.iso8601.ljust(22),
          action,
          owner.ljust(60),
          (e.cents || 0) < 0 ? e.cents.to_s.red : " #{e.cents.to_s.green}",
          e.extra
        ].join(' ')
      end; nil

      puts "#{total.to_s.rjust(139)}"; nil
    end
  end
end
