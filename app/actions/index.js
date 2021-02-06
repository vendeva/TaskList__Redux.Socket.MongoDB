import * as types from "../constants/ActionTypes";
import arrayMove from "array-move";

export const addTodo = (parentId, id, text) => ({ type: types.ADD_TODO, parentId, id, text });
export const editTodo = (id, text, parentId) => ({ type: types.EDIT_TODO, id, text, parentId });
export const deleteTodo = (id, parentId) => ({ type: types.DELETE_TODO, id, parentId });
export const completeTodo = (id, parentId) => ({ type: types.COMPLETE_TODO, id, parentId });
export const sortTodos = (todos, parentId) => ({ type: types.SORT_TODOS, todos, parentId });
export const completeAllTodos = () => ({ type: types.COMPLETE_ALL_TODOS });
export const clearCompleted = () => ({ type: types.CLEAR_COMPLETED });
export const setVisibilityFilter = (filter) => ({ type: types.SET_VISIBILITY_FILTER, filter });
export const initialTodos = (todos) => ({ type: types.INITIAL_ITEMS, todos });
export const subListOpen = (id, addSub = false) => ({ type: types.OPEN_SUB_TODOLIST, id, addSub });

export const initialSocketTodos = (socket) => {
    return (dispatch) => {
        socket.on("initialList", (res) => {
            console.dir(res);
            dispatch(initialTodos(res));
        });
    };
};

export const addTodoSocket = (socket, text, parentId = 0) => {
    socket.emit("addTodo", text, parentId);
};

export const editTodoSocket = (socket, id, text, parentId = 0) => {
    socket.emit("editTodo", id, text, parentId);
};

export const deleteTodoSocket = (socket, id, parentId = 0) => {
    socket.emit("deleteTodo", id, parentId);
};

export const completeTodoSocket = (socket, id, completed, parentId = 0) => {
    socket.emit("completeTodo", id, completed, parentId);
};

export const sortTodosSocket = (socket, todos, parentId = 0) => {
    return ({ oldIndex, newIndex }) => {
        const moveTodos = arrayMove(todos, oldIndex, newIndex);
        socket.emit("sortTodos", moveTodos, parentId);
    };
};

export const completeAllTodosSocket = (socket, todos) => {
    socket.emit("completeAllTodos", todos);
};

export const clearCompletedSocket = (socket) => {
    socket.emit("clearCompleted");
};
