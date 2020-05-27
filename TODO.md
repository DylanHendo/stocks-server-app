* Todo list:

[] generate GET routes
    [X] /stocks/smbols
    [X] /stocks/{symbol}
    [] /stocks/authed/{symbol}
[] create 'users' tables in database
    [] does this have to be created on each startup? 
    [X] DB design
        [X] id (int NOT NULL AUTO_INCRMENT)
        [X] username (varchar(255) NOT NULL UNIQUE)
        [X] password (varcahr(255) NOT NULL)
        [X] PRIMARY KEY (id)
[X] generate POST route
    [X] user/register
    [X] user/login
[] make /stocks/authed/{symbol} authorized
[X] implement security
    [X] knex
    [X] helmet
    [X] morgan
    [X] cors
[] test functionality using supplied tests
[] swagger docs
[] swap to linux
[] change to HTTPS
[] report
[] deploy
