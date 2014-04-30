class NameGenerator

  ADJECTIVES = [
      "autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark",
      "summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter",
      "patient", "twilight", "dawn", "crimson", "wispy", "weathered", "blue",
      "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
      "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
      "red", "rough", "still", "small", "sparkling", "shy", 'such',
      "wandering", "withered", "wild", "black", "young", "holy", "solitary",
      "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
      "polished", "ancient", "purple", "lively", "nameless"
    ]

  NOUNS = [
      "waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning",
      "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter",
      "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook",
      "butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly",
      "feather", "grass", "haze", "mountain", "night", "pond", "darkness",
      "snowflake", "silence", "sound", "sky", "shape", "surf", "thunder",
      "violet", "water", "wildflower", "wave", "water", "resonance", "sun",
      "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
      "frog", "smoke", "star"
    ]

  def self.generate_unique
    new.generate
  end

  def generate_unique
    loop do
      name = generate
      break name unless product_names.include?(name)
    end
  end

  def generate
    "#{random_adjective} #{random_noun}".titleize
  end

  def random_noun
    NOUNS.sample
  end

  def random_adjective
    ADJECTIVES.sample
  end

  def product_names
    @product_names ||= Product.select(:name).uniq.pluck(:name)
  end

end
