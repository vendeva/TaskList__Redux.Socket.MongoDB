import { createSelector } from "reselect";
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from "../constants/TodoFilters";

const getVisibilityFilter = (state) => state.visibilityFilter;
const getTodos = (state) => state.todos;

//prettier-ignore
export const getVisibleTodos = createSelector(
    [getVisibilityFilter, getTodos], 
    (visibilityFilter, todos) => {
        switch (visibilityFilter) {
            case SHOW_ALL:
                return todos;
            case SHOW_COMPLETED:
                return todos.filter((item) => item.completed);
            case SHOW_ACTIVE:
                return todos.filter((item) => !item.completed);
            default:
                throw new Error("Unknown filter: " + visibilityFilter);
        }
    }
);
//prettier-ignore
export const getCompletedTodoCount = createSelector(
    [getTodos], 
    (todos) =>
    todos.reduce((count, todo) => (todo.completed ? count + 1 : count), 0)
);
