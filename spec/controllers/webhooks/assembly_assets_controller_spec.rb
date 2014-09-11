require 'spec_helper'

describe Webhooks::AssemblyAssetsController do
  let(:transaction) { AssemblyAsset.make! }

  describe '#transaction' do
    it 'updates the asset_id with the transaction_hash' do
      post :transaction, transaction: transaction.id, transaction_hash: '1sodZtGCamdAsRLhPAGsvHENtVdRm77wn'

      expect(response.response_code).to eq(200)
      expect(assigns(:transaction).asset_id).to eq('1sodZtGCamdAsRLhPAGsvHENtVdRm77wn')
    end
  end
end
