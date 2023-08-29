import { useLoaderData, Outlet, useSubmit, useCatch } from '@remix-run/react'
import { useState } from 'react'
import Select from 'react-select'
import { Container, Form, Grid } from 'semantic-ui-react'
import { supabase } from '~/models/user.server'
import { requireUserId } from '~/session.server'
import { useHasMounted } from '~/utils/utils'


/* -------------------------------------------------------------------------- */
/*                   LOADER
/* -------------------------------------------------------------------------- */
export async function loader({ params, request }) {
    await requireUserId(request) // går till login om ingen användare
    const userId = params.bets

    // userId ??= params?.bets
    //hämta profiles
    try {
        const { data, error } = await supabase.from('profiles').select('id, name')
        if (error) throw new Error(error.message)
        const userOptions = data.map(({ id, name }) => ({ value: id, label: name }))
        return { userId, userOptions }
    } catch (error) {
        throw new Error(error, { status: 500 })

    }
    // hämta senaste bets
}

export default function User() {

    const { userId, userOptions } = useLoaderData()
    const [user, setCurrentUser] = useState(userId)
    const submit = useSubmit()
    const setUser = (selection) => {
        //setCurrentUser(`/user/${selection.value}`)
        submit(null, { method: 'get', action: `/user/${selection.value}` })
    }

    const mounted = useHasMounted()
    if (!mounted) {
        return null
    }
    return (
        <Container className='pt-3'>
            <Form action={user ?? '.'} className="h-12">
                <Grid >
                    <Select
                        name={setCurrentUser?.label || ''}
                        options={userOptions}
                        className='basic-multi-select text-gray-700'
                        classNamePrefix="user-select"
                        onChange={setUser}
                        closeMenuOnSelect={true}
                        placeholder='Välj en användare'
                        defaultValue={userOptions.find(({ value }) => value === userId)}
                        isSearchable={true}
                    />
                </Grid>
            </Form>
            <Outlet />

        </Container >
    )
}

export function CatchBoundary() {
    const caught = useCatch()
    return (
        <div className='h-screen flex items-center justify-center'>
            <h1>Catch</h1>
            <p>{JSON.stringify(caught)}</p>
        </div>
    )
}
export function ErrorBoundary(error) {
    return (
        <main>
            <div >Det bidde fel</div>
            <p>{error}</p>
        </main>
    )
}