# ft_transcendence


### Minimal Requirements

- [ ] Your website must be a single-page application. The user should be able to use the Back and Forward buttons of the browser.
- [ ] Your website must be compatible with the latest stable up-to-date version of Google Chrome .
- [ ] The user should encounter no unhandled errors and no warnings when browsing the website.
- [ ] Everything must be launched with a single command line to run an autonomous container provided by Docker . Example : `docker-compose up --build` 
- [ ] Therefore, users must have the ability to participate in a live Pong game against another player directly on the website. Both players will use the same keyboard. The Remote players module can enhance this functionality with remote players.
- [ ] A player must be able to play against another player, but it should also be possible to propose a tournament. This tournament will consist of multiple players who can take turns playing against each other. You have flexibility in how you implement the tournament, but it must clearly display who is playing against whom and the order of the players.
- [ ] A registration system is required: at the start of a tournament, each player must input their alias name. The aliases will be reset when a new tournament begins. However, this requirement can be modified using the Standard User Management module.
- [ ] There must be a matchmaking system: the tournament system organize the matchmaking of the participants, and announce the next fight.
- [ ] All players must adhere to the same rules, which includes having identical paddle speed. This requirement also applies when using AI; the AI must exhibit the same speed as a regular player.
- [ ] The game itself must be developed in accordance with the default frontend constraints (as outlined above), or you may choose to utilize the FrontEnd module, or you have the option to override it with the Graphics module. While the visual aesthetics can vary, it must still capture the essence of the original Pong (1972).
- [ ] Any password stored in your database, if applicable, must be hashed.
- [ ] Your website must be protected against SQL injections/XSS.
- [ ] If you have a backend or any other features, it is mandatory to enable an HTTPS connection for all aspects (Utilize wss instead of ws...)
- [ ] You must implement some form of validation for forms and any user input, either within the base page if no backend is used or on the server side if a backend is employed.



### Modules

- [ ] Major module: Use a Framework as backend.
- [ ] Major module: Implement Two-Factor Authentication (2FA) and JWT.
- [ ] Major module: Standard user management, authentication, users across tournaments.
- [ ] Major module: Replacing Basic Pong with Server-Side Pong and Implementing an API.
- [ ] Major module: Multiplayers (more than 2 in the same game).
- [ ] Major module: Remote players

- [ ] Minor module: Support on all devices.
- [ ] Minor module: Multiple language supports.
- [ ] Minor module: Expanding Browser Compatibility.
- [ ] Minor module: Use a database for the backend.



Maybe:

~ Major module: Implementing a remote authentication.

~ Major module: Live chat.


