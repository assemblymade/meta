require 'activerecord/uuid'

class ProductRole < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :user
  belongs_to :product_job
  belongs_to :product

  has_many :stream_events, as: :subject, dependent: :destroy

  after_commit -> { add_to_event_stream }, on: :create

  protected
  def add_to_event_stream
    StreamEvent.add_job_event!(actor: user, subject: self, target: product)
  end

end