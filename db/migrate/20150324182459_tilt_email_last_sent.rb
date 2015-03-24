class TiltEmailLastSent < ActiveRecord::Migration
  def change
    add_column :ideas, :last_tilt_email_sent, :datetime
  end
end
