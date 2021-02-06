import { connect } from "react-redux";
import TodoList from "../components/TodoList";
import { getVisibleTodos } from "../selectors";

const mapStateToProps = (state) => ({
    filteredTodos: getVisibleTodos(state),
});

const FilteredTodoList = connect(mapStateToProps)(TodoList);

export default FilteredTodoList;
