class MarkToMark

  def inspect_user_markings(user)
    user_vector = user.user_identity.get_mark_vector.take(10)
    user_vector.each do |u|
      mark = Mark.find_by(id: u[0])
      if mark
        user_vector.each do |m|
          if not m==u
            othermark = Mark.find_by(id: m[0])
            if othermark
              MakeMarks.new.mark_additively(mark, othermark.id, m[1]*u[1])
            end
          end
        end
      end
    end

  end

  def inspect_all_user_markings
    Marking.where(markable_type: "Mark").delete_all
    n=0
    User.all.each do |u|
      puts "#{n} / #{User.count}"
      n=n+1
      inspect_user_markings(u)
    end
  end

end
