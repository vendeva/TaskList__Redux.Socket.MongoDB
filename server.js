const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const todoModel = require("./models/todoModel"); //todo model

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

app.get("/", (request, response) => {
    response.send("I'm server");
});

app.use((req, res, next) => {
    res.status(404).send("404 The page does not exist!");
});

mongoose.connect("mongodb://localhost/local");

var db = mongoose.connection;
db.on("error", () => {
    console.log("Failed to connect to mongoose");
});
db.once("open", () => {
    console.log("Connected to mongoose");
});

io.on("connection", function (socket) {
    console.log("Connected to Socket" + socket.id);
    socket.on("disconnect", function () {
        console.log("Disconnected - " + socket.id);
    });

    todoModel.find({}, "-_id parentId id text completed", { lean: true }, (err, result) => {
        if (err) {
            console.log("GET TODOS failed!" + err);
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
            console.log({ message: "GET TODOS worked!" });
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
                console.log("ADD NEW Todo failed!" + err);
            } else {
                const { parentId, id, text } = result;
                io.emit("todoAdded", parentId, id, text);
                console.log({ message: "ADD NEW Todo worked!" });
            }
        });
    });

    socket.on("editTodo", (id, text, parentId) => {
        const query = { id };
        const update = { text };

        todoModel.updateOne(query, update, (err) => {
            if (err) {
                console.log("EDIT Todo failed! " + err);
            } else {
                io.emit("todoEdited", id, text, parentId);
                console.log({ message: "EDIT Todo worked!" });
            }
        });
    });

    socket.on("completeTodo", (id, completed, parentId) => {
        const query = { id };
        const update = { completed };

        todoModel.updateOne(query, update, (err, result) => {
            if (err) throw err;
            io.emit("todoCompleted", id, parentId);
            console.log({ message: "COMPLETE Todo worked!" });

            todoModel.find({ parentId }, "-_id parentId completed", (err, result) => {
                if (err) throw err;
                const allSubTodosCompleted = result.some((item) => item.completed === false);
                if (!allSubTodosCompleted) {
                    todoModel.updateOne(
                        { id: parentId },
                        { completed: true },
                        (err, resultParent) => {
                            if (err) throw err;
                            io.emit("todoCompleted", parentId, 0);
                            console.log({ message: "COMPLETE Todo worked!" });
                        }
                    );
                }
            });
        });
    });

    socket.on("deleteTodo", (id, parentId) => {
        const query = { id };

        todoModel.deleteOne(query, (err) => {
            if (err) {
                console.log("DELETE Todo failed! " + err);
            } else {
                io.emit("todoDeleted", id, parentId);
                console.log({ message: "DELETE Todo worked!" });
                if (!parentId) {
                    const query = { parentId: id };
                    todoModel.deleteMany(query, (err) => {
                        if (err) {
                            console.log("DELETE SubTodos failed! " + err);
                        } else {
                            console.log({ message: "DELETE SubTodos worked!" });
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
                console.log("DELETE Todos failed! " + err);
            } else {
                console.log({ message: "DELETE Todos worked!" });
            }
        });

        todoModel.insertMany(todosForDb, (err) => {
            if (err) {
                console.log("INSERT Todos failed! " + err);
            } else {
                io.emit("todoSorted", todos, parentId);
                console.log({ message: "INSERT Todos worked!" });
            }
        });
    });

    socket.on("completeAllTodos", (todos) => {
        let areAllMarked = todos.every((todo) => todo.completed);
        const update = { completed: !areAllMarked };

        todoModel.updateMany({}, update, (err) => {
            if (err) {
                console.log("COMPLETE All Todos failed! " + err);
            } else {
                io.emit("completeAllTodos");
                console.log({ message: "COMPLETE All Todos worked!" });
            }
        });
    });

    socket.on("clearCompleted", () => {
        todoModel.deleteMany({ completed: true }, (err) => {
            if (err) {
                console.log("CLEAR COMPLETED Todos failed!" + err);
            } else {
                io.emit("clearCompleted");
                console.log({ message: "CLEAR COMPLETED worked!" });
            }
        });
    });
});
