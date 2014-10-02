FEATURES = {
  discover_bounties: -> { true }
}.freeze

def feature?(name, *args)
  FEATURES[name].call(*args)
end
