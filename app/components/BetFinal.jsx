import { useState } from 'react'
import Select from 'react-select'
import { Container, Item } from 'semantic-ui-react'
import { useHasMounted, translateList } from '~/utils/utils'


const BetFinal = ({ count, options, bets, title, keys, emitChange }) => {
    // options: [ { value: 8601, label: 'Netherlands' }, { value: 8602, label: 'Sweden' } ]
    // bets: {value: [ 764, 781 ],id: 1,user_id: '0a8bf37d-e093-4541-ba7d-403c2801b0d2',title: 'LAST_16'}
    const [numSelected, setSelected] = useState({ count: (bets?.value?.length || 0), className: (bets?.value?.length || 0) !== count ? 'text-red-600' : 'text-green-600' })
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
    // if selected elements are less than count, set className to 'error'
    const handleChange = (selected) => {
        setSelected({ count: selected?.length || 0, className: (selected?.length || 0) !== count ? 'text-red-600' : 'text-green-600' })
        emitChange()
    }
    const myBets = bets?.value?.map((bet) => ({
        value: bet,
        label: options.find((option) => option.value == bet).label
    })) || []
    return (
        <Container className='pb-4'>
            <Item className=''>
                <Item.Header className='text-xl mb-2'>{titleMap[title]}</Item.Header>
                <Item.Meta className={`${numSelected.className} mb-2`}>{numSelected.count} av {count} lag valda</Item.Meta>
                <Item.Content>
                    <Select
                        instanceId={keys[0]}
                        inputId={keys[1]}
                        defaultValue={myBets}
                        isMulti
                        name={title}
                        options={translateList(options)}
                        className='basic-multi-select text-gray-700'
                        classNamePrefix="react-select"
                        onChange={handleChange}
                        closeMenuOnSelect={false}
                    />
                </Item.Content>
            </Item>
        </Container>
    )
}

export default BetFinal

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