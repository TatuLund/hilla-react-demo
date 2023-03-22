import type Todo from 'Frontend/generated/com/example/application/Todo';
import { Checkbox } from '@hilla/react-components/Checkbox.js';
import { Tooltip } from '@hilla/react-components/Tooltip.js';

type Props = {
  todo: Todo;
  onChangeStatus: (todo: Todo, value: boolean | undefined) => void;
};

export function TodoItem({ todo, onChangeStatus }: Props): JSX.Element {
  return (
    <>
      <Checkbox checked={todo.done} onCheckedChanged={({ detail: { value } }) => onChangeStatus(todo, value)}>
        <Tooltip position="end-bottom" slot="tooltip" text="Done"></Tooltip>
      </Checkbox>
      <span className="text-primary text-l font-bold">{todo.task}</span>
      <span>{todo.description}</span>
      <span>{todo.assigned?.firstName + ' ' + todo.assigned?.lastName}</span>
      <Badge id={'badge-' + todo.id} className="text-s ml-auto" text={'' + todo.priority}></Badge>
      <Tooltip position="end-bottom" for={'badge-' + todo.id} text="Priority"></Tooltip>
    </>
  );
}

type BadgeProps = {
  id?: string;
  className?: string;
  text: string | undefined;
};

export function Badge(props: BadgeProps): JSX.Element {
  return (
    <span id={props.id} className={props.className} {...{ theme: 'badge' }}>
      {props.text}
    </span>
  );
}
