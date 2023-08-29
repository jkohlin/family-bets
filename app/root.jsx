import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'

import tailwindStylesheetUrl from './styles/tailwind.css'
import myStyles from './styles/styles.css'
//import styles from 'semantic-ui-css/semantic.min.css' Nåt med att ikonerna inte funkar
import { getUser } from './session.server'
import { getProfileByEmail, supabase } from './models/user.server'
import { Button, Container, Dropdown, Image, Menu, Icon } from 'semantic-ui-react'
import logo from './assets/youbet_logo.svg'
import { useOptionalUser } from './utils'
import useMediaQuery from './utils/responsive'
import { getNextMatch } from './models/football.server'

export const meta = () => {
  return {
    charset: 'utf-8',
    title: 'VM-tipset 2022',
    viewport: 'width=device-width,initial-scale=1,maximum-scale=1'
  }
}

export const links = () => {
  return [
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    //{ rel: 'stylesheet', href: styles },
    { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.5.0/semantic.min.css' },
    { rel: 'stylesheet', href: myStyles },
  ]
}

export async function loader({ request }) {
  try {
    const { data: [contest], error } = await supabase
      .from('contest')
      .select('*')
    if (error?.code) {
      throw new Error(error.message)
    }
    const nextMatch = await getNextMatch()
    const user = await getUser(request)
    const profile = await getProfileByEmail(user?.email)
    return user ? { contest, user, profile, nextMatch } : { contest, nextMatch }

  } catch (error) {
    throw new Response(error, { status: 500 })
  }
}


export default function App() {
  const { contest, user, profile } = useLoaderData()
  const mobile = useMediaQuery('(max-width: 542px)')

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Menu inverted className="bg-gray-600 w-full" >
          <Container>
            <Menu.Item as={Link} to="/" header className='flex justify-between'>
              <Image size='mini' src={logo} style={{ marginRight: '1.5em' }} />
              <span>{contest?.name} {contest?.year}</span>
            </Menu.Item>

            {user ? (
              <Dropdown item simple text='Meny' closeOnBlur={true} closeOnChange={true}>
                <Dropdown.Menu direction='left' >
                  <Dropdown.Item as={Link} to="/bets">Mina bets</Dropdown.Item>
                  <Dropdown.Item as={Link} to={`/user/${user?.id}`}>Andras bets</Dropdown.Item>
                  {profile?.email === 'johan@kohlin.net' && (<>
                    <Dropdown.Divider />
                    <Dropdown.Header>Administration</Dropdown.Header>
                    <Dropdown.Item as={Link} to="/update" >Uppdatera</Dropdown.Item>
                  </>)}
                  <Dropdown.Divider className='!m-0' />
                  <Dropdown.Item>
                    <Form method="post" action="/logout" ><Button type="submit" content='Logga ut' basic color='pink' /></Form>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : null}
            {(!mobile && !user) ? (
              <Menu.Menu position='right'>
                <Menu.Item>
                  <Button.Group>
                    <Button as={Link} to="/login">Logga in</Button>
                    <Button.Or as={Icon} name="user circle" className='login-or' />
                    <Button as={Link} to="/join" positive>Registrera dig</Button>
                  </Button.Group>
                </Menu.Item>
              </Menu.Menu>
            ) : null}
          </Container>
        </Menu>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary({ error }) {
  let user = useOptionalUser()
  if (user) {
    user = ' - Hittat av ' + user?.profile?.name || 'anonym'
  }
  console.log(error)
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Menu inverted className="bg-gray-600 w-full" >
          <Container>
            <Menu.Item as={Link} to="/" header className='flex justify-between'>
              <Image size='mini' src={logo} style={{ marginRight: '1.5em' }} />
            </Menu.Item>

            <Dropdown item simple text='Meny'>
              <Dropdown.Menu direction='left'>
                <Dropdown.Item as={Link} to="/bets">Mina bets</Dropdown.Item>
                <Dropdown.Item as={Link} to="/user">user</Dropdown.Item>
                <Dropdown.Item>Leaderboard</Dropdown.Item>
                <Dropdown.Item>Matcher</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Header>Administration</Dropdown.Header>
                <Dropdown.Item as={Link} to="/update" >Uppdatera</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Container>
        </Menu>
        {/* add the UI you want your users to see */}
        <Container>
          <h1>Attans rabarber!</h1>
          <p>Det blev fel. Det är inte ditt fel, det är vårt. Vi ska fixa det.</p>
          <h2>Felet:</h2>
          <pre className='text-xs mb-6'>{error.stack}</pre>
          <a href={`sms:+46704672915?&body=${encodeURI('Detta fel dök upp på VM-Tipset: ' + error.stack + ' - Hittat av ' + user)}`}>Skicka detta fel som ett sms till Johan</a>
        </Container>
        <Scripts />
      </body>
    </html>
  )
}