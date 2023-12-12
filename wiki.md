<header align="center" data-title="">

# Awesome Lists Wiki

</header>

---

## Scripts

> Run the following command to interact with the awesome lists CLI:

```bash
pnpm run awesome
```

or

```bash
pnpm start
```

> Each list in the `lists` directory has a markdown file and a corresponding `hbs.json` file.
> Both of these files can be used in keeping the contents of the list up to date.

### `hbs.json`

> The `hbs.json` file is automatically generated when you create a new list.
> It contains certain key data that is parsed from the corresponding markdown file.

Heres an example of what one looks like:

```json
{
  "$schema": "../../scripts/data/schema/list-schema.json",
  "title": "Front-End",
  "fileName": "front-end",
  "description": "A list of awesome front-end tools",
  "date": "2023-12-12T23:08:11.022Z",
  "categories": []
}
```

### Creating a New List

> To make a new list with the title and markdown file alread set up, choose the
> `> Create New List` option from the `awesome` script menu:

```bash
pnpm run awesome

? What would you like to do? (Use arrow keys)
> Create a new list  <--
  🍿
```

### Editing a List

> To edit a list, its recommended to start the development server first by doing one of the following:

```bash
pnpm run dev
```

or, from the CLI menu:

```bash
pnpm run awesome

? What would you like to do? (Use arrow keys)
> Start Development Server
  🍿
```

> Once the development server is running, you can edit the markdown file and the changes will be reflected in the corresponding `hbs.json` file and vice versa.

### Main README.md file

> The main `README.md` file is automatically updated when you create a new list, or you make a commit to the git repository.
> You can also update it manually by running the following command:

```bash
pnpm run update-main
```

or, from the CLI menu:

```bash
pnpm run awesome

? What would you like to do? (Use arrow keys)
> Update Main README.md
  🍿
```
