class Karma

  def self.assemble_karma_pie_chart(karma_product_history)
    pi_chart_data = [["Product", "Karma"]]
    productlist = karma_product_history[1]
    (0..productlist.count-1).each do |i|
      pi_chart_data.append([productlist[i], karma_product_history[0].last[i+1]])
    end
    pi_chart_data
  end

  def self.assemble_karma_product_history(karma_product_history)
    karma_product_data = [["Date"]+karma_product_history[1]]
    karma_product_history[0].each do |k|
      karma_product_data.append(k)
    end
    karma_product_data
  end


end
