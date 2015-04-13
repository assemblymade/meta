module OpenAssets
  class Util
    def initialize
      @remote = OpenAssets::Remote.new(ENV.fetch("ASSEMBLY_COINS_URL"))
    end

    def retrieve_key_pair
      @remote.get "/addresses"
    end
  end
end
