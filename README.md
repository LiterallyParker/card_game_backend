HELLO!!!! THIS IS MY CARD GAME SITE

PARDON THE CHICKEN SCRATCH NATURE OF THIS FILE I HAVE BEEN WORKING ON THIS FOR A WHILE - WILL PROFESSIONALIZE LATER

API STRUCTURE

ERRORS

  {
    error:true, // BOOLEAN
    name:"NameOfError",
    message:"Read this part in a nice voice, it helps."
  }

ROUTES

  /api/users/register
  /api/users/login
  /api/users/account
  /api/cards
  /api/cards/hand
  /api/hand/:id
  /api/leaderboard

/api
  /users
    /register

      -=POST=-
        TAKES
          {
            firstname:"", // OPTIONAL
            lastname:"",  // if last + first = "", you are dubbed Guest User.
            email:"",
            username:"",
            password:"",
            confirmedPassword:""
          }
        RETURNS
          {
            error: false,
            message: "Registration successful!",
            user: {
                id: INT,
                username: "",
                firstname: "",
                lastname: "",
                email: ""
            },
            token: "JSON web token"
          }

/api
  /users
    /login

      -=POST=-
        TAKES
          {
            "username":"",
            "password":""
          }
        RETURNS
          {
            error:false,
            message:"Logged in."
            user: {
              id:INT,
              username:"",
              firstname:"",
              lastname:"",
              email:"",
              handId:INT
            }
            token:"JSON web token"
          }

/api
  /users
    /account
      -=GET=-
      AUTHORIZED
        RETURNS
          {
            error: false,
            user: {
              id: INT,
              firstname: "",
              lastname: "",
              username: "",
              email: "",
              handId: INT,
              role: ""
            }
          }

/api
  /cards

    -=GET=-
      RETURNS
        {
          error: false,
          cards: [
            {
              id:INT,
              suit:"",
              rank:"",
              value:INT,
              imageUrl:""
            },
            ...x52 // all the cards in order
          ]
        }

/api
  /cards
    /hand  // A NON USER HAND - STRAIGHT FROM THE CARDS TABLE

      -=GET=-
        RETURNS
          {
            cards: [
              {
                id:INT,
                suit:"",
                rank:"",
                value:INT,
                imageUrl:""
              }
              ...x5
            ]
            type:"" // Pair, Two Pair, etc.
          }
/api
  /hand
    /:id
      -=GET=-
      AUTHORIZED // GETS USER SPECIFIC HAND STORED IN HANDS TABLE
        RETURNS
          {
            error: false,
            cards: [
              {
                "suit": "",
                "suitId": INT,
                "rank": "",
                "value": INT,
                "imageUrl": ""
              },
              ...x5
            ]
            type: ""   // Pair, Two Pair, etc.
          }
      -=PUT=-
        AUTHORIZED
          RETURNS
            {
              error: false,
              cards: [
                {
                  "suit": "",
                  "suitId": INT,
                  "rank": "",
                  "value": INT,
                  "imageUrl": ""
                },
                ...x5
              ]
              type: ""   // Pair, Two Pair, etc.
            }
/api
  /leaderboard
    -=GET=-
    PARAMS /:chunk - so you dont get the whole leaderboard, its the index of a chunk of the leaderboard.
     RETURNS 
     {
      error: false,
      leaderboard: [
        {

        }
      ]
     }