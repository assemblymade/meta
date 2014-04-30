require 'activerecord/uuid'
require 'open-uri'
require 'RMagick'

class WhiteboardAsset < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :comment, foreign_key: 'event_id', class_name: 'Event::Comment'

  delegate :product, :to => :comment

  default_scope -> { where(:deleted_at => nil) }

  def image_url=(url)
    super url

    img = Magick::ImageList.new
    file = open(url)
    img.from_blob(file.read)
    self.format = img.format
    self.height = img.rows
    self.width = img.columns

    s3 = AWS::S3.new
    obj = s3.buckets['asm-assets'].objects[s3_key]
    obj.write file, :acl => :public_read
  end

  def s3_key
    digest = Digest::HMAC.hexdigest image_url, 'fishgoglub', Digest::SHA1
    "whiteboard/#{digest}.#{format.downcase}"
  end

  def delete!
    update_attribute :deleted_at, Time.now
  end

end
