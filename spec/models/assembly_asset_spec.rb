require 'spec_helper'

describe AssemblyAsset do
  describe '#grant!' do
    before do
      AssemblyAsset.any_instance.stub(:assets_url).and_return('https://assets-api.assembly.com')
    end

    let(:product) {
      Product.make!(
        wallet_public_address: '148h2pUrQbqsZw9MDUCFGqyz4q8PgRm2Ks',
        wallet_private_key: '5K7iWcvEfPL6XMS3pF5KpSBhttmdciQED1MaqkHg1y5RMaYUGS5'
      )
    }

    let(:user) {
      User.make!(
        wallet_public_address: '1MU2Ctwz2GydBWV9WQcbNqZwbMYBto7MPh'
      )
    }

    let(:no_public_address) {
      User.make!
    }

    it 'transfers coins from the project to the user' do
      VCR.use_cassette('transfer_assembly_asset') do
        asset = AssemblyAsset.new(
          product: product,
          user: user,
          amount: 10
        )

        asset.grant!

        expect(asset.asset_id).to eq('1sodZtGCamdAsRLhPAGsvHENtVdRm77wn')
      end
    end

    it 'assigns the user a key pair if s/he needs one' do
      VCR.use_cassette('transfer_assembly_asset') do
        asset = AssemblyAsset.new(
          product: product,
          user: no_public_address,
          amount: 10
        )

        expect(no_public_address.wallet_public_address).to be_nil
        expect(no_public_address.wallet_private_key).to be_nil

        asset.grant!

        expect(no_public_address.wallet_public_address).to eq('1NSXfw7a6KSETARS8MhPpbSgTDbCSoYmJK')
        expect(no_public_address.wallet_private_key).to eq('5Kb4LzM7QacAhc8Ry6yvDN6GFKLgL9wH4ymbUsnJs3CeQyKyhp7')
        expect(asset.asset_id).to eq('1sodZtGCamdAsRLhPAGsvHENtVdRm77wn')
      end
    end
  end
end
