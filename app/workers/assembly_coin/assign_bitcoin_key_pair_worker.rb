module AssemblyCoin
  class AssignBitcoinKeyPairWorker < AssemblyCoin::Worker
    def perform(recipient_id, recipient_method)
      recipient = GlobalID::Locator.locate recipient_id

      if recipient
        if key_pair = get_key_pair
          recipient.send(recipient_method.to_sym, key_pair)
        end
      end
    end

    private

    def get_key_pair
      OpenAssets::Util.new.retrieve_key_pair
    end
  end
end
