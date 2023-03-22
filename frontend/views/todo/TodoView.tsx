import type Todo from 'Frontend/generated/com/example/application/Todo';
import type Contact from 'Frontend/generated/com/example/application/Contact';
import { useEffect, useState } from 'react';
import { FormikErrors, useFormik } from 'formik';
import { TodoEndpoint } from 'Frontend/generated/endpoints';
import { EndpointValidationError } from '@hilla/frontend';
import { FormLayout } from '@hilla/react-components/FormLayout.js';
import { ComboBox } from '@hilla/react-components/ComboBox.js';
import { TextField } from '@hilla/react-components/TextField.js';
import { IntegerField } from '@hilla/react-components/IntegerField.js';
import { Button } from '@hilla/react-components/Button.js';
import { DatePicker } from '@hilla/react-components/DatePicker.js';
import { Tooltip } from '@hilla/react-components/Tooltip.js';
import { TodoGrid } from './TodoGrid';
import { ContactDialog } from './ContactDialog';

export default function TodoView(): JSX.Element {
  const empty: Todo = { task: '', done: false };
  const [dialogOpened, setDialogOpened] = useState(false);
  const [assigned, setAssigned] = useState<Contact>();
  const [todos, setTodos] = useState(Array<Todo>());
  const presets = ['Make food', 'Clean the house', 'Do the groceries', 'Mow the lawn', 'Walk the dog'];

  const formik = useFormik({
    initialValues: empty,
    onSubmit: async (value: Todo, { setSubmitting, setErrors }) => {
      try {
        const saved = (await TodoEndpoint.save(value)) ?? value;
        setTodos([...todos, saved]);
        formik.resetForm();
        setAssigned(undefined);
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

  function assignTodo(value: Contact | null | undefined) {
    if (value) {
      formik.values.assigned = value;
      setAssigned(value);
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
        <ContactDialog opened={dialogOpened} onAssignContact={assignTodo}></ContactDialog>
        <div className="flex">
          <Button onClick={() => setDialogOpened(!dialogOpened)}>
            {assigned ? assigned.firstName + ' ' + assigned.lastName : 'Assign'}
          </Button>
          <Button className="ml-auto" theme="primary" disabled={formik.isSubmitting} onClick={formik.submitForm}>
            Add
          </Button>
        </div>
      </div>
      <div className="m-m shadow-s p-s">
        <TodoGrid todos={todos} onChangeStatus={(todo, value) => changeStatus(todo, value)}></TodoGrid>
        <Button theme="error" className="mt-m" disabled={noDone()} onClick={remove}>
          Remove<Tooltip position="end-bottom" slot="tooltip" text="Remove todos that are done"></Tooltip>
        </Button>
      </div>
    </>
  );
}

