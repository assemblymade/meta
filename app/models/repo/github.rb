module Repo
  class Github
    def self.load(urls)
      Array(urls).map{|url| new(url) }
    end

    def self.dump(repos)
      Array(repos).map(&:url)
    end

    attr_reader :url

    def initialize(url)
      @url = url
    end
    
    def username
      @url.split('/')[-2]
    end

    def name
      @url.split('/')[-1]
    end
    
    def full_name
      "#{username}/#{name}"
    end

    def ==(other)
      self.url == other.try(:url)
    end
  end
end
