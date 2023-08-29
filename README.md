[![Netlify Status](https://api.netlify.com/api/v1/badges/101397de-a069-4b09-8e45-18d1e8d2a2b4/deploy-status)](https://app.netlify.com/sites/kohlin/deploys)

#vmtipset
# poäng 

| poäng | kategori      | maxpoäng |
| ----- | ------------- | -------- |
| 3     | rätt lag      | 144      |
| 4     | rätt resultat | 192      |
| 16x6p | 8-del         | 96       |
| 8x11p | kvartsfinal   | 88       |
| 4x15p | semifinal     | 60       |
| 2x18p | final         | 36       |
| 26    | vinnare       | 26       |
| 15    | brons         | 15       |
| 15    | skytte        | 15       |
|       |    Summa      |      672 |



##  TODO:  

- [x] byt ut de sista matcherna mot att tippa vilka lag som kommer att vinna etc
  - [x] ta bort finalmatcherna när vi hämtar matcher (SQL)
  - [x] hitta en lösning att spara dem från formuläret

- [x] fixa till user bets
- [ ] Byta lösenord
- [x] Räkna ut poäng 
- [x] Strypa tillgången till databasen med requireUserId
- [x] Alltid kolla användaren innan vi gör anrop till supabase
- [x] Hantera fel i DB-anrop med catchboundary
- [ ] FUTURE:  Bets borde vara key-value typ 
  key='gruppspel' value="{matchId, home, away}" men kan också vara 
  key='16del' value=[123,543,45,567]
- [ ] final_bet: Vinnare, bronsmedalj och målkung rättas inte automatiskt


# Notifications
Manuellt:
```
curl \
  -H "Title: Grattis Argentina" \
  -H "Priority: urgent" \
  -H "Tags: soccer," \
  -d "Tack alla som spelat. Slutresultat: 1. Johan 2. Cardigan Daffipuff 3. Jörgen" \
  ntfy.sh/youbet2022
```

# Cron

Schedule:
```
select
  cron.schedule(
    'get-football-scores',
    '*/2 * * * *',
    $$
    select *
  from
  http_get('https://kohlin.info/cron');
    $$
  );
```

Unschedule:
```
SELECT cron.unschedule('get-football-scores');
```








# Remix K-pop Stack

## Development

- Install all dependencies & the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

  ```sh
  npm install
  npm install netlify-cli -g
  ```

- Create or connect to your Netlify project by running through the Netlify `init` script:

  ```sh
  netlify init
  ```

- Add your Supabase and session environment variables to a `.env` file like [`.env.sample`](./.env.sample) file or through the Netlify project dashboard at [https://app.netlify.com/](https://app.netlify.com/) Site settings/Build & deploy/Environment:

  ```
  SUPABASE_URL=""
  SUPABASE_ANON_KEY=""
  SESSION_SECRET=""
  ```

> There is more information about the Supabase variables [in the Database section below](#database). The initial `create-remix` command will [create the `SESSION_SECRET` variable](https://github.com/netlify-templates/kpop-stack/blob/fd68e4de2f4034328481c9b26fa67e298ef20204/remix.init/index.js#L47) which is a random string of 16 characters, so feel free to just set a random 16 chars if not running `remix-create`.

  <details>
  <summary>Environment Variable list in project dashboard.</summary>

![screenshot of env vars in Netlify UI](https://res.cloudinary.com/dzkoxrsdj/image/upload/v1649265873/CleanShot_2022-04-06_at_13.23.38_2x_sh3hoy.jpg)

  </details>

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

### Running Locally

The Remix dev server starts your app in development mode, rebuilding assets on file changes. To start the Remix dev server:

```sh
npm run dev
```

The Netlify CLI builds a production version of your Remix App Server and splits it into Netlify Functions that run locally. This includes any custom Netlify functions you've developed. The Netlify CLI runs all of this in its development mode.

It will pull in all the [environment variables](https://docs.netlify.com/configure-builds/environment-variables/#declare-variables) of your Netlify project. You can learn more about this project's Supabase environment variables in [the Database section below](#database).

To start the Netlify development environment:

```sh
netlify dev
```

With Netlify Dev you can also:

- test functions
- test redirects
- share a live session via url with `netlify dev --live`
- [and more](https://cli.netlify.com/netlify-dev/) :)

Note: When running the Netlify CLI, file changes will rebuild assets, but you will not see the changes to the page you are on unless you do a browser refresh of the page. Due to how the Netlify CLI builds the Remix App Server, it does not support hot module reloading.

You can add your environment variables to an `.env` file (like shown in the sample [`.env.sample`](./.env.sample)) which will not be committed publicly because it is added to the `.gitignore` file. Or you can add it to your Netlify project environment variables (Site settings/Build & deploy/Environment) as shown in the [Development section](#development) so that they can be [easily shared with teammates](https://www.netlify.com/blog/2021/12/09/use-access-and-share-environment-variables-on-netlify).

<details>
<summary>SQL Queries</summary>

- In your Supabase project dashboard, you can find the SQL Editor here

  ![CleanShot 2022-03-31 at 11 57 16](https://user-images.githubusercontent.com/8431042/161098529-9f6fc807-a413-49af-bfc1-1c16a2c4ae2f.png)

- Select "New Query"

  ![CleanShot 2022-03-31 at 11 59 29](https://user-images.githubusercontent.com/8431042/161098865-7c790cbc-db76-45b3-aa75-270af70038ae.png)

- Here are the SQL queries used in the K-pop Stack

  ```sql
  -- Create public profile table that references our auth.user
  create table public.profiles (
    id uuid references auth.users not null,
    created_at timestamptz not null default current_timestamp,
    email varchar not null,
  
    primary key (id)
  );
  
  -- Create public notes table
  create table public.notes (
    id uuid not null default uuid_generate_v4(),
    title text,
    body text,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    profile_id uuid references public.profiles not null,
  
    primary key (id)
  );
  
  -- inserts a row into public.users
  create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer set search_path = public
  as $$
  begin
    insert into public.profiles (id, email)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
    return new;
  end;
  $$;


  -- trigger the function every time a user is created
  drop trigger if exists on_auth_user_created on auth.user;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
  ```

- You can copy these over to the SQL Editor and click the 'Run' button

  ![CleanShot 2022-03-31 at 12 04 31](https://user-images.githubusercontent.com/8431042/161099881-79315a5f-af33-44fc-aee4-daf9a506f23f.png)

- Lastly, you will need to go to 'Authentication and Settings', and switch off "Enable email confirmations" for the project

  ![CleanShot 2022-03-31 at 12 07 47](https://user-images.githubusercontent.com/8431042/161100637-11b7a1f0-9e25-4f1b-8fec-46ebaf047063.png)

</details>

---

## Deployment

This stack has the Netlify [configuration file (netlify.toml)](./netlify.toml) that contains all the information needed to deploy your project to Netlify's [edge nodes](https://www.netlify.com/products/edge).

Want to deploy immediately? Click this button

[![Deploy to Netlify Button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/netlify-templates/nextjs-toolbox)

Clicking this button will start the setup for a new project and deployment.

### Deploy from the Command Line

Clone this repo with the `git clone` command. Then install the [Netlify CLI](https://docs.netlify.com/cli/get-started/) tool and run `netlify init`.

```sh
git clone https://github.com/netlify-templates/kpop-stack

npm install netlify-cli -g # to install the Netlify CLI tool globally

netlify init # initialize a new Netlify project & deploy
  ```

### CI/CD

Using the 'Deploy to Netlify' button or the `init` process will also set up continuous deployment for your project so that a new build will be triggered & deployed when you push code to the repo (you can change this from your project dashboard: Site Settings/Build & deploy/Continuous Deployment).

You can also use `netlify deploy` or `netlify deploy --prod` to manually deploy then `netlify open` to open your project dashboard.

> 💡 If you don't use `--prod` on the deploy command you will deploy a preview of your application with a link to share with teammates to see the site deployed without deploying to production

---

## Testing

### Cypress

We have set up the basic configuration files for [Cypress](https://go.cypress.io/) End-to-End tests in this project. You'll find those in the `cypress` directory. As you make changes, add to an existing file or create a new file in the `cypress/integrations` directory to test your changes.

We use [`@testing-library/cypress`](https://testing-library.com/cypress) for selecting elements on the page semantically.

To run these tests in development, run `npm run e2e-test` which will start the dev server for the app as well as the Cypress client.

To other example of Cypress tests specifically on Remix stacks, check out the `cypress` directory in the [Remix Grunge Stack example](https://github.com/remix-run/grunge-stack/tree/main/cypress).

#### Netlify Plugin Cypress

We also use [`netlify-plugin-cypress`](https://github.com/cypress-io/netlify-plugin-cypress) to validate our template is working properly. When you deploy this project as is, cypress tests run automatically on a successful build. If you're interested in removing this functionality you will need to go into the `netlify.toml` and remove the plugins section:

```diff
[[headers]]
  for = "/build/*"
  [headers.values]
    "Cache-Control" = "public, max-age=31536000, s-maxage=31536000"

- [[plugins]]
-  package = "netlify-plugin-cypress"
-  [plugins.inputs]
-    record = true
-    group = "Testing Built Site"
```

You will also need to remove the plugin from the dependencies: `npm uninstall -D netlify-plugin-cypress`

