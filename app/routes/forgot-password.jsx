import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData, useSearchParams } from '@remix-run/react'
import { useEffect } from 'react'
import { supabase } from '~/models/supabase.client' // funkar inte att nå anonkey från client

import { validateEmail } from '~/utils'

export const action = async ({ request }) => {
    const formData = await request.formData()
    const email = formData.get('email')
    if (validateEmail(email)) {
        const { data, error } = await supabase.auth.api.resetPasswordForEmail(
            email,
            {
                redirectTo: formData.get('redirectTo'),
            }
        )
        console.log('data', data)
        return { data, error, supabase }
    }
    return { error: 'Felaktig e-postadress' }
    //const redirectTo = formData.get('redirectTo')
}
export default function ForgotPassword() {
    const data = useActionData()
    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event == 'PASSWORD_RECOVERY') {
                const newPassword = prompt('What would you like your new password to be?')
                const { data, error } = await supabase.auth
                    .updateUser({ password: newPassword })

                if (data) alert('Password updated successfully!')
                if (error) alert('There was an error updating your password.')
            }
        })
    }, [])
    if (data?.error) {
        return <div>{data?.error}</div>
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 -mt-56 px-14 text-center">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-6xl font-bold">
                    Glömt lösenord?
                </h1>
                <Form className="space-y-6" method="post" noValidate>
                    <div>
                        <label className="text-sm font-medium" htmlFor="email">
                            <span className="block text-gray-100">Epost</span>
                            {data?.error ? <span className="block text-pink-500">{data?.error}</span> : null}
                        </label>
                        <input type="hidden" name="redirectTo" value="http://localhost:3000/password-reset" />
                        <input
                            className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-gray-700"
                            type="email"
                            name="email"
                            id="email"
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