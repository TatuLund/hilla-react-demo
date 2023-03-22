import type Todo from 'Frontend/generated/com/example/application/Todo';
import { useEffect, useState } from 'react';
import { FormikErrors, useFormik } from 'formik';
import { ContactEndpoint, TodoEndpoint } from 'Frontend/generated/endpoints';
import { EndpointValidationError } from '@hilla/frontend';
import { Tooltip } from '@hilla/react-components/Tooltip.js';
import { FormLayout } from '@hilla/react-components/FormLayout.js';
import { ComboBox } from '@hilla/react-components/ComboBox.js';
import { TextField } from '@hilla/react-components/TextField.js';
import { IntegerField } from '@hilla/react-components/IntegerField.js';
import { Button } from '@hilla/react-components/Button.js';
import { DatePicker } from '@hilla/react-components/DatePicker.js';
import { Checkbox } from '@hilla/react-components/Checkbox.js';
import { Grid } from '@hilla/react-components/Grid.js';
import { GridDataProviderCallback, GridDataProviderParams } from '@vaadin/grid';
import { GridColumn } from '@hilla/react-components/GridColumn.js';
import Contact from 'Frontend/generated/com/example/application/Contact';
import { Dialog } from '@hilla/react-components/Dialog.js';

export default function TodoView(): JSX.Element {
  const empty: Todo = { task: '', done: false };
  const [dialogOpened, setDialogOpened] = useState(false);
  const [assigned, setAssigned] = useState<Contact[]>([]);
  const [todos, setTodos] = useState(Array<Todo>());
  const [filter, setFilter] = useState('');
  const presets = ['Make food', 'Clean the house', 'Do the groceries', 'Mow the lawn', 'Walk the dog'];

  const formik = useFormik({
    initialValues: empty,
    onSubmit: async (value: Todo, { setSubmitting, setErrors }) => {
      try {
        const saved = (await TodoEndpoint.save(value)) ?? value;
        setTodos([...todos, saved]);
        formik.resetForm();
        setAssigned([]);
      } catch (e: unknown) {
        if (e instanceof EndpointValidationError) {
          const errors: FormikErrors<Todo> = {};
          console.log(e.validationErrorData);
          for (const error of e.validationErrorData) {
            if (typeof error.parameterName === 'string' && error.parameterName) {
              const key = error.parameterName as string & keyof Todo;
              errors[key] = error.message.substring(error.message.indexOf('validation error:'));
            }
          }
          setErrors(errors);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    (async () => {
      setTodos(await TodoEndpoint.findAll());
    })();

    return () => {};
  }, []);

  async function changeStatus(todo: Todo, done: boolean | undefined): Promise<void> {
    const isDone = done ? done : false;
    const newTodo = { ...todo, done: isDone };
    const saved = (await TodoEndpoint.save(newTodo)) ?? newTodo;
    setTodos(todos.map((item) => (item.id === todo.id ? saved : item)));
  }

  function noDone(): boolean {
    return todos.filter((todo) => todo.done).length == 0;
  }

  async function remove(): Promise<void> {
    const dones = todos.filter((todo) => todo.done);
    await TodoEndpoint.remove(dones);
    const notDone = todos.filter((todo) => !todo.done);
    setTodos(notDone);
  }

  async function dataProvider(params: GridDataProviderParams<Contact>, callback: GridDataProviderCallback<Contact>) {
    const page = await ContactEndpoint.getPage(params.page, params.pageSize, filter);
    if (page) {
      callback(page.content, page.size);
    }
  }

  function assignTodo(value: Contact | null | undefined) {
    if (value) {
      formik.values.assigned = value;
      setAssigned(value ? [value] : []);
      setDialogOpened(false);
    }
  }

  return (
    <>
      <div className="grid gap-m shadow-s m-m p-s">
        <FormLayout>
          <ComboBox
            label="Task"
            name="task"
            items={presets}
            value={formik.values.task}
            onChange={formik.handleChange}
            onInput={formik.handleChange}
            errorMessage={formik.errors.task}
            invalid={formik.errors.task ? true : false}
          ></ComboBox>
          <TextField
            name="description"
            label="Description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleChange}
            errorMessage={formik.errors.description}
            invalid={formik.errors.description ? true : false}
          />
          <IntegerField
            name="priority"
            label="Priority"
            stepButtonsVisible
            theme="align-right"
            value={'' + formik.values.priority}
            onChange={formik.handleChange}
            onBlur={formik.handleChange}
            errorMessage={formik.errors.priority}
            invalid={formik.errors.priority ? true : false}
          />
          <DatePicker
            name="deadline"
            label="Deadline"
            value={formik.values.deadline}
            onChange={formik.handleChange}
            errorMessage={formik.errors.deadline}
            invalid={formik.errors.deadline ? true : false}
          />
        </FormLayout>
        <Dialog
          opened={dialogOpened}
          onOpenedChanged={({ detail: { value } }) => setDialogOpened(value)}
          header={<h3 className="m-0">Assign Todo</h3>}
          footer={
            <div className="flex gap-m w-full">
              <TextField
                className="mr-auto"
                placeholder="Filter"
                value={filter}
                onValueChanged={({ detail: { value } }) => setFilter(value)}
              ></TextField>
              <Button onClick={() => setDialogOpened(false)}>Cancel</Button>
            </div>
          }
        >
          <Grid
            style={{ minWidth: '900px' }}
            selectedItems={assigned}
            onActiveItemChanged={({ detail: { value } }) => assignTodo(value)}
            dataProvider={dataProvider}
          >
            <GridColumn
              header="Name"
              renderer={({ item }) => <span>{item.firstName.toUpperCase() + ' ' + item.lastName}</span>}
            ></GridColumn>
            <GridColumn path="email"></GridColumn>
            <GridColumn path="date"></GridColumn>
          </Grid>
        </Dialog>
        <div className="flex">
          <Button onClick={() => setDialogOpened(!dialogOpened)}>
            {assigned.length > 0 ? assigned[0].firstName + ' ' + assigned[0].lastName : 'Assign'}
          </Button>
          <Button className="ml-auto" theme="primary" disabled={formik.isSubmitting} onClick={formik.submitForm}>
            Add
          </Button>
        </div>
      </div>
      <div className="m-m shadow-s p-s">
        <div className="grid grid-cols-5 gap-s">
          <span>Done</span>
          <span>Task</span>
          <span>Description</span>
          <span>Assigned</span>
          <span className="text-right">Priority</span>
          <hr className="col-span-5"></hr>
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onChangeStatus={(todo, value) => changeStatus(todo, value)}></TodoItem>
          ))}
        </div>
        <Button theme="error" className="mt-m" disabled={noDone()} onClick={remove}>
          Remove<Tooltip position="end-bottom" slot="tooltip" text="Remove todos that are done"></Tooltip>
        </Button>
      </div>
    </>
  );
}

type TodoProps = {
  todo: Todo;
  onChangeStatus: (todo: Todo, value: boolean | undefined) => void;
};

export function TodoItem({ todo, onChangeStatus }: TodoProps): JSX.Element {
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
