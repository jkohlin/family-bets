import { Card } from 'semantic-ui-react'
import { niceDate } from '~/utils/utils'

export default function NextMatch(props) {
    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>Nästa match</Card.Header>
                <Card.Meta>
                    <p className='date'>{niceDate({
                        date: props.next?.date,
                        format: 'short'
                    })}</p>
                    <p className='teams'>{props.next?.home} – {props.next?.away}</p>

                </Card.Meta>
            </Card.Content>
        </Card>)
}