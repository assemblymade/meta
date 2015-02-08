class Asset < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :product
  belongs_to :user
  belongs_to :attachment

  has_one :room, as: :target
  has_one :screenshot

  delegate :url, to: :attachment

  def delete!
    if screenshot
      Screenshot.delete(screenshot.id)
    end

    Asset.delete(self.id)
  end
end
