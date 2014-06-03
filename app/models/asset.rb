class Asset < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :product
  belongs_to :user
  belongs_to :attachment

  delegate :url, to: :attachment
end
