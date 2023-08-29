import React from 'react'

import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import { verifyLogin } from '~/models/user.server'
import { createUserSession, getUserId } from '~/session.server'
import { validateEmail } from '~/utils'

export const meta = () => {
  return {
    title: 'Login',
  }
}

export async function loader({ request }) {
  const userId = await getUserId(request)
  if (userId) return redirect('/')
  return json({})
}

export const action = async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const redirectTo = formData.get('redirectTo')
  const remember = formData.get('remember')

  if (!validateEmail(email)) {
    return json({ errors: { email: 'Inte en giltig e-postadress' } }, { status: 400 })
  }

  if (typeof password !== 'string') {
    return json(
      { errors: { password: 'Du måste ange ett giltigt lösenord.' } },
      { status: 400 }
    )
  }

  if (password.length < 6) {
    return json(
      { errors: { password: 'Lösenordet är för kort' } },
      { status: 400 }
    )
  }

  const user = await verifyLogin(email, password)

  if (!user) {
    return json(
      { errors: { email: 'E-post eller lösenord är fel' } },
      { status: 400 }
    )
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === 'on' ? true : false,
    redirectTo: typeof redirectTo === 'string' ? redirectTo : '/',
  })
}

export default function Login() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'

  const actionData = useActionData()
  const emailRef = React.useRef(null)
  const passwordRef = React.useRef(null)

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef?.current?.focus()
    }

    if (actionData?.errors?.password) {
      passwordRef?.current?.focus()
    }
  }, [actionData])

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6" noValidate>
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              <span className="block text-zinc-50">Epost</span>
              {actionData?.errors?.email && (
                <span className="block pt-1 text-pink-500 pb-1" id="email-error">
                  {actionData?.errors?.email}
                </span>
              )}
            </label>
            <input
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-gray-900"
              autoComplete="email"
              type="email"
              name="email"
              id="email"
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby="email-error"
              ref={emailRef}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="password">
              <span className="block text-zinc-50">Lösenord</span>
              <span className="block font-light text-zinc-90">
                Minst 6 tecken.
              </span>
              {actionData?.errors?.password && (
                <span className="pt-1 text-pink-500 pb-1" id="password-error">
                  {actionData?.errors?.password}
                </span>
              )}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete=""
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-gray-700"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
              ref={passwordRef}
            />
          </div>
          <button
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            type="submit"
          >
            Logga in
          </button>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="remember"
                name="remember"
                type="checkbox"
              />

              <label
                className="ml-2 block text-sm text-gray-100"
                htmlFor="remember"
              >
                Kom ihåg mig
              </label>
            </div>
            <div className="text-center text-sm text-gray-100">
              Inget konto?{' '}
              <Link
                className="text-blue-500 underline"
                to={{ pathname: '/join' }}
              >
                Registrera dig
              </Link>
              {/* <p>
                Glömt lösenordet?
                <Link to={{ pathname: '/forgot-password' }}>Återställ</Link>
              </p> */}
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
