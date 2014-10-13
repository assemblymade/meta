module OpenAssets
  class SendBtc

    def send(public_address, destination, private_key, amount)
      private_key = ENV.fetch("CENTRAL_ADDRESS_PRIVATE_KEY")
      public_address= ENV.fetch("CENTRAL_ADDRESS_PUBLIC_ADDRESS")

      params = {"public_address" => public_address}
      params[:destination] =  destination
      params[:private_key] = private_key
      params[:amount] = amount

      Faraday.post 'https://coins.assembly.com/v1/btc', params.to_json

    end


  end
end
