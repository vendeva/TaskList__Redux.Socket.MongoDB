import React from "react";
import PropTypes from "prop-types";
import socket from "../socket.js";
import Input from "./Input";

export default class SubTodo extends React.Component {
    static propTypes = {
        todo: PropTypes.object.isRequired,
        parent: PropTypes.object.isRequired,
        editTodoSocket: PropTypes.func.isRequired,
        deleteTodoSocket: PropTypes.func.isRequired,
        completeTodoSocket: PropTypes.func.isRequired,
    };

    state = {
        editing: false,
    };

    handleDoubleClick = (e) => {
        e.stopPropagation();
        this.setState({ editing: true });
    };

    handleSave = (id, text, parentId) => {
        if (text.length === 0) {
            this.props.deleteTodoSocket(socket, id, parentId);
        } else {
            this.props.editTodoSocket(socket, id, text, parentId);
        }
        this.setState({ editing: false });
    };

    render() {
        const { todo, parent, completeTodoSocket, deleteTodoSocket } = this.props;

        let elementEdit;
        if (this.state.editing && !todo.completed) {
            elementEdit = (
                <Input
                    text={todo.text}
                    onSaveTodo={(text) => this.handleSave(todo.id, text, parent.id)}
                />
            );
        } else {
            elementEdit = (
                <>
                    {todo.text}
                    <div
                        className="item-task__close"
                        onClick={() => deleteTodoSocket(socket, todo.id, parent.id)}
                    ></div>
                </>
            );
        }

        return (
            <div className="item-task__content" onDoubleClick={this.handleDoubleClick}>
                <input
                    className="input-check"
                    type="checkbox"
                    id={`todo_${todo.id}`}
                    checked={todo.completed || parent.completed}
                    onChange={() => completeTodoSocket(socket, todo.id, !todo.completed, parent.id)}
                    disabled={parent.completed}
                />
                <label htmlFor={`todo_${todo.id}`}></label>
                <svg
                    className="icon-check"
                    xmlns="http://www.w3.org/2000/svg"
                    xlinkHref="http://www.w3.org/1999/xlink"
                    viewBox="0 0 350 25"
                    preserveAspectRatio="xMinYMin slice"
                >
                    <use href="#check__line" className="icon-check__line"></use>
                    <use href="#check__box" className="icon-check__box"></use>
                    <use href="#check__yes" className="icon-check__yes"></use>
                    <use href="#check__circle" className="icon-check__circle"></use>
                </svg>
                <div className="item-task__text">{elementEdit}</div>
            </div>
        );
    }
}
