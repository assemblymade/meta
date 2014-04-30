module ASM
  module Console
    def u(username)
      User.find_by(username: username)
    end

    %w(whatupdave chrislloyd jessedodds mdeiters vanstee).each do |username|
      define_method(username) do
        u(username)
      end
    end

    def prod(slug)
      Product.find_by(slug: slug)
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


    # utc('2013-11-01')
    def utc(s)
      s += ' 00:00:00' unless s =~ /\d\d:\d\d:\d\d/

      s + ' UTC'
      DateTime.strptime(s + ' UTC', "%Y-%m-%d %H:%M:%S %Z")
    end
  end
end
