FEATURES = {
  discover_bounties: -> { false }
}.freeze

def feature?(name, *args)
  FEATURES[name].call(*args)
end
