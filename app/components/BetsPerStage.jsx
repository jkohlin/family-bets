import { useLoaderData } from '@remix-run/react'
import { Container, Label } from 'semantic-ui-react'
import { groupBy } from '~/utils/utils'

export default function BetsPerStage() {
    const { betsPerStage } = useLoaderData()
    const bets = groupBy(betsPerStage.bets, 'key')
    return (
        <Container className='w-full'>
            {Object.keys(bets).map((key) => {
                return (
                    <div key={key} className='grid gap-4 grid-cols-3'>
                        <h3 className='col-span-3'>{key}</h3>
                        {bets[key].map((bet) => {
                            return (
                                <div key={bet.id}>
                                    <p className='mb-1'>{bet.profile.name}</p>
                                    <div className='mb-3'>
                                        {bet.value.map((team) => {
                                            return (
                                                <Label size='small' color='black' key={team}>
                                                    {betsPerStage.teams[team].name}
                                                </Label>
                                            )
                                        })
                                        }
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </Container>
    )
}