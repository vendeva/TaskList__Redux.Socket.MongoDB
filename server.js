const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

//logging
const httpInfo = require("debug")("connect:http"),
    name = "TaskList";
const socketInfo = require("debug")("connect:socket");
const mongoInfo = require("debug")("connect:mongoInfo");
const mongoError = require("debug")("connect:mongoError");

const todoModel = require("./models/todoModel"); //todo model

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => httpInfo(`Server is listening on port ${PORT}`));

httpInfo("booting %o", name);

app.get("/", (req, res) => {
    httpInfo(req.method + " " + req.url);
    res.send("I'm server");
});

app.use((req, res) => {
    httpInfo(req.method + " 404");
    res.status(404).send("404 The page does not exist!");
});

mongoose.connect("mongodb://localhost/local", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

var db = mongoose.connection;
db.on("error", () => {
    mongoError("Failed to connect to mongoose");
});
db.once("open", () => {
    mongoInfo("Connected to mongoose");
});

io.on("connection", function (socket) {
    socketInfo("Connected to Socket" + socket.id);
    socket.on("disconnect", function () {
        socketInfo("Disconnected - " + socket.id);
    });

    todoModel.find({}, "-_id parentId id text completed", { lean: true }, (err, result) => {
        if (err) {
            mongoError("GET TODOS failed! " + err);
        } else {
            let todos = result.filter((todo) => !todo.parentId);
            if (todos) {
                todos = todos.map((todo) => ({
                    id: todo.id,
                    text: todo.text,
                    completed: todo.completed,
                    subTodos: result.reduce((acc, subtodo) => {
                        if (subtodo.parentId === todo.id) {
                            const { id, text, completed } = subtodo;
                            acc.push({ id, text, completed });
                        }
                        return acc;
                    }, []),
                }));
            }
            socket.emit("initialList", todos);
            mongoInfo("GET TODOS worked!");
        }
    });

    socket.on("addTodo", (text, parentId) => {
        const todo = new todoModel({
            text,
            completed: false,
            parentId,
        });

        todo.save((err, result) => {
            if (err) {
                mongoError("ADD NEW Todo failed! " + err);
            } else {
                const { parentId, id, text } = result;
                io.emit("todoAdded", parentId, id, text);
                mongoInfo("ADD NEW Todo worked!");
            }
        });
    });

    socket.on("editTodo", (id, text, parentId) => {
        const query = { id };
        const update = { text };

        todoModel.updateOne(query, update, (err) => {
            if (err) {
                mongoError("EDIT Todo failed! " + err);
            } else {
                io.emit("todoEdited", id, text, parentId);
                mongoInfo("EDIT Todo worked!");
            }
        });
    });

    socket.on("completeTodo", (id, completed, parentId) => {
        const query = { id };
        const update = { completed };

        todoModel.updateOne(query, update, (err, result) => {
            if (err) {
                mongoError("COMPLETE Todo failed!" + err);
            } else {
                io.emit("todoCompleted", id, parentId);
                mongoInfo("COMPLETE Todo worked!");

                todoModel.find({ parentId }, "-_id parentId completed", (err, result) => {
                    if (err) {
                        mongoError("FIND Todo failed!" + err);
                    } else {
                        const allSubTodosCompleted = result.some(
                            (item) => item.completed === false
                        );
                        if (!allSubTodosCompleted) {
                            todoModel.updateOne(
                                { id: parentId },
                                { completed: true },
                                (err, resultParent) => {
                                    if (err) {
                                        mongoError("COMPLETE Todo failed!" + err);
                                    } else {
                                        io.emit("todoCompleted", parentId, 0);
                                        mongoInfo("COMPLETE Todo worked!");
                                    }
                                }
                            );
                        }
                    }
                });
            }
        });
    });

    socket.on("deleteTodo", (id, parentId) => {
        const query = { id };

        todoModel.deleteOne(query, (err) => {
            if (err) {
                mongoError("DELETE Todo failed! " + err);
            } else {
                io.emit("todoDeleted", id, parentId);
                mongoInfo("DELETE Todo worked!");
                if (!parentId) {
                    const query = { parentId: id };
                    todoModel.deleteMany(query, (err) => {
                        if (err) {
                            mongoError("DELETE SubTodos failed! " + err);
                        } else {
                            mongoInfo("DELETE SubTodos worked!");
                        }
                    });
                }
            }
        });
    });

    socket.on("sortTodos", (todos, parentId) => {
        const todosForDb = todos.map((todo) => ({
            text: todo.text,
            completed: todo.completed,
            id: todo.id,
            parentId,
        }));
        const query = { parentId };

        todoModel.deleteMany(query, (err) => {
            if (err) {
                mongoError("DELETE Todos failed! " + err);
            } else {
                mongoInfo("DELETE Todos worked!");
            }
        });

        todoModel.insertMany(todosForDb, (err) => {
            if (err) {
                mongoError("INSERT Todos failed! " + err);
            } else {
                io.emit("todoSorted", todos, parentId);
                mongoInfo("INSERT Todos worked!");
            }
        });
    });

    socket.on("completeAllTodos", (todos) => {
        let areAllMarked = todos.every((todo) => todo.completed);
        const update = { completed: !areAllMarked };

        todoModel.updateMany({}, update, (err) => {
            if (err) {
                mongoError("COMPLETE All Todos failed! " + err);
            } else {
                io.emit("completeAllTodos");
                mongoInfo("COMPLETE All Todos worked!");
            }
        });
    });

    socket.on("clearCompleted", () => {
        todoModel.deleteMany({ completed: true }, (err) => {
            if (err) {
                mongoError("CLEAR COMPLETED Todos failed! " + err);
            } else {
                io.emit("clearCompleted");
                mongoInfo("CLEAR COMPLETED worked!");
            }
        });
    });
});
