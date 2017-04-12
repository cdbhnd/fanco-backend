# pbox-backend

## Install typescript and typings globally  
`npm install typescript -g`  

`npm install typings -g` 

## Clone the repo
Navigate to your preferred projects folder  
`cd my_projects_folder`  

Clone the repo  
`link to repo`  
  
## Install dependencies  

Navigate to the project folder and run npm install  
`navigate to project folder`  

`npm install`  

Run typings  
`typings install`

Install Visual Studio Code
`https://code.visualstudio.com/download`

Tslint extenstion for MicrosoftVSC
`https://marketplace.visualstudio.com/items?itemName=eg2.tslint`

Install tslint
`npm install -g tslint typescript`

Tslint docs
`https://palantir.github.io/tslint/usage/cli/`


## Run gulp  
`gulp`  

## Install nodemon

Nodemon will restart app when dist/ files are changed, super handy for development

`npm install -g nodemon`

then run (from project root):
`nodemon dist/index.js`

Since nodemon will restart on every file changed in dist folder, number of restarts can get big. To solve the issue, e.g. to delay the restart from the moment that first file change is detected, start the nodemon like so:

`nodemon --delay 1000ms dist/index.js`

Number of miliseconds should be fine-tuned to the speed of gulp build on your system. Maybe somewhere down the road we can automate this restart with gulp?.