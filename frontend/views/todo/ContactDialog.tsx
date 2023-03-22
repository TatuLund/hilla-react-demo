import { Grid } from '@hilla/react-components/Grid.js';
import { GridDataProviderCallback, GridDataProviderParams } from '@vaadin/grid';
import { GridColumn } from '@hilla/react-components/GridColumn.js';
import Contact from 'Frontend/generated/com/example/application/Contact';
import { Dialog } from '@hilla/react-components/Dialog.js';
import { ContactEndpoint } from 'Frontend/generated/endpoints';
import { TextField } from '@hilla/react-components/TextField.js';
import { Button } from '@hilla/react-components/Button.js';
import { useState } from 'react';

type Props = {
    opened: boolean;
    onAssignContact: (contact: Contact | undefined) => void;
};

async function dataProvider(params: GridDataProviderParams<Contact>, callback: GridDataProviderCallback<Contact>) {
    const filter = '';
    const page = await ContactEndpoint.getPage(params.page, params.pageSize, filter);
    if (page) {
      callback(page.content, page.size);
    }
  }

export function ContactDialog({ opened, onAssignContact }: Props): JSX.Element {
  const [dialogOpened, setDialogOpened] = useState(true);
  const [assigned, setAssigned] = useState<Contact[]>([]);
  const [filter, setFilter] = useState('');

  function assignTodo(value: Contact | null | undefined) {
    if (value) {
      onAssignContact(value);
      setAssigned(value ? [value] : []);
    //   setDialogOpened(false);
    }
  }

  return (
    <>
      <Dialog
        opened={dialogOpened && opened}
        onOpenedChanged={({ detail: { value } }) => setDialogOpened(value)}
        header={<h3 className="m-0">Assign Todo</h3>}
        footer={
          <div className="flex gap-m w-full">
            <TextField
              hidden
              className="mr-auto"
              placeholder="Filter"
              value={filter}
              onValueChanged={({ detail: { value } }) => setFilter(value)}
            ></TextField>
            <Button onClick={() => setDialogOpened(false)}>Close</Button>
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
    </>
  );
}
