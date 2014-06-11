class CreateTeamMembershipInterests < ActiveRecord::Migration
  def change
    create_table :team_membership_interests, id: :uuid do |t|
      t.uuid :team_membership_id,   null: false
      t.uuid :interest_id,          null: false
      t.datetime :created_at,       null: false
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

    CoreTeamMembership.find_each do |ctm|
      if product = ctm.product
        if membership = product.team_memberships.find_by(user: ctm.user)
          membership.update_attributes is_core: true
        else
          product.team_memberships.create!(user: ctm.user, is_core: true)
        end
      end
    end

    ProductJob.all.each do |job|
      if product = job.product
        slug = names[job.category]
        interest = Interest.find_or_create_by!(slug: slug)

        job.product_roles.each do |role|
          membership = product.team_memberships.find_by(user: role.user)
          if membership.nil?
            membership = product.team_memberships.create!(user: role.user, is_core: false)
          end

          membership.team_membership_interests.find_or_create_by!(interest: interest)
        end
      end
    end

  end
end
