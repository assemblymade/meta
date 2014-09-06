class AssemblyAsset < ActiveRecord::Base
  belongs_to :product
  belongs_to :user

  def self.grant!(product, user, amount, promo=false)
    AssemblyAsset.transaction do
      if user.public_address.nil?
        # create public address
      end

      asset = { id: 123 } # create asset

      AssemblyAsset.create!(product: product, user: user, asset_id: asset.id) #? asset.transaction_hash
    end
  end

  private

  def get
  end

  def post
  end

  def request
  end

  def connection
  end
end
