1. Use class based approach
2. Divide things in multiple parts
3. Describe payload : in a object or some formatt way
4. Game flow :
   a. first game start : JOIN GAME
   b. we want to create a GAME class which calls when new Game is created by Game Handler
   c. in GAME CLASS keep record of : GameId , players , board , moves , startTime
   d. for make move : we have to do few things
   a.1 : Validation -- Is user move valid
   a.2 : update the board
   a.3 : push the move
   a.4 : check is the game is over or not
   a.5 : send the updated board to the players
