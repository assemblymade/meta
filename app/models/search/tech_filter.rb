module Search
  class TechFilter < SearchFilter
    attr_reader :tags
  
    def self.all
      [
        ['Ruby', 'ruby', %w(ruby rails Ruby Rails)],
        ['Go', 'go', %w(Go GO go golang)],
        ['Node.js', 'nodejs', %w(javascript node Node nodejs Node.js)],
        ['PHP', 'php', %w(php PHP)],
        ['Python', 'python', %w(python Python Django django)],
        ['iOS', 'ios', %w(ios iOS iphone iPhone)],
        ['Android', 'android', %w(android Android)],
      ].map do |args|
        new(*args)
      end
    end
  
    def initialize(name, slug, tags)
      super(name, slug)
      @tags = tags
    end

    def self.matching(tags)
      all.select{|t| (t.tags & tags).length > 0 }
    end
  end
end