# Assembly
[![Build Status](https://magnum.travis-ci.com/assemblymade/meta.svg?token=yfARxv3oq7ZT3ZbmJWVN&branch=master)](https://magnum.travis-ci.com/assemblymade/meta)
[![Code Climate](https://codeclimate.com/repos/53614e94e30ba048560038af/badges/2bfece8bd323b313770e/gpa.png)](https://codeclimate.com/repos/53614e94e30ba048560038af/feed)
<br />

<a href="https://assembly.com/meta/bounties"><img src="https://asm-badger.herokuapp.com/meta/badges/tasks.svg" height="24px" alt="Open Tasks" /></a>

## Dependencies

* [foreman](https://toolbelt.heroku.com)
* [ruby](http://www.ruby-lang.org)
* [PostgreSQL](http://www.postgresql.org)
* [Redis](http://redis.io/)
* [Elasticsearch](http://www.elasticsearch.org/)
* [ReadRaptor](https://github.com/asm-products/readraptor)
* [Firesize](https://github.com/asm-products/firesize)

## Setup

    $ bundle install
    $ npm install

    # Edit your local configuration
    $ cp .env.sample .env && $EDITOR .env
    $ cp config/database.yml.sample config/database.yml

    # Setup the database
    $ rake db:setup

    $ forego start [-f Procfile.dev] # if you have a Procfile.dev

### Compiling Components.js

    $ npm install
    $ npm run watch

Alternatively, add the following line to a Procfile.dev file:

    node: npm install && npm run watch


### Elasticsearch

If you need to populate the ElasticSearch index (recommended on first run):

    $ rails console
    irb> Wip.__elasticsearch__.client.indices.delete(index: Wip.index_name)
    irb> Wip.__elasticsearch__.create_index!(force: true)
    irb> Wip.import
    irb> Product.__elasticsearch__.client.indices.delete(index: Product.index_name)
    irb> Product.__elasticsearch__.create_index!(force: true)
    irb> Product.import
    irb> User.__elasticsearch__.client.indices.delete(index: User.index_name)
    irb> User.__elasticsearch__.create_index!(force: true)
    irb> User.import
