class AddEvaluatedByToIdeas < ActiveRecord::Migration
  def up
    add_column :ideas, :evaluator_id, :uuid

    staff = User.find_by(is_staff: true)
    if staff
      Idea.where('evaluated_at is not null').update_all(evaluator_id: staff.id)
    end
  end

  def down
    remove_column :ideas, :evaluator_id
  end
end
