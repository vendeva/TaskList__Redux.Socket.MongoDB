import {
    ADD_TODO,
    DELETE_TODO,
    EDIT_TODO,
    SORT_TODOS,
    COMPLETE_TODO,
    COMPLETE_ALL_TODOS,
    CLEAR_COMPLETED,
    INITIAL_ITEMS,
    OPEN_SUB_TODOLIST,
} from "../constants/ActionTypes";

export default function todos(state = [], action) {
    const { id, text, parentId, todos, addSub } = action;
    switch (action.type) {
        case ADD_TODO:
            if (parentId) {
                return state.map((todo) => {
                    if (todo.id === parentId) {
                        todo.subTodos = [
                            ...todo.subTodos,
                            {
                                id,
                                text,
                                completed: false,
                                parentId,
                            },
                        ];
                    }
                    return todo;
                });
            } else {
                return [
                    ...state,
                    {
                        id,
                        text,
                        completed: false,
                        subListOpen: false,
                        subTodos: [],
                    },
                ];
            }
        case EDIT_TODO:
            if (parentId) {
                return state.map((todo) => {
                    if (todo.id === parentId) {
                        todo.subTodos = todo.subTodos.map((item) =>
                            item.id === id ? { ...item, text } : item
                        );
                    }
                    return todo;
                });
            } else {
                return state.map((todo) => (todo.id === id ? { ...todo, text } : todo));
            }
        case DELETE_TODO:
            if (parentId) {
                return state.map((todo) => {
                    if (todo.id === parentId) {
                        todo.subTodos = todo.subTodos.filter((item) => item.id !== id);
                    }
                    return todo;
                });
            } else {
                return state.filter((todo) => todo.id !== id);
            }

        case COMPLETE_TODO:
            if (parentId) {
                return state.map((todo) => {
                    if (todo.id === parentId) {
                        todo.subTodos = todo.subTodos.map((item) =>
                            item.id === id ? { ...item, completed: !item.completed } : item
                        );
                    }
                    return todo;
                });
            } else {
                return state.map((todo) =>
                    todo.id === id ? { ...todo, completed: !todo.completed } : todo
                );
            }

        case SORT_TODOS:
            if (parentId) {
                return state.map((todo) => {
                    if (todo.id === parentId) {
                        todo.subTodos = todos;
                    }
                    return todo;
                });
            } else {
                return todos;
            }

        case COMPLETE_ALL_TODOS:
            let areAllMarked = state.every((todo) => todo.completed);
            return state.map((todo) => ({
                ...todo,
                completed: !areAllMarked,
            }));
        case CLEAR_COMPLETED:
            return state.filter((todo) => todo.completed === false);
        case INITIAL_ITEMS:
            return todos.map((todo) => ({ ...todo, subListOpen: false }));
        case OPEN_SUB_TODOLIST:
            return state.map((todo) =>
                todo.id === id
                    ? { ...todo, subListOpen: addSub ? addSub : !todo.subListOpen }
                    : todo
            );
        default:
            return state;
    }
}
