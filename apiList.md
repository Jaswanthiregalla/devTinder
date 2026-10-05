# API List 

## authRouter
POST /signup 
POST /login 
POST  /logout 


## profileRouter

GET /profile/view 
PATCH /profile/edit 
PATCH /profile/password

## connectionRequestRouter
POST request/send/:status/:userId 
POST request/review/:status/:requestId 



## userRouter
GET /user/requests/received 
GET /user/connections 
GET /user/feed. - Gets you profile of other users on platform.


Status: ignore, interested, accepted, rejected 