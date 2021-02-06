import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import socket from "../socket.js";
import classnames from "classnames";
import { subListOpen } from "../actions";
import Input from "./Input";
import SubTodoList from "../components/SubTodoList";

class Todo extends Component {
    static propTypes = {
        todo: PropTypes.object.isRequired,
        editTodoSocket: PropTypes.func.isRequired,
        deleteTodoSocket: PropTypes.func.isRequired,
        completeTodoSocket: PropTypes.func.isRequired,
    };

    state = {
        editing: false,
        subInput: false,
    };

    handleDoubleClick = () => {
        this.setState({ editing: true });
    };

    handleArrowClick = () => {
        this.setState({ subInput: !this.state.subInput });
    };

    handleSave = (id, text) => {
        if (text.length === 0) {
            this.props.deleteTodoSocket(socket, id);
        } else {
            this.props.editTodoSocket(socket, id, text);
        }
        this.setState({ editing: false });
    };

    render() {
        const { todo, completeTodoSocket, deleteTodoSocket, addTodoSocket, dispatch } = this.props;

        let elementEdit;
        if (this.state.editing) {
            elementEdit = (
                <Input text={todo.text} onSaveTodo={(text) => this.handleSave(todo.id, text)} />
            );
        } else {
            elementEdit = (
                <>
                    {todo.text}
                    <div
                        className="item-task__close"
                        onClick={() => deleteTodoSocket(socket, todo.id)}
                    ></div>
                    {!!todo.subTodos.length && (
                        <div
                            className={classnames({
                                "item-task__minus": todo.subListOpen,
                                "item-task__plus": !todo.subListOpen,
                            })}
                            onClick={() => dispatch(subListOpen(todo.id))}
                        ></div>
                    )}
                </>
            );
        }

        return (
            <div className="item-task">
                <div
                    className={classnames({
                        "item-task__input": true,
                        "item-task__input_open": this.state.subInput,
                    })}
                >
                    {this.state.subInput && (
                        <Input
                            newTodo
                            onSaveTodo={(text) => {
                                if (text.length !== 0) {
                                    addTodoSocket(socket, text, todo.id);
                                    dispatch(subListOpen(todo.id, true));
                                }
                            }}
                            placeholder="SubTask Enter"
                        />
                    )}
                    <div
                        className={classnames({
                            "item-task__up": this.state.subInput,
                            "item-task__down": !this.state.subInput,
                        })}
                        onClick={this.handleArrowClick}
                    ></div>
                </div>
                <div className="item-task__content" onDoubleClick={this.handleDoubleClick}>
                    <input
                        className="input-check"
                        type="checkbox"
                        id={`todo_${todo.id}`}
                        checked={todo.completed}
                        onChange={() => completeTodoSocket(socket, todo.id, !todo.completed)}
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
                {!!todo.subTodos.length && (
                    <SubTodoList
                        subTodos={todo.subTodos}
                        parent={todo}
                        openList={todo.subListOpen}
                    />
                )}
            </div>
        );
    }
}
export default connect()(Todo);
