module AssemblyCoin
  class MoveBtc < AssemblyCoin::Worker

    def perform(public_address, destination, private_key, amount)
      SendBtc.new.send(public_address, destination, private_key, amount)
    end

  end
end
