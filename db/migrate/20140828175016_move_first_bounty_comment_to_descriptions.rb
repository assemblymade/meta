class MoveFirstBountyCommentToDescriptions < ActiveRecord::Migration
  def change
    Task.includes(:events).where('description is null').find_each do |t|
      if comment = t.comments.first
        t.update! description: comment.body
        comment.destroy
      end
    end
  end
end
