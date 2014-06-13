class DashboardReporter
  def average(array)
    array.reduce(:+).to_f / array.size
  end

  def sparkline(key, entries)
    number key, entries.map{|date, count| {'timestamp' => date.to_time.to_i, 'number' => count} }
  end

  def number(key, value)
    handle leftronic.number "asm.#{key}", value
  end

  def leaderboard(key, entries)
    handle leftronic.leaderboard "asm.#{key}", entries
  end

  def list(key, entries)
    handle leftronic.list "asm.#{key}", entries
  end

  def handle(result)
    # Great jerb on the api leftronic...
    if result != 'Success!'
      puts "error: #{result}"
    end
  end

  def leftronic
    if ENV['LEFTRONIC_KEY']
      @leftronic ||= Leftronic.new(ENV['LEFTRONIC_KEY'])
    else
      @leftronic = FakeLeftronic.new
    end
  end

  class FakeLeftronic
    def number(key, value)
      puts "DEBUG #{key}=#{value}"
      'Success!'
    end

    def leaderboard(key, entries)
      puts "DEBUG #{key} #{entries.inspect}"
      'Success!'
    end

    def list(key, entries)
      puts "DEBUG #{key} #{entries.inspect}"
      'Success!'
    end
  end

end