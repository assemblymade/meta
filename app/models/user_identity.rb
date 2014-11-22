class UserIdentity < ActiveRecord::Base
  belongs_to :user

  VIEW_WIP_MARKING_WEIGHT = 0.02
  VIEW_PRODUCT_MARKING_WEIGHT = 0.01
  VIEW_USER_MARKING_WEIGHT = 0.005

  has_many :markings, as: :markable  #not working for some reason
  has_many :marks, through: :markings  #not working for some reason

  def composition
    if markings = self.markings
      result = {}
      markings.each do |m|
        if result.has_key?(m.name)
          result[m.name] = result[m.name] + m.weight
        else
          result[m.name] = m.weight
        end
      end
      result
    end
  end

  def assign_marking(mark, added_weight)
    markings = self.markings.where(mark_id: mark.id)
    if markings.count == 0
      MakeMarks.new.mark_with_name(self, mark.name)
    else
      markings.first.weight = markings.first.weight + added_weight.to_f
    end
  end

  def view_wip(wip)
    marks = wip.marks
    marks.each do |m|
      assign_marking(m, VIEW_WIP_MARKING_WEIGHT / marks.count.to_f)
    end
  end

  def view_product(product)

  end

  def view_user(user)
  end


  def compare_mark_vector(other_mark_vector)
    
  end



end
