class TechFilter < Struct.new(:name, :slug, :tags)
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

  def self.find(slug)
    all.find{|t| t.slug == slug }
  end

  def self.find_by_name(name)
    all.find{|t| t.name == name }
  end

  def self.matching(tags)
    all.select{|t| (t.tags & tags).length > 0 }
  end
end