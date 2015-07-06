ShowcaseEntry.destroy_all
Showcase.destroy_all
Product.destroy_all
Attachment.destroy_all
Asset.destroy_all
User.destroy_all

# --- users
kernel = User.create!(
  username: "kernel",
  email: "kernel@example.com",
  password: SecureRandom.uuid,
  is_staff: true,
)

# --- products
meta = Product.create!(
  user: kernel,
  slug: 'meta',
  name: 'Assembly Meta',
  pitch: "Meta is where we're building Assembly on Assembly",
  description: "We are committed to building an open, transparent company, and we're using the Assembly platform to do that.",
)
attachment = Attachment.create!(
  user: kernel,
  asset_path: "attachments/5c020618-5bf5-4f5b-83dd-02ab63b5fc12/touch-icon.png",
  name: "logo.png", content_type: "image/png", size: 70200
)
logo = meta.assets.create!(attachment: attachment, user: kernel, name: 'logo.png')
meta.update!(logo_id: logo.id)
ProductTrend.create!(product_id: meta.id)

helpful = Product.create!(
  user: kernel,
  slug: 'helpful',
  name: 'Helpful',
  pitch: "Support comes from people, not software",
  description: "## Helpful's 3 Golden Rules of Good Support\r\n\r\n1. Good support is when it doesn’t happen at all.\r\n2. Good support is personal.\r\n3. Good support is fast.\r\n\r\n## Why is Helpful bodacious?\r\n\r\nWeb-based help desk software has had two primary problems:\r\n\r\n1. They all charge by the “operator seat”. That means if Alice wants to send a quick update to Bob, you’re going to have to pay more.\r\n2. They all feel slow, and bloated for what we believe a support tool should be.\r\n\r\n**How we charge**: Helpful innovates on pricing by charging for volume instead of by seat. This makes our service incredibly cheap for early stage startups. It also intrinsically encourage a company to get better at support to take advantage of better pricing. \r\n\r\n**How we Help Supporters**: Helpful is designed to get out of the way and let each supporter be a genuinely helpful person to their customers, answering questions, and getting the support done rapidly and without overload.\r\n\r\n## The Story\r\n\r\nHelpful was conceived of by @rbg who built a custom support tool while working on [Wufoo](https://wufoo.com). He’s also given multiple talks on what she calls [“Support Driven Development”](https://speakerdeck.com/roundedbygravity/support-driven-design).\r\n\r\n## Contributing\r\n\r\nThere’s lots of ways you can get started helping out on Helpful.\r\n\r\n## Contributing Code\r\n\r\n1. [Create a Task](https://assemblymade.com/helpful/wips/new) that describes what you want to do. This gives others the opportunity to help and provide feedback.\r\n2. Fork [the repo](https://github.com/asm-helpful)\r\n3. Create your feature branch (git checkout -b my-new-feature)\r\n4. Commit your changes (`git commit -am 'Add some feature’`)\r\n5. Push to the branch (`git push origin my-new-feature`)\r\n6. Create new Pull Request which references the Task number.\r\n\r\nHelpful follows the [GitHub’s Ruby style](https://github.com/styleguide/ruby).\r\n\r\nWe love patches that:\r\n\r\n* Have tests.\r\n* [Pass CI](https://travis-ci.org/asm-helpful/helpful-web).\r\n* Don’t break existing functionality.\r\n* Are documented.\r\n* Don’t add too many new dependencies.\r\n\r\nWe practice “continuous deployment”, meaning, all commits that pass CI are automatically pushed into production. That means if your patch adds extra debugging information or hides a critical button or whatever, paying customers will see it. Nobody wants that. Keep that in mind when forming pull requests.\r\n\r\n## Contributing Design\r\n\r\nWhile it might be temping to share flat image files like JPGs and PNGs, they’re difficult for other people to use alter. We only accept design work in source formats such as Photoshop, Illustrator or Sketch.\r\n\r\nTake a look at the psd and static assets on [Helpful's asset page](https://cove.assembly.com/helpful/assets).",
  state: 'profitable'
)
attachment = Attachment.create!(
  user: kernel,
  asset_path: "attachments/24f8d182-2441-4d5f-b8fa-ab2303d098d1/helpful.png",
  name: "logo.png", content_type: "image/png", size: 986989
)
logo = helpful.assets.create!(attachment: attachment, user: kernel, name: "logo.png")
helpful.update!(logo_id: logo.id)
ProductTrend.create!(product_id: helpful.id)

# --- showcases
Showcase.create!(slug: 'logos').add!(helpful)
Showcase.create!(slug: 'growth').add!(helpful)
