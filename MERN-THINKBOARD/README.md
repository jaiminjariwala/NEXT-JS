## Interactive fun notes app where you can ofcoure perform CRUD operations but to make it standout from the crowd, I've added Figma style dotted Canvas where you can drag and move your notes and can stick wherever you want!

## Once the project is built, I have create a package.json file in MERN-THINKBOARD project folder using the command `npm init -y`. A `package.json` file will be created, inside which I have edited `scripts: {}` by adding `"build": "npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend"` command to it, saying: "build node modules in backend and frontend folders and then once all the dependencies are installed, once that is done, do `npm run build` under the frontend folder". Run `npm run build` after that and you'll see "dist" folder inside frontend.

## Then I have also added `start: "npm run start --prefix backend"` which will go under the backend folder and run server.js

## Later in .env file, add `NODE_ENV=production`