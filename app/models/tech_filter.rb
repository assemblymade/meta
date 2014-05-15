class TechFilter < Struct.new(:name, :slug, :tags)
  def self.all
    [
      ['Ruby', 'ruby', %w(ruby rails Ruby Rails)],
      ['Go', 'go', %w(Go GO go golang)],
      ['Node.js', 'nodejs', %w(javascript node Node nodejs Node.js)],
      ['PHP', 'php', %w(php PHP)],
      ['Python', 'python', %w(python Python Django)],
      ['iOS', 'ios', %w(ios iOS iphone iPhone)],
      ['Android', 'android', %w(android Android)],
    ].map do |args|
      new(*args)
    end
  end

  def self.find(slug)
    all.find{|t| t.slug == slug }
  end
end