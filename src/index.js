const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const account = users.find((user) => user.username === username);
  if (!account)
    return response.status(404).json({ message: "User not found." });
  request.account = account;
  next();
}

app.post("/users", (request, response) => {
  const { username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists)
    return response
      .status(400)
      .send({ error: "Could not create. Resource already exists!" });

  const user = {
    id: uuidv4(),
    ...request.body,
    todos: []
  };

  users.push(user);
  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.account;
  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { account } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    created_at: new Date(),
    deadline: new Date(deadline),
  }

  account.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { account } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = account.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found." });

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { account } = request;
  const { id } = request.params;

  const todo = account.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found."})

  todo.done = true

  return response.status(201).json(todo)
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { account } = request
  const { id } = request.params

  const todoIdx = account.todos.findIndex(todo => todo.id === id)

  if(todoIdx === -1) return response.status(404).send({ error: "Todo not found." })

  account.todos.splice(todoIdx, 1)

  return response.status(204).json()

});

module.exports = app;
