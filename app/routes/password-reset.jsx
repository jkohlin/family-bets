import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData, useSearchParams } from '@remix-run/react'
import { supabase } from '~/models/user.server'

import { validateEmail } from '~/utils'

/**
 * await supabase.auth.resetPasswordForEmail(
  'sample@email.com',
  redirectTo: kIsWeb ? null : 'io.supabase.flutter://reset-callback/',
);
 */
export const loader = async ({ request }) => {
    console.log('request', request)
    return json({ request })
}
export const action = async ({ request }) => {
    const formData = await request.formData()
    const password = formData.get('password')
    // const { error } = await supabase.auth.api.updateUser(accessToken, {
    //     password: password,
    //   });
}
export default function PasswordReset() {
    const data = useLoaderData()
    console.log('data', data)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 -mt-56 px-14 text-center">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-6xl font-bold">
                    Glömt lösenord?
                </h1>
                <Form className="space-y-6" method="post" noValidate>
                    <div>
                        <label className="text-sm font-medium" htmlFor="password">
                            <span className="block text-gray-100">Epost</span>
                        </label>
                        <input
                            className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-gray-700"
                            type="password"
                            name="password"
                            id="password"
                            required
                        />
                    </div>
                    <div>
                        <button
                            className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-gray-700"
                            type="submit"
                        >
                            Återställ lösenord
                        </button>
                    </div>
                </Form>
            </main>
        </div>
    )
}