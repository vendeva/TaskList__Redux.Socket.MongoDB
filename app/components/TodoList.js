import React from "react";
import PropTypes from "prop-types";
import socket from "../socket.js";
import { sortableContainer, sortableElement } from "react-sortable-hoc";
import * as actions from "../actions";
import Todo from "./Todo";

const SortableItem = sortableElement(({ value }) => <>{value}</>);

const SortableContainer = sortableContainer(({ children }) => {
    return <div className="task__main">{children}</div>;
});

const TodoList = ({ filteredTodos }) => (
    <SortableContainer pressDelay={320} onSortEnd={actions.sortTodosSocket(socket, filteredTodos)}>
        {filteredTodos.map((item, index) => (
            <SortableItem
                key={item.id}
                index={index}
                value={<Todo todo={{ ...item }} {...actions} />}
            />
        ))}
    </SortableContainer>
);

TodoList.propTypes = {
    filteredTodos: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            completed: PropTypes.bool.isRequired,
            text: PropTypes.string.isRequired,
        }).isRequired
    ).isRequired,
};

export default TodoList;
