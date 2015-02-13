# How Work Happens

Each product on Assembly has a <a href="#core-team">Core Team</a>. These people are the leaders of the product, handling things like vision, strategy, and execution.
Any work that needs to happen on a product is assigned a <a href="#bounties">bounty</a>. This could be a  one-off development task, it could be a recurring support task, or it could be anything else a product needs.
Anyone in the community can jump in and work on bounties, and if their work is up to the quality of the product the Core Team will award it, thus giving some number of App Coins to that user.

# Core Team

The Core Team consists of a product's leaders.  They have certain responsibilities, like guiding a product’s vision, managing quality control, keeping the momentum up, and crafting the roadmap.
The Core Team also has certain privileges, like the ability to award bounties, collaborator privileges on GitHub, and the ability to create tip contracts.  

Originally, each Core Team starts out as just the person who initially created the idea. That person can add anyone to the Core Team at any time.  
To remove someone from the Core Team, there must be a vote.

# Ownership

Products are owned by the community.  Individual users earn ownership of products they work on through <a href="#bounties">bounties</a> and <a href="#other-forms-of-compensation">other mechanisms</a>.  Different users will have different amounts of ownership.  Each product has its own, independent ownership distribution.  

Ownership is denominated in units called <a href="#coins">App Coins</a>.  Each product has its own coin.  So for example, Coderwall has one kind of App Coin and Buckets has another.  Users earn ownership by accumulating coins in different products.  

User's app coins are recorded on the Bitcoin Blockchain as <a href="#">Colored Coins</a>.  This renders them trustless and ineffaceable.

# Coins

Product ownership is represented by App Coins.  Each product has its own coin.  Users
earn ownership by completing tasks such as bounties or receiving tips which award coins.
At any time, you can view the coin distribution for a given product under the '/partners'
ownership page for a product.  Similarly, each user can see his coins among the products has has
contributed to on the profile page.

Coins come in several forms.  Each product has its own coin.  A new product is initialized with 10 million
unvested coins.  An unvested coin is a coin that has been created and is held by the product itself, ie not by a person.  It has not yet been allocated to a user.  Thus it does not play a part in the relative percentage
ownership commanded by users.  

Coins awarded to users immediately become 'vested' coins.  These coins are fully in play and give full ownership
rights.  Unvested coins become vested upon the awarding of a bounty.  Vested coins must come out of the
available pool of unvested coins.

We introduced vested vs unvested coins to introduce predictability in the total supply of coins for a product.
Coins can only be awarded to users if they already existed as unvested coins.  The unvested coin number can be
increased by a majority vote of product owners.  But an increase in the coin supply, aka, a dilution of current owners, should be a major decision made with maximal community input.  

If you are an owner, you can rest assured that your coins can only be diluted in a controlled, predictable process.  Coins cannot be created endlessly through bounties you might not keep track of.  Expansion of the coin supply is a comparatively rare event in which your feedback will be solicited.  This is a measure to protect owners; particularly if a product is exceptionally valuable in financial terms, we want to maximally protect stakeholders from unexpected, unpredictable dilution.

For all practical purposes, such as the allocation of revenue, or exercising product governance rights, a user's ownership is calculated as his percentage of vested coins, not the total number of coins.  So, for example, if a product has 10,000,000 total coins, but only 4,000,000 are vested, a user with 1,000,000 coins effectively owns 25% of the product.  He will receive 25% of profits and have a 25% say in governance-related decisions.  Only vested coins count towards profit disbursements and product management decisions.

# Bounties

Bounties are tasks directly involved with the development of a <a href="#">product</a>.  They are designed by participants to advertise specific product needs.  Anyone may work on a bounty.  Bounties are the primary way for new users, who have no <a href="#">ownership</a> in a product, to earn their first stake in the product.

Bounties are <a href="#">priced in App Coins</a>, which are the units of ownership of a given product.  These coins are awarded to users who have completed the bounty.  Bounties are awarded to users by <a href="#">Core Team</a> members.

Related Topics:

- <a href="#">Writing Bounties Well</a>
- <a href="#">How to price Bounties</a>

# Other Forms of Compensation

<a href="">Bounties</a> aren't the only way to earn <a href="">app coins</a> on Assembly.  There are a few other ways to earn ownership in a product.

- Found a product.  You can <a href="">allocate yourself coins</a> in products you <a href="">create</a> or <a href="">migrate</a> to Assembly.

- Receive a <a href="">tip</a>.  Users can tip each other app coins that they already own.  It's a good way to say "Thanks" or "Nice Job".

- <a href="">Contracts</a> can award coins programmatically.  Users can be paid to do things without creating and completing bounties.  A majority of product owners must agree to a specific payment plan for a specific user.  This is generally used for roles that would be difficult to implement with bounties.

# The Blockchain

Assembly has put its <a href="#coins">App Coins</a> on the Blockchain.  Products that have been greenlit, or are profitable, have their ownership distributions inscribed on the Bitcoin Blockchain.

App Coins on the Blockchain exist as 'Colored Coins'.  This means they are digital assets written in on top of Bitcoin.  There is a protocol, called 'Open Assets', which is a meta-layer on top of Bitcoin, allowing tokens to be abstracted out of trace amounts of Bitcoin.  These colored coins inherit the properties of Bitcoin in that they are cryptographically secure, completely trustless, and easy to transfer.  

App Coins on the Blockchain are written in trace amounts of Bitcoin, but their value does not stem from the bitcoins that compose them.  It's like taking a penny and writing a message on it, "This is one share of Apple."  The penny itself would be meaningless; the ownership it represents is what matters.  In the case of Colored Coins, the entire process of labelling bitcoins is ineffaceable; what has been written cannot be unwritten.  

It is possible to transfer these tokens as well as issue new ones.  Anyone may do so with the API server Assembly has built, called AssemblyCoins.  Tokens can be created to represent anything one wishes; the original issuer alone controls the total supply.  

However the colored coins created to represent Assembly App Coins are subject to certain restrictions, outside of the underlying protocol.  Because App Coins confer ownership rights on real world property and revenue streams, they are subject to certain legal restrictions.  In order to comply with SEC regulations, among others, we currently do not allow users to transfer or sell their app coins.  Hopefully, if the laws change, this will become possible.  We would like nothing more than for an open market to exist for Assembly App Coins.  However the law must catch up first.
