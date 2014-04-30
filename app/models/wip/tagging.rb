require 'activerecord/uuid'

class Wip::Tagging < ActiveRecord::Base
  include ActiveRecord::UUID

  belongs_to :tag, foreign_key: 'wip_tag_id', class_name: 'Wip::Tag'
  belongs_to :wip, foreign_key: 'wip_id'
end