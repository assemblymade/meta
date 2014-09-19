class EmailLog < ActiveRecord::Base
  belongs_to :user

  def self.log_send(user_id, key, params={})
    EmailLog.create!(user_id: user_id, key: key, params: params)
    yield if block_given?
  end

  def self.send_once(user_id, key, params={}, &blk)
    User.find(user_id).with_lock do
      unless sent_to(user_id, key, params).any?
        log_send(user_id, key, params, &blk)
      end
    end
  end

  def self.sent_to(user_id, key, params={})
    q = where(user_id: user_id, key: key)
    params.each do |k, v|
      q.merge!(where("params -> ? = ?", k, v))
    end
    q
  end
end
