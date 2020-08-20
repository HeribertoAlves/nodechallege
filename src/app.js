const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validadeRepositoryId(request, response, next) {
  const { id } = request.params;
  
  if(!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid repository id'});
  }

  return next();
}

app.use('/repositories/:id', validadeRepositoryId);


function validadeRepositoryCreateData(request, response, next) {
  const { title, url, techs } = request.body;

  if(Object.entries(request.body).length === 0) {
    return response.status(400).json({ error: 'Repository cannot be empty'});
  }

  let emptyFields = [];

  emptyFields.push(!title || title.trim() === '' ? 'title' : '');
  emptyFields.push(!url || url.trim() === '' ? 'url' : '');
  emptyFields.push(!techs || techs.length === 0 ? 'techs' : '');

  emptyFields = emptyFields.filter(item => item !== '');
  
  if(emptyFields.length > 0) {
    return response.status(400).json({ error: `Must inform fields ${emptyFields.join(',')} `});
  }

  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", validadeRepositoryCreateData, (request, response) => {
  const { title, url, techs } = request.body;
  const id = uuid();

  const repository = {
    id,
    url,
    title,
    techs,
    likes: 0
  }

  repositories.push(repository);
  return response.json(repository);

});

app.put("/repositories/:id", (request, response) => {
  const { id } =request.params;
  const { title, url, techs } = request.body;

  const respositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (respositoryIndex === -1) {
      return response.status(400).json({ error:  'respository not found'});
  }
  const repository = { ...repositories[respositoryIndex], title, url, techs };

  repositories[respositoryIndex] = repository;

  return response.status(201).json(repository);

});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const respositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (respositoryIndex === -1) {
      return response.status(400).json({ error:  'respository not found'});
  }
    
  repositories.splice(respositoryIndex, 1);
  
  return response.status(204).send();

});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  
  const respositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(respositoryIndex === -1) {
    return response.status(400).json({ error: 'respository not found'});
  }

  const likes = repositories[respositoryIndex].likes + 1;

  const repository = {...repositories[respositoryIndex], likes};

  repositories[respositoryIndex] = repository;

  return response.status(200).json(repository);

});

module.exports = app;