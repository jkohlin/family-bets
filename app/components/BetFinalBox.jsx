import { Label, Table } from 'semantic-ui-react'
import { useHasMounted } from '~/utils/utils'


const BetFinalBox = ({ finalBet, title }) => {
    const mounted = useHasMounted()
    if (!mounted) {
        return null
    }
    const titleMap = {
        LAST_16: 'Åttondelsfinal',
        QUARTER_FINALS: 'Kvartsfinal',
        SEMI_FINALS: 'Semifinal',
        FINAL: 'Final',
        WINNER: 'Vinnare',
        THIRD_PLACE: 'Bronsplatsen',
        TOP_SCORER: 'Målskytt',
    }
    return (
        <Table.Row>
            <Table.Cell colSpan={4}>
                <div className=''>
                    <h3 className='text-xl mb-2'>{titleMap[title]}</h3>
                    <div>
                        {finalBet.teams.map
                            ? finalBet.teams.map((team) => (
                                <Label size='small' color='black' key={team}>{team}</Label>
                            ))
                            : <span>vad? {typeof finalBet}</span>}
                    </div>
                </div>
            </Table.Cell>
            <Table.Cell className='!text-center'>
                {finalBet.score}
            </Table.Cell>
        </Table.Row>
    )
}

export default BetFinalBox

/**
 Select
    option: {
        clearValue: () => void,
        getStyles: (string, any) => {},
        getValue: () => ValueType,
        hasValue: boolean,
        isMulti: boolean,
        options: OptionsType,
        selectOption: OptionType => void,
        selectProps: any,
        setValue: (ValueType, ActionTypes) => void,
        emotion: any,
        cx: (any, any) => string,   
        defaultInputValue: string,
        defaultValue
        onChange: // passed as the second argument to `onChange` type ActionTypes = | 'clear' | 'create-option' | 'deselect-option' | 'pop-value' | 'remove-value' | 'select-option' | 'set-value'
    }
 */