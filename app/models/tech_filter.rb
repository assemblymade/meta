class TechFilter < Struct.new(:name, :slug, :tags)
  def self.all
    [
      ['Ruby', 'ruby', %w(ruby rails Ruby Rails)],
      ['Go', 'go', %w(Go go golang)],
      ['Node.js', 'nodejs', %w(javascript node nodejs)],
      ['PHP', 'php', %w(php)],
      ['iOS', 'ios', %w(ios iphone)],
      ['Android', 'android', %w(android)],
    ].map do |args|
      new(*args)
    end
  end

  def self.find(slug)
    all.find{|t| t.slug == slug }
  end
end