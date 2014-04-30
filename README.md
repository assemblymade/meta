# Assembly

## Dependencies

* [foreman](https://toolbelt.heroku.com)
* [ruby](http://www.ruby-lang.org)
* [PostgreSQL](http://www.postgresql.org)
* [bundler](http://gembundler.com)

## Setup

    # Fetch external dependencies
    $ git submodule init && git submodule update
    $ bundle install

    # Edit your local configuration
    $ cp .env.sample .env && $EDITOR .env

    # Setup the database
    $ rake db:setup

    $ foreman start

