* Todo list:

[] generate GET routes
    [] /stocks/smbols
    [X] /stocks/{symbol}
    [] /stocks/authed/{symbol}
[] create 'users' tables in database
    [] does this have to be created on each startup? 
    [] DB design
        [] id
        [] username
        [] password
[] generate POST route
    [] user/register
    [] user/login
[] make /stocks/authed/{symbol} authorized
[] implement security
    [] knex
    [] helmet
    [] morgan
[] test functionality using supplied tests
[] swagger docs
[] swap to linux
[] change to HTTPS
[] report
[] deploy
