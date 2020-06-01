* Todo list:

[] generate GET routes
    [X] /stocks/smbols
    [] /stocks/{symbol}
        [X] currently return 400 if any query supplied
        [] only return 400 if 'from' or 'to' query
    [] /stocks/authed/{symbol}
        [X] date is currently one day off
        [X] if user only enters 'from', show all data from and onwards
        [] if user adds time, from date becomes exclusive
[X] create 'users' tables in database
    [X] DB design
        [X] id (int NOT NULL AUTO_INCRMENT)
        [X] username (varchar(255) NOT NULL UNIQUE)
        [X] password (varcahr(255) NOT NULL)
        [X] PRIMARY KEY (id)
[X] generate POST route
    [X] user/register
    [X] user/login
[X] make /stocks/authed/{symbol} authorized
[X] implement security
    [X] knex
    [X] helmet
    [X] morgan
    [X] cors
[X] test functionality using supplied tests
[X] swagger docs
[] swap to linux
    [] make sure DB only has 1 default user
    [X] change password in db.js and knexfile.js to be "Cab230!"
[] change to HTTPS
    [] generate cert
    [] run tests again (will be https)
[] deploy
    [] change URL to be the VM's IP
    [X] install pm2
    [] test again with the VM's IP
    [] update swagger link to be VM URL
[] finish report
