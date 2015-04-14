module Marks
  class VectorMath

    def add_mark_vectors(vector1, vector2)
      #add vectors and save markings accordingly
      mark_types1 = vector1.map{ |a| a[0] }
      mark_values1 = vector1.map{|a| a[1]}
      mark_values2 = vector2.map{|a| a[1]}
      mark_types2 = vector2.map{|a| a[0] }
      overlapped_types = mark_types1 & mark_types2
      nonoverlapped_types1 = (mark_types1 - mark_types2)
      nonoverlapped_types2 = (mark_types2 - mark_types1)
      sum_vector = []
      overlapped_types.each do |a|
        newsum = mark_values1[mark_types1.index(a)] + mark_values2[mark_types2.index(a)]
        sum_vector.append([a, newsum])
      end

      nonoverlapped_types1.each do |a|
        sum_vector.append([ a, mark_values1[mark_types1.index(a)]])
      end

      nonoverlapped_types2.each do |a|
        sum_vector.append([ a, mark_values2[mark_types2.index(a)]])
      end
      sum_vector
    end

    def dot_product_vectors(vector1, vector2)
      if vector1.count == 0 or vector2.count == 0
        dot_product = 0
      else
        dot_product = 0

        mark_types1 = vector1.map{ |a| a[0] }
        mark_values1 = vector1.map{|a| a[1]}
        mark_values2 = vector2.map{|a| a[1]}
        mark_types2 = vector2.map{|a| a[0] }
        overlapped_types = mark_types1 & mark_types2

        overlapped_types.each do |a|
          dot_product = dot_product + mark_values1[mark_types1.index(a)] * mark_values2[mark_types2.index(a)]
        end
      end
      dot_product
    end
  end
end
