# define skeleton categories for jobs engineering/front-end developmet/design
categories = ["Engineering", "Front-end Development", "Design"]
# check to see if project has jobs
products = Product.all
products.each do |product|
  # if not add
  categories.each do |category|
    if product.product_jobs.where(:category => category).blank?
      ProductJob.create(:product_id => product.id, :user_id => 'ae63ff72-a6b5-4057-bb00-56a80c0ed300', :category => category)
    else
      # raise product.product_jobs.where(:category => category).to_yaml
    end
  end
end

products.each do |product|
# grab all wips for a product for each category, distinct users
  wips = Wip.where(:product_id => product.id).where(:deliverable => "code").select('DISTINCT(user_id), deliverable')
  unless wips.blank?
    # grab jobs -> job_id
    job = product.product_jobs.where(:category => "Engineering").first
    # now add each distinct user to engineering
    wips.each do |wip|
      if ProductRole.where(:user_id => wip.user_id, :product_job_id => job.id, :product_id => product.id).blank?
        product_role = ProductRole.create(:product_job_id => job.id, :user_id => wip.user_id, :product_id => product.id)
      end
    end
    # now add each distinct user to front-end development
    job = product.product_jobs.where(:category => "Front-end Development").first
    wips.each do |wip|
      if ProductRole.where(:user_id => wip.user_id, :product_job_id => job.id, :product_id => product.id).blank?
        product_role = ProductRole.create(:product_job_id => job.id, :user_id => wip.user_id, :product_id => product.id)
      end
    end
  end
  
  # get those designers in here
  wips = Wip.where(:product_id => product.id).where(:deliverable => "design")
  # add them to the right category
   unless wips.blank?
    # grab jobs -> job_id
    job = product.product_jobs.where(:category => "Design").first
    # now add each distinct user to engineering
    wips.each do |wip|
      if ProductRole.where(:user_id => wip.user_id, :product_job_id => job.id, :product_id => product.id).blank?
        product_role = ProductRole.create(:product_job_id => job.id, :user_id => wip.user_id, :product_id => product.id)
      end
    end
  end
end

# Update descriptions of all the jobs
categories.each do |category|
  if category == "Engineering"
    description = "Architects, develops, and maintains software systems. Loves text editors, command lines and making products work."
  elsif category == "Front-end Development"
    description = "Represents the intersection of Design and Engineering. Often works in HTML, CSS & Javascript implementing design and makeing it work with the system."
  elsif category == "Design"
    description = "Blends communication, stylizing, and problem-solving through the use of type, space, and image. Loves pushing pixels, creating mockups and sweating the details of user interaction."
  end

  jobs = ProductJob.where(:category => category)
  jobs.each do |job|
    job.description = description
    job.save!
  end
end
