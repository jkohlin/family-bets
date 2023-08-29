import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useCatch, useSearchParams } from '@remix-run/react'
import { createUserSession, getUserId } from '~/session.server'
import { createUser, getProfileByEmail } from '~/models/user.server'
import { validateEmail } from '~/utils'
import * as React from 'react'

export const meta = () => {
    return {
        title: 'Sign Up',
    }
}

export async function loader({ request }) {
    const userId = await getUserId(request)
    if (userId) return redirect('/')
    return json({})
}

export const action = async ({ request }) => {
    const formData = await request.formData()
    let secret = formData.get('secret')
    if (secret === 'Kålpudding43') {

        const email = formData.get('email')
        const password = formData.get('password')
        const name = formData.get('name')
        const redirectTo = formData.get('redirectTo')

        // Ensure the email is valid
        if (!validateEmail(email)) {
            return json({ errors: { email: 'Inte en giltig e-postadress' } }, { status: 400 })
        }

        // What if a user sends us a password through other means than our form?
        if (typeof password !== 'string') {
            return json(
                { errors: { password: 'Du måste ange ett giltigt lösenord' } },
                { status: 400 }
            )
        }

        // Enforce minimum password length
        if (password.length < 6) {
            return json(
                { errors: { password: 'Lösenordet är för kort.' } },
                { status: 400 }
            )
        }

        // A user could potentially already exist within our system
        // and we should communicate that well
        const existingUser = await getProfileByEmail(email)
        if (existingUser) {
            return json(
                { errors: { email: 'Det finns redan en användare med denna e-postadress.' } },
                { status: 400 }
            )
        }

        const user = await createUser(email, password, name)

        return createUserSession({
            request,
            userId: user.id,
            remember: false,
            redirectTo: typeof redirectTo === 'string' ? redirectTo : '/',
        })
    } else {
        throw new Response(
            'Du måste ange den hemliga koden',
            { status: 400 }
        )
    }
}
export default function Join() {
    const [searchParams] = useSearchParams()
    const redirectTo = searchParams.get('redirectTo') ?? undefined

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
                <Form className="space-y-6" method="post" noValidate>
                    <div>
                        <label className="text-sm font-medium" htmlFor="name">
                            <span className="block text-gray-100">Namn</span>
                        </label>
                        <input
                            className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-gray-700"
                            type="text"
                            name="name"
                            id="name"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium" htmlFor="email">
                            <span className="block text-gray-100">Epost</span>
                            {actionData?.errors?.email && (
                                <span className="block pt-1 text-pink-500 pb-1" id="email-error">
                                    {actionData?.errors?.email}
                                </span>
                            )}
                        </label>
                        <input
                            className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-gray-700"
                            type="email"
                            name="email"
                            id="email"
                            required
                            aria-invalid={actionData?.errors?.email ? true : undefined}
                            aria-describedby="email-error"
                            ref={emailRef}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium" htmlFor="password">
                            <span className="block text-gray-100">Lösenord</span>
                            <span className="block font-light text-gray-700">
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
                            className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-gray-700"
                            autoComplete="new-password"
                            aria-invalid={actionData?.errors?.password ? true : undefined}
                            aria-describedby="password-error"
                            ref={passwordRef}
                        />
                    </div>
                    <div>
                        <label htmlFor="secret" className='text-sm font-medium'><span className='block text-pink-300'>Hemlig kod från inbjudan</span></label>
                        <input type="password" name="secret" id="secret" className='w-full rounded border border-pink-500 bg-pink-100 px-2 py-1 text-lg text-pink-700 focus:outline-pink-500' />
                    </div>
                    <button
                        className="w-full rounded bg-green-500  py-2 px-4 text-white hover:bg-green-600 focus:bg-green-400"
                        type="submit"
                    >
                        Skapa konto
                    </button>
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <div className="flex items-center justify-center">
                        <div className="text-center text-sm text-gray-100">
                            Har du redan ett konto?{' '}
                            <Link
                                className="text-blue-500 underline"
                                to={{
                                    pathname: '/login',
                                    search: searchParams.toString(),
                                }}
                            >
                                Logga in
                            </Link>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/*      Om man inte angett rättt lösenord
/* -------------------------------------------------------------------------- */
export function CatchBoundary() {
    const caught = useCatch()
    return (
        <div className='h-screen flex flex-col items-center justify-center'>
            <h1 className='text-2xl'>Hoppla!</h1>
            <p>{caught.data}</p>
        </div>
    )
}
