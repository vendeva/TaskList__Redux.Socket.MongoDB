import React from "react";
import PropTypes from "prop-types";
import socket from "../socket.js";
import classnames from "classnames";
import { sortableContainer, sortableElement } from "react-sortable-hoc";
import * as actions from "../actions";
import SubTodo from "./SubTodo";

const SortableItem = sortableElement(({ value }) => <>{value}</>);

const SortableContainer = sortableContainer(({ children, openList }) => {
    return (
        <div
            className={classnames({
                "item-task__subtasks": true,
                "item-task__subtasks_open": openList,
            })}
        >
            {children}
        </div>
    );
});

const SubTodoList = ({ subTodos, parent, openList }) => (
    <SortableContainer
        openList={openList}
        pressDelay={300}
        onSortEnd={actions.sortTodosSocket(socket, subTodos, parent.id)}
    >
        {subTodos.map((item, index) => (
            <SortableItem
                key={item.id}
                index={index}
                value={<SubTodo todo={item} parent={parent} {...actions} />}
            />
        ))}
    </SortableContainer>
);

SubTodoList.propTypes = {
    subTodos: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            completed: PropTypes.bool.isRequired,
            text: PropTypes.string.isRequired,
        }).isRequired
    ).isRequired,
    parent: PropTypes.object.isRequired,
    openList: PropTypes.bool.isRequired,
};

export default SubTodoList;
