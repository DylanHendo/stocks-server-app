* Todo list:

[X] generate GET routes
    [X] /stocks/smbols
    [X] /stocks/{symbol}
        [X] currently return 400 if any query supplied
        [X] only return 400 if 'from' or 'to' query
    [X] /stocks/authed/{symbol}
        [X] date is currently one day off
        [X] if user only enters 'from', show all data from and onwards
        [X] if user adds time, from date becomes exclusive
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
[X] swap to linux
    [X] make sure DB only has 1 default user
    [X] change password in db.js and knexfile.js to be "Cab230!"
[X] upgrade to HTTPS
    [X] generate cert
    [X] run tests again (will be https)
[X] deploy
    [X] change URL to be the VM's IP
        [X] in swagger docs
    [X] install pm2
    [X] test again with the VM's IP
[X] finish report
