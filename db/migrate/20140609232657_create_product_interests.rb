class CreateProductInterests < ActiveRecord::Migration
  def change
    create_table :product_interests, id: :uuid do |t|
      t.uuid :product_id,   null: false
      t.uuid :user_id,      null: false
      t.uuid :interest_id,  null: false
      t.datetime :created_at, null: false
    end

    names = {
      "Engineering" => 'backend',
      "Design"=>'design',
      "Marketing"=>'marketing',
      "Content"=>'copy',
      "CopyWriters & Content Strategists"=>'copy',
      "Non-Profit Research"=>'research',
      "User Experience"=>'ux',
      "Content Providing"=>'copy',
      "Front-end Development"=>'frontend',
      "Recruiter"=>'recruiting'
    }

    CoreTeamMembership.find_each do |membership|
      if membership.product
        membership.product.team_memberships.find_or_create_by!(user: membership.user, is_core: true)
      end
    end

    ProductJob.all.each do |job|
      if product = job.product
        slug = names[job.category]
        interest = Interest.find_or_create_by!(slug: slug)

        job.product_roles.each do |role|
          product.team_memberships.find_or_create_by!(user: role.user, is_core: false)
          product.product_interests.find_or_create_by!(user: role.user, interest: interest)
        end
      end
    end

  end
end
