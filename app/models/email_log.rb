class EmailLog < ActiveRecord::Base
  belongs_to :user

  def self.log_send(user, key, params={})
    EmailLog.create!(user: user, key: key, params: params)
    yield if block_given?
  end

  def self.send_once(user, key, params={}, &blk)
    unless sent_to(user, key, params).any?
      log_send(user, key, params, &blk)
    end
  end

  def self.sent_to(user, key, params={})
    q = where(user_id: user.id, key: key)
    params.each do |k, v|
      q.merge!(where("params -> ? = ?", k, v))
    end
    q
  end
end
