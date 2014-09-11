class Webhooks::AssemblyAssetsController < WebhookController
  def transaction
    if @transaction = AssemblyAsset.find(params[:transaction])
      @transaction.update(asset_id: params.fetch(:transaction_hash))
    end

    render nothing: true, status: 200
  end
end
