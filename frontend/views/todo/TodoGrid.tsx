import type Todo from 'Frontend/generated/com/example/application/Todo';
import { TodoItem } from './TodoItem';

type Props = {
  todos: Todo[];
  onChangeStatus: (todo: Todo, value: boolean | undefined) => void;
};

// Display list of todos in CSS Grid
export function TodoGrid({ todos, onChangeStatus }: Props): JSX.Element {
  return (
    <>
      <div className="grid grid-cols-5 gap-s">
        <GridHeader></GridHeader>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onChangeStatus={(todo, value) => onChangeStatus(todo, value)}></TodoItem>
        ))}
      </div>
    </>
  );
}

function GridHeader() {
  return (
    <>
      <span>Done</span>
      <span>Task</span>
      <span>Description</span>
      <span>Assigned</span>
      <span className="text-right">Priority</span>
      <hr className="col-span-5"></hr>
    </>
  );
}
